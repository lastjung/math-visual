# Math Symphony Brainstorming 1

## Purpose

This document records the current design thinking around `math-symphony` as it evolves from a score archive into a broader math-performance system.

The current score files are already strong at capturing:

- source Desmos links
- extracted formulas
- slider controls
- loop/play timing
- section or folder structure
- color mappings

What is still mostly missing is the performance layer:

- drawing process
- shot design
- sound design
- background music choice
- camera behavior
- graph-feature highlighting
- scene sequencing

The main idea is that `math-symphony` should not remain only an extraction archive. It can become a staging system for mathematical performances.

---

## Current Understanding

The Desmos projects give us strong raw material, but they usually do not fully specify how a graph should be introduced, staged, or dramatized.

That means the extracted score is not the final artistic object. It is the source score. The upgrade layer comes from interpretation.

In practical terms:

- extraction preserves the original formulas and controls
- interpretation explains what is visually interesting
- staging decides how to reveal the graph over time
- scoring assigns sound, music, color, and motion

This is important because we can legitimately do better than the original shared graph if our goal is not recovery, but performance direction.

---

## Why This Has Potential

The existing score files already contain enough structure to support expansion.

Useful seeds already present in the archive:

- `Logic` tells us what mathematical object exists
- `Control` tells us what changes over time
- `Total Time` and loop data suggest pacing
- grouped folders/scenes suggest segmentation
- titles and themes suggest emotional direction

So the project already has the beginnings of:

- scene units
- transitions
- rhythmic motion
- motif-based curation

---

## Proposed Upgrade Direction

Each score can later be upgraded with additional layers such as:

- `Motion`: reveal order, sweep behavior, growth, oscillation, disappearance
- `Visual`: palette, contrast, glow, line density, fade logic, background style
- `Camera`: full shot, center push, symmetry close-up, edge tracking, rotation
- `Audio`: BGM mood, SFX events, accent timing, silence moments
- `Feature`: symmetry, asymptotes, crossings, petal count, singularity behavior
- `Narrative`: what the section is doing emotionally or structurally

This would turn the score from a formula catalog into a usable performance blueprint.

---

## Strong Existing References Inside This Repository

Other folders in the repository already contain systems that can inform `math-symphony`.

### `math-draw`

Relevant strength:

- staged reveal
- code-to-drawing transition
- visible drawing process
- simple SFX-timed playback

Why it matters:

This is the clearest local reference for adding the missing "how it gets drawn" layer.

### `math-sound`

Relevant strength:

- function-to-sound thinking
- function families grouped by character
- audio-oriented interpretation of math

Why it matters:

This can inform how formulas receive sound identities, not only visual identities.

### `polygon-harmonic`

Relevant strength:

- timeline engine
- scene events
- subtitles and captions
- synchronized audio logic

Why it matters:

This is the strongest local reference for turning a score into a timed performance system.

### `visualization/assets/music`

Relevant strength:

- existing BGM library
- mood-based audio options

Why it matters:

This gives `math-symphony` a practical soundtrack source instead of a purely theoretical audio layer.

---

## Important Expansion Question

A major design question is whether `math-symphony` should only absorb ideas from the rest of the repo, or whether the rest of the repo should also absorb ideas from `math-symphony`.

The answer is probably both.

### Direction A: Import into `math-symphony`

Bring in:

- draw-process logic
- timeline and scene logic
- sound mapping
- BGM selection logic

Outcome:

`math-symphony` becomes a higher-level score and performance framework.

### Direction B: Export from `math-symphony`

Use the score archive as a source of new geometry and behavior for other projects.

This becomes most interesting in:

- `sort-color`
- `caustics`
- `polyhedra`

---

## Applying Math Graphs to Other Projects

### `sort-color`

This is currently the most realistic target.

Reason:

- it already uses geometry providers
- it already separates engine and geometry
- it already supports mathematical shape generation

So new graph-based providers could be added naturally:

- polar providers
- parametric providers
- implicit contour providers
- Desmos-inspired special providers

However, there is a core staging problem:

> A formula may be mathematically singular, but a shot sequence needs multiple units.

The answer is not to split the formula itself. The answer is to split presentation states.

One formula can yield many staged units:

- sparse anchor view
- line-only reveal
- dense full state
- parameter sweep
- symmetry close-up
- color transition state
- sorting transition state

So the right model for `sort-color` is likely:

