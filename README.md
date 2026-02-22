# Math Visual

A collection of interactive web-based math and sound experiences built with vanilla JavaScript, Canvas, and Web Audio APIs.

## Projects

This repository currently includes six apps:

1. **[Math Sound](./math-sound/)**: Function-driven sound synthesis with categorized formulas and playback controls.
2. **[Polygon Sound](./polygon-sound/)**: Polygon-based geometry visuals linked to harmonic and rhythmic behavior.
3. **[Visualization](./visualization/)**: General interactive math visualization playground with configurable controls.
4. **[Math Draw](./math-draw/)**: Code-and-canvas storytelling views that animate mathematical drawing logic.
5. **[Pythagoras](./pythagoras/)**: Interactive geometric demonstrations and proof-style views for the Pythagorean theorem.
6. **[Polyhedra](./polyhedra/)**: Independent 3D polyhedron viewer for solid families and face topology exploration.

## Local Development

1. Install Node.js (LTS recommended).
2. Start the local static server:

```bash
./server.sh
```

3. Open `http://localhost:3000` in your browser.

## Repository Structure

- `index.html`: Root portal page linking to each app.
- `math-sound/`: Function-to-audio visualizer.
- `polygon-sound/`: Polygon/harmonic visualizer.
- `visualization/`: General visualization playground.
- `math-draw/`: Drawing-focused math animation app.
- `pythagoras/`: Pythagorean theorem visual modules.
- `polyhedra/`: Independent polyhedron viewer.
- `server.sh`: Local server launcher.

## Technical Stack

- **Core**: Vanilla JavaScript (ES Modules)
- **Graphics**: HTML5 Canvas 2D API
- **Audio**: Web Audio API
- **Math Rendering**: KaTeX (where applicable)
- **Styling**: Vanilla CSS (Flexbox/Grid layouts)
- **Serving**: Static local server via `server.sh`

## Portal

At `http://localhost:3000`, the root portal provides a unified entry point for all apps with a consistent visual language and independent module routing.
