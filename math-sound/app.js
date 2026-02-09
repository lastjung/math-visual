/**
 * Math Sound Visualizer
 * 수학 함수를 소리와 그래프로 동시에 표현
 * 
 * 지원 좌표계:
 * - Cartesian: y = f(x)
 * - Polar: r = f(θ)
 * - Parametric: r(t) = ⟨x(t), y(t)⟩
 * 
 * Web Audio API + Canvas 2D
 */

// ==========================================
// 수학 함수 정의
// ==========================================
const MATH_FUNCTIONS = {
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
    lissajous: {
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

    fmSynth: {
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

// 카테고리별 함수 그룹화
const CATEGORIES = {
    waves: { name: '🎵 Waves', functions: [] },
    curves: { name: '🌸 Curves', functions: [] },
    sound: { name: '🔊 Sound', functions: [] },
    math: { name: '📐 Math', functions: [] },
    bytebeat: { name: '⚡ Byte', functions: [] }
};

// 함수들을 카테고리별로 분류
Object.keys(MATH_FUNCTIONS).forEach(key => {
    const func = MATH_FUNCTIONS[key];
    if (CATEGORIES[func.category]) {
        CATEGORIES[func.category].functions.push(key);
    }
});

// ==========================================
// 앱 상태
// ==========================================
const state = {
    currentFunction: 'sine',
    currentCategory: 'waves',
    isPlaying: false,
    animationId: null,
    audioContext: null,
    gainNode: null,
    analyser: null,
    bufferSource: null,
    volume: 0.5,
    speed: 1,
    zoom: 1,
    drawProgress: 0,
    functionIndex: 1,
    functionIndex: 1,
    timerStartTime: null,
    // Auto Play State
    isAutoPlaying: false,
    autoQueue: [],
    autoLoopCount: 0
};

// ==========================================
// DOM 요소
// ==========================================
const elements = {
    graphCanvas: document.getElementById('graphCanvas'),
    waveformCanvas: document.getElementById('waveformCanvas'),
    formulaText: document.getElementById('formulaText'),
    functionTitle: document.getElementById('functionTitle'),
    playBtn: document.getElementById('playBtn'),
    stopBtn: document.getElementById('stopBtn'),
    resetBtn: document.getElementById('resetBtn'),
    autoBtn: document.getElementById('autoBtn'),
    zoomSlider: document.getElementById('zoomSlider'),
    zoomValue: document.getElementById('zoomValue'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    functionSelector: document.getElementById('functionSelector'),
    categoryTabs: document.querySelectorAll('.category-tab'),
    currentIndex: document.getElementById('currentIndex'),
    totalCount: document.getElementById('totalCount'),
    container: document.querySelector('.container'),
    canvasWrapper: document.querySelector('.canvas-wrapper'),
    canvasClock: document.getElementById('canvasClock')
};

// Canvas contexts
let graphCtx, waveformCtx;

// ==========================================
// 초기화
// ==========================================
function init() {
    setupCanvas();
    setupEventListeners();
    elements.totalCount.textContent = Object.keys(MATH_FUNCTIONS).length;
    selectCategory('waves');
    selectFunction('sine');
    drawStaticGraph();
}

function updateTimer() {
    if (!state.isPlaying || !state.timerStartTime) {
        if (!state.isPlaying && !state.timerStartTime) {
            elements.canvasClock.textContent = '00:00.00';
        }
        return;
    }
    
    const now = performance.now();
    const diff = now - state.timerStartTime;
    
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const ms = Math.floor((diff % 1000) / 10);
    
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    const msm = String(ms).padStart(2, '0');
    
    elements.canvasClock.textContent = `${mm}:${ss}.${msm}`;
}

function setupCanvas() {
    // Graph Canvas
    const graphRect = elements.graphCanvas.getBoundingClientRect();
    elements.graphCanvas.width = graphRect.width * window.devicePixelRatio;
    elements.graphCanvas.height = graphRect.height * window.devicePixelRatio;
    graphCtx = elements.graphCanvas.getContext('2d');
    graphCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Waveform Canvas
    const waveRect = elements.waveformCanvas.getBoundingClientRect();
    elements.waveformCanvas.width = waveRect.width * window.devicePixelRatio;
    elements.waveformCanvas.height = waveRect.height * window.devicePixelRatio;
    waveformCtx = elements.waveformCanvas.getContext('2d');
    waveformCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function setupEventListeners() {
    elements.playBtn.addEventListener('click', togglePlay);
    elements.stopBtn.addEventListener('click', stop);
    elements.resetBtn.addEventListener('click', reset);
    
    // Auto Play Button
    if (elements.autoBtn) {
        elements.autoBtn.addEventListener('click', toggleAutoPlay);
    }

    elements.zoomSlider.addEventListener('input', (e) => {
        state.zoom = e.target.value / 100;
        elements.zoomValue.textContent = `${e.target.value}%`;
        elements.container.style.transform = `scale(${state.zoom})`;
    });

    elements.volumeSlider.addEventListener('input', (e) => {
        state.volume = e.target.value / 100;
        elements.volumeValue.textContent = `${e.target.value}%`;
        if (state.gainNode) {
            state.gainNode.gain.setValueAtTime(state.volume, state.audioContext.currentTime);
        }
    });

    elements.speedSlider.addEventListener('input', (e) => {
        state.speed = e.target.value / 5;
        elements.speedValue.textContent = `${state.speed.toFixed(1)}x`;
        if (state.bufferSource) {
            state.bufferSource.playbackRate.value = state.speed;
        }
    });

    // Category tabs
    elements.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            selectCategory(tab.dataset.category);
        });
    });

    // 창 크기 변경 시 캔버스 재설정
    window.addEventListener('resize', () => {
        setupCanvas();
        if (!state.isPlaying) {
            drawStaticGraph();
        }
    });

    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowRight') {
            navigateFunction(1);
        } else if (e.code === 'ArrowLeft') {
            navigateFunction(-1);
        } else if (e.key === '+' || e.key === '=') {
            adjustZoom(10);
        } else if (e.key === '-' || e.key === '_') {
            adjustZoom(-10);
        } else if (e.key === '0') {
            setZoom(100);
        }
    });
}

