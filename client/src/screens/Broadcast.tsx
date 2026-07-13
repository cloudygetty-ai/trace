import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { TopHeader, Btn } from '../components';

interface BroadcastResults {
  sms_app_users: number;
  sms_community: number;
  push: boolean;
  camera_hits: any[];
  twitter: string | null;
  nextdoor: string | null;
  signage: any | null;
  total_sms: number;
}

const LAYERS = [
  { key: 'sms',     icon: '💬', label: 'SMS Blast',        sub: 'App users + community subscribers' },
  { key: 'push',    icon: '🔔', label: 'Web Push',         sub: 'All subscribed devices' },
  { key: 'camera',  icon: '📷', label: 'Camera Network',   sub: 'Flock Safety · Philly CCTV grid' },
  { key: 'social',  icon: '📣', label: 'Social Media',     sub: 'Twitter/X · Nextdoor auto-post' },
  { key: 'signage', icon: '🪧', label: 'Digital Signage',  sub: 'Programmatic billboards · $5 buy' },
];

export default function Broadcast() {
  const { dogId } = useParams();
  const { dogs, activeDog, showToast } = useStore();
  const dog = dogs.find(d => d.id === dogId) ?? activeDog ?? dogs.find(d => d.status === 'lost') ?? dogs[0];
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<BroadcastResults | null>(null);
  const [subCount, setSubCount] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sms/subscriber-count`)
      .then(r => r.json()).then(d => setSubCount(d.count ?? 0)).catch(() => {});
  }, []);

  const fire = async () => {
    if (!dog) { showToast('No dog selected'); return; }
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/alerts/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ dog_id: dog.id }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
        showToast('✓ All 5 layers fired');
      } else {
        showToast(data.error ?? 'Broadcast failed');
      }
    } catch (e: any) {
      showToast(e.message ?? 'Network error');
    } finally {
      setSending(false);
    }
  };

  if (results) return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Alert Sent" back/>
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🚨</div>
          <p className="font-display text-2xl font-bold text-text">Alert is live</p>
          <p className="font-sans text-sm text-muted mt-2">Every channel fired for {dog?.name}</p>
        </div>

        {/* Results grid */}
        <div className="flex flex-col gap-3">
          <div className="bg-surface border border-amber/15 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-text">SMS Blast</p>
              <p className="font-sans text-xs text-muted">{results.total_sms} people notified</p>
            </div>
            <span className="font-mono text-lg font-bold text-amber">{results.total_sms}</span>
          </div>

          <div className={"bg-surface border rounded-2xl p-4 flex items-center gap-3 " + (results.push ? 'border-green/30' : 'border-amber/15')}>
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-text">Web Push</p>
              <p className="font-sans text-xs text-muted">{results.push ? 'Delivered to all subscribed devices' : 'No subscribed devices'}</p>
            </div>
            <span className={"font-mono text-sm font-bold " + (results.push ? 'text-green' : 'text-muted')}>{results.push ? '✓' : '—'}</span>
          </div>

          <div className={"bg-surface border rounded-2xl p-4 flex items-center gap-3 " + (results.camera_hits.length > 0 ? 'border-amber/30' : 'border-amber/15')}>
            <span className="text-2xl">📷</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-text">Camera Network</p>
              <p className="font-sans text-xs text-muted">{results.camera_hits.length > 0 ? `${results.camera_hits.length} potential sightings found` : 'Flock Safety queried — no hits yet'}</p>
            </div>
            <span className={"font-mono text-sm font-bold " + (results.camera_hits.length > 0 ? 'text-amber' : 'text-muted')}>{results.camera_hits.length}</span>
          </div>

          <div className="bg-surface border border-amber/15 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📣</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-text">Social Media</p>
              <div className="flex gap-2 mt-1">
                <span className={"font-mono text-[9px] px-2 py-0.5 rounded-full " + (results.twitter ? 'bg-amber/10 text-amber' : 'bg-wood2/50 text-muted')}>
                  Twitter {results.twitter ? '✓' : '—'}
                </span>
                <span className={"font-mono text-[9px] px-2 py-0.5 rounded-full " + (results.nextdoor ? 'bg-green/10 text-green' : 'bg-wood2/50 text-muted')}>
                  Nextdoor {results.nextdoor ? '✓' : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className={"bg-surface border rounded-2xl p-4 flex items-center gap-3 " + (results.signage ? 'border-amber/30' : 'border-amber/15')}>
            <span className="text-2xl">🪧</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-text">Digital Signage</p>
              <p className="font-sans text-xs text-muted">{results.signage ? `${results.signage.provider} campaign live` : 'Billboard API not configured'}</p>
            </div>
            <span className={"font-mono text-sm font-bold " + (results.signage ? 'text-amber' : 'text-muted')}>{results.signage ? '✓' : '—'}</span>
          </div>
        </div>

        {results.camera_hits.length > 0 && (
          <div className="bg-amber/8 border border-amber/20 rounded-2xl p-4">
            <p className="font-mono text-[9px] text-amber uppercase tracking-wider mb-2">Camera hits — check map</p>
            <p className="font-sans text-xs text-text leading-relaxed">
              {results.camera_hits.length} Flock Safety camera{results.camera_hits.length > 1 ? 's' : ''} detected a possible match. Sightings added to the map automatically.
            </p>
            <button onClick={() => nav('/map')} className="mt-3 font-mono text-[10px] text-amber tracking-wide">
              View on map →
            </button>
          </div>
        )}

        <Btn full variant="ghost" onClick={() => nav('/map')}>View Live Map →</Btn>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Fire Alert" back/>
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {dog && (
          <div className="bg-warn/8 border border-warn/25 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">🐕</span>
            <div className="flex-1">
              <p className="font-display text-base font-bold text-text">{dog.name}</p>
              <p className="font-sans text-xs text-muted">{dog.breed} · {dog.color}</p>
            </div>
            <span className="font-mono text-[9px] text-warn border border-warn/30 px-2 py-1 rounded-md">MISSING</span>
          </div>
        )}

        {/* Community size */}
        <div className="bg-amber/8 border border-amber/20 rounded-2xl p-4 text-center">
          <p className="font-mono text-3xl font-bold text-amber">{subCount.toLocaleString()}</p>
          <p className="font-sans text-xs text-muted mt-1">people in the TRACE Philly alert network</p>
          <a href="/alerts.html" target="_blank" className="font-mono text-[10px] text-amber mt-2 block tracking-wide">
            Grow the network → trace.app/alerts
          </a>
        </div>

        {/* 5 layers */}
        <p className="font-display text-base font-semibold text-text px-1">5 layers fire simultaneously</p>
        <div className="flex flex-col gap-2">
          {LAYERS.map(l => (
            <div key={l.key} className="bg-surface border border-amber/15 rounded-2xl p-3.5 flex items-center gap-3">
              <span className="text-xl">{l.icon}</span>
              <div className="flex-1">
                <p className="font-sans text-sm font-semibold text-text">{l.label}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{l.sub}</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-green animate-pulse flex-shrink-0"/>
            </div>
          ))}
        </div>

        <Btn full onClick={fire} disabled={sending || !dog}
          className={sending ? '' : 'shadow-[0_4px_20px_rgba(220,38,38,.3)]'}
          style={{background: sending ? undefined : '#dc2626'}}>
          {sending ? 'Broadcasting...' : '🚨  Fire Alert — All 5 Layers'}
        </Btn>

        <p className="font-sans text-[11px] text-muted text-center leading-relaxed">
          This fires SMS, push, cameras, social posts, and billboards simultaneously.
          Rate limited to 3 per hour.
        </p>
      </div>
    </div>
  );
}
