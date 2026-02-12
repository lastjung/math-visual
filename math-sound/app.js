import { MATH_FUNCTIONS, CATEGORIES } from './modules/constants.js';
import { state, elements, ctx } from './modules/state.js';
import { playSound, stopSound, stopAllSounds, stopPreview } from './modules/audio.js';
import { drawStaticGraph, animate, setRendererCallbacks } from './modules/renderer.js';

const FAVORITES_KEY = 'math-sound:favorites';
let favoriteSet = new Set();

// ==========================================
// 초기화
// ==========================================
function init() {
    setupCanvas();
    loadFavorites();
    renderCategoryTabs();
    setupEventListeners();
    setRendererCallbacks(updateTimer, playNextAuto, stopPreview);
    
    elements.totalCount.textContent = Object.keys(MATH_FUNCTIONS).length;
    selectCategory('waves');
    selectFunction('sine');
    drawStaticGraph();

    if (elements.slidersPanel) elements.slidersPanel.classList.add('collapsed');
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
    if (elements.prevBtn) elements.prevBtn.addEventListener('click', () => navigateFunction(-1));
    if (elements.nextBtn) elements.nextBtn.addEventListener('click', () => navigateFunction(1));
    
    if (elements.autoBtn) elements.autoBtn.addEventListener('click', toggleAutoPlay);
    
    const layerBtn = document.getElementById('layerBtn');
    if (layerBtn) {
        layerBtn.addEventListener('click', () => {
            const mixerPanel = document.getElementById('mixerPanel');
            if (mixerPanel) mixerPanel.classList.toggle('hidden');
        });
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
        stopAllSounds();
        renderMixer();
    });

    // Drag & Drop for Mixer
    const mixerPanel = document.getElementById('mixerPanel');
    if (mixerPanel) {
        mixerPanel.addEventListener('dragover', (e) => {
            e.preventDefault();
            mixerPanel.classList.add('drag-over');
        });
        mixerPanel.addEventListener('dragleave', () => {
            mixerPanel.classList.remove('drag-over');
        });
        mixerPanel.addEventListener('drop', (e) => {
            e.preventDefault();
            mixerPanel.classList.remove('drag-over');
            const funcKey = e.dataTransfer.getData('text/plain');
            if (funcKey && MATH_FUNCTIONS[funcKey]) {
                addLayer(funcKey);
                mixerPanel.classList.remove('hidden');
            }
        });
    }

    elements.zoomSlider.addEventListener('input', (e) => {
        state.zoom = e.target.value / 100;
        elements.zoomValue.textContent = `${e.target.value}%`;
        elements.container.style.transform = `scale(${state.zoom})`;
    });

    elements.volumeSlider.addEventListener('input', (e) => {
        state.volume = e.target.value / 100;
        elements.volumeValue.textContent = `${e.target.value}%`;
        
        // Update all active nodes
        state.activeNodes.forEach((node, id) => {
            const multiplier = (id === '__preview__') ? 1.0 : 0.5;
            if (node.gain) {
                node.gain.gain.setValueAtTime(state.volume * multiplier, state.audioContext.currentTime);
            }
        });
    });

    elements.speedSlider.addEventListener('input', (e) => {
        state.speed = e.target.value / 5;
        elements.speedValue.textContent = `${state.speed.toFixed(1)}x`;
        state.activeNodes.forEach(node => {
            if (node.source && node.source.playbackRate) {
                node.source.playbackRate.value = state.speed;
            }
        });
    });

    if (elements.functionSearch) {
        elements.functionSearch.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase().trim();
            renderFunctionButtons(state.currentCategory);
        });
    }

    if (elements.favoritesToggle) {
        elements.favoritesToggle.addEventListener('click', () => {
            state.favoritesOnly = !state.favoritesOnly;
            elements.favoritesToggle.classList.toggle('active', state.favoritesOnly);
            renderFunctionButtons(state.currentCategory);
        });
    }

    if (elements.slidersToggle && elements.slidersPanel) {
        elements.slidersToggle.addEventListener('click', () => {
            elements.slidersPanel.classList.toggle('collapsed');
        });
    }

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
function renderCategoryTabs() {
    const container = document.getElementById('categoryTabs');
    if (!container) return;
    
    container.innerHTML = '';
    const ordered = [{ key: 'all', name: '✨ All' }, ...Object.keys(CATEGORIES).map(key => ({ key, name: CATEGORIES[key].name }))];
    ordered.forEach(({ key, name }) => {
        const cat = CATEGORIES[key];
        const btn = document.createElement('button');
        btn.className = 'category-tab' + (key === state.currentCategory ? ' active' : '');
        btn.dataset.category = key;
        btn.textContent = name || cat?.name || key;
        btn.addEventListener('click', () => selectCategory(key));
        container.appendChild(btn);
    });
    
    // Update elements reference
    elements.categoryTabs = document.querySelectorAll('.category-tab');
}

