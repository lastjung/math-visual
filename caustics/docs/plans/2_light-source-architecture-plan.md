# 2_광원구조계획

## 문서 목적

`caustics`의 광원 관련 코드는 현재 동작은 되지만, `shape`, `pattern`, `option`, `direction`, `sourceMode` 책임이 여러 파일에 섞여 있다.

이 문서는 광원 구조를 재정리하기 위한 전용 계획서다.  
목표는 광원 관련 개념을 코드 구조에 그대로 반영해서, 이후 수정 시 대화와 구현이 같은 모델을 보게 만드는 것이다.

이 문서는 특히 아래 항목을 대상으로 한다.

- `single / vertex / strip`
- `basic / center / online`
- `down / inward / outward / edge-normal`
- `point / parallel / converge`

## 현재 문제

현재 광원 로직은 주로 아래 파일들에 흩어져 있다.

- `caustics/core/shape-config.js`
- `caustics/core/state-mapper.js`
- `caustics/config/shape-registry.js`
- `caustics/config/pattern-resolver.js`
- `caustics/main.js`

문제는 다음과 같다.

1. `shape-config.js`가 shape geometry와 pattern layout을 동시에 맡고 있다.
2. `option`은 state로 승격되었지만, pattern별 해석 규칙이 코드 구조에는 아직 반영되지 않았다.
3. `direction`은 개념상 독립 레이어인데 source point 계산과 섞여 있다.
4. `sourceMode`(`point / parallel / converge`)는 ray generation 규칙인데, 사용자 입장에서는 `direction`과 쉽게 충돌한다.
5. 이름은 정리됐지만 계산 책임은 아직 파일 경계로 정리되지 않았다.

## 운영 기준 요약

현재 운영 규칙은 `caustics/docs/specs/caustics-config-model-specification.md`의 6번 섹션을 따른다.

핵심만 요약하면 아래와 같다.

- `shape`: 도형 규칙
- `pattern`: 광원 배치 형태
- `option`: pattern 안의 세부 위치 세팅
- `direction`: 발사 방향 규칙
- `sourceMode`: 광선 생성 방식

현재 확정된 사용자 의미:

- `pattern`
  - `single`
  - `vertex`
  - `strip`
- `option`
  - `basic`
  - `center`
  - `online`
- `direction`
  - `down`
  - `inward`
  - `outward`
  - `edge-normal`
- `sourceMode`
  - `point`
  - `parallel`
  - `converge`

## 목표 구조

광원 계산 흐름을 아래 4단계로 분리한다.

1. `shape geometry`
   - 도형별 `center`, `focus`, `vertex`, boundary helper 제공
2. `pattern + option`
   - source point 집합 생성
3. `direction`
   - 각 source 또는 anchor 기준 발사 방향 계산
4. `sourceMode`
   - 실제 ray 출발점/생성 방식 계산

즉 최종 계산 흐름은 아래를 목표로 한다.

```text
shape geometry
  -> pattern layout
  -> direction resolve
  -> source mode launch config
```

## 제안 파일 구조

```text
caustics/core/
  shape-geometry.js
  pattern-layout.js
  direction-resolver.js
  source-mode-resolver.js
  state-mapper.js
```

초기 단계에서는 기존 파일을 완전히 없애지 않고, 책임만 점진적으로 옮긴다.

### 1. `shape-geometry.js`

책임:

- `getShapeCenter(shape, size)`
- `getShapeFocus(shape, size)`
- `getShapeVertexPoints(shape, size)`
- `getShapeOnlinePoint(shape, size)`
- shape별 boundary helper

원칙:

- shape의 기하 정의만 가진다
- pattern, direction, sourceMode 의미는 넣지 않는다

### 2. `pattern-layout.js`

책임:

- `single` layout 계산
- `vertex` layout 계산
- `strip` layout 계산
- 각 pattern에서 `basic / center / online` 해석

원칙:

- "source point를 어디에 둘 것인가"만 계산한다
- 광선 방향 계산은 하지 않는다

