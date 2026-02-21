/**
 * FaceGeneratorCase
 * Lightweight parametric face rig for future expansion.
 */
const FaceGeneratorCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    t: 0,

    // Identity params
    headRound: 0.62,     // 0..1 (narrow -> round)
    jawWidth: 0.62,      // 0..1
    eyeSize: 0.58,       // 0..1
    eyeGap: 0.52,        // 0..1
    noseSize: 0.44,      // 0..1
    mouthWidth: 0.56,    // 0..1
    mouthCurve: 0.0,     // -1..1
    browTilt: 0.0,       // -1..1

    // Expression layer
    emotion: 'neutral', // neutral | happy | angry | sad | surprised
    intensity: 0.65,    // 0..1

    showGuides: false,
    showHud: true,

    guideText: [
        '[Face Generator Guide]',
        '- Sliders set identity shape (eyes/nose/mouth/jaw).',
        '- Emotion applies a delta layer on top of identity.',
        '- Intensity controls how strongly expression is applied.',
        '- Reset in Master Controls restores defaults.'
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
                type: 'select',
                id: 'fg_emotion',
                label: 'Emotion',
                value: this.emotion,
                options: [
                    { label: 'Neutral', value: 'neutral' },
                    { label: 'Happy', value: 'happy' },
                    { label: 'Angry', value: 'angry' },
                    { label: 'Sad', value: 'sad' },
                    { label: 'Surprised', value: 'surprised' }
                ],
                onChange: (v) => {
                    this.emotion = v;
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'fg_int',
                label: 'Emotion Intensity',
                min: 0,
                max: 1,
                step: 0.01,
                value: this.intensity,
                onChange: (v) => {
                    this.intensity = v;
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'fg_head',
                label: 'Head Roundness',
                min: 0,
                max: 1,
                step: 0.01,
                value: this.headRound,
                onChange: (v) => { this.headRound = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_jaw',
                label: 'Jaw Width',
                min: 0,
                max: 1,
                step: 0.01,
                value: this.jawWidth,
                onChange: (v) => { this.jawWidth = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_eye',
                label: 'Eye Size',
                min: 0.2,
                max: 1,
                step: 0.01,
                value: this.eyeSize,
                onChange: (v) => { this.eyeSize = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_gap',
                label: 'Eye Gap',
                min: 0.2,
                max: 1,
                step: 0.01,
                value: this.eyeGap,
                onChange: (v) => { this.eyeGap = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_nose',
                label: 'Nose Size',
                min: 0.2,
                max: 1,
                step: 0.01,
                value: this.noseSize,
                onChange: (v) => { this.noseSize = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_mouth_w',
                label: 'Mouth Width',
                min: 0.2,
                max: 1,
                step: 0.01,
                value: this.mouthWidth,
                onChange: (v) => { this.mouthWidth = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_mouth_c',
                label: 'Mouth Curve',
                min: -1,
                max: 1,
                step: 0.01,
                value: this.mouthCurve,
                onChange: (v) => { this.mouthCurve = v; this.draw(); }
            },
            {
                type: 'slider',
                id: 'fg_brow',
                label: 'Brow Tilt',
                min: -1,
                max: 1,
                step: 0.01,
                value: this.browTilt,
                onChange: (v) => { this.browTilt = v; this.draw(); }
            },
            {
                type: 'button',
                id: 'fg_help',
                label: 'Guide',
                value: '설명서 보기',
                onClick: () => window.alert(this.guideText)
            }
        ];
    },

    getExpressionDelta() {
        const k = this.intensity;
        switch (this.emotion) {
            case 'happy':
                return { mouthCurve: 0.9 * k, browTilt: 0.2 * k, eyeSquint: 0.2 * k, mouthOpen: 0.08 * k };
            case 'angry':
                return { mouthCurve: -0.45 * k, browTilt: -0.95 * k, eyeSquint: 0.25 * k, mouthOpen: 0.03 * k };
            case 'sad':
                return { mouthCurve: -0.7 * k, browTilt: 0.45 * k, eyeSquint: 0.1 * k, mouthOpen: 0.02 * k };
            case 'surprised':
                return { mouthCurve: 0.0, browTilt: 0.6 * k, eyeSquint: -0.45 * k, mouthOpen: 0.4 * k };
            default:
                return { mouthCurve: 0, browTilt: 0, eyeSquint: 0, mouthOpen: 0 };
        }
    },

    clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },

    start() {
        if (this.animationId) return;
        const loop = () => {
            this.t += 0.02;
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
        this.headRound = 0.62;
        this.jawWidth = 0.62;
        this.eyeSize = 0.58;
        this.eyeGap = 0.52;
        this.noseSize = 0.44;
        this.mouthWidth = 0.56;
        this.mouthCurve = 0;
        this.browTilt = 0;
        this.emotion = 'neutral';
        this.intensity = 0.65;
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    destroy() {
        this.stop();
    },

    drawHead(ctx, cx, cy, s) {
        const rx = s * (0.74 + this.headRound * 0.20);
        const ry = s * (0.92 + this.headRound * 0.08);
        const jaw = s * (0.50 + this.jawWidth * 0.30);

        ctx.beginPath();
        ctx.moveTo(cx, cy - ry);
        ctx.bezierCurveTo(cx + rx, cy - ry * 0.95, cx + rx, cy + ry * 0.45, cx + jaw, cy + ry * 0.95);
        ctx.bezierCurveTo(cx + jaw * 0.35, cy + ry * 1.1, cx - jaw * 0.35, cy + ry * 1.1, cx - jaw, cy + ry * 0.95);
        ctx.bezierCurveTo(cx - rx, cy + ry * 0.45, cx - rx, cy - ry * 0.95, cx, cy - ry);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w * 0.5;
        const cy = h * 0.53;
        const s = Math.min(w, h) * 0.26;

        const d = this.getExpressionDelta();
        const mouthCurve = this.clamp(this.mouthCurve + d.mouthCurve, -1, 1);
        const browTilt = this.clamp(this.browTilt + d.browTilt, -1, 1);
        const eyeSquint = this.clamp(d.eyeSquint, -0.6, 0.6);
        const mouthOpen = this.clamp(d.mouthOpen, 0, 0.55);

        // Backdrop
        ctx.fillStyle = '#0b1020';
        ctx.fillRect(0, 0, w, h);
        const g = ctx.createRadialGradient(cx, cy - s * 0.6, s * 0.1, cx, cy, s * 2.5);
        g.addColorStop(0, 'rgba(255,255,255,0.06)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // Head
        ctx.fillStyle = '#f3d9c6';
        ctx.strokeStyle = '#e3c1a7';
        ctx.lineWidth = 2;
        this.drawHead(ctx, cx, cy, s);

        // Eyes
        const blink = 0.02 + (Math.sin(this.t * 0.8) > 0.995 ? 0.65 : 0);
        const eSize = s * (0.11 + this.eyeSize * 0.09);
        const ex = s * (0.30 + this.eyeGap * 0.18);
        const ey = cy - s * 0.18;
        const eh = eSize * (1 - eyeSquint * 0.6 - blink);

        ctx.fillStyle = '#101828';
        ctx.beginPath();
        ctx.ellipse(cx - ex, ey, eSize, Math.max(1.5, eh), 0, 0, Math.PI * 2);
        ctx.ellipse(cx + ex, ey, eSize, Math.max(1.5, eh), 0, 0, Math.PI * 2);
        ctx.fill();

        // Brows
        const by = ey - eSize * 1.7;
        const browLen = eSize * 2.2;
        const browDy = browTilt * eSize * 0.75;
        ctx.strokeStyle = '#362518';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - ex - browLen * 0.5, by - browDy);
        ctx.lineTo(cx - ex + browLen * 0.5, by + browDy);
        ctx.moveTo(cx + ex - browLen * 0.5, by + browDy);
        ctx.lineTo(cx + ex + browLen * 0.5, by - browDy);
        ctx.stroke();

        // Nose
        const noseH = s * (0.13 + this.noseSize * 0.13);
        ctx.strokeStyle = 'rgba(120, 78, 51, 0.65)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s * 0.05);
        ctx.quadraticCurveTo(cx - s * 0.03, cy + noseH * 0.55, cx + s * 0.02, cy + noseH);
        ctx.stroke();

        // Mouth
        const mw = s * (0.34 + this.mouthWidth * 0.28);
        const my = cy + s * 0.36;
        const mh = s * (0.18 * mouthCurve);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - mw * 0.5, my);
        ctx.quadraticCurveTo(cx, my + mh, cx + mw * 0.5, my);
        ctx.stroke();

        if (mouthOpen > 0.02) {
            const openH = s * (0.07 + mouthOpen * 0.14);
            ctx.fillStyle = '#7f1d1d';
            ctx.beginPath();
            ctx.ellipse(cx, my + openH * 0.42, mw * 0.23, openH, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.showHud) {
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.font = '600 13px Inter, system-ui, sans-serif';
            ctx.fillText(`Face Generator`, 24, 30);
            ctx.fillText(`Emotion: ${this.emotion} (${this.intensity.toFixed(2)})`, 24, 50);
        }

        if (this.showGuides) {
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, h);
            ctx.stroke();
        }
    }
};
