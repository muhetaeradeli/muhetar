import * as THREE from 'three';
import { BASE, CX, C0, DISC, MOON, CUT, BAND, CELLS } from './shapes.js';

const SEG = 96;
const RED = '#c0392b';
const NEW_FILL = [205, 222, 240];   // 新做的：偏蓝
const OLD_FILL = [252, 251, 248];   // 已做好的：白

function head(cell, tag) {
  const d = document.createElement('div');
  d.className = 'head';
  d.innerHTML = `<div class="num">${cell.n}</div><b>${cell.title}</b><span>${tag}</span>`;
  return d;
}

// ---------- 轴测图 ----------
function axon(cell) {
  const box = document.createElement('div');
  box.className = 'cell';
  box.appendChild(head(cell, cell.sub));
  const note = document.createElement('div');
  note.className = 'note';
  note.textContent = cell.note;
  box.appendChild(note);
  document.getElementById('axon').appendChild(box);

  const w = box.clientWidth, h = box.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2);
  renderer.setSize(w, h);
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 2.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(-0.5, -1, 1.6);
  scene.add(sun);

  const edgeMat = new THREE.LineBasicMaterial({ color: 0x222222 });
  const add = (geo, color, z) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
    }));
    mesh.position.z = z;
    scene.add(mesh);
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), edgeMat);
    lines.position.z = z;
    scene.add(lines);
  };

  const board = new THREE.Shape();
  board.moveTo(0, 0); board.lineTo(BASE, 0); board.lineTo(BASE, BASE); board.lineTo(0, BASE); board.closePath();
  add(new THREE.ExtrudeGeometry(board, { depth: 3, bevelEnabled: false }), 0xd9d5c8, -3);

  for (const p of cell.parts) {
    add(new THREE.ExtrudeGeometry(p.shape, { depth: p.h, bevelEnabled: false, curveSegments: SEG }),
      p.fixed ? 0xffffff : 0xc9dcf2, p.z0);
  }

  const view = 138;
  const asp = w / h;
  const cam = new THREE.OrthographicCamera(-view * asp, view * asp, view, -view, 1, 2000);
  cam.up.set(0, 0, 1);
  const target = new THREE.Vector3(BASE / 2, BASE / 2 + 4, 0);
  cam.position.copy(target).add(new THREE.Vector3(-230, -520, 470));
  cam.lookAt(target);
  renderer.render(scene, cam);
}

// ---------- SVG 小工具 ----------
const NS = 'http://www.w3.org/2000/svg';
function el(parent, name, attrs, text) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent.appendChild(e);
  return e;
}
const Y = (y) => BASE - y;

