import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { TopHeader } from '../components';

const TYPE_ICON: Record<string, string> = {
  sighting: '📡', chip_scan: '💾', broadcast_sent: '📢',
  chip_registered: '✓', order_shipped: '📦', order_delivered: '🐾',
  dog_lost: '🚨', dog_found: '🎉',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function Notifications() {
  const nav = useNavigate();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.getNotifications().then(setNotifs).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.markAllNotificationsRead().catch(() => {});
    load();
  };

  const open = async (n: any) => {
    if (!n.read) await api.markNotificationRead(n.id).catch(() => {});
    if (n.dog_id) nav(`/dog/${n.dog_id}`);
    load();
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Notifications" back action="Mark all read" onAction={markAllRead}/>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="font-sans text-sm text-muted text-center py-10">Loading...</p>
        ) : notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <span className="text-4xl mb-3">🔔</span>
            <p className="font-display text-base text-text font-semibold">No notifications yet</p>
            <p className="font-sans text-sm text-muted mt-1">
              You'll see sighting alerts, chip scans, and order updates here.
            </p>
          </div>
        ) : notifs.map(n => (
          <div key={n.id} onClick={() => open(n)}
            className={"flex gap-3 px-4 py-4 border-b border-amber/10 cursor-pointer transition-colors " +
              (n.read ? '' : 'bg-amber/5')}>
            <span className="text-xl mt-0.5">{TYPE_ICON[n.type] ?? '🔔'}</span>
            <div className="flex-1">
              <p className="font-sans text-sm font-semibold text-text">{n.title}</p>
              {n.body && <p className="font-sans text-xs text-muted mt-1 leading-relaxed">{n.body}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-mono text-[10px] text-muted flex-shrink-0">{timeAgo(n.created_at)}</span>
              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber"/>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
