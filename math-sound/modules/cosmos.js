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
    }
};
