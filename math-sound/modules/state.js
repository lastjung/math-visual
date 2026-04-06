/**
 * Math Sound Visualizer - State
 * 앱의 전역 상태 및 DOM 요소 관리
 */

export const state = {
    currentFunction: 'sine',
    currentCategory: 'waves',
    isPlaying: false,
    animationId: null,
    audioContext: null,
    gainNode: null,
    lowShelfNode: null,
    highShelfNode: null,
    filterNode: null,
    compressorNode: null,
    clipperNode: null,
    analyser: null,
    bufferSource: null,
    activeNodes: new Map(), // To manage multiple layers
    volume: 0.5,
    speed: 0.8,
    zoom: 1,
    drawProgress: 0,
    functionIndex: 1,
    timerStartTime: null,
    audioStartTime: null,
    searchQuery: '',
    favoritesOnly: false,
    // Auto Play State
    isAutoPlaying: false,
    autoQueue: [],
    autoQueueIndex: -1,
    autoLoopCount: 0,
    autoTargetCount: 60, // 시원하게 늘려서 긴 연주 보장
    // Sequential Queue State
    playQueue: [],
    currentQueueIndex: -1,
    isQueueMode: false,
    isPrimingPlayback: false,
    introOverlayTimer: null,
    showGhost: true
};

export const elements = {
    graphCanvas: document.getElementById('graphCanvas'),
    waveformCanvas: document.getElementById('waveformCanvas'),
    formulaText: document.getElementById('formulaText'),
    functionTitle: document.getElementById('functionTitle'),
    functionSubtitle: document.getElementById('functionSubtitle'),
    playBtn: document.getElementById('playBtn'),
    stopBtn: document.getElementById('stopBtn'),
    resetBtn: document.getElementById('resetBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    autoBtn: document.getElementById('autoBtn'),
    zoomSlider: document.getElementById('zoomSlider'),
    zoomValue: document.getElementById('zoomValue'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    functionSelector: document.getElementById('functionSelector'),
    functionSearch: document.getElementById('functionSearch'),
    favoritesToggle: document.getElementById('favoritesToggle'),
    slidersPanel: document.getElementById('slidersPanel'),
    slidersToggle: document.getElementById('slidersToggle'),
    categoryTabs: document.querySelectorAll('.category-tab'),
    menuPanel: document.getElementById('menuPanel'),
    closeMenuBtn: document.getElementById('closeMenuBtn'),
    controlsBox: document.getElementById('controlsBox'),
    closeControlsBtn: document.getElementById('closeControlsBtn'),
    currentIndex: document.getElementById('currentIndex'),
    totalCount: document.getElementById('totalCount'),
    container: document.querySelector('.container'),
    canvasWrapper: document.querySelector('.canvas-wrapper'),
    canvasClock: document.getElementById('canvasClock'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    equationIntroOverlay: document.getElementById('equationIntroOverlay'),
    equationIntroFormula: document.getElementById('equationIntroFormula'),
    equationIntroCopy: document.getElementById('equationIntroCopy')
};

// Canvas contexts (Initialised in app.js or renderer.js)
export const ctx = {
    graph: null,
    waveform: null
};
