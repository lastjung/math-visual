# Math Symphony Runtime Progress and Next Steps

## Purpose

This document records what has already been implemented in the current `math-symphony` rebuild, what design decisions were made during implementation, and what should happen next.

It should be read as a practical status document, not a brainstorm.

---

## Current Direction

The project is now being built as a score-first runtime rather than a loose formula archive.

The current runtime model is:

- `score/` = source archive and extracted reference material
- `catalog/` = normalized runtime score data
- `engine/` = reusable runtime helpers
- `app/` = browser explorer and playback shell

This means the implementation has already moved beyond archive-only usage.

---

## What Has Been Built

### 1. Normalized Score Catalog

A normalized catalog layer now exists.

Implemented files:

- `catalog/schema.js`
- `catalog/index.js`
- `catalog/01_amazing_part3.js`
- `catalog/02_more_beautiful.js`

Current normalized scores:

- `01_amazing_part3`
- `02_more_beautiful`

Current catalog structure includes:

- score id
- score title
- source Desmos URL
- palette
- scene list
- controller list
- expression list

Each expression now carries:

- type
- formula
- latex
- bounds
- parameter keys
- runtime sampling hooks where available

This is the first real shift away from manually hardcoded app-specific formula objects.

---

### 2. Controller Runtime

Basic time-based controller logic is implemented in:

- `engine/controllers.js`

Supported controller modes right now:

- `static`
- `play_once`
- `loop`
- `reverse_loop`

Current behavior:

- score duration is derived from scene durations
- current scene is resolved from score time
- controller values are computed from elapsed time
- controller values are formatted for UI display

This gives the project an actual runtime interpretation of score timing rather than static metadata.

---

### 3. Expression Sampling Layer

A shared expression sampling layer now exists in:

- `engine/sampleExpression.js`

Supported expression families right now:

- `cartesian`
- `parametric`
- `polar`
- `implicit`

This layer is important because both rendering and audio can now read from the same sampled expression model.

That is a major architectural improvement over ad hoc per-feature logic.

---

### 4. Visual Preview Renderer

A basic preview renderer now exists in:

- `engine/renderPreview.js`

Current behavior:

- draws active scene expressions to a canvas
- supports all current expression families
- draws axes from merged bounds
- supports scene fade-in
- de-emphasizes non-focused expressions
- highlights the focused expression more strongly

This is not yet a production renderer.
It is a score inspection renderer.

Its job is currently:

- confirm that the normalized score model is viable
- make scene structure visible
- expose expression grouping issues early

---

### 5. Audio Preview Engine

A minimal audio preview engine now exists in:

- `engine/audioPreview.js`

Current behavior:

- starts Web Audio on playback
- creates one oscillator path per active expression
- updates pitch and level from sampled expression state
- supports master volume control
- fades old scene entries out on scene changes
- suspends active sound on pause/reset

Important note:

This is still preview audio, not final sound design.

The current engine is mainly useful for:

- validating timing
- confirming that expression changes are audible
- catching scene transition problems

It is not yet a polished instrument or composition engine.

---

### 6. Browser Playback Shell

The browser shell now exists in:

- `index.html`
- `app/main.js`
- `app/styles.css`

Current UI behavior includes:

- score selection
- scene selection
- timeline scrub
- `Play Scene`
- `Play Score`
- `Reset`
- volume control
- expression on/off toggles
- active scene preview canvas
- active scene expression list
- controller state panel
- script or caption panel
- focus label for the current expression

This means the project already has a real runtime inspection surface, not just data files.

---

## Important Implementation Decisions Already Made

### 1. `Play Scene` and `Play Score` must stay separate

This was corrected during implementation.

Reason:

- users expect current scene playback to stop at the scene boundary
- score playback should continue through scene boundaries

This distinction should remain.

### 2. Expression focus is a runtime concept

Multi-expression scenes are currently difficult to read if every expression is treated equally.

So the runtime now computes a focused expression from scene progress and uses that to:

- emphasize one curve in the canvas
- emphasize one expression card
- describe current focus in the script panel

This should remain part of the design.

### 3. Expression enable state belongs to score and scene state

Expression toggles are now stored by score id and scene id.

That is correct.

It should not be treated as a global toggle across the whole application.

### 4. Preview rendering and preview audio should share sampling logic

This is already partially true through `engine/sampleExpression.js`.

This must continue.

If rendering and audio drift apart, the runtime becomes unreliable very quickly.

---

## What Is Still Incomplete

### 1. Catalog Coverage

Only two scores are normalized.

Still missing:

