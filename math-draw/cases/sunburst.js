/**
 * Math Draw Case: Sunburst
 * Radiant outward ray tracing logic
 */

MathDrawCases['sunburst'] = {
    title: 'Sunburst',
    subtitle: 'Projecting radiant rays from the center',
    fileName: 'sunburst.js',

    // Settings
    turns: 4,
    density: 0.08, // angle step

    uiConfig() {
        return [
            { 
                type: 'slider', label: 'Complexity (Turns)', 
                min: 1, max: 12, step: 1, 
                value: this.turns, 
                onChange: (v) => { this.turns = v; } 
            },
            { 
                type: 'slider', label: 'Ray Density', 
                min: 0.02, max: 0.4, step: 0.02, 
                value: this.density, 
                onChange: (v) => { this.density = v; } 
            }
        ];
    },

    codeLines: [
        { delay: 0, html: `<span class="syn-comment">// Sunburst: Outward ray tracing logic</span>` },
        { delay: 400, html: `<span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">θ</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">θ</span> <span class="syn-op">&lt;</span> <span class="syn-var">maxθ</span>; <span class="syn-var">θ</span> <span class="syn-op">+=</span> <span class="syn-var">step</span>) {` },
        { delay: 400, html: `  <span class="syn-keyword">let</span> <span class="syn-var">dist</span> <span class="syn-op">=</span> <span class="syn-number">0</span>, <span class="syn-var">limit</span> <span class="syn-op">=</span> <span class="syn-var">θ</span> <span class="syn-op">*</span> <span class="syn-number">8</span>;` },
        { delay: 400, html: `  <span class="syn-keyword">while</span> (<span class="syn-var">dist</span> <span class="syn-op">&lt;</span> <span class="syn-var">limit</span>) {` },
        { delay: 200, html: `    <span class="syn-keyword">const</span> <span class="syn-var">x</span> <span class="syn-op">=</span> <span class="syn-var">dist</span> <span class="syn-op">*</span> <span class="syn-func">cos</span>(<span class="syn-var">θ</span>);` },
        { delay: 200, html: `    <span class="syn-keyword">const</span> <span class="syn-var">y</span> <span class="syn-op">=</span> <span class="syn-var">dist</span> <span class="syn-op">*</span> <span class="syn-func">sin</span>(<span class="syn-var">θ</span>);` },
        { delay: 300, html: `    <span class="syn-func">line</span>(<span class="syn-number">0</span>, <span class="syn-number">0</span>, <span class="syn-var">x</span>, <span class="syn-var">y</span>); <span class="syn-var">dist</span> <span class="syn-op">+=</span> <span class="syn-var">speed</span>;` },
        { delay: 300, html: `  }` },
        { delay: 300, html: `}` },
    ],

    explanations: [
        { atLine: 0, text: `The <span class="highlight">Sunburst</span> originates from the center and shoots outwards.` },
        { atLine: 3, text: `The <span class="highlight">while loop</span> animates the outward growth of each ray.` },
        { atLine: 4, text: `Polar coordinates translate this motion into <span class="highlight">Cartesian</span> coordinates.` },
        { atLine: 8, text: `Watch as each ray grows, building the <span class="highlight">Radiant Sun</span> line by line.` },
    ],

    async draw(ctx, canvas) {
        const E = MathDrawEngine;
        const w = canvas.width, h = canvas.height;
        const cx = w/2, cy = h/2;
        
        ctx.clearRect(0, 0, w, h);
        
        const infoEl = document.getElementById('draw-info');
        const maxTheta = this.turns * 2 * Math.PI;
        const growthFactor = 8 * (w / 600);

        let totalRays = 0;
        for (let theta = 0; theta <= maxTheta; theta += this.density) {
            if (!E.isRunning) return;
            
            const targetR = theta * growthFactor;
            const hue = (theta / maxTheta) * 360;
            
            ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.7)`;
            ctx.lineWidth = 1.6;
            ctx.shadowBlur = 4;
            ctx.shadowColor = `hsla(${hue}, 90%, 65%, 0.8)`;

            let currentDist = 0;
            // Trace from center outwards
            while (currentDist < targetR) {
                if (!E.isRunning) return;

                // DYNAMIC SPEED: Balanced speed (3x faster than previous slow version)
                const currentRaySpeed = 10 * E.drawSpeed;
                
                const prevDist = currentDist;
                currentDist += currentRaySpeed;
                if (currentDist > targetR) currentDist = targetR;

                const x1 = cx + prevDist * Math.cos(theta);
                const y1 = cy + prevDist * Math.sin(theta);
                const x2 = cx + currentDist * Math.cos(theta);
                const y2 = cy + currentDist * Math.sin(theta);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                // Dynamic sleep set back to 10 as requested
                await E.sleep(10 / E.drawSpeed);
            }

            if (totalRays % 5 === 0) {
                E.playTone(180 + (theta / maxTheta) * 850, 0.04, 0.03);
            }

            totalRays++;
            infoEl.textContent = `Ray ${totalRays} | Length: ${(targetR).toFixed(0)}px`;
        }

        ctx.shadowBlur = 0;
        infoEl.textContent = `✓ Sunburst Complete — ${totalRays} radiant rays shot outwards!`;
        E.playComplete();
    }
};
