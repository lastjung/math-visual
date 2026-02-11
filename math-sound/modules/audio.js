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
    
    // Ani 카테고리는 5단계(22.5초 = 4.5s * 5), 나머지는 1단계(4.5초)
    const isAni = funcData.category === 'ani';
    const loopDuration = isAni ? 4.5 : 4.5; // 일관된 4.5초 루프
    const drawDuration = 4.0; // 드로잉 실질 시간
    const duration = isAni ? (loopDuration * 5) : 4.5;
    const numSamples = sampleRate * duration;
    
    const buffer = state.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const loopIndex = Math.floor(t / loopDuration);
        const progressInLoop = Math.min(1.0, (t % loopDuration) / drawDuration);
        
        let y = 0;
        try {
            switch (funcData.type) {
                case 'parametric': {
                    const tRange = funcData.tRange;
                    const tParam = tRange.min + (tRange.max - tRange.min) * progressInLoop;
                    y = funcData.x ? funcData.y(tParam, loopIndex) : 0;
                    break;
                }
                case 'polar': {
                    const thetaRange = funcData.thetaRange;
                    const theta = thetaRange.min + (thetaRange.max - thetaRange.min) * progressInLoop;
                    y = funcData.r(theta, loopIndex);
                    break;
                }
                case 'cartesian':
                default: {
                    const range = funcData.range;
                    const x = range.xMin + (range.xMax - range.xMin) * progressInLoop;
                    y = funcData.fn(x, loopIndex);
                    break;
                }
            }
        } catch (e) {
            y = 0;
        }

        if (!isFinite(y) || isNaN(y)) y = 0;
        const rawY = y; // 원본 값 저장
        y = Math.max(-1, Math.min(1, y / 10));

        const freq = funcData.baseFreq + y * funcData.audioScale;
        // 수학적으로 0인 구간은 무음 처리 (0.5는 마스터 최대 볼륨 비율)
        const amplitude = Math.min(0.5, Math.abs(rawY) * 2); 
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * amplitude;
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
        
        state.audioStartTime = state.audioContext.currentTime;
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
