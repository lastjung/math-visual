const Core = {
    currentCase: null,
    currentGeometryId: 'cardioid',
    isRunning: true,
    recordingStartMs: performance.now(),
    simTimers: [],
    isSimRunning: false,
    simStateSnapshot: null,
    simStartMs: null,
    lastGameSfxTickAt: 0,
    BGM_BASE: (typeof SortColorMusicConfig !== 'undefined' && SortColorMusicConfig.BGM_BASE) || '../visualization/assets/music/bgm/',
    tracks: (typeof SortColorMusicConfig !== 'undefined' && Array.isArray(SortColorMusicConfig.tracks))
        ? SortColorMusicConfig.tracks.slice()
        : [],
    geometryRegistry: {
        cardioid: {
            id: 'cardioid',
            label: 'Cardioid',
            panelTitle: 'Cardioid Inspector',
            eyebrow: 'Geometry',
            caseRef: () => CardioidCircleCase
        },
        spiral_disk: {
            id: 'spiral_disk',
            label: 'Spiral Disk',
            panelTitle: 'Spiral Disk Inspector',
            eyebrow: 'Geometry',
            caseRef: () => SpiralDiskCase
        },
        lissajous: {
            id: 'lissajous',
            label: 'Lissajous',
            panelTitle: 'Lissajous Inspector',
            eyebrow: 'Geometry',
            caseRef: () => LissajousCase
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
        this.restoreGeometrySelection();
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
        this.persistGeometrySelection();
        this.loadCase(entry.caseRef());
    },

    restoreGeometrySelection() {
        try {
            const saved = window.localStorage.getItem('sort-color:geometry');
            if (saved && this.geometryRegistry[saved]) {
                this.currentGeometryId = saved;
            }
        } catch (_err) {
            // Ignore storage errors and keep default geometry.
        }
    },

    persistGeometrySelection() {
        try {
            window.localStorage.setItem('sort-color:geometry', this.currentGeometryId);
        } catch (_err) {
            // Ignore storage errors.
        }
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
        const gameSfxToggle = document.getElementById('game-sfx-toggle');

        if (applePlay) {
            applePlay.onclick = () => {
                this.playGameSound('play');
                const scenarioSelect = document.getElementById('apple-scenario-select');
                if (scenarioSelect && scenarioSelect.value === '1_rays') {
                    this.runRaysSimulation();
                    this.updateSortBar();
                    return;
                }
                if (scenarioSelect && scenarioSelect.value === '2_by-sorting') {
                    this.runBySortingSimulation();
                    this.updateSortBar();
                    return;
                }
                if (scenarioSelect && scenarioSelect.value === '3_m-simm') {
                    this.runMSimmSimulation();
                    this.updateSortBar();
                    return;
                }
                if (scenarioSelect && scenarioSelect.value === '4_n-steps') {
                    this.runNStepsSimulation();
                    this.updateSortBar();
                    return;
                }
                if (scenarioSelect && scenarioSelect.value === '5_disks') {
                    this.runDisksSimulation();
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
                this.playGameSound('reset');
                this.resetCase();
                this.updateSortBar();
            };
        }
        
        if (appleVolIcon) appleVolIcon.onclick = () => this.toggleAudio();

        if (applePartial) {
            applePartial.onclick = () => {
                if (this.currentCase && typeof this.currentCase.resetSortProgress === 'function') {
                    this.playGameSound('reset');
                    this.currentCase.resetSortProgress();
                    this.currentCase.draw();
                    this.updateSortBar();
                }
            };
        }
        if (appleSpeedUp) {
            appleSpeedUp.onclick = () => {
                if (this.currentCase && typeof this.currentCase.stepSort === 'function') {
                    this.playGameSound('step');
                    this.currentCase.stepSort(1);
                    this.currentCase.draw();
                    this.updateSortBar();
                }
            };
        }
        if (appleSpeedDown) {
            appleSpeedDown.onclick = () => {
                if (this.currentCase && typeof this.currentCase.stepSort === 'function') {
                    this.playGameSound('step');
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
                this.playGameSound('tap');
                const val = e.target.value;
                if (val !== '1_rays' && val !== '2_by-sorting' && val !== '3_m-simm' && val !== '4_n-steps') {
                    this.stopSimulation();
                }
            };
        }

        if (gameSfxToggle) {
            gameSfxToggle.onclick = () => {
                this.toggleGameSound();
            };
            this.syncGameSoundButton();
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

            if (e.code === 'Digit1' && this.aHeld) {
                e.preventDefault();
                this.runRaysSimulation();
            }
            if (e.code === 'Digit2' && this.aHeld) {
                e.preventDefault();
                this.runBySortingSimulation();
            }
            if (e.code === 'Digit3' && this.aHeld) {
                e.preventDefault();
                this.runMSimmSimulation();
            }
            if (e.code === 'Digit4' && this.aHeld) {
                e.preventDefault();
                this.runNStepsSimulation();
            }
            if (e.code === 'Digit5' && this.aHeld) {
                e.preventDefault();
                this.runDisksSimulation();
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
                if (scenarioSelect && scenarioSelect.value === '2_by-sorting') {
                    this.runBySortingSimulation();
                    this.updateSortBar();
                    return;
                }
                if (scenarioSelect && scenarioSelect.value === '3_m-simm') {
                    this.runMSimmSimulation();
                    this.updateSortBar();
                    return;
                }
                if (scenarioSelect && scenarioSelect.value === '4_n-steps') {
                    this.runNStepsSimulation();
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

                const valueDisplay = document.createElement('input');
                valueDisplay.type = 'text';
                valueDisplay.className = 'control-value editable';
                valueDisplay.id = `val-${control.id}`;
                valueDisplay.value = this.formatControlValue(control, control.value);

                const input = document.createElement('input');
                input.type = 'range';
                input.id = `input-${control.id}`;
                input.min = String(control.min);
                input.max = String(control.max);
                input.step = String(control.step);
                input.value = String(control.value);

                const applyValue = (valStr) => {
                    let nextValue = parseFloat(valStr);
                    if (isNaN(nextValue)) nextValue = control.value;
                    nextValue = Math.max(control.min, Math.min(control.max, nextValue));
                    
                    valueDisplay.value = this.formatControlValue(control, nextValue);
                    input.value = String(nextValue);
                    control.onChange(nextValue);
                };

                valueDisplay.onchange = (e) => applyValue(e.target.value);
                valueDisplay.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        applyValue(e.target.value);
                        e.target.blur();
                    }
                };
                
                input.oninput = (e) => {
                    const nextValue = Number(e.target.value);
                    valueDisplay.value = this.formatControlValue(control, nextValue);
                    control.onChange(nextValue);
                };

                header.appendChild(label);
                header.appendChild(valueDisplay);
                item.appendChild(header);
                item.appendChild(input);

                if (control.id === 'mc_lissajous_phase') {
                    label.style.cursor = 'pointer';
                    label.title = 'Click to simulate phase A';
                    label.onclick = () => this.togglePhaseSimulation(control);
                }
                if (control.id === 'mc_lissajous_phase_b') {
                    label.style.cursor = 'pointer';
                    label.title = 'Click to simulate phase B';
                    label.onclick = () => this.togglePhaseBSimulation(control);
                }
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
            } else if (control.type === 'checkbox') {
                const label = document.createElement('label');
                label.className = 'control-checkbox-label';

                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `input-${control.id}`;
                input.checked = !!control.value;
                input.onchange = (e) => control.onChange(!!e.target.checked);

                const text = document.createElement('span');
                text.textContent = control.label;

                label.appendChild(input);
                label.appendChild(text);
                item.appendChild(label);
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
        } else {
            if (typeof this.currentCase.setPaused === 'function') {
                this.currentCase.setPaused(false);
            } else if (typeof this.currentCase.start === 'function') {
                this.currentCase.start();
            }
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

    toggleGameSound() {
        if (!window.gameSfx) return;
        const isOn = window.gameSfx.toggle();
        if (isOn) this.playGameSound('play');
        this.syncGameSoundButton();
    },

    playGameSound(type = 'tap') {
        if (!window.gameSfx) return;
        window.gameSfx.play(type);
    },

    maybePlaySortingTick(caseRef, previousProgress, nextProgress, plan = null) {
        if (!window.gameSfx || !window.gameSfx.enabled) return;
        if (!caseRef || caseRef.sortingStatus !== 'running') return;
        const prevStep = Math.floor(previousProgress);
        const nextStep = Math.floor(nextProgress);
        const progressDelta = nextStep - prevStep;
        if (progressDelta <= 0) return;

        const now = performance.now();
        const isRadix = caseRef.sortMode === 'hue' || caseRef.sortMode === 'lsh';
        const isQuick = caseRef.sortMode === 'quick';
        const isInsertion = caseRef.sortMode === 'insertion';
        const isSelection = caseRef.sortMode === 'selection';
        const stepStride = isRadix ? 3 : ((isQuick || isInsertion || isSelection) ? 2 : 3);
        if (Math.floor(nextStep / stepStride) === Math.floor(prevStep / stepStride)) return;

        if (isRadix && Array.isArray(plan?.passes) && plan.passes.length > 0) {
            const passLength = plan.passes[0]?.sourceOrder?.length || 0;
            if (passLength > 0) {
                const nextPassStep = nextStep % passLength;
                if (nextPassStep <= 8) return;
            }
        }

        const intervalMs = isRadix ? 95 : ((isQuick || isInsertion || isSelection) ? 110 : 130);
        if (now - this.lastGameSfxTickAt < intervalMs) return;

        this.lastGameSfxTickAt = now;
        this.playGameSound('tick');
    },

    syncGameSoundButton() {
        const button = document.getElementById('game-sfx-toggle');
        if (!button || !window.gameSfx) return;
        const isOn = !!window.gameSfx.enabled;
        button.textContent = isOn ? 'Game Sound: On' : 'Game Sound: Off';
        button.classList.toggle('is-off', !isOn);
        button.setAttribute('aria-pressed', String(isOn));
    },

    changeMusicTrack() {
        this.pickMusicTrack(true, false);
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
    },

    // Shared phase animation loop - runs once per frame, updates A and/or B
    _startPhaseLoop() {
        if (this._phaseLoopId) return; // Already running

        // Cache DOM refs once
        const inputA   = document.getElementById('input-mc_lissajous_phase');
        const displayA = document.getElementById('val-mc_lissajous_phase');
        const itemA    = document.querySelector('.control-item[data-id="mc_lissajous_phase"]');
        const inputB   = document.getElementById('input-mc_lissajous_phase_b');
        const displayB = document.getElementById('val-mc_lissajous_phase_b');
        const itemB    = document.querySelector('.control-item[data-id="mc_lissajous_phase_b"]');

        // Init tracked values from current DOM state
        if (this._phaseAVal == null) this._phaseAVal = parseFloat(inputA?.value) || 0;
        if (this._phaseBVal == null) this._phaseBVal = parseFloat(inputB?.value) || 0;

        const animate = () => {
            if (!this.isPhaseSimulating && !this.isPhaseBSimulating) {
                this._phaseLoopId = null;
                return;
            }
            if (!this.currentCase) {
                this._phaseLoopId = null;
                return;
            }

            if (this.isPhaseSimulating && inputA) {
                this._phaseAVal = (this._phaseAVal + 0.15) % 360;
                inputA.value = this._phaseAVal.toFixed(2);
                if (displayA) displayA.value = this._phaseAVal.toFixed(1);
                if (itemA) itemA.classList.add('simulating');
                this.currentCase.lissajousPhaseDeg = this._phaseAVal;
            }

            if (this.isPhaseBSimulating && inputB) {
                this._phaseBVal = (this._phaseBVal + 0.1) % 360;
                inputB.value = this._phaseBVal.toFixed(2);
                if (displayB) displayB.value = this._phaseBVal.toFixed(1);
                if (itemB) itemB.classList.add('simulating');
                this.currentCase.lissajousPhaseBDeg = this._phaseBVal;
            }

            this.currentCase.draw();
            this._phaseLoopId = requestAnimationFrame(animate);
        };
        this._phaseLoopId = requestAnimationFrame(animate);
    },

    togglePhaseSimulation(control) {
        if (this.isPhaseSimulating) {
            this.isPhaseSimulating = false;
            const item = document.querySelector(`.control-item[data-id="${control.id}"]`);
            if (item) item.classList.remove('simulating');
            return;
        }
        this._phaseAVal = parseFloat(document.getElementById('input-mc_lissajous_phase')?.value) || 0;
        this.isPhaseSimulating = true;
        this._startPhaseLoop();
    },

    togglePhaseBSimulation(control) {
        if (this.isPhaseBSimulating) {
            this.isPhaseBSimulating = false;
            const item = document.querySelector(`.control-item[data-id="${control.id}"]`);
            if (item) item.classList.remove('simulating');
            return;
        }
        this._phaseBVal = parseFloat(document.getElementById('input-mc_lissajous_phase_b')?.value) || 0;
        this.isPhaseBSimulating = true;
        this._startPhaseLoop();
    }
};

window.addEventListener('load', () => {
    Core.init();
});

if (typeof SortColorScenarioManager !== 'undefined') {
    Object.assign(Core, SortColorScenarioManager);
}
