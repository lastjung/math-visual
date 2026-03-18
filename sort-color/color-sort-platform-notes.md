# Color Sort Platform Notes

## Goal

현재 `sort-color`를 단일 cardioid 실험이 아니라,
여러 geometry와 여러 color key, 여러 sorting algorithm을 조합할 수 있는
범용 `color-based sorting platform`으로 확장한다.

핵심 질문은 앞으로 이 세 가지다.

- 어떤 geometry 위에서 정렬할 것인가
- 어떤 color 기준으로 정렬할 것인가
- 어떤 sorting algorithm으로 재배치할 것인가

즉 프로젝트를 다음 형태로 일반화한다.

`Geometry x Color Key x Sort Algorithm`

---

## Why Expand This Way

현재 구조의 장점:

- transport UI가 이미 있다
- sorting playback / hold / step / reset 구조가 있다
- 정렬 과정 시각화 경험이 이미 쌓여 있다
- cardioid에서 color movement가 잘 보이는 기반이 있다

현재 구조의 한계:

- geometry가 cardioid에 강하게 묶여 있다
- color extraction과 sort planning이 섞여 있다
- radix / bubble / quick이 공통 인터페이스 없이 붙고 있다
- 나중에 sphere 같은 새로운 geometry를 붙이려면 코드 충돌이 많아질 수 있다

따라서 지금부터는 “기능 추가”보다
`geometry`, `color key`, `sort engine`, `rendering`의 경계를 분리하는 것이 더 중요하다.

---

## Core Abstraction

범용화의 핵심 추상화는 다음 네 층이다.

### 1. Geometry Provider

역할:

- 정렬 대상 item 목록 생성
- 각 item의 슬롯 위치 제공
- geometry-specific metadata 제공

예시:

- cardioid chords
- grid cells
- strip segments
- sphere faces
- arbitrary mesh faces

Geometry provider가 반환해야 할 최소 정보 예시:

```js
{
  id: "item-42",
  slotIndex: 42,
  slotGeometry: {
    kind: "line",
    from: { x, y },
    to: { x, y }
  },
  sourceGeometry: {
    kind: "line",
    from: { x, y },
    to: { x, y }
  },
  sourceMeta: {
    center: { x, y, z },
    normal: { x, y, z },
    ring: 3
  },
  color: {
    r: 120,
    g: 80,
    b: 200,
    h: 270,
    s: 55,
    l: 54
  }
}
```

`slotGeometry`와 `sourceGeometry`를 분리하는 이유:

- `slotGeometry`는 현재 화면에서 그릴 자리다
- `sourceGeometry`는 생성 원본 또는 geometry 고유 데이터다

예를 들어:

- cardioid는 source line과 slot line이 모두 line일 수 있다
- sphere는 source face polygon과 slot polygon이 같거나 다를 수 있다
- 이후 geometry가 늘어나도 renderer가 `slotGeometry`만 읽고 그릴 수 있다

권장 최소 스키마:

```js
{
  providerId: "cardioid",
  revision: 3,
  items: [
    {
      id: "item-42",
      slotIndex: 42,
      slotGeometry: { kind: "line" | "polygon" | "point", ... },
      sourceGeometry: { kind: "line" | "polygon" | "point", ... },
      color: { r, g, b, h, s, l },
      meta: { ... }
    }
  ],
  slots: [
    {
      slotIndex: 42,
      geometry: { kind: "line" | "polygon" | "point", ... }
    }
  ],
  providerMeta: {
    label: "Cardioid",
    itemCount: 720
  }
}
```

중요한 원칙:

- geometry provider는 “정렬 방법”을 몰라야 한다
- geometry provider는 “어디에 그릴지”와 “무슨 데이터를 갖고 있는지”만 제공한다

---

### 2. Color Key Extractor

역할:

- 각 item의 color 또는 metadata에서 정렬 키를 추출
- sorting algorithm이 사용할 scalar / tuple / digit sequence 생성

예시 color key:

