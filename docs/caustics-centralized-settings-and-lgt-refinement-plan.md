# Caustics Lab: 중앙 설정 시스템 재설계 계획서

## 1. 목적

현재 `caustics`는 동작은 되지만, 설정이 아래 여러 층에 평평하게 흩어져 있다.

- `main.js`의 App state 기본값
- `core/shape-config.js`의 도형별 기본 위치와 기하 규칙
- `ui/panels.js`의 shape별 preset과 UI 카피
- `ui/controls.js`의 직접 state 조작
- `core/persistence.js`의 저장/복원 스키마

이 상태에서는 "어떤 도형에서 어떤 패턴을 쓰고, 그 패턴의 옵션과 포인터/슬라이더 값이 무엇인가"를 한 덩어리로 다룰 수 없다.

이번 설계의 목표는 단순한 상수 중앙화가 아니다. 목표는 아래 계층을 코드와 데이터 양쪽에서 명확히 만드는 것이다.

- `shape`
- `pattern`
- `options`
- `pointer`
- `sliders`

즉, 앞으로의 설정 시스템은 "앱 state의 낱개 키 집합"이 아니라 "도형 안의 패턴 단위 설정 모델"을 중심으로 돌아가야 한다.

## 2. 현재 문제 정의

### A. shape와 pattern이 분리되어 있지 않다

현재 shape 내부의 대표 장면은 실질적으로 `preset`으로 존재한다.

- circle: `Center Orbit`, `Wide Sweep`, `Parallel Wash`
- rect: `Top Bounce`, `Side Scan`, `Corner Echo`
- triangle: `Center Path`, `Edge Sweep`, `Triad Edge`

하지만 이 값들은 [panels.js](/Users/eric/PG/math-visual/caustics/ui/panels.js)에 `apply()` 함수로 박혀 있으며, 앱 레벨에서 독립적인 `pattern` 개념으로 관리되지 않는다.

### B. option / pointer / slider 값이 섞여 있다

현재 state는 모두 App 객체에 평평하게 놓여 있다.

- options 성격
  - `lightSourceMode`
  - `triangleSourceMode`
  - `triangleDirectionMode`
  - `baseStyle`
  - `flowMode`
  - `isPaintMode`
  - `isPaint2Mode`
  - `isLightMode`
- pointer 성격
  - `sourcePos`
  - `sourceAnchorPos`
  - `triangleSourceOffsets`
- slider 성격
  - `spread`
  - `rayNumber`
  - `raySpeed`
  - `sourceRotation`
  - `beamWidth`
  - `alphaIntensity`
  - `trianglePointCount`
  - `triangleVertexBias`
  - `MAX_BOUNCES`

이 구조 때문에 저장, preset 적용, shape 변경, 시뮬레이션 연출에서 매번 여러 값을 수동으로 묶어 만지고 있다.

### C. geometry rule과 data config가 분리되어 있지 않다

`shape-config.js`는 다음 두 종류를 동시에 맡고 있다.

- 도형별 기본값 데이터
- 기하 계산 로직

예:

- 데이터 성격: 도형별 기본 source 위치
- 로직 성격: triangle vertex 계산, inward/outward direction 계산, edge-normal 계산

이 둘은 분리해야 한다. 계산식까지 JSON으로 빼면 오히려 구조가 망가진다.

### D. persistence가 state 나열에 머물러 있다

[persistence.js](/Users/eric/PG/math-visual/caustics/core/persistence.js)는 현재 state 필드를 그대로 저장/복원한다.

이 방식은 다음에 취약하다.

- 신규 pattern 추가 시 저장 구조가 일관되지 않음
- 어떤 값이 "shape의 기본값"인지 "pattern이 덮은 값"인지 구분 불가
- 특정 패턴만 공유/교환하는 기능으로 확장하기 어려움

## 3. 새 목표 구조

앞으로의 기준 구조는 아래다.

