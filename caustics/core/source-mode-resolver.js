import { Physics } from '../sim/physics.js';
import { Simulator } from '../sim/simulator.js';

export function buildLaunchRayConfigs(app, rayCount, size, flowOffset = app.flowOffset) {
    const totalCount = Math.max(1, Math.floor(rayCount));
    const aimAngle = Math.PI / 2;
    const configs = [];
    const origins = app.getTriangleSourceOrigins(size);
    const groupCount = origins.length;

    const basePerGroup = Math.floor(totalCount / groupCount);
    const remainder = totalCount % groupCount;

    origins.forEach((origin, groupIndex) => {
        const localCount = basePerGroup + (groupIndex < remainder ? 1 : 0);
        for (let localIndex = 0; localIndex < localCount; localIndex++) {
            const t = localCount <= 1 ? 0.5 : localIndex / (localCount - 1);
            const tGlobal = totalCount <= 1 ? 0 : configs.length / (totalCount - 1);

            let sPos;
            let angle;

            if (app.lightSourceMode === 'parallel') {
                const d = app.parallelRange.min + t * (app.parallelRange.max - app.parallelRange.min);
                const cosR = Math.cos(app.sourceRotation);
                const sinR = Math.sin(app.sourceRotation);
                sPos = { x: origin.x + d * cosR, y: origin.y + d * sinR };
                angle = app.sourceRotation + Math.PI / 2;
            } else if (app.lightSourceMode === 'converge') {
                const targetPos = origin;
                const baseAngle = aimAngle + app.sourceRotation + (t - 0.5) * app.spread;
                const hit = Physics.getConvergeLaunchPoint(targetPos, baseAngle, app.shape, size);
                if (hit) {
                    sPos = { x: hit.x, y: hit.y };
                    angle = baseAngle + Math.PI;
                } else {
                    sPos = { x: targetPos.x, y: targetPos.y };
                    angle = baseAngle;
                }
            } else {
                angle = app.getTriangleLaunchAngle(origin, size, t);
                sPos = { x: origin.x, y: origin.y };
            }

            configs.push({
                sPos: Physics.offsetRayStart(sPos, angle, size),
                angle,
                t: tGlobal,
                groupIndex,
                groupCount,
                localIndex,
                localCount
            });
        }
    });

    return configs;
}

export function normalizeLightSourceMode(app) {
    if (app.isPaint2Mode && app.lightSourceMode === 'converge') {
        app.lightSourceMode = 'point';
        Simulator.clear();
    }
}

export function recalcParallelRange(app) {
    if (!app.canvas) return;
    const size = app.getShapeSize();
    const origin = app.sourcePos;
    const cosR = Math.cos(app.sourceRotation);
    const sinR = Math.sin(app.sourceRotation);

    let minD = Infinity;
    let maxD = -Infinity;
    const scanStep = 2;
    const scanLimit = size * 3;

    for (let d = -scanLimit; d <= scanLimit; d += scanStep) {
        const px = origin.x + d * cosR;
        const py = origin.y + d * sinR;
        if (Physics.isInside(px, py, app.shape, size)) {
            if (d < minD) minD = d;
            if (d > maxD) maxD = d;
        }
    }

    if (!Number.isFinite(minD) || !Number.isFinite(maxD)) {
        app.parallelRange = { min: -size * 0.5, max: size * 0.5 };
        return;
    }

    const margin = 0.95;
    const halfWidth = (maxD - minD) * 0.5;
    const centerD = (minD + maxD) * 0.5;

    app.parallelRange = {
        min: centerD - (halfWidth * margin),
        max: centerD + (halfWidth * margin)
    };
}
