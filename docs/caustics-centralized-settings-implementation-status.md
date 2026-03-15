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
- **`caustics/core/state-mapper.js` 확장**:
    - `updateOption`, `updateSlider`, `updatePointer` 구현 완료.
    - `isWindowFull`, `currentNarrative`, `autoMode`, `parallelRange` 등 누락되었던 모든 경로 수용 가능하도록 채널 확장.
- **`caustics/ui/controls.js` 전면 리팩토링**:
    - `beamWidth`, Fullscreen 토글, 키보드 단축키, 마우스 드래그를 포함한 **모든** 입력 경로에서 직접 대입 제거.
    - 사이드 이펙트(autoMode 해제, resetRays 등)가 API 내부로 통합되어 이벤트 핸들러 코드 간결화.
- **`caustics/ui/render-ui.js` 정제**:
    - 프리셋 적용 로직을 `app.applyPattern()`으로 대체하여 하드코딩 중복 제거.

---

## 🟡 6단계: Simulation 로직 및 Persistent 통합 (대기 중)
- **다음 작업**: 시뮬레이션 코드(`core/simulator.js` 등) 및 `persistence.js`의 완전한 Scene Schema 통합 작업 진행.
