/**
 * Math Sound Visualizer - Audio Engine
 * Web Audio API를 사용한 함수 음향성 변환
 */

import { state } from './state.js';
import { MATH_FUNCTIONS } from './constants.js';

export function initAudio() {
    if (state.audioContext) return;

    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    state.gainNode = state.audioContext.createGain();
    state.gainNode.gain.setValueAtTime(state.volume, state.audioContext.currentTime);
    state.gainNode.connect(state.audioContext.destination);

    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 2048;
    state.analyser.connect(state.gainNode);
}

export function createSoundFromFunction() {
    const funcData = MATH_FUNCTIONS[state.currentFunction];
    const sampleRate = state.audioContext.sampleRate;
    const duration = 4;
    const numSamples = sampleRate * duration;
    
    const buffer = state.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        let y = 0;

        try {
            switch (funcData.type) {
                case 'parametric': {
                    const tParam = funcData.tRange.min + (funcData.tRange.max - funcData.tRange.min) * progress;
                    y = funcData.y(tParam);
                    break;
                }
                case 'polar': {
                    const theta = funcData.thetaRange.min + (funcData.thetaRange.max - funcData.thetaRange.min) * progress;
                    y = funcData.r(theta);
                    break;
                }
                case 'cartesian':
                default: {
                    const x = funcData.range.xMin + (funcData.range.xMax - funcData.range.xMin) * progress;
                    y = funcData.fn(x);
                    break;
                }
            }
        } catch (e) {
            y = 0;
        }

        if (!isFinite(y) || isNaN(y)) y = 0;
        y = Math.max(-1, Math.min(1, y / 10));

        const freq = funcData.baseFreq + y * funcData.audioScale;
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * 0.5;
    }

    return buffer;
}

export function playSound() {
    initAudio();
    
    if (state.bufferSource) {
        try {
            state.bufferSource.stop();
        } catch (e) {}
    }

    const buffer = createSoundFromFunction();
    state.bufferSource = state.audioContext.createBufferSource();
    state.bufferSource.buffer = buffer;
    state.bufferSource.connect(state.analyser);
    state.bufferSource.loop = true;
    state.bufferSource.playbackRate.value = state.speed;
    state.bufferSource.start();
}

export function stopSound() {
    if (state.bufferSource) {
        try {
            state.bufferSource.stop();
        } catch (e) {}
        state.bufferSource = null;
    }
}
