# 시뮬레이션 모드 확장 및 분류 계획서 (Waves+ & Curves+)

본 문서는 `math-sound` 프로젝트의 시뮬레이션 엔진을 확장하기 위한 최종 분류 및 구현 계획을 담고 있습니다.

---

## 1. 개요 (Simulation Strategy)
- **Smooth Transition**: 모든 시뮬레이션은 `default` 값에서 시작하여 부드러운 사인파 궤적을 따라 변동합니다.
- **Dual-Variable Control**: 변수 `a`와 `b`를 통해 파형과 곡선의 기하학적 성질을 독립적으로 시뮬레이션합니다.

---

## 2. Waves 10-Series (완료)
10종의 기본 파형에 대해 진폭(a)과 주파수(b) 중심의 시뮬레이션을 완료했습니다.

---

## 3. Curves 19-Series (진행 중)
`constants.js`의 원본 순서를 100% 준수하여 총 19종의 곡선을 시뮬레이션화합니다.

| 순번 | 곡선명 (ID) | 변수 a (Shape/Scale) | 변수 b (Motion/Freq) | 타입 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Cupid Heart | 하트 크기 (Size) | 화살 이동 속도 | Parametric |
| 2 | Cupid Arrow | 화살 길이 (Length) | 흔들림 (Wobble) | Parametric |
| 3 | Love Heart | 열정 진폭 (Passion) | 고동 (Heartbeat) | Cartesian |
| 4 | Crystal Heart | 명확도 (Clarity) | 밀도 (Density) | Parametric |
| 5 | Broken Heart | 균열 간격 (Gap) | 고통 진동 (Pain) | Parametric |
| 6 | Classic Heart | 전체 스케일 (Scale) | 맥박 (Pulse) | Parametric |
| 7 | Oscillating Heart | 파동 진폭 (Amp) | 파동 주파수 (Freq) | Cartesian |
| 8 | Lissajous | X축 주파수 (X-Freq) | Y축 주파수 (Y-Freq) | Parametric |
| 9 | Rose | 크기 (Scale) | 꽃잎 개수 (Petals) | Polar |
| 10 | Cardioid | 크기 (Size) | 형태 왜곡 (Distort) | Polar |
| 11 | Rose 4 | 꽃잎 개수 (Petals) | 회전 (Rotation) | Polar |
| 12 | Rose 3 | 크기 (Scale) | 형태 계수 (Shape) | Polar |
| 13 | Limaçon Loop | 기본 반경 (Base) | 루프 비율 (Loop) | Polar |
| 14 | Mic Pattern | 밀도 (Density) | 회전 (Rotation) | Polar |
| 15 | Lemniscate | 가로 폭 (Width) | 세로 높이 (Height) | Parametric |
| 16 | Lissajous 2 | X-비율 (X-Ratio) | Y-비율 (Y-Ratio) | Parametric |
| 17 | Butterfly | 날개 크기 (Wings) | 날갯짓 (Flap) | Polar |
| 18 | Spiral | 성장 속도 (Growth) | 나선 밀도 (Density) | Polar |
| 19 | Epicycloid | 외반경 (Outer R) | 내반경 (Inner r) | Parametric |

---

## 4. 구현 표준 (Technical Standard)
- **Coordinate Systems**: Cartesian, Parametric, Polar 세 가지 좌표계를 모두 지원하는 범용 렌더링 엔진 사용.
- **Audio Mapping**: 곡률(Curvature)과 속도(Velocity)를 실시간 분석하여 곡선의 형태에 맞는 입체적 사운드 생성.
- **Transition**: Phase A(변수 a)와 Phase B(변수 b) 전환 시 불연속성을 제거한 사인파 보간 적용.
