// TRACE API — all credentials via env vars only
const { createClient } = require('@supabase/supabase-js');
const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLIENT_URL    = process.env.CLIENT_URL    || 'https://tracingsnowflake.vercel.app';
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@trace.app';
const TWILIO_SID    = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM   = process.env.TWILIO_FROM_NUMBER;

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase env vars');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();

// Web push
let webpush = null;
try {
  webpush = require('web-push');
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
} catch { console.error('[TRACE] web-push init failed'); }

// Twilio
let twilio = null;
try {
  if (TWILIO_SID && TWILIO_TOKEN) {
    twilio = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
    console.log('[TRACE] Twilio ready from ' + TWILIO_FROM);
  }
} catch { console.error('[TRACE] twilio init failed'); }

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CLIENT_URL, credentials: true, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] }));
app.use(express.json({ limit: '2mb' }));

const lim     = rateLimit({ windowMs:60000, max:120, standardHeaders:true, legacyHeaders:false });
const chipLim = rateLimit({ windowMs:60000, max:20,  standardHeaders:true, legacyHeaders:false });
const smsLim  = rateLimit({ windowMs:60000, max:3,   standardHeaders:true, legacyHeaders:false, message:{ error:'Too many broadcasts' } });
app.use(lim);


// ── Broadcast Engine (5-layer community alert) ────────────────────────────────
const { fireFullBroadcast } = require('./broadcast-engine.js');

// ── Auth ──────────────────────────────────────────────────────────────────────
async function auth(req, res, next) {
  const open =
    (req.path.startsWith('/api/chip/') && req.method === 'GET') ||
    (req.path === '/api/sightings'     && req.method === 'POST') ||
    req.path === '/health' ||
    req.path === '/api/push/vapid-public-key';
  if (open) return next();
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}
app.use(auth);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function pushToUser(userId, payload) {
  if (!webpush) return;
  const { data } = await supabase.from('profiles').select('push_sub').eq('id', userId).single();
  if (!data?.push_sub) return;
  try { await webpush.sendNotification(data.push_sub, JSON.stringify(payload)); }
  catch (e) { if (e.statusCode === 410) await supabase.from('profiles').update({ push_sub: null }).eq('id', userId); }
}

async function sms(to, body) {
  if (!twilio || !to || !TWILIO_FROM) return;
  try { await twilio.messages.create({ to, from: TWILIO_FROM, body }); }
  catch (e) { console.error('[TRACE] SMS failed', to, e.message); }
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status:'ok', ts:new Date().toISOString(), twilio:!!twilio, webpush:!!webpush }));
app.get('/api/push/vapid-public-key', (_, res) => res.json({ publicKey: VAPID_PUBLIC }));

// ── Dogs ──────────────────────────────────────────────────────────────────────
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
    .insert({ name:b.name, breed:b.breed||null, age:b.age||null, color:b.color||null,
              chip_id:b.chip_id||null, chip_type:b.chip_type||null,
              photo_url:b.photo_url||null, owner_id:req.user.id, status:'safe' })
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