- `03_parametric_focused`
- `04_parametric_implicit_polar`
- `05_amazing_2025`
- `06_insane_polar`
- `07_gcd_fantastic`
- `08_incredible_animations`
- `09_incomprehensible`

### 2. Rendering Quality

Current preview rendering is functional but still basic.

Missing or weak areas:

- better implicit contour rendering
- scene-specific styling
- layered reveal strategies
- density control
- stroke compositing
- camera logic
- shot presets

### 3. Audio Quality

Current audio is only a minimal verification layer.

Missing or weak areas:

- expression-specific timbre design
- per-expression gain balancing
- panning
- envelopes
- rhythmic accent design
- scene transition scoring
- BGM support

### 4. Narrative Layer

The script panel exists, but most scores still do not carry strong runtime narration.

Missing:

- manual captions for scores without script lines
- scene-specific interpretation notes
- highlight language for why a graph matters visually

### 5. Performance Layer

There is still no full performance system for:

- shot presets
- transition presets
- feature-based camera moves
- render choreography

This remains a major next step.

---

## Recommended Next Steps

### Immediate Next Step 1: Improve Audio Focus

The focused expression should not only look stronger.
It should also sound stronger.

Recommended changes:

- raise focused expression gain slightly
- reduce non-focused expression gain
- optionally pan focused expression toward center and supporting ones outward

This is the fastest improvement with strong perceptual payoff.

### Immediate Next Step 2: Add Manual Captions for Non-script Scores

Scores like `01_amazing_part3` do not currently benefit much from the new script panel.

Recommended changes:

- allow scenes to define `caption`
- allow scenes to define `focusNote`
- display those when `scripts` are absent

This improves readability immediately.

### Immediate Next Step 3: Normalize More Scores

The architecture is now stable enough to expand coverage.

Best next targets:

1. `03_parametric_focused`
2. `04_parametric_implicit_polar`
3. `06_insane_polar`

Reason:

- they exercise different expression families
- they will pressure-test the current catalog format
- they will expose whether the current runtime model is general enough

### Immediate Next Step 4: Introduce Shot Presets

Once more scores are normalized, add a shot layer.

Recommended model:

- one scene can contain many expressions
- one shot preset decides which expression is foregrounded
- one shot preset decides reveal, density, and style

This is the bridge from score explorer to actual performance engine.

---

## Current Assessment

The rebuild has passed the “idea only” stage.

`math-symphony` now has:

- a runtime catalog format
- a controller engine
- expression sampling
- canvas preview
- audio preview
- transport controls
- expression toggles
- scene narration scaffolding

That is enough to justify continuing in this direction.

The main risk now is not lack of architecture.
The main risk is stopping too early and leaving the project in a half-explorer, half-performance state.

So the correct strategy is:

- keep the runtime model
- expand score coverage
- improve focus and transition behavior
- then add shot and performance systems

---

## Appendix: Legacy Renderer Bug Fixes (Fantastic Series)

During the migration and verification of scores, several critical rendering and audio bugs were identified and fixed in the legacy `math-sound` visualizer, specifically affecting the `Fantastic` series (GCD-based implicit equations):

### 1. `getBounds` Implicit Type Support
- **Issue**: The `getBounds` utility failed to recognize `implicit` type functions, returning `undefined` for `funcData.range`.
- **Fix**: Updated `getBounds` to safely evaluate `funcData.range || funcData.viewBox || defaultBounds`. This prevented silent crashes in the `requestAnimationFrame` loop that caused blank screens.

### 2. High-Performance Implicit Grid Rendering
- **Issue**: Drawing tens of thousands of sub-pixel `rect()` points inside a single `beginPath()` caused rendering drops and browser lag.
- **Fix**: Replaced the pathing approach with immediate `fillRect()` calls and increased the resolution grid from `140x100` to `240x180`. This revealed the highly detailed Prime/GCD interference patterns natively.

### 3. Boolean Audio Sampling
- **Issue**: The audio synthesizer relied on mathematical distance (error threshold) for variable amplitude but failed to process `true/false` return values from boolean functions.
- **Fix**: Updated the `sampleImplicitAmplitude` scanner to evaluate `Boolean` returns correctly (translating `true` to 0 error) and early-exiting to emit precise sine waves at boolean intersections.

### 4. `gcd` Scope Resolution
- **Issue**: The helper `gcd` function was inadvertently decoupled from the active function definitions, causing silent `ReferenceError`s.
- **Fix**: Explicitly hoisted and exported `gcd()` within the symphony module, augmenting it with safe bounds-checking (`isFinite(a)`) to prevent `Infinity` lockups in equations like `1 / sin(x)`.
