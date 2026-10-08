// BGM（やさしい版）: ブラウザの中で演奏する、オルゴール風の ゆったりしたハロウィン・ワルツ（3拍子）。
// ねらい: 目立たず、長く聞いても疲れない。急な切りかえをせず、伴奏の音数・休符・フレーズの終わりを、ゆっくり少しずつ変える。
// 音声ファイルは使わず、その場で音を合成する（この曲はこのプロジェクトのオリジナル）。
const BPM = 100, BEAT = 60 / BPM;
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const hz = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + 12 * (+m[2] + 1) - 69) / 12); };
// 1/fゆらぎ: ゆっくりした揺れと細かい揺れが混ざる、自然なゆらぎ（意識されないほど小さく使う）
export function pink(rows = 7, seed = 1) {
  let s = seed >>> 0 || 1; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const v = Array.from({ length: rows }, rnd); let count = 0;
  return () => { count++; let k = 0, c = count; while ((c & 1) === 0 && k < rows - 1) { c >>= 1; k++; } v[k] = rnd(); return v.reduce((a, b) => a + b, 0) / rows * 2.2; };
}
// 1小節ごとの [低音, [和音の音...], [メロディ: [音, 拍数]... ('R'=休み)]]。16小節で1周。音域は D5〜D6 の中だけ（大きく跳ばない）
const BARS = [
  ['A2', ['C4', 'E4'], [['E5', 1], ['A5', 1], ['C6', 1]]],
  ['A2', ['C4', 'E4'], [['B5', 1.5], ['A5', .5], ['E5', 1]]],
  ['D3', ['F4', 'A4'], [['D5', 1], ['F5', 1], ['A5', 1]]],
  ['E2', ['G#3', 'D4'], [['G#5', 2], ['R', 1]]],
  ['A2', ['C4', 'E4'], [['E5', 1.5], ['A5', .5], ['C6', 1]]],
  ['F2', ['A3', 'C4'], [['A5', 1.5], ['G5', .5], ['F5', 1]]],
  ['E2', ['G#3', 'D4'], [['E5', .5], ['G#5', .5], ['B5', 2]]],
  ['A2', ['C4', 'E4'], [['A5', 3]]],
  ['C3', ['E4', 'G4'], [['E5', 1], ['G5', 1], ['C6', 1]]],
  ['G2', ['B3', 'D4'], [['B5', 1.5], ['A5', .5], ['G5', 1]]],
  ['F2', ['A3', 'C4'], [['A5', 1], ['C6', 1], ['F5', 1]]],
  ['E2', ['G#3', 'D4'], [['G#5', 2], ['R', 1]]],
  ['A2', ['C4', 'E4'], [['C6', 1], ['B5', .5], ['A5', .5], ['G5', 1]]],
  ['D3', ['F4', 'A4'], [['F5', 1], ['A5', 1], ['D6', 1]]],
  ['E2', ['G#3', 'D4'], [['C6', 1], ['B5', 1], ['G#5', 1]]],
  ['A2', ['C4', 'E4'], [['A5', 2], ['R', 1]]],
];
const clone = a => JSON.parse(JSON.stringify(a));
const MEL_A = BARS.map(b => b[2]);
// A2: Aとほとんど同じ。ところどころの音を のばして、フレーズの終わりだけ少し変える（気づくと少し違う、くらい）
const MEL_A2 = clone(MEL_A); MEL_A2[1] = [['B5', 2], ['E5', 1]]; MEL_A2[5] = [['A5', 2], ['F5', 1]]; MEL_A2[9] = [['B5', 2], ['G5', 1]]; MEL_A2[14] = [['B5', 2], ['G#5', 1]];
// B: のびやか（長い音と休みで息つぎ）。音域はAと同じ
const MEL_B = [
  [['E5', 3]], [['A5', 2], ['C6', 1]], [['D6', 1.5], ['C6', .5], ['A5', 1]], [['G#5', 2], ['R', 1]],
  [['E5', 1], ['A5', .5], ['B5', .5], ['C6', 1]], [['A5', 2], ['F5', 1]], [['G#5', 1], ['B5', 2]], [['A5', 2], ['R', 1]],
  [['G5', 1.5], ['E5', .5], ['G5', 1]], [['B5', 3]], [['A5', 1], ['C6', .5], ['A5', .5], ['F5', 1]], [['G#5', 2], ['R', 1]],
  [['A5', 1], ['B5', .5], ['C6', .5], ['D6', 1]], [['D6', 2], ['A5', 1]], [['B5', 1.5], ['G#5', .5], ['E5', 1]], [['A5', 3]],
];
const MELS = { A: MEL_A, A2: MEL_A2, B: MEL_B };
// 8周で ひとめぐり（約3分50秒）。メロディは A→A→A2→B→A→A2→B→A2 とゆっくり入れかわるだけ（楽器・音域・テンポは変えない）
const ORDER = ['A', 'A', 'A2', 'B', 'A', 'A2', 'B', 'A2'];
export const LOOP_BARS = BARS.length, LOOPS = ORDER.length, BAR_SEC = 3 * BEAT;
export const TOTAL_SEC = () => LOOPS * LOOP_BARS * BAR_SEC;
// 音数のゆるやかな波: 1.0(ふつう)〜0.45(とても少ない)を、128小節かけて なめらかに行き来する（急に変わらない）。先頭(i=0)と最後は 1.0 に近く、つなぎ目が自然
const density = i => 0.725 + 0.275 * Math.cos(2 * Math.PI * i / (LOOP_BARS * LOOPS) * 2);
// 小節ごとの決まった乱数(0〜1): 同じ小節は いつも同じ結果
const hash = (i, k) => { let x = (i * 374761393 + k * 668265263) >>> 0; x = ((x ^ (x >>> 13)) * 1274126177) >>> 0; return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };

