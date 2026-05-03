import { state, elements, ctx } from './state.js';

export const SIM_CATEGORIES = {
    'amazing-plus': {
        name: '✨ Amazing+',
        functions: [
            'amazingPlusStandard',
            'amazingPlusExpanding',
            'amazingPlusEnvelope',
            'amazingPlusResonance'
        ]
    },
    'beautiful-plus': { name: '💖 Beautiful+', functions: [] },
    'harmonic-plus': { name: '🎼 Harmonic+', functions: [] },
    'fusion-plus': { name: '🌀 Fusion+', functions: [] },
    'hyper-plus': { name: '✨ Hyper+', functions: [] }
};

const TIGHT_RANGE = { xMin: -10, xMax: 10, yMin: -2, yMax: 2 };
const WIDE_RANGE = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };
const BASE_TIMING = { durationMs: 16000, drawMs: 6000 };
const BASE_LAYERS = {
    standard: {
        id: 'standard',
        label: 'Standard Resonance',
        color: '#ff3b5f',
        baseFreq: 220,
        audioScale: 150,
        gain: 0.38,
        fn: (x, a) => Math.cos(a * x)
    },
    expanding: {
        id: 'expanding',
        label: 'Expanding Resonance',
        color: '#00f5ff',
        baseFreq: 260,
        audioScale: 120,
        gain: 0.34,
        fn: (x, a) => (x / 5) * Math.cos(a * x)
    },
    envelope: {
        id: 'envelope',
        label: 'Envelope Modulation',
        color: '#fff45c',
        baseFreq: 330,
        audioScale: 180,
        gain: 0.32,
        fn: (x, a) => Math.cos(x) * Math.cos(a * x)
    }
};

export const SIM_FUNCTIONS = {
    amazingPlusResonance: {
        category: 'amazing-plus',
        name: 'Amazing Resonance Sim',
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
        type: 'single',
        formula: 'y = cos(x)cos(ax)',
        latex: 'y=\\cos(x)\\cos(ax)',
        range: TIGHT_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.envelope]
    }
};

const simAudio = {
    context: null,
    master: null,
    filter: null,
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
        simAudio.filter.type = 'lowpass';
        simAudio.filter.frequency.value = 3600;
        simAudio.filter.Q.value = 0.7;
        simAudio.filter.connect(simAudio.master);
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
        osc.type = layer.id === 'expanding' ? 'triangle' : 'sine';
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
        graphCtx.beginPath();
        graphCtx.strokeStyle = layer.color;
        graphCtx.lineWidth = layer.id === 'standard' ? 3 : 2.2;
        let first = true;
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
                graphCtx.moveTo(px, py);
                first = false;
            } else {
                graphCtx.lineTo(px, py);
            }
        }
        graphCtx.stroke();
        graphCtx.restore();
    });
}

function updateAudio(sim, progress, a) {
    if (!simAudio.context || !simAudio.layers.length) return;
    const now = simAudio.context.currentTime;
    const { xMin, xMax } = sim.range;
    const x = xMin + (xMax - xMin) * progress;
    let brightness = 0;

    simAudio.layers.forEach((layer, index) => {
        const simLayer = sim.layers[index];
        const y = clamp(simLayer.fn(x, a), -1, 1);
        const yAhead = clamp(simLayer.fn(Math.min(xMax, x + 0.02), a), -1, 1);
        const slope = clamp(Math.abs((yAhead - y) / 0.02) / 18, 0, 1);
        const freq = simLayer.baseFreq + y * simLayer.audioScale;
        const gain = simLayer.gain * (0.4 + Math.abs(y) * 0.65 + slope * 0.5);
        layer.osc.frequency.setTargetAtTime(clamp(freq, 35, 2400), now, 0.035);
        layer.gain.gain.setTargetAtTime(Math.max(0.0001, gain), now, 0.035);
        brightness += slope;
    });

    simAudio.filter.frequency.setTargetAtTime(1200 + clamp(brightness / simAudio.layers.length, 0, 1) * 4200, now, 0.05);
}

function updateHud(sim, a) {
    if (!elements.simHud) return;
    elements.simHud.hidden = false;
    if (elements.simHudA) {
        elements.simHudA.textContent = `a = ${a.toFixed(2)}`;
    }
    if (elements.simHudLayers) {
        const label = sim.layers.length === 1 ? sim.layers[0].label : `${sim.layers.length} layers`;
        elements.simHudLayers.textContent = label;
    }
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
