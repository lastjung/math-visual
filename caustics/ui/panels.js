import { SHAPE_REGISTRY } from '../config/shape-registry.js';

export function trianglePanelContent(app, baseContent) {
    const sourceLabels = {
        single: 'Single Point',
        triad: 'Vertex',
        strip: 'Source Strip'
    };
    const directionLabels = {
        parallel: 'Parallel',
        inward: 'Inward',
        outward: 'Outward',
        'edge-normal': 'Edge Normal'
    };
    const isSingle = app.triangleSourceMode === 'single';

    if (isSingle) {
        return {
            ...baseContent,
            meta: 'Single Point',
            cardTitle: 'Single Emitter',
            cardCopy: 'One source follows the main grip, so this is the cleanest mode for reading periodic paths.',
            note: 'Tip: use the main grip for placement, then widen spread to open the reflection family.'
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
}

export function shapePresets(app) {
    const presets = {};

    Object.entries(SHAPE_REGISTRY).forEach(([shapeId, shapeData]) => {
        presets[shapeId] = Object.entries(shapeData.patterns || {}).map(([patternId, pattern]) => {
            return {
                label: pattern.label,
                note: pattern.note,
                apply: () => app.applyPattern(patternId)
            };

        });
    });

    return presets;
}


export function shapePanelContent(shape) {
    const data = SHAPE_REGISTRY[shape] || SHAPE_REGISTRY.circle;
    return data.copy;
}

