// scenes.js — definisi tiga dunia dan cara menggambarnya.
// Setiap scene digambar prosedural di canvas: panel kiri memakai mods kosong,
// panel kanan memakai mods {indeksPerbedaan: true}. Perbedaan hanya muncul
// lewat cabang `mods[i]` di dalam fungsi gambar, jadi kedua panel nyaris identik.

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

function sparkleStar(ctx, x, y, r, fill) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, -r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0); ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.fill(); ctx.restore();
}

function fiveStar(ctx, x, y, r, fill) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = fill; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

function text(ctx, s, x, y, size, fill, font) {
  ctx.fillStyle = fill;
  ctx.font = `bold ${size}px ${font || '"Segoe UI", Arial, sans-serif'}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// ---------------------------------------------------------------------------
// SCENE 1 — Pasar Lentera Senja
// ---------------------------------------------------------------------------
function drawMarket(ctx, W, H, mods) {
  // Langit senja.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#1b1033'); sky.addColorStop(0.55, '#4a2350'); sky.addColorStop(1, '#c65b2e');
  rect(ctx, 0, 0, W, 300, sky);

  // Bintang-bintang (posisi tetap dari seed).
  const rnd = mulberry32(20261121);
  for (let i = 0; i < 42; i++) {
    const x = 20 + rnd() * (W - 40), y = 8 + rnd() * 170, r = 0.8 + rnd() * 1.6;
    circle(ctx, x, y, r, `rgba(255, 244, 200, ${0.35 + rnd() * 0.55})`);
  }
  // Perbedaan 4: satu bintang ekstra di dekat bulan (hanya panel kanan).
  if (mods[4]) sparkleStar(ctx, 420, 45, 7, '#ffe9a8');

  // Bulan. Perbedaan 0: purnama vs sabit.
  circle(ctx, 478, 58, 24, '#f7e8b0');
  circle(ctx, 470, 54, 20, 'rgba(247, 232, 176, 0.25)');
  if (mods[0]) { circle(ctx, 488, 50, 20, '#3a2150'); }

  // Atap rumah jauh.
  ctx.fillStyle = '#241533';
  ctx.beginPath();
  ctx.moveTo(0, 250); ctx.lineTo(0, 210); ctx.lineTo(60, 180); ctx.lineTo(120, 210);
  ctx.lineTo(180, 190); ctx.lineTo(250, 215); ctx.lineTo(320, 185); ctx.lineTo(390, 212);
  ctx.lineTo(460, 192); ctx.lineTo(520, 214); ctx.lineTo(560, 196); ctx.lineTo(560, 250);
  ctx.closePath(); ctx.fill();
  for (const wx of [40, 150, 300, 430, 510]) {
    rect(ctx, wx, 218, 14, 16, '#ffd97a');
  }

  // Lampu gantung antar kios.
  ctx.strokeStyle = '#2c1e42'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 78); ctx.quadraticCurveTo(280, 118, 560, 74); ctx.stroke();
  const rnd2 = mulberry32(77);
  const bulbColors = ['#ffd97a', '#ff9d5c', '#ff6b6b', '#7ae0ff', '#ffd97a', '#ffb3d9'];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const x = t * 560;
    const y = (1 - t) * (1 - t) * 78 + 2 * (1 - t) * t * 118 + t * t * 74;
    circle(ctx, x, y + 8, 5, bulbColors[i % bulbColors.length]);
    circle(ctx, x, y + 8, 9, 'rgba(255, 217, 122, 0.18)');
  }

  // Tanah berbatu.
  const ground = ctx.createLinearGradient(0, 250, 0, H);
  ground.addColorStop(0, '#5a3d2e'); ground.addColorStop(1, '#3a2618');
  rect(ctx, 0, 250, W, H - 250, ground);
  const rnd3 = mulberry32(99);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 26; i++) {
    const x = rnd3() * W, y = 258 + rnd3() * 150;
    ctx.beginPath(); ctx.ellipse(x, y, 22 + rnd3() * 18, 8 + rnd3() * 5, 0, 0, Math.PI * 2); ctx.stroke();
  }

  drawMarketStalls(ctx, mods);
  drawMarketCat(ctx, 455, 318, mods);
}

function drawMarketStalls(ctx, mods) {
  // --- Kios kiri: buah-buahan ---
  roundRect(ctx, 28, 150, 150, 14, 4, '#8e2f2f');
  for (let i = 0; i < 5; i++) rect(ctx, 28 + i * 30, 150, 15, 14, i % 2 ? '#f4ead8' : '#8e2f2f');
  rect(ctx, 34, 164, 8, 130, '#6b4423'); rect(ctx, 164, 164, 8, 130, '#6b4423');
  roundRect(ctx, 30, 250, 146, 46, 6, '#7a4a26');
  // Keranjang jeruk.
  ellipse(ctx, 70, 252, 30, 12, '#5c3a1e');
  for (const [ox, oy] of [[-16, -8], [0, -12], [16, -8], [-8, -2], [8, -2]]) {
    circle(ctx, 70 + ox, 252 + oy, 9, '#ff8c1a');
    circle(ctx, 70 + ox - 2, 252 + oy - 3, 3, '#ffb347');
  }
  // Keranjang apel. Perbedaan 2: satu apel hilang (panel kanan).
  ellipse(ctx, 132, 252, 30, 12, '#5c3a1e');
  const apples = [[-16, -8], [0, -12], [16, -8], [-8, -2], [8, -2]];
  apples.forEach(([ox, oy], i) => {
    if (mods[2] && i === 2) return; // apel tengah hilang
    circle(ctx, 132 + ox, 252 + oy, 9, '#d92b2b');
    circle(ctx, 132 + ox - 2, 252 + oy - 3, 3, '#ff7a7a');
  });
  // Mangga di meja.
  ellipse(ctx, 105, 282, 8, 11, '#ffc93c'); ellipse(ctx, 122, 284, 8, 11, '#ffb52e');
  text(ctx, 'BUAH SEGAR', 103, 178, 12, '#f4ead8');

  // --- Kios tengah: lentera ---
  roundRect(ctx, 198, 96, 164, 16, 4, '#b3541e');
  // Perbedaan 6: garis awning oranye vs hijau.
  rect(ctx, 198, 96, 164, 5, mods[6] ? '#58b368' : '#ff8c1a');
  rect(ctx, 204, 112, 8, 150, '#6b4423'); rect(ctx, 348, 112, 8, 150, '#6b4423');
  roundRect(ctx, 200, 252, 160, 44, 6, '#7a4a26');
  // Papan nama. Perbedaan 5: angka 7 vs 9.
  roundRect(ctx, 232, 118, 96, 26, 6, '#f4ead8');
  text(ctx, mods[5] ? 'LENTERA 9' : 'LENTERA 7', 280, 131, 14, '#8e2f2f');
  // Lentera gantung.
  const lanternSpots = [[222, 158, '#ff5a4e'], [258, 166, '#ffd23e'], [280, 150, null], [306, 166, '#ff8c1a'], [338, 158, '#e457e6']];
  for (const [lx, ly, col] of lanternSpots) {
    const color = col === null ? (mods[1] ? '#2ec4b6' : '#ff5a4e') : col; // perbedaan 1: lentera tengah
    ctx.strokeStyle = '#3a2618'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx, 112); ctx.lineTo(lx, ly - 14); ctx.stroke();
    ellipse(ctx, lx, ly, 13, 16, color);
    ellipse(ctx, lx, ly, 7, 16, 'rgba(255,255,255,0.25)');
    rect(ctx, lx - 4, ly - 18, 8, 4, '#f2b544'); rect(ctx, lx - 4, ly + 14, 8, 4, '#f2b544');
    circle(ctx, lx, ly, 20, 'rgba(255, 200, 90, 0.12)');
  }
  // Guci kecil di meja tengah.
  ellipse(ctx, 240, 272, 10, 14, '#4f8ef7'); ellipse(ctx, 320, 272, 10, 14, '#7ae0ff');

  // --- Kios kanan: gerabah + peti ---
  roundRect(ctx, 392, 158, 140, 14, 4, '#2f6b4f');
  for (let i = 0; i < 5; i++) rect(ctx, 392 + i * 28, 158, 14, 14, i % 2 ? '#f4ead8' : '#2f6b4f');
  rect(ctx, 398, 172, 8, 122, '#6b4423'); rect(ctx, 518, 172, 8, 122, '#6b4423');
  roundRect(ctx, 394, 252, 136, 44, 6, '#7a4a26');
  ellipse(ctx, 420, 246, 12, 16, '#c96f4a'); ellipse(ctx, 448, 248, 10, 13, '#8e6bbf');
  ellipse(ctx, 478, 246, 12, 15, '#4f8ef7'); ellipse(ctx, 505, 248, 9, 12, '#58b368');
  text(ctx, 'GERABAH', 462, 186, 12, '#f4ead8');
  // Peti kayu tempat kucing duduk.
  rect(ctx, 428, 296, 64, 34, '#8a5a2b'); rect(ctx, 428, 296, 64, 6, '#6b4423');
  ctx.strokeStyle = '#5c3a1e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(428, 313); ctx.lineTo(492, 313); ctx.stroke();
}

function drawMarketCat(ctx, x, y, mods) {
  // Kucing oranye duduk di peti. Perbedaan 3: ekor tegak vs ekor rebah.
  ctx.strokeStyle = '#e8862e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mods[3]) { ctx.moveTo(x + 16, y + 8); ctx.quadraticCurveTo(x + 34, y + 6, x + 30, y - 14); }
  else { ctx.moveTo(x + 16, y + 8); ctx.quadraticCurveTo(x + 34, y + 14, x + 44, y + 4); }
  ctx.stroke();
  ellipse(ctx, x, y, 20, 16, '#f28c28'); // badan
  circle(ctx, x - 10, y - 16, 12, '#f28c28'); // kepala
  ctx.beginPath(); ctx.moveTo(x - 18, y - 24); ctx.lineTo(x - 20, y - 34); ctx.lineTo(x - 12, y - 26); ctx.closePath();
  ctx.fillStyle = '#f28c28'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 6, y - 26); ctx.lineTo(x - 2, y - 35); ctx.lineTo(x + 2, y - 25); ctx.closePath(); ctx.fill();
  circle(ctx, x - 14, y - 18, 2, '#241a05'); circle(ctx, x - 6, y - 18, 2, '#241a05');
  ctx.strokeStyle = '#241a05'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 10, y - 12); ctx.lineTo(x - 10, y - 9); ctx.stroke();
}

// ---------------------------------------------------------------------------
// SCENE 2 — Terumbu Karang
// ---------------------------------------------------------------------------
function drawReef(ctx, W, H, mods) {
  // Air laut.
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, '#0e7d8c'); water.addColorStop(0.5, '#0b4a6e'); water.addColorStop(1, '#082a4d');
  rect(ctx, 0, 0, W, H, water);
  // Sinar matahari menembus air.
  ctx.fillStyle = 'rgba(255, 250, 200, 0.10)';
  for (const [rx, rw] of [[60, 46], [200, 30], [330, 52], [470, 34]]) {
    ctx.beginPath();
    ctx.moveTo(rx, 0); ctx.lineTo(rx + rw, 0); ctx.lineTo(rx + rw + 60, 340); ctx.lineTo(rx + 60, 340);
    ctx.closePath(); ctx.fill();
  }
  // Gelembung kecil latar.
  const rnd = mulberry32(4242);
  for (let i = 0; i < 18; i++) {
    const x = rnd() * W, y = 40 + rnd() * 260, r = 2 + rnd() * 4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // Pasir.
  const sand = ctx.createLinearGradient(0, 350, 0, H);
  sand.addColorStop(0, '#d9c08a'); sand.addColorStop(1, '#a98f5f');
  ctx.beginPath(); ctx.moveTo(0, 362); ctx.quadraticCurveTo(140, 344, 280, 360);
  ctx.quadraticCurveTo(420, 376, 560, 352); ctx.lineTo(560, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = sand; ctx.fill();

  drawReefCorals(ctx, mods);
  drawReefFish(ctx, mods);
  drawReefDiver(ctx, mods);
  drawReefFloor(ctx, mods);
}

function drawReefCorals(ctx, mods) {
  // Karang kiri: cabang merah muda.
  ctx.strokeStyle = '#ff7fa5'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const branches = [
    [[60, 360], [60, 300], [40, 270]], [[60, 330], [80, 290], [95, 260]],
    [[60, 310], [45, 280], [30, 255]], [[60, 340], [70, 305], [85, 285]],
  ];
  for (const pts of branches) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); ctx.stroke();
    circle(ctx, pts[2][0], pts[2][1], 6, '#ff7fa5');
  }
  // Karang kanan. Perbedaan 1: merah muda vs oranye.
  const rightColor = mods[1] ? '#ff8c1a' : '#ff7fa5';
  ctx.strokeStyle = rightColor; ctx.lineWidth = 10;
  const branches2 = [
    [[420, 360], [420, 300], [400, 268]], [[420, 330], [445, 292], [460, 262]],
    [[420, 310], [405, 282], [392, 256]], [[420, 345], [432, 308], [448, 288]],
  ];
  for (const pts of branches2) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); ctx.stroke();
    circle(ctx, pts[2][0], pts[2][1], 7, rightColor);
  }
  // Rumput laut. Perbedaan 6: satu helai lebih tinggi.
  ctx.strokeStyle = '#2e8b57'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const weeds = [[500, 362, 300, 90], [520, 362, 320, 70], [540, 362, 310, 100], [20, 362, 320, 80], [180, 364, 330, 70]];
  for (const [wx, wy, top, h] of weeds) {
    const tall = mods[6] && wx === 500;
    ctx.beginPath(); ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + 14, wy - h / 2, wx - 4, wy - (tall ? h + 46 : h));
    ctx.stroke();
  }
  // Anemon kecil.
  for (const ax of [140, 240, 350]) {
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = '#c77dff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ax, 360);
      ctx.lineTo(ax - 8 + i * 4, 344); ctx.stroke();
    }
  }
}

function drawReefFish(ctx, mods) {
  // Ikan-ikan kecil berenang.
  const fish = [
    [120, 90, 16, '#ffd23e', 1], [200, 140, 13, '#ff8c1a', -1], [90, 200, 14, '#7ae0ff', 1],
    [260, 80, 12, '#ff6b9d', 1], [470, 130, 15, '#ffd23e', -1], [380, 250, 12, '#7ae0ff', 1],
  ];
  for (const [fx, fy, fs, col, dir] of fish) drawFish(ctx, fx, fy, fs, col, dir);
  // Perbedaan 0: satu ikan kuning ekstra (panel kanan).
  if (mods[0]) drawFish(ctx, 150, 120, 14, '#ffd23e', 1);
  // Penyu.
  ellipse(ctx, 300, 232, 34, 20, '#5a8f3c');
  ellipse(ctx, 300, 232, 24, 13, '#7ab648');
  circle(ctx, 338, 228, 9, '#5a8f3c');
  ctx.strokeStyle = '#5a8f3c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const [sx, sy, ex, ey] of [[282, 246, 272, 262], [318, 246, 328, 262], [272, 226, 258, 216], [328, 224, 342, 212]]) {
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  }
  circle(ctx, 341, 226, 2, '#082a4d');
}

function drawFish(ctx, x, y, s, color, dir) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ellipse(ctx, 0, 0, s, s * 0.55, color);
  ctx.beginPath(); ctx.moveTo(-s * 0.8, 0); ctx.lineTo(-s * 1.5, -s * 0.6); ctx.lineTo(-s * 1.5, s * 0.6); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  circle(ctx, s * 0.45, -s * 0.12, s * 0.14, '#082a4d');
  ctx.restore();
}

function drawReefDiver(ctx, mods) {
  // Penyelam dengan tabung. Perbedaan 2: tabung perak vs kuning.
  const x = 330, y = 178;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.25);
  ellipse(ctx, 0, 0, 26, 13, '#1f6fb2'); // badan (wetsuit)
  circle(ctx, 28, -4, 9, '#f2c89b'); // kepala
  circle(ctx, 30, -6, 5, '#7ae0ff'); // kaca masker
  ellipse(ctx, -6, -12, 7, 16, mods[2] ? '#ffd23e' : '#c0c8d0'); // tabung
  rect(ctx, -12, -30, 12, 5, '#5a5a5a');
  // Kaki + sirip.
  ctx.strokeStyle = '#1f6fb2'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-22, 4); ctx.lineTo(-38, 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-22, -2); ctx.lineTo(-36, -12); ctx.stroke();
  ellipse(ctx, -42, 16, 12, 5, '#ffd23e'); ellipse(ctx, -40, -14, 12, 5, '#ffd23e');
  ctx.restore();
  // Gelembung dari regulator.
  const bubbles = [[352, 152, 4], [360, 138, 5], [352, 122, 3], [366, 126, 4]];
  for (const [bx, by, br] of bubbles) {
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  // Perbedaan 4: satu gelembung ekstra.
  if (mods[4]) {
    ctx.beginPath(); ctx.arc(360, 110, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
}

function drawReefFloor(ctx, mods) {
  // Bintang laut. Perbedaan 3: 5 lengan vs 4 lengan.
  const arms = mods[3] ? 4 : 5;
  ctx.save(); ctx.translate(90, 370); ctx.fillStyle = '#ff8c5a';
  ctx.beginPath();
  for (let i = 0; i < arms * 2; i++) {
    const rr = i % 2 === 0 ? 18 : 7;
    const a = -Math.PI / 2 + (i * Math.PI) / arms;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
  circle(ctx, 90, 370, 4, '#e56b3a');
  // Kerang. Perbedaan 5: putih vs ungu.
  const shellColor = mods[5] ? '#b388ff' : '#fdf6e3';
  ctx.save(); ctx.translate(250, 385);
  ctx.beginPath(); ctx.moveTo(-14, 6); ctx.quadraticCurveTo(0, -16, 14, 6); ctx.closePath();
  ctx.fillStyle = shellColor; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 4, 4); ctx.lineTo(i * 6, -10); ctx.stroke();
  }
  ctx.restore();
  // Kerang kecil lain + batu.
  ellipse(ctx, 470, 392, 12, 7, '#e8d9b0'); ellipse(ctx, 160, 396, 10, 6, '#c9bda6');
  ellipse(ctx, 40, 398, 16, 8, '#8a7d68'); ellipse(ctx, 520, 372, 14, 7, '#8a7d68');
}

// ---------------------------------------------------------------------------
// SCENE 3 — Perpustakaan Tengah Malam
// ---------------------------------------------------------------------------
function drawLibrary(ctx, W, H, mods) {
  // Dinding hangat.
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#3a2a1c'); wall.addColorStop(1, '#241a12');
  rect(ctx, 0, 0, W, H, wall);

  // Jendela lengkung dengan langit malam.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(60, 40); ctx.quadraticCurveTo(140, -10, 220, 40);
  ctx.lineTo(220, 220); ctx.lineTo(60, 220); ctx.closePath(); ctx.clip();
  const night = ctx.createLinearGradient(0, 0, 0, 220);
  night.addColorStop(0, '#0d1233'); night.addColorStop(1, '#2c3a6e');
  rect(ctx, 60, 0, 160, 220, night);
  circle(ctx, 180, 70, 22, '#f7e8b0');
  circle(ctx, 172, 64, 18, 'rgba(247,232,176,0.25)');
  const rnd = mulberry32(31337);
  for (let i = 0; i < 16; i++) {
    circle(ctx, 70 + rnd() * 140, 20 + rnd() * 150, 1 + rnd() * 1.4, 'rgba(255,244,200,0.9)');
  }
  // Perbedaan 4: satu bintang ekstra di jendela.
  if (mods[4]) sparkleStar(ctx, 90, 80, 6, '#ffe9a8');
  // Siluet pohon di luar jendela.
  ctx.fillStyle = '#0a0d24';
  ctx.beginPath(); ctx.moveTo(60, 220); ctx.lineTo(90, 150); ctx.lineTo(110, 190); ctx.lineTo(130, 140);
  ctx.lineTo(150, 190); ctx.lineTo(170, 160); ctx.lineTo(180, 220); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(60, 40); ctx.quadraticCurveTo(140, -10, 220, 40);
  ctx.lineTo(220, 220); ctx.lineTo(60, 220); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(140, 10); ctx.lineTo(140, 220); ctx.moveTo(60, 120); ctx.lineTo(220, 120); ctx.stroke();

  drawLibraryShelves(ctx, mods);
  drawLibraryDesk(ctx, mods);
  drawLibraryClock(ctx, mods);
  drawLibraryRug(ctx, mods);
}

function drawLibraryShelves(ctx, mods) {
  // Rak kiri.
  drawShelf(ctx, 8, 30, 150, 330, 0);
  // Rak kanan.
  drawShelf(ctx, 402, 30, 150, 330, 1);
  // Rak tengah atas.
  drawShelf(ctx, 236, 130, 150, 180, 2);
  // Buku menonjol. Perbedaan 2: punggung buku merah vs biru.
  rect(ctx, 344, 168, 12, 44, mods[2] ? '#4f8ef7' : '#d92b2b');
  rect(ctx, 344, 168, 12, 6, '#f4ead8');
  // Tangga kayu bersandar di rak kanan.
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(400, 360); ctx.lineTo(430, 60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(428, 360); ctx.lineTo(458, 60); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const y = 320 - i * 52, x1 = 404 + i * 6, x2 = 432 + i * 6;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }
}

function drawShelf(ctx, x, y, w, h, seed) {
  rect(ctx, x, y, w, h, '#5c3a1e');
  const rnd = mulberry32(1000 + seed * 77);
  const palette = ['#b3541e', '#2f6b4f', '#4f8ef7', '#8e6bbf', '#c96f4a', '#a33b3b', '#2e8b57', '#d9a441'];
  const rows = 4, rowH = h / rows;
  for (let r = 0; r < rows; r++) {
    const ry = y + r * rowH;
    rect(ctx, x + 6, ry + 6, w - 12, rowH - 12, '#3a2618');
    let bx = x + 10;
    while (bx < x + w - 22) {
      const bw = 8 + rnd() * 10, bh = rowH - 22 - rnd() * 6;
      const col = palette[Math.floor(rnd() * palette.length)];
      rect(ctx, bx, ry + rowH - 10 - bh, bw, bh, col);
      rect(ctx, bx, ry + rowH - 10 - bh, bw, 3, 'rgba(244,234,216,0.7)');
      bx += bw + 2;
    }
    rect(ctx, x, ry + rowH - 6, w, 6, '#6b4423');
  }
}

function drawLibraryDesk(ctx, mods) {
  // Meja kayu.
  roundRect(ctx, 150, 330, 260, 18, 4, '#6b4423');
  rect(ctx, 164, 348, 10, 60, '#4a2f16'); rect(ctx, 386, 348, 10, 60, '#4a2f16');
  // Tumpukan buku di atas meja.
  const stackColors = ['#b3541e', '#2f6b4f', '#4f8ef7', '#8e6bbf'];
  stackColors.forEach((c, i) => {
    roundRect(ctx, 300 + (i % 2) * 4, 322 - i * 11, 84, 10, 2, c);
    rect(ctx, 300 + (i % 2) * 4, 322 - i * 11, 84, 3, 'rgba(244,234,216,0.6)');
  });
  // Kucing tidur di atas buku. Perbedaan 3: telinga tegak vs terlipat.
  const cx = 342, cy = 272;
  ellipse(ctx, cx, cy, 34, 13, '#5a5a5a');
  circle(ctx, cx - 26, cy - 8, 11, '#5a5a5a');
  ctx.beginPath(); ctx.moveTo(cx - 34, cy - 16); ctx.lineTo(cx - 36, cy - 26); ctx.lineTo(cx - 28, cy - 18); ctx.closePath();
  ctx.fillStyle = '#5a5a5a'; ctx.fill();
  ctx.beginPath();
  if (mods[3]) { ctx.moveTo(cx - 22, cy - 18); ctx.lineTo(cx - 16, cy - 20); ctx.lineTo(cx - 18, cy - 12); }
  else { ctx.moveTo(cx - 22, cy - 18); ctx.lineTo(cx - 20, cy - 28); ctx.lineTo(cx - 14, cy - 18); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx + 28, cy + 2); ctx.quadraticCurveTo(cx + 44, cy + 6, cx + 42, cy - 6); ctx.stroke();
  // Lilin. Perbedaan 1: satu lilin menyala vs dua.
  drawCandle(ctx, 180, 300, true);
  drawCandle(ctx, 208, 306, !!mods[1]);
  // Cangkir teh. Perbedaan 5: uap ada vs tidak ada.
  ellipse(ctx, 232, 326, 16, 10, '#f4ead8');
  rect(ctx, 232, 312, 30, 14, '#f4ead8');
  ctx.strokeStyle = '#c9bda6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(264, 319, 6, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  if (!mods[5]) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
    for (const sx of [240, 250]) {
      ctx.beginPath(); ctx.moveTo(sx, 308);
      ctx.quadraticCurveTo(sx + 4, 300, sx, 292); ctx.stroke();
    }
  }
}

function drawCandle(ctx, x, y, lit) {
  rect(ctx, x - 5, y, 10, 26, '#f4ead8');
  ellipse(ctx, x, y + 26, 9, 3, '#c9bda6');
  if (lit) {
    ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.quadraticCurveTo(x + 6, y - 4, x, y);
    ctx.quadraticCurveTo(x - 6, y - 4, x, y - 14); ctx.fillStyle = '#ffb52e'; ctx.fill();
    circle(ctx, x, y - 6, 3, '#fff3c4');
    circle(ctx, x, y - 6, 16, 'rgba(255, 181, 46, 0.15)');
  } else {
    ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 2, y - 6); ctx.stroke();
  }
}

function drawLibraryClock(ctx, mods) {
  // Jam dinding. Perbedaan 0: jarum 11:55 vs 12:05.
  circle(ctx, 280, 70, 26, '#f4ead8');
  ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(280, 70, 26, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    circle(ctx, 280 + Math.sin(a) * 21, 70 - Math.cos(a) * 21, 1.6, '#241a12');
  }
  ctx.strokeStyle = '#241a12'; ctx.lineCap = 'round';
  const hourAngle = mods[0] ? -0.02 : -0.09; // 12:05 vs 11:55
  const minAngle = mods[0] ? 0.26 : -0.26; // 5 menit vs 55 menit
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(280, 70);
  ctx.lineTo(280 + Math.sin(hourAngle) * 12, 70 - Math.cos(hourAngle) * 12); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(280, 70);
  ctx.lineTo(280 + Math.sin(minAngle) * 19, 70 - Math.cos(minAngle) * 19); ctx.stroke();
  circle(ctx, 280, 70, 3, '#d92b2b');
}

function drawLibraryRug(ctx, mods) {
  // Karpet. Perbedaan 6: garis karpet emas vs hijau.
  ellipse(ctx, 280, 392, 150, 22, '#7a2e2e');
  ellipse(ctx, 280, 392, 128, 16, '#a33b3b');
  ctx.strokeStyle = mods[6] ? '#58b368' : '#f2b544'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(280, 392, 104, 11, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#f4ead8'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(280, 392, 78, 8, 0, 0, Math.PI * 2); ctx.stroke();
}

// ---------------------------------------------------------------------------
// Katalog scene
// ---------------------------------------------------------------------------
export const SCENES = [
  {
    id: 'pasar-lentera',
    name: 'Pasar Lentera Senja',
    tagline: 'Pasar malam di bawah bulan — lentera, buah, dan seekor kucing.',
    difficulty: 'Mudah',
    diffs: [
      { x: 478, y: 58, r: 26, label: 'Bentuk bulan' },
      { x: 280, y: 150, r: 20, label: 'Warna lentera tengah' },
      { x: 132, y: 244, r: 16, label: 'Apel di keranjang' },
      { x: 472, y: 318, r: 22, label: 'Ekor kucing' },
      { x: 420, y: 45, r: 12, label: 'Bintang di langit' },
      { x: 280, y: 131, r: 18, label: 'Angka di papan lentera' },
      { x: 330, y: 100, r: 20, label: 'Garis awning kios' },
    ],
    draw: drawMarket,
  },
  {
    id: 'terumbu-karang',
    name: 'Terumbu Karang',
    tagline: 'Bawah laut yang tenang — ikan, karang, dan seorang penyelam.',
    difficulty: 'Sedang',
    diffs: [
      { x: 150, y: 120, r: 16, label: 'Ikan kuning kecil' },
      { x: 420, y: 300, r: 24, label: 'Warna karang kanan' },
      { x: 324, y: 166, r: 20, label: 'Warna tabung penyelam' },
      { x: 90, y: 370, r: 20, label: 'Lengan bintang laut' },
      { x: 360, y: 110, r: 12, label: 'Gelembung penyelam' },
      { x: 250, y: 385, r: 14, label: 'Warna kerang' },
      { x: 500, y: 300, r: 22, label: 'Tinggi rumput laut' },
    ],
    draw: drawReef,
  },
  {
    id: 'pustaka-tengah-malam',
    name: 'Perpustakaan Tengah Malam',
    tagline: 'Rak buku, lilin, dan kucing yang tidur di atas tumpukan buku.',
    difficulty: 'Sulit',
    diffs: [
      { x: 280, y: 70, r: 26, label: 'Jarum jam dinding' },
      { x: 208, y: 300, r: 18, label: 'Lilin kedua menyala' },
      { x: 350, y: 190, r: 16, label: 'Punggung buku di rak' },
      { x: 324, y: 258, r: 20, label: 'Telinga kucing tidur' },
      { x: 90, y: 80, r: 12, label: 'Bintang di jendela' },
      { x: 247, y: 318, r: 16, label: 'Uap teh' },
      { x: 280, y: 392, r: 18, label: 'Garis karpet' },
    ],
    draw: drawLibrary,
  },
];
