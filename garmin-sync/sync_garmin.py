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
        if summary["garminActivityId"] is not None:
            by_id[summary["garminActivityId"]] = summary

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
        f"Total en caché: {len(payload['activities'])}."
    )


if __name__ == "__main__":
    main()
