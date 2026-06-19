import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useStore } from '../store';
import { TopHeader, Btn, FormInput } from '../components';

const STATUS_LABEL: Record<string,string> = {
  pending: 'Awaiting payment', paid: 'Processing', shipped: 'Shipped',
  delivered: 'Delivered', registered: 'Registered', cancelled: 'Cancelled', refunded: 'Refunded',
};
const STATUS_COLOR: Record<string,string> = {
  pending: 'text-muted', paid: 'text-amber', shipped: 'text-amber',
  delivered: 'text-green', registered: 'text-green', cancelled: 'text-warn', refunded: 'text-warn',
};

export default function Orders() {
  const nav = useNavigate();
  const { showToast } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [chipInput, setChipInput] = useState('');

  const load = () => api.getOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const register = async (orderId: string) => {
    if (!/^\d{15}$/.test(chipInput)) { showToast('Chip ID must be 15 digits'); return; }
    try {
      await api.registerOrderChip(orderId, chipInput);
      showToast('✓ Chip registered to your dog');
      setRegistering(null); setChipInput('');
      load();
    } catch (e: any) {
      showToast(e.message ?? 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="My Orders" back action="+ Order" onAction={() => nav('/shop')}/>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          <p className="font-sans text-sm text-muted text-center py-8">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="bg-surface border border-amber/15 rounded-2xl p-8 text-center paw-bg">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-display text-base text-text font-semibold">No orders yet</p>
            <p className="font-sans text-sm text-muted mt-1 mb-4">Order an ACCT chip for your dog</p>
            <Btn onClick={() => nav('/shop')}>Browse Chips →</Btn>
          </div>
        ) : orders.map(o => (
          <div key={o.id} className="bg-surface border border-amber/15 rounded-2xl p-4 paw-bg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-bold text-text">
                  {o.chip_type === 'active' ? 'ACCT Active' : 'ACCT Passive'}
                </p>
                <p className="font-mono text-[10px] text-muted mt-0.5">
                  ${(o.price_cents/100).toFixed(2)} · {new Date(o.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`font-mono text-[9px] uppercase tracking-wider ${STATUS_COLOR[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
            </div>
            {o.chip_id && (
              <p className="font-mono text-[10px] text-amber mt-2 tracking-[.06em]">
                {o.chip_id.match(/.{1,3}/g)?.join(' ')}
              </p>
            )}
            {(o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered') && !o.chip_id && (
              registering === o.id ? (
                <div className="mt-3 flex gap-2">
                  <input value={chipInput} onChange={e=>setChipInput(e.target.value)} placeholder="15-digit chip ID"
                    className="flex-1 bg-wood3/40 border border-amber/20 rounded-xl px-3 py-2 text-xs font-mono text-text outline-none"/>
                  <Btn sm onClick={() => register(o.id)}>Save</Btn>
                </div>
              ) : (
                <button onClick={() => setRegistering(o.id)}
                  className="mt-3 font-mono text-[10px] text-amber tracking-wide">
                  Chip arrived? Enter ID →
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
