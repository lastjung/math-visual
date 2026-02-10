# 📐 Math & Sound Visualization Library

A collection of interactive mathematical and auditory visualizations.

## 🚀 Projects

This repository contains three main visualization applications:

1.  **[Math Sound Visualizer](./math-sound/)**: Explore the intersection of mathematical functions and sound. (Basic, Curves, Art, Synth, Math, and Bytebeat). Includes a live MIDI mixer and random playback sequences.
2.  **[Polygon Sound](./polygon-sound/)**: Visualizing sound through polygonal geometry and harmonic relationships.
3.  **[General Visualization](./visualization/)**: A framework for various interactive data and mathematical visualizations.

## 🛠️ Local Development

To run all applications locally:

1.  Ensure you have Node.js installed.
2.  Run the server using the provided script:
    ```bash
    ./server.sh
    ```
3.  Open your browser at [http://localhost:3000](http://localhost:3000).

## 📂 Directory Structure

- `math-sound/`: Mathematical function sound visualizer.
- `polygon-sound/`: Polygon-based harmonic visualizer.
- `visualization/`: General-purpose visualization framework.
- `server.sh`: Local development server script.

---

## 🛠️ Technical Stack

이 프로젝트는 별도의 무거운 프레임워크 없이 웹 표준 기술만을 사용하여 고성능 시각화를 구현했습니다.

- **Core**: Vanilla JavaScript (ES6+ Modules)
- **Audio**: Web Audio API (실시간 함수 음 합성 및 오디오 분석)
- **Graphics**: HTML5 Canvas 2D API (고속 프레임 렌더링)
- **Math**: KaTeX (LaTeX 수학 수식 렌더링)
- **UI/UX**: Vanilla CSS3 (Flexbox, Grid, Glassmorphism 애니메이션)
- **Server**: Node.js `serve` (정적 파일 호스팅)

## 🎨 Visualization Portal

루트 주소([http://localhost:3000](http://localhost:3000))로 접속하면 세 가지 프로젝트를 선택할 수 있는 **프리미엄 포털 페이지**가 나타납니다. 각 프로젝트는 독립적인 모듈로 구성되어 있으면서도 일관된 디자인 언어를 공유합니다.
