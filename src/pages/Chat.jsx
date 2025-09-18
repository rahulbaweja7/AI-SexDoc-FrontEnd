import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE = "https://ai-sexdoc-backend.onrender.com";

export default function Chat() {
  const startBtnRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [listeningStatus, setListeningStatus] = useState("");
  const preferredVoice = usePreferredVoice();

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
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: input })
    });
    const data = await res.json();
    return data.reply || "Sorry, I couldn't get a response.";
  }

  function sendToBot(content) {
    appendMessage("You", content);
    setIsTypingStopped(false);
    setIsProcessing(true);
    getAIResponse(content)
      .then(reply => {
        playVoice(reply);
        typeBotReply(reply);
      })
      .catch(() => appendMessage("SERA", "Something went wrong."))
      .finally(() => {
        setIsProcessing(false);
        if (startBtnRef.current) startBtnRef.current.disabled = false;
      });
  }

  function typeBotReply(text) {
    let index = 0;
    const interval = setInterval(() => {
      if (isTypingStopped) {
        clearInterval(interval);
        return;
      }
      const partial = text.slice(0, index++);
      setMessages(prev => [...prev.filter((_, i) => i !== prev.length - 1), { sender: 'SERA', content: partial }]);
      if (index === 1) {
        setMessages(prev => [...prev, { sender: 'SERA', content: '' }]);
      }
      if (index > text.length) clearInterval(interval);
    }, 35);
  }

  return (
    <div className="max-w-[900px] mx-auto px-[clamp(16px,5vw,40px)] py-8">
      <h1 className="text-3xl font-extrabold mb-2">Meet <span className="text-[#ff6b6b]">SERA</span> — your sexual education and relationship assistant</h1>
      <p className="italic text-slate-700 mb-4">Talk away.</p>

      <div className="h-[420px] overflow-y-auto p-4 bg-white rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,.06)] mb-4 grid-lines">
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
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask anything" className="flex-1 border-0 outline-none text-[16px] px-4 py-2 rounded-full" />
        <button ref={startBtnRef} onClick={() => { if (!recognition || isProcessing) return; recognition.start(); setListeningStatus('Recording...'); if (startBtnRef.current) startBtnRef.current.disabled = true; }} className="border-0 bg-transparent cursor-pointer ml-2 text-[18px]">🎙️</button>
        <button onClick={() => { if (recognition) recognition.stop(); setIsTypingStopped(true); speechSynthesis.cancel(); setListeningStatus('Typing or voice interrupted.'); }} className="border-0 bg-transparent cursor-pointer ml-2 text-[18px]">⏹️</button>
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


