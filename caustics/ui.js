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

        // Shape Tabs
        document.querySelectorAll('.shape-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.shape = e.target.dataset.shape;
                document.querySelectorAll('.shape-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // 새로운 탭(도형)으로 변경될 때 이전 동작 정지
                app.isAnimating = false;
                // app.growth = 0; 
                this.update(app);
            };
        });

        // Color Mode Tabs
        document.querySelectorAll('.mode-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.colorMode = e.target.dataset.mode;
                document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
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
            spread: { speed: 0.3, min: 0.1, max: 5.0, get: () => app.spread },
            reflections: { speed: 0.1, min: 1, max: 20, get: () => app.MAX_BOUNCES }
        };

        Object.entries(autoLabels).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) {
                el.onclick = () => {
                    app.autoModes[key] = !app.autoModes[key];
                    if (app.autoModes[key]) {
                        // Calculate phase to start seamlessly from current value
                        const cfg = config[key];
                        const current = cfg.get();
                        const norm = (current - cfg.min) / (cfg.max - cfg.min);
                        // Solve: sin(t * speed + phase) * 0.5 + 0.5 = norm
                        // sin(...) = (norm - 0.5) * 2
                        const targetSin = Math.max(-1, Math.min(1, (norm - 0.5) * 2));
                        app.autoPhases[key] = Math.asin(targetSin) - app.autoTimer * cfg.speed;
                    }
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

        const checkAxes = document.getElementById('check-axes');
        if (checkAxes) {
            checkAxes.onchange = (e) => {
                app.showAxes = e.target.checked;
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

        // Reset
        document.getElementById('btn-reset').onclick = () => app.reset();

        // Flow (Play/Hold) Toggle
        const btnPlay = document.getElementById('btn-play');
        btnPlay.onclick = () => {
            app.isFlowing = !app.isFlowing;
            this.update(app);
        };

        // Emit (Always Power ON & Reset)
        const btnEmit = document.getElementById('btn-light');
        const triggerEmit = () => {
            app.isLightVisible = true;
            app.growth = 0;
            app.isFlowing = true;
            app.emitStartTime = performance.now();
            this.update(app);
        };

        btnEmit.onclick = triggerEmit;

        // Keyboard Shortcuts
        const keyMap = {
            'Digit1': 'revolution',
            'Digit2': 'rotation',
            'Digit3': 'spread',
            'Digit4': 'density',
            'Digit5': 'speed',
            'Digit6': 'reflections'
        };

        window.addEventListener('keydown', (e) => {
            // Space bar shortcut for Emit
            if (e.code === 'Space') {
                e.preventDefault(); 
                triggerEmit();
                return;
            }

            // Digit keys for Auto Modes
            const autoKey = keyMap[e.code];
            if (autoKey) {
                e.preventDefault();
                app.autoModes[autoKey] = !app.autoModes[autoKey];
                
                if (app.autoModes[autoKey]) {
                    const cfg = config[autoKey];
                    const current = cfg.get();
                    const norm = (current - cfg.min) / (cfg.max - cfg.min);
                    const targetSin = Math.max(-1, Math.min(1, (norm - 0.5) * 2));
                    app.autoPhases[autoKey] = Math.asin(targetSin) - app.autoTimer * cfg.speed;
                }
                this.update(app);
                return;
            }

            // Left Arrow for Reset
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                app.reset();
            }
        });

        // Mouse/Touch Interaction
        let isDragging = false;
        const handleInteraction = (e) => {
            const rect = app.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (clientX === undefined) return;

            const x = clientX - rect.left - rect.width/2;
            const y = clientY - rect.top - rect.height/2;

            if (e.type === 'mousedown' || e.type === 'touchstart') {
                const dist = Math.sqrt((x - app.sourcePos.x)**2 + (y - app.sourcePos.y)**2);
                if (dist < 50) {
                    isDragging = true;
                    app.autoModes.revolution = false;
                    if (e.cancelable) e.preventDefault();
                }
            }

            if (isDragging) {
                app.sourcePos = { x, y };
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
        const valSpread = document.getElementById('val-spread');
        if (valSpread.textContent !== spreadText) valSpread.textContent = spreadText;

        document.getElementById('range-reflections').value = app.MAX_BOUNCES;
        const valReflections = document.getElementById('val-reflections');
        if (valReflections.textContent != app.MAX_BOUNCES) valReflections.textContent = app.MAX_BOUNCES;

        const playIcon = document.getElementById('play-icon');
        const playText = document.getElementById('play-text');
        const playHtml = app.isFlowing 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            
        if (playIcon.innerHTML !== playHtml) playIcon.innerHTML = playHtml;
        
        const nPlayText = app.isFlowing ? 'Hold' : 'Go';
        if (playText.textContent !== nPlayText) playText.textContent = nPlayText;

        const lightText = document.getElementById('light-text');
        const btnLight = document.getElementById('btn-light');
        btnLight.classList.toggle('active', app.isLightVisible);
        if (lightText.textContent !== 'Emit') lightText.textContent = 'Emit';

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

        // Update Checkboxes
        const cTrail = document.getElementById('check-trail');
        const cTaper = document.getElementById('check-taper');
        const cBloom = document.getElementById('check-bloom');
        
        if (cTrail.checked !== app.useTrail) cTrail.checked = app.useTrail;
        if (cTaper.checked !== app.useTaper) cTaper.checked = app.useTaper;
        if (cBloom.checked !== app.useBloom) cBloom.checked = app.useBloom;
    }
};