function shapePath(shape) {
  const loop = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${Y(p.y).toFixed(2)}`).join('') + 'Z';
  const { shape: outer, holes } = shape.extractPoints(SEG);
  return loop(outer) + holes.map(loop).join('');
}

function label(g, x, y, s, opt = {}) {
  const t = el(g, 'text', {
    x, y, 'font-size': opt.size || 4.8, fill: opt.fill || RED, 'text-anchor': opt.anchor || 'middle',
    'font-weight': opt.bold ? 700 : 400,
    stroke: opt.halo || '#f7f5f1', 'stroke-width': 1.4, 'paint-order': 'stroke',
  }, s);
  if (opt.rot) t.setAttribute('transform', `rotate(${opt.rot} ${x} ${y})`);
  return t;
}

function dim(g, x0, y0, x1, y1, text, opt = {}) {
  el(g, 'line', { x1: x0, y1: Y(y0), x2: x1, y2: Y(y1), stroke: RED, 'stroke-width': 0.35 });
  const ang = Math.atan2(-(y1 - y0), x1 - x0) + Math.PI / 4;
  for (const [x, y] of [[x0, y0], [x1, y1]]) {
    const t = 1.6;
    el(g, 'line', {
      x1: x - t * Math.cos(ang), y1: Y(y) - t * Math.sin(ang),
      x2: x + t * Math.cos(ang), y2: Y(y) + t * Math.sin(ang), stroke: RED, 'stroke-width': 0.5,
    });
  }
  if (text) label(g, (x0 + x1) / 2 + (opt.dx || 0), Y((y0 + y1) / 2) + (opt.dy || 0), text, opt);
}
const guide = (g, x0, y0, x1, y1) => el(g, 'line', { x1: x0, y1: Y(y0), x2: x1, y2: Y(y1), stroke: RED, 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });

// ---------- 平面图 ----------
const HEIGHTS = {
  1: [[52, 150, '+5'], [24, 60, '+5'], [CX, 11.5, '+10'], [CX, 78, '+10', 1], [CX, 32, '+5', 1]],
  2: [[42, 140, '+5'], [74, 132, '+10'], [24, 60, '+5'], [CX, 11.5, '+10'], [CX, 78, '+5', 1], [CX, 37, '+10', 1], [CX, 29.5, '+15', 1]],
  3: [[CX, 177, '+5'], [CX, 159, '+10'], [CX, 136, '+15'], [24, 60, '+5'],
      [147, 33, '+10'], [134, 19.5, '+15'], [CX, 11.5, '+20'],
      [68, 80, '+15', 1], [CX, 90, '+20', 1], [CX, 52, '+25', 1]],
};

function plan(cell) {
  const box = document.createElement('div');
  box.className = 'cell plan';
  box.appendChild(head(cell, '平面图 · 图上数字 = 顶面高度'));
  document.getElementById('plan').appendChild(box);

  const svg = el(box, 'svg', { viewBox: '-36 -42 282 290', preserveAspectRatio: 'xMidYMid meet' });
  el(svg, 'rect', { x: 0, y: 0, width: BASE, height: BASE, fill: '#e3dfd3', stroke: '#555', 'stroke-width': 0.5 });
  el(svg, 'line', { x1: CX, y1: -6, x2: CX, y2: BASE + 6, stroke: '#999', 'stroke-width': 0.25, 'stroke-dasharray': '4 1.5 0.8 1.5' });

  const top = 25;
  [...cell.parts].sort((a, b) => a.z0 - b.z0).forEach((p) => {
    const k = (p.z0 + p.h) / top;
    const c = p.fixed ? OLD_FILL.map((v) => Math.round(v - 30 * k))
                      : NEW_FILL.map((v, i) => Math.round(v - [70, 55, 35][i] * k));
    el(svg, 'path', {
      d: shapePath(p.shape), fill: `rgb(${c})`, 'fill-rule': 'evenodd',
      stroke: '#333', 'stroke-width': 0.45, 'stroke-linejoin': 'round',
    });
  });

  const g = el(svg, 'g', {});
  const D = DISC, M = MOON;
  // 底板
  dim(g, 0, -10, BASE, -10, '底板 210', { dy: 6 });
  dim(g, BASE + 10, 0, BASE + 10, BASE, '210', { dx: 5, rot: 90 });
  // 大月牙长 150
  dim(g, M.x - M.r, BASE + 12, M.x + M.r, BASE + 12, '大月牙 长 150', { dy: -2 });
  guide(g, M.x - M.r, BASE + 14, M.x - M.r, M.y); guide(g, M.x + M.r, BASE + 14, M.x + M.r, M.y);
  // 外圈平面
  dim(g, 5, M.y, M.x - M.r - CUT, M.y, '20', { dy: -2 });
  dim(g, -12, C0.y - C0.r, -12, C0.y + C0.r, '外圈平面 Ø200', { dx: -4, rot: -90 });
  label(g, 26, Y(M.y) + 8, `缝 ${CUT}`, { size: 4.2 });
  // 弧带
  label(g, 186, Y(18), '弧带 R54–R62', { size: 4.2 });
  label(g, 186, Y(13), '= 你画的线', { size: 4.2 });
  // 空隙（月牙内弧与圆之间）
  if (cell.gap) {
    const u = [Math.cos(Math.PI * 0.72), Math.sin(Math.PI * 0.72)];
    dim(g, D.x + 45 * u[0], D.y + 45 * u[1], D.x + (45 + cell.gap) * u[0], D.y + (45 + cell.gap) * u[1], `空隙 ${cell.gap}`, { dx: -9, dy: 1 });
  }
  if (cell.n !== 3) {
    label(g, 152, Y(170), '原小月牙', { size: 4.2, fill: '#555' });
    label(g, 152, Y(165), '+ 连接条（已粘）', { size: 4.2, fill: '#555' });
    el(g, 'line', { x1: 130, y1: Y(167.5), x2: 116, y2: Y(160), stroke: '#555', 'stroke-width': 0.25 });
  }

  for (const [x, y, s, old] of HEIGHTS[cell.n]) {
    label(g, x, Y(y) + 1.7, s, { fill: old ? '#555' : '#1d3f66', bold: true, size: 5, halo: 'rgba(255,255,255,0.6)' });
  }
}

// ---------- 剖面（沿竖向中轴线切开） ----------
function inside(shape, px, py) {
  const hit = (pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a.x > px) !== (b.x > px) && py < ((b.y - a.y) * (px - a.x)) / (b.x - a.x) + a.y) c = !c;
    }
    return c;
  };
  const { shape: outer, holes } = shape.extractPoints(SEG);
  return hit(outer) && !holes.some(hit);
}

function section(cell) {
  const box = document.createElement('div');
  box.className = 'cell sec';
  document.getElementById('sec').appendChild(box);
  const K = 2;
  const svg = el(box, 'svg', { viewBox: '-40 -72 290 92', preserveAspectRatio: 'xMidYMid meet' });
  label(svg, 0, -62, `沿中轴线切开（剖面，高度放大 ${K} 倍）　左 = 板下边（圆）　右 = 板上边（月牙）`, { anchor: 'start', fill: '#444', size: 4.6 });
  el(svg, 'rect', { x: 0, y: 0, width: BASE, height: 3 * K, fill: '#d9d5c8', stroke: '#333', 'stroke-width': 0.4 });
  let top = 0;
  const px = cell.n === 3 ? CX : CX + 7;   // 第 1、2 格偏开连接条一点
  for (const p of cell.parts) {
    let start = null;
    for (let t = 0; t <= BASE + 0.25; t += 0.25) {
      const on = t <= BASE && inside(p.shape, px, t + 0.01);
      if (on && start === null) start = t;
      if (!on && start !== null) {
        el(svg, 'rect', {
          x: start, y: -(p.z0 + p.h) * K, width: t - start, height: p.h * K,
          fill: p.fixed ? '#fcfbf8' : '#c9dcf2', stroke: '#333', 'stroke-width': 0.4,
        });
        start = null;
        top = Math.max(top, p.z0 + p.h);
      }
    }
  }
  for (let z = 5; z <= top; z += 5) {
    el(svg, 'line', { x1: BASE + 4, y1: -z * K, x2: BASE + 12, y2: -z * K, stroke: RED, 'stroke-width': 0.3 });
    label(svg, BASE + 14, -z * K + 1.6, `${z}`, { anchor: 'start', size: 4.4 });
  }
}

for (const c of CELLS) axon(c);
for (const c of CELLS) plan(c);
for (const c of CELLS) section(c);
window.__done = true;
