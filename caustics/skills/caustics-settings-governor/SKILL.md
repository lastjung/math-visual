---
name: caustics-settings-governor
description: Guardrails for changing Caustics settings, presets, scene schema, pattern data, persistence, or UI controls. Use this whenever the user asks to add, rename, move, remove, or refactor any Caustics setting, preset, slider, pointer value, pattern, scene field, or related state flow, even if they only mention a small UI tweak.
---

# Caustics Settings Governor

Use this skill to keep `caustics` setting changes consistent with the centralized Scene Schema structure.

This skill is for any task that touches:

- scene schema
- `patternId`
- shape presets / pattern data
- sliders / pointer values / options
- `state-mapper.js`
- `shape-registry.js`
- `pattern-resolver.js`
- `persistence.js`
- `controls.js`
- simulation code that applies settings

## First read

Before making changes, read only the relevant parts of:

1. `/Users/eric/PG/math-visual/caustics/docs/plans/completed/caustics-centralized-settings-and-lgt-refinement-plan.md`
2. `/Users/eric/PG/math-visual/caustics/docs/specs/caustics-config-model-specification.md`
3. `/Users/eric/PG/math-visual/caustics/core/state-mapper.js`
4. `/Users/eric/PG/math-visual/caustics/config/shape-registry.js`
5. `/Users/eric/PG/math-visual/caustics/config/pattern-resolver.js`

Read `controls.js`, `render-ui.js`, `persistence.js`, or `simulation-runner.js` only if the change touches them directly.

## Canonical model

Treat this as the source-of-truth structure:

```json
{
  "shape": "string",
  "patternId": "string|null",
  "options": {},
  "auto": {},
  "pointer": {},
  "sliders": {}
}
```

Work from these rules:

- `shape` selects the geometry family.
- `patternId` selects a named preset inside a shape.
- `options` are discrete mode values and toggles.
- `pointer` is for source positions, offsets, and parallel ranges.
- `sliders` is for numeric continuous controls.
- Geometry math stays in logic, not data.

## Required placement rules

When adding or changing a setting, put it in the correct layer.

### `shape-registry.js`

Put static pattern data here:

- labels
- notes
- shape copy
- pattern defaults
- token-based pointer presets
- size-relative pointer definitions

Do not put runtime UI logic here.

### `pattern-resolver.js`

Put token and unit resolution here:

- `shape-focus`
- `shape-center`
- size-relative coordinate expansion

Do not put App state side effects here.

### `state-mapper.js`

Put canonical state flow here:

- `readCurrentScene`
- `applyScene`
- `applyPattern`
- `updateOption`
- `updateSlider`
- `updatePointer`

If a UI event or simulation step changes settings, prefer routing through this file.

### `controls.js`

UI handlers should call:

- `app.updateOption(...)`
- `app.updateSlider(...)`
- `app.updatePointer(...)`
- `app.applyPattern(...)`

Avoid direct state writes unless there is a very strong reason and you document it.

### `persistence.js`

Persist and restore with the scene schema.

Avoid reintroducing flat-state storage unless a temporary migration path is truly required.

## Change workflow

When changing settings, follow this order:

1. Classify the change as `options`, `pointer`, `sliders`, `auto`, `patternId`, or `shape`.
2. Update the schema mapping in `state-mapper.js`.
3. If it is preset data, update `shape-registry.js`.
4. If it uses tokens or size units, update `pattern-resolver.js`.
5. If the user can manipulate it directly, wire it through `controls.js` using the update APIs.
6. If it must survive refresh, confirm `readCurrentScene` and `applyScene` cover it.
7. If a simulation touches it, confirm `simulation-runner.js` uses the same API path.
8. Check whether docs need a small update.

## Never do this

- Do not add new preset data directly inside `ui/panels.js`.
- Do not add new direct state assignments in `controls.js` if `updateOption`, `updateSlider`, or `updatePointer` can handle it.
- Do not store geometry formulas in the registry just to avoid writing logic.
- Do not introduce a second schema for the same setting.
- Do not revive slot-based preset application if `patternId` can be used.

## Shape Switch Governance

When changing shapes (`applyShapeSwitchReset`), follow the "Preserve-Switch-Apply" pattern:

1.  **Preserve**: Temporarily store current critical settings (e.g., sourcePattern, sourceOption, or specific slider overrides) before modifying `app.shape`.
2.  **Switch**: Update `app.shape` and reset environment-dependent variables.
3.  **Apply**: Re-apply the stored settings to the new shape to ensure continuity.
4.  **Finalize**: Trigger UI updates and ray resets only after the new state is fully settled.

## Review checklist

Before finishing, verify all relevant items:

- The setting exists in the right schema bucket.
- Pattern application still goes through `patternId` and `applyPattern`.
- UI interactions use the centralized update API.
- Persistence round-trips the setting.
- Simulation code does not bypass the centralized path.
- No duplicate hardcoded preset data was introduced.
- No legacy fallback was reintroduced without explicit need.

## Output style

When reporting back after a settings change:

1. State which schema bucket was changed.
2. State which files were updated.
3. Call out any remaining legacy or risk.
4. Mention whether persistence and simulation paths were affected.

## Example prompts this skill should handle

- "Add a new slider for source jitter in caustics."
- "Rename triangle direction mode to beam direction everywhere."
- "Make this preset save and restore correctly."
- "Add a new pattern for ellipse and wire it to the preset buttons."
- "Review this caustics settings refactor before we merge it."
