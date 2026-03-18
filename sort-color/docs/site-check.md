[요청 사항: Color Sort 플랫폼 리팩터링 완료에 따른 브라우저 시각화/렌더링 총괄 테스트]
http://127.0.0.1:5500/sort-color/index.html
나는 단일 로직으로 엉켜있던 `sort-color` 프로젝트를 "도형에 독립적인 범용 정렬 플랫폼(Geometry-Agnostic Sort Platform)"으로 완전히 뜯어고치는 거대한 아키텍처 리팩터링을 막 끝냈다. 기존의 단일 Cardioid(심장형) 도형을 넘어서, 이제 3D 입체 구체(Goldberg Sphere) 플러그인 등 무한한 확장이 가능한 플랫폼 레이아웃이 완성되었다.
현재 폴더 구조는 다음과 같이 물리적/논리적으로 완벽히 분리되어 있다:

- `engine/` : 도형이 무엇이든 색상만 바꿔주는 순수 코어 (sort_engine.js, sort_renderer.js 등)
- `geometry/` : 좌표와 형태 수학만 계산하는 공급기 (cardioid_provider.js, goldberg_sphere_provider.js 등)
- `cases/` : 위 부품들을 조립해 화면에 뿌려주는 모듈 래퍼
  너의 임무는 지금 당장 `browser_subagent`를 켜서 로컬 서버(예: `http://127.0.0.1:5500/sort-color/index.html` 또는 네가 찾아낸 포트)로 접속한 뒤, 다음 4가지 핵심 마일스톤이 브라우저에서 '시각적으로' 완벽하게 작동하는지 검증하고 보고하는 것이다.
  [브라우저 테스트 필수 체크리스트]

1. UI 3단 레이아웃 독립성: 상단바(Geometry 글로벌 스위치), 좌측 패널(재생/속도 등 불변의 정렬 고정 제어판), 우측 패널(선택된 도형에 따라 다이내믹하게 바뀌는 Inspector)이 레이아웃 깨짐 없이 잘 렌더링되는가?
2. 멀티 스위칭 테스트: 상단 메뉴에서 [Cardioid](cci:1://file:///Users/eric/PG/math-visual/sort-color/cases/cardioid_circle_provider.js:1:4-5:5)와 `Goldberg Sphere`를 토글(Toggle)했을 때, 에러 없이 즉각적으로 화면 중앙의 캔버스 도형과 우측 Inspector 옵션 창(Frequency 등)이 교체되는가?
3. 3D Sphere (구체) 시각 연출 무결성 (가장 중요):
   - 3D 수학 연산을 Provider가 전담하고 평면 렌더러가 그리는 방식이 성공했는가?
   - 마우스를 드래그하거나 가만히 두었을 때 구체가 3D 입체로 부드럽게 회전(Idle rotation)하는가?
   - 구체의 뒷면(가려진 면) 투영 처리가 어색함 없이 깊이(Z-depth)감을 잘 살려내고 있는가?
4. 순수 엔진 동작: 래딕스(Radix)나 퀵(Quick) 정렬을 실행했을 때, 새로운 도형(Sphere) 위에서도 콘솔 에러 하나 없이 매끄럽게 색상 순서가 정렬되는 애니메이션이 관찰되는가?
   위 항목들을 직접 브라우저 에이전트의 눈으로 꼼꼼히 점검하고 종합 렌더링 검토 보고서를 작성해서 나에게 보고해라.
