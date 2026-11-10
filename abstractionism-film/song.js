// THE SOUNDTRACK: an original kui for a synthesized two-string dombra (tuned D–G), plus the narration.
//   node song.js      (STEMS=1 writes stems, LUFS=-14 sets the loudness)
// Every scene has a mood in score.js: 'shertpe' (plucked, lyrical), 'gallop' (the horse-step strum) or
// 'tokpe' (full strumming). The melody sits on the upper string and the lower string drones, as on a real
// dombra. The music ducks under the voice and comes forward in the pauses.
const path = require('path');
const fs = require('fs');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { BEAT, DURATION, S, ev, MOOD, names, line } = sc;

const N = Math.ceil(DURATION * SR);
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
// the lower string under a melody note: the open D where it is consonant, else a fretted note
const under = (off) => { const pc = ((off % 12) + 12) % 12; return pc === 5 ? 53 : pc === 8 ? 51 : D3; };
// one stroke across both strings. down = low string first; up strokes are lighter and brighter
function stroke(t, off, { down = true, gain = 1, dur = 0.3, both = true } = {}) {
  const hi = G3 + off, lo = under(off), seed = 1 + (Math.round(t * 1000) % 5);
  const spread = 0.011;
  const a = string(hi, dur, down ? 0.5 : 0.62, seed), b = string(lo, dur, down ? 0.42 : 0.55, seed + 9);
  dombra.addMono(a, t + (down ? spread : 0), gain * 0.5, 0.12);
  if (both) dombra.addMono(b, t + (down ? 0 : spread), gain * 0.36, -0.12);
  verb.addMono(a, t, gain * 0.1);
  if (down && gain > 0.75) dombra.addMono(tick, t, 0.05 * gain, 0);
}

// the themes: semitones above G3 on the upper string, one per beat, 16 beats (null = let it ring)
const THEME = {
  S: [0, null, 3, 2, 0, null, -2, 0, 3, null, 5, 7, 5, 3, 2, null, 7, null, 8, 7, 5, null, 3, 5, 3, 2, 0, -2, 0, null, null, null],
  A: [0, 0, 3, 2, 0, 0, 7, 5, 3, 3, 5, 3, 2, 2, 0, 0, 0, 0, 3, 5, 7, 7, 10, 8, 7, 5, 3, 2, 0, 0, 0, 0],
  B: [5, 5, 7, 8, 7, 5, 3, 5, 7, 7, 10, 12, 10, 8, 7, 7, 12, 12, 10, 8, 7, 8, 10, 7, 5, 3, 2, 3, 0, 0, 0, 0],
  C: [12, 12, 14, 15, 14, 12, 10, 12, 15, 15, 14, 12, 10, 12, 14, 12, 12, 10, 8, 7, 8, 10, 12, 10, 7, 5, 3, 2, 0, 0, 7, 0],
};
const quiet = (t) => (t < ev.title) || (t > ev.square - 1.2 && t < ev.square + 5.5) || t > line.end2.end + 1.2;

for (const n of names) {
  const [t0, t1] = S[n], mood = MOOD[n], th = THEME[mood.theme];
  const beats = Math.round((t1 - t0) / BEAT);
  let last = 0;
  for (let b = 0; b < beats; b++) {
    const t = t0 + b * BEAT;
    if (quiet(t)) continue;
    const off = th[b % th.length];
    const g = mood.level * (b % 4 === 0 ? 1 : b % 2 === 0 ? 0.9 : 0.8);
    const s = BEAT / 4;
    if (mood.feel === 'shertpe') {
      if (off === null) continue;
      stroke(t, off, { gain: g * 1.1, dur: 0.9 });
      if (b % 4 === 2) stroke(t + 2 * s, off, { down: false, gain: g * 0.55, dur: 0.5, both: false });
    } else if (mood.feel === 'gallop') {
      const o = off ?? last;
      stroke(t, o, { gain: g, dur: 0.32 });
      stroke(t + 2 * s, o, { gain: g * 0.7, dur: 0.2 });
      stroke(t + 3 * s, o, { down: false, gain: g * 0.55, dur: 0.2 });
    } else {
      const o = off ?? last, nx = th[(b + 1) % th.length] ?? o;
      stroke(t, o, { gain: g, dur: 0.26 });
      stroke(t + s, o, { down: false, gain: g * 0.5, dur: 0.16 });
      stroke(t + 2 * s, o, { gain: g * 0.72, dur: 0.2 });
      // a passing tone into the next beat on the last up-stroke, every other beat
      stroke(t + 3 * s, b % 2 ? Math.round((o + nx) / 2) : o, { down: false, gain: g * 0.5, dur: 0.16 });
    }
    if (off !== null) last = off;
  }
  // the low drone under the scene, and a frame-drum beat where the scene begins
  if (t0 >= ev.title) {
    for (const [midi, gn] of [[31, 1], [38, 0.7], [43, 0.4]]) { const { L, R } = I.strings(midi, t1 - t0 - 0.4, { attack: 1.6, release: 1.4, bright: 0.5, seed: midi }); drone.addStereo(L, R, t0, 0.05 * gn * (0.5 + mood.level)); }
    if (n !== 'define') { drum.addMono(I.timpani(38, { decay: 0.9 }), t0, 0.32); drum.addMono(I.tom(70, 0.4), t0, 0.3); }
  }
}

