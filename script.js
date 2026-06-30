import * as THREE from "three";
import { RoundedBoxGeometry } from "https://unpkg.com/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ----------------------------------------------------------
   Renderer / scene / camera
---------------------------------------------------------- */
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 9.5);

/* ----------------------------------------------------------
   Lighting
---------------------------------------------------------- */
scene.add(new THREE.HemisphereLight(0xffffff, 0x6a7a8a, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(4, 6, 6); scene.add(key);
const fill = new THREE.DirectionalLight(0xbfd8ff, 0.7); fill.position.set(-6, -2, 4); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(-3, 4, -6); scene.add(rim);

/* ----------------------------------------------------------
   Texture helpers
---------------------------------------------------------- */
function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function texFrom(c) { const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t; }

// Printed text plate. bg=null => transparent background (text only)
function textPlate(text, { bg = "#565a63", fg = "#dfe3e8", size = 95, spacing = 10, align = "center" } = {}) {
  const [c, ctx] = makeCanvas(512, 256);
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 256); } else { ctx.clearRect(0, 0, 512, 256); }
  ctx.fillStyle = fg;
  ctx.font = `900 ${size}px Arial`;
  ctx.textAlign = align; ctx.textBaseline = "middle";
  ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(text, align === "left" ? 20 : 256, 128);
  return new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.8, metalness: 0.1, transparent: true });
}

function ribbedTexture(base, line, count) {
  const [c, ctx] = makeCanvas(1024, 64);
  ctx.fillStyle = base; ctx.fillRect(0, 0, 1024, 64);
  ctx.fillStyle = line;
  for (let i = 0; i < count; i++) ctx.fillRect((i / count) * 1024, 0, 1024 / count / 2, 64);
  return new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.5, metalness: 0.55 });
}

function lensTextTexture() {
  const [c, ctx] = makeCanvas(1024, 96);
  ctx.fillStyle = "#202127"; ctx.fillRect(0, 0, 1024, 96);
  ctx.fillStyle = "#cdd2d8"; ctx.font = "700 30px Arial"; ctx.textBaseline = "middle"; ctx.letterSpacing = "2px";
  const txt = "SONY VIDEO LENS   ◦   OPTICAL 56×   ◦   f=4.1-45mm   ◦   ";
  ctx.fillText(txt, 10, 48); ctx.fillText(txt, 520, 48);
  return new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.55, metalness: 0.45 });
}

function staminaSticker() {
  const [c, ctx] = makeCanvas(360, 480);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 360, 480);
  ctx.fillStyle = "#ef8a1c"; ctx.fillRect(12, 12, 336, 200);
  ctx.fillStyle = "#1a1a1a"; ctx.font = "900 64px Arial"; ctx.textAlign = "center"; ctx.fillText("STAMINA", 180, 90);
  ctx.beginPath(); ctx.arc(180, 150, 26, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = "#1f5fd0"; ctx.fillRect(12, 224, 336, 244);
  ctx.fillStyle = "#fff"; ctx.font = "900 150px Arial"; ctx.fillText("12", 150, 360);
  ctx.font = "900 70px Arial"; ctx.fillText("h", 250, 360);
  ctx.font = "700 36px Arial"; ctx.fillText("BATTERY LIFE", 180, 440);
  return new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.6, metalness: 0.05 });
}

function specsLabel() {
  const [c, ctx] = makeCanvas(512, 320);
  ctx.fillStyle = "#d8dade"; ctx.fillRect(0, 0, 512, 320);
  ctx.fillStyle = "#3a3c42"; ctx.font = "700 30px Arial"; ctx.textAlign = "left";
  ctx.fillText("Video Camera Recorder", 24, 50);
  ctx.font = "400 24px Arial";
  ["Model  CCD-TRV37", "DC 7.2V  Hi8  XR", "S/N 204715  MADE IN JAPAN", "Handycam® Vision™", "InfoLITHIUM™ compatible"]
    .forEach((l, i) => ctx.fillText(l, 24, 110 + i * 38));
  return new THREE.MeshStandardMaterial({ map: texFrom(c), roughness: 0.7, metalness: 0.05 });
}

