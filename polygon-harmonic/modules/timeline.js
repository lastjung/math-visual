/**
 * Polygon Harmonic (V2) - Global Timeline Engine
 * 
 * Synchronizes the visualization precisely with the 9m 36s YouTube video.
 * Handles rotations, speed changes, text annotations, and TTS triggering.
 */

import { state } from './state.js';

export const TOTAL_DURATION_SEC = 9 * 60 + 36; // 09:36 = 576 seconds

// Timeline Events for each polygon section
export const TIMELINES = [
    {
        index: -1,
        name: "Intro",
        startSec: 0.0,
        endSec: 15.0,
        drawStartOffset: 0.0,
        events: [
            { time: 0.0, type: 'state', data: { speed: 1.0, direction: 1 } },
            { time: 1.0, type: 'audio', data: { file: 'public/audio/poly_3.mp3', start: 0, end: 9.3, text: "Let's explore the geometric patterns of chords and scales." } }
        ]
    },
    {
        index: 0,
        name: "Triangle",
        startSec: 15.0, // 0:15
        endSec: 75.0,   // 1:15
        drawStartOffset: 7.0, // 22초 렌더링 시작 (15.0 + 7.0)
        events: [
            // { time (sec), type ('state', 'text', 'anno', 'audio'), data (payload) }
            { time: 15.0, type: 'state', data: { speed: 0, direction: -1 } },
            // Audio: "The simplest regular polygon..." (starts at ~9.3s in poly_3.mp3, ends at 20.2s)
            { time: 17.0, type: 'audio', data: { file: 'public/audio/poly_3.mp3', start: 9.3, end: 20.2, text: "The simplest regular polygon is an equilateral triangle and on the circle of fifths an equilateral triangle forms an augmented Triad that is the root the major third and the sharp fifth or augmented fifth." } },
            { time: 25.0, type: 'anno', data: { show: true, main: "Augmented Triad", notes: [{ note: 'C', label: '1', color: '#ff2a2a' }] } },
            { time: 26.0, type: 'anno', data: { show: true, main: "Augmented Triad", notes: [{ note: 'C', label: '1', color: '#ff2a2a' }, { note: 'E', label: 'maj. 3rd', color: '#ff2a2a' }] } },
            { time: 28.0, type: 'anno', data: { show: true, main: "Augmented Triad", notes: [{ note: 'C', label: '1', color: '#ff2a2a' }, { note: 'E', label: 'maj. 3rd', color: '#ff2a2a' }, { note: 'Ab', label: '# 5th', color: '#9b59b6' }] } },
            { time: 32.0, type: 'anno', data: { show: false } },
            { time: 32.0, type: 'state', data: { speed: 0.4, direction: -1 } },
            // Audio: "So when we rotate..." (starts at ~20.2s, ends at 32.9s)
            { time: 58.0, type: 'audio', data: { file: 'public/audio/poly_3.mp3', start: 20.2, end: 32.9, text: "So when we rotate this triangle we'll just get a series of augmented chords. If we rotate the triangle clockwise instead we get the same chords just played in the opposite order which is true for all of the polygons will be rotating." } },
            { time: 59.0, type: 'state', data: { speed: 0.4, direction: 1 } }
        ]
    },
    {
        index: 1,
        name: "Square",
        startSec: 75.0, // 1:15
        endSec: 125.0,  // 2:05
        drawStartOffset: 2.0,
        events: [
            { time: 75.0, type: 'state', data: { speed: 0, direction: 1 } },
            { time: 77.0, type: 'audio', data: { file: 'public/audio/poly_4.mp3', start: 0, end: 12.0, text: "With a square we get another symmetrical chord. A diminished seventh chord which is just minor thirds stacked on top of each other." } },
            { time: 82.0, type: 'anno', data: { show: true, main: "Diminished Seventh", notes: [{ note: 'C', label: '1', color: '#ff2a2a' }, { note: 'Eb', label: 'min 3rd', color: '#ff2a2a' }, { note: 'Gb', label: 'dim 5th', color: '#ff2a2a' }, { note: 'A', label: 'dim 7th', color: '#3498db' }] } },
            { time: 88.0, type: 'anno', data: { show: false } },
            { time: 89.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 2,
        name: "Pentagon",
        startSec: 125.0, // 2:05
        endSec: 175.0,   // 2:55
        drawStartOffset: 2.0,
        events: [
            { time: 125.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 127.0, type: 'audio', data: { file: 'public/audio/poly_5.mp3', start: 0, end: 15.0, text: "The Pentagon is the first shape where the vertices don't all land on notes at the same time." } },
            { time: 140.0, type: 'state', data: { speed: 0.4, direction: -1 } },
            { time: 155.0, type: 'audio', data: { file: 'public/audio/poly_5.mp3', start: 15.0, end: 28.0, text: "It's playing a chromatic scale all 12 notes in ascending order." } }
        ]
    },
    {
        index: 3,
        name: "Hexagon",
        startSec: 175.0, // 2:55
        endSec: 225.0,   // 3:45
        drawStartOffset: 2.0,
        events: [
            { time: 175.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 177.0, type: 'audio', data: { file: 'public/audio/poly_6.mp3', start: 0, end: 10.0, text: "A hexagon plays all the notes of the two whole tone scales as alternating chords." } },
            { time: 185.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 4,
        name: "Heptagon",
        startSec: 225.0, // 3:45
        endSec: 275.0,   // 4:35
        drawStartOffset: 2.0,
        events: [
            { time: 225.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 227.0, type: 'audio', data: { file: 'public/audio/poly_7.mp3', start: 0, end: 12.0, text: "A heptagon does the same thing as the Pentagon but in the opposite order and a bit faster." } },
            { time: 235.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 5,
        name: "Octagon",
        startSec: 275.0, // 4:35
        endSec: 325.0,   // 5:25
        drawStartOffset: 2.0,
        events: [
            { time: 275.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 277.0, type: 'audio', data: { file: 'public/audio/poly_8.mp3', start: 0, end: 12.0, text: "An octagon plays the same diminished chords as the square but twice as fast and in the opposite direction." } },
            { time: 285.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 6,
        name: "Nonagon",
        startSec: 325.0, // 5:25
        endSec: 375.0,   // 6:15
        drawStartOffset: 2.0,
        events: [
            { time: 325.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 327.0, type: 'audio', data: { file: 'public/audio/poly_9.mp3', start: 0, end: 12.0, text: "A nonagon or nine-sided polygon plays augmented chords but three times as fast as the triangle." } },
            { time: 335.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 7,
        name: "Decagon",
        startSec: 375.0, // 6:15
        endSec: 425.0,   // 7:05
        drawStartOffset: 2.0,
        events: [
            { time: 375.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 377.0, type: 'audio', data: { file: 'public/audio/poly_10.mp3', start: 0, end: 15.0, text: "The decagon plays the chromatic scale... except that it plays two chromatic scales simultaneously a tritone apart." } },
            { time: 390.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 8,
        name: "Hendecagon",
        startSec: 425.0, // 7:05
        endSec: 485.0,   // 8:05
        drawStartOffset: 2.0,
        events: [
            { time: 425.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 427.0, type: 'audio', data: { file: 'public/audio/poly_11.mp3', start: 0, end: 14.0, text: "The hendecagon or 11-sided polygon plays either the circle of fourths or fifths." } },
            { time: 440.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    },
    {
        index: 9,
        name: "Dodecagon",
        startSec: 485.0, // 8:05
        endSec: 576.0,   // 9:36
        drawStartOffset: 2.0,
        events: [
            { time: 485.0, type: 'state', data: { speed: 0, direction: -1 } },
            { time: 487.0, type: 'audio', data: { file: 'public/audio/poly_12.mp3', start: 0, end: 18.0, text: "And finally arguably the worst sounding polygon, a dodecagon. This will just play all 12 notes simultaneously." } },
            { time: 500.0, type: 'state', data: { speed: 0.4, direction: -1 } }
        ]
    }
];

let activeAudioEvent = null;
let timelineAudioEl = null;

export function initTimeline() {
    state.globalTime = 0.0; // Start at Intro
    state.polygonStartTime = 0.0;
    state.soloIndex = -1; // Intro
    
    if (!timelineAudioEl) {
        timelineAudioEl = document.getElementById('ttsAudio');
    }
    updateTimerUI();
}

export function updateTimeline(delta) {
    let ytAudio = document.getElementById('youtubeAudio');

    if (!state.isPlaying) {
        if (timelineAudioEl && !timelineAudioEl.paused) timelineAudioEl.pause();
        if (ytAudio && !ytAudio.paused) ytAudio.pause();
        return;
    }

    const prevTime = state.globalTime;

    if (state.isVerificationMode) {
        if (ytAudio) {
            if (ytAudio.paused) ytAudio.play().catch(console.error);
            state.globalTime = ytAudio.currentTime;
        }
    } else {
        if (ytAudio && !ytAudio.paused) ytAudio.pause();
        state.globalTime += delta;
    }
    
    if (state.globalTime > TOTAL_DURATION_SEC) {
        state.globalTime = TOTAL_DURATION_SEC;
        state.isPlaying = false;
        if (timelineAudioEl) timelineAudioEl.pause();
        if (ytAudio && !ytAudio.paused) ytAudio.pause();
    }

    // Find current polygon section
    const currentSection = TIMELINES.find(t => 
        state.globalTime >= t.startSec && state.globalTime < t.endSec
    );

    if (currentSection) {
        // Sync soloIndex if necessary (in Auto mode or regular playback crossing boundary)
        if (state.soloIndex !== currentSection.index) {
            state.soloIndex = currentSection.index;
            state.polygonStartTime = state.globalTime; // For drawing animation
            const selectEl = document.getElementById('polygonSelect');
            if (selectEl) selectEl.value = state.soloIndex;
            processAnnotations({ show: false });
            
            const topEl = document.getElementById('topTitle');
            if (topEl) {
                topEl.style.display = state.showSubtitles ? '' : 'none';
                topEl.textContent = currentSection.name;
            }
        }

        processSectionEvents(currentSection, prevTime);
    }
    
    handleAudioPlayback();
    updateTimerUI();
}

function processSectionEvents(section, prevTime) {
    // 1. Process discrete triggers that crossed threshold EXACTLY IN THIS FRAME
    // This is crucial for audio/video triggers so we don't repeat them
    section.events.forEach(e => {
        if (prevTime <= e.time && state.globalTime > e.time) {
            if (e.type === 'audio') {
                triggerAudioEvent(e.data);
            }
            if (e.type === 'anno') {
                processAnnotations(e.data);
            }
        }
    });

    // 2. Continuous/Stateful updates (speed, direction)
    const pastStateEvents = section.events.filter(e => e.time <= state.globalTime && e.type === 'state');
    if (pastStateEvents.length > 0) {
        const latestState = pastStateEvents[pastStateEvents.length - 1];
        if (latestState.data.speed !== undefined) state.storySpeedMultiplier = latestState.data.speed;
        if (latestState.data.direction !== undefined) state.direction = latestState.data.direction;
    }
}

function triggerAudioEvent(data) {
    if (state.isVerificationMode) return; // Mute TTS during verification
    
    activeAudioEvent = data;
    if (!timelineAudioEl) timelineAudioEl = document.getElementById('ttsAudio');
    
    // Only load if it's a different file
    if (!timelineAudioEl.src.endsWith(data.file)) {
        timelineAudioEl.src = data.file;
    }
    
    timelineAudioEl.currentTime = data.start;
    
    // In Chromium occasionally muted autoplay policy is tricky, handle catch.
    const playPromise = timelineAudioEl.play();
    if (playPromise !== undefined) {
        playPromise.catch(console.error);
    }
    
    // Update Subtitle
    const botEl = document.getElementById('bottomDesc');
    const topEl = document.getElementById('topTitle');
    if (botEl) {
        botEl.textContent = data.text;
        botEl.style.display = state.showSubtitles ? '' : 'none';
    }
    
    if (topEl) {
        topEl.style.display = state.showSubtitles ? '' : 'none';
        if (state.soloIndex === -1) {
            topEl.textContent = "Intro";
        } else {
            topEl.textContent = TIMELINES.find(t => t.index === state.soloIndex)?.name || "Polygon";
        }
    }
}

function handleAudioPlayback() {
    if (!activeAudioEvent || !timelineAudioEl) return;
    
    // Check if audio reached its 'end' slice point
    if (timelineAudioEl.currentTime >= activeAudioEvent.end) {
        timelineAudioEl.pause();
        activeAudioEvent = null; // Clear active event
        const botEl = document.getElementById('bottomDesc');
        if (botEl) botEl.textContent = ""; // Clear subtitle
    }
}

// Global UI reference variables
let annoContainer = null;

function processAnnotations(data) {
    if (!annoContainer) {
        annoContainer = document.getElementById('annotationsLayer');
        if (!annoContainer) return;
    }

    // Reset highlights
    state.annotationHighlights = {};

    if (!data.show || !state.showSubtitles) {
        annoContainer.innerHTML = '';
        annoContainer.style.display = 'none';
        return;
    }

    annoContainer.style.display = 'block';
    let html = '';

    if (data.main) {
        html += `<div class="anno-main">${data.main}</div>`;
    }

    if (data.notes) {
        data.notes.forEach(note => {
            // Set for canvas + piano highlight
            if (note.color) {
                state.annotationHighlights[note.note] = { label: note.label, color: note.color };
            }

            // Also simple list UI in top right (optional, we might remove this if canvas is enough)
            html += `<div class="anno-note note-${note.note}">
                <span class="anno-label" style="color:${note.color || '#bbb'}">${note.label}</span>
                <span class="anno-pitch" style="color:${note.color || '#fff'}">${note.note}</span>
            </div>`;
        });
    }

    if (annoContainer.innerHTML !== html) {
        annoContainer.innerHTML = html;
    }
}

export function updateTimerUI() {
    const timerEl = document.getElementById('globalTimer');
    if (timerEl) {
        timerEl.textContent = formatTime(state.globalTime) + " / 09:36";
    }
}

export function jumpToPolygon(index) {
    const section = TIMELINES.find(t => t.index === index);
    if (section) {
        state.globalTime = section.startSec;
        state.polygonStartTime = state.globalTime; // For drawing animation
        if (state.isVerificationMode) {
            let ytAudio = document.getElementById('youtubeAudio');
            if (ytAudio) ytAudio.currentTime = section.startSec;
        } else {
            if (timelineAudioEl) timelineAudioEl.pause();
        }
        processAnnotations({ show: false });
        
        const topEl = document.getElementById('topTitle');
        if (topEl) {
            topEl.style.display = state.showSubtitles ? '' : 'none';
            topEl.textContent = section.name;
        }
        
        state.currentScriptText = null; // force update
        updateTimerUI();
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
