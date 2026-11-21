# Cari Bedanya — Tiga Dunia Kecil

[![best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Zaianlpfp/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Zaianlpfp/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Entri untuk [Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) di make.fun.

**Cari Bedanya — Tiga Dunia Kecil**: dua gambar nyaris identik berdampingan, tujuh
perbedaan bersembunyi di setiap dunia. Klik perbedaan di gambar mana pun — kiri
atau kanan, sama saja. Tiga dunia orisinal, digambar prosedural langsung di canvas:

1. **Pasar Lentera Senja** — pasar malam di bawah bulan: lentera, buah, seekor kucing.
2. **Terumbu Karang** — bawah laut yang tenang: ikan, karang, dan seorang penyelam.
3. **Perpustakaan Tengah Malam** — rak buku, lilin, dan kucing yang tidur di atas buku.

## Cara main

- **Klik** perbedaan di Gambar A atau Gambar B: cincin emas + sparkle + chime, +100 skor.
- Klik salah: −5 detik, layar bergetar, dengung rendah.
- **Hint (H)**: 3 per level, masing-masing −10 detik, cincin biru berdenyut menunjukkan satu perbedaan.
- **Timer** 120 detik per level, bar waktu menyusut dan berkedip di 10 detik terakhir.
- **R** ulangi level, **1/2/3** pilih level, **Enter** lanjut ke level berikut.
- Menang: ketemu 7/7 sebelum waktu habis — bonus waktu + bonus hint. Kalah: waktu habis.

## Menjalankan

```sh
python3 -m http.server 8080 --directory game
# buka http://localhost:8080 di desktop Chrome
```

Tanpa build step, tanpa network request — semua script, gaya, dan suara adalah
file lokal atau `data:` URI; suara dibuat prosedural dengan WebAudio.

## Struktur

- `game/index.html` — halaman game
- `game/css/style.css` — semua gaya
- `game/js/scenes.js` — tiga dunia + 7 perbedaan tiap dunia (definisi + gambar)
- `game/js/render.js` — gambar panel, cincin emas, hint berdenyut, sparkle
- `game/js/game.js` — state, input, timer, HUD, layar menang/kalah
- `game/js/audio.js` — bunyi prosedural (chime, buzz, hint, fanfare)
- `game/js/main.js` — boot + mode screenshot deterministik (`?shot=cover|hint|win|menu`)
- `main.ts` — program hand-in (Node 22 stdlib): salin `game/` + `screenshots/`, tulis `dossier.json`
