/**
 * Golden Spiral Construction (Cinematic Storytelling) - v3 (Final Fix)
 * 1. Square Fade-In (No Stroke animation)
 * 2. Arc: Ultra Thin, Strictly Counter-Clockwise (CCW)
 * 3. Zoom: Bounding Box based auto-fit
 */

const GoldenSpiralCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    // Animation State
    step: 0,
    progress: 0,
    squares: [],
    
    // Config
    maxSteps: 1000,     // Effectively Infinite
    speed: 0.006, 
    
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

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.setupControls();
        this.resize();
        this.reset();
    },

    reset() {
        this.step = 0;
        this.progress = 0;
        this.squares = [];
        
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
    },

    setupControls() {
        // Remove existing controls if any
        const existingDock = document.getElementById('floating-dock-container');
        if (existingDock) existingDock.remove();
        const existingPanel = document.getElementById('settings-panel');
        if (existingPanel) existingPanel.remove();

        // 1. Settings Panel (Hidden by default)
        const panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.style.cssText = `
            position: fixed; bottom: 100px; left: 50%; transform: translate(-50%, 20px); 
            opacity: 0; pointer-events: none; transition: all 0.3s ease; 
            background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
            padding: 24px; border-radius: 24px; width: 320px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 1000;
            display: flex; flex-direction: column; gap: 16px;
        `;
        panel.innerHTML = `
            <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <label style="font-weight:700; color:#333;">Speed</label>
                    <span id="speed-val" style="font-family:monospace; color:#29cc57;">Normal</span>
                </div>
                <input type="range" id="buildSpeed" min="0.002" max="0.03" step="0.001" value="0.006" style="width:100%; accent-color:#29cc57;">
            </div>
            <div style="font-size:0.8rem; color:#666; text-align:center;">
                Press <b style="color:#000;">ESC</b> to exit Fullscreen
            </div>
        `;
        document.body.appendChild(panel);

        const speedInput = document.getElementById('buildSpeed');
        const speedVal = document.getElementById('speed-val');
        speedInput.oninput = (e) => {
            const v = parseFloat(e.target.value);
            if (v < 0.005) speedVal.textContent = "Slow";
            else if (v < 0.01) speedVal.textContent = "Normal";
            else speedVal.textContent = "Fast";
        };

        // 2. Floating Dock
        const dock = document.createElement('div');
        dock.id = 'floating-dock-container';
        dock.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translate(-50%, 0); 
            z-index: 1001; display: flex; gap: 12px; align-items: center; 
            background: rgba(30, 30, 40, 0.7); backdrop-filter: blur(20px); 
            padding: 12px 20px; border-radius: 50px; 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            transition: opacity 0.3s;
        `;
        
        // Helper for Icon Buttons
        const createBtn = (html, title, onClick) => {
            const b = document.createElement('button');
            b.innerHTML = html;
            b.title = title;
            b.onclick = onClick;
            b.style.cssText = `
                background: rgba(255,255,255,0.1); border: none; color: white; 
                width: 40px; height: 40px; border-radius: 50%; cursor: pointer; 
                display: flex; justify-content: center; align-items: center; 
                font-size: 1.2rem; transition: all 0.2s;
            `;
            b.onmouseover = () => b.style.background = 'rgba(255,255,255,0.2)';
            b.onmouseout = () => b.style.background = 'rgba(255,255,255,0.1)';
            return b;
        };

        // Settings Button
        const btnSettings = createBtn('⚙️', 'Settings', () => {
             const isHidden = panel.style.opacity === '0';
             panel.style.opacity = isHidden ? '1' : '0';
             panel.style.pointerEvents = isHidden ? 'auto' : 'none';
             panel.style.transform = isHidden ? 'translate(-50%, 0)' : 'translate(-50%, 20px)';
        });
        
        // Reset Button
        const btnReset = createBtn('↺', 'Reset', () => {
            this.reset();
            // Auto start if paused
            if (!this.animationId) {
                const loop = () => {
                    this.draw();
                    this.animationId = requestAnimationFrame(loop);
                };
                loop();
                updatePlayBtn(true);
            }
        });

        // Play/Pause Main Button
        const btnPlay = document.createElement('button');
        btnPlay.style.cssText = `
            background: linear-gradient(135deg, #29cc57, #009b2b); 
            color: white; border: none; border-radius: 30px; 
            padding: 0 24px; height: 44px; font-weight: 700; 
            font-family: 'Inter', sans-serif; font-size: 0.95rem;
            display: flex; align-items: center; gap: 8px; cursor: pointer;
            box-shadow: 0 4px 15px rgba(41, 204, 87, 0.4);
            transition: transform 0.1s;
        `;
        const updatePlayBtn = (isRunning) => {
            btnPlay.innerHTML = isRunning ? '<span>❚❚</span> <span>Hold</span>' : '<span>▶</span> <span>Resume</span>';
            btnPlay.style.background = isRunning ? 
                'linear-gradient(135deg, #29cc57, #009b2b)' : 
                'linear-gradient(135deg, #ffb74d, #f57c00)';
        };
        updatePlayBtn(true); // Default running

        btnPlay.onclick = () => {
            if (this.animationId) {
                this.stop();
                updatePlayBtn(false);
            } else {
                const loop = () => {
                    this.draw();
                    this.animationId = requestAnimationFrame(loop);
                };
                loop();
                updatePlayBtn(true);
            }
        };
        btnPlay.onmousedown = () => btnPlay.style.transform = 'scale(0.95)';
        btnPlay.onmouseup = () => btnPlay.style.transform = 'scale(1)';

        // Hide UI Button
        const btnHide = createBtn('👁️', 'Cinematic Mode', () => {
             document.body.classList.add('hide-ui');
             dock.style.opacity = '0'; // Hide dock too
             dock.style.pointerEvents = 'none';
             this.resize();
        });

        // Append to Dock
        dock.appendChild(btnSettings);
        dock.appendChild(btnHide); // Moved Hide next to settings
        dock.appendChild(document.createElement('div')).style.cssText = "width:1px; height:20px; background:rgba(255,255,255,0.2); margin:0 4px;";
        dock.appendChild(btnReset);
        dock.appendChild(btnPlay);

        document.body.appendChild(dock);

        // ESC Listener to show Dock
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.body.classList.remove('hide-ui');
                dock.style.opacity = '1';
                dock.style.pointerEvents = 'auto';
                this.resize();
            }
        });
        
        // Hide original controls area
        const originalControls = document.querySelector('.controls');
        if (originalControls) originalControls.style.display = 'none';
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        if (!this.animationId) this.draw();
    },

    start() {
        if (this.animationId) return;
        this.reset(); 
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
        
        // Start close - Don't zoom out for the first few steps
        if (this.step < 4) {
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

        const speed = parseFloat(document.getElementById('buildSpeed')?.value || 0.006);
        const glowAmnt = parseFloat(document.getElementById('glowAmount')?.value || 15);

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
                 // Golden Ratio Growth Simulation: Size * 1.618^progress
                 // This perfectly matches the next square's size when progress reaches 1.0
                 const growth = Math.pow(1.618, this.progress);
                 const smoothSize = lastSq.size * growth;
                 
                 // Target: Keep visual size constant
                 this.targetScale = (minDim * 0.45) / smoothSize;
             }
             lerp = 0.1; // Faster response
        }

        this.cameraScale += (this.targetScale - this.cameraScale) * lerp;
        this.cameraX += (this.targetX - this.cameraX) * lerp;
        this.cameraY += (this.targetY - this.cameraY) * lerp;

        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.scale(this.cameraScale, this.cameraScale);
        ctx.translate(this.cameraX, this.cameraY);
        
        // Adaptive Line Width
        const baseLW = 2.0 / this.cameraScale;
        const arcLW = 2.5 / this.cameraScale;

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
