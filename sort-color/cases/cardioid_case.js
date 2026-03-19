/**
 * CardioidCircleCase
 * Times-table cardioid circle animation inspired by Mathologer / Red Blob.
 */
const CardioidCircleCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,
    isPaused: false,

    pointCount: 250,
    multiplier: 0,
    multiplierSpeed: 0,
    lineWidth: 1.85,
    lineAlpha: 0.4,
    pointRadius: 1.1,
    showPoints: false,
    showHud: true,
    integersOnly: false,
    colorMode: 'angle', // monochrome | angle | length | origin
    renderMode: 'light', // glow | light
    sortMode: 'off', // off | hue | lsh
    sortingStatus: 'idle', // idle | running | holding | completed
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
    learningMode: 'off', // off | n-ramp | m-ramp | gcd | integer-snap | mapping | classic | ultimate | mirror-chaos
    classicTargets: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    classicIndex: 0,
    classicDuration: 5.0,
    classicTimer: 0,
    ultimateTargets: [2, 2.1, 1.618, 2.5, 3, 3.14159, 3.5, 4, 5, 8, 13, 21, 34, 55, 67, 89, 99],
    ultimateIndex: 0,
    ultimateTimer: 0,
    ultimateDuration: 5.0,
    mirrorTargets: [2.5, 3.5, 4.5, 6.66, 13.13, 181, 181.5, 359, 359.7],
    mirrorIndex: 0,
    mirrorTimer: 0,
    mirrorDuration: 5.0,
    learnFixedM: 0,
    learnN: 0,
    nRampSlowRate: 12,
    nRampFastRate: 220,
    nRampSwitchN: 120,
    nRampMaxN: 1200,
    mRampFixedN: 420,
    mRampRate: 0.7,
    mRampAccel: 0.035,
    mRampEffectiveRate: 0.7,
    snapRate: 0.45,
    demoIndex: 0,
    demoAuto: true,
    demoRate: 4.0,
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

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.bindCanvasInteractions();
        this.resize();
        this.draw();
    },

    get uiConfig() {
        const controls = this.getBaseControls();
        this.appendLearningModeControls(controls);
        return controls;
    },

    getBaseControls() {
        return [
            {
                type: 'button',
                id: 'cd_play_toggle',
                label: '',
                value: this.isPaused ? 'PLAY (Resume)' : 'HOLD (Stop)',
                onClick: () => {
                    if (!this.animationId) this.start();
                    this.setPaused(!this.isPaused);
                    if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
                }
            },
            {
                type: 'select',
                id: 'mc_mode',
                label: 'Pattern Mode',
                value: this.learningMode,
                options: [
                    { value: 'off', label: 'Standard' },
                    { value: 'n-ramp', label: 'N Ramp' },
                    { value: 'm-ramp', label: 'M Ramp' },
                    { value: 'gcd', label: 'GCD Loops' },
                    { value: 'integer-snap', label: 'Integer Snap' },
                    { value: 'mapping', label: 'Mapping' },
                    { value: 'classic', label: 'Classic' },
                    { value: 'ultimate', label: 'Ultimate' },
                    { value: 'mirror-chaos', label: 'Mirror & Chaos' }
                ],
                onChange: (v) => {
                    this.setLearningMode(v);
                }
            },
            {
                type: 'slider',
                id: 'mc_n',
                label: 'N (Points)',
                min: 0,
                max: this.learningMode === 'n-ramp' ? 1000 : 1500,
                step: 1,
                value: this.pointCount,
                onChange: (v) => {
                    if (this.learningMode === 'n-ramp') {
                        this.learnN = Math.max(0, Math.floor(v));
                    } else {
                        this.pointCount = Math.max(0, Math.floor(v));
                    }
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_m',
                label: 'M (Multiplier)',
                min: 0,
                max: 1000,
                step: 0.001,
                decimals: 2,
                value: this.multiplier,
                onChange: (v) => {
                    this.multiplier = v;
                    if (this.learningMode === 'n-ramp') {
                        this.learnFixedM = v;
                    }
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_speed',
                label: 'M Speed',
                min: -2,
                max: 2,
                step: 0.001,
                value: this.multiplierSpeed,
                onChange: (v) => {
                    this.multiplierSpeed = v;
                }
            },
            {
                type: 'slider',
                id: 'mc_alpha',
                label: 'Line Alpha',
                min: 0.05,
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
                    { value: 'angle', label: 'Angle' },
                    { value: 'length', label: 'Length' },
                    { value: 'origin', label: 'Origin' },
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
                    if (typeof Core !== 'undefined' && typeof Core.playGameSound === 'function') {
                        Core.playGameSound('shuffle');
                    }
                    this.shuffleScene();
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
                max: 1000,
                step: 1,
                value: this.sortSpeed,
                onChange: (v) => {
                    this.sortSpeed = Math.max(1, v);
                }
            },
            {
                type: 'select',
                id: 'mc_int',
                label: 'Integers Only',
                value: this.integersOnly ? 'on' : 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                ],
                onChange: (v) => {
                    this.integersOnly = v === 'on';
                    this.restartSort();
                    this.draw();
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
                id: 'mc_help',
                label: 'Guide',
                value: '설명서 보기',
                onClick: () => this.showGuide()
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

    appendLearningModeControls(controls) {
        if (this.learningMode === 'n-ramp') {
            controls.push(
                {
                    type: 'slider',
                    id: 'mc_nr_m',
                    label: 'N Ramp: Fixed M',
                    min: 0,
                    max: 1000,
                    step: 0.1,
                    value: this.learnFixedM,
                    onChange: (v) => {
                        this.learnFixedM = v;
                        this.multiplier = v;
                        this.draw();
                    }
                },
                {
                    type: 'slider',
                    id: 'mc_nr_slow',
                    label: 'N Ramp: Slow Speed',
                    min: 1,
                    max: 80,
                    step: 1,
                    value: this.nRampSlowRate,
                    onChange: (v) => { this.nRampSlowRate = v; }
                },
                {
                    type: 'slider',
                    id: 'mc_nr_fast',
                    label: 'N Ramp: Fast Speed',
                    min: 20,
                    max: 500,
                    step: 1,
                    value: this.nRampFastRate,
                    onChange: (v) => { this.nRampFastRate = v; }
                },
                {
                    type: 'slider',
                    id: 'mc_nr_switch',
                    label: 'N Ramp: Switch At N',
                    min: 10,
                    max: 1000,
                    step: 1,
                    value: this.nRampSwitchN,
                    onChange: (v) => { this.nRampSwitchN = Math.floor(v); }
                },
                {
                    type: 'button',
                    id: 'mc_nr_restart',
                    label: 'Restart N Ramp',
                    value: 'N Ramp 재시작',
                    onClick: () => {
                        this.learnN = 0;
                        this.pointCount = 0;
                        this.multiplier = this.learnFixedM;
                        this.resetSortState('idle');
                        this.draw();
                    }
                }
            );
        }
        if (this.learningMode === 'm-ramp') {
            controls.push(
                {
                    type: 'slider',
                    id: 'mc_mr_n',
                    label: 'M Ramp: Fixed N',
                    min: 1,
                    max: 1500,
                    step: 1,
                    value: this.mRampFixedN,
                    onChange: (v) => {
                        this.mRampFixedN = Math.max(1, Math.floor(v));
                        this.pointCount = this.mRampFixedN;
                        this.draw();
                    }
                },
                {
                    type: 'slider',
                    id: 'mc_mr_speed',
                    label: 'M Ramp: M Speed',
                    min: -4,
                    max: 4,
                    step: 0.01,
                    value: this.mRampRate,
                    onChange: (v) => { this.mRampRate = v; }
                },
                {
                    type: 'slider',
                    id: 'mc_mr_accel',
                    label: 'M Ramp: Accel',
                    min: 0,
                    max: 0.2,
                    step: 0.005,
                    value: this.mRampAccel,
                    onChange: (v) => { this.mRampAccel = v; }
                }
            );
        }
        if (this.learningMode === 'integer-snap') {
            controls.push({
                type: 'slider',
                id: 'mc_snap_speed',
                label: 'Integer Snap Speed',
                min: -3,
                max: 3,
                step: 0.01,
                value: this.snapRate,
                onChange: (v) => { this.snapRate = v; }
            });
        }
        if (this.learningMode === 'mapping') {
            controls.push(
                {
                    type: 'slider',
                    id: 'mc_demo_i',
                    label: 'Mapping i',
                    min: 0,
                    max: Math.max(0, Math.floor(this.pointCount) - 1),
                    step: 1,
                    value: Math.floor(this.demoIndex),
                    onChange: (v) => {
                        this.demoIndex = Math.floor(v);
                        this.draw();
                    }
                },
                {
                    type: 'select',
                    id: 'mc_demo_auto',
                    label: 'Mapping Auto Step',
                    value: this.demoAuto ? 'on' : 'off',
                    options: [
                        { value: 'on', label: 'On' },
                        { value: 'off', label: 'Off' }
                    ],
                    onChange: (v) => { this.demoAuto = v === 'on'; }
                },
                {
                    type: 'slider',
                    id: 'mc_demo_rate',
                    label: 'Mapping Step Speed',
                    min: 0.5,
                    max: 20,
                    step: 0.5,
                    value: this.demoRate,
                    onChange: (v) => { this.demoRate = v; }
                }
            );
        }
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
        this.pointCount = 250;
        this.multiplier = 0;
        this.multiplierSpeed = 0;
        this.lineWidth = 1.85;
        this.lineAlpha = 0.4;
        this.integersOnly = false;
        this.colorMode = 'angle';
        this.renderMode = 'light';
        this.sortMode = 'off';
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
        this.showHud = true;
        this.isPaused = false;
        this.sortingStatus = 'idle';
        this.learningMode = 'off';
        this.learnFixedM = 0;
        this.learnN = 0;
        this.nRampSlowRate = 12;
        this.nRampFastRate = 220;
        this.nRampSwitchN = 120;
        this.nRampMaxN = 1200;
        this.mRampFixedN = 420;
        this.mRampRate = 0.7;
        this.mRampAccel = 0.035;
        this.mRampEffectiveRate = 0.7;
        this.snapRate = 0.45;
        this.demoIndex = 0;
        this.demoAuto = true;
        this.demoRate = 4.0;
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

    positiveMod(v, n) {
        if (n <= 0) return 0;
        return ((v % n) + n) % n;
    },

    setLearningMode(mode) {
        this.learningMode = mode || 'off';
        this.applyLearningModeState();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
        this.draw();
    },

    applyLearningModeState() {
        if (this.learningMode === 'n-ramp') {
            this.learnN = Math.max(0, Math.floor(this.pointCount));
            this.learnFixedM = 0;
            this.multiplier = 0;
        }
        if (this.learningMode === 'm-ramp') {
            this.mRampFixedN = Math.max(1, Math.floor(this.pointCount) || 1);
        }
        if (this.learningMode === 'mapping') {
            this.demoIndex = 0;
        }
        if (this.learningMode === 'classic') {
            this.classicTimer = 0;
            this.classicIndex = 0;
            this.multiplier = this.classicTargets[this.classicIndex];
            this.pointCount = 360;
        }
        if (this.learningMode === 'ultimate') {
            this.ultimateTimer = 0;
            this.ultimateIndex = 0;
            this.multiplier = this.ultimateTargets[this.ultimateIndex];
            this.pointCount = 360;
        }
        if (this.learningMode === 'mirror-chaos') {
            this.mirrorTimer = 0;
            this.mirrorIndex = 0;
            this.multiplier = this.mirrorTargets[this.mirrorIndex];
            this.pointCount = 360;
        }
    },

    updateSimulation(dt) {
        if (!this.isPaused) {
            this.updateGeometryState(dt);
        }
        this.updateVisualState(dt);
    },

    shuffleScene() {
        this.shuffleChords();
    },

    updateGeometryState(dt) {
        if (this.updateLearningModeSimulation(dt)) return;
        this.updateFreeRunMultiplier(dt);
    },

    updateVisualState(dt) {
        this.updateSortingState(dt);
        this.updateShuffleAnimation(dt);
        this.updateShuffleFlash(dt);
    },

    updateLearningModeSimulation(dt) {
        if (this.learningMode === 'n-ramp') {
            this.multiplier = this.learnFixedM;
            const speed = this.learnN < this.nRampSwitchN ? this.nRampSlowRate : this.nRampFastRate;
            this.learnN += speed * dt;
            if (this.learnN > this.nRampMaxN) this.learnN = 0;
            this.pointCount = Math.max(0, Math.floor(this.learnN));
            return true;
        }
        if (this.learningMode === 'm-ramp') {
            this.pointCount = Math.max(1, Math.floor(this.mRampFixedN));
            const sign = this.mRampRate === 0 ? 0 : Math.sign(this.mRampRate);
            const base = Math.abs(this.mRampRate);
            const growth = 1 + Math.max(0, Math.abs(this.multiplier)) * this.mRampAccel;
            this.mRampEffectiveRate = sign * base * growth;
            this.multiplier += this.mRampEffectiveRate * dt;
            if (this.multiplier >= 100) {
                this.multiplier = 100;
                if (this.mRampEffectiveRate > 0) this.mRampEffectiveRate = 0;
            } else if (this.multiplier <= 0) {
                this.multiplier = 0;
                if (this.mRampEffectiveRate < 0) this.mRampEffectiveRate = 0;
            }
            return true;
        }
        if (this.learningMode === 'integer-snap') {
            this.multiplier += this.snapRate * dt;
            return true;
        }
        if (this.learningMode === 'mapping') {
            if (this.demoAuto && this.pointCount > 0) {
                this.demoIndex += this.demoRate * dt;
                const n = Math.max(1, Math.floor(this.pointCount));
                if (this.demoIndex >= n) this.demoIndex = this.demoIndex % n;
            }
            this.multiplier += this.multiplierSpeed * dt;
            return true;
        }
        if (this.learningMode === 'classic') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'classicTimer',
                duration: this.classicDuration,
                indexKey: 'classicIndex',
                targets: this.classicTargets,
                holdTime: 2.0
            });
            return true;
        }
        if (this.learningMode === 'ultimate') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'ultimateTimer',
                duration: this.ultimateDuration,
                indexKey: 'ultimateIndex',
                targets: this.ultimateTargets,
                holdTime: 1.0
            });
            return true;
        }
        if (this.learningMode === 'mirror-chaos') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'mirrorTimer',
                duration: this.mirrorDuration,
                indexKey: 'mirrorIndex',
                targets: this.mirrorTargets,
                holdTime: 1.0
            });
            return true;
        }
        return false;
    },

    updateTimedLearningMode(dt, config) {
        this[config.timerKey] += dt;
        if (this[config.timerKey] >= config.duration) {
            this[config.timerKey] = 0;
            this[config.indexKey] = (this[config.indexKey] + 1) % config.targets.length;
        }

        const currentM = config.targets[this[config.indexKey]];
        if (this[config.timerKey] < config.holdTime) {
            this.multiplier = currentM;
            return;
        }

        const t = (this[config.timerKey] - config.holdTime) / (config.duration - config.holdTime);
        const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
        const nextIndex = (this[config.indexKey] + 1) % config.targets.length;
        const nextM = config.targets[nextIndex];
        this.multiplier = currentM + (nextM - currentM) * ease;
    },

    updateShuffleFlash(dt) {
        if (this.shuffleFlash > 0) {
            this.shuffleFlash = Math.max(0, this.shuffleFlash - dt * 1.8);
        }
    },

    updateFreeRunMultiplier(dt) {
        this.multiplier += this.multiplierSpeed * dt;
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