```json
{
  "shape": "triangle",
  "pattern": "triad-edge",
  "options": {
    "lightSourceMode": "point",
    "sourceLayout": "triad",
    "sourceDirection": "edge-normal",
    "renderMode": "paint2",
    "baseStyle": "line",
    "flowMode": "none"
  },
  "pointer": {
    "sourcePos": { "x": 0, "y": 120 },
    "sourceAnchorPos": { "x": 0, "y": 0 },
    "sourceOffsets": []
  },
  "sliders": {
    "spread": 1.047,
    "rayNumber": 300,
    "raySpeed": 20,
    "sourceRotation": 0,
    "beamWidth": 1.6,
    "alphaIntensity": 1,
    "trianglePointCount": 5,
    "triangleVertexBias": 0.6,
    "maxBounces": 10
  }
}
```

핵심은 아래 두 가지다.

- shape는 도형의 큰 분류다.
- pattern은 그 도형 안의 대표 세팅 묶음이다.

그리고 각 pattern은 아래 3개 묶음을 가진다.

- `options`
- `pointer`
- `sliders`

## 4. 데이터와 로직의 경계

### 데이터로 관리할 것

- shape 메타 정보
- shape별 UI 카피
- shape별 pattern 목록
- pattern별 label / note / defaults
- narrative 목록
- 전역 slider 기본값
- 전역 option 기본값

### 로직으로 남길 것

- `size` 기반 좌표 해석
- focus 계산
- triangle vertex / layout 계산
- inward / outward / edge-normal 방향 계산
- shape switch 시 보정 규칙
- simulation 타이머와 장면 진행

즉 "무엇을 쓸지"는 데이터, "그 값을 실제 좌표/광선으로 해석하는 법"은 로직으로 남긴다.

## 5. 권장 스키마

순수 JSON보다 JS 데이터 모듈이 더 적합하다. 이유는 현재 preset 다수가 `size` 비례 좌표를 필요로 하기 때문이다.

### A. 전역 기본 스키마

```js
export const GLOBAL_DEFAULTS = {
  options: {
    lightSourceMode: 'point',
    sourceLayout: 'single',
    sourceDirection: 'parallel',
    renderMode: 'flow',
    baseStyle: 'line',
    flowMode: 'none'
  },
  sliders: {
    rayNumber: 30,
    raySpeed: 20,
    spread: Math.PI / 3,
    sourceRotation: 0,
    beamWidth: 1.6,
    alphaIntensity: 1,
    trianglePointCount: 5,
    triangleVertexBias: 0.6,
    maxBounces: 10
  }
};
```

### B. shape 레지스트리

```js
export const SHAPE_REGISTRY = {
  triangle: {
    label: 'Triangle',
    copy: {
      badge: 'Triangle',
      title: 'Triangle Study',
      description: '...',
      note: '...'
    },
    defaults: {
      options: {
        lightSourceMode: 'point',
        sourceLayout: 'single',
        sourceDirection: 'parallel'
      },
      pointer: {
        sourcePreset: 'shape-default',
        anchorPreset: 'shape-center'
      },
      sliders: {
        spread: Math.PI / 3
      }
    },
    patterns: {
      center-path: {
        label: 'Center Path',
        note: '...',
        options: {
          sourceLayout: 'single',
          sourceDirection: 'parallel',
          lightSourceMode: 'point'
        },
        pointer: {
          sourcePos: { x: 0, y: { unit: 'size', value: 0.12 } }
        },
        sliders: {
          spread: 0.3
        }
      }
    }
  }
};
```

### C. pointer 표현 방식

포인터 값은 raw pixel을 직접 저장할 수도 있고, preset token으로 저장할 수도 있다.

권장 방식:

- 런타임 저장값은 raw 좌표
- 정의 파일의 기본값은 token 또는 size-relative 표현 허용

예:

```js
pointer: {
  sourcePreset: 'shape-focus',
  anchorPreset: 'shape-center'
}
```

또는

```js
pointer: {
  sourcePos: { x: { unit: 'size', value: -0.3 }, y: { unit: 'size', value: 0.18 } }
}
```

이 표현은 적용 시 resolver가 실제 pixel 좌표로 바꾼다.

## 6. 현재 state와 새 모델의 매핑

### shape

- `app.shape` -> `shape`

### pattern

- 현재 없음
- `selectedSourcePresetSlot`과 `shapePresets()`가 사실상 pattern 역할
- 앞으로는 `patternId`를 독립 state로 보유

### options

