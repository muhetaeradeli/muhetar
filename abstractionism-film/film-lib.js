// CINEMA TOOLKIT: the camera, light, lenses and type shared by every scene. Everything is a pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H;
  const BAR = Math.round((H - W / 2.35) / 2);       // 2.35:1 letterbox
  const VIEW = { x: 0, y: BAR, w: W, h: H - 2 * BAR, cx: W / 2, cy: H / 2 };
  const C = { ink: '#141414', cream: '#F3EBDD', red: '#D8352A', yellow: '#E8B434', blue: '#1F4FB5', navy: '#0B1D4D', night: '#070B1C', gold: '#E2B659', felt: '#7A1F1B' };
  const K = {};
  K.BAR = BAR; K.VIEW = VIEW; K.C = C; K.IMG = {};
  const SANS = 'Inter, "DejaVu Sans", sans-serif', SERIF = '"DejaVu Serif", Georgia, serif';
  K.SANS = SANS; K.SERIF = SERIF;

  const IMAGES = ['kandinsky7', 'kandinsky8', 'circles', 'firstabs', 'blacksquare', 'suprem', 'mondrian', 'klint7', 'altar', 'monet', 'cezanne', 'klee', 'senecio', 'doesburg', 'expo010'];
  K.load = async () => { await Promise.all(IMAGES.map(async (n) => { K.IMG[n] = await Studio.loadImage(`assets/${n}.jpg`); })); };

  // ---------- time ----------
  K.u = (t, a, b) => clamp((t - a) / Math.max(1e-6, b - a));
  K.io = (t, a, b) => ease.inOutCubic(K.u(t, a, b));
  K.out = (t, a, b) => ease.outCubic(K.u(t, a, b));
  // fade in at a, out at b
  K.win = (t, a, b, fi = 0.5, fo = 0.5) => Math.min(K.u(t, a, a + fi), 1 - K.u(t, b - fo, b));

  // ---------- camera: zoom / pan / roll around the centre of the picture ----------
  K.cam = (ctx, { x = 0, y = 0, zoom = 1, rot = 0 } = {}, fn) => {
    ctx.save();
    ctx.translate(VIEW.cx, VIEW.cy); ctx.scale(zoom, zoom); ctx.rotate(rot); ctx.translate(-VIEW.cx - x, -VIEW.cy - y);
    fn(); ctx.restore();
  };
  // a slow breathing drift, as from a hand-held or a long lens
  K.drift = (t, amp = 5, seed = 1) => ({ x: U.noise1(t * 0.35, seed) * amp, y: U.noise1(t * 0.3, seed + 7) * amp, rot: U.noise1(t * 0.22, seed + 13) * 0.0025 });
  // a layer drawn out of focus (rack focus: animate px)
  K.blur = (ctx, px, fn) => { ctx.save(); if (px > 0.3) ctx.filter = `blur(${(px * (G.scale || 1)).toFixed(2)}px)`; fn(); ctx.restore(); };

  // ---------- shapes ----------
  K.rect = (ctx, x, y, w, h, fill, a = 1) => { ctx.globalAlpha *= a; ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.globalAlpha /= a || 1; };
  K.circle = (ctx, x, y, r, fill, stroke, lw = 4) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
  K.poly = (ctx, pts, fill, stroke, lw = 4) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); } };
  K.line = (ctx, x0, y0, x1, y1, color, lw = 4, u = 1) => { if (u <= 0) return; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, u), lerp(y0, y1, u)); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke(); };
  K.rot = (ctx, x, y, a, fn) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); fn(); ctx.restore(); };
  K.alpha = (ctx, a, fn) => { if (a <= 0.003) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); };
  K.grad = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, c]) => g.addColorStop(p, c)); return g; };
  K.radial = (ctx, x, y, r0, r1, stops) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([p, c]) => g.addColorStop(p, c)); return g; };
  K.glow = (ctx, x, y, r, color, a = 1) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a; ctx.fillStyle = K.radial(ctx, x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); };

  // ---------- type ----------
  K.text = (ctx, str, x, y, { size = 40, weight = 700, color = '#fff', align = 'center', fam = SANS, spacing = 0, alpha = 1, italic = false, shadow = 0, base = 'middle' } = {}) => {
    if (alpha <= 0.003) return 0;
    ctx.save();
    ctx.globalAlpha *= clamp(alpha);
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${fam}`;
    ctx.letterSpacing = `${spacing}px`;
    ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color;
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = shadow; ctx.shadowOffsetY = 2; }
    ctx.fillText(str, x + (align === 'center' ? spacing / 2 : 0), y);
    const w = ctx.measureText(str).width;
    ctx.restore();
    return w;
  };
  // a title that tracks in: letters settle from wide to normal spacing while fading up
  K.track = (ctx, str, x, y, t, t0, o = {}) => { const u = K.out(t, t0, t0 + (o.dur || 2.2)); K.text(ctx, str, x, y - (1 - u) * 10, { ...o, spacing: (o.spacing || 0) + (1 - u) * (o.wide || 26), alpha: (o.alpha ?? 1) * K.u(t, t0, t0 + 0.9) }); };
  // a museum label, lower left: title on top, artist and year beneath, with a rule that draws on
  K.label = (ctx, t, t0, t1, title, sub, { x = 110, y = VIEW.y + VIEW.h - 108, right = false } = {}) => {
    const a = K.win(t, t0, t1, 0.7, 0.5); if (a <= 0) return;
    const X = right ? W - x : x, al = right ? 'right' : 'left', u = K.out(t, t0, t0 + 0.9);
    K.alpha(ctx, a, () => {
      K.rect(ctx, right ? X - 5 : X, y - 24, 5, 78 * u, C.gold);
      K.text(ctx, title, X + (right ? -24 : 24), y, { size: 34, weight: 700, align: al, shadow: 14 });
      K.text(ctx, sub, X + (right ? -24 : 24), y + 40, { size: 25, weight: 400, align: al, color: 'rgba(255,255,255,0.82)', shadow: 12 });
    });
  };
  // a chapter card over the picture: a small numeral, the name, a hairline
  K.chapter = (ctx, t, t0, num, name, sub, { dur = 3.2, y = VIEW.cy, x = VIEW.cx, color = '#fff' } = {}) => {
    const a = K.win(t, t0, t0 + dur, 0.6, 0.7); if (a <= 0) return;
    K.alpha(ctx, a, () => {
      K.text(ctx, num, x, y - 92, { size: 26, weight: 700, color: C.gold, spacing: 10, shadow: 12 });
      K.track(ctx, name, x, y - 22, t, t0, { size: 88, weight: 800, spacing: 4, wide: 30, color, shadow: 24 });
      const u = K.out(t, t0 + 0.2, t0 + 1.6);
      K.rect(ctx, x - 170 * u, y + 44, 340 * u, 3, C.gold);
      if (sub) K.text(ctx, sub, x, y + 84, { size: 30, weight: 400, color, alpha: K.u(t, t0 + 0.6, t0 + 1.4), spacing: 3, shadow: 12 });
    });
  };

  // ---------- pictures ----------
  // Ken Burns inside a box: from/to = { zoom, x, y } (x, y = the point of the image at the box centre, 0..1)
  K.pan = (ctx, img, box, t, t0, t1, from, to, e = ease.inOutQuad) => G.kenBurns(ctx, img, box.x, box.y, box.w, box.h, t, t0, t1, { from, to, ease: e });
  // a painting hung on a dark gallery wall: spotlight, gilded frame, soft shadow. h = picture height
  K.wall = (ctx, t, tone = '#1A1512') => {
    ctx.fillStyle = tone; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = K.radial(ctx, VIEW.cx, VIEW.y + 60, 60, 1250, [[0, 'rgba(255,226,180,0.30)'], [0.55, 'rgba(255,214,160,0.07)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = K.grad(ctx, 0, VIEW.y + VIEW.h - 150, 0, VIEW.y + VIEW.h, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.5)']]); ctx.fillRect(0, VIEW.y + VIEW.h - 150, W, 150);
  };
  K.framed = (ctx, img, cx, cy, h, { frame = 16, color = '#B58D4A', mat = 0, crop = null } = {}) => {
    if (!img || !img.width) return { x: cx, y: cy, w: 0, h: 0 };
    const sw = crop ? crop.w : img.width, sh = crop ? crop.h : img.height;
    const w = h * sw / sh, x = cx - w / 2, y = cy - h / 2, f = frame + mat;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
    ctx.fillStyle = color; ctx.fillRect(x - f, y - f, w + 2 * f, h + 2 * f);
    ctx.restore();
    if (frame) { ctx.fillStyle = K.grad(ctx, x - f, y - f, x + w + f, y + h + f, [[0, 'rgba(255,240,200,0.45)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.35)']]); ctx.fillRect(x - f, y - f, w + 2 * f, h + 2 * f); }
    if (mat) { ctx.fillStyle = '#EFE9DC'; ctx.fillRect(x - mat, y - mat, w + 2 * mat, h + 2 * mat); }
    if (crop) ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, x, y, w, h); else ctx.drawImage(img, x, y, w, h);
    return { x, y, w, h };
  };
  // faint drafting grid on paper (the look of the original film)
  K.paper = (ctx, color = C.cream, grid = 'rgba(120,96,60,0.10)') => {
    ctx.fillStyle = color; ctx.fillRect(-400, -400, W + 800, H + 800);
    ctx.strokeStyle = grid; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = -400; x < W + 400; x += 60) { ctx.moveTo(x, -400); ctx.lineTo(x, H + 400); }
    for (let y = -400; y < H + 400; y += 60) { ctx.moveTo(-400, y); ctx.lineTo(W + 400, y); }
    ctx.stroke();
  };

  // ---------- Kazakh motifs ----------
  // the shanyrak: the crown of the yurt, a ring crossed by a curved lattice, with short rays
  K.shanyrak = (ctx, x, y, r, color = C.gold, lw = 5, spin = 0, rays = true) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
    for (const k of [0.33, 0.7]) { ctx.beginPath(); ctx.ellipse(0, 0, r * k, r, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, r, r * k, 0, 0, 7); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
    ctx.restore();
    if (rays) for (let i = 0; i < 44; i++) { const a = i / 44 * 6.2832; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 1.03, Math.sin(a) * r * 1.03); ctx.lineTo(Math.cos(a) * r * 1.13, Math.sin(a) * r * 1.13); ctx.stroke(); }
    ctx.restore();
  };
  // қошқар мүйіз (the ram's horns): two mirrored spirals rising from a stem. u = how much is drawn (0..1)
  K.horns = (ctx, x, y, s, color, lw = 10, u = 1) => {
    if (u <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = color; ctx.lineWidth = lw / s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      const n = Math.max(2, Math.round(90 * u));
      for (let i = 0; i <= n; i++) {
        const p = i / 90;
        let px, py;
        if (p < 0.22) { px = 0.06; py = lerp(1, 0.15, p / 0.22); } // the stem
        else { const q = (p - 0.22) / 0.78, th = q * Math.PI * 2.35, rr = lerp(0.52, 0.07, q); px = 0.06 + (0.52 - Math.cos(th) * rr); py = 0.15 - Math.sin(th) * rr; }
        if (i) ctx.lineTo(side * px, py); else ctx.moveTo(side * px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  };
  // an ornament band: a row of small horns between two rules (the border of a felt carpet)
  K.band = (ctx, y, h, t, { bg = C.navy, fg = C.gold, speed = 14, alpha = 1 } = {}) => {
    K.alpha(ctx, alpha, () => {
      ctx.fillStyle = bg; ctx.fillRect(0, y, W, h);
      K.rect(ctx, 0, y, W, 3, fg); K.rect(ctx, 0, y + h - 3, W, 3, fg);
      const step = h * 1.25, off = (t * speed) % step;
      for (let x = -step + off; x < W + step; x += step) K.horns(ctx, x, y + h * 0.2, h * 0.62, fg, 3.2);
    });
  };
  // a yurt silhouette
  K.yurt = (ctx, x, y, s, wall = '#EFE6D2', roof = '#F7F1E3', trim = '#C2382D') => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(-100, -70); ctx.quadraticCurveTo(-60, -150, 0, -158); ctx.quadraticCurveTo(60, -150, 100, -70); ctx.closePath(); ctx.fill();
    ctx.fillStyle = wall; ctx.fillRect(-100, -70, 200, 70);
    ctx.fillStyle = trim; ctx.fillRect(-100, -74, 200, 12);
    ctx.fillStyle = '#D79A3A'; ctx.fillRect(-16, -50, 32, 50);
    ctx.fillStyle = trim; ctx.fillRect(-20, -54, 40, 5);
    ctx.restore();
  };
  // rolling steppe hills
  K.hills = (ctx, y, amp, color, seed = 1, shift = 0) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-50, H + 50);
    for (let x = -50; x <= W + 50; x += 30) ctx.lineTo(x, y + U.noise1((x + shift) * 0.0016, seed) * amp + U.noise1((x + shift) * 0.005, seed + 3) * amp * 0.25);
    ctx.lineTo(W + 50, H + 50); ctx.closePath(); ctx.fill();
  };

  // a sequence of shots inside a scene, with a dissolve into each: [{ at, draw(ctx, t), fade }]
  K.seq = (ctx, t, shots) => {
    let i = 0; for (let k = 0; k < shots.length; k++) if (t >= shots[k].at) i = k;
    const s = shots[i], f = s.fade ?? 0.8, a = i > 0 && f > 0 ? K.u(t, s.at, s.at + f) : 1;
    if (a < 1) { ctx.save(); shots[i - 1].draw(ctx, t); ctx.restore(); }
    if (a >= 1) { ctx.save(); s.draw(ctx, t); ctx.restore(); }
    else { const c = G.scratch ? null : null; const b = K.buf(); const x = b.getContext('2d'); s.draw(x, t); ctx.save(); ctx.globalAlpha = ease.inOutQuad(a); ctx.drawImage(b, 0, 0, W, H); ctx.restore(); }
  };
  let _buf = null;
  K.buf = () => {
    const k = G.scale || 1, w = Math.round(W * k), h = Math.round(H * k);
    if (!_buf || _buf.width !== w || _buf.height !== h) _buf = G.makeCanvas(w, h);
    const x = _buf.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.setTransform(k, 0, 0, k, 0, 0);
    return _buf;
  };

  // ---------- finishing: letterbox, subtitles, vignette, grain, flare ----------
  let grainTiles = null;
  function grain(ctx, t, a) {
    if (!grainTiles) {
      grainTiles = [0, 1, 2, 3].map((k) => { const c = G.makeCanvas(256, 256), x = c.getContext('2d'), d = x.createImageData(256, 256), r = U.mulberry32(77 + k); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - 0.5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return c; });
    }
    const f = Math.floor(t * 24), tile = grainTiles[f % 4];
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a;
    ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.translate(Math.floor(U.hash(f, 1) * 256), Math.floor(U.hash(f, 2) * 256)); ctx.fillRect(-256, -256, W + 512, H + 512);
    ctx.restore();
  }
  K.finish = (ctx, t, subs, { vignette = 0.5, grainA = 0.09 } = {}) => {
    ctx.fillStyle = K.radial(ctx, VIEW.cx, VIEW.cy, VIEW.h * 0.45, W * 0.62, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${vignette})`]]); ctx.fillRect(0, 0, W, H);
    grain(ctx, t, grainA);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR);
    const s = subs.find((q) => t >= q.t && t < q.end);
    if (s) K.text(ctx, s.text, W / 2, H - BAR / 2, { size: 37, weight: 700, color: '#F4F1EA', alpha: Math.min(K.u(t, s.t, s.t + 0.12), 1) });
  };
  // an anamorphic streak (a horizontal lens flare)
  K.streak = (ctx, x, y, w, color = '255,236,200', a = 1) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a;
    ctx.fillStyle = K.grad(ctx, x - w, 0, x + w, 0, [[0, `rgba(${color},0)`], [0.5, `rgba(${color},0.9)`], [1, `rgba(${color},0)`]]);
    ctx.fillRect(x - w, y - 2.5, 2 * w, 5);
    ctx.fillStyle = K.radial(ctx, x, y, 0, w * 0.22, [[0, `rgba(${color},0.55)`], [1, `rgba(${color},0)`]]); ctx.fillRect(x - w, y - w * 0.22, 2 * w, w * 0.44);
    ctx.restore();
  };
  globalThis.K = K;
})();
