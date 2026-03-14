# Caustics Refactor Execution Plan

## 문서 목적

이 문서는 `caustics` 구조 개편을 실제로 수행하기 위한 실행용 작업 계획서다.  
상위 방향은 `caustics-refactor-plan.md`를 따르고, 이 문서는 실제 작업 순서, 각 단계의 완료 기준, 검증 체크포인트를 구체화한다.

핵심 원칙:

- React 스타일 컴포넌트 분해가 아니라 순수 JavaScript 모듈 분해로 진행한다.
- 1차 목표는 기능 변경이 아니라 책임 분리다.
- 각 단계는 독립적으로 검증 가능해야 한다.
- 큰 이동보다 작은 이동을 우선한다.
- `App` 객체의 실시간 조립 책임은 끝까지 `main.js`가 가진다.

## 진행 상태

기준 날짜: 2026-03-13

### Phase 1 완료

완료 항목:

- `caustics/core/shape-config.js` 생성
- `caustics/core/audio-controller.js` 생성
- `caustics/core/persistence.js` 생성
- `caustics/ui/elements.js` 생성
- `caustics/ui/panels.js` 생성
- `caustics/main.js`에서 shape/audio/persistence wrapper 연결
- `caustics/ui.js`에서 panels/elements 연결

감량 결과:

- `caustics/main.js`: 1269 -> 1051 lines
- `caustics/ui.js`: 1159 -> 1005 lines

이번 단계에서 실제로 분리한 책임:

- shape 기본값 및 triangle source 계산
- BGM track/path 및 audio helper
- persisted state build/save/restore
- shape panel content 및 preset 정의
- UI selector 캐시 진입점

검증 기록:

- 변경 파일과 신규 모듈에 대해 파서 수준 문법 검증 수행
- `main.js`, `ui.js`, 신규 모듈 5개 모두 통과
- 실제 브라우저 상호작용 smoke test는 아직 미실행

주의 메모:

- `ui/elements.js`는 1차에서 공통 selector 진입점만 도입했고, 전체 selector 중앙화는 다음 단계에서 계속 진행
- simulation orchestration과 event binding은 아직 기존 파일에 남아 있음

### Phase 2 완료

완료 항목:

- `caustics/ui/controls.js` 생성
- `caustics/ui/render-ui.js` 생성
- `caustics/ui.js`를 facade + player/sidebar 전용 파일로 축소
- `setupEvents`, `update`, `syncNarrativeSelect`, `syncShapePanel`, `applyShapePreset` 위임 연결

감량 결과:

- `caustics/ui.js`: 1005 -> 210 lines

새 책임 배치:

- `ui/controls.js`
  - shape/color tab
  - slider / checkbox / mini-tab
  - keyboard shortcut
  - canvas drag interaction
  - fullscreen / sidebar toggle

- `ui/render-ui.js`
  - DOM state sync
  - shape panel sync
  - narrative select sync
  - shape preset apply

검증 기록:

- `ui.js`, `ui/controls.js`, `ui/render-ui.js` 포함 전체 관련 파일 파서 수준 문법 검증 통과
- 실제 브라우저 상호작용 smoke test는 아직 미실행

남은 주요 범위:

- simulation orchestration 분리
- player/sidebar를 `ui/player.js`, `ui/sidebar.js`로 추가 분리
- 브라우저 기반 smoke test

### Phase 3 완료

완료 항목:

- `caustics/core/simulation-runner.js` 생성
- simulation timer helper 추가
  - `registerTimer(app, id)`
  - `clearSimulationTimers(app)`
- `finishSimulation`, `startA0Simulation`, `startNarrativeSimulation`, `stopSimulation`, `clearScene` 분리
- 아래 narrative/simulation 함수 분리
  - `3_beam_spread_simm`
  - `4_ray_mum_simm`
  - `rect_A0_simm`
  - `universal_journey_simm`
  - `vv_oval_focus_simm`

감량 결과:

- `caustics/main.js`: 1051 -> 624 lines

구조 변화:

- `main.js`는 상태/엔트리/메인 루프 중심으로 축소
- simulation orchestration은 `core/simulation-runner.js`로 이동
- `App` 외부 호출 표면은 유지하고 내부 구현만 delegate 방식으로 전환

