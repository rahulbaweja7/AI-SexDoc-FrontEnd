import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isStaticServer = typeof window !== 'undefined' && window.location.port === '5500';
const API_BASE = isLocal && isStaticServer ? '/api' : (isLocal ? 'http://localhost:3001' : 'https://ai-sexdoc-backend.onrender.com');

export default function Chat() {
  const startBtnRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const isTypingStoppedRef = useRef(false);
  const typingIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isComposingRef = useRef(false);
  const containerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [listeningStatus, setListeningStatus] = useState("");
  const preferredVoice = usePreferredVoice();

  useEffect(() => {
    // Dev visibility for endpoint selection
    // eslint-disable-next-line no-console
    console.log('[SERA] Using API_BASE:', API_BASE);
  }, []);

  useEffect(() => { isTypingStoppedRef.current = isTypingStopped; }, [isTypingStopped]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onboardingDone = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace />;
  }

  const recognition = useMemo(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = true;
    return r;
  }, []);

  useEffect(() => {
    if (!recognition) return;
    let userSpeech = "";
    recognition.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      userSpeech = transcript.trim();
    };
    recognition.onend = () => {
      if (userSpeech) {
        sendToBot(userSpeech);
      } else {
        setListeningStatus("No speech detected.");
        if (startBtnRef.current) startBtnRef.current.disabled = false;
      }
    };
  }, [recognition]);

  function appendMessage(sender, content) {
    setMessages(prev => [...prev, { sender, content }]);
  }

  function playVoice(text) {
    const utter = new SpeechSynthesisUtterance(text);
    if (preferredVoice) utter.voice = preferredVoice;
    utter.rate = 1; utter.pitch = 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  async function getAIResponse(input) {
    // Abort any in-flight request
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let res;
    try {
      res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: input }),
        signal: controller.signal,
      });
    } catch (networkErr) {
      if (controller.signal.aborted) throw new Error('Request cancelled');
      // eslint-disable-next-line no-console
      console.error('[SERA] Network error calling /ask:', networkErr);
      throw new Error('Network error (check CORS, server running, or URL)');
    }

    let raw = '';
    try {
      raw = await res.text();
    } catch (readErr) {
      // ignore; fall through
    }

    // Try to parse JSON if present
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {
      // non-JSON, keep raw body
    }

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('[SERA] /ask failed', res.status, raw);
      throw new Error(`HTTP ${res.status}${raw ? `: ${raw.slice(0, 200)}` : ''}`);
    }

    const reply = data?.reply || data?.message || '';
    if (!reply) {
      // eslint-disable-next-line no-console
      console.error('[SERA] Missing reply in response body:', data ?? raw);
      throw new Error('Empty response from server');
    }
    return reply;
  }

  function clearTypingInterval() {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }

  function sendToBot(content) {
    // Clear any previous interruption/status message when sending anew
    setListeningStatus('');

    appendMessage("You", content);
    setIsTypingStopped(false);
    clearTypingInterval();
    setIsProcessing(true);
    getAIResponse(content)
      .then(reply => {
        playVoice(reply);
        typeBotReply(reply);
      })
      .catch((err) => {
        if (err.message === 'Request cancelled') return; // user stopped
        appendMessage("SERA", `Something went wrong: ${err.message}`);
      })
      .finally(() => {
        setIsProcessing(false);
        if (startBtnRef.current) startBtnRef.current.disabled = false;
      });
  }

  function typeBotReply(text) {
    clearTypingInterval();
    // Add placeholder first
    setMessages(prev => [...prev, { sender: 'SERA', content: '' }]);

    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      if (isTypingStoppedRef.current) {
        clearTypingInterval();
        return;
      }
      index += 1;
      const partial = text.slice(0, index);
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const updated = prev.slice();
        const lastIdx = updated.length - 1;
        updated[lastIdx] = { sender: 'SERA', content: partial };
        return updated;
      });
      if (index >= text.length) clearTypingInterval();
    }, 35);
  }

  function stopAll() {
    setIsTypingStopped(true);
    speechSynthesis.cancel();
    clearTypingInterval();
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (recognition) recognition.stop();
    setListeningStatus('Typing or voice interrupted.');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      const value = text.trim();
      if (value) {
        sendToBot(value);
        setText('');
      }
    }
  }

  return (
    <div className="max-w-[900px] mx-auto px-[clamp(16px,5vw,40px)] py-8">
      <h1 className="text-3xl font-extrabold mb-2">Meet <span className="text-[#ff6b6b]">SERA</span> — your sexual education and relationship assistant</h1>
      <p className="italic text-slate-700 mb-4">Talk away.</p>

      <div ref={containerRef} className="h-[420px] overflow-y-auto p-4 bg-white rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.06)] mb-4 grid-lines">
        {messages.map((m, idx) => (
          <div key={idx} className={`mb-3 flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${m.sender === 'You' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'} max-w-[75%] px-4 py-2 rounded-2xl ${m.sender === 'You' ? 'rounded-br-sm' : 'rounded-bl-sm'} shadow-sm`}>
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
        <button ref={startBtnRef} onClick={() => { if (!recognition || isProcessing) return; recognition.start(); setListeningStatus('Recording...'); if (startBtnRef.current) startBtnRef.current.disabled = true; }} className="border-0 bg-transparent cursor-pointer ml-2 text-[18px]">🎙️</button>
        <button onClick={stopAll} className="border-0 bg-transparent cursor-pointer ml-2 text-[18px]">⏹️</button>
        <button onClick={() => { if (text.trim()) { sendToBot(text.trim()); setText(''); } }} className="ml-2 btn-gradient rounded-full">➤</button>
      </div>
    </div>
  );
}

function usePreferredVoice() {
  const [voice, setVoice] = useState(null);
  useEffect(() => {
    function pick() {
      const voices = speechSynthesis.getVoices();
      const v = voices.find(v => v.name?.includes('Samantha') || v.name?.includes('Zira')) || voices.find(v => v.lang?.includes('en')) || null;
      setVoice(v);
    }
    window.speechSynthesis.onvoiceschanged = pick;
    pick();
  }, []);
  return voice;
}

const btnIcon = { border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 8, fontSize: 18 };


