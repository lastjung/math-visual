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
    rayNumber: 30,
    raySpeed: 20,
    sourcePos: { x: 0, y: -250 }, 
    isAnimating: false,
    isFlowing: true,
    isLightVisible: true,
    showAxes: false,
    growth: 0,
    colorMode: 'rainbow',
    beamWidth: 1.6,
    spread: 1.2,
    flowOffset: 0,
    baseStyle: 'line',
    flowMode: 'interval',
    useTrail: false,
    useTaper: true,
    useBloom: false,
    MAX_BOUNCES: 4, // 반사 최대 4번

    init() {
        this.canvas = document.getElementById('causticsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('container');

        // Initialize sourcePos based on canvas size
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        this.sourcePos = { x: 0, y: -size * 0.7 }; // Move source inside the circle (top)

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
        this.rayNumber = 30;
        this.raySpeed = 40;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.35;
        this.sourcePos = { x: 0, y: -size * 0.7 };
        this.isAnimating = false;
        this.isFlowing = true;
        this.isLightVisible = true;
        this.showAxes = false;
        this.growth = 0;
        this.colorMode = 'rainbow';
        this.baseStyle = 'line';
        this.flowMode = 'interval';
        this.useTrail = false;
        this.useTaper = true;
        this.useBloom = false;
        this.spread = 1.2;
        this.beamWidth = 1.6;

        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === 'circle'));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === 'rainbow'));

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
                // Propagation is always linked to speed
                this.growth += (this.raySpeed * 25) * dt; 

                // Only update flow offset if flow is not None
                if (this.flowMode !== 'none') {
                    this.flowOffset = (this.flowOffset + this.raySpeed * 1.5 * dt) % 50;
                }
            }
            Renderer.draw(this);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

};

document.addEventListener('DOMContentLoaded', () => App.init());
