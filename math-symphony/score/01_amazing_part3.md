# Amazing Animations Part 3: Mathematical Score (Final Complete Version)

**Source:** [Desmos (Amazing Animations Part 3)](https://www.desmos.com/calculator/ym9zdoboer)
**Theme:** Minimalist Resonance and Grid Distortion

---

## 0. Background & Palette
- **Logic:** Entire background is black-filled via `|y|>0`.
- **Colors:** 
    - `c1 = rgb(255, 0, 0)` (Red)
    - `c2 = rgb(0, 255, 0)` (Green)
    - `c3 = rgb(255, 255, 255)` (White)

---

## 1. Linear Resonance (Graph 1-3)
*Traditional wave functions with high-speed frequency modulation.*

- **Logic:**
    - `y = cos(ax)` (Standard resonance)
    - `y = x * cos(ax)` (Expanding amplitude)
    - `y = cos(x) * cos(ax)` (Envelope modulation)
- **Control:** `a = 1.6` (Slider: `0` to `30`, 11428ms Play Once)

---

## 2. Grid Distortion (Graph 4: THUMBNAIL)
*The centerpiece of the animation: a bending coordinate mesh.*

- **Logic:**
    - `cos(ax) = sin(ay)`
- **Visual Effect:** Creates a cellular grid that fluctuates in density and curvature as `a` increases.

---

## 3. Radial Whirlpool (Graph 5)
*Implicit surface based on coordinates and inverse square distances.*

- **Logic:**
    - `y = 4.8 * cos( a*x*y / (y^2 + x^2) )`
- **Visual Effect:** A mesmerizing ripple that centers at the origin and radiates outward in a square-like interference pattern.

---

## Visual Aesthetics (Minimalist)
| Keyword | Variable | RGB Value | Hex (Approx) |
|---|---|---|---|
| Color 1 | `c1` | (255, 0, 0) | #FF0000 |
| Color 2 | `c2` | (0, 255, 0) | #00FF00 |
| Color 3 | `c3` | (255, 255, 255)| #FFFFFF |

## Global Summary
- **Primary Tool:** Variable `a` (Frequency multiplier) scanning from 0 to 30.
- **Narrative:** "Amazing Animations Part 3: Grid Resonance."
- **Total Components:** 5 core implicit and explicit surfaces.