- `lightSourceMode` -> `options.lightSourceMode`
- `triangleSourceMode` -> `options.sourceLayout`
- `triangleDirectionMode` -> `options.sourceDirection`
- `baseStyle` -> `options.baseStyle`
- `flowMode` -> `options.flowMode`
- `isPaintMode / isPaint2Mode / isLightMode` -> `options.renderMode`

`renderMode`는 아래처럼 정리하는 편이 낫다.

- `flow`
- `paint`
- `paint2`
- `light`

### pointer

- `sourcePos` -> `pointer.sourcePos`
- `sourceAnchorPos` -> `pointer.sourceAnchorPos`
- `triangleSourceOffsets` -> `pointer.sourceOffsets`

### sliders

- `rayNumber` -> `sliders.rayNumber`
- `raySpeed` -> `sliders.raySpeed`
- `spread` -> `sliders.spread`
- `sourceRotation` -> `sliders.sourceRotation`
- `beamWidth` -> `sliders.beamWidth`
- `alphaIntensity` -> `sliders.alphaIntensity`
- `trianglePointCount` -> `sliders.trianglePointCount`
- `triangleVertexBias` -> `sliders.triangleVertexBias`
- `MAX_BOUNCES` -> `sliders.maxBounces`

## 7. 파일 구조 제안

```text
caustics/
  config/
    app-defaults.js
    shape-registry.js
    pattern-resolver.js
    narratives.js
  core/
    shape-geometry.js
    persistence.js
    state-mapper.js
  ui/
    controls.js
    render-ui.js
    panels.js
```

### 역할

- `config/app-defaults.js`
  - 전역 기본 option / slider 값
- `config/shape-registry.js`
  - shape 메타와 pattern 정의
- `config/pattern-resolver.js`
  - size-relative / preset token을 실제 좌표로 해석
- `core/shape-geometry.js`
  - focus, vertices, normals, layout 계산
- `core/state-mapper.js`
  - config model <-> App runtime state 변환
- `core/persistence.js`
  - 새 schema 기준 저장/복원

## 8. 적용 원칙

### 원칙 1. preset은 pattern으로 승격한다

지금의 `shape preset slot` 구조는 UI 편의 기능일 뿐이다.

앞으로는:

- preset button은 특정 `patternId`를 선택하는 UI
- pattern 선택 시 `options / pointer / sliders` 묶음을 일괄 적용

으로 동작해야 한다.

### 원칙 2. shape default와 pattern default를 분리한다

둘은 같은 것이 아니다.

- shape default: 도형 전환 시의 기본 진입 상태
- pattern default: 특정 패턴 선택 시 적용되는 장면 세팅

이 둘을 섞으면 shape 전환 후 이상한 값이 남는 버그가 계속 생긴다.

### 원칙 3. geometry는 JSON화하지 않는다

triangle 쪽은 특히 규칙 기반 계산이 많다.

- vertex
- strip 배치
- inward / outward / edge-normal
- parallel range

이건 config가 아니라 해석 로직이다.

### 원칙 4. UI는 개별 state를 직접 조립하지 않는다

이상적인 흐름은 아래다.

1. UI가 `setShape(shapeId)` 호출
2. UI가 `setPattern(patternId)` 호출
3. UI가 `updateOption(key, value)` 호출
4. UI가 `updateSlider(key, value)` 호출
5. drag는 `updatePointer(path, value)` 호출

즉 `controls.js`가 App state를 곳곳에서 직접 두드리는 구조를 줄여야 한다.

## 9. 리스크 분석

이번 작업은 범위가 넓고 리스크가 실제로 있다.

### A. shape 전환 회귀 리스크

현재 `applyShapeSwitchReset()`은 아래 특수 케이스를 포함한다.

- center 상태 유지
- on-line 상태 유지
- triangle 전용 위치 보정
- parabola 강제 point 모드

새 구조로 옮길 때 이 동작을 잃으면 기존 사용감이 깨진다.

### B. triangle 모드 회귀 리스크

triangle은 가장 복잡하다.

- `single / triad / strip`
- `parallel / inward / outward / edge-normal`
- `sourceAnchorPos`
- `triangleSourceOffsets`

