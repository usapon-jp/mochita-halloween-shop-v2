// 冬・クリスマスの飾り付け（店内 / 庭）。THEME=winter（既定）のときだけ shop.js から呼ばれる。
// 動画シリーズ「もちたの冬」と同じ世界：ラベンダー色のお星さま、庭のクリスマスローズ、雪。
import * as THREE from 'three';
import { C, M, rbox, box, cyl, sph, hemi, cone, tor, add, grp } from './kit.js';
import * as P from './props.js';
import { anim, blob } from './props.js';

export const STAR_COLOR = 0xc9b2f0; // お星さま（動画と同じラベンダー）

// ---------- 部品 ----------
let starGeo;
function starShape(r = 1, inner = .5) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * inner : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  s.closePath(); return s;
}
function starMesh(size, color = STAR_COLOR, em = .55) {
  starGeo ??= (() => { const g = new THREE.ExtrudeGeometry(starShape(1, .52), { depth: .32, bevelEnabled: true, bevelThickness: .14, bevelSize: .12, bevelSegments: 4 }); g.center(); return g; })();
  const m = new THREE.Mesh(starGeo, M(color, { r: .45, em })); m.scale.setScalar(size); m.castShadow = true; return m;
}
// 角を丸めたお星さま（光の輪つき）
export function star(p, x, y, z, s = 1, o = {}) {
  const g = grp(p, x, y, z, o.ry ?? 0);
  g.add(starMesh(.16 * s, o.color ?? STAR_COLOR, o.em ?? .55));
  if (o.glow !== false) { P.spark(g, 0, 0, .02, o.color ?? STAR_COLOR, 3.2 * s); }
  if (o.bob) { g.userData.bob = { amp: o.bob, spd: .9, ph: x + z, y0: y }; anim.bob.push(g); }
  return g;
}
// 飾り付きのクリスマスツリー（てっぺんにラベンダーのお星さま）
export function xmasTree(p, x, y, z, s = 1, o = {}) {
  const g = grp(p, x, y, z, o.ry ?? 0);
  add(g, cyl(.26 * s, .21 * s, .3 * s, 24), M(o.pot ?? 0xd8c3b4), 0, .15 * s, 0);
  add(g, cyl(.27 * s, .27 * s, .04 * s, 24), M(C.lav2), 0, .28 * s, 0);
  add(g, cyl(.055 * s, .07 * s, .47 * s, 12), M(C.woodD), 0, .4 * s, 0);
  const greens = [0x5f8a74, 0x6b977f, 0x79a38b, 0x88af97];
  for (let j = 0; j < 4; j++) {
    const r = (.72 - j * .15) * s, h = (.82 - j * .07) * s, yy = (.78 + j * .37) * s;
    add(g, cone(r, h, 40), M(greens[j], { r: .85 }), 0, yy, 0);
    if (o.snow) add(g, cone(r * .55, h * .32, 32), M(C.snow, { r: .95 }), 0, yy + h * .36, 0);
  }
  // オーナメント（パステル）と電球
  const oc = [0xe5c7cb, 0xe5d3a6, 0xc8bed9, 0xbcd5ea, 0xf3dce4];
  for (let i = 0; i < 16; i++) {
    const t = i / 16, a = i * 2.39, yy = (.5 + t * 1.45) * s, rr = (.66 - t * .5) * s;
    add(g, sph(.06 * s * (1 - t * .3), 16, 10), M(oc[i % 5], { r: .35, m: .1 }), Math.sin(a) * rr, yy, Math.cos(a) * rr);
  }
  const lights = [0xfff1c4, 0xe7dbff, 0xffe0ea];
  for (let i = 0; i < 26; i++) {
    const t = i / 26, a = t * Math.PI * 7, yy = (.45 + t * 1.55) * s, rr = (.7 - t * .55) * s;
    add(g, sph(.025 * s, 8, 6), M(lights[i % 3], { r: .3, em: 1 }), Math.sin(a) * rr, yy, Math.cos(a) * rr, { cast: false });
    if (i % 5 === 2) P.spark(g, Math.sin(a) * rr, yy, Math.cos(a) * rr, lights[i % 3], .9 * s);
  }
  if (o.star !== false) star(g, 0, 2.42 * s, 0, 1.05 * s);
  blob(p, x, y, z, .9 * s, .2);
  return g;
}
export function snowman(p, x, y, z, s = 1, ry = 0, o = {}) {
  const g = grp(p, x, y, z, ry), w = M(C.snow, { r: .95 });
  add(g, sph(.32 * s, 22, 16), w, 0, .28 * s, 0).scale.set(1, .9, 1);
  add(g, sph(.23 * s, 22, 16), w, 0, .68 * s, 0);
  const e = M(C.ink, { r: .5 });
  for (const sx of [-1, 1]) add(g, sph(.022 * s, 8, 6), e, sx * .075 * s, .72 * s, .205 * s);
  add(g, cone(.035 * s, .14 * s, 10), M(0xf2a46b), 0, .67 * s, .27 * s, { rx: Math.PI / 2 });
  for (const sx of [-1, 1]) add(g, sph(.03 * s, 8, 6), M(C.pink, { op: .7 }), sx * .13 * s, .64 * s, .19 * s).scale.set(1, .6, .4);
  // マフラーとバケツ帽
  add(g, tor(.19 * s, .045 * s, 8, 24), M(o.scarf ?? C.lav2, { r: .9 }), 0, .53 * s, 0, { rx: Math.PI / 2 });
  add(g, rbox(.08 * s, .2 * s, .03 * s, .01), M(o.scarf ?? C.lav2, { r: .9 }), .12 * s, .42 * s, .17 * s, { rz: .2 });
  add(g, cyl(.12 * s, .15 * s, .15 * s, 18), M(o.hat ?? C.mint2, { r: .6 }), 0, .93 * s, 0, { rz: -.12 });
  // 木の枝の腕
  for (const sx of [-1, 1]) add(g, cyl(.012 * s, .016 * s, .38 * s, 6), M(C.woodD), sx * .36 * s, .45 * s, 0, { rz: sx * 1.0 });
  blob(p, x, y, z, .5 * s, .2);
  return g;
}
export function snowMound(p, x, z, s = 1, sy = .32) {
  const m = add(p, hemi(.5 * s, 18, 8), M(C.snow, { r: .97 }), x, 0, z, { cast: false }); m.scale.set(1.3, sy, 1); return m;
}
export function wreath(p, x, y, z, s = 1, ry = 0) {
  const g = grp(p, x, y, z, ry);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; add(g, sph(.07 * s, 10, 8), M([C.leaf2, C.leaf, C.leaf3][i % 3], { r: .85 }), Math.cos(a) * .22 * s, Math.sin(a) * .22 * s, 0); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + .3; add(g, sph(.03 * s, 8, 6), M([0xe5c7cb, C.lav, C.butter][i % 3], { r: .4 }), Math.cos(a) * .24 * s, Math.sin(a) * .24 * s, .06 * s); }
  P.ribbonBow(g, 0, -.22 * s, .07 * s, C.lav2, 1.3 * s);
  return g;
}
// ケーキ（いちごのショートケーキ）
export function cake(p, x, y, z, s = 1) {
  const g = grp(p, x, y, z);
  add(g, cyl(.2 * s, .2 * s, .02 * s, 28), M(C.milk, { r: .4 }), 0, .01 * s, 0);
  add(g, cyl(.15 * s, .15 * s, .16 * s, 28), M(0xfffaf3, { r: .7 }), 0, .1 * s, 0);
  add(g, cyl(.152 * s, .152 * s, .025 * s, 28), M(0xf4c7d2, { r: .7 }), 0, .1 * s, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(g, sph(.022 * s, 10, 8), M(0xfffaf3), Math.cos(a) * .12 * s, .19 * s, Math.sin(a) * .12 * s); add(g, sph(.022 * s, 10, 8), M(C.red, { r: .45 }), Math.cos(a + .4) * .12 * s, .2 * s, Math.sin(a + .4) * .12 * s).scale.set(1, 1.2, 1); }
  star(g, 0, .27 * s, 0, .35 * s, { glow: false, em: .2 });
  return g;
}
export function candyCane(p, x, y, z, s = 1, ry = 0) {
  const g = grp(p, x, y, z, ry);
  add(g, cyl(.018 * s, .018 * s, .3 * s, 10), M(C.milk, { r: .4 }), 0, .15 * s, 0);
  for (let i = 0; i < 5; i++) add(g, cyl(.0185 * s, .0185 * s, .025 * s, 10), M(C.red, { r: .4 }), 0, (.03 + i * .06) * s, 0, { rz: .3 });
  add(g, tor(.05 * s, .018 * s, 8, 16, Math.PI), M(C.milk, { r: .4 }), .05 * s, .3 * s, 0);
  return g;
}
export function cookieJar(p, x, y, z, s = 1) {
  const g = grp(p, x, y, z);
  add(g, cyl(.11 * s, .12 * s, .2 * s, 22), M(0xeaf2fb, { r: .1, op: .55 }), 0, .1 * s, 0);
  add(g, cyl(.09 * s, .09 * s, .04 * s, 22), M(C.lav2), 0, .22 * s, 0);
  add(g, sph(.03 * s, 10, 8), M(C.lav2), 0, .25 * s, 0);
  for (let i = 0; i < 5; i++) { const sm = starMesh(.045 * s, [0xe8c08f, 0xf6e1c4][i % 2], 0); sm.position.set((i % 3 - 1) * .05 * s, (.05 + Math.floor(i / 2) * .045) * s, (i % 2 - .5) * .05 * s); sm.rotation.set(i, i * 2, 0); g.add(sm); }
  return g;
}
export function snowGlobe(p, x, y, z, s = 1) {
  const g = grp(p, x, y, z);
  add(g, cyl(.09 * s, .11 * s, .06 * s, 20), M(C.woodL), 0, .03 * s, 0);
  add(g, sph(.11 * s, 22, 16), M(0xeef5ff, { r: .05, op: .35 }), 0, .15 * s, 0, { cast: false });
  add(g, cone(.04 * s, .1 * s, 12), M(C.leaf2), 0, .12 * s, 0);
  add(g, sph(.012 * s, 8, 6), M(STAR_COLOR, { em: .6 }), 0, .18 * s, 0);
  return g;
}
// クリスマスローズの鉢（動画 第2話の花と同じ作り）
export function christmasRose(parent, x, y, z, s = 1, seed = 0) {
  const g = grp(parent, x, y, z); g.scale.setScalar(s);
  for (let j = 0; j < 5; j++) { const a = j * Math.PI * 2 / 5; const leaf = add(g, sph(.12, 12, 8), M(0x496b53), Math.cos(a) * .14, .10, Math.sin(a) * .14); leaf.scale.set(.5, .22, 1.7); leaf.rotation.y = -a + Math.PI / 2; leaf.rotation.z = .2; }
  for (let j = 0; j < 3; j++) {
    const a = j * 2.4 + seed, h = .30 + j * .06, fx = Math.cos(a) * .13, fz = Math.sin(a) * .13;
    add(g, cyl(.009, .012, h, 7), M(0x617651), fx, h / 2, fz);
    const f = grp(g, fx, h, fz); f.rotation.set(.60, a, .1);
    for (let k = 0; k < 5; k++) { const b = k * 2 * Math.PI / 5; const pet = add(f, sph(.073, 14, 10), M((seed + j) % 3 === 0 ? 0xd6b9c4 : 0xf4f0df), Math.cos(b) * .068, 0, Math.sin(b) * .068); pet.scale.set(1, .26, 1.22); pet.rotation.y = -b; }
    add(f, sph(.032, 10, 8), M(0xc9b667), 0, .018, 0).scale.y = .55;
  }
  return g;
}
function pottedRose(p, x, y, z, s = 1, seed = 0) {
  const g = grp(p, x, y, z);
  add(g, cyl(.14 * s, .1 * s, .2 * s, 20), M(0xc39a7e), 0, .1 * s, 0);
  add(g, cyl(.125 * s, .125 * s, .01, 20), M(0x654d3d), 0, .2 * s, 0);
  christmasRose(g, 0, .2 * s, 0, .8 * s, seed);
  return g;
}
// 電球の飾り（ゆるく垂れる線＋光る粒）
export function lightString(p, pts, n, cols = [0xfff1c4, 0xe7dbff, 0xffe0ea, 0xd7ecff]) {
  const curve = new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q)));
  add(p, new THREE.TubeGeometry(curve, 24, .008, 5), M(0x4f6b5a, { r: 1 }), 0, 0, 0, { cast: false });
  for (let i = 1; i < n; i++) { const q = curve.getPoint(i / n); add(p, sph(.034, 8, 6), M(cols[i % cols.length], { r: .4, em: .95 }), q.x, q.y - .04, q.z, { cast: false }); if (i % 4 === 1) P.spark(p, q.x, q.y - .04, q.z, cols[i % cols.length], 1.1); }
}
// 緑のガーランド（もみの葉の連なり＋小さな玉）
function garland(p, a, b, n, sag = .35) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - sag, (a[2] + b[2]) / 2];
  const curve = new THREE.CatmullRomCurve3([a, mid, b].map(q => new THREE.Vector3(...q)));
  for (let i = 0; i <= n; i++) { const q = curve.getPoint(i / n); add(p, sph(.075, 10, 8), M([C.leaf2, C.leaf, C.leaf3][i % 3], { r: .85 }), q.x, q.y, q.z, { cast: false }); if (i % 3 === 1) add(p, sph(.035, 8, 6), M([C.lav, 0xe5c7cb, C.butter][i % 3], { r: .4 }), q.x, q.y - .07, q.z + .04, { cast: false }); }
}
function hangingStar(p, x, y, z, len, s = 1) {
  add(p, cyl(.004, .004, len, 4), M(0xe8e2f2), x, y - len / 2, z, { cast: false });
  const st = star(p, x, y - len - .1 * s, z, .7 * s, { glow: false, em: .35 });
  st.userData.sway = { amp: .08, spd: .7, ph: x }; anim.sway.push(st);
}
function snowflake(p, x, y, z, s = 1) {
  const g = grp(p, x, y, z), w = M(0xf4f8ff, { r: .5, em: .25 });
  for (let i = 0; i < 3; i++) { add(g, box(.24 * s, .025 * s, .01), w, 0, 0, 0, { rz: i * Math.PI / 3, cast: false }); }
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; add(g, box(.06 * s, .02 * s, .01), w, Math.cos(a) * .08 * s, Math.sin(a) * .08 * s, 0, { rz: a + Math.PI / 4, cast: false }); }
  return g;
}

