# 5_마스터계획-검토서

## 문서 정보

- **대상 문서:** [1_master-refactor-plan.md](./1_master-refactor-plan.md)
- **검토자:** 재민 (Jaemin)
- **검토 일시:** 2026-03-30
- **상태:** ✅ 승인 (Approved)

---

## 검토 요약

`1_마스터계획`은 현재 비대해진 `caustics` 모듈의 구조적 한계를 정확히 짚어냈으며, 이를 해결하기 위한 단계적이고 안전한 리팩터링 경로를 제시하고 있습니다. 특히 동작 변경 없이 구조만 정리하는 'Behavioral Parity' 원칙이 잘 반영되어 있어 리스크가 낮고 실행 가능성이 높습니다.

---

## 상세 검토 내용

### 1. 구조 설계 (Structure)
- **의견:** `core/`, `ui/`, `sim/`, `render/`로 이어지는 4대 레이어 구성이 매우 명확함.
- **강점:** `ui/elements.js`를 통한 DOM 참조 일원화는 향후 UI 변경 시 유지보수 비용을 현저하게 낮춰줄 것으로 기대됨.
- **제안:** `core/app-state.js`가 단순 상태 저장소인지, 아니면 상태 변경 로직(Setter/Reducer)까지 포함하는지 범위를 명확히 하면 구현 시 혼선이 적을 것임.

### 2. 실행 전략 (Strategy)
- **의견:** Phase 1(내부 분리) → Phase 2(오케스트레이션) → Phase 3(UI 바인딩) → Phase 4(폴더 재배치) 순서가 매우 합리적임.
- **강점:** 파일 이동 전에 논리적 경계부터 나누는 접근법은 `import` 경로 오류로 인한 전체 시스템 마비를 방지하는 핵심 안전장치임.

### 3. 리스크 관리 (Risk Management)
- **의견:** `app` 객체 공유로 인한 결합도를 주입(Injection) 방식으로 해결하려는 계획이 적절함.
- **강점:** 타이머 체인 누락(`simTimers`)과 순환 참조에 대한 대응책이 구체적으로 기술되어 있음.
- **보완 제안:** 리팩터링 중 발생할 수 있는 캐시 충돌(localStorage 등)을 고려하여, 초기화 시점에 `persistState`를 일시 비활성화하거나 버전 체크를 수행하는 루틴을 Phase 1에 포함할 것을 권장.

---

## 검증 체크리스트 (Verification)

리팩터링 수행 시 아래 항목을 중점적으로 검수할 계획입니다:

- [ ] `main.js`의 라인 수가 300라인 이하로 감소했는가?
- [ ] `App` 객체 생성과 모듈 조립 책임이 `main.js`에만 국한되는가?
- [ ] 내러티브 시뮬레이션(Narrative Simulation)이 끊김 없이 동작하는가?
- [ ] 모든 UI 인터랙션(슬라이더 등)의 사이드 이펙트(update 등)가 누락 없이 트리거되는가?

## 진행 상황 확인 (Progress Confirmation)

`4_progress-status.md`를 통해 확인된 현재 시점의 리팩터링 준비 상황을 검토한 결과입니다:

- **구조적 기반:** `/caustics/docs` 하위의 서브폴더 분리와 상태 문서 정리가 계획대로 완료되었습니다. 이는 후속 리팩터링의 가독성을 보장하는 중요한 초기 작업입니다.
- **개념 정의:** 광원 설정 모델(`pattern`, `option`, `direction`, `sourceMode`)의 재정립과 용어 통일(`triad` -> `vertex` 등)이 적절히 수행되었습니다.
- **실전 분리 대상 확정:** `2_광원구조계획`의 Phase 1 결과에 따라, `pattern-layout.js`, `direction-resolver.js`, `source-mode-resolver.js`로의 코드 분리가 타당함을 확인했습니다. 

### 코드 기반 확인 결과 (Code-Based Findings)

이번 검토에서는 계획 문서만 본 것이 아니라 현재 코드의 실제 함수 경계를 함께 확인했습니다.

- **`shape geometry` 계층 후보 확인**
  - `caustics/core/shape-config.js`
  - `getShapeDefaults`
  - `getShapeLayoutCenter`
  - `getTriangleVertices`
  - `getRectVertices`
  - `getVertexLayoutPoints`
  - `getVertexOnlinePoints`
  - `getStripAnchorPoint`
- **`pattern layout` 계층 후보 확인**
  - `caustics/core/shape-config.js`
  - `getTriangleBaseOrigins`
  - `getTriangleSourceOrigins`
  - `caustics/core/state-mapper.js`
  - `applySourceOption` 내부의 `strip` anchor 보정
- **`direction` 계층 후보 확인**
  - `caustics/core/shape-config.js`
  - `getTriangleLaunchAngle`
  - 현재 `down / inward / outward / edge-normal` 계산이 한 함수에 모여 있음
