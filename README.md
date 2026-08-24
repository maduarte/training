# Nadie Corre Solo ⛰

App de entrenamiento para trail running. PWA mobile-first deployada en Vercel con backend serverless para generación de planes con IA.

---

## Qué hace

Gestiona un calendario de entrenamiento personalizado para preparar carreras de trail running. El plan cubre el ciclo completo: base → desarrollo → pico → taper → carrera → recuperación.

**Calendario semanal**
- Tarjetas por día con tipo de entrenamiento (SUAVE / MEDIO / INTENSO / FUERZA / DESCANSO)
- Navegación entre semanas con swipe o flechas
- Swap de entrenamientos entre días con long-press
- Registro de entrenamiento real (distancia + tiempo)
- Reacciones con emoji (😊 / 😐 / 😞)
- Editor de entrenamientos planificados (tipo, nombre, km, ejercicios)
- Indicador de overrides (entrenamiento editado vs. planificado original)
- Duración estimada de cada sesión basada en el perfil de ritmos

**Analíticas**
- Km planificados vs. ejecutados por semana
- Tiempo total semanal
- Gráficos de barras y líneas con Chart.js

**Multi-carrera**
- Perfil único de atleta con múltiples carreras en secuencia
- Wizard de 3 pasos para agregar nuevas carreras (arma un esqueleto editable, sin IA)
- Eliminar carreras con todos sus datos asociados

**Sincronización**
- Copia de seguridad automática en la nube (backend propio, sin tokens)
- Indicador de estado en el botón ⚙️ del header (dirty / synced / error)

---

## Arquitectura

### Estructura de archivos

```
training/
├── index.html            # HTML + modales de la app
├── sw.js                 # Service Worker (PWA, cache v5 — offline completo)
├── vercel.json           # Configuración de Vercel (rewrites + headers)
├── core/
│   ├── app.js            # Toda la lógica de la app (~1240 líneas)
│   └── storage.js        # Helpers de storage, constantes TYPE y PHASE_C
├── data/
│   ├── races.js          # Datos de carreras, buildWeeks(), helpers multi-carrera
│   └── exercises.js      # Biblioteca de ejercicios con descripciones (~28 ejercicios)
├── ui/
│   └── styles.css        # Todos los estilos (~345 líneas)
├── api/
│   └── sync.js           # Vercel Serverless Function — copia de seguridad (Upstash)
└── assets/
    └── icon_base64.txt   # Ícono PWA en base64
```

El código está separado en módulos cargados desde `index.html`. No hay build process ni bundler.

### Storage (localStorage)

| Clave | Contenido |
|---|---|
| `tw_profile` | Nombre, avatar, paces del atleta |
| `tw_races` | Array de todas las carreras con sus semanas planificadas |
| `tw_weeks_<raceId>` | Semanas con overrides aplicados |
| `tw_logs_<raceId>` | Registros de entrenamientos ejecutados |
| `tw_rxn_<raceId>` | Reacciones emoji por entrenamiento |
| `tw_overrides_<raceId>` | Cambios al plan original |
| `tw_paces_<raceId>` | Ritmo fácil y rápido en segundos/km |
| `tw_title_<raceId>` | Título editable del header |
| `tw_last_rid` | Última carrera activa (para auto-launch) |
| `tw_last_aid` | Último atleta activo |
| `tw_migrated` | Flag de migración de schema antiguo |
| `tw_sync_code` | Código de sync (credencial de la copia en la nube) |
| `tw_sync_mtimes` | Marca de tiempo por clave, para el merge |
| `tw_sync_ts` | Fecha de la última copia |

### Flujo de datos de carreras

```
tw_races (localStorage)
  └── array de objetos carrera
        ├── id, name, date, distance, elevation, defaultTitle
        └── weeks[] → días → entrenamientos planificados

tw_weeks_<raceId>  ← overrides aplicados sobre weeks[]
tw_logs_<raceId>   ← datos de ejecución real
tw_rxn_<raceId>    ← reacciones
tw_overrides_<raceId> ← registro de qué fue editado
```

`getAllRaces()` lee exclusivamente desde `tw_races`. Todas las carreras son equivalentes — la carrera semilla (Torrencial 44k) se siembra desde `buildWeeks()` en la primera carga.

---

## Onboarding y primera vez

Al abrir la app sin datos, se lanza el wizard de onboarding:

