import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  function goToPrimary() {
    const done = typeof window !== 'undefined' && localStorage.getItem('sera.onboardingComplete') === '1';
    navigate(done ? '/chat' : '/onboarding');
  }
  return (
    <div className="text-[var(--text)] bg-aurora">
      <div className="w-full max-w-[1200px] mx-auto py-10 px-[clamp(16px,5vw,40px)]">

        <section className="grid md:grid-cols-[1.2fr_1fr] gap-[42px] items-center mt-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/90 border border-indigo-100 px-3 py-1.5 rounded-full text-indigo-700 font-semibold mb-4">Private by design • Free to try</div>
            <h1 className="text-[clamp(44px,7vw,72px)] leading-[1.05] font-extrabold mb-4">
              From questions to confidence—meet <span className="text-[#ff6b6b]">SERA</span>.
            </h1>
            <p className="text-slate-600 text-[18px] mb-6 max-w-[52ch]">A modern assistant for sexual education and relationships. Clear answers, calm guidance, and zero judgment.</p>
            <div className="flex items-center gap-3 mb-6">
              <button className="btn-primary" onClick={goToPrimary}>Start chatting</button>
              <button className="btn-ghost" onClick={() => navigate('/about')}>Learn more</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-slate-600 text-sm">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-600 shadow-[0_0_0_3px_rgba(22,163,74,.15)]"></span> Anonymous & local-first experience</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,.15)]"></span> Clear, age-appropriate guidance</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,.15)]"></span> Voice in and out</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,.15)]"></span> Open-source friendly</div>
            </div>

            <div className="mt-9 flex flex-wrap gap-2 text-slate-600">
              <span className="inline-flex items-center gap-2 bg-white border border-indigo-100 px-3 py-2 rounded-full">🔒 Privacy-first</span>
              <span className="inline-flex items-center gap-2 bg-white border border-indigo-100 px-3 py-2 rounded-full">🛡️ Secure by design</span>
              <span className="inline-flex items-center gap-2 bg-white border border-indigo-100 px-3 py-2 rounded-full">⚡ Fast responses</span>
              <span className="inline-flex items-center gap-2 bg-white border border-indigo-100 px-3 py-2 rounded-full">🌍 Free to use</span>
            </div>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <strong>Chat Preview</strong>
              <small className="text-slate-600">Live demo</small>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-center font-bold"><small className="block font-semibold text-slate-600">Applied</small>42</div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-center font-bold"><small className="block font-semibold text-slate-600">Interview</small>7</div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-center font-bold"><small className="block font-semibold text-slate-600">Learned</small>99+</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="font-bold mb-2">“How do I talk to my partner about boundaries?”</div>
              <div className="text-slate-600">SERA helps you prepare calm, confident conversations—tailored to your needs.</div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-elevated p-6">
              <div>🎙️</div>
              <h3 className="my-2 font-semibold">Talk or type—your choice</h3>
              <p className="text-slate-600">Use voice input and natural-sounding replies to keep the flow going anywhere.</p>
            </div>
            <div className="card-elevated p-6">
              <div>🧭</div>
              <h3 className="my-2 font-semibold">Guidance, not judgment</h3>
              <p className="text-slate-600">Get supportive answers backed by best practices in sexual education.</p>
            </div>
            <div className="card-elevated p-6">
              <div>🗂️</div>
              <h3 className="my-2 font-semibold">Save your progress</h3>
              <p className="text-slate-600">History view keeps key takeaways handy for quick review later.</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">10k+</div><div className="text-slate-600 font-semibold">Questions answered</div></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">95%</div><div className="text-slate-600 font-semibold">User satisfaction</div></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">24/7</div><div className="text-slate-600 font-semibold">Private availability</div></div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(2,6,23,.05)]"><div className="font-extrabold text-2xl">0</div><div className="text-slate-600 font-semibold">Tracking cookies</div></div>
          </div>
        </section>

        <section className="mt-18">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-elevated p-5 text-slate-600">“SERA helped me plan a respectful conversation. I felt heard and prepared.”<strong className="block text-slate-900 mt-2">University student</strong></div>
            <div className="card-elevated p-5 text-slate-600">“I love the calm tone and the privacy-first design.”<strong className="block text-slate-900 mt-2">High school teacher</strong></div>
            <div className="card-elevated p-5 text-slate-600">“Fast, thoughtful, and judgment-free. Exactly what I needed.”<strong className="block text-slate-900 mt-2">New parent</strong></div>
          </div>
        </section>

        <div className="mt-18 rounded-2xl p-7 bg-[linear-gradient(135deg,rgba(59,130,246,.12),rgba(255,107,107,.12))] border border-indigo-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="m-0 mb-1.5 text-xl font-semibold">Ready to try SERA?</h3>
            <p className="text-slate-600">Private, free to start, and available whenever you are.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={goToPrimary}>Open the chat</button>
            <button className="btn-ghost" onClick={() => navigate('/about')}>Learn more</button>
          </div>
        </div>

        <footer className="mt-18 py-6 text-slate-600 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="no-underline text-slate-900 font-extrabold text-[20px]">S<span className="text-[#ff6b6b]">ERA</span></div>
          <div className="flex gap-3">
            <Link to="/about" className="text-slate-600 no-underline hover:text-slate-900">About</Link>
            <Link to="/history" className="text-slate-600 no-underline hover:text-slate-900">History</Link>
            <Link to="/chat" className="text-slate-600 no-underline hover:text-slate-900">Chat</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

