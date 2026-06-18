import { useNavigate } from 'react-router-dom';

// ─── Toast ────────────────────────────────────────────────────────────────────
export default function Toast({ msg }: { msg: string }) {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5
      bg-s1 border border-cyan/30 rounded-xl font-mono text-[10px] text-cyan
      tracking-[.06em] shadow-[0_4px_20px_rgba(0,224,255,.15)] whitespace-nowrap
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
    <header className="h-14 bg-s1 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
      {back && (
        <button onClick={() => nav(-1)} className="text-muted2 text-xl px-1 leading-none">←</button>
      )}
      {logo && <span className="font-mono text-sm font-bold tracking-[.1em] text-cyan">TRACE</span>}
      {title && <span className="text-[15px] font-semibold flex-1">{title}</span>}
      {!title && <span className="flex-1"/>}
      {action && (
        <button onClick={onAction} className="font-mono text-[10px] text-cyan tracking-[.06em]">
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
    found: 'bg-cyan/10 text-cyan border border-cyan/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] px-2 py-1 rounded-md ${map[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"/>
      {status.toUpperCase()}
    </span>
  );
}

// ─── DogAvatar ────────────────────────────────────────────────────────────────
export function DogAvatar({ photoUrl, size = 14 }: { photoUrl?: string | null; size?: number }) {
  if (photoUrl) return (
    <img src={photoUrl} className={`w-${size} h-${size} rounded-xl object-cover border border-border`}/>
  );
  return (
    <div className={`w-${size} h-${size} rounded-xl bg-s3 border border-border flex items-center justify-center text-3xl`}>
      🐕
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-none">
      <span className="text-sm text-muted2">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────
export function FormInput({
  label, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[9px] uppercase tracking-[.1em] text-muted2">{label}</label>
      <input
        {...props}
        className={`bg-s2 border border-[#2c3540] rounded-xl text-[13px] text-text px-3.5 py-3
          outline-none focus:border-cyan transition-colors placeholder:text-muted ${props.className ?? ''}`}
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
  const base = `font-mono tracking-[.08em] rounded-xl flex items-center justify-center gap-2
    transition-all active:scale-[.97] cursor-pointer border-none`;
  const size = sm ? 'h-9 px-4 text-[9px]' : 'h-12 px-5 text-[11px]';
  const vars: Record<string, string> = {
    primary: 'bg-cyan text-[#04090c] font-bold',
    ghost:   'bg-transparent border border-[#2c3540] text-muted2 hover:text-text hover:border-text',
    warn:    'bg-warn/10 border border-warn/30 text-warn',
    green:   'bg-green text-[#04120a] font-bold',
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
    <div className="flex items-center justify-between px-4 mt-5 mb-3">
      <span className="text-[15px] font-semibold">{title}</span>
      {action && (
        <button onClick={onAction} className="font-mono text-[10px] text-cyan tracking-[.04em]">{action}</button>
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
        ${on ? 'bg-cyan' : 'bg-s3 border border-[#2c3540]'}`}
    >
      <div className={`absolute w-4.5 h-4.5 rounded-full bg-white top-[3px] transition-all
        ${on ? 'left-[22px]' : 'left-[3px]'}`}/>
    </div>
  );
}
