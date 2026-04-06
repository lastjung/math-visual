const EnvelopeRadialCase = {
    pointCount: 128,
    multiplier: 0,
    multiplierSpeed: 0,
    lineWidth: 1.5,
    lineAlpha: 0.38,
    pointRadius: 1,
    showPoints: false,
    showHud: true,
    integersOnly: false,
    colorMode: 'angle',
    renderMode: 'light',
    showGuideCircle: false,
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
    rotation: 0,
    learningMode: 'off',
    isPaused: true,
    currentPreset: 'standard',
    envelopeAxesCount: 5,
    envelopeLinesPerSector: 24,
    envelopeLayerCount: 1,
    envelopeConstructionSpeed: 72,
    envelopeConstructionProgress: 0,
    envelopeConstructionComplete: false,
    envelopeBuildOrder: 'sequential', // 'sequential' (Sector-wise) or 'chained' (Symmetry/Interleaved)
    guideText: [
        '[Envelope Radial controls]',
        '- Axes: number of radial spokes. 4 gives the classic astroid-like envelope.',
        '- Lines / Sector: number of string-art lines inside each wedge.',
        '- Build Speed: how fast the envelope is constructed line by line.',
        '- Replay Build restarts the construction pass without changing the geometry.',
        '- Sorting stays available after the build finishes; auto-start is intentionally disabled.'
    ].join('\n'),

    get uiConfig() {
        return SortColorControlFactory.createEnvelopeRadialControls(this);
    },

    reset() {
        this.pointCount = 128;
        this.multiplier = 0;
        this.multiplierSpeed = 0;
        this.lineWidth = 1.5;
        this.lineAlpha = 0.38;
        this.pointRadius = 1;
        this.showPoints = false;
        this.showHud = true;
        this.integersOnly = false;
        this.colorMode = 'angle';
        this.renderMode = 'light';
        this.sortMode = 'off';
        this.sortingStatus = 'idle';
        this.sortSpeed = 150;
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
        this.rotation = 0;
        this.learningMode = 'off';
        this.isPaused = true;
        this.envelopeAxesCount = 5;
        this.envelopeLinesPerSector = 32;
        this.envelopeLayerCount = 1;
        this.envelopeConstructionSpeed = 72;
        this.replayConstruction();
        this.syncEnvelopeItemCount();
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    replayConstruction() {
        this.resetSortState('idle');
        this.envelopeConstructionProgress = 0;
        this.envelopeConstructionComplete = false;
        this.isPaused = true;
        this.syncEnvelopeItemCount();
    },

    applyPreset(presetId) {
        this.currentPreset = presetId;
        if (presetId === 'polygon') {
            this.envelopeAxesCount = 5;
            this.envelopeLinesPerSector = 32; // Align with Star
            this.envelopeLayerCount = 2; // As requested
            this.colorMode = 'monochrome';
            this.lineAlpha = 0.6;
            this.lineWidth = 1.0;
            this.envelopeBuildOrder = 'sequential'; 
        } else if (presetId === 'chain') {
            this.envelopeAxesCount = 6;
            this.envelopeLinesPerSector = 16; 
            this.envelopeLayerCount = 1;
        } else {
            // standard (Star)
            this.envelopeAxesCount = 5;
            this.envelopeLinesPerSector = 32;
            this.envelopeLayerCount = 1; // Back to 1 layer for Star as requested
            this.colorMode = 'angle';
            this.lineAlpha = 0.38;
            this.lineWidth = 1.5;
        }
        this.syncEnvelopeItemCount();
        this.replayConstruction();
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    toggleBuildPlayback() {
        if (this.envelopeConstructionComplete) {
            this.replayConstruction();
            this.setPaused(false);
        } else {
            this.setPaused(!this.isPaused);
        }
        if (typeof Core !== 'undefined' && Core.currentCase === this) {
            Core.updateControls();
            Core.updateSortBar();
        }
    },

    shouldResumeAfterReset() {
        return false;
    },

    canRunSort() {
        if (!this.envelopeConstructionComplete) return false;
        return SortEngine.canRunSort.call(this);
    },

    captureSortLockedState() {
        this.syncEnvelopeItemCount();
        this.sortLockedState = {
            n: this.pointCount,
            m: 0
        };
        return this.sortLockedState;
    },

    updateGeometryState(dt) {
        if (this.envelopeConstructionComplete) return;
        this.syncEnvelopeItemCount();
        this.envelopeConstructionProgress = Math.min(
            this.pointCount,
            this.envelopeConstructionProgress + Math.max(1, Number(this.envelopeConstructionSpeed) || 1) * dt
        );
        if (this.envelopeConstructionProgress >= this.pointCount) {
            this.envelopeConstructionProgress = this.pointCount;
            this.envelopeConstructionComplete = true;
            this.isPaused = true;
            if (typeof Core !== 'undefined' && Core.currentCase === this) {
                Core.updateControls();
                Core.updateSortBar();
            }
        }
    },

    updateSimulation(dt) {
        if (!this.isPaused) {
            this.updateGeometryState(dt);
        }
        this.updateVisualState(dt);
    },

    updateVisualState(dt) {
        this.updateSortingState(dt);
        this.updateShuffleAnimation(dt);
        this.updateShuffleFlash(dt);
    },

    drawGeometryOverlay(ctx, viewState) {
        // Cleaning up all auxiliary lines as requested
    },

    drawHud(ctx, viewState) {
        if (!this.showHud) return;

        const { n, sortingActive, sortView, sortPlan } = viewState;
        const formatSortSeconds = (seconds) => `${Math.max(0, seconds).toFixed(1)}s`;

        // --- Left-aligned Sort HUD (Restored, Show ONLY during active Sort) ---
        if (this.envelopeConstructionComplete && sortingActive) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.font = '600 14px "Inter", "IBM Plex Sans", system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            let sortTimeLabel = '0.0s / 0.0s';
            const effectiveSpeed = typeof this.getEffectiveSortSpeed === 'function' ? this.getEffectiveSortSpeed() : (this.sortSpeed || 150);
            if (this.isSortModeAvailable() && effectiveSpeed > 0) {
                const totalSteps = sortPlan?.totalSteps || this.getSortTotalSteps(viewState.provider);
                const elapsedSeconds = this.sortProgress / effectiveSpeed;
                const totalSeconds = totalSteps / effectiveSpeed;
                sortTimeLabel = `${formatSortSeconds(elapsedSeconds)} / ${formatSortSeconds(totalSeconds)}`;
            }

            let currentSortLabel = 'Radix';
            if (this.sortMode === 'lsh') currentSortLabel = 'L-S-H Radix';
            if (this.sortMode === 'hue') currentSortLabel = 'Hue Radix';
            if (this.sortMode === 'bubble') currentSortLabel = 'Bubble Sort';
            if (this.sortMode === 'quick') currentSortLabel = 'Quick Sort';
            if (this.sortMode === 'insertion') currentSortLabel = 'Insertion Sort';
            if (this.sortMode === 'selection') currentSortLabel = 'Selection Sort';

            let nextLY = 24;
            ctx.fillText(`Sort: ${currentSortLabel}`, 24, nextLY);
            nextLY += 22;
            ctx.fillText(`Sort Time: ${sortTimeLabel}`, 24, nextLY);
            nextLY += 22;

            if (sortView) {
                const digitLabel = sortView.passLabel || sortPlan?.passes?.[sortView.passIndex]?.label || `Pass ${sortView.passNumber}`;
                let detailLabel = `Pass: ${digitLabel}`;
                if (sortView.activeDigit != null) {
                    detailLabel = `Bucket: ${sortView.activeDigit}`;
                } else if (sortView.activeIndices) {
                    detailLabel = `Pair: ${sortView.activeIndices[0]} ↔ ${sortView.activeIndices[1]}`;
                }
                ctx.fillText(detailLabel, 24, nextLY);
            }
            ctx.restore();
        }


        // --- Right-aligned Info Panel (Restored) ---
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.font = '600 14px "Inter", "IBM Plex Sans", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        let nextRY = 24;
        ctx.fillText(`Node: ${n}`, viewState.w - 24, nextRY);
        nextRY += 22;
        ctx.fillText(`Axes: ${this.getEnvelopeAxesCount()}`, viewState.w - 24, nextRY);
        nextRY += 22;
        ctx.fillText(`Layers: ${this.getEnvelopeLayerCount()}`, viewState.w - 24, nextRY);
        ctx.restore();


        // --- Left-aligned Progress Panel (Bottom) ---
        if (!this.envelopeConstructionComplete) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 209, 102, 0.95)';
            ctx.font = '700 16px IBM Plex Sans, sans-serif';
            ctx.fillText(
                `Build ${Math.floor(this.envelopeConstructionProgress)} / ${this.pointCount}`,
                24,
                viewState.h - 24
            );
            ctx.restore();
        }
    },

    showGuide() {
        const existing = document.getElementById('envelope-radial-guide-modal');
        if (existing) {
            existing.style.display = 'flex';
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'envelope-radial-guide-modal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.zIndex = '2000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(0, 0, 0, 0.62)';
        modal.style.backdropFilter = 'blur(4px)';

        const card = document.createElement('div');
        card.style.width = 'min(760px, 92vw)';
        card.style.maxHeight = '82vh';
        card.style.overflow = 'auto';
        card.style.background = '#ffffff';
        card.style.borderRadius = '16px';
        card.style.padding = '20px';
        card.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.35)';
        card.style.border = '1px solid #e5e7eb';

        const title = document.createElement('div');
        title.textContent = 'Envelope Radial Guide';
        title.style.fontSize = '1.15rem';
        title.style.fontWeight = '700';
        title.style.color = '#1f2937';
        title.style.marginBottom = '12px';

        const pre = document.createElement('pre');
        pre.textContent = this.guideText;
        pre.style.margin = '0';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-word';
        pre.style.lineHeight = '1.65';
        pre.style.fontSize = '1rem';
        pre.style.color = '#111827';
        pre.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

        const close = document.createElement('button');
        close.textContent = '닫기';
        close.style.marginTop = '16px';
        close.style.padding = '10px 16px';
        close.style.borderRadius = '999px';
        close.style.border = '1px solid #d1d5db';
        close.style.background = '#f8fafc';
        close.style.cursor = 'pointer';
        close.onclick = () => {
            modal.style.display = 'none';
        };

        card.appendChild(title);
        card.appendChild(pre);
        card.appendChild(close);
        modal.appendChild(card);
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
        document.body.appendChild(modal);
    }
};

Object.setPrototypeOf(EnvelopeRadialCase, CardioidCircleCase);

if (typeof EnvelopeRadialGeometryProvider !== 'undefined') {
    Object.assign(EnvelopeRadialCase, EnvelopeRadialGeometryProvider);
}
