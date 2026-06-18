import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { FormInput, Btn } from '../components';
import { TopHeader } from '../components';

export default function Signup() {
  const [f, setF] = useState({ firstName:'', lastName:'', email:'', phone:'', pw:'', zip:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useStore();
  const nav = useNavigate();

  const set = (k: string) => (e: any) => setF(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      await signUp(f.email, f.pw, { first_name: f.firstName, last_name: f.lastName, phone: f.phone, zip: f.zip });
      nav('/add-dog');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Create Account" back/>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="First name" placeholder="Getty" value={f.firstName} onChange={set('firstName')}/>
          <FormInput label="Last name" placeholder="Cloud" value={f.lastName} onChange={set('lastName')}/>
        </div>
        <FormInput label="Email" type="email" placeholder="you@example.com" value={f.email} onChange={set('email')}/>
        <FormInput label="Phone (for SMS alerts)" type="tel" placeholder="+1 (201) 555-0100" value={f.phone} onChange={set('phone')}/>
        <FormInput label="Password" type="password" placeholder="••••••••" value={f.pw} onChange={set('pw')}/>
        <FormInput label="Zip code" placeholder="07601" value={f.zip} onChange={set('zip')}/>
        <div className="bg-amber/5 border-l-2 border-amber rounded-r-xl p-3 text-[11px] text-amber/70 leading-relaxed">
          <strong className="text-cream">Community relay:</strong> TRACE passively detects lost dogs via BLE. You can disable this in Settings.
        </div>
        {err && <p className="text-warn text-xs font-mono">{err}</p>}
        <Btn full onClick={submit} disabled={loading}>{loading ? 'Creating account...' : 'Create Account →'}</Btn>
        <p className="text-[11px] text-muted2 text-center leading-relaxed">
          By signing up you agree to the Terms of Service.<br/>TRACE never sells your data.
        </p>
      </div>
    </div>
  );
}