이 영역은 pattern 구조로 옮기되, 계산 로직을 무리하게 데이터화하면 바로 깨질 가능성이 높다.

### C. persistence 호환 리스크

기존 저장값은 flat state 구조다. 새 구조는 계층형이다.

필요 대응:

- 구버전 save를 읽는 migration
- 새 버전 save schema 명시
- 알 수 없는 필드 fallback 처리

### D. simulation 연출 리스크

현재 시뮬레이션은 preset slot이나 특정 state 조합에 의존한다.

예:

- rectangle A0 stage가 slot 번호를 직접 사용
- narrative가 state를 부분적으로 덮어씀

pattern화 후에는 slot 기반 참조를 `patternId` 기반으로 바꿔야 한다.

### E. render mode 정리 리스크

현재 `isPaintMode`, `isPaint2Mode`, `isLightMode`는 불리언 3개다.

이걸 `renderMode` 하나로 합치면 구조는 좋아지지만, 기존 분기 전체를 점검해야 한다.

## 10. 단계별 실행 플랜

### 0단계. 현재 세팅값을 새 구조로 저장 가능하게 만들기

목표:

- 기존 UI와 렌더 동작을 유지한 채, 현재 App state를 새 scene schema로 읽고 쓸 수 있게 만든다.

이 단계가 먼저 필요한 이유:

- 지금은 preset/pattern 구조를 먼저 바꾸면 회귀 범위가 너무 넓다.
- 반대로 현재 세팅값을 새 구조에 먼저 담을 수 있으면, 동작을 유지한 채 뒤에서 점진적으로 갈아탈 수 있다.
- 즉 "설계된 데이터 구조가 실제 현재 상태를 수용할 수 있는지"를 먼저 검증해야 한다.

작업:

- `scene schema`의 최소 버전 정의
- `readCurrentScene(app)` 구현
- `applyScene(app, scene)` 구현
- persistence에 새 schema 저장 경로 추가
- 초기에는 `patternId`를 필수로 두지 않고 `null` 허용

초기 최소 schema:

```js
{
  shape: 'triangle',
  patternId: null,
  options: { ... },
  pointer: { ... },
  sliders: { ... }
}
```

완료 기준:

- 현재 화면의 세팅값을 새 구조로 직렬화할 수 있음
- 새 구조를 다시 App state에 주입해도 같은 장면이 복원됨
- UI 코드를 아직 pattern 구조로 바꾸지 않아도 됨

### 1단계. 설정 모델 명세 확정

목표:

- 새 schema를 문서와 코드에서 고정

작업:

- `shape / pattern / options / pointer / sliders` 키 확정
- 기존 state 키 매핑표 작성
- `renderMode` 통합 여부 결정
- persistence version 증가 계획 수립

완료 기준:

- 문서 기준으로 모든 기존 state가 새 구조의 어디로 가는지 설명 가능

주의:

- 이 단계는 0단계 이후에 진행한다.
- 즉 "schema 정의"보다 "현재 state를 schema로 담아보는 것"이 먼저다.

### 2단계. config 레이어 도입

목표:

- 정적 데이터와 geometry 로직 분리

작업:

- `config/app-defaults.js` 생성
- `config/shape-registry.js` 생성
- narratives 분리
- `ui/panels.js`의 copy와 preset 정의를 registry 기반으로 이전

완료 기준:

- shape copy와 pattern 데이터가 App/UI 코드 밖으로 빠짐

### 3단계. pattern resolver 도입

목표:

- size-relative 값과 preset token 해석 체계 마련

작업:

- `pattern-resolver.js` 생성
- `shape-default`, `shape-center`, `shape-focus` 같은 pointer preset 정의
- size unit 값을 pixel로 변환하는 resolver 구현

완료 기준:

- pattern 정의에서 `size` 계산식을 직접 쓰지 않아도 기본 장면 적용 가능

### 4단계. App state adapter 도입

목표:

- 새 config model과 기존 runtime state 사이의 변환층 마련

작업:

- `state-mapper.js` 생성
- `applyPattern(app, patternId)` 구현
- 0단계에서 만든 `readCurrentScene(app)` / `applyScene(app, scene)`를 adapter 내부로 정리
- UI는 이 adapter를 거쳐 pattern/state를 다루게 변경

