/**
 * Math Draw Engine
 * Manages case loading, phase transitions, and shared utilities
 */

const MathDrawEngine = {
    canvas: null,
    ctx: null,
    audioCtx: null,
    currentCase: null,
    isRunning: false,

    init() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        document.getElementById('btn-play').onclick = () => this.start();
        document.getElementById('btn-reset').onclick = () => this.resetAll();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Tab selection
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadCase(tab.dataset.case);
            });
        });

        // Load default case
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) this.loadCase(activeTab.dataset.case);
    },

    resizeCanvas() {
        const size = Math.min(window.innerWidth * 0.85, window.innerHeight * 0.55, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        if (this.currentCase && this.currentCase.draw) {
            this.currentCase.draw(this.ctx, this.canvas);
        }
    },

    loadCase(caseId) {
        // Stop current
        this.isRunning = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        document.getElementById('code-display').innerHTML = '';
        document.getElementById('explanation').innerHTML = '';
        document.getElementById('draw-info').textContent = '';

        // Show code phase
        const codePhase = document.getElementById('code-phase');
        const drawPhase = document.getElementById('draw-phase');
        codePhase.classList.add('active');
        drawPhase.classList.remove('active');

        // Find case
        const caseObj = MathDrawCases[caseId];
        if (!caseObj) return;

        this.currentCase = caseObj;

        // Update title
        document.getElementById('case-title').textContent = caseObj.title || 'Math Draw';
        document.getElementById('case-subtitle').textContent = caseObj.subtitle || '';

        // Update file name in code editor
        document.querySelector('.file-name').textContent = caseObj.fileName || 'draw.js';

        // Reset button
        const btn = document.getElementById('btn-play');
        btn.innerHTML = '<span>▶</span> <span>Start</span>';
        btn.classList.remove('paused');
    },

    // ---- Playback ----
    async start() {
        if (this.isRunning || !this.currentCase) return;
        this.isRunning = true;

        const btn = document.getElementById('btn-play');
        btn.innerHTML = '<span>⏳</span> <span>Running</span>';
        btn.classList.add('paused');

        // Phase 1: Show code
        await this.showCodePhase();
        if (!this.isRunning) return;
        await this.sleep(1200);

        // Transition
        if (!this.isRunning) return;
        await this.transitionToDrawPhase();

        // Phase 2: Draw
        if (!this.isRunning) return;
        await this.currentCase.draw(this.ctx, this.canvas);

        btn.innerHTML = '<span>▶</span> <span>Start</span>';
        btn.classList.remove('paused');
        this.isRunning = false;
    },

    async showCodePhase() {
        const codeEl = document.getElementById('code-display');
        const explEl = document.getElementById('explanation');
        codeEl.innerHTML = '';

        const lines = this.currentCase.codeLines || [];
        const explanations = this.currentCase.explanations || [];

        let lineIndex = 0;
        for (const line of lines) {
            if (!this.isRunning) return;
            await this.sleep(line.delay || 300);

            const lineEl = document.createElement('div');
            lineEl.className = 'code-line';
            lineEl.innerHTML = line.html || '&nbsp;';
            codeEl.appendChild(lineEl);

            this.playTone(800 + Math.random() * 400, 0.03, 0.04);

            const exp = explanations.find(e => e.atLine === lineIndex);
            if (exp) {
                explEl.innerHTML = exp.text;
                explEl.style.opacity = '1';
            }

            lineIndex++;
        }

        await this.sleep(1500);
    },

    async transitionToDrawPhase() {
        const codePhase = document.getElementById('code-phase');
        const drawPhase = document.getElementById('draw-phase');

        codePhase.classList.remove('active');
        await this.sleep(800);
        drawPhase.classList.add('active');
        await this.sleep(500);
    },

    async resetAll() {
        this.isRunning = false;
        document.getElementById('code-display').innerHTML = '';
        document.getElementById('explanation').innerHTML = '';
        document.getElementById('draw-info').textContent = '';

        const drawPhase = document.getElementById('draw-phase');
        const codePhase = document.getElementById('code-phase');
        drawPhase.classList.remove('active');
        await this.sleep(300);
        codePhase.classList.add('active');

        const btn = document.getElementById('btn-play');
        btn.innerHTML = '<span>▶</span> <span>Start</span>';
        btn.classList.remove('paused');

        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    // ---- Audio Utilities ----
    ensureAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    playTone(freq, duration = 0.06, volume = 0.08) {
        try {
            const ctx = this.ensureAudio();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) { /* ignore */ }
    },

    playComplete() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 0.2, 0.1), i * 120);
        });
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Registry for all cases
const MathDrawCases = {};

document.addEventListener('DOMContentLoaded', () => MathDrawEngine.init());
