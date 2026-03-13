# Caustics Refactor Plan

## 문서 목적

`caustics` 모듈이 현재 기능은 유지하고 있지만, 파일 길이와 책임 혼재 때문에 수정 비용이 빠르게 커지고 있다.  
이 문서는 검토용 계획서이며, 실제 리팩터링 전에 구조 분해 기준과 검증 기준을 합의하는 것을 목표로 한다.

중요 전제:

- 이 코드는 React 앱이 아니라 순수 JavaScript 기반 모듈 조합 구조다.
- 따라서 컴포넌트 분해가 아니라 `상태`, `물리 계산`, `렌더링`, `DOM 이벤트`, `프리셋`, `시뮬레이션 orchestration` 기준으로 나눠야 한다.
- 1차 리팩터링에서는 동작 변경을 금지하고, 코드 이동과 경계 정리만 수행한다.

## 현재 문제 요약

확인 기준 파일:

- `caustics/main.js`: 1269 lines
- `caustics/ui.js`: 1159 lines
- `caustics/renderer.js`: 732 lines
- `caustics/style.css`: 1393 lines

핵심 문제:

1. `main.js`에 너무 많은 책임이 몰려 있다.
   - 앱 상태
   - shape 기본값 계산
   - triangle source 계산
   - ray launch 설정
   - localStorage persist/restore
   - narrative simulation orchestration
   - audio control
   - animation loop

2. `ui.js`에도 서로 다른 종류의 책임이 섞여 있다.
   - DOM 이벤트 바인딩
   - shape 설명 문구 생성
   - preset 정의
   - player UI 처리
   - sidebar drag/close
   - 화면 동기화 업데이트

3. `caustics/` 하위에 서브폴더가 없어 역할 경계가 눈에 보이지 않는다.

4. 수정 시 영향 범위 예측이 어렵다.
   - 예: triangle 관련 수정이 source launch, preset, panel copy, UI sync까지 연쇄적으로 퍼진다.

## 리팩터링 목표

이번 정리의 목표는 다음 4가지다.

1. 큰 파일을 역할별 모듈로 분해한다.
2. 폴더 구조만 봐도 책임이 드러나게 만든다.
3. 동작 변화 없이 import 경계만 정리한다.
4. 이후 기능 추가 시 수정 위치를 예측 가능하게 만든다.

비목표:

- 렌더링 알고리즘 변경
- 물리 로직 변경
- UI 디자인 변경
- preset 값 튜닝
- CSS 전면 개편

## 제안 구조

```text
caustics/
  core/
    app-state.js
    shape-config.js
    ray-config.js
    persistence.js
    audio-controller.js
    simulation-runner.js
  ui/
    elements.js
    controls.js
    panels.js
    render-ui.js
    player.js
    sidebar.js
  sim/
    physics.js
    simulator.js
  render/
    renderer.js
    light-density.js
  styles/
    style.css
  main.js
  index.html
  IDEAS.md
  prompt.md
```

## 파일별 분리 기준

### 1. `main.js`

현재 이 파일은 앱 엔트리이면서 동시에 거대한 서비스 로케이터 역할도 수행한다.  
이 파일은 최종적으로 "조립"만 담당해야 한다.

분리 대상:

- `core/app-state.js`
  - 기본 state 값
  - runtime flags
  - auto mode state
  - state 초기화 보조 함수
  - 실제 `App` 인스턴스 생성은 담당하지 않음

- `core/shape-config.js`
  - `getDefaultSourcePos`
  - `getShapeDefaults`
  - `getTriangleVertices`
  - `getTriangleSourceOrigins`
  - `getTriangleLaunchAngle`

- `core/ray-config.js`
  - `buildLaunchRayConfigs`
  - `sanitizeSourcePosition`
  - `recalcParallelRange`
  - source mode normalization 관련 로직

- `core/persistence.js`
  - `buildPersistedState`
  - `persistState`
  - `restoreState`

- `core/audio-controller.js`
  - `initAudio`
  - `nextBGM`
  - `formatTime`
  - BGM path / track list

- `core/simulation-runner.js`
  - `startA0Simulation`
  - `startNarrativeSimulation`
  - `rect_A0_simm`
  - `universal_journey_simm`
  - `stopSimulation`
  - `finishSimulation`
  - simulation timer registration / cleanup helper

`main.js`에 남길 것:

- module import
- 실제 `App` 객체 조립
- canvas / app bootstrap
- `init`
- `resize`
- `reset`
- `toggleFlow`
- 메인 animation loop
- 각 모듈 wiring

### 2. `ui.js`

현재는 UI 텍스트 정의와 DOM wiring이 한 객체에 들어 있다.  
이 파일은 기능 단위로 나누는 것이 적합하다.

분리 대상:

- `ui/elements.js`
  - 자주 사용하는 DOM 엘리먼트 조회 지점 일원화
  - selector 문자열 관리
  - 얕은 캐시 또는 lazy lookup helper

- `ui/panels.js`
  - `shapePanelContent`
  - `trianglePanelContent`
  - `shapePresets`

