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
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;

    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);

    if (!state.currentFunction) {
        // Draw empty axes at least or just clear
        drawAxes(width, height, -10, 10, -10, 10);
        return;
    }

    // 1. Draw Axis first
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const { xMin, xMax, yMin, yMax } = getBounds(funcData);
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    // 2. Draw Background MIDI Layers (Static view at 1.0)
    drawBackgroundLayers(width, height, 1.0);

    // 3. Draw Main Active Curve
    drawLayer(state.currentFunction, width, height, 1.0);

    // 4. Draw Point & Info (Text)
    drawLayerPoint(funcData, width, height, 1.0);
}

function getBounds(funcData) {
    if (funcData.type === 'polar' || funcData.type === 'parametric') {
        return funcData.viewBox;
    }
    return funcData.range;
}

function drawLayer(funcKey, width, height, progress, isBackground = false) {
    const funcData = MATH_FUNCTIONS[funcKey];
    const graphCtx = ctx.graph;
    
    graphCtx.save();
    if (isBackground) {
        graphCtx.strokeStyle = '#d1d5db'; // Subtle Light Gray
        graphCtx.lineWidth = 1.5;
        graphCtx.setLineDash([5, 5]); // Optional: dashed line for background
    } else {
        graphCtx.strokeStyle = getCategoryColor(funcData.category);
        graphCtx.lineWidth = 3;
    }
    
    switch (funcData.type) {
        case 'parametric':
            drawParametricCurveInternal(funcData, width, height, progress);
            break;
        case 'polar':
            drawPolarCurveInternal(funcData, width, height, progress);
            break;
        case 'cartesian':
        default:
            drawCartesianCurveInternal(funcData, width, height, progress);
            break;
    }
    graphCtx.restore();
}

function drawBackgroundLayers(width, height, progress) {
    const layers = Array.from(state.activeNodes.keys()).filter(id => id !== '__preview__');
    layers.forEach(id => {
        const funcId = id.split('_')[0];
        if (funcId !== state.currentFunction) {
            drawLayer(funcId, width, height, progress, true);
            
            // Draw points for background too!
            const funcData = MATH_FUNCTIONS[funcId];
            drawLayerPoint(funcData, width, height, progress, true);
        }
    });
}

/**
 * Common point drawing logic to avoid redundant switches
 */
function drawLayerPoint(funcData, width, height, progress, isBackground = false) {
    switch (funcData.type) {
        case 'parametric':
            drawParametricPoint(funcData, width, height, progress, isBackground);
            break;
        case 'polar':
            drawPolarPoint(funcData, width, height, progress, isBackground);
            break;
        case 'cartesian':
        default:
            drawCartesianPoint(funcData, width, height, progress, isBackground);
            break;
    }
}

