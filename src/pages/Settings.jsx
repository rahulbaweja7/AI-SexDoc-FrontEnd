import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const prefersDark = useMemo(() => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches, []);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light'));
  const [enterToSend, setEnterToSend] = useState(() => (localStorage.getItem('sera.enterToSend') ?? '1') === '1');
  const [voiceEnabled, setVoiceEnabled] = useState(() => (localStorage.getItem('sera.voiceEnabled') ?? '1') === '1');
  const [typingSpeed, setTypingSpeed] = useState(() => parseInt(localStorage.getItem('sera.typingSpeedMs') || '35', 10));
  const [sidebarCollapsedDefault, setSidebarCollapsedDefault] = useState(() => (localStorage.getItem('sera.sidebarCollapsedDefault') ?? '0') === '1');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => { localStorage.setItem('sera.enterToSend', enterToSend ? '1' : '0'); }, [enterToSend]);
  useEffect(() => { localStorage.setItem('sera.voiceEnabled', voiceEnabled ? '1' : '0'); }, [voiceEnabled]);
  useEffect(() => { localStorage.setItem('sera.typingSpeedMs', String(typingSpeed)); }, [typingSpeed]);
  useEffect(() => { localStorage.setItem('sera.sidebarCollapsedDefault', sidebarCollapsedDefault ? '1' : '0'); }, [sidebarCollapsedDefault]);

  function clearSessions() {
    localStorage.removeItem('sera.sessions');
    alert('All chat sessions cleared.');
  }

  function clearLocalHistory() {
    localStorage.removeItem('sera.localHistory');
    alert('Local history cleared.');
  }

  function clearAllData() {
    if (!confirm('This will clear sessions, local history, and onboarding progress. Continue?')) return;
    localStorage.removeItem('sera.sessions');
    localStorage.removeItem('sera.localHistory');
    localStorage.removeItem('sera.onboardingComplete');
    alert('All local data cleared.');
  }

  function exportData() {
    const data = {
      sessions: JSON.parse(localStorage.getItem('sera.sessions') || '[]'),
      localHistory: JSON.parse(localStorage.getItem('sera.localHistory') || '[]'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sera-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (Array.isArray(payload.sessions)) localStorage.setItem('sera.sessions', JSON.stringify(payload.sessions));
      if (Array.isArray(payload.localHistory)) localStorage.setItem('sera.localHistory', JSON.stringify(payload.localHistory));
      alert('Data imported. You may need to refresh open chat tabs to see changes.');
      ev.target.value = '';
    } catch (e) {
      alert('Failed to import: ' + e.message);
    }
  }

  function resetOnboarding() {
    localStorage.setItem('sera.onboardingComplete', '0');
    alert('Onboarding reset. You will be redirected to onboarding next time.');
  }

  return (
    <div className="min-h-screen bg-aurora">
      <div className="w-full max-w-[900px] mx-auto py-8 px-[clamp(16px,5vw,40px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">Settings</h1>
          <p className="text-slate-600 dark:text-slate-300">Tune SERA to your preferences.</p>
        </div>

        <div className="grid gap-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-3">Appearance</h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold">Theme</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Choose light or dark.</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTheme('light')} className={`px-3 py-1.5 rounded-md border ${theme==='light' ? 'bg-slate-100 dark:bg-slate-700/60 border-slate-300' : 'bg-white dark:bg-slate-700/40 border-slate-200'}`}>Light</button>
                <button onClick={() => setTheme('dark')} className={`px-3 py-1.5 rounded-md border ${theme==='dark' ? 'bg-slate-100 dark:bg-slate-700/60 border-slate-300' : 'bg-white dark:bg-slate-700/40 border-slate-200'}`}>Dark</button>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-3">Chat</h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold">Enter to send</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Press Enter to send, Shift+Enter for a new line.</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={enterToSend} onChange={(e)=>setEnterToSend(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-indigo-500 rounded-full relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 transition"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold">Voice replies</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Have SERA speak responses aloud.</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={voiceEnabled} onChange={(e)=>setVoiceEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-indigo-500 rounded-full relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 transition"></div>
              </label>
            </div>
            <div className="py-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Typing speed</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">How fast SERA types (ms per character).</div>
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{typingSpeed} ms</div>
              </div>
              <input type="range" min="10" max="80" step="1" value={typingSpeed} onChange={(e)=>setTypingSpeed(parseInt(e.target.value,10))} className="w-full mt-2" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold">Collapse sidebar by default</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Show a compact rail when opening chat.</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sidebarCollapsedDefault} onChange={(e)=>setSidebarCollapsedDefault(e.target.checked)} />
                <div className="w-11 h-6 bg-slate-2 00 peer-checked:bg-indigo-500 rounded-full relative after:content-[''] after:w-5 after:h-5 after:bg-white after:rounded-full after:absolute after:top-0.5 after:left-0.5 peer-checked:after:translate-x-5 transition"></div>
              </label>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-3">Privacy & data</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportData} className="btn-ghost">Export data</button>
              <label className="btn-ghost cursor-pointer">
                Import data
                <input type="file" accept="application/json" className="hidden" onChange={importData} />
              </label>
              <button onClick={clearSessions} className="btn-ghost">Clear sessions</button>
              <button onClick={clearLocalHistory} className="btn-ghost">Clear local history</button>
              <button onClick={clearAllData} className="btn-primary">Clear all</button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-xl font-semibold mb-3">Account</h2>
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{user?.email}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Role: {user?.role || 'user'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={logout} className="btn-ghost">Sign out</button>
                  <button onClick={() => { resetOnboarding(); navigate('/onboarding'); }} className="btn-primary">Re-run onboarding</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-slate-600 dark:text-slate-300">You are not signed in.</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/login')} className="btn-ghost">Sign in</button>
                  <button onClick={() => navigate('/register')} className="btn-primary">Create account</button>
                </div>
              </div>
            )}
          </section>

          <div className="flex items-center justify-between">
            <button className="btn-ghost" onClick={() => navigate(-1)}>Back</button>
            <button className="btn-primary" onClick={() => navigate('/chat')}>Open chat</button>
          </div>
        </div>
      </div>
    </div>
  );
}


