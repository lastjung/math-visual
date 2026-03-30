# Caustics Lab: 구현 상태 로그 (Implementation Status Log)

이 문서는 `docs/caustics-centralized-settings-and-lgt-refinement-plan.md` 계획에 따른 작업 진행 상황을 기록합니다.

---

## 🟢 0단계: 현재 세팅값을 새 구조로 저장 가능하게 만들기 (완료)
**작성일**: 2026-03-15
**목표**: 기존 동작을 유지하며 App state를 새 scene schema로 읽고 쓸 수 있는 기반 마련.

### 1. 주요 변경 및 확인 사항
- **`caustics/core/state-mapper.js` 신규 생성**
- **`caustics/core/persistence.js` 수정**: `scene` 구조 병행 저장 및 복원 적용.
- **수동 확인 결과**: 현재 상태를 `readCurrentScene`으로 추출하고 `applyScene`으로 주입했을 때 시각적으로 이전과 동일한 장면이 복원됨을 육안으로 확인하였음.

---

## 🟢 1단계: 설정 모델 명세 확정 (완료)
**작성일**: 2026-03-15
**목표**: 새 scene schema의 키 이름과 경계를 확정하고 매핑표 완성.

### 1. 주요 산출물
- **`docs/caustics-config-model-specification.md`**: 최종 스키마 드래프트 및 매핑표 작성.
- **`caustics/config/app-defaults.js`**: 전역 기본값 초안 파일 생성.
- **`renderMode` 통합안**: `isPaintMode`, `isPaint2Mode`, `isLightMode`를 하나로 합치는 설계 제안 완료.

### 2. 키 이름 변경 (명세 고정)
- `triangleSourceMode` → `options.sourceLayout`
- `triangleDirectionMode` → `options.sourceDirection`
- `MAX_BOUNCES` → `sliders.maxBounces`

### 3. 코드 반영
- `state-mapper.js` 내 명칭을 고정된 명세에 맞춰 업데이트 완료.

---

## 🟢 2단계: config 레이어 도입 - 정적 데이터 분리 (완료)
**작성일**: 2026-03-15
**목표**: UI 코드와 로직에 흩어져 있던 정적 데이터(도형 메타, 패턴, 카피)를 레지스트리로 분리 및 적용 완료.

### 1. 주요 산출물
- **`caustics/config/shape-registry.js` 신규 생성**:
    - 모든 도형의 UI 카피 및 메타데이터 통합 완료.
    - 프리셋 데이터를 새 `scene schema` 구조로 정의.
- **`ui/panels.js` 리팩토링 완료**:
    - 하드코딩된 대량의 데이터를 제거하고 `SHAPE_REGISTRY` 참조로 일원화.
    - `shapePresets` 내에 임시 resolver를 구현하여 새 스키마 데이터를 기존 App state로 브릿징(Remapping).

---

## 🟢 3단계: pattern resolver 도입 (완료)
**작성일**: 2026-03-15
**목표**: 추상적인 패턴 데이터(Token, Units)를 구체적인 상태값으로 변환하고 브릿지 매핑 로직 공식화.

### 1. 주요 산출물
- **`caustics/config/pattern-resolver.js` 신규 생성**:
    - `resolvePointer`: `shape-focus`, `shape-center` 토큰 및 `size` 단위 비례 좌표 해석 로직 포함.
    - `resolvePattern`: 옵션, 포인터, 슬라이더를 통합 해석하고 기존 App state 키로 Remapping 하는 브릿지 역할 수행.
- **`ui/panels.js` 업데이트**:
    - 내부의 임시 리졸버 로직을 제거하고 `resolvePattern` 공식 모듈을 사용하도록 변경.

---

## 🟢 4단계: App state adapter 도입 (완료)
**작성일**: 2026-03-15
**목표**: UI 도우미에 흩어져 있던 패턴 적용 로직을 중앙 상태 어댑터(`state-mapper.js`)로 상향 조정 및 공식화.

### 1. 주요 산출물
- **`caustics/core/state-mapper.js` 확장**:
    - `applyPattern(app, patternId)` 신규 구현: 레지스트리에서 패턴을 가져와 리졸버를 거쳐 앱 상태에 안전하게 적용하는 공식 경로 마련.
- **`caustics/main.js` 업데이트**:
    - `App.applyPattern(patternId)` 메서드를 추가하여 외부(UI 등)에서 일관된 방식으로 설정을 변경할 수 있도록 노출.
- **`ui/panels.js` 정제 완료**:
    - UI 패널이 직접 리졸버를 호출하던 방식에서 벗어나, `app.applyPattern()`을 사용하는 표준 위임 구조로 변경.

---

## 🟢 5단계: UI control 경로 정리 (완료)
**작성일**: 2026-03-15
**목표**: `controls.js` 내의 모든 직접적인 state 조작을 `updateOption`, `updateSlider`, `updatePointer` 등의 공통 API로 추상화 완료.

