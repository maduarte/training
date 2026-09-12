# Garmin → Gist sync (diario, local, gratis)

Trae tus actividades de Garmin Connect una vez al día y las deja en un Gist
propio, separado del Gist de sync manual de la app. La app (fase siguiente)
lo lee en modo solo-lectura para mostrar HR, mapa y splits.

No requiere suscripción de Strava, ni backend, ni CORS — corre en tu Mac.

## 1. Reautenticar el CLI de Garmin (el token guardado expiró)

```bash
garmin-connect auth login
```

Te va a pedir email/password (y MFA si lo tienes activado). Verifica con:

```bash
garmin-connect auth status
```

## 2. Crear un GitHub Personal Access Token para el Gist

En GitHub → Settings → Developer settings → Personal access tokens:
- Classic token con scope **`gist`**, o
- Fine-grained token con permiso **Gists: Read and write**.

Este token es solo para este script — no lo pongas en el repo.

## 3. Crear el archivo de config

```bash
mkdir -p ~/.config/ncs-garmin-sync
cat > ~/.config/ncs-garmin-sync/config.json <<'EOF'
{
  "github_token": "TU_TOKEN_AQUI",
  "gist_id": ""
}
EOF
chmod 600 ~/.config/ncs-garmin-sync/config.json
```

Deja `gist_id` vacío la primera vez — el script crea el Gist y guarda el ID
automáticamente.

## 4. Probar manualmente antes de automatizar

```bash
cd garmin-sync
python3 sync_garmin.py
```

Los nombres de campo en `activity_summary()` ya están validados contra una
respuesta real de `garmin-connect activities list` (incluye HR, cadencia,
desnivel, zonas de HR y distancia/duración).

### Tramos para el gráfico de ritmo (`laps`)

Cada actividad con GPS reciente lleva además un arreglo `laps` que alimenta el
gráfico de barras del detalle. Cada tramo es
`{n, km, s, p, hr, z}` — número, distancia, duración, ritmo en seg/km, pulso
medio y zona de pulso (0-4).

`lapsSource` dice de dónde salieron:

- `"laps"`: vueltas que marcó el reloj. Es lo que pasa en las sesiones de
  intervalos, donde cada vuelta es un bloque de trabajo o recuperación.
- `"km"`: la actividad quedó como una sola vuelta (el caso de los rodajes), así
  que los tramos se cortan cada 1000 m sobre el stream de distancia. El último
  trozo entra solo si mide 200 m o más; si no, su ritmo es ruido.

La zona (`z`) no viene de Garmin: el resumen trae cuánto tiempo se estuvo en cada
zona, pero no en qué pulsación empieza cada una. `derive_hr_zone_bounds()` ordena
las muestras de pulso por valor y corta donde el tiempo acumulado alcanza el de
cada zona, recuperando los límites que reproducen ese mismo reparto. Se calcula
por actividad, así que los colores del gráfico siempre cuadran con el dónut de
esa actividad.

## 5. Instalar el launchd agent (correr 1x/día automáticamente)

**Importante:** `launchd` corre como daemon en background, sin sesión de
usuario, y macOS (TCC/privacidad) le niega el acceso a rutas dentro de
`~/Library/CloudStorage/Dropbox/...` con `Operation not permitted` — aunque
el mismo script funcione perfecto corrido a mano en una terminal (que sí
tiene esos permisos heredados). Por eso `launchd` debe apuntar a una copia
del script **fuera de Dropbox**:

```bash
mkdir -p ~/.local/share/ncs-garmin-sync
cp sync_garmin.py ~/.local/share/ncs-garmin-sync/sync_garmin.py
cp com.ncs.garminsync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ncs.garminsync.plist
```

**Cada vez que edites `garmin-sync/sync_garmin.py` en el repo**, hay que
volver a copiarlo a `~/.local/share/ncs-garmin-sync/` para que el cambio
se refleje en la corrida automática (el repo es la fuente, esa carpeta es
el "deploy" local). El `config.json` en `~/.config/ncs-garmin-sync/` no
tiene este problema porque no está en Dropbox.

Verificar que está cargado: `launchctl list | grep ncs.garminsync`

Para revisar logs: `cat /tmp/ncs-garmin-sync.log`

Para desinstalar: `launchctl unload ~/Library/LaunchAgents/com.ncs.garminsync.plist`

Para forzar una corrida manual sin esperar a las 11:00:
`launchctl start com.ncs.garminsync` (revisa el log después)

## Notas

- Si el Mac está apagado/dormido a la hora programada, ese día se puede
  saltear — el script es idempotente (relee `lastSynced` del propio Gist),
  así que el siguiente run que corra recupera lo que faltó, sin duplicar.
- El Gist se crea como **privado** (`public: false`).
- Este Gist es de solo-caché: no lo edites a mano, el script lo sobreescribe.
