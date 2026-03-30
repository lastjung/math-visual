import { UIElements } from './elements.js';

export function setupControls(app, ui) {
    window.addEventListener('resize', () => app.resize());
    ui.setupApplePlayer(app);

    const distanceToSegment = (point, start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(point.x - start.x, point.y - start.y);

        const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lenSq));
        const projX = start.x + dx * t;
        const projY = start.y + dy * t;
        return Math.hypot(point.x - projX, point.y - projY);
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
        revolution: { speed: 0.1, min: -Math.PI, max: Math.PI, get: () => {
            const anchor = app.getActiveSourceAnchor();
            return Math.atan2(anchor.y, anchor.x);
        } },
        rotation: { speed: 0.15, min: -Math.PI, max: Math.PI, get: () => app.sourceRotation },
        density: { speed: 0.2, min: 20, max: 1000, get: () => app.rayNumber },
        speed: { speed: 0.1, min: 0, max: 100, get: () => app.raySpeed },
        spread: { speed: 0.15, min: 0, max: Math.PI * 2, get: () => app.spread },
        reflections: { speed: 0.1, min: 1, max: 20, get: () => app.MAX_BOUNCES }
    };

    const setAutoMode = (key, enabled) => {
        app.updateOption('autoMode', { key, value: enabled });
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
            app.updateOption('shape', nextShape); // Assuming we add 'shape' to updateOption
            UIElements.queryAll('.shape-tab').forEach((b) => b.classList.remove('active'));
            button.classList.add('active');
            ui.update(app);
        };
    });

    UIElements.queryAll('.mode-tab').forEach((btn) => {
        btn.onclick = (e) => {
            const button = e.currentTarget;
            app.updateOption('colorMode', button.dataset.mode);
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
        const anchor = app.getActiveSourceAnchor();
        const dist = Math.hypot(anchor.x, anchor.y);
        const nextPos = {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist
        };
        if (app.sourcePattern === 'single') app.updatePointer({ sourcePos: nextPos });
        else app.updatePointer({ sourceAnchorPos: nextPos });
        
        app.updateOption('autoMode', { key: 'revolution', value: false });
        ui.update(app);
    };

    const rangeRotation = UIElements.get('range-rotation');
    rangeRotation.oninput = (e) => {
        app.updateSlider('sourceRotation', parseFloat(e.target.value));
        ui.update(app);
    };

    const rangeDensity = UIElements.get('range-density');
    rangeDensity.oninput = (e) => {
        app.updateSlider('rayNumber', parseInt(e.target.value, 10));
        ui.update(app);
    };

    const rangeSpeed = UIElements.get('range-speed');
    rangeSpeed.oninput = (e) => {
        app.updateSlider('raySpeed', parseFloat(e.target.value));
        ui.update(app);
    };

    const rangeBeamWidth = UIElements.get('range-beam-width');
    if (rangeBeamWidth) {
        rangeBeamWidth.oninput = (e) => {
            app.updateSlider('beamWidth', parseFloat(e.target.value));
            ui.update(app);
        };
    }

    const rangeSpread = UIElements.get('range-spread');
    rangeSpread.oninput = (e) => {
        app.updateSlider('spread', parseFloat(e.target.value));
        ui.update(app);
    };

    const rangeReflections = UIElements.get('range-reflections');
    if (rangeReflections) {
        rangeReflections.oninput = (e) => {
            app.updateSlider('maxBounces', parseInt(e.target.value, 10));
            ui.update(app);
        };
    }

    const rangeAlpha = UIElements.get('range-alpha');
    if (rangeAlpha) {
        rangeAlpha.oninput = (e) => {
            app.updateSlider('alphaIntensity', parseFloat(e.target.value));
            ui.update(app);
        };
    }

    const rangeTriangleCount = UIElements.get('range-source-count');
    if (rangeTriangleCount) {
        rangeTriangleCount.oninput = (e) => {
            app.updateSlider('trianglePointCount', parseInt(e.target.value, 10));
            ui.update(app);
        };
    }

    const rangeTriangleBias = UIElements.get('range-source-bias');
    if (rangeTriangleBias) {
        rangeTriangleBias.oninput = (e) => {
            app.updateSlider('triangleVertexBias', parseFloat(e.target.value));
            ui.update(app);
        };
    }

    const checkAxes = UIElements.get('check-axes');
    if (checkAxes) {
        checkAxes.onchange = (e) => {
            app.updateOption('showAxes', e.target.checked);
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

    UIElements.queryAll('.shape-preset-btn').forEach((btn) => {
        btn.onclick = () => {
            const patternId = btn.dataset.patternId;
            if (patternId) {
                app.applyPattern(patternId);
                ui.update(app);
            }
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
            app.updateOption('currentNarrative', e.target.value);
            ui.update(app);
        };
    }

    UIElements.queryAll('#group-base .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.updateOption('baseStyle', e.target.dataset.value);
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-flow .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.updateOption('flowMode', e.target.dataset.value);
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-source-pattern .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            const nextPattern = e.currentTarget.dataset.value;
            app.updateOption('sourcePattern', nextPattern);

            if (!app.sourceOption) {
                app.applySourceOption('basic');
            }

            ui.update(app);
        };
    });

    UIElements.queryAll('#group-source-direction .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.updateOption('sourceDirection', e.target.dataset.value);
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-color-distribution .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.updateOption('colorDistribution', e.target.dataset.value);
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-source-single-option .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            const val = e.target.dataset.value;
            app.applySourceOption(val);
            ui.update(app);
        };
    });

    UIElements.queryAll('#group-source-mode .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.updateOption('lightSourceMode', e.target.dataset.value);
            ui.update(app);
        };
    });

    UIElements.get('check-trail').onchange = (e) => {
        app.updateOption('useTrail', e.target.checked);
        ui.update(app);
    };
    UIElements.get('check-taper').onchange = (e) => {
        app.updateOption('useTaper', e.target.checked);
        ui.update(app);
    };
    UIElements.get('check-bloom').onchange = (e) => {
        app.updateOption('useBloom', e.target.checked);
        ui.update(app);
    };

    UIElements.queryAll('#group-render-mode .mini-tab').forEach((btn) => {
        btn.onclick = (e) => {
            app.updateOption('renderMode', e.target.dataset.value);
            ui.update(app);
        };
    });

    const toggleFullscreen = () => {
        const prevSize = app.getShapeSize();
        const prevSourcePos = { ...app.sourcePos };
        const prevAnchorPos = { ...app.sourceAnchorPos };
        const prevDefault = app.getShapeDefaults(app.shape).sourcePos;
        const distToPrevDefault = Math.hypot(
            prevSourcePos.x - prevDefault.x,
            prevSourcePos.y - prevDefault.y
        );

        document.body.classList.toggle('window-full');
        app.updateOption('isWindowFull', document.body.classList.contains('window-full'));

        setTimeout(() => {
            app.resize();
            const nextSize = app.getShapeSize();
            const nextDefault = app.getShapeDefaults(app.shape).sourcePos;
            const scale = prevSize > 0 ? nextSize / prevSize : 1;
            const snapThreshold = Math.max(8, prevSize * 0.04);
            const nextSourcePos = (distToPrevDefault <= snapThreshold) 
                ? { ...nextDefault } 
                : { x: prevSourcePos.x * scale, y: prevSourcePos.y * scale };
            
            const pointerUpdate = {
                sourcePos: nextSourcePos,
                sourceAnchorPos: { x: prevAnchorPos.x * scale, y: prevAnchorPos.y * scale }
            };

            if (Array.isArray(app.triangleSourceOffsets)) {
                pointerUpdate.sourceOffsets = app.triangleSourceOffsets.map((offset) => ({
                    x: offset.x * scale,
                    y: offset.y * scale
                }));
            }

            app.updatePointer(pointerUpdate);

            app.sanitizeSourcePosition();
            if (app.isPaint2Mode || app.isLightMode) app.resetRays(false, false);
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
            app['4_ray_num_simm']();
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
            const nextVal = !app.autoModes[autoKey];
            app.updateOption('autoMode', { key: autoKey, value: nextVal });
            setAutoMode(autoKey, nextVal);
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
    let dragSourceIndex = -1;
    let dragSide = 0; // -1 for left edge, 1 for right edge
    let fixedEdgeAngle = 0;
    let pendingIncrementalRefresh = false;

    const handleInteraction = (e) => {
        const rect = app.canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : e.touches && e.touches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches && e.touches[0].clientY;
        if (clientX === undefined) return;

        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - (rect.height / 2 - 60);

        if (e.type === 'mousedown' || e.type === 'touchstart') {
            const anchor = app.getActiveSourceAnchor();
            const sX = anchor.x, sY = anchor.y;
            const distToCenter = Math.sqrt((x - sX) ** 2 + (y - sY) ** 2);
            
            // 1. Check for Move Handles
            if (distToCenter < 40) {
                isDragging = true; dragTarget = 'center';
            } else {
                // 2. Check for Vertex Bias Handles (Blue points)
                const size = app.getShapeSize();
                const origins = app.getTriangleSourceOrigins(size);
                for (let i = 0; i < origins.length; i++) {
                    const o = origins[i];
                    if (Math.sqrt((x - o.x) ** 2 + (y - o.y) ** 2) < 40) {
                        isDragging = true;
                        dragTarget = 'bias';
                        dragSourceIndex = i;
                        break;
                    }
                }
            }

            // 3. Check for Parallel side handles
            if (!isDragging && app.lightSourceMode === 'parallel') {
                const cosR = Math.cos(app.sourceRotation), sinR = Math.sin(app.sourceRotation);
                const { min, max } = app.parallelRange;
                const h1 = { x: sX + min * cosR, y: sY + min * sinR };
                const h2 = { x: sX + max * cosR, y: sY + max * sinR };
                if (Math.sqrt((x - h1.x) ** 2 + (y - h1.y) ** 2) < 35) {
                    isDragging = true;
                    dragTarget = 'min';
                } else if (Math.sqrt((x - h2.x) ** 2 + (y - h2.y) ** 2) < 35) {
                    isDragging = true;
                    dragTarget = 'max';
                }
            }

            // 4. Direct Beam Interaction
            if (!isDragging && app.isLightVisible && app.lightSourceMode !== 'parallel') {
                const size = app.getShapeSize();
                const beamLength = Math.max(40, Math.min(app.growth, size * 1.5));
                
                // Must match renderer's dynamic angle logic
                let centerAngle = app.getTriangleLaunchAngle(anchor, size, 0.5);
                if (app.lightSourceMode === 'converge') {
                    centerAngle += Math.PI;
                }

                const edgeA = centerAngle - app.spread / 2;
                const edgeB = centerAngle + app.spread / 2;
                const tipA = { x: sX + Math.cos(edgeA) * beamLength, y: sY + Math.sin(edgeA) * beamLength };
                const tipB = { x: sX + Math.cos(edgeB) * beamLength, y: sY + Math.sin(edgeB) * beamLength };

                const distA = Math.hypot(x - tipA.x, y - tipA.y);
                const distB = Math.hypot(x - tipB.x, y - tipB.y);

                if (distA < 40 || distB < 40) {
                    isDragging = true;
                    dragTarget = 'beam';
                    dragSide = distA < distB ? -1 : 1;
                    
                    // The anchor (side that stays fixed)
                    fixedEdgeAngle = centerAngle - (dragSide * app.spread / 2);
                }
            }

            if (isDragging) {
                app.updateOption('autoMode', { key: 'revolution', value: false });
                app.updateOption('autoMode', { key: 'rotation', value: false });
                if (e.cancelable) e.preventDefault();
            }
        } else if (isDragging && (e.type === 'mousemove' || e.type === 'touchmove')) {
            const anchor = app.getActiveSourceAnchor();
            const sX = anchor.x, sY = anchor.y;
            if (dragTarget === 'center') {
                if (app.sourcePattern === 'single') app.updatePointer({ sourcePos: { x, y } });
                else app.updatePointer({ sourceAnchorPos: { x, y } });
            } else if (dragTarget === 'bias') {
                const size = app.getShapeSize();
                const baseOrigins = app.getTriangleBaseOrigins(size);
                const baseOrigin = baseOrigins[dragSourceIndex];
                if (baseOrigin) {
                    const nextOffsets = Array.from({ length: baseOrigins.length }, (_, index) => {
                        const offset = app.triangleSourceOffsets[index];
                        return offset && typeof offset.x === 'number' && typeof offset.y === 'number'
                            ? { x: offset.x, y: offset.y }
                            : { x: 0, y: 0 };
                    });
                    nextOffsets[dragSourceIndex] = {
                        x: x - baseOrigin.x,
                        y: y - baseOrigin.y
                    };
                    app.updatePointer({ sourceOffsets: nextOffsets });
                }
            } else if (dragTarget === 'beam') {
                const mouseAngle = Math.atan2(y - sY, x - sX);
                const fixedEdge = fixedEdgeAngle;
                
                // Calculate gap from fixed edge to mouse
                let gap = mouseAngle - fixedEdge;
                while (gap > Math.PI) gap -= Math.PI * 2;
                while (gap < -Math.PI) gap += Math.PI * 2;

                // Spread is the absolute magnitude of the gap
                const finalSpread = Math.max(0.01, Math.min(Math.PI * 2 - 0.02, Math.abs(gap)));
                // Center is exactly between fixed edge and mouse
                const newCenter = fixedEdge + (gap / 2);

                const size = app.getShapeSize();
                const currentRotation = app.sourceRotation;
                // Calculate the 'static' part of the launch angle without current rotation
                const baseAngle = app.getTriangleLaunchAngle(anchor, size, 0.5) - currentRotation;
                
                // Target rotation is the offset needed to reach 'newCenter'
                let targetRotation = newCenter - baseAngle;
                if (app.lightSourceMode === 'converge') targetRotation -= Math.PI;
                
                while (targetRotation > Math.PI) targetRotation -= Math.PI * 2;
                while (targetRotation < -Math.PI) targetRotation += Math.PI * 2;

                app.updateSlider('sourceRotation', targetRotation);
                app.updateSlider('spread', finalSpread);
            } else {
                const dx = x - sX, dy = y - sY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                if (dragTarget === 'min') {
                    app.updatePointer({ 
                        parallelRange: { ...app.parallelRange, min: -dist } 
                    });
                    app.updateSlider('sourceRotation', angle + Math.PI);
                } else if (dragTarget === 'max') {
                    app.updatePointer({ 
                        parallelRange: { ...app.parallelRange, max: dist } 
                    });
                    app.updateSlider('sourceRotation', angle);
                }
            }
            ui.update(app);
            if (typeof app.persistState === 'function') app.persistState();
        }
    };

    const stopDragging = () => {
        isDragging = false;
        dragSourceIndex = -1;
    };

    app.canvas.addEventListener('mousedown', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('mouseup', stopDragging);
    app.canvas.addEventListener('touchstart', handleInteraction, { passive: false });
    window.addEventListener('touchmove', handleInteraction, { passive: false });
    window.addEventListener('touchend', stopDragging);
}