### 1. 주요 산출물
- **`caustics/core/state-mapper.js` 확장**: `parallelRange`를 포함한 모든 입력 경로를 수용하는 공통 API 완성.
- **`caustics/ui/controls.js` 리팩토링**: 모든 UI 입력 및 드래그 로직에서 직접 대입 제거.

---

## 🟢 6단계: Simulation 로직 및 Persistence 통합 (완료)
**작성일**: 2026-03-15
**목표**: Flat state 직접 참조를 줄이고 Scene Schema 중심으로 통합.

### 1. 주요 산출물
- [x] **영속성(Persistence) 완전 전환**: `readCurrentScene` / `applyScene` 기반으로 저장/복원 로직 단일화 완료.
- [x] **시뮬레이션 참조 경로 API화**: `simulation-runner.js` 내부의 직접 속성 조작을 `updateSlider`, `updateOption`, `updatePointer` 등으로 치환 완료.
- [x] **Pattern 기반 전환 완료**: 시뮬레이션과 UI에서 숫자 `slot` 대신 `patternId`를 직접 사용하도록 정리 완료.
- [x] **UI Preset 버튼 정규화**: `data-pattern-id`를 기준으로 `app.applyPattern()`이 호출되도록 경로 통일 완료.

## 🟢 7단계: 최종 정리 및 레거시 제거 (완료)
- **달성 현황**:
    - [x] **레거시 참조 완전 제거**: `selectedSourcePresetSlot` 및 `data-preset-slot` 기반 로직 삭제 완료.
    - [x] **UI 통로 단일화**: 프리셋 버튼을 `data-pattern-id`와 `shape-preset-index-N` ID 구조로 정리 완료.
    - [x] **브릿지 로직 중앙화**: `pattern-resolver.js`의 파편화된 리매핑 코드를 제거하고 `state-mapper.js`의 공통 API(`updateOption` 등)로 통합 완료.
    - [x] **영속성 데이터 정제**: 하이브리드 복원 로직을 제거하고 Scene Schema 전용 복원 경로로 확정 완료.
- **제거된 항목 리스트**:
    - `App.selectedSourcePresetSlot` 속성
    - `persistence.js`의 Flat state fallback 로직
    - `controls.js`의 `data-preset-slot` 처리 루프
    - `pattern-resolver.js`의 `remapped` 브릿지 블록

## ✅ 최종 요약
Caustics 앱의 상태 관리와 UI 제어 경로는 중앙 집중형 Scene Schema 구조로 정리되었다. 모든 주요 설정 변경은 공통 API를 거치고, 영속성 및 프리셋 시스템은 같은 데이터 규격을 공유한다.

## 후속 작업 규칙

이후 `caustics` 설정 관련 변경은 아래 스킬을 기준으로 진행한다.

- [caustics-settings-governor](/Users/eric/PG/math-visual/caustics/skills/caustics-settings-governor/SKILL.md)

이 스킬은 설정을 `shape / patternId / options / auto / pointer / sliders`로 분류하고, 각 변경이 어느 파일과 경로를 통해 들어가야 하는지 고정한다.

---

## 🟡 2026-03-30: Pattern / Option 규칙 재고정 (문서화 완료)

**목표**: 최근 대화에서 확정한 `pattern`, `option`, `preset` 의미를 현재 코드 기준으로 다시 고정.

### 반영된 규칙

- `sourcePattern`은 광원 형태다: `single | vertex | strip`
- `sourceOption`은 세부 위치 옵션이다: `basic | center | online`
- `sourceDirection`은 광선 방향 규칙이다
- `patternId`는 왼쪽 프리셋 버튼이 선택하는 scene preset이다

### option 규칙

- `basic`: 가능한 경우 `focus`, 없으면 `center` 수직선 위 canonical point
- `center`: 각 도형이 정한 canonical center
- `online`: `y`축 상단에서 도형 경계와 만나는 점

### pattern별 보정 규칙

- `vertex > center`는 현재 편의상 `vertex > basic`과 동일하게 취급한다.
- 이유: `vertex` 패턴에서 `center`를 별도 의미로 엄밀히 정의하면 개념 충돌이 커지므로, 현재 UI 구조를 유지하면서 규칙을 단순화하기 위함.
- `strip > basic`: 맨위 꼭지점 기준
- `strip > center`: center 기준
- `strip > online`: side 위 anchor 기준

### 코드 반영 메모

- `sourceOption`은 현재 scene state에 포함된다
- `online`은 `shape-y-axis-top` 토큰으로 공통 처리된다
- `ellipse basic`은 타원 내부 초점 쪽으로 수정 완료

### 다음 구조 작업 메모

- `shape geometry`와 `pattern layout` 분리는 아직 미실행
- 이 작업은 별도 리팩토링 턴에서 수행
