/**
 * Polygon Sound - Main Entry Point
 */

import { state } from './modules/state.js';
import { initAudio } from './modules/audio.js';
import { updateGeometry } from './modules/geometry.js';
import { initRenderer, render, renderLayerControls } from './modules/renderer.js';
import { SCALE_HINTS, DEFAULT_SCALE, CHORDS, DEFAULT_PROGRESS } from './modules/constants.js';

function init() {
    // 1. Initialize Renderer (Canvas & UI)
    initRenderer();
    
    // 2. Setup Event Listeners
    setupEventListeners();

    // 2-1. Initialize progression from default/state
    applyProgressionInput(state.chordProgressionText);
    
    // 3. Lucide Icons
    lucide.createIcons();
    
    // Start Animation Loop (stopped by default)
    loop();
}

function setupEventListeners() {
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const randomBtn = document.getElementById('randomBtn');
    const speedSlider = document.getElementById('speedSlider');

    playBtn.onclick = () => {
        initAudio(); // Initialize audio on first interaction
        state.isPlaying = !state.isPlaying;
        
        // UI Update
        if (state.isPlaying) {
            playBtn.innerHTML = '<i data-lucide="square" class="icon-lg fill-current"></i>';
            playBtn.classList.add('playing');
        } else {
            playBtn.innerHTML = '<i data-lucide="play" class="icon-lg fill-current"></i>';
            playBtn.classList.remove('playing');
        }
        lucide.createIcons();
    };

    resetBtn.onclick = () => {
        state.rotation = 0;
        state.isPlaying = false;
        state.particles = [];
        state.activeKeys.fill(0);
        state.elapsedTime = 0; // Reset timer
        
        // Reset UI to Stop state
        playBtn.innerHTML = '<i data-lucide="play" class="icon-lg fill-current"></i>';
        playBtn.classList.remove('playing');
        lucide.createIcons();
    };

    randomBtn.onclick = () => {
        const layer = state.layers[state.activeLayerIndex];
        
        // Randomly decide between Standard (60%) and Gen (40%)
        const isGen = Math.random() > 0.6;
        
        if (isGen) {
            // Gen Mode
            const step = Math.floor(Math.random() * 10) + 2; // 2~11
            layer.genValue = step;
            
            // Calculate vertices
            let current = 0;
            const vertices = [];
            do {
                vertices.push(current);
                current = (current + step) % 12;
            } while (current !== 0);
            layer.customVertices = vertices;
        } else {
            // Standard Mode
            const n = Math.floor(Math.random() * 10) + 3; // 3~12
            layer.sides = n;
            layer.customVertices = null;
        }
        
        renderLayerControls();
    };

    speedSlider.oninput = (e) => {
        state.speed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = `${state.speed.toFixed(1)}x`;
    };

    const scaleSelect = document.getElementById('scaleSelect');
    const scaleHint = document.getElementById('scaleHint');
    if (scaleSelect) {
        scaleSelect.value = state.currentScale || DEFAULT_SCALE;
        updateScaleHint(scaleSelect.value, scaleHint);
        scaleSelect.onchange = (e) => {
            state.currentScale = e.target.value;
            updateScaleHint(state.currentScale, scaleHint);
        };
    }

    const progressionInput = document.getElementById('progressionInput');
    if (progressionInput) {
        progressionInput.value = state.chordProgressionText || DEFAULT_PROGRESS;
        progressionInput.onchange = (e) => {
            applyProgressionInput(e.target.value);
        };
    }
}

function updateScaleHint(scaleName, hintEl) {
    if (!hintEl) return;
    const name = scaleName || DEFAULT_SCALE;
    hintEl.textContent = SCALE_HINTS[name] || '';
}

function applyProgressionInput(text) {
    const parsed = parseProgression(text);
    state.chordProgressionText = text;
    state.chordProgression = parsed;
    state.chordIndex = 0;
    state.currentChord = state.chordProgression[0] || '';
    state.lastChordApplied = null;
}

function parseProgression(text) {
    const raw = (text || '').split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
    return raw.filter(token => Object.prototype.hasOwnProperty.call(CHORDS, token));
}

function loop(timestamp) {
    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const delta = (timestamp - state.lastFrameTime) / 1000; // in seconds
    state.lastFrameTime = timestamp;

    if (state.isPlaying) {
        state.elapsedTime += delta;
        updateGeometry();
    }
    render();
    requestAnimationFrame(loop);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
