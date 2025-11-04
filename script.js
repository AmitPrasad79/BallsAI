document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chatWindow");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const chatHistory = document.getElementById("chatHistory");
  const fileInput = document.getElementById("fileInput");

  let chats = JSON.parse(localStorage.getItem("ballsAI_chats")) || [];
  let currentChat = 0;

  if (chats.length === 0) {
    chats.push({ title: "New Chat", messages: [] });
    currentChat = 0;
    saveChats();
  }

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

  window.deleteChat = function (index, e) {
    e.stopPropagation();
    chats.splice(index, 1);

    if (chats.length === 0) {
      chats.push({ title: "New Chat", messages: [] });
      currentChat = 0;
    } else if (currentChat >= chats.length) {
      currentChat = chats.length - 1;
    }

    saveChats();
    loadChats();
    displayMessages();
  };

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
    if (!text || !chats[currentChat]) return;

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
      chats[currentChat].title = text.slice(0, 20) + (text.length > 20 ? "..." : "");
      saveChats();
      displayMessages();
    } catch (err) {
      chats[currentChat].messages.push({ sender: "bot", text: "⚠️ Server not responding." });
      displayMessages();
    }
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
    if (file && chats[currentChat]) {
      const filename = file.name;
      userInput.value += ` [Attached: ${filename}]`;
    }
  });

  // ===== SIDEBAR TOGGLE =====
  const sidebar = document.getElementById("sidebar");
  const divider = document.getElementById("divider");
  const container = document.getElementById("container");
  const bgCanvas = document.getElementById("bgCanvas");
  const toggleBtn = document.getElementById("toggleSidebar");
  const floating = document.getElementById("floatingToggle");

  function toggleSidebarState() {
    const isClosed = sidebar.classList.toggle("closed");
    divider.classList.toggle("closed");
    container.classList.toggle("sidebar-closed");
    bgCanvas.classList.toggle("expanded");
    bgCanvas.classList.toggle("shrunk");

    if (isClosed) {
      floating.style.display = "flex";
    } else {
      floating.style.display = "none";
    }
  }

  toggleBtn.addEventListener("click", toggleSidebarState);
  floating.addEventListener("click", toggleSidebarState);

  // Match both hamburger styles
  [toggleBtn, floating].forEach((btn) => {
    btn.style.width = "42px";
    btn.style.height = "38px";
    btn.style.fontSize = "22px";
    btn.style.justifyContent = "center";
    btn.style.alignItems = "center";
    btn.style.display = "flex";
    btn.style.cursor = "pointer";
  });

  // Show floating toggle by default on phones
  if (window.innerWidth <= 768) {
    sidebar.classList.add("closed");
    divider.classList.add("closed");
    container.classList.add("sidebar-closed");
    floating.style.display = "flex";
    bgCanvas.classList.add("expanded");
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      floating.style.display = "none";
      sidebar.classList.remove("closed");
      divider.classList.remove("closed");
      container.classList.remove("sidebar-closed");
      bgCanvas.classList.remove("expanded");
      bgCanvas.classList.add("shrunk");
    } else if (sidebar.classList.contains("closed")) {
      floating.style.display = "flex";
    }
  });

  loadChats();
  displayMessages();
});