/* ----------------------------------------------------------
   Materials
---------------------------------------------------------- */
const matBody   = new THREE.MeshStandardMaterial({ color: 0x35363d, roughness: 0.5,  metalness: 0.4 });
const matDark   = new THREE.MeshStandardMaterial({ color: 0x202126, roughness: 0.6,  metalness: 0.35 });
const matGlass  = new THREE.MeshStandardMaterial({ color: 0x070912, roughness: 0.05, metalness: 0.95 });
const matCoat   = new THREE.MeshStandardMaterial({ color: 0x14304a, roughness: 0.1,  metalness: 0.9, emissive: 0x07111f });
const matStrap  = new THREE.MeshStandardMaterial({ color: 0x565a63, roughness: 0.85, metalness: 0.1 });
const matSilver = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.35, metalness: 0.75 });
const matRed    = new THREE.MeshStandardMaterial({ color: 0xd62f2f, roughness: 0.4,  metalness: 0.1, emissive: 0x3a0000 });
const matLcd    = new THREE.MeshStandardMaterial({ color: 0x3fd3e6, roughness: 0.25, metalness: 0.2, emissive: 0x1fa9bd, emissiveIntensity: 0.55 });
const matRibFocus = ribbedTexture("#23242a", "#3a3c44", 64);
const matRibZoom  = ribbedTexture("#1d1e23", "#34363d", 40);

/* ----------------------------------------------------------
   Build helpers
---------------------------------------------------------- */
const cam = new THREE.Group();
function rbox(w, h, d, r = 0.08, mat = matBody) { return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat); }
function add(mesh, x, y, z) { mesh.position.set(x, y, z); cam.add(mesh); return mesh; }
function ringX(rTop, rBot, len, x, mat, openEnded = false) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, len, 56, 1, openEnded), mat);
  m.rotation.z = Math.PI / 2; m.position.set(x, 0, 0); cam.add(m); return m;
}
function label(mat, w, h, x, y, z, rotY = 0, rotX = 0, parent = cam) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.set(rotX, rotY, 0); parent.add(m); return m;
}

/* ----------------------------------------------------------
   Body
---------------------------------------------------------- */
add(rbox(3.0, 1.95, 1.55, 0.2, matBody), 0, 0, 0);
add(rbox(1.05, 1.75, 1.4, 0.16, matBody), -1.55, 0, 0);
add(rbox(1.5, 0.22, 1.15, 0.07, matDark), 0.1, 1.02, 0);
add(rbox(2.7, 0.2, 1.45, 0.07, matDark), 0.1, -1.0, 0);

/* Lens assembly (toward -X) */
ringX(0.66, 0.66, 0.26, -2.15, matDark);
ringX(0.6, 0.6, 0.52, -2.46, matRibFocus, true);
ringX(0.605, 0.605, 0.2, -2.16, lensTextTexture(), true);
ringX(0.58, 0.58, 0.3, -2.78, matRibZoom, true);
ringX(0.72, 0.66, 0.34, -3.0, matDark);
ringX(0.74, 0.74, 0.06, -3.18, matSilver);
ringX(0.56, 0.56, 0.05, -3.2, matGlass);
ringX(0.42, 0.42, 0.05, -3.22, matCoat);
ringX(0.22, 0.22, 0.05, -3.24, matGlass);

/* Viewfinder */
add(rbox(0.55, 0.45, 0.5, 0.08, matDark), 0.95, 1.12, -0.05);
const eyecup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.5, 32), matDark);
eyecup.rotation.z = Math.PI / 2; add(eyecup, 1.6, 1.2, -0.05);

/* Top controls */
add(rbox(0.5, 0.12, 0.26, 0.05, matSilver), -0.4, 1.16, 0.2);
add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 28), matDark), 0.55, 1.15, -0.15);
for (let i = 0; i < 2; i++)
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 20), matGlass), -0.95, 1.16, -0.3 + i * 0.6);