// ---------- 店内 ----------
export function winterInterior(world, cp, front, props) {
  // カウンター上（もちた置き場 |x|<0.95 は空ける）
  cake(cp, -1.3, 0, -.05, 1.1);
  cookieJar(cp, 1.2, 0, -.1, 1.0);
  candyCane(cp, 1.55, 0, .15, 1, .4); candyCane(cp, 1.62, 0, .2, .9, -.3);
  snowGlobe(cp, 2.3, 0, .05, 1.1);
  pottedRose(cp, 2.85, 0, -.3, .9, 1);
  P.giftBox(cp, -2.1, 0, .1, .26, .2, .24, C.lav, C.milk, .3); P.giftBox(cp, -2.4, 0, -.1, .2, .16, .2, C.pink, C.lav2, -.2);
  // 棚の上の飾り（中央の細い棚）
  const ledge = grp(props, 0, 0, -2.78);
  xmasTree(ledge, -.95, 2.75, 0, .22, { star: true });
  snowman(ledge, 0.1, 2.75, 0, .4); star(ledge, .95, 2.95, 0, .7, { em: .45 });
  // 背面の壁：ガーランドと吊るしのお星さま・雪の結晶
  garland(props, [-3.9, 3.85, -2.85], [-1.4, 3.85, -2.85], 16, .3);
  garland(props, [1.4, 3.85, -2.85], [3.9, 3.85, -2.85], 16, .3);
  [[-2.6, 3.6, -2.3, .45, 1.0], [2.7, 3.55, -2.3, .5, .9], [-1.1, 3.6, -2.0, .55, .8], [1.3, 3.6, -2.0, .4, .9]].forEach(([x, y, z, l, s]) => hangingStar(props, x, y, z, l, s));
  [[-2.3, 3.0, -2.93, 1], [2.1, 3.05, -2.93, .9], [-3.3, 2.7, -2.93, .8], [3.4, 2.6, -2.93, .85]].forEach(([x, y, z, s]) => snowflake(props, x, y, z, s));
  // 床：店の右奥に大きなツリー、まわりにプレゼント
  const fl = grp(world, 0, .1, 0);
  xmasTree(fl, 3.2, 0, -1.5, .95);
  P.giftBox(fl, 2.75, 0, -1.0, .34, .26, .3, C.lav, C.milk, .4); P.giftBox(fl, 3.7, 0, -.85, .28, .22, .28, C.pink, C.lav2, -.3); P.giftBox(fl, 3.15, 0, -.75, .22, .18, .22, C.mint2, C.pink, .9);
  pottedRose(fl, -3.3, 0, 1.0, 1.1, 0); pottedRose(fl, -3.0, 0, 1.4, .9, 2);
  snowman(fl, -3.3, 0, -1.3, .75, .5, { scarf: C.pink, hat: C.lav2 }); // ぬいぐるみの雪だるま
  pottedRose(fl, 2.4, 0, 2.85, 1.0, 1);
  P.giftBox(fl, 2.9, 0, 2.75, .3, .22, .26, C.lav, C.pink, -.4);
  // 窓辺
  const sill = grp(world, -3.85, 1.18, 0);
  xmasTree(sill, .03, 0, -.55, .16);
  star(sill, .05, .12, -.8, .5, { em: .5 });
}

