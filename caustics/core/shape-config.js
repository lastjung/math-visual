import { Physics } from '../sim/physics.js';

export function getDefaultSourcePos() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    return { x: 0, y: -size * 0.7 };
}

export function getShapeDefaults(app, shape) {
    const sizeMult = app.isWindowFull ? 0.45 : 0.35;
    const size = Math.min(app.canvas?.width || window.innerWidth, app.canvas?.height || window.innerHeight) * sizeMult;
    const edgePad = Math.max(8, size * 0.04);
    const defaults = {
        sourcePos: { x: 0, y: -size * 0.7 },
        sourceRotation: 0
    };

    if (shape === 'ellipse') {
        const fDist = size * 0.88;
        defaults.sourcePos = { x: -fDist, y: 0 };
    } else if (shape === 'cardioid') {
        defaults.sourcePos = { x: -size * 0.4, y: 0 };
    } else if (shape === 'parabola') {
        defaults.sourcePos = { x: 0, y: size * (Physics.PARABOLA_OFFSET_V + Physics.PARABOLA_P) };
    } else if (shape === 'rect') {
        defaults.sourcePos = { x: 0, y: -(size * 1.05 - edgePad) };
    } else if (shape === 'v-oval' || shape === 'vv-oval') {
        const fDist = size * 0.6324;
        defaults.sourcePos = { x: 0, y: -fDist };
    } else if (shape === 'triangle') {
        defaults.sourcePos = { x: 0, y: size * 0.2 };
    }

    return defaults;
}

export function getTriangleVertices(size) {
    const tr = size * 1.17;
    const toy = size * 0.2;
    return [
        { x: 0, y: -tr + toy },
        { x: tr * Math.sqrt(3) / 2, y: tr / 2 + toy },
        { x: -tr * Math.sqrt(3) / 2, y: tr / 2 + toy }
    ];
}

export function getShapeLayoutCenter(shape, size) {
    if (shape === 'triangle') return { x: 0, y: size * 0.2 };
    if (shape === 'cardioid') return { x: size * 0.5, y: 0 };
    return { x: 0, y: 0 };
}

export function getRectVertices(size) {
    const rw = size * 1.5;
    const rh = size * 2.1;
    const hw = rw / 2;
    const hh = rh / 2;
    return [
        { x: -hw, y: -hh },
        { x: hw, y: -hh },
        { x: hw, y: hh },
        { x: -hw, y: hh }
    ];
}

export function getVertexLayoutPoints(shape, size) {
    if (shape === 'triangle') return getTriangleVertices(size);
    if (shape === 'rect') return getRectVertices(size);
    if (shape === 'parabola') {
        return [0, Math.PI, Math.PI * 2].map((rad) => Physics.getShapePoint(rad, shape, size));
    }
    return [-Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) / 3, -Math.PI / 2 + (Math.PI * 4) / 3]
        .map((rad) => Physics.getShapePoint(rad, shape, size));
}

export function getTriangleBaseOrigins(app, size) {
    const base = { ...app.sourcePos };

    if (app.triangleSourceMode === 'triad') {
        const layoutCenter = getShapeLayoutCenter(app.shape, size);
        const offset = {
            x: base.x - layoutCenter.x,
            y: base.y - layoutCenter.y
        };

        return getVertexLayoutPoints(app.shape, size).map((vertex) => ({
            x: vertex.x + offset.x,
            y: vertex.y + offset.y
        }));
    }

    if (app.triangleSourceMode === 'strip') {
        const count = Math.max(2, Math.floor(app.trianglePointCount));
        const halfWidth = size * (0.12 + app.triangleVertexBias * 0.42);
        const axisAngle = app.sourceRotation;
        const dx = Math.cos(axisAngle);
        const dy = Math.sin(axisAngle);

        return Array.from({ length: count }, (_, index) => {
            const t = count === 1 ? 0.5 : index / (count - 1);
            const offset = (t - 0.5) * 2 * halfWidth;
            return {
                x: base.x + dx * offset,
                y: base.y + dy * offset
            };
        });
    }

    return [base];
}

export function getTriangleSourceOrigins(app, size) {
    const baseOrigins = getTriangleBaseOrigins(app, size);
    const offsets = Array.isArray(app.triangleSourceOffsets) ? app.triangleSourceOffsets : [];

    return baseOrigins.map((origin, index) => {
        const offset = offsets[index];
        if (!offset || typeof offset.x !== 'number' || typeof offset.y !== 'number') {
            return origin;
        }

        return {
            x: origin.x + offset.x,
            y: origin.y + offset.y
        };
    });
}

export function getTriangleLaunchAngle(app, origin, size, localT = 0.5) {
    const baseAngle = Math.PI / 2 + app.sourceRotation;
    const spreadOffset = (localT - 0.5) * app.spread;
    const layoutCenter = getShapeLayoutCenter(app.shape, size);

    if (app.triangleDirectionMode === 'parallel') {
        return baseAngle + spreadOffset;
    }

    if (app.triangleDirectionMode === 'inward') {
        const inwardAngle = Math.atan2(layoutCenter.y - origin.y, layoutCenter.x - origin.x);
        return inwardAngle + app.sourceRotation + spreadOffset;
    }

    if (app.triangleDirectionMode === 'outward') {
        const outwardAngle = Math.atan2(origin.y - layoutCenter.y, origin.x - layoutCenter.x);
        return outwardAngle + app.sourceRotation + spreadOffset;
    }

    if (app.triangleDirectionMode === 'edge-normal') {
        const inwardNormal = Physics.getNormal(origin.x, origin.y, app.shape, size);
        const normalAngle = Math.atan2(-inwardNormal.y, -inwardNormal.x);
        return normalAngle + app.sourceRotation + spreadOffset;
    }

    return baseAngle + spreadOffset;
}
