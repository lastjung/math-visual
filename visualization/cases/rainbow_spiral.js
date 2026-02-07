/**
 * Golden Angle Fibonacci Spiral (Phyllotaxis)
 * True Mathematical Implementation using Golden Ratio (137.5 degrees)
 * features:
 * - Precise Golden Angle placement (theta = n * 137.508...)
 * - Visualizes Fibonacci Parastichies (spiral arms appear naturally)
 * - Rainbow colors mapped to spiral divergence
 */

const RainbowSpiralCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    time: 0,
    growth: 0,
    
    // The Golden Angle: 360 * (1 - 1/phi) ~= 137.50776 degrees
    goldenAngle: Math.PI * (3 - Math.sqrt(5)), 

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.setupControls();
        this.resize();
        this.reset();
    },

    reset() {
        this.time = 0;
        this.growth = 0;
        if (this.ctx) {
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    setupControls() {
        const controls = document.querySelector('.controls');
        if (!controls) return;
        
        controls.innerHTML = `
            <div class="control-group">
                <label>황금각 (Golden Angle)</label>
                <div style="font-family: monospace; color: var(--brilliant-green);">137.507...°</div>
            </div>
            <div class="control-group">
                <label for="spiralSpeed">회전 속도 (Spin)</label>
                <input type="range" id="spiralSpeed" min="0.001" max="0.1" step="0.001" value="0.02">
            </div>
            <div class="control-group">
                <label for="pointSize">점 크기 (Dot Size)</label>
                <input type="range" id="pointSize" min="1" max="10" step="0.5" value="4">
            </div>
            <button class="btn-primary" id="restartSpiral">다시 성장 (Re-Bloom)</button>
        `;
        
        const btn = document.getElementById('restartSpiral');
        if (btn) btn.addEventListener('click', () => this.reset());
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        if (!this.animationId) this.draw();
    },

    start() {
        if (this.animationId) return;
        const loop = () => {
            if (this.ctx) this.draw();
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
        const width = canvas.width;
        const height = canvas.height;

        // 1. Black Background
        // Use slight fade for trails if desired, but user likes clean lines
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'; 
        ctx.fillRect(0, 0, width, height);

        // 2. Constants & Controls
        const speed = parseFloat(document.getElementById('spiralSpeed')?.value || 0.02);
        const dotBaseSize = parseFloat(document.getElementById('pointSize')?.value || 4);
        
        this.time += speed;

        // Growth logic: number of points increases
        // Max points depends on screen area
        const maxPoints = 2000;
        if (this.growth < maxPoints) {
            this.growth += 5; // Add 5 points per frame
        }

        ctx.save();
        ctx.translate(width / 2, height / 2);
        
        // Rotate entire formation
        ctx.rotate(this.time * 0.2);

        // 3. Draw Phyllotaxis Spiral
        // The core logic of Fibonacci in Nature
        const scale = 8; // Spacing parameter 'c'

        for (let n = 0; n < this.growth; n++) {
            // Formula: 
            // angle = n * 137.5 deg
            // radius = c * sqrt(n)
            
            const theta = n * this.goldenAngle;
            const r = scale * Math.sqrt(n);
            
            // Cartesian conversion
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);

            // True Fibonacci Spiral Color Logic
            // Colors cycle every time we complete a rotation or based on distance
            // Use 'n % 256' to cycle hue or just simple rainbow
            const hue = (n * 0.5 + this.time * 50) % 360; 
            
            ctx.beginPath();
            ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            
            // Dynamic Size: Outer dots can be larger
            const size = dotBaseSize + (n / maxPoints) * 2;
            
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    destroy() {
        this.stop();
    }
};