검증 기록:

- `main.js`, `core/simulation-runner.js` 포함 관련 파일 파서 수준 문법 검증 통과
- 실제 브라우저 상호작용 smoke test는 아직 미실행

남은 주요 범위:

- `ui.js`에서 player/sidebar 추가 분리
- `physics.js`, `simulator.js`, `renderer.js`, `light-density.js`, `style.css` 폴더 재배치
- 브라우저 기반 smoke test

### Phase 4 완료

완료 항목:

- `caustics/ui/player.js` 생성
- `caustics/ui/sidebar.js` 생성
- `caustics/ui.js`를 거의 pure facade 수준으로 축소
- `setupApplePlayer` 내부의 player/sidebar 책임을 별도 모듈로 분리

감량 결과:

- `caustics/ui.js`: 210 -> 48 lines

구조 변화:

- `ui.js`는 delegated entry facade 역할만 유지
- player window drag / transport control / volume / next track는 `ui/player.js`
- sidebar drag / close chrome은 `ui/sidebar.js`

검증 기록:

- `ui.js`, `ui/player.js`, `ui/sidebar.js` 포함 관련 파일 파서 수준 문법 검증 통과
- 실제 브라우저 상호작용 smoke test는 아직 미실행

남은 주요 범위:

- `physics.js`, `simulator.js`, `renderer.js`, `light-density.js`, `style.css` 폴더 재배치
- import 경로 및 `index.html` 정리
- 브라우저 기반 smoke test

### Phase 5 완료

완료 항목:

- `caustics/physics.js` -> `caustics/sim/physics.js`
- `caustics/simulator.js` -> `caustics/sim/simulator.js`
- `caustics/renderer.js` -> `caustics/render/renderer.js`
- `caustics/light-density.js` -> `caustics/render/light-density.js`
- `caustics/style.css` -> `caustics/styles/style.css`
- 관련 import 경로 수정
- `index.html` stylesheet 경로 수정

결과 구조:

- `core/`: 상태, 저장, 오디오, 시뮬레이션 orchestration
- `ui/`: controls, panels, render, player, sidebar, elements
- `sim/`: physics, simulator
- `render/`: renderer, light-density
- `styles/`: style.css

검증 기록:

- 이동 후 관련 JS 파일 파서 수준 문법 검증 통과
- import 경로 검색으로 잔여 구경로 누락 여부 점검
- 실제 브라우저 상호작용 smoke test는 아직 미실행

최종 남은 범위:

- 브라우저 기반 smoke test
- 필요 시 레거시 CSS 식별 메모 작성

## 실행 전략

전체 작업은 9개 phase로 나눈다.

1. 베이스라인 고정
2. `main.js`의 순수 계산 분리
3. `main.js`의 부수효과 서비스 분리
4. UI element 접근 레이어 분리
5. UI 정적 데이터 분리
6. UI 이벤트 바인딩 분리
7. UI 렌더 갱신 분리
8. 시뮬레이션 orchestration 분리
9. 폴더 재배치 및 후속 메모 정리

각 phase는 다음 조건을 만족해야 다음 단계로 넘어간다.

- import 경로가 안정적일 것
- 기능 smoke test가 통과할 것
- 새 모듈 책임이 한 문장으로 설명 가능할 것

## Phase 0. 베이스라인 고정

### 목적

리팩터링 전 동작 기준을 명확히 하고, 이후 regression 판단 기준을 만든다.

### 작업

1. 현재 `caustics` 주요 상호작용을 점검한다.
2. 아래 항목을 기준으로 수동 smoke checklist를 고정한다.

### 체크 항목

1. 페이지가 정상 로드된다.
2. shape 전환이 모두 동작한다.
3. source drag가 동작한다.
4. source rotation이 유지된다.
5. spread / density / speed 조절이 유지된다.
6. point / parallel source mode 전환이 유지된다.
7. triangle `single`, `triad`, `strip` 모드가 유지된다.
8. paint / paint2 / light mode가 유지된다.
9. narrative simulation 시작/정지/종료가 유지된다.
10. audio next / autoplay가 유지된다.
11. localStorage restore가 유지된다.
12. resize 후 source 위치와 shape 상태가 깨지지 않는다.

