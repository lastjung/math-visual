# Math Symphony Runtime Progress and Next Steps

## Purpose

This document records the current implementation state of the `math-symphony` rebuild.

It is meant to answer four practical questions:

- what already works
- what architectural decisions have already been made
- what is still weak or missing
- where the next work session should resume

This is a runtime status document, not a brainstorm.

---

## Current Direction

`math-symphony` is now being built as a score-first runtime, not a loose formula archive.

The active structure is:

- `score/` = reference archive and extracted score notes
- `catalog/` = normalized runtime score data
- `engine/` = reusable controller, sampling, preview, and audio helpers
- `app/` = browser playback shell
- `docs/` = planning and implementation notes

The core runtime model is:

- `Score`
- `Scene`
- `Controller`
- `Expression`

That direction should be kept.

---

## What Has Been Built

### 1. Normalized Catalog Layer

The catalog layer now exists and is active.

Implemented files:

- `catalog/schema.js`
- `catalog/index.js`
- `catalog/01_amazing_part3.js`
- `catalog/02_more_beautiful.js`
- `catalog/03_parametric_focused.js`
- `catalog/04_parametric_implicit_polar.js`

Current normalized scores:

- `01_amazing_part3`
- `02_more_beautiful`
- `03_parametric_focused`
- `04_parametric_implicit_polar`

Each score can now carry:

- id
- number
- title
- theme
- source URL
- palette
- controllers
- scenes

Each scene can now carry:

- title
- summary
- duration
- active controller list
- expressions
- `scripts`
- `caption`
- `focusNote`

Each expression can now carry:

- type
- formula
- latex
- bounds
- parameter keys
- runtime sample functions

This is the first usable runtime data layer for the rebuild.

### 2. Controller Runtime

The controller engine exists in:

- `engine/controllers.js`

Supported controller modes:

- `static`
- `play_once`
- `loop`
- `reverse_loop`

Current controller behavior:

- score duration is derived from scene durations
- current scene is resolved from elapsed score time
- controller values are generated from elapsed time
- controller values are formatted for UI display

This is now the base timing model for the app.

### 3. Shared Expression Sampling

The shared sampling layer exists in:

- `engine/sampleExpression.js`

Supported expression families:

- `cartesian`
- `parametric`
- `polar`
- `implicit`

This layer matters because preview rendering and preview audio now read from the same expression model.

That coupling should remain.

### 4. Preview Renderer

The canvas preview renderer exists in:

- `engine/renderPreview.js`

Current preview behavior:

- draws active scene expressions
- supports all current expression families
- merges bounds for a shared viewport
- draws axes
- fades scenes in
- emphasizes the focused expression
- de-emphasizes supporting expressions
- progressively reveals curves with scene progress

The reveal pass was important for `03_parametric_focused`, because otherwise controller-light scenes felt too static.

This is still an inspection renderer, not a final performance renderer.

### 5. Preview Audio Engine

The audio preview engine exists in:

- `engine/audioPreview.js`

Current audio behavior:

- starts Web Audio on playback
- creates one oscillator path per active expression
- maps sampled expression state into pitch and gain
- supports master volume control
- fades old scene audio out when scenes change
- suspends audio on pause and reset
- emphasizes the focused expression more strongly than the supporting ones

This is verification audio, not final composition audio.

### 6. Browser Playback Shell

The browser shell exists in:

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
- expression list near the graph
- controller panel
- scene narration panel
- focused expression label
- hero facts driven from catalog data

This is now a real runtime inspection surface, not just a static archive page.

### 7. Runtime Semantics Already Corrected

The following runtime behaviors were already corrected and should not be accidentally regressed:

- `Play Scene` stops at the current scene boundary
- `Play Score` continues through the whole score
- expression enable state is stored per score and per scene
- focus is derived from scene progress
- focus is reflected in both preview and audio
- non-script scenes can use `caption` and `focusNote`

These are part of the product behavior now, not temporary hacks.

### 8. `03_parametric_focused` Motion Pass

`03_parametric_focused` originally felt weak in playback because:

- its scenes had no controllers
- the preview renderer drew the full curve immediately

This was improved in two ways:

- preview rendering now reveals expressions progressively
- `03_parametric_focused` now has score-specific controllers:
  - `phase`
  - `drift`

Those controllers are wired into the sample functions, so the score now has real internal motion instead of only transport motion.

This establishes a useful rule for future scores:

- if a score feels too static, add subtle score-specific controllers
- let preview and audio both consume those controllers
- do not rely on transport alone to create motion

### 9. `04_parametric_implicit_polar` Mixed-Family Pass

`04_parametric_implicit_polar` is now normalized into the runtime catalog.

It intentionally includes:

- one scene that mixes `polar`, `parametric`, and `implicit` expressions together
- one parametric-heavy discontinuity scene
- one implicit-heavy pressure scene
- one polar-heavy finale scene

Current runtime totals for `04`:

- 4 scenes
- 14 expressions
- 12 controllers
- 56 seconds

The first validation pass found no module parse errors and no shared sampler exceptions.

This confirms that the existing catalog, controller, and sampling contracts can carry a mixed-family score without immediate ad hoc branching.