- `Hue`
- `HSL`
- `HSV`
- `RGB`
- `LAB`
- `LCH`
- north-pole distance
- latitude band
- custom scalar field

예시:

```js
extractColorKey(item, mode)
```

가능한 반환값 예:

```js
// hue radix용
{ type: "scalar", value: 213 }

// rgb radix용
{ type: "channels", values: [120, 80, 200] }

// sphere north-south 정렬용
{ type: "scalar", value: theta }

// lsh용
{ type: "channels", values: [lightness, saturation, hue] }
```

중요한 원칙:

- color key extractor는 geometry를 직접 그리지 않는다
- sorting algorithm은 item 전체를 알 필요 없이 key만 읽으면 된다

---

### 3. Sort Planner / Sort Engine

역할:

- 입력 item list + extracted key를 바탕으로
- playback 가능한 step/event plan 생성

여기서 중요한 것은:

- 실제 정렬 과정과 시각화 과정이 일치해야 한다
- “대충 비슷해 보이는” 것이 아니라 실제 algorithm event가 맞아야 한다

예시:

- radix: pass/bucket 중심
- bubble: compare/swap 중심
- quick: partition/pivot/swap 중심
- merge: split/merge/write-back 중심

권장 인터페이스:

```js
buildSortPlan(items, config) => {
  type: "radix" | "bubble" | "quick" | "merge",
  totalSteps: number,
  steps: [...]
}
```

공통 sort plan 스키마는 구현 전에 먼저 고정해야 한다.

권장 공통 스키마:

```js
{
  type: "radix" | "bubble" | "quick" | "merge",
  totalSteps: 1234,
  itemCount: 720,
  initialOrder: ["item-0", "item-1", "item-2"],
  finalOrder: ["item-4", "item-2", "item-0"],
  steps: [
    {
      stepIndex: 0,
      orderSnapshot: ["item-0", "item-1", "item-2"],
      activeIndices: [10, 11],
      activeItemIds: ["item-10", "item-11"],
      highlightedIndices: [10, 11],
      sortedPrefixCount: 0,
      sortedSuffixCount: 0,
      annotations: {
        label: "Hue 1s",
        bucket: 4,
        pivotIndex: null,
        range: null
      }
    }
  ],
  planMeta: {
    algorithmLabel: "Quick Sort",
    colorKeyMode: "hue"
  }
}
```

알고리즘별 확장 필드는 `annotations` 또는 별도 optional field로 둔다.

예시:

- radix:
  - `bucket`
  - `passIndex`
  - `passLabel`
- bubble:
  - `swapIndices`
  - `sortedSuffixCount`
- quick:
  - `pivotIndex`
  - `partitionRange`

step 예시:

```js
{
  stepIndex: 121,
  mode: "quick",
  activeIndices: [10, 41],
  pivotIndex: 57,
  swapIndices: [10, 41],
  partitionRange: [0, 63],
  orderSnapshot: [...]
}
```

중요한 원칙:

- planner는 실제 알고리즘 의미를 보존해야 한다
- render가 planner 부족분을 억지로 추정하면 안 된다
- `approximate` 값은 가능한 한 없애야 한다
- renderer는 가능한 한 `steps`의 공통 필드만 읽고, 알고리즘별 특수 정보는 optional field만 읽도록 한다

---

### 4. Sort Renderer

역할:

- 현재 step 상태를 화면에 그림
- 슬롯은 고정하고 색이 이동하도록 표현
- active pair, pivot, bucket, suffix 등을 강조

Sort renderer는 다음을 알아야 한다.

- 현재 geometry slots
- 현재 draw order
- 현재 active step metadata

Sort renderer는 다음을 몰라야 한다.

- 정렬 계획을 어떻게 만들었는지의 내부 세부 구현

즉 renderer는
“현재 이 step에서 무엇을 강조해야 하는가”
만 알면 된다.

---

## Three-Axis Platform Model

