const GoldbergSphereCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,
    isPaused: false,

    pointCount: 180,
    multiplier: 0,
    multiplierSpeed: 0,
    lineWidth: 1.2,
    lineAlpha: 0.88,
    pointRadius: 1.4,
    showPoints: false,
    showHud: true,
    integersOnly: false,
    colorMode: 'angle',
    renderMode: 'light',
    sortMode: 'off',
    sortingStatus: 'idle',
    sortSpeed: 150,
    sortProgress: 0,
    sortPlan: null,
    sortSignature: '',
    sortLockedState: null,
    sortPanelPosition: null,
    sortPanelDrag: null,
    shuffleNonce: 0,
    shuffleOrder: null,
    shuffleSignature: '',
    shuffleFlash: 0,
    rotation: -Math.PI / 2,
    learningMode: 'off',
    sphereFrequencyOverride: 0,

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.bindCanvasInteractions();
        this.resize();
        this.draw();
    },

    get uiConfig() {
        return [
            {
                type: 'slider',
                id: 'mc_sphere_count',
                label: 'Target Faces',
                min: 12,
                max: 1000,
                step: 1,
                value: this.pointCount,
                onChange: (v) => {
                    this.pointCount = Math.max(12, Math.floor(v));
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_sphere_freq',
                label: 'Frequency',
                min: 0,
                max: 10,
                step: 1,
                value: this.sphereFrequencyOverride,
                onChange: (v) => {
                    this.sphereFrequencyOverride = Math.max(0, Math.floor(v));
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_alpha',
                label: 'Face Alpha',
                min: 0.1,
                max: 1,
                step: 0.01,
                value: this.lineAlpha,
                onChange: (v) => {
                    this.lineAlpha = v;
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_render',
                label: 'Render',
                value: this.renderMode,
                options: [
                    { value: 'glow', label: 'LGT' },
                    { value: 'light', label: 'Source Over' }
                ],
                onChange: (v) => {
                    this.renderMode = v;
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_color',
                label: 'Color',
                value: this.colorMode,
                options: [
                    { value: 'angle', label: 'Longitude' },
                    { value: 'length', label: 'Northness' },
                    { value: 'origin', label: 'Latitude' },
                    { value: 'monochrome', label: 'Monochrome' }
                ],
                onChange: (v) => {
                    this.colorMode = v;
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'divider',
                id: 'mc_sort_divider',
                label: 'Sorting',
                actionLabel: 'Shuffle',
                onAction: () => {
                    this.shuffleChords();
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_sort',
                label: 'Method',
                value: this.sortMode,
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'hue', label: 'Hue Radix' },
                    { value: 'lsh', label: 'L-S-H Radix' },
                    { value: 'bubble', label: 'Bubble Sort' },
                    { value: 'quick', label: 'Quick Sort' }
                ],
                onChange: (v) => {
                    this.sortMode = v;
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_sort_speed',
                label: 'Sort Speed',
                min: 4,
                max: 180,
                step: 1,
                value: this.sortSpeed,
                onChange: (v) => {
                    this.sortSpeed = Math.max(1, v);
                }
            },
            {
                type: 'select',
                id: 'mc_hud',
                label: 'HUD',
                value: this.showHud ? 'on' : 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                ],
                onChange: (v) => {
                    this.showHud = v === 'on';
                    this.draw();
                }
            },
            {
                type: 'button',
                id: 'mc_sort_restart',
                label: 'Restart Sorting',
                value: 'Sorting 다시 시작',
                onClick: () => {
                    this.restartSort();
                    this.draw();
                }
            }
        ];
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

    reset() {
        this.pointCount = 180;
        this.multiplier = 0;
        this.multiplierSpeed = 0;
        this.lineWidth = 1.2;
        this.lineAlpha = 0.88;
        this.integersOnly = false;
        this.colorMode = 'angle';
        this.renderMode = 'light';
        this.sortMode = 'off';
        this.sortSpeed = 150;
        this.sphereFrequencyOverride = 0;
        this.sortProgress = 0;
        this.sortPlan = null;
        this.sortSignature = '';
        this.sortLockedState = null;
        this.sortPanelPosition = null;
        this.sortPanelDrag = null;
        this.shuffleNonce = 0;
        this.shuffleOrder = null;
        this.shuffleSignature = '';
        this.shuffleFlash = 0;
        this.showHud = true;
        this.isPaused = false;
        this.sortingStatus = 'idle';
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    destroy() {
        this.unbindCanvasInteractions();
        this.stop();
    },

    bindCanvasInteractions() {
        if (!this.canvas || this._canvasInteractionsBound) return;
        this._canvasInteractionsBound = true;

        this._handleCanvasPointerDown = (e) => {
            if (this.sortMode === 'bubble' || this.sortMode === 'quick') return;
            if (!this.isSortModeAvailable()) return;
            const layout = this.getSortPanelLayout(this.canvas.width, this.canvas.height);
            if (!layout) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = x >= layout.panelX && x <= layout.panelX + layout.panelW
                && y >= layout.panelY && y <= layout.panelY + layout.panelH;
            if (!inside) return;

            this.sortPanelDrag = {
                offsetX: x - layout.panelX,
                offsetY: y - layout.panelY
            };
        };

        this._handleWindowPointerMove = (e) => {
            if (!this.sortPanelDrag || !this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const layout = this.getSortPanelLayout(this.canvas.width, this.canvas.height);
            if (!layout) return;

            const nextX = x - this.sortPanelDrag.offsetX;
            const nextY = y - this.sortPanelDrag.offsetY;
            const maxX = Math.max(24, this.canvas.width - layout.panelW - 24);
            const maxY = Math.max(24, this.canvas.height - layout.panelH - 24);

            this.sortPanelPosition = {
                x: Math.max(24, Math.min(maxX, nextX)),
                y: Math.max(24, Math.min(maxY, nextY))
            };
            this.draw();
        };

        this._handleWindowPointerUp = () => {
            this.sortPanelDrag = null;
        };

        this.canvas.addEventListener('pointerdown', this._handleCanvasPointerDown);
        window.addEventListener('pointermove', this._handleWindowPointerMove);
        window.addEventListener('pointerup', this._handleWindowPointerUp);
    },

    unbindCanvasInteractions() {
        if (!this._canvasInteractionsBound || !this.canvas) return;
        this._canvasInteractionsBound = false;
        this.canvas.removeEventListener('pointerdown', this._handleCanvasPointerDown);
        window.removeEventListener('pointermove', this._handleWindowPointerMove);
        window.removeEventListener('pointerup', this._handleWindowPointerUp);
    },

    updateSimulation(dt) {
        this.updateSortingState(dt);
        this.updateShuffleFlash(dt);
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
    },

    getSphereVisual(point, index, total) {
        const alpha = this.lineAlpha;
        if (this.colorMode === 'monochrome') {
            return {
                hue: 180,
                saturation: 24,
                lightness: 78,
                alpha,
                color: `hsla(180, 24%, 78%, ${alpha})`
            };
        }

        const longitudeHue = ((Math.atan2(point.z, point.x) + Math.PI) / (Math.PI * 2)) * 360;
        if (this.colorMode === 'angle') {
            return {
                hue: longitudeHue,
                saturation: 92,
                lightness: 60,
                alpha,
                color: `hsla(${longitudeHue}, 92%, 60%, ${alpha})`
            };
        }

        if (this.colorMode === 'origin') {
            const theta = Math.acos(Math.max(-1, Math.min(1, point.y)));
            const hue = (theta / Math.PI) * 360;
            return {
                hue,
                saturation: 88,
                lightness: 58,
                alpha,
                color: `hsla(${hue}, 88%, 58%, ${alpha})`
            };
        }

        const northness = (point.y + 1) * 0.5;
        const hue = 220 - northness * 200;
        const lightness = 42 + northness * 30;
        return {
            hue,
            saturation: 86,
            lightness,
            alpha,
            color: `hsla(${hue}, 86%, ${lightness}%, ${alpha})`
        };
    },

    buildGeometryProvider(n, m, radius, cx, cy) {
        const provider = GoldbergSphereProvider.buildGoldbergSphereProvider({
            targetCount: Math.max(12, Math.floor(n || this.pointCount)),
            frequencyOverride: this.sphereFrequencyOverride,
            cx,
            cy,
            radius
        });

        const shuffleOrder = this.ensureShuffleOrder(provider.items.length, 0);
        const baseItems = provider.items.map((item, index) => {
            const visual = this.getSphereVisual(item.meta.center, index, provider.items.length);
            return {
                ...item,
                hue: visual.hue,
                saturation: visual.saturation,
                lightness: visual.lightness,
                alpha: visual.alpha,
                color: visual.color
            };
        });

        const orderedItems = (shuffleOrder || baseItems.map((_, index) => index)).map((itemIndex, slotIndex) => ({
            ...baseItems[itemIndex],
            slotIndex,
            slotGeometry: provider.slots[slotIndex]?.geometry || baseItems[itemIndex].slotGeometry
        }));

        return {
            ...provider,
            revision: `${provider.revision}|${this.colorMode}|${this.lineAlpha.toFixed(3)}|${this.shuffleNonce}`,
            items: orderedItems
        };
    },

    buildCardioidProvider(n, m, radius, cx, cy) {
        return this.buildGeometryProvider(n, m, radius, cx, cy);
    },

    getCurrentGeometryProvider() {
        if (!this.canvas) return null;
        const locked = this.sortLockedState || {
            n: Math.max(12, Math.floor(this.pointCount)),
            m: 0
        };
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.46;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        return this.buildGeometryProvider(locked.n, 0, radius, cx, cy);
    },

    getCurrentCardioidProvider() {
        return this.getCurrentGeometryProvider();
    },

    drawHud(ctx, viewState) {
        if (!this.showHud) return;

        const { provider, sortingActive, sortView, sortPlan, w } = viewState;
        const formatSortSeconds = (seconds) => `${Math.max(0, seconds).toFixed(1)}s`;
        const itemCount = provider?.providerMeta?.itemCount || provider?.items?.length || 0;
        const frequency = provider?.providerMeta?.frequency || 1;
        const simElapsedLabel = (typeof Core !== 'undefined' && Core.isSimRunning && typeof Core.getSimulationElapsedMs === 'function')
            ? Core.formatRecordingTimeMMSS(Core.getSimulationElapsedMs())
            : null;

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';

        let sortTimeLabel = '0.0s / 0.0s';
        if (this.isSortModeAvailable() && this.sortSpeed > 0) {
            const totalSteps = sortPlan?.totalSteps || this.getSortTotalSteps(provider);
            const elapsedSeconds = this.sortProgress / this.sortSpeed;
            const totalSeconds = totalSteps / this.sortSpeed;
            sortTimeLabel = `${formatSortSeconds(elapsedSeconds)} / ${formatSortSeconds(totalSeconds)}`;
        }

        let nextY = 30;
        ctx.fillText(`Sort Time: ${sortTimeLabel}`, 24, nextY);
        nextY += 22;
        if (sortingActive && sortView) {
            let sortLabel = 'Radix';
            if (this.sortMode === 'lsh') sortLabel = 'L-S-H Radix';
            if (this.sortMode === 'hue') sortLabel = 'Hue Radix';
            if (this.sortMode === 'bubble') sortLabel = 'Bubble Sort';
            if (this.sortMode === 'quick') sortLabel = 'Quick Sort';
            ctx.fillText(`Sort: ${sortLabel}`, 24, nextY);
            nextY += 22;
            ctx.fillText(`Pass: ${sortView.passLabel || `Pass ${sortView.passNumber}`}`, 24, nextY);
            nextY += 22;
            if (sortView.activeDigit != null) {
                ctx.fillText(`Bucket: ${sortView.activeDigit}`, 24, nextY);
                nextY += 22;
            } else if (sortView.activeIndices) {
                ctx.fillText(`Pair: ${sortView.activeIndices[0]} ↔ ${sortView.activeIndices[1]}`, 24, nextY);
                nextY += 22;
            } else {
                ctx.fillText(`State: ${this.sortingStatus}`, 24, nextY);
                nextY += 22;
            }
        } else if (this.isSortModeAvailable()) {
            let sortLabel = 'Radix';
            if (this.sortMode === 'lsh') sortLabel = 'L-S-H Radix';
            if (this.sortMode === 'hue') sortLabel = 'Hue Radix';
            if (this.sortMode === 'bubble') sortLabel = 'Bubble Sort';
            if (this.sortMode === 'quick') sortLabel = 'Quick Sort';
            ctx.fillText(`Sort: ${sortLabel}`, 24, nextY);
            nextY += 22;
            ctx.fillText(`State: ${this.sortingStatus}`, 24, nextY);
            nextY += 22;
        }

        if (simElapsedLabel) {
            ctx.fillText(`Sim Time: ${simElapsedLabel}`, 24, nextY);
        }

        ctx.save();
        ctx.textAlign = 'right';
        ctx.fillText(`Faces: ${itemCount}`, w - 24, 30);
        ctx.fillText(`Target: ${Math.floor(this.pointCount)}`, w - 24, 52);
        ctx.fillText(`Freq: ${frequency}`, w - 24, 74);
        ctx.fillText(`Mode: ${this.sphereFrequencyOverride > 0 ? 'manual' : 'auto'}`, w - 24, 96);
        ctx.restore();
    }
};

if (typeof ColorKeyEngine !== 'undefined') {
    Object.assign(GoldbergSphereCase, ColorKeyEngine);
}

if (typeof SortEngine !== 'undefined') {
    Object.assign(GoldbergSphereCase, SortEngine);
}

if (typeof SortRenderer !== 'undefined') {
    Object.assign(GoldbergSphereCase, SortRenderer);
}
