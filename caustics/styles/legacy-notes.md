# Caustics CSS Legacy Notes

## Current state

`style.css` has been reduced to an import hub.

The main CSS layers are now split into:

- `base.css`
- `layout.css`
- `canvas.css`
- `panels.css`
- `controls.css`
- `shape-panel.css`
- `sidebar.css`
- `player.css`
- `utilities.css`

## Remaining state-selector notes

The project still uses several component-scoped state selectors that were not converted into generic utilities on purpose.

Examples:

- `.controls-sidebar.right.hidden`
- `.controls-sidebar.left.hidden`
- `.apple-player.hidden`
- `.player-restore-tab.hidden`
- `.shape-option-card.hidden`
- `.shape-option-note.hidden`
- `.source-layout-panel.visible`
- `.hud-timer.visible`
- `.hud-speed.visible`
- `.hud-bounces.visible`
- `.shape-accordion.is-open`
- `.toggle-btn.active`
- `.mode-tab.active`
- `.mini-tab.active`
- `.player-btn-main.active`
- `#btn-play.active`
- `#btn-light.light-on`

## Why they remain component-scoped

These selectors do more than simple `display: none` or `display: block`.

They often also control:

- opacity
- transforms
- transitions
- shadows
- component-specific visual overrides

Turning all of them into generic `.hidden`, `.visible`, or `.active` utilities in one pass would risk breaking:

- sidebar open/close animation
- player restore transitions
- HUD fade timing
- shape accordion open state
- button active visuals

## Safe utility extraction completed

The following utility-like rules were moved to `utilities.css`:

- `.flash-active`
- `body.window-full ...`

## Recommended future cleanup

If a second cleanup pass is needed, do it in this order:

1. Introduce explicit utility names instead of overloading `.hidden` and `.active`
2. Migrate one component family at a time
3. Re-test sidebar, player, HUD, and shape-panel interactions after each migration