- **`sourceMode` 계층 후보 확인**
  - `caustics/main.js`
  - `buildLaunchRayConfigs`
  - `recalcParallelRange`
  - `normalizeLightSourceMode`

### 검토 판단

- 계획 문서의 계층 구분은 실제 코드 구조와 어긋나지 않음
- 특히 `shape-config.js`에 geometry와 layout이 함께 들어 있다는 진단은 코드와 정확히 일치함
- 다음 실제 분리 시작점을 `pattern-layout.js`로 잡은 판단은 타당함
- `getTriangleLaunchAngle`와 `buildLaunchRayConfigs`를 다음 분리 축으로 보는 것도 적절함

---

## 코드 상시 검토 의견 (Continuous Review Opinions)

리팩터링이 진행됨에 따라 코드 베이스에서 발견한 **추가 개선 과제**들을 기록합니다:

### 1. `main.js`의 잔존 로직 격리 가시화
- **`buildLaunchRayConfigs` (Source Mode 계층):** `main.js`에서 가장 비대한 설정 로직 중 하나입니다. Parallel, Converge, Triangle 모드에 따른 분기 로직은 `core/source-mode-resolver.js`로 완전히 이전되어야 합니다.
- **`getLaunchHue` (Color 계층):** 현재 `main.js` 내부에 잠겨 있는 컬러 분포 로직은 렌더링 파이프라인의 일부로 보거나 독립된 컬러 전략 모듈로 분리할 필요가 있습니다.

### 2. `core/shape-config.js` 책임 분산 가속화
- 현재 이 파일은 **도형 기하학(Geometry)**과 **광원 배열(Layout)**이 강하게 결합되어 있습니다.
- **`getTriangleBaseOrigins`**: `vertex`, `strip` 등의 패턴에 따라 물리적 배치를 결정하므로 `core/pattern-layout.js`로 분리가 시급합니다.
- **`getTriangleLaunchAngle`**: 방향성을 결정하는 로직은 `core/direction-resolver.js`로 독립시켜 `shape-config`는 순수 기하학 정보만 남겨야 합니다.

### 3. 상태 접근성(Accessibility) 제언
- `app` 객체를 통째로 넘기는 현재의 방식은 과도한 결합을 야기할 수 있습니다. 각 기능 모듈이 `SimulationState`의 서브셋만 소유하거나 주입받는 인터페이스 설계를 Phase 2에서 검토해야 합니다.

---

## 향후 리팩터링 권장 순서 (Recommended Steps)

1. **`core/pattern-layout.js` 생성:** `getTriangleBaseOrigins` 계열 로직 적출 (Layout 독립)
2. **`core/direction-resolver.js` 생성:** `getTriangleLaunchAngle` 계열 로직 적출 (Direction 독립)
3. **`core/source-mode-resolver.js` 생성:** `main.js`의 `buildLaunchRayConfigs` 및 모드 처리 로직 적출 (Source Mode 독립)

---

## 진행 상황 상시 업데이트 (Live Status Update)

### 1~4단계: 광원 논리 구조 완전 분리 완료 (2026-03-30)
- **완료:** 핵심 물리 도메인 계층화 및 `main.js` 비대함 해결 성공.

### 5단계: CSS 구조 현대화 (Phase 4 완료)
- **완료:** `base`부터 `player`, `sidebar`까지 총 8개 핵심 모듈 분리 완료.
- **결과:** `style.css`를 순수 **임포트 허브(Import Hub)**로 전환 완료. 파일별 책임이 명확해짐.
- **특이사항:** `.time-label` 중복 선언 등 식별된 기술 부채가 분리 과정에서 통합 정리됨.

### 6단계 예정: 최종 정리 및 유틸리티 분리 (Phase 5)
- **대상:** `utilities.css` 생성 및 `legacy-notes.md` 작성.
- **검토 의견:**
  - 공통 상태 클래스(`active`, `hidden` 등)를 하나의 유틸리티 레이어로 통합하여 디자인 시스템의 일관성을 마무리할 단계임.
  - 리팩터링 중 발견된 미사용 추정 selector들을 `legacy-notes.md`에 기록하여 향후 최적화의 단초를 제공해야 함.
- **목표:** CSS 리팩터링의 완전한 종료 및 향후 유지보수를 위한 기록물 완성.

---

## 최종 결론 및 승인

본 검토자는 `caustics` 모듈의 시각적/구조적 현대화가 성공적으로 안착되었음을 확인했습니다. 이제 마지막 **Phase 5 (Final Cleanup)** 단계를 거쳐 CSS 리팩터링을 마무리지을 것을 **승인**합니다.

`ㄱㄱ` 명령이 하달되는 즉시 최종 유틸리티 정리 및 문서화 작업에 동참하겠습니다.