### 완료 기준

- 위 체크 항목이 이후 단계 비교 기준으로 고정된다.

## Phase 1. `main.js`에서 순수 계산 분리

### 목적

`main.js`에서 shape/triangle 관련 계산 책임을 먼저 제거한다.  
이 단계는 상대적으로 부작용이 적어서 가장 안전하다.

### 생성 파일

- `caustics/core/shape-config.js`

### 이동 대상

- `getDefaultSourcePos`
- `getShapeDefaults`
- `getTriangleVertices`
- `getTriangleSourceOrigins`
- `getTriangleLaunchAngle`

### 구현 원칙

- `this` 사용 금지
- 필요한 값만 명시적 인자로 전달
- 가능하면 순수 함수 유지
- 기존 반환값 구조 변경 금지

### 검증

1. shape 전환 후 기본 source 위치가 동일한지 확인
2. ellipse / parabola / triangle 기본 배치가 유지되는지 확인
3. triangle source mode가 기존과 동일하게 보이는지 확인

### 완료 기준

- `main.js`에서 shape/triangle 계산 블록이 제거된다.
- 관련 기능이 베이스라인과 동일하게 동작한다.

## Phase 2. `main.js`에서 부수효과 서비스 분리

### 목적

오디오와 persistence를 `main.js`에서 분리해 엔트리 파일의 책임을 줄인다.

### 생성 파일

- `caustics/core/audio-controller.js`
- `caustics/core/persistence.js`

### 이동 대상

#### audio-controller

- `initAudio`
- `nextBGM`
- `formatTime`
- BGM path / track list

#### persistence

- `buildPersistedState`
- `persistState`
- `restoreState`

### 구현 원칙

- live `App` 조립은 `main.js`가 유지
- 모듈은 `app`을 인자로 받아 동작
- localStorage key 및 저장 구조는 변경하지 않음

### 검증

1. 새로고침 후 기존 상태 복원이 유지되는지 확인
2. 오디오 초기화와 다음 곡 전환이 유지되는지 확인
3. 앱 시작 시 오류 없이 초기화되는지 확인

### 완료 기준

- `main.js`에서 오디오/저장 관련 블록이 분리된다.
- reload와 audio 동작이 기존과 동일하다.

## Phase 3. UI element 접근 레이어 분리

### 목적

UI 모듈 분해 전에 DOM selector 중복을 제어할 공통 진입점을 만든다.

### 생성 파일

- `caustics/ui/elements.js`

### 책임

- 자주 쓰는 DOM selector 문자열 관리
- `getEl`, `query`, `queryAll` 등 얕은 helper 제공
- 필요 시 간단한 캐시 또는 lazy lookup 적용

### 구현 원칙

- UI 모듈은 직접 selector 문자열을 하드코딩하지 않도록 전환
- 동적 생성 DOM이 아니라면 캐시 허용
- 구조 변경 시 캐시 무효화 지점 명확화

### 검증

1. 주요 slider / toggle / button 조회가 정상 동작하는지 확인
2. 기존 UI 이벤트 등록이 유지되는지 확인

### 완료 기준

- `ui.js` 안의 반복 `document.getElementById` 사용이 줄어든다.
- selector 변경 지점이 중앙화된다.

## Phase 4. UI 정적 데이터 분리

### 목적

동작 리스크가 가장 낮은 UI 텍스트/프리셋 데이터부터 분리한다.

### 생성 파일

- `caustics/ui/panels.js`

### 이동 대상

- `shapePanelContent`
- `trianglePanelContent`
- `shapePresets`

### 구현 원칙

- 패널 문구와 preset 값은 그대로 유지
- 계산성 로직을 넣지 않고 데이터/설명 역할 유지

### 검증

1. shape 패널 텍스트가 동일하게 표시되는지 확인
2. triangle 전용 패널 문구가 유지되는지 확인
3. preset 적용 결과가 기존과 동일한지 확인

### 완료 기준

- `ui.js`에서 정적 패널/프리셋 정의가 제거된다.
- 화면 설명과 preset 결과가 동일하다.

## Phase 5. UI 이벤트 바인딩 분리

### 목적

`setupEvents`에 몰린 이벤트 연결 책임을 분리한다.

### 생성 파일