// ── Lost Reports ──────────────────────────────────────────────────────────────
app.post('/api/reports/lost', async (req, res) => {
  const { dog_id, last_seen_lat, last_seen_lng, radius_m=3000 } = req.body;
  await supabase.from('dogs').update({ status:'lost' }).eq('id', dog_id);
  const point = (last_seen_lat && last_seen_lng) ? `POINT(${last_seen_lng} ${last_seen_lat})` : null;
  const { data, error } = await supabase.from('lost_reports')
    .insert({ dog_id, last_seen:point, radius_m, active:true }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  pushToUser(req.user.id, { title:'Alert activated', body:'Your lost dog alert is now live.', url:`${CLIENT_URL}/map` });
  const { data: p } = await supabase.from('profiles').select('phone').eq('id', req.user.id).single();
  await sms(p?.phone, `TRACE: Lost dog alert activated. Track sightings at ${CLIENT_URL}/map`);
  res.status(201).json(data);
});
app.post('/api/reports/lost/:id/close', async (req, res) => {
  const { data: r } = await supabase.from('lost_reports').select('id,dog_id').eq('dog_id', req.params.id).eq('active',true).single();
  if (!r) return res.status(404).json({ error:'No active report' });
  await supabase.from('lost_reports').update({ active:false }).eq('id', r.id);
  await supabase.from('dogs').update({ status:'safe' }).eq('id', r.dog_id);
  res.json({ closed:true });
});
app.get('/api/reports/lost/active/:dogId', async (req, res) => {
  const { data } = await supabase.from('lost_reports').select('*').eq('dog_id', req.params.dogId).eq('active',true).single();
  res.json(data ?? null);
});

// ── Sightings ─────────────────────────────────────────────────────────────────
app.post('/api/sightings', async (req, res) => {
  const { dog_id, lat, lng, source='human', confidence=0.5, photo_url } = req.body;
  if (!dog_id || lat==null || lng==null) return res.status(400).json({ error:'dog_id, lat, lng required' });
  const snap = (v, m) => Math.round(v / (m/111320)) * (m/111320);
  const { data, error } = await supabase.from('sightings')
    .insert({ dog_id, source, geom:`POINT(${snap(lng,50)} ${snap(lat,50)})`,
              confidence, photo_url:photo_url||null, reporter_id:req.user?.id||null })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  const { data: dog } = await supabase.from('dogs').select('owner_id,name').eq('id', dog_id).single();
  if (dog) {
    pushToUser(dog.owner_id, {
      title:`${dog.name} was spotted`,
      body: source==='relay' ? 'BLE relay detected nearby' : 'Community sighting reported',
      url:`${CLIENT_URL}/map`, tag:`sighting-${dog_id}`,
    });
    const { data: p } = await supabase.from('profiles').select('phone').eq('id', dog.owner_id).single();
    await sms(p?.phone, `TRACE: ${dog.name} was spotted nearby. Open the app: ${CLIENT_URL}/map`);
  }
  res.status(201).json(data);
});
app.get('/api/sightings/:dogId', async (req, res) => {
  const { data, error } = await supabase.from('sightings')
    .select('id,source,confidence,created_at').eq('dog_id', req.params.dogId)
    .order('created_at', { ascending:false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Chip ──────────────────────────────────────────────────────────────────────
app.get('/api/chip/:chipId', chipLim, async (req, res) => {
  const chipId = req.params.chipId.replace(/\s/g,'');
  const { data: dog } = await supabase.from('dogs')
    .select('id,name,breed,color,age,status,photo_url,chip_id,chip_type,owner_id').eq('chip_id', chipId).single();
  if (!dog) return res.status(404).json({ error:'Chip not in TRACE' });
  const { data: p } = await supabase.from('profiles').select('first_name,phone').eq('id', dog.owner_id).single();
  await sms(p?.phone, `TRACE: Someone just scanned ${dog.name}'s chip. Check the app if ${dog.name} is missing: ${CLIENT_URL}/map`);
  res.json({ ...dog, contact:p?.phone||null, owner:p?.first_name||'Owner' });
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
  const { data: dog } = await supabase.from('dogs').select('id,name,status,owner_id')
    .eq('chip_id',(chip_id||'').replace(/\s/g,'')).single();
  if (!dog) return res.status(404).json({ error:'Chip not registered' });
  if (lat && lng) await supabase.from('sightings').insert({
    dog_id:dog.id, source:source==='rfid'?'collar':'nfc',
    geom:`POINT(${lng} ${lat})`, confidence:0.95,
  });
  const { data: p } = await supabase.from('profiles').select('phone').eq('id', dog.owner_id).single();
  pushToUser(dog.owner_id, { title:`${dog.name}'s chip scanned`, body:`Via ${source}`, url:`${CLIENT_URL}/map` });
  await sms(p?.phone, `TRACE: ${dog.name}'s chip was scanned (${source}). ${CLIENT_URL}/map`);
  res.json({ dog_id:dog.id, name:dog.name, status:dog.status, notified:true });
});

// ── Broadcast — 5-layer community alert ──────────────────────────────────────
app.post('/api/alerts/broadcast', smsLim, async (req, res) => {
  const { dog_id } = req.body;
  const { data: dog } = await supabase.from('dogs').select('*').eq('id', dog_id).eq('owner_id', req.user.id).single();
  if (!dog) return res.status(404).json({ error: 'Dog not found' });

  // Get or create active lost report ID for the sighting URL
  const { data: report } = await supabase.from('lost_reports')
    .select('id').eq('dog_id', dog_id).eq('active', true).single();
  const reportId = report?.id ?? dog_id;

  // Fire all 5 layers concurrently
  const results = await fireFullBroadcast(dog, reportId, supabase, twilio, webpush, TWILIO_FROM, CLIENT_URL);

  const totalSMS = results.sms_app_users + results.sms_community;
  pushToUser(req.user.id, {
    title: `Alert fired — ${dog.name}`,
    body: `${totalSMS} SMS · ${results.camera_hits.length} camera hits · ${results.twitter ? 'Twitter ✓' : ''} ${results.nextdoor ? 'Nextdoor ✓' : ''} ${results.signage ? 'Billboard ✓' : ''}`.trim(),
    url: `${CLIENT_URL}/map`,
  });

  res.json({ success: true, dog: dog.name, ...results, total_sms: totalSMS });
});

// ── Public SMS opt-in (no auth) ───────────────────────────────────────────────
const publicOptinLimiter = rateLimit({ windowMs: 60000, max: 5, standardHeaders: true, legacyHeaders: false });

app.post('/api/sms/public-optin', publicOptinLimiter, async (req, res) => {
  const { name, phone, zip } = req.body;
  if (!phone || !zip) return res.status(400).json({ error: 'phone and zip required' });

  // Normalize phone
  const normalized = phone.replace(/[^+\d]/g, '');
  if (normalized.length < 10) return res.status(400).json({ error: 'Invalid phone number' });

  const { error } = await supabase.from('community_subscribers')
    .upsert({ name: name || null, phone: normalized, zip, active: true, source: 'web' }, { onConflict: 'phone' });
  if (error) return res.status(500).json({ error: error.message });

  await sms(normalized, `Welcome to TRACE Philly! You'll receive lost dog alerts near zip ${zip}. Reply STOP anytime to opt out.`);
  res.json({ opted_in: true });
});

app.get('/api/sms/subscriber-count', async (_req, res) => {
  const { count } = await supabase.from('community_subscribers').select('*', { count: 'exact', head: true }).eq('active', true);
  res.json({ count: count ?? 0 });
});

app.post('/api/sms/public-optout', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  await supabase.from('community_subscribers').update({ active: false, opted_out_at: new Date().toISOString() }).eq('phone', phone.replace(/[^+\d]/g,''));
  res.json({ opted_out: true });
});

// ── Community ─────────────────────────────────────────────────────────────────
app.get('/api/community/nearby', async (req, res) => {
  const lat=parseFloat(req.query.lat), lng=parseFloat(req.query.lng), radius=parseInt(req.query.radius||'5000');
  if (isNaN(lat)||isNaN(lng)) return res.status(400).json({ error:'lat lng required' });
  const { data, error } = await supabase.rpc('nearby_lost_dogs', { lat, lng, radius_m:radius });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

// ── Poster ────────────────────────────────────────────────────────────────────
app.get('/api/poster/:dogId', async (req, res) => {
  const { data: dog } = await supabase.from('dogs').select('*').eq('id', req.params.dogId).eq('owner_id', req.user.id).single();
  if (!dog) return res.status(404).json({ error:'Not found' });
  const { data: report } = await supabase.from('lost_reports').select('*').eq('dog_id', dog.id).eq('active',true).single();
  const { data: profile } = await supabase.from('profiles').select('phone,first_name').eq('id', req.user.id).single();
  res.json({ dog, report, contact:profile?.phone||'', sighting_url:`${CLIENT_URL}/r/${dog.id.slice(0,8)}` });
});

// ── Notifications ─────────────────────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  const { data, error } = await supabase.from('notifications')
    .select('*').eq('user_id', req.user.id).order('created_at',{ ascending:false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
app.patch('/api/notifications/:id/read', async (req, res) => {
  await supabase.from('notifications').update({ read:true }).eq('id', req.params.id).eq('user_id', req.user.id);
  res.json({ read:true });
});
app.post('/api/notifications/read-all', async (req, res) => {
  await supabase.from('notifications').update({ read:true }).eq('user_id', req.user.id).eq('read',false);
  res.json({ ok:true });
});

// ── Upload ────────────────────────────────────────────────────────────────────
app.post('/api/upload/sign', async (req, res) => {
  const { bucket, filename } = req.body;
  if (!['dog-photos','sighting-photos'].includes(bucket)) return res.status(400).json({ error:'Invalid bucket' });
  const ext = (filename||'photo.jpg').split('.').pop();
  const path = bucket==='dog-photos'
    ? `${req.user?.id||'anon'}/${Date.now()}.${ext}`
    : `sightings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error) return res.status(500).json({ error: error.message });
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  res.json({ signedUrl:data.signedUrl, token:data.token, path, publicUrl:pub.publicUrl });
});

// ── SMS Opt-in ────────────────────────────────────────────────────────────────
app.post('/api/sms/optin', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error:'phone required' });
  await supabase.from('profiles').update({ phone, sms_opted_in:true }).eq('id', req.user.id);
  await sms(phone, `You are now opted in to TRACE lost dog alerts near you. Reply STOP anytime to opt out.`);
  res.json({ opted_in:true });
});
app.post('/api/sms/optout', async (req, res) => {
  await supabase.from('profiles').update({ sms_opted_in:false }).eq('id', req.user.id);
  res.json({ opted_out:true });
});

// ── Account ───────────────────────────────────────────────────────────────────
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
  res.json({ deleted:true });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[TRACE]', err.message);
  res.status(err.status||500).json({ error:err.message||'Server error' });
});

module.exports = app;
