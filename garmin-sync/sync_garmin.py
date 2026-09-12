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
import time
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
# launchd dispara el job cuando el Mac despierta, a menudo antes de que la red
# esté lista: el primer intento moría con un URLError de DNS y no se reintentaba
# hasta el día siguiente. Espera creciente: 20+40+60+80+100 = 5 min como máximo.
NET_RETRIES = 6
NET_BACKOFF_SEC = 20
ROUTE_TYPES = {"running", "trail_running"}
ROUTE_BACKFILL_DAYS = 30  # solo trae ruta GPS (para el mapa) de actividades recientes
ROUTE_MAX_POINTS = 150
LAP_MIN_DISTANCE_M = 50  # un lap más corto que esto es ruido (pausa, arranque), no un tramo


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
    ultimo = None
    for intento in range(NET_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return json.loads(res.read())
        except urllib.error.HTTPError as e:
            # Error de la API (401, 404, 422…), no de red: reintentar no ayuda.
            # HTTPError hereda de URLError, así que este except va primero.
            sys.exit(f"GitHub API error {e.code}: {e.read().decode()}")
        except urllib.error.URLError as e:
            ultimo = e
            if intento < NET_RETRIES - 1:
                espera = NET_BACKOFF_SEC * (intento + 1)
                print(f"Red no disponible ({e.reason}). Reintento en {espera}s…", flush=True)
                time.sleep(espera)
    sys.exit(f"Sin red tras {NET_RETRIES} intentos: {ultimo}")


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


def weight_hr_samples(series):
    """(bpm, t) -> (bpm, segundos que duró esa muestra). El stream no viene a
    cadencia fija, así que cada muestra pesa lo que dura hasta la siguiente."""
    out = []
    for i, (bpm, t) in enumerate(series):
        dt = (series[i + 1][1] - t) if i + 1 < len(series) else 0
        if dt > 0:
            out.append((bpm, dt))
    return out


def derive_hr_zone_bounds(samples, zones_sec):
    """Límites de zona en bpm, deducidos de la propia actividad.

    Garmin manda cuánto tiempo se estuvo en cada zona (hrTimeInZone_*) pero no
    en qué pulsación empieza cada una. Ordenando las muestras por bpm y cortando
    donde el tiempo acumulado alcanza el de cada zona se recuperan los límites
    que reproducen ese mismo reparto, sin pedirle al usuario que los configure.
    Así el color de cada punto del gráfico cuadra con el dónut de esa actividad."""
    if not samples:
        return None
    z = [zones_sec.get(k) or 0 for k in ("z1", "z2", "z3", "z4", "z5")]
    total_z = sum(z)
    total_t = sum(w for _, w in samples)
    if total_z <= 0 or total_t <= 0:
        return None
    ordered = sorted(samples)
    bounds, target = [], 0.0
    for i in range(4):
        target += z[i]
        cut = target / total_z * total_t  # stream y resumen no suman exactamente igual
        acc, bound = 0.0, None
        for bpm, w in ordered:
            acc += w
            if acc >= cut:
                bound = bpm
                break
        bounds.append(bound if bound is not None else ordered[-1][0])
    return bounds


def hr_zone_index(bpm, bounds):
    """Índice 0-4 (z1-z5) del pulso dado. None si falta el pulso o los límites."""
    if not bpm or not bounds:
        return None
    for i, b in enumerate(bounds):
        if bpm < b:
            return i
    return 4


def km_splits(track):
    """Parte el recorrido en tramos de 1 km, para las actividades que el reloj
    grabó como una sola vuelta. track: (distancia_m, tiempo_s, bpm) en orden."""
    splits, km = [], 1
    prev_d = prev_t = 0.0
    hrs = []
    for dist, t, bpm in track:
        if bpm:
            hrs.append(bpm)
        while dist >= km * 1000:
            seg = round(t - prev_t)
            # Un corte de GPS puede saltar de 900 a 2100 m: el km intermedio sale
            # con duración 0 y su "ritmo" no significa nada. Se omite.
            if seg > 0:
                splits.append({
                    "n": km,
                    "km": 1.0,
                    "s": seg,
                    "hr": round(sum(hrs) / len(hrs)) if hrs else None,
                })
            prev_d, prev_t = km * 1000.0, t
            hrs, km = [], km + 1
    # El resto parcial solo entra si es lo bastante largo para que su ritmo
    # signifique algo; si no, un último tramo de 80 m dispara una barra absurda.
    rem = track[-1][0] - prev_d
    if rem >= 200:
        splits.append({
            "n": km,
            "km": round(rem / 1000, 2),
            "s": round(track[-1][1] - prev_t),
            "hr": round(sum(hrs) / len(hrs)) if hrs else None,
        })
    return splits


def fetch_laps(activity_id):
    """Vueltas marcadas por el reloj. Devuelve [] si la actividad es una sola
    vuelta (el caso de los rodajes): ahí el gráfico se arma por kilómetro."""
    data = run_cli("activities", "splits", str(activity_id))
    raw = data.get("lapDTOs") if isinstance(data, dict) else None
    if not raw or len(raw) < 2:
        return []
    laps = []
    for i, l in enumerate(raw):
        dist, dur = l.get("distance") or 0, l.get("duration") or 0
        if dist < LAP_MIN_DISTANCE_M or dur <= 0:
            continue
        laps.append({
            "n": l.get("lapIndex") or (i + 1),
            "km": round(dist / 1000, 2),
            "s": round(dur),
            "hr": round(l["averageHR"]) if l.get("averageHR") else None,
        })
    return laps if len(laps) >= 2 else []


def finish_laps(laps, bounds):
    """Completa cada tramo con ritmo (seg/km) y zona de pulso."""
    for l in laps:
        l["p"] = round(l["s"] / l["km"]) if l.get("km") and l.get("s") else None
        l["z"] = hr_zone_index(l.get("hr"), bounds)
    return laps


def fetch_activity_details(activity_id, total_duration_sec):
    """Un solo fetch pesado (>1MB, streams segundo a segundo) del que salen cuatro cosas:
    - ruta [lat,lon,elev] decimada a ROUTE_MAX_POINTS, para el mapa coloreado por desnivel.
    - ritmo ajustado por desnivel (GAP), calculado sobre el stream completo (sin decimar).
    - tramos de 1 km con ritmo y pulso medio, el respaldo del gráfico cuando el reloj
      no marcó vueltas.
    - muestras de pulso pesadas por tiempo, para deducir los límites de zona.
    Solo se llama para actividades nuevas/recientes con GPS (ver ROUTE_BACKFILL_DAYS) y
    el resultado se cachea en el Gist para no repetir la llamada."""
    details = run_cli("activities", "get", str(activity_id), "--details")
    if not details:
        return None
    descriptors = details.get("metricDescriptors", [])
    idx = {d["key"]: d["metricsIndex"] for d in descriptors}
    lat_i, lon_i = idx.get("directLatitude"), idx.get("directLongitude")
    elev_i, dist_i = idx.get("directElevation"), idx.get("sumDistance")
    hr_i, time_i = idx.get("directHeartRate"), idx.get("sumDuration")
    if lat_i is None or lon_i is None:
        return None

    def at(vals, i):
        return vals[i] if i is not None and i < len(vals) else None

    points = []     # [lat, lon, elev] para el mapa
    samples = []    # (distancia_m, elev_m) para el cálculo de GAP
    track = []      # (distancia_m, tiempo_s, bpm) para los tramos de 1 km
    hr_series = []  # (bpm, tiempo_s) para deducir los límites de zona
    for m in details.get("activityDetailMetrics", []):
        vals = m.get("metrics", [])
        lat, lon = at(vals, lat_i), at(vals, lon_i)
        elev, dist = at(vals, elev_i), at(vals, dist_i)
        bpm, t = at(vals, hr_i), at(vals, time_i)
        if lat is not None and lon is not None:
            points.append([round(lat, 5), round(lon, 5), round(elev, 1) if elev is not None else None])
        if elev is not None and dist is not None:
            samples.append((dist, elev))
        if dist is not None and t is not None:
            track.append((dist, t, bpm))
        if bpm and t is not None:
            hr_series.append((bpm, t))

    if not points:
        return None
    gap = estimate_gap_sec_per_km(samples, total_duration_sec) if samples else None
    splits = km_splits(track) if track else []
    if len(points) > ROUTE_MAX_POINTS:
        step = len(points) / ROUTE_MAX_POINTS
        points = [points[int(i * step)] for i in range(ROUTE_MAX_POINTS)]

    return {
        "route": points,
        "gap": gap,
        "kmSplits": splits,
        "hrSamples": weight_hr_samples(hr_series),
    }


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
            if "laps" in prev:
                summary["laps"] = prev["laps"]
                summary["lapsSource"] = prev.get("lapsSource")
            # si falta alguna key, summary queda sin ella: dispara un refetch único abajo
            # (caché escrita por una versión anterior, de antes de GAP o de los laps)
        by_id[aid] = summary

    route_cutoff = (datetime.now(timezone.utc) - timedelta(days=ROUTE_BACKFILL_DAYS)).date().isoformat()
    fetched_routes = 0
    fetched_laps = 0
    for summary in by_id.values():
        if summary.get("route") and "gapSecPerKm" in summary and "laps" in summary:
            continue
        if not summary.get("hasPolyline") or summary.get("type") not in ROUTE_TYPES:
            continue
        if (summary.get("date") or "") < route_cutoff:
            continue
        det = fetch_activity_details(summary["garminActivityId"], summary.get("durationSec"))
        if not det:
            continue
        summary["route"] = det["route"]
        summary["gapSecPerKm"] = det["gap"]
        fetched_routes += 1

        # Las vueltas del reloj mandan; si la actividad es una sola vuelta, el
        # gráfico se arma con los tramos de 1 km sacados del mismo stream.
        laps = fetch_laps(summary["garminActivityId"])
        source = "laps" if laps else "km"
        laps = laps or det["kmSplits"]
        bounds = derive_hr_zone_bounds(det["hrSamples"], summary.get("hrZonesSec") or {})
        summary["laps"] = finish_laps(laps, bounds)
        summary["lapsSource"] = source if summary["laps"] else None
        if summary["laps"]:
            fetched_laps += 1

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
        f"Rutas GPS nuevas: {fetched_routes}. Con tramos para el gráfico: {fetched_laps}. "
        f"Total en caché: {len(payload['activities'])}."
    )


if __name__ == "__main__":
    main()
