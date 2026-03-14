import { Physics } from '../sim/physics.js';
import { Renderer } from '../render/renderer.js';
import { Simulator } from '../sim/simulator.js';
import { UI } from '../ui.js';

export function registerTimer(app, timerId) {
    app.simTimers.push(timerId);
    return timerId;
}

export function clearSimulationTimers(app) {
    app.simTimers.forEach((timerId) => clearTimeout(timerId));
    app.simTimers = [];
}

export function clearScene(app) {
    if (!app.ctx) return;
    app.ctx.fillStyle = '#050508';
    app.ctx.fillRect(0, 0, app.canvas.width, app.canvas.height);
    Renderer.clearPaint();
    Simulator.clear();
    if (window.LightDensityModule) window.LightDensityModule.clear();
}

export function finishSimulation(app, finalHold = 4000) {
    app.overlayMessage = 'Simulation End';
    UI.update(app);
    registerTimer(app, setTimeout(() => {
        app.overlayMessage = null;
        app.isSimRunning = false;
        app.isSimulationMode = false;
        app.isLightVisible = false;
        app.isFlowing = false;
        UI.update(app);
    }, finalHold));
}

export function stopSimulation(app) {
    if (!app.isSimRunning && !app.overlayMessage) return;
    clearSimulationTimers(app);
    app.isSimRunning = false;
    app.isSimulationMode = false;
    app.overlayMessage = null;
    app.isLightVisible = true;
    app.isFlowing = false;
    if (window.audioManager) window.audioManager.pause();
    UI.update(app);
}

export function startA0Simulation(app) {
    if (app.isSimRunning) {
        stopSimulation(app);
        return;
    }

    const method = `${app.shape}_A0_simm`;
    if (typeof app[method] === 'function') {
        app[method]();
    } else {
        console.warn(`No A0 simulation defined for ${app.shape}, falling back to universal.`);
        app.universal_journey_simm();
    }
}

export function startNarrativeSimulation(app) {
    startA0Simulation(app);
}

function resumeAudioIfAvailable() {
    if (window.audioManager && window.audioManager.targetVolume > 0) {
        window.audioManager.isMuted = false;
        window.audioManager.resume();
    }
}

export function runBeamSpreadSimulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    const currentNarrative = app.currentNarrative === 'none' ? null : app.currentNarrative;
    resumeAudioIfAvailable();

    const stages = [15, 30, 60, 90];
    let currentIdx = 0;

    const runStage = () => {
        if (currentIdx >= stages.length) {
            app.overlayMessage = 'Simulation End';
            UI.update(app);
            registerTimer(app, setTimeout(() => {
                app.overlayMessage = null;
                app.isSimRunning = false;
                app.isLightVisible = false;
                app.isFlowing = false;
                UI.update(app);
            }, 4000));
            return;
        }

        const degreeVal = stages[currentIdx];
        const radVal = degreeVal * (Math.PI / 180);

        app.isLightVisible = false;
        app.isFlowing = false;
        clearScene(app);

        if (currentIdx === 0) {
            app.overlayMessage = currentNarrative
                ? [currentNarrative, `Expand the Beam Spread (Angle ${degreeVal})`]
                : `Expand the Beam Spread (Angle ${degreeVal})`;
        } else {
            app.overlayMessage = `Angle ${degreeVal}`;
        }
        UI.update(app);

        const textTime = currentIdx === 0 ? 3000 : 2000;
        registerTimer(app, setTimeout(() => {
            clearScene(app);
            app.overlayMessage = null;
            app.spread = radVal;
            app.growth = 0;
            app.isLightVisible = true;
            app.isFlowing = true;
            UI.update(app);

            registerTimer(app, setTimeout(() => {
                currentIdx++;
                runStage();
            }, 12000));
        }, textTime));
    };

    runStage();
}

export function runRayCountSimulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    const currentNarrative = app.currentNarrative === 'none' ? null : app.currentNarrative;
    resumeAudioIfAvailable();

    const stages = [30, 100, 350, 1000];
    let currentIdx = 0;

    const runStage = () => {
        if (currentIdx >= stages.length) {
            app.overlayMessage = 'Simulation End';
            UI.update(app);
            registerTimer(app, setTimeout(() => {
                app.overlayMessage = null;
                app.isSimRunning = false;
                app.isLightVisible = false;
                app.isFlowing = false;
                UI.update(app);
            }, 4000));
            return;
        }

        const val = stages[currentIdx];
        app.isLightVisible = false;
        app.isFlowing = false;
        clearScene(app);

        if (currentIdx === 0 && currentNarrative) {
            app.overlayMessage = 'Simulation Ending...';
        } else {
            app.overlayMessage = `${val} Rays`;
        }
        UI.update(app);

        const textTime = currentIdx === 0 ? 3000 : 2000;
        registerTimer(app, setTimeout(() => {
            clearScene(app);
            app.overlayMessage = null;
            app.rayNumber = val;
            app.growth = 0;
            app.isLightVisible = true;
            app.isFlowing = true;
            UI.update(app);

            const simTime = val === 350 ? 15000 : 12000;
            registerTimer(app, setTimeout(() => {
                currentIdx++;
                runStage();
            }, simTime));
        }, textTime));
    };

    runStage();
}

