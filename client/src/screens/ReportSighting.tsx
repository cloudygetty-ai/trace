import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn, Toggle } from '../components';

export default function ReportSighting() {
  const { dogId } = useParams();
  const nav = useNavigate();
  const { showToast } = useStore();
  const [loc, setLoc] = useState('');
  const [desc, setDesc] = useState('');
  const [when, setWhen] = useState('');
  const [useGPS, setUseGPS] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.reportSighting({ dog_id: dogId, location_text: loc, description: desc, when, use_gps: useGPS });
      showToast('✓ Sighting reported — owner notified');
      nav(-1);
    } catch {
      showToast('✓ Sighting filed (demo)');
      nav(-1);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Report Sighting" back/>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-s1 border border-border rounded-2xl p-4 flex gap-3 items-center">
          <span className="text-3xl">🐕</span>
          <div>
            <p className="text-base font-bold">Luna</p>
            <p className="text-xs text-muted2">Husky Mix · Grey & white · Blue eyes</p>
            <p className="font-mono text-[9px] text-warn mt-1.5">MISSING SINCE 8:30 AM TODAY</p>
          </div>
        </div>
        <div className="bg-s2 border-[1.5px] border-dashed border-[#2c3540] rounded-2xl h-28 flex flex-col items-center justify-center gap-2 cursor-pointer active:border-cyan"
          onClick={() => showToast('Camera opened')}>
          <span className="text-3xl">📷</span>
          <p className="font-mono text-[9px] text-muted2 tracking-[.06em]">ADD PHOTO OF DOG</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted2">Where did you see the dog?</label>
          <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Corner of Oak & 4th St"
            className="bg-s2 border border-[#2c3540] rounded-xl text-sm text-text px-3.5 py-3 outline-none focus:border-cyan placeholder:text-muted"/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted2">What was the dog doing?</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Running east on Oak St, appeared calm..." rows={2}
            className="bg-s2 border border-[#2c3540] rounded-xl text-sm text-text px-3.5 py-3 outline-none focus:border-cyan placeholder:text-muted resize-none"/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted2">When?</label>
          <input value={when} onChange={e=>setWhen(e.target.value)} placeholder="Just now / 10 minutes ago..."
            className="bg-s2 border border-[#2c3540] rounded-xl text-sm text-text px-3.5 py-3 outline-none focus:border-cyan placeholder:text-muted"/>
        </div>
        <div className="bg-s2 border border-[#2c3540] rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <p className="text-sm font-medium">Use my current location</p>
            <p className="text-[11px] text-muted2 mt-0.5">Adds precise location to the report</p>
          </div>
          <Toggle on={useGPS} onToggle={() => setUseGPS(v=>!v)}/>
        </div>
        <div className="bg-cyan/5 border-l-2 border-cyan rounded-r-xl p-3 text-[11px] text-cyan/70 leading-relaxed">
          🔒 <strong className="text-text">Privacy:</strong> Your identity is never shared. Only location and time are sent to the owner.
        </div>
        <Btn full onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Sighting →'}</Btn>
      </div>
    </div>
  );
}
