/**
 * Polygon Sound - Audio Engine
 */

import { state } from './state.js';
import { FREQUENCIES } from './constants.js';

export function initAudio() {
    if (state.audioContext) return;

    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    state.masterGain = state.audioContext.createGain();
    state.masterGain.gain.setValueAtTime(0.5, state.audioContext.currentTime);
    state.masterGain.connect(state.audioContext.destination);

    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 256;
    state.analyser.connect(state.masterGain);
}

/**
 * 맑은 벨 소리를 생성하는 함수 (Additive Synthesis 기반)
 */
export function playNote(noteName) {
    if (!state.audioContext) initAudio();
    
    const ctx = state.audioContext;
    const now = ctx.currentTime;
    const freq = FREQUENCIES[noteName];
    
    if (!freq) return;

    // 여러 개의 오실레이터를 섞어 풍부한 배음 생성
    createHarmonic(freq, 1.0, 0.4, 0.0, 1.2); // Fundemental
    createHarmonic(freq * 2.0, 0.5, 0.2, 0.01, 0.8); // 2nd Harmonic
    createHarmonic(freq * 3.01, 0.3, 0.1, 0.02, 0.4); // 3rd (slightly detuned)
}

function createHarmonic(freq, volumeMult, maxGain, attack, decay) {
    const ctx = state.audioContext;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Envelope (Attack-Decay)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(maxGain * volumeMult, now + attack + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);
    
    osc.connect(gain);
    gain.connect(state.analyser);
    
    osc.start(now);
    osc.stop(now + attack + decay + 0.1);
}
