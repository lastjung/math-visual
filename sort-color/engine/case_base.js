const SortColorCaseBase = {
    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        if (typeof this.bindCanvasInteractions === 'function') {
            this.bindCanvasInteractions();
        }
        this.resize();
        this.draw();
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },

    start() {
        if (this.animationId) return;
        this.lastTimeMs = performance.now();
        const loop = (now) => {
            const dt = Math.min(0.05, (now - this.lastTimeMs) / 1000);
            this.lastTimeMs = now;
            
            // Global color scheme flow update
            if (typeof ColorSchemeManager !== 'undefined') {
                ColorSchemeManager.update(dt);
            }

            this.updateSimulation(dt);
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    },

    setPaused(paused) {
        this.isPaused = !!paused;
        this.lastTimeMs = performance.now();
    },

    stop() {
        if (!this.animationId) return;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },

    destroy() {
        if (typeof this.unbindCanvasInteractions === 'function') {
            this.unbindCanvasInteractions();
        }
        this.stop();
    },

    updateShuffleFlash(dt) {
        if (this.shuffleFlash > 0) {
            this.shuffleFlash = Math.max(0, this.shuffleFlash - dt * 1.8);
        }
    },

    positiveMod(v, n) {
        if (n <= 0) return 0;
        return ((v % n) + n) % n;
    },

    gcd(a, b) {
        let x = Math.abs(Math.floor(a));
        let y = Math.abs(Math.floor(b));
        if (!x) return y;
        if (!y) return x;
        while (y !== 0) {
            const t = x % y;
            x = y;
            y = t;
        }
        return x;
    }
};
