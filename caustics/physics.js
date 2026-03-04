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
     * Binary search to find where the ray hits the boundary
     */
    findBoundaryIntersection(sx, sy, angle, type, size) {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        let low = 0, high = size * 6;
        let bestDist = null;

        for(let i=0; i<30; i++) {
            let mid = (low + high) / 2;
            let px = sx + dx * mid;
            let py = sy + dy * mid;
            
            let inside = false;
            if (type === 'circle') inside = (px*px + py*py) < size*size;
            else if (type === 'ellipse') inside = (px*px)/(size*size) + (py*py)/(size*size*0.36) < 1;
            else if (type === 'parabola') {
                // Inside is the region "above" the cup
                inside = py < (0.5 - Math.pow(px/(size*0.5), 2) * 0.2) * size;
            }
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
