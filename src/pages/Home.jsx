import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  function goToPrimary() {
    const done = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
    navigate(done ? '/chat' : '/onboarding');
  }
  return (
    <div className="relative text-[var(--text)] bg-aurora">
      <div className="absolute -z-10 top-[-60px] left-[-80px] brand-orb"/>
      <div className="w-full max-w-[1200px] mx-auto py-10 px-[clamp(16px,5vw,40px)]">

        <section className="grid md:grid-cols-[1.2fr_1fr] gap-[42px] items-center mt-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-white/10 border border-indigo-100 dark:border-white/10 px-3 py-1.5 rounded-full text-indigo-700 dark:text-indigo-200 font-semibold mb-4">kind, private, judgment‑free</div>
            <h1 className="text-[clamp(44px,7vw,72px)] leading-[1.05] font-extrabold mb-2">
              From questions to confidence—meet <span className="relative inline-flex items-baseline gap-2">SERA<div className="absolute left-0 right-0 bottom-[-8px] h-2 squiggle"/></span>.
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-[18px] mb-6 max-w-[52ch]">A warm, research‑informed guide for sexual education and relationships. No tracking. No judgment. Just support.</p>
            <div className="flex items-center gap-3 mb-6">
              <button className="btn-primary" onClick={goToPrimary}>Start chatting</button>
              <button className="btn-ghost" onClick={() => navigate('/about')}>Learn more</button>
            </div>
            <div className="mt-9 flex flex-wrap gap-2 text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-indigo-100 dark:border-white/10 px-3 py-2 rounded-full">🫶 Consent‑first</span>
              <span className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-indigo-100 dark:border-white/10 px-3 py-2 rounded-full">🔐 Private by design</span>
              <span className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-indigo-100 dark:border-white/10 px-3 py-2 rounded-full">🧭 Gentle guidance</span>
              <span className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-indigo-100 dark:border-white/10 px-3 py-2 rounded-full">🌱 Shame‑free learning</span>
            </div>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <strong>Chat Preview</strong>
              <small className="text-slate-600 dark:text-slate-300">Live demo</small>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-center font-bold"><small className="block font-semibold text-slate-600 dark:text-slate-300">Confidence</small>↑</div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-center font-bold"><small className="block font-semibold text-slate-600 dark:text-slate-300">Clarity</small>✓</div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-center font-bold"><small className="block font-semibold text-slate-600 dark:text-slate-300">Privacy</small>🔒</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="font-bold mb-2">“How do I talk to my partner about boundaries?”</div>
              <div className="text-slate-600 dark:text-slate-300">SERA helps you plan caring, confident conversations—at your pace.</div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-elevated p-6">
              <div>🎙️</div>
              <h3 className="my-2 font-semibold">Talk or type—your choice</h3>
              <p className="text-slate-600 dark:text-slate-300">Use voice input and natural-sounding replies to keep the flow going anywhere.</p>
            </div>
            <div className="card-elevated p-6">
              <div>🧭</div>
              <h3 className="my-2 font-semibold">Guidance, not judgment</h3>
              <p className="text-slate-600 dark:text-slate-300">Supportive answers grounded in best practices for sexual education.</p>
            </div>
            <div className="card-elevated p-6">
              <div>🗂️</div>
              <h3 className="my-2 font-semibold">Save your progress</h3>
              <p className="text-slate-600 dark:text-slate-300">Keep insights handy for quick review later.</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">10k+</div><div className="text-slate-600 dark:text-slate-300 font-semibold">Questions answered</div></div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">95%</div><div className="text-slate-600 dark:text-slate-300 font-semibold">User satisfaction</div></div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">24/7</div><div className="text-slate-600 dark:text-slate-300 font-semibold">Private availability</div></div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">0</div><div className="text-slate-600 dark:text-slate-300 font-semibold">Tracking cookies</div></div>
          </div>
        </section>

        <section className="mt-18">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-elevated p-5 text-slate-600">“SERA helped me plan a respectful conversation. I felt heard and prepared.”<strong className="block text-slate-900 mt-2">University student</strong></div>
            <div className="card-elevated p-5 text-slate-600">“I love the calm tone and the privacy-first design.”<strong className="block text-slate-900 mt-2">High school teacher</strong></div>
            <div className="card-elevated p-5 text-slate-600">“Fast, thoughtful, and judgment-free. Exactly what I needed.”<strong className="block text-slate-900 mt-2">New parent</strong></div>
          </div>
        </section>

        <div className="mt-18 rounded-2xl p-7 bg-[linear-gradient(135deg,rgba(59,130,246,.12),rgba(255,107,107,.12))] border border-indigo-100 dark:border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="m-0 mb-1.5 text-xl font-semibold">Ready to chat with SERA?</h3>
            <p className="text-slate-600 dark:text-slate-300">Private, free to start, and here whenever you are.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={goToPrimary}>Open the chat</button>
            <button className="btn-ghost" onClick={() => navigate('/about')}>Learn more</button>
          </div>
        </div>

        <footer className="mt-18 py-6 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
          <div className="no-underline text-slate-900 dark:text-white font-extrabold text-[20px]">S<span className="text-[#ff6b6b]">ERA</span></div>
          <div className="flex gap-3">
            <Link to="/about" className="text-slate-600 dark:text-slate-300 no-underline hover:text-slate-900 dark:hover:text-white">About</Link>
            <Link to="/history" className="text-slate-600 dark:text-slate-300 no-underline hover:text-slate-900 dark:hover:text-white">History</Link>
            <Link to="/chat" className="text-slate-600 dark:text-slate-300 no-underline hover:text-slate-900 dark:hover:text-white">Chat</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