이 프로젝트를 범용적으로 보면 핵심 조합은 다음과 같다.

### Axis 1. Geometry

예시:

- `cardioid`
- `sphere`
- `grid`
- `strip`
- `mesh`

### Axis 2. Color Key

예시:

- `hue`
- `rgb`
- `hsl`
- `hsv`
- `lab`
- `north_south`
- `latitude_band`
- `custom`

### Axis 3. Sort Algorithm

예시:

- `radix`
- `bubble`
- `quick`
- `merge`

즉 최종적으로는 예를 들면 다음 조합이 가능해진다.

- `cardioid + hue + radix`
- `cardioid + rgb + quick`
- `sphere + north_south + quick`
- `sphere + hue + radix`
- `grid + rgb + bubble`

---

## Caustics Reference

`caustics`는 그대로 복사해 쓰는 대상은 아니지만,
범용 `color sort platform`을 설계할 때 참고할 구조는 분명히 있다.

핵심 판단:

- UI 구조와 registry 방식은 참고할 가치가 크다
- geometry drawing core는 직접 재사용하지 말고 새로 만드는 편이 낫다

### What Is Useful From Caustics

참고할 만한 파일:

- `caustics/config/shape-registry.js`
- `caustics/core/shape-config.js`
- `caustics/ui/panels.js`

이쪽에서 배울 점:

- 상단에서 shape / geometry를 고르는 구조
- shape별 메타데이터를 registry에 모아두는 방식
- shape가 바뀌면 오른쪽 inspector 내용도 바뀌는 방식
- presets / defaults / 설명 문구를 shape 단위로 관리하는 방식

즉 `caustics`는 다음 패턴의 참고 사례다.

- top-level geometry selector
- geometry registry
- dynamic inspector panel
- geometry-specific presets

이 구조는 나중에 `sort-color` 또는 `sort-sphere`에서
“상단 geometry 메뉴 + 오른쪽 geometry inspector”를 만들 때 그대로 참고할 수 있다.

### What Should Not Be Reused Directly

직접 재사용에 부적합한 파일:

- `caustics/render/renderer.js`
- `caustics/sim/physics.js`

이유:

- `caustics`의 shape 구현은 ray physics에 깊게 묶여 있다
- boundary intersection, normal 계산, 반사 로직 중심이다
- 즉 거기서의 shape는 “빛이 부딪히는 경계”다

반면 여기서 필요한 geometry는 다르다.

- 정렬 대상 item 목록 생성
- item의 슬롯 좌표 생성
- item의 metadata 제공

즉 `sort-color` 계열에서 필요한 것은
physics boundary shape가 아니라 `geometry provider`다.

### Conclusion

결론:

- `caustics`의 UI/registry 설계는 참고한다
- `caustics`의 physics/shape rendering core는 직접 가져오지 않는다
- `sort-color`용 geometry provider layer는 새로 만든다

짧게 말하면:

`caustics`는 설계 패턴 참고용이고, geometry core는 다시 만든다.

---

## Maze-Art Sphere Reference

`maze-art`에는 `Goldberg sphere`뿐 아니라
여러 종류의 sphere generation 실험이 이미 들어 있다.

참고 파일:

- `/Users/eric/PG/maze-art/cases/sphere_face_maze.js`
- `/Users/eric/PG/maze-art/cases/sphere_maze.js`

### Best Reusable Part

가장 참고 가치가 큰 쪽은:

- `sphere_face_maze.js`

특히 이 함수들이 중요하다.

- `getGoldbergFrequency(targetCount)`
- `generateGoldbergTopology(frequency)`
- `buildIcosphereByFrequency(baseVertices, baseFaces, frequency)`
- `buildIcosahedron()`

이 흐름은 정렬 프로젝트에 잘 맞는다.

- icosahedron 생성
- 주파수 기반 subdivision
- triangle centroid를 이용해 face cell polygon 생성
- 각 cell의 neighbors 생성

즉 `sort-sphere`에서 필요한

