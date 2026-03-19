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
    lineAlpha: 0.9,
    pointRadius: 1.4,
    showPoints: false,
    showHud: true,
    showIndices: 'off',
    integersOnly: false,
    colorGenerator: 'index-mod',
    colorMode: 'angle',
    renderMode: 'light',
    slotMapping: 'top-down',
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
    shuffleAnimation: null,
    rotation: -Math.PI / 2,
    learningMode: 'off',
    sphereFrequencyOverride: 0,
    rotX: -0.35,
    rotY: 0.45,
    rotationSpeed: 0.16,
    sortPassSpinTurns: 1.05,
    sortPassSpinDuration: 1.2,
    autoRotate: true,
    isDraggingSphere: false,
    lastPointerX: 0,
    lastPointerY: 0,

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.bindCanvasInteractions();
        this.resize();
        this.draw();
    },

    draw() {
        const savedLearningMode = this.learningMode;
        this.learningMode = 'off';
        try {
            if (typeof SortRenderer !== 'undefined' && typeof SortRenderer.draw === 'function') {
                return SortRenderer.draw.call(this);
            }
        } finally {
            this.learningMode = savedLearningMode;
        }
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
                type: 'checkbox',
                id: 'mc_sphere_auto_rotate',
                label: 'Auto Rotate',
                value: this.autoRotate,
                onChange: (checked) => {
                    this.autoRotate = !!checked;
                }
            },
            {
                type: 'slider',
                id: 'mc_sphere_rot',
                label: 'Rotation Speed',
                min: -1.2,
                max: 1.2,
                step: 0.01,
                value: this.rotationSpeed,
                onChange: (v) => {
                    this.rotationSpeed = v;
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
                id: 'mc_color_generator',
                label: 'Color Gen',
                value: this.colorGenerator,
                options: [
                    { value: 'index-mod', label: 'Sequence' },
                    { value: 'spatial', label: 'Position' }
                ],
                onChange: (v) => {
                    this.colorGenerator = v;
                    this.resetSortState('idle');
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
                max: 400,
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
                type: 'select',
                id: 'mc_indices',
                label: 'Indices',
                value: this.showIndices || 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'slot', label: 'Slot Index' },
                    { value: 'original', label: 'Original Index' }
                ],
                onChange: (v) => {
                    this.showIndices = v;
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_slot_mapping',
                label: 'Slot Mapping',
                value: this.slotMapping,
                options: [
                    { value: 'top-down', label: 'Top-down' },
                    { value: 'sequence', label: 'Chunk' }
                ],
                onChange: (v) => {
                    this.slotMapping = v;
                    this.resetSortState('idle');
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
        this.lineAlpha = 0.9;
        this.integersOnly = false;
        this.colorGenerator = 'index-mod';
        this.colorMode = 'angle';
        this.renderMode = 'light';
        this.showIndices = 'off';
        this.slotMapping = 'top-down';
        this.sortMode = 'off',
        this.sortSpeed = 150;
        this.sphereFrequencyOverride = 0;
        this.rotX = -0.35;
        this.rotY = 0.45;
        this.rotationSpeed = 0.16;
        this.sortPassSpinTurns = 1.05;
        this.sortPassSpinDuration = 1.2;
        this.autoRotate = true;
        this.isDraggingSphere = false;
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
        this.shuffleAnimation = null;
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
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const layout = this.isSortModeAvailable() ? this.getSortPanelLayout(this.canvas.width, this.canvas.height) : null;
            const insideSortPanel = !!layout
                && x >= layout.panelX && x <= layout.panelX + layout.panelW
                && y >= layout.panelY && y <= layout.panelY + layout.panelH;

            if (insideSortPanel) {
                this.sortPanelDrag = {
                    offsetX: x - layout.panelX,
                    offsetY: y - layout.panelY
                };
                return;
            }

            this.isDraggingSphere = true;
            this.lastPointerX = e.clientX;
            this.lastPointerY = e.clientY;
        };

        this._handleWindowPointerMove = (e) => {
            if (this.isDraggingSphere) {
                const dx = e.clientX - this.lastPointerX;
                const dy = e.clientY - this.lastPointerY;
                this.lastPointerX = e.clientX;
                this.lastPointerY = e.clientY;
                this.rotY += dx * 0.008;
                this.rotX += dy * 0.008;
                this.rotX = Math.max(-1.35, Math.min(1.35, this.rotX));
                this.draw();
                return;
            }

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
            this.isDraggingSphere = false;
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
        if (!this.isPaused && !this.isDraggingSphere) {
            const provider = this.getCurrentGeometryProvider();
            let extraSpin = 0;
            if (this.isSortingEnabled()) {
                const sortPlan = this.ensureSortPlan(provider);
                const sortView = this.getSortViewState(sortPlan);
                this.syncSortPassTransition(sortPlan, sortView);
                const transition = this.getSortPassTransitionState();
                if (transition) {
                    const t = Math.max(0, Math.min(1, transition.progress || 0));
                    const envelope = Math.sin(t * Math.PI);
                    extraSpin = ((transition.turns || 0) * Math.PI * 2 / Math.max(0.05, transition.duration || 1)) * envelope;
                }
                this.advanceSortPassTransition(dt);
            }
            if (this.autoRotate) {
                this.rotY += (this.rotationSpeed + extraSpin) * dt;
            }
            this.clampPitch();
        }
        this.updateSortingState(dt);
        this.updateShuffleAnimation(dt);
        this.updateShuffleFlash(dt);
    },

    updateShuffleFlash(dt) {
        if (this.shuffleFlash > 0) {
            this.shuffleFlash = Math.max(0, this.shuffleFlash - dt * 1.8);
        }
    },

    captureSortLockedState() {
        const n = Math.max(12, Math.floor(this.pointCount));
        this.sortLockedState = { n, m: 0 };
        return this.sortLockedState;
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

    wrapAngle(angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    },

    clampPitch() {
        const limit = 1.35;
        if (this.rotX > limit) this.rotX = limit;
        if (this.rotX < -limit) this.rotX = -limit;
    },

    getSortPassTransitionConfig() {
        return {
            enabled: true,
            duration: this.sortPassSpinDuration,
            turns: this.sortPassSpinTurns,
            blockProgress: false
        };
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
        const generatedHue = this.colorGenerator === 'index-mod'
            ? (total > 360
                ? (index % 360)
                : ((index / Math.max(1, total)) * 360))
            : null;
        if (this.colorMode === 'angle') {
            const hue = generatedHue ?? longitudeHue;
            const normalizedHue = ((hue % 360) + 360) % 360;
            return {
                hue: normalizedHue,
                saturation: 100,
                lightness: 50,
                alpha,
                color: `hsla(${normalizedHue}, 100%, 50%, ${alpha})`
            };
        }

        if (this.colorMode === 'origin') {
            const theta = Math.acos(Math.max(-1, Math.min(1, point.y)));
            const hue = generatedHue ?? ((theta / Math.PI) * 360);
            return {
                hue,
                saturation: 88,
                lightness: 58,
                alpha,
                color: `hsla(${hue}, 88%, 58%, ${alpha})`
            };
        }

        const northness = (point.y + 1) * 0.5;
        const hue = generatedHue ?? (220 - northness * 200);
        const lightness = 42 + northness * 30;
        return {
            hue,
            saturation: 86,
            lightness,
            alpha,
            color: `hsla(${hue}, 86%, ${lightness}%, ${alpha})`
        };
    },

    interpolateSphereGeometry(fromGeometry, toGeometry, t) {
        if (!fromGeometry || !toGeometry) return toGeometry || fromGeometry || null;
        const easedT = t * t * (3 - 2 * t);
        const fromPoints = Array.isArray(fromGeometry.points) ? fromGeometry.points : [];
        const toPoints = Array.isArray(toGeometry.points) ? toGeometry.points : [];
        const count = Math.min(fromPoints.length, toPoints.length);
        let centerX = 0;
        let centerY = 0;
        if (this.canvas) {
            centerX = this.canvas.width / 2;
            centerY = this.canvas.height / 2;
        }

        let centroidX = 0;
        let centroidY = 0;
        const blendedPoints = Array.from({ length: count }, (_, index) => {
            const x = fromPoints[index].x + (toPoints[index].x - fromPoints[index].x) * easedT;
            const y = fromPoints[index].y + (toPoints[index].y - fromPoints[index].y) * easedT;
            centroidX += x;
            centroidY += y;
            return { x, y };
        });

        if (count > 0) {
            centroidX /= count;
            centroidY /= count;
        }

        const dx = centroidX - centerX;
        const dy = centroidY - centerY;
        const len = Math.hypot(dx, dy) || 1;
        const lift = Math.sin(Math.PI * easedT) * 22;
        const liftX = (dx / len) * lift;
        const liftY = (dy / len) * lift;

        return {
            kind: 'polygon',
            points: blendedPoints.map((point) => ({
                x: point.x + liftX,
                y: point.y + liftY
            })),
            hidden: !!fromGeometry.hidden && !!toGeometry.hidden,
            depth: (fromGeometry.depth || 0) + ((toGeometry.depth || 0) - (fromGeometry.depth || 0)) * easedT
        };
    },

    buildGeometryProvider(n, m, radius, cx, cy) {
        const provider = GoldbergSphereProvider.buildGoldbergSphereProvider({
            targetCount: Math.max(12, Math.floor(n || this.pointCount)),
            frequencyOverride: this.sphereFrequencyOverride,
            rotX: this.rotX,
            rotY: this.rotY,
            cx,
            cy,
            radius,
            slotMapping: this.slotMapping
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

        const activeShuffle = this.getActiveShuffleAnimation(provider.items.length, 0);
        const orderedItems = (shuffleOrder || baseItems.map((_, index) => index)).map((itemIndex, slotIndex) => {
            let slotGeometry = provider.slots[slotIndex]?.geometry || baseItems[itemIndex].slotGeometry;
            if (activeShuffle) {
                const fromSlotIndex = activeShuffle.fromSlotsByItem[itemIndex];
                const fromGeometry = provider.slots[fromSlotIndex]?.geometry || baseItems[itemIndex].slotGeometry;
                slotGeometry = this.interpolateSphereGeometry(fromGeometry, slotGeometry, activeShuffle.progress);
            }
            return {
                ...baseItems[itemIndex],
                slotIndex,
                slotGeometry
            };
        });

        return {
            ...provider,
            revision: `${provider.revision}|${this.colorGenerator}|${this.colorMode}|${this.lineAlpha.toFixed(3)}|${this.shuffleNonce}`,
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
        ctx.fillText(`Rot: ${this.rotationSpeed.toFixed(2)}`, w - 24, 96);
        ctx.restore();
    },

    drawLearningModeOverlay() {},

    drawSortPassScanOverlay(ctx, viewState) {
        const transition = this.getSortPassTransitionState?.();
        if (!transition) return;

        const points = Array.isArray(viewState.provider?.points) ? viewState.provider.points : [];
        if (!points.length) return;

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const point of points) {
            if (!point) continue;
            if (point.x < minX) minX = point.x;
            if (point.x > maxX) maxX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.y > maxY) maxY = point.y;
        }

        if (!Number.isFinite(minX) || !Number.isFinite(minY)) return;

        const t = Math.max(0, Math.min(1, transition.progress || 0));
        const scanT = Math.pow(t, 3.2);
        const scanY = minY + (maxY - minY) * scanT;
        const bandHalf = Math.max(32, (maxY - minY) * 0.18);
        const alpha = (0.35 + Math.sin(t * Math.PI) * 0.55);
        const glowAlpha = alpha * 0.22;
        const cx = (minX + maxX) * 0.5;
        const cy = (minY + maxY) * 0.5;
        const rx = Math.max(1, (maxX - minX) * 0.5);
        const ry = Math.max(1, (maxY - minY) * 0.5);
        const normalizedY = Math.max(-1, Math.min(1, (scanY - cy) / ry));
        const latitudeRadius = Math.max(18, rx * Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY)));
        const curvatureBoost = 0.85 + (1 - Math.abs(normalizedY)) * 1.65;
        const arcHeight = Math.max(48, bandHalf * curvatureBoost * 1.4);

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.clip();

        const glowGradient = ctx.createRadialGradient(
            cx, scanY, latitudeRadius * 0.2,
            cx, scanY, latitudeRadius * 1.15
        );
        glowGradient.addColorStop(0, `rgba(255, 240, 160, ${glowAlpha * 1.5})`);
        glowGradient.addColorStop(0.45, `rgba(120, 200, 255, ${glowAlpha})`);
        glowGradient.addColorStop(1, 'rgba(120, 200, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.ellipse(cx, scanY, latitudeRadius, arcHeight * 4.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(120, 200, 255, ${glowAlpha})`;
        ctx.lineWidth = Math.max(arcHeight * 2.2, 32);
        ctx.beginPath();
        ctx.ellipse(cx, scanY, latitudeRadius, arcHeight, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 246, 196, ${Math.min(1, alpha + 0.08)})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(cx, scanY, latitudeRadius, arcHeight, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,255,255, ${alpha * 0.32})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, scanY - arcHeight * 0.22, latitudeRadius * 0.9, Math.max(12, arcHeight * 0.82), 0, Math.PI * 1.03, Math.PI * 1.97);
        ctx.stroke();
        ctx.restore();
    },

    drawGeometryOverlay(ctx, viewState) {
        const northPole = viewState.provider?.providerMeta?.northPole;
        const southPole = viewState.provider?.providerMeta?.southPole;

        this.drawSortPassScanOverlay(ctx, viewState);

        const drawPole = (pole, label, color) => {
            if (!pole?.point) return;
            if (pole.hidden) return;
            const p = pole.point;
            ctx.save();
            ctx.fillStyle = color;
            ctx.strokeStyle = 'rgba(10, 14, 24, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.font = '700 12px IBM Plex Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.fillText(label, p.x, p.y - 12);
            ctx.restore();
        };

        drawPole(northPole, 'N', 'rgba(255, 209, 102, 0.95)');
        drawPole(southPole, 'S', 'rgba(120, 200, 255, 0.95)');

        if (!this.showIndices || this.showIndices === 'off') return;

        ctx.save();
        ctx.font = '600 10px IBM Plex Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const provider = viewState.provider;
        const activeEntries = Array.isArray(viewState.sortView?.drawEntries)
            ? viewState.sortView.drawEntries
            : provider?.items;
        const drawOrder = Array.isArray(provider?.drawOrder) && provider.drawOrder.length
            ? provider.drawOrder
            : Array.from({ length: provider?.slots?.length || 0 }, (_, index) => index);

        for (let k = 0; k < drawOrder.length; k++) {
            const slotIndex = drawOrder[k];
            const slot = provider?.slots?.[slotIndex];
            const geometry = slot?.geometry;
            const entry = activeEntries?.[slotIndex];
            if (!geometry || geometry.hidden || geometry.kind !== 'polygon' || !Array.isArray(geometry.points)) continue;

            let cx = 0;
            let cy = 0;
            for (const point of geometry.points) {
                cx += point.x;
                cy += point.y;
            }
            cx /= geometry.points.length;
            cy /= geometry.points.length;

            const originalIndex = entry?.originalIndex;
            const displayIndex = this.showIndices === 'original'
                ? (originalIndex ?? slotIndex)
                : slotIndex;
            const hueLabelValue = Math.round(entry?.hue ?? 0);
            const hueLabel = `H${String(hueLabelValue).padStart(3, '0')}`;
            const comboLabel = this.showIndices === 'original'
                ? `O${String(originalIndex ?? slotIndex).padStart(3, '0')}`
                : `S${String(slotIndex).padStart(3, '0')}`;

            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.fillText(comboLabel, cx, cy - 4);
            ctx.fillStyle = 'rgba(255, 209, 102, 0.98)';
            ctx.fillText(hueLabel, cx, cy + 8);
        }
        ctx.restore();
    }
};

const GoldbergSphereCaseOverrides = {
    draw: GoldbergSphereCase.draw,
    bindCanvasInteractions: GoldbergSphereCase.bindCanvasInteractions,
    unbindCanvasInteractions: GoldbergSphereCase.unbindCanvasInteractions,
    updateSimulation: GoldbergSphereCase.updateSimulation,
    updateShuffleFlash: GoldbergSphereCase.updateShuffleFlash,
    captureSortLockedState: GoldbergSphereCase.captureSortLockedState,
    wrapAngle: GoldbergSphereCase.wrapAngle,
    clampPitch: GoldbergSphereCase.clampPitch,
    getSphereVisual: GoldbergSphereCase.getSphereVisual,
    buildGeometryProvider: GoldbergSphereCase.buildGeometryProvider,
    buildCardioidProvider: GoldbergSphereCase.buildCardioidProvider,
    getCurrentGeometryProvider: GoldbergSphereCase.getCurrentGeometryProvider,
    getCurrentCardioidProvider: GoldbergSphereCase.getCurrentCardioidProvider,
    getSortPassTransitionConfig: GoldbergSphereCase.getSortPassTransitionConfig,
    drawHud: GoldbergSphereCase.drawHud,
    drawLearningModeOverlay: GoldbergSphereCase.drawLearningModeOverlay,
    drawSortPassScanOverlay: GoldbergSphereCase.drawSortPassScanOverlay,
    drawGeometryOverlay: GoldbergSphereCase.drawGeometryOverlay
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

Object.assign(GoldbergSphereCase, GoldbergSphereCaseOverrides);
Object.assign(GoldbergSphereCase, GoldbergSphereCaseOverrides);