예:

- `single > basic`: focus 또는 center vertical canonical point
- `vertex > online`: side/arc 대표점 집합
- `strip > online`: side anchor 기준 strip

### 3. `direction-resolver.js`

책임:

- `down`
- `inward`
- `outward`
- `edge-normal`

원칙:

- `direction`은 source point 집합을 입력받아 발사 방향을 계산한다
- `outward`는 `inward + PI` 파생 규칙으로 관리 가능
- `strip`은 anchor 방향을 전체 source가 공유한다
- `vertex`는 point-wise 계산을 허용한다

### 4. `source-mode-resolver.js`

책임:

- `point`
- `parallel`
- `converge`

원칙:

- `pattern`과 `direction`이 정한 기준 위에 실제 ray launch를 만든다
- `parallel`은 시작점 분산과 공통 방향을 계산한다
- `converge`는 경계 launch point를 계산한다

## 단계별 작업 계획

### Phase 1. 계산 경계 명시

목표:

- 기존 동작을 유지하면서 함수 책임만 먼저 분리

작업:

1. `shape-config.js`에서 geometry helper 목록 정리
2. `pattern layout` 성격 함수 식별
3. `direction` 성격 함수 식별
4. `sourceMode` 성격 분기 식별

완료 기준:

- 어떤 함수가 어느 계층에 속하는지 문서와 코드에서 일치

### Phase 2. `pattern-layout.js` 도입

목표:

- `single / vertex / strip` source point 계산을 별도 파일로 분리

작업:

1. `getTriangleBaseOrigins` 성격 로직 이동
2. `vertex online`, `strip anchor` 계산 이동
3. 기존 `shape-config.js`는 wrapper만 남기거나 호출처를 새 파일로 이동

완료 기준:

- source point 생성이 `pattern-layout.js` 한 파일에서 읽힘

### Phase 3. `direction-resolver.js` 도입

목표:

- `down / inward / outward / edge-normal`을 pattern layout과 분리

작업:

1. `getTriangleLaunchAngle` 분해
2. `strip`의 anchor-shared 방향 규칙 반영
3. `vertex`의 point-wise `in/out` 규칙 반영

완료 기준:

- 방향 계산이 layout 파일에 섞여 있지 않음

### Phase 4. `source-mode-resolver.js` 도입

목표:

- `point / parallel / converge` 분기를 `main.js`에서 분리

작업:

1. `buildLaunchRayConfigs` 내부 분기 추출
2. `parallelRange` 관련 계산 경계 정리
3. `converge`와 `direction` 경계 명확화

완료 기준:

- `main.js`는 조립 위주가 되고, 광원 생성 분기는 resolver로 빠짐

## 검증 포인트

각 단계 후 최소한 아래는 확인해야 한다.

1. `single / vertex / strip` 전환 시 source point 개수와 위치 유지
2. `basic / center / online` 전환 시 pattern별 의미 유지
3. `down / in / out / edge` 전환 시 시각 방향이 기존 규칙과 일치
4. `parallel / converge`가 기존과 동일하게 동작
5. 저장 후 복원 시 `sourcePattern / sourceOption / sourceDirection`이 유지

## 비목표

이번 구조 리팩토링의 비목표는 아래다.

- preset 숫자 튜닝
- UI 디자인 개편
- 용어 전면 재개명
- parabola 세부 감각 조정
- parallel 폭 감각 튜닝

위 항목은 구조 정리 뒤에 별도 작업으로 다룬다.

## 권장 착수 순서

실제 구현은 아래 순서가 가장 안전하다.

1. `pattern-layout.js` 생성
2. `shape-config.js`에서 layout 계산 이동
3. `direction-resolver.js` 생성
4. `main.js`의 launch angle 계산 연결 변경
5. 마지막에 `source-mode-resolver.js` 분리

이 순서를 택하는 이유는 `pattern + option`이 현재 가장 많이 엉켜 있고, 최근 규칙도 이 계층에서 많이 확정되었기 때문이다.
