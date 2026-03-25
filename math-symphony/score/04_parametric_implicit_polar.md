# Parametric, Implicit, and Polar: Mathematical Score (Final Complete Version)

**Source:** [Desmos (Parametric, Implicit, and Polar)](https://www.desmos.com/calculator/zlg8qm6wtn)
**Extraction Method:** JSON Direct State Analysis (Post-Refinement)

---

## 0. Thumbnail Settings (THUMBNAIL)
*These expressions define the main cinematic state of the visualization.*

- **Logic:**
    - `r = sec(1.2*theta + vs) + sin(3*vs + cos(1.2*theta + sin(1.2*theta)))`
    - `r = sec(1.2*theta + vs) + sin(theta * vs)`
    - `2r = 6*sin(1.2*theta) - cos(6*theta + vs)`
    - `1.6 * r = 5*sin(0.4*theta) - cos(2*theta + vs)`
- **Control:** `vs = 6.28318` (Slider: `0` to `2 * pi`)

---

## 1. Parametric Mastery (PARAMETRIC 1-7)
- **Folder 402: Tan Twist (9)**
    - `(tan(t + vp1), sin(t))`
    - `(tan(2t + vp1) + cos(4t), sin(3t) + cos(5t))`
    - `(tan(2t + vp1) + cos(2t), sin(3t) + cos(7t))`
    - **Control:** `vp1 = 3.26` (Slider: `0` to `2*pi`, 5333ms loop)
- **Folder 403: Sec Rotate (7)**
    - `(sec(t), sin(4t + cos(2t) + sin(3t) + vp2))`
    - `(sec(2t), sin(5t + cos(2t) + vp2) + sin(t))`
    - **Control:** `vp2 = 0` (Slider: `0` to `2*pi`, LOOP_FORWARD)
- **Folder 405: Weird Loop (6)**
    - `(cos(t), sin(t + sin(t + sin(t + vp3))))`
    - `(cos(t + cos(t + cos(3t + vp3))), sin(t + sin(t + sin(2t + vp3))))`
    - **Control:** `vp3 = 0` (Slider: `0` to `2*pi`, LOOP_FORWARD)
- **Folder 406: t and sin (9)**
    - `(t, sin(3t + vp4) + cos(2t - vp4) * sin(4t))`
    - `(t, 2*sin(3t + vp4) + cos(2t - vp4) * sin(4t))`
    - **Control:** `vp4 = 3.22` (Slider: `0` to `2*pi`)
- **Folder 407: csc and tan (9)**
    - `(csc(2t), tan(2t + sin(2t + vp5)))`
    - `(csc(2t), tan(2t + sin(2t + vp5)))`
    - **Control:** `vp5 = 0` (Slider: `0` to `2*pi`, 8000ms loop)
- **Folder 408: tan grow (7)**
    - `(tan(vp6*t), sin(2t + 5*vp6) * cos(3t))`
    - **Control:** `vp6 = 3` (Slider: `-1` to `3`, 20000ms Play Once)
- **Folder 409: Spiral Spires (5)**
    - `0.8 * (t*cos(t + sin(2t)) + cos(3t), t * |sin(vp7 + t)|)`
    - **Control:** `vp7 = 6.28318` (Slider: `0` to `2*pi`, 11428ms loop)

---

## 2. Implicit Functions (IMPLICIT 1-9)
- **Folder 415: Simple Sine (3)**
    - `sin(x + sin(x + sin(x + sin(x - vi1))))`
    - **Control:** `vi1 = 5.45` (Slider: `0` to `2*pi`)
- **Folder 416: Tan Rise (5)**
    - `y = tan(x + vi2) - sin(10x + cos(x))`
    - **Control:** `vi2 = 4.516` (Slider: `0` to `2*pi`, 8000ms loop)
- **Folder 417: Tan-Sine Mix (5)**
    - `y = tan(x + vi3 + 2*cos(x)) * sin(2x)`
    - **Control:** `vi3 = 1.14` (Slider: `0` to `2*pi`, 5333ms loop)
- **Folder 418: Double Tan (6)**
    - `y = tan(x/5 + vi4) * tan(x + sin(2x))`
    - **Control:** `vi4 = 0` (Slider: `0` to `2*pi`, 8000ms loop)
- **Folder 419: Change Axis (7)**
    - `sin(x) = vi5 * cos(y) + sin(2x + vi5)`
    - **Control:** `vi5 = -2.6` (Slider: `-5` to `5`, 5333ms Reverse Loop)
- **Folder 420: Whiplash (4)**
    - `sin(x) = 2 * cos(y) * sin(x + vi6)`
    - **Control:** `vi6 = 0.08` (Slider: `0` to `2*pi`, 5333ms loop)
- **Folder 421: Sine-Cos Modulation (5)**
    - `sin(x) = cos(2y) * sin(2x + vi7) + cos(2x + y)`
    - **Control:** `vi7 = 6.2` (Slider: `0` to `2*pi`, 5333ms loop)
- **Folder 422: Cos and Sec (8)**
    - `x^2 - y^2 = sec(vi8 * x)`
    - **Control:** `vi8 = 30` (Slider: `-5` to `30`, 20000ms Play Once)
- **Folder 423: Modulo Waves (3)**
    - `y = sin(x) + mod(x + sin(x + vi9), 0.5)`
    - **Control:** `vi9 = 0.98` (Slider: `0` to `2*pi`, 5333ms loop)

---

## 3. Polar Designs (POLAR 1-10)
- **POLAR 1 (4):** `r = sin(vr1 + 4*theta) + vr1` (Control: `vr1 = [-3 to 3]`)
- **POLAR 2 (4):** `r = sin(theta + vr2) + cos(4*theta)` (Control: `vr2 = [0 to 2*pi]`)
- **POLAR 3 (5):** `2r = sin(3*theta + vr3) + cos(6*theta) + vr3`
- **POLAR 4 (5):** `2r = sin(8*theta + vr4) + cos(8*theta) + vr4` (Control: `vr4 = 8.3`)
- **POLAR 5 (6):** `2r = theta + vr5 + sin(4*theta) * cos(6*theta)` (Control: `vr5 = 2.09`)
- **POLAR 6 (4):** `r = vr6 * sin(theta * vr6) + cos(1.2*theta)` (Control: `vr6 = 1.29`)
- **POLAR 7 (10):** `2r = 6*sin(1.2*theta) - cos(6*theta + vr7)` (Control: `vr7 = [0 to 2*pi]`)
- **POLAR 8 (6):** `r = sec(vr8 + 0.5*theta + sin(2.01*theta))` (Control: `vr8 = 2.4`)
- **POLAR 9 (6):** `r = sec(1.2*theta + vr9) + sin(3*vr9 + cos(1.2*theta + sin(1.2*theta)))`
- **POLAR 10 (3):** `r = sec(1.2*theta + vr10) + sin(theta * vr10)` (Control: `vr10 = 0.05`)

---

## Visual Aesthetics (Colors)
| Keyword | RGB Value | Hex (Approx) |
|---|---|---|
| `c_pink` | (0, 255, 0) | #00FF00 |
| `c_purple` | (109, 255, 0) | #6DFF00 |
| `c_cyan` | (255, 0, 0) | #FF0000 |
| `c_green` | (255, 0, 255) | #FF00FF |
| `c_yellow` | (0, 0, 255) | #0000FF |
| `c_orange` | (0, 90, 255) | #005AFF |
| `c_red` | (0, 255, 255) | #00FFFF |
| `c_blue` | (255, 255, 0) | #FFFF00 |

## Global Meta Logic
- **Total Scene Logic:** `t_otal = p_olar + i_mplicit + p_arametric`
- **Expressions Sum:** `p_arametric = 52`, `i_mplicit = 48`, `p_olar = 53`
- **Note:** `y = 480/x` (Plot constraints)
