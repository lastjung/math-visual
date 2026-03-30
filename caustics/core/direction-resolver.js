import { Physics } from '../sim/physics.js';
import { getShapeLayoutCenter } from './shape-config.js';

export function getTriangleLaunchAngle(app, origin, size, localT = 0.5) {
    const baseAngle = Math.PI / 2 + app.sourceRotation;
    const spreadOffset = (localT - 0.5) * app.spread;
    const layoutCenter = getShapeLayoutCenter(app.shape, size);

    if (app.sourceDirection === 'down') {
        return baseAngle + spreadOffset;
    }

    const dx = layoutCenter.x - origin.x;
    const dy = layoutCenter.y - origin.y;
    const dist = Math.hypot(dx, dy);

    if (app.sourceDirection === 'inward') {
        const inwardAngle = dist < 0.1 ? Math.PI : Math.atan2(dy, dx);
        return inwardAngle + app.sourceRotation + spreadOffset;
    }

    if (app.sourceDirection === 'outward') {
        const outwardAngle = dist < 0.1 ? 0 : Math.atan2(-dy, -dx);
        return outwardAngle + app.sourceRotation + spreadOffset;
    }

    if (app.sourceDirection === 'edge-normal') {
        const inwardNormal = Physics.getNormal(origin.x, origin.y, app.shape, size);
        const normalAngle = Math.atan2(-inwardNormal.y, -inwardNormal.x);
        return normalAngle + app.sourceRotation + spreadOffset;
    }

    return baseAngle + spreadOffset;
}
