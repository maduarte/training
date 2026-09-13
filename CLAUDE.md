# CLAUDE.md — Nadie Corre Solo (NCS)

Archivo de contexto para traspaso a Claude Code. Lee esto completo antes de tocar cualquier archivo.

---

## Qué es esta app

PWA (Progressive Web App) para entrenamiento de trail running. El usuario principal es **Mauro** (cuenta GitHub `maduarte`, id 31446732, creada en 2017 — es la dueña de este repo), preparándose para el **Torrencial 44k** (junio 2026, ~19 semanas de plan). La app vive en **https://ncstraining.vercel.app/** (Vercel, deploy automático al pushear a `main`).
Hubo un deploy paralelo en GitHub Pages que se retiró: era estático, así que `/api/*` devolvía 405
y el `localStorage` quedaba en otro origen. Un solo origen, siempre.

La app es **multi-atleta**: en la pantalla inicial el usuario elige su perfil y carrera antes de entrar al calendario.

---

## Estructura de archivos

```
repo-root/
├── index.html          ← esqueleto HTML + <link> y <script> refs
├── sw.js               ← Service Worker (offline + estrategias de caché)
├── ui/
│   └── styles.css      ← todo el CSS
├── data/
│   ├── races.js        ← getAllRaces(), getActiveRaceId(), getRaceById()
│   └── exercises.js    ← objeto EX con ejercicios de fuerza
└── core/
    ├── storage.js      ← objeto S (localStorage wrapper), TYPE, PHASE_C, TODAY
    └── app.js          ← toda la lógica: launchApp(), renderCal(), sync, analytics, etc.
```

**Orden de carga de scripts** (index.html, respetar siempre):
```
exercises.js → storage.js → races.js → app.js
```

Testing local: `cd repo-root && python3 -m http.server 8080` (necesitas servidor, no `file://`)

---

## Estado actual — qué está hecho y qué está pendiente

### ✅ Hecho
- Modularización completa del monolito `index.html` → estructura de carpetas arriba
- Multi-atleta: selección de perfil y carrera en startup
- Calendario de entrenamiento (19 semanas, Torrencial 44k)
- Tipos de entrenamiento: SUAVE, MEDIO, INTENSO, FUERZA, DESCANSO
- Registro de workout: tiempo (hh:mm:ss) + cálculo de ritmo automático
- Emoji reactions por workout
- Swap de workouts con long-press
- Analytics: gráficos km planificados vs reales, tiempo semanal
- Fuerza: tarjetas individuales por ejercicio con descripción
- Copia de seguridad automática en la nube vía `api/sync.js` (Upstash Redis) — sin token de GitHub en el browser
- Onboarding wizard (pasos 1-3): crea nueva carrera preguntando nombre, fecha, distancia, desnivel, ritmos, disponibilidad semanal con variaciones fin de semana.
  Arma el plan con `buildPlanSkeleton()` **en local, sin IA** — un esqueleto editable, no un plan de entrenador.
- Import/export Excel: el otro camino para crear planes (incluidos los que genere una IA fuera de la app). Formato documentado en el README.
- PWA manifest con íconos (192 y 512px, base64 inline en app.js o index.html)

### Service Worker
Hecho. `sw.js` está en la raíz, se registra desde `core/app.js` con `'./sw.js'` y cachea así:
- `/api/*` y `api.github.com` → **Network Only** (sin red devuelven un 503 con mensaje legible)
- `fonts.googleapis.com` → Network First; `fonts.gstatic.com` → Cache First
- Todo lo demás (app shell + CDN) → Cache First con revalidación en background

**Sube `CACHE_NAME` en `sw.js` Y `APP_VERSION` en `core/app.js` — las dos, al mismo valor —
cada vez que cambies un archivo local.** Si no, los dispositivos con la PWA instalada siguen
sirviendo la versión anterior. `APP_VERSION` se muestra al pie de Ajustes: es la única forma
de saber desde fuera qué está corriendo un dispositivo.

Como el SW sirve cache-first, la carga que descubre una versión nueva **todavía muestra la
vieja**: el shell ya salió de caché antes de que el SW nuevo se instalara. Por eso `setupPWA()`
escucha `controllerchange` y recarga una vez cuando el SW nuevo toma el control, con dos
guardas: `hadController` (para no recargar en la primera visita, donde el evento también
dispara) y `recargando` (para cortar bucles).

