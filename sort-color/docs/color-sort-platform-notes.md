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

---

## Phase 2 Follow-up Plan

현재 Phase 1~6을 거치면서 구조는 많이 범용화되었지만,
이름과 폴더 구조는 아직 cardioid-era 흔적이 강하다.

즉 지금부터의 다음 묶음 작업은
`새 기능 추가`보다
`네이밍 / 폴더 / 공용 인터페이스 정리`
를 먼저 하는 것이 맞다.

### Why This Matters Now

현재 상태의 문제:

- `cardioid_circle_sorting.js` 안에 사실상 공용 sorting engine이 들어 있다
- `cardioid_circle_render.js` 안에 사실상 공용 renderer가 들어 있다
- `buildCardioidProvider(...)`, `getCurrentCardioidProvider()` 같은 이름이
  sphere case에서도 남아 있다
- 즉 구조는 플랫폼인데 이름이 여전히 첫 번째 geometry에 묶여 있다

이 상태로 sphere upgrade를 먼저 키우면,
기능은 늘어나도 문맥과 파일명이 점점 더 어색해진다.

### Phase 2-A. Naming Cleanup

우선순위:

1. 공용 엔진 이름 중립화
2. geometry-specific 파일과 engine 파일의 폴더 분리
3. 공용 함수명에서 `Cardioid` 제거

권장 예시:

- `cases/cardioid_circle_sorting.js`
  -> `engine/sort_engine.js`
- `cases/cardioid_circle_render.js`
  -> `engine/sort_renderer.js`
- `cases/cardioid_circle_color_keys.js`
  -> `engine/color_keys.js`
- `cases/cardioid_circle_provider.js`
  -> `geometry/cardioid_provider.js`
- `cases/goldberg_sphere_provider.js`
  -> `geometry/goldberg_sphere_provider.js`
- `cases/cardioid_circle.js`
  -> `cases/cardioid_case.js`

함수명 예시:

- `buildCardioidProvider(...)`
  -> `buildGeometryProvider(...)`
- `getCurrentCardioidProvider()`
  -> `getCurrentGeometryProvider()`

핵심 목표:

- geometry 전용 이름은 geometry provider/case에만 남긴다
- sorting, render, color key는 중립 이름으로 올린다

### Phase 2-B. Generic Geometry Case Interface

이름 정리와 함께,
geometry case가 따라야 할 최소 공용 인터페이스도 더 분명히 한다.

필수 축:

- `uiConfig`
- `buildGeometryProvider(...)`
- `getCurrentGeometryProvider()`
- `drawHud(...)`
- `reset()`
- `start() / stop() / destroy()`

권장 축:

- `resize()`
- `setPaused()`
- `init()`

실행 shell 기준 원칙:

- `uiConfig`는 반드시 배열이어야 한다
- `buildGeometryProvider(...)` / `getCurrentGeometryProvider()`는 필수다
- `drawHud(...)`는 강제는 아니지만 geometry별 HUD 분리를 위해 사실상 권장된다
- `resize()`, `setPaused()`는 transport와 layout 일관성을 위해 권장된다

이 단계가 끝나면:

- cardioid
- goldberg sphere

두 geometry가 같은 shell 위에서 더 자연스럽게 읽히게 된다.

### Phase 2-C. Sphere Upgrade Track

naming cleanup이 어느 정도 끝나면,
그 다음에 sphere를 실제로 업그레이드한다.

이때의 목표는 단순 2D polygon 표시를 넘어서:

- 입체 sphere 회전
- depth-aware projection
- front/back 읽힘 개선
- auto rotation / idle rotation
- optional auto tracking

까지 포함한 `real sphere presentation`이다.

즉 sphere upgrade는 가능하지만,
순서상 naming cleanup 이후가 더 안전하다.

---

## Sphere Upgrade References From maze-art

`maze-art`에는 이미 sphere를 실제로 움직이고 따라가는 흐름이 들어 있다.

특히 참고 가치가 큰 건 다음이다.

### 1. Rotating sphere view

파일:

- `/Users/eric/PG/maze-art/cases/sphere_maze.js`
- `/Users/eric/PG/maze-art/cases/sphere_face_maze.js`

참고 포인트:

- `rotX`, `rotY`
- `rotationSpeed`
- idle auto-rotation loop
- drag-based sphere rotation
- `rotatePoint(...)`

즉 `sort-sphere` 또는 이후 sphere upgrade에서는
지금의 2D 정적 polygon draw 대신
`3D points -> rotated points -> projected polygons`
흐름을 가져오는 것이 맞다.

### 2. Face-cell projection for Goldberg sphere

파일:

- `/Users/eric/PG/maze-art/cases/sphere_face_maze.js`

특히 참고할 지점:

- rotated vertex projection
- projected face-cell polygon 생성
- sphere body / front-facing visual 처리

