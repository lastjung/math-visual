# Math Sound Visualizer 🎵

수학 함수를 소리와 그래프로 동시에 표현하는 시각화 도구입니다.

> Inspired by [zackdmath](https://www.youtube.com/@zackdmath) "how math functions sound" series

![Demo](https://img.shields.io/badge/Functions-58-blue) ![Tech](https://img.shields.io/badge/Vanilla-JS-yellow) ![Audio](https://img.shields.io/badge/Web-Audio%20API-green)

## 🎯 Features

- **실시간 그래프 그리기**: 수학 함수를 Canvas에 애니메이션으로 렌더링
- **함수 → 소리 변환**: Web Audio API를 사용해 함수를 청각적으로 표현
- **파형 시각화**: 실시간 오디오 파형 표시
- **수식 렌더링**: KaTeX로 LaTeX 수식 표시
- **58개 프리셋 함수**: 6개 카테고리로 분류
- **카테고리별 색상 구분**: 직관적인 UI
- **키보드 단축키**: Space, ←, → 지원

---

### 🎹 Live Performance & MIDI Mixer

라이브 믹서 기능을 통해 여러 수학 함수를 중첩하여 자신만의 사운드를 연주할 수 있습니다.
![Live Mixer Mockup](../assets/live_mixer_mockup.png)

---

## 📐 Included Functions (58개)

### 🎵 Basic (기초 파형) - 10개

| 함수            | 수식                                         | 설명              |
| --------------- | -------------------------------------------- | ----------------- |
| **Sine**        | `f(x) = sin(2πx)`                            | 기본 사인파       |
| **Cosine**      | `f(x) = cos(2πx)`                            | 기본 코사인파     |
| **Square**      | `f(x) = sign(sin(2πx))`                      | 사각파            |
| **Sawtooth**    | `f(x) = 2(x - ⌊x + 0.5⌋)`                    | 톱니파            |
| **Triangle**    | `f(x) = 2\|2(x - ⌊x+0.5⌋)\| - 1`             | 삼각파            |
| **Pulse**       | `f(x) = pulse(x, 30%)`                       | 펄스파            |
| **Steppy Wave** | `f(x) = cos(3x) + sgn(sin(6x)) + 0.5·tan(x)` | 계단형 복합 파형  |
| **Tanh-Tan**    | `f(x) = 3tanh(tan(x))`                       | 탄젠트 시그모이드 |
| **Damped**      | `f(x) = e^(-0.5\|x\|)·sin(8x)`               | 감쇠 진동         |
| **Chaos**       | `f(x) = sin(5x)cos(3x) + 0.5sin(11x)`        | 복합 카오스 함수  |

### 🌸 Curves (기하학 곡선) - 13개

| 함수            | 수식                           | 설명              |
| --------------- | ------------------------------ | ----------------- |
| **Lissajous**   | `x=3sin(3t), y=2sin(4t)`       | 리사주 곡선       |
| **Rose**        | `r = cos(4θ)`                  | 장미 곡선         |
| **Heart**       | `r⃗(t) = ⟨16sin³t, ...⟩`       | 하트 곡선         |
| **Cardioid**    | `r = 1 - cos(θ)`               | 심장형 곡선       |
| **Rose 4**      | `r = cos(4θ)`                  | 4잎 장미          |
| **Rose 3**      | `r = sin(3θ)`                  | 3잎 장미 (n=3)    |
| **Lissajous 2** | `r⃗(t) = ⟨sin(3t), sin(4t)⟩`   | 다른 비율 리사주  |
| **Butterfly**   | `r = eˢⁱⁿᶿ - 2cos(4θ) + ...`   | 나비 곡선         |
| **Spiral**      | `r = 0.1θ`                     | 아르키메데스 나선 |
| **Lemniscate**  | `r² = cos(2θ)`                 | 연접선 (Infinity) |
| **Epicycloid**  | `x=3cost-cos3t, y=3sint-sin3t` | 에피사이클로이드  |
| **Limaçon L**   | `r = 5 - 9cos(θ)`              | 루프 리마송       |
| **Mic Pattern** | `r = 1 - cosθ sin3θ`           | 마이크 지향성     |

### 💠 Art (수학적 예술) - 7개

| 함수            | 수식                      | 설명            |
| --------------- | ------------------------- | --------------- |
| **Sunflower**   | `r = -8sin(32θ)`          | 64개 잎의 장미  |
| **Limaçon 3**   | `r = 5 - 9cos(3θ)`        | 복합 리마송     |
| **Star Curve**  | `r = sin2θ - 6(cos(6θ))³` | 별 모양 곡선    |
| **Explosion**   | `r = 3(cos(14θ))³`        | 폭발하는 고주파 |
| **Fairy**       | `r = (sin2θ)(cos2θ) / θ`  | 요정 날개 모양  |
| **Trig Chaos**  | `r = -4sin(cos(tanθ))`    | 복합 삼각함수   |
| **Split Pulse** | `r = -sin(10θ)/2cosθ`     | 파동분할 곡선   |

### 🔊 Synth (소리 합성) - 16개

| 함수               | 수식                                              | 설명               |
| ------------------ | ------------------------------------------------- | ------------------ |
| **Trumpet**        | `f(x) = sin(20x) / (\|x\| + 0.1)`                 | 토리첼리 트럼펫    |
| **FM Synth**       | `f(x) = sin(6x + sin(18x))`                       | 주파수 변조 합성   |
| **AM Synth**       | `f(x) = sin(8x)·(1 + 0.5sin(2x))`                 | 진폭 변조 합성     |
| **Harmonics**      | `f(x) = Σ sin(4nx)/n`                             | 배음 합성          |
| **Beating**        | `f(x) = sin(20x)·sin(x)`                          | 맥놀이 현상        |
| **Beating 2**      | `f(x) = 12(sin(x-30) + sin(0.9(x-30)))`           | 복합 맥놀이        |
| **Vibration**      | `f(x) = x · sin(x)`                               | 진폭 선형 변조     |
| **Arctan Wave**    | `f(x) = 3arctan(3sin(2x))`                        | 소프트 사각파      |
| **Monster Wave**   | `(√(4-x²)·(0.2+\|sin(2.3x)\|)+3e⁻¹⁵ˣ²)·sin(100x)` | 복합 AM 엔벨로프   |
| **Diamond**        | `f(x) = (2-\|x\|)·sin(120x)`                      | 다이아몬드 파형    |
| **FM Synth 2**     | `f(x) = sin(6x + 2sin(12x))`                      | 복합 FM 합성       |
| **Wobble Bass**    | `f(x) = sin(x·(20 + 10sin(2x)))`                  | FM+AM 변동 베이스  |
| **Gated Noise**    | `f(x) = sin(100x)·⌊sin(x)+1.1⌋`                   | 리드미컬 노이즈    |
| **Warp Wave**      | `f(x) = sin(10sin(x))`                            | 비선형 웨이브 워핑 |
| **Recursive Sine** | `f(x) = sin(x+sin(x+sin(x)))`                     | 재귀적 사인 파동   |
| **Chirp**          | `f(x) = sin(4x²)`                                 | 처프 신호          |

### 📐 Math (수학적 함수) - 7개

| 함수               | 수식                                 | 설명               |
| ------------------ | ------------------------------------ | ------------------ |
| **Fourier Square** | `f(x) = -24/π Σ sin((2n+1)x)/(2n+1)` | 사각파 푸리에 급수 |
| **Complex Wave**   | `f(x) = 24/π Σ sin((4n+1)x)/(n+1)`   | 복합 푸리에 파형   |
| **Parabola**       | `f(x) = x²`                          | 포물선 (이차함수)  |
| **Gaussian**       | `f(x) = e^(-x²)`                     | 가우시안 (종 모양) |
| **Sinc**           | `f(x) = sin(4πx)/(4πx)`              | 싱크 함수          |
| **Logistic**       | `f(x) = 1/(1 + e^(-2x))`             | 로지스틱 함수      |
| **Hyperbolic**     | `r⃗(t) = ⟨cosh(t/2), sinh(t/2)⟩`     | 쌍곡선 함수        |

### ⚡ Bytebeat (비트 연산) - 5개

| 함수            | 수식                               | 설명              |
| --------------- | ---------------------------------- | ----------------- |
| **Stereo Love** | `f(t) = t·((t>>12\|t>>8)&63&t>>4)` | Stereo Love 테마  |
| **Classic**     | `f(t) = t & (t >> 8)`              | 클래식 바이트비트 |
| **Melody**      | `f(t) = t·((t>>12\|t>>8)&63&t>>4)` | 멜로디 패턴       |
| **XOR**         | `f(t) = t ^ (t >> 4)`              | XOR 패턴          |
| **Complex**     | `f(t) = (t\*5&t>>7)\|(t\*3&t>>10)` | 복합 패턴         |

---

## 🚀 Quick Start

### 로컬 실행

```bash
# 폴더로 이동
cd math-sound

# 간단한 HTTP 서버 실행
python3 -m http.server 8080

# 또는 Node.js 사용
npx serve .
```

브라우저에서 `http://localhost:8080` 접속

### 직접 열기

`index.html` 파일을 브라우저로 직접 열어도 됩니다.

---

## 🛠️ Tech Stack

| 기술                   | 용도                    |
| ---------------------- | ----------------------- |
| **Vanilla JavaScript** | 프레임워크 없이 순수 JS |
| **Web Audio API**      | 사운드 생성 및 분석     |
| **Canvas 2D**          | 그래프 렌더링           |
| **KaTeX**              | 수식 렌더링 (CDN)       |

---

## 📁 Project Structure

```
math-sound/
├── index.html        # 메인 페이지
├── style.css         # 스타일시트 (카테고리별 색상)
├── app.js            # 메인 엔트리 (이벤트 조율)
├── modules/          # 기능별 모듈
│   ├── audio.js      # 오디오 엔진
│   ├── constants.js  # 상수 및 함수 데이터
│   ├── renderer.js   # 캔버스 렌더러
│   └── state.js      # 앱 전역 상태
└── README.md         # 이 파일
```

---

## 🎮 Controls

### 버튼

| 버튼   | 기능            |
| ------ | --------------- |
| ▶ / ❚❚ | 재생 / 일시정지 |
| ■      | 정지            |
| ↺      | 리셋            |

### 키보드 단축키

| 키      | 기능               |
| ------- | ------------------ |
| `Space` | Toggle Play/Pause |
| `←`     | Previous function |
| `→`     | Next function     |
| `Enter` | Add to Simulation Box |

### ⌨️ S-System Shortcuts (Advanced)

| Shortcut | Function |
| -------- | -------- |
| `S + 1`  | **Random Box**: Start/Stop Random Simulation |
| `S + 2`  | **Simulation Play**: Play Simulation Box (1 loop each) |
| `S + 3`  | **Box Window**: Toggle Simulation Box Visibility |

### 슬라이더

| 슬라이더 | 기능                       |
| -------- | -------------------------- |
| 🔊       | 볼륨 조절 (0-100%)         |
| ⏱        | 재생 속도 조절 (0.2x - 2x) |

---

## 🎨 카테고리별 색상

| 카테고리  | 색상             |
| --------- | ---------------- |
| 🎵 Basic  | 보라색 (#8b5cf6) |
| 🌸 Curves | 핑크색 (#ec4899) |
| 💠 Art    | 인디고 (#6366f1) |
| 🔊 Synth  | 주황색 (#f59e0b) |
| 📐 Math   | 청록색 (#10b981) |
| ⚡ Byte   | 빨간색 (#ef4444) |

---

## 🔊 사운드 튜닝 (임의 조정 기록)

사용자 청감상 거친 고역을 줄이기 위해 아래 설정을 기본값으로 적용했습니다.

- 저역 보강: `lowshelf` +4.5dB @ 200Hz
- 고역 감쇠: `highshelf` -4.5dB @ 3.5kHz
- 로우패스: 3.5kHz, Q=0.85
- 컴프레서: threshold -26dB, knee 20, ratio 3.5:1, attack 0.005s, release 0.18s
- 소프트 클립: `WaveShaper` tanh 곡선 (oversample 4x)
- 고주파 자동 감쇠: 주파수가 높을수록 gain 감소
- 루프 클릭 감소: 버퍼 양끝 8ms 페이드 인/아웃

---

## 📝 References

- [zackdmath YouTube](https://www.youtube.com/@zackdmath) - "how math functions sound" 시리즈
- [html5bytebeat](https://github.com/greggman/html5bytebeat) - Bytebeat 개념 참고
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - 오디오 생성
- [KaTeX](https://katex.org/) - 수식 렌더링

---

## 📜 License

MIT License
