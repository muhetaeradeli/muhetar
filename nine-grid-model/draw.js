import * as THREE from 'three';
import { BASE, CY, CIRCLE, MOON, BAND, CELLS } from './shapes.js';

const SEG = 96;

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

  // 底板（厚 3）
  const board = new THREE.Shape();
  board.moveTo(0, 0); board.lineTo(BASE, 0); board.lineTo(BASE, BASE); board.lineTo(0, BASE); board.closePath();
  add(new THREE.ExtrudeGeometry(board, { depth: 3, bevelEnabled: false }), 0xd9d5c8, -3);

  for (const p of cell.parts) {
    add(new THREE.ExtrudeGeometry(p.shape, { depth: p.h, bevelEnabled: false, curveSegments: SEG }), 0xffffff, p.z0);
  }

  const view = 150;
  const asp = w / h;
  const cam = new THREE.OrthographicCamera(-view * asp, view * asp, view, -view, 1, 2000);
  cam.up.set(0, 0, 1);
  const target = new THREE.Vector3(BASE / 2, BASE / 2 + 8, 0);
  cam.position.copy(target).add(new THREE.Vector3(-260, -520, 430));
  cam.lookAt(target);
  renderer.render(scene, cam);
}

// ---------- 平面图 ----------
const NS = 'http://www.w3.org/2000/svg';
function el(parent, name, attrs, text) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  parent.appendChild(e);
  return e;
}
const Y = (y) => BASE - y; // 图纸坐标 y 朝上 → SVG y 朝下

