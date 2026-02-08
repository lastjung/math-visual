/**
 * HexagonGridCase
 * Exploring Hexagonal Grids based on Red Blob Games research.
 * System: Axial Coordinates (q, r)
 * Orientation: Pointy-topped
 */
const HexagonGridCase = {
    canvas: null,
    ctx: null,
    animationId: null,

    // Config State
    hexSize: 30,     // Radius of hex
    gridRadius: 8,   // How many rings
    
    // Animation State
    time: 0,
    speed: 0.05,
    frequency: 0.5,
    waveAmplitude: 1, // Visual scale factor

    // Interaction State
    hoverHex: null,  // {q, r}
    
    // Calculated Constants
    sqrt3: Math.sqrt(3),

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Event Listeners for Interaction
        this.moveHandler = (e) => this.handleMouseMove(e);
        this.canvas.addEventListener('mousemove', this.moveHandler);
        
        this.resize();
    },

    get uiConfig() {
        return [
            {
                type: 'info',
                label: 'System',
                value: 'Axial (q, r)'
            },
            {
                type: 'slider',
                id: 'hexSize',
                label: 'Hex Size',
                min: 10,
                max: 60,
                step: 1,
                value: this.hexSize,
                onChange: (val) => { this.hexSize = val; } // No draw() needed, loop handles it
            },
            {
                type: 'slider',
                id: 'gridRadius',
                label: 'Grid Radius',
                min: 2,
                max: 15,
                step: 1,
                value: this.gridRadius,
                onChange: (val) => { this.gridRadius = val; }
            },
            {
                type: 'slider',
                id: 'speed',
                label: 'Wave Speed',
                min: 0,
                max: 0.2,
                step: 0.01,
                value: this.speed,
                onChange: (val) => { this.speed = val; }
            },
            {
                type: 'slider',
                id: 'frequency',
                label: 'Wave Freq',
                min: 0.1,
                max: 2.0,
                step: 0.1,
                value: this.frequency,
                onChange: (val) => { this.frequency = val; }
            }
        ];
    },

    // --- Interaction ---
    handleMouseMove(e) {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.canvas.width / 2;
        const y = e.clientY - rect.top - this.canvas.height / 2;
        
        this.hoverHex = this.pixelToHex(x, y);
    },

    // --- Core Logic: Axial Coordinates ---
    
    // Convert Pixel (x, y) relative to center -> Hex (q, r)
    pixelToHex(x, y) {
        const size = this.hexSize;
        const q = (this.sqrt3/3 * x  -  1/3 * y) / size;
        const r = (                     2/3 * y) / size;
        return this.hexRound(q, r);
    },

    // Rounding floating point coords to nearest integer hex (Cube Rounding)
    hexRound(q, r) {
        let s = -q - r;
        
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const q_diff = Math.abs(rq - q);
        const r_diff = Math.abs(rr - r);
        const s_diff = Math.abs(rs - s);

        if (q_diff > r_diff && q_diff > s_diff) {
            rq = -rr - rs;
        } else if (r_diff > s_diff) {
            rr = -rq - rs;
        } else {
            rs = -rq - rr;
        }
        return { q: rq, r: rr };
    },

    // Convert Hex (q, r) -> Pixel (x, y) center
    hexToPixel(q, r) {
        const size = this.hexSize;
        const x = size * (this.sqrt3 * q  +  this.sqrt3/2 * r);
        const y = size * (                         3/2 * r);
        return { x, y };
    },

    // --- Drawing ---

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        // restart loop to ensure size is picked up? handled in loop
    },

    start() {
        if (!this.animationId) {
            this.animate();
        }
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.moveHandler);
        }
        this.hoverHex = null;
    },

    reset() {
        this.time = 0;
        this.speed = 0.05;
        this.frequency = 0.5;
        this.hexSize = 30;
        this.gridRadius = 8;
        this.resize();
    },

    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    update() {
        this.time += this.speed;
    },

    draw() {
        const ctx = this.ctx;
        if (!ctx) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;

        // Clear with fade effect for trails? No, crisp redraw for now
        ctx.fillStyle = '#1e1e1e'; 
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(centerX, centerY);

        const N = this.gridRadius;
        
        for (let q = -N; q <= N; q++) {
            const r1 = Math.max(-N, -q - N);
            const r2 = Math.min(N, -q + N);
            for (let r = r1; r <= r2; r++) {
                this.drawHex(ctx, q, r);
            }
        }

        ctx.restore();
    },

    drawHex(ctx, q, r) {
        const center = this.hexToPixel(q, r);
        
        // Calculate Distance from center (0,0)
        // Axial distance = (abs(q) + abs(q+r) + abs(r)) / 2
        const dist = (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;

        // Wave Logic: Sinusoidal wave expanding from center
        // phase = distance * frequency - time
        const phase = dist * this.frequency - this.time;
        const wave = Math.sin(phase); // -1 to 1

        // Modulation
        // Size variation: shrink slightly on trough
        const scale = 1 + wave * 0.1; // 0.9 to 1.1 scale
        
        const size = this.hexSize * scale;
        const drawSize = size * 0.92; // Padding
        
        // Color Modulation
        // Hue shifts with wave
        const baseHue = 210; // Blue
        const hue = (baseHue + wave * 30 + dist * 5) % 360; 
        const lightness = 40 + wave * 10; // 30% to 50%
        
        // Check Hover
        const isHover = this.hoverHex && this.hoverHex.q === q && this.hoverHex.r === r;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_deg = 60 * i + 30; 
            const angle_rad = Math.PI / 180 * angle_deg;
            const px = center.x + drawSize * Math.cos(angle_rad);
            const py = center.y + drawSize * Math.sin(angle_rad);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // Styling
        if (isHover) {
            ctx.fillStyle = '#FFD700'; // Gold Highlight
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw Coords Text
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${q},${r}`, center.x, center.y);
        } else {
            ctx.fillStyle = `hsla(${hue}, 60%, ${lightness}%, 0.6)`;
            ctx.fill();
            
            ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.3)`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw Coords (Faint)
            if (this.hexSize >= 35) { 
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${q},${r}`, center.x, center.y);
            }
        }
    },
    
    destroy() {
       this.stop();
    }
};
