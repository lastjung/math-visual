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
    isPaused: false,

    // Common settings
    drawSpeed: 1.5,     // 1 = normal, 0.5 = slow, 2 = fast
    sfxEnabled: true,
    sfxVolume: 0.06,

    init() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

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
            // Don't trigger redraw on resize during animation
        }
    },

    loadCase(caseId) {
        // Stop current
        this.isRunning = false;
        this.isPaused = false;
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

        // Render controls panel
        this.updateControls();
    },

    // ---- Playback ----
    async start() {
        if (this.isRunning && !this.isPaused) return;
        
        if (this.isRunning && this.isPaused) {
            this.togglePause();
            return;
        }
        
        this.isPaused = false;
        
        // Ensure we start from Phase 1 (Code)
        this.isRunning = false; // Temporarily false to allow reset-like state
        const codePhase = document.getElementById('code-phase');
        const drawPhase = document.getElementById('draw-phase');
        
        if (drawPhase.classList.contains('active')) {
            drawPhase.classList.remove('active');
            await this.sleep(300);
            codePhase.classList.add('active');
            await this.sleep(300);
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        document.getElementById('code-display').innerHTML = '';
        document.getElementById('explanation').innerHTML = '';
        document.getElementById('draw-info').textContent = '';

        this.isRunning = true;
        this.updateControls();

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

        this.isRunning = false;
        this.updateControls();
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
            lineEl.innerHTML = `
                <span class="line-num">${lineIndex + 1}</span>
                <span class="code-content">${line.html || '&nbsp;'}</span>
            `;
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
        this.isPaused = false;
        document.getElementById('code-display').innerHTML = '';
        document.getElementById('explanation').innerHTML = '';
        document.getElementById('draw-info').textContent = '';

        const drawPhase = document.getElementById('draw-phase');
        const codePhase = document.getElementById('code-phase');
        drawPhase.classList.remove('active');
        await this.sleep(300);
        codePhase.classList.add('active');

        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.updateControls();
    },

    // ---- Controls Panel ----
    updateControls() {
        const panel = document.getElementById('controls-content');
        if (!panel) return;
        panel.innerHTML = '';

        // -- Common Settings Section --
        const commonSection = document.createElement('div');
        commonSection.className = 'ctrl-section';
        commonSection.textContent = 'System Engine';
        panel.appendChild(commonSection);

        // Action Buttons
        const actions = document.createElement('div');
        actions.className = 'ctrl-actions';
        actions.style.marginBottom = '24px';
        actions.innerHTML = `
            <button class="ctrl-btn btn-reset">↺ Reset</button>
            <button class="ctrl-btn btn-play">${this.isRunning ? (this.isPaused ? '▶ Resume' : '⏸ Pause') : '▶ Run Code'}</button>
        `;
        panel.appendChild(actions);
        actions.querySelector('.btn-reset').onclick = () => this.resetAll();
        actions.querySelector('.btn-play').onclick = () => {
            if (this.isRunning) {
                this.togglePause();
            } else {
                this.start();
            }
        };

        // SFX Toggle
        const sfxBtn = document.createElement('button');
        sfxBtn.className = 'ctrl-sfx-btn';
        sfxBtn.textContent = `Audio SFX: ${this.sfxEnabled ? 'Enabled' : 'Muted'}`;
        sfxBtn.onclick = () => {
            this.sfxEnabled = !this.sfxEnabled;
            this.updateControls();
        };
        panel.appendChild(sfxBtn);

        this.renderSlider(panel, 'Process Speed', this.drawSpeed, 0.25, 3, 0.25, (v) => { this.drawSpeed = v; });

        // -- Case-specific Section --
        if (this.currentCase) {
            const caseSection = document.createElement('div');
            caseSection.className = 'ctrl-section';
            caseSection.textContent = 'Case Parameters';
            caseSection.style.marginTop = '32px';
            panel.appendChild(caseSection);

            if (this.currentCase.uiConfig) {
                const controls = typeof this.currentCase.uiConfig === 'function'
                    ? this.currentCase.uiConfig()
                    : this.currentCase.uiConfig;

                controls.forEach(ctrl => {
                    if (ctrl.type === 'slider') {
                        this.renderSlider(panel, ctrl.label, ctrl.value, ctrl.min, ctrl.max, ctrl.step, ctrl.onChange);
                    } else if (ctrl.type === 'select') {
                        this.renderSelect(panel, ctrl.label, ctrl.value, ctrl.options, ctrl.onChange);
                    } else if (ctrl.type === 'info') {
                        this.renderInfo(panel, ctrl.label, ctrl.value);
                    } else if (ctrl.type === 'button') {
                        this.renderButton(panel, ctrl.label, ctrl.onClick);
                    }
                });
            }
        }
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        this.updateControls();
    },

    renderSlider(panel, label, value, min, max, step, onChange) {
        const row = document.createElement('div');
        row.className = 'ctrl-slider';
        row.innerHTML = `
            <div class="ctrl-slider-header">
                <label>${label}</label>
                <span class="ctrl-slider-value">${value}</span>
            </div>
            <input type="range" min="${min}" max="${max}" step="${step}" value="${value}">
        `;
        panel.appendChild(row);

        const input = row.querySelector('input');
        const valEl = row.querySelector('.ctrl-slider-value');
        input.oninput = (e) => {
            const v = parseFloat(e.target.value);
            valEl.textContent = v;
            if (onChange) onChange(v);
        };
    },

    renderInfo(panel, label, value) {
        const row = document.createElement('div');
        row.className = 'ctrl-info';
        row.innerHTML = `
            <div class="ctrl-info-label">${label}</div>
            <div class="ctrl-info-value">${value}</div>
        `;
        panel.appendChild(row);
    },

    renderButton(panel, label, onClick) {
        const row = document.createElement('div');
        row.className = 'ctrl-slider'; // Reuse spacing
        row.innerHTML = `<button class="ctrl-sfx-btn" style="margin-bottom:0">${label}</button>`;
        panel.appendChild(row);
        row.querySelector('button').onclick = onClick;
    },

    renderSelect(panel, label, currentValue, options, onChange) {
        const row = document.createElement('div');
        row.className = 'ctrl-slider'; // Reuse spacing
        const optionsHtml = options.map(opt => 
            `<option value="${opt}" ${opt === currentValue ? 'selected' : ''}>${opt.toUpperCase()}</option>`
        ).join('');
        
        row.innerHTML = `
            <div class="ctrl-slider-header">
                <label>${label}</label>
            </div>
            <select class="ctrl-select">
                ${optionsHtml}
            </select>
        `;
        panel.appendChild(row);
        
        const select = row.querySelector('select');
        select.onchange = (e) => {
            if (onChange) onChange(e.target.value);
            this.updateControls(); // Refresh UI to show change if needed
        };
    },

    // ---- Audio Utilities ----
    ensureAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    playTone(freq, duration = 0.06, volume) {
        if (!this.sfxEnabled) return;
        const vol = volume !== undefined ? volume : this.sfxVolume;
        try {
            const ctx = this.ensureAudio();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, ctx.currentTime);
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

    async sleep(ms) {
        let remaining = ms;
        while (remaining > 0) {
            if (!this.isRunning) return;
            if (this.isPaused) {
                await new Promise(r => setTimeout(r, 50));
                continue;
            }
            const step = Math.min(remaining, 10);
            await new Promise(r => setTimeout(r, step));
            remaining -= step;
        }
    }
};

// Registry for all cases
const MathDrawCases = {};

document.addEventListener('DOMContentLoaded', () => MathDrawEngine.init());
