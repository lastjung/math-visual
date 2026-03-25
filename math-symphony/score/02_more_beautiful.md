# More Beautiful Graphs: Mathematical Score (Final Complete Version)

**Source:** [Desmos (More Beautiful Graphs)](https://www.desmos.com/calculator/xxm41sqmv5)
**Theme:** The Beauty of the Sign Function (`sign(x)`)

---

## 0. Thumbnail & Intro (Scene 1 & 2)
*The introduction to the Signum function and its basic properties.*

- **Scripts:** "What if I told you that you could create stunning animations using math functions you’ve probably never even heard of?", "The sign function returns -1, 0, or +1. Sounds boring, right? But wait!"
- **Logic (Basic):**
    - `y = sign(x)`
    - `y = sign(sin(x))` (The "glitch" or "square" wave foundation)
- **Parametric Intro:**
    - `(t, sign(t))` (Range: `-10` to `v1`)
    - `(t, t)` (Diagonal reference)
- **Control:** `v1 = 10` (Slider: `-15` to `10`)

---

## 1. Parametric Masterpieces (Scene 13 & 14)
*Complex parametric paths using sign modulation.*

- **Mind Blowing Spinny (Parametric 1-5):**
    - `r = sign(cos(n*theta + 3*v13)) + sin(v13*theta / 20)` (where `n = 2, 3, 4, 7, 6`)
    - **Control:** `v13 = 0` (Spin controller)
- **Punk Hair & Laser Beams:**
    - `y = x * sign(csc(tan(x + v9) + v9)) + cos(x)`
    - **Control:** `v9 = 3.01` (Slider: `0` to `2*pi`, 8000ms loop)

---

## 2. Implicit Waves (Scene 6, 7, 8, 11, 12)
*Surface and line equations using trigonometric combinations.*

- **Scripts:** "To make it interesting, you can combine the sign function with other math functions."
- **Up and Down:**
    - `y = v6 * sign(v6*x - y) + cos(v6 + x)`
    - **Control:** `v6 = -7.07` (Slider: `-8` to `8`)
- **Jagged Sine Wave (GCD Mix):**
    - `y = gcd(v11*x) * sign(sin(x)) - sin(x)`
    - `y = 2 * sign(sin(x - v12)) + mod(8x, v12) - sin(x + v12)`
    - **Control:** `v11 = 0`, `v12 = 0.19`

---

## 3. Polar Designs (Scene 14 & 15)
*Symmetrical shapes like Shurikens and Stars.*

- **Scripts:** "Enjoy this compilation of satisfying math graphs!"
- **Shuriken Logic (Polar 1-9):**
    - `r = sign(cos(k*theta - v14)) + sin(v14 + k.05*theta)` (where `k = 2, 3, 5`)
    - `r = sign(cos(k*theta - v14)) + sin(v14 + k.05*theta) * cos(v14)`
    - **Control:** `v14 = 4.33` (Slider: `0` to `2*pi`, 8000ms loop)
- **List-Based Polar Shapes (Scene 15):**
    - `l1 = [2, ..., 10]` (List of layers)
    - `r = l1 * sign(cos(3*theta - l1*v15)) + sin(v15 + 3*theta + l1) - cos(v15)`
    - **Control:** `v15 = 2.25` (Slider: `0` to `2*pi`, 20000ms loop)

---

## Visual Aesthetics (Colors)
| Keyword | RGB Value | Hex (Approx) |
|---|---|---|
| `c_red` | (0, 255, 255) | #00FFFF |
| `c_orange` | (0, 90, 255) | #005AFF |
| `c_yellow` | (0, 0, 255) | #0000FF |
| `c_green` | (255, 0, 255) | #FF00FF |
| `c_cyan` | (255, 0, 0) | #FF0000 |
| `c_lightblue` | (161, 100, 0) | #A16400 |
| `c_blue` | (255, 255, 0) | #FFFF00 |
| `c_pink` | (0, 255, 0) | #00FF00 |
| `c_purple` | (109, 255, 0) | #6DFF00 |

## Global Summary
- **Primary Tool:** `sign(x)` used to create binary-like switching logic in continuous waves.
- **Narrative:** "Math graphs but they get increasingly more beautiful."
- **Total Complexity:** 41 expressions x 8 variations (Approx 376 logical points).
- **Note:** `total = 41 x 8 = 376` (Script marker).
