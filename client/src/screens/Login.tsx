import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { FormInput, Btn } from '../components';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useStore();
  const nav = useNavigate();

  const submit = async () => {
    setErr(''); setLoading(true);
    try { await signIn(email, pw); nav('/home'); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-bg px-7">
      <div className="flex flex-col items-center pt-16 pb-10 gap-2">
        <div className="text-[52px] drop-shadow-[0_0_20px_rgba(0,224,255,.3)]">🐾</div>
        <div className="font-mono text-[28px] font-bold tracking-[.12em] text-cyan">TRACE</div>
        <div className="text-sm text-muted2 text-center mt-1">Tracker · Relay · Alert · Community · Chip</div>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        <FormInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <FormInput label="Password" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)}/>
        {err && <p className="text-warn text-xs font-mono">{err}</p>}
        <Btn full onClick={submit} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Btn>
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-border"/><span className="font-mono text-[9px] text-muted tracking-widest">OR</span><div className="flex-1 h-px bg-border"/>
        </div>
        <Btn full variant="ghost" onClick={() => useStore.getState().showToast('Apple sign-in coming soon')}>🍎  Continue with Apple</Btn>
        <Btn full variant="ghost" onClick={() => useStore.getState().showToast('Google sign-in coming soon')}>📧  Continue with Google</Btn>
      </div>
      <div className="text-center text-sm text-muted2 mb-8 mt-6">
        No account?{' '}
        <Link to="/signup" className="text-cyan">Sign up</Link>
      </div>
    </div>
  );
}
