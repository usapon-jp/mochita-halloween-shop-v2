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
  ['A2', ['C4', 'E4'], [['A5', 2]]],
];
// 1/fゆらぎ: -1〜1 のゆるやかな乱数。ふつうの乱数(ざらざら)ではなく、ゆっくりした揺れと細かい揺れが混ざる（自然な心地よさ）
export function pink(rows = 7, seed = 1) {
  let s = seed >>> 0 || 1; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
  const v = Array.from({ length: rows }, rnd); let count = 0;
  return () => { count++; let k = 0, c = count; while ((c & 1) === 0 && k < rows - 1) { c >>= 1; k++; } v[k] = rnd(); return v.reduce((a, b) => a + b, 0) / rows * 2.2; };
}
// もうひとつのメロディ(C): 同じコード進行の上で、下がったり上がったりする別の旋律
const MEL_C = [
  [['C6', 1], ['B5', .5], ['A5', .5], ['E5', 1]], [['A5', 1.5], ['C6', .5], ['E6', 1]], [['D6', 1], ['C6', .5], ['A5', .5], ['F5', 1]], [['E5', .5], ['G#5', .5], ['B5', 1], ['D6', 1]],
  [['C6', 1.5], ['B5', .5], ['A5', 1]], [['A5', 1], ['G5', .5], ['F5', .5], ['A5', 1]], [['G#5', 1], ['B5', 1], ['E6', 1]], [['A5', 2], ['E5', 1]],
  [['G5', 1], ['E5', .5], ['G5', .5], ['C6', 1]], [['D6', 1.5], ['B5', .5], ['G5', 1]], [['C6', 1], ['A5', 1], ['F5', 1]], [['E5', 1], ['G#5', 1], ['B5', 1]],
  [['A5', 1], ['B5', .5], ['C6', .5], ['E6', 1]], [['D6', 1.5], ['A5', .5], ['F5', 1]], [['B5', 1], ['G#5', 1], ['E5', 1]], [['A5', 3]],
];
// メロディB: のびやか（長い音・休みで息つぎ。4小節ごとに ひと休み）
const MEL_B = [
  [['E5', 3]], [['A5', 2], ['C6', 1]], [['D6', 1.5], ['C6', .5], ['A5', 1]], [['G#5', 2], ['R', 1]],
  [['E5', 1], ['A5', .5], ['B5', .5], ['C6', 1]], [['A5', 2], ['F5', 1]], [['G#5', 1], ['B5', 2]], [['A5', 2], ['R', 1]],
  [['G5', 1.5], ['E5', .5], ['G5', 1]], [['B5', 3]], [['A5', 1], ['C6', .5], ['A5', .5], ['F5', 1]], [['G#5', 2], ['R', 1]],
  [['A5', .5], ['B5', .5], ['C6', .5], ['D6', .5], ['E6', 1]], [['D6', 2], ['A5', 1]], [['B5', 1.5], ['G#5', .5], ['E5', 1]], [['A5', 3]],
];
// メロディD: はずむ（休符多め・8分音符・ところどころ駆け上がり）
const MEL_D = [
  [['A5', .5], ['R', .5], ['C6', .5], ['R', .5], ['E6', 1]], [['D6', .5], ['C6', .5], ['B5', 1], ['R', 1]], [['F5', .5], ['A5', .5], ['D6', 1], ['C6', 1]], [['B5', 1], ['G#5', 1], ['R', 1]],
  [['E6', .5], ['R', .5], ['C6', .5], ['A5', .5], ['E5', 1]], [['F5', .5], ['A5', .5], ['C6', 1], ['A5', 1]], [['G#5', .5], ['B5', .5], ['E6', 2]], [['A5', 1], ['R', 2]],
  [['C6', .5], ['E6', .5], ['G6', 1], ['E6', 1]], [['D6', 1], ['B5', .5], ['G5', .5], ['R', 1]], [['A5', 1], ['C6', 1], ['F6', 1]], [['E6', .5], ['D6', .5], ['B5', 1], ['R', 1]],
  [['C6', .5], ['A5', .5], ['E5', 1], ['A5', 1]], [['F5', 1], ['A5', .5], ['D6', .5], ['R', 1]], [['G#5', .5], ['B5', .5], ['D6', 1], ['R', 1]], [['A5', 2], ['R', 1]],
];
const MELS = { A: BARS.map(b => b[2]), B: MEL_B, C: MEL_C, D: MEL_D };
// 8周で ひとめぐり: [メロディ, 変化, 音の高さ(半音), テンポ, 楽器]。同じメロディが戻るときは楽器を変える（音色でも別の曲に聞こえる）
const PLAN = [
  ['A', 'base', 0, 1, 'box'], ['B', 'base', 0, 1, 'kalimba'], ['C', 'low', 0, .98, 'flute'], ['D', 'orn', 0, 1, 'piano'],
  ['A', 'base', 0, 1.02, 'flute'], ['B', 'orn', 0, 1.02, 'piano'], ['C', 'base', 2, 1.02, 'box'], ['D', 'sparse', 0, .95, 'kalimba'],
];
// 曲の流れ: 4周ごとに、メロディのない しずかな4小節（頭のメロディをリセット）
const SEGS = [0, 1, 2, 3, 'q', 4, 5, 6, 7, 'q'];
export const PLAN_LOOPS = PLAN.length;
export const BAR_SEC = 3 * BEAT, LOOP_BARS = BARS.length;
export const QUIET_BARS = 4, QUIET_SLOW = 1.15;
export const TOTAL_SEC = () => SEGS.reduce((t, g) => t + (g === 'q' ? QUIET_BARS * BAR_SEC * QUIET_SLOW : LOOP_BARS * BAR_SEC / PLAN[g][3]), 0);
export const SEG_COUNT = () => SEGS.length;

