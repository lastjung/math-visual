/**
 * LIGHT FLOW LAB: Light Density Module (Independent)
 * Focus: Segment-based density sampling and recording
 */
export const LightDensity = {
    grid: null,
    width: 0,
    height: 0,
    cellSize: 2, // Finer grid as requested
    
    init(canvas) {
        this.width = Math.ceil(canvas.width / this.cellSize);
        this.height = Math.ceil(canvas.height / this.cellSize);
        this.grid = new Float32Array(this.width * this.height);
    },

    getIdx(x, y) {
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return -1;
        return gy * this.width + gx;
    },

    /**
     * Get average density along the segment (Segment-based lookup)
     */
    getDensityAlongLine(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return this.getDensity(x1, y1);

        const step = this.cellSize * 0.75;
        const steps = Math.ceil(dist / step);
        let total = 0;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t;
            const py = y1 + dy * t;
            total += this.getDensity(px, py);
        }
        return total / (steps + 1);
    },

    getDensity(x, y) {
        const idx = this.getIdx(x, y);
        return idx === -1 ? 0 : this.grid[idx];
    },

    /**
     * Record density along the whole segment (Segment-based footprint)
     */
    recordDensityAlongLine(x1, y1, x2, y2, amount = 1.0) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) {
            this._recordAt(x1, y1, amount);
            return;
        }

        const step = this.cellSize * 0.75;
        const steps = Math.ceil(dist / step);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t;
            const py = y1 + dy * t;
            this._recordAt(px, py, amount);
        }
    },

    _recordAt(x, y, amount) {
        const idx = this.getIdx(x, y);
        if (idx !== -1) {
            this.grid[idx] += amount;
            if (this.grid[idx] > 50) this.grid[idx] = 50;
        }
    },

    decay(factor = 0.98) {
        if (!this.grid) return;
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] *= factor;
        }
    },

    clear() {
        if (this.grid) this.grid.fill(0);
    }
};
