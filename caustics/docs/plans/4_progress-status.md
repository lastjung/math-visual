# 4_progress-status

## 문서 역할

이 문서는 `caustics` 리팩토링의 현재 진행 상황을 상위 수준에서 기록하는 상태 문서다.

- `1_마스터계획`의 실행 흐름을 따른다
- 활성 계획의 현재 상태를 짧게 기록한다
- 세부 구현 로그가 필요하면 기존 상태 문서를 참고한다

참고 문서:

- [1_master-refactor-plan.md](/Users/eric/PG/math-visual/caustics/docs/plans/1_master-refactor-plan.md)
- [2_light-source-architecture-plan.md](/Users/eric/PG/math-visual/caustics/docs/plans/2_light-source-architecture-plan.md)
- [3_css-refactor-plan.md](/Users/eric/PG/math-visual/caustics/docs/plans/3_css-refactor-plan.md)
- [caustics-centralized-settings-implementation-status.md](/Users/eric/PG/math-visual/caustics/docs/status/caustics-centralized-settings-implementation-status.md)

## 현재 상태

기준일: 2026-03-30

### 1. 문서 구조 정리

- `caustics` 관련 문서를 `/caustics/docs` 아래로 이동 완료
- `plans / specs / status / notes` 서브폴더 분리 완료
- 완료된 계획서는 `plans/completed/`로 이동 완료
- 활성 계획 문서는 번호 체계로 정리 완료

### 2. 설정 모델 정리

- `pattern / option / direction / sourceMode` 개념 재정리 완료
- `sourceOption`을 독립 state로 승격 완료
- 주요 용어 변경 반영 완료
  - `triad` -> `vertex`
  - `triple-axis` 제거
  - 왼쪽 `DIR parallel` -> `down`
  - `COLOR DIST Rainbow` -> `All Color`

### 3. 광원 규칙 정리

- `single / vertex / strip` 운영 규칙 문서화 완료
- `basic / center / online` 규칙 문서화 완료
- `vertex > online` 근사 계산 반영 완료
- `strip` anchor 계산 반영 완료
- 멀티 광원 패턴의 `center`는 광원 중심 배치 기준으로 재정리
- `direction`은 광원 중심이 아니라 개별 광원 기준으로 재정리
- `parabola` 일부 예외는 남아 있으나 현재는 보류

### 4. 활성 계획 상태

- `2_광원구조계획`
  - 규칙 확정 단계는 상당 부분 완료
  - Phase 1 완료
  - Phase 2 완료
  - Phase 3 완료
  - Phase 4 완료
  - 함수 경계 식별 완료
  - `shape geometry`, `pattern layout`, `direction`, `sourceMode` 책임 분류를 문서에 반영 완료
  - `pattern-layout.js` 분리 완료
  - `direction-resolver.js` 분리 완료
  - `source-mode-resolver.js` 분리 완료
  - 광원 구조 1차 분리 완료

- `3_CSS계획`
  - Phase 1 완료
  - Phase 2 완료
  - Phase 3 완료
  - Phase 4 완료
  - Phase 5 완료
  - selector 분류 완료
  - `base.css`, `layout.css`, `canvas.css` 분리 완료
  - `panels.css`, `controls.css`, `shape-panel.css` 분리 완료
  - `player.css`, `sidebar.css` 분리 완료
  - `style.css`는 import 허브 수준으로 축소
  - `utilities.css`, `legacy-notes.md` 정리 완료
  - CSS 구조 정리 1차 완료

### 5. 이번 단계 결과

- `2_광원구조계획`의 Phase 1을 진행함
- 현재 분류 결론:
  - `shape-config.js`는 geometry와 layout이 섞여 있음
  - `getTriangleLaunchAngle`는 direction 계층 후보로 확정
  - `buildLaunchRayConfigs`는 sourceMode 계층 후보로 확정
  - 첫 실제 분리 대상은 `pattern-layout.js`

### 6. 최근 반영

- `2_광원구조계획`의 Phase 2를 진행함
- `caustics/core/pattern-layout.js`를 신설함
- `vertex online`, `strip anchor`, source origin 계산을 새 파일로 이동함
- `shape-config.js`는 geometry와 direction 중심으로 축소됨

### 7. 최근 반영

- `2_광원구조계획`의 Phase 3을 진행함
- `caustics/core/direction-resolver.js`를 신설함
- `down / inward / outward / edge-normal` 계산을 새 파일로 이동함
- `shape-config.js`는 geometry helper 중심으로 더 축소됨

### 8. 최근 반영

- `2_광원구조계획`의 Phase 4를 진행함
- `caustics/core/source-mode-resolver.js`를 신설함
- `point / parallel / converge` launch 계산을 새 파일로 이동함
- `parallelRange` 계산과 `normalizeLightSourceMode`도 함께 이동함
- 광원 구조 1차 분리가 완료됨

### 9. 최근 반영

- `3_CSS계획`의 Phase 1을 진행함
- `style.css` selector를 역할 기준으로 분류함
- `base / layout / canvas / panels / controls / player / sidebar / shape-panel / utilities` 매핑을 문서에 기록함
- 다음 시작점은 `base.css`, `layout.css`, `canvas.css` 분리임

### 10. 최근 반영

- `3_CSS계획`의 Phase 2를 진행함
- `base.css`, `layout.css`, `canvas.css`를 신설함
- `style.css` 상단을 import 허브 형태로 전환하기 시작함
- 다음 시작점은 `panels.css`, `controls.css`, `shape-panel.css` 분리임

### 11. 최근 반영

- `3_CSS계획`의 Phase 3을 진행함
- `panels.css`, `controls.css`, `shape-panel.css`를 신설함
- `style.css`에서 panel/control/shape 관련 selector를 제거함
- 다음 시작점은 `player.css`, `sidebar.css` 분리임

### 12. 최근 반영

- `3_CSS계획`의 Phase 4를 진행함
- `player.css`, `sidebar.css`를 신설함
- `style.css`는 9줄짜리 import 허브로 축소됨
- slider, preset card, player, sidebar가 모두 별도 파일로 분리됨
- 다음 시작점은 `utilities.css`와 `legacy-notes.md`

### 13. 최근 반영

- `3_CSS계획`의 Phase 5를 진행함
- `utilities.css`와 `legacy-notes.md`를 신설함
- `style.css`는 최종 import 허브 역할만 수행하게 정리됨
- 전역 utility 승격이 위험한 상태 클래스는 문서에 이유를 남김
- CSS 구조 정리 1차가 완료됨

## 보류 메모

- `vertex`에서 일부 preset/auto 동작은 구조 변경 후 재점검
- `parallel / converge`는 오른쪽 `source mode` 계층으로 유지
- 숫자 튜닝보다 구조 분리가 우선

## 다음 문서

- `5_` 문서는 재민이 작성 예정
