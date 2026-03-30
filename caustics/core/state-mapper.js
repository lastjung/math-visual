import { SHAPE_REGISTRY } from '../config/shape-registry.js';
import { resolvePattern } from '../config/pattern-resolver.js';
import { getStripAnchorPoint } from './pattern-layout.js';

function normalizePatternId(patternId) {
    if (patternId === 'triad-edge') return 'vertex-edge';
    return patternId;
}

/**
 * Capture current application state into a structured Scene object.
 * @param {Object} app - The main App object
 * @returns {Object} Structured scene schema
 */
export function readCurrentScene(app) {
    return {
        shape: app.shape,
        patternId: normalizePatternId(app.patternId || null),
        options: {
            lightSourceMode: app.lightSourceMode,
            sourcePattern: app.sourcePattern,
            sourceOption: app.sourceOption || null,
            sourceDirection: app.sourceDirection,
            colorDistribution: app.colorDistribution,
            baseStyle: app.baseStyle,
            flowMode: app.flowMode,
            isPaintMode: app.isPaintMode,
            isPaint2Mode: app.isPaint2Mode,
            isLightMode: app.isLightMode,
            colorMode: app.colorMode,
            showAxes: app.showAxes,
            useTrail: app.useTrail,
            useTaper: app.useTaper,
            useBloom: app.useBloom,
            isWindowFull: app.isWindowFull,
            currentNarrative: app.currentNarrative
        },
        auto: app.autoModes ? {
            revolution: !!app.autoModes.revolution,
            rotation: !!app.autoModes.rotation,
            density: !!app.autoModes.density,
            speed: !!app.autoModes.speed,
            spread: !!app.autoModes.spread,
            reflections: !!app.autoModes.reflections
        } : null,
        pointer: {
            sourcePos: { x: app.sourcePos.x, y: app.sourcePos.y },
            sourceAnchorPos: { x: app.sourceAnchorPos.x, y: app.sourceAnchorPos.y },
            sourceOffsets: app.triangleSourceOffsets ? app.triangleSourceOffsets.map(o => ({ x: o.x, y: o.y })) : [],
            parallelRange: app.parallelRange ? { min: app.parallelRange.min, max: app.parallelRange.max } : null
        },
        sliders: {
            rayNumber: app.rayNumber,
            raySpeed: app.raySpeed,
            spread: app.spread,
            sourceRotation: app.sourceRotation,
            beamWidth: app.beamWidth,
            alphaIntensity: app.alphaIntensity,
            trianglePointCount: app.trianglePointCount,
            triangleVertexBias: app.triangleVertexBias,
            maxBounces: app.MAX_BOUNCES
        }
    };
}


/**
 * Apply a structured Scene object back to the application state.
 * @param {Object} app - The main App object
 * @param {Object} scene - Structured scene schema
 */
