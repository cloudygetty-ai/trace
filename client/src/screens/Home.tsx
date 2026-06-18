import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { StatusPill, SectionHeader, DogAvatar } from '../components';

const QUICK = [
  { icon:'🗺️', label:'MAP',       path:'/map' },
  { icon:'🚨', label:'REPORT',    path:'/report' },
  { icon:'📡', label:'SCAN NFC',  path:'/scan' },
  { icon:'📢', label:'BROADCAST', path:'/broadcast' },
  { icon:'📋', label:'POSTER',    path:'/poster' },
  { icon:'🔍', label:'FOUND DOG', path:'/found' },
  { icon:'💾', label:'CHIPS',     path:'/chips' },
  { icon:'⚙️', label:'SETTINGS',  path:'/settings' },
];

export default function Home() {
  const { user, dogs, fetchDogs } = useStore();
  const nav = useNavigate();
  const lostDog = dogs.find(d => d.status === 'lost');

  useEffect(() => { fetchDogs(); }, []);

  const firstName = user?.user_metadata?.first_name ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 bg-s1 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <span className="font-mono text-sm font-bold tracking-[.1em] text-cyan">TRACE</span>
        <div className="flex-1"/>
        <button onClick={() => nav('/notifications')} className="w-10 h-10 rounded-xl bg-s2 border border-border flex items-center justify-center text-lg">🔔</button>
        <button onClick={() => nav('/settings')} className="w-10 h-10 rounded-xl bg-s2 border border-border flex items-center justify-center text-lg ml-2">👤</button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-4 py-5 bg-gradient-to-b from-cyan/[.06] to-transparent">
          <p className="text-sm text-muted2">Good morning,</p>
          <h1 className="text-2xl font-bold mt-0.5 capitalize">{firstName} 👋</h1>
          <p className="text-sm text-muted2 mt-1">{dogs.length} dog{dogs.length !== 1 ? 's' : ''} registered{lostDog ? ' · 1 active alert' : ''}</p>
        </div>

        {/* Lost banner */}
        {lostDog && (
          <div onClick={() => nav('/map')}
            className="mx-4 mb-4 bg-warn/10 border border-warn/40 rounded-2xl p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-2.5 h-2.5 rounded-full bg-warn flex-shrink-0 animate-pulse"/>
            <div className="flex-1">
              <p className="text-sm font-semibold text-warn">🚨 {lostDog.name} is missing</p>
              <p className="text-xs text-muted2 mt-1">Alert active — tap for live map</p>
            </div>
            <span className="text-muted2">›</span>
          </div>
        )}

        {/* Dogs */}
        <SectionHeader title="My Dogs" action="+ Add" onAction={() => nav('/add-dog')}/>
        <div className="px-4 flex flex-col gap-3">
          {dogs.length === 0 ? (
            <div className="bg-s1 border border-border rounded-2xl p-6 text-center">
              <p className="text-muted2 text-sm">No dogs yet.</p>
              <button onClick={() => nav('/add-dog')} className="mt-3 font-mono text-xs text-cyan tracking-widest">+ Add Your Dog</button>
            </div>
          ) : dogs.map(dog => (
            <div key={dog.id} onClick={() => nav('/dog/'+dog.id)}
              className={"bg-s1 border rounded-2xl p-4 flex gap-3.5 cursor-pointer active:scale-[.98] transition-all " +
                (dog.status === 'lost' ? 'border-warn/30 bg-gradient-to-br from-warn/5 to-s1' : 'border-border')}>
              <DogAvatar photoUrl={dog.photo_url} size={14}/>
              <div className="flex-1">
                <p className="text-base font-bold">{dog.name}</p>
                <p className="text-xs text-muted2 mt-0.5">{dog.breed} · {dog.age}</p>
                {dog.chip_id && <p className="font-mono text-[9px] text-cyan mt-1.5 tracking-[.06em]">ACCT {dog.chip_id.replace(/(.{3})(.{3})(.{3})(.{3})(.{3})/, '$1 $2 $3 $4 $5')}</p>}
                <div className="mt-2"><StatusPill status={dog.status}/></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <SectionHeader title="Quick Actions"/>
        <div className="px-4 grid grid-cols-4 gap-2.5 pb-6">
          {QUICK.map(q => (
            <button key={q.path} onClick={() => nav(q.path)}
              className="bg-s2 border border-border rounded-2xl py-3 px-2 flex flex-col items-center gap-1.5 active:scale-95 transition-all">
              <span className="text-[22px]">{q.icon}</span>
              <span className="font-mono text-[8px] text-muted2 tracking-[.04em]">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