이건 현재 `goldberg_sphere_provider.js`가 만든 topology를
실제 입체 view로 바꾸는 데 가장 직접적인 참고 소스다.

### 3. Auto tracking / focus behavior

파일:

- `/Users/eric/PG/maze-art/cases/sphere_maze.js`
- `/Users/eric/PG/maze-art/cases/sphere_face_maze.js`

참고 포인트:

- `autoTrack`
- tracking smoothing
- active node/path 중심 추적
- idle rotation으로 복귀하는 흐름

sorting 쪽으로 가져온다면 이 기능은:

- 현재 active compare pair
- active bucket region
- pivot region
- selected north axis target

같은 곳을 따라가는 방식으로 바꿔볼 수 있다.

다만 이건 1차 기능이 아니라
`sphere view가 안정된 뒤의 2차 연출 기능`
으로 보는 것이 맞다.

---

## Practical Recommendation

지금 가장 좋은 실무 순서는 다음이다.

1. naming / folder cleanup
2. generic geometry case interface 정리
3. sphere prototype 유지한 채 regression 확인
4. 그 다음 maze-art 참고로 3D rotation/projection 도입
5. 마지막에 auto tracking 같은 연출 기능 검토

즉 결론:

`스피어 업그레이드는 같이 보되, 바로 큰 기능으로 들어가지 말고 naming cleanup 이후의 2차 계획으로 붙이는 것이 가장 안전하다.`

---

## Phase 2 Execution Risks and Guardrails

Phase 2 방향 자체는 맞지만,
실행 과정에서는 아래 두 리스크를 명시적으로 통제해야 한다.

### Risk 1. Global Script Rename Breakage

현재 프로젝트는:

- ESM import/export 구조가 아니라
- `index.html`의 `<script>` 순서와 전역 이름에 의존한다

따라서 다음 중 하나라도 누락되면
즉시 전체 화면이 죽을 수 있다.

- 파일명 변경
- 전역 객체명 변경
- HTML script 경로 변경
- `core.js` / case compose 지점 참조명 변경

즉 rename은 단순한 미관 문제가 아니라
현재 구조에서는 실제 가동 리스크가 큰 변경이다.

#### Guardrail

rename은 반드시 원자 단위로 진행한다.

안전 순서:

1. 새 alias 이름 추가
2. 호출부를 새 이름으로 전환
3. 문법 체크
4. 브라우저 새로고침 후 즉시 확인
5. 마지막에 파일명 이동
6. 마지막에 `index.html` script 경로 교체

핵심:

- 파일명과 전역 객체명을 한 번에 크게 갈지 않는다
- 한 단계 끝날 때마다 바로 동작 확인한다

### Risk 2. Sphere 3D Logic Polluting Generic Renderer

Sphere upgrade 단계에서 가장 위험한 건
3D 회전/투영 계산이 renderer 쪽으로 새는 것이다.

만약 아래가 공용 renderer로 들어가면:

- `rotX`, `rotY`
- depth sorting
- front/back 판정
- backface culling
- camera projection

renderer가 다시 sphere 전용 렌더러로 오염된다.

즉 지금까지 만든
`geometry-agnostic render shell`
이 다시 무너진다.

#### Guardrail

3D sphere 관련 수학은 전부 provider 안에서 끝낸다.

즉 provider가 책임질 것:

- 원본 3D topology
- 회전 상태
- depth 계산
- 앞/뒤 판정
- 최종 2D projected polygon 생성

renderer가 책임질 것:

- provider가 넘긴 `slotGeometry`를 그리기
- highlight / bucket / pair / pivot 표시
- geometry 종류별 최소 path trace 분기

한 줄 원칙:

`renderer는 투영하지 않는다. provider가 투영한 결과만 그린다.`

---

## Phase 2 Detailed Execution Plan

위 리스크를 반영한 실제 실행 순서는 다음이 가장 안전하다.

### Step 1. Generic Alias First

먼저 기존 이름을 지우지 않고 alias를 추가한다.

예:

- `buildGeometryProvider(...)`
- `getCurrentGeometryProvider()`
- `SortEngine`
- `SortRenderer`
- `ColorKeys`

목표:

- 기존 이름을 살린 상태에서
  새 공용 이름이 동작하도록 만든다

검점:

- 기존 cardioid case가 안 깨지는가
- sphere case도 alias 경로를 타는가

### Step 2. Call Sites Migrate

그 다음 호출부를 새 generic 이름으로 바꾼다.

대상:

- sorting main path
- render main path
- geometry case compose 지점

목표:

- 주 경로에서 `Cardioid` 이름이 빠지게 한다

검점:

- `cardioid`와 `sphere` 둘 다 동일 공용 호출 축을 쓰는가

### Step 3. File/Folder Re-layout

이 단계에서 실제 파일을 옮긴다.

권장 방향:

- `engine/`
- `geometry/`
- `cases/`

즉:

