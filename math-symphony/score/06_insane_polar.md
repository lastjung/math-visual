# Polar Graph - Insane: Mathematical Score (Final Complete Version)

**Source:** [Desmos (polar graph - insane)](https://www.desmos.com/calculator/ciidjjc0m2)
**Extraction Method:** JSON Direct State Analysis (Post-Refinement)

---

## 0. Thumbnail & Initial Settings
- **Lists:**
    - `l1 = [1, ..., 10]`
    - `l2 = [1, ..., 2]`
- **Global Sliders:**
    - `a = 0.7675` (Initial setting)
- **Expressions:**
    - `r = tan(0.5*theta + pi/10 * l1)` (Range: `0 <= theta <= 12*pi`)
    - `r = 4*sin(0.4*theta)`
    - `r = 4*sin(a*theta)`
    - `r = 2*sin(0.5*theta * v7 + pi/5 * l1)`
    - `r = 2*sin(0.5*theta * v7 + pi/4 * l2)`
    - `r = 2`

---

## 1. Basic Shapes (1 basic)
- **Scripts:** (Wait for it...)
- **Logic:**
    - `r = sin(theta)` (Domain: `pi * v1`)
    - `r = sin(theta + 2*pi * v1)`
- **Control:** `v1 = 1` (Slider: `-0.25` to `1`, 8000ms loop)
- **Total Time:** `t1 = 2`

---

## 2. Nested Trigonometry (2 nested)
- **Scripts:** "The end result are very shocking / Tomfoolery", "I promise I'm not gonna troll you this time"
- **Logic:**
    - `r = sin(2*theta + sin(4*theta * v2))`
    - `r = sin(2*theta + sin(4*theta + 2*pi * v2))`
    - `r = sin(theta + sin(2*theta + 2*pi * v2) + 2*pi * v2)`
    - `r = sin(theta + sin(3*theta + 2*pi * v2) + 2*pi * v2)`
- **Control:** `v2 = 0.84` (Slider: `-0.1` to `1`, 8000ms loop)
- **Total Time:** `t2 = 4`

---

## 3. Secant Rotations (3 secant)
- **Scripts:** "Best intro for most boring shapes", "This one is even more wild", "How about a little plot twist", "Goofy ah graphs"
- **Logic:**
    - `r = sec(theta + 2*pi * v3)`
    - `r = sec(3*theta * v3 + 2*pi * v3)`
    - `r = sec(3*theta + 2*pi * v3 * sin(theta))`
    - `r = sec(3*theta + 2*pi * v3 * sin(theta + 2*pi * v3))`
- **Control:** `v3 = 0.71` (Slider: `-0.1` to `1`, 11428ms loop)
- **Total Time:** `t3 = 4`

---

## 4. Cosecant & Decimal (4 csc intro and decimal)
- **Scripts:** "Use non integer", "Magic (math wizard is officially a master of sophisticated intro)"
- **Logic:**
    - `r = csc(0.4*theta + pi/2 * v4)`
    - `r = tan(0.3*theta + pi/2 * v4)`
    - `r = csc(1.01*theta * v4)`
    - `r = csc(2.01*theta * v4)`
- **Control:** `v4 = 1` (Slider: `-0.1` to `1`, 11428ms loop)
- **Total Time:** `t4 = 4`

---

## 5. Additive Waves (5 addition)
- **Scripts:** "Alright let's do some simple addition", "Here is a cute butterfly"
- **Logic:**
    - `r = sin(2*theta) + cos(theta * v5)`
    - `r = sin(4*theta * v5) + cos(2*theta * v5)`
- **Control:** `v5 = 1` (Slider: `-0.2` to `1`, 8000ms loop)
- **Total Time:** `t5 = 2`

---

## 6. Inverse Trig Mix (6 inverse trig)
- **Scripts:** "Lets put in inverse trigonometry", "Well thats looks cool, lets do it again", "The council has (decreed) to add decimal"
- **Logic:**
    - `r = arcsin(0.2*theta) - cos(theta + 2*pi * v6)`
    - `r = arcsin(sin(theta * v6))`
    - `r = arcsin(sin(2*theta * v6))`
    - `r = v6 * arcsin(sin(0.8*theta * v6))`
- **Control:** `v6 = 1` (Slider: `-0.1` to `1`, 11428ms loop)
- **Total Time:** `t6 = 4`

---

## 7. List-Based Forms (7 list)
- **Lists:** `l = [1, 2, 3, 4, 5]`, `l1 = [1, ..., 10]`
- **Scripts:** "I am just a humble introduction to using list", "Here is beautiful spherical object"
- **Logic:**
    - `r = theta * v7 + l/2`
    - `r = tan(0.5*theta * v7 + pi/10 * l1)`
    - `r = 4*sin(0.5*theta * v7 + pi/10 * l1)`
    - `r = 4*sin(0.5*theta * v7 + pi/5 * l1)`
- **Control:** `v7 = 1` (Slider: `-0.1` to `1`, 11428ms loop)
- **Total Time:** `t7 = 4`

---

## 8. Exponential Asymmetry (8 exp)
- **Lists:** `l3 = [1, ..., 30]`
- **Scripts:** "Lets try to make asymmetrical graph", "Unlimited star, i hope this wont drive you insane"
- **Logic:**
    - `r = exp(v8 * sin(2*theta * v8 + l1) + l1/3)`
    - `r = exp(tan(theta * v8 + 3*l1))`
    - `r = exp(tan(theta * v8 + l1))`
    - `r = v8^6 * exp(sin(5*theta)/5 + l3/5)`
- **Control:** `v8 = 1` (Slider: `-0.1` to `1`, 20000ms loop)
- **Total Time:** `t8 = 4`

---

## 9. Advanced Masterpieces (9 second to last)
- **Scripts:** "Congratulation you found the math wizard equation", "The graphs getting weirder and weirder", "Arachnophobia warning"
- **Logic:**
    - `r = 5*sin(0.999*theta) - v9 * 2*sin(8.9*theta + 2*pi * v9)`
    - `r = arcsin(tan(1.1*theta + v9)) + sin(theta * v9)`
    - `r = 9*tanh(theta + sin(99*theta * v9))`
    - `r = arcsin(cos(theta + pi/2) - cos(theta * v9)) * 5 * v9`
- **Control:** `v9 = 1` (Slider: `-0.1` to `1`, 26666ms loop)
- **Total Time:** `t9 = 4`

---

## 10. Final Compositions (10 final)
- **Scripts:** "I'll play 2 graphs at once", "Power of the sun in the palm of my hand", "Focus on the center", "truly mesmerizing", "absolute masterpiece", "I am the danger"
- **Logic:**
    - `r = arctan(tan(2*theta + l1/pi)) + v10*l1 + v10`
    - `r = arctan(tan(2*theta + l1)) + v10*l1 + v10`
    - `r = sec(arctan(tan(v10*theta + v10*l1)))`
    - `r = 5*exp(0.2*arcsin(0.5*tan(6*theta + v10*l1))) + 3*v10*l1`
    - `r = 6*sin(1.2*theta + 2*pi * v10) - cos(6*theta)`
    - **Timekeeper Variants:**
        - `r = 5*exp(-|0.1*v10*arcsin(0.1*sec(6*theta - 2*pi*v10*l1))|) - l1`
        - `r = 5*exp(-|0.1*v10*arcsin(0.1*sec(6*theta - 2*pi*v10*l1))|) - v10 * l1`
        - `r = 5*exp(-|v10*arcsin(0.5*sin(6*theta + 2*pi*v10*l1))|) + l1`
        - `r = 5*exp(-|v10*arctan(0.5*tan(6*theta + 2*pi*v10*l1))|) + l1`
    - `r = arctan(sin(1.5*theta * v10) + tan(1.5*theta * v10))`
- **Control:** `v10 = 1` (Slider: `-0.1` to `1`, 8000ms loop)
- **Total Time:** `t10 = 9`

---

## 11. Unused / Bonus
- **Logic:**
    - `l4 = [0, pi/16, ..., 2*pi/3]`
    - `r = 3*sin(theta * v9 + l4)`
    - `r = 3*sin(theta * v9 + l4 + 2*pi/3)`
    - `r = 3*sin(theta * v9 + l4 + 4*pi/3)`
    - `r = csc(sec(sin(4*theta)))`
    - `r = csc(sec(sin(4*theta)) + 0.4)`
    - `r = ceil(6*sin(3*theta + v6) + v6)`
- **System Logic:**
    - Total Video Time: `t = t1+t2+t3+t4+t5+t6+t7+t8+t9+t10` (Approx 41-45 units)
    - Aspect Ratio/Plot: `y = 480/x`

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
