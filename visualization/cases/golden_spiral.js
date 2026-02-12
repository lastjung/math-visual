/**
 * Golden Spiral Construction (Cinematic Storytelling) - v3 (Final Fix)
 * 1. Square Fade-In (No Stroke animation)
 * 2. Arc: Ultra Thin, Strictly Counter-Clockwise (CCW)
 * 3. Zoom: Bounding Box based auto-fit
 */

const GoldenSpiralCase = {
    PHI: (1 + Math.sqrt(5)) / 2,
    DEFAULT_SPEED: 0.006,
    MIN_CAMERA_SCALE: 0.00000005,
    MAX_CAMERA_SCALE: 200,

    canvas: null,
    ctx: null,
    animationId: null,
    
    // Animation State
    step: 0,
    progress: 0,
    squares: [],
    
    // Config
    maxSteps: Number.POSITIVE_INFINITY,
    speed: 0.006,
    musicTrack: 'assets/music/bgm/Math_09_Fibonacci_Golden_Ratio.mp3',
    
    // Expanded Pastel Palette (12 colors for variety)
    colors: [
        '#FFB7B2', // Pastel Red
        '#FFDAC1', // Pastel Peach
        '#FFF59D', // Pastel Yellow
        '#E2F0CB', // Pastel Lime
        '#B5EAD7', // Pastel Mint
        '#C7CEEA', // Pastel Periwinkle
        '#E1BEE7', // Pastel Purple
        '#F48FB1', // Pastel Pink 
        '#81D4FA', // Pastel Blue
        '#80CBC4', // Pastel Teal
        '#FFCC80', // Pastel Orange
        '#CE93D8'  // Pastel Lilac
    ], 

    // Camera
    cameraScale: 1,
    cameraX: 0,
    cameraY: 0,
    targetScale: 1,
    targetX: 0,
    targetY: 0,
    lastTargetScale: 1,

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Legacy setupControls removed
        this.resize();
        this.reset();
    },
    
    // Universal UI Configuration
    get uiConfig() {
        return [
            {
                type: 'slider',
                id: 'buildSpeed',
                label: 'Speed',
                min: 0.002,
                max: 0.03,
                step: 0.001,
                value: this.speed,
                onChange: (val, labelEl) => {
                    this.speed = val;
                    if (val < 0.005) labelEl.textContent = "Slow";
                    else if (val < 0.01) labelEl.textContent = "Normal";
                    else labelEl.textContent = "Fast";
                }
            }
        ];
    },

    reset() {
        this.step = 0;
        this.progress = 0;
        this.squares = [];
        if (typeof this.speed !== 'number' || Number.isNaN(this.speed)) {
            this.speed = this.DEFAULT_SPEED;
        }
        
        // Initial Square
        this.squares.push({
            x: 0, y: 0, size: 10, val: 1, dir: 0,
            color: this.colors[0] 
        });
        
        // Initial Camera Setup: Start with correct zoom
        const minDim = (this.canvas && this.canvas.width) ? 
                       Math.min(this.canvas.width, this.canvas.height) : 800;
        
        const initialScale = (minDim * 0.45) / 10; // Target Size 10
        
        this.cameraScale = initialScale; 
        this.cameraX = -5;    
        this.cameraY = -5;
        this.targetScale = initialScale;
        this.targetX = -5;
        this.targetY = -5;
        this.lastTargetScale = initialScale;
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        if (!this.animationId) this.draw();
    },

    start() {
        if (this.animationId) return;
        // this.reset(); // Don't auto-reset on resume, just loop
        const loop = () => {
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    },

    stop() {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },

    nextStep() {
        if (this.step >= this.maxSteps) return;

        // Optimization: Keep only recent squares to prevent slowdown and floating point limits
        // If we have too many, remove the oldest one (smallest inner one)
        if (this.squares.length > 15) {
            this.squares.shift();
        }

        const prev = this.squares[this.squares.length - 1]; // Last added square
        
        // 1. Calculate Size
        // We need the size of the square BEFORE prev to calculate next Fibonacci number.
        // If array is truncated, we might not have it.
        // But we can approximate or store 'val' in square.
        // Next Size = Prev Size + PrevPrev Size.
        // If we have at least 2 squares, we can calc.
        let nextSize;
        if (this.squares.length < 2) {
             // Startup special case: 1, 1
             nextSize = prev.size; 
        } else {
             const prevPrev = this.squares[this.squares.length - 2];
             nextSize = prev.size + prevPrev.size;
        }
        
        // 2. Determine Direction
        const dir = (prev.dir + 1) % 4;
        
        // 3. Determine Position (CCW Attachment)
        let nx, ny;
        if (dir === 0) { // Right
            nx = prev.x + prev.size;
            ny = prev.y + prev.size - nextSize; // Bottom Align
        } else if (dir === 1) { // Up
            nx = prev.x + prev.size - nextSize; // Right Align
            ny = prev.y - nextSize;
        } else if (dir === 2) { // Left
            nx = prev.x - nextSize;
            ny = prev.y; // Top Align
        } else if (dir === 3) { // Down
            nx = prev.x; // Left Align
            ny = prev.y + prev.size;
        }

        this.step++; // Actual global step count

        // Push new square
        this.squares.push({
            x: nx, y: ny, size: nextSize, 
            val: nextSize/10, // Approximate "number"
            dir: dir,
            color: this.colors[this.step % this.colors.length]
        });
        
        // this.progress = 0; // Handled in draw loop for continuity
        
        // 4. Update Camera Target (Follow the head)
        // Center view on the NEW square to keep it in focus
        // And zoom out to fit it.
        
        // Calculate bounds of RECENT squares only (since we deleted old ones)
        // This keeps the camera focused on the "Growing Edge"
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.squares.forEach(sq => {
            minX = Math.min(minX, sq.x);
            maxX = Math.max(maxX, sq.x + sq.size);
            minY = Math.min(minY, sq.y);
            maxY = Math.max(maxY, sq.y + sq.size);
        });
        
        const totalW = maxX - minX;
        const totalH = maxY - minY;
        const centerX = minX + totalW / 2;
        const centerY = minY + totalH / 2;
        
        this.targetX = -centerX;
        this.targetY = -centerY;
        
        // Zoom Strategy: Keep the active area visible and FILL the screen
        // We want the 'nextSize' square to occupy a significant portion of the screen.
        // e.g., 50% of the shortest screen dimension.
        const minDim = Math.min(this.canvas.width, this.canvas.height);
        
        // Target: The new square should be roughly 45% of the screen min dimension
        // Only set discrete target for early steps. 
        // For step > 12, we calculate continuous target in draw loop.
        if (this.step <= 12) {
            this.targetScale = (minDim * 0.45) / nextSize;
        }
        
        // Start close - begin zooming out earlier (from step 3)
        if (this.step < 3) {
             this.targetScale = minDim / 25.0; 
        }
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;

        // Background - Keep it dark for contrast
        ctx.fillStyle = '#111'; 
        ctx.fillRect(0, 0, width, height);
        
        // Use internal state speed
        const speed = this.speed;

        // Initialize speed & threshold with default
        let currentSpeed = speed;
        let threshold = 1.2; 

        if (this.step > 12) {
            currentSpeed = speed * 1.2; // Constant nice speed
            threshold = 1.0; 
        } else if (this.step > 8) {
            currentSpeed = speed * 2.0; 
            threshold = 1.0; 
        } else if (this.step > 4) {
             currentSpeed = speed * 1.5;
             threshold = 1.1;
        }

        this.progress += currentSpeed;
        
        if (this.progress >= threshold) { 
             this.nextStep();
             
             if (this.step < 8) {
                 this.progress = 0; // Distinct pause
             } else {
                 this.progress -= 1.0; // Continuous flow
             }
        }

        // Camera Lerp
        let lerp = 0.05;

        // 13번부터 "완전 연속 줌" (Continuous Exponential Zoom)
        // 사각형 크기 성장에 맞춰 카메라도 실시간으로 물러납니다.
        if (this.step > 12) {
             const minDim = Math.min(width, height);
             const lastSq = this.squares[this.squares.length - 1];
             if (lastSq) {
                 // Ease zoom-out after long runs so camera does not outrun square reveal.
                 let zoomProgressScale = 1.0;
                 let visibleRatio = 0.45;
                 if (this.step > 600) {
                     zoomProgressScale = 0.68;
                     visibleRatio = 0.53;
                 } else if (this.step > 300) {
                     zoomProgressScale = 0.78;
                     visibleRatio = 0.50;
                 }

                 const growth = Math.pow(this.PHI, this.progress * zoomProgressScale);
                 const smoothSize = lastSq.size * growth;
                 
                 // Target: Keep visual size constant
                 const rawTargetScale = (minDim * visibleRatio) / smoothSize;

                 // Stabilize late zoom:
                 // 1) prevent zoom-in bounce (target increasing)
                 // 2) cap zoom-out speed per frame
                 let target = Math.min(rawTargetScale, this.lastTargetScale);
                 if (this.step > 300) {
                     const maxZoomOutPerFrame = this.step > 600 ? 0.9985 : 0.997;
                     const floorTarget = this.lastTargetScale * maxZoomOutPerFrame;
                     target = Math.max(target, floorTarget);
                 }
                 this.targetScale = target;
                 this.lastTargetScale = target;
             }
             lerp = this.step > 600 ? 0.055 : (this.step > 300 ? 0.07 : 0.1);
        }

        this.cameraScale += (this.targetScale - this.cameraScale) * lerp;
        this.cameraX += (this.targetX - this.cameraX) * lerp;
        this.cameraY += (this.targetY - this.cameraY) * lerp;
        this.cameraScale = Math.max(this.MIN_CAMERA_SCALE, Math.min(this.MAX_CAMERA_SCALE, this.cameraScale));

        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.scale(this.cameraScale, this.cameraScale);
        ctx.translate(this.cameraX, this.cameraY);
        
        // Adaptive Line Width
        const baseLW = Math.max(0.25, Math.min(8, 2.0 / this.cameraScale));
        const arcLW = Math.max(0.3, Math.min(10, 2.5 / this.cameraScale));

        // Draw Squares
        ctx.lineJoin = 'miter';
        
        this.squares.forEach((sq, idx) => {
            // Is this the newest square being drawn?
            const isHead = (idx === this.squares.length - 1);
            
            // Alpha logic
            let alpha = 1.0;
            if (isHead) alpha = Math.min(this.progress * 1.5, 1);
            
            // 1. Fill (Pastel Color)
            ctx.fillStyle = sq.color;
            ctx.globalAlpha = alpha * 0.9; // High opacity like the image
            ctx.fillRect(sq.x, sq.y, sq.size, sq.size);
            
            // 2. Stroke
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#FFFFFF'; // White borders looks clean with pastel
            ctx.lineWidth = baseLW;
            ctx.strokeRect(sq.x, sq.y, sq.size, sq.size);
            
            // 3. Number
            if (alpha > 0.5 && sq.size * this.cameraScale > 10) {
                ctx.fillStyle = '#000'; // Black text on pastel
                ctx.font = `bold ${sq.size * 0.3}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.round(sq.val), sq.x + sq.size/2, sq.y + sq.size/2);
            }

            // 4. Arc
            let arcProg = 1;
            if (isHead) arcProg = Math.max(0, (this.progress - 0.2) * 1.5);
            if (arcProg > 1) arcProg = 1;
            
            if (arcProg > 0) {
                ctx.beginPath();
                ctx.shadowBlur = 0; // Remove glow for clean look
                ctx.strokeStyle = 'rgba(0,0,0, 0.5)';
                ctx.lineWidth = arcLW; 

                // CCW Logic match
                let cx, cy, startA, endA;
                if (sq.dir === 0) { cx = sq.x; cy = sq.y; startA = Math.PI*0.5; endA = 0; }
                else if (sq.dir === 1) { cx = sq.x; cy = sq.y+sq.size; startA = 0; endA = -Math.PI*0.5; }
                else if (sq.dir === 2) { cx = sq.x+sq.size; cy = sq.y+sq.size; startA = -Math.PI*0.5; endA = -Math.PI; }
                else if (sq.dir === 3) { cx = sq.x+sq.size; cy = sq.y; startA = -Math.PI; endA = -Math.PI*1.5; }
                
                const curEnd = startA + (endA - startA) * arcProg;
                ctx.arc(cx, cy, sq.size, startA, curEnd, true);
                ctx.stroke();
            }
        });

        ctx.restore();
    },

    destroy() {
        this.stop();
    }
};
