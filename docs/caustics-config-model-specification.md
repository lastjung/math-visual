# Caustics Lab: 설정 모델 명세 (Config Model Specification)

이 문서는 `caustics` 프로젝트의 중앙 설정 시스템을 위한 최종 스키마 초안 및 매핑 테이블을 정의합니다.

---

## 1. Scene Schema Final Draft

```json
{
  "shape": "string",         // 'circle', 'rect', 'triangle', 'parabola', 'oval', 'heart'
  "patternId": "string|null", // 특정 장면에 대한 고유 ID (예: 'center-orbit')
  "options": {
    "lightSourceMode": "string",   // 'point', 'parallel', 'converge'
    "sourceLayout": "string",      // 'single', 'triad', 'strip' (구 triangleSourceMode)
    "sourceDirection": "string",   // 'down', 'inward', 'outward', 'edge-normal' (구 triangleDirectionMode)
    "baseStyle": "string",         // 'line', 'dot'
    "flowMode": "string",          // 'none', 'pulse', 'random'
    "renderMode": "string"         // 'flow', 'paint', 'paint2', 'light' (결합 모드)
  },
  "pointer": {
    "sourcePos": { "x": "number", "y": "number" },
    "sourceAnchorPos": { "x": "number", "y": "number" },
    "sourceOffsets": [ { "x": "number", "y": "number" } ]
  },
  "sliders": {
    "rayNumber": "number",
    "raySpeed": "number",
    "spread": "number",
    "sourceRotation": "number",
    "beamWidth": "number",
    "alphaIntensity": "number",
    "trianglePointCount": "number",
    "triangleVertexBias": "number",
    "maxBounces": "number"
  }
}
```

---

## 2. Old State -> New Schema 매핑표

| 기존 App State 키 | 새 Schema 경로 | 비고 |
| :--- | :--- | :--- |
| `shape` | `shape` | |
| (없음) | `patternId` | 2단계 이후 도입 예정 |
| `lightSourceMode` | `options.lightSourceMode` | |
| `triangleSourceMode` | `options.sourceLayout` | **이름 변경** |
| `triangleDirectionMode` | `options.sourceDirection` | **이름 변경** |
| `baseStyle` | `options.baseStyle` | |
| `flowMode` | `options.flowMode` | |
| `isPaintMode` | `options.renderMode` | `paint` 값으로 통합 예정 |
| `isPaint2Mode` | `options.renderMode` | `paint2` 값으로 통합 예정 |
| `isLightMode` | `options.renderMode` | `light` 값으로 통합 예정 |
| `sourcePos` | `pointer.sourcePos` | |
| `sourceAnchorPos` | `pointer.sourceAnchorPos` | |
| `triangleSourceOffsets` | `pointer.sourceOffsets` | |
| `rayNumber` | `sliders.rayNumber` | |
| `raySpeed` | `sliders.raySpeed` | |
| `spread` | `sliders.spread` | |
| `sourceRotation` | `sliders.sourceRotation` | |
| `beamWidth` | `sliders.beamWidth` | |
| `alphaIntensity` | `sliders.alphaIntensity` | |
| `trianglePointCount` | `sliders.trianglePointCount` | |
| `triangleVertexBias` | `sliders.triangleVertexBias` | |
| `MAX_BOUNCES` | `sliders.maxBounces` | **이름 변경** (lowercase) |

---

## 3. GLOBAL_DEFAULTS 초안

애플리케이션 초기화 및 런타임 fallback을 위한 기본값입니다.

```javascript
export const GLOBAL_DEFAULTS = {
    options: {
        lightSourceMode: 'point',
        sourceLayout: 'single',
        sourceDirection: 'down',
        baseStyle: 'line',
        flowMode: 'none',
        renderMode: 'flow' 
    },
    sliders: {
        rayNumber: 30,
        raySpeed: 20,
        spread: Math.PI / 3, // 60 degrees
        sourceRotation: 0,
        beamWidth: 1.6,
        alphaIntensity: 1.0,
        trianglePointCount: 5,
        triangleVertexBias: 0.6,
        maxBounces: 10
    }
};
```

---

## 4. renderMode 통합 여부 판단 메모

### 현황
- 현재 `isPaintMode`, `isPaint2Mode`, `isLightMode` 세 개의 불리언 필드가 공존합니다.
- 이론적으로는 이들이 상호 배타적이어야 하지만, 현재 코드에서는 여러 개가 true가 될 가능성이 열려 있어 렌더링 로직이 복잡해집니다.

### 제안: 통합 (Unified renderMode)
- `options.renderMode` 하나로 통합하여 명확한 상호 배타성을 보장합니다.
- **값 후보**:
  - `'flow'`: 기본 애니메이션 모드 (Normal)
  - `'paint'`: 기본 잔상 모드
  - `'paint2'`: 물리 기반 누적 잔상 모드
  - `'light'`: 광도(Density) 기반 모드

### 기대 효과
- `if-else` 분기가 명확해져 렌더링 루프의 가독성이 향상됩니다.
- 새로운 렌더링 모드 추가 시 스키마 확장이 용이합니다.
- 설정 저장/복원 시 데이터 일관성이 높아집니다.

