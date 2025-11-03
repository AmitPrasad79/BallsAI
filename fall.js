const bgCanvas = document.getElementById("bgCanvas");
const ctx = bgCanvas.getContext("2d");

function resizeBg() {
  const chatArea = document.getElementById("chatArea");
  const rect = chatArea.getBoundingClientRect();

  // Set correct pixel-based canvas size
  bgCanvas.width = rect.width;
  bgCanvas.height = rect.height;

  // Position canvas over chat area only
  bgCanvas.style.position = "absolute";
  bgCanvas.style.left = rect.left + "px";
  bgCanvas.style.top = rect.top + "px";
  bgCanvas.style.width = rect.width + "px";
  bgCanvas.style.height = rect.height + "px";
  bgCanvas.style.pointerEvents = "none";
  bgCanvas.style.zIndex = "1";
  bgCanvas.style.background = "transparent";
}

window.addEventListener("resize", resizeBg);
resizeBg();

const img = new Image();
img.src = "./assets/ballsai.png";
let imageLoaded = false;
img.onload = () => {
  imageLoaded = true;
};

let particles = [];

function createParticle() {
  const chatArea = document.getElementById("chatArea");
  const rect = chatArea.getBoundingClientRect();

  particles.push({
    x: Math.random() * rect.width,
    y: -50,
    size: Math.random() * 35 + 25, // slightly smaller
    speed: Math.random() * 1 + 0.3,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 0.5 - 0.25,
    alpha: 0.4 // nice fade balance
  });
}

setInterval(() => {
  if (particles.length < 10) createParticle();
}, 1000);

function drawParticle(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.alpha;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(255, 140, 0, 0.6)";
  ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
  ctx.restore();
}

function update() {
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  if (imageLoaded) {
    for (let p of particles) {
      p.y += p.speed;
      p.rotation += p.rotationSpeed;
      drawParticle(p);
    }
    particles = particles.filter(p => p.y < bgCanvas.height + 50);
  }
  requestAnimationFrame(update);
}

update();
