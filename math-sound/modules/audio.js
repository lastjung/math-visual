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

    // Tone shaping: boost lows + soften harsh highs + control peaks
    state.lowShelfNode = state.audioContext.createBiquadFilter();
    state.lowShelfNode.type = 'lowshelf';
    state.lowShelfNode.frequency.setValueAtTime(200, state.audioContext.currentTime);
    state.lowShelfNode.gain.setValueAtTime(4.5, state.audioContext.currentTime);

    state.highShelfNode = state.audioContext.createBiquadFilter();
    state.highShelfNode.type = 'highshelf';
    state.highShelfNode.frequency.setValueAtTime(3500, state.audioContext.currentTime);
    state.highShelfNode.gain.setValueAtTime(-4.5, state.audioContext.currentTime);

    state.filterNode = state.audioContext.createBiquadFilter();
    state.filterNode.type = 'lowpass';
    state.filterNode.frequency.setValueAtTime(3500, state.audioContext.currentTime);
    state.filterNode.Q.setValueAtTime(0.85, state.audioContext.currentTime);

    state.compressorNode = state.audioContext.createDynamicsCompressor();
    state.compressorNode.threshold.setValueAtTime(-26, state.audioContext.currentTime);
    state.compressorNode.knee.setValueAtTime(20, state.audioContext.currentTime);
    state.compressorNode.ratio.setValueAtTime(3.5, state.audioContext.currentTime);
    state.compressorNode.attack.setValueAtTime(0.005, state.audioContext.currentTime);
    state.compressorNode.release.setValueAtTime(0.18, state.audioContext.currentTime);

    state.clipperNode = state.audioContext.createWaveShaper();
    state.clipperNode.curve = createSoftClipCurve(600);
    state.clipperNode.oversample = '4x';

    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 2048;

    // Connect processing chain once
    state.lowShelfNode.connect(state.highShelfNode);
    state.highShelfNode.connect(state.filterNode);
    state.filterNode.connect(state.compressorNode);
    state.compressorNode.connect(state.clipperNode);
    state.clipperNode.connect(state.analyser);
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
        const freqGain = frequencyGain(freq);
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * amplitude * freqGain;
    }

    // Fade in/out to reduce click at loop boundaries
    const fadeTime = 0.008; // 8ms
    const fadeSamples = Math.max(1, Math.floor(sampleRate * fadeTime));
    for (let i = 0; i < fadeSamples; i++) {
        const fadeIn = i / fadeSamples;
        const fadeOut = (fadeSamples - i) / fadeSamples;
        channelData[i] *= fadeIn;
        channelData[numSamples - 1 - i] *= fadeOut;
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
        layerGain.connect(state.lowShelfNode);
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
        previewGain.connect(state.lowShelfNode);
        
        state.audioStartTime = state.audioContext.currentTime;
        source.start();
        
        state.activeNodes.set('__preview__', { source, gain: previewGain });
        state.currentFunction = functionId;
    }
}

function createSoftClipCurve(samples = 400) {
    const curve = new Float32Array(samples);
    const k = 2.0;
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / (samples - 1) - 1;
        curve[i] = Math.tanh(k * x);
    }
    return curve;
}

function frequencyGain(freq) {
    const safeFreq = Math.max(0, freq);
    const atten = 1 / (1 + Math.pow(safeFreq / 700, 1.3));
    const gain = 0.9 * atten + 0.15;
    return Math.min(1, Math.max(0.25, gain));
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
