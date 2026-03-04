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
        const btnAnimate = document.getElementById('btn-animate');
        btnAnimate.onclick = () => {
            app.isAnimating = !app.isAnimating;
            this.update(app);
        };

        // Sliders
        const rangeSource = document.getElementById('range-source');
        rangeSource.oninput = (e) => {
            const angle = parseFloat(e.target.value);
            const size = Math.min(app.canvas.width, app.canvas.height) * 0.35;
            app.sourcePos = {
                x: Math.cos(angle) * size * 0.95,
                y: Math.sin(angle) * size * 0.95
            };
            app.isAnimating = false;
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

        const checkAxes = document.getElementById('check-axes');
        if (checkAxes) {
            checkAxes.onchange = (e) => {
                app.showAxes = e.target.checked;
                this.update(app);
            };
        }

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
        const btnAnimate = document.getElementById('btn-animate');
        const icon = document.getElementById('animate-icon');
        const text = document.getElementById('animate-text');
        
        btnAnimate.classList.toggle('active', app.isAnimating);
        icon.innerHTML = app.isAnimating 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        text.textContent = app.isAnimating ? 'Auto Spin' : 'Manual';

        const angle = Math.atan2(app.sourcePos.y, app.sourcePos.x);
        document.getElementById('range-source').value = angle;
        document.getElementById('val-source').textContent = `${(angle * 180 / Math.PI).toFixed(0)}°`;
        
        document.getElementById('range-density').value = app.rayNumber;
        document.getElementById('val-density').textContent = app.rayNumber;

        document.getElementById('range-speed').value = app.raySpeed;
        document.getElementById('val-speed').textContent = app.raySpeed;

        document.getElementById('val-spread').textContent = `${(app.spread * 180 / Math.PI).toFixed(0)}°`;

        const playIcon = document.getElementById('play-icon');
        const playText = document.getElementById('play-text');
        playIcon.innerHTML = app.isFlowing 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        playText.textContent = app.isFlowing ? 'Hold' : 'Play';

        document.getElementById('light-text').textContent = 'Emit';

        const checkAxes = document.getElementById('check-axes');
        if (checkAxes) checkAxes.checked = app.showAxes;
    }
};
