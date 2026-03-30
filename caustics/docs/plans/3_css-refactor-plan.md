# 3_CSS계획

## 문서 목적

이 문서는 `caustics/styles/style.css` 분리를 위한 계획서다.  
현재 CSS는 기능은 유지하지만 파일 길이와 책임 혼재 때문에 수정 위치를 예측하기 어렵다.

이번 작업의 목표는 다음과 같다.

1. 긴 CSS 파일을 역할별 파일로 분리한다.
2. 기존 클래스명과 화면 동작은 유지한다.
3. `style.css`를 최종 import 허브로 바꾼다.
4. 이후 UI 수정 시 진입 파일을 예측 가능하게 만든다.

## 현재 문제

현재 가장 긴 텍스트 파일은 [style.css](/Users/eric/PG/math-visual/caustics/styles/style.css) 이고 1393줄이다.

문제 요약:

- reset, layout, panel, controls, player, sidebar, 상태 클래스가 한 파일에 섞여 있다
- 특정 selector가 어느 역할인지 파일만 보고 알기 어렵다
- player/sidebar 같은 인터랙티브 UI 스타일이 다른 레이아웃 스타일과 얽혀 있다
- 미사용 가능성이 있는 레거시 selector를 식별하기 어렵다

## 핵심 원칙

- 1차는 selector 이동만 수행한다
- class rename 금지
- 시각적 변경 금지
- import 순서로 기존 우선순위를 보존한다
- `style.css`는 엔트리 파일로 유지한다

## 목표 구조

```text
caustics/styles/
  style.css
  base.css
  layout.css
  canvas.css
  panels.css
  controls.css
  player.css
  sidebar.css
  shape-panel.css
  utilities.css
  legacy-notes.md
```

## 파일별 책임

### `style.css`

- 최종 import 허브
- 직접 selector를 거의 두지 않음

예상 형태:

```css
@import './base.css';
@import './layout.css';
@import './canvas.css';
@import './panels.css';
@import './controls.css';
@import './player.css';
@import './sidebar.css';
@import './shape-panel.css';
@import './utilities.css';
```

### `base.css`

- reset
- `body`, `html`
- font, color, CSS custom properties
- 공통 기본 타이포

### `layout.css`

- header
- main-stage
- 전체 column / row 배치
- 큰 spacing rules

### `canvas.css`

- canvas-area
- `#causticsCanvas`
- HUD
- drag hint

### `panels.css`

- control-panel
- accordion shell
- section wrapper
- panel header/footer류

### `controls.css`

- slider
- toggle
- checkbox chip
- mini tab
- setting row / label / value

### `player.css`

- apple-player
- progress bar
- transport controls
- floating player visibility state

### `sidebar.css`

- left/right sidebar shell
- grip
- close button
- hidden/open transition

### `shape-panel.css`

- shape badge
- preset card
- triangle panel block
- shape-specific info block

### `utilities.css`

- `hidden`
- `visible`
- `active`
- 상태성 helper class

## 리스크

### 리스크 1. import 순서

CSS는 순서 의존성이 강하다.  
파일 분리 후 import 순서가 바뀌면 override 우선순위가 깨질 수 있다.

대응:

- 분리 전 섹션 순서를 최대한 유지한다
- utilities는 가장 뒤에 둔다
- component override가 필요하면 더 뒤에 둔다

### 리스크 2. 상태 클래스 중복

`active`, `hidden`, `visible` 같은 상태 클래스가 여러 구간에 섞여 있을 수 있다.

대응:

- 상태성 selector는 `utilities.css`로 우선 수집한다
- 상태 + 컴포넌트 결합 selector는 원래 컴포넌트 파일에 둔다

### 리스크 3. player/sidebar 애니메이션

player와 sidebar는 layout, position, transition이 같이 섞여 있을 가능성이 높다.

대응:

- 1차에서는 관련 selector를 통째로 `player.css`, `sidebar.css`로 이동한다
- animation 값은 변경하지 않는다

### 리스크 4. 레거시 CSS

이미 안 쓰는 selector가 섞여 있을 가능성이 있다.

대응:

- 삭제는 미루고 `legacy-notes.md`에 후보를 적는다
- 1차에서는 사용 여부 불명 selector를 제거하지 않는다

## 검증 기준

CSS 분리 완료 판단은 아래 항목으로 한다.

