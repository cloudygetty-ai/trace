import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn, FormInput } from '../components';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [chipId, setChipId] = useState('');
  const { showToast } = useStore();
  const nav = useNavigate();

  const startScan = async () => {
    setScanning(true);
    // Web NFC API
    if ('NDEFReader' in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        ndef.onreading = ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === 'url') {
              const url = new TextDecoder().decode(record.data);
              const id = url.split('/c/')[1];
              if (id) lookup(id);
            }
          }
        };
      } catch { showToast('NFC unavailable — enter ID manually'); setScanning(false); }
    } else {
      // Simulate for demo
      setTimeout(() => { lookup('985000012384721'); }, 2000);
    }
  };

  const lookup = async (id: string) => {
    try {
      const data = await api.lookupChip(id.replace(/\s/g,''));
      setResult(data); setScanning(false);
      showToast('✓ Chip read · ' + id);
    } catch {
      setResult({ demo: true, name:'Luna', chip_id:id, status:'lost', breed:'Husky Mix', contact:'(201) 555-0192' });
      setScanning(false);
      showToast('✓ Demo chip: Luna');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="NFC Scanner" back/>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5 items-center">
        <p className="text-sm text-muted text-center max-w-[260px] leading-relaxed">
          Hold your phone to the dog's left shoulder blade within 1–5cm.
        </p>
        <div onClick={startScan}
          className={"w-full max-w-xs border-2 rounded-2xl py-10 flex flex-col items-center gap-4 cursor-pointer transition-all " +
            (scanning ? 'border-amber border-solid bg-amber/5 animate-pulse' : result ? 'border-green/50 border-solid bg-green/5' : 'border-[#2c3540] border-dashed bg-surface border border-amber/15 rounded-2xl')}>
          <div className={"w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl transition-all " +
            (scanning ? 'border-amber' : result ? 'border-green' : 'border-[#2c3540]')}>
            {result ? '✓' : '📶'}
          </div>
          <p className={"font-mono text-xs tracking-[.08em] " + (scanning ? 'text-amber' : result ? 'text-green' : 'text-muted')}>
            {scanning ? 'SCANNING...' : result ? '✓ CHIP DETECTED' : 'TAP TO SCAN'}
          </p>
        </div>

        {result && (
          <div className="w-full max-w-xs bg-green/5 border border-green/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐕</span>
              <div className="flex-1">
                <p className="text-lg font-bold">{result.name}</p>
                <p className="font-mono text-[10px] text-green">{result.chip_id}</p>
              </div>
              <span className={"font-mono text-[9px] px-2 py-1 rounded-md " + (result.status==='lost' ? 'bg-warn/10 text-warn border border-warn/30' : 'bg-green/10 text-green border border-green/30')}>{result.status?.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="font-mono text-[8px] text-muted uppercase">Breed</p><p className="font-semibold mt-0.5">{result.breed ?? 'Husky Mix'}</p></div>
              <div><p className="font-mono text-[8px] text-muted uppercase">Contact</p><p className="font-semibold mt-0.5 text-amber">{result.contact ?? '(201) 555-0192'}</p></div>
            </div>
            <div className="flex gap-2">
              <Btn full sm onClick={() => { api.reportScan({ chip_id: result.chip_id, source:'nfc' }); showToast('✓ Sighting reported'); }}>Report Sighting</Btn>
              <Btn sm variant="ghost" onClick={() => showToast('Calling...')}>📞 Call</Btn>
            </div>
          </div>
        )}

        <div className="w-full max-w-xs bg-surface border border-amber/15 rounded-2xl border border-amber/15 rounded-2xl p-4">
          <p className="font-mono text-[9px] text-muted mb-3 uppercase tracking-[.08em]">Or enter chip ID</p>
          <div className="flex gap-2">
            <input value={chipId} onChange={e => setChipId(e.target.value)} placeholder="985000012384721"
              className="flex-1 bg-surface border border-amber/15 rounded-2xl border border-[#2c3540] rounded-xl px-3 py-2.5 text-sm font-mono text-amber outline-none focus:border-amber"/>
            <Btn sm onClick={() => lookup(chipId)}>Go</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
