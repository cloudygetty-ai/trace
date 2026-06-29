// TRACE API — Personal Use Edition
// Supabase + Web Push. No Stripe, no Twilio.
const { createClient } = require('@supabase/supabase-js');
const express     = require('express');
const helmet      = require('helmet');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');

const SUPABASE_URL = 'https://uneqlkclvazolpwufcwa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXFsa2NsdmF6b2xwd3VmY3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDI5MCwiZXhwIjoyMDk3MzA2MjkwfQ.sEfSCpcax6MK4nBWdSotOCNFuoAdafQqlTPvwP-xoL8';
const CLIENT_URL   = 'https://tracingsnowflake.vercel.app';
const VAPID_PUBLIC  = 'BFJ7haWLVXeLd5vH_5fNNpTbBGOS0LhM6uvTeNcTE5aHGJKPfMHrFQox6HRHgWVXiDXSAOXs4eXoc-qgSsKdumc';
const VAPID_PRIVATE = 'HGNLTN0xXM14y-vIfKxu00h3oqalp5gGs167_xPJwRs';
const VAPID_SUBJECT = 'mailto:admin@trace.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();

// Web push
let webpush = null;
try {
  webpush = require('web-push');
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
} catch { console.error('[TRACE] web-push unavailable'); }

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CLIENT_URL, credentials: true, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] }));

// Stripe webhook needs raw body — register BEFORE json parser
app.post('/api/shop/webhook', express.raw({ type: 'application/json' }), (_req, res) => {
  res.json({ received: true, note: 'Stripe not configured for personal use' });
});

app.use(express.json({ limit: '2mb' }));

const lim = rateLimit({ windowMs: 60000, max: 120, standardHeaders: true, legacyHeaders: false });
app.use(lim);
const chipLim = rateLimit({ windowMs: 60000, max: 20, standardHeaders: true, legacyHeaders: false });

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function auth(req, res, next) {
  const open =
    (req.path.startsWith('/api/chip/') && req.method === 'GET') ||
    (req.path === '/api/sightings' && req.method === 'POST') ||
    req.path === '/health' ||
    req.path === '/api/push/vapid-public-key' ||
    req.path === '/api/shop/catalog';
  if (open) return next();
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}
app.use(auth);

