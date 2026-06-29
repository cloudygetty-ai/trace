import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, FormInput, Btn } from '../components';
import PhotoUpload from '../components/PhotoUpload';

export default function AddDog() {
  const [f, setF] = useState({ name:'', breed:'', age:'', color:'', chip_id:'', chip_type:'' as ''|'passive'|'active' });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchDogs, showToast } = useStore();
  const nav = useNavigate();
  const set = (k: string) => (e: any) => setF(p => ({...p, [k]: e.target.value}));

  const submit = async () => {
    if (!f.name) { showToast('Dog name required'); return; }
    setLoading(true);
    try {
      await api.createDog({ ...f, chip_type: f.chip_type || null, chip_id: f.chip_id || null, photo_url: photoUrl });
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
        <div className="text-center py-2">
          <p className="font-display text-xl font-bold text-text">Add Your Dog</p>
          <p className="font-sans text-sm text-muted mt-1">You can update details anytime</p>
        </div>

        <PhotoUpload bucket="dog-photos" onUploaded={setPhotoUrl} label="ADD A PHOTO"/>

        <FormInput label="Dog's name" placeholder="Luna" value={f.name} onChange={set('name')}/>
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Breed" placeholder="Husky Mix" value={f.breed} onChange={set('breed')}/>
          <FormInput label="Age" placeholder="3 years" value={f.age} onChange={set('age')}/>
        </div>
        <FormInput label="Color / markings" placeholder="Grey & white, blue eyes" value={f.color} onChange={set('color')}/>

        <div className="bg-amber/8 border border-amber/20 rounded-2xl p-4">
          <p className="font-display text-sm font-semibold text-text mb-1">Chip ID (optional)</p>
          <p className="font-sans text-[11px] text-muted mb-3 leading-relaxed">
            If your vet implanted a microchip, enter the 15-digit ID from your paperwork.
            You can add this later in Settings.
          </p>
          <FormInput label="ACCT chip ID — 15 digits" placeholder="985000012384721"
            value={f.chip_id} onChange={set('chip_id')} className="font-mono tracking-[.06em]"/>
          {f.chip_id.length > 0 && (
            <div className="flex gap-2 mt-3">
              {(['passive','active'] as const).map(type => (
                <div key={type} onClick={() => setF(p => ({...p, chip_type: type}))}
                  className={"flex-1 border rounded-xl p-2.5 cursor-pointer transition-all text-center " +
                    (f.chip_type===type ? 'border-amber bg-surface' : 'border-amber/15 bg-surface/50')}>
                  <p className="text-xs font-semibold text-text capitalize">{type}</p>
                  <p className="text-[10px] text-muted mt-0.5">{type==='passive' ? 'NFC + RFID' : 'NFC + BLE'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Btn full onClick={submit} disabled={loading}>{loading ? 'Adding...' : 'Add Dog →'}</Btn>
        <Btn full variant="ghost" onClick={() => nav('/home')}>Skip for now</Btn>
      </div>
    </div>
  );
}
