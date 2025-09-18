import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'intro', type: 'intro' },
  { id: 'name', type: 'input', label: "what's your name?", key: 'name', placeholder: 'name...' },
  { id: 'identity', type: 'choices', label: 'how do you identify?', key: 'identity', options: ['female','male','non-binary','other'] },
  { id: 'age', type: 'choices', label: 'how many years young are you?', key: 'age', options: ['under 18','18–24','25–34','35+','prefer not to say'] },
  { id: 'source', type: 'choices', label: 'how did you hear about SERA?', key: 'source', options: ['instagram','tiktok','youtube','google','friend/family','other'] },
  { id: 'topic', type: 'choices', label: 'what are you most looking for support with?', key: 'topic', options: ['relationships','communication','boundaries','sexual health','something else'] },
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

  return (
    <div className="max-w-[900px] mx-auto px-[clamp(16px,5vw,40px)] py-10">
      <div className="h-1 rounded-full bg-slate-100 overflow-hidden mb-8">
        <div className="h-full bg-slate-800" style={{ width: `${progress}%` }}></div>
      </div>
      <button onClick={back} className="mb-6 text-slate-600 hover:text-slate-900">←</button>

      {step.type === 'intro' && (
        <div className="max-w-[600px] mx-auto">
          <div className="w-3 h-3 rounded-full bg-amber-400 mb-6"></div>
          <p className="leading-8 text-slate-800">
            hi friend
          </p>
          <p className="leading-8 text-slate-800">
            we created sera because life can be… a lot.
          </p>
          <p className="leading-8 text-slate-800">
            sometimes you just need someone to talk to.
          </p>
          <p className="leading-8 text-slate-800">
            whether you're navigating a rough day, figuring things out, or just need a moment to breathe
          </p>
          <p className="leading-8 font-semibold text-slate-900">we're here for you</p>
          <div className="mt-10">
            <button onClick={next} className="px-6 py-3 rounded-xl bg-slate-900 text-white">start</button>
          </div>
        </div>
      )}

      {step.type === 'input' && (
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-3xl font-extrabold mb-6">{step.label}</h1>
          <input
            autoFocus
            placeholder={step.placeholder}
            defaultValue={answers[step.key] || ''}
            onChange={e => setValue(step.key, e.target.value)}
            className="block w-full border-0 border-b border-slate-300 focus:border-slate-900 outline-none text-lg py-2 bg-transparent"
          />
          <div className="mt-10">
            <button disabled={!answers[step.key]} onClick={next} className={`px-6 py-3 rounded-xl ${answers[step.key] ? 'bg-slate-900 text-white' : 'bg-slate-300 text-white cursor-not-allowed'} `}>continue</button>
          </div>
        </div>
      )}

      {step.type === 'choices' && (
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-3xl font-extrabold mb-6">{step.label}</h1>
          <div className="space-y-3">
            {step.options.map(opt => (
              <button key={opt} onClick={() => { setValue(step.key, opt); next(); }} className="w-full text-left px-5 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200">
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-10">
            <button onClick={next} className="px-6 py-3 rounded-xl bg-slate-300 text-white">continue</button>
          </div>
        </div>
      )}

      {step.type === 'info' && (
        <div className="max-w-[600px] mx-auto">
          <h1 className="text-3xl font-extrabold mb-6">{step.label}</h1>
          <div className="flex items-center justify-center py-10">
            <div className="w-56 h-36 rounded-2xl bg-indigo-100"></div>
          </div>
          <p className="text-center text-slate-700">{step.body}</p>
          <div className="mt-10 text-center">
            <button onClick={next} className="px-6 py-3 rounded-xl bg-slate-900 text-white">continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
