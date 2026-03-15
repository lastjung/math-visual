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
    "sourceDirection": "string",   // 'parallel', 'inward', 'outward', 'edge-normal' (구 triangleDirectionMode)
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
        sourceDirection: 'parallel',
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
