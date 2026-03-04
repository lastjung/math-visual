/**
 * LIGHT FLOW LAB: Standalone Core Logic
 * Custom: Free Source Movement
 */
import { Physics } from './physics.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';

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
    showAxes: true,
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

        UI.setupEvents(this);
        this.resize();
        this.startLoop();
        UI.update(this);
    },


    resize() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
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
        this.showAxes = true;
        this.growth = 0;
        this.colorMode = 'cyan';
        this.spread = 1.2;

        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === 'circle'));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === 'cyan'));

        UI.update(this);
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
                UI.update(this);
            }
            
            if (this.isFlowing && this.isLightVisible) {
                this.flowOffset = (this.flowOffset + this.raySpeed * dt) % 50; // Match [30, 20] dash cycle
                this.growth += this.GROWTH_SPEED * dt;
            }
            Renderer.draw(this);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

};

document.addEventListener('DOMContentLoaded', () => App.init());