1. 페이지 레이아웃이 기존과 동일하다
2. sidebar/player show/hide가 유지된다
3. drag grip 스타일과 transition이 유지된다
4. shape panel, triangle panel 표시 상태가 유지된다
5. slider / mini-tab / toggle 시각 상태가 유지된다
6. HUD, drag hint, canvas 주변 UI가 깨지지 않는다
7. mobile/desktop 모두 주요 레이아웃이 유지된다

## 실행계획

### Phase 1. 분류

작업:

1. `style.css`를 큰 섹션 단위로 구분한다
2. selector를 역할 기준으로 매핑한다
3. 상태성 selector 후보를 따로 표시한다

완료 기준:

- 각 selector가 어느 파일로 갈지 결정된다

진행 결과:

- 완료

Phase 1 분류 결과:

- `base.css`
  - `:root`
  - `*`
  - `body`
- `layout.css`
  - `.header`
  - `.logo-group`
  - `.logo-icon`
  - `.logo-text h1`
  - `.logo-text p`
  - `.shape-tabs`
  - `.shape-tab`
  - `.main-stage`
- `canvas.css`
  - `.canvas-area`
  - `canvas`
  - `.drag-hint`
  - `@keyframes pulse`
  - `.hud-timer`
  - `.hud-speed`
  - `.hud-bounces`
- `panels.css`
  - `.control-panel`
  - `.panel-header`
  - `.info-box`
  - `.info-title`
  - `.info-desc`
  - `.apple-select`
- `controls.css`
  - `.setting-row`
  - `.setting-row-inline`
  - `.setting-label-group`
  - `.setting-label`
  - `.setting-value`
  - `.row-*`
  - `input[type=range]`
  - `.mode-tabs`
  - `.mode-tab`
  - `.mode-tabs-mini`
  - `.mini-tab`
  - `.toggle-btn`
  - `.toggle-option`
  - `.toggle-track`
  - `.checkbox-group`
  - `.chip-checkbox`
  - `.action-group`
  - `.reset-btn`
  - `.play-btn`
  - `#btn-light`
  - `#btn-play`
  - `.flash-active`
  - `@keyframes emit-flash`
- `shape-panel.css`
  - `.shape-badge`
  - `.shape-badge-sub`
  - `.shape-options-section`
  - `.shape-accordion*`
  - `.shape-option-card*`
  - `.shape-preset-*`
  - `.source-layout-*`
  - `.source-strip-controls`
  - `.source-direction-row`
  - `@keyframes tooltipFadeInHeader`
- `player.css`
  - `.apple-player`
  - `.player-restore-tab`
  - `.player-close`
  - `.player-grip`
  - `.player-main`
  - `.player-controls-row`
  - `.volume-group`
  - `.track-name-inline`
  - `.time-label`
  - `.icon-volume`
  - `.apple-slider-vol`
  - `.playback-group`
  - `.player-btn-*`
  - `.extra-group`
  - `.player-timeline-row`
  - `.timeline-container`
  - `.timeline-progress`
  - `#apple-play.active .play-svg-wrapper`
- `sidebar.css`
  - `.controls-sidebar`
  - `.controls-sidebar.left`
  - `.controls-sidebar.right`
  - `.controls-sidebar::-webkit-scrollbar*`
  - `.sidebar-grip`
  - `.sidebar-close`
- `utilities.css`
  - `.hidden`
  - `.visible`
  - `.active`
  - `body.window-full ...`
  - 단, 상태와 컴포넌트가 강하게 결합된 selector는 원래 파일에 남김

Phase 1 메모:

- `.source-layout-panel.visible`가 두 번 선언되어 있어 Phase 2 이전에 중복 정리가 필요하다
- `.time-label`도 player 구간에서 두 번 선언되어 있어 player 파일 분리 시 하나로 합칠 수 있다
- `body.window-full`은 utility 성격이 강하지만 header/sidebar/player/canvas를 함께 건드리므로 마지막 단계에서 이동하는 편이 안전하다

### Phase 2. 기본 구조 분리

작업:

1. `base.css` 생성
2. `layout.css` 생성
3. `canvas.css` 생성

완료 기준:

- reset / layout / canvas 계층이 분리된다

진행 결과:

- 완료

Phase 2 반영 내용:

