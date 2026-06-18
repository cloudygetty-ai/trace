import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../store';
import { TopHeader } from '../components';

function SettingRow({ icon, title, sub, right }: any) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-amber/10 last:border-none">
      <div className="w-8 h-8 rounded-xl glass-card border border-amber/10 flex items-center justify-center text-base flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        {sub && <p className="text-[11px] text-muted2 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <div onClick={toggle} className={"w-11 h-6 rounded-full relative cursor-pointer transition-all flex-shrink-0 " + (on ? 'bg-amber' : 'glass border border-[#2c3540]')}>
      <div className={"absolute w-[18px] h-[18px] rounded-full bg-white top-[3px] transition-all " + (on ? 'left-[22px]' : 'left-[3px]')}/>
    </div>
  );
}

export default function Settings() {
  const { user, dogs, signOut, showToast } = useStore();
  const nav = useNavigate();
  const [relay, setRelay] = useState(true);
  const [sms, setSms] = useState(true);
  const [push, setPush] = useState(true);
  const [antistalk, setAntistalk] = useState(true);

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader logo title="Settings"/>
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Profile */}
        <div className="px-4 py-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber/10 border-2 border-amber/30 flex items-center justify-center text-3xl">👤</div>
          <div>
            <p className="text-lg font-bold">{user?.user_metadata?.first_name ?? 'Dog Owner'}</p>
            <p className="text-xs text-muted2 mt-0.5">{user?.email}</p>
            <p className="font-mono text-[9px] text-amber mt-1.5 tracking-[.06em]">{dogs.length} DOGS · ACCT MEMBER</p>
          </div>
        </div>

        <div className="mx-4 mb-2 font-mono text-[9px] text-muted2 uppercase tracking-[.1em]">Alert Preferences</div>
        <div className="mx-4 glass-card border border-amber/10 rounded-2xl overflow-hidden">
          <SettingRow icon="💬" title="SMS Alerts" sub="Receive text when sighting filed" right={<Toggle on={sms} toggle={()=>setSms(v=>!v)}/>}/>
          <SettingRow icon="🔔" title="Push Notifications" sub="All sighting events" right={<Toggle on={push} toggle={()=>setPush(v=>!v)}/>}/>
          <SettingRow icon="📧" title="Email Digest" sub="Daily summary" right={<span className="font-mono text-[10px] text-muted2">›</span>}/>
        </div>

        <div className="mx-4 mt-5 mb-2 font-mono text-[9px] text-muted2 uppercase tracking-[.1em]">Relay & Privacy</div>
        <div className="mx-4 glass-card border border-amber/10 rounded-2xl overflow-hidden">
          <SettingRow icon="📡" title="BLE Community Relay" sub="Passively help find lost dogs near you" right={<Toggle on={relay} toggle={()=>setRelay(v=>!v)}/>}/>
          <SettingRow icon="📍" title="Location Precision" sub="Relay sightings use 100m grid" right={<span className="font-mono text-[10px] text-muted2">100m ›</span>}/>
          <SettingRow icon="🔒" title="Anti-Stalking Detection" sub="Alert if unknown beacon follows you" right={<Toggle on={antistalk} toggle={()=>setAntistalk(v=>!v)}/>}/>
        </div>

        <div className="mx-4 mt-5 mb-2 font-mono text-[9px] text-muted2 uppercase tracking-[.1em]">Account</div>
        <div className="mx-4 glass-card border border-amber/10 rounded-2xl overflow-hidden">
          <div className="cursor-pointer" onClick={() => showToast('Emergency contacts')}><SettingRow icon="👥" title="Emergency Contacts" sub="Secondary contacts for alerts" right={<span className="text-muted2 text-xs">›</span>}/></div>
          <div className="cursor-pointer" onClick={() => showToast('Reward escrow')}><SettingRow icon="💳" title="Reward Escrow" sub="Stripe-held reward funds" right={<span className="text-muted2 text-xs">›</span>}/></div>
          <div className="cursor-pointer" onClick={() => showToast('Vet integration')}><SettingRow icon="🏥" title="Vet Integration" sub="Auto-notify on RFID scan" right={<span className="text-muted2 text-xs">›</span>}/></div>
          <div className="cursor-pointer" onClick={() => nav('/pd-portal')}><SettingRow icon="🛡️" title="PD/OEM Partner" sub="Riverside Township PD · Active" right={<span className="text-muted2 text-xs">›</span>}/></div>
        </div>

        <div className="px-4 mt-6">
          <button onClick={async () => { await signOut(); nav('/login'); }}
            className="w-full h-11 bg-transparent border border-amber/10 rounded-xl font-mono text-[11px] text-muted2 tracking-[.06em]">
            Sign Out
          </button>
          <p className="font-mono text-[9px] text-muted text-center mt-4 tracking-[.06em]">TRACE v1.0.0 · ACCT · ISO 11784/11785</p>
        </div>
      </div>
    </div>
  );
}
