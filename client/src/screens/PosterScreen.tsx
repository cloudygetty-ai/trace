import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { TopHeader, Btn } from '../components';

export default function PosterScreen() {
  const { dogId } = useParams();
  const { dogs, activeDog, showToast } = useStore();
  const dog = dogs.find(d => d.id === dogId) ?? activeDog ?? dogs.find(d => d.status==='lost') ?? dogs[0];

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Missing Poster" back action="↓ PDF" onAction={() => showToast('Downloading PDF...')}/>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl overflow-hidden font-sans text-black shadow-xl">
          <div className="bg-[#111] px-5 py-4">
            <p className="font-mono text-xs font-bold tracking-[.18em] text-red-500">⚠ MISSING DOG</p>
            <p className="text-2xl font-bold text-white mt-1">{dog?.name?.toUpperCase() ?? 'LUNA'}</p>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl flex-shrink-0">🐕</div>
              <div>
                <div className="mb-2"><p className="font-mono text-[8px] uppercase tracking-[.1em] text-gray-400">Breed & Age</p><p className="text-sm font-semibold text-gray-900">{dog?.breed ?? 'Husky Mix'}, {dog?.age ?? '3 years'}</p></div>
                <div><p className="font-mono text-[8px] uppercase tracking-[.1em] text-gray-400">Color / Markings</p><p className="text-sm font-semibold text-gray-900">{dog?.color ?? 'Grey & white, blue eyes'}</p></div>
              </div>
            </div>
            <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-3">
              <p className="font-mono text-[9px] text-orange-500 uppercase tracking-[.1em]">Last seen</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">Riverside Park, Main St</p>
              <p className="text-xs text-gray-500 mt-0.5">June 17, 2026 · 8:30 AM</p>
            </div>
            <div className="bg-[#111] rounded-xl p-3 flex justify-between items-center">
              <div><p className="font-mono text-[8px] text-gray-500 uppercase">Reward</p><p className="text-xl font-bold text-[#4eff91] font-mono">$200</p></div>
              <div className="text-right"><p className="font-mono text-[8px] text-gray-500">Scan to report</p><p className="text-[10px] text-amber-400 font-mono mt-0.5">trace.app/r/{dog?.id?.slice(0,8) ?? 'luna-nj'}</p></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
              <div><p className="font-mono text-[8px] uppercase tracking-[.08em] text-gray-400">Call if you see {dog?.name ?? 'Luna'}</p><p className="text-lg font-bold text-gray-900 font-mono">(201) 555-0192</p></div>
              <div className="text-xs text-gray-500 text-right">She's friendly.<br/>Don't chase.</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Btn full variant="ghost" onClick={() => { navigator.clipboard?.writeText('https://trace.app/r/luna-nj-8734'); showToast('🔗 Link copied'); }}>🔗 Share Link</Btn>
          <Btn full onClick={() => showToast('Downloading PDF...')}>↓ Download</Btn>
        </div>
      </div>
    </div>
  );
}
