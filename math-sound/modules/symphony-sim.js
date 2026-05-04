import { state, elements, ctx } from './state.js';

export const SIM_CATEGORIES = {
    'amazing-plus': {
        name: '✨ Amazing+',
        functions: [
            'amazingPlusStandard',
            'amazingPlusExpanding',
            'amazingPlusEnvelope',
            'amazingPlusGridDistortion',
            'amazingPlusRadialWhirlpool',
            'amazingPlusResonance'
        ]
    },
    'beautiful-plus': {
        name: '💖 Beautiful+',
        functions: [
            'beautifulPlusSignIntro',
            'beautifulPlusSignTrace',
            'beautifulPlusDiagonal',
            'beautifulPlusSpinnyRose',
            'beautifulPlusPunkHair',
            'beautifulPlusUpAndDown',
            'beautifulPlusJaggedSineGcd',
            'beautifulPlusModuloJaggedWave',
            'beautifulPlusShurikenStar',
            'beautifulPlusLayeredBeauty',
            'beautifulPlusStepDuo',
            'beautifulPlusPolarBloom'
        ]
    },
    'harmonic-plus': {
        name: '🎼 Harmonic+',
        functions: [
            'harmonicPlusIntro',
            'harmonicPlusHighFreq',
            'harmonicPlusOvals',
            'harmonicPlusTangentMesh',
            'harmonicPlusCrown',
            'harmonicPlusExtreme',
            'harmonicPlusWebDuo',
            'harmonicPlusCrownMesh'
        ]
    },
    'fusion-plus': {
        name: '🌀 Fusion+',
        functions: [
            'fusionPlusGalaxy',
            'fusionPlusTanTwist',
            'fusionPlusSecant',
            'fusionPlusTanRise',
            'fusionPlusGeometricShift',
            'fusionPlusPulsatingPetal',
            'fusionPlusStarCore',
            'fusionPlusGalaxyCore',
            'fusionPlusTangentOscillator'
        ]
    },
    'hyper-plus': {
        name: '✨ Hyper+',
        functions: [
            'hyperPlusMillennialRose',
            'hyperPlusLissajous',
            'hyperPlusClover',
            'hyperPlusRealityBender',
            'hyperPlusDeadpool',
            'hyperPlusRoseClover',
            'hyperPlusRealityWeave',
            'hyperPlusRoseDeadpool'
        ]
    },
    'insane-plus': {
        name: '👹 Insane+',
        functions: [
            'insanePlusTrigTomfoolery',
            'insanePlusSecantTwist',
            'insanePlusInverseFractal',
            'insanePlusUnlimitedStar',
            'insanePlusArachnidWeb',
            'insanePlusPowerSun',
            'insanePlusMasterpiece',
            'insanePlusTrigMasterpiece',
            'insanePlusWebTwist',
            'insanePlusFractalStar'
        ]
    },
    'fantastic-plus': {
        name: '✨ Fantastic+',
        functions: [
            'fantasticPlusRelativePrimality',
            'fantasticPlusCellularTrig',
            'fantasticPlusInterferenceMesh',
            'fantasticPlusGrid',
            'fantasticPlusUltimateGcd'
        ]
    },
    'incredible-plus': {
        name: '🌟 Incredible+',
        functions: [
            'incrediblePlusDynamicInterference',
            'incrediblePlusSurfaceRipple',
            'incrediblePlusGlobalGate',
            'incrediblePlusConcentric',
            'incrediblePlusChaosStar'
        ]
    },
    'incomprehensible-plus': {
        name: '🤯 Incomprehensible+',
        functions: [
            'incomprehensiblePlusSaturn',
            'incomprehensiblePlusWaveTangent',
            'incomprehensiblePlusRotatingOvals',
            'incomprehensiblePlusEight',
            'incomprehensiblePlusFinalDense',
            'incomprehensiblePlusSaturnWave',
            'incomprehensiblePlusSaturnOvals'
        ]
    },
};

