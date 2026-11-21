// game.js — state, input, timer, HUD, dan layar-layar game.
// Satu-satunya yang tahu soal "menang/kalah": render.js hanya menggambar,
// scenes.js hanya tahu cara menggambar tiap dunia.

import { SCENES } from './scenes.js';
import { audio } from './audio.js';

const LEVEL_TIME_MS = 120000;
const WRONG_PENALTY_MS = 5000;
const HINT_COST_MS = 10000;
const HINTS_PER_LEVEL = 3;

export function createGame(renderer, els) {
  const state = {
    phase: 'menu', // menu | playing | levelwin | win | lose
    levelIndex: 0,
    scene: SCENES[0],
    found: new Set(),
    foundAt: new Map(),
    score: 0,
    timeLeftMs: LEVEL_TIME_MS,
    hintsLeft: HINTS_PER_LEVEL,
    hint: null, // { diff, until }
    wrong: null, // { x, y, at }
    paused: false,
    totalFound: 0,
  };

  let lastTick = 0;
  let lastTickSecond = -1;
  let rafId = 0;

  function $(id) { return els[id]; }

  function fmtTime(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  function updateHud() {
    $('hud-level').textContent = `${state.levelIndex + 1} / ${SCENES.length}`;
    $('hud-found').textContent = `${state.found.size} / ${state.scene.diffs.length}`;
    $('hud-left').textContent = String(state.scene.diffs.length - state.found.size);
    $('hud-score').textContent = String(state.score);
    $('hud-time').textContent = fmtTime(state.timeLeftMs);
    $('hud-hints').textContent = '●'.repeat(state.hintsLeft) + '○'.repeat(HINTS_PER_LEVEL - state.hintsLeft);
    $('hint-count').textContent = `(${state.hintsLeft} tersisa)`;
    const frac = state.timeLeftMs / LEVEL_TIME_MS;
    $('timerfill').style.width = `${Math.max(0, frac * 100)}%`;
    $('timerfill').classList.toggle('low', state.timeLeftMs <= 15000);
    document.querySelector('.hud-item.timer').classList.toggle('low', state.timeLeftMs <= 15000 && state.phase === 'playing');
    $('scene-name').textContent = `${state.scene.name} · ${state.scene.difficulty}`;
    $('btn-hint').disabled = state.phase !== 'playing' || state.hintsLeft <= 0;
    $('btn-restart').disabled = state.phase === 'menu';
    document.querySelectorAll('.level-btn').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.level) === state.levelIndex);
    });
  }

  function showMessage(text, bad) {
    const m = $('message');
    m.textContent = text;
    m.classList.toggle('bad', !!bad);
  }

  function showOverlay(title, text, scoreLine, buttons) {
    $('overlay-title').textContent = title;
    $('overlay-text').textContent = text;
    $('overlay-score').textContent = scoreLine || '';
    const box = $('overlay-buttons');
    box.innerHTML = '';
    for (const b of buttons) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = b.label;
      if (b.secondary) btn.className = 'secondary';
      btn.addEventListener('click', b.onClick);
      box.appendChild(btn);
    }
    $('overlay').classList.remove('hidden');
  }

  function hideOverlay() { $('overlay').classList.add('hidden'); }

  function startLevel(index) {
    state.levelIndex = index;
    state.scene = SCENES[index];
    state.found = new Set();
    state.foundAt = new Map();
    state.timeLeftMs = LEVEL_TIME_MS;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hint = null;
    state.wrong = null;
    state.paused = false;
    state.phase = 'playing';
    lastTickSecond = -1;
    hideOverlay();
    showMessage(`${state.scene.name} — ${state.scene.tagline}`);
    updateHud();
  }

  function startGame() {
    state.score = 0;
    state.totalFound = 0;
    startLevel(0);
  }

  function levelComplete() {
    state.phase = 'levelwin';
    const timeBonus = Math.floor(state.timeLeftMs / 1000) * 2;
    const hintBonus = state.hintsLeft * 25;
    state.score += timeBonus + hintBonus;
    audio.fanfare();
    updateHud();
    const isLast = state.levelIndex === SCENES.length - 1;
    if (isLast) {
      state.phase = 'win';
      showOverlay(
        'Kamu Menemukan Semuanya!',
        'Ketiga dunia sudah kamu telusuri sampai tuntas — 21 perbedaan, tidak satu pun lolos dari matamu.',
        `Skor akhir: ${state.score} (bonus waktu +${timeBonus}, bonus hint +${hintBonus})`,
        [
          { label: 'Main Lagi dari Level 1', onClick: () => { audio.unlock(); startGame(); } },
          { label: 'Ulangi Level Ini', secondary: true, onClick: () => startLevel(state.levelIndex) },
        ],
      );
    } else {
      showOverlay(
        `Level ${state.levelIndex + 1} Selesai!`,
        `${state.scene.name} tuntas — 7 dari 7 perbedaan ketemu. Dunia berikutnya menanti.`,
        `Skor: ${state.score} (bonus waktu +${timeBonus}, bonus hint +${hintBonus})`,
        [
          { label: `Lanjut ke ${SCENES[state.levelIndex + 1].name}`, onClick: () => startLevel(state.levelIndex + 1) },
          { label: 'Ulangi Level Ini', secondary: true, onClick: () => startLevel(state.levelIndex) },
        ],
      );
    }
  }

  function timeUp() {
    state.phase = 'lose';
    state.timeLeftMs = 0;
    audio.lose();
    updateHud();
    showOverlay(
      'Waktu Habis!',
      `${state.scene.name} masih menyimpan ${state.scene.diffs.length - state.found.size} perbedaan yang belum ketemu. Coba lagi — kali ini lebih cepat.`,
      `Skor: ${state.score}`,
      [
        { label: 'Coba Lagi (R)', onClick: () => startLevel(state.levelIndex) },
        { label: 'Kembali ke Menu', secondary: true, onClick: showMenu },
      ],
    );
  }

  function showMenu() {
    state.phase = 'menu';
    state.levelIndex = 0;
    state.scene = SCENES[0];
    state.found = new Set();
    state.foundAt = new Map();
    state.timeLeftMs = LEVEL_TIME_MS;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hint = null;
    state.wrong = null;
    state.paused = false;
    updateHud();
    showOverlay(
      'Cari Bedanya',
      'Dua gambar berdampingan. Tujuh perbedaan bersembunyi di antaranya. Klik perbedaan di gambar mana pun — kiri atau kanan, sama saja. 120 detik per dunia, tiga dunia menantimu.',
      'Pilih level dengan tombol 1 / 2 / 3, atau tekan Mulai.',
      [
        { label: 'Mulai — Pasar Lentera Senja', onClick: () => { audio.unlock(); startGame(); } },
        { label: 'Level 2 — Terumbu Karang', secondary: true, onClick: () => { audio.unlock(); state.score = 0; startLevel(1); } },
        { label: 'Level 3 — Perpustakaan', secondary: true, onClick: () => { audio.unlock(); state.score = 0; startLevel(2); } },
      ],
    );
  }

  function nearestUnfound(x, y) {
    let best = null, bestDist = Infinity;
    state.scene.diffs.forEach((d, i) => {
      if (state.found.has(i)) return;
      const dist = Math.hypot(d.x - x, d.y - y);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    if (best === null) return null;
    return { index: best, dist: bestDist, radius: state.scene.diffs[best].r };
  }

  function onPanelClick(event, nowMs) {
    audio.unlock();
    if (state.phase !== 'playing' || state.paused) return;
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const hit = nearestUnfound(x, y);
    if (hit && hit.dist <= hit.radius + 10) {
      state.found.add(hit.index);
      state.foundAt.set(hit.index, nowMs);
      state.totalFound += 1;
      state.score += 100;
      renderer.spawnSparkle(state.scene.diffs[hit.index].x, state.scene.diffs[hit.index].y);
      audio.chime();
      const left = state.scene.diffs.length - state.found.size;
      showMessage(left === 0
        ? 'Semua ketemu!'
        : `Ketemu! "${state.scene.diffs[hit.index].label}" — tersisa ${left} lagi.`);
      updateHud();
      if (state.found.size === state.scene.diffs.length) levelComplete();
    } else {
      state.timeLeftMs = Math.max(0, state.timeLeftMs - WRONG_PENALTY_MS);
      state.wrong = { x, y, at: nowMs };
      document.getElementById('panels').classList.remove('shake');
      void document.getElementById('panels').offsetWidth; // restart animasi
      document.getElementById('panels').classList.add('shake');
      audio.buzz();
      showMessage('Bukan di situ — minus 5 detik!', true);
      updateHud();
      if (state.timeLeftMs <= 0) timeUp();
    }
  }

  function useHint(nowMs) {
    audio.unlock();
    if (state.phase !== 'playing' || state.paused) return;
    if (state.hintsLeft <= 0) { showMessage('Hint sudah habis di level ini.', true); return; }
    const remaining = state.scene.diffs.map((_, i) => i).filter((i) => !state.found.has(i));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.timeLeftMs = Math.max(0, state.timeLeftMs - HINT_COST_MS);
    state.hint = { diff: pick, until: nowMs + 3000 };
    audio.hint();
    showMessage(`Hint: perhatikan "${state.scene.diffs[pick].label}"… (−10 detik)`);
    updateHud();
    if (state.timeLeftMs <= 0) timeUp();
  }

  function tick(nowMs) {
    if (state.phase === 'playing' && !state.paused) {
      if (lastTick) {
        const dt = Math.min(nowMs - lastTick, 250);
        state.timeLeftMs -= dt;
        const sec = Math.ceil(state.timeLeftMs / 1000);
        if (sec <= 10 && sec > 0 && sec !== lastTickSecond) {
          lastTickSecond = sec;
          audio.tick();
        }
        if (state.timeLeftMs <= 0) {
          state.timeLeftMs = 0;
          updateHud();
          timeUp();
        } else {
          updateHud();
        }
      }
    }
    lastTick = nowMs;
    renderer.render(state, nowMs);
    rafId = requestAnimationFrame(tick);
  }

  // State deterministik untuk screenshot (dipakai main.js lewat ?shot=...):
  // timer dijeda, perbedaan tertentu sudah ditandai, overlay tertentu tampil.
  function applyShot(shot) {
    const level = Math.min(Math.max(shot.level || 0, 0), SCENES.length - 1);
    state.levelIndex = level;
    state.scene = SCENES[level];
    state.found = new Set(shot.found || []);
    state.foundAt = new Map([...state.found].map((i) => [i, 0]));
    state.score = shot.score ?? state.found.size * 100;
    state.totalFound = state.found.size;
    state.timeLeftMs = shot.timeLeftMs ?? LEVEL_TIME_MS;
    state.hintsLeft = shot.hints ?? HINTS_PER_LEVEL;
    state.hint = shot.hintDiff != null ? { diff: shot.hintDiff, until: Number.POSITIVE_INFINITY } : null;
    state.wrong = null;
    state.paused = true;
    if (shot.screen === 'menu') {
      state.phase = 'menu';
      showMenu();
      state.paused = true;
    } else if (shot.screen === 'levelwin') {
      state.phase = 'levelwin';
      showOverlay(
        `Level ${level + 1} Selesai!`,
        `${state.scene.name} tuntas — 7 dari 7 perbedaan ketemu. Dunia berikutnya menanti.`,
        `Skor: ${state.score}`,
        [{ label: `Lanjut ke ${SCENES[Math.min(level + 1, 2)].name}`, onClick: () => {} }],
      );
    } else if (shot.screen === 'win') {
      state.phase = 'win';
      showOverlay(
        'Kamu Menemukan Semuanya!',
        'Ketiga dunia sudah kamu telusuri sampai tuntas — 21 perbedaan, tidak satu pun lolos dari matamu.',
        `Skor akhir: ${state.score}`,
        [{ label: 'Main Lagi dari Level 1', onClick: () => {} }],
      );
    } else if (shot.screen === 'lose') {
      state.phase = 'lose';
      showOverlay(
        'Waktu Habis!',
        `${state.scene.name} masih menyimpan perbedaan yang belum ketemu.`,
        `Skor: ${state.score}`,
        [{ label: 'Coba Lagi (R)', onClick: () => {} }],
      );
    } else {
      state.phase = 'playing';
      hideOverlay();
    }
    updateHud();
  }

  function bind() {
    for (const panel of [els['panel-left'], els['panel-right']]) {
      panel.addEventListener('click', (e) => onPanelClick(e, performance.now()));
    }
    $('btn-hint').addEventListener('click', () => useHint(performance.now()));
    $('btn-restart').addEventListener('click', () => { if (state.phase !== 'menu') startLevel(state.levelIndex); });
    document.querySelectorAll('.level-btn').forEach((b) => {
      b.addEventListener('click', () => { audio.unlock(); state.score = 0; startLevel(Number(b.dataset.level)); });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') useHint(performance.now());
      else if (e.key === 'r' || e.key === 'R') { if (state.phase !== 'menu') startLevel(state.levelIndex); }
      else if (e.key === '1' || e.key === '2' || e.key === '3') {
        audio.unlock(); state.score = 0; startLevel(Number(e.key) - 1);
      } else if (e.key === 'Enter' && state.phase === 'levelwin') {
        if (state.levelIndex < SCENES.length - 1) startLevel(state.levelIndex + 1);
      }
    });
    rafId = requestAnimationFrame(tick);
  }

  return {
    state, bind, showMenu, startLevel, startGame, useHint, applyShot,
    stop() { cancelAnimationFrame(rafId); },
  };
}