// 줌 조절 함수
function adjustZoom(delta) {
    const newZoom = Math.max(50, Math.min(200, parseInt(elements.zoomSlider.value) + delta));
    setZoom(newZoom);
}

function setZoom(value) {
    state.zoom = value / 100;
    elements.zoomSlider.value = value;
    elements.zoomValue.textContent = `${value}%`;
    elements.container.style.transform = `scale(${state.zoom})`;
}

// ==========================================
// 카테고리 선택
// ==========================================
function selectCategory(category, autoSelectFirst = false) {
    state.currentCategory = category;
    
    // 탭 상태 업데이트
    elements.categoryTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });

    // 함수 버튼 생성
    renderFunctionButtons(category);

    // autoSelectFirst가 true일 때만 첫 번째 함수 선택
    if (autoSelectFirst) {
        const funcs = CATEGORIES[category].functions;
        if (funcs.length > 0 && !funcs.includes(state.currentFunction)) {
            selectFunction(funcs[0]);
        }
    }
}

function renderFunctionButtons(category) {
    const container = elements.functionSelector;
    container.innerHTML = '';
    container.dataset.category = category;

    CATEGORIES[category].functions.forEach(funcKey => {
        const func = MATH_FUNCTIONS[funcKey];
        const btn = document.createElement('button');
        btn.className = 'func-btn' + (funcKey === state.currentFunction ? ' active' : '');
        btn.dataset.func = funcKey;
        btn.textContent = func.name;
        btn.addEventListener('click', () => selectFunction(funcKey));
        container.appendChild(btn);
    });
}

