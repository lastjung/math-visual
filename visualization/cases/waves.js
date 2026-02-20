/**
 * Mathematical Waves & Curves Visualization Module
 * Dual View: Left (Geometric Generator) | Right (XY Plane/Waveform)
 * Support: Cartesian, Polar, Parametric types
 * Integration: KaTeX for high-quality mathematical formulas
 * Data Source: Ported from math-sound constants.js
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

    // Category State
    category: 'all',
    formulaId: 'sine',

    // --- FORMULA REGISTRY ---
    formulas: {
        // ========== 🌊 WAVES (기본 파형) ==========
        sine: {
            category: 'waves',
            name: 'Sine Wave',
            type: 'cartesian',
            fn: (t) => Math.sin(t),
            formula: 'f(t) = \\sin(t)'
        },
        square: {
            category: 'waves',
            name: 'Square Wave',
            type: 'cartesian',
            fn: (t) => Math.sign(Math.sin(t)),
            formula: 'f(t) = \\text{sgn}(\\sin(t))'
        },
        sawtooth: {
            category: 'waves',
            name: 'Sawtooth Wave',
            type: 'cartesian',
            fn: (t) => 2 * ((t / (2 * Math.PI)) - Math.floor((t / (2 * Math.PI)) + 0.5)),
            formula: 'f(t) = 2 \\left( \\frac{t}{2\\pi} - \\lfloor \\frac{t}{2\\pi} + 0.5 \\rfloor \\right)'
        },
        triangle: {
            category: 'waves',
            name: 'Triangle Wave',
            type: 'cartesian',
            fn: (t) => 2 * Math.abs(2 * ((t / (2 * Math.PI)) - Math.floor((t / (2 * Math.PI)) + 0.5))) - 1,
            formula: 'f(t) = 2 \\left| 2 \\left( \\frac{t}{2\\pi} - \\lfloor \\frac{t}{2\\pi} + 0.5 \\rfloor \\right) \\right| - 1'
        },
        pulse: {
            category: 'waves',
            name: 'Pulse Wave',
            type: 'cartesian',
            fn: (t) => ((t % (2 * Math.PI)) < (2 * Math.PI * 0.3)) ? 1 : -1,
            formula: 'f(t) = \\text{pulse}(t, 30\\%)'
        },
        damped: {
            category: 'waves',
            name: 'Damped Sine',
            type: 'cartesian',
            fn: (t) => 0.6 * Math.sin(t) * Math.exp(-0.07 * (Math.abs(t) % (10 * Math.PI))),
            formula: 'f(t) = e^{-0.7|t| \\pmod{10\\pi}} \\cdot \\sin(t)'
        },
        steppy: {
            category: 'waves',
            name: 'Steppy Wave',
            type: 'cartesian',
            fn: (t) => Math.cos(3 * t) + Math.sign(Math.sin(6 * t)) + 0.3 * Math.max(-2, Math.min(2, Math.tan(t / 2))),
            formula: 'f(t) = \\cos(3t) + \\text{sgn}(\\sin(6t)) + \\frac{1}{2}\\tan(t)'
        },

        // ========== 🌸 CURVES (유명 곡선) ==========
        heart: {
            category: 'curves',
            name: 'Classic Heart',
            type: 'parametric',
            x: (t) => 1.6 * Math.pow(Math.sin(t), 3),
            y: (t) => -(1.3 * Math.cos(t) - 0.5 * Math.cos(2*t) - 0.2 * Math.cos(3*t) - 0.1 * Math.cos(4*t)),
            formula: '\\vec{r}(t) = \\langle 16\\sin^3 t, 13\\cos t - 5\\cos 2t - ... \\rangle'
        },
        lissajous: {
            category: 'curves',
            name: 'Lissajous',
            type: 'parametric',
            x: (t) => Math.sin(3 * t),
            y: (t) => Math.sin(4 * t),
            formula: '\\begin{cases} x = \\sin(3t) \\\\ y = \\sin(4t) \\end{cases}'
        },
        rose: {
            category: 'curves',
            name: 'Rose Curve',
            type: 'polar',
            r: (theta) => Math.cos(4 * theta),
            formula: 'r = \\cos(4\\theta)'
        },
        cardioid: {
            category: 'curves',
            name: 'Cardioid',
            type: 'polar',
            r: (theta) => (1 - Math.cos(theta)),
            formula: 'r = a(1 - \\cos \\theta)'
        },
        lemniscate: {
            category: 'curves',
            name: 'Lemniscate',
            type: 'polar',
            stretchX: 1.8,
            r: (theta) => {
                const c = Math.cos(2 * theta);
                return c < 0 ? 0 : Math.sqrt(c);
            },
            formula: 'r^2 = a^2 \\cos(2\\theta)'
        },
        spiral: {
            category: 'curves',
            name: 'Archimedean Spiral',
            type: 'polar',
            r: (t) => 0.1 * t,
            formula: 'r = a\\theta'
        },
        butterfly: {
            category: 'curves',
            name: 'Butterfly',
            type: 'polar',
            r: (t) => Math.exp(Math.sin(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin((2 * t - Math.PI) / 24), 5),
            formula: 'r = e^{\\sin\\theta} - 2\\cos(4\\theta) + \\sin^5(...)'
        },

        // ========== 💠 ART (기하학 예술) ==========
        star: {
            category: 'art',
            name: 'Star Curve',
            type: 'polar',
            r: (t) => Math.sin(2 * t) - 6 * Math.pow(Math.cos(6 * t), 3),
            formula: 'r = \\sin(2\\theta) - 6(\\cos(6\\theta))^3'
        },
        explosion: {
            category: 'art',
            name: 'Explosion',
            type: 'polar',
            r: (t) => 3 * Math.pow(Math.cos(14 * t), 3),
            formula: 'r = 3(\\cos(14\\theta))^3'
        },
        trigChaos: {
            category: 'art',
            name: 'Trig Chaos',
            type: 'polar',
            r: (t) => -4 * Math.sin(Math.cos(Math.tan(t))),
            formula: 'r = -4\\sin(\\cos(\\tan\\theta))'
        },
        monster: {
            category: 'art',
            name: 'Monster Wave',
            type: 'cartesian',
            fn: (x) => {
                const env = (Math.sqrt(Math.max(0, 4 - x*x)) * (0.2 + Math.abs(Math.sin(2.3*x))) + 3*Math.exp(-15*x*x));
                return env * Math.sin(100 * x) * 0.2;
            },
            formula: 'f(x) = (\\sqrt{4-x^2} \\cdot (0.2 + |\\dots|) + 3e^{-15x^2}) \\cdot \\sin(100x)'
        },

        // ========== 📐 MATH (수학적 함수) ==========
        gaussian: {
            category: 'math',
            name: 'Gaussian',
            type: 'cartesian',
            fn: (t) => Math.exp(-t * t),
            formula: 'f(t) = e^{-t^2}'
        },
        sinc: {
            category: 'math',
            name: 'Sinc',
            type: 'cartesian',
            fn: (t) => t === 0 ? 1 : Math.sin(t * 5) / (t * 5),
            formula: 'f(t) = \\frac{\\sin(at)}{at}'
        },
        logistic: {
            category: 'math',
            name: 'Logistic',
            type: 'cartesian',
            fn: (t) => 1 / (1 + Math.exp(-t)),
            formula: 'f(t) = \\frac{1}{1+e^{-t}}'
        },
        fourier: {
            category: 'math',
            name: 'Fourier Series (Square)',
            type: 'cartesian',
            fn: (t) => {
                let sum = 0;
                for(let n=1; n<=5; n++) {
                    const k = 2*n - 1;
                    sum += Math.sin(k * t) / k;
                }
                return sum;
            },
            formula: 'f(t) = \\sum_{n=1}^{5} \\frac{\\sin((2n-1)t)}{2n-1}'
        },

        // ========== 🎵 SOUND (소리 합성) ==========
        trumpet: {
            category: 'sound',
            name: 'Trumpet Wave',
            type: 'cartesian',
            fn: (t) => Math.sin(t * 10) / (Math.abs(t) + 0.1),
            formula: 'f(t) = \\frac{\\sin(10t)}{|t| + 0.1}'
        },
        fmSynth: {
            category: 'sound',
            name: 'FM Synthesis',
            type: 'cartesian',
            fn: (t) => Math.sin(t * 3 + Math.sin(t * 9)),
            formula: 'f(t) = \\sin(3t + \\sin(9t))'
        },
        beating: {
            category: 'sound',
            name: 'Beating',
            type: 'cartesian',
            fn: (t) => Math.sin(t * 10) * Math.sin(t * 0.5),
            formula: 'f(t) = \\sin(10t) \\cdot \\sin(0.5t)'
        },

        // ========== 💻 BYTE (비트 연산) ==========
        byteClassic: {
            category: 'bytebeat',
            name: 'Bytebeat Classic',
            type: 'cartesian',
            fn: (t) => {
                const i = Math.floor((t + 5) * 500);
                return ((i & (i >> 8)) % 256) / 128 - 1;
            },
            formula: 'f(t) = t \\land (t \\gg 8)'
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
        const categories = ['all', 'waves', 'curves', 'art', 'math', 'sound', 'bytebeat'];
        const filteredIds = Object.keys(this.formulas).filter(id => 
            this.category === 'all' || this.formulas[id].category === this.category
        );

        return [
            {
                type: 'select',
                id: 'category-select',
                label: 'Category Filter',
                value: this.category,
                options: categories.map(cat => ({ value: cat, label: cat.toUpperCase() })),
                onChange: (val) => {
                    this.category = val;
                    // Switch to first formula if current is not in filtered list
                    if (val !== 'all' && this.formulas[this.formulaId].category !== val) {
                        this.formulaId = Object.keys(this.formulas).find(id => this.formulas[id].category === val);
                    }
                    this.points = [];
                    this.updateFormulaUI();
                    Core.updateControls();
                }
            },
            {
                type: 'select',
                id: 'formula-select',
                label: 'Formula Selection',
                value: this.formulaId,
                options: filteredIds.map(id => ({
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
            <div style="font-size:0.75em; color:#94a3b8; font-weight:600; text-transform:uppercase; margin-bottom:2px; letter-spacing:1px;">${f.category}</div>
            <div style="font-weight:700; font-size:1.1em; color:#27455C; margin-bottom:8px;">${f.name}</div>
            <div id="katex-render" style="min-height:40px; display:flex; align-items:center;"></div>
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

        // 1. Grid
        ctx.save();
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
        
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(centerX * 2, 0);
        ctx.lineTo(centerX * 2, canvas.height);
        ctx.stroke();
        ctx.restore();

        // 2. Generator (Left)
        let vecX = 0;
        let vecY = 0;

        ctx.save();
        if (formula.type === 'cartesian') {
            ctx.strokeStyle = 'rgba(39, 69, 92, 0.08)';
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.05) {
                const px = centerX + Math.cos(a) * radius;
                const py = centerY + formula.fn(a) * radius;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
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

        } else if (formula.type === 'parametric') {
            ctx.strokeStyle = 'rgba(39, 69, 92, 0.08)';
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 2; a += 0.02) {
                const px = centerX + formula.x(a) * radius;
                const py = centerY + formula.y(a) * radius;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            vecX = centerX + formula.x(this.angle) * radius;
            vecY = centerY + formula.y(this.angle) * radius;
        }

        // Trace line
        ctx.strokeStyle = 'rgba(41, 204, 87, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(vecX, vecY);
        ctx.lineTo(centerX * 2 + 60, vecY);
        ctx.stroke();
        ctx.restore();

        // Vector
        ctx.save();
        ctx.strokeStyle = '#29CC57';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(vecX, vecY);
        ctx.stroke();
        ctx.fillStyle = '#29CC57';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(41, 204, 87, 0.5)';
        ctx.beginPath();
        ctx.arc(vecX, vecY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. Waveform (Right)
        this.points.unshift(vecY);
        if (this.points.length > this.maxPoints) this.points.pop();

        ctx.save();
        ctx.strokeStyle = '#29CC57';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const waveStartX = centerX * 2 + 60;
        const waveWidth = canvas.width - waveStartX - 60;
        for (let i = 0; i < this.points.length; i++) {
            const px = waveStartX + i * (waveWidth / this.maxPoints);
            const py = this.points[i];
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        this.angle -= this.speed;
        if (this.angle < -Math.PI * 2) this.angle += Math.PI * 2;
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