- polygon face
- face center
- face adjacency

를 얻는 데 거의 바로 쓸 수 있다.

중요한 점:

- 미로 로직은 버린다
- geometry/topology 생성부만 참고하거나 가져온다

### Other Sphere Variants Already Exist

`sphere_maze.js`에는 Goldberg 외에도 sphere 생성 방식이 있다.

예시:

- Fibonacci sphere
- lat-lon sphere
- cube projection sphere
- icosphere
- soccer / Goldberg

이건 sphere distribution 실험 범위를 넓히는 데 유용하다.

### Point-Based vs Face-Based

중요한 구분:

- `sphere_maze.js`는 주로 point 기반
- `sphere_face_maze.js`는 face / cell 기반

정렬 프로젝트 관점에서는 `face / cell 기반`이 더 적합하다.

이유:

- 면 단위로 색을 칠하기 쉽다
- 정렬 결과를 면 단위 재배치로 보여주기 쉽다
- sphere 상에서 질서 변화가 더 잘 보인다

반면 point 기반 sphere는:

- 보조 실험
- 점 클라우드 기반 정렬
- particle-like visualization

같은 별도 모드에 더 어울린다.

### Conclusion

정리:

- `caustics`: UI/registry 구조 참고
- `maze-art sphere_face_maze`: Goldberg topology 생성 참고
- `maze-art sphere_maze`: 다른 sphere distribution 실험 참고

즉 sphere geometry 쪽은 `maze-art`가 본참고이고,
UI 구조 쪽은 `caustics`가 본참고다.

---

## Project-Wide Reference Map

전체 프로젝트를 기준으로 봤을 때,
`sort-color` / `sort-sphere` 확장에 직접 참고할 만한 소스는 몇 군데로 압축된다.

### 1. Sphere Geometry Core

가장 중요한 참조:

- `/Users/eric/PG/maze-art/cases/sphere_face_maze.js`

이유:

- Goldberg topology 생성이 이미 있다
- face cell polygon 생성이 이미 있다
- face adjacency 생성이 이미 있다

즉 sphere 기반 sorting geometry의 가장 직접적인 출발점이다.

### 2. General Polyhedron / Mesh Utilities

중요 참조:

- `/Users/eric/PG/math-visual/polyhedra/polyhedron_factory.js`

특히 참고할 부분:

- `makeDual`
- `makeTruncated`
- `withDerived`

이유:

- face 중심 기반 mesh 구성 방식이 좋다
- face normals, edgeFaces, faceNeighbors를 함께 계산한다
- sphere 외에 다른 polyhedron 계열 확장에도 쓸 수 있다

즉 이 파일은 `sort-sphere`뿐 아니라
더 넓은 `sort-polyhedra` 방향까지도 연결되는 참고 자산이다.

### 3. Geometry UI / Registry Pattern

중요 참조:

- `/Users/eric/PG/math-visual/caustics/config/shape-registry.js`
- `/Users/eric/PG/math-visual/caustics/core/shape-config.js`
- `/Users/eric/PG/math-visual/caustics/ui/panels.js`

이유:

- 상단 geometry 선택 구조가 있다
- geometry별 registry가 있다
- geometry가 바뀌면 inspector 내용도 바뀌는 패턴이 정리돼 있다

즉 UI 구조는 `caustics`가 가장 좋은 참고다.

### 4. Sorting Presentation / Education Layer

중요 참조:

- `/Users/eric/PG/math-visual/visualization/cases/radix_sorting.js`

이유:

- bucket / pass 중심의 정렬 연출 사례가 있다
- narrative / 단계 안내 문구가 있다
- 교육용 sorting animation 관점에서 참고할 만하다

현재 `sort-color`가 더 발전한 상태이긴 하지만,
초기 연출 아이디어나 설명 흐름을 다시 볼 때 참고 가치가 있다.

### 5. Existing Sort-Color Itself

현재 가장 중요한 재사용 베이스:

- `/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle.js`
- `/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_sorting.js`
- `/Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_render.js`

