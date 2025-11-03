const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");
const fileInput = document.getElementById("fileInput");

let chats = JSON.parse(localStorage.getItem("ballsAI_chats")) || [];
let currentChat = 0;

function saveChats() {
  localStorage.setItem("ballsAI_chats", JSON.stringify(chats));
}

function loadChats() {
  chatHistory.innerHTML = "";
  chats.forEach((chat, index) => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerHTML = `
      <span>${chat.title || "New Chat"}</span>
      <button class="delete-btn" onclick="deleteChat(${index}, event)">✖</button>
    `;
    div.onclick = (e) => {
      if (e.target.classList.contains("delete-btn")) return;
      switchChat(index);
    };
    chatHistory.appendChild(div);
  });
}

function switchChat(index) {
  currentChat = index;
  displayMessages();
}

function newChat() {
  chats.push({ title: "New Chat", messages: [] });
  currentChat = chats.length - 1;
  saveChats();
  loadChats();
  displayMessages();
}

function deleteChat(index, e) {
  e.stopPropagation();
  chats.splice(index, 1);
  if (currentChat >= chats.length) currentChat = chats.length - 1;
  saveChats();
  loadChats();
  displayMessages();
}

function displayMessages() {
  chatWindow.innerHTML = "";
  if (!chats[currentChat]) return;
  chats[currentChat].messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = `message ${msg.sender}`;
    div.textContent = msg.text;
    chatWindow.appendChild(div);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  const userMsg = { sender: "user", text };
  chats[currentChat].messages.push(userMsg);
  displayMessages();
  userInput.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });

  const data = await res.json();
  const reply = data.reply || "No reply from model.";

  chats[currentChat].messages.push({ sender: "bot", text: reply });
  chats[currentChat].title = text.slice(0, 20) + (text.length > 20 ? "..." : "");
  saveChats();
  displayMessages();
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
newChatBtn.addEventListener("click", newChat);

/* ==== Speech to Text ==== */
micBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
  };
});

/* ==== File Upload ==== */
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    chats[currentChat].messages.push({
      sender: "user",
      text: `📎 Uploaded: ${file.name}`,
    });
    displayMessages();
  }
});

loadChats();
displayMessages();
