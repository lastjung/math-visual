/**
 * LIGHT FLOW LAB: Standalone Core Logic
 * Custom: Free Source Movement
 */
import { Renderer } from './render/renderer.js';
import { UI } from './ui.js';
import { Simulator } from './sim/simulator.js';
import { LightDensity } from './render/light-density.js';
import { BGM_BASE_PATH, BGM_TRACKS, formatTime, initAudio, nextBGM } from './core/audio-controller.js';
import {
    getDefaultSourcePos,
    getShapeLayoutCenter,
    getShapeDefaults,
    getTriangleVertices
} from './core/shape-config.js';
import { getTriangleBaseOrigins, getTriangleSourceOrigins } from './core/pattern-layout.js';
import { getTriangleLaunchAngle } from './core/direction-resolver.js';
import { buildLaunchRayConfigs, normalizeLightSourceMode, recalcParallelRange } from './core/source-mode-resolver.js';
import { buildPersistedState, persistState, restoreState } from './core/persistence.js';
import { readCurrentScene, applyScene, applyPattern, applySourceOption, updateOption, updateSlider, updatePointer } from './core/state-mapper.js';
import { SHAPE_REGISTRY } from './config/shape-registry.js';
import { GLOBAL_DEFAULTS } from './config/app-defaults.js';



import {
    clearScene,
    finishSimulation,
    runBeamSpreadSimulation,
    runRayCountSimulation,
    runRectA0Simulation,
    runUniversalJourneySimulation,
    runVOvalA0Simulation,
    runEllipseA0Simulation,
    runVvOvalFocusSimulation,
    runTriangleA0Simulation,
    startA0Simulation,
    startNarrativeSimulation,
    stopSimulation
} from './core/simulation-runner.js';
window.LightDensityModule = LightDensity; // Fix visibility

