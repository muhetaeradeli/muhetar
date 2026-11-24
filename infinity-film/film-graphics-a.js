// GRAPHICS A: ornament, time and sky.
(function () {
  const U = globalThis.U, K = globalThis.K, SC = globalThis.SCORE, GR = globalThis.GR, BG = globalThis.BG, OV = globalThis.OV, H = globalThis.GH;
  const { clamp, lerp } = U;
  const { line: L } = SC;
  const { CX, CY, TOP, BOT, CREAM, GOLD, PALE, NAVY } = GR;
  const W = 1920;
  const { at, end, win, glowLine, star, hornsUp, scroll, lissajous, spiralPts, circlePts, arrowHead, caps, big, small, rosette, sprout } = H;
  const io = (t, a, b) => K.io(t, a, b), uu = (t, a, b) => K.u(t, a, b);
  const title = (c, t, s, a, b = Infinity) => caps(c, s, CX, TOP + 70, { size: 28, alpha: win(t, a, b, 0.5, 0.5) });

  // ============ ORNAMENT (drawn on the felt stage) ============
  // a band: one element repeated in rhythm; it builds, then runs; o.pull = a line id at which the camera pulls back
  GR.band = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const t0 = sh.start + 0.3, pull = o.pull && L[o.pull] ? io(t, L[o.pull].t - 0.3, L[o.pull].end) : 0, z = lerp(1, 0.5, pull);
    const step = 170, n = Math.ceil(W / (step * z) / 2) + 2, off = Math.max(0, t - t0 - 2.6) * 40;
    c.save(); c.translate(CX, CY); c.scale(z, z);
    for (const dy of pull > 0.02 ? [-300, 0, 300] : [0]) {
      K.alpha(c, dy === 0 ? 1 : pull, () => {
        K.rect(c, -W / z, dy - 95, 2 * W / z, 3, GOLD); K.rect(c, -W / z, dy + 95, 2 * W / z, 3, GOLD);
        for (let k = -n; k <= n; k++) {
          const ap = dy === 0 ? uu(t, t0 + (k + n) * 0.09, t0 + 0.4 + (k + n) * 0.09) : 1;
          if (ap > 0) K.horns(c, k * step - (off % step), dy - 62, 92, o.alt && k % 2 ? PALE : GOLD, 5 / z, ap);
        }
      });
    }
    c.restore();
    if (o.title) title(c, t, o.title, sh.start + 0.2);
  };
  // the border that runs round an object («шет ою»), optionally around a centre medallion
  GR.border = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const k = io(t, sh.start + (o.delay || 0.2), sh.start + (o.delay || 0.2) + 1.6);
    scroll(c, TOP + 46, 22, 90, t, { lw: 4, k }); scroll(c, BOT - 46, 22, 90, t, { lw: 4, k, dir: -1 });
    c.save(); c.translate(46, CY); c.rotate(Math.PI / 2); scroll(c, 0, 22, 90, t, { lw: 4, k, x0: -VIEW_H() / 2, x1: VIEW_H() / 2 }); c.restore();
    c.save(); c.translate(W - 46, CY); c.rotate(-Math.PI / 2); scroll(c, 0, 22, 90, t, { lw: 4, k, x0: -VIEW_H() / 2, x1: VIEW_H() / 2 }); c.restore();
    if (o.center) GR.medallionAt(c, t, CX, CY, 170, sh.start + 0.6);
    if (o.labels) { caps(c, 'ІШКІ КЕҢІСТІК', CX, CY + 250, { size: 24, color: CREAM, alpha: uu(t, o.labels[0], o.labels[0] + 0.6) }); caps(c, 'СЫРТҚЫ КЕҢІСТІК', CX, TOP + 160, { size: 24, color: CREAM, alpha: uu(t, o.labels[1], o.labels[1] + 0.6) }); }
    if (o.title) caps(c, o.title, CX, TOP + 112, { size: 28, alpha: win(t, sh.start + 0.2, Infinity, 0.5, 0.5) });
  };
  const VIEW_H = () => BOT - TOP - 92;
  // a centre medallion: a ring of horns around a centre, drawn from t0
  GR.medallionAt = (c, t, x, y, R, t0, rot = 0) => {
    const k = io(t, t0, t0 + 1.6);
    c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.arc(x, y, R, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); c.stroke();
    c.lineWidth = 2; c.beginPath(); c.arc(x, y, R * 0.42, 0, Math.PI * 2 * k); c.stroke(); c.restore();
    for (let i = 0; i < 4; i++) { c.save(); c.translate(x, y); c.rotate(rot + i * Math.PI / 2); hornsUp(c, R * 0.55, GOLD, 4, io(t, t0 + 0.4 + i * 0.2, t0 + 1.6 + i * 0.2)); c.restore(); }
    K.glow(c, x, y, R * 0.5, 'rgba(255,210,140,0.5)', k); K.circle(c, x, y, 9, PALE);
  };
  GR.medallion = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    GR.medallionAt(c, t, CX, CY, 230, sh.start + 0.3, (t - sh.start) * 0.04);
    if (o.ring) { const k = io(t, o.ring, o.ring + 1.6); scroll(c, CY - 278, 18, 80, t, { lw: 3, k, x0: CX - 520, x1: CX + 520 }); scroll(c, CY + 278, 18, 80, t, { lw: 3, k, x0: CX - 520, x1: CX + 520, dir: -1 }); }
    if (o.labels) o.labels.forEach(([s, tt, x, y]) => caps(c, s, x, y, { size: 26, color: CREAM, alpha: uu(t, tt, tt + 0.6) }));
    if (o.title) title(c, t, o.title, sh.start + 0.2);
  };
  // a circle: drawn, then a light runs round it forever; o.horns rings it with horns
  GR.circle = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const t0 = sh.start + 0.2, R = o.R || 230, k = io(t, t0, t0 + 1.8), rot = (t - t0) * 0.18;
    if (o.construct) { c.save(); c.strokeStyle = 'rgba(226,182,89,0.35)'; c.lineWidth = 1.5; c.setLineDash([6, 10]); c.beginPath(); c.moveTo(CX, CY); c.lineTo(CX + R * Math.cos(-Math.PI / 2 + k * Math.PI * 2), CY + R * Math.sin(-Math.PI / 2 + k * Math.PI * 2)); c.stroke(); c.restore(); K.circle(c, CX, CY, 5, GOLD); }
    glowLine(c, circlePts(CX, CY, R), k, { lw: 5 });
    if (o.horns) for (let i = 0; i < 16; i++) { const an = rot + i / 16 * Math.PI * 2, s = uu(t, o.horns + i * 0.06, o.horns + 0.4 + i * 0.06); if (s <= 0) continue; c.save(); c.translate(CX + Math.cos(an) * (R + 8), CY + Math.sin(an) * (R + 8)); c.rotate(an + Math.PI / 2); hornsUp(c, 34, GOLD, 3, s); c.restore(); }
    if (k >= 1 || o.dot) { const an = -Math.PI / 2 + (t - t0) * 1.4; const x = CX + Math.cos(an) * R, y = CY + Math.sin(an) * R; K.glow(c, x, y, 60, 'rgba(255,220,150,0.95)', uu(t, t0 + 1.6, t0 + 2.0)); K.circle(c, x, y, 9 * uu(t, t0 + 1.6, t0 + 2.0), '#FFF4DC'); }
    if (o.words) o.words.forEach(([s, w, x, y], i) => { const tw = at(sh.id, w); big(c, s, x ?? CX, y ?? CY + (i - (o.words.length - 1) / 2) * 70, { size: 40, alpha: uu(t, tw - 0.1, tw + 0.5), spacing: 6 }); });
    if (o.title) title(c, t, o.title, sh.start + 0.2);
  };
  GR.spiral = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const t0 = sh.start + 0.2, pts = spiralPts(CX, CY, o.R || 300, o.turns || 4.2, (t - t0) * 0.4);
    const k = io(t, t0, o.out ? at(sh.id, o.out) + 0.6 : t0 + 2.4), back = o.in ? io(t, at(sh.id, o.in), at(sh.id, o.in) + 1.6) : 0;
    glowLine(c, pts, k, { lw: 4 });
    const q = pts[Math.round(clamp(back > 0 ? 1 - back : k) * 400)];
    K.glow(c, q[0], q[1], 60, 'rgba(255,220,150,0.9)'); K.circle(c, q[0], q[1], 8, '#FFF4DC');
    if (o.grow) { const g = io(t, o.grow, o.grow + 2); for (let i = 0; i < 3; i++) { const an = i * 2.1 + (t - t0) * 0.3; c.save(); c.translate(CX + Math.cos(an) * 360, CY + Math.sin(an) * 250); c.rotate(an + Math.PI / 2); hornsUp(c, 80, PALE, 4, clamp(g * 3 - i)); c.restore(); } }
    if (o.title) title(c, t, o.title, sh.start + 0.2);
  };
  GR.wave = (o = {}) => (c, t, sh) => { if (!o.noBg) BG.stage(c, t, sh); scroll(c, CY, 70, 200, t, { lw: 6, k: io(t, sh.start, sh.start + 2.0), speed: 70 }); if (o.title) title(c, t, o.title, sh.start + 0.2); };
  GR.hornsChain = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const a = sh.start + 0.2, n = 6, step = 300, x0 = CX - step * (n - 1) / 2;
    K.line(c, x0 - 120, CY + 150, lerp(x0 - 120, x0 + step * (n - 1) + 120, io(t, a, a + 2)), CY + 150, GOLD, 4);
    for (let i = 0; i < n; i++) K.horns(c, x0 + i * step, CY - 120, 150, i % 2 ? PALE : GOLD, 6, io(t, a + 0.3 + i * 0.35, a + 1.3 + i * 0.35));
    if (o.grow) { const g = io(t, o.grow, o.grow + 2.4); for (let i = 0; i < n - 1; i++) K.horns(c, x0 + step / 2 + i * step, CY - 330, 70, PALE, 3, clamp(g * 2 - i * 0.2)); }
    if (o.title) title(c, t, o.title, sh.start + 0.2);
  };
  // «бітпес»: one closed line with no beginning and no end; o.border adds «шет ою» at that time
  GR.bitpes = (o = {}) => (c, t, sh) => {
    if (o.bg !== false) (o.bg || BG.stage)(c, t, sh);
    const a = sh.start + 0.2, pts = lissajous(CX, CY, 330, 250), k = io(t, a, a + 2.6);
    glowLine(c, pts, k, { lw: 5, close: true });
    if (k >= 1) { const q = pts[Math.floor(((t - a) * 90) % 600)]; K.glow(c, q[0], q[1], 70, 'rgba(255,220,150,0.95)'); K.circle(c, q[0], q[1], 9, '#FFF4DC'); }
    if (o.border) { const sb = uu(t, o.border, o.border + 1.2); if (sb > 0) K.alpha(c, sb, () => { scroll(c, TOP + 46, 22, 90, t, { lw: 4, k: sb }); scroll(c, BOT - 46, 22, 90, t, { lw: 4, k: sb, dir: -1 }); }); caps(c, '«ШЕТ ОЮ»', 1590, CY, { size: 30, alpha: sb }); }
    (o.labels || [['«БІТПЕС»', a + 0.3]]).forEach(([s, tt], i) => caps(c, s, 330, CY - 30 + i * 60, { size: 30, alpha: uu(t, tt, tt + 0.6) }));
  };
  GR.tortkulak = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const a = sh.start + 0.2;
    c.save(); c.translate(CX, CY); c.rotate((t - a) * (o.spin ?? 0.12));
    c.strokeStyle = 'rgba(226,182,89,0.5)'; c.lineWidth = 2; c.strokeRect(-250, -250, 500, 500);
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); hornsUp(c, 150, GOLD, 6, io(t, a + i * 0.3, a + 1.6 + i * 0.3)); c.restore(); }
    c.restore(); K.circle(c, CX, CY, 12, PALE);
    if (o.arrows) { const k = uu(t, o.arrows, o.arrows + 0.8); K.alpha(c, k, () => { for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2; const x = CX + Math.cos(an) * 360, y = CY + Math.sin(an) * 330; arrowHead(c, x, y, an, 16); } caps(c, 'ТЕПЕ-ТЕҢДІК', CX, BOT - 60, { size: 26, color: CREAM }); }); }
    caps(c, o.label || '«ТӨРТҚҰЛАҚ»', CX, TOP + 70, { size: 28, alpha: uu(t, a + 0.2, a + 0.9) });
  };
  // mirror symmetry (a half is drawn, then mirrored), then turning symmetry (four copies)
  GR.symmetry = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const a = sh.start + 0.2, b = o.rotAt ?? a + 3.2, m = uu(t, a, b - 0.4), r = io(t, b, b + 1.4);
    if (m > 0 && r < 1) K.alpha(c, 1 - r, () => {
      K.line(c, CX, CY - 300, CX, lerp(CY - 300, CY + 300, io(t, a, a + 0.8)), 'rgba(255,231,176,0.6)', 2);
      c.save(); c.beginPath(); c.rect(0, 0, CX, 1080); c.clip(); K.horns(c, CX, CY - 160, 260, GOLD, 8, io(t, a + 0.4, a + 1.6)); c.restore();
      const mm = io(t, a + 1.6, a + 2.6); c.save(); c.translate(CX, 0); c.scale(lerp(0.01, 1, mm) * -1, 1); c.translate(-CX, 0); c.beginPath(); c.rect(0, 0, CX, 1080); c.clip(); K.horns(c, CX, CY - 160, 260, PALE, 8, 1); c.restore();
      caps(c, 'АЙНА СИММЕТРИЯСЫ', CX, BOT - 60, { size: 26, color: CREAM, alpha: uu(t, a + 0.5, a + 1.2) });
    });
    if (r > 0) K.alpha(c, r, () => {
      c.save(); c.translate(CX, CY); c.rotate((t - b) * 0.25);
      for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); hornsUp(c, 130, i % 2 ? PALE : GOLD, 5, io(t, b + i * 0.2, b + 1 + i * 0.2)); c.restore(); }
      c.restore(); caps(c, 'АЙНАЛМАЛЫ СИММЕТРИЯ', CX, BOT - 60, { size: 26, color: CREAM });
    });
    if (o.title) title(c, t, o.title, a);
  };
  // modules tiling the plane in a wave
  GR.tiling = (o = {}) => (c, t, sh) => {
    if (!o.noBg) BG.stage(c, t, sh);
    const a = sh.start + 0.2, step = 150;
    for (let i = -1; i < 14; i++) for (let j = 0; j < 6; j++) {
      const x = 60 + i * step + ((t - a) * 30) % step, y = TOP + 70 + j * step, d = Math.hypot(i - 6, j - 2.5);
      K.horns(c, x, y - 40, 70, (i + j) % 2 ? PALE : GOLD, 3, io(t, a + d * 0.15, a + 0.8 + d * 0.15));
    }
    if (o.title) title(c, t, o.title, a);
  };
  // icons of the motifs in a row, each appearing as it is named: items [[kind, label, spoken word]]
  const ICON = {
    circle: (c, x, y, k) => glowLine(c, circlePts(x, y, 46), k, { lw: 4 }),
    spiral: (c, x, y, k) => glowLine(c, spiralPts(x, y, 50, 3.2, 0, 160), k, { lw: 3 }),
    wave: (c, x, y, k) => scroll(c, y, 16, 46, 0, { lw: 3, k, x0: x - 70, x1: x + 70, speed: 0 }),
    closed: (c, x, y, k) => glowLine(c, lissajous(x, y, 60, 44, 3, 2, 200), k, { lw: 3, close: true }),
    horns: (c, x, y, k) => K.horns(c, x, y - 40, 60, GOLD, 4, k),
    band: (c, x, y, k) => { for (let i = 0; i < 3; i++) K.horns(c, x - 50 + i * 50, y - 22, 34, GOLD, 3, clamp(k * 3 - i)); K.rect(c, x - 80, y + 26, 160 * k, 2, GOLD); },
    line: (c, x, y, k) => glowLine(c, [[x - 80, y], [x + 80, y]], k, { lw: 4 }),
    border: (c, x, y, k) => { c.save(); c.strokeStyle = GOLD; c.lineWidth = 3; c.strokeRect(x - 60, y - 45, 120 * k, 90); c.strokeRect(x - 45, y - 30, 90 * k, 60); c.restore(); },
    rotate: (c, x, y, k) => { for (let i = 0; i < 4; i++) { c.save(); c.translate(x, y); c.rotate(i * Math.PI / 2); hornsUp(c, 34, GOLD, 3, clamp(k * 4 - i)); c.restore(); } },
    module: (c, x, y, k) => { c.save(); c.strokeStyle = 'rgba(226,182,89,0.5)'; c.setLineDash([4, 6]); c.strokeRect(x - 50, y - 50, 100, 100); c.restore(); K.horns(c, x, y - 34, 50, GOLD, 3, k); },
    bitpes: (c, x, y, k) => glowLine(c, lissajous(x, y, 60, 44, 3, 2, 200), k, { lw: 3, close: true }),
    shimai: (c, x, y, k) => glowLine(c, lissajous(x, y, 58, 46, 5, 4, 300), k, { lw: 2.5, close: true }),
    tortkulak: (c, x, y, k) => { for (let i = 0; i < 4; i++) { c.save(); c.translate(x, y); c.rotate(i * Math.PI / 2); hornsUp(c, 40, GOLD, 3, clamp(k * 4 - i)); c.restore(); } },
    rosette: (c, x, y, k) => rosette(c, x, y, 56, k),
    sprout: (c, x, y, k) => sprout(c, x, y, 90, k),
  };
  GR.ICON = ICON;
  GR.icons = (items, o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const n = items.length, dx = Math.min(300, 1720 / n), y = o.y ?? CY - 20;
    items.forEach(([kind, label, w, lid], i) => {
      const tw = w ? at(lid || sh.id, w) : sh.start + 0.3 + i * 0.4, k = io(t, tw - 0.2, tw + 0.8), x = CX + (i - (n - 1) / 2) * dx;
      if (k <= 0) return; ICON[kind](c, x, y, k);
      K.text(c, label, x, y + 110, { size: n > 6 ? 22 : 26, weight: 600, color: CREAM, alpha: K.u(t, tw, tw + 0.5), shadow: 12 });
    });
    if (o.title) title(c, t, o.title, sh.start + 0.2);
  };
  // three kinds of ornament (cosmic, animal, plant), then woven into one composition
  GR.ornTypes = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const ts = o.times, merge = o.merge ? io(t, o.merge, o.merge + 2) : 0;
    const pos = (i) => [lerp(CX + (i - 1) * 480, CX + Math.cos(-Math.PI / 2 + i * 2.094) * 150, merge), lerp(CY - 30, CY + Math.sin(-Math.PI / 2 + i * 2.094) * 150, merge)];
    [['КОСМОГОНИЯЛЫҚ', (x, y, k) => rosette(c, x, y, 90, k)], ['ЗООМОРФТЫҚ', (x, y, k) => K.horns(c, x, y - 70, 110, GOLD, 5, k)], ['ӨСІМДІК ТЕКТЕС', (x, y, k) => sprout(c, x, y + 10, 150, k)]].forEach(([s, f], i) => {
      const k = io(t, ts[i] - 0.2, ts[i] + 1.0); if (k <= 0) return; const [x, y] = pos(i); f(x, y, k);
      caps(c, s, x, y + 150 - merge * 40, { size: 22, color: CREAM, alpha: k * (1 - merge) });
    });
    if (merge > 0) { glowLine(c, circlePts(CX, CY, 330), merge, { lw: 3 }); caps(c, 'БІРТҰТАС ЖҮЙЕ', CX, BOT - 60, { size: 26, alpha: merge }); }
  };

  // ============ TIME ============
  // a straight line bends round into a circle
  GR.lineCircle = (o = {}) => (c, t, sh) => {
    BG.night(c, t, sh);
    const tl = at(sh.id, o.word || 'түзу'), k = io(t, tl + 0.8, end(sh.id) + 0.6), N = 160, R = 1200 / (2 * Math.PI), pts = [];
    for (let i = 0; i <= N; i++) { const q = i / N, an = Math.PI / 2 + q * 2 * Math.PI; pts.push([lerp(360 + 1200 * q, CX + Math.cos(an) * R, k), lerp(CY, CY + Math.sin(an) * R, k)]); }
    glowLine(c, pts, K.u(t, tl - 0.4, tl + 0.8), { lw: 5 });
    K.text(c, 'түзу сызық', CX, CY + 70, { size: 34, weight: 400, italic: true, color: CREAM, alpha: (1 - k) * K.u(t, tl, tl + 0.6), shadow: 14 });
    K.text(c, 'АЙНАЛЫМ', CX, CY, { size: 40, weight: 800, spacing: 12, color: GOLD, alpha: K.u(t, end(sh.id), end(sh.id) + 0.6), shadow: 16 });
  };
  // a ring that closes on itself with an arrow; o.ends = [end word, start word]; o.three = [[s, w], …]
  GR.cycle = (o = {}) => (c, t, sh) => {
    (o.bg || BG.photo('s_sunrise', 0.45))(c, t, sh);
    const R = o.R || 170, a0 = Math.PI * 0.5, cy = CY - (o.three ? 70 : 0), k = io(t, sh.start + 0.3, o.closeAt ?? end(sh.id));
    const pts = []; for (let i = 0; i <= 120; i++) { const an = a0 + i / 120 * Math.PI * 1.94; pts.push([CX + Math.cos(an) * R, cy + Math.sin(an) * R]); }
    glowLine(c, pts, k, { lw: 5 });
    if (k > 0.95) { const an = a0 + Math.PI * 1.94; arrowHead(c, CX + Math.cos(an) * R, cy + Math.sin(an) * R, an + Math.PI / 2, 14); }
    if (o.ticks) for (let i = 0; i < o.ticks; i++) { const an = -Math.PI / 2 + i / o.ticks * Math.PI * 2, s = uu(t, sh.start + 0.5 + i * 0.15, sh.start + 0.8 + i * 0.15); K.circle(c, CX + Math.cos(an) * R, cy + Math.sin(an) * R, 7 * s, PALE); }
    if (o.ends) { const [w1, w2] = o.ends; small(c, o.endLabels?.[0] || 'аяқталуы', CX - 110, cy + R + 40, { italic: true, alpha: uu(t, at(sh.id, w1), at(sh.id, w1) + 0.6) }); small(c, o.endLabels?.[1] || 'басталуы', CX + 110, cy + R + 40, { italic: true, alpha: uu(t, at(sh.id, w2), at(sh.id, w2) + 0.6) }); }
    if (o.three) o.three.forEach(([s, w], i) => { const tw = at(sh.id, w); big(c, s, CX + (i - 1) * 400, BOT - 110, { size: 46, alpha: uu(t, tw - 0.1, tw + 0.5) }); });
    if (o.label) caps(c, o.label, CX, cy, { size: 30, alpha: uu(t, sh.start + 0.6, sh.start + 1.2) });
  };
  // a ring of four: seasons, pastures, the working year. o.items = [[label, spoken word, sub-label?], …] (top, right, bottom, left)
  GR.ring4 = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const cy = CY - 10, R = o.R || 210, rot = -Math.PI / 2, ids = o.ids || [];
    const k = io(t, sh.start + 0.2, sh.start + 2.2);
    c.save(); c.strokeStyle = 'rgba(255,226,160,0.9)'; c.lineWidth = 3; c.setLineDash([2, 12]); c.lineCap = 'round';
    c.beginPath(); c.arc(CX, cy, R, rot, rot + k * Math.PI * 2); c.stroke(); c.restore();
    if (o.arrows) for (let i = 0; i < 4; i++) { const an = rot + (i + 0.5) * Math.PI / 2; arrowHead(c, CX + Math.cos(an) * R, cy + Math.sin(an) * R, an + Math.PI / 2, 12 * k); }
    if (o.spin) { const an = rot + (t - sh.start) * o.spin; K.glow(c, CX + Math.cos(an) * R, cy + Math.sin(an) * R, 50, 'rgba(255,220,150,0.9)', k); }
    o.items.forEach(([s, w, sub, lid], i) => {
      const tw = w ? at(lid || ids[i] || sh.id, w) : sh.start + 0.4 + i * 0.4, an = rot + i * Math.PI / 2, x = CX + Math.cos(an) * R, y = cy + Math.sin(an) * R;
      const a = uu(t, tw - 0.1, tw + 0.4); if (a <= 0) return;
      K.alpha(c, a, () => {
        K.circle(c, x, y, 10, PALE);
        const lx = x + Math.cos(an) * (i % 2 ? 150 : 70), ly = y + Math.sin(an) * 48;
        K.text(c, s, lx, ly, { size: 34, weight: 800, spacing: 4, shadow: 20 });
        if (sub) { const sa = sub[1] ? uu(t, at(sub[2] || sh.id, sub[1]) - 0.1, at(sub[2] || sh.id, sub[1]) + 0.5) : 1; small(c, sub[0], lx, ly + 40 * (i === 0 ? -1 : 1), { size: 24, alpha: sa, italic: true }); }
      });
    });
    if (o.center) caps(c, o.center, CX, cy, { size: 26, alpha: uu(t, sh.start + 0.4, sh.start + 1.0) });
  };
  // the twelve-year мүшел
  GR.mushel = (o = {}) => (c, t, sh) => {
    BG.night(c, t, sh);
    const ta = o.word ? at(sh.id, o.word) : sh.start + 0.3, R = 255, names = ['Тышқан', 'Сиыр', 'Барыс', 'Қоян', 'Ұлу', 'Жылан', 'Жылқы', 'Қой', 'Мешін', 'Тауық', 'Ит', 'Доңыз'];
    const k = io(t, ta - 0.2, ta + 1.6), rot = -Math.PI / 2 + (t - ta) * 0.12, hi = Math.floor(Math.max(0, t - ta) / 0.5) % 12;
    c.save(); c.strokeStyle = 'rgba(226,182,89,0.85)'; c.lineWidth = 3; c.beginPath(); c.arc(CX, CY, R, rot, rot + k * Math.PI * 2); c.stroke(); c.restore();
    names.forEach((n, i) => {
      const an = rot + i * Math.PI / 6, x = CX + Math.cos(an) * R, y = CY + Math.sin(an) * R;
      K.alpha(c, uu(t, ta + i * 0.1, ta + i * 0.1 + 0.4), () => { K.circle(c, x, y, i === hi ? 9 : 6, i === hi ? PALE : GOLD); K.text(c, n, CX + Math.cos(an) * (R + 66), CY + Math.sin(an) * (R + 40), { size: 26, weight: i === hi ? 800 : 600, color: i === hi ? '#FFFFFF' : CREAM, shadow: 12 }); });
    });
    K.text(c, 'МҮШЕЛ', CX, CY - 18, { size: 54, weight: 800, spacing: 10, color: GOLD, shadow: 18, alpha: uu(t, ta + 0.3, ta + 1.0) });
    K.text(c, '12 жыл', CX, CY + 40, { size: 30, weight: 400, color: CREAM, alpha: uu(t, ta + 0.6, ta + 1.3) });
  };
  // the parts of the day: the sun walks an arc across a changing sky
  GR.dayParts = (o = {}) => (c, t, sh) => {
    const names = [['ТАҢ', 'Таң'], ['СӘСКЕ', 'сәске'], ['ТАЛ ТҮС', 'тал түс'], ['БЕСІН', 'бесін'], ['АҚШАМ', 'ақшам'], ['ТҮН', 'түн']];
    const ph = clamp((t - sh.start) / Math.max(4, sh.end - sh.start)), sunU = clamp(ph * 1.25);
    const sky = (p) => { const s = Math.sin(Math.PI * clamp(p)); return [lerp(12, 70, s), lerp(18, 130, s), lerp(46, 205, s)]; };
    const [r, g, b] = sky(sunU);
    c.fillStyle = K.grad(c, 0, TOP, 0, BOT, [[0, `rgb(${r * 0.6},${g * 0.6},${b * 0.8})`], [0.75, `rgb(${r + 60},${g + 40},${b})`], [1, '#2A2016']]); c.fillRect(0, TOP, W, BOT - TOP);
    const hy = BOT - 150, ax = (q) => lerp(260, 1660, q), ay = (q) => hy - Math.sin(Math.PI * q) * 520;
    c.fillStyle = '#1C150F'; c.fillRect(0, hy, W, BOT - hy);
    c.save(); c.strokeStyle = 'rgba(255,231,176,0.35)'; c.setLineDash([3, 10]); c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 60; i++) { const q = i / 60; if (i) c.lineTo(ax(q), ay(q)); else c.moveTo(ax(q), ay(q)); } c.stroke(); c.restore();
    if (sunU < 1) { K.glow(c, ax(sunU), ay(sunU), 300, 'rgba(255,200,110,0.7)'); K.circle(c, ax(sunU), ay(sunU), 34, '#FFE9B8'); }
    else { K.circle(c, CX + 500, TOP + 140, 28, '#F2EEDC'); for (let i = 0; i < 60; i++) star(c, U.hash(i, 1) * W, TOP + 30 + U.hash(i, 2) * 380, 1.4, 0.6); }
    const qs = [0, 0.22, 0.5, 0.68, 0.94, 1.0];
    names.forEach(([s, w], i) => {
      const tw = o.id ? at(o.id, w) : sh.start + i, a = uu(t, tw - 0.1, tw + 0.4); if (a <= 0) return;
      const x = ax(qs[i]) + (i === 5 ? 120 : 0), y = i === 5 ? hy - 80 : ay(qs[i]) - 70;
      K.alpha(c, a, () => { K.circle(c, ax(qs[i]) + (i === 5 ? 120 : 0), i === 5 ? hy - 30 : ay(qs[i]), 7, PALE); big(c, s, x, y, { size: 36, spacing: 6 }); });
    });
  };
  // the moon through its month: eight phases (an overlay)
  OV.moons = (id, word) => (c, t) => {
    const ta = at(id, word), a = win(t, ta, end(id) + 0.3, 0.5, 0.5); if (a <= 0) return;
    K.alpha(c, a, () => { for (let i = 0; i < 8; i++) {
      const x = 520 + i * 125, y = TOP + 100, p = i / 8, s = uu(t, ta + i * 0.18, ta + i * 0.18 + 0.4); if (s <= 0) continue;
      K.alpha(c, s, () => {
        const lit = 'rgba(250,240,215,0.95)', dark = 'rgba(20,24,40,1)', k = Math.cos(p * 2 * Math.PI);
        K.circle(c, x, y, 34, dark); c.save(); c.beginPath(); c.arc(x, y, 34, 0, 7); c.clip();
        c.fillStyle = lit; c.beginPath(); if (p < 0.5) c.arc(x, y, 34, -Math.PI / 2, Math.PI / 2); else c.arc(x, y, 34, Math.PI / 2, Math.PI * 1.5); c.fill();
        c.fillStyle = k > 0 ? dark : lit; c.beginPath(); c.ellipse(x, y, 34 * Math.abs(k), 34, 0, 0, 7); c.fill(); c.restore();
        c.strokeStyle = 'rgba(255,230,170,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 34, 0, 7); c.stroke();
      });
    } });
  };
  // the Pole Star, the Great Bear and the Pleiades, as each is named (an overlay on the night sky)
  const DIPPER = [[900, 520], [840, 580], [770, 545], [822, 482], [752, 452], [682, 440], [610, 466]], POLARIS = [1170, 250];
  const PLEIADES = [[1450, 520], [1468, 508], [1482, 526], [1462, 540], [1436, 532], [1478, 492], [1494, 512]];
  OV.stars = (id, o = {}) => (c, t) => {
    const tP = at(o.pid || id, 'Темірқазық'), tD = at(o.did || id, o.dword || 'Жетіқарақшы'), tU = at(o.uid || id, 'Үркер'), until = o.until ?? end(id) + 0.5;
    const a = win(t, Math.min(tP, tD, tU) - 0.2, until, 0.4, 0.6); if (a <= 0) return;
    K.alpha(c, a, () => {
      star(c, POLARIS[0], POLARIS[1], 6.5, uu(t, tP, tP + 0.5));
      caps(c, 'ТЕМІРҚАЗЫҚ', POLARIS[0] + 30, POLARIS[1] - 34, { size: 26, align: 'left', alpha: uu(t, tP + 0.2, tP + 0.8) });
      if (o.north) { const k = uu(t, o.north, o.north + 0.8); K.alpha(c, k, () => { K.line(c, POLARIS[0], BOT - 60, POLARIS[0], POLARIS[1] + 40, 'rgba(255,231,176,0.7)', 3); arrowHead(c, POLARIS[0], POLARIS[1] + 36, -Math.PI / 2, 14, PALE); caps(c, 'СОЛТҮСТІК', POLARIS[0] + 24, BOT - 90, { size: 22, align: 'left', color: CREAM }); }); }
      const k = io(t, tD - 0.2, tD + 1.4);
      glowLine(c, [DIPPER[6], DIPPER[5], DIPPER[4], DIPPER[3], DIPPER[0], DIPPER[1], DIPPER[2], DIPPER[3]], k, { lw: 2.5, color: 'rgba(255,226,160,0.7)' });
      DIPPER.forEach(([x, y], i) => star(c, x, y, 4, uu(t, tD - 0.2 + i * 0.08, tD + 0.2 + i * 0.08)));
      const v = io(t, Math.max(tD, tP) + 0.6, Math.max(tD, tP) + 1.8);
      if (v > 0) K.line(c, DIPPER[0][0], DIPPER[0][1], lerp(DIPPER[0][0], POLARIS[0] - 18, v), lerp(DIPPER[0][1], POLARIS[1] + 18, v), 'rgba(255,226,160,0.55)', 2);
      caps(c, 'ЖЕТІҚАРАҚШЫ', 690, 610, { size: 24, alpha: uu(t, tD + 0.4, tD + 1.0) });
      PLEIADES.forEach(([x, y], i) => star(c, x, y, 3.4, uu(t, tU + i * 0.08, tU + i * 0.08 + 0.3)));
      caps(c, 'ҮРКЕР', 1466, 600, { size: 26, alpha: uu(t, tU + 0.5, tU + 1.1) });
    });
  };
  // a line of life: stages along a road, rites marked on it. o.items = [[label, word]], o.rites = [[label, word, at index]]
  GR.lifeLine = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const n = o.items.length, x0 = 260, x1 = 1660, y = CY + 40, k = io(t, sh.start + 0.2, sh.start + 2.2);
    K.line(c, x0, y, lerp(x0, x1, k), y, GOLD, 4); if (k > 0.98) arrowHead(c, x1 + 10, y, 0, 16);
    o.items.forEach(([s, w, lid], i) => {
      const x = lerp(x0 + 60, x1 - 80, i / (n - 1)), tw = at(lid || sh.id, w), a = uu(t, tw - 0.1, tw + 0.5); if (a <= 0) return;
      K.alpha(c, a, () => { K.circle(c, x, y, 16, NAVY, GOLD, 3); K.glow(c, x, y, 60, 'rgba(255,200,110,0.6)', 0.5); big(c, s, x, y + (i % 2 && !o.rites ? 80 : -70), { size: 30, spacing: 2 }); });
    });
    if (o.rites) o.rites.forEach(([s, w, pos, lid], ri) => {
      const x = lerp(x0 + 60, x1 - 80, pos), tw = at(lid || sh.id, w), a = uu(t, tw - 0.1, tw + 0.5); if (a <= 0) return;
      K.alpha(c, a, () => { K.poly(c, [[x, y - 26], [x + 14, y - 12], [x, y + 2], [x - 14, y - 12]], PALE); const ly = y + (ri % 2 ? 175 : 118); K.line(c, x, y + 8, x, ly - 26, 'rgba(255,231,176,0.5)', 2); caps(c, s, x, ly, { size: 22, color: PALE }); });
    });
    if (o.title) caps(c, o.title, CX, TOP + 70, { size: 28, alpha: uu(t, sh.start, sh.start + 0.6) });
  };
  // a family tree that grows from one root, generation after generation (шежіре)
  GR.tree = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const a = sh.start + 0.3, levels = 5, dy = 130, y0 = BOT - 110;
    const nodes = [[[CX, y0]]];
    for (let l = 1; l < levels; l++) { const prev = nodes[l - 1], row = []; prev.forEach(([x], j) => { const sp = 420 / Math.pow(1.75, l - 1); const kids = l < 3 ? 2 : (j % 2 ? 1 : 2); for (let q = 0; q < kids; q++) row.push([x + (q - (kids - 1) / 2) * sp, y0 - l * dy, j]); }); nodes.push(row); }
    nodes.forEach((row, l) => row.forEach(([x, y, p], j) => {
      const k = io(t, a + l * 0.7 + j * 0.05, a + l * 0.7 + 0.6 + j * 0.05); if (k <= 0) return;
      if (l > 0) { const [px, py] = nodes[l - 1][p]; glowLine(c, [[px, py], [px, (py + y) / 2], [x, (py + y) / 2], [x, y]], k, { lw: 3, glow: 6 }); }
      K.circle(c, x, y, 13 * k, NAVY, GOLD, 3);
    }));
    caps(c, o.label || 'ШЕЖІРЕ', CX, TOP + 70, { size: 30, alpha: uu(t, a, a + 0.6) });
    if (o.side) o.side.forEach(([s, w], i) => { const tw = at(sh.id, w); caps(c, s, 1400, TOP + 230 + i * 70, { size: 24, color: CREAM, align: 'left', alpha: uu(t, tw - 0.1, tw + 0.5) }); });
  };
  // seven generations, linked, the oldest on the left (an overlay)
  OV.jeti = (id, o = {}) => (c, t) => {
    const ta = at(id, o.word || 'Жеті'), y = CY + 10, x0 = 400, dx = (1520 - x0) / 6, k = io(t, ta, ta + 2.6);
    caps(c, 'ЖЕТІ АТА', CX, TOP + 110, { size: 40, alpha: uu(t, ta, ta + 0.6) });
    K.line(c, x0, y, lerp(x0, 1520, k), y, 'rgba(226,182,89,0.8)', 3);
    for (let i = 0; i < 7; i++) { const s = uu(t, ta + i * 0.35, ta + i * 0.35 + 0.4), x = x0 + i * dx; if (s <= 0) continue; K.alpha(c, s, () => { K.glow(c, x, y, 70, 'rgba(255,200,110,0.6)', 0.6); K.circle(c, x, y, 24, NAVY, GOLD, 3); K.text(c, String(7 - i), x, y + 1, { size: 24, weight: 800, color: PALE }); }); }
    const tk = at(id, o.next || 'кейінгі'), kk = uu(t, tk, tk + 0.6);
    if (kk > 0) K.alpha(c, kk, () => { K.line(c, 1550, y, 1680, y, GOLD, 3); arrowHead(c, 1690, y, 0, 14); small(c, 'кейінгі ұрпақ', 1610, y + 52, { italic: true }); });
  };
})();
