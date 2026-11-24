// GRAPHICS B: space, design and the structure of the text (diagrams, tables, lists).
(function () {
  const U = globalThis.U, K = globalThis.K, SC = globalThis.SCORE, GR = globalThis.GR, BG = globalThis.BG, OV = globalThis.OV, H = globalThis.GH;
  const { clamp, lerp } = U;
  const { line: L } = SC;
  const { CX, CY, TOP, BOT, CREAM, GOLD, PALE, NAVY, RED, INK } = GR;
  const W = 1920;
  const { at, end, win, glowLine, star, hornsUp, hornsGeo, scroll, lissajous, spiralPts, circlePts, arrowHead, caps, big, small, check, cross, wrap, textW } = H;
  const io = (t, a, b) => K.io(t, a, b), uu = (t, a, b) => K.u(t, a, b);
  const box = (c, x, y, w, h, r, fill, stroke, lw = 2) => { c.save(); c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } c.restore(); };
  GR.box = box;

  // ============ GENERIC DIAGRAMS ============
  // nodes on a ring / in a row / in a column / a triangle / around a centre / nested; items = [[label, spoken word, line id?]]
  GR.nodes = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const items = o.items, n = items.length, lay = o.layout || 'ring', R = o.R || 280;
    const pos = (i) => {
      if (lay === 'row') return [CX + (i - (n - 1) / 2) * Math.min(560, 1700 / n), CY];
      if (lay === 'col') return [CX, CY + (i - (n - 1) / 2) * Math.min(130, 700 / n)];
      if (lay === 'star') return i === 0 ? [CX, CY] : [CX + Math.cos(-Math.PI / 2 + (i - 1) / (n - 1) * Math.PI * 2) * R * 1.45, CY + Math.sin(-Math.PI / 2 + (i - 1) / (n - 1) * Math.PI * 2) * R];
      const an = -Math.PI / 2 + i / n * Math.PI * 2; return [CX + Math.cos(an) * R * (lay === 'tri' ? 1.15 : o.center ? 1.7 : 1.25), CY + 10 + Math.sin(an) * R];
    };
    const T = items.map(([, w, lid], i) => (w ? at(lid || sh.id, w) : sh.start + 0.3 + i * 0.5));
    if (lay === 'nested') {
      items.forEach(([s], i) => { const r = 120 + i * 120, a = uu(T[i] - 0.1 > 0 ? t : t, T[i] - 0.1, T[i] + 0.5); if (a <= 0) return; K.alpha(c, a, () => { glowLine(c, circlePts(CX, CY, r), io(t, T[i] - 0.1, T[i] + 1.2), { lw: 3 }); caps(c, s, CX, CY - r + (i ? 40 : r), { size: 28, color: i ? GOLD : PALE }); }); });
    } else {
      // links: ring/tri/col/row link neighbours; star links the centre to all
      for (let i = 0; i < n; i++) {
        const j = lay === 'star' ? 0 : (i + 1) % n; if ((lay === 'row' || lay === 'col') && i === n - 1) continue; if (lay === 'star' && i === 0) continue;
        const [x1, y1] = pos(i), [x2, y2] = pos(j), k = io(t, Math.max(T[i], T[j]), Math.max(T[i], T[j]) + 0.8);
        if (k > 0) { glowLine(c, [[x1, y1], [lerp(x1, x2, k), lerp(y1, y2, k)]], 1, { lw: 2.5, color: 'rgba(226,182,89,0.7)', glow: 6 }); if (o.arrows && k > 0.95) arrowHead(c, lerp(x1, x2, 0.82), lerp(y1, y2, 0.82), Math.atan2(y2 - y1, x2 - x1), 12); }
      }
      if (o.spin && lay === 'ring') { const an = -Math.PI / 2 + (t - sh.start) * o.spin; K.glow(c, CX + Math.cos(an) * R * (o.center ? 1.7 : 1.25), CY + 10 + Math.sin(an) * R, 60, 'rgba(255,220,150,0.8)', uu(t, T[n - 1], T[n - 1] + 1)); }
      items.forEach(([s], i) => {
        const a = uu(t, T[i] - 0.1, T[i] + 0.5); if (a <= 0) return; const [x, y] = pos(i), w = Math.max(160, textW(c, s, 30, 800, 3) + 60);
        K.alpha(c, a, () => { box(c, x - w / 2, y - 36, w, 72, 36, i === 0 && lay === 'star' ? GOLD : 'rgba(8,14,34,0.85)', GOLD, 2.5); K.text(c, s, x, y, { size: 30, weight: 800, spacing: 3, color: i === 0 && lay === 'star' ? NAVY : '#FFFFFF' }); });
      });
    }
    if (o.title) caps(c, o.title, CX, TOP + 70, { size: 28, alpha: uu(t, sh.start + 0.2, sh.start + 0.8) });
    if (o.center) { const a = uu(t, o.centerAt ?? sh.start + 0.4, (o.centerAt ?? sh.start + 0.4) + 0.6); caps(c, o.center, CX, CY + 10, { size: 30, alpha: a }); }
  };
  // two ideas side by side: ШЕКСІЗДІК (space, a line without end) and МӘҢГІЛІК (time, a circle without end)
  GR.versus = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const t1 = o.t1 ?? sh.start + 0.4, t2 = o.t2 ?? sh.start + 2;
    const k1 = io(t, t1, t1 + 1.6), k2 = io(t, t2, t2 + 1.6);
    K.line(c, CX, TOP + 120, CX, BOT - 120, 'rgba(226,182,89,0.35)', 2);
    K.alpha(c, uu(t, t1 - 0.2, t1 + 0.4), () => { big(c, 'ШЕКСІЗДІК', CX - 440, TOP + 150, { size: 50, spacing: 8 }); small(c, o.s1 || 'кеңістік пен қозғалыс', CX - 440, TOP + 205, { italic: true }); glowLine(c, [[CX - 440, CY + 60], [CX - 440 - 380 * k1, CY + 60]], 1, { lw: 4 }); glowLine(c, [[CX - 440, CY + 60], [CX - 440 + 380 * k1, CY + 60]], 1, { lw: 4 }); K.streak(c, CX - 440, CY + 60, 340 * k1, '255,226,170', 0.6); });
    K.alpha(c, uu(t, t2 - 0.2, t2 + 0.4), () => { big(c, 'МӘҢГІЛІК', CX + 440, TOP + 150, { size: 50, spacing: 8 }); small(c, o.s2 || 'уақыттың үздіксіздігі', CX + 440, TOP + 205, { italic: true }); glowLine(c, circlePts(CX + 440, CY + 60, 150), k2, { lw: 4 }); if (k2 >= 1) { const an = (t - t2) * 1.4 - Math.PI / 2; K.circle(c, CX + 440 + Math.cos(an) * 150, CY + 60 + Math.sin(an) * 150, 8, '#FFF4DC'); } });
  };
  // a list: items appear as they are read; mark = 'num' | 'x' | 'check'. items = [[text, line id or spoken word]]
  GR.list = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const n = o.items.length, rh = Math.min(84, (BOT - TOP - 170) / n), y0 = CY - (n - 1) * rh / 2 + (o.title ? 30 : 0), x0 = o.x ?? 330;
    if (o.title) caps(c, o.title, CX, TOP + 66, { size: 28, alpha: uu(t, sh.start, sh.start + 0.6) });
    o.items.forEach(([s, ref], i) => {
      const ta = L[ref] ? L[ref].t : ref ? at(sh.id, ref) : sh.start + 0.3 + i * 0.4, a = uu(t, ta - 0.15, ta + 0.4), y = y0 + i * rh; if (a <= 0) return;
      const live = L[ref] && t >= L[ref].t - 0.2 && t < L[ref].end + 0.4;
      K.alpha(c, a * (o.dimPast && L[ref] && t > L[ref].end + 0.4 ? 0.55 : 1), () => {
        if (live) box(c, x0 - 70, y - rh / 2 + 6, 1340, rh - 12, 12, 'rgba(226,182,89,0.14)', null);
        if (o.mark === 'x') H.cross(c, x0 - 30, y, 14, uu(t, ta, ta + 0.6)); else if (o.mark === 'check') check(c, x0 - 30, y, 16, uu(t, ta, ta + 0.6));
        else { K.circle(c, x0 - 30, y, 22, live ? GOLD : NAVY, GOLD, 2); K.text(c, String(i + 1), x0 - 30, y + 1, { size: 22, weight: 800, color: live ? NAVY : PALE }); }
        K.text(c, s, x0 + 10, y, { size: Math.min(34, rh * 0.42), weight: live ? 700 : 500, align: 'left', color: live ? '#FFFFFF' : CREAM, shadow: 10 });
      });
    });
  };
  // a table whose rows appear as they are read; the row being read is lit. rows[0] is the header. o.ids = line id per row
  GR.table = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const rows = o.rows, cols = o.cols, n = rows.length, x0 = (W - cols.reduce((a, b) => a + b, 0)) / 2;
    const rh = o.rh || Math.min(96, (BOT - TOP - 150) / n), y0 = TOP + 120 + (o.top || 0), fs = o.fs || 24;
    if (o.caption) caps(c, o.caption, CX, TOP + 60, { size: 24, alpha: uu(t, sh.start, sh.start + 0.6) });
    const hiRow = (o.hi || []).findIndex(([a, b]) => t >= a && t < b), lit = hiRow >= 0 ? o.hi[hiRow][2] : -1;
    rows.forEach((r, i) => {
      const ta = o.ids && o.ids[i] && L[o.ids[i]] ? L[o.ids[i]].t : sh.start + 0.3 + i * 0.3, a = uu(t, ta - 0.2, ta + 0.4); if (a <= 0) return;
      const y = y0 + i * rh, reading = (o.ids && L[o.ids[i]] && t >= L[o.ids[i]].t - 0.2 && t < L[o.ids[i]].end + 0.3) || lit === i;
      K.alpha(c, a, () => {
        box(c, x0, y, cols.reduce((p, q) => p + q, 0), rh - 6, 10, i === 0 ? 'rgba(226,182,89,0.9)' : reading ? 'rgba(226,182,89,0.22)' : 'rgba(8,14,34,0.72)', i === 0 ? null : 'rgba(226,182,89,0.35)', 1.5);
        let x = x0;
        r.forEach((cell, j) => {
          const lines = wrap(c, cell, cols[j] - 36, fs, i === 0 || j === 0 ? 700 : 400).slice(0, 3), lh = fs * 1.2;
          lines.forEach((ln, q) => K.text(c, ln, x + 18, y + (rh - 6) / 2 + (q - (lines.length - 1) / 2) * lh, { size: fs, weight: i === 0 || j === 0 ? 700 : 400, align: 'left', color: i === 0 ? NAVY : reading ? '#FFFFFF' : CREAM }));
          x += cols[j];
        });
      });
    });
  };
  // the two figures of the text, as mind maps that build themselves: the centre, then six boxes
  GR.mindmap = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const t0 = sh.start + 0.4, bw = 580, bh = 236;
    // the figure's title fills the screen first, then makes way for the diagram
    K.alpha(c, K.win(t, t0 - 0.2, t0 + 1.6, 0.4, 0.5), () => { const ls = wrap(c, o.title, 1500, 46, 800); ls.forEach((ln, i) => K.text(c, ln, CX, CY - (ls.length - 1) * 30 + i * 60, { size: 46, weight: 800, spacing: 3, shadow: 20 })); });
    const k0 = io(t, t0 + 1.2, t0 + 2.2);
    K.alpha(c, k0, () => { c.save(); c.beginPath(); c.ellipse(CX, CY + 10, 300 * k0, 82 * k0, 0, 0, Math.PI * 2); c.fillStyle = GOLD; c.fill(); c.restore(); K.text(c, o.center[0], CX, CY - 6, { size: 22, weight: 800, color: NAVY, spacing: 1 }); K.text(c, o.center[1], CX, CY + 30, { size: 18, weight: 600, color: NAVY }); });
    const P = [[CX - 640, TOP + 140], [CX, TOP + 140], [CX + 640, TOP + 140], [CX - 640, BOT - 140], [CX, BOT - 140], [CX + 640, BOT - 140]];
    o.boxes.forEach(([head, bullets], i) => {
      const tb = t0 + 2.2 + i * 1.8, a = uu(t, tb, tb + 0.6); if (a <= 0) return;
      const [x, y] = P[i], k = io(t, tb, tb + 0.6), ey = i < 3 ? CY - 80 : CY + 100, ex = CX + (i % 3 - 1) * 200;
      K.alpha(c, a, () => {
        glowLine(c, [[ex, ey], [lerp(ex, x, k), lerp(ey, y + (i < 3 ? bh / 2 - 10 : -bh / 2 + 10), k)]], 1, { lw: 2, color: 'rgba(226,182,89,0.6)', glow: 4 });
        box(c, x - bw / 2, y - bh / 2, bw, bh, 26, 'rgba(8,14,34,0.9)', GOLD, 2);
        K.text(c, head, x, y - bh / 2 + 34, { size: 20, weight: 800, color: GOLD, spacing: 1 });
        bullets.forEach((b, q) => { const ba = uu(t, tb + 0.3 + q * 0.18, tb + 0.6 + q * 0.18); K.text(c, '• ' + b, x - bw / 2 + 24, y - bh / 2 + 72 + q * 32, { size: 18, weight: 500, align: 'left', color: CREAM, alpha: ba }); });
      });
    });
    small(c, o.caption, CX, BOT - 16, { size: 20, italic: true, alpha: uu(t, t0 + 12, t0 + 13) });
  };
  // a radar of the qualities a finished product is judged by
  GR.radar = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const n = o.items.length, R = 280, cy = CY + 10;
    for (let r = 1; r <= 4; r++) { c.save(); c.strokeStyle = 'rgba(226,182,89,0.25)'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i <= n; i++) { const an = -Math.PI / 2 + i / n * Math.PI * 2; const x = CX + Math.cos(an) * R * r / 4, y = cy + Math.sin(an) * R * r / 4; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); c.restore(); }
    const vals = o.items.map(([, w], i) => io(t, at(sh.id, w), at(sh.id, w) + 0.8) * (0.78 + 0.18 * U.hash(i, 9)));
    c.save(); c.fillStyle = 'rgba(226,182,89,0.28)'; c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath();
    vals.forEach((v, i) => { const an = -Math.PI / 2 + i / n * Math.PI * 2, x = CX + Math.cos(an) * R * v, y = cy + Math.sin(an) * R * v; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.closePath(); c.fill(); c.stroke(); c.restore();
    o.items.forEach(([s, w], i) => { const an = -Math.PI / 2 + i / n * Math.PI * 2; K.text(c, s, CX + Math.cos(an) * (R + 120), cy + Math.sin(an) * (R + 50), { size: 26, weight: 700, color: '#FFFFFF', alpha: uu(t, at(sh.id, w) - 0.1, at(sh.id, w) + 0.4), shadow: 10 }); });
  };

  // ============ SPACE ============
  // a compass of the paired directions of the world; items = [[label, spoken word, x, y]]
  GR.compass = (o = {}) => (c, t, sh) => {
    (o.bg || BG.stage)(c, t, sh);
    const k = io(t, sh.start + 0.2, sh.start + 1.4);
    glowLine(c, circlePts(CX, CY, 230), k, { lw: 2.5, color: 'rgba(226,182,89,0.6)', glow: 4 });
    K.line(c, CX, CY - 320 * k, CX, CY + 320 * k, 'rgba(226,182,89,0.5)', 2); K.line(c, CX - 420 * k, CY, CX + 420 * k, CY, 'rgba(226,182,89,0.5)', 2);
    o.items.forEach(([s, w, x, y]) => { const tw = at(sh.id, w), a = uu(t, tw - 0.1, tw + 0.5); if (a > 0) { K.alpha(c, a, () => { K.circle(c, x, y, 8, PALE); big(c, s, x + (x < CX - 10 ? -20 : x > CX + 10 ? 20 : 0), y + (y < CY - 10 ? -40 : y > CY + 10 ? 44 : -36), { size: 32, align: x < CX - 10 ? 'right' : x > CX + 10 ? 'left' : 'center', spacing: 3 }); }); } });
    K.circle(c, CX, CY, 12 * k, GOLD);
  };
  // the yurt seen from above: hearth, төр, босаға; o.items puts things round the wall; o.rank shades seats by honour
  GR.yurtPlan = (o = {}) => (c, t, sh) => {
    (o.bg || BG.photo('ch_int1', 0.68))(c, t, sh);
    const R = 270, cy = CY - 6, k = io(t, sh.start + 0.1, sh.start + 1.4);
    c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.arc(CX, cy, R, Math.PI / 2 + 0.22, Math.PI / 2 + 0.22 + k * (Math.PI * 2 - 0.44)); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(226,182,89,0.4)';
    for (let i = 0; i < 24; i++) { const an = i / 24 * Math.PI * 2; c.beginPath(); c.moveTo(CX + Math.cos(an) * 46, cy + Math.sin(an) * 46); c.lineTo(CX + Math.cos(an) * lerp(46, R, k), cy + Math.sin(an) * lerp(46, R, k)); c.stroke(); }
    c.restore();
    K.glow(c, CX, cy, 90, 'rgba(255,150,60,0.8)', k); K.circle(c, CX, cy, 34, 'rgba(255,170,80,0.25)', GOLD, 3);
    small(c, 'ошақ', CX, cy + 62, { italic: true, size: 22, alpha: k });
    const lab = (s, y, ta, sub) => { const a = uu(t, ta, ta + 0.5); big(c, s, CX, y, { size: 34, spacing: 8, color: PALE, alpha: a }); if (sub) small(c, sub, CX, y + 42, { italic: true, size: 22, alpha: a }); };
    if (o.tor !== undefined) lab('ТӨР', cy - R + 60, o.tor, o.torSub);
    if (o.bosaga !== undefined) lab('БОСАҒА', cy + R + 44, o.bosaga, o.bosagaSub);
    if (o.inner !== undefined) { caps(c, 'ІШКІ', CX - 150, cy + 60, { size: 22, color: CREAM, alpha: uu(t, o.inner, o.inner + 0.6) }); caps(c, 'СЫРТҚЫ', 1460, TOP + 120, { size: 22, color: CREAM, alpha: uu(t, o.outer, o.outer + 0.6) }); }
    if (o.items) o.items.forEach(([s, w, an]) => { const tw = at(sh.id, w), a = uu(t, tw - 0.1, tw + 0.5); if (a <= 0) return; const x = CX + Math.cos(an) * (R + 40), y = cy + Math.sin(an) * (R + 26); K.alpha(c, a, () => { K.circle(c, CX + Math.cos(an) * (R - 30), cy + Math.sin(an) * (R - 30), 9, PALE); K.text(c, s, x, y, { size: 26, weight: 700, align: Math.cos(an) > 0.2 ? 'left' : Math.cos(an) < -0.2 ? 'right' : 'center', color: '#FFFFFF', shadow: 14 }); }); });
    if (o.rank) { const a = uu(t, o.rank, o.rank + 1); for (let i = 0; i < 9; i++) { const an = -Math.PI / 2 + (i - 4) * 0.33, v = 1 - Math.abs(i - 4) / 5; K.circle(c, CX + Math.cos(an) * (R - 70), cy + Math.sin(an) * (R - 70), 12 * a, `rgba(255,${Math.round(180 + 60 * v)},${Math.round(90 + 80 * v)},${0.4 + 0.6 * v})`); } }
  };
  // a yurt in section: the crown (жоғары), the walls (төмен), the centre — o.labels = [[label, word, x, y]]
  GR.yurtSection = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const k = io(t, sh.start + 0.2, sh.start + 2.2), gy = BOT - 140, x0 = CX - 420, x1 = CX + 420;
    const pts = [[x0, gy], [x0, gy - 190], [CX - 120, gy - 420], [CX + 120, gy - 420], [x1, gy - 190], [x1, gy]];
    glowLine(c, pts, k, { lw: 5 });
    K.line(c, 200, gy, lerp(200, 1720, k), gy, 'rgba(226,182,89,0.6)', 2);
    for (let i = 0; i < 12; i++) { const q = i / 11; K.line(c, lerp(x0, CX - 120, 0) + (x1 - x0) * q, gy - 190, CX - 120 + 240 * q, gy - 420, 'rgba(226,182,89,0.35)', 1.5, clamp(k * 2 - 1)); }
    for (let i = 0; i < 16; i++) { const x = x0 + (x1 - x0) * i / 15; K.line(c, x, gy, x + 40, gy - 190, 'rgba(226,182,89,0.25)', 1.5, clamp(k * 2 - 1)); }
    K.line(c, CX, gy - 430, CX, gy, 'rgba(255,231,176,0.5)', 2, clamp(k * 2 - 1));
    (o.labels || []).forEach(([s, w, x, y]) => { const tw = at(sh.id, w), a = uu(t, tw - 0.1, tw + 0.5); if (a > 0) K.alpha(c, a, () => { K.circle(c, x, y, 9, PALE); big(c, s, x + 30, y - 36, { size: 30, align: 'left', spacing: 3 }); }); });
  };
  // routes between camps across the steppe, with what travels along them. o.chips = [[label, word]]
  GR.routes = (o = {}) => (c, t, sh) => {
    BG.photo('undp_altyn', 0.62)(c, t, sh);
    const P = [[300, TOP + 560], [700, TOP + 320], [1150, TOP + 520], [1600, TOP + 240]], names = ['ҚЫСТАУ', 'КӨКТЕУ', 'ЖАЙЛАУ', 'КҮЗЕУ'];
    const pts = []; for (let i = 0; i < P.length - 1; i++) for (let q = 0; q <= 40; q++) { const s = q / 40; pts.push([lerp(P[i][0], P[i + 1][0], s), lerp(P[i][1], P[i + 1][1], s) - Math.sin(Math.PI * s) * 60]); }
    const k = io(t, sh.start + 0.2, sh.start + 2.6);
    c.save(); c.setLineDash([12, 12]); glowLine(c, pts, k, { lw: 4 }); c.restore();
    P.forEach(([x, y], i) => { const a = uu(t, sh.start + 0.2 + i * 0.7, sh.start + 0.7 + i * 0.7); K.alpha(c, a, () => { K.yurt(c, x, y + 6, 0.32, '#EFE6D2', '#F7F1E3', RED); caps(c, names[i], x, y + 50, { size: 22, color: PALE }); }); });
    if (k >= 1) { const q = pts[Math.floor(((t - sh.start) * 30) % pts.length)]; K.glow(c, q[0], q[1], 50, 'rgba(255,220,150,0.9)'); K.circle(c, q[0], q[1], 8, '#FFF4DC'); }
    if (o.chips) OV.chipsAt(c, t, o.chips.map(([s, w, lid]) => [s, at(lid || sh.id, w)]), { y: BOT - 90, until: sh.end + 1 });
  };
  // the map of Kazakhstan with place names and what each name keeps. o.places = [[name, meaning, lon, lat, spoken word, line id]]
  GR.kzMap = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh, 'undp_altyn');
    const rings = (globalThis.GEO && GEO.world && GEO.world.Kazakhstan) || [];
    const lon0 = 46, lon1 = 88, lat0 = 40, lat1 = 56, mx = 300, my = TOP + 70, mw = 1320, mh = 680;
    const sx = mw / (lon1 - lon0), sy = mh / (lat1 - lat0), s = Math.min(sx, sy * 1.25);
    const X = (lon) => mx + (lon - lon0) * s, Y = (lat) => my + (lat1 - lat) * s / 1.25 * 1.0;
    const k = io(t, sh.start + 0.2, sh.start + 2.2);
    rings.forEach((r) => { const pts = []; for (let i = 0; i < r.length; i += 2) pts.push([X(r[i]), Y(r[i + 1])]); c.save(); c.fillStyle = `rgba(226,182,89,${0.12 * k})`; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.restore(); glowLine(c, pts, k, { lw: 2.5, glow: 6 }); });
    (o.places || []).forEach(([name, meaning, lon, lat, w, lid]) => {
      const tw = w ? at(lid || sh.id, w) : sh.start + 1, a = uu(t, tw - 0.1, tw + 0.5); if (a <= 0) return;
      const x = X(lon), y = Y(lat);
      K.alpha(c, a, () => { K.glow(c, x, y, 40, 'rgba(255,220,150,0.9)'); K.circle(c, x, y, 7, PALE); K.text(c, name, x + 14, y - 16, { size: 28, weight: 800, align: 'left', shadow: 14 }); if (meaning) K.text(c, meaning, x + 14, y + 16, { size: 20, weight: 400, italic: true, align: 'left', color: PALE, shadow: 10 }); });
    });
  };

  // ============ DESIGN ============
  // copying versus adapting: on the left the same pattern stamped again and again; on the right it is studied
  GR.compare = (o = {}) => (c, t, sh) => {
    BG.paper(c);
    const a = sh.start + 0.2, tl = o.left ?? a + 0.4, tr = o.right ?? a + 2;
    K.line(c, CX, TOP + 40, CX, BOT - 40, 'rgba(90,70,40,0.35)', 2);
    K.alpha(c, uu(t, tl - 0.2, tl + 0.4), () => {
      K.text(c, 'ТІКЕЛЕЙ КӨШІРУ', CX - 480, TOP + 70, { size: 30, weight: 800, color: INK, spacing: 4 });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const s = uu(t, tl + 0.2 + (i + j * 3) * 0.18, tl + 0.5 + (i + j * 3) * 0.18); if (s > 0) K.alpha(c, s, () => K.horns(c, CX - 760 + i * 280, CY - 120 + j * 260, 110, '#7A1F1B', 4, 1)); }
      if (o.leftNote) K.text(c, o.leftNote, CX - 480, BOT - 60, { size: 24, italic: true, color: '#5A4630', alpha: uu(t, tl + 1.4, tl + 2) });
    });
    K.alpha(c, uu(t, tr - 0.2, tr + 0.4), () => {
      K.text(c, 'БЕЙІМДЕУ', CX + 480, TOP + 70, { size: 30, weight: 800, color: INK, spacing: 4 });
      const x = CX + 480, y = CY - 40;
      K.horns(c, x, y - 120, 200, '#7A1F1B', 4, 1);
      const notes = o.notes || [];
      notes.forEach(([s, w, dx, dy], i) => { const tw = at(sh.id, w), q = uu(t, tw - 0.1, tw + 0.5); if (q <= 0) return; K.alpha(c, q, () => { K.line(c, x + dx * 0.55, y + dy * 0.55, x + dx, y + dy, '#B58D4A', 2); K.text(c, s, x + dx + (dx > 0 ? 10 : -10), y + dy, { size: 22, weight: 700, align: dx > 0 ? 'left' : 'right', color: '#5A4630' }); }); });
      if (o.result) { const q = uu(t, o.result, o.result + 0.8); K.alpha(c, q, () => { box(c, x - 120, BOT - 260, 240, 240, 46, NAVY, null); hornsGeo(c, x, BOT - 230, 130, '#E8C46A', 12); K.text(c, 'авторлық шешім', x, BOT - 36, { size: 24, italic: true, color: '#5A4630' }); }); }
    });
  };
  // a module studied like a technical drawing; o.notes = [[label, word, kind]] kind: size|gap|dir|angle|joint
  GR.module = (o = {}) => (c, t, sh) => {
    BG.paper(c);
    const x = CX - 160, y = CY - 40, s = 230, a = sh.start + 0.2;
    c.save(); c.strokeStyle = 'rgba(90,70,40,0.25)'; c.lineWidth = 1; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(x + i * 60, TOP + 40); c.lineTo(x + i * 60, BOT - 40); c.stroke(); c.beginPath(); c.moveTo(200, y + i * 60); c.lineTo(1720, y + i * 60); c.stroke(); } c.restore();
    K.horns(c, x, y - s * 0.6, s, '#7A1F1B', 5, io(t, a, a + 1.4));
    K.horns(c, x + 330, y - s * 0.6, s, 'rgba(122,31,27,0.45)', 4, io(t, a + 0.8, a + 2));
    (o.notes || []).forEach(([lab, w, kind], i) => {
      const tw = at(sh.id, w), q = uu(t, tw - 0.1, tw + 0.6); if (q <= 0) return;
      K.alpha(c, q, () => {
        c.save(); c.strokeStyle = '#B58D4A'; c.fillStyle = '#B58D4A'; c.lineWidth = 2;
        if (kind === 'size') { K.line(c, x - 130, y + 170, x + 130, y + 170, '#B58D4A', 2); arrowHead(c, x - 130, y + 170, Math.PI, 8, '#B58D4A'); arrowHead(c, x + 130, y + 170, 0, 8, '#B58D4A'); }
        if (kind === 'gap') { K.line(c, x + 130, y + 120, x + 200, y + 120, '#B58D4A', 2); arrowHead(c, x + 130, y + 120, Math.PI, 8, '#B58D4A'); arrowHead(c, x + 200, y + 120, 0, 8, '#B58D4A'); }
        if (kind === 'dir') { K.line(c, x - 220, y - 220, x + 560, y - 220, '#B58D4A', 2); arrowHead(c, x + 560, y - 220, 0, 12, '#B58D4A'); }
        if (kind === 'angle') { c.beginPath(); c.arc(x, y + 60, 90, -Math.PI / 2, -Math.PI / 2 + 0.7); c.stroke(); }
        if (kind === 'joint') { K.circle(c, x + 165, y - 40, 12, null, '#B58D4A', 3); K.circle(c, x - 165, y - 40, 12, null, '#B58D4A', 3); }
        if (kind === 'sym') { c.setLineDash([8, 8]); c.beginPath(); c.moveTo(x, y - 260); c.lineTo(x, y + 200); c.stroke(); }
        c.restore();
        K.text(c, lab, 1330, TOP + 140 + i * 66, { size: 28, weight: 700, align: 'left', color: INK });
        K.circle(c, 1310, TOP + 140 + i * 66, 7, '#B58D4A');
      });
    });
    if (o.title) K.text(c, o.title, CX, TOP + 60, { size: 30, weight: 800, color: INK, spacing: 6, alpha: uu(t, a, a + 0.6) });
  };
  // the ways of stylizing one motif, six panels; o.times = when each is named; o.focus = enlarge one
  const STY = [
    ['ЫҚШАМДАУ', (c, x, y, s) => { K.horns(c, x, y - s * 0.45, s * 0.8, '#E8C46A', 5, 1); }],
    ['ГЕОМЕТРИЯЛАУ', (c, x, y, s) => hornsGeo(c, x, y - s * 0.45, s * 0.8, '#E8C46A', 6)],
    ['МАСШТАБТАУ', (c, x, y, s, t) => { const z = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.5)); K.horns(c, x, y - s * z * 0.6, s * z, '#E8C46A', 4, 1); c.save(); c.strokeStyle = 'rgba(255,231,176,0.5)'; c.strokeRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 1.1); c.restore(); }],
    ['ФРАГМЕНТТЕУ', (c, x, y, s) => { c.save(); c.beginPath(); c.rect(x - s * 0.55, y - s * 0.55, s * 0.6, s * 0.6); c.clip(); K.horns(c, x + s * 0.2, y - s * 0.9, s * 1.6, '#E8C46A', 6, 1); c.restore(); c.save(); c.strokeStyle = 'rgba(255,231,176,0.5)'; c.setLineDash([5, 6]); c.strokeRect(x - s * 0.55, y - s * 0.55, s * 0.6, s * 0.6); c.restore(); }],
    ['АБСТРАКЦИЯЛАУ', (c, x, y, s) => { K.circle(c, x - s * 0.25, y - s * 0.2, s * 0.16, '#E8C46A'); K.circle(c, x + s * 0.25, y - s * 0.2, s * 0.16, '#E8C46A'); K.rect(c, x - 4, y - s * 0.1, 8, s * 0.5, '#E8C46A'); }],
    ['ДЕКОНСТРУКЦИЯЛАУ', (c, x, y, s, t) => { for (let i = 0; i < 4; i++) { const dx = (i % 2 ? 1 : -1) * (10 + 10 * Math.sin(t + i)), dy = (i < 2 ? -1 : 1) * 10; c.save(); c.beginPath(); c.rect(x + (i % 2 ? 0 : -s * 0.55), y + (i < 2 ? -s * 0.55 : 0), s * 0.55, s * 0.55); c.clip(); K.horns(c, x + dx, y - s * 0.45 + dy, s * 0.8, '#E8C46A', 5, 1); c.restore(); } }],
  ];
  GR.stylize = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const f = o.focus, fk = f !== undefined ? io(t, sh.start, sh.start + 0.8) : 0;
    STY.forEach(([name, draw], i) => {
      const tw = o.times ? o.times[i] : sh.start, a = uu(t, tw - 0.2, tw + 0.5); if (a <= 0 && f !== i) return;
      const gx = CX + ((i % 3) - 1) * 520, gy = CY + (i < 3 ? -170 : 190);
      const x = f === i ? lerp(gx, CX - 260, fk) : gx, y = f === i ? lerp(gy, CY, fk) : gy, s = f === i ? lerp(190, 380, fk) : 190;
      K.alpha(c, f !== undefined && f !== i ? lerp(1, 0.07, fk) : Math.max(a, f === i ? 1 : 0), () => {
        box(c, x - s * 0.75, y - s * 0.75, s * 1.5, s * 1.5, 18, 'rgba(8,14,34,0.7)', 'rgba(226,182,89,0.5)', 2);
        draw(c, x, y, s, t);
        K.text(c, name, x, y + s * 0.75 + 30, { size: f === i ? 34 : 22, weight: 800, spacing: 3, color: '#FFFFFF', shadow: 12 });
      });
    });
    if (f !== undefined && o.note) small(c, o.note, CX + 360, CY, { size: 30, align: 'left', alpha: uu(t, sh.start + 0.8, sh.start + 1.4) });
    if (o.allCheck) STY.forEach((_, i) => check(c, CX + ((i % 3) - 1) * 520 + 120, CY + (i < 3 ? -170 : 190) - 120, 16, uu(t, o.allCheck + i * 0.15, o.allCheck + 0.6 + i * 0.15)));
  };
  // colour: the traditional palette, then variations that keep harmony and contrast
  GR.palette = (o = {}) => (c, t, sh) => {
    BG.paper(c);
    const base = ['#B8322A', '#0B1A44', '#E2B659', '#F3EAD2', '#2E6B4F'];
    const vars = [['#8E2A22', '#1D2F63', '#C99A3E', '#FBF4E6', '#456F5C'], ['#D9603B', '#264653', '#E9C46A', '#F4F1DE', '#2A9D8F'], ['#3D2C2E', '#7A6C5D', '#C9B79C', '#F2EFE9', '#9A8873']];
    const row = (cols, y, a, label) => K.alpha(c, a, () => { cols.forEach((col, i) => box(c, CX - 470 + i * 190, y, 170, 110, 14, col, 'rgba(0,0,0,0.15)', 1)); if (label) K.text(c, label, CX - 520, y + 55, { size: 24, weight: 700, align: 'right', color: INK }); });
    row(base, TOP + 90, uu(t, sh.start + 0.2, sh.start + 0.8), 'дәстүрлі');
    vars.forEach((v, i) => row(v, TOP + 250 + i * 150, uu(t, (o.vars ?? sh.start + 1.5) + i * 0.5, (o.vars ?? sh.start + 1.5) + 0.6 + i * 0.5), ['киіз', 'мата', 'цифрлық'][i]));
    if (o.notes) o.notes.forEach(([s, w], i) => { const tw = at(sh.id, w); K.text(c, s, 1620, TOP + 200 + i * 70, { size: 28, weight: 800, color: INK, alpha: uu(t, tw - 0.1, tw + 0.5) }); });
  };
  // the same motif in four materials: felt (bold), cloth (repeat), wood (carved), metal (fine lines)
  const MAT = [
    ['КИІЗ', (c, x, y, s) => { box(c, x - s, y - s, 2 * s, 2 * s, 20, '#7A1F1B', null); K.horns(c, x, y - s * 0.7, s * 1.1, '#F3EAD2', 22, 1); }],
    ['МАТА', (c, x, y, s) => { box(c, x - s, y - s, 2 * s, 2 * s, 20, '#203A6B', null); c.save(); c.beginPath(); c.rect(x - s, y - s, 2 * s, 2 * s); c.clip(); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) K.horns(c, x + i * s * 0.5, y + j * s * 0.5 - 22, 40, '#E8C46A', 3, 1); c.restore(); }],
    ['АҒАШ', (c, x, y, s) => { box(c, x - s, y - s, 2 * s, 2 * s, 20, '#8B5A2B', null); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 6; c.shadowOffsetX = 4; c.shadowOffsetY = 4; K.horns(c, x, y - s * 0.7, s * 1.1, '#5E3A17', 16, 1); c.restore(); K.horns(c, x - 2, y - s * 0.7 - 2, s * 1.1, '#B07A43', 6, 1); }],
    ['МЕТАЛЛ', (c, x, y, s) => { c.save(); c.fillStyle = K.grad(c, x - s, y - s, x + s, y + s, [[0, '#9A9A9A'], [0.5, '#E6E6E6'], [1, '#8A8A8A']]); c.beginPath(); c.roundRect(x - s, y - s, 2 * s, 2 * s, 20); c.fill(); c.restore(); K.horns(c, x, y - s * 0.7, s * 1.1, '#4A4A4A', 2.5, 1); }],
  ];
  GR.materials = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    MAT.forEach(([name, draw], i) => {
      const tw = sh.start + 0.3 + i * 0.4, a = uu(t, tw - 0.2, tw + 0.5); if (a <= 0) return;
      const seqLive = o.seq ? o.seq[i] >= 0 && t >= o.seq[i] - 0.2 && (i === 3 || !(o.seq[i + 1] >= 0) || t < o.seq[i + 1] - 0.2) : false;
      const live = o.focus ? o.focus.includes(i) : seqLive, anyLive = o.focus || (o.seq && o.seq.some((q, j) => q >= 0 && t >= q - 0.2));
      const x = CX + (i - 1.5) * 410, y = CY - 20, s = live ? 168 : 150;
      K.alpha(c, a * (anyLive && !live ? 0.4 : 1), () => { draw(c, x, y, s); K.text(c, name, x, y + s + 44, { size: 30, weight: 800, spacing: 4, color: live ? PALE : '#FFFFFF', shadow: 12 }); if (o.notes && o.notes[i]) small(c, o.notes[i], x, y + s + 84, { size: 22, italic: true }); });
    });
    if (o.cross !== undefined) { const k = uu(t, o.cross, o.cross + 0.6); MAT.forEach((_, i) => H.cross(c, CX + (i - 1.5) * 410 + 120, CY - 140, 18, k)); }
  };
  // a coat (шапан) with ornament along the places the text names; o.parts = [[part, word]] part: fabric|embroidery|seam|hem|sleeve|belt|lines
  GR.garment = (o = {}) => (c, t, sh) => {
    BG.paper(c);
    const x = CX - 200, y = TOP + 90, sw = Math.sin((t - sh.start) * 1.4) * (o.sway ? 6 : 0);
    const body = [[x - 140, y + 40], [x - 330, y + 210], [x - 260, y + 290], [x - 160, y + 200], [x - 170, y + 720], [x + 170, y + 720], [x + 160, y + 200], [x + 260, y + 290], [x + 330, y + 210], [x + 140, y + 40], [x + 50, y + 20], [x, y + 110], [x - 50, y + 20]];
    c.save(); c.translate(sw, 0); K.poly(c, body, '#1D2F63', '#0B1A44', 3);
    const on = (p) => { const r = (o.parts || []).find((q) => q[0] === p); return r ? uu(t, at(sh.id, r[1]) - 0.1, at(sh.id, r[1]) + 0.6) : 0; };
    const band = (pts, k) => { if (k <= 0) return; c.save(); c.strokeStyle = '#E8C46A'; c.lineWidth = 10; c.globalAlpha = k; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke(); c.restore(); };
    if (on('fabric') > 0) K.alpha(c, on('fabric') * 0.5, () => { c.save(); c.beginPath(); body.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.clip(); for (let i = -4; i <= 4; i++) for (let j = 0; j < 8; j++) K.horns(c, x + i * 90, y + 60 + j * 90, 34, '#3A5A9B', 2, 1); c.restore(); });
    band([[x - 170, y + 700], [x + 170, y + 700]], on('hem'));
    band([[x - 330, y + 210], [x - 260, y + 290]], on('sleeve')); band([[x + 330, y + 210], [x + 260, y + 290]], on('sleeve'));
    band([[x - 165, y + 420], [x + 165, y + 420]], on('belt'));
    band([[x - 50, y + 20], [x, y + 110], [x, y + 700]], on('seam'));
    if (on('embroidery') > 0) K.alpha(c, on('embroidery'), () => { K.horns(c, x - 80, y + 230, 60, '#E8C46A', 4, 1); K.horns(c, x + 80, y + 230, 60, '#E8C46A', 4, 1); });
    if (on('lines') > 0) K.alpha(c, on('lines'), () => { c.save(); c.setLineDash([8, 8]); c.strokeStyle = '#E8C46A'; c.lineWidth = 3; c.beginPath(); body.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.stroke(); c.restore(); });
    c.restore();
    (o.parts || []).forEach(([p, w, label], i) => { const tw = at(sh.id, w); K.text(c, label || p, 1180, TOP + 130 + i * 76, { size: 32, weight: 800, align: 'left', color: INK, alpha: uu(t, tw - 0.1, tw + 0.5) }); K.circle(c, 1150, TOP + 130 + i * 76, 8 * uu(t, tw, tw + 0.4), '#B58D4A'); });
  };
  // a room in perspective; the ornament runs along floor, walls, ceiling, furniture and light; o.parts = [[part, word, label]]
  GR.room = (o = {}) => (c, t, sh) => {
    c.fillStyle = '#E9E1D0'; c.fillRect(0, 0, W, 1080);
    const vx = CX, vy = CY - 20, fx0 = 360, fx1 = 1560, by = BOT - 40, ty = TOP + 30, bx0 = CX - 300, bx1 = CX + 300, bby = vy + 170, bty = vy - 170;
    K.poly(c, [[fx0, by], [fx1, by], [bx1, bby], [bx0, bby]], '#CBBFA6'); K.poly(c, [[fx0, ty], [fx1, ty], [bx1, bty], [bx0, bty]], '#F4EFE4');
    K.poly(c, [[fx0, ty], [bx0, bty], [bx0, bby], [fx0, by]], '#DDD3BF'); K.poly(c, [[fx1, ty], [bx1, bty], [bx1, bby], [fx1, by]], '#DDD3BF'); K.rect(c, bx0, bty, bx1 - bx0, bby - bty, '#E6DDCB');
    const on = (p) => { const r = (o.parts || []).find((q) => q[0] === p); return r ? uu(t, at(sh.id, r[1]) - 0.1, at(sh.id, r[1]) + 0.7) : 0; };
    const k = io(t, sh.start + 0.3, sh.start + 2);
    if (on('floor') > 0 || o.path) { const a = Math.max(on('floor'), o.path ? uu(t, o.path, o.path + 0.8) : 0); K.alpha(c, a, () => { for (let i = 0; i < 9; i++) { const q = i / 8, x = lerp(CX - 60, CX, q), yy = lerp(by - 30, bby + 10, q), s = lerp(60, 14, q); K.horns(c, x, yy - s * 0.6, s, '#7A1F1B', 3, 1); } }); }
    if (on('wall') > 0) K.alpha(c, on('wall'), () => { for (let i = 0; i < 6; i++) { const q = i / 5; K.horns(c, lerp(fx0 + 40, bx0 - 10, q), lerp(TOP + 300, bty + 120, q), lerp(70, 26, q), '#1D2F63', 3, 1); } });
    if (on('ceiling') > 0) K.alpha(c, on('ceiling'), () => { glowLine(c, circlePts(CX, (ty + bty) / 2, 90), 1, { lw: 4, color: '#B58D4A', glow: 0 }); });
    if (on('furniture') > 0) K.alpha(c, on('furniture'), () => { K.rect(c, CX + 120, by - 210, 300, 150, '#8B5A2B'); K.horns(c, CX + 270, by - 190, 60, '#E8C46A', 4, 1); });
    if (on('light') > 0) K.alpha(c, on('light'), () => { K.glow(c, CX - 260, TOP + 190, 160, 'rgba(255,200,120,0.8)'); for (let i = 0; i < 4; i++) { c.save(); c.translate(CX - 260, TOP + 190); c.rotate(i * Math.PI / 2); hornsUp(c, 40, '#B58D4A', 3, 1); c.restore(); } });
    void k;
    (o.parts || []).forEach(([p, w, label], i) => { const tw = at(sh.id, w); K.text(c, label, 1640, TOP + 120 + i * 70, { size: 30, weight: 800, align: 'left', color: INK, alpha: uu(t, tw - 0.1, tw + 0.5) }); });
  };
  // a mark at many sizes, in colour and in black and white
  GR.logo = (o = {}) => (c, t, sh) => {
    BG.paper(c);
    const a = sh.start + 0.2;
    [[420, 300], [220, 150], [110, 75], [56, 38]].forEach(([s], i) => { const x = [330, 690, 920, 1060][i], y = CY - 30, q = uu(t, a + i * 0.4, a + 0.5 + i * 0.4); K.alpha(c, q, () => { box(c, x - s / 2, y - s / 2, s, s, s * 0.18, NAVY, null); hornsGeo(c, x, y - s * 0.32, s * 0.55, '#E8C46A', Math.max(2, s * 0.05)); }); });
    if (o.bw) { const q = uu(t, o.bw, o.bw + 0.6); K.alpha(c, q, () => { box(c, 1300, CY - 180, 300, 300, 54, '#111', null); hornsGeo(c, 1450, CY - 130, 170, '#FFF', 14); box(c, 1640, CY - 80, 150, 150, 26, '#FFF', '#111', 3); hornsGeo(c, 1715, CY - 56, 84, '#111', 7); K.text(c, 'қара-ақ', 1540, CY + 170, { size: 26, italic: true, color: '#5A4630' }); }); }
    if (o.labels) o.labels.forEach(([s, w], i) => { const tw = at(sh.id, w); K.text(c, s, 300 + i * 300, BOT - 70, { size: 26, weight: 800, color: INK, alpha: uu(t, tw - 0.1, tw + 0.5) }); });
  };
  // a phone: the pattern as a moving background, a loading mark, a screen-to-screen passage, a button. o.states = [[state, word]]
  GR.phone = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const x = CX - 360, y = CY + 10, pw = 330, ph = 680;
    box(c, x - pw / 2 - 14, y - ph / 2 - 14, pw + 28, ph + 28, 54, '#111', '#444', 2);
    c.save(); c.beginPath(); c.roundRect(x - pw / 2, y - ph / 2, pw, ph, 42); c.clip();
    c.fillStyle = '#F4EFE4'; c.fillRect(x - pw / 2, y - ph / 2, pw, ph);
    const st = (o.states || []).reduce((acc, [s, w]) => (t >= at(sh.id, w) - 0.2 ? s : acc), o.states ? o.states[0][0] : 'bg');
    if (st === 'bg' || st === 'all') for (let i = -1; i < 5; i++) for (let j = -1; j < 9; j++) K.horns(c, x - pw / 2 + i * 80 + ((t * 20) % 80), y - ph / 2 + j * 80 + 10, 30, 'rgba(29,47,99,0.25)', 2, 1);
    if (st === 'load') { c.save(); c.translate(x, y); c.rotate(t * 3); for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); hornsUp(c, 38, '#1D2F63', 4, 1); c.restore(); } c.restore(); K.text(c, 'жүктелуде…', x, y + 90, { size: 22, color: '#1D2F63' }); }
    if (st === 'path') { const p = H.spiralPts(x, y, 120, 2.2, t * 0.5, 200); glowLine(c, p, 1, { lw: 4, color: '#1D2F63', glow: 0 }); const q = p[Math.floor((t * 60) % 200)]; K.circle(c, q[0], q[1], 10, '#B8322A'); }
    if (st === 'pass') { const k = ((t - sh.start) * 0.6) % 1; c.save(); c.fillStyle = '#1D2F63'; c.beginPath(); c.arc(x, y, k * 520, 0, Math.PI * 2); c.fill(); c.restore(); }
    if (st === 'text' || st === 'all') { K.rect(c, x - pw / 2 + 30, y - 120, pw - 60, 18, '#2A2118'); for (let i = 0; i < 6; i++) K.rect(c, x - pw / 2 + 30, y - 80 + i * 26, (pw - 60) * (0.6 + 0.4 * U.hash(i, 3)), 10, 'rgba(42,33,24,0.55)'); }
    if (st === 'button' || st === 'all') { box(c, x - 110, y + 170, 220, 64, 32, '#1D2F63', null); hornsGeo(c, x, y + 180, 34, '#E8C46A', 3); const r = ((t * 1.2) % 1); c.save(); c.strokeStyle = `rgba(29,47,99,${1 - r})`; c.lineWidth = 3; c.beginPath(); c.arc(x + 40, y + 202, r * 70, 0, Math.PI * 2); c.stroke(); c.restore(); }
    c.restore();
    (o.labels || []).forEach(([s, w], i) => { const tw = at(sh.id, w); K.text(c, s, CX + 40, TOP + 170 + i * 90, { size: 34, weight: 800, align: 'left', alpha: uu(t, tw - 0.1, tw + 0.5), shadow: 14 }); });
  };
  // parametric design: modules on a grid, steered by numbers that change as they are named
  GR.parametric = (o = {}) => (c, t, sh) => {
    c.fillStyle = '#0A1330'; c.fillRect(0, 0, W, 1080);
    const w = (x) => at(sh.id, x), t1 = w(o.w1 || 'модуль'), t2 = w(o.w2 || 'қайталану'), t3 = w(o.w3 || 'аралығы'), t4 = w(o.w4 || 'айналу');
    const v = (ta, f) => (0.5 + 0.5 * Math.sin((t - ta) * f)) * uu(t, ta, ta + 0.5);
    const size = lerp(70, 104, v(t1, 1.6)), count = Math.round(lerp(10, 6, v(t2, 1.2))), gapX = lerp(1.5, 1.15, v(t3, 1.3)) * size, ang = (Math.PI / 4) * v(t4, 1.5);
    c.save(); c.beginPath(); c.rect(0, TOP, 1380, BOT - TOP); c.clip();
    const rows = 5, rh = (BOT - TOP) / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < count; i++) { const x = 90 + i * gapX, y = TOP + j * rh + rh * 0.2, odd = (i + j) % 2; if (x > 1360) continue; c.save(); c.translate(x, y + size * 0.45); c.rotate(ang * (odd ? 1 : -1)); hornsGeo(c, 0, -size * 0.45, size, odd ? '#E8C46A' : '#7FD3FF', 3); c.restore(); }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(1400, TOP + 30, 460, BOT - TOP - 60);
    const row = (k, s, val, ta) => { const a = uu(t, ta - 0.1, ta + 0.4); K.text(c, s, 1440, TOP + 110 + k * 170, { size: 24, weight: 700, align: 'left', color: '#9FB7E0', alpha: 0.5 + 0.5 * a }); K.text(c, val, 1440, TOP + 162 + k * 170, { size: 42, weight: 800, align: 'left', color: a > 0.5 ? '#FFFFFF' : '#5E7194' }); };
    row(0, 'МОДУЛЬ ӨЛШЕМІ', `${Math.round(size)} px`, t1); row(1, 'ҚАЙТАЛАНУ САНЫ', `${count}`, t2); row(2, 'АРАЛЫҒЫ', `${Math.round(gapX)} px`, t3); row(3, 'АЙНАЛУ БҰРЫШЫ', `${Math.round(ang * 180 / Math.PI)}°`, t4);
  };
  // variants found by a machine; the designer chooses one
  GR.ai = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const pals = [['#B8322A', '#E8C46A'], ['#1D2F63', '#7FD3FF'], ['#2E6B4F', '#F3EAD2'], ['#3D2C2E', '#C9B79C'], ['#D9603B', '#264653'], ['#0B1A44', '#E2B659'], ['#8E2A22', '#FBF4E6'], ['#456F5C', '#E9C46A']];
    const pick = o.pick ? uu(t, o.pick, o.pick + 0.8) : 0;
    for (let i = 0; i < 8; i++) {
      const x = CX - 690 + (i % 4) * 460, y = CY - 170 + Math.floor(i / 4) * 340, q = uu(t, sh.start + 0.3 + i * 0.25, sh.start + 0.7 + i * 0.25); if (q <= 0) continue;
      K.alpha(c, q * (pick && i !== 5 ? 1 - 0.65 * pick : 1), () => { box(c, x - 150, y - 140, 300, 280, 20, pals[i][0], i === 5 && pick ? '#FFF' : null, 4); const rot = U.hash(i, 4) * Math.PI; c.save(); c.translate(x, y + 10); c.rotate(o.vary ? rot * uu(t, o.vary, o.vary + 1) : 0); hornsGeo(c, 0, -70, 120, pals[i][1], 8); c.restore(); });
    }
    caps(c, 'ЖАСАНДЫ ИНТЕЛЛЕКТ · НҰСҚАЛАР', CX, TOP + 60, { size: 26, alpha: uu(t, sh.start + 0.2, sh.start + 0.8) });
    if (pick) { check(c, CX + 240, CY + 30, 26, pick); caps(c, 'ДИЗАЙНЕРДІҢ ШЕШІМІ', CX, BOT - 50, { size: 26, alpha: pick }); }
  };
  // a museum label: where a pattern comes from. o.fields = [[key, value, spoken word]]
  OV.museumCard = (o = {}) => (c, t, sh) => {
    const ta = o.at ?? sh.start + 0.4, a = io(t, ta - 0.2, ta + 0.6), x = o.x ?? 1230, y = TOP + 140, fields = o.fields || [['Дереккөзі', 'музей, каталог'], ['Аймағы', '· · · · ·'], ['Кезеңі', '· · · · ·'], ['Материалы', 'киіз']];
    K.alpha(c, a, () => {
      const h = 110 + fields.length * 52;
      c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.fillStyle = 'rgba(246,240,226,0.96)'; c.fillRect(x, y, 540, h); c.restore();
      K.rect(c, x, y, 8, h, '#7A1F1B');
      K.text(c, o.title || 'Өрнек: қошқар мүйіз', x + 40, y + 58, { size: 30, weight: 800, align: 'left', color: INK });
      fields.forEach(([k, v, w], i) => { const q = w ? uu(t, at(sh.id, w) - 0.1, at(sh.id, w) + 0.4) : 1; K.text(c, k, x + 40, y + 118 + i * 52, { size: 24, weight: 700, align: 'left', color: '#7A5C3A', alpha: q }); K.text(c, v, x + 250, y + 118 + i * 52, { size: 24, weight: 400, align: 'left', color: INK, alpha: q }); });
    });
  };
  // a cross over something that must not be done
  OV.no = (o = {}) => (c, t, sh) => { const ta = o.at ?? sh.start + 1, k = uu(t, ta, ta + 0.6); if (k <= 0) return; c.save(); c.strokeStyle = `rgba(255,107,91,${0.9 * k})`; c.lineWidth = 12; c.beginPath(); c.arc(o.x ?? CX, o.y ?? CY, o.r ?? 200, 0, Math.PI * 2 * k); c.stroke(); if (k > 0.6) { c.beginPath(); c.moveTo((o.x ?? CX) - (o.r ?? 200) * 0.7, (o.y ?? CY) + (o.r ?? 200) * 0.7); c.lineTo((o.x ?? CX) + (o.r ?? 200) * 0.7, (o.y ?? CY) - (o.r ?? 200) * 0.7); c.stroke(); } c.restore(); };
  // a quotation card for a reference
  GR.quote = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const a = uu(t, sh.start + 0.2, sh.start + 0.8);
    K.alpha(c, a, () => {
      box(c, 280, TOP + 110, 1360, 580, 30, 'rgba(246,240,226,0.95)', null);
      K.text(c, '«', 360, TOP + 230, { size: 160, weight: 800, color: '#B58D4A' });
      wrap(c, o.text, 1100, 40, 700).forEach((ln, i) => K.text(c, ln, 440, TOP + 230 + i * 56, { size: 40, weight: 700, align: 'left', color: INK }));
      K.text(c, o.by, 440, BOT - 255, { size: 28, weight: 600, align: 'left', color: '#7A5C3A' });
      if (o.key) { const q = uu(t, at(sh.id, o.keyWord), at(sh.id, o.keyWord) + 0.6); box(c, 440, BOT - 222, textW(c, o.key, 30, 800, 4) + 50, 60, 30, '#0B1A44', null); K.text(c, o.key, 465 + textW(c, o.key, 30, 800, 4) / 2, BOT - 192, { size: 30, weight: 800, spacing: 4, color: '#E8C46A', alpha: q }); }
    });
  };
  // big words that mean one thing: «қашан?» = «қай жерде?» and similar pairs
  GR.equal = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const t1 = at(sh.id, o.w1), t2 = at(sh.id, o.w2), k = io(t, t2 + 0.6, t2 + 1.6);
    big(c, o.a, CX, CY - 60, { size: 84, alpha: uu(t, t1 - 0.1, t1 + 0.5), spacing: 6 });
    big(c, o.b, CX, CY + 70, { size: 84, alpha: uu(t, t2 - 0.1, t2 + 0.5), spacing: 6, color: PALE });
    K.rect(c, CX - 260 * k, CY + 8, 520 * k, 3, GOLD);
  };
  // a clock, a calendar and coordinates, which cannot explain the old time and space; then the sun and stars
  GR.clockVs = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    const ts = [at(sh.id, 'сағат'), at(sh.id, 'күнтізбе'), at(sh.id, 'координат')], xs = [CX - 520, CX, CX + 520];
    const draws = [
      (x, y) => { K.circle(c, x, y, 110, null, CREAM, 4); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; K.line(c, x + Math.cos(an) * 92, y + Math.sin(an) * 92, x + Math.cos(an) * 104, y + Math.sin(an) * 104, CREAM, 3); } K.line(c, x, y, x + Math.cos(t) * 70, y + Math.sin(t) * 70, CREAM, 4); K.line(c, x, y, x, y - 50, CREAM, 5); },
      (x, y) => { box(c, x - 120, y - 110, 240, 220, 14, null, CREAM, 3); K.rect(c, x - 120, y - 110, 240, 40, 'rgba(243,234,210,0.4)'); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) K.rect(c, x - 100 + i * 42, y - 52 + j * 38, 26, 24, 'rgba(243,234,210,0.5)'); },
      (x, y) => { K.line(c, x - 130, y, x + 130, y, CREAM, 2); K.line(c, x, y - 120, x, y + 120, CREAM, 2); K.text(c, '51° N', x + 10, y - 30, { size: 30, weight: 700, align: 'left', color: CREAM }); K.text(c, '71° E', x + 10, y + 30, { size: 30, weight: 700, align: 'left', color: CREAM }); },
    ];
    draws.forEach((d, i) => { const a = uu(t, ts[i] - 0.2, ts[i] + 0.4); if (a > 0) K.alpha(c, a, () => d(xs[i], CY)); });
    const nk = uu(t, at(sh.id, 'болмайды'), at(sh.id, 'болмайды') + 0.6); xs.forEach((x) => H.cross(c, x + 110, CY - 110, 22, nk));
  };
  // the parts of the text's structure: two columns of requirements (cultural / ethical)
  GR.columns = (o = {}) => (c, t, sh) => {
    BG.stage(c, t, sh);
    [[o.a, o.ai, CX - 440], [o.b, o.bi, CX + 440]].forEach(([head, items, x]) => {
      const th = at(sh.id, items[0][1]) - 0.6;
      big(c, head, x, TOP + 120, { size: 40, spacing: 6, alpha: uu(t, th, th + 0.6) });
      items.forEach(([s, w], i) => { const tw = at(sh.id, w); K.alpha(c, uu(t, tw - 0.1, tw + 0.5), () => { box(c, x - 300, TOP + 190 + i * 100, 600, 76, 38, 'rgba(8,14,34,0.8)', GOLD, 2); K.text(c, s, x, TOP + 228 + i * 100, { size: 28, weight: 700, color: '#FFFFFF' }); }); });
    });
  };
})();
