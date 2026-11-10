// SCENES 1–7: the cold open, the definition, the roots, the avant-garde, the birth, Kandinsky, Malevich.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const { ev, line: L, S, BEAT } = SC;
  const { C, VIEW, IMG } = K;
  const W = G.W, H = G.H;
  const SCENES = (globalThis.SCENES = globalThis.SCENES || {});
  const PAL = [C.red, C.yellow, C.blue, '#2E9E6B', '#E8792F', '#8B4FB0', '#F1EDE4'];

  // ============ 1. THE COLD OPEN: a point, a line, a colour — then the title ============
  SCENES.open = (ctx, t) => {
    const hy = 640;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const col = K.io(t, ev.colour, ev.colour + 3.2);
    const rise = K.io(t, ev.colour + 0.4, ev.title + 2.5);
    K.cam(ctx, { zoom: 1.12 - 0.12 * K.io(t, 0, 19.6), y: -30 * K.io(t, ev.title, 19.6), ...K.drift(t, 3, 4) }, () => {
      K.alpha(ctx, col, () => {
        ctx.fillStyle = K.grad(ctx, 0, VIEW.y - 80, 0, hy + 20, [[0, '#050818'], [0.45, '#0C2260'], [0.8, '#1B48A8'], [0.93, '#C98A3A'], [1, '#F2C66A']]);
        ctx.fillRect(-200, -200, W + 400, hy + 220);
        for (let i = 0; i < 70; i++) { const tw = 0.5 + 0.5 * Math.sin(t * (1 + U.hash(i, 3) * 2) + i); K.circle(ctx, U.hash(i, 1) * W, VIEW.y - 40 + U.hash(i, 2) * 330, 1 + U.hash(i, 4) * 1.6, `rgba(255,255,255,${0.25 + 0.5 * tw})`); }
        K.glow(ctx, 960, hy, 900, 'rgba(255,190,90,0.55)', 0.9);
        K.shanyrak(ctx, 960, hy + 150 - rise * 185, 190, '#F6D27A', 6, t * 0.04);
        K.glow(ctx, 960, hy + 150 - rise * 185, 420, 'rgba(255,214,120,0.35)');
      });
      K.alpha(ctx, col, () => {
        K.hills(ctx, hy + 6, 18, '#1A1630', 2, t * 6);
        K.yurt(ctx, 960, hy + 30, 0.62, '#2A2238', '#30283F', '#5B2A2A');
        K.hills(ctx, hy + 40, 26, '#0C0A18', 5, t * 14);
      });
      // the point
      const pa = K.u(t, ev.point, ev.point + 0.5) * (1 - K.u(t, ev.colour + 0.6, ev.colour + 2.4));
      K.alpha(ctx, pa, () => {
        K.glow(ctx, 960, hy, 120 + 20 * Math.sin(t * 2.2), 'rgba(255,240,210,0.7)');
        K.circle(ctx, 960, hy, 6.5 + 1.2 * Math.sin(t * 2.2), '#fff');
      });
      // the line
      const lu = K.io(t, ev.lineDraw, ev.lineDraw + 2.6);
      K.alpha(ctx, (1 - K.u(t, ev.colour + 1.4, ev.colour + 3.2)) * (lu > 0 ? 1 : 0), () => {
        K.line(ctx, 960 - 1000 * lu, hy, 960 + 1000 * lu, hy, '#fff', 3);
        K.streak(ctx, 960, hy, 300 + 800 * lu, '255,236,200', 0.5 * lu);
      });
    });
    // the three words
    const word = (s, a, b) => K.text(ctx, s, 960, hy + 96, { size: 38, weight: 400, spacing: 14, color: '#E9E4D8', alpha: K.win(t, a, b, 0.7, 0.7) });
    word('НҮКТЕ', ev.point + 0.5, ev.lineDraw - 0.1);
    word('СЫЗЫҚ', ev.lineDraw + 0.5, ev.colour - 0.1);
    word('ТҮС', ev.colour + 0.5, ev.title - 0.3);
    // the title
    if (t >= ev.title) {
      const f = 1 - K.u(t, ev.title, ev.title + 0.5);
      if (f > 0) { ctx.fillStyle = `rgba(255,240,210,${0.5 * f})`; ctx.fillRect(0, 0, W, H); }
      K.text(ctx, 'АБСТРАКЦИОНИЗМ', 960, 262, { size: 132, weight: 800, spacing: 6 + 40 * (1 - K.out(t, ev.title, ev.title + 3)), shadow: 40 });
      const u = K.out(t, ev.title + 0.3, ev.title + 1.8);
      K.rect(ctx, 960 - 230 * u, 344, 460 * u, 3, C.gold);
      K.text(ctx, 'пішін  ·  сызық  ·  түс', 960, 388, { size: 34, weight: 400, spacing: 6, color: '#F1E3C2', alpha: K.u(t, ev.title + 0.9, ev.title + 1.9), shadow: 16 });
    }
  };

  // ============ 2. THE DEFINITION: a little world comes apart into pure shapes ============
  //   each piece: what it is in the picture (a) and where it lands in the composition (b)
  const PIECES = [
    { k: 'circle', a: [1480, 300, 70, 70, 0, '#E9C46A'], b: [1500, 330, 150, 150, 0, C.yellow] },          // the sun
    { k: 'rect', a: [520, 520, 300, 220, 0, '#C9B8A0'], b: [760, 470, 380, 250, -0.22, C.blue] },          // the house
    { k: 'tri', a: [520, 350, 360, 150, 0, '#A8553E'], b: [1010, 380, 420, 300, 0.5, C.red] },             // the roof
    { k: 'rect', a: [1120, 600, 34, 190, 0, '#6B4A33'], b: [480, 640, 60, 230, 1.05, C.ink] },             // the trunk
    { k: 'circle', a: [1120, 450, 120, 120, 0, '#5C8A55'], b: [420, 360, 110, 110, 0, '#2E9E6B'] },        // the crown
    { k: 'circle', a: [900, 590, 34, 34, 0, '#D9A27E'], b: [1320, 640, 46, 46, 0, C.ink] },                // a head
    { k: 'rect', a: [900, 700, 60, 130, 0, '#3C5A8A'], b: [1190, 720, 300, 26, -0.35, C.ink] },            // a body
  ];
  const piece = (ctx, k, [x, y, w, h, r, c], alpha = 1) => K.alpha(ctx, alpha, () => K.rot(ctx, x, y, r, () => {
    if (k === 'circle') K.circle(ctx, 0, 0, w, c);
    else if (k === 'rect') K.rect(ctx, -w / 2, -h / 2, w, h, c);
    else K.poly(ctx, [[-w / 2, h / 2], [w / 2, h / 2], [0, -h / 2]], c);
  }));
  SCENES.define = (ctx, t) => {
    const [t0, t1] = S.define, d1 = L.def1, d2 = L.def2, d3 = L.def3;
    const u = K.io(t, d1.t + 1.6, d1.end + 0.6);         // the world lets go of itself
    const away = K.io(t, d3.t + 2.6, t1 + 0.5);           // «алшақтау»: the shapes move apart
    const cam = { zoom: lerp(1.16, 1.0, K.io(t, t0, d2.t)) + 0.07 * K.io(t, d2.t, t1), x: lerp(-40, 30, K.u(t, t0, t1)), ...K.drift(t, 4, 9) };
    K.cam(ctx, cam, () => {
      K.paper(ctx);
      // far layer: big pale shapes, slow
      K.cam(ctx, { x: cam.x * -0.5 }, () => K.alpha(ctx, 0.5 * u, () => {
        K.circle(ctx, 300, 760, 260, 'rgba(232,180,52,0.25)');
        K.rot(ctx, 1560, 700, 0.3, () => K.rect(ctx, -220, -160, 440, 320, 'rgba(31,79,181,0.16)'));
      }));
      // the ground and the details that make it a "picture"
      K.alpha(ctx, 1 - u, () => {
        K.rect(ctx, -200, 795, W + 400, 300, '#B9C28E');
        K.rect(ctx, 600, 560, 50, 60, '#7A6650'); K.rect(ctx, 720, 560, 50, 60, '#7A6650'); K.rect(ctx, 652, 640, 56, 90, '#6B4A33');
        for (let i = 0; i < 9; i++) K.circle(ctx, 1120 + Math.cos(i * 0.7) * 95, 450 + Math.sin(i * 0.7) * 95, 46, '#6F9C66');
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; K.line(ctx, 1480 + Math.cos(a) * 90, 300 + Math.sin(a) * 90, 1480 + Math.cos(a) * 125, 300 + Math.sin(a) * 125, '#E9C46A', 6); }
        K.line(ctx, 880, 720, 850, 780, '#3C5A8A', 12); K.line(ctx, 920, 720, 950, 780, '#3C5A8A', 12);
      });
      PIECES.forEach((p, i) => {
        const v = ease.inOutCubic(clamp(u * 1.35 - i * 0.05));
        const fl = Math.sin(t * 0.5 + i * 1.7) * 9 * u, dx = (p.b[0] - 960) * 0.55 * away, dy = (p.b[1] - 540) * 0.55 * away;
        const g = p.a.map((a, j) => (j < 5 ? lerp(a, p.b[j], v) : a));
        g[0] += dx; g[1] += dy + fl; g[4] += Math.sin(t * 0.3 + i) * 0.04 * u + away * (i % 2 ? 0.3 : -0.3);
        piece(ctx, p.k, g, 1 - v); g[5] = p.b[5]; piece(ctx, p.k, g, v);
      });
      // the lattice wheel of the original film, rolling through
      K.alpha(ctx, u * (1 - away), () => K.shanyrak(ctx, 1290, 470, 96, C.ink, 5, t * 0.25, true));
    });
    // foreground, out of focus: a red form drifting past the lens
    K.blur(ctx, 26, () => K.alpha(ctx, 0.85 * K.win(t, d2.t - 0.5, d3.t + 1, 1.5, 1.5), () => K.circle(ctx, lerp(-260, 420, K.u(t, d2.t - 0.5, d3.t + 1)), 930, 250, C.red)));
    // the word
    if (t > d3.t - 0.2) {
      const a = K.u(t, d3.t, d3.t + 0.8);
      K.alpha(ctx, a, () => { ctx.fillStyle = 'rgba(243,235,221,0.86)'; ctx.fillRect(0, VIEW.y, W, VIEW.h); });
      const n = Math.round(clamp((t - d3.t - 0.9) / 1.1) * 10);
      K.text(ctx, 'abstractio'.slice(0, n), 960 - 330, 500, { size: 150, weight: 400, fam: K.SERIF, italic: true, color: C.ink, align: 'left', alpha: a });
      K.text(ctx, 'ЛАТЫН ТІЛІНЕН', 960, 368, { size: 26, weight: 700, spacing: 10, color: C.red, alpha: a });
      const b = K.u(t, d3.t + 4.2, d3.t + 5);
      K.rect(ctx, 960 - 60 * b, 610, 120 * b, 4, C.ink);
      K.text(ctx, '«алшақтау»', 960, 680, { size: 64, weight: 800, color: C.blue, alpha: b });
    }
  };

  // ============ 3. THE ROOTS: the camera frees the painter; Monet; Cézanne ============
  function boxCamera(ctx, x, y, s, flash) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const g = C.gold;
    K.line(ctx, -40, 80, -120, 330, g, 7); K.line(ctx, 40, 80, 120, 330, g, 7); K.line(ctx, 0, 80, 0, 340, g, 7);
    K.rect(ctx, -130, -80, 200, 160, '#2B2118'); ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.strokeRect(-130, -80, 200, 160);
    K.poly(ctx, [[70, -60], [150, -40], [150, 40], [70, 60]], '#3A2C1F', g, 5);
    for (let i = 0; i < 4; i++) K.line(ctx, 90 + i * 16, -52 + i * 4, 90 + i * 16, 52 - i * 4, g, 3);
    K.circle(ctx, 172, 0, 34, '#1B1410', g, 6); K.circle(ctx, 172, 0, 16, '#5C7FA8'); K.circle(ctx, 166, -6, 5, 'rgba(255,255,255,0.8)');
    ctx.restore();
    if (flash > 0) K.glow(ctx, x + 172 * s, y, 900 * flash, 'rgba(255,250,235,0.95)', flash);
  }
  function landscape(ctx, x, y, w, h, mode) { // mode 0 = a sepia photograph, 1 = dabs of colour
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (mode === 0) {
      ctx.fillStyle = K.grad(ctx, 0, y, 0, y + h, [[0, '#D8C6A2'], [0.6, '#BFA77C'], [1, '#7C6344']]); ctx.fillRect(x, y, w, h);
      K.circle(ctx, x + w * 0.7, y + h * 0.3, h * 0.09, '#EFE3C6');
      K.poly(ctx, [[x, y + h * 0.62], [x + w * 0.3, y + h * 0.4], [x + w * 0.55, y + h * 0.6], [x + w * 0.8, y + h * 0.45], [x + w, y + h * 0.6], [x + w, y + h], [x, y + h]], '#6B5539');
      K.rect(ctx, x + w * 0.2, y + h * 0.55, w * 0.02, h * 0.2, '#3F3020'); K.circle(ctx, x + w * 0.21, y + h * 0.5, h * 0.09, '#4C3B27');
    } else {
      ctx.fillStyle = '#F2E9D6'; ctx.fillRect(x, y, w, h);
      for (let i = 0; i < 420; i++) {
        const px = U.hash(i, 1), py = U.hash(i, 2);
        const sun = Math.hypot(px - 0.7, (py - 0.3) * 0.7) < 0.09;
        const hill = py > 0.62 - 0.2 * Math.sin(px * 5) * 0.5;
        const c = sun ? ['#F6A63A', '#F2C14E', '#EF7F3A'][i % 3] : hill ? ['#3F8F5B', '#7FB069', '#2F6F7A', '#C8A24A'][i % 4] : ['#7FB7E0', '#B9D7EF', '#F1B8C8', '#9FC4E8'][i % 4];
        K.rot(ctx, x + px * w, y + py * h, (U.hash(i, 3) - 0.5) * 0.8, () => K.rect(ctx, -w * 0.022, -h * 0.012, w * 0.044, h * 0.024, c));
      }
    }
    ctx.restore();
  }
  function solids(ctx, t, t0) { // Cézanne's sphere, cone and cylinder, drawn in white over his mountain
    const a = (i) => K.out(t, t0 + i * 1.0, t0 + i * 1.0 + 0.9);
    ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
    const w = 'rgba(255,255,255,0.95)';
    K.alpha(ctx, a(0), () => { K.circle(ctx, 560, 600, 110 * a(0), null, w, 5); ctx.beginPath(); ctx.ellipse(560, 600, 110 * a(0), 34, 0, 0, 7); ctx.strokeStyle = w; ctx.lineWidth = 3; ctx.stroke(); K.text(ctx, 'шар', 560, 760, { size: 30, weight: 700 }); });
    K.alpha(ctx, a(1), () => { K.line(ctx, 960, 330, 810, 690, w, 5, a(1)); K.line(ctx, 960, 330, 1110, 690, w, 5, a(1)); ctx.beginPath(); ctx.ellipse(960, 690, 150, 36, 0, 0, 7); ctx.strokeStyle = w; ctx.lineWidth = 5; ctx.stroke(); K.text(ctx, 'конус', 960, 772, { size: 30, weight: 700 }); });
    K.alpha(ctx, a(2), () => { ctx.strokeStyle = w; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(1360, 470, 100, 30, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(1360, 690, 100, 30, 0, 0, 7); ctx.stroke(); K.line(ctx, 1260, 470, 1260, 690, w, 5, a(2)); K.line(ctx, 1460, 470, 1460, 690, w, 5, a(2)); K.text(ctx, 'цилиндр', 1360, 772, { size: 30, weight: 700 }); });
    ctx.restore();
  }
  SCENES.roots = (ctx, t) => {
    const [t0, t1] = S.roots, r1 = L.root1, r2 = L.root2, r3 = L.root3, r4 = L.root4;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        K.wall(c, t, '#14100D');
        K.cam(c, { zoom: 1 + 0.06 * K.u(t, t0, r3.t), ...K.drift(t, 3, 2) }, () => {
          const fl = t > r2.t + 1.2 ? Math.exp(-(t - r2.t - 1.2) * 4) : 0;
          K.alpha(c, K.u(t, r2.t - 0.6, r2.t + 0.3), () => {
            boxCamera(c, 470, 440, 0.95, fl);
            K.text(c, 'ФОТОСУРЕТ · 1839', 500, 850, { size: 26, weight: 700, spacing: 8, color: C.gold });
          });
          // the print the camera makes, and the canvas that no longer has to copy it
          const pr = K.out(t, r2.t + 1.3, r2.t + 2.4);
          K.alpha(c, pr, () => K.rot(c, 1000, 520 + (1 - pr) * 60, -0.05, () => { K.rect(c, -190, -150, 380, 300, '#EFE6D0'); landscape(c, -170, -130, 340, 240, 0); }));
          const cv = K.out(t, r2.t + 3.6, r2.t + 4.8);
          K.alpha(c, cv, () => K.rot(c, 1470, 500 + (1 - cv) * 60, 0.04, () => { K.rect(c, -206, -166, 412, 332, '#B58D4A'); landscape(c, -190, -150, 380, 300, 1); }));
          K.alpha(c, cv, () => { K.line(c, 1200, 520, 1250, 520, C.gold, 5); K.poly(c, [[1250, 506], [1276, 520], [1250, 534]], C.gold); });
        });
        K.chapter(c, t, t0 + 0.2, 'I', 'БАСТАУ', 'XIX ғасыр', { dur: r2.t - t0 - 0.6 });
      } },
      { at: r3.t - 0.9, fade: 1.2, draw: (c, t) => {
        K.wall(c, t);
        const z = lerp(1.0, 1.22, K.io(t, r3.t - 0.9, r4.t));
        K.blur(c, 14 * (1 - K.u(t, r3.t - 0.9, r3.t + 0.9)), () => K.cam(c, { zoom: z, ...K.drift(t, 3, 5) }, () => K.framed(c, IMG.monet, 960, 536, 560, { frame: 22 })));
        K.label(c, t, r3.t + 0.4, r4.t - 0.5, '«Әсер. Шығып келе жатқан күн»', 'Клод Моне · 1872');
      } },
      { at: r4.t - 0.7, fade: 1.0, draw: (c, t) => {
        K.pan(c, IMG.cezanne, VIEW, t, r4.t - 0.7, t1, { zoom: 1.0, x: 0.5, y: 0.42 }, { zoom: 1.14, x: 0.52, y: 0.36 });
        c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(0, 0, W, H);
        solids(c, t, r4.t + 1.4);
        K.label(c, t, r4.t, t1 - 0.3, '«Сент-Виктуар тауы»', 'Поль Сезанн · 1902–1904', { right: true });
      } },
    ]);
  };

  // ============ 4. THE AVANT-GARDE: fauvism frees colour, cubism frees form ============
  function fauve(ctx, t, t0) {
    ctx.fillStyle = '#E8642C'; ctx.fillRect(0, 0, W, H);
    const cols = ['#F2B705', '#1E8C6E', '#E33B7A', '#2456B8', '#F7E7C4', '#7B2D8E', '#D7301F'];
    for (let i = 0; i < 26; i++) {
      const a = K.out(t, t0 + i * 0.07, t0 + i * 0.07 + 0.6); if (a <= 0) continue;
      const x = U.hash(i, 11) * 1000 - 40, y = VIEW.y + U.hash(i, 12) * VIEW.h, r = 90 + U.hash(i, 13) * 150;
      ctx.save(); ctx.translate(x, y); ctx.rotate(U.hash(i, 14) * 6 + Math.sin(t * 0.4 + i) * 0.05); ctx.scale(a, a);
      ctx.fillStyle = cols[i % cols.length]; ctx.beginPath();
      for (let k = 0; k <= 12; k++) { const an = k / 12 * 6.283, rr = r * (0.7 + 0.3 * Math.sin(an * 3 + i)); ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr * 0.6); }
      ctx.fill(); ctx.restore();
    }
  }
  function cubist(ctx, t, t0) {
    ctx.fillStyle = '#5B4F43'; ctx.fillRect(0, 0, W, H);
    const cols = ['#8A7A66', '#B7A58A', '#3E3830', '#6F6558', '#D2C4A8', '#4F5A5E', '#2A2623'];
    for (let i = 0; i < 46; i++) {
      const a = K.out(t, t0 + i * 0.04, t0 + i * 0.04 + 0.5); if (a <= 0) continue;
      const x = 900 + U.hash(i, 21) * 1060, y = VIEW.y + U.hash(i, 22) * VIEW.h, r = 70 + U.hash(i, 23) * 170, rot = U.hash(i, 24) * 6 + Math.sin(t * 0.3 + i) * 0.04;
      K.alpha(ctx, a, () => K.rot(ctx, x, y, rot, () => K.poly(ctx, [[-r, r * 0.5], [r * 0.2, -r * 0.8], [r, r * 0.3 * (1 + U.hash(i, 25))]], cols[i % cols.length], 'rgba(20,16,12,0.55)', 3)));
    }
  }
  SCENES.avant = (ctx, t) => {
    const [t0, t1] = S.avant, a1 = L.av1, a2 = L.av2;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        // a split screen with a slanted seam that slides as the narration moves from colour to form
        const seam = lerp(1500, 620, K.io(t, a1.t + 2.6, a1.t + 4.2));
        K.cam(c, { zoom: 1.04 + 0.04 * K.u(t, t0, a2.t), ...K.drift(t, 4, 3) }, () => {
          fauve(c, t, t0);
          c.save(); c.beginPath(); c.moveTo(seam + 120, -100); c.lineTo(W + 300, -100); c.lineTo(W + 300, H + 100); c.lineTo(seam - 120, H + 100); c.closePath(); c.clip();
          cubist(c, t, t0 + 0.3); c.restore();
          K.line(c, seam + 120, -100, seam - 120, H + 100, '#fff', 8);
        });
        K.text(c, 'ФОВИЗМ', lerp(480, 300, K.io(t, a1.t + 2.6, a1.t + 4.2)), 500, { size: 96, weight: 800, spacing: 6, shadow: 30, alpha: K.u(t, t0 + 0.5, t0 + 1.2) * (1 - 0.6 * K.u(t, a1.t + 2.6, a1.t + 4.2)) });
        K.text(c, '1905 · түс', lerp(480, 300, K.io(t, a1.t + 2.6, a1.t + 4.2)), 580, { size: 32, weight: 400, spacing: 4, shadow: 16, alpha: K.u(t, t0 + 0.9, t0 + 1.6) * (1 - K.u(t, a1.t + 2.6, a1.t + 3.6)) });
        K.text(c, 'КУБИЗМ', 1280, 500, { size: 96, weight: 800, spacing: 6, shadow: 30, alpha: K.u(t, a1.t + 3.2, a1.t + 4.2) });
        K.text(c, '1907 · пішін', 1280, 580, { size: 32, weight: 400, spacing: 4, shadow: 16, alpha: K.u(t, a1.t + 3.6, a1.t + 4.4) });
      } },
      { at: a2.t - 0.6, fade: 0.8, draw: (c, t) => {
        // the frame can no longer hold the picture: its shapes fly out towards the lens
        K.wall(c, t, '#16110E');
        const u = K.u(t, a2.t - 0.6, t1);
        K.cam(c, { zoom: 1 + 0.1 * u, ...K.drift(t, 3, 8) }, () => {
          c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 50; c.strokeStyle = '#B58D4A'; c.lineWidth = 26; c.strokeRect(660, 300, 600, 470); c.restore();
          K.rect(c, 673, 313, 574, 444, '#EDE4D0');
          for (let i = 0; i < 9; i++) {
            const g = ease.inCubic(clamp(u * 1.5 - i * 0.07)), an = i / 9 * 6.283 + 0.4, d = g * 900;
            const x = 960 + Math.cos(an) * (60 + i * 16 + d), y = 536 + Math.sin(an) * (40 + i * 10 + d * 0.6), s = 1 + g * 2.4;
            K.blur(c, g * 10, () => K.rot(c, x, y, an + g * 2, () => { c.scale(s, s); if (i % 3 === 0) K.circle(c, 0, 0, 34, PAL[i % 6]); else if (i % 3 === 1) K.rect(c, -40, -26, 80, 52, PAL[i % 6]); else K.poly(c, [[-40, 30], [40, 30], [0, -40]], PAL[i % 6]); }));
          }
        });
      } },
    ]);
  };

  // ============ 5. THE BIRTH: a timeline; Kandinsky's watercolour; Hilma af Klint in the dark ============
  function timeline(ctx, t, year, y = 800) { // a ruler of years that the camera tracks along
    const px = 150; // pixels per year
    K.rect(ctx, 0, y, W, 3, 'rgba(255,255,255,0.55)');
    for (let yr = 1860; yr <= 1970; yr++) {
      const x = 960 + (yr - year) * px; if (x < -100 || x > W + 100) continue;
      const big = yr % 5 === 0;
      K.rect(ctx, x - 1.5, y - (big ? 26 : 12), 3, big ? 26 : 12, 'rgba(255,255,255,0.7)');
      if (big) K.text(ctx, String(yr), x, y + 36, { size: 28, weight: 700, color: 'rgba(255,255,255,0.75)' });
    }
    K.poly(ctx, [[948, y - 44], [972, y - 44], [960, y - 26]], C.gold);
  }
  SCENES.birth = (ctx, t) => {
    const [t0, t1] = S.birth, b1 = L.birth1, b2 = L.birth2, b3 = L.birth3;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        c.fillStyle = K.grad(c, 0, 0, 0, H, [[0, '#0A1438'], [1, '#050814']]); c.fillRect(0, 0, W, H);
        // the tracking shot: 1890 → 1910, then a whip back to 1906
        const year = lerp(1894, 1910, K.io(t, t0, b1.t + 0.6)) - 4 * ease.inOutCubic(K.u(t, b2.t - 0.5, b2.t + 0.7));
        const whip = Math.sin(Math.PI * K.u(t, b2.t - 0.5, b2.t + 0.7));
        timeline(c, t, year);
        K.blur(c, whip * 20, () => {
          const a = K.out(t, b1.t - 0.2, b1.t + 1.2) * (1 - K.u(t, b2.t - 0.5, b2.t));
          K.alpha(c, a, () => K.cam(c, { zoom: 1 + 0.05 * K.u(t, b1.t, b2.t), y: 30 * (1 - a) }, () => K.framed(c, IMG.firstabs, 820, 440, 520, { frame: 10, mat: 26, color: '#2A2A2A' })));
        });
        K.text(c, String(Math.round(year)), 250, 330, { size: 150, weight: 800, color: 'rgba(255,255,255,0.14)' });
        K.label(c, t, b1.t + 0.6, b2.t - 0.6, '«Атаусыз» акварелі', 'В. Кандинский · 1910 деп белгіленген', { y: VIEW.y + 80, right: true });
        K.chapter(c, t, t0 + 0.1, 'II', 'ТУЫЛУЫ', null, { dur: b1.t - t0 - 0.3, y: 420 });
      } },
      { at: b2.t + 0.5, fade: 0.9, draw: (c, t) => {
        // a slow tilt up a painting three metres tall
        K.pan(c, IMG.klint7, VIEW, t, b2.t + 0.5, b3.t - 0.2, { zoom: 1, x: 0.5, y: 0.82 }, { zoom: 1, x: 0.5, y: 0.2 }, ease.inOutQuad);
        K.text(c, '1906', 1640, VIEW.y + 110, { size: 120, weight: 800, color: 'rgba(255,255,255,0.9)', shadow: 30, alpha: K.win(t, b2.t + 0.8, b3.t - 0.5) });
        K.label(c, t, b2.t + 1.6, b3.t - 0.4, '«Ең үлкен ондық, №7. Ересек шақ»', 'Хильма аф Клинт · 1907');
      } },
      { at: b3.t - 0.3, fade: 1.2, draw: (c, t) => {
        // the work waits in the dark; a light finds it
        c.fillStyle = '#060608'; c.fillRect(0, 0, W, H);
        const u = K.io(t, b3.t, t1 - 0.5);
        K.cam(c, { zoom: 1 + 0.08 * u, ...K.drift(t, 2, 6) }, () => K.framed(c, IMG.altar, 960, 540, 700, { frame: 0 }));
        const lx = lerp(560, 960, u), ly = lerp(980, 520, u);
        c.fillStyle = K.radial(c, lx, ly, 60 + 260 * u, 420 + 900 * u, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(4,4,6,0.97)']]); c.fillRect(0, 0, W, H);
        K.label(c, t, b3.t + 1.6, t1 - 0.2, '«Алтарь суреті, №1»', 'Хильма аф Клинт · 1915', { right: true });
      } },
    ]);
  };

  // ============ 6. KANDINSKY: colour is a keyboard ============
  function piano(ctx, t, t0, t1) {
    ctx.fillStyle = K.grad(ctx, 0, 0, 0, H, [[0, '#07091A'], [1, '#141026']]); ctx.fillRect(0, 0, W, H);
    const n = 21, kw = 78, x0 = 960 - n * kw / 2, ky = 720, step = BEAT / 2;
    const first = Math.ceil((t0 + 0.3) / step), now = Math.floor(t / step);
    const notes = []; for (let i = first; i <= now && i * step < t1; i++) notes.push({ t: i * step, k: Math.floor(U.hash(i, 5) * n), c: PAL[Math.floor(U.hash(i, 6) * 6)], i });
    // the strings: they shimmer when a note sounds
    const last = notes.length ? notes[notes.length - 1] : null, ring = last ? Math.exp(-(t - last.t) * 5) : 0;
    for (let i = 0; i < 40; i++) { const x = x0 + i * (n * kw / 39), wob = Math.sin(t * 60 + i) * 3 * ring * (i % 3 === 0 ? 1 : 0.4); ctx.strokeStyle = `rgba(226,182,89,${0.25 + 0.4 * ring})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, VIEW.y); ctx.quadraticCurveTo(x + wob, VIEW.y + 80, x, VIEW.y + 160); ctx.stroke(); }
    // the colours the keys release
    for (const q of notes) {
      const age = t - q.t, a = clamp(1 - age / 3.2); if (a <= 0) continue;
      const x = x0 + (q.k + 0.5) * kw + Math.sin(age * 1.4 + q.i) * 22, y = ky - 30 - age * 150, r = 22 + age * 34;
      K.glow(ctx, x, y, r * 2.6, q.c, a * 0.5);
      K.alpha(ctx, a * 0.92, () => { K.circle(ctx, x, y, r, q.c); K.circle(ctx, x, y, r * 1.35, null, q.c, 2.5); });
    }
    // the keys
    for (let k = 0; k < n; k++) {
      const hit = notes.filter((q) => q.k === k).pop(), d = hit ? Math.exp(-(t - hit.t) * 7) : 0;
      K.rect(ctx, x0 + k * kw + 2, ky + d * 10, kw - 4, 240, d > 0.05 ? hit.c : '#F2EEE4');
      if (d > 0.05) K.alpha(ctx, 1 - d, () => K.rect(ctx, x0 + k * kw + 2, ky + d * 10, kw - 4, 240, '#F2EEE4'));
    }
    for (let k = 0; k < n - 1; k++) if (![2, 6].includes(k % 7)) K.rect(ctx, x0 + (k + 1) * kw - 23, ky, 46, 140, '#111');
    ctx.fillStyle = K.grad(ctx, 0, ky - 20, 0, ky + 20, [[0, 'rgba(0,0,0,0.55)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, ky - 20, W, 40);
  }
  SCENES.kandinsky = (ctx, t) => {
    const [t0, t1] = S.kandinsky, k1 = L.kan1, k2 = L.kan2, k3 = L.kan3, k4 = L.kan4, k5 = L.kan5, k6 = L.kan6;
    const hold = ev.k7hold;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        K.pan(c, IMG.circles, VIEW, t, t0, k2.t, { zoom: 1.5, x: 0.42, y: 0.4 }, { zoom: 1.0, x: 0.5, y: 0.5 });
        c.fillStyle = `rgba(0,0,0,${0.5 * (1 - K.u(t, k1.t - 0.6, k1.t + 0.8))})`; c.fillRect(0, 0, W, H);
        K.chapter(c, t, t0 + 0.2, 'III', 'ВАСИЛИЙ КАНДИНСКИЙ', '1866 – 1944', { dur: k1.t - t0 - 0.2 });
        K.label(c, t, k1.t + 0.5, k2.t - 0.5, '«Бірнеше шеңбер»', 'Василий Кандинский · 1926');
      } },
      { at: k2.t - 0.5, fade: 0.9, draw: (c, t) => {
        K.cam(c, { zoom: 1.06 - 0.06 * K.u(t, k2.t, k4.t), ...K.drift(t, 3, 12) }, () => piano(c, t, k2.t - 0.3, k4.t));
        const q = (s, x, a, col) => K.text(c, s, x, VIEW.y + 250, { size: 52, weight: 800, color: col, alpha: K.u(t, a, a + 0.5), shadow: 20 });
        const d = k3.dur;
        q('түс — перне', 480, k3.t + 0.1, C.yellow); q('көз — балға', 960, k3.t + d * 0.22, '#F1EDE4'); q('жан — рояль', 1440, k3.t + d * 0.42, '#7FA6F2');
      } },
      { at: k4.t - 0.6, fade: 1.0, draw: (c, t) => {
        // rack focus: the painting falls out of focus as the book comes forward
        const f = K.io(t, k4.t - 0.6, k4.t + 1.2);
        K.blur(c, 18 * f, () => K.pan(c, IMG.circles, VIEW, t, k4.t - 0.6, k5.t, { zoom: 1.1, x: 0.5, y: 0.5 }, { zoom: 1.25, x: 0.55, y: 0.5 }));
        c.fillStyle = `rgba(0,0,0,${0.45 * f})`; c.fillRect(0, 0, W, H);
        K.alpha(c, f, () => K.rot(c, 640 + (1 - f) * -80, 540, -0.06 + 0.02 * Math.sin(t * 0.5), () => {
          c.save(); c.shadowColor = 'rgba(0,0,0,0.7)'; c.shadowBlur = 60; c.shadowOffsetY = 24; K.rect(c, -190, -270, 380, 540, '#E9DFC8'); c.restore();
          K.rect(c, -190, -270, 22, 540, '#B9AC8F');
          K.text(c, 'KANDINSKY', 12, -200, { size: 34, weight: 800, color: C.ink, spacing: 6 });
          K.circle(c, 12, -50, 78, C.blue); K.poly(c, [[-60, 40], [90, 20], [20, -120]], C.red); K.circle(c, 70, 10, 30, C.yellow); K.line(c, -90, -110, 110, 60, C.ink, 5);
          K.text(c, 'Über das Geistige', 12, 130, { size: 30, weight: 700, color: C.ink, fam: K.SERIF });
          K.text(c, 'in der Kunst', 12, 172, { size: 30, weight: 700, color: C.ink, fam: K.SERIF });
          K.text(c, '1911', 12, 232, { size: 24, weight: 400, color: C.ink, spacing: 6 });
        }));
        K.text(c, '«Өнердегі руханилық туралы»', 1290, 480, { size: 50, weight: 800, alpha: K.u(t, k4.t + 0.2, k4.t + 1), shadow: 20 });
        K.rect(c, 1290 - 150 * f, 532, 300 * f, 3, C.gold);
        K.text(c, 'түс пен пішін — жанға әсер ететін күш', 1290, 580, { size: 30, weight: 400, alpha: K.u(t, k4.t + 1.6, k4.t + 2.4), color: '#EFE6CF', shadow: 14 });
      } },
      { at: k5.t - 0.5, fade: 1.0, draw: (c, t) => {
        // Composition VII: out of the detail to the whole, then the camera crosses the canvas while the kui plays
        const a = k5.t - 0.5;
        if (t < hold) K.pan(c, IMG.kandinsky7, VIEW, t, a, hold, { zoom: 3.6, x: 0.47, y: 0.47 }, { zoom: 1.0, x: 0.5, y: 0.5 }, ease.inOutCubic);
        else K.pan(c, IMG.kandinsky7, VIEW, t, hold, k6.t - 0.4, { zoom: 1.0, x: 0.5, y: 0.5 }, { zoom: 2.3, x: 0.74, y: 0.4 }, ease.inOutCubic);
        K.label(c, t, k5.t + 1.2, k6.t - 0.6, '«VII композиция»', 'Василий Кандинский · 1913 · Третьяков галереясы');
      } },
      { at: k6.t - 0.4, fade: 1.0, draw: (c, t) => {
        K.wall(c, t, '#D9D2C2');
        K.cam(c, { zoom: 1 + 0.1 * K.io(t, k6.t - 0.4, t1), x: 30 * K.u(t, k6.t, t1), ...K.drift(t, 3, 14) }, () => K.framed(c, IMG.kandinsky8, 960, 536, 560, { frame: 14, color: '#1E1E1E', mat: 0 }));
        K.label(c, t, k6.t + 0.4, t1 - 0.2, '«VIII композиция»', 'Василий Кандинский · 1923 · Баухаус кезеңі');
      } },
    ]);
  };

  // ============ 7. MALEVICH: the square in the corner ============
  SCENES.malevich = (ctx, t) => {
    const [t0, t1] = S.malevich, m1 = L.mal1, m2 = L.mal2, m3 = L.mal3, m4 = L.mal4, m5 = L.mal5;
    if (t >= ev.square) { // a hard cut to black, and the slowest push of the film
      ctx.fillStyle = '#0B0A09'; ctx.fillRect(0, 0, W, H);
      const u = K.u(t, ev.square, t1);
      const z = lerp(0.52, 3.4, ease.inQuad(u));
      K.cam(ctx, { zoom: z, ...K.drift(t, 1.5, 21) }, () => {
        ctx.fillStyle = K.radial(ctx, 960, 540, 100, 1100, [[0, 'rgba(255,230,190,0.16)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(-2000, -2000, 6000, 6000);
        K.framed(ctx, IMG.blacksquare, 960, 540, 820, { frame: 0 });
      });
      const f = 1 - K.u(t, ev.square, ev.square + 0.25); if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
      K.label(ctx, t, ev.square + 1.4, m5.t + 2.6, '«Қара шаршы»', 'Казимир Малевич · 1915');
      return;
    }
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        K.wall(c, t, '#CFC8B8');
        K.cam(c, { zoom: 1.02 + 0.1 * K.io(t, t0, m2.t), x: lerp(-60, 40, K.u(t, t0, m2.t)), ...K.drift(t, 3, 17) }, () => K.framed(c, IMG.suprem, 960, 540, 640, { frame: 12, color: '#F4F1EA' }));
        c.fillStyle = `rgba(0,0,0,${0.45 * (1 - K.u(t, m1.t - 0.6, m1.t + 0.8))})`; c.fillRect(0, 0, W, H);
        K.chapter(c, t, t0 + 0.2, 'IV', 'КАЗИМИР МАЛЕВИЧ', '1879 – 1935', { dur: m1.t - t0 - 0.2 });
        K.label(c, t, m1.t + 0.5, m2.t - 0.5, '«Супрематистік композиция»', 'Казимир Малевич · 1916');
      } },
      { at: m2.t - 0.4, fade: 0.7, draw: (c, t) => {
        // square, circle, cross: each lands on its own pluck
        c.fillStyle = '#EDE7DA'; c.fillRect(0, 0, W, H);
        K.cam(c, { zoom: 1 + 0.05 * K.u(t, m2.t, m3.t), ...K.drift(t, 2, 19) }, () => {
          const st = (i) => { const d = t - ev.shapes[i]; return d < 0 ? 0 : 1 + 0.25 * (1 - ease.outCubic(clamp(d / 0.25))); };
          const names = ['шаршы', 'шеңбер', 'крест'];
          [520, 960, 1400].forEach((x, i) => { const s = st(i); if (!s) return; c.save(); c.translate(x, 500); c.scale(s, s);
            if (i === 0) K.rect(c, -130, -130, 260, 260, C.ink); else if (i === 1) K.circle(c, 0, 0, 140, C.ink); else { K.rect(c, -48, -150, 96, 300, C.ink); K.rect(c, -150, -48, 300, 96, C.ink); }
            c.restore(); K.text(c, names[i], x, 720, { size: 34, weight: 700, color: C.ink, spacing: 6, alpha: K.u(t, ev.shapes[i] + 0.2, ev.shapes[i] + 0.7) }); });
        });
      } },
      { at: m3.t - 0.5, fade: 0.9, draw: (c, t) => {
        // the photograph of the «0,10» exhibition: a long push towards the corner where the square hangs
        const u = K.io(t, m3.t - 0.5, ev.square);
        K.pan(c, IMG.expo010, VIEW, t, m3.t - 0.5, ev.square, { zoom: 1.0, x: 0.5, y: 0.5 }, { zoom: 3.3, x: 0.585, y: 0.2 }, ease.inOutCubic);
        c.fillStyle = 'rgba(40,24,6,0.16)'; c.fillRect(0, 0, W, H);
        K.text(c, '1915', 250, VIEW.y + 120, { size: 120, weight: 800, shadow: 30, alpha: K.win(t, m3.t, m4.t - 0.3) });
        K.label(c, t, m3.t + 0.8, m4.t + 1, '«0,10» көрмесі', 'Петроград · 1915 жылдың желтоқсаны');
        const r = K.out(t, m4.t + 2.4, m4.t + 3.6);
        K.alpha(c, r * (0.6 + 0.4 * Math.sin(t * 3)), () => K.circle(c, 960, 536, 300 - 60 * r, null, C.gold, 4));
        void u;
      } },
    ]);
  };
})();