### 🟡 Pendiente futuro
- `PACES_AUTO_UPDATE = false` en `core/app.js` — feature flag desactivado, retomar cuando se trabaje ritmos
- Multi-usuario real: hoy `api/sync.js` guarda un blob por código de sync, sin cuentas ni permisos
- **Clave de API de Anthropic**: vive en `localStorage['ncs_api_key']`, a propósito SIN el
  prefijo `tw_`. `syncCollect()` sube toda clave `tw_` que no sea `tw_sync_`, y una clave
  de API no debe viajar en el blob de sync ni compartirse entre dispositivos. No la
  renombres a `tw_*`. Hubo un proxy en `api/generate-plan.js` con una clave del servidor;
  se eliminó en sep-2026 porque era una URL pública que gastaba créditos del dueño del
  repo. Ahora la app llama a `api.anthropic.com` directo desde el navegador.
- `core/paces.js` separado cuando se retome lógica de ritmos

---

## Aislamiento entre usuarios

La app no tiene cuentas. El aislamiento sale de dos cosas:

- **`localStorage` es por navegador**: cada persona que abre la URL tiene sus propios datos.
- **El código de sync es la identidad**: una clave distinta en Redis por persona.

Tres cosas rompían esto y hay que no reintroducirlas:

1. **Planes escritos a mano en `data/races.js`** (Torrencial 44k, Putaendo 10k, Basal de Trail)
   más un `migrateStorage()` que los sembraba en todos los navegadores: un usuario nuevo
   entraba directo a un plan ajeno sin ver el onboarding. Ambos eliminados en ago-2026 — están
   en el historial de git y respaldados en Excel fuera del repo. El archivo solo conserva los
   helpers de lectura. **No vuelvas a poner el plan de nadie en el código**, ni siquiera
   nombres de carrera en comentarios: `races.js` se descarga en el navegador de todos.
2. **El gist de Garmin** estaba fijo en el código. Ahora es `tw_garmin_gist`, por usuario y
   vacío por defecto; sin él, `loadGarminCache()` retorna sin pedir nada.
3. **El perfil por defecto** era `{name:'Mauricio'}`. Ahora es `{name:'Atleta', avatar:'🏃'}`.

Nada de esto protege contra alguien que consiga un código de sync ajeno: quien lo tiene, ve
esos datos. Es el modelo aceptado para un grupo de conocidos, no para usuarios anónimos.

---

## Compromisos publicados — no son opcionales

`privacidad.html` está en línea desde el 12-sep-2026, servida desde este repo. Declara
dos cosas que el código **todavía no cumple**. Son exigibles:

1. **Desconectar la cuenta deportiva desde Ajustes borra el token del servidor y revoca
   el permiso.** Tiene que existir antes de que se conecte la primera persona que no
   sea Mauro.
2. **Al acompañante de IA NO se le envía la ruta GPS, ni el nombre, ni el código de
   sync.** Solo el plan y los entrenamientos de esa semana. Es una restricción de
   diseño, no una preferencia.

Si cambias lo que la app hace con datos de usuarios, `privacidad.html` se actualiza en
el mismo commit. Una política que promete lo que el código no hace es peor que no tenerla.

La página todavía no está enlazada desde ninguna parte de la app: existe en su URL
porque intervals.icu la exige, pero nadie la encontraría navegando. Falta el enlace
en Ajustes.

---

## Trampas de la API de intervals.icu — léelas antes de portar nada

Verificadas el 12-sep-2026 cruzando la respuesta de intervals.icu contra la de Garmin
para la misma actividad. Las tres fallan en silencio.

1. **`latlng` no viene en pares.** El stream trae `data` con las latitudes y `data2`
   con las longitudes, en arreglos paralelos. Tratarlo como `[[lat,lng],…]` no lanza
   error: dibuja cualquier cosa.

2. **El stream `time` es tiempo transcurrido, no en movimiento.** Misma trail: distancia
   idéntica (12.012,59 m) pero 4.677 s contra 4.577 s de Garmin. Esos 100 segundos son
   pausas. Calcular ritmo con `time` infla todos los ritmos.

3. **`icu_intervals` no son las vueltas del reloj**, es detección automática. En una
   sesión de intervalos acertó 17 de 17; en un rodaje devolvió una «RECOVERY» de 2
   segundos con distancia nula. Hay que descartar los degenerados y caer al reparto por
   km — la lógica ya existe en `garmin-sync/sync_garmin.py`.

**Y la que casi cuesta el proyecto:** intervals.icu **no entrega webhooks de actividad
para lo que llega reenviado desde Strava**. Garmin tiene que entrar directo. El campo
`icu_garmin_sync_activities` es solo una preferencia; el que no miente es
`icu_garmin_last_upload`.

