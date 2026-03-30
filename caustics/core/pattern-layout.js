import { Physics } from '../sim/physics.js';
import { getShapeBasicAnchor, getShapeLayoutCenter, getVertexLayoutPoints } from './shape-config.js';

function recenterPoints(points, targetCenter) {
    if (!Array.isArray(points) || points.length === 0) return points;

    const centroid = points.reduce((acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y
    }), { x: 0, y: 0 });

    const currentCenter = {
        x: centroid.x / points.length,
        y: centroid.y / points.length
    };

    const dx = targetCenter.x - currentCenter.x;
    const dy = targetCenter.y - currentCenter.y;

    return points.map((point) => ({
        x: point.x + dx,
        y: point.y + dy
    }));
}

export function getVertexOnlinePoints(shape, size) {
    const vertices = getVertexLayoutPoints(shape, size);
    if (!Array.isArray(vertices) || vertices.length === 0) return vertices;

    if (shape === 'triangle' || shape === 'rect' || shape === 'parabola') {
        return vertices.map((vertex, index) => {
            const next = vertices[(index + 1) % vertices.length];
            return {
                x: (vertex.x + next.x) * 0.5,
                y: (vertex.y + next.y) * 0.5
            };
        });
    }

    if (shape === 'circle' || shape === 'ellipse') {
        // Special Case: Vertex Online for Circle/Ellipse should be X-axis symmetric (Horizontal)
        return [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rad) => {
            const point = Physics.getShapePoint(rad, shape, size);
            return point;
        });
    }

    if (shape === 'cardioid') {
        const center = getShapeLayoutCenter(shape, size);
        const cusp = vertices[0];
        return recenterPoints([
            cusp,
            {
                x: center.x + (vertices[1].x - center.x) * 1.0,
                y: center.y + (vertices[1].y - center.y) * 1.0
            },
            {
                x: center.x + (vertices[2].x - center.x) * 1.0,
                y: center.y + (vertices[2].y - center.y) * 1.0
            }
        ], center);
    }

    const layoutCenter = getShapeLayoutCenter(shape, size);
    return vertices.map((vertex) => {
        return {
            x: layoutCenter.x + (vertex.x - layoutCenter.x) * 1.0,
            y: layoutCenter.y + (vertex.y - layoutCenter.y) * 1.0
        };
    });
}

function getTopmostPoint(points) {
    if (!Array.isArray(points) || points.length === 0) return null;
    return points.reduce((best, point) => {
        if (!best) return point;
        if (point.y < best.y) return point;
        if (point.y === best.y && point.x < best.x) return point;
        return best;
    }, null);
}

export function getStripAnchorPoint(shape, size, optionId) {
    if (optionId === 'center') {
        return getShapeLayoutCenter(shape, size);
    }

    if (optionId === 'online') {
        const sidePoint = getTopmostPoint(getVertexOnlinePoints(shape, size));
        if (sidePoint) return sidePoint;
    }

    if (optionId === 'basic') {
        return getShapeBasicAnchor(shape, size);
    }

    const vertexPoint = getTopmostPoint(getVertexLayoutPoints(shape, size));
    if (vertexPoint) return vertexPoint;

    return getShapeLayoutCenter(shape, size);
}

export function getTriangleBaseOrigins(app, size) {
    const base = app.sourcePattern === 'single'
        ? { ...app.sourcePos }
        : (app.sourceAnchorPos && typeof app.sourceAnchorPos.x === 'number' && typeof app.sourceAnchorPos.y === 'number'
            ? { ...app.sourceAnchorPos }
            : getShapeLayoutCenter(app.shape, size));

    if (app.sourcePattern === 'vertex') {
        const layoutCenter = getShapeLayoutCenter(app.shape, size);
        const offset = {
            x: base.x - layoutCenter.x,
            y: base.y - layoutCenter.y
        };
        const vertexPoints = app.sourceOption === 'online'
            ? getVertexOnlinePoints(app.shape, size)
            : getVertexLayoutPoints(app.shape, size);

        return vertexPoints.map((vertex) => ({
            x: vertex.x + offset.x,
            y: vertex.y + offset.y
        }));
    }

    if (app.sourcePattern === 'strip') {
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
