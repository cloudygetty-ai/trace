import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { TopHeader, Btn } from '../components';

export default function ShopSuccess() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = params.get('session_id');

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    api.getCheckoutSession(sessionId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Order Confirmed" logo/>
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center text-center gap-5">
        <div className="w-20 h-20 bg-green/10 border-2 border-green/30 rounded-full flex items-center justify-center text-4xl">
          🐾
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-text">You're all set!</h1>
          <p className="font-sans text-sm text-muted mt-2 max-w-xs leading-relaxed">
            {loading ? 'Confirming your order...' :
              order ? `Your ${order.chip_type === 'active' ? 'ACCT Active' : 'ACCT Passive'} chip is on its way.` :
              'Your order has been placed.'}
          </p>
        </div>

        <div className="bg-surface border border-amber/15 rounded-2xl p-5 w-full max-w-xs text-left flex flex-col gap-3">
          {[
            ['📦', 'Ships within', '2–3 business days'],
            ['📬', 'Tracking', 'Emailed once shipped'],
            ['🐕', 'Next step', 'Enter chip ID in app on arrival'],
          ].map(([icon, label, val]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <div>
                <p className="font-mono text-[8px] text-muted uppercase tracking-wider">{label}</p>
                <p className="font-sans text-sm text-text mt-0.5">{val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          <Btn full onClick={() => nav('/orders')}>View My Orders</Btn>
          <Btn full variant="ghost" onClick={() => nav('/home')}>Back to Home</Btn>
        </div>
      </div>
    </div>
  );
}