이유:

- sorting transport
- hold / step / reset
- radix / bubble / quick
- HUD / sort bar / playback

가 이미 여기서 풀려 있다.

즉 새 프로젝트를 시작할 때 실제 베이스 코드는 결국 `sort-color`다.

### Practical Summary

실전 기준으로 정리하면:

- geometry core: `maze-art`
- polyhedron utility: `polyhedra`
- geometry UI architecture: `caustics`
- sorting presentation 참고: `visualization/radix_sorting`
- 실제 새 프로젝트 base: `sort-color`

한 줄 요약:

`sort-sphere`는 `sort-color`를 베이스로 하고, geometry는 `maze-art`, 구조 패턴은 `caustics`, mesh 확장은 `polyhedra`를 참고한다.

---

## Execution Plan

현재 방향은:

- 지금 바로 `sort-sphere`를 독립 시작하지 않는다
- 먼저 `sort-color` 안에서 geometry 교체 가능한 platform 구조를 만든다
- 구조가 선명해지면 그 시점에 복제해서 `sort-sphere`로 분리한다

즉 순서는:

`sort-color stabilize -> geometry abstraction -> provider split -> copy -> sort-sphere`

### Phase 1. Boundary Lock

목표:

- sorting engine이 실제로 무엇을 입력받아야 하는지 고정

정리할 대상:

- `items`
- `slots`
- `color keys`
- `sort plan`

해야 할 일:

- 현재 cardioid 전용 데이터 접근 지점을 목록화
- sorting 파일이 geometry 계산을 직접 하는 부분 찾기
- render 파일이 geometry 계산을 직접 하는 부분 찾기
- geometry provider 스키마 초안 확정
- sort plan 공통 스키마 초안 확정

검점:

- sorting이 `multiplier`, `pointCount`, chord 계산에 직접 묶여 있으면 아직 실패
- render가 cardioid 수식을 직접 계산하면 아직 실패

### Phase 2. Geometry Provider Split

목표:

- cardioid geometry 생성부를 독립 provider로 분리

최소 반환 형태:

```js
{
  id,
  slotIndex,
  geometry,
  color,
  meta
}
```

해야 할 일:

- chord/slot/line geometry 생성부를 provider 함수로 이동
- sorting은 provider 결과만 읽게 변경
- render도 provider 결과를 그리도록 정리

검점:

- cardioid 수식이 sorting/render 내부에 남아 있으면 실패
- geometry provider만 바꿔도 sorting core는 그대로면 성공

### Phase 3. Color Key Layer

목표:

- 정렬 기준을 geometry에서 떼고 color-key 추출 계층으로 분리

우선 대상:

- `Hue`
- `LSH`
- 이후 `RGB`

해야 할 일:

- `extractColorKey(item, mode)` 계층 만들기
- radix/bubble/quick이 item 전체 대신 key 기반으로 동작하게 정리

검점:

- 새 color key 추가가 sorting core 수정 없이 가능해야 한다

### Phase 4. UI Structure Cleanup

목표:

- 좌우 패널과 상단 메뉴의 역할을 고정

구조:

- 왼쪽 패널: sorting controls 고정
- 오른쪽 패널: geometry inspector
- 상단 메뉴: geometry 선택

검점:

- geometry를 바꿔도 왼쪽 sorting 패널은 바뀌지 않아야 한다
- 오른쪽만 dynamic inspector처럼 바뀌어야 한다

### Phase 5. Cardioid as First Geometry

목표:

- 현재 cardioid를 첫 번째 geometry plugin처럼 취급

해야 할 일:

- cardioid provider로 기존 기능을 다시 연결
- 기존 `sort-color` 동작이 안 깨지는지 확인

검점:

- radix / bubble / quick 유지
- hold / step / reset 유지
- Study Journey 유지

### Phase 6. Sphere Provider Prototype

목표:

- `maze-art` 기반 Goldberg sphere provider 초안 작성

