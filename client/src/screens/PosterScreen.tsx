import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store';
import { TopHeader, Btn } from '../components';
import PosterCard, { type Rendition } from '../components/PosterCard';
import { api } from '../lib/api';
import { posterGaps, shareText, toPosterModel, type PosterModel } from '../lib/poster';

const RENDITIONS: { key: Rendition; label: string; hint: string }[] = [
  { key: 'signal', label: 'Signal', hint: 'For screens — share, post, broadcast' },
  { key: 'print', label: 'Print', hint: 'For paper — high contrast, ink-light' },
];

export default function PosterScreen() {
  const { dogId } = useParams();
  const { dogs, activeDog, showToast } = useStore();
  const dog = dogs.find((d) => d.id === dogId) ?? activeDog ?? dogs.find((d) => d.status === 'lost') ?? dogs[0];

  const [rendition, setRendition] = useState<Rendition>('signal');
  const [model, setModel] = useState<PosterModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The poster is only as good as the report behind it — always fetch fresh.
  useEffect(() => {
    if (!dog?.id) return;
    let live = true;
    setError(null);
    api.getPosterData(dog.id)
      .then((payload) => { if (live) setModel(toPosterModel(payload)); })
      .catch((e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [dog?.id]);

  const gaps = useMemo(() => (model ? posterGaps(model) : null), [model]);

  async function share() {
    if (!model) return;
    const text = shareText(model);
    if (navigator.share) {
      try { await navigator.share({ title: `Lost dog: ${model.name}`, text, url: model.reportUrl }); return; }
      catch { /* dismissed — fall through to clipboard */ }
    }
    await navigator.clipboard?.writeText(text);
    showToast('🔗 Alert copied');
  }

  // Print rendition + @media print stylesheet = a real PDF via the browser,
  // with web fonts intact. No canvas rasteriser, no dependency.
  function download() {
    setRendition('print');
    requestAnimationFrame(() => window.print());
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Missing Poster" back action="↓ Print" onAction={download} />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 print:p-0 print:overflow-visible">
        <div className="flex gap-2 print:hidden">
          {RENDITIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setRendition(r.key)}
              className={`flex-1 rounded-xl px-3 py-2 text-left transition-all border ${
                rendition === r.key
                  ? 'border-amber bg-amber/10 text-amber'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              <span className="block font-mono text-[10px] tracking-[.16em] uppercase">{r.label}</span>
              <span className="block text-[10px] mt-0.5 opacity-70 leading-tight">{r.hint}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="font-mono text-[11px] text-warn bg-warn/10 border border-warn/30 rounded-xl p-3 print:hidden">
            Could not load poster data — {error}
          </p>
        )}

        {gaps && (gaps.contact || gaps.photo || gaps.lastSeen) && (
          <div className="rounded-xl border border-amber/40 bg-amber/5 p-3 print:hidden">
            <p className="font-mono text-[9px] tracking-[.16em] uppercase text-amber">Before you print</p>
            <ul className="mt-1.5 text-[11px] text-muted leading-relaxed list-disc pl-4">
              {gaps.contact && <li>No contact number — add one in Settings, or nobody can reach you.</li>}
              {gaps.photo && <li>No photo on file — a poster without one is far less effective.</li>}
              {gaps.lastSeen && <li>No last-seen location on the active report.</li>}
            </ul>
          </div>
        )}

        <div className="flex justify-center print:block" id="poster-sheet">
          {model
            ? <PosterCard model={model} rendition={rendition} width={340} className="shadow-xl print-poster" />
            : !error && <div className="h-[425px] w-[340px] rounded-2xl bg-surface border border-border animate-pulse" />}
        </div>

        <div className="flex gap-3 print:hidden">
          <Btn full variant="ghost" onClick={share}>🔗 Share Alert</Btn>
          <Btn full onClick={download}>↓ Print / PDF</Btn>
        </div>
      </div>
    </div>
  );
}