export function runRectA0Simulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    app.isSimulationMode = true;
    resumeAudioIfAvailable();

    const stages = [
        { subtitle: 'Side Scan', slot: 1, duration: 25000, speed: 20 },
        { subtitle: 'Vertical Equilibrium: The Top Bounce', slot: 0, duration: 10000, speed: 15 },
        { subtitle: 'Corner Geometry: The Vertex Echo', slot: 2, duration: 10000, speed: 15 }
    ];

    let idx = 0;
    const runStage = () => {
        if (idx >= stages.length) {
            finishSimulation(app);
            return;
        }

        const stage = stages[idx];
        clearScene(app);
        app.isLightVisible = false;
        app.isFlowing = false;
        UI.applyShapePreset(app, stage.slot);
        app.raySpeed = stage.speed;
        app.overlayMessage = idx === 0 ? ['Rectangle Master', stage.subtitle] : stage.subtitle;
        UI.update(app);

        registerTimer(app, setTimeout(() => {
            app.overlayMessage = null;
            app.growth = 0;
            app.isLightVisible = true;
            app.isFlowing = true;
            UI.update(app);

            registerTimer(app, setTimeout(() => {
                idx++;
                runStage();
            }, stage.duration));
        }, 4000));
    };

    runStage();
}

export function runUniversalJourneySimulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    app.isSimulationMode = true;

    const shapeName = app.shape.charAt(0).toUpperCase() + app.shape.slice(1);
    const title = app.currentNarrative !== 'none' ? app.currentNarrative : `Journey of Light: ${shapeName}`;
    const defaults = app.getShapeDefaults(app.shape);
    resumeAudioIfAvailable();

    const stages = [
        {
            subtitle: 'Initial Contact: Point Source',
            apply: () => {
                app.lightSourceMode = 'point';
                app.sourcePos = { ...defaults.sourcePos };
                app.spread = 0.5;
                app.rayNumber = 100;
                app.MAX_BOUNCES = 6;
                app.isPaint2Mode = false;
            },
            textTime: 2500,
            simTime: 8000
        },
        {
            subtitle: 'Parallel Expansion: Sweeping the Perimeter',
            apply: () => {
                app.lightSourceMode = 'parallel';
                app.rayNumber = 200;
                app.MAX_BOUNCES = 12;
                app.autoModes.revolution = true;
                app.useTrail = true;
            },
            textTime: 2500,
            simTime: 12000
        },
        {
            subtitle: 'Geometric Convergence: Finding the Focus',
            apply: () => {
                app.autoModes.revolution = false;
                app.lightSourceMode = 'converge';
                app.sourcePos = { ...defaults.sourcePos };
                app.spread = 1.2;
                app.rayNumber = 400;
                app.MAX_BOUNCES = 15;
                app.isPaint2Mode = true;
                Simulator.initRays(app);
            },
            textTime: 2500,
            simTime: 15000
        }
    ];

    let stageIndex = 0;
    const runStage = () => {
        if (stageIndex >= stages.length) {
            finishSimulation(app);
            return;
        }

        const stage = stages[stageIndex];
        app.isLightVisible = false;
        app.isFlowing = false;
        clearScene(app);
        stage.apply();
        app.recalcParallelRange();
        app.overlayMessage = [title, stage.subtitle];
        UI.update(app);

        registerTimer(app, setTimeout(() => {
            app.overlayMessage = null;
            app.growth = 0;
            app.isLightVisible = true;
            app.isFlowing = true;
            UI.update(app);

            registerTimer(app, setTimeout(() => {
                stageIndex++;
                runStage();
            }, stage.simTime));
        }, stage.textTime));
    };

    runStage();
}

export function runVvOvalFocusSimulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;

    const sizeMult = app.isWindowFull ? 0.45 : 0.35;
    const size = Math.min(app.canvas.width, app.canvas.height) * sizeMult;
    const focusY = -size * 0.6324;
    const shellMidY = -size * ((Physics.VV_OVAL_OUTER.ry + Physics.VV_OVAL_INNER.ry) * 0.5);
    resumeAudioIfAvailable();

    const stages = [
        {
            subtitle: 'A point source fills the shared shell',
            apply: () => {
                app.shape = 'vv-oval';
                app.lightSourceMode = 'point';
                app.sourcePos = { x: 0, y: shellMidY };
                app.spread = 0.7;
                app.rayNumber = 160;
                app.MAX_BOUNCES = 8;
                app.useTrail = true;
            },
            textTime: 2600,
            simTime: 7000
        },
        {
            subtitle: 'Converge drives the beam toward the common focus',
            apply: () => {
                app.shape = 'vv-oval';
                app.lightSourceMode = 'converge';
                app.sourcePos = { x: 0, y: focusY };
                app.spread = 1.15;
                app.rayNumber = 240;
                app.MAX_BOUNCES = 10;
            },
            textTime: 2400,
            simTime: 8000
        },
        {
            subtitle: 'Off-focus target loosens the caustic and splits the flow',
            apply: () => {
                app.shape = 'vv-oval';
                app.lightSourceMode = 'converge';
                app.sourcePos = { x: 0, y: focusY * 0.52 };
                app.spread = 1.15;
                app.rayNumber = 240;
                app.MAX_BOUNCES = 10;
            },
            textTime: 2400,
            simTime: 8000
        }
    ];

    let stageIndex = 0;
    const runStage = () => {
        if (stageIndex >= stages.length) {
            finishSimulation(app);
            return;
        }

        const stage = stages[stageIndex];
        app.isLightVisible = false;
        app.isFlowing = false;
        clearScene(app);
        stage.apply();
        app.recalcParallelRange();
        document.querySelectorAll('.shape-tab').forEach((b) => b.classList.toggle('active', b.dataset.shape === app.shape));
        app.overlayMessage = ['Double Oval: Shared Foci, Split Light', stage.subtitle];
        UI.update(app);

        registerTimer(app, setTimeout(() => {
            clearScene(app);
            app.overlayMessage = null;
            app.growth = 0;
            app.isLightVisible = true;
            app.isFlowing = true;
            UI.update(app);

            registerTimer(app, setTimeout(() => {
                stageIndex++;
                runStage();
            }, stage.simTime));
        }, stage.textTime));
    };

    runStage();
}
