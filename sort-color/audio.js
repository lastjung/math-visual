/**
 * AudioManager
 * Handles background music playback and fading.
 * Supports individual track loading for each case.
 */
class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.audio.loop = false;
        this.audio.volume = 0; // Start muted for fade-in
        this.targetVolume = 0.15;
        this.fadeInterval = null;
        this.isMuted = true;
        this.currentTrack = null;
        this.audio.addEventListener('ended', () => {
            if (this.isMuted) return;
            if (typeof Core !== 'undefined' && typeof Core.changeMusicTrack === 'function') {
                Core.changeMusicTrack();
            }
        });
    }

    play(trackUrl, options = {}) {
        if (!trackUrl) return;
        const forceSwitch = options.forceSwitch === true;
        // Keep track selected, but do not autoplay while muted.
        if (this.isMuted) {
            if (forceSwitch || this.currentTrack !== trackUrl) {
                this.currentTrack = trackUrl;
                this.audio.src = trackUrl;
                this.audio.load();
            }
            return;
        }

        if (!forceSwitch && this.currentTrack === trackUrl) {
            if (this.audio.paused) this.fadeIn();
            return;
        }

        this.currentTrack = trackUrl;
        
        // Fade out old track
        this.fadeOut(() => {
            this.audio.src = trackUrl;
            this.audio.load(); // Reload
            this.audio.currentTime = 0;
            
            this.audio.play().then(() => {
                this.fadeIn();
            }).catch(e => {
                console.warn("Audio play failed (user interaction needed):", e);
            });
        });
    }

    stop() {
        this.fadeOut(() => {
            this.audio.pause();
            this.currentTrack = null;
        });
    }

    pause() {
        this.fadeOut(() => {
            this.audio.pause();
        });
    }

    resume() {
        if (this.isMuted || !this.currentTrack) return;
        this.audio.play().then(() => {
            this.fadeIn();
        }).catch(() => {});
    }

    syncWithPlaybackState(isRunning) {
        if (isRunning) this.resume();
        else this.pause();
    }

    toggleMute() {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            if (!this.audio.paused) {
                this.audio.pause();
            }
            this.audio.volume = 0;
        } else {
            if (this.currentTrack && this.audio.paused) {
                this.audio.play().then(() => {
                    this.fadeIn();
                }).catch(() => {});
            } else {
                this.audio.volume = this.targetVolume;
            }
        }
        return this.isMuted;
    }

    setTargetVolume(volume) {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
        const parsed = Number(volume);
        if (Number.isNaN(parsed)) return this.targetVolume;
        const clamped = Math.max(0, Math.min(1, parsed));
        this.targetVolume = clamped;
        
        // If user slides volume up from 0 while muted, unmute automatically
        if (clamped > 0 && this.isMuted) {
            this.isMuted = false;
        } else if (clamped === 0 && !this.isMuted) {
            this.isMuted = true;
        }

        if (!this.isMuted) {
            this.audio.volume = clamped;
            if (this.currentTrack && this.audio.paused) {
                this.audio.play().catch(() => {});
            }
        } else {
            this.audio.volume = 0;
            this.audio.pause();
        }
        return this.targetVolume;
    }

    getTargetVolume() {
        return this.targetVolume;
    }

    fadeIn() {
        if (this.isMuted) return;
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        
        this.audio.volume = 0;
        this.audio.play().catch(e => console.log("Autoplay blocked"));
        
        let vol = 0;
        this.fadeInterval = setInterval(() => {
            vol += 0.05; // Faster increment
            if (vol >= this.targetVolume) {
                vol = this.targetVolume;
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
            }
            this.audio.volume = vol;
        }, 50); // Faster tick (was 100)
    }

    fadeOut(callback) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        if (this.audio.paused) {
            if (callback) callback();
            return;
        }

        let vol = this.audio.volume;
        this.fadeInterval = setInterval(() => {
            vol -= 0.1; // Faster decrement (was 0.05)
            if (vol <= 0) {
                vol = 0;
                this.audio.pause();
                clearInterval(this.fadeInterval);
                this.fadeInterval = null;
                if (callback) callback();
            } else {
                this.audio.volume = vol;
            }
        }, 30); // Faster tick (was 50)
    }
}

class GameSfxManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.masterFilter = null;
        this.enabled = true;
        try {
            const saved = window.localStorage.getItem('sort-color:game-sfx-enabled');
            if (saved != null) {
                this.enabled = saved === 'true';
            }
        } catch (_err) {
            // Ignore storage errors.
        }
    }

    ensureContext() {
        if (!this.context) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            this.context = new Ctx();
            this.masterGain = this.context.createGain();
            this.masterFilter = this.context.createBiquadFilter();
            this.masterFilter.type = 'lowpass';
            this.masterFilter.frequency.value = 2600;
            this.masterFilter.Q.value = 0.3;
            this.masterGain.gain.value = 0.16;
            this.masterGain.connect(this.masterFilter);
            this.masterFilter.connect(this.context.destination);
        }
        if (this.context.state === 'suspended') {
            this.context.resume().catch(() => {});
        }
        return this.context;
    }

    setEnabled(enabled) {
        this.enabled = !!enabled;
        this.persist();
    }

    toggle() {
        this.enabled = !this.enabled;
        this.persist();
        return this.enabled;
    }

    persist() {
        try {
            window.localStorage.setItem('sort-color:game-sfx-enabled', String(this.enabled));
        } catch (_err) {
            // Ignore storage errors.
        }
    }

    play(type = 'tap') {
        if (!this.enabled) return;
        const context = this.ensureContext();
        if (!context || !this.masterGain) return;

        const now = context.currentTime;
        const notesByType = {
            tap: [740, 987.77],
            step: [660, 880],
            tick: [784],
            play: [523.25, 659.25, 783.99],
            shuffle: [196, 246.94, 329.63],
            reset: [440, 349.23],
            complete: [659.25, 783.99, 987.77, 1174.66]
        };
        const notes = notesByType[type] || notesByType.tap;

        notes.forEach((freq, index) => {
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.type = type === 'reset' ? 'sine' : (type === 'shuffle' ? 'triangle' : 'triangle');
            const start = now + index * 0.055;
            const end = start + (type === 'complete' ? 0.18 : (type === 'shuffle' ? 0.11 : 0.14));
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.linearRampToValueAtTime(Math.max(180, freq * (type === 'shuffle' ? 0.78 : 0.92)), end);

            const peakBase = type === 'shuffle' ? 0.32 : 0.18;
            const peak = peakBase / Math.max(1, notes.length);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(peak, start + (type === 'shuffle' ? 0.014 : 0.028));
            gain.gain.exponentialRampToValueAtTime(0.0001, end);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(start);
            osc.stop(end + 0.02);
        });
    }

    playPiano(progress = 0) {
        if (!this.enabled) return;
        const context = this.ensureContext();
        if (!context || !this.masterGain) return;

        const normalized = Math.max(0, Math.min(1, Number(progress) || 0));
        const notes = [
            261.63, 293.66, 329.63, 392.0, 440.0, 523.25,
            587.33, 659.25, 783.99, 880.0, 1046.5
        ];
        const noteIndex = Math.min(notes.length - 1, Math.floor(normalized * notes.length));
        const freq = notes[noteIndex];
        const now = context.currentTime;
        const osc = context.createOscillator();
        const gain = context.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.995, now + 0.12);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
    }
}

// Global instance
window.audioManager = new AudioManager();
window.gameSfx = new GameSfxManager();