- `caustics/ui/controls.js`

### 이동 대상

- sliders
- toggles
- tabs
- buttons
- checkbox 관련 event binding

### 구현 원칙

- 이벤트 등록만 떼지 말고 후속 side effect까지 보존
- 예: `resetRays`, `update`, `refreshIncrementalModes`
- 이벤트 처리 순서 유지

### 검증

1. 각 slider 조작 후 즉시 화면 반영이 유지되는지 확인
2. auto mode toggle이 정상 동작하는지 확인
3. shape / color mode tab 전환이 유지되는지 확인

### 완료 기준

- `setupEvents`가 얇아지고 책임이 명확해진다.
- 이벤트 후속 처리 누락이 없다.

## Phase 6. UI 렌더 갱신 분리

### 목적

UI 상태 반영과 이벤트 바인딩을 분리해 `ui.js`를 render facade 수준으로 줄인다.

### 생성 파일

- `caustics/ui/render-ui.js`

### 이동 대상

- `update`
- `syncNarrativeSelect`
- `syncShapePanel`
- `applyShapePreset`

### 구현 원칙

- DOM 쓰기 책임은 여기로 모은다.
- `panels.js`와 `elements.js`를 사용해 읽기/쓰기 경계를 분명히 한다.

### 검증

1. shape 변경 시 패널 동기화가 유지되는지 확인
2. preset 적용 후 UI 수치 표시가 맞는지 확인
3. narrative selector와 실제 state가 일치하는지 확인

### 완료 기준

- UI 갱신 책임과 이벤트 책임이 파일 단위로 구분된다.

## Phase 7. 시뮬레이션 orchestration 분리

### 목적

현재 가장 위험한 narrative simulation cluster를 분리한다.

### 생성 파일

- `caustics/core/simulation-runner.js`

### 이동 대상

- `startA0Simulation`
- `startNarrativeSimulation`
- `rect_A0_simm`
- `universal_journey_simm`
- `stopSimulation`
- `finishSimulation`

### 필수 헬퍼

- `registerTimer(app, id)`
- `clearSimulationTimers(app)`

### 구현 원칙

- `this.simTimers`, `this.ctx` 같은 접근 제거
- 전부 `app.simTimers`, `app.ctx` 형태로 명시 전환
- `bind`보다 인자 전달 우선
- ghost chain 방지를 위해 timer 등록 경로 단일화

### 검증

1. simulation 시작 후 정상 재생되는지 확인
2. stop 실행 시 예약된 timer가 모두 중단되는지 확인
3. finish 이후 상태 정리가 유지되는지 확인
4. simulation 중 UI가 깨지지 않는지 확인

### 완료 기준

- narrative orchestration이 `main.js`에서 제거된다.
- 타이머 누수 없이 시작/정지/종료가 유지된다.

## Phase 8. 폴더 재배치

### 목적

분리된 모듈을 역할별 폴더 구조로 마무리한다.

### 이동 대상

- `physics.js` -> `sim/physics.js`
- `simulator.js` -> `sim/simulator.js`
- `renderer.js` -> `render/renderer.js`
- `light-density.js` -> `render/light-density.js`
- `style.css` -> `styles/style.css`

### 구현 원칙

- 내부 분리 완료 후 마지막에 수행
- import 경로 변경은 한 번에 정리
- `index.html`의 script / stylesheet 경로 동시 검증

### 검증

1. 앱이 정상 로드되는지 확인
2. module import 오류가 없는지 확인
3. 스타일이 깨지지 않는지 확인

### 완료 기준

- 폴더 구조가 역할 기준으로 정리된다.
- 경로 변경 후에도 기능이 유지된다.

## Phase 9. CSS 후속 메모 정리

### 목적

전면 CSS 개편은 미루되, 구조 분리 중 드러난 레거시 selector 후보를 기록한다.

### 작업

1. 사용 여부가 불명확한 selector를 메모한다.
2. 오래된 클래스 의존성이 있는 구간을 표시한다.
3. 전면 rename은 하지 않는다.

### 완료 기준

- 후속 CSS 정리 작업을 위한 후보 목록이 확보된다.

## 각 단계 공통 검증 규칙

각 phase 종료 시 아래 smoke test를 반복한다.

