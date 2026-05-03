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
    'beautiful-plus': { name: '💖 Beautiful+', functions: [] },
    'harmonic-plus': { name: '🎼 Harmonic+', functions: [] },
    'fusion-plus': { name: '🌀 Fusion+', functions: [] },
    'hyper-plus': { name: '✨ Hyper+', functions: [] }
};

const TIGHT_RANGE = { xMin: -10, xMax: 10, yMin: -2, yMax: 2 };
const WIDE_RANGE = { xMin: -10, xMax: 10, yMin: -5, yMax: 5 };
const GRID_RANGE = { xMin: -18, xMax: 18, yMin: -18, yMax: 18 };
const RADIAL_RANGE = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
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
    },
    grid: {
        id: 'grid',
        label: 'Grid Distortion',
        type: 'parametric',
        color: '#a855f7',
        baseFreq: 440,
        audioScale: 100,
        gain: 0.3,
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
        f: (x, y, a) => {
            const aa = 5 + a * 1.6;
            return y - 4.8 * Math.cos((aa * x * y) / (x * x + y * y + 0.1));
        }
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
    },
    amazingPlusGridDistortion: {
        category: 'amazing-plus',
        name: 'Grid Distortion',
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
        type: 'single',
        formula: 'y = 4.8 cos(axy / (x²+y²+0.1))',
        latex: 'y=4.8\\cos\\left(\\frac{axy}{x^2+y^2+0.1}\\right)',
        range: RADIAL_RANGE,
        ...BASE_TIMING,
        layers: [BASE_LAYERS.radial]
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
        } else if (layer.type === 'implicit') {
            drawImplicitLayer(graphCtx, layer, sim.range, width, height, progress, a);
        } else {
            graphCtx.beginPath();
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

    for (let i = 0; i <= steps; i++) {
        const t = tMin + ((tMax - tMin) * i) / totalSteps;
        const x = layer.x(t, a);
        const y = layer.y(t, a);
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
            graphCtx.moveTo(px, py);
            first = false;
        } else {
            graphCtx.lineTo(px, py);
        }
    }
    graphCtx.stroke();
}

function drawImplicitLayer(graphCtx, layer, range, width, height, progress, a) {
    const { xMin, xMax, yMin, yMax } = range;
    const resX = 180;
    const resY = 180;
    const cols = Math.max(2, Math.floor(resX * progress));
    const cellW = width / resX;
    const cellH = height / resY;
    const threshold = 0.08;
    graphCtx.fillStyle = layer.color;

    for (let i = 0; i <= cols; i++) {
        const x = xMin + ((xMax - xMin) * i) / resX;
        for (let j = 0; j <= resY; j++) {
            const y = yMin + ((yMax - yMin) * j) / resY;
            const v = layer.f(x, y, a);
            if (Number.isFinite(v) && Math.abs(v) < threshold) {
                const px = ((x - xMin) / (xMax - xMin)) * width;
                const py = ((yMax - y) / (yMax - yMin)) * height;
                graphCtx.globalAlpha = 0.86;
                graphCtx.fillRect(px, py, Math.max(1.2, cellW * 1.35), Math.max(1.2, cellH * 1.35));
            }
        }
    }
    graphCtx.globalAlpha = 1;
}

function updateAudio(sim, progress, a) {
    if (!simAudio.context || !simAudio.layers.length) return;
    const now = simAudio.context.currentTime;
    let brightness = 0;

    simAudio.layers.forEach((layer, index) => {
        const simLayer = sim.layers[index];
        const y = clamp(sampleLayerY(simLayer, sim.range, progress, a), -1, 1);
        const yAhead = clamp(sampleLayerY(simLayer, sim.range, Math.min(1, progress + 0.002), a), -1, 1);
        const slope = clamp(Math.abs((yAhead - y) / 0.02) / 18, 0, 1);
        const freq = simLayer.baseFreq + y * simLayer.audioScale;
        const gain = simLayer.gain * (0.4 + Math.abs(y) * 0.65 + slope * 0.5);
        layer.osc.frequency.setTargetAtTime(clamp(freq, 35, 2400), now, 0.035);
        layer.gain.gain.setTargetAtTime(Math.max(0.0001, gain), now, 0.035);
        brightness += slope;
    });

    simAudio.filter.frequency.setTargetAtTime(1200 + clamp(brightness / simAudio.layers.length, 0, 1) * 4200, now, 0.05);
}

function sampleLayerY(layer, range, progress, a) {
    if (layer.type === 'parametric') {
        const tMin = layer.tRange?.min ?? 0;
        const tMax = layer.tRange?.max ?? 1;
        const t = tMin + (tMax - tMin) * progress;
        return layer.audioY ? layer.audioY(t, a) : layer.y(t, a);
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

function updateHud(sim, a) {
    if (!elements.simHud) return;
    elements.simHud.hidden = false;
    if (elements.simHudA) {
        elements.simHudA.textContent = `a = ${a.toFixed(2)}`;
    }
    if (elements.simHudLayers) {
        elements.simHudLayers.textContent = `${sim.layers.length} layer${sim.layers.length === 1 ? '' : 's'}`;
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
