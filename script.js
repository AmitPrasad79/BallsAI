const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const newChatBtn = document.getElementById("newChatBtn");
const searchInput = document.getElementById("searchInput");
const chatHistory = document.getElementById("chatHistory");
const fileInput = document.getElementById("fileInput");

let chats = JSON.parse(localStorage.getItem("ballsChats")) || [];
let activeChatId = null;

function saveChats() {
  localStorage.setItem("ballsChats", JSON.stringify(chats));
}

function newChat() {
  const chatId = Date.now().toString();
  chats.unshift({ id: chatId, title: "New Chat", messages: [] });
  activeChatId = chatId;
  saveChats();
  renderChatList();
  renderMessages();
}
newChatBtn.addEventListener("click", newChat);

function renderChatList(filter = "") {
  chatHistory.innerHTML = "";
  chats
    .filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(chat => {
      const div = document.createElement("div");
      div.className = "chat-item";
      div.textContent = chat.title;
      div.onclick = () => {
        activeChatId = chat.id;
        renderMessages();
      };
      chatHistory.appendChild(div);
    });
}

function renderMessages() {
  chatWindow.innerHTML = "";
  const chat = chats.find(c => c.id === activeChatId);
  if (!chat) return;

  chat.messages.forEach(msg => {
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

  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ sender: "user", text });
  renderMessages();
  userInput.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });
  const data = await res.json();
  const reply = data.reply || "No reply from Balls AI.";

  chat.messages.push({ sender: "ai", text: reply });
  chat.title = text.substring(0, 20) + "...";
  saveChats();
  renderMessages();
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

searchInput.addEventListener("input", () => renderChatList(searchInput.value));

// 🎙️ Speech-to-text for search input
micBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = e => {
    userInput.value = e.results[0][0].transcript;
  };
});

// 📎 Handle file upload
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const chat = chats.find(c => c.id === activeChatId);
  chat.messages.push({ sender: "user", text: `📎 Uploaded: ${file.name}` });
  saveChats();
  renderMessages();
});

renderChatList();
if (chats.length) {
  activeChatId = chats[0].id;
  renderMessages();
}
