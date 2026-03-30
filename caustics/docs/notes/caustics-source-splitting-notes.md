# Caustics Source Splitting Notes

## Goal

`single / vertex / strip` 같은 source layout 위에, "광원 분해 방식"을 별도 옵션으로 얹는다.

핵심은:

- source layout: 소스가 어디에 놓이는가
- source splitting: 광선/에너지/색을 source들 사이에 어떻게 나누는가

즉 layout과 splitting은 분리된 개념으로 본다.

## Candidate Splitting Modes

### 1. Off

- 분해하지 않음
- 모든 source가 같은 광원 묶음을 공유
- baseline 모드

### 2. Equal Split

- ray 수 또는 에너지를 source 개수만큼 균등 분배
- 가장 직관적인 기본 모드

### 3. Color / Frequency Split

- source마다 다른 색역 또는 파장 대역을 배정
- 시각적으로 가장 차이가 잘 보이는 모드

### 4. Weighted Split

- source별 가중치로 분배
- 예: `50 / 30 / 20`

### 5. Round Robin

- ray를 하나씩 번갈아 source에 할당
- 예: `A -> B -> C -> A`

### 6. Random

- 확률적으로 source에 할당
- seed 고정 여부는 별도 결정

## Recommended Initial Set

초기 버전은 아래 4개면 충분하다.

- `Off`
- `Equal`
- `Color`
- `Weighted`

`Round Robin`, `Random`은 실험 옵션으로 뒤에 붙여도 된다.

## Current Color System Summary

현재 색 시스템은 물리 기반 주파수 모델이 아니다.

지금은 각 ray에 대해 `baseHue`를 정하고, 그 값을 `hsla(...)`로 렌더링하는 방식이다.

색은 대략 아래 입력으로 결정된다.

- `config.t`: ray index를 0..1로 정규화한 값
- `flowOffset`: flow 애니메이션 오프셋
- `colorMode`: `rainbow`, `cyan`, `sunset`

주요 코드 위치:

- [renderer.js](/Users/eric/PG/math-visual/caustics/render/renderer.js)
- [simulator.js](/Users/eric/PG/math-visual/caustics/sim/simulator.js)

## Current Color Mapping

### rainbow

- `baseHue = (config.t * 360 + flowOffset * 0.5) % 360`
- 사실상 "무지개 hue 스캔"
- ray 순서에 따라 hue가 선형 분포

### cyan

- `baseHue = 180 + sin(config.t * 5 + flowOffset * 0.1) * 20`
- 청록 중심 좁은 진동
- 물리 주파수라기보다 스타일 변형

### sunset

- `baseHue = 10 + sin(config.t * 3 + flowOffset * 0.1) * 30`
- 주황/붉은 계열 좁은 진동
- 역시 스타일 변형

## Conclusion About Current Color Model

현재 색은:

- 주파수 비례 물리 모델이 아님
- wavelength 기반 굴절/분산 모델도 아님
- ray index 기반 hue 배치 + 약간의 보정/진동

즉 지금 시스템은 "무지개색하면서 보정한 시각화"에 더 가깝다.

## Design Note

나중에 `Color / Frequency Split`를 넣을 때는 두 가지 방향이 있다.

### A. Visual Split

- 지금처럼 hue band만 source별로 나눔
- 구현이 간단함
- 기존 렌더 구조와 잘 맞음

### B. Physical-ish Split

- source마다 파장 대역 의미를 부여
- 이후 반사/굴절/분산 차이까지 연결 가능
- 현재 코드 구조에선 아직 과함

초기 구현은 A가 맞다.

## Practical Recommendation

현재는 색 시스템을 바꾸지 말고 유지하는 것이 현실적이다.

이유:

- 이미 색 시스템과 source splitting은 서로 다른 축이다
- 둘을 동시에 바꾸면 비교가 흐려진다
- splitting 차이를 먼저 보는 편이 설계 판단이 쉽다

따라서 추천 순서는:

1. 현재 color system 유지
2. `Split Mode`만 추가
3. 우선 `Off / Equal / Hue Split / Weighted`부터 시작

나중에 정말 필요해질 때만 color system 자체를 분리하거나 교체한다.