// ==========================================
// 함수 선택
// ==========================================
function selectFunction(funcName) {
    state.currentFunction = funcName;
    
    // 버튼 상태 업데이트
    document.querySelectorAll('.func-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.func === funcName);
    });

    // 함수 인덱스 계산
    const allFuncs = Object.keys(MATH_FUNCTIONS);
    state.functionIndex = allFuncs.indexOf(funcName) + 1;
    elements.currentIndex.textContent = state.functionIndex;

    const funcData = MATH_FUNCTIONS[funcName];

    // 캔버스 상단 제목 업데이트
    elements.functionTitle.textContent = funcData.name;

    // 수식 표시 (KaTeX)
    if (window.katex) {
        try {
            katex.render(funcData.latex, elements.formulaText, {
                throwOnError: false
            });
        } catch (e) {
            elements.formulaText.textContent = funcData.formula;
        }
    } else {
        elements.formulaText.textContent = funcData.formula;
    }

    // 카테고리 자동 전환
    if (funcData.category !== state.currentCategory) {
        selectCategory(funcData.category);
    }

    // 기존 재생 중지
    if (state.isPlaying) {
        stopSound();
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
        }
    }

    // 타이머와 진행률 초기화
    state.timerStartTime = null;
    elements.canvasClock.textContent = '00:00.00';
    state.drawProgress = 0;
    
    // 줌인 애니메이션 리셋 및 적용
    elements.canvasWrapper.classList.remove('zoom-in-effect');
    void elements.canvasWrapper.offsetWidth; // 리플로우 강제
    elements.canvasWrapper.classList.add('zoom-in-effect');
    
    drawStaticGraph();

    // 0.5초 후 자동 재생 시작 (요청하신 대로 변경)
    setTimeout(() => {
        play();
    }, 500);
}

function navigateFunction(direction) {
    const allFuncs = Object.keys(MATH_FUNCTIONS);
    let newIndex = allFuncs.indexOf(state.currentFunction) + direction;
    if (newIndex < 0) newIndex = allFuncs.length - 1;
    if (newIndex >= allFuncs.length) newIndex = 0;
    selectFunction(allFuncs[newIndex]);
}

// ==========================================
// 그래프 그리기 (좌표계별 분기)
// ==========================================
function drawStaticGraph() {
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;

    // 캔버스 클리어
    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);

    // 좌표계에 따라 다르게 그리기
    switch (funcData.type) {
        case 'parametric':
            drawParametricCurve(funcData, width, height, 1.0);
            break;
        case 'polar':
            drawPolarCurve(funcData, width, height, 1.0);
            break;
        case 'cartesian':
        default:
            drawCartesianCurve(funcData, width, height, 1.0);
            break;
    }
}

// Cartesian 그래프 (y = f(x))
function drawCartesianCurve(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.range;
    
    // 축 그리기
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    const steps = Math.floor(500 * progress);
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Draw Axes first
    
    let isFirst = true;

    // Use Category Color
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    graphCtx.lineCap = 'round';
    graphCtx.lineJoin = 'round';
    graphCtx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xRange * i) / 500;
        let y;
        try {
            y = funcData.fn(x);
        } catch (e) {
            continue;
        }

        if (!isFinite(y) || isNaN(y)) continue;

        const canvasX = ((x - xMin) / xRange) * width;
        const canvasY = ((yMax - y) / yRange) * height;

        if (canvasY < -100 || canvasY > height + 100) continue;

        if (isFirst) {
            graphCtx.moveTo(canvasX, canvasY);
            isFirst = false;
        } else {
            graphCtx.lineTo(canvasX, canvasY);
        }
    }
    
    graphCtx.stroke();
}

// Polar 그래프 (r = f(θ))
function drawPolarCurve(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: thetaMin, max: thetaMax } = funcData.thetaRange;
    
    // 축 그리기
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    const steps = Math.floor(1000 * progress);
    const thetaRange = thetaMax - thetaMin;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Use Category Color
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    graphCtx.lineCap = 'round';
    graphCtx.lineJoin = 'round';
    graphCtx.beginPath();
    
    let isFirst = true;
    for (let i = 0; i <= steps; i++) {
        const theta = thetaMin + (thetaRange * i) / 1000;
        let r;
        try {
            r = funcData.r(theta);
        } catch (e) {
            continue;
        }

        if (!isFinite(r) || isNaN(r)) continue;

        // Polar to Cartesian
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        const canvasX = ((x - xMin) / xRange) * width;
        const canvasY = ((yMax - y) / yRange) * height;

        if (canvasX < -50 || canvasX > width + 50 || canvasY < -50 || canvasY > height + 50) {
            isFirst = true;
            continue;
        }

        if (isFirst) {
            graphCtx.moveTo(canvasX, canvasY);
            isFirst = false;
        } else {
            graphCtx.lineTo(canvasX, canvasY);
        }
    }
    
    graphCtx.stroke();
}