const TIGHT_RANGE = { xMin: -10, xMax: 10, yMin: -2, yMax: 2 };
const WIDE_RANGE = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };
const GRID_RANGE = { xMin: -18, xMax: 18, yMin: -18, yMax: 18 };
const RADIAL_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const DIAGONAL_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const ROSE_RANGE = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
const PUNK_RANGE = { xMin: -10, xMax: 10, yMin: -12, yMax: 12 };
const JAGGED_RANGE = { xMin: -10, xMax: 10, yMin: -12, yMax: 12 };
const MODULO_RANGE = { xMin: -10, xMax: 10, yMin: -4, yMax: 4 };
const SHURIKEN_RANGE = { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 };
const LAYERED_BEAUTY_RANGE = { xMin: -15, xMax: 15, yMin: -15, yMax: 15 };
const HARMONIC_INTRO_RANGE = { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 };
const HARMONIC_HIGH_RANGE = { xMin: -1.2, xMax: 1.2, yMin: -1.2, yMax: 1.2 };
const HARMONIC_OVAL_RANGE = { xMin: -2.2, xMax: 2.2, yMin: -1.2, yMax: 1.2 };
const HARMONIC_MESH_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const HARMONIC_EXTREME_RANGE = { xMin: -15, xMax: 15, yMin: -15, yMax: 15 };
const FUSION_GALAXY_RANGE = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const FUSION_TAN_TWIST_RANGE = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };
const FUSION_SECANT_RANGE = { xMin: -5, xMax: 5, yMin: -2, yMax: 2 };
const FUSION_IMPLICIT_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const FUSION_PETAL_RANGE = { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
const HYPER_SMALL_RANGE = { xMin: -1.2, xMax: 1.2, yMin: -1.2, yMax: 1.2 };
const HYPER_LISSAJOUS_RANGE = { xMin: -2.5, xMax: 2.5, yMin: -1.8, yMax: 1.8 };
const HYPER_CLOVER_RANGE = { xMin: -2.5, xMax: 2.5, yMin: -2.5, yMax: 2.5 };
const HYPER_REALITY_RANGE = { xMin: -10, xMax: 10, yMin: -18, yMax: 18 };
const HYPER_REALITY_WEAVE_RANGE = { xMin: -3.2, xMax: 3.2, yMin: -2.4, yMax: 2.4 };
const HYPER_DEADPOOL_RANGE = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 };
const INSANE_SMALL_RANGE = { xMin: -1.2, xMax: 1.2, yMin: -1.2, yMax: 1.2 };
const INSANE_WIDE_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const INSANE_FRACTAL_RANGE = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const INSANE_STAR_RANGE = { xMin: -15, xMax: 15, yMin: -15, yMax: 15 };
const INSANE_WEB_RANGE = { xMin: -12, xMax: 12, yMin: -12, yMax: 12 };
const INSANE_SUN_RANGE = { xMin: -8, xMax: 8, yMin: -8, yMax: 8 };
const FANTASTIC_10_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const FANTASTIC_8_RANGE = { xMin: -8, xMax: 8, yMin: -8, yMax: 8 };
const FANTASTIC_6_RANGE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
const FANTASTIC_5_RANGE = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };
const FANTASTIC_4_RANGE = { xMin: -4, xMax: 4, yMin: -4, yMax: 4 };
const INCR_5_RANGE = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };
const INCR_10_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const INCR_15_RANGE = { xMin: -15, xMax: 15, yMin: -15, yMax: 15 };
const INCR_8_RANGE = { xMin: -8, xMax: 8, yMin: -8, yMax: 8 };
const INCOMP_SATURN_RANGE = { xMin: -2, xMax: 2, yMin: -4, yMax: 4 };
const INCOMP_WAVE_RANGE = { xMin: -3, xMax: 3, yMin: -10, yMax: 10 };
const INCOMP_OVAL_RANGE = { xMin: -3, xMax: 3, yMin: -2, yMax: 2 };
const INCOMP_BIG_RANGE = { xMin: -15, xMax: 15, yMin: -15, yMax: 15 };
const INCOMP_DENSE_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const BASE_TIMING = { durationMs: 16000, drawMs: 6000 };
const COLOR_PALETTE = [342, 28, 52, 145, 190, 224, 266, 310];
const BASE_LAYERS = {
    standard: {
        id: 'standard',
        label: 'Standard Resonance',
        color: '#ff3b5f',
        baseFreq: 220,
        audioScale: 150,
        gain: 0.38,
        sonicProfile: 'motion',
        fn: (x, a) => Math.cos(a * x)
    },
    expanding: {
        id: 'expanding',
        label: 'Expanding Resonance',
        color: '#00f5ff',
        baseFreq: 260,
        audioScale: 120,
        gain: 0.34,
        sonicProfile: 'motion',
        fn: (x, a) => (x / 5) * Math.cos(a * x)
    },
    envelope: {
        id: 'envelope',
        label: 'Envelope Modulation',
        color: '#fff45c',
        baseFreq: 330,
        audioScale: 180,
        gain: 0.32,
        sonicProfile: 'motion',
        fn: (x, a) => Math.cos(x) * Math.cos(a * x)
    },
    grid: {
        id: 'grid',
        label: 'Grid Distortion',
        type: 'parametric',
        color: '#a855f7',
        baseFreq: 440,
        audioScale: 100,
        gain: 0.3,
        sonicProfile: 'motion',
        tRange: { min: 0, max: 1 },
        x: (t, a) => {
            const aa = Math.max(1, a * 0.5);
            const segments = 20;
            const segmentIdx = Math.min(segments - 1, Math.floor(t * segments));
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / aa);
            return isHorizontal ? (subT - 0.5) * 40 : pos;
        },
        y: (t, a) => {
            const aa = Math.max(1, a * 0.5);
            const segments = 20;
            const segmentIdx = Math.min(segments - 1, Math.floor(t * segments));
            const subT = (t * segments) % 1;
            const line = Math.floor(segmentIdx / 2);
            const isHorizontal = segmentIdx % 2 === 0;
            const pos = (line - (segments / 4)) * (Math.PI / aa);
            return isHorizontal ? pos : (subT - 0.5) * 40;
        },
        audioY: (t, a) => {
            const dt = 0.002;
            const t0 = Math.max(0, t - dt);
            const t1 = Math.min(1, t + dt);
            const x0 = BASE_LAYERS.grid.x(t0, a);
            const y0 = BASE_LAYERS.grid.y(t0, a);
            const x1 = BASE_LAYERS.grid.x(t1, a);
            const y1 = BASE_LAYERS.grid.y(t1, a);
            const speed = Math.hypot(x1 - x0, y1 - y0) / Math.max(0.0001, t1 - t0);
            const density = Math.min(1, Math.max(0, (a - 1) / 30));
            const turn = Math.abs(Math.atan2(y1 - y0, x1 - x0)) / Math.PI;
            return Math.sin(speed * 0.025 + density * Math.PI * 2) * 0.65 + (turn - 0.5) * 0.55;
        }
    },
    radial: {
        id: 'radial',
        label: 'Radial Whirlpool',
        type: 'implicit',
        color: '#22c55e',
        baseFreq: 220,
        audioScale: 160,
        gain: 0.32,
        sonicProfile: 'density',
        f: (x, y, a) => {
            const aa = 5 + a * 1.6;
            return y - 4.8 * Math.cos((aa * x * y) / (x * x + y * y + 0.1));
        }
    },
    signIntro: {
        id: 'signIntro',
        label: 'The Signum Glitch',
        color: '#fb7185',
        baseFreq: 110,
        audioScale: 200,
        gain: 0.34,
        sonicProfile: 'stepped',
        fn: (x, a) => Math.sign(Math.sin(beautifulPhase(a, 1, 10) * x / 4))
    },
    signTrace: {
        id: 'signTrace',
        label: 'Dancing Sign Trace',
        type: 'parametric',
        color: '#f472b6',
        baseFreq: 105,
        audioScale: 180,
        gain: 0.32,
        sonicProfile: 'stepped',
        tRange: { min: -10, max: 10 },
        x: (t, a) => t * Math.cos(beautifulPhase(a, 1, 6.5) * 0.1),
        y: (t, a) => Math.sign(Math.sin(beautifulPhase(a, 1, 10) * t))
    },
    diagonal: {
        id: 'diagonal',
        label: 'Oscillating Diagonal',
        type: 'parametric',
        color: '#38bdf8',
        baseFreq: 120,
        audioScale: 110,
        gain: 0.3,
        sonicProfile: 'takeoff',
        tRange: { min: -10, max: 10 },
        x: (t) => t,
        y: (t, a) => {
            const v = beautifulPhase(a, 0, 2.8);
            return t + Math.sin(v * t);
        },
        audioY: (t, a) => {
            const v = beautifulPhase(a, 0, 2.8);
            const wave = Math.sin(v * t);
            const motion = Math.cos(v * t) * v;
            return wave * 0.72 + Math.tanh(motion) * 0.28;
        }
    },
    spinnyRose: {
        id: 'spinnyRose',
        label: 'Mind Blowing Spinny',
        type: 'polar',
        color: '#c084fc',
        baseFreq: 220,
        audioScale: 180,
        gain: 0.3,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 4 * Math.PI },
        lineWidth: 1.8,
        r: (theta, a) => {
            const v = beautifulPhase(a, 0, 5);
            const n = 6;
            return Math.sign(Math.cos(n * theta + 3 * v)) + Math.sin((v * theta) / 20);
        }
    },
    punkHair: {
        id: 'punkHair',
        label: 'Punk Hair Laser',
        color: '#f59e0b',
        baseFreq: 180,
        audioScale: 100,
        gain: 0.31,
        sonicProfile: 'stepped',
        fn: (x, a) => {
            const v = beautifulPhase(a, 0, Math.PI * 1.75);
            const tanVal = Math.tan(x + v) + v;
            const cscVal = 1 / Math.sin(tanVal);
            return x * Math.sign(cscVal) + Math.cos(x);
        }
    },
    upAndDown: {
        id: 'upAndDown',
        label: 'Up and Down',
        type: 'implicit',
        color: '#14b8a6',
        baseFreq: 150,
        audioScale: 160,
        gain: 0.32,
        sonicProfile: 'density',
        f: (x, y, a) => {
            const v = -8 + beautifulPhase(a, 0, 1) * 16;
            return y - (v * Math.sign(v * x - y) + Math.cos(v + x));
        }
    },
    jaggedSineGcd: {
        id: 'jaggedSineGcd',
        label: 'Jagged Sine GCD',
        color: '#ef4444',
        baseFreq: 140,
        audioScale: 90,
        gain: 0.33,
        sonicProfile: 'stepped',
        fn: (x, a) => {
            const v = beautifulPhase(a, 1, 10);
            return gcd(Math.round(v * x)) * Math.sign(Math.sin(x)) - Math.sin(x);
        }
    },
    moduloJaggedWave: {
        id: 'moduloJaggedWave',
        label: 'Modulo Jagged Wave',
        color: '#84cc16',
        baseFreq: 165,
        audioScale: 170,
        gain: 0.33,
        sonicProfile: 'stepped',
        fn: (x, a) => {
            const v = 0.19 + beautifulPhase(a, 0, 1) * 1.98;
            const mod = ((8 * x) % v + v) % v;
            return 2 * Math.sign(Math.sin(x - v)) + mod - Math.sin(x + v);
        }
    },
    shurikenStar: {
        id: 'shurikenStar',
        label: 'Shuriken Star',
        type: 'polar',
        color: '#60a5fa',
        baseFreq: 260,
        audioScale: 160,
        gain: 0.31,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => {
            const v = beautifulPhase(a, 0, 7.5);
            const k = 5;
            return Math.sign(Math.cos(k * theta - v)) + Math.sin(v + (k + 0.05) * theta) * Math.cos(v);
        }
    },
    layeredBeauty: {
        id: 'layeredBeauty',
        label: 'Layered Beauty',
        type: 'polar',
        color: '#f97316',
        baseFreq: 200,
        audioScale: 120,
        gain: 0.29,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => {
            const v = beautifulPhase(a, 0, 5.4);
            const layers = [2, 4, 6, 8, 10];
            const layer = layers[Math.min(layers.length - 1, Math.floor(beautifulPhase(a, 0, layers.length - 0.001)))];
            return layer * Math.sign(Math.cos(3 * theta - layer * v)) + Math.sin(v + 3 * theta + layer) - Math.cos(v);
        }
    },
    harmonicIntro: {
        id: 'harmonicIntro',
        label: 'Harmonic Intro',
        type: 'parametric',
        color: '#818cf8',
        baseFreq: 220,
        audioScale: 150,
        gain: 0.31,
        sonicProfile: 'spin',
        tRange: { min: 0, max: 4 * Math.PI },
        x: (t) => Math.cos(t),
        y: (t, a) => Math.sin(harmonicPhase(a, 1, 15) * t / 2)
    },
    highFreqOscillator: {
        id: 'highFreqOscillator',
        label: 'High-Freq Web',
        type: 'parametric',
        color: '#22d3ee',
        baseFreq: 440,
        audioScale: 100,
        gain: 0.24,
        sonicProfile: 'spin',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t) => Math.cos(t),
        y: (t, a) => Math.sin(harmonicPhase(a, 50, 140) * t)
    },
    highFreqDuo: {
        id: 'highFreqDuo',
        label: 'High-Freq Web Duo',
        type: 'parametric',
        color: '#22d3ee',
        baseFreq: 440,
        audioScale: 100,
        gain: 0.24,
        sonicProfile: 'spin',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t) => Math.cos(t),
        y: (t, a) => Math.sin(harmonicPhase(a, 28, 78) * t)
    },
    harmonicOvals: {
        id: 'harmonicOvals',
        label: 'Harmonic Ovals',
        type: 'parametric',
        color: '#34d399',
        baseFreq: 180,
        audioScale: 120,
        gain: 0.3,
        sonicProfile: 'spin',
        tRange: { min: 0, max: 20 * Math.PI },
        x: (t, a) => Math.sin(harmonicPhase(a, 0.95, 1.04) * t) + Math.cos(t),
        y: (t) => Math.cos(t)
    },
    tangentMesh: {
        id: 'tangentMesh',
        label: 'Tangent Mesh',
        type: 'parametric',
        color: '#f472b6',
        baseFreq: 330,
        audioScale: 80,
        gain: 0.27,
        sonicProfile: 'density',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t, a) => Math.tan(harmonicPhase(a, 15, 24) * t),
        y: (t, a) => (1 / Math.cos(t)) + Math.sin(harmonicPhase(a, 30, 44) * t)
    },
    asymptoticCrown: {
        id: 'asymptoticCrown',
        label: 'The Crown',
        type: 'parametric',
        color: '#facc15',
        baseFreq: 440,
        audioScale: 70,
        gain: 0.24,
        sonicProfile: 'density',
        tRange: { min: 0, max: 50 * Math.PI },
        x: (t) => Math.tan(t),
        y: (t, a) => {
            const v = harmonicPhase(a, 0.9, 1.09);
            return (1 / Math.sin(t)) * Math.tan(v * t) - Math.sin(t);
        }
    },
    extremeHarmonic: {
        id: 'extremeHarmonic',
        label: 'Extreme Harmonic',
        type: 'parametric',
        color: '#fb923c',
        baseFreq: 220,
        audioScale: 100,
        gain: 0.25,
        sonicProfile: 'density',
        tRange: { min: 0, max: 4 * Math.PI },
        x: (t, a) => Math.tan(harmonicPhase(a, 20, 65) * t) + Math.cos(t),
        y: (t, a) => Math.tan(t) * Math.sin(harmonicPhase(a, 40, 85) * t)
    },
    cinematicGalaxy: {
        id: 'cinematicGalaxy',
        label: 'Cinematic Galaxy',
        type: 'polar',
        color: '#a78bfa',
        baseFreq: 180,
        audioScale: 140,
        gain: 0.29,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 20 * Math.PI },
        r: (theta, a) => {
            const v = fusionPhase(a, 0, Math.PI * 2);
            return Math.abs(1 / Math.cos(1.2 * theta + v)) + Math.sin(3 * v + Math.cos(1.2 * theta + Math.sin(1.2 * theta)));
        }
    },
    tanTwistMesh: {
        id: 'tanTwistMesh',
        label: 'Tan Twist Mesh',
        type: 'parametric',
        color: '#06b6d4',
        baseFreq: 240,
        audioScale: 90,
        gain: 0.28,
        sonicProfile: 'density',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t, a) => Math.tan(2 * t + fusionPhase(a, 0, 5.72)) + Math.cos(4 * t),
        y: (t) => Math.sin(3 * t) + Math.cos(5 * t)
    },
    secantOscillator: {
        id: 'secantOscillator',
        label: 'Secant Oscillator',
        type: 'parametric',
        color: '#10b981',
        baseFreq: 300,
        audioScale: 110,
        gain: 0.3,
        sonicProfile: 'motion',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t) => 1 / Math.cos(t),
        y: (t, a) => Math.sin(4 * t + Math.cos(2 * t) + Math.sin(3 * t) + fusionPhase(a, 0, Math.PI * 2))
    },
    tanRiseRidge: {
        id: 'tanRiseRidge',
        label: 'Tan Rise Ridge',
        color: '#f43f5e',
        baseFreq: 150,
        audioScale: 130,
        gain: 0.31,
        sonicProfile: 'density',
        fn: (x, a) => {
            const v = fusionPhase(a, 0, 5.85);
            return Math.tan(x + v) - Math.sin(10 * x + Math.cos(x));
        }
    },
    geometricShift: {
        id: 'geometricShift',
        label: 'Geometric Shift',
        type: 'implicit',
        color: '#eab308',
        baseFreq: 196,
        audioScale: 120,
        gain: 0.3,
        sonicProfile: 'density',
        f: (x, y, a) => {
            const v = fusionPhase(a, -2.5, 2.5);
            return Math.sin(x) - (v * Math.cos(y) + Math.sin(2 * x + v));
        }
    },
    pulsatingPetal: {
        id: 'pulsatingPetal',
        label: 'Pulsating Petal',
        type: 'polar',
        color: '#ec4899',
        baseFreq: 220,
        audioScale: 170,
        gain: 0.31,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => Math.sin(fusionPhase(a, -1.5, 1.3) + 4 * theta) + fusionPhase(a, -1.5, 1.3)
    },
    starCore: {
        id: 'starCore',
        label: 'Star Core',
        type: 'polar',
        color: '#f97316',
        baseFreq: 330,
        audioScale: 150,
        gain: 0.29,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 10 * Math.PI },
        r: (theta, a) => {
            const v = fusionPhase(a, 0, Math.PI * 2);
            return (6 * Math.sin(1.2 * theta) - Math.cos(6 * theta + v)) / 2;
        }
    },
    millennialRose: {
        id: 'millennialRose',
        label: 'Millennial Rose',
        type: 'polar',
        color: '#e879f9',
        baseFreq: 440,
        audioScale: 180,
        gain: 0.24,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => Math.sin((2025 * theta) / hyperPhase(a, 100, 35))
    },
    hyperLissajous: {
        id: 'hyperLissajous',
        label: 'Hyper Lissajous',
        type: 'parametric',
        color: '#38bdf8',
        baseFreq: 260,
        audioScale: 100,
        gain: 0.28,
        sonicProfile: 'motion',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t, a) => 2.2 * Math.cos(Math.sin(20 * t + hyperPhase(a, 1, Math.PI * 2 + 1)) + hyperPhase(a, 1, Math.PI * 2 + 1)),
        y: (t, a) => Math.sin(25 * t + hyperPhase(a, 1, Math.PI * 2 + 1))
    },
    amazingClover: {
        id: 'amazingClover',
        label: 'Amazing Clover',
        type: 'polar',
        color: '#4ade80',
        baseFreq: 220,
        audioScale: 140,
        gain: 0.28,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 40 * Math.PI },
        r: (theta, a) => Math.sin(2.025 * theta + hyperPhase(a, 0, 57)) + Math.cos(1.05 * theta)
    },
    realityBender: {
        id: 'realityBender',
        label: 'Reality Bender',
        color: '#facc15',
        baseFreq: 110,
        audioScale: 80,
        gain: 0.32,
        sonicProfile: 'stepped',
        fn: (x, a) => {
            const v = hyperPhase(a, 0, 7);
            return (gcd(Math.round(2025 * x)) % 5) + v * Math.sin(x) + Math.ceil(v * x) / 5;
        }
    },
    realityBenderLow: {
        id: 'realityBenderLow',
        label: 'Reality Bender Low',
        color: '#facc15',
        baseFreq: 74,
        audioScale: 48,
        gain: 0.24,
        sonicProfile: 'stepped',
        fn: (x, a) => {
            const v = hyperPhase(a, 0, 7);
            return ((gcd(Math.round(2025 * x)) % 5) + v * Math.sin(x) + Math.ceil(v * x) / 5) * 0.32;
        }
    },
    deadpoolGeometry: {
        id: 'deadpoolGeometry',
        label: 'Deadpool Geometry',
        type: 'polar',
        color: '#fb7185',
        baseFreq: 165,
        audioScale: 120,
        gain: 0.3,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => {
            const v = hyperPhase(a, 0, 23.864);
            const l = 2.025;
            return Math.abs(Math.sin(theta + l - v) - Math.ceil(2 * Math.sin(2 * theta + v + 1.55)));
        }
    },
    insaneTrigTomfoolery: {
        id: 'insaneTrigTomfoolery',
        label: 'Trig Tomfoolery',
        type: 'polar',
        color: '#f43f5e',
        baseFreq: 330,
        audioScale: 180,
        gain: 0.3,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => Math.sin(2 * theta + Math.sin(4 * theta * insanePhase(a, 0.314, 5.966)))
    },
    insaneSecantTwist: {
        id: 'insaneSecantTwist',
        label: 'Secant Plot Twist',
        type: 'polar',
        color: '#fb923c',
        baseFreq: 220,
        audioScale: 100,
        gain: 0.27,
        sonicProfile: 'density',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => 1 / Math.cos(3 * theta + 2 * Math.PI * insanePhase(a, 0, 5.966) * Math.sin(theta))
    },
    insaneInverseFractal: {
        id: 'insaneInverseFractal',
        label: 'Inverse Fractal',
        type: 'polar',
        color: '#a78bfa',
        baseFreq: 110,
        audioScale: 150,
        gain: 0.28,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 40 * Math.PI },
        r: (theta, a) => {
            const v = insanePhase(a, 0.55, 5.852);
            return v * Math.asin(Math.sin(0.8 * theta * v));
        }
    },
    insaneUnlimitedStar: {
        id: 'insaneUnlimitedStar',
        label: 'Unlimited Star',
        type: 'polar',
        color: '#22c55e',
        baseFreq: 150,
        audioScale: 80,
        gain: 0.25,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => Math.exp(Math.sin(2 * theta * insanePhase(a, 0, 5.652) + 2) + 1.5)
    },
    insaneArachnidWeb: {
        id: 'insaneArachnidWeb',
        label: 'Arachnid Web',
        type: 'polar',
        color: '#06b6d4',
        baseFreq: 440,
        audioScale: 120,
        gain: 0.25,
        sonicProfile: 'density',
        thetaRange: { min: 0, max: 20 * Math.PI },
        r: (theta, a) => 9 * Math.tanh(theta / 10 + Math.sin(99 * theta * arachnidPhase(a)))
    },
    insanePowerSun: {
        id: 'insanePowerSun',
        label: 'Power of the Sun',
        type: 'polar',
        color: '#facc15',
        baseFreq: 520,
        audioScale: 110,
        gain: 0.24,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 2 * Math.PI },
        r: (theta, a) => {
            const v = insanePhase(a, 0, 5.966);
            const core = Math.atan(0.5 * Math.tan(6 * theta + 2 * Math.PI * v)) + 2;
            return 5 * Math.exp(-Math.abs(v * core)) + 2;
        }
    },
    insaneMasterpiece: {
        id: 'insaneMasterpiece',
        label: 'The Masterpiece',
        type: 'polar',
        color: '#60a5fa',
        baseFreq: 220,
        audioScale: 140,
        gain: 0.28,
        sonicProfile: 'spin',
        thetaRange: { min: 0, max: 10 * Math.PI },
        r: (theta, a) => 6 * Math.sin(1.2 * theta + 2 * Math.PI * insanePhase(a, 0, 6.061)) - Math.cos(6 * theta)
    },
    fantasticRelativePrimality: {
        id: 'fantasticRelativePrimality',
        label: 'Relative Primality',
        type: 'implicit',
        color: '#f59e0b',
        baseFreq: 220,
        audioScale: 80,
        gain: 0.26,
        sonicProfile: 'density',
        f: (x, y, a) => boolField(gcd(Math.round(x * fantasticPhase(a, 2, 11)), Math.round(y * fantasticPhase(a, 2, 11))) === 1)
    },
    fantasticCellularTrig: {
        id: 'fantasticCellularTrig',
        label: 'Cellular Trigonometry',
        type: 'implicit',
        color: '#14b8a6',
        baseFreq: 330,
        audioScale: 100,
        gain: 0.25,
        sonicProfile: 'density',
        f: (x, y, a) => boolField(gcd(Math.round(Math.tan(y) * 10), Math.round(Math.sin(x) * 10 * fantasticPhase(a, 0, 1.4))) === 1)
    },
    fantasticInterferenceMesh: {
        id: 'fantasticInterferenceMesh',
        label: 'Interference Mesh',
        type: 'implicit',
        color: '#38bdf8',
        baseFreq: 440,
        audioScale: 120,
        gain: 0.24,
        sonicProfile: 'density',
        f: (x, y, a) => {
            const denom = Math.sin(y) + Math.sin(x) + 0.1;
            return boolField(gcd(Math.round((x / denom) * 5), Math.round(y * fantasticPhase(a, 0.18, 1.9) * 5)) === 1);
        }
    },
    fantasticGrid: {
        id: 'fantasticGrid',
        label: 'Fantastic Grid',
        type: 'implicit',
        color: '#84cc16',
        colorMode: 'inkGrid',
        baseFreq: 520,
        audioScale: 90,
        gain: 0.24,
        sonicProfile: 'density',
        f: (x, y, a) => {
            const left = 1 / Math.cos(x) + Math.tan(y);
            return boolField(gcd(Math.round(left * 5), Math.round(Math.sin(9 * x + fantasticPhase(a, 0, 7)) * 5)) === 1);
        }
    },
    fantasticUltimateGcd: {
        id: 'fantasticUltimateGcd',
        label: 'Ultimate GCD',
        type: 'implicit',
        color: '#fb7185',
        baseFreq: 660,
        audioScale: 110,
        gain: 0.22,
        sonicProfile: 'density',
        f: (x, y, a) => {
            const v = fantasticPhase(a, 0, 5.966);
            const left = 1 / Math.sin(x) + Math.tan(y) / Math.sin(2 * x + v);
            const right = Math.sin(x) * y + Math.cos(y) * Math.tan(x);
            return boolField(gcd(Math.round(left * 3), Math.round(right * 3)) === 1);
        }
    },
    incredibleDynamicInterference: {
        id: 'incredibleDynamicInterference',
        label: 'Dynamic Interference',
        color: '#22d3ee',
        baseFreq: 220,
        audioScale: 100,
        gain: 0.29,
        sonicProfile: 'density',
        fn: (x, a) => {
            const k = incrediblePhase(a, 0, 18);
            return Math.tan(Math.sin(3.5 * x) * Math.cos(k * x)) + Math.sin(1.35 * k * x);
        }
    },
    incredibleSurfaceRipple: {
        id: 'incredibleSurfaceRipple',
        label: 'Surface Ripple Field',
        type: 'implicit',
        color: '#a78bfa',
        baseFreq: 240,
        audioScale: 120,
        gain: 0.25,
        sonicProfile: 'density',
        f: (x, y, a) => Math.abs(y - 5 * Math.sin(x - Math.PI) * Math.cos(incrediblePhase(a, 0, 19.5) * y)) - 0.6
    },
    incredibleGlobalGate: {
        id: 'incredibleGlobalGate',
        label: 'Global Implicit Gate',
        type: 'implicit',
        color: '#f97316',
        baseFreq: 330,
        audioScale: 150,
        gain: 0.24,
        sonicProfile: 'density',
        f: (x, y, a) => Math.abs((incrediblePhase(a, 1, 58) * Math.sin(Math.cos(y) + Math.sin(x))) - (Math.cos(x) + Math.sin(y))) - 0.8
    },
    incredibleConcentric: {
        id: 'incredibleConcentric',
        label: 'Concentric Modulation',
        type: 'implicit',
        color: '#34d399',
        baseFreq: 260,
        audioScale: 130,
        gain: 0.25,
        sonicProfile: 'density',
        f: (x, y, a) => Math.abs(Math.sin(incrediblePhase(a, 0, 39) * x) - Math.sin(x * x + y * y)) - 0.5
    },
    incredibleChaosStar: {
        id: 'incredibleChaosStar',
        label: 'Chaos Star Grid',
        type: 'implicit',
        color: '#e879f9',
        baseFreq: 440,
        audioScale: 140,
        gain: 0.24,
        sonicProfile: 'density',
        f: (x, y, a) => Math.abs(Math.sin(x * x + y * y) - (incrediblePhase(a, 0, 19.5) * Math.cos(x * y))) - 0.5
    },
    incomprehensibleSaturn: {
        id: 'incomprehensibleSaturn',
        label: 'Saturn Orbit',
        type: 'parametric',
        color: '#facc15',
        baseFreq: 180,
        audioScale: 110,
        gain: 0.3,
        sonicProfile: 'spin',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t) => Math.sin(t),
        y: (t, a) => 2 * Math.sin(t + 2 * incomprehensiblePhase(a, 0, 5.966)) + Math.cos(t)
    },
    incomprehensibleWaveTangent: {
        id: 'incomprehensibleWaveTangent',
        label: 'Wave Tangent Twist',
        type: 'parametric',
        color: '#06b6d4',
        baseFreq: 330,
        audioScale: 90,
        gain: 0.25,
        sonicProfile: 'density',
        tRange: { min: 0, max: 4 * Math.PI },
        x: (t) => Math.sin(t) + Math.cos(t),
        y: (t, a) => {
            const v3 = incomprehensiblePhase(a, 0.172, 3.268);
            const v6 = incomprehensiblePhase(a, 0.314, 5.966);
            return Math.tan((v3 * t) / 2) * Math.cos(3 * v3 * t) + Math.sin(v3 * t + v6);
        }
    },
    incomprehensibleRotatingOvals: {
        id: 'incomprehensibleRotatingOvals',
        label: 'Rotating Ovals',
        type: 'parametric',
        color: '#4ade80',
        baseFreq: 220,
        audioScale: 130,
        gain: 0.28,
        sonicProfile: 'spin',
        tRange: { min: 0, max: 60 * Math.PI },
        x: (t) => Math.sin(0.98 * t) + Math.cos(t),
        y: (t, a) => Math.cos(10 * incomprehensiblePhase(a, 0, 14.25) + t)
    },
    incomprehensibleEight: {
        id: 'incomprehensibleEight',
        label: 'Higher Dimension 8',
        type: 'parametric',
        color: '#fb7185',
        baseFreq: 440,
        audioScale: 80,
        gain: 0.23,
        sonicProfile: 'density',
        tRange: { min: 0, max: 4 * Math.PI },
        x: (t) => Math.tan(20.5 * t),
        y: (t, a) => (1 / Math.cos(t)) + Math.sin(41 * t) * Math.tan((incomprehensiblePhase(a, 0, 1.8) * t) / 2)
    },
    incomprehensibleFinalDense: {
        id: 'incomprehensibleFinalDense',
        label: 'Final Chapter Dense',
        type: 'parametric',
        color: '#f97316',
        baseFreq: 520,
        audioScale: 70,
        gain: 0.22,
        sonicProfile: 'density',
        tRange: { min: 0, max: 2 * Math.PI },
        x: (t, a) => Math.tan(50 * t + incomprehensiblePhase(a, 0, 2.9) * Math.PI) / 4 + Math.sin(t + incomprehensiblePhase(a, 0, 2.9) * Math.PI),
        y: (t, a) => (1 / Math.sin(t)) + Math.sin(100 * t) * Math.cos(1.2 * t + incomprehensiblePhase(a, 0, 2.9) * Math.PI)
    }
};