- `FormulaProvider`: generates the graph geometry
- `ShotPreset`: defines how that graph is shown
- `Sequence`: arranges several shot presets into a performance block

This means one formula can support many shots without changing its mathematical identity.

### `caustics`

This is more experimental but artistically powerful.

Possible use:

- treat a formula-generated curve as a reflective boundary
- use graph-derived walls for ray interactions
- reinterpret familiar formulas as optical objects

Good candidates:

- polar roses
- cardioid-like curves
- sinusoidal walls
- implicit barriers

This is harder than `sort-color`, but the visual payoff could be much stronger.

### `polyhedra`

This is probably best approached through visual layering rather than core geometry replacement.

Possible use:

- project formulas onto faces
- draw graph trajectories across unfolded nets
- use formula-based textures on rotating solids

This is less direct than `sort-color`, but it could become a powerful 3D staging extension.

---

## Working Conclusion

Right now the strongest strategic path looks like this:

1. finish expanding the score archive
2. standardize the score language later
3. add a performance layer after the archive matures
4. use `sort-color` as the first execution target for formula-provider experiments
5. explore `caustics` as the first high-art reinterpretation target
6. treat `polyhedra` as a later-stage 3D extension

---

## Core Concept Going Forward

The most important conceptual shift is this:

`math-symphony` is not just a place to store formulas.

It can become:

- an archive of extracted mathematical scores
- a staging guide for mathematical performance
- a source library for geometry providers in other projects
- a bridge between math, sound, motion, and cinematic structure

That is the current direction worth preserving.

---

## First Implementation Path

If the first execution target is `sort-color`, then the implementation should not begin with a huge generalized math engine.

It should begin with a very small drawing pipeline.

### Basic Principle

Do not start by asking:

- how do we support all formulas?

Start by asking:

- how do we progressively reveal one formula as a shot?

That leads to a minimal three-layer model:

- `Geometry`: generate points and segments from a formula
- `Reveal`: decide how those points or segments become visible over time
- `Playback`: drive reveal progress from `0` to `1`

### Minimal Implementation Steps

#### 1. Sample the formula into points

Do not begin with symbolic math complexity.

Convert one formula into a sampled point list.

Examples:

- polar formula: sample over `theta`
- parametric formula: sample over `t`
- cartesian formula: sample over `x`

Result:

```txt
points = [{ x, y, index, param }]
```

This is the first practical bridge between a score file and a renderable system.

#### 2. Build drawable segments

Once points exist, create line or curve segments from them.

Basic options:

- connect neighboring points
- connect by multiplier or mapping rule
- connect to center
- connect to symmetry partner

Result:

```txt
segments = [{ from, to, index, type }]
```

This is where a formula stops being abstract and becomes stageable geometry.

#### 3. Add reveal logic

This is the actual start of drawing logic.

The formula does not create the shot by itself.
The reveal mode creates the shot.

Useful first reveal modes:

- `trace`: draw segment-by-segment in order
- `fade-in`: show the full structure with increasing alpha
- `burst`: reveal from center or from a chosen metric outward

Each reveal mode should be controlled by a normalized progress value:

```txt
progress: 0.0 -> 1.0
```

#### 4. Keep playback simple

At the beginning, playback should only move `progress` over a fixed duration.

Example:

- 4-second shot
- progress increases linearly from `0` to `1`

This is enough to test whether a graph can feel cinematic before adding more complicated motion systems.

#### 5. Introduce shot presets

A single formula should support multiple presentational states.

This solves the core problem:

> one formula may be mathematically singular, but a performance needs multiple shot units

So a formula should not be treated as one shot.
It should be treated as a source for many shot presets.

Example shot presets:

- `intro_points`
- `trace_lines`
- `dense_full`
- `symmetry_focus`
- `sort_transition`

### Recommended First Prototype

The first prototype should be intentionally small.

Recommended shape:

- one polar or parametric formula
- about 300 to 500 sampled points
- neighboring-point segments
- one `trace` reveal mode
- one 4-second playback window

If that works visually, then the next additions can be:

- denser sampling
- alternate reveal modes
- color-state presets
- camera framing rules
- sorting-state transitions

### Working Rule

The first implementation is not:

- full Desmos compatibility
- a universal formula parser
- a complete score runtime

The first implementation is:

- one formula
- one provider
- one reveal mode
- one successful shot

That is the correct starting point.
