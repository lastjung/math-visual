/**
 * OrbitSpirographCase
 * Planet-period based orbit spirograph with explicit Center/Orbiting roles.
 */
const OrbitSpirographCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,

    mode: 'relative', // relative | heliocentric | education
    centerBody: 'Earth',
    orbitingBody: 'Venus',
    daysPerSecond: 120,
    lineAlpha: 0.35,
    lineWidth: 2.1,
    maxTrailPoints: 6000,
    showGuides: true,
    showHud: true,

    timeDays: 0,
    trail: [],
    yellowTrail: [],
    introStartMs: 0,
    introDurationMs: 30000,
    introSegmentMs: 10000,
    introEnabled: true,
    lastIntroPhase: -1,
    lastOverlayPhase: -1,

    // Orbit periods in days.
    periods: {
        Mercury: 89.9696,
        Venus: 224.701,
        Apophis: 322.7,
        Earth: 364.2564,
        Mars: 687.0,
        Ceres: 1675.58,
        Jupiter: 4332.59,
        Saturn: 10759.0,
        Uranus: 30688.5,
        Neptune: 60182.0
    },

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.introStartMs = performance.now();
        this.lastIntroPhase = -1;
        this.lastOverlayPhase = -1;
        this.resize();
        this.draw();
    },

    get uiConfig() {
        const names = Object.keys(this.periods);
        const opts = names.map((n) => ({ label: n, value: n }));

        return [
            {
                type: 'select',
                id: 'os_mode',
                label: 'Mode',
                value: this.mode,
                options: [
                    { label: 'Relative (Orbiting - Center)', value: 'relative' },
                    { label: 'Heliocentric', value: 'heliocentric' },
                    { label: 'Education (3-Step Story)', value: 'education' }
                ],
                onChange: (v) => {
                    this.mode = v;
                    if (v === 'education') {
                        this.centerBody = 'Earth';
                        this.orbitingBody = 'Mars';
                    }
                    this.clearTrail();
                }
            },
            {
                type: 'select',
                id: 'os_center',
                label: 'Center Body',
                value: this.centerBody,
                options: opts,
                onChange: (v) => {
                    this.centerBody = v;
                    this.ensureBodiesDistinct('center');
                    this.clearTrail();
                    if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
                }
            },
            {
                type: 'select',
                id: 'os_orbiting',
                label: 'Orbiting Body',
                value: this.orbitingBody,
                options: opts,
                onChange: (v) => {
                    this.orbitingBody = v;
                    this.ensureBodiesDistinct('orbiting');
                    this.clearTrail();
                    if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
                }
            },
            {
                type: 'slider',
                id: 'os_speed',
                label: 'Time Speed (days/s)',
                min: 1,
                max: 500,
                step: 1,
                value: this.daysPerSecond,
                onChange: (v) => {
                    this.daysPerSecond = Math.max(1, v);
                }
            },
            {
                type: 'slider',
                id: 'os_alpha',
                label: 'Trail Alpha',
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
                type: 'slider',
                id: 'os_width',
                label: 'Trail Width',
                min: 0.8,
                max: 5,
                step: 0.1,
                value: this.lineWidth,
                onChange: (v) => {
                    this.lineWidth = v;
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'os_trail',
                label: 'Trail Points',
                min: 500,
                max: 12000,
                step: 100,
                value: this.maxTrailPoints,
                onChange: (v) => {
                    this.maxTrailPoints = Math.max(100, Math.floor(v));
                    if (this.trail.length > this.maxTrailPoints) {
                        this.trail.splice(0, this.trail.length - this.maxTrailPoints);
                    }
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'os_guides',
                label: 'Guides',
                value: this.showGuides ? 'on' : 'off',
                options: [
                    { label: 'On', value: 'on' },
                    { label: 'Off', value: 'off' }
                ],
                onChange: (v) => {
                    this.showGuides = v === 'on';
                    this.draw();
                }
            },
            {
                type: 'button',
                id: 'os_clear',
                label: 'Trail',
                value: 'Clear Trail',
                onClick: () => this.clearTrail()
            }
        ];
    },

    ensureBodiesDistinct(changed) {
        if (this.centerBody !== this.orbitingBody) return;
        const names = Object.keys(this.periods);
        const fallback = names.find((n) => n !== this.centerBody) || 'Venus';
        if (changed === 'center') this.orbitingBody = fallback;
        else this.centerBody = fallback;
    },

    clearTrail(options = {}) {
        const restartIntro = options.restartIntro !== false;
        this.timeDays = 0;
        this.trail = [];
        this.yellowTrail = [];
        if (restartIntro) {
            this.introStartMs = performance.now();
            this.lastIntroPhase = -1;
            this.lastOverlayPhase = -1;
        }
        this.draw();
    },

    periodOf(name) {
        return this.periods[name] || 365;
    },

    // Kepler-inspired radius from period: a ~ T^(2/3), normalized to Earth.
    orbitRadiusAU(name) {
        const T = this.periodOf(name);
        return Math.pow(T / this.periodOf('Earth'), 2 / 3);
    },

    angleOf(name, timeDays) {
        const T = this.periodOf(name);
        return (Math.PI * 2 * timeDays) / T - Math.PI / 2;
    },

    polarToXY(r, a) {
        return { x: r * Math.cos(a), y: r * Math.sin(a) };
    },

    orbitPositionAU(name, timeDays) {
        return this.polarToXY(this.orbitRadiusAU(name), this.angleOf(name, timeDays));
    },

    spiroPointAU(timeDays) {
        const mode = this.getEffectiveMode();
        const c = this.orbitPositionAU(this.centerBody, timeDays);
        const o = this.orbitPositionAU(this.orbitingBody, timeDays);
        if (mode === 'heliocentric') return o;
        return { x: o.x - c.x, y: o.y - c.y };
    },

    worldScale(w, h) {
        const mode = this.getEffectiveMode();
        const rC = this.orbitRadiusAU(this.centerBody);
        const rO = this.orbitRadiusAU(this.orbitingBody);
        const maxR = mode === 'heliocentric'
            ? Math.max(rC, rO)
            : (rC + rO);
        return (Math.min(w, h) * 0.43) / Math.max(0.0001, maxR);
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
            const phase = this.getIntroPhase();
            if (this.mode === 'education' && phase >= 0 && phase !== this.lastIntroPhase) {
                if (phase === 1 || phase === 2) {
                    // Step 2/3 전환 시 이전 궤적을 비워서 새 프레임 설명과 일치시킴
                    this.clearTrail({ restartIntro: false });
                }
                this.lastIntroPhase = phase;
            }
            this.timeDays += this.daysPerSecond * dt;
            const p = this.spiroPointAU(this.timeDays);
            this.trail.push(p);
            if (this.trail.length > this.maxTrailPoints) {
                this.trail.splice(0, this.trail.length - this.maxTrailPoints);
            }
            const mode = this.getEffectiveMode();
            if (mode === 'relative') {
                const c = this.orbitPositionAU(this.centerBody, this.timeDays);
                this.yellowTrail.push({ x: -c.x, y: -c.y });
                if (this.yellowTrail.length > this.maxTrailPoints) {
                    this.yellowTrail.splice(0, this.yellowTrail.length - this.maxTrailPoints);
                }
            }
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
        this.clearTrail();
    },

    destroy() {
        this.stop();
        const panel = document.getElementById('orbit-education-panel');
        if (panel) panel.style.display = 'none';
    },

    getIntroPhase() {
        if (!this.introEnabled || this.mode !== 'education' || !this.introStartMs) return -1;
        const elapsed = performance.now() - this.introStartMs;
        if (elapsed < 0) return -1;
        if (elapsed >= this.introDurationMs) return 2; // keep Step 3 visible after intro ends
        return Math.floor(elapsed / this.introSegmentMs); // 0,1,2
    },

    getEffectiveMode() {
        if (this.mode !== 'education') return this.mode;
        const phase = this.getIntroPhase();
        if (phase === 1) return 'heliocentric';
        if (phase === 0 || phase === 2) return 'relative';
        return 'relative';
    },

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = 0;
        for (let i = 0; i < words.length; i++) {
            const testLine = line ? `${line} ${words[i]}` : words[i];
            if (ctx.measureText(testLine).width > maxWidth && line) {
                ctx.fillText(line, x, y + lines * lineHeight);
                lines += 1;
                line = words[i];
            } else {
                line = testLine;
            }
        }
        if (line) {
            ctx.fillText(line, x, y + lines * lineHeight);
            lines += 1;
        }
        return lines;
    },

    drawIntroOverlay(ctx, w, h) {
        const panelId = 'orbit-education-panel';
        let panel = document.getElementById(panelId);
        if (!panel) {
            panel = document.createElement('div');
            panel.id = panelId;
            panel.style.position = 'fixed';
            panel.style.left = '0px';
            panel.style.top = '0px';
            panel.style.width = '320px';
            panel.style.padding = '12px 14px';
            panel.style.borderRadius = '0 0 12px 12px';
            panel.style.background = 'rgba(5, 10, 20, 0.86)';
            panel.style.border = '1px solid rgba(255,255,255,0.2)';
            panel.style.boxShadow = '0 14px 36px rgba(0, 0, 0, 0.35)';
            panel.style.backdropFilter = 'blur(5px)';
            panel.style.zIndex = '1300';
            panel.style.display = 'none';
            panel.style.color = '#f8fafc';
            panel.style.fontFamily = 'Inter, system-ui, sans-serif';
            panel.style.pointerEvents = 'none';
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.transform = 'translateY(6px)';
            panel.style.transition = 'opacity 280ms ease, transform 280ms ease, visibility 280ms ease';
            document.body.appendChild(panel);
        }

        const phase = this.getIntroPhase();
        if (phase < 0) {
            panel.style.opacity = '0';
            panel.style.visibility = 'hidden';
            panel.style.transform = 'translateY(6px)';
            this.lastOverlayPhase = -1;
            return;
        }

        const cBody = this.centerBody;
        const oBody = this.orbitingBody;

        const title = phase === 0
            ? `Step 1: Relative View (From ${cBody})`
            : phase === 1
                ? 'Step 2: Heliocentric View (Around the Sun)'
                : 'Step 3: Back to Relative View';

        const body = phase === 0
            ? `This pattern traces how ${oBody} appears when observed from ${cBody}. Because ${cBody} is also moving, ${oBody} can seem to loop and reverse its path in our sky.`
            : phase === 1
                ? `In heliocentric view, ${cBody} and ${oBody} both orbit the Sun with smooth motion. Their different orbital periods continuously change the ${cBody}-${oBody} geometry.`
                : `Switching back to the ${cBody}-centered frame transforms that smooth motion into looping relative curves. Enjoy watching the orbital pattern unfold.`;

        const progressStart = phase * this.introSegmentMs;
        const elapsed = performance.now() - this.introStartMs;
        const remainMs = Math.max(0, this.introSegmentMs - (elapsed - progressStart));
        const remainSec = Math.ceil(remainMs / 1000);

        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            panel.style.left = `${Math.round(rect.left)}px`;
            panel.style.top = `${Math.round(rect.bottom + 8)}px`;
            panel.style.width = `${Math.round(rect.width)}px`;
        }
        panel.style.display = 'block';
        panel.innerHTML = `
            <div style="font-weight:700; font-size:15px; margin-bottom:6px;">${title}</div>
            <div style="font-weight:500; font-size:14px; line-height:1.5; color:rgba(248,250,252,0.96);">${body}</div>
            <div style="margin-top:8px; font-weight:600; font-size:12px; color:rgba(186,230,253,0.95);">Next segment in ${remainSec}s</div>
        `;
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            panel.style.top = `${Math.round(rect.bottom + 8)}px`;
        }

        if (this.lastOverlayPhase !== phase) {
            panel.style.opacity = '0';
            panel.style.visibility = 'visible';
            panel.style.transform = 'translateY(6px)';
            requestAnimationFrame(() => {
                panel.style.opacity = '1';
                panel.style.visibility = 'visible';
                panel.style.transform = 'translateY(0)';
            });
            this.lastOverlayPhase = phase;
        } else {
            panel.style.opacity = '1';
            panel.style.visibility = 'visible';
            panel.style.transform = 'translateY(0)';
        }
    },

    drawGuides(ctx, cx, cy, scale) {
        if (!this.showGuides) return;

        const mode = this.getEffectiveMode();
        const rC = this.orbitRadiusAU(this.centerBody) * scale;
        const rO = this.orbitRadiusAU(this.orbitingBody) * scale;

        if (mode === 'heliocentric') {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, rC, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, rO, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.abs(rO - rC), 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, rO + rC, 0, Math.PI * 2);
            ctx.stroke();
        }

    },

    drawTrail(ctx, cx, cy, scale) {
        if (this.trail.length < 2) return;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = this.lineWidth;

        for (let i = 1; i < this.trail.length; i++) {
            const a = this.trail[i - 1];
            const b = this.trail[i];
            const hue = (i / this.trail.length) * 290 + 40;
            ctx.strokeStyle = `hsla(${hue % 360}, 90%, 66%, ${this.lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(cx + a.x * scale, cy + a.y * scale);
            ctx.lineTo(cx + b.x * scale, cy + b.y * scale);
            ctx.stroke();
        }
    },

    drawYellowTrail(ctx, cx, cy, scale) {
        const mode = this.getEffectiveMode();
        if (mode !== 'relative' || this.yellowTrail.length < 2) return;
        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1.2, this.lineWidth * 0.8);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.48)';
        ctx.beginPath();
        ctx.moveTo(cx + this.yellowTrail[0].x * scale, cy + this.yellowTrail[0].y * scale);
        for (let i = 1; i < this.yellowTrail.length; i++) {
            const p = this.yellowTrail[i];
            ctx.lineTo(cx + p.x * scale, cy + p.y * scale);
        }
        ctx.stroke();
        ctx.restore();
    },

    drawCurrentBodies(ctx, cx, cy, scale) {
        const mode = this.getEffectiveMode();
        const c = this.orbitPositionAU(this.centerBody, this.timeDays);
        const o = this.orbitPositionAU(this.orbitingBody, this.timeDays);
        const sunInRelative = { x: -c.x, y: -c.y };

        if (mode === 'heliocentric') {
            const sunX = cx;
            const sunY = cy;
            const orbitX = cx + o.x * scale;
            const orbitY = cy + o.y * scale;

            // Sun -> Orbiting connector (high visibility)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(orbitX, orbitY);
            ctx.stroke();

            // Sun
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(sunX, sunY, 5.2, 0, Math.PI * 2);
            ctx.fill();

            // Center body
            ctx.fillStyle = '#22d3ee';
            ctx.beginPath();
            ctx.arc(cx + c.x * scale, cy + c.y * scale, 4, 0, Math.PI * 2);
            ctx.fill();

            // Orbiting body (rainbow-themed marker)
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(orbitX, orbitY, 4.6, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Relative mode: center fixed at origin, Sun and orbiting are shown in this frame.
        const sunX = cx + sunInRelative.x * scale;
        const sunY = cy + sunInRelative.y * scale;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 5.2, 0, Math.PI * 2);
        ctx.fill();

        const rel = { x: o.x - c.x, y: o.y - c.y };
        const orbitX = cx + rel.x * scale;
        const orbitY = cy + rel.y * scale;

        // Sun -> Orbiting connector (high visibility)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(orbitX, orbitY);
        ctx.stroke();

        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 4.6, 0, Math.PI * 2);
        ctx.fill();
    },

    drawHud(ctx) {
        if (!this.showHud) return;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 13px Inter, system-ui, sans-serif';
        const mode = this.getEffectiveMode();
        const modeLabel = mode === 'relative' ? 'Relative' : 'Heliocentric';
        const modePrefix = this.mode === 'education' ? 'Education/' : '';
        const elapsed = (typeof Core !== 'undefined' && typeof Core.getRecordingElapsedMs === 'function')
            ? Core.getRecordingElapsedMs()
            : 0;
        const timeLabel = (typeof Core !== 'undefined' && typeof Core.formatRecordingTimeMMSS === 'function')
            ? Core.formatRecordingTimeMMSS(elapsed)
            : '00:00';
        ctx.fillText(`Mode: ${modeLabel}`, 24, 30);
        if (mode === 'heliocentric') {
            ctx.fillText(`Center: Sun, Rainbow: ${this.orbitingBody}, Blue Ball: ${this.centerBody}`, 24, 50);
        } else {
            ctx.fillText(`Center: ${this.centerBody}, Yellow Ball: Sun, Rainbow: ${this.orbitingBody}`, 24, 50);
        }
        ctx.fillText(`t: ${this.timeDays.toFixed(1)} days`, 24, 70);
        if (modePrefix) ctx.fillText(`Story: ${modePrefix}${modeLabel}`, 24, 90);
        ctx.fillText(`Time: ${timeLabel}`, 24, modePrefix ? 110 : 90);
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const scale = this.worldScale(w, h);

        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, w, h);

        this.drawGuides(ctx, cx, cy, scale);
        this.drawYellowTrail(ctx, cx, cy, scale);
        this.drawTrail(ctx, cx, cy, scale);
        this.drawCurrentBodies(ctx, cx, cy, scale);
        this.drawHud(ctx);
        this.drawIntroOverlay(ctx, w, h);
    }
};