export const SIM_FUNCTIONS = {
    amazingPlusResonance: {
        category: 'amazing-plus',
        name: 'Amazing Resonance Sim',
        variable: 'a',
        type: 'layered',
        formula: 'y = cos(ax), y = x cos(ax), y = cos(x)cos(ax)',
        latex: 'y=\\cos(ax),\\ y=x\\cos(ax),\\ y=\\cos(x)\\cos(ax)',
        range: WIDE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.standard, BASE_LAYERS.expanding, BASE_LAYERS.envelope]
    },
    amazingPlusStandard: {
        category: 'amazing-plus',
        name: 'Standard Resonance',
        variable: 'a',
        type: 'single',
        formula: 'y = cos(ax)',
        latex: 'y=\\cos(ax)',
        range: TIGHT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.standard]
    },
    amazingPlusExpanding: {
        category: 'amazing-plus',
        name: 'Expanding Resonance',
        variable: 'a',
        type: 'single',
        formula: 'y = (x / 5) cos(ax)',
        latex: 'y=\\frac{x}{5}\\cos(ax)',
        range: WIDE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.expanding]
    },
    amazingPlusEnvelope: {
        category: 'amazing-plus',
        name: 'Envelope Modulation',
        variable: 'a',
        type: 'single',
        formula: 'y = cos(x)cos(ax)',
        latex: 'y=\\cos(x)\\cos(ax)',
        range: TIGHT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.envelope]
    },
    amazingPlusGridDistortion: {
        category: 'amazing-plus',
        name: 'Grid Distortion',
        variable: 'a',
        type: 'single',
        formula: 'cos(ax) = sin(ay)',
        latex: '\\cos(ax)=\\sin(ay)',
        range: GRID_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.grid]
    },
    amazingPlusRadialWhirlpool: {
        category: 'amazing-plus',
        name: 'Radial Whirlpool',
        variable: 'a',
        type: 'single',
        formula: 'y = 4.8 cos(axy / (x²+y²+0.1))',
        latex: 'y=4.8\\cos\\left(\\frac{axy}{x^2+y^2+0.1}\\right)',
        range: RADIAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.radial]
    },
    beautifulPlusSignIntro: {
        category: 'beautiful-plus',
        name: 'The Signum Glitch',
        variable: 'a',
        type: 'single',
        formula: 'y = sign(sin(ax/4))',
        latex: 'y=\\text{sgn}(\\sin(\\frac{ax}{4}))',
        range: TIGHT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.signIntro]
    },
    beautifulPlusSignTrace: {
        category: 'beautiful-plus',
        name: 'Dancing Sign Trace',
        variable: 'a',
        type: 'single',
        formula: '(t cos(0.1a), sign(sin at))',
        latex: '(t\\cos(0.1a),\\text{sgn}(\\sin at))',
        range: TIGHT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.signTrace]
    },
    beautifulPlusDiagonal: {
        category: 'beautiful-plus',
        name: 'Oscillating Diagonal',
        variable: 'a',
        type: 'single',
        formula: '(t, t + sin(at))',
        latex: '(t,t+\\sin(at))',
        range: DIAGONAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.diagonal]
    },
    beautifulPlusSpinnyRose: {
        category: 'beautiful-plus',
        name: 'Mind Blowing Spinny',
        variable: 'v',
        type: 'single',
        formula: 'r = sign(cos(nθ + 3v)) + sin(vθ/20)',
        latex: 'r=\\text{sgn}(\\cos(n\\theta+3v))+\\sin(v\\theta/20)',
        range: ROSE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.spinnyRose]
    },
    beautifulPlusPunkHair: {
        category: 'beautiful-plus',
        name: 'Punk Hair Laser',
        variable: 'v',
        type: 'single',
        formula: 'y = x sign(csc(tan(x+v)+v)) + cos(x)',
        latex: 'y=x\\text{sgn}(\\csc(\\tan(x+v)+v))+\\cos(x)',
        range: PUNK_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.punkHair]
    },
    beautifulPlusUpAndDown: {
        category: 'beautiful-plus',
        name: 'Up and Down',
        variable: 'v',
        type: 'single',
        formula: 'y = v sign(vx - y) + cos(v + x)',
        latex: 'y=v\\text{sgn}(vx-y)+\\cos(v+x)',
        range: RADIAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.upAndDown]
    },
    beautifulPlusJaggedSineGcd: {
        category: 'beautiful-plus',
        name: 'Jagged Sine GCD',
        variable: 'v',
        type: 'single',
        formula: 'y = gcd(vx) sign(sin x) - sin x',
        latex: 'y=\\gcd(vx)\\text{sgn}(\\sin x)-\\sin x',
        range: JAGGED_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.jaggedSineGcd]
    },
    beautifulPlusModuloJaggedWave: {
        category: 'beautiful-plus',
        name: 'Modulo Jagged Wave',
        variable: 'v',
        type: 'single',
        formula: 'y = 2 sign(sin(x-v)) + mod(8x,v) - sin(x+v)',
        latex: 'y=2\\text{sgn}(\\sin(x-v))+\\bmod(8x,v)-\\sin(x+v)',
        range: MODULO_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.moduloJaggedWave]
    },
    beautifulPlusShurikenStar: {
        category: 'beautiful-plus',
        name: 'Shuriken Star',
        variable: 'v',
        type: 'single',
        formula: 'r = sign(cos(kθ - v)) + sin(v + k.05θ)cos(v)',
        latex: 'r=\\text{sgn}(\\cos(k\\theta-v))+\\sin(v+k.05\\theta)\\cos(v)',
        range: SHURIKEN_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.shurikenStar]
    },
    beautifulPlusLayeredBeauty: {
        category: 'beautiful-plus',
        name: 'Layered Beauty',
        variable: 'v',
        type: 'single',
        formula: 'r = l sign(cos(3θ-lv)) + sin(v+3θ+l) - cos(v)',
        latex: 'r=l\\text{sgn}(\\cos(3\\theta-lv))+\\sin(v+3\\theta+l)-\\cos(v)',
        range: LAYERED_BEAUTY_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.layeredBeauty]
    },
    beautifulPlusStepDuo: {
        category: 'beautiful-plus',
        name: 'Beautiful Step Duo',
        variable: 'a',
        type: 'layered',
        formula: 'sign(sin(ax/4)) + (t cos(0.1a), sign(sin at))',
        latex: '\\text{sgn}(\\sin(\\frac{ax}{4}))+(t\\cos(0.1a),\\text{sgn}(\\sin at))',
        range: TIGHT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.signIntro, BASE_LAYERS.signTrace]
    },
    beautifulPlusPolarBloom: {
        category: 'beautiful-plus',
        name: 'Beautiful Polar Bloom',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = sign(cos(kθ-v)) + sin(v+k.05θ)cos(v), r2 = l sign(cos(3θ-lv)) + sin(v+3θ+l) - cos(v)',
        latex: 'r_1=\\text{sgn}(\\cos(k\\theta-v))+\\sin(v+k.05\\theta)\\cos(v),\\ r_2=l\\text{sgn}(\\cos(3\\theta-lv))+\\sin(v+3\\theta+l)-\\cos(v)',
        range: LAYERED_BEAUTY_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.shurikenStar, BASE_LAYERS.layeredBeauty]
    },
    harmonicPlusIntro: {
        category: 'harmonic-plus',
        name: 'Harmonic Intro',
        variable: 'a',
        type: 'single',
        formula: '(cos t, sin(at/2))',
        latex: '(\\cos t,\\sin(at/2))',
        range: HARMONIC_INTRO_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.harmonicIntro]
    },
    harmonicPlusHighFreq: {
        category: 'harmonic-plus',
        name: 'High-Freq Web',
        variable: 'a',
        type: 'single',
        formula: '(cos t, sin(at))',
        latex: '(\\cos t,\\sin(at))',
        range: HARMONIC_HIGH_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.highFreqOscillator]
    },
    harmonicPlusOvals: {
        category: 'harmonic-plus',
        name: 'Harmonic Ovals',
        variable: 'v',
        type: 'single',
        formula: '(sin(vt) + cos t, cos t)',
        latex: '(\\sin(vt)+\\cos t,\\cos t)',
        range: HARMONIC_OVAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.harmonicOvals]
    },
    harmonicPlusTangentMesh: {
        category: 'harmonic-plus',
        name: 'Tangent Mesh',
        variable: 'a',
        type: 'single',
        formula: 'x=tan(at), y=sec t + sin(bt)',
        latex: 'x=\\tan(at),y=\\sec t+\\sin(bt)',
        range: HARMONIC_MESH_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.tangentMesh]
    },
    harmonicPlusCrown: {
        category: 'harmonic-plus',
        name: 'The Crown',
        variable: 'v',
        type: 'single',
        formula: 'x=tan t, y=csc t tan(vt) - sin t',
        latex: 'x=\\tan t,y=\\csc t\\tan(vt)-\\sin t',
        range: HARMONIC_MESH_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.asymptoticCrown]
    },
    harmonicPlusExtreme: {
        category: 'harmonic-plus',
        name: 'Extreme Harmonic',
        variable: 'a',
        type: 'single',
        formula: 'x=tan(at)+cos t, y=tan t sin(bt)',
        latex: 'x=\\tan(at)+\\cos t,y=\\tan t\\sin(bt)',
        range: HARMONIC_EXTREME_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.extremeHarmonic]
    },
    harmonicPlusWebDuo: {
        category: 'harmonic-plus',
        name: 'Harmonic Web Duo',
        variable: 'a',
        type: 'layered',
        formula: '(cos t, sin(at/2)), (cos t, sin(bt)), b = 28...78',
        latex: '(\\cos t,\\sin(at/2)),\\ (\\cos t,\\sin(bt)),\\ b=28\\ldots78',
        range: HARMONIC_INTRO_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.harmonicIntro, BASE_LAYERS.highFreqDuo]
    },
    harmonicPlusCrownMesh: {
        category: 'harmonic-plus',
        name: 'Asymptote Crown Mesh',
        variable: 'v',
        type: 'layered',
        formula: '(tan(at), sec t + sin(bt)), (tan t, csc t tan(vt) - sin t)',
        latex: '(\\tan(at),\\sec t+\\sin(bt)),\\ (\\tan t,\\csc t\\tan(vt)-\\sin t)',
        range: HARMONIC_MESH_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.tangentMesh, BASE_LAYERS.asymptoticCrown]
    },
    fusionPlusGalaxy: {
        category: 'fusion-plus',
        name: 'Cinematic Galaxy',
        variable: 'v',
        type: 'single',
        formula: 'r = sec(1.2θ+v) + sin(3v + cos(1.2θ+sin 1.2θ))',
        latex: 'r=\\sec(1.2\\theta+v)+\\sin(3v+\\cos(1.2\\theta+\\sin1.2\\theta))',
        range: FUSION_GALAXY_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.cinematicGalaxy]
    },
    fusionPlusTanTwist: {
        category: 'fusion-plus',
        name: 'Tan Twist Mesh',
        variable: 'v',
        type: 'single',
        formula: '(tan(2t+v)+cos4t, sin3t+cos5t)',
        latex: '(\\tan(2t+v)+\\cos4t,\\sin3t+\\cos5t)',
        range: FUSION_TAN_TWIST_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.tanTwistMesh]
    },
    fusionPlusSecant: {
        category: 'fusion-plus',
        name: 'Secant Oscillator',
        variable: 'v',
        type: 'single',
        formula: '(sec t, sin(4t+cos2t+sin3t+v))',
        latex: '(\\sec t,\\sin(4t+\\cos2t+\\sin3t+v))',
        range: FUSION_SECANT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.secantOscillator]
    },
    fusionPlusTanRise: {
        category: 'fusion-plus',
        name: 'Tan Rise Ridge',
        variable: 'v',
        type: 'single',
        formula: 'y = tan(x+v) - sin(10x+cosx)',
        latex: 'y=\\tan(x+v)-\\sin(10x+\\cos x)',
        range: FUSION_IMPLICIT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.tanRiseRidge]
    },
    fusionPlusGeometricShift: {
        category: 'fusion-plus',
        name: 'Geometric Shift',
        variable: 'v',
        type: 'single',
        formula: 'sin x = v cos y + sin(2x+v)',
        latex: '\\sin x=v\\cos y+\\sin(2x+v)',
        range: FUSION_IMPLICIT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.geometricShift]
    },
    fusionPlusPulsatingPetal: {
        category: 'fusion-plus',
        name: 'Pulsating Petal',
        variable: 'v',
        type: 'single',
        formula: 'r = sin(v + 4θ) + v',
        latex: 'r=\\sin(v+4\\theta)+v',
        range: FUSION_PETAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.pulsatingPetal]
    },
    fusionPlusStarCore: {
        category: 'fusion-plus',
        name: 'Star Core',
        variable: 'v',
        type: 'single',
        formula: '2r = 6sin(1.2θ) - cos(6θ+v)',
        latex: '2r=6\\sin(1.2\\theta)-\\cos(6\\theta+v)',
        range: FUSION_GALAXY_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.starCore]
    },
    fusionPlusGalaxyCore: {
        category: 'fusion-plus',
        name: 'Fusion Galaxy Core',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = sec(1.2θ+v)+sin(3v+cos(1.2θ+sin1.2θ)), 2r2 = 6sin(1.2θ)-cos(6θ+v)',
        latex: 'r_1=\\sec(1.2\\theta+v)+\\sin(3v+\\cos(1.2\\theta+\\sin1.2\\theta)),\\ 2r_2=6\\sin(1.2\\theta)-\\cos(6\\theta+v)',
        range: FUSION_GALAXY_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.cinematicGalaxy, BASE_LAYERS.starCore]
    },
    fusionPlusTangentOscillator: {
        category: 'fusion-plus',
        name: 'Fusion Tangent Oscillator',
        variable: 'v',
        type: 'layered',
        formula: '(tan(2t+v)+cos4t, sin3t+cos5t), (sec t, sin(4t+cos2t+sin3t+v))',
        latex: '(\\tan(2t+v)+\\cos4t,\\sin3t+\\cos5t),\\ (\\sec t,\\sin(4t+\\cos2t+\\sin3t+v))',
        range: FUSION_TAN_TWIST_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.tanTwistMesh, BASE_LAYERS.secantOscillator]
    },
    hyperPlusMillennialRose: {
        category: 'hyper-plus',
        name: 'Millennial Rose',
        variable: 'd',
        type: 'single',
        formula: 'r = sin(2025θ / d), d = 100...35',
        latex: 'r=\\sin\\left(\\frac{2025\\theta}{d}\\right),\\ d=100\\ldots35',
        range: HYPER_SMALL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.millennialRose]
    },
    hyperPlusLissajous: {
        category: 'hyper-plus',
        name: 'Hyper Lissajous',
        variable: 'v',
        type: 'single',
        formula: '(4cos(sin(20t+v)+v), sin(25t+v))',
        latex: '(4\\cos(\\sin(20t+v)+v),\\sin(25t+v))',
        range: HYPER_LISSAJOUS_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.hyperLissajous]
    },
    hyperPlusClover: {
        category: 'hyper-plus',
        name: 'Amazing Clover',
        variable: 'v',
        type: 'single',
        formula: 'r = sin(2.025θ+v) + cos(1.05θ)',
        latex: 'r=\\sin(2.025\\theta+v)+\\cos(1.05\\theta)',
        range: HYPER_CLOVER_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.amazingClover]
    },
    hyperPlusRealityBender: {
        category: 'hyper-plus',
        name: 'Reality Bender',
        variable: 'v',
        type: 'single',
        formula: 'y = mod(gcd(2025x), 5) + v sin x + ceil(vx)/5',
        latex: 'y=\\gcd(2025x)\\bmod5+v\\sin x+\\frac{\\lceil vx\\rceil}{5}',
        range: HYPER_REALITY_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.realityBender]
    },
    hyperPlusDeadpool: {
        category: 'hyper-plus',
        name: 'Deadpool Geometry',
        variable: 'v',
        type: 'single',
        formula: 'r = |sin(θ+l-v) - ceil(2sin(2θ+v+1.55))|',
        latex: 'r=|\\sin(\\theta+l-v)-\\lceil2\\sin(2\\theta+v+1.55)\\rceil|',
        range: HYPER_DEADPOOL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.deadpoolGeometry]
    },
    hyperPlusRoseClover: {
        category: 'hyper-plus',
        name: 'Hyper Rose Clover',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = sin(2025θ/d), r2 = sin(2.025θ+v) + cos(1.05θ)',
        latex: 'r_1=\\sin\\left(\\frac{2025\\theta}{d}\\right),\\ r_2=\\sin(2.025\\theta+v)+\\cos(1.05\\theta)',
        range: HYPER_CLOVER_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.millennialRose, BASE_LAYERS.amazingClover]
    },
    hyperPlusRealityWeave: {
        category: 'hyper-plus',
        name: 'Hyper Reality Weave',
        variable: 'v',
        type: 'layered',
        formula: '(4cos(sin(20t+v)+v), sin(25t+v)), y = mod(gcd(2025x),5)+v sin x+ceil(vx)/5',
        latex: '(4\\cos(\\sin(20t+v)+v),\\sin(25t+v)),\\ y=\\gcd(2025x)\\bmod5+v\\sin x+\\frac{\\lceil vx\\rceil}{5}',
        range: HYPER_REALITY_WEAVE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.hyperLissajous, BASE_LAYERS.realityBenderLow]
    },
    hyperPlusRoseDeadpool: {
        category: 'hyper-plus',
        name: 'Hyper Rose Deadpool',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = sin(2025θ/d), r2 = |sin(θ+l-v) - ceil(2sin(2θ+v+1.55))|',
        latex: 'r_1=\\sin\\left(\\frac{2025\\theta}{d}\\right),\\ r_2=|\\sin(\\theta+l-v)-\\lceil2\\sin(2\\theta+v+1.55)\\rceil|',
        range: HYPER_DEADPOOL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.millennialRose, BASE_LAYERS.deadpoolGeometry]
    },
    insanePlusTrigTomfoolery: {
        category: 'insane-plus',
        name: 'Trig Tomfoolery',
        variable: 'v',
        type: 'single',
        formula: 'r = sin(2θ + sin(4θv))',
        latex: 'r=\\sin(2\\theta+\\sin(4\\theta v))',
        range: INSANE_SMALL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneTrigTomfoolery]
    },
    insanePlusSecantTwist: {
        category: 'insane-plus',
        name: 'Secant Plot Twist',
        variable: 'v',
        type: 'single',
        formula: 'r = sec(3θ + 2πv sinθ)',
        latex: 'r=\\sec(3\\theta+2\\pi v\\sin\\theta)',
        range: INSANE_WIDE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneSecantTwist]
    },
    insanePlusInverseFractal: {
        category: 'insane-plus',
        name: 'Inverse Fractal',
        variable: 'v',
        type: 'single',
        formula: 'r = v asin(sin(0.8θv))',
        latex: 'r=v\\arcsin(\\sin(0.8\\theta v))',
        range: INSANE_FRACTAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneInverseFractal]
    },
    insanePlusUnlimitedStar: {
        category: 'insane-plus',
        name: 'Unlimited Star',
        variable: 'v',
        type: 'single',
        formula: 'r = exp(sin(2θv + 2) + 1.5)',
        latex: 'r=e^{\\sin(2\\theta v+2)+1.5}',
        range: INSANE_STAR_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneUnlimitedStar]
    },
    insanePlusArachnidWeb: {
        category: 'insane-plus',
        name: 'Arachnid Web',
        variable: 'v',
        type: 'single',
        formula: 'r = 9 tanh(θ/10 + sin(99θv))',
        latex: 'r=9\\tanh(\\theta/10+\\sin(99\\theta v))',
        range: INSANE_WEB_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneArachnidWeb]
    },
    insanePlusPowerSun: {
        category: 'insane-plus',
        name: 'Power of the Sun',
        variable: 'v',
        type: 'single',
        formula: 'r = 5exp(-|v atan(.5tan(6θ+2πv))|)+2',
        latex: 'r=5e^{-|v\\arctan(.5\\tan(6\\theta+2\\pi v))|}+2',
        range: INSANE_SUN_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insanePowerSun]
    },
    insanePlusMasterpiece: {
        category: 'insane-plus',
        name: 'The Masterpiece',
        variable: 'v',
        type: 'single',
        formula: 'r = 6sin(1.2θ+2πv) - cos(6θ)',
        latex: 'r=6\\sin(1.2\\theta+2\\pi v)-\\cos(6\\theta)',
        range: INSANE_WIDE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneMasterpiece]
    },
    insanePlusTrigMasterpiece: {
        category: 'insane-plus',
        name: 'Insane Trig Masterpiece',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = sin(2θ+sin(4θv)), r2 = 6sin(1.2θ+2πv)-cos(6θ)',
        latex: 'r_1=\\sin(2\\theta+\\sin(4\\theta v)),\\ r_2=6\\sin(1.2\\theta+2\\pi v)-\\cos(6\\theta)',
        range: INSANE_WIDE_RANGE,
        ...BASE_TIMING,
        layers: [{ ...BASE_LAYERS.insaneTrigTomfoolery, id: 'insaneTrigTomfooleryLarge', radiusScale: 3.2 }, BASE_LAYERS.insaneMasterpiece]
    },
    insanePlusWebTwist: {
        category: 'insane-plus',
        name: 'Insane Web Twist',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = sec(3θ+2πv sinθ), r2 = 9tanh(θ/10+sin(99θv))',
        latex: 'r_1=\\sec(3\\theta+2\\pi v\\sin\\theta),\\ r_2=9\\tanh(\\theta/10+\\sin(99\\theta v))',
        range: INSANE_WEB_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneSecantTwist, BASE_LAYERS.insaneArachnidWeb]
    },
    insanePlusFractalStar: {
        category: 'insane-plus',
        name: 'Insane Fractal Star',
        variable: 'v',
        type: 'layered',
        formula: 'r1 = v asin(sin(0.8θv)), r2 = exp(sin(2θv+2)+1.5)',
        latex: 'r_1=v\\arcsin(\\sin(0.8\\theta v)),\\ r_2=e^{\\sin(2\\theta v+2)+1.5}',
        range: INSANE_STAR_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.insaneInverseFractal, BASE_LAYERS.insaneUnlimitedStar]
    },
    fantasticPlusRelativePrimality: {
        category: 'fantastic-plus',
        name: 'Relative Primality',
        variable: 'v',
        type: 'single',
        formula: 'gcd(vx, vy) = 1',
        latex: '\\gcd(vx,vy)=1',
        range: FANTASTIC_10_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.fantasticRelativePrimality]
    },
    fantasticPlusCellularTrig: {
        category: 'fantastic-plus',
        name: 'Cellular Trigonometry',
        variable: 'v',
        type: 'single',
        formula: 'gcd(10tan y, 10v sin x) = 1',
        latex: '\\gcd(10\\tan y,10v\\sin x)=1',
        range: FANTASTIC_5_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.fantasticCellularTrig]
    },
    fantasticPlusInterferenceMesh: {
        category: 'fantastic-plus',
        name: 'Interference Mesh',
        variable: 'v',
        type: 'single',
        formula: 'gcd(5x/(sin y+sin x), 5yv) = 1',
        latex: '\\gcd(5x/(\\sin y+\\sin x),5yv)=1',
        range: FANTASTIC_8_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.fantasticInterferenceMesh]
    },
    fantasticPlusGrid: {
        category: 'fantastic-plus',
        name: 'Fantastic Grid',
        variable: 'v',
        type: 'single',
        formula: 'gcd(5(sec x+tan y), 5sin(9x+v)) = 1',
        latex: '\\gcd(5(\\sec x+\\tan y),5\\sin(9x+v))=1',
        range: FANTASTIC_6_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.fantasticGrid]
    },
    fantasticPlusUltimateGcd: {
        category: 'fantastic-plus',
        name: 'Ultimate GCD',
        variable: 'v',
        type: 'single',
        formula: 'gcd(3(csc x+tan y/sin(2x+v)), 3(sin x y+cos y tan x)) = 1',
        latex: '\\gcd(3(\\csc x+\\tan y/\\sin(2x+v)),3(\\sin x\\,y+\\cos y\\tan x))=1',
        range: FANTASTIC_4_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.fantasticUltimateGcd]
    },
    incrediblePlusDynamicInterference: {
        category: 'incredible-plus',
        name: 'Dynamic Interference',
        variable: 'k',
        type: 'single',
        formula: 'y = tan(sin(3.5x)cos(kx)) + sin(1.35kx)',
        latex: 'y=\\tan(\\sin(3.5x)\\cos(kx))+\\sin(1.35kx)',
        range: INCR_5_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incredibleDynamicInterference]
    },
    incrediblePlusSurfaceRipple: {
        category: 'incredible-plus',
        name: 'Surface Ripple Field',
        variable: 'k',
        type: 'single',
        formula: 'y = 5sin(x-π)cos(ky)',
        latex: 'y=5\\sin(x-\\pi)\\cos(ky)',
        range: INCR_10_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incredibleSurfaceRipple]
    },
    incrediblePlusGlobalGate: {
        category: 'incredible-plus',
        name: 'Global Implicit Gate',
        variable: 'k',
        type: 'single',
        formula: 'k sin(cos y + sin x) = cos x + sin y',
        latex: 'k\\sin(\\cos y+\\sin x)=\\cos x+\\sin y',
        range: INCR_15_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incredibleGlobalGate]
    },
    incrediblePlusConcentric: {
        category: 'incredible-plus',
        name: 'Concentric Modulation',
        variable: 'k',
        type: 'single',
        formula: 'sin(kx) = sin(x²+y²)',
        latex: '\\sin(kx)=\\sin(x^2+y^2)',
        range: INCR_8_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incredibleConcentric]
    },
    incrediblePlusChaosStar: {
        category: 'incredible-plus',
        name: 'Chaos Star Grid',
        variable: 'k',
        type: 'single',
        formula: 'sin(x²+y²) = k cos(xy)',
        latex: '\\sin(x^2+y^2)=k\\cos(xy)',
        range: INCR_8_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incredibleChaosStar]
    },
    incomprehensiblePlusSaturn: {
        category: 'incomprehensible-plus',
        name: 'Saturn Orbit',
        variable: 'v',
        type: 'single',
        formula: '(sin t, 2sin(t+2v)+cos t)',
        latex: '(\\sin t,2\\sin(t+2v)+\\cos t)',
        range: INCOMP_SATURN_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incomprehensibleSaturn]
    },
    incomprehensiblePlusWaveTangent: {
        category: 'incomprehensible-plus',
        name: 'Wave Tangent Twist',
        variable: 'v',
        type: 'single',
        formula: '(sin t+cos t, tan(vt/2)cos(3vt)+sin(vt+v6))',
        latex: '(\\sin t+\\cos t,\\tan(vt/2)\\cos(3vt)+\\sin(vt+v_6))',
        range: INCOMP_WAVE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incomprehensibleWaveTangent]
    },
    incomprehensiblePlusRotatingOvals: {
        category: 'incomprehensible-plus',
        name: 'Rotating Ovals',
        variable: 'v',
        type: 'single',
        formula: '(sin(0.98t)+cos t, cos(10v+t))',
        latex: '(\\sin(0.98t)+\\cos t,\\cos(10v+t))',
        range: INCOMP_OVAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incomprehensibleRotatingOvals]
    },
    incomprehensiblePlusEight: {
        category: 'incomprehensible-plus',
        name: 'Higher Dimension 8',
        variable: 'v',
        type: 'single',
        formula: '(tan(20.5t), sec t + sin(41t)tan(vt/2))',
        latex: '(\\tan(20.5t),\\sec t+\\sin(41t)\\tan(vt/2))',
        range: INCOMP_BIG_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incomprehensibleEight]
    },
    incomprehensiblePlusFinalDense: {
        category: 'incomprehensible-plus',
        name: 'Final Chapter Dense',
        variable: 'v',
        type: 'single',
        formula: '(tan(50t+vπ)/4+sin(t+vπ), csc t+sin(100t)cos(1.2t+vπ))',
        latex: '(\\tan(50t+v\\pi)/4+\\sin(t+v\\pi),\\csc t+\\sin(100t)\\cos(1.2t+v\\pi))',
        range: INCOMP_DENSE_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incomprehensibleFinalDense]
    },
    incomprehensiblePlusSaturnWave: {
        category: 'incomprehensible-plus',
        name: 'Saturn Wave Convergence',
        variable: 'v',
        type: 'layered',
        formula: '(sin t, 2sin(t+2v)+cos t), (sin t+cos t, tan(vt/2)cos(3vt)+sin(vt+v6))',
        latex: '(\\sin t,2\\sin(t+2v)+\\cos t),\\ (\\sin t+\\cos t,\\tan(vt/2)\\cos(3vt)+\\sin(vt+v_6))',
        range: INCOMP_WAVE_RANGE,
        ...BASE_TIMING,
        layers: [{ ...BASE_LAYERS.incomprehensibleSaturn, scaleX: 1.75, scaleY: 1.75 }, BASE_LAYERS.incomprehensibleWaveTangent]
    },
    incomprehensiblePlusSaturnOvals: {
        category: 'incomprehensible-plus',
        name: 'Saturn Oval Engine',
        variable: 'v',
        type: 'layered',
        formula: '(sin t, 2sin(t+2v)+cos t), (sin(0.98t)+cos t, cos(10v+t))',
        latex: '(\\sin t,2\\sin(t+2v)+\\cos t),\\ (\\sin(0.98t)+\\cos t,\\cos(10v+t))',
        range: INCOMP_SATURN_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.incomprehensibleSaturn, BASE_LAYERS.incomprehensibleRotatingOvals]
    }
};

