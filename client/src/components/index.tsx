import { useNavigate } from 'react-router-dom';

// ─── Toast ────────────────────────────────────────────────────────────────────
export default function Toast({ msg }: { msg: string }) {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3
      glass-card rounded-2xl font-sans text-[12px] text-cream
      shadow-[0_8px_32px_rgba(0,0,0,.5)] whitespace-nowrap
      animate-[fadeUp_.3s_ease]">
      {msg}
    </div>
  );
}

// ─── TopHeader ────────────────────────────────────────────────────────────────
export function TopHeader({
  title, back, action, onAction, logo
}: {
  title?: string; back?: boolean; action?: string;
  onAction?: () => void; logo?: boolean;
}) {
  const nav = useNavigate();
  return (
    <header className="h-14 wood-frame flex items-center px-4 gap-3 flex-shrink-0">
      {back && (
        <button onClick={() => nav(-1)} className="text-muted text-xl px-1 leading-none hover:text-cream transition-colors">←</button>
      )}
      {logo && <span className="font-display text-lg font-bold tracking-wide text-amber">TRACE</span>}
      {title && <span className="font-display text-[16px] font-semibold text-cream flex-1">{title}</span>}
      {!title && <span className="flex-1"/>}
      {action && (
        <button onClick={onAction} className="font-mono text-[10px] text-amber tracking-[.06em] border border-amber/30 px-3 py-1.5 rounded-lg glass-card">
          {action}
        </button>
      )}
    </header>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
export function StatusPill({ status }: { status: 'safe' | 'lost' | 'found' }) {
  const map = {
    safe:  'bg-green/10 text-green border border-green/30',
    lost:  'bg-warn/10 text-warn border border-warn/30',
    found: 'bg-amber/10 text-amber border border-amber/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 rounded-full ${map[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-[pulse-amber_2s_ease_infinite]"/>
      {status.toUpperCase()}
    </span>
  );
}

// ─── DogAvatar ────────────────────────────────────────────────────────────────
export function DogAvatar({ photoUrl, size = 14 }: { photoUrl?: string | null; size?: number }) {
  if (photoUrl) return (
    <img src={photoUrl} className={`w-${size} h-${size} rounded-2xl object-cover border-2 border-amber/20 shadow-[0_4px_16px_rgba(0,0,0,.4)]`}/>
  );
  return (
    <div className={`w-${size} h-${size} rounded-2xl glass-card border-2 border-amber/20 flex items-center justify-center text-3xl shadow-[0_4px_16px_rgba(0,0,0,.4)]`}>
      🐕
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-amber/10 last:border-none">
      <span className="font-sans text-sm text-muted">{label}</span>
      <span className="font-sans text-[13px] font-medium text-cream">{value}</span>
    </div>
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────
export function FormInput({
  label, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[9px] uppercase tracking-[.12em] text-muted">{label}</label>
      <input
        {...props}
        className={`glass-card rounded-xl text-[13px] text-cream px-4 py-3
          outline-none focus:border-amber/50 transition-colors placeholder:text-muted/50 font-sans ${props.className ?? ''}`}
      />
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
export function Btn({
  children, variant = 'primary', full, sm, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'warn' | 'green';
  full?: boolean; sm?: boolean;
}) {
  const base = `font-sans font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2
    transition-all active:scale-[.97] cursor-pointer`;
  const size = sm ? 'h-9 px-4 text-[12px]' : 'h-12 px-5 text-[13px]';
  const vars: Record<string, string> = {
    primary: 'bg-amber text-wood1 shadow-[0_4px_16px_rgba(240,168,48,.3)]',
    ghost:   'glass-card text-muted hover:text-cream hover:border-amber/30',
    warn:    'bg-warn/10 border border-warn/30 text-warn',
    green:   'bg-green/20 border border-green/30 text-green',
  };
  return (
    <button {...props} className={`${base} ${size} ${vars[variant]} ${full ? 'w-full' : ''} ${props.className ?? ''}`}>
      {children}
    </button>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 mt-6 mb-3">
      <span className="font-display text-[16px] font-semibold text-cream">{title}</span>
      {action && (
        <button onClick={onAction} className="font-mono text-[10px] text-amber tracking-[.04em]">{action}</button>
      )}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-all flex-shrink-0
        ${on ? 'bg-amber' : 'glass-card'}`}
    >
      <div className={`absolute w-[18px] h-[18px] rounded-full bg-cream top-[3px] transition-all shadow-sm
        ${on ? 'left-[22px]' : 'left-[3px]'}`}/>
    </div>
  );
}
