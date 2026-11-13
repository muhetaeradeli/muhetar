// 第一阶段 · 地形（第 1–3 格）。单位 mm，底板 210 × 210，原点在左下角。
// 圆的底座 (fixed) 已经做好，不动；月牙和围合弧带 (new) 是重新设计的。
// 平面图、剖面、轴测图共用这一份数据。
import * as THREE from 'three';

export const BASE = 210;
export const CY = 105;                    // 所有图形共用的水平中轴线
export const DISC = { x: 140, r: 45 };    // 已做好的主圆：圆心离左边 140，R45
export const MOON = { x: 100, r: 75 };    // 月牙外圆：圆心离左边 100，R75 → 高 150
export const BAND = { ri: 54, ro: 62 };   // 围合弧带：与主圆同心，宽 8

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

const D = DISC, M = MOON, B = BAND;
const moon = (gap) => crescent(M.x, M.r, D.x, D.r + gap); // 内弧与主圆同心，空隙处处相等
const arc = (a0, a1) => band(D.x, B.ri, B.ro, a0, a1);

// 每一格 = 若干块 { shape, z0 起始高度, h 厚度, fixed 已做好 }
export const CELLS = [
  {
    n: 1, title: '平台', sub: '最简单 · 空隙 20 · 最高 10',
    gap: 20, bandA: 64,
    note: '月牙 1 片 +5 · 弧带 1 片 +5 · 月牙内弧与圆同心，空隙处处 20',
    parts: [
      { shape: disc(D.x, 45), z0: 0, h: 5, fixed: true },
      { shape: disc(D.x, 30), z0: 5, h: 5, fixed: true },
      { shape: moon(20), z0: 0, h: 5 },
      { shape: arc(-64, 64), z0: 0, h: 5 },
    ],
  },
  {
    n: 2, title: '下沉广场', sub: '空隙 10 · 最高 15',
    gap: 10, bandA: 58,
    note: '月牙 2 层 +5 / +10（里高外低，呼应圆环）· 弧带断成 3 段 +5',
    parts: [
      { shape: disc(D.x, 45), z0: 0, h: 5, fixed: true },
      { shape: ring(D.x, 45, 28), z0: 5, h: 5, fixed: true },
      { shape: ring(D.x, 45, 37), z0: 10, h: 5, fixed: true },
      { shape: moon(10), z0: 0, h: 5 },
      { shape: crescent(112, 62, D.x, 55), z0: 5, h: 5 },
      { shape: arc(-58, -22), z0: 0, h: 5 },
      { shape: arc(-17, 17), z0: 0, h: 5 },
      { shape: arc(22, 58), z0: 0, h: 5 },
    ],
  },
  {
    n: 3, title: '台阶', sub: '最复杂 · 空隙 0 · 最高 25',
    gap: 0, bandA: 62,
    note: '月牙 3 级 +5 / +10 / +15，贴住圆往上走 · 弧带 3 级，沿弧线升高',
    parts: [
      { shape: disc(D.x, 45), z0: 0, h: 5, fixed: true },
      { shape: disc(D.x, 45), z0: 5, h: 5, fixed: true },
      { shape: disc(D.x, 45), z0: 10, h: 5, fixed: true },
      { shape: disc(148, 35), z0: 15, h: 5, fixed: true },
      { shape: disc(156, 25), z0: 20, h: 5, fixed: true },
      { shape: moon(0), z0: 0, h: 5 },
      { shape: crescent(108, 65, D.x, 45), z0: 5, h: 5 },
      { shape: crescent(116, 55, D.x, 45), z0: 10, h: 5 },
      { shape: arc(-62, 62), z0: 0, h: 5 },
      { shape: arc(-40, 40), z0: 5, h: 5 },
      { shape: arc(-18, 18), z0: 10, h: 5 },
    ],
  },
];
