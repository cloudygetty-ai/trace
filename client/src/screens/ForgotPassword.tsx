import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TopHeader, FormInput, Btn } from '../components';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async () => {
    setErr(''); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Reset Password" back/>
      <div className="flex-1 flex flex-col px-6 py-8 gap-5">
        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <span className="text-5xl">📧</span>
            <p className="font-display text-xl font-bold text-text">Check your email</p>
            <p className="font-sans text-sm text-muted max-w-xs leading-relaxed">
              We sent a password reset link to <strong className="text-text">{email}</strong>.
              Check your inbox — it expires in 24 hours.
            </p>
            <Btn onClick={() => nav('/login')}>Back to Sign In</Btn>
          </div>
        ) : (
          <>
            <div>
              <p className="font-display text-2xl font-bold text-text">Forgot password?</p>
              <p className="font-sans text-sm text-muted mt-2">Enter your email and we'll send a reset link.</p>
            </div>
            <FormInput label="Email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}/>
            {err && <p className="text-warn text-xs font-mono">{err}</p>}
            <Btn full onClick={submit} disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </Btn>
            <p className="text-center text-sm text-muted">
              Remembered it? <Link to="/login" className="text-amber font-semibold">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
