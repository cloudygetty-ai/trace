import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    emoji: '🐾',
    title: 'Never Lose Your Dog Again',
    body: 'TRACE combines ACCT microchips, BLE relay mesh, community sightings, and emergency broadcasts into one unified recovery system.',
    accent: '#f0a830',
  },
  {
    emoji: '💾',
    title: 'ACCT Chip Technology',
    body: "Your dog's ACCT chip has a globally unique ISO 11784 ID. Any NFC phone tap or vet scanner instantly surfaces your contact — no app needed.",
    accent: '#f0a830',
  },
  {
    emoji: '📡',
    title: 'Community Relay Mesh',
    body: 'Every TRACE install becomes a passive relay node. When a lost dog is nearby, it silently reports location — no interaction required.',
    accent: '#e8764a',
  },
  {
    emoji: '🚨',
    title: 'Emergency Broadcasts',
    body: 'Partner with local PD to send WEA alerts to every phone in the search area — the same system as Amber Alerts, for your dog.',
    accent: '#f0a830',
  },
];

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const nav = useNavigate();
  const s = SLIDES[slide];
  const last = slide === SLIDES.length - 1;

  return (
    <div className="flex flex-col h-full bg-bg" style={{
      background: 'linear-gradient(160deg, #2e1f0e 0%, #1a1208 50%, #0f0b05 100%)'
    }}>
      {/* Wood grain overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{background: 'repeating-linear-gradient(88deg, transparent, transparent 3px, rgba(255,200,80,.018) 3px, rgba(255,200,80,.018) 4px)'}}/>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 px-8 relative z-10">
        {/* Paw print decorations */}
        <div className="absolute top-12 left-8 text-3xl opacity-10 rotate-[-20deg]">🐾</div>
        <div className="absolute top-20 right-10 text-2xl opacity-8 rotate-[15deg]">🐾</div>
        <div className="absolute bottom-32 left-12 text-2xl opacity-8 rotate-[10deg]">🐾</div>

        {/* Glass panel card */}
        <div className="glass-card rounded-3xl p-8 w-full max-w-xs shadow-[0_8px_40px_rgba(0,0,0,.5)] border border-amber/10">
          <div className="text-[72px] mb-4" style={{filter:'drop-shadow(0 0 20px rgba(240,168,48,.3))'}}>
            {s.emoji}
          </div>
          <h1 className="font-display text-2xl font-bold text-cream leading-tight mb-3">{s.title}</h1>
          <p className="font-sans text-sm text-muted leading-relaxed">{s.body}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_,i) => (
            <div key={i} onClick={() => setSlide(i)}
              className={"h-2 rounded-full transition-all cursor-pointer " +
                (i===slide ? 'bg-amber w-6' : 'bg-wood3 w-2')}/>
          ))}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-6 pb-10 flex flex-col gap-3 relative z-10">
        <button onClick={() => last ? nav('/login') : setSlide(s => s+1)}
          className="h-13 w-full bg-amber text-wood1 font-display font-bold text-base rounded-2xl tracking-wide shadow-[0_4px_20px_rgba(240,168,48,.35)] active:scale-[.98] transition-all"
          style={{height:52}}>
          {last ? 'Find Your Dog →' : 'Next →'}
        </button>
        {!last && (
          <button onClick={() => nav('/login')} className="font-mono text-[10px] text-muted tracking-widest text-center py-2">
            SKIP
          </button>
        )}
      </div>
    </div>
  );
}
