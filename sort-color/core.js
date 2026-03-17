const Core = {
    currentCase: null,
    isRunning: true,
    recordingStartMs: performance.now(),
    BGM_BASE: '../visualization/assets/music/bgm/',
    tracks: [
        'math/Math_01_Minimalist_Sine_Pulse.mp3',
        'math/Math_09_Fibonacci_Golden_Ratio.mp3',
        'math/Math_16_Coordinate_Plane_Ambient.mp3',
        'math/Math_20_Theorem_Q.E.D..mp3',
        'piano-shorts/Piano_Short_12_Minimal_Cycle_Full_HQ.mp3',
        'piano-shorts/Piano_Short_21_Spring_Blossom_Full_HQ.mp3',
        'piano-shorts/Piano_Short_38_Lofi_Chill_Full_HQ.mp3',
        'lofi/Lofi_80_Batch_12.mp3'
    ],

    init() {
        this.bindToolbar();
        this.loadCase(CardioidCircleCase);
        window.addEventListener('resize', () => {
            if (this.currentCase && typeof this.currentCase.resize === 'function') {
                this.currentCase.resize();
            }
        });
    },

    bindToolbar() {
        const playBtn = document.getElementById('btn-play');
        const resetBtn = document.getElementById('btn-reset');
        const bgmBtn = document.getElementById('btn-bgm');
        const nextTrackBtn = document.getElementById('btn-next-track');

        if (playBtn) playBtn.onclick = () => this.togglePlay();
        if (resetBtn) resetBtn.onclick = () => this.resetCase();
        if (bgmBtn) bgmBtn.onclick = () => this.toggleAudio();
        if (nextTrackBtn) nextTrackBtn.onclick = () => this.changeMusicTrack();
        this.syncAudioButton();
    },

    loadCase(caseInstance) {
        if (this.currentCase && typeof this.currentCase.destroy === 'function') {
            this.currentCase.destroy();
        }
        this.currentCase = caseInstance;
        this.recordingStartMs = performance.now();
        if (typeof caseInstance.init === 'function') caseInstance.init();
        if (typeof caseInstance.start === 'function') caseInstance.start();
        this.isRunning = true;
        this.updateControls();
        this.ensureTrack();
    },

    ensureTrack() {
        if (!window.audioManager) return;
        if (!window.audioManager.currentTrack) {
            const picked = this.getFullTrackPath(this.tracks[0]);
            window.audioManager.play(picked, { forceSwitch: true });
        }
        this.syncAudioButton();
    },

    updateControls() {
        const host = document.getElementById('control-list');
        if (!host || !this.currentCase || !Array.isArray(this.currentCase.uiConfig)) return;
        host.innerHTML = '';

        this.currentCase.uiConfig.forEach((control) => {
            const item = document.createElement('div');
            item.className = 'control-item';

            const label = document.createElement('label');
            label.textContent = control.label;
            item.appendChild(label);

            if (control.type === 'slider') {
                const value = document.createElement('div');
                value.className = 'control-value';
                value.textContent = String(control.value);

                const input = document.createElement('input');
                input.type = 'range';
                input.min = String(control.min);
                input.max = String(control.max);
                input.step = String(control.step);
                input.value = String(control.value);
                input.oninput = (e) => {
                    const nextValue = Number(e.target.value);
                    value.textContent = String(nextValue);
                    control.onChange(nextValue);
                };

                item.appendChild(value);
                item.appendChild(input);
            } else if (control.type === 'select') {
                const select = document.createElement('select');
                control.options.forEach((option) => {
                    const el = document.createElement('option');
                    el.value = option.value;
                    el.textContent = option.label;
                    if (option.value === control.value) el.selected = true;
                    select.appendChild(el);
                });
                select.onchange = (e) => control.onChange(e.target.value);
                item.appendChild(select);
            } else if (control.type === 'button') {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = control.value || control.label;
                button.onclick = () => control.onClick();
                item.appendChild(button);
            }

            host.appendChild(item);
        });

        const playBtn = document.getElementById('btn-play');
        if (playBtn) playBtn.textContent = this.isRunning ? 'Pause' : 'Play';
    },

    resetCase() {
        if (!this.currentCase || typeof this.currentCase.reset !== 'function') return;
        this.currentCase.reset();
        if (!this.isRunning && typeof this.currentCase.start === 'function') {
            this.currentCase.start();
            this.isRunning = true;
        }
        this.recordingStartMs = performance.now();
        this.updateControls();
    },

    togglePlay() {
        if (!this.currentCase) return;
        if (this.isRunning) {
            if (typeof this.currentCase.stop === 'function') this.currentCase.stop();
            if (window.audioManager) window.audioManager.pause();
        } else {
            if (typeof this.currentCase.start === 'function') this.currentCase.start();
            if (window.audioManager) window.audioManager.resume();
        }
        this.isRunning = !this.isRunning;
        this.updateControls();
    },

    getFullTrackPath(track) {
        return track.startsWith('assets/') ? track : `${this.BGM_BASE}${track}`;
    },

    toggleAudio() {
        if (!window.audioManager) return;
        const isMuted = window.audioManager.toggleMute();
        if (!isMuted && !window.audioManager.currentTrack) {
            window.audioManager.play(this.getFullTrackPath(this.tracks[0]), { forceSwitch: true });
        }
        this.syncAudioButton();
    },

    changeMusicTrack() {
        if (!window.audioManager) return;
        const current = window.audioManager.currentTrack
            ? window.audioManager.currentTrack.split(this.BGM_BASE)[1]
            : null;
        const currentIndex = current ? this.tracks.indexOf(current) : -1;
        const nextTrack = this.tracks[(currentIndex + 1 + this.tracks.length) % this.tracks.length];
        window.audioManager.play(this.getFullTrackPath(nextTrack), { forceSwitch: true });
        this.syncAudioButton();
    },

    syncAudioButton() {
        const bgmBtn = document.getElementById('btn-bgm');
        if (!bgmBtn || !window.audioManager) return;
        bgmBtn.textContent = window.audioManager.isMuted ? 'Sound Off' : 'Sound On';
    },

    getRecordingElapsedMs() {
        return performance.now() - this.recordingStartMs;
    },

    formatRecordingTimeMMSS(ms) {
        const totalSeconds = Math.max(0, Math.floor(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
};

window.addEventListener('load', () => {
    Core.init();
});
