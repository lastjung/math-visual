import { mapPointToCanvas, normalizeBounds } from './normalize.js';
import { resolveExpressionDomain } from './sampleExpression.js';

const PREVIEW_COLORS = ['#c54d27', '#233045', '#b68a30', '#0f766e', '#7c3aed', '#db2777'];

export function renderScenePreview(canvas, scene, controllerSnapshot) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#fffaf2';
    ctx.fillRect(0, 0, width, height);

    if (!scene?.expressions?.length) return;

    const bounds = mergeBounds(scene.expressions.map((expression) => expression.bounds).filter(Boolean));
    if (bounds) {
        drawAxes(ctx, bounds, width, height);
    }

    scene.expressions.forEach((expression, index) => {
        const color = PREVIEW_COLORS[index % PREVIEW_COLORS.length];
        switch (expression.type) {
            case 'cartesian':
                drawCartesian(ctx, expression, controllerSnapshot, color, width, height);
                break;
            case 'parametric':
                drawParametric(ctx, expression, controllerSnapshot, color, width, height);
                break;
            case 'polar':
                drawPolar(ctx, expression, controllerSnapshot, color, width, height);
                break;
            case 'implicit':
                drawImplicit(ctx, expression, controllerSnapshot, color, width, height);
                break;
            default:
                break;
        }
    });
}

function drawAxes(ctx, bounds, width, height) {
    const fit = normalizeBounds(bounds, width, height, 28);
    const zeroX = fit.offsetX + (0 - bounds.xMin) * fit.scale;
    const zeroY = height - (fit.offsetY + (0 - bounds.yMin) * fit.scale);

    ctx.save();
    ctx.strokeStyle = 'rgba(22, 17, 15, 0.12)';
    ctx.lineWidth = 1;

    if (zeroY >= 0 && zeroY <= height) {
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(width, zeroY);
        ctx.stroke();
    }

    if (zeroX >= 0 && zeroX <= width) {
        ctx.beginPath();
        ctx.moveTo(zeroX, 0);
        ctx.lineTo(zeroX, height);
        ctx.stroke();
    }
    ctx.restore();
}

function drawCartesian(ctx, expression, params, color, width, height) {
    if (!expression.sample?.y || !expression.bounds) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;

    const steps = 800;
    let first = true;
    for (let i = 0; i <= steps; i++) {
        const x = expression.bounds.xMin + ((expression.bounds.xMax - expression.bounds.xMin) * i) / steps;
        let y;
        try {
            y = expression.sample.y({ x, params });
        } catch (e) {
            first = true;
            continue;
        }

        if (!Number.isFinite(y)) {
            first = true;
            continue;
        }

        const point = mapPointToCanvas({ x, y }, expression.bounds, width, height, 28);
        if (first) {
            ctx.moveTo(point.x, point.y);
            first = false;
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }

    ctx.stroke();
    ctx.restore();
}

function drawParametric(ctx, expression, params, color, width, height) {
    if (!expression.sample?.x || !expression.sample?.y || !expression.bounds) return;
    const domain = resolveExpressionDomain(expression, params);

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const steps = 900;
    let first = true;
    for (let i = 0; i <= steps; i++) {
        const t = domain.min + ((domain.max - domain.min) * i) / steps;
        let x;
        let y;
        try {
            x = expression.sample.x({ t, params });
            y = expression.sample.y({ t, params });
        } catch (e) {
            first = true;
            continue;
        }

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            first = true;
            continue;
        }

        const point = mapPointToCanvas({ x, y }, expression.bounds, width, height, 28);
        if (first) {
            ctx.moveTo(point.x, point.y);
            first = false;
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }

    ctx.stroke();
    ctx.restore();
}

function drawPolar(ctx, expression, params, color, width, height) {
    if (!expression.sample?.r || !expression.bounds) return;
    const domain = resolveExpressionDomain(expression, params);

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const steps = 1200;
    let first = true;
    for (let i = 0; i <= steps; i++) {
        const theta = domain.min + ((domain.max - domain.min) * i) / steps;
        let r;
        try {
            r = expression.sample.r({ theta, params });
        } catch (e) {
            first = true;
            continue;
        }

        if (!Number.isFinite(r)) {
            first = true;
            continue;
        }

        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const point = mapPointToCanvas({ x, y }, expression.bounds, width, height, 28);
        if (first) {
            ctx.moveTo(point.x, point.y);
            first = false;
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }

    ctx.stroke();
    ctx.restore();
}

function drawImplicit(ctx, expression, params, color, width, height) {
    if (!expression.sample?.value || !expression.bounds) return;

    const { xMin, xMax, yMin, yMax } = expression.bounds;
    const fit = normalizeBounds(expression.bounds, width, height, 28);
    const resX = 180;
    const resY = 140;
    const threshold = expression.sample.threshold ?? 0.1;

    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.75;

    for (let ix = 0; ix <= resX; ix++) {
        for (let iy = 0; iy <= resY; iy++) {
            const x = xMin + ((xMax - xMin) * ix) / resX;
            const y = yMin + ((yMax - yMin) * iy) / resY;
            let value;
            try {
                value = expression.sample.value({ x, y, params });
            } catch (e) {
                continue;
            }

            if (!Number.isFinite(value) || Math.abs(value) > threshold) continue;

            const px = fit.offsetX + (x - xMin) * fit.scale;
            const py = height - (fit.offsetY + (y - yMin) * fit.scale);
            ctx.fillRect(px, py, 1.8, 1.8);
        }
    }

    ctx.restore();
}

function mergeBounds(boundsList) {
    if (!boundsList.length) return null;
    return boundsList.reduce((merged, bounds) => ({
        xMin: Math.min(merged.xMin, bounds.xMin),
        xMax: Math.max(merged.xMax, bounds.xMax),
        yMin: Math.min(merged.yMin, bounds.yMin),
        yMax: Math.max(merged.yMax, bounds.yMax)
    }));
}