// Parametric 그래프 (r⃗(t) = ⟨x(t), y(t)⟩)
function drawParametricCurve(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: tMin, max: tMax } = funcData.tRange;
    
    // 축 그리기
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    const steps = Math.floor(1000 * progress);
    const tRange = tMax - tMin;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    // Use Category Color
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    graphCtx.lineCap = 'round';
    graphCtx.lineJoin = 'round';
    graphCtx.beginPath();
    
    let isFirst = true;
    for (let i = 0; i <= steps; i++) {
        const t = tMin + (tRange * i) / 1000;
        let x, y;
        try {
            x = funcData.x(t);
            y = funcData.y(t);
        } catch (e) {
            continue;
        }

        if (!isFinite(x) || isNaN(x) || !isFinite(y) || isNaN(y)) continue;

        const canvasX = ((x - xMin) / xRange) * width;
        const canvasY = ((yMax - y) / yRange) * height;

        if (canvasX < -50 || canvasX > width + 50 || canvasY < -50 || canvasY > height + 50) {
            isFirst = true;
            continue;
        }

        if (isFirst) {
            graphCtx.moveTo(canvasX, canvasY);
            isFirst = false;
        } else {
            graphCtx.lineTo(canvasX, canvasY);
        }
    }
    
    graphCtx.stroke();
}

function drawAxes(width, height, xMin, xMax, yMin, yMax) {
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const centerX = ((-xMin) / xRange) * width;
    const centerY = ((yMax) / yRange) * height;

    graphCtx.strokeStyle = '#e5e7eb';
    graphCtx.lineWidth = 1;

    // X축
    if (centerY >= 0 && centerY <= height) {
        graphCtx.beginPath();
        graphCtx.moveTo(0, centerY);
        graphCtx.lineTo(width, centerY);
        graphCtx.stroke();
    }

    // Y축
    if (centerX >= 0 && centerX <= width) {
        graphCtx.beginPath();
        graphCtx.moveTo(centerX, 0);
        graphCtx.lineTo(centerX, height);
        graphCtx.stroke();
    }

    // 화살표
    graphCtx.fillStyle = '#9ca3af';
    
    // X축 화살표
    graphCtx.beginPath();
    graphCtx.moveTo(width - 10, centerY - 4);
    graphCtx.lineTo(width, centerY);
    graphCtx.lineTo(width - 10, centerY + 4);
    graphCtx.fill();

    // Y축 화살표
    graphCtx.beginPath();
    graphCtx.moveTo(centerX - 4, 10);
    graphCtx.lineTo(centerX, 0);
    graphCtx.lineTo(centerX + 4, 10);
    graphCtx.fill();
}

// ==========================================
// 오디오 엔진
// ==========================================
function initAudio() {
    if (state.audioContext) return;

    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    state.gainNode = state.audioContext.createGain();
    state.gainNode.gain.setValueAtTime(state.volume, state.audioContext.currentTime);
    state.gainNode.connect(state.audioContext.destination);

    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 2048;
    state.analyser.connect(state.gainNode);
}

function createSoundFromFunction() {
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const sampleRate = state.audioContext.sampleRate;
    const duration = 4;
    const numSamples = sampleRate * duration;
    
    const buffer = state.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        let y = 0;

        try {
            switch (funcData.type) {
                case 'parametric': {
                    const tParam = funcData.tRange.min + (funcData.tRange.max - funcData.tRange.min) * progress;
                    y = funcData.y(tParam);
                    break;
                }
                case 'polar': {
                    const theta = funcData.thetaRange.min + (funcData.thetaRange.max - funcData.thetaRange.min) * progress;
                    y = funcData.r(theta);
                    break;
                }
                case 'cartesian':
                default: {
                    const x = funcData.range.xMin + (funcData.range.xMax - funcData.range.xMin) * progress;
                    y = funcData.fn(x);
                    break;
                }
            }
        } catch (e) {
            y = 0;
        }

        if (!isFinite(y) || isNaN(y)) y = 0;
        y = Math.max(-1, Math.min(1, y / 10));

        const freq = funcData.baseFreq + y * funcData.audioScale;
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * 0.5;
    }

    return buffer;
}

