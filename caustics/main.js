/**
 * LIGHT FLOW LAB: Standalone Core Logic
 * Custom: Free Source Movement
 */
const App = {
    canvas: null,
    ctx: null,
    container: null,
    
    // State
    shape: 'circle',
    rayNumber: 232,
    raySpeed: 30,
    sourcePos: { x: 0, y: -250 }, // Initial position relative to center
    isAnimating: false,
    isFlowing: true,
    isLightVisible: true,
    growth: 0,
    GROWTH_SPEED: 600, // Pixels per second
    colorMode: 'cyan',
    beamWidth: 1.5,
    spread: 1.2,
    flowOffset: 0,
    MAX_BOUNCES: 4,

    init() {
        this.canvas = document.getElementById('causticsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('container');

        // Initialize sourcePos based on canvas size
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        this.sourcePos = { x: 0, y: -size * 0.95 };

        this.setupEvents();
        this.resize();
        this.startLoop();
        this.updateUI();
    },

    setupEvents() {
        window.addEventListener('resize', () => this.resize());

        // Shape Tabs
        document.querySelectorAll('.shape-tab').forEach(btn => {
            btn.onclick = (e) => {
                this.shape = e.target.dataset.shape;
                document.querySelectorAll('.shape-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            };
        });

        // Color Mode Tabs
        document.querySelectorAll('.mode-tab').forEach(btn => {
            btn.onclick = (e) => {
                this.colorMode = e.target.dataset.mode;
                document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            };
        });

        // Animation Toggle
        const btnAnimate = document.getElementById('btn-animate');
        btnAnimate.onclick = () => {
            this.isAnimating = !this.isAnimating;
            this.updateUI();
        };

        // Sliders
        const rangeSource = document.getElementById('range-source');
        rangeSource.oninput = (e) => {
            const angle = parseFloat(e.target.value);
            const size = Math.min(this.canvas.width, this.canvas.height) * 0.35;
            this.sourcePos = {
                x: Math.cos(angle) * size * 0.95,
                y: Math.sin(angle) * size * 0.95
            };
            this.isAnimating = false;
            this.updateUI();
        };

        const rangeDensity = document.getElementById('range-density');
        rangeDensity.oninput = (e) => {
            this.rayNumber = parseInt(e.target.value);
            this.updateUI();
        };

        const rangeSpeed = document.getElementById('range-speed');
        rangeSpeed.oninput = (e) => {
            this.raySpeed = parseInt(e.target.value);
            this.updateUI();
        };

        const rangeSpread = document.getElementById('range-spread');
        rangeSpread.oninput = (e) => {
            this.spread = parseFloat(e.target.value);
            this.updateUI();
        };

        // Reset
        document.getElementById('btn-reset').onclick = () => this.reset();

        // Flow (Play/Hold) Toggle
        const btnPlay = document.getElementById('btn-play');
        btnPlay.onclick = () => {
            this.isFlowing = !this.isFlowing;
            this.updateUI();
        };

        // Emit (Light Reset)
        const btnEmit = document.getElementById('btn-light');
        btnEmit.onclick = () => {
            this.isLightVisible = true;
            this.growth = 0; // Restart propagation
            this.updateUI();
        };

        // Canvas / Container Mouse Events
        let isDragging = false;

        const handleInteraction = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (clientX === undefined) return;

            const x = clientX - rect.left - rect.width/2;
            const y = clientY - rect.top - rect.height/2;

            if (e.type === 'mousedown' || e.type === 'touchstart') {
                const dist = Math.sqrt((x - this.sourcePos.x)**2 + (y - this.sourcePos.y)**2);
                if (dist < 50) { // Larger hit area
                    isDragging = true;
                    this.isAnimating = false;
                    if (e.cancelable) e.preventDefault();
                }
            }

            if (isDragging) {
                this.sourcePos = { x, y };
                this.updateUI();
            }
        };

        const stopDragging = () => {
            isDragging = false;
        };

        this.canvas.addEventListener('mousedown', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mouseup', stopDragging);

        this.canvas.addEventListener('touchstart', handleInteraction, { passive: false });
        window.addEventListener('touchmove', handleInteraction, { passive: false });
        window.addEventListener('touchend', stopDragging);
    },

    resize() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    },

    updateUI() {
        const btnAnimate = document.getElementById('btn-animate');
        const icon = document.getElementById('animate-icon');
        const text = document.getElementById('animate-text');
        
        btnAnimate.classList.toggle('active', this.isAnimating);
        icon.innerHTML = this.isAnimating 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        text.textContent = this.isAnimating ? 'Auto Spin' : 'Manual';

        // Update the slider to reflect the current angle relative to center
        const angle = Math.atan2(this.sourcePos.y, this.sourcePos.x);
        document.getElementById('range-source').value = angle;
        document.getElementById('val-source').textContent = `${(angle * 180 / Math.PI).toFixed(0)}°`;
        
        document.getElementById('range-density').value = this.rayNumber;
        document.getElementById('val-density').textContent = this.rayNumber;

        document.getElementById('range-speed').value = this.raySpeed;
        document.getElementById('val-speed').textContent = this.raySpeed;

        document.getElementById('val-spread').textContent = `${(this.spread * 180 / Math.PI).toFixed(0)}°`;

        // Play/Hold Button
        const btnPlay = document.getElementById('btn-play');
        const playIcon = document.getElementById('play-icon');
        const playText = document.getElementById('play-text');
        this.isFlowing = this.isFlowing; // Keep state
        playIcon.innerHTML = this.isFlowing 
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        playText.textContent = this.isFlowing ? 'Hold' : 'Play';

        // Emit Button (Middle)
        const btnEmit = document.getElementById('btn-light');
        document.getElementById('light-text').textContent = 'Emit';
    },

    reset() {
        this.shape = 'circle';
        this.rayNumber = 150;
        this.raySpeed = 30;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.35;
        this.sourcePos = { x: 0, y: -size * 0.95 };
        this.isAnimating = false;
        this.isFlowing = true;
        this.isLightVisible = true;
        this.growth = 0;
        this.colorMode = 'cyan';
        this.spread = 1.2;

        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === 'circle'));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === 'cyan'));

        this.updateUI();
    },

    // --- Physics Engine ---
    getShapePoint(rad, type, size) {
        switch(type) {
            case 'circle': return { x: Math.cos(rad) * size, y: Math.sin(rad) * size };
            case 'ellipse': return { x: Math.cos(rad) * size, y: Math.sin(rad) * size * 0.6 };
            case 'cardioid': 
                const r = size * (1 - Math.cos(rad)) * 0.5;
                return { x: r * Math.cos(rad) + size*0.3, y: r * Math.sin(rad) };
            case 'parabola':
                const px = (rad / Math.PI - 0.5) * 4; 
                return { x: px * size * 0.5, y: (px * px - 1) * size * 0.5 };
            default: return { x: Math.cos(rad) * size, y: Math.sin(rad) * size };
        }
    },

    getNormal(x, y, type, size) {
        let nx, ny;
        if (type === 'circle') { nx = -x; ny = -y; }
        else if (type === 'ellipse') { nx = -x; ny = -y / (0.6 * 0.6); }
        else if (type === 'parabola') { nx = -2 * (x / (size * 0.5)); ny = 1; }
        else { nx = -x; ny = -y; } 
        
        const len = Math.sqrt(nx * nx + ny * ny);
        return { x: nx / len, y: ny / len };
    },

    findBoundaryIntersection(sx, sy, angle, type, size) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        let low = 1, high = size * 4;
        let bestDist = null;

        for(let i=0; i<30; i++) { // More precision for free movement
            let mid = (low + high) / 2;
            let px = sx + dx * mid;
            let py = sy + dy * mid;
            
            let inside = false;
            if (type === 'circle') inside = (px*px + py*py) < size*size;
            else if (type === 'ellipse') inside = (px*px)/(size*size) + (py*py)/(size*size*0.36) < 1;
            else if (type === 'parabola') inside = py > (Math.pow(px/(size*0.5), 2) - 1) * size * 0.5;
            else if (type === 'cardioid') {
                const cx = px - size*0.3;
                const r = Math.sqrt(cx*cx + py*py);
                const theta = Math.atan2(py, cx);
                inside = r < size * (1 - Math.cos(theta)) * 0.5;
            }

            if (inside) { low = mid; } 
            else { high = mid; bestDist = mid; }
        }
        return bestDist ? { x: sx + dx * bestDist, y: sy + dy * bestDist } : null;
    },

    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            if (this.isAnimating) {
                // Orbiting logic for Auto Spin
                const angle = Math.atan2(this.sourcePos.y, this.sourcePos.x);
                const dist = Math.sqrt(this.sourcePos.x**2 + this.sourcePos.y**2);
                const newAngle = angle + 0.3 * dt;
                this.sourcePos = {
                    x: Math.cos(newAngle) * dist,
                    y: Math.sin(newAngle) * dist
                };
                this.updateUI();
            }
            
            if (this.isFlowing && this.isLightVisible) {
                this.flowOffset = (this.flowOffset + this.raySpeed * dt) % 50; // Match [30, 20] dash cycle
                this.growth += this.GROWTH_SPEED * dt;
            }
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const size = Math.min(w, h) * 0.35;

        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, w, h);

        // Boundary Guide
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i <= 360; i++) {
            const rad = (i * Math.PI) / 180;
            let p = this.getShapePoint(rad, this.shape, size);
            if (i === 0) ctx.moveTo(centerX + p.x, centerY + p.y);
            else ctx.lineTo(centerX + p.x, centerY + p.y);
        }
        ctx.stroke();

        // Rays Emission Direction (Points towards center)
        const aimAngle = Math.atan2(-this.sourcePos.y, -this.sourcePos.x);

        if (!this.isLightVisible) return;

        for (let i = 0; i < this.rayNumber; i++) {
            const t = i / Math.max(1, this.rayNumber - 1);
            let startPos, angle;
            
            if (this.shape === 'parabola') {
                const xOffset = (t - 0.5) * size * 1.8;
                startPos = { x: xOffset, y: -size * 1.2 };
                // Parabola still uses Auto Spin for swing
                const swing = Math.atan2(this.sourcePos.y, this.sourcePos.x);
                angle = Math.PI / 2 + Math.sin(swing) * 0.3;
            } else {
                startPos = { x: this.sourcePos.x, y: this.sourcePos.y };
                angle = aimAngle + (t - 0.5) * this.spread;
            }

            let currX = centerX + startPos.x;
            let currY = centerY + startPos.y;
            let currAngle = angle;

            if (i === 0) {
                ctx.save();
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#06b6d2';
                ctx.beginPath();
                ctx.arc(currX, currY, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            let baseHue;
            if (this.colorMode === 'cyan') baseHue = 185;
            else if (this.colorMode === 'rainbow') baseHue = t * 360;
            else baseHue = 20 + t * 40;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.setLineDash([30, 20]);
            ctx.lineDashOffset = -this.flowOffset;
            ctx.lineCap = 'round';
            ctx.lineWidth = this.beamWidth;
            
            let accumulatedDist = 0;

            for (let b = 0; b < this.MAX_BOUNCES; b++) {
                const hit = this.findBoundaryIntersection(currX - centerX, currY - centerY, currAngle, this.shape, size);
                if (!hit) break;

                const nextX = centerX + hit.x;
                const nextY = centerY + hit.y;
                
                const segmentDist = Math.sqrt((nextX - currX)**2 + (nextY - currY)**2);
                
                // Propagation logic
                if (accumulatedDist > this.growth) break;
                
                let drawX = nextX;
                let drawY = nextY;
                let isLastSegment = false;

                if (accumulatedDist + segmentDist > this.growth) {
                    const ratio = (this.growth - accumulatedDist) / segmentDist;
                    drawX = currX + (nextX - currX) * ratio;
                    drawY = currY + (nextY - currY) * ratio;
                    isLastSegment = true;
                }

                const alpha = Math.max(0.02, (25 / this.rayNumber) * (1 - b/this.MAX_BOUNCES));
                ctx.strokeStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;
                
                ctx.beginPath();
                ctx.moveTo(currX, currY);
                ctx.lineTo(drawX, drawY);
                ctx.stroke();

                if (isLastSegment) break;

                accumulatedDist += segmentDist;

                const normal = this.getNormal(hit.x, hit.y, this.shape, size);
                const incoming = { x: Math.cos(currAngle), y: Math.sin(currAngle) };
                const dot = incoming.x * normal.x + incoming.y * normal.y;
                const reflectX = incoming.x - 2 * dot * normal.x;
                const reflectY = incoming.y - 2 * dot * normal.y;
                
                currAngle = Math.atan2(reflectY, reflectX);
                currX = nextX;
                currY = nextY;
            }
            ctx.restore();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