const simAudio = {
    context: null,
    master: null,
    filter: null,
    analyser: null,
    layers: [],
    layerSignature: '',
    rafId: null,
    startedAt: 0,
    functionId: null
};

export function isSymphonySimCategory(category) {
    return !!SIM_CATEGORIES[category];
}

export function isSymphonySimFunction(functionId) {
    return !!SIM_FUNCTIONS[functionId];
}

export function drawSymphonySimStatic(functionId) {
    const sim = SIM_FUNCTIONS[functionId];
    if (!sim || !ctx.graph || !elements.graphCanvas) return;

    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;

    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#050505';
    graphCtx.fillRect(0, 0, width, height);
    drawAxes(graphCtx, width, height, sim.range);
    drawSimLayers(graphCtx, sim, width, height, 1, 1.6);
    clearWaveform();
    updateHud(sim, 1.6);
}

export function startSymphonySim(functionId) {
    const sim = SIM_FUNCTIONS[functionId];
    if (!sim) return;

    ensureAudio(sim);
    stopSymphonySim({ keepAudio: true });
    simAudio.functionId = functionId;
    simAudio.startedAt = performance.now();
    if (simAudio.context.state === 'suspended') {
        simAudio.context.resume().catch(() => {});
    }
    simAudio.master.gain.setTargetAtTime(Math.max(0.001, state.volume * 1.15), simAudio.context.currentTime, 0.04);
    tick();
}

