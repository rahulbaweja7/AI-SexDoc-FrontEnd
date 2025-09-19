import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { createSession, getSession, addMessageToSession, getAllSessions } from '../utils/sessions.js';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isStaticServer = typeof window !== 'undefined' && window.location.port === '5500';
const API_BASE = isLocal && isStaticServer ? '/api' : (isLocal ? 'http://localhost:3001' : 'https://ai-sexdoc-backend.onrender.com');

function IconMic({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 14a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v3a4 4 0 0 0 4 4z"/>
      <path d="M19 10a7 7 0 0 1-14 0"/>
      <path d="M12 19v-3"/>
    </svg>
  );
}

function IconStop({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" ry="2" />
    </svg>
  );
}

function IconSend({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  );
}

function IconMenu({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function Chat() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialSessionId = params.get('session') || '';
  const [sessionId, setSessionId] = useState(initialSessionId);

  const startBtnRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const isTypingStoppedRef = useRef(false);
  const typingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isComposingRef = useRef(false);
  const containerRef = useRef(null);
  const greetedRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [listeningStatus, setListeningStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionList, setSessionList] = useState(() => getAllSessions());
  const preferredVoice = usePreferredVoice();

  useEffect(() => { console.log('[SERA] Using API_BASE:', API_BASE); }, []); // eslint-disable-line
  useEffect(() => { isTypingStoppedRef.current = isTypingStopped; }, [isTypingStopped]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return; el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onboardingDone = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;

  const recognition = useMemo(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return null; const r = new SR(); r.lang = 'en-US'; r.interimResults = true; return r;
  }, []);

  useEffect(() => {
    if (!recognition) return; let userSpeech = "";
    recognition.onresult = e => { const transcript = Array.from(e.results).map(r => r[0].transcript).join(''); userSpeech = transcript.trim(); };
    recognition.onend = () => { if (userSpeech) { sendToBot(userSpeech); } else { setListeningStatus("No speech detected."); if (startBtnRef.current) startBtnRef.current.disabled = false; } };
  }, [recognition]);

  useEffect(() => {
    if (!sessionId) return; const s = getSession(sessionId);
    if (s && s.messages.length) { setMessages(s.messages); greetedRef.current = true; }
  }, [sessionId]);

  function refreshSessions() { setSessionList(getAllSessions()); }
  useEffect(() => { refreshSessions(); }, []);

  useEffect(() => { if (greetedRef.current) return; greetedRef.current = true; setMessages(prev => prev.length === 0 ? [{ sender: 'SERA', content: "Hi, I’m SERA. I’m here for you—ask anything, or tap the mic to speak." }] : prev); }, []);

  function appendMessage(sender, content) { setMessages(prev => [...prev, { sender, content }]); }

  function playVoice(text) { const utter = new SpeechSynthesisUtterance(text); if (preferredVoice) utter.voice = preferredVoice; utter.rate = 1; utter.pitch = 1.05; speechSynthesis.cancel(); speechSynthesis.speak(utter); }

  function persistHistory(entry) { try { const key = 'sera.localHistory'; const list = JSON.parse(localStorage.getItem(key) || '[]'); list.push(entry); localStorage.setItem(key, JSON.stringify(list.slice(-200))); } catch {} }

  async function getAIResponse(input) {
    if (abortControllerRef.current) abortControllerRef.current.abort(); const controller = new AbortController(); abortControllerRef.current = controller;
    const headers = { 'Content-Type': 'application/json' }; if (token) headers['Authorization'] = `Bearer ${token}`;
    let res; try { res = await fetch(`${API_BASE}/ask`, { method: 'POST', headers, body: JSON.stringify({ userMessage: input }), signal: controller.signal }); }
    catch (networkErr) { if (controller.signal.aborted) throw new Error('Request cancelled'); console.error('[SERA] Network error calling /ask:', networkErr); throw new Error('Network error (check CORS, server running, or URL)'); }
    let raw=''; try { raw = await res.text(); } catch {}
    let data=null; try { data = raw ? JSON.parse(raw) : null; } catch {}
    if (!res.ok) { console.error('[SERA] /ask failed', res.status, raw); throw new Error(`HTTP ${res.status}${raw ? `: ${raw.slice(0,200)}` : ''}`); }
    const reply = data?.reply || data?.message || ''; if (!reply) { console.error('[SERA] Missing reply in response body:', data ?? raw); throw new Error('Empty response from server'); }
    return reply;
  }

  function clearTypingInterval() { if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; } }

  function sendToBot(content) {
    setListeningStatus(''); appendMessage("You", content); setIsTypingStopped(false); clearTypingInterval(); setIsProcessing(true);
    const startedAt = Date.now();
    if (!sessionId) { const s = createSession(text.slice(0, 60) || 'New chat'); setSessionId(s.id); navigate(`/chat?session=${encodeURIComponent(s.id)}`); refreshSessions(); }
    if (sessionId) addMessageToSession(sessionId, { sender: 'You', content, timestamp: startedAt });
    getAIResponse(content)
      .then(reply => { playVoice(reply); typeBotReply(reply); const entry = { timestamp: startedAt, userMessage: content, reply }; persistHistory(entry); if (sessionId) addMessageToSession(sessionId, { sender: 'SERA', content: reply, timestamp: Date.now() }); refreshSessions(); try { const headers = { 'Content-Type': 'application/json' }; if (token) headers['Authorization'] = `Bearer ${token}`; fetch(`${API_BASE}/history`, { method: 'POST', headers, body: JSON.stringify(entry) }).catch(() => {}); } catch {} })
      .catch((err) => { if (err.message === 'Request cancelled') return; appendMessage("SERA", `Something went wrong: ${err.message}`); })
      .finally(() => { setIsProcessing(false); if (startBtnRef.current) startBtnRef.current.disabled = false; });
  }

  function typeBotReply(text) {
    clearTypingInterval(); setMessages(prev => [...prev, { sender: 'SERA', content: '' }]);
    let index = 0; typingIntervalRef.current = setInterval(() => { if (isTypingStoppedRef.current) { clearTypingInterval(); return; } index += 1; const partial = text.slice(0, index); setMessages(prev => { if (prev.length === 0) return prev; const updated = prev.slice(); const lastIdx = updated.length - 1; updated[lastIdx] = { sender: 'SERA', content: partial }; return updated; }); if (index >= text.length) clearTypingInterval(); }, 35);
  }

  function stopAll() { setIsTypingStopped(true); speechSynthesis.cancel(); clearTypingInterval(); if (abortControllerRef.current) abortControllerRef.current.abort(); if (recognition) recognition.stop(); setListeningStatus('Typing or voice interrupted.'); }

  function newChat() { setIsTypingStopped(true); speechSynthesis.cancel(); clearTypingInterval(); if (abortControllerRef.current) abortControllerRef.current.abort(); if (recognition) recognition.stop(); setText(''); setListeningStatus(''); const s = createSession('New chat'); setSessionId(s.id); navigate(`/chat?session=${encodeURIComponent(s.id)}`); greetedRef.current = true; setMessages([{ sender: 'SERA', content: "New chat started. How can I help?" }]); refreshSessions(); }

  function openSession(id) { setSessionId(id); navigate(`/chat?session=${encodeURIComponent(id)}`); const s = getSession(id); setMessages(s?.messages || []); setSidebarOpen(false); }

  function handleKeyDown(e) { if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) { e.preventDefault(); const value = text.trim(); if (value) { sendToBot(value); setText(''); } } }

  return (
    <div className="relative h-screen md:pl-72">
      {/* Pinned sidebar on md+ (full height, pleasant gradient) */}
      <div className="hidden md:block fixed z-40 left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-700">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-bold text-slate-800 dark:text-slate-100">Conversations</div>
          <button onClick={newChat} className="px-3 py-1.5 rounded-md border border-slate-200 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">+ New</button>
        </div>
        <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-56px)] pr-1">
          {sessionList.map(s => (
            <button key={s.id} onClick={() => openSession(s.id)} className={`w-full text-left p-3 rounded-lg text-slate-800 dark:text-slate-100 ${sessionId===s.id ? 'bg-slate-100 dark:bg-slate-700/60' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'}`}>
              <div className="font-semibold truncate">{s.title || 'Untitled chat'}</div>
              <div className="text-xs text-slate-500 truncate">{new Date(s.updatedAt || s.createdAt).toLocaleString()}</div>
            </button>
          ))}
          {sessionList.length === 0 && <div className="text-sm text-slate-500">No conversations yet.</div>}
        </div>
      </div>

      {/* Mobile rail + drawer start at top */}
      <div className="md:hidden fixed left-0 top-0 bottom-0 w-12 z-30 flex flex-col items-center gap-3 pt-3 bg-transparent">
        <button onClick={() => { setSidebarOpen(true); refreshSessions(); }} className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm"><IconMenu className="w-5 h-5"/></button>
      </div>

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden fixed z-40 left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 transition-transform`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="font-bold text-slate-800 dark:text-slate-100">Conversations</div>
          <button onClick={() => setSidebarOpen(false)} className="px-2 py-1 rounded-md border border-slate-200 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100">×</button>
        </div>
        <div className="p-3">
          <button onClick={newChat} className="w-full mb-3 inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">+ New chat</button>
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-96px)] pr-1">
            {sessionList.map(s => (
              <button key={s.id} onClick={() => openSession(s.id)} className={`w-full text-left p-3 rounded-lg text-slate-800 dark:text-slate-100 ${sessionId===s.id ? 'bg-slate-100 dark:bg-slate-700/60' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'}`}>
                <div className="font-semibold truncate">{s.title || 'Untitled chat'}</div>
                <div className="text-xs text-slate-500 truncate">{new Date(s.updatedAt || s.createdAt).toLocaleString()}</div>
              </button>
            ))}
            {sessionList.length === 0 && <div className="text-sm text-slate-500">No conversations yet.</div>}
          </div>
        </div>
      </div>
      {sidebarOpen && (<div onClick={() => setSidebarOpen(false)} className="md:hidden fixed z-30 top-0 left-0 right-0 bottom-0 bg-black/20"/>) }

      {/* Chat content area */}
      <div className="max-w-[1200px] mx-auto px-[clamp(16px,5vw,40px)] py-4 h-full flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <img src="/logo-sera.png?v=2" alt="SERA" className="w-10 h-10 rounded" loading="lazy" />
            <div>
              <h1 className="text-3xl font-extrabold leading-tight">Meet <span className="text-[#ff6b6b]">SERA</span> — your sexual education and relationship assistant</h1>
              <p className="italic text-slate-700">Talk away.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={newChat} className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50">New chat</button>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 bg-white rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.06)] mb-3 grid-lines">
          {messages.map((m, idx) => (
            <div key={idx} className={`mb-3 flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.sender === 'You' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'} max-w-[80%] px-4 py-2 rounded-2xl ${m.sender === 'You' ? 'rounded-br-sm' : 'rounded-bl-sm'} shadow-sm`}>
                <div className="text-sm opacity-80 mb-0.5 font-semibold">{m.sender}</div>
                <div>{m.content}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="italic mb-2">{listeningStatus}</p>

        <div className="flex items-center bg-white rounded-full p-2 shadow-[0_10px_30px_rgba(2,6,23,.06)]">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; }}
            placeholder="Ask anything (Enter to send, Shift+Enter for newline)"
            className="flex-1 border-0 outline-none text-[16px] px-4 py-2 rounded-full"
          />
          <button aria-label="Start voice input" title="Start voice input" ref={startBtnRef} onClick={() => { if (!recognition || isProcessing) return; recognition.start(); setListeningStatus('Recording...'); if (startBtnRef.current) startBtnRef.current.disabled = true; }} className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 ml-2"><IconMic className="w-5 h-5" /></button>
          <button aria-label="Stop" title="Stop" onClick={stopAll} className="inline-flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 ml-2"><IconStop className="w-5 h-5" /></button>
          <button aria-label="Send" title="Send" onClick={() => { if (text.trim()) { sendToBot(text.trim()); setText(''); } }} className="ml-2 btn-gradient rounded-full w-12 h-12 inline-flex items-center justify-center"><IconSend className="w-5 h-5 text-white" /></button>
        </div>
      </div>
    </div>
  );
}

function usePreferredVoice() { const [voice, setVoice] = useState(null); useEffect(() => { function pick() { const voices = speechSynthesis.getVoices(); const v = voices.find(v => v.name?.includes('Samantha') || v.name?.includes('Zira')) || voices.find(v => v.lang?.includes('en')) || null; setVoice(v); } window.speechSynthesis.onvoiceschanged = pick; pick(); }, []); return voice; }

const btnIcon = { border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 8, fontSize: 18 };


