// 第一阶段 · 地形（第 1–3 格）。单位 mm，底板 210 × 210，原点在左下角。
// 方向和你画在板上的一样：月牙在上，圆在下，弧带在圆的下面。
// fixed = 已经做好 / 已粘上的（圆底座、原来的小月牙、连接条），不动。
import * as THREE from 'three';
import pc from 'polygon-clipping';

export const BASE = 210;
export const CX = 105;                       // 竖向中轴线
export const C0 = { x: 105, y: 105, r: 100 }; // 外圈平面：底板中心，R100（离板边 5）
export const DISC = { x: 105, y: 70, r: 45 }; // 已做好的圆底座
export const MOON = { x: 105, y: 110, r: 75 };// 大月牙外圆 R75 → 长 150
export const CUT = 5;                          // 大月牙和外圈平面之间的缝
export const BAND = { ri: 54, ro: 62 };        // 你画的弧带（与圆同心）

// ---------- 多边形布尔运算 ----------
const N = 360;
export function circ(x, y, r) {
  const ring = [];
  for (let i = 0; i < N; i++) { const a = (i / N) * 2 * Math.PI; ring.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
  ring.push(ring[0]);
  return [[ring]];
}
function sector(x, y, ri, ro, a0, a1) {          // 角度：0° 朝右，逆时针
  const pts = [], n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * 2));
  for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; pts.push([x + ro * Math.cos(a), y + ro * Math.sin(a)]); }
  for (let i = n; i >= 0; i--) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; pts.push([x + ri * Math.cos(a), y + ri * Math.sin(a)]); }
  pts.push(pts[0]);
  return [[pts]];
}
const rect = (x0, y0, x1, y1) => [[[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]];
const sub = (a, ...b) => pc.difference(a, ...b);
const add = (...a) => pc.union(...a);

// MultiPolygon → THREE.Shape[]（每一片单独一块）
function toShapes(mp) {
  return mp.map((poly) => {
  const toPath = (P, ring) => { ring.slice(0, -1).forEach(([x, y], i) => (i ? P.lineTo(x, y) : P.moveTo(x, y))); P.closePath(); return P; };
  const s = toPath(new THREE.Shape(), poly[0]);
  for (const h of poly.slice(1)) s.holes.push(toPath(new THREE.Path(), h));
  s.userData = { pieces: mp.length };
  return s;
  });
}

const D = DISC, M = MOON;
const dc = (r, dy = 0) => circ(D.x, D.y + dy, r);

// 原来已粘好的小月牙（开口朝上）+ 连接条（照片估的位置）
const smallMoon = sub(circ(CX, 179.9, 25.9), circ(CX, 195.2, 35.2));
const strip = rect(CX - 5, 113, CX + 5, 157);
const keepOut = add(sub(circ(CX, 179.9, 27.4), circ(CX, 195.2, 33.7)), rect(CX - 6.5, 100, CX + 6.5, 158));

// 大月牙一层 = 外圆 (cy, r) 减 与圆同心的内圆 (D, ri)
const moonLayer = (cy, r, ri, avoid) => (avoid ? sub(circ(CX, cy, r), dc(ri), keepOut) : sub(circ(CX, cy, r), dc(ri)));

// 外圈平面：底板中心 R100，挖掉大月牙外圆 + 缝，挖掉圆和弧带内沿 → 一整片连续的环
export const plane = sub(circ(C0.x, C0.y, C0.r), circ(M.x, M.y, M.r + CUT), dc(BAND.ri));
const band = (a0, a1, ri = BAND.ri) => sector(D.x, D.y, ri, BAND.ro, -90 + a0, -90 + a1);

const P = (mp, z0, h, fixed = false) => toShapes(mp).map((shape) => ({ shape, z0, h, fixed }));

export const CELLS = [
  {
    n: 1, title: '平台', sub: '最简单 · 最高 10', gap: 20,
    note: '大月牙 1 片 +5（让开原小月牙和连接条）· 外圈平面 +5 · 弧带压在平面上 +10',
    parts: [
      P(dc(45), 0, 5, true), P(dc(30), 5, 5, true),
      P(smallMoon, 0, 5, true), P(strip, 0, 3, true),
      P(moonLayer(M.y, M.r, 65, true), 0, 5),
      P(plane, 0, 5),
      P(band(-60, 60), 5, 5),
    ].flat(),
  },
  {
    n: 2, title: '下沉广场', sub: '最高 15', gap: 10,
    note: '大月牙 2 层 +5 / +10 · 外圈平面 +5 · 弧带断成 3 段压在平面上 +10',
    parts: [
      P(dc(45), 0, 5, true),
      P(sub(dc(45), dc(28)), 5, 5, true), P(sub(dc(45), dc(37)), 10, 5, true),
      P(smallMoon, 0, 5, true), P(strip, 0, 3, true),
      P(moonLayer(M.y, M.r, 55, true), 0, 5),
      P(moonLayer(98, 62, 55, true), 5, 5),
      P(plane, 0, 5),
      P(band(-58, -22), 5, 5), P(band(-17, 17), 5, 5), P(band(22, 58), 5, 5),
    ].flat(),
  },
  {
    n: 3, title: '台阶', sub: '最复杂 · 最高 25', gap: 0,
    note: '大月牙 3 级 +5 / +10 / +15 贴住圆 · 外圈平面 +5 · 弧带 3 级 +10 / +15 / +20',
    parts: [
      P(dc(45), 0, 5, true), P(dc(45), 5, 5, true), P(dc(45), 10, 5, true),
      P(dc(35, -8), 15, 5, true), P(dc(25, -16), 20, 5, true),
      P(moonLayer(M.y, M.r, 45), 0, 5),
      P(moonLayer(102, 65, 45), 5, 5),
      P(moonLayer(94, 55, 45), 10, 5),
      P(plane, 0, 5),
      P(band(-60, 60), 5, 5), P(band(-40, 40), 10, 5), P(band(-18, 18), 15, 5),
    ].flat(),
  },
];
