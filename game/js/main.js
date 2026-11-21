// main.js — boot game dan mode screenshot deterministik.
// Mode screenshot dipakai maker untuk mengambil gambar game yang nyata:
//   ?shot=cover  level 1, 3 perbedaan sudah ketemu, 4 masih tersembunyi
//   ?shot=hint   level 2, 1 ketemu + cincin hint aktif di perbedaan lain
//   ?shot=win    level 3 selesai — layar menang total
//   ?shot=menu   layar mulai
// Timer dijeda di semua mode shot supaya gambar bisa diulang byte demi byte
// (kecuali animasi cincin hint yang berdenyut — itu bagian dari gamenya).

import { SCENES } from './scenes.js';
import { makePanelRenderer } from './render.js';
import { createGame } from './game.js';

const SHOTS = {
  cover: { level: 0, found: [0, 1, 4], timeLeftMs: 87000, hints: 2, score: 300 },
  hint: { level: 1, found: [0], hintDiff: 3, timeLeftMs: 64000, hints: 2, score: 100 },
  win: { level: 2, found: [0, 1, 2, 3, 4, 5, 6], timeLeftMs: 41000, hints: 3, score: 2350, screen: 'win' },
  menu: { level: 0, found: [], timeLeftMs: 120000, hints: 3, score: 0, screen: 'menu' },
};

function parseShotParams() {
  const q = new URLSearchParams(window.location.search);
  const name = q.get('shot');
  if (name && SHOTS[name]) return SHOTS[name];
  if (name || q.has('level') || q.has('found')) {
    return {
      level: Number(q.get('level') || 0),
      found: (q.get('found') || '').split(',').filter(Boolean).map(Number),
      timeLeftMs: Number(q.get('t') || 120) * 1000,
      hints: Number(q.get('hints') || 3),
      score: Number(q.get('score') || 0),
      hintDiff: q.get('hintDiff') != null ? Number(q.get('hintDiff')) : undefined,
      screen: q.get('screen') || undefined,
    };
  }
  return null;
}

const els = {};
for (const id of [
  'hud-level', 'hud-found', 'hud-left', 'hud-score', 'hud-time', 'hud-hints',
  'hint-count', 'timerfill', 'message', 'overlay', 'overlay-title', 'overlay-text',
  'overlay-score', 'overlay-buttons', 'btn-hint', 'btn-restart',
  'panel-left', 'panel-right', 'scene-name',
]) {
  els[id] = document.getElementById(id);
}

const renderer = makePanelRenderer(els['panel-left'], els['panel-right']);
const game = createGame(renderer, els);
game.bind();

const shot = parseShotParams();
if (shot) {
  game.applyShot(shot);
} else {
  game.showMenu();
}

// Diekspos untuk play-test otomatis (Playwright): window.__game.
window.__game = game;
window.__scenes = SCENES;
