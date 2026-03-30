import { Physics } from '../sim/physics.js';

export function getDefaultSourcePos() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.35;
    return { x: 0, y: -size * 0.7 };
}

export function getShapeBasicAnchor(shape, size) {
    const edgePad = Math.max(8, size * 0.04);

    if (shape === 'ellipse') {
        return { x: -size * 0.88, y: 0 };
    }
    if (shape === 'cardioid') {
        return { x: -size * 0.4, y: 0 };
    }
    if (shape === 'parabola') {
        return { x: 0, y: size * (Physics.PARABOLA_OFFSET_V + Physics.PARABOLA_P) };
    }
    if (shape === 'rect') {
        return { x: 0, y: -(size * 1.05 - edgePad) };
    }
    if (shape === 'v-oval' || shape === 'vv-oval') {
        return { x: 0, y: -size * 0.6324 };
    }
    if (shape === 'triangle') {
        return { x: 0, y: size * -0.4 };
    }

    return { x: 0, y: -size * 0.7 };
}

export function getShapeDefaults(app, shape) {
    const sizeMult = app.isWindowFull ? 0.45 : 0.35;
    const size = Math.min(app.canvas?.width || window.innerWidth, app.canvas?.height || window.innerHeight) * sizeMult;
    const defaults = {
        sourcePos: getShapeBasicAnchor(shape, size),
        sourceRotation: 0
    };

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
    if (shape === 'parabola') return { x: 0, y: size * Physics.PARABOLA_OFFSET_V };
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
    if (shape === 'cardioid') {
        const center = getShapeLayoutCenter(shape, size);
        return [Math.PI, Math.PI / 3, (Math.PI * 5) / 3].map((rad, index) => {
            const point = Physics.getShapePoint(rad, shape, size);
            if (index === 0) return point;
            return {
                x: center.x + (point.x - center.x) * 0.40,
                y: center.y + (point.y - center.y) * 2
            };
        });
    }
    if (shape === 'parabola') {
        return [0, Math.PI, Math.PI * 2].map((rad) => Physics.getShapePoint(rad, shape, size));
    }
    // Original vertical-aligned vertices (Top point exists)
    return [-Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) / 3, -Math.PI / 2 + (Math.PI * 4) / 3]
        .map((rad) => Physics.getShapePoint(rad, shape, size));
}
