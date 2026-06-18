import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TopHeader } from '../components';

export default function MapScreen() {
  const { activeDog, sightings, fetchSightings } = useStore();
  const nav = useNavigate();

  useEffect(() => {
    if (activeDog) fetchSightings(activeDog.id);
  }, [activeDog?.id]);

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title={activeDog ? activeDog.name + "'s Map" : 'Map'} back
        action="1.0 mi ▾" onAction={() => {}}/>
      <div className="flex-1 relative overflow-hidden bg-[#090c0b]">
        <svg width="100%" height="100%" viewBox="0 0 430 520" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="rg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e0ff" stopOpacity=".07"/>
              <stop offset="100%" stopColor="#00e0ff" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="430" height="520" fill="#090c0b"/>
          <rect x="20" y="20" width="90" height="60" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="20" y="100" width="70" height="80" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="20" y="200" width="90" height="60" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="20" y="280" width="70" height="80" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="140" y="20" width="80" height="60" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="140" y="100" width="100" height="80" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="150" y="300" width="110" height="120" rx="4" fill="#101a12"/>
          <rect x="280" y="20" width="90" height="60" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="280" y="100" width="70" height="80" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <rect x="290" y="200" width="90" height="60" rx="3" fill="#0e1412" stroke="#1a2018" strokeWidth=".5"/>
          <line x1="0" y1="170" x2="430" y2="170" stroke="#182018" strokeWidth="3"/>
          <line x1="0" y1="290" x2="430" y2="290" stroke="#182018" strokeWidth="2"/>
          <line x1="120" y1="0" x2="120" y2="520" stroke="#182018" strokeWidth="3"/>
          <line x1="270" y1="0" x2="270" y2="520" stroke="#182018" strokeWidth="2"/>
          <circle cx="215" cy="250" r="145" fill="url(#rg)" stroke="#00e0ff" strokeWidth="1" strokeDasharray="5 4" opacity=".6"/>
          <circle cx="215" cy="248" r="9" fill="#00e0ff" opacity=".9"/>
          <circle cx="215" cy="248" r="11" fill="none" stroke="#00e0ff" strokeWidth="1.5" opacity=".6">
            <animate attributeName="r" values="10;26;10" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".8;0;.8" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="155" cy="345" r="7" fill="#a78bfa" opacity=".8"/>
          <circle cx="185" cy="170" r="7" fill="#a78bfa" opacity=".65"/>
          <circle cx="255" cy="300" r="7" fill="#00e0ff" opacity=".6"/>
          <polygon points="115,145 125,165 105,165" fill="#ffb400" opacity=".9">
            <animate attributeName="opacity" values="1;.3;1" dur="1.5s" repeatCount="indefinite"/>
          </polygon>
          <text x="205" y="385" fontFamily="Space Grotesk" fontSize="10" fill="#1e3a20" fontWeight="600" textAnchor="middle">RIVERSIDE PARK</text>
          <text x="214" y="163" fontFamily="Space Mono" fontSize="8" fill="#1e2a1e" textAnchor="middle">MAIN ST</text>
        </svg>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className="bg-[rgba(12,15,16,.88)] border border-amber/10 rounded-xl p-2.5 px-3 backdrop-blur-md">
            <p className="font-mono text-lg font-bold text-warn leading-none">4</p>
            <p className="font-mono text-[8px] text-muted2 tracking-[.06em] mt-1">SIGHTINGS</p>
          </div>
          <div className="bg-[rgba(12,15,16,.88)] border border-amber/10 rounded-xl p-2.5 px-3 backdrop-blur-md">
            <p className="font-mono text-lg font-bold text-amber leading-none">2m</p>
            <p className="font-mono text-[8px] text-muted2 tracking-[.06em] mt-1">LAST SEEN</p>
          </div>
        </div>
      </div>
      <div className="glass-card border-t border-amber/10 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🐕</span>
          <p className="text-sm font-semibold flex-1">{activeDog?.name ?? 'Luna'} — <span className="text-warn text-xs">LOST</span></p>
          <button onClick={() => nav('/broadcast')} className="h-9 px-4 bg-transparent border border-amber/10 rounded-xl font-mono text-[9px] text-muted2">📢 Broadcast</button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {[['bg-amber','BLE relay'],['bg-purple-400','Community'],['bg-amber-400','Last seen']].map(([c,l]) => (
            <div key={l} className="glass-card border border-amber/10 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
              <div className={"w-1.5 h-1.5 rounded-full " + c}/>
              <span className="text-[11px] text-cream">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
