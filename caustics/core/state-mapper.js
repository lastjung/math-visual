import { SHAPE_REGISTRY } from '../config/shape-registry.js';
import { resolvePattern } from '../config/pattern-resolver.js';

/**
 * Capture current application state into a structured Scene object.
 * @param {Object} app - The main App object
 * @returns {Object} Structured scene schema
 */
export function readCurrentScene(app) {
    return {
        shape: app.shape,
        patternId: null, // Phase 0 default
        options: {
            lightSourceMode: app.lightSourceMode,
            sourceLayout: app.triangleSourceMode,      // Rename from triangleSourceMode
            sourceDirection: app.triangleDirectionMode, // Rename from triangleDirectionMode
            baseStyle: app.baseStyle,
            flowMode: app.flowMode,
            isPaintMode: app.isPaintMode,
            isPaint2Mode: app.isPaint2Mode,
            isLightMode: app.isLightMode
        },
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
            maxBounces: app.MAX_BOUNCES // Rename to lowercase in schema
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

    // 1. Shape
    if (scene.shape) {
        app.shape = scene.shape;
    }

    // 2. Options
    if (scene.options) {
        const o = scene.options;
        if (o.lightSourceMode !== undefined) app.lightSourceMode = o.lightSourceMode;
        if (o.sourceLayout !== undefined) app.triangleSourceMode = o.sourceLayout;
        if (o.sourceDirection !== undefined) app.triangleDirectionMode = o.sourceDirection;
        if (o.baseStyle !== undefined) app.baseStyle = o.baseStyle;
        if (o.flowMode !== undefined) app.flowMode = o.flowMode;
        if (o.isPaintMode !== undefined) app.isPaintMode = !!o.isPaintMode;
        if (o.isPaint2Mode !== undefined) app.isPaint2Mode = !!o.isPaint2Mode;
        if (o.isLightMode !== undefined) app.isLightMode = !!o.isLightMode;
    }

    // 3. Pointer
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

    // 4. Sliders
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
    const shapeData = SHAPE_REGISTRY[shapeId];
    if (!shapeData || !shapeData.patterns) return;
    
    const pattern = shapeData.patterns[patternId];
    if (!pattern) return;

    // Resolve pattern settings (units, tokens, and bridge/mapping)
    const resolvedState = resolvePattern(app, shapeId, pattern);

    // Record patternId
    app.patternId = patternId;

    // Apply resolved state directly to app
    Object.assign(app, resolvedState);

    // Side effect: Disable common auto-modes on pattern apply
    if (app.autoModes) {
        app.autoModes.revolution = false;
        app.autoModes.rotation = false;
    }

    // Visual Reset
    if (typeof app.resetRays === 'function') {
        app.resetRays(true);
    }
}

/**
 * Update an option on the app state.
 * @param {Object} app - The main App object
 * @param {string} key - The option key (New Schema)
 * @param {any} value - The next value
 */
export function updateOption(app, key, value) {
    let appKey = key;
    
    // Remapping
    if (key === 'sourceLayout') appKey = 'triangleSourceMode';
    if (key === 'sourceDirection') appKey = 'triangleDirectionMode';
    
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
    if (key === 'sourceLayout') {
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