export function applyScene(app, scene) {
    if (!scene) return;
    const normalizedSourcePattern = scene.options?.sourcePattern === 'triple-axis'
        ? 'single'
        : scene.options?.sourcePattern === 'triad'
            ? 'vertex'
            : scene.options?.sourcePattern;
    const normalizedSourceDirection = scene.options?.sourceDirection === 'parallel'
        ? 'down'
        : scene.options?.sourceDirection;
    const normalizedPatternId = normalizePatternId(scene.patternId);

    // 1. Shape
    if (scene.shape) {
        app.shape = scene.shape;
    }
    if (normalizedPatternId) {
        app.patternId = normalizedPatternId;
    }

    // 2. Options
    if (scene.options) {
        const o = scene.options;
        if (o.lightSourceMode !== undefined) app.lightSourceMode = o.lightSourceMode;
        if (normalizedSourcePattern !== undefined) app.sourcePattern = normalizedSourcePattern;
        if (o.sourceOption !== undefined) app.sourceOption = o.sourceOption;
        if (normalizedSourceDirection !== undefined) app.sourceDirection = normalizedSourceDirection;
        if (o.colorDistribution !== undefined) app.colorDistribution = o.colorDistribution;
        if (o.baseStyle !== undefined) app.baseStyle = o.baseStyle;
        if (o.flowMode !== undefined) app.flowMode = o.flowMode;
        if (o.isPaintMode !== undefined) app.isPaintMode = !!o.isPaintMode;
        if (o.isPaint2Mode !== undefined) app.isPaint2Mode = !!o.isPaint2Mode;
        if (o.isLightMode !== undefined) app.isLightMode = !!o.isLightMode;
        
        if (o.colorMode !== undefined) app.colorMode = o.colorMode;
        if (o.showAxes !== undefined) app.showAxes = !!o.showAxes;
        if (o.useTrail !== undefined) app.useTrail = !!o.useTrail;
        if (o.useTaper !== undefined) app.useTaper = !!o.useTaper;
        if (o.useBloom !== undefined) app.useBloom = !!o.useBloom;
        if (o.isWindowFull !== undefined) app.isWindowFull = !!o.isWindowFull;
        if (o.currentNarrative !== undefined) app.currentNarrative = o.currentNarrative;
    }

    // 3. Auto
    if (scene.auto && app.autoModes) {
        const a = scene.auto;
        if (a.revolution !== undefined) app.autoModes.revolution = !!a.revolution;
        if (a.rotation !== undefined) app.autoModes.rotation = !!a.rotation;
        if (a.density !== undefined) app.autoModes.density = !!a.density;
        if (a.speed !== undefined) app.autoModes.speed = !!a.speed;
        if (a.spread !== undefined) app.autoModes.spread = !!a.spread;
        if (a.reflections !== undefined) app.autoModes.reflections = !!a.reflections;
    }

    // 4. Pointer
    if (scene.pointer) {
        const p = scene.pointer;
        if (p.sourcePos) app.sourcePos = { x: p.sourcePos.x, y: p.sourcePos.y };
        if (p.sourceAnchorPos) app.sourceAnchorPos = { x: p.sourceAnchorPos.x, y: p.sourceAnchorPos.y };
        if (Array.isArray(p.sourceOffsets)) {
            app.triangleSourceOffsets = p.sourceOffsets.map(o => ({ x: o.x, y: o.y }));
        }
        if (p.parallelRange) {
            app.parallelRange = { min: p.parallelRange.min, max: p.parallelRange.max };
        }
    }

    // 5. Sliders
    if (scene.sliders) {
        const s = scene.sliders;
        if (s.rayNumber !== undefined) app.rayNumber = s.rayNumber;
        if (s.raySpeed !== undefined) app.raySpeed = s.raySpeed;
        if (s.spread !== undefined) app.spread = s.spread;
        if (s.sourceRotation !== undefined) app.sourceRotation = s.sourceRotation;
        if (s.beamWidth !== undefined) app.beamWidth = s.beamWidth;
        if (s.alphaIntensity !== undefined) app.alphaIntensity = s.alphaIntensity;
        if (s.trianglePointCount !== undefined) app.trianglePointCount = s.trianglePointCount;
        if (s.triangleVertexBias !== undefined) app.triangleVertexBias = s.triangleVertexBias;
        if (s.maxBounces !== undefined) app.MAX_BOUNCES = s.maxBounces;
    }


    // 5. Normalization & Sanitization (Logic preserved from App)
    if (typeof app.sanitizeSourcePosition === 'function') app.sanitizeSourcePosition();
    if (typeof app.normalizeLightSourceMode === 'function') app.normalizeLightSourceMode();
    
    // Explicitly reset rays to apply the new state visually
    if (typeof app.resetRays === 'function') {
        app.resetRays(true);
    }
}

/**
 * Apply a specific pattern to the app. 
 * This is the official path for pattern application.
 * @param {Object} app - The main App object
 * @param {string} patternId - Pattern ID from registry
 * @param {string} shapeId - Shape ID (defaults to current app shape)
 */
