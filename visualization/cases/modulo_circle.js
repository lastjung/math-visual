/**
 * ModuloCircleCase
 * Times-table modulo circle animation inspired by Mathologer / Red Blob.
 */
const ModuloCircleCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,

    pointCount: 683,
    multiplier: 24.572,
    multiplierSpeed: 0.35,
    lineWidth: 1.35,
    lineAlpha: 0.18,
    pointRadius: 1.1,
    showPoints: false,
    showHud: false,
    integersOnly: false,
    colorMode: 'angle', // monochrome | angle | length | origin
    rotation: -Math.PI / 2,
    guideText: [
        '[Modulo Circle 컨트롤 설명]',
        '- N (Points): 원 위 점 개수. 커질수록 패턴이 촘촘해짐.',
        '- M (Multiplier): i -> (M*i) mod N 연결 규칙의 핵심 값.',
        '- M Speed: 회전이 아니라 M 변화 속도. +면 증가, -면 감소.',
        '- Line Alpha: 선 투명도.',
        '- Color: Angle/Length/Origin/Monochrome 색 기준.',
        '- Integers Only: M을 정수로 반올림해 단계적으로 변화.',
        '- HUD: 좌상단 수치 표시 On/Off.',
        '- Reset/Resume: 상단 Master Controls 버튼 사용.',
        '- Reset 시 기본 세팅(N=683, M=24.572, M Speed=0.35)으로 복귀.'
    ].join('\n'),

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.draw();
    },

    get uiConfig() {
        return [
            {
                type: 'slider',
                id: 'mc_n',
                label: 'N (Points)',
                min: 50,
                max: 1500,
                step: 1,
                value: this.pointCount,
                onChange: (v) => {
                    this.pointCount = Math.max(10, Math.floor(v));
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
                value: this.multiplier,
                onChange: (v) => {
                    this.multiplier = v;
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
                    this.draw();
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
            }
        ];
    },

    showGuide() {
        window.alert(this.guideText);
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
            this.multiplier += this.multiplierSpeed * dt;
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    },

    stop() {
        if (!this.animationId) return;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },

    reset() {
        this.pointCount = 683;
        this.multiplier = 24.572;
        this.multiplierSpeed = 0.35;
        this.lineWidth = 1.35;
        this.lineAlpha = 0.18;
        this.integersOnly = false;
        this.colorMode = 'angle';
        this.showHud = false;
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

    lineColor(i, n, from, to, radius) {
        if (this.colorMode === 'monochrome') return `rgba(167, 243, 208, ${this.lineAlpha})`;
        if (this.colorMode === 'angle') {
            const hue = (i / n) * 360;
            return `hsla(${hue}, 95%, 62%, ${this.lineAlpha})`;
        }
        if (this.colorMode === 'origin') {
            const hue = ((Math.atan2(from.y - to.y, from.x - to.x) + Math.PI) / (2 * Math.PI)) * 360;
            return `hsla(${hue}, 90%, 62%, ${this.lineAlpha})`;
        }
        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const ratio = Math.max(0, Math.min(1, len / (2 * radius)));
        const hue = 240 - ratio * 220;
        return `hsla(${hue}, 92%, 60%, ${this.lineAlpha})`;
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.48;
        const n = Math.max(10, Math.floor(this.pointCount));
        const m = this.integersOnly ? Math.round(this.multiplier) : this.multiplier;

        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(235, 240, 255, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = this.lineWidth;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) {
            const from = this.circlePoint(i, n, radius, cx, cy);
            const j = (m * i) % n;
            const to = this.circlePointByIndex(j, n, radius, cx, cy);
            ctx.strokeStyle = this.lineColor(i, n, from, to, radius);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
        ctx.restore();

        if (this.showPoints) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            for (let i = 0; i < n; i++) {
                const p = this.circlePoint(i, n, radius, cx, cy);
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.pointRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (this.showHud) {
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.font = '600 14px Inter, system-ui, sans-serif';
            ctx.fillText(`N: ${n}`, 24, 30);
            ctx.fillText(`M: ${m.toFixed(3)}`, 24, 52);
            ctx.fillText(`dM/dt: ${this.multiplierSpeed.toFixed(3)}`, 24, 74);
        }
    }
};