export class MusicBox {
  constructor() { this.fj = pink(7, 11); this.fv = pink(7, 23); this.ft = pink(5, 37); this.ctx = null; this.enabled = true; this.running = false; this.bar = 0; this.next = 0; this.timer = null; this.vol = .8; }
  _init() {
    if (this.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC();
    this._graph(this.ctx, this.ctx.destination, this.vol);
  }
  // 音の通り道: 高い音をやわらげる(ローパス) → 全体の音量 → ゆるい圧縮 → 出口。残響はやわらかく少なめ
  _graph(ctx, out, vol) {
    const master = ctx.createGain(); master.gain.value = vol; this.master = master;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 2.5; comp.attack.value = .02; comp.release.value = .3;
    master.connect(comp); comp.connect(out);
    const soft = ctx.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 2600; soft.Q.value = .5; soft.connect(master);
    const bus = ctx.createGain(); bus.gain.value = 1; bus.connect(soft); this.bus = bus;
    const wet = ctx.createGain(); wet.gain.value = .15; wet.connect(master);
    for (const [dt, fb] of [[.27, .24], [.37, .2], [.49, .16]]) {
      const d = ctx.createDelay(1); d.delayTime.value = dt; const g = ctx.createGain(); g.gain.value = fb; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
      bus.connect(d); d.connect(lp); lp.connect(g); g.connect(d); lp.connect(wet);
    }
  }
  // やわらかい鈴: 立ち上がりを20msにして「ポン」という打音を目立たせない。倍音は2倍音だけ少し
  _bell(ctx, t0, f, len, gain) {
    const t = Math.max(ctx.currentTime || 0, t0 + this.fj() * .0015); gain *= 1 + this.fv() * .03;
    for (const [mul, g, dec] of [[1, 1, len], [2, .12, len * .4]]) {
      const o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * mul;
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain * g, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + dec);
      o.connect(e); e.connect(this.bus); o.start(t); o.stop(t + dec + .05);
    }
  }
  _bass(ctx, t, f, len, gain) {
    const o = ctx.createOscillator(), e = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 420;
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain, t + .04); e.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(lp); lp.connect(e); e.connect(this.bus); o.start(t); o.stop(t + len + .05);
  }
  _pad(ctx, t, freqs, dur) { // いつも うっすら流れる和音のしき物（ゆっくり立ちあがり・消える）。音数が減っても、場面が切りかわった感じがしないための つなぎ役
    for (const f of freqs) { const o = ctx.createOscillator(), e = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 800;
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.011, t + 1.0); e.gain.setValueAtTime(.011, t + dur - 1.0); e.gain.linearRampToValueAtTime(0, t + dur); o.connect(lp); lp.connect(e); e.connect(this.bus); o.start(t); o.stop(t + dur + .1); }
  }
  // 伴奏のかたち: 0=ふつうのワルツ 1=アルペジオ 2=のばす 3=2拍目を休む。音数は density で少しずつ増減（音を へらすことで変化をつける）
  _pattern(i) {
    const bar = i % LOOP_BARS; if (bar === 0) return 0; if (bar === 7 || bar === 15) return 2;
    const r = hash(i, 1); return r < .38 ? 0 : r < .62 ? 1 : r < .8 ? 3 : 2;
  }
  scheduleBar(ctx, i, t) {
    const loop = Math.floor(i / LOOP_BARS) % LOOPS, b16 = i % LOOP_BARS, [bass, chord] = BARS[b16], mel = MELS[ORDER[loop]][b16], pat = this._pattern(i), dens = density(i);
    const keep = (k, p = 1) => hash(i, k) < Math.min(1, dens * p);   // 伴奏の音を へらすかどうか
    // 低音（ほぼ毎小節。しずかなときだけ、ときどき休む）
    if (b16 === 0 || keep(2, 1.25)) this._bass(ctx, t, hz(bass), BEAT * (pat === 2 ? 2.7 : 1.7), pat === 2 ? .22 : .25);
    // 和音の鈴
    const [c1, c2] = chord, g = .05;
    if (pat === 0) { for (const [b, k] of [[1, 3], [2, 4]]) if (keep(k)) { this._bell(ctx, t + b * BEAT, hz(c1), BEAT * 1.2, g); this._bell(ctx, t + b * BEAT + .015, hz(c2), BEAT * 1.2, g); } }
    else if (pat === 1) { [[1, c1, 1, 5], [1.5, c2, 1, 6], [2, c1, 2, 7], [2.5, c2, 2, 8]].forEach(([b, n, m, k]) => { if (keep(k)) this._bell(ctx, t + b * BEAT, hz(n) * m, BEAT * 1.1, g * .9); }); }
    else if (pat === 2) { if (keep(9, 1.2)) { this._bell(ctx, t + BEAT, hz(c1), BEAT * 2.2, g); this._bell(ctx, t + BEAT + .02, hz(c2), BEAT * 2.2, g * .9); } }
    else if (keep(10)) { this._bell(ctx, t + BEAT * 2, hz(c1), BEAT * 1.3, g); this._bell(ctx, t + BEAT * 2 + .015, hz(c2), BEAT * 1.3, g); }
    // しき物の和音（毎小節うっすら）
    this._pad(ctx, t, [hz(c1), hz(c2), hz(bass) * 2], BAR_SEC + 1.0);
    // メロディ（主役の音色はずっと同じ・控えめな音量）。フレーズの終わりの小節(4・8・12・16)は、density が低いとき、最後の1音を休むことがある
    let at = 0;
    for (let k = 0; k < mel.length; k++) {
      const [n, beats] = mel[k]; if (n === 'R') { at += beats; continue; }
      const isEnd = (b16 % 4 === 3) && k === mel.length - 1 && mel.length > 1, skip = isEnd && dens < .62 && hash(i, 11) < .7;
      if (!skip) this._bell(ctx, t + at * BEAT, hz(n), Math.max(1.0, beats * BEAT * 1.4), .12);
      at += beats;
    }
  }
  unlock() { if (!this.enabled) return; this._init(); if (!this.ctx) return; this.ctx.resume?.(); this._start(); }
  _start() {
    if (this.running || !this.ctx) return; this.running = true; this.next = this.ctx.currentTime + .15;
    this.timer = setInterval(() => { // 先回りして、すこし先の小節まで予約する
      if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + .05;
      while (this.next < this.ctx.currentTime + .8) { this.scheduleBar(this.ctx, this.bar++, this.next); this.next += BAR_SEC * (1 + this.ft() * .003); }
    }, 120);
  }
  setEnabled(on) {
    this.enabled = on;
    if (!on) { this.running = false; clearInterval(this.timer); if (this.master) { const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.setTargetAtTime(0, t, .2); } }
    else { this._init(); if (this.master) this.master.gain.setTargetAtTime(this.vol, this.ctx.currentTime, .2); this.ctx?.resume?.(); this._start(); }
  }
  hidden(h) { if (!this.ctx) return; if (h) this.ctx.suspend?.(); else if (this.enabled) this.ctx.resume?.(); }
}
// 動作確認・書き出し用: 画面に出さず、先頭から seconds 秒ぶんを計算する
export async function renderOffline(seconds = 30, sr = 22050) {
  const ctx = new OfflineAudioContext(1, Math.floor(sr * seconds), sr), mb = new MusicBox(); mb._graph(ctx, ctx.destination, .8);
  let t = 0, i = 0; while (t < seconds) { mb.scheduleBar(ctx, i++, t); t += BAR_SEC; }
  return ctx.startRendering();
}
