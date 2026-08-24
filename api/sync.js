// api/sync.js
// Vercel Serverless Function — sync de datos de entrenamiento.
// Reemplaza el sync vía Gist: el token de GitHub ya no vive en el browser.
//
// El "código de sync" (32 hex) que envía el cliente ES la credencial:
// quien lo tiene, accede a esos datos. Se genera con crypto.getRandomValues
// en el primer dispositivo y se copia a mano en los demás.
//
// Almacenamiento: Redis de Upstash vía REST (sin dependencias npm — este
// repo no tiene package.json y no queremos introducir uno solo por esto).
//
//   GET  /api/sync?code=<32hex>  → { data, updatedAt } | { data: null }
//   POST /api/sync?code=<32hex>  → guarda el body JSON

// La app se sirve desde dos orígenes (GitHub Pages y Vercel) pero las funciones
// solo existen en Vercel, así que el de Pages necesita CORS.
const ALLOWED_ORIGINS = ['https://maduarte.github.io'];

function cors(req, res) {
  const origin = req.headers?.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

const CODE_RE = /^[a-f0-9]{32}$/;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — muy por encima de un plan completo
const TTL_SECONDS = 60 * 60 * 24 * 730; // 2 años sin usar → expira

function upstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function redis(db, path, init = {}) {
  const res = await fetch(`${db.url}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${db.token}`, ...(init.headers || {}) }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Upstash ${res.status}`);
  return json.result;
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const db = upstash();
  if (!db) {
    return res.status(500).json({ error: 'Almacenamiento no configurado en el servidor.' });
  }

  const code = String(req.query?.code || '').trim().toLowerCase();
  if (!CODE_RE.test(code)) {
    return res.status(400).json({ error: 'Código de sync inválido.' });
  }
  const key = `ncs:sync:${code}`;

  try {
    if (req.method === 'GET') {
      const raw = await redis(db, `get/${key}`);
      if (!raw) return res.status(200).json({ data: null, updatedAt: 0 });
      const stored = JSON.parse(raw);
      return res.status(200).json(stored);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = req.body;
      if (!body || typeof body !== 'object' || !body.keys) {
        return res.status(400).json({ error: 'Body inválido.' });
      }
      const updatedAt = Date.now();
      const payload = JSON.stringify({ data: body, updatedAt });
      if (payload.length > MAX_BYTES) {
        return res.status(413).json({ error: 'Payload demasiado grande.' });
      }
      await redis(db, `set/${key}?EX=${TTL_SECONDS}`, { method: 'POST', body: payload });
      return res.status(200).json({ ok: true, updatedAt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('sync error', err);
    return res.status(502).json({ error: 'Error de almacenamiento: ' + err.message });
  }
}
