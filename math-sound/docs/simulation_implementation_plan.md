# 시뮬레이션 모드 확장 및 분류 계획서

본 문서는 `math-sound` 프로젝트의 `symphony-sim.js` 엔진을 활용하여, 기존의 정적 수식들을 동적인 시뮬레이션 모드로 전환하기 위한 분류 및 구현 계획을 담고 있습니다.

## 1. 개요
시뮬레이션 모드는 단일 수식을 그리는 것에 그치지 않고, 특정 변수를 변화시키며 여러 레이어를 중첩(Additive)하여 시각적·청각적 깊이를 만들어내는 모드입니다.

---

## 2. 시뮬레이션 대상 수식 목록 (Waves 10-Series)

기본 파형 10종을 선정하여 각 수식의 시뮬레이션 구조와 원리를 정의합니다.

| 파형명 | 기본 수식 (Basic) | 시뮬레이션 수식 (Simm) | 간단 설명 |
| :--- | :--- | :--- | :--- |
| **1. Sine Multi** | $y = \sin(x)$ | $y = \sum_{i=1}^{a} \sin(x + \frac{i \cdot b}{10})$ | 위상($b$)이 다른 $a$개의 사인파를 중첩하여 간섭 시뮬레이션 |
| **2. Square Fourier** | $y = \text{sgn}(\sin x)$ | $y = \sum_{n=0}^{a} \frac{\sin((2n+1)x)}{2n+1}$ | $a$개의 홀수 배음을 쌓아 사각파로 수렴하는 과정(깁스 현상) |
| **3. Sawtooth Fourier** | $y = \text{sawtooth}(x)$ | $y = \sum_{n=1}^{a} \frac{\sin(nx)}{n}$ | 모든 정수 배음을 $a$단계까지 합산하여 날카로운 톱니파 형성 |
| **4. Triangle Fourier** | $y = \text{triangle}(x)$ | $y = \sum_{n=0}^{a} (-1)^n \frac{\sin((2n+1)x)}{(2n+1)^2}$ | 배음의 제곱 역수를 더해 부드러운 삼각파를 만들어가는 과정 |
| **5. Pulse PWM** | $y = \text{pulse}(x, 0.5)$ | $y = \text{sgn}(\sin x + \cos a)$ | 임계값($a$)을 변화시켜 펄스 폭이 변하는 PWM 현상 시뮬레이션 |
| **6. Steppy Quantize** | $y = \text{step}(x)$ | $y = \frac{\lfloor a \cdot \sin(x) \rfloor}{a}$ | 사인파를 $a$단계로 양자화하여 디지털 계단(Quantization) 표현 |
| **7. Tanh-Tan Clip** | $y = \tanh(\tan x)$ | $y = \tanh(a \cdot \tan x)$ | 증폭 계수 $a$를 조절하여 파형이 수직으로 깎이는 클리핑 시뮬레이션 |
| **8. Damped Decay** | $y = e^{-|x|} \sin x$ | $y = e^{-a \cdot |x|} \sin(b \cdot x)$ | 감쇄율 $a$와 주파수 $b$의 상호작용으로 소멸하는 물리적 진동 |
| **9. Chaos Interference** | $y = \sin 5x \cos 3x$ | $y = \sin(ax) \cos(bx)$ | 두 주파수 $a, b$의 곱으로 만들어지는 복잡한 간섭 패턴 |
| **10. Soft Harmonics** | $y = \tanh(\sin x)$ | $y = \sum_{i=1}^{a} \frac{\tanh(\sin(i \cdot x))}{i}$ | 부드러운 제한이 걸린 배음들을 중첩하여 풍성한 배음 구조 생성 |

---

## 3. 구현 전략

### 3.1 변수 확장 (1개 → 2개)
현재 `symphony-sim.js`는 주로 변수 `a` 하나만 제어하도록 설계되어 있습니다. 이를 확장하여 `a`, `b` 두 개의 독립적인 변수를 시뮬레이션 루프에서 제어할 수 있도록 구조를 변경합니다.

### 3.2 레이어 중첩 로직 최적화
*   **Additive Blending**: 다크 모드에서는 `lighter` 블렌딩 모드를 사용하여 레이어가 겹칠수록 빛나는 효과를 줍니다.
*   **Fade Out**: 오래된 레이어는 서서히 투명해지도록 처리하여 동적인 잔상 효과를 구현합니다.

### 3.3 UI 대응
*   HUD에서 현재 시뮬레이션 중인 변수 1과 변수 2의 값을 실시간으로 표시합니다. (예: `a = 1.2, b = 45.0`)

---

## 4. 다음 단계
1.  `symphony-sim.js` 내부에 2개 변수(`a`, `b`)를 지원하는 공통 렌더링 함수 작성.
2.  가장 효과가 극적인 **Square Fourier** 또는 **Sine Multi**를 첫 번째 확장 대상으로 구현.
3.  사용자 피드백에 따라 나머지 목록 순차 적용.
