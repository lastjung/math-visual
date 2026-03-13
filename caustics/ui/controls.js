import { UIElements } from './elements.js';

export function setupControls(app, ui) {
    window.addEventListener('resize', () => app.resize());
    ui.setupApplePlayer(app);

    const refreshIncrementalModes = () => {
        if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
    };

    const autoLabels = {
        'label-revolution': 'revolution',
        'label-rotation': 'rotation',
        'label-density': 'density',
        'label-speed': 'speed',
        'label-spread': 'spread',
        'label-reflections': 'reflections'
    };

    const config = {
        revolution: { speed: 0.1, min: -Math.PI, max: Math.PI, get: () => Math.atan2(app.sourcePos.y, app.sourcePos.x) },
        rotation: { speed: 0.15, min: -Math.PI, max: Math.PI, get: () => app.sourceRotation },
        density: { speed: 0.2, min: 20, max: 1000, get: () => app.rayNumber },
        speed: { speed: 0.1, min: 0, max: 100, get: () => app.raySpeed },
        spread: { speed: 0.15, min: 0, max: Math.PI * 2, get: () => app.spread },
        reflections: { speed: 0.1, min: 1, max: 20, get: () => app.MAX_BOUNCES }
    };

    const setAutoMode = (key, enabled) => {
        app.autoModes[key] = enabled;
        if (!enabled) return;
        const cfg = config[key];
        const current = cfg.get();
        const norm = (current - cfg.min) / (cfg.max - cfg.min);
        const targetSin = Math.max(-1, Math.min(1, (norm - 0.5) * 2));
        app.autoPhases[key] = Math.asin(targetSin) - app.autoTimer * cfg.speed;
    };

    UIElements.queryAll('.shape-tab').forEach((btn) => {
        btn.onclick = (e) => {
            const button = e.currentTarget;
            const nextShape = button.dataset.shape;
            app.shape = nextShape;
            UIElements.queryAll('.shape-tab').forEach((b) => b.classList.remove('active'));
            button.classList.add('active');
            app.applyShapeSwitchReset(nextShape);
            ui.update(app);
        };
    });

    UIElements.queryAll('.mode-tab').forEach((btn) => {
        btn.onclick = (e) => {
            const button = e.currentTarget;
            app.colorMode = button.dataset.mode;
            UIElements.queryAll('.mode-tab').forEach((b) => b.classList.remove('active'));
            button.classList.add('active');
        };
    });

    Object.entries(autoLabels).forEach(([id, key]) => {
        const el = UIElements.get(id);
        if (!el) return;
        el.onclick = () => {
            setAutoMode(key, !app.autoModes[key]);
            ui.update(app);
        };
    });

    const rangeSource = UIElements.get('range-source');
    rangeSource.oninput = (e) => {
        const angle = parseFloat(e.target.value);
        const dist = Math.sqrt(app.sourcePos.x ** 2 + app.sourcePos.y ** 2);
        app.sourcePos = {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist
        };
        app.autoModes.revolution = false;
        refreshIncrementalModes();
        ui.update(app);
    };

    const rangeRotation = UIElements.get('range-rotation');
    rangeRotation.oninput = (e) => {
        app.sourceRotation = parseFloat(e.target.value);
        refreshIncrementalModes();
        ui.update(app);
    };

    const rangeDensity = UIElements.get('range-density');
    rangeDensity.oninput = (e) => {
        app.rayNumber = parseInt(e.target.value, 10);
        app.autoModes.density = false;
        refreshIncrementalModes();
        ui.update(app);
    };

    const rangeSpeed = UIElements.get('range-speed');
    rangeSpeed.oninput = (e) => {
        app.raySpeed = parseFloat(e.target.value);
        app.autoModes.speed = false;
        ui.update(app);
    };

    const rangeBeamWidth = UIElements.get('range-beam-width');
    if (rangeBeamWidth) {
        rangeBeamWidth.oninput = (e) => {
            app.beamWidth = parseFloat(e.target.value);
            ui.update(app);
        };
    }

    const rangeSpread = UIElements.get('range-spread');
    rangeSpread.oninput = (e) => {
        app.spread = parseFloat(e.target.value);
        app.autoModes.spread = false;
        refreshIncrementalModes();
        ui.update(app);
    };

    const rangeReflections = UIElements.get('range-reflections');
    if (rangeReflections) {
        rangeReflections.oninput = (e) => {
            app.MAX_BOUNCES = parseInt(e.target.value, 10);
            app.autoModes.reflections = false;
            ui.update(app);
        };
    }

    const rangeAlpha = UIElements.get('range-alpha');
    if (rangeAlpha) {
        rangeAlpha.oninput = (e) => {
            app.alphaIntensity = parseFloat(e.target.value);
            ui.update(app);
        };
    }

    const rangeTriangleCount = UIElements.get('range-triangle-count');
    if (rangeTriangleCount) {
        rangeTriangleCount.oninput = (e) => {
            app.trianglePointCount = parseInt(e.target.value, 10);
            refreshIncrementalModes();
            ui.update(app);
        };
    }

    const rangeTriangleBias = UIElements.get('range-triangle-bias');
    if (rangeTriangleBias) {
        rangeTriangleBias.oninput = (e) => {
            app.triangleVertexBias = parseFloat(e.target.value);
            refreshIncrementalModes();
            ui.update(app);
        };
    }

    const checkAxes = UIElements.get('check-axes');
    if (checkAxes) {
        checkAxes.onchange = (e) => {
            app.showAxes = e.target.checked;
            ui.update(app);
        };
    }

    const btnFoci = UIElements.get('btn-foci-sync');
    if (btnFoci) {
        btnFoci.onclick = () => {
            app.syncSourceToFoci();
            ui.update(app);
        };
    }

    UIElements.queryAll('[data-preset-slot]').forEach((btn) => {
        btn.onclick = () => {
            const slot = parseInt(btn.dataset.presetSlot, 10);
            ui.applyShapePreset(app, slot);
        };
    });

    UIElements.queryAll('[data-accordion-toggle]').forEach((btn) => {
        btn.onclick = () => {
            const key = btn.dataset.accordionToggle;
            const section = document.querySelector(`[data-accordion-section="${key}"]`);
            if (section) section.classList.toggle('is-open');
        };
    });

    const selectNarrative = UIElements.get('select-narrative');
    if (selectNarrative) {
        selectNarrative.onchange = (e) => {
            app.currentNarrative = e.target.value;
            app.persistState();
            ui.update(app);
        };
    }

    UIElements.queryAll('#group-base .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.baseStyle = e.target.dataset.value;
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-flow .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.flowMode = e.target.dataset.value;
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-triangle-source .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.triangleSourceMode = e.target.dataset.value;
            refreshIncrementalModes();
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-triangle-direction .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.triangleDirectionMode = e.target.dataset.value;
            refreshIncrementalModes();
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-source-mode .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.lightSourceMode = e.target.dataset.value;
            app.normalizeLightSourceMode();
            if (app.shape === 'parabola' && app.lightSourceMode === 'point') {
                app.sourcePos = app.getShapeDefaults('parabola').sourcePos;
            }
            refreshIncrementalModes();
            ui.update(app);
        };
    });

    UIElements.get('check-trail').onchange = (e) => {
        app.useTrail = e.target.checked;
        ui.update(app);
    };
    UIElements.get('check-taper').onchange = (e) => {
        app.useTaper = e.target.checked;
        ui.update(app);
    };
    UIElements.get('check-bloom').onchange = (e) => {
        app.useBloom = e.target.checked;
        ui.update(app);
    };

    UIElements.queryAll('#group-render-mode .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            const val = e.target.dataset.value;
            app.isPaintMode = val === 'paint1';
            app.isPaint2Mode = val === 'paint2';
            app.isLightMode = val === 'light';
            app.normalizeLightSourceMode();
            if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
            ui.update(app);
        };
    });

    const toggleFullscreen = () => {
        const prevSize = app.getShapeSize();
        const prevSourcePos = { ...app.sourcePos };
        const prevDefault = app.getShapeDefaults(app.shape).sourcePos;
        const distToPrevDefault = Math.hypot(
            prevSourcePos.x - prevDefault.x,
            prevSourcePos.y - prevDefault.y
        );

        document.body.classList.toggle('window-full');
        app.isWindowFull = document.body.classList.contains('window-full');

        setTimeout(() => {
            app.resize();
            const nextSize = app.getShapeSize();
            const nextDefault = app.getShapeDefaults(app.shape).sourcePos;
            const scale = prevSize > 0 ? nextSize / prevSize : 1;
            const snapThreshold = Math.max(8, prevSize * 0.04);

            if (distToPrevDefault <= snapThreshold) {
                app.sourcePos = { ...nextDefault };
            } else {
                app.sourcePos = {
                    x: prevSourcePos.x * scale,
                    y: prevSourcePos.y * scale
                };
            }

            app.sanitizeSourcePosition();
            refreshIncrementalModes();
            ui.update(app);
        }, 60);
    };

    const btnWindowFull = UIElements.get('apple-fullscreen');
    if (btnWindowFull) {
        btnWindowFull.onclick = () => toggleFullscreen();
    }

    const btnSideToggle = UIElements.get('apple-sidebar-toggle');
    if (btnSideToggle) {
        btnSideToggle.onclick = () => {
            const rightSidebar = UIElements.get('right-sidebar');
            const leftSidebar = UIElements.get('left-sidebar');
            if (rightSidebar) rightSidebar.classList.toggle('hidden');
            if (leftSidebar) leftSidebar.classList.toggle('hidden');
            app.resize();
        };
    }

    const keyMap = {
        Digit1: 'revolution',
        Digit2: 'rotation',
        Digit3: 'spread',
        Digit4: 'density',
        Digit5: 'speed',
        Digit6: 'reflections'
    };
    let sHeld = false;
    let aHeld = false;

    window.addEventListener('keydown', (e) => {
        const target = e.target;
        const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (isTyping) return;

        if (e.key === 'Escape') {
            const rightSidebar = UIElements.get('right-sidebar');
            const leftSidebar = UIElements.get('left-sidebar');
            if (rightSidebar) rightSidebar.classList.remove('hidden');
            if (leftSidebar) leftSidebar.classList.remove('hidden');
            if (document.body.classList.contains('window-full')) toggleFullscreen();
            return;
        }

        if (e.code === 'KeyS') {
            sHeld = true;
            return;
        }
        if (e.code === 'KeyA') {
            aHeld = true;
            return;
        }

        if (aHeld && e.code === 'Digit3') {
            e.preventDefault();
            app['3_beam_spread_simm']();
            return;
        }
        if (aHeld && e.code === 'Digit4') {
            e.preventDefault();
            app['4_ray_mum_simm']();
            return;
        }
        if (aHeld && e.code === 'Digit0') {
            e.preventDefault();
            app.startA0Simulation();
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            app.toggleFlow();
            return;
        }

        const autoKey = keyMap[e.code];
        if (autoKey && sHeld) {
            e.preventDefault();
            app.autoModes[autoKey] = !app.autoModes[autoKey];
            setAutoMode(autoKey, app.autoModes[autoKey]);
            ui.update(app);
            return;
        }

        if (e.code === 'ArrowLeft' && e.shiftKey) {
            e.preventDefault();
            app.reset();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyS') sHeld = false;
        if (e.code === 'KeyA') aHeld = false;
    });

    let isDragging = false;
    let dragTarget = 'center';

    const handleInteraction = (e) => {
        const rect = app.canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches && e.touches[0].clientY;
        if (clientX === undefined) return;

        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - (rect.height / 2 - 60);

        if (e.type === 'mousedown' || e.type === 'touchstart') {
            const sX = app.sourcePos.x;
            const sY = app.sourcePos.y;

            if (app.lightSourceMode === 'parallel') {
                const cosR = Math.cos(app.sourceRotation);
                const sinR = Math.sin(app.sourceRotation);
                const { min, max } = app.parallelRange;
                const h1 = { x: sX + min * cosR, y: sY + min * sinR };
                const h2 = { x: sX + max * cosR, y: sY + max * sinR };
                const d0 = Math.sqrt((x - sX) ** 2 + (y - sY) ** 2);
                const d1 = Math.sqrt((x - h1.x) ** 2 + (y - h1.y) ** 2);
                const d2 = Math.sqrt((x - h2.x) ** 2 + (y - h2.y) ** 2);

                if (d1 < 30) {
                    isDragging = true;
                    dragTarget = 'min';
                } else if (d2 < 30) {
                    isDragging = true;
                    dragTarget = 'max';
                } else if (d0 < 40) {
                    isDragging = true;
                    dragTarget = 'center';
                }
            } else {
                const d0 = Math.sqrt((x - sX) ** 2 + (y - sY) ** 2);
                if (d0 < 50) {
                    isDragging = true;
                    dragTarget = 'center';
                }
            }

            if (isDragging) {
                app.autoModes.revolution = false;
                app.autoModes.rotation = false;
                if (e.cancelable) e.preventDefault();
            }
        } else if (isDragging && (e.type === 'mousemove' || e.type === 'touchmove')) {
            if (dragTarget === 'center') {
                app.sourcePos = { x, y };
            } else {
                const dx = x - app.sourcePos.x;
                const dy = y - app.sourcePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dragTarget === 'min') {
                    app.parallelRange.min = -dist;
                    app.sourceRotation = Math.atan2(-dy, -dx);
                } else if (dragTarget === 'max') {
                    app.parallelRange.max = dist;
                    app.sourceRotation = Math.atan2(dy, dx);
                }
            }
            refreshIncrementalModes();
            ui.update(app);
        }
    };

    const stopDragging = () => {
        isDragging = false;
    };

    app.canvas.addEventListener('mousedown', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('mouseup', stopDragging);
    app.canvas.addEventListener('touchstart', handleInteraction, { passive: false });
    window.addEventListener('touchmove', handleInteraction, { passive: false });
    window.addEventListener('touchend', stopDragging);
}
