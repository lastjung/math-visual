# Desmos Video Pipeline

## Goal

Build YouTube-ready math visualization scenes from Desmos graphs.

The target workflow is:

1. Start with a Desmos source URL.
2. Convert the graph into a structured score document.
3. Load the score into the local Desmos API calculator.
4. Show the graph being drawn with synchronized sound.
5. Animate variables so the graph dances with sound.
6. Record in full-screen studio mode.

## Current Example

Source graph:

```text
https://www.desmos.com/calculator/ym9zdoboer
```

Score document:

```text
math-symphony/score/01_amazing_part3.md
```

Local runtime:

```text
math-desmos/
```

## Roles

### Source Desmos Graph

The source Desmos URL is the reference.

It is useful for:

- checking the original visual
- comparing colors and behavior
- manually inspecting formulas

It is not the final controllable runtime, because shared Desmos pages embedded through iframe cannot be controlled by the local site.

### Score Markdown

The score file is the bridge between the original Desmos graph and the local runtime.

It should describe:

- source URL
- graph theme
- formulas
- variable names
- variable ranges
- scene order
- graph bounds
- colors
- visual intent
- animation intent

Example:

```text
math-symphony/score/01_amazing_part3.md
```

### Local Desmos API Calculator

The API calculator is the controllable runtime.

It supports:

- adding formulas with `setExpressions`
- setting graph bounds
- hiding Desmos panels in studio mode
- reading expressions with `getExpressions`
- reacting to Desmos internal slider changes
- connecting graph state to external Web Audio

## Important Constraint

Shared Desmos iframe and Desmos API calculator are different.

### Shared iframe

Pros:

- shows the original graph immediately
- no formula conversion needed

Cons:

- cannot read formulas
- cannot read variables
- cannot hide internal menus directly
- cannot synchronize sound with internal sliders

### API calculator

Pros:

- variables can be read
- formulas can be controlled
- menus can be hidden for recording
- sound can be synchronized

Cons:

- formulas must be added locally
- the source graph must be converted into score/API expressions

## Core Audio Idea

A static graph does not naturally make sound.

Sound requires time.

Therefore, a static graph should be read by scanning across it.

Use a scan variable:

```text
T
```

For a graph:

```text
y = f(x)
```

read it as:

```text
x = T
y(T) = f(T)
T: left -> right
```

Then map graph features to audio:

- `y(T)` -> pitch
- slope at `T` -> brightness or attack
- curvature at `T` -> shimmer
- crossings -> short bell/click
- density -> texture/noise

## Drawing Animation

To show a graph being drawn, restrict the visible domain by `T`.

Original:

```text
y = cos(ax)
```

Drawing version:

```text
y = cos(ax) {x < T}
```

Then animate:

```text
T: -3 -> 3
```

This creates:

- visible left-to-right drawing
- a clear scan position for audio
- a natural basis for recording

## Variable Dance

Variables such as `a`, `b`, and `c` control graph shape.

The scan variable `T` controls how the graph is read.

Use this separation:

```text
a/b/c = shape controls
T = read/draw position
```

For example:

```text
y = a sin(bx + c)
```

Audio read:

```text
y(T) = a sin(bT + c)
```

This lets the system:

- animate or manually adjust shape variables
- keep scanning with `T`
- generate sound from the actual graph shape

## Planned Runtime Flow

1. Load a score-derived preset into the API calculator.
2. Add or enable `T`.
3. Replace suitable formulas with drawing-limited versions.
4. Start audio context after a user click.
5. Animate `T` from left bound to right bound.
6. Sample the graph at `x = T`.
7. Convert graph samples to sound.
8. Enter studio mode.
9. Record.

## Current Implementation Status

Implemented in `math-desmos`:

- Desmos API calculator
- shared iframe comparison mode
- studio mode
- iframe crop for source recording fallback
- exit button for studio mode
- background music controls copied from `sort-color`
- graph texture sound
- `Amazing Part 3` API preset from `01_amazing_part3.md`
- internal Desmos slider `a` change detection for API calculator

Not yet implemented:

- `T` scan variable
- draw-progress playback
- graph sampling at `x = T`
- pitch mapping from graph samples
- slope and curvature based audio
- scene-level score loader

## Next Step

For `Amazing Part 3`, add a drawing/audio mode:

```text
T = -3
y = cos(ax) {x < T}
y = x cos(ax) {x < T}
y = cos(x) cos(ax) {x < T}
```

Then animate:

```text
T: -3 -> 3
```

For audio, begin with:

```text
sample = cos(aT)
pitch = 220 * 2 ^ ((sample * 12) / 12)
volume = 0.05 + abs(sample) * 0.12
```

After that works, expand to:

- slope-based brightness
- curvature-based shimmer
- multiple expression layers
- per-scene score settings
