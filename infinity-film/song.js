// THE SOUNDTRACK (Шексіздік пен мәңгілік): an original kui for a synthesized two-string dombra (tuned D–G), plus the narration.
//   node song.js            builds out/music.wav (voice 60 % + music 40 %), out/voice.wav and out/bed.wav
// The film is long, so the sound is made in chunks of CHUNK seconds (each with PAD seconds of overlap, so notes and
// reverb carry across the joins), then joined and balanced once for the whole film:
//   - every narration line is brought to the same loudness (a recording from my-voice/ too);
//   - the music bed is set 20·log10(40/60) = −3.5 dB under the voice (loudness, EBU R128): voice 60 %, music 40 %;
//   - one gain brings the mix to −16 LUFS, a limiter catches the peaks. voice.wav + bed.wav = music.wav.
// Every chapter has a mood in score.js: 'shertpe' (plucked, lyrical) or 'gallop' (the horse-step strum).
const path = require('path');
const fs = require('fs');
const { execFileSync, spawnSync } = require('child_process');
const sc = require('./score');
const { BEAT, DURATION, S, ev, MOOD, names } = sc;
const OUT = path.join(__dirname, 'out'), CH = path.join(OUT, 'chunks');
const CHUNK = 150, PAD = 12;

// ======================= the conductor: make every chunk, join them, balance =======================
if (!process.env.SONG_CHUNK) {
  fs.mkdirSync(CH, { recursive: true });
  const parts = [];
  for (let c0 = 0, k = 0; c0 < DURATION; c0 += CHUNK, k++) parts.push([k, c0, Math.min(DURATION, c0 + CHUNK)]);
  for (const [k, c0, c1] of parts) {
    const r = spawnSync(process.execPath, ['--max-old-space-size=6000', __filename], { env: { ...process.env, SONG_CHUNK: `${k}:${c0}:${c1}` }, stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status || 1);
  }
  const list = (s) => { const f = path.join(CH, `${s}.txt`); fs.writeFileSync(f, parts.map(([k]) => `file '${s}_${k}.wav'`).join('\n')); return f; };
  const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  ff(['-f', 'concat', '-safe', '0', '-i', list('vox'), '-c', 'copy', path.join(CH, 'vox.wav')]);
  ff(['-f', 'concat', '-safe', '0', '-i', list('bed'), '-c', 'copy', path.join(CH, 'bed.wav')]);
  const lufs = (args) => { const r = spawnSync('ffmpeg', ['-hide_banner', ...args, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 30 }); const m = /I:\s+(-?[\d.]+) LUFS\s+Threshold/.exec(r.stderr.split('Summary:').pop()); return m ? +m[1] : NaN; };
  const Lv = lufs(['-i', path.join(CH, 'vox.wav')]), Lb = lufs(['-i', path.join(CH, 'bed.wav')]);
  const gb = Math.pow(10, (Lv + 20 * Math.log10(0.4 / 0.6) - Lb) / 20);
  const mixLufs = (() => { const r = spawnSync('ffmpeg', ['-hide_banner', '-i', path.join(CH, 'vox.wav'), '-i', path.join(CH, 'bed.wav'), '-filter_complex', `[1:a]volume=${gb}[b];[0:a][b]amix=inputs=2:normalize=0,ebur128`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 30 }); const m = /I:\s+(-?[\d.]+) LUFS\s+Threshold/.exec(r.stderr.split('Summary:').pop()); return +m[1]; })();
  const g = Math.pow(10, (-16 - mixLufs) / 20);
  ff(['-i', path.join(CH, 'vox.wav'), '-i', path.join(CH, 'bed.wav'), '-filter_complex', `[0:a]volume=${g}[a];[1:a]volume=${gb * g}[b];[a][b]amix=inputs=2:normalize=0,alimiter=limit=0.891:level=false:attack=3:release=60`, '-ar', '48000', '-c:a', 'pcm_s16le', path.join(OUT, 'music.wav')]);
  ff(['-i', path.join(CH, 'vox.wav'), '-af', `volume=${g},alimiter=limit=0.891:level=false`, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', path.join(OUT, 'voice.wav')]);
  ff(['-i', path.join(CH, 'bed.wav'), '-af', `volume=${gb * g},alimiter=limit=0.891:level=false`, '-ar', '48000', '-c:a', 'pcm_s16le', path.join(OUT, 'bed.wav')]);
  const lv = lufs(['-i', path.join(OUT, 'voice.wav')]) + 3.01 /* mono file: +3 dB = the same voice in both channels of the mix */, lb = lufs(['-i', path.join(OUT, 'bed.wav')]), lm = lufs(['-i', path.join(OUT, 'music.wav')]);
  const av = Math.pow(10, lv / 20), ab = Math.pow(10, lb / 20);
  console.log(`out/music.wav  ${(DURATION / 60).toFixed(1)} min  ${lm.toFixed(1)} LUFS  ·  voice ${lv.toFixed(1)} LUFS, music ${lb.toFixed(1)} LUFS  ·  voice ${(100 * av / (av + ab)).toFixed(0)} % / music ${(100 * ab / (av + ab)).toFixed(0)} %`);
  return;
}

// ======================= one chunk =======================
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const [K, C0, C1] = process.env.SONG_CHUNK.split(':').map(Number);
const OFF = C0 - PAD, LEN = C1 - C0 + 2 * PAD, N = Math.ceil(LEN * SR);
const inWin = (a, b) => b >= OFF - 1 && a <= OFF + LEN + 1;
// every event is placed in film time; the chunk shifts it into its own window
for (const fn of ['addMono', 'addStereo']) { const o = Bus.prototype[fn]; Bus.prototype[fn] = function (...a) { const i = fn === 'addMono' ? 1 : 2; a[i] -= OFF; return o.apply(this, a); }; }
const bus = () => new Bus(N);
const dombra = bus(), drone = bus(), drum = bus(), fx = bus(), verb = bus(), voice = bus();

// ---------- the dombra ----------
const G3 = 55, D3 = 50;
const cache = new Map();
const string = (midi, dur, bright, seed) => {
  const k = `${midi}|${dur.toFixed(2)}|${bright.toFixed(2)}|${seed}`;
  if (!cache.has(k)) cache.set(k, I.guitar(midi, dur, { bright, sustain: 0.9955, seed }));
  return cache.get(k);
};
const tick = I.woodTick(1.5);
const under = (off) => { const pc = ((off % 12) + 12) % 12; return pc === 5 ? 53 : pc === 8 ? 51 : D3; };
function stroke(t, off, { down = true, gain = 1, dur = 0.3, both = true } = {}) {
  if (!inWin(t, t + dur + 1)) return;
  const hi = G3 + off, lo = under(off), seed = 1 + (Math.round(t * 1000) % 5);
  const spread = 0.011;
  const a = string(hi, dur, down ? 0.5 : 0.62, seed), b = string(lo, dur, down ? 0.42 : 0.55, seed + 9);
  dombra.addMono(a, t + (down ? spread : 0), gain * 0.5, 0.12);
  if (both) dombra.addMono(b, t + (down ? 0 : spread), gain * 0.36, -0.12);
  verb.addMono(a, t, gain * 0.1);
  if (down && gain > 0.75) dombra.addMono(tick, t, 0.05 * gain, 0);
}
const THEME = {
  S: [0, null, 3, 2, 0, null, -2, 0, 3, null, 5, 7, 5, 3, 2, null, 7, null, 8, 7, 5, null, 3, 5, 3, 2, 0, -2, 0, null, null, null],
  A: [0, 0, 3, 2, 0, 0, 7, 5, 3, 3, 5, 3, 2, 2, 0, 0, 0, 0, 3, 5, 7, 7, 10, 8, 7, 5, 3, 2, 0, 0, 0, 0],
  B: [5, 5, 7, 8, 7, 5, 3, 5, 7, 7, 10, 12, 10, 8, 7, 7, 12, 12, 10, 8, 7, 8, 10, 7, 5, 3, 2, 3, 0, 0, 0, 0],
  C: [12, 12, 14, 15, 14, 12, 10, 12, 15, 15, 14, 12, 10, 12, 14, 12, 12, 10, 8, 7, 8, 10, 12, 10, 7, 5, 3, 2, 0, 0, 7, 0],
};
const quiet = (t) => (t < ev.title + 2 * BEAT) || t > ev.fin - 0.2;

for (const n of names) {
  const [t0, t1] = S[n], mood = MOOD[n], th = THEME[mood.theme];
  if (!inWin(t0 - 2, t1 + 4)) continue;
  const beats = Math.round((t1 - t0) / BEAT);
  let last = 0;
  for (let b = 0; b < beats; b++) {
    const t = t0 + b * BEAT;
    const off = th[b % th.length];
    if (off !== null) last = off;
    if (quiet(t) || !inWin(t, t + 2)) continue;
    const g = mood.level * (b % 4 === 0 ? 1 : b % 2 === 0 ? 0.9 : 0.8), s = BEAT / 4;
    if (mood.feel === 'shertpe') {
      if (off === null) continue;
      stroke(t, off, { gain: g * 1.1, dur: 0.9 });
      if (b % 4 === 2) stroke(t + 2 * s, off, { down: false, gain: g * 0.55, dur: 0.5, both: false });
    } else {
      stroke(t, off ?? last, { gain: g, dur: 0.32 });
      stroke(t + 2 * s, off ?? last, { gain: g * 0.7, dur: 0.2 });
      stroke(t + 3 * s, off ?? last, { down: false, gain: g * 0.55, dur: 0.2 });
    }
  }
  // the low drone under the chapter, and a soft frame-drum beat where it begins
  for (const [midi, gn] of [[31, 1], [38, 0.7], [43, 0.4]]) { const { L, R } = I.strings(midi, t1 - t0 - 0.4, { attack: 1.6, release: 1.4, bright: 0.5, seed: midi }); drone.addStereo(L, R, t0, 0.05 * gn * (0.5 + mood.level)); }
  if (n !== names[0]) { drum.addMono(I.timpani(38, { decay: 0.9 }), t0, 0.32); drum.addMono(I.tom(70, 0.4), t0, 0.3); }
}
const ring = (t, off, gain, dur = 2.2) => { if (!inWin(t, t + dur)) return; const a = string(G3 + off, dur, 0.5, 2); dombra.addMono(a, t, gain, 0); verb.addMono(a, t, gain * 0.5); };
if (inWin(0, ev.title + 4)) {
  const { L, R } = I.strings(31, ev.title + 3, { attack: 2.5, release: 1.5, bright: 0.45, seed: 3 }); drone.addStereo(L, R, 0, 0.06);
  fx.addMono(I.noiseSweep(1.4, 300, 4000, { q: 0.8 }), Math.max(0, ev.title - 1.2), 0.04);
  drum.addMono(I.timpani(31, { decay: 1.6 }), ev.title, 0.55);
  [0, 7, 12].forEach((o) => stroke(ev.title, o, { gain: 1.0, dur: 1.6 }));
}
// a bell-like pluck where each chapter's title appears; a rising phrase under each diagram
for (const n of names.slice(1)) { ring(S[n][0] + 0.25, 12, 0.3, 2.2); ring(S[n][0] + 0.55, 7, 0.22, 1.8); }
for (const f of sc.figs) [0, 3, 7, 12, 7, 3].forEach((o, i) => ring(f.t + 0.5 + i * 2.4, o, 0.32, 2.6));
if (inWin(ev.fin - 1, ev.fin + 5)) { [0, 7, 12].forEach((o, i) => stroke(ev.fin + i * 0.02, o, { gain: 1.1, dur: 3.5 })); drum.addMono(I.timpani(31, { decay: 2 }), ev.fin, 0.45); }

// ---------- the narration: every line at the same loudness ----------
for (const l of sc.lines) {
  if (!inWin(l.t, l.end)) continue;
  const f = path.join(OUT, 'vo', l.id + '.wav');
  if (!fs.existsSync(f)) { console.warn('missing voice line', l.id); continue; }
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 2 ** 30 });
  const x = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
  let e = 0, n = 0; for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 0.02) { e += x[i] * x[i]; n++; }
  const rms = n ? Math.sqrt(e / n) : 0.1;
  voice.addMono(x, l.t, 0.11 / rms / Math.SQRT2, 0);
}
const voiceRoom = reverb(voice, { room: 0.35, damp: 0.6 });

