// TRACE API — Vercel Serverless (CommonJS, no native deps)
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const SUPABASE_URL = 'https://uneqlkclvazolpwufcwa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXFsa2NsdmF6b2xwd3VmY3dhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDI5MCwiZXhwIjoyMDk3MzA2MjkwfQ.sEfSCpcax6MK4nBWdSotOCNFuoAdafQqlTPvwP-xoL8';
const CLIENT_URL   = 'https://tracingsnowflake.vercel.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();

// Stripe webhook — raw body required, must be registered before json parser
app.post('/api/shop/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(503).json({ error: 'Webhook not configured' });
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[TRACE] webhook signature failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await supabase.from('chip_orders').update({
      status: 'paid',
      stripe_payment_intent: session.payment_intent,
      shipping_name: session.shipping_details?.name || session.customer_details?.name || null,
      shipping_address: session.shipping_details?.address || null,
    }).eq('stripe_session_id', session.id);
    console.log('[TRACE] order paid', session.id);
  }

  res.json({ received: true });
});



app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CLIENT_URL, credentials: true, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] }));
app.use(express.json({ limit: '2mb' }));

const lim = rateLimit({ windowMs: 60000, max: 120, standardHeaders: true, legacyHeaders: false });
app.use(lim);

const chipLookupLimiter = rateLimit({ windowMs: 60000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many chip lookups — please wait a moment' } });

// ─── Auth ─────────────────────────────────────────────────────────────────────
const OPEN = [
  ['/health', 'GET'],
];
async function auth(req, res, next) {
  const isOpen =
    (req.path.startsWith('/api/chip/') && req.method === 'GET') ||
    (req.path === '/api/sightings' && req.method === 'POST') ||
    req.path === '/health';
  if (isOpen) return next();
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}
app.use(auth);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString(), env: !!SUPABASE_KEY }));

// ─── Dogs ────────────────────────────────────────────────────────────────────
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
    .insert({ name: b.name, breed: b.breed || null, age: b.age || null, color: b.color || null,
              chip_id: b.chip_id || null, chip_type: b.chip_type || null,
              owner_id: req.user.id, status: 'safe' })
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