/* Front details */
add(rbox(0.06, 0.4, 0.55, 0.04, matGlass), -2.06, 0.45, 0.0);
add(rbox(0.06, 0.5, 0.7, 0.04, matDark), -2.07, -0.35, -0.2);

/* Back-face buttons (+X) */
for (let r = 0; r < 2; r++)
  for (let cI = 0; cI < 3; cI++)
    add(rbox(0.1, 0.16, 0.16, 0.04, matSilver), 1.52, 0.45 - r * 0.4, -0.45 + cI * 0.4);
add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 28), matRed), 1.55, -0.45, 0.4).rotation.z = Math.PI / 2;

/* ----------------------------------------------------------
   Grip strap + SONY  — now on the BACK (-Z)
---------------------------------------------------------- */
add(rbox(1.8, 1.0, 0.16, 0.14, matStrap), 0.45, -0.2, -0.85).rotation.y = 0.03;

/* Stickers on top & bottom */
label(staminaSticker(), 0.42, 0.56, -0.3, 1.14, 0.2, 0, -Math.PI / 2);
label(specsLabel(), 1.0, 0.62, 0.4, -1.06, 0.1, 0, Math.PI / 2);

/* ----------------------------------------------------------
   Flip-out LCD screen (OPEN, facing the viewer) + MENU
---------------------------------------------------------- */
const lcd = new THREE.Group();
lcd.add(rbox(1.65, 1.35, 0.1, 0.08, matDark));                 // panel

// the screen displays a soft blue cloudy sky (like the reference)
function makeSkyScreenTexture() {
  const W = 512, H = 432;
  const [c, ctx] = makeCanvas(W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#74c8ff");
  sky.addColorStop(0.55, "#3ea8ff");
  sky.addColorStop(1, "#1389f5");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // soft, airbrushed clouds built from many faint white blobs
  function cloud(cx, cy, scale, alpha, puffs = 16) {
    for (let i = 0; i < puffs; i++) {
      const px = cx + (Math.random() - 0.5) * scale * 2.4;
      const py = cy + (Math.random() - 0.5) * scale * 0.9;
      const r = scale * (0.45 + Math.random() * 0.75);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(255,255,255,${alpha})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }
  cloud(W * 0.52, H * 0.90, 95, 0.13);
  return texFrom(c);
}
const screenFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 1.18),
  new THREE.MeshBasicMaterial({ map: makeSkyScreenTexture() })
);
screenFace.position.z = 0.055; lcd.add(screenFace);

// hinge arm connecting panel to body
const arm = rbox(0.14, 1.1, 0.6, 0.05, matDark);
add(arm, -1.0, -0.05, 1.05);

lcd.position.set(-0.2, -0.05, 1.42);   // out in front of the body
lcd.rotation.y = -0.12;                // slight angle, still readable
cam.add(lcd);

/* Menu items rendered on the screen (clickable) */
const MENU = [
  { label: "VIDEOS",  href: "#videos" },
  { label: "PHOTOS",  href: "#photos" },
  { label: "SHOP",    href: "#shop" },
  { label: "ABOUT",   href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

// chunky "bubble" label: cream fill, dark outline + drop shadow
function drawMenuLabel(ctx, label) {
  ctx.clearRect(0, 0, 700, 120);
  ctx.font = '800 68px "Baloo 2", "Arial Rounded MT Bold", Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "1px";
  const x = 26, y = 66;
  ctx.fillStyle = "rgba(18,20,26,0.5)";          // drop shadow
  ctx.fillText(label, x + 5, y + 6);
  ctx.lineJoin = "round";                         // dark outline
  ctx.lineWidth = 9;
  ctx.strokeStyle = "#22252b";
  ctx.strokeText(label, x, y);
  ctx.fillStyle = "#f2ede1";                      // cream fill
  ctx.fillText(label, x, y);
}

const menuMeshes = [];
const pitch = 0.205, startY = ((MENU.length - 1) * pitch) / 2;
MENU.forEach((item, i) => {
  const [c, ctx] = makeCanvas(700, 120);
  drawMenuLabel(ctx, item.label);
  const tex = texFrom(c);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.22), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  mesh.position.set(0, startY - i * pitch, 0.07);
  mesh.userData = {
    href: item.href, base: 1,
    redraw: () => { drawMenuLabel(ctx, item.label); tex.needsUpdate = true; },
  };
  lcd.add(mesh);
  menuMeshes.push(mesh);
});

// re-render labels once the bubble font has finished loading
if (document.fonts && document.fonts.load) {
  document.fonts.load('800 68px "Baloo 2"')
    .then(() => menuMeshes.forEach((m) => m.userData.redraw()))
    .catch(() => {});
}

/* ----------------------------------------------------------
   Place & orient (static — no auto motion)
---------------------------------------------------------- */
cam.position.set(0, -0.1, 0);
cam.rotation.set(0.08, -0.18, 0);
cam.scale.setScalar(1.05);
scene.add(cam);

/* ----------------------------------------------------------
   Background 3D stars (small, randomly placed)
---------------------------------------------------------- */
function makeStarShape(outer = 1, inner = 0.45, points = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
  }
  s.closePath();
  return s;
}
const starGeo = new THREE.ExtrudeGeometry(makeStarShape(1, 0.45, 5), {
  depth: 0.35, bevelEnabled: true, bevelSize: 0.07, bevelThickness: 0.07, bevelSegments: 1,
});
starGeo.center();

