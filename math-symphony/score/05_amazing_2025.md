# Amazing 2025 Edition: Mathematical Score (Final Complete Version)

**Source:** [Desmos (Math graphs but it get increasingly more AMAZING - 2025 Edition)](https://www.desmos.com/calculator/dvcjvfuhdc)
**Theme:** The Magic of "2025" and Dynamic Symmetries

---

## 0. The Beginning (V1 BEGINNING)
*Massive initial shapes using the 2025 theme.*

- **Scripts:** "1 Circle with radius 45", "2 Really big sine wave", "3 Polar rose with 2025 petals", "4 Tree"
- **Logic:**
    - `x^2 + y^2 = 2025 * v1` (Radius square)
    - `y = 2025 * sin(x / 2025) * v1`
    - `r = sin(2025 * theta)` (Extreme petal density)
    - `y/v1 = cos(20x) + sin(sqrt(25y))`
- **Control:** `v1 = 1` (Slider: `-0.5` to `1`, 5333ms Play Once)

---

## 2. Parametric Lissajous (V4 PARAMETRIC 1-4)
*Classic Lissajous figures with satisfying motion.*

- **Scripts:** "Moves back and forth", "Spin", "Longer"
- **Logic:**
    - `(sin(20t), sin(25t))` (Base ratio 4:5)
    - `(sin(20t), sin(25t + v4))` (Classic spin)
    - `(cos(sin(20t) + v4), sin(25t + v4))`
    - `(4*cos(sin(20t + v4) + v4), sin(25t + v4))` (Exaggerated move)
- **Control:** `v4 = 1.67` (Slider: `0` to `2 * pi`, 5333ms loop)

---

## 3. Spiral & Spinny Things (V6 & V8)
*From jagged spirals to satisfying clovers.*

- **Scripts:** "Jagged Spiral", "Spinning jagged spiral", "Clover", "Cool and satisfying"
- **Logic (V6):**
    - `r = v6 * 2025 * theta`
    - `r = v6 * 2025 * (theta + ceil(theta))` (Jagged effect)
    - `r = 2025 * (theta + v6 * ceil(theta + 6*v6))`
- **Logic (V8):**
    - `r = sin(2025*theta / 1000 + v8) + cos(1.05*theta)`
    - `r = ceil(sin(2025*theta / 1000 + v8)) + cos(2.05*theta - v8)`
- **Control:** `v6 = 0.52`, `v8 = 5.53` (Slider: `0` to `2*pi`)

---

## 4. Implicit Realities (V3 GCD)
*Using Greatest Common Divisor to create structured noise.*

- **Scripts:** "Play with gcd", "Small modification big impact", "Bend the reality"
- **Logic:**
    - `y = gcd(2025, x * v3)`
    - `y = gcd(2025*x, x * v3)`
    - `y = gcd(2025, x) + v3 * sin(x) + ceil(v3 * x)`
- **Control:** `v3 = 0.446` (Slider: `0` to `1`, 11428ms Reverse Loop)

---

## 5. Christmas Trees & Symbols (V2)
*Polar lists creating recognizable logos.*

- **Lists:** `l1 = [50, 100, ..., 2025]`
- **Scripts:** "Christmas tree", "Deadpool logo", "Spreading Deadpool logo"
- **Logic:**
    - `r = sin(theta + l1) + ceil(v2 * sin(theta))`
    - `r = sin(theta + l1 - v2) - ceil(2 * sin(2*theta + v2 + 1.55))` (Deadpool approximation)
- **Control:** `v2 = 3.74` (Slider: `-1` to `2*pi`, 8000ms Play Once)

---

## 6. Grand Finale: Fireworks (V5)
*Exploding concentric waves.*

- **Logic:** Concentric expanding/contracting polar roses.
    - `r = v5 * (20*sin(25*theta)) + [0, 2, 4, 6, 8]`
- **Control:** `v5 = 0` (Slider: `0` to `1`, 8000ms Reverse Loop)

---

## Visual Aesthetics (Colors)
| Keyword | RGB Value | Hex (Approx) |
|---|---|---|
| `c_red` | (0, 255, 255) | #00FFFF |
| `c_orange` | (0, 90, 255) | #005AFF |
| `c_yellow` | (0, 0, 255) | #0000FF |
| `c_green` | (255, 0, 255) | #FF00FF |
| `c_cyan` | (255, 0, 0) | #FF0000 |
| `c_blue` | (255, 255, 0) | #FFFF00 |
| `c_pink` | (0, 255, 0) | #00FF00 |
| `c_purple` | (109, 255, 0) | #6DFF00 |

## Global Summary
- **Primary Theme:** The number "2025" as a multiplier for scale and complexity.
- **Narrative:** "Math graphs but they get increasingly more AMAZING."
- **Total Complexity:** `4+6+4+4+5+3+3 = 28` (Key logic nodes).
