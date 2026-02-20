/**
 * Math Draw Case: Square Spiral
 * Rotating squares riding on a spiral growth path
 */

MathDrawCases['square_spiral'] = {
    title: 'Square Spiral',
    subtitle: 'Squares blooming along an Archimedean spiral',
    fileName: 'square_spiral.js',

    // Settings
    count: 50,
    size: 50,
    turns: 4,
    growth: 130, 
    opacity: 0.5,
    pivot: 'center',

    uiConfig() {
        return [
            { 
                type: 'slider', label: 'Square Count', 
                min: 10, max: 120, step: 5, 
                value: this.count, 
                onChange: (v) => { this.count = v; } 
            },
            { 
                type: 'slider', label: 'Square Size', 
                min: 10, max: 150, step: 5, 
                value: this.size, 
                onChange: (v) => { this.size = v; } 
            },
            {
                type: 'select', label: 'Rotation Pivot',
                options: ['center', 'vertex'],
                value: this.pivot,
                onChange: (v) => { this.pivot = v; }
            },
            { 
                type: 'slider', label: 'Spiral Turns', 
                min: 1, max: 8, step: 1, 
                value: this.turns, 
                onChange: (v) => { this.turns = v; } 
            }
        ];
    },

    codeLines: [
        { delay: 0, html: `<span class="syn-comment">// Nested Loop: Spiral Path & Square Tracing</span>` },
        { delay: 400, html: `<span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">i</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">i</span> <span class="syn-op">&lt;</span> <span class="syn-var">count</span>; <span class="syn-var">i</span><span class="syn-op">++</span>) {` },
        { delay: 400, html: `  <span class="syn-var">pos</span> <span class="syn-op">=</span> <span class="syn-func">calcSpiral</span>(<span class="syn-var">i</span>); <span class="syn-comment">// r = a * theta</span>` },
        { delay: 400, html: `  <span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">sideIdx</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">sideIdx</span> <span class="syn-op">&lt;</span> <span class="syn-number">4</span>; <span class="syn-var">sideIdx</span><span class="syn-op">++</span>) {` },
        { delay: 200, html: `    <span class="syn-func">traceSide</span>(<span class="syn-var">sideIdx</span>); <span class="syn-comment">// Nested loop for sharp corners</span>` },
        { delay: 200, html: `  }` },
        { delay: 300, html: `}` },
    ],

    explanations: [
        { atLine: 0, text: `Combining a <span class="highlight">Spiral Path</span> with sharp <span class="highlight">Square Tracing</span>.` },
        { atLine: 2, text: `The center of each square moves along the curve <span class="highlight">r = aθ</span>.` },
        { atLine: 4, text: `Inside each step, we nestedly trace 4 sides for geometric precision.` },
    ],

    async draw(ctx, canvas) {
        const E = MathDrawEngine;
        const w = canvas.width, h = canvas.height;
        const cx = w/2, cy = h/2;
        
        ctx.clearRect(0, 0, w, h);
        
        const infoEl = document.getElementById('draw-info');
        const count = this.count;
        const side = this.size * (w / 600);
        const maxTheta = this.turns * Math.PI * 2;
        const growthFactor = this.growth * (w / 600) / (Math.PI * 2);

        for (let i = 0; i < count; i++) {
            if (!E.isRunning) return;
            
            const theta = (i / count) * maxTheta;
            const r = theta * growthFactor;
            const scx = cx + r * Math.cos(theta);
            const scy = cy + r * Math.sin(theta);
            
            const hue = (i / count) * 360;
            ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${this.opacity})`;
            ctx.lineWidth = 1.2;

            const offset = (this.pivot === 'center') ? -side/2 : 0;

            for (let sideIdx = 0; sideIdx < 4; sideIdx++) {
                let currentSideDist = 0;
                while (currentSideDist < side) {
                    if (!E.isRunning) return;
                    
                    const speed = 12 * E.drawSpeed;
                    const prevDist = currentSideDist;
                    currentSideDist += speed;
                    if (currentSideDist > side) currentSideDist = side;

                    let x1, y1, x2, y2;
                    if (sideIdx === 0) { // Bottom
                        x1 = offset + prevDist; y1 = offset;
                        x2 = offset + currentSideDist; y2 = offset;
                    } else if (sideIdx === 1) { // Right
                        x1 = offset + side; y1 = offset + prevDist;
                        x2 = offset + side; y2 = offset + currentSideDist;
                    } else if (sideIdx === 2) { // Top
                        x1 = offset + side - prevDist; y1 = offset + side;
                        x2 = offset + side - currentSideDist; y2 = offset + side;
                    } else { // Left
                        x1 = offset; y1 = offset + side - prevDist;
                        x2 = offset; y2 = offset + side - currentSideDist;
                    }

                    // Rotate based on spiral angle theta + extra rotation if desired? 
                    // Let's stick to theta for a "clinging to path" effect
                    const rotate = (px, py) => ({
                        rx: scx + px * Math.cos(theta) - py * Math.sin(theta),
                        ry: scy + px * Math.sin(theta) + py * Math.cos(theta)
                    });

                    const p1 = rotate(x1, y1);
                    const p2 = rotate(x2, y2);

                    ctx.beginPath();
                    ctx.moveTo(p1.rx, p1.ry);
                    ctx.lineTo(p2.rx, p2.ry);
                    ctx.stroke();

                    await E.sleep(8 / E.drawSpeed);
                }
            }

            if (i % 3 === 0) E.playTone(200 + (r/300) * 800, 0.02, 0.04);
            infoEl.textContent = `Square ${i+1}/${count} | R: ${r.toFixed(0)}px | Pivot: ${this.pivot.toUpperCase()}`;
        }

        infoEl.textContent = `✓ Square Spiral Complete — All blooms mapped to path`;
        E.playComplete();
    }
};
