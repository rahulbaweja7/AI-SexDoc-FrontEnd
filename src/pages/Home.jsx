import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-landing">
      <style>{css}</style>
      <div className="container">
        <div className="nav">
          <div className="brand">S<span>ERA</span></div>
          <div>
            <Link to="/about">About</Link>
            <Link to="/history">History</Link>
            <Link className="cta" to="/chat">Go to Chat</Link>
          </div>
        </div>

        <section className="hero">
          <div>
            <div className="eyebrow">Private by design • Free to try</div>
            <h1 className="hero-title">From questions to confidence—meet <span className="accent">SERA</span>.</h1>
            <p className="subtitle">A modern assistant for sexual education and relationships. Clear answers, calm guidance, and zero judgment.</p>
            <div className="actions">
              <button className="btn primary" onClick={() => navigate('/chat')}>Start chatting</button>
              <button className="btn ghost" onClick={() => navigate('/about')}>Learn more</button>
            </div>
            <div className="checks">
              <div className="check"><span className="dot"></span> Anonymous & local-first experience</div>
              <div className="check"><span className="dot" style={{ background:'#3b82f6' }}></span> Clear, age-appropriate guidance</div>
              <div className="check"><span className="dot" style={{ background:'#f59e0b' }}></span> Voice in and out</div>
              <div className="check"><span className="dot" style={{ background:'#ef4444' }}></span> Open-source friendly</div>
            </div>

            <div className="trust">
              <span className="badge">🔒 Privacy-first</span>
              <span className="badge">🛡️ Secure by design</span>
              <span className="badge">⚡ Fast responses</span>
              <span className="badge">🌍 Free to use</span>
            </div>
          </div>

          <div className="preview">
            <div className="top">
              <strong>Chat Preview</strong>
              <small style={{ color: 'var(--muted)' }}>Live demo</small>
            </div>
            <div className="status" style={{ marginBottom: 14 }}>
              <div className="pill"><small>Applied</small>42</div>
              <div className="pill"><small>Interview</small>7</div>
              <div className="pill"><small>Learned</small>99+</div>
            </div>
            <div className="card" style={{ background:'#f8fafc', borderColor:'#eef2ff' }}>
              <div style={{ fontWeight:700, marginBottom:8 }}>“How do I talk to my partner about boundaries?”</div>
              <div style={{ color:'var(--muted)' }}>SERA helps you prepare calm, confident conversations—tailored to your needs.</div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="grid">
            <div className="card">
              <div>🎙️</div>
              <h3>Talk or type—your choice</h3>
              <p>Use voice input and natural-sounding replies to keep the flow going anywhere.</p>
            </div>
            <div className="card">
              <div>🧭</div>
              <h3>Guidance, not judgment</h3>
              <p>Get supportive answers backed by best practices in sexual education.</p>
            </div>
            <div className="card">
              <div>🗂️</div>
              <h3>Save your progress</h3>
              <p>History view keeps key takeaways handy for quick review later.</p>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stats-grid">
            <div className="stat"><div className="num">10k+</div><div className="label">Questions answered</div></div>
            <div className="stat"><div className="num">95%</div><div className="label">User satisfaction</div></div>
            <div className="stat"><div className="num">24/7</div><div className="label">Private availability</div></div>
            <div className="stat"><div className="num">0</div><div className="label">Tracking cookies</div></div>
          </div>
        </section>

        <section className="how">
          <div className="steps">
            <div className="step">
              <div className="n">1</div>
              <h3>Ask anything</h3>
              <p className="subtitle">Speak or type your question—no login required.</p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3>Get clear guidance</h3>
              <p className="subtitle">Evidence-informed, age-appropriate tips tailored to you.</p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3>Take action</h3>
              <p className="subtitle">Save insights, revisit history, and keep building confidence.</p>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <div className="t-grid">
            <div className="quote">“SERA helped me plan a respectful conversation. I felt heard and prepared.”<strong>University student</strong></div>
            <div className="quote">“I love the calm tone and the privacy-first design.”<strong>High school teacher</strong></div>
            <div className="quote">“Fast, thoughtful, and judgment-free. Exactly what I needed.”<strong>New parent</strong></div>
          </div>
        </section>

        <div className="cta-banner">
          <div>
            <h3 style={{ margin: 0, marginBottom: 6 }}>Ready to try SERA?</h3>
            <p>Private, free to start, and available whenever you are.</p>
          </div>
          <div>
            <button className="btn primary" onClick={() => navigate('/chat')}>Open the chat</button>
            <button className="btn ghost" onClick={() => navigate('/about')}>Learn more</button>
          </div>
        </div>

        <footer>
          <div className="brand">S<span>ERA</span></div>
          <div>
            <Link to="/about">About</Link>
            <Link to="/history">History</Link>
            <Link to="/chat">Chat</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

