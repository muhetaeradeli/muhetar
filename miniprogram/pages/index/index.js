// 快来拼豆吧 —— 拼豆小游戏（微信小程序版）

const COLORS = {
  K: ['#2b2b2e', '黑色'], W: ['#fafafa', '白色'], A: ['#a7a7ad', '灰色'],
  R: ['#e8343f', '大红'], P: ['#ff9fbf', '粉色'], M: ['#c2185b', '玫红'],
  O: ['#ff8a2a', '橙色'], Y: ['#ffd23f', '黄色'], E: ['#f6deb6', '肤色'],
  N: ['#8b5a3c', '咖啡'], G: ['#45b85c', '草绿'], D: ['#1f7a45', '深绿'],
  L: ['#a6e3a1', '浅绿'], B: ['#2f7de1', '蓝色'], C: ['#8fd3ff', '天蓝'],
  V: ['#8e5bd8', '紫色'], U: ['#cdb4f5', '浅紫'], T: ['#2a3d8f', '藏青'],
};
const KEYS = Object.keys(COLORS);

const PATTERNS = [
  { name: '爱心', rows: [
    '..KKK...KKK..',
    '.KRRRK.KRRRK.',
    'KRWRRRKRRRRRK',
    'KRWRRRRRRRRRK',
    'KRRRRRRRRRRRK',
    '.KRRRRRRRRRK.',
    '..KRRRRRRRK..',
    '...KRRRRRK...',
    '....KRRRK....',
    '.....KRK.....',
    '......K......',
  ]},
  { name: '草莓', rows: [
    '....GGG....',
    '..GGGGGGG..',
    '...RGGGR...',
    '..RRRRRRR..',
    '.RRYRRRYRR.',
    '.RRRRRYRRR.',
    '.RYRRRRRRR.',
    '.RRRRYRRYR.',
    '..RRRRRRR..',
    '..RYRRRRR..',
    '...RRRYR...',
    '....RRR....',
  ]},
  { name: '小猫', rows: [
    '.K.........K.',
    '.KK.......KK.',
    '.KOK.....KOK.',
    '.KOOKKKKKOOK.',
    'KOOOOOOOOOOOK',
    'KOOKOOOOOKOOK',
    'KOOKOOOOOKOOK',
    'KPOOOOKOOOOPK',
    'KOOOOKOKOOOOK',
    '.KOOOOOOOOOK.',
    '..KKKKKKKKK..',
  ]},
  { name: '星星', rows: [
    '......Y......',
    '.....YYY.....',
    '.....YYY.....',
    '....YYYYY....',
    'YYYYYYYYYYYYY',
    '.YYYYYYYYYYY.',
    '..YYYKYKYYY..',
    '...YYYYYYY...',
    '...YYYPYYY...',
    '..YYYY.YYYY..',
    '..YYY...YYY..',
    '.YY.......YY.',
  ]},
  { name: '小蘑菇', rows: [
    '....KKKKK....',
    '..KKRRWRRKK..',
    '.KRRRWWWRRRK.',
    '.KWRRRWRRRWK.',
    'KWWWRRRRRWWWK',
    'KWWRRRRRRRWWK',
    'KRRRRWWWRRRRK',
    '.KKKEEEEEKKK.',
    '...KEKEKEK...',
    '...KEEEEEK...',
    '....KKKKK....',
  ]},
  { name: '彩虹', rows: [
    '...RRRRRRR...',
    '..RROOOOORR..',
    '.RROYYYYYORR.',
    '.ROYYGGGYYOR.',
    'ROYYGBBBGYYOR',
    'ROYGB...BGYOR',
    'ROYGB...BGYOR',
    'WWWGB...BGWWW',
    'WWWWW...WWWWW',
  ]},
];

const BOARD = '#f4f1ec';
const PEG = '#ddd6cc';
const SAVE_KEY = 'pindou-free';

