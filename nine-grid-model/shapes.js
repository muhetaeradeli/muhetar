// 第一阶段 · 地形（第 1–3 格）。单位 mm，底板 210 × 210，原点在左下角。
// 圆的底座 (fixed) 已经做好，不动；月牙和外圈花边 (new) 是重新设计的。
// 平面图、剖面、轴测图共用这一份数据。
import * as THREE from 'three';

export const BASE = 210;
export const CY = 105;                    // 所有图形共用的水平中轴线
export const DISC = { x: 140, r: 45 };    // 已做好的主圆：圆心离左边 140，R45
export const MOON = { x: 100, r: 75 };    // 月牙外圆：圆心离左边 100，R75 → 高 150
export const C0 = 105;                    // 花边环的圆心 = 底板正中心
export const EDGE = { ri: 86, ro: 96, rm: 91 }; // 外圈花边：R86–R96，宽 10；月牙和圆全部落在 R80 以内

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

const D = DISC, M = MOON, E = EDGE;
const moon = (gap) => crescent(M.x, M.r, D.x, D.r + gap); // 内弧与主圆同心，空隙处处相等
const arc = (a0, a1) => band(C0, E.ri, E.ro, a0, a1);
const dot = (a, r) => {
  const s = new THREE.Shape();
  s.absarc(C0 + E.rm * Math.cos(rad(a)), CY + E.rm * Math.sin(rad(a)), r, 0, Math.PI * 2, false);
  return s;
};
// 花边：n 组「弧段 + 圆点」绕一圈。圆点在 0° 起每 360/n 一个，弧段夹在两个圆点之间。
// levels = 每段弧叠几级（每级 5，沿逆时针方向一级比一级短）
function border(n, span, dotR, dotH, levels = 1) {
  const step = 360 / n, parts = [];
  for (let i = 0; i < n; i++) {
    const a0 = i * step + (step - span) / 2;
    for (let k = 0; k < levels; k++) {
      parts.push({ shape: arc(a0 + (span * k) / levels, a0 + span), z0: 5 * k, h: 5 });
    }
    for (let z = 0; z < dotH; z += 5) parts.push({ shape: dot(i * step, dotR), z0: z, h: 5 });
  }
  return parts;
}

// 每一格 = 若干块 { shape, z0 起始高度, h 厚度, fixed 已做好 }
export const CELLS = [
  {
    n: 1, title: '平台', sub: '最简单 · 空隙 20 · 最高 10',
    gap: 20, edge: '8 段弧（各 33°）+ 8 个圆点 Ø8，全部 +5',
    note: '月牙 1 片 +5 · 外圈花边：8 段弧 + 8 个圆点，全部 +5',
    parts: [
      { shape: disc(D.x, 45), z0: 0, h: 5, fixed: true },
      { shape: disc(D.x, 30), z0: 5, h: 5, fixed: true },
      { shape: moon(20), z0: 0, h: 5 },
      ...border(8, 33, 4, 5),
    ],
  },
  {
    n: 2, title: '下沉广场', sub: '空隙 10 · 最高 15',
    gap: 10, edge: '12 段弧（各 20°）+5，12 个圆点 Ø7 +10',
    note: '月牙 2 层 +5 / +10 · 外圈花边加密：12 段弧 +5，12 个圆点 +10',
    parts: [
      { shape: disc(D.x, 45), z0: 0, h: 5, fixed: true },
      { shape: ring(D.x, 45, 28), z0: 5, h: 5, fixed: true },
      { shape: ring(D.x, 45, 37), z0: 10, h: 5, fixed: true },
      { shape: moon(10), z0: 0, h: 5 },
      { shape: crescent(112, 62, D.x, 55), z0: 5, h: 5 },
      ...border(12, 20, 3.5, 10),
    ],
  },
  {
    n: 3, title: '台阶', sub: '最复杂 · 空隙 0 · 最高 25',
    gap: 0, edge: '8 段弧，每段 3 级 +5/+10/+15（33° / 22° / 11°），8 个圆点 Ø8 +5',
    note: '月牙 3 级 +5 / +10 / +15 · 外圈花边：8 段小台阶，同一方向旋转着升高',
    parts: [
      { shape: disc(D.x, 45), z0: 0, h: 5, fixed: true },
      { shape: disc(D.x, 45), z0: 5, h: 5, fixed: true },
      { shape: disc(D.x, 45), z0: 10, h: 5, fixed: true },
      { shape: disc(148, 35), z0: 15, h: 5, fixed: true },
      { shape: disc(156, 25), z0: 20, h: 5, fixed: true },
      { shape: moon(0), z0: 0, h: 5 },
      { shape: crescent(108, 65, D.x, 45), z0: 5, h: 5 },
      { shape: crescent(116, 55, D.x, 45), z0: 10, h: 5 },
      ...border(8, 33, 4, 5, 3),
    ],
  },
];
