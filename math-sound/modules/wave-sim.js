// wave-sim.js - Independent Waves Module

export const WAVE_CATEGORIES = {
    'waves-1-plus': {
        name: '🌊 Waves 1+',
        functions: [
            'sineMultiSim', 'pulseHarmonicsSim', 'wavePacketSim', 
            'squareFourierSim', 'sawtoothFourierSim', 'triangleSim', 'softHarmonicsSim',
            'chebyshevFoldSim', 'weierstrassFractalSim'
        ]
    },
    'waves-2-plus': {
        name: '🌊 Waves 2+',
        functions: [
            'pulsePwmSim', 'steppyQuantizeSim', 'tanhTanClipSim', 'dampedDecaySim',
            'chaosInterferenceSim', 'chirpSweepSim', 'bouncingRectifierSim', 'gaborWaveletSim'
        ]
    }
};

export const WAVE_FUNCTIONS = {
    // ------------------------------------------
    // Waves 1+ (Harmonics & Math)
    // ------------------------------------------
    sineMultiSim: {
        id: 'sineMultiSim', category: 'waves-1-plus', name: 'Sine Multi Sim', type: 'cartesian',
        formula: 'y = Σ sin(x + i·b/10)',
        latex: 'y = \\sum_{i=1}^{a} \\sin(x + \\frac{i \\cdot b}{10})',
        range: { xMin: -6.28, xMax: 6.28, yMin: -30, yMax: 30 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Layers', min: 1, max: 100, default: 10 },
        varB: { name: 'Phase', min: 0, max: 20, default: 2 },
        fn: (x, a, b) => {
            let s = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 1; i <= n; i++) s += Math.sin(x + (i * b) / 10);
            if (frac > 0) s += frac * Math.sin(x + ((n + 1) * b) / 10);
            return s;
        },
        audioScale: 150, baseFreq: 220
    },
    pulseHarmonicsSim: {
        id: 'pulseHarmonicsSim', category: 'waves-1-plus', name: 'Pulse Harmonics Sim', type: 'cartesian',
        formula: 'y = Σ sin(i·x + b)',
        latex: 'y = \\sum_{i=1}^{a} \\sin(i \\cdot x + b)',
        range: { xMin: -6.28, xMax: 6.28, yMin: -30, yMax: 30 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Harmonics', min: 1, max: 100, default: 10 },
        varB: { name: 'Phase Shift', min: -20, max: 20, default: 0 },
        fn: (x, a, b) => {
            let s = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 1; i <= n; i++) s += Math.sin(i * x + b);
            if (frac > 0) s += frac * Math.sin((n + 1) * x + b);
            return s;
        },
        audioScale: 150, baseFreq: 220
    },
    wavePacketSim: {
        id: 'wavePacketSim', category: 'waves-1-plus', name: 'Wave Packet Sim', type: 'cartesian',
        formula: 'y = Σ sin(x·(1 + i·b/10))',
        latex: 'y = \\sum_{i=1}^{a} \\sin\\left(x \\cdot \\left(1 + \\frac{i \\cdot b}{10}\\right)\\right)',
        range: { xMin: -31.4, xMax: 31.4, yMin: -30, yMax: 30 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Waves', min: 1, max: 100, default: 10 },
        varB: { name: 'Freq Spread', min: 0, max: 10, default: 1 },
        fn: (x, a, b) => {
            let s = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 1; i <= n; i++) s += Math.sin(x * (1 + (i * b) / 10));
            if (frac > 0) s += frac * Math.sin(x * (1 + ((n + 1) * b) / 10));
            return s;
        },
        audioScale: 150, baseFreq: 220
    },
    squareFourierSim: {
        id: 'squareFourierSim', category: 'waves-1-plus', name: 'Square Fourier Sim', type: 'cartesian',
        formula: 'y = Σ sin((2n+1)bx)/(2n+1)',
        latex: 'y = \\frac{4}{\\pi}\\sum_{n=0}^{a} \\frac{\\sin((2n+1)bx)}{2n+1}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Harmonics', min: 0, max: 100, default: 5 },
        varB: { name: 'Frequency', min: 0.1, max: 24, default: 1 },
        fn: (x, a, b) => {
            let sq = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 0; i <= n; i++) { const k = 2 * i + 1; sq += Math.sin(k * b * x) / k; }
            if (frac > 0) { const k = 2 * (n + 1) + 1; sq += frac * Math.sin(k * b * x) / k; }
            return (4 / Math.PI) * sq;
        },
        audioScale: 180, baseFreq: 260
    },
    sawtoothFourierSim: {
        id: 'sawtoothFourierSim', category: 'waves-1-plus', name: 'Sawtooth Fourier Sim', type: 'cartesian',
        formula: 'y = Σ sin(nbx)/n',
        latex: 'y = \\frac{2}{\\pi}\\sum_{n=1}^{a} \\frac{\\sin(nbx)}{n}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Harmonics', min: 1, max: 100, default: 5 },
        varB: { name: 'Frequency', min: 0.1, max: 24, default: 1 },
        fn: (x, a, b) => {
            let sw = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 1; i <= n; i++) sw += Math.sin(i * b * x) / i;
            if (frac > 0) sw += frac * Math.sin((n + 1) * b * x) / (n + 1);
            return (2 / Math.PI) * sw;
        },
        audioScale: 160, baseFreq: 240
    },
    triangleSim: {
        id: 'triangleSim', category: 'waves-1-plus', name: 'Triangle Sim', type: 'cartesian',
        formula: 'y = a · triangle(bx)',
        latex: 'y = a \\cdot (\\operatorname{abs}(4 \\cdot \\operatorname{frac}(xb - 0.25) - 2) - 1)',
        range: { xMin: -6.28, xMax: 6.28, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Amplitude', min: 0.5, max: 15, default: 5 },
        varB: { name: 'Frequency', min: 0.1, max: 30, default: 2 },
        fn: (x, a, b) => {
            const t = (x * b / (2 * Math.PI) - 0.25);
            return a * (Math.abs(4 * ((t % 1 + 1) % 1) - 2) - 1);
        },
        audioScale: 140, baseFreq: 220
    },
    softHarmonicsSim: {
        id: 'softHarmonicsSim', category: 'waves-1-plus', name: 'Soft Harmonics Sim', type: 'cartesian',
        formula: 'y = Σ tanh(sin(ibx))/i',
        latex: 'y = \\sum_{i=1}^{a} \\frac{\\tanh(\\sin(ibx))}{i}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -3, yMax: 3 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Layers', min: 1, max: 100, default: 5 },
        varB: { name: 'Frequency', min: 0.1, max: 24, default: 1 },
        fn: (x, a, b) => {
            let sf = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 1; i <= n; i++) sf += Math.tanh(Math.sin(i * b * x)) / i;
            if (frac > 0) sf += frac * Math.tanh(Math.sin((n + 1) * b * x)) / (n + 1);
            return sf;
        },
        audioScale: 110, baseFreq: 200
    },
    chebyshevFoldSim: {
        id: 'chebyshevFoldSim', category: 'waves-1-plus', name: 'Chebyshev Fold Sim', type: 'cartesian',
        formula: 'y = cos(a·arccos(sin(bx)))',
        latex: 'y = \\cos(a \\cdot \\arccos(\\sin(bx)))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Degree', min: 1, max: 20, default: 3 },
        varB: { name: 'Frequency', min: 0.1, max: 10, default: 1 },
        fn: (x, a, b) => Math.cos(a * Math.acos(Math.sin(b * x))),
        audioScale: 150, baseFreq: 220
    },
    weierstrassFractalSim: {
        id: 'weierstrassFractalSim', category: 'waves-1-plus', name: 'Weierstrass Fractal Sim', type: 'cartesian',
        formula: 'y = Σ sin(2^i·bx) / 2^i',
        latex: 'y = \\sum_{i=0}^{a} \\frac{\\sin(2^i bx)}{2^i}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2.5, yMax: 2.5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Detail', min: 1, max: 15, default: 5 },
        varB: { name: 'Frequency', min: 0.1, max: 10, default: 1 },
        fn: (x, a, b) => {
            let s = 0; const n = Math.floor(a); const frac = a - n;
            for (let i = 0; i <= n; i++) s += Math.sin(Math.pow(2, i) * b * x) / Math.pow(2, i);
            if (frac > 0) s += frac * Math.sin(Math.pow(2, n + 1) * b * x) / Math.pow(2, n + 1);
            return s;
        },
        audioScale: 180, baseFreq: 130
    },

    // ------------------------------------------
    // Waves 2+ (Physics & FX)
    // ------------------------------------------
    pulsePwmSim: {
        id: 'pulsePwmSim', category: 'waves-2-plus', name: 'Pulse PWM Sim', type: 'cartesian',
        formula: 'y = sgn(sin bx + cos a)',
        latex: 'y = \\operatorname{sgn}(\\sin(bx) + \\cos(a))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Pulse Width', min: 0, max: Math.PI, default: Math.PI/2 },
        varB: { name: 'Frequency', min: 0.1, max: 24, default: 1 },
        fn: (x, a, b) => Math.sign(Math.sin(b * x) + Math.cos(a)),
        audioScale: 200, baseFreq: 110
    },
    steppyQuantizeSim: {
        id: 'steppyQuantizeSim', category: 'waves-2-plus', name: 'Steppy Quantize Sim', type: 'cartesian',
        formula: 'y = floor(a·sin bx)/a',
        latex: 'y = \\frac{\\lfloor a \\cdot \\sin(bx) \\rfloor}{a}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Steps', min: 1, max: 100, default: 4 },
        varB: { name: 'Frequency', min: 0.1, max: 24, default: 1 },
        fn: (x, a, b) => Math.floor(a * Math.sin(b * x)) / Math.max(1, a),
        audioScale: 170, baseFreq: 180
    },
    tanhTanClipSim: {
        id: 'tanhTanClipSim', category: 'waves-2-plus', name: 'Tanh-Tan Clip Sim', type: 'cartesian',
        formula: 'y = 3·tanh(a·tan bx)',
        latex: 'y = 3 \\tanh(a \\cdot \\tan(bx))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -4, yMax: 4 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Gain', min: 0.1, max: 50, default: 1 },
        varB: { name: 'Frequency', min: 0.1, max: 30, default: 1 },
        fn: (x, a, b) => 3 * Math.tanh(a * Math.tan(b * x)),
        audioScale: 100, baseFreq: 330
    },
    dampedDecaySim: {
        id: 'dampedDecaySim', category: 'waves-2-plus', name: 'Damped Decay Sim', type: 'cartesian',
        formula: 'y = a · e^(-0.2|x|) sin(bx)',
        latex: 'y = a e^{-0.2|x|} \\sin(bx)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Amplitude', min: 1, max: 20, default: 8 },
        varB: { name: 'Frequency', min: 0.1, max: 40, default: 4 },
        fn: (x, a, b) => a * Math.exp(-0.2 * Math.abs(x)) * Math.sin(b * x),
        audioScale: 120, baseFreq: 180
    },
    chaosInterferenceSim: {
        id: 'chaosInterferenceSim', category: 'waves-2-plus', name: 'Chaos Interference Sim', type: 'cartesian',
        formula: 'y = a · sin(bx) cos(3x)',
        latex: 'y = a \\sin(bx) \\cos(3x)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Amplitude', min: 1, max: 20, default: 5 },
        varB: { name: 'Frequency', min: 0.1, max: 50, default: 5 },
        fn: (x, a, b) => a * Math.sin(b * x) * Math.cos(3 * x),
        audioScale: 130, baseFreq: 220
    },
    chirpSweepSim: {
        id: 'chirpSweepSim', category: 'waves-2-plus', name: 'Chirp Sweep Sim', type: 'cartesian',
        formula: 'y = sin(b·e^(a·x))',
        latex: 'y = \\sin(b \\cdot e^{a \\cdot x})',
        range: { xMin: -5, xMax: 5, yMin: -2, yMax: 2 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Sweep Rate', min: 0.1, max: 1, default: 0.5 },
        varB: { name: 'Base Freq', min: 1, max: 30, default: 5 },
        fn: (x, a, b) => Math.sin(b * Math.exp(a * x)),
        audioScale: 150, baseFreq: 110
    },
    bouncingRectifierSim: {
        id: 'bouncingRectifierSim', category: 'waves-2-plus', name: 'Bouncing Rectifier Sim', type: 'cartesian',
        formula: 'y = a·|sin(bx)|',
        latex: 'y = a \\cdot |\\sin(bx)|',
        range: { xMin: -6.28, xMax: 6.28, yMin: -0.5, yMax: 3.5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Bounce', min: 0.5, max: 5, default: 2 },
        varB: { name: 'Frequency', min: 0.1, max: 10, default: 2 },
        fn: (x, a, b) => a * Math.abs(Math.sin(b * x)),
        audioScale: 200, baseFreq: 220
    },
    gaborWaveletSim: {
        id: 'gaborWaveletSim', category: 'waves-2-plus', name: 'Gabor Wavelet Sim', type: 'cartesian',
        formula: 'y = a·e^(-0.5·x²)·cos(bx)',
        latex: 'y = a e^{-0.5 x^2} \\cos(bx)',
        range: { xMin: -5, xMax: 5, yMin: -4, yMax: 4 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Energy', min: 0.5, max: 5, default: 3 },
        varB: { name: 'Wave Freq', min: 1, max: 50, default: 10 },
        fn: (x, a, b) => a * Math.exp(-0.5 * x * x) * Math.cos(b * x),
        audioScale: 180, baseFreq: 440
    }
};
