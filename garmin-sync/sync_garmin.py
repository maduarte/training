#!/usr/bin/env python3
"""Sincroniza actividades de Garmin Connect a un Gist de GitHub para que la
app NCS las lea (solo lectura, no toca el Gist de sync manual existente).

Pensado para correr una vez al día vía launchd. Es idempotente: en cada
corrida relee el `lastSynced` guardado en el propio Gist y solo pide a
Garmin lo nuevo desde ahí (con un margen de unos días por si un run
anterior falló o el Mac estuvo apagado/dormido).

Requiere:
  - CLI `garmin-connect` instalado y autenticado (`garmin-connect auth login`).
  - Config en ~/.config/ncs-garmin-sync/config.json (ver README.md).
"""
import json
import shutil
import subprocess
import sys
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path

CONFIG_PATH = Path.home() / ".config" / "ncs-garmin-sync" / "config.json"
# launchd corre con un PATH mínimo que no incluye ~/.local/bin, así que resolvemos
# la ruta absoluta explícitamente en vez de confiar en el PATH del entorno.
GARMIN_CLI = shutil.which("garmin-connect") or str(Path.home() / ".local" / "bin" / "garmin-connect")
LOOKBACK_BUFFER_DAYS = 3
GITHUB_API = "https://api.github.com"
ROUTE_TYPES = {"running", "trail_running"}
ROUTE_BACKFILL_DAYS = 30  # solo trae ruta GPS (para el mapa) de actividades recientes
ROUTE_MAX_POINTS = 150


def load_config():
    if not CONFIG_PATH.exists():
        sys.exit(f"Falta config en {CONFIG_PATH}. Ver garmin-sync/README.md.")
    return json.loads(CONFIG_PATH.read_text())


def save_config(cfg):
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(cfg, indent=2))


def github_request(method, path, token, body=None):
    req = urllib.request.Request(
        f"{GITHUB_API}{path}",
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        },
        data=json.dumps(body).encode() if body is not None else None,
    )
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"GitHub API error {e.code}: {e.read().decode()}")


def fetch_gist(gist_id, token):
    return github_request("GET", f"/gists/{gist_id}", token)


def write_gist(gist_id, token, filename, content, description):
    body = {"description": description, "files": {filename: {"content": content}}}
    if gist_id:
        return github_request("PATCH", f"/gists/{gist_id}", token, body)
    body["public"] = False
    return github_request("POST", "/gists", token, body)


def run_cli(*args):
    result = subprocess.run([GARMIN_CLI, *args], capture_output=True, text=True)
    if result.returncode == 2:
        sys.exit("Token de Garmin expirado. Corre: garmin-connect auth login")
    if result.returncode != 0:
        sys.exit(f"Error en garmin-connect {' '.join(args)}: {result.stderr}")
    return json.loads(result.stdout) if result.stdout.strip() else None


def activity_summary(a):
    # Validado contra una respuesta real de `garmin-connect activities list` (jul 2026).
    return {
        "garminActivityId": a.get("activityId"),
        "date": (a.get("startTimeLocal") or "")[:10],
        "startTimeLocal": a.get("startTimeLocal"),
        "type": (a.get("activityType") or {}).get("typeKey"),
        "name": a.get("activityName"),
        "locationName": a.get("locationName"),
        "distanceKm": round((a.get("distance") or 0) / 1000, 2),
        "durationSec": a.get("duration"),
        "avgHr": a.get("averageHR"),
        "maxHr": a.get("maxHR"),
        "avgCadenceSpm": a.get("averageRunningCadenceInStepsPerMinute"),
        "maxCadenceSpm": a.get("maxRunningCadenceInStepsPerMinute"),
        "elevGainM": a.get("elevationGain"),
        "elevLossM": a.get("elevationLoss"),
        "calories": a.get("calories"),
        "avgPaceSecPerKm": (
            round(1000 / a["averageSpeed"]) if a.get("averageSpeed") else None
        ),
        "hrZonesSec": {
            "z1": a.get("hrTimeInZone_1"),
            "z2": a.get("hrTimeInZone_2"),
            "z3": a.get("hrTimeInZone_3"),
            "z4": a.get("hrTimeInZone_4"),
            "z5": a.get("hrTimeInZone_5"),
        },
        "hasPolyline": a.get("hasPolyline", False),
        "startLat": a.get("startLatitude"),
        "startLon": a.get("startLongitude"),
    }


def minetti_cost_ratio(gradient):
    """Costo energético de correr en pendiente vs. plano (Minetti et al. 2002).
    gradient: fracción subida/distancia (0.1 = 10% de pendiente). Devuelve el
    multiplicador de costo respecto a correr en plano (1.0 = mismo costo)."""
    i = max(-0.45, min(0.45, gradient))  # el polinomio no es fiable fuera de ~±45%
    cost = 155.4*i**5 - 30.4*i**4 - 43.3*i**3 + 46.3*i**2 + 19.5*i + 3.6
    return cost / 3.6  # 3.6 J/kg/m es el costo de correr en plano