// ---------- the cold open: a point, a line, a colour, then the title ----------
const ring = (t, off, gain, dur = 2.2) => { const a = string(G3 + off, dur, 0.5, 2); dombra.addMono(a, t, gain, 0); verb.addMono(a, t, gain * 0.5); };
ring(ev.point, 0, 0.5);
ring(ev.lineDraw, 7, 0.5); ring(ev.lineDraw + 0.5, 5, 0.3, 1.6);
[0, 3, 7, 12].forEach((o, i) => ring(ev.colour + i * 0.16, o, 0.42));
{ const { L, R } = I.strings(31, ev.title - 0.5, { attack: 4, release: 0.6, bright: 0.45, seed: 3 }); drone.addStereo(L, R, 0.4, 0.07); }
fx.addMono(I.noiseSweep(1.6, 300, 5000, { q: 0.8 }), ev.title - 1.6, 0.05);
drum.addMono(I.timpani(31, { decay: 1.6 }), ev.title, 0.7);
drum.addMono(I.tom(60, 0.5), ev.title, 0.5);
[0, 7, 12].forEach((o) => stroke(ev.title, o, { gain: 1.15, dur: 1.4 }));

// ---------- the Black Square: silence, then one deep note ----------
fx.addMono(I.subBoom(3.2, 58, 26), ev.square, 0.8);
drum.addMono(I.timpani(26, { decay: 2.2 }), ev.square, 0.6);
ring(ev.square + 2.4, -5, 0.4, 3);
ring(ev.square + 4.2, 0, 0.3, 3);

// ---------- Malevich's three shapes, each on its own pluck; Mondrian's lines, each a tick ----------
ev.shapes.forEach((t, i) => { ring(t, [0, 7, 12][i], 0.36, 1.2); });
ev.mondrianLines.forEach((t, i) => fx.addMono(I.woodTick(1 + i * 0.12), t, 0.3, i % 2 ? 0.3 : -0.3));

// ---------- the last chord ----------
const fin = line.end2.end + 1.4;
[0, 7, 12].forEach((o, i) => stroke(fin + i * 0.02, o, { gain: 1.1, dur: 3.5 }));
drum.addMono(I.timpani(31, { decay: 2 }), fin, 0.45);

// ---------- the narration ----------
for (const l of sc.lines) {
  const f = path.join(__dirname, 'out', 'vo', l.id + '.wav');
  if (!fs.existsSync(f)) { console.warn('missing voice line', l.id, '(run: python3 tools/build_voice.py)'); continue; }
  MIX.loadAudio(f, { at: l.t, length: DURATION }).mixInto(voice, 1);
}
// bring every line to the same level, so no sentence sinks under the music
{ let p = 0; for (let i = 0; i < N; i++) p = Math.max(p, Math.abs(voice.L[i])); if (p > 0) voice.applyGain(() => 0.5 / p); }
const voiceRoom = reverb(voice, { room: 0.35, damp: 0.6 });

// YOUR OWN MUSIC: an audio file in my-music/ (for example a recording of the kui «Адай») replaces the
// synthesized kui. It loops to the length of the film, dips for the Black Square and ducks under the voice.
const own = bus();
const mmDir = path.join(__dirname, 'my-music');
const mmFile = fs.existsSync(mmDir) ? fs.readdirSync(mmDir).filter((f) => /\.(mp3|wav|m4a|ogg|flac|aac|opus)$/i.test(f)).sort()[0] : null;
if (mmFile) {
  const src = MIX.loadAudio(path.join(mmDir, mmFile)), X = Math.round(2.5 * SR), start = Math.round(0.6 * SR);
  let p = 0; for (let i = 0; i < src.n; i++) p = Math.max(p, Math.abs(src.L[i]), Math.abs(src.R[i]));
  const g = p > 0 ? 0.6 / p : 1, hop = Math.max(X * 2, src.n - X);
  for (let o = start; o < N; o += hop) for (let i = 0; i < src.n && o + i < N; i++) {
    const w = Math.min(1, i / X, (src.n - i) / X); own.L[o + i] += src.L[i] * g * w; own.R[o + i] += src.R[i] * g * w;
  }
  own.applyGain((t) => { const d = Math.min(Math.max((ev.square - t) / 1.2, 0), 1), u = Math.min(Math.max((t - ev.square - 4.5) / 2, 0), 1); return Math.max(0.12, t < ev.square ? d : u) * Math.min(1, t / 2); });
  for (const b of [dombra, drone, verb]) b.applyGain(() => 0);
  console.log('music: my-music/' + mmFile);
}

// the music steps back under the voice, and fully returns in the music-only holds
const music = [dombra, drone, drum, verb, own];
MIX.duck(music, voice, { depth: 0.55, attack: 0.03, release: 0.6, threshold: 0.015 });
const room = reverb(verb, { room: 0.8, damp: 0.35 });

const stems = { dombra, drone, drum, fx, voice, voiceRoom, room, own };
const GAIN = { dombra: 1.7, drone: 3.5, drum: 0.9, fx: 1, voice: 2.3, voiceRoom: 0.12, room: 0.5, own: 1.0 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 2.5, DURATION - 0.1);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS`);
