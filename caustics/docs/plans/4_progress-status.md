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
- `parabola` 일부 예외는 남아 있으나 현재는 보류

### 4. 활성 계획 상태

- `2_광원구조계획`
  - 규칙 확정 단계는 상당 부분 완료
  - 실제 구조 리팩토링은 아직 시작 전
  - 다음 작업은 `pattern-layout`, `direction-resolver`, `source-mode-resolver` 분리

- `3_CSS계획`
  - 아직 시작 전
  - 광원 구조 안정화 이후 진행 예정

## 보류 메모

- `vertex`에서 일부 preset/auto 동작은 구조 변경 후 재점검
- `parallel / converge`는 오른쪽 `source mode` 계층으로 유지
- 숫자 튜닝보다 구조 분리가 우선

## 다음 문서

- `5_` 문서는 재민이 작성 예정