// ─── Push helpers ─────────────────────────────────────────────────────────────
async function pushToUser(userId, payload) {
  if (!webpush) return;
  const { data } = await supabase.from('profiles').select('push_sub').eq('id', userId).single();
  if (!data?.push_sub) return;
  try {
    await webpush.sendNotification(data.push_sub, JSON.stringify(payload));
  } catch (e) {
    if (e.statusCode === 410) await supabase.from('profiles').update({ push_sub: null }).eq('id', userId);
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.get('/api/push/vapid-public-key', (_, res) => res.json({ publicKey: VAPID_PUBLIC }));
app.get('/api/shop/catalog', (_, res) => res.json({ personal_use: true, stripe_configured: false }));

// ─── Dogs ─────────────────────────────────────────────────────────────────────
app.get('/api/dogs', async (req, res) => {
  const { data, error } = await supabase.from('dogs').select('*').eq('owner_id', req.user.id).order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.get('/api/dogs/:id', async (req, res) => {
  const { data, error } = await supabase.from('dogs').select('*').eq('id', req.params.id).eq('owner_id', req.user.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});
app.post('/api/dogs', async (req, res) => {
  const b = req.body;
  const { data, error } = await supabase.from('dogs')
    .insert({ name: b.name, breed: b.breed||null, age: b.age||null, color: b.color||null,
              chip_id: b.chip_id||null, chip_type: b.chip_type||null,
              photo_url: b.photo_url||null, owner_id: req.user.id, status: 'safe' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});
app.patch('/api/dogs/:id', async (req, res) => {
  const allowed = ['name','breed','age','color','chip_id','chip_type','photo_url','status'];
  const body = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase.from('dogs').update(body).eq('id', req.params.id).eq('owner_id', req.user.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.delete('/api/dogs/:id', async (req, res) => {
  const { error } = await supabase.from('dogs').delete().eq('id', req.params.id).eq('owner_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// ─── Lost Reports ─────────────────────────────────────────────────────────────
app.post('/api/reports/lost', async (req, res) => {
  const { dog_id, last_seen_lat, last_seen_lng, radius_m=3000 } = req.body;
  await supabase.from('dogs').update({ status: 'lost' }).eq('id', dog_id);
  const point = (last_seen_lat && last_seen_lng) ? `POINT(${last_seen_lng} ${last_seen_lat})` : null;
  const { data, error } = await supabase.from('lost_reports')
    .insert({ dog_id, last_seen: point, radius_m, active: true }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  // Push owner
  pushToUser(req.user.id, { title: 'Alert activated', body: 'Your lost dog alert is now live.', url: `${CLIENT_URL}/map` });
  res.status(201).json(data);
});
app.post('/api/reports/lost/:id/close', async (req, res) => {
  const { data: r } = await supabase.from('lost_reports').select('id,dog_id').eq('dog_id', req.params.id).eq('active', true).single();
  if (!r) return res.status(404).json({ error: 'No active report' });
  await supabase.from('lost_reports').update({ active: false }).eq('id', r.id);
  await supabase.from('dogs').update({ status: 'safe' }).eq('id', r.dog_id);
  res.json({ closed: true });
});
app.get('/api/reports/lost/active/:dogId', async (req, res) => {
  const { data } = await supabase.from('lost_reports').select('*').eq('dog_id', req.params.dogId).eq('active', true).single();
  res.json(data ?? null);
});

// ─── Sightings ───────────────────────────────────────────────────────────────
app.post('/api/sightings', async (req, res) => {
  const { dog_id, lat, lng, source='human', confidence=0.5, photo_url } = req.body;
  if (!dog_id || lat==null || lng==null) return res.status(400).json({ error: 'dog_id, lat, lng required' });
  const snap = (v, m) => Math.round(v / (m/111320)) * (m/111320);
  const { data, error } = await supabase.from('sightings')
    .insert({ dog_id, source, geom: `POINT(${snap(lng,50)} ${snap(lat,50)})`,
              confidence, photo_url: photo_url||null, reporter_id: req.user?.id||null })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  // Notify dog owner
  const { data: dog } = await supabase.from('dogs').select('owner_id,name').eq('id', dog_id).single();
  if (dog) {
    pushToUser(dog.owner_id, {
      title: `${dog.name} was spotted`,
      body: source === 'relay' ? 'BLE relay signal detected nearby' : 'A community sighting was reported',
      url: `${CLIENT_URL}/map`,
      tag: `sighting-${dog_id}`,
    });
  }
  res.status(201).json(data);
});
app.get('/api/sightings/:dogId', async (req, res) => {
  const { data, error } = await supabase.from('sightings')
    .select('id,source,confidence,created_at').eq('dog_id', req.params.dogId)
    .order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── Chip ──────────────────────────────────────────────────────────────────────
app.get('/api/chip/:chipId', chipLim, async (req, res) => {
  const chipId = req.params.chipId.replace(/\s/g,'');
  const { data: dog } = await supabase.from('dogs')
    .select('id,name,breed,color,age,status,photo_url,chip_id,chip_type,owner_id').eq('chip_id', chipId).single();
  if (!dog) return res.status(404).json({ error: 'Chip not in TRACE' });
  const { data: p } = await supabase.from('profiles').select('first_name,phone').eq('id', dog.owner_id).single();
  res.json({ ...dog, contact: p?.phone||null, owner: p?.first_name||'Owner' });
});
app.post('/api/chip/register', async (req, res) => {
  const { dog_id, chip_id, chip_type='passive' } = req.body;
  const { data, error } = await supabase.from('dogs').update({ chip_id, chip_type })
    .eq('id', dog_id).eq('owner_id', req.user.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post('/api/chip/scan', async (req, res) => {
  const { chip_id, source='rfid', lat, lng } = req.body;
  const { data: dog } = await supabase.from('dogs').select('id,name,status,owner_id').eq('chip_id',(chip_id||'').replace(/\s/g,'')).single();
  if (!dog) return res.status(404).json({ error: 'Chip not registered' });
  if (lat && lng) await supabase.from('sightings').insert({ dog_id: dog.id, source: source==='rfid'?'collar':'nfc', geom:`POINT(${lng} ${lat})`, confidence:0.95 });
  pushToUser(dog.owner_id, { title: `${dog.name}'s chip was scanned`, body: `Source: ${source}`, url: `${CLIENT_URL}/map`, tag: `scan-${dog.id}` });
  res.json({ dog_id: dog.id, name: dog.name, status: dog.status, notified: true });
});

// ─── Alerts ───────────────────────────────────────────────────────────────────
app.post('/api/alerts/broadcast', rateLimit({ windowMs:60000, max:10 }), async (req, res) => {
  const { dog_id } = req.body;
  const { data: dog } = await supabase.from('dogs').select('*').eq('id', dog_id).eq('owner_id', req.user.id).single();
  if (!dog) return res.status(404).json({ error: 'Dog not found' });
  // Push to self (for personal use — single owner)
  pushToUser(req.user.id, { title: `Alert: ${dog.name} is missing`, body: `${dog.breed} · ${dog.color}`, url: `${CLIENT_URL}/map`, tag: `alert-${dog.id}` });
  res.json({ success: true, dog: dog.name });
});

// ─── Community ────────────────────────────────────────────────────────────────
app.get('/api/community/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng), radius = parseInt(req.query.radius||'5000');
  if (isNaN(lat)||isNaN(lng)) return res.status(400).json({ error: 'lat lng required' });
  const { data, error } = await supabase.rpc('nearby_lost_dogs', { lat, lng, radius_m: radius });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

// ─── Poster ───────────────────────────────────────────────────────────────────
app.get('/api/poster/:dogId', async (req, res) => {
  const { data: dog } = await supabase.from('dogs').select('*').eq('id', req.params.dogId).eq('owner_id', req.user.id).single();
  if (!dog) return res.status(404).json({ error: 'Not found' });
  const { data: report } = await supabase.from('lost_reports').select('*').eq('dog_id', dog.id).eq('active', true).single();
  const { data: profile } = await supabase.from('profiles').select('phone,first_name').eq('id', req.user.id).single();
  res.json({ dog, report, contact: profile?.phone||'', sighting_url: `https://trace.app/r/${dog.id.slice(0,8)}` });
});

// ─── Notifications ────────────────────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  const { data, error } = await supabase.from('notifications')
    .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.patch('/api/notifications/:id/read', async (req, res) => {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ read: true });
});
app.post('/api/notifications/read-all', async (req, res) => {
  await supabase.from('notifications').update({ read: true }).eq('user_id', req.user.id).eq('read', false);
  res.json({ ok: true });
});

// ─── Upload ───────────────────────────────────────────────────────────────────
app.post('/api/upload/sign', async (req, res) => {
  const { bucket, filename } = req.body;
  if (!['dog-photos','sighting-photos'].includes(bucket)) return res.status(400).json({ error: 'Invalid bucket' });
  const ext = (filename||'photo.jpg').split('.').pop();
  const path = bucket === 'dog-photos'
    ? `${req.user?.id||'anon'}/${Date.now()}.${ext}`
    : `sightings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error) return res.status(500).json({ error: error.message });
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  res.json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl: pub.publicUrl });
});

// ─── Account ──────────────────────────────────────────────────────────────────
app.delete('/api/account', async (req, res) => {
  const userId = req.user.id;
  const { data: dogs } = await supabase.from('dogs').select('photo_url').eq('owner_id', userId);
  for (const d of (dogs||[])) {
    if (d.photo_url) {
      const path = d.photo_url.split('/dog-photos/')[1];
      if (path) await supabase.storage.from('dog-photos').remove([path]);
    }
  }
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ deleted: true });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[TRACE]', err.message);
  res.status(err.status||500).json({ error: err.message||'Server error' });
});

module.exports = app;
