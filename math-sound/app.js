import { MATH_FUNCTIONS, CATEGORIES } from './modules/constants.js';
import { state, elements, ctx } from './modules/state.js';
import { playSound, stopSound, stopAllSounds } from './modules/audio.js';
import { drawStaticGraph, animate, setRendererCallbacks } from './modules/renderer.js';

// ==========================================
// 초기화
// ==========================================
function init() {
    setupCanvas();
    setupEventListeners();
    setRendererCallbacks(updateTimer, playNextAuto, stopSound);
    
    elements.totalCount.textContent = Object.keys(MATH_FUNCTIONS).length;
    selectCategory('waves');
    selectFunction('sine');
    drawStaticGraph();
}

function updateTimer() {
    if (!state.isPlaying || !state.timerStartTime) {
        if (!state.isPlaying && !state.timerStartTime) {
            elements.canvasClock.textContent = '00:00.00';
        }
        return;
    }
    
    const now = performance.now();
    const diff = now - state.timerStartTime;
    
    const mm = String(Math.floor(diff / 60000)).padStart(2, '0');
    const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    const msm = String(Math.floor((diff % 1000) / 10)).padStart(2, '0');
    
    elements.canvasClock.textContent = `${mm}:${ss}.${msm}`;
}

function setupCanvas() {
    const graphRect = elements.graphCanvas.getBoundingClientRect();
    elements.graphCanvas.width = graphRect.width * window.devicePixelRatio;
    elements.graphCanvas.height = graphRect.height * window.devicePixelRatio;
    const gCtx = elements.graphCanvas.getContext('2d');
    gCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.graph = gCtx;

    const waveRect = elements.waveformCanvas.getBoundingClientRect();
    elements.waveformCanvas.width = waveRect.width * window.devicePixelRatio;
    elements.waveformCanvas.height = waveRect.height * window.devicePixelRatio;
    const wCtx = elements.waveformCanvas.getContext('2d');
    wCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.waveform = wCtx;
}

function setupEventListeners() {
    elements.playBtn.addEventListener('click', togglePlay);
    elements.stopBtn.addEventListener('click', stop);
    elements.resetBtn.addEventListener('click', reset);
    
    if (elements.autoBtn) elements.autoBtn.addEventListener('click', toggleAutoPlay);
    
    const layerBtn = document.getElementById('layerBtn');
    if (layerBtn) layerBtn.addEventListener('click', addLayer);

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
        stopAllSounds();
        renderMixer();
    });

    elements.zoomSlider.addEventListener('input', (e) => {
        state.zoom = e.target.value / 100;
        elements.zoomValue.textContent = `${e.target.value}%`;
        elements.container.style.transform = `scale(${state.zoom})`;
    });

    elements.volumeSlider.addEventListener('input', (e) => {
        state.volume = e.target.value / 100;
        elements.volumeValue.textContent = `${e.target.value}%`;
        if (state.gainNode) state.gainNode.gain.setValueAtTime(state.volume, state.audioContext.currentTime);
    });

    elements.speedSlider.addEventListener('input', (e) => {
        state.speed = e.target.value / 5;
        elements.speedValue.textContent = `${state.speed.toFixed(1)}x`;
        state.activeNodes.forEach(node => {
            if (node.playbackRate) node.playbackRate.value = state.speed;
        });
    });

    elements.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => selectCategory(tab.dataset.category));
    });

    window.addEventListener('resize', () => {
        setupCanvas();
        if (!state.isPlaying) drawStaticGraph();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.code === 'ArrowRight') navigateFunction(1);
        else if (e.code === 'ArrowLeft') navigateFunction(-1);
        else if (e.key === 'Enter') addLayer();
    });
}

// ==========================================
// 카테고리 & 함수 제어
// ==========================================
function selectCategory(category, autoSelectFirst = false) {
    state.currentCategory = category;
    elements.categoryTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.category === category));
    renderFunctionButtons(category);
    if (autoSelectFirst) {
        const funcs = CATEGORIES[category].functions;
        if (funcs.length > 0 && !funcs.includes(state.currentFunction)) selectFunction(funcs[0]);
    }
}

function renderFunctionButtons(category) {
    const container = elements.functionSelector;
    container.innerHTML = '';
    CATEGORIES[category].functions.forEach(funcKey => {
        const func = MATH_FUNCTIONS[funcKey];
        const btn = document.createElement('button');
        btn.className = 'func-btn' + (funcKey === state.currentFunction ? ' active' : '');
        btn.dataset.func = funcKey;
        btn.textContent = func.name;
        btn.addEventListener('click', () => selectFunction(funcKey));
        container.appendChild(btn);
    });
}

