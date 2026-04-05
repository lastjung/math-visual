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
            const segmentIdx = Math.floor(t * segments);
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / a);
            return isHorizontal ? (subT - 0.5) * 20 : pos;
        },
        y: (t, loopIndex = 0) => {
            const a = (loopIndex % 15) + 1;
            const segments = 20;
            const segmentIdx = Math.floor(t * segments);
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / a);
            return isHorizontal ? pos : (subT - 0.5) * 20;
        },
        formula: 'cos(ax) = sin(ay)',
        latex: '\\cos(ax) = \\sin(ay)',
        tRange: { min: 0, max: 1 },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 100,
        baseFreq: 440
    },
    radialWhirlpool: {
        category: 'amazing',
        name: 'Radial Whirlpool',
        type: 'polar',
        r: (theta, loopIndex = 0) => {
            const a = (loopIndex % 10) + 1;
            return 4.8 * Math.cos(a * theta);
        },
        formula: 'y = 4.8 · cos(axy / (x²+y²))',
        latex: 'y = 4.8 \\cos\\left(\\frac{axy}{x^2+y^2}\\right)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
        audioScale: 140,
        baseFreq: 200
    },

    // ========== 💖 BEAUTIFUL (More Beautiful Graphs) ==========
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
    }
};
