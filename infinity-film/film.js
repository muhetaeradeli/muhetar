// THE FILM: one continuous list of shots (film-run.js) under a cinema finish: 2.35:1 letterbox, a vignette,
// light film grain and the subtitles in the lower bar. The film opens from black and closes to black.
(function () {
  const G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE, Studio = globalThis.Studio;
  const W = G.W, H = G.H;
  Studio.film({
    fadeOut: 2.2,
    post: { paper: 0, vignette: 0, grain: 0 },
    async init() { await K.load(); },
    draw(ctx, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, K.BAR, W, H - 2 * K.BAR); ctx.clip(); globalThis.RUN(ctx, t); ctx.restore();
      if (t < 0.8) { ctx.fillStyle = `rgba(0,0,0,${1 - t / 0.8})`; ctx.fillRect(0, 0, W, H); }
      K.finish(ctx, t, SC.subtitles, { vignette: 0.42, grainA: 0.05 });
    },
  });
})();
