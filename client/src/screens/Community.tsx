import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader, Toggle } from '../components';

export default function Community() {
  const nav = useNavigate();
  const [relay, setRelay] = useState(true);

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader logo title="Community" action="+ Report" onAction={() => nav('/report')}/>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 mt-4 bg-amber/5 border-l-2 border-amber rounded-r-xl p-3 text-[11px] text-amber/70 leading-relaxed">
          📡 Your phone is <strong className="text-cream">actively relaying</strong> for 3 lost dogs nearby.
        </div>

        <div className="flex items-center justify-between px-4 mt-5 mb-3">
          <span className="font-display text-[15px] font-semibold text-cream">Lost Dogs Near You</span>
          <button onClick={() => nav('/map')} className="font-mono text-[10px] text-amber">Map view</button>
        </div>

        <div className="px-4 flex flex-col gap-3">
          <div onClick={() => nav('/report/luna')} className="glass-card border border-warn/30 rounded-2xl p-4 flex gap-3 cursor-pointer active:scale-[.98]">
            <div className="w-14 h-14 rounded-xl glass border border-amber/10 flex items-center justify-center text-3xl flex-shrink-0">🐕</div>
            <div className="flex-1">
              <p className="text-sm font-bold">Luna</p>
              <p className="text-xs text-muted2 mt-0.5">Husky Mix · Grey & white</p>
              <p className="text-xs text-warn mt-1.5">📍 0.3 mi · Missing 4h</p>
            </div>
            <button className="self-center bg-warn/10 border border-warn/30 text-warn font-mono text-[9px] h-8 px-3 rounded-xl">Seen</button>
          </div>

          <div onClick={() => nav('/report')} className="glass-card border border-amber/10 rounded-2xl p-4 flex gap-3 cursor-pointer active:scale-[.98]">
            <div className="w-14 h-14 rounded-xl glass border border-amber/10 flex items-center justify-center text-3xl flex-shrink-0">🐩</div>
            <div className="flex-1">
              <p className="text-sm font-bold">Coco</p>
              <p className="text-xs text-muted2 mt-0.5">Poodle · White · 6 yrs</p>
              <p className="text-xs text-amber mt-1.5">📍 0.8 mi · Missing 2d</p>
            </div>
            <button className="self-center glass-card border border-amber/10 text-muted2 font-mono text-[9px] h-8 px-3 rounded-xl">Seen</button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 mt-5 mb-3">
          <span className="font-display text-[15px] font-semibold text-cream">Your Relay Status</span>
        </div>
        <div className="mx-4 glass-card border border-amber/10 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">BLE Relay Active</p>
              <p className="text-xs text-muted2 mt-0.5">Passive — no battery impact</p>
            </div>
            <Toggle on={relay} onToggle={() => setRelay(v => !v)}/>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center border-t border-amber/10 pt-4">
            <div><p className="font-mono text-xl font-bold text-amber">3</p><p className="font-mono text-[8px] text-muted2">NEARBY</p></div>
            <div><p className="font-mono text-xl font-bold text-green">247</p><p className="font-mono text-[8px] text-muted2">RELAYS</p></div>
            <div><p className="font-mono text-xl font-bold text-amber">0%</p><p className="font-mono text-[8px] text-muted2">BATTERY</p></div>
          </div>
        </div>
        <div className="h-8"/>
      </div>
    </div>
  );
}
