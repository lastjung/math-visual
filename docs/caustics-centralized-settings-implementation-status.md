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

## 🟡 2단계: config 레이어 도입 (대기 중)
- **다음 작업**: `config/app-defaults.js`, `config/shape-registry.js` 파일 생성 및 데이터 분리.

