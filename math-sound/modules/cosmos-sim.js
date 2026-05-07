/**
 * Math Sound - Cosmos Simulation Engine (Cosmos+, Chaos+ & Cosmic Wave+ v1.0)
 */
import { state, elements, ctx } from './state.js';

const lorenzCache = { x: [], y: [] };
const ikedaCache = { x: [], y: [] };

// ==========================================
// Categories
// ==========================================
export const COSMOS_SIM_CATEGORIES = {
    'cosmos-plus': {
        name: '🌌 Cosmos+',
        functions: [
            'spiralGalaxySim', 'eventHorizonSim', 'saturnRingsSim', 'solarPlasmaSim', 
            'pulsarBeamSim', 'supernovaSim', 'wormholeTunnelSim', 'gravitationalWavesSim'
        ]
    },
    'chaos-plus': {
        name: '💾 Chaos+',
        functions: [
            'lorenzAttractorSim', 'ikedaMapSim', 'nestedSineSim', 'chaosSawSim', 
            'circularChaosSim', 'desmosInterferenceSim', 'powerGlitchSim'
        ]
    },
    'cosmic-wave-plus': {
        name: '🌊 Cosmic Wave+',
        functions: [
            'symphonicTanSim', 'glitchMasterSim', 'deepMatrixSim', 'secantGateSim', 'circularSineSim'
        ]
    }
};

