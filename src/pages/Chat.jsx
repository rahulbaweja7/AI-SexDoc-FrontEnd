import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext.jsx';
import { createSession, getSession, addMessageToSession, getAllSessions, renameSession, deleteSession } from '../utils/sessions.js';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isDevProxy = typeof window !== 'undefined' && (window.location.port === '5500' || window.location.port === '5173');
const API_BASE = isLocal && isDevProxy ? '/api' : (isLocal ? 'http://localhost:3001' : 'https://ai-sexdoc-backend.onrender.com');

/* ── Icons ── */
function Icon({ d, className, fill }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill || 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const MicIcon = ({ className }) => <Icon className={className} d="M12 14a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v3a4 4 0 0 0 4 4zM19 10a7 7 0 0 1-14 0M12 19v-3" />;
const StopIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);
const SendIcon = ({ className }) => <Icon className={className} d={['M22 2L11 13', 'M22 2L15 22 11 13 2 9l20-7z']} />;
const PlusIcon = ({ className }) => <Icon className={className} d="M12 5v14M5 12h14" />;
const GearIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const DotsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
  </svg>
);
const HomeIcon = ({ className }) => <Icon className={className} d="M3 12L12 3l9 9M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />;
const ChevronLeftIcon = ({ className }) => <Icon className={className} d="M15 18l-6-6 6-6" />;

/* ── Avatar ── */
function Avatar({ src, name, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  if (src) return <img src={src} alt={name || ''} className={`${dim} rounded-full object-cover flex-shrink-0`} referrerPolicy="no-referrer" />;
  return (
    <div className={`${dim} rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-semibold text-zinc-600 dark:text-zinc-300 flex-shrink-0`}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="block w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }} />
      ))}
    </div>
  );
}

