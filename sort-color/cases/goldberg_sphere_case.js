const GoldbergSphereCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,
    isPaused: GoldbergSphereDefaults.isPaused,

    pointCount: GoldbergSphereDefaults.pointCount,
    multiplier: GoldbergSphereDefaults.multiplier,
    multiplierSpeed: GoldbergSphereDefaults.multiplierSpeed,
    lineWidth: GoldbergSphereDefaults.lineWidth,
    lineAlpha: GoldbergSphereDefaults.lineAlpha,
    pointRadius: GoldbergSphereDefaults.pointRadius,
    showPoints: GoldbergSphereDefaults.showPoints,
    showHud: GoldbergSphereDefaults.showHud,
    showIndices: GoldbergSphereDefaults.showIndices,
    integersOnly: GoldbergSphereDefaults.integersOnly,
    colorGenerator: GoldbergSphereDefaults.colorGenerator,
    colorMode: GoldbergSphereDefaults.colorMode,
    renderMode: GoldbergSphereDefaults.renderMode,
    slotMapping: GoldbergSphereDefaults.slotMapping,
    sortMode: GoldbergSphereDefaults.sortMode,
    sortingStatus: GoldbergSphereDefaults.sortingStatus,
    sortSpeed: GoldbergSphereDefaults.sortSpeed,
    sortProgress: GoldbergSphereDefaults.sortProgress,
    sortPlan: GoldbergSphereDefaults.sortPlan,
    sortSignature: GoldbergSphereDefaults.sortSignature,
    sortLockedState: GoldbergSphereDefaults.sortLockedState,
    sortPanelPosition: GoldbergSphereDefaults.sortPanelPosition,
    sortPanelDrag: GoldbergSphereDefaults.sortPanelDrag,
    shuffleNonce: GoldbergSphereDefaults.shuffleNonce,
    shuffleOrder: GoldbergSphereDefaults.shuffleOrder,
    shuffleSignature: GoldbergSphereDefaults.shuffleSignature,
    shuffleFlash: GoldbergSphereDefaults.shuffleFlash,
    shuffleAnimation: GoldbergSphereDefaults.shuffleAnimation,
    sortPassRotationKey: GoldbergSphereDefaults.sortPassRotationKey,
    sortPassSlowTimer: GoldbergSphereDefaults.sortPassSlowTimer,
    rotation: GoldbergSphereDefaults.rotation,
    learningMode: GoldbergSphereDefaults.learningMode,
    sphereFrequencyOverride: GoldbergSphereDefaults.sphereFrequencyOverride,
    rotX: GoldbergSphereDefaults.rotX,
    rotY: GoldbergSphereDefaults.rotY,
    rotationSpeed: GoldbergSphereDefaults.rotationSpeed,
    autoTrack: GoldbergSphereDefaults.autoTrack,
    autoRotate: GoldbergSphereDefaults.autoRotate,
    isDraggingSphere: GoldbergSphereDefaults.isDraggingSphere,
    lastPointerX: GoldbergSphereDefaults.lastPointerX,
    lastPointerY: GoldbergSphereDefaults.lastPointerY,
    trackingHistory: [],
    trackingSmoothedPoint: GoldbergSphereDefaults.trackingSmoothedPoint,
    trackingVelX: GoldbergSphereDefaults.trackingVelX,
    trackingVelY: GoldbergSphereDefaults.trackingVelY,
    trackingLocked: GoldbergSphereDefaults.trackingLocked,

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
        return SortColorControlFactory.createGoldbergControls(this);
    },

    reset() {
        Object.assign(this, GoldbergSphereDefaults, {
            trackingHistory: []
        });
        this.resetAutoTrackingState();
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
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

    captureSortLockedState() {
        const n = Math.max(12, Math.floor(this.pointCount));
        this.sortLockedState = { n, m: 0 };
        return this.sortLockedState;
    },

    shuffleGoldbergSlots() {
        const targetCount = Math.max(12, Math.floor(this.sortLockedState?.n || this.pointCount || 0));
        let n = targetCount;
        if (this.canvas) {
            const radius = Math.min(this.canvas.width, this.canvas.height) * 0.46;
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            const provider = GoldbergSphereProvider.buildGoldbergSphereProvider({
                targetCount,
                frequencyOverride: this.sphereFrequencyOverride,
                rotX: this.rotX,
                rotY: this.rotY,
                cx,
                cy,
                radius,
                slotMapping: this.slotMapping
            });
            n = provider?.items?.length || targetCount;
        }
        const m = 0;
        const currentOrder = (this.ensureShuffleOrder(n, m) || Array.from({ length: n }, (_, index) => index)).slice();
        let nextOrder = this.generateShuffleOrder(n);
        let guard = 0;
        while (n > 1 && guard < 4 && nextOrder.every((itemIndex, slotIndex) => itemIndex === currentOrder[slotIndex])) {
            nextOrder = this.generateShuffleOrder(n);
            guard += 1;
        }

        this.shuffleNonce += 1;
        this.shuffleOrder = nextOrder;
        this.shuffleSignature = this.getShuffleSignature(n, m);

        const fromSlotsByItem = this.invertShuffleOrder(currentOrder);
        const toSlotsByItem = this.invertShuffleOrder(nextOrder);
        this.shuffleAnimation = {
            n,
            m,
            fromOrder: currentOrder,
            toOrder: nextOrder,
            fromSlotsByItem,
            toSlotsByItem,
            focusItemIndex: this.getShuffleFocusItem(fromSlotsByItem, toSlotsByItem),
            progress: 0,
            duration: 1.05
        };
        this.shuffleFlash = 1;
        this.resetSortState('idle');
    },

    shuffleScene() {
        this.shuffleGoldbergSlots();
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

        let fromCentroidX = 0;
        let fromCentroidY = 0;
        let toCentroidX = 0;
        let toCentroidY = 0;
        for (let index = 0; index < count; index++) {
            fromCentroidX += fromPoints[index].x;
            fromCentroidY += fromPoints[index].y;
            toCentroidX += toPoints[index].x;
            toCentroidY += toPoints[index].y;
        }
        if (count > 0) {
            fromCentroidX /= count;
            fromCentroidY /= count;
            toCentroidX /= count;
            toCentroidY /= count;
        }

        const mixCentroidX = fromCentroidX + (toCentroidX - fromCentroidX) * easedT;
        const mixCentroidY = fromCentroidY + (toCentroidY - fromCentroidY) * easedT;
        const dx = mixCentroidX - centerX;
        const dy = mixCentroidY - centerY;
        const len = Math.hypot(dx, dy) || 1;
        const tangentX = -dy / len;
        const tangentY = dx / len;
        const pulse = Math.sin(Math.PI * easedT);
        const distance = Math.hypot(toCentroidX - fromCentroidX, toCentroidY - fromCentroidY);
        const arcStrength = Math.max(56, Math.min(150, distance * 1.15));
        const direction = (dx >= 0 ? 1 : -1);
        const controlX = ((fromCentroidX + toCentroidX) * 0.5) + tangentX * arcStrength * direction;
        const controlY = ((fromCentroidY + toCentroidY) * 0.5) + tangentY * arcStrength * direction;
        const centroidX = ((1 - easedT) * (1 - easedT) * fromCentroidX)
            + (2 * (1 - easedT) * easedT * controlX)
            + (easedT * easedT * toCentroidX);
        const centroidY = ((1 - easedT) * (1 - easedT) * fromCentroidY)
            + (2 * (1 - easedT) * easedT * controlY)
            + (easedT * easedT * toCentroidY);

        const orbitDx = centroidX - centerX;
        const orbitDy = centroidY - centerY;
        const orbitLen = Math.hypot(orbitDx, orbitDy) || 1;
        
        const orbitTangentX = -orbitDy / orbitLen;
        const orbitTangentY = orbitDx / orbitLen;
        const orbitRadialX = orbitDx / orbitLen;
        const orbitRadialY = orbitDy / orbitLen;

        // 1. Radial Burst: Explode outward from the center
        const radialStrength = 82; 
        const radialBurst = pulse * radialStrength;
        
        // 2. Tangential Kick: Orbit movement
        const orbitKick = pulse * Math.max(12, Math.min(34, distance * 0.22));

        const kickedCentroidX = centroidX + (orbitTangentX * orbitKick * direction) + (orbitRadialX * radialBurst);
        const kickedCentroidY = centroidY + (orbitTangentY * orbitKick * direction) + (orbitRadialY * radialBurst);

        const spin = direction * pulse * Math.max(0.55, Math.min(1.35, distance / 115));
        const scale = 1 + pulse * 0.05;
        const cosSpin = Math.cos(spin);
        const sinSpin = Math.sin(spin);

        return {
            kind: 'polygon',
            points: Array.from({ length: count }, (_, index) => {
                const fromLocalX = fromPoints[index].x - fromCentroidX;
                const fromLocalY = fromPoints[index].y - fromCentroidY;
                const toLocalX = toPoints[index].x - toCentroidX;
                const toLocalY = toPoints[index].y - toCentroidY;
                const localX = fromLocalX + (toLocalX - fromLocalX) * easedT;
                const localY = fromLocalY + (toLocalY - fromLocalY) * easedT;
                const scaledX = localX * scale;
                const scaledY = localY * scale;
                const rotatedX = scaledX * cosSpin - scaledY * sinSpin;
                const rotatedY = scaledX * sinSpin + scaledY * cosSpin;
                return {
                    x: kickedCentroidX + rotatedX,
                    y: kickedCentroidY + rotatedY
                };
            }),
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
                if (this.sortMode === 'insertion') sortLabel = 'Insertion Sort';
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
            if (this.sortMode === 'insertion') sortLabel = 'Insertion Sort';
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

    drawGeometryOverlay(ctx, viewState) {
        const northPole = viewState.provider?.providerMeta?.northPole;
        const southPole = viewState.provider?.providerMeta?.southPole;

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
    captureSortLockedState: GoldbergSphereCase.captureSortLockedState,
    getSphereVisual: GoldbergSphereCase.getSphereVisual,
    buildGeometryProvider: GoldbergSphereCase.buildGeometryProvider,
    buildCardioidProvider: GoldbergSphereCase.buildCardioidProvider,
    getCurrentGeometryProvider: GoldbergSphereCase.getCurrentGeometryProvider,
    getCurrentCardioidProvider: GoldbergSphereCase.getCurrentCardioidProvider,
    drawHud: GoldbergSphereCase.drawHud,
    drawLearningModeOverlay: GoldbergSphereCase.drawLearningModeOverlay,
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

if (typeof SortColorCaseBase !== 'undefined') {
    Object.assign(GoldbergSphereCase, SortColorCaseBase);
}

if (typeof GoldbergTrackingManager !== 'undefined') {
    Object.assign(GoldbergSphereCase, GoldbergTrackingManager);
}

Object.assign(GoldbergSphereCase, GoldbergSphereCaseOverrides);
