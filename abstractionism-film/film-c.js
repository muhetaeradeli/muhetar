// MORE PAINTINGS: real public-domain works woven into every chapter. Each override keeps the original scene
// and cuts away to the paintings while the narration speaks about them.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE;
  const { lerp, clamp, ease } = U;
  const { ev, line: L, S } = SC;
  const { C, VIEW, IMG } = K;
  const W = G.W;
  const SCENES = globalThis.SCENES;
  const old = { ...SCENES };
  const KAN = 'Василий Кандинский', MAL = 'Казимир Малевич', MON = 'Пит Мондриан';

  // ---------- 1. the opening: after the title, a teaser of the three great names ----------
  SCENES.open = (ctx, t) => {
    const a = ev.title + 3.4;
    K.seq(ctx, t, [
      { at: 0, draw: old.open },
      { at: a, fade: 1.0, draw: (c, t) => K.gallery(c, t, a, S.open[1] + 0.6, [
        { img: 'kandinsky7', title: 'Василий Кандинский', sub: '«VII композиция» · 1913', from: { zoom: 1.5, x: 0.45, y: 0.5 }, to: { zoom: 1.2, x: 0.5, y: 0.5 } },
        { img: 'blacksquare', title: 'Казимир Малевич', sub: '«Қара шаршы» · 1915', mode: 'wall', right: true },
        { img: 'broadway', title: 'Пит Мондриан', sub: '«Бродвей буги-вуги» · 1942–1943', mode: 'wall' },
      ]) },
    ]);
  };

  // ---------- 2. definition: three paintings while "form, line and colour become the content" ----------
  SCENES.define = (ctx, t) => {
    const d2 = L.def2, d3 = L.def3;
    K.seq(ctx, t, [
      { at: S.define[0], draw: old.define },
      { at: d2.t - 0.6, fade: 0.8, draw: (c, t) => K.gallery(c, t, d2.t - 0.6, d3.t - 0.2, [
        { img: 'yrb', title: '«Сары – қызыл – көк»', sub: `${KAN} · 1925` },
        { img: 'delaunay', title: '«Дөңгелек пішіндер»', sub: 'Робер Делоне · 1930', right: true },
        { img: 'popova', title: '«Кескіндемелік архитектоника»', sub: 'Любовь Попова · 1918' },
      ]) },
      { at: d3.t - 0.2, fade: 0.8, draw: old.define },
    ]);
  };

  // ---------- 4. the avant-garde: real Matisse and Gris in the split screen; then Kandinsky lets go of the landscape ----------
  function half(c, img, x0, x1, t, a, b, zoom) {
    if (!K.has(img)) return;
    c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, G.H); c.clip();
    G.kenBurns(c, IMG[img], x0, VIEW.y, x1 - x0, VIEW.h, t, a, b, { from: { zoom, x: 0.5, y: 0.4 }, to: { zoom: zoom * 1.12, x: 0.5, y: 0.36 } });
    c.restore();
  }
  SCENES.avant = (ctx, t) => {
    const [t0, t1] = S.avant, a1 = L.av1, a2 = L.av2;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        const seam = lerp(1180, 760, K.io(t, a1.t + 2.6, a1.t + 4.2));
        c.fillStyle = '#111'; c.fillRect(0, 0, W, G.H);
        half(c, 'matisse', -200, seam + 60, t, t0, a2.t, 1.0);
        c.save(); c.beginPath(); c.moveTo(seam + 120, -100); c.lineTo(W + 300, -100); c.lineTo(W + 300, G.H + 100); c.lineTo(seam - 120, G.H + 100); c.closePath(); c.clip();
        half(c, 'gris', seam - 140, W + 40, t, t0, a2.t, 1.0); c.restore();
        K.line(c, seam + 120, -100, seam - 120, G.H + 100, '#fff', 6);
        K.text(c, 'ФОВИЗМ', 330, VIEW.y + 90, { size: 80, weight: 800, spacing: 6, shadow: 30, alpha: K.u(t, t0 + 0.5, t0 + 1.2) });
        K.text(c, 'КУБИЗМ', 1560, VIEW.y + 90, { size: 80, weight: 800, spacing: 6, shadow: 30, alpha: K.u(t, a1.t + 3.0, a1.t + 4.0) });
        K.label(c, t, t0 + 0.8, a1.t + 3.0, '«Қалпақ киген әйел»', 'Анри Матисс · 1905');
        K.label(c, t, a1.t + 3.6, a2.t - 0.6, '«Пабло Пикассоның портреті»', 'Хуан Грис · 1912', { right: true });
      } },
      { at: a2.t - 0.6, fade: 0.8, draw: (c, t) => K.gallery(c, t, a2.t - 0.6, t1 + 0.4, [
        { img: 'murnau', title: '«Мурнау. Мұнаралы пейзаж»', sub: `${KAN} · 1908` },
        { img: 'comp4', title: '«IV композиция»', sub: `${KAN} · 1911`, right: true },
      ]) },
    ]);
  };

  // ---------- 6. Kandinsky: the concert that became a painting; the Blue Rider; the Bauhaus years ----------
  SCENES.kandinsky = (ctx, t) => {
    const k2 = L.kan2, k3 = L.kan3, k4 = L.kan4, k6 = L.kan6, t1 = S.kandinsky[1];
    K.seq(ctx, t, [
      { at: S.kandinsky[0], draw: old.kandinsky },
      { at: k2.t - 1.3, fade: 0.8, draw: (c, t) => {
        if (K.has('impression3')) K.pan(c, IMG.impression3, VIEW, t, k2.t - 1.3, k4.t, { zoom: 1.35, x: 0.3, y: 0.45 }, { zoom: 1.0, x: 0.5, y: 0.5 });
        c.fillStyle = `rgba(0,0,0,${0.42 * K.u(t, k3.t - 0.4, k3.t + 0.3)})`; c.fillRect(0, 0, W, G.H);
        const q = (s, x, a, col) => K.text(c, s, x, VIEW.y + 120, { size: 52, weight: 800, color: col, alpha: K.u(t, a, a + 0.5), shadow: 22 });
        const d = k3.dur;
        q('түс — перне', 480, k3.t + 0.1, '#FFD45E'); q('көз — балға', 960, k3.t + d * 0.22, '#F6F2EA'); q('жан — рояль', 1440, k3.t + d * 0.42, '#9EC0FF');
        K.label(c, t, k2.t - 0.4, k3.t - 0.2, '«III әсер (Концерт)»', `${KAN} · 1911 · Шёнберг концертінен кейін`);
      } },
      { at: k4.t + 0.45, fade: 0.9, draw: old.kandinsky },
      { at: k6.t - 0.4, fade: 0.9, draw: (c, t) => K.gallery(c, t, k6.t - 0.4, t1 + 0.4, [
        { img: 'blackrider', title: '«Көк салт атты»', sub: `${KAN} · 1903` },
        { img: 'marc', title: '«Шайқасушы пішіндер»', sub: 'Франц Марк · 1914 · «Көк салт атты» тобы', right: true },
        { img: 'kandinsky8', title: '«VIII композиция»', sub: `${KAN} · 1923 · Баухаус кезеңі` },
      ]) },
    ]);
  };

  // ---------- 7. Malevich: the square, the circle and the cross are real paintings ----------
  function triptych(c, t) {
    K.wall(c, t, '#D6CFBF');
    K.cam(c, { zoom: 1 + 0.05 * K.u(t, L.mal2.t, L.mal3.t), ...K.drift(t, 2, 19) }, () => {
      const names = ['шаршы', 'шеңбер', 'крест'], imgs = ['blacksquare', 'blackcircle', 'blackcross'];
      [520, 960, 1400].forEach((x, i) => {
        const d = t - ev.shapes[i]; if (d < -0.05) return;
        const s = 1 + 0.12 * (1 - ease.outCubic(clamp(d / 0.3))), a = clamp(d / 0.12);
        K.alpha(c, a, () => { c.save(); c.translate(x, 500); c.scale(s, s);
          if (K.has(imgs[i])) K.framed(c, IMG[imgs[i]], 0, 0, 330, { frame: 10, color: '#F4F1EA' });
          else if (i === 1) K.circle(c, 0, 0, 140, C.ink); else { K.rect(c, -48, -150, 96, 300, C.ink); K.rect(c, -150, -48, 300, 96, C.ink); }
          c.restore(); });
        if (!K.has(imgs[i])) K.text(c, names[i], x, 720, { size: 34, weight: 700, color: C.ink, spacing: 6, alpha: K.u(t, ev.shapes[i] + 0.2, ev.shapes[i] + 0.7) });
      });
    });
    K.text(c, 'Казимир Малевич · 1915–1923', 960, VIEW.y + 70, { size: 26, weight: 700, color: '#3A332A', spacing: 4, alpha: K.u(t, ev.shapes[0], ev.shapes[0] + 0.8) });
  }
  SCENES.malevich = (ctx, t) => {
    const m2 = L.mal2, m3 = L.mal3;
    if (t >= ev.square) return old.malevich(ctx, t);
    K.seq(ctx, t, [
      { at: S.malevich[0], draw: old.malevich },
      { at: m2.t - 1.2, fade: 0.7, draw: triptych },
      { at: m3.t + 0.45, fade: 0.9, draw: old.malevich },
    ]);
  };

  // ---------- 8. Mondrian: from the red tree to the grey tree to the grid ----------
  SCENES.mondrian = (ctx, t) => {
    const [t0] = S.mondrian, m1 = L.mon1, m2 = L.mon2, m3 = L.mon3, m4 = L.mon4;
    const mid = m1.t + m1.dur * 0.45;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        if (K.has('redtree')) K.pan(c, IMG.redtree, VIEW, t, t0, mid + 0.8, { zoom: 1.0, x: 0.5, y: 0.5 }, { zoom: 1.15, x: 0.45, y: 0.45 });
        c.fillStyle = `rgba(0,0,0,${0.45 * (1 - K.u(t, m1.t - 0.6, m1.t + 0.6))})`; c.fillRect(0, 0, W, G.H);
        K.chapter(c, t, t0 + 0.2, 'V', 'ПИТ МОНДРИАН', '1872 – 1944', { dur: m1.t - t0 - 0.1 });
        K.label(c, t, m1.t + 0.2, mid, '«Кешкі қызыл ағаш»', `${MON} · 1908–1910`);
      } },
      { at: mid, fade: 1.0, draw: (c, t) => {
        if (K.has('graytree')) K.pan(c, IMG.graytree, VIEW, t, mid, m2.t, { zoom: 1.0, x: 0.5, y: 0.5 }, { zoom: 1.18, x: 0.52, y: 0.45 });
        K.label(c, t, mid + 0.5, m2.t - 1.0, '«Сұр ағаш»', `${MON} · 1911`, { right: true });
      } },
      { at: m2.t - 0.9, fade: 0.8, draw: old.mondrian },
      { at: m3.t + m3.dur * 0.55, fade: 0.9, draw: (c, t) => {
        K.wall(c, t, '#D8D2C4');
        const a = m3.t + m3.dur * 0.55;
        K.cam(c, { zoom: 1 + 0.08 * K.io(t, a, m4.t), ...K.drift(t, 3, 37) }, () => { if (K.has('redplane')) K.framed(c, IMG.redplane, 960, 536, 600, { frame: 12, color: '#F4F1EA' }); else K.framed(c, IMG.mondrian, 960, 536, 600, { frame: 12, color: '#F4F1EA' }); });
        K.label(c, t, a + 0.4, m4.t - 0.4, K.has('redplane') ? '«Үлкен қызыл жазықтықты композиция»' : '«Қызыл, көк және сары композиция»', `${MON} · ${K.has('redplane') ? '1921' : '1930'}`);
      } },
      { at: m4.t - 0.6, fade: 0.9, draw: old.mondrian },
    ]);
  };

  // ---------- 9. the Bauhaus: Kandinsky's Bauhaus painting after the lesson ----------
  SCENES.bauhaus = (ctx, t) => {
    const b3 = L.bau3, a = b3.t + b3.dur * 0.72;
    K.seq(ctx, t, [
      { at: S.bauhaus[0], draw: old.bauhaus },
      { at: a, fade: 0.9, draw: (c, t) => {
        K.wall(c, t, '#201A16');
        K.cam(c, { zoom: 1 + 0.08 * K.io(t, a, S.bauhaus[1]), ...K.drift(t, 3, 47) }, () => { if (K.has('onwhite')) K.framed(c, IMG.onwhite, 960, 536, 620, { frame: 14 }); });
        K.label(c, t, a + 0.3, S.bauhaus[1] + 0.3, '«Ақ үстінде II»', `${KAN} · 1923 · Баухаус`);
      } },
    ]);
  };

  // ---------- 10. New York: Mondrian arrives in 1940 and paints the city's rhythm ----------
  SCENES.newyork = (ctx, t) => {
    const n1 = L.ny1, n2 = L.ny2, a = n1.t + 2.2;
    K.seq(ctx, t, [
      { at: S.newyork[0], draw: old.newyork },
      { at: a, fade: 0.9, draw: (c, t) => {
        if (K.has('broadway')) K.pan(c, IMG.broadway, VIEW, t, a, ev.pollock + 1, { zoom: 2.2, x: 0.3, y: 0.3 }, { zoom: 1.0, x: 0.5, y: 0.5 }, ease.inOutCubic);
        c.fillStyle = `rgba(0,0,0,${0.38 * K.u(t, n2.t - 0.3, n2.t + 0.4)})`; c.fillRect(0, 0, W, G.H);
        K.label(c, t, a + 0.4, n2.t - 0.2, '«Бродвей буги-вуги»', `${MON} · Нью-Йорк, 1942–1943`);
        K.track(c, 'АБСТРАКТІЛІ ЭКСПРЕССИОНИЗМ', 960, 470, t, n2.t + 0.2, { size: 70, weight: 800, spacing: 3, wide: 22, shadow: 30 });
      } },
      { at: ev.pollock + 0.25, fade: 0.7, draw: old.newyork },
    ]);
  };

  // ---------- 11. after: Malevich's "White on White" as the ancestor of minimalism ----------
  SCENES.after = (ctx, t) => {
    const a2 = L.aft2, b = a2.t + a2.dur * 0.5;
    K.seq(ctx, t, [
      { at: S.after[0], draw: old.after },
      { at: a2.t - 0.5, fade: 0.8, draw: (c, t) => {
        K.wall(c, t, '#CFC9BC');
        K.cam(c, { zoom: 1 + 0.08 * K.io(t, a2.t - 0.5, b + 1), ...K.drift(t, 2, 63) }, () => { if (K.has('whiteonwhite')) K.framed(c, IMG.whiteonwhite, 960, 536, 600, { frame: 10, color: '#F4F1EA' }); });
        K.label(c, t, a2.t, b, '«Ақ үстіндегі ақ»', `${MAL} · 1918 · минимализмнің бастауы`);
      } },
      { at: b, fade: 0.9, draw: old.after },
    ]);
  };

  // ---------- 15. the end: a wall of every painting in the film, then the steppe at sunset ----------
  const WALL = ['kandinsky7', 'mondrian', 'blacksquare', 'circles', 'klint7', 'yrb', 'matisse', 'broadway', 'impression3', 'suprem', 'monet', 'gris', 'delaunay', 'redtree',
    'comp6', 'klee', 'marc', 'popova', 'proun', 'onwhite', 'cezanne', 'whiteonwhite', 'doesburg', 'altar', 'senecio', 'windows', 'picabia', 'swan', 'comp4', 'kandinsky8', 'graytree', 'redsquare', 'supremus58', 'firstabs', 'murnau', 'derain'];
  function collage(c, t) {
    const [t0] = S.end, e2 = L.end2;
    c.fillStyle = '#0D0B0A'; c.fillRect(0, 0, W, G.H);
    const list = WALL.filter(K.has), cols = 9, cw = 300, ch = 225, gap = 14;
    const rows = Math.ceil(list.length / cols), gw = cols * (cw + gap), gh = rows * (ch + gap);
    const z = lerp(3.2, 0.92, ease.inOutCubic(K.u(t, t0, e2.t - 0.4)));
    K.cam(c, { zoom: z, x: lerp(-gw * 0.17, 0, K.io(t, t0, e2.t - 0.4)), y: lerp(-gh * 0.14, 0, K.io(t, t0, e2.t - 0.4)) }, () => {
      list.forEach((n, i) => {
        const x = 960 - gw / 2 + (i % cols) * (cw + gap) + gap / 2, y = 540 - gh / 2 + Math.floor(i / cols) * (ch + gap) + gap / 2;
        K.noReg++; G.kenBurns(c, IMG[n], x, y, cw, ch, t, t0, S.end[1], { from: { zoom: 1, x: 0.5, y: 0.5 }, to: { zoom: 1.08, x: 0.5, y: 0.5 } }); K.noReg--;
        // a small caption strip on every tile of the wall
        const m = K.META[n]; if (m) {
          c.save(); c.globalAlpha *= 0.72; c.fillStyle = '#0B0A09'; c.fillRect(x, y + ch - 46, cw, 46); c.restore();
          const fit = (str, size, weight) => { c.font = `${weight} ${size}px ${K.SANS}`; let s = size; while (s > 10 && c.measureText(str).width > cw - 16) { s -= 1; c.font = `${weight} ${s}px ${K.SANS}`; } return s; };
          const art = m[1].split(' · ')[0];
          K.text(c, m[0], x + cw / 2, y + ch - 31, { size: fit(m[0], 16, 700), weight: 700 });
          K.text(c, art, x + cw / 2, y + ch - 12, { size: fit(art, 13, 400), weight: 400, color: 'rgba(255,255,255,0.85)' });
        }
      });
    });
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, W, G.H);
    const e1 = L.end1;
    K.text(c, 'Абстракционизм өнерге пішін мен', 960, 470, { size: 60, weight: 800, shadow: 26, alpha: K.u(t, e1.t, e1.t + 0.8) });
    K.text(c, 'түстің өзі сөйлей алатынын көрсетті.', 960, 550, { size: 60, weight: 800, shadow: 26, alpha: K.u(t, e1.t + 0.5, e1.t + 1.3) });
  }
  SCENES.end = (ctx, t) => {
    K.seq(ctx, t, [
      { at: S.end[0], draw: collage },
      { at: L.end2.t - 0.6, fade: 1.0, draw: old.end },
    ]);
  };
})();
