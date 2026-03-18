# Goldberg Sphere Sort Notes

## Goal

Goldberg sphere(geodesic sphere / Goldberg polyhedron) 위의 face들에 무지개 랜덤 색을 칠한 뒤,
북극-남극 기준으로 정렬하는 실험 아이디어 메모.

## Geometry Terms

- 고정된 축구공 기본형: `truncated icosahedron`
- 더 일반적이고 확장 가능한 구면 다면체 계열: `Goldberg polyhedron`
- 계속 세분 가능한 구면 메시 계열: `geodesic sphere`

## Basic Coloring Idea

- 각 face에 초기 랜덤 hue를 부여한다.
- saturation / lightness는 고정하고 hue만 랜덤으로 시작한다.
- 이후 정렬은 색상 자체를 바꾸는 것이 아니라, 색이 face 슬롯 위를 이동하는 방식으로 본다.

## North-South Sort Key

가장 자연스러운 1차 정렬 키:

- 각 face 중심점 `center`를 구한다.
- 북극축 `northAxis`를 정한다. 예: `(0, 0, 1)`
- `theta = acos(dot(normalize(center), northAxis))`
- `theta` 오름차순으로 정렬하면 북극 -> 남극 순서가 된다.

이 방식이 가장 수학적으로 깔끔하다.

## Easier Approximation

더 단순한 근사:

- face 중심점의 `z`값으로 정렬
- `z` 내림차순이면 북극 -> 남극

이건 구현은 쉽지만, 엄밀하게는 `theta` 방식보다 덜 직접적이다.

## Better Surface-Aware Option

구면 메시 이웃관계를 더 살리고 싶으면:

- 북극 face를 시작점으로 잡는다.
- edge adjacency graph를 만든다.
- graph distance 또는 geodesic-like distance 순으로 정렬한다.

이 방식은 메시 구조를 더 잘 보존하지만 구현은 더 무겁다.

## Recommended First Version

1. Goldberg sphere 생성
2. 각 face center 계산
3. 각 face에 랜덤 hue 부여
4. `theta` 기준으로 face 순서를 정렬
5. 색이 북극 -> 남극 방향으로 재배치되는 애니메이션 구현

## Sort Variants

- `Latitude Sort`
  - `theta`만 기준으로 북극 -> 남극 정렬
- `Band + Longitude Sort`
  - 위도 band로 먼저 나누고, 각 band 안에서 경도로 정렬
- `Geodesic Distance Sort`
  - 북극 시작 face 기준 adjacency 거리 정렬

## Visual Recommendation

- 첫 버전은 `theta` 기반 정렬이 가장 좋다.
- 시각적으로는 face 슬롯은 고정하고, 색만 재배치하는 방식이 `sort-color`와 잘 맞는다.
- radix나 quick처럼 정렬 단계별로 pair / partition 강조도 확장 가능하다.

## Project Direction

권장 방향:

- 기존 Goldberg pathfinding 코드와 직접 합치지 않는다.
- Goldberg geometry / mesh / coloring 로직만 참고하거나 재사용한다.
- 정렬 엔진과 transport UI는 `sort-color` 쪽 방식을 가져온다.
- 새 프로젝트나 새 실험 이름은 `sort-sphere`가 적절하다.

즉 구조 결론은:

- geometry source: 기존 Goldberg 구현
- sorting system: `sort-color` 스타일
- app surface: 독립 프로젝트 `sort-sphere`

이유:

- pathfinding 목적과 sorting 목적이 다르다.
- 기존 pathfinding 프로젝트를 덜럽히지 않는다.
- sphere 전용 정렬 실험이라는 정체성이 더 분명해진다.
