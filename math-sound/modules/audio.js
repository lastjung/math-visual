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
    
    // Ani 카테고리는 인트로(1.5초) + 나머지(4.5초) 가변 루프 적용
    const isAni = funcData.category === 'ani';
    const introDuration = 1.5;
    const regularDuration = 4.5;
    const introDraw = 1.0;
    const regularDraw = 4.0;
    
    let duration = 4.5;
    if (isAni && funcData.phases) {
        duration = introDuration + (regularDuration * (funcData.phases.length - 1));
    }
    const numSamples = sampleRate * duration;
    
    const buffer = state.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        
        let loopIndex, progressInLoop;
        if (isAni && t < introDuration) {
            loopIndex = 0;
            progressInLoop = Math.min(1.0, t / introDraw);
        } else if (isAni) {
            const adjustedT = t - introDuration;
            loopIndex = 1 + Math.floor(adjustedT / regularDuration);
            progressInLoop = Math.min(1.0, (adjustedT % regularDuration) / regularDraw);
        } else {
            loopIndex = Math.floor(t / 4);
            progressInLoop = (t % 4) / 4;
        }
        
        let y = 0;
        try {
            switch (funcData.type) {
                case 'parametric': {
                    const tRange = funcData.tRange;
                    const tParam = tRange.min + (tRange.max - tRange.min) * progressInLoop;
                    
                    // 특정 시리즈 박동 연출 (Passion 단계)
                    if (functionId === 'heartbeatChronicles' && loopIndex === 4) {
                        const pulseScale = 1.0 + 0.2 * Math.sin(15 * t);
                        y = funcData.y(tParam, loopIndex) * pulseScale;
                    } else {
                        y = funcData.x ? funcData.y(tParam, loopIndex) : 0;
                    }
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
