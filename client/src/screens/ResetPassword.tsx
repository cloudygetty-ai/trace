import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FormInput, Btn } from '../components';

export default function ResetPassword() {
  const [pw, setPw]        = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone]    = useState(false);
  const [err, setErr]      = useState('');
  const [loading, setLoading] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Supabase puts the session in the URL hash after clicking reset link
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidLink(true);
    });
  }, []);

  const submit = async () => {
    if (pw.length < 8) { setErr('Password must be at least 8 characters'); return; }
    if (pw !== confirm) { setErr('Passwords do not match'); return; }
    setErr(''); setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setDone(true);
      setTimeout(() => nav('/home'), 2500);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg items-center justify-center px-6">
      {done ? (
        <div className="text-center flex flex-col items-center gap-4">
          <span className="text-5xl">✓</span>
          <p className="font-display text-xl font-bold text-text">Password updated!</p>
          <p className="font-sans text-sm text-muted">Redirecting you now...</p>
        </div>
      ) : !validLink ? (
        <div className="text-center flex flex-col items-center gap-4">
          <span className="text-4xl">🔗</span>
          <p className="font-display text-xl font-bold text-text">Waiting for reset link</p>
          <p className="font-sans text-sm text-muted max-w-xs leading-relaxed">
            Open the reset link from your email on this device. If you already did, try opening the link again.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div>
            <p className="font-display text-2xl font-bold text-text">New password</p>
            <p className="font-sans text-sm text-muted mt-1">Choose something strong.</p>
          </div>
          <FormInput label="New password" type="password" placeholder="At least 8 characters"
            value={pw} onChange={e => setPw(e.target.value)}/>
          <FormInput label="Confirm password" type="password" placeholder="Same as above"
            value={confirm} onChange={e => setConfirm(e.target.value)}/>
          {err && <p className="text-warn text-xs font-mono">{err}</p>}
          <Btn full onClick={submit} disabled={loading || !pw || !confirm}>
            {loading ? 'Updating...' : 'Update Password →'}
          </Btn>
        </div>
      )}
    </div>
  );
}