완료 기준:

- preset 적용 로직이 `ui/render-ui.js`의 수동 대입에서 빠짐

### 5단계. UI control 경로 정리

목표:

- `controls.js`의 직접 state 조작 축소

작업:

- pattern 선택은 `setPattern`
- slider 입력은 `updateSlider`
- mini-tab은 `updateOption`
- drag는 `updatePointer`

완료 기준:

- 대부분의 UI 변경이 공통 update API를 통해 흐름

### 6단계. persistence 마이그레이션

목표:

- 구버전 저장값과 신버전 저장값 모두 안전하게 처리

작업:

- storage key 또는 version 필드 갱신
- flat state -> scene schema migration 구현
- 알 수 없는 patternId fallback 정의

완료 기준:

- 기존 사용자 저장값을 읽어도 앱이 깨지지 않음

### 7단계. simulation 참조 교체

목표:

- slot 기반 참조를 pattern 기반 참조로 치환

작업:

- `UI.applyShapePreset(app, slot)` 의존 제거
- simulation stage에서 `patternId` 사용
- narrative 연출에서 option/pointer/slider 덮어쓰기 규칙 정리

완료 기준:

- simulation이 숫자 slot 없이도 동작

### 8단계. LGT / incremental mode 검증

목표:

- 새 구조에서 기존 렌더 동작이 유지되는지 확인

작업:

- `paint2`, `light`, `parallel`, `converge` 조합 점검
- slider 변경 시 `resetRays` 조건 재점검
- pointer drag 중 incremental 모드 유지 여부 점검

완료 기준:

- 주요 모드에서 기존 대비 체감 회귀가 없음

## 11. 우선순위

이번 작업의 우선순위는 아래 순서를 권장한다.

1. 현재 세팅값을 새 scene schema로 저장/복원 가능하게 만들기
2. 데이터 모델 확정
3. pattern registry 도입
4. applyPattern / readCurrentScene adapter 정리
5. persistence migration
6. simulation 참조 교체
7. 그 다음에야 LGT 개선

즉 LGT 문제는 중요하지만, 중앙 설정 구조보다 먼저 잡으면 다시 엮인다.

## 12. 비목표

이번 단계에서 하지 않을 것:

- geometry 계산을 JSON으로 옮기기
- renderer 전체를 한 번에 재작성하기
- simulation narrative 전부를 선언형 DSL로 바꾸기
- 모든 App state를 즉시 제거하기

이번 단계는 "기존 동작을 유지하면서 설정 구조를 재정렬하는 것"이 핵심이다.

## 13. 최종 판단

이 작업은 작은 정리 작업이 아니다. 실제로는 아래를 건드리는 중간 이상 규모의 구조 개편이다.

- state model
- preset 시스템
- persistence
- UI event 경로
- simulation 참조

따라서 한 번에 끝내는 식으로 밀어붙이면 회귀가 날 가능성이 높다.

정답은 단계적으로 옮기는 것이다.

- 먼저 현재 App state를 새 scene 구조에 담고 복원 가능하게 만든다.
- 먼저 `shape > pattern > options > pointer > sliders` 모델을 고정한다.
- 그 다음 기존 preset을 pattern으로 승격한다.
- 그 다음 UI와 persistence를 새 구조에 맞춘다.

이 순서로 가야 범위를 통제하면서도 나중에 확장 가능한 기반이 생긴다.

## 14. 운영 규칙

앞으로 `caustics` 설정 구조를 수정할 때는 아래 스킬을 기준 규칙으로 사용한다.

- [caustics-settings-governor](/Users/eric/PG/math-visual/caustics/skills/caustics-settings-governor/SKILL.md)

적용 대상:

- preset / pattern 추가 및 수정
- slider / pointer / option 추가 및 수정
- scene schema 변경
- persistence 경로 변경
- simulation에서 설정 적용 방식 변경

즉, 이후 설정 관련 작업은 ad-hoc으로 하지 않고 이 스킬의 분류 규칙과 변경 절차를 따른다.

---
**작성일**: 2026-03-15
**작성 기준**: `/caustics` 현재 코드 구조
**문서 상태**: 기존 상수 중앙화 메모를 대체하는 재설계 문서
