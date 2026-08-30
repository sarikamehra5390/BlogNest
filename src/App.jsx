import {useDispatch} from 'react-redux'
import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header, BadgeToast } from './components'
import { Outlet } from 'react-router-dom'
import realtimeService from './appwrite/realtimeService'
import { BADGE_DEFINITIONS } from './appwrite/badgeService'

function App() {

  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const [badgeQueue, setBadgeQueue] = useState([]);
  const userRef = useRef(null);
  const realtimeUnsubRef = useRef(null);

  const showBadgeToast = useCallback((badge) => {
    if (!badge) return;
    const id = `${badge.badgeId || badge.id}-${Date.now()}`;
    setBadgeQueue((prev) => [...prev, { ...badge, __id: id }]);
  }, []);

  const dismissBadgeToast = useCallback((__id) => {
    setBadgeQueue((prev) => prev.filter((b) => b.__id !== __id));
  }, []);

  useEffect(() => {

    let mounted = true;

    authService.getCurrentUser()
    .then((userData)=>{
      if (!mounted) return;

      if(userData){
        dispatch(login(userData))
        userRef.current = userData;

        if (realtimeUnsubRef.current && typeof realtimeUnsubRef.current.unsubscribe === "function") {
          realtimeUnsubRef.current.unsubscribe();
          realtimeUnsubRef.current = null;
        }

        realtimeUnsubRef.current = realtimeService.subscribeToBadges(
          userData.$id,
          (event) => {
            const action = event?.events?.[0] || "";
            const payload = event?.payload;
            if (!payload || !action.includes(".create")) return;

            const def = Object.values(BADGE_DEFINITIONS).find(
              (d) => d.id === payload.badgeId
            );
            if (!def) return;

            showBadgeToast({
              badgeId: def.id,
              name: payload.name || def.name,
              icon: payload.icon || def.icon,
              color: payload.color || def.color,
              description: payload.description || def.description,
            });
          }
        );
      }else{
        dispatch(logout())
        userRef.current = null;
      }
    })
    .catch(() => {
      if (!mounted) return;
      dispatch(logout())
      userRef.current = null;
    })
    .finally(() => {
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false;
      if (realtimeUnsubRef.current && typeof realtimeUnsubRef.current.unsubscribe === "function") {
        realtimeUnsubRef.current.unsubscribe();
        realtimeUnsubRef.current = null;
      }
    };
  },[dispatch, showBadgeToast])

  return !loading ? (
    <div className="min-h-screen flex flex-wrap content-between bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <div className='w-full block'>
        <Header />
        <main className="min-h-[calc(100vh-13rem)]">
           <Outlet />
        </main>
        <Footer />
      </div>

      {badgeQueue.map((badge) => (
        <BadgeToast
          key={badge.__id}
          badge={badge}
          onClose={() => dismissBadgeToast(badge.__id)}
        />
      ))}
    </div>
  ) : null
}

export default App
