document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const divider = document.getElementById("divider");
  const floatingToggle = document.getElementById("floatingToggle");
  const bgCanvas = document.getElementById("bgCanvas");
  const container = document.getElementById("container");
  const chatBox = document.getElementById("chatBox");

  const chatWindow = document.getElementById("chatWindow");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const fileInput = document.getElementById("fileInput");
  const chatHistory = document.getElementById("chatHistory");

  // ===== CHAT LOGIC =====
  let chats = JSON.parse(localStorage.getItem("ballsAI_chats")) || [];
  let currentChat = 0;

  function saveChats() { localStorage.setItem("ballsAI_chats", JSON.stringify(chats)); }

  function loadChats() {
    chatHistory.innerHTML = "";
    chats.forEach((chat, index) => {
      const div = document.createElement("div");
      div.className = "chat-item";
      div.innerHTML = `<span>${chat.title || "New Chat"}</span>`;
      div.onclick = () => { currentChat = index; displayMessages(); };
      chatHistory.appendChild(div);
    });
  }

  function displayMessages() {
    chatWindow.innerHTML = "";
    if (!chats[currentChat]) return;
    chats[currentChat].messages.forEach(msg => {
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply || "No reply from model.";
      chats[currentChat].messages.push({ sender: "bot", text: reply });
    } catch {
      chats[currentChat].messages.push({ sender: "bot", text: "⚠️ Server not responding." });
    }
    saveChats();
    displayMessages();
  }

  sendBtn.onclick = sendMessage;
  userInput.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });
  newChatBtn.onclick = () => {
    chats.push({ title: "New Chat", messages: [] });
    currentChat = chats.length - 1;
    saveChats();
    loadChats();
    displayMessages();
  };

  micBtn.onclick = () => {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.start();
      recognition.onresult = (event) => {
        userInput.value = event.results[0][0].transcript;
      };
    } catch {
      alert("Speech recognition not supported in this browser.");
    }
  };

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) userInput.value += ` [Attached: ${file.name}]`;
  };

  // ===== SIDEBAR TOGGLE =====
  let sidebarOpen = true;

  function openSidebar() {
    sidebar.classList.remove("closed");
    divider.classList.remove("hidden");
    bgCanvas.classList.remove("expanded");
    bgCanvas.classList.add("shrunk");
    container.classList.remove("sidebar-closed");
    chatBox.style.width = "68%";
    sidebarOpen = true;
  }

  function closeSidebar() {
    sidebar.classList.add("closed");
    divider.classList.add("hidden");
    bgCanvas.classList.remove("shrunk");
    bgCanvas.classList.add("expanded");
    container.classList.add("sidebar-closed");
    chatBox.style.width = "80%";
    sidebarOpen = false;
  }

  floatingToggle.onclick = () => {
    if (sidebarOpen) closeSidebar();
    else openSidebar();
  };

  function handleResize() {
    if (window.innerWidth <= 768) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize();

  // Init
  if (chats.length === 0) chats.push({ title: "New Chat", messages: [] });
  loadChats();
  displayMessages();
});
