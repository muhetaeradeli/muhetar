// SCENES (1-minute draft): the title over the steppe, «Қазақтың даласы» in photographs, sunset into the starry
// sky, the yurt and the view up to its roof, the carpets and the endless ornament, the end card.
// Every photograph has a painted fallback, so the film renders even when assets/ is empty.
(function () {
  const U = globalThis.U, G = globalThis.G, K = globalThis.K, SC = globalThis.SCORE;
  const { clamp, lerp, ease } = U;
  const { ev, line: L, S } = SC;
  const { C, VIEW, IMG, BAR } = K;
  const W = G.W, H = G.H;
  const SCENES = (globalThis.SCENES = globalThis.SCENES || {});
  const HZ = 650; // the painted horizon
  const CREAM = '#F3EAD2';

  // the moment a word is spoken inside a line (by its share of the characters)
  const at = (l, word) => l.t + l.dur * Math.max(0, l.text.indexOf(word)) / l.text.length;

  // ---------- colour: day → dusk → night ----------
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, u) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(u)))).join(',')})`; };
  const PAL = {
    top: ['#3F7FCC', '#22305E', '#03060F'], mid: ['#9CC7E6', '#C86A4C', '#0B1638'], hor: ['#EFE7CB', '#F4B860', '#1E2A55'],
    far: ['#93A27A', '#4D3B4C', '#0E1424'], midg: ['#B7A262', '#5F4231', '#0A0F1A'], near: ['#C9A04C', '#3B2A1E', '#06080F'],
    grass: ['#F1DFA8', '#C98E4E', '#1A1A24'],
  };
  const pal = (k, ph) => (ph <= 0.5 ? mix(PAL[k][0], PAL[k][1], ph / 0.5) : mix(PAL[k][1], PAL[k][2], (ph - 0.5) / 0.5));

  // ---------- the painted steppe (ph: 0 noon · 0.5 sunset · 1 night) ----------
  function grass(c, t, ph, pan) {
    c.save(); c.lineCap = 'round';
    const base = VIEW.y + VIEW.h + 6, span = W + 240;
    for (let i = 0; i < 240; i++) {
      const x = ((((U.hash(i, 11) * span - pan * 1.6) % span) + span) % span) - 120;
      const h = 70 + U.hash(i, 12) * 170, sway = Math.sin(t * 1.2 + i * 0.7) * 9 + U.noise1(t * 0.35 + i * 0.1, 4) * 18;
      c.strokeStyle = pal('grass', ph); c.globalAlpha = 0.35 + U.hash(i, 14) * 0.45; c.lineWidth = 1.4 + U.hash(i, 13) * 2.2;
      c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x + sway * 0.2, base - h * 0.55, x + sway, base - h); c.stroke();
    }
    c.restore();
  }
  function steppe(c, t, ph, { pan = 0, moon = 0, sunX = 1330 } = {}) {
    c.fillStyle = K.grad(c, 0, VIEW.y - 40, 0, HZ + 10, [[0, pal('top', ph)], [0.62, pal('mid', ph)], [1, pal('hor', ph)]]);
    c.fillRect(-300, -300, W + 600, HZ + 310);
    const st = clamp((ph - 0.6) / 0.3);
    if (st > 0) for (let i = 0; i < 170; i++) {
      const tw = 0.6 + 0.4 * Math.sin(t * (0.8 + U.hash(i, 3) * 2) + i);
      K.circle(c, U.hash(i, 1) * W, VIEW.y - 20 + U.hash(i, 2) * (HZ - VIEW.y - 30), 0.8 + U.hash(i, 4) * 1.7, `rgba(255,255,255,${st * (0.3 + 0.6 * tw)})`);
    }
    // the sun: high at noon, on the horizon at sunset, gone at night
    const sy = lerp(VIEW.y + 110, HZ + 70, clamp(ph / 0.58));
    if (ph < 0.62) {
      K.glow(c, sunX, sy, 760, 'rgba(255,196,110,0.55)', 1 - clamp((ph - 0.45) / 0.17) * 0.6);
      K.circle(c, sunX, sy, 44, mix('#FFF6DC', '#FFB15A', ph / 0.55));
    }
    if (moon > 0) {
      const mx = 560, my = lerp(HZ + 40, VIEW.y + 170, moon);
      K.glow(c, mx, my, 260, 'rgba(190,210,255,0.35)', moon);
      K.circle(c, mx, my, 34, `rgba(244,240,226,${moon})`);
      K.circle(c, mx + 14, my - 8, 30, pal('top', ph)); // the crescent
    }
    K.hills(c, HZ - 16, 24, pal('far', ph), 3, pan * 0.3);
    K.hills(c, HZ + 34, 30, pal('midg', ph), 5, pan * 0.6);
    K.hills(c, HZ + 130, 36, pal('near', ph), 8, pan);
    grass(c, t, ph, pan);
  }

  // a photograph over the picture area, with a Ken Burns move; false if the photograph is missing
  const photo = (c, name, t, t0, t1, from, to, e) => {
    const img = IMG[name]; if (!img) return false;
    G.kenBurns(c, img, 0, VIEW.y, W, VIEW.h, t, t0, t1, { from, to, ease: e || ease.inOutQuad });
    return true;
  };
  // a soft cinematic grade over a photograph: warm highlights, deeper shadows at the bottom
  const grade = (c, warm = 0.1, dark = 0.25) => {
    c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = `rgba(255,170,90,${warm})`; c.fillRect(0, 0, W, H); c.restore();
    c.fillStyle = K.grad(c, 0, VIEW.y + VIEW.h * 0.55, 0, VIEW.y + VIEW.h, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${dark})`]]); c.fillRect(0, 0, W, H);
  };

  // ---------- ornament ----------
  // an endless running scroll: one unbroken wave, each crest curling inward; it scrolls forever.
  // u = how much of the width is drawn (0..1)
  function scroll(c, y, A, w, t, { color = C.gold, lw = 5, speed = 36, u = 1, dir = 1 } = {}) {
    const off = ((t * speed * dir) % (2 * w) + 2 * w) % (2 * w), xEnd = lerp(-40, W + 40, u);
    c.save(); c.strokeStyle = color; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    for (let x = -40; x <= xEnd; x += 6) { const y0 = y - A * Math.sin(Math.PI * (x - off) / w); if (x === -40) c.moveTo(x, y0); else c.lineTo(x, y0); }
    c.stroke();
    // the curls, one on every crest
    for (let k = -3; k * w + off < W + 2 * w; k++) {
      const xc = k * w + off + w / 2; if (xc > xEnd || xc < -w) continue;
      const s = (((k % 2) + 2) % 2) ? -1 : 1, yc = y - s * A;
      const cx = xc + w * 0.2, cy = y - s * A * 0.28;
      const r0 = Math.hypot(xc - cx, yc - cy), a0 = Math.atan2(yc - cy, xc - cx);
      const grow = clamp((xEnd - xc) / (w * 0.6));
      c.beginPath();
      for (let i = 0, n = 60; i <= n * grow; i++) { const q = i / n, a = a0 + s * q * Math.PI * 2.1, r = r0 * (1 - 0.82 * q); const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
      c.stroke();
    }
    c.restore();
  }
  function felt(c, base = '#0D1E4C') {
    c.fillStyle = base; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(255,255,255,${0.012 + U.hash(i, 61) * 0.02})`; c.fillRect(U.hash(i, 62) * W, U.hash(i, 63) * H, 1 + U.hash(i, 64) * 3, 1 + U.hash(i, 65) * 3); }
  }

  // Ken Burns moves run FADE seconds past the end of their shot, so the picture keeps moving through every dissolve
  const FADE = 1.4, XF = 1.2;
  // where a point of a photograph (fraction py of its height) lands on screen during a Ken Burns move
  const kbY = (name, t, t0, t1, from, to, py, e = ease.inOutQuad) => {
    const img = IMG[name]; if (!img) return null;
    const u = e(clamp((t - t0) / (t1 - t0))), zoom = lerp(from.zoom, to.zoom, u), fy = lerp(from.y, to.y, u);
    const cover = Math.max(W / img.width, VIEW.h / img.height) * zoom, ih = img.height * cover;
    const oy = clamp(VIEW.h / 2 - fy * ih, VIEW.h - ih, 0);
    return VIEW.y + oy + py * ih;
  };

  // ============ 1. THE TITLE over the steppe at sunset ============
  SCENES.open = (ctx, t) => {
    const [, t1] = S.open, o1 = L.o1;
    if (!photo(ctx, 'ak_sunset', t, 0, t1 + FADE, { zoom: 1.28, x: 0.47, y: 0.62 }, { zoom: 1.06, x: 0.5, y: 0.58 })) steppe(ctx, t, 0.47, { pan: t * 8 });
    else grade(ctx, 0.1, 0.3);
    ctx.fillStyle = `rgba(0,0,0,${0.4 * (1 - K.u(t, o1.end - 1.2, o1.end + 0.8))})`; ctx.fillRect(0, 0, W, H);
    K.alpha(ctx, 1 - K.u(t, o1.end - 1.0, o1.end + 0.4), () => {
      const s = K.io(t, ev.title, ev.title + 2.4);
      K.alpha(ctx, s, () => K.shanyrak(ctx, 960, 318, 58, C.gold, 3, t * 0.08));
      K.text(ctx, 'ҚАЗАҚТЫҢ ДӘСТҮРЛІ ҚОЛӨНЕРІНДЕГІ', 960, 440, { size: 30, weight: 700, color: C.gold, spacing: 9, alpha: K.u(t, ev.title + 0.4, ev.title + 1.4), shadow: 14 });
      K.track(ctx, 'ШЕКСІЗДІК ПЕН МӘҢГІЛІК', 960, 525, t, ev.title, { size: 96, weight: 800, spacing: 5, wide: 40, shadow: 30 });
      const u = K.out(t, ev.title + 0.6, ev.title + 2.0);
      K.rect(ctx, 960 - 220 * u, 590, 440 * u, 3, C.gold);
      K.text(ctx, 'И Д Е Я С Ы', 960, 640, { size: 32, weight: 400, color: CREAM, spacing: 6, alpha: K.u(t, ev.title + 1.2, ev.title + 2.2), shadow: 14 });
    });
  };

  // ============ 2. «ҚАЗАҚТЫҢ ДАЛАСЫ»: the steppe in photographs ============
  SCENES.steppe = (ctx, t) => {
    const [t0, t1] = S.steppe, d1 = L.d1, d2 = L.d2, d3 = L.d3;
    const s2 = d2.t - 0.6, s3 = d3.t - 0.6;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        // horses on the open steppe
        if (photo(c, 'nin_pano', t, t0, s2 + XF, { zoom: 1.0, x: 0.42, y: 0.6 }, { zoom: 1.16, x: 0.36, y: 0.62 })) grade(c, 0.06, 0.3);
        else steppe(c, t, 0.1, { pan: (t - t0) * 30 });
        K.chapter(c, t, t0 + 0.5, '', 'ҚАЗАҚТЫҢ ДАЛАСЫ', 'ұлан-ғайыр кеңістік', { dur: d1.end - t0 - 0.2 });
      } },
      { at: s2, fade: XF, draw: (c, t) => {
        // a slow pan across the open steppe and the big sky while the line names what the eye sees
        if (photo(c, 'undp_altyn', t, s2, s3 + XF, { zoom: 1.22, x: 0.2, y: 0.5 }, { zoom: 1.22, x: 0.8, y: 0.45 }, (x) => x)) grade(c, 0.08, 0.35);
        else steppe(c, t, 0.22, { pan: (t - s2) * 70 });
        ['Ұлан-ғайыр дала', 'ашық аспан', 'алыс көкжиек'].forEach((w, i) => {
          const ta = at(d2, w), a = K.win(t, ta, s3 + 0.4, 0.5, 0.6); if (a <= 0) return;
          const y = 330 + i * 92, u = K.out(t, ta, ta + 0.7);
          K.rect(c, 140, y - 26, 6, 52 * u, C.gold);
          K.text(c, w, 168 + 24 * (1 - u), y, { size: 62, weight: 800, align: 'left', alpha: a, shadow: 26 });
        });
      } },
      { at: s3, fade: XF, draw: (c, t) => {
        // the camera pulls back over the flat steppe; the horizon becomes a line without an end
        const from = { zoom: 1.32, x: 0.5, y: 0.34 }, to = { zoom: 1.0, x: 0.5, y: 0.3 };
        if (photo(c, 'undp_saiga', t, s3, t1 + FADE, from, to)) {
          // give the pale sky some depth, warm towards the horizon
          const hz = kbY('undp_saiga', t, s3, t1 + FADE, from, to, 0.276);
          c.fillStyle = K.grad(c, 0, VIEW.y, 0, hz, [[0, 'rgba(34,52,92,0.55)'], [0.7, 'rgba(120,110,120,0.18)'], [1, 'rgba(255,190,120,0.12)']]); c.fillRect(0, VIEW.y, W, hz - VIEW.y);
          grade(c, 0.1, 0.35);
        }
        else steppe(c, t, 0.3, { pan: (t - d3.t) * 18 });
        const ta = at(d3, 'шетсіздігі'), u = K.io(t, ta - 0.6, ta + 2.6);
        const hy = kbY('undp_saiga', t, s3, t1 + FADE, from, to, 0.276) ?? HZ - 14;
        K.alpha(c, K.win(t, ta - 0.6, t1 + 0.6, 0.3, 1.2), () => {
          K.glow(c, 960, hy, 380 * u + 40, 'rgba(255,190,100,0.3)');
          K.line(c, 960, hy, 960 - 1000 * u, hy, 'rgba(255,226,160,0.95)', 3);
          K.line(c, 960, hy, 960 + 1000 * u, hy, 'rgba(255,226,160,0.95)', 3);
          K.streak(c, 960, hy, 700 * u, '255,226,170', 0.7);
        });
        K.text(c, 'ШЕКСІЗДІК', 960, hy + 96, { size: 60, weight: 800, spacing: 16, color: '#FFF4DC', shadow: 34, alpha: K.win(t, ta + 0.8, t1 + 0.6, 0.8, 1.0) });
      } },
    ]);
  };

  // ============ 3. THE TURNING SKY: sunset, then the stars; the circle of the year ============
  SCENES.sky = (ctx, t) => {
    const [t0, t1] = S.sky, a1 = L.a1, n0 = ev.night - 0.9;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        if (photo(c, 'az_sunset', t, t0 - FADE, n0 + 1.6, { zoom: 1.12, x: 0.5, y: 0.72 }, { zoom: 1.3, x: 0.5, y: 0.78 })) grade(c, 0.1, 0.25);
        else steppe(c, t, lerp(0.3, 0.55, K.u(t, t0, n0)), { pan: (t - t0) * 14 });
      } },
      { at: n0, fade: 1.6, draw: (c, t) => {
        if (photo(c, 'live_stars', t, n0, t1 + FADE, { zoom: 1.45, x: 0.5, y: 0.2 }, { zoom: 1.3, x: 0.5, y: 0.25 })) grade(c, 0, 0.2);
        else steppe(c, t, 0.95, { pan: (t - t0) * 14, moon: K.io(t, n0, t1) });
      } },
    ]);
    // the year as a wheel: four seasons turning on one ring
    const ta = at(a1, 'маусымдардың'), a = K.win(t, ta - 0.4, t1 + 0.8, 0.8, 1.2);
    if (a > 0) K.alpha(ctx, a, () => {
      const cx = 1010, cy = 390, R = 170, u = K.io(t, ta - 0.4, ta + 1.6), rot = -Math.PI / 2 + (t - ta) * 0.35;
      ctx.save(); ctx.strokeStyle = 'rgba(255,226,160,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([2, 12]); ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(cx, cy, R, rot, rot + u * Math.PI * 2); ctx.stroke(); ctx.restore();
      ['КӨКТЕМ', 'ЖАЗ', 'КҮЗ', 'ҚЫС'].forEach((s, i) => {
        const an = rot + i * Math.PI / 2, x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R;
        K.alpha(ctx, K.u(t, ta - 0.2 + i * 0.35, ta + 0.4 + i * 0.35), () => {
          K.circle(ctx, x, y, 7, C.gold);
          K.text(ctx, s, x + Math.cos(an) * 58, y + Math.sin(an) * 40, { size: 30, weight: 700, spacing: 4, shadow: 18 });
        });
      });
    });
    K.label(ctx, t, t0 + 0.8, t1 - 0.3, 'Циклдік уақыт', 'күн мен түн · жыл мезгілдері · айналым');
  };

  // ============ 4. THE YURT, then up to its roof ============
  SCENES.yurt = (ctx, t) => {
    const [t0, t1] = S.yurt, sh = ev.shanyrak - 0.4;
    K.seq(ctx, t, [
      { at: t0, draw: (c, t) => {
        if (photo(c, 'ir_yurt', t, t0 - FADE, sh + XF, { zoom: 1.1, x: 0.5, y: 0.56 }, { zoom: 1.24, x: 0.48, y: 0.52 })) grade(c, 0.06, 0.3);
        else { steppe(c, t, 0.12, { pan: (t - t0) * 8 }); K.yurt(c, 960, HZ + 170, 2.3); }
        K.label(c, t, t0 + 0.8, sh, 'Киіз үй', 'дөңгелек пішін — әлемнің тұтастығы');
      } },
      { at: sh, fade: XF, draw: (c, t) => {
        // inside: the camera tilts up the lattice and the roof poles towards the crown, where the sky comes in
        if (photo(c, 'ch_int1', t, sh, t1 + FADE, { zoom: 1.3, x: 0.5, y: 0.7 }, { zoom: 1.75, x: 0.5, y: 0.05 })) grade(c, 0.05, 0.3);
        else { felt(c, '#3A2416'); K.shanyrak(c, 960, 540, 240, '#D9A25A', 14, (t - sh) * 0.06, false); }
        K.glow(c, 960, VIEW.y - 40, 700, 'rgba(255,240,210,0.45)', K.io(t, sh + 1.0, t1));
        K.label(c, t, sh + 0.6, t1 - 0.2, 'Шаңырақ', 'кеңістікті аспанмен байланыстырады', { right: true });
      } },
    ]);
  };

  // ============ 5. THE ENDLESS ORNAMENT ============
  SCENES.ornament = (ctx, t) => {
    const [t0, t1] = S.ornament;
    // the carpets of a Kazakh yurt: the camera glides along them, then the pattern lifts off as one endless line
    const carpet = (c, t, dim) => {
      if (photo(c, 'ch_int2', t, t0 - FADE, t1 + FADE, { zoom: 1.45, x: 0.25, y: 0.4 }, { zoom: 1.45, x: 0.8, y: 0.5 }, (x) => x)) grade(c, 0.05, 0.25);
      else felt(c);
      if (dim > 0) { c.fillStyle = `rgba(8,18,52,${0.82 * dim})`; c.fillRect(0, 0, W, H); }
    };
    const dim = K.io(t, ev.band - 0.6, ev.band + 1.0);
    carpet(ctx, t, dim);
    K.label(ctx, t, t0 + 0.6, ev.band - 0.2, 'Ою-өрнек', 'киіз үйдің сырмақ пен тұскиіздері');
    if (dim > 0) K.alpha(ctx, dim, () => {
      ctx.fillStyle = K.radial(ctx, 960, 520, 60, 760, [[0, 'rgba(255,200,120,0.16)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, W, H);
      const u = K.io(t, ev.band, ev.band + 2.4);
      scroll(ctx, VIEW.y + 82, 30, 110, t, { u, lw: 5 });
      scroll(ctx, VIEW.y + VIEW.h - 82, 30, 110, t, { u, lw: 5, dir: -1 });
      K.horns(ctx, 960, 330, 300, C.gold, 12, K.io(t, ev.band + 0.2, ev.band + 2.6));
      ctx.save(); ctx.strokeStyle = 'rgba(226,182,89,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([3, 14]); ctx.lineCap = 'round';
      const r = (t - ev.band) * 0.25; ctx.beginPath(); ctx.arc(960, 460, 250, r, r + u * Math.PI * 2); ctx.stroke(); ctx.restore();
      K.text(ctx, 'ҮЗІЛМЕЙТІН СЫЗЫҚ · ҚАЙТАЛАНАТЫН ЫРҒАҚ', 960, VIEW.y + VIEW.h - 170, { size: 30, weight: 700, spacing: 7, color: CREAM, alpha: K.u(t, ev.band + 1.4, ev.band + 2.4), shadow: 12 });
    });
  };

  // ============ 6. THE END: back to the steppe, the title, the credits ============
  SCENES.end = (ctx, t) => {
    const [t0, t1] = S.end;
    if (photo(ctx, 'my_1', t, t0 - FADE, t1, { zoom: 1.3, x: 0.45, y: 0.6 }, { zoom: 1.02, x: 0.5, y: 0.55 })) grade(ctx, 0.1, 0.3);
    else steppe(ctx, t, lerp(0.42, 0.56, K.u(t, t0, t1)), { pan: (t - t0) * 10 });
    ctx.fillStyle = `rgba(0,0,0,${0.62 * K.io(t, ev.fin - 0.8, ev.fin + 1.2)})`; ctx.fillRect(0, 0, W, H);
    K.alpha(ctx, K.u(t, ev.fin - 0.2, ev.fin + 1.0), () => {
      K.shanyrak(ctx, 960, 300, 52, C.gold, 3, t * 0.08);
      K.text(ctx, 'ШЕКСІЗДІК ПЕН МӘҢГІЛІК', 960, 420, { size: 74, weight: 800, spacing: 5, shadow: 24 });
      K.rect(ctx, 960 - 200, 470, 400, 2, C.gold);
    });
    const cr = globalThis.CREDITS || [];
    const people = [...new Set(cr.map((x) => x.author))].join(' · ');
    const lics = [...new Set(cr.map((x) => x.license.replace(/ \d\.\d$/, '')))].join(' / ');
    const lines = [
      'Мәтін: «Қазақтың дәстүрлі қолөнеріндегі шексіздік пен мәңгілік идеясы»',
      people ? `Фото: ${people}` : '',
      people ? `Flickr, ${lics}` : '',
      'Дауыс: ISSAI KazakhTTS (синтез) · Музыка: домбыраға арналған түпнұсқа күй',
    ].filter(Boolean);
    lines.forEach((s, i) => K.text(ctx, s, 960, 545 + i * 40, { size: s.length > 100 ? 19 : 22, weight: 400, color: 'rgba(243,234,210,0.85)', alpha: K.u(t, ev.fin + 0.8 + i * 0.25, ev.fin + 1.6 + i * 0.25) }));
  };
})();