const starColors = [0xffffff, 0xfff3c8, 0xcfe0ff, 0xe9d8ff];

// soft radial sprite used as a faint glow halo behind each star
function makeGlowTexture() {
  const [c, ctx] = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return texFrom(c);
}
const glowTex = makeGlowTexture();

const stars = [];
const starGroup = new THREE.Group();
for (let i = 0; i < 420; i++) {
  const color = starColors[(Math.random() * starColors.length) | 0];
  const m = new THREE.Mesh(starGeo, new THREE.MeshBasicMaterial({ color, transparent: true }));
  const bx = (Math.random() - 0.5) * 90;
  const by = (Math.random() - 0.5) * 60;
  const bz = -12 - Math.random() * 70;       // pushed further back, wider spread to fill the view
  m.position.set(bx, by, bz);
  const sc = 0.05 + Math.random() * 0.15;
  m.scale.setScalar(sc);
  m.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

  // faint additive glow halo
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.setScalar(sc * 6);
  halo.position.copy(m.position);
  starGroup.add(halo);

  m.userData = {
    phase: Math.random() * Math.PI * 2,
    twSpeed: 0.4 + Math.random() * 0.6,
    spin: (Math.random() - 0.5) * 0.5,
    baseOpacity: 0.55 + Math.random() * 0.45,
    halo,
    haloBase: 0.12 + Math.random() * 0.1,
    haloPhase: Math.random() * Math.PI * 2,
    haloSpeed: 0.3 + Math.random() * 0.5,
    bx, by, bz,                                // base position for the hover
    hovPhase: Math.random() * Math.PI * 2,
    hovSpeed: 0.3 + Math.random() * 0.6,
    hovAmp: 0.15 + Math.random() * 0.4,
  };
  starGroup.add(m);
  stars.push(m);
}
scene.add(starGroup);

/* ----------------------------------------------------------
   Shooting stars (occasional streaks)
---------------------------------------------------------- */
function makeTrailTexture() {
  const [c, ctx] = makeCanvas(256, 32);
  const hg = ctx.createLinearGradient(0, 0, 256, 0);   // tail -> head
  hg.addColorStop(0, "rgba(255,255,255,0)");
  hg.addColorStop(0.65, "rgba(255,255,255,0.45)");
  hg.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = hg; ctx.fillRect(0, 0, 256, 32);
  ctx.globalCompositeOperation = "destination-in";    // soften top/bottom edges
  const vg = ctx.createLinearGradient(0, 0, 0, 32);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(0.5, "rgba(0,0,0,1)");
  vg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 256, 32);
  ctx.globalCompositeOperation = "source-over";
  return texFrom(c);
}
const trailTex = makeTrailTexture();