function shapePath(shape) {
  const loop = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${Y(p.y).toFixed(2)}`).join('') + 'Z';
  const { shape: outer, holes } = shape.extractPoints(SEG);
  return loop(outer) + holes.map(loop).join('');
}

function dim(g, x0, y0, x1, y1, label, opt = {}) {
  const c = '#c0392b';
  el(g, 'line', { x1: x0, y1: Y(y0), x2: x1, y2: Y(y1), stroke: c, 'stroke-width': 0.35 });
  const ang = Math.atan2(-(y1 - y0), x1 - x0);
  for (const [x, y] of [[x0, y0], [x1, y1]]) {
    const t = 1.6;
    el(g, 'line', {
      x1: x - t * Math.cos(ang + Math.PI / 4), y1: Y(y) - t * Math.sin(ang + Math.PI / 4),
      x2: x + t * Math.cos(ang + Math.PI / 4), y2: Y(y) + t * Math.sin(ang + Math.PI / 4),
      stroke: c, 'stroke-width': 0.5,
    });
  }
  const mx = (x0 + x1) / 2 + (opt.dx || 0), my = Y((y0 + y1) / 2) + (opt.dy || 0);
  const t = el(g, 'text', {
    x: mx, y: my, 'font-size': 5, fill: c, 'text-anchor': 'middle',
    stroke: '#f7f5f1', 'stroke-width': 1.6, 'paint-order': 'stroke',
  }, label);
  if (opt.rot) t.setAttribute('transform', `rotate(${opt.rot} ${mx} ${my})`);
}

function plan(cell) {
  const box = document.createElement('div');
  box.className = 'cell plan';
  box.appendChild(head(cell, '平面图'));
  document.getElementById('plan').appendChild(box);

  const svg = el(box, 'svg', { viewBox: '-40 -38 290 284', preserveAspectRatio: 'xMidYMid meet' });
  el(svg, 'rect', { x: 0, y: 0, width: BASE, height: BASE, fill: '#e3dfd3', stroke: '#555', 'stroke-width': 0.5 });

  // 中轴线
  el(svg, 'line', { x1: -6, y1: Y(CY), x2: BASE + 6, y2: Y(CY), stroke: '#999', 'stroke-width': 0.25, 'stroke-dasharray': '4 1.5 0.8 1.5' });

  // 高的画在上面、颜色更白
  const top = Math.max(...cell.parts.map((p) => p.z0 + p.h));
  [...cell.parts].sort((a, b) => a.z0 - b.z0).forEach((p) => {
    const k = (p.z0 + p.h) / top;
    const v = Math.round(236 + 19 * k);
    el(svg, 'path', {
      d: shapePath(p.shape), fill: `rgb(${v},${v},${v - 2})`, 'fill-rule': 'evenodd',
      stroke: '#333', 'stroke-width': 0.45, 'stroke-linejoin': 'round',
    });
  });

  const g = el(svg, 'g', {});
  const M = MOON, C = CIRCLE, B = BAND;
  // 底板
  dim(g, 0, -12, BASE, -12, '底板 210', { dy: -2 });
  dim(g, BASE + 14, 0, BASE + 14, BASE, '210', { dx: 5, rot: 90 });
  // 月牙高度
  dim(g, -14, CY - M.r1, -14, CY + M.r1, '月牙 高 150', { dx: -4, rot: -90 });
  el(g, 'line', { x1: -17, y1: Y(CY + M.r1), x2: M.x1, y2: Y(CY + M.r1), stroke: '#c0392b', 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });
  el(g, 'line', { x1: -17, y1: Y(CY - M.r1), x2: M.x1, y2: Y(CY - M.r1), stroke: '#c0392b', 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });
  // 总宽
  const xl = M.x1 - M.r1, xr = C.x + B.ro;
  dim(g, xl, BASE + 12, xr, BASE + 12, `总宽 ${xr - xl}`, { dy: -2 });
  dim(g, 0, BASE + 12, xl, BASE + 12, `${xl}`, { dy: -2 });
  dim(g, xr, BASE + 12, BASE, BASE + 12, `${BASE - xr}`, { dy: -2 });

  if (cell.n === 1) {
    dim(g, C.x - C.r, CY - 22, C.x + C.r, CY - 22, '主圆 Ø80', { dy: -2 });
    dim(g, xl, CY + 16, M.x2 - M.r2, CY + 16, '43', { dy: -2 });
    dim(g, C.x + B.ri, CY + 10, C.x + B.ro, CY + 10, '12', { dy: -2 });
    dim(g, M.x2 - M.r2, CY - 9, C.x - C.r, CY - 9, '32', { dy: 6 });
    // 入口缺口
    const tip = cell.parts[0].shape.userData;
    const a = (B.a * Math.PI) / 180, rm = (B.ri + B.ro) / 2;
    const bx = C.x + rm * Math.cos(a), by = rm * Math.sin(a);
    const gap = Math.hypot(bx - tip.tipX, by - tip.tipY).toFixed(0);
    dim(g, tip.tipX, CY + tip.tipY, bx, CY + by, `入口 ${gap}`, { dy: -5, dx: 6 });
    dim(g, tip.tipX, CY - tip.tipY, bx, CY - by, `入口 ${gap}`, { dy: 9, dx: 6 });
    el(g, 'text', { x: 36, y: Y(CY - 36), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle' }, '外 R75');
    el(g, 'text', { x: 80, y: Y(CY + 44), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle' }, '内 R62');
    el(g, 'text', { x: 187, y: Y(CY - 50), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle' }, 'R56–R68');
  }
  if (cell.n === 2) {
    dim(g, 13, CY + 16, 30, CY + 16, '17', { dy: -2 });
    dim(g, 30, CY + 16, 40, CY + 16, '10', { dy: -2 });
    dim(g, 40, CY + 16, 56, CY + 16, '16', { dy: -2 });
    dim(g, C.x, CY - 14, C.x + 22, CY - 14, 'R22', { dy: 6 });
    dim(g, C.x + 31, CY - 14, C.x + 40, CY - 14, '9', { dy: 6 });
    el(g, 'text', { x: 190, y: Y(CY - 58), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle' }, '3 段 各 38°');
    el(g, 'text', { x: 190, y: Y(CY - 65), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle' }, '间隔 5°');
  }
  if (cell.n === 3) {
    const lab = (x, y, s) => el(g, 'text', {
      x, y: Y(y), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle',
      stroke: '#f7f5f1', 'stroke-width': 1.2, 'paint-order': 'stroke',
    }, s);
    lab(20.5, CY - 2, '12'); lab(36, CY - 2, '8'); lab(50, CY - 2, '4');
    lab(C.x, CY - 2, '高12'); lab(C.x + 26.5, CY - 2, '8'); lab(C.x + 35.5, CY - 2, '4');
    lab(C.x + 59, CY + 12, '4'); lab(C.x + 65, CY - 12, '8');
    dim(g, 13, CY + 18, 28, CY + 18, '15', { dy: -2 });
    dim(g, 28, CY + 18, 44, CY + 18, '16', { dy: -2 });
    dim(g, 44, CY + 18, 56, CY + 18, '12', { dy: -2 });
    dim(g, C.x, CY + 14, C.x + 22, CY + 14, 'R22', { dy: -2 });
    dim(g, C.x, CY + 24, C.x + 31, CY + 24, 'R31', { dy: -2 });
    el(g, 'text', { x: 150, y: Y(22), 'font-size': 4.6, fill: '#c0392b', 'text-anchor': 'middle' }, '图形上的数字 = 该级顶面高度');
  }
}

for (const c of CELLS) axon(c);
for (const c of CELLS) plan(c);
window.__done = true;
