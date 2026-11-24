// GRAPHICS C: the opening title, big titles over photographs, the horizon line, and a few drawings the plan names.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE, GR = globalThis.GR, BG = globalThis.BG, OV = globalThis.OV, H = globalThis.GH;
  const { clamp, lerp, ease } = U;
  const { line: L, scenes: SCN, names, ev, figs } = SC;
  const { IMG } = K;
  const W = G.W, HH = G.H;
  const { CX, CY, TOP, BOT, CREAM, GOLD, PALE, NAVY, INK } = GR;
  const { at, end, win, glowLine, caps, big, small, wrap, hornsGeo, circlePts, star } = H;
  const uu = (t, a, b) => K.u(t, a, b), io = (t, a, b) => K.io(t, a, b);
  // ---------- the painters the plan names that live here ----------
  // the opening: the steppe at sunset and the title of the text
  GR.titleCard = (c, t, sh) => {
    const img = IMG.ak_sunset;
    if (img) G.kenBurns(c, img, 0, TOP, W, BOT - TOP, t, -1, sh.end + 1.5, { from: { zoom: 1.28, x: 0.47, y: 0.62 }, to: { zoom: 1.06, x: 0.5, y: 0.58 } });
    H.grade(c, 0.1, 0.3);
    const ta = 1 - uu(t, sh.end - 1.2, sh.end + 0.2), t0 = ev.title; if (ta <= 0) return;
    c.fillStyle = `rgba(0,0,0,${0.4 * ta})`; c.fillRect(0, 0, W, HH);
    K.alpha(c, ta, () => {
      K.alpha(c, io(t, t0, t0 + 2.4), () => K.shanyrak(c, CX, 318, 58, GOLD, 3, t * 0.08));
      K.text(c, 'ҚАЗАҚТЫҢ ДӘСТҮРЛІ ҚОЛӨНЕРІНДЕГІ', CX, 440, { size: 30, weight: 700, color: GOLD, spacing: 9, alpha: uu(t, t0 + 0.4, t0 + 1.4), shadow: 14 });
      K.track(c, 'ШЕКСІЗДІК ПЕН МӘҢГІЛІК', CX, 525, t, t0, { size: 96, weight: 800, spacing: 5, wide: 40, shadow: 30 });
      const u = K.out(t, t0 + 0.6, t0 + 2.0); K.rect(c, CX - 220 * u, 590, 440 * u, 3, GOLD);
      K.text(c, 'И Д Е Я С Ы', CX, 640, { size: 32, weight: 400, color: CREAM, spacing: 6, alpha: uu(t, t0 + 1.2, t0 + 2.2), shadow: 14 });
    });
  };
  // a big title over a photograph for a few seconds
  GR.bigTitle = (title, sub) => (c, t, sh) => {
    const a = win(t, sh.start + 0.4, sh.start + 4.6, 0.7, 0.8); if (a <= 0) return;
    K.alpha(c, a, () => { K.track(c, title, CX, CY - 40, t, sh.start + 0.4, { size: 88, weight: 800, spacing: 4, wide: 30, shadow: 30 }); const u = K.out(t, sh.start + 0.7, sh.start + 2); K.rect(c, CX - 170 * u, CY + 26, 340 * u, 3, GOLD); if (sub) K.text(c, sub, CX, CY + 70, { size: 30, weight: 400, color: CREAM, spacing: 3, shadow: 14, alpha: uu(t, sh.start + 1.2, sh.start + 2) }); });
  };
  // the horizon of a photograph becomes a line without an end; label appears at labelWord
  GR.horizonOn = (py, id, word, labelWord, label = 'ШЕКСІЗДІК') => (c, t, sh) => {
    const img = IMG[sh.img]; if (!img) return;
    const u0 = ease.inOutQuad(clamp((t - sh.k0) / (sh.k1 - sh.k0))), [a, b] = sh.mv, zoom = lerp(a.zoom, b.zoom, u0), fy = lerp(a.y, b.y, u0);
    const cover = Math.max(W / img.width, (BOT - TOP) / img.height) * zoom, ih = img.height * cover, hy = TOP + clamp((BOT - TOP) / 2 - fy * ih, (BOT - TOP) - ih, 0) + py * ih;
    c.fillStyle = K.grad(c, 0, TOP, 0, hy, [[0, 'rgba(34,52,92,0.5)'], [0.7, 'rgba(120,110,120,0.15)'], [1, 'rgba(255,190,120,0.1)']]); c.fillRect(0, TOP, W, hy - TOP);
    const ta = at(id, word), k = io(t, ta - 0.4, ta + 2.6);
    K.alpha(c, win(t, ta - 0.4, sh.end + 0.6, 0.3, 1.0), () => { K.glow(c, CX, hy, 380 * k + 40, 'rgba(255,190,100,0.3)'); K.line(c, CX, hy, CX - 1000 * k, hy, 'rgba(255,226,160,0.95)', 3); K.line(c, CX, hy, CX + 1000 * k, hy, 'rgba(255,226,160,0.95)', 3); K.streak(c, CX, hy, 700 * k, '255,226,170', 0.7); });
    if (label) K.text(c, label, CX, hy + 96, { size: 60, weight: 800, spacing: 16, color: '#FFF4DC', shadow: 34, alpha: win(t, labelWord ? at(id, labelWord) : ta + 1, sh.end + 0.6, 0.8, 1.0) });
  };
  GR.skyGlow = (id, word) => (c, t) => K.glow(c, CX, CY - 20, 460, 'rgba(255,246,225,0.35)', io(t, at(id, word) - 0.5, end(id) + 0.6));
  GR.ringOn = (id, word, label, labelWord) => (c, t) => { const k = io(t, at(id, word), end(id) + 0.3); glowLine(c, circlePts(CX, CY, 320), k, { lw: 4, color: 'rgba(255,230,170,0.85)', close: true }); if (label) small(c, label, CX, CY + 360, { size: 32, italic: true, alpha: uu(t, at(id, labelWord), at(id, labelWord) + 0.6) }); };
  // one circle, many meanings: the Sun, the sky, the centre, the whole, the balance
  GR.circleMeanings = () => (c, t, sh) => {
    BG.stage(c, t, sh);
    const id = sh.id, R = 200, tw = (w) => at(id, w), k0 = io(t, sh.start + 0.1, sh.start + 1.2);
    glowLine(c, circlePts(CX, CY, R), k0, { lw: 4 });
    const sun = uu(t, tw('Күнді') - 0.1, tw('Күнді') + 0.6) * (1 - uu(t, tw('орталықты') - 0.3, tw('орталықты') + 0.2));
    if (sun > 0) K.alpha(c, sun, () => { K.glow(c, CX, CY, 360, 'rgba(255,190,90,0.7)'); for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2 + t * 0.1; K.line(c, CX + Math.cos(an) * (R + 20), CY + Math.sin(an) * (R + 20), CX + Math.cos(an) * (R + 70), CY + Math.sin(an) * (R + 70), PALE, 4); } });
    const sky = uu(t, tw('аспан') - 0.1, tw('аспан') + 0.6) * (1 - uu(t, tw('орталықты') - 0.3, tw('орталықты') + 0.2));
    if (sky > 0) K.alpha(c, sky, () => { for (let i = 0; i < 40; i++) { const an = U.hash(i, 3) * Math.PI * 2, r = Math.sqrt(U.hash(i, 4)) * (R - 20); star(c, CX + Math.cos(an) * r, CY + Math.sin(an) * r, 2, 0.9); } });
    const cen = uu(t, tw('орталықты') - 0.1, tw('орталықты') + 0.6); if (cen > 0) K.alpha(c, cen, () => GR.medallionAt(c, t, CX, CY, R, tw('орталықты')));
    const bal = uu(t, tw('тепе-теңдікті') - 0.1, tw('тепе-теңдікті') + 0.6); if (bal > 0) K.alpha(c, bal, () => { K.line(c, CX - 420, CY + R + 60, CX + 420, CY + R + 60, GOLD, 4); K.circle(c, CX - 420, CY + R + 60, 18, PALE); K.circle(c, CX + 420, CY + R + 60, 18, PALE); });
    [['КҮН', 'Күнді', CX - 520, CY - 120], ['АСПАН', 'аспан', CX + 520, CY - 120], ['ОРТАЛЫҚ', 'орталықты', CX - 520, CY + 90], ['ТҰТАСТЫҚ', 'тұтастықты', CX + 520, CY + 90], ['ТЕПЕ-ТЕҢДІК', 'тепе-теңдікті', CX, BOT - 50]].forEach(([s, w, x, y]) => big(c, s, x, y, { size: 40, spacing: 4, alpha: uu(t, tw(w) - 0.1, tw(w) + 0.5) }));
  };
  // an endless ornament along a bag's seam, a coat's hem, a table's edge and a path through a room
  GR.products = () => (c, t, sh) => {
    BG.paper(c);
    const id = sh.id, items = [['сөмкенің тігісі', 'сөмкенің'], ['киімнің етегі', 'киімнің'], ['жиһаздың қыры', 'жиһаздың'], ['интерьердегі бағыт', 'интерьердегі']];
    items.forEach(([s, w], i) => {
      const tw = at(id, w), a = uu(t, tw - 0.2, tw + 0.5); if (a <= 0) return;
      const x = CX + (i - 1.5) * 420, y = CY - 20, k = io(t, tw, tw + 1.6);
      K.alpha(c, a, () => {
        if (i === 0) { K.poly(c, [[x - 120, y - 60], [x + 120, y - 60], [x + 150, y + 150], [x - 150, y + 150]], '#8B5A2B'); c.save(); c.strokeStyle = '#5E3A17'; c.lineWidth = 6; c.beginPath(); c.arc(x, y - 60, 70, Math.PI, 0); c.stroke(); c.restore(); H.scroll(c, y + 40, 10, 30, t, { color: '#E8C46A', lw: 3, k, x0: x - 135, x1: x + 135 }); }
        if (i === 1) { K.poly(c, [[x - 70, y - 160], [x + 70, y - 160], [x + 130, y + 160], [x - 130, y + 160]], '#1D2F63'); H.scroll(c, y + 140, 10, 30, t, { color: '#E8C46A', lw: 3, k, x0: x - 125, x1: x + 125 }); }
        if (i === 2) { K.rect(c, x - 160, y - 20, 320, 40, '#8B5A2B'); K.rect(c, x - 140, y + 20, 20, 140, '#6E4420'); K.rect(c, x + 120, y + 20, 20, 140, '#6E4420'); H.scroll(c, y, 8, 26, t, { color: '#E8C46A', lw: 3, k, x0: x - 155, x1: x + 155 }); }
        if (i === 3) { K.poly(c, [[x - 160, y + 160], [x + 160, y + 160], [x + 60, y - 120], [x - 60, y - 120]], '#CBBFA6'); for (let q = 0; q < 6; q++) { const v = q / 5; if (v > k) break; K.horns(c, x, lerp(y + 130, y - 90, v) - lerp(40, 12, v), lerp(50, 16, v), '#7A1F1B', 2.5, 1); } }
        K.text(c, s, x, y + 230, { size: 28, weight: 800, color: INK });
      });
    });
  };
  // authorship: the composition, its author and its source
  GR.copyright = () => (c, t, sh) => {
    BG.stage(c, t, sh);
    const id = sh.id, a = uu(t, sh.start + 0.2, sh.start + 0.8);
    K.alpha(c, a, () => {
      GR.box(c, CX - 520, CY - 230, 1040, 460, 30, 'rgba(246,240,226,0.96)', null);
      hornsGeo(c, CX - 300, CY - 140, 200, '#7A1F1B', 10);
      [['Композиция', 'заманауи автордікі', 'Қазіргі'], ['Авторлық құқық', 'сақталады', 'авторлық'], ['Дереккөзі', 'көрсетіледі', 'дереккөзі']].forEach(([k, v, w], i) => { const q = uu(t, at(id, w) - 0.1, at(id, w) + 0.5); K.text(c, k, CX - 20, CY - 110 + i * 100, { size: 30, weight: 800, align: 'left', color: INK, alpha: q }); K.text(c, v, CX - 20, CY - 70 + i * 100, { size: 24, weight: 400, align: 'left', color: '#7A5C3A', alpha: q }); });
      K.text(c, '©', CX - 300, CY + 150, { size: 70, weight: 800, color: '#B58D4A', alpha: uu(t, at(id, 'авторлық'), at(id, 'авторлық') + 0.6) });
    });
  };
})();
