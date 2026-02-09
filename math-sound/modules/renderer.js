/**
 * Math Sound Visualizer - Graphics Renderer
 * Canvas 그리기 엔진 및 애니메이션 루프
 */

import { state, elements, ctx } from './state.js';
import { MATH_FUNCTIONS } from './constants.js';

// Helper for UI/Timer updates (assigned from app.js)
let updateTimerCallback = () => {};
let playNextAutoCallback = () => {};
let stopSoundCallback = () => {};

export function setRendererCallbacks(timerCb, autoCb, stopAudioCb) {
    updateTimerCallback = timerCb;
    playNextAutoCallback = autoCb;
    stopSoundCallback = stopAudioCb;
}

export function drawStaticGraph() {
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;

    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);

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

export function drawCartesianCurve(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.range;
    const graphCtx = ctx.graph;
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    const steps = Math.floor(500 * progress);
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    let isFirst = true;
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    graphCtx.lineCap = 'round';
    graphCtx.lineJoin = 'round';
    graphCtx.beginPath();

    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xRange * i) / 500;
        let y;
        try { y = funcData.fn(x); } catch (e) { continue; }

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

export function drawPolarCurve(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: thetaMin, max: thetaMax } = funcData.thetaRange;
    const graphCtx = ctx.graph;
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    const steps = Math.floor(1000 * progress);
    const thetaRange = thetaMax - thetaMin;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    graphCtx.lineCap = 'round';
    graphCtx.lineJoin = 'round';
    graphCtx.beginPath();
    
    let isFirst = true;
    for (let i = 0; i <= steps; i++) {
        const theta = thetaMin + (thetaRange * i) / 1000;
        let r;
        try { r = funcData.r(theta); } catch (e) { continue; }
        if (!isFinite(r) || isNaN(r)) continue;

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

export function drawParametricCurve(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: tMin, max: tMax } = funcData.tRange;
    const graphCtx = ctx.graph;
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    const steps = Math.floor(1000 * progress);
    const tRange = tMax - tMin;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

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
        } catch (e) { continue; }

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

export function drawAxes(width, height, xMin, xMax, yMin, yMax) {
    const graphCtx = ctx.graph;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const centerX = ((-xMin) / xRange) * width;
    const centerY = ((yMax) / yRange) * height;

    graphCtx.strokeStyle = '#e5e7eb';
    graphCtx.lineWidth = 1;

    if (centerY >= 0 && centerY <= height) {
        graphCtx.beginPath();
        graphCtx.moveTo(0, centerY);
        graphCtx.lineTo(width, centerY);
        graphCtx.stroke();
    }
    if (centerX >= 0 && centerX <= width) {
        graphCtx.beginPath();
        graphCtx.moveTo(centerX, 0);
        graphCtx.lineTo(centerX, height);
        graphCtx.stroke();
    }

    graphCtx.fillStyle = '#9ca3af';
    graphCtx.beginPath();
    graphCtx.moveTo(width - 10, centerY - 4);
    graphCtx.lineTo(width, centerY);
    graphCtx.lineTo(width - 10, centerY + 4);
    graphCtx.fill();

    graphCtx.beginPath();
    graphCtx.moveTo(centerX - 4, 10);
    graphCtx.lineTo(centerX, 0);
    graphCtx.lineTo(centerX + 4, 10);
    graphCtx.fill();
}

export function animate() {
    if (!state.isPlaying) return;

    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;

    state.drawProgress += 0.004 * state.speed;
    
    if (state.drawProgress > 1) {
        state.drawProgress = 0;
        if (state.isAutoPlaying) {
            state.autoLoopCount++;
            if (state.autoLoopCount >= 3) {
                state.isPlaying = false;
                stopSoundCallback();
                cancelAnimationFrame(state.animationId);
                setTimeout(() => { playNextAutoCallback(); }, 1000);
                return;
            }
        }
    }

    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);

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

    drawWaveform();
    updateTimerCallback();
    state.animationId = requestAnimationFrame(animate);
}

export function drawCartesianPoint(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.range;
    const currentX = xMin + (xMax - xMin) * progress;
    let currentY;
    try { currentY = funcData.fn(currentX); } catch (e) { return; }
    if (!isFinite(currentY) || isNaN(currentY)) return;
    
    const canvasX = progress * width;
    const canvasY = ((yMax - currentY) / (yMax - yMin)) * height;
    drawPoint(canvasX, canvasY, funcData.category, height);
}

export function drawPolarPoint(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: thetaMin, max: thetaMax } = funcData.thetaRange;
    const theta = thetaMin + (thetaMax - thetaMin) * progress;
    let r;
    try { r = funcData.r(theta); } catch (e) { return; }
    if (!isFinite(r) || isNaN(r)) return;
    
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const canvasX = ((x - xMin) / (xMax - xMin)) * width;
    const canvasY = ((yMax - y) / (yMax - yMin)) * height;
    drawPoint(canvasX, canvasY, funcData.category, height);
}

export function drawParametricPoint(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: tMin, max: tMax } = funcData.tRange;
    const t = tMin + (tMax - tMin) * progress;
    let x, y;
    try {
        x = funcData.x(t);
        y = funcData.y(t);
    } catch (e) { return; }
    if (!isFinite(x) || isNaN(x) || !isFinite(y) || isNaN(y)) return;
    
    const canvasX = ((x - xMin) / (xMax - xMin)) * width;
    const canvasY = ((yMax - y) / (yMax - yMin)) * height;
    drawPoint(canvasX, canvasY, funcData.category, height);
}

export function drawPoint(canvasX, canvasY, category, height) {
    const graphCtx = ctx.graph;
    const color = getCategoryColor(category);
    graphCtx.fillStyle = color;
    graphCtx.beginPath();
    graphCtx.arc(canvasX, Math.max(5, Math.min(height - 5, canvasY)), 8, 0, Math.PI * 2);
    graphCtx.fill();
    graphCtx.strokeStyle = '#ffffff';
    graphCtx.lineWidth = 2;
    graphCtx.stroke();
}

export function getCategoryColor(category) {
    const colors = {
        waves: '#8b5cf6',
        curves: '#ec4899',
        sound: '#f59e0b',
        math: '#10b981',
        bytebeat: '#ef4444'
    };
    return colors[category] || '#3b82f6';
}

export function drawWaveform() {
    if (!state.analyser) return;

    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    state.analyser.getByteTimeDomainData(dataArray);

    const waveformCtx = ctx.waveform;
    waveformCtx.fillStyle = '#f3f4f6';
    waveformCtx.fillRect(0, 0, width, height);

    const funcData = MATH_FUNCTIONS[state.currentFunction];
    waveformCtx.strokeStyle = getCategoryColor(funcData.category);
    waveformCtx.lineWidth = 2;
    waveformCtx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) waveformCtx.moveTo(x, y);
        else waveformCtx.lineTo(x, y);
        x += sliceWidth;
    }
    waveformCtx.lineTo(width, height / 2);
    waveformCtx.stroke();
}