const App = {
    STORAGE_KEY: 'caustics:state:v2',
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
    sourceAnchorPos: { x: 0, y: 0 },
    sourceRotation: 0,
    isFlowing: false, 
    isLightVisible: false,
    showAxes: false,
    growth: 0,
    colorMode: 'rainbow',
    beamWidth: 1.6,
    spread: Math.PI / 3,
    flowOffset: 0,
    baseStyle: 'line',
    flowMode: 'none',
    lightSourceMode: 'point', // 'point' or 'parallel'
    sourcePattern: 'single',
    sourceOption: 'basic',
    sourceDirection: 'down',
    colorDistribution: 'frequency',
    trianglePointCount: 5,
    triangleVertexBias: 0.6,
    triangleSourceOffsets: [],
    parallelRange: { min: -100, max: 100 }, // Cached range for Parallel rays
    useTrail: true,
    useTaper: false,
    useBloom: false,
    alphaIntensity: 1.0,
    isPaintMode: false, 
    isPaint2Mode: false, 
    isLightMode: true,  
    renderMode: 'light',
    isSimulationMode: false,
    isWindowFull: false,
    MAX_BOUNCES: 10, // 반사 효과 켬 (기본 10회)
    currentNarrative: 'none',
    emitStartTime: null,
    overlayMessage: null,
    isSimRunning: false,
    simTimers: [], // Track simulation timeouts for cancellation

    // --- Audio System ---
    BGM_BASE_PATH,
    BGM_TRACKS,
    currentTrackName: '',

    initAudio() {
        return initAudio(this);
    },

    nextBGM(autoPlay = true, manualSequential = false) {
        return nextBGM(this, autoPlay, manualSequential);
    },

    formatTime(seconds) {
        return formatTime(seconds);
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
    musicVisTimer: 0, // Separate timer for visualizer animation
    simSpeedMultiplier: 1.0, 

    getDefaultSourcePos() {
        return getDefaultSourcePos(this);
    },

    getShapeDefaults(shape) {
        return getShapeDefaults(this, shape);
    },

    getShapeLayoutCenter(shape = this.shape) {
        return getShapeLayoutCenter(shape, this.getShapeSize());
    },

    getTriangleVertices(size) {
        return getTriangleVertices(size);
    },

    getTriangleBaseOrigins(size) {
        return getTriangleBaseOrigins(this, size);
    },

    getTriangleSourceOrigins(size) {
        return getTriangleSourceOrigins(this, size);
    },

    getTriangleLaunchAngle(origin, size, localT = 0.5) {
        return getTriangleLaunchAngle(this, origin, size, localT);
    },

    resetTriangleSourceOffsets() {
        this.triangleSourceOffsets = [];
    },

    getActiveSourceAnchor() {
        if (this.sourcePattern === 'single') return { ...this.sourcePos };
        return { ...this.sourceAnchorPos };
    },

    getLaunchHue(config, flowOffset = this.flowOffset) {
        const groupCount = Math.max(1, config.groupCount || 1);
        const isMultiPoint = groupCount > 1;
        let distributionT = config.t;

        if (this.colorDistribution === 'uniform' && isMultiPoint) {
            distributionT = (config.groupIndex % groupCount) / groupCount;
        } else if (this.colorDistribution === 'source-rainbow') {
            distributionT = config.localCount <= 1
                ? 0.5
                : config.localIndex / (config.localCount - 1);
        }

        const interpolate = (t, stops) => {
            const idx = t * (stops.length - 1);
            const low = Math.floor(idx);
            const high = Math.ceil(idx);
            const f = idx - low;
            let h1 = stops[low];
            let h2 = stops[high];
            if (h2 > h1 + 180) h1 += 360;
            if (h1 > h2 + 180) h2 += 360;
            return (h1 + (h2 - h1) * f + flowOffset * 0.5) % 360;
        };

        if (this.colorMode === 'rainbow') {
            return (distributionT * 360 + flowOffset * 0.5) % 360;
        }
        if (this.colorMode === 'cyan') {
            return 180 + Math.sin(distributionT * 5 + flowOffset * 0.1) * 20;
        }
        if (this.colorMode === 'sunset') {
            return 10 + Math.sin(distributionT * 3 + flowOffset * 0.1) * 30;
        }
        if (this.colorMode === 'twilight') {
            return interpolate(distributionT, [55, 30, 330, 270, 250]);
        }
        if (this.colorMode === 'cosmic') {
            return interpolate(distributionT, [180, 220, 280, 320]);
        }
        if (this.colorMode === 'amber') {
            return interpolate(distributionT, [24, 34, 44, 56]);
        }
        if (this.colorMode === 'lime') {
            return interpolate(distributionT, [85, 145, 195, 235]);
        }
        if (this.colorMode === 'aurora') {
            return interpolate(distributionT, [110, 185, 265, 315]);
        }
        return 200;
    },

    buildLaunchRayConfigs(rayCount, size, flowOffset = this.flowOffset) {
        return buildLaunchRayConfigs(this, rayCount, size, flowOffset);
    },

    sanitizeSourcePosition() {
        // Removed auto-snap to wall logic to allow full control over source position.
    },

    applyShapeSwitchReset(nextShape) {
        // 1. Preserve: Temporarily store current critical settings
        const snapshot = {
            sourcePattern: this.sourcePattern,
            sourceOption: this.sourceOption || 'basic'
        };

        // 2. Switch: Stop interactions and change shape
        this.stopSimulation();
        this.currentNarrative = 'none'; 
        if (typeof UI !== 'undefined' && UI.syncNarrativeSelect) {
            UI.syncNarrativeSelect(this);
        }

        this.shape = nextShape;
        this.sourceAnchorPos = this.getShapeLayoutCenter(this.shape);
        this.resetTriangleSourceOffsets();

        // 3. Apply: Re-apply the stored settings to the new shape
        this.sourcePattern = snapshot.sourcePattern;
        this.applySourceOption(snapshot.sourceOption);

        this.normalizeLightSourceMode();
        if (this.shape === 'parabola') {
            this.lightSourceMode = 'point';
        }
        
        // One-time auto-calculation of parallel range when switching shape in parallel mode
        if (this.lightSourceMode === 'parallel') {
            this.recalcParallelRange();
        }

        this.autoModes.revolution = false;
        this.autoModes.rotation = false;

        // 4. Finalize
        this.resetRays(true);
    },

    syncSourceToFoci() {
        const defaults = this.getShapeDefaults(this.shape);
        this.sourcePos = defaults.sourcePos;
        this.sourceAnchorPos = this.getShapeLayoutCenter(this.shape);
        this.resetTriangleSourceOffsets();
    },

    getShapeSize() {
        const sizeMult = this.isWindowFull ? 0.45 : 0.35;
        return Math.min(this.canvas?.width || window.innerWidth, this.canvas?.height || window.innerHeight) * sizeMult;
    },

    normalizeLightSourceMode() {
        return normalizeLightSourceMode(this);
    },

    buildPersistedState() {
        return buildPersistedState(this);
    },

    persistState() {
        return persistState(this);
    },

    restoreState() {
        return restoreState(this);
    },

    readCurrentScene() {
        return readCurrentScene(this);
    },

    applyScene(scene) {
        return applyScene(this, scene);
    },

    applyPattern(patternId) {
        return applyPattern(this, patternId);
    },

    applySourceOption(presetId) {
        return applySourceOption(this, presetId);
    },

    updateOption(key, value) {
        return updateOption(this, key, value);
    },

    updateSlider(key, value, disableAuto = true) {
        return updateSlider(this, key, value, disableAuto);
    },

    updatePointer(pointerUpdate) {
        return updatePointer(this, pointerUpdate);
    },

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        this.canvas = document.getElementById('causticsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('container');
        this.hudElement = document.getElementById('hud-timer');
        this.speedElement = document.getElementById('hud-speed');
        this.bouncesElement = document.getElementById('hud-bounces');

        this.resize();
        this.sourcePos = this.getDefaultSourcePos();
        this.sourceAnchorPos = this.getShapeLayoutCenter(this.shape);
        this.restoreState();
        this.sanitizeSourcePosition();
        this.normalizeLightSourceMode();
        if (this.shape === 'parabola' && this.lightSourceMode === 'point') {
            this.sourcePos = this.getShapeDefaults('parabola').sourcePos;
        }

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
        if (window.LightDensityModule) window.LightDensityModule.init(this.canvas);
    },


    resetRays(shouldStop = true, resetGrowth = true) {
        if (resetGrowth) this.growth = 0;
        if (shouldStop) {
            this.stopSimulation(); 
            this.isFlowing = false;
            this.elapsedTime = 0; 
            if (window.audioManager) window.audioManager.pause();
        }
        this.isLightVisible = true;
        this.emitStartTime = performance.now();        
        // Manual Clear: Even in Paint Mode, the Reset button should clear the canvas
        if (this.ctx) {
            this.ctx.fillStyle = '#050508';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            Renderer.clearPaint(); // Clear the hidden paint buffer too
            Simulator.clear(); // Reset simulation state
            LightDensity.clear(); // Reset density grid
        }

        UI.update(this);
    },

    finishSimulation(finalHold = 4000) {
        return finishSimulation(this, finalHold);
    },

    triangle_A0_simm() {
        return runTriangleA0Simulation(this);
    },

    "3_beam_spread_simm"() {
        return runBeamSpreadSimulation(this);
    },

    "4_ray_num_simm"() {
        return runRayCountSimulation(this);
    },

    universal_journey_simm() {
        return runUniversalJourneySimulation(this);
    },

    /**
     * A0 Simulation Dispatcher
     * Triggers shape-specific master journey (e.g., rect_A0_simm)
     */
    startA0Simulation() {
        return startA0Simulation(this);
    },
    v_oval_A0_simm() { return runVOvalA0Simulation(this); },
    ellipse_A0_simm() { return runEllipseA0Simulation(this); },
    vv_oval_A0_simm() { return runVvOvalFocusSimulation(this); },
    rect_A0_simm() { return runRectA0Simulation(this); },
    triangle_A0_simm() { return runTriangleA0Simulation(this); },

    startNarrativeSimulation() {
        return startNarrativeSimulation(this);
    },

    stopSimulation() {
        return stopSimulation(this);
    },

    clearScene() {
        return clearScene(this);
    },

    toggleFlow() {
        if (this.isSimRunning) {
            this.stopSimulation();
            return;
        }

        this.isFlowing = !this.isFlowing;
        if (this.isFlowing) {
            this.normalizeLightSourceMode();
            this.isLightVisible = true;
            if (this.isPaint2Mode) {
                Simulator.initRays(this);
            }
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
            // Pause instead of stop to allow resuming from the same position
            if (window.audioManager) window.audioManager.pause();
        }
        UI.update(this);
    },

    reset() {
        console.log('[DEBUG] App.reset() called');
        this.stopSimulation();
        this.isSimulationMode = false;

        // 1. Reset to Global & Shape-specific Defaults
        const defaults = this.getShapeDefaults(this.shape);
        console.log('[DEBUG] defaults:', defaults);
        
        const shapeData = SHAPE_REGISTRY[this.shape];
        console.log('[DEBUG] shapeData found:', !!shapeData);
        
        if (shapeData && shapeData.defaults) {
            // Apply shape-specific options/pointer if they exist
            if (shapeData.defaults.options) {
                console.log('[DEBUG] applying shapeData.defaults.options');
                for (const [k, v] of Object.entries(shapeData.defaults.options)) {
                    this.updateOption(k, v);
                }
            }
        }

        // 2. Apply the 'basic' sub-preset (Position, Spread, Direction)
        console.log('[DEBUG] applySourceOption(basic)');
        this.applySourceOption('basic');

        // 3. Reset common sliders and options to global defaults
        console.log('[DEBUG] resetting sliders to global defaults');
        this.rayNumber = GLOBAL_DEFAULTS.sliders.rayNumber;
        this.raySpeed = GLOBAL_DEFAULTS.sliders.raySpeed;
        this.beamWidth = GLOBAL_DEFAULTS.sliders.beamWidth;
        this.MAX_BOUNCES = GLOBAL_DEFAULTS.sliders.maxBounces;
        this.alphaIntensity = GLOBAL_DEFAULTS.sliders.alphaIntensity;
        this.sourceRotation = GLOBAL_DEFAULTS.sliders.sourceRotation;
        
        this.renderMode = 'light';
        this.isPaintMode = false;
        this.isPaint2Mode = false;
        this.isLightMode = true;
        
        // 4. Reset Audio
        if (window.audioManager) {
            console.log('[DEBUG] resetting audio');
            window.audioManager.stop();
            this.nextBGM(true, false); // Start a fresh track
        }
        
        // 5. Clear Rays and Canvas
        console.log('[DEBUG] clear rays and canvas');
        this.resetRays(true);
        this.isFlowing = false;
        this.patternId = null;

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
        console.log('[DEBUG] UI.update starts');
        UI.update(this);
        console.log('[DEBUG] persistence starts');
        this.persistState();
        console.log('[DEBUG] App.reset() end');
    },

    /**
     * Calculate the valid X-range for parallel rays at the current sourcePos.y
     * Following user optimization: calculated once per state change.
     */
    recalcParallelRange() {
        return recalcParallelRange(this);
    },

    rect_A0_simm() {
        return runRectA0Simulation(this);
    },

    universal_journey_simm() {
        return runUniversalJourneySimulation(this);
    },

    "vv_oval_focus_simm"() {
        return runVvOvalFocusSimulation(this);
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
                    const anchor = this.getActiveSourceAnchor();
                    const dist = Math.sqrt(anchor.x**2 + anchor.y**2);
                    const nextPos = {
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist
                    };
                    if (this.sourcePattern === 'single') this.sourcePos = nextPos;
                    else this.sourceAnchorPos = nextPos;
                }

                // Rotation (Spin)
                if (this.autoModes.rotation) {
                    this.sourceRotation = oscillate('rotation', 0.15) * Math.PI * 2 - Math.PI;
                }

                // Density (Ray Number)
                if (this.autoModes.density) {
                    this.rayNumber = Math.floor(20 + oscillate('density', 0.2) * 980);
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

                // Safety guard removed - respecting user settings fully

                // UI update is relatively expensive; throttle during animation loop.
                if (now - this.lastUiUpdateAt > 80) {
                    UI.update(this);
                    this.lastUiUpdateAt = now;
                }
                
                if (this.isFlowing && this.isLightVisible) {
                    // Use safeDt: prevent negative values and massive jumps (background sleep)
                    const safeDt = Math.max(0, Math.min(dt, 0.1));
                    const growthSpeed = this.raySpeed * 10 * this.simSpeedMultiplier;
                    
                    if (this.isPaint2Mode) {
                        // Progress increment for Paint 2
                        const delta = growthSpeed * safeDt;
                        const newSegments = Simulator.step(this, delta);
                        Renderer.drawPaint2Segments(this, newSegments);
                    } else {
                        // Light, Normal, and Paint 1 share frame-based growth logic
                        this.growth += growthSpeed * safeDt;
                        const maxCap = Math.sqrt(this.canvas.width**2 + this.canvas.height**2) * 5;
                        if (this.growth > maxCap) this.growth = maxCap;

                        if (this.flowMode !== 'none') {
                            this.flowOffset = (this.flowOffset + growthSpeed * 0.15 * safeDt) % 50;
                        }

                        // Light Density grid decay (Stronger for short-memory effect)
                        if (this.isLightMode && window.LightDensityModule) {
                            window.LightDensityModule.decay(0.85);
                        }
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

                        if (this.bouncesElement) {
                            let bCount = 0;
                            if (this.isPaint2Mode && Simulator.rayStates.length > 0) {
                                bCount = Simulator.rayStates[0].active ? Simulator.rayStates[0].bounces : Simulator.rayStates[0].bounces; 
                            } else {
                                // For normal mode, use the count calculated during Renderer.draw
                                bCount = this.currentBounces || 0; 
                            }
                            this.bouncesElement.textContent = `BOUNCES ${bCount}`;
                            this.bouncesElement.classList.add('visible');
                        }
                    } else {
                        this.hudElement.classList.remove('visible');
                        if (this.speedElement) this.speedElement.classList.remove('visible');
                        if (this.bouncesElement) this.bouncesElement.classList.remove('visible');
                    }
                }

                // Update Music Visualizer Timer (only if audio is playing)
                if (window.audioManager && window.audioManager.audio && !window.audioManager.audio.paused) {
                    this.musicVisTimer += safeDt;
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
