const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const listeningStatus = document.getElementById('listeningStatus');
const chatbox = document.getElementById('chatbox');

// Check for speech recognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  startBtn.disabled = true;
  stopBtn.disabled = true;
  appendMessage("SERA", "Your browser does not support speech recognition.");
}

const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

let isProcessing = false;
let userSpeech = "";

// Start recording
startBtn.addEventListener('click', () => {
  if (isProcessing) return;
  userSpeech = "";
  startBtn.disabled = true;
  stopBtn.disabled = false;
  listeningStatus.textContent = 'Recording...';
  chatbox.classList.add('listening');
  recognition.start();
});

// Stop recording (manual)
stopBtn.addEventListener('click', () => {
  recognition.stop();
  stopBtn.disabled = true;
  startBtn.disabled = false;
  listeningStatus.textContent = 'Stopped. Click "Send Message" to proceed.';
});

// Live update as user speaks
recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0].transcript)
    .join('');
  userSpeech = transcript.trim();
  updateLiveUserMessage(userSpeech);
};

// Optional: show status after stopping
recognition.onend = () => {
  listeningStatus.textContent = userSpeech
    ? 'Ready to send message.'
    : 'No speech captured. Try again.';
};

recognition.onerror = (event) => {
  console.error('Speech error:', event.error);
  appendMessage("SERA", `Error: ${event.error}`);
  resetButton();
};

// Handle "Send Message"
stopBtn.addEventListener('click', async () => {
  if (!userSpeech || isProcessing) {
    appendMessage("SERA", "No speech detected. Please try again.");
    return;
  }

  isProcessing = true;

  const liveElem = document.getElementById("live-user-msg");
  if (liveElem) liveElem.remove();

  appendMessage("You", userSpeech);
  appendMessage("SERA", "SERA is thinking...");

  try {
    const aiResponse = await getAIResponse(userSpeech);

    // Replace thinking message with typing animation
    const thinkingElem = chatbox.lastElementChild;
    if (thinkingElem && thinkingElem.innerHTML.includes("SERA is thinking...")) {
      thinkingElem.remove();
    }

     typeBotReply(aiResponse);
    await playHumanAudio(aiResponse);
  } catch (err) {
    console.error('AI error:', err);
    appendMessage("SERA", 'Error getting response.');
  } finally {
    userSpeech = "";
    resetButton();
  }
});

// Reset buttons and status
function resetButton() {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  isProcessing = false;
  listeningStatus.textContent = 'Click "Start Recording" to begin, then "Send Message" to submit.';
  chatbox.classList.remove('listening');
}

// Call your backend
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

// ElevenLabs TTS
async function playHumanAudio(text) {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL", {
      method: "POST",
      headers: {
        "xi-api-key": "sk_1b1f389c14c208c62d0cc8c085e73fbb603c2d59dc143237", // Replace before pushing to GitHub
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8
        }
      })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error("ElevenLabs TTS error:", err);
  }
}

// Append permanent message
function appendMessage(sender, text) {
  const messageElem = document.createElement('div');
  messageElem.style.marginBottom = '0.5rem';
  messageElem.style.padding = '0.75rem';
  messageElem.style.borderRadius = '10px';
  messageElem.style.maxWidth = '90%';
  messageElem.style.wordWrap = 'break-word';
  messageElem.style.backgroundColor = sender === "You" ? '#e0f0ff' : '#fce4ec';
  messageElem.style.color = '#333';
  messageElem.innerHTML = `<strong>${sender}:</strong> ${text}`;

  chatbox.appendChild(messageElem);
  scrollToBottom();
}

// Typing animation for SERA
async function typeBotReply(text) {
  const botElem = document.createElement("div");
  botElem.style.marginBottom = '0.5rem';
  botElem.style.padding = '0.75rem';
  botElem.style.borderRadius = '10px';
  botElem.style.maxWidth = '90%';
  botElem.style.wordWrap = 'break-word';
  botElem.style.backgroundColor = '#fce4ec';
  botElem.style.color = '#333';
  chatbox.appendChild(botElem);

  let index = 0;
  const interval = setInterval(() => {
    botElem.innerHTML = `<strong>SERA:</strong> ${text.slice(0, index++)}`;
    scrollToBottom();
    if (index > text.length) clearInterval(interval);
  }, 20);
}

// Show live-typing for user
function updateLiveUserMessage(text) {
  const existing = document.getElementById("live-user-msg");

  if (existing) {
    existing.innerHTML = `<strong>You:</strong> ${text}`;
  } else {
    const messageElem = document.createElement("div");
    messageElem.id = "live-user-msg";
    messageElem.style.marginBottom = '0.5rem';
    messageElem.style.padding = '0.75rem';
    messageElem.style.borderRadius = '10px';
    messageElem.style.maxWidth = '90%';
    messageElem.style.wordWrap = 'break-word';
    messageElem.style.backgroundColor = '#e0f0ff';
    messageElem.style.color = '#333';
    messageElem.innerHTML = `<strong>You:</strong> ${text}`;
    chatbox.appendChild(messageElem);
  }

  scrollToBottom();
}

function scrollToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}
