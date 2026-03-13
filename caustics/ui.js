/**
 * LIGHT FLOW LAB: UI Module
 * Handles event listeners and UI updates
 */

export const UI = {
    trianglePanelContent(app, baseContent) {
        const sourceLabels = {
            single: 'Single Point',
            triad: 'Vertex Triad',
            strip: 'Source Strip'
        };
        const directionLabels = {
            parallel: 'Parallel',
            inward: 'Inward',
            outward: 'Outward',
            'edge-normal': 'Edge Normal'
        };

        if (app.triangleSourceMode === 'single') {
            return {
                ...baseContent,
                meta: 'Single Point',
                cardTitle: 'Single Emitter',
                cardCopy: 'One source follows the main grip, so this is the cleanest mode for reading periodic paths.',
                note: 'Tip: use the grip for angle tuning, then add spread to widen the family of reflections.'
            };
        }

        return {
            ...baseContent,
            meta: `${sourceLabels[app.triangleSourceMode] || 'Multi Source'} / ${directionLabels[app.triangleDirectionMode] || 'Parallel'}`,
            cardTitle: `${sourceLabels[app.triangleSourceMode] || 'Multi Source'} Layout`,
            cardCopy: app.triangleDirectionMode === 'edge-normal'
                ? 'Sources are aligned by the nearest edge normal, which usually gives the cleanest triangular caustic structure.'
                : app.triangleDirectionMode === 'inward'
                    ? 'Each source is aimed toward the triangle center, which emphasizes convergence and interior crossings.'
                    : app.triangleDirectionMode === 'outward'
                        ? 'Each source points away from the center, producing more explosive edge-first reflections.'
                        : 'All sources share the same launch direction, so the whole pattern reads like one coordinated beam field.',
            note: app.triangleSourceMode === 'triad'
                ? 'Tip: triad is locked to the three vertices, so direction mode makes the biggest visual difference here.'
                : 'Tip: strip uses point count and vertex bias together, so increase count first and then tune the spread.'
        };
    },

    shapePresets(app) {
        const size = app.getShapeSize();
        return {
            circle: [
                { label: 'Center Orbit', note: 'A compact point-source setup for finding stable circular loops.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.62 }, spread: 0.35, lightSourceMode: 'point' }) },
                { label: 'Wide Sweep', note: 'Push the source off-center and widen the fan to compare dense and sparse returns.', apply: () => ({ sourcePos: { x: -size * 0.4, y: -size * 0.2 }, spread: 1.4, lightSourceMode: 'point' }) },
                { label: 'Parallel Wash', note: 'A clean parallel pass across the circle for smooth, even interference bands.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.75 }, sourceRotation: 0, lightSourceMode: 'parallel', spread: 0 }) }
            ],
            rect: [
                { label: 'Top Bounce', note: 'A centered top shot that makes the rectangular rhythm easy to read.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.9 }, spread: 0.2, lightSourceMode: 'point' }) },
                { label: 'Side Scan', note: 'A lateral sweep that highlights alternating wall impacts and corridor patterns.', apply: () => ({ sourcePos: { x: -size * 0.62, y: 0 }, sourceRotation: -Math.PI / 2, spread: 0.8, lightSourceMode: 'parallel' }) },
                { label: 'Corner Echo', note: 'Start near a corner to emphasize abrupt redirection and long zigzag returns.', apply: () => ({ sourcePos: { x: -size * 0.55, y: -size * 0.55 }, spread: 0.55, lightSourceMode: 'point' }) }
            ],
            'v-oval': [
                { label: 'Upper Focus', note: 'Lock to the top focus to show the vertical oval’s strongest return path.', apply: () => ({ sourcePos: { ...app.getShapeDefaults('v-oval').sourcePos }, spread: 0.35, lightSourceMode: 'point' }) },
                { label: 'Tall Sweep', note: 'Parallel light down the long axis produces a clean column of reflections.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.58 }, sourceRotation: 0, lightSourceMode: 'parallel', spread: 0 }) },
                { label: 'Soft Fan', note: 'A wider fan exposes how the tall oval compresses vertical trajectories.', apply: () => ({ sourcePos: { x: size * 0.18, y: -size * 0.2 }, spread: 1.2, lightSourceMode: 'point' }) }
            ],
            'vv-oval': [
                { label: 'Shared Foci', note: 'Start from the shared focus line to reveal the dual-shell structure clearly.', apply: () => ({ sourcePos: { ...app.getShapeDefaults('vv-oval').sourcePos }, spread: 0.35, lightSourceMode: 'point' }) },
                { label: 'Split Sweep', note: 'A parallel sweep helps separate the outer and inner channels visually.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.54 }, sourceRotation: 0, lightSourceMode: 'parallel', spread: 0 }) },
                { label: 'Inner Echo', note: 'Offset the source slightly to encourage jumps between the two boundaries.', apply: () => ({ sourcePos: { x: size * 0.14, y: -size * 0.08 }, spread: 1.0, lightSourceMode: 'point' }) }
            ],
            ellipse: [
                { label: 'Focus Lock', note: 'Use the classic focus-to-focus property as the cleanest ellipse demonstration.', apply: () => ({ sourcePos: { ...app.getShapeDefaults('ellipse').sourcePos }, spread: 0.45, lightSourceMode: 'point' }) },
                { label: 'Cross Sweep', note: 'A perpendicular sweep across the ellipse shows strong compression across the minor axis.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.36 }, sourceRotation: Math.PI / 2, lightSourceMode: 'parallel', spread: 0 }) },
                { label: 'Wide Return', note: 'A wider point source reveals how broad bundles still gather toward the paired focus.', apply: () => ({ sourcePos: { x: -size * 0.5, y: 0 }, spread: 1.2, lightSourceMode: 'point' }) }
            ],
            parabola: [
                { label: 'Focus Beam', note: 'The cleanest parabola scene: point source at the focus, tight outgoing bundle.', apply: () => ({ sourcePos: { ...app.getShapeDefaults('parabola').sourcePos }, spread: 0.35, lightSourceMode: 'point' }) },
                { label: 'Broad Exit', note: 'Increase spread at the focus to show how the reflector straightens a larger family.', apply: () => ({ sourcePos: { ...app.getShapeDefaults('parabola').sourcePos }, spread: 1.4, lightSourceMode: 'point' }) },
                { label: 'Edge Skim', note: 'Offset the source to compare clean focus behavior against skewed reflections.', apply: () => ({ sourcePos: { x: size * 0.35, y: size * 0.4 }, spread: 0.5, lightSourceMode: 'point' }) }
            ],
            cardioid: [
                { label: 'Left Fold', note: 'A safe starting angle for reading the cardioid’s folded interior.', apply: () => ({ sourcePos: { x: -size * 0.24, y: 0 }, spread: 0.45, lightSourceMode: 'point' }) },
                { label: 'Cusp Scan', note: 'Move toward the cusp to trigger sharper redirection and denser interior overlaps.', apply: () => ({ sourcePos: { x: size * 0.08, y: -size * 0.12 }, spread: 1.1, lightSourceMode: 'point' }) },
                { label: 'Paint Sweep', note: 'A paint-focused setup that accumulates the folded caustic layers over time.', apply: () => ({ sourcePos: { x: -size * 0.16, y: size * 0.06 }, spread: 0.9, lightSourceMode: 'point', isPaint2Mode: true, isPaintMode: false, isLightMode: false }) }
            ],
            triangle: [
                { label: 'Center Path', note: 'A single point setup for hunting periodic triangular loops with the main grip.', apply: () => ({ sourcePos: { x: 0, y: size * 0.12 }, spread: 0.3, lightSourceMode: 'point', triangleSourceMode: 'single' }) },
                { label: 'Edge Sweep', note: 'A parallel sweep across one side of the triangle that makes stripe families easy to read.', apply: () => ({ sourcePos: { x: -size * 0.3, y: size * 0.18 }, sourceRotation: -Math.PI / 3, lightSourceMode: 'parallel', spread: 0 }) },
                { label: 'Triad Edge', note: 'Three sources at the vertices, each aligned by edge normals for a strong triangular caustic scene.', apply: () => ({ sourcePos: { x: 0, y: size * 0.12 }, spread: Math.PI / 3, lightSourceMode: 'point', triangleSourceMode: 'triad', triangleDirectionMode: 'edge-normal' }) }
            ]
        };
    },

    shapePanelContent(shape) {
        const copy = {
            circle: {
                badge: 'Circle',
                title: 'Circle Study',
                description: 'Symmetric reflections keep the beam stable from nearly any launch angle.',
                meta: 'Symmetry',
                cardTitle: 'Closed Orbit',
                cardCopy: 'Circular boundaries are ideal for clean repeating paths and stable echo-like motion.',
                note: 'Tip: drag the source off-center, then rotate slowly to search for repeating loops.',
                action: 'ANCHOR'
            },
            rect: {
                badge: 'Rectangle',
                title: 'Rectangle Study',
                description: 'Straight walls make corner sensitivity obvious and easy to compare.',
                meta: 'Corners',
                cardTitle: 'Corner Bounce',
                cardCopy: 'Small changes near an edge can redirect the beam into long alternating zigzags.',
                note: 'Tip: place the source near one side and compare shallow versus steep launch angles.',
                action: 'ANCHOR'
            },
            'v-oval': {
                badge: 'V-Oval',
                title: 'Vertical Oval',
                description: 'The tall oval compresses rays vertically and highlights the major-axis bias.',
                meta: 'Focus',
                cardTitle: 'Focus Pair',
                cardCopy: 'Use the focus anchor to see how reflections tighten along the vertical geometry.',
                note: 'Tip: sync to the upper focus, then sweep the rotation slider through a narrow range.',
                action: 'FOCI'
            },
            'vv-oval': {
                badge: 'Double Oval',
                title: 'Double Oval',
                description: 'Two boundaries create a split cavity where rays can jump between shells.',
                meta: 'Nested',
                cardTitle: 'Shared Channel',
                cardCopy: 'The outer and inner ovals create a clean demonstration of boundary transitions.',
                note: 'Tip: run Paint 2 with moderate density to reveal the split caustic lanes.',
                action: 'FOCI'
            },
            ellipse: {
                badge: 'Ellipse',
                title: 'Ellipse Study',
                description: 'Ellipses are strongest when you emphasize the two foci and the returning paths between them.',
                meta: 'Focal Pair',
                cardTitle: 'Focus Return',
                cardCopy: 'Launching from a focus shows the classic ellipse property with minimal setup.',
                note: 'Tip: hit the focus button, then use a wider spread to show the shared return point.',
                action: 'FOCI'
            },
            parabola: {
                badge: 'Parabola',
                title: 'Parabola Study',
                description: 'The parabola is best used as a one-focus machine that straightens outgoing beams.',
                meta: 'Focus Lock',
                cardTitle: 'Parallel Exit',
                cardCopy: 'A point source at the focus demonstrates why the reflected bundle aligns so cleanly.',
                note: 'Tip: keep point source mode active and compare narrow spread versus broad spread.',
                action: 'FOCUS'
            },
            cardioid: {
                badge: 'Cardioid',
                title: 'Cardioid Study',
                description: 'The cusp makes this shape the most sensitive and dramatic under small perturbations.',
                meta: 'Cusp',
                cardTitle: 'Cusp Caustic',
                cardCopy: 'Cardioids reward slow scanning because the beam structure changes sharply near the notch.',
                note: 'Tip: move the source along the left side and accumulate with Paint 2 for dense folds.',
                action: 'ANCHOR'
            },
            triangle: {
                badge: 'Triangle',
                title: 'Triangle Study',
                description: 'The triangle is best for periodic paths, edge scans, and later multi-point source patterns.',
                meta: 'Multi-Point',
                cardTitle: 'Edge Sweep',
                cardCopy: 'Parallel and paint-based accumulation can expose stripe families and periodic orbit bands.',
                note: 'Tip: start near the center, then scan toward a vertex to compare stable and unstable regions.',
                action: 'ANCHOR'
            }
        };
        return copy[shape] || copy.circle;
    },

    /**
     * Bind all DOM events to App actions
     */
    setupEvents(app) {
        window.addEventListener('resize', () => app.resize());
        this.setupApplePlayer(app);
        const refreshIncrementalModes = () => {
            if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
        };

        // Shape Tabs
        document.querySelectorAll('.shape-tab').forEach(btn => {
            btn.onclick = (e) => {
                const button = e.currentTarget;
                const nextShape = button.dataset.shape;
                app.shape = nextShape;
                document.querySelectorAll('.shape-tab').forEach(b => b.classList.remove('active'));
                button.classList.add('active');

                app.applyShapeSwitchReset(nextShape);
                app.recalcParallelRange(); // Calculate new range for Parallel mode
                this.update(app);
            };
        });

        // Color Mode Tabs
        document.querySelectorAll('.mode-tab').forEach(btn => {
            btn.onclick = (e) => {
                const button = e.currentTarget;
                app.colorMode = button.dataset.mode;
                document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            };
        });

        // Auto Mode Toggles
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

        Object.entries(autoLabels).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) {
                el.onclick = () => {
                    setAutoMode(key, !app.autoModes[key]);
                    this.update(app);
                };
            }
        });

        // Sliders
        const rangeSource = document.getElementById('range-source');
        
        rangeSource.oninput = (e) => {
            const angle = parseFloat(e.target.value);
            const dist = Math.sqrt(app.sourcePos.x**2 + app.sourcePos.y**2);
            app.sourcePos = {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            };
            app.autoModes.revolution = false;
            refreshIncrementalModes();
            this.update(app);
        };

        const rangeRotation = document.getElementById('range-rotation');
        rangeRotation.oninput = (e) => {
            app.sourceRotation = parseFloat(e.target.value);
            refreshIncrementalModes();
            this.update(app);
        };


        const rangeDensity = document.getElementById('range-density');
        rangeDensity.oninput = (e) => {
            app.rayNumber = parseInt(e.target.value);
            app.autoModes.density = false;
            refreshIncrementalModes();
            this.update(app);
        };

        const rangeSpeed = document.getElementById('range-speed');
        rangeSpeed.oninput = (e) => {
            app.raySpeed = parseFloat(e.target.value);
            app.autoModes.speed = false;
            this.update(app);
        };

        const rangeBeamWidth = document.getElementById('range-beam-width');
        if (rangeBeamWidth) {
            rangeBeamWidth.oninput = (e) => {
                app.beamWidth = parseFloat(e.target.value);
                this.update(app);
            };
        }

        const rangeSpread = document.getElementById('range-spread');
        rangeSpread.oninput = (e) => {
            app.spread = parseFloat(e.target.value);
            app.autoModes.spread = false;
            refreshIncrementalModes();
            this.update(app);
        };

        const rangeReflections = document.getElementById('range-reflections');
        if (rangeReflections) {
            rangeReflections.oninput = (e) => {
                app.MAX_BOUNCES = parseInt(e.target.value);
                app.autoModes.reflections = false;
                this.update(app);
            };
        }

        const rangeAlpha = document.getElementById('range-alpha');
        if (rangeAlpha) {
            rangeAlpha.oninput = (e) => {
                app.alphaIntensity = parseFloat(e.target.value);
                this.update(app);
            };
        }

        const rangeTriangleCount = document.getElementById('range-triangle-count');
        if (rangeTriangleCount) {
            rangeTriangleCount.oninput = (e) => {
                app.trianglePointCount = parseInt(e.target.value, 10);
                refreshIncrementalModes();
                this.update(app);
            };
        }

        const rangeTriangleBias = document.getElementById('range-triangle-bias');
        if (rangeTriangleBias) {
            rangeTriangleBias.oninput = (e) => {
                app.triangleVertexBias = parseFloat(e.target.value);
                refreshIncrementalModes();
                this.update(app);
            };
        }

        const checkAxes = document.getElementById('check-axes');
        if (checkAxes) {
            checkAxes.onchange = (e) => {
                app.showAxes = e.target.checked;
                this.update(app);
            };
        }

        const btnFoci = document.getElementById('btn-foci-sync');
        if (btnFoci) {
            btnFoci.onclick = () => {
                app.syncSourceToFoci();
                this.update(app);
            };
        }

        document.querySelectorAll('[data-preset-slot]').forEach(btn => {
            btn.onclick = () => {
                const slot = parseInt(btn.dataset.presetSlot, 10);
                this.applyShapePreset(app, slot);
            };
        });

        document.querySelectorAll('[data-accordion-toggle]').forEach(btn => {
            btn.onclick = () => {
                const key = btn.dataset.accordionToggle;
                const section = document.querySelector(`[data-accordion-section="${key}"]`);
                if (section) section.classList.toggle('is-open');
            };
        });

        const selectNarrative = document.getElementById('select-narrative');
        if (selectNarrative) {
            selectNarrative.onchange = (e) => {
                app.currentNarrative = e.target.value;
                app.persistState();
                this.update(app);
            };
        }


        // Base Style Mini Tabs
        document.querySelectorAll('#group-base .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.baseStyle = e.target.dataset.value;
                this.update(app);
            };
        });

        // Flow Mode Mini Tabs
        document.querySelectorAll('#group-flow .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.flowMode = e.target.dataset.value;
                this.update(app);
            };
        });

        document.querySelectorAll('#group-triangle-source .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.triangleSourceMode = e.target.dataset.value;
                refreshIncrementalModes();
                this.update(app);
            };
        });

        document.querySelectorAll('#group-triangle-direction .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.triangleDirectionMode = e.target.dataset.value;
                refreshIncrementalModes();
                this.update(app);
            };
        });

        // Source Mode Mini Tabs
        document.querySelectorAll('#group-source-mode .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                app.lightSourceMode = e.target.dataset.value;
                app.normalizeLightSourceMode();
                if (app.shape === 'parabola' && app.lightSourceMode === 'point') {
                    app.sourcePos = app.getShapeDefaults('parabola').sourcePos;
                }
                refreshIncrementalModes();
                this.update(app);
            };
        });

        // Effects Checkboxes
        document.getElementById('check-trail').onchange = (e) => {
            app.useTrail = e.target.checked;
            this.update(app);
        };
        document.getElementById('check-taper').onchange = (e) => {
            app.useTaper = e.target.checked;
            this.update(app);
        };
        document.getElementById('check-bloom').onchange = (e) => {
            app.useBloom = e.target.checked;
            this.update(app);
        };
        // Render Mode Mini Tabs
        document.querySelectorAll('#group-render-mode .mini-tab').forEach(btn => {
            btn.onclick = (e) => {
                const val = e.target.dataset.value;
                app.isPaintMode = (val === 'paint1');
                app.isPaint2Mode = (val === 'paint2');
                app.isLightMode = (val === 'light');
                app.normalizeLightSourceMode();
                if (app.isPaint2Mode || app.isLightMode) app.resetRays(false); 
                this.update(app);
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

            // Wait for DOM reflow to get accurate new dimensions
            setTimeout(() => {
                app.resize();
                const nextSize = app.getShapeSize();
                const nextDefault = app.getShapeDefaults(app.shape).sourcePos;
                const scale = prevSize > 0 ? nextSize / prevSize : 1;
                
                // Adaptive Snap: If it was at a focus/default, keep it there. Else, scale it.
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
                app.recalcParallelRange();
                refreshIncrementalModes();
                this.update(app);
            }, 60);
        };

        const btnWindowFull = document.getElementById('apple-fullscreen');
        if (btnWindowFull) {
            btnWindowFull.onclick = () => toggleFullscreen();
        }

        const btnSideToggle = document.getElementById('apple-sidebar-toggle');
        if (btnSideToggle) {
            btnSideToggle.onclick = () => {
                const rightSidebar = document.getElementById('right-sidebar');
                const leftSidebar = document.getElementById('left-sidebar');
                if (rightSidebar) {
                    rightSidebar.classList.toggle('hidden');
                }
                if (leftSidebar) {
                    leftSidebar.classList.toggle('hidden');
                }
                app.resize();
            };
        }



        // Keyboard Shortcuts
        const keyMap = {
            'Digit1': 'revolution',
            'Digit2': 'rotation',
            'Digit3': 'spread',
            'Digit4': 'density',
            'Digit5': 'speed',
            'Digit6': 'reflections'
        };
        let sHeld = false;
        let aHeld = false;

        window.addEventListener('keydown', (e) => {
            const target = e.target;
            const isTyping =
                target &&
                (target.tagName === 'INPUT' ||
                 target.tagName === 'TEXTAREA' ||
                 target.isContentEditable);
            if (isTyping) return;

            if (e.key === 'Escape') {
                const rightSidebar = document.getElementById('right-sidebar');
                const leftSidebar = document.getElementById('left-sidebar');
                if (rightSidebar) rightSidebar.classList.remove('hidden');
                if (leftSidebar) leftSidebar.classList.remove('hidden');

                // Correctly exit Full Window mode on Esc with inverse scaling
                if (document.body.classList.contains('window-full')) {
                    toggleFullscreen();
                }
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
                app["3_beam_spread_simm"]();
                return;
            }

            if (aHeld && e.code === 'Digit4') {
                e.preventDefault();
                app["4_ray_mum_simm"]();
                return;
            }

            if (sHeld && e.code === 'Digit0') {
                e.preventDefault();
                app.startNarrativeSimulation();
                return;
            }

            // Space bar shortcut for Go / Hold
            if (e.code === 'Space') {
                e.preventDefault(); 
                app.toggleFlow();
                return;
            }

            // Digit keys for Auto Modes
            const autoKey = keyMap[e.code];
            if (autoKey && sHeld) {
                e.preventDefault();
                app.autoModes[autoKey] = !app.autoModes[autoKey];
                setAutoMode(autoKey, app.autoModes[autoKey]);
                this.update(app);
                return;
            }

            // Shift + Left Arrow for Reset (safer than plain ArrowLeft)
            if (e.code === 'ArrowLeft' && e.shiftKey) {
                e.preventDefault();
                app.reset();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyS') sHeld = false;
            if (e.code === 'KeyA') aHeld = false;
        });

        // Mouse/Touch Interaction
        let isDragging = false;
        let dragTarget = 'center'; // 'center', 'min', or 'max'

        const handleInteraction = (e) => {
            const rect = app.canvas.getBoundingClientRect();
            const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0].clientX);
            const clientY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0].clientY);
            
            if (clientX === undefined) return;

            const x = clientX - rect.left - rect.width/2;
            const y = clientY - rect.top - (rect.height/2 - 60); // Sync with renderer's centerY shift

            if (e.type === 'mousedown' || e.type === 'touchstart') {
                const sX = app.sourcePos.x;
                const sY = app.sourcePos.y;
                
                // Identify target
                if (app.lightSourceMode === 'parallel') {
                    const cosR = Math.cos(app.sourceRotation);
                    const sinR = Math.sin(app.sourceRotation);
                    const { min, max } = app.parallelRange;
                    
                    const h1 = { x: sX + min * cosR, y: sY + min * sinR };
                    const h2 = { x: sX + max * cosR, y: sY + max * sinR };
                    
                    const d0 = Math.sqrt((x - sX)**2 + (y - sY)**2);
                    const d1 = Math.sqrt((x - h1.x)**2 + (y - h1.y)**2);
                    const d2 = Math.sqrt((x - h2.x)**2 + (y - h2.y)**2);
                    
                    if (d1 < 30) {
                        isDragging = true; dragTarget = 'min';
                    } else if (d2 < 30) {
                        isDragging = true; dragTarget = 'max';
                    } else if (d0 < 40) {
                        isDragging = true; dragTarget = 'center';
                    }
                } else {
                    const d0 = Math.sqrt((x - sX)**2 + (y - sY)**2);
                    if (d0 < 50) {
                        isDragging = true; dragTarget = 'center';
                    }
                }

                if (isDragging) {
                    app.autoModes.revolution = false;
                    app.autoModes.rotation = false; // Kill auto rotation if we grab and move
                    if (e.cancelable) e.preventDefault();
                }
            } else if (isDragging && (e.type === 'mousemove' || e.type === 'touchmove')) {
                if (dragTarget === 'center') {
                    app.sourcePos = { x, y };
                } else {
                    // Update Range and Rotation
                    const dx = x - app.sourcePos.x;
                    const dy = y - app.sourcePos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const newAngle = Math.atan2(dy, dx);
                    
                    if (dragTarget === 'min') {
                        app.parallelRange.min = -dist;
                        app.sourceRotation = Math.atan2(-dy, -dx); 
                    } else if (dragTarget === 'max') {
                        app.parallelRange.max = dist;
                        app.sourceRotation = Math.atan2(dy, dx);
                    }
                }
                refreshIncrementalModes();
                this.update(app);
            }
        };

        const stopDragging = () => isDragging = false;

        app.canvas.addEventListener('mousedown', handleInteraction);
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('mouseup', stopDragging);
        app.canvas.addEventListener('touchstart', handleInteraction, { passive: false });
        window.addEventListener('touchmove', handleInteraction, { passive: false });
        window.addEventListener('touchend', stopDragging);
    },

    /**
     * Update DOM elements to match current state
     */
    update(app) {
        this.syncShapePanel(app);

        const updateAutoLabel = (id, iconId, isActive) => {
            const el = document.getElementById(id);
            const icon = document.getElementById(iconId);
            if (!el || !icon) return;
            el.classList.toggle('active', isActive);
            
            // Toggle red highlight on the entire row
            const row = el.closest('.setting-row');
            if (row) row.classList.toggle('auto-active', isActive);

            const html = isActive 
                ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
                : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (icon.innerHTML !== html) icon.innerHTML = html;
        };

        updateAutoLabel('label-revolution', 'animate-icon-mini', app.autoModes.revolution);
        updateAutoLabel('label-rotation', 'rotate-icon-mini', app.autoModes.rotation);
        updateAutoLabel('label-density', 'density-icon-mini', app.autoModes.density);
        updateAutoLabel('label-speed', 'speed-icon-mini', app.autoModes.speed);
        updateAutoLabel('label-spread', 'spread-icon-mini', app.autoModes.spread);
        updateAutoLabel('label-reflections', 'reflections-icon-mini', app.autoModes.reflections);

        const angle = Math.atan2(app.sourcePos.y, app.sourcePos.x);
        const rangeSource = document.getElementById('range-source');
        // Only update input if it's materially different to prevent interfering with dragging
        if (Math.abs(parseFloat(rangeSource.value) - angle) > 0.02) rangeSource.value = angle;
        
        const degText = `${(angle * 180 / Math.PI).toFixed(0)}°`;
        const valSource = document.getElementById('val-source');
        if (valSource.textContent !== degText) valSource.textContent = degText;

        const valRotation = document.getElementById('val-rotation');
        const rotDeg = `${(app.sourceRotation * 180 / Math.PI).toFixed(0)}°`;
        

        if (valRotation.textContent !== rotDeg) {
            valRotation.textContent = rotDeg;
            document.getElementById('range-rotation').value = app.sourceRotation;
        }
        
        document.getElementById('range-density').value = app.rayNumber;
        const valDensity = document.getElementById('val-density');
        if (valDensity.textContent != app.rayNumber) valDensity.textContent = app.rayNumber;

        document.getElementById('range-speed').value = app.raySpeed;
        const valSpeed = document.getElementById('val-speed');
        if (valSpeed.textContent != app.raySpeed) valSpeed.textContent = app.raySpeed;

        const spreadText = `${(app.spread * 180 / Math.PI).toFixed(0)}°`;
        document.getElementById('range-spread').value = app.spread;
        const valSpread = document.getElementById('val-spread');
        if (valSpread.textContent !== spreadText) valSpread.textContent = spreadText;

        if (document.getElementById('val-beam-width')) document.getElementById('val-beam-width').textContent = app.beamWidth.toFixed(1);
        document.getElementById('range-reflections').value = app.MAX_BOUNCES;
        const valReflections = document.getElementById('val-reflections');
        if (valReflections.textContent != app.MAX_BOUNCES) valReflections.textContent = app.MAX_BOUNCES;

        document.getElementById('range-alpha').value = app.alphaIntensity;
        const valAlpha = document.getElementById('val-alpha');
        const alphaText = `${app.alphaIntensity.toFixed(2)}x`;
        if (valAlpha.textContent !== alphaText) valAlpha.textContent = alphaText;

        const triangleCount = document.getElementById('range-triangle-count');
        const triangleCountValue = document.getElementById('val-triangle-count');
        if (triangleCount) triangleCount.value = app.trianglePointCount;
        if (triangleCountValue) triangleCountValue.textContent = String(app.trianglePointCount);

        const triangleBias = document.getElementById('range-triangle-bias');
        const triangleBiasValue = document.getElementById('val-triangle-bias');
        if (triangleBias) triangleBias.value = app.triangleVertexBias;
        if (triangleBiasValue) triangleBiasValue.textContent = app.triangleVertexBias.toFixed(2);

        const btnLight = document.getElementById('btn-light');
        if (btnLight) {
            btnLight.classList.toggle('light-on', app.isLightVisible);
            const lightText = document.getElementById('light-text');
            if (lightText && lightText.textContent !== 'Emit') lightText.textContent = 'Emit';
        }


        const checkAxes = document.getElementById('check-axes');
        if (checkAxes && checkAxes.checked !== app.showAxes) checkAxes.checked = app.showAxes;

        // Update Mini Tabs
        document.querySelectorAll('#group-render-mode .mini-tab').forEach(btn => {
            let activeVal = 'none';
            if (app.isPaintMode) activeVal = 'paint1';
            else if (app.isPaint2Mode) activeVal = 'paint2';
            else if (app.isLightMode) activeVal = 'light';
            
            const isActive = btn.dataset.value === activeVal;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });

        document.querySelectorAll('#group-base .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.baseStyle;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });
        document.querySelectorAll('#group-flow .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.flowMode;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });
        document.querySelectorAll('#group-source-mode .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.lightSourceMode;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });

        document.querySelectorAll('#group-triangle-source .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.triangleSourceMode;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });

        document.querySelectorAll('#group-triangle-direction .mini-tab').forEach(btn => {
            const isActive = btn.dataset.value === app.triangleDirectionMode;
            if (btn.classList.contains('active') !== isActive) {
                btn.classList.toggle('active', isActive);
            }
        });

        // Update Checkboxes
        const cTrail = document.getElementById('check-trail');
        const cTaper = document.getElementById('check-taper');
        const cBloom = document.getElementById('check-bloom');
        const cPaint = document.getElementById('check-paint');
        
        if (cTrail && cTrail.checked !== app.useTrail) cTrail.checked = app.useTrail;
        if (cTaper && cTaper.checked !== app.useTaper) cTaper.checked = app.useTaper;
        if (cBloom && cBloom.checked !== app.useBloom) cBloom.checked = app.useBloom;

        this.syncNarrativeSelect(app);

        // Sync Apple Player
        const applePlay = document.getElementById('apple-play');
        const applePlayIcon = document.getElementById('apple-play-icon');
        if (applePlay) {
            applePlay.classList.toggle('active', app.isFlowing);
            const playHtml = app.isFlowing 
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            if (applePlayIcon.innerHTML !== playHtml) applePlayIcon.innerHTML = playHtml;
        }

        const appleVol = document.getElementById('apple-volume');
        if (appleVol && window.audioManager) {
            const currentVol = window.audioManager.targetVolume;
            if (Math.abs(parseFloat(appleVol.value) - currentVol) > 0.01) {
                appleVol.value = currentVol;
            }
        }

        const cycleDuration = 60;
        
        const appleTime = document.getElementById('apple-time-current');
        if (appleTime) {
            const timeVal = Math.floor(app.elapsedTime || 0);
            const mins = Math.floor(timeVal / 60);
            const secs = Math.floor(timeVal % 60);
            appleTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        const appleProgress = document.getElementById('apple-progress-bar');
        const appleTrackName = document.getElementById('apple-track-name');
        if (appleProgress) {
            const progress = (app.elapsedTime % cycleDuration) / cycleDuration * 100;
            appleProgress.style.width = `${progress}%`;
            
            if (appleTrackName && app.currentTrackName) {
                appleTrackName.textContent = app.currentTrackName;
            }
        }

        const bgmIcon = document.getElementById('apple-bgm-icon');
        if (bgmIcon && window.audioManager) {
            bgmIcon.style.opacity = window.audioManager.isMuted ? '0.3' : '1';
        }
    },

    syncNarrativeSelect(app) {
        const sNarrative = document.getElementById('select-narrative');
        if (sNarrative) {
            sNarrative.value = app.currentNarrative || 'none';
        }
    },

    syncShapePanel(app) {
        let content = this.shapePanelContent(app.shape);
        if (app.shape === 'triangle') {
            content = this.trianglePanelContent(app, content);
        }
        const presetsByShape = this.shapePresets(app);
        const presets = presetsByShape[app.shape] || presetsByShape.circle;
        const badge = document.getElementById('shape-badge');
        const title = document.getElementById('shape-options-title');
        const copy = document.getElementById('shape-options-copy');
        const meta = document.getElementById('shape-options-meta');
        const cardTitle = document.getElementById('shape-option-card-title');
        const cardCopy = document.getElementById('shape-option-card-copy');
        const note = document.getElementById('shape-option-note');
        const card = document.getElementById('shape-option-card');
        const presetNote = document.getElementById('shape-preset-note');
        const btnFoci = document.getElementById('btn-foci-sync');
        const triangleSection = document.getElementById('triangle-source-section');
        const triangleDirectionRow = document.getElementById('triangle-direction-row');
        const isTriangle = app.shape === 'triangle';

        if (badge) badge.textContent = content.badge;
        if (title) title.textContent = content.title;
        if (copy) copy.textContent = content.description;
        if (meta) meta.textContent = content.meta;
        if (cardTitle) cardTitle.textContent = content.cardTitle;
        if (cardCopy) cardCopy.textContent = content.cardCopy;
        if (note) note.textContent = content.note;
        if (btnFoci) {
            btnFoci.textContent = content.action;
            btnFoci.title = `Sync source to ${content.action.toLowerCase()} anchor`;
        }
        if (triangleSection) {
            triangleSection.classList.toggle('visible', isTriangle);
            triangleSection.classList.toggle('is-open', isTriangle);
        }
        if (triangleDirectionRow) {
            triangleDirectionRow.classList.toggle('hidden', app.triangleSourceMode === 'single');
        }
        if (card) card.classList.toggle('hidden', isTriangle);
        if (note) note.classList.toggle('hidden', isTriangle);

        presets.forEach((preset, index) => {
            const button = document.getElementById(`shape-preset-${index}`);
            if (button) button.textContent = preset.label;
        });
        const selectedPreset = presets[app.selectedSourcePresetSlot ?? 0] || presets[0];
        if (presetNote && selectedPreset) {
            presetNote.textContent = selectedPreset.note || '';
        }
    },

    applyShapePreset(app, slot) {
        const presetsByShape = this.shapePresets(app);
        const presets = presetsByShape[app.shape] || presetsByShape.circle;
        const preset = presets[slot];
        if (!preset) return;
        app.selectedSourcePresetSlot = slot;

        const next = preset.apply();
        const presetNote = document.getElementById('shape-preset-note');
        if (next.sourcePos) app.sourcePos = { ...next.sourcePos };
        if (typeof next.sourceRotation === 'number') app.sourceRotation = next.sourceRotation;
        if (typeof next.spread === 'number') app.spread = next.spread;
        if (typeof next.lightSourceMode === 'string') app.lightSourceMode = next.lightSourceMode;
        if (typeof next.triangleSourceMode === 'string') app.triangleSourceMode = next.triangleSourceMode;
        if (typeof next.triangleDirectionMode === 'string') app.triangleDirectionMode = next.triangleDirectionMode;
        if (typeof next.isPaintMode === 'boolean') app.isPaintMode = next.isPaintMode;
        if (typeof next.isPaint2Mode === 'boolean') app.isPaint2Mode = next.isPaint2Mode;
        if (typeof next.isLightMode === 'boolean') app.isLightMode = next.isLightMode;

        app.autoModes.revolution = false;
        app.autoModes.rotation = false;
        app.normalizeLightSourceMode();
        app.sanitizeSourcePosition();
        app.recalcParallelRange();
        if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
        if (presetNote) presetNote.textContent = preset.note || '';
        this.update(app);
    },

    setupApplePlayer(app) {
        const player = document.getElementById('apple-player');
        const restoreTab = document.getElementById('apple-player-restore');
        const grip = document.getElementById('player-grip');
        const btnPlay = document.getElementById('apple-play');
        const volSlider = document.getElementById('apple-volume');

        const showPlayer = () => {
            player.classList.remove('hidden');
            if (restoreTab) restoreTab.classList.add('hidden');
        };

        const hidePlayer = () => {
            player.classList.add('hidden');
            if (restoreTab) restoreTab.classList.remove('hidden');
        };

        // Draggable Logic
        let isDragging = false;
        let startX, startY;

        grip.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX - player.offsetLeft;
            startY = e.clientY - player.offsetTop;
            player.style.bottom = 'auto'; // Disable bottom-fixed once moved
            player.style.transform = 'none'; 
            player.style.left = player.offsetLeft + 'px';
            player.style.top = player.offsetTop + 'px';
        };

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            player.style.left = (e.clientX - startX) + 'px';
            player.style.top = (e.clientY - startY) + 'px';
        });

        window.addEventListener('mouseup', () => isDragging = false);

        // Controls
        btnPlay.onclick = () => {
            app.toggleFlow();
        };

        const btnFullReset = document.getElementById('apple-full-reset');
        if (btnFullReset) {
            btnFullReset.onclick = () => {
                app.reset();
                app.recalcParallelRange();
            };
        }

        const btnPartialReset = document.getElementById('apple-partial-reset');
        if (btnPartialReset) {
            btnPartialReset.onclick = () => {
                app.resetRays(true);
                this.update(app);
            };
        }

        const btnSpeedUp = document.getElementById('apple-speed-up');
        const btnSpeedDown = document.getElementById('apple-speed-down');
        
        if (btnSpeedUp) {
            btnSpeedUp.onclick = () => {
                app.simSpeedMultiplier *= 1.1;
                // Cap max multiplier for stability
                if (app.simSpeedMultiplier > 10.0) app.simSpeedMultiplier = 10.0;
                this.update(app);
            };
        }

        if (btnSpeedDown) {
            btnSpeedDown.onclick = () => {
                app.simSpeedMultiplier *= 0.9;
                // Cap min multiplier 
                if (app.simSpeedMultiplier < 0.1) app.simSpeedMultiplier = 0.1;
                this.update(app);
            };
        }
        
        volSlider.oninput = (e) => {
            if (window.audioManager) {
                window.audioManager.isMuted = false;
                window.audioManager.setTargetVolume(parseFloat(e.target.value));
                window.audioManager.resume();
            }
        };

        const btnNextTrack = document.getElementById('apple-next-track');
        if (btnNextTrack) {
            btnNextTrack.onclick = () => {
                app.nextBGM();
                this.update(app);
            };
        }

        const bgmIcon = document.getElementById('apple-bgm-icon');
        if (bgmIcon) {
            bgmIcon.onclick = () => {
                if (window.audioManager) {
                    const isMuted = window.audioManager.toggleMute();
                    bgmIcon.style.opacity = isMuted ? '0.3' : '1';
                }
            };
        }

        // Window Hide / Restore Logic
        const btnClose = document.getElementById('apple-player-close');
        if (btnClose) {
            btnClose.onclick = (e) => {
                e.stopPropagation();
                hidePlayer();
            };
        }

        if (restoreTab) {
            restoreTab.onclick = () => {
                showPlayer();
            };
        }

        // Sidebar Drag Logic
        const setupSidebarDrag = (sidebarId, gripId) => {
            const sidebar = document.getElementById(sidebarId);
            const grip = document.getElementById(gripId);
            let isDragging = false;
            let startX, startY;

            if (grip && sidebar) {
                grip.onmousedown = (e) => {
                    isDragging = true;
                    startX = e.clientX - sidebar.offsetLeft;
                    startY = e.clientY - sidebar.offsetTop;
                    sidebar.style.transition = 'none';
                };

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    sidebar.style.left = (e.clientX - startX) + 'px';
                    sidebar.style.top = (e.clientY - startY) + 'px';
                    sidebar.style.right = 'auto';
                });

                window.addEventListener('mouseup', () => {
                    if (isDragging) {
                        isDragging = false;
                        sidebar.style.transition = 'opacity 0.6s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    }
                });
            }
        };

        setupSidebarDrag('left-sidebar', 'sidebar-grip-left');
        setupSidebarDrag('right-sidebar', 'sidebar-grip-right');

        const setupSidebarClose = (sidebarId, closeBtnId) => {
            const sidebar = document.getElementById(sidebarId);
            const btn = document.getElementById(closeBtnId);
            if (sidebar && btn) {
                btn.onclick = () => {
                    sidebar.classList.add('hidden');
                };
            }
        };

        setupSidebarClose('left-sidebar', 'sidebar-close-left');
        setupSidebarClose('right-sidebar', 'sidebar-close-right');


    }
};
