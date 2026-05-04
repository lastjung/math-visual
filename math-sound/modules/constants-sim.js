/**
 * Math Sound - Constants Simulation Engine (Waves+ & Curves+ v2.0)
 */
import { state, elements, ctx } from './state.js';

// ==========================================
// Categories
// ==========================================
export const CSIM_CATEGORIES = {
    'waves-plus': {
        name: '🌊 Waves+',
        functions: [
            'sineMultiSim', 'squareFourierSim', 'sawtoothFourierSim', 'triangleSim',
            'pulsePwmSim', 'steppyQuantizeSim', 'tanhTanClipSim', 'dampedDecaySim',
            'chaosInterferenceSim', 'softHarmonicsSim'
        ]
    },
    'curves-plus': {
        name: '🌸 Curves+',
        functions: [
            'cupidHeartSim', 'cupidArrowOnlySim', 'loveHeartSim', 'crystalHeartSim', 
            'brokenHeartSim', 'heartSim', 'oscillatingHeartSim', 'lissajousSim', 
            'roseSim', 'cardioidSim', 'rose4Sim', 'rose3Sim', 'limaconLoopSim', 
            'micPatternSim', 'lemniscateSim', 'infiniteHeartSim', 'butterflySim', 
            'spiralSim', 'epicycloidSim'
        ]
    }
};