1. **Tu perfil** — nombre + avatar (grid de emojis)
2. **La carrera** — nombre, distancia, desnivel, fecha
3. **Tu nivel** — ritmos (fácil/intenso), distancias referenciales, fecha de inicio, días de entrenamiento semanales, opción de fines de semana alternados
4. **Creando la estructura…** — `buildPlanSkeleton()` arma las semanas en local → guarda → lanza la app

Para usuarios existentes (con `tw_last_rid` guardado), la app lanza directamente a la última carrera activa.

Para testear el onboarding desde cero:
```javascript
localStorage.clear(); location.reload();
```

---

## Wizard de nueva carrera

El step 3 incluye un selector de días de entrenamiento semanal:
- Se eligen los días disponibles (grilla de Lun–Dom)
- Opción de fines de semana alternados: cuando está activo, un sábado está disponible y el siguiente no (el largo semanal se mueve al viernes)
- El prompt enviado a Claude incluye la estructura semanal elegida y genera el plan respetando esos días

---

## Perfil de ritmos

Al lanzar una carrera por primera vez (sin ritmos configurados):
- Aparece un banner y se abre automáticamente el modal de ritmos (700ms de delay)
- El usuario ingresa su ritmo suave (min:seg/km) y ritmo rápido
- Las tarjetas del calendario muestran la duración estimada de cada sesión
- Feature flag `PACES_AUTO_UPDATE` en `core/app.js` (actualmente `false`): cuando se active, cada registro real actualizará automáticamente el perfil de ritmos

---

## Migración automática

`migrateStorage()` se ejecuta en cada carga y:

1. **Primera vez** (`tw_migrated` ausente): migra claves del schema antiguo (`tw_*_mauro_torrencial44k` → `tw_*_torrencial44k`)
2. **Siempre**: siembra `torrencial44k` en `tw_races` desde `buildWeeks()` si no existe aún
3. Setea `tw_last_rid` si estaba vacío

Una vez ejecutado el paso 1, marca `tw_migrated = true` y no vuelve a correr esa parte.

---

## Tipos de entrenamiento

| Tipo | Color | Tracking |
|---|---|---|
| SUAVE | Verde `#52c9a0` | Distancia + tiempo estimado |
| MEDIO | Amarillo `#f5b731` | Distancia + tiempo estimado |
| INTENSO | Rojo `#f4634a` | Distancia + tiempo estimado |
| FUERZA | Azul `#7b9cf5` | Series + tarjetas de ejercicios |
| DESCANSO | Gris | Sin tracking |

---

## Fases del plan

`BASE` → `DESARROLLO` → `PEAK` → `TAPER` → `CARRERA` → `RECUPERACIÓN`

El banner "¿Ya tienes tu próxima carrera?" aparece automáticamente en semanas de fase CARRERA o RECUPERACIÓN.

---

## Creación de planes

Dos caminos, ninguno usa IA dentro de la app:

**1. Esqueleto del wizard** — `buildPlanSkeleton()` en `core/app.js` arma las semanas en el
browser a partir de la fecha de carrera, los días disponibles y las distancias de referencia:
fechas y etiquetas reales, un tipo por día (el largo cierra la semana), rampa de volumen con
descarga cada 4 semanas, taper y día de carrera. Es un punto de partida para editar, no un
plan de entrenador.

**2. Importar un Excel** — Ajustes → Importar. Sirve para planes hechos a mano o generados
por una IA fuera de la app. El formato es el mismo que produce Exportar (ver más abajo).

---

## Formato del Excel

Ajustes → **Exportar** produce un `.xlsx` con dos hojas. **Importar** las busca por nombre,
así que el orden no importa, pero los nombres de hoja y de columna sí.

### Hoja `Plan` — una fila por día

