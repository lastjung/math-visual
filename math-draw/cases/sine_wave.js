/**
 * Math Draw Case: Sine Wave
 * Visualizing y = sin(x)
 */

MathDrawCases['sine'] = {
    title: 'Sine Wave',
    subtitle: 'Visualizing the wave function y = sin(x)',
    fileName: 'sine_wave.js',

    // Settings
    amplitude: 80,
    frequency: 2,
    speed: 0.05,

    uiConfig() {
        return [
            { 
                type: 'slider', label: 'Amplitude', 
                min: 10, max: 150, step: 5, 
                value: this.amplitude, 
                onChange: (v) => { this.amplitude = v; } 
            },
            { 
                type: 'slider', label: 'Frequency', 
                min: 0.5, max: 8, step: 0.5, 
                value: this.frequency, 
                onChange: (v) => { this.frequency = v; } 
            }
        ];
    },

    codeLines: [
        { delay: 0, html: `<span class="syn-comment">// Trace a sine wave across the screen</span>` },
        { delay: 400, html: `<span class="syn-keyword">const</span> <span class="syn-var">width</span> <span class="syn-op">=</span> <span class="syn-number">600</span>; <span class="syn-keyword">const</span> <span class="syn-var">amp</span> <span class="syn-op">=</span> <span class="syn-number">80</span>;` },
        { delay: 400, html: `<span class="syn-keyword">const</span> <span class="syn-var">cycles</span> <span class="syn-op">=</span> <span class="syn-number">2</span>;` },
        { delay: 400, html: `` },
        { delay: 400, html: `<span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">x</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">x</span> <span class="syn-op"><=</span> <span class="syn-var">width</span>; <span class="syn-var">x</span><span class="syn-op">++</span>) {` },
        { delay: 400, html: `  <span class="syn-comment">// sin values repeat every 2π</span>` },
        { delay: 300, html: `  <span class="syn-keyword">const</span> <span class="syn-var">y</span> <span class="syn-op">=</span> <span class="syn-var">amp</span> <span class="syn-op">*</span> <span class="syn-func">sin</span>(<span class="syn-var">x</span> <span class="syn-op">*</span> <span class="syn-var">cycles</span> <span class="syn-op">*</span> <span class="syn-number">2π</span> <span class="syn-op">/</span> <span class="syn-var">width</span>);` },
        { delay: 300, html: `  <span class="syn-func">drawPoint</span>(<span class="syn-var">x</span>, <span class="syn-var">y</span>);` },
        { delay: 300, html: `}` },
    ],

    explanations: [
        { atLine: 0, text: `The <span class="highlight">Sine Wave</span> is the fundamental shape of sound and light.` },
        { atLine: 1, text: `Amplitude controls <span class="highlight">how tall</span> the wave gets.` },
        { atLine: 2, text: `Frequency controls <span class="highlight">how many peaks</span> fit in the screen.` },
        { atLine: 4, text: `We move from left to right, one pixel at a time.` },
        { atLine: 5, text: `For every horizontal step, the sine function calculates the <span class="highlight">height</span>.` },
        { atLine: 6, text: `Watch as the smooth curve emerges from pure math!` },
    ],

    async draw(ctx, canvas) {
        const E = MathDrawEngine;
        const w = canvas.width;
        const h = canvas.height;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= w; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

        const infoEl = document.getElementById('draw-info');
        let step = 0;

        ctx.strokeStyle = '#f472b6'; // Pink
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const freqFactor = (this.frequency * (2 * Math.PI)) / w;

        for (let x = 0; x <= w; x += 2) {
            if (!E.isRunning) return;

            const y = cy + this.amplitude * Math.sin(x * freqFactor);

            if (step === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            ctx.stroke();

            // Progress dot
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            ctx.beginPath();
            ctx.moveTo(x, y);

            infoEl.textContent = `x = ${x} | y = ${this.amplitude * Math.sin(x * freqFactor).toFixed(1)}`;

            if (step % 5 === 0) {
                const toneFreq = 300 + Math.sin(x * freqFactor) * 200;
                E.playTone(toneFreq, 0.04, 0.04);
            }

            step++;
            await E.sleep(8 / E.drawSpeed);
        }

        ctx.shadowBlur = 0;
        infoEl.textContent = `✓ Complete — Wave visualized at ${this.frequency}Hz`;
        E.playComplete();
    }
};
