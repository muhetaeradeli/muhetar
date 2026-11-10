// SCENES 8–15: Mondrian, the Bauhaus, New York, sculpture / minimalism / op art, the Kazakh ornament and
// the kui, how to look, abstraction today, the ending.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const { ev, line: L, S, BEAT } = SC;
  const { C, VIEW, IMG } = K;
  const W = G.W, H = G.H;
  const SCENES = (globalThis.SCENES = globalThis.SCENES || {});
  const PAL = [C.red, C.yellow, C.blue, '#2E9E6B', '#E8792F', '#8B4FB0', '#F1EDE4'];

  // ============ 8. MONDRIAN: the grid builds itself, line by line ============
  function grid(ctx, t, cx, cy, s, fillT) {
    const x = cx - s / 2, y = cy - s / 2, lw = s * 0.022;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20; K.rect(ctx, x, y, s, s, '#F1EEE6'); ctx.restore();
    const f = (i) => K.out(t, fillT + i * 0.7, fillT + i * 0.7 + 0.6);
    K.alpha(ctx, f(0), () => K.rect(ctx, x + s * 0.22, y, s * 0.78, s * 0.72, C.red));
    K.alpha(ctx, f(1), () => K.rect(ctx, x, y + s * 0.72, s * 0.22, s * 0.28, C.blue));
    K.alpha(ctx, f(2), () => K.rect(ctx, x + s * 0.9, y + s * 0.87, s * 0.1, s * 0.13, C.yellow));
    const ln = [[0.22, 0, 0.22, 1], [0, 0.72, 1, 0.72], [0, 0.37, 0.22, 0.37], [0.9, 0.72, 0.9, 1], [0.9, 0.87, 1, 0.87]];
    ctx.lineCap = 'butt';
    ln.forEach(([a, b, c, d], i) => { const u = K.out(t, ev.mondrianLines[i], ev.mondrianLines[i] + 0.4); if (u <= 0) return; ctx.beginPath(); ctx.moveTo(x + a * s, y + b * s); ctx.lineTo(x + lerp(a, c, u) * s, y + lerp(b, d, u) * s); ctx.strokeStyle = C.ink; ctx.lineWidth = lw; ctx.stroke(); });
  }
  function facade(ctx, t, t0, x, y) { // planes that slide together into a De Stijl house
    const P = [[0, 120, 300, 260, '#F3F0E8'], [240, 40, 280, 200, '#DAD6CC'], [-40, 80, 200, 26, C.ink], [300, 250, 240, 130, '#F3F0E8'], [120, 0, 22, 380, C.yellow], [470, 30, 22, 350, C.red], [220, 300, 160, 22, C.blue], [60, 190, 110, 120, '#39424E'], [340, 90, 120, 90, '#39424E'], [-60, 380, 660, 16, C.ink]];
    P.forEach(([px, py, w, h, c], i) => { const u = K.out(t, t0 + i * 0.22, t0 + i * 0.22 + 0.7); if (u <= 0) return; const dx = (i % 2 ? 1 : -1) * (1 - u) * 240, dy = (i % 3 === 0 ? -1 : 0.4) * (1 - u) * 160; K.alpha(ctx, u, () => K.rect(ctx, x + px + dx, y + py + dy, w, h, c)); });
  }
  SCENES.mondrian = (ctx, t) => {
    const [t0, t1] = S.mondrian, m1 = L.mon1, m2 = L.mon2, m3 = L.mon3, m4 = L.mon4;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        c.fillStyle = '#1B46A0'; c.fillRect(0, 0, W, H);
        K.paper(c, '#1B46A0', 'rgba(255,255,255,0.05)');
        const mv = K.io(t, m1.t - 0.4, m1.t + 1.6);
        K.cam(c, { x: lerp(0, 190, mv) - 180 * K.io(t, m2.t - 0.3, m2.t + 0.9), zoom: lerp(1, 1.12, mv), ...K.drift(t, 2, 31) }, () => grid(c, t, 1340, 540, 620, m1.t + 1.2));
        K.chapter(c, t, t0 + 0.2, 'V', 'ПИТ МОНДРИАН', '1872 – 1944', { dur: m1.t - t0 - 0.1, x: 520 });
        K.track(c, 'НЕОПЛАСТИЦИЗМ', 470, 500, t, m2.t + 0.2, { size: 74, weight: 800, spacing: 4, wide: 30, shadow: 20 });
        K.text(c, '«жаңа пластика»', 470, 580, { size: 32, weight: 400, alpha: K.u(t, m2.t + 1, m2.t + 1.8), color: '#DCE6FF' });
      } },
      { at: m3.t - 0.6, fade: 1.1, draw: (c, t) => {
        c.fillStyle = '#1B46A0'; c.fillRect(0, 0, W, H); K.paper(c, '#1B46A0', 'rgba(255,255,255,0.05)');
        K.cam(c, { zoom: lerp(1.0, 1.5, K.io(t, m3.t - 0.6, m4.t)), y: lerp(0, 60, K.u(t, m3.t, m4.t)), ...K.drift(t, 2, 33) }, () => K.framed(c, IMG.mondrian, 960, 540, 640, { frame: 10, color: '#F4F1EA' }));
        K.label(c, t, m3.t + 0.3, m4.t - 0.5, '«Қызыл, көк және сары композиция»', 'Пит Мондриан · 1930');
      } },
      { at: m4.t - 0.6, fade: 0.9, draw: (c, t) => {
        K.wall(c, t, '#D8D2C4');
        K.cam(c, { zoom: 1 + 0.06 * K.u(t, m4.t, t1), x: 24 * K.u(t, m4.t, t1), ...K.drift(t, 3, 35) }, () => {
          K.framed(c, IMG.doesburg, 520, 536, 520, { frame: 0 });
          facade(c, t, m4.t + 0.9, 1130, 330);
          K.text(c, 'DE STIJL', 1400, 800, { size: 54, weight: 800, color: C.ink, spacing: 16, alpha: K.u(t, m4.t + 1.4, m4.t + 2.2) });
        });
        K.label(c, t, m4.t + 0.4, t1 - 0.2, '«Контр-композиция V»', 'Тео ван Дусбург · 1924');
      } },
    ]);
  };

  // ============ 9. THE BAUHAUS ============
  function school(ctx, t) {
    ctx.fillStyle = K.grad(ctx, 0, VIEW.y, 0, 760, [[0, '#BFD3E6'], [1, '#EFE9DC']]); ctx.fillRect(-600, -200, W + 1200, 1000);
    K.rect(ctx, -600, 760, W + 1200, 400, '#C9C2B2');
    // the workshop wing: a glass curtain wall
    K.rect(ctx, 220, 330, 880, 430, '#F4F2EC'); K.rect(ctx, 250, 380, 820, 330, '#33475C');
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let x = 250; x <= 1070; x += 41) { ctx.moveTo(x, 380); ctx.lineTo(x, 710); }
    for (let y = 380; y <= 710; y += 55) { ctx.moveTo(250, y); ctx.lineTo(1070, y); }
    ctx.stroke();
    ctx.fillStyle = K.grad(ctx, 250, 380, 1070, 710, [[0, 'rgba(255,255,255,0.28)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0.12)']]); ctx.fillRect(250, 380, 820, 330);
    // the tower block with the vertical lettering
    K.rect(ctx, 1100, 250, 240, 510, '#FAF8F2'); K.rect(ctx, 1340, 420, 420, 340, '#EDEAE2');
    'BAUHAUS'.split('').forEach((ch, i) => K.text(ctx, ch, 1150, 300 + i * 62, { size: 54, weight: 800, color: '#2A2A2A' }));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) K.rect(ctx, 1380 + i * 95, 460 + j * 95, 60, 60, '#33475C');
    for (let j = 0; j < 4; j++) K.rect(ctx, 1220, 300 + j * 110, 90, 60, '#33475C');
  }
  SCENES.bauhaus = (ctx, t) => {
    const [t0, t1] = S.bauhaus, b1 = L.bau1, b2 = L.bau2, b3 = L.bau3;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        // a tracking shot along the building, a blurred lamp-post passing close to the lens
        const u = K.u(t, t0, b2.t);
        K.cam(c, { x: lerp(-140, 150, ease.inOutQuad(u)), zoom: 1.12, ...K.drift(t, 2, 41) }, () => school(c, t));
        K.blur(c, 22, () => K.rect(c, lerp(1700, 150, u), 0, 70, H, 'rgba(30,30,34,0.9)'));
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 0, W, H);
        K.track(c, 'БАУХАУС', 960, 250, t, t0 + 0.3, { size: 104, weight: 800, spacing: 10, wide: 40, shadow: 30 });
        K.text(c, 'Германия · 1919 – 1933', 960, 330, { size: 30, weight: 400, spacing: 4, alpha: K.u(t, t0 + 1, t0 + 1.8), shadow: 14 });
        const names = ['өнер', 'қолөнер', 'дизайн'], d = b1.dur;
        [0, 1, 2].forEach((i) => { const a = K.out(t, b1.t + 1.4 + i * d * 0.2, b1.t + 2 + i * d * 0.2); if (a <= 0) return; const x = 660 + i * 300, y = 600 - (1 - a) * -40;
          K.alpha(c, a, () => { c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; if (i === 0) K.poly(c, [[x - 80, y + 70], [x + 80, y + 70], [x, y - 70]], C.yellow); else if (i === 1) K.rect(c, x - 70, y - 70, 140, 140, C.red); else K.circle(c, x, y, 76, C.blue); c.restore(); K.text(c, names[i], x, y + 120, { size: 34, weight: 700, shadow: 14 }); }); });
      } },
      { at: b2.t - 0.5, fade: 0.9, draw: (c, t) => {
        K.wall(c, t, '#211A16');
        K.cam(c, { x: lerp(-70, 70, K.u(t, b2.t - 0.5, b3.t)), zoom: 1.08, ...K.drift(t, 2, 43) }, () => { K.framed(c, IMG.klee, 700, 536, 500, { frame: 14 }); K.framed(c, IMG.senecio, 1420, 536, 500, { frame: 14 }); });
        K.label(c, t, b2.t + 0.2, b3.t - 0.4, '«Қамал мен күн» · «Сенецио»', 'Пауль Клее · 1928 · 1922');
      } },
      { at: b3.t - 0.5, fade: 0.8, draw: (c, t) => {
        // a point moves and makes a line; the line moves and makes a plane
        K.cam(c, { zoom: 1 + 0.05 * K.u(t, b3.t, t1), ...K.drift(t, 2, 45) }, () => {
          K.paper(c);
          const d = b3.dur, a = K.io(t, b3.t + d * 0.18, b3.t + d * 0.42), b = K.io(t, b3.t + d * 0.42, b3.t + d * 0.72);
          const x0 = 520, x1 = lerp(520, 1400, a), y0 = 360, y1 = lerp(360, 700, b);
          if (b > 0) { c.fillStyle = 'rgba(31,79,181,0.85)'; c.fillRect(x0, y0, x1 - x0, y1 - y0); }
          if (a > 0) K.line(c, x0, y1, x1, y1, C.ink, 9);
          K.alpha(c, K.u(t, b3.t - 0.2, b3.t + 0.3), () => K.circle(c, x1, y1, 20, C.red));
          const w = (s, x, y, at) => K.text(c, s, x, y, { size: 44, weight: 800, color: C.ink, alpha: K.u(t, at, at + 0.4) });
          w('нүкте', 520, 290, b3.t + 0.1); w('сызық', 960, 290, b3.t + d * 0.25); w('жазықтық', 1400, 290, b3.t + d * 0.5);
          K.text(c, 'В. Кандинский · «Нүкте мен сызық жазықтықта» · 1926', 960, 800, { size: 28, weight: 400, color: '#5A4E3C', alpha: K.u(t, b3.t + d * 0.6, b3.t + d * 0.8) });
        });
      } },
    ]);
  };

  // ============ 10. NEW YORK: the centre moves; Pollock on the floor; Rothko's fields ============
  function skyline(ctx, t, lift) {
    ctx.fillStyle = K.grad(ctx, 0, VIEW.y - 300, 0, 900, [[0, '#060916'], [0.55, '#172655'], [0.85, '#B4572E'], [1, '#F0A64A']]); ctx.fillRect(-300, -600, W + 600, 1700);
    [[0.25, '#1B2140', 61, 0.55], [0.55, '#111630', 73, 0.8], [1, '#080A18', 89, 1.1]].forEach(([depth, col, seed, sc], li) => {
      ctx.save(); ctx.translate(0, lift * depth);
      let x = -200; let i = 0;
      while (x < W + 200) {
        const w = (70 + U.hash(i, seed) * 120) * sc, h = (180 + U.hash(i, seed + 1) * 480) * sc, y = 900 - h;
        K.rect(ctx, x, y, w, h + 900, col);
        if (U.hash(i, seed + 2) > 0.7) K.rect(ctx, x + w * 0.42, y - 60 * sc, w * 0.16, 60 * sc, col);
        if (li > 0) for (let a = 0; a < w / 22 - 1; a++) for (let b = 0; b < h / 30 - 1; b++) if (U.hash(i, a, b, seed) > 0.62) K.rect(ctx, x + 10 + a * 22, y + 14 + b * 30, 9, 14, `rgba(255,214,130,${0.35 + 0.5 * U.hash(i, a, b, 7)})`);
        x += w + 6 * sc; i++;
      }
      ctx.restore();
    });
  }
  // Pollock's method: skeins of paint that the arm throws across a canvas on the floor (an illustration)
  const SKEINS = Array.from({ length: 34 }, (_, i) => ({ c: ['#141414', '#F3EFE4', '#141414', '#C9972B', '#141414', '#8E2A1E', '#F3EFE4'][i % 7], w: 3 + U.hash(i, 91) * 9, seed: 100 + i * 7 }));
  function drips(ctx, t, t0, t1) {
    ctx.fillStyle = '#CDBB96'; ctx.fillRect(-900, -900, W + 1800, H + 1800);
    const total = clamp((t - t0) / (t1 - t0)) * SKEINS.length;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    SKEINS.forEach((sk, i) => {
      const u = clamp(total - i * 0.82, 0, 1.6) / 1.6; if (u <= 0) return;
      const n = Math.round(150 * u);
      ctx.beginPath();
      for (let k = 0; k <= n; k++) { const p = k / 150 * 5; const x = 960 + U.noise1(p + sk.seed, sk.seed) * 1250 + U.noise1(p * 5, sk.seed + 1) * 150, y = 540 + U.noise1(p + 40, sk.seed + 2) * 640 + U.noise1(p * 5, sk.seed + 3) * 110; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.strokeStyle = sk.c; ctx.lineWidth = sk.w; ctx.stroke();
      for (let k = 0; k < 26 * u; k++) K.circle(ctx, U.hash(i, k, 1) * 2600 - 340, U.hash(i, k, 2) * 1500 - 210, 2 + U.hash(i, k, 3) * 10, sk.c);
    });
  }
  function fields(ctx, t, t0) { // large soft-edged fields of colour that seem to breathe (an illustration)
    ctx.fillStyle = '#4A1418'; ctx.fillRect(-300, -300, W + 600, H + 600);
    const br = 1 + 0.03 * Math.sin((t - t0) * 0.9);
    K.blur(ctx, 26, () => { K.rect(ctx, 400, 180, 1120, 330 * br, '#C8401C'); K.rect(ctx, 400, 560, 1120, 330, '#E08A1E'); });
    K.blur(ctx, 50, () => K.alpha(ctx, 0.45 + 0.15 * Math.sin((t - t0) * 0.7), () => { K.rect(ctx, 520, 250, 880, 180, '#F0612A'); K.rect(ctx, 520, 630, 880, 180, '#F7B23A'); }));
  }
  SCENES.newyork = (ctx, t) => {
    const [t0, t1] = S.newyork, n1 = L.ny1, n2 = L.ny2, n3 = L.ny3, n4 = L.ny4;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        // a crane shot rising over the city
        const u = K.io(t, t0, n3.t);
        K.cam(c, { zoom: 1.05 + 0.08 * u, ...K.drift(t, 2, 51) }, () => skyline(c, t, lerp(-150, 110, u)));
        K.chapter(c, t, t0 + 0.2, 'VI', 'НЬЮ-ЙОРК', '1940-жылдар', { dur: n1.end - t0, y: 420 });
        K.track(c, 'АБСТРАКТІЛІ ЭКСПРЕССИОНИЗМ', 960, 430, t, n2.t + 0.2, { size: 70, weight: 800, spacing: 3, wide: 22, shadow: 30, alpha: 1 - K.u(t, n3.t - 0.8, n3.t - 0.2) });
      } },
      { at: ev.pollock - 0.5, fade: 0.7, draw: (c, t) => {
        // the top shot: straight down at the canvas, the camera turning slowly as the paint lands
        const a = ev.pollock - 0.5, u = K.u(t, a, ev.rothko);
        K.cam(c, { zoom: lerp(1.9, 1.02, ease.outCubic(u)), rot: lerp(-0.22, 0.1, u), ...K.drift(t, 3, 53) }, () => drips(c, t, a, ev.rothko - 0.6));
        K.label(c, t, n3.t + 0.6, ev.rothko - 0.4, 'Бояуды тамызу әдісі («дриппинг»)', 'Джексон Поллок тәсілінің иллюстрациясы');
      } },
      { at: ev.rothko, fade: 1.4, draw: (c, t) => {
        K.cam(c, { zoom: lerp(1.0, 1.28, K.io(t, ev.rothko, t1)), ...K.drift(t, 1.5, 55) }, () => fields(c, t, ev.rothko));
        K.label(c, t, n4.t + 0.6, t1 - 0.3, 'Түс алаңы кескіндемесі', 'Марк Ротко тәсілінің иллюстрациясы');
      } },
    ]);
  };

  // ============ 11. AFTER: Gabo's strings, minimalism, op art ============
  function strings3d(ctx, t) {
    ctx.fillStyle = K.radial(ctx, 960, 540, 80, 1100, [[0, '#3A2A33'], [1, '#0C0A12']]); ctx.fillRect(0, 0, W, H);
    const rot = t * 0.35, n = 64;
    const P = (a, top) => { const y = top ? -260 : 260, x = Math.cos(a) * 330, z = Math.sin(a) * 330; const xr = x * Math.cos(rot * 0.3) - z * Math.sin(rot * 0.3), zr = x * Math.sin(rot * 0.3) + z * Math.cos(rot * 0.3); const k = 900 / (900 + zr); return [960 + xr * k, 540 + (y + zr * 0.18) * k]; };
    ctx.lineWidth = 1.6;
    for (let i = 0; i < n; i++) { const a = i / n * 6.283; const [x0, y0] = P(a + rot, true), [x1, y1] = P(a + rot + 2.2, false); ctx.strokeStyle = `rgba(245,232,205,${0.35 + 0.4 * Math.abs(Math.sin(a + rot))})`; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
    for (const top of [true, false]) { ctx.beginPath(); for (let i = 0; i <= 60; i++) { const [x, y] = P(i / 60 * 6.283, top); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.stroke(); }
  }
  function boxes(ctx, t, u) {
    ctx.fillStyle = '#E4E0D8'; ctx.fillRect(-600, 0, W + 1200, 760); ctx.fillStyle = '#B9B3A8'; ctx.fillRect(-600, 760, W + 1200, 400);
    for (let i = 0; i < 9; i++) { const x = -260 + i * 300; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 30; K.rect(ctx, x, 420, 190, 190, '#B4532A'); ctx.restore(); K.rect(ctx, x, 420, 190, 16, '#D06A38'); K.rect(ctx, x + 174, 420, 16, 190, '#8E3F1F'); }
    void u;
  }
  function opArt(ctx, t) {
    const cols = 44, rows = 20, cw = W / cols * 1.1, x0 = -W * 0.05, y0 = VIEW.y - 40;
    const bx = 960 + Math.sin(t * 0.6) * 420, by = 540 + Math.cos(t * 0.45) * 120, R = 430;
    const warp = (x, y) => { const dx = x - bx, dy = y - by, d = Math.hypot(dx, dy); if (d >= R || d < 1) return [x, y]; const k = Math.sin(d / R * Math.PI / 2), f = lerp(1, k * R / d, 0.75) ; return [bx + dx * f, by + dy * f]; };
    ctx.fillStyle = '#F4F1EA'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#111';
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { if ((i + j) % 2) continue; const x = x0 + i * cw, y = y0 + j * cw; const a = warp(x, y), b = warp(x + cw, y), c = warp(x + cw, y + cw), d = warp(x, y + cw); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); }
  }
  SCENES.after = (ctx, t) => {
    const [t0, t1] = S.after, a1 = L.aft1, a2 = L.aft2, a3 = L.aft3;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => { K.cam(c, { zoom: 1 + 0.12 * K.io(t, t0, a2.t), ...K.drift(t, 3, 61) }, () => strings3d(c, t)); K.label(c, t, a1.t + 0.4, a2.t - 0.5, 'Кеңістіктегі сызықтық конструкция', 'Наум Габо тәсілінің иллюстрациясы'); } },
      { at: a2.t - 0.5, fade: 0.8, draw: (c, t) => { const u = K.u(t, a2.t - 0.5, a3.t); K.cam(c, { x: lerp(-260, 260, ease.inOutQuad(u)), zoom: 1.1 }, () => boxes(c, t, u)); K.track(c, 'МИНИМАЛИЗМ', 960, 260, t, a2.t + 0.3, { size: 84, weight: 800, color: C.ink, spacing: 8, wide: 40 }); K.text(c, '1960-жылдар', 960, 330, { size: 30, weight: 400, color: '#4A443A', spacing: 4, alpha: K.u(t, a2.t + 1, a2.t + 1.8) }); } },
      { at: a3.t - 0.4, fade: 0.6, draw: (c, t) => { K.cam(c, { zoom: 1.02 + 0.06 * K.u(t, a3.t, t1), rot: 0.02 * Math.sin(t * 0.4) }, () => opArt(c, t)); K.alpha(c, K.u(t, a3.t + 0.6, a3.t + 1.2), () => { K.rect(c, 760, 470, 400, 130, 'rgba(244,241,234,0.94)'); K.text(c, 'ОП-АРТ', 960, 536, { size: 84, weight: 800, color: C.ink, spacing: 12 }); }); } },
    ]);
  };

  // ============ 12. THE STEPPE: ornament is abstraction; the kui speaks without words ============
  function felt(ctx, color = C.felt) {
    ctx.fillStyle = color; ctx.fillRect(-800, -800, W + 1600, H + 1600);
    for (let i = 0; i < 900; i++) { const x = U.hash(i, 71) * (W + 1200) - 600, y = U.hash(i, 72) * (H + 400) - 200, l = 8 + U.hash(i, 73) * 22, a = U.hash(i, 74) * 6.283; ctx.strokeStyle = U.hash(i, 75) > 0.5 ? 'rgba(255,220,190,0.07)' : 'rgba(0,0,0,0.10)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
  }
  // four horns around a centre: the classic medallion
  function medallion(ctx, x, y, s, col, u = 1, lw = 9) { for (let k = 0; k < 4; k++) K.rot(ctx, x, y, k * Math.PI / 2, () => K.horns(ctx, 0, -s * 1.18, s, col, lw, u)); K.rot(ctx, x, y, Math.PI / 4, () => K.rect(ctx, -s * 0.11 * u, -s * 0.11 * u, s * 0.22 * u, s * 0.22 * u, col)); }
  function carpet(ctx, t) {
    felt(ctx, '#6E1B18');
    const rows = [[VIEW.y + 40, 150, C.navy, C.gold], [VIEW.y + 250, 300, '#EDE2C8', '#7A1F1B'], [VIEW.y + 610, 150, C.navy, C.gold]];
    rows.forEach(([y, h, bg, fg], r) => {
      K.rect(ctx, -800, y, W + 1600, h, bg); K.rect(ctx, -800, y, W + 1600, 6, C.gold); K.rect(ctx, -800, y + h - 6, W + 1600, 6, C.gold);
      const step = h * (r === 1 ? 1.3 : 1.25);
      for (let x = -800; x < W + 800; x += step) { if (r === 1) medallion(ctx, x + step / 2, y + h / 2, h * 0.2, fg, 1, 7); else K.horns(ctx, x + step / 2, y + h * 0.2, h * 0.62, fg, 6); }
    });
  }
  function dombra(ctx, x, y, s, rot, t, ring) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
    ctx.fillStyle = K.grad(ctx, -120, 0, 120, 0, [[0, '#8A4F22'], [0.5, '#C98A45'], [1, '#7A421B']]);
    ctx.beginPath(); ctx.moveTo(0, -40); ctx.bezierCurveTo(70, -20, 150, 120, 120, 250); ctx.bezierCurveTo(100, 340, -100, 340, -120, 250); ctx.bezierCurveTo(-150, 120, -70, -20, 0, -40); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#5E3516'; ctx.fillRect(-17, -640, 34, 620);
    ctx.fillStyle = '#4A280F'; ctx.beginPath(); ctx.moveTo(-17, -640); ctx.lineTo(17, -640); ctx.lineTo(26, -720); ctx.lineTo(-26, -720); ctx.closePath(); ctx.fill();
    K.circle(ctx, -36, -690, 9, '#2B1608'); K.circle(ctx, 36, -670, 9, '#2B1608');
    for (let i = 0; i < 9; i++) K.rect(ctx, -17, -600 + i * 62, 34, 3, 'rgba(240,220,180,0.7)');
    K.circle(ctx, 0, 110, 13, '#3A200D'); K.rect(ctx, -30, 262, 60, 8, '#3A200D');
    for (const sx of [-6, 6]) { ctx.beginPath(); ctx.moveTo(sx, -700); ctx.quadraticCurveTo(sx + Math.sin(t * 70 + sx) * 5 * ring, -220, sx, 264); ctx.strokeStyle = 'rgba(250,240,215,0.95)'; ctx.lineWidth = 2.2; ctx.stroke(); }
    ctx.restore();
  }
  SCENES.kazakh = (ctx, t) => {
    const [t0, t1] = S.kazakh, k1 = L.kz1, k2 = L.kz2, k3 = L.kz3, k4 = L.kz4;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        K.cam(c, { zoom: 1 + 0.1 * K.io(t, t0, k2.t), ...K.drift(t, 3, 71) }, () => {
          felt(c);
          c.fillStyle = K.radial(c, 960, 540, 100, 900, [[0, 'rgba(255,190,110,0.22)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, W, H);
          medallion(c, 960, 540, 150, C.gold, K.io(t, t0 + 0.3, k1.end), 10);
        });
        K.text(c, 'VII', 960, VIEW.y + 62, { size: 26, weight: 700, color: C.gold, spacing: 10, alpha: K.win(t, t0 + 0.2, k1.t) });
        K.track(c, 'ДАЛА ӨРНЕГІ', 960, VIEW.y + 120, t, t0 + 0.3, { size: 76, weight: 800, spacing: 6, wide: 34, shadow: 24, alpha: 1 - K.u(t, k1.t - 0.4, k1.t + 0.3) });
      } },
      { at: k2.t - 0.5, fade: 0.9, draw: (c, t) => {
        // a dolly along the carpet's border
        const u = K.u(t, k2.t - 0.5, k3.t);
        K.cam(c, { x: lerp(-360, 360, u), zoom: 1.16, rot: -0.025 }, () => carpet(c, t));
        K.label(c, t, k2.t + 0.3, k3.t - 0.4, 'Ою-өрнек', 'киіз · текемет · кілем');
      } },
      { at: k3.t - 0.4, fade: 0.8, draw: (c, t) => {
        K.cam(c, { zoom: 1 + 0.08 * K.u(t, k3.t, k4.t), ...K.drift(t, 2, 73) }, () => {
          felt(c, '#0E2256');
          c.fillStyle = K.radial(c, 700, 540, 80, 800, [[0, 'rgba(120,160,255,0.2)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(0, 0, W, H);
          K.horns(c, 700, 330, 420, C.gold, 16, K.io(t, k3.t - 0.3, k3.t + 1.6));
        });
        K.text(c, '«Қошқар мүйіз»', 1330, 480, { size: 66, weight: 800, alpha: K.u(t, k3.t + 0.3, k3.t + 1), shadow: 20 });
        K.rect(c, 1330 - 140 * K.out(t, k3.t + 0.6, k3.t + 1.6), 534, 280 * K.out(t, k3.t + 0.6, k3.t + 1.6), 3, C.gold);
        K.text(c, 'байлық пен берекенің таңбасы', 1330, 584, { size: 32, weight: 400, color: '#E9DFC6', alpha: K.u(t, k3.t + 1.4, k3.t + 2.2) });
      } },
      { at: k4.t - 0.5, fade: 0.9, draw: (c, t) => {
        // the dombra: every beat throws a colour into the air, like the keys of Kandinsky's piano
        c.fillStyle = K.grad(c, 0, 0, W, H, [[0, '#0A1438'], [1, '#1B0E22']]); c.fillRect(0, 0, W, H);
        const bp = (t - S.kazakh[0]) / BEAT, ring = Math.exp(-(bp % 1) * 3);
        K.cam(c, { zoom: 1 + 0.12 * K.io(t, k4.t, t1), x: 40 * K.u(t, k4.t, t1), ...K.drift(t, 3, 75) }, () => {
          const first = Math.ceil((k4.t - 0.2 - S.kazakh[0]) / (BEAT / 2));
          for (let i = first; i * (BEAT / 2) + S.kazakh[0] <= t; i++) {
            const age = t - (i * (BEAT / 2) + S.kazakh[0]), a = clamp(1 - age / 4.5); if (a <= 0) continue;
            const an = -0.9 + U.hash(i, 81) * 1.5, sp = 150 + U.hash(i, 82) * 130, x = 640 + Math.cos(an) * (90 + age * sp), y = 600 + Math.sin(an) * (90 + age * sp) * 0.75, col = PAL[i % 6], r = 14 + age * 20 + U.hash(i, 83) * 16;
            K.glow(c, x, y, r * 2.4, col, a * 0.4);
            K.alpha(c, a, () => { if (i % 3 === 0) K.circle(c, x, y, r, col); else if (i % 3 === 1) K.rot(c, x, y, age + i, () => K.rect(c, -r, -r * 0.6, r * 2, r * 1.2, col)); else K.rot(c, x, y, -age * 0.7 + i, () => K.poly(c, [[-r, r], [r, r], [0, -r]], col)); });
          }
          for (let k = 1; k <= 4; k++) { const rr = ((bp * 0.5 + k / 4) % 1) * 520; c.beginPath(); c.arc(560, 620, rr, -1.2, 0.5); c.strokeStyle = `rgba(226,182,89,${0.5 * (1 - rr / 520)})`; c.lineWidth = 3; c.stroke(); }
          dombra(c, 470, 520, 0.92, 0.72, t, ring);
        });
        K.text(c, 'КҮЙ', 1500, VIEW.y + 110, { size: 110, weight: 800, spacing: 20, color: 'rgba(255,255,255,0.92)', shadow: 30, alpha: K.win(t, ev.kui, t1 - 0.3, 0.8, 0.6) });
        K.text(c, 'сөзсіз сөйлейтін өнер', 1500, VIEW.y + 190, { size: 30, weight: 400, spacing: 4, color: '#F1E3C2', alpha: K.win(t, ev.kui + 0.7, t1 - 0.3, 0.8, 0.6) });
      } },
    ]);
  };

  // ============ 13. HOW TO LOOK ============
  function blobs(ctx, t, x, y, w, h) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = '#F0E8D8'; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 9; i++) { const px = x + w * (0.5 + 0.4 * Math.sin(t * 0.13 + i * 2.1)), py = y + h * (0.5 + 0.38 * Math.cos(t * 0.11 + i * 1.3)), r = h * (0.12 + 0.1 * U.hash(i, 5)); if (i % 3 === 2) K.rot(ctx, px, py, t * 0.1 + i, () => K.rect(ctx, -r, -r * 0.7, r * 2, r * 1.4, PAL[i % 6])); else K.circle(ctx, px, py, r, PAL[i % 6]); }
    K.line(ctx, x + w * 0.1, y + h * 0.8, x + w * 0.9, y + h * (0.2 + 0.1 * Math.sin(t * 0.3)), C.ink, 7);
    ctx.restore();
  }
  SCENES.look = (ctx, t) => {
    const [t0, t1] = S.look, l1 = L.look1, l2 = L.look2, l3 = L.look3;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        // over the shoulder: the viewer is a soft silhouette, the canvas is sharp — then the focus pulls
        K.wall(c, t, '#17120F');
        const u = K.io(t, t0, l3.t);
        K.cam(c, { zoom: 1 + 0.14 * u, y: -20 * u, ...K.drift(t, 3, 91) }, () => {
          c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.shadowOffsetY = 24; K.rect(c, 500, 250, 920, 520, '#B58D4A'); c.restore();
          blobs(c, t, 516, 266, 888, 488);
          const w = (s, x, at, i) => { const a = K.out(t, at, at + 0.5); if (a <= 0) return; K.alpha(c, a, () => { c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 16; K.rect(c, x - 120, 440, 240, 150, 'rgba(12,16,34,0.82)'); c.restore(); if (i === 0) K.poly(c, [[x - 30, 505], [x + 30, 505], [x, 455]], C.yellow); else if (i === 1) K.line(c, x - 40, 500, x + 40, 462, '#fff', 6); else { K.circle(c, x - 16, 482, 22, C.red); K.circle(c, x + 16, 482, 22, C.blue); } K.text(c, s, x, 552, { size: 32, weight: 700 }); }); };
          const d = l2.dur; w('пішін', 680, l2.t + d * 0.42, 0); w('сызық', 960, l2.t + d * 0.6, 1); w('түс', 1240, l2.t + d * 0.78, 2);
        });
        K.blur(c, lerp(16, 4, K.io(t, l1.end, l2.t + 1)), () => { c.fillStyle = '#060507'; K.circle(c, 1010, 760, 105, '#060507'); c.beginPath(); c.moveTo(760, 1100); c.bezierCurveTo(770, 880, 900, 850, 1010, 850); c.bezierCurveTo(1120, 850, 1250, 880, 1260, 1100); c.fill(); });
      } },
      { at: l3.t - 0.6, fade: 1.0, draw: (c, t) => {
        c.fillStyle = K.grad(c, 0, 0, W, H, [[0, '#0A1A52'], [1, '#07102E']]); c.fillRect(0, 0, W, H);
        K.paper(c, 'rgba(0,0,0,0)', 'rgba(255,255,255,0.035)');
        K.cam(c, { zoom: 1 + 0.05 * K.u(t, l3.t, t1), ...K.drift(t, 2, 93) }, () => {
          K.shanyrak(c, 1560, 520, 330, 'rgba(226,182,89,0.7)', 5, t * 0.05, false);
          const d = l3.dur;
          K.text(c, 'Абстрактілі картинаны', 190, 380, { size: 34, weight: 400, align: 'left', color: '#C9D4F2', alpha: K.u(t, l3.t, l3.t + 0.6) });
          K.text(c, '«Не салынған?» деп емес,', 190, 470, { size: 74, weight: 800, align: 'left', alpha: K.u(t, l3.t + d * 0.3, l3.t + d * 0.3 + 0.6) });
          K.text(c, '«Қандай әсер береді?»', 190, 580, { size: 74, weight: 800, align: 'left', color: C.yellow, alpha: K.u(t, l3.t + d * 0.55, l3.t + d * 0.55 + 0.6) });
          K.text(c, 'деп қабылдау керек.', 190, 670, { size: 34, weight: 400, align: 'left', color: '#C9D4F2', alpha: K.u(t, l3.t + d * 0.8, l3.t + d * 0.8 + 0.6) });
        });
        K.band(c, VIEW.y + VIEW.h - 64, 64, t, { bg: '#7A1F1B', fg: C.gold });
      } },
    ]);
  };

  // ============ 14. TODAY: a montage ============
  const TODAY = [
    ['ДИЗАЙН', (c, t) => { c.fillStyle = '#20222B'; c.fillRect(0, 0, W, H); K.rot(c, 960, 540, -0.05, () => { c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; K.rect(c, -260, -330, 520, 660, '#F1EADB'); c.restore(); K.circle(c, 40, -90, 170, C.red); K.rect(c, -260, 60, 520, 26, C.ink); K.poly(c, [[-260, 330], [-260, 110], [60, 330]], C.blue); K.rect(c, -220, -300, 150, 16, C.ink); K.rect(c, -220, -270, 90, 10, C.ink); K.circle(c, 170, 230, 46, C.yellow); }); }],
    ['СӘУЛЕТ', (c, t) => { c.fillStyle = K.grad(c, 0, 0, 0, H, [[0, '#8FB8DE'], [1, '#DCE9F2']]); c.fillRect(0, 0, W, H); for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) { const col = U.hash(i, j, 3) > 0.8 ? PAL[Math.floor(U.hash(i, j, 4) * 3)] : U.hash(i, j, 5) > 0.5 ? '#F4F2EC' : '#DAD6CC'; K.rect(c, 420 + i * 122, 150 + j * 122, 114, 114, col); K.rect(c, 446 + i * 122, 176 + j * 122, 62, 62, '#3A4C60'); } }],
    ['ИНТЕРФЕЙС', (c, t) => { c.fillStyle = '#12142A'; c.fillRect(0, 0, W, H); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.beginPath(); c.roundRect(760, 150, 400, 780, 50); c.fillStyle = '#F4F2EC'; c.fill(); c.restore(); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { c.beginPath(); c.roundRect(800 + i * 112, 240 + j * 130, 92, 92, 22); c.fillStyle = PAL[(i + j * 2) % 6]; c.fill(); const x = 846 + i * 112, y = 286 + j * 130; if ((i + j) % 3 === 0) K.circle(c, x, y, 22, '#fff'); else if ((i + j) % 3 === 1) K.rect(c, x - 20, y - 20, 40, 40, '#fff'); else K.poly(c, [[x - 24, y + 20], [x + 24, y + 20], [x, y - 24]], '#fff'); } c.beginPath(); c.roundRect(800, 780, 316, 90, 26); c.fillStyle = '#20222B'; c.fill(); }],
    ['КҮНДЕЛІКТІ ЗАТТАР', (c, t) => { c.fillStyle = '#E9E1D0'; c.fillRect(0, 0, W, H); K.rect(c, 0, 760, W, 400, '#CFC4AE'); c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 20; K.rect(c, 560, 420, 300, 340, '#F6F3EC'); c.restore(); c.strokeStyle = '#F6F3EC'; c.lineWidth = 34; c.beginPath(); c.arc(880, 590, 90, -1.2, 1.2); c.stroke(); K.circle(c, 660, 540, 60, C.red); K.rect(c, 700, 600, 120, 26, C.ink); K.poly(c, [[600, 720], [700, 720], [650, 640]], C.blue); c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 40; c.shadowOffsetY = 20; K.rect(c, 1080, 300, 330, 460, '#1F4FB5'); c.restore(); for (let i = 0; i < 3; i++) K.horns(c, 1245, 340 + i * 140, 100, C.yellow, 7); }],
  ];
  SCENES.today = (ctx, t) => {
    const [t0, t1] = S.today, n = TODAY.length, d = (t1 - t0) / n;
    const i = Math.min(n - 1, Math.floor((t - t0) / d)), a = t0 + i * d, u = K.u(t, a, a + d);
    // a whip pan between the shots: the frame smears sideways at each cut
    const whip = i > 0 ? 1 - K.out(t, a, a + 0.3) : 0, out = i < n - 1 ? ease.inCubic(K.u(t, a + d - 0.18, a + d)) : 0;
    K.blur(ctx, (whip + out) * 34, () => K.cam(ctx, { x: -whip * 700 + out * 500, zoom: 1.06 + 0.07 * u, rot: (i % 2 ? 1 : -1) * 0.012 * u }, () => TODAY[i][1](ctx, t)));
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, 0, W, H);
    K.text(ctx, TODAY[i][0], 960, VIEW.y + VIEW.h - 90, { size: 60, weight: 800, spacing: 12, shadow: 30, alpha: K.win(t, a + 0.15, a + d - 0.1, 0.3, 0.2) });
  };

  // ============ 15. THE END: back to the steppe, at sunset ============
  SCENES.end = (ctx, t) => {
    const [t0, t1] = S.end, e1 = L.end1, e2 = L.end2;
    const u = K.io(t, t0, t1);
    K.cam(ctx, { zoom: 1.1 - 0.1 * u, y: lerp(40, -30, u), ...K.drift(t, 2, 99) }, () => {
      ctx.fillStyle = K.grad(ctx, 0, VIEW.y - 150, 0, 800, [[0, '#2A1E4A'], [0.4, '#7A3A4E'], [0.75, '#D9722E'], [1, '#F6C25A']]); ctx.fillRect(-300, -400, W + 600, 1300);
      K.glow(ctx, 1300, 720, 800, 'rgba(255,214,120,0.6)');
      K.shanyrak(ctx, 1300, 640, 250, 'rgba(255,236,180,0.9)', 6, t * 0.03);
      K.hills(ctx, 770, 22, '#5A2A2E', 2, t * 5);
      K.yurt(ctx, 1500, 800, 0.9);
      K.hills(ctx, 815, 26, '#2A1420', 5, t * 12);
      // the three shapes rise like kites
      const r = K.io(t, t0 + 0.5, e2.t);
      K.alpha(ctx, 0.9 * r, () => { K.circle(ctx, 300, 760 - r * 280, 50, C.yellow); K.rot(ctx, 470, 800 - r * 250, 0.3 + t * 0.05, () => K.rect(ctx, -44, -44, 88, 88, C.blue)); K.rot(ctx, 640, 820 - r * 300, -0.2 - t * 0.04, () => K.poly(ctx, [[-52, 44], [52, 44], [0, -52]], C.red)); });
    });
    K.band(ctx, VIEW.y + VIEW.h - 58, 58, t, { bg: C.navy, fg: C.gold });
    const a = 1 - K.u(t, e2.t - 0.5, e2.t);
    K.text(ctx, 'Абстракционизм өнерге пішін мен', 960, 300, { size: 58, weight: 800, shadow: 26, alpha: K.u(t, e1.t, e1.t + 0.8) * a });
    K.text(ctx, 'түстің өзі сөйлей алатынын көрсетті.', 960, 376, { size: 58, weight: 800, shadow: 26, alpha: K.u(t, e1.t + 0.5, e1.t + 1.3) * a });
    K.track(ctx, 'Назарларыңызға рахмет!', 960, 330, t, e2.t, { size: 84, weight: 800, spacing: 2, wide: 20, shadow: 30 });
    K.rect(ctx, 960 - 200 * K.out(t, e2.t + 0.4, e2.t + 1.8), 400, 400 * K.out(t, e2.t + 0.4, e2.t + 1.8), 3, C.gold);
    K.text(ctx, 'Дайындағандар:  Әділ Мұхтар  ·  Сәлімгерей Қарақат', 960, 458, { size: 34, weight: 700, color: '#FFF4D6', shadow: 16, alpha: K.u(t, e2.t + 1.4, e2.t + 2.4) });
    K.text(ctx, 'Музыка: Құрманғазы — «Адай» күйі, орындаған 才布克加甫   ·   Картиналар: Wikimedia Commons, қоғамдық игілік', 960, 512, { size: 22, weight: 400, color: '#F6E9CC', shadow: 12, alpha: K.u(t, e2.t + 2.2, e2.t + 3.2) });
  };
})();
