import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn, Toggle } from '../components';
import PhotoUpload from '../components/PhotoUpload';

export default function ReportSighting() {
  const { dogId } = useParams();
  const nav = useNavigate();
  const { showToast } = useStore();
  const [loc, setLoc] = useState('');
  const [desc, setDesc] = useState('');
  const [when, setWhen] = useState('');
  const [useGPS, setUseGPS] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      let lat: number | undefined, lng: number | undefined;
      if (useGPS && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
          lat = pos.coords.latitude; lng = pos.coords.longitude;
        } catch { /* fall through without coords */ }
      }
      await api.reportSighting({
        dog_id: dogId, lat: lat ?? 40.7128, lng: lng ?? -74.006,
        source: 'human', description: desc, location_text: loc, photo_url: photoUrl,
      });
      showToast('✓ Sighting reported — owner notified');
      nav(-1);
    } catch (e: any) {
      showToast(e.message ?? 'Failed to report sighting');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Report Sighting" back/>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <div className="bg-surface border border-amber/15 rounded-2xl p-4 flex gap-3 items-center">
          <span className="text-3xl">🐕</span>
          <div>
            <p className="font-display text-base font-bold text-text">Lost Dog</p>
            <p className="font-sans text-xs text-muted">Help reunite this dog with their owner</p>
          </div>
        </div>

        <PhotoUpload bucket="sighting-photos" onUploaded={setPhotoUrl} label="ADD PHOTO OF DOG"/>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted">Where did you see the dog?</label>
          <input value={loc} onChange={e=>setLoc(e.target.value)} placeholder="Corner of Oak & 4th St"
            className="bg-surface border border-amber/20 rounded-xl text-sm text-text px-3.5 py-3 outline-none focus:border-amber placeholder:text-muted/50"/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted">What was the dog doing?</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Running east on Oak St, appeared calm..." rows={2}
            className="bg-surface border border-amber/20 rounded-xl text-sm text-text px-3.5 py-3 outline-none focus:border-amber placeholder:text-muted/50 resize-none"/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted">When?</label>
          <input value={when} onChange={e=>setWhen(e.target.value)} placeholder="Just now / 10 minutes ago..."
            className="bg-surface border border-amber/20 rounded-xl text-sm text-text px-3.5 py-3 outline-none focus:border-amber placeholder:text-muted/50"/>
        </div>
        <div className="bg-surface border border-amber/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <p className="font-sans text-sm font-medium text-text">Use my current location</p>
            <p className="font-sans text-[11px] text-muted mt-0.5">Adds precise GPS location to the report</p>
          </div>
          <Toggle on={useGPS} onToggle={() => setUseGPS(v=>!v)}/>
        </div>
        <div className="bg-amber/8 border-l-2 border-amber rounded-r-xl p-3 text-[11px] text-text/80 leading-relaxed">
          🔒 <strong>Privacy:</strong> Your identity is never shared. Only location and time are sent to the owner.
        </div>
        <Btn full onClick={submit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Sighting →'}</Btn>
      </div>
    </div>
  );
}
