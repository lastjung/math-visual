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
    analyser: null,
    bufferSource: null,
    activeNodes: new Map(), // To manage multiple layers
    volume: 0.5,
    speed: 1,
    zoom: 1,
    drawProgress: 0,
    functionIndex: 1,
    timerStartTime: null,
    // Auto Play State
    isAutoPlaying: false,
    autoQueue: [],
    autoLoopCount: 0,
    autoTargetCount: 3 // Default
};

export const elements = {
    graphCanvas: document.getElementById('graphCanvas'),
    waveformCanvas: document.getElementById('waveformCanvas'),
    formulaText: document.getElementById('formulaText'),
    functionTitle: document.getElementById('functionTitle'),
    playBtn: document.getElementById('playBtn'),
    stopBtn: document.getElementById('stopBtn'),
    resetBtn: document.getElementById('resetBtn'),
    autoBtn: document.getElementById('autoBtn'),
    zoomSlider: document.getElementById('zoomSlider'),
    zoomValue: document.getElementById('zoomValue'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    speedSlider: document.getElementById('speedSlider'),
    speedValue: document.getElementById('speedValue'),
    functionSelector: document.getElementById('functionSelector'),
    categoryTabs: document.querySelectorAll('.category-tab'),
    currentIndex: document.getElementById('currentIndex'),
    totalCount: document.getElementById('totalCount'),
    container: document.querySelector('.container'),
    canvasWrapper: document.querySelector('.canvas-wrapper'),
    canvasClock: document.getElementById('canvasClock')
};

// Canvas contexts (Initialised in app.js or renderer.js)
export const ctx = {
    graph: null,
    waveform: null
};
