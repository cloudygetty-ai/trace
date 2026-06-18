import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { StatusPill, SectionHeader, DogAvatar } from '../components';

const QUICK = [
  { icon:'🗺️', label:'Live Map',    path:'/map',       color:'from-amber/20' },
  { icon:'🚨', label:'Lost Dog',    path:'/report',    color:'from-warn/20' },
  { icon:'📶', label:'Scan Chip',   path:'/scan',      color:'from-amber/15' },
  { icon:'📢', label:'Broadcast',   path:'/broadcast', color:'from-paw/20' },
  { icon:'📋', label:'Poster',      path:'/poster',    color:'from-amber/15' },
  { icon:'🔍', label:'Found One',   path:'/found',     color:'from-green/15' },
  { icon:'💾', label:'Chips',       path:'/chips',     color:'from-amber/15' },
  { icon:'⚙️', label:'Settings',    path:'/settings',  color:'from-wood3/40' },
];

export default function Home() {
  const { user, dogs, fetchDogs } = useStore();
  const nav = useNavigate();
  const lostDog = dogs.find(d => d.status === 'lost');

  useEffect(() => { fetchDogs(); }, []);

  const firstName = user?.user_metadata?.first_name ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="wood-frame flex items-center px-5 flex-shrink-0" style={{minHeight:64}}>
        <div className="flex-1">
          <span className="font-display text-xl font-bold tracking-wide text-amber">TRACE</span>
          <p className="font-mono text-[8px] text-muted tracking-[.1em] mt-0.5">TRACKER · RELAY · ALERT · COMMUNITY · CHIP</p>
        </div>
        <button onClick={() => nav('/notifications')}
          className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-lg mr-2">🔔</button>
        <button onClick={() => nav('/settings')}
          className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-lg">👤</button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero greeting */}
        <div className="px-5 py-5 paw-bg bg-gradient-to-b from-wood2/60 to-transparent">
          <p className="font-sans text-sm text-muted">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold text-cream mt-0.5 capitalize">{firstName} 🐾</h1>
          <p className="font-sans text-sm text-muted mt-1">
            {dogs.length} dog{dogs.length !== 1 ? 's' : ''} registered
            {lostDog ? <span className="text-warn ml-2">· 1 active alert</span> : ''}
          </p>
        </div>

        {/* Lost banner */}
        {lostDog && (
          <div onClick={() => nav('/map')}
            className="mx-4 mb-3 bg-warn/10 border border-warn/30 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[.99] transition-all shadow-[0_4px_20px_rgba(224,80,80,.15)]">
            <div className="w-2.5 h-2.5 rounded-full bg-warn flex-shrink-0 animate-[pulse-amber_1.2s_ease_infinite]"/>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-warn">🚨 {lostDog.name} is missing</p>
              <p className="font-sans text-xs text-muted mt-0.5">Alert active — tap to see live map</p>
            </div>
            <span className="text-muted text-lg">›</span>
          </div>
        )}

        {/* Dogs */}
        <SectionHeader title="My Dogs" action="+ Add Dog" onAction={() => nav('/add-dog')}/>
        <div className="px-4 flex flex-col gap-3">
          {dogs.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center paw-bg">
              <div className="text-5xl mb-3">🐕</div>
              <p className="font-display text-base text-cream font-semibold">No dogs yet</p>
              <p className="font-sans text-sm text-muted mt-1 mb-4">Add your dog to get started</p>
              <button onClick={() => nav('/add-dog')}
                className="bg-amber text-wood1 font-sans font-semibold text-sm px-5 py-2.5 rounded-xl">
                Add Your Dog →
              </button>
            </div>
          ) : dogs.map(dog => (
            <div key={dog.id} onClick={() => nav('/dog/'+dog.id)}
              className={"glass-card rounded-2xl p-4 flex gap-3.5 cursor-pointer active:scale-[.98] transition-all paw-bg " +
                (dog.status === 'lost' ? 'border-warn/30 shadow-[0_4px_20px_rgba(224,80,80,.1)]' : 'amber-glow')}>
              <DogAvatar photoUrl={dog.photo_url} size={14}/>
              <div className="flex-1">
                <p className="font-display text-base font-bold text-cream">{dog.name}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{dog.breed} · {dog.age}</p>
                {dog.chip_id && (
                  <p className="font-mono text-[9px] text-amber mt-1.5 tracking-[.06em]">
                    ACCT · {dog.chip_id.match(/.{1,3}/g)?.join(' ')}
                  </p>
                )}
                <div className="mt-2"><StatusPill status={dog.status}/></div>
              </div>
              <span className="text-muted self-center">›</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <SectionHeader title="Quick Actions"/>
        <div className="px-4 grid grid-cols-4 gap-2.5 pb-8">
          {QUICK.map(q => (
            <button key={q.path} onClick={() => nav(q.path)}
              className={`glass-card rounded-2xl py-3.5 px-2 flex flex-col items-center gap-2 active:scale-95 transition-all bg-gradient-to-b ${q.color} to-transparent`}>
              <span className="text-[22px]">{q.icon}</span>
              <span className="font-mono text-[8px] text-muted tracking-[.04em] text-center leading-tight">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
