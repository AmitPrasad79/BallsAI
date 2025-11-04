document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sidebar = document.getElementById("sidebar");
  const divider = document.getElementById("divider");
  const container = document.getElementById("container");
  const bgCanvas = document.getElementById("bgCanvas");
  const toggleSidebarBtn = document.getElementById("toggleSidebar");   // inside-sidebar button
  const floatingToggleBtn = document.getElementById("floatingToggle"); // top-left floating

  const chatWindow = document.getElementById("chatWindow");
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const micBtn = document.getElementById("micBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const chatHistory = document.getElementById("chatHistory");
  const fileInput = document.getElementById("fileInput");

  // Chat state
  let chats = JSON.parse(localStorage.getItem("ballsAI_chats")) || [];
  let currentChat = 0;
  if (!Array.isArray(chats) || chats.length === 0) {
    chats = [{ title: "New Chat", messages: [] }];
    currentChat = 0;
    localStorage.setItem("ballsAI_chats", JSON.stringify(chats));
  }

  function saveChats() { localStorage.setItem("ballsAI_chats", JSON.stringify(chats)); }

  // Load chat history list
  function loadChats() {
    chatHistory.innerHTML = "";
    chats.forEach((c, i) => {
      const div = document.createElement("div");
      div.className = "chat-item";
      div.innerHTML = `<span>${c.title || "New Chat"}</span><button class="delete-btn" data-i="${i}">✖</button>`;
      div.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) return;
        currentChat = i;
        displayMessages();
      });
      chatHistory.appendChild(div);
    });
  }

  // delete handler
  chatHistory.addEventListener("click", (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    const idx = Number(e.target.dataset.i);
    if (Number.isFinite(idx)) {
      chats.splice(idx, 1);
      if (chats.length === 0) chats.push({ title: "New Chat", messages: [] });
      currentChat = Math.min(currentChat, chats.length - 1);
      saveChats();
      loadChats();
      displayMessages();
    }
  });

  function displayMessages() {
    chatWindow.innerHTML = "";
    if (!chats[currentChat]) return;
    chats[currentChat].messages.forEach(m => {
      const el = document.createElement("div");
      el.className = `message ${m.sender}`;
      el.textContent = m.text;
      chatWindow.appendChild(el);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function sendMessage() {
    const text = (userInput.value || "").trim();
    if (!text) return;
    chats[currentChat].messages.push({ sender: "user", text });
    displayMessages();
    userInput.value = "";
    saveChats();
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      const reply = data.reply || "No reply from model.";
      chats[currentChat].messages.push({ sender: "bot", text: reply });
      chats[currentChat].title = text.slice(0,20);
      saveChats();
      displayMessages();
    } catch (err) {
      chats[currentChat].messages.push({ sender: "bot", text: "⚠️ Server not responding." });
      saveChats();
      displayMessages();
    }
  }

  // wire chat controls
  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });
  newChatBtn.addEventListener("click", () => {
    chats.push({ title: "New Chat", messages: [] });
    currentChat = chats.length - 1;
    saveChats();
    loadChats();
    displayMessages();
  });

  micBtn.addEventListener("click", () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported");
    const r = new SR();
    r.lang = "en-US";
    r.start();
    r.onresult = (ev) => { userInput.value = ev.results[0][0].transcript; };
  });

  fileInput.addEventListener("change", (e) => {
    const f = e.target.files?.[0];
    if (f) userInput.value += ` [Attached: ${f.name}]`;
  });

  /* ---------------- Sidebar toggle logic ---------------- */
  // helper: set open/closed UI state
  function setSidebarOpen(open) {
    if (open) {
      sidebar.classList.remove("closed");
      divider.classList.remove("closed");
      container.classList.remove("sidebar-closed");
      if (bgCanvas) { bgCanvas.classList.remove("expanded"); bgCanvas.classList.add("shrunk"); }
      // on small screens hide floating toggle
      if (window.innerWidth <= 768 && floatingToggleBtn) floatingToggleBtn.style.display = "none";
      // ensure internal toggle visible on larger screens (CSS does this too)
    } else {
      sidebar.classList.add("closed");
      divider.classList.add("closed");
      container.classList.add("sidebar-closed");
      if (bgCanvas) { bgCanvas.classList.remove("shrunk"); bgCanvas.classList.add("expanded"); }
      if (window.innerWidth <= 768 && floatingToggleBtn) floatingToggleBtn.style.display = "flex";
    }
  }

  // whoops: ensure we have references to both toggles
  const internalToggleBtn = toggleSidebarBtn; // inside sidebar (may be hidden via CSS on mobile)
  const floatingToggleBtn = floatingToggleBtn || document.getElementById("floatingToggle");

  // safe fallback: if any missing, don't crash
  const hasInternal = !!internalToggleBtn;
  const hasFloating = !!floatingToggleBtn;

  // click handlers
  if (hasInternal) internalToggleBtn.addEventListener("click", (e) => { e.stopPropagation(); setSidebarOpen(!sidebar.classList.contains("closed")); });
  if (hasFloating) floatingToggleBtn.addEventListener("click", (e) => { e.stopPropagation(); setSidebarOpen(true); });

  // initial responsive state
  function applyResponsiveInitial() {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false); // start closed on phones
      if (hasFloating) floatingToggleBtn.style.display = "flex";
    } else {
      setSidebarOpen(true); // open on larger screens
      if (hasFloating) floatingToggleBtn.style.display = "none";
    }
  }
  applyResponsiveInitial();

  // update on resize
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // if user switches between phone and desktop sizes, re-evaluate
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    }, 120);
  });

  /* initialize lists + UI */
  loadChats();
  displayMessages();
});
