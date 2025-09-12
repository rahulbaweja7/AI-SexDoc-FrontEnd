const API_BASE = "https://ai-sexdoc-backend.onrender.com";

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const sendBtn = document.getElementById("sendBtn");
const textInput = document.getElementById("textInput");
const chatbox = document.getElementById("chatbox");
const listeningStatus = document.getElementById("listeningStatus");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = true;

let userSpeech = "";
let isProcessing = false;
let isTypingStopped = false;
let preferredVoice = null;

window.speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  preferredVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Zira")) || voices.find(v => v.lang.includes("en"));
};

startBtn.addEventListener("click", () => {
  if (isProcessing) return;
  userSpeech = "";
  recognition.start();
  startBtn.disabled = true;
  listeningStatus.textContent = "Recording...";
});

stopBtn.addEventListener("click", () => {
  recognition.stop();
  isTypingStopped = true;
  speechSynthesis.cancel();
  listeningStatus.textContent = "Typing or voice interrupted.";
});

recognition.onresult = (e) => {
  const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
  userSpeech = transcript.trim();
};

recognition.onend = () => {
  if (userSpeech) {
    sendToBot(userSpeech);
  } else {
    listeningStatus.textContent = "No speech detected.";
    startBtn.disabled = false;
  }
};

sendBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (text) {
    sendToBot(text);
    textInput.value = "";
  }
});

function sendToBot(text) {
  appendMessage("You", text);
  isTypingStopped = false;
  isProcessing = true;

  getAIResponse(text)
    .then(reply => {
      playVoice(reply);
      typeBotReply(reply);
    })
    .catch(err => {
      console.error(err);
      appendMessage("SERA", "Something went wrong.");
    })
    .finally(() => {
      isProcessing = false;
      startBtn.disabled = false;
    });
}

async function getAIResponse(input) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Public access: no Authorization header
    },
    body: JSON.stringify({ userMessage: input })
  });


  const data = await res.json();
  return data.reply || "Sorry, I couldn't get a response.";
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.style.marginBottom = "0.5rem";
  msg.style.padding = "0.75rem";
  msg.style.borderRadius = "10px";
  msg.style.backgroundColor = sender === "You" ? "#e0f0ff" : "#fce4ec";
  msg.style.color = "#333";
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function typeBotReply(text) {
  const msg = document.createElement("div");
  msg.style.marginBottom = "0.5rem";
  msg.style.padding = "0.75rem";
  msg.style.borderRadius = "10px";
  msg.style.backgroundColor = "#fce4ec";
  msg.style.color = "#333";
  msg.innerHTML = "<strong>SERA:</strong> ";
  chatbox.appendChild(msg);

  let index = 0;
  const interval = setInterval(() => {
    if (isTypingStopped) {
      clearInterval(interval);
      return;
    }
    msg.innerHTML = `<strong>SERA:</strong> ${text.slice(0, index++)}`;
    chatbox.scrollTop = chatbox.scrollHeight;
    if (index > text.length) clearInterval(interval);
  }, 35);
}

function playVoice(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 1;
  utterance.pitch = 1.05;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