우선 검증 대상:

- `faceCells`
- `face centers`
- `neighbors`
- 북극/남극 기준 scalar 추출 가능 여부

중요:

- 이 단계에서는 렌더보다 데이터 구조 검증이 우선

### Phase 7. Independent Project Split

목표:

- 구조가 안정되면 복사해서 `sort-sphere` 시작

해야 할 일:

- `sort-color` 복제
- cardioid를 보조 geometry로 남기거나 제거
- sphere provider를 메인 geometry로 연결

검점:

- sphere geometry를 붙이기 위해 sorting core를 다시 뜯지 않아야 한다

## Immediate Next Task

가장 먼저 할 실제 작업:

- `cardioid geometry dependency inventory` 작성
- `geometry provider schema` 초안과 실제 현재 코드 비교
- `sort plan schema` 초안과 실제 현재 코드 비교

즉 먼저 확인해야 할 것은:

- `cardioid_circle.js`
- `cardioid_circle_sorting.js`
- `cardioid_circle_render.js`

이 세 파일 사이에서
geometry 의존 코드가 어디까지 퍼져 있는지 정확히 목록화하는 것이다.

이 작업이 끝나야
다음 단계인 geometry provider 분리를 정확하게 시작할 수 있다.

## Review Checklist

매 단계마다 아래 기준으로 검점한다.

- geometry를 바꿔도 sorting core는 거의 안 건드려도 되는가
- color key를 바꿔도 geometry 코드는 안 건드려도 되는가
- 새 algorithm 추가가 UI 전체 수정으로 번지지 않는가
- sphere를 붙일 때 cardioid 수식이 따라 들어오지 않는가

짧게 말하면:

- geometry / color key / sorting / render 경계가 흐려지면 실패
- 새 geometry를 붙일 때 provider만 바꾸면 되면 성공

---

## Why Cardioid Should Become Just One Geometry

지금까지는 cardioid가 프로젝트 자체였다.
하지만 범용화 이후에는 cardioid는 첫 번째 geometry provider일 뿐이다.

즉 앞으로의 인식은:

- before: `cardioid sorting project`
- after: `color sorting platform with a cardioid geometry`

이 사고 전환이 중요하다.

이렇게 해야:

- 나중에 `sphere` 추가가 자연스럽고
- UI/transport/sort planner를 그대로 재사용할 수 있고
- 프로젝트 정체성도 덜 좁아진다

---

## Sphere Direction

Goldberg sphere를 붙일 경우의 방향:

- pathfinding 프로젝트와 직접 합치지 않는다
- Goldberg geometry / adjacency / face center 계산만 참고한다
- sorting engine은 현재 `sort-color` 쪽을 기반으로 한다

추천 프로젝트 형태:

- 먼저 `sort-color`를 범용 플랫폼으로 정리
- 충분히 안정되면 복사해 `sort-sphere`로 분기
- cardioid geometry provider만 sphere provider로 교체

이유:

- pathfinding 목적과 sorting 목적이 다르다
- sorting transport/UI는 현재 프로젝트가 더 잘 갖고 있다
- sphere는 geometry만 바뀌고 sorting core는 재사용하는 편이 낫다

---

## Recommended Folder Boundary

장기적으로는 대략 이런 구조가 적절하다.

```txt
sort-color/
  core/
    transport.js
    playback.js
    ui-state.js
  geometry/
    cardioid.js
    sphere.js
    grid.js
  color-keys/
    hue.js
    rgb.js
    hsl.js
    north-south.js
  sorters/
    radix.js
    bubble.js
    quick.js
    merge.js
  render/
    sort-renderer.js
    overlays.js
    hud.js
  cases/
    cardioid_case.js
```

굳이 처음부터 이 구조로 다 쪼갤 필요는 없지만,
이런 방향을 목표로 리팩터링하는 것이 좋다.

---

## UI Structure Direction

범용 플랫폼으로 갈 경우,
현재 좌우 패널 구조도 역할을 더 명확히 나눌 필요가 있다.