// ─── Reports ─────────────────────────────────────────────────────────────────
app.post('/api/reports/lost', async (req, res) => {
  const { dog_id, last_seen_lat, last_seen_lng, radius_m = 3000, reward_cents = 0 } = req.body;
  await supabase.from('dogs').update({ status: 'lost' }).eq('id', dog_id);
  const point = (last_seen_lat && last_seen_lng) ? `POINT(${last_seen_lng} ${last_seen_lat})` : null;
  const { data, error } = await supabase.from('lost_reports')
    .insert({ dog_id, last_seen: point, radius_m, reward_cents, active: true }).select().single();
  if (error) return res.status(500).json({ error: error.message });
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
  const { dog_id, lat, lng, source = 'human', confidence = 0.5 } = req.body;
  if (!dog_id || lat == null || lng == null) return res.status(400).json({ error: 'dog_id, lat, lng required' });
  const snap = (v, m) => Math.round(v / (m / 111320)) * (m / 111320);
  const { data, error } = await supabase.from('sightings')
    .insert({ dog_id, source, geom: `POINT(${snap(lng,50)} ${snap(lat,50)})`,
              confidence, reporter_id: req.user?.id ?? null }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});
app.get('/api/sightings/:dogId', async (req, res) => {
  const { data, error } = await supabase.from('sightings').select('id,source,confidence,created_at')
    .eq('dog_id', req.params.dogId).order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── Chip ─────────────────────────────────────────────────────────────────────
app.get('/api/chip/:chipId', chipLookupLimiter, async (req, res) => {
  const chipId = req.params.chipId.replace(/\s/g, '');
  const { data: dog } = await supabase.from('dogs')
    .select('id,name,breed,color,age,status,photo_url,chip_id,chip_type,owner_id').eq('chip_id', chipId).single();
  if (!dog) return res.status(404).json({ error: 'Chip not in TRACE' });
  const { data: p } = await supabase.from('profiles').select('first_name,phone').eq('id', dog.owner_id).single();
  res.json({ ...dog, contact: p?.phone ?? null, owner: p?.first_name ?? 'Owner' });
});
app.post('/api/chip/register', async (req, res) => {
  const { dog_id, chip_id, chip_type = 'passive' } = req.body;
  const { data, error } = await supabase.from('dogs').update({ chip_id, chip_type })
    .eq('id', dog_id).eq('owner_id', req.user.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.post('/api/chip/scan', async (req, res) => {
  const { chip_id, source = 'rfid', lat, lng } = req.body;
  const { data: dog } = await supabase.from('dogs').select('id,name,status').eq('chip_id', (chip_id||'').replace(/\s/g,'')).single();
  if (!dog) return res.status(404).json({ error: 'Chip not registered' });
  if (lat && lng) await supabase.from('sightings').insert({ dog_id: dog.id, source: source==='rfid'?'collar':'nfc', geom: `POINT(${lng} ${lat})`, confidence: 0.95 });
  res.json({ dog_id: dog.id, name: dog.name, status: dog.status, notified: true });
});

// ─── Alerts ──────────────────────────────────────────────────────────────────
app.post('/api/alerts/broadcast', rateLimit({ windowMs: 60000, max: 5 }), async (req, res) => {
  const { dog_id, radius_mi = 1 } = req.body;
  const { data: dog } = await supabase.from('dogs').select('*').eq('id', dog_id).eq('owner_id', req.user.id).single();
  if (!dog) return res.status(404).json({ error: 'Dog not found' });
  res.json({ success: true, dog: dog.name, results: { sms: { queued: true }, push: { queued: true } } });
});

// ─── Community ───────────────────────────────────────────────────────────────
app.get('/api/community/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseInt(req.query.radius || '5000');
  if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: 'lat lng required' });
  const { data, error } = await supabase.rpc('nearby_lost_dogs', { lat, lng, radius_m: radius });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

// ─── Poster ──────────────────────────────────────────────────────────────────
app.get('/api/poster/:dogId', async (req, res) => {
  const { data: dog } = await supabase.from('dogs').select('*').eq('id', req.params.dogId).eq('owner_id', req.user.id).single();
  if (!dog) return res.status(404).json({ error: 'Not found' });
  const { data: report } = await supabase.from('lost_reports').select('*').eq('dog_id', dog.id).eq('active', true).single();
  const { data: profile } = await supabase.from('profiles').select('phone,first_name').eq('id', req.user.id).single();
  res.json({ dog, report, contact: profile?.phone ?? '', sighting_url: `https://trace.app/r/${dog.id.slice(0,8)}` });
});


// ─── Shop / Chip Orders ────────────────────────────────────────────────────────
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const PRICE_PASSIVE = process.env.STRIPE_PRICE_PASSIVE || '';
const PRICE_ACTIVE  = process.env.STRIPE_PRICE_ACTIVE  || '';

let stripe = null;
if (STRIPE_SECRET) {
  try { stripe = require('stripe')(STRIPE_SECRET); }
  catch (e) { console.error('[TRACE] stripe init failed', e.message); }
}

const CHIP_CATALOG = {
  passive: { name: 'ACCT Passive Chip', price_cents: 2499, price_id: PRICE_PASSIVE,
             desc: 'NFC + RFID · No battery · Lifetime' },
  active:  { name: 'ACCT Active Chip',  price_cents: 5999, price_id: PRICE_ACTIVE,
             desc: 'NFC + RFID + BLE · 3yr battery · Live relay' },
};

// GET /api/shop/catalog — public catalog info
app.get('/api/shop/catalog', (_req, res) => {
  res.json({
    passive: { name: CHIP_CATALOG.passive.name, price_cents: CHIP_CATALOG.passive.price_cents, desc: CHIP_CATALOG.passive.desc },
    active:  { name: CHIP_CATALOG.active.name,  price_cents: CHIP_CATALOG.active.price_cents,  desc: CHIP_CATALOG.active.desc },
    stripe_configured: !!stripe,
  });
});

// POST /api/shop/checkout — create Stripe Checkout session
app.post('/api/shop/checkout', async (req, res) => {
  const { chip_type, dog_id } = req.body;
  const item = CHIP_CATALOG[chip_type];
  if (!item) return res.status(400).json({ error: 'Invalid chip_type — must be passive or active' });

  if (!stripe) {
    return res.status(503).json({ error: 'Payments not configured yet. Stripe keys pending.' });
  }

  try {
    const lineItem = item.price_id
      ? { price: item.price_id, quantity: 1 }
      : { price_data: { currency: 'usd', product_data: { name: item.name, description: item.desc },
                         unit_amount: item.price_cents }, quantity: 1 };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [lineItem],
      success_url: `${CLIENT_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/shop`,
      customer_email: req.user.email,
      metadata: { user_id: req.user.id, dog_id: dog_id || '', chip_type },
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
    });

    await supabase.from('chip_orders').insert({
      user_id: req.user.id,
      dog_id: dog_id || null,
      chip_type,
      price_cents: item.price_cents,
      stripe_session_id: session.id,
      status: 'pending',
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (e) {
    console.error('[TRACE] checkout error', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/shop/orders — user's order history
app.get('/api/shop/orders', async (req, res) => {
  const { data, error } = await supabase.from('chip_orders')
    .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/shop/orders/:sessionId — check order status (post-checkout polling)
app.get('/api/shop/session/:sessionId', async (req, res) => {
  const { data, error } = await supabase.from('chip_orders')
    .select('*').eq('stripe_session_id', req.params.sessionId).eq('user_id', req.user.id).single();
  if (error || !data) return res.status(404).json({ error: 'Order not found' });
  res.json(data);
});

// PATCH /api/shop/orders/:id/register — assign chip_id when received
app.patch('/api/shop/orders/:id/register', async (req, res) => {
  const { chip_id } = req.body;
  if (!/^\d{15}$/.test(chip_id || '')) return res.status(400).json({ error: 'chip_id must be 15 digits' });

  const { data: order, error: oerr } = await supabase.from('chip_orders')
    .select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (oerr || !order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'paid' && order.status !== 'shipped' && order.status !== 'delivered')
    return res.status(400).json({ error: 'Order not yet paid' });

  const { error: upErr } = await supabase.from('chip_orders')
    .update({ chip_id, status: 'registered' }).eq('id', order.id);
  if (upErr) return res.status(500).json({ error: upErr.message });

  if (order.dog_id) {
    await supabase.from('dogs').update({ chip_id, chip_type: order.chip_type }).eq('id', order.dog_id);
  }

  res.json({ registered: true, chip_id });
});


// ─── Notifications ──────────────────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  const { data, error } = await supabase.from('notifications')
    .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  const { error } = await supabase.from('notifications')
    .update({ read: true }).eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ read: true });
});

app.post('/api/notifications/read-all', async (req, res) => {
  const { error } = await supabase.from('notifications')
    .update({ read: true }).eq('user_id', req.user.id).eq('read', false);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── Photo upload (signed URL pattern) ─────────────────────────────────────
app.post('/api/upload/sign', async (req, res) => {
  const { bucket, filename } = req.body;
  const allowedBuckets = ['dog-photos', 'sighting-photos'];
  if (!allowedBuckets.includes(bucket)) return res.status(400).json({ error: 'Invalid bucket' });

  const ext = (filename || 'photo.jpg').split('.').pop();
  const path = bucket === 'dog-photos'
    ? `${req.user?.id || 'anon'}/${Date.now()}.${ext}`
    : `sightings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error) return res.status(500).json({ error: error.message });

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  res.json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl: pub.publicUrl });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[TRACE]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

module.exports = app;