export function stopSymphonySim(options = {}) {
    if (simAudio.rafId !== null) {
        cancelAnimationFrame(simAudio.rafId);
        simAudio.rafId = null;
    }
    if (!options.keepAudio && simAudio.master && simAudio.context) {
        simAudio.master.gain.setTargetAtTime(0.0001, simAudio.context.currentTime, 0.04);
    }
    if (!options.keepHud && elements.simHud) {
        elements.simHud.hidden = true;
    }
}

export function resetSymphonySim(functionId) {
    stopSymphonySim();
    drawSymphonySimStatic(functionId);
}

function ensureAudio(sim) {
    if (!simAudio.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        simAudio.context = new AudioContext();
        simAudio.master = simAudio.context.createGain();
        simAudio.filter = simAudio.context.createBiquadFilter();
        simAudio.analyser = simAudio.context.createAnalyser();
        simAudio.filter.type = 'lowpass';
        simAudio.filter.frequency.value = 3600;
        simAudio.filter.Q.value = 0.7;
        simAudio.analyser.fftSize = 2048;
        simAudio.filter.connect(simAudio.analyser);
        simAudio.analyser.connect(simAudio.master);
        simAudio.master.connect(simAudio.context.destination);
        simAudio.master.gain.value = 0.0001;
    }

    const signature = sim.layers.map((layer) => layer.id).join('|');
    if (simAudio.layers.length === sim.layers.length && simAudio.layerSignature === signature) return;

    simAudio.layers.forEach((layer) => {
        try { layer.osc.stop(); } catch (_err) {}
    });
    simAudio.layerSignature = signature;
    simAudio.layers = sim.layers.map((layer) => {
        const osc = simAudio.context.createOscillator();
        const gain = simAudio.context.createGain();
        const panner = simAudio.context.createStereoPanner();
        osc.type = layer.sonicProfile === 'stepped' ? 'square' : layer.id === 'expanding' ? 'triangle' : 'sine';
        osc.frequency.value = layer.baseFreq;
        gain.gain.value = 0.0001;
        panner.pan.value = layer.id === 'standard' ? -0.45 : layer.id === 'envelope' ? 0.45 : 0;
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(simAudio.filter);
        osc.start();
        return { ...layer, osc, gain, panner };
    });
}

