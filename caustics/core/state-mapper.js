/**
 * State Mapper (Phase 0)
 * Translates between flattened App state and structured Scene schema.
 */

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
            sourceOffsets: app.triangleSourceOffsets ? app.triangleSourceOffsets.map(o => ({ x: o.x, y: o.y })) : []
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
