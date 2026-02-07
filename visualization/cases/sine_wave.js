/**
 * Sine Wave Visualization Module
 */

const SineWaveCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    angle: 0,
    points: [],
    maxPoints: 500,

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupControls();
        this.resize();
    },

    setupControls() {
        const controls = document.querySelector('.controls');
        controls.innerHTML = `
            <div class="control-group">
                <label for="speed">회전 속도 (Speed)</label>
                <input type="range" id="speed" min="0.01" max="0.1" step="0.005" value="0.02">
            </div>
            <div class="control-group">
                <label for="amplitude">진폭 (Amplitude)</label>
                <input type="range" id="amplitude" min="20" max="150" step="5" value="80">
            </div>
            <div class="control-group">
                <label for="frequency">주파수 (Frequency)</label>
                <input type="range" id="frequency" min="0.01" max="0.1" step="0.005" value="0.03">
            </div>
            <button class="btn-primary" id="toggleRecording">Recording Mode ON</button>
            <button class="btn-secondary" id="resetBtn">Reset View</button>
        `;
        // Re-bind recording listener via Core if needed, but Core handles the global buttons
        // Logic for reset
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.angle = 0;
            this.points = [];
        });
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    },

    start() {
        if (this.animationId) return;
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

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const speed = parseFloat(document.getElementById('speed').value);
        const radius = parseFloat(document.getElementById('amplitude').value);
        const freq = parseFloat(document.getElementById('frequency').value);

        const centerX = canvas.width / 4;
        const centerY = canvas.height / 2;

        // Axis
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();

        const x = centerX + Math.cos(this.angle) * radius;
        const y = centerY + Math.sin(this.angle) * radius;

        // Reference Circle
        ctx.strokeStyle = '#27455C';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Point & Line
        ctx.fillStyle = '#29CC57';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#29CC57';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Wave
        this.points.unshift(y);
        if (this.points.length > this.maxPoints) this.points.pop();

        ctx.strokeStyle = '#29CC57';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i < this.points.length; i++) {
            const px = centerX + 150 + i * (canvas.width / this.maxPoints * 0.8);
            const py = this.points[i];
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        this.angle -= speed;
    },

    destroy() {
        this.stop();
        this.points = [];
    }
};
