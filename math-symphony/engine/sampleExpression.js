export function sampleExpressionAtProgress(expression, params, progress) {
    const safeProgress = clamp01(progress);

    switch (expression.type) {
        case 'cartesian':
            return sampleCartesian(expression, params, safeProgress);
        case 'parametric':
            return sampleParametric(expression, params, safeProgress);
        case 'polar':
            return samplePolar(expression, params, safeProgress);
        case 'implicit':
            return sampleImplicit(expression, params, safeProgress);
        default:
            return null;
    }
}

export function resolveExpressionDomain(expression, params) {
    const domain = expression.sample?.domain;
    if (!domain) {
        return defaultDomainForType(expression.type, expression.bounds);
    }

    const min = typeof domain.min === 'function' ? domain.min({ params }) : domain.min;
    const max = typeof domain.max === 'function' ? domain.max({ params }) : domain.max;
    return { min, max };
}

function sampleCartesian(expression, params, progress) {
    if (!expression.sample?.y || !expression.bounds) return null;
    const x = expression.bounds.xMin + (expression.bounds.xMax - expression.bounds.xMin) * progress;
    const y = expression.sample.y({ x, params });
    if (!Number.isFinite(y)) return null;
    return { x, y, value: y };
}

function sampleParametric(expression, params, progress) {
    if (!expression.sample?.x || !expression.sample?.y) return null;
    const domain = resolveExpressionDomain(expression, params);
    const t = domain.min + (domain.max - domain.min) * progress;
    const x = expression.sample.x({ t, params });
    const y = expression.sample.y({ t, params });
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y, value: y };
}

function samplePolar(expression, params, progress) {
    if (!expression.sample?.r) return null;
    const domain = resolveExpressionDomain(expression, params);
    const theta = domain.min + (domain.max - domain.min) * progress;
    const r = expression.sample.r({ theta, params });
    if (!Number.isFinite(r)) return null;
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    return { x, y, value: r };
}

function sampleImplicit(expression, params, progress) {
    if (!expression.sample?.value || !expression.bounds) return null;
    const { xMin, xMax, yMin, yMax } = expression.bounds;
    const x = xMin + (xMax - xMin) * progress;
    const steps = 200;
    let bestY = null;
    let bestError = Infinity;

    for (let i = 0; i <= steps; i++) {
        const y = yMin + ((yMax - yMin) * i) / steps;
        const value = expression.sample.value({ x, y, params });
        if (!Number.isFinite(value)) continue;
        const error = Math.abs(value);
        if (error < bestError) {
            bestError = error;
            bestY = y;
        }
    }

    if (bestY === null) return null;
    return { x, y: bestY, value: bestY, error: bestError };
}

function defaultDomainForType(type, bounds) {
    if (type === 'parametric') {
        return { min: -10, max: 10 };
    }
    if (type === 'polar') {
        return { min: 0, max: Math.PI * 2 };
    }
    if (bounds) {
        return { min: bounds.xMin, max: bounds.xMax };
    }
    return { min: -10, max: 10 };
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
