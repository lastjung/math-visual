const Core = {
    currentCase: null,
    currentGeometryId: 'cardioid',
    isRunning: true,
    recordingStartMs: performance.now(),
    simTimers: [],
    isSimRunning: false,
    simStateSnapshot: null,
    simStartMs: null,
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
    geometryRegistry: {
        cardioid: {
            id: 'cardioid',
            label: 'Cardioid',
            panelTitle: 'Cardioid Inspector',
            eyebrow: 'Geometry',
            caseRef: () => CardioidCircleCase
        },
        goldberg_sphere: {
            id: 'goldberg_sphere',
            label: 'Goldberg Sphere',
            panelTitle: 'Goldberg Sphere Inspector',
            eyebrow: 'Geometry',
            caseRef: () => GoldbergSphereCase
        }
    },
    caseContract: {
        requiredFns: ['buildGeometryProvider', 'getCurrentGeometryProvider', 'reset', 'start', 'stop', 'destroy'],
        requiredProps: ['uiConfig'],
        recommendedFns: ['drawHud', 'resize', 'setPaused']
    },

    init() {
        this.bindToolbar();
        this.bindSidePanels();
        this.bindGlobalToolbar();
        this.loadGeometryCase(this.currentGeometryId);
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

    bindGlobalToolbar() {
        const geometrySelect = document.getElementById('global-geometry-select');
        if (!geometrySelect) return;

        geometrySelect.innerHTML = '';
        Object.values(this.geometryRegistry).forEach((entry) => {
            const option = document.createElement('option');
            option.value = entry.id;
            option.textContent = entry.label;
            geometrySelect.appendChild(option);
        });
        geometrySelect.value = this.currentGeometryId;
        geometrySelect.onchange = (e) => this.loadGeometryCase(e.target.value);
        this.syncGeometryMeta();
    },

    loadGeometryCase(geometryId) {
        const entry = this.geometryRegistry[geometryId] || this.geometryRegistry.cardioid;
        this.currentGeometryId = entry.id;
        this.loadCase(entry.caseRef());
    },

    syncGeometryMeta() {
        const entry = this.geometryRegistry[this.currentGeometryId] || this.geometryRegistry.cardioid;
        const geometrySelect = document.getElementById('global-geometry-select');
        const title = document.getElementById('geometry-panel-title');
        const eyebrow = document.getElementById('geometry-panel-eyebrow');

        if (geometrySelect) geometrySelect.value = entry.id;
        if (title) title.textContent = entry.panelTitle;
        if (eyebrow) eyebrow.textContent = entry.eyebrow || 'Geometry';
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
                const scenarioSelect = document.getElementById('apple-scenario-select');
                if (scenarioSelect && scenarioSelect.value === '1_rays') {
                    this.runRaysSimulation();
                    this.updateSortBar();
                    return;
                }
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

        const scenarioSelect = document.getElementById('apple-scenario-select');
        if (scenarioSelect) {
            scenarioSelect.onchange = (e) => {
                const val = e.target.value;
                if (val !== '1_rays') {
                    this.stopSimulation();
                }
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
                this.stopSimulation();
            }

            const isA = e.code === 'KeyA';
            const is1 = e.code === 'Digit1';
            
            // Check if A is held (we can use a property to track this if needed, but for simplicity let's check Alt/Shift or just A+1 combo)
            // The user specifically asked for A+1 (A+4 style)
            if (e.code === 'Digit1' && this.aHeld) {
                e.preventDefault();
                this.runRaysSimulation();
            }

            if (e.code === 'KeyA') {
                this.aHeld = true;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                const scenarioSelect = document.getElementById('apple-scenario-select');
                if (scenarioSelect && scenarioSelect.value === '1_rays') {
                    this.runRaysSimulation();
                    this.updateSortBar();
                    return;
                }
                if (this.currentCase && typeof this.currentCase.toggleSortPlayback === 'function') {
                    this.currentCase.toggleSortPlayback();
                    this.updateSortBar();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyA') this.aHeld = false;
        });

        setInterval(() => this.updateSortBar(), 500);
    },

    aHeld: false,

    clearSimTimers() {
        this.simTimers.forEach(id => clearTimeout(id));
        this.simTimers = [];
    },

    showSimMessage(title, subtitle, duration = 3000) {
        const overlay = document.getElementById('sim-overlay');
        const titleEl = document.getElementById('sim-title');
        const subtitleEl = document.getElementById('sim-subtitle');
        if (!overlay || !titleEl || !subtitleEl) return;

        titleEl.textContent = title;
        subtitleEl.textContent = subtitle;
        overlay.classList.add('visible');

        const tid = setTimeout(() => {
            overlay.classList.remove('visible');
        }, duration);
        this.simTimers.push(tid);
    },

    stopSimulation() {
        this.clearSimTimers();
        this.isSimRunning = false;
        this.simStartMs = null;
        const overlay = document.getElementById('sim-overlay');
        if (overlay) overlay.classList.remove('visible');

        if (this.currentCase && this.simStateSnapshot) {
            if (typeof this.simStateSnapshot.pointCount === 'number') {
                this.currentCase.pointCount = this.simStateSnapshot.pointCount;
            }
            if (typeof this.currentCase.resetSortState === 'function') {
                this.currentCase.resetSortState('idle');
            }
            if (typeof this.currentCase.draw === 'function') {
                this.currentCase.draw();
            }
            this.updateControls();
        }
        this.simStateSnapshot = null;
        
    },

    runRaysSimulation() {
        if (this.isSimRunning) {
            this.stopSimulation();
            return;
        }
        if (!this.currentCase) return;

        this.isSimRunning = true;
        this.simStartMs = performance.now();
        this.simStateSnapshot = {
            pointCount: this.currentCase.pointCount
        };
        const scenarioSelect = document.getElementById('apple-scenario-select');
        if (scenarioSelect) scenarioSelect.value = '1_rays';

        const stages = [
            { n: 180, title: 'Color Radix Sort', subtitle: '180 Rays' },
            { n: 360, title: 'Color Radix Sort', subtitle: '360 Rays' },
            { n: 720, title: 'Color Radix Sort', subtitle: '720 Rays' },
            { n: 1080, title: 'Color Radix Sort', subtitle: '1080 Rays' }
        ];

        let currentIdx = 0;

        const runStage = () => {
            if (!this.isSimRunning || currentIdx >= stages.length) {
                this.showSimMessage('Color Radix Sort', 'Complete', 4000);
                const tid = setTimeout(() => this.stopSimulation(), 4500);
                this.simTimers.push(tid);
                return;
            }

            const stage = stages[currentIdx];
            
            // 1. Show message
            this.showSimMessage(stage.title, stage.subtitle, 2500);

            const tid1 = setTimeout(() => {
                if (!this.isSimRunning) return;
                
                // 2. Set Point Count
                this.currentCase.pointCount = stage.n;
                this.currentCase.resetSortState('idle');
                this.currentCase.draw();
                this.updateControls();

                // 3. Start Sorting automatically after a short delay
                const tid2 = setTimeout(() => {
                    if (!this.isSimRunning) return;
                    
                    if (this.currentCase.sortMode === 'off') {
                        this.currentCase.sortMode = 'hue';
                    }
                    this.currentCase.restartSort();
                    this.updateSortBar();

                    // 4. Wait for sort to finish, then hold the completed frame briefly.
                    const totalSteps = typeof this.currentCase.getSortTotalSteps === 'function'
                        ? this.currentCase.getSortTotalSteps()
                        : (stage.n * 3);
                    const sortDurationMs = Math.ceil((totalSteps / Math.max(1, this.currentCase.sortSpeed || 1)) * 1000);
                    const finalHoldMs = 1000;
                    const sortTime = sortDurationMs + finalHoldMs;
                    const tid3 = setTimeout(() => {
                        currentIdx++;
                        runStage();
                    }, sortTime);
                    this.simTimers.push(tid3);

                }, 1000);
                this.simTimers.push(tid2);

            }, 3000);
            this.simTimers.push(tid1);
        };

        runStage();
    },

    updateSortBar() {
        // Time
        const timeEl = document.getElementById('apple-time');
        if (timeEl) {
            const elapsed = this.getActiveElapsedMs();
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
        this.validateCaseContract(caseInstance);
        this.currentCase = caseInstance;
        this.recordingStartMs = performance.now();
        if (typeof caseInstance.init === 'function') caseInstance.init();
        if (typeof caseInstance.start === 'function') caseInstance.start();
        this.isRunning = true;
        this.syncGeometryMeta();
        this.updateControls();
        this.ensureTrack();
    },

    validateCaseContract(caseInstance) {
        if (!caseInstance) return;

        const missingRequired = [];
        const missingRecommended = [];

        this.caseContract.requiredProps.forEach((key) => {
            if (!(key in caseInstance)) missingRequired.push(key);
        });

        this.caseContract.requiredFns.forEach((key) => {
            if (typeof caseInstance[key] !== 'function') missingRequired.push(`${key}()`);
        });

        this.caseContract.recommendedFns.forEach((key) => {
            if (typeof caseInstance[key] !== 'function') missingRecommended.push(`${key}()`);
        });

        if (missingRequired.length > 0) {
            console.warn('[SortColor] Case contract missing required members:', missingRequired.join(', '));
        }

        if (missingRecommended.length > 0) {
            console.info('[SortColor] Case contract missing recommended members:', missingRecommended.join(', '));
        }
    },

    ensureTrack() {
        if (!window.audioManager) return;
        if (!window.audioManager.currentTrack) {
            this.pickMusicTrack(false, false);
        }
        this.syncAudioButton();
    },

    bindSidePanels() {
        this.bindPanelToggle('sorting-panel', 'sorting-panel-close', 'sorting-panel-restore');
        this.bindPanelToggle('generator-panel', 'generator-panel-close', 'generator-panel-restore');
    },

    bindPanelToggle(panelId, closeId, restoreId) {
        const panel = document.getElementById(panelId);
        const closeBtn = document.getElementById(closeId);
        const restoreBtn = document.getElementById(restoreId);
        if (!panel) return;

        if (closeBtn) {
            closeBtn.onclick = () => {
                panel.classList.add('hidden');
                if (restoreBtn) restoreBtn.classList.remove('hidden');
            };
        }

        if (restoreBtn) {
            restoreBtn.onclick = () => {
                panel.classList.remove('hidden');
                restoreBtn.classList.add('hidden');
            };
        }
    },

    isSortingControl(control) {
        if (!control || !control.id) return false;
        const sortingIds = new Set([
            'mc_play_toggle',
            'mc_sort_divider',
            'mc_sort',
            'mc_sort_speed',
            'mc_sort_restart'
        ]);
        return sortingIds.has(control.id);
    },

    isGlobalControl(control) {
        if (!control || !control.id) return false;
        const globalIds = new Set([
            'mc_render',
            'mc_color'
        ]);
        return globalIds.has(control.id);
    },

    renderControlList(host, controls) {
        if (!host) return;
        host.innerHTML = '';

        controls.forEach((control) => {
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
    },

    updateControls() {
        const globalHost = document.getElementById('global-control-list');
        const generatorHost = document.getElementById('generator-control-list');
        const sortingHost = document.getElementById('sorting-control-list');
        if ((!globalHost && !generatorHost && !sortingHost) || !this.currentCase || !Array.isArray(this.currentCase.uiConfig)) return;

        const globalControls = [];
        const sortingControls = [];
        const generatorControls = [];

        this.currentCase.uiConfig.forEach((control) => {
            if (this.isGlobalControl(control)) globalControls.push(control);
            else if (this.isSortingControl(control)) sortingControls.push(control);
            else generatorControls.push(control);
        });

        this.renderControlList(globalHost, globalControls);
        this.renderControlList(sortingHost, sortingControls);
        this.renderControlList(generatorHost, generatorControls);

        this.syncGeometryMeta();

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

    getSimulationElapsedMs() {
        if (!this.simStartMs) return 0;
        return performance.now() - this.simStartMs;
    },

    getActiveElapsedMs() {
        if (this.isSimRunning && this.simStartMs) {
            return this.getSimulationElapsedMs();
        }
        return this.getRecordingElapsedMs();
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
