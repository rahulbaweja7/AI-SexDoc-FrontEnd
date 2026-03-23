import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Soft animated orb ── */
function SeraOrb() {
  return (
    <div className="relative flex items-center justify-center w-28 h-28 mx-auto mb-10">
      {/* outer glow */}
      <div className="absolute inset-0 rounded-full bg-[#ff6b6b]/15 blur-2xl scale-150" />
      {/* mid ring */}
      <div className="absolute inset-2 rounded-full bg-[#ff6b6b]/10 blur-md" />
      {/* core */}
      <div
        className="relative w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 45%, #e84a4a 100%)',
          boxShadow: '0 0 40px rgba(255,107,107,0.35), 0 0 80px rgba(255,107,107,0.15)',
          animation: 'orbFloat 5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ── minimal chat mockup ── */
const MSGS = [
  { u: true,  t: 'How do I bring up STI testing with someone new?' },
  { u: false, t: "That takes courage to ask. A good approach is framing it as care — 'I get tested regularly and I'd love for us both to feel comfortable.' It takes the pressure off." },
  { u: true,  t: 'What if they take it the wrong way?' },
  { u: false, t: "If someone reacts badly to a healthy boundary, that's actually useful information. But most people will feel relieved you brought it up first." },
];

function ChatMockup() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= MSGS.length) return;
    const t = setTimeout(() => setShown(s => s + 1), shown === 0 ? 600 : 2000);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141416] shadow-2xl shadow-zinc-900/10 dark:shadow-zinc-900/50">
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)' }}>
            <img src="/logo-sera.png?v=2" alt="" className="w-4.5 h-4.5 opacity-90" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#141416]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-zinc-900 dark:text-white leading-none">SERA</p>
          <p className="text-[11px] text-emerald-500 leading-none mt-0.5">online · private</p>
        </div>
      </div>

      {/* messages */}
      <div className="px-4 pt-5 pb-4 space-y-3 min-h-[260px]">
        {MSGS.slice(0, shown).map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.u ? 'justify-end' : 'justify-start'}`} style={{ animation: 'fadeUp 0.3s ease forwards' }}>
            {!m.u && (
              <div className="w-5 h-5 rounded-full flex-shrink-0 mb-0.5" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)' }} />
            )}
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-[1.55] ${
              m.u
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-sm'
            }`}>
              {m.t}
            </div>
          </div>
        ))}
        {shown < MSGS.length && shown > 0 && (
          <div className="flex items-end gap-2">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)' }} />
            <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
              {[0,1,2].map(i => <span key={i} className="block w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }} />)}
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5">
          <span className="flex-1 text-[12px] text-zinc-400 dark:text-zinc-500">Ask anything…</span>
          <div className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3 h-3 text-white dark:text-zinc-900" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  function goToPrimary() {
    const done = localStorage.getItem('sera.onboardingComplete') === '1';
    navigate(done ? '/chat' : '/onboarding');
  }

  return (
    <div className="bg-[#f9f9f7] dark:bg-[#0e0e10] min-h-screen">

      {/* ── HERO ── */}
      <section className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-5 py-20 text-center relative overflow-hidden">
        {/* background warmth */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ff6b6b]/6 blur-[100px] pointer-events-none" />

        <div className="relative max-w-[520px] mx-auto">
          <SeraOrb />

          <p className="text-[11.5px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-5">
            private · judgment-free · always here
          </p>

          <h1 className="text-[clamp(32px,5vw,52px)] font-bold tracking-[-0.03em] leading-[1.1] text-zinc-900 dark:text-white mb-5">
            The questions you've been<br />
            afraid to ask out loud.
          </h1>

          <p className="text-[16px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10 max-w-[38ch] mx-auto">
            SERA is a warm, private guide for sexual health and relationships. No shame. No tracking. Just honest support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={goToPrimary}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl text-[14px] font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #e8505a)' }}
            >
              Start a conversation
            </button>
          </div>
        </div>
      </section>

      {/* ── WHAT IT IS ── */}
      <section className="px-5 py-20 bg-white dark:bg-[#111113] border-y border-zinc-100 dark:border-zinc-900">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="text-[11.5px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-10">designed with care</p>
          <div className="space-y-8">
            {[
              { label: 'Ask anything', desc: 'Voice or text — no question is too personal, too awkward, or too small. SERA has heard it all and meets you without judgment.' },
              { label: 'Honest answers', desc: 'Warm, research-informed responses that respect your autonomy and never talk down to you. Like a really well-informed friend.' },
              { label: 'Yours alone', desc: 'Your conversations are private by design. No ads, no data sold, no tracking cookies. What you share stays with you.' },
            ].map(({ label, desc }) => (
              <div key={label} className="group">
                <div className="flex items-start gap-4 text-left max-w-[480px] mx-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] mt-2.5 flex-shrink-0" />
                  <div>
                    <p className="text-[15px] font-semibold text-zinc-900 dark:text-white mb-1">{label}</p>
                    <p className="text-[14px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAT PREVIEW ── */}
      <section className="px-5 py-24">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 max-w-[420px]">
            <p className="text-[11.5px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-5">see it in action</p>
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-bold tracking-tight leading-[1.15] text-zinc-900 dark:text-white mb-4">
              Real conversations.<br />Genuine answers.
            </h2>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
              SERA doesn't give you a brochure. It talks to you — the way a trusted, knowledgeable friend would.
            </p>
            <button
              onClick={goToPrimary}
              className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#ff6b6b] hover:gap-3 transition-all"
            >
              Try it yourself
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="flex-1 w-full">
            <ChatMockup />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 py-24 text-center border-t border-zinc-100 dark:border-zinc-900">
        <div className="max-w-[420px] mx-auto">
          <div className="relative w-14 h-14 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-[#ff6b6b]/20 blur-xl" />
            <div className="relative w-14 h-14 rounded-full" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)', boxShadow: '0 0 30px rgba(255,107,107,0.3)' }} />
          </div>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
            Ready when you are
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Free to use, private by default, and genuinely here to help. No appointment needed.
          </p>
          <button
            onClick={goToPrimary}
            className="px-8 py-3 rounded-2xl text-[14px] font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #ff6b6b, #e8505a)' }}
          >
            Open SERA
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 px-5 py-7">
        <div className="max-w-[1080px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)' }} />
            <span className="text-[14px] font-semibold text-zinc-900 dark:text-white">SERA</span>
          </div>
          <div className="flex items-center gap-5">
            {[['Chat', '/chat'], ['Settings', '/settings']].map(([l, to]) => (
              <Link key={to} to={to} className="no-underline text-[12.5px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[12px] text-zinc-400 dark:text-zinc-600">© 2025 SERA</p>
        </div>
      </footer>

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
