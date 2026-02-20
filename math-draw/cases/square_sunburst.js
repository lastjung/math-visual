/**
 * Math Draw Case: Square Sunburst
 * Tracing squares around a center or vertex pivot
 */

MathDrawCases['square_sunburst'] = {
    title: 'Square Burst',
    subtitle: 'Geometric star through rotating squares',
    fileName: 'square_sunburst.js',

    // Settings
    count: 36,
    size: 150,
    opacity: 0.6,
    pivot: 'vertex', // Vertex focus by default to show progress

    uiConfig() {
        return [
            { 
                type: 'slider', label: 'Square Count', 
                min: 4, max: 100, step: 2, 
                value: this.count, 
                onChange: (v) => { this.count = v; } 
            },
            { 
                type: 'slider', label: 'Square Size', 
                min: 20, max: 300, step: 5, 
                value: this.size, 
                onChange: (v) => { this.size = v; } 
            },
            {
                type: 'select', label: 'Rotation Pivot',
                options: ['center', 'vertex'],
                value: this.pivot,
                onChange: (v) => { this.pivot = v; }
            }
        ];
    },

    codeLines: [
        { delay: 0, html: `<span class="syn-comment">// Define square based on pivot (0,0 or -S, -S)</span>` },
        { delay: 400, html: `<span class="syn-keyword">for</span> (<span class="syn-keyword">let</span> <span class="syn-var">i</span> <span class="syn-op">=</span> <span class="syn-number">0</span>; <span class="syn-var">i</span> <span class="syn-op">&lt;</span> <span class="syn-var">count</span>; <span class="syn-var">i</span><span class="syn-op">++</span>) {` },
        { delay: 400, html: `  <span class="syn-keyword">let</span> <span class="syn-var">S</span> <span class="syn-op">=</span> <span class="syn-var">size</span>, <span class="syn-var">startX</span> <span class="syn-op">=</span> <span class="syn-var">pivot</span><span class="syn-op">===</span><span class="syn-str">'vertex'</span> <span class="syn-op">?</span> <span class="syn-number">0</span> <span class="syn-op">:</span> <span class="syn-op">-</span><span class="syn-var">S</span><span class="syn-op">/</span><span class="syn-number">2</span>;` },
        { delay: 400, html: `  <span class="syn-keyword">let</span> <span class="syn-var">startY</span> <span class="syn-op">=</span> <span class="syn-var">startX</span>;` },
        { delay: 400, html: `  <span class="syn-keyword">while</span> (<span class="syn-var">dist</span> <span class="syn-op">&lt;</span> <span class="syn-var">S</span> <span class="syn-op">*</span> <span class="syn-number">4</span>) {` },
        { delay: 200, html: `    <span class="syn-func">line</span>(<span class="syn-var">x</span>, <span class="syn-var">y</span>); <span class="syn-comment">// Vertex (0,0) is the fixed anchor</span>` },
        { delay: 300, html: `  }` },
        { delay: 300, html: `}` },
    ],

    explanations: [
        { atLine: 0, text: `The <span class="highlight">Pivot</span> determines if we rotate around the center or a corner.` },
        { atLine: 2, text: `In <span class="highlight">vertex mode</span>, (0,0) is anchored at the canvas center.` },
        { atLine: 5, text: `The square extends from <span class="highlight">(0,0) to (S,S)</span>, swinging as it rotates.` },
    ],

    async draw(ctx, canvas) {
        const E = MathDrawEngine;
        const w = canvas.width, h = canvas.height;
        const cx = w/2, cy = h/2;
        
        ctx.clearRect(0, 0, w, h);
        
        const infoEl = document.getElementById('draw-info');
        const totalCount = this.count;
        const side = this.size * (w / 600); 
        const perimeter = side * 4;

        for (let i = 0; i < totalCount; i++) {
            if (!E.isRunning) return;
            const angle = (i / totalCount) * Math.PI * 2;
            const hue = (i / totalCount) * 360;
            
            ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${this.opacity})`;
            ctx.lineWidth = 1.6;

            // PIVOT LOGIC: Determine the local anchor point
            const offset = (this.pivot === 'center') ? -side/2 : 0;
            
            // NESTED LOOP: 4 Sides of the square
            for (let sideIdx = 0; sideIdx < 4; sideIdx++) {
                let currentSideDist = 0;
                
                while (currentSideDist < side) {
                    if (!E.isRunning) return;
                    
                    const speed = 10 * E.drawSpeed;
                    const prevDist = currentSideDist;
                    currentSideDist += speed;
                    if (currentSideDist > side) currentSideDist = side;

                    // Calculate local coordinates based on which side we are on
                    let x1, y1, x2, y2;
                    
                    if (sideIdx === 0) { // Bottom (Right)
                        x1 = offset + prevDist; y1 = offset;
                        x2 = offset + currentSideDist; y2 = offset;
                    } else if (sideIdx === 1) { // Right (Down)
                        x1 = offset + side; y1 = offset + prevDist;
                        x2 = offset + side; y2 = offset + currentSideDist;
                    } else if (sideIdx === 2) { // Top (Left)
                        x1 = offset + side - prevDist; y1 = offset + side;
                        x2 = offset + side - currentSideDist; y2 = offset + side;
                    } else { // Left (Up)
                        x1 = offset; y1 = offset + side - prevDist;
                        x2 = offset; y2 = offset + side - currentSideDist;
                    }

                    const rotate = (px, py) => ({
                        rx: cx + px * Math.cos(angle) - py * Math.sin(angle),
                        ry: cy + px * Math.sin(angle) + py * Math.cos(angle)
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

            if (i % 2 === 0) E.playTone(200 + (hue/360) * 600, 0.03, 0.05);
            infoEl.textContent = `Square ${i+1}/${totalCount} | Pivot: ${this.pivot.toUpperCase()}`;
        }

        infoEl.textContent = `✓ Completed — All squares anchored at ${this.pivot}`;
        E.playComplete();
    }
};
