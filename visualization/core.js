/**
 * Core Engine for Math Visualizations
 * Handles Global Systems: UIManager, Idle Management, Recording Mode, and Case Loading
 */

const Core = {
    currentCase: null,
    isIdle: false,
    idleTimer: null,
    IDLE_TIMEOUT: 60 * 1000,
    recordingStartMs: 0,
    isRunning: true,
    currentCaseMode: 'display',
    lastSelectedTrack: null,
    randomBgmTracks: [
        'assets/music/bgm/Math_01_Minimalist_Sine_Pulse.mp3',
        'assets/music/bgm/Math_02_Fractal_Recursive_Ambient.mp3',
        'assets/music/bgm/Math_03_Euclidean_Polyrhythm.mp3',
        'assets/music/bgm/Math_04_Cybernetic_Grid_Logic.mp3',
        'assets/music/bgm/Math_05_Infinite_Series_Flow.mp3',
        'assets/music/bgm/Math_06_Binary_Symphony.mp3',
        'assets/music/bgm/Math_07_Quantum_Resonance.mp3',
        'assets/music/bgm/Math_08_Geometric_Vector_Motion.mp3',
        'assets/music/bgm/Math_09_Fibonacci_Golden_Ratio.mp3',
        'assets/music/bgm/Math_10_Bitwise_Glitch_Architecture.mp3',
        'assets/music/bgm/Math_11_Calculus_Flow.mp3',
        'assets/music/bgm/Math_12_Neural_Network_Synapse.mp3',
        'assets/music/bgm/Math_13_Retro_8-bit_Math.mp3',
        'assets/music/bgm/Math_14_Primality_Test_Beat.mp3',
        'assets/music/bgm/Math_15_Deep_Space_Topology.mp3',
        'assets/music/bgm/Math_16_Coordinate_Plane_Ambient.mp3',
        'assets/music/bgm/Math_17_Mathematical_Induction.mp3',
        'assets/music/bgm/Math_18_Lo-fi_Coding_Marathon.mp3',
        'assets/music/bgm/Math_19_Abstract_Set_Theory.mp3',
        'assets/music/bgm/Math_20_Theorem_Q.E.D..mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_01_Nocturne_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_02_Moonlight_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_03_Claire_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_04_Liebestraum_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_05_Gymnopedie_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_06_Classical_Sonata_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_07_Rach_Grand_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_08_River_Flows_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_09_Hisaishi_Fantasy_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_10_Jazz_Mood_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_11_Ragtime_Fun_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_12_Minimal_Cycle_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_13_Cinematic_Tear_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_14_Pop_Vibe_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_15_Mystery_Night_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_16_Morning_Dew_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_17_Rainy_Window_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_18_Soulful_Touch_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_19_Wedding_Grace_Full_HQ.mp3',
        'assets/music/bgm/piano-shorts/Piano_Short_20_Grand_Power_Full_HQ.mp3'
    ],

    getCurrentTrack() {
        if (!this.currentCase) return null;
        return this.currentCase._selectedMusicTrack || this.currentCase.musicTrack || null;
    },

    pickRandomTrack(previousTrack = null) {
        if (!this.randomBgmTracks.length) return null;
        if (this.randomBgmTracks.length === 1) return this.randomBgmTracks[0];

        const candidates = previousTrack
            ? this.randomBgmTracks.filter((track) => track !== previousTrack)
            : this.randomBgmTracks;
        const pool = candidates.length ? candidates : this.randomBgmTracks;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    selectCaseTrack() {
        const previousTrack = this.lastSelectedTrack || (window.audioManager ? window.audioManager.currentTrack : null);
        const randomTrack = this.pickRandomTrack(previousTrack);
        this.currentCase._selectedMusicTrack = randomTrack || this.currentCase.musicTrack || null;
        this.lastSelectedTrack = this.currentCase._selectedMusicTrack;
    },

    init() {
        this.setupUI();
        this.setupIdleSystem();
        this.setupGlobalEvents();
        
        window.addEventListener('resize', () => {
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel && window.innerWidth <= 1024) {
                settingsPanel.classList.add('visible');
            }
            if (this.currentCase && this.currentCase.resize) {
                this.currentCase.resize();
            }
            this.updateControls(); // Refresh UI layout (sidebar vs dock)
        });
    },

    // --- Universal UI System ---
    setupUI() {
        // 1. Create Settings Panel
        if (!document.getElementById('settings-panel')) {
            const panel = document.createElement('div');
            panel.id = 'settings-panel';
            document.body.appendChild(panel);
        }

        // Keep controls visible by default on mobile/tablet for live tweaking.
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel && window.innerWidth <= 1024) {
            settingsPanel.classList.add('visible');
        }

        // 2. Create Floating Dock
        if (!document.getElementById('floating-dock-container')) {
            const dock = document.createElement('div');
            dock.id = 'floating-dock-container';
            dock.innerHTML = `
                <button class="icon-btn" id="btn-settings" title="Settings">⚙️</button>
                <button class="icon-btn" id="btn-bgm" title="Sound On/Off">🔇</button>
                <button class="icon-btn" id="btn-next-track" title="Change Music">⏭</button>
                <button class="icon-btn" id="btn-hide-ui" title="Enter Full Screen">⤢</button>
                <div class="dock-divider"></div>
                <button class="icon-btn" id="btn-reset" title="Reset">↺</button>
                <button class="play-btn" id="btn-play" title="Play/Pause">
                    <span>❚❚</span> <span>Hold</span>
                </button>
            `;
            document.body.appendChild(dock);

            // Bind Dock Events
            document.getElementById('btn-settings').onclick = () => this.toggleSettings();
            document.getElementById('btn-bgm').onclick = () => this.toggleAudio();
            document.getElementById('btn-next-track').onclick = () => this.changeMusicTrack();
            document.getElementById('btn-hide-ui').onclick = () => this.toggleCinematicMode();
            document.getElementById('btn-reset').onclick = () => this.resetCase();
            document.getElementById('btn-play').onclick = () => this.togglePlay();
        }
        this.syncAudioButton();

        // 3. UI Toggle Button (for bringing UI back)
        if (!document.getElementById('ui-toggle-btn')) {
             const btn = document.createElement('button');
             btn.id = 'ui-toggle-btn';
             btn.textContent = 'Exit Full Screen';
             btn.title = 'Exit Full Screen';
             btn.onclick = () => this.toggleCinematicMode();
             document.body.appendChild(btn);
        }
        this.updateCinematicButton();

        this.recordingStartMs = Date.now();
        
        // Auto-initialize audio on first interaction
        const initAudio = () => {
             // Start audio only when the app is running to avoid pause-click race.
             if (!this.isRunning) return;
             const track = this.getCurrentTrack();
             if (track && window.audioManager && window.audioManager.audio.paused && !window.audioManager.isMuted) {
                 window.audioManager.play(track);
                 document.removeEventListener('click', initAudio);
                 document.removeEventListener('keydown', initAudio);
             }
        };
        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    },

    toggleAudio() {
        if (this.currentCase && typeof this.currentCase.toggleCaseAudio === 'function') {
            this.currentCase.toggleCaseAudio();
            this.syncAudioButton();
            this.updateControls();
            return;
        }

        if (window.audioManager) {
            const isMuted = window.audioManager.toggleMute();
            this.syncAudioButton();
            this.updateControls();
            const track = this.getCurrentTrack();
            if (!isMuted && this.isRunning && track) {
                window.audioManager.play(track);
            }
        }
    },

    changeMusicTrack() {
        if (!this.currentCase || !window.audioManager) return;
        const previousTrack = this.getCurrentTrack() || this.lastSelectedTrack;
        const nextTrack = this.pickRandomTrack(previousTrack);
        if (!nextTrack) return;

        this.currentCase._selectedMusicTrack = nextTrack;
        this.lastSelectedTrack = nextTrack;
        this.recordingStartMs = Date.now();
        window.audioManager.play(nextTrack, { forceSwitch: true });
        if (!this.isRunning) {
            window.audioManager.syncWithPlaybackState(false);
        }
    },

    getRecordingElapsedMs() {
        return Math.max(0, Date.now() - this.recordingStartMs);
    },

    formatRecordingTimeMMSS(ms) {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const mm = Math.floor(totalSec / 60);
        const ss = totalSec % 60;
        return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    },

    syncAudioButton() {
        const btn = document.getElementById('btn-bgm');
        if (!btn) return;
        let isMuted = true;
        if (this.currentCase && typeof this.currentCase.isCaseAudioMuted === 'function') {
            isMuted = this.currentCase.isCaseAudioMuted();
        } else if (window.audioManager) {
            isMuted = window.audioManager.isMuted;
        }
        btn.innerHTML = isMuted ? '🔇' : '🎵';
        btn.style.opacity = isMuted ? '0.5' : '1';
    },

    updateControls() {
        // Find active container
        const isDesktop = window.innerWidth > 1024;
        const panel = isDesktop ? document.querySelector('.controls.active') : document.getElementById('settings-panel');
        if (!panel) return;
        
        panel.innerHTML = ''; // Clear existing content

        const globalGroup = document.createElement('div');
        globalGroup.className = 'setting-item';
        globalGroup.style.marginBottom = '16px';
        globalGroup.style.paddingBottom = '16px';
        globalGroup.style.borderBottom = '1px solid #eee';

        const bgmLabel = (this.currentCase && typeof this.currentCase.caseAudioLabel === 'function') ? this.currentCase.caseAudioLabel() : 'BGM';
        const bgmState = (this.currentCase && typeof this.currentCase.isCaseAudioMuted === 'function')
            ? (this.currentCase.isCaseAudioMuted() ? 'OFF' : 'ON')
            : (window.audioManager && !window.audioManager.isMuted ? 'ON' : 'OFF');
        const volumeValue = window.audioManager && typeof window.audioManager.getTargetVolume === 'function'
            ? window.audioManager.getTargetVolume()
            : (window.audioManager ? window.audioManager.targetVolume : 0.5);
        const volumePercent = Math.round((volumeValue || 0) * 100);

        globalGroup.innerHTML = `
            <div class="setting-header" style="margin-bottom:12px;">
                <label>${this.currentCaseMode === 'interactive' ? 'Interactive Controls' : 'Master Controls'}</label>
            </div>
            ${isDesktop ? `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <button class="btn-primary" id="sidebar-reset" style="padding:10px 0; font-size:0.8rem;">
                    ${this.currentCaseMode === 'interactive' ? '↺ Reset Maze' : '↺ Reset'}
                </button>
                <button class="btn-primary" id="sidebar-play" style="padding:10px 0; font-size:0.8rem;">
                    ${(() => { const s = this.getPlayLabel(); return s.icon + ' ' + s.text; })()}
                </button>
            </div>
            ` : ''}
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px;">
                <button class="btn-secondary" id="sidebar-bgm" style="width:100%; font-size:0.8rem;">
                    ${bgmLabel}: ${bgmState}
                </button>
                <button class="btn-secondary" id="sidebar-next-track" style="width:100%; font-size:0.8rem;">
                    Next Track
                </button>
            </div>
            <div class="setting-header" style="margin-top:10px;">
                <label>Music Volume</label>
                <span class="setting-value" id="val-master-volume">${volumePercent}%</span>
            </div>
            <input type="range" id="master-volume" min="0" max="100" step="1" value="${volumePercent}">
        `;
        panel.appendChild(globalGroup);

        const resetBtn = panel.querySelector('#sidebar-reset');
        if (resetBtn) resetBtn.onclick = () => this.resetCase();
        const playBtn = panel.querySelector('#sidebar-play');
        if (playBtn) playBtn.onclick = () => this.togglePlay();
        const bgmBtn = panel.querySelector('#sidebar-bgm');
        if (bgmBtn) {
            bgmBtn.onclick = () => {
                this.toggleAudio();
                this.updateControls();
            };
        }
        const nextTrackBtn = panel.querySelector('#sidebar-next-track');
        if (nextTrackBtn) {
            nextTrackBtn.onclick = () => this.changeMusicTrack();
        }
        const volumeInput = panel.querySelector('#master-volume');
        const volumeLabel = panel.querySelector('#val-master-volume');
        if (volumeInput && volumeLabel) {
            volumeInput.oninput = (e) => {
                const volume = parseInt(e.target.value, 10);
                volumeLabel.textContent = `${volume}%`;
                if (window.audioManager && typeof window.audioManager.setTargetVolume === 'function') {
                    window.audioManager.setTargetVolume(volume / 100);
                }
            };
        }

        if (this.currentCase && this.currentCase.uiConfig) {
            const controls = this.currentCase.uiConfig;
            
            controls.forEach(ctrl => {
                const row = document.createElement('div');
                row.className = 'setting-item';

                if (ctrl.type === 'slider') {
                    row.innerHTML = `
                        <div class="setting-header">
                            <label>${ctrl.label}</label>
                            <span class="setting-value" id="val-${ctrl.id}">${ctrl.value}</span>
                        </div>
                        <input type="range" id="${ctrl.id}" 
                               min="${ctrl.min}" max="${ctrl.max}" step="${ctrl.step}" value="${ctrl.value}">
                    `;
                    panel.appendChild(row);

                    const input = row.querySelector('input');
                    const valDisplay = row.querySelector(`#val-${ctrl.id}`);
                    
                    input.oninput = (e) => {
                        const v = parseFloat(e.target.value);
                        valDisplay.textContent = v;
                        if (ctrl.onChange) ctrl.onChange(v, valDisplay);
                    };
                } else if (ctrl.type === 'button') {
                     row.style.textAlign = 'center';
                     row.innerHTML = `<button class="btn-primary" id="${ctrl.id}" style="width:100%; margin-top:4px;">${ctrl.value || ctrl.label}</button>`;
                     panel.appendChild(row);
                     
                     const btn = row.querySelector(`#${ctrl.id}`);
                     btn.onclick = () => {
                         if (ctrl.onClick) ctrl.onClick();
                     };
                } else if (ctrl.type === 'select') {
                    row.innerHTML = `
                        <div class="setting-header">
                            <label>${ctrl.label}</label>
                        </div>
                        <select id="${ctrl.id}" class="setting-select">
                            ${ctrl.options.map(opt => `<option value="${opt.value}" ${opt.value === ctrl.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                        </select>
                    `;
                    panel.appendChild(row);
                    
                    const select = row.querySelector('select');
                    select.onchange = (e) => {
                        if (ctrl.onChange) ctrl.onChange(e.target.value);
                    };
                } else if (ctrl.type === 'info') {
                    row.classList.add('setting-item-info');
                    row.innerHTML = `
                        <div class="setting-info-label">${ctrl.label || 'Info'}</div>
                        <div class="setting-info-value">${ctrl.value || ''}</div>
                    `;
                    panel.appendChild(row);
                }
            });
        }

        // On mobile, always start from top so the first controls are visible.
        if (!isDesktop) {
            panel.scrollTop = 0;
        }
    },

    setCaseMode(mode = 'display') {
        this.currentCaseMode = mode === 'interactive' ? 'interactive' : 'display';
        const displayPanel = document.getElementById('display-controls');
        const interactivePanel = document.getElementById('interactive-controls');
        if (displayPanel) displayPanel.classList.toggle('active', this.currentCaseMode === 'display');
        if (interactivePanel) interactivePanel.classList.toggle('active', this.currentCaseMode === 'interactive');
        document.body.setAttribute('data-case-mode', this.currentCaseMode);
    },

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('visible');
        if (panel.classList.contains('visible') && window.innerWidth <= 1024) {
            panel.scrollTop = 0;
        }
    },

    toggleCinematicMode() {
        document.body.classList.toggle('hide-ui');
        this.updateCinematicButton();
        // Ensure dock is hidden/shown (handled by CSS, but resizing might be needed)
        if (this.currentCase && this.currentCase.resize) this.currentCase.resize();
    },

    updateCinematicButton() {
        const isHidden = document.body.classList.contains('hide-ui');
        const dockBtn = document.getElementById('btn-hide-ui');
        const exitBtn = document.getElementById('ui-toggle-btn');
        if (dockBtn) {
            dockBtn.textContent = isHidden ? '⤡' : '⤢';
            dockBtn.title = isHidden ? 'Exit Full Screen' : 'Enter Full Screen';
        }
        if (exitBtn) {
            exitBtn.style.display = isHidden ? 'block' : 'none';
        }
    },

    // --- Single source of truth for play button state ---
    getPlayLabel() {
        const c = this.currentCase;
        if (this.currentCaseMode === 'interactive' && c) {
            if (c.searchInProgress && !c.searchPaused) return { icon: '❚❚', text: 'Hold', running: true };
            if (c.searchPaused) return { icon: '▶', text: 'Resume', running: false };
            return { icon: '▶', text: 'Go', running: false };
        }
        return this.isRunning
            ? { icon: '❚❚', text: 'Pause', running: true }
            : { icon: '▶', text: 'Resume', running: false };
    },

    syncPlayButton() {
        const state = this.getPlayLabel();
        this.isRunning = state.running;
        const btn = document.getElementById('btn-play');
        if (btn) {
            btn.innerHTML = `<span>${state.icon}</span> <span>${state.text}</span>`;
            btn.classList.toggle('paused', !state.running);
        }
    },

    resetCase() {
        if (this.currentCase && this.currentCase.reset) {
            this.currentCase.reset();
            this.recordingStartMs = Date.now();
            // Auto-play on reset unless case forbids it
            if (!this.isRunning && this.currentCase.autoPlayOnReset !== false) {
                 this.togglePlay();
            } else {
                 this.syncPlayButton();
            }
            if (window.audioManager) {
                window.audioManager.syncWithPlaybackState(this.isRunning);
            }
            this.updateControls();
        }
    },

    togglePlay() {
        this.isRunning = !this.isRunning;

        if (this.isRunning) {
            if (this.currentCase && this.currentCase.start) this.currentCase.start();
        } else {
            if (this.currentCase && this.currentCase.stop) this.currentCase.stop();
        }

        this.syncPlayButton();

        if (window.audioManager) {
            if (this.isRunning) {
                const track = this.getCurrentTrack();
                if (!window.audioManager.currentTrack && track && !window.audioManager.isMuted) {
                    window.audioManager.play(track);
                } else {
                    window.audioManager.syncWithPlaybackState(true);
                }
            } else {
                window.audioManager.syncWithPlaybackState(false);
            }
        }
        this.updateControls();
    },

    // --- Idle & Global ---

    setupIdleSystem() {
        const stopAnimation = () => {
            this.isIdle = true;
            this.isRunning = false; // Sync global state
            if (this.currentCase && this.currentCase.stop) {
                this.currentCase.stop();
            }
            document.getElementById('sleep-overlay').style.display = 'flex';
            this.syncPlayButton(); // Update UI button status
        };

        const resetIdleTimer = () => {
            if (this.isIdle) {
                this.isIdle = false;
                document.getElementById('sleep-overlay').style.display = 'none';
                // Removed: Automatic start() call. Now requires manual user action to resume.
                this.syncPlayButton(); // Update UI to reflect it's currently stopped
            }
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(stopAnimation, this.IDLE_TIMEOUT);
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, resetIdleTimer, true);
        });

        this.idleTimer = setTimeout(stopAnimation, this.IDLE_TIMEOUT);
    },

    setupGlobalEvents() {
         // ESC to exit cinematic mode or toggle recording
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.body.classList.contains('hide-ui')) {
                    this.toggleCinematicMode();
                } else {
                   // Optional: Toggle Recording Mode logic if we want to keep it
                   // this.toggleRecording(); 
                }
            }
        });
    },
    
    resetIdleTimer() {
        window.dispatchEvent(new Event('mousedown')); 
    },

    loadCase(caseInstance, options = {}) {
        if (this.currentCase && this.currentCase.destroy) {
            this.currentCase.destroy();
        }

        this.setCaseMode(options.mode || 'display');

        this.currentCase = caseInstance;
        this.currentCase.init();
        this.selectCaseTrack();
        
        // Generate UI for this case
        this.updateControls();
        
        // Switch Music if defined
        const track = this.getCurrentTrack();
        if (track && window.audioManager) {
             this.recordingStartMs = Date.now();
             window.audioManager.play(track, { forceSwitch: true });
        }
        this.syncAudioButton();
        
        // Reset Play State (case can opt-in to paused start)
        this.isRunning = this.currentCase.startPausedOnLoad === true ? false : true;

        if (this.isRunning && this.currentCase.start) {
            this.currentCase.start();
        } else if (this.currentCase.stop) {
            this.currentCase.stop();
        }

        this.syncPlayButton();
        this.updateControls();

        if (window.audioManager) {
            window.audioManager.syncWithPlaybackState(this.isRunning);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Core.init());
