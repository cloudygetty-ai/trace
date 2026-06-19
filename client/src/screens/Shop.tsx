import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn } from '../components';

const PLANS = [
  {
    key: 'passive', name: 'ACCT Passive', price: 24.99,
    desc: 'NFC + RFID · No battery · Lifetime', icon: '💾',
    features: ['Vet scanner compatible', 'NFC tap-to-web', 'No battery, never dies', 'Standard ISO 11784/11785'],
  },
  {
    key: 'active', name: 'ACCT Active', price: 59.99,
    desc: 'NFC + RFID + BLE · 3yr battery', icon: '📡',
    features: ['Everything in Passive', 'BLE relay mesh tracking', 'Real-time community pings', '3-year battery life'],
    badge: 'RECOMMENDED',
  },
];

export default function Shop() {
  const nav = useNavigate();
  const { dogs, showToast } = useStore();
  const [selected, setSelected] = useState<'passive'|'active'>('passive');
  const [dogId, setDogId] = useState(dogs[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<any>(null);

  useEffect(() => {
    api.getShopCatalog?.().then(setCatalog).catch(() => {});
  }, []);

  const buy = async () => {
    setLoading(true);
    try {
      const res = await api.createCheckout(selected, dogId || undefined);
      if (res.url) {
        window.location.href = res.url;
      } else {
        showToast(res.error ?? 'Checkout unavailable');
      }
    } catch (e: any) {
      showToast(e.message ?? 'Checkout failed — payments not yet configured');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Order ACCT Chip" back action="My Orders" onAction={() => nav('/orders')}/>
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        <div className="bg-amber/8 border border-amber/20 rounded-2xl p-4">
          <p className="font-sans text-[13px] text-text leading-relaxed">
            🐾 Ships in 2–3 business days. Once your dog's chip arrives, enter the 15-digit ID in the app
            or have your vet scan it during implantation — it auto-registers to TRACE.
          </p>
        </div>

        {PLANS.map(p => (
          <div key={p.key} onClick={() => setSelected(p.key as any)}
            className={"relative bg-surface border-2 rounded-2xl p-5 cursor-pointer transition-all paw-bg " +
              (selected === p.key ? 'border-amber shadow-[0_4px_20px_rgba(217,119,6,.15)]' : 'border-amber/15')}>
            {p.badge && (
              <span className="absolute -top-2.5 right-4 bg-amber text-white font-mono text-[8px] px-2.5 py-1 rounded-full tracking-wider">
                {p.badge}
              </span>
            )}
            <div className="flex items-start gap-3">
              <span className="text-3xl">{p.icon}</span>
              <div className="flex-1">
                <p className="font-display text-lg font-bold text-text">{p.name}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{p.desc}</p>
              </div>
              <p className="font-mono text-xl font-bold text-amber">${p.price}</p>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <span className="text-green text-xs">✓</span>
                  <span className="font-sans text-[12px] text-muted">{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {dogs.length > 0 && (
          <div className="bg-surface border border-amber/15 rounded-2xl p-4">
            <label className="font-mono text-[9px] uppercase tracking-[.12em] text-muted">Assign to dog (optional)</label>
            <select value={dogId} onChange={e => setDogId(e.target.value)}
              className="w-full mt-2 bg-wood3/40 border border-amber/15 rounded-xl px-3 py-2.5 text-sm text-text font-sans outline-none">
              <option value="">— No dog selected yet —</option>
              {dogs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        <Btn full onClick={buy} disabled={loading}>
          {loading ? 'Redirecting to checkout...' : `Buy Now — $${PLANS.find(p=>p.key===selected)?.price} →`}
        </Btn>
        <p className="font-sans text-[11px] text-muted text-center leading-relaxed">
          Secure checkout via Stripe. Free shipping on all orders.
        </p>
      </div>
    </div>
  );
}
