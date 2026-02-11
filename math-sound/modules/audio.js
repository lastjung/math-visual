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

export function createSoundFromFunction(functionId = state.currentFunction) {
    const funcData = MATH_FUNCTIONS[functionId];
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

        // 전체 음역대를 한 옥타브 낮추기 위해 주파수에 0.5를 곱함 (시스템 전체 저음화)
        const freq = (funcData.baseFreq + y * funcData.audioScale) * 0.5;
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * 0.5;
    }

    return buffer;
}

export function playSound(functionId = state.currentFunction, forceLayer = false) {
    initAudio();
    
    if (forceLayer) {
        // Create an independent layer that persists
        const buffer = createSoundFromFunction(functionId);
        const source = state.audioContext.createBufferSource();
        const layerGain = state.audioContext.createGain();
        
        // MIDI layers are 50% of the master volume to prevent clipping
        layerGain.gain.setValueAtTime(state.volume * 0.5, state.audioContext.currentTime);
        
        source.buffer = buffer;
        source.loop = true;
        source.playbackRate.value = state.speed;
        
        source.connect(layerGain);
        layerGain.connect(state.analyser);
        source.start();
        
        const layerId = `${functionId}_${Date.now()}`;
        state.activeNodes.set(layerId, { source, gain: layerGain });
    } else {
        // This is a PREVIEW sound (only one at a time)
        const oldPreview = state.activeNodes.get('__preview__');
        if (oldPreview) {
            try { oldPreview.source.stop(); } catch (e) {}
            state.activeNodes.delete('__preview__');
        }

        const buffer = createSoundFromFunction(functionId);
        const source = state.audioContext.createBufferSource();
        // Preview is 100% of the volume
        const previewGain = state.audioContext.createGain();
        previewGain.gain.setValueAtTime(state.volume, state.audioContext.currentTime);

        source.buffer = buffer;
        source.loop = true;
        source.playbackRate.value = state.speed;
        
        source.connect(previewGain);
        previewGain.connect(state.analyser);
        source.start();
        
        state.activeNodes.set('__preview__', { source, gain: previewGain });
        state.currentFunction = functionId;
    }
}

export function stopSound(layerId) {
    const node = state.activeNodes.get(layerId);
    if (node) {
        try { node.source.stop(); } catch (e) {}
        state.activeNodes.delete(layerId);
    }
}

export function stopPreview() {
    stopSound('__preview__');
}

export function stopAllSounds() {
    state.activeNodes.forEach((node, id) => {
        try {
            node.source.stop();
        } catch (e) {}
    });
    state.activeNodes.clear();
}
