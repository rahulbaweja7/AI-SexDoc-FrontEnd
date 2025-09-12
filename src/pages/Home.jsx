import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 8 }}>From questions to confidence—meet <span style={{ color: '#ff6b6b' }}>SERA</span>.</h1>
      <p style={{ color: '#555', marginBottom: 16 }}>A modern assistant for sexual education and relationships. Clear answers, calm guidance, and zero judgment.</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate('/chat')} style={primaryBtn}>Start chatting</button>
        <button onClick={() => navigate('/about')} style={ghostBtn}>Learn more</button>
      </div>
    </div>
  );
}

const primaryBtn = { background: '#3b82f6', color: '#fff', border: 0, padding: '12px 18px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' };
const ghostBtn = { background: '#fff', border: '1px solid #e5e7eb', padding: '12px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 700 };


