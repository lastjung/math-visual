# Math Symphony Master Score Book

이 문서는 `math-sound` 프로젝트에 통합된 7개 카테고리, 총 45개 수식의 제목, 동작 수식, 그리고 실시간 변수(Parameter) 규칙을 상세히 기록합니다.

---

## 🚀 7대 카테고리 통합 현황 (Total: 45 Functions)

*   **✨ Amazing (5곡)**: 원조 'Amazing Animations'의 공명과 격자 왜곡.
*   **💖 Beautiful (10곡)**: 기하학적 미학과 듀얼 컬러 렌더링.
*   **🎼 Harmonic (6곡)**: 고밀도 파라메트릭 망과 조화로운 궤적.
*   **🌀 Fusion (7곡)**: 극좌표와 음함수의 유기적 결합.
*   **✨ Hyper (5곡)**: 2025 에디션의 초고밀도 로고 시리즈.
*   **👹 Insane (7곡)**: 프랙탈 간섭과 극한의 수식 조합.
*   **✨ Fantastic (5곡)**: 최대공약수(GCD) 기반의 정수론 축제.

---

## 🎼 ✨ Amazing 시리즈 (5곡)

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **Standard Resonance** | `y = cos(ax)` | `a = loopIndex + 1` |
| **Expanding Resonance** | `y = (x/5)·cos(ax)` | `a = loopIndex + 1` |
| **Envelope Modulation** | `y = cos x · cos(ax)` | `a = loopIndex + 1` |
| **Grid Distortion** | `cos(ax) = sin(ay)` | `a = (loopIndex % 15) + 1` |
| **Radial Whirlpool** | `y = 4.8·cos(axy / (x²+y²+0.1))` | `a = (loopIndex % 20) + 5` |

---

## 💖 More Beautiful 시리즈 (10곡)

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **The Signum Glitch** | `y = sign(sin(ax/4))` | `a = (loopIndex % 10) + 1` |
| **Dancing Sign Trace** | `x = t·cos(0.1a), y = sign(sin at)` | `a = (loopIndex % 10) + 1` |
| **Oscillating Diagonal** | `x = t, y = t + sin(at)` | `a = (loopIndex % 15) * 0.2` |
| **Mind Blowing Spinny** | `r = sign(cos(nθ+3v)) + sin(vθ/20)` | `v = (loopIdx % 10) * 0.5, n = 6` |
| **Punk Hair Laser** | `y = x·sign(csc(tan(x+v)+v)) + cos x` | `v = (loopIndex % 8) * (π/4)` |
| **Up and Down** | `y = v6·sign(v6x-y) + cos(v6+x)` | `v6 = -8 + (loopIdx % 16 / 15) * 16` |
| **Jagged Sine GCD** | `y = gcd(v11x)·sign(sin x) - sin x` | `v11 = (loopIdx % 10) + 1` |
| **Modulo Jagged Wave** | `y = 2·sign(sin(x-v12)) + mod(8x, v12) - sin(x+v12)` | `v12 = 0.19 + (loopIdx % 12) * 0.18` |
| **Shuriken Star** | `r = sign(cos(kθ-v14)) + sin(v14+(k.05)θ)cos v14` | `v14 = (loopIdx % 6) * 1.5, k = 5` |
| **Layered Beauty** | `r = l·sign(cos(3θ-lv)) + sin(v+3θ+l) - cos v` | `v = (loopIdx % 10) * 0.6, l = [2,4,6,8,10]` |

---

## 🎻 🎼 Harmonic 시리즈 (6곡)

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **Harmonic Intro** | `x = cos t, y = sin(at/2)` | `a = (loopIdx % 15) + 1` |
| **High-Freq Web** | `x = cos t, y = sin(at)` | `a = 50 + (loopIdx % 10) * 10` |
| **Harmonic Ovals** | `x = sin(vt) + cos t, y = cos t` | `v = 0.95 + (loopIdx % 10) * 0.01` |
| **Tangent Mesh** | `x = tan(at), y = sec t + sin(bt)` | `a = 15 + loopIdx%10, b = 30 + loopIdx%15` |
| **The Crown** | `x = tan t, y = csc t · tan(vt) - sin t` | `v = 0.9 + (loopIdx % 20) * 0.01` |
| **Extreme harmonic** | `x = tan(at) + cos t, y = tan t · sin(bt)` | `a = 20+(lp%10)*5, b = 40+(lp%10)*5` |

---

