/**
 * CardioidCircleCase
 * Times-table cardioid circle animation inspired by Mathologer / Red Blob.
 */
const CardioidCircleCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,
    isPaused: CardioidCaseDefaults.isPaused,

    pointCount: CardioidCaseDefaults.pointCount,
    multiplier: CardioidCaseDefaults.multiplier,
    multiplierSpeed: CardioidCaseDefaults.multiplierSpeed,
    lineWidth: CardioidCaseDefaults.lineWidth,
    lineAlpha: CardioidCaseDefaults.lineAlpha,
    pointRadius: CardioidCaseDefaults.pointRadius,
    showPoints: CardioidCaseDefaults.showPoints,
    showHud: CardioidCaseDefaults.showHud,
    integersOnly: CardioidCaseDefaults.integersOnly,
    colorMode: CardioidCaseDefaults.colorMode, // monochrome | angle | lsh | length | origin
    renderMode: CardioidCaseDefaults.renderMode, // glow | light
    sortMode: CardioidCaseDefaults.sortMode, // off | hue | lsh | bubble | quick | insertion | selection
    sortingStatus: CardioidCaseDefaults.sortingStatus, // idle | running | holding | completed
    sortSpeed: CardioidCaseDefaults.sortSpeed,
    sortProgress: CardioidCaseDefaults.sortProgress,
    sortPlan: CardioidCaseDefaults.sortPlan,
    sortSignature: CardioidCaseDefaults.sortSignature,
    sortLockedState: CardioidCaseDefaults.sortLockedState,
    sortPanelPosition: CardioidCaseDefaults.sortPanelPosition,
    sortPanelDrag: CardioidCaseDefaults.sortPanelDrag,
    shuffleNonce: CardioidCaseDefaults.shuffleNonce,
    shuffleOrder: CardioidCaseDefaults.shuffleOrder,
    shuffleSignature: CardioidCaseDefaults.shuffleSignature,
    shuffleFlash: CardioidCaseDefaults.shuffleFlash,
    shuffleAnimation: CardioidCaseDefaults.shuffleAnimation,
    rotation: CardioidCaseDefaults.rotation,
    circleBulge: CardioidCaseDefaults.circleBulge,
    learningMode: CardioidCaseDefaults.learningMode, // off | n-ramp | m-ramp | gcd | integer-snap | mapping | classic | ultimate | mirror-chaos
    currentPreset: '0_default',

    applyPreset(presetId) {
        this.currentPreset = presetId;
        if (presetId === '0_default') {
            this.pointCount = 360;
            this.multiplier = 2.0;
            this.multiplierSpeed = 0;
            this.integersOnly = true;
            this.learningMode = '0_default'; // Ensure UI stay on 0_default
            this.colorMode = 'angle';
            this.lineAlpha = 0.45;
            this.lineWidth = 1.65;
            this.renderMode = 'light';
        }
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    classicTargets: CardioidCaseDefaults.classicTargets.slice(),
    classicIndex: CardioidCaseDefaults.classicIndex,
    classicDuration: CardioidCaseDefaults.classicDuration,
    classicTimer: CardioidCaseDefaults.classicTimer,
    ultimateTargets: CardioidCaseDefaults.ultimateTargets.slice(),
    ultimateIndex: CardioidCaseDefaults.ultimateIndex,
    ultimateTimer: CardioidCaseDefaults.ultimateTimer,
    ultimateDuration: CardioidCaseDefaults.ultimateDuration,
    mirrorTargets: CardioidCaseDefaults.mirrorTargets.slice(),
    mirrorIndex: CardioidCaseDefaults.mirrorIndex,
    mirrorTimer: CardioidCaseDefaults.mirrorTimer,
    mirrorDuration: CardioidCaseDefaults.mirrorDuration,
    learnFixedM: CardioidCaseDefaults.learnFixedM,
    learnN: CardioidCaseDefaults.learnN,
    nRampSlowRate: CardioidCaseDefaults.nRampSlowRate,
    nRampFastRate: CardioidCaseDefaults.nRampFastRate,
    nRampSwitchN: CardioidCaseDefaults.nRampSwitchN,
    nRampMaxN: CardioidCaseDefaults.nRampMaxN,
    mRampFixedN: CardioidCaseDefaults.mRampFixedN,
    mRampRate: CardioidCaseDefaults.mRampRate,
    mRampAccel: CardioidCaseDefaults.mRampAccel,
    mRampEffectiveRate: CardioidCaseDefaults.mRampEffectiveRate,
    snapRate: CardioidCaseDefaults.snapRate,
    demoIndex: CardioidCaseDefaults.demoIndex,
    demoAuto: CardioidCaseDefaults.demoAuto,
    demoRate: CardioidCaseDefaults.demoRate,
    guideText: [
        '[Cardioid Circle 컨트롤 설명]',
        '- Pattern Mode: 패턴 변화/학습 표현 모드 선택.',
        '- N (Points): 원 위 점 개수. 커질수록 패턴이 촘촘해짐.',
        '- M (Multiplier): i -> (M*i) mod N 연결 규칙의 핵심 값.',
        '- M Speed: 회전이 아니라 M 변화 속도. +면 증가, -면 감소.',
        '- N Ramp: M 고정 후 N 슬라이더로 점 개수를 수동 조절.',
        '- M Ramp: N 고정 후 M 증가 + 후반 가속.',
        '- GCD Mode: gcd(N, M)가 루프 분할 구조에 미치는 영향 시각화.',
        '- Integer Snap: M을 정수 단계로만 진행해 대표 패턴 확인.',
        '- Mapping Step: 한 번에 한 선만 강조해 연결 원리를 학습.',
        '- Mapping 공식: j = (M*i) mod N.',
        '- Mapping 표시: 시작점 i, 도착점 j, i->j 강조선, 하단 계산식.',
        '- Mapping Auto Step: i를 자동으로 증가시키며 연속 시연.',
        '- Mapping i: 현재 추적 중인 시작점 인덱스.',
        '- Line Alpha: 선 투명도.',
        '- Render: Glow는 겹칠수록 밝아지고, Light는 겹쳐도 더 밝아지지 않음.',
        '- Color: Angle/Length/Origin/Monochrome 색 기준.',
        '- Integers Only: M을 정수로 반올림해 단계적으로 변화.',
        '- HUD: 좌상단 수치 표시 On/Off.',
        '- Reset/Resume: 상단 Master Controls 버튼 사용.',
        '- Reset 시 기본 세팅(N=250, M=0, M Speed=0.00)으로 복귀.',
        '',
        '[하트를 만드는 3가지 마법 공식 & 예시]',
        '1. 정통 하트 (M = 2)',
        ' - 저: (N=360, M=2) / 중: (N=720, M=2) / 고: (N=1440, M=2)',
        '2. 거울 하트 (M = N/2 + 1)',
        ' - 저: (N=360, M=181) / 중: (N=720, M=361) / 고: (N=1440, M=721)',
        '3. 보석 미러 하트 (M = N/2 + 1.5)',
        ' - 저: (N=360, M=181.5) / 중: (N=720, M=361.5) / 고: (N=1440, M=721.5)',
        '',
        '[그 외 환상적인 수학적 패턴들]',
        '1. 거미줄 (Spider Web): (N=1500, M=1.005) *공식: M = 1 + 소수',
        '2. 10엽화 꽃 (Flower): (N=1000, M=11.0) *공식: M = 꽃잎수 + 1',
        '3. 황금비 (Golden Ratio): (N=1200, M=1.618) *공식: M = 1.618'
    ].join('\n'),

    get uiConfig() {
        return SortColorControlFactory.createCardioidControls(this);
    },

    showGuide() {
        const existing = document.getElementById('cardioid-guide-modal');
        if (existing) {
            existing.style.display = 'flex';
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'cardioid-guide-modal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.zIndex = '2000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(0, 0, 0, 0.62)';
        modal.style.backdropFilter = 'blur(4px)';

        const card = document.createElement('div');
        card.style.width = 'min(920px, 92vw)';
        card.style.maxHeight = '82vh';
        card.style.overflow = 'auto';
        card.style.background = '#ffffff';
        card.style.borderRadius = '16px';
        card.style.padding = '20px';
        card.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.35)';
        card.style.border = '1px solid #e5e7eb';

        const title = document.createElement('div');
        title.textContent = 'Cardioid Circle Guide';
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
    },

    reset() {
        Object.assign(this, CardioidCaseDefaults, {
            classicTargets: CardioidCaseDefaults.classicTargets.slice(),
            ultimateTargets: CardioidCaseDefaults.ultimateTargets.slice(),
            mirrorTargets: CardioidCaseDefaults.mirrorTargets.slice()
        });
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    bindCanvasInteractions() {
        if (!this.canvas || this._canvasInteractionsBound) return;
        this._canvasInteractionsBound = true;

        this._handleCanvasPointerDown = (e) => {
            if (this.sortMode === 'bubble' || this.sortMode === 'quick' || this.sortMode === 'insertion' || this.sortMode === 'selection') return;
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

    circlePoint(i, n, radius, cx, cy) {
        return this.getCardioidPoint(i, n, radius, cx, cy);
    },

    circlePointByIndex(index, n, radius, cx, cy) {
        return this.getCardioidPointByIndex(index, n, radius, cx, cy);
    },

    lineVisual(i, n, from, to, radius, alphaOverride = null) {
        return this.getCardioidLineVisual(i, n, from, to, radius, alphaOverride);
    },

    lineColor(i, n, from, to, radius) {
        return this.getCardioidLineColor(i, n, from, to, radius);
    },

    updateSimulation(dt) {
        if (!this.isPaused) {
            this.updateGeometryState(dt);
        }
        this.updateVisualState(dt);
    },

    togglePatternSimulation(mode) {
        if (mode && mode.startsWith('0_')) {
            // Placeholder: currently 0_default acts as standard play/pause
            if (!this.animationId) this.start();
            this.setPaused(!this.isPaused);
        }
    },

    shuffleScene() {
        this.shuffleChords();
    },

    updateVisualState(dt) {
        this.updateSortingState(dt);
        this.updateShuffleAnimation(dt);
        this.updateShuffleFlash(dt);
    },
};

if (typeof CardioidGeometryProvider !== 'undefined') {
    Object.assign(CardioidCircleCase, CardioidGeometryProvider);
}

if (typeof ColorKeyEngine !== 'undefined') {
    Object.assign(CardioidCircleCase, ColorKeyEngine);
}

if (typeof SortEngine !== 'undefined') {
    Object.assign(CardioidCircleCase, SortEngine);
}

if (typeof SortRenderer !== 'undefined') {
    Object.assign(CardioidCircleCase, SortRenderer);
}

if (typeof SortColorCaseBase !== 'undefined') {
    Object.assign(CardioidCircleCase, SortColorCaseBase);
}

if (typeof CardioidLearningManager !== 'undefined') {
    Object.assign(CardioidCircleCase, CardioidLearningManager);
}
