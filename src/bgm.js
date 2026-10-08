// BGM: ブラウザの中で演奏する、オルゴール風のやさしいハロウィン・ワルツ（3拍子）。
// 音声ファイルを使わず、その場で音を合成するので、ファイルの重さも著作権の心配もない（この曲はこのプロジェクトのオリジナル）。
const BPM = 104, BEAT = 60 / BPM;
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const hz = n => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + 12 * (+m[2] + 1) - 69) / 12); };
// 1小節ごとの [コード低音, [和音の音...], [メロディ: [音, 拍数]...]]（16小節で1周）
const BARS = [
  ['A2', ['C4', 'E4'], [['E5', 1], ['A5', 1], ['C6', 1]]],
  ['A2', ['C4', 'E4'], [['B5', 1.5], ['A5', .5], ['E5', 1]]],
  ['D3', ['F4', 'A4'], [['D5', 1], ['F5', 1], ['A5', 1]]],
  ['E2', ['G#3', 'D4'], [['G#5', 1.5], ['B5', .5], ['E5', 1]]],
  ['A2', ['C4', 'E4'], [['E5', 1], ['A5', 1], ['C6', 1]]],
  ['F2', ['A3', 'C4'], [['A5', 1.5], ['G5', .5], ['F5', 1]]],
  ['E2', ['G#3', 'D4'], [['E5', 1], ['G#5', 1], ['B5', 1]]],
  ['A2', ['C4', 'E4'], [['A5', 3]]],
  ['C3', ['E4', 'G4'], [['E5', 1], ['G5', 1], ['C6', 1]]],
  ['G2', ['B3', 'D4'], [['B5', 1.5], ['A5', .5], ['G5', 1]]],
  ['F2', ['A3', 'C4'], [['A5', 1], ['C6', 1], ['F5', 1]]],
  ['E2', ['G#3', 'D4'], [['G#5', 2], ['B5', 1]]],
  ['A2', ['C4', 'E4'], [['C6', 1], ['B5', .5], ['A5', .5], ['G5', 1]]],
  ['D3', ['F4', 'A4'], [['F5', 1], ['A5', 1], ['D6', 1]]],
  ['E2', ['G#3', 'D4'], [['C6', 1], ['B5', 1], ['G#5', 1]]],
  ['A2', ['C4', 'E4'], [['A5', 2]]],
];
// 1/fゆらぎ: -1〜1 のゆるやかな乱数。ふつうの乱数(ざらざら)ではなく、ゆっくりした揺れと細かい揺れが混ざる（自然な心地よさ）
export function pink(rows = 7, seed = 1) {
  let s = seed >>> 0 || 1; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const v = Array.from({ length: rows }, rnd); let count = 0;
  return () => { count++; let k = 0, c = count; while ((c & 1) === 0 && k < rows - 1) { c >>= 1; k++; } v[k] = rnd(); return v.reduce((a, b) => a + b, 0) / rows * 2.2; };
}
export const BAR_SEC = 3 * BEAT, LOOP_BARS = BARS.length;