function selectCategory(category, autoSelectFirst = false) {
    state.currentCategory = category;
    elements.categoryTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.category === category));
    renderFunctionButtons(category);
    if (autoSelectFirst) {
        const funcs = getCategoryFunctions(category);
        if (funcs.length > 0 && !funcs.includes(state.currentFunction)) selectFunction(funcs[0]);
    }
}

function renderFunctionButtons(category) {
    const container = elements.functionSelector;
    container.innerHTML = '';
    if (!container) return;
    container.dataset.category = category;

    const funcKeys = getCategoryFunctions(category)
        .filter(key => matchesSearch(key))
        .filter(key => !state.favoritesOnly || favoriteSet.has(key));

    if (funcKeys.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No matches. Try another keyword or clear filters.';
        container.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();
    funcKeys.forEach(funcKey => {
        const func = MATH_FUNCTIONS[funcKey];
        const card = document.createElement('div');
        card.className = 'func-card' + (funcKey === state.currentFunction ? ' active' : '');
        card.dataset.func = funcKey;
        card.dataset.category = func.category;
        card.title = 'Click: Select & Play, Drag: Add Layer';
        card.tabIndex = 0;
        card.draggable = true;

        const categoryLabel = CATEGORIES[func.category]?.name || func.category;
        card.innerHTML = `
            <div class="card-top">
                <span class="card-title">${func.name}</span>
                <button class="card-fav ${favoriteSet.has(funcKey) ? 'active' : ''}" title="즐겨찾기">★</button>
            </div>
            <div class="card-tags">
                <span class="tag">${categoryLabel}</span>
                <span class="tag">${func.type}</span>
            </div>
            <div class="card-formula">${func.formula}</div>
        `;

        card.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.classList.contains('card-fav')) return;
            selectFunction(funcKey);
            if (!state.isPlaying) play();
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectFunction(funcKey);
                if (!state.isPlaying) play();
            }
        });

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', funcKey);
            e.dataTransfer.effectAllowed = 'copy';
        });

        const favBtn = card.querySelector('.card-fav');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(funcKey, favBtn, card);
            });
        }

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

/**
 * Just update the UI text without changing the active state or playing audio
 */
function previewFunction(funcName) {
    const funcData = MATH_FUNCTIONS[funcName];
    // Hint that this is just a preview
    elements.functionTitle.textContent = funcData.name + " (Viewing)";
    
    if (window.katex) {
        try { katex.render(funcData.latex, elements.formulaText, { throwOnError: false }); } 
        catch (e) { elements.formulaText.textContent = funcData.formula; }
    } else {
        elements.formulaText.textContent = funcData.formula;
    }
    
    // Highlight the clicked button as "previewing" if desired
    document.querySelectorAll('.func-card').forEach(card => {
        card.style.opacity = card.dataset.func === funcName ? "1" : "0.7";
        if (card.dataset.func === funcName) card.style.borderColor = "var(--accent-color)";
        else card.style.borderColor = "transparent";
    });
}

