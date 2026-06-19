import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from './store';

// Screens
import Onboarding   from './screens/Onboarding';
import Login        from './screens/Login';
import Signup       from './screens/Signup';
import AddDog       from './screens/AddDog';
import Home         from './screens/Home';
import MapScreen    from './screens/MapScreen';
import DogProfile   from './screens/DogProfile';
import ChipsScreen  from './screens/ChipsScreen';
import ScanScreen   from './screens/ScanScreen';
import Community    from './screens/Community';
import ReportSighting from './screens/ReportSighting';
import FoundDog     from './screens/FoundDog';
import Broadcast    from './screens/Broadcast';
import PosterScreen from './screens/PosterScreen';
import Notifications from './screens/Notifications';
import Settings     from './screens/Settings';
import Shop          from './screens/Shop';
import ShopSuccess   from './screens/ShopSuccess';
import Orders        from './screens/Orders';

// Components
import Toast from './components';
import NavBar       from './components/NavBar';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useStore(s => s.user);
  const loading = useStore(s => s.loading);
  if (loading) return (
    <div className="flex h-full items-center justify-center bg-bg">
      <div className="font-mono text-xs text-cyan tracking-widest animate-pulse">TRACE</div>
    </div>
  );
  if (!user) return <Navigate to="/onboarding" replace/>;
  return <>{children}</>;
}

const NAV_ROUTES = ['/home', '/map', '/community', '/chips', '/settings'];

export default function App() {
  const { init, toast } = useStore();
  const location = useLocation();
  const showNav  = NAV_ROUTES.includes(location.pathname);

  useEffect(() => { init(); }, []);

  return (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-bg overflow-hidden relative shadow-2xl">
      <div className="flex-1 overflow-hidden">
        <Routes>
          {/* Public */}
          <Route path="/onboarding"  element={<Onboarding/>}/>
          <Route path="/login"       element={<Login/>}/>
          <Route path="/signup"      element={<Signup/>}/>
          <Route path="/found/:chipId?" element={<FoundDog/>}/>

          {/* Auth-guarded */}
          <Route path="/add-dog"     element={<AuthGuard><AddDog/></AuthGuard>}/>
          <Route path="/home"        element={<AuthGuard><Home/></AuthGuard>}/>
          <Route path="/map"         element={<AuthGuard><MapScreen/></AuthGuard>}/>
          <Route path="/dog/:id"     element={<AuthGuard><DogProfile/></AuthGuard>}/>
          <Route path="/chips"       element={<AuthGuard><ChipsScreen/></AuthGuard>}/>
          <Route path="/scan"        element={<AuthGuard><ScanScreen/></AuthGuard>}/>
          <Route path="/community"   element={<AuthGuard><Community/></AuthGuard>}/>
          <Route path="/report/:dogId?" element={<AuthGuard><ReportSighting/></AuthGuard>}/>
          <Route path="/broadcast/:dogId?" element={<AuthGuard><Broadcast/></AuthGuard>}/>
          <Route path="/poster/:dogId?"    element={<AuthGuard><PosterScreen/></AuthGuard>}/>
          <Route path="/notifications"     element={<AuthGuard><Notifications/></AuthGuard>}/>
          <Route path="/settings"    element={<AuthGuard><Settings/></AuthGuard>}/>
          <Route path="/shop"        element={<AuthGuard><Shop/></AuthGuard>}/>
          <Route path="/shop/success" element={<AuthGuard><ShopSuccess/></AuthGuard>}/>
          <Route path="/orders"      element={<AuthGuard><Orders/></AuthGuard>}/>

          <Route path="*" element={<Navigate to="/onboarding" replace/>}/>
        </Routes>
      </div>

      {showNav && <NavBar/>}
      {toast && <Toast msg={toast}/>}
    </div>
  );
}
