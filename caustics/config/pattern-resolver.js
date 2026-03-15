/**
 * Pattern Resolver (Phase 3)
 * Resolves abstract scene schema values (tokens, units) into concrete application values.
 */

/**
 * Resolve a single value that might be unit-based (e.g., size-relative).
 * @param {any} v - The value to resolve
 * @param {number} size - Current shape size
 * @returns {any} Resolved value
 */
function resolveUnitValue(v, size) {
    if (v && typeof v === 'object' && v.unit === 'size') {
        return v.value * size;
    }
    return v;
}

/**
 * Resolve pointer coordinates and tokens.
 * @param {Object} app - The main App object
 * @param {string} shapeId - Current shape ID
 * @param {Object} pointerData - Pointer config from registry
 * @returns {Object} Resolved pointer values
 */
export function resolvePointer(app, shapeId, pointerData) {
    if (!pointerData) return {};
    const size = app.getShapeSize();
    const result = {};

    // 1. Handle explicit sourcePos (with potential unit resolution)
    if (pointerData.sourcePos) {
        result.sourcePos = {
            x: resolveUnitValue(pointerData.sourcePos.x, size),
            y: resolveUnitValue(pointerData.sourcePos.y, size)
        };
    }

    // 2. Handle Token-based presets
    if (pointerData.sourcePreset === 'shape-focus') {
        const defaults = app.getShapeDefaults(shapeId);
        result.sourcePos = { ...defaults.sourcePos };
    }
    
    if (pointerData.anchorPreset === 'shape-center') {
        result.sourceAnchorPos = app.getShapeLayoutCenter(shapeId);
    }

    // 3. Handle sourceOffsets
    if (Array.isArray(pointerData.sourceOffsets)) {
        result.sourceOffsets = pointerData.sourceOffsets.map(o => ({
            x: resolveUnitValue(o.x, size),
            y: resolveUnitValue(o.y, size)
        }));
    }

    return result;
}

/**
 * Resolve a full pattern definition into a state object.
 * @param {Object} app - The main App object
 * @param {string} shapeId - Current shape ID
 * @param {Object} pattern - Pattern definition from registry
 * @returns {Object} Resolved state updates
 */
export function resolvePattern(app, shapeId, pattern) {
    const result = {};

    // 1. Simple Options (direct map)
    if (pattern.options) Object.assign(result, pattern.options);

    // 2. Pointer resolution (Tokens/Units)
    const resolvedPointer = resolvePointer(app, shapeId, pattern.pointer);
    Object.assign(result, resolvedPointer);

    // 3. Sliders (direct map)
    if (pattern.sliders) Object.assign(result, pattern.sliders);

    // 4. Bridge / Remapping (New Schema names -> Current App State names)
    // This maintains compatibility until the entire App state is refactored.
    const remapped = { ...result };

    if (remapped.sourceLayout !== undefined) {
        remapped.triangleSourceMode = remapped.sourceLayout;
        delete remapped.sourceLayout;
    }
    if (remapped.sourceDirection !== undefined) {
        remapped.triangleDirectionMode = remapped.sourceDirection;
        delete remapped.sourceDirection;
    }
    if (remapped.maxBounces !== undefined) {
        remapped.MAX_BOUNCES = remapped.maxBounces;
        delete remapped.maxBounces;
    }
    if (remapped.sourceOffsets !== undefined) {
        remapped.triangleSourceOffsets = remapped.sourceOffsets;
        delete remapped.sourceOffsets;
    }
    if (remapped.renderMode !== undefined) {
        remapped.isPaintMode = remapped.renderMode === 'paint';
        remapped.isPaint2Mode = remapped.renderMode === 'paint2';
        remapped.isLightMode = remapped.renderMode === 'light';
        delete remapped.renderMode;
    }

    return remapped;
}
