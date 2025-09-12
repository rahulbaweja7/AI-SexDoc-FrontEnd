import React, { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = "https://ai-sexdoc-backend.onrender.com";

export default function Chat() {
  const startBtnRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [listeningStatus, setListeningStatus] = useState("");
  const preferredVoice = usePreferredVoice();

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
    <div className="chat-section" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 8 }}>Meet <span style={{ color: '#ff6b6b' }}>SERA</span> — your sexual education and relationship assistant</h1>
      <p style={{ fontStyle: 'italic', color: '#444', marginBottom: 16 }}>Talk away.</p>

      <div style={{ maxHeight: 400, overflowY: 'auto', padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: 12 }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 8, padding: '10px 12px', borderRadius: 10, background: m.sender === 'You' ? '#e0f0ff' : '#fce4ec' }}>
            <strong>{m.sender}:</strong> {m.content}
          </div>
        ))}
      </div>
      <p style={{ fontStyle: 'italic', marginBottom: 8 }}>{listeningStatus}</p>

      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 999, padding: '8px 12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask anything" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: '8px 12px' }} />
        <button ref={startBtnRef} onClick={() => { if (!recognition || isProcessing) return; recognition.start(); setListeningStatus('Recording...'); if (startBtnRef.current) startBtnRef.current.disabled = true; }} style={btnIcon}>🎙️</button>
        <button onClick={() => { if (recognition) recognition.stop(); setIsTypingStopped(true); speechSynthesis.cancel(); setListeningStatus('Typing or voice interrupted.'); }} style={btnIcon}>⏹️</button>
        <button onClick={() => { if (text.trim()) { sendToBot(text.trim()); setText(''); } }} style={{ ...btnIcon, background: '#3b82f6', color: '#fff', borderRadius: 999 }}>➤</button>
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


