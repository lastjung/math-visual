/**
 * Polygon Harmonic - Story Mode Engine (TTS & VTT Sync)
 */

import { state } from './state.js';

export const STORY_SCENES = [
    { title: "Triangle" },
    { title: "Square" },
    { title: "Pentagon" },
    { title: "Hexagon" },
    { title: "Heptagon" },
    { title: "Octagon" },
    { title: "Nonagon" },
    { title: "Decagon" },
    { title: "Hendecagon" },
    { title: "Dodecagon" }
];

let vttData = [];
let audioEl = null;
let silenceTimer = 0; // Wait a moment after audio before switching

export async function loadStorySequence(index) {
    // 0 = Triangle (3-sided)
    const polyNumber = index + 3;
    vttData = [];
    
    // Load VTT
    try {
        const res = await fetch(`public/audio/poly_${polyNumber}.vtt`);
        if (res.ok) {
            const text = await res.text();
            parseVTT(text);
        } else {
            console.error('Failed to load VTT');
        }
    } catch(e) { console.error('VTT load err:', e); }

    // Load Audio
    if(!audioEl) audioEl = document.getElementById('ttsAudio');
    audioEl.src = `public/audio/poly_${polyNumber}.mp3`;
    audioEl.currentTime = 0;
    
    if(state.isPlaying) {
        audioEl.play().catch(e => console.warn("Audio autoplay blocked:", e));
    }
    silenceTimer = 0;
}

function parseVTT(text) {
    const blocks = text.split('\n\n');
    blocks.forEach(block => {
        const lines = block.split('\n');
        const timeLineIdx = lines.findIndex(l => l.includes('-->'));
        if(timeLineIdx !== -1) {
            const times = lines[timeLineIdx].split(' --> ');
            const start = parseTime(times[0]);
            const end = parseTime(times[1]);
            // Reconstruct text, removing any tags
            const rawText = lines.slice(timeLineIdx + 1).join(' ');
            if(rawText.trim()) {
                vttData.push({start, end, text: rawText});
            }
        }
    });
}

function parseTime(str) {
    // format like 00:00:23.450
    const parts = str.trim().split(':');
    let secs = 0;
    if (parts.length === 3) {
        secs += parseInt(parts[0], 10) * 3600;
        secs += parseInt(parts[1], 10) * 60;
        secs += parseFloat(parts[2]);
    } else if (parts.length === 2) {
        secs += parseInt(parts[0], 10) * 60;
        secs += parseFloat(parts[1]);
    }
    return secs;
}

export function updateStorySequence(delta) {
    if (!state.isPlaying || !audioEl) return;
    
    // Playback state is driven by the mp3 audio's current time
    const t = audioEl.currentTime;
    
    // --- Dynamic YouTube Visual Rules ---
    let targetDir = -1; // Default CCW
    let targetSpeedMulti = 1.0;

    switch(state.soloIndex) {
        case 0: // Triangle
            if (t >= 24.7) targetDir = 1; // "If we rotate clockwise instead..."
            break;
        case 4: // Heptagon
            targetDir = 1; targetSpeedMulti = 1.4; // opposite, a bit faster
            break;
        case 5: // Octagon
            targetDir = 1; targetSpeedMulti = 2.0; // opposite, twice as fast
            break;
        case 6: // Nonagon
            targetDir = 1; targetSpeedMulti = 3.0; // opposite, three times as fast
            break;
        case 8: // Hendecagon
            targetDir = 1; // opposite
            break;
        case 9: // Dodecagon
            targetDir = -1;
            break;
    }

    state.direction = targetDir;
    state.storySpeedMultiplier = targetSpeedMulti;

    // Sync captions
    const activeChunk = vttData.find(c => t >= c.start && t <= c.end);
    const topText = STORY_SCENES[state.soloIndex].title;
    
    if (activeChunk) {
        updateDOMCaption(topText, activeChunk.text);
    } else {
        updateDOMCaption(topText, ' '); 
    }

    // Auto Advance logic based on audio finish + 0.5s pause
    if(audioEl.ended || (audioEl.duration > 0 && t >= audioEl.duration)) {
        silenceTimer += delta;
        if (silenceTimer > 1.0) { // Add 1 second dramatic pause before switching
            if (state.isLooping) {
                let nextIndex = (state.soloIndex + 1) % STORY_SCENES.length;
                state.soloIndex = nextIndex;
                
                // Sync dropdown UI
                const selectEl = document.getElementById('polygonSelect');
                if (selectEl) selectEl.value = state.soloIndex.toString();
                
                loadStorySequence(nextIndex);
            } else {
                // Stop playback
                state.isPlaying = false;
                toggleAudioPlayback(false);
                const playBtn = document.getElementById('playBtn');
                if (playBtn) {
                    playBtn.innerHTML = '<i data-lucide="play"></i> PLAY';
                    playBtn.classList.remove('playing');
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        }
    }
}

export function toggleAudioPlayback(play) {
    if(!audioEl) audioEl = document.getElementById('ttsAudio');
    if (play) {
        audioEl.play().catch(e => console.warn(e));
    } else {
        audioEl.pause();
    }
}

export function setVoiceVolume(val) {
    if(!audioEl) audioEl = document.getElementById('ttsAudio');
    audioEl.volume = val;
}

function updateDOMCaption(topText, bottomText) {
    const topEl = document.getElementById('topTitle');
    const botEl = document.getElementById('bottomDesc');
    
    if (!topEl || !botEl) return;

    if (topEl.textContent !== topText) {
        topEl.textContent = topText;
        topEl.style.opacity = '1';
    }
    
    // Only update bottom innerText if different to prevent flickering
    if (botEl.textContent !== bottomText) {
        botEl.textContent = bottomText;
        // Fade in
        botEl.style.opacity = bottomText.trim() === '' ? '0' : '1';
    }
}
