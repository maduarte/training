# CLAUDE.md — Nadie Corre Solo (NCS)

Archivo de contexto para traspaso a Claude Code. Lee esto completo antes de tocar cualquier archivo.

---

## Qué es esta app

PWA (Progressive Web App) para entrenamiento de trail running. El usuario principal es **Mauro** (cuenta GitHub `maduarte`, antes `maduarte44` — la cuenta fue renombrada), preparándose para el **Torrencial 44k** (junio 2026, ~19 semanas de plan). La app vive en **https://maduarte.github.io/training/** (GitHub Pages, rama `main`).

La app es **multi-atleta**: en la pantalla inicial el usuario elige su perfil y carrera antes de entrar al calendario.

---

## Estructura de archivos

```
repo-root/
├── index.html          ← esqueleto HTML + <link> y <script> refs
├── sw.js               ← Service Worker (PENDIENTE — ver sección SW)
├── ui/
│   └── styles.css      ← todo el CSS
├── data/
│   ├── races.js        ← ATHLETES[], W(), F(), buildWeeks(), getAllRaces()
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
- Sync vía GitHub Gist (PAT + Gist ID manual para multi-dispositivo)
- Onboarding wizard (pasos 1-3): crea nueva carrera preguntando nombre, fecha, distancia, desnivel, ritmos, disponibilidad semanal con variaciones fin de semana
- PWA manifest con íconos (192 y 512px, base64 inline en app.js o index.html)

### 🔴 PENDIENTE — tarea inmediata: Service Worker offline
La sesión anterior terminó trabajando en esto. Resumen:

**Problema**: El SW actual está registrado como un Blob URL dentro de `app.js` (o `index.html`), lo que hace que no persista entre sesiones del navegador. Offline no funciona realmente.

**Solución acordada**:
1. Crear `sw.js` en la raíz del repo (archivo independiente, ya generado — ver más abajo)
2. Cambiar el registro en `core/app.js` de:
   ```javascript
   navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw], {type:'text/javascript'}))).catch(()=>{});
   ```
   a:
   ```javascript
   navigator.serviceWorker.register('../sw.js', { scope: '../' }).catch(() => {});
   ```
   (usa `../` porque el registro está en `core/app.js`, no en la raíz)
   
   **Alternativa más simple**: mover el registro al `index.html` raíz y usar `'./sw.js'` sin scope especial.

**El `sw.js` ya fue diseñado** con estas estrategias:
- Archivos propios (`url.origin === self.location.origin`): **Stale While Revalidate** — sirve caché al instante + actualiza en background. Funciona para cualquier estructura de carpetas sin listar archivos hardcodeados.
- `api.github.com` y `api.anthropic.com`: **Network First** — intenta red; si falla, sirve última caché.
- CDNs externos: **Cache First**

La versión del caché es `'ncs-v4'`. Incrementar `CACHE_VERSION` al hacer cambios mayores para forzar actualización en usuarios existentes.

### 🟡 Pendiente futuro
- `PACES_AUTO_UPDATE = false` en `core/app.js` — feature flag desactivado, retomar cuando se trabaje ritmos
- Migración a servidor (back-end) para multi-usuario real (hoy usa localStorage + Gist sync)
- `core/paces.js` separado cuando se retome lógica de ritmos

---

## Modelo de datos clave

### ATHLETES (en `data/races.js`)
```javascript
const ATHLETES = [
  {
    id: 'mauro',
    name: 'Mauricio',
    races: [ getRaceById('torrencial44') ]
  },
  // ...
]
```

### Carrera
```javascript
{
  id: 'torrencial44',
  name: 'Torrencial 44k',
  date: '2026-06-27',
  distanceKm: 44,
  gainM: 2800,
  weeks: buildWeeks(startDate, config)
}
```

### Workout (semana/día)
```javascript
{
  type: 'SUAVE' | 'MEDIO' | 'INTENSO' | 'FUERZA' | 'DESCANSO',
  km: 10,
  note: 'Rodaje suave',
  altNote: '',      // nota alternativa (para días con variación)
  logged: {
    h: 0, m: 55, s: 0,    // tiempo real
    km: 10.2,              // distancia real
    emoji: '💪'
  }
}
```

### Storage (`core/storage.js`)
- `S.get(key)` / `S.set(key, val)` — wrapper de localStorage
- Namespace por atleta+carrera para evitar colisiones
- Sync: PAT en `localStorage['tw_sync_pat']`, Gist ID en `localStorage['tw_sync_gist_id']`

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
`openSyncModal()` → ingresa PAT (GitHub) + Gist ID opcional → `syncPush()` o `syncPull()`
El Gist ID manual permite sincronizar entre dispositivos sin compartir PAT.

---

## Guardia de dependencias (en `app.js`)

Si `races.js` no carga, la app muestra error legible:
```javascript
if (typeof buildWeeks === 'undefined' || typeof ATHLETES === 'undefined') {
  document.body.innerHTML = '<div style="color:#f4634a;padding:40px">Error: no se pudo cargar races.js.</div>';
  throw new Error('races.js not loaded');
}
```

---

## Feature flags

```javascript
// core/app.js — top of file
const PACES_AUTO_UPDATE = false;   // desactivado — retomar en iteración futura
```

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