- `caustics/styles/base.css` 신규 생성
- `caustics/styles/layout.css` 신규 생성
- `caustics/styles/canvas.css` 신규 생성
- `caustics/styles/style.css` 상단을 import 허브 형태로 전환 시작
  - `@import './base.css';`
  - `@import './layout.css';`
  - `@import './canvas.css';`

Phase 2 메모:

- 현재 `style.css`는 완전한 import 허브는 아니고, 남은 panel/control/player/sidebar selector를 계속 포함한다
- 이번 단계는 상단 3개 계층만 안전하게 분리하는 데 목적이 있다
- 다음 단계는 `panels.css`, `controls.css`, `shape-panel.css` 분리다

### Phase 3. 패널 및 컨트롤 분리

작업:

1. `panels.css` 생성
2. `controls.css` 생성
3. `shape-panel.css` 생성

완료 기준:

- control sidebar와 shape panel 관련 selector가 분리된다

진행 결과:

- 완료

Phase 3 반영 내용:

- `caustics/styles/panels.css` 신규 생성
- `caustics/styles/controls.css` 신규 생성
- `caustics/styles/shape-panel.css` 신규 생성
- `caustics/styles/style.css`에 아래 import 추가
  - `@import './panels.css';`
  - `@import './controls.css';`
  - `@import './shape-panel.css';`
- `style.css`에서 panel/control/shape-panel selector 제거 완료

Phase 3 메모:

- `source-layout-panel.visible` 중복은 제거되어 현재 `shape-panel.css`에만 남는다
- `time-label`은 아직 player 구간에서 중복 선언되어 있으며, 다음 player 분리 단계에서 정리한다
- 현재 `style.css`에는 주로 `sidebar`와 `player` 관련 selector가 남아 있다

### Phase 4. 인터랙티브 UI 분리

작업:

1. `player.css` 생성
2. `sidebar.css` 생성
3. player/sidebar transition 관련 selector 이동

완료 기준:

- floating UI 스타일이 별도 파일로 분리된다

진행 결과:

- 완료

Phase 4 반영 내용:

- `caustics/styles/sidebar.css` 신규 생성
- `caustics/styles/player.css` 신규 생성
- `caustics/styles/style.css`에 아래 import 추가
  - `@import './sidebar.css';`
  - `@import './player.css';`
- `style.css`에서 sidebar/player selector 제거 완료

Phase 4 메모:

- `time-label` 중복은 `player.css`로 모이면서 하나의 값으로 정리되었다
- `body.window-full` fullscreen hide rule은 `player.css`에 함께 이동했다
- 현재 `style.css`는 9줄짜리 import 허브로 축소되었다

### Phase 5. 상태 클래스 및 엔트리 정리

작업:

1. `utilities.css` 생성
2. `style.css`를 import 허브로 전환
3. `legacy-notes.md` 작성

완료 기준:

- `style.css`가 엔트리 역할만 수행한다

진행 결과:

- 완료

Phase 5 반영 내용:

- `caustics/styles/utilities.css` 신규 생성
- `caustics/styles/legacy-notes.md` 신규 생성
- `caustics/styles/style.css`에 `@import './utilities.css';` 추가
- `style.css`는 최종 import 허브 역할만 수행

Phase 5 메모:

- `.flash-active`와 `body.window-full ...`는 `utilities.css`로 이동
- `.hidden / .visible / .active`는 전역 utility로 일괄 승격하지 않았다
- 이유: 현재 프로젝트에서는 이 상태 클래스들이 단순 display 토글이 아니라 component-specific transition과 visual override를 함께 담당하기 때문
- 남은 상태 클래스의 이유와 후속 정리 방향은 `legacy-notes.md`에 기록했다

## 실제 작업 순서

1. `base.css`, `layout.css`
2. `canvas.css`
3. `panels.css`, `controls.css`
4. `shape-panel.css`
5. `player.css`, `sidebar.css`
6. `utilities.css`
7. `style.css` import 정리
8. `legacy-notes.md` 작성
9. smoke test

## 최종 판단 기준

완료 상태는 아래와 같다.

1. `style.css`가 import 허브 역할만 한다
2. CSS 수정 시 파일 진입점이 예측 가능하다
3. 화면 regression 없이 기존 동작이 유지된다
4. 후속 CSS 정리 대상이 문서화된다