### Left Panel

왼쪽 패널은 고정 sorting panel로 유지하는 것이 좋다.

역할:

- sorting method
- speed
- play / hold / step
- reset
- sorting playback 상태

즉 왼쪽은 geometry가 바뀌어도 거의 바뀌지 않는
`sorting transport + sort controls`
영역으로 본다.

### Right Panel

오른쪽 패널은 더 이상 단순한 “도형 메뉴”가 아니라
`geometry inspector`
로 보는 것이 맞다.

역할:

- 현재 선택된 geometry의 파라미터 편집
- geometry-specific controls 표시
- geometry 설명 / preset / rebuild

예시:

- cardioid일 때
  - `N`
  - `M`
  - `M Speed`
- sphere일 때
  - subdivision
  - face mode
  - north axis
- grid일 때
  - rows
  - cols
  - spacing

즉 오른쪽은 고정 메뉴가 아니라
`선택된 geometry에 따라 내용이 바뀌는 동적 inspector`
로 가야 한다.

### Top Menu

이 방향으로 가려면 상단에 별도 글로벌 메뉴가 필요하다.

권장 상단 메뉴:

- `Geometry`
- `Color Key`
- `Preset`
- 필요하면 `Render`

흐름은 이렇게 된다.

1. 상단 메뉴에서 geometry 선택
2. 오른쪽 패널이 해당 geometry의 inspector로 바뀜
3. 왼쪽 패널은 sorting controls로 그대로 유지

즉 역할 분리는:

- top bar: global selection
- left panel: sorting controls
- right panel: geometry inspector

이 구조가 sphere, grid, cardioid를 모두 수용하기 가장 쉽다.

---

## Compare Mode Direction

두 개의 geometry 또는 두 개의 실험 조건을 비교하고 싶다면,
단순히 geometry를 하나 더 얹는 방식보다
`compare mode`
로 보는 것이 맞다.

핵심 개념:

- geometry 2개를 비교하는 것이 아니라
- `experiment A`와 `experiment B`를 동시에 돌리는 구조

즉 비교 대상은 다음과 같이 다양할 수 있다.

- same sort, different geometry
- same geometry, different color key
- same geometry, different sorting algorithm

### Recommended Structure

상단 메뉴에:

- `Single`
- `Compare`

를 두고,

`Compare` 모드에서는:

- `Geometry A`
- `Geometry B`
- `Color Key A/B`
- `Sort A/B`

또는 일부 공유 설정을 둘 수 있다.

### Visual Layout

가장 자연스러운 비교 방식:

- split view
  - left canvas: experiment A
  - right canvas: experiment B

대안:

- stacked view
  - top / bottom

처음에는 `split view`가 가장 직관적이다.

### Transport Recommendation

처음 compare mode를 도입한다면:

- `linked transport`

가 더 좋다.

즉:

- play 같이 시작
- hold 같이 정지
- step 같이 전진

이렇게 해야 비교가 쉽다.

독립 transport는 나중 단계로 미룬다.

---

## Compare Mode Difficulty

난이도는 꽤 높다.

대략 판단:

- single geometry 확장: 중간
- new sorting algorithm 추가: 중간
- compare mode: 중상 ~ 높음

이유:

- geometry state가 2벌 필요하다
- sort state가 2벌 필요하다
- renderer state가 2벌 필요하다
- HUD가 2벌 필요하다
- playback 동기화 정의가 필요하다
- reset / hold / step 동작도 다시 정의해야 한다

특히 어려운 부분:

- 두 실험의 total step 수가 다를 수 있음
- 같은 속도라도 체감 진행이 다를 수 있음
- 한쪽은 완료되고 다른 쪽은 진행 중인 상황 처리 필요

즉 compare mode는 단순히 canvas를 두 개 띄우는 작업이 아니라,
플랫폼 상태 관리 자체를 한 단계 복잡하게 만드는 기능이다.

### Working Recommendation

