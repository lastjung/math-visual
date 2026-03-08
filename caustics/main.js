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
    lightSourceMode: 'point', // 'point' or 'parallel'
    parallelRange: { min: -100, max: 100 }, // Cached range for Parallel rays
    useTrail: true,
    useTaper: true,
    useBloom: false,
    alphaIntensity: 1.0,
    isPaintMode: false, // New: Don't clear canvas for layering effect
    isSimulationMode: false,
    isWindowFull: false,
    preSimulationBounces: 10,
    MAX_BOUNCES: 10, // 반사 최대 10번
    emitStartTime: null,
    overlayMessage: null,
    isSimRunning: false,
    simTimers: [], // Track simulation timeouts for cancellation

    // --- Audio System ---
    BGM_BASE_PATH: '../visualization/assets/music/bgm/',
    BGM_TRACKS: [
        'Math_01_Minimalist_Sine_Pulse.mp3', 'Math_02_Fractal_Recursive_Ambient.mp3',
        'Math_03_Euclidean_Polyrhythm.mp3', 'Math_04_Cybernetic_Grid_Logic.mp3',
        'Math_05_Infinite_Series_Flow.mp3', 'Math_06_Binary_Symphony.mp3',
        'Math_07_Quantum_Resonance.mp3', 'Math_08_Geometric_Vector_Motion.mp3',
        'Math_09_Fibonacci_Golden_Ratio.mp3', 'Math_10_Bitwise_Glitch_Architecture.mp3',
        'Math_11_Calculus_Flow.mp3', 'Math_12_Neural_Network_Synapse.mp3',
        'Math_13_Retro_8-bit_Math.mp3', 'Math_14_Primality_Test_Beat.mp3',
        'Math_15_Deep_Space_Topology.mp3', 'Math_16_Coordinate_Plane_Ambient.mp3',
        'Math_17_Mathematical_Induction.mp3', 'Math_18_Lo-fi_Coding_Marathon.mp3',
        'Math_19_Abstract_Set_Theory.mp3', 'Math_20_Theorem_Q.E.D..mp3',
        'piano-shorts/Piano_Short_01_Nocturne_Full_HQ.mp3', 'piano-shorts/Piano_Short_02_Moonlight_Full_HQ.mp3',
        'piano-shorts/Piano_Short_03_Claire_Full_HQ.mp3', 'piano-shorts/Piano_Short_04_Liebestraum_Full_HQ.mp3',
        'piano-shorts/Piano_Short_05_Gymnopedie_Full_HQ.mp3', 'piano-shorts/Piano_Short_06_Classical_Sonata_Full_HQ.mp3',
        'piano-shorts/Piano_Short_07_Rach_Grand_Full_HQ.mp3', 'piano-shorts/Piano_Short_08_River_Flows_Full_HQ.mp3',
        'piano-shorts/Piano_Short_09_Hisaishi_Fantasy_Full_HQ.mp3', 'piano-shorts/Piano_Short_10_Jazz_Mood_Full_HQ.mp3',
        'piano-shorts/Piano_Short_11_Ragtime_Fun_Full_HQ.mp3', 'piano-shorts/Piano_Short_12_Minimal_Cycle_Full_HQ.mp3',
        'piano-shorts/Piano_Short_13_Cinematic_Tear_Full_HQ.mp3', 'piano-shorts/Piano_Short_14_Pop_Vibe_Full_HQ.mp3',
        'piano-shorts/Piano_Short_15_Mystery_Night_Full_HQ.mp3', 'piano-shorts/Piano_Short_16_Morning_Dew_Full_HQ.mp3',
        'piano-shorts/Piano_Short_17_Rainy_Window_Full_HQ.mp3', 'piano-shorts/Piano_Short_18_Soulful_Touch_Full_HQ.mp3',
        'piano-shorts/Piano_Short_19_Wedding_Grace_Full_HQ.mp3', 'piano-shorts/Piano_Short_20_Grand_Power_Full_HQ.mp3'
    ],
    currentTrackName: '',

    initAudio() {
        if (!window.audioManager) return;
        
        // Auto-play next track when current ends
        window.audioManager.audio.onended = () => this.nextBGM();
        
        // Initial random track
        this.nextBGM(false); 
    },

    nextBGM(autoPlay = true) {
        if (!window.audioManager) return;
        const pool = this.BGM_TRACKS;
        const randomTrack = pool[Math.floor(Math.random() * pool.length)];
        this.currentTrackName = randomTrack.split('/').pop().replace('.mp3', '').replace(/_/g, ' ');
        
        const url = this.BGM_BASE_PATH + randomTrack;
        if (autoPlay) {
            window.audioManager.play(url, { forceSwitch: true });
        } else {
            window.audioManager.currentTrack = url;
            window.audioManager.audio.src = url;
        }
    },

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
    elapsedTime: 0,
    simSpeedMultiplier: 1.0, 

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
            lightSourceMode: this.lightSourceMode,
            useTrail: this.useTrail,
            useTaper: this.useTaper,
            useBloom: this.useBloom,
            alphaIntensity: this.alphaIntensity,
            isPaintMode: this.isPaintMode,
            MAX_BOUNCES: this.MAX_BOUNCES,
            parallelRange: this.parallelRange
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
            this.lightSourceMode = saved.lightSourceMode ?? 'point';
            this.useTrail = saved.useTrail ?? this.useTrail;
            this.useTaper = saved.useTaper ?? this.useTaper;
            this.useBloom = saved.useBloom ?? this.useBloom;
            this.alphaIntensity = saved.alphaIntensity ?? this.alphaIntensity;
            this.isPaintMode = saved.isPaintMode ?? false;
            this.parallelRange = saved.parallelRange ?? { min: -100, max: 100 };
            
            this.recalcParallelRange(); // Ensure range is valid for current sourcePos.y
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
        this.speedElement = document.getElementById('hud-speed');

        this.resize();
        this.sourcePos = this.getDefaultSourcePos();
        this.restoreState();

        // 1. Sync Parallel Range immediately after restore/positioning
        this.recalcParallelRange();

        // 2. UI and Event Setup
        document.querySelectorAll('.shape-tab').forEach(b => b.classList.toggle('active', b.dataset.shape === this.shape));
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === this.colorMode));

        UI.setupEvents(this);
        this.startLoop();
        
        // 3. Audio Initialization
        this.initAudio();

        UI.update(this);
    },


    resize() {
        if (!this.container) return;
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    },


    resetRays(shouldStop = true) {
        this.stopSimulation(); // ALWAYS stop any ongoing simulation on reset
        this.growth = 0;
        if (shouldStop) {
            this.isFlowing = false;
            // if (window.audioManager) window.audioManager.stop(); // Keep music playing as requested before
        }
        this.isLightVisible = true;
        this.emitStartTime = performance.now();
        this.elapsedTime = 0; 
        
        // Manual Clear: Even in Paint Mode, the Reset button should clear the canvas
        if (this.ctx) {
            this.ctx.fillStyle = '#050508';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            Renderer.clearPaint(); // Clear the hidden paint buffer too
        }

        UI.update(this);
    },

    stopSimulation() {
        if (!this.isSimRunning && !this.overlayMessage) return;
        
        // Clear all pending timeouts
        this.simTimers.forEach(t => clearTimeout(t));
        this.simTimers = [];
        
        this.isSimRunning = false;
        this.overlayMessage = null;
        
        // Return to normal interactive state
        this.isLightVisible = true;
        this.isFlowing = false;
        
        UI.update(this);
    },

    toggleFlow() {
        this.isFlowing = !this.isFlowing;
        if (this.isFlowing) {
            this.isLightVisible = true;
            if (!this.emitStartTime) {
                this.emitStartTime = performance.now();
            }
            if (window.audioManager) {
                if (!window.audioManager.currentTrack) {
                    this.nextBGM(true);
                } else {
                    window.audioManager.resume();
                }
            }
        } else {
            if (window.audioManager) {
                window.audioManager.isMuted = false;
                window.audioManager.resume();
            }
            if (window.audioManager) window.audioManager.stop();
        }
        UI.update(this);
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
        // this.lightSourceMode = 'point'; // Exempt from reset
        this.useTrail = true;
        this.useTaper = true;
        this.useBloom = false;
        this.alphaIntensity = 1.0;
        this.isPaintMode = false;
        this.isSimulationMode = false;
        this.preSimulationBounces = 10;
        this.spread = 1.2;
        this.beamWidth = 1.6;
        this.MAX_BOUNCES = 10;
        this.emitStartTime = null;

        if (window.audioManager) window.audioManager.stop();

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
        this.recalcParallelRange();
    },

    /**
     * Calculate the valid X-range for parallel rays at the current sourcePos.y
     * Following user optimization: calculated once per state change.
     */
    recalcParallelRange() {
        if (!this.canvas) return;
        const sizeMult = this.isWindowFull ? 0.45 : 0.35;
        const size = Math.min(this.canvas.width, this.canvas.height) * sizeMult;
        const y = this.sourcePos.y;
        
        let minX = 0, maxX = 0;
        let foundAny = false;

        // Scan from center outwards
        const scanStep = 5; 
        const scanLimit = size * 2;

        // Scan Right
        for (let x = 0; x < scanLimit; x += scanStep) {
            if (Physics.isInside(x, y, this.shape, size)) {
                maxX = x;
                foundAny = true;
            } else if (foundAny) break;
        }
        
        // Scan Left
        let foundLeft = false;
        for (let x = 0; x > -scanLimit; x -= scanStep) {
            if (Physics.isInside(x, y, this.shape, size)) {
                minX = x;
                foundLeft = true;
            } else if (foundLeft) break;
        }

        // Apply a small "inner" margin (95% of width) per user request
        const margin = 0.95;
        this.parallelRange = {
            min: minX * margin,
            max: maxX * margin
        };
    },

    "4_ray_mum_simm"() {
        if (this.isSimRunning) return; // Prevent multiple runs
        this.stopSimulation(); // Clear any residue
        this.isSimRunning = true;

        // Step 1: Handle Audio Auto-Start
        if (window.audioManager && window.audioManager.targetVolume > 0) {
            window.audioManager.isMuted = false;
            window.audioManager.resume();
        }

        const stages = [30, 100, 200, 350];
        let currentIdx = 0;

        const runStage = () => {
            if (currentIdx >= stages.length) {
                // FINAL END SEQUENCE - NO CLEARING, SHOW OVER PATTERN
                this.overlayMessage = "Simulation End";
                UI.update(this);
                const endTimer = setTimeout(() => {
                    this.overlayMessage = null;
                    this.isSimRunning = false;
                    this.isLightVisible = false;
                    this.isFlowing = false;
                    UI.update(this);
                }, 4000);
                this.simTimers.push(endTimer);
                return;
            }

            const val = stages[currentIdx];
            
            // A. KILL & CLEAR
            this.isLightVisible = false;
            this.isFlowing = false;
            if (this.ctx) {
                this.ctx.fillStyle = '#050508';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                Renderer.clearPaint();
            }

            // SET MESSAGE (NEW MULTI-LINE FOR FIRST STEP)
            if (currentIdx === 0) {
                this.overlayMessage = ["Begin the Journey of Light", "30 Rays"];
            } else {
                this.overlayMessage = `${val} Rays`;
            }
            UI.update(this);

            // B. SHOW TEXT
            const textTime = (currentIdx === 0) ? 3000 : 2000;
            const textTimer = setTimeout(() => {
                // C. CLEAR & START SIM
                if (this.ctx) {
                    this.ctx.fillStyle = '#050508';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    Renderer.clearPaint();
                }
                this.overlayMessage = null;
                this.rayNumber = val;
                this.growth = 0;
                this.isLightVisible = true;
                this.isFlowing = true;
                UI.update(this);

                // D. WAIT FOR SIM DURATION
                const simTime = (val === 350) ? 15000 : 12000;
                const simTimer = setTimeout(() => {
                    currentIdx++;
                    runStage();
                }, simTime);
                this.simTimers.push(simTimer);
            }, textTime);
            this.simTimers.push(textTimer);
        };

        runStage();
    },


    startLoop() {
        let lastTime = performance.now();
        const loop = (now) => {
            try {
                const dt = (now - lastTime) / 1000;
                lastTime = now;

                // Incremental autoTimer for seamless speed multiplier changes
                const safeDt = Math.max(0, Math.min(dt, 0.1)); 
                this.autoTimer += safeDt * this.simSpeedMultiplier;
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

                // Speed (Ensure minimum 10 during auto-animation)
                if (this.autoModes.speed) {
                    this.raySpeed = 10 + oscillate('speed', 0.1) * 90;
                }

                // Spread
                if (this.autoModes.spread) {
                    this.spread = 0.1 + oscillate('spread', 0.15) * 6.18;
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
                    this.growth += (this.raySpeed * 10) * safeDt; // Increased from 8 to 10 for better flow                    
                    // Cap growth at a safe level (diagonal of canvas * 5) to ensure stability
                    const maxCap = Math.sqrt(this.canvas.width**2 + this.canvas.height**2) * 5;
                    if (this.growth > maxCap) this.growth = maxCap;

                    if (this.flowMode !== 'none') {
                        this.flowOffset = (this.flowOffset + this.raySpeed * 1.5 * safeDt) % 50;
                    }
                }

                // HUD & Timer Update
                if (this.hudElement) {
                    if (this.isFlowing) {
                        const safeDt = Math.max(0, Math.min(dt, 0.1)); 
                        this.elapsedTime += safeDt;
                    }

                    if (this.isLightVisible) {
                        this.hudElement.textContent = `TIME  ${this.formatTime(this.elapsedTime)}`;
                        this.hudElement.classList.add('visible');
                        
                        if (this.speedElement) {
                            this.speedElement.textContent = `SPEED ${this.simSpeedMultiplier.toFixed(2)}x`;
                            this.speedElement.classList.add('visible');
                        }
                    } else {
                        this.hudElement.classList.remove('visible');
                        if (this.speedElement) this.speedElement.classList.remove('visible');
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
