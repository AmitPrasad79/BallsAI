const bgCanvas = document.getElementById("bgCanvas");
const ctx = bgCanvas.getContext("2d");

function resizeBg() {
  const chatArea = document.getElementById("chatArea");
  const rect = chatArea.getBoundingClientRect();

  bgCanvas.width = rect.width;
  bgCanvas.height = rect.height;
  bgCanvas.style.left = rect.left + "px";
  bgCanvas.style.top = rect.top + "px";
}
window.addEventListener("resize", resizeBg);
resizeBg();

const img = new Image();
img.src = "./assets/ballsai.png"; 
let imageLoaded = false;
img.onload = () => {
  imageLoaded = true;
  console.log("✅ Sentient logo loaded for background");
};

let particles = [];

function createParticle() {
  particles.push({
    x: Math.random() * bgCanvas.width,
    y: -50,
    size: Math.random() * 45 + 25,
    speed: Math.random() * 1 + 0.3,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 0.5 - 0.25,
    alpha: Math.random() * 0.5 + 0.5
  });
}

setInterval(() => {
  if (particles.length < 8) createParticle();
}, 900);

function drawParticle(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.alpha;
  ctx.shadowBlur = 15;
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
