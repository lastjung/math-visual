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
    isPaused: true,
    envelopeAxesCount: 4,
    envelopeLinesPerSector: 32,
    envelopeConstructionSpeed: 72,
    envelopeConstructionProgress: 0,
    envelopeConstructionComplete: false,
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
        this.rotation = -Math.PI / 2;
        this.learningMode = 'off';
        this.isPaused = true;
        this.envelopeAxesCount = 4;
        this.envelopeLinesPerSector = 32;
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

    toggleBuildPlayback() {
        if (this.envelopeConstructionComplete) return;
        this.setPaused(!this.isPaused);
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
        const axesCount = this.getEnvelopeAxesCount();
        const radius = viewState.radius;
        const cx = viewState.cx;
        const cy = viewState.cy;

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        for (let axisIndex = 0; axisIndex < axesCount; axisIndex++) {
            const anchor = this.getEnvelopeRadialAnchor(axisIndex, 1, radius, cx, cy);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(anchor.x, anchor.y);
            ctx.stroke();
        }
        ctx.restore();
    },

    drawHud(ctx, viewState) {
        SortRenderer.drawHud.call(this, ctx, viewState);
        if (!this.showHud) return;

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Axes: ${this.getEnvelopeAxesCount()}`, viewState.w - 24, 74);
        ctx.fillText(`Lines/Sector: ${this.getEnvelopeLinesPerSector()}`, viewState.w - 24, 96);
        ctx.restore();

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
