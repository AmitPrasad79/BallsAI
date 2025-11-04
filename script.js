document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const divider = document.getElementById("divider");
  const floatingToggle = document.getElementById("floatingToggle");
  const toggleSidebar = document.getElementById("toggleSidebar");
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

      const title = document.createElement("span");
      title.textContent = chat.title || "New Chat";
      title.onclick = () => { currentChat = index; displayMessages(); };

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.className = "delete-btn";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm("Delete this chat?")) {
          chats.splice(index, 1);
          if (currentChat >= chats.length) currentChat = chats.length - 1;
          saveChats();
          loadChats();
          displayMessages();
        }
      };

      div.appendChild(title);
      div.appendChild(delBtn);
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
      chats[currentChat].messages.push({
        sender: "bot",
        text: "⚠️ Server not responding.",
      });
    }
    saveChats();
    displayMessages();
  }

  sendBtn.onclick = sendMessage;
  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  newChatBtn.onclick = () => {
    chats.push({ title: "New Chat", messages: [] });
    currentChat = chats.length - 1;
    saveChats();
    loadChats();
    displayMessages();
  };

  micBtn.onclick = () => {
    try {
      const recognition =
        new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
      recognition.start();
      recognition.onresult = event => {
        userInput.value = event.results[0][0].transcript;
      };
    } catch {
      alert("Speech recognition not supported in this browser.");
    }
  };

  fileInput.onchange = e => {
    const file = e.target.files[0];
    if (file) userInput.value += ` [Attached: ${file.name}]`;
  };

  function openSidebar() {
    sidebar.classList.add("open");
    divider.classList.remove("hidden");
    bgCanvas.classList.remove("expanded");
    bgCanvas.classList.add("shrunk");
    floatingToggle.style.display = "none";
    adjustChatBox(true);
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    divider.classList.add("hidden");
    bgCanvas.classList.remove("shrunk");
    bgCanvas.classList.add("expanded");
    floatingToggle.style.display = "flex";
    adjustChatBox(false);
  }

  toggleSidebar.onclick = () => closeSidebar();
  floatingToggle.onclick = () => openSidebar();

  function adjustChatBox(isSidebarOpen) {
    if (isSidebarOpen) {
      chatBox.style.width = "60%";
      chatBox.style.left = "calc(50% + 130px)"; 
    } else {
      chatBox.style.width = "70%";
      chatBox.style.left = "50%";
    }
  }

  function handleResize() {
    if (window.innerWidth <= 768) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize();

  if (chats.length === 0) chats.push({ title: "New Chat", messages: [] });
  loadChats();
  displayMessages();
});
