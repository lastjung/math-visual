import { MATH_FUNCTIONS, CATEGORIES } from './modules/constants.js';
import { state, elements, ctx } from './modules/state.js';
import { playSound, stopSound, stopAllSounds, stopPreview } from './modules/audio.js';
import { drawStaticGraph, animate, setRendererCallbacks } from './modules/renderer.js';

const FAVORITES_KEY = 'math-sound:favorites';
const QUEUE_STORAGE_KEY = 'math-sound:play-queue';
const EQUATION_INTRO_COPY = 'How might this equation look as a graph, and what would it sound like?';
const EQUATION_OUTRO_COPY = 'This one is finished. Waiting for the next equation.';
const EQUATION_INTRO_DURATION_MS = 3000;
const EQUATION_OUTRO_DURATION_MS = 2000;
let favoriteSet = new Set();

// ==========================================
// 초기화
// ==========================================
function init() {
    setupCanvas();
    loadFavorites();
    loadQueue();
    renderCategoryTabs();
    setupEventListeners();
    setRendererCallbacks(updateTimer, playNextAuto, stopPreview);
    
    elements.totalCount.textContent = Object.keys(MATH_FUNCTIONS).length;
    selectCategory('waves');
    selectFunction('sine');
    drawStaticGraph();
    renderQueue();

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
    const mixerPanel = document.getElementById('mixerPanel');
    const closeMixerBtn = document.getElementById('closeMixerBtn');
    let layerClickTimer = null;

    if (layerBtn) {
        layerBtn.addEventListener('click', () => {
            if (layerClickTimer === null) {
                layerClickTimer = setTimeout(() => {
                    // 한 번 클릭: 박스에 있는 노래들 한 번씩 재생
                    if (state.playQueue.length > 0) {
                        state.autoTargetCount = 1; // 각 곡을 1회씩만 재생
                        state.isQueueMode = true;
                        playQueueItem(0);
                    }
                    layerClickTimer = null;
                }, 250);
            } else {
                // 더블 클릭: 박스 창 열기/닫기
                clearTimeout(layerClickTimer);
                layerClickTimer = null;
                if (mixerPanel) {
                    mixerPanel.classList.toggle('hidden');
                }
            }
        });
    }

    if (closeMixerBtn) {
        closeMixerBtn.addEventListener('click', () => {
            if (mixerPanel) mixerPanel.classList.add('hidden');
        });
    }

    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
        clearAllQueue();
    });

    if (elements.fullscreenBtn) {
        elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Drag & Drop for Mixer and Controls Box (HUD)
    const controlsBox = document.getElementById('controlsBox');
    
    [mixerPanel, controlsBox].forEach(el => {
        if (!el) return;
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.classList.add('drag-over');
        });
        el.addEventListener('dragleave', () => {
            el.classList.remove('drag-over');
        });
        el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.classList.remove('drag-over');
            const funcKey = e.dataTransfer.getData('text/plain');
            if (funcKey && MATH_FUNCTIONS[funcKey]) {
                addToQueue(funcKey);
                // Show mixer when something is added
                if (mixerPanel) mixerPanel.classList.remove('hidden');
            }
        });
    });

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

    if (elements.closeMenuBtn) {
        elements.closeMenuBtn.addEventListener('click', () => {
            elements.menuPanel.style.display = 'none';
            document.querySelector('.layout').classList.add('menu-hidden');
            setupCanvas();
            drawStaticGraph();
        });
    }

    if (elements.closeControlsBtn) {
        elements.closeControlsBtn.addEventListener('click', () => {
            elements.controlsBox.style.display = 'none';
        });
    }

    window.addEventListener('resize', () => {
        setupCanvas();
        if (!state.isPlaying) drawStaticGraph();
    });

    let sPressed = false;

    document.addEventListener('keydown', (e) => {
        // Prevent shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const key = e.key.toLowerCase();
        if (key === 's') sPressed = true;

        if (sPressed) {
            if (key === '1') {
                e.preventDefault();
                toggleAutoPlay();
                return;
            }
            if (key === '2') {
                e.preventDefault();
                if (state.playQueue.length > 0) {
                    state.autoTargetCount = 1;
                    state.isQueueMode = true;
                    playQueueItem(0);
                }
                return;
            }
            if (key === '3') {
                e.preventDefault();
                if (mixerPanel) mixerPanel.classList.toggle('hidden');
                return;
            }
        }

        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.code === 'ArrowRight') navigateFunction(1);
        else if (e.code === 'ArrowLeft') navigateFunction(-1);
        else if (e.key === 'Enter') {
            e.preventDefault();
            addToQueue();
        }
        else if (e.key === 'Escape') {
            if (document.body.classList.contains('is-fullscreen')) {
                toggleFullscreen();
            }
            // Restore Menu
            if (elements.menuPanel.style.display === 'none') {
                elements.menuPanel.style.display = '';
                document.querySelector('.layout').classList.remove('menu-hidden');
            }
            // Restore Controls Box
            if (elements.controlsBox.style.display === 'none') {
                elements.controlsBox.style.display = 'flex';
            }
            
            setupCanvas();
            drawStaticGraph();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key.toLowerCase() === 's') sPressed = false;
    });
}

