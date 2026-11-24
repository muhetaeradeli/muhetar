// ШЕКСІЗДІК ПЕН МӘҢГІЛІК (16:9, 6 minutes): the single timeline. The narration lines (script.js) and
// their measured lengths (voice-timing.js, written by tools/build_voice.py) lay out every scene; the music and
// the picture both read the result, so replacing a voice line re-times the whole film.
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
  const clock = makeClock({ bpm: 88, offset: 0 });
  const { T, BEAT, BAR } = clock;

  const TARGET = 360; // six minutes

  // per scene: the lead-in before the first line (the chapter card plays here), the tail after the last,
  // and extra holds after a line (music-only moments)
  const PLAN = {
    open: { pre: 5.6, post: 0.8, hold: { o2: 0.3 } },
    steppe: { pre: 2.6, post: 0.8, hold: { d2: 0.5, d6: 0.6 } },
    sky: { pre: 2.6, post: 0.8, hold: { a5: 0.3, a8: 0.3 } },
    eternal: { pre: 2.6, post: 0.8 },
    yurt: { pre: 2.6, post: 0.8, hold: { y6: 0.6 } },
    ornament: { pre: 2.6, post: 0.8, hold: { r9: 0.3 } },
    today: { pre: 2.6, post: 0.8 },
    end: { pre: 1.4, post: 6.6 },
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
      scenes[sc.scene] = { name: sc.scene, title: sc.title, t0, t1: cur, lines: ls };
    }
    return { scenes, lines, total: cur };
  }
  // open the gaps between lines until the film is six minutes long (never tighter than 0.4 s, never looser than 1.1 s)
  const nGaps = SCRIPT.reduce((a, s) => a + s.lines.length - 1, 0);
  let GAP = 0.6, LY = layout(GAP);
  for (let i = 0; i < 6; i++) { GAP = Math.min(1.1, Math.max(0.4, GAP + (TARGET - LY.total) / nGaps)); LY = layout(GAP); }
  const { scenes, lines } = LY;
  const names = SCRIPT.map((s) => s.scene);
  const DURATION = Math.max(Math.ceil(LY.total), 60);
  names.forEach((n, i) => { scenes[n].t1 = i < names.length - 1 ? scenes[names[i + 1]].t0 : DURATION; });
  const S = {}; names.forEach((n) => { S[n] = [scenes[n].t0, scenes[n].t1]; });
  const line = {}; lines.forEach((l) => { line[l.id] = l; });
  const sceneAt = (t) => names.find((n) => t >= S[n][0] && t < S[n][1]) || 'end';

  // subtitles: each line broken into chunks of at most ~58 characters, timed by their share of the line
  const subtitles = [];
  for (const l of lines) {
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
    open: { theme: 'S', feel: 'shertpe', level: 0.5 },
    steppe: { theme: 'A', feel: 'gallop', level: 0.62 },
    sky: { theme: 'S', feel: 'shertpe', level: 0.5 },
    eternal: { theme: 'B', feel: 'shertpe', level: 0.52 },
    yurt: { theme: 'A', feel: 'gallop', level: 0.55 },
    ornament: { theme: 'C', feel: 'tokpe', level: 0.66 },
    today: { theme: 'B', feel: 'gallop', level: 0.6 },
    end: { theme: 'S', feel: 'shertpe', level: 0.55 },
  };

  // ---------- named moments (both the sound and the picture read these) ----------
  const ev = {
    title: 1.2,                          // the title rises over the steppe
    fin: line.e4.end + 1.2,              // the last chord and the end title
  };
  const markers = { title: { t: ev.title, sync: 'av' }, fin: { t: ev.fin, sync: 'av' } };
  names.forEach((n) => { markers[n] = S[n][0]; });

  const SCORE = { FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, names, scenes, lines, line, sceneAt, subtitles, MOOD, ev, markers, gap: GAP };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
