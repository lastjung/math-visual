const Core = {
    currentCase: null,
    isRunning: true,
    recordingStartMs: performance.now(),
    BGM_BASE: '../visualization/assets/music/bgm/',
    tracks: [
        'math/Math_01_Minimalist_Sine_Pulse.mp3', 'math/Math_02_Fractal_Recursive_Ambient.mp3',
        'math/Math_03_Euclidean_Polyrhythm.mp3', 'math/Math_04_Cybernetic_Grid_Logic.mp3',
        'math/Math_05_Infinite_Series_Flow.mp3', 'math/Math_06_Binary_Symphony.mp3',
        'math/Math_07_Quantum_Resonance.mp3', 'math/Math_08_Geometric_Vector_Motion.mp3',
        'math/Math_09_Fibonacci_Golden_Ratio.mp3', 'math/Math_10_Bitwise_Glitch_Architecture.mp3',
        'math/Math_11_Calculus_Flow.mp3', 'math/Math_12_Neural_Network_Synapse.mp3',
        'math/Math_13_Retro_8-bit_Math.mp3', 'math/Math_14_Primality_Test_Beat.mp3',
        'math/Math_15_Deep_Space_Topology.mp3', 'math/Math_16_Coordinate_Plane_Ambient.mp3',
        'math/Math_17_Mathematical_Induction.mp3', 'math/Math_18_Lo-fi_Coding_Marathon.mp3',
        'math/Math_19_Abstract_Set_Theory.mp3', 'math/Math_20_Theorem_Q.E.D..mp3',
        'piano-shorts/Piano_Short_01_Nocturne_Full_HQ.mp3', 'piano-shorts/Piano_Short_02_Moonlight_Full_HQ.mp3',
        'piano-shorts/Piano_Short_03_Claire_Full_HQ.mp3', 'piano-shorts/Piano_Short_04_Liebestraum_Full_HQ.mp3',
        'piano-shorts/Piano_Short_05_Gymnopedie_Full_HQ.mp3', 'piano-shorts/Piano_Short_06_Classical_Sonata_Full_HQ.mp3',
        'piano-shorts/Piano_Short_07_Rach_Grand_Full_HQ.mp3', 'piano-shorts/Piano_Short_08_River_Flows_Full_HQ.mp3',
        'piano-shorts/Piano_Short_09_Hisaishi_Fantasy_Full_HQ.mp3', 'piano-shorts/Piano_Short_10_Jazz_Mood_Full_HQ.mp3',
        'piano-shorts/Piano_Short_11_Ragtime_Fun_Full_HQ.mp3', 'piano-shorts/Piano_Short_12_Minimal_Cycle_Full_HQ.mp3',
        'piano-shorts/Piano_Short_13_Cinematic_Tear_Full_HQ.mp3', 'piano-shorts/Piano_Short_14_Pop_Vibe_Full_HQ.mp3',
        'piano-shorts/Piano_Short_15_Mystery_Night_Full_HQ.mp3', 'piano-shorts/Piano_Short_16_Morning_Dew_Full_HQ.mp3',
        'piano-shorts/Piano_Short_17_Rainy_Window_Full_HQ.mp3', 'piano-shorts/Piano_Short_18_Soulful_Touch_Full_HQ.mp3',
        'piano-shorts/Piano_Short_19_Wedding_Grace_Full_HQ.mp3', 'piano-shorts/Piano_Short_20_Grand_Power_Full_HQ.mp3',
        'piano-shorts/Piano_Short_21_Spring_Blossom_Full_HQ.mp3', 'piano-shorts/Piano_Short_22_Bossa_Cafe_Full_HQ.mp3',
        'piano-shorts/Piano_Short_23_Tango_Full_HQ.mp3', 'piano-shorts/Piano_Short_24_Black_Keys_Full_HQ.mp3',
        'piano-shorts/Piano_Short_25_Winter_Fire_Full_HQ.mp3', 'piano-shorts/Piano_Short_26_Space_Walk_Full_HQ.mp3',
        'piano-shorts/Piano_Short_27_Music_Box_Full_HQ.mp3', 'piano-shorts/Piano_Short_28_French_Waltz_Full_HQ.mp3',
        'piano-shorts/Piano_Short_29_Dark_Gothic_Full_HQ.mp3', 'piano-shorts/Piano_Short_30_Vlog_Loop_Full_HQ.mp3',
        'piano-shorts/Piano_Short_31_Toy_March_Full_HQ.mp3', 'piano-shorts/Piano_Short_32_Sad_Elegy_Full_HQ.mp3',
        'piano-shorts/Piano_Short_33_Summer_Sea_Full_HQ.mp3', 'piano-shorts/Piano_Short_34_Swing_Jazz_Full_HQ.mp3',
        'piano-shorts/Piano_Short_35_Wedding_Full_HQ.mp3', 'piano-shorts/Piano_Short_36_Epic_Power_Full_HQ.mp3',
        'piano-shorts/Piano_Short_37_Nostalgia_Full_HQ.mp3', 'piano-shorts/Piano_Short_38_Lofi_Chill_Full_HQ.mp3',
        'piano-shorts/Piano_Short_39_Impromptu_Full_HQ.mp3', 'piano-shorts/Piano_Short_40_Lullaby_Full_HQ.mp3',
        'lofi/EXO_Crown_Lofi_Remix_v2_Safe.mp3', 'lofi/LifeGoesOn_Lofi_Safe_V01.mp3',
        'lofi/Lofi_80_Batch_01.mp3', 'lofi/Lofi_80_Batch_02.mp3',
        'lofi/Lofi_80_Batch_03.mp3', 'lofi/Lofi_80_Batch_04.mp3',
        'lofi/Lofi_80_Batch_05.mp3', 'lofi/Lofi_80_Batch_06.mp3',
        'lofi/Lofi_80_Batch_07.mp3', 'lofi/Lofi_80_Batch_08.mp3',
        'lofi/Lofi_80_Batch_09.mp3', 'lofi/Lofi_80_Batch_10.mp3',
        'lofi/Lofi_80_Batch_11.mp3', 'lofi/Lofi_80_Batch_12.mp3',
        'lofi/Lofi_80_Batch_13.mp3', 'lofi/Lofi_80_Batch_14.mp3',
        'lofi/Lofi_80_Batch_15.mp3', 'lofi/Lofi_80_Batch_16.mp3',
        'lofi/Lofi_80_Batch_17.mp3', 'lofi/Lofi_80_Batch_18.mp3',
        'lofi/Lofi_80_Batch_19.mp3', 'lofi/Lofi_80_Batch_20.mp3',
        'lofi/Lofi_80_Batch_21.mp3', 'lofi/Lofi_80_Batch_22.mp3',
        'lofi/Lofi_80_Batch_23.mp3', 'lofi/Lofi_80_Batch_24.mp3',
        'lofi/Lofi_80_Batch_25.mp3', 'lofi/Lofi_80_Batch_26.mp3',
        'lofi/Lofi_80_Batch_27.mp3', 'lofi/Lofi_80_Batch_28.mp3',
        'lofi/Lofi_80_Batch_29.mp3', 'lofi/Lofi_80_Batch_30.mp3',
        'lofi/Lofi_80_Relaxing_V01_Full.mp3'
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
        this.bindSortBar();
        this.syncAudioButton();
    },

    bindSortBar() {
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
                    this.currentCase.toggleSortPlayback();
                    this.updateSortBar();
                }
            };
        }
        if (appleReset) {
            appleReset.onclick = () => {
                this.resetCase();
                this.updateSortBar();
            };
        }
        
        if (appleVolIcon) appleVolIcon.onclick = () => this.toggleAudio();

        if (applePartial) {
            applePartial.onclick = () => {
                if (this.currentCase && typeof this.currentCase.resetSortProgress === 'function') {
                    this.currentCase.resetSortProgress();
                    this.currentCase.draw();
                    this.updateSortBar();
                }
            };
        }
        if (appleSpeedUp) {
            appleSpeedUp.onclick = () => {
                if (this.currentCase && typeof this.currentCase.stepSort === 'function') {
                    this.currentCase.stepSort(1);
                    this.currentCase.draw();
                    this.updateSortBar();
                }
            };
        }
        if (appleSpeedDown) {
            appleSpeedDown.onclick = () => {
                if (this.currentCase && typeof this.currentCase.stepSort === 'function') {
                    this.currentCase.stepSort(-1);
                    this.currentCase.draw();
                    this.updateSortBar();
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
                const bar = document.getElementById('sort-bar');
                if (bar) bar.classList.add('hidden');
            };
        }

        // Add Dragging Support
        const bar = document.getElementById('sort-bar');
        if (bar) {
            let isDragging = false;
            let dragOffsetX = 0;
            let dragOffsetY = 0;

            bar.onmousedown = (e) => {
                if (e.target.closest('button, input')) return;
                
                isDragging = true;
                const rect = bar.getBoundingClientRect();
                // Store offset from the center of the bar
                dragOffsetX = e.clientX - (rect.left + rect.width / 2);
                dragOffsetY = e.clientY - (rect.top + rect.height / 2);
                
                bar.style.transition = 'none';
                bar.style.cursor = 'grabbing';
            };

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                // Move bar center to mouse position minus initial click offset
                bar.style.left = (e.clientX - dragOffsetX) + 'px';
                bar.style.top = (e.clientY - dragOffsetY) + 'px';
                bar.style.bottom = 'auto'; // Release fixed bottom
                bar.style.transform = 'translate(-50%, -50%)'; // Ensure transform stays for centering
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    bar.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                    bar.style.cursor = 'grab';
                }
            });
        }

        // Global Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const bar = document.getElementById('sort-bar');
                if (bar) bar.classList.remove('hidden');
                document.body.classList.remove('full-view-mode');
                if (this.currentCase && typeof this.currentCase.resize === 'function') {
                    setTimeout(() => this.currentCase.resize(), 500);
                }
            }
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.currentCase && typeof this.currentCase.toggleSortPlayback === 'function') {
                    this.currentCase.toggleSortPlayback();
                    this.updateSortBar();
                }
            }
        });

        setInterval(() => this.updateSortBar(), 500);
    },

    updateSortBar() {
        // Time
        const timeEl = document.getElementById('apple-time');
        if (timeEl) {
            const elapsed = this.getRecordingElapsedMs();
            timeEl.textContent = this.formatRecordingTimeMMSS(elapsed);
        }

        // Play/Pause icon toggle based on sorting status
        const applePlay = document.getElementById('apple-play');
        const playIconSvg = document.getElementById('play-icon-svg');
        if (applePlay && playIconSvg) {
            const isSorting = this.currentCase
                && this.currentCase.sortMode !== 'off'
                && this.currentCase.sortingStatus === 'running';
            const isHolding = this.currentCase
                && this.currentCase.sortMode !== 'off'
                && this.currentCase.sortingStatus === 'holding';
            
            if (isSorting) {
                applePlay.classList.add('is-playing');
                // Pause (Hold) icon
                playIconSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
                applePlay.title = 'Hold Sorting';
            } else if (isHolding) {
                applePlay.classList.remove('is-playing');
                playIconSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                applePlay.title = 'Resume Sorting';
            } else {
                applePlay.classList.remove('is-playing');
                // Play icon
                playIconSvg.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                applePlay.title = 'Start Sorting';
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
            this.pickMusicTrack(false, false);
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
        this.pickMusicTrack(true, false);
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

    pickMusicTrack(autoPlay = true, manualSequential = false) {
        if (!window.audioManager || this.tracks.length === 0) return;

        let selectedTrack;
        const currentTrackUrl = window.audioManager.currentTrack || '';
        const currentTrackFilename = currentTrackUrl.replace(this.BGM_BASE, '');

        if (manualSequential && currentTrackFilename) {
            const genre = currentTrackFilename.split('/')[0];
            const genreTracks = this.tracks.filter((track) => track.startsWith(`${genre}/`));
            if (genreTracks.length > 0) {
                const currentIndex = genreTracks.indexOf(currentTrackFilename);
                const nextIndex = (currentIndex + 1) % genreTracks.length;
                selectedTrack = genreTracks[nextIndex];
            }
        }

        if (!selectedTrack) {
            const candidates = this.tracks.filter((track) => track !== currentTrackFilename);
            const pool = candidates.length > 0 ? candidates : this.tracks;
            selectedTrack = pool[Math.floor(Math.random() * pool.length)];
        }

        const url = this.getFullTrackPath(selectedTrack);
        if (autoPlay) {
            window.audioManager.play(url, { forceSwitch: true });
        } else {
            window.audioManager.currentTrack = url;
            window.audioManager.audio.src = url;
        }
    },

    toggleAudio() {
        if (!window.audioManager) return;
        const isMuted = window.audioManager.toggleMute();
        if (!isMuted && !window.audioManager.currentTrack) {
            this.pickMusicTrack(true, false);
        }
        
        // Update HUD slider to match
        const appleVol = document.getElementById('apple-vol-slider');
        if (appleVol) appleVol.value = isMuted ? 0 : window.audioManager.getTargetVolume();
        
        this.syncAudioButton();
    },

    changeMusicTrack() {
        this.pickMusicTrack(true, true);
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