| Columna | Contenido |
|---|---|
| `Semana` | Número de semana. Al cambiar de valor empieza una semana nueva |
| `Fase` | Texto libre (`BASE`, `DESARROLLO`, `PICO`, `TAPER`, `CARRERA`…). Define el color |
| `Km_Semana` | Total planificado de la semana |
| `Fecha` | `YYYY-MM-DD` |
| `Día` | Etiqueta visible, p. ej. `Sáb 22 Ago` |
| `Tipo` | `SUAVE` · `MEDIO` · `INTENSO` · `FUERZA` · `DESCANSO` — cualquier otro valor rompe los colores |
| `Km_Plan` | Distancia planificada. `0` en FUERZA y DESCANSO |
| `Series` | Solo FUERZA: número de series |
| `Sesión` | Título de la tarjeta |
| `Descripción` | Texto largo. Admite saltos de línea |
| `Ejercicios` | Solo FUERZA: `Nombre reps; Nombre reps` separados por `;` |
| `Km_Real` | Distancia ejecutada (opcional) |
| `Tiempo_Real` | `hh:mm:ss` (opcional) |
| `Reacción` | 😊 · 😐 · 😞 (opcional) |

Los nombres de `Ejercicios` que coinciden con las claves de `data/exercises.js` muestran su
descripción al tocarlos; el resto se muestran sin ficha.

### Hoja `Carrera` — una sola fila de datos

| `Nombre` | `Fecha` | `Distancia_km` | `Desnivel_m` |
|---|---|---|---|

Importar **siempre crea una carrera nueva** (`import_<timestamp>`), nunca pisa una existente.

---

## Service Worker y modo offline

La app funciona completamente sin conexión tras la primera visita con red. El SW (`sw.js`, cache `ncs-trail-v5`) pre-cachea en la instalación todos los recursos necesarios:

```
./              ./index.html         ./core/app.js
./core/storage.js    ./data/exercises.js  ./data/races.js
./ui/styles.css      Chart.js (CDN)
```

Estrategias de caché por tipo de recurso:

| Recurso | Estrategia | Offline |
|---|---|---|
| Archivos locales + Chart.js | Cache First + update en background | ✅ |
| `fonts.googleapis.com` (CSS) | Network First → fallback caché | ✅ tras primera visita |
| `fonts.gstatic.com` (fuentes) | Cache First permanente | ✅ tras primera visita |
| `api.github.com` / `/api/*` | Network Only + 503 graceful | ❌ requiere red |

Las funciones que requieren red (copia en la nube, generación de planes) devuelven un error claro sin romper la app.

---

## Copia de seguridad en la nube

Endpoint propio (`api/sync.js`) sobre Redis de Upstash. No hay token de GitHub en el browser.

1. Primer dispositivo: ⚙️ → Sync → **Crear código**. Se genera una credencial de 32 hex y se sube todo lo que haya.
2. Dispositivos siguientes: ⚙️ → Sync → pegar ese código → **Vincular**. La nube reemplaza lo local.
3. A partir de ahí es automático: sube ~2,5 s después de cada cambio y al cerrar la app; baja al abrirla.

El merge es last-write-wins **por clave** (`tw_sync_mtimes`), así que dos dispositivos que
tocaron cosas distintas no se pisan. La excepción es **Vincular**, donde el remoto gana en todo.

El código de sync es la credencial: quien lo tiene, ve los datos. No hay otra capa de auth.

El indicador de estado en ⚙️:
- Sin borde → sync no configurado
- Verde → sincronizado
- Punto amarillo → hay cambios sin subir

---

## Desarrollo local

**Solo assets estáticos** (SW + offline funcionan, API no):
```bash
npx serve .
# → http://localhost:3000
```

**Stack completo** (incluye `/api/sync`):
```bash
npm install -g vercel
vercel env pull .env.local   # trae las credenciales de Upstash
vercel dev
# → http://localhost:3000
```

Para testear el modo offline: DevTools → Network → **Offline** → recargar. La app debe cargar completa desde caché. Si el SW anterior sigue activo: Application → Service Workers → **Skip waiting**.

---

## Deployment

La app está deployada en **Vercel** (no GitHub Pages) porque requiere el serverless function de la API.

```bash
# Deploy automático al pushear a main
git add .
git commit -m "update"
git push origin main
```

Variables de entorno requeridas en Vercel:
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — copia de seguridad
  (la integración de Upstash en el Marketplace de Vercel las inyecta sola;
  también se aceptan los nombres antiguos `KV_REST_API_URL` / `KV_REST_API_TOKEN`)

No hay build step, no hay node_modules en el frontend, no hay bundler.

---

## Dependencias externas

- [Chart.js 4.4.0](https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js) — gráficos
- [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — tipografía
- Upstash Redis (REST) — copia de seguridad, vía `api/sync.js`
- GitHub Gist API — solo lectura del Gist de Garmin
