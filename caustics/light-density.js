/**
 * LIGHT FLOW LAB: Density Tracker
 * Tracks ray density to normalize brightness and prevent white-out.
 */
export const LightDensity = {
    grid: null,
    width: 0,
    height: 0,
    cellSize: 2, 
    cols: 0,
    rows: 0,

    init(canvas) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.cols = Math.ceil(this.width / this.cellSize);
        this.rows = Math.ceil(this.height / this.cellSize);
        this.grid = new Float32Array(this.cols * this.rows);
    },

    /**
     * Add density at a specific point
     */
    addDensity(x, y) {
        if (!this.grid) return 1;
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
            const idx = gy * this.cols + gx;
            this.grid[idx] += 1.0;
            return this.grid[idx];
        }
        return 1;
    },

    /**
     * Get density at a point
     */
    getDensity(x, y) {
        if (!this.grid) return 1;
        const gx = Math.floor(x / this.cellSize);
        const gy = Math.floor(y / this.cellSize);
        if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
            return this.grid[gy * this.cols + gx] || 1;
        }
        return 1;
    },

    clear() {
        if (this.grid) this.grid.fill(0);
    }
};
