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
            case 'ellipse': return { x: Math.cos(rad) * size, y: Math.sin(rad) * size * 0.6 };
            case 'cardioid': 
                const r = size * (1 - Math.cos(rad)) * 0.5;
                return { x: r * Math.cos(rad) + size*0.3, y: r * Math.sin(rad) };
            case 'parabola':
                const px = (rad / Math.PI - 0.5) * 4; 
                return { x: px * size * 0.5, y: (px * px - 1) * size * 0.5 };
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
        else if (type === 'parabola') { nx = -2 * (x / (size * 0.5)); ny = 1; }
        else { nx = -x; ny = -y; } 
        
        const len = Math.sqrt(nx * nx + ny * ny);
        return { x: nx / len, y: ny / len };
    },

    /**
     * Binary search to find where the ray hits the boundary
     */
    findBoundaryIntersection(sx, sy, angle, type, size) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        let low = 1, high = size * 4;
        let bestDist = null;

        for(let i=0; i<30; i++) {
            let mid = (low + high) / 2;
            let px = sx + dx * mid;
            let py = sy + dy * mid;
            
            let inside = false;
            if (type === 'circle') inside = (px*px + py*py) < size*size;
            else if (type === 'ellipse') inside = (px*px)/(size*size) + (py*py)/(size*size*0.36) < 1;
            else if (type === 'parabola') inside = py > (Math.pow(px/(size*0.5), 2) - 1) * size * 0.5;
            else if (type === 'cardioid') {
                const cx = px - size*0.3;
                const r = Math.sqrt(cx*cx + py*py);
                const theta = Math.atan2(py, cx);
                inside = r < size * (1 - Math.cos(theta)) * 0.5;
            }

            if (inside) { low = mid; } 
            else { high = mid; bestDist = mid; }
        }
        return bestDist ? { x: sx + dx * bestDist, y: sy + dy * bestDist } : null;
    }
};