// ==========================================
// Helper: Unique Monochromatic Color
// ==========================================
function getSimColor() {
    const sim = COSMOS_SIM_FUNCTIONS[simAudio.functionId];
    if (sim && sim.color) return sim.color;
    
    const hue = ((state.functionIndex || 0) * 137.5) % 360;
    const saturation = 85;
    const lightness = state.theme === 'dark' ? 68 : 45;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// ==========================================
// Functions (a, b Control)
// ==========================================
export const COSMOS_SIM_FUNCTIONS = {
    spiralGalaxySim: {
        id: 'spiralGalaxySim', category: 'cosmos-plus', name: 'Spiral Galaxy', type: 'parametric',
        formula: 'R_galaxy(θ, d) = d / ellipse(Δθ)',
        latex: 'R_{galaxy}(\\theta, d) = \\frac{d}{\\sqrt{\\frac{\\cos^2(\\theta - \\theta_r)}{(1+dr)^2} + \\frac{\\sin^2(\\theta - \\theta_r)}{(1-dr)^2}}}',
        tRange: { min: 0, max: 3 * Math.PI },
        viewBox: { xMin: -1.8, xMax: 1.8, yMin: -1.8, yMax: 1.8 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Arm Warp', min: 0.1, max: 0.8, default: 0.35 },
        varB: { name: 'Spin Density', min: 0.2, max: 2.0, default: 0.75 },
        x: (t, a, b) => {
            const E = a, Lg = 3.2, da = b;
            const d = t / (2 * Math.PI); 
            const dr = E * (1 + Math.cos(2 * Math.PI * d / Lg)) / 2;
            const theta_r = da * d;
            const angle = t * 6; 
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.cos(angle);
        },
        y: (t, a, b) => {
            const E = a, Lg = 3.2, da = b;
            const d = t / (2 * Math.PI);
            const dr = E * (1 + Math.cos(2 * Math.PI * d / Lg)) / 2;
            const theta_r = da * d;
            const angle = t * 6;
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.sin(angle);
        },
        audioScale: 180, baseFreq: 220
    },
    eventHorizonSim: {
        id: 'eventHorizonSim', category: 'cosmos-plus', name: 'Event Horizon', type: 'parametric',
        formula: 'Galaxy-style Horizon: R(θ, d) with final vacuum',
        latex: 'R_{cosmos}(\\theta, d) = \\frac{d(p)}{\\text{ellipse}(\\theta, dr(p))}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Core Gravity', min: 0.5, max: 2.0, default: 1.1 },
        varB: { name: 'Accretion Spin', min: 5.0, max: 30.0, default: 10.0 },
        x: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const E = 0.45;
            const dr = E * (1 + Math.cos(p * Math.PI)) / 2;
            const theta_r = 0.8 * p;
            const d = Math.max(0.4, 6.0 * (1.0 - p * a));
            const angle = t * b + Math.pow(p, 6) * 45;
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.cos(angle);
        },
        y: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const E = 0.45;
            const dr = E * (1 + Math.cos(p * Math.PI)) / 2;
            const theta_r = 0.8 * p;
            const d = Math.max(0.4, 6.0 * (1.0 - p * a));
            const angle = t * b + Math.pow(p, 6) * 45;
            const denom = Math.sqrt(Math.pow(Math.cos(angle - theta_r) / (1 + dr), 2) + Math.pow(Math.sin(angle - theta_r) / (1 - dr), 2));
            const r = d / denom;
            return r * Math.sin(angle);
        },
        audioScale: 150, baseFreq: 60
    },
    saturnRingsSim: {
        id: 'saturnRingsSim', category: 'cosmos-plus', name: "Saturn's Rings", type: 'parametric',
        formula: 'Tilted Ring System: x = r·cos(θ), y = 0.3r·sin(θ)',
        latex: '\\begin{cases} x = r \\cos\\theta \\\\ y = 0.3r \\sin\\theta \\end{cases}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Tilt Factor', min: 0.1, max: 0.9, default: 0.3 },
        varB: { name: 'Ring Density', min: 2.0, max: 8.0, default: 5.0 },
        x: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const ringRadii = [3.8, 4.0, 4.2, 4.8, 5.0, 5.2];
            const r = ringRadii[Math.floor(p * ringRadii.length) % ringRadii.length] * (b / 5);
            const angle = t * 10;
            return r * Math.cos(angle);
        },
        y: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const ringRadii = [3.8, 4.0, 4.2, 4.8, 5.0, 5.2];
            const r = ringRadii[Math.floor(p * ringRadii.length) % ringRadii.length] * (b / 5);
            const angle = t * 10;
            return r * a * Math.sin(angle);
        },
        audioScale: 150, baseFreq: 180,
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
    wormholeTunnelSim: {
        id: 'wormholeTunnelSim', category: 'cosmos-plus', name: 'Wormhole Tunnel', type: 'parametric',
        formula: 'Tunnel: r = 8e^-3p, θ = 15t',
        latex: 'r = 8e^{-3p}, \\theta = 15t',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Contraction', min: 1.0, max: 6.0, default: 3.0 },
        varB: { name: 'Spin Velocity', min: 5.0, max: 30.0, default: 15.0 },
        x: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const r = 8 * Math.exp(-p * a);
            return r * Math.cos(t * b);
        },
        y: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const r = 8 * Math.exp(-p * a);
            return r * Math.sin(t * b);
        },
        audioScale: 200, baseFreq: 100
    },
    lorenzAttractorSim: {
        id: 'lorenzAttractorSim', category: 'chaos-plus', name: 'Lorenz Butterfly', type: 'parametric',
        formula: 'dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz',
        latex: '\\begin{cases} \\dot{x} = \\sigma(y-x) \\\\ \\dot{y} = x(\\rho-z)-y \\\\ \\dot{z} = xy-\\beta z \\end{cases}',
        tRange: { min: 0, max: 25 },
        viewBox: { xMin: -15, xMax: 15, yMin: -2, yMax: 28 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Chaos (Rho)', min: 10, max: 40, default: 28 },
        varB: { name: 'Size', min: 0.1, max: 1.0, default: 0.5 },
        precompute: (a, b, steps) => {
            lorenzCache.x = [];
            lorenzCache.y = [];
            let xx = 0.1, yy = 0.0, zz = 0.0;
            const dt = 0.015;
            const sigma = 10;
            const beta = 8/3;
            const rho = a;
            for (let i = 0; i <= steps; i++) {
                const dx = sigma * (yy - xx) * dt;
                const dy = (xx * (rho - zz) - yy) * dt;
                const dz = (xx * yy - beta * zz) * dt;
                xx += dx; yy += dy; zz += dz;
                lorenzCache.x.push(xx * 0.7 * b);
                lorenzCache.y.push((zz - 20) * 0.7 * b);
            }
        },
        x: (t, a, b) => {
            const idx = Math.min(lorenzCache.x.length - 1, Math.floor((t / 25) * lorenzCache.x.length));
            return lorenzCache.x[idx] || 0;
        },
        y: (t, a, b) => {
            const idx = Math.min(lorenzCache.y.length - 1, Math.floor((t / 25) * lorenzCache.y.length));
            return lorenzCache.y[idx] || 0;
        },
        audioScale: 200, baseFreq: 180
    },
    ikedaMapSim: {
        id: 'ikedaMapSim', category: 'chaos-plus', name: 'Ikeda Map Chaos', type: 'parametric',
        formula: 'x_n+1 = 1 + u(x cos t - y sin t)',
        latex: 't_n = 0.4 - \\frac{6}{1+x_n^2+y_n^2}, \\quad x_{n+1} = 1 + u(x_n\\cos t_n - y_n\\sin t_n)',
        tRange: { min: 0, max: 20 },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Laser Power', min: 0.5, max: 0.99, default: 0.9 },
        varB: { name: 'Scale', min: 1.0, max: 8.0, default: 5.0 },
        precompute: (a, b, steps) => {
            ikedaCache.x = [];
            ikedaCache.y = [];
            let xx = 0.1, yy = 0.1;
            const u = a;
            for (let i = 0; i <= steps; i++) {
                const tn = 0.4 - 6 / (1 + xx * xx + yy * yy);
                const nextX = 1 + u * (xx * Math.cos(tn) - yy * Math.sin(tn));
                const nextY = u * (xx * Math.sin(tn) + yy * Math.cos(tn));
                xx = nextX; yy = nextY;
                ikedaCache.x.push(xx * b - b/2);
                ikedaCache.y.push(yy * b - b/2);
            }
        },
        x: (t, a, b) => {
            const idx = Math.min(ikedaCache.x.length - 1, Math.floor((t / 20) * ikedaCache.x.length));
            return ikedaCache.x[idx] || 0;
        },
        y: (t, a, b) => {
            const idx = Math.min(ikedaCache.y.length - 1, Math.floor((t / 20) * ikedaCache.y.length));
            return ikedaCache.y[idx] || 0;
        },
        audioScale: 150, baseFreq: 150
    },
    nestedSineSim: {
        id: 'nestedSineSim', category: 'chaos-plus', name: 'Nested Sine Glitch', type: 'cartesian',
        formula: 'y = sin(ax + sin(ax + sin(ax)))',
        latex: 'y = \\sin(ax + \\sin(ax + \\sin(ax)))',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Warp Speed', min: 0.5, max: 10.0, default: 2.0 },
        varB: { name: 'Fractal Depth', min: 1.0, max: 8.0, default: 3.0 },
        fn: (x, a, b) => {
            const inner = Math.tan(Math.sqrt(Math.abs(x)) + a * x);
            let val = Math.sin(inner);
            const depth = Math.floor(b);
            for(let i=0; i<depth; i++) {
                const s = Math.sin(val);
                if (Math.abs(s) < 0.01) break;
                val = 1 / s;
            }
            return (val % 4);
        },
        audioScale: 120, baseFreq: 220
    },
    symphonicTanSim: {
        id: 'symphonicTanSim', category: 'cosmic-wave-plus', name: 'Symphonic Tangent', type: 'cartesian',
        formula: 'y = 2sin(x) + tan(y)cos(8.2x)',
        latex: 'y = 2\\sin x + \\tan y \\cos(8.2x)',
        range: { xMin: -5, xMax: 5, yMin: -15, yMax: 15 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Intensity', min: 1.0, max: 4.0, default: 2.0 },
        varB: { name: 'Resonant Freq', min: 4.0, max: 15.0, default: 8.2 },
        fn: (x, a, b) => {
            let y = 0;
            for(let i=0; i<3; i++) {
                y = a * Math.sin(x) + Math.tan(y || 0.1) * Math.cos(b * x);
            }
            return Math.max(-20, Math.min(20, y));
        },
        audioScale: 70, baseFreq: 240
    },
    glitchMasterSim: {
        id: 'glitchMasterSim', category: 'cosmic-wave-plus', name: 'Glitch Master Wave', type: 'cartesian',
        formula: 'y = tan(sin(2x)cos(bx)) + sin(ax)',
        latex: 'y = \\tan(\\sin(2x)\\cos(b x)) + \\sin(a x)',
        range: { xMin: -5, xMax: 5, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Modulation', min: 2.0, max: 20.0, default: 9.75 },
        varB: { name: 'Noise Freq', min: 1.0, max: 15.0, default: 9.75 },
        fn: (x, a, b) => {
            return Math.tan(Math.sin(2 * x) * Math.cos(b * x)) + Math.sin(a * x);
        },
        audioScale: 80, baseFreq: 220
    },
    solarPlasmaSim: {
        id: 'solarPlasmaSim', category: 'cosmos-plus', name: 'Solar Plasma', type: 'polar',
        formula: 'r = (5 + b·sin(10θ)) · ripples(θ, a)',
        latex: 'r = (5 + b\\sin(10\\theta)) \\cdot \\text{plasma}(\\theta, a)',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Surface Ripple', min: 10, max: 120, default: 60 },
        varB: { name: 'Resonance Depth', min: 0.5, max: 2.5, default: 1.5 },
        r: (theta, a, b) => {
            const base = 5;
            const ripples = Math.sin(theta * a) > 0 ? 1 : 0.88;
            const casini = Math.abs(Math.sin(theta * 3)) < 0.95 ? 1 : 0.3;
            return (base + b * Math.sin(theta * 10)) * ripples * casini;
        },
        audioScale: 120, baseFreq: 100
    },
    pulsarBeamSim: {
        id: 'pulsarBeamSim', category: 'cosmos-plus', name: 'Pulsar Beam', type: 'polar',
        formula: 'r = 0.2 + b · |sin(θ)|^a',
        latex: 'r = 0.2 + b \\cdot |\\sin\\theta|^{a}',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Beam Sharpness', min: 50, max: 500, default: 250 },
        varB: { name: 'Beam Scale', min: 2.0, max: 15.0, default: 8.0 },
        r: (theta, a, b) => {
            return 0.2 + b * Math.pow(Math.abs(Math.sin(theta)), a);
        },
        audioScale: 400, baseFreq: 80
    },
    supernovaSim: {
        id: 'supernovaSim', category: 'cosmos-plus', name: 'Supernova', type: 'parametric',
        formula: 'r = (0.5+8p^1.5)·(1+0.12sin(a·t)), spin = b·t',
        latex: 'r = (0.5 + 8p^{1.5}) \\cdot (1 + 0.12\\sin(a t))',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Ejecta Ripples', min: 10, max: 60, default: 30 },
        varB: { name: 'Shockwave Speed', min: 2, max: 12, default: 5 },
        x: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const r = (0.5 + 8 * Math.pow(p, 1.5)) * (1 + 0.12 * Math.sin(t * a));
            return r * Math.cos(t * b);
        },
        y: (t, a, b) => {
            const p = t / (2 * Math.PI);
            const r = (0.5 + 8 * Math.pow(p, 1.5)) * (1 + 0.12 * Math.sin(t * a));
            return r * Math.sin(t * b);
        },
        audioScale: 120, baseFreq: 150
    },
    gravitationalWavesSim: {
        id: 'gravitationalWavesSim', category: 'cosmos-plus', name: 'Gravitational Waves', type: 'cartesian',
        formula: 'y = sin(a·x) · sin(b·x)',
        latex: 'y = \\sin(a x) \\cdot \\sin(b x)',
        range: { xMin: -5, xMax: 5, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Frequency A', min: 2.0, max: 15.0, default: 8.0 },
        varB: { name: 'Frequency B', min: 2.0, max: 15.0, default: 8.5 },
        fn: (x, a, b) => {
            return Math.sin(x * a) * Math.sin(x * b);
        },
        audioScale: 150, baseFreq: 220
    },
    chaosSawSim: {
        id: 'chaosSawSim', category: 'chaos-plus', name: 'Chaos Sawtooth', type: 'cartesian',
        formula: 'y = (x·floor(a/tan(x))) % 10 / b',
        latex: 'y = x \\lfloor \\frac{a}{\\tan x} \\rfloor \\div b',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Saw Step', min: 0.1, max: 2.0, default: 1.0 },
        varB: { name: 'Scale Factor', min: 1.0, max: 10.0, default: 5.0 },
        fn: (x, a, b) => {
            const tanX = Math.tan(x);
            if (Math.abs(tanX) < 0.01) return 0;
            return (x * Math.floor(a / tanX)) % 10 / b;
        },
        audioScale: 100, baseFreq: 200
    },
    circularChaosSim: {
        id: 'circularChaosSim', category: 'chaos-plus', name: 'Circular Chaos', type: 'polar',
        formula: 'r = tan(sin(a·θ)) · floor(cos(b·θ)+1.2)',
        latex: 'r = \\tan(\\sin(a\\theta)) \\cdot \\lfloor \\cos(b\\theta) + 1.2 \\rfloor',
        tRange: { min: 0, max: 2 * Math.PI },
        viewBox: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Modulation', min: 5, max: 25, default: 10 },
        varB: { name: 'Noise Density', min: 10, max: 80, default: 50 },
        r: (theta, a, b) => {
            return Math.tan(Math.sin(theta * a)) * Math.floor(Math.cos(theta * b) + 1.2);
        },
        audioScale: 150, baseFreq: 200
    },
    desmosInterferenceSim: {
        id: 'desmosInterferenceSim', category: 'chaos-plus', name: 'Interference Noise', type: 'cartesian',
        formula: 'y = sin(a·x) · (a%x) · tan(b·π·x)',
        latex: 'y = \\sin(a x) \\cdot (a \\pmod x) \\cdot \\tan(b \\pi x)',
        range: { xMin: -5, xMax: 5, yMin: -20, yMax: 20 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Spike Pitch', min: 10, max: 50, default: 23 },
        varB: { name: 'Mod Frequency', min: 0.5, max: 4.0, default: 1.0 },
        fn: (x, a, b) => {
            return Math.sin(a * x) * (a % (x || 1)) * Math.tan(b * Math.PI * x);
        },
        audioScale: 50, baseFreq: 180
    },
    powerGlitchSim: {
        id: 'powerGlitchSim', category: 'chaos-plus', name: 'Power Glitch', type: 'cartesian',
        formula: 'y = x^sin(x · cos(x·b)) · a',
        latex: 'y = x^{\\sin(x \\cos(x \\cdot b))} \\cdot a',
        range: { xMin: -10, xMax: 10, yMin: -5, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Glitch Power', min: 1.0, max: 6.0, default: 2.0 },
        varB: { name: 'Noise Modulation', min: 2, max: 16, default: 8 },
        fn: (x, a, b) => {
            const xAbs = Math.abs(x) + 1.1;
            const exponent = Math.sin(x * b + Math.cos(x * 4)) * a;
            return (Math.pow(xAbs, exponent) * 2) % 10 - 2;
        },
        audioScale: 100, baseFreq: 150
    },
    deepMatrixSim: {
        id: 'deepMatrixSim', category: 'cosmic-wave-plus', name: 'Deep Matrix', type: 'cartesian',
        formula: 'y = a · sin(a · sin(y) · sin(x)) - cos(cos(x) · sin(y))',
        latex: 'y = a\\sin(a\\sin y\\sin x) - \\cos(\\cos x\\sin y)',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Grid Density', min: -20, max: -2, default: -10 },
        varB: { name: 'Wave Phase', min: 1.0, max: 10.0, default: 5.0 },
        fn: (x, a, b) => {
            let y = 0;
            for(let i=0; i<3; i++) {
                y = a * Math.sin(a * Math.sin(y || 0.1) * Math.sin(x)) - Math.cos(Math.cos(x) * Math.sin(y || 0.1));
            }
            return y;
        },
        audioScale: 100, baseFreq: 150
    },
    secantGateSim: {
        id: 'secantGateSim', category: 'cosmic-wave-plus', name: 'Secant Gate', type: 'cartesian',
        formula: 'y = a · sin(sin(x) + cos(y)) - sin(a·y) + sec(x)',
        latex: 'y = a\\sin(\\sin x + \\cos y) - \\sin(ay) + \\sec x',
        range: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Gate Frequency', min: 0.5, max: 5.0, default: 1.53 },
        varB: { name: 'Orbit Wave', min: 1.0, max: 10.0, default: 5.0 },
        fn: (x, a, b) => {
            let y = 0;
            const secX = 1 / (Math.cos(x) || 0.1);
            for(let i=0; i<3; i++) {
                y = a * Math.sin(Math.sin(x) + Math.cos(y || 0.1)) - Math.sin(a * (y || 0.1)) + secX;
            }
            return Math.max(-15, Math.min(15, y));
        },
        audioScale: 120, baseFreq: 240
    },
    circularSineSim: {
        id: 'circularSineSim', category: 'cosmic-wave-plus', name: 'Circular Sine', type: 'cartesian',
        formula: 'y = b · x · sin(x² + y² + a)',
        latex: 'y = b x \\sin(x^2 + y^2 + a)',
        range: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
        drawMs: 2000, durationMs: 12000,
        varA: { name: 'Orbit Phase', min: 2.0, max: 30.0, default: 12.5 },
        varB: { name: 'Warp Factor', min: 0.5, max: 4.0, default: 1.0 },
        fn: (x, a, b) => {
            let y = 0;
            for(let i=0; i<3; i++) {
                y = b * x * Math.sin(x * x + y * y + a);
            }
            return y;
        },
        audioScale: 140, baseFreq: 180
    }
};

// ==========================================
// Internal State & Audio Engine
// ==========================================
const simAudio = {
    context: null, master: null, filter: null, analyser: null,
    osc: null, gain: null, rafId: null, startedAt: 0, functionId: null
};

export function isCosmosSimCategory(category) { return !!COSMOS_SIM_CATEGORIES[category]; }
export function isCosmosSimFunction(functionId) { return !!COSMOS_SIM_FUNCTIONS[functionId]; }

export function drawCosmosSimStatic(functionId) {
    const sim = COSMOS_SIM_FUNCTIONS[functionId];
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

export function startCosmosSim(functionId) {
    const sim = COSMOS_SIM_FUNCTIONS[functionId];
    if (!sim) return;
    ensureAudio(sim);
    stopCosmosSim({ keepAudio: true });
    simAudio.functionId = functionId;
    simAudio.startedAt = performance.now();
    if (simAudio.context.state === 'suspended') simAudio.context.resume();
    simAudio.master.gain.setTargetAtTime(Math.max(0.001, state.volume * 1.15), simAudio.context.currentTime, 0.04);
    tick();
}

export function stopCosmosSim(options = {}) {
    if (simAudio.rafId !== null) { cancelAnimationFrame(simAudio.rafId); simAudio.rafId = null; }
    if (!options.keepAudio && simAudio.master) simAudio.master.gain.setTargetAtTime(0.0001, simAudio.context.currentTime, 0.04);
    if (!options.keepHud && elements.simHud) elements.simHud.hidden = true;
}

export function resetCosmosSim(functionId) { stopCosmosSim(); drawCosmosSimStatic(functionId); }

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
    const sim = COSMOS_SIM_FUNCTIONS[simAudio.functionId];
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
    
    if (elements.canvasClock) {
        const total = Math.floor(elapsed);
        const mm = String(Math.floor(total / 60000)).padStart(2, '0');
        const ss = String(Math.floor((total % 60000) / 1000)).padStart(2, '0');
        const ms = String(Math.floor((total % 1000) / 10)).padStart(2, '0');
        elements.canvasClock.textContent = `${mm}:${ss}.${ms}`;
    }
    
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
    
    if (sim.precompute) {
        sim.precompute(valA, valB, totalSteps);
    }

    graphCtx.lineWidth = 2.8;
    graphCtx.lineJoin = 'round'; graphCtx.lineCap = 'round';

    let currentTurn = -1;
    let prevPx = 0, prevPy = 0;
    let first = true;

    for (let i = 0; i <= steps; i++) {
        let x, y;
        const p = i / totalSteps;
        let turn = 0;

        if (sim.type === 'cartesian') {
            x = xMin + p * (xMax - xMin); y = sim.fn(x, valA, valB);
        } else if (sim.type === 'parametric') {
            const t = sim.tRange.min + p * (sim.tRange.max - sim.tRange.min);
            turn = Math.floor((t - sim.tRange.min) / (2 * Math.PI));
            x = sim.x(t, valA, valB); y = sim.y(t, valA, valB);
        } else if (sim.type === 'polar') {
            const theta = sim.tRange.min + p * (sim.tRange.max - sim.tRange.min);
            turn = Math.floor((theta - sim.tRange.min) / (2 * Math.PI));
            const r = sim.r(theta, valA, valB);
            x = r * Math.cos(theta); y = r * Math.sin(theta);
        }

        if (!Number.isFinite(x) || !Number.isFinite(y)) { first = true; continue; }
        const px = ((x - xMin) / (xMax - xMin)) * width;
        const py = ((yMax - y) / (yMax - yMin)) * height;

        if (turn !== currentTurn) {
            if (currentTurn !== -1) {
                graphCtx.stroke();
            }
            currentTurn = turn;
            graphCtx.beginPath();
            
            const baseHue = ((state.functionIndex || 0) * 137.5) % 360;
            const hue = (baseHue + turn * 35) % 360;
            const saturation = 85;
            const lightness = state.theme === 'dark' ? 68 : 45;
            graphCtx.strokeStyle = sim.color ? sim.color : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            if (i > 0) {
                graphCtx.moveTo(prevPx, prevPy);
                first = false;
            } else {
                first = true;
            }
        }

        if (first) { graphCtx.moveTo(px, py); first = false; } else { graphCtx.lineTo(px, py); }
        
        prevPx = px;
        prevPy = py;
    }
    graphCtx.stroke();

}

function updateAudio(sim, progress, valA, valB) {
    if (!simAudio.osc) return;
    const now = simAudio.context.currentTime;
    const elapsed = (performance.now() - simAudio.startedAt) * state.speed;
    const motion = getMotionVariables(sim, progress, valA, valB);
    
    const travel = progress < 1.0 ? progress : 1.0;

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

    if (sim.id === 'spiralGalaxySim') {
        dynamicBase *= (1 + valA);
    } else if (sim.id === 'eventHorizonSim') {
        dynamicBase *= (valB / 10.0) / valA;
    } else if (sim.id === 'wormholeTunnelSim') {
        dynamicBase *= (valA / 3.0);
    } else if (sim.id === 'lorenzAttractorSim') {
        dynamicBase *= (0.5 + valB);
    } else if (sim.id === 'ikedaMapSim') {
        dynamicBase *= (valA * 1.5);
    } else if (sim.id === 'symphonicTanSim') {
        dynamicBase *= (valB / 8.2);
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
        simAudio.filter.frequency.setTargetAtTime(Math.max(100, Math.min(18000, f)), now, 0.04);
    }
}

function getMotionVariables(sim, progress, valA, valB) {
    const totalSteps = 400;
    const t = progress;
    const dt = 0.002;
    const p0 = pointForSim(sim, Math.max(0, t - dt), valA, valB);
    const p1 = pointForSim(sim, t, valA, valB);
    const p2 = pointForSim(sim, Math.min(1, t + dt), valA, valB);
    
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
    
    const labelA = `${sim.varA.name} a = ${valA.toFixed(2)}`;
    const labelB = `${sim.varB.name} b = ${valB.toFixed(2)}`;

    if (elements.simHudA) elements.simHudA.textContent = `${labelA} ${isPhaseA ? '✦' : ''}`;
    if (elements.simHudLayers) elements.simHudLayers.textContent = `${labelB} ${!isPhaseA && isPhaseA !== null ? '✦' : ''}`;

    if (elements.functionSubtitle) {
        elements.functionSubtitle.textContent = `${labelA} | ${labelB}`;
    }
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
