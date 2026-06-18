import { useNavigate } from 'react-router-dom';

export default function Toast({ msg }: { msg: string }) {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5
      bg-wood3 border border-amber/30 rounded-2xl font-sans text-[12px] text-text
      shadow-[0_4px_20px_rgba(150,90,20,.15)] whitespace-nowrap animate-[fadeUp_.3s_ease]">
      {msg}
    </div>
  );
}

export function TopHeader({ title, back, action, onAction, logo }:
  { title?: string; back?: boolean; action?: string; onAction?: () => void; logo?: boolean }) {
  const nav = useNavigate();
  return (
    <header className="h-14 wood-frame border-b flex items-center px-4 gap-3 flex-shrink-0" style={{borderColor:'rgba(180,120,40,.2)'}}>
      {back && <button onClick={() => nav(-1)} className="text-muted text-xl px-1 leading-none hover:text-amber transition-colors">←</button>}
      {logo && <span className="font-display text-lg font-bold tracking-wide text-amber">TRACE</span>}
      {title && <span className="font-display text-[16px] font-semibold text-text flex-1">{title}</span>}
      {!title && <span className="flex-1"/>}
      {action && (
        <button onClick={onAction} className="font-mono text-[10px] text-amber tracking-[.06em] border border-amber/30 px-3 py-1.5 rounded-lg bg-amber/5">
          {action}
        </button>
      )}
    </header>
  );
}

export function StatusPill({ status }: { status: 'safe' | 'lost' | 'found' }) {
  const map = {
    safe:  'bg-green/10 text-green border-green/30',
    lost:  'bg-warn/10 text-warn border-warn/30',
    found: 'bg-amber/15 text-amber border-amber/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-1 rounded-full border ${map[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-[pulse-amber_2s_ease_infinite]"/>
      {status.toUpperCase()}
    </span>
  );
}

export function DogAvatar({ photoUrl, size = 14 }: { photoUrl?: string | null; size?: number }) {
  if (photoUrl) return (
    <img src={photoUrl} className={`w-${size} h-${size} rounded-2xl object-cover border-2 border-amber/25 shadow-md`}/>
  );
  return (
    <div className={`w-${size} h-${size} rounded-2xl bg-wood3 border-2 border-amber/20 flex items-center justify-center text-3xl shadow-sm`}>
      🐕
    </div>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b last:border-none" style={{borderColor:'rgba(180,120,40,.12)'}}>
      <span className="font-sans text-sm text-muted">{label}</span>
      <span className="font-sans text-[13px] font-medium text-text">{value}</span>
    </div>
  );
}

export function FormInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[9px] uppercase tracking-[.12em] text-muted">{label}</label>
      <input {...props}
        className={`bg-surface border rounded-xl text-[13px] text-text px-4 py-3
          outline-none focus:border-amber transition-colors placeholder:text-muted/50 font-sans
          shadow-sm ${props.className ?? ''}`}
        style={{borderColor:'rgba(180,120,40,.2)'}}
      />
    </div>
  );
}

export function Btn({ children, variant = 'primary', full, sm, ...props }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'ghost'|'warn'|'green'; full?: boolean; sm?: boolean }) {
  const base = `font-sans font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[.97] cursor-pointer`;
  const size = sm ? 'h-9 px-4 text-[12px]' : 'h-12 px-5 text-[13px]';
  const vars: Record<string,string> = {
    primary: 'bg-amber text-white shadow-[0_3px_12px_rgba(217,119,6,.35)]',
    ghost:   'bg-surface border text-muted hover:text-text hover:border-amber/40',
    warn:    'bg-warn/8 border border-warn/30 text-warn',
    green:   'bg-green/10 border border-green/30 text-green',
  };
  return (
    <button {...props} style={variant==='ghost'?{borderColor:'rgba(180,120,40,.2)'}:{}}
      className={`${base} ${size} ${vars[variant]} ${full?'w-full':''} ${props.className??''}`}>
      {children}
    </button>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 mt-6 mb-3">
      <span className="font-display text-[16px] font-semibold text-text">{title}</span>
      {action && <button onClick={onAction} className="font-mono text-[10px] text-amber tracking-[.04em]">{action}</button>}
    </div>
  );
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-all flex-shrink-0
        ${on ? 'bg-amber shadow-[0_2px_8px_rgba(217,119,6,.3)]' : 'bg-wood2'}`}>
      <div className={`absolute w-[18px] h-[18px] rounded-full bg-white top-[3px] transition-all shadow-sm
        ${on ? 'left-[22px]' : 'left-[3px]'}`}/>
    </div>
  );
}
