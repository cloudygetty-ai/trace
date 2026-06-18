import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  { emoji:'🐾', title:'Never Lose Your Dog Again', body:'TRACE combines ACCT microchips, BLE relay mesh, community sightings, and emergency broadcasts into one recovery system.' },
  { emoji:'💾', title:'ACCT Chip Technology',      body:"Your dog's ACCT chip has a globally unique 15-digit ISO 11784 ID. Any NFC phone tap surfaces your contact — no app needed." },
  { emoji:'📡', title:'Community Relay Mesh',      body:'Every TRACE user passively relays signals from lost dogs nearby. Silent, automatic, zero battery impact.' },
  { emoji:'🚨', title:'Emergency Broadcasts',      body:'Partner with local PD to push WEA alerts to every phone in the search zone — same system as Amber Alerts.' },
];

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const nav = useNavigate();
  const s = SLIDES[slide];
  const last = slide === SLIDES.length - 1;

  return (
    <div className="flex flex-col h-full" style={{background:'linear-gradient(160deg,#fdf0d5 0%,#fdf6ee 60%,#fff8f0 100%)'}}>
      {/* Subtle wood grain lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{background:'repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(180,120,40,.04) 80px,rgba(180,120,40,.04) 81px)'}}/>

      {/* Decorative paws */}
      <div className="absolute top-10 left-8 text-4xl opacity-[.07] -rotate-12 pointer-events-none">🐾</div>
      <div className="absolute top-24 right-10 text-3xl opacity-[.06] rotate-12 pointer-events-none">🐾</div>
      <div className="absolute bottom-36 left-14 text-3xl opacity-[.06] rotate-6 pointer-events-none">🐾</div>
      <div className="absolute top-40 left-6 text-2xl opacity-[.05] -rotate-6 pointer-events-none">🐕</div>
      <div className="absolute bottom-44 right-8 text-2xl opacity-[.05] rotate-8 pointer-events-none">🐩</div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-7 relative z-10">
        {/* Card */}
        <div className="bg-surface/80 rounded-3xl p-8 w-full max-w-xs shadow-[0_8px_32px_rgba(150,90,20,.12)] border"
          style={{borderColor:'rgba(180,120,40,.18)',backdropFilter:'blur(8px)'}}>
          <div className="text-[68px] mb-4" style={{filter:'drop-shadow(0 4px 12px rgba(217,119,6,.2))'}}>
            {s.emoji}
          </div>
          <h1 className="font-display text-[22px] font-bold text-text leading-tight mb-3">{s.title}</h1>
          <p className="font-sans text-sm text-muted leading-relaxed">{s.body}</p>
        </div>
        <div className="flex items-center gap-2">
          {SLIDES.map((_,i) => (
            <div key={i} onClick={() => setSlide(i)}
              className={"h-2 rounded-full transition-all cursor-pointer " + (i===slide?'bg-amber w-6':'bg-wood2 w-2')}/>
          ))}
        </div>
      </div>

      <div className="px-6 pb-10 flex flex-col gap-3 relative z-10">
        <button onClick={() => last ? nav('/login') : setSlide(s=>s+1)}
          className="h-13 w-full bg-amber text-white font-display font-bold text-base rounded-2xl tracking-wide shadow-[0_4px_16px_rgba(217,119,6,.3)] active:scale-[.98] transition-all"
          style={{height:52}}>
          {last ? 'Get Started →' : 'Next →'}
        </button>
        {!last && (
          <button onClick={() => nav('/login')} className="font-mono text-[10px] text-muted tracking-widest text-center py-2">SKIP</button>
        )}
      </div>
    </div>
  );
}
