import { sampleExpressionAtProgress } from './sampleExpression.js';

export class AudioPreviewEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.entries = [];
        this.sceneKey = null;
        this.volume = 0.68;
        this.retiredEntries = [];
    }

    async ensureContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.volume * 0.32;
            this.masterGain.connect(this.context.destination);
        }

        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    async startScene(scene, controllerSnapshot) {
        await this.ensureContext();
        const nextKey = scene.expressions.map((expression) => expression.id).join('|');

        if (this.sceneKey !== nextKey) {
            this.fadeOutScene();
            this.sceneKey = nextKey;
            this.entries = scene.expressions.map((expression, index) => createEntry(this.context, this.masterGain, expression, index));
        }

        this.updateScene(scene, controllerSnapshot, 0);
    }

    updateScene(scene, controllerSnapshot, progress) {
        if (!this.context || !this.entries.length) return;

        const now = this.context.currentTime;
        this.masterGain.gain.setTargetAtTime(this.volume * 0.32, now, 0.05);
        scene.expressions.forEach((expression, index) => {
            const entry = this.entries[index];
            if (!entry) return;
            const isFocused = scene.focusedExpressionId === expression.id;

            const sample = sampleExpressionAtProgress(expression, controllerSnapshot, progress);
            if (!sample || !Number.isFinite(sample.value)) {
                entry.gain.gain.setTargetAtTime(0.0001, now, 0.04);
                return;
            }

            const normalized = normalizeValue(sample.value, expression.bounds);
            const frequency = 160 + normalized * 520 + index * 35;
            const baseGain = 0.02 + Math.min(0.05, Math.abs(normalized) * 0.045);
            const gain = isFocused ? baseGain * 1.9 : baseGain * 0.55;
            const filterFrequency = isFocused
                ? Math.min(3200, 850 + normalized * 1400)
                : Math.min(1800, 480 + normalized * 800);

            entry.osc.frequency.setTargetAtTime(frequency, now, 0.03);
            entry.filter.frequency.setTargetAtTime(filterFrequency, now, 0.05);
            entry.gain.gain.setTargetAtTime(gain, now, 0.05);
        });
    }

    stopScene() {
        this.entries.forEach((entry) => {
            try {
                entry.gain.gain.cancelScheduledValues(this.context?.currentTime ?? 0);
                entry.gain.gain.setTargetAtTime(0.0001, this.context?.currentTime ?? 0, 0.03);
            } catch (e) {}
            safelyDisposeEntry(entry, 180);
        });
        this.entries = [];
        this.sceneKey = null;
    }

    fadeOutScene() {
        if (!this.context) {
            this.entries = [];
            this.sceneKey = null;
            return;
        }

        const now = this.context.currentTime;
        this.entries.forEach((entry) => {
            try {
                entry.gain.gain.cancelScheduledValues(now);
                entry.gain.gain.setTargetAtTime(0.0001, now, 0.08);
            } catch (e) {}
            safelyDisposeEntry(entry, 420);
        });
        this.entries = [];
        this.sceneKey = null;
    }

    suspend() {
        if (!this.context) return;
        this.entries.forEach((entry) => {
            entry.gain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.04);
        });
    }

    setVolume(nextVolume) {
        this.volume = nextVolume;
        if (!this.context || !this.masterGain) return;
        this.masterGain.gain.setTargetAtTime(this.volume * 0.32, this.context.currentTime, 0.05);
    }
}

function safelyDisposeEntry(entry, delayMs) {
    window.setTimeout(() => {
        try {
            entry.osc.stop();
        } catch (e) {}
        try {
            entry.osc.disconnect();
            entry.filter.disconnect();
            entry.gain.disconnect();
        } catch (e) {}
    }, delayMs);
}

function createEntry(context, masterGain, expression, index) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    osc.type = pickOscillatorType(expression.type, index);
    osc.frequency.value = 220 + index * 45;

    filter.type = 'lowpass';
    filter.frequency.value = 1600;
    filter.Q.value = 0.3;

    gain.gain.value = 0.0001;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();

    return { osc, gain, filter };
}

function normalizeValue(value, bounds) {
    if (!bounds) return clamp(value / 8, -1, 1);
    const maxAbs = Math.max(Math.abs(bounds.yMin ?? -1), Math.abs(bounds.yMax ?? 1), 1);
    return clamp(value / maxAbs, -1, 1);
}

function pickOscillatorType(type, index) {
    if (type === 'implicit') return 'triangle';
    if (type === 'polar') return index % 2 === 0 ? 'sine' : 'triangle';
    if (type === 'parametric') return 'sawtooth';
    return 'sine';
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
