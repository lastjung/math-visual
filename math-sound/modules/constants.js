/**
 * Math Sound Visualizer - Constants
 * 수학 함수 정의 및 카테고리 설정
 */

export const MATH_FUNCTIONS = {
    // ========== 🎵 WAVES (기본 파형 - Cartesian) ==========
    sine: {
        category: 'waves',
        name: 'Sine',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 2 * Math.PI),
        formula: 'f(x) = sin(2πx)',
        latex: 'f(x) = \\sin(2\\pi x)',
        range: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 440,
        baseFreq: 440
    },
    cosine: {
        category: 'waves',
        name: 'Cosine',
        type: 'cartesian',
        fn: (x) => Math.cos(x * 2 * Math.PI),
        formula: 'f(x) = cos(2πx)',
        latex: 'f(x) = \\cos(2\\pi x)',
        range: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 440,
        baseFreq: 440
    },
    square: {
        category: 'waves',
        name: 'Square',
        type: 'cartesian',
        fn: (x) => Math.sign(Math.sin(x * 2 * Math.PI)),
        formula: 'f(x) = sign(sin(2πx))',
        latex: 'f(x) = \\text{sign}(\\sin(2\\pi x))',
        range: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 300,
        baseFreq: 330
    },
    sawtooth: {
        category: 'waves',
        name: 'Sawtooth',
        type: 'cartesian',
        fn: (x) => 2 * (x - Math.floor(x + 0.5)),
        formula: 'f(x) = 2(x - ⌊x + 0.5⌋)',
        latex: 'f(x) = 2(x - \\lfloor x + 0.5 \\rfloor)',
        range: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 350,
        baseFreq: 220
    },
    triangle: {
        category: 'waves',
        name: 'Triangle',
        type: 'cartesian',
        fn: (x) => 2 * Math.abs(2 * (x - Math.floor(x + 0.5))) - 1,
        formula: 'f(x) = 2|2(x - ⌊x+0.5⌋)| - 1',
        latex: 'f(x) = 2|2(x - \\lfloor x + 0.5 \\rfloor)| - 1',
        range: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 380,
        baseFreq: 280
    },
    pulse: {
        category: 'waves',
        name: 'Pulse',
        type: 'cartesian',
        fn: (x) => (x % 1) < 0.3 ? 1 : -1,
        formula: 'f(x) = pulse(x, 30%)',
        latex: 'f(x) = \\text{pulse}(x, 30\\%)',
        range: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 250,
        baseFreq: 260
    },

    // ========== 🌸 CURVES (유명한 곡선 - Parametric/Polar) ==========
    lissajous: {
        category: 'curves',
        name: 'Lissajous',
        type: 'parametric',
        x: (t) => 3 * Math.sin(3 * t),
        y: (t) => 2 * Math.sin(4 * t),
        formula: 'x=3sin(3t), y=2sin(4t)',
        latex: '\\begin{cases} x = 3\\sin(3t) \\\\ y = 2\\sin(4t) \\end{cases}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -4, xMax: 4, yMin: -3, yMax: 3 },
        audioScale: 300,
        baseFreq: 330
    },
    rose: {
        category: 'curves',
        name: 'Rose',
        type: 'polar',
        r: (theta) => Math.cos(4 * theta),
        formula: 'r = cos(4θ)',
        latex: 'r = \\cos(4\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
        audioScale: 400,
        baseFreq: 440
    },
    heart: {
        category: 'curves',
        name: 'Heart',
        type: 'parametric',
        x: (t) => 16 * Math.pow(Math.sin(t), 3),
        y: (t) => 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t),
        formula: 'r⃗(t) = ⟨16sin³t, 13cost - 5cos2t - ...⟩',
        latex: '\\vec{r}(t) = \\langle 16\\sin^3 t, 13\\cos t - 5\\cos 2t - 2\\cos 3t - \\cos 4t \\rangle',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -20, xMax: 20, yMin: -20, yMax: 18 },
        audioScale: 200,
        baseFreq: 220
    },
    cardioid: {
        category: 'curves',
        name: 'Cardioid',
        type: 'polar',
        r: (theta) => 1 - Math.cos(theta),
        formula: 'r = 1 - cos(θ)',
        latex: 'r = 1 - \\cos(\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        audioScale: 280,
        baseFreq: 300
    },
    rose4: {
        category: 'curves',
        name: 'Rose 4',
        type: 'polar',
        r: (theta) => Math.cos(4 * theta),
        formula: 'r = cos(4θ)',
        latex: 'r = \\cos(4\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        audioScale: 320,
        baseFreq: 350
    },
    rose3: {
        category: 'curves',
        name: 'Rose 3',
        type: 'polar',
        r: (theta) => Math.sin(3 * theta),
        formula: 'r = sin(3θ)',
        latex: 'r = \\sin(3\\theta)',
        thetaRange: { min: 0, max: Math.PI },
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        audioScale: 340,
        baseFreq: 380
    },
    lissajous2: { // Key renamed to avoid duplication if needed, keeping consistency with logic
        category: 'curves',
        name: 'Lissajous',
        type: 'parametric',
        x: (t) => Math.sin(3 * t),
        y: (t) => Math.sin(4 * t),
        formula: 'r⃗(t) = ⟨sin(3t), sin(4t)⟩',
        latex: '\\vec{r}(t) = \\langle \\sin(3t), \\sin(4t) \\rangle',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        audioScale: 360,
        baseFreq: 400
    },
    butterfly: {
        category: 'curves',
        name: 'Butterfly',
        type: 'polar',
        r: (theta) => Math.exp(Math.sin(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5),
        formula: 'r = eˢⁱⁿᶿ - 2cos(4θ) + ...',
        latex: 'r = e^{\\sin\\theta} - 2\\cos(4\\theta) + \\sin^5\\left(\\frac{2\\theta-\\pi}{24}\\right)',
        thetaRange: { min: 0, max: 12 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 180,
        baseFreq: 260
    },
    spiral: {
        category: 'curves',
        name: 'Spiral',
        type: 'polar',
        r: (theta) => 0.1 * theta,
        formula: 'r = 0.1θ (Archimedean)',
        latex: 'r = 0.1\\theta',
        thetaRange: { min: 0, max: 6 * Math.PI },
        viewBox: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
        audioScale: 250,
        baseFreq: 350
    },
    lemniscate: {
        category: 'curves',
        name: 'Lemniscate',
        type: 'polar',
        r: (theta) => Math.sqrt(Math.max(0, 2 * Math.cos(2 * theta))),
        formula: 'r² = 2cos(2θ)',
        latex: 'r^2 = 2\\cos(2\\theta)',
        thetaRange: { min: -Math.PI/4, max: Math.PI/4 },
        viewBox: { xMin: -2, xMax: 2, yMin: -1.5, yMax: 1.5 },
        audioScale: 300,
        baseFreq: 320
    },

    // ========== 🔊 SOUND (소리 합성 - Cartesian) ==========
    trumpet: {
        category: 'sound',
        name: 'Trumpet',
        type: 'cartesian',
        fn: (x) => x === 0 ? 1 : Math.sin(x * 20) / (Math.abs(x) + 0.1),
        formula: 'f(x) = sin(20x) / (|x| + 0.1)',
        latex: 'f(x) = \\frac{\\sin(20x)}{|x| + 0.1}',
        range: { xMin: -3, xMax: 3, yMin: -2, yMax: 2 },
        audioScale: 300,
        baseFreq: 280
    },
    fmSynth: {
        category: 'sound',
        name: 'FM Synth',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 6 + Math.sin(x * 18)),
        formula: 'f(x) = sin(6x + sin(18x))',
        latex: 'f(x) = \\sin(6x + \\sin(18x))',
        range: { xMin: -3, xMax: 3, yMin: -1.5, yMax: 1.5 },
        audioScale: 400,
        baseFreq: 440
    },
    amSynth: {
        category: 'sound',
        name: 'AM Synth',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 8) * (1 + 0.5 * Math.sin(x * 2)),
        formula: 'f(x) = sin(8x)·(1 + 0.5sin(2x))',
        latex: 'f(x) = \\sin(8x) \\cdot (1 + 0.5\\sin(2x))',
        range: { xMin: -3, xMax: 3, yMin: -2, yMax: 2 },
        audioScale: 350,
        baseFreq: 380
    },
    harmonics: {
        category: 'sound',
        name: 'Harmonics',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 4) + Math.sin(x * 8) / 2 + Math.sin(x * 12) / 3 + Math.sin(x * 16) / 4,
        formula: 'f(x) = Σ sin(nx)/n',
        latex: 'f(x) = \\sum_{n=1}^{4} \\frac{\\sin(4nx)}{n}',
        range: { xMin: -3, xMax: 3, yMin: -2.5, yMax: 2.5 },
        audioScale: 280,
        baseFreq: 260
    },
    beating: {
        category: 'sound',
        name: 'Beating',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 20) * Math.sin(x),
        formula: 'f(x) = sin(20x)·sin(x)',
        latex: 'f(x) = \\sin(20x) \\cdot \\sin(x)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 320,
        baseFreq: 300
    },
    fmSynth2: { // Renamed key to avoid duplication
        category: 'sound',
        name: 'FM Synth',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 6 + 2 * Math.sin(x * 12)),
        formula: 'f(x) = sin(6x + 2sin(12x))',
        latex: 'f(x) = \\sin(6x + 2\\sin(12x))',
        range: { xMin: -3, xMax: 3, yMin: -2, yMax: 2 },
        audioScale: 400,
        baseFreq: 440
    },
    chirp: {
        category: 'sound',
        name: 'Chirp',
        type: 'cartesian',
        fn: (x) => Math.sin(x * x * 4),
        formula: 'f(x) = sin(4x²)',
        latex: 'f(x) = \\sin(4x^2)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 250,
        baseFreq: 350
    },

    // ========== 📐 MATH (수학적 함수 - Cartesian) ==========
    gaussian: {
        category: 'math',
        name: 'Gaussian',
        type: 'cartesian',
        fn: (x) => Math.exp(-x * x),
        formula: 'f(x) = e^(-x²)',
        latex: 'f(x) = e^{-x^2}',
        range: { xMin: -3, xMax: 3, yMin: -0.5, yMax: 1.5 },
        audioScale: 500,
        baseFreq: 440
    },
    sinc: {
        category: 'math',
        name: 'Sinc',
        type: 'cartesian',
        fn: (x) => x === 0 ? 1 : Math.sin(x * 4 * Math.PI) / (x * 4 * Math.PI),
        formula: 'f(x) = sin(4πx)/(4πx)',
        latex: 'f(x) = \\frac{\\sin(4\\pi x)}{4\\pi x}',
        range: { xMin: -3, xMax: 3, yMin: -0.5, yMax: 1.5 },
        audioScale: 400,
        baseFreq: 380
    },
    damped: {
        category: 'math',
        name: 'Damped',
        type: 'cartesian',
        fn: (x) => Math.exp(-Math.abs(x) * 0.5) * Math.sin(x * 8),
        formula: 'f(x) = e^(-0.5|x|)·sin(8x)',
        latex: 'f(x) = e^{-0.5|x|} \\cdot \\sin(8x)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 350,
        baseFreq: 320
    },
    chaos: {
        category: 'math',
        name: 'Chaos',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 5) * Math.cos(x * 3) + Math.sin(x * 11) * 0.5,
        formula: 'f(x) = sin(5x)cos(3x) + 0.5sin(11x)',
        latex: 'f(x) = \\sin(5x)\\cos(3x) + 0.5\\sin(11x)',
        range: { xMin: -3, xMax: 3, yMin: -2, yMax: 2 },
        audioScale: 180,
        baseFreq: 260
    },
    logistic: {
        category: 'math',
        name: 'Logistic',
        type: 'cartesian',
        fn: (x) => 1 / (1 + Math.exp(-x * 2)),
        formula: 'f(x) = 1/(1 + e^(-2x))',
        latex: 'f(x) = \\frac{1}{1 + e^{-2x}}',
        range: { xMin: -4, xMax: 4, yMin: -0.5, yMax: 1.5 },
        audioScale: 600,
        baseFreq: 500
    },
    epicycloid: {
        category: 'math',
        name: 'Epicycloid',
        type: 'parametric',
        x: (t) => 3 * Math.cos(t) - Math.cos(3 * t),
        y: (t) => 3 * Math.sin(t) - Math.sin(3 * t),
        formula: 'x=3cost-cos3t, y=3sint-sin3t',
        latex: '\\begin{cases} x = 3\\cos t - \\cos 3t \\\\ y = 3\\sin t - \\sin 3t \\end{cases}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 250,
        baseFreq: 300
    },
    hyperbolic: {
        category: 'math',
        name: 'Hyperbolic',
        type: 'parametric',
        x: (t) => Math.cosh(t * 0.5),
        y: (t) => Math.sinh(t * 0.5),
        formula: 'r⃗(t) = ⟨cosh(t/2), sinh(t/2)⟩',
        latex: '\\vec{r}(t) = \\langle \\cosh(t/2), \\sinh(t/2) \\rangle',
        tRange: { min: -4, max: 4 },
        viewBox: { xMin: -1, xMax: 4, yMin: -3, yMax: 3 },
        audioScale: 300,
        baseFreq: 340
    },

    // ========== ⚡ BYTEBEAT (비트 연산 - Cartesian) ==========
    byteClassic: {
        category: 'bytebeat',
        name: 'Classic',
        type: 'cartesian',
        fn: (x) => {
            const t = Math.floor((x + 4) * 1000);
            return ((t & (t >> 8)) % 256) / 128 - 1;
        },
        formula: 'f(t) = t & (t >> 8)',
        latex: 'f(t) = t \\land (t \\gg 8)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 100,
        baseFreq: 200
    },
    byteMelody: {
        category: 'bytebeat',
        name: 'Melody',
        type: 'cartesian',
        fn: (x) => {
            const t = Math.floor((x + 4) * 500);
            return ((t * ((t >> 12 | t >> 8) & 63 & t >> 4)) % 256) / 128 - 1;
        },
        formula: 'f(t) = t·((t>>12|t>>8)&63&t>>4)',
        latex: 'f(t) = t \\cdot ((t \\gg 12 \\lor t \\gg 8) \\land 63 \\land t \\gg 4)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 80,
        baseFreq: 180
    },
    byteXor: {
        category: 'bytebeat',
        name: 'XOR',
        type: 'cartesian',
        fn: (x) => {
            const t = Math.floor((x + 4) * 800);
            return ((t ^ (t >> 4)) % 256) / 128 - 1;
        },
        formula: 'f(t) = t ^ (t >> 4)',
        latex: 'f(t) = t \\oplus (t \\gg 4)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 120,
        baseFreq: 220
    },
    byteComplex: {
        category: 'bytebeat',
        name: 'Complex',
        type: 'cartesian',
        fn: (x) => {
            const t = Math.floor((x + 4) * 600);
            return (((t * 5 & t >> 7) | (t * 3 & t >> 10)) % 256) / 128 - 1;
        },
        formula: 'f(t) = (t*5&t>>7)|(t*3&t>>10)',
        latex: 'f(t) = (t \\cdot 5 \\land t \\gg 7) \\lor (t \\cdot 3 \\land t \\gg 10)',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 90,
        baseFreq: 190
    }
};

export const CATEGORIES = {
    waves: { name: '🎵 Waves', functions: [] },
    curves: { name: '🌸 Curves', functions: [] },
    sound: { name: '🔊 Sound', functions: [] },
    math: { name: '📐 Math', functions: [] },
    bytebeat: { name: '⚡ Byte', functions: [] }
};

// Initialize categories
Object.keys(MATH_FUNCTIONS).forEach(key => {
    const func = MATH_FUNCTIONS[key];
    if (CATEGORIES[func.category]) {
        CATEGORIES[func.category].functions.push(key);
    }
});
