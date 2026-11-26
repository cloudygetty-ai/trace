// Public lost-dog share page for Snapchat Creative Kit (web).
// Snap reads og:* / snapchat:* meta from this server-rendered page, so it must be
// public and must not rely on client-side JS. Never exposes owner phone or GPS.
const express = require('express');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function shareOrigin(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
  return `${proto}://${req.headers['x-forwarded-host'] || req.get('host')}`;
}

function renderPage({ dog, report, url, clientUrl }) {
  const lost = dog.status === 'lost';
  const name = esc(dog.name);
  const NAME = esc(String(dog.name ?? '').toUpperCase());
  const desc = [dog.breed, dog.age, dog.color].filter(Boolean).map(esc).join(' · ');
  const reward = report?.reward_cents > 0 ? `$${Math.round(report.reward_cents / 100)}` : null;
  const since = report?.created_at
    ? new Date(report.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })
    : null;
  const title = lost ? `MISSING: ${name}${desc ? ` — ${desc}` : ''}` : `${name} is home safe`;
  const ogDesc = lost
    ? `Help bring ${name} home. Seen this dog? Tap to report a sighting — no account needed.${reward ? ` Reward ${reward}.` : ''}`
    : `Thanks for helping — ${name} has been found.`;
  const photo = dog.photo_url ? esc(dog.photo_url) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title} · TRACE</title>
<meta name="description" content="${ogDesc}"/>
<meta name="robots" content="${lost ? 'index' : 'noindex'}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="TRACE — Find My Dog"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${ogDesc}"/>
<meta property="og:url" content="${esc(url)}"/>
${photo ? `<meta property="og:image" content="${photo}"/>` : `<meta name="snapchat:suppress_sticker" content="true"/>`}
<meta name="twitter:card" content="${photo ? 'summary_large_image' : 'summary'}"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  :root{--bg:#fdf6ee;--ink:#2d1a05;--muted:#8a6a3a;--amber:#d97706;--warn:#dc2626;--green:#16a34a;--card:#fffaf3}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"DM Mono",ui-monospace,monospace}
  main{max-width:440px;margin:0 auto;padding:20px 16px 40px}
  .card{background:var(--card);border:1px solid rgba(180,120,40,.25);border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(45,26,5,.08)}
  .head{background:#111;color:#fff;padding:16px 20px}
  .tag{font-size:11px;letter-spacing:.18em;font-weight:500;color:${lost ? '#ef4444' : '#4ade80'}}
  h1{font-family:"Playfair Display",Georgia,serif;font-weight:900;font-size:40px;line-height:1;margin:6px 0 0}
  .photo{width:100%;aspect-ratio:1;object-fit:cover;display:block;background:#f5e8cc}
  .noimg{display:flex;align-items:center;justify-content:center;font-size:96px}
  .body{padding:16px 20px;display:grid;gap:12px}
  .label{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .val{font-size:15px;margin-top:2px}
  .row{display:flex;justify-content:space-between;gap:12px}
  .reward{font-size:22px;color:var(--green);font-weight:500}
  button{width:100%;height:52px;border:0;border-radius:14px;font:500 14px "DM Mono",monospace;letter-spacing:.04em;cursor:pointer}
  .cta{background:var(--warn);color:#fff;box-shadow:0 4px 14px rgba(220,38,38,.3)}
  .cta:disabled{opacity:.6}
  .note{font-size:11px;color:var(--muted);text-align:center;line-height:1.5}
  .ok{background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.3);color:var(--green);padding:12px;border-radius:12px;font-size:13px;text-align:center}
  a{color:var(--amber)}
</style>
</head>
<body>
<main>
  <div class="card">
    <div class="head"><div class="tag">${lost ? '⚠ MISSING DOG' : '✓ FOUND'}</div><h1>${NAME}</h1></div>
    ${photo ? `<img class="photo" src="${photo}" alt="Photo of ${name}"/>` : `<div class="photo noimg">🐕</div>`}
    <div class="body">
      ${desc ? `<div><div class="label">Description</div><div class="val">${desc}</div></div>` : ''}
      ${lost ? `<div class="row">
        ${since ? `<div><div class="label">Missing since</div><div class="val">${esc(since)}</div></div>` : ''}
        ${reward ? `<div style="text-align:right"><div class="label">Reward</div><div class="reward">${reward}</div></div>` : ''}
      </div>
      <button class="cta" id="seen">📍 I SAW ${NAME}</button>
      <div id="status" class="note">Shares your current location with the owner only. No account, no name, no phone number.</div>
      <div class="note">Don't chase — dogs that are lost often run. Stay put and report.</div>`
      : `<div class="ok">${name} is back home. Thank you for looking out.</div>`}
    </div>
  </div>
  <p class="note" style="margin-top:16px">Powered by <a href="${esc(clientUrl)}">TRACE</a> · community lost-dog alerts</p>
</main>
${lost ? `<script>
(function(){
  var btn=document.getElementById('seen'),st=document.getElementById('status'),label=btn.textContent;
  function done(msg,ok){st.textContent=msg;st.className=ok?'ok':'note';}
  btn.addEventListener('click',function(){
    if(!navigator.geolocation){done('Location is unavailable on this device.');return;}
    btn.disabled=true;btn.textContent='Getting your location…';
    navigator.geolocation.getCurrentPosition(function(p){
      fetch('/api/sightings',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({dog_id:${JSON.stringify(dog.id)},lat:p.coords.latitude,lng:p.coords.longitude,source:'human',confidence:0.6})})
      .then(function(r){if(!r.ok)throw 0;btn.style.display='none';done('Sent. The owner was just alerted — thank you!',true);})
      .catch(function(){btn.disabled=false;btn.textContent='📍 TRY AGAIN';done('Could not send. Check your connection and try again.');});
    },function(){btn.disabled=false;btn.textContent=label;done('Allow location access so the owner knows where you saw them.');},
    {enableHighAccuracy:true,timeout:15000,maximumAge:60000});
  });
})();
</script>` : ''}
</body>
</html>`;
}

module.exports = function snapShare({ supabase, clientUrl }) {
  const router = express.Router();

  router.get('/s/:dogId', async (req, res) => {
    const { dogId } = req.params;
    if (!UUID_RE.test(dogId)) return res.status(404).type('text').send('Not found');

    const { data: dog } = await supabase.from('dogs')
      .select('id,name,breed,age,color,photo_url,status').eq('id', dogId).single();
    if (!dog) return res.status(404).type('text').send('Not found');

    const { data: report } = await supabase.from('lost_reports')
      .select('reward_cents,created_at').eq('dog_id', dogId).eq('active', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();

    const url = `${shareOrigin(req)}/s/${dog.id}`;
    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.type('html').send(renderPage({ dog, report, url, clientUrl }));
  });

  return router;
};

module.exports.renderPage = renderPage;
