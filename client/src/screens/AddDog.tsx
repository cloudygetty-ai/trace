import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, FormInput, Btn } from '../components';

export default function AddDog() {
  const [f, setF] = useState({ name:'', breed:'', age:'', color:'', chip_id:'', chip_type:'' as ''|'passive'|'active' });
  const [hasChip, setHasChip] = useState<'yes'|'no'|null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchDogs, showToast } = useStore();
  const nav = useNavigate();
  const set = (k: string) => (e: any) => setF(p => ({...p, [k]: e.target.value}));

  const submit = async () => {
    if (!f.name) { showToast('Dog name required'); return; }
    setLoading(true);
    try {
      const payload = { ...f, chip_type: f.chip_type || null, chip_id: f.chip_id || null };
      await api.createDog(payload);
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
          <p className="font-display text-xl font-bold text-text">Add Your Dog</p>
          <p className="font-sans text-sm text-muted mt-1">You can add more dogs later</p>
        </div>

        <FormInput label="Dog's name" placeholder="Luna" value={f.name} onChange={set('name')}/>
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="Breed" placeholder="Husky Mix" value={f.breed} onChange={set('breed')}/>
          <FormInput label="Age" placeholder="3 years" value={f.age} onChange={set('age')}/>
        </div>
        <FormInput label="Color / markings" placeholder="Grey & white, blue eyes" value={f.color} onChange={set('color')}/>

        {/* ─── Chip question — resolves "where do chips come from" ─── */}
        <div className="bg-amber/8 border border-amber/20 rounded-2xl p-4 mt-2">
          <p className="font-display text-sm font-semibold text-text mb-1">Does {f.name || 'your dog'} already have a chip?</p>
          <p className="font-sans text-[11px] text-muted mb-3 leading-relaxed">
            ACCT chips are implanted by a vet. If yours already has one, enter the ID below. If not, you can order one.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setHasChip('yes')}
              className={"border rounded-xl p-3 text-left transition-all " + (hasChip==='yes' ? 'border-amber bg-surface' : 'border-amber/15 bg-surface/50')}>
              <p className="text-sm font-semibold text-text">✓ Yes, has one</p>
              <p className="text-[10px] text-muted mt-0.5">Enter existing ID</p>
            </button>
            <button onClick={() => setHasChip('no')}
              className={"border rounded-xl p-3 text-left transition-all " + (hasChip==='no' ? 'border-amber bg-surface' : 'border-amber/15 bg-surface/50')}>
              <p className="text-sm font-semibold text-text">Not yet</p>
              <p className="text-[10px] text-muted mt-0.5">Order one — from $24.99</p>
            </button>
          </div>
        </div>

        {hasChip === 'yes' && (
          <div className="flex flex-col gap-3 animate-[fadeUp_.2s_ease]">
            <FormInput label="ACCT chip ID (15 digits, from vet paperwork)" placeholder="985000012384721"
              value={f.chip_id} onChange={set('chip_id')} className="font-mono tracking-[.06em]"/>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] uppercase tracking-[.12em] text-muted">Chip type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['passive','active'] as const).map(type => (
                  <div key={type} onClick={() => setF(p => ({...p, chip_type: type}))}
                    className={"border rounded-xl p-3 cursor-pointer transition-all " + (f.chip_type===type ? 'border-amber bg-surface' : 'border-amber/15 bg-surface/50')}>
                    <p className="text-sm font-semibold text-text capitalize">{type}</p>
                    <p className="text-[10px] text-muted mt-1">{type==='passive' ? 'NFC + RFID' : 'NFC + RFID + BLE'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasChip === 'no' && (
          <div className="bg-surface border border-amber/15 rounded-2xl p-4 text-center animate-[fadeUp_.2s_ease]">
            <p className="font-sans text-sm text-text mb-1">No problem — add {f.name || 'your dog'} now,</p>
            <p className="font-sans text-sm text-muted mb-3">then order a chip from the shop.</p>
            <button onClick={() => nav('/shop')} className="font-mono text-[10px] text-amber tracking-wide border border-amber/30 px-4 py-2 rounded-lg">
              Preview Chip Options →
            </button>
          </div>
        )}

        <Btn full onClick={submit} disabled={loading}>{loading ? 'Adding...' : 'Add Dog →'}</Btn>
        <Btn full variant="ghost" onClick={() => nav('/home')}>Skip for now</Btn>
      </div>
    </div>
  );
}