function tick() {
    const sim = SIM_FUNCTIONS[simAudio.functionId];
    if (!sim) return;

    const now = performance.now();
    const elapsed = (now - simAudio.startedAt) * state.speed;
    const drawProgress = Math.min(1, elapsed / sim.drawMs);
    const animateProgress = Math.max(0, (elapsed - sim.drawMs) / Math.max(1, sim.durationMs - sim.drawMs));
    const a = animateProgress <= 0
        ? 1.6
        : 1.6 + 28.4 * (0.5 - 0.5 * Math.cos(animateProgress * Math.PI * 2));

    state.drawProgress = drawProgress;
    drawFrame(sim, drawProgress, a);
    updateAudio(sim, drawProgress, a);
    drawWaveform(sim);
    updateHud(sim, a);

    if (elements.canvasClock) {
        const total = Math.floor(elapsed);
        const mm = String(Math.floor(total / 60000)).padStart(2, '0');
        const ss = String(Math.floor((total % 60000) / 1000)).padStart(2, '0');
        const ms = String(Math.floor((total % 1000) / 10)).padStart(2, '0');
        elements.canvasClock.textContent = `${mm}:${ss}.${ms}`;
    }

    simAudio.rafId = requestAnimationFrame(tick);
}

function drawFrame(sim, progress, a) {
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;
    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#050505';
    graphCtx.fillRect(0, 0, width, height);
    drawAxes(graphCtx, width, height, sim.range);
    drawSimLayers(graphCtx, sim, width, height, progress, a);
}

