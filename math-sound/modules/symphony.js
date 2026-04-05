/**
 * Math Sound - Symphony Scores
 * Amazing Animations Part 3, More Beautiful Graphs & Harmonic Series
 */

/**
 * GCD 유틸리티 함수 (Fantastic 시리즈 핵심 엔진)
 * Infinity나 NaN에 대비한 안전 로직 포함
 */
export function gcd(a_in, b_in) {
    let a = Math.abs(Math.trunc(a_in));
    let b = b_in !== undefined ? Math.abs(Math.trunc(b_in)) : 0;
    
    // Safety check for Infinity/NaN
    if (!isFinite(a)) a = 0;
    if (!isFinite(b)) b = 0;
    
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

export const SYMPHONY_FUNCTIONS = {
    // ========== ✨ AMAZING (Amazing Animations Part 3) ==========
    resonance1: {
        category: 'amazing',
        name: 'Standard Resonance',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const a = (loopIndex % 30) + 1;
            return Math.cos(a * x);
        },
        formula: 'y = cos(ax)',
        latex: 'y = \\cos(ax)',
        range: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 150,
        baseFreq: 220
    },
    resonance2: {
        category: 'amazing',
        name: 'Expanding Resonance',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const a = (loopIndex % 30) + 1;
            return (x / 5) * Math.cos(a * x);
        },
        formula: 'y = x · cos(ax)',
        latex: 'y = x \\cdot \\cos(ax)',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 5 },
        audioScale: 120,
        baseFreq: 260
    },
    resonance3: {
        category: 'amazing',
        name: 'Envelope Modulation',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const a = (loopIndex % 30) + 1;
            return Math.cos(x) * Math.cos(a * x);
        },
        formula: 'y = cos(x) · cos(ax)',
        latex: 'y = \\cos(x) \\cdot \\cos(ax)',
        range: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 180,
        baseFreq: 330
    },
    gridDistortion: {
        category: 'amazing',
        name: 'Grid Distortion',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const a = (loopIndex % 15) + 1;
            const segments = 20;
            const segmentIdx = Math.min(segments - 1, Math.floor(t * segments));
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / a);
            return isHorizontal ? (subT - 0.5) * 40 : pos;
        },
        y: (t, loopIndex = 0) => {
            const a = (loopIndex % 15) + 1;
            const segments = 20;
            const segmentIdx = Math.min(segments - 1, Math.floor(t * segments));
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / a);
            return isHorizontal ? pos : (subT - 0.5) * 40;
        },
        formula: 'cos(ax) = sin(ay)',
        latex: '\\cos(ax) = \\sin(ay)',
        tRange: { min: 0, max: 1 },
        viewBox: { xMin: -18, xMax: 18, yMin: -18, yMax: 18 },
        audioScale: 100,
        baseFreq: 440
    },
    radialWhirlpool: {
        category: 'amazing',
        name: 'Radial Whirlpool',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const a = (loopIndex % 20) + 5;
            return y - 4.8 * Math.cos( a * x * y / (x * x + y * y + 0.1) );
        },
        formula: 'y = 4.8 · cos(axy / (x²+y²))',
        latex: 'y = 4.8 \\cos\\left(\\frac{axy}{x^2+y^2}\\right)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 160,
        baseFreq: 220
    },

    // ========== 💖 BEAUTIFUL (More Beautiful Graphs) ==========
    signIntro: {
        category: 'beautiful',
        name: 'The Signum Glitch',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const a = (loopIndex % 10) + 1;
            return Math.sign(Math.sin(a * x / 4));
        },
        formula: 'y = sign(sin(ax/4))',
        latex: 'y = \\text{sgn}(\\sin(\\frac{ax}{4}))',
        range: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 200,
        baseFreq: 110
    },
    signTrace: {
        category: 'beautiful',
        name: 'Dancing Sign Trace',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const a = (loopIndex % 12) * 0.5 + 1;
            return t * Math.cos(a * 0.1);
        },
        y: (t, loopIndex = 0) => {
            const a = (loopIndex % 10) + 1;
            return Math.sign(Math.sin(a * t));
        },
        formula: '(t·cos(0.1a), sign(sin at))',
        latex: '(t \\cos(0.1a), \\text{sgn}(\\sin at))',
        tRange: { min: -10, max: 10 },
        viewBox: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 180,
        baseFreq: 105
    },
    diagonalReference: {
        category: 'beautiful',
        name: 'Oscillating Diagonal',
        type: 'parametric',
        x: (t) => t,
        y: (t, loopIndex = 0) => {
            const a = (loopIndex % 15) * 0.2;
            return t + Math.sin(a * t);
        },
        formula: '(t, t + sin(at))',
        latex: '(t, t + \\sin(at))',
        tRange: { min: -10, max: 10 },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 110,
        baseFreq: 120
    },
    spinnyRose: {
        category: 'beautiful',
        name: 'Mind Blowing Spinny',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 10) * 0.5;
            const n = 6;
            return Math.sign(Math.cos(n * theta + 3 * v)) + Math.sin(v * theta / 20);
        },
        formula: 'r = sign(cos(nθ + 3v)) + sin(vθ/20)',
        latex: 'r = \\text{sgn}(\\cos(n\\theta + 3v)) + \\sin(v\\theta/20)',
        thetaRange: { min: 0, max: 20 * Math.PI },
        viewBox: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
        audioScale: 180,
        baseFreq: 220
    },
    punkHair: {
        category: 'beautiful',
        name: 'Punk Hair Laser',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const v = (loopIndex % 8) * (Math.PI / 4);
            const tanVal = Math.tan(x + v) + v;
            const cscVal = 1 / Math.sin(tanVal);
            return x * Math.sign(cscVal) + Math.cos(x);
        },
        formula: 'y = x·sign(csc(tan(x+v)+v)) + cos(x)',
        latex: 'y = x \\cdot \\text{sgn}(\\csc(\\tan(x+v)+v)) + \\cos(x)',
        range: { xMin: -10, xMax: 10, yMin: -12, yMax: 12 },
        audioScale: 100,
        baseFreq: 180
    },
    upAndDown: {
        category: 'beautiful',
        name: 'Up and Down',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v6 = -8 + ((loopIndex % 16) / 15) * 16;
            return y - (v6 * Math.sign(v6 * x - y) + Math.cos(v6 + x));
        },
        formula: 'y = v6·sign(v6x - y) + cos(v6 + x)',
        latex: 'y = v_6 \\cdot \\text{sgn}(v_6x - y) + \\cos(v_6 + x)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 160,
        baseFreq: 150
    },
    jaggedSineGcd: {
        category: 'beautiful',
        name: 'Jagged Sine GCD',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const v11 = (loopIndex % 10) + 1;
            return gcd(Math.round(v11 * x)) * Math.sign(Math.sin(x)) - Math.sin(x);
        },
        formula: 'y = gcd(v11x)·sign(sin(x)) - sin(x)',
        latex: 'y = \\gcd(v_{11}x) \\cdot \\text{sgn}(\\sin(x)) - \\sin(x)',
        range: { xMin: -10, xMax: 10, yMin: -12, yMax: 12 },
        audioScale: 90,
        baseFreq: 140
    },
    moduloJaggedWave: {
        category: 'beautiful',
        name: 'Modulo Jagged Wave',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const v12 = 0.19 + (loopIndex % 12) * 0.18;
            const mod = ((8 * x) % v12 + v12) % v12;
            return 2 * Math.sign(Math.sin(x - v12)) + mod - Math.sin(x + v12);
        },
        formula: 'y = 2·sign(sin(x-v12)) + mod(8x, v12) - sin(x+v12)',
        latex: 'y = 2 \\cdot \\text{sgn}(\\sin(x-v_{12})) + \\bmod(8x, v_{12}) - \\sin(x+v_{12})',
        range: { xMin: -10, xMax: 10, yMin: -4, yMax: 4 },
        audioScale: 170,
        baseFreq: 165
    },
    shurikenStar: {
        category: 'beautiful',
        name: 'Shuriken Star',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v14 = (loopIndex % 6) * 1.5;
            const k = 5;
            return Math.sign(Math.cos(k * theta - v14)) + Math.sin(v14 + (k + 0.05) * theta) * Math.cos(v14);
        },
        formula: 'r = sign(cos(kθ - v14)) + sin(v14 + k.05θ)cos(v14)',
        latex: 'r = \\text{sgn}(\\cos(k\\theta - v_{14})) + \\sin(v_{14} + k.05\\theta)\\cos(v_{14})',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        audioScale: 160,
        baseFreq: 260
    },
    layeredBeauty: {
        category: 'beautiful',
        name: 'Layered Beauty',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v15 = (loopIndex % 10) * 0.6;
            const l1 = [2, 4, 6, 8, 10];
            const layer = l1[loopIndex % l1.length];
            return layer * Math.sign(Math.cos(3 * theta - layer * v15)) + Math.sin(v15 + 3 * theta + layer) - Math.cos(v15);
        },
        formula: 'r = l·sign(cos(3θ-lv)) + sin(v+3θ+l) - cos(v)',
        latex: 'r = l \\cdot \\text{sgn}(\\cos(3\\theta - lv)) + \\sin(v + 3\\theta + l) - \\cos(v)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -15, xMax: 15, yMin: -15, yMax: 15 },
        audioScale: 120,
        baseFreq: 200
    },

    // ========== 🎼 HARMONIC (Parametric Focused) ==========
    lissajousIntro: {
        category: 'harmonic',
        name: 'Harmonic Intro',
        type: 'parametric',
        x: (t, loopIndex = 0) => Math.cos(t),
        y: (t, loopIndex = 0) => {
            const a = (loopIndex % 15) + 1;
            return Math.sin(a * t / 2);
        },
        formula: '(cos t, sin(at/2))',
        latex: '(\\cos t, \\sin(at/2))',
        tRange: { min: 0, max: 4 * Math.PI },
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        audioScale: 150,
        baseFreq: 220
    },
    highFreqOscillator: {
        category: 'harmonic',
        name: 'High-Freq Web',
        type: 'parametric',
        x: (t, loopIndex = 0) => Math.cos(t),
        y: (t, loopIndex = 0) => {
            const a = 50 + (loopIndex % 10) * 10;
            return Math.sin(a * t);
        },
        formula: '(cos t, sin(at))',
        latex: '(\\cos t, \\sin(at))',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -1.2, xMax: 1.2, yMin: -1.2, yMax: 1.2 },
        audioScale: 100,
        baseFreq: 440
    },
    ovalFoundation: {
        category: 'harmonic',
        name: 'Harmonic Ovals',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const v = 0.95 + (loopIndex % 10) * 0.01;
            return Math.sin(v * t) + Math.cos(t);
        },
        y: (t) => Math.cos(t),
        formula: '(sin(vt) + cos t, cos t)',
        latex: '(\\sin(vt) + \\cos t, \\cos t)',
        tRange: { min: 0, max: 20 * Math.PI },
        viewBox: { xMin: -2.2, xMax: 2.2, yMin: -1.2, yMax: 1.2 },
        audioScale: 120,
        baseFreq: 180
    },
    tangentMesh: {
        category: 'harmonic',
        name: 'Tangent Mesh',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const a = 15 + (loopIndex % 10);
            return Math.tan(a * t);
        },
        y: (t, loopIndex = 0) => {
            const b = 30 + (loopIndex % 15);
            const sec = 1 / Math.cos(t);
            return sec + Math.sin(b * t);
        },
        formula: 'x=tan(at), y=sec t + sin(bt)',
        latex: 'x=\\tan(at), y=\\sec t + \\sin(bt)',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 80,
        baseFreq: 330
    },
    asymptoticCrown: {
        category: 'harmonic',
        name: 'The Crown',
        type: 'parametric',
        x: (t) => Math.tan(t),
        y: (t, loopIndex = 0) => {
            const v = 0.9 + (loopIndex % 20) * 0.01;
            const csc = 1 / Math.sin(t);
            return csc * Math.tan(v * t) - Math.sin(t);
        },
        formula: 'x=tan t, y=csc t·tan(vt) - sin t',
        latex: 'x=\\tan t, y=\\csc t \\cdot \\tan(vt) - \\sin t',
        tRange: { min: 0, max: 50 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 70,
        baseFreq: 440
    },
    extremeHarmonic: {
        category: 'harmonic',
        name: 'Extreme harmonic',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const a = 20 + (loopIndex % 10) * 5;
            return Math.tan(a * t) + Math.cos(t);
        },
        y: (t, loopIndex = 0) => {
            const b = 40 + (loopIndex % 10) * 5;
            return Math.tan(t) * Math.sin(b * t);
        },
        formula: 'x=tan(at)+cos t, y=tan t·sin(bt)',
        latex: 'x=\\tan(at)+\\cos t, y=\\tan t \\cdot \\sin(bt)',
        tRange: { min: 0, max: 4 * Math.PI },
        viewBox: { xMin: -15, xMax: 15, yMin: -15, yMax: 15 },
    },
    // ========== 🌀 FUSION (Parametric, Implicit, Polar Mixed) ==========
    cinematicGalaxy: {
        category: 'fusion',
        name: 'Cinematic Galaxy',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const vs = (loopIndex % 20) * 0.314; // vs = 0 to 2pi
            return Math.abs(1 / Math.cos(1.2 * theta + vs)) + Math.sin(3 * vs + Math.cos(1.2 * theta + Math.sin(1.2 * theta)));
        },
        formula: 'r = sec(1.2θ+v) + sin(3v + cos(1.2θ+sin 1.2θ))',
        latex: 'r = \\sec(1.2\\theta + v) + \\sin(3v + \\cos(1.2\\theta + \\sin(1.2\\theta)))',
        thetaRange: { min: 0, max: 20 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 140,
        baseFreq: 180
    },
    tanTwistMesh: {
        category: 'fusion',
        name: 'Tan Twist Mesh',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const v = (loopIndex % 12) * 0.52;
            return Math.tan(2 * t + v) + Math.cos(4 * t);
        },
        y: (t, loopIndex = 0) => {
            const v = (loopIndex % 12) * 0.52;
            return Math.sin(3 * t) + Math.cos(5 * t);
        },
        formula: '(tan(2t+v)+cos 4t, sin 3t+cos 5t)',
        latex: '(\\tan(2t+v)+\\cos 4t, \\sin 3t + \\cos 5t)',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -5, yMax: 5 },
        audioScale: 90,
        baseFreq: 240
    },
    secantOscillator: {
        category: 'fusion',
        name: 'Secant Oscillator',
        type: 'parametric',
        x: (t) => 1 / Math.cos(t), // sec(t)
        y: (t, loopIndex = 0) => {
            const v = (loopIndex % 10) * 0.628;
            return Math.sin(4 * t + Math.cos(2 * t) + Math.sin(3 * t) + v);
        },
        formula: '(sec t, sin(4t+cos 2t+sin 3t+v))',
        latex: '(\\sec t, \\sin(4t+\\cos 2t+\\sin 3t+v))',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -2, yMax: 2 },
        audioScale: 110,
        baseFreq: 300
    },
    tanRiseRidge: {
        category: 'fusion',
        name: 'Tan Rise Ridge',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = (loopIndex % 15) * 0.418;
            return y - (Math.tan(x + v) - Math.sin(10 * x + Math.cos(x)));
        },
        formula: 'y = tan(x+v) - sin(10x+cos x)',
        latex: 'y = \\tan(x+v) - \\sin(10x+\\cos x)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 130,
        baseFreq: 150
    },
    geometricShift: {
        category: 'fusion',
        name: 'Geometric Shift',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = -2.5 + (loopIndex % 20) * 0.25; // v = -2.5 to 2.5
            return Math.sin(x) - (v * Math.cos(y) + Math.sin(2 * x + v));
        },
        formula: 'sin x = v·cos y + sin(2x+v)',
        latex: '\\sin x = v \\cos y + \\sin(2x+v)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 120,
        baseFreq: 196
    },
    pulsatingPetal: {
        category: 'fusion',
        name: 'Pulsating Petal',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = -1.5 + (loopIndex % 15) * 0.2; // v = -1.5 to 1.5
            return Math.sin(v + 4 * theta) + v;
        },
        formula: 'r = sin(v + 4θ) + v',
        latex: 'r = \\sin(v + 4\\theta) + v',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
        audioScale: 170,
        baseFreq: 220
    },
    starCore: {
        category: 'fusion',
        name: 'Star Core',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            return (6 * Math.sin(1.2 * theta) - Math.cos(6 * theta + v)) / 2;
        },
        formula: '2r = 6sin(1.2θ) - cos(6θ+v)',
        latex: '2r = 6\\sin(1.2\\theta) - \\cos(6\\theta + v)',
        thetaRange: { min: 0, max: 10 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 150,
        baseFreq: 330
    },
    // ========== 🌀 HYPER (Amazing 2025 Edition) ==========
    millennialRose: {
        category: 'hyper',
        name: 'Millennial Rose',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 30) * 0.1;
            return Math.sin(2025 * theta / (100 - v));
        },
        formula: 'r = sin(2025θ / (100-v))',
        latex: 'r = \\sin\\left(\\frac{2025\\theta}{100-v}\\right)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -1.2, xMax: 1.2, yMin: -1.2, yMax: 1.2 },
        audioScale: 180,
        baseFreq: 440
    },
    hyperLissajous: {
        category: 'hyper',
        name: 'Hyper Lissajous',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            return 4 * Math.cos(Math.sin(20 * t + v) + v);
        },
        y: (t, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            return Math.sin(25 * t + v);
        },
        formula: '(4cos(sin(20t+v)+v), sin(25t+v))',
        latex: '(4\\cos(\\sin(20t+v)+v), \\sin(25t+v))',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -2, yMax: 2 },
        audioScale: 100,
        baseFreq: 260
    },
    amazingClover: {
        category: 'hyper',
        name: 'Amazing Clover',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            return Math.sin(2.025 * theta + v) + Math.cos(1.05 * theta);
        },
        formula: 'r = sin(2.025θ+v) + cos(1.05θ)',
        latex: 'r = \\sin(2.025\\theta + v) + \\cos(1.05\\theta)',
        thetaRange: { min: 0, max: 40 * Math.PI },
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        audioScale: 140,
        baseFreq: 220
    },
    realityBender: {
        category: 'hyper',
        name: 'Reality Bender',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const v = (loopIndex % 15) * 0.1;
            return (gcd(Math.round(2025 * x)) % 5) + v * Math.sin(x) + Math.ceil(v * x) / 5;
        },
        formula: 'y = mod(gcd(2025x), 5) + v·sin x + ceil(vx)/5',
        latex: 'y = \\gcd(2025x) \\pmod 5 + v \\sin(x) + \\frac{\\lceil vx \\rceil}{5}',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 80,
        baseFreq: 110
    },
    deadpoolGeometry: {
        category: 'hyper',
        name: 'Deadpool Geometry',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            const l = 2.025;
            // 음수 반지름을 절대값으로 처리하여 대칭 구조를 완성 (끊김 방지)
            const rVal = Math.sin(theta + l - v) - Math.ceil(2 * Math.sin(2 * theta + v + 1.55));
            return Math.abs(rVal);
        },
        formula: 'r = |sin(θ+l-v) - ceil(2sin(2θ+v+1.55))|',
        latex: 'r = |\\sin(\\theta + l - v) - \\lceil 2\\sin(2\\theta + v + 1.55) \\rceil|',
        thetaRange: { min: 0, max: 2 * Math.PI }, // 2pi면 충분하지만 표현력 위해 유지
        viewBox: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
        audioScale: 120,
        baseFreq: 165
    },
    // ========== 👹 INSANE (Polar Graph - Insane) ==========
    trigTomfoolery: {
        category: 'insane',
        name: 'Trig Tomfoolery',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = ((loopIndex % 19) + 1) * 0.314;
            return Math.sin(2 * theta + Math.sin(4 * theta * v));
        },
        formula: 'r = sin(2θ + sin(4θv))',
        latex: 'r = \\sin(2\\theta + \\sin(4\\theta v))',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -1.2, xMax: 1.2, yMin: -1.2, yMax: 1.2 },
        audioScale: 180,
        baseFreq: 330
    },
    secantPlotTwist: {
        category: 'insane',
        name: 'Secant Plot Twist',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            return 1 / Math.cos(3 * theta + 2 * Math.PI * v * Math.sin(theta));
        },
        formula: 'r = sec(3θ + 2πv·sin θ)',
        latex: 'r = \\sec(3\\theta + 2\\pi v \\sin\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 100,
        baseFreq: 220
    },
    inverseFractal: {
        category: 'insane',
        name: 'Inverse Fractal',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 15) * 0.418;
            return v * Math.asin(Math.sin(0.8 * theta * v));
        },
        formula: 'r = v·arcsin(sin(0.8θv))',
        latex: 'r = v \\arcsin(\\sin(0.8\\theta v))',
        thetaRange: { min: 0, max: 40 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 150,
        baseFreq: 110
    },
    unlimitedStar: {
        category: 'insane',
        name: 'Unlimited Star',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 10) * 0.628;
            return Math.exp(Math.sin(2 * theta * v + 2) + 1.5);
        },
        formula: 'r = exp(sin(2θv + 2) + 1.5)',
        latex: 'r = e^{\\sin(2\\theta v + 2) + 1.5}',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -15, xMax: 15, yMin: -15, yMax: 15 },
        audioScale: 80,
        baseFreq: 150
    },
    arachnidWeb: {
        category: 'insane',
        name: 'Arachnid Web',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            return 9 * Math.tanh(theta / 10 + Math.sin(99 * theta * v));
        },
        formula: 'r = 9·tanh(θ/10 + sin(99θv))',
        latex: 'r = 9\\tanh(\\theta/10 + \\sin(99\\theta v))',
        thetaRange: { min: 0, max: 20 * Math.PI },
        viewBox: { xMin: -12, xMax: 12, yMin: -12, yMax: 12 },
        audioScale: 120,
        baseFreq: 440
    },
    powerOfTheSun: {
        category: 'insane',
        name: 'Power of the Sun',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            const core = Math.atan(0.5 * Math.tan(6 * theta + 2 * Math.PI * v)) + 2;
            return 5 * Math.exp(-Math.abs(v * core)) + 2;
        },
        formula: 'r = 5·exp(-|v·arctan(0.5tan(6θ+2πv))|) + 2',
        latex: 'r = 5e^{-|v \\arctan(0.5\\tan(6\\theta + 2\\pi v))|} + 2',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        audioScale: 110,
        baseFreq: 520
    },
    theMasterpiece: {
        category: 'insane',
        name: 'The Masterpiece',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const v = (loopIndex % 30) * 0.209;
            return 6 * Math.sin(1.2 * theta + 2 * Math.PI * v) - Math.cos(6 * theta);
        },
        formula: 'r = 6sin(1.2θ+2πv) - cos 6θ',
        latex: 'r = 6\\sin(1.2\\theta + 2\\pi v) - \\cos 6\\theta',
        thetaRange: { min: 0, max: 10 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 140,
        baseFreq: 220
    },
    // ========== ✨ FANTASTIC (GCD Edition) ==========
    relativePrimality: {
        category: 'fantastic',
        name: 'Relative Primality',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = (loopIndex % 10) + 2;
            return gcd(Math.round(x * v), Math.round(y * v)) === 1;
        },
        formula: 'gcd(vx, vy) = 1',
        latex: '\\gcd(vx, vy) = 1',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 80,
        baseFreq: 220
    },
    cellularTrig: {
        category: 'fantastic',
        name: 'Cellular Trigonometry',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = (loopIndex % 15) * 0.1;
            return gcd(Math.round(Math.tan(y) * 10), Math.round(Math.sin(x) * 10 * v)) === 1;
        },
        formula: 'gcd(10tan y, 10v·sin x) = 1',
        latex: '\\gcd(10\\tan y, 10v\\sin x) = 1',
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 100,
        baseFreq: 330
    },
    interferenceMesh: {
        category: 'fantastic',
        name: 'Interference Mesh',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.1;
            const denom = Math.sin(y) + Math.sin(x) + 0.1;
            return gcd(Math.round(x / denom * 5), Math.round(y * v * 5)) === 1;
        },
        formula: 'gcd(5x/(sin y+sin x), 5yv) = 1',
        latex: '\\gcd\\left(\\frac{5x}{\\sin y + \\sin x}, 5yv\\right) = 1',
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        audioScale: 120,
        baseFreq: 440
    },
    fantasticGrid: {
        category: 'fantastic',
        name: 'Fantastic Grid',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = (loopIndex % 15) * 0.5;
            const left = 1 / Math.cos(x) + Math.tan(y);
            return gcd(Math.round(left * 5), Math.round(Math.sin(9 * x + v) * 5)) === 1;
        },
        formula: 'gcd(5(sec x+tan y), 5sin(9x+v)) = 1',
        latex: '\\gcd(5(\\sec x + \\tan y), 5\\sin(9x + v)) = 1',
        viewBox: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
        audioScale: 90,
        baseFreq: 520
    },
    ultimateGcd: {
        category: 'fantastic',
        name: 'Ultimate GCD',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const v = (loopIndex % 20) * 0.314;
            const left = 1 / Math.sin(x) + Math.tan(y) / Math.sin(2 * x + v);
            const right = Math.sin(x) * y + Math.cos(y) * Math.tan(x);
            return gcd(Math.round(left * 3), Math.round(right * 3)) === 1;
        },
        formula: 'gcd(3(csc x + tan y/sin(2x+v)), 3(sin x·y + cos y·tan x)) = 1',
        latex: '\\gcd(3(\\csc x + \\frac{\\tan y}{\\sin(2x+v)}), 3(\\sin x \\cdot y + \\cos y \\cdot \\tan x)) = 1',
        viewBox: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
        audioScale: 110,
        baseFreq: 660
    },
    
    // ========== 🌟 INCREDIBLE (High-Duration Dynamics) ==========
    dynamicInterference: {
        category: 'incredible',
        name: 'Dynamic Interference',
        type: 'cartesian',
        fn: (x, loopIndex = 0) => {
            const k3 = (loopIndex % 80) * 0.1;
            return Math.tan(Math.sin(2 * x) * Math.cos(k3 * x)) + Math.sin(k3 * x);
        },
        formula: 'y = tan(sin(2x)cos(kx)) + sin(kx)',
        latex: 'y = \\tan(\\sin(2x)\\cos(kx)) + \\sin(kx)',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 5 },
        audioScale: 100,
        baseFreq: 220
    },
    surfaceRippleField: {
        category: 'incredible',
        name: 'Surface Ripple Field',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const k7 = (loopIndex % 40) * 0.5;
            return Math.abs(y - 5 * Math.sin(x - Math.PI) * Math.cos(k7 * y)) < 0.6;
        },
        formula: 'y = 5sin(x-π)cos(ky)',
        latex: 'y = 5\\sin(x-\\pi)\\cos(ky)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 120,
        baseFreq: 240
    },
    globalImplicitGate: {
        category: 'incredible',
        name: 'Global Implicit Gate',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const k9 = (loopIndex % 20) * 3.0 + 1; // 1 to 61
            return Math.abs((k9 * Math.sin(Math.cos(y) + Math.sin(x))) - (Math.cos(x) + Math.sin(y))) < 0.8;
        },
        formula: 'ksin(cos y + sin x) = cos x + sin y',
        latex: 'k\\sin(\\cos y + \\sin x) = \\cos x + \\sin y',
        viewBox: { xMin: -15, xMax: 15, yMin: -15, yMax: 15 },
        audioScale: 150,
        baseFreq: 330
    },
    concentricModulation: {
        category: 'incredible',
        name: 'Concentric Modulation',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const k17 = (loopIndex % 40) * 1.0;
            return Math.abs(Math.sin(k17 * x) - Math.sin(x * x + y * y)) < 0.5;
        },
        formula: 'sin(kx) = sin(x² + y²)',
        latex: '\\sin(kx) = \\sin(x^2 + y^2)',
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        audioScale: 130,
        baseFreq: 260
    },
    chaosStarGrid: {
        category: 'incredible',
        name: 'Chaos Star Grid',
        type: 'implicit',
        f: (x, y, loopIndex = 0) => {
            const k18 = (loopIndex % 40) * 0.5;
            return Math.abs(Math.sin(x * x + y * y) - (k18 * Math.cos(x * y))) < 0.5;
        },
        formula: 'sin(x² + y²) = k·cos(xy)',
        latex: '\\sin(x^2 + y^2) = k\\cos(xy)',
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        audioScale: 140,
        baseFreq: 440
    },

    // ========== 🤯 INCOMPREHENSIBLE (Extreme Density) ==========
    saturnOrbit: {
        category: 'incomprehensible',
        name: 'Saturn Orbit',
        type: 'parametric',
        x: (t) => Math.sin(t),
        y: (t, loopIndex = 0) => {
            const v1 = (loopIndex % 20) * 0.314;
            return 2 * Math.sin(t + 2 * v1) + Math.cos(t);
        },
        formula: '(sin t, 2sin(t+2v) + cos t)',
        latex: '(\\sin t, 2\\sin(t+2v) + \\cos t)',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -2, xMax: 2, yMin: -4, yMax: 4 },
        audioScale: 110,
        baseFreq: 180
    },
    waveTangentTwist: {
        category: 'incomprehensible',
        name: 'Wave Tangent Twist',
        type: 'parametric',
        x: (t) => Math.sin(t) + Math.cos(t),
        y: (t, loopIndex = 0) => {
            const v3 = ((loopIndex % 19) + 1) * 0.172;
            const v6 = ((loopIndex % 19) + 1) * 0.314;
            return Math.tan(v3 * t / 2) * Math.cos(3 * v3 * t) + Math.sin(v3 * t + v6);
        },
        formula: '(sin t+cos t, tan(vt/2)cos(3vt)+sin(vt+v6))',
        latex: '(\\sin t+\\cos t, \\tan(vt/2)\\cos(3vt)+\\sin(vt+v_6))',
        tRange: { min: 0, max: 4 * Math.PI },
        viewBox: { xMin: -3, xMax: 3, yMin: -10, yMax: 10 },
        audioScale: 90,
        baseFreq: 330
    },
    rotatingOvals: {
        category: 'incomprehensible',
        name: 'Rotating Ovals',
        type: 'parametric',
        x: (t) => Math.sin(0.98 * t) + Math.cos(t),
        y: (t, loopIndex = 0) => {
            const v5 = (loopIndex % 20) * 0.75;
            return Math.cos(10 * v5 + t);
        },
        formula: '(sin(0.98t)+cos t, cos(10v+t))',
        latex: '(\\sin(0.98t)+\\cos t, \\cos(10v+t))',
        tRange: { min: 0, max: 60 * Math.PI },
        viewBox: { xMin: -3, xMax: 3, yMin: -2, yMax: 2 },
        audioScale: 130,
        baseFreq: 220
    },
    higherDimensionEight: {
        category: 'incomprehensible',
        name: 'Higher Dimension 8',
        type: 'parametric',
        x: (t) => Math.tan(20.5 * t),
        y: (t, loopIndex = 0) => {
            const v7 = (loopIndex % 10) * 0.2;
            return (1 / Math.cos(t)) + Math.sin(41 * t) * Math.tan(v7 * t / 2);
        },
        formula: '(tan(20.5t), sec t + sin(41t)tan(vt/2))',
        latex: '(\\tan(20.5t), \\sec t + \\sin(41t)\\tan(vt/2))',
        tRange: { min: 0, max: 4 * Math.PI },
        viewBox: { xMin: -15, xMax: 15, yMin: -15, yMax: 15 },
        audioScale: 80,
        baseFreq: 440
    },
    finalChapterDense: {
        category: 'incomprehensible',
        name: 'Final Chapter Dense',
        type: 'parametric',
        x: (t, loopIndex = 0) => {
            const v10 = (loopIndex % 30) * 0.1;
            return Math.tan(50 * t + v10 * Math.PI) / 4 + Math.sin(t + v10 * Math.PI);
        },
        y: (t, loopIndex = 0) => {
            const v10 = (loopIndex % 30) * 0.1;
            return (1 / Math.sin(t)) + Math.sin(100 * t) * Math.cos(1.2 * t + v10 * Math.PI);
        },
        formula: '(tan(50t+vπ)/4+sin(t+vπ), csc t+sin(100t)cos(1.2t+vπ))',
        latex: '(\\frac{\\tan(50t+v\\pi)}{4}+\\sin(t+v\\pi), \\csc t+\\sin(100t)\\cos(1.2t+v\\pi))',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 70,
        baseFreq: 520
    }
};
