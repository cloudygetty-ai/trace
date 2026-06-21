import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn } from '../components';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [chipId, setChipId] = useState('');
  const [nfcSupported] = useState('NDEFReader' in window);
  const { showToast } = useStore();
  const nav = useNavigate();

  const startScan = async () => {
    if (!nfcSupported) {
      showToast('Web NFC not supported on this device — enter chip ID manually below');
      return;
    }
    setScanning(true);
    setNotFound(false);
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      ndef.onreading = ({ message }: any) => {
        for (const record of message.records) {
          if (record.recordType === 'url') {
            const url = new TextDecoder().decode(record.data);
            const id = url.split('/c/')[1];
            if (id) lookup(id);
          } else if (record.recordType === 'text') {
            const text = new TextDecoder().decode(record.data);
            if (/^\d{15}$/.test(text.trim())) lookup(text.trim());
          }
        }
      };
      ndef.onreadingerror = () => {
        setScanning(false);
        showToast('Could not read chip — try again or enter ID manually');
      };
    } catch (e: any) {
      setScanning(false);
      showToast(e.message?.includes('permission') ? 'NFC permission denied' : 'NFC scan failed — enter ID manually');
    }
  };

  const lookup = async (id: string) => {
    setScanning(true);
    setNotFound(false);
    try {
      const data = await api.lookupChip(id.replace(/\s/g, ''));
      setResult(data);
      showToast('✓ Chip found · ' + data.name);
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Scan Chip" back/>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5 items-center">
        <p className="font-sans text-sm text-muted text-center max-w-[260px] leading-relaxed">
          {nfcSupported
            ? "Hold your phone to the dog's left shoulder blade within 1–5cm."
            : "Your browser doesn't support NFC scanning. Enter the chip ID manually below."}
        </p>

        {nfcSupported && (
          <div onClick={startScan}
            className={"w-full max-w-xs border-2 rounded-2xl py-10 flex flex-col items-center gap-4 cursor-pointer transition-all " +
              (scanning ? 'border-amber border-solid bg-amber/5 animate-pulse' :
               result ? 'border-green/50 border-solid bg-green/5' :
               'border-amber/30 border-dashed bg-surface')}>
            <div className={"w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl transition-all " +
              (scanning ? 'border-amber' : result ? 'border-green' : 'border-amber/20')}>
              {result ? '✓' : '📶'}
            </div>
            <p className={"font-mono text-xs tracking-[.08em] " + (scanning ? 'text-amber' : result ? 'text-green' : 'text-muted')}>
              {scanning ? 'SCANNING...' : result ? '✓ CHIP DETECTED' : 'TAP TO SCAN'}
            </p>
          </div>
        )}

        {result && (
          <div className="w-full max-w-xs bg-green/5 border border-green/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🐕</span>
              <div className="flex-1">
                <p className="font-display text-lg font-bold text-text">{result.name}</p>
                <p className="font-mono text-[10px] text-green">{result.chip_id}</p>
              </div>
              <span className={"font-mono text-[9px] px-2 py-1 rounded-md " +
                (result.status==='lost' ? 'bg-warn/10 text-warn border border-warn/30' : 'bg-green/10 text-green border border-green/30')}>
                {result.status?.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="font-mono text-[8px] text-muted uppercase">Breed</p><p className="font-semibold text-text mt-0.5">{result.breed || '—'}</p></div>
              <div><p className="font-mono text-[8px] text-muted uppercase">Contact</p><p className="font-semibold text-amber mt-0.5">{result.contact || 'Not provided'}</p></div>
            </div>
            <div className="flex gap-2">
              <Btn full sm onClick={() => { api.reportScan({ chip_id: result.chip_id, source:'nfc' }); showToast('✓ Owner notified'); }}>Report Sighting</Btn>
              {result.contact && <Btn sm variant="ghost" onClick={() => window.location.href = `tel:${result.contact}`}>📞 Call</Btn>}
            </div>
          </div>
        )}

        {notFound && (
          <div className="w-full max-w-xs bg-warn/5 border border-warn/25 rounded-2xl p-4 text-center">
            <p className="font-sans text-sm text-warn font-semibold">Chip not found</p>
            <p className="font-sans text-xs text-muted mt-1">This chip ID isn't registered in TRACE.</p>
          </div>
        )}

        <div className="w-full max-w-xs bg-surface border border-amber/15 rounded-2xl p-4">
          <p className="font-mono text-[9px] text-muted mb-3 uppercase tracking-[.08em]">Enter chip ID manually</p>
          <div className="flex gap-2">
            <input value={chipId} onChange={e => setChipId(e.target.value)} placeholder="985000012384721" maxLength={15}
              className="flex-1 bg-wood3/40 border border-amber/20 rounded-xl px-3 py-2.5 text-sm font-mono text-text outline-none focus:border-amber"/>
            <Btn sm onClick={() => lookup(chipId)} disabled={chipId.length !== 15}>Go</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
