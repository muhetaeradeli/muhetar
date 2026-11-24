// SCENES (6 minutes): the narration is the text itself, and every sentence has its own picture. Photographs carry the steppe, the sky, the
// people, the yurt and the carpets; where the text speaks of an idea (the cycle of time, the seven generations,
// the circle, the spiral, the endless line) a gold drawing appears over a darkened photograph.
// Shots dissolve into each other (1.2 s), chapters dissolve too (film.js), and the camera never stops moving.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const { ev, line: L, S } = SC;
  const { C, VIEW, IMG } = K;
  const W = G.W, H = G.H, CX = 960, CY = VIEW.y + VIEW.h / 2;
  const SCENES = (globalThis.SCENES = globalThis.SCENES || {});
  const CREAM = '#F3EAD2', GOLD = C.gold, NAVY = '#0B1A44';
  const XF = 1.2, FADE = 1.4, LEAD = 0.45;

  // the moment a word is spoken inside a line (by its share of the characters)
  const at = (id, word) => { const l = L[id]; return word ? l.t + l.dur * Math.max(0, l.text.indexOf(word)) / l.text.length : l.t; };
  const win = (t, a, b, fi = 0.6, fo = 0.6) => K.win(t, a, b, fi, fo);

  // ---------- photographs ----------
  const blurCache = {};
  const blurred = (name, px) => {
    const k = name + px; if (blurCache[k]) return blurCache[k];
    const img = IMG[name]; if (!img) return null;
    const c = G.makeCanvas(img.width, img.height), x = c.getContext('2d'); x.filter = `blur(${px}px)`; x.drawImage(img, 0, 0);
    return (blurCache[k] = c);
  };
  // the soft cinematic grade every photograph gets (the film-wide colour grade is added at export)
  const grade = (c, warm = 0.08, dark = 0.3) => {
    c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${warm})`; c.fillRect(0, 0, W, H); c.restore();
    c.fillStyle = K.grad(c, 0, VIEW.y + VIEW.h * 0.55, 0, VIEW.y + VIEW.h, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${dark})`]]); c.fillRect(0, 0, W, H);
  };
  // camera moves: in / out / pans, around a point of interest (x, y) of the photograph
  const mv = (kind, x = 0.5, y = 0.5, z = 1.1) => {
    const d = 0.16;
    switch (kind) {
      case 'out': return [{ zoom: z + d, x, y }, { zoom: z, x, y }];
      case 'l2r': return [{ zoom: z + 0.1, x: x - 0.2, y }, { zoom: z + 0.1, x: x + 0.2, y }];
      case 'r2l': return [{ zoom: z + 0.1, x: x + 0.2, y }, { zoom: z + 0.1, x: x - 0.2, y }];
      case 'up': return [{ zoom: z + 0.1, x, y: y + 0.2 }, { zoom: z + 0.1, x, y: y - 0.2 }];
      case 'down': return [{ zoom: z + 0.1, x, y: y - 0.2 }, { zoom: z + 0.1, x, y: y + 0.2 }];
      default: return [{ zoom: z, x, y }, { zoom: z + d, x, y }];
    }
  };
  // where a point of a photograph (fraction py of its height) lands on screen during a shot
  const kbY = (sh, t, py) => {
    const img = IMG[sh.img]; if (!img) return null;
    const u = ease.inOutQuad(clamp((t - sh.k0) / (sh.k1 - sh.k0))), [a, b] = sh.mv;
    const zoom = lerp(a.zoom, b.zoom, u), fy = lerp(a.y, b.y, u);
    const cover = Math.max(W / img.width, VIEW.h / img.height) * zoom, ih = img.height * cover;
    return VIEW.y + clamp(VIEW.h / 2 - fy * ih, VIEW.h - ih, 0) + py * ih;
  };
  function drawShot(c, t, sh) {
    const img = sh.blur ? blurred(sh.img, sh.blur) : IMG[sh.img];
    if (sh.paint) sh.paint(c, t, sh);
    else if (img) {
      const [a, b] = sh.mv;
      if (sh.rot) K.cam(c, { rot: (t - sh.k0) * sh.rot }, () => G.kenBurns(c, img, -340, VIEW.y - 340, W + 680, VIEW.h + 680, t, sh.k0, sh.k1, { from: a, to: b, ease: ease.inOutQuad }));
      else G.kenBurns(c, img, 0, VIEW.y, W, VIEW.h, t, sh.k0, sh.k1, { from: a, to: b, ease: sh.linear ? (x) => x : ease.inOutQuad });
      grade(c, sh.warm ?? 0.08, 0.3);
    } else { c.fillStyle = K.grad(c, 0, VIEW.y, 0, VIEW.y + VIEW.h, [[0, '#1B2446'], [1, '#2A1C16']]); c.fillRect(0, 0, W, H); }
    if (sh.dim) { c.fillStyle = `rgba(6,12,30,${sh.dim})`; c.fillRect(0, 0, W, H); }
    if (sh.draw) sh.draw(c, t, sh);
  }
  // resolve a scene's shot list: start times from line ids, Ken Burns ranges running past the next dissolve
  function shots(scene, list) {
    const t0 = S[scene][0], t1 = S[scene][1];
    const out = list.map((s, i) => {
      const a = i === 0 ? t0 : (typeof s.at === 'number' ? s.at : at(s.at, s.word)) - (s.lead ?? LEAD);
      return { ...s, start: a, fade: s.fade ?? XF, mv: s.mv || mv('in') };
    });
    out.forEach((s, i) => { s.end = i < out.length - 1 ? out[i + 1].start : t1; s.k0 = s.start - (i === 0 ? FADE : 0); s.k1 = s.end + (out[i + 1] ? out[i + 1].fade : FADE) + 0.2; });
    return out;
  }
  let _sb = null;
  const sbuf = () => {
    const k = G.scale || 1, w = Math.round(W * k), h = Math.round(H * k);
    if (!_sb || _sb.width !== w || _sb.height !== h) _sb = G.makeCanvas(w, h);
    const x = _sb.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.setTransform(k, 0, 0, k, 0, 0);
    return _sb;
  };
  function run(ctx, t, list) {
    let i = 0; for (let k = 0; k < list.length; k++) if (t >= list[k].start) i = k;
    const s = list[i], a = i > 0 ? K.u(t, s.start, s.start + s.fade) : 1;
    if (a >= 1) { drawShot(ctx, t, s); return; }
    drawShot(ctx, t, list[i - 1]);
    const b = sbuf(); drawShot(b.getContext('2d'), t, s);
    ctx.save(); ctx.globalAlpha = ease.inOutQuad(a); ctx.drawImage(b, 0, 0, W, H); ctx.restore();
  }

  // ---------- type and small graphics ----------
  const caps = (c, s, x, y, o = {}) => K.text(c, s, x, y, { size: 30, weight: 700, spacing: 10, color: GOLD, shadow: 16, ...o });
  const big = (c, s, x, y, o = {}) => K.text(c, s, x, y, { size: 64, weight: 800, spacing: 4, shadow: 28, ...o });
  // a row of labels that appear one by one as they are spoken: items = [[text, time], ...]
  function chips(c, t, items, { y = VIEW.y + VIEW.h - 120, until = Infinity, size = 30 } = {}) {
    c.save(); c.font = `700 ${size}px ${K.SANS}`; c.letterSpacing = '4px';
    const ws = items.map(([s]) => c.measureText(s).width + 52); c.restore();
    let x = CX - (ws.reduce((a, b) => a + b, 0) + 18 * (items.length - 1)) / 2;
    items.forEach(([s, ta], i) => {
      const a = win(t, ta, until, 0.4, 0.6), w = ws[i];
      if (a > 0) K.alpha(c, a, () => {
        const u = K.out(t, ta, ta + 0.5);
        c.save(); c.fillStyle = 'rgba(8,14,34,0.62)'; c.strokeStyle = GOLD; c.lineWidth = 2;
        c.beginPath(); c.roundRect(x, y - 30 + 10 * (1 - u), w, 60, 30); c.fill(); c.stroke(); c.restore();
        K.text(c, s, x + w / 2, y + 10 * (1 - u), { size, weight: 700, spacing: 4, color: CREAM });
      });
      x += w + 18;
    });
  }
  const glowLine = (c, pts, u, { color = 'rgba(255,224,160,0.95)', lw = 4, close = false } = {}) => {
    if (u <= 0) return;
    const n = Math.max(2, Math.floor(pts.length * clamp(u)));
    c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = 'rgba(255,190,90,0.8)'; c.shadowBlur = 14;
    c.beginPath(); for (let i = 0; i < n; i++) { if (i) c.lineTo(pts[i][0], pts[i][1]); else c.moveTo(pts[i][0], pts[i][1]); }
    if (close && u >= 1) c.closePath();
    c.stroke(); c.restore();
  };
  const star = (c, x, y, r, a = 1) => { if (a <= 0) return; K.glow(c, x, y, r * 7, 'rgba(255,240,210,0.9)', a * 0.6); K.circle(c, x, y, r, `rgba(255,250,235,${a})`); };
  // the ram's horns drawn from their stem base (0,0) upwards: for rings and the four-way «төртқұлақ»
  const hornsUp = (c, s, color = GOLD, lw = 8, u = 1) => K.horns(c, 0, -s, s, color, lw, u);
  // the same horns, simplified to geometry (what a designer keeps): a stem and two arcs
  function hornsGeo(c, x, y, s, color, lw) {
    c.save(); c.translate(x, y); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round';
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(sd * 0.08 * s, 0.9 * s); c.lineTo(sd * 0.08 * s, 0.1 * s);
      if (sd > 0) c.arc(0.42 * s, 0.1 * s, 0.34 * s, Math.PI, 0.5 * Math.PI, false); else c.arc(-0.42 * s, 0.1 * s, 0.34 * s, 0, 0.5 * Math.PI, true);
      c.stroke();
      c.beginPath(); c.arc(sd * 0.42 * s, 0.1 * s, 0.13 * s, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
  }
  // an endless running scroll: one unbroken wave, each crest curling inward; it scrolls forever
  function scroll(c, y, A, w, t, { color = GOLD, lw = 5, speed = 36, u = 1, dir = 1, x0 = -40, x1 = W + 40 } = {}) {
    const off = ((t * speed * dir) % (2 * w) + 2 * w) % (2 * w), xEnd = lerp(x0, x1, u);
    c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    for (let x = x0; x <= xEnd; x += 6) { const y0 = y - A * Math.sin(Math.PI * (x - off) / w); if (x === x0) c.moveTo(x, y0); else c.lineTo(x, y0); }
    c.stroke();
    for (let k = Math.floor((x0 - off) / w) - 2; k * w + off < x1 + 2 * w; k++) {
      const xc = k * w + off + w / 2; if (xc > xEnd || xc < x0 - w) continue;
      const s = (((k % 2) + 2) % 2) ? -1 : 1, yc = y - s * A, cx = xc + w * 0.2, cy = y - s * A * 0.28;
      const r0 = Math.hypot(xc - cx, yc - cy), a0 = Math.atan2(yc - cy, xc - cx), grow = clamp((xEnd - xc) / (w * 0.6));
      c.beginPath();
      for (let i = 0, n = 60; i <= n * grow; i++) { const q = i / n, a = a0 + s * q * Math.PI * 2.1, r = r0 * (1 - 0.82 * q); const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
      c.stroke();
    }
    c.restore();
  }
  const paper = (c, base = '#EFE6D2') => { c.fillStyle = base; c.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(120,90,50,${0.02 + U.hash(i, 71) * 0.03})`; c.fillRect(U.hash(i, 72) * W, U.hash(i, 73) * H, 2, 2); } };
  // a chapter card with the text's own heading: a small numeral, the heading, a gold rule
  const chapter = (c, t, scene, num) => {
    const [t0] = S[scene], l0 = SC.scenes[scene].lines[0], a = win(t, t0 + 0.25, l0.t + 1.4, 0.6, 0.7); if (a <= 0) return;
    K.alpha(c, a, () => {
      c.fillStyle = `rgba(0,0,0,${0.25 * a})`; c.fillRect(0, 0, W, H);
      K.text(c, num, CX, CY - 96, { size: 26, weight: 700, color: GOLD, spacing: 10, shadow: 12 });
      K.track(c, SC.scenes[scene].title.toUpperCase(), CX, CY - 26, t, t0 + 0.25, { size: 64, weight: 800, spacing: 4, wide: 26, shadow: 26 });
      const u = K.out(t, t0 + 0.45, t0 + 1.8); K.rect(c, CX - 170 * u, CY + 30, 340 * u, 3, GOLD);
    });
  };
  // a short montage inside one line: each word brings its own photograph
  const montage = (id, items, o = {}) => items.map(([word, img, m]) => ({ at: id, word, img, mv: m || mv('in'), lead: 0.25, fade: 0.6, ...o }));
  // gold words that appear as they are spoken: items = [[text, spoken word, x, y], ...]
  const spoken = (c, t, id, items, until, o = {}) => items.forEach(([s, w, x, y]) => {
    const tw = at(id, w), a = win(t, tw - 0.1, until, 0.5, 0.6); if (a > 0) big(c, s, x, y, { size: 52, alpha: a, ...o });
  });

  // ============ КІРІСПЕ (o1–o3) ============
  const OPEN = shots('open', [
    { img: 'ak_sunset', mv: [{ zoom: 1.28, x: 0.47, y: 0.62 }, { zoom: 1.06, x: 0.5, y: 0.58 }] },
    { at: 'o1', word: 'әлемнің', img: 'live_stars', mv: [{ zoom: 1.45, x: 0.5, y: 0.22 }, { zoom: 1.7, x: 0.52, y: 0.28 }], warm: 0, dim: 0.15, lead: 0.3 },
    { at: 'o2', img: 's_sunrise', mv: mv('in', 0.5, 0.45) },
    ...montage('o3', [['кеңістік', 'undp_altyn', mv('l2r', 0.5, 0.5)], ['уақыт', 's_before'], ['табиғат', 's_apricot'], ['ұрпақ', 'p_grandma', mv('in', 0.55, 0.45)],
      ['ата-баба', 'p_eagle', mv('in', 0.62, 0.4)], ['адамның', 'my_2', mv('in', 0.62, 0.62)]]),
    { at: 'o3', word: 'қолөнер', img: 'c_pattern', mv: mv('out', 0.5, 0.5, 1.05), lead: 0.3, fade: 0.8 },
  ]);
  SCENES.open = (ctx, t) => {
    run(ctx, t, OPEN);
    const o1 = L.o1, tw = at('o1', 'әлемнің'), ta = 1 - K.u(t, tw - 0.9, tw - 0.1);
    if (ta > 0) {
      ctx.fillStyle = `rgba(0,0,0,${0.4 * ta})`; ctx.fillRect(0, 0, W, H);
      K.alpha(ctx, ta, () => {
        K.alpha(ctx, K.io(t, ev.title, ev.title + 2.4), () => K.shanyrak(ctx, CX, 318, 58, GOLD, 3, t * 0.08));
        K.text(ctx, 'ҚАЗАҚТЫҢ ДӘСТҮРЛІ ҚОЛӨНЕРІНДЕГІ', CX, 440, { size: 30, weight: 700, color: GOLD, spacing: 9, alpha: K.u(t, ev.title + 0.4, ev.title + 1.4), shadow: 14 });
        K.track(ctx, 'ШЕКСІЗДІК ПЕН МӘҢГІЛІК', CX, 525, t, ev.title, { size: 96, weight: 800, spacing: 5, wide: 40, shadow: 30 });
        const u = K.out(t, ev.title + 0.6, ev.title + 2.0);
        K.rect(ctx, CX - 220 * u, 590, 440 * u, 3, GOLD);
        K.text(ctx, 'И Д Е Я С Ы', CX, 640, { size: 32, weight: 400, color: CREAM, spacing: 6, alpha: K.u(t, ev.title + 1.2, ev.title + 2.2), shadow: 14 });
      });
    }
    // the three things the ideas were born from, as they are named
    spoken(ctx, t, 'o1', [['ӘЛЕМНІҢ ҚҰРЫЛЫСЫ', 'әлемнің', CX, 380], ['УАҚЫТТЫҢ ҚОЗҒАЛЫСЫ', 'уақыттың', CX, 470], ['ӨМІР МЕН ӨЛІМ', 'өмір', CX, 560]], o1.end + 0.2, { size: 50, spacing: 6 });
    // what the ideas are bound up with: the words of o3, one by one, along the bottom of the picture
    const ws = [['кеңістік', 'кеңістік'], ['уақыт', 'уақыт'], ['табиғат', 'табиғат'], ['ұрпақ сабақтастығы', 'ұрпақ'], ['ата-баба рухы', 'ата-баба'], ['адамның әлемдегі орны', 'адамның']];
    ws.forEach(([s, w], i) => { const tw = at('o3', w), nx = i < ws.length - 1 ? at('o3', ws[i + 1][1]) : at('o3', 'қолөнер'); const a = win(t, tw - 0.1, nx + 0.1, 0.3, 0.3); if (a > 0) big(ctx, s, CX, VIEW.y + VIEW.h - 120, { size: 50, alpha: a, spacing: 4 }); });
  };

  // ============ ШЕКСІЗДІК ҰҒЫМЫНЫҢ МӘНІ — «Қазақтың даласы» (d1–d5) ============
  const SAIGA = { zoom: 1.32, x: 0.5, y: 0.34 }, SAIGA2 = { zoom: 1.0, x: 0.5, y: 0.3 };
  const STEPPE = shots('steppe', [
    { img: 'nin_pano', mv: [{ zoom: 1.0, x: 0.42, y: 0.6 }, { zoom: 1.16, x: 0.36, y: 0.62 }] },
    { at: 'd2', img: 'undp_altyn', mv: [{ zoom: 1.22, x: 0.25, y: 0.5 }, { zoom: 1.22, x: 0.75, y: 0.45 }], linear: true },
    { at: 'd3', img: 'my_2', mv: mv('in', 0.62, 0.62) },
    { at: 'd3', word: 'кеңістіктің өзін', img: 'undp_saiga', mv: [SAIGA, SAIGA2], lead: 0.5, draw: (c, t, sh) => {
      // the horizon becomes a line without an end
      const ta = at('d3', 'шексіз'), u = K.io(t, ta - 0.4, ta + 2.6), hy = kbY(sh, t, 0.276) ?? CY;
      c.fillStyle = K.grad(c, 0, VIEW.y, 0, hy, [[0, 'rgba(34,52,92,0.5)'], [0.7, 'rgba(120,110,120,0.15)'], [1, 'rgba(255,190,120,0.1)']]); c.fillRect(0, VIEW.y, W, hy - VIEW.y);
      K.alpha(c, win(t, ta - 0.4, sh.end + 0.6, 0.3, 1.0), () => {
        K.glow(c, CX, hy, 380 * u + 40, 'rgba(255,190,100,0.3)');
        K.line(c, CX, hy, CX - 1000 * u, hy, 'rgba(255,226,160,0.95)', 3); K.line(c, CX, hy, CX + 1000 * u, hy, 'rgba(255,226,160,0.95)', 3);
        K.streak(c, CX, hy, 700 * u, '255,226,170', 0.7);
      });
      K.text(c, 'ШЕКСІЗДІК', CX, hy + 96, { size: 60, weight: 800, spacing: 16, color: '#FFF4DC', shadow: 34, alpha: win(t, at('d4', 'шетсіздігі'), sh.end + 0.6, 0.8, 1.0) });
    } },
    { at: 'd4', word: 'аспан', img: 'undp_altyn', mv: [{ zoom: 1.5, x: 0.6, y: 0.4 }, { zoom: 1.3, x: 0.55, y: 0.2 }], lead: 0.3 },
    ...montage('d5', [['Көштің', 'p_eagle2', mv('l2r', 0.5, 0.55)], ['судың', 's_talas', [{ zoom: 1.8, x: 0.72, y: 0.6 }, { zoom: 2.0, x: 0.78, y: 0.58 }]], ['тіршіліктің', 's_apricot', mv('in', 0.45, 0.45)]], { fade: 0.8 }),
  ]);
  SCENES.steppe = (ctx, t) => {
    run(ctx, t, STEPPE);
    chapter(ctx, t, 'steppe', 'I');
    ['Ұлан-ғайыр дала', 'ашық аспан', 'алыс көкжиек', 'үздіксіз қозғалыс'].forEach((w, i) => {
      const ta = at('d2', w), a = win(t, ta, L.d3.t - 0.3, 0.5, 0.6); if (a <= 0) return;
      const y = 300 + i * 92, u = K.out(t, ta, ta + 0.7);
      K.rect(ctx, 140, y - 26, 6, 52 * u, GOLD);
      K.text(ctx, w, 168 + 24 * (1 - u), y, { size: 62, weight: 800, align: 'left', alpha: a, shadow: 26 });
    });
  };

  // ============ МӘҢГІЛІК ҰҒЫМЫНЫҢ МӘНІ (m1–m3) ============
  const ETERNAL = shots('eternal', [
    { img: 's_alatau3', mv: mv('in', 0.5, 0.4), warm: 0.04 },
    { at: 'm1', word: 'ұрпақтан', img: 'p_family', mv: mv('in', 0.5, 0.62), lead: 0.3 },
    { at: 'm2', img: 'p_eagle', mv: mv('in', 0.62, 0.4) },
    { at: 'm2', word: 'ұрпағы', img: 'p_grandma', mv: mv('in', 0.55, 0.45), lead: 0.3, fade: 0.8 },
    { at: 'm2', word: 'жасаған', img: 'p_spin', mv: mv('in', 0.3, 0.5, 1.2), lead: 0.3, fade: 0.8 },
    { at: 'm3', img: 'p_nomadfam', mv: mv('out', 0.5, 0.45), dim: 0.5, draw: (c, t) => {
      // seven generations, linked, the oldest on the left
      const ta = at('m3', 'Жеті'), y = CY + 10, x0 = 400, dx = (1520 - x0) / 6, u = K.io(t, ta, ta + 2.6);
      caps(c, 'ЖЕТІ АТА', CX, VIEW.y + 110, { size: 40, alpha: K.u(t, ta, ta + 0.6) });
      K.line(c, x0, y, lerp(x0, 1520, u), y, 'rgba(226,182,89,0.8)', 3);
      for (let i = 0; i < 7; i++) {
        const s = K.u(t, ta + i * 0.35, ta + i * 0.35 + 0.4), x = x0 + i * dx; if (s <= 0) continue;
        K.alpha(c, s, () => { K.glow(c, x, y, 70, 'rgba(255,200,110,0.6)', 0.6); K.circle(c, x, y, 24, NAVY, GOLD, 3); K.text(c, String(7 - i), x, y + 1, { size: 24, weight: 800, color: '#FFE7B0' }); });
      }
      const k = K.u(t, at('m3', 'кейінгі'), at('m3', 'кейінгі') + 0.6);
      if (k > 0) K.alpha(c, k, () => { K.line(c, 1550, y, 1680, y, GOLD, 3); K.poly(c, [[1700, y], [1678, y - 12], [1678, y + 12]], GOLD); K.text(c, 'кейінгі ұрпақ', 1610, y + 52, { size: 26, italic: true, weight: 400, color: CREAM, shadow: 10 }); });
    } },
  ]);
  SCENES.eternal = (ctx, t) => {
    run(ctx, t, ETERNAL); chapter(ctx, t, 'eternal', 'II');
    spoken(ctx, t, 'm1', [['ТОҚТАМАУ', 'тоқтамау', 560, CY - 40], ['ЖОҒАЛМАУ', 'жоғалмау', 1360, CY - 40]], at('m1', 'ұрпақтан') - 0.2, { size: 54, spacing: 8 });
  };

  // ============ УАҚЫТТЫҢ ЦИКЛДІК СИПАТЫ (a1–a4) ============
  const SKY = shots('sky', [
    { img: 'live_stars', mv: [{ zoom: 1.6, x: 0.48, y: 0.22 }, { zoom: 1.8, x: 0.5, y: 0.25 }], warm: 0, dim: 0.5, draw: (c, t) => {
      // a straight line bends round into a circle
      const tl = at('a1', 'түзу'), u = K.io(t, tl + 0.8, L.a1.end + 0.6), N = 160, R = 1200 / (2 * Math.PI), pts = [];
      for (let i = 0; i <= N; i++) { const q = i / N, an = Math.PI / 2 + q * 2 * Math.PI; pts.push([lerp(360 + 1200 * q, CX + Math.cos(an) * R, u), lerp(CY, CY + Math.sin(an) * R, u)]); }
      glowLine(c, pts, K.u(t, tl - 0.4, tl + 0.8), { lw: 5 });
      K.text(c, 'түзу сызық', CX, CY + 70, { size: 34, weight: 400, italic: true, color: CREAM, alpha: (1 - u) * K.u(t, tl, tl + 0.6), shadow: 14 });
      K.text(c, 'АЙНАЛЫМ', CX, CY, { size: 40, weight: 800, spacing: 12, color: GOLD, alpha: K.u(t, L.a1.end, L.a1.end + 0.6), shadow: 16 });
    } },
    ...montage('a2', [['Тәулік', 's_before', mv('in', 0.5, 0.5)], ['күннің', 's_sunrise', mv('in', 0.5, 0.4)], ['кештің', 'ak_sunset', mv('out', 0.48, 0.6)], ['түннің', 'live_stars', mv('in', 0.5, 0.3, 1.4)]], { fade: 0.7 }),
    ...montage('a3', [['Жыл', 's_apricot', mv('in', 0.5, 0.45)], ['жаз', 'undp_altyn', mv('l2r', 0.5, 0.5)], ['күз', 'undp_crane', mv('in', 0.55, 0.55)], ['қыс', 'up_cold', [{ zoom: 1.5, x: 0.5, y: 0.75 }, { zoom: 1.6, x: 0.55, y: 0.75 }]]], { fade: 0.7 }),
    { at: 'a4', img: 's_sunrise', mv: mv('out', 0.5, 0.42), dim: 0.3, draw: (c, t) => {
      // the end of one period flows into the start of the next; past and future meet in the present
      const ta = L.a4.t, u = K.io(t, ta, at('a4', 'өткен')), R = 170, a0 = Math.PI * 0.5, cy = CY - 70;
      const pts = []; for (let i = 0; i <= 120; i++) { const an = a0 + i / 120 * Math.PI * 1.94; pts.push([CX + Math.cos(an) * R, cy + Math.sin(an) * R]); }
      glowLine(c, pts, u, { lw: 5 });
      if (u > 0.95) { const an = a0 + Math.PI * 1.94, x = CX + Math.cos(an) * R, y = cy + Math.sin(an) * R; K.rot(c, x, y, an, () => K.poly(c, [[0, 14], [-12, -8], [12, -8]], GOLD)); }
      const t1 = at('a4', 'аяқталуы'), t2 = at('a4', 'басталуына');
      K.text(c, 'аяқталуы', CX - 110, cy + R + 40, { size: 28, italic: true, weight: 400, color: CREAM, alpha: K.u(t, t1, t1 + 0.6), shadow: 12 });
      K.text(c, 'басталуы', CX + 110, cy + R + 40, { size: 28, italic: true, weight: 400, color: CREAM, alpha: K.u(t, t2, t2 + 0.6), shadow: 12 });
      const y = VIEW.y + VIEW.h - 110;
      [['ӨТКЕН', 'өткен', 560], ['ҚАЗІРГІ', 'қазіргі', CX], ['БОЛАШАҚ', 'болашақ', 1360]].forEach(([s, w, x]) => { const tw = at('a4', w); big(c, s, x, y, { size: 46, alpha: K.u(t, tw - 0.1, tw + 0.5) }); });
    } },
  ]);
  SCENES.sky = (ctx, t) => {
    run(ctx, t, SKY);
    chapter(ctx, t, 'sky', 'III');
    // the year as a wheel: four seasons on one ring, over the four photographs
    const ta = at('a3', 'көктем'), a = win(t, ta - 0.3, L.a4.t - 0.3, 0.6, 0.6);
    if (a > 0) K.alpha(ctx, a, () => {
      const cy = CY - 10, R = 190, u = K.io(t, ta - 0.3, L.a3.end), rot = -Math.PI / 2;
      ctx.save(); ctx.strokeStyle = 'rgba(255,226,160,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([2, 12]); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(CX, cy, R, rot, rot + u * Math.PI * 2); ctx.stroke(); ctx.restore();
      ['КӨКТЕМ', 'ЖАЗ', 'КҮЗ', 'ҚЫС'].forEach((s, i) => {
        const tw = at('a3', ['көктем', 'жаз', 'күз', 'қыс'][i]), an = rot + i * Math.PI / 2, x = CX + Math.cos(an) * R, y = cy + Math.sin(an) * R;
        K.alpha(ctx, K.u(t, tw - 0.1, tw + 0.4), () => { K.circle(ctx, x, y, 9, '#FFE7B0'); K.text(ctx, s, x + Math.cos(an) * 64, y + Math.sin(an) * 42, { size: 34, weight: 800, spacing: 4, shadow: 20 }); });
      });
    });
    // the day: four words with their four photographs
    spoken(ctx, t, 'a2', [['ТАҢ', 'таңның', 420, VIEW.y + 110], ['КҮН', 'күннің', 800, VIEW.y + 110], ['КЕШ', 'кештің', 1180, VIEW.y + 110], ['ТҮН', 'түннің', 1520, VIEW.y + 110]], L.a2.end + 0.3, { size: 44, spacing: 10 });
  };

  // ============ КЕҢІСТІК ТУРАЛЫ ТҮСІНІК (y1–y4) ============
  const YURT = shots('yurt', [
    { img: 'gv_yurt', mv: mv('in', 0.55, 0.55) },
    { at: 'y1', word: 'әлемнің', img: 'ir_yurt', mv: [{ zoom: 1.1, x: 0.5, y: 0.56 }, { zoom: 1.24, x: 0.48, y: 0.52 }], lead: 0.3 },
    { at: 'y2', img: 'user_shanyrak', mv: [{ zoom: 1.12, x: 0.52, y: 0.5 }, { zoom: 1.55, x: 0.6, y: 0.42 }], rot: 0.02, draw: (c, t) => {
      K.glow(c, CX, CY - 20, 460, 'rgba(255,246,225,0.35)', K.io(t, at('y2', 'аспанмен') - 0.5, L.y2.end + 0.6)); // the sky through the crown
      K.label(c, t, L.y2.t + 0.4, L.y3.t - 0.3, 'Шаңырақ', 'кеңістіктің жоғары бөлігі', { right: true });
    } },
    { at: 'y3', img: 'c_inger', mv: [{ zoom: 1.2, x: 0.48, y: 0.45 }, { zoom: 1.45, x: 0.47, y: 0.32 }], rot: 0.04, draw: (c, t) => K.label(c, t, L.y3.t + 0.4, L.y4.t - 0.3, 'Уықтар', 'орталықтан жан-жаққа') },
    { at: 'y4', img: 'y_frame2', mv: mv('out', 0.5, 0.45), draw: (c, t) => {
      const u = K.io(t, at('y4', 'дөңгелек'), L.y4.end + 0.3), pts = [];
      for (let i = 0; i <= 140; i++) { const an = -Math.PI / 2 + i / 140 * Math.PI * 2; pts.push([CX + Math.cos(an) * 320, CY + Math.sin(an) * 320]); }
      glowLine(c, pts, u, { lw: 4, color: 'rgba(255,230,170,0.85)', close: true });
      K.text(c, 'тұйық пішін', CX, CY + 360, { size: 32, italic: true, weight: 400, color: CREAM, shadow: 14, alpha: K.u(t, at('y4', 'тұйық'), at('y4', 'тұйық') + 0.6) });
    } },
  ]);
  SCENES.yurt = (ctx, t) => { run(ctx, t, YURT); chapter(ctx, t, 'yurt', 'IV'); };

  // ============ ОЮ-ӨРНЕКТЕГІ ШЕКСІЗДІК ИДЕЯСЫ (r1–r10) ============
  // the «stage»: the felt pattern, blurred and darkened, behind gold drawings
  const stage = (c, t, sh) => {
    G.kenBurns(c, blurred('c_pattern', 6), 0, VIEW.y, W, VIEW.h, t, sh.k0, sh.k1, { from: { zoom: 1.2, x: 0.45, y: 0.5 }, to: { zoom: 1.4, x: 0.55, y: 0.5 } });
    c.fillStyle = 'rgba(8,18,52,0.84)'; c.fillRect(0, 0, W, H);
    c.fillStyle = K.radial(c, CX, CY, 60, 800, [[0, 'rgba(255,200,120,0.14)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, W, H);
  };
  const title = (c, t, s, a, b) => caps(c, s, CX, VIEW.y + 72, { size: 28, alpha: win(t, a, b, 0.5, 0.5) });
  const span = (id, next) => [L[id].t - 0.35, L[next].t - 0.25];
  const ORNAMENT = shots('ornament', [
    { img: 'c_pattern', mv: mv('in', 0.5, 0.5, 1.05) },
    { at: 'r1', paint: stage, draw: (c, t) => {
      // r1: horn shapes joined into one living chain
      { const [a, b] = span('r1', 'r2'), al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => {
          const n = 6, step = 300, x0 = CX - step * (n - 1) / 2;
          K.line(c, x0 - 120, CY + 150, lerp(x0 - 120, x0 + step * (n - 1) + 120, K.io(t, a, a + 2)), CY + 150, GOLD, 4);
          for (let i = 0; i < n; i++) K.horns(c, x0 + i * step, CY - 120, 150, i % 2 ? '#FFE7B0' : GOLD, 6, K.io(t, a + 0.3 + i * 0.35, a + 1.3 + i * 0.35));
        });
        title(c, t, 'МҮЙІЗ ТӘРІЗДІ ПІШІНДЕР', a, b); }
      // r2: the spiral, outward and back in
      { const [a, b] = span('r2', 'r3'), al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => {
          const pts = [], turns = 4.2, R = 300, rot = (t - a) * 0.4;
          for (let i = 0; i <= 400; i++) { const q = i / 400, an = rot + q * turns * Math.PI * 2; pts.push([CX + Math.cos(an) * q * R, CY + Math.sin(an) * q * R]); }
          const u = K.io(t, a, at('r2', 'сыртқа') + 0.6), back = K.io(t, at('r2', 'сырттан'), at('r2', 'сырттан') + 1.6);
          glowLine(c, pts, u, { lw: 4 });
          const q = pts[Math.round(clamp(back > 0 ? 1 - back : u) * 400)];
          K.glow(c, q[0], q[1], 60, 'rgba(255,220,150,0.9)'); K.circle(c, q[0], q[1], 8, '#FFF4DC');
        });
        title(c, t, 'ШИЫРШЫҚ', a, b); }
      // r3: the wave
      { const a = L.r3.t - 0.35, b = L.r3.end + 1.0, al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => scroll(c, CY, 70, 200, t, { lw: 6, u: K.io(t, a, a + 2.0), speed: 70 }));
        title(c, t, 'ИРЕК СЫЗЫҚ', a, b); }
    } },
    { at: 'r4', img: 'ch_int2', mv: [{ zoom: 1.45, x: 0.25, y: 0.4 }, { zoom: 1.45, x: 0.8, y: 0.5 }], linear: true },
    { at: 'r5', paint: stage, draw: (c, t) => {
      // r5: one element, repeated in rhythm, becomes a band — and a closed border
      { const [a, b] = span('r5', 'r7'), al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => {
          const step = 170, n = 7, off = Math.max(0, t - (L.r5.t + 2.4)) * 40;
          K.rect(c, 0, CY - 95, W, 3, GOLD); K.rect(c, 0, CY + 95, W, 3, GOLD);
          for (let k = -n; k <= n; k++) { const appear = K.u(t, L.r5.t + 0.2 + (k + n) * 0.12, L.r5.t + 0.6 + (k + n) * 0.12); if (appear > 0) K.horns(c, CX + k * step - (off % step), CY - 62, 92, GOLD, 5, appear); }
          const sb = K.u(t, at('r5', 'тұйық'), at('r5', 'тұйық') + 1.2);
          if (sb > 0) K.alpha(c, sb, () => { scroll(c, VIEW.y + 46, 22, 90, t, { lw: 4, u: sb }); scroll(c, VIEW.y + VIEW.h - 46, 22, 90, t, { lw: 4, u: sb, dir: -1 }); });
        });
        title(c, t, 'ҚАЙТАЛАНАТЫН ЫРҒАҚ', a, b); }
      // r7: «бітпес», «шимай», «шет ою» — one closed line without a beginning or an end
      { const [a, b] = span('r7', 'r8'), al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => {
          const pts = []; for (let i = 0; i <= 600; i++) { const q = i / 600 * Math.PI * 2; pts.push([CX + 330 * Math.sin(3 * q + Math.PI / 2), CY + 250 * Math.sin(2 * q)]); }
          const u = K.io(t, a, a + 2.6); glowLine(c, pts, u, { lw: 5, close: true });
          if (u >= 1) { const q = pts[Math.floor(((t - a) * 90) % 600)]; K.glow(c, q[0], q[1], 70, 'rgba(255,220,150,0.95)'); K.circle(c, q[0], q[1], 9, '#FFF4DC'); }
          const sb = K.u(t, at('r7', 'шет'), at('r7', 'шет') + 1.2);
          if (sb > 0) K.alpha(c, sb, () => { scroll(c, VIEW.y + 46, 22, 90, t, { lw: 4, u: sb }); scroll(c, VIEW.y + VIEW.h - 46, 22, 90, t, { lw: 4, u: sb, dir: -1 }); });
          caps(c, '«БІТПЕС»', 330, CY - 30, { size: 30, alpha: K.u(t, at('r7', 'Бітпес') - 0.2, at('r7', 'Бітпес') + 0.5) });
          caps(c, '«ШИМАЙ»', 330, CY + 30, { size: 30, alpha: K.u(t, at('r7', 'шимай') - 0.2, at('r7', 'шимай') + 0.5) });
          caps(c, '«ШЕТ ОЮ»', 1590, CY, { size: 30, alpha: sb });
        }); }
      // r8–r9: the circle
      { const [a, b] = span('r8', 'r10'), al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => {
          const u = K.io(t, a, a + 1.8), rot = (t - a) * 0.18, R = 230;
          c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); c.stroke(); c.restore();
          for (let i = 0; i < 16; i++) {
            const an = rot + i / 16 * Math.PI * 2, s = K.u(t, L.r9.t + i * 0.06, L.r9.t + 0.4 + i * 0.06); if (s <= 0) continue;
            c.save(); c.translate(CX + Math.cos(an) * (R + 8), CY + Math.sin(an) * (R + 8)); c.rotate(an + Math.PI / 2); hornsUp(c, 34, GOLD, 3, s); c.restore();
          }
          K.circle(c, CX, CY, 10, '#FFE7B0');
        });
        title(c, t, 'ШЕҢБЕР', a, b); }
      // r10: «төртқұлақ» — four horns from one centre, to the four directions
      { const a = L.r10.t - 0.35, b = S.ornament[1] + 2, al = win(t, a, b, 0.5, 0.5);
        if (al > 0) K.alpha(c, al, () => {
          c.save(); c.translate(CX, CY); c.rotate((t - a) * 0.12);
          c.strokeStyle = 'rgba(226,182,89,0.5)'; c.lineWidth = 2; c.strokeRect(-250, -250, 500, 500);
          for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); hornsUp(c, 150, GOLD, 6, K.io(t, a + i * 0.3, a + 1.6 + i * 0.3)); c.restore(); }
          c.restore(); K.circle(c, CX, CY, 12, '#FFE7B0');
          caps(c, '«ТӨРТҚҰЛАҚ»', CX, VIEW.y + 72, { size: 28, alpha: K.u(t, a + 0.2, a + 0.9) });
        }); }
    } },
  ]);
  SCENES.ornament = (ctx, t) => { run(ctx, t, ORNAMENT); chapter(ctx, t, 'ornament', 'V'); };

  // ============ УАҚЫТ ПЕН КЕҢІСТІК (k1, k3, k4) ============
  const DIPPER = [[900, 520], [840, 580], [770, 545], [822, 482], [752, 452], [682, 440], [610, 466]]; // Dubhe, Merak, Phecda, Megrez, Alioth, Mizar, Alkaid
  const POLARIS = [1170, 250], PLEIADES = [[1450, 520], [1468, 508], [1482, 526], [1462, 540], [1436, 532], [1478, 492], [1494, 512]];
  const TIMESPACE = shots('timespace', [
    { img: 'az_sunset', mv: [{ zoom: 1.12, x: 0.5, y: 0.72 }, { zoom: 1.3, x: 0.5, y: 0.78 }], draw: (c, t) => {
      // the moon through its month: eight phases, one after another
      const ta = at('k1', 'Ай'), a = win(t, ta, at('k1', 'Темірқазық'), 0.5, 0.5); if (a <= 0) return;
      K.alpha(c, a, () => { for (let i = 0; i < 8; i++) {
        const x = 520 + i * 125, y = VIEW.y + 100, p = i / 8, s = K.u(t, ta + i * 0.18, ta + i * 0.18 + 0.4); if (s <= 0) continue;
        K.alpha(c, s, () => {
          const lit = 'rgba(250,240,215,0.95)', dark = 'rgba(20,24,40,1)', k = Math.cos(p * 2 * Math.PI);
          K.circle(c, x, y, 34, dark); c.save(); c.beginPath(); c.arc(x, y, 34, 0, 7); c.clip();
          c.fillStyle = lit; c.beginPath(); if (p < 0.5) c.arc(x, y, 34, -Math.PI / 2, Math.PI / 2); else c.arc(x, y, 34, Math.PI / 2, Math.PI * 1.5); c.fill();
          c.fillStyle = k > 0 ? dark : lit; c.beginPath(); c.ellipse(x, y, 34 * Math.abs(k), 34, 0, 0, 7); c.fill(); c.restore();
          c.strokeStyle = 'rgba(255,230,170,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 34, 0, 7); c.stroke();
        });
      } });
    } },
    { at: 'k1', word: 'Темірқазық', img: 'live_stars', mv: [{ zoom: 1.5, x: 0.5, y: 0.25 }, { zoom: 1.6, x: 0.48, y: 0.22 }], warm: 0, dim: 0.25, lead: 0.4, draw: (c, t) => {
      // the Pole Star, the Great Bear and the Pleiades, as each is named
      const tP = at('k1', 'Темірқазық'), tD = at('k1', 'Жетіқарақшы'), tU = at('k1', 'Үркер'), end = L.k3.t + 0.2, a = win(t, tP - 0.2, end, 0.4, 0.6);
      if (a <= 0) return;
      K.alpha(c, a, () => {
        star(c, POLARIS[0], POLARIS[1], 6.5, K.u(t, tP, tP + 0.5));
        caps(c, 'ТЕМІРҚАЗЫҚ', POLARIS[0] + 30, POLARIS[1] - 34, { size: 26, align: 'left', alpha: K.u(t, tP + 0.2, tP + 0.8) });
        const u = K.io(t, tD - 0.2, tD + 1.4);
        glowLine(c, [DIPPER[6], DIPPER[5], DIPPER[4], DIPPER[3], DIPPER[0], DIPPER[1], DIPPER[2], DIPPER[3]], u, { lw: 2.5, color: 'rgba(255,226,160,0.7)' });
        DIPPER.forEach(([x, y], i) => star(c, x, y, 4, K.u(t, tD - 0.2 + i * 0.08, tD + 0.2 + i * 0.08)));
        const v = K.io(t, tD + 1.0, tD + 2.2);
        if (v > 0) K.line(c, DIPPER[0][0], DIPPER[0][1], lerp(DIPPER[0][0], POLARIS[0] - 18, v), lerp(DIPPER[0][1], POLARIS[1] + 18, v), 'rgba(255,226,160,0.55)', 2);
        caps(c, 'ЖЕТІҚАРАҚШЫ', 690, 610, { size: 24, alpha: K.u(t, tD + 0.4, tD + 1.0) });
        PLEIADES.forEach(([x, y], i) => star(c, x, y, 3.4, K.u(t, tU + i * 0.08, tU + i * 0.08 + 0.3)));
        caps(c, 'ҮРКЕР', 1466, 600, { size: 26, alpha: K.u(t, tU + 0.5, tU + 1.1) });
      });
    } },
    { at: 'k3', img: 'ch_int1', mv: mv('out', 0.5, 0.5), draw: (c, t) => {
      // the yurt seen from above: the place of honour (төр) and the threshold (босаға)
      const ta = L.k3.t + 1.2, R = 270, u = K.io(t, ta - 0.3, ta + 1.4), cy = CY - 6;
      c.fillStyle = `rgba(6,12,30,${0.62 * K.io(t, ta - 0.8, ta + 0.4)})`; c.fillRect(0, 0, W, H);
      c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.arc(CX, cy, R, Math.PI / 2 + 0.22, Math.PI / 2 + 0.22 + u * (Math.PI * 2 - 0.44)); c.stroke();
      c.lineWidth = 1.5; c.strokeStyle = 'rgba(226,182,89,0.45)';
      for (let i = 0; i < 24; i++) { const an = i / 24 * Math.PI * 2; c.beginPath(); c.moveTo(CX + Math.cos(an) * 46, cy + Math.sin(an) * 46); c.lineTo(CX + Math.cos(an) * lerp(46, R, u), cy + Math.sin(an) * lerp(46, R, u)); c.stroke(); }
      c.restore();
      if (u > 0) { K.glow(c, CX, cy, 90, 'rgba(255,150,60,0.8)', u); K.circle(c, CX, cy, 34, 'rgba(255,170,80,0.25)', GOLD, 3); }
      big(c, 'ТӨР', CX, cy - R + 60, { size: 34, spacing: 8, color: '#FFE7B0', alpha: K.u(t, ta + 0.4, ta + 1.0) });
      K.text(c, 'құрметті орын', CX, cy - R + 104, { size: 24, italic: true, weight: 400, color: CREAM, alpha: K.u(t, ta + 0.8, ta + 1.4), shadow: 10 });
      big(c, 'БОСАҒА', CX, cy + R + 44, { size: 34, spacing: 8, color: '#FFE7B0', alpha: K.u(t, L.k4.t - 0.1, L.k4.t + 0.5) });
      caps(c, 'ІШКІ', CX - 150, cy + 60, { size: 22, color: CREAM, alpha: K.u(t, at('k4', 'ішкі'), at('k4', 'ішкі') + 0.6) });
      caps(c, 'СЫРТҚЫ', 1460, VIEW.y + 120, { size: 22, color: CREAM, alpha: K.u(t, at('k4', 'сыртқы'), at('k4', 'сыртқы') + 0.6) });
    } },
  ]);
  SCENES.timespace = (ctx, t) => { run(ctx, t, TIMESPACE); chapter(ctx, t, 'timespace', 'VI'); };

  // ============ ЭТНОДИЗАЙНҒА БЕЙІМДЕУ (n2–n5) ============
  const simplify = (c, t, sh) => {
    paper(c);
    const u = K.io(t, at('n3', 'ұсақ'), at('n3', 'негізгі') + 0.4);
    K.horns(c, 560, CY - 150, 230, '#7A1F1B', 4, K.io(t, sh.start, sh.start + 1.4));
    K.text(c, 'дәстүрлі', 560, CY + 200, { size: 30, italic: true, weight: 400, color: '#5A4630' });
    K.line(c, 840, CY, lerp(840, 1060, u), CY, '#B58D4A', 4); if (u > 0.95) K.poly(c, [[1080, CY], [1058, CY - 12], [1058, CY + 12]], '#B58D4A');
    K.alpha(c, u, () => { c.save(); c.fillStyle = NAVY; c.beginPath(); c.roundRect(1200, CY - 190, 380, 380, 70); c.fill(); c.restore(); hornsGeo(c, 1390, CY - 110, 190, '#E8C46A', 16); });
    K.text(c, 'ықшамдалған', 1390, CY + 240, { size: 30, italic: true, weight: 400, color: '#5A4630', alpha: u });
  };
  const parametric = (c, t) => {
    c.fillStyle = '#0A1330'; c.fillRect(0, 0, W, H);
    const t1 = at('n4', 'модуль'), t2 = at('n4', 'қайталану'), t3 = at('n4', 'аралығы'), t4 = at('n4', 'айналу');
    const size = lerp(70, 104, 0.5 + 0.5 * Math.sin((t - t1) * 1.6) * K.u(t, t1, t1 + 0.5));
    const count = Math.round(lerp(10, 6, (0.5 + 0.5 * Math.sin((t - t2) * 1.2)) * K.u(t, t2, t2 + 0.5)));
    const gapX = lerp(1.5, 1.15, (0.5 + 0.5 * Math.sin((t - t3) * 1.3)) * K.u(t, t3, t3 + 0.5)) * size;
    const ang = K.u(t, t4, t4 + 0.4) * (Math.PI / 4) * (0.5 + 0.5 * Math.sin((t - t4) * 1.5));
    c.save(); c.beginPath(); c.rect(0, VIEW.y, 1380, VIEW.h); c.clip();
    const rows = 5, rh = VIEW.h / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < count; i++) {
      const x = 90 + i * gapX, y = VIEW.y + j * rh + rh * 0.2, odd = (i + j) % 2;
      if (x > 1360) continue;
      c.save(); c.translate(x, y + size * 0.45); c.rotate(ang * (odd ? 1 : -1)); hornsGeo(c, 0, -size * 0.45, size, odd ? '#E8C46A' : '#7FD3FF', 3); c.restore();
    }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(1400, VIEW.y + 30, 460, VIEW.h - 60);
    const row = (k, s, v, ta) => { const a = K.u(t, ta - 0.1, ta + 0.4); K.text(c, s, 1440, VIEW.y + 110 + k * 170, { size: 24, weight: 700, align: 'left', color: '#9FB7E0', alpha: 0.5 + 0.5 * a }); K.text(c, v, 1440, VIEW.y + 162 + k * 170, { size: 42, weight: 800, align: 'left', color: a > 0.5 ? '#FFFFFF' : '#5E7194' }); };
    row(0, 'МОДУЛЬ ӨЛШЕМІ', `${Math.round(size)} px`, t1); row(1, 'ҚАЙТАЛАНУ САНЫ', `${count}`, t2); row(2, 'АРАЛЫҒЫ', `${Math.round(gapX)} px`, t3); row(3, 'АЙНАЛУ БҰРЫШЫ', `${Math.round(ang * 180 / Math.PI)}°`, t4);
  };
  const TODAY = shots('today', [
    { img: 'a_ast2', mv: mv('in', 0.5, 0.45) },
    { at: 'n2', img: 'u_museum', mv: mv('l2r', 0.5, 0.5), draw: (c, t) => chips(c, t, [['ШЫҒУ ТЕГІ', at('n2', 'шығу')]], { y: VIEW.y + 110 }) },
    { at: 'n3', paint: simplify },
    { at: 'n4', paint: parametric },
    { at: 'n5', img: 'c_pattern', mv: mv('in', 0.4, 0.5, 1.2), draw: (c, t) => {
      // a museum label: where the pattern comes from
      const ta = at('n5', 'Дереккөзді'), a = K.io(t, ta - 0.2, ta + 0.6), x = 1250, y = VIEW.y + 150;
      K.alpha(c, a, () => {
        c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.fillStyle = 'rgba(246,240,226,0.96)'; c.fillRect(x, y, 520, 330); c.restore();
        K.rect(c, x, y, 8, 330, '#7A1F1B');
        K.text(c, 'Өрнек: қошқар мүйіз', x + 40, y + 60, { size: 30, weight: 800, align: 'left', color: '#2A2118' });
        [['Дереккөзі', 'музей, каталог'], ['Аймағы', '· · · · ·'], ['Кезеңі', '· · · · ·'], ['Материалы', 'киіз']].forEach(([k, v], i) => {
          K.text(c, k, x + 40, y + 125 + i * 50, { size: 24, weight: 700, align: 'left', color: '#7A5C3A' });
          K.text(c, v, x + 230, y + 125 + i * 50, { size: 24, weight: 400, align: 'left', color: '#2A2118' });
        });
      });
    } },
  ]);
  SCENES.today = (ctx, t) => { run(ctx, t, TODAY); chapter(ctx, t, 'today', 'VII'); };

  // ============ СИМВОЛДЫҢ ШЫҒУ ТЕГІ — the ending (e2, e3) ============
  const ICONS = [['шеңбер', (c, x, y, u) => { c.save(); c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 46, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); c.stroke(); c.restore(); }],
    ['шиыршық', (c, x, y, u) => { const p = []; for (let i = 0; i <= 120; i++) { const q = i / 120, an = q * 3.2 * Math.PI * 2; p.push([x + Math.cos(an) * q * 48, y + Math.sin(an) * q * 48]); } glowLine(c, p, u, { lw: 3 }); }],
    ['ирек', (c, x, y, u) => scroll(c, y, 16, 46, 0, { lw: 3, u, x0: x - 70, x1: x + 70, speed: 0 })],
    ['тұйық', (c, x, y, u) => { const p = []; for (let i = 0; i <= 200; i++) { const q = i / 200 * Math.PI * 2; p.push([x + 60 * Math.sin(3 * q + Math.PI / 2), y + 44 * Math.sin(2 * q)]); } glowLine(c, p, u, { lw: 3, close: true }); }],
    ['өрнектер', (c, x, y, u) => K.horns(c, x, y - 40, 60, GOLD, 4, u)]];
  const END = shots('end', [
    { img: 'undp_altyn', mv: mv('out', 0.5, 0.5) },
    ...montage('e2', [['Күн', 's_before', mv('in', 0.5, 0.5)], ['жыл', 's_apricot', mv('in', 0.45, 0.45)], ['көш', 'p_eagle2', mv('l2r', 0.5, 0.55)], ['ұрпақ', 'p_grandma', mv('in', 0.55, 0.45)]], { fade: 0.8 }),
    { at: 'e3', img: 'c_pattern', mv: mv('out', 0.5, 0.5, 1.05), dim: 0.55, draw: (c, t) => {
      ICONS.forEach(([w, f], i) => { const tw = at('e3', w), x = 360 + i * 300, y = CY - 20; const u = K.io(t, tw - 0.2, tw + 0.8); if (u > 0) { f(c, x, y, u); K.text(c, w, x, y + 110, { size: 28, weight: 600, color: CREAM, alpha: K.u(t, tw, tw + 0.5), shadow: 12 }); } });
    } },
    { at: ev.fin - 1.6, img: 'my_1', mv: [{ zoom: 1.3, x: 0.45, y: 0.6 }, { zoom: 1.02, x: 0.5, y: 0.55 }], lead: 0, fade: 1.4 },
  ]);
  SCENES.end = (ctx, t) => {
    run(ctx, t, END);
    chapter(ctx, t, 'end', 'VIII');
    // the end card: the title and the credits
    ctx.fillStyle = `rgba(0,0,0,${0.62 * K.io(t, ev.fin - 0.2, ev.fin + 1.2)})`; ctx.fillRect(0, 0, W, H);
    K.alpha(ctx, K.u(t, ev.fin, ev.fin + 1.0), () => {
      K.shanyrak(ctx, CX, 250, 48, GOLD, 3, t * 0.08);
      K.text(ctx, 'ШЕКСІЗДІК ПЕН МӘҢГІЛІК', CX, 360, { size: 70, weight: 800, spacing: 5, shadow: 24 });
      K.rect(ctx, CX - 200, 408, 400, 2, GOLD);
    });
    const people = [...new Set((globalThis.CREDITS || []).map((x) => x.author.replace(/\s*\(.*$/, '')))];
    const lines = ['Мәтін: «Қазақтың дәстүрлі қолөнеріндегі шексіздік пен мәңгілік идеясы»'];
    let cur = 'Фото:';
    for (const p of people) { if ((cur + ' · ' + p).length > 112) { lines.push(cur); cur = p; } else cur += (cur.endsWith(':') ? ' ' : ' · ') + p; }
    lines.push(cur, 'Flickr · CC BY / BY-SA / BY-NC / BY-NC-SA', 'Дауыс: ISSAI KazakhTTS (синтез) · Музыка: домбыраға арналған түпнұсқа күй');
    lines.forEach((s, i) => K.text(ctx, s, CX, 470 + i * 38, { size: i === 0 ? 22 : 19, weight: 400, color: 'rgba(243,234,210,0.86)', alpha: K.u(t, ev.fin + 0.8 + i * 0.2, ev.fin + 1.6 + i * 0.2) }));
  };
})();