function selectFunction(funcName) {
    state.currentFunction = funcName;
    document.querySelectorAll('.func-card').forEach(card => card.classList.toggle('active', card.dataset.func === funcName));
    
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

    if (funcData.category !== state.currentCategory && state.currentCategory !== 'all') selectCategory(funcData.category);

    state.timerStartTime = null;
    elements.currentIndex.textContent = state.functionIndex;
    elements.canvasClock.textContent = '00:00.00';
    state.drawProgress = 0;
    
    elements.canvasWrapper.classList.remove('zoom-in-effect');
    void elements.canvasWrapper.offsetWidth;
    elements.canvasWrapper.classList.add('zoom-in-effect');
    
    drawStaticGraph();
    
    if (state.isPlaying) {
        playSound(state.currentFunction);
        animate();
    }
}

function navigateFunction(direction) {
    const allFuncs = Object.keys(MATH_FUNCTIONS);
    let newIndex = allFuncs.indexOf(state.currentFunction) + direction;
    if (newIndex < 0) newIndex = allFuncs.length - 1;
    if (newIndex >= allFuncs.length) newIndex = 0;
    selectFunction(allFuncs[newIndex]);
}

function getCategoryFunctions(category) {
    if (category === 'all') return Object.keys(MATH_FUNCTIONS);
    return CATEGORIES[category]?.functions || [];
}

function matchesSearch(funcKey) {
    if (!state.searchQuery) return true;
    const func = MATH_FUNCTIONS[funcKey];
    const hay = [
        func.name,
        func.formula,
        func.latex,
        func.type,
        func.category
    ].join(' ').toLowerCase();
    return hay.includes(state.searchQuery);
}

function loadFavorites() {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        const list = raw ? JSON.parse(raw) : [];
        favoriteSet = new Set(Array.isArray(list) ? list : []);
    } catch (e) {
        favoriteSet = new Set();
    }
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteSet)));
}

function toggleFavorite(funcKey, btn, card) {
    if (favoriteSet.has(funcKey)) favoriteSet.delete(funcKey);
    else favoriteSet.add(funcKey);
    saveFavorites();
    if (btn) btn.classList.toggle('active', favoriteSet.has(funcKey));
    if (card) card.classList.toggle('favorite', favoriteSet.has(funcKey));
    if (state.favoritesOnly) renderFunctionButtons(state.currentCategory);
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
    state.autoLoopCount = 0; // 루프 카운트 초기화 (항상 1단계부터 시작)
    
    // Ensure audio context is running (resume if suspended by browser)
    if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
    
    playSound();
    animate();
}

function addLayer(funcName) {
    // Resume context if needed
    if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
    const targetFunc = funcName || state.currentFunction;
    playSound(targetFunc, true);
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
    
    // Only stop the preview sound, keep MIDI layers active
    stopPreview();
    
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
    state.drawProgress = 0; // Reset drawProgress to 0
    stopAllSounds();
    renderMixer();
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
    const currentFunc = state.currentFunction;
    // Ani 카테고리는 랜덤 재생 대상에서 제외
    const allKeys = Object.keys(MATH_FUNCTIONS).filter(key => 
        key !== currentFunc && MATH_FUNCTIONS[key].category !== 'ani'
    );
    
    // Shuffle others
    for (let i = allKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allKeys[i], allKeys[j]] = [allKeys[j], allKeys[i]];
    }
    
    // Current + 3 random
    state.autoQueue = [currentFunc, ...allKeys.slice(0, 3)];
    
    if (state.autoQueue.length === 0) return;
    state.isAutoPlaying = true;
    state.autoLoopCount = 0;
    state.isFirstAutoFunc = true; // Identify for 3-count logic
    
    if (elements.autoBtn) {
        elements.autoBtn.classList.add('playing');
    }
    playNextAuto();
}

function playNextAuto() {
    if (!state.isAutoPlaying) return;
    if (state.autoQueue.length === 0) { stop(); return; }
    
    const nextFunc = state.autoQueue.shift();
    
    // Every function gets 2 loops in auto-play
    state.autoTargetCount = 2;
    state.isFirstAutoFunc = false;
    
    selectFunction(nextFunc);
    state.autoLoopCount = 0;
    setTimeout(() => { if (state.isAutoPlaying) play(); }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
    if (window.katex) selectFunction(state.currentFunction);
});
