import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn } from '../components';

export default function FoundDog() {
  const { chipId } = useParams();
  const [id, setId] = useState(chipId ?? '');
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useStore();

  const lookup = async () => {
    if (id.replace(/\s/g,'').length !== 15) { showToast('Chip ID must be 15 digits'); return; }
    setLoading(true);
    setNotFound(false);
    try {
      const data = await api.lookupChip(id.replace(/\s/g,''));
      setResult(data);
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Found a Dog?" back/>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        <div className="bg-wood3/30 border-2 border-dashed border-amber/30 rounded-2xl py-10 flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => showToast("Hold phone to dog's left shoulder blade")}>
          <span className="text-5xl">📶</span>
          <p className="font-mono text-xs tracking-[.1em] text-muted">TAP NFC CHIP</p>
          <p className="font-sans text-xs text-muted text-center max-w-[200px] leading-relaxed">No app needed — hold phone to dog's shoulder</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-amber/15"/>
          <span className="font-mono text-[9px] text-muted tracking-[.1em]">OR ENTER ID</span>
          <div className="flex-1 h-px bg-amber/15"/>
        </div>
        <div className="flex gap-2">
          <input value={id} onChange={e=>setId(e.target.value)} placeholder="985000012384721" maxLength={15}
            className="flex-1 bg-surface border border-amber/20 rounded-xl px-3.5 py-3 text-sm font-mono text-amber outline-none focus:border-amber placeholder:text-muted/50 tracking-[.06em]"/>
          <Btn sm onClick={lookup} disabled={loading}>{loading ? '...' : 'Find'}</Btn>
        </div>

        {result && (
          <div className="bg-green/5 border border-green/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐕</span>
              <div className="flex-1">
                <p className="font-display text-lg font-bold text-text">{result.name}</p>
                <p className="font-mono text-[10px] text-green">{result.chip_id}</p>
              </div>
              <span className="bg-warn/10 text-warn border border-warn/30 font-mono text-[9px] px-2 py-1 rounded-md">{result.status?.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="font-mono text-[8px] text-muted uppercase">Breed</p><p className="font-semibold text-text mt-0.5">{result.breed || '—'}</p></div>
              <div><p className="font-mono text-[8px] text-muted uppercase">Owner</p><p className="font-semibold text-text mt-0.5">{result.owner || 'Owner'}</p></div>
              <div className="col-span-2"><p className="font-mono text-[8px] text-muted uppercase">Contact</p><p className="font-semibold text-amber mt-0.5">{result.contact || 'Not provided — file a sighting instead'}</p></div>
            </div>
            <div className="flex gap-2">
              <Btn full sm onClick={() => { api.reportScan({chip_id:result.chip_id,source:'nfc'}); showToast('✓ Owner notified'); }}>Report I Found Her</Btn>
              {result.contact && <Btn sm variant="ghost" onClick={() => window.location.href = `tel:${result.contact}`}>📞 Call</Btn>}
            </div>
          </div>
        )}

        {notFound && (
          <div className="bg-warn/5 border border-warn/25 rounded-2xl p-4 text-center">
            <p className="font-sans text-sm text-warn font-semibold">No match found</p>
            <p className="font-sans text-xs text-muted mt-1">This chip isn't registered in TRACE yet. Try a shelter scan or file a description-based report.</p>
          </div>
        )}

        <div className="bg-surface border border-amber/15 rounded-2xl overflow-hidden">
          <p className="px-4 py-3 text-xs font-semibold text-muted border-b border-amber/10">If dog has no chip</p>
          <button className="w-full px-4 py-3.5 text-left text-sm border-b border-amber/10 flex items-center gap-3 text-text" onClick={() => showToast('Use Report Sighting from the dog\'s page, or Community tab')}>
            <span>📷</span> Report by description + photo
          </button>
          <button className="w-full px-4 py-3.5 text-left text-sm flex items-center gap-3 text-text" onClick={() => showToast('Shelter directory coming soon')}>
            <span>🏥</span> Find nearest shelter
          </button>
        </div>
      </div>
    </div>
  );
}
