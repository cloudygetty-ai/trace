import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { FormInput, Btn } from '../components';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw]       = useState('');
  const [err, setErr]     = useState('');
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
    <div className="flex flex-col h-full" style={{background:'linear-gradient(160deg,#2e1f0e,#1a1208 40%,#0f0b05)'}}>
      <div className="absolute inset-0 pointer-events-none"
        style={{background:'repeating-linear-gradient(88deg,transparent,transparent 3px,rgba(255,200,80,.018) 3px,rgba(255,200,80,.018) 4px)'}}/>

      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-8 gap-3 relative z-10">
        <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center text-4xl border-2 border-amber/20 shadow-[0_8px_32px_rgba(0,0,0,.4)]"
          style={{filter:'drop-shadow(0 0 16px rgba(240,168,48,.2))'}}>
          🐾
        </div>
        <div className="font-display text-3xl font-bold tracking-wide text-amber">TRACE</div>
        <div className="font-sans text-sm text-muted text-center">Tracker · Relay · Alert · Community · Chip</div>
      </div>

      {/* Form card */}
      <div className="flex-1 mx-5 relative z-10">
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-4 shadow-[0_8px_40px_rgba(0,0,0,.5)]">
          <FormInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          <FormInput label="Password" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)}/>
          {err && <p className="text-warn text-xs font-mono">{err}</p>}
          <Btn full onClick={submit} disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</Btn>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-amber/10"/>
            <span className="font-mono text-[9px] text-muted tracking-widest">OR</span>
            <div className="flex-1 h-px bg-amber/10"/>
          </div>
          <Btn full variant="ghost" onClick={() => useStore.getState().showToast('Apple sign-in coming soon')}>
            🍎  Continue with Apple
          </Btn>
        </div>
      </div>

      <div className="text-center font-sans text-sm text-muted mb-8 mt-4 relative z-10">
        No account?{' '}
        <Link to="/signup" className="text-amber font-semibold">Sign up free</Link>
      </div>
    </div>
  );
}
