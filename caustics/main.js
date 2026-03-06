/**
 * LIGHT FLOW LAB: Standalone Core Logic
 * Custom: Free Source Movement
 */
import { Physics } from './physics.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';

const App = {
    STORAGE_KEY: 'caustics:state:v1',
    canvas: null,
    ctx: null,
    isInitialized: false, // Singleton guard
    container: null,
    lastPersistSnapshot: '',
    lastPersistAt: 0,
    lastUiUpdateAt: 0,
    
    // State
    shape: 'circle',
    rayNumber: 30,
    raySpeed: 20,
    sourcePos: { x: 0, y: -250 }, 
    sourceRotation: 0,
    isFlowing: false, 
    isLightVisible: false,
    showAxes: false,
    growth: 0,
    colorMode: 'rainbow',
    beamWidth: 1.6,
    spread: 1.2,
    flowOffset: 0,
    baseStyle: 'line',
    flowMode: 'none',
    useTrail: true,
    useTaper: true,
    useBloom: false,
    alphaIntensity: 1.0,
    isSimulationMode: false,
    preSimulationBounces: 10,
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

    getDefaultSourcePos() {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        return { x: 0, y: -size * 0.7 };
    },

    getShapeDefaults(shape) {
        const size = Math.min(this.canvas?.width || window.innerWidth, this.canvas?.height || window.innerHeight) * 0.35;
        const defaults = {
            sourcePos: { x: 0, y: -size * 0.7 },
            sourceRotation: 0
        };

        if (shape === 'ellipse') {
            defaults.sourcePos = { x: 0, y: -size * 0.3 };
            defaults.sourceRotation = 0;
        } else if (shape === 'cardioid') {
            defaults.sourcePos = { x: -size * 0.2, y: -size * 0.45 };
            defaults.sourceRotation = 0;
        } else if (shape === 'parabola') {
            defaults.sourcePos = { x: 0, y: -size * 1.5 };
            defaults.sourceRotation = 0;
        }

        return defaults;
    },

    applyShapeSwitchReset(nextShape) {
        // Reset only light playback state; keep shared sliders/settings unchanged.
        this.isFlowing = false;
        this.isLightVisible = false;
        this.growth = 0;
        this.flowOffset = 0;
        this.emitStartTime = null;

        // Reset only tab-specific values.
        const defaults = this.getShapeDefaults(nextShape);
        this.sourcePos = defaults.sourcePos;
        this.sourceRotation = defaults.sourceRotation;
        this.autoModes.revolution = false;
        this.autoModes.rotation = false;
    },

    buildPersistedState() {
        return {
            shape: this.shape,
            rayNumber: this.rayNumber,
            raySpeed: this.raySpeed,
            sourcePos: this.sourcePos,
            sourceRotation: this.sourceRotation,
            showAxes: this.showAxes,
            colorMode: this.colorMode,
            beamWidth: this.beamWidth,
            spread: this.spread,
            baseStyle: this.baseStyle,
            flowMode: this.flowMode,
            useTrail: this.useTrail,
            useTaper: this.useTaper,
            useBloom: this.useBloom,
            alphaIntensity: this.alphaIntensity,
            MAX_BOUNCES: this.MAX_BOUNCES
        };
    },

    persistState() {
        const snapshot = JSON.stringify(this.buildPersistedState());
        if (snapshot === this.lastPersistSnapshot) return;
        this.lastPersistSnapshot = snapshot;
        try {
            localStorage.setItem(this.STORAGE_KEY, snapshot);
        } catch (_) {
            // Ignore storage failures and continue rendering.
        }
    },

    restoreState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return false;
            const saved = JSON.parse(raw);
            if (!saved || typeof saved !== 'object') return false;

            this.shape = saved.shape ?? this.shape;
            this.rayNumber = saved.rayNumber ?? this.rayNumber;
            this.raySpeed = saved.raySpeed ?? this.raySpeed;
            if (saved.sourcePos && typeof saved.sourcePos.x === 'number' && typeof saved.sourcePos.y === 'number') {
                this.sourcePos = { x: saved.sourcePos.x, y: saved.sourcePos.y };
            }
            this.sourceRotation = saved.sourceRotation ?? this.sourceRotation;
            // Runtime playback state is intentionally not restored to avoid unintended re-emission.
            this.isFlowing = false;
            this.isLightVisible = false;
            this.showAxes = saved.showAxes ?? this.showAxes;
            this.growth = 0;
            this.colorMode = saved.colorMode ?? this.colorMode;
            this.beamWidth = saved.beamWidth ?? this.beamWidth;
            this.spread = saved.spread ?? this.spread;
            this.flowOffset = 0;
            this.baseStyle = saved.baseStyle ?? this.baseStyle;
            this.flowMode = saved.flowMode ?? this.flowMode;
            this.useTrail = saved.useTrail ?? this.useTrail;
            this.useTaper = saved.useTaper ?? this.useTaper;
            this.useBloom = saved.useBloom ?? this.useBloom;
            this.alphaIntensity = saved.alphaIntensity ?? this.alphaIntensity;
            this.isSimulationMode = false;
            this.MAX_BOUNCES = saved.MAX_BOUNCES ?? this.MAX_BOUNCES;

            this.lastPersistSnapshot = raw;
            return true;
        } catch (_) {
            return false;
        }
    },

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        this.canvas = document.getElementById('causticsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('container');
        this.hudElement = document.getElementById('hud-timer');

        this.resize();
        this.sourcePos = this.getDefaultSourcePos();
        this.restoreState();
        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === this.shape));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === this.colorMode));

        UI.setupEvents(this);
        this.startLoop();
        UI.update(this);
    },


    resize() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    },


    reset() {
        // this.shape = 'circle'; // Keep current shape
        this.rayNumber = 30;
        this.raySpeed = 20;
        const defaults = this.getShapeDefaults(this.shape);
        this.sourcePos = defaults.sourcePos;
        this.isFlowing = false;
        this.isLightVisible = false;
        this.showAxes = false;
        this.growth = 0;
        this.colorMode = 'rainbow';
        this.baseStyle = 'line';
        this.flowMode = 'none';
        this.useTrail = true;
        this.useTaper = true;
        this.useBloom = false;
        this.alphaIntensity = 1.0;
        this.isSimulationMode = false;
        this.preSimulationBounces = 10;
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
        this.sourceRotation = defaults.sourceRotation;

        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === this.shape));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === 'rainbow'));

        UI.update(this);
        this.persistState();
    },


    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            try {
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
                    this.spread = 0.1 + oscillate('spread', 0.15) * 4.9;
                }

                // Reflections
                if (this.autoModes.reflections) {
                    this.MAX_BOUNCES = Math.floor(1 + oscillate('reflections', 0.1) * 19);
                }

                // Safety guard for heavy simulation combinations.
                if (this.isSimulationMode) {
                    this.rayNumber = Math.min(this.rayNumber, 220);
                    this.MAX_BOUNCES = Math.min(this.MAX_BOUNCES, 12);
                }

                // UI update is relatively expensive; throttle during animation loop.
                if (now - this.lastUiUpdateAt > 80) {
                    UI.update(this);
                    this.lastUiUpdateAt = now;
                }
                
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
                if (now - this.lastPersistAt > 200) {
                    this.persistState();
                    this.lastPersistAt = now;
                }
            } catch (err) {
                // Keep animation loop alive even if one frame fails.
                console.error('Caustics loop error:', err);
            } finally {
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    },

};

document.addEventListener('DOMContentLoaded', () => App.init());
