/**
 * OrbitSpirographCase
 * Planet-period based orbit spirograph with explicit Center/Orbiting roles.
 */
const OrbitSpirographCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,

    mode: 'relative', // relative | heliocentric
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
                    { label: 'Heliocentric', value: 'heliocentric' }
                ],
                onChange: (v) => {
                    this.mode = v;
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

    clearTrail() {
        this.timeDays = 0;
        this.trail = [];
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
        const c = this.orbitPositionAU(this.centerBody, timeDays);
        const o = this.orbitPositionAU(this.orbitingBody, timeDays);
        if (this.mode === 'heliocentric') return o;
        return { x: o.x - c.x, y: o.y - c.y };
    },

    worldScale(w, h) {
        const rC = this.orbitRadiusAU(this.centerBody);
        const rO = this.orbitRadiusAU(this.orbitingBody);
        const maxR = this.mode === 'heliocentric'
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
            this.timeDays += this.daysPerSecond * dt;
            const p = this.spiroPointAU(this.timeDays);
            this.trail.push(p);
            if (this.trail.length > this.maxTrailPoints) {
                this.trail.splice(0, this.trail.length - this.maxTrailPoints);
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
    },

    drawGuides(ctx, cx, cy, scale) {
        if (!this.showGuides) return;

        const rC = this.orbitRadiusAU(this.centerBody) * scale;
        const rO = this.orbitRadiusAU(this.orbitingBody) * scale;

        if (this.mode === 'heliocentric') {
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

    drawCurrentBodies(ctx, cx, cy, scale) {
        const c = this.orbitPositionAU(this.centerBody, this.timeDays);
        const o = this.orbitPositionAU(this.orbitingBody, this.timeDays);
        const sunInRelative = { x: -c.x, y: -c.y };

        if (this.mode === 'heliocentric') {
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
        const modeLabel = this.mode === 'relative' ? 'Relative' : 'Heliocentric';
        ctx.fillText(`Mode: ${modeLabel}`, 24, 30);
        ctx.fillText(`Center: ${this.centerBody}, Yellow: Sun, Rainbow: ${this.orbitingBody}`, 24, 50);
        ctx.fillText(`t: ${this.timeDays.toFixed(1)} days`, 24, 70);
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
        this.drawTrail(ctx, cx, cy, scale);
        this.drawCurrentBodies(ctx, cx, cy, scale);
        this.drawHud(ctx);
    }
};
