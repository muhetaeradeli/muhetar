// 第 1–3 格 · 基础图形（放大版）。单位 mm，底板 210 × 210，原点在左下角。
// 所有图形都由圆和圆弧组成；平面图和轴测图共用这一份数据。
import * as THREE from 'three';

export const BASE = 210;
export const CY = 105;          // 所有图形共用的水平中轴线
export const CIRCLE = { x: 128, r: 40 };              // 主圆 Ø80
export const MOON = { x1: 88, r1: 75, x2: 118, r2: 62 }; // 月牙：外圆 R75（高 150）减去内圆 R62
export const BAND = { ri: 56, ro: 68, a: 62 };        // 围合弧带：与主圆同心，左右各 62°
export const STRIP = { x0: 52, x1: 92, w: 10 };       // 连接条

const rad = (d) => (d * Math.PI) / 180;

export function disc(x, r) {
  const s = new THREE.Shape();
  s.absarc(x, CY, r, 0, Math.PI * 2, false);
  return s;
}

export function ring(x, ro, ri) {
  const s = disc(x, ro);
  const h = new THREE.Path();
  h.absarc(x, CY, ri, 0, Math.PI * 2, true);
  s.holes.push(h);
  return s;
}

// 月牙 = 圆 (x1, r1) 减去 圆 (x2, r2)，x2 > x1，开口朝右
export function crescent(x1, r1, x2, r2) {
  const d = x2 - x1;
  const px = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const py = Math.sqrt(r1 * r1 - px * px);
  const a1 = Math.atan2(py, px);
  const a2 = Math.atan2(py, px - d);
  const s = new THREE.Shape();
  s.absarc(x1, CY, r1, a1, Math.PI * 2 - a1, false);
  s.absarc(x2, CY, r2, Math.PI * 2 - a2, a2, true);
  s.closePath();
  s.userData = { tipX: x1 + px, tipY: py };
  return s;
}

// 弧带：圆心 (x, CY)，角度 a0→a1（度，0° 朝右）
export function band(x, ri, ro, a0, a1) {
  const s = new THREE.Shape();
  s.absarc(x, CY, ro, rad(a0), rad(a1), false);
  s.absarc(x, CY, ri, rad(a1), rad(a0), true);
  s.closePath();
  return s;
}

export function rect(x0, x1, w) {
  const s = new THREE.Shape();
  s.moveTo(x0, CY - w / 2);
  s.lineTo(x1, CY - w / 2);
  s.lineTo(x1, CY + w / 2);
  s.lineTo(x0, CY + w / 2);
  s.closePath();
  return s;
}

const C = CIRCLE, M = MOON, B = BAND, S = STRIP;

// 每一格 = 若干块 { shape, z0 起始高度, h 厚度 }
export const CELLS = [
  {
    n: 1,
    title: '基础图形',
    sub: '月牙 + 圆 + 围合弧带',
    note: '月牙 高150 宽43 · 主圆 Ø80 · 围合弧带 宽12 · 连接条 40×10 · 全部厚 6',
    parts: [
      { shape: crescent(M.x1, M.r1, M.x2, M.r2), z0: 0, h: 6 },
      { shape: disc(C.x, C.r), z0: 0, h: 6 },
      { shape: band(C.x, B.ri, B.ro, -B.a, B.a), z0: 0, h: 6 },
      { shape: rect(S.x0, S.x1, S.w), z0: 0, h: 3 },
    ],
  },
  {
    n: 2,
    title: '重复',
    sub: '同一图形拆成几层重复',
    note: '月牙拆成 2 条（宽17 / 16）· 圆 = 环 R40/R31 + 圆心 R22 · 弧带断成 3 段',
    parts: [
      { shape: crescent(M.x1, M.r1, 100, 70), z0: 0, h: 6 },
      { shape: crescent(104, 64, M.x2, M.r2), z0: 0, h: 6 },
      { shape: ring(C.x, C.r, 31), z0: 0, h: 6 },
      { shape: disc(C.x, 22), z0: 0, h: 6 },
      { shape: band(C.x, B.ri, B.ro, -62, -24), z0: 0, h: 6 },
      { shape: band(C.x, B.ri, B.ro, -19, 19), z0: 0, h: 6 },
      { shape: band(C.x, B.ri, B.ro, 24, 62), z0: 0, h: 6 },
      { shape: rect(S.x0, S.x1, S.w), z0: 0, h: 3 },
    ],
  },
  {
    n: 3,
    title: '台阶',
    sub: '同一图形一层层叠高',
    note: '每级高 4 · 圆 3 级 R40/31/22 · 月牙 3 级（向外升高）· 弧带 2 级',
    parts: [
      { shape: crescent(M.x1, M.r1, M.x2, M.r2), z0: 0, h: 4 },
      { shape: crescent(M.x1, M.r1, 112, 68), z0: 4, h: 4 },
      { shape: crescent(M.x1, M.r1, 104, 76), z0: 8, h: 4 },
      { shape: disc(C.x, C.r), z0: 0, h: 4 },
      { shape: disc(C.x, 31), z0: 4, h: 4 },
      { shape: disc(C.x, 22), z0: 8, h: 4 },
      { shape: band(C.x, B.ri, B.ro, -B.a, B.a), z0: 0, h: 4 },
      { shape: band(C.x, 62, B.ro, -B.a, B.a), z0: 4, h: 4 },
      { shape: rect(S.x0, S.x1, S.w), z0: 0, h: 3 },
    ],
  },
];
