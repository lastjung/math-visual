/**
 * FaceGeneratorCase
 * Red Blob style parametric face with smooth interpolation + URL share state.
 */
const FaceGeneratorCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    t: 0,

    params: {
        m: 1.0,
        p: 0.5,
        q: 0.5,
        r: 0.5,
        s: 0.7,
        skew: 0,
        rotate: 0,
        browLift: -0.6,
        browAngle: -0.6,
        eyeOpen: 0.65,
        eyeFocus: 0
    },

    targetParams: null,
    saveTimer: null,
    currentPreset: 'custom',
    currentFaceButton: 'Custom',
    selectorRoot: null,
    selectorRows: [],
    selectorFaceButtons: [],

    presets: {
        neutral: { m: 0.35, p: 0.35, q: 0.4, r: 0.5, s: 0.5, skew: 0, rotate: 0, browLift: 0, browAngle: 0, eyeOpen: 0.65, eyeFocus: 0 },
        smile: { m: 0.55, p: 0.45, q: 0.5, r: 0.45, s: 0.85, skew: 0, rotate: 0, browLift: 0.2, browAngle: -0.15, eyeOpen: 0.58, eyeFocus: 0 },
        angry: { m: 0.32, p: 0.15, q: 0.2, r: 0.75, s: 0.2, skew: -0.1, rotate: -0.06, browLift: -0.45, browAngle: -0.9, eyeOpen: 0.52, eyeFocus: 0.18 },
        surprise: { m: 1.0, p: 0.55, q: 0.55, r: 0.5, s: 0.65, skew: 0, rotate: 0, browLift: 0.7, browAngle: 0.1, eyeOpen: 1, eyeFocus: 0 }
    },

    paramMeta: {
        m: { min: 0, max: 1, step: 0.01, label: 'm: mouth open' },
        p: { min: 0, max: 1, step: 0.01, label: 'p: upper lip' },
        q: { min: 0, max: 1, step: 0.01, label: 'q: lower lip' },
        r: { min: 0, max: 1, step: 0.01, label: 'r: rounded' },
        s: { min: 0, max: 1, step: 0.01, label: 's: smiling' },
        skew: { min: -1, max: 1, step: 0.01, label: 'skew' },
        rotate: { min: -1, max: 1, step: 0.01, label: 'rotate' },
        browLift: { min: -1, max: 1, step: 0.01, label: 'brow lift' },
        browAngle: { min: -1, max: 1, step: 0.01, label: 'brow angle' },
        eyeOpen: { min: 0, max: 1, step: 0.01, label: 'eye open' },
        eyeFocus: { min: -1, max: 1, step: 0.01, label: 'eye focus' }
    },
    selectorRowKeys: ['m', 'p', 'q', 'r', 's', 'skew', 'rotate', 'browLift', 'browAngle'],
    faceButtonPresets: {
        Smile: { m: 0.45, p: 0.45, q: 0.48, r: 0.6, s: 0.92, skew: 0, rotate: 0, browLift: 0.2, browAngle: -0.2, eyeOpen: 0.65, eyeFocus: 0 },
        Glee: { m: 0.62, p: 0.5, q: 0.56, r: 0.55, s: 1.0, skew: 0, rotate: 0.02, browLift: 0.3, browAngle: -0.25, eyeOpen: 0.74, eyeFocus: 0.03 },
        Joy: { m: 0.7, p: 0.58, q: 0.58, r: 0.58, s: 0.98, skew: 0.04, rotate: 0.04, browLift: 0.35, browAngle: -0.18, eyeOpen: 0.84, eyeFocus: 0.08 },
        Sad1: { m: 0.2, p: 0.16, q: 0.26, r: 0.7, s: 0.2, skew: 0, rotate: -0.03, browLift: -0.1, browAngle: 0.28, eyeOpen: 0.56, eyeFocus: -0.05 },
        Sad2: { m: 0.12, p: 0.1, q: 0.2, r: 0.78, s: 0.05, skew: -0.04, rotate: -0.05, browLift: -0.22, browAngle: 0.4, eyeOpen: 0.5, eyeFocus: -0.08 },
        Grief: { m: 0.08, p: 0.08, q: 0.16, r: 0.84, s: 0.0, skew: 0, rotate: -0.07, browLift: -0.42, browAngle: 0.52, eyeOpen: 0.44, eyeFocus: 0 },
        Surprise: { m: 0.95, p: 0.6, q: 0.7, r: 0.45, s: 0.64, skew: 0, rotate: 0, browLift: 0.82, browAngle: 0.1, eyeOpen: 1.0, eyeFocus: 0 },
        Shock: { m: 1.0, p: 0.66, q: 0.76, r: 0.36, s: 0.52, skew: 0, rotate: 0, browLift: 0.96, browAngle: 0.02, eyeOpen: 1.0, eyeFocus: 0.12 },
        Worry: { m: 0.24, p: 0.22, q: 0.34, r: 0.63, s: 0.3, skew: 0.02, rotate: 0.02, browLift: -0.15, browAngle: 0.36, eyeOpen: 0.6, eyeFocus: 0.1 },
        Fear: { m: 0.58, p: 0.44, q: 0.58, r: 0.5, s: 0.42, skew: 0, rotate: 0, browLift: 0.65, browAngle: 0.52, eyeOpen: 1.0, eyeFocus: 0.15 },
        Anger1: { m: 0.32, p: 0.22, q: 0.28, r: 0.74, s: 0.18, skew: -0.08, rotate: -0.06, browLift: -0.5, browAngle: -0.82, eyeOpen: 0.52, eyeFocus: 0.22 },
        Anger2: { m: 0.44, p: 0.3, q: 0.34, r: 0.66, s: 0.24, skew: -0.14, rotate: -0.1, browLift: -0.56, browAngle: -0.95, eyeOpen: 0.48, eyeFocus: 0.3 }
    },

    guideText: [
        '[Face Generator Guide]',
        '- Red Blob 파라미터 m,p,q,r,s + skew/rotate + brow 제어를 반영했습니다.',
        '- 랜덤/프리셋 버튼은 부드럽게 보간되어 표정이 자연스럽게 바뀝니다.',
        '- 현재 슬라이더 값은 URL 해시에 저장되어 공유가 가능합니다.',
        '- 제약식 m + p + q >= 0 은 이 범위 설정에서는 항상 만족합니다.'
    ].join('\n'),

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.loadStateFromHash();
        if (!this.targetParams) {
            this.targetParams = { ...this.params };
        }

        this.createSelectorUI();
        this.syncSelectorUI(true);
        this.resize();
        this.draw();
    },

    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    enforceConstraints(target) {
        const out = { ...target };
        Object.entries(this.paramMeta).forEach(([key, meta]) => {
            out[key] = this.clamp(Number.isFinite(out[key]) ? out[key] : this.params[key], meta.min, meta.max);
        });

        // Kept for compatibility with the original note.
        if (out.m + out.p + out.q < 0) {
            out.q = this.clamp(-(out.m + out.p), this.paramMeta.q.min, this.paramMeta.q.max);
        }

        return out;
    },

    setTargetParam(key, value, immediate = false) {
        if (!Object.prototype.hasOwnProperty.call(this.params, key)) return;
        const next = { ...this.targetParams, [key]: value };
        this.targetParams = this.enforceConstraints(next);
        this.currentPreset = 'custom';
        this.currentFaceButton = 'Custom';
        if (immediate) {
            this.params = { ...this.targetParams };
        }
        this.scheduleStateSave();
        this.syncSelectorUI(true);
        this.draw();
    },

    setTargetBatch(nextValues) {
        this.targetParams = this.enforceConstraints({ ...this.targetParams, ...nextValues });
        this.scheduleStateSave();
        this.syncSelectorUI(true);
        this.draw();
    },

    randomize() {
        const next = {};
        Object.entries(this.paramMeta).forEach(([key, meta]) => {
            next[key] = this.lerp(meta.min, meta.max, Math.random());
        });
        this.setTargetBatch(next);
        this.currentPreset = 'custom';
        this.currentFaceButton = 'Random';
        this.syncSelectorUI(true);
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    applyPreset(name) {
        const preset = this.presets[name];
        if (!preset) return;
        this.setTargetBatch(preset);
        this.currentPreset = name;
        this.currentFaceButton = name;
        this.syncSelectorUI(true);
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    applyFaceButton(name) {
        if (name === 'Random') {
            this.randomize();
            return;
        }
        const preset = this.faceButtonPresets[name];
        if (!preset) return;
        this.setTargetBatch(preset);
        this.currentFaceButton = name;
        this.currentPreset = 'custom';
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    get uiConfig() {
        const controls = [];
        const sliderKeys = ['m', 'p', 'q', 'r', 's', 'skew', 'rotate', 'browLift', 'browAngle', 'eyeOpen', 'eyeFocus'];

        controls.push({
            type: 'select',
            id: 'fg_preset',
            label: 'Preset',
            value: this.currentPreset,
            options: [
                { label: 'Custom', value: 'custom' },
                { label: 'Neutral', value: 'neutral' },
                { label: 'Smile', value: 'smile' },
                { label: 'Angry', value: 'angry' },
                { label: 'Surprise', value: 'surprise' }
            ],
            onChange: (v) => this.applyPreset(v)
        });

        controls.push({
            type: 'button',
            id: 'fg_random',
            label: 'Random',
            value: '랜덤 표정',
            onClick: () => this.randomize()
        });

        sliderKeys.forEach((key) => {
            const meta = this.paramMeta[key];
            controls.push({
                type: 'slider',
                id: `fg_${key}`,
                label: meta.label,
                min: meta.min,
                max: meta.max,
                step: meta.step,
                value: this.targetParams ? this.targetParams[key] : this.params[key],
                onChange: (v) => this.setTargetParam(key, v)
            });
        });

        controls.push({
            type: 'button',
            id: 'fg_help',
            label: 'Guide',
            value: '설명서 보기',
            onClick: () => window.alert(this.guideText)
        });

        return controls;
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
            this.updateInterpolation();
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
        this.params = { ...this.presets.neutral };
        this.targetParams = { ...this.params };
        this.currentPreset = 'neutral';
        this.currentFaceButton = 'Neutral';
        this.updateHashNow();
        this.syncSelectorUI(true);
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) {
            Core.updateControls();
        }
    },

    destroy() {
        this.stop();
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
        if (this.selectorRoot && this.selectorRoot.parentElement) {
            this.selectorRoot.parentElement.removeChild(this.selectorRoot);
        }
        this.selectorRoot = null;
        this.selectorRows = [];
        this.selectorFaceButtons = [];
    },

    updateInterpolation() {
        if (!this.targetParams) return;
        Object.keys(this.params).forEach((key) => {
            const current = this.params[key];
            const target = this.targetParams[key];
            const next = this.lerp(current, target, 0.18);
            if (Math.abs(next - target) < 0.0006) {
                this.params[key] = target;
            } else {
                this.params[key] = next;
            }
        });
    },

    scheduleStateSave() {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.updateHashNow(), 140);
    },

    updateHashNow() {
        const pairs = Object.keys(this.params).map((k) => `${k}:${this.targetParams[k].toFixed(3)}`);
        window.location.hash = `face=${pairs.join(',')}`;
    },

    loadStateFromHash() {
        const hash = (window.location.hash || '').replace(/^#/, '');
        if (!hash.startsWith('face=')) {
            this.params = { ...this.presets.neutral };
            this.targetParams = { ...this.params };
            this.currentPreset = 'neutral';
            this.currentFaceButton = 'Neutral';
            return;
        }

        const raw = hash.slice(5).split(',');
        const next = { ...this.presets.neutral };
        raw.forEach((token) => {
            const [k, v] = token.split(':');
            if (!Object.prototype.hasOwnProperty.call(this.paramMeta, k)) return;
            const n = Number(v);
            if (!Number.isFinite(n)) return;
            next[k] = n;
        });

        this.params = this.enforceConstraints(next);
        this.targetParams = { ...this.params };
        this.currentPreset = 'custom';
        this.currentFaceButton = 'Custom';
        this.syncSelectorUI(true);
    },

    drawFace(ctx, cx, cy, faceScale, p = null, useBlink = true) {
        const params = p || this.params;

        // Head (boxy cartoon style like reference)
        const hw = faceScale * 0.95;
        const hh = faceScale * 0.95;
        const rx = faceScale * 0.14;
        const x0 = cx - hw;
        const y0 = cy - hh;
        const x1 = cx + hw;
        const y1 = cy + hh;
        ctx.fillStyle = '#c24040';
        ctx.beginPath();
        ctx.moveTo(x0 + rx, y0);
        ctx.lineTo(x1 - rx, y0);
        ctx.quadraticCurveTo(x1, y0, x1, y0 + rx);
        ctx.lineTo(x1, y1 - rx);
        ctx.quadraticCurveTo(x1, y1, x1 - rx, y1);
        ctx.lineTo(x0 + rx, y1);
        ctx.quadraticCurveTo(x0, y1, x0, y1 - rx);
        ctx.lineTo(x0, y0 + rx);
        ctx.quadraticCurveTo(x0, y0, x0 + rx, y0);
        ctx.closePath();
        ctx.fill();

        // Eyes
        const eyeX = faceScale * 0.32;
        const eyeY = cy - faceScale * 0.2;
        const eyeR = faceScale * 0.23;
        const eyeOpen = this.clamp(0.24 + params.eyeOpen * 0.85, 0.18, 1.05);
        const blink = useBlink && Math.sin(this.t * 0.85) > 0.996 ? 0.18 : 1;
        const eyeRY = eyeR * eyeOpen * blink;
        const eyeStroke = Math.max(1.2, faceScale * 0.017);

        ctx.fillStyle = '#f0f0f0';
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = eyeStroke;
        ctx.beginPath();
        ctx.ellipse(cx - eyeX, eyeY, eyeR, eyeRY, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + eyeX, eyeY, eyeR, eyeRY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pupils (default inward stare + eyeFocus delta)
        const pupilR = eyeR * 0.33;
        const focusX = params.eyeFocus * eyeR * 0.32;
        const inward = eyeR * 0.2;
        const pupilY = eyeY + eyeRY * 0.06;
        const maxDx = Math.max(1, eyeR - pupilR - eyeStroke);
        const leftCenter = cx - eyeX;
        const rightCenter = cx + eyeX;
        const leftDx = this.clamp(inward + focusX, -maxDx, maxDx);
        const rightDx = this.clamp(-inward + focusX, -maxDx, maxDx);
        const pupilLeftX = leftCenter + leftDx;
        const pupilRightX = rightCenter + rightDx;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pupilLeftX, pupilY, pupilR, 0, Math.PI * 2);
        ctx.arc(pupilRightX, pupilY, pupilR, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows
        const browY = eyeY - eyeR * 1.55 + params.browLift * faceScale * 0.16;
        const browLen = eyeR * 1.05;
        const browAngle = this.lerp(-0.5, 0.5, (params.browAngle + 1) * 0.5);
        const browW = Math.max(2, faceScale * 0.09);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = browW;
        ctx.lineCap = 'butt';

        ctx.save();
        ctx.translate(cx - eyeX, browY);
        ctx.rotate(-browAngle);
        ctx.beginPath();
        ctx.moveTo(-browLen * 0.7, 0);
        ctx.lineTo(browLen * 0.7, 0);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(cx + eyeX, browY);
        ctx.rotate(browAngle);
        ctx.beginPath();
        ctx.moveTo(-browLen * 0.7, 0);
        ctx.lineTo(browLen * 0.7, 0);
        ctx.stroke();
        ctx.restore();

        // Mouth (large black cavity + upper/lower teeth bars)
        const smile = params.s;
        const mouthY = cy + faceScale * 0.31;
        const halfW = faceScale * (0.34 + params.r * 0.1);
        const openH = faceScale * (0.22 + params.m * 0.34);
        const smileLift = (smile - 0.5) * faceScale * 0.24;
        const upperCurve = openH * (0.14 + params.p * 0.22);
        const lowerCurve = openH * (0.86 + params.q * 0.16);
        const skewX = params.skew * faceScale * 0.08;
        const mouthStroke = Math.max(1.2, faceScale * 0.016);

        ctx.save();
        ctx.translate(cx + skewX, mouthY);
        ctx.rotate(params.rotate * 0.38);

        const leftX = -halfW;
        const rightX = halfW;
        const cornerY = -smileLift;
        const topY = -upperCurve - smileLift;
        const bottomY = lowerCurve;
        const ctrlX = halfW * this.lerp(0.35, 0.8, params.r);

        const drawMouthPath = () => {
            ctx.beginPath();
            ctx.moveTo(leftX, cornerY);
            ctx.bezierCurveTo(-ctrlX, topY, ctrlX, topY, rightX, cornerY);
            ctx.bezierCurveTo(ctrlX, bottomY, -ctrlX, bottomY, leftX, cornerY);
            ctx.closePath();
        };

        drawMouthPath();
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = mouthStroke;
        ctx.stroke();

        // Teeth bars clipped to mouth shape
        ctx.save();
        drawMouthPath();
        ctx.clip();

        const upperBandY = cornerY + openH * 0.06;
        const upperBandH = openH * 0.2;
        const lowerBandY = cornerY + openH * 0.78;
        const lowerBandH = openH * 0.2;
        const bandX = leftX + halfW * 0.08;
        const bandW = halfW * 1.84;

        ctx.fillStyle = '#f1f1f1';
        ctx.fillRect(bandX, upperBandY, bandW, upperBandH);
        ctx.fillRect(bandX, lowerBandY, bandW, lowerBandH);

        ctx.strokeStyle = '#777777';
        ctx.lineWidth = Math.max(0.8, faceScale * 0.008);
        for (let i = 1; i < 10; i += 1) {
            const tx = bandX + (bandW / 10) * i;
            ctx.beginPath();
            ctx.moveTo(tx, upperBandY);
            ctx.lineTo(tx, upperBandY + upperBandH);
            ctx.stroke();
        }
        for (let i = 1; i < 8; i += 1) {
            const tx = bandX + (bandW / 8) * i;
            ctx.beginPath();
            ctx.moveTo(tx, lowerBandY);
            ctx.lineTo(tx, lowerBandY + lowerBandH);
            ctx.stroke();
        }

        ctx.restore();
        ctx.restore();
    },

    createSelectorUI() {
        if (this.selectorRoot) return;
        const canvasContainer = document.getElementById('capture-zone');
        if (!canvasContainer || !canvasContainer.parentElement) return;

        const root = document.createElement('div');
        root.className = 'face-param-selector';
        this.selectorRoot = root;
        this.selectorRows = [];
        this.selectorFaceButtons = [];

        const faceBar = document.createElement('div');
        faceBar.className = 'face-button-bar';
        const faceHint = document.createElement('div');
        faceHint.className = 'face-button-hint';
        faceHint.textContent = 'Click face presets repeatedly.';
        faceBar.appendChild(faceHint);

        const faceButtonsWrap = document.createElement('div');
        faceButtonsWrap.className = 'face-button-wrap';
        const faceButtonNames = ['Smile', 'Glee', 'Joy', 'Sad1', 'Sad2', 'Grief', 'Surprise', 'Shock', 'Worry', 'Fear', 'Anger1', 'Anger2', 'Random'];
        faceButtonNames.forEach((name) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'face-button-chip';
            btn.textContent = name;
            btn.dataset.face = name;
            btn.onclick = () => this.applyFaceButton(name);
            faceButtonsWrap.appendChild(btn);
            this.selectorFaceButtons.push(btn);
        });
        faceBar.appendChild(faceButtonsWrap);
        root.appendChild(faceBar);

        const sampleCount = 10;
        this.selectorRowKeys.forEach((key) => {
            const meta = this.paramMeta[key];
            const row = document.createElement('div');
            row.className = 'face-param-row';

            const label = document.createElement('div');
            label.className = 'face-param-label';
            label.textContent = meta.label;

            const track = document.createElement('div');
            track.className = 'face-param-track';

            const value = document.createElement('div');
            value.className = 'face-param-value';
            value.textContent = (this.targetParams ? this.targetParams[key] : this.params[key]).toFixed(2);

            const options = [];
            for (let i = 0; i < sampleCount; i += 1) {
                const t = i / (sampleCount - 1);
                const sampleValue = this.lerp(meta.min, meta.max, t);
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'face-param-option';
                btn.dataset.key = key;
                btn.dataset.value = String(sampleValue);
                btn.dataset.index = String(i);
                btn.title = `${meta.label}: ${sampleValue.toFixed(2)}`;
                btn.onclick = () => {
                    this.setTargetParam(key, sampleValue);
                    if (typeof Core !== 'undefined' && Core.currentCase === this) {
                        Core.updateControls();
                    }
                };

                const thumb = document.createElement('canvas');
                thumb.className = 'face-param-thumb';
                thumb.width = 42;
                thumb.height = 42;
                btn.appendChild(thumb);

                track.appendChild(btn);
                options.push({ button: btn, canvas: thumb, value: sampleValue });
            }

            row.appendChild(label);
            row.appendChild(track);
            row.appendChild(value);
            root.appendChild(row);

            this.selectorRows.push({ key, meta, row, valueEl: value, options });
        });

        canvasContainer.parentElement.appendChild(root);
    },

    syncSelectorUI(redrawThumbs = false) {
        if (!this.selectorRows || !this.selectorRows.length) return;

        this.selectorRows.forEach((rowInfo) => {
            const { key, meta, valueEl, options } = rowInfo;
            const activeValue = this.targetParams ? this.targetParams[key] : this.params[key];
            const activeT = (activeValue - meta.min) / (meta.max - meta.min || 1);
            const activeIndex = this.clamp(Math.round(activeT * (options.length - 1)), 0, options.length - 1);
            valueEl.textContent = activeValue.toFixed(2);

            options.forEach((opt, index) => {
                opt.button.classList.toggle('active', index === activeIndex);
                if (!redrawThumbs) return;
                const ctx = opt.canvas.getContext('2d');
                if (!ctx) return;
                ctx.clearRect(0, 0, opt.canvas.width, opt.canvas.height);
                const baseParams = this.targetParams || this.params;
                const sampleParams = { ...baseParams, [key]: opt.value };
                this.drawFace(
                    ctx,
                    opt.canvas.width * 0.5,
                    opt.canvas.height * 0.5,
                    Math.min(opt.canvas.width, opt.canvas.height) * 0.48,
                    sampleParams,
                    false
                );
            });
        });

        if (this.selectorFaceButtons.length) {
            this.selectorFaceButtons.forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.face === this.currentFaceButton);
            });
        }
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w * 0.5;
        const cy = h * 0.5;
        const faceScale = Math.min(w, h) * 0.3;

        ctx.fillStyle = '#e6e6e6';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#cfa0a1';
        const pad = Math.min(w, h) * 0.08;
        ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);

        this.drawFace(ctx, cx, cy, faceScale, this.params, true);

        const hudX = pad + 10;
        const hudY = pad + 10;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(hudX, hudY, Math.min(460, w - hudX - 12), 56);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 13px Inter, system-ui, sans-serif';
        ctx.fillText(`Face: ${this.currentFaceButton}`, hudX + 10, hudY + 20);
        ctx.font = '500 12px Inter, system-ui, sans-serif';
        ctx.fillText(
            `m ${this.params.m.toFixed(2)} p ${this.params.p.toFixed(2)} q ${this.params.q.toFixed(2)} r ${this.params.r.toFixed(2)} s ${this.params.s.toFixed(2)}`,
            hudX + 10,
            hudY + 40
        );
    }
};
