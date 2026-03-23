import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';

export default function App() {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');
  const isFullScreen = isChat || location.pathname === '/login' || location.pathname === '/onboarding';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sera.theme');
      document.documentElement.classList.toggle('dark', saved === 'dark');
    } catch {}
  }, []);

  return (
    <div className="min-h-screen">
      {!isFullScreen && <NavBar />}
      <main className={isFullScreen ? '' : 'pt-14'}>
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
