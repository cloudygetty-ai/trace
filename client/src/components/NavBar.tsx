import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/home',      icon: '🏠', label: 'HOME' },
  { path: '/map',       icon: '🗺️', label: 'MAP' },
  { path: '/community', icon: '🐾', label: 'PACK' },
  { path: '/chips',     icon: '💾', label: 'CHIPS' },
  { path: '/settings',  icon: '⚙️', label: 'MORE' },
];

export default function NavBar() {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <nav className="h-16 wood-frame border-t flex items-center px-2 flex-shrink-0" style={{borderColor:'rgba(180,120,40,.2)'}}>
      {TABS.map(t => (
        <button key={t.path} onClick={() => nav(t.path)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all
            ${loc.pathname === t.path ? 'bg-amber/10 text-amber' : 'text-muted hover:text-text'}`}>
          <span className="text-xl leading-none">{t.icon}</span>
          <span className="font-mono text-[8px] tracking-[.08em]">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
