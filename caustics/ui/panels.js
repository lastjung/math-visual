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
}

export function shapePresets(app) {
    const size = app.getShapeSize();
    return {
        circle: [
            { label: 'Center Orbit', note: 'A compact point-source setup for finding stable circular loops.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.62 }, spread: 0.35, lightSourceMode: 'point' }) },
            { label: 'Wide Sweep', note: 'Push the source off-center and widen the fan to compare dense and sparse returns.', apply: () => ({ sourcePos: { x: -size * 0.4, y: -size * 0.2 }, spread: 1.4, lightSourceMode: 'point' }) },
            { label: 'Parallel Wash', note: 'A clean parallel pass across the circle for smooth, even interference bands.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.75 }, sourceRotation: 0, lightSourceMode: 'parallel', spread: 0 }) }
        ],
        rect: [
            { label: 'Top Bounce', note: 'A narrow centered drop that reads as a clean vertical bounce ladder before the pattern spreads sideways.', apply: () => ({ sourcePos: { x: 0, y: -size * 0.96 }, sourceRotation: 0, spread: (40 * Math.PI) / 180, lightSourceMode: 'point' }) },
            { label: 'Side Scan', note: 'A compact side-entry emitter positioned at the upper left for localized beam studies.', apply: () => ({ sourcePos: { x: -size * 0.5, y: -size * 0.4 }, sourceRotation: (-75 * Math.PI) / 180, parallelRange: { min: -size * 0.5, max: size * 0.5 }, spread: 0, lightSourceMode: 'parallel' }) },
            { label: 'Corner Echo', note: 'A corner launch from the top-left vertex at a -45 degree angle with a wide 60 degree spread.', apply: () => ({ sourcePos: { x: -size * 0.75, y: -size * 1.05 }, sourceRotation: (-45 * Math.PI) / 180, spread: (60 * Math.PI) / 180, lightSourceMode: 'point' }) }
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
}

export function shapePanelContent(shape) {
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
}
