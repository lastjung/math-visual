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

        // Animation Toggle
        const labelRevolution = document.getElementById('label-revolution');
        labelRevolution.onclick = () => {
            app.isAnimating = !app.isAnimating;
            this.update(app);
        };

        // Sliders
        const rangeSource = document.getElementById('range-source');
        
        rangeSource.oninput = (e) => {
            const angle = parseFloat(e.target.value);
            // 현재 광원과 중심 사이의 거리(반경)를 계산
            const dist = Math.sqrt(app.sourcePos.x**2 + app.sourcePos.y**2);
            
            // 거리를 유지하면서 각도만 업데이트
            app.sourcePos = {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            };
            app.isAnimating = false;
            this.update(app);
        };

        const rangeRotation = document.getElementById('range-rotation');
        rangeRotation.oninput = (e) => {
            app.sourceRotation = parseFloat(e.target.value);
            app.isAutoRotating = false; // Stop auto-rotating on manual input
            this.update(app);
        };

        const labelRotation = document.getElementById('label-rotation');
        labelRotation.onclick = () => {
            app.isAutoRotating = !app.isAutoRotating;
            this.update(app);
        };

        const rangeDensity = document.getElementById('range-density');
        rangeDensity.oninput = (e) => {
            app.rayNumber = parseInt(e.target.value);
            this.update(app);
        };

        const rangeSpeed = document.getElementById('range-speed');
        rangeSpeed.oninput = (e) => {
            app.raySpeed = parseInt(e.target.value);
            this.update(app);
        };

        const rangeSpread = document.getElementById('range-spread');
        rangeSpread.oninput = (e) => {
            app.spread = parseFloat(e.target.value);
            this.update(app);
        };

        const rangeReflections = document.getElementById('range-reflections');
        if (rangeReflections) {
            rangeReflections.oninput = (e) => {
                app.MAX_BOUNCES = parseInt(e.target.value);
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

        // Emit (Light Reset)
        const btnEmit = document.getElementById('btn-light');
        btnEmit.onclick = () => {
            app.isLightVisible = true;
            app.growth = 0;
            this.update(app);
        };

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
                    app.isAnimating = false;
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
        const labelRevolution = document.getElementById('label-revolution');
        const iconMini = document.getElementById('animate-icon-mini');
        
        labelRevolution.classList.toggle('active', app.isAnimating);

        const targetIconHTML = app.isAnimating 
            ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        
        if (iconMini.innerHTML !== targetIconHTML) iconMini.innerHTML = targetIconHTML;

        const angle = Math.atan2(app.sourcePos.y, app.sourcePos.x);
        const rangeSource = document.getElementById('range-source');
        // Only update input if it's materially different to prevent interfering with dragging
        if (Math.abs(parseFloat(rangeSource.value) - angle) > 0.02) rangeSource.value = angle;
        
        const degText = `${(angle * 180 / Math.PI).toFixed(0)}°`;
        const valSource = document.getElementById('val-source');
        if (valSource.textContent !== degText) valSource.textContent = degText;

        const valRotation = document.getElementById('val-rotation');
        const rotDeg = `${(app.sourceRotation * 180 / Math.PI).toFixed(0)}°`;
        
        const labelRotation = document.getElementById('label-rotation');
        const iconRotateMini = document.getElementById('rotate-icon-mini');
        
        labelRotation.classList.toggle('active', app.isAutoRotating);
        const rotateIconHTML = app.isAutoRotating 
            ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        
        if (iconRotateMini.innerHTML !== rotateIconHTML) iconRotateMini.innerHTML = rotateIconHTML;

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
        
        const nPlayText = app.isFlowing ? 'Hold' : 'Play';
        if (playText.textContent !== nPlayText) playText.textContent = nPlayText;

        const lightText = document.getElementById('light-text');
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
