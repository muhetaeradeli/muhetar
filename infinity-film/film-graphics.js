// GRAPHICS: every drawing the film uses, as small painters. A painter is (c, t, sh) => void; sh is the shot it
// belongs to ({ id: the line it starts on, start, end, … }). Most are factories: GR.ring4({ … }) returns a painter.
// Everything is a pure function of t, drawn on the 1920×1080 stage inside the 2.35:1 picture area.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const { line: L } = SC;
  const { C, VIEW, IMG } = K;
  const W = G.W, H = G.H, CX = 960, CY = VIEW.y + VIEW.h / 2, TOP = VIEW.y, BOT = VIEW.y + VIEW.h;
  const CREAM = '#F3EAD2', GOLD = C.gold, PALE = '#FFE7B0', NAVY = '#0B1A44', RED = '#B8322A', INK = '#2A2118';
  const GR = {}, BG = {}, OV = {}, H_ = {};

  // ---------- time ----------
  // the moment a word is spoken inside a line (by its share of the characters)
  const at = (id, word) => { const l = L[id]; if (!l) return 0; if (!word) return l.t; const i = l.text.toLowerCase().indexOf(word.toLowerCase()); return l.t + l.dur * Math.max(0, i) / l.text.length; };
  const end = (id) => (L[id] ? L[id].end : 0);
  const win = (t, a, b, fi = 0.5, fo = 0.5) => K.win(t, a, b, fi, fo);
  const u = (t, a, b) => K.u(t, a, b), io = (t, a, b) => K.io(t, a, b);
  H_.at = at; H_.end = end; H_.win = win;

  // ---------- photographs ----------
  const blurCache = {};
  H_.blurred = (name, px) => {
    const k = name + px; if (blurCache[k]) return blurCache[k];
    const img = IMG[name]; if (!img) return null;
    const c = G.makeCanvas(Math.round(img.width / 2), Math.round(img.height / 2)), x = c.getContext('2d'); x.filter = `blur(${px / 2}px)`; x.drawImage(img, 0, 0, c.width, c.height);
    return (blurCache[k] = c);
  };
  H_.grade = (c, warm = 0.08, dark = 0.3) => {
    c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${warm})`; c.fillRect(0, 0, W, H); c.restore();
    c.fillStyle = K.grad(c, 0, TOP + VIEW.h * 0.55, 0, BOT, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${dark})`]]); c.fillRect(0, 0, W, H);
  };

  // ---------- backgrounds ----------
  // the felt «stage»: a carpet pattern, blurred and darkened, behind gold drawings
  const STAGE = ['c_pattern', 'k_syrmak', 'k_carpet', 'n2_shanband', 'n2_yurtband', 'k_feltrug', 'n2_yint3'];
  const pick = (id) => { let h = 7; for (const ch of String(id || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return STAGE[h % STAGE.length]; };
  BG.stage = (c, t, sh, img) => {
    img = img || (IMG[pick(sh.id)] ? pick(sh.id) : 'c_pattern');
    const b = H_.blurred(img, 5);
    if (b) G.kenBurns(c, b, 0, TOP, W, VIEW.h, t, sh.start - 2, sh.end + 2, { from: { zoom: 1.2, x: 0.45, y: 0.5 }, to: { zoom: 1.35, x: 0.55, y: 0.5 } });
    c.fillStyle = 'rgba(8,16,44,0.8)'; c.fillRect(0, 0, W, H);
    c.fillStyle = K.radial(c, CX, CY, 60, 820, [[0, 'rgba(255,200,120,0.13)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, W, H);
  };
  BG.paper = (c) => {
    c.fillStyle = '#EFE6D2'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(120,90,50,${0.02 + U.hash(i, 71) * 0.03})`; c.fillRect(U.hash(i, 72) * W, U.hash(i, 73) * H, 2, 2); }
    c.fillStyle = K.radial(c, CX, CY, 200, 1100, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(90,60,30,0.18)']]); c.fillRect(0, 0, W, H);
  };
  BG.night = (c, t, sh) => {
    const img = IMG.live_stars;
    if (img) G.kenBurns(c, img, 0, TOP, W, VIEW.h, t, sh.start - 2, sh.end + 2, { from: { zoom: 1.5, x: 0.5, y: 0.22 }, to: { zoom: 1.62, x: 0.48, y: 0.25 } });
    c.fillStyle = 'rgba(4,8,24,0.55)'; c.fillRect(0, 0, W, H);
  };
  BG.photo = (name, dim = 0.6, blur = 0) => (c, t, sh) => {
    const img = blur ? H_.blurred(name, blur) : IMG[name];
    if (img) G.kenBurns(c, img, 0, TOP, W, VIEW.h, t, sh.start - 2, sh.end + 2, { from: { zoom: 1.15, x: 0.5, y: 0.5 }, to: { zoom: 1.28, x: 0.5, y: 0.5 } });
    c.fillStyle = `rgba(6,12,30,${dim})`; c.fillRect(0, 0, W, H);
  };

  // ---------- type ----------
  const caps = (c, s, x, y, o = {}) => K.text(c, s, x, y, { size: 30, weight: 700, spacing: 10, color: GOLD, shadow: 16, ...o });
  const big = (c, s, x, y, o = {}) => K.text(c, s, x, y, { size: 60, weight: 800, spacing: 4, shadow: 28, ...o });
  const small = (c, s, x, y, o = {}) => K.text(c, s, x, y, { size: 26, weight: 400, color: CREAM, shadow: 12, ...o });
  H_.caps = caps; H_.big = big; H_.small = small;
  const textW = (c, s, size, weight = 700, spacing = 0) => { c.save(); c.font = `${weight} ${size}px ${K.SANS}`; c.letterSpacing = `${spacing}px`; const w = c.measureText(s).width; c.restore(); return w; };
  // wrap a string to lines no wider than w
  const wrap = (c, s, w, size, weight = 400) => { const out = []; let cur = ''; for (const word of s.split(' ')) { const n = cur ? cur + ' ' + word : word; if (cur && textW(c, n, size, weight) > w) { out.push(cur); cur = word; } else cur = n; } if (cur) out.push(cur); return out; };
  H_.wrap = wrap;

  // ---------- overlays: words that appear as they are spoken ----------
  // items: [[shown text, spoken word (in the line)], …]; layout 'stack' (left column), 'center' (one under another),
  // 'row' (across), 'chips' (pills along the bottom or top)
  OV.words = (id, items, o = {}) => (c, t) => {
    const until = o.until ?? end(o.untilId || id) + (o.hold ?? 0.6), layout = o.layout || 'center', size = o.size || 56;
    const n = items.length;
    if (layout === 'chips') return OV.chipsAt(c, t, items.map(([s, w]) => [s, at(o.idOf?.(w) || id, w)]), { y: o.y, until, size: o.size || 28 });
    items.forEach(([s, w], i) => {
      const tw = at(id, w), a = win(t, tw - 0.1, until, 0.45, 0.6); if (a <= 0) return;
      const k = K.out(t, tw - 0.1, tw + 0.6);
      if (layout === 'stack') {
        const y = (o.y ?? CY - (n - 1) * 46) + i * 92;
        K.rect(c, 140, y - 26, 6, 52 * k, GOLD);
        K.text(c, s, 168 + 24 * (1 - k), y, { size, weight: 800, align: 'left', alpha: a, shadow: 26 });
      } else if (layout === 'row') {
        const x = CX + (i - (n - 1) / 2) * (o.dx || 1700 / n), y = o.y ?? CY;
        big(c, s, x, y + 14 * (1 - k), { size, alpha: a, spacing: o.spacing ?? 4 });
      } else {
        const y = (o.y ?? CY - (n - 1) * (size * 0.85)) + i * size * 1.7;
        big(c, s, CX, y + 14 * (1 - k), { size, alpha: a, spacing: o.spacing ?? 6, color: o.color || '#FFFFFF' });
      }
    });
  };
  OV.chipsAt = (c, t, items, { y = BOT - 110, until = Infinity, size = 28 } = {}) => {
    const ws = items.map(([s]) => textW(c, s, size, 700, 3) + 50);
    const rows = []; let row = [], rw = 0;
    ws.forEach((w, i) => { if (rw + w > 1700 && row.length) { rows.push(row); row = []; rw = 0; } row.push(i); rw += w + 16; });
    if (row.length) rows.push(row);
    rows.forEach((r, ri) => {
      let x = CX - (r.reduce((a, i) => a + ws[i], 0) + 16 * (r.length - 1)) / 2;
      const yy = y - (rows.length - 1 - ri) * 72;
      r.forEach((i) => {
        const [s, ta] = items[i], a = K.win(t, ta, until, 0.35, 0.6), w = ws[i];
        if (a > 0) K.alpha(c, a, () => {
          const k = K.out(t, ta, ta + 0.5);
          c.save(); c.fillStyle = 'rgba(8,14,34,0.7)'; c.strokeStyle = GOLD; c.lineWidth = 2;
          c.beginPath(); c.roundRect(x, yy - 29 + 10 * (1 - k), w, 58, 29); c.fill(); c.stroke(); c.restore();
          K.text(c, s, x + w / 2, yy + 10 * (1 - k), { size, weight: 700, spacing: 3, color: CREAM });
        });
        x += w + 16;
      });
    });
  };
  OV.chips = (id, items, o = {}) => (c, t) => OV.chipsAt(c, t, items.map(([s, w, lid]) => [s, at(lid || id, w)]), { y: o.y ?? BOT - 110, until: o.until ?? end(o.untilId || id) + 0.6, size: o.size || 28 });
  OV.label = (title, sub, o = {}) => (c, t, sh) => K.label(c, t, sh.start + 0.5, sh.end - 0.2, title, sub || '', o);

  // ---------- small drawings ----------
  const glowLine = (c, pts, k, { color = 'rgba(255,224,160,0.95)', lw = 4, close = false, glow = 14 } = {}) => {
    if (k <= 0 || pts.length < 2) return;
    const n = Math.max(2, Math.floor(pts.length * clamp(k)));
    c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(255,190,90,0.8)'; c.shadowBlur = glow;
    c.beginPath(); for (let i = 0; i < n; i++) { if (i) c.lineTo(pts[i][0], pts[i][1]); else c.moveTo(pts[i][0], pts[i][1]); }
    if (close && k >= 1) c.closePath();
    c.stroke(); c.restore();
  };
  const star = (c, x, y, r, a = 1) => { if (a <= 0) return; K.glow(c, x, y, r * 7, 'rgba(255,240,210,0.9)', a * 0.6); K.circle(c, x, y, r, `rgba(255,250,235,${a})`); };
  const hornsUp = (c, s, color = GOLD, lw = 8, k = 1) => K.horns(c, 0, -s, s, color, lw, k);
  function hornsGeo(c, x, y, s, color, lw) {
    c.save(); c.translate(x, y); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round';
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 0.08 * s, 0.9 * s); c.lineTo(sd * 0.08 * s, 0.1 * s);
      if (sd > 0) c.arc(0.42 * s, 0.1 * s, 0.34 * s, Math.PI, 0.5 * Math.PI, false); else c.arc(-0.42 * s, 0.1 * s, 0.34 * s, 0, 0.5 * Math.PI, true);
      c.stroke(); c.beginPath(); c.arc(sd * 0.42 * s, 0.1 * s, 0.13 * s, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
  }
  function scroll(c, y, A, w, t, { color = GOLD, lw = 5, speed = 36, k = 1, dir = 1, x0 = -40, x1 = W + 40 } = {}) {
    const off = ((t * speed * dir) % (2 * w) + 2 * w) % (2 * w), xEnd = lerp(x0, x1, k);
    c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    for (let x = x0; x <= xEnd; x += 6) { const y0 = y - A * Math.sin(Math.PI * (x - off) / w); if (x === x0) c.moveTo(x, y0); else c.lineTo(x, y0); }
    c.stroke();
    for (let q = Math.floor((x0 - off) / w) - 2; q * w + off < x1 + 2 * w; q++) {
      const xc = q * w + off + w / 2; if (xc > xEnd || xc < x0 - w) continue;
      const s = (((q % 2) + 2) % 2) ? -1 : 1, yc = y - s * A, cx = xc + w * 0.2, cy = y - s * A * 0.28;
      const r0 = Math.hypot(xc - cx, yc - cy), a0 = Math.atan2(yc - cy, xc - cx), grow = clamp((xEnd - xc) / (w * 0.6));
      c.beginPath();
      for (let i = 0, n = 60; i <= n * grow; i++) { const qq = i / n, a = a0 + s * qq * Math.PI * 2.1, r = r0 * (1 - 0.82 * qq); const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
      c.stroke();
    }
    c.restore();
  }
  const lissajous = (cx, cy, rx, ry, a = 3, b = 2, n = 600) => { const p = []; for (let i = 0; i <= n; i++) { const q = i / n * Math.PI * 2; p.push([cx + rx * Math.sin(a * q + Math.PI / 2), cy + ry * Math.sin(b * q)]); } return p; };
  const spiralPts = (cx, cy, R, turns, rot = 0, n = 400) => { const p = []; for (let i = 0; i <= n; i++) { const q = i / n, an = rot + q * turns * Math.PI * 2; p.push([cx + Math.cos(an) * q * R, cy + Math.sin(an) * q * R]); } return p; };
  const circlePts = (cx, cy, R, a0 = -Math.PI / 2, n = 200) => { const p = []; for (let i = 0; i <= n; i++) { const an = a0 + i / n * Math.PI * 2; p.push([cx + Math.cos(an) * R, cy + Math.sin(an) * R]); } return p; };
  const arrowHead = (c, x, y, an, s = 14, col = GOLD) => K.rot(c, x, y, an, () => K.poly(c, [[s, 0], [-s * 0.7, -s * 0.75], [-s * 0.7, s * 0.75]], col));
  const check = (c, x, y, s, k, col = '#7BD88F') => { if (k <= 0) return; glowLine(c, [[x - s, y], [x - s * 0.3, y + s * 0.7], [x + s, y - s * 0.8]], k, { color: col, lw: 6, glow: 8 }); };
  const cross = (c, x, y, s, k, col = '#FF6B5B') => { if (k <= 0) return; glowLine(c, [[x - s, y - s], [x + s, y + s]], clamp(k * 2), { color: col, lw: 6, glow: 8 }); glowLine(c, [[x + s, y - s], [x - s, y + s]], clamp(k * 2 - 1), { color: col, lw: 6, glow: 8 }); };
  // a little sun / leaf / rosette for the kinds of ornament
  const rosette = (c, x, y, r, k, col = GOLD) => { c.save(); c.strokeStyle = col; c.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; if (i / 8 > k) break; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.5, r * 0.18, a, 0, Math.PI * 2); c.stroke(); } c.beginPath(); c.arc(x, y, r * 0.18, 0, Math.PI * 2); c.stroke(); c.restore(); };
  const sprout = (c, x, y, s, k, col = GOLD) => {
    const p = []; for (let i = 0; i <= 80; i++) { const q = i / 80; p.push([x + Math.sin(q * 3) * s * 0.18, y + s * 0.6 - q * s * 1.2]); }
    glowLine(c, p, k, { color: col, lw: 4, glow: 6 });
    for (const [q, sd] of [[0.35, -1], [0.55, 1], [0.75, -1]]) { if (k < q) continue; const px = x + Math.sin(q * 3) * s * 0.18, py = y + s * 0.6 - q * s * 1.2; c.save(); c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.ellipse(px + sd * s * 0.22, py - s * 0.05, s * 0.22, s * 0.09, sd * 0.5, 0, Math.PI * 2); c.stroke(); c.restore(); }
  };
  Object.assign(H_, { glowLine, star, hornsUp, hornsGeo, scroll, lissajous, spiralPts, circlePts, arrowHead, check, cross, rosette, sprout, textW });

  globalThis.GR = GR; globalThis.BG = BG; globalThis.OV = OV; globalThis.GH = H_;
  Object.assign(GR, { CX, CY, TOP, BOT, CREAM, GOLD, PALE, NAVY, RED, INK });
})();
