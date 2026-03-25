# Sort Color First Implementation Plan

## Purpose

This document records the decision to use `sort-color` as the first execution target for `math-symphony` ideas.

`math-symphony` remains the archive and design layer.
`sort-color` becomes the first practical implementation layer.

In short:

- `math-symphony` = source scores, interpretation, staging concepts
- `sort-color` = first rendering and behavior prototype

---

## Why `sort-color` Comes First

Among the existing projects in this repository, `sort-color` is the most realistic first implementation target.

Reasons:

- it already has a geometry-provider architecture
- it already separates engine logic from geometry logic
- it already supports mathematical shape generation
- it already has rendering, color logic, and animation flow
- it can absorb a graph-based provider without requiring a total rewrite

This makes it the best place to test whether a mathematical score can become a staged visual sequence.

At the same time, a small warning is necessary:

before inserting a new formula provider, `sort-color` likely needs a minimum level of module cleanup.

This does **not** mean a full architectural refactor should happen first.
It means only the boundaries that would cause immediate confusion should be clarified before insertion.

The working rule should be:

- do not pause the project for a total rewrite
- do perform the minimum cleanup required to create a stable provider insertion point

This includes:

- clarifying provider responsibilities
- clarifying how provider output enters the sort engine
- clarifying where coordinate normalization belongs
- clarifying where reveal or shot state should live

So the strategy is:

- minimal cleanup first
- provider experiment second

not:

- complete refactor first
- implementation much later

---

## Core Decision

The first implementation should happen in `sort-color`, not directly in `math-symphony`.

That does not mean `math-symphony` becomes secondary.

It means:

- `math-symphony` defines what a graph means
- `sort-color` tests how that graph behaves on screen

The workflow should be:

1. choose a score from `math-symphony`
2. extract one formula or one tightly related formula cluster
3. design a few shot states for it
4. implement the geometry and reveal behavior inside `sort-color`
5. evaluate whether the result is visually and structurally strong

---

## Main Design Problem

The main problem is simple:

> a formula may be one mathematical object, but a visual sequence needs multiple shot units

So the implementation must not treat:

- one formula = one shot

Instead it should treat:

- one formula = one source
- many presentation states = many shots

This is the conceptual bridge between a score archive and a renderable sequence.

---

## Minimal Runtime Model

The first implementation should use three layers.

### 1. `FormulaProvider`

Responsible for:

- sampling the formula
- generating points
- building drawable geometry

The provider is only responsible for geometry generation.
It should not decide cinematic behavior by itself.

### 2. `ShotPreset`

Responsible for:

- reveal mode
- density mode
- color mode
- focus region
- motion rule
- duration

A shot preset is what turns raw geometry into a presentational unit.

### 3. `Sequence`

Responsible for:

- ordering multiple shots
- defining transitions
- controlling pacing

This is what allows one formula to behave like a short performance block instead of a static image.

---

## Required Integration Clarifications

Before implementation begins, two integration points must be made explicit.

### 1. Integration with the Existing Sort Engine

`sort-color` already has its own core identity through its sorting engine.
The new formula-based provider should integrate with that engine rather than bypass it.

The practical interaction should be:

- the provider generates mathematical geometry
- the provider also emits sortable items
- the sort engine reorders those items
- the renderer reflects the reordered state through the active geometry mapping

This means each generated unit should carry one or more sort-oriented values.

Possible sort keys include:

- sampled parameter order: `t`, `theta`, or index
- radius
- angle
- `x`
- `y`
- distance from center
- segment length
- local complexity or curvature-derived value

The same formula may support multiple sorting meanings depending on the shot or preset.

So the provider should not only answer:

- what geometry do I generate?

It should also answer:

- what sortable identity does each generated unit carry?

### 2. Coordinate System Normalization

This must be explicit before coding.

Desmos-style mathematical coordinates and Canvas pixel coordinates are not the same space.

So the implementation needs a normalization path:

```txt
math space -> normalized space -> canvas space
```

This normalization layer should handle:

- bounds detection
- centering
- scale fitting
- aspect-ratio preservation
- padding
- Y-axis inversion when required for Canvas rendering