export function applyPattern(app, patternId, shapeId = app.shape) {
    patternId = normalizePatternId(patternId);
    const shapeData = SHAPE_REGISTRY[shapeId];
    if (!shapeData || !shapeData.patterns) return;
    
    const pattern = shapeData.patterns[patternId];
    if (!pattern) return;

    // Resolve abstract pattern settings (units, tokens)
    // We expect resolvePattern to return a structured state matching the new schema
    const resolved = resolvePattern(app, shapeId, pattern);

    // Record patternId
    app.patternId = patternId;
    app.sourceOption = null;

    // Apply resolved state through centralized paths to handle remapping and side effects
    if (resolved.options) {
        for (const [key, val] of Object.entries(resolved.options)) {
            updateOption(app, key, val);
        }
    }
    if (resolved.sliders) {
        for (const [key, val] of Object.entries(resolved.sliders)) {
            updateSlider(app, key, val, false); // Don't disable auto for slider presets
        }
    }
    if (resolved.pointer) {
        updatePointer(app, resolved.pointer);
    }

    // Explicit reset for full pattern application
    if (typeof app.resetRays === 'function') {
        app.resetRays(true);
    }
}

/**
 * Apply a sub-preset (e.g., basic, center, online) from the registry.
 * @param {Object} app - The main App object
 * @param {string} presetId - Sub-preset ID (basic, center, online)
 */
export function applySourceOption(app, presetId) {
    const shapeData = SHAPE_REGISTRY[app.shape];
    if (!shapeData || !shapeData.sourceOptions) return;

    const preset = shapeData.sourceOptions[presetId];
    if (!preset) return;

    const resolved = resolvePattern(app, app.shape, preset);

    if (resolved.options) {
        for (const [key, val] of Object.entries(resolved.options)) {
            updateOption(app, key, val);
        }
    }
    if (resolved.sliders) {
        for (const [key, val] of Object.entries(resolved.sliders)) {
            updateSlider(app, key, val, false);
        }
    }
    if (resolved.pointer) {
        updatePointer(app, resolved.pointer);
    }

    // VERTEX special case: always stay centered specifically for ONLINE mode
    if (app.sourcePattern === 'vertex' && presetId === 'online') {
        const center = app.getShapeLayoutCenter(app.shape);
        updatePointer(app, {
            sourceAnchorPos: center,
            sourcePos: center
        });
        updateSlider(app, 'spread', Math.PI / 3, false);
    }

    if (app.sourcePattern === 'strip') {
        updatePointer(app, {
            sourceAnchorPos: getStripAnchorPoint(app.shape, app.getShapeSize(), presetId)
        });
    }

    app.sourceOption = presetId;
    app.patternId = null;
    if (typeof app.resetRays === 'function') app.resetRays(true);
}

/**
 * Update an option on the app state.
 * @param {Object} app - The main App object
 * @param {string} key - The option key (New Schema)
 * @param {any} value - The next value
 */
