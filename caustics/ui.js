/**
 * LIGHT FLOW LAB: UI Module
 * Handles event listeners and UI updates
 */

export const UI = {
    /**
     * Bind all DOM events to App actions
     */
    setupEvents(app) {
        window.addEventListener('resize', () => app.resize());
        this.setupApplePlayer(app);

        // Shape Tabs
        document.querySelectorAll('.shape-tab').forEach(btn => {
            btn.onclick = (e) => {
                const button = e.currentTarget;
                const nextShape = button.dataset.shape;
                app.shape = nextShape;
                document.querySelectorAll('.shape-tab').forEach(b => b.classList.remove('active'));
                button.classList.add('active');

                app.applyShapeSwitchReset(nextShape);
                app.recalcParallelRange(); // Calculate new range for Parallel mode
                this.update(app);
            };
        });

        // Color Mode Tabs
        document.querySelectorAll('.mode-tab').forEach(btn => {
            btn.onclick = (e) => {
                const button = e.currentTarget;
                app.colorMode = button.dataset.mode;
                document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            };
        });

        // Auto Mode Toggles
        const autoLabels = {
            'label-revolution': 'revolution',
            'label-rotation': 'rotation',
            'label-density': 'density',
            'label-speed': 'speed',
            'label-spread': 'spread',
            'label-reflections': 'reflections'
        };

        const config = {
            revolution: { speed: 0.1, min: -Math.PI, max: Math.PI, get: () => Math.atan2(app.sourcePos.y, app.sourcePos.x) },
            rotation: { speed: 0.15, min: -Math.PI, max: Math.PI, get: () => app.sourceRotation },
            density: { speed: 0.2, min: 20, max: 500, get: () => app.rayNumber },
            speed: { speed: 0.1, min: 0, max: 100, get: () => app.raySpeed },
            spread: { speed: 0.15, min: 0, max: Math.PI * 2, get: () => app.spread },
            reflections: { speed: 0.1, min: 1, max: 20, get: () => app.MAX_BOUNCES }
        };

        const setAutoMode = (key, enabled) => {
            app.autoModes[key] = enabled;
            if (!enabled) return;
            const cfg = config[key];
            const current = cfg.get();
            const norm = (current - cfg.min) / (cfg.max - cfg.min);
            const targetSin = Math.max(-1, Math.min(1, (norm - 0.5) * 2));
            app.autoPhases[key] = Math.asin(targetSin) - app.autoTimer * cfg.speed;
        };

        Object.entries(autoLabels).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) {
                el.onclick = () => {
                    setAutoMode(key, !app.autoModes[key]);
                    this.update(app);
                };
            }
        });

        // Sliders
        const rangeSource = document.getElementById('range-source');
        
        rangeSource.oninput = (e) => {
            const angle = parseFloat(e.target.value);
            const dist = Math.sqrt(app.sourcePos.x**2 + app.sourcePos.y**2);
            app.sourcePos = {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            };
            app.autoModes.revolution = false;
            this.update(app);
        };

        const rangeRotation = document.getElementById('range-rotation');
        rangeRotation.oninput = (e) => {
            app.sourceRotation = parseFloat(e.target.value);
            app.autoModes.rotation = false; // Stop auto-rotating on manual input
            this.update(app);
        };


        const rangeDensity = document.getElementById('range-density');
        rangeDensity.oninput = (e) => {
            app.rayNumber = parseInt(e.target.value);
            app.autoModes.density = false;
            this.update(app);
        };

        const rangeSpeed = document.getElementById('range-speed');
        rangeSpeed.oninput = (e) => {
            app.raySpeed = parseInt(e.target.value);
            app.autoModes.speed = false;
            this.update(app);
        };

        const rangeSpread = document.getElementById('range-spread');
        rangeSpread.oninput = (e) => {
            app.spread = parseFloat(e.target.value);
            app.autoModes.spread = false;
            this.update(app);
        };

        const rangeReflections = document.getElementById('range-reflections');
        if (rangeReflections) {
            rangeReflections.oninput = (e) => {
                app.MAX_BOUNCES = parseInt(e.target.value);
                app.autoModes.reflections = false;
                this.update(app);
            };
        }

        const rangeAlpha = document.getElementById('range-alpha');
        if (rangeAlpha) {
            rangeAlpha.oninput = (e) => {
                app.alphaIntensity = parseFloat(e.target.value);
                this.update(app);
            };
        }

        const checkAxes = document.getElementById('check-axes');
        if (checkAxes) {
            checkAxes.onchange = (e) => {
                app.showAxes = e.target.checked;
                this.update(app);
            };
        }

        const selectNarrative = document.getElementById('select-narrative');
        if (selectNarrative) {
            selectNarrative.onchange = (e) => {
                app.currentNarrative = e.target.value;
                app.saveToPersist(); // Force save immediately
                this.update(app);
            };
        }

        // Base Style Mini Tabs
        document.querySelectorAll('#group-base .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.baseStyle = e.target.dataset.value;
                this.update(app);
            };
        });

        // Flow Mode Mini Tabs
        document.querySelectorAll('#group-flow .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.flowMode = e.target.dataset.value;
                this.update(app);
            };
        });

        // Source Mode Mini Tabs
        document.querySelectorAll('#group-source-mode .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.lightSourceMode = e.target.dataset.value;
                this.update(app);
            };
        });

        // Effects Checkboxes
        document.getElementById('check-trail').onchange = (e) => {
            app.useTrail = e.target.checked;
            this.update(app);
        };
        document.getElementById('check-taper').onchange = (e) => {
            app.useTaper = e.target.checked;
            this.update(app);
        };
        document.getElementById('check-bloom').onchange = (e) => {
            app.useBloom = e.target.checked;
            this.update(app);
        };
        document.getElementById('check-paint').onchange = (e) => {
            app.isPaintMode = e.target.checked;
            this.update(app);
        };

        const btnWindowFull = document.getElementById('apple-fullscreen');
        if (btnWindowFull) {
            btnWindowFull.onclick = () => {
                document.body.classList.toggle('window-full');
                app.isWindowFull = document.body.classList.contains('window-full');
                
                // Automatically re-align light source to New Foci positions
                app.syncSourceToFoci();
                
                app.recalcParallelRange();
                setTimeout(() => app.resize(), 50);
            };
        }

        const btnSideToggle = document.getElementById('apple-sidebar-toggle');
        if (btnSideToggle) {
            btnSideToggle.onclick = () => {
                const sidebar = document.querySelector('.controls-sidebar');
                if (sidebar) {
                    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
                    app.resize();
                }
            };
        }



        // Keyboard Shortcuts
        const keyMap = {
            'Digit1': 'revolution',
            'Digit2': 'rotation',
            'Digit3': 'spread',
            'Digit4': 'density',
            'Digit5': 'speed',
            'Digit6': 'reflections'
        };
        let sHeld = false;
        let aHeld = false;

        window.addEventListener('keydown', (e) => {
            const target = e.target;
            const isTyping =
                target &&
                (target.tagName === 'INPUT' ||
                 target.tagName === 'TEXTAREA' ||
                 target.isContentEditable);
            if (isTyping) return;

            if (e.code === 'KeyS') {
                sHeld = true;
                return;
            }
            if (e.code === 'KeyA') {
                aHeld = true;
                return;
            }

            if (aHeld && e.code === 'Digit4') {
                e.preventDefault();
                app["4_ray_mum_simm"]();
                return;
            }

            // Space bar shortcut for Go / Hold
            if (e.code === 'Space') {
                e.preventDefault(); 
                app.toggleFlow();
                return;
            }

            // Digit keys for Auto Modes
            const autoKey = keyMap[e.code];
            if (autoKey && sHeld) {
                e.preventDefault();
                app.autoModes[autoKey] = !app.autoModes[autoKey];
                setAutoMode(autoKey, app.autoModes[autoKey]);
                this.update(app);
                return;
            }

            // Shift + Left Arrow for Reset (safer than plain ArrowLeft)
            if (e.code === 'ArrowLeft' && e.shiftKey) {
                e.preventDefault();
                app.reset();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyS') sHeld = false;
            if (e.code === 'KeyA') aHeld = false;
        });

        // Mouse/Touch Interaction
        let isDragging = false;
        const handleInteraction = (e) => {
            const rect = app.canvas.getBoundingClientRect();
            const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0].clientX);
            const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0].clientY);
            
            if (clientX === undefined) return;

            const x = clientX - rect.left - rect.width/2;
            const y = clientY - rect.top - (rect.height/2 - 60); // Sync with renderer's centerY shift

            if (e.type === 'mousedown' || e.type === 'touchstart') {
                // Check if click is near the existing source (50px hit radius)
                const dist = Math.sqrt((x - app.sourcePos.x)**2 + (y - app.sourcePos.y)**2);
                if (dist < 50) {
                    isDragging = true;
                    app.autoModes.revolution = false;
                    if (e.cancelable) e.preventDefault();
                }
            } else if (isDragging && (e.type === 'mousemove' || e.type === 'touchmove')) {
                app.sourcePos = { x, y };
                app.recalcParallelRange(); // Update range while moving
                this.update(app);
            }
        };

        const stopDragging = () => isDragging = false;

        app.canvas.addEventListener('mousedown', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mouseup', stopDragging);
        app.canvas.addEventListener('touchstart', handleInteraction, { passive: false });
        window.addEventListener('touchmove', handleInteraction, { passive: false });
        window.addEventListener('touchend', stopDragging);
    },

    /**
     * Update DOM elements to match current state
     */
    update(app) {
        const updateAutoLabel = (id, iconId, isActive) => {
            const el = document.getElementById(id);
            const icon = document.getElementById(iconId);
            if (!el || !icon) return;
            el.classList.toggle('active', isActive);
            
            // Toggle red highlight on the entire row
            const row = el.closest('.setting-row');
            if (row) row.classList.toggle('auto-active', isActive);

            const html = isActive 
                ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
                : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (icon.innerHTML !== html) icon.innerHTML = html;
        };

        updateAutoLabel('label-revolution', 'animate-icon-mini', app.autoModes.revolution);
        updateAutoLabel('label-rotation', 'rotate-icon-mini', app.autoModes.rotation);
        updateAutoLabel('label-density', 'density-icon-mini', app.autoModes.density);
        updateAutoLabel('label-speed', 'speed-icon-mini', app.autoModes.speed);
        updateAutoLabel('label-spread', 'spread-icon-mini', app.autoModes.spread);
        updateAutoLabel('label-reflections', 'reflections-icon-mini', app.autoModes.reflections);

        const angle = Math.atan2(app.sourcePos.y, app.sourcePos.x);
        const rangeSource = document.getElementById('range-source');
        // Only update input if it's materially different to prevent interfering with dragging
        if (Math.abs(parseFloat(rangeSource.value) - angle) > 0.02) rangeSource.value = angle;
        
        const degText = `${(angle * 180 / Math.PI).toFixed(0)}°`;
        const valSource = document.getElementById('val-source');
        if (valSource.textContent !== degText) valSource.textContent = degText;

        const valRotation = document.getElementById('val-rotation');
        const rotDeg = `${(app.sourceRotation * 180 / Math.PI).toFixed(0)}°`;
        

        if (valRotation.textContent !== rotDeg) {
            valRotation.textContent = rotDeg;
            document.getElementById('range-rotation').value = app.sourceRotation;
        }
        
        document.getElementById('range-density').value = app.rayNumber;
        const valDensity = document.getElementById('val-density');
        if (valDensity.textContent != app.rayNumber) valDensity.textContent = app.rayNumber;

        document.getElementById('range-speed').value = app.raySpeed;
        const valSpeed = document.getElementById('val-speed');
        if (valSpeed.textContent != app.raySpeed) valSpeed.textContent = app.raySpeed;

        const spreadText = `${(app.spread * 180 / Math.PI).toFixed(0)}°`;
        document.getElementById('range-spread').value = app.spread;
        const valSpread = document.getElementById('val-spread');
        if (valSpread.textContent !== spreadText) valSpread.textContent = spreadText;

        document.getElementById('range-reflections').value = app.MAX_BOUNCES;
        const valReflections = document.getElementById('val-reflections');
        if (valReflections.textContent != app.MAX_BOUNCES) valReflections.textContent = app.MAX_BOUNCES;

        document.getElementById('range-alpha').value = app.alphaIntensity;
        const valAlpha = document.getElementById('val-alpha');
        const alphaText = `${app.alphaIntensity.toFixed(2)}x`;
        if (valAlpha.textContent !== alphaText) valAlpha.textContent = alphaText;

        const btnLight = document.getElementById('btn-light');
        if (btnLight) {
            btnLight.classList.toggle('light-on', app.isLightVisible);
            const lightText = document.getElementById('light-text');
            if (lightText && lightText.textContent !== 'Emit') lightText.textContent = 'Emit';
        }

        const btnSim = document.getElementById('btn-sim');
        const simIcon = document.getElementById('sim-icon');
        const simText = document.getElementById('sim-text');
        if (btnSim && simIcon && simText) {
            btnSim.classList.toggle('active', app.isSimulationMode);
            const simHtml = app.isSimulationMode
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
                : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (simIcon.innerHTML !== simHtml) simIcon.innerHTML = simHtml;
            const simLabel = app.isSimulationMode ? 'Sim On' : 'Sim Off';
            if (simText.textContent !== simLabel) simText.textContent = simLabel;
        }

        const checkAxes = document.getElementById('check-axes');
        if (checkAxes && checkAxes.checked !== app.showAxes) checkAxes.checked = app.showAxes;

        // Update Mini Tabs
        document.querySelectorAll('#group-base .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.baseStyle;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });
        document.querySelectorAll('#group-flow .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.flowMode;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });
        document.querySelectorAll('#group-source-mode .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.lightSourceMode;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });

        // Update Checkboxes
        const cTrail = document.getElementById('check-trail');
        const cTaper = document.getElementById('check-taper');
        const cBloom = document.getElementById('check-bloom');
        const cPaint = document.getElementById('check-paint');
        
        if (cTrail && cTrail.checked !== app.useTrail) cTrail.checked = app.useTrail;
        if (cTaper && cTaper.checked !== app.useTaper) cTaper.checked = app.useTaper;
        if (cBloom && cBloom.checked !== app.useBloom) cBloom.checked = app.useBloom;
        if (cPaint && cPaint.checked !== app.isPaintMode) cPaint.checked = app.isPaintMode;

        const sNarrative = document.getElementById('select-narrative');
        if (sNarrative) {
            // Strong sync: make sure dropdown matches state
            sNarrative.value = app.currentNarrative;
        }

        // Sync Apple Player
        const applePlay = document.getElementById('apple-play');
        const applePlayIcon = document.getElementById('apple-play-icon');
        if (applePlay) {
            applePlay.classList.toggle('active', app.isFlowing);
            const playHtml = app.isFlowing 
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (applePlayIcon.innerHTML !== playHtml) applePlayIcon.innerHTML = playHtml;
        }

        const appleVol = document.getElementById('apple-volume');
        if (appleVol && window.audioManager) {
            const currentVol = window.audioManager.targetVolume;
            if (Math.abs(parseFloat(appleVol.value) - currentVol) > 0.01) {
                appleVol.value = currentVol;
            }
        }

        const cycleDuration = 60;
        
        const appleTime = document.getElementById('apple-time-current');
        if (appleTime) {
            const timeVal = Math.floor(app.elapsedTime || 0);
            const mins = Math.floor(timeVal / 60);
            const secs = Math.floor(timeVal % 60);
            appleTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        const appleProgress = document.getElementById('apple-progress-bar');
        const appleTrackName = document.getElementById('apple-track-name');
        if (appleProgress) {
            const progress = (app.elapsedTime % cycleDuration) / cycleDuration * 100;
            appleProgress.style.width = `${progress}%`;
            
            if (appleTrackName && app.currentTrackName) {
                appleTrackName.textContent = app.currentTrackName;
            }
        }

        const bgmIcon = document.getElementById('apple-bgm-icon');
        if (bgmIcon && window.audioManager) {
            bgmIcon.style.opacity = window.audioManager.isMuted ? '0.3' : '1';
        }
    },

    setupApplePlayer(app) {
        const player = document.getElementById('apple-player');
        const grip = document.getElementById('player-grip');
        const btnPlay = document.getElementById('apple-play');
        const volSlider = document.getElementById('apple-volume');

        // Draggable Logic
        let isDragging = false;
        let startX, startY;

        grip.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX - player.offsetLeft;
            startY = e.clientY - player.offsetTop;
            player.style.bottom = 'auto'; // Disable bottom-fixed once moved
            player.style.transform = 'none'; 
            player.style.left = player.offsetLeft + 'px';
            player.style.top = player.offsetTop + 'px';
        };

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            player.style.left = (e.clientX - startX) + 'px';
            player.style.top = (e.clientY - startY) + 'px';
        });

        window.addEventListener('mouseup', () => isDragging = false);

        // Controls
        btnPlay.onclick = () => {
            app.toggleFlow();
            if (app.isFlowing) app.recalcParallelRange(); // Calculate once when play starts
        };

        const btnFullReset = document.getElementById('apple-full-reset');
        if (btnFullReset) {
            btnFullReset.onclick = () => {
                app.reset();
                app.recalcParallelRange();
            };
        }

        const btnPartialReset = document.getElementById('apple-partial-reset');
        if (btnPartialReset) {
            btnPartialReset.onclick = () => {
                app.resetRays(true);
                app.recalcParallelRange();
                this.update(app);
            };
        }

        const btnSpeedUp = document.getElementById('apple-speed-up');
        const btnSpeedDown = document.getElementById('apple-speed-down');
        
        if (btnSpeedUp) {
            btnSpeedUp.onclick = () => {
                app.simSpeedMultiplier *= 1.1;
                // Cap max multiplier for stability
                if (app.simSpeedMultiplier > 10.0) app.simSpeedMultiplier = 10.0;
                this.update(app);
            };
        }

        if (btnSpeedDown) {
            btnSpeedDown.onclick = () => {
                app.simSpeedMultiplier *= 0.9;
                // Cap min multiplier 
                if (app.simSpeedMultiplier < 0.1) app.simSpeedMultiplier = 0.1;
                this.update(app);
            };
        }
        
        volSlider.oninput = (e) => {
            if (window.audioManager) {
                window.audioManager.isMuted = false;
                window.audioManager.setTargetVolume(parseFloat(e.target.value));
                window.audioManager.resume();
            }
        };

        const btnNextTrack = document.getElementById('apple-next-track');
        if (btnNextTrack) {
            btnNextTrack.onclick = () => {
                app.nextBGM();
                this.update(app);
            };
        }

        const bgmIcon = document.getElementById('apple-bgm-icon');
        if (bgmIcon) {
            bgmIcon.onclick = () => {
                if (window.audioManager) {
                    const isMuted = window.audioManager.toggleMute();
                    bgmIcon.style.opacity = isMuted ? '0.3' : '1';
                }
            };
        }

        // Window Hide / Restore Logic
        const btnClose = document.getElementById('apple-player-close');
        if (btnClose) {
            btnClose.onclick = (e) => {
                e.stopPropagation();
                player.classList.add('hidden');
            };
        }

        // Sidebar Drag Logic
        const sidebar = document.querySelector('.controls-sidebar');
        const sidebarGrip = document.getElementById('sidebar-grip');
        let isSidebarDragging = false;
        let sidebarStartX, sidebarStartY;

        if (sidebarGrip && sidebar) {
            sidebarGrip.onmousedown = (e) => {
                isSidebarDragging = true;
                sidebarStartX = e.clientX - sidebar.offsetLeft;
                sidebarStartY = e.clientY - sidebar.offsetTop;
                sidebar.style.transition = 'none';
            };

            window.addEventListener('mousemove', (e) => {
                if (!isSidebarDragging) return;
                sidebar.style.left = (e.clientX - sidebarStartX) + 'px';
                sidebar.style.top = (e.clientY - sidebarStartY) + 'px';
                sidebar.style.right = 'auto'; // Reset initial right positioning
            });

            window.addEventListener('mouseup', () => {
                if (isSidebarDragging) {
                    isSidebarDragging = false;
                    sidebar.style.transition = 'opacity 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                }
            });
        }

        const btnSidebarClose = document.getElementById('sidebar-close');
        if (btnSidebarClose && sidebar) {
            btnSidebarClose.onclick = () => {
                sidebar.classList.add('hidden');
            };
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                player.classList.remove('hidden');
                if (sidebar) sidebar.classList.remove('hidden');

                // Exit Full Window mode on Esc
                if (document.body.classList.contains('window-full')) {
                    document.body.classList.remove('window-full');
                    app.isWindowFull = false;
                    app.recalcParallelRange();
                    setTimeout(() => app.resize(), 50);
                    this.update(app);
                }
            }
        });

    }
};
