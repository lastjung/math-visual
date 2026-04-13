/**
 * Math Sound - Cosmos Functions (Independent Module)
 */

export const COSMOS_FUNCTIONS = {
    spiralGalaxy: {
        category: 'cosmos',
        name: 'Spiral Galaxy',
        type: 'parametric',
        x: (t) => {
            const E = 0.35, Lg = 3.2, da = 0.75;
            const d = t / (2 * Math.PI); 
            const dr = E * (1 + Math.cos(2 * Math.PI * d / Lg)) / 2;
            const theta_r = da * d;
            const angle = t * 6; 
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.cos(angle);
        },
        y: (t) => {
            const E = 0.35, Lg = 3.2, da = 0.75;
            const d = t / (2 * Math.PI);
            const dr = E * (1 + Math.cos(2 * Math.PI * d / Lg)) / 2;
            const theta_r = da * d;
            const angle = t * 6;
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.sin(angle);
        },
        formula: 'Galaxy R(θ, d) = d / ellipse(Δθ)',
        latex: 'R_{galaxy}(\\theta, d) = \\frac{d}{\\sqrt{\\frac{\\cos^2(\\theta - \\theta_r)}{(1+dr)^2} + \\frac{\\sin^2(\\theta - \\theta_r)}{(1-dr)^2}}}',
        tRange: { min: 0, max: 3 * Math.PI },
        viewBox: { xMin: -1.8, xMax: 1.8, yMin: -1.8, yMax: 1.8 },
        audioScale: 180,
        baseFreq: 220
    },
    eventHorizon: {
        category: 'cosmos',
        name: 'Event Horizon',
        type: 'parametric',
        x: (t) => {
            const p = t / (2 * Math.PI);
            const E = 0.45;
            const dr = E * (1 + Math.cos(p * Math.PI)) / 2;
            const theta_r = 0.8 * p;
            const d = Math.max(0.4, 6.0 * (1.0 - p * 1.1));
            const angle = t * 10 + Math.pow(p, 6) * 45;
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.cos(angle);
        },
        y: (t) => {
            const p = t / (2 * Math.PI);
            const E = 0.45;
            const dr = E * (1 + Math.cos(p * Math.PI)) / 2;
            const theta_r = 0.8 * p;
            const d = Math.max(0.4, 6.0 * (1.0 - p * 1.1));
            const angle = t * 10 + Math.pow(p, 6) * 45;
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.sin(angle);
        },
        formula: 'Galaxy-style Horizon: R(θ, d) with final vacuum',
        latex: 'R_{cosmos}(\\theta, d) = \\frac{d(p)}{\\text{ellipse}(\\theta, dr(p))}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 150,
        baseFreq: 60
    },
    saturnRings: {
        category: 'cosmos',
        name: "Saturn's Rings",
        type: 'parametric',
        x: (t) => {
            const p = t / (2 * Math.PI);
            const ringRadii = [3.8, 4.0, 4.2, 4.8, 5.0, 5.2];
            const r = ringRadii[Math.floor(p * ringRadii.length) % ringRadii.length];
            const angle = t * 10;
            return r * Math.cos(angle);
        },
        y: (t) => {
            const p = t / (2 * Math.PI);
            const ringRadii = [3.8, 4.0, 4.2, 4.8, 5.0, 5.2];
            const r = ringRadii[Math.floor(p * ringRadii.length) % ringRadii.length];
            const angle = t * 10;
            return r * 0.3 * Math.sin(angle);
        },
        formula: 'Tilted Ring System: x = r·cos(θ), y = 0.3r·sin(θ)',
        latex: '\\begin{cases} x = r \\cos\\theta \\\\ y = 0.3r \\sin\\theta \\end{cases}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
        audioScale: 150,
        baseFreq: 180,
        extraDraw: (ctx, width, height, progress) => {
            const xMin = -6, xMax = 6, yMin = -6, yMax = 6;
            const cx = ((-xMin) / (xMax - xMin)) * width;
            const cy = (yMax / (yMax - yMin)) * height;
            ctx.save();
            ctx.fillStyle = '#dc2626';
            ctx.shadowBlur = 20;
            ctx.shadowColor = 'rgba(220, 38, 38, 0.4)';
            ctx.beginPath();
            ctx.arc(cx, cy, 45, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },
    solarPlasma: {
        category: 'cosmos',
        name: "Solar Plasma",
        type: 'polar',
        r: (theta) => {
            const base = 5;
            const ripples = Math.sin(theta * 60) > 0 ? 1 : 0.88;
            const casini = Math.abs(Math.sin(theta * 3)) < 0.95 ? 1 : 0.3;
            return (base + 1.5 * Math.sin(theta * 10)) * ripples * casini;
        },
        formula: 'Solar Surface: r = (5 + 1.5sin(10θ)) · plasma(θ)',
        latex: 'r = (5 + 1.5\\sin(10\\theta)) \\cdot \\text{plasma}(\\theta)',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        audioScale: 120,
        baseFreq: 100
    },
    pulsarBeam: {
        category: 'cosmos',
        name: 'Pulsar Beam',
        type: 'polar',
        r: (theta) => {
            return 0.2 + 8 * Math.pow(Math.abs(Math.sin(theta)), 250);
        },
        formula: 'r = 8 · |sin(θ)|^500',
        latex: 'r = 8 \\cdot |\\sin\\theta|^{500}',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 400,
        baseFreq: 80
    },
    supernova: {
        category: 'cosmos',
        name: 'Supernova',
        type: 'parametric',
        x: (t) => {
            const p = t / (2 * Math.PI);
            const r = (0.5 + 8 * Math.pow(p, 1.5)) * (1 + 0.12 * Math.sin(t * 30));
            return r * Math.cos(t * 5);
        },
        y: (t) => {
            const p = t / (2 * Math.PI);
            const r = (0.5 + 8 * Math.pow(p, 1.5)) * (1 + 0.12 * Math.sin(t * 30));
            return r * Math.sin(t * 5);
        },
        formula: 'Explosion: r = (0.5+8p^1.5)·(1+0.12sin(30θ))',
        latex: 'r = (0.5 + 8p^{1.5}) \\cdot (1 + 0.12\\sin(30\\theta))',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 120,
        baseFreq: 150
    },
    wormholeTunnel: {
        category: 'cosmos',
        name: 'Wormhole Tunnel',
        type: 'parametric',
        x: (t) => {
            const p = t / (2 * Math.PI);
            const r = 8 * Math.exp(-p * 3);
            return r * Math.cos(t * 15);
        },
        y: (t) => {
            const p = t / (2 * Math.PI);
            const r = 8 * Math.exp(-p * 3);
            return r * Math.sin(t * 15);
        },
        formula: 'Tunnel: r = 8e^-3p, θ = 15t',
        latex: 'r = 8e^{-3p}, \\theta = 15t',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 200,
        baseFreq: 100
    },
    gravitationalWaves: {
        category: 'cosmos',
        name: 'Gravitational Waves',
        type: 'cartesian',
        fn: (x, loopIdx) => {
            const f1 = 8 + (loopIdx % 5);
            const f2 = 8.5 + (loopIdx % 3);
            return Math.sin(x * f1) * Math.sin(x * f2);
        },
        formula: 'Interference: y = sin(f1·x) · sin(f2·x)',
        latex: 'y = \\sin(f_1 x) \\cdot \\sin(f_2 x)',
        range: { xMin: -5, xMax: 5, yMin: -1.5, yMax: 1.5 },
        audioScale: 150,
        baseFreq: 220
    },
    chaosSaw: {
        category: 'chaos',
        name: 'Chaos Sawtooth',
        type: 'cartesian',
        fn: (x) => {
            const tanX = Math.tan(x);
            if (Math.abs(tanX) < 0.01) return 0;
            return (x * Math.floor(1 / tanX)) % 10 / 5;
        },
        formula: 'y = x · floor(1/tan(x))',
        latex: 'y = x \\lfloor \\frac{1}{\\tan x} \\rfloor',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 100,
        baseFreq: 200
    },
    desmosInterference: {
        category: 'chaos',
        name: 'Interference Noise',
        type: 'cartesian',
        fn: (x) => {
            return Math.sin(23 * x) * (23 % (x || 1)) * Math.tan(Math.PI * x);
        },
        formula: 'y = sin(23x) · (23%x) · tan(πx)',
        latex: 'y = \\sin(23x) \\cdot (23 \\pmod x) \\cdot \\tan(\\pi x)',
        range: { xMin: -5, xMax: 5, yMin: -20, yMax: 20 },
        audioScale: 50,
        baseFreq: 180
    },
    nestedSine: {
        category: 'chaos',
        name: 'Nested Sine Glitch',
        type: 'cartesian',
        fn: (x) => {
            const inner = Math.tan(Math.sqrt(Math.abs(x)) + 2 * x);
            let val = Math.sin(inner);
            for(let i=0; i<3; i++) {
                const s = Math.sin(val);
                if (Math.abs(s) < 0.01) break;
                val = 1 / s;
            }
            return (val % 4);
        },
        formula: 'y = 1/sin(1/sin(1/sin(...)))',
        latex: 'y = \\frac{1}{\\sin(\\frac{1}{\\sin(\\frac{1}{\\sin(\\sin(\\tan(\\sqrt{x}+2x)))}))}',
        range: { xMin: 0, xMax: 10, yMin: -5, yMax: 5 },
        audioScale: 80,
        baseFreq: 220
    },
    powerGlitch: {
        category: 'chaos',
        name: 'Power Glitch',
        type: 'cartesian',
        fn: (x) => {
            const xAbs = Math.abs(x) + 1.1; // Offset to avoid 0-gap
            // Balanced glitch power with high frequency sine
            const exponent = Math.sin(x * 8 + Math.cos(x * 4)) * 2;
            return (Math.pow(xAbs, exponent) * 2) % 10 - 2;
        },
        formula: 'y = x^sin(x · √(x · atan x))',
        latex: 'y = x^{\\sin(x \\sqrt{x \\arctan x})}',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 10 },
        audioScale: 100,
        baseFreq: 150
    },
    circularChaos: {
        category: 'chaos',
        name: 'Circular Chaos',
        type: 'polar',
        r: (theta) => {
            return Math.tan(Math.sin(theta * 10)) * Math.floor(Math.cos(theta * 50) + 1.2);
        },
        formula: 'r = tan(sin(10θ)) · floor(cos(50θ))',
        latex: 'r = \\tan(\\sin(10\\theta)) \\cdot \\lfloor \\cos(50\\theta) + 1.2 \\rfloor',
        thetaRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 150,
        baseFreq: 200
    },
    implicitLattice: {
        category: 'chaos',
        name: 'Implicit Lattice',
        type: 'implicit',
        f: (x, y) => {
            const cosX = Math.cos(Math.PI * x);
            if (Math.abs(cosX) < 0.01) return 100;
            return (y * x * x + x * y * y) - (1 / cosX);
        },
        formula: 'yx² + xy² = 1/cos(πx)',
        latex: 'yx^2 + xy^2 = \\sec(\\pi x)',
        viewBox: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 },
        audioScale: 80,
        baseFreq: 120
    },
    hyperbolicDistortion: {
        category: 'chaos',
        name: 'Hyperbolic Maze',
        type: 'implicit',
        f: (x, y) => {
            const val = y * x * x + x * y * y;
            const target = Math.sinh(Math.sin(x * y) * 2);
            return val - target;
        },
        formula: 'yx² + xy² = sinh(2sin(xy))',
        latex: 'yx^2 + xy^2 = \\sinh(2\\sin(xy))',
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        audioScale: 100,
        baseFreq: 140
    },
    quantizedTan: {
        category: 'chaos',
        name: 'Quantized Tan',
        type: 'cartesian',
        fn: (x) => {
            return Math.tan(Math.ceil(x)) % 5;
        },
        formula: 'y = tan(ceil(x))',
        latex: 'y = \\tan(\\lceil x \\rceil)',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 5 },
        audioScale: 120,
        baseFreq: 250
    },
    complexSum: {
        category: 'chaos',
        name: 'Harmonic Summation',
        type: 'cartesian',
        fn: (x) => {
            let sum = 0;
            for(let k=1; k<=5; k++) {
                sum += Math.sin(k * x) / (Math.cos(k * x * 0.5) || 0.1);
            }
            return sum % 10;
        },
        formula: 'y = Σ sin(kx) / cos(0.5kx)',
        latex: 'y = \\sum_{k=1}^5 \\frac{\\sin(kx)}{\\cos(0.5kx)}',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 100,
        baseFreq: 190
    },
    roundedPulse: {
        category: 'chaos',
        name: 'Rounded Pulse',
        type: 'cartesian',
        fn: (x) => {
            const num = Math.sin(x * 1.5);
            const den = Math.cos(x * 0.7);
            const p = Math.pow(num / (den || 0.1), 2);
            return p * Math.round(Math.abs(x) / 2) % 8;
        },
        formula: 'y = (sin(1.5x)/cos(0.7x))² · round(|x|/2)',
        latex: 'y = \\left(\\frac{\\sin(1.5x)}{\\cos(0.7x)}\\right)^2 \\text{round}\\left(\\frac{|x|}{2}\\right)',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 10 },
        audioScale: 90,
        baseFreq: 210
    },
    // ========== 🌊 COSMIC WAVE (Standalone Waves) ==========
    symphonicTan: {
        category: 'cosmic_wave',
        name: 'Symphonic Tangent',
        type: 'cartesian',
        fn: (x) => {
            let y = 0;
            for(let i=0; i<3; i++) {
                y = 2 * Math.sin(x) + Math.tan(y || 0.1) * Math.cos(8.2 * x);
            }
            return Math.max(-20, Math.min(20, y));
        },
        formula: 'y = 2sin(x) + tan(y)cos(8.2x)',
        latex: 'y = 2\\sin x + \\tan y \\cos(8.2x)',
        range: { xMin: -5, xMax: 5, yMin: -15, yMax: 15 },
        audioScale: 70,
        baseFreq: 240
    },
    // ========== 🌊 COSMIC WAVE (Desmos Master Collection: 23 Expressions) ==========
    desmos_1_2: {
        category: 'cosmic_wave',
        name: 'Cosmic Sine (k=1.36)',
        type: 'cartesian',
        fn: (x) => Math.sin(1.36 * x),
        formula: 'y = sin(1.36x)',
        latex: 'y = \\sin(1.36x)',
        range: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
        audioScale: 150,
        baseFreq: 200
    },
    desmos_3_4: {
        category: 'cosmic_wave',
        name: 'Harmonic Super (k2=1)',
        type: 'cartesian',
        fn: (x) => Math.sin(x) + Math.cos(x),
        formula: 'y = sin(x) + cos(x)',
        latex: 'y = \\sin x + \\cos x',
        range: { xMin: -10, xMax: 10, yMin: -2.5, yMax: 2.5 },
        audioScale: 120,
        baseFreq: 180
    },
    desmos_5_6: {
        category: 'cosmic_wave',
        name: 'Glitch Master (k3=9.75)',
        type: 'cartesian',
        fn: (x) => Math.tan(Math.sin(2 * x) * Math.cos(9.75 * x)) + Math.sin(9.75 * x),
        formula: 'y = tan(sin(2x)cos(9.75x)) + sin(9.75x)',
        latex: 'y = \\tan(\\sin(2x)\\cos(9.75x)) + \\sin(9.75x)',
        range: { xMin: -5, xMax: 5, yMin: -10, yMax: 10 },
        audioScale: 80,
        baseFreq: 220
    },
    desmos_7_8: {
        category: 'cosmic_wave',
        name: 'Resonance Spikes (k4=0.4)',
        type: 'cartesian',
        fn: (x) => Math.sin(0.4 * x) * Math.tan(x),
        formula: 'y = sin(0.4x)tan(x)',
        latex: 'y = \\sin(0.4x) \\cdot \\tan x',
        range: { xMin: -10, xMax: 10, yMin: -15, yMax: 15 },
        audioScale: 100,
        baseFreq: 150
    },
    desmos_9_10: {
        category: 'cosmic_wave',
        name: 'Implicit Phase (k5=0)',
        type: 'implicit',
        f: (x, y) => y - 1.5 * Math.sin(x + Math.cos(y)),
        formula: 'y = 1.5sin(x + cos y)',
        latex: 'y = 1.5\\sin(x + \\cos y)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 110,
        baseFreq: 180
    },
    desmos_11_12: {
        category: 'cosmic_wave',
        name: 'Tangent Morph (k6=2.3)',
        type: 'implicit',
        f: (x, y) => y - (2 * Math.sin(x) + Math.tan(y) * Math.cos(2.3 * x)),
        formula: 'y = 2sin x + tan y cos(2.3x)',
        latex: 'y = 2\\sin x + \\tan y \\cos(2.3x)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 90,
        baseFreq: 210
    },
    desmos_13_14: {
        category: 'cosmic_wave',
        name: 'Ripple Distort (k7=0.57)',
        type: 'implicit',
        f: (x, y) => y - 5 * Math.sin(x - Math.PI) * Math.cos(0.57 * y),
        formula: 'y = 5sin(x-π)cos(0.57y)',
        latex: 'y = 5\\sin(x-\\pi)\\cos(0.57y)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 130,
        baseFreq: 140
    },
    desmos_15_16: {
        category: 'cosmic_wave',
        name: 'Inverse Sum (k8=-0.49)',
        type: 'implicit',
        f: (x, y) => y - (Math.cos(x) + Math.sin(y)) / -0.49,
        formula: 'y = (cos x + sin y) / -0.49',
        latex: 'y = \\frac{\\cos x + \\sin y}{-0.49}',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 140,
        baseFreq: 190
    },
    desmos_17_18: {
        category: 'cosmic_wave',
        name: 'Grid Mesh (k9=5)',
        type: 'implicit',
        f: (x, y) => 5 * Math.sin(Math.cos(y) + Math.sin(x)) - (Math.cos(x) + Math.sin(y)),
        formula: '5sin(cos y + sin x) = cos x + sin y',
        latex: '5\\sin(\\cos y + \\sin x) = \\cos x + \\sin y',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 100,
        baseFreq: 160
    },
    desmos_19_20: {
        category: 'cosmic_wave',
        name: 'Symmetry Interference (k10=-5)',
        type: 'implicit',
        f: (x, y) => Math.sin(-5 * Math.cos(y) + Math.sin(x)) - Math.sin(-5 * Math.cos(x) + Math.sin(y)),
        formula: 'sin(-5cos y + sin x) = sin(-5cos x + sin y)',
        latex: '\\sin(-5\\cos y + \\sin x) = \\sin(-5\\cos x + \\sin y)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 110,
        baseFreq: 170
    },
    desmos_21_22: {
        category: 'cosmic_wave',
        name: 'Cyclic Distortion (k11=-0.24)',
        type: 'implicit',
        f: (x, y) => -0.24 * Math.sin(Math.cos(y) + Math.sin(-0.24 * x)) - Math.cos(Math.cos(x) + Math.sin(y)),
        formula: 'k11 sin(cos y + sin k11x) = cos(cos x + sin y)',
        latex: 'k_{11}\\sin(\\cos y + \\sin k_{11}x) = \\cos(\\cos x + \\sin y)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 120,
        baseFreq: 180
    },
    desmos_23: {
        category: 'cosmic_wave',
        name: 'Final Matrix (k12=5)',
        type: 'implicit',
        f: (x, y) => Math.sin(5 * Math.sin(y) * Math.sin(x)) - Math.cos(5 * Math.cos(x) + Math.sin(y)),
        formula: 'sin(k12 sin y sin x) = cos(k12 cos x + sin y)',
        latex: '\\sin(k_{12}\\sin y\\sin x) = \\cos(k_{12}\\cos x + \\sin y)',
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        audioScale: 130,
        baseFreq: 220
    }
};
