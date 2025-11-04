document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleSidebar = document.getElementById("toggleSidebar");
  const floatingToggle = document.getElementById("floatingToggle");
  const container = document.getElementById("container");
  const chatBox = document.getElementById("chatBox");
  const divider = document.getElementById("divider");

  // Toggle for Desktop
  toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
    container.classList.toggle("sidebar-closed");

    if (sidebar.classList.contains("closed")) {
      divider.style.opacity = "0";
    } else {
      divider.style.opacity = "1";
    }

    adjustCanvas();
  });

  // Toggle for Mobile Floating Button
  floatingToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // Dummy functional buttons
  document.getElementById("sendBtn").addEventListener("click", () => {
    alert("Message sent!");
  });

  document.getElementById("micBtn").addEventListener("click", () => {
    alert("Voice recording started!");
  });

  document.getElementById("newChatBtn").addEventListener("click", () => {
    alert("New chat created!");
  });

  // Canvas adjustment
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas);

  // Falling animation (simple)
  const balls = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 3 + 1,
    s: Math.random() * 2 + 0.5,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    balls.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      b.y += b.s;
      if (b.y > canvas.height) b.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();

  // Adjust canvas based on sidebar open/close
  function adjustCanvas() {
    const open = !sidebar.classList.contains("closed");
    if (open) {
      canvas.style.filter = "blur(2px)";
    } else {
      canvas.style.filter = "none";
    }
  }
});