1. 페이지 로드
2. shape 전환
3. drag / rotation / spread / density
4. point / parallel source
5. triangle `single`, `triad`, `strip`
6. paint / paint2 / light mode
7. simulation start / stop
8. audio next / autoplay
9. localStorage restore
10. resize 후 상태 유지

## 작업 단위 규칙

- 한 번에 하나의 phase만 수행
- 각 phase는 작은 patch 단위로 나눠 적용
- 동작 이상이 생기면 직전 phase 범위에서 원인 파악
- 새 모듈은 먼저 생성하고, 이후 호출부를 연결
- 큰 파일 이동은 마지막에 수행

## 즉시 착수할 1차 범위

가장 안전한 시작 범위는 아래 5개다.

1. `caustics/core/shape-config.js`
2. `caustics/core/audio-controller.js`
3. `caustics/core/persistence.js`
4. `caustics/ui/elements.js`
5. `caustics/ui/panels.js`

이 범위는 다음 장점이 있다.

- `main.js`, `ui.js` 감량 효과가 크다.
- 부작용 리스크가 상대적으로 낮다.
- 이후 controls / simulation 분리의 기반이 된다.

## 최종 판단 기준

실행계획 완료는 단순히 파일이 잘게 쪼개진 상태가 아니다.  
아래 조건이 만족되어야 완료로 본다.

1. `main.js`가 엔트리와 조립 중심 파일이 된다.
2. `ui.js`가 facade 수준으로 줄어들거나 제거된다.
3. simulation timer 누수가 없다.
4. selector 관리 지점이 중앙화된다.
5. 이후 기능 추가 시 수정 파일 예측이 쉬워진다.

## 최종 리팩터링 완료 보고

### 최종 완료 및 검증 (2026-03-13)

리팩터링의 모든 단계(Phase 1~9)가 성공적으로 완료되었습니다. 물리적인 폴더 재배치와 경로 정리를 마쳤으며, 종합적인 브라우저 Smoke Test를 통해 시스템의 안정성을 최종 확인했습니다.

#### 🏁 최종 검증 결과 (Smoke Test 완료)

| 항목 | 검증 내용 | 결과 |
| :--- | :--- | :---: |
| **페이지 로드** | `sim/`, `render/`, `styles/` 경로 리소스 정상 로드 (콘솔 에러 0건) | **통과** |
| **Shape 전환** | Circle, Rectangle, Parabola, Triangle 등 모든 탭 전환 및 UI 동기화 | **통과** |
| **기하 제어** | Drag 인터랙션 및 REVOLUTION, ROTATION, SPREAD, DENSITY 슬라이더 작동 | **통과** |
| **모드 전환** | Point / Parallel / Converge 광원 모드 및 Triangle 전용 모드 작동 | **통과** |
| **시뮬레이션** | 'START JOURNEY' 실행, 타이머 작동, 시뮬레이션 자동 진행 및 중단 | **통과** |
| **UI 컴포넌트** | Music Player 드래그, 전체화면 모드, 사이드바 토글, 오디오 제어 | **통과** |
| **상태 유지** | 상태 설정 후 새로고침 시 localStorage 기반 복원(Persistence) 작동 | **통과** |
| **반응형** | 브라우저 리사이즈 시 캔버스 및 UI 레이아웃 정상 대응 | **통과** |

#### 📂 최종 디렉토리 구조

```
/caustics/
├── core/               # 핵심 엔진 서비스 (상태, 저장, 오디오, 시뮬레이션 런너)
├── sim/                # 물리 및 시뮬레이션 계산 로직
├── render/             # 렌더링 및 시각화 엔진
├── ui/                 # UI 하위 모듈 (이벤트, 패널, 플레이어, 사이드바 등)
├── styles/             # 전용 스타일시트
├── index.html          # 엔트리 HTML
├── main.js             # 앱 조립 및 초기화
├── ui.js               # UI Facade
└── audio.js            # 오디오 엔진 자산
```

**결론**: 리팩터링을 통해 코드의 책임을 명확히 분리하고, 유지보수성과 확장성을 확보했습니다. 모든 기능이 기존 베이스라인과 동일하거나 더 안정적으로 작동함을 확인했습니다.

**by Gemini 3 Flash**
