import * as THREE from 'three';
import { BASE, CY, DISC, MOON, EDGE, C0, CELLS } from './shapes.js';

const SEG = 96;
const RED = '#c0392b';
const NEW_FILL = [205, 222, 240];   // 新做的（月牙、弧带）偏蓝
const OLD_FILL = [252, 251, 248];   // 已做好的圆底座：白

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
const Y = (y) => BASE - y; // 图纸坐标 y 朝上 → SVG y 朝下

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
  label(g, (x0 + x1) / 2 + (opt.dx || 0), Y((y0 + y1) / 2) + (opt.dy || 0), text, opt);
}

// ---------- 平面图 ----------
function plan(cell) {
  const box = document.createElement('div');
  box.className = 'cell plan';
  box.appendChild(head(cell, '平面图 · 图上数字 = 顶面高度'));
  document.getElementById('plan').appendChild(box);

  const svg = el(box, 'svg', { viewBox: '-40 -36 290 280', preserveAspectRatio: 'xMidYMid meet' });
  el(svg, 'rect', { x: 0, y: 0, width: BASE, height: BASE, fill: '#e3dfd3', stroke: '#555', 'stroke-width': 0.5 });
  el(svg, 'line', { x1: -6, y1: Y(CY), x2: BASE + 6, y2: Y(CY), stroke: '#999', 'stroke-width': 0.25, 'stroke-dasharray': '4 1.5 0.8 1.5' });

  const top = 25;
  [...cell.parts].sort((a, b) => a.z0 - b.z0).forEach((p) => {
    const k = 1 - 0.55 * ((p.z0 + p.h) / top);          // 越高越深
    const c = p.fixed ? OLD_FILL.map((v) => Math.round(v - 30 * (1 - k)))
                      : NEW_FILL.map((v, i) => Math.round(v - [70, 55, 35][i] * (1 - k)));
    el(svg, 'path', {
      d: shapePath(p.shape), fill: `rgb(${c})`, 'fill-rule': 'evenodd',
      stroke: '#333', 'stroke-width': 0.45, 'stroke-linejoin': 'round',
    });
  });

  const g = el(svg, 'g', {});
  const D = DISC, M = MOON, E = EDGE;
  const xl = M.x - M.r, xr = D.x + D.r;

  dim(g, 0, -12, BASE, -12, '底板 210', { dy: -2 });
  dim(g, -14, CY - M.r, -14, CY + M.r, '月牙 高 150', { dx: -4, rot: -90 });
  for (const s of [1, -1]) {
    el(g, 'line', { x1: -17, y1: Y(CY + s * M.r), x2: M.x, y2: Y(CY + s * M.r), stroke: RED, 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });
  }
  dim(g, 0, BASE + 12, xl, BASE + 12, `${xl}`, { dy: -2 });
  dim(g, xl, BASE + 12, xr, BASE + 12, `月牙 + 圆 ${xr - xl}`, { dy: -2 });
  dim(g, xr, BASE + 12, BASE, BASE + 12, `${BASE - xr}`, { dy: -2 });

  // 月牙最宽处、空隙
  const inner = D.x - D.r - cell.gap;
  dim(g, xl, CY + 62, inner, CY + 62, `月牙最宽 ${inner - xl}`, { dy: -2 });
  for (const x of [xl, inner]) {
    el(g, 'line', { x1: x, y1: Y(CY), x2: x, y2: Y(CY + 64), stroke: RED, 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });
  }
  if (cell.gap) dim(g, inner, CY - 52, D.x - D.r, CY - 52, `空隙 ${cell.gap}`, { dy: 6 });
  if (cell.gap) for (const x of [inner, D.x - D.r]) {
    el(g, 'line', { x1: x, y1: Y(CY), x2: x, y2: Y(CY - 54), stroke: RED, 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });
  }

  // 外圈花边
  for (const r of [E.ri, E.ro]) {
    el(g, 'circle', { cx: C0, cy: Y(CY), r, fill: 'none', stroke: RED, 'stroke-width': 0.2, 'stroke-dasharray': '1.5 1.5' });
  }
  el(g, 'circle', { cx: C0, cy: Y(CY), r: 0.9, fill: RED });
  label(g, C0, Y(CY) + 7, '底板中心', { size: 3.8 });
  const q = Math.SQRT1_2;
  dim(g, C0 + E.ri * q, CY - E.ri * q, C0 + E.ro * q, CY - E.ro * q, '', {});
  label(g, BASE + 4, BASE + 1, `花边 R${E.ri}–R${E.ro}`, { size: 4.2 });
  label(g, BASE + 4, BASE + 7, '宽 10', { size: 4.2 });

  // 顶面高度
  const hgt = (x, y, s, o = {}) => label(g, x, Y(y) + 1.7, s, { fill: '#1d3f66', halo: 'none', bold: true, size: 5, ...o });
  if (cell.n === 1) {
    hgt(50, CY, '+5');
    hgt(D.x, CY + 8, '+10', { fill: '#555' }); hgt(D.x, CY - 38, '+5', { fill: '#555' });
  }
  if (cell.n === 2) {
    hgt(37.5, CY, '+5'); hgt(67.5, CY, '+10');
    hgt(D.x, CY + 8, '+5', { fill: '#555' }); hgt(D.x, CY - 32.5, '+10', { fill: '#555' }); hgt(D.x, CY - 41, '+15', { fill: '#555' });
  }
  if (cell.n === 3) {
    hgt(34, CY, '+5'); hgt(52, CY, '+10'); hgt(78, CY, '+15');
    hgt(D.x - 34, CY - 18, '+15', { fill: '#555' }); hgt(D.x - 12, CY - 20, '+20', { fill: '#555' }); hgt(156, CY + 8, '+25', { fill: '#555' });
  }
  label(g, D.x, Y(CY - 14), cell.n === 3 ? '' : '已做好 R45', { fill: '#555', size: 4.4, halo: 'none' });
}

// ---------- 剖面（沿中轴线切开） ----------
function inside(shape, x) {
  const hit = (pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a.y > CY) !== (b.y > CY) && x < ((b.x - a.x) * (CY - a.y)) / (b.y - a.y) + a.x) c = !c;
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
  const K = 2;                                     // 高度放大 2 倍，看得清
  const svg = el(box, 'svg', { viewBox: '-40 -72 290 92', preserveAspectRatio: 'xMidYMid meet' });
  label(svg, 0, -62, `沿中轴线切开（剖面，高度放大 ${K} 倍）`, { anchor: 'start', fill: '#444', size: 5 });
  el(svg, 'rect', { x: 0, y: 0, width: BASE, height: 3 * K, fill: '#d9d5c8', stroke: '#333', 'stroke-width': 0.4 });
  let top = 0;
  for (const p of cell.parts) {
    let start = null;
    for (let x = 0; x <= BASE + 0.25; x += 0.25) {
      const on = x <= BASE && inside(p.shape, x + 0.01);
      if (on && start === null) start = x;
      if (!on && start !== null) {
        el(svg, 'rect', {
          x: start, y: -(p.z0 + p.h) * K, width: x - start, height: p.h * K,
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
