// もちたモデルの設定（README参照）。GLBは glTF Y-up、+Zが正面、床 Y=0。
export const MOCHITA = {
  standing: 'assets/mochita_rigged.glb',   // 骨組み付き（待機・歩き・走りの3つの動きが入っている）
  rigged: true, smooth: 0, normalScale: 1, clips: { idle: 'Idle', walk: 'Walk', run: 'Run' },
  walk: 'assets/mochita_rigged.glb',
  rawHeight: 1.9026549,                          // 元サイズの高さ(maxY)。表示倍率 = height / rawHeight
  height: 0.95,                                  // 箱庭での表示の高さ[m]
  walkClip: 'Walk',
  walkLoopSec: 1.0,
  walkRawSpeedZ: 0.77,                            // 足が滑らない前進速度（元サイズ/秒）= 足の振り幅0.2×4÷1秒
  playRate: 1.35,                                   // タップで歩くときの再生速度（トテトテ。前進速度は walkSpeed() で連動）                           // 元サイズで滑らない前進速度 (+Z 単位/秒)
};
// 表示サイズと再生速度に連動した、足が滑らない前進速度 [m/s]（h=0.95, rate=1 → 約0.04709）
export const walkSpeed = (h = MOCHITA.height, rate = 1) => MOCHITA.walkRawSpeedZ * (h / MOCHITA.rawHeight) * rate;
