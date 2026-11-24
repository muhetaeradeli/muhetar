// ШЕКСІЗДІК ПЕН МӘҢГІЛІК — the whole text (16:9, as long as the text takes): the single timeline.
// Every sentence of the text is one narration line (script.js); its measured length (voice-timing.js, written
// by tools/build_voice.py — from the synthetic voice or from a recording in my-voice/) lays out the film, so a
// classmate's recording re-times the whole picture and the music automatically.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const SCRIPT_ALL = node ? require('./script.js') : globalThis.SCRIPT;
  const VOT = node ? require('./voice-timing.js') : globalThis.VOT;
  const CUT = node ? require('./cut.js') : globalThis.CUT;
  // the cut keeps only its sentences (and drops the figures); a chapter with none of them is left out
  const KEEP = CUT && new Set(CUT.keep);
  const SCRIPT = !KEEP ? SCRIPT_ALL : SCRIPT_ALL.map((sc) => ({ ...sc, lines: sc.lines.filter((l) => l.kind !== 'figure' && KEEP.has(l.id)) })).filter((sc) => sc.lines.length);
  const { m, makeClock } = MU;

  const FPS = 25;
  const FORMAT = '16:9';
  const STYLE = 'flat';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 88, offset: 0 });
  const { T, BEAT, BAR } = clock;

  // lead-in before a chapter's first line and the tail after its last, by kind of chapter
  const PLAN = { title: { pre: 4.6, post: 1.2 }, part: { pre: 1.6, post: 0.8 }, sub: { pre: 0.9, post: 0.5 }, flow: { pre: 0.25, post: 0.35 } };
  const GAP = 0.55;          // between two sentences
  const AFTER_HEAD = 0.45;   // a little more after a heading is read
  const FIG_HOLD = 16;       // a diagram (Сызба 4, 5) builds itself to music, without narration
  const END_CARD = 10;
  const snap = (t) => Math.ceil(t / BEAT - 1e-6) * BEAT; // chapters start on a beat

  let cur = 0;
  const scenes = {}, lines = [], figs = [];
  for (const sc of SCRIPT) {
    const P = sc.lines[0].kind === 'heading' || sc.lines[0].kind === 'title' ? PLAN[sc.kind] || PLAN.sub : PLAN.flow;
    const t0 = snap(cur);
    cur = t0 + P.pre;
    const ls = [];
    sc.lines.forEach((l, i) => {
      if (l.kind === 'figure') { figs.push({ n: l.figure, t: cur, end: cur + FIG_HOLD, scene: sc.scene }); cur += FIG_HOLD + GAP; return; }
      const dur = VOT[l.id] || Math.max(2, (l.say || l.text).length / 14);
      const line = { id: l.id, kind: l.kind, text: l.text, scene: sc.scene, t: cur, end: cur + dur, dur };
      ls.push(line); lines.push(line);
      cur += dur + (i < sc.lines.length - 1 ? GAP + (l.kind === 'heading' || l.kind === 'title' || l.kind === 'caption' ? AFTER_HEAD : 0) : 0);
    });
    cur += P.post;
    scenes[sc.scene] = { name: sc.scene, title: sc.title, kind: sc.kind, part: sc.part, t0, t1: cur, lines: ls };
  }
  const names = SCRIPT.map((s) => s.scene);
  const DURATION = Math.ceil(cur + END_CARD);
  names.forEach((n, i) => { scenes[n].t1 = i < names.length - 1 ? scenes[names[i + 1]].t0 : DURATION; });
  const S = {}; names.forEach((n) => { S[n] = [scenes[n].t0, scenes[n].t1]; });
  const line = {}; lines.forEach((l) => { line[l.id] = l; });
  const sceneAt = (t) => names.find((n) => t >= S[n][0] && t < S[n][1]) || names[names.length - 1];

  // subtitles: each line broken into chunks of at most ~62 characters, timed by their share of the line
  const subtitles = [];
  for (const l of lines) {
    const words = l.text.split(' '), chunks = [];
    let c = '';
    for (const w of words) { if (c && (c + ' ' + w).length > 62) { chunks.push(c); c = w; } else c = c ? c + ' ' + w : w; }
    if (c) chunks.push(c);
    if (chunks.length > 1 && chunks[chunks.length - 1].length < 14) { const last = chunks.pop(); chunks[chunks.length - 1] += ' ' + last; }
    const total = chunks.reduce((a, x) => a + x.length, 0);
    let t = l.t;
    chunks.forEach((x, i) => { const d = l.dur * x.length / total; subtitles.push({ t, end: i === chunks.length - 1 ? l.end + 0.35 : t + d, text: x }); t += d; });
  }

  // ---------- the music: a calm dombra under the narration, one mood per chapter ----------
  //   theme: which melody · feel: 'shertpe' (plucked, lyrical) | 'gallop' · level 0..1
  const THEMES = ['S', 'A', 'B', 'S', 'C', 'A'];
  const MOOD = {};
  names.forEach((n, i) => {
    const k = scenes[n].kind;
    MOOD[n] = k === 'title' || k === 'part' ? { theme: 'S', feel: 'shertpe', level: 0.5 } : { theme: THEMES[i % THEMES.length], feel: i % 3 === 1 ? 'gallop' : 'shertpe', level: 0.46 };
  });

  // ---------- named moments ----------
  const ev = { title: 1.2, fin: lines[lines.length - 1].end + 1.6 };
  const markers = { title: { t: ev.title, sync: 'av' }, fin: { t: ev.fin, sync: 'av' } };
  names.forEach((n) => { markers[n] = S[n][0]; });

  const SCORE = { CUT: CUT ? CUT.name : null, FPS, FORMAT, STYLE, W, H, SAFE, DURATION, clock, T, BEAT, BAR, S, m, names, scenes, lines, line, figs, sceneAt, subtitles, MOOD, ev, markers, gap: GAP, FIG_HOLD };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