function drawSimLayers(graphCtx, sim, width, height, progress, a) {
    const { xMin, xMax, yMin, yMax } = sim.range;
    const totalSteps = 2200;
    const steps = Math.max(2, Math.floor(totalSteps * progress));
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    sim.layers.forEach((layer) => {
        graphCtx.save();
        graphCtx.strokeStyle = layer.color;

        if (layer.type === 'parametric') {
            drawParametricLayer(graphCtx, layer, sim.range, width, height, progress, a);
        } else if (layer.type === 'polar') {
            drawPolarLayer(graphCtx, layer, sim.range, width, height, progress, a);
        } else if (layer.type === 'implicit') {
            drawImplicitLayer(graphCtx, layer, sim.range, width, height, progress, a);
        } else {
            graphCtx.lineWidth = layer.id === 'standard' ? 3 : 2.2;
            let first = true;
            let prevX = 0;
            let prevY = 0;
            for (let i = 0; i <= steps; i++) {
                const x = xMin + (xRange * i) / totalSteps;
                let y = layer.fn(x, a);
                if (!Number.isFinite(y)) {
                    first = true;
                    continue;
                }
                const px = ((x - xMin) / xRange) * width;
                const py = ((yMax - y) / yRange) * height;
                if (py < -120 || py > height + 120) {
                    first = true;
                    continue;
                }
                if (first) {
                    prevX = px;
                    prevY = py;
                    first = false;
                } else {
                    strokeSegment(graphCtx, layer, prevX, prevY, px, py, i / Math.max(1, steps), y, a);
                    prevX = px;
                    prevY = py;
                }
            }
        }
        graphCtx.restore();
    });
}

function drawParametricLayer(graphCtx, layer, range, width, height, progress, a) {
    const { xMin, xMax, yMin, yMax } = range;
    const totalSteps = 2600;
    const steps = Math.max(2, Math.floor(totalSteps * progress));
    const tMin = layer.tRange?.min ?? 0;
    const tMax = layer.tRange?.max ?? 1;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    graphCtx.beginPath();
    graphCtx.lineWidth = 2.4;
    let first = true;
    let prevX = 0;
    let prevY = 0;

    for (let i = 0; i <= steps; i++) {
        const t = tMin + ((tMax - tMin) * i) / totalSteps;
        const x = layer.x(t, a) * (layer.scaleX || 1);
        const y = layer.y(t, a) * (layer.scaleY || 1);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            first = true;
            continue;
        }
        const px = ((x - xMin) / xRange) * width;
        const py = ((yMax - y) / yRange) * height;
        if (px < -80 || px > width + 80 || py < -80 || py > height + 80) {
            first = true;
            continue;
        }
        if (first) {
            prevX = px;
            prevY = py;
            first = false;
        } else {
            strokeSegment(graphCtx, layer, prevX, prevY, px, py, i / Math.max(1, steps), y, a);
            prevX = px;
            prevY = py;
        }
    }
}

function drawPolarLayer(graphCtx, layer, range, width, height, progress, a) {
    const { xMin, xMax, yMin, yMax } = range;
    const thetaMin = layer.thetaRange?.min ?? 0;
    const thetaMax = layer.thetaRange?.max ?? Math.PI * 2;
    const totalSteps = 4200;
    const steps = Math.max(2, Math.floor(totalSteps * progress));
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    graphCtx.beginPath();
    graphCtx.lineWidth = layer.lineWidth || 2.2;
    let first = true;
    let prevX = 0;
    let prevY = 0;

    for (let i = 0; i <= steps; i++) {
        const theta = thetaMin + ((thetaMax - thetaMin) * i) / totalSteps;
        const r = layer.r(theta, a) * (layer.radiusScale || 1);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            first = true;
            continue;
        }
        const px = ((x - xMin) / xRange) * width;
        const py = ((yMax - y) / yRange) * height;
        if (px < -80 || px > width + 80 || py < -80 || py > height + 80) {
            first = true;
            continue;
        }
        if (first) {
            prevX = px;
            prevY = py;
            first = false;
        } else {
            strokeSegment(graphCtx, layer, prevX, prevY, px, py, i / Math.max(1, steps), r, a);
            prevX = px;
            prevY = py;
        }
    }
}

function drawImplicitLayer(graphCtx, layer, range, width, height, progress, a) {
    const { xMin, xMax, yMin, yMax } = range;
    const resX = 180;
    const resY = 180;
    const cols = Math.max(2, Math.floor(resX * progress));
    const cellW = width / resX;
    const cellH = height / resY;
    const threshold = 0.08;

    for (let i = 0; i <= cols; i++) {
        const x = xMin + ((xMax - xMin) * i) / resX;
        for (let j = 0; j <= resY; j++) {
            const y = yMin + ((yMax - yMin) * j) / resY;
            const v = layer.f(x, y, a);
            if (Number.isFinite(v) && Math.abs(v) < threshold) {
                const px = ((x - xMin) / (xMax - xMin)) * width;
                const py = ((yMax - y) / (yMax - yMin)) * height;
                graphCtx.fillStyle = colorForLayer(layer, i / Math.max(1, cols), y / Math.max(1, Math.abs(yMax)), a);
                graphCtx.globalAlpha = 0.86;
                graphCtx.fillRect(px, py, Math.max(1.2, cellW * 1.35), Math.max(1.2, cellH * 1.35));
            }
        }
    }
    graphCtx.globalAlpha = 1;
}

function strokeSegment(graphCtx, layer, x1, y1, x2, y2, progress, value, a) {
    graphCtx.beginPath();
    graphCtx.strokeStyle = colorForLayer(layer, progress, value, a);
    graphCtx.moveTo(x1, y1);
    graphCtx.lineTo(x2, y2);
    graphCtx.stroke();
}

function colorForLayer(layer, progress, value, a) {
    if (layer.colorMode === 'inkGrid') {
        const phase = Math.sin(progress * 68 + (value || 0) * 18 + a * 0.32);
        if (phase > -0.18) {
            const ink = 4 + 9 * Math.max(0, phase);
            return `hsl(225, 42%, ${ink}%)`;
        }
        const hue = (82 + progress * 95 + a * 2.4) % 360;
        return `hsl(${hue}, 92%, 58%)`;
    }

    const base = COLOR_PALETTE[Math.abs(hashString(layer.id)) % COLOR_PALETTE.length];
    const wave = Math.sin((value || 0) * 1.8 + a * 0.11) * 24;
    const hue = (base + progress * 190 + wave + 360) % 360;
    const lightness = 58 + 10 * Math.sin(progress * Math.PI);
    return `hsl(${hue}, 92%, ${lightness}%)`;
}

function updateAudio(sim, progress, a) {
    if (!simAudio.context || !simAudio.layers.length) return;
    const now = simAudio.context.currentTime;
    let brightness = 0;

    simAudio.layers.forEach((layer, index) => {
        const simLayer = sim.layers[index];
        const motion = sampleLayerMotion(simLayer, sim.range, progress, a);
        const sound = soundFromMotion(simLayer, motion, progress);
        const freq = simLayer.baseFreq + sound.pitch;
        const gain = simLayer.gain * sound.gain;
        layer.osc.frequency.setTargetAtTime(clamp(freq, 35, 2400), now, 0.035);
        layer.gain.gain.setTargetAtTime(Math.max(0.0001, gain), now, 0.035);
        brightness += sound.brightness;
    });

    simAudio.filter.frequency.setTargetAtTime(1200 + clamp(brightness / simAudio.layers.length, 0, 1) * 4200, now, 0.05);
}

function soundFromMotion(layer, motion, progress) {
    const travel = progress * 2 - 1;
    const profile = layer.sonicProfile || 'motion';

    if (profile === 'stepped') {
        return {
            pitch: motion.position * layer.audioScale + motion.jump * 520 + motion.direction * 70,
            gain: 0.22 + Math.abs(motion.position) * 0.28 + motion.jump * 1.45 + motion.velocity * 0.22,
            brightness: motion.jump * 1.5 + motion.curvature * 0.55 + motion.velocity * 0.25
        };
    }

    if (profile === 'takeoff') {
        return {
            pitch: travel * 240 + motion.position * 90 + motion.velocity * 90 + motion.direction * 55,
            gain: 0.28 + progress * 0.45 + motion.velocity * 0.35 + motion.curvature * 0.18,
            brightness: progress * 0.6 + motion.velocity * 0.45 + motion.curvature * 0.4
        };
    }

    if (profile === 'spin') {
        return {
            pitch: motion.position * layer.audioScale + motion.curvature * 220 + Math.sin(progress * Math.PI * 8) * 70,
            gain: 0.26 + motion.velocity * 0.45 + motion.curvature * 0.35,
            brightness: motion.curvature * 1.2 + motion.velocity * 0.35
        };
    }

    if (profile === 'density') {
        return {
            pitch: motion.position * layer.audioScale + motion.curvature * 180 + motion.velocity * 120,
            gain: 0.24 + motion.velocity * 0.55 + motion.curvature * 0.65 + motion.jump * 0.7,
            brightness: motion.curvature * 1.1 + motion.jump * 0.9 + motion.velocity * 0.45
        };
    }

    return {
        pitch: travel * 90 + motion.position * layer.audioScale + motion.velocity * 100 + motion.jump * 220,
        gain: 0.28 + Math.abs(motion.position) * 0.42 + motion.velocity * 0.4 + motion.jump * 0.8,
        brightness: motion.velocity * 0.6 + motion.curvature * 0.6 + motion.jump * 0.8
    };
}

function sampleLayerMotion(layer, range, progress, a) {
    const dt = 0.004;
    const p0 = pointForLayer(layer, range, clamp(progress - dt, 0, 1), a);
    const p1 = pointForLayer(layer, range, progress, a);
    const p2 = pointForLayer(layer, range, clamp(progress + dt, 0, 1), a);
    const v1x = p1.x - p0.x;
    const v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x;
    const v2y = p2.y - p1.y;
    const velocity = clamp(Math.hypot(v1x, v1y) / dt / 18, 0, 1);
    const jump = clamp(Math.abs(p1.soundY - p0.soundY) * 0.85, 0, 1);
    const a1 = Math.atan2(v1y, v1x);
    const a2 = Math.atan2(v2y, v2x);
    const curvature = clamp(Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) / Math.PI, 0, 1);
    return {
        position: clamp(p1.soundY, -1, 1),
        direction: clamp(a1 / Math.PI, -1, 1),
        velocity,
        jump,
        curvature
    };
}

