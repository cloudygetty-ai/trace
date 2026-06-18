import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/home',      icon: '🏠', label: 'HOME' },
  { path: '/map',       icon: '🗺️', label: 'MAP' },
  { path: '/community', icon: '👥', label: 'COMMUNITY' },
  { path: '/chips',     icon: '💾', label: 'CHIPS' },
  { path: '/settings',  icon: '⚙️', label: 'SETTINGS' },
];

export default function NavBar() {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <nav className="h-14 bg-s1 border-t border-border flex items-center px-1 flex-shrink-0">
      {TABS.map(t => (
        <button
          key={t.path}
          onClick={() => nav(t.path)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all
            ${loc.pathname === t.path ? 'text-cyan' : 'text-muted2'}`}
        >
          <span className="text-xl leading-none">{t.icon}</span>
          <span className="font-mono text-[8px] tracking-[.06em]">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
