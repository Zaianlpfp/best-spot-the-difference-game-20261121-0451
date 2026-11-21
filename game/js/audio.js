// audio.js — semua bunyi dibuat prosedural dengan WebAudio, tanpa file suara.
// AudioContext dibuat malas (pada interaksi pertama) supaya tidak diblokir browser.

let ctx = null;

function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, startAt, dur, type, vol, slideTo) {
  const ac = audioContext();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + startAt + dur);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol || 0.15, ac.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export const audio = {
  // Dipanggil sekali dari gesture pengguna supaya context boleh berbunyi.
  unlock() { audioContext(); },

  // Chime dua nada saat perbedaan ditemukan.
  chime() {
    tone(880, 0, 0.28, 'sine', 0.18);
    tone(1318.5, 0.09, 0.34, 'sine', 0.15);
    tone(1760, 0.18, 0.3, 'triangle', 0.07);
  },

  // Dengung rendah saat klik salah.
  buzz() {
    tone(140, 0, 0.22, 'sawtooth', 0.12, 90);
    tone(98, 0.02, 0.2, 'square', 0.05, 70);
  },

  // Pling pendek saat hint dipakai.
  hint() {
    tone(1046.5, 0, 0.18, 'sine', 0.12);
    tone(1568, 0.07, 0.22, 'sine', 0.1);
  },

  // Detik saat waktu tinggal sedikit.
  tick() { tone(1200, 0, 0.05, 'square', 0.05); },

  // Fanfare kecil saat level selesai.
  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.16));
    tone(1318.5, 0.48, 0.5, 'sine', 0.12);
  },

  // Nada turun saat waktu habis.
  lose() {
    tone(392, 0, 0.3, 'triangle', 0.14, 330);
    tone(311, 0.28, 0.4, 'triangle', 0.14, 262);
    tone(233, 0.6, 0.6, 'triangle', 0.14, 196);
  },
};