// ==========================================
// 카테고리 & 함수 제어
// ==========================================
function renderCategoryTabs() {
    const existingContainer = document.getElementById('categoryTabsExisting');
    const symphonyContainer = document.getElementById('categoryTabsSymphony');
    
    if (!existingContainer || !symphonyContainer) return;
    
    existingContainer.innerHTML = '';
    symphonyContainer.innerHTML = '';

    // 1. Add 'All' button to existing row
    const allBtn = document.createElement('button');
    allBtn.className = 'category-tab' + ('all' === state.currentCategory ? ' active' : '');
    allBtn.dataset.category = 'all';
    allBtn.textContent = '✨ All';
    allBtn.addEventListener('click', () => selectCategory('all'));
    existingContainer.appendChild(allBtn);

    const categories = Object.keys(CATEGORIES);
    
    // 2. Sort other categories
    categories.forEach(catId => {
        const cat = CATEGORIES[catId];
        const btn = document.createElement('button');
        btn.className = 'category-tab' + (catId === state.currentCategory ? ' active' : '');
        btn.dataset.category = catId;
        btn.textContent = cat.name;
        btn.addEventListener('click', () => selectCategory(catId));
        
        if (catId === 'amazing' || catId === 'beautiful' || catId === 'harmonic' || catId === 'fusion' || catId === 'hyper' || catId === 'insane' || catId === 'fantastic' || catId === 'incredible' || catId === 'incomprehensible') {
            symphonyContainer.appendChild(btn);
        } else {
            existingContainer.appendChild(btn);
        }
    });

    // Horizontal scroll & Drag support for both containers
    [existingContainer, symphonyContainer].forEach(container => {
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.classList.add('grabbing');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.classList.remove('grabbing');
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.classList.remove('grabbing');
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    });
    
    elements.categoryTabs = document.querySelectorAll('.category-tab');
}

