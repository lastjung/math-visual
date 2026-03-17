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
    multiplier: 40,
    multiplierSpeed: 0,
    lineWidth: 1.85,
    lineAlpha: 0.4,
    pointRadius: 1.1,
    showPoints: false,
    showHud: true,
    integersOnly: false,
    colorMode: 'angle', // monochrome | angle | length | origin
    sortMode: 'off', // off | hue | lsh
    sortingStatus: 'idle', // idle | running | completed
    sortSpeed: 48,
    sortProgress: 0,
    sortPlan: null,
    sortSignature: '',
    shuffleNonce: 0,
    shuffleOrder: null,
    shuffleSignature: '',
    shuffleFlash: 0,
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
        '- Learning Mode: 교육용 시뮬레이션 모드 선택.',
        '- N (Points): 원 위 점 개수. 커질수록 패턴이 촘촘해짐.',
        '- M (Multiplier): i -> (M*i) mod N 연결 규칙의 핵심 값.',
        '- M Speed: 회전이 아니라 M 변화 속도. +면 증가, -면 감소.',
        '- N Ramp: M 고정 후 N이 느리게->빠르게 증가.',
        '- M Ramp: N 고정 후 M 증가 + 후반 가속.',
        '- GCD Mode: gcd(N, M)가 루프 분할 구조에 미치는 영향 시각화.',
        '- Integer Snap: M을 정수 단계로만 진행해 대표 패턴 확인.',
        '- Mapping Step: 한 번에 한 선만 강조해 연결 원리를 학습.',
        '- Mapping 공식: j = (M*i) mod N.',
        '- Mapping 표시: 시작점 i, 도착점 j, i->j 강조선, 하단 계산식.',
        '- Mapping Auto Step: i를 자동으로 증가시키며 연속 시연.',
        '- Mapping i: 현재 추적 중인 시작점 인덱스.',
        '- Line Alpha: 선 투명도.',
        '- Color: Angle/Length/Origin/Monochrome 색 기준.',
        '- Integers Only: M을 정수로 반올림해 단계적으로 변화.',
        '- HUD: 좌상단 수치 표시 On/Off.',
        '- Reset/Resume: 상단 Master Controls 버튼 사용.',
        '- Reset 시 기본 세팅(N=250, M=40, M Speed=0.00)으로 복귀.'
    ].join('\n'),

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
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
                id: 'mc_play_toggle',
                label: '',
                value: typeof Core !== 'undefined' && Core.isRunning ? 'HOLD (Stop)' : 'PLAY (Resume)',
                onClick: () => {
                    if (typeof Core !== 'undefined') {
                        Core.togglePlay();
                        Core.updateControls();
                    }
                }
            },
            {
                type: 'select',
                id: 'mc_mode',
                label: 'Learning Mode',
                value: this.learningMode,
                options: [
                    { value: 'off', label: 'Off (Art)' },
                    { value: 'n-ramp', label: 'N Ramp (M Fixed)' },
                    { value: 'm-ramp', label: 'M Ramp (N Fixed)' },
                    { value: 'gcd', label: 'GCD Loops' },
                    { value: 'integer-snap', label: 'Integer Snap' },
                    { value: 'mapping', label: 'Mapping Step' },
                    { value: 'classic', label: 'Classic (Basic)' },
                    { value: 'ultimate', label: 'Ultimate (Premium)' },
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
                max: 1500,
                step: 1,
                value: this.pointCount,
                onChange: (v) => {
                    this.pointCount = Math.max(0, Math.floor(v));
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_m',
                label: 'M (Multiplier)',
                min: 0,
                max: 100,
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
                    this.restartSort();
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
                    { value: 'lsh', label: 'L-S-H Radix' }
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
                    max: 50,
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
                        this.multiplier = this.learnFixedM;
                        this.pointCount = 0;
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
        this.multiplier = 40;
        this.multiplierSpeed = 0;
        this.lineWidth = 1.85;
        this.lineAlpha = 0.4;
        this.integersOnly = false;
        this.colorMode = 'angle';
        this.sortMode = 'off';
        this.sortSpeed = 48;
        this.sortProgress = 0;
        this.sortPlan = null;
        this.sortSignature = '';
        this.shuffleNonce = 0;
        this.shuffleOrder = null;
        this.shuffleSignature = '';
        this.shuffleFlash = 0;
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
        this.stop();
    },

    circlePoint(i, n, radius, cx, cy) {
        const t = this.rotation + (Math.PI * 2 * i) / n;
        return { x: cx + radius * Math.cos(t), y: cy + radius * Math.sin(t), t };
    },

    circlePointByIndex(index, n, radius, cx, cy) {
        const wrapped = ((index % n) + n) % n;
        const i0 = Math.floor(wrapped);
        const i1 = (i0 + 1) % n;
        const frac = wrapped - i0;
        const p0 = this.circlePoint(i0, n, radius, cx, cy);
        const p1 = this.circlePoint(i1, n, radius, cx, cy);
        return {
            x: p0.x + (p1.x - p0.x) * frac,
            y: p0.y + (p1.y - p0.y) * frac
        };
    },

    lineVisual(i, n, from, to, radius, alphaOverride = null) {
        const alpha = alphaOverride == null ? this.lineAlpha : alphaOverride;
        if (this.colorMode === 'monochrome') {
            return {
                hue: 160,
                saturation: 46,
                lightness: 80,
                alpha,
                color: `rgba(167, 243, 208, ${alpha})`
            };
        }
        if (this.colorMode === 'angle') {
            const hue = (i / n) * 360;
            return {
                hue,
                saturation: 95,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 95%, 62%, ${alpha})`
            };
        }
        if (this.colorMode === 'origin') {
            const hue = ((Math.atan2(from.y - to.y, from.x - to.x) + Math.PI) / (2 * Math.PI)) * 360;
            return {
                hue,
                saturation: 90,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 90%, 62%, ${alpha})`
            };
        }
        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const ratio = Math.max(0, Math.min(1, len / (2 * radius)));
        const hue = 240 - ratio * 220;
        return {
            hue,
            saturation: 92,
            lightness: 60,
            alpha,
            color: `hsla(${hue}, 92%, 60%, ${alpha})`
        };
    },

    lineColor(i, n, from, to, radius) {
        return this.lineVisual(i, n, from, to, radius).color;
    },

    resetSortState(status = 'idle') {
        this.sortingStatus = status;
        this.sortProgress = 0;
        this.sortPlan = null;
        this.sortSignature = '';
    },

    restartSort() {
        if (this.sortMode === 'off') {
            this.resetSortState('idle');
            return;
        }
        this.resetSortState('running');
        if (typeof Core !== 'undefined' && Core.currentCase === this) {
            Core.updateControls();
        }
    },

    getShuffleSignature(n, m) {
        return [
            n,
            m.toFixed(6),
            this.learningMode,
            this.integersOnly ? 1 : 0,
            this.shuffleNonce
        ].join('|');
    },

    ensureShuffleOrder(n, m) {
        if (n <= 0) {
            this.shuffleOrder = null;
            this.shuffleSignature = '';
            return null;
        }

        const signature = this.getShuffleSignature(n, m);
        if (this.shuffleOrder && this.shuffleSignature === signature && this.shuffleOrder.length === n) {
            return this.shuffleOrder;
        }

        const order = Array.from({ length: n }, (_, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        this.shuffleOrder = order;
        this.shuffleSignature = signature;
        return order;
    },

    shuffleChords() {
        this.shuffleNonce += 1;
        this.shuffleOrder = null;
        this.shuffleSignature = '';
        this.shuffleFlash = 1;
        this.sortMode = 'off';
        this.resetSortState('idle');
    },

    buildChordData(n, m, radius, cx, cy) {
        const shuffleOrder = this.ensureShuffleOrder(n, m);
        const chords = [];
        // 1. 먼저 모든 색상 데이터를 생성
        for (let i = 0; i < n; i++) {
            const visual = this.lineVisual(i, n, { x: 0, y: 0 }, { x: 0, y: 0 }, radius);
            chords.push({
                originalIndex: i,
                hue: visual.hue,
                saturation: visual.saturation,
                lightness: visual.lightness,
                color: visual.color
            });
        }

        // 2. 셔플 상태라면 색상 배열을 섞음
        let finalChords = shuffleOrder ? shuffleOrder.map(idx => chords[idx]) : chords;

        // 3. 현재 배열 순서(k)에 맞춰 기하학적 위치를 부여 (패턴은 유지, 색상만 섞임)
        for (let k = 0; k < n; k++) {
            const from = this.circlePoint(k, n, radius, cx, cy);
            const j = (m * k) % n;
            const to = this.circlePointByIndex(j, n, radius, cx, cy);
            finalChords[k].from = from;
            finalChords[k].to = to;
        }

        return finalChords;
    },

    getHueKey(hue) {
        return Math.max(0, Math.min(359, Math.round(hue)));
    },

    getChannelBucket(value, maxValue) {
        const safe = Math.max(0, Math.min(maxValue, value));
        if (maxValue <= 0) return 0;
        return Math.max(0, Math.min(9, Math.floor((safe / (maxValue + 0.0001)) * 10)));
    },

    getSortSignature(n, m) {
        return [
            n,
            m.toFixed(6),
            this.colorMode,
            this.sortMode,
            this.integersOnly ? 1 : 0,
            this.learningMode
        ].join('|');
    },

    isSortingEnabled() {
        return (this.sortingStatus === 'running' || this.sortingStatus === 'completed') && (this.sortMode === 'hue' || this.sortMode === 'lsh') && (this.learningMode === 'off' || this.isPaused);
    },

    ensureSortPlan(chords, n, m) {
        if (!this.isSortingEnabled() || !n) {
            this.sortPlan = null;
            this.sortSignature = '';
            return null;
        }

        const signature = this.getSortSignature(n, m);
        if (this.sortPlan && this.sortSignature === signature) {
            return this.sortPlan;
        }

        let sourceOrder = chords.map((chord) => {
            const hueKey = this.getHueKey(chord.hue);
            return {
                ...chord,
                hueKey,
                hueBucket: this.getChannelBucket(hueKey, 359),
                saturationBucket: this.getChannelBucket(chord.saturation, 100),
                lightnessBucket: this.getChannelBucket(chord.lightness, 100)
            };
        });
        const passes = [];
        const passDescriptors = this.sortMode === 'lsh'
            ? [
                { key: 'lightnessBucket', label: 'Lightness' },
                { key: 'saturationBucket', label: 'Saturation' },
                { key: 'hueBucket', label: 'Hue' }
            ]
            : [
                { key: 'hueKey', divisor: 1, label: 'Hue 1s' },
                { key: 'hueKey', divisor: 10, label: 'Hue 10s' },
                { key: 'hueKey', divisor: 100, label: 'Hue 100s' }
            ];

        for (const descriptor of passDescriptors) {
            const buckets = Array.from({ length: 10 }, () => []);
            const digits = [];

            sourceOrder.forEach((entry) => {
                const digit = descriptor.divisor
                    ? Math.floor(entry[descriptor.key] / descriptor.divisor) % 10
                    : entry[descriptor.key];
                digits.push(digit);
                buckets[digit].push(entry);
            });

            const order = buckets.flat();
            passes.push({
                digitDivisor: descriptor.divisor || 1,
                label: descriptor.label,
                sourceOrder,
                digits,
                order,
                bucketCounts: buckets.map((bucket) => bucket.length)
            });
            sourceOrder = order;
        }

        this.sortPlan = {
            passes,
            totalSteps: passes.length * n
        };
        this.sortSignature = signature;
        return this.sortPlan;
    },

    getSortViewState(plan) {
        if (!plan || !plan.passes.length) return null;

        const totalSteps = plan.totalSteps;
        const completedSteps = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));
        if (completedSteps >= totalSteps) {
            const finalPass = plan.passes[plan.passes.length - 1];
            return {
                passIndex: plan.passes.length - 1,
                passNumber: plan.passes.length,
                totalPasses: plan.passes.length,
                stepInPass: finalPass.order.length,
                totalInPass: finalPass.order.length,
                activeDigit: null,
                bucketCounts: finalPass.bucketCounts,
                completed: true,
                drawEntries: finalPass.order,
                coloredCount: finalPass.order.length
            };
        }

        const passLength = plan.passes[0].sourceOrder.length;
        const passIndex = Math.floor(completedSteps / passLength);
        const stepInPass = completedSteps % passLength;
        const pass = plan.passes[passIndex];
        const processedBuckets = Array.from({ length: 10 }, () => []);

        for (let i = 0; i < stepInPass; i++) {
            processedBuckets[pass.digits[i]].push(pass.sourceOrder[i]);
        }

        const drawEntries = processedBuckets.flat().concat(pass.sourceOrder.slice(stepInPass));
        const activeDigit = stepInPass < pass.digits.length ? pass.digits[stepInPass] : null;

        return {
            passIndex,
            passNumber: passIndex + 1,
            totalPasses: plan.passes.length,
            stepInPass,
            totalInPass: pass.sourceOrder.length,
            activeDigit,
            bucketCounts: pass.bucketCounts,
            completed: false,
            drawEntries,
            coloredCount: stepInPass
        };
    },

    drawSortBuckets(ctx, w, h, sortView) {
        if (!sortView) return;

        const panelW = 216;
        const panelH = 124;
        const panelX = w - panelW - 24;
        const panelY = h - panelH - 24;
        const maxCount = Math.max(1, ...sortView.bucketCounts);
        const chartTop = panelY + 34;
        const chartBottom = panelY + panelH - 24;
        const chartHeight = chartBottom - chartTop;
        const barW = 14;
        const gap = 6;

        ctx.save();
        ctx.fillStyle = 'rgba(10, 14, 24, 0.82)';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 12px Inter, system-ui, sans-serif';
        ctx.fillText('Hue Buckets', panelX + 14, panelY + 20);

        for (let digit = 0; digit < 10; digit++) {
            const count = sortView.bucketCounts[digit];
            const x = panelX + 14 + digit * (barW + gap);
            const barH = (count / maxCount) * chartHeight;
            const y = chartBottom - barH;
            const isActive = sortView.activeDigit === digit;
            const hue = digit * 36;

            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x, chartTop, barW, chartHeight);

            ctx.fillStyle = isActive
                ? `hsla(${hue}, 95%, 68%, 0.96)`
                : `hsla(${hue}, 88%, 60%, 0.56)`;
            ctx.fillRect(x, y, barW, Math.max(barH, 2));

            if (isActive) {
                ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x - 2, chartTop - 2, barW + 4, chartHeight + 4);
            }

            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = '600 10px IBM Plex Sans, sans-serif';
            ctx.fillText(String(digit), x + 2, panelY + panelH - 8);
        }

        ctx.restore();
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
            this.learnN = 0;
            this.pointCount = 0;
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

    updateGeometryState(dt) {
        if (this.updateLearningModeSimulation(dt)) return;
        this.updateFreeRunMultiplier(dt);
    },

    updateVisualState(dt) {
        this.updateSortingState(dt);
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

    updateSortingState(dt) {
        if (!this.isSortingEnabled()) return;
        const n = Math.max(0, Math.floor(this.pointCount));
        const totalSteps = (this.sortPlan && this.sortPlan.totalSteps) ? this.sortPlan.totalSteps : n * 3;
        this.sortProgress = Math.min(totalSteps, this.sortProgress + this.sortSpeed * dt);
        if (this.sortProgress >= totalSteps) {
            this.sortingStatus = 'completed';
        }
    },

    updateShuffleFlash(dt) {
        if (this.shuffleFlash > 0) {
            this.shuffleFlash = Math.max(0, this.shuffleFlash - dt * 1.8);
        }
    },

    updateFreeRunMultiplier(dt) {
        this.multiplier += this.multiplierSpeed * dt;
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.48;
        const n = Math.max(0, Math.floor(this.pointCount));
        const forceIntegerM = this.learningMode === 'gcd' || this.learningMode === 'integer-snap' || this.learningMode === 'mapping';
        const m = (this.integersOnly || forceIntegerM) ? Math.round(this.multiplier) : this.multiplier;
        const hudM = this.learningMode === 'n-ramp' ? this.learnFixedM : m;
        const viewState = this.getViewState(w, h, cx, cy, radius, n, m, hudM);

        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(235, 240, 255, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        this.drawChords(ctx, viewState);

        if (this.showPoints) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            for (let i = 0; i < n; i++) {
                const p = this.circlePoint(i, n, radius, cx, cy);
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.pointRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this.drawHud(ctx, viewState);
        this.drawSortOverlay(ctx, viewState);
        this.drawShuffleOverlay(ctx, viewState);
        this.drawLearningModeOverlay(ctx, viewState);
    },

    getViewState(w, h, cx, cy, radius, n, m, hudM) {
        const mInt = Math.round(m);
        const gcdValue = (this.learningMode === 'gcd' && n > 0) ? this.gcd(n, this.positiveMod(mInt, n)) : 1;
        const chords = this.buildChordData(n, m, radius, cx, cy);
        const sortingActive = this.isSortingEnabled() && n > 0;
        const sortPlan = sortingActive ? this.ensureSortPlan(chords, n, m) : null;
        const sortView = sortingActive ? this.getSortViewState(sortPlan) : null;
        return { w, h, cx, cy, radius, n, m, hudM, gcdValue, chords, sortingActive, sortPlan, sortView };
    },

    drawChords(ctx, viewState) {
        const { n, m, radius, cx, cy, gcdValue, chords, sortingActive, sortView } = viewState;

        ctx.lineWidth = this.lineWidth;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        if (this.learningMode === 'gcd' && gcdValue > 1) {
            for (let i = 0; i < n; i++) {
                const chord = chords[i];
                const hue = ((i % gcdValue) / gcdValue) * 360;
                ctx.strokeStyle = `hsla(${hue}, 95%, 62%, ${Math.max(this.lineAlpha, 0.22)})`;
                ctx.beginPath();
                ctx.moveTo(chord.from.x, chord.from.y);
                ctx.lineTo(chord.to.x, chord.to.y);
                ctx.stroke();
            }
        } else if (sortingActive && sortView) {
            const shuffledBaseAlpha = 0.14 + this.shuffleFlash * 0.26;
            for (let k = 0; k < sortView.drawEntries.length; k++) {
                const chord = sortView.drawEntries[k];
                const geoFrom = this.circlePoint(k, n, radius, cx, cy);
                const geoTo = this.circlePointByIndex((m * k) % n, n, radius, cx, cy);

                const muted = this.lineVisual(chord.originalIndex, n, geoFrom, geoTo, radius, shuffledBaseAlpha);
                ctx.strokeStyle = muted.color;
                ctx.beginPath();
                ctx.moveTo(geoFrom.x, geoFrom.y);
                ctx.lineTo(geoTo.x, geoTo.y);
                ctx.stroke();

                if (k < sortView.coloredCount) {
                    ctx.strokeStyle = chord.color;
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();
                }

                if (!sortView.completed && k === sortView.coloredCount) {
                    ctx.lineWidth = Math.max(this.lineWidth + 1.5, 3);
                    ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)';
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();
                    ctx.lineWidth = this.lineWidth;
                }
            }
        } else {
            for (const chord of chords) {
                ctx.strokeStyle = chord.color;
                ctx.beginPath();
                ctx.moveTo(chord.from.x, chord.from.y);
                ctx.lineTo(chord.to.x, chord.to.y);
                ctx.stroke();
            }
        }

        ctx.restore();
    },

    drawHud(ctx, viewState) {
        if (!this.showHud) return;

        const { n, hudM, sortingActive, sortView, sortPlan } = viewState;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';
        const elapsed = (typeof Core !== 'undefined' && typeof Core.getRecordingElapsedMs === 'function')
            ? Core.getRecordingElapsedMs()
            : 0;
        const timeLabel = (typeof Core !== 'undefined' && typeof Core.formatRecordingTimeMMSS === 'function')
            ? Core.formatRecordingTimeMMSS(elapsed)
            : '00:00';
        const hudSpeed = this.learningMode === 'm-ramp' ? this.mRampEffectiveRate : this.multiplierSpeed;
        ctx.fillText(`Node: ${n}`, 24, 30);
        ctx.fillText(`Mul: ${hudM.toFixed(3)}`, 24, 52);
        ctx.fillText(`dM/dt: ${hudSpeed.toFixed(3)}`, 24, 74);
        ctx.fillText(`Time: ${timeLabel}`, 24, 96);
        if (sortingActive && sortView) {
            const sortLabel = this.sortMode === 'lsh' ? 'L-S-H Radix' : 'Hue Radix';
            const digitLabel = sortPlan?.passes?.[sortView.passIndex]?.label || `Pass ${sortView.passNumber}`;
            ctx.fillText(`Sort: ${sortLabel}`, 24, 118);
            ctx.fillText(`Pass: ${sortView.passNumber}/${sortView.totalPasses} (${digitLabel})`, 24, 140);
            ctx.fillText(`Step: ${sortView.stepInPass}/${sortView.totalInPass}`, 24, 162);
            if (sortView.activeDigit != null) {
                ctx.fillText(`Bucket: ${sortView.activeDigit}`, 24, 184);
            }
        }
    },

    drawSortOverlay(ctx, viewState) {
        if (viewState.sortingActive && viewState.sortView) {
            this.drawSortBuckets(ctx, viewState.w, viewState.h, viewState.sortView);
        }
    },

    drawShuffleOverlay(ctx, viewState) {
        if (this.shuffleFlash <= 0) return;
        ctx.save();
        ctx.fillStyle = `rgba(255, 209, 102, ${0.12 * this.shuffleFlash})`;
        ctx.fillRect(0, 0, viewState.w, viewState.h);
        ctx.fillStyle = `rgba(255, 240, 201, ${0.95 * this.shuffleFlash})`;
        ctx.font = '700 20px IBM Plex Sans, sans-serif';
        ctx.fillText('Shuffle', 24, viewState.h - 24);
        ctx.restore();
    },

    drawLearningModeOverlay(ctx, viewState) {
        this.drawMappingOverlay(ctx, viewState);
        this.drawRampOverlay(ctx, viewState);
        this.drawTimedModeOverlay(ctx, viewState);
    },

    drawMappingOverlay(ctx, viewState) {
        const { n, m, radius, cx, cy, h } = viewState;
        if (this.learningMode !== 'mapping' || n <= 0) return;

        const i = this.positiveMod(Math.floor(this.demoIndex), n);
        const raw = m * i;
        const j = this.positiveMod(raw, n);
        const from = this.circlePoint(i, n, radius, cx, cy);
        const to = this.circlePointByIndex(j, n, radius, cx, cy);

        ctx.lineWidth = Math.max(2.8, this.lineWidth + 1.5);
        ctx.strokeStyle = 'rgba(255, 216, 102, 0.95)';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(from.x, from.y, Math.max(4, this.pointRadius + 2.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#06d6a0';
        ctx.beginPath();
        ctx.arc(to.x, to.y, Math.max(4, this.pointRadius + 2.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.font = '600 16px Inter, system-ui, sans-serif';
        ctx.fillText(`i=${i} -> M*i=${Math.round(raw)} -> mod N=${j}`, 24, h - 28);
    },

    drawRampOverlay(ctx, viewState) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';

        if (this.learningMode === 'n-ramp') {
            const speed = this.learnN < this.nRampSwitchN ? this.nRampSlowRate : this.nRampFastRate;
            ctx.fillText(`N Ramp | speed=${speed.toFixed(1)}/s`, 24, viewState.h - 28);
        }

        if (this.learningMode === 'm-ramp') {
            ctx.fillText(`M Ramp | dM/dt=${this.mRampEffectiveRate.toFixed(3)}`, 24, viewState.h - 28);
        }

        if (this.learningMode === 'gcd' && viewState.n > 0) {
            const loopCount = this.gcd(viewState.n, this.positiveMod(Math.round(viewState.m), viewState.n));
            ctx.fillText(`GCD Mode | loop groups = ${loopCount}`, 24, viewState.h - 28);
        }

        if (this.learningMode === 'integer-snap') {
            ctx.fillText(`Integer Snap | speed = ${this.snapRate.toFixed(2)}`, 24, viewState.h - 28);
        }
    },

    drawTimedModeOverlay(ctx, viewState) {
        if (this.learningMode === 'classic') {
            const targetM = this.classicTargets[this.classicIndex];
            const patternName = targetM === 2 ? 'Cardioid' : (targetM === 3 ? 'Nephroid' : `${targetM - 1} Petals`);
            this.drawPatternOverlay(ctx, viewState, {
                label: `Classic Mode | Next in ${Math.max(0, this.classicDuration - this.classicTimer).toFixed(1)}s`,
                patternName
            });
        }

        if (this.learningMode === 'ultimate') {
            const targetM = this.ultimateTargets[this.ultimateIndex];
            const names = {
                2: 'Cardioid', 2.1: 'Warped Heart', 1.618: 'Golden Ratio', 2.5: 'Split Cardioid',
                3: 'Nephroid', 3.14159: 'Pi Spiral', 3.5: 'Split Nephroid', 4: 'Clover',
                5: 'Flower', 8: 'Infinity Petals', 13: 'Fibonacci Bloom',
                21: 'Fibonacci Spiral', 34: 'Golden Spiral', 55: 'Star Dust',
                67: 'Sun Star', 89: 'Natural Harmony', 99: 'Cosmic Web',
                181: 'Global Grid (Mirror)', 181.5: 'Warped Grid (Chaos)',
                359: 'The Singularity (Focus)', 359.7: 'Stardust Fountain'
            };
            this.drawPatternOverlay(ctx, viewState, {
                label: `Ultimate Mode | Next in ${Math.max(0, this.ultimateDuration - this.ultimateTimer).toFixed(1)}s`,
                patternName: names[targetM] || 'Complex Pattern'
            });
        }

        if (this.learningMode === 'mirror-chaos') {
            const targetM = this.mirrorTargets[this.mirrorIndex];
            const names = {
                2.5: 'Split Cardioid', 3.5: 'Split Nephroid', 4.5: 'Split Clover',
                6.66: 'Order in Chaos', 13.13: 'Abstract Rhythm',
                181: 'Global Grid (Mirror)', 181.5: 'Warped Grid (Chaos)',
                359: 'The Singularity (Focus)', 359.7: 'Stardust Fountain'
            };
            this.drawPatternOverlay(ctx, viewState, {
                label: `Mirror & Chaos | Next in ${Math.max(0, this.mirrorDuration - this.mirrorTimer).toFixed(1)}s`,
                patternName: names[targetM] || 'Complex Pattern'
            });
        }
    },

    drawPatternOverlay(ctx, viewState, config) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';
        ctx.fillText(config.label, 24, viewState.h - 28);

        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = '700 32px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(config.patternName, viewState.w - 32, 52);
        ctx.restore();
    }
};
