import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/* ── Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="w-10 h-[22px] rounded-full bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-zinc-900 dark:peer-checked:bg-white transition-colors relative after:content-[''] after:absolute after:w-[18px] after:h-[18px] after:rounded-full after:bg-white dark:after:bg-zinc-900 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-[18px] after:transition-transform after:shadow-sm" />
    </label>
  );
}

/* ── Section wrapper ── */
function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide uppercase">{title}</h2>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</div>
    </div>
  );
}

/* ── Row ── */
function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-zinc-900 dark:text-white">{label}</p>
        {desc && <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ── Danger button ── */
function DangerBtn({ onClick, children }) {
  return (
    <button onClick={onClick} className="text-[13px] font-medium px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
      {children}
    </button>
  );
}

/* ── Ghost button ── */
function GhostBtn({ onClick, children, as: As = 'button', ...props }) {
  return (
    <As onClick={onClick} {...props} className="text-[13px] font-medium px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
      {children}
    </As>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [theme, setTheme] = useState(() => localStorage.getItem('sera.theme') || 'light');
  const [enterToSend, setEnterToSend] = useState(() => (localStorage.getItem('sera.enterToSend') ?? '1') === '1');
  const [voiceEnabled, setVoiceEnabled] = useState(() => (localStorage.getItem('sera.voiceEnabled') ?? '1') === '1');
  const [typingSpeed, setTypingSpeed] = useState(() => parseInt(localStorage.getItem('sera.typingSpeedMs') || '18', 10));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => (localStorage.getItem('sera.sidebarCollapsedDefault') ?? '0') === '1');
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  useEffect(() => {
    localStorage.setItem('sera.theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => { localStorage.setItem('sera.enterToSend', enterToSend ? '1' : '0'); }, [enterToSend]);
  useEffect(() => { localStorage.setItem('sera.voiceEnabled', voiceEnabled ? '1' : '0'); }, [voiceEnabled]);
  useEffect(() => { localStorage.setItem('sera.typingSpeedMs', String(typingSpeed)); }, [typingSpeed]);
  useEffect(() => { localStorage.setItem('sera.sidebarCollapsedDefault', sidebarCollapsed ? '1' : '0'); }, [sidebarCollapsed]);

  function clearSessions() {
    if (!confirm('Clear all chat sessions?')) return;
    localStorage.removeItem('sera.sessions');
    showToast('Sessions cleared');
  }

  function clearAllData() {
    if (!confirm('This will clear all sessions, history, and onboarding. Continue?')) return;
    ['sera.sessions', 'sera.localHistory', 'sera.onboardingComplete'].forEach(k => localStorage.removeItem(k));
    showToast('All data cleared');
  }

  function exportData() {
    const data = {
      sessions: JSON.parse(localStorage.getItem('sera.sessions') || '[]'),
      localHistory: JSON.parse(localStorage.getItem('sera.localHistory') || '[]'),
      exportedAt: new Date().toISOString(),
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = 'sera-export.json';
    a.click();
    showToast('Export downloaded');
  }

  async function importData(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (Array.isArray(payload.sessions)) localStorage.setItem('sera.sessions', JSON.stringify(payload.sessions));
      if (Array.isArray(payload.localHistory)) localStorage.setItem('sera.localHistory', JSON.stringify(payload.localHistory));
      showToast('Data imported');
      ev.target.value = '';
    } catch (e) {
      showToast('Import failed: ' + e.message);
    }
  }

  const speedLabel = typingSpeed <= 12 ? 'Fast' : typingSpeed <= 25 ? 'Normal' : typingSpeed <= 50 ? 'Slow' : 'Very slow';

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0e0e10]">
      <div className="max-w-[640px] mx-auto px-5 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Tune SERA to your preferences.</p>
        </div>

        <div className="space-y-4">

          {/* Appearance */}
          <Section title="Appearance">
            <Row label="Theme" desc="Switch between light and dark mode">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {['light', 'dark'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all ${
                      theme === t
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Row>
          </Section>

          {/* Chat */}
          <Section title="Chat">
            <Row label="Enter to send" desc="Press Enter to send, Shift+Enter for new line">
              <Toggle checked={enterToSend} onChange={setEnterToSend} />
            </Row>
            <Row label="Voice replies" desc="Have SERA read responses aloud">
              <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} />
            </Row>
            <Row label="Collapse sidebar by default" desc="Show compact rail when opening chat">
              <Toggle checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
            </Row>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[14px] font-medium text-zinc-900 dark:text-white">Typing speed</p>
                  <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">How fast SERA types out responses</p>
                </div>
                <span className="text-[13px] font-semibold text-zinc-900 dark:text-white tabular-nums">{speedLabel}</span>
              </div>
              <input
                type="range" min="8" max="60" step="1" value={typingSpeed}
                onChange={e => setTypingSpeed(parseInt(e.target.value, 10))}
                className="w-full h-1.5 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-zinc-400">Fast</span>
                <span className="text-[11px] text-zinc-400">Slow</span>
              </div>
            </div>
          </Section>

          {/* Data */}
          <Section title="Privacy & data">
            <div className="px-5 py-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <GhostBtn onClick={exportData}>Export data</GhostBtn>
                <GhostBtn as="label">
                  Import data
                  <input type="file" accept="application/json" className="hidden" onChange={importData} />
                </GhostBtn>
                <GhostBtn onClick={clearSessions}>Clear sessions</GhostBtn>
              </div>
              <div className="pt-1">
                <DangerBtn onClick={clearAllData}>Clear all local data</DangerBtn>
              </div>
            </div>
          </Section>

          {/* Account */}
          <Section title="Account">
            {isAuthenticated ? (
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-4">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                      {(user?.name || user?.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <GhostBtn onClick={() => { localStorage.setItem('sera.onboardingComplete', '0'); navigate('/onboarding'); }}>
                    Re-run onboarding
                  </GhostBtn>
                  <DangerBtn onClick={logout}>Sign out</DangerBtn>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <p className="text-[14px] text-zinc-500 dark:text-zinc-400">Not signed in</p>
                <button onClick={() => navigate('/login')} className="text-[13px] font-semibold px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
                  Sign in
                </button>
              </div>
            )}
          </Section>

          {/* Nav */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => navigate(-1)} className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
              ← Back
            </button>
            <button onClick={() => navigate('/chat')} className="text-[13px] font-semibold px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity">
              Open chat →
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-medium shadow-xl transition-all duration-300 ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {toast}
      </div>
    </div>
  );
}
