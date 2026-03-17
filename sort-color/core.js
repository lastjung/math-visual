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
        this.bindAppleHUD();
        this.syncAudioButton();
    },

    bindAppleHUD() {
        const applePlay = document.getElementById('apple-play');
        const appleReset = document.getElementById('apple-full-reset');
        const applePartial = document.getElementById('apple-partial-reset');
        const appleSpeedUp = document.getElementById('apple-speed-up');
        const appleSpeedDown = document.getElementById('apple-speed-down');
        const appleNext = document.getElementById('apple-next-track');
        const appleVol = document.getElementById('apple-vol-slider');
        const appleVolIcon = document.getElementById('apple-vol-icon');
        const btnToggleView = document.getElementById('btn-toggle-view');
        const btnHideHud = document.getElementById('btn-hide-hud');

        if (applePlay) {
            applePlay.onclick = () => {
                if (this.currentCase && typeof this.currentCase.sortMode !== 'undefined') {
                    // Set to a sorting mode if turned off
                    if (this.currentCase.sortMode === 'off') {
                        this.currentCase.sortMode = 'hue';
                    }
                    this.currentCase.restartSort();
                    this.updateAppleHUD();
                }
            };
        }
        if (appleReset) appleReset.onclick = () => this.resetCase();
        
        if (appleVolIcon) appleVolIcon.onclick = () => this.toggleAudio();

        if (applePartial) {
            applePartial.onclick = () => {
                if (this.currentCase && typeof this.currentCase.multiplier !== 'undefined') {
                    this.currentCase.multiplier = 40; 
                    this.updateControls();
                }
            };
        }
        if (appleSpeedUp) {
            appleSpeedUp.onclick = () => {
                if (this.currentCase && typeof this.currentCase.multiplierSpeed !== 'undefined') {
                    this.currentCase.multiplierSpeed += 0.05;
                    this.updateControls();
                }
            };
        }
        if (appleSpeedDown) {
            appleSpeedDown.onclick = () => {
                if (this.currentCase && typeof this.currentCase.multiplierSpeed !== 'undefined') {
                    this.currentCase.multiplierSpeed -= 0.05;
                    this.updateControls();
                }
            };
        }
        if (appleNext) appleNext.onclick = () => this.changeMusicTrack();
        if (appleVol && window.audioManager) {
            appleVol.oninput = (e) => {
                window.audioManager.setTargetVolume(e.target.value);
                this.syncAudioButton();
            };
            appleVol.value = window.audioManager.getTargetVolume();
        }

        if (btnToggleView) {
            btnToggleView.onclick = () => {
                document.body.classList.toggle('full-view-mode');
                if (this.currentCase && typeof this.currentCase.resize === 'function') {
                    setTimeout(() => this.currentCase.resize(), 500);
                }
            };
        }

        if (btnHideHud) {
            btnHideHud.onclick = () => {
                const hud = document.getElementById('apple-hud');
                if (hud) hud.classList.add('hidden');
            };
        }

        // Add Dragging Support
        const hud = document.getElementById('apple-hud');
        if (hud) {
            let isDragging = false;
            let dragOffsetX = 0;
            let dragOffsetY = 0;

            hud.onmousedown = (e) => {
                if (e.target.closest('button, input')) return;
                
                isDragging = true;
                const rect = hud.getBoundingClientRect();
                // Store offset from the center of the HUD
                dragOffsetX = e.clientX - (rect.left + rect.width / 2);
                dragOffsetY = e.clientY - (rect.top + rect.height / 2);
                
                hud.style.transition = 'none';
                hud.style.cursor = 'grabbing';
            };

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                // Move HUD center to mouse position minus initial click offset
                hud.style.left = (e.clientX - dragOffsetX) + 'px';
                hud.style.top = (e.clientY - dragOffsetY) + 'px';
                hud.style.bottom = 'auto'; // Release fixed bottom
                hud.style.transform = 'translate(-50%, -50%)'; // Ensure transform stays for centering
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    hud.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                    hud.style.cursor = 'grab';
                }
            });
        }

        // Global Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const hud = document.getElementById('apple-hud');
                if (hud) hud.classList.remove('hidden');
                document.body.classList.remove('full-view-mode');
                if (this.currentCase && typeof this.currentCase.resize === 'function') {
                    setTimeout(() => this.currentCase.resize(), 500);
                }
            }
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });

        setInterval(() => this.updateAppleHUD(), 500);
    },

    updateAppleHUD() {
        // Time
        const timeEl = document.getElementById('apple-time');
        if (timeEl) {
            const elapsed = this.getRecordingElapsedMs();
            timeEl.textContent = this.formatRecordingTimeMMSS(elapsed);
        }

        // Sorting Icon toggle
        const applePlay = document.getElementById('apple-play');
        const playIconSvg = document.getElementById('play-icon-svg');
        if (applePlay && playIconSvg) {
            const isSorting = this.currentCase
                && this.currentCase.sortMode !== 'off'
                && this.currentCase.sortingStatus === 'running';
            
            if (isSorting) {
                applePlay.classList.add('is-playing');
                // Sparkle or active sort icon
                playIconSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10"></path><path d="M11 9h7"></path><path d="M11 13h4"></path><path d="M3 17l3 3 3-3"></path><path d="M6 18V4"></path></svg>`;
            } else {
                applePlay.classList.remove('is-playing');
                // Normal sort icon
                playIconSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10"></path><path d="M11 9h7"></path><path d="M11 13h4"></path><path d="M3 17l3 3 3-3"></path><path d="M6 18V4"></path></svg>`;
            }
        }
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
            if (control.type === 'divider') {
                const divider = document.createElement('div');
                divider.className = 'control-divider';
                divider.setAttribute('data-id', control.id || control.label);
                if (control.label) {
                    const text = document.createElement('span');
                    text.textContent = control.label;
                    divider.appendChild(text);
                }
                if (control.actionLabel && typeof control.onAction === 'function') {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'control-divider-button';
                    button.textContent = control.actionLabel;
                    button.onclick = () => control.onAction();
                    divider.appendChild(button);
                }
                host.appendChild(divider);
                return;
            }

            const item = document.createElement('div');
            item.className = `control-item control-item-${control.type}`;
            item.setAttribute('data-id', control.id);

            if (control.type === 'slider') {
                const header = document.createElement('div');
                header.className = 'control-item-header';

                const label = document.createElement('label');
                label.textContent = control.label;

                const valueDisplay = document.createElement('div');
                valueDisplay.className = 'control-value';
                valueDisplay.id = `val-${control.id}`;
                valueDisplay.textContent = this.formatControlValue(control, control.value);

                const input = document.createElement('input');
                input.type = 'range';
                input.id = `input-${control.id}`;
                input.min = String(control.min);
                input.max = String(control.max);
                input.step = String(control.step);
                input.value = String(control.value);
                input.oninput = (e) => {
                    const nextValue = Number(e.target.value);
                    valueDisplay.textContent = this.formatControlValue(control, nextValue);
                    control.onChange(nextValue);
                };

                header.appendChild(label);
                header.appendChild(valueDisplay);
                item.appendChild(header);
                item.appendChild(input);
            } else if (control.type === 'select') {
                const label = document.createElement('label');
                label.textContent = control.label;

                const select = document.createElement('select');
                select.id = `input-${control.id}`;
                control.options.forEach((option) => {
                    const el = document.createElement('option');
                    el.value = option.value;
                    el.textContent = option.label;
                    if (option.value === control.value) el.selected = true;
                    select.appendChild(el);
                });
                select.onchange = (e) => control.onChange(e.target.value);

                item.appendChild(label);
                item.appendChild(select);
            } else if (control.type === 'button') {
                if (control.label) {
                    const label = document.createElement('label');
                    label.textContent = control.label;
                    item.appendChild(label);
                } else {
                    item.classList.add('no-label');
                }

                const button = document.createElement('button');
                button.type = 'button';
                button.id = `input-${control.id}`;
                button.className = 'control-button-main';
                button.textContent = control.value || control.label;
                button.onclick = () => control.onClick();
                item.appendChild(button);
            }

            host.appendChild(item);
        });

        const playBtn = document.getElementById('btn-play');
        if (playBtn) playBtn.textContent = this.isRunning ? 'Pause' : 'Play';
    },

    formatControlValue(control, value) {
        if (typeof control.decimals === 'number') {
            return Number(value).toFixed(control.decimals);
        }
        return String(value);
    },

    resetCase() {
        if (!this.currentCase || typeof this.currentCase.reset !== 'function') return;
        this.currentCase.reset();
        if (typeof this.currentCase.setPaused === 'function') {
            this.currentCase.setPaused(false);
        }
        if (!this.currentCase.animationId && typeof this.currentCase.start === 'function') {
            this.currentCase.start();
        }
        this.isRunning = true;
        this.recordingStartMs = performance.now();
        this.updateControls();
    },

    togglePlay() {
        if (!this.currentCase) return;
        if (this.isRunning) {
            if (typeof this.currentCase.setPaused === 'function') {
                this.currentCase.setPaused(true);
            } else if (typeof this.currentCase.stop === 'function') {
                this.currentCase.stop();
            }
            // Preserve track by using pause()
            if (window.audioManager) window.audioManager.pause();
        } else {
            if (typeof this.currentCase.setPaused === 'function') {
                this.currentCase.setPaused(false);
            } else if (typeof this.currentCase.start === 'function') {
                this.currentCase.start();
            }
            // Resume if track exists
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
        
        // Update HUD slider to match
        const appleVol = document.getElementById('apple-vol-slider');
        if (appleVol) appleVol.value = isMuted ? 0 : window.audioManager.getTargetVolume();
        
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
        const appleVolIcon = document.getElementById('apple-vol-icon');
        const appleVolSlider = document.getElementById('apple-vol-slider');
        
        if (!window.audioManager) return;
        const isMuted = window.audioManager.isMuted;

        if (bgmBtn) {
            bgmBtn.textContent = isMuted ? 'Sound Off' : 'Sound On';
        }

        if (appleVolIcon) {
            if (isMuted) {
                appleVolIcon.innerHTML = `
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>`;
                appleVolIcon.style.color = 'var(--apple-accent-red)';
            } else {
                appleVolIcon.innerHTML = `
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
                appleVolIcon.style.color = 'var(--apple-text-muted)';
            }
        }

        if (appleVolSlider) {
            appleVolSlider.value = isMuted ? 0 : window.audioManager.getTargetVolume();
        }
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