export function updateOption(app, key, value) {
    let appKey = key;

    if (key === 'sourcePattern') {
        if (value === 'triple-axis') value = 'single';
        if (value === 'triad') value = 'vertex';
    }

    if (key === 'sourceDirection' && value === 'parallel') {
        value = 'down';
    }
    
    // Remapping
    
    if (key === 'renderMode') {
        app.isPaintMode = value === 'paint1';
        app.isPaint2Mode = value === 'paint2';
        app.isLightMode = value === 'light';
        if (typeof app.normalizeLightSourceMode === 'function') app.normalizeLightSourceMode();
        if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
        return;
    }

    if (key === 'shape') {
        if (typeof app.applyShapeSwitchReset === 'function') {
            app.shape = value;
            app.applyShapeSwitchReset(value);
        } else {
            app.shape = value;
        }
        return;
    }

    if (key === 'colorMode') {
        app.colorMode = value;
        return;
    }

    if (['showAxes', 'useTrail', 'useTaper', 'useBloom', 'isWindowFull'].includes(key)) {
        app[key] = !!value;
        return;
    }

    if (key === 'currentNarrative') {
        app.currentNarrative = value;
        if (typeof app.persistState === 'function') app.persistState();
        return;
    }

    if (key === 'autoMode') {
        // value expected to be { key: string, value: boolean }
        if (app.autoModes && value.key) {
            app.autoModes[value.key] = !!value.value;
        }
        return;
    }

    const prevValue = app[appKey];

    app[appKey] = value;

    // Side Effects
    if (key === 'sourcePattern') {
        if (prevValue === 'single' && value !== 'single') {
            app.sourceAnchorPos = app.getShapeLayoutCenter(app.shape);
        }
        if (typeof app.resetTriangleSourceOffsets === 'function') app.resetTriangleSourceOffsets();
    }

    if (key === 'lightSourceMode') {
        if (typeof app.normalizeLightSourceMode === 'function') app.normalizeLightSourceMode();
        if (app.shape === 'parabola' && value === 'point') {
            app.sourcePos = app.getShapeDefaults('parabola').sourcePos;
        }
        // One-time auto-calculation of parallel range when switching to parallel mode
        if (value === 'parallel' && typeof app.recalcParallelRange === 'function') {
            app.recalcParallelRange();
        }
    }

    // Explicit reset for incremental modes
    if (app.isPaint2Mode || app.isLightMode) app.resetRays(false, false);
}

/**
 * Update a slider on the app state.
 * @param {Object} app - The main App object
 * @param {string} key - The slider key (New Schema)
 * @param {number} value - The next value
 * @param {boolean} disableAuto - Whether to disable auto modes
 */
export function updateSlider(app, key, value, disableAuto = true) {
    let appKey = key;
    
    // Remapping
    if (key === 'maxBounces') appKey = 'MAX_BOUNCES';

    app[appKey] = value;

    // Disabling Auto Modes
    if (disableAuto && app.autoModes) {
        if (key === 'sourceRotation') app.autoModes.rotation = false;
        if (key === 'rayNumber') app.autoModes.density = false;
        if (key === 'raySpeed') app.autoModes.speed = false;
        if (key === 'spread') app.autoModes.spread = false;
        if (key === 'maxBounces') app.autoModes.reflections = false;
    }

    // Reset rays for incremental rendering
    if (app.isPaint2Mode || app.isLightMode) {
        // Alpha or Speed changes shouldn't necessarily reset the accumulation buffer
        // but density/spread/reflections definitely should.
        const shouldResetBuffer = [
            'rayNumber', 'spread', 'maxBounces', 'sourceRotation', 
            'trianglePointCount', 'triangleVertexBias'
        ].includes(key);
        if (shouldResetBuffer) app.resetRays(false, false);
    }
}


/**
 * Update pointer positions.
 * @param {Object} app - The main App object
 * @param {Object} pointerUpdate - The pointer fields to update
 */
export function updatePointer(app, pointerUpdate) {
    if (pointerUpdate.sourcePos) {
        app.sourcePos = { ...pointerUpdate.sourcePos };
        if (!pointerUpdate.sourceAnchorPos && app.sourcePattern !== 'single') {
            app.sourceAnchorPos = { ...pointerUpdate.sourcePos };
        }
    }
    if (pointerUpdate.sourceAnchorPos) {
        app.sourceAnchorPos = { ...pointerUpdate.sourceAnchorPos };
    }
    if (pointerUpdate.sourceOffsets) {
        app.triangleSourceOffsets = pointerUpdate.sourceOffsets.map(o => ({ ...o }));
    }
    if (pointerUpdate.parallelRange) {
        app.parallelRange = { ...pointerUpdate.parallelRange };
    }

    // Reset rays for incremental rendering
    if (app.isPaint2Mode || app.isLightMode) {
        app.resetRays(false, false);
    }
}
