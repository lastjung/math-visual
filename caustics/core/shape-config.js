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

export function getTriangleSourceOrigins(app, size) {
    const base = { ...app.sourcePos };
    if (app.shape !== 'triangle' || app.lightSourceMode !== 'point') return [base];

    if (app.triangleSourceMode === 'triad') {
        const triangleCenter = { x: 0, y: size * 0.2 };
        const offset = {
            x: base.x - triangleCenter.x,
            y: base.y - triangleCenter.y
        };

        return getTriangleVertices(size).map((vertex) => ({
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

export function getTriangleLaunchAngle(app, origin, size, localT = 0.5) {
    const baseAngle = Math.PI / 2 + app.sourceRotation;
    const spreadOffset = (localT - 0.5) * app.spread;
    const triangleCenter = { x: 0, y: size * 0.2 };

    if (app.triangleSourceMode === 'single') {
        return baseAngle + spreadOffset;
    }

    if (app.triangleDirectionMode === 'inward') {
        const inwardAngle = Math.atan2(triangleCenter.y - origin.y, triangleCenter.x - origin.x);
        return inwardAngle + app.sourceRotation + spreadOffset;
    }

    if (app.triangleDirectionMode === 'outward') {
        const outwardAngle = Math.atan2(origin.y - triangleCenter.y, origin.x - triangleCenter.x);
        return outwardAngle + app.sourceRotation + spreadOffset;
    }

    if (app.triangleDirectionMode === 'edge-normal') {
        const inwardNormal = Physics.getNormal(origin.x, origin.y, 'triangle', size);
        const normalAngle = Math.atan2(-inwardNormal.y, -inwardNormal.x);
        return normalAngle + app.sourceRotation + spreadOffset;
    }

    return baseAngle + spreadOffset;
}
