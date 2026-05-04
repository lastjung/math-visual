/**
 * Math Sound - Constants Simulation Engine
 * Waves 10-Series: Dynamic simulation with dual-variable control (Phase 1: varA only)
 * Pattern mirrors symphony-sim.js architecture
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
    }
};

// ==========================================
// Functions (Phase 1: varA animates, varB = default)
// ==========================================
export const CSIM_FUNCTIONS = {
    sineMultiSim: {
        id: 'sineMultiSim',
        category: 'waves-plus',
        name: 'Sine Multi Sim',
        formula: 'y = Σ sin(x + i·b/10)',
        latex: 'y = \\sum_{i=1}^{a} \\sin(x + \\frac{i \\cdot b}{10})',
        range: { xMin: -6.28, xMax: 6.28, yMin: -10, yMax: 10 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Layers', min: 1, max: 50, default: 10 },
        varB: { name: 'Phase', min: 0, max: 10, default: 2 },
        fn: (x, a, b) => {
            let s = 0;
            const n = Math.floor(a);
            for (let i = 1; i <= n; i++) s += Math.sin(x + (i * b) / 10);
            return s;
        },
        audioScale: 150,
        baseFreq: 220
    },
    squareFourierSim: {
        id: 'squareFourierSim',
        category: 'waves-plus',
        name: 'Square Fourier Sim',
        formula: 'y = Σ sin((2n+1)x)/(2n+1)',
        latex: 'y = \\frac{4}{\\pi}\\sum_{n=0}^{a} \\frac{\\sin((2n+1)x)}{2n+1}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Harmonics', min: 0, max: 50, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => {
            let sq = 0;
            const n = Math.floor(a);
            for (let i = 0; i <= n; i++) {
                const k = 2 * i + 1;
                sq += Math.sin(k * b * x) / k;
            }
            return (4 / Math.PI) * sq;
        },
        audioScale: 180,
        baseFreq: 260
    },
    sawtoothFourierSim: {
        id: 'sawtoothFourierSim',
        category: 'waves-plus',
        name: 'Sawtooth Fourier Sim',
        formula: 'y = Σ sin(nx)/n',
        latex: 'y = \\frac{2}{\\pi}\\sum_{n=1}^{a} \\frac{\\sin(nx)}{n}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Harmonics', min: 1, max: 50, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => {
            let sw = 0;
            const n = Math.floor(a);
            for (let i = 1; i <= n; i++) sw += Math.sin(i * b * x) / i;
            return (2 / Math.PI) * sw;
        },
        audioScale: 160,
        baseFreq: 240
    },
    triangleSim: {
        id: 'triangleSim',
        category: 'waves-plus',
        name: 'Triangle Sim',
        formula: 'y = a · triangle(bx)',
        latex: 'y = a \\cdot (\\operatorname{abs}(4 \\cdot \\operatorname{frac}(xb - 0.25) - 2) - 1)',
        range: { xMin: -6.28, xMax: 6.28, yMin: -10, yMax: 10 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Amplitude', min: 0.5, max: 10, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 10, default: 2 },
        fn: (x, a, b) => {
            // b는 주파수, a는 진폭
            const t = (x * b / (2 * Math.PI) - 0.25);
            return a * (Math.abs(4 * ((t % 1 + 1) % 1) - 2) - 1);
        },
        audioScale: 140,
        baseFreq: 220
    },
    pulsePwmSim: {
        id: 'pulsePwmSim',
        category: 'waves-plus',
        name: 'Pulse PWM Sim',
        formula: 'y = sgn(sin x + cos a)',
        latex: 'y = \\text{sgn}(\\sin(bx) + \\cos(a))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -2, yMax: 2 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Duty Cycle', min: 0, max: Math.PI, default: Math.PI / 2 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => Math.sign(Math.sin(b * x) + Math.cos(a)),
        audioScale: 200,
        baseFreq: 110
    },
    steppyQuantizeSim: {
        id: 'steppyQuantizeSim',
        category: 'waves-plus',
        name: 'Steppy Quantize Sim',
        formula: 'y = floor(a·sin x)/a',
        latex: 'y = \\frac{\\lfloor a \\cdot \\sin(bx) \\rfloor}{a}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Steps', min: 1, max: 20, default: 4 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => Math.floor(a * Math.sin(b * x)) / Math.max(1, a),
        audioScale: 170,
        baseFreq: 180
    },
    tanhTanClipSim: {
        id: 'tanhTanClipSim',
        category: 'waves-plus',
        name: 'Tanh-Tan Clip Sim',
        formula: 'y = tanh(a·tan x)',
        latex: 'y = \\tanh(a \\cdot \\tan(bx))',
        range: { xMin: -6.28, xMax: 6.28, yMin: -4, yMax: 4 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Gain', min: 0.1, max: 20, default: 1 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => Math.tanh(a * Math.tan(b * x / 10)),
        audioScale: 100,
        baseFreq: 330
    },
    dampedDecaySim: {
        id: 'dampedDecaySim',
        category: 'waves-plus',
        name: 'Damped Decay Sim',
        formula: 'y = e^(-a|x|) sin(bx)',
        latex: 'y = e^{-a|x|} \\sin(bx)',
        range: { xMin: -10, xMax: 10, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Decay', min: 0.01, max: 1.0, default: 0.2 },
        varB: { name: 'Freq', min: 0.5, max: 10, default: 4 },
        fn: (x, a, b) => Math.exp(-a * Math.abs(x)) * Math.sin(b * x),
        audioScale: 120,
        baseFreq: 180
    },
    chaosInterferenceSim: {
        id: 'chaosInterferenceSim',
        category: 'waves-plus',
        name: 'Chaos Interference Sim',
        formula: 'y = sin(ax) cos(bx)',
        latex: 'y = \\sin(ax) \\cos(bx)',
        range: { xMin: -10, xMax: 10, yMin: -1.5, yMax: 1.5 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Freq A', min: 0.5, max: 20, default: 5 },
        varB: { name: 'Freq B', min: 0.5, max: 20, default: 3 },
        fn: (x, a, b) => Math.sin(a * x) * Math.cos(b * x),
        audioScale: 130,
        baseFreq: 220
    },
    softHarmonicsSim: {
        id: 'softHarmonicsSim',
        category: 'waves-plus',
        name: 'Soft Harmonics Sim',
        formula: 'y = Σ tanh(sin(ix))/i',
        latex: 'y = \\sum_{i=1}^{a} \\frac{\\tanh(\\sin(ibx))}{i}',
        range: { xMin: -6.28, xMax: 6.28, yMin: -3, yMax: 3 },
        drawMs: 2000,
        durationMs: 12000,
        varA: { name: 'Layers', min: 1, max: 20, default: 5 },
        varB: { name: 'Frequency', min: 0.5, max: 5, default: 1 },
        fn: (x, a, b) => {
            let sf = 0;
            const n = Math.floor(a);
            for (let i = 1; i <= n; i++) sf += Math.tanh(Math.sin(i * b * x)) / i;
            return sf;
        },
        audioScale: 110,
        baseFreq: 200
    }
};

// ==========================================
// Internal State
// ==========================================
const simAudio = {
    context: null,
    master: null,
    filter: null,
    analyser: null,
    osc: null,
    gain: null,
    rafId: null,
    startedAt: 0,
    functionId: null
};

// ==========================================
// Public API (mirrors symphony-sim.js)
// ==========================================
export function isConstantsSimCategory(category) {
    return !!CSIM_CATEGORIES[category];
}

export function isConstantsSimFunction(functionId) {
    return !!CSIM_FUNCTIONS[functionId];
}

export function drawConstantsSimStatic(functionId) {
    const sim = CSIM_FUNCTIONS[functionId];
    if (!sim || !ctx.graph || !elements.graphCanvas) return;

    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;

    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = state.theme === 'dark' ? '#050505' : '#ffffff';
    graphCtx.fillRect(0, 0, width, height);
    drawAxes(graphCtx, width, height, sim.range);
    drawSimCurve(graphCtx, sim, width, height, 1, sim.varA.default, sim.varB.default);
    clearWaveform();
    updateHud(sim, sim.varA.default, sim.varB.default, null); // null indicates static state
}

export function startConstantsSim(functionId) {
    const sim = CSIM_FUNCTIONS[functionId];
    if (!sim) return;

    ensureAudio(sim);
    stopConstantsSim({ keepAudio: true });
    simAudio.functionId = functionId;
    simAudio.startedAt = performance.now();
    if (simAudio.context.state === 'suspended') {
        simAudio.context.resume().catch(() => {});
    }
    simAudio.master.gain.setTargetAtTime(Math.max(0.001, state.volume * 1.15), simAudio.context.currentTime, 0.04);
    tick();
}

export function stopConstantsSim(options = {}) {
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

export function resetConstantsSim(functionId) {
    stopConstantsSim();
    drawConstantsSimStatic(functionId);
}

// ==========================================
// Audio Setup
// ==========================================
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

    if (!simAudio.osc) {
        const osc = simAudio.context.createOscillator();
        const gain = simAudio.context.createGain();
        osc.type = 'sine';
        osc.frequency.value = sim.baseFreq || 220;
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(simAudio.filter);
        osc.start();
        simAudio.osc = osc;
        simAudio.gain = gain;
    }
}

// ==========================================
// Animation Loop
// ==========================================
function tick() {
    const sim = CSIM_FUNCTIONS[simAudio.functionId];
    if (!sim) return;

    const now = performance.now();
    const elapsed = (now - simAudio.startedAt) * state.speed;
    const drawProgress = Math.min(1, elapsed / sim.drawMs);
    const animateProgress = Math.max(0, (elapsed - sim.drawMs) / Math.max(1, sim.durationMs - sim.drawMs));

    const phaseProgress = (animateProgress * 2) % 1; // 0 to 1 within each half
    let valA, valB;
    // cycle: 0 -> 1 -> 0 -> -1 -> 0 (Sin 기반으로 시작점을 0으로 맞춤)
    const cycle = Math.sin(phaseProgress * Math.PI * 2);

    if (animateProgress <= 0) {
        // 1. 드로잉 단계: 항상 기본값(default) 사용
        valA = sim.varA.default;
        valB = sim.varB.default;
    } else if (animateProgress < 0.5) {
        // 2. Phase A: a 시뮬레이션
        // default를 기준으로 min 또는 max까지 부드럽게 왕복
        const diffA = cycle > 0 ? (sim.varA.max - sim.varA.default) : (sim.varA.default - sim.varA.min);
        valA = sim.varA.default + diffA * cycle;
        valB = sim.varB.default;
    } else {
        // 3. Phase B: b 시뮬레이션
        valA = sim.varA.default;
        const diffB = cycle > 0 ? (sim.varB.max - sim.varB.default) : (sim.varB.default - sim.varB.min);
        valB = sim.varB.default + diffB * cycle;
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

// ==========================================
// Rendering
// ==========================================
function drawFrame(sim, progress, valA, valB) {
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;
    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = state.theme === 'dark' ? '#050505' : '#ffffff';
    graphCtx.fillRect(0, 0, width, height);
    drawAxes(graphCtx, width, height, sim.range);
    drawSimCurve(graphCtx, sim, width, height, progress, valA, valB);
}

function getSimColor() {
    // Symphony Sim 색상을 사용하지 않고, 각 함수마다 고유한 단색을 생성합니다.
    // 황금각(137.5도)을 사용하여 색상이 골고루 분산되도록 합니다.
    const hue = ((state.functionIndex || 0) * 137.5) % 360;
    const saturation = 85;
    const lightness = state.theme === 'dark' ? 68 : 45;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function drawSimCurve(graphCtx, sim, width, height, progress, valA, valB) {
    const { xMin, xMax, yMin, yMax } = sim.range;
    const totalSteps = 2200;
    const steps = Math.max(2, Math.floor(totalSteps * progress));
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    graphCtx.beginPath();
    graphCtx.lineWidth = 2.8;
    graphCtx.strokeStyle = getSimColor();
    graphCtx.lineJoin = 'round';
    graphCtx.lineCap = 'round';

    let first = true;
    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xRange * i) / totalSteps;
        const y = sim.fn(x, valA, valB);
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

// ==========================================
// Audio Synthesis (High-Fidelity Motion Engine)
// ==========================================
function updateAudio(sim, progress, valA, valB) {
    if (!simAudio.osc || !simAudio.context) return;
    const now = simAudio.context.currentTime;

    // 1. 샘플링 및 모션 분석
    const motion = sampleMotion(sim, progress, valA, valB);
    
    // 2. 물리량을 사운드 파라미터로 변환
    // progress: 0~1 (그리는 진행도), motion.position: -1~1 (y좌표)
    const travel = progress * 2 - 1;
    const basePitch = (sim.baseFreq || 220);
    const audioScale = sim.audioScale || 120;

    // 음높이 계산: 베이스 + y위치 + 진행도 + 속도 + 도약(튀는 정도)
    const pitch = travel * 60 + motion.position * audioScale + motion.velocity * 80 + motion.jump * 150;
    const freq = clamp(basePitch + pitch, 40, 2800);

    // 음량 계산: 기본 + 위치 + 속도 + 도약
    const gain = 0.25 + Math.abs(motion.position) * 0.35 + motion.velocity * 0.3 + motion.jump * 0.6;
    
    // 필터 밝기: 곡률과 도약에 반응
    const brightness = motion.curvature * 1.2 + motion.jump * 0.8 + motion.velocity * 0.4;

    // 3. 오디오 노드 적용 (TargetAtTime으로 부드럽게 연결)
    simAudio.osc.frequency.setTargetAtTime(freq, now, 0.04);
    simAudio.gain.gain.setTargetAtTime(Math.max(0.0001, gain * state.volume), now, 0.04);
    
    if (simAudio.filter) {
        const filterFreq = 1000 + clamp(brightness, 0, 1) * 4000;
        simAudio.filter.frequency.setTargetAtTime(filterFreq, now, 0.06);
    }
}

function sampleMotion(sim, progress, valA, valB) {
    const dt = 0.004;
    const p0 = pointForSim(sim, clamp(progress - dt, 0, 1), valA, valB);
    const p1 = pointForSim(sim, progress, valA, valB);
    const p2 = pointForSim(sim, clamp(progress + dt, 0, 1), valA, valB);

    const v1x = p1.x - p0.x;
    const v1y = p1.y - p0.y;
    const v2x = p2.x - p1.x;
    const v2y = p2.y - p1.y;

    // 속도 계산
    const velocity = clamp(Math.hypot(v1x, v1y) / dt / 15, 0, 1);
    // 도약(튀는 정도) 계산: y값의 급격한 변화
    const jump = clamp(Math.abs(p1.soundY - p0.soundY) * 1.2, 0, 1);
    
    // 곡률 계산 (방향 변화량)
    const a1 = Math.atan2(v1y, v1x);
    const a2 = Math.atan2(v2y, v2x);
    const curvature = clamp(Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) / Math.PI, 0, 1);

    return {
        position: clamp(p1.soundY, -1, 1),
        velocity,
        jump,
        curvature
    };
}

function pointForSim(sim, progress, valA, valB) {
    const { xMin, xMax, yMin, yMax } = sim.range;
    const x = xMin + (xMax - xMin) * progress;
    const y = sim.fn(x, valA, valB);
    // 사운드 매핑을 위해 y값을 -1~1로 정규화
    const soundY = (y - yMin) / (yMax - yMin) * 2 - 1;
    return { x, y, soundY: isFinite(soundY) ? soundY : 0 };
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// ==========================================
// HUD
// ==========================================
function updateHud(sim, valA, valB, activePhase) {
    if (!elements.simHud) return;
    elements.simHud.hidden = false;

    // activePhase: true (A), false (B), null (Static)
    const isPhaseA = activePhase === true;
    const isPhaseB = activePhase === false;

    if (elements.simHudA) {
        const labelA = sim.varA.name || 'a';
        elements.simHudA.textContent = `a = ${valA.toFixed(2)} (${labelA}) ${isPhaseA ? '✦' : ''}`;
    }

    if (elements.simHudLayers) {
        const labelB = sim.varB.name || 'b';
        elements.simHudLayers.textContent = `b = ${valB.toFixed(2)} (${labelB}) ${isPhaseB ? '✦' : ''}`;
    }
}

// ==========================================
// Waveform
// ==========================================
function clearWaveform() {
    if (!elements.waveformCanvas || !ctx.waveform) return;
    const w = elements.waveformCanvas.offsetWidth;
    const h = elements.waveformCanvas.offsetHeight;
    const wCtx = ctx.waveform;
    wCtx.fillStyle = state.theme === 'dark' ? '#1e293b' : '#f3f4f6';
    wCtx.fillRect(0, 0, w, h);
}

function drawWaveform() {
    if (!simAudio.analyser || !elements.waveformCanvas || !ctx.waveform) return;
    const w = elements.waveformCanvas.offsetWidth;
    const h = elements.waveformCanvas.offsetHeight;
    const wCtx = ctx.waveform;

    const bufLen = simAudio.analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    simAudio.analyser.getByteTimeDomainData(data);

    wCtx.fillStyle = state.theme === 'dark' ? '#1e293b' : '#f3f4f6';
    wCtx.fillRect(0, 0, w, h);
    wCtx.lineWidth = 1.5;
    wCtx.strokeStyle = state.theme === 'dark' ? '#60a5fa' : '#3b82f6';
    wCtx.beginPath();

    const slice = w / bufLen;
    let x = 0;
    for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) wCtx.moveTo(x, y);
        else wCtx.lineTo(x, y);
        x += slice;
    }
    wCtx.lineTo(w, h / 2);
    wCtx.stroke();
}

// ==========================================
// Axes
// ==========================================
function drawAxes(graphCtx, width, height, range) {
    const { xMin, xMax, yMin, yMax } = range;
    const originX = ((-xMin) / (xMax - xMin)) * width;
    const originY = (yMax / (yMax - yMin)) * height;
    graphCtx.strokeStyle = state.theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    graphCtx.lineWidth = 1;
    graphCtx.beginPath();
    graphCtx.moveTo(0, originY);
    graphCtx.lineTo(width, originY);
    graphCtx.stroke();
    graphCtx.beginPath();
    graphCtx.moveTo(originX, 0);
    graphCtx.lineTo(originX, height);
    graphCtx.stroke();
}