// ==========================================
// Helper: Unique Monochromatic Color
// ==========================================
function getSimColor() {
    const sim = CSIM_FUNCTIONS[simAudio.functionId];
    if (sim && sim.color) return sim.color;
    
    const hue = ((state.functionIndex || 0) * 137.5) % 360;
    const saturation = 85;
    const lightness = state.theme === 'dark' ? 68 : 45;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ==========================================
// Functions (a, b Control)
// ==========================================
export const CSIM_FUNCTIONS = {
    // ---------- Waves+ ----------
    sineMultiSim: {
        id: 'sineMultiSim', category: 'waves-plus', name: 'Sine Multi Sim', type: 'cartesian',
        formula: 'y = Σ sin(x + i·b/10)',
        latex: 'y = \\sum_{i=1}^{a} \\sin(x + \\frac{i \\cdot b}{10})',
        range: { xMin: -6.28, xMax: 6.28, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Layers', min: 1, max: 50, default: 10 },
        varB: { name: 'Phase', min: 0, max: 10, default: 2 },
        fn: (x, a, b) => {
            let s = 0; const n = Math.floor(a);
            for (let i = 1; i <= n; i++) s += Math.sin(x + (i * b) / 10);
            return s;
        },
        audioScale: 150, baseFreq: 220
    },
    squareFourierSim: {
        id: 'squareFourierSim', category: 'waves-plus', name: 'Square Fourier Sim', type: 'cartesian',
        formula: 'y = Σ sin((2n+1)x)/(2n+1)',
        latex: 'y = \\frac{4}{\\pi}\\sum_{n=0}^{a} \\frac{\\sin((2n+1)x)}{2n+1}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Harmonics', min: 0, max: 50, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => {
            let sq = 0; const n = Math.floor(a);
            for (let i = 0; i <= n; i++) { const k = 2 * i + 1; sq += Math.sin(k * b * x) / k; }
            return (4 / Math.PI) * sq;
        },
        audioScale: 180, baseFreq: 260
    },
    sawtoothFourierSim: {
        id: 'sawtoothFourierSim', category: 'waves-plus', name: 'Sawtooth Fourier Sim', type: 'cartesian',
        formula: 'y = Σ sin(nx)/n',
        latex: 'y = \\frac{2}{\\pi}\\sum_{n=1}^{a} \\frac{\\sin(nx)}{n}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Harmonics', min: 1, max: 50, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => {
            let sw = 0; const n = Math.floor(a);
            for (let i = 1; i <= n; i++) sw += Math.sin(i * b * x) / i;
            return (2 / Math.PI) * sw;
        },
        audioScale: 160, baseFreq: 240
    },
    triangleSim: {
        id: 'triangleSim', category: 'waves-plus', name: 'Triangle Sim', type: 'cartesian',
        formula: 'y = a · triangle(bx)',
        latex: 'y = a \\cdot (\\operatorname{abs}(4 \\cdot \\operatorname{frac}(xb - 0.25) - 2) - 1)',
        range: { xMin: -6.28, xMax: 6.28, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Amplitude', min: 0.5, max: 10, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 10, default: 2 },
        fn: (x, a, b) => {
            const t = (x * b / (2 * Math.PI) - 0.25);
            return a * (Math.abs(4 * ((t % 1 + 1) % 1) - 2) - 1);
        },
        audioScale: 140, baseFreq: 220
    },
    pulsePwmSim: {
        id: 'pulsePwmSim', category: 'waves-plus', name: 'Pulse PWM Sim', type: 'cartesian',
        formula: 'y = sgn(sin bx + cos a)',
        latex: 'y = \\operatorname{sgn}(\\sin(bx) + \\cos(a))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Pulse Width', min: 0, max: Math.PI, default: Math.PI/2 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => Math.sign(Math.sin(b * x) + Math.cos(a)),
        audioScale: 200, baseFreq: 110
    },
    steppyQuantizeSim: {
        id: 'steppyQuantizeSim', category: 'waves-plus', name: 'Steppy Quantize Sim', type: 'cartesian',
        formula: 'y = floor(a·sin bx)/a',
        latex: 'y = \\frac{\\lfloor a \\cdot \\sin(bx) \\rfloor}{a}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Steps', min: 1, max: 20, default: 4 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => Math.floor(a * Math.sin(b * x)) / Math.max(1, a),
        audioScale: 170, baseFreq: 180
    },
    tanhTanClipSim: {
        id: 'tanhTanClipSim', category: 'waves-plus', name: 'Tanh-Tan Clip Sim', type: 'cartesian',
        formula: 'y = tanh(a·tan bx)',
        latex: 'y = \\tanh(a \\cdot \\tan(bx))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -4, yMax: 4 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Gain', min: 0.1, max: 20, default: 1 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => Math.tanh(a * Math.tan(b * x / 10)),
        audioScale: 100, baseFreq: 330
    },
    dampedDecaySim: {
        id: 'dampedDecaySim', category: 'waves-plus', name: 'Damped Decay Sim', type: 'cartesian',
        formula: 'y = a · e^(-0.2|x|) sin(bx)',
        latex: 'y = a e^{-0.2|x|} \\sin(bx)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Amplitude', min: 1, max: 15, default: 8 },
        varB: { name: 'Frequency', min: 0.5, max: 10, default: 4 },
        fn: (x, a, b) => a * Math.exp(-0.2 * Math.abs(x)) * Math.sin(b * x),
        audioScale: 120, baseFreq: 180
    },
    chaosInterferenceSim: {
        id: 'chaosInterferenceSim', category: 'waves-plus', name: 'Chaos Interference Sim', type: 'cartesian',
        formula: 'y = a · sin(bx) cos(3x)',
        latex: 'y = a \\sin(bx) \\cos(3x)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Amplitude', min: 1, max: 10, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 20, default: 5 },
        fn: (x, a, b) => a * Math.sin(b * x) * Math.cos(3 * x),
        audioScale: 130, baseFreq: 220
    },
    softHarmonicsSim: {
        id: 'softHarmonicsSim', category: 'waves-plus', name: 'Soft Harmonics Sim', type: 'cartesian',
        formula: 'y = Σ tanh(sin(ibx))/i',
        latex: 'y = \\sum_{i=1}^{a} \\frac{\\tanh(\\sin(ibx))}{i}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -3, yMax: 3 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Layers', min: 1, max: 20, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => {
            let sf = 0; const n = Math.floor(a);
            for (let i = 1; i <= n; i++) sf += Math.tanh(Math.sin(i * b * x)) / i;
            return sf;
        },
        audioScale: 110, baseFreq: 200
    },

    // ---------- Curves+ (Total 19) ----------
    cupidHeartSim: {
        id: 'cupidHeartSim', category: 'curves-plus', name: 'Cupid Heart Sim', type: 'parametric',
        formula: 'Original Cupid Heart Logic (a: Size, b: Arrow)',
        latex: '\\vec{H}(t) \\cup \\vec{A}(t)',
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 15000,
        varA: { name: 'Heart Size', min: 0.5, max: 1.2, default: 0.9 },
        varB: { name: 'Arrow Offset', min: -0.5, max: 0.5, default: 0 },
        x: (t, a, b) => {
            const hEnd = 1.4 * Math.PI; const aStart = 1.6 * Math.PI;
            if (t <= hEnd) {
                const tH = (t / hEnd) * 2 * Math.PI;
                return a * (16 * Math.pow(Math.sin(tH), 3) / 10);
            } else if (t < aStart) return NaN;
            else {
                const tA = (t - aStart) / (2 * Math.PI - aStart);
                if (tA < 0.8) {
                    const raw = 1.8 - 4.125 * tA + b;
                    if (raw >= 0 && raw <= 1.1) return NaN;
                    return a * raw;
                } else {
                    const s = (tA - 0.8) / 0.2;
                    const pts = [-1.5, -1.4, -1.1, -1.5];
                    const i = Math.min(pts.length - 2, Math.floor(s * 3));
                    const f = (s * 3) % 1;
                    return a * (pts[i] + (pts[i+1] - pts[i]) * f);
                }
            }
        },
        y: (t, a, b) => {
            const hEnd = 1.4 * Math.PI; const aStart = 1.6 * Math.PI;
            if (t <= hEnd) {
                const tH = (t / hEnd) * 2 * Math.PI;
                return a * (13 * Math.cos(tH) - 5 * Math.cos(2*tH) - 2 * Math.cos(3*tH) - Math.cos(4*tH)) / 10;
            } else if (t < aStart) return NaN;
            else {
                const tA = (t - aStart) / (2 * Math.PI - aStart);
                if (tA < 0.8) {
                    const raw = 1.8 - 4.125 * tA + b;
                    if (raw >= 0 && raw <= 1.1) return NaN;
                    return a * raw;
                } else {
                    const s = (tA - 0.8) / 0.2;
                    const pts = [-1.5, -1.1, -1.4, -1.5];
                    const i = Math.min(pts.length - 2, Math.floor(s * 3));
                    const f = (s * 3) % 1;
                    return a * (pts[i] + (pts[i+1] - pts[i]) * f);
                }
            }
        },
        audioScale: 150, baseFreq: 200
    },
    cupidArrowOnlySim: {
        id: 'cupidArrowOnlySim', category: 'curves-plus', name: 'Cupid Arrow Sim', type: 'parametric',
        formula: 'Independent Cupid Arrow (a: Len, b: Pos)',
        latex: '\\vec{A}(t, a, b)',
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Length', min: 0.8, max: 1.5, default: 1.1 },
        varB: { name: 'Offset', min: -0.5, max: 0.5, default: 0 },
        x: (t, a, b) => {
            const tA = t / (2 * Math.PI);
            if (tA < 0.8) {
                const raw = 1.8 - 4.125 * tA + b;
                if (raw >= 0 && raw <= 1.1) return NaN;
                return a * raw;
            } else {
                const s = (tA - 0.8) / 0.2;
                const pts = [-1.5, -1.4, -1.1, -1.5];
                const i = Math.min(pts.length - 2, Math.floor(s * 3));
                const f = (s * 3) % 1;
                return a * (pts[i] + (pts[i+1] - pts[i]) * f);
            }
        },
        y: (t, a, b) => {
            const tA = t / (2 * Math.PI);
            if (tA < 0.8) {
                const raw = 1.8 - 4.125 * tA + b;
                if (raw >= 0 && raw <= 1.1) return NaN;
                return a * raw;
            } else {
                const s = (tA - 0.8) / 0.2;
                const pts = [-1.5, -1.1, -1.4, -1.5];
                const i = Math.min(pts.length - 2, Math.floor(s * 3));
                const f = (s * 3) % 1;
                return a * (pts[i] + (pts[i+1] - pts[i]) * f);
            }
        },
        audioScale: 150, baseFreq: 200
    },
    loveHeartSim: {
        id: 'loveHeartSim', category: 'curves-plus', name: 'Love Heart Sim', type: 'cartesian',
        formula: 'f(x) = a·[sin(bπ³x)√(e²-x²) + √|x|]',
        latex: 'f(x) = a \\left( \\sin(b \\pi^3 x) \\sqrt{e^2 - x^2} + \\sqrt{|x|} \\right)',
        range: { xMin: -4, xMax: 4, yMin: -3, yMax: 5 },
        color: '#ef4444',
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Intensity', min: 0.5, max: 1.5, default: 0.95 },
        varB: { name: 'Frequency', min: 0.5, max: 10.0, default: 1.0 },
        fn: (x, a, b) => {
            const e2 = Math.exp(2); const inside = (e2 - x * x);
            if (inside < 0) return 0;
            return a * (Math.sin(b * Math.pow(Math.PI, 3) * x) * Math.sqrt(inside) + Math.sqrt(Math.abs(x)));
        },
        audioScale: 150, baseFreq: 440
    },
    crystalHeartSim: {
        id: 'crystalHeartSim', category: 'curves-plus', name: 'Crystal Heart Sim', type: 'parametric',
        formula: 'x = a·sin t cos t ln|t|, y = a·|t|^b·√cos t',
        latex: 'x = a\\sin t \\cos t \\ln|t|, y = a|t|^b \\sqrt{\\cos t}',
        viewBox: { xMin: -0.5, xMax: 0.5, yMin: -0.1, yMax: 1.2 },
        tRange: { min: -1.0, max: 1.0 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Size', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'Sharpness', min: 0.1, max: 0.6, default: 0.3 },
        x: (t, a, b) => {
            if (Math.abs(t) < 0.001) return 0;
            return a * Math.sin(t) * Math.cos(t) * Math.log(Math.abs(t));
        },
        y: (t, a, b) => {
            const cosT = Math.cos(t); if (cosT < 0) return 0;
            return a * Math.pow(Math.abs(t), b) * Math.sqrt(cosT);
        },
        audioScale: 400, baseFreq: 220
    },
    brokenHeartSim: {
        id: 'brokenHeartSim', category: 'curves-plus', name: 'Broken Heart Sim', type: 'parametric',
        formula: 'Heart Outline then Broken Crack',
        latex: '\\vec{r}(t) = \\begin{cases} \\text{heart}(t) \\\\ \\langle \\text{lightning}(t), 5-22p \\rangle \\end{cases}',
        viewBox: { xMin: -30, xMax: 30, yMin: -30, yMax: 25 },
        tRange: { min: 0, max: 3.5 * Math.PI },
        drawMs: 2000, durationMs: 15000,
        varA: { name: 'Scale', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'Crack Density', min: 5, max: 20, default: 10 },
        x: (t, a, b) => {
            if (t <= 2 * Math.PI) return a * 16 * Math.pow(Math.sin(t), 3);
            const p = (t - 2 * Math.PI) / (1.5 * Math.PI);
            return a * 4 * (Math.abs(((p + 0.05) * b) % 2 - 1) - 0.5);
        },
        y: (t, a, b) => {
            if (t <= 2 * Math.PI) return a * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            const p = (t - 2 * Math.PI) / (1.5 * Math.PI);
            return a * (5 - 22 * p);
        },
        audioScale: 200, baseFreq: 110
    },
    heartSim: {
        id: 'heartSim', category: 'curves-plus', name: 'Classic Heart Sim', type: 'parametric',
        formula: 'x = a·16sin³t, y = a·(13cost - 5cos2t - ...)',
        latex: '\\vec{r}(t) = a \\langle 16\\sin^3 t, 13\\cos t - 5\\cos 2t - 2\\cos 3t - \\cos 4t \\rangle',
        viewBox: { xMin: -30, xMax: 30, yMin: -30, yMax: 25 },
        color: '#ff0000',
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Scale', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'None', min: 1, max: 1, default: 1 },
        x: (t, a, b) => a * 16 * Math.pow(Math.sin(t), 3),
        y: (t, a, b) => a * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)),
        audioScale: 200, baseFreq: 220
    },
    oscillatingHeartSim: {
        id: 'oscillatingHeartSim', category: 'curves-plus', name: 'Oscillating Heart Sim', type: 'cartesian',
        formula: 'f(x) = a·[x^(2/3) + 0.9·sin(bx)·√(3-x²)]',
        latex: 'f(x) = a \\left( x^{2/3} + 0.9 \\sin(bx) \\sqrt{3 - x^2} \\right)',
        range: { xMin: -1.8, xMax: 1.8, yMin: -1.2, yMax: 2.2 },
        drawMs: 2000, durationMs: 10000,
        varA: { name: 'Scale', min: 0.5, max: 1.2, default: 1.0 },
        varB: { name: 'Frequency', min: 10, max: 200, default: 100 },
        fn: (x, a, b) => {
            const x2 = x * x; if (x2 > 3) return 0;
            return a * (Math.pow(Math.abs(x), 2/3) + 0.9 * Math.sin(b * x) * Math.sqrt(3 - x2));
        },
        audioScale: 200, baseFreq: 330
    },
    lissajousSim: {
        id: 'lissajousSim', category: 'curves-plus', name: 'Lissajous Sim', type: 'parametric',
        formula: 'x = 3sin(at), y = 2sin(bt)',
        latex: '\\vec{r}(t) = \\langle 3\\sin(at), 2\\sin(bt) \\rangle',
        viewBox: { xMin: -4, xMax: 4, yMin: -3, yMax: 3 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Freq X', min: 1, max: 10, default: 3 },
        varB: { name: 'Freq Y', min: 1, max: 10, default: 4 },
        x: (t, a, b) => 3 * Math.sin(a * t),
        y: (t, a, b) => 2 * Math.sin(b * t),
        audioScale: 300, baseFreq: 330
    },
    roseSim: {
        id: 'roseSim', category: 'curves-plus', name: 'Rose Sim', type: 'polar',
        formula: 'r = a·cos(bθ)',
        latex: 'r = a \\cos(b \\theta)',
        viewBox: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Size', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'Petals', min: 1, max: 12, default: 4 },
        r: (theta, a, b) => a * Math.cos(b * theta),
        audioScale: 400, baseFreq: 440
    },
    cardioidSim: {
        id: 'cardioidSim', category: 'curves-plus', name: 'Cardioid Sim', type: 'polar',
        formula: 'r = a·(1 - cosθ)',
        latex: 'r = a(1 - \\cos\\theta)',
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Scale', min: 0.5, max: 2.0, default: 1.0 },
        varB: { name: 'None', min: 1, max: 1, default: 1 },
        r: (theta, a, b) => a * (1 - Math.cos(theta)),
        audioScale: 280, baseFreq: 300
    },
    rose4Sim: {
        id: 'rose4Sim', category: 'curves-plus', name: 'Rose 4 Sim', type: 'polar',
        formula: 'r = a·cos(4θ)',
        latex: 'r = a \\cos(4\\theta)',
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Size', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'Frequency', min: 1, max: 10, default: 4 },
        r: (theta, a, b) => a * Math.cos(b * theta),
        audioScale: 320, baseFreq: 350
    },
    rose3Sim: {
        id: 'rose3Sim', category: 'curves-plus', name: 'Rose 3 Sim', type: 'polar',
        formula: 'r = a·sin(3θ)',
        latex: 'r = a \\sin(3\\theta)',
        viewBox: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
        tRange: { min: 0, max: Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Size', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'Frequency', min: 1, max: 10, default: 3 },
        r: (theta, a, b) => a * Math.sin(b * theta),
        audioScale: 340, baseFreq: 380
    },
    limaconLoopSim: {
        id: 'limaconLoopSim', category: 'curves-plus', name: 'Limaçon Loop Sim', type: 'polar',
        formula: 'r = a - b·cosθ',
        latex: 'r = a - b\\cos\\theta',
        viewBox: { xMin: -16, xMax: 10, yMin: -10, yMax: 10 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Base', min: 1, max: 10, default: 5 },
        varB: { name: 'Loop', min: 1, max: 15, default: 9 },
        r: (theta, a, b) => a - b * Math.cos(theta),
        audioScale: 300, baseFreq: 300
    },
    micPatternSim: {
        id: 'micPatternSim', category: 'curves-plus', name: 'Mic Pattern Sim', type: 'polar',
        formula: 'r = a - cosθ·sin(bθ)',
        latex: 'r = a - \\cos\\theta \\sin(b\\theta)',
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Base', min: 0.5, max: 2.0, default: 1.0 },
        varB: { name: 'Frequency', min: 1, max: 10, default: 3 },
        r: (theta, a, b) => a - Math.cos(theta) * Math.sin(b * theta),
        audioScale: 320, baseFreq: 360
    },
    lemniscateSim: {
        id: 'lemniscateSim', category: 'curves-plus', name: 'Lemniscate Sim', type: 'parametric',
        formula: 'x = a·cost/(1+sin²t), y = b·sint cost/(1+sin²t)',
        latex: '\\vec{r}(t) = \\langle \\frac{a\\cos t}{1+\\sin^2 t}, \\frac{b\\sin t \\cos t}{1+\\sin^2 t} \\rangle',
        viewBox: { xMin: -1.8, xMax: 1.8, yMin: -1.2, yMax: 1.2 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Width', min: 0.5, max: 2.0, default: 1.0 },
        varB: { name: 'Twist', min: 0.5, max: 2.0, default: 1.0 },
        x: (t, a, b) => (a * Math.cos(t)) / (1 + Math.pow(Math.sin(t), 2)),
        y: (t, a, b) => (b * Math.sin(t) * Math.cos(t)) / (1 + Math.pow(Math.sin(t), 2)),
        audioScale: 300, baseFreq: 320
    },
    infiniteHeartSim: {
        id: 'infiniteHeartSim', category: 'curves-plus', name: 'Infinite Heart Sim', type: 'parametric',
        formula: 'Fusion of Heart and Infinity',
        latex: '\\vec{r}(t) = \\langle a\\sin(bt), c\\cos(t) \\rangle',
        viewBox: { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Size', min: 0.5, max: 2.0, default: 1.2 },
        varB: { name: 'Complexity', min: 1, max: 5, default: 2 },
        x: (t, a, b) => a * Math.sin(t) * Math.cos(b * t),
        y: (t, a, b) => a * (Math.abs(Math.sin(t)) * Math.sin(t) - Math.cos(t)),
        audioScale: 200, baseFreq: 260
    },
    butterflySim: {
        id: 'butterflySim', category: 'curves-plus', name: 'Butterfly Sim', type: 'polar',
        formula: 'r = a·[exp(sinθ) - 2cos(bθ) + sin⁵((2θ-π)/24)]',
        latex: 'r = a [e^{\\sin\\theta} - 2\\cos(b\\theta) + \\sin^5(\\frac{2\\theta-\\pi}{24})]',
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        tRange: { min: 0, max: 12 * Math.PI },
        drawMs: 3000, durationMs: 15000,
        varA: { name: 'Size', min: 0.5, max: 1.5, default: 1.0 },
        varB: { name: 'Wiggle', min: 1, max: 5, default: 4 },
        r: (theta, a, b) => a * (Math.exp(Math.sin(theta)) - 2 * Math.cos(b * theta) + Math.pow(Math.sin((2 * theta - Math.PI) / 24), 5)),
        audioScale: 180, baseFreq: 260
    },
    spiralSim: {
        id: 'spiralSim', category: 'curves-plus', name: 'Spiral Sim', type: 'polar',
        formula: 'r = a·θ',
        latex: 'r = a \\theta',
        viewBox: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
        tRange: { min: 0, max: 6 * Math.PI },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Tightness', min: 0.05, max: 0.5, default: 0.1 },
        varB: { name: 'None', min: 1, max: 1, default: 1 },
        r: (theta, a, b) => a * theta,
        audioScale: 250, baseFreq: 350
    },
    epicycloidSim: {
        id: 'epicycloidSim', category: 'curves-plus', name: 'Epicycloid Sim', type: 'parametric',
        formula: 'x = (a+b)cost - b cos((a+b)t/b), y = (a+b)sint - b sin((a+b)t/b)',
        latex: '\\vec{r}(t) = \\langle (a+b)\\cos t - b\\cos(\\frac{a+b}{b}t), ... \\rangle',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        tRange: { min: 0, max: 2 * Math.PI },
        drawMs: 2000, durationMs: 15000,
        varA: { name: 'Outer R', min: 1, max: 6, default: 3 },
        varB: { name: 'Inner r', min: 0.5, max: 4, default: 1 },
        x: (t, a, b) => (a + b) * Math.cos(t) - b * Math.cos(((a + b) / b) * t),
        y: (t, a, b) => (a + b) * Math.sin(t) - b * Math.sin(((a + b) / b) * t),
        audioScale: 200, baseFreq: 280
    }
};

// ==========================================
// Internal State & Audio Engine
// ==========================================
const simAudio = {
    context: null, master: null, filter: null, analyser: null,
    osc: null, gain: null, rafId: null, startedAt: 0, functionId: null
};

export function isConstantsSimCategory(category) { return !!CSIM_CATEGORIES[category]; }
export function isConstantsSimFunction(functionId) { return !!CSIM_FUNCTIONS[functionId]; }

export function drawConstantsSimStatic(functionId) {
    const sim = CSIM_FUNCTIONS[functionId];
    if (!sim || !ctx.graph || !elements.graphCanvas) return;
    const w = elements.graphCanvas.offsetWidth;
    const h = elements.graphCanvas.offsetHeight;
    ctx.graph.clearRect(0, 0, w, h);
    ctx.graph.fillStyle = state.theme === 'dark' ? '#050505' : '#ffffff';
    ctx.graph.fillRect(0, 0, w, h);
    drawAxes(ctx.graph, w, h, sim.range || sim.viewBox);
    drawSimCurve(ctx.graph, sim, w, h, 1, sim.varA.default, sim.varB.default);
    clearWaveform();
    updateHud(sim, sim.varA.default, sim.varB.default, null);
}

export function startConstantsSim(functionId) {
    const sim = CSIM_FUNCTIONS[functionId];
    if (!sim) return;
    ensureAudio(sim);
    stopConstantsSim({ keepAudio: true });
    simAudio.functionId = functionId;
    simAudio.startedAt = performance.now();
    if (simAudio.context.state === 'suspended') simAudio.context.resume();
    simAudio.master.gain.setTargetAtTime(Math.max(0.001, state.volume * 1.15), simAudio.context.currentTime, 0.04);
    tick();
}

export function stopConstantsSim(options = {}) {
    if (simAudio.rafId !== null) { cancelAnimationFrame(simAudio.rafId); simAudio.rafId = null; }
    if (!options.keepAudio && simAudio.master) simAudio.master.gain.setTargetAtTime(0.0001, simAudio.context.currentTime, 0.04);
    if (!options.keepHud && elements.simHud) elements.simHud.hidden = true;
}

export function resetConstantsSim(functionId) { stopConstantsSim(); drawConstantsSimStatic(functionId); }

function ensureAudio(sim) {
    if (!simAudio.context) {
        const AC = window.AudioContext || window.webkitAudioContext;
        simAudio.context = new AC();
        simAudio.master = simAudio.context.createGain();
        simAudio.filter = simAudio.context.createBiquadFilter();
        simAudio.analyser = simAudio.context.createAnalyser();
        simAudio.filter.type = 'lowpass'; simAudio.filter.frequency.value = 3600;
        simAudio.filter.connect(simAudio.analyser); simAudio.analyser.connect(simAudio.master);
        simAudio.master.connect(simAudio.context.destination);
    }
    if (!simAudio.osc) {
        simAudio.osc = simAudio.context.createOscillator();
        simAudio.gain = simAudio.context.createGain();
        simAudio.osc.type = 'sine'; simAudio.gain.gain.value = 0.0001;
        simAudio.osc.connect(simAudio.gain); simAudio.gain.connect(simAudio.filter);
        simAudio.osc.start();
    }
}

function tick() {
    const sim = CSIM_FUNCTIONS[simAudio.functionId];
    if (!sim) return;
    const now = performance.now();
    const elapsed = (now - simAudio.startedAt) * state.speed;
    const drawProgress = Math.min(1, elapsed / sim.drawMs);
    const animateProgress = Math.max(0, (elapsed - sim.drawMs) / Math.max(1, sim.durationMs - sim.drawMs));

    const phaseProgress = (animateProgress * 2) % 1;
    let valA, valB;
    const cycle = Math.sin(phaseProgress * Math.PI * 2);

    if (animateProgress <= 0) {
        valA = sim.varA.default; valB = sim.varB.default;
    } else if (animateProgress < 0.5) {
        const diffA = cycle > 0 ? (sim.varA.max - sim.varA.default) : (sim.varA.default - sim.varA.min);
        valA = sim.varA.default + diffA * cycle; valB = sim.varB.default;
    } else {
        const diffB = cycle > 0 ? (sim.varB.max - sim.varB.default) : (sim.varB.default - sim.varB.min);
        valA = sim.varA.default; valB = sim.varB.default + diffB * cycle;
    }

    state.drawProgress = drawProgress;
    drawFrame(sim, drawProgress, valA, valB);
    updateAudio(sim, drawProgress, valA, valB);
    drawWaveform();
    updateHud(sim, valA, valB, animateProgress < 0.5);
    simAudio.rafId = requestAnimationFrame(tick);
}

function drawFrame(sim, progress, valA, valB) {
    const w = elements.graphCanvas.offsetWidth;
    const h = elements.graphCanvas.offsetHeight;
    ctx.graph.clearRect(0, 0, w, h);
    ctx.graph.fillStyle = state.theme === 'dark' ? '#050505' : '#ffffff';
    ctx.graph.fillRect(0, 0, w, h);
    drawAxes(ctx.graph, w, h, sim.range || sim.viewBox);
    drawSimCurve(ctx.graph, sim, w, h, progress, valA, valB);
}

function drawSimCurve(graphCtx, sim, width, height, progress, valA, valB) {
    const bounds = sim.range || sim.viewBox;
    const { xMin, xMax, yMin, yMax } = bounds;
    const totalSteps = (sim.type === 'cartesian') ? 2200 : 3000;
    const steps = Math.max(2, Math.floor(totalSteps * progress));
    
    graphCtx.beginPath();
    graphCtx.lineWidth = 2.8;
    graphCtx.strokeStyle = getSimColor();
    graphCtx.lineJoin = 'round'; graphCtx.lineCap = 'round';

    let first = true;
    for (let i = 0; i <= steps; i++) {
        let x, y;
        const p = i / totalSteps;
        if (sim.type === 'cartesian') {
            x = xMin + p * (xMax - xMin); y = sim.fn(x, valA, valB);
        } else if (sim.type === 'parametric') {
            const t = sim.tRange.min + p * (sim.tRange.max - sim.tRange.min);
            x = sim.x(t, valA, valB); y = sim.y(t, valA, valB);
        } else if (sim.type === 'polar') {
            const theta = sim.tRange.min + p * (sim.tRange.max - sim.tRange.min);
            const r = sim.r(theta, valA, valB);
            x = r * Math.cos(theta); y = r * Math.sin(theta);
        }

        if (!Number.isFinite(x) || !Number.isFinite(y)) { first = true; continue; }
        const px = ((x - xMin) / (xMax - xMin)) * width;
        const py = ((yMax - y) / (yMax - yMin)) * height;
        if (first) { graphCtx.moveTo(px, py); first = false; } else { graphCtx.lineTo(px, py); }
    }
    graphCtx.stroke();
}

function updateAudio(sim, progress, valA, valB) {
    if (!simAudio.osc) return;
    const now = simAudio.context.currentTime;
    const motion = sampleMotion(sim, progress, valA, valB);
    const travel = progress * 2 - 1;

    // Dynamic Base Frequency: Modulate baseFreq by varB if it represents Frequency or Density
    let dynamicBase = sim.baseFreq || 220;
    const bName = (sim.varB.name || '').toLowerCase();
    const aName = (sim.varA.name || '').toLowerCase();

    if (bName.includes('freq') || bName.includes('dens') || bName.includes('petals')) {
        if (sim.varB.max > 20) {
            dynamicBase *= (1 + valB / 100);
        } else {
            dynamicBase *= (valB / sim.varB.default);
        }
    }
    
    const intensityMod = (aName.includes('size') || aName.includes('intens') || aName.includes('scale')) ? valA : 1;

    const pitch = travel * 60 + motion.position * (sim.audioScale || 120) + motion.velocity * 120 + motion.jump * 200;
    const freq = Math.max(40, Math.min(4000, dynamicBase + pitch));
    
    simAudio.osc.frequency.setTargetAtTime(freq, now, 0.04);
    
    const baseGain = (0.25 + motion.velocity * 0.6) * state.volume;
    const finalGain = Math.max(0.0001, baseGain * (0.5 + intensityMod * 0.5));
    simAudio.gain.gain.setTargetAtTime(finalGain, now, 0.04);

    if (simAudio.filter) {
        const filterBase = 800 * intensityMod;
        const f = filterBase + (motion.curvature * 2 + motion.jump) * 5000;
        simAudio.filter.frequency.setTargetAtTime(Math.min(14000, f), now, 0.06);
    }
}

function sampleMotion(sim, progress, valA, valB) {
    const dt = 0.004;
    const p1 = pointForSim(sim, progress, valA, valB);
    const p0 = pointForSim(sim, Math.max(0, progress - dt), valA, valB);
    const p2 = pointForSim(sim, Math.min(1, progress + dt), valA, valB);
    const velocity = Math.min(1, Math.hypot(p1.x - p0.x, p1.y - p0.y) / dt / 15);
    const jump = Math.min(1, Math.abs(p1.soundY - p0.soundY) * 1.5);
    const a1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const a2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const curvature = Math.abs(Math.atan2(Math.sin(a2-a1), Math.cos(a2-a1))) / Math.PI;
    return { position: p1.soundY, velocity, jump, curvature };
}

function pointForSim(sim, progress, valA, valB) {
    const bounds = sim.range || sim.viewBox;
    let x, y;
    if (sim.type === 'cartesian') {
        x = bounds.xMin + progress * (bounds.xMax - bounds.xMin); y = sim.fn(x, valA, valB);
    } else if (sim.type === 'parametric') {
        const t = sim.tRange.min + progress * (sim.tRange.max - sim.tRange.min);
        x = sim.x(t, valA, valB); y = sim.y(t, valA, valB);
    } else if (sim.type === 'polar') {
        const theta = sim.tRange.min + progress * (sim.tRange.max - sim.tRange.min);
        const r = sim.r(theta, valA, valB); x = r * Math.cos(theta); y = r * Math.sin(theta);
    }
    const soundY = (y - bounds.yMin) / (bounds.yMax - bounds.yMin) * 2 - 1;
    return { x, y, soundY: isFinite(soundY) ? soundY : 0 };
}

function updateHud(sim, valA, valB, isPhaseA) {
    if (!elements.simHud) return;
    elements.simHud.hidden = false;
    if (elements.simHudA) elements.simHudA.textContent = `${sim.varA.name} = ${valA.toFixed(2)} ${isPhaseA ? '✦' : ''}`;
    if (elements.simHudLayers) elements.simHudLayers.textContent = `${sim.varB.name} = ${valB.toFixed(2)} ${!isPhaseA && isPhaseA !== null ? '✦' : ''}`;
}

function clearWaveform() {
    if (!elements.waveformCanvas || !ctx.waveform) return;
    ctx.waveform.fillStyle = state.theme === 'dark' ? '#1e293b' : '#f3f4f6';
    ctx.waveform.fillRect(0, 0, elements.waveformCanvas.width, elements.waveformCanvas.height);
}

function drawWaveform() {
    if (!simAudio.analyser || !elements.waveformCanvas) return;
    const w = elements.waveformCanvas.width, h = elements.waveformCanvas.height, wCtx = ctx.waveform;
    const data = new Uint8Array(simAudio.analyser.frequencyBinCount);
    simAudio.analyser.getByteTimeDomainData(data);
    wCtx.fillStyle = state.theme === 'dark' ? '#1e293b' : '#f3f4f6'; wCtx.fillRect(0, 0, w, h);
    wCtx.lineWidth = 1.5; wCtx.strokeStyle = getSimColor(); wCtx.beginPath();
    const slice = w / data.length; let x = 0;
    for (let i = 0; i < data.length; i++) {
        const y = (data[i] / 128.0) * h / 2;
        if (i === 0) wCtx.moveTo(x, y); else wCtx.lineTo(x, y);
        x += slice;
    }
    wCtx.stroke();
}

function drawAxes(graphCtx, width, height, range) {
    const { xMin, xMax, yMin, yMax } = range;
    const originX = ((-xMin) / (xMax - xMin)) * width, originY = (yMax / (yMax - yMin)) * height;
    graphCtx.strokeStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    graphCtx.lineWidth = 1; graphCtx.beginPath();
    graphCtx.moveTo(0, originY); graphCtx.lineTo(width, originY); graphCtx.stroke();
    graphCtx.beginPath(); graphCtx.moveTo(originX, 0); graphCtx.lineTo(originX, height); graphCtx.stroke();
}