const makeGrid = (w, h) => Array.from({ length: h }, () => Array(w).fill(null));
const cloneGrid = (g) => g.map((r) => r.slice());
const patternGrid = (p) => p.rows.map((r) => r.split('').map((ch) => (ch === '.' ? null : ch)));
const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function windowInfo() {
  try {
    if (wx.getWindowInfo) return wx.getWindowInfo();
  } catch (e) {}
  return wx.getSystemInfoSync();
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return `rgb(${clamp((n >> 16) + amt)},${clamp(((n >> 8) & 255) + amt)},${clamp((n & 255) + amt)})`;
}

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function drawBead(c, x, y, s, hex, t, boardColor) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const half = s * (0.44 + 0.07 * t); // 熨烫后胀大、互相粘连
  const corner = s * (0.44 - 0.3 * t); // 圆 → 圆角方块
  const hole = s * (0.17 - 0.1 * t); // 中间的孔变小
  rr(c, cx - half, cy - half, half * 2, half * 2, corner);
  c.fillStyle = hex;
  c.fill();
  if (t < 0.6) {
    c.save();
    c.globalAlpha = 0.35 * (1 - t / 0.6);
    c.strokeStyle = shade(hex, -40);
    c.lineWidth = Math.max(1, s * 0.05);
    c.stroke();
    c.beginPath();
    c.arc(cx - s * 0.12, cy - s * 0.12, s * 0.3, Math.PI * 1.05, Math.PI * 1.55);
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = Math.max(1, s * 0.07);
    c.stroke();
    c.restore();
  }
  if (hole > 0.5) {
    c.beginPath();
    c.arc(cx, cy, hole, 0, Math.PI * 2);
    c.fillStyle = boardColor;
    c.fill();
  }
}

function toast(title) {
  wx.showToast({ title, icon: 'none', duration: 1600 });
}

