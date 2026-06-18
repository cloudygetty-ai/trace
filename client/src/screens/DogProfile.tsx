import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { TopHeader, StatusPill, Field, Btn, DogAvatar } from '../components';

export default function DogProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { dogs, setActiveDog, markFound, reportLost, showToast } = useStore();
  const dog = dogs.find(d => d.id === id) ?? dogs[0];

  useEffect(() => { if (dog) setActiveDog(dog); }, [dog?.id]);
  if (!dog) return null;

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title={dog.name + "'s Profile"} back action="Edit" onAction={() => showToast('Edit mode')}/>
      <div className="flex-1 overflow-y-auto">
        <div className={"px-4 py-6 flex flex-col items-center gap-3 bg-gradient-to-b to-transparent " + (dog.status==='lost' ? 'from-warn/5' : 'from-cyan/5')}>
          <DogAvatar photoUrl={dog.photo_url} size={24}/>
          <h1 className="text-2xl font-bold">{dog.name}</h1>
          <p className="text-sm text-muted2">{dog.breed} · {dog.age}</p>
          {dog.chip_id && <p className="font-mono text-[10px] text-amber tracking-[.08em]">ACCT · {dog.chip_id.match(/.{1,3}/g)?.join(' ')}</p>}
          <StatusPill status={dog.status}/>
        </div>
        <Field label="Color" value={dog.color}/>
        <Field label="Chip type" value={dog.chip_type === 'active' ? 'ACCT Active (BLE + NFC)' : 'ACCT Passive (NFC)'}/>
        <Field label="Sighting link" value={"trace.app/r/"+dog.id.slice(0,8)}/>
        <div className="flex gap-2.5 flex-wrap px-4 py-4">
          <Btn sm variant="ghost" onClick={() => nav('/map')}>🗺️ Map</Btn>
          <Btn sm variant="ghost" onClick={() => nav('/poster/'+dog.id)}>📋 Poster</Btn>
          <Btn sm variant="ghost" onClick={() => nav('/broadcast/'+dog.id)}>📢 Alert</Btn>
          {dog.status === 'lost'
            ? <Btn sm variant="green" onClick={() => markFound(dog.id)}>✓ Found!</Btn>
            : <Btn sm variant="warn" onClick={() => { reportLost(dog.id, 'Unknown'); }}>🚨 Report Lost</Btn>
          }
        </div>
      </div>
    </div>
  );
}