// YOUR OWN MUSIC: an audio file in my-music/ replaces the synthesized kui (looped from the start of the film)
const own = bus();
const mmDir = path.join(__dirname, 'my-music');
const mmFile = fs.existsSync(mmDir) ? fs.readdirSync(mmDir).filter((f) => /\.(mp3|wav|m4a|ogg|flac|aac|opus)$/i.test(f)).sort()[0] : null;
if (mmFile) {
  const src = MIX.loadAudio(path.join(mmDir, mmFile)), X = Math.round(2.5 * SR);
  let p = 0; for (let i = 0; i < src.n; i++) p = Math.max(p, Math.abs(src.L[i]), Math.abs(src.R[i]));
  const gg = p > 0 ? 0.6 / p : 1, hop = Math.max(X * 2, src.n - X), off0 = Math.round(OFF * SR);
  for (let o = Math.round(0.6 * SR); o < off0 + N; o += hop) for (let i = 0; i < src.n; i++) {
    const j = o + i - off0; if (j < 0 || j >= N) continue;
    const w = Math.min(1, i / X, (src.n - i) / X); own.L[j] += src.L[i] * gg * w; own.R[j] += src.R[i] * gg * w;
  }
  for (const b of [dombra, drone, verb]) b.applyGain(() => 0);
}