// ---------- 庭 ----------
export function winterGarden(gd, front) {
  // 入口まわり：雪だるまとリース
  snowman(gd, -.5, 0, 4.4, 1.1, .3);
  snowman(gd, 2.7, 0, 4.3, .85, -.4, { scarf: C.pink, hat: C.lav });
  wreath(gd, -2.98, 1.15, 7.1 + .06, 1.0); wreath(gd, 3.5, 1.15, 7.1 + .06, 1.0);
  // 外の大きなツリー（電球つき）
  xmasTree(gd, 12.3, 0, 1.6, 1.55, { snow: true });
  // そり
  const sl = grp(gd, 10.9, 0, -3.4, .6);
  add(sl, rbox(.5, .05, 1.0, .02), M(C.woodL), 0, .22, 0);
  for (const sx of [-1, 1]) { add(sl, box(.03, .2, .03), M(C.woodD), sx * .2, .11, .3); add(sl, box(.03, .2, .03), M(C.woodD), sx * .2, .11, -.3); add(sl, rbox(.04, .03, 1.15, .015), M(C.lav2), sx * .22, .015, .05); }
  P.giftBox(sl, 0, .245, .1, .3, .22, .3, C.pink, C.milk, .2);
  // 雪の山
  [[-6.2, 1.6, 1.4], [-5.5, 2.6, 1.0], [5.6, 6.8, 1.1], [12.6, 3.8, 1.3], [9.2, -5.0, 1.2], [-4.2, -4.4, 1.0], [0.6, -5.6, 1.4], [13.0, -3.6, 1.0], [7.2, 7.6, .9], [-2.8, 7.6, 1.0], [4.4, 4.9, .8]].forEach(([x, z, s]) => snowMound(gd, x, z, s));
  // 小さな雪だるまたち
  snowman(gd, -6.0, 0, 2.3, .6, .8, { scarf: C.mint2, hat: C.pink }); snowman(gd, 8.0, 0, 6.4, .7, -.6);
  // 街灯にリボン、柵にクリスマスローズの鉢
  [[-4.5, 7.4], [1.0, 7.4], [4.5, 7.4], [7.0, 8.5]].forEach(([x, z], i) => pottedRose(gd, x, 0, z, 1.0, i));
  // ベンチの横にランタン
  const lt = grp(gd, 4.3, 0, 4.6);
  add(lt, rbox(.18, .26, .18, .02), M(C.woodD), 0, .13, 0); add(lt, box(.14, .2, .14), M(0xfff1c4, { em: .9, op: .9 }), 0, .14, 0, { cast: false }); add(lt, cone(.14, .1, 4), M(C.woodD), 0, .31, 0, { ry: Math.PI / 4 });
  P.spark(lt, 0, .15, 0, 0xfff1c4, 2.4);
  // 雪がふる
  snowfall(gd, 170);
}

// ---------- 雪 ----------
const inShop = (x, z) => x > -4.7 && x < 4.7 && z > -3.5 && z < 3.6; // 店の中には降らせない
export function snowfall(parent, n = 160, bx = { x: [-9, 14], z: [-7, 9], h: 8, skip: inShop }) {
  const geo = new THREE.SphereGeometry(1, 6, 4), mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, depthWrite: false });
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, mat); m.scale.setScalar(.025 + Math.random() * .03);
    let x, z; do { x = bx.x[0] + Math.random() * (bx.x[1] - bx.x[0]); z = bx.z[0] + Math.random() * (bx.z[1] - bx.z[0]); } while (bx.skip?.(x, z));
    m.userData.leaf = { x, z, y: Math.random() * bx.h, sp: .35 + Math.random() * .35, ph: Math.random() * 6, rs: 0, h: bx.h, bx };
    m.position.set(m.userData.leaf.x, m.userData.leaf.y, m.userData.leaf.z); m.userData.keep = true; parent.add(m); anim.leaves.push(m);
  }
}