Endpoints (el spec vive en `https://intervals.icu/api/v1/docs`, pedirlo con
`Accept: application/json` o devuelve la SPA):
`GET /api/v1/athlete/{id}/activities?oldest=` · `GET /api/v1/activity/{id}/intervals` ·
`GET /api/v1/activity/{id}/streams{ext}`

---

## Modelo de datos clave

### Carrera (dentro de `tw_races`)
```javascript
{
  id: 'race_1755900000000',   // 'import_<ts>' si vino de Excel
  name: 'Mi carrera',
  date: '2027-05-15',         // YYYY-MM-DD
  distance: 30,               // km — NO 'distanceKm'
  elevation: 900,             // m D+ — NO 'gainM'
  defaultTitle: '⛰ Mi carrera',
  status: 'upcoming',
  weeks: [ /* ver abajo */ ]
}
```

### Semana
```javascript
{ num: 1, dates: '1 Feb – 7 Feb', phase: 'BASE', totalKm: 25, days: [ /* 7 días */ ] }
```

### Día
```javascript
{
  id: 'w1d3',                 // clave con la que se indexan logs y reacciones
  date: '2027-02-04',
  label: 'Jue 4 Feb',
  session: 'Rodaje suave',    // título de la tarjeta
  type: 'SUAVE' | 'MEDIO' | 'INTENSO' | 'FUERZA' | 'DESCANSO',
  km: 10,                     // 0 en FUERZA y DESCANSO
  dplus: 650,                 // m D+ — OPCIONAL. Ausente ≠ 0: ver abajo
  desc: 'Texto largo.',
  sets: 3,                    // solo FUERZA
  exercises: [{name: 'Sentadilla', reps: '12'}]   // solo FUERZA
}
```

### Registro real — va aparte, en `tw_logs_<raceId>`, indexado por `day.id`
```javascript
{
  'w1d3': {
    th: 0, tm: 55, ts: 0,     // tiempo real (horas, minutos, segundos)
    distance: 10.2,
    time: '55:00',
    pace: '5:23/km',
    fromGarmin: true          // presente solo si lo autocompletó Garmin
  }
}
```
Las reacciones viven en `tw_rxn_<raceId>`, también indexadas por `day.id`.

**`dplus` ausente no es cero.** Es el desnivel, y su ausencia significa "no se
planificó", no "fue plano". Los planes anteriores a v26 no lo traen y deben
seguir viéndose igual que siempre: nada de D+ en pantalla. Por eso toda lectura
pasa por `dplusDe()` / `weekPlanDplus()` / `weekRealDplus()`, el Excel exporta
celda vacía y no `0`, y la UI de D+ se decide por separado para lo planificado
(`planTieneDplus()`) y lo real (que Garmin llena solo vía `elevGainM`).

Los ids de carrera se generan con `nuevoRaceId()`, que agrega un sufijo
aleatorio: `race_<ts>` a secas colisionaba entre dos carreras creadas en el mismo
milisegundo, y como las claves de storage cuelgan del id, las dos compartían
`tw_weeks_<id>` y `tw_logs_<id>`.

### Storage (`core/storage.js`)
- `S.get(key)` / `S.set(key, val)` / `S.del(key)` — wrapper de localStorage
- No hay namespacing real: `S` escribe la clave tal cual. El aislamiento por carrera
  sale del sufijo en el nombre (`tw_logs_<raceId>`), no del wrapper.
- Sync: código en `localStorage['tw_sync_code']` (32 hex, es la credencial), marcas por clave en `tw_sync_mtimes`
- **Nunca uses `localStorage.removeItem` sobre una clave `tw_` sincronizada.** `app.js`
  envuelve `S.set` y `S.del` para marcar la hora del cambio; un borrado sin marca deja
  la copia remota como "más nueva" y el siguiente `syncPull` la baja de vuelta. Las
  claves `tw_sync_*` están fuera del sync y sí pueden borrarse directo.

---

## Branding y UI

- **Colores**: fondo `#060e08` (negro verdoso), acento `#4caf50` (verde), error `#f4634a` (naranja-rojo)
- **Tipografía**: monoespaciada para datos, sans-serif para textos
- **Diseño**: mobile-first, orientación portrait
- **Íconos PWA**: runner entre árboles, fondo oscuro — están como base64 en el manifest setup dentro de `app.js`
- **Tabs**: Calendario | Analíticas | Nube (sync) — ancho igual con `flex:1 1 0!important`

---

## Flujos importantes

### Startup
`launchApp()` en `app.js` → muestra selector de atleta → selector de carrera → renderCal()

