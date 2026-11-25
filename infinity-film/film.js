// THE FILM: one continuous list of shots (film-run.js) under a cinema finish: 2.35:1 letterbox, a vignette,
// gate weave and a breathing light, film grain and the subtitles in the lower bar. The film opens from black and closes to black.
(function () {
  const G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE, Studio = globalThis.Studio;
  const W = G.W, H = G.H;
  Studio.film({
    fadeOut: 2.2,
    post: { paper: 0, vignette: 0, grain: 0 },
    async init() { await K.load(); },
    draw(ctx, t) {
      // a projected film: the frame weaves a fraction of a pixel in the gate, and the light breathes a little
      const wx = Math.sin(t * 7.3) * 0.5 + Math.sin(t * 13.1) * 0.3, wy = Math.sin(t * 5.7 + 1) * 0.4 + Math.sin(t * 17.9) * 0.2;
      ctx.save(); ctx.beginPath(); ctx.rect(0, K.BAR, W, H - 2 * K.BAR); ctx.clip(); ctx.translate(wx, wy); globalThis.RUN(ctx, t);
      const fl = 0.018 * (Math.sin(t * 23.7) * 0.6 + Math.sin(t * 41.3) * 0.4);
      ctx.fillStyle = fl > 0 ? `rgba(0,0,0,${fl})` : `rgba(255,236,200,${-fl * 0.6})`; ctx.fillRect(-4, 0, W + 8, H);
      ctx.restore();
      if (t < 0.8) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.8})`; ctx.fillRect(0, 0, W, H); }
      K.finish(ctx, t, SC.subtitles, { vignette: 0.5, grainA: 0.07 });
    },
  });
})();