// the music steps back under the voice, and fully returns in the pauses and under the diagrams
MIX.duck([dombra, drone, drum, verb, own], voice, { depth: 0.55, attack: 0.03, release: 0.6, threshold: 0.015 });
const room = reverb(verb, { room: 0.8, damp: 0.35 });
const vox = MIX.mixdown({ voice, voiceRoom }, { voice: 2.3, voiceRoom: 0.12 });
const bed = MIX.mixdown({ dombra, drone, drum, fx, room, own }, { dombra: 1.7, drone: 3.5, drum: 0.4, fx: 0.6, room: 0.5, own: 2.3 });
MIX.highpass(vox, 60); MIX.highpass(bed, 28);
MIX.master(vox, 1, 0.8); MIX.master(bed, 1, 0.6);   // the same gentle levelling in every chunk
if (C1 >= DURATION) for (const b of [vox, bed]) MIX.fadeOut(b, DURATION - 2.5 - OFF, DURATION - 0.1 - OFF);
const trim = (b) => { const s = new Bus(Math.round((C1 - C0) * SR)), a = Math.round(PAD * SR); for (let i = 0; i < s.n; i++) { s.L[i] = b.L[a + i] || 0; s.R[i] = b.R[a + i] || 0; } return s; };
MIX.writeWav(path.join(CH, `vox_${K}.wav`), trim(vox));
MIX.writeWav(path.join(CH, `bed_${K}.wav`), trim(bed));
console.log(`chunk ${K}: ${C0}–${C1} s`);
