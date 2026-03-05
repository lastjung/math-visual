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
    isInitialized: false, // Singleton guard
    container: null,
    
    // State
    shape: 'circle',
    rayNumber: 30,
    raySpeed: 20,
    sourcePos: { x: 0, y: -250 }, 
    sourceRotation: 0,
    isFlowing: true, 
    isLightVisible: true, // Default Light OFF on startup
    showAxes: false,
    growth: 0,
    colorMode: 'rainbow',
    beamWidth: 1.6,
    spread: 1.2,
    flowOffset: 0,
    baseStyle: 'line',
    flowMode: 'wave',
    useTrail: true,
    useTaper: true,
    useBloom: false,
    MAX_BOUNCES: 10, // 반사 최대 10번
    emitStartTime: null,

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `LAPSE: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    },
    
    autoModes: {
        revolution: false,
        rotation: false,
        density: false,
        speed: false,
        spread: false,
        reflections: false
    },
    autoPhases: {
        revolution: 0,
        rotation: 0,
        density: 0,
        speed: 0,
        spread: 0,
        reflections: 0
    },
    autoTimer: 0,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        this.canvas = document.getElementById('causticsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('container');
        this.hudElement = document.getElementById('hud-timer');

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
        this.raySpeed = 20;
        const size = Math.min(this.canvas.width, this.canvas.height) * 0.35;
        this.sourcePos = { x: 0, y: -size * 0.7 };
        this.isFlowing = false;
        this.isLightVisible = false;
        this.showAxes = false;
        this.growth = 0;
        this.colorMode = 'rainbow';
        this.baseStyle = 'line';
        this.flowMode = 'wave';
        this.useTrail = true;
        this.useTaper = true;
        this.useBloom = false;
        this.spread = 1.2;
        this.beamWidth = 1.6;
        this.MAX_BOUNCES = 10;
        this.emitStartTime = null;

        // Reset auto modes and phases
        this.autoModes = {
            revolution: false,
            rotation: false,
            density: false,
            speed: false,
            spread: false,
            reflections: false
        };
        this.autoPhases = {
            revolution: 0,
            rotation: 0,
            density: 0,
            speed: 0,
            spread: 0,
            reflections: 0
        };
        this.autoTimer = 0;
        this.sourceRotation = 0; // Ensure sourceRotation is reset

        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === 'circle'));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === 'rainbow'));

        UI.update(this);
    },


    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            // Use direct timestamp for immunity against duplicate loops
            this.autoTimer = now / 1000;
            const t = this.autoTimer;

            // Ping-pong Helper: Oscillation using stored phase
            const oscillate = (key, speed) => {
                const phase = this.autoPhases[key] || 0;
                return Math.sin(t * speed + phase) * 0.5 + 0.5;
            };

            // Revolution (Orbit)
            if (this.autoModes.revolution) {
                const angle = oscillate('revolution', 0.1) * Math.PI * 2 - Math.PI; 
                const dist = Math.sqrt(this.sourcePos.x**2 + this.sourcePos.y**2);
                this.sourcePos = {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist
                };
            }

            // Rotation (Spin)
            if (this.autoModes.rotation) {
                this.sourceRotation = oscillate('rotation', 0.15) * Math.PI * 2 - Math.PI;
            }

            // Density (Ray Number)
            if (this.autoModes.density) {
                this.rayNumber = Math.floor(20 + oscillate('density', 0.2) * 480);
            }

            // Speed
            if (this.autoModes.speed) {
                this.raySpeed = oscillate('speed', 0.1) * 100;
            }

            // Spread
            if (this.autoModes.spread) {
                this.spread = 0.1 + oscillate('spread', 0.3) * 4.9;
            }

            // Reflections
            if (this.autoModes.reflections) {
                this.MAX_BOUNCES = Math.floor(1 + oscillate('reflections', 0.1) * 19);
            }

            UI.update(this);
            
            if (this.isFlowing && this.isLightVisible) {
                // Use safeDt: prevent negative values and massive jumps (background sleep)
                const safeDt = Math.max(0, Math.min(dt, 0.1)); 
                this.growth += (this.raySpeed * 8) * safeDt; 
                
                // Cap growth at a safe level (diagonal of canvas * 5) to ensure stability
                const maxCap = Math.sqrt(this.canvas.width**2 + this.canvas.height**2) * 5;
                if (this.growth > maxCap) this.growth = maxCap;

                if (this.flowMode !== 'none') {
                    this.flowOffset = (this.flowOffset + this.raySpeed * 1.5 * safeDt) % 50;
                }
            }

            // HUD Update
            if (this.hudElement) {
                if (this.emitStartTime) {
                    const elapsed = (performance.now() - this.emitStartTime) / 1000;
                    this.hudElement.textContent = this.formatTime(elapsed);
                    this.hudElement.classList.add('visible');
                } else {
                    this.hudElement.classList.remove('visible');
                    this.hudElement.textContent = "00:00.00";
                }
            }
            Renderer.draw(this);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

};

document.addEventListener('DOMContentLoaded', () => App.init());
