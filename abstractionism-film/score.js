// АБСТРАКЦИОНИЗМ (16:9, 6 minutes): the single timeline. The narration lines (script.js) and their measured
// lengths (voice-timing.js, written by tools/build_voice.py) lay out every scene; the music and the
// picture both read the result, so replacing a voice line re-times the whole film.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT = node ? require('./script.js') : globalThis.SCRIPT;
  const VOT = node ? require('./voice-timing.js') : globalThis.VOT;
  const { m, makeClock } = MU;

  const FPS = 30;
  const FORMAT = '16:9';
  const STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 104, offset: 0 });
  const { T, BEAT, BAR } = clock;
  const TARGET = 360; // six minutes

  // per scene: the lead-in before the first line, the tail after the last, and extra holds after a line
  // (music-only moments: a pan across a painting, the push into the Black Square, the kui "speaking")
  const PLAN = {
    open: { pre: 12.6, post: 1.6 },
    define: { pre: 1.4, post: 1.0 },
    roots: { pre: 3.0, post: 1.0 },
    avant: { pre: 1.4, post: 1.2 },
    birth: { pre: 2.6, post: 1.2 },
    kandinsky: { pre: 3.4, post: 1.2, hold: { kan5: 5.0 } },
    malevich: { pre: 3.4, post: 2.0, hold: { mal4: 3.6 } },
    mondrian: { pre: 3.4, post: 1.2 },
    bauhaus: { pre: 2.4, post: 1.2 },
    newyork: { pre: 2.6, post: 1.6, hold: { ny3: 1.6 } },
    after: { pre: 1.4, post: 1.0 },
    kazakh: { pre: 3.6, post: 1.0, hold: { kz4: 4.4 } },
    look: { pre: 1.6, post: 1.4 },
    today: { pre: 1.2, post: 1.2 },
    end: { pre: 1.8, post: 7.5 },
  };
  const snap = (t) => Math.ceil(t / BEAT - 1e-6) * BEAT; // scenes start on a beat

  function layout(gap) {
    let cur = 0;
    const scenes = {}, lines = [];
    for (const sc of SCRIPT) {
      const P = PLAN[sc.scene];
      const t0 = snap(cur);
      cur = t0 + P.pre;
      const ls = [];
      sc.lines.forEach((l, i) => {
        const dur = VOT[l.id] || Math.max(2, l.say.length / 14);
        const line = { id: l.id, text: l.text, scene: sc.scene, t: cur, end: cur + dur, dur };
        ls.push(line); lines.push(line);
        cur += dur + ((P.hold && P.hold[l.id]) || 0) + (i < sc.lines.length - 1 ? gap : 0);
      });
      cur += P.post;
      scenes[sc.scene] = { name: sc.scene, t0, t1: cur, lines: ls };
    }
    const names = SCRIPT.map((s) => s.scene);
    names.forEach((n, i) => { if (i < names.length - 1) scenes[n].t1 = snap(scenes[n].t1); });
    return { scenes, lines, total: cur, names };
  }
  // open the gaps between lines until the film is six minutes long (never tighter than 0.4 s)
  const nGaps = SCRIPT.reduce((a, s) => a + s.lines.length - 1, 0);
  let gap = 0.55, L = layout(gap);
  for (let i = 0; i < 6; i++) { gap = Math.max(0.4, gap + (TARGET - 1.0 - L.total) / nGaps); L = layout(gap); }
  const DURATION = Math.max(TARGET, Math.ceil(L.total));
  L.scenes.end.t1 = DURATION;
  const names = L.names;
  names.forEach((n, i) => { if (i < names.length - 1) L.scenes[n].t1 = L.scenes[names[i + 1]].t0; });
  const S = {}; names.forEach((n) => { S[n] = [L.scenes[n].t0, L.scenes[n].t1]; });
  const line = {}; L.lines.forEach((l) => { line[l.id] = l; });
  const sceneAt = (t) => names.find((n) => t >= S[n][0] && t < S[n][1]) || 'end';

  // subtitles: each line broken into chunks of at most ~58 characters, timed by their share of the line
  const subtitles = [];
  for (const l of L.lines) {
    const words = l.text.split(' '), chunks = [];
    let c = '';
    for (const w of words) { if (c && (c + ' ' + w).length > 58) { chunks.push(c); c = w; } else c = c ? c + ' ' + w : w; }
    if (c) chunks.push(c);
    if (chunks.length > 1 && chunks[chunks.length - 1].length < 12) { const last = chunks.pop(); chunks[chunks.length - 1] += ' ' + last; }
    const total = chunks.reduce((a, x) => a + x.length, 0);
    let t = l.t;
    chunks.forEach((x, i) => { const d = l.dur * x.length / total; subtitles.push({ t, end: i === chunks.length - 1 ? l.end + 0.35 : t + d, text: x }); t += d; });
  }

  // ---------- the music plan: one mood per scene (song.js turns these into a dombra kui) ----------
  //   theme: which melody · feel: 'shertpe' (plucked, lyrical) | 'gallop' | 'tokpe' (full strumming) · level 0..1
  const MOOD = {
    open: { theme: 'S', feel: 'shertpe', level: 0.55 },
    define: { theme: 'A', feel: 'gallop', level: 0.6 },
    roots: { theme: 'A', feel: 'gallop', level: 0.65 },
    avant: { theme: 'B', feel: 'tokpe', level: 0.75 },
    birth: { theme: 'S', feel: 'shertpe', level: 0.6 },
    kandinsky: { theme: 'B', feel: 'tokpe', level: 0.8 },
    malevich: { theme: 'S', feel: 'shertpe', level: 0.45 },
    mondrian: { theme: 'A', feel: 'gallop', level: 0.7 },
    bauhaus: { theme: 'B', feel: 'gallop', level: 0.7 },
    newyork: { theme: 'C', feel: 'tokpe', level: 0.9 },
    after: { theme: 'A', feel: 'gallop', level: 0.65 },
    kazakh: { theme: 'C', feel: 'tokpe', level: 1.0 },
    look: { theme: 'S', feel: 'shertpe', level: 0.55 },
    today: { theme: 'B', feel: 'tokpe', level: 0.8 },
    end: { theme: 'A', feel: 'gallop', level: 0.75 },
  };

  // ---------- named moments (both the sound and the picture read these) ----------
  const ev = {
    point: 1.0, lineDraw: 4.2, colour: 7.4, title: snap(10.4),
    k7hold: line.kan5.end + 0.3,               // the music takes over while the camera crosses Composition VII
    square: line.mal4.end + 0.5,               // the cut to the Black Square
    pollock: line.ny3.t,
    rothko: line.ny4.t - 0.6,
    kui: line.kz4.end + 0.2,                   // the kui speaks
    thanks: line.end2.t,
    shapes: [0, 1, 2].map((i) => line.mal2.t + 0.5 + i * 1.3), // square, circle, cross
    mondrianLines: [0, 1, 2, 3, 4, 5].map((i) => S.mondrian[0] + 0.4 + i * 0.45),
  };
  const markers = {
    title: { t: ev.title, sync: 'av' },
    square: { t: ev.square, sync: 'av' },
    kandinsky: S.kandinsky[0], malevich: S.malevich[0], mondrian: S.mondrian[0], bauhaus: S.bauhaus[0],
    newyork: S.newyork[0], kazakh: S.kazakh[0], look: S.look[0], end: S.end[0],
  };

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, names, scenes: L.scenes, lines: L.lines, line, sceneAt, subtitles, MOOD, ev, markers, gap };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
