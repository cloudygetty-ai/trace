import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, FormInput, Btn } from '../components';

export default function AddDog() {
  const [f, setF] = useState({ name:'', breed:'', age:'', color:'', chip_id:'', chip_type:'passive' as 'passive'|'active' });
  const [loading, setLoading] = useState(false);
  const { fetchDogs, showToast } = useStore();
  const nav = useNavigate();
  const set = (k: string) => (e: any) => setF(p => ({...p, [k]: e.target.value}));

  const submit = async () => {
    if (!f.name) { showToast('Dog name required'); return; }
    setLoading(true);
    try {
      await api.createDog(f);
      await fetchDogs();
      showToast('🐕 ' + f.name + ' added!');
      nav('/home');
    } catch (e: any) {
      showToast(e.message ?? 'Error adding dog');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Add Your Dog" back/>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🐕</div>
          <p className="text-xl font-bold">Add Your Dog</p>
          <p className="text-sm text-muted mt-1">You can add more dogs later</p>
        </div>
        <FormInput label="Dog's name" placeholder="Luna" value={f.name} onChange={set('name')}/>
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Breed" placeholder="Husky Mix" value={f.breed} onChange={set('breed')}/>
          <FormInput label="Age" placeholder="3 years" value={f.age} onChange={set('age')}/>
        </div>
        <FormInput label="Color / markings" placeholder="Grey & white, blue eyes" value={f.color} onChange={set('color')}/>
        <FormInput label="ACCT chip ID (from vet)" placeholder="985000012384721" value={f.chip_id} onChange={set('chip_id')} className="font-mono tracking-[.06em]"/>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted">Chip type</label>
          <div className="grid grid-cols-2 gap-3">
            {(['passive','active'] as const).map(type => (
              <div key={type} onClick={() => setF(p => ({...p, chip_type:type}))}
                className={"border rounded-xl p-3 cursor-pointer transition-all " + (f.chip_type===type ? 'border-amber bg-amber/5' : 'border-amber/15 bg-surface border border-amber/15 rounded-2xl')}>
                <p className="text-sm font-semibold capitalize">{type}</p>
                <p className="text-[10px] text-muted mt-1">{type==='passive' ? 'NFC + RFID · No battery' : 'NFC + RFID + BLE · 3yr battery'}</p>
                <p className="font-mono text-[10px] text-amber mt-1">{type==='passive' ? '$24.99' : '$59.99'}</p>
              </div>
            ))}
          </div>
        </div>
        <Btn full onClick={submit} disabled={loading}>{loading ? 'Adding...' : 'Add Dog →'}</Btn>
        <Btn full variant="ghost" onClick={() => nav('/home')}>Skip for now</Btn>
      </div>
    </div>
  );
}
