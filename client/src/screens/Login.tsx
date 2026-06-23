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
    <div className="flex flex-col h-full" style={{background:'linear-gradient(160deg,#fdf0d5,#fdf6ee 50%,#fffaf3)'}}>
      <div className="absolute inset-0 pointer-events-none"
        style={{background:'repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(180,120,40,.035) 80px,rgba(180,120,40,.035) 81px)'}}/>

      {/* Playful paws */}
      <div className="absolute top-16 right-10 text-3xl opacity-[.07] rotate-12 pointer-events-none">🐾</div>
      <div className="absolute bottom-32 left-8 text-2xl opacity-[.06] -rotate-10 pointer-events-none">🐾</div>

      <div className="flex flex-col items-center pt-14 pb-8 gap-3 relative z-10">
        <div className="w-20 h-20 bg-amber/15 rounded-3xl flex items-center justify-center text-4xl border-2 border-amber/25 shadow-md">
          🐾
        </div>
        <div className="font-display text-3xl font-bold tracking-wide text-amber mt-1">TRACE</div>
        <div className="font-sans text-sm text-muted text-center">Find your dog. Every time.</div>
      </div>

      <div className="flex-1 mx-5 relative z-10">
        <div className="bg-surface/85 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_4px_24px_rgba(150,90,20,.1)] border"
          style={{borderColor:'rgba(180,120,40,.18)',backdropFilter:'blur(8px)'}}>
          <FormInput label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          <FormInput label="Password" type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)}/>
          {err && <p className="text-warn text-xs font-mono bg-warn/8 px-3 py-2 rounded-lg">{err}</p>}
          <div className="text-right"><button onClick={() => nav('/forgot-password')} className="font-mono text-[10px] text-muted tracking-wide">Forgot password?</button></div>
          <Btn full onClick={submit} disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</Btn>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{background:'rgba(180,120,40,.15)'}}/>
            <span className="font-mono text-[9px] text-muted tracking-widest">OR</span>
            <div className="flex-1 h-px" style={{background:'rgba(180,120,40,.15)'}}/>
          </div>
          <Btn full variant="ghost" onClick={() => useStore.getState().showToast('Apple sign-in coming soon')}>🍎  Continue with Apple</Btn>
        </div>
      </div>

      <div className="text-center font-sans text-sm text-muted mb-8 mt-4 relative z-10">
        No account?{' '}
        <Link to="/signup" className="text-amber font-semibold">Sign up free</Link>
      </div>
    </div>
  );
}
