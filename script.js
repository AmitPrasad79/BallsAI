document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const divider = document.getElementById("divider");
  const container = document.getElementById("container");
  const bgCanvas = document.getElementById("bgCanvas");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const floatingToggle = document.getElementById("floatingToggle");

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

  if (chats.length === 0) {
    chats.push({ title: "New Chat", messages: [] });
    saveChats();
  }

  function loadChats() {
    chatHistory.innerHTML = "";
    chats.forEach((chat, index) => {
      const div = document.createElement("div");
      div.className = "chat-item";
      div.innerHTML = `
        <span>${chat.title || "New Chat"}</span>
        <button class="delete-btn" data-index="${index}">✖</button>
      `;
      div.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) return;
        currentChat = index;
        displayMessages();
      });
      chatHistory.appendChild(div);
    });
  }

  chatHistory.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const i = parseInt(e.target.dataset.index);
      chats.splice(i, 1);
      if (chats.length === 0) chats.push({ title: "New Chat", messages: [] });
      saveChats();
      loadChats();
      displayMessages();
    }
  });

  function newChat() {
    chats.push({ title: "New Chat", messages: [] });
    currentChat = chats.length - 1;
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
    chats[currentChat].messages.push({ sender: "user", text });
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
      chats[currentChat].title = text.slice(0, 20);
      saveChats();
      displayMessages();
    } catch {
      chats[currentChat].messages.push({ sender: "bot", text: "⚠️ Server not responding." });
      displayMessages();
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => e.key === "Enter" && sendMessage());
  newChatBtn.addEventListener("click", newChat);

  micBtn.addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (e) => {
      userInput.value = e.results[0][0].transcript;
    };
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) userInput.value += ` [Attached: ${file.name}]`;
  });

  // === SIDEBAR TOGGLE ===
  function openSidebar() {
    sidebar.classList.remove("closed");
    divider.classList.remove("closed");
    container.classList.remove("sidebar-closed");
    floatingToggle.style.display = "none";
    bgCanvas.classList.remove("expanded");
    bgCanvas.classList.add("shrunk");
  }

  function closeSidebar() {
    sidebar.classList.add("closed");
    divider.classList.add("closed");
    container.classList.add("sidebar-closed");
    floatingToggle.style.display = "flex";
    bgCanvas.classList.remove("shrunk");
    bgCanvas.classList.add("expanded");
  }

  toggleSidebar.addEventListener("click", () => {
    if (sidebar.classList.contains("closed")) openSidebar();
    else closeSidebar();
  });

  floatingToggle.addEventListener("click", () => openSidebar());

  // === RESPONSIVE INIT ===
  function handleResponsive() {
    if (window.innerWidth <= 768) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  window.addEventListener("resize", handleResponsive);
  handleResponsive();

  loadChats();
  displayMessages();
});
