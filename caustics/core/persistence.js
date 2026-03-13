const VALID_NARRATIVES = [
    'none',
    'The Secret Foci of Ovals',
    'Double Oval: Shared Foci, Split Light',
    'The Parabolic Point',
    'Reflections of Order',
    'Circle of Infinite Light',
    'The Radiant Pulse of Heart',
    'The Hidden Soul of Beams',
    'Dance of the Photons'
];

export function buildPersistedState(app) {
    return {
        shape: app.shape,
        rayNumber: app.rayNumber,
        raySpeed: app.raySpeed,
        sourcePos: app.sourcePos,
        sourceRotation: app.sourceRotation,
        showAxes: app.showAxes,
        colorMode: app.colorMode,
        beamWidth: app.beamWidth,
        spread: app.spread,
        baseStyle: app.baseStyle,
        flowMode: app.flowMode,
        lightSourceMode: app.lightSourceMode,
        triangleSourceMode: app.triangleSourceMode,
        triangleDirectionMode: app.triangleDirectionMode,
        trianglePointCount: app.trianglePointCount,
        triangleVertexBias: app.triangleVertexBias,
        useTrail: app.useTrail,
        useTaper: app.useTaper,
        useBloom: app.useBloom,
        alphaIntensity: app.alphaIntensity,
        isPaintMode: app.isPaintMode,
        isPaint2Mode: app.isPaint2Mode,
        isLightMode: app.isLightMode,
        MAX_BOUNCES: app.MAX_BOUNCES,
        currentNarrative: app.currentNarrative,
        parallelRange: app.parallelRange
    };
}

export function persistState(app) {
    const snapshot = JSON.stringify(buildPersistedState(app));
    if (snapshot === app.lastPersistSnapshot) return;

    app.lastPersistSnapshot = snapshot;
    try {
        localStorage.setItem(app.STORAGE_KEY, snapshot);
    } catch (_) {
        // Ignore storage failures and continue rendering.
    }
}

export function restoreState(app) {
    try {
        const raw = localStorage.getItem(app.STORAGE_KEY);
        if (!raw) return false;

        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return false;

        app.shape = saved.shape ?? app.shape;
        app.rayNumber = saved.rayNumber ?? app.rayNumber;
        app.raySpeed = saved.raySpeed ?? app.raySpeed;
        if (saved.sourcePos && typeof saved.sourcePos.x === 'number' && typeof saved.sourcePos.y === 'number') {
            app.sourcePos = { x: saved.sourcePos.x, y: saved.sourcePos.y };
        }
        app.sanitizeSourcePosition();
        app.sourceRotation = saved.sourceRotation ?? app.sourceRotation;
        app.isFlowing = false;
        app.isLightVisible = false;
        app.showAxes = saved.showAxes ?? app.showAxes;
        app.growth = 0;
        app.colorMode = saved.colorMode ?? app.colorMode;
        app.beamWidth = saved.beamWidth ?? app.beamWidth;
        app.spread = saved.spread ?? app.spread;
        app.flowOffset = 0;
        app.baseStyle = saved.baseStyle ?? app.baseStyle;
        app.flowMode = saved.flowMode ?? app.flowMode;
        app.lightSourceMode = saved.lightSourceMode ?? 'point';
        app.triangleSourceMode = saved.triangleSourceMode ?? app.triangleSourceMode;
        app.triangleDirectionMode = saved.triangleDirectionMode ?? app.triangleDirectionMode;
        app.trianglePointCount = saved.trianglePointCount ?? app.trianglePointCount;
        app.triangleVertexBias = saved.triangleVertexBias ?? app.triangleVertexBias;
        app.normalizeLightSourceMode();
        app.useTrail = saved.useTrail ?? app.useTrail;
        app.useTaper = saved.useTaper ?? app.useTaper;
        app.useBloom = saved.useBloom ?? app.useBloom;
        app.alphaIntensity = saved.alphaIntensity ?? app.alphaIntensity;
        app.isPaintMode = saved.isPaintMode === true;
        app.isPaint2Mode = saved.isPaint2Mode === true;
        app.isLightMode = saved.isLightMode === true;
        app.parallelRange = saved.parallelRange ?? { min: -100, max: 100 };
        app.isSimulationMode = false;
        app.MAX_BOUNCES = saved.MAX_BOUNCES ?? app.MAX_BOUNCES;

        app.currentNarrative = VALID_NARRATIVES.includes(saved.currentNarrative)
            ? saved.currentNarrative
            : 'none';

        app.lastPersistSnapshot = raw;
        return true;
    } catch (_) {
        return false;
    }
}
