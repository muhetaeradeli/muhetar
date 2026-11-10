// THE FILM: fifteen scenes cut on the score's timeline, finished like cinema: 2.35:1 letterbox,
// dissolves and dips to black between chapters, a vignette, film grain, subtitles in the lower bar.
(function () {
  const G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE, Studio = globalThis.Studio, SCENES = globalThis.SCENES;
  const { S, names, ev } = SC;
  const W = G.W, H = G.H;
  // how each scene arrives: 'dip' = through black, 'fade' = a dissolve, 'cut'
  const IN = { define: 'dip', roots: 'dip', avant: 'cut', birth: 'dip', kandinsky: 'dip', malevich: 'dip', mondrian: 'dip', bauhaus: 'fade', newyork: 'dip', after: 'fade', kazakh: 'dip', look: 'dip', today: 'cut', end: 'dip' };
  const DIP = 0.45;
  Studio.film({
    fadeOut: 2.2,
    post: { paper: 0, vignette: 0, grain: 0 },
    async init() { await K.load(); },
    draw(ctx, t) {
      const n = SC.sceneAt(t), i = names.indexOf(n), [t0, t1] = S[n];
      const draw = (name) => { ctx.save(); ctx.beginPath(); ctx.rect(0, K.BAR, W, H - 2 * K.BAR); ctx.clip(); (SCENES[name] || (() => {}))(ctx, t); ctx.restore(); };
      const how = IN[n];
      if (how === 'fade' && t < t0 + 0.9 && i > 0) {
        draw(names[i - 1]);
        const b = K.buf(), x = b.getContext('2d'); (SCENES[n] || (() => {}))(x, t);
        ctx.save(); ctx.globalAlpha = K.io(t, t0, t0 + 0.9); ctx.drawImage(b, 0, 0, W, H); ctx.restore();
      } else draw(n);
      // dips to black around the chapter cuts
      let dark = 0;
      if (how === 'dip') dark = Math.max(dark, 1 - K.u(t, t0, t0 + DIP));
      const next = names[i + 1];
      if (next && IN[next] === 'dip') dark = Math.max(dark, K.u(t, t1 - DIP, t1));
      if (t < 0.8) dark = Math.max(dark, 1 - t / 0.8);
      if (dark > 0) { ctx.fillStyle = `rgba(0,0,0,${dark})`; ctx.fillRect(0, 0, W, H); }
      K.finish(ctx, t, SC.subtitles, { vignette: n === 'define' || n === 'mondrian' ? 0.3 : 0.5 });
      void ev;
    },
  });
})();
