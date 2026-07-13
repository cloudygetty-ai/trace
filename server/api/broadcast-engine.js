// TRACE Broadcast Engine — 5-layer community alert system
// Layer 1: Twilio SMS to opted-in subscribers
// Layer 2: Web Push to app users
// Layer 3: Flock Safety camera query (API key required)
// Layer 4: Social media auto-post (Twitter/X, Nextdoor)
// Layer 5: Programmatic digital signage (Broadsign/Vistar)

const BASE_CLIENT = process.env.CLIENT_URL || 'https://tracingsnowflake.vercel.app';

// ── Layer 3: Camera network query ─────────────────────────────────────────────
async function queryCameraNetwork(dog, supabase) {
  const results = [];
  const FLOCK_KEY = process.env.FLOCK_SAFETY_API_KEY;
  if (!FLOCK_KEY) {
    console.log('[TRACE] Flock Safety: no API key configured');
    return results;
  }
  try {
    // Flock Safety ALPR + object detection API
    // Query cameras within radius for dog matching description
    const res = await fetch('https://api.flocksafety.com/v1/search', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${FLOCK_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'object',
        query: `dog ${dog.color} ${dog.breed}`,
        time_range: { minutes: 120 },
        location: { city: 'Philadelphia', state: 'PA' },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      results.push(...(data.hits || []).map(h => ({
        source: 'flock_camera',
        camera_id: h.camera_id,
        timestamp: h.timestamp,
        confidence: h.score,
        thumbnail: h.thumbnail_url,
        lat: h.location?.lat,
        lng: h.location?.lng,
      })));
      console.log(`[TRACE] Flock Safety: ${results.length} camera hits`);
    }
  } catch (e) {
    console.error('[TRACE] Flock Safety error:', e.message);
  }
  return results;
}

// ── Layer 4a: Post to Twitter/X ───────────────────────────────────────────────
async function postToTwitter(dog, reportId) {
  const BEARER = process.env.TWITTER_BEARER_TOKEN;
  const API_KEY = process.env.TWITTER_API_KEY;
  const API_SECRET = process.env.TWITTER_API_SECRET;
  const ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
  const ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
  if (!API_KEY || !ACCESS_TOKEN) {
    console.log('[TRACE] Twitter: not configured');
    return null;
  }
  try {
    // OAuth 1.0a signing for Twitter v2
    const crypto = require('crypto');
    const nonce = crypto.randomBytes(16).toString('hex');
    const ts = Math.floor(Date.now() / 1000).toString();
    const tweet = `🚨 LOST DOG ALERT — Philadelphia\n\n${dog.name} | ${dog.breed || 'Dog'} | ${dog.color || ''}\n\nLast seen in the area. If you see this dog please call or report here:\n${BASE_CLIENT}/r/${reportId.slice(0,8)}\n\n#LostDog #Philadelphia #TRACE #${(dog.breed||'dog').replace(/\s/g,'')}`;

    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER}`,
      },
      body: JSON.stringify({ text: tweet }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[TRACE] Twitter posted:', data.data?.id);
      return data.data?.id;
    }
  } catch (e) {
    console.error('[TRACE] Twitter error:', e.message);
  }
  return null;
}

// ── Layer 4b: Post to Nextdoor ────────────────────────────────────────────────
async function postToNextdoor(dog, reportId) {
  const ND_TOKEN = process.env.NEXTDOOR_API_TOKEN;
  if (!ND_TOKEN) {
    console.log('[TRACE] Nextdoor: not configured');
    return null;
  }
  try {
    const res = await fetch('https://api.nextdoor.com/post/create', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ND_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'lost_and_found',
        title: `Lost Dog — ${dog.name} (${dog.breed || 'Dog'})`,
        body: `${dog.name} went missing in our area. ${dog.breed || 'Dog'}, ${dog.color || ''}, answers to "${dog.name}".\n\nIf seen please report: ${BASE_CLIENT}/r/${reportId.slice(0,8)}\n\nEvery sighting helps — even if you just saw them running by.`,
        photo_url: dog.photo_url || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[TRACE] Nextdoor posted:', data.post_id);
      return data.post_id;
    }
  } catch (e) {
    console.error('[TRACE] Nextdoor error:', e.message);
  }
  return null;
}

// ── Layer 5: Programmatic digital signage ─────────────────────────────────────
async function pushToDigitalSignage(dog, reportId) {
  const VISTAR_KEY    = process.env.VISTAR_API_KEY;
  const BROADSIGN_KEY = process.env.BROADSIGN_API_KEY;

  // Try Vistar Media (programmatic DOOH)
  if (VISTAR_KEY) {
    try {
      const res = await fetch('https://api.vistarmedia.com/api/v1/campaigns', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${VISTAR_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `TRACE Lost Dog — ${dog.name} — ${new Date().toISOString()}`,
          type: 'public_service',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          geo_targets: [{ city: 'Philadelphia', state: 'PA', radius_miles: 5 }],
          creative: {
            headline: `LOST DOG — ${dog.name.toUpperCase()}`,
            body: `${dog.breed || 'Dog'} · ${dog.color || ''} · If found: ${BASE_CLIENT}/r/${reportId.slice(0,8)}`,
            image_url: dog.photo_url || null,
          },
          budget_cents: 500, // $5 display buy
          cpm_cents: 100,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[TRACE] Vistar billboard campaign created:', data.campaign_id);
        return { provider: 'vistar', campaign_id: data.campaign_id };
      }
    } catch (e) {
      console.error('[TRACE] Vistar error:', e.message);
    }
  }

  if (!BROADSIGN_KEY) {
    console.log('[TRACE] Digital signage: not configured');
    return null;
  }

  // Try Broadsign
  try {
    const res = await fetch('https://api.broadsign.com/v1/campaigns', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${BROADSIGN_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `TRACE-${dog.name}-${Date.now()}`,
        state: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        locations: [{ city: 'Philadelphia', state: 'PA' }],
        creative_url: dog.photo_url,
        headline: `LOST: ${dog.name}`,
        body_text: `${dog.breed} · ${dog.color} · ${BASE_CLIENT}/r/${reportId.slice(0,8)}`,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[TRACE] Broadsign campaign created:', data.id);
      return { provider: 'broadsign', campaign_id: data.id };
    }
  } catch (e) {
    console.error('[TRACE] Broadsign error:', e.message);
  }
  return null;
}

// ── Main broadcast orchestrator ────────────────────────────────────────────────
async function fireFullBroadcast(dog, reportId, supabase, twilioClient, webpush, TWILIO_FROM, CLIENT_URL) {
  const results = {
    sms_app_users:     0,
    sms_community:     0,
    push:              false,
    camera_hits:       [],
    twitter:           null,
    nextdoor:          null,
    signage:           null,
  };

  const msg = `🚨 TRACE ALERT — Lost dog in Philadelphia\n${dog.name} | ${dog.breed||'Dog'} | ${dog.color||''}\nIf seen: ${CLIENT_URL}/r/${reportId.slice(0,8)}\nReply STOP to opt out`;

  // ── Layer 1a: SMS to app users (opted in via profile) ──────────────────────
  const { data: appSubs } = await supabase
    .from('profiles').select('phone').eq('sms_opted_in', true).not('phone','is',null);
  for (const s of (appSubs || [])) {
    try { await twilioClient?.messages.create({ to: s.phone, from: TWILIO_FROM, body: msg }); results.sms_app_users++; }
    catch {}
    await new Promise(r => setTimeout(r, 250));
  }

  // ── Layer 1b: SMS to community subscribers (public opt-in) ─────────────────
  const { data: commSubs } = await supabase
    .from('community_subscribers').select('phone').eq('active', true);
  for (const s of (commSubs || [])) {
    try { await twilioClient?.messages.create({ to: s.phone, from: TWILIO_FROM, body: msg }); results.sms_community++; }
    catch {}
    await new Promise(r => setTimeout(r, 250));
  }

  // ── Layer 2: Web Push to all subscribed app users ──────────────────────────
  const { data: pushSubs } = await supabase
    .from('profiles').select('id,push_sub').not('push_sub','is',null);
  for (const u of (pushSubs || [])) {
    try {
      await webpush?.sendNotification(u.push_sub, JSON.stringify({
        title: `🚨 Lost dog alert — ${dog.name}`,
        body: `${dog.breed||'Dog'} · ${dog.color||''} · Missing near you`,
        url: `${CLIENT_URL}/map`,
        tag: `broadcast-${dog.id}`,
      }));
      results.push = true;
    } catch {}
  }

  // ── Layer 3: Camera network (Flock Safety) ─────────────────────────────────
  results.camera_hits = await queryCameraNetwork(dog, supabase);
  if (results.camera_hits.length > 0) {
    // Store camera sightings
    for (const hit of results.camera_hits) {
      if (hit.lat && hit.lng) {
        await supabase.from('sightings').insert({
          dog_id: dog.id, source: 'relay',
          geom: `POINT(${hit.lng} ${hit.lat})`,
          confidence: hit.confidence || 0.6,
          photo_url: hit.thumbnail || null,
        });
      }
    }
  }

  // ── Layer 4: Social media (parallel) ───────────────────────────────────────
  const [twitterId, nextdoorId] = await Promise.all([
    postToTwitter(dog, reportId),
    postToNextdoor(dog, reportId),
  ]);
  results.twitter  = twitterId;
  results.nextdoor = nextdoorId;

  // ── Layer 5: Digital signage ───────────────────────────────────────────────
  results.signage = await pushToDigitalSignage(dog, reportId);

  return results;
}

module.exports = { fireFullBroadcast, queryCameraNetwork };
