# Math Desmos Lab

Desmos Graphing Calculator API v1.12를 불러오는 독립형 정적 사이트입니다.

## 실행

`index.html`을 브라우저에서 열면 됩니다. 로컬 서버를 쓰고 싶다면 프로젝트 루트에서:

```sh
python3 -m http.server 8000
```

그다음 `http://localhost:8000/math-desmos/`로 접속합니다.

## API key

Desmos 문서는 다음 형태로 API 스크립트를 불러오도록 안내합니다.

```html
<script src="https://www.desmos.com/api/v1.12/calculator.js?apiKey=[YOUR_API_KEY_HERE]"></script>
```

실서비스에서는 https://www.desmos.com/my-api 에서 발급받은 키를 쓰는 것이 맞습니다.
이 데모는 빠른 로컬 확인을 위해 `desmos`를 기본값으로 사용하고, 화면 오른쪽 위에서
발급받은 키를 입력하면 `localStorage`에 저장해 다음 로드부터 사용합니다.

## 핵심 코드

- `Desmos.GraphingCalculator(element, options)`로 계산기를 생성합니다.
- `calculator.setExpression(...)` 또는 `calculator.setExpressions(...)`로 수식을 추가합니다.
- `calculator.setMathBounds(...)`로 보이는 좌표 범위를 조절합니다.
- `calculator.getState()`와 `calculator.setState(...)`로 저장과 복원을 처리합니다.
- `calculator.screenshot(...)`으로 현재 그래프 이미지를 만듭니다.