/* ── Main component ── */
export default function Chat() {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialSessionId = params.get('session') || '';
  const [sessionId, setSessionId] = useState(initialSessionId);

  const startBtnRef = useRef(null);
  const inputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const isTypingStoppedRef = useRef(false);
  const typingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isComposingRef = useRef(false);
  const containerRef = useRef(null);
  const greetedRef = useRef(false);
  const forceScrollRef = useRef(false);
  const skipNextSessionLoadRef = useRef(false);

  const [ratings, setRatings] = useState({});
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Talk mode
  const [talkMode, setTalkMode] = useState(false);
  const [talkStatus, setTalkStatus] = useState('idle'); // 'listening' | 'thinking' | 'speaking'
  const [talkTranscript, setTalkTranscript] = useState('');
  const talkActiveRef = useRef(false);
  const talkAudioRef = useRef(null);
  const messagesRef = useRef([]);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [listeningStatus, setListeningStatus] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => (localStorage.getItem('sera.sidebarCollapsedDefault') ?? '0') === '1');
  const [sessionList, setSessionList] = useState(() => getAllSessions());
  const preferredVoice = usePreferredVoice();
  const [menuSessionId, setMenuSessionId] = useState('');

  useEffect(() => { isTypingStoppedRef.current = isTypingStopped; }, [isTypingStopped]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Auto-scroll: if force-scrolling (after send), always scroll. Otherwise only scroll if already near bottom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (forceScrollRef.current) {
      el.scrollTop = el.scrollHeight;
      forceScrollRef.current = false;
      return;
    }
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const onboardingDone = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;

  const recognition = useMemo(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR(); r.lang = 'en-US'; r.interimResults = true; return r;
  }, []);

  useEffect(() => {
    if (!recognition) return;
    let userSpeech = '';
    recognition.onresult = e => { userSpeech = Array.from(e.results).map(r => r[0].transcript).join('').trim(); };
    recognition.onend = () => {
      if (userSpeech) { sendToBot(userSpeech); }
      else { setListeningStatus('No speech detected.'); if (startBtnRef.current) startBtnRef.current.disabled = false; }
    };
  }, [recognition]);

  useEffect(() => {
    if (!sessionId) return;
    if (skipNextSessionLoadRef.current) { skipNextSessionLoadRef.current = false; return; }
    const s = getSession(sessionId);
    if (s?.messages.length) { setMessages(s.messages); greetedRef.current = true; }
  }, [sessionId]);
  useEffect(() => { refreshSessions(); }, []);
  useEffect(() => {
    const close = () => setMenuSessionId('');
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    const profile = (() => { try { return JSON.parse(localStorage.getItem('sera.onboarding') || '{}'); } catch { return {}; } })();
    const name = profile.name ? ` ${profile.name}` : '';
    const topicLine = profile.topic && profile.topic !== 'something else'
      ? ` I know you're here for support with ${profile.topic} — that's exactly what I'm here for.`
      : " Ask me anything about sexual health, relationships, or your body.";
    const greeting = `Hey${name}! I'm SERA.${topicLine} No judgment, ever.`;
    setMessages(prev => prev.length === 0 ? [{ sender: 'SERA', content: greeting }] : prev);
  }, []);

  function refreshSessions() { setSessionList(getAllSessions()); }
  function appendMessage(sender, content) { setMessages(prev => [...prev, { sender, content }]); }
  const audioRef = useRef(null);

  function stopVoice() {
    speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }

  async function playVoice(text) {
    if ((localStorage.getItem('sera.voiceEnabled') ?? '1') !== '1') return;
    stopVoice();
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS unavailable');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch {
      // Fallback to browser TTS if ElevenLabs unavailable
      const utter = new SpeechSynthesisUtterance(text);
      if (preferredVoice) utter.voice = preferredVoice;
      utter.rate = 0.95;
      speechSynthesis.speak(utter);
    }
  }
  function persistHistory(entry) {
    try { const list = JSON.parse(localStorage.getItem('sera.localHistory') || '[]'); list.push(entry); localStorage.setItem('sera.localHistory', JSON.stringify(list.slice(-200))); } catch {}
  }

  function clearTypingInterval() { if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; } }

  async function sendToBot(content) {
    setListeningStatus('');
    forceScrollRef.current = true; // force scroll to bottom when user sends
    appendMessage('You', content);
    setIsTypingStopped(false);
    clearTypingInterval();
    setIsProcessing(true);

    const startedAt = Date.now();
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const s = createSession(content.slice(0, 50) || 'New chat');
      currentSessionId = s.id;
      skipNextSessionLoadRef.current = true;
      setSessionId(s.id);
      navigate(`/chat?session=${encodeURIComponent(s.id)}`);
      refreshSessions();
    }
    addMessageToSession(currentSessionId, { sender: 'You', content, timestamp: startedAt });

    // Add empty SERA message — we'll stream tokens into it
    setMessages(prev => [...prev, { sender: 'SERA', content: '', typing: true }]);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let fullText = '';

    try {
      // Capture history before the user message we just appended
      const historySnapshot = messages.filter(m => m.content && !m.typing);

      // Read onboarding profile
      const profile = (() => { try { return JSON.parse(localStorage.getItem('sera.onboarding') || '{}'); } catch { return {}; } })();

      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userMessage: content, history: historySnapshot, profile }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Server error (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.token) {
              fullText += parsed.token;
              await new Promise(r => setTimeout(r, 18));
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { sender: 'SERA', content: fullText, typing: true };
                return updated;
              });
            }
          } catch (parseErr) {
            if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
          }
        }
      }

      // Mark done
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: 'SERA', content: fullText, typing: false };
        return updated;
      });

      if (fullText) {
        const entry = { timestamp: startedAt, userMessage: content, reply: fullText };
        persistHistory(entry);
        addMessageToSession(currentSessionId, { sender: 'SERA', content: fullText, timestamp: Date.now() });
        refreshSessions();
        try {
          const h = { 'Content-Type': 'application/json' };
          if (token) h['Authorization'] = `Bearer ${token}`;
          fetch(`${API_BASE}/history`, { method: 'POST', headers: h, body: JSON.stringify(entry) }).catch(() => {});
        } catch {}
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // User stopped — keep whatever streamed, just mark not typing
        setMessages(prev => {
          if (!prev.length || prev[prev.length - 1].sender !== 'SERA') return prev;
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], typing: false };
          return updated;
        });
      } else {
        setMessages(prev => {
          const trimmed = prev.length && prev[prev.length - 1].sender === 'SERA' && !prev[prev.length - 1].content
            ? prev.slice(0, -1)
            : prev;
          return [...trimmed, { sender: 'SERA', content: `Something went wrong: ${err.message}` }];
        });
      }
    } finally {
      setIsProcessing(false);
      if (startBtnRef.current) startBtnRef.current.disabled = false;
    }
  }

  /* ── Talk mode ── */
  function listenOnce() {
    return new Promise((resolve, reject) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { reject(new Error('Speech recognition not supported')); return; }
      const r = new SR();
      r.lang = 'en-US';
      r.interimResults = true;
      let interim = '';
      r.onresult = e => {
        interim = Array.from(e.results).map(res => res[0].transcript).join('');
        setTalkTranscript(interim);
      };
      r.onerror = e => { if (e.error === 'no-speech') resolve(''); else reject(e.error); };
      r.onend = () => resolve(interim.trim());
      r.start();
    });
  }

  async function speakTalk(text) {
    return new Promise(async (resolve) => {
      const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const VOICES = {
        female: 'EXAVITQu4vr4xnSDxMaL', // Bella
        male:   'pNInz6obpgDQGcFmaJgB',  // Adam
      };
      const voiceGender = localStorage.getItem('sera.voiceGender') || 'female';
      const voiceId = VOICES[voiceGender] || VOICES.female;

      try {
        if (!ELEVEN_KEY) throw new Error('No ElevenLabs key');
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
          body: JSON.stringify({
            text: text.slice(0, 800),
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.40, similarity_boost: 0.80, style: 0.45, use_speaker_boost: true },
          }),
        });
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`ElevenLabs ${res.status}: ${errBody}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        talkAudioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); talkAudioRef.current = null; resolve(); };
        audio.onerror = () => resolve();
        audio.play();
      } catch (err) {
        console.error('[TTS] ElevenLabs failed:', err.message);
        const utter = new SpeechSynthesisUtterance(text);
        if (preferredVoice) utter.voice = preferredVoice;
        utter.rate = 0.95;
        utter.onend = resolve;
        speechSynthesis.speak(utter);
      }
    });
  }

  async function runTalkLoop() {
    while (talkActiveRef.current) {
      setTalkStatus('listening');
      setTalkTranscript('');
      let transcript = '';
      try { transcript = await listenOnce(); } catch { break; }
      if (!talkActiveRef.current || !transcript) continue;

      setTalkStatus('thinking');
      setTalkTranscript('');
      let responseText = '';
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const profile = (() => { try { return JSON.parse(localStorage.getItem('sera.onboarding') || '{}'); } catch { return {}; } })();
        const historySnapshot = messagesRef.current.filter(m => m.content && !m.typing);
        const res = await fetch(`${API_BASE}/ask`, {
          method: 'POST', headers,
          body: JSON.stringify({ userMessage: transcript, history: historySnapshot, profile }),
        });
        if (!res.ok) throw new Error('Server error');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try { const p = JSON.parse(data); if (p.token) responseText += p.token; } catch {}
          }
        }
      } catch { break; }
      if (!talkActiveRef.current || !responseText) continue;

      // Save to chat history
      setMessages(prev => [...prev, { sender: 'You', content: transcript }, { sender: 'SERA', content: responseText }]);

      setTalkStatus('speaking');
      await speakTalk(responseText);
    }
    exitTalkMode();
  }

  function enterTalkMode() {
    stopAll();
    talkActiveRef.current = true;
    setTalkMode(true);
    setTalkStatus('listening');
    setTalkTranscript('');
    runTalkLoop();
  }

  function exitTalkMode() {
    talkActiveRef.current = false;
    setTalkMode(false);
    setTalkStatus('idle');
    setTalkTranscript('');
    speechSynthesis.cancel();
    if (talkAudioRef.current) { talkAudioRef.current.pause(); talkAudioRef.current = null; }
  }

  function stopAll() {
    setIsTypingStopped(true);
    stopVoice();
    clearTypingInterval();
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (recognition) recognition.stop();
    setListeningStatus('');
  }

  function newChat() {
    stopAll();
    setText('');
    setListeningStatus('');
    const s = createSession('New chat');
    setSessionId(s.id);
    navigate(`/chat?session=${encodeURIComponent(s.id)}`);
    greetedRef.current = true;
    const profile = (() => { try { return JSON.parse(localStorage.getItem('sera.onboarding') || '{}'); } catch { return {}; } })();
    const name = profile.name ? `, ${profile.name}` : '';
    setMessages([{ sender: 'SERA', content: `New chat — what's on your mind${name}?` }]);
    refreshSessions();
  }

  function openSession(id) {
    setSessionId(id);
    navigate(`/chat?session=${encodeURIComponent(id)}`);
    const s = getSession(id);
    setMessages(s?.messages || []);
    setSidebarOpen(false);
  }

  function handleKeyDown(e) {
    const enterToSend = (localStorage.getItem('sera.enterToSend') ?? '1') === '1';
    if (enterToSend && e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      const val = text.trim();
      if (val && !isProcessing) { sendToBot(val); setText(''); if (inputRef.current) inputRef.current.style.height = 'auto'; }
    }
  }

  /* ── Sidebar session list ── */
  const filteredSessions = sidebarSearch.trim()
    ? sessionList.filter(s => {
        const q = sidebarSearch.toLowerCase();
        if ((s.title || '').toLowerCase().includes(q)) return true;
        return (s.messages || []).some(m => m.content?.toLowerCase().includes(q));
      })
    : sessionList;

  function highlight(text, query) {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark className="bg-yellow-200 dark:bg-yellow-700/60 text-inherit rounded-sm">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>;
  }

  const SessionList = () => (
    <div className="flex-1 overflow-y-auto py-2 px-2 space-y-px">
      {filteredSessions.length === 0 && (
        <p className="text-[12px] text-zinc-400 dark:text-zinc-600 px-3 py-6 text-center">
          {sidebarSearch ? 'No results' : 'No chats yet'}
        </p>
      )}
      {filteredSessions.map(s => (
        <div key={s.id} className={`group relative rounded-xl transition-colors ${sessionId === s.id ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
          <button onClick={() => openSession(s.id)} className="w-[calc(100%-28px)] text-left px-3 py-2.5 block">
            <p className={`text-[13px] font-medium truncate leading-tight ${sessionId === s.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {highlight(s.title || 'Untitled', sidebarSearch)}
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
              {new Date(s.updatedAt || s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setMenuSessionId(prev => prev === s.id ? '' : s.id); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <DotsIcon className="w-3.5 h-3.5" />
          </button>
          {menuSessionId === s.id && (
            <div onClick={e => e.stopPropagation()} className="absolute z-50 right-2 top-full mt-1 w-36 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl py-1 text-[13px]">
              <button onClick={() => { const n = prompt('Rename', s.title || ''); if (n !== null) { renameSession(s.id, n.trim() || 'Untitled'); refreshSessions(); setMenuSessionId(''); } }} className="w-full text-left px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800">Rename</button>
              <button onClick={() => { if (confirm('Delete this chat?')) { deleteSession(s.id); refreshSessions(); setMenuSessionId(''); if (sessionId === s.id) { setSessionId(''); setMessages([]); } } }} className="w-full text-left px-3 py-2 text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800">Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
    <div className="flex h-screen bg-[#f9f9f7] dark:bg-[#0e0e10] overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 transition-[width] duration-200 border-r border-zinc-200/70 dark:border-zinc-800/70 bg-[#f3f3f1] dark:bg-[#141416] ${sidebarCollapsed ? 'w-14' : 'w-[220px]'}`}>
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-4 px-2">
            <button onClick={newChat} title="New chat" className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setSidebarCollapsed(false)} title="Expand" className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>
            <Link to="/settings" title="Settings" className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              <GearIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 pt-4 pb-2">
              <Link to="/" className="no-underline flex items-center gap-1.5 group">
                <img src="/logo-sera.png?v=2" alt="SERA" className="w-5 h-5 rounded-md opacity-90" />
                <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">SERA</span>
              </Link>
              <div className="flex items-center gap-1">
                <button onClick={newChat} title="New chat" className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setSidebarCollapsed(true)} title="Collapse" className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-700/50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-zinc-400 flex-shrink-0" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                  placeholder="Search chats…"
                  className="flex-1 bg-transparent text-[12px] text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
                />
                {sidebarSearch && (
                  <button onClick={() => setSidebarSearch('')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            </div>

            <SessionList />

            {/* Sidebar footer */}
            <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2">
              <Link to="/settings" className="flex items-center gap-2 flex-1 px-2 py-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors group">
                <GearIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                <span className="text-[12px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">Settings</span>
              </Link>
              {user && (
                <Avatar src={user.picture} name={user.name || user.email} size="sm" />
              )}
            </div>
          </>
        )}
      </aside>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" />
      )}
      <div className={`md:hidden fixed z-40 left-0 top-0 bottom-0 w-72 flex flex-col bg-[#f3f3f1] dark:bg-[#141416] border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-200/70 dark:border-zinc-800 flex-shrink-0">
          <Link to="/" className="no-underline flex items-center gap-2">
            <img src="/logo-sera.png?v=2" alt="SERA" className="w-5 h-5 rounded-md" />
            <span className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">SERA</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-3 pt-3 pb-2 space-y-2">
          <button onClick={() => { newChat(); setSidebarOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-medium">
            <PlusIcon className="w-3.5 h-3.5" /> New chat
          </button>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-200/60 dark:bg-zinc-700/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-zinc-400 flex-shrink-0" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              placeholder="Search chats…"
              className="flex-1 bg-transparent text-[12px] text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
            />
            {sidebarSearch && (
              <button onClick={() => setSidebarSearch('')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
        <SessionList />
        <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2">
          <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 flex-1 px-2 py-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <HomeIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Home</span>
          </Link>
          <Link to="/settings" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 flex-1 px-2 py-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <GearIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[12px] text-zinc-500 dark:text-zinc-400">Settings</span>
          </Link>
        </div>
      </div>

      {/* ── Main chat column ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Top bar */}
        <div className="flex items-center justify-between h-14 px-4 flex-shrink-0 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => { setSidebarOpen(true); refreshSessions(); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src="/logo-sera.png?v=2" alt="SERA" className="w-6 h-6 rounded-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-[#0e0e10]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-none">SERA</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5">always here</p>
              </div>
            </div>
          </div>
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
          >
            <PlusIcon className="w-3 h-3" /> New
          </button>
        </div>

        {/* Messages */}
        <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
            {messages.map((m, idx) => {
              const isUser = m.sender === 'You';
              return (
                <div key={idx} className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {isUser ? (
                    <Avatar src={user?.picture} name={user?.name || user?.email} size="sm" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 flex items-center justify-center flex-shrink-0">
                      <img src="/logo-sera.png?v=2" alt="" className="w-3.5 h-3.5 rounded-sm" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`max-w-[75%] min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1 group/msg`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-[1.6] ${
                      isUser
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm'
                        : 'bg-[#eeeeed] dark:bg-[#1e1e22] text-zinc-800 dark:text-zinc-100 rounded-bl-sm'
                    }`}>
                      {m.content === '' && !isUser ? <TypingDots /> : isUser ? m.content : (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 last:mb-0 pl-4 space-y-0.5 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 last:mb-0 pl-4 space-y-0.5 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            code: ({ children }) => <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[13px] font-mono">{children}</code>,
                            h1: ({ children }) => <p className="font-bold text-[15px] mb-1">{children}</p>,
                            h2: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                            h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    {!isUser && m.content && !m.typing && (
                      <div className="flex items-center gap-1">
                        <CopyButton text={m.content} />
                        <button
                          onClick={() => setRatings(r => ({ ...r, [idx]: r[idx] === 'up' ? null : 'up' }))}
                          className={`opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 ${ratings[idx] === 'up' ? '!opacity-100 text-emerald-500' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                          <svg viewBox="0 0 24 24" fill={ratings[idx] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                        </button>
                        <button
                          onClick={() => setRatings(r => ({ ...r, [idx]: r[idx] === 'down' ? null : 'down' }))}
                          className={`opacity-0 group-hover/msg:opacity-100 transition-opacity p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 ${ratings[idx] === 'down' ? '!opacity-100 text-red-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                          <svg viewBox="0 0 24 24" fill={ratings[idx] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 pb-5 pt-3">
          {listeningStatus && (
            <p className="text-[12px] text-zinc-400 text-center mb-2 animate-pulse">{listeningStatus}</p>
          )}
          <div className="max-w-[680px] mx-auto">
            <div className="flex items-end gap-2 bg-white dark:bg-[#1a1a1d] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] transition-shadow focus-within:border-zinc-400 dark:focus-within:border-zinc-600">
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => { isComposingRef.current = true; }}
                onCompositionEnd={() => { isComposingRef.current = false; }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'; }}
                placeholder="Ask anything…"
                rows={1}
                className="flex-1 border-0 outline-none text-[14px] text-zinc-900 dark:text-zinc-100 bg-transparent placeholder-zinc-400 dark:placeholder-zinc-600 resize-none py-1 px-1 leading-relaxed"
                style={{ maxHeight: '140px' }}
              />
              <div className="flex items-center gap-1 pb-0.5 flex-shrink-0">
                <button
                  ref={startBtnRef}
                  onClick={() => { if (!recognition || isProcessing) return; recognition.start(); setListeningStatus('Listening…'); if (startBtnRef.current) startBtnRef.current.disabled = true; }}
                  title="Voice input"
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${listeningStatus === 'Listening…' ? 'text-[#ff6b6b] bg-[#ff6b6b]/10' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                >
                  <MicIcon className="w-4 h-4" />
                </button>
                {isProcessing ? (
                  <button onClick={stopAll} title="Stop" className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                    <StopIcon className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { const val = text.trim(); if (val) { sendToBot(val); setText(''); if (inputRef.current) inputRef.current.style.height = 'auto'; } }}
                    disabled={!text.trim()}
                    title="Send"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                  >
                    <SendIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2.5 px-1">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                SERA can make mistakes. For medical concerns, consult a professional.
              </p>
              <button
                onClick={enterTalkMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/25 text-[#ff6b6b] text-[12px] font-medium hover:bg-[#ff6b6b]/20 transition-colors flex-shrink-0 ml-3"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <rect x="1" y="8"  width="2.5" height="4"  rx="1.25"/>
                  <rect x="5" y="5"  width="2.5" height="10" rx="1.25"/>
                  <rect x="9" y="6.5" width="2.5" height="7" rx="1.25"/>
                  <rect x="13" y="3" width="2.5" height="14" rx="1.25"/>
                  <rect x="17" y="6" width="2.5" height="8"  rx="1.25"/>
                </svg>
                Talk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Talk mode overlay */}
    {talkMode && <TalkModeOverlay status={talkStatus} transcript={talkTranscript} onExit={exitTalkMode} />}
    </>
  );
}

function TalkModeOverlay({ status, transcript, onExit }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0b]">

      {/* Orb */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        {status === 'listening' && [1, 2, 3].map(i => (
          <div key={i} className="absolute rounded-full" style={{
            width: 96 + i * 44, height: 96 + i * 44,
            background: 'rgba(255,107,107,0.08)',
            animation: `talkRipple 2s ease-out ${(i - 1) * 0.5}s infinite`,
          }} />
        ))}
        {status === 'speaking' && [1, 2].map(i => (
          <div key={i} className="absolute rounded-full" style={{
            width: 96 + i * 40, height: 96 + i * 40,
            background: 'rgba(167,139,250,0.08)',
            animation: `talkPulse 1.4s ease-in-out ${(i - 1) * 0.3}s infinite`,
          }} />
        ))}
        <div className="relative z-10 w-24 h-24 rounded-full" style={{
          background: status === 'listening'
            ? 'radial-gradient(circle at 35% 35%, #ff9898, #ff6b6b)'
            : status === 'speaking'
            ? 'radial-gradient(circle at 35% 35%, #c4b5fd, #7c3aed)'
            : 'radial-gradient(circle at 35% 35%, #52525b, #3f3f46)',
          boxShadow: status === 'listening'
            ? '0 0 70px rgba(255,107,107,0.45), 0 0 140px rgba(255,107,107,0.12)'
            : status === 'speaking'
            ? '0 0 70px rgba(167,139,250,0.45), 0 0 140px rgba(167,139,250,0.12)'
            : '0 0 30px rgba(255,255,255,0.04)',
          animation: status === 'thinking' ? 'talkBreathe 2s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* Status */}
      <p className="mt-6 text-[15px] tracking-wide text-zinc-400">
        {status === 'listening' ? 'Listening…' : status === 'thinking' ? 'Thinking…' : status === 'speaking' ? 'Speaking…' : ''}
      </p>

      {/* Live transcript */}
      <div className="mt-3 h-10 flex items-center justify-center px-10 max-w-sm">
        {transcript && <p className="text-[13px] text-zinc-600 text-center leading-relaxed">{transcript}</p>}
      </div>

      {/* End button */}
      <button
        onClick={onExit}
        className="mt-14 flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white text-[14px] font-medium transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rotate-[135deg]">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        End conversation
      </button>

      <style>{`
        @keyframes talkRipple {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.9);  opacity: 0;   }
        }
        @keyframes talkPulse {
          0%, 100% { transform: scale(1);    opacity: 0.8; }
          50%       { transform: scale(1.18); opacity: 0.3; }
        }
        @keyframes talkBreathe {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.08); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-emerald-500" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function usePreferredVoice() {
  const [voice, setVoice] = useState(null);
  useEffect(() => {
    function pick() {
      const voices = speechSynthesis.getVoices();
      const en = voices.filter(v => v.lang?.startsWith('en'));
      // Priority: Premium > Enhanced > Natural/Online > known-good names > any English
      const preferred = (
        en.find(v => v.name?.includes('Premium')) ||
        en.find(v => v.name?.includes('Enhanced')) ||
        en.find(v => v.name?.includes('Natural')) ||
        en.find(v => v.name?.includes('Online')) ||
        en.find(v => /Ava|Allison|Jenny|Aria|Libby|Samantha/.test(v.name)) ||
        en[0] ||
        null
      );
      setVoice(preferred);
    }
    window.speechSynthesis.onvoiceschanged = pick;
    pick();
  }, []);
  return voice;
}
