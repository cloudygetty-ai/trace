import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components';

export default function ChipsScreen() {
  const { dogs } = useStore();
  const nav = useNavigate();

  return (
    <div className="flex flex-col h-full bg-bg">
      <TopHeader title="ACCT Chips" back action="Scan" onAction={() => nav('/scan')}/>
      <div className="flex-1 overflow-y-auto px-4 py-4 gap-4 flex flex-col">
        {dogs.map(dog => {
          const isLost = dog.status === 'lost';
          const accent = isLost ? '#ff4040' : '#3ddc84';
          const accentDim = isLost ? 'rgba(255,64,64,.15)' : 'rgba(61,220,132,.1)';
          return (
            <div key={dog.id} style={{background:'linear-gradient(135deg,#0a1520,#0d1e2a)',border:`1px solid ${accentDim}`,borderRadius:18,padding:20,position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,.012) 28px,rgba(255,255,255,.012) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(255,255,255,.012) 28px,rgba(255,255,255,.012) 29px)'}}/>
              <div style={{position:'relative',zIndex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div>
                    <p style={{fontFamily:'Space Mono',fontSize:8,letterSpacing:'.16em',color:accent,opacity:.7,textTransform:'uppercase',marginBottom:4}}>ACCT · ISO 11784</p>
                    <p style={{fontSize:22,fontWeight:700,color:'#fff'}}>{dog.name.toUpperCase()}</p>
                  </div>
                  <div style={{background:`${accentDim}`,border:`1px solid ${accentDim}`,borderRadius:6,padding:'3px 9px',fontFamily:'Space Mono',fontSize:9,color:accent,alignSelf:'flex-start'}}>
                    {dog.status.toUpperCase()}
                  </div>
                </div>
                {dog.chip_id
                  ? <div style={{fontFamily:'Space Mono',fontSize:12,color:accent,letterSpacing:'.1em',background:`${accentDim}`,border:`1px solid ${accentDim}`,borderRadius:6,padding:'5px 10px',display:'inline-block'}}>
                      {dog.chip_id.match(/.{1,3}/g)?.join(' ')}
                    </div>
                  : <div style={{fontFamily:'Space Mono',fontSize:10,color:'#526475',cursor:'pointer'}} onClick={() => nav('/add-dog')}>No chip — tap to add →</div>
                }
                <div style={{display:'flex',gap:16,marginTop:12}}>
                  <div><p style={{fontFamily:'Space Mono',fontSize:8,color:'#526475',textTransform:'uppercase',letterSpacing:'.06em'}}>Type</p><p style={{fontSize:12,fontWeight:600,marginTop:2}}>{dog.chip_type === 'active' ? 'Active BLE+NFC' : 'Passive NFC'}</p></div>
                  <div><p style={{fontFamily:'Space Mono',fontSize:8,color:'#526475',textTransform:'uppercase',letterSpacing:'.06em'}}>Registries</p><p style={{fontSize:12,fontWeight:600,marginTop:2}}>TRACE+ICAR</p></div>
                </div>
              </div>
              <div style={{position:'absolute',right:20,bottom:20,width:48,height:48,borderRadius:10,background:`${accentDim}`,border:`1px solid ${accentDim}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🐾</div>
            </div>
          );
        })}
        <button onClick={() => nav('/add-dog')} className="w-full h-11 bg-transparent border border-amber/15 rounded-xl font-mono text-[11px] text-muted tracking-[.06em]">
          + Register Another Chip
        </button>
      </div>
    </div>
  );
}
