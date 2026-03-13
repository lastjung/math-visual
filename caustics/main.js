/**
 * LIGHT FLOW LAB: Standalone Core Logic
 * Custom: Free Source Movement
 */
import { Physics } from './physics.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { Simulator } from './simulator.js';
import { LightDensity } from './light-density.js';
window.LightDensityModule = LightDensity; // Fix visibility

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
    spread: 0,
    flowOffset: 0,
    baseStyle: 'line',
    flowMode: 'none',
    lightSourceMode: 'point', // 'point' or 'parallel'
    triangleSourceMode: 'single',
    triangleDirectionMode: 'parallel',
    trianglePointCount: 5,
    triangleVertexBias: 0.6,
    parallelRange: { min: -100, max: 100 }, // Cached range for Parallel rays
    useTrail: true,
    useTaper: false,
    useBloom: false,
    alphaIntensity: 1.0,
    isPaintMode: false, 
    isPaint2Mode: false, 
    isLightMode: false,  
    isSimulationMode: false,
    isWindowFull: false,
    preSimulationBounces: 10,
    MAX_BOUNCES: 1, // 반사 효과 끔 (기본 1회)
    currentNarrative: 'none',
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
    musicVisTimer: 0, // Separate timer for visualizer animation
    simSpeedMultiplier: 1.0, 

    getDefaultSourcePos() {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.35;
        return { x: 0, y: -size * 0.7 };
    },

    getShapeDefaults(shape) {
        const sizeMult = this.isWindowFull ? 0.45 : 0.35;
        const size = Math.min(this.canvas?.width || window.innerWidth, this.canvas?.height || window.innerHeight) * sizeMult;
        const edgePad = Math.max(8, size * 0.04);
        const defaults = {
            sourcePos: { x: 0, y: -size * 0.7 },
            sourceRotation: 0
        };

        if (shape === 'ellipse') {
            const fDist = size * 0.88; // sqrt(1.1^2 - 0.66^2)
            defaults.sourcePos = { x: -fDist, y: 0 };
            defaults.sourceRotation = 0;
        } else if (shape === 'cardioid') {
            defaults.sourcePos = { x: -size * 0.4, y: 0 };
            defaults.sourceRotation = 0;
        } else if (shape === 'parabola') {
            defaults.sourcePos = { x: 0, y: size * (Physics.PARABOLA_OFFSET_V + Physics.PARABOLA_P) }; // Point source sits exactly at the parabola focus
            defaults.sourceRotation = 0;
        } else if (shape === 'rect') {
            defaults.sourcePos = { x: 0, y: -(size * 1.05 - edgePad) };
            defaults.sourceRotation = 0;
        } else if (shape === 'v-oval') {
            const fDist = size * 0.6324; // sqrt(1.1^2 - 0.9^2)
            defaults.sourcePos = { x: 0, y: -fDist };
            defaults.sourceRotation = 0;
        } else if (shape === 'vv-oval') {
            const fDist = size * 0.6324; // Shared with the outer vertical oval focus
            defaults.sourcePos = { x: 0, y: -fDist };
            defaults.sourceRotation = 0;
        } else if (shape === 'triangle') {
            defaults.sourcePos = { x: 0, y: size * 0.2 };
            defaults.sourceRotation = 0;
        }

        return defaults;
    },

    getTriangleVertices(size) {
        const tr = size * 1.17;
        const toy = size * 0.2;
        return [
            { x: 0, y: -tr + toy },
            { x: tr * Math.sqrt(3) / 2, y: tr / 2 + toy },
            { x: -tr * Math.sqrt(3) / 2, y: tr / 2 + toy }
        ];
    },

    getTriangleSourceOrigins(size) {
        const base = { ...this.sourcePos };
        if (this.shape !== 'triangle' || this.lightSourceMode !== 'point') return [base];

        if (this.triangleSourceMode === 'triad') {
            return this.getTriangleVertices(size);
        }

        if (this.triangleSourceMode === 'strip') {
            const count = Math.max(2, Math.floor(this.trianglePointCount));
            const halfWidth = size * (0.12 + this.triangleVertexBias * 0.42);
            const axisAngle = this.sourceRotation;
            const dx = Math.cos(axisAngle);
            const dy = Math.sin(axisAngle);
            return Array.from({ length: count }, (_, index) => {
                const t = count === 1 ? 0.5 : index / (count - 1);
                const offset = (t - 0.5) * 2 * halfWidth;
                return {
                    x: base.x + dx * offset,
                    y: base.y + dy * offset
                };
            });
        }

        return [base];
    },

    getTriangleLaunchAngle(origin, size, localT = 0.5) {
        const baseAngle = Math.PI / 2 + this.sourceRotation;
        const spreadOffset = (localT - 0.5) * this.spread;
        const triangleCenter = { x: 0, y: size * 0.2 };

        if (this.triangleSourceMode === 'single') {
            return baseAngle + spreadOffset;
        }

        if (this.triangleDirectionMode === 'inward') {
            const inwardAngle = Math.atan2(triangleCenter.y - origin.y, triangleCenter.x - origin.x);
            return inwardAngle + spreadOffset;
        }

        if (this.triangleDirectionMode === 'outward') {
            const outwardAngle = Math.atan2(origin.y - triangleCenter.y, origin.x - triangleCenter.x);
            return outwardAngle + spreadOffset;
        }

        if (this.triangleDirectionMode === 'edge-normal') {
            const inwardNormal = Physics.getNormal(origin.x, origin.y, 'triangle', size);
            const normalAngle = Math.atan2(-inwardNormal.y, -inwardNormal.x);
            return normalAngle + spreadOffset;
        }

        return baseAngle + spreadOffset;
    },

    buildLaunchRayConfigs(rayCount, size, flowOffset = this.flowOffset) {
        const count = Math.max(1, Math.floor(rayCount));
        const aimAngle = Math.PI / 2;
        const configs = [];
        const origins = this.getTriangleSourceOrigins(size);

        if (this.shape === 'triangle' && this.lightSourceMode === 'point' && origins.length > 1) {
            const groupCount = origins.length;
            const basePerGroup = Math.floor(count / groupCount);
            const remainder = count % groupCount;

            origins.forEach((origin, groupIndex) => {
                const localCount = basePerGroup + (groupIndex < remainder ? 1 : 0);
                for (let localIndex = 0; localIndex < localCount; localIndex++) {
                    const tLocal = localCount <= 1 ? 0.5 : localIndex / (localCount - 1);
                    const tGlobal = count <= 1 ? 0 : configs.length / Math.max(1, count - 1);
                    const angle = this.getTriangleLaunchAngle(origin, size, tLocal);
                    configs.push({
                        sPos: Physics.offsetRayStart(origin, angle, size),
                        angle,
                        t: tGlobal
                    });
                }
            });
            return configs;
        }

        for (let idx = 0; idx < count; idx++) {
            const t = idx / Math.max(1, count - 1);
            let sPos, angle;

            if (this.lightSourceMode === 'parallel') {
                const d = this.parallelRange.min + t * (this.parallelRange.max - this.parallelRange.min);
                const cosR = Math.cos(this.sourceRotation);
                const sinR = Math.sin(this.sourceRotation);
                sPos = { x: this.sourcePos.x + d * cosR, y: this.sourcePos.y + d * sinR };
                angle = this.sourceRotation + Math.PI / 2;
            } else if (this.lightSourceMode === 'converge') {
                const targetPos = this.sourcePos;
                const baseAngle = aimAngle + this.sourceRotation + (t - 0.5) * this.spread;
                const hit = Physics.getConvergeLaunchPoint(targetPos, baseAngle, this.shape, size);
                if (hit) {
                    sPos = { x: hit.x, y: hit.y };
                    angle = baseAngle + Math.PI;
                } else {
                    sPos = { x: targetPos.x, y: targetPos.y };
                    angle = baseAngle;
                }
            } else {
                sPos = { x: this.sourcePos.x, y: this.sourcePos.y };
                angle = aimAngle + this.sourceRotation + (t - 0.5) * this.spread;
            }

            configs.push({
                sPos: Physics.offsetRayStart(sPos, angle, size),
                angle,
                t
            });
        }

        return configs;
    },

    sanitizeSourcePosition() {
        if (!this.canvas) return;
        const sizeMult = this.isWindowFull ? 0.45 : 0.35;
        const size = Math.min(this.canvas.width, this.canvas.height) * sizeMult;

        if (this.shape === 'rect') {
            const halfW = size * 1.5 * 0.5;
            const halfH = size * 2.1 * 0.5;
            const eps = Math.max(6, size * 0.03);
            const insideOrNearRect =
                Math.abs(this.sourcePos.x) <= halfW + eps &&
                Math.abs(this.sourcePos.y) <= halfH + eps;

            if (insideOrNearRect) {
                const leftGap = Math.abs(this.sourcePos.x + halfW);
                const rightGap = Math.abs(this.sourcePos.x - halfW);
                const topGap = Math.abs(this.sourcePos.y + halfH);
                const bottomGap = Math.abs(this.sourcePos.y - halfH);
                const minGap = Math.min(leftGap, rightGap, topGap, bottomGap);
                const inset = Math.max(12, eps);

                if (minGap === topGap) this.sourcePos.y = -halfH + inset;
                else if (minGap === bottomGap) this.sourcePos.y = halfH - inset;
                else if (minGap === leftGap) this.sourcePos.x = -halfW + inset;
                else this.sourcePos.x = halfW - inset;
            }
        }
    },

    applyShapeSwitchReset(nextShape) {
        this.stopSimulation();
        this.currentNarrative = 'none'; // Clear previous narrative on shape switch
        if (typeof UI !== 'undefined' && UI.syncNarrativeSelect) {
            UI.syncNarrativeSelect(this);
        }
        // Reset only tab-specific values.
        const defaults = this.getShapeDefaults(nextShape);
        this.sourcePos = defaults.sourcePos;
        this.sanitizeSourcePosition();
        this.sourceRotation = defaults.sourceRotation;
        this.normalizeLightSourceMode();
        if (nextShape === 'parabola') {
            this.lightSourceMode = 'point';
        }
        this.autoModes.revolution = false;
        this.autoModes.rotation = false;

        // Use Partial Reset to handle timer, HUD, and clearing
        this.resetRays(true);
    },

    syncSourceToFoci() {
        const defaults = this.getShapeDefaults(this.shape);
        this.sourcePos = defaults.sourcePos;
        this.recalcParallelRange();
    },

    getShapeSize() {
        const sizeMult = this.isWindowFull ? 0.45 : 0.35;
        return Math.min(this.canvas?.width || window.innerWidth, this.canvas?.height || window.innerHeight) * sizeMult;
    },

    normalizeLightSourceMode() {
        if (this.isPaint2Mode && this.lightSourceMode === 'converge') {
            this.lightSourceMode = 'point';
            Simulator.clear();
        }
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
            triangleSourceMode: this.triangleSourceMode,
            triangleDirectionMode: this.triangleDirectionMode,
            trianglePointCount: this.trianglePointCount,
            triangleVertexBias: this.triangleVertexBias,
            useTrail: this.useTrail,
            useTaper: this.useTaper,
            useBloom: this.useBloom,
            alphaIntensity: this.alphaIntensity,
            isPaintMode: this.isPaintMode,
            isPaint2Mode: this.isPaint2Mode,
            isLightMode: this.isLightMode,
            MAX_BOUNCES: this.MAX_BOUNCES,
            currentNarrative: this.currentNarrative,
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
            this.sanitizeSourcePosition();
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
            this.triangleSourceMode = saved.triangleSourceMode ?? this.triangleSourceMode;
            this.triangleDirectionMode = saved.triangleDirectionMode ?? this.triangleDirectionMode;
            this.trianglePointCount = saved.trianglePointCount ?? this.trianglePointCount;
            this.triangleVertexBias = saved.triangleVertexBias ?? this.triangleVertexBias;
            this.normalizeLightSourceMode();
            this.useTrail = saved.useTrail ?? this.useTrail;
            this.useTaper = saved.useTaper ?? this.useTaper;
            this.useBloom = saved.useBloom ?? this.useBloom;
            this.alphaIntensity = saved.alphaIntensity ?? this.alphaIntensity;
            this.isPaintMode = saved.isPaintMode === true;
            this.isPaint2Mode = saved.isPaint2Mode === true;
            this.isLightMode = saved.isLightMode === true;
            this.parallelRange = saved.parallelRange ?? { min: -100, max: 100 };
            
            this.recalcParallelRange(); // Ensure range is valid for current sourcePos.y
            this.isSimulationMode = false;
            this.MAX_BOUNCES = saved.MAX_BOUNCES ?? this.MAX_BOUNCES;
            
            // Safety Validation for Narratives: Replace legacy/invalid strings with the default
            const validNarratives = ['none', 'The Secret Foci of Ovals', 'Double Oval: Shared Foci, Split Light', 'The Parabolic Point', 'Reflections of Order', 'Circle of Infinite Light', 'The Radiant Pulse of Heart', 'The Hidden Soul of Beams', 'Dance of the Photons'];
            const restoredNarrative = saved.currentNarrative;
            if (validNarratives.includes(restoredNarrative)) {
                this.currentNarrative = restoredNarrative;
            } else {
                this.currentNarrative = 'none';
            }

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
        this.bouncesElement = document.getElementById('hud-bounces');

        this.resize();
        this.sourcePos = this.getDefaultSourcePos();
        this.restoreState();
        this.sanitizeSourcePosition();
        this.normalizeLightSourceMode();
        if (this.shape === 'parabola' && this.lightSourceMode === 'point') {
            this.sourcePos = this.getShapeDefaults('parabola').sourcePos;
        }

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
        if (window.LightDensityModule) window.LightDensityModule.init(this.canvas);
    },


    resetRays(shouldStop = true) {
        this.stopSimulation(); // ALWAYS stop any ongoing simulation on reset
        this.growth = 0;
        if (shouldStop) {
            this.isFlowing = false;
            if (window.audioManager) window.audioManager.pause();
        }
        this.isLightVisible = true;
        this.emitStartTime = performance.now();
        this.elapsedTime = 0; 
        
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
        this.overlayMessage = "Simulation End";
        UI.update(this);
        const endTimer = setTimeout(() => {
            this.overlayMessage = null;
            this.isSimRunning = false;
            this.isSimulationMode = false;
            this.isLightVisible = false;
            this.isFlowing = false;
            UI.update(this);
        }, finalHold);
        this.simTimers.push(endTimer);
    },

    startNarrativeSimulation() {
        if (this.isSimRunning) {
            this.stopSimulation();
            this.isSimulationMode = false;
            UI.update(this);
            return;
        }

        this.isSimulationMode = true;
        
        // 1. Direct Mapping for established narratives
        if (this.currentNarrative === 'Double Oval: Shared Foci, Split Light') {
            this["vv_oval_focus_simm"]();
            return;
        }
        
        // 2. Default to Universal Journey
        this.universal_journey_simm();
    },

    stopSimulation() {
        if (!this.isSimRunning && !this.overlayMessage) return;
        
        // Clear all pending timeouts to kill the "ghost" chains
        this.simTimers.forEach(t => clearTimeout(t));
        this.simTimers = [];
        
        this.isSimRunning = false;
        this.isSimulationMode = false;
        this.overlayMessage = null;
        
        // Return to normal interactive state
        this.isLightVisible = true;
        this.isFlowing = false;
        
        // Pause music when simulation is force-stopped
        if (window.audioManager) window.audioManager.pause();
        
        UI.update(this);
    },

    clearScene() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#050508';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        Renderer.clearPaint();
        Simulator.clear();
        if (window.LightDensityModule) window.LightDensityModule.clear();
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
        this.stopSimulation(); // Kill any simulation ghost chains first
        // this.shape = 'circle'; // Keep current shape
        this.rayNumber = 30;
        this.raySpeed = 20;
        const defaults = this.getShapeDefaults(this.shape);
        this.sourcePos = defaults.sourcePos;
        this.sanitizeSourcePosition();
        this.normalizeLightSourceMode();
        // this.isPaintMode = false; // Preserve current mode
        // this.isPaint2Mode = true;
        // this.isLightMode = false;
        this.isSimulationMode = false;
        this.preSimulationBounces = 10;
        this.spread = 1.2;
        this.beamWidth = 1.6;
        this.MAX_BOUNCES = 10;
        
        // Use resetRays for consistent behavior (timer reset, HUD visibility, canvas clearing)
        this.resetRays(true);

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
        
        let minX = Infinity;
        let maxX = -Infinity;
        const scanStep = 5; 
        const scanLimit = size * 2;

        for (let x = -scanLimit; x <= scanLimit; x += scanStep) {
            if (Physics.isInside(x, y, this.shape, size)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
        }

        if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
            this.parallelRange = { min: -100, max: 100 };
            return;
        }

        // Apply a small "inner" margin (95% of width) per user request
        const margin = 0.95;
        this.parallelRange = {
            min: (minX * margin) - this.sourcePos.x,
            max: (maxX * margin) - this.sourcePos.x
        };
    },

    "3_beam_spread_simm"() {
        if (this.isSimRunning) return; 
        this.isSimRunning = true;
        const currentNarrative = this.currentNarrative === 'none' ? null : this.currentNarrative;

        if (window.audioManager && window.audioManager.targetVolume > 0) {
            window.audioManager.isMuted = false;
            window.audioManager.resume();
        }

        // Use degrees for mapping but convert to radians for physics
        const stages = [15, 30, 60, 90]; 
        let currentIdx = 0;

        const runStage = () => {
            if (currentIdx >= stages.length) {
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

            const degreeVal = stages[currentIdx];
            const radVal = degreeVal * (Math.PI / 180); // Conversion to Radians
            
            // A. KILL & CLEAR
            this.isLightVisible = false;
            this.isFlowing = false;
            if (this.ctx) {
                this.ctx.fillStyle = '#050508';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                Renderer.clearPaint();
                Simulator.clear();
                if (window.LightDensityModule) window.LightDensityModule.clear();
            }

            // B. SET MESSAGE
            if (currentIdx === 0) {
                if (currentNarrative) {
                    this.overlayMessage = [currentNarrative, `Expand the Beam Spread (Angle ${degreeVal})` ];
                } else {
                    this.overlayMessage = `Expand the Beam Spread (Angle ${degreeVal})`;
                }
            } else {
                this.overlayMessage = `Angle ${degreeVal}`;
            }
            UI.update(this);

            // B. SHOW TEXT
            const textTime = (currentIdx === 0) ? 3000 : 2000;
            const textTimer = setTimeout(() => {
                if (this.ctx) {
                    this.ctx.fillStyle = '#050508';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    Renderer.clearPaint();
                    Simulator.clear();
                    if (window.LightDensityModule) window.LightDensityModule.clear();
                }
                this.overlayMessage = null;
                this.spread = radVal; // Actual Radian value applied here
                this.growth = 0;
                this.isLightVisible = true;
                this.isFlowing = true;
                UI.update(this);

                const simTime = 12000;
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

    "4_ray_mum_simm"() {
        if (this.isSimRunning) return; 
        this.isSimRunning = true;
        // Removed all forced mode and setting overrides
        const currentNarrative = this.currentNarrative === 'none' ? null : this.currentNarrative;

        // Step 1: Handle Audio Auto-Start
        if (window.audioManager && window.audioManager.targetVolume > 0) {
            window.audioManager.isMuted = false;
            window.audioManager.resume();
        }

        const stages = [30, 100, 350, 1000];
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
                Simulator.clear(); // Reset simulator for each new stage in the sequence
                if (window.LightDensityModule) window.LightDensityModule.clear();
            }

            // B. SET MESSAGE (MANUAL SELECTION AS PRIMARY TITLE)
            if (currentIdx === 0) {
                if (currentNarrative) {
                    this.overlayMessage = "Simulation Ending...";
                }
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
                    Simulator.clear(); // Reset again just before actual flow starts
                    if (window.LightDensityModule) window.LightDensityModule.clear();
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

    universal_journey_simm() {
        if (this.isSimRunning) return;
        this.isSimRunning = true;

        const size = this.getShapeSize();
        const shapeName = this.shape.charAt(0).toUpperCase() + this.shape.slice(1);
        const title = this.currentNarrative !== 'none' ? this.currentNarrative : `Journey of Light: ${shapeName}`;

        if (window.audioManager && window.audioManager.targetVolume > 0) {
            window.audioManager.isMuted = false;
            window.audioManager.resume();
        }

        // Get geometry-specific points
        const defaults = this.getShapeDefaults(this.shape);
        const center = { x: 0, y: 0 };
        if (this.shape === 'triangle') center.y = size * 0.2;

        const stages = [
            {
                subtitle: 'Initial Contact: Point Source',
                apply: () => {
                    this.lightSourceMode = 'point';
                    this.sourcePos = { ...defaults.sourcePos };
                    this.spread = 0.5;
                    this.rayNumber = 100;
                    this.MAX_BOUNCES = 6;
                    this.isPaint2Mode = false;
                },
                textTime: 2500,
                simTime: 8000
            },
            {
                subtitle: 'Parallel Expansion: Sweeping the Perimeter',
                apply: () => {
                    this.lightSourceMode = 'parallel';
                    this.rayNumber = 200;
                    this.MAX_BOUNCES = 12;
                    this.autoModes.revolution = true;
                    this.useTrail = true;
                },
                textTime: 2500,
                simTime: 12000
            },
            {
                subtitle: 'Geometric Convergence: Finding the Focus',
                apply: () => {
                    this.autoModes.revolution = false;
                    this.lightSourceMode = 'converge';
                    this.sourcePos = { ...defaults.sourcePos };
                    this.spread = 1.2;
                    this.rayNumber = 400;
                    this.MAX_BOUNCES = 15;
                    this.isPaint2Mode = true;
                    Simulator.initRays(this);
                },
                textTime: 2500,
                simTime: 15000
            }
        ];

        let stageIndex = 0;
        const runStage = () => {
            if (stageIndex >= stages.length) {
                this.finishSimulation();
                return;
            }

            const stage = stages[stageIndex];
            this.isLightVisible = false;
            this.isFlowing = false;
            this.clearScene();
            stage.apply();
            this.recalcParallelRange();
            this.overlayMessage = [title, stage.subtitle];
            UI.update(this);

            const textTimer = setTimeout(() => {
                this.overlayMessage = null;
                this.growth = 0;
                this.isLightVisible = true;
                this.isFlowing = true;
                UI.update(this);

                const simTimer = setTimeout(() => {
                    stageIndex++;
                    runStage();
                }, stage.simTime);
                this.simTimers.push(simTimer);
            }, stage.textTime);
            this.simTimers.push(textTimer);
        };

        runStage();
    },

    "vv_oval_focus_simm"() {
        if (this.isSimRunning) return;
        this.isSimRunning = true;

        const sizeMult = this.isWindowFull ? 0.45 : 0.35;
        const size = Math.min(this.canvas.width, this.canvas.height) * sizeMult;
        const focusY = -size * 0.6324;
        const shellMidY = -size * ((Physics.VV_OVAL_OUTER.ry + Physics.VV_OVAL_INNER.ry) * 0.5);

        if (window.audioManager && window.audioManager.targetVolume > 0) {
            window.audioManager.isMuted = false;
            window.audioManager.resume();
        }

        const stages = [
            {
                subtitle: 'A point source fills the shared shell',
                apply: () => {
                    this.shape = 'vv-oval';
                    this.lightSourceMode = 'point';
                    this.sourcePos = { x: 0, y: shellMidY };
                    this.spread = 0.7;
                    this.rayNumber = 160;
                    this.MAX_BOUNCES = 8;
                    this.useTrail = true;
                },
                textTime: 2600,
                simTime: 7000
            },
            {
                subtitle: 'Converge drives the beam toward the common focus',
                apply: () => {
                    this.shape = 'vv-oval';
                    this.lightSourceMode = 'converge';
                    this.sourcePos = { x: 0, y: focusY };
                    this.spread = 1.15;
                    this.rayNumber = 240;
                    this.MAX_BOUNCES = 10;
                },
                textTime: 2400,
                simTime: 8000
            },
            {
                subtitle: 'Off-focus target loosens the caustic and splits the flow',
                apply: () => {
                    this.shape = 'vv-oval';
                    this.lightSourceMode = 'converge';
                    this.sourcePos = { x: 0, y: focusY * 0.52 };
                    this.spread = 1.15;
                    this.rayNumber = 240;
                    this.MAX_BOUNCES = 10;
                },
                textTime: 2400,
                simTime: 8000
            }
        ];

        let stageIndex = 0;
        const runStage = () => {
            if (stageIndex >= stages.length) {
                this.finishSimulation();
                return;
            }

            const stage = stages[stageIndex];
            this.isLightVisible = false;
            this.isFlowing = false;
            this.clearScene();
            stage.apply();
            this.recalcParallelRange();
            document.querySelectorAll('.shape-tab').forEach((b) => b.classList.toggle('active', b.dataset.shape === this.shape));
            this.overlayMessage = ['Double Oval: Shared Foci, Split Light', stage.subtitle];
            UI.update(this);

            const textTimer = setTimeout(() => {
                this.clearScene();
                this.overlayMessage = null;
                this.growth = 0;
                this.isLightVisible = true;
                this.isFlowing = true;
                UI.update(this);

                const simTimer = setTimeout(() => {
                    stageIndex++;
                    runStage();
                }, stage.simTime);
                this.simTimers.push(simTimer);
            }, stage.textTime);
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
