/**
 * Polygon Sound - Main Entry Point
 */

import { state } from './modules/state.js';
import { initAudio } from './modules/audio.js';
import { updateGeometry } from './modules/geometry.js';
import { initRenderer, render } from './modules/renderer.js';

function init() {
    // 1. Initialize Renderer (Canvas & UI)
    initRenderer();
    
    // 2. Setup Event Listeners
    setupEventListeners();
    
    // 3. Lucide Icons
    lucide.createIcons();
    
    // Start Animation Loop (stopped by default)
    loop();
}

function setupEventListeners() {
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const speedSlider = document.getElementById('speedSlider');

    playBtn.onclick = () => {
        initAudio(); // Initialize audio on first interaction
        state.isPlaying = !state.isPlaying;
        
        // UI Update
        const icon = playBtn.querySelector('.icon');
        const label = playBtn.querySelector('.label');
        
        if (state.isPlaying) {
            icon.innerHTML = '<i data-lucide="square" class="fill-current w-5 h-5"></i>';
            label.textContent = 'STOP';
            playBtn.classList.replace('bg-white', 'bg-rose-500');
            playBtn.classList.replace('text-slate-950', 'text-white');
        } else {
            icon.innerHTML = '<i data-lucide="play" class="fill-current w-5 h-5"></i>';
            label.textContent = 'START';
            playBtn.classList.replace('bg-rose-500', 'bg-white');
            playBtn.classList.replace('text-white', 'text-slate-950');
        }
        lucide.createIcons();
    };

    resetBtn.onclick = () => {
        state.rotation = 0;
        state.isPlaying = false;
        state.particles = [];
        state.activeKeys.fill(0);
        if (document.getElementById('playBtn').querySelector('.label').textContent === 'STOP') {
            document.getElementById('playBtn').click();
        }
    };

    speedSlider.oninput = (e) => {
        state.speed = parseFloat(e.target.value);
    };
}

function loop() {
    if (state.isPlaying) {
        updateGeometry();
    }
    render();
    requestAnimationFrame(loop);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