- engine = sort/render/color keys
- geometry = providers
- cases = scene wrappers

검점:

- `index.html` script 순서가 올바른가
- 전역 객체 해석 순서가 안 깨졌는가

### Step 4. Generic Case Contract Freeze

이 시점에 geometry case 공통 계약을 확정한다.

필수 항목:

- `uiConfig`
- `buildGeometryProvider(...)`
- `getCurrentGeometryProvider()`
- `drawHud(...)`
- `reset()`
- `start() / stop() / destroy()`

검점:

- 새 geometry case를 이 계약만으로 꽂을 수 있는가

### Step 5. Sphere 3D Upgrade Start

naming/folder/interface가 정리된 뒤에만
sphere 3D 업그레이드를 시작한다.

초기 도입 범위:

1. provider 내부 rotation state
2. rotated 3D points
3. projected 2D polygon build
4. depth-aware draw order

이 단계에서도 renderer는
투영 계산을 몰라야 한다.

### Step 6. Advanced Sphere Motion

마지막으로 `maze-art` 참고 기능 중
연출성 기능을 순차 도입한다.

후순위 기능:

- idle auto rotation
- drag rotation
- optional auto tracking
- smoothing / focus behavior

검점:

- 정렬 엔진과 렌더 shell이 다시 sphere 전용으로 오염되지 않는가

---

## Updated Practical Recommendation

실제 실행 순서를 다시 줄이면:

1. generic alias 추가
2. 호출부 migration
3. 파일/폴더 rename
4. case contract freeze
5. sphere 3D projection provider 도입
6. auto tracking 같은 연출 기능은 마지막

즉 결론:

`문서상 Phase 2는 유지하되, 실제 구현은 "alias -> migration -> rename -> contract freeze -> sphere 3D" 순서로 원자 단위 진행하는 것이 가장 안전하다.`

## AI Architecture Review: Potential Risks in Phase 2 Plan

위 "Phase 2 Follow-up Plan"의 방향성과 진행 순서 판단(명칭 및 구조 일반화를 3D 기능 확장보다 우선시하는 것)은 구조적으로 완벽합니다. 다만 실행 과정에서 발생할 수 있는 잠재적이고 치명적인 아키텍처 위험 요소(Risks) 2가지를 방주(Note)로 남깁니다.

### 🚨 Risk 1. 대규모 Rename에 따른 전역 참조 붕괴 (Phase 2-A)
- **문제 진단:** 현재 이 프로젝트는 웹팩(Webpack) 등 명시적 모듈러(import/export) 없이 HTML의 `<script>` 로드로 전역(Global) 변수를 서로 참조하는 원시적 환경입니다.
- **위기 요소:** `CardioidCircleSorting`을 `SortEngine`으로 바꾸거나 디렉터리를 재배치할 때, `index.html` 내 스크립트 선언 순서나 `core.js`의 호출부, 그리고 좌측 UI DOM 이벤트 리스너 중 하나라도 수정이 누락되면 즉시 화면 전체가 렌더링되지 않는 화이트스크린 버그가 발생하게 됩니다.
- **가이드:** **"파일명 하나, 클래스명 하나를 바꿀 때마다 반드시 브라우저를 새로고침(Ctrl+S -> Refresh)하여 즉시 테스트한다"**의 단위 쪼개기(Atomic Commit) 방식으로 안전하게 진행해야만 거대한 Rename 폭탄을 피할 수 있습니다.

### 🚨 Risk 2. 3D 투영 시 범용 렌더러의 '도형 결합' 오염 (Phase 2-C)
- **문제 진단:** 2차 계획인 `maze-art` 참고 3D 구체(Sphere) 업그레이드 단계 시, 회전(`rotX/Y`)과 Z-Depth(앞/뒷면 판별) 연산을 어느 곳에 둘 것인가가 가장 심각한 설계 문제입니다.
- **위기 요소:** 만약 범용 렌더러 파일(`sort_renderer.js`) 쪽에 이 3D 카메라 투영 공식이나 가려짐(Backface culling) 연산이 섞여 들어가면, 앞서 고생해서 만들어낸 "도형에 종속되지 않는 범용 플랫폼"의 근간이 또다시 무너지고 스피어 특화 렌더러가 되어버립니다.
- **가이드(아키텍처 강제):** 3D 회전과 해당 회전값을 2D 캔버스용 평면 폴리곤(Polygon) 데이터로 투영/변환시키는 일체의 수학 연산은 **반드시 `sphere_provider.js` 하나 안에서 온전히 끝내야만 합니다.** Provider가 모든 투영 계산을 마친 결과물 즉, "2D 화면상(x, y)에 그려질 단순 다각형 스펙(`slotGeometry`)"을 구워내면 렌더러는 그걸 받아서 평소처럼 선을 긋고 색만 칠해주도록 **철저하게 책임의 방화벽(Boundary)을 치셔야 합니다.** 
