import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC = 'BFJ7haWLVXeLd5vH_5fNNpTbBGOS0LhM6uvTeNcTE5aHGJKPfMHrFQox6HRHgWVXiDXSAOXs4eXoc-qgSsKdumc';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)));
}

export function usePushNotifications() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const existing = await reg.pushManager.getSubscription();
        if (existing) { await saveSubscription(existing); return; }

        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
        });
        await saveSubscription(sub);
      } catch { /* push not available */ }
    })();
  }, []);
}

async function saveSubscription(sub: PushSubscription) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  await supabase.from('profiles').update({ push_sub: sub.toJSON() }).eq('id', session.user.id);
}
