import { TopHeader } from '../components';

const NOTIFS = [
  { icon:'📡', title:'BLE relay — Luna', sub:'Oak & 4th St · Confidence 0.74 · RSSI −62', time:'2m' },
  { icon:'👤', title:'Community sighting', sub:'Riverside Park entrance · Tap for details', time:'18m' },
  { icon:'📢', title:'SMS broadcast delivered', sub:'340 of 340 messages delivered', time:'1h' },
  { icon:'🏥', title:'Bear scanned at vet', sub:'Riverside Animal Clinic · RFID scan logged', time:'2d' },
  { icon:'💾', title:'ACCT chip registered', sub:"Luna's chip synced to ICAR + PetLink", time:'7d' },
];

export default function Notifications() {
  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="Notifications" back action="Mark all read" onAction={() => {}}/>
      <div className="flex-1 overflow-y-auto">
        {NOTIFS.map((n, i) => (
          <div key={i} className="flex gap-3 px-4 py-4 border-b border-amber/10 cursor-pointer hover:glass-card transition-colors">
            <span className="text-xl mt-0.5">{n.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted2 mt-1 leading-relaxed">{n.sub}</p>
            </div>
            <span className="font-mono text-[10px] text-muted2 flex-shrink-0">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
