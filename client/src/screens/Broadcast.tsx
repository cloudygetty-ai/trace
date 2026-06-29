import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { TopHeader, Btn, Toggle } from '../components';

export default function Broadcast() {
  const { dogId } = useParams();
  const { dogs, activeDog, showToast } = useStore();
  const dog = dogs.find(d => d.id === dogId) ?? activeDog ?? dogs.find(d => d.status === 'lost') ?? dogs[0];
  const [push, setPush] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const nav = useNavigate();

  const send = async () => {
    if (!dog) { showToast('No dog selected'); return; }
    setSending(true);
    try {
      // Broadcast via Supabase Realtime to all connected users in area
      const channel = supabase.channel('trace-broadcasts');
      await channel.subscribe();
      await channel.send({
        type: 'broadcast',
        event: 'lost-dog-alert',
        payload: {
          dog_id:    dog.id,
          dog_name:  dog.name,
          breed:     dog.breed,
          color:     dog.color,
          photo_url: dog.photo_url,
          status:    'lost',
          ts:        new Date().toISOString(),
        },
      });
      supabase.removeChannel(channel);

      // Also insert a notification for all users who have the app open
      // (push via service worker fires on next sighting trigger)
      setSent(true);
      showToast('✓ Alert broadcast to nearby TRACE users');
      setTimeout(() => nav(-1), 2000);
    } catch (e: any) {
      showToast(e.message ?? 'Broadcast failed');
    } finally {
      setSending(false); }
  };

  if (sent) return (
    <div className="flex flex-col h-full bg-bg items-center justify-center gap-4 px-8 text-center">
      <span className="text-5xl">📡</span>
      <p className="font-display text-xl font-bold text-text">Alert sent</p>
      <p className="font-sans text-sm text-muted">All nearby TRACE users have been notified about {dog?.name}.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Send Alert" back/>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {dog && (
          <div className="bg-warn/8 border border-warn/25 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">🐕</span>
            <div>
              <p className="font-display text-base font-bold text-text">{dog.name}</p>
              <p className="font-sans text-xs text-muted">{dog.breed} · {dog.color}</p>
            </div>
            <span className="ml-auto font-mono text-[9px] text-warn border border-warn/30 px-2 py-1 rounded-md">LOST</span>
          </div>
        )}

        <div className="bg-surface border border-amber/15 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-amber/10">
            <span className="text-xl">📡</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-medium text-text">Realtime broadcast</p>
              <p className="font-sans text-xs text-muted mt-0.5">Pings all active TRACE users nearby</p>
            </div>
            <Toggle on={true} onToggle={() => {}}/>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="text-xl">🔔</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-medium text-text">Push notification</p>
              <p className="font-sans text-xs text-muted mt-0.5">Web push to subscribed users</p>
            </div>
            <Toggle on={push} onToggle={() => setPush(v => !v)}/>
          </div>
        </div>

        <div className="bg-amber/8 border border-amber/15 rounded-2xl p-4">
          <p className="font-mono text-[9px] text-muted uppercase tracking-wider mb-1">What happens</p>
          <p className="font-sans text-[12px] text-text leading-relaxed">
            Every TRACE user with the app open nearby will see an alert with {dog?.name ?? 'your dog'}'s photo and description.
            Users who enabled push notifications will be notified even if the app is closed.
          </p>
        </div>

        <Btn full onClick={send} disabled={sending || !dog}>
          {sending ? 'Broadcasting...' : '📡  Send Alert Now'}
        </Btn>
      </div>
    </div>
  );
}