- `ui/controls.js`
  - sliders
  - toggles
  - tabs
  - checkbox / button event binding

- `ui/render-ui.js`
  - `update`
  - `syncNarrativeSelect`
  - `syncShapePanel`
  - `applyShapePreset`

- `ui/player.js`
  - `setupApplePlayer`

- `ui/sidebar.js`
  - sidebar drag
  - sidebar close
  - mobile/sidebar open-close related helpers

`ui.js`는 최종적으로 각 UI 모듈을 묶는 thin facade로 남기거나, 제거하고 `main.js`에서 직접 조합해도 된다.

DOM 접근 원칙:

- 동일한 selector를 여러 파일에서 반복 조회하지 않는다.
- 자주 접근하는 DOM 노드는 `ui/elements.js`를 통해 공유한다.
- ID 또는 class 변경 시 수정 지점을 한 곳으로 제한한다.
- DOM 캐시는 초기화 시점과 구조 변경 시점에만 갱신한다.

### 3. 기존 독립 파일 재배치

- `caustics/physics.js` -> `caustics/sim/physics.js`
- `caustics/simulator.js` -> `caustics/sim/simulator.js`
- `caustics/renderer.js` -> `caustics/render/renderer.js`
- `caustics/light-density.js` -> `caustics/render/light-density.js`
- `caustics/style.css` -> `caustics/styles/style.css`

주의:

- 1차에서는 파일 이동보다 "내부 분리"를 먼저 하는 것이 안전하다.
- import 경로 변경은 마지막 단계로 미루는 편이 검증 비용이 낮다.

## 권장 작업 순서

### Phase 1. 안전한 내부 분리

목표:

- 현재 파일 위치를 유지한 채, 새 모듈을 추가하고 코드만 옮긴다.

작업:

1. `caustics/core/shape-config.js` 생성
2. `caustics/core/audio-controller.js` 생성
3. `caustics/core/persistence.js` 생성
4. `caustics/ui/elements.js` 생성
5. `caustics/ui/panels.js` 생성
6. `main.js`, `ui.js`에서 import 연결
7. 동작 확인

이 단계의 장점:

- 파일 이동이 없어서 경로 리스크가 작다.
- 문제가 생겨도 원인 범위가 좁다.

### Phase 2. orchestration 분리

목표:

- `main.js`의 비대한 시뮬레이션 실행 코드를 떼어낸다.

작업:

1. `core/simulation-runner.js` 생성
2. narrative 관련 함수 이동
3. timer / cancel / final hold 처리 이동
4. `main.js`에서는 runner 호출만 남김

이 단계가 중요한 이유:

- 현재 유지보수 비용이 가장 큰 부분이 narrative simulation cluster다.
- 상태 전환과 UI 반영이 뒤엉켜 있어 버그가 숨어들기 쉽다.

### Phase 3. UI binding 분리

목표:

- `ui.js`에서 이벤트 바인딩과 화면 렌더 갱신을 분리한다.

작업:

1. `ui/controls.js` 생성
2. `ui/render-ui.js` 생성
3. `ui/player.js` 생성
4. `ui/sidebar.js` 생성
5. `ui.js`는 facade 또는 제거

### Phase 4. 폴더 재배치

목표:

- 역할별 폴더 구조를 완성한다.

작업:

1. `physics.js`, `simulator.js`를 `sim/`으로 이동
2. `renderer.js`, `light-density.js`를 `render/`로 이동
3. `style.css`를 `styles/`로 이동
4. `index.html` import / link 경로 수정
5. 전체 smoke test

## 우선순위

실행 우선순위는 아래 순서가 맞다.

1. `main.js` 분해
2. `ui.js` 분해
3. 폴더 재배치
4. CSS 구조 정리

이유:

- 가장 큰 리스크는 파일 이동이 아니라 책임 혼재다.
- 먼저 논리 경계를 분리해야 이후 폴더 이동이 안전해진다.

## 검증 기준

리팩터링 완료 판단은 "파일이 줄었다"가 아니라 아래 항목으로 해야 한다.

### 기능 검증

1. 페이지가 정상 로드된다.
2. shape 전환이 모두 동작한다.
3. source drag / rotation / spread / density 조작이 유지된다.
4. point / parallel light source mode가 유지된다.
5. triangle 전용 source mode가 유지된다.
6. paint / paint2 / light mode가 유지된다.
7. narrative simulation 시작/정지/종료가 유지된다.
8. audio next / autoplay가 유지된다.
9. localStorage restore가 유지된다.
10. resize 이후 source 위치와 shape 상태가 깨지지 않는다.

### 구조 검증

1. `main.js`는 엔트리와 orchestration 수준으로 축소된다.
2. `ui.js`는 DOM wiring facade 수준으로 축소되거나 제거된다.
3. triangle 관련 계산은 한 모듈로 모인다.
4. persistence 관련 로직은 독립 모듈로 모인다.
5. simulation narrative 로직은 UI 텍스트/패널 코드와 분리된다.

