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
    
    // Config State
    speed: 0.02,
    amplitude: 80,
    frequency: 0.03,
    musicTrack: 'assets/music/bgm/Math_01_Minimalist_Sine_Pulse.mp3',

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        // Legacy setupControls removed
        this.resize();
        // this.reset(); // Core calls reset on load if needed, or we can init defaults
    },
    
    // Universal UI Configuration
    get uiConfig() {
        return [
            {
                type: 'slider',
                id: 'speed',
                label: 'Speed',
                min: 0.01,
                max: 0.1,
                step: 0.005,
                value: this.speed,
                onChange: (val) => { this.speed = val; }
            },
            {
                type: 'slider',
                id: 'amplitude',
                label: 'Amplitude',
                min: 20,
                max: 150,
                step: 5,
                value: this.amplitude,
                onChange: (val) => { this.amplitude = val; }
            },
            {
                type: 'slider',
                id: 'frequency',
                label: 'Frequency',
                min: 0.01,
                max: 0.1,
                step: 0.005,
                value: this.frequency,
                onChange: (val) => { this.frequency = val; }
            }
        ];
    },

    reset() {
        this.angle = 0;
        this.points = [];
        // Optional: Reset config values if desired
        // this.speed = 0.02;
        // this.amplitude = 80;
        // this.frequency = 0.03;
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
        
        // Use internal state
        const speed = this.speed;
        const radius = this.amplitude;
        const freq = this.frequency; // Note: frequency variable seems unused in original draw logic or was implicit? 
        // Checking original code: "const freq = parseFloat(document.getElementById('frequency').value);" was defined but NOT USED in draw?
        // Wait, looking at original code:
        // const x = centerX + Math.cos(this.angle) * radius;
        // const y = centerY + Math.sin(this.angle) * radius;
        // It seems frequency might be related to 'speed' (angle increment) or it was just a dummy control?
        // Ah, typically frequency affects the wave period.
        // In the original code: "this.angle -= speed;" -> Speed controls frequency of oscillation.
        // The "Frequency" slider in original HTML might have been intended for something else or redundant.
        // However, I will keep it available in state. 
        // Actually, let's double check if I missed where freq is used.
        // Original code:
        // 73: const freq = parseFloat(document.getElementById('frequency').value);
        // ... (not used)
        // 123: this.angle -= speed;
        
        // It seems 'Frequency' slider was indeed not used in the drawing logic logic provided! 
        // But 'speed' controls how fast angle changes, which IS frequency in time domain.
        // Let's stick to the visual behavior of the original code which relied on 'speed' for rotation.
        
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
            // The spread of the wave depends on how fast we move 'i'. 
            // Original: const px = centerX + 150 + i * (canvas.width / this.maxPoints * 0.8);
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
