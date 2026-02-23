/**
 * Polygon Harmonic - App Entry (Minimalist YouTube Match)
 */

import { state } from './modules/state.js';
import { initAudio, setMasterVolume } from './modules/audio.js';
import { updateGeometry } from './modules/geometry.js';
import { initRenderer, render } from './modules/renderer.js';
import { initTimeline, updateTimeline, jumpToPolygon } from './modules/timeline.js';
// removed story.js completely
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
    state.soloIndex = -1; // Default Intro
    const sel = document.getElementById('polygonSelect');
    if(sel) sel.value = "-1";
    
    // Load first story into memory using Timeline
    initTimeline();

    requestAnimationFrame(loop);
}

function setupEventListeners() {
    const playBtn = document.getElementById('playBtn');
    const polygonSelect = document.getElementById('polygonSelect');
    const speedSlider = document.getElementById('speedSlider');
    const resetBtn = document.getElementById('resetBtn');
    const loopBtn = document.getElementById('loopBtn');
    const verifBtn = document.getElementById('verifBtn');
    const subtitleBtn = document.getElementById('subtitleBtn');
    const pianoVolSlider = document.getElementById('pianoVol');
    const voiceVolSlider = document.getElementById('voiceVol');

    playBtn.onclick = async () => {
        await initAudio();
        state.isPlaying = !state.isPlaying;
        updatePlayBtn();
    };

    polygonSelect.onchange = (e) => {
        const newIndex = parseInt(e.target.value, 10);
        state.soloIndex = newIndex;
        jumpToPolygon(newIndex);
    };

    speedSlider.oninput = (e) => {
        state.speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = `${state.speed.toFixed(1)}x`;
    };

    if(pianoVolSlider) pianoVolSlider.oninput = (e) => setMasterVolume(parseFloat(e.target.value));
    if(voiceVolSlider) voiceVolSlider.oninput = (e) => {
        const ttsAudio = document.getElementById('ttsAudio');
        if (ttsAudio) ttsAudio.volume = parseFloat(e.target.value);
    };

    if(resetBtn) {
        resetBtn.onclick = async () => {
            await initAudio();
            jumpToPolygon(state.soloIndex);
            state.isPlaying = true;
            updatePlayBtn();
        };
    }
    
    if(loopBtn) {
        loopBtn.onclick = () => {
            state.isLooping = !state.isLooping;
            loopBtn.classList.toggle('active', state.isLooping);
        };
    }
    
    if (subtitleBtn) {
        subtitleBtn.onclick = () => {
            state.showSubtitles = !state.showSubtitles;
            subtitleBtn.classList.toggle('active', state.showSubtitles);
            
            const botEl = document.getElementById('bottomDesc');
            const topEl = document.getElementById('topTitle');
            const annoEl = document.getElementById('annotationsLayer');
            if(botEl) botEl.style.display = state.showSubtitles ? '' : 'none';
            if(topEl) topEl.style.display = state.showSubtitles ? '' : 'none';
            if(annoEl && !state.showSubtitles) annoEl.style.display = 'none';
        };
        // Initial state: subtitles ON
        subtitleBtn.classList.add('active');
    }
    
    if (verifBtn) {
        verifBtn.onclick = () => {
            state.isVerificationMode = !state.isVerificationMode;
            verifBtn.classList.toggle('active', state.isVerificationMode);
            if (state.isVerificationMode) verifBtn.style.color = '#ff0033';
            else verifBtn.style.color = '';
            
            const pianoSlider = document.getElementById('pianoVol');
            if (state.isVerificationMode) {
                setMasterVolume(0);
                if (pianoSlider) pianoSlider.value = 0;
            } else {
                setMasterVolume(0.4);
                if (pianoSlider) pianoSlider.value = 0.4;
            }
        };
    }

    if (window.lucide) window.lucide.createIcons();
}

function updatePlayBtn() {
    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = state.isPlaying 
        ? '<i data-lucide="pause"></i>' 
        : '<i data-lucide="play"></i>';
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
    updateTimeline(delta); // Subtitles + Audio + Timeline Sync
    render();

    animationId = requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', init);