Page({
  data: {
    mode: 'free',
    tool: 'pen',
    tools: [
      { id: 'pen', label: '✏️ 放豆' },
      { id: 'eraser', label: '🧽 拿走' },
      { id: 'fill', label: '🪣 填充' },
      { id: 'picker', label: '💧 吸色' },
    ],
    keys: [],
    color: 'R',
    curHex: COLORS.R[0],
    curName: COLORS.R[1],
    canvasW: 300,
    canvasH: 300,
    sizes: [16, 24, 29],
    size: 24,
    counts: [],
    total: 0,
    thumbs: [],
    patIndex: 0,
    showHint: true,
    pct: 0,
    timer: '0:00',
    wrong: 0,
    left: 0,
    canUndo: false,
    canRedo: false,
    ironed: false,
    win: false,
    winStars: '',
    winText: '',
  },

  // ---------- 生命周期 ----------
  onLoad() {
    this.W = 24;
    this.H = 24;
    this.grid = makeGrid(24, 24);
    this.undoStack = [];
    this.redoStack = [];
    this.ironT = 0;
    this.ironing = false;
    this.target = null;
    this.wrongCount = 0;
    this.won = false;
    this.timerId = null;
    this.startTime = 0;
    this.cell = 12;
    this.dragging = false;

    this.setData({
      keys: KEYS.map((k) => ({ k, hex: COLORS[k][0], name: COLORS[k][1] })),
    });
    this.refreshThumbs();
    if (wx.showShareMenu) {
      wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] });
    }
  },

  onReady() {
    wx.createSelectorQuery()
      .select('#board')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          toast('画板加载失败，请升级微信');
          return;
        }
        this.canvas = res[0].node;
        this.ctx = this.canvas.getContext('2d');
        this.switchMode('free');
      });
  },

  onUnload() {
    this.stopTimer();
  },

  onShareAppMessage() {
    return { title: '快来拼豆吧！一起拼个小可爱', path: '/pages/index/index' };
  },

  onShareTimeline() {
    return { title: '快来拼豆吧！一起拼个小可爱' };
  },

  // ---------- 豆板 ----------
  setBoard(w, h, keep) {
    this.W = w;
    this.H = h;
    this.grid = keep || makeGrid(w, h);
    this.undoStack = [];
    this.redoStack = [];
    this.ironT = 0;
    this.resize();
    this.updateButtons();
  },

  resize() {
    const info = windowInfo();
    // 页面左右留白 12px + 卡片内边距 12px
    const maxW = info.windowWidth - 48;
    let cell = Math.floor(Math.min(maxW / this.W, 34));
    cell = Math.max(cell, 8);
    this.cell = cell;
    const w = cell * this.W;
    const h = cell * this.H;
    this.setData({ canvasW: w, canvasH: h }, () => {
      if (!this.canvas) return;
      const dpr = info.pixelRatio || 2;
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    });
  },

  draw(forExport) {
    const c = this.ctx;
    if (!c) return;
    const s = this.cell;
    const W = this.W;
    const H = this.H;
    const board = forExport ? '#ffffff' : BOARD;
    const target = this.data.mode === 'challenge' ? this.target : null;
    const showHint = this.data.showHint;

    c.clearRect(0, 0, s * W, s * H);
    c.fillStyle = board;
    if (forExport) c.fillRect(0, 0, s * W, s * H);
    else {
      rr(c, 0, 0, s * W, s * H, 8);
      c.fill();
    }

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (this.grid[y][x] || forExport) continue;
        const px = x * s + s / 2;
        const py = y * s + s / 2;
        if (target && showHint && target[y][x]) {
          c.beginPath();
          c.arc(px, py, s * 0.26, 0, Math.PI * 2);
          c.globalAlpha = 0.4;
          c.fillStyle = COLORS[target[y][x]][0];
          c.fill();
          c.lineWidth = 1;
          c.strokeStyle = 'rgba(0,0,0,0.25)';
          c.stroke();
          c.globalAlpha = 1;
        } else if (this.ironT < 1) {
          c.beginPath();
          c.arc(px, py, Math.max(1, s * 0.09), 0, Math.PI * 2);
          c.globalAlpha = 1 - this.ironT;
          c.fillStyle = PEG;
          c.fill();
          c.globalAlpha = 1;
        }
      }
    }

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const k = this.grid[y][x];
        if (!k) continue;
        drawBead(c, x * s, y * s, s, COLORS[k][0], this.ironT, board);
        if (!forExport && target && target[y][x] !== k && this.ironT === 0) {
          // 放错的豆子打个小叉
          const p = s * 0.3;
          c.save();
          c.strokeStyle = 'rgba(255,255,255,0.95)';
          c.lineWidth = Math.max(1.5, s * 0.08);
          c.beginPath();
          c.moveTo(x * s + p, y * s + p);
          c.lineTo(x * s + s - p, y * s + s - p);
          c.moveTo(x * s + s - p, y * s + p);
          c.lineTo(x * s + p, y * s + s - p);
          c.stroke();
          c.restore();
        }
      }
    }
  },

  // ---------- 历史 ----------
  pushUndo() {
    this.undoStack.push(cloneGrid(this.grid));
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.redoStack = [];
  },

  undo() {
    if (!this.undoStack.length || this.ironing) return;
    this.redoStack.push(cloneGrid(this.grid));
    this.grid = this.undoStack.pop();
    this.ironT = 0;
    this.afterChange();
  },

  redo() {
    if (!this.redoStack.length || this.ironing) return;
    this.undoStack.push(cloneGrid(this.grid));
    this.grid = this.redoStack.pop();
    this.ironT = 0;
    this.afterChange();
  },

  updateButtons() {
    this.setData({
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      ironed: this.ironT === 1,
    });
  },

  afterChange() {
    this.updateButtons();
    this.draw();
    if (this.data.mode === 'free') {
      this.updateCounts();
      this.saveLocal();
    } else {
      this.checkChallenge();
    }
  },

  // ---------- 触摸 ----------
  cellAt(e) {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!t) return null;
    const x = Math.floor(t.x / this.cell);
    const y = Math.floor(t.y / this.cell);
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return null;
    return [x, y];
  },

  buzz() {
    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}
  },

  apply(x, y) {
    const tool = this.data.tool;
    const color = this.data.color;
    if (tool === 'pen') {
      if (this.grid[y][x] === color) return false;
      this.grid[y][x] = color;
      if (this.data.mode === 'challenge' && this.target && this.target[y][x] !== color) this.wrongCount++;
      return true;
    }
    if (tool === 'eraser') {
      if (!this.grid[y][x]) return false;
      this.grid[y][x] = null;
      return true;
    }
    return false;
  },

  flood(x, y) {
    const from = this.grid[y][x];
    const to = this.data.color;
    if (from === to) return false;
    const st = [[x, y]];
    let n = 0;
    while (st.length) {
      const [cx, cy] = st.pop();
      if (cx < 0 || cy < 0 || cx >= this.W || cy >= this.H || this.grid[cy][cx] !== from) continue;
      this.grid[cy][cx] = to;
      if (this.data.mode === 'challenge' && this.target && this.target[cy][cx] !== to) this.wrongCount++;
      n++;
      st.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    return n > 0;
  },

  onStart(e) {
    if (this.ironing) return;
    const p = this.cellAt(e);
    if (!p) return;
    if (this.ironT === 1) {
      toast('先「撕下重做」才能继续修改哦');
      return;
    }
    const [x, y] = p;
    const tool = this.data.tool;
    if (tool === 'picker') {
      const k = this.grid[y][x];
      if (k) {
        this.selectColor(k);
        this.setData({ tool: 'pen' });
        toast('吸到了：' + COLORS[k][1]);
      }
      return;
    }
    if (tool === 'fill') {
      const snap = cloneGrid(this.grid);
      if (this.flood(x, y)) {
        this.undoStack.push(snap);
        this.redoStack = [];
        this.buzz();
        this.afterChange();
      }
      return;
    }
    this.dragging = true;
    this.undoStack.push(cloneGrid(this.grid));
    this.redoStack = [];
    this.dirty = this.apply(x, y);
    if (this.dirty) this.buzz();
    this.last = p;
    this.draw();
  },

  onMove(e) {
    if (!this.dragging) return;
    const p = this.cellAt(e);
    if (!p) return;
    const [x0, y0] = this.last;
    const [x1, y1] = p;
    if (x0 === x1 && y0 === y1) return;
    // 在两格之间补点，拖得快也不会断
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    let changed = false;
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / steps);
      const y = Math.round(y0 + ((y1 - y0) * i) / steps);
      if (this.apply(x, y)) changed = true;
    }
    if (changed) {
      this.dirty = true;
      this.buzz();
    }
    this.last = p;
    this.draw();
  },

  onEnd() {
    if (!this.dragging) return;
    this.dragging = false;
    if (!this.dirty) this.undoStack.pop();
    this.afterChange();
  },

  // ---------- 熨烫 ----------
  iron() {
    if (this.ironing || !this.canvas) return;
    if (!this.grid.some((r) => r.some(Boolean))) {
      toast('先放几颗豆子再熨烫吧');
      return;
    }
    const from = this.ironT;
    const to = this.ironT === 1 ? 0 : 1;
    this.ironing = true;
    const t0 = Date.now();
    const dur = 900;
    const raf = (fn) => (this.canvas.requestAnimationFrame
      ? this.canvas.requestAnimationFrame(fn)
      : setTimeout(fn, 16));
    if (to === 1) toast('♨️ 熨斗加热中…');
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / dur);
      const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      this.ironT = from + (to - from) * ease;
      this.draw();
      if (k < 1) {
        raf(step);
      } else {
        this.ironT = to;
        this.ironing = false;
        this.draw();
        this.updateButtons();
        if (to === 1) toast('✨ 熨好啦！可以存到相册');
      }
    };
    raf(step);
  },

  // ---------- 保存图片 ----------
  onSave() {
    if (!this.canvas || this.ironing) return;
    if (!this.grid.some((r) => r.some(Boolean))) {
      toast('豆板还是空的哦');
      return;
    }
    this.draw(true);
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      fileType: 'png',
      success: (r) => {
        this.draw();
        wx.saveImageToPhotosAlbum({
          filePath: r.tempFilePath,
          success: () => toast('已保存到相册'),
          fail: (err) => {
            if (err && /auth|deny/i.test(err.errMsg || '')) {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置里允许「保存到相册」，才能存下你的作品',
                confirmText: '去设置',
                success: (m) => { if (m.confirm) wx.openSetting(); },
              });
            }
          },
        });
      },
      fail: () => {
        this.draw();
        toast('保存失败，请再试一次');
      },
    });
  },

  // ---------- 工具和颜色 ----------
  onTool(e) {
    this.setData({ tool: e.currentTarget.dataset.t });
  },

  onColor(e) {
    this.selectColor(e.currentTarget.dataset.k);
    const t = this.data.tool;
    if (t === 'eraser' || t === 'picker') this.setData({ tool: 'pen' });
  },

  selectColor(k) {
    this.setData({ color: k, curHex: COLORS[k][0], curName: COLORS[k][1] });
  },

  onClear() {
    if (this.ironing || !this.grid.some((r) => r.some(Boolean))) return;
    this.pushUndo();
    this.grid = makeGrid(this.W, this.H);
    this.ironT = 0;
    this.afterChange();
    toast('已清空，可以撤销');
  },

  // ---------- 自由创作 ----------
  onSize(e) {
    const n = e.currentTarget.dataset.n;
    if (n === this.W || this.ironing) return;
    const old = this.grid;
    const ow = this.W;
    const oh = this.H;
    const g = makeGrid(n, n);
    // 原来的作品居中搬过去
    const ox = Math.floor((n - ow) / 2);
    const oy = Math.floor((n - oh) / 2);
    for (let y = 0; y < oh; y++) {
      for (let x = 0; x < ow; x++) {
        const nx = x + ox;
        const ny = y + oy;
        if (old[y][x] && nx >= 0 && ny >= 0 && nx < n && ny < n) g[ny][nx] = old[y][x];
      }
    }
    this.setData({ size: n });
    this.setBoard(n, n, g);
    this.updateCounts();
    this.saveLocal();
  },

  onMirror() {
    if (this.ironing || this.ironT === 1) return;
    this.pushUndo();
    this.grid = this.grid.map((r) => r.slice().reverse());
    this.afterChange();
  },

  updateCounts() {
    const cnt = {};
    let total = 0;
    this.grid.forEach((r) => r.forEach((k) => {
      if (k) {
        cnt[k] = (cnt[k] || 0) + 1;
        total++;
      }
    }));
    this.setData({
      total,
      counts: KEYS.filter((k) => cnt[k]).map((k) => ({ k, hex: COLORS[k][0], name: COLORS[k][1], n: cnt[k] })),
    });
  },

  saveLocal() {
    try {
      wx.setStorageSync(SAVE_KEY, JSON.stringify({ W: this.W, H: this.H, grid: this.grid }));
    } catch (e) {}
  },

  loadLocal() {
    try {
      const d = JSON.parse(wx.getStorageSync(SAVE_KEY) || 'null');
      if (d && d.grid && d.W && d.H) return d;
    } catch (e) {}
    return null;
  },

  // ---------- 模式 ----------
  onTab(e) {
    const m = e.currentTarget.dataset.m;
    if (m !== this.data.mode) this.switchMode(m);
  },

  switchMode(m) {
    if (this.ironing) return;
    this.stopTimer();
    this.setData({ mode: m, win: false });
    if (m === 'free') {
      this.target = null;
      const d = this.loadLocal();
      if (d) {
        this.setData({ size: d.W });
        this.setBoard(d.W, d.H, d.grid);
      } else {
        this.setData({ size: 24 });
        this.setBoard(24, 24);
      }
      this.updateCounts();
    } else {
      this.startPattern(this.data.patIndex);
    }
  },

  // ---------- 临摹挑战 ----------
  refreshThumbs() {
    this.setData({
      thumbs: PATTERNS.map((p, i) => {
        let best = 0;
        try { best = +wx.getStorageSync('pindou-best-' + i) || 0; } catch (e) {}
        return {
          name: p.name,
          best: best ? '★'.repeat(best) : '',
          rows: patternGrid(p).map((r) => r.map((k) => (k ? COLORS[k][0] : 'transparent'))),
        };
      }),
    });
  },

  onPattern(e) {
    this.startPattern(e.currentTarget.dataset.i);
  },

  onRestart() {
    this.startPattern(this.data.patIndex);
  },

  onHint() {
    this.setData({ showHint: !this.data.showHint }, () => this.draw());
  },

  startPattern(i) {
    if (this.ironing) return;
    this.stopTimer();
    this.target = patternGrid(PATTERNS[i]);
    this.wrongCount = 0;
    this.won = false;
    this.startTime = 0;
    const first = this.target.flat().find(Boolean);
    this.setData({ patIndex: i, timer: '0:00', tool: 'pen', win: false });
    if (first) this.selectColor(first);
    this.setBoard(this.target[0].length, this.target.length);
    this.checkChallenge();
  },

  startTimer() {
    if (this.timerId) return;
    this.startTime = Date.now();
    this.timerId = setInterval(() => {
      this.setData({ timer: fmt(Date.now() - this.startTime) });
    }, 500);
  },

  stopTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  },

  checkChallenge() {
    const target = this.target;
    if (!target) return;
    let need = 0;
    let ok = 0;
    let extra = 0;
    let any = false;
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        const t = target[y][x];
        const g = this.grid[y][x];
        if (g) any = true;
        if (t) {
          need++;
          if (g === t) ok++;
        }
        if (g && g !== t) extra++;
      }
    }
    if (any && !this.timerId && !this.won) this.startTimer();
    const pct = Math.round((ok / need) * 100);
    this.setData({ pct, wrong: this.wrongCount, left: need - ok + extra });

    if (ok === need && extra === 0 && !this.won) {
      this.won = true;
      this.stopTimer();
      const time = Date.now() - this.startTime;
      let stars = 3;
      if (this.wrongCount > 3) stars--;
      if (this.wrongCount > 10) stars--;
      const noHint = !this.data.showHint;
      if (noHint && stars < 3) stars++;
      const i = this.data.patIndex;
      try {
        const best = +wx.getStorageSync('pindou-best-' + i) || 0;
        if (stars > best) wx.setStorageSync('pindou-best-' + i, stars);
      } catch (e) {}
      this.refreshThumbs();
      try { wx.vibrateShort({ type: 'heavy' }); } catch (e) {}
      this.setData({
        timer: fmt(time),
        win: true,
        winStars: '★'.repeat(stars) + '☆'.repeat(3 - stars),
        winText: `「${PATTERNS[i].name}」完成！用时 ${fmt(time)}，放错 ${this.wrongCount} 次${noHint ? '，无提示挑战 +1 星' : ''}。`,
      });
    }
  },

  onWinIron() {
    this.setData({ win: false });
    this.iron();
  },

  onWinNext() {
    this.setData({ win: false });
    this.startPattern((this.data.patIndex + 1) % PATTERNS.length);
  },
});
