/**
 * LIGHT FLOW LAB: Physics Engine
 * Handles all geometric and raycasting calculations
 */

export const Physics = {
    /**
     * Get a point on the boundary shape based on angle (rad)
     */
    getShapePoint(rad, type, size) {
        switch(type) {
            case 'ellipse': return { x: Math.cos(rad) * size * 1.1, y: Math.sin(rad) * size * 1.1 * 0.6 };
            case 'v-oval': return { x: Math.cos(rad) * size * 0.9, y: Math.sin(rad) * size * 1.1 };
            case 'cardioid': 
                const r = size * (1 - Math.cos(rad)) * 0.5;
                return { x: r * Math.cos(rad) + size*0.3, y: r * Math.sin(rad) };
            case 'parabola':
                // Symmetric range [-2, 2] for rad from 0 to 2PI
                const px = (rad / Math.PI - 1) * 2.0; 
                // A cup shape opening upwards: vertex at (0, 0.5*size)
                return { x: px * size * 0.5, y: (0.5 - px * px * 0.2) * size };
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
        else if (type === 'parabola') { 
            // For y = (0.5 - 0.2 * (x/(0.5*size))^2) * size
            // dy/dx = -0.8 * x / (0.5 * size)
            nx = 0.8 * x / (0.5 * size); 
            ny = 1; 
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
        return { x: nx / len, y: ny / len };
    },

    /**
     * Check if a point is inside the given shape
     */
    isInside(px, py, type, size) {
        if (type === 'circle') return (px*px + py*py) < size*size;
        if (type === 'ellipse') return (px*px)/(size*size*1.21) + (py*py)/(size*size*1.21*0.36) < 1;
        if (type === 'v-oval') return (px*px)/(size*size*0.81) + (py*py)/(size*size*1.21) < 1;
        if (type === 'parabola') return py < (0.5 - Math.pow(px/(size*0.5), 2) * 0.2) * size;
        if (type === 'cardioid') {
            const cx = px - size*0.3;
            return Math.sqrt(cx*cx + py*py) < size * (1 - Math.cos(Math.atan2(py, cx))) * 0.5;
        }
        if (type === 'rect') {
            const rw = size * 1.5;
            const rh = size * 2.1;
            return Math.abs(px) < rw/2 && Math.abs(py) < rh/2;
        }
        return false;
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

        const nudge = 0.05; 
        const isCurrentlyInside = this.isInside(sx, sy, type, size);
        const forwardInside = this.isInside(sx + dx * nudge, sy + dy * nudge, type, size);

        // Case 1: We are inside (or on the edge pointing in)
        if (isCurrentlyInside || forwardInside) {
            let low = 0;
            let high = size * 5; 
            
            // Binary search for the EXIT point
            for (let i = 0; i < 24; i++) {
                const mid = (low + high) / 2;
                if (this.isInside(sx + dx * mid, sy + dy * mid, type, size)) low = mid;
                else high = mid;
            }
            return { x: sx + dx * high, y: sy + dy * high };
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
        return { x: sx + dx * high, y: sy + dy * high };
    }
};
