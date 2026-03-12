/**
 * LIGHT FLOW LAB: Physics Engine
 * Handles all geometric and raycasting calculations
 */

export const Physics = {
    PARABOLA_P: -0.25,
    PARABOLA_OFFSET_V: 0.75,
    PARABOLA_U_MAX: 1.0,
    BOUNDARY_EPSILON: 0.1,

    getParabolaAbsUMax() {
        return this.PARABOLA_U_MAX;
    },
    
    parabolaCurve(normalizedX) {
        return 4 * this.PARABOLA_P * normalizedX * normalizedX + this.PARABOLA_OFFSET_V;
    },

    cardioidImplicit(x, y, size) {
        const a = size * 0.75;
        const cx = x - size * 0.5;
        const r = Math.hypot(cx, y);
        return (r * r) + (a * cx) - (a * r);
    },

    /**
     * Get a point on the boundary shape based on angle (rad)
     */
    getShapePoint(rad, type, size) {
        switch(type) {
            case 'ellipse': return { x: Math.cos(rad) * size * 1.1, y: Math.sin(rad) * size * 1.1 * 0.6 };
            case 'v-oval': return { x: Math.cos(rad) * size * 0.9, y: Math.sin(rad) * size * 1.1 };
            case 'cardioid': 
                const r = size * (1 - Math.cos(rad)) * 0.75;
                return { x: r * Math.cos(rad) + size*0.5, y: r * Math.sin(rad) };
            case 'parabola':
                // In normalized coordinates: v = 4pu^2, where p is the signed focus value.
                const uMax = this.getParabolaAbsUMax();
                const u = -uMax + (rad / (Math.PI * 2)) * (2 * uMax);
                return {
                    x: u * size,
                    y: this.parabolaCurve(u) * size
                };
            case 'rect':
                const rw = size * 1.5;
                const rh = size * 2.1;
                // Periodic mapping of rad [0, 2PI] to perimeter
                const p = (rad / (2 * Math.PI)) * 2 * (rw + rh);
                if (p < rw) return { x: -rw/2 + p, y: -rh/2 };
                if (p < rw + rh) return { x: rw/2, y: -rh/2 + (p - rw) };
                if (p < 2*rw + rh) return { x: rw/2 - (p - (rw + rh)), y: rh/2 };
                return { x: -rw/2, y: rh/2 - (p - (2*rw + rh)) };
            default: return { x: Math.cos(rad) * size, y: Math.sin(rad) * size };
        }
    },

    /**
     * Get the normal vector at a given point on the boundary
     */
    getNormal(x, y, type, size) {
        let nx, ny;
        if (type === 'circle') { nx = -x; ny = -y; }
        else if (type === 'ellipse') { nx = -x; ny = -y / (0.6 * 0.6); }
        else if (type === 'v-oval') { nx = -x / (0.9 * 0.9); ny = -y / (1.1 * 1.1); }
        else if (type === 'cardioid') {
            const a = size * 0.75;
            const cx = x - size * 0.5;
            const r = Math.hypot(cx, y);
            if (r < 1e-6) {
                nx = -1;
                ny = 0;
            } else {
                const gradX = 2 * cx + a - (a * cx) / r;
                const gradY = 2 * y - (a * y) / r;
                nx = -gradX;
                ny = -gradY;
            }
        }
        else if (type === 'parabola') { 
            const u = x / size;
            // v = 4pu^2 => dv/du = 8pu
            nx = 8 * this.PARABOLA_P * u;
            ny = -1; 
        }
        else if (type === 'rect') {
            const rw = size * 1.5;
            const rh = size * 2.1;
            const hw = rw / 2;
            const hh = rh / 2;
            const dL = Math.abs(x + hw); const dR = Math.abs(x - hw);
            const dT = Math.abs(y + hh); const dB = Math.abs(y - hh);
            const m = Math.min(dL, dR, dT, dB);
            if (m === dL) { nx = 1; ny = 0; }
            else if (m === dR) { nx = -1; ny = 0; }
            else if (m === dT) { nx = 0; ny = 1; }
            else { nx = 0; ny = -1; }
        }
        else { nx = -x; ny = -y; } 
        
        const len = Math.sqrt(nx * nx + ny * ny);
        if (len < 1e-8) {
            return type === 'cardioid' ? { x: -1, y: 0 } : { x: 0, y: -1 };
        }
        return { x: nx / len, y: ny / len };
    },

    /**
     * Check if a point is inside the given shape
     */
    isInside(px, py, type, size) {
        if (type === 'circle') return (px*px + py*py) < size*size;
        if (type === 'ellipse') return (px*px)/(size*size*1.21) + (py*py)/(size*size*1.21*0.36) < 1;
        if (type === 'v-oval') return (px*px)/(size*size*0.81) + (py*py)/(size*size*1.21) < 1;
        if (type === 'parabola') {
            const u = px / size;
            const v = py / size;
            return v < this.parabolaCurve(u);
        }
        if (type === 'cardioid') {
            return this.cardioidImplicit(px, py, size) < 0;
        }
        if (type === 'rect') {
            const rw = size * 1.5;
            const rh = size * 2.1;
            return Math.abs(px) < rw/2 && Math.abs(py) < rh/2;
        }
        return false;
    },

    reflect(inX, inY, normal) {
        const dot = inX * normal.x + inY * normal.y;
        return {
            x: inX - 2 * dot * normal.x,
            y: inY - 2 * dot * normal.y,
            dot
        };
    },

    nudgeAfterHit(hitX, hitY, normal, shouldStayInside, epsilon = this.BOUNDARY_EPSILON) {
        const dir = shouldStayInside ? 1 : -1;
        return {
            x: hitX + normal.x * epsilon * dir,
            y: hitY + normal.y * epsilon * dir
        };
    },

    /**
     * Find where the ray hits the boundary
     * Uses fast binary search for internal rays, raymarch only for external
     */
    findBoundaryIntersection(sx, sy, angle, type, size) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Safety: If it's already far outside, don't even try
        const distSq = sx*sx + sy*sy;
        const maxRadiusSq = (size * 5) ** 2;
        if (distSq > maxRadiusSq) return null;

        // Cardioid is non-convex near the cusp, so the binary-search exit logic
        // used for convex shapes can jump to a later crossing and appear to tunnel.
        if (type === 'cardioid') {
            const startInside = this.isInside(sx, sy, type, size);
            const maxDist = size * 10;
            const step = Math.max(0.5, size * 0.01);
            let prevDist = 0;
            let prevInside = startInside;

            for (let d = step; d <= maxDist; d += step) {
                const cx = sx + dx * d;
                const cy = sy + dy * d;
                const currInside = this.isInside(cx, cy, type, size);
                if (currInside !== prevInside) {
                    let low = prevDist;
                    let high = d;
                    for (let i = 0; i < 28; i++) {
                        const mid = (low + high) * 0.5;
                        const mx = sx + dx * mid;
                        const my = sy + dy * mid;
                        if (this.isInside(mx, my, type, size) === prevInside) low = mid;
                        else high = mid;
                    }
                    const boundaryDist = (low + high) * 0.5;
                    return { x: sx + dx * boundaryDist, y: sy + dy * boundaryDist };
                }
                prevDist = d;
                prevInside = currInside;
            }
            return null;
        }

        const isCurrentlyInside = this.isInside(sx, sy, type, size);

        // Case 1: We are inside, so search for the exit point.
        if (isCurrentlyInside) {
            let low = 0;
            let high = size * 5; 
            
            // Binary search for the EXIT point
            for (let i = 0; i < 24; i++) {
                const mid = (low + high) / 2;
                if (this.isInside(sx + dx * mid, sy + dy * mid, type, size)) low = mid;
                else high = mid;
            }
            const boundaryDist = (low + high) * 0.5;
            return { x: sx + dx * boundaryDist, y: sy + dy * boundaryDist };
        } 
        
        // Case 2: We are outside pointing away or towards
        // Coarse raymarch to find entry
        const maxDist = size * 10;
        const step = size * 0.05;
        let entryDist = null;
        for (let d = step; d < maxDist; d += step) {
            if (this.isInside(sx + dx * d, sy + dy * d, type, size)) {
                entryDist = d;
                break;
            }
        }
        
        if (entryDist === null) return null;

        // Refine entry point
        let low = entryDist - step;
        let high = entryDist;
        for (let i = 0; i < 20; i++) {
            const mid = (low + high) / 2;
            if (!this.isInside(sx + dx * mid, sy + dy * mid, type, size)) low = mid;
            else high = mid;
        }
        const boundaryDist = (low + high) * 0.5;
        return { x: sx + dx * boundaryDist, y: sy + dy * boundaryDist };
    }
};