def estimate_gap_sec_per_km(samples, total_duration_sec, bucket_m=25):
    """Ritmo equivalente en plano (GAP), aproximado con el modelo de Minetti.
    samples: lista de (distancia_acumulada_m, elevación_m) en orden temporal.
    Agrupa en tramos de ~bucket_m para suavizar el ruido del altímetro antes
    de calcular la pendiente de cada tramo."""
    if len(samples) < 5 or not total_duration_sec:
        return None
    samples = sorted(samples, key=lambda p: p[0])
    buckets = [samples[0]]
    next_target = samples[0][0] + bucket_m
    for d, e in samples[1:]:
        if d >= next_target:
            buckets.append((d, e))
            next_target = d + bucket_m
    if buckets[-1][0] != samples[-1][0]:
        buckets.append(samples[-1])

    equiv_flat_m = 0.0
    for (d0, e0), (d1, e1) in zip(buckets, buckets[1:]):
        dd = d1 - d0
        if dd <= 0:
            continue
        equiv_flat_m += dd * minetti_cost_ratio((e1 - e0) / dd)
    if equiv_flat_m <= 0:
        return None
    return round(total_duration_sec / (equiv_flat_m / 1000))


def fetch_route_and_gap(activity_id, total_duration_sec):
    """Un solo fetch pesado (>2MB, streams segundo a segundo) para sacar dos cosas:
    - ruta [lat,lon,elev] decimada a ROUTE_MAX_POINTS, para el mapa coloreado por desnivel.
    - ritmo ajustado por desnivel (GAP), calculado sobre el stream completo (sin decimar).
    Solo se llama para actividades nuevas/recientes con GPS (ver ROUTE_BACKFILL_DAYS) y
    el resultado se cachea en el Gist para no repetir la llamada."""
    details = run_cli("activities", "get", str(activity_id), "--details")
    if not details:
        return None, None
    descriptors = details.get("metricDescriptors", [])
    idx = {d["key"]: d["metricsIndex"] for d in descriptors}
    lat_i, lon_i = idx.get("directLatitude"), idx.get("directLongitude")
    elev_i, dist_i = idx.get("directElevation"), idx.get("sumDistance")
    if lat_i is None or lon_i is None:
        return None, None

    points = []    # [lat, lon, elev] para el mapa
    samples = []   # (distancia_m, elev_m) para el cálculo de GAP
    for m in details.get("activityDetailMetrics", []):
        vals = m.get("metrics", [])
        lat = vals[lat_i] if lat_i < len(vals) else None
        lon = vals[lon_i] if lon_i < len(vals) else None
        elev = vals[elev_i] if elev_i is not None and elev_i < len(vals) else None
        dist = vals[dist_i] if dist_i is not None and dist_i < len(vals) else None
        if lat is not None and lon is not None:
            points.append([round(lat, 5), round(lon, 5), round(elev, 1) if elev is not None else None])
        if elev is not None and dist is not None:
            samples.append((dist, elev))

    if not points:
        return None, None
    if len(points) > ROUTE_MAX_POINTS:
        step = len(points) / ROUTE_MAX_POINTS
        points = [points[int(i * step)] for i in range(ROUTE_MAX_POINTS)]

    gap = estimate_gap_sec_per_km(samples, total_duration_sec) if samples else None
    return points, gap


def main():
    cfg = load_config()
    token = cfg["github_token"]
    gist_id = cfg.get("gist_id") or None
    filename = cfg.get("filename", "garmin-activities.json")

    existing = {}
    if gist_id:
        gist = fetch_gist(gist_id, token)
        raw = gist["files"].get(filename, {}).get("content")
        if raw:
            existing = json.loads(raw)

    last_synced = existing.get("lastSynced")
    if last_synced:
        after = (
            datetime.fromisoformat(last_synced) - timedelta(days=LOOKBACK_BUFFER_DAYS)
        ).date().isoformat()
    else:
        after = (datetime.now(timezone.utc) - timedelta(days=90)).date().isoformat()

    activities = run_cli("activities", "list", "--after", after, "--limit", "100") or []

    by_id = {a["garminActivityId"]: a for a in existing.get("activities", [])}
    for a in activities:
        summary = activity_summary(a)
        aid = summary["garminActivityId"]
        if aid is None:
            continue
        prev = by_id.get(aid)
        if prev and prev.get("route"):
            summary["route"] = prev["route"]  # no repetir el fetch pesado
            if "gapSecPerKm" in prev:
                # ya se intentó calcular GAP antes (puede ser None si no se pudo, no se reintenta)
                summary["gapSecPerKm"] = prev["gapSecPerKm"]
            # si no, summary queda sin la key: dispara un refetch único abajo (caché de antes de GAP)
        by_id[aid] = summary

    route_cutoff = (datetime.now(timezone.utc) - timedelta(days=ROUTE_BACKFILL_DAYS)).date().isoformat()
    fetched_routes = 0
    for summary in by_id.values():
        if summary.get("route") and "gapSecPerKm" in summary:
            continue
        if not summary.get("hasPolyline") or summary.get("type") not in ROUTE_TYPES:
            continue
        if (summary.get("date") or "") < route_cutoff:
            continue
        route, gap = fetch_route_and_gap(summary["garminActivityId"], summary.get("durationSec"))
        if route:
            summary["route"] = route
            summary["gapSecPerKm"] = gap
            fetched_routes += 1

    payload = {
        "lastSynced": datetime.now(timezone.utc).isoformat(),
        "activities": sorted(by_id.values(), key=lambda x: x.get("date") or ""),
    }

    result = write_gist(
        gist_id,
        token,
        filename,
        json.dumps(payload, indent=2, ensure_ascii=False),
        "NCS - caché de actividades Garmin (auto-generado, no editar a mano)",
    )
    if not gist_id:
        cfg["gist_id"] = result["id"]
        save_config(cfg)
        print(f"Gist creado: {result['html_url']}")

    print(
        f"Sincronizadas {len(activities)} actividades nuevas/actualizadas. "
        f"Rutas GPS nuevas: {fetched_routes}. Total en caché: {len(payload['activities'])}."
    )


if __name__ == "__main__":
    main()
