import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn } from '../components';

export default function FoundDog() {
  const { chipId } = useParams();
  const [id, setId] = useState(chipId ?? '');
  const [result, setResult] = useState<any>(null);
  const { showToast } = useStore();

  const lookup = async () => {
    try {
      const data = await api.lookupChip(id.replace(/\s/g,''));
      setResult(data);
    } catch {
      setResult({ name:'Luna', chip_id:id, status:'lost', breed:'Husky Mix', contact:'(201) 555-0192', owner:'Getty C.' });
      showToast('Demo result for ' + id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Found a Dog?" back/>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        <div className="glass-card border-2 border-dashed border-[#2c3540] rounded-2xl py-10 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => showToast('Hold phone to left shoulder blade...')}>
          <span className="text-5xl">📶</span>
          <p className="font-mono text-xs tracking-[.1em] text-muted2">TAP NFC CHIP</p>
          <p className="text-xs text-muted2 text-center max-w-[200px] leading-relaxed">No app needed — hold phone to dog's shoulder</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border"/>
          <span className="font-mono text-[9px] text-muted2 tracking-[.1em]">OR ENTER ID</span>
          <div className="flex-1 h-px bg-border"/>
        </div>
        <div className="flex gap-2">
          <input value={id} onChange={e=>setId(e.target.value)} placeholder="985000012384721"
            className="flex-1 glass-card border border-[#2c3540] rounded-xl px-3.5 py-3 text-sm font-mono text-amber outline-none focus:border-amber placeholder:text-muted tracking-[.06em]"/>
          <Btn sm onClick={lookup}>Find</Btn>
        </div>
        {result && (
          <div className="bg-green/5 border border-green/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐕</span>
              <div className="flex-1">
                <p className="text-lg font-bold">{result.name}</p>
                <p className="font-mono text-[10px] text-green">{result.chip_id}</p>
              </div>
              <span className="bg-warn/10 text-warn border border-warn/30 font-mono text-[9px] px-2 py-1 rounded-md">{result.status?.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="font-mono text-[8px] text-muted2 uppercase">Breed</p><p className="font-semibold mt-0.5">{result.breed}</p></div>
              <div><p className="font-mono text-[8px] text-muted2 uppercase">Owner</p><p className="font-semibold mt-0.5">{result.owner}</p></div>
              <div><p className="font-mono text-[8px] text-muted2 uppercase">Contact</p><p className="font-semibold mt-0.5 text-amber">{result.contact}</p></div>
            </div>
            <div className="flex gap-2">
              <Btn full sm onClick={() => { api.reportScan({chip_id:result.chip_id,source:'nfc'}); showToast('✓ Owner notified'); }}>Report I Found Her</Btn>
              <Btn sm variant="ghost" onClick={() => showToast('Calling...')}>📞 Call</Btn>
            </div>
          </div>
        )}
        <div className="glass-card border border-amber/10 rounded-2xl overflow-hidden">
          <p className="px-4 py-3 text-xs font-semibold text-muted2 border-b border-amber/10">If dog has no chip</p>
          <button className="w-full px-4 py-3.5 text-left text-sm border-b border-amber/10 flex items-center gap-3" onClick={() => showToast('Sighting reporter opened')}>
            <span>📷</span> Report by description + photo
          </button>
          <button className="w-full px-4 py-3.5 text-left text-sm flex items-center gap-3" onClick={() => showToast('Bergen County Animal Shelter · 0.4 mi')}>
            <span>🏥</span> Find nearest shelter
          </button>
        </div>
      </div>
    </div>
  );
}
