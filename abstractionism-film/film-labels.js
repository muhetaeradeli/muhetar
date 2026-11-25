// MUSEUM CAPTIONS: every painting on screen gets its title and artist, automatically.
// Each frame, every framed or full-screen painting registers where it landed on screen and how visible it is
// (dissolves included); after the scene is drawn, the most visible ones get a caption: under a framed
// picture, or in the lower-left corner of a full-screen one.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K;
  const { clamp, ease } = U;
  const W = G.W, H = G.H, VIEW = K.VIEW;

  const KAN = 'Василий Кандинский', MAL = 'Казимир Малевич', MON = 'Пит Мондриан', KLINT = 'Хильма аф Клинт', KLEE = 'Пауль Клее';
  const META = {
    kandinsky7: ['«VII композиция»', `${KAN} · 1913`],
    kandinsky8: ['«VIII композиция»', `${KAN} · 1923`],
    circles: ['«Бірнеше шеңбер»', `${KAN} · 1926`],
    firstabs: ['«Атаусыз» (алғашқы абстрактілі акварель)', `${KAN} · 1910 деп белгіленген`],
    impression3: ['«III әсер (Концерт)»', `${KAN} · 1911`],
    yrb: ['«Сары – қызыл – көк»', `${KAN} · 1925`],
    onwhite: ['«Ақ үстінде II»', `${KAN} · 1923`],
    comp6: ['«VI композиция»', `${KAN} · 1913`],
    comp4: ['«IV композиция»', `${KAN} · 1911`],
    blackrider: ['«Көк салт атты»', `${KAN} · 1903`],
    murnau: ['«Мурнау. Мұнаралы пейзаж»', `${KAN} · 1908`],
    blacklines: ['«Қара сызықтар»', `${KAN} · 1913`],
    blacksquare: ['«Қара шаршы»', `${MAL} · 1915`],
    blackcircle: ['«Қара шеңбер»', `${MAL}`],
    blackcross: ['«Қара крест»', `${MAL} · 1915`],
    suprem: ['«Супрематистік композиция»', `${MAL} · 1916`],
    supremus58: ['«Супремус №58»', `${MAL} · 1916`],
    redsquare: ['«Қызыл шаршы»', `${MAL} · 1915`],
    whiteonwhite: ['«Ақ үстіндегі ақ»', `${MAL} · 1918`],
    expo010: ['«0,10» көрмесі (фотосурет)', 'Петроград · 1915'],
    mondrian: ['«Қызыл, көк және сары композиция»', `${MON} · 1930`],
    redplane: ['«Үлкен қызыл жазықтықты композиция»', `${MON} · 1921`],
    redtree: ['«Кешкі қызыл ағаш»', `${MON} · 1908–1910`],
    graytree: ['«Сұр ағаш»', `${MON} · 1911`],
    broadway: ['«Бродвей буги-вуги»', `${MON} · 1942–1943`],
    klint7: ['«Ең үлкен ондық, №7. Ересек шақ»', `${KLINT} · 1907`],
    altar: ['«Алтарь суреті, №1»', `${KLINT} · 1915`],
    swan: ['«Аққу, №17»', `${KLINT} · 1915`],
    monet: ['«Әсер. Шығып келе жатқан күн»', 'Клод Моне · 1872'],
    cezanne: ['«Сент-Виктуар тауы»', 'Поль Сезанн · 1902–1904'],
    klee: ['«Қамал мен күн»', `${KLEE} · 1928`],
    senecio: ['«Сенецио»', `${KLEE} · 1922`],
    parnassum: ['«Ad Parnassum»', `${KLEE} · 1932`],
    doesburg: ['«Контр-композиция V»', 'Тео ван Дусбург · 1924'],
    matisse: ['«Қалпақ киген әйел»', 'Анри Матисс · 1905'],
    derain: ['«Чаринг-Кросс көпірі»', 'Андре Дерен · 1906'],
    gris: ['«Пабло Пикассоның портреті»', 'Хуан Грис · 1912'],
    delaunay: ['«Дөңгелек пішіндер»', 'Робер Делоне · 1930'],
    windows: ['«Қалаға қараған терезелер»', 'Робер Делоне · 1912'],
    marc: ['«Шайқасушы пішіндер»', 'Франц Марк · 1914'],
    bluehorses: ['«Көк аттар мұнарасы»', 'Франц Марк · 1913'],
    proun: ['«Проун 5А»', 'Эль Лисицкий · 1919'],
    popova: ['«Кескіндемелік архитектоника»', 'Любовь Попова · 1918'],
    picabia: ['«Удни»', 'Франсис Пикабиа · 1913'],
  };
  K.META = META;
  const nameOf = (img) => { for (const [n, v] of Object.entries(K.IMG)) if (v === img) return n; return null; };

  // ---------- the registry: what painting is where, how visible ----------
  let REG = [], MUL = 1;
  K.noReg = 0;
  K.withMul = (m, fn) => { const o = MUL; MUL *= m; try { fn(); } finally { MUL = o; } };
  K.resetLabels = () => { REG = []; MUL = 1; };
  function register(ctx, img, x, y, w, h, kind) {
    if (K.noReg || !img) return;
    const name = nameOf(img); if (!name || !META[name]) return;
    const f = ctx.filter || 'none', bl = /blur\(([\d.]+)px\)/.exec(f);
    if (bl && +bl[1] / (G.scale || 1) > 3) return;               // a painting thrown out of focus is scenery, not the subject
    const m = ctx.getTransform(), k = (G.scale || 1);
    const pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([px, py]) => [(m.a * px + m.c * py + m.e) / k, (m.b * px + m.d * py + m.f) / k]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const r = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    const alpha = ctx.globalAlpha * MUL;
    if (alpha < 0.03) return;
    REG.push({ name, kind, alpha, ...r });
  }
  // wrap the two ways a painting reaches the screen
  const framed0 = K.framed;
  K.framed = (ctx, img, cx, cy, h, o = {}) => { const r = framed0(ctx, img, cx, cy, h, o); if (r && r.w) register(ctx, img, r.x, r.y, r.w, r.h, 'framed'); return r; };
  const kb0 = G.kenBurns;
  G.kenBurns = (ctx, img, x, y, w, h, ...rest) => { kb0(ctx, img, x, y, w, h, ...rest); register(ctx, img, x, y, w, h, 'pan'); };

  // dissolves: the outgoing shot shows (1 - a), the incoming one a
  K.seq = (ctx, t, shots) => {
    let i = 0; for (let k = 0; k < shots.length; k++) if (t >= shots[k].at) i = k;
    const s = shots[i], f = s.fade ?? 0.8, a = i > 0 && f > 0 ? K.u(t, s.at, s.at + f) : 1;
    if (a >= 1) { ctx.save(); s.draw(ctx, t); ctx.restore(); return; }
    const e = ease.inOutQuad(a);
    K.withMul(1 - e, () => { ctx.save(); shots[i - 1].draw(ctx, t); ctx.restore(); });
    let b; K.withMul(e, () => { b = K.offscreen((x) => s.draw(x, t)); });
    ctx.save(); ctx.globalAlpha = e; ctx.drawImage(b, 0, 0, W, H); ctx.restore();
  };

  // the old hand-placed labels give way whenever a painting already has its caption
  const label0 = K.label;
  K.label = (ctx, ...args) => { if (REG.length) return; label0(ctx, ...args); };

  // ---------- drawing the captions ----------
  function plate(ctx, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = 0.62 * a; ctx.fillStyle = '#0B0A09'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.restore(); }
  function caption(ctx, title, sub, x, y, align, a, small) {
    const ts = small ? 27 : 34, ss = small ? 21 : 26;
    ctx.save();
    ctx.font = `700 ${ts}px ${K.SANS}`; const tw = ctx.measureText(title).width;
    ctx.font = `400 ${ss}px ${K.SANS}`; const sw = ctx.measureText(sub).width;
    ctx.restore();
    const w = Math.max(tw, sw) + 40, h = ts + ss + 34;
    const x0 = align === 'left' ? x - 20 : align === 'right' ? x - w + 20 : x - w / 2;
    plate(ctx, x0, y - ts * 0.75 - 12, w, h, a);
    K.rect(ctx, align === 'right' ? x0 + w - 5 : x0, y - ts * 0.75 - 12, 5, h, K.C.gold, a);
    K.text(ctx, title, x, y, { size: ts, weight: 700, align, alpha: a });
    K.text(ctx, sub, x, y + ts * 0.5 + ss * 0.75 + 6, { size: ss, weight: 400, align, color: 'rgba(255,255,255,0.86)', alpha: a });
  }
  K.drawLabels = (ctx) => {
    // one entry per painting (the most visible copy), clipped to the picture area
    const best = {};
    for (const r of REG) {
      const cx0 = Math.max(r.x0, VIEW.x), cx1 = Math.min(r.x1, VIEW.x + VIEW.w), cy0 = Math.max(r.y0, VIEW.y), cy1 = Math.min(r.y1, VIEW.y + VIEW.h);
      if (cx1 <= cx0 || cy1 <= cy0) continue;
      const area = (cx1 - cx0) * (cy1 - cy0);
      if (area < 0.03 * VIEW.w * VIEW.h) continue;
      const e = { ...r, cx0, cx1, cy0, cy1, area };
      if (!best[r.name] || best[r.name].alpha * best[r.name].area < e.alpha * e.area) best[r.name] = e;
    }
    const list = Object.values(best).sort((p, q) => q.area * q.alpha - p.area * p.alpha).slice(0, 3);
    const small = list.length > 1;
    for (const r of list) {
      const [title, sub] = META[r.name];
      const a = clamp(r.alpha * 1.15);
      const full = (r.cx1 - r.cx0) > 0.85 * VIEW.w && (r.cy1 - r.cy0) > 0.85 * VIEW.h;
      const tall = (r.cy1 - r.cy0) > 0.85 * VIEW.h;
      if (full || (tall && r.kind === 'pan')) {
        // a full-screen painting (or one panel of a split screen): lower corner, on the side the picture is on
        const right = !full && (r.cx0 + r.cx1) / 2 > W / 2;
        caption(ctx, title, sub, right ? Math.min(r.cx1, VIEW.x + VIEW.w) - 70 : Math.max(r.cx0, VIEW.x) + 70, VIEW.y + VIEW.h - 104, right ? 'right' : 'left', a, small);
      } else {
        // a framed picture: centred under it, or just inside its lower edge when there is no room below
        const cx = clamp((r.cx0 + r.cx1) / 2, VIEW.x + 260, VIEW.x + VIEW.w - 260);
        const below = r.y1 + 46;
        const y = below + 64 < VIEW.y + VIEW.h - 12 ? below : Math.min(r.cy1, VIEW.y + VIEW.h) - 82;
        caption(ctx, title, sub, cx, y, 'center', a, small);
      }
    }
  };
})();
