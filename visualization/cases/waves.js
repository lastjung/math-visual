/**
 * Mathematical Waves & Curves Visualization Module
 * Dual View: Left (Geometric Generator) | Right (XY Plane/Waveform)
 * Integration: KaTeX for high-quality mathematical formulas
 */

const WavesCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    angle: 0,
    points: [],
    maxPoints: 500,

    // Config State
    speed: 0.02,
    amplitude: 80,
    frequency: 0.03,
    musicTrack: 'assets/music/bgm/Math_01_Minimalist_Sine_Pulse.mp3',

    // Formula Registry (LaTeX updated)
    formulaId: 'sine',
    formulas: {
        sine: {
            name: 'Sine Wave',
            type: 'cartesian',
            fn: (t) => Math.sin(t),
            formula: 'f(t) = \\sin(t)'
        },
        square: {
            name: 'Square Wave',
            type: 'cartesian',
            fn: (t) => Math.sign(Math.sin(t)),
            formula: 'f(t) = \\text{sgn}(\\sin(t))'
        },
        sawtooth: {
            name: 'Sawtooth Wave',
            type: 'cartesian',
            fn: (t) => 2 * ((t / (2 * Math.PI)) - Math.floor((t / (2 * Math.PI)) + 0.5)),
            formula: 'f(t) = 2 \\left( \\frac{t}{2\\pi} - \\lfloor \\frac{t}{2\\pi} + 0.5 \\rfloor \\right)'
        },
        triangle: {
            name: 'Triangle Wave',
            type: 'cartesian',
            fn: (t) => 2 * Math.abs(2 * ((t / (2 * Math.PI)) - Math.floor((t / (2 * Math.PI)) + 0.5))) - 1,
            formula: 'f(t) = 2 \\left| 2 \\left( \\frac{t}{2\\pi} - \\lfloor \\frac{t}{2\\pi} + 0.5 \\rfloor \\right) \\right| - 1'
        },
        damped: {
            name: 'Damped Sine',
            type: 'cartesian',
            fn: (t) => 0.6 * Math.sin(t) * Math.exp(-0.07 * (Math.abs(t) % (10 * Math.PI))),
            formula: 'f(t) = e^{-0.7|t| \\pmod{10\\pi}} \\cdot \\sin(t)'
        },
        rose: {
            name: 'Rose Curve',
            type: 'polar',
            r: (theta) => Math.cos(4 * theta),
            formula: 'r = \\cos(4\\theta)'
        },
        cardioid: {
            name: 'Cardioid',
            type: 'polar',
            r: (theta) => (1 - Math.cos(theta)),
            formula: 'r = a(1 - \\cos \\theta)'
        },
        lemniscate: {
            name: 'Lemniscate',
            type: 'polar',
            stretchX: 1.8,
            r: (theta) => {
                const c = Math.cos(2 * theta);
                return c < 0 ? 0 : Math.sqrt(c);
            },
            formula: 'r^2 = a^2 \\cos(2\\theta)'
        }
    },

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('formula-overlay');
        if (this.overlay) this.overlay.classList.add('active');
        this.updateFormulaUI();
        this.resize();
    },

    get uiConfig() {
        return [
            {
                type: 'select',
                id: 'formula-select',
                label: 'Formula Selection',
                value: this.formulaId,
                options: Object.keys(this.formulas).map(id => ({
                    value: id,
                    label: this.formulas[id].name
                })),
                onChange: (val) => {
                    this.formulaId = val;
                    this.points = [];
                    this.updateFormulaUI();
                    Core.updateControls();
                }
            },
            {
                type: 'info',
                label: 'Selected Formula',
                value: this.formulas[this.formulaId].name
            },
            {
                type: 'slider',
                id: 'speed',
                label: 'Simulation Speed',
                min: 0.005,
                max: 0.1,
                step: 0.005,
                value: this.speed,
                onChange: (val) => { this.speed = val; }
            },
            {
                type: 'slider',
                id: 'amplitude',
                label: 'Intensity (Amp)',
                min: 20,
                max: 150,
                step: 5,
                value: this.amplitude,
                onChange: (val) => { this.amplitude = val; }
            }
        ];
    },

    updateFormulaUI() {
        if (!this.overlay || !window.katex) return;
        const f = this.formulas[this.formulaId];
        const html = `
            <div style="font-weight:700; color:#27455C; margin-bottom:5px; font-family:'Inter'">${f.name}</div>
            <div id="katex-render"></div>
        `;
        this.overlay.innerHTML = html;
        window.katex.render(f.formula, document.getElementById('katex-render'), {
            throwOnError: false,
            displayMode: true
        });
    },

    reset() {
        this.angle = 0;
        this.points = [];
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    start() {
        if (this.animationId) return;
        const loop = () => {
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    },

    stop() {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 4;
        const centerY = canvas.height / 2;
        const radius = this.amplitude;
        const formula = this.formulas[this.formulaId];

        // 1. Grid & Background Elements
        ctx.save();
        ctx.strokeStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
        
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(centerX * 2, canvas.height * 0.05);
        ctx.lineTo(centerX * 2, canvas.height * 0.95);
        ctx.stroke();
        ctx.restore();

        // 2. Left: Generator Area
        let vecX = 0;
        let vecY = 0;

        ctx.save();
        if (formula.type === 'cartesian') {
            ctx.strokeStyle = 'rgba(39, 69, 92, 0.08)';
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.02) {
                const px = centerX + Math.cos(a) * radius;
                const py = centerY + formula.fn(a) * radius;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            vecX = centerX + Math.cos(this.angle) * radius;
            vecY = centerY + formula.fn(this.angle) * radius;

        } else if (formula.type === 'polar') {
            const sX = formula.stretchX || 1;
            ctx.strokeStyle = 'rgba(39, 69, 92, 0.08)';
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.02) {
                const r = formula.r(a) * radius;
                const px = centerX + Math.cos(a) * r * sX;
                const py = centerY + Math.sin(a) * r;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();

            const currentR = formula.r(this.angle) * radius;
            vecX = centerX + Math.cos(this.angle) * currentR * sX;
            vecY = centerY + Math.sin(this.angle) * currentR;
        }

        ctx.strokeStyle = '#29CC57';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(vecX, vecY);
        ctx.stroke();

        ctx.fillStyle = '#29CC57';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(41, 204, 87, 0.5)';
        ctx.beginPath();
        ctx.arc(vecX, vecY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. Right: Waveform Area
        this.points.unshift(vecY);
        if (this.points.length > this.maxPoints) this.points.pop();

        ctx.save();
        ctx.strokeStyle = '#29CC57';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let i = 0; i < this.points.length; i++) {
            const px = centerX * 2 + 60 + i * ((canvas.width - centerX * 2 - 120) / this.maxPoints);
            const py = this.points[i];
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'rgba(41, 204, 87, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(vecX, vecY);
        ctx.lineTo(centerX * 2 + 60, vecY);
        ctx.stroke();
        ctx.restore();

        this.angle -= this.speed;
    },

    destroy() {
        this.stop();
        if (this.overlay) {
            this.overlay.classList.remove('active');
            this.overlay.innerHTML = '';
        }
        this.points = [];
    }
};
