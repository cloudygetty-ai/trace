import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn, Toggle } from '../components';

export default function Broadcast() {
  const { dogId } = useParams();
  const { dogs, activeDog, showToast } = useStore();
  const dog = dogs.find(d => d.id === dogId) ?? activeDog ?? dogs.find(d => d.status === 'lost') ?? dogs[0];
  const [sms, setSms] = useState(true);
  const [push, setPush] = useState(true);
  const [kiosk, setKiosk] = useState(true);
  const [radius, setRadius] = useState(1);
  const [sending, setSending] = useState(false);
  const nav = useNavigate();

  const send = async () => {
    setSending(true);
    try {
      await api.sendBroadcast({ dog_id: dog?.id, channels: { sms, push, kiosk }, radius_mi: radius });
      showToast('✓ Alert sent · ~1,620 people notified');
    } catch {
      showToast('✓ Alert broadcast (demo)');
    } finally { setSending(false); nav(-1); }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Send Alert" back/>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {dog && (
          <div className="bg-warn/5 border border-warn/30 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">🐕</span>
            <div>
              <p className="text-base font-bold">{dog.name} · <span className="text-warn text-sm">LOST</span></p>
              <p className="text-xs text-muted2">Last seen 4 hours ago</p>
            </div>
          </div>
        )}
        <div className="bg-s1 border border-border rounded-2xl overflow-hidden">
          {[
            { icon:'💬', label:'SMS Broadcast', sub:'340 opted-in · Est. $4.76', on:sms, toggle:()=>setSms(v=>!v) },
            { icon:'🔔', label:'Web Push', sub:'1,280 subscribers', on:push, toggle:()=>setPush(v=>!v) },
            { icon:'📍', label:'Geo QR Kiosks', sub:'15 displays in radius', on:kiosk, toggle:()=>setKiosk(v=>!v) },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-none">
              <span className="text-xl">{r.icon}</span>
              <div className="flex-1"><p className="text-sm font-medium">{r.label}</p><p className="text-xs text-muted2 mt-0.5">{r.sub}</p></div>
              <Toggle on={r.on} onToggle={r.toggle}/>
            </div>
          ))}
          <div className="px-4 py-4 border-t border-border flex items-center gap-3">
            <span className="text-xl">📻</span>
            <div className="flex-1"><p className="text-sm font-medium">WEA / Amber-style</p><p className="text-xs text-amber mt-0.5">Requires PD co-sign · ~12,400 phones</p></div>
            <button className="font-mono text-[9px] text-amber" onClick={() => showToast('Requesting PD co-sign...')}>REQUEST →</button>
          </div>
        </div>
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted2">Alert radius</label>
          <input type="range" min={1} max={10} step={0.5} value={radius} onChange={e=>setRadius(+e.target.value)}
            className="w-full mt-2 accent-cyan"/>
          <p className="font-mono text-lg font-bold text-cyan text-center mt-1">{radius} mi</p>
        </div>
        <Btn full onClick={send} disabled={sending}>{sending ? 'Sending...' : '🚨  Send Alert Now'}</Btn>
        <p className="text-[11px] text-muted2 text-center leading-relaxed">Only opted-in recipients receive alerts. All messages include STOP instructions.</p>
      </div>
    </div>
  );
}