function playSound() {
    initAudio();
    
    if (state.bufferSource) {
        try {
            state.bufferSource.stop();
        } catch (e) {}
    }

    const buffer = createSoundFromFunction();
    state.bufferSource = state.audioContext.createBufferSource();
    state.bufferSource.buffer = buffer;
    state.bufferSource.connect(state.analyser);
    state.bufferSource.loop = true;
    state.bufferSource.playbackRate.value = state.speed;
    state.bufferSource.start();
}

function stopSound() {
    if (state.bufferSource) {
        try {
            state.bufferSource.stop();
        } catch (e) {}
        state.bufferSource = null;
    }
}

// ==========================================
// 애니메이션
// ==========================================
function animate() {
    if (!state.isPlaying) return;

    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;

    // 진행률 업데이트
    state.drawProgress += 0.004 * state.speed;
    
    // Loop End Detection
    if (state.drawProgress > 1) {
        state.drawProgress = 0;
        
        // Auto Play Logic: 3 loops per function
        if (state.isAutoPlaying) {
            state.autoLoopCount++;
            if (state.autoLoopCount >= 3) {
                // Stop current pattern
                state.isPlaying = false;
                stopSound();
                cancelAnimationFrame(state.animationId);
                
                // Rest 1s then Next
                setTimeout(() => {
                    playNextAuto();
                }, 1000);
                return; // Stop animate loop here
            }
        }
    }

    // 그래프 클리어 & 다시 그리기
    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);

    // 좌표계에 따라 다르게 그리기
    switch (funcData.type) {
        case 'parametric':
            drawParametricCurve(funcData, width, height, state.drawProgress);
            drawParametricPoint(funcData, width, height, state.drawProgress);
            break;
        case 'polar':
            drawPolarCurve(funcData, width, height, state.drawProgress);
            drawPolarPoint(funcData, width, height, state.drawProgress);
            break;
        case 'cartesian':
        default:
            drawCartesianCurve(funcData, width, height, state.drawProgress);
            drawCartesianPoint(funcData, width, height, state.drawProgress);
            break;
    }

    // 파형 그리기
    drawWaveform();

    // 타이머 업데이트
    updateTimer();

    state.animationId = requestAnimationFrame(animate);
}

// 현재 포인트 그리기 함수들
function drawCartesianPoint(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.range;
    const currentX = xMin + (xMax - xMin) * progress;
    let currentY;
    try {
        currentY = funcData.fn(currentX);
    } catch (e) {
        return;
    }
    
    if (!isFinite(currentY) || isNaN(currentY)) return;
    
    const canvasX = progress * width;
    const canvasY = ((yMax - currentY) / (yMax - yMin)) * height;
    
    drawPoint(canvasX, canvasY, funcData.category, height);
}

function drawPolarPoint(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: thetaMin, max: thetaMax } = funcData.thetaRange;
    const theta = thetaMin + (thetaMax - thetaMin) * progress;
    let r;
    try {
        r = funcData.r(theta);
    } catch (e) {
        return;
    }
    
    if (!isFinite(r) || isNaN(r)) return;
    
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const canvasX = ((x - xMin) / (xMax - xMin)) * width;
    const canvasY = ((yMax - y) / (yMax - yMin)) * height;
    
    drawPoint(canvasX, canvasY, funcData.category, height);
}

function drawParametricPoint(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: tMin, max: tMax } = funcData.tRange;
    const t = tMin + (tMax - tMin) * progress;
    let x, y;
    try {
        x = funcData.x(t);
        y = funcData.y(t);
    } catch (e) {
        return;
    }
    
    if (!isFinite(x) || isNaN(x) || !isFinite(y) || isNaN(y)) return;
    
    const canvasX = ((x - xMin) / (xMax - xMin)) * width;
    const canvasY = ((yMax - y) / (yMax - yMin)) * height;
    
    drawPoint(canvasX, canvasY, funcData.category, height);
}

function drawPoint(canvasX, canvasY, category, height) {
    const color = getCategoryColor(category);
    graphCtx.fillStyle = color;
    graphCtx.beginPath();
    graphCtx.arc(canvasX, Math.max(5, Math.min(height - 5, canvasY)), 8, 0, Math.PI * 2);
    graphCtx.fill();
    
    // 포인트 외곽선 (가독성)
    graphCtx.strokeStyle = '#ffffff';
    graphCtx.lineWidth = 2;
    graphCtx.stroke();
}

