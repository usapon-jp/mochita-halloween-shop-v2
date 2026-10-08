// BGM: ブラウザの中で演奏する、オルゴール風のやさしいハロウィン・ワルツ（3拍子）。
// 音声ファイルを使わず、その場で音を合成するので、ファイルの重さも著作権の心配もない（この曲はこのプロジェクトのオリジナル）。
const BPM = 104, BEAT = 60 / BPM;
const NOTE = { C: 0, Db: 1, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, Bb: 10, B: 11, Eb: 3 };
const hz = n => { const m = /^([A-G][#b]?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + 12 * (+m[2] + 1) - 69) / 12); };
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
// もうひとつのメロディ(C): 同じコード進行の上で、下がったり上がったりする別の旋律
const MEL_C = [
  [['C6', 1], ['B5', .5], ['A5', .5], ['E5', 1]], [['A5', 1.5], ['C6', .5], ['E6', 1]], [['D6', 1], ['C6', .5], ['A5', .5], ['F5', 1]], [['E5', .5], ['G#5', .5], ['B5', 1], ['D6', 1]],
  [['C6', 1.5], ['B5', .5], ['A5', 1]], [['A5', 1], ['G5', .5], ['F5', .5], ['A5', 1]], [['G#5', 1], ['B5', 1], ['E6', 1]], [['A5', 2], ['E5', 1]],
  [['G5', 1], ['E5', .5], ['G5', .5], ['C6', 1]], [['D6', 1.5], ['B5', .5], ['G5', 1]], [['C6', 1], ['A5', 1], ['F5', 1]], [['E5', 1], ['G#5', 1], ['B5', 1]],
  [['A5', 1], ['B5', .5], ['C6', .5], ['E6', 1]], [['D6', 1.5], ['A5', .5], ['F5', 1]], [['B5', 1], ['G#5', 1], ['E5', 1]], [['A5', 3]],
];
// 8周(約3分40秒)で ひとめぐり: [メロディ, 変化, 音の高さ(半音), テンポ]
const PLAN = [
  ['A', 'base', 0, 1], ['A', 'sparkle', 0, 1], ['A', 'low', 0, .98], ['A', 'orn', 0, 1],
  ['C', 'base', 0, 1.02], ['C', 'orn', 0, 1.03], ['A', 'orn', 2, 1.02], ['C', 'sparse', 0, .95],
];
export const PLAN_LOOPS = PLAN.length;
// 場面の並び: ワルツ(2周ずつ)の合間に、雨・星空・小川・月あかり。ワルツが戻ってくるまで ほかの雰囲気になる（約6分40秒でひとめぐり）
const SCENES = [
  { k: 'waltz', loops: [0, 1] }, { k: 'nature', mood: 'rain', dur: 38 },
  { k: 'waltz', loops: [2, 3] }, { k: 'pad', mood: 'stars', dur: 56 },
  { k: 'waltz', loops: [4, 5] }, { k: 'nature', mood: 'stream', dur: 40 },
  { k: 'waltz', loops: [6, 7] }, { k: 'pad', mood: 'moon', dur: 52 },
];
const MOODS = {
  rain: { wind: .01, rain: .05, drops: 0, notes: ['D5', 'F#5', 'A5'], bellG: .045, chords: [['D3', 'A3', 'F#4'], ['B2', 'F#3', 'D4']] },
  stream: { wind: .008, stream: .06, drops: 1, chimes: 1, notes: ['G5', 'A5', 'D6'], bellG: .05 },
  stars: { wind: .006, crickets: 1, owl: 1, notes: ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6'], bellG: .1, chords: [['D3', 'A3', 'F#4'], ['B2', 'F#3', 'D4'], ['G2', 'D3', 'B3'], ['A2', 'E3', 'C#4']] },
  moon: { wind: .012, crickets: .6, chimes: 1, notes: ['F5', 'G5', 'A5', 'C6', 'D6'], bellG: .09, chords: [['F2', 'C3', 'A3', 'E4'], ['Bb2', 'F3', 'D4'], ['D3', 'A3', 'C4', 'F4'], ['C3', 'G3', 'Bb3', 'E4']] },
};
export const BAR_SEC = 3 * BEAT, LOOP_BARS = BARS.length;
export const SCENE_COUNT = () => SCENES.length;
export const TOTAL_SEC = () => SCENES.reduce((a, sc) => a + (sc.k === 'waltz' ? sc.loops.reduce((b, l) => b + LOOP_BARS * BAR_SEC / PLAN[l][3], 0) : sc.dur), 0);

export class MusicBox {
  constructor() { this.fj = pink(7, 11); this.fv = pink(7, 23); this.ft = pink(5, 37); this.ctx = null; this.enabled = true; this.running = false; this.bar = 0; this._lastPat = -1; this.next = 0; this.timer = null; this.vol = .9; this.fr = pink(7, 51); this.si = 0; this.entering = true; this.sbar = 0; this.t0 = 0; this.nb = {}; }
  _init() {
    if (this.ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC();
    this._graph(this.ctx, this.ctx.destination, this.vol); this._layers(this.ctx);
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
    const loop = Math.floor(i / LOOP_BARS) % PLAN_LOOPS, bar = i % LOOP_BARS, mode = PLAN[loop][1];
    if (bar === 0) return mode === 'sparse' ? 2 : 0;           // 頭はワルツで、拍をそろえる（しずかな周はふわっと）
    if (bar === 7 || bar === 15) return 2;                       // 区切りはふわっと終わる
    if (mode === 'sparse') return bar % 2 ? 3 : 2;               // しずかな周: のばす／2拍目を休む
    const seq = [0, 1, 0, 3, 4, 0, 1, 3, 0, 4, 1, 0, 3, 1, 0], k = (bar * 7 + [0, 7, 3, 11, 5, 13, 9, 2][loop]) % seq.length;   // 周ごとに並びがずれる
    let p = seq[k]; if (i > 0 && p === this._lastPat && p !== 2) p = (p + 1 + loop) % 5; return p;
  }
  scheduleBar(ctx, i, t) { // i番目の小節を、時刻tから鳴らす
    const b16 = i % LOOP_BARS, loopI = Math.floor(i / LOOP_BARS) % PLAN_LOOPS, [melKind, mode, trans] = PLAN[loopI], pat = this._pattern(i); this._lastPat = pat;
    const [bass, chord, melA] = BARS[b16], mel = melKind === 'C' ? MEL_C[b16] : melA, tr = Math.pow(2, trans / 12);
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
      const f = st(n, lower), len = Math.max(.9, beats * BEAT * (mode === 'sparse' ? 2 : 1.4)), g = mode === 'low' ? .15 : mode === 'sparse' ? .13 : .17;
      if (mode === 'orn' && beats >= 1) this._bell(ctx, t + at * BEAT - BEAT * .14, f * Math.pow(2, -2 / 12), BEAT * .3, .06);   // かざり音(1つ下から)
      if (mode !== 'sparse' || at === 0 || beats >= 2) this._bell(ctx, t + at * BEAT, f, len, g);
      if (mode === 'sparkle' && beats >= 1.5) this._bell(ctx, t + at * BEAT + BEAT * .5, f * 2, .7, .045);
      if (mode === 'orn' && beats >= 2) this._bell(ctx, t + at * BEAT + .02, f * Math.pow(2, -3 / 12), len * .9, .06);       // 3度ほど下の音で ふくらませる
      at += beats;
    }
  }
  // 画面を最初にさわったとき（ブラウザの決まりで、音は操作のあとにしか出せない）
  unlock() { if (!this.enabled) return; this._init(); if (!this.ctx) return; this.ctx.resume?.(); this._start(); }
  // ===== 場面（曲の流れ）: ワルツの合間に、ちがう雰囲気の場面（自然の音・星空・月あかり）をはさむ。ワルツが戻るまで予測しにくくなる =====
  // 自然の音は、ブラウザの中でノイズから合成（ファイルなし）。いつも流れているのは「風・雨・小川」の3つの層で、場面ごとに音量だけ変える。
  _layers(ctx) {
    const n = ctx.sampleRate * 4, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0); let sd = 7; for (let k = 0; k < n; k++) { sd = (sd * 1664525 + 1013904223) >>> 0; d[k] = (sd / 4294967296) * 2 - 1; }
    const nat = ctx.createGain(); nat.gain.value = 1; nat.connect(this.master); this.nat = nat;
    const mk = (type, f, q) => { const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = Math.random() * 3; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0; src.connect(fl); fl.connect(g); g.connect(nat); src.start(); return { fl, g }; };
    this.L = { wind: mk('bandpass', 420, .55), rain: mk('highpass', 1900, .5), stream: mk('bandpass', 1100, .9) };
    // 小川のゆれ: 2つのゆっくりした波で、ろ過の中心をゆらす（さらさら・ぽこぽこ）
    for (const [fr, amt] of [[3.1, 220], [5.3, 160]]) { const o = ctx.createOscillator(), a = ctx.createGain(); o.frequency.value = fr; a.gain.value = amt; o.connect(a); a.connect(this.L.stream.fl.frequency); o.start(); }
    const bed = ctx.createBufferSource(); bed.buffer = buf; bed.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; const g = ctx.createGain(); g.gain.value = .02; bed.connect(lp); lp.connect(g); g.connect(nat); bed.start(); this.bedGain = g;   // ごく小さな空気の層
  }
  _layerTo(name, v, t, tc = 2.5) { this.L[name].g.gain.setTargetAtTime(v, Math.max(t, this.ctx.currentTime), tc); }
  _enter(sc, t) { // 場面に入る: 自然音の層を、場面に合わせてゆっくり切りかえる
    const m = sc.k === 'waltz' ? { wind: .008, rain: 0, stream: 0 } : (MOODS[sc.mood] || {});
    for (const k of ['wind', 'rain', 'stream']) this._layerTo(k, m[k] || 0, t, 2.2);
    this.t0 = t; this.nb = { bell: t + .5, drop: t + 1, chime: t + 3, cricket: t + 1.5, owl: t + 12, wgust: t, pad: t - 99 };
  }
  _next() { this.si = (this.si + 1) % SCENES.length; this.entering = true; this.sbar = 0; }
  _advance() { // 場面を、すこしずつ先へ進めて音を予約する
    const sc = SCENES[this.si], ctx = this.ctx;
    if (this.entering) { this._enter(sc, this.next); this.entering = false; }
    if (sc.k === 'waltz') {
      const idx = this.sbar, loopI = sc.loops[Math.floor(idx / LOOP_BARS)];
      this.scheduleBar(ctx, loopI * LOOP_BARS + idx % LOOP_BARS, this.next); this.next += BAR_SEC / PLAN[loopI][3] * (1 + this.ft() * .008); this.sbar++;
      if (this.sbar >= sc.loops.length * LOOP_BARS) this._next();
    } else { this._ambient(sc, this.next, 1); this.next += 1; if (this.next - this.t0 >= sc.dur) this._next(); }
  }
  _ambient(sc, t, step) {
    const ctx = this.ctx, m = MOODS[sc.mood] || {}, nb = this.nb, tt = t - this.t0, rate = (fn) => 1 + (fn() * .5);
    // 風: いっしゅん強まったり弱まったり（1/fのゆれ）
    this.L.wind.fl.frequency.setTargetAtTime(300 + 400 * (this.fr() * .5 + .5), t, .8);
    if (m.wind) this._layerTo('wind', m.wind * (.6 + .8 * (this.fv() * .5 + .5)), t, .9);
    // 和音のおと(パッド): 8秒ごとに和音をかえて、ふわっと重ねる
    if (m.chords && Math.floor(tt / 8) !== Math.floor((tt - step) / 8) || (m.chords && tt < step)) { const ch = m.chords[Math.floor(tt / 8) % m.chords.length]; this._pad(ctx, t, ch.map(n => hz(n)), 9.5); }
    // やさしい鈴(ペンタトニック): 間隔は1/fでふぞろい
    while (m.notes && nb.bell < t + step) { const n = m.notes[Math.floor((this.fr() * .5 + .5) * m.notes.length * .999) % m.notes.length]; this._bell(ctx, nb.bell, hz(n), 3.6, m.bellG || .1); nb.bell += 1.3 + (1 + this.fj()) * 1.4; }
    // 水のしずく
    while (m.drops && nb.drop < t + step) { this._drop(ctx, nb.drop, m.drops); nb.drop += .12 + Math.random() * (1.6 / m.drops); }
    // 風鈴・チャイム(ふぞろいな高い音)
    while (m.chimes && nb.chime < t + step) { const ch = ['G6', 'A6', 'D7', 'E6', 'B6'][Math.floor(Math.random() * 5)]; this._chime(ctx, nb.chime, hz(ch)); nb.chime += 3 + Math.random() * 5; }
    // すず虫
    while (m.crickets && nb.cricket < t + step) { this._cricket(ctx, nb.cricket, m.crickets); nb.cricket += 1.6 + Math.random() * 3; }
    // ふくろう（遠くで、ときどき）
    while (m.owl && nb.owl < t + step) { this._owl(ctx, nb.owl); nb.owl += 28 + Math.random() * 20; }
    // 雨つぶ
    if (m.rain && Math.random() < .8) this._drip(ctx, t + Math.random(), 2600 + Math.random() * 2500, m.rain);
  }
  _pad(ctx, t, freqs, dur) { // ゆっくり立ちあがって、ゆっくり消える和音（やわらかい三角波）
    for (const f of freqs) for (const det of [-4, 4]) {
      const o = ctx.createOscillator(), e = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; lp.type = 'lowpass'; lp.frequency.value = 1100;
      e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.022, t + 2.6); e.gain.setValueAtTime(.022, t + dur - 2.4); e.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(lp); lp.connect(e); e.connect(this.bus); o.start(t); o.stop(t + dur + .1);
    }
  }
  _drop(ctx, t, amt) { const o = ctx.createOscillator(), e = ctx.createGain(), f0 = 500 + Math.random() * 700; o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 2, t + .05);
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.022 * Math.min(1.5, amt), t + .006); e.gain.exponentialRampToValueAtTime(.0001, t + .09); o.connect(e); e.connect(this.nat); o.start(t); o.stop(t + .12); }
  _drip(ctx, t, f, amt) { const o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.006 * amt, t + .002); e.gain.exponentialRampToValueAtTime(.0001, t + .03); o.connect(e); e.connect(this.nat); o.start(t); o.stop(t + .05); }
  _chime(ctx, t, f) { for (const [mul, g, dec] of [[1, .05, 3.2], [2.76, .022, 1.8], [5.4, .01, .8]]) { const o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * mul; e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .004); e.gain.exponentialRampToValueAtTime(.0001, t + dec); o.connect(e); e.connect(this.bus); o.start(t); o.stop(t + dec + .05); } }
  _cricket(ctx, t, amt) { // すず虫の「リーン、リーン」: 高い音を、ふるえるようにすこしずつ
    const f = 4300 + Math.random() * 500, o = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; const n = 3 + Math.floor(Math.random() * 3);
    e.gain.setValueAtTime(0, t); for (let k = 0; k < n; k++) { const a = t + k * .16; e.gain.linearRampToValueAtTime(.007 * amt, a + .05); e.gain.linearRampToValueAtTime(.0008, a + .14); }
    e.gain.linearRampToValueAtTime(0, t + n * .16 + .1); o.connect(e); e.connect(this.nat); o.start(t); o.stop(t + n * .16 + .2); }
  _owl(ctx, t) { // 遠くの「ホー、ホー」（やわらかい2音）
    for (const [dt, f] of [[0, 392], [.62, 330]]) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), e = ctx.createGain(); o.type = 'sine'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2; const g2 = ctx.createGain(); g2.gain.value = .25;
      e.gain.setValueAtTime(0, t + dt); e.gain.linearRampToValueAtTime(.05, t + dt + .12); e.gain.linearRampToValueAtTime(.03, t + dt + .38); e.gain.linearRampToValueAtTime(0, t + dt + .55);
      o.connect(e); o2.connect(g2); g2.connect(e); e.connect(this.bus); o.start(t + dt); o2.start(t + dt); o.stop(t + dt + .6); o2.stop(t + dt + .6); } }
  // 画面を最初にさわったとき（ブラウザの決まりで、音は操作のあとにしか出せない）
  unlock() { if (!this.enabled) return; this._init(); if (!this.ctx) return; this.ctx.resume?.(); this._start(); }
  _start() {
    if (this.running || !this.ctx) return; this.running = true; this.next = this.ctx.currentTime + .15;
    this.timer = setInterval(() => { // 先回りして、すこし先まで予約する
      if (this.bedGain) this.bedGain.gain.setTargetAtTime(.013 + .010 * (this.fv() * .5 + .5), this.ctx.currentTime, 1.5);
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
// 動作確認用: 画面に出さず、指定の場面を計算する（ピークの確認など）
export async function renderScene(si, seconds = 30) {
  const sr = 22050, ctx = new OfflineAudioContext(1, sr * seconds, sr), mb = new MusicBox(); mb.ctx = ctx; mb._graph(ctx, ctx.destination, .9); mb._layers(ctx); mb.si = si; mb.entering = true; mb.next = 0;
  let guard = 0; while (mb.next < seconds && guard++ < 5000) mb._advance();
  return ctx.startRendering();
}
export const renderOffline = (seconds = 30) => renderScene(0, seconds);
