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
        // If it was stopped at the end and we press play again, restart from beginning if it's over
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
            await initAudio(); // Ensure context is ready
            jumpToPolygon(state.soloIndex);
            
            // Force play from start
            state.isPlaying = true;
            updatePlayBtn();
        };
    }
    
    if(loopBtn) {
        loopBtn.onclick = () => {
            state.isLooping = !state.isLooping;
            loopBtn.innerHTML = state.isLooping 
                ? '<i data-lucide="repeat"></i> <span>AUTO: ON</span>' 
                : '<i data-lucide="repeat"></i> <span>AUTO: OFF</span>';
            if (state.isLooping) loopBtn.style.color = '#00aaff';
            else loopBtn.style.color = '';
            if (window.lucide) window.lucide.createIcons();
        };
    }
    
    if (subtitleBtn) {
        subtitleBtn.onclick = () => {
            state.showSubtitles = !state.showSubtitles;
            subtitleBtn.innerHTML = state.showSubtitles 
                ? '<i data-lucide="message-square"></i> <span>TEXT: ON</span>' 
                : '<i data-lucide="message-square"></i> <span>TEXT: OFF</span>';
            if (!state.showSubtitles) subtitleBtn.style.color = '#aaa';
            else subtitleBtn.style.color = '';
            
            // Immediately apply
            const botEl = document.getElementById('bottomDesc');
            const topEl = document.getElementById('topTitle');
            const annoEl = document.getElementById('annotationsLayer');
            if(botEl) botEl.style.display = state.showSubtitles ? '' : 'none';
            if(topEl) topEl.style.display = state.showSubtitles ? '' : 'none';
            if(annoEl && !state.showSubtitles) annoEl.style.display = 'none';
            
            if (window.lucide) window.lucide.createIcons();
        };
    }
    
    if (verifBtn) {
        verifBtn.onclick = () => {
            state.isVerificationMode = !state.isVerificationMode;
            verifBtn.innerHTML = state.isVerificationMode 
                ? '<i data-lucide="youtube"></i> <span>VERIF: ON</span>' 
                : '<i data-lucide="youtube"></i> <span>VERIF: OFF</span>';
            if (state.isVerificationMode) verifBtn.style.color = '#ff0033';
            else verifBtn.style.color = '';
            
            // Adjust master volume appropriately
            const pianoSlider = document.getElementById('pianoVol');
            if (state.isVerificationMode) {
                setMasterVolume(0); // Mute synth for verification
                if (pianoSlider) pianoSlider.value = 0;
            } else {
                setMasterVolume(0.4);
                if (pianoSlider) pianoSlider.value = 0.4;
            }
                
            if (window.lucide) window.lucide.createIcons();
        };
    }

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
    updateTimeline(delta); // Subtitles + Audio + Timeline Sync
    render();

    animationId = requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', init);