## 🌀 Fusion 시리즈 (7곡)

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **Cinematic Galaxy** | `r = sec(1.2θ+vs) + sin(3vs + cos(1.2θ+sin 1.2θ))` | `vs = (loopIdx % 20) * 0.314` |
| **Tan Twist Mesh** | `x = tan(2t+v) + cos 4t, y = sin 3t + cos 5t` | `v = (loopIdx % 12) * 0.52` |
| **Secant Oscillator** | `x = sec t, y = sin(4t + cos 2t + sin 3t + v)` | `v = (loopIdx % 10) * 0.628` |
| **Tan Rise Ridge** | `y = tan(x+v) - sin(10x + cos x)` | `v = (loopIdx % 15) * 0.418` |
| **Geometric Shift** | `sin x = v·cos y + sin(2x+v)` | `v = -2.5 + (loopIdx % 20) * 0.25` |
| **Pulsating Petal** | `r = sin(v + 4θ) + v` | `v = -1.5 + (loopIdx % 15) * 0.2` |
| **Star Core** | `2r = 6sin(1.2θ) - cos(6θ+v)` | `v = (loopIdx % 20) * 0.314` |

---

## ✨ ✨ Hyper 시리즈 (5곡)

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **Millennial Rose** | `r = sin(2025θ / (100-v))` | `v = (loopIndex % 30) * 0.1` |
| **Hyper Lissajous** | `x = 4cos(sin(20t+v)+v), y = sin(25t+v)` | `v = (loopIndex % 20) * 0.314` |
| **Amazing Clover** | `r = sin(2.025θ+v) + cos(1.05θ)` | `v = (loopIndex % 20) * 0.314` |
| **Reality Bender** | `y = gcd(2025x) % 5 + v sin x + ceil(vx)/5` | `v = (loopIndex % 15) * 0.1` |
| **Deadpool Geometry** | `r = |sin(θ+l-v) - ceil(2sin(2θ+v+1.55))|` | `v = (lp%20)*0.314, l = 2.025` |

---

## 👹 INSANE 시리즈 (7곡)

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **Trig Tomfoolery** | `r = sin(2θ + sin(4θv))` | `v = ((loopIdx % 19) + 1) * 0.314` |
| **Secant Plot Twist** | `r = sec(3θ + 2πv·sin θ)` | `v = (loopIdx % 20) * 0.314` |
| **Inverse Fractal** | `r = v·arcsin(sin(0.8θv))` | `v = (loopIdx % 15) * 0.418` |
| **Unlimited Star** | `r = exp(sin(2θv + 2) + 1.5)` | `v = (loopIdx % 10) * 0.628` |
| **Arachnid Web** | `r = 9·tanh(θ/10 + sin(99θv))` | `v = (loopIdx % 20) * 0.314` |
| **Power of the Sun** | `r = 5·exp(-|v·arctan(0.5tan(6θ+2πv))|) + 2` | `v = (loopIdx % 20) * 0.314` |
| **The Masterpiece** | `r = 6sin(1.2θ+2πv) - cos 6θ` | `v = (loopIdx % 30) * 0.209` |

---

## ✨ FANTASTIC 시리즈 (5곡) - NEW!

| 제목 | 수식 (Formula) | 변수 규칙 (Parameters) |
|---|---|---|
| **Relative Primality** | `gcd(vx, vy) = 1` | `v = (loopIdx % 10) + 2` |
| **Cellular Trigonometry** | `gcd(10tan y, 10v·sin x) = 1` | `v = (loopIdx % 15) * 0.1` |
| **Interference Mesh** | `gcd(5x/(sin y+sin x), 5yv) = 1` | `v = (loopIdx % 20) * 0.1` |
| **Fantastic Grid** | `gcd(5(sec x+tan y), 5sin(9x+v)) = 1` | `v = (loopIdx % 15) * 0.5` |
| **Ultimate GCD** | `gcd(3(csc x + tan y/sin(2x+v)), 3(sin x·y + cos y·tan x)) = 1` | `v = (loopIdx % 20) * 0.314` |

---

## 🛠 공통 기술 사양

*   **해상도(Resolution)**: 심포니 전 카테고리 대상 **4,000 steps** 초정밀 렌더링.
*   **넥스트 타깃(Next Target)**: HUD 배지에 현재 변수와 **다음 루프의 목표값** 예고 표시 `(v = A) → B`.
*   **음수 반지름 보정**: `Deadpool Geometry` 등 복합 수식 대상 대칭형 절대값 복원.
*   **듀얼 컬러**: `isSpinny` 곡 한정 **Indigo/Fuchsia** 교차 셰이더 효과.
