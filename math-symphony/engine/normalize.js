export function normalizeBounds(bounds, viewportWidth, viewportHeight, padding = 24) {
    const xRange = bounds.xMax - bounds.xMin;
    const yRange = bounds.yMax - bounds.yMin;
    const usableWidth = Math.max(1, viewportWidth - padding * 2);
    const usableHeight = Math.max(1, viewportHeight - padding * 2);
    const scale = Math.min(usableWidth / xRange, usableHeight / yRange);

    return {
        scale,
        offsetX: padding + (usableWidth - xRange * scale) / 2,
        offsetY: padding + (usableHeight - yRange * scale) / 2
    };
}

export function mapPointToCanvas(point, bounds, viewportWidth, viewportHeight, padding = 24) {
    const fit = normalizeBounds(bounds, viewportWidth, viewportHeight, padding);
    return {
        x: fit.offsetX + (point.x - bounds.xMin) * fit.scale,
        y: viewportHeight - (fit.offsetY + (point.y - bounds.yMin) * fit.scale)
    };
}
