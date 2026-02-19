/**
 * Math Draw Case: Circle
 * Drawing a circle using trigonometry (sin, cos)
 */

MathDrawCases['circle'] = {
    title: 'Circle',
    subtitle: 'Drawing a circle using trigonometry',
    fileName: 'circle.js',

    codeLines: [
        { delay: 0, html: `<span class="syn-comment">// Draw a circle using trigonometry</span>` },
        { delay: 400, html: `<span class="syn-keyword">const</span> <span class="syn-var">r</span> <span class="syn-op">=</span> <span class="syn-number">200</span>;  <span class="syn-comment">// radius</span>` },
        { delay: 400, html: `` },
        { delay: 400, html: `<span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">θ</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">θ</span> <span class="syn-op"><=</span> <span class="syn-number">2π</span>; <span class="syn-var">θ</span> <span class="syn-op">+=</span> <span class="syn-number">0.02</span>) {` },
        { delay: 300, html: `  <span class="syn-keyword">const</span> <span class="syn-var">x</span> <span class="syn-op">=</span> <span class="syn-var">r</span> <span class="syn-op">*</span> <span class="syn-func">cos</span>(<span class="syn-var">θ</span>);` },
        { delay: 300, html: `  <span class="syn-keyword">const</span> <span class="syn-var">y</span> <span class="syn-op">=</span> <span class="syn-var">r</span> <span class="syn-op">*</span> <span class="syn-func">sin</span>(<span class="syn-var">θ</span>);` },
        { delay: 300, html: `  <span class="syn-func">drawPoint</span>(<span class="syn-var">x</span>, <span class="syn-var">y</span>);` },
        { delay: 300, html: `}` },
    ],

    explanations: [
        { atLine: 0, text: `We're going to draw a perfect circle using <span class="highlight">only math</span>.` },
        { atLine: 1, text: `First, we decide the size — a radius of <span class="highlight">200 pixels</span>.` },
        { atLine: 3, text: `Then we place dots <span class="highlight">one by one</span>, going all the way around.` },
        { atLine: 4, text: `Each angle tells us <span class="highlight">how far left or right</span> the dot goes.` },
        { atLine: 5, text: `The same angle also tells us <span class="highlight">how far up or down</span>.` },
        { atLine: 6, text: `Connect the dots, and you get a <span class="highlight">perfect circle</span>!` },
    ],

    async draw(ctx, canvas) {
        const E = MathDrawEngine;
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.35;

        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= w; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

        // Draw point by point
        const infoEl = document.getElementById('draw-info');
        let step = 0;

        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        for (let theta = 0; theta <= 2 * Math.PI; theta += 0.02) {
            if (!E.isRunning) return;

            const x = cx + r * Math.cos(theta);
            const y = cy + r * Math.sin(theta);

            if (step === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            ctx.stroke();

            // Moving dot
            ctx.save();
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // Continue line
            ctx.beginPath();
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 8;
            ctx.moveTo(x, y);

            infoEl.textContent = `θ = ${theta.toFixed(2)} rad  |  x = ${(r * Math.cos(theta)).toFixed(1)}  y = ${(r * Math.sin(theta)).toFixed(1)}`;

            if (step % 3 === 0) {
                const freq = 220 + (theta / (2 * Math.PI)) * 660;
                E.playTone(freq, 0.05, 0.06);
            }

            step++;
            await E.sleep(12);
        }

        ctx.shadowBlur = 0;

        // Final clean draw
        ctx.clearRect(0, 0, w, h);
        this.drawFinal(ctx, canvas, cx, cy, r);
        infoEl.textContent = `✓ Complete — ${step} points plotted`;
        E.playComplete();
    },

    drawFinal(ctx, canvas, cx, cy, r) {
        const w = canvas.width, h = canvas.height;

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= w; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

        // Circle
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Radius line
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + r, cy);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '600 14px Inter, sans-serif';
        ctx.fillText('r', cx + r / 2 - 4, cy - 10);
    }
};
