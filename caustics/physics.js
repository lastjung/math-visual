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
            case 'circle': return { x: Math.cos(rad) * size, y: Math.sin(rad) * size };
            case 'ellipse': return { x: Math.cos(rad) * size * 1.1, y: Math.sin(rad) * size * 1.1 * 0.6 };
            case 'cardioid': 
                const r = size * (1 - Math.cos(rad)) * 0.5;
                return { x: r * Math.cos(rad) + size*0.3, y: r * Math.sin(rad) };
            case 'parabola':
                // Symmetric range [-2, 2] for rad from 0 to 2PI
                const px = (rad / Math.PI - 1) * 2.0; 
                // A cup shape opening upwards: vertex at (0, 0.5*size)
                return { x: px * size * 0.5, y: (0.5 - px * px * 0.2) * size };
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
        else if (type === 'parabola') { 
            // For y = (0.5 - 0.2 * (x/(0.5*size))^2) * size
            // dy/dx = -0.8 * x / (0.5 * size)
            nx = 0.8 * x / (0.5 * size); 
            ny = 1; 
        }
        else { nx = -x; ny = -y; } 
        
        const len = Math.sqrt(nx * nx + ny * ny);
        return { x: nx / len, y: ny / len };
    },

    /**
     * Find where the ray hits the boundary
     * Uses fast binary search for internal rays, raymarch only for external
     */
    findBoundaryIntersection(sx, sy, angle, type, size) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        
        // Helper to check if a point is inside the shape
        const checkInside = (px, py) => {
            if (type === 'circle') return (px*px + py*py) < size*size;
            if (type === 'ellipse') return (px*px)/(size*size*1.21) + (py*py)/(size*size*1.21*0.36) < 1;
            if (type === 'parabola') return py < (0.5 - Math.pow(px/(size*0.5), 2) * 0.2) * size;
            if (type === 'cardioid') {
                const cx = px - size*0.3;
                return Math.sqrt(cx*cx + py*py) < size * (1 - Math.cos(Math.atan2(py, cx))) * 0.5;
            }
            return false;
        };

        const nudge = size * 0.03;  // Small forward nudge to escape the current boundary
        const startInside = checkInside(sx + dx * nudge, sy + dy * nudge);

        if (startInside) {
            // FAST PATH: Ray starts inside → simple binary search (only 20 iterations!)
            let low = nudge;
            let high = size * 3;
            
            // Verify that high is actually outside
            if (checkInside(sx + dx * high, sy + dy * high)) {
                return null; // Shouldn't happen for closed shapes
            }

            for (let i = 0; i < 20; i++) {
                const mid = (low + high) / 2;
                if (checkInside(sx + dx * mid, sy + dy * mid)) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            return { x: sx + dx * high, y: sy + dy * high };
        } else {
            // EXTERNAL PATH: Ray starts outside → coarse raymarch to find entry
            const maxDist = size * 3;
            const step = size * 0.1;  // Big steps (10% of shape size) = max ~30 iterations
            
            let crossedDist = null;
            for (let d = step; d < maxDist; d += step) {
                if (checkInside(sx + dx * d, sy + dy * d)) {
                    crossedDist = d;
                    break;
                }
            }
            
            if (crossedDist === null) return null;  // Missed the shape

            // Refine with binary search
            let low = crossedDist - step;
            let high = crossedDist;
            for (let i = 0; i < 15; i++) {
                const mid = (low + high) / 2;
                if (!checkInside(sx + dx * mid, sy + dy * mid)) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            return { x: sx + dx * high, y: sy + dy * high };
        }
    }
};
