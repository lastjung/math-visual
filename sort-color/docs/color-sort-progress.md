# Color Sort Platform Progress

## Status

- Current phase: `Phase 1 - Boundary Lock`
- Purpose: cardioid 전용 geometry 의존이 현재 어디까지 퍼져 있는지 먼저 고정
- Rule: 이 단계에서는 무리하게 코드 분리하지 않고, dependency inventory를 정확히 만든다

---

## Phase 1 - Boundary Lock

### Goal

- sorting engine 입력 경계 고정
- render가 geometry를 어디서 다시 만들고 있는지 확인
- cardioid-specific math가 어떤 파일에 남아 있는지 목록화

### Files Reviewed

- `/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle.js`
- `/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js`
- `/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js`

### Current Dependency Findings

#### 1. Geometry core is still embedded in the cardioid case

현재 geometry 계산의 핵심은 아래 함수들이다.

- `circlePoint(...)`
- `circlePointByIndex(...)`
- `lineVisual(...)`

위치는:

- [`cardioid_circle.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle.js#L676)

즉 cardioid 수학 본체는 아직 메인 case 파일 안에 있다.

#### 2. Sorting is still generating geometry directly

현재 sorting 쪽의 실제 geometry 생성 중심은:

- `buildChordData(n, m, radius, cx, cy)`

위치는:

- [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js#L331)

이 함수 안에서:

- `circlePoint(...)`
- `circlePointByIndex(...)`
- `lineVisual(...)`

를 직접 호출해 chord list를 만든다.

즉 sorting layer가 아직 provider 결과를 받는 구조가 아니라,
자체적으로 geometry를 조립하는 구조다.

#### 3. Render is also regenerating geometry directly

렌더는 `getViewState()`에서:

- `buildChordData(n, m, radius, cx, cy)`

를 직접 호출한다.

위치는:

- [`cardioid_circle_render.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js#L46)

그리고 sorting 중에는 `drawChords()` 안에서 다시:

- `circlePoint(...)`
- `circlePointByIndex(...)`
- `lineVisual(...)`

를 사용해 active line geometry와 color를 재계산한다.

위치는:

- [`cardioid_circle_render.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js#L75)

즉 render 역시 geometry provider를 소비하는 쪽이 아니라,
geometry를 다시 직접 계산하는 쪽이다.

#### 4. Sort plan creation still depends on case state instead of provider output

`buildSortPlanForCurrentState()`는 아래 값을 직접 읽는다.

- `pointCount`
- `multiplier`
- `canvas.width`
- `canvas.height`

위치는:

- [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js#L29)

즉 sort planner가 아직 pure planner가 아니다.
현재는 provider output 대신 case state와 canvas layout에 직접 묶여 있다.

#### 5. Color extraction is mixed into sorting preparation

정렬 키 준비는 현재 `buildSortPlanForCurrentState()` 안에서:

- `getHueKey(...)`
- `getChannelBucket(...)`
- `lightnessBucket`
- `saturationBucket`

형태로 함께 만들어진다.

위치는:

- [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js#L51)

즉 color key extraction도 아직 sorting preparation에 섞여 있다.

### Boundary Summary

현재 경계는 아직 이렇게 섞여 있다.

- `cardioid_circle.js`
  - cardioid math
  - UI controls
  - learning modes
  - animation state
- `cardioid_circle_sorting.js`
  - sort planner
  - chord geometry build
  - color key preparation
  - sort overlay
- `cardioid_circle_render.js`
  - render
  - chord geometry rebuild
  - active line color recompute

즉 현재 구조는:

`geometry -> sorting -> rendering`

이 분리된 것이 아니라,

`geometry + sorting + rendering`

이 다시 서로 엮여 있는 상태다.

### Immediate Refactor Targets

1차 분리 후보는 명확하다.

#### Target A. Cardioid Geometry Provider

후보 책임:

- `circlePoint`
- `circlePointByIndex`
- `lineVisual`
- `buildChordData`

이것들을 묶어 첫 번째 `cardioid provider`로 올리는 것이 가장 자연스럽다.

#### Target B. Sort planner input normalization

현재:

- planner가 `pointCount`, `multiplier`, `canvas`를 직접 읽음

목표:

- planner는 `provider.items`와 `color keys`만 읽음

#### Target C. Render input normalization

현재:

- render가 geometry를 다시 만듦

목표:

- render는 `slotGeometry`와 `sortView`만 읽음

### Phase 1 Decision

Phase 1 결론:

- 아직 provider split 전 단계다
- 하지만 의존 축은 충분히 확인되었다
- 다음 단계는 `cardioid provider` 초안 작성이다

즉 이제 `Phase 2 - Geometry Provider Split`로 넘어갈 준비가 되었다.

---

## Next Step

다음 실제 작업:

- `cardioid provider` 인터페이스 초안 만들기
- 현재 `buildChordData()`를 provider 형태로 옮길 경계 정하기
- sorting/render가 provider output만 읽도록 첫 분리 시작

---

## Phase 2 - Geometry Provider Split

### Status

- Started
- First split completed
- Syntax check passed

### What Changed

새 파일 추가:

- [`cardioid_circle_provider.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_provider.js)

이 파일로 옮긴 책임:

- `getCardioidPoint(...)`
- `getCardioidPointByIndex(...)`
- `getCardioidLineGeometry(...)`
- `getCardioidLineVisual(...)`
- `getCardioidLineColor(...)`
- `buildCardioidProvider(...)`

### Integration Changes

#### 1. Main case now composes provider

메인 case 파일은 provider를 합성한다.

- [`cardioid_circle.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle.js)

즉 geometry 함수의 실제 소유권은 provider 쪽으로 이동했고,
메인 case의 기존 `circlePoint`, `circlePointByIndex`, `lineVisual`, `lineColor`는
provider 위임 래퍼가 되었다.

#### 2. Sorting now reads provider output

`buildSortPlanForCurrentState()`는 이제 직접 chord geometry를 조립하지 않고
provider를 먼저 만든 뒤 `provider.items`를 기반으로 sort input을 만든다.

위치:

- [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js#L29)

또한 기존 `buildChordData()`는 이제 provider의 얇은 wrapper다.

#### 3. Render now reads provider output

`getViewState()`는 이제:

- `buildCardioidProvider(...)`

를 먼저 호출하고, 그 결과를 `viewState.provider`에 넣는다.

위치:

- [`cardioid_circle_render.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js#L41)

변경 결과:

- point draw는 `provider.points` 사용
- 일반 chord draw는 `item.slotGeometry` 사용
- sorting 중 slot 위치는 `provider.slots[k].geometry` 사용

즉 render가 geometry를 매번 다시 계산하는 비중이 줄었다.

#### 4. Script load order updated

HTML에서 provider가 sorting/render보다 먼저 로드되도록 수정했다.

- [`index.html`](/Users/eric/PG/math-visual/sort-color/index.html#L145)

### What Improved

이번 단계로 좋아진 점:

- geometry 수학 본체가 별도 파일로 분리되었다
- sorting이 provider output을 읽기 시작했다
- render도 provider output을 읽기 시작했다
- 이후 cardioid 외 geometry를 붙일 구조적 첫 발판이 생겼다

### What Is Still Not Fully Solved

아직 남은 문제:

- render 내부 learning overlays는 여전히 cardioid helper를 직접 부른다
- sorting planner는 여전히 case state와 canvas size를 직접 읽는다
- color key extraction은 sorting preparation 안에 아직 섞여 있다
- `buildChordData()`는 호환용 wrapper로 남아 있다

즉 provider split은 시작됐지만,
아직 provider-only 구조로 완전히 정리된 것은 아니다.

### Verification

문법 체크 통과:

- `node --check sort-color/cases/cardioid_circle_provider.js`
- `node --check sort-color/cases/cardioid_circle_sorting.js`
- `node --check sort-color/cases/cardioid_circle_render.js`
- `node --check sort-color/cases/cardioid_circle.js`

### Review Focus

재민이 확인 포인트:

- provider 파일이 실제 geometry 본체 역할을 하기 시작했는가
- sorting 입력이 provider 기반으로 넘어갔는가
- render가 provider 기반으로 넘어갔는가
- 기존 기능이 바로 깨질 만한 큰 참조 단절은 없는가

---

## Phase 3 - Color Key / Planner Cleanup

### Status

- Started
- First cleanup completed
- Syntax check passed

### What Changed

새 파일 추가:

- [`cardioid_circle_color_keys.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_color_keys.js)

이 파일로 옮긴 책임:

- `getHueKey(...)`
- `getChannelBucket(...)`
- `extractSortItem(...)`
- `extractSortItems(...)`
- `getSortPassDescriptors(...)`

즉 색 기반 정렬 키 추출이 sorting 파일 밖으로 이동하기 시작했다.

### Planner Cleanup

sorting 파일에 아래 새 경계를 만들었다.

- `buildSortPlanForCurrentState()`
- `buildSortPlanFromProvider(provider, signature)`
- `buildSortPlanFromItems(sortItems, config)`

의미:

- current state에서 provider를 만드는 일
- provider output에서 sort item을 추출하는 일
- pure-ish item list 기반으로 sort plan을 만드는 일

이 세 층이 처음으로 나뉘었다.

### What Improved

이번 단계로 좋아진 점:

- color key extraction이 sorting implementation에서 분리되기 시작함
- radix pass descriptor 정의가 별도 계층으로 분리됨
- planner가 `provider.items` 기반 함수로도 호출 가능해짐
- 이후 cardioid 외 geometry에서도 동일 planner를 재사용할 발판이 생김

### What Is Still Not Fully Solved

아직 남은 문제:

- `buildSortPlanForCurrentState()`는 fallback 경로로 남아 있지만,
  render의 주 경로는 이제 provider를 직접 넘긴다
- 즉 planner의 주 동작 경로는 provider 기반으로 한 단계 더 이동했다
- `getSortSignature()`도 아직 cardioid case state와 직접 연결돼 있다
- render overlays 일부는 여전히 cardioid helper에 기대고 있다

즉 이번 단계는:

- color key 분리 시작
- planner 입력 정리 시작

까지는 됐지만,
아직 완전한 `geometry-agnostic sort engine`은 아니다.

### Additional Cleanup Completed

추가 보완:

- `getCurrentCardioidProvider()` 추가
- `ensureSortPlan(provider)` 형태로 provider 직접 입력 지원
- `getSortTotalSteps(provider)` 형태로 provider 직접 입력 지원
- render는 이제 생성한 provider를 sorting 쪽에 그대로 넘긴다
- `getSortSignatureFromProvider(provider)` 추가
- step progress 계산도 provider 기반 total step 경로를 우선 사용

의미:

- sorting 파일의 주 경로에서 `canvas.width / height` 직접 의존이 한 단계 더 뒤로 밀렸다
- planner는 현재 state보다 provider 입력 중심으로 움직이기 시작했다

### Remaining Direct Dependencies

아직 의도적으로 남아 있는 것:

- `buildSortPlanForCurrentState()`
  - fallback 경로
  - 현재 case state에서 provider를 얻는 entry point
- learning overlays
  - 일부는 provider 소유 helper를 직접 사용하도록 이동 시작
  - mapping overlay는 `getCardioidPoint / getCardioidPointByIndex`로 전환 완료

즉 현재 상태는:

- 주 경로: provider 중심
- fallback/overlay 경로: case helper 일부 유지

여기까지 오면 다음 geometry를 붙일 때
sorting core를 다시 뜯어야 하는 범위가 꽤 줄어든 상태다.

---

## Phase 4 - UI Structure Cleanup

### Status

- Started
- First layout split applied
- Syntax check passed

### What Changed

#### 1. Top global toolbar added

상단에 전역 바를 추가했다.

- [`index.html`](/Users/eric/PG/math-visual/sort-color/index.html)

현재 구성:

- `Geometry` select
- global control host

현재 geometry 선택값은 `Cardioid`만 제공하지만,
이제 상단 전역 영역이 실제로 생겼다.

#### 2. Control rendering is now 3-way split

기존:

- sorting panel
- generator panel

현재:

- top global controls
- left sorting controls
- right geometry inspector controls

핵심 변경 위치:

- [`core.js`](/Users/eric/PG/math-visual/sort-color/core.js)

새 분류:

- global controls:
  - `mc_render`
  - `mc_color`
- sorting controls:
  - `mc_play_toggle`
  - `mc_sort_divider`
  - `mc_sort`
  - `mc_sort_speed`
  - `mc_sort_restart`
- generator / inspector controls:
  - 나머지 geometry-specific controls

#### 3. Right panel identity clarified

우측 패널 제목을

- `Geometry`
- `Cardioid Inspector`

형태로 바꿨다.

의미:

- 우측은 단순 generator가 아니라
  geometry-specific inspector라는 역할을 더 분명히 함

### What Improved

이번 단계로 좋아진 점:

- 좌측 패널이 sorting 고정 성격에 더 가까워짐
- 우측 패널이 geometry inspector 성격에 더 가까워짐
- 상단 전역 바가 생겨 이후 geometry 전환 UI를 얹을 자리가 생김

### What Is Still Not Fully Solved

아직 남은 문제:

- 상단 geometry select는 아직 `Cardioid` 단일값이다
- `Color`는 현재 display color 의미에 가깝고, 문서의 일반화된 `Color Key`와 완전히 일치하지는 않는다
- 실제 multi-geometry 전환 로직은 아직 없다

즉 이번 단계는:

- UI 책임 분할의 첫 판

까지는 됐지만,
아직 완전한 multi-geometry shell은 아니다.

### Verification

문법 체크 통과:

- `node --check sort-color/core.js`
- `node --check sort-color/cases/cardioid_circle.js`

### Review Focus

재민이 확인 포인트:

- 상단 / 좌측 / 우측 UI 책임이 더 분명해졌는가
- sorting control이 좌측 고정이라는 방향이 보이는가
- 우측 패널이 geometry inspector처럼 읽히는가

### Additional Shell Work Completed

추가 보완:

- `geometryRegistry` 추가
- `currentGeometryId` 추가
- `bindGlobalToolbar()` 추가
- `loadGeometryCase(geometryId)` 추가
- `syncGeometryMeta()` 추가

의미:

- 상단 geometry select가 이제 단순 장식이 아니라 registry를 통해 case를 로드하는 shell이 되었다
- 현재는 `Cardioid` 단일값이지만, 다음 geometry를 registry에 추가할 자리와 흐름이 생겼다
- 우측 inspector 제목도 geometry registry metadata와 연결되기 시작했다

---

## Phase 6 - Sphere Prototype Preparation

### Status

- Started
- Provider prototype added
- Not wired into UI switching yet

### What Changed

새 파일 추가:

- [`goldberg_sphere_provider.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_provider.js)

이 파일에 들어간 것:

- `getGoldbergFrequency(...)`
- `buildGoldbergIcosahedron()`
- `buildGoldbergIcosphereByFrequency(...)`
- `generateGoldbergTopology(...)`
- `buildGoldbergSphereProvider(options)`

즉 `maze-art`의 Goldberg topology 생성 흐름을
`sort-color` 쪽 provider prototype으로 가져오기 시작했다.

### Prototype Scope

현재 prototype이 하는 일:

- Goldberg-like face topology 생성
- face cell polygon 생성
- neighbors 생성
- 2D canvas용 polygon projection 생성
- provider 형식(`items`, `slots`, `providerMeta`)으로 패키징

현재 prototype이 아직 안 하는 일:

- 실제 geometry registry에 연결된 selectable case
- sorting/render와 직접 연결된 sphere case
- inspector UI

### Why This Step Matters

이 단계의 의미:

- 이제 `sort-color` 안에도 Cardioid 외 두 번째 geometry provider 후보가 생겼다
- 다음 단계에서는 UI 전환보다 먼저
  `provider contract`가 실제 sphere에도 맞는지 검증할 수 있다

### Verification

문법 체크 통과:

- `node --check sort-color/cases/goldberg_sphere_provider.js`
- `node --check sort-color/core.js`

### Review Focus

재민이 확인 포인트:

- Goldberg topology 생성 흐름이 provider 계약과 맞는가
- `polygon` geometry가 기존 provider contract와 충돌하지 않는가
- 다음 단계에서 실제 sphere case로 올릴 수 있는 수준의 초안인가

### Verification

문법 체크 통과:

- `node --check sort-color/cases/cardioid_circle_color_keys.js`
- `node --check sort-color/cases/cardioid_circle_sorting.js`
- `node --check sort-color/cases/cardioid_circle_render.js`
- `node --check sort-color/cases/cardioid_circle.js`

### Review Focus

재민이 확인 포인트:

- color key extraction이 sorting 내부 구현과 분리되기 시작했는가
- planner가 provider/items 기반 경계를 갖기 시작했는가
- 다음 단계에서 pure sort engine으로 더 밀어붙일 수 있는 구조가 됐는가

---

## Review Notes

재민이 확인/테스트 전 체크 포인트:

- sorting이 아직 geometry를 직접 만드는 상태라는 점
- render도 geometry를 다시 만드는 상태라는 점
- 이 두 곳이 다음 분리의 핵심이라는 점

즉 1단계의 성과는:

- “어디가 꼬였는지”를 찾은 것
- 아직 “분리 완료”는 아님

---

## Phase 6 - Sphere Registry Connection

### Status

- Started
- Selectable prototype connected
- Syntax check passed

### What Changed

새 파일 추가:

- [`goldberg_sphere_case.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_case.js)

핵심 연결:

- [`core.js`](/Users/eric/PG/math-visual/sort-color/core.js)
  - `geometryRegistry.goldberg_sphere` 추가
  - 상단 `Geometry` select에서 `Goldberg Sphere` 선택 가능
- [`index.html`](/Users/eric/PG/math-visual/sort-color/index.html)
  - `goldberg_sphere_case.js` script 로드 추가

### Prototype Shell Behavior

현재 sphere case는 다음 축을 재사용한다.

- sorting engine: `CardioidCircleSorting`
- color key extraction: `CardioidCircleColorKeys`
- render engine: `CardioidCircleRender`

대신 아래는 sphere 전용으로 새로 가졌다.

- `buildCardioidProvider(...)` wrapper
  - 내부에서는 실제로 `buildGoldbergSphereProvider(...)` 호출
- `getCurrentCardioidProvider()`
  - sort lock 상태 기준 sphere provider 재생성
- `drawHud(...)`
  - cardioid 수치 대신 `Faces / Target / Freq / Mode` 표시
- `uiConfig`
  - `Target Faces`
  - `Face Alpha`
  - `Render`
  - `Color`
  - `Sorting`
  - `Sort Speed`
  - `HUD`
  - `Restart Sorting`

즉 이름은 아직 cardioid-era wrapper를 일부 유지하지만,
실제 데이터 소스는 sphere provider로 바뀐 상태다.

### Render Expansion Used

이번 연결은 기존 render 확장 위에서 성립한다.

- `polygon` geometry path tracing 지원
- polygon fill + stroke 지원
- sorting 중 polygon slot highlight 지원

즉 sphere는 별도 renderer를 새로 쓰지 않고,
기존 renderer의 geometry-kind 분기를 통해 첫 selectable geometry가 되었다.

### What Is Working Now

- 상단 메뉴에서 `Cardioid` / `Goldberg Sphere` 전환
- 우측 inspector 제목 동적 변경
- sphere provider를 실제 case에서 소비
- polygon geometry draw path를 실제 case에서 사용
- sphere에서도 radix / bubble / quick 정렬 엔진 공유 가능

### Known Gaps

아직 남은 것:

- wrapper 이름이 여전히 `buildCardioidProvider` / `getCurrentCardioidProvider`
- global toolbar의 `Color`는 아직 `Color Key`가 아니라 display color에 가까움
- sphere 전용 inspector는 최소 prototype 수준이며,
  north axis / frequency direct control / preset은 아직 없음
- renderer는 아직 공통 shell이지만,
  배경 circle과 일부 cardioid-era assumptions가 남아 있음

### Additional Cleanup Completed

이번 단계에서 바로 보완한 것:

- provider 공통 경로 alias 추가
  - [`cardioid_circle_provider.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_provider.js)
    - `buildGeometryProvider(...)`
    - `getCurrentGeometryProvider()`
- sorting/render가 generic provider 경로를 우선 사용
  - [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js)
  - [`cardioid_circle_render.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js)

즉 `buildCardioidProvider` / `getCurrentCardioidProvider`는 아직 살아 있지만,
공용 엔진의 주 경로는 한 단계 더 중립적인 이름으로 이동하기 시작했다.

- sphere inspector에 direct frequency control 추가
  - [`goldberg_sphere_case.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_case.js)
    - `Frequency` slider 추가
    - `0`이면 auto
    - `1..10`이면 manual override
- provider도 `frequencyOverride` 옵션을 지원
  - [`goldberg_sphere_provider.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_provider.js)

즉 sphere는 이제 단순 target face 수뿐 아니라,
실제 subdivision/frequency도 inspector에서 직접 건드릴 수 있다.

### Verification

문법 체크 통과:

- `node --check sort-color/cases/goldberg_sphere_provider.js`
- `node --check sort-color/cases/goldberg_sphere_case.js`
- `node --check sort-color/cases/cardioid_circle_render.js`
- `node --check sort-color/core.js`

### Review Focus

재민이 확인 포인트:

- geometry registry 전환이 실제 case switch로 동작하는가
- polygon render가 sorting highlight와 함께 깨지지 않는가
- sphere case를 다음 단계에서 generic geometry case interface로 더 정리할 수 있는가

---

## Step 7 Review Reflection

`color-sort-check.md`의 최신 검토 기준으로
Phase 2 실행계획은 `PASS`로 확인되었다.

핵심 승인 포인트:

- rename은 한 번에 하지 않고
  `alias -> migration -> rename` 순서로 가야 한다
- 현재 전역 script 구조에서는 이 순서가 실제 안정성 확보에 중요하다
- sphere 3D 계산은 renderer가 아니라 provider 안에서 끝내야 한다
- 즉 `renderer는 투영하지 않고, provider가 투영한 결과만 그린다`는 원칙이 유지되어야 한다

따라서 다음 실전 작업 순서도 확정되었다.

1. generic alias 추가
2. 호출부 migration
3. 그 다음에 파일명 / 폴더명 rename

즉 다음 단계는
`Phase 2-A Naming Cleanup`의 실제 시작점으로서
alias 도입과 공용 경로 전환이다.

### Step 1 Started - Generic Alias First

이번 단계에서 실제로 alias를 추가했다.

추가된 공용 이름:

- [`cardioid_circle_color_keys.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_color_keys.js)
  - `ColorKeyEngine`
- [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js)
  - `SortEngine`
- [`cardioid_circle_render.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js)
  - `SortRenderer`
- [`cardioid_circle_provider.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_provider.js)
  - `CardioidGeometryProvider`

그리고 compose 지점도 새 alias를 우선 사용하게 바꿨다.

- [`cardioid_circle.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle.js)
- [`goldberg_sphere_case.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_case.js)

즉 아직 파일명은 그대로지만,
전역 객체명 수준에서는 공용 이름이 실제로 생겼다.

이 단계의 의도:

- 기존 이름을 지우지 않는다
- 새 공용 이름을 먼저 세운다
- case compose가 새 공용 이름으로도 가동되는지 확인한다

문법 체크 통과:

- `node --check sort-color/cases/cardioid_circle_color_keys.js`
- `node --check sort-color/cases/cardioid_circle_sorting.js`
- `node --check sort-color/cases/cardioid_circle_render.js`
- `node --check sort-color/cases/cardioid_circle_provider.js`
- `node --check sort-color/cases/cardioid_circle.js`
- `node --check sort-color/cases/goldberg_sphere_case.js`

### Step 2 Progress - Call-Site Migration

이번 단계에서는 alias를 단순 선언만 한 것이 아니라,
메인 호출부가 실제로 generic 이름을 타도록 더 밀었다.

핵심 변경:

- [`cardioid_circle_sorting.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js)
  - `buildSortPlanForCurrentState()`가 `getCurrentGeometryProvider()`를 직접 사용
  - `stepSort()`가 `getCurrentGeometryProvider()`를 직접 사용
  - `updateSortingState()`가 `getCurrentGeometryProvider()`를 직접 사용
  - `buildChordData()`가 `buildGeometryProvider()`를 직접 사용
- [`cardioid_circle_render.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js)
  - `getViewState()`가 `buildGeometryProvider()`를 직접 사용
- [`cardioid_circle.js`](/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle.js)
  - compose 지점 fallback 제거
  - `CardioidGeometryProvider`, `ColorKeyEngine`, `SortEngine`, `SortRenderer`만 사용
- [`goldberg_sphere_case.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_case.js)
  - compose 지점 fallback 제거
  - `ColorKeyEngine`, `SortEngine`, `SortRenderer`만 사용

즉 현재 상태는:

- 공용 엔진의 메인 파이프는 generic 이름 사용
- case compose도 generic 이름 사용
- 남은 `Cardioid` 이름은 주로 alias 정의와 provider wrapper 호환층에만 남음

이 단계의 의미:

- 아직 파일 rename은 안 했지만,
  실제 동작 경로는 거의 generic 이름으로 옮겨졌다
- 다음 rename 단계에서 바꿔야 할 범위가 훨씬 줄어들었다

추가 문법 체크 통과:

- `node --check sort-color/cases/cardioid_circle_sorting.js`
- `node --check sort-color/cases/cardioid_circle_render.js`
- `node --check sort-color/cases/cardioid_circle.js`
- `node --check sort-color/cases/goldberg_sphere_case.js`

### Step 3 Started - Physical Re-layout

이번 단계에서는 실제 물리적 폴더 구조를 분리했다.

새 canonical 위치:

- `sort-color/engine/color_keys.js`
- `sort-color/engine/sort_engine.js`
- `sort-color/engine/sort_renderer.js`
- `sort-color/geometry/cardioid_provider.js`
- `sort-color/geometry/goldberg_sphere_provider.js`

즉:

- `engine/` = 공용 sorting / rendering / color key
- `geometry/` = geometry provider
- `cases/` = scene wrapper

### Migration Applied

- [`index.html`](/Users/eric/PG/math-visual/sort-color/index.html)
  - script 로드 경로를 기존 `cases/cardioid_circle_*` 엔진 파일에서
    새 `engine/` / `geometry/` 경로로 전환
- 새 canonical 파일은 generic 이름을 본체로 갖고,
  과거 이름은 alias로 뒤에서 제공

예:

- `engine/sort_engine.js`
  - 본체: `SortEngine`
  - alias: `CardioidCircleSorting`
- `engine/sort_renderer.js`
  - 본체: `SortRenderer`
  - alias: `CardioidCircleRender`
- `engine/color_keys.js`
  - 본체: `ColorKeyEngine`
  - alias: `CardioidCircleColorKeys`
- `geometry/cardioid_provider.js`
  - 본체: `CardioidGeometryProvider`
  - alias: `CardioidCircleProvider`
- `geometry/goldberg_sphere_provider.js`
  - 본체: `GoldbergSphereGeometryProvider`
  - alias: `GoldbergSphereProvider`

### Why This Step Matters

이제 파일 구조 자체가
`공용 엔진 / geometry / case wrapper`
로 읽히기 시작했다.

즉 이전 단계까지는 이름만 generic이었고,
이번 단계부터는 물리적 위치도 generic 구조를 반영한다.

### Remaining Naming Debt

아직 남은 것:

- case 파일명은 아직 `cardioid_circle.js` 그대로다
- 과거 `cases/` 안의 엔진/geometry 파일들은 참고용 흔적으로 남아 있다
- 문서 안의 과거 경로 링크도 많이 남아 있다

즉 구조상 가장 중요한 re-layout은 시작됐지만,
완전한 최종 정리는 아직 아니다.

### Verification

문법 체크 통과:

- `node --check sort-color/engine/color_keys.js`
- `node --check sort-color/engine/sort_engine.js`
- `node --check sort-color/engine/sort_renderer.js`
- `node --check sort-color/geometry/cardioid_provider.js`
- `node --check sort-color/geometry/goldberg_sphere_provider.js`
- `node --check sort-color/cases/cardioid_circle.js`
- `node --check sort-color/cases/goldberg_sphere_case.js`

### Step 4 Started - Generic Case Contract Freeze

이 단계에서는 문서상의 공통 case 계약을
실제 shell 쪽에도 반영하기 시작했다.

추가된 것:

- [`core.js`](/Users/eric/PG/math-visual/sort-color/core.js)
  - `caseContract` 정의
  - `validateCaseContract(caseInstance)` 추가
  - `loadCase(...)` 진입 시 contract 검증 수행

현재 계약은:

- required props
  - `uiConfig`
- required functions
  - `buildGeometryProvider()`
  - `getCurrentGeometryProvider()`
  - `reset()`
  - `start()`
  - `stop()`
  - `destroy()`
- recommended functions
  - `drawHud()`
  - `resize()`
  - `setPaused()`

지금은 강제 중단이 아니라
console warn/info 기반의 비파괴 검증이다.

즉 새 geometry case를 꽂을 때
최소 계약을 빠르게 점검할 수 있는 상태가 됐다.

### Step 5 Started - Sphere 3D Upgrade

이 단계에서는 sphere를 더 이상 정적 2D polygon 집합이 아니라,
provider 내부에서 회전/투영되는 입체 표현으로 올리기 시작했다.

핵심 변경:

- [`geometry/goldberg_sphere_provider.js`](/Users/eric/PG/math-visual/sort-color/geometry/goldberg_sphere_provider.js)
  - topology cache 추가
  - `rotateSpherePoint(...)` 추가
  - perspective 성격이 있는 `projectSpherePointToCanvas(...)`로 확장
  - `rotX`, `rotY` 입력 지원
  - slot polygon을 depth 기준으로 정렬
  - back-side geometry에 `hidden` / `depth` 메타데이터 부여
- [`cases/goldberg_sphere_case.js`](/Users/eric/PG/math-visual/sort-color/cases/goldberg_sphere_case.js)
  - `rotX`, `rotY`, `rotationSpeed` 상태 추가
  - idle auto rotation 추가
  - drag rotation 추가
  - inspector에 `Rotation Speed` slider 추가
- [`engine/sort_renderer.js`](/Users/eric/PG/math-visual/sort-color/engine/sort_renderer.js)
  - `geometry.hidden`이면 draw skip

즉 이번 단계의 원칙은 유지되었다.

- 3D 수학은 provider 내부
- renderer는 최종 2D geometry만 그림

### What This Upgrade Currently Includes

- idle auto rotation
- manual drag rotation
- rotated 3D points -> 2D projected polygon
- depth 기반 slot order
- back-side geometry skip

### What It Does Not Yet Include

- 정교한 camera model
- true perspective camera parameters
- front/back edge fade tuning
- 회전 상태의 별도 HUD/mini-map

즉 아직은 `Step 5 시작` 수준이고,
완성형 sphere viewer까지는 아니다.

### Verification

문법 체크 통과:

- `node --check sort-color/geometry/goldberg_sphere_provider.js`
- `node --check sort-color/cases/goldberg_sphere_case.js`
- `node --check sort-color/engine/sort_renderer.js`
- `node --check sort-color/cases/cardioid_case.js`
- `node --check sort-color/core.js`

### Sphere UX Notes

현재 sphere 쪽에서 이미 되는 것:

- 셀 수 변경
  - `Target Faces`
  - `Frequency`
- 컬러 스킴 변경
  - `Longitude`
  - `Northness`
  - `Latitude`
  - `Monochrome`

이번에 추가한 것:

- 북극 / 남극 표시
  - provider가 rotated pole의 2D 좌표를 계산
  - sphere case가 `N`, `S` marker를 화면에 draw
- maze-art 기반 auto tracking stabilizer
  - active sorting slot을 추적 대상으로 선택
  - moving average + EMA smoothing
  - angular velocity easing
  - tracking hysteresis

---

## Current Remaining Work

현재 기준 남은 큰 작업은 아래다.

### 1. Sphere 3D Tuning

- 투영감 조정
- 뒷면 skip 기준 조정
- rotation 속도 / 드래그 감도 조정
- sorting 중 시각 가독성 확인

### 2. Sphere Advanced Motion

- auto tracking on/off UI 필요 여부 판단
- active pair / pivot / frontier 중 무엇을 우선 추적할지 튜닝
- tracking gain / hysteresis / damping 값 브라우저 튜닝

### 3. Final Naming Debt Cleanup

- 문서 링크 경로 최종 정리

### 4. Stabilization

- 실제 브라우저 검증
- 한 번 더 구조 안정화 커밋

즉 현재 상태는:

- 플랫폼 기반 공사는 대부분 완료
- sphere는 3D prototype 단계
- 최종 완성 단계는 아직 아님

---

## Cleanup Update

현재 구조 기준으로 실제 정리한 사항:

- `cases/cardioid_circle.js` -> `cases/cardioid_case.js`
- `cases/` 안의 obsolete helper 파일 제거
  - `cardioid_circle_color_keys.js`
  - `cardioid_circle_provider.js`
  - `cardioid_circle_render.js`
  - `cardioid_circle_sorting.js`

현재 naming rule:

- `engine/` 안 공용 로직은 generic 이름 유지
- `geometry/` 안 파일은 `*_provider.js`
- `cases/` 안 wrapper 파일은 `*_case.js`

현재 `cases/`의 canonical wrapper:

- `cardioid_case.js`
- `goldberg_sphere_case.js`