function drawCartesianCurveInternal(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.range;
    const graphCtx = ctx.graph;

    const steps = Math.floor(2000 * progress);
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    let isFirst = true;
    graphCtx.beginPath();

    for (let i = 0; i <= steps; i++) {
        const x = xMin + (xRange * i) / 2000;
        let y;
        try { y = funcData.fn(x, state.autoLoopCount); } catch (e) { continue; }

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

function drawPolarCurveInternal(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: thetaMin, max: thetaMax } = funcData.thetaRange;
    const graphCtx = ctx.graph;

    const steps = Math.floor(1000 * progress);
    const thetaRange = thetaMax - thetaMin;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    graphCtx.beginPath();
    
    let isFirst = true;
    for (let i = 0; i <= steps; i++) {
        const theta = thetaMin + (thetaRange * i) / 1000;
        let r;
        try { r = funcData.r(theta, state.autoLoopCount); } catch (e) { continue; }
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

function drawParametricCurveInternal(funcData, width, height, progress) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: tMin, max: tMax } = funcData.tRange;
    const graphCtx = ctx.graph;

    const steps = Math.floor(1000 * progress);
    const tRange = tMax - tMin;
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    graphCtx.beginPath();
    
    let isFirst = true;
    for (let i = 0; i <= steps; i++) {
        const t = tMin + (tRange * i) / 1000;
        let x, y;
        try {
            x = funcData.x(t, state.autoLoopCount);
            y = funcData.y(t, state.autoLoopCount);
        } catch (e) { continue; }

        if (!isFinite(x) || isNaN(x) || !isFinite(y) || isNaN(y)) {
            isFirst = true;
            continue;
        }

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

// Keep original exported wrappers for compatibility if needed, though we primarily use drawLayer now
export function drawCartesianCurve(funcData, width, height, progress) {
    const graphCtx = ctx.graph;
    graphCtx.save();
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    drawAxes(width, height, funcData.range.xMin, funcData.range.xMax, funcData.range.yMin, funcData.range.yMax);
    drawCartesianCurveInternal(funcData, width, height, progress);
    graphCtx.restore();
}

export function drawPolarCurve(funcData, width, height, progress) {
    const graphCtx = ctx.graph;
    graphCtx.save();
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    drawAxes(width, height, funcData.viewBox.xMin, funcData.viewBox.xMax, funcData.viewBox.yMin, funcData.viewBox.yMax);
    drawPolarCurveInternal(funcData, width, height, progress);
    graphCtx.restore();
}

export function drawParametricCurve(funcData, width, height, progress) {
    const graphCtx = ctx.graph;
    graphCtx.save();
    graphCtx.strokeStyle = getCategoryColor(funcData.category);
    graphCtx.lineWidth = 3;
    drawAxes(width, height, funcData.viewBox.xMin, funcData.viewBox.xMax, funcData.viewBox.yMin, funcData.viewBox.yMax);
    drawParametricCurveInternal(funcData, width, height, progress);
    graphCtx.restore();
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
    if (!state.isPlaying || !state.currentFunction) return;

    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const width = elements.graphCanvas.offsetWidth;
    const height = elements.graphCanvas.offsetHeight;
    const graphCtx = ctx.graph;

    // 오디오 시간을 기준으로 진행률 계산 (완벽한 싱크)
    const audioContext = state.audioContext;
    if (!audioContext || state.audioStartTime === null) return;

    const isAni = funcData.category === 'ani';
    const introDuration = 1.5;
    const regularDuration = 4.5;
    const introDraw = 1.0;
    const regularDraw = 4.0;
    
    const elapsed = audioContext.currentTime - state.audioStartTime;
    const scaledElapsed = elapsed * state.speed;

    let newProgress, currentTotalLoop;
    if (isAni && funcData.phases) {
        if (scaledElapsed < introDuration) {
            currentTotalLoop = 0;
            newProgress = Math.min(1.0, scaledElapsed / introDraw);
        } else {
            const adjT = scaledElapsed - introDuration;
            currentTotalLoop = 1 + Math.floor(adjT / regularDuration);
            newProgress = Math.min(1.0, (adjT % regularDuration) / regularDraw);
        }
    } else {
        const loopDur = 4.0;
        newProgress = (scaledElapsed % loopDur) / loopDur;
        currentTotalLoop = Math.floor(scaledElapsed / loopDur);
    }

    // Ani 카테고리는 자동 재생 시에도 모든 단계(phases)를 다 보여준 후 넘어가도록 설정
    const totalPhases = (isAni && funcData.phases) ? funcData.phases.length : 1;
    const totalDuration = isAni ? (introDuration + regularDuration * (totalPhases - 1)) : 4.0;
    
    if (isAni) {
        state.autoTargetCount = totalPhases;
    }

    // 루프가 넘어갔을 때
    if (currentTotalLoop > state.autoLoopCount) {
        state.autoLoopCount = currentTotalLoop;
        
        // 지정된 루프 횟수 도달 시 정지 (Ani는 항상 전체 단계를 보장)
        const target = isAni ? totalPhases : state.autoTargetCount;
        if (state.autoLoopCount >= target || (isAni && scaledElapsed >= totalDuration)) {
            state.isPlaying = false;
            stopSoundCallback(); // 오디오 즉시 중단
            
            if (isAni && !state.isAutoPlaying) {
                // 🎨 Ani: 화면은 완성 상태(1.0)로 마지막 모습 유지
                state.drawProgress = 1.0;
                // 마지막 텍스트 인덱스 강제 (phases가 있는 경우)
                if (funcData.phases) {
                    state.autoLoopCount = funcData.phases.length - 1;
                }
                cancelAnimationFrame(state.animationId);
                drawStaticGraph(); // 최종 고정 화면 렌더링
                return;
            }

            cancelAnimationFrame(state.animationId);
            setTimeout(() => { playNextAutoCallback(); }, 1000); // 다음 곡 전 1초 휴식
            return;
        }
    }

    state.drawProgress = newProgress;

    graphCtx.clearRect(0, 0, width, height);
    graphCtx.fillStyle = '#ffffff';
    graphCtx.fillRect(0, 0, width, height);

    // 1. Draw Axis
    const { xMin, xMax, yMin, yMax } = getBounds(funcData);
    drawAxes(width, height, xMin, xMax, yMin, yMax);

    // 2. Draw Background MIDI Layers (Animates with main progress)
    drawBackgroundLayers(width, height, state.drawProgress);

    // 3. Draw Main Active Curve
    drawLayer(state.currentFunction, width, height, state.drawProgress);
    
    // 4. Draw Point for main curve
    drawLayerPoint(funcData, width, height, state.drawProgress, false);

    // 5. Draw Sequence Phase Text (for 'ani' category)
    if (funcData.phases) {
        const phases = funcData.phases;
        // 재생 완료 후에도 마지막 텍스트 유지를 위해 루프 인덱스 계산
        const maxIdx = phases.length - 1;
        const loopIdx = (state.drawProgress >= 1.0 && !state.isPlaying) ? maxIdx : Math.min(state.autoLoopCount, maxIdx);
        const text = phases[loopIdx];
        
        graphCtx.save();
        // 0번 인덱스(타이틀)는 더 크게 강조
        graphCtx.font = loopIdx === 0 ? "bold 32px 'Inter', sans-serif" : "bold 24px 'Inter', sans-serif";
        graphCtx.textAlign = "center";
        graphCtx.textBaseline = "middle";
        
        // 가독성 개선: 연두색 텍스트 + 화이트 외곽선
        graphCtx.shadowBlur = 4;
        graphCtx.shadowColor = "rgba(0, 0, 0, 0.1)";
        graphCtx.fillStyle = '#84cc16'; // 연두색
        graphCtx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        graphCtx.lineWidth = 4;
        
        const centerX = width / 2;
        // 하트 중앙 y좌표 계산 (90% 크기 기준 조정)
        const centerY = ((yMax - 1.0) / (yMax - yMin)) * height;
        
        graphCtx.strokeText(text, centerX, centerY);
        graphCtx.fillText(text, centerX, centerY);
        graphCtx.restore();
    }

    drawWaveform();
    updateTimerCallback();
    state.animationId = requestAnimationFrame(animate);
}

export function drawCartesianPoint(funcData, width, height, progress, isBackground = false) {
    const { xMin, xMax, yMin, yMax } = funcData.range;
    const currentX = xMin + (xMax - xMin) * progress;
    let currentY;
    try { currentY = funcData.fn(currentX, state.autoLoopCount); } catch (e) { return; }
    if (!isFinite(currentY) || isNaN(currentY)) return;
    
    const canvasX = progress * width;
    const canvasY = ((yMax - currentY) / (yMax - yMin)) * height;
    drawPoint(canvasX, canvasY, funcData.category, height, isBackground);
}

export function drawPolarPoint(funcData, width, height, progress, isBackground = false) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: thetaMin, max: thetaMax } = funcData.thetaRange;
    const theta = thetaMin + (thetaMax - thetaMin) * progress;
    let r;
    try { r = funcData.r(theta, state.autoLoopCount); } catch (e) { return; }
    if (!isFinite(r) || isNaN(r)) return;
    
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    const canvasX = ((x - xMin) / (xMax - xMin)) * width;
    const canvasY = ((yMax - y) / (yMax - yMin)) * height;
    drawPoint(canvasX, canvasY, funcData.category, height, isBackground);
}

export function drawParametricPoint(funcData, width, height, progress, isBackground = false) {
    const { xMin, xMax, yMin, yMax } = funcData.viewBox;
    const { min: tMin, max: tMax } = funcData.tRange;
    const t = tMin + (tMax - tMin) * progress;
    let x, y;
    try {
        x = funcData.x(t, state.autoLoopCount);
        y = funcData.y(t, state.autoLoopCount);
    } catch (e) { return; }
    if (!isFinite(x) || isNaN(x) || !isFinite(y) || isNaN(y)) return;
    
    const canvasX = ((x - xMin) / (xMax - xMin)) * width;
    const canvasY = ((yMax - y) / (yMax - yMin)) * height;
    drawPoint(canvasX, canvasY, funcData.category, height, isBackground);
}

export function drawPoint(canvasX, canvasY, category, height, isBackground = false) {
    const graphCtx = ctx.graph;
    const color = isBackground ? '#d1d5db' : getCategoryColor(category);
    graphCtx.fillStyle = color;
    graphCtx.beginPath();
    graphCtx.arc(canvasX, Math.max(5, Math.min(height - 5, canvasY)), isBackground ? 5 : 8, 0, Math.PI * 2);
    graphCtx.fill();
    graphCtx.strokeStyle = '#ffffff';
    graphCtx.lineWidth = isBackground ? 1 : 2;
    graphCtx.stroke();
}

export function getCategoryColor(category) {
    const colors = {
        waves: '#10b981',    // Green
        curves: '#ec4899',   // Pink
        art: '#8b5cf6',      // Purple
        ani: '#f43f5e',      // Rose Pink
        sound: '#6366f1',    // Indigo (Synth)
        math: '#dc2626',     // Pure Red
        bytebeat: '#4b5563'  // Dark Gray
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
