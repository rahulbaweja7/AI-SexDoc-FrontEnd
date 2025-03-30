const voiceBtn = document.getElementById('voiceBtn');
const listeningStatus = document.getElementById('listeningStatus');
const chatbox = document.getElementById('chatbox');

// Check for speech recognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceBtn.disabled = true;
  voiceBtn.textContent = 'Voice Not Supported';
  appendMessage("SERA", "Your browser does not support speech recognition.");
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
  chatbox.classList.add('listening');

  recognition.start();
});

recognition.onresult = async (event) => {
  isProcessing = true;

  const userSpeech = event.results[0][0].transcript.trim();
  if (!userSpeech) {
    appendMessage("SERA", "Could not understand speech.");
    resetButton();
    return;
  }

  appendMessage("You", userSpeech);
  appendMessage("SERA", "SERA is thinking...");

  try {
    const aiResponse = await getAIResponse(userSpeech);
    updateLastBotMessage(aiResponse);
    await playHumanAudio(aiResponse); // NEW: Human voice!
  } catch (err) {
    console.error('AI error:', err);
    updateLastBotMessage('Error getting response.');
  } finally {
    resetButton();
  }
};

recognition.onerror = (event) => {
  console.error('Speech error:', event.error);
  appendMessage("SERA", `Error: ${event.error}`);
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
  chatbox.classList.remove('listening');
}

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

// ----------- ElevenLabs Audio Function -----------

async function playHumanAudio(text) {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL", {
      method: "POST",
      headers: {
        "xi-api-key": "",
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

// ----------- Chat UI Functions -----------

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

function updateLastBotMessage(newText) {
  const messages = chatbox.querySelectorAll('div');
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.innerHTML.includes("SERA is thinking...")) {
    lastMessage.innerHTML = `<strong>SERA:</strong> ${newText}`;
  } else {
    appendMessage("SERA", newText); // fallback just in case
  }
  scrollToBottom();
}

function scrollToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}