export class MusicBox {
  constructor() { this.fj = pink(7, 11); this.fv = pink(7, 23); this.ft = pink(5, 37); this.ctx = null; this.enabled = true; this.running = false; this.bar = 0; this.seg = 0; this.segBar = 0; this._lastPat = -1; this.next = 0; this.timer = null; this.vol = .9; }
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
  _mvoice(ctx, kind, t0, f, len, gain) { // メロディの楽器
    if (kind === 'box') return this._bell(ctx, t0, f, len, gain);
    const out = this.bus, t = Math.max(ctx.currentTime || 0, t0 + this.fj() * .004); gain *= 1 + this.fv() * .07;
    const tone = (type, fr, g, att, dec, hold = 0) => { const o = ctx.createOscillator(), e = ctx.createGain(); o.type = type; o.frequency.value = fr; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + att);
      if (hold) { e.gain.setValueAtTime(g, t + hold); e.gain.linearRampToValueAtTime(.0001, t + dec); } else e.gain.exponentialRampToValueAtTime(.0001, t + dec); o.connect(e); e.connect(out); o.start(t); o.stop(t + dec + .05); return o; };
    if (kind === 'kalimba') { tone('sine', f, gain * 1.05, .003, len * .8); tone('sine', f * 2, gain * .22, .003, .18); tone('sine', f * 5.1, gain * .06, .002, .06); }
    else if (kind === 'flute') { const d = Math.min(len, 2.2), o = tone('sine', f, gain * .5, .07, d, d * .72); tone('sine', f * 2, gain * .06, .09, d, d * .6); tone('sine', f * 3, gain * .02, .1, d * .8, d * .5);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5 + this.fj() * .4; lg.gain.value = 7; lfo.connect(lg); lg.connect(o.detune); lfo.start(t); lfo.stop(t + d + .05); }
    else { tone('triangle', f, gain * .8, .004, len * .95); tone('sine', f * 2, gain * .26, .004, len * .5); tone('sine', f * 3, gain * .1, .004, len * .25); }   // piano
  }
  _pad(ctx, t, freqs, dur) { // しずかな部分の和音: ゆっくり立ちあがって、ゆっくり消える（ノイズなし）
    for (const f of freqs) for (const det of [-4, 4]) { const o = ctx.createOscillator(), e = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; lp.type = 'lowpass'; lp.frequency.value = 1100;
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.024, t + 1.4); e.gain.setValueAtTime(.024, t + dur - 1.6); e.gain.linearRampToValueAtTime(0, t + dur); o.connect(lp); lp.connect(e); e.connect(this.bus); o.start(t); o.stop(t + dur + .1); }
  }
  scheduleQuiet(ctx, qb, t) { // メロディなしの しずかな小節(4小節): ゆっくりの和音と、ごくまばらな高い鈴
    const [bass, chord] = BARS[[0, 5, 8, 3][qb % 4]], dur = BAR_SEC * QUIET_SLOW;
    this._bass(ctx, t, hz(bass), dur * .9, .2); this._pad(ctx, t, [...chord.map(n => hz(n)), hz(bass) * 2], dur + .6);
    this._bell(ctx, t + dur * .45, hz(chord[1]) * 2, 2.6, .07); if (qb % 2 === 1) this._bell(ctx, t + dur * .78, hz(chord[0]) * 2, 2.2, .05);
  }
  _bass(ctx, t, f, len, gain) {
    const o = ctx.createOscillator(), e = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 520;
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(lp); lp.connect(e); e.connect(this.bus); o.start(t); o.stop(t + len + .05);
  }
  // 伴奏のかたち（毎小節「ズン・チャッ・チャッ」にならないよう、5種類を入れかえる）
  //  0=ふつうのワルツ 1=アルペジオ(のぼる) 2=のばす(ふわっと) 3=2拍目を休む(ゆれる) 4=細かいくずし
  _pattern(i) {
    const loop = Math.floor(i / LOOP_BARS) % PLAN_LOOPS, bar = i % LOOP_BARS, mode = PLAN[loop][1];
    if (bar === 0) return mode === 'sparse' ? 2 : 0;           // 頭はワルツで、拍をそろえる（しずかな周はふわっと）
    if (bar === 7 || bar === 15) return 2;                       // 区切りはふわっと終わる
    if (mode === 'sparse') return bar % 2 ? 3 : 2;               // しずかな周: のばす／2拍目を休む
    const seq = [0, 1, 0, 3, 4, 0, 1, 3, 0, 4, 1, 0, 3, 1, 0], k = (bar * 7 + [0, 7, 3, 11, 5, 13, 9, 2][loop]) % seq.length;   // 周ごとに並びがずれる
    let p = seq[k]; if (i > 0 && p === this._lastPat && p !== 2) p = (p + 1 + loop) % 5; return p;
  }
  scheduleBar(ctx, i, t) { // i番目の小節を、時刻tから鳴らす
    const b16 = i % LOOP_BARS, loopI = Math.floor(i / LOOP_BARS) % PLAN_LOOPS, [melKind, mode, trans] = PLAN[loopI], pat = this._pattern(i); this._lastPat = pat;
    const [bass, chord] = BARS[b16], mel = MELS[melKind][b16], tr = Math.pow(2, trans / 12), timbre = PLAN[loopI][4];
    const lower = mode === 'low' ? .5 : 1, st = (n, m = 1) => hz(n) * m * tr;
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
      if (n === 'R') { at += beats; continue; }   // 休符（息つぎ）
      const f = st(n, lower), len = Math.max(.9, beats * BEAT * (mode === 'sparse' ? 2 : 1.4)), g = mode === 'low' ? .15 : mode === 'sparse' ? .13 : .17;
      if (mode === 'orn' && beats >= 1) this._bell(ctx, t + at * BEAT - BEAT * .14, f * Math.pow(2, -2 / 12), BEAT * .3, .06);   // かざり音(1つ下から)
      if (mode !== 'sparse' || at === 0 || beats >= 2) this._mvoice(ctx, timbre, t + at * BEAT, f, len, g);
      if (mode === 'sparkle' && beats >= 1.5) this._bell(ctx, t + at * BEAT + BEAT * .5, f * 2, .7, .045);
      if (mode === 'orn' && beats >= 2) this._bell(ctx, t + at * BEAT + .02, f * Math.pow(2, -3 / 12), len * .9, .06);       // 3度ほど下の音で ふくらませる
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
  _advance() { // 曲の流れを少しずつ進めて音を予約する
    const seg = SEGS[this.seg], ctx = this.ctx;
    if (seg === 'q') { this.scheduleQuiet(ctx, this.segBar, this.next); this.next += BAR_SEC * QUIET_SLOW; if (++this.segBar >= QUIET_BARS) this._nextSeg(); }
    else { this.scheduleBar(ctx, seg * LOOP_BARS + this.segBar, this.next); this.next += BAR_SEC / PLAN[seg][3] * (1 + this.ft() * .008); if (++this.segBar >= LOOP_BARS) this._nextSeg(); }
  }
  _nextSeg() { this.seg = (this.seg + 1) % SEGS.length; this.segBar = 0; }
  _start() {
    if (this.running || !this.ctx) return; this.running = true; this.next = this.ctx.currentTime + .15;
    this.timer = setInterval(() => { // 先回りして、すこし先の小節まで予約する
      if (this.next < this.ctx.currentTime) this.next = this.ctx.currentTime + .05;   // 遅れたぶんは まとめて鳴らさず、いまから続ける
      while (this.next < this.ctx.currentTime + .8) this._advance();
    }, 120);
  }
  setEnabled(on) {
    this.enabled = on;
    if (!on) { this.running = false; clearInterval(this.timer); if (this.master) { const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.setTargetAtTime(0, t, .15); } }
    else { this._init(); if (this.master) this.master.gain.setTargetAtTime(this.vol, this.ctx.currentTime, .15); this.ctx?.resume?.(); this._start(); }
  }
  hidden(h) { if (!this.ctx) return; if (h) this.ctx.suspend?.(); else if (this.enabled) this.ctx.resume?.(); }
}
// 動作確認用: 画面に出さず、指定のまとまり(0..9)を計算する（ピークの確認など）
export async function renderSeg(seg, seconds = 30) {
  const sr = 22050, ctx = new OfflineAudioContext(1, sr * seconds, sr), mb = new MusicBox(); mb.ctx = ctx; mb._graph(ctx, ctx.destination, .9); mb.seg = seg; mb.segBar = 0; mb.next = 0;
  let g = 0; while (mb.next < seconds && g++ < 400 && mb.seg === seg) mb._advance();
  return ctx.startRendering();
}
export const renderOffline = (seconds = 30) => renderSeg(0, seconds);
export const MELODIES = MELS;
