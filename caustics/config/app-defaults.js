/**
 * Global Defaults (Phase 1 Draft)
 * Initial values for application settings used during initialization and fallbacks.
 */

export const GLOBAL_DEFAULTS = {
    options: {
        lightSourceMode: 'point',
        sourcePattern: 'single',      // Formerly sourceLayout
        sourceDirection: 'parallel',    // Formerly triangleDirectionMode
        colorDistribution: 'frequency',
        baseStyle: 'line',
        flowMode: 'none',
        renderMode: 'flow'           // Proposed unified render mode
    },
    sliders: {
        rayNumber: 30,
        raySpeed: 20,
        spread: Math.PI / 3,         // 60 degrees
        sourceRotation: 0,
        beamWidth: 1.6,
        alphaIntensity: 1.0,
        trianglePointCount: 5,
        triangleVertexBias: 0.6,
        maxBounces: 10               // Formerly MAX_BOUNCES
    }
};