export class MusicBox {
  constructor() { this.fj = pink(7, 11); this.fv = pink(7, 23); this.ft = pink(5, 37); this.ctx = null; this.enabled = true; this.running = false; this.bar = 0; this._lastPat = -1; this.next = 0; this.timer = null; this.vol = .9; }
  _init() {
    if (this.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC();
    this._graph(this.ctx, this.ctx.destination, this.vol);
  }
  // 音の通り道: 全体の音量 → ゆるい圧縮 → 出口。やわらかい残響は短い遅延のくりかえしで作る
  _graph(ctx, out, vol) {
    const master = ctx.createGain(); master.gain.value = vol; this.master = master;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25;
    master.connect(comp); comp.connect(out);
    const bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master); this.bus = bus;
    const wet = ctx.createGain(); wet.gain.value = .17; wet.connect(master);
    for (const [dt, fb] of [[.23, .26], [.31, .22], [.43, .18]]) {
      const d = ctx.createDelay(1); d.delayTime.value = dt; const g = ctx.createGain(); g.gain.value = fb; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2100;
      bus.connect(d); d.connect(lp); lp.connect(g); g.connect(d); lp.connect(wet);
    }
  }
  _bell(ctx, t0, f, len, gain) { // オルゴールの音: 基本の音＋2倍音(すぐ消える)。タイミング(±4ms)と強さ(±7%)を1/fでゆらして、機械っぽさを消す
    const out = this.bus, t = Math.max(ctx.currentTime || 0, t0 + this.fj() * .004); gain *= 1 + this.fv() * .07;
    for (const [mul, g, dec] of [[1, 1, len], [2, .28, len * .45], [3.01, .08, len * .2]]) {
      const o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * mul;
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain * g, t + .006); e.gain.exponentialRampToValueAtTime(.0001, t + dec);
      o.connect(e); e.connect(out); o.start(t); o.stop(t + dec + .05);
    }
  }
  _bass(ctx, t, f, len, gain) {
    const o = ctx.createOscillator(), e = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 520;
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(lp); lp.connect(e); e.connect(this.bus); o.start(t); o.stop(t + len + .05);
  }
  // 伴奏のかたち（毎小節「ズン・チャッ・チャッ」にならないよう、5種類を入れかえる）
  //  0=ふつうのワルツ 1=アルペジオ(のぼる) 2=のばす(ふわっと) 3=2拍目を休む(ゆれる) 4=細かいくずし
  _pattern(i) {
    const loop = Math.floor(i / LOOP_BARS), bar = i % LOOP_BARS;
    if (bar === 0) return 0;                       // 頭はいつもワルツで、拍をそろえる
    if (bar === 7 || bar === 15) return 2;         // 区切りはふわっと終わる
    const seq = [0, 1, 0, 3, 4, 0, 1, 3, 0, 4, 1, 0, 3, 1, 0], k = (bar * 7 + loop * 4 + (loop >> 1) * 3) % seq.length;
    let p = seq[k]; if (i > 0 && p === this._lastPat && p !== 2) p = (p + 1 + loop) % 5; return p;
  }
  scheduleBar(ctx, i, t) { // i番目の小節を、時刻tから鳴らす
    const [bass, chord, mel] = BARS[i % LOOP_BARS], loop = Math.floor(i / LOOP_BARS) % 4, pat = this._pattern(i); this._lastPat = pat;
    const lower = loop === 2 ? .5 : 1, st = (n, m = 1) => hz(n) * m;
    // 低音
    if (pat === 2) this._bass(ctx, t, st(bass), BEAT * 2.8, .32);
    else if (pat === 1 || pat === 4) this._bass(ctx, t, st(bass), BEAT * 1.2, .3);
    else this._bass(ctx, t, st(bass), BEAT * 1.6, .34);
    if (pat === 1 && i % 2 === 1) this._bass(ctx, t + BEAT * 2, st(bass, 1.5), BEAT * .9, .16);   // 5度の低音をそっと足す
    // 和音まわり
    const [c1, c2] = chord;
    if (pat === 0) { for (const b of [1, 2]) { this._bell(ctx, t + b * BEAT, st(c1), BEAT * 1.1, .08); this._bell(ctx, t + b * BEAT + .012, st(c2), BEAT * 1.1, .08); } }
    else if (pat === 1) { this._bell(ctx, t + BEAT, st(c1), BEAT * 1.0, .075); this._bell(ctx, t + BEAT * 1.5, st(c2), BEAT * 1.0, .07); this._bell(ctx, t + BEAT * 2, st(c1, 2), BEAT * 1.2, .06); this._bell(ctx, t + BEAT * 2.5, st(c2, 2), BEAT * 1.2, .055); }
    else if (pat === 2) { this._bell(ctx, t + BEAT, st(c1), BEAT * 2.2, .075); this._bell(ctx, t + BEAT + .02, st(c2), BEAT * 2.2, .07); }
    else if (pat === 3) { this._bell(ctx, t + BEAT * 2, st(c1), BEAT * 1.2, .08); this._bell(ctx, t + BEAT * 2 + .012, st(c2), BEAT * 1.2, .08); }
    else { for (const [b, n, m] of [[1, c1, 1], [1.5, c2, 1], [2, c1, 2], [2.5, c2, 1]]) this._bell(ctx, t + b * BEAT, st(n, m), BEAT * .9, .06); }
    // メロディ（周ごとに少しずつ変える）: 0=そのまま 1=高いきらめき 2=1オクターブ下でやさしく 3=かざり音と、ながい音に3度のハーモニー
    let at = 0;
    for (const [n, beats] of mel) {
      const f = st(n, lower), len = Math.max(.9, beats * BEAT * 1.4), g = loop === 2 ? .15 : .17;
      if (loop === 3 && beats >= 1) this._bell(ctx, t + at * BEAT - BEAT * .14, f * Math.pow(2, -2 / 12), BEAT * .3, .06);   // かざり音(1つ下から)
      this._bell(ctx, t + at * BEAT, f, len, g);
      if (loop === 1 && beats >= 1.5) this._bell(ctx, t + at * BEAT + BEAT * .5, f * 2, .7, .045);
      if (loop === 3 && beats >= 2) this._bell(ctx, t + at * BEAT + .02, f * Math.pow(2, -3 / 12), len * .9, .06);       // 3度ほど下の音で ふくらませる
      at += beats;
    }
  }
  // 画面を最初にさわったとき（ブラウザの決まりで、音は操作のあとにしか出せない）
  unlock() { if (!this.enabled) return; this._init(); if (!this.ctx) return; this.ctx.resume?.(); this._start(); }
  _bed() { // ごく小さな ピンクノイズの空気（風のような 1/f の音）。小節ごとにゆっくり強さが変わる
    if (this.bedGain || !this.ctx) return; const ctx = this.ctx, n = ctx.sampleRate * 8, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, sd = 5; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
    for (let i = 0; i < n; i++) { const w = rnd(); b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; const g = ctx.createGain(); g.gain.value = .02;
    src.connect(lp); lp.connect(g); g.connect(this.master); src.start(); this.bedGain = g;
  }
  _start() {
    if (this.running || !this.ctx) return; this._bed(); this.running = true; this.next = this.ctx.currentTime + .15;
    this.timer = setInterval(() => { // 先回りして、すこし先の小節まで予約する
      if (this.bedGain) this.bedGain.gain.setTargetAtTime(.013 + .010 * (this.fv() * .5 + .5), this.ctx.currentTime, 1.5);
      if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + .05;   // 遅れたぶんは まとめて鳴らさず、いまから続ける
      while (this.next < this.ctx.currentTime + .8) { this.scheduleBar(this.ctx, this.bar++, this.next); this.next += BAR_SEC * (1 + this.ft() * .008); }
    }, 120);
  }
  setEnabled(on) {
    this.enabled = on;
    if (!on) { this.running = false; clearInterval(this.timer); if (this.master) { const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.setTargetAtTime(0, t, .15); } }
    else { this._init(); if (this.master) this.master.gain.setTargetAtTime(this.vol, this.ctx.currentTime, .15); this.ctx?.resume?.(); this._start(); }
  }
  hidden(h) { if (!this.ctx) return; if (h) this.ctx.suspend?.(); else if (this.enabled) this.ctx.resume?.(); }
}
// 動作確認用: 画面に出さず、そのままファイル用の音を計算する（ピークの確認など）
export async function renderOffline(seconds = 30) {
  const sr = 22050, ctx = new OfflineAudioContext(1, sr * seconds, sr), mb = new MusicBox(); mb._graph(ctx, ctx.destination, .9);
  for (let i = 0; i * BAR_SEC < seconds; i++) mb.scheduleBar(ctx, i, i * BAR_SEC);
  return ctx.startRendering();
}
