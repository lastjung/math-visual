/**
 * Polygon Harmonic - Audio Engine (Clean & Powerful Piano Tone)
 */

import { FREQUENCIES } from './constants.js';

let audioCtx = null;
let masterGain = null;
let reverbNode = null;
let isAudioInitialized = false;

export async function initAudio() {
    if (isAudioInitialized) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Chain
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.4; // Lowered default volume to let TTS voice stand out

    // Simple Limiter to prevent harsh clipping, but keeping dynamic range open
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.knee.value = 40;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.1;

    // Small Cathedral Reverb (Clean, not muddy)
    reverbNode = await createReverb(1.5, 1.5); // Shorter duration, faster decay

    masterGain.connect(limiter);
    limiter.connect(reverbNode);
    reverbNode.connect(audioCtx.destination);
    
    isAudioInitialized = true;
}

export function setMasterVolume(val) {
    if (masterGain) {
        masterGain.gain.value = val;
    }
}

// Clean Convolution Reverb
async function createReverb(duration, decay) {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    const convolver = audioCtx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
}

/**
 * Play a crystal-clear, 90% prominent piano sound
 */
export function playNote(noteName, velocity = 1.0) {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const freq = FREQUENCIES[noteName];
    if (!freq) return;

    const now = audioCtx.currentTime;
    // Keep volume high and robust
    const v = Math.max(0.4, Math.min(velocity, 1.0));
    
    // --- 1. Core Piano Body (Sine + Triangle) ---
    // Pure sine for deep resonant base
    const bodyOsc = audioCtx.createOscillator();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.value = freq;
    
    // Triangle for natural piano overtones
    const overtoneOsc = audioCtx.createOscillator();
    overtoneOsc.type = 'triangle';
    overtoneOsc.frequency.value = freq;

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1.0 * v, now + 0.015);  // Punchy Fast Attack
    env.gain.exponentialRampToValueAtTime(0.2 * v, now + 0.5); // Natural Decay
    env.gain.linearRampToValueAtTime(0, now + 1.5);            // Smooth Release

    // --- 2. Transient Hammer Strike ---
    // Simulates the physical hammer hitting the strings without becoming 'noise'
    const hammerOsc = audioCtx.createOscillator();
    hammerOsc.type = 'square';
    hammerOsc.frequency.value = freq * 2.01; // Inharmonic snap
    
    const hammerEnv = audioCtx.createGain();
    hammerEnv.gain.setValueAtTime(0, now);
    hammerEnv.gain.linearRampToValueAtTime(0.15 * v, now + 0.005); // Millisecond snap
    hammerEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    // --- 3. Dynamic Lowpass Filter ---
    // Makes the piano sound 'muffled' over time naturally
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000 + (v * 1000), now); // Bright attack
    filter.frequency.exponentialRampToValueAtTime(600, now + 1.0); // Warm body

    // Route audio graph
    bodyOsc.connect(env);
    overtoneOsc.connect(env);
    env.connect(filter);
    
    hammerOsc.connect(hammerEnv);
    hammerEnv.connect(filter);

    filter.connect(masterGain);

    // Sequence
    bodyOsc.start(now);
    overtoneOsc.start(now);
    hammerOsc.start(now);

    bodyOsc.stop(now + 1.6);
    overtoneOsc.stop(now + 1.6);
    hammerOsc.stop(now + 1.6);
}
