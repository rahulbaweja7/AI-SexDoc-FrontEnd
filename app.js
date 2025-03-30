const voiceBtn = document.getElementById('voiceBtn');
const userLine = document.getElementById('userLine');
const botLine = document.getElementById('botLine');
const listeningStatus = document.getElementById('listeningStatus');

// Check for speech recognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceBtn.disabled = true;
  voiceBtn.textContent = 'Voice Not Supported';
  botLine.textContent = 'Your browser does not support speech recognition.';
}

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let isProcessing = false;

voiceBtn.addEventListener('click', () => {
  if (isProcessing) return;

  voiceBtn.disabled = true;
  voiceBtn.textContent = 'Listening...';
  listeningStatus.textContent = 'Listening...';
  document.getElementById('chatbox').classList.add('listening');

  recognition.start();
});

recognition.onresult = async (event) => {
  isProcessing = true;

  const userSpeech = event.results[0][0].transcript.trim();
  if (!userSpeech) {
    botLine.textContent = 'Could not understand speech.';
    resetButton();
    return;
  }

  userLine.textContent = `You: ${userSpeech}`;
  botLine.textContent = 'SERA is thinking...';

  try {
    const aiResponse = await getAIResponse(userSpeech);
    botLine.textContent = `SERA: ${aiResponse}`;
    speakResponseWithFemaleVoice(aiResponse);
  } catch (err) {
    console.error('AI error:', err);
    botLine.textContent = 'Error getting response.';
  } finally {
    resetButton();
  }
};

recognition.onerror = (event) => {
  console.error('Speech error:', event.error);
  botLine.textContent = `Error: ${event.error}`;
  resetButton();
};

recognition.onend = () => {
  if (voiceBtn.textContent === 'Listening...') resetButton();
};

function resetButton() {
  voiceBtn.textContent = 'Start Talking';
  voiceBtn.disabled = false;
  isProcessing = false;
  listeningStatus.textContent = 'Click below and start talking';
  document.getElementById('chatbox').classList.remove('listening');
}

function speakResponseWithFemaleVoice(text) {
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices();
    let femaleVoice = voices.find(v => v.lang.includes('en') && (
      v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira')
    )) || voices.find(v => v.lang.includes('en'));

    const utterance = new SpeechSynthesisUtterance(text);
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 1;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
}

window.speechSynthesis.onvoiceschanged = () => console.log("Voices loaded");

async function getAIResponse(input) {
  if (!input.trim()) return "Could you say that again?";

  const res = await fetch('http://localhost:3000/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage: input })
  });

  const data = await res.json();
  return data.reply || "Sorry, I couldn't get a response.";
}
