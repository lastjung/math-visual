/**
 * Math Sound - Symphony Scores
 * Amazing Animations Part 3 & More Beautiful Graphs 전용 독립 수식 모듈
 */

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
            // t=1 일 때 인덱스 초과 방지 (Math.min 적용)
            const segmentIdx = Math.min(segments - 1, Math.floor(t * segments));
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / a);
            return isHorizontal ? (subT - 0.5) * 40 : pos; // 길이를 충분히 늘림
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
        viewBox: { xMin: -18, xMax: 18, yMin: -18, yMax: 18 }, // 영역 확장으로 잘림 현상 해결
        audioScale: 100,
        baseFreq: 440
    },
    radialWhirlpool: {
        category: 'amazing',
        name: 'Radial Whirlpool',
        type: 'implicit',
        // 악보에 명시된 원조 음함수 수식 복원
        f: (x, y, a) => y - 4.8 * Math.cos( ((a % 30) + 1) * x * y / (x * x + y * y + 0.1) ),
        formula: 'y = 4.8 · cos(axy / (x²+y²))',
        latex: 'y = 4.8 \\cos\\left(\\frac{axy}{x^2+y^2}\\right)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 160,
        baseFreq: 220
    },

    // ========== 💖 BEAUTIFUL (More Beautiful Graphs) ==========
    signStep: {
        category: 'beautiful',
        name: 'Sign Step',
        type: 'cartesian',
        fn: (x) => Math.sign(x),
        formula: 'y = sign(x)',
        latex: 'y = \\text{sgn}(x)',
        range: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 180,
        baseFreq: 100
    },
    signIntro: {
        category: 'beautiful',
        name: 'The Signum Glitch',
        type: 'cartesian',
        fn: (x) => Math.sign(Math.sin(x)),
        formula: 'y = sign(sin(x))',
        latex: 'y = \\text{sgn}(\\sin(x))',
        range: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 200,
        baseFreq: 110
    },
    signTrace: {
        category: 'beautiful',
        name: 'Sign Trace',
        type: 'parametric',
        x: (t) => t,
        y: (t) => Math.sign(t),
        formula: '(t, sign(t))',
        latex: '(t, \\text{sgn}(t))',
        tRange: { min: -10, max: 10 },
        viewBox: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 180,
        baseFreq: 105
    },
    diagonalReference: {
        category: 'beautiful',
        name: 'Diagonal Reference',
        type: 'parametric',
        x: (t) => t,
        y: (t) => t,
        formula: '(t, t)',
        latex: '(t, t)',
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
            const v13 = (loopIndex % 10) * 0.5;
            const n = 6;
            return Math.sign(Math.cos(n * theta + 3 * v13)) + Math.sin(v13 * theta / 20);
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
            const v9 = (loopIndex % 8) * (Math.PI / 4);
            const tanVal = Math.tan(x + v9) + v9;
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
            // Multiple layers can't be rendered directly as one 'r', so we pick one based on loop
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
        x: (t, loopIndex = 0) => {
            const a = (loopIndex % 15) + 1;
            return Math.cos(t);
        },
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
        audioScale: 60,
        baseFreq: 520
    }
};

function gcd(value) {
    let a = Math.abs(Math.trunc(value));
    let b = 360;

    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }

    return a;
}