Without this, each formula will require ad hoc display fixes and the provider system will become unstable.

The safest responsibility split is:

- `FormulaProvider`: generate points in math space
- mapper or normalization layer: convert into screen-ready geometry

Whether that mapper is embedded inside the provider or extracted as a helper is an implementation choice, but the responsibility itself must be clear.

---

## First Drawing Logic

The drawing logic should begin from the smallest workable pipeline.

### Step 1. Sample one formula into points

Examples:

- polar formula sampled over `theta`
- parametric formula sampled over `t`
- cartesian formula sampled over `x`

Output:

```txt
points = [{ x, y, index, param }]
```

At this stage, points should still remain in mathematical coordinate space.

### Step 2. Convert points into segments

Initial segment strategy should stay simple:

- neighboring-point connection

Later strategies can include:

- multiplier connections
- symmetry mapping
- center-linking

Output:

```txt
segments = [{ from, to, index, type }]
```

At this stage, sortable identity should also be attached.

Example:

```txt
items = [{ id, pointOrSegment, sortKey, meta }]
```

### Step 2.5. Normalize into render space

Before rendering, the sampled geometry must be mapped into a stable display frame.

Minimum responsibilities:

- compute bounds
- preserve aspect ratio
- fit to canvas with padding
- map center correctly
- invert vertical direction if needed

This should prevent each formula from requiring one-off rendering hacks.

### Step 3. Add reveal logic

The first reveal logic should be controlled by normalized progress:

```txt
progress = 0.0 -> 1.0
```

Recommended first reveal mode:

- `trace`

Optional next reveal modes:

- `fade-in`
- `burst`

### Step 4. Drive playback over fixed duration

At the beginning, playback should be intentionally simple.

Example:

- 4 seconds
- linear progress from `0` to `1`

That is enough to test whether the graph can feel staged.

---

## Step-by-Step Strategy

The first implementation should follow a controlled sequence rather than jumping directly into rendering.

### Phase 1. Pre-Implementation Cleanup in `sort-color`

Goal:

- confirm provider boundaries
- confirm where provider output enters the sorting flow
- identify where normalization should live

This does not require a large rewrite.
It only requires enough cleanup to create a stable insertion point.

### Phase 2. Define the Provider Contract

Goal:

- define what a formula provider must return

Minimum return structure should likely include:

- sampled geometry
- sortable items
- sort keys
- provider metadata
- optional source-space bounds

This is the phase where integration with the existing sort engine becomes explicit.

### Phase 3. Add Coordinate Normalization

Goal:

- ensure formula geometry can be displayed consistently regardless of scale or aspect

This phase should define:

- math-space bounds
- normalization rules
- canvas-fit behavior
- padding rules

Without this phase, formula rendering will become fragile immediately.

### Phase 4. Build One Minimal Formula Provider

Goal:

- prove that one mathematical graph can enter the `sort-color` pipeline cleanly

Recommended constraints:

- one manageable formula
- one sample strategy
- one sort-key strategy

This phase is about pipeline validity, not visual perfection.

### Phase 5. Add One Reveal Mode

Goal:

- prove that the graph can be staged, not just statically shown

Recommended first reveal mode:

- `trace`

This is the earliest point where the graph becomes a shot instead of a picture.

### Phase 6. Add a Small Shot Sequence

Goal:

- prove that one formula can produce multiple presentation units

Recommended minimum:

- introduction shot
- trace shot
- full-state shot

If this works, the architecture is likely correct.

### Phase 7. Connect Sorting Behavior

Goal:

- let the existing `sort-color` identity fully re-enter the system

This is where the generated formula items should actually be sorted by chosen keys through the existing engine.

At this point the experiment becomes a real `sort-color` implementation rather than a separate graph viewer.

### Phase 8. Evaluate and Feed Back into `math-symphony`

Goal:

- record what worked
- record which sort keys were meaningful
- record which reveal modes produced real shot separation

This closes the loop between design archive and execution target.

---

## First Prototype Scope

The first prototype should be intentionally narrow.

Recommended boundaries:

