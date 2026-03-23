const SortColorControlFactory = {
    createCardioidControls(caseRef) {
        const controls = [
            {
                type: 'button',
                id: 'cd_play_toggle',
                label: '',
                value: caseRef.isPaused ? 'PLAY (Resume)' : 'HOLD (Stop)',
                onClick: () => {
                    if (!caseRef.animationId) caseRef.start();
                    caseRef.setPaused(!caseRef.isPaused);
                    if (typeof Core !== 'undefined' && Core.currentCase === caseRef) Core.updateControls();
                }
            },
            {
                type: 'select',
                id: 'mc_mode',
                label: 'Pattern Mode',
                value: caseRef.learningMode,
                options: [
                    { value: 'off', label: 'Standard' },
                    { value: 'n-ramp', label: 'N Ramp' },
                    { value: 'm-ramp', label: 'M Ramp' },
                    { value: 'gcd', label: 'GCD Loops' },
                    { value: 'integer-snap', label: 'Integer Snap' },
                    { value: 'mapping', label: 'Mapping' },
                    { value: 'classic', label: 'Classic' },
                    { value: 'ultimate', label: 'Ultimate' },
                    { value: 'mirror-chaos', label: 'Mirror & Chaos' }
                ],
                onChange: (v) => {
                    caseRef.setLearningMode(v);
                }
            },
            {
                type: 'slider',
                id: 'mc_n',
                label: 'N (Points)',
                min: 0,
                max: caseRef.learningMode === 'n-ramp' ? 1000 : 1500,
                step: 1,
                value: caseRef.pointCount,
                onChange: (v) => {
                    if (caseRef.learningMode === 'n-ramp') {
                        caseRef.learnN = Math.max(0, Math.floor(v));
                    } else {
                        caseRef.pointCount = Math.max(0, Math.floor(v));
                    }
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_m',
                label: 'M (Multiplier)',
                min: 0,
                max: 1000,
                step: 0.001,
                decimals: 3,
                value: caseRef.multiplier,
                onChange: (v) => {
                    caseRef.multiplier = v;
                    if (caseRef.learningMode === 'n-ramp') {
                        caseRef.learnFixedM = v;
                    }
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_speed',
                label: 'M Speed',
                min: -2,
                max: 2,
                step: 0.001,
                decimals: 3,
                value: caseRef.multiplierSpeed,
                onChange: (v) => {
                    caseRef.multiplierSpeed = v;
                }
            },
            {
                type: 'slider',
                id: 'mc_alpha',
                label: 'Line Alpha',
                min: 0.05,
                max: 1,
                step: 0.01,
                value: caseRef.lineAlpha,
                onChange: (v) => {
                    caseRef.lineAlpha = v;
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_line_width',
                label: 'Line Width',
                min: 0.2,
                max: 6,
                step: 0.05,
                decimals: 2,
                value: caseRef.lineWidth,
                onChange: (v) => {
                    caseRef.lineWidth = Math.max(0.2, Number(v));
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_bulge',
                label: 'Bulge',
                min: -1.5,
                max: 1.5,
                step: 0.01,
                value: caseRef.circleBulge,
                onChange: (v) => {
                    caseRef.circleBulge = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_render',
                label: 'Render',
                value: caseRef.renderMode,
                options: [
                    { value: 'glow', label: 'LGT' },
                    { value: 'light', label: 'Source Over' }
                ],
                onChange: (v) => {
                    caseRef.renderMode = v;
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_color',
                label: 'Color',
                value: caseRef.colorMode,
                options: [
                    { value: 'angle', label: 'Angle' },
                    { value: 'order', label: 'Order' },
                    { value: 'lsh', label: 'LSH' },
                    { value: 'length', label: 'Length' },
                    { value: 'origin', label: 'Origin' },
                    { value: 'monochrome', label: 'Monochrome' }
                ],
                onChange: (v) => {
                    caseRef.colorMode = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'divider',
                id: 'mc_sort_divider',
                label: 'Sorting',
                actionLabel: 'Shuffle',
                onAction: () => {
                    if (typeof Core !== 'undefined' && typeof Core.playGameSound === 'function') {
                        Core.playGameSound('shuffle');
                    }
                    caseRef.shuffleScene();
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_sort',
                label: 'Method',
                value: caseRef.sortMode,
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'hue', label: 'Hue Radix' },
                    { value: 'lsh', label: 'L-S-H Radix' },
                    { value: 'bubble', label: 'Bubble Sort' },
                    { value: 'quick', label: 'Quick Sort' },
                    { value: 'insertion', label: 'Insertion Sort' },
                    { value: 'selection', label: 'Selection Sort' }
                ],
                onChange: (v) => {
                    caseRef.sortMode = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_sort_speed',
                label: 'Sort Speed',
                min: 4,
                max: 1000,
                step: 1,
                value: caseRef.sortSpeed,
                onChange: (v) => {
                    caseRef.sortSpeed = Math.max(1, v);
                }
            },
            {
                type: 'select',
                id: 'mc_int',
                label: 'Integers Only',
                value: caseRef.integersOnly ? 'on' : 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                ],
                onChange: (v) => {
                    caseRef.integersOnly = v === 'on';
                    caseRef.restartSort();
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_hud',
                label: 'HUD',
                value: caseRef.showHud ? 'on' : 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                ],
                onChange: (v) => {
                    caseRef.showHud = v === 'on';
                    caseRef.draw();
                }
            },
            {
                type: 'button',
                id: 'mc_help',
                label: 'Guide',
                value: '설명서 보기',
                onClick: () => caseRef.showGuide()
            },
            {
                type: 'button',
                id: 'mc_sort_restart',
                label: 'Restart Sorting',
                value: 'Sorting 다시 시작',
                onClick: () => {
                    caseRef.restartSort();
                    caseRef.draw();
                }
            }
        ];

        this.appendCardioidLearningModeControls(caseRef, controls);
        return controls;
    },

    appendCardioidLearningModeControls(caseRef, controls) {
        if (caseRef.learningMode === 'n-ramp') {
            controls.push(
                {
                    type: 'slider',
                    id: 'mc_nr_m',
                    label: 'N Ramp: Fixed M',
                    min: 0,
                    max: 1000,
                    step: 0.001,
                    decimals: 3,
                    value: caseRef.learnFixedM,
                    onChange: (v) => {
                        caseRef.learnFixedM = v;
                        caseRef.multiplier = v;
                        caseRef.draw();
                    }
                },
                {
                    type: 'slider',
                    id: 'mc_nr_slow',
                    label: 'N Ramp: Slow Speed',
                    min: 1,
                    max: 80,
                    step: 1,
                    value: caseRef.nRampSlowRate,
                    onChange: (v) => { caseRef.nRampSlowRate = v; }
                },
                {
                    type: 'slider',
                    id: 'mc_nr_fast',
                    label: 'N Ramp: Fast Speed',
                    min: 20,
                    max: 500,
                    step: 1,
                    value: caseRef.nRampFastRate,
                    onChange: (v) => { caseRef.nRampFastRate = v; }
                },
                {
                    type: 'slider',
                    id: 'mc_nr_switch',
                    label: 'N Ramp: Switch At N',
                    min: 10,
                    max: 1000,
                    step: 1,
                    value: caseRef.nRampSwitchN,
                    onChange: (v) => { caseRef.nRampSwitchN = Math.floor(v); }
                },
                {
                    type: 'button',
                    id: 'mc_nr_restart',
                    label: 'Restart N Ramp',
                    value: 'N Ramp 재시작',
                    onClick: () => {
                        caseRef.learnN = 0;
                        caseRef.pointCount = 0;
                        caseRef.multiplier = caseRef.learnFixedM;
                        caseRef.resetSortState('idle');
                        caseRef.draw();
                    }
                }
            );
        }
        if (caseRef.learningMode === 'm-ramp') {
            controls.push(
                {
                    type: 'slider',
                    id: 'mc_mr_n',
                    label: 'M Ramp: Fixed N',
                    min: 1,
                    max: 1500,
                    step: 1,
                    value: caseRef.mRampFixedN,
                    onChange: (v) => {
                        caseRef.mRampFixedN = Math.max(1, Math.floor(v));
                        caseRef.pointCount = caseRef.mRampFixedN;
                        caseRef.draw();
                    }
                },
                {
                    type: 'slider',
                    id: 'mc_mr_speed',
                    label: 'M Ramp: M Speed',
                    min: -4,
                    max: 4,
                    step: 0.01,
                    value: caseRef.mRampRate,
                    onChange: (v) => { caseRef.mRampRate = v; }
                },
                {
                    type: 'slider',
                    id: 'mc_mr_accel',
                    label: 'M Ramp: Accel',
                    min: 0,
                    max: 0.2,
                    step: 0.005,
                    value: caseRef.mRampAccel,
                    onChange: (v) => { caseRef.mRampAccel = v; }
                }
            );
        }
        if (caseRef.learningMode === 'integer-snap') {
            controls.push({
                type: 'slider',
                id: 'mc_snap_speed',
                label: 'Integer Snap Speed',
                min: -3,
                max: 3,
                step: 0.01,
                value: caseRef.snapRate,
                onChange: (v) => { caseRef.snapRate = v; }
            });
        }
        if (caseRef.learningMode === 'mapping') {
            controls.push(
                {
                    type: 'slider',
                    id: 'mc_demo_i',
                    label: 'Mapping i',
                    min: 0,
                    max: Math.max(0, Math.floor(caseRef.pointCount) - 1),
                    step: 1,
                    value: Math.floor(caseRef.demoIndex),
                    onChange: (v) => {
                        caseRef.demoIndex = Math.floor(v);
                        caseRef.draw();
                    }
                },
                {
                    type: 'select',
                    id: 'mc_demo_auto',
                    label: 'Mapping Auto Step',
                    value: caseRef.demoAuto ? 'on' : 'off',
                    options: [
                        { value: 'on', label: 'On' },
                        { value: 'off', label: 'Off' }
                    ],
                    onChange: (v) => { caseRef.demoAuto = v === 'on'; }
                },
                {
                    type: 'slider',
                    id: 'mc_demo_rate',
                    label: 'Mapping Step Speed',
                    min: 0.5,
                    max: 20,
                    step: 0.5,
                    value: caseRef.demoRate,
                    onChange: (v) => { caseRef.demoRate = v; }
                }
            );
        }
    },

    createLissajousControls(caseRef) {
        const controls = this.createCardioidControls(caseRef);
        const nControl = controls.find((control) => control.id === 'mc_n');
        if (nControl) nControl.label = 'N (Nodes)';
        const mControl = controls.find((control) => control.id === 'mc_m');
        if (mControl) mControl.label = 'M (Link)';
        const speedControl = controls.find((control) => control.id === 'mc_speed');
        if (speedControl) speedControl.label = 'M Speed';

        const speedIndex = controls.findIndex((control) => control.id === 'mc_speed');
        const extraControls = [
            {
                type: 'slider',
                id: 'mc_lissajous_a',
                label: 'Freq A',
                min: 1,
                max: 12,
                step: 1,
                value: caseRef.lissajousA,
                onChange: (v) => {
                    caseRef.lissajousA = Math.max(1, Math.floor(v));
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_lissajous_b',
                label: 'Freq B',
                min: 1,
                max: 12,
                step: 1,
                value: caseRef.lissajousB,
                onChange: (v) => {
                    caseRef.lissajousB = Math.max(1, Math.floor(v));
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_lissajous_phase',
                label: 'Phase',
                min: 0,
                max: 360,
                step: 0.1,
                value: caseRef.lissajousPhaseDeg,
                onChange: (v) => {
                    caseRef.lissajousPhaseDeg = Math.abs(Number(v) % 360);
                    if (typeof Core !== 'undefined' && !Core.isPhaseSimulating) {
                        caseRef.resetSortState('idle');
                    }
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_lissajous_ribbon',
                label: 'Ribbon',
                min: 0,
                max: 10,
                step: 0.05,
                value: caseRef.lissajousRibbon,
                onChange: (v) => {
                    caseRef.lissajousRibbon = Math.max(0, Math.min(10, Number(v)));
                    caseRef.draw();
                }
            }
        ];

        if (speedIndex >= 0) controls.splice(speedIndex + 1, 0, ...extraControls);
        else controls.push(...extraControls);

        return controls;
    },

    createSpiralDiskControls(caseRef) {
        const controls = this.createCardioidControls(caseRef);
        const nControl = controls.find((control) => control.id === 'mc_n');
        if (nControl) nControl.label = 'N (Nodes)';
        const mControl = controls.find((control) => control.id === 'mc_m');
        if (mControl) mControl.label = 'M (Link)';
        const speedControl = controls.find((control) => control.id === 'mc_speed');
        if (speedControl) speedControl.label = 'M Speed';

        const speedIndex = controls.findIndex((control) => control.id === 'mc_speed');
        const turnsControl = {
            type: 'slider',
            id: 'mc_spiral_turns',
            label: 'Spiral Turns',
            min: 1.5,
            max: 12,
            step: 0.1,
            decimals: 1,
            value: caseRef.spiralTurns,
            onChange: (v) => {
                caseRef.spiralTurns = Math.max(1.5, v);
                caseRef.resetSortState('idle');
                caseRef.draw();
            }
        };

        if (speedIndex >= 0) controls.splice(speedIndex + 1, 0, turnsControl);
        else controls.push(turnsControl);

        return controls;
    },

    createGoldbergControls(caseRef) {
        return [
            {
                type: 'slider',
                id: 'mc_sphere_count',
                label: 'Target Faces',
                min: 12,
                max: 1000,
                step: 1,
                value: caseRef.pointCount,
                onChange: (v) => {
                    caseRef.pointCount = Math.max(12, Math.floor(v));
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_sphere_freq',
                label: 'Frequency',
                min: 0,
                max: 10,
                step: 1,
                value: caseRef.sphereFrequencyOverride,
                onChange: (v) => {
                    caseRef.sphereFrequencyOverride = Math.max(0, Math.floor(v));
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'checkbox',
                id: 'mc_sphere_auto_track',
                label: 'Auto Track',
                value: caseRef.autoTrack,
                onChange: (checked) => {
                    caseRef.autoTrack = !!checked;
                    if (!caseRef.autoTrack) caseRef.resetAutoTrackingState();
                }
            },
            {
                type: 'checkbox',
                id: 'mc_sphere_auto_rotate',
                label: 'Auto Rotate',
                value: caseRef.autoRotate,
                onChange: (checked) => {
                    caseRef.autoRotate = !!checked;
                }
            },
            {
                type: 'slider',
                id: 'mc_sphere_rot',
                label: 'Rotation Speed',
                min: -1.2,
                max: 1.2,
                step: 0.01,
                value: caseRef.rotationSpeed,
                onChange: (v) => {
                    caseRef.rotationSpeed = v;
                }
            },
            {
                type: 'slider',
                id: 'mc_alpha',
                label: 'Face Alpha',
                min: 0.1,
                max: 1,
                step: 0.01,
                value: caseRef.lineAlpha,
                onChange: (v) => {
                    caseRef.lineAlpha = v;
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_render',
                label: 'Render',
                value: caseRef.renderMode,
                options: [
                    { value: 'glow', label: 'LGT' },
                    { value: 'light', label: 'Source Over' }
                ],
                onChange: (v) => {
                    caseRef.renderMode = v;
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_color_generator',
                label: 'Color Gen',
                value: caseRef.colorGenerator,
                options: [
                    { value: 'index-mod', label: 'Sequence' },
                    { value: 'spatial', label: 'Position' }
                ],
                onChange: (v) => {
                    caseRef.colorGenerator = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_color',
                label: 'Color',
                value: caseRef.colorMode,
                options: [
                    { value: 'angle', label: 'Longitude' },
                    { value: 'length', label: 'Northness' },
                    { value: 'origin', label: 'Latitude' },
                    { value: 'monochrome', label: 'Monochrome' }
                ],
                onChange: (v) => {
                    caseRef.colorMode = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'divider',
                id: 'mc_sort_divider',
                label: 'Sorting',
                actionLabel: 'Shuffle',
                onAction: () => {
                    if (typeof Core !== 'undefined' && typeof Core.playGameSound === 'function') {
                        Core.playGameSound('shuffle');
                    }
                    caseRef.shuffleScene();
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_sort',
                label: 'Method',
                value: caseRef.sortMode,
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'hue', label: 'Hue Radix' },
                    { value: 'lsh', label: 'L-S-H Radix' },
                    { value: 'bubble', label: 'Bubble Sort' },
                    { value: 'quick', label: 'Quick Sort' },
                    { value: 'insertion', label: 'Insertion Sort' },
                    { value: 'selection', label: 'Selection Sort' }
                ],
                onChange: (v) => {
                    caseRef.sortMode = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_sort_speed',
                label: 'Sort Speed',
                min: 4,
                max: 1000,
                step: 1,
                value: caseRef.sortSpeed,
                onChange: (v) => {
                    caseRef.sortSpeed = Math.max(1, v);
                }
            },
            {
                type: 'select',
                id: 'mc_hud',
                label: 'HUD',
                value: caseRef.showHud ? 'on' : 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On' }
                ],
                onChange: (v) => {
                    caseRef.showHud = v === 'on';
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_indices',
                label: 'Indices',
                value: caseRef.showIndices || 'off',
                options: [
                    { value: 'off', label: 'Off' },
                    { value: 'slot', label: 'Slot Index' },
                    { value: 'original', label: 'Original Index' }
                ],
                onChange: (v) => {
                    caseRef.showIndices = v;
                    caseRef.draw();
                }
            },
            {
                type: 'select',
                id: 'mc_slot_mapping',
                label: 'Slot Mapping',
                value: caseRef.slotMapping,
                options: [
                    { value: 'top-down', label: 'Top-down' },
                    { value: 'meridian', label: 'Vertical' },
                    { value: 'vertical', label: 'X Sweep' },
                    { value: 'sequence', label: 'Chunk' },
                    { value: 'top-down-zigzag', label: 'Top-down Zigzag' }
                ],
                onChange: (v) => {
                    caseRef.slotMapping = v;
                    caseRef.resetSortState('idle');
                    caseRef.draw();
                }
            },
            {
                type: 'button',
                id: 'mc_sort_restart',
                label: 'Restart Sorting',
                value: 'Sorting 다시 시작',
                onClick: () => {
                    caseRef.restartSort();
                    caseRef.draw();
                }
            }
        ];
    }
};