function selectCategory(category, autoSelectFirst = false) {
    state.currentCategory = category;
    elements.categoryTabs.forEach(tab => {
        const isActive = tab.dataset.category === category;
        tab.classList.toggle('active', isActive);
        if (isActive) {
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
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
                <button class="card-add-btn" title="박스에 넣기">+</button>
                <button class="card-fav ${favoriteSet.has(funcKey) ? 'active' : ''}" title="즐겨찾기">★</button>
            </div>
            <div class="card-tags">
                <span class="tag" data-category="${func.category}">${categoryLabel}</span>
                <span class="tag" data-type="${func.type}">${func.type}</span>
            </div>
            <div class="card-formula">${func.formula}</div>
        `;

        const addBtn = card.querySelector('.card-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToQueue(funcKey);
            });
        }

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
    if (!funcName) {
        state.currentFunction = null;
        elements.functionTitle.textContent = "Select a Function";
        elements.formulaText.textContent = "";
        drawStaticGraph();
        return;
    }
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
    } else if (state.isPrimingPlayback) {
        updateEquationIntroContent();
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

function loadQueue() {
    try {
        const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        state.playQueue = Array.isArray(list) ? list.filter((key) => MATH_FUNCTIONS[key]) : [];
        state.isQueueMode = state.playQueue.length > 0;
        state.currentQueueIndex = state.playQueue.length > 0 ? 0 : -1;
    } catch (e) {
        state.playQueue = [];
        state.isQueueMode = false;
        state.currentQueueIndex = -1;
    }
}

function saveQueue() {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(state.playQueue));
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
    (state.isPlaying || state.isPrimingPlayback) ? pause() : play();
}

function updateEquationIntroContent() {
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    if (!funcData || !elements.equationIntroFormula) return;

    if (window.katex) {
        try {
            katex.render(funcData.latex, elements.equationIntroFormula, { throwOnError: false });
        } catch (e) {
            elements.equationIntroFormula.textContent = funcData.formula;
        }
    } else {
        elements.equationIntroFormula.textContent = funcData.formula;
    }

    if (elements.equationIntroCopy) {
        elements.equationIntroCopy.textContent = EQUATION_INTRO_COPY;
    }
}

function updateEquationOutroContent() {
    if (!elements.equationIntroFormula || !elements.equationIntroCopy) return;
    elements.equationIntroFormula.textContent = 'Playback Complete';
    elements.equationIntroCopy.textContent = EQUATION_OUTRO_COPY;
}

function hideEquationIntro() {
    if (!elements.equationIntroOverlay) return;
    elements.equationIntroOverlay.classList.remove('visible');
    elements.equationIntroOverlay.setAttribute('aria-hidden', 'true');
}

function cancelPendingPlayIntro() {
    if (state.introOverlayTimer) {
        clearTimeout(state.introOverlayTimer);
        state.introOverlayTimer = null;
    }
    state.isPrimingPlayback = false;
    hideEquationIntro();
}

function showEquationOverlay() {
    if (!elements.equationIntroOverlay) return;
    elements.equationIntroOverlay.classList.add('visible');
    elements.equationIntroOverlay.setAttribute('aria-hidden', 'false');
}

function showWaitingMessage(callback) {
    cancelPendingPlayIntro();
    updateEquationOutroContent();
    showEquationOverlay();
    state.isPrimingPlayback = true;
    state.introOverlayTimer = window.setTimeout(() => {
        state.introOverlayTimer = null;
        hideEquationIntro();
        state.isPrimingPlayback = false;
        if (callback) callback();
    }, EQUATION_OUTRO_DURATION_MS);
}

function showCompletionMessage() {
    updateEquationOutroContent();
    showEquationOverlay();
    state.isPrimingPlayback = true;
    state.introOverlayTimer = window.setTimeout(() => {
        state.introOverlayTimer = null;
        hideEquationIntro();
        state.isPrimingPlayback = false;
    }, EQUATION_OUTRO_DURATION_MS);
}

function startPlaybackNow() {
    state.isPlaying = true;
    state.isPrimingPlayback = false;
    state.timerStartTime = performance.now();
    elements.playBtn.classList.add('playing');
    elements.playBtn.querySelector('.icon').textContent = '❚❚';
    document.body.classList.add('drawing');
    state.autoLoopCount = 0; 
    
    if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
    
    // If we have a queue but nothing set as current queue item, start from index 0
    if (state.playQueue.length > 0 && state.currentQueueIndex === -1) {
        state.currentQueueIndex = 0;
        selectFunction(state.playQueue[0]);
    }
    
    playSound();
    animate();
}

function play(withIntro = false) {
    if (!withIntro) {
        cancelPendingPlayIntro();
        startPlaybackNow();
        return;
    }

    if (state.isPrimingPlayback) return;

    updateEquationIntroContent();
    showEquationOverlay();

    state.isPrimingPlayback = true;
    state.introOverlayTimer = window.setTimeout(() => {
        state.introOverlayTimer = null;
        hideEquationIntro();
        startPlaybackNow();
    }, EQUATION_INTRO_DURATION_MS);
}

function addToQueue(funcName) {
    if (state.audioContext && state.audioContext.state === 'suspended') {
        state.audioContext.resume();
    }
    const targetFunc = funcName || state.currentFunction;
    state.playQueue.push(targetFunc);
    state.isQueueMode = true;
    
    // If it's the first item added, set it as current but DO NOT play automatically
    if (state.currentQueueIndex === -1) {
        state.currentQueueIndex = 0;
        selectFunction(targetFunc);
    }
    saveQueue();
    
    renderQueue();
    
    // Auto-show panel when adding a song
    const mixerPanel = document.getElementById('mixerPanel');
    if (mixerPanel) mixerPanel.classList.remove('hidden');
}

function playQueueItem(index) {
    if (index < 0 || index >= state.playQueue.length) return;
    
    state.currentQueueIndex = index;
    const funcKey = state.playQueue[index];
    selectFunction(funcKey);
    renderQueue();
    
    if (!state.isPlaying) play(true);
}

function renderQueue() {
    const mixerPanel = document.getElementById('mixerPanel');
    const container = document.getElementById('activeLayers');
    if (!mixerPanel || !container) return;

    const showPianoQueue = state.playQueue.length > 0;
    const isAuto = !showPianoQueue && state.isAutoPlaying;
    const currentList = showPianoQueue ? state.playQueue : (isAuto ? state.autoQueue : []);
    const activeIdx = showPianoQueue ? state.currentQueueIndex : state.autoQueueIndex;

    // 제목 업데이트
    const titleEl = mixerPanel.querySelector('h3');
    if (titleEl) {
        titleEl.textContent = isAuto ? '🎲 Random Box' : '🎹 Simulation Queue';
    }

    if (currentList.length === 0) {
        mixerPanel.classList.add('hidden');
        return;
    }

    container.innerHTML = '';

    // 현재 대기열 표시
    currentList.forEach((funcKey, index) => {
        const func = MATH_FUNCTIONS[funcKey];
        if (!func) return; // Safety guard
        
        const tag = document.createElement('div');
        tag.className = 'layer-tag' + (index === activeIdx ? ' active' : '');
        tag.style.cursor = 'pointer';
        
        tag.innerHTML = `
            <span style="opacity: 0.5; font-size: 0.7rem;">${index + 1}</span>
            <span>${func.name}</span>
            <span class="remove-layer" data-index="${index}" style="margin-left: auto; cursor: pointer;">✕</span>
        `;
        
        tag.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-layer')) return;
            if (isAuto) {
                state.autoQueueIndex = index;
                selectFunction(state.autoQueue[index]);
                if (!state.isPlaying) play(true);
                renderQueue();
            } else {
                playQueueItem(index);
            }
        });

        tag.querySelector('.remove-layer').addEventListener('click', (e) => {
            e.stopPropagation();
            if (isAuto) {
                state.autoQueue.splice(index, 1);
                if (state.autoQueueIndex >= state.autoQueue.length) state.autoQueueIndex = state.autoQueue.length - 1;
                renderQueue();
            } else {
                removeFromQueue(index);
            }
        });
        
        container.appendChild(tag);
    });
}

function removeFromQueue(index) {
    const wasPlaying = (index === state.currentQueueIndex);
    state.playQueue.splice(index, 1);
    saveQueue();
    
    if (state.playQueue.length === 0) {
        state.isQueueMode = false;
        state.currentQueueIndex = -1;
        stop();
    } else {
        if (wasPlaying) {
            playQueueItem(Math.min(index, state.playQueue.length - 1));
        } else if (index < state.currentQueueIndex) {
            state.currentQueueIndex--;
        }
    }
    renderQueue();
}

function pause() {
    cancelPendingPlayIntro();
    state.isPlaying = false;
    elements.playBtn.classList.remove('playing');
    elements.playBtn.querySelector('.icon').textContent = '▶';
    document.body.classList.remove('drawing');
    
    // Only stop the preview sound, keep MIDI layers active
    stopPreview();
    
    if (state.animationId) cancelAnimationFrame(state.animationId);
    renderQueue();
}

function stop() {
    if (state.isAutoPlaying) {
        state.isAutoPlaying = false;
        state.autoLoopCount = 0;
        if (elements.autoBtn) elements.autoBtn.classList.remove('playing');
    }
    pause();
    state.timerStartTime = null;
    elements.canvasClock.textContent = '00:00.00';
    state.drawProgress = 1.0; 
    if (state.playQueue.length === 0) {
        state.currentQueueIndex = -1;
    }
    renderQueue();
    drawStaticGraph();
}

function reset() {
    stop(); // Stop current playback and reset timers
    state.drawProgress = 1.0; // Show full graph
    
    // Ensure we keep the queue! Just reset the play state.
    renderQueue();
    drawStaticGraph();
}

function clearAllQueue() {
    state.playQueue = [];
    state.currentQueueIndex = -1;
    state.isQueueMode = false;
    saveQueue();
    stop();
    
    // Clear visualization
    const width = elements.waveformCanvas.offsetWidth;
    const height = elements.waveformCanvas.offsetHeight;
    if (ctx.waveform) {
        ctx.waveform.fillStyle = '#f3f4f6';
        ctx.waveform.fillRect(0, 0, width, height);
    }
    
    renderQueue();
    drawStaticGraph();
}

// ==========================================
// 자동 재생 (Auto Play)
// ==========================================
function toggleAutoPlay() {
    state.isAutoPlaying ? stop() : startAutoPlay();
}

function startAutoPlay() {
    stop(); // 모든 재생 중단 (하지만 박스 목록은 유지됨)
    const currentFunc = state.currentFunction || 'sine';
    
    // 1. 주사위 전용 대기열(autoQueue)에 담기 (박스 목록은 안 건드림)
    state.autoQueue = [];
    
    // Ani 카테고리 제외한 목록 추출
    const allKeys = Object.keys(MATH_FUNCTIONS).filter(key => 
        MATH_FUNCTIONS[key].category !== 'ani'
    );
    
    for (let i = allKeys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allKeys[i], allKeys[j]] = [allKeys[j], allKeys[i]];
    }
    
    const filteredRandoms = allKeys.filter(k => k !== currentFunc);
    state.autoQueue = [currentFunc, ...filteredRandoms.slice(0, 3)];
    
    // 2. 랜덤 박스 전용 상태 설정
    state.isAutoPlaying = true;
    state.isQueueMode = false; // 사용자 박스 모드 해제
    state.autoLoopCount = 0;
    state.autoTargetCount = 2;
    
    // 3. 주사위 버튼 상태 표시
    if (elements.autoBtn) elements.autoBtn.classList.add('playing');
    
    renderQueue();
    
    // 4. 첫 곡 설정 (목록에서 빼지 않고 인덱스만 사용)
    state.autoQueueIndex = 0;
    selectFunction(state.autoQueue[0]);
    
    // 5. 즉시 재생 시작
    if (!state.isPlaying) play(true);
}

function playNextAuto() {
    // 1. 박스 모드(Queue Mode)일 때
    if (state.isQueueMode && state.currentQueueIndex !== -1) {
        if (state.currentQueueIndex < state.playQueue.length - 1) {
            playQueueItem(state.currentQueueIndex + 1);
        } else {
            stop();
            showCompletionMessage();
        }
        return;
    }

    // 2. 랜덤 박스(Auto Play) 모드일 때
    if (!state.isAutoPlaying) return;
    
    if (state.autoQueueIndex < state.autoQueue.length - 1) {
        state.autoQueueIndex++;
        const nextFunc = state.autoQueue[state.autoQueueIndex];
        state.autoTargetCount = 2; // 매 곡 2회 연주
        
        selectFunction(nextFunc);
        state.autoLoopCount = 0;
        renderQueue(); // 현재 연주 곡 표시 갱신
        if (state.isAutoPlaying) play(true);
    } else {
        stop();
        showCompletionMessage();
    }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
    if (window.katex) selectFunction(state.currentFunction);
});

// ==========================================
// Fullscreen Control (Pseudo-Fullscreen)
// ==========================================
function toggleFullscreen() {
    const isFullscreen = document.body.classList.toggle('is-fullscreen');
    
    // UI Feedback for button
    if (elements.fullscreenBtn) {
        elements.fullscreenBtn.classList.toggle('active', isFullscreen);
    }

    // Refresh layout and canvas
    setTimeout(() => {
        setupCanvas();
        drawStaticGraph();
    }, 50);
}