// 헬퍼: 카테고리별 테마 색상 반환
function getCategoryColor(category) {
    const colors = {
        waves: '#8b5cf6',   // Violet
        curves: '#ec4899',  // Pink
        sound: '#f59e0b',   // Amber
        math: '#10b981',    // Emerald
        bytebeat: '#ef4444' // Red
    };
    return colors[category] || '#3b82f6'; // Default Blue
}

function drawWaveform() {
    if (!state.analyser) return;

    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    state.analyser.getByteTimeDomainData(dataArray);

    waveformCtx.fillStyle = '#f3f4f6';
    waveformCtx.fillRect(0, 0, width, height);

    const colors = {
        waves: '#8b5cf6',
        curves: '#ec4899',
        sound: '#f59e0b',
        math: '#10b981',
        bytebeat: '#ef4444'
    };
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    waveformCtx.strokeStyle = colors[funcData.category] || '#3b82f6';
    waveformCtx.lineWidth = 2;
    waveformCtx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
            waveformCtx.moveTo(x, y);
        } else {
            waveformCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    waveformCtx.lineTo(width, height / 2);
    waveformCtx.stroke();
}

// ==========================================
// 컨트롤
// ==========================================
function togglePlay() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    state.isPlaying = true;
    state.timerStartTime = performance.now(); // 타이머 시작
    elements.playBtn.classList.add('playing');
    elements.playBtn.querySelector('.icon').textContent = '❚❚';
    document.body.classList.add('drawing');
    
    playSound();
    animate();
}

function pause() {
    state.isPlaying = false;
    // 일시정지 시 타이머는 멈춤 (필요시 state.timerStartTime 조절 로직 추가 가능)
    elements.playBtn.classList.remove('playing');
    elements.playBtn.querySelector('.icon').textContent = '▶';
    document.body.classList.remove('drawing');
    
    stopSound();
    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
    }
}

function stop() {
    // Auto Play Reset
    if (state.isAutoPlaying) {
        state.isAutoPlaying = false;
        state.autoQueue = [];
        state.autoLoopCount = 0;
        if (elements.autoBtn) elements.autoBtn.classList.remove('playing');
    }

    pause();
    state.timerStartTime = null;
    elements.canvasClock.textContent = '00:00.00';
    reset();
}

function reset() {
    state.drawProgress = 0;
    drawStaticGraph();
    
    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    waveformCtx.fillStyle = '#f3f4f6';
    waveformCtx.fillRect(0, 0, width, height);
}

// ==========================================
// 시작
// ==========================================
document.addEventListener('DOMContentLoaded', init);

window.addEventListener('load', () => {
    if (window.katex) {
        selectFunction(state.currentFunction);
    }
});


// ==========================================
// Auto Play Functions (Random 4 Songs x 3 Loops)
// ==========================================
function toggleAutoPlay() {
    if (state.isAutoPlaying) {
        stop(); // This will clear auto play state
    } else {
        startAutoPlay();
    }
}

function startAutoPlay() {
    stop(); // Reset everything first
    
    // Pick 4 distinct random functions
    const keys = Object.keys(MATH_FUNCTIONS);
    // Fisher-Yates shuffle
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    
    state.autoQueue = keys.slice(0, 4); // Select top 4
    
    if (state.autoQueue.length === 0) return;
    
    state.isAutoPlaying = true;
    state.autoLoopCount = 0;
    
    if (elements.autoBtn) {
        elements.autoBtn.classList.add('playing');
        // Visual feedback (Gold color)
        elements.autoBtn.style.backgroundColor = '#fcd34d'; // Amber-300
    }
    
    playNextAuto();
}

function playNextAuto() {
    if (!state.isAutoPlaying) return;
    
    if (state.autoQueue.length === 0) {
        // Finished sequence
        stop(); 
        return;
    }
    
    const nextFunc = state.autoQueue.shift();
    selectFunction(nextFunc);
    
    state.autoLoopCount = 0;
    
    // Slight delay before starting to ensure UI updates
    setTimeout(() => {
        if (state.isAutoPlaying) play();
    }, 1000);
}