---

## 5. 다음 단계 실행을 위한 state-mapper.js 업데이트 (예정)
1단계 명세가 확정되면, `state-mapper.js`의 `readCurrentScene`과 `applyScene`에서 `triangleSourceMode` -> `sourceLayout` 등의 이름 변경을 반영할 예정입니다.

---

## 6. 2026-03-30 운영 규칙 고정

이 섹션은 현재 `caustics` 코드와 최근 합의된 용어를 기준으로 실제 운영 규칙을 고정한다.

### 6.1 핵심 계층

- `shape`: 도형 자체. 각 도형은 자기 기준의 `center`, `vertex`, `focus` 규칙을 가진다.
- `pattern`: 광원의 큰 배치 형태.
- `option`: 해당 pattern 안에서 쓰는 세부 위치 세팅.
- `direction`: 광선이 어떤 방향 규칙으로 발사되는지 결정하는 레이어.
- `patternId`: 화면 왼쪽 프리셋 버튼이 선택하는 장면 단위 preset.

현재 코드 기준 용어는 아래를 사용한다.

- `options.sourcePattern`: `single | vertex | strip`
- `options.sourceOption`: `basic | center | online`
- `options.sourceDirection`: `down | inward | outward | edge-normal`
- `patternId`: 예: `center-orbit`, `edge-sweep`, `vertex-edge`

### 6.2 Pattern 의미

- `single`: 광원 1개 배치
- `vertex`: 도형의 vertex 집합 기반 다중 배치
- `strip`: 한 축을 따라 여러 광원을 선형 배치

주의:

- `vertex`는 "항상 삼각형"을 뜻하지 않는다.
- 각 도형은 자기 규칙에 따라 vertex 집합을 정의할 수 있다.
- 실제 구현은 `caustics/core/shape-config.js`의 도형별 분기로 관리한다.

### 6.3 Option 의미

`sourceOption`은 `single` 패턴의 세부 위치 규칙으로 취급한다.

- `basic`
  - 원칙: 가능한 경우 `focus`
  - `focus`가 없는 도형은 `center` 수직선 위의 canonical point
- `center`
  - 각 도형이 정한 canonical `center`
  - 이 값의 의미는 도형별 규칙에 따른다
- `online`
  - `y`축과 도형이 만나는 상단 경계점

현재 코드에서는 `online`이 공통 토큰 `shape-y-axis-top`으로 해석된다.

### 6.3.a Pattern별 option 해석 메모

현재 `option`은 pattern마다 해석이 달라질 수 있다.

- `single > basic`
  - 가능한 경우 `focus`
  - 없으면 `center` 수직선 위 canonical point
- `single > center`
  - 해당 도형이 정한 canonical center
- `single > online`
  - `y`축 상단 경계 교점

- `vertex > basic`
  - 해당 도형의 canonical vertex set
- `vertex > center`
  - 편의상 현재는 `vertex > basic`과 동일하게 취급
- `vertex > online`
  - 인접 vertex pair 사이의 side/arc 위 대표점 집합

이 `vertex > center = basic` 규칙은 의미론적으로 완전한 최종형이라기보다, 현재 UI 구조를 유지하기 위한 운영상 편의 규칙이다.

- `strip > basic`
  - 맨위 꼭지점 기준 anchor를 사용
- `strip > center`
  - center를 지나는 strip
- `strip > online`
  - side 위 anchor를 기준으로 strip을 배치

### 6.4 Preset naming rule

- `patternId`는 scene/preset 이름이다.
- `pattern` 이름과 `preset` 이름을 섞지 않는다.
- 가능하면 preset 이름은 동작이나 장면 성격을 말하고, pattern 자체 이름을 중복하지 않는다.

### 6.4.a Direction 규칙

- UI의 `DIR`은 `direction`을 뜻한다.
- `direction`은 광선의 발사 방향 규칙이며, 위치나 배치 자체를 뜻하지 않는다.
- 현재 코드는 `options.sourceDirection`으로 저장/복원한다.
- 왼쪽 `DIR` UI에서 `Down`은 내부값 `down`에 대응한다.
- 대표 값:
  - `down`
  - `inward`
  - `outward`
  - `edge-normal`

예:

- 좋은 예: `edge-sweep`, `corner-echo`, `focus-lock`
- 나쁜 예: pattern 의미를 다시 반복하는 과도한 이름

### 6.5 구조 리팩토링 방향

큰 리팩토링 전까지는 아래 책임을 유지한다.

- `caustics/core/shape-config.js`
  - 도형별 `center`, `vertex`, 기본 기하 규칙
- `caustics/config/shape-registry.js`
  - `patternId`, `sourceOption`, UI copy
- `caustics/config/pattern-resolver.js`
  - token 해석 (`shape-focus`, `shape-center`, `shape-y-axis-top`)
- `caustics/core/state-mapper.js`
  - `sourcePattern`, `sourceOption`, `patternId`의 공식 적용 경로

다음 구조 개편 턴에서 목표로 삼을 것은 다음이다.

- shape geometry API 분리
- pattern layout 생성기 분리
- `single / vertex / strip`의 origin 생성 로직 통합
