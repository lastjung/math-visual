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
        name: 'Rose 3 (n=3)',
        type: 'polar',
        r: (theta) => Math.sin(3 * theta),
        formula: 'r = sin(3θ)',
        latex: 'r = \\sin(3\\theta)',
        thetaRange: { min: 0, max: Math.PI },
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        audioScale: 340,
        baseFreq: 380
    },
    rose32: {
        category: 'art',
        name: 'Sunflower',
        type: 'polar',
        r: (theta) => -8 * Math.sin(32 * theta),
        formula: 'r = -8sin(32θ)',
        latex: 'r = -8\\sin(32\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 350,
        baseFreq: 440
    },
    limacon3: {
        category: 'art',
        name: 'Limaçon (n=3)',
        type: 'polar',
        r: (theta) => 5 - 9 * Math.cos(3 * theta),
        formula: 'r = 5 - 9cos(3θ)',
        latex: 'r = 5 - 9\\cos(3\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -15, xMax: 15, yMin: -13, yMax: 13 },
        audioScale: 280,
        baseFreq: 330
    },
    limaconLoop: {
        category: 'curves',
        name: 'Limaçon Loop',
        type: 'polar',
        r: (theta) => 5 - 9 * Math.cos(theta),
        formula: 'r = 5 - 9cos(θ)',
        latex: 'r = 5 - 9\\cos(\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -16, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 300,
        baseFreq: 300
    },
    micPattern: {
        category: 'curves',
        name: 'Mic Pattern',
        type: 'polar',
        r: (theta) => 1 - Math.cos(theta) * Math.sin(3 * theta),
        formula: 'r = 1 - cosθ sin3θ',
        latex: 'r = 1 - \\cos\\theta \\sin(3\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        audioScale: 320,
        baseFreq: 360
    },
    lemniscate: {
        category: 'curves',
        name: 'Lemniscate (Infinity)',
        type: 'polar',
        r: (theta) => {
            const cos2t = Math.cos(2 * theta);
            return cos2t < 0 ? 0 : Math.sqrt(cos2t);
        },
        formula: 'r² = cos(2θ)',
        latex: 'r^2 = \\cos(2\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1, yMax: 1 },
        audioScale: 300,
        baseFreq: 320
    },
    star: {
        category: 'art',
        name: 'Star Curve',
        type: 'polar',
        r: (theta) => Math.sin(2 * theta) - 6 * Math.pow(Math.cos(6 * theta), 3),
        formula: 'r = sin2θ - 6(cos(6θ))³',
        latex: 'r = \\sin(2\\theta) - 6(\\cos(6\\theta))^3',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        audioScale: 150,
        baseFreq: 220
    },
    explosion: {
        category: 'art',
        name: 'Explosion',
        type: 'polar',
        r: (theta) => 3 * Math.pow(Math.cos(14 * theta), 3),
        formula: 'r = 3(cos(14θ))³',
        latex: 'r = 3(\\cos(14\\theta))^3',
        thetaRange: { min: 0, max: Math.PI },
        viewBox: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
        audioScale: 200,
        baseFreq: 440
    },
    fairy: {
        category: 'art',
        name: 'Fairy',
        type: 'polar',
        r: (theta) => {
            if (Math.abs(theta) < 0.001) return 2;
            return (Math.sin(2 * theta) * Math.cos(2 * theta)) / theta;
        },
        formula: 'r = (sin2θ)(cos2θ) / θ',
        latex: 'r = \\frac{\\sin(2\\theta)\\cos(2\\theta)}{\\theta}',
        thetaRange: { min: 0, max: 6 * Math.PI },
        viewBox: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
        audioScale: 300,
        baseFreq: 330
    },
    trigChaos: {
        category: 'art',
        name: 'Trig Chaos',
        type: 'polar',
        r: (theta) => -4 * Math.sin(Math.cos(Math.tan(theta))),
        formula: 'r = -4sin(cos(tanθ))',
        latex: 'r = -4\\sin(\\cos(\\tan\\theta))',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 250,
        baseFreq: 380
    },
    splitPulse: {
        category: 'art',
        name: 'Split Pulse',
        type: 'polar',
        r: (theta) => {
            const denom = 2 * Math.cos(theta);
            if (Math.abs(denom) < 0.01) return 0;
            return -Math.sin(10 * theta) / denom;
        },
        formula: 'r = -sin(10θ)/2cosθ',
        latex: 'r = -\\frac{\\sin(10\\theta)}{2\\cos\\theta}',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
        audioScale: 280,
        baseFreq: 300
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
    beating2: {
        category: 'sound',
        name: 'Beating 2',
        type: 'cartesian',
        fn: (x) => {
            // x를 적절히 스케일링하여 시각적으로 맥놀이가 잘 보이게 조정
            const t = x * 10; 
            return 12 * (Math.sin(t - 30) + Math.sin(0.9 * (t - 30)));
        },
        formula: 'f(x) = 12(sin(x-30) + sin(0.9(x-30)))',
        latex: 'f(x) = 12(\\sin(x-30) + \\sin(0.9(x-30)))',
        range: { xMin: -10, xMax: 10, yMin: -25, yMax: 25 },
        audioScale: 100,
        baseFreq: 220
    },
    vibration: {
        category: 'sound',
        name: 'Vibration',
        type: 'cartesian',
        fn: (x) => x * Math.sin(x * 10),
        formula: 'f(x) = x · sin(x)',
        latex: 'f(x) = x \\cdot \\sin(x)',
        range: { xMin: -10, xMax: 10, yMin: -12, yMax: 12 },
        audioScale: 150,
        baseFreq: 330
    },
    diamond: {
        category: 'sound',
        name: 'Diamond',
        type: 'cartesian',
        fn: (x) => (2 - Math.abs(x)) * Math.sin(x * 60),
        formula: 'f(x) = (2-|x|)·sin(120x)',
        latex: 'f(x) = (2-|x|) \\cdot \\sin(120x)',
        range: { xMin: -2, xMax: 2, yMin: -2.5, yMax: 2.5 },
        audioScale: 120,
        baseFreq: 440
    },
    arctanWave: {
        category: 'sound',
        name: 'Arctan Wave',
        type: 'cartesian',
        fn: (x) => 3 * Math.atan(3 * Math.sin(x * 4 * Math.PI)), // Scale period to match visual
        formula: 'f(x) = 3arctan(3sin(2x))',
        latex: 'f(x) = 3 \\arctan(3 \\sin(2x))',
        range: { xMin: -2, xMax: 2, yMin: -5, yMax: 5 },
        audioScale: 100,
        baseFreq: 220
    },
    monsterWave: {
        category: 'sound',
        name: 'Monster Wave',
        type: 'cartesian',
        fn: (x) => {
            const envelope = (Math.sqrt(Math.max(0, 4 - x * x)) * (0.2 + Math.abs(Math.sin(2.3 * x))) + 3 * Math.exp(-15 * x * x));
            return envelope * Math.sin(100 * x);
        },
        formula: 'f(x) = (√(4-x²)·(0.2+|sin(2.3x)|)+3e⁻¹⁵ˣ²)·sin(100x)',
        latex: 'f(x) = \\left(\\sqrt{4-x^2} \\cdot (0.2 + |\\sin(2.3x)|) + 3e^{-15x^2}\\right) \\cdot \\sin(100x)',
        range: { xMin: -2.1, xMax: 2.1, yMin: -5, yMax: 5 },
        audioScale: 100,
        baseFreq: 440
    },
    steppyWave: {
        category: 'waves',
        name: 'Steppy Wave',
        type: 'cartesian',
        fn: (x) => {
            const t = x * 2 * Math.PI;
            // tan이 무한대로 발산하지 않도록 안전하게 가공하여 반영
            return Math.cos(3 * t) + Math.sign(Math.sin(6 * t)) + 0.3 * Math.max(-2, Math.min(2, Math.tan(t / 2)));
        },
        formula: 'f(x) = cos(3x) + sgn(sin(6x)) + 0.5·tan(x)',
        latex: 'f(x) = \\cos(3x) + \\text{sgn}(\\sin(6x)) + \\frac{1}{2}\\tan(x)',
        range: { xMin: -2, xMax: 2, yMin: -4, yMax: 4 },
        audioScale: 120,
        baseFreq: 180
    },
    tanhTan: {
        category: 'waves',
        name: 'Tanh-Tan',
        type: 'cartesian',
        fn: (x) => 3 * Math.tanh(Math.tan(x * Math.PI)),
        formula: 'f(x) = 3tanh(tan(x))',
        latex: 'f(x) = 3 \\tanh(\\tan(x))',
        range: { xMin: -2, xMax: 2, yMin: -4, yMax: 4 },
        audioScale: 150,
        baseFreq: 220
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
    wobbleBass: {
        category: 'sound',
        name: 'Wobble Bass',
        type: 'cartesian',
        fn: (x) => Math.sin(x * (20 + 10 * Math.sin(x * 2))),
        formula: 'f(x) = sin(x·(20 + 10sin(2x)))',
        latex: 'f(x) = \\sin(x \\cdot (20 + 10\\sin(2x)))',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 150,
        baseFreq: 110
    },
    gatedNoise: {
        category: 'sound',
        name: 'Gated Noise',
        type: 'cartesian',
        fn: (x) => Math.sin(x * 100) * Math.floor(Math.sin(x) + 1.1),
        formula: 'f(x) = sin(100x)·⌊sin(x)+1.1⌋',
        latex: 'f(x) = \\sin(100x) \\cdot \\lfloor \\sin(x) + 1.1 \\rfloor',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 200,
        baseFreq: 440
    },
    warpWave: {
        category: 'sound',
        name: 'Warp Wave',
        type: 'cartesian',
        fn: (x) => Math.sin(10 * Math.sin(x)),
        formula: 'f(x) = sin(10sin(x))',
        latex: 'f(x) = \\sin(10\\sin(x))',
        range: { xMin: -4, xMax: 4, yMin: -1.5, yMax: 1.5 },
        audioScale: 300,
        baseFreq: 220
    },
    recursiveSine: {
        category: 'sound',
        name: 'Recursive Sine',
        type: 'cartesian',
        fn: (x) => Math.sin(x + Math.sin(x + Math.sin(x))),
        formula: 'f(x) = sin(x+sin(x+sin(x)))',
        latex: 'f(x) = \\sin(x + \\sin(x + \\sin(x)))',
        range: { xMin: -10, xMax: 10, yMin: -1.5, yMax: 1.5 },
        audioScale: 400,
        baseFreq: 330
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
    fourierSquare: {
        category: 'math',
        name: 'Fourier Square',
        type: 'cartesian',
        fn: (x) => {
            let sum = 0;
            const phase = x * 2 * Math.PI;
            for (let n = 0; n <= 10; n++) {
                const k = 2 * n + 1;
                sum += Math.sin(k * phase) / k;
            }
            return -(24 / Math.PI) * sum;
        },
        formula: 'f(x) = -24/π Σ sin((2n+1)x)/(2n+1)',
        latex: 'f(x) = -\\frac{24}{\\pi} \\sum_{n=0}^{10} \\frac{\\sin((2n+1)x)}{2n+1}',
        range: { xMin: -2, xMax: 2, yMin: -10, yMax: 10 },
        audioScale: 100,
        baseFreq: 110
    },
    complexWave: {
        category: 'math',
        name: 'Complex Wave',
        type: 'cartesian',
        fn: (x) => {
            let sum = 0;
            const phase = x * 2 * Math.PI;
            for (let n = 0; n <= 7; n++) {
                sum += Math.sin((4 * n + 1) * phase) / (n + 1);
            }
            return (24 / Math.PI) * sum;
        },
        formula: 'f(x) = 24/π Σ sin((4n+1)x)/(n+1)',
        latex: 'f(x) = \\frac{24}{\\pi} \\sum_{n=0}^{7} \\frac{\\sin((4n+1)x)}{n+1}',
        range: { xMin: -2, xMax: 2, yMin: -15, yMax: 15 },
        audioScale: 80,
        baseFreq: 130
    },
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
        category: 'waves',
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
        category: 'waves',
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
        category: 'curves',
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
    parabola: {
        category: 'math',
        name: 'Parabola',
        type: 'cartesian',
        fn: (x) => x * x,
        formula: 'f(x) = x²',
        latex: 'f(x) = x^2',
        range: { xMin: -2, xMax: 2, yMin: -0.5, yMax: 4.5 },
        audioScale: 200,
        baseFreq: 220
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
    stereoLove: {
        category: 'bytebeat',
        name: 'Stereo Love',
        type: 'cartesian',
        fn: (x) => {
            const t = Math.floor((x + 5) * 1000);
            // Edward Maya - Stereo Love bytebeat implementation
            const melody = (t * ((t >> 12 | t >> 8) & 63 & t >> 4));
            return (melody % 256) / 128 - 1;
        },
        formula: 'f(t) = t·((t>>12|t>>8)&63&t>>4)',
        latex: 'f(t) = t \\cdot ((t \\gg 12 \\lor t \\gg 8) \\land 63 \\land t \\gg 4)',
        range: { xMin: -5, xMax: 5, yMin: -1.2, yMax: 1.2 },
        audioScale: 100,
        baseFreq: 200
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
    waves: { name: '🎵 Basic', functions: [] },
    curves: { name: '🌸 Curves', functions: [] },
    art: { name: '💠 Art', functions: [] },
    sound: { name: '🔊 Synth', functions: [] },
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