권장 순서:

1. 먼저 single-experiment platform을 안정화한다
2. geometry / color key / sort planner 경계를 먼저 분리한다
3. 그 다음에 linked compare mode를 붙인다

즉 결론:

`compare mode는 가능하지만 난이도가 꽤 높기 때문에, single platform 안정화 이후 단계로 미루는 것이 맞다.`

---

## Practical Refactor Order

바로 전부 갈아엎지 말고, 다음 순서가 가장 안전하다.

### Step 1. Geometry-Dependent Data Builder 분리

현재 `buildChordData()` 같은 부분을
`geometry provider`로 분리한다.

목표:

- cardioid-specific geometry 계산이 sorting core 밖으로 나오게 한다

### Step 2. Color Key Extraction 분리

현재 `hueKey`, `lightnessBucket` 등을 계산하는 부분을
별도 extractor로 분리한다.

목표:

- `Hue`, `RGB`, `North-South` 같은 key를 바꿔 끼우기 쉽게 만든다

### Step 3. Sort Planner Interface 통일

현재 radix / bubble / quick 각각의 plan 생성 방식을
공통 인터페이스로 맞춘다.

목표:

- renderer가 algorithm별 세부 예외를 덜 알게 만든다

### Step 4. Renderer 메타데이터 최소화

renderer는 가능한 다음만 받는다.

- current order
- active indices
- optional pivot
- optional bucket
- optional completed region

목표:

- 알고리즘 추가할 때 렌더러 수정량을 줄인다

### Step 5. New Geometry Trial

그 다음에 sphere나 grid를 붙인다.

이 순서가 중요한 이유:

- cardioid 상태에서 먼저 platform boundary를 분명히 해야
- sphere 도입 시 고통이 줄어든다

---

## Color-Sort-First Philosophy

이 프로젝트를 확장할 때 중요한 철학:

- geometry는 무대다
- color key는 질서의 기준이다
- sorting algorithm은 질서를 만드는 방식이다

즉 사람에게 보이는 핵심은:

- 랜덤한 색 질서가 생기는 과정
- 그 질서가 geometry 위에서 어떻게 읽히는가

따라서 geometry보다 더 중요한 것은:

- 정렬 기준이 직관적인가
- before/after가 보이는가
- 진행 과정이 읽히는가

---

## Good Candidate Color Keys

범용화 이후 반응이 좋을 가능성이 큰 키들:

- `Hue`
  - 가장 직관적
  - 무지개 흐름

- `RGB`
  - 디지털하고 구조적
  - blocky result

- `Lightness`
  - 명도 그라데이션

- `Saturation`
  - 채도 압축/확장 느낌

- `LAB`
  - 지각적으로 더 자연스러운 정렬

- `North-South`
  - sphere 전용
  - 북극-남극 축 기반 정렬

- `Latitude Band + Longitude`
  - sphere 전용
  - 지구본처럼 읽히는 정렬

---

## Naming Direction

현재 이름 `sort-color`는 cardioid 실험 단계에선 괜찮지만,
더 범용화되면 이런 이름도 검토 가능하다.

- `color-sort-lab`
- `chroma-sort`
- `color-order-lab`

다만 당장 이름을 바꾸기보다,
구조가 먼저 플랫폼화된 뒤 이름을 바꾸는 것이 안전하다.

---

## Working Conclusion

현재의 가장 좋은 방향은 다음과 같다.

1. `sort-color`를 범용 color sorting platform 방향으로 정리한다.
2. cardioid를 첫 번째 geometry provider로 본다.
3. color key extractor와 sort planner를 분리한다.
4. 이후 `sort-sphere`를 독립 프로젝트로 파생한다.
5. 그때 cardioid geometry 대신 Goldberg sphere geometry를 넣는다.

즉 결론:

`지금은 범용 컬러 정렬 엔진으로 정리하고, sphere는 그 다음 단계에서 geometry만 교체하는 방향이 가장 좋다.`