- one formula only
- one provider only
- one reveal mode only
- one sequence only
- one successful visual shot as the minimum goal

This is important.

The first milestone is not:

- universal formula support
- full score playback
- complete Desmos coverage

The first milestone is:

- one graph
- rendered in `sort-color`
- with a visible reveal process
- divided into meaningful presentation states

---

## Candidate Formula Types for the First Test

The first test should avoid the most unstable formulas.

Best candidates:

- simple polar rose
- simple parametric loop
- sine-cosine polar hybrid

More difficult and better left for later:

- aggressive `tan` / `sec` asymptotic forms
- dense implicit fields
- highly layered list-based expressions

The first implementation should prove the architecture, not maximize difficulty.

---

## Recommended First Sequence Structure

One formula can be divided into a very small sequence like this:

### Shot A. Anchor Introduction

- sparse points
- low density
- calm color state

### Shot B. Trace Reveal

- sequential line drawing
- medium density
- main structure becomes legible

### Shot C. Full State

- denser geometry
- stronger color logic
- stable display window

### Shot D. Transition or Sort State

- geometry stays recognizable
- sorting behavior or mapping transition begins

This is enough to prove the idea.

---

## Relationship Back to `math-symphony`

If the prototype works, the result should flow back into the score system.

That means `math-symphony` can later record:

- which score inspired the provider
- which formula was chosen
- which shot presets were derived
- what worked visually
- what failed or needs refinement

So `sort-color` is not a disconnected implementation.
It is the first applied branch of the score archive.

---

## Verification and Review

This project should use split responsibilities for implementation and verification.

### Implementation Responsibility

Primary implementation work includes:

- design structure
- provider insertion planning
- integration planning
- code changes
- documentation updates

### Verification Responsibility

Jaemin should handle the main verification pass because browser-based checking is especially important for this work.

Primary verification work includes:

- checking the visual result in the browser
- confirming that shot separation is actually visible
- checking whether reveal logic feels natural
- checking whether coordinate normalization produces stable framing
- checking whether sorting behavior preserves graph legibility

### Code Review Responsibility

Jaemin should also perform an additional code review pass after implementation.

That review should focus on:

- whether the provider contract is clean
- whether integration with the existing sort engine is coherent
- whether normalization responsibilities are placed correctly
- whether reveal logic is isolated clearly enough
- whether the implementation matches the documented strategy

This creates a useful two-layer validation process:

- implementation and system design
- browser verification and secondary code review

---

## Working Conclusion

The first implementation plan is:

1. keep building the `math-symphony` archive
2. select one score as a source
3. choose one manageable formula
4. implement it as a `FormulaProvider` in `sort-color`
5. create a few `ShotPreset` states
6. run a small `Sequence`
7. evaluate whether the reveal logic produces real shot separation

If this succeeds, the same structure can later support:

- more formulas
- stronger staging
- audio mapping
- camera logic
- extensions into `caustics`
- later 3D interpretation in `polyhedra`

---

## Verification and Review Criteria

To ensure the implementation is robust, every phase should be reviewed against these five criteria:

### 1. Provider Contract Integrity
- Does the new `FormulaProvider` contract break the existing engine flow?
- Is the data structure compatible with `SortEngine.js` and `SortRenderer.js`?
- Can existing cases (Cardioid, Lissajous) eventually adapt to this contract?

### 2. Normalization Strategy
- Is the coordinate normalization (math space -> canvas space) handled in the correct layer?
- Does it prevent "magic number" fixes for different formula scales?
- Is aspect ratio preservation stable across window resize events?

### 3. Sorting Key Design
- Is the sorting key logic natural to the formula (e.g., parameter `t` vs. calculated distance)?
- Does it feel like a forced addition, or an organic property of the mathematical object?

### 4. Layered Reveal Logic
- Is the reveal logic (e.g., `trace`) truly separated from the geometry generation?
- Can a new reveal mode be added without modifying the `FormulaProvider`?

### 5. Final Intent Alignment
- Does the actual browser output reflect the "staged visual sequence" intent of the document?
- Is there a clear separation between shots (Intro, Reveal, Stable)?
