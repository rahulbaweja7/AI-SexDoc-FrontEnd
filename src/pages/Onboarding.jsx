import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'intro', type: 'intro' },
  { id: 'name', type: 'input', label: "what's your name?", key: 'name', placeholder: 'name...' },
  { id: 'identity', type: 'choices', label: 'how do you identify?', key: 'identity', options: ['female', 'male', 'non-binary', 'other'] },
  { id: 'age', type: 'choices', label: 'how many years young are you?', key: 'age', options: ['under 18', '18–24', '25–34', '35+', 'prefer not to say'] },
  { id: 'source', type: 'choices', label: 'how did you hear about SERA?', key: 'source', options: ['instagram', 'tiktok', 'youtube', 'google', 'friend/family', 'other'] },
  { id: 'topic', type: 'choices', label: 'what are you most looking for support with?', key: 'topic', options: ['relationships', 'communication', 'boundaries', 'sexual health', 'something else'] },
  { id: 'proof', type: 'info', label: 'proven to help', body: "you'll get supportive, research-informed guidance, private by design." },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sera.onboarding') || '{}'); } catch { return {}; }
  });

  const step = steps[index];
  const progress = Math.round(((index + 1) / steps.length) * 100);

  function next() {
    if (index < steps.length - 1) {
      setIndex(index + 1);
    } else {
      localStorage.setItem('sera.onboarding', JSON.stringify(answers));
      localStorage.setItem('sera.onboardingComplete', '1');
      navigate('/chat');
    }
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  function setValue(key, value) {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    localStorage.setItem('sera.onboarding', JSON.stringify(updated));
  }

  const PrimaryBtn = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-7 py-3 rounded-2xl text-[14px] font-semibold transition-all ${
        disabled
          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
          : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0e0e10] px-5 py-10">
      <div className="max-w-[600px] mx-auto">

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-8">
          <div
            className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Back button */}
        {index > 0 && (
          <button
            onClick={back}
            className="mb-8 text-[13px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← back
          </button>
        )}

        {/* Intro */}
        {step.type === 'intro' && (
          <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
            <div className="w-3 h-3 rounded-full bg-[#ff6b6b] mb-8" />
            <div className="space-y-3 mb-10">
              <p className="text-[18px] leading-relaxed text-zinc-800 dark:text-zinc-100">hi friend</p>
              <p className="text-[18px] leading-relaxed text-zinc-800 dark:text-zinc-100">we created SERA because life can be… a lot.</p>
              <p className="text-[18px] leading-relaxed text-zinc-800 dark:text-zinc-100">sometimes you just need someone to talk to.</p>
              <p className="text-[18px] leading-relaxed text-zinc-800 dark:text-zinc-100">whether you're navigating a rough day, figuring things out, or just need a moment to breathe</p>
              <p className="text-[18px] font-semibold text-zinc-900 dark:text-white">we're here for you.</p>
            </div>
            <PrimaryBtn onClick={next}>let's start</PrimaryBtn>
          </div>
        )}

        {/* Text input */}
        {step.type === 'input' && (
          <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white mb-8">{step.label}</h1>
            <input
              autoFocus
              placeholder={step.placeholder}
              defaultValue={answers[step.key] || ''}
              onChange={e => setValue(step.key, e.target.value)}
              className="block w-full border-0 border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white outline-none text-[18px] py-3 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors"
            />
            <div className="mt-10">
              <PrimaryBtn disabled={!answers[step.key]} onClick={next}>continue</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Choices */}
        {step.type === 'choices' && (
          <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white mb-8">{step.label}</h1>
            <div className="space-y-3">
              {step.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => { setValue(step.key, opt); next(); }}
                  className={`w-full text-left px-5 py-4 rounded-2xl border text-[14px] font-medium transition-all ${
                    answers[step.key] === opt
                      ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#141416] text-zinc-800 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        {step.type === 'info' && (
          <div style={{ animation: 'fadeUp 0.3s ease forwards' }}>
            <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white mb-8">{step.label}</h1>
            <div className="flex items-center justify-center py-10">
              <div className="w-56 h-36 rounded-2xl bg-[#ff6b6b]/10 dark:bg-[#ff6b6b]/5 border border-[#ff6b6b]/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full" style={{ background: 'radial-gradient(circle at 38% 36%, #ffb3a7 0%, #ff6b6b 100%)' }} />
              </div>
            </div>
            <p className="text-center text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10">{step.body}</p>
            <div className="text-center">
              <PrimaryBtn onClick={next}>let's go →</PrimaryBtn>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
