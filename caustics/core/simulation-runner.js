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
        app.isLightVisible = true; 
        app.isFlowing = false;
        
        // Restore snapshot if available
        if (app._simSnapshot) {
            app.applyScene(app._simSnapshot);
            app._simSnapshot = null;
        }
        
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
    
    // Restore snapshot if available (Manually stopped)
    if (app._simSnapshot) {
        app.applyScene(app._simSnapshot);
        app._simSnapshot = null;
    }
    
    if (window.audioManager) window.audioManager.pause();
    UI.update(app);
}

export function startA0Simulation(app) {
    if (app.isSimRunning) {
        stopSimulation(app);
        return;
    }

    const method = `${app.shape.replace(/-/g, '_')}_A0_simm`;
    if (typeof app[method] === 'function') {
        app[method]();
    } else {
        console.warn(`No A0 simulation defined for ${app.shape}, falling back to universal.`);
        app.runUniversalJourneySimulation();
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
    app.isSimulationMode = true;
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
            app.updateSlider('spread', radVal, false);
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
    app.isSimulationMode = true;
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

        if (currentIdx === 0) {
            app.overlayMessage = currentNarrative
                ? [currentNarrative, `Ray Num Study (${val} Rays)`]
                : `Ray Num Study (${val} Rays)`;
        } else {
            app.overlayMessage = `${val} Rays`;
        }
        UI.update(app);

        const textTime = currentIdx === 0 ? 3000 : 2000;
        registerTimer(app, setTimeout(() => {
            clearScene(app);
            app.overlayMessage = null;
            app.updateSlider('rayNumber', val, false);
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
        { subtitle: 'Side Scan', patternId: 'side-scan', duration: 25000, speed: 20 },
        { subtitle: 'Vertical Equilibrium: The Top Bounce', patternId: 'top-bounce', duration: 10000, speed: 15 },
        { subtitle: 'Corner Geometry: The Vertex Echo', patternId: 'corner-echo', duration: 10000, speed: 15 }
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
        app.applyPattern(stage.patternId);
        app.updateSlider('raySpeed', stage.speed, false);
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
                app.updateOption('lightSourceMode', 'point');
                app.updatePointer({ sourcePos: { ...defaults.sourcePos } });
                app.updateSlider('spread', 0.5, false);
                app.updateSlider('rayNumber', 100, false);
                app.updateSlider('maxBounces', 6, false);
                app.updateOption('renderMode', 'paint1');
            },
            textTime: 2500,
            simTime: 8000
        },
        {
            subtitle: 'Parallel Expansion: Sweeping the Perimeter',
            apply: () => {
                app.updateOption('lightSourceMode', 'parallel');
                app.updateSlider('rayNumber', 200, false);
                app.updateSlider('maxBounces', 12, false);
                app.updateOption('autoMode', { key: 'revolution', value: true });
                app.updateOption('useTrail', true);
            },
            textTime: 2500,
            simTime: 12000
        },
        {
            subtitle: 'Geometric Convergence: Finding the Focus',
            apply: () => {
                app.updateOption('autoMode', { key: 'revolution', value: false });
                app.updateOption('lightSourceMode', 'converge');
                app.updatePointer({ sourcePos: { ...defaults.sourcePos } });
                app.updateSlider('spread', 1.2, false);
                app.updateSlider('rayNumber', 400, false);
                app.updateSlider('maxBounces', 15, false);
                app.updateOption('renderMode', 'paint2');
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
                app.updateOption('shape', 'vv-oval');
                app.updateOption('lightSourceMode', 'point');
                app.updatePointer({ sourcePos: { x: 0, y: shellMidY } });
                app.updateSlider('spread', 0.7, false);
                app.updateSlider('rayNumber', 160, false);
                app.updateSlider('maxBounces', 8, false);
                app.updateOption('useTrail', true);
            },
            textTime: 2600,
            simTime: 7000
        },
        {
            subtitle: 'Converge drives the beam toward the common focus',
            apply: () => {
                app.updateOption('shape', 'vv-oval');
                app.updateOption('lightSourceMode', 'converge');
                app.updatePointer({ sourcePos: { x: 0, y: focusY } });
                app.updateSlider('spread', 1.15, false);
                app.updateSlider('rayNumber', 240, false);
                app.updateSlider('maxBounces', 10, false);
            },
            textTime: 2400,
            simTime: 8000
        },
        {
            subtitle: 'Off-focus target loosens the caustic and splits the flow',
            apply: () => {
                app.updateOption('shape', 'vv-oval');
                app.updateOption('lightSourceMode', 'converge');
                app.updatePointer({ sourcePos: { x: 0, y: focusY * 0.52 } });
                app.updateSlider('spread', 1.15, false);
                app.updateSlider('rayNumber', 240, false);
                app.updateSlider('maxBounces', 10, false);
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

export function runTriangleA0Simulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    app.isSimulationMode = true;
    resumeAudioIfAvailable();

    const stages = [
        {
            subtitle: 'Periodic Orbit: The Median Loop',
            apply: () => {
                app.applyPattern('center-path');
                app.updateOption('renderMode', 'flow');
                app.updateOption('flowMode', 'none');
                app.updateSlider('rayNumber', 72, false);
                app.updateSlider('spread', 0.08, false);
                app.updateSlider('sourceRotation', 0, false);
                app.updateSlider('raySpeed', 9, false);
                app.updateSlider('maxBounces', 18, false);
            },
            duration: 11000
        },
        {
            subtitle: 'Edge Family: Parallel Side Sweep',
            apply: () => {
                app.applyPattern('edge-sweep');
                app.updateOption('renderMode', 'paint1');
                app.updateOption('flowMode', 'none');
                app.updateSlider('rayNumber', 280, false);
                app.updateSlider('spread', 0, false);
                app.updateSlider('raySpeed', 16, false);
                app.updateSlider('maxBounces', 12, false);
            },
            duration: 14000
        },
        {
            subtitle: 'Vertex Instability: Grazing the Corner',
            apply: () => {
                app.applyPattern('vertex-graze');
                app.updateOption('renderMode', 'flow');
                app.updateOption('flowMode', 'pulse');
                app.updateSlider('rayNumber', 120, false);
                app.updateSlider('spread', 0.12, false);
                app.updateSlider('raySpeed', 13, false);
                app.updateSlider('maxBounces', 16, false);
            },
            duration: 11000
        },
        {
            subtitle: 'Three-Fold Symmetry: Vertex Normals',
            apply: () => {
                app.applyPattern('triad-edge');
                app.updateOption('renderMode', 'paint2');
                app.updateOption('flowMode', 'none');
                app.updateSlider('rayNumber', 240, false);
                app.updateSlider('spread', Math.PI / 7, false);
                app.updateSlider('raySpeed', 12, false);
                app.updateSlider('maxBounces', 10, false);
            },
            duration: 15000
        }
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
        stage.apply();
        app.overlayMessage = idx === 0 ? ['Triangle A0', stage.subtitle] : stage.subtitle;
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
export function runVOvalA0Simulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    app.isSimulationMode = true;
    resumeAudioIfAvailable();

    const sizeMult = app.isWindowFull ? 0.45 : 0.35;
    const size = Math.min(app.canvas.width, app.canvas.height) * sizeMult;
    const fDist = size * 0.6324;
    const midY = -0.816 * size;

    app._simSnapshot = app.readCurrentScene();

    const stages = [
        {
            subtitle: '1. Upper Focus: Focal Convergence',
            apply: () => {
                app.updatePointer({ sourcePos: { x: 0, y: -fDist } });
                app.updateOption('autoMode', { key: 'rotation', value: true });
                app.updateOption('autoMode', { key: 'spread', value: true });
                app.updateSlider('sourceRotation', 100 * Math.PI / 180, false);
                app.updateSlider('maxBounces', 500, false); 
            },
            duration: 20000 
        },
        {
            subtitle: '2. Out of Focus: Orbital Resonance',
            apply: () => {
                app.updatePointer({ sourcePos: { x: 0, y: midY } });
                app.updateSlider('maxBounces', 500, false);
                app.updateSlider('sourceRotation', 100 * Math.PI / 180, false);
                app.updateOption('autoMode', { key: 'rotation', value: false });
                app.updateOption('autoMode', { key: 'spread', value: false });
            },
            duration: 24000
        },
        {
            subtitle: '3. Focus In: Core Resonance',
            apply: () => {
                app.updatePointer({ sourcePos: { x: 0, y: -fDist * 0.5 } });
                app.updateSlider('maxBounces', 500, false);
                app.updateSlider('sourceRotation', 100 * Math.PI / 180, false);
                app.updateOption('autoMode', { key: 'rotation', value: false });
                app.updateOption('autoMode', { key: 'spread', value: false });
            },
            duration: 24000
        }
    ];

    let idx = 0;
    const runStage = () => {
        if (idx >= stages.length) { finishSimulation(app); return; }
        const stage = stages[idx];
        clearScene(app);
        
        // Restore from base snapshot before each stage to ensure independence
        if (app._simSnapshot) {
            app.applyScene(app._simSnapshot);
        }
        
        app.isLightVisible = false;
        app.isFlowing = false;
        stage.apply();
        app.overlayMessage = idx === 0 ? ['Vertical Oval Simulation', stage.subtitle] : stage.subtitle;
        UI.update(app);
        registerTimer(app, setTimeout(() => {
            app.overlayMessage = null; app.growth = 0; app.isLightVisible = true; app.isFlowing = true; UI.update(app);
            registerTimer(app, setTimeout(() => { idx++; runStage(); }, stage.duration));
        }, 4000));
    };
    runStage();
}

export function runEllipseA0Simulation(app) {
    if (app.isSimRunning) return;
    app.isSimRunning = true;
    app.isSimulationMode = true;
    resumeAudioIfAvailable();

    const sizeMult = app.isWindowFull ? 0.45 : 0.35;
    const size = Math.min(app.canvas.width, app.canvas.height) * sizeMult;
    const fDist = size * 0.88;
    const midX = -0.99 * size;

    app._simSnapshot = app.readCurrentScene();

    const stages = [
        {
            subtitle: '1. Primary Focus: Study of Convergence',
            apply: () => {
                app.updateOption('sourcePattern', 'single');
                app.updatePointer({ sourcePos: { x: -fDist, y: 0 } });
                app.updateSlider('spread', 0.5, false);
                app.updateOption('autoMode', { key: 'rotation', value: true });
            },
            duration: 20000
        },
        {
            subtitle: '2. Boundary Study: The Long Echo',
            apply: () => {
                app.updatePointer({ sourcePos: { x: midX, y: 0 } });
                app.updateSlider('spread', 0, false);
                app.updateSlider('rayNumber', 1, false);
                app.updateSlider('maxBounces', 100, false);
                app.updateSlider('raySpeed', 60, false);
                app.updateOption('autoMode', { key: 'rotation', value: false });
            },
            duration: 24000
        },
        {
            subtitle: '3. Depth Scan: Focus-Center Midpoint',
            apply: () => {
                app.updatePointer({ sourcePos: { x: -fDist * 0.5, y: 0 } });
                app.updateSlider('spread', 0, false);
                app.updateSlider('rayNumber', 1, false);
                app.updateSlider('maxBounces', 100, false);
                app.updateSlider('raySpeed', 60, false);
                app.updateOption('autoMode', { key: 'rotation', value: false });
            },
            duration: 24000
        }
    ];

    let idx = 0;
    const runStage = () => {
        if (idx >= stages.length) { finishSimulation(app); return; }
        const stage = stages[idx];
        clearScene(app);
        
        // Restore from base snapshot before each stage
        if (app._simSnapshot) {
            app.applyScene(app._simSnapshot);
        }
        
        app.isLightVisible = false;
        app.isFlowing = false;
        stage.apply();
        app.overlayMessage = idx === 0 ? ['Ellipse Study Simulation', stage.subtitle] : stage.subtitle;
        UI.update(app);
        registerTimer(app, setTimeout(() => {
            app.overlayMessage = null; app.growth = 0; app.isLightVisible = true; app.isFlowing = true; UI.update(app);
            registerTimer(app, setTimeout(() => { idx++; runStage(); }, stage.duration));
        }, 4000));
    };
    runStage();
}