const css = `
.home-landing {
  --bg: #f7f8ff;
  --text: #0f172a;
  --muted: #475569;
  --primary: #3b82f6;
  --accent: #ff6b6b;
  --card: #ffffff;
  --ring: rgba(59, 130, 246, 0.25);
  color: var(--text);
  background: radial-gradient(1200px 600px at 80% -10%, #e7f0ff 0%, transparent 60%),
              radial-gradient(900px 600px at -10% 20%, #ffe9ef 0%, transparent 60%),
              linear-gradient(180deg, #fbfaff 0%, #f7f8ff 100%);
}
.home-landing .container { max-width: 1100px; margin: 0 auto; padding: 24px; }
.home-landing .nav { display: flex; align-items: center; justify-content: space-between; }
.home-landing .brand { font-weight: 800; letter-spacing: .2px; font-size: 20px; }
.home-landing .brand span { color: var(--accent); }
.home-landing .nav a { color: var(--muted); text-decoration: none; margin: 0 12px; }
.home-landing .nav .cta { background: var(--primary); color: #fff; padding: 10px 16px; border-radius: 999px; box-shadow: 0 10px 20px rgba(59,130,246,.25); }
.home-landing .hero { display: grid; grid-template-columns: 1.2fr 1fr; gap: 42px; align-items: center; margin-top: 56px; }
.home-landing .eyebrow { display: inline-flex; align-items: center; gap: 8px; background: #f1f5ff; border: 1px solid #e7edff; padding: 6px 12px; border-radius: 999px; color: #3b5ccc; font-weight: 600; margin-bottom: 16px; }
.home-landing h1.hero-title { font-size: clamp(34px, 6vw, 56px); line-height: 1.05; margin: 0 0 12px 0; font-weight: 800; }
.home-landing .hero-title .accent { color: var(--accent); }
.home-landing .subtitle { color: var(--muted); font-size: 18px; margin-bottom: 22px; }
.home-landing .actions { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.home-landing .btn { border: none; cursor: pointer; text-decoration: none; font-weight: 700; padding: 12px 18px; border-radius: 12px; transition: transform .05s ease; }
.home-landing .btn.primary { background: var(--primary); color: #fff; box-shadow: 0 10px 20px var(--ring); }
.home-landing .btn.ghost { background: #fff; color: var(--text); border: 1px solid #e5e7eb; }
.home-landing .btn:active { transform: translateY(1px); }
.home-landing .checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
.home-landing .check { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 14px; }
.home-landing .check .dot { width: 8px; height: 8px; border-radius: 999px; background: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.15); }
.home-landing .preview { background: var(--card); border: 1px solid #eef2ff; border-radius: 16px; padding: 18px; box-shadow: 0 18px 50px rgba(2,6,23,.06); }
.home-landing .preview .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.home-landing .status { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.home-landing .pill { background: #f8fafc; border: 1px solid #eef2ff; padding: 12px; border-radius: 12px; text-align: center; font-weight: 700; }
.home-landing .pill small { display: block; font-weight: 600; color: var(--muted); }
.home-landing .trust { margin-top: 36px; display: flex; flex-wrap: wrap; gap: 10px; color: var(--muted); }
.home-landing .badge { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #eef2ff; padding: 8px 12px; border-radius: 999px; }
.home-landing .features { margin-top: 64px; }
.home-landing .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.home-landing .card { background: var(--card); border: 1px solid #eef2ff; padding: 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(2,6,23,.05); }
.home-landing .card h3 { margin: 8px 0; }
.home-landing .card p { color: var(--muted); }
.home-landing .stats { margin-top: 56px; }
.home-landing .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.home-landing .stat { background: #ffffffaa; backdrop-filter: blur(6px); border: 1px solid #eef2ff; border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 8px 24px rgba(2,6,23,.05); }
.home-landing .stat .num { font-weight: 800; font-size: 28px; }
.home-landing .stat .label { color: var(--muted); font-weight: 600; }
.home-landing .how { margin-top: 72px; }
.home-landing .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.home-landing .step { background: var(--card); border: 1px solid #eef2ff; border-radius: 16px; padding: 20px; }
.home-landing .step .n { width: 36px; height: 36px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: #eef2ff; color: #3b5ccc; font-weight: 800; margin-bottom: 10px; }
.home-landing .testimonials { margin-top: 72px; }
.home-landing .t-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.home-landing .quote { background: var(--card); border: 1px solid #eef2ff; border-radius: 16px; padding: 20px; color: var(--muted); box-shadow: 0 10px 30px rgba(2,6,23,.05); }
.home-landing .quote strong { display: block; color: var(--text); margin-top: 8px; }
.home-landing .cta-banner { margin-top: 72px; border-radius: 16px; padding: 28px; background: linear-gradient(135deg, rgba(59,130,246,.12), rgba(255,107,107,.12)); border: 1px solid #e7edff; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.home-landing .cta-banner p { color: var(--muted); }
.home-landing footer { margin-top: 72px; padding: 24px 0; color: var(--muted); border-top: 1px solid #eef2ff; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.home-landing footer a { color: var(--muted); text-decoration: none; margin-right: 12px; }
@media (max-width: 920px) {
  .home-landing .hero { grid-template-columns: 1fr; }
  .home-landing .grid { grid-template-columns: 1fr; }
  .home-landing .stats-grid { grid-template-columns: 1fr 1fr; }
  .home-landing .steps { grid-template-columns: 1fr; }
  .home-landing .t-grid { grid-template-columns: 1fr; }
  .home-landing .cta-banner { flex-direction: column; align-items: flex-start; }
}
`;

