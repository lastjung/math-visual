# 6_test-scenarios

## 목적

이 문서는 재민이가 `caustics` 리팩토링 이후 동작 이상 여부를 빠르게 검수할 수 있도록 만든 테스트 시나리오다.

범위:

- 광원 구조 리팩토링 검증
- CSS 구조 리팩토링 검증
- 저장/복원 및 주요 UI 상호작용 회귀 확인

## 테스트 원칙

- 브라우저에서 실제 동작 기준으로 확인한다
- 값이 "정확히 같아야 하는 수치"보다 "의미가 유지되는지"를 본다
- 깨짐이 있으면 어떤 shape, pattern, option, direction, source mode 조합에서 발생하는지 같이 기록한다

## 사전 체크

1. 페이지가 정상 로드된다
2. 콘솔에 치명적인 import/CSS 로드 에러가 없다
3. 초기 화면에서 header, canvas, 좌우 패널, floating player가 모두 보인다

## A. 광원 구조 Smoke Test

### A1. Shape 전환 기본

1. `circle`에서 시작
2. `triangle`, `rect`, `ellipse`, `parabola`, `cardioid`로 순서대로 전환
3. 각 전환 후 아래 확인

확인 항목:

- 앱이 멈추지 않는다
- source가 사라지지 않는다
- 좌측 패널 active 상태가 유지된다
- 이상한 anchor 점프가 없다

### A2. Pattern 전환

각 shape에서 아래를 눌러본다.

- `single`
- `vertex`
- `strip`

확인 항목:

- `single`은 source 1개로 보인다
- `vertex`는 도형별 vertex set 느낌으로 source가 배치된다
- `strip`은 선형 배열로 보인다
- pattern 전환 후 드래그/emit이 계속 된다

### A3. Option 전환

각 pattern에서 아래를 눌러본다.

- `basic`
- `center`
- `online`

확인 항목:

- `single > basic / center / online` 의미가 유지된다
- `vertex > basic / online`이 깨지지 않는다
- `vertex > center`는 현재 `basic`과 같은 쪽으로 동작하면 정상
- `strip > basic / center / online` anchor가 다르게 잡힌다

### A4. Direction 전환

각 shape에서 최소 한 번씩 아래를 바꾼다.

- `Down`
- `In`
- `Out`
- `Edge`

확인 항목:

- `Down`은 대체로 아래 방향 fan으로 보인다
- `In`은 중심 쪽으로 향하는 느낌이 난다
- `Out`은 `In`의 반대쪽이다
- `Edge`는 가능한 경우 경계 수직 느낌이 난다

중점 확인:

- `vertex + In`
- `vertex + Out`
- `strip + In`
- `strip + Edge`

### A5. Source Mode 전환

오른쪽 패널에서 아래를 바꾼다.

- `point`
- `parallel`
- `converge`

확인 항목:

- `point`: 기본 발사
- `parallel`: 시작점만 옆으로 벌어지고 방향은 공통
- `converge`: 한 점으로 모이는 발사 느낌 유지

주의 조합:

- `single + parallel`
- `vertex + parallel`
- `strip + parallel`

### A6. Animation / Auto Mode

아래 auto를 각각 켜고 끈다.

- revolution
- rotation
- density
- spread

확인 항목:

- 버튼 active 표시가 정상
- 애니메이션이 멈추지 않는다
- 끄면 바로 수동 제어로 돌아온다

## B. 저장/복원 회귀 테스트

### B1. Refresh 복원

1. 아래 조합 하나를 만든다
   - shape: `triangle`
   - pattern: `vertex`
   - option: `online`
   - direction: `In`
   - source mode: `point`
2. 페이지 새로고침

확인 항목:

- shape 유지
- pattern 유지
- option 유지
- direction 유지
- source mode 유지

### B2. 다른 조합 복원

1. 아래 조합으로 바꾼다
   - shape: `ellipse`
   - pattern: `strip`
   - option: `center`
   - direction: `Down`
   - source mode: `parallel`
2. 새로고침

확인 항목:

- 상태가 다시 살아난다
- UI active 상태와 실제 동작이 일치한다

## C. CSS 구조 회귀 테스트

### C1. 전체 레이아웃

확인 항목:

- header 높이 정상
- 좌우 sidebar 위치 정상
- canvas가 빈 공간 없이 채워진다
- floating player 위치 정상

### C2. Sidebar

확인 항목:

- 좌우 sidebar blur/background 유지
- grip 표시 및 hover 정상
- close/hide 애니메이션 정상
- scrollbar 스타일 유지

### C3. Controls

확인 항목:

- slider thumb 정상
- mini-tab active 스타일 정상
- toggle/chip/button 스타일 정상
- `Emit`, `Go/Hold` 버튼 active 상태 정상

### C4. Shape Panel

확인 항목:

- badge/tooltip 표시 정상
- preset 카드 grid 정상
- source-layout panel 표시 정상
- accordion 열고 닫기 정상

### C5. Player

확인 항목:

- floating player blur/background 정상
- drag grip 정상
- close/restore 정상
- play/prev/next/speed 버튼 hover/active 정상
- volume slider 정상
- timeline 표시 정상

### C6. Fullscreen / Window Full

확인 항목:

- `body.window-full` 상태에서 header/sidebar/player/drag-hint 숨김 정상
- canvas 표시가 깨지지 않는다

## D. 우선 확인 조합

시간이 부족하면 아래만 먼저 본다.

1. `triangle + vertex + online + In + point`
2. `circle + single + online + Down + point`
3. `ellipse + strip + center + Down + parallel`
4. `parabola + single + center + Out + point`
5. `rect + vertex + basic + Edge + point`

## 실패 기록 형식

문제가 있으면 아래 형식으로 남긴다.

- shape:
- pattern:
- option:
- direction:
- source mode:
- action:
- expected:
- actual:
- screenshot/console:

## 완료 기준

아래가 모두 만족되면 1차 검수 통과로 본다.

- 치명적인 렌더/interaction 오류 없음
- 광원 구조 변경 후 주요 조합이 의미대로 동작
- CSS 분리 후 레이아웃/컨트롤/player/sidebar 깨짐 없음
- 저장/복원 회귀 없음