function selectFunction(funcName) {
    state.currentFunction = funcName;
    document.querySelectorAll('.func-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.func === funcName));
    
    const allFuncs = Object.keys(MATH_FUNCTIONS);
    state.functionIndex = allFuncs.indexOf(funcName) + 1;
    elements.currentIndex.textContent = state.functionIndex;

    const funcData = MATH_FUNCTIONS[funcName];
    elements.functionTitle.textContent = funcData.name;

    if (window.katex) {
        try { katex.render(funcData.latex, elements.formulaText, { throwOnError: false }); } 
        catch (e) { elements.formulaText.textContent = funcData.formula; }
    } else {
        elements.formulaText.textContent = funcData.formula;
    }

    if (funcData.category !== state.currentCategory) selectCategory(funcData.category);

    if (state.isPlaying) {
        playSound(funcName); 
        if (state.animationId) cancelAnimationFrame(state.animationId);
    }

    state.timerStartTime = null;
    elements.canvasClock.textContent = '00:00.00';
    state.drawProgress = 0;
    
    elements.canvasWrapper.classList.remove('zoom-in-effect');
    void elements.canvasWrapper.offsetWidth;
    elements.canvasWrapper.classList.add('zoom-in-effect');
    
    drawStaticGraph();
    setTimeout(() => {
        if (state.isPlaying) {
            playSound(state.currentFunction);
            animate();
        }
    }, 500);
}

function navigateFunction(direction) {
    const allFuncs = Object.keys(MATH_FUNCTIONS);
    let newIndex = allFuncs.indexOf(state.currentFunction) + direction;
    if (newIndex < 0) newIndex = allFuncs.length - 1;
    if (newIndex >= allFuncs.length) newIndex = 0;
    selectFunction(allFuncs[newIndex]);
}

// ==========================================
// 재생 제어
// ==========================================
function togglePlay() {
    state.isPlaying ? pause() : play();
}

function play() {
    state.isPlaying = true;
    state.timerStartTime = performance.now();
    elements.playBtn.classList.add('playing');
    elements.playBtn.querySelector('.icon').textContent = '❚❚';
    document.body.classList.add('drawing');
    playSound();
    animate();
}

function addLayer() {
    playSound(state.currentFunction, true);
    renderMixer();
}

function renderMixer() {
    const mixerPanel = document.getElementById('mixerPanel');
    const container = document.getElementById('activeLayers');
    if (!mixerPanel || !container) return;

    const layers = Array.from(state.activeNodes.keys()).filter(id => id !== '__preview__');

    if (layers.length === 0) {
        mixerPanel.classList.add('hidden');
        return;
    }

    mixerPanel.classList.remove('hidden');
    container.innerHTML = '';

    layers.forEach(id => {
        const funcId = id.split('_')[0];
        const func = MATH_FUNCTIONS[funcId];

        const tag = document.createElement('div');
        tag.className = 'layer-tag';
        tag.innerHTML = `
            <span>${func.name}</span>
            <span class="remove-layer" data-id="${id}">✕</span>
        `;
        tag.querySelector('.remove-layer').addEventListener('click', (e) => {
            stopSound(id);
            renderMixer();
        });
        container.appendChild(tag);
    });
}

function pause() {
    state.isPlaying = false;
    elements.playBtn.classList.remove('playing');
    elements.playBtn.querySelector('.icon').textContent = '▶';
    document.body.classList.remove('drawing');
    stopAllSounds();
    if (state.animationId) cancelAnimationFrame(state.animationId);
    renderMixer();
}

function stop() {
    if (state.isAutoPlaying) {
        state.isAutoPlaying = false;
        state.autoQueue = [];
        state.autoLoopCount = 0;
        if (elements.autoBtn) elements.autoBtn.classList.remove('playing');
    }
    pause();
    state.timerStartTime = null;
    elements.canvasClock.textContent = '00:00.00';
    reset();
}

function reset() {
    state.drawProgress = 0;
    drawStaticGraph();
    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    if (ctx.waveform) {
        ctx.waveform.fillStyle = '#f3f4f6';
        ctx.waveform.fillRect(0, 0, width, height);
    }
}

// ==========================================
// 자동 재생 (Auto Play)
// ==========================================
function toggleAutoPlay() {
    state.isAutoPlaying ? stop() : startAutoPlay();
}

function startAutoPlay() {
    stop();
    const keys = Object.keys(MATH_FUNCTIONS);
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    state.autoQueue = keys.slice(0, 4);
    if (state.autoQueue.length === 0) return;
    state.isAutoPlaying = true;
    state.autoLoopCount = 0;
    if (elements.autoBtn) {
        elements.autoBtn.classList.add('playing');
    }
    playNextAuto();
}

function playNextAuto() {
    if (!state.isAutoPlaying) return;
    if (state.autoQueue.length === 0) { stop(); return; }
    const nextFunc = state.autoQueue.shift();
    selectFunction(nextFunc);
    state.autoLoopCount = 0;
    setTimeout(() => { if (state.isAutoPlaying) play(); }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
    if (window.katex) selectFunction(state.currentFunction);
});
