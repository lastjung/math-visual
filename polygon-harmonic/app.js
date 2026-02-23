/**
 * Polygon Harmonic - App Entry (Minimalist YouTube Match)
 */

import { state } from './modules/state.js';
import { initAudio, setMasterVolume } from './modules/audio.js';
import { updateGeometry } from './modules/geometry.js';
import { initRenderer, render } from './modules/renderer.js';
import { updateStorySequence, loadStorySequence, toggleAudioPlayback, setVoiceVolume } from './modules/story.js';
import { POLYGONS } from './modules/constants.js';

let animationId;

async function init() {
    initRenderer();
    setupEventListeners();

    // Clear loading
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }, 500);

    // Initial setup
    state.viewMode = 'solo';
    state.soloIndex = 0; // Default Triangle
    const sel = document.getElementById('polygonSelect');
    if(sel) sel.value = "0";
    
    // Load first story into memory
    loadStorySequence(0);

    requestAnimationFrame(loop);
}

function setupEventListeners() {
    const playBtn = document.getElementById('playBtn');
    const polygonSelect = document.getElementById('polygonSelect');
    const speedSlider = document.getElementById('speedSlider');
    const dirBtn = document.getElementById('dirBtn');
    const pianoVolSlider = document.getElementById('pianoVol');
    const voiceVolSlider = document.getElementById('voiceVol');

    playBtn.onclick = async () => {
        await initAudio();
        state.isPlaying = !state.isPlaying;
        updatePlayBtn();
        toggleAudioPlayback(state.isPlaying);
    };

    polygonSelect.onchange = (e) => {
        const newIndex = parseInt(e.target.value, 10);
        state.soloIndex = newIndex;
        loadStorySequence(newIndex);
    };

    speedSlider.oninput = (e) => {
        state.speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = `${state.speed.toFixed(1)}x`;
    };

    if(pianoVolSlider) {
        pianoVolSlider.oninput = (e) => setMasterVolume(parseFloat(e.target.value));
    }
    
    if(voiceVolSlider) {
        voiceVolSlider.oninput = (e) => setVoiceVolume(parseFloat(e.target.value));
    }

    dirBtn.onclick = () => {
        state.direction *= -1;
    };

    if (window.lucide) window.lucide.createIcons();
}

function updatePlayBtn() {
    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = state.isPlaying 
        ? '<i data-lucide="pause"></i> PAUSE' 
        : '<i data-lucide="play"></i> PLAY';
    if (state.isPlaying) playBtn.classList.add('playing');
    else playBtn.classList.remove('playing');
    if (window.lucide) window.lucide.createIcons();
}

function loop(timestamp) {
    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const delta = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;

    const effectiveDelta = delta * (state.storySpeedMultiplier || 1.0);
    updateGeometry(effectiveDelta);
    updateStorySequence(delta); // Subtitles + Audio progress
    render();

    animationId = requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', init);
