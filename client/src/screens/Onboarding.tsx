import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  { emoji:'🐾', title:'Never Lose Your Dog Again', body:'TRACE combines ACCT microchips, BLE relay mesh, community sightings, and WEA emergency broadcasts into one unified recovery system.' },
  { emoji:'💾', title:'ACCT Chip Technology', body:"Your dog's implanted ACCT chip has a globally unique ISO 11784 ID. Any NFC phone tap or vet scanner instantly surfaces your contact info — no app needed." },
  { emoji:'📡', title:'Community Relay Mesh', body:'Every TRACE install becomes a passive relay node. When a lost dog is nearby, it silently reports location — no interaction required from the stranger.' },
  { emoji:'🚨', title:'Emergency Broadcasts', body:'Partner with local PD to send WEA alerts to every phone in the search area. The same system as Amber Alerts — for your dog.' },
];

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const nav = useNavigate();
  const s = SLIDES[slide];
  const last = slide === SLIDES.length - 1;

  return (
    <div className="flex flex-col h-full bg-bg px-7">
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
        <div className="text-[72px] drop-shadow-[0_0_20px_rgba(0,224,255,.25)]">{s.emoji}</div>
        <h1 className="text-2xl font-bold leading-tight">{s.title}</h1>
        <p className="text-sm text-muted2 leading-relaxed max-w-[300px]">{s.body}</p>
      </div>
      <div className="flex items-center gap-3 mb-5">
        {SLIDES.map((_,i) => (
          <div key={i} className={"h-2 rounded-full transition-all " + (i===slide ? 'bg-cyan w-6' : 'bg-s3 w-2')}/>
        ))}
      </div>
      <div className="flex flex-col gap-3 mb-8">
        <button onClick={() => last ? nav('/login') : setSlide(s => s+1)}
          className="h-12 w-full bg-cyan text-[#04090c] font-mono font-bold text-sm rounded-xl tracking-widest">
          {last ? 'Get Started →' : 'Next'}
        </button>
        {!last && (
          <button onClick={() => nav('/login')} className="font-mono text-[10px] text-muted2 tracking-widest">
            SKIP
          </button>
        )}
      </div>
    </div>
  );
}