The next question is not whether `04` can load. It can.

The next question is whether the current screen composition, renderer priority, and audio focus are good enough for mixed-family readability.

---

## Important Decisions Already Made

### 1. General Formula and Current Parameter Value Must Stay Separate

The runtime should show the formula in general form, while current controller values are shown separately.

Example:

- formula: `y = cos(ax)`
- current value: `a = 7.20`

Do not go back to globally injecting static strings like `(a = 1)` into unrelated formulas.

### 2. `Play Scene` and `Play Score` Must Stay Separate

Users expect:

- current scene playback to stop at the scene boundary
- score playback to continue through all scenes

That distinction is already implemented and should remain.

### 3. Focus Is a Runtime Concept

Multi-expression scenes are too hard to read if everything has equal weight.

The runtime now computes a focused expression from scene progress and uses it to:

- emphasize one curve
- emphasize one expression card
- strengthen one audio path
- describe the current focus in narration

This should remain part of the system design.

### 4. Rendering and Audio Must Share Sampling Logic

Rendering and audio are already partially unified through shared expression sampling.

This must continue.

If the visual engine and audio engine drift apart, score playback becomes unreliable.

### 5. Catalog Data Should Own Scene Copy

Narration-related text belongs in score data, not hardcoded UI logic.

That means:

- `scripts` when the score has explicit narration beats
- `caption` when it needs a stable scene description
- `focusNote` when focus language should be hand-authored

That decision should remain.

---

## What Is Still Incomplete

### 1. Catalog Coverage

Four scores are normalized.

Still missing:

- `05_amazing_2025`
- `06_insane_polar`
- `07_gcd_fantastic`
- `08_incredible_animations`
- `09_incomprehensible`

### 2. Rendering Quality

Current preview rendering is functional but still basic.

Still weak or missing:

- better implicit contour rendering
- scene-specific styling
- density control
- stroke compositing
- camera logic
- shot presets
- mixed-family scene handling rules
- stronger motion grammar for scores that do not naturally animate

### 3. Audio Quality

Current audio is useful but still only a preview layer.

Still weak or missing:

- expression-specific timbre design
- more deliberate per-expression gain balancing
- stereo panning
- envelopes
- rhythmic accent design
- scene transition scoring
- background layers or sustained beds

### 4. Narrative Layer

The narration panel exists, but score copy is still uneven.

Still needed:

- captions for all non-script scores
- better focus notes
- clearer explanation of why a graph matters visually

### 5. Performance Layer

There is still no true performance system for:

- shot presets
- transition presets
- feature-based camera moves
- render choreography
- scene-specific reveal strategies

This remains the bridge from score explorer to actual performance engine.

---

## Reliability Notes

Two runtime issues were already found and fixed during this pass:

### 1. Browser Parse Failure

There was a malformed expression in `app/main.js` that caused:

- `Uncaught SyntaxError: Unexpected token ';'`

That has been fixed.

### 2. Hero Score Count Drift

The hero card still showed `2` after the third score was added.

That has been fixed by driving the hero count from `scoreCatalog.length`.

This suggests a simple rule for future work:

- avoid hardcoded runtime counters
- keep running `node --check` on edited JS modules
- recheck transport and UI facts after each score addition

---

## Recommended Next Steps

### Immediate Next Step 1: Discuss Screen Composition and Product Direction

Now that `04` is normalized, the next work should decide what the runtime should become visually:

- archive explorer
- performance player
- score editor
- render staging tool
- hybrid of the above

Do this before adding more scores.

### Immediate Next Step 2: Expand Mixed-Family Render Rules

`04` should now be reviewed in the browser to decide whether mixed-family scenes need:

- per-expression density
- custom implicit thresholds
- per-expression stroke priority
- per-scene viewport overrides

If those needs appear, add them in data rather than hardcoding score-specific logic in the app.

### Immediate Next Step 3: Improve Audio Spatial Readability

Audio focus is partially done, but not enough.

Next audio improvements should be:

- keep focused expression centered
- spread supporting expressions with light stereo panning
- tune dense scenes so they do not flatten into one mass

### Immediate Next Step 4: Introduce the First Shot Preset

After the screen direction is decided, add the first real shot system field to the catalog.

Recommended initial model:

- one scene can contain many expressions
- one shot preset decides which expression is foregrounded
- one shot preset decides reveal amount, density, and style

This should begin in catalog data, not only in renderer code.

### Immediate Next Step 5: Continue Score Expansion

After `04`, the best next order is:

1. `06_insane_polar`
2. `08_incredible_animations`
3. `07_gcd_fantastic`

Reason:

- `06` will stress-test polar-heavy behavior
- `08` will stress-test animation-led score logic
- `07` will stress-test implicit and boolean-style pattern rendering

---

## Next Session Start Point

If work resumes later, start here:

1. Open `04_parametric_implicit_polar` in the browser runtime
2. Review the mixed thumbnail scene first
3. Discuss screen composition and product direction
4. Decide whether mixed-family readability needs data-driven render controls
5. Only then continue score expansion

Do not begin with more catalog expansion.
Do not begin with a full audio rewrite.

The most important unresolved question is what screen structure best explains and performs a mixed-family mathematical score.

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
