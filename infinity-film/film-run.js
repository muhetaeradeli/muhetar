// THE PLAYER: turns the plan into one continuous list of shots (with the chapter title cards, the two figures and
// the end card added), and draws the shot of any moment, dissolving from the one before.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE, GR = globalThis.GR, BG = globalThis.BG, OV = globalThis.OV, H = globalThis.GH;
  const { clamp, lerp, ease } = U;
  const { line: L, scenes: SCN, names, ev, figs } = SC;
  const { IMG } = K;
  const W = G.W, HH = G.H;
  const { CX, CY, TOP, BOT, CREAM, GOLD, PALE, NAVY, INK } = GR;
  const { at, end, win, glowLine, caps, big, small, wrap, hornsGeo, circlePts, star } = H;
  const uu = (t, a, b) => K.u(t, a, b), io = (t, a, b) => K.io(t, a, b);
  const { E, CARD, mv } = globalThis.FILM_PLAN;

  // a chapter's title card: the heading of the text over a blurred photograph
  const cardPainter = (scene) => (c, t, sh) => {
    const sc = SCN[scene], img = CARD[scene] || 'c_pattern', b = H.blurred(img, 10);
    if (b) G.kenBurns(c, b, 0, TOP, W, BOT - TOP, t, sh.start - 1, sh.end + 2, { from: { zoom: 1.15, x: 0.5, y: 0.5 }, to: { zoom: 1.3, x: 0.5, y: 0.5 } });
    c.fillStyle = sc.kind === 'part' ? 'rgba(6,12,30,0.68)' : 'rgba(6,12,30,0.58)'; c.fillRect(0, 0, W, HH);
    const t0 = sh.start + 0.2, part = sc.kind === 'part', size = part ? 62 : 56;
    const lines = wrap(c, sc.title.toUpperCase(), 1500, size, 800);
    const y0 = CY - (lines.length - 1) * size * 0.62 + (part ? 20 : 0);
    if (part) { if (sc.part) K.text(c, sc.part, CX, y0 - 110, { size: 44, weight: 800, color: GOLD, spacing: 6, alpha: uu(t, t0, t0 + 0.6), shadow: 14 }); K.shanyrak(c, CX, y0 - (sc.part ? 190 : 120), 34, GOLD, 2.5, t * 0.08); }
    lines.forEach((ln, i) => K.track(c, ln, CX, y0 + i * size * 1.24, t, t0 + i * 0.15, { size, weight: 800, spacing: 3, wide: 22, shadow: 26 }));
    const u = K.out(t, t0 + 0.3, t0 + 1.6), ry = y0 + (lines.length - 1) * size * 1.24 + 62;
    K.rect(c, CX - 180 * u, ry, 360 * u, 3, GOLD);
  };
  // the two figures of the text, rebuilt as moving diagrams
  const FIG = {
    4: { title: 'ДӘСТҮРЛІ ҚАЗАҚ ДҮНИЕТАНЫМЫНДАҒЫ УАҚЫТ ПЕН КЕҢІСТІК', center: ['УАҚЫТ ПЕН КЕҢІСТІК ЖҮЙЕСІ', 'табиғат • қоғам • қоныс • қолөнер'], caption: 'Сызба 4. Дәстүрлі дүниетанымдағы уақыт пен кеңістіктің ұйымдастырылуы',
      boxes: [['ТАБИҒИ ЖӘНЕ АСТРОНОМИЯЛЫҚ УАҚЫТ', ['таң, сәске, тал түс, бесін, ақшам, түн', 'Күн мен жарық өзгерісі арқылы уақыт', 'Ай, Темірқазық, Жетіқарақшы, Үркер', 'аспан денелері арқылы уақыт пен бағыт', 'сапар мен шаруашылықты жоспарлау']],
        ['МАУСЫМДЫҚ ЖӘНЕ ШАРУАШЫЛЫҚ УАҚЫТ', ['көктеу, жайлау, күзеу, қыстау', 'төлдеу, көшу, мал жинау, қысқа дайындық', 'жүн қырқу, шөп шабу, тері илеу, киіз басу', 'шикізатты маусымға сай жинау, өңдеу', 'табиғи өзгеріс пен еңбектің бірлігі']],
        ['ҚОНЫС, ЖОЛ ЖӘНЕ БАҒЫТ ЖҮЙЕСІ', ['су, жайылым, жер бедері, ауа райы', 'көшу жолы, сауда, хабар алмасу', 'Күн, жұлдыз, өзен арқылы бағыт табу', 'күншығыс, күнбатыс, жоғары, төмен', 'жер-су атаулары — кеңістік жады']],
        ['КИІЗ ҮЙ ЖӘНЕ ӘЛЕУМЕТТІК КЕҢІСТІК', ['төр, босаға, табалдырық', 'ішкі және сыртқы кеңістік', 'орын тәртібі: жас пен мәртебе', 'қонақ, демалыс, қолөнер аймағы', 'кеңістік арқылы қатынасты реттеу']],
        ['ҒҰРЫПТЫҚ, ӘЛЕУМЕТТІК, ТАРИХИ УАҚЫТ', ['бесікке салу, тұсаукесер, үйлену, ас беру', 'балалықтан ақсақалдыққа дейін', 'әр кезеңге тән киім, әшекей, міндет', 'шежіре — ұрпақтар реті', 'жеті ата мен әулеттік жад']],
        ['ҚОЛӨНЕР ЖӘНЕ ҚАЗІРГІ ЭТНОДИЗАЙН', ['материалды қолайлы маусымда дайындау', 'пішін — табиғи орта мен қызметке сай', 'уақыт — ырғақ пен қайталану', 'кеңістік — орталық, жиек, бағыт', 'табиғи материал, мобильді құрылым']]] },
    5: { title: 'ШЕКСІЗДІК СИМВОЛДАРЫН ЗАМАНАУИ ЭТНОДИЗАЙНҒА БЕЙІМДЕУ', center: ['ШЕКСІЗДІК СИМВОЛЫН БЕЙІМДЕУ', 'мағына • модуль • қызмет • технология'], caption: 'Сызба 5. Шексіздік символдарын этнодизайнға бейімдеу жүйесі',
      boxes: [['БЕЙІМДЕУ ЖӘНЕ ДЕРЕККӨЗДІ ЗЕРТТЕУ', ['мағынасы мен құрылымын сақтау', 'жаңа өнім қызметіне бейімдеу', 'көшіруді авторлық шешіммен алмастыру', 'музей, еңбек, каталог, фото', 'кезең, аймақ, материал, қызмет']],
        ['КОМПОЗИЦИЯЛЫҚ ӨЗЕК ЖӘНЕ ӨРНЕК ТҮРЛЕРІ', ['модуль, ырғақ, симметрия, бағыт', 'өлшем, аралық, бұрылу, түйісу', 'шеңберлік және үзіліссіз құрылым', '«бітпес», «шет ою», «төртқұлақ»', 'шиыршық, мүйіз тәрізді иілімдер']],
        ['СТИЛИЗАЦИЯ, ТҮС ЖӘНЕ МАТЕРИАЛ', ['ықшамдау, геометриялау, масштабтау', 'фрагменттеу, абстракциялау', 'танымдық белгі мен мәдени сипат', 'түс үйлесімі мен контраст', 'киіз, мата, ағаш, металл қасиеті']],
        ['ҚОЛДАНЫЛУ САЛАЛАРЫ', ['киім: кесте, тігіс, пішім сызығы', 'интерьер: қабырға, жиһаз, жарық', 'графика: логотип, қаптама, стиль', 'цифрлық орта: анимация, интерфейс', 'масштаб пен қызметтің сәйкестігі']],
        ['ЗАМАНАУИ ТЕХНОЛОГИЯЛАР', ['параметрлік, генеративтік жобалау', 'модуль өлшемі мен қайталану', 'бұрылу бұрышы мен аралық', 'ЖИ көмегімен нұсқалар іздеу', 'дерекпен, түпнұсқамен тексеру']],
        ['ЭТИКА, АЛГОРИТМ ЖӘНЕ БАҒАЛАУ', ['шығу тегі, мағынасы, авторлық құқық', 'қасиетті белгіні орынсыз қолданбау', 'мақсат → зерттеу → талдау → стилизация', 'материал → прототип → тексеру', 'қызмет, тұтастық, сәйкестік']]] },
  };
  // the end: the steppe at sunset, the title and the credits
  const endPainter = (c, t, sh) => {
    const img = IMG.my_1;
    if (img) G.kenBurns(c, img, 0, TOP, W, BOT - TOP, t, sh.start - 0.5, sh.end, { from: { zoom: 1.3, x: 0.45, y: 0.6 }, to: { zoom: 1.02, x: 0.5, y: 0.55 } });
    H.grade(c, 0.1, 0.3);
    c.fillStyle = `rgba(0,0,0,${0.66 * io(t, ev.fin - 0.4, ev.fin + 1.2)})`; c.fillRect(0, 0, W, HH);
    K.alpha(c, uu(t, ev.fin, ev.fin + 1.0), () => { K.shanyrak(c, CX, 230, 44, GOLD, 3, t * 0.08); K.text(c, 'ШЕКСІЗДІК ПЕН МӘҢГІЛІК', CX, 330, { size: 66, weight: 800, spacing: 5, shadow: 24 }); K.rect(c, CX - 200, 374, 400, 2, GOLD); });
    const people = [...new Set((globalThis.CREDITS || []).filter((x) => x.license !== '—').map((x) => x.author.replace(/\s*\(.*$/, '')))];
    const lines = ['Мәтін: «Қазақтың дәстүрлі қолөнеріндегі шексіздік пен мәңгілік идеясы»'];
    let cur = 'Фото:'; for (const p of people) { if ((cur + ' · ' + p).length > 118) { lines.push(cur); cur = p; } else cur += (cur.endsWith(':') ? ' ' : ' · ') + p; }
    lines.push(cur, 'Flickr · CC BY / BY-SA / BY-NC / BY-NC-SA', 'Дауыс: ISSAI KazakhTTS (синтез) · Музыка: домбыраға арналған түпнұсқа күй');
    lines.forEach((s, i) => K.text(c, s, CX, 430 + i * 34, { size: i === 0 ? 22 : 18, weight: 400, color: 'rgba(243,234,210,0.86)', alpha: uu(t, ev.fin + 0.8 + i * 0.15, ev.fin + 1.6 + i * 0.15) }));
  };

  // ---------- the shot list ----------
  const shots = [];
  const planned = new Set(E.map((e) => e.at));
  E.forEach((e, order) => {
    const l = L[e.at]; if (!l) return;
    const base = e.word ? at(e.at, e.word) : l.t;
    shots.push({ ...e, id: e.at, start: base - (e.lead ?? 0.45), fade: e.fade ?? 1.0, order });
  });
  // a title card for every chapter whose heading has no entry of its own
  names.forEach((n, i) => {
    const sc = SCN[n], head = sc.lines.find((l) => l.kind === 'heading');
    if (!head || planned.has(head.id)) return;
    shots.push({ id: head.id, start: sc.t0 - 0.2, fade: 0.9, paint: cardPainter(n), order: -1000 + i });
  });
  figs.forEach((f) => shots.push({ id: null, start: f.t - 0.6, fade: 1.0, paint: GR.mindmap(FIG[f.n]), order: 1e5 }));
  shots.push({ id: null, start: ev.fin - 1.4, fade: 1.4, paint: endPainter, order: 2e5 });
  shots.sort((a, b) => a.start - b.start || a.order - b.order);
  shots.forEach((s, i) => { const nx = shots[i + 1]; s.end = nx ? nx.start : SC.DURATION; s.k0 = s.start - 0.3; s.k1 = s.end + (nx ? nx.fade : 1) + 0.3; });

  // ---------- drawing ----------
  function drawShot(c, t, sh) {
    if (sh.paint) sh.paint(c, t, sh);
    else {
      const img = IMG[sh.img];
      if (img) {
        const [a, b] = sh.mv;
        if (sh.rot) K.cam(c, { rot: (t - sh.k0) * sh.rot }, () => G.kenBurns(c, img, -340, TOP - 340, W + 680, BOT - TOP + 680, t, sh.k0, sh.k1, { from: a, to: b, ease: ease.inOutQuad }));
        else G.kenBurns(c, img, 0, TOP, W, BOT - TOP, t, sh.k0, sh.k1, { from: a, to: b, ease: sh.linear ? (x) => x : ease.inOutQuad });
        H.grade(c, sh.warm ?? 0.08, 0.3);
      } else { c.fillStyle = K.grad(c, 0, TOP, 0, BOT, [[0, '#1B2446'], [1, '#2A1C16']]); c.fillRect(0, 0, W, HH); }
    }
    if (sh.dim) { c.fillStyle = `rgba(6,12,30,${sh.dim})`; c.fillRect(0, 0, W, HH); }
    if (sh.draw) sh.draw(c, t, sh);
  }
  let _sb = null;
  const sbuf = () => {
    const k = G.scale || 1, w = Math.round(W * k), h = Math.round(HH * k);
    if (!_sb || _sb.width !== w || _sb.height !== h) _sb = G.makeCanvas(w, h);
    const x = _sb.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h); x.setTransform(k, 0, 0, k, 0, 0);
    return _sb;
  };
  const find = (t) => { let lo = 0, hi = shots.length - 1, r = 0; while (lo <= hi) { const m = (lo + hi) >> 1; if (shots[m].start <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; };
  globalThis.RUN = (ctx, t) => {
    const i = find(t), s = shots[i], a = i > 0 ? uu(t, s.start, s.start + s.fade) : 1;
    if (a >= 1) { drawShot(ctx, t, s); return; }
    drawShot(ctx, t, shots[i - 1]);
    const b = sbuf(); drawShot(b.getContext('2d'), t, s);
    ctx.save(); ctx.globalAlpha = ease.inOutQuad(a); ctx.drawImage(b, 0, 0, W, HH); ctx.restore();
  };
  globalThis.FILM_SHOTS = shots;
})();