### 코드 리뷰 검증 질문

검토 시 아래 질문에 모두 "예"가 나와야 한다.

1. 새 기능을 추가할 때 수정 파일을 예측할 수 있는가?
2. triangle 관련 문제를 찾을 때 진입 지점이 명확한가?
3. UI 문구 수정이 physics 로직을 건드리지 않아도 되는가?
4. 저장 상태 수정이 renderer 변경과 독립적인가?
5. import 경계가 역할 기준으로 이해 가능한가?

## 리스크

### 리스크 1. 숨은 결합도

`main.js`와 `ui.js`는 `app` 객체를 광범위하게 공유한다.  
따라서 분리 과정에서 `this` 문맥이나 직접 필드 접근이 깨질 가능성이 있다.

대응:

- 1차에서는 클래스화하지 않는다.
- 기존 `app` 객체를 유지하고, 외부 모듈 함수가 `app`을 인자로 받도록 한다.
- simulation 관련 함수는 `this.simTimers`, `this.ctx` 식 접근을 제거하고 `app.simTimers`, `app.ctx` 형태로 명시 전환한다.
- `bind`에 의존하기보다 호출부에서 `app`을 넘기는 구조를 우선한다.

### 리스크 2. import 순서 의존성

현재 일부 로직은 전역 가시성에 기대고 있을 수 있다.

예:

- `window.LightDensityModule = LightDensity`

대응:

- 1차에서는 이런 브리지 코드를 제거하지 않는다.
- 구조가 안정된 뒤 2차 정리 대상으로 남긴다.

### 리스크 3. UI 이벤트 side effect 누락

slider나 toggle 이벤트가 단순 state 변경 외에 `resetRays`, `update`, `refreshIncrementalModes` 같은 후속 동작을 포함한다.

대응:

- controls 분리 시 "event binding only"가 아니라 "event + required side effects"를 함께 옮긴다.
- 단순 문법 분리보다 실행 순서 보존을 우선한다.

### 리스크 4. 순환 참조

`main.js`가 `App` 조립을 맡고, 다른 모듈은 이를 받아 동작하는 구조를 깨면 import 순서 의존성이 생길 수 있다.

대응:

- `core/app-state.js`는 초기 상태와 상태 스키마만 export 한다.
- 실제 live `App` 객체 생성과 모듈 조립은 반드시 `main.js`가 유지한다.
- UI 모듈과 core 모듈이 서로를 직접 import 하지 않도록 하고, `main.js`를 통해 주입받는 구조를 우선한다.

### 리스크 5. 타이머 체인 누락

시뮬레이션 함수가 여러 파일로 흩어지면 `setTimeout` 등록과 `clearTimeout` 취소가 분산되어 ghost chain이 생길 수 있다.

대응:

- `core/simulation-runner.js`에 타이머 헬퍼를 둔다.
- 예: `registerTimer(app, id)`, `clearSimulationTimers(app)`
- 모든 narrative timer 등록은 이 헬퍼를 통해서만 수행한다.
- `stopSimulation`은 이 헬퍼를 유일한 정리 경로로 사용한다.

### 리스크 6. DOM selector 중복 관리

UI를 분리하면 동일한 selector를 여러 모듈에서 중복 참조할 가능성이 높다.

대응:

- `ui/elements.js`를 도입한다.
- selector 문자열을 여기로 모으고, 반복 조회를 캐시한다.
- 이벤트 바인딩 모듈과 UI update 모듈은 이 공유 레이어를 사용한다.

### 리스크 7. CSS 잔존 코드

CSS 우선순위는 낮지만, UI 구조 분리 시 이미 사용되지 않는 selector나 오래된 클래스 의존성이 드러날 수 있다.

대응:

- 1차 작업 중 레거시 CSS 후보를 주석 또는 별도 메모로 식별한다.
- CSS 전면 정리는 미루되, 사용 여부가 불명확한 블록은 검토 대상 표시를 남긴다.
- 구조 분리와 동시에 class rename은 하지 않는다.

## 제안 결론

현재 `caustics`는 "파일 수가 적어서"가 아니라 "책임 경계가 없어서" 커진 상태다.  
가장 적절한 접근은 한 번에 전면 재작성하는 것이 아니라, 아래 순서로 점진 분해하는 것이다.

1. `main.js`에서 shape/audio/persistence 분리
2. `ui.js`에서 panels/controls/render/player/sidebar 분리
3. simulation orchestration 분리
4. 마지막에 폴더 재배치

## 즉시 실행 가능한 1차 작업안

검토 후 바로 착수할 최소 범위:

1. `docs/` 계획서 승인
2. `caustics/core/shape-config.js` 생성
3. `caustics/core/audio-controller.js` 생성
4. `caustics/core/persistence.js` 생성
5. `caustics/ui/elements.js` 생성
6. `caustics/ui/panels.js` 생성
7. `main.js`, `ui.js`에서 새 모듈 import 연결
8. smoke test

이 범위는 구조 개선 효과가 크고, 동작 리스크는 상대적으로 낮다.
