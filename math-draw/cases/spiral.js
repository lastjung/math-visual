/**
 * Math Draw Case: Spiral
 * Drawing a spiral using polar coordinates
 */

MathDrawCases['spiral'] = {
    title: 'Spiral',
    subtitle: 'Drawing a spiral with polar coordinates',
    fileName: 'spiral.js',

    // Settings
    turns: 5,
    growth: 5,

    uiConfig() {
        return [
            { 
                type: 'slider', label: 'Total Turns', 
                min: 1, max: 20, step: 1, 
                value: this.turns, 
                onChange: (v) => { this.turns = v; } 
            },
            { 
                type: 'slider', label: 'Growth Rate', 
                min: 1, max: 15, step: 0.5, 
                value: this.growth, 
                onChange: (v) => { this.growth = v; } 
            }
        ];
    },

    codeLines: [
        { delay: 0, html: `<span class="syn-comment">// Draw a spiral using polar coordinates</span>` },
        { delay: 400, html: `<span class="syn-keyword">let</span> <span class="syn-var">r</span> <span class="syn-op">=</span> <span class="syn-number">0</span>;` },
        { delay: 400, html: `` },
        { delay: 400, html: `<span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">θ</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">θ</span> <span class="syn-op"><=</span> <span class="syn-number">10π</span>; <span class="syn-var">θ</span> <span class="syn-op">+=</span> <span class="syn-number">0.03</span>) {` },
        { delay: 300, html: `  <span class="syn-var">r</span> <span class="syn-op">=</span> <span class="syn-var">θ</span> <span class="syn-op">*</span> <span class="syn-number">5</span>;  <span class="syn-comment">// radius grows with angle</span>` },
        { delay: 300, html: `  <span class="syn-keyword">const</span> <span class="syn-var">x</span> <span class="syn-op">=</span> <span class="syn-var">r</span> <span class="syn-op">*</span> <span class="syn-func">cos</span>(<span class="syn-var">θ</span>);` },
        { delay: 300, html: `  <span class="syn-keyword">const</span> <span class="syn-var">y</span> <span class="syn-op">=</span> <span class="syn-var">r</span> <span class="syn-op">*</span> <span class="syn-func">sin</span>(<span class="syn-var">θ</span>);` },
        { delay: 300, html: `  <span class="syn-func">drawPoint</span>(<span class="syn-var">x</span>, <span class="syn-var">y</span>);` },
        { delay: 300, html: `}` },
    ],

    explanations: [
        { atLine: 0, text: `A spiral is like a circle that keeps <span class="highlight">growing outward</span>.` },
        { atLine: 1, text: `The radius starts at <span class="highlight">zero</span> — right at the center.` },
        { atLine: 3, text: `We go around <span class="highlight">5 full turns</span> (10π radians).` },
        { atLine: 4, text: `The key: the radius <span class="highlight">increases</span> with each step.` },
        { atLine: 5, text: `Same trig as before — angle decides <span class="highlight">direction</span>.` },
        { atLine: 7, text: `The result? A beautiful <span class="highlight">Archimedean spiral</span>!` },
    ],

    async draw(ctx, canvas) {
        const E = MathDrawEngine;
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxTheta = this.turns * 2 * Math.PI;
        const scale = Math.min(w, h) * 0.003;

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
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

        const infoEl = document.getElementById('draw-info');
        let step = 0;

        ctx.beginPath();

        for (let theta = 0; theta <= maxTheta; theta += 0.03) {
            if (!E.isRunning) return;

            const r = theta * this.growth * scale;
            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);
            
            if (step === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            // Color shifts with angle
            const hue = (theta / maxTheta) * 320;
            ctx.strokeStyle = `hsl(${hue}, 85%, 65%)`;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = `hsl(${hue}, 85%, 65%)`;
            ctx.shadowBlur = 6;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y);

            infoEl.textContent = `θ = ${theta.toFixed(2)} rad  |  r = ${r.toFixed(1)}  |  turn ${(theta / (2 * Math.PI)).toFixed(1)}`;

            if (step % 4 === 0) {
                const freq = 200 + (theta / maxTheta) * 800;
                E.playTone(freq, 0.04, 0.05);
            }

            step++;
            await E.sleep(6 / E.drawSpeed);
        }

        ctx.shadowBlur = 0;
        infoEl.textContent = `✓ Complete — ${step} points, ${(maxTheta / (2*Math.PI)).toFixed(0)} turns`;
        E.playComplete();
    }
};
