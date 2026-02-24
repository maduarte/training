# Nadie Corre Solo ⛰

App de entrenamiento para trail running. PWA mobile-first deployada en GitHub Pages como un único archivo HTML autocontenido.

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

**Analíticas**
- Km planificados vs. ejecutados por semana
- Tiempo total semanal
- Gráficos de barras y líneas con Chart.js

**Multi-carrera**
- Perfil único de atleta con múltiples carreras en secuencia
- Wizard de 3 pasos para agregar nuevas carreras (genera el plan con Claude API)
- Eliminar carreras con todos sus datos asociados

**Sincronización**
- Sync cross-device vía GitHub Gist (Personal Access Token)
- Indicador de estado en el botón ⚙️ del header (dirty / synced / error)

---

## Arquitectura

### Un solo archivo

Todo el código vive en `index.html`: HTML, CSS, JavaScript y datos embebidos. Sin build process, sin dependencias externas excepto Chart.js (CDN) y Google Fonts.

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
| `tw_migrated` | Flag de migración de schema antiguo |
| `tw_sync_pat` | GitHub Personal Access Token |
| `tw_sync_gist` | ID del Gist de sincronización |

### Flujo de datos de carreras

```
tw_races (localStorage)
  └── array de objetos carrera
        ├── id, name, date, distance, elevation
        └── weeks[] → días → entrenamientos planificados

tw_weeks_<raceId>  ← overrides aplicados sobre weeks[]
tw_logs_<raceId>   ← datos de ejecución real
tw_rxn_<raceId>    ← reacciones
tw_overrides_<raceId> ← registro de qué fue editado
```

Todas las carreras son equivalentes — no hay distinción entre la carrera inicial (Torrencial 44k) y las generadas por el wizard. `getAllRaces()` lee exclusivamente desde `tw_races`.

---

## Onboarding y primera vez

Al abrir la app sin datos, se lanza el wizard de onboarding:

1. **Tu perfil** — nombre + avatar (grid de emojis)
2. **La carrera** — nombre, distancia, desnivel, fecha
3. **Tu nivel** — ritmos (fácil/intenso), distancias referenciales, fecha de inicio del plan
4. **Generando...** — llama a Claude API → guarda todo → lanza la app

Para usuarios existentes (con `tw_migrated = true`), la app lanza directamente a la última carrera activa.

Para testear el onboarding desde cero:
```javascript
localStorage.clear(); location.reload();
```

---

## Migración automática

`migrateStorage()` se ejecuta una vez al abrir la app y:

1. Migra claves del schema antiguo (`tw_*_mauro_torrencial44k` → `tw_*_torrencial44k`)
2. Siembra `torrencial44k` en `tw_races` desde `buildWeeks()` si no existe aún
3. Setea `tw_last_rid` si estaba vacío

Una vez ejecutada, marca `tw_migrated = true` y no vuelve a correr.

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

`BASE` → `DESARROLLO` → `PICO` → `TAPER` → `CARRERA` → `RECUPERACIÓN`

El banner "¿Ya tienes tu próxima carrera?" aparece automáticamente en semanas de fase CARRERA o RECUPERACIÓN.

---

## Generación de planes con Claude API

El wizard llama a `https://api.anthropic.com/v1/messages` con el modelo `claude-sonnet-4-20250514` solicitando el plan en formato JSON estricto con el schema de `buildWeeks()`. El plan generado se guarda directamente en `tw_races`.

La API key se inyecta a nivel del proxy de Claude.ai — no se necesita configurar nada en el cliente.

---

## Sincronización GitHub Gist

1. Crear un [Personal Access Token](https://github.com/settings/tokens) con scope `gist`
2. Abrir ⚙️ → Sync → pegar el token
3. **Subir** crea o actualiza un Gist privado con todas las claves `tw_*`
4. **Bajar** restaura los datos desde el Gist en otro dispositivo

El indicador de estado en ⚙️:
- Sin borde → sync no configurado
- Verde → sincronizado
- Punto amarillo → hay cambios sin subir

---

## Deployment

```bash
# Subir a GitHub Pages
git add index.html
git commit -m "update"
git push origin main
```

La app vive en `https://<usuario>.github.io/<repo>/`.

No hay build step, no hay node_modules, no hay servidor.

---

## Dependencias externas

- [Chart.js 4.4.0](https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js) — gráficos
- [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — tipografía
- Claude API (`claude-sonnet-4-20250514`) — generación de planes
- GitHub Gist API — sincronización (opcional)