function pointForLayer(layer, range, progress, a) {
    const { xMin, xMax, yMin, yMax } = range;
    if (layer.type === 'parametric') {
        const tMin = layer.tRange?.min ?? 0;
        const tMax = layer.tRange?.max ?? 1;
        const t = tMin + (tMax - tMin) * progress;
        const x = layer.x(t, a) * (layer.scaleX || 1);
        const y = layer.y(t, a) * (layer.scaleY || 1);
        const soundY = layer.audioY ? layer.audioY(t, a) : normalizeY(y, yMin, yMax);
        return { x: normalizeX(x, xMin, xMax), y: normalizeY(y, yMin, yMax), soundY };
    }

    if (layer.type === 'polar') {
        const thetaMin = layer.thetaRange?.min ?? 0;
        const thetaMax = layer.thetaRange?.max ?? Math.PI * 2;
        const theta = thetaMin + (thetaMax - thetaMin) * progress;
        const r = layer.r(theta, a) * (layer.radiusScale || 1);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        return { x: normalizeX(x, xMin, xMax), y: normalizeY(y, yMin, yMax), soundY: clamp(r / Math.max(1, Math.abs(xMax)), -1, 1) };
    }

    if (layer.type === 'implicit') {
        const x = xMin + (xMax - xMin) * progress;
        const y = findImplicitY(layer, range, x, a);
        return { x: normalizeX(x, xMin, xMax), y: normalizeY(y, yMin, yMax), soundY: normalizeY(y, yMin, yMax) };
    }

    const x = xMin + (xMax - xMin) * progress;
    const y = layer.fn(x, a);
    return { x: normalizeX(x, xMin, xMax), y: normalizeY(y, yMin, yMax), soundY: normalizeY(y, yMin, yMax) };
}

function sampleLayerY(layer, range, progress, a) {
    if (layer.type === 'parametric') {
        const tMin = layer.tRange?.min ?? 0;
        const tMax = layer.tRange?.max ?? 1;
        const t = tMin + (tMax - tMin) * progress;
        return layer.audioY ? layer.audioY(t, a) : layer.y(t, a);
    }

    if (layer.type === 'polar') {
        const thetaMin = layer.thetaRange?.min ?? 0;
        const thetaMax = layer.thetaRange?.max ?? Math.PI * 2;
        const theta = thetaMin + (thetaMax - thetaMin) * progress;
        return layer.r(theta, a);
    }

    if (layer.type === 'implicit') {
        const { xMin, xMax, yMin, yMax } = range;
        const x = xMin + (xMax - xMin) * progress;
        let bestY = 0;
        let bestAbs = Infinity;
        const steps = 96;
        for (let i = 0; i <= steps; i++) {
            const y = yMin + ((yMax - yMin) * i) / steps;
            const v = Math.abs(layer.f(x, y, a));
            if (Number.isFinite(v) && v < bestAbs) {
                bestAbs = v;
                bestY = y;
            }
        }
        return bestY / Math.max(1, Math.abs(yMax));
    }

    const { xMin, xMax } = range;
    const x = xMin + (xMax - xMin) * progress;
    return layer.fn(x, a);
}

function findImplicitY(layer, range, x, a) {
    const { yMin, yMax } = range;
    let bestY = 0;
    let bestAbs = Infinity;
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
        const y = yMin + ((yMax - yMin) * i) / steps;
        const v = Math.abs(layer.f(x, y, a));
        if (Number.isFinite(v) && v < bestAbs) {
            bestAbs = v;
            bestY = y;
        }
    }
    return bestY;
}

function normalizeX(x, xMin, xMax) {
    if (!Number.isFinite(x)) return 0;
    return clamp(((x - xMin) / (xMax - xMin)) * 2 - 1, -1.5, 1.5);
}

function normalizeY(y, yMin, yMax) {
    if (!Number.isFinite(y)) return 0;
    return clamp(((y - yMin) / (yMax - yMin)) * 2 - 1, -1.5, 1.5);
}

function updateHud(sim, a) {
    if (!elements.simHud) return;
    elements.simHud.hidden = false;
    if (elements.simHudA) {
        const variable = sim.variable || 'a';
        elements.simHudA.textContent = `${variable} = ${formatVariableValue(sim, a)}`;
    }
    if (elements.simHudLayers) {
        elements.simHudLayers.textContent = `${sim.layers.length} layer${sim.layers.length === 1 ? '' : 's'}`;
    }
}

function formatVariableValue(sim, a) {
    if (sim.variable !== 'v') return a.toFixed(2);
    const layer = sim.layers[0];
    switch (layer?.id) {
        case 'spinnyRose':
            return beautifulPhase(a, 0, 5).toFixed(2);
        case 'punkHair':
            return beautifulPhase(a, 0, Math.PI * 1.75).toFixed(2);
        case 'upAndDown':
            return (-8 + beautifulPhase(a, 0, 1) * 16).toFixed(2);
        case 'jaggedSineGcd':
            return beautifulPhase(a, 1, 10).toFixed(2);
        case 'moduloJaggedWave':
            return (0.19 + beautifulPhase(a, 0, 1) * 1.98).toFixed(2);
        case 'shurikenStar':
            return beautifulPhase(a, 0, 7.5).toFixed(2);
        case 'layeredBeauty':
            return beautifulPhase(a, 0, 5.4).toFixed(2);
        case 'harmonicOvals':
            return harmonicPhase(a, 0.95, 1.04).toFixed(2);
        case 'asymptoticCrown':
            return harmonicPhase(a, 0.9, 1.09).toFixed(2);
        case 'cinematicGalaxy':
        case 'secantOscillator':
        case 'starCore':
            return fusionPhase(a, 0, Math.PI * 2).toFixed(2);
        case 'tanTwistMesh':
            return fusionPhase(a, 0, 5.72).toFixed(2);
        case 'tanRiseRidge':
            return fusionPhase(a, 0, 5.85).toFixed(2);
        case 'geometricShift':
            return fusionPhase(a, -2.5, 2.5).toFixed(2);
        case 'pulsatingPetal':
            return fusionPhase(a, -1.5, 1.3).toFixed(2);
        case 'millennialRose':
            return hyperPhase(a, 100, 35).toFixed(2);
        case 'hyperLissajous':
            return hyperPhase(a, 1, Math.PI * 2 + 1).toFixed(2);
        case 'amazingClover':
            return hyperPhase(a, 0, 57).toFixed(2);
        case 'realityBender':
            return hyperPhase(a, 0, 7).toFixed(2);
        case 'deadpoolGeometry':
            return hyperPhase(a, 0, 23.864).toFixed(2);
        case 'insaneTrigTomfoolery':
            return insanePhase(a, 0.314, 5.966).toFixed(2);
        case 'insaneSecantTwist':
        case 'insanePowerSun':
            return insanePhase(a, 0, 5.966).toFixed(2);
        case 'insaneArachnidWeb':
            return arachnidPhase(a).toFixed(2);
        case 'insaneInverseFractal':
            return insanePhase(a, 0.55, 5.852).toFixed(2);
        case 'insaneUnlimitedStar':
            return insanePhase(a, 0, 5.652).toFixed(2);
        case 'insaneMasterpiece':
            return insanePhase(a, 0, 6.061).toFixed(2);
        case 'fantasticRelativePrimality':
            return fantasticPhase(a, 2, 11).toFixed(2);
        case 'fantasticCellularTrig':
            return fantasticPhase(a, 0, 1.4).toFixed(2);
        case 'fantasticInterferenceMesh':
            return fantasticPhase(a, 0.18, 1.9).toFixed(2);
        case 'fantasticGrid':
            return fantasticPhase(a, 0, 7).toFixed(2);
        case 'fantasticUltimateGcd':
            return fantasticPhase(a, 0, 5.966).toFixed(2);
        case 'incredibleDynamicInterference':
            return incrediblePhase(a, 0, 18).toFixed(2);
        case 'incredibleSurfaceRipple':
        case 'incredibleChaosStar':
            return incrediblePhase(a, 0, 19.5).toFixed(2);
        case 'incredibleGlobalGate':
            return incrediblePhase(a, 1, 58).toFixed(2);
        case 'incredibleConcentric':
            return incrediblePhase(a, 0, 39).toFixed(2);
        case 'incomprehensibleSaturn':
            return incomprehensiblePhase(a, 0, 5.966).toFixed(2);
        case 'incomprehensibleWaveTangent':
            return incomprehensiblePhase(a, 0.172, 3.268).toFixed(2);
        case 'incomprehensibleRotatingOvals':
            return incomprehensiblePhase(a, 0, 14.25).toFixed(2);
        case 'incomprehensibleEight':
            return incomprehensiblePhase(a, 0, 1.8).toFixed(2);
        case 'incomprehensibleFinalDense':
            return incomprehensiblePhase(a, 0, 2.9).toFixed(2);
        default:
            return beautifulPhase(a, 0, 1).toFixed(2);
    }
}

function clearWaveform() {
    if (!ctx.waveform || !elements.waveformCanvas) return;
    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    ctx.waveform.fillStyle = '#f3f4f6';
    ctx.waveform.fillRect(0, 0, width, height);
    ctx.waveform.strokeStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.waveform.lineWidth = 1;
    ctx.waveform.beginPath();
    ctx.waveform.moveTo(0, height / 2);
    ctx.waveform.lineTo(width, height / 2);
    ctx.waveform.stroke();
}

function drawWaveform(sim) {
    if (!simAudio.analyser || !ctx.waveform || !elements.waveformCanvas) return;
    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    const bufferLength = simAudio.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    simAudio.analyser.getByteTimeDomainData(dataArray);

    const waveformCtx = ctx.waveform;
    waveformCtx.fillStyle = '#f3f4f6';
    waveformCtx.fillRect(0, 0, width, height);
    waveformCtx.strokeStyle = sim.layers.length === 1 ? sim.layers[0].color : '#ff8a00';
    waveformCtx.lineWidth = 2.4;
    waveformCtx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128;
        const y = (v * height) / 2;
        if (i === 0) waveformCtx.moveTo(x, y);
        else waveformCtx.lineTo(x, y);
        x += sliceWidth;
    }
    waveformCtx.stroke();
}

function drawAxes(graphCtx, width, height, range) {
    const { xMin, xMax, yMin, yMax } = range;
    graphCtx.save();
    graphCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    graphCtx.lineWidth = 1;
    const zeroX = ((0 - xMin) / (xMax - xMin)) * width;
    const zeroY = ((yMax - 0) / (yMax - yMin)) * height;
    if (zeroY >= 0 && zeroY <= height) {
        graphCtx.beginPath();
        graphCtx.moveTo(0, zeroY);
        graphCtx.lineTo(width, zeroY);
        graphCtx.stroke();
    }
    if (zeroX >= 0 && zeroX <= width) {
        graphCtx.beginPath();
        graphCtx.moveTo(zeroX, 0);
        graphCtx.lineTo(zeroX, height);
        graphCtx.stroke();
    }
    graphCtx.restore();
}

function clamp(value, min, max) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(min, Math.min(max, value));
}

function beautifulPhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function harmonicPhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function fusionPhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function hyperPhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function insanePhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function arachnidPhase(a) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    const eased = t * t * 0.45;
    return 0.05 + (0.42 - 0.05) * eased;
}

function fantasticPhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function incrediblePhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function incomprehensiblePhase(a, min, max) {
    const t = clamp((a - 1.6) / 28.4, 0, 1);
    return min + (max - min) * t;
}

function boolField(hit) {
    return hit ? 0 : 999;
}

function gcd(aIn, bIn = 0) {
    let a = Math.abs(Math.trunc(aIn));
    let b = Math.abs(Math.trunc(bIn));
    if (!Number.isFinite(a)) a = 0;
    if (!Number.isFinite(b)) b = 0;
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return hash;
}