const shooters = [];
const shooterGroup = new THREE.Group();
for (let i = 0; i < 3; i++) {
  const len = 16 + Math.random() * 12;
  const g = new THREE.Group();
  const trail = new THREE.Mesh(
    new THREE.PlaneGeometry(len, 0.26),
    new THREE.MeshBasicMaterial({ map: trailTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
  );
  trail.position.x = -len / 2;        // bright head edge sits at the group origin
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  head.scale.setScalar(1.0);
  g.add(trail); g.add(head);
  g.visible = false;
  g.userData = { trail, head, dir: new THREE.Vector2(1, 0), speed: 0, dur: 1, life: 0, active: false, wait: Math.random() * 5 };
  shooterGroup.add(g);
  shooters.push(g);
}
scene.add(shooterGroup);

function spawnShooter(s) {
  const u = s.userData;
  s.position.set((Math.random() - 0.5) * 80, 18 + Math.random() * 12, -30 - Math.random() * 30);
  const down = 0.4 + Math.random() * 0.5;
  const side = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6);
  u.dir.set(side, -down).normalize();
  s.rotation.z = Math.atan2(u.dir.y, u.dir.x);
  u.speed = 8 + Math.random() * 7;
  u.dur = 1.8 + Math.random() * 1.6;
  u.life = 0;
  u.active = true;
  s.visible = true;
}

let prevT = 0;
function updateShooters(t) {
  const dt = Math.min(0.05, t - prevT); prevT = t;
  for (const s of shooters) {
    const u = s.userData;
    if (u.active) {
      u.life += dt;
      const p = u.life / u.dur;
      s.position.x += u.dir.x * u.speed * dt;
      s.position.y += u.dir.y * u.speed * dt;
      const op = Math.sin(Math.min(1, p) * Math.PI);   // fade in, then out
      u.trail.material.opacity = op;
      u.head.material.opacity = op * 0.9;
      if (p >= 1) { u.active = false; s.visible = false; u.wait = 2 + Math.random() * 6; }
    } else {
      u.wait -= dt;
      if (u.wait <= 0) spawnShooter(s);
    }
  }
}

// normalized mouse position, used for the parallax drift
let mouseNX = 0, mouseNY = 0;
window.addEventListener("pointermove", (e) => {
  mouseNX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNY = (e.clientY / window.innerHeight) * 2 - 1;
});

/* ----------------------------------------------------------
   Soft smoke / fog wisps (very subtle, in a few areas)
---------------------------------------------------------- */
function makeSmokeTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.clearRect(0, 0, 256, 256);
  for (let k = 0; k < 6; k++) {           // overlap soft blobs => lumpy, smoke-like alpha
    const cx = 128 + (Math.random() - 0.5) * 90;
    const cy = 128 + (Math.random() - 0.5) * 90;
    const r = 60 + Math.random() * 60;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "rgba(255,255,255,0.22)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  return texFrom(c);
}

const fogSpots = [
  [-14, -6, -12], [13, 7, -14], [-10, 8, -10], [9, -9, -9],
  [0, -7, -4], [-4, 5, -16], [6, 1, -7], [-8, -2, -6],
];
const fogTints = [0x8a98c0, 0xa6adc0, 0x7e8cb4, 0x9aa6c8];
const fog = [];
const fogGroup = new THREE.Group();
fogSpots.forEach(([x, y, z], i) => {
  const mat = new THREE.SpriteMaterial({
    map: makeSmokeTexture(),              // unique lumpy shape per wisp
    color: fogTints[i % fogTints.length],
    transparent: true,
    opacity: 0.05 + Math.random() * 0.07,
    depthWrite: false,
  });
  const sp = new THREE.Sprite(mat);
  const s = 8 + Math.random() * 8;
  sp.scale.set(s, s, 1);
  sp.position.set(x, y, z);
  sp.material.rotation = Math.random() * Math.PI;
  sp.userData = {
    bx: x, by: y,
    ax: 0.6 + Math.random() * 0.8,        // drift amplitude
    ay: 0.4 + Math.random() * 0.6,
    ds: 0.05 + Math.random() * 0.08,      // drift speed
    ph: Math.random() * Math.PI * 2,
    rot: (Math.random() - 0.5) * 0.0015,  // slow swirl
    bo: mat.opacity,
  };
  fogGroup.add(sp);
  fog.push(sp);
});
scene.add(fogGroup);

/* ----------------------------------------------------------
   VIDEOS view — plays youtube.com/pitureperfct on the screen
---------------------------------------------------------- */
const CHANNEL_URL = "https://www.youtube.com/channel/UCOVw5b9z6Q0NUiMWRKlwqXQ";
// uploads playlist = channel id with "UC" -> "UU" (plays every upload, newest first)
const UPLOADS_PLAYLIST = "UUOVw5b9z6Q0NUiMWRKlwqXQ";

const screenUI = document.getElementById("screen-ui");
const backBtn = document.getElementById("screen-back");
const titleEl = document.getElementById("screen-title");
const grid = document.getElementById("video-grid");
const player = document.getElementById("video-player");
const channelLink = document.getElementById("channel-link");
channelLink.href = CHANNEL_URL;

let mode = "menu";

function enterVideos() {
  mode = "videos";
  menuMeshes.forEach((m) => (m.visible = false));
  grid.hidden = true;
  channelLink.hidden = false;
  player.hidden = false;
  titleEl.textContent = "VIDEOS";
  player.innerHTML =
    `<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${UPLOADS_PLAYLIST}&rel=0&modestbranding=1" ` +
    `allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  screenUI.hidden = false;
  positionScreenUI();
}
function exitVideos() {
  mode = "menu";
  screenUI.hidden = true;
  player.innerHTML = "";        // stop playback
  player.hidden = true;
  menuMeshes.forEach((m) => (m.visible = true));
}
backBtn.addEventListener("click", exitVideos);

// keep the HTML overlay glued to the camcorder's 3D screen
const _p = new THREE.Vector3();
function projectPoint(x, y) {
  _p.set(x, y, 0);
  screenFace.localToWorld(_p);
  _p.project(camera);
  return { x: (_p.x * 0.5 + 0.5) * window.innerWidth, y: (-_p.y * 0.5 + 0.5) * window.innerHeight };
}
function positionScreenUI() {
  camera.updateMatrixWorld();
  screenFace.updateWorldMatrix(true, false);
  const c = [projectPoint(-0.7, 0.59), projectPoint(0.7, 0.59), projectPoint(0.7, -0.59), projectPoint(-0.7, -0.59)];
  const xs = c.map((p) => p.x), ys = c.map((p) => p.y);
  const left = Math.min(...xs), top = Math.min(...ys);
  const w = Math.max(...xs) - left, h = Math.max(...ys) - top;
  screenUI.style.left = left + "px";
  screenUI.style.top = top + "px";
  screenUI.style.width = w + "px";
  screenUI.style.height = h + "px";
  screenUI.style.fontSize = Math.max(10, h * 0.075) + "px";
}

/* ----------------------------------------------------------
   Drag to rotate  +  click menu items
---------------------------------------------------------- */
const dom = renderer.domElement;
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

let dragging = false, moved = 0;
let lastX = 0, lastY = 0, velY = 0, velX = 0;
let hovered = null;

function setNdc(e) {
  ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
}
function pickMenu(e) {
  setNdc(e);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(menuMeshes, false);
  return hit.length ? hit[0].object : null;
}

dom.addEventListener("pointerdown", (e) => {
  if (mode === "videos") return;
  dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; velY = velX = 0;
  dom.setPointerCapture(e.pointerId);
  dom.style.cursor = "grabbing";
});
dom.addEventListener("pointermove", (e) => {
  if (mode === "videos") return;
  if (dragging) {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    velY = dx * 0.006; velX = dy * 0.006;
    cam.rotation.y += velY;
    cam.rotation.x = THREE.MathUtils.clamp(cam.rotation.x + velX, -0.6, 0.8);
  } else {
    // hover highlight on menu items
    const hit = pickMenu(e);
    if (hit !== hovered) {
      if (hovered) hovered.scale.setScalar(1);
      hovered = hit;
      if (hovered) hovered.scale.setScalar(1.12);
      dom.style.cursor = hovered ? "pointer" : "grab";
    }
  }
});
dom.addEventListener("pointerup", (e) => {
  if (mode === "videos") return;
  dragging = false;
  dom.style.cursor = "grab";
  if (moved < 6) {                       // treat as a click, not a drag
    const hit = pickMenu(e);
    if (hit) {
      if (hit.userData.href === "#videos") enterVideos();
      else window.location.hash = hit.userData.href;
    }
  }
});
dom.style.cursor = "grab";

/* ----------------------------------------------------------
   Render loop (inertia only — no self-spin)
---------------------------------------------------------- */
const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  updateShooters(t);
  if (mode === "videos") {
    // ease to a flat, front-facing screen and hold still
    cam.rotation.x += (0 - cam.rotation.x) * 0.12;
    cam.rotation.y += (0.12 - cam.rotation.y) * 0.12;
    cam.rotation.z += (0 - cam.rotation.z) * 0.12;
    cam.position.y += (-0.1 - cam.position.y) * 0.12;
  } else {
    if (!dragging) {
      cam.rotation.y += velY;
      cam.rotation.x = THREE.MathUtils.clamp(cam.rotation.x + velX, -0.6, 0.8);
      velY *= 0.94; velX *= 0.94;
      if (Math.abs(velY) < 1e-4) velY = 0;
      if (Math.abs(velX) < 1e-4) velX = 0;
    }
    // tiny idle hover so the camcorder isn't perfectly static
    cam.position.y = -0.1 + Math.sin(t * 0.9) * 0.06;
    cam.rotation.z = Math.sin(t * 0.7) * 0.018;
  }
  // twinkle + slow spin for the stars (+ glow halos)
  for (const s of stars) {
    const u = s.userData;
    // gentle hover so they're not stationary
    s.position.x = u.bx + Math.sin(t * u.hovSpeed + u.hovPhase) * u.hovAmp;
    s.position.y = u.by + Math.cos(t * u.hovSpeed * 0.9 + u.hovPhase) * u.hovAmp;
    u.halo.position.copy(s.position);
    s.material.opacity = u.baseOpacity * (0.85 + 0.15 * Math.sin(t * u.twSpeed + u.phase));
    // glow gently swells, then gradually fades all the way out (never abrupt)
    const g = Math.sin(t * u.haloSpeed + u.haloPhase);
    u.halo.material.opacity = u.haloBase * (g > 0 ? g * g : 0);
    s.rotation.y += u.spin * 0.006;
    s.rotation.z += u.spin * 0.01;
  }
  // gentle mouse parallax on the star field (eased)
  starGroup.position.x += (-mouseNX * 1.4 - starGroup.position.x) * 0.05;
  starGroup.position.y += ( mouseNY * 1.0 - starGroup.position.y) * 0.05;
  starGroup.rotation.y += (-mouseNX * 0.06 - starGroup.rotation.y) * 0.05;
  starGroup.rotation.x += ( mouseNY * 0.05 - starGroup.rotation.x) * 0.05;
  // drifting, swirling smoke/fog wisps
  for (const f of fog) {
    const u = f.userData;
    f.position.x = u.bx + Math.sin(t * u.ds + u.ph) * u.ax;
    f.position.y = u.by + Math.cos(t * u.ds * 0.8 + u.ph) * u.ay;
    f.material.rotation += u.rot;
    f.material.opacity = u.bo * (0.7 + 0.3 * Math.sin(t * 0.3 + u.ph));
  }
  fogGroup.position.x = starGroup.position.x * 0.6;  // lighter parallax than stars
  fogGroup.position.y = starGroup.position.y * 0.6;
  renderer.render(scene, camera);
  if (mode === "videos") positionScreenUI();
  requestAnimationFrame(animate);
}
animate();

/* ----------------------------------------------------------
   Responsive
---------------------------------------------------------- */
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.position.z = w < 720 ? 12 : 9.5;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", onResize);
onResize();
