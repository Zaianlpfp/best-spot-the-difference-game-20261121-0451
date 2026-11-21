// render.js — menggambar kedua panel ke canvas setiap frame:
// scene dasar (kiri tanpa mod, kanan dengan semua mod) + marker emas untuk
// perbedaan yang sudah ditemukan + cincin hint yang berdenyut + sparkle.

export function makePanelRenderer(canvasLeft, canvasRight) {
  const ctxL = canvasLeft.getContext('2d');
  const ctxR = canvasRight.getContext('2d');
  const W = canvasLeft.width, H = canvasLeft.height;
  const particles = [];
  let lastTime = 0;

  function modsFor(panel, scene, foundCount) {
    // Panel kiri selalu versi asli; panel kanan selalu versi berubah.
    // (foundCount tidak dipakai di sini — marker digambar terpisah.)
    return panel === 'right' ? Object.fromEntries(scene.diffs.map((_, i) => [i, true])) : {};
  }

  function drawFoundRing(ctx, diff, ageMs) {
    const pulse = 1 + 0.06 * Math.sin(ageMs / 160);
    const r = diff.r * pulse;
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffd23e';
    ctx.shadowColor = '#ffd23e';
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r - 4, 0, Math.PI * 2); ctx.stroke();
    // Tanda centang kecil di tengah cincin.
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffd23e'; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(diff.x - 7, diff.y); ctx.lineTo(diff.x - 2, diff.y + 5); ctx.lineTo(diff.x + 8, diff.y - 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawHintRing(ctx, diff, nowMs) {
    const phase = (nowMs % 900) / 900;
    const r = diff.r + phase * 14;
    ctx.save();
    ctx.globalAlpha = 1 - phase;
    ctx.lineWidth = 5; ctx.strokeStyle = '#7ae0ff';
    ctx.shadowColor = '#7ae0ff'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawWrongMark(ctx, x, y, ageMs) {
    const alpha = Math.max(0, 1 - ageMs / 600);
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.lineWidth = 4; ctx.strokeStyle = '#ff6b5e'; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 9); ctx.lineTo(x + 9, y + 9);
    ctx.moveTo(x + 9, y - 9); ctx.lineTo(x - 9, y + 9);
    ctx.stroke(); ctx.restore();
  }

  function spawnSparkle(x, y) {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      particles.push({
        x, y,
        vx: Math.cos(a) * (30 + (i % 4) * 14),
        vy: Math.sin(a) * (30 + (i % 4) * 14) - 20,
        life: 0, maxLife: 500 + (i % 3) * 120,
        size: 2 + (i % 3),
      });
    }
  }

  function drawParticles(ctx, dtMs) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dtMs;
      if (p.life >= p.maxLife) { particles.splice(i, 1); continue; }
      p.x += (p.vx * dtMs) / 1000;
      p.y += (p.vy * dtMs) / 1000;
      p.vy += 40 * (dtMs / 1000);
      const alpha = 1 - p.life / p.maxLife;
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffd97a';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // Menggambar satu frame penuh. `state` datang dari game.js:
  // { scene, found: Set<indeks>, hint: {diff, until} | null,
  //   wrong: {x, y, at} | null, foundAt: Map<indeks, ms> }
  function render(state, nowMs) {
    const dt = lastTime ? Math.min(nowMs - lastTime, 50) : 16;
    lastTime = nowMs;
    const scene = state.scene;

    ctxL.clearRect(0, 0, W, H);
    ctxR.clearRect(0, 0, W, H);
    scene.draw(ctxL, W, H, modsFor('left', scene));
    scene.draw(ctxR, W, H, modsFor('right', scene));

    for (const idx of state.found) {
      const diff = scene.diffs[idx];
      drawFoundRing(ctxL, diff, nowMs - (state.foundAt.get(idx) || 0));
      drawFoundRing(ctxR, diff, nowMs - (state.foundAt.get(idx) || 0));
    }
    if (state.hint && nowMs < state.hint.until) {
      const diff = scene.diffs[state.hint.diff];
      drawHintRing(ctxL, diff, nowMs);
      drawHintRing(ctxR, diff, nowMs);
    }
    if (state.wrong) {
      const age = nowMs - state.wrong.at;
      if (age < 600) {
        drawWrongMark(ctxL, state.wrong.x, state.wrong.y, age);
        drawWrongMark(ctxR, state.wrong.x, state.wrong.y, age);
      }
    }
    drawParticles(ctxL, dt);
    drawParticles(ctxR, dt);
  }

  return { render, spawnSparkle, W, H };
}