### Onboarding (carrera nueva)
Wizard de 3 pasos disparado cuando no hay carreras o usuario elige "nueva carrera":
1. Datos de carrera (nombre, fecha, distancia, desnivel)
2. Ritmos del atleta (pace SUAVE, MEDIO, INTENSO en min/km)
3. Disponibilidad semanal (días disponibles, variaciones fin de semana)

### Sync
`openSyncModal()` → `syncCreate()` en el primer dispositivo (genera código y sube) o
`syncLink()` en los demás (pega el código; el remoto reemplaza lo local).
Después es automático: `syncSchedulePush()` sube ~2,5 s tras cada `S.set`, `syncFlush()` al
ocultar la app, y `syncPull(true)` baja al arrancar. Merge last-write-wins **por clave**.

Ojo: el gist de Garmin es otro, de solo lectura, y alimenta el autocompletado de
entrenamientos. No tiene relación con la copia de seguridad. Su ID vive en
`tw_garmin_gist` (Ajustes → Actividades de Garmin), **por usuario**: estuvo fijo en el
código y eso hacía que cualquier visitante viera las actividades del dueño del repo.

**Nunca escribas un ID de gist en el repo.** Este repo es público y un gist "secreto"
lo lee cualquiera que sepa el ID — ahí van rutas GPS con la casa de alguien adentro.
Los IDs viven solo en `localStorage` (`tw_garmin_gist`) y en
`~/.config/ncs-garmin-sync/config.json`, fuera de git.

**El sync de Garmin es de un solo usuario: Mauro** — así funciona hoy, pero
**esa decisión se revirtió en sep-2026 y ahora sí es un pendiente**, con un plan de
migración a intervals.icu (webhooks, OAuth por atleta, sin Mac de por medio). Mientras
esa migración no ocurra, lo que sigue describe la realidad vigente y hay que respetarlo. Llenar el gist exige correr `sync_garmin.py` 1x/día en el Mac
propio (Python, CLI `garmin-connect` autenticado, token de GitHub con scope `gist`,
`launchd`), así que no es algo que otra persona pueda activar sola. Por eso:

- La ruta fija `/Users/mauro/...` en `com.ncs.garminsync.plist` **no es un bug**.
  No la "arregles" con `$HOME` ni escribas un instalador.
- No hay que construir el puente por Strava (`spike/strava-cors-test.html` quedó
  como experimento sin conclusión). Solo tendría sentido para habilitar a gente no
  técnica, y eso está descartado.
- El resto de la app **sí** es multi-atleta. Esto aplica únicamente a Garmin.

Historia, por si algo aparece: el gist nació bajo una segunda cuenta de GitHub,
`maduarte44`, creada por accidente en feb-2026 y separada de `maduarte` (no fue un
rename, coexistieron). Su token murió el 3-ago-2026 y dejó el sync caído 22 días
**en silencio** — la app seguía diciendo "Conectado" y sirviendo caché viejo; de ahí
el aviso de antigüedad en Ajustes. El gist se migró a `maduarte` y la cuenta
`maduarte44` se eliminó el 25-ago-2026, con su fork de este repo y un GitHub Pages
que seguía sirviendo una copia vieja de la app.

---

## Feature flags

```javascript
// core/app.js — top of file
const PACES_AUTO_UPDATE = false;   // desactivado — retomar en iteración futura
```

---

## El repo ncs-app

Existe `maduarte/ncs-app` (privado), creado el 12-sep-2026 como destino de la migración.
**No es producción y está desactualizado a propósito:** es un snapshot de v22, mientras
este repo va en v26. Vercel sigue desplegando desde `training`.

No trabajes ahí ni lo sincronices commit a commit — dos repos activos a la vez fue
exactamente lo que produjo la divergencia. Se sincroniza de una sola vez, el día que se
repunte Vercel. Hasta entonces, **este repo es la única fuente de verdad**.

---

## Comandos útiles

```bash
# Servidor local de desarrollo
python3 -m http.server 8080
# Luego abrir http://localhost:8080

# Ver estructura del proyecto
find . -not -path './.git/*' -type f | sort

# Subir cambios
git add -A && git commit -m "descripción" && git push
```

---

## Cómo continuar desde aquí

**Primera tarea**: implementar el `sw.js` offline.

1. El archivo `sw.js` ya fue diseñado en la sesión anterior — pedirle a Claude Code que lo regenere con el contexto de esta sección o usar el que está en la conversación previa.
2. Colocarlo en la **raíz** del repo.
3. Cambiar el registro en `core/app.js` (o `index.html`) según lo descrito arriba.
4. Hacer push y verificar en Chrome DevTools → Application → Service Workers que el SW se registra con scope `/`.
5. Probar offline: activar "Offline" en DevTools → Network y recargar.

