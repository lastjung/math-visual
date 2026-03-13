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
        const refreshIncrementalModes = () => {
            if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
        };

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
            density: { speed: 0.2, min: 20, max: 1000, get: () => app.rayNumber },
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
            refreshIncrementalModes();
            this.update(app);
        };

        const rangeRotation = document.getElementById('range-rotation');
        rangeRotation.oninput = (e) => {
            app.sourceRotation = parseFloat(e.target.value);
            refreshIncrementalModes();
            this.update(app);
        };


        const rangeDensity = document.getElementById('range-density');
        rangeDensity.oninput = (e) => {
            app.rayNumber = parseInt(e.target.value);
            app.autoModes.density = false;
            refreshIncrementalModes();
            this.update(app);
        };

        const rangeSpeed = document.getElementById('range-speed');
        rangeSpeed.oninput = (e) => {
            app.raySpeed = parseFloat(e.target.value);
            app.autoModes.speed = false;
            this.update(app);
        };

        const rangeBeamWidth = document.getElementById('range-beam-width');
        if (rangeBeamWidth) {
            rangeBeamWidth.oninput = (e) => {
                app.beamWidth = parseFloat(e.target.value);
                this.update(app);
            };
        }

        const rangeSpread = document.getElementById('range-spread');
        rangeSpread.oninput = (e) => {
            app.spread = parseFloat(e.target.value);
            app.autoModes.spread = false;
            refreshIncrementalModes();
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
                app.persistState();
                this.update(app);
            };
        }

        const btnSim = document.getElementById('btn-sim');
        if (btnSim) {
            btnSim.onclick = () => app.startNarrativeSimulation();
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
                app.normalizeLightSourceMode();
                if (app.shape === 'parabola' && app.lightSourceMode === 'point') {
                    app.sourcePos = app.getShapeDefaults('parabola').sourcePos;
                }
                refreshIncrementalModes();
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
        // Render Mode Mini Tabs
        document.querySelectorAll('#group-render-mode .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                const val = e.target.dataset.value;
                app.isPaintMode = (val === 'paint1');
                app.isPaint2Mode = (val === 'paint2');
                app.isLightMode = (val === 'light');
                app.normalizeLightSourceMode();
                if (app.isPaint2Mode || app.isLightMode) app.resetRays(false); 
                this.update(app);
            };
        });

        const toggleFullscreen = () => {
            const prevSize = app.getShapeSize();
            const prevSourcePos = { ...app.sourcePos };
            const prevDefault = app.getShapeDefaults(app.shape).sourcePos;
            const distToPrevDefault = Math.hypot(
                prevSourcePos.x - prevDefault.x,
                prevSourcePos.y - prevDefault.y
            );

            document.body.classList.toggle('window-full');
            app.isWindowFull = document.body.classList.contains('window-full');

            // Wait for DOM reflow to get accurate new dimensions
            setTimeout(() => {
                app.resize();
                const nextSize = app.getShapeSize();
                const nextDefault = app.getShapeDefaults(app.shape).sourcePos;
                const scale = prevSize > 0 ? nextSize / prevSize : 1;
                
                // Adaptive Snap: If it was at a focus/default, keep it there. Else, scale it.
                const snapThreshold = Math.max(8, prevSize * 0.04);
                if (distToPrevDefault <= snapThreshold) {
                    app.sourcePos = { ...nextDefault };
                } else {
                    app.sourcePos = {
                        x: prevSourcePos.x * scale,
                        y: prevSourcePos.y * scale
                    };
                }

                app.sanitizeSourcePosition();
                app.recalcParallelRange();
                refreshIncrementalModes();
                this.update(app);
            }, 60);
        };

        const btnWindowFull = document.getElementById('apple-fullscreen');
        if (btnWindowFull) {
            btnWindowFull.onclick = () => toggleFullscreen();
        }

        const btnSideToggle = document.getElementById('apple-sidebar-toggle');
        if (btnSideToggle) {
            btnSideToggle.onclick = () => {
                const rightSidebar = document.getElementById('right-sidebar');
                const leftSidebar = document.getElementById('left-sidebar');
                if (rightSidebar) {
                    rightSidebar.classList.toggle('hidden');
                }
                if (leftSidebar) {
                    leftSidebar.classList.toggle('hidden');
                }
                app.resize();
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

            if (e.key === 'Escape') {
                const rightSidebar = document.getElementById('right-sidebar');
                const leftSidebar = document.getElementById('left-sidebar');
                if (rightSidebar) rightSidebar.classList.remove('hidden');
                if (leftSidebar) leftSidebar.classList.remove('hidden');

                // Correctly exit Full Window mode on Esc with inverse scaling
                if (document.body.classList.contains('window-full')) {
                    toggleFullscreen();
                }
                return;
            }

            if (e.code === 'KeyS') {
                sHeld = true;
                return;
            }
            if (e.code === 'KeyA') {
                aHeld = true;
                return;
            }

            if (aHeld && e.code === 'Digit3') {
                e.preventDefault();
                app["3_beam_spread_simm"]();
                return;
            }

            if (aHeld && e.code === 'Digit4') {
                e.preventDefault();
                app["4_ray_mum_simm"]();
                return;
            }

            if (sHeld && e.code === 'Digit0') {
                e.preventDefault();
                app.startNarrativeSimulation();
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
        let dragTarget = 'center'; // 'center', 'min', or 'max'

        const handleInteraction = (e) => {
            const rect = app.canvas.getBoundingClientRect();
            const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0].clientX);
            const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0].clientY);
            
            if (clientX === undefined) return;

            const x = clientX - rect.left - rect.width/2;
            const y = clientY - rect.top - (rect.height/2 - 60); // Sync with renderer's centerY shift

            if (e.type === 'mousedown' || e.type === 'touchstart') {
                const sX = app.sourcePos.x;
                const sY = app.sourcePos.y;
                
                // Identify target
                if (app.lightSourceMode === 'parallel') {
                    const cosR = Math.cos(app.sourceRotation);
                    const sinR = Math.sin(app.sourceRotation);
                    const { min, max } = app.parallelRange;
                    
                    const h1 = { x: sX + min * cosR, y: sY + min * sinR };
                    const h2 = { x: sX + max * cosR, y: sY + max * sinR };
                    
                    const d0 = Math.sqrt((x - sX)**2 + (y - sY)**2);
                    const d1 = Math.sqrt((x - h1.x)**2 + (y - h1.y)**2);
                    const d2 = Math.sqrt((x - h2.x)**2 + (y - h2.y)**2);
                    
                    if (d1 < 30) {
                        isDragging = true; dragTarget = 'min';
                    } else if (d2 < 30) {
                        isDragging = true; dragTarget = 'max';
                    } else if (d0 < 40) {
                        isDragging = true; dragTarget = 'center';
                    }
                } else {
                    const d0 = Math.sqrt((x - sX)**2 + (y - sY)**2);
                    if (d0 < 50) {
                        isDragging = true; dragTarget = 'center';
                    }
                }

                if (isDragging) {
                    app.autoModes.revolution = false;
                    app.autoModes.rotation = false; // Kill auto rotation if we grab and move
                    if (e.cancelable) e.preventDefault();
                }
            } else if (isDragging && (e.type === 'mousemove' || e.type === 'touchmove')) {
                if (dragTarget === 'center') {
                    app.sourcePos = { x, y };
                } else {
                    // Update Range and Rotation
                    const dx = x - app.sourcePos.x;
                    const dy = y - app.sourcePos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const newAngle = Math.atan2(dy, dx);
                    
                    if (dragTarget === 'min') {
                        app.parallelRange.min = -dist;
                        app.sourceRotation = Math.atan2(-dy, -dx); 
                    } else if (dragTarget === 'max') {
                        app.parallelRange.max = dist;
                        app.sourceRotation = Math.atan2(dy, dx);
                    }
                }
                refreshIncrementalModes();
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

        if (document.getElementById('val-beam-width')) document.getElementById('val-beam-width').textContent = app.beamWidth.toFixed(1);
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
        document.querySelectorAll('#group-render-mode .mini-tab').forEach(btn => {
            let activeVal = 'none';
            if (app.isPaintMode) activeVal = 'paint1';
            else if (app.isPaint2Mode) activeVal = 'paint2';
            else if (app.isLightMode) activeVal = 'light';
            
            const isActive = btn.dataset.value === activeVal;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });

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

        this.syncNarrativeSelect(app);

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

    syncNarrativeSelect(app) {
        const sNarrative = document.getElementById('select-narrative');
        if (sNarrative) {
            sNarrative.value = app.currentNarrative || 'none';
        }
    },

    setupApplePlayer(app) {
        const player = document.getElementById('apple-player');
        const restoreTab = document.getElementById('apple-player-restore');
        const grip = document.getElementById('player-grip');
        const btnPlay = document.getElementById('apple-play');
        const volSlider = document.getElementById('apple-volume');

        const showPlayer = () => {
            player.classList.remove('hidden');
            if (restoreTab) restoreTab.classList.add('hidden');
        };

        const hidePlayer = () => {
            player.classList.add('hidden');
            if (restoreTab) restoreTab.classList.remove('hidden');
        };

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
                hidePlayer();
            };
        }

        if (restoreTab) {
            restoreTab.onclick = () => {
                showPlayer();
            };
        }

        // Sidebar Drag Logic
        const setupSidebarDrag = (sidebarId, gripId) => {
            const sidebar = document.getElementById(sidebarId);
            const grip = document.getElementById(gripId);
            let isDragging = false;
            let startX, startY;

            if (grip && sidebar) {
                grip.onmousedown = (e) => {
                    isDragging = true;
                    startX = e.clientX - sidebar.offsetLeft;
                    startY = e.clientY - sidebar.offsetTop;
                    sidebar.style.transition = 'none';
                };

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    sidebar.style.left = (e.clientX - startX) + 'px';
                    sidebar.style.top = (e.clientY - startY) + 'px';
                    sidebar.style.right = 'auto';
                });

                window.addEventListener('mouseup', () => {
                    if (isDragging) {
                        isDragging = false;
                        sidebar.style.transition = 'opacity 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    }
                });
            }
        };

        setupSidebarDrag('left-sidebar', 'sidebar-grip-left');
        setupSidebarDrag('right-sidebar', 'sidebar-grip-right');

        const setupSidebarClose = (sidebarId, closeBtnId) => {
            const sidebar = document.getElementById(sidebarId);
            const btn = document.getElementById(closeBtnId);
            if (sidebar && btn) {
                btn.onclick = () => {
                    sidebar.classList.add('hidden');
                };
            }
        };

        setupSidebarClose('left-sidebar', 'sidebar-close-left');
        setupSidebarClose('right-sidebar', 'sidebar-close-right');


    }
};
