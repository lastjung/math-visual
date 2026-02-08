/**
 * PolygonMapCase
 * Procedural Map Generation using Voronoi Diagrams.
 * Based on Amit Patel's (Red Blob Games) algorithm.
 */
const PolygonMapCase = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Core Data
    points: [],      // Seed points for Voronoi
    centers: [],     // Polygon centers
    corners: [],     // Polygon corners
    edges: [],       // Dual graph edges
    
    // Config
    config: {
        numPoints: 800,
        lloydIterations: 2,
        seed: Math.random(),
        islandShape: 'radial', // 'radial', 'perlin'
        showRivers: true,
        showElevation: true,
        showMoisture: true
    },

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.reset();
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        const parent = this.canvas.parentElement;
        this.width = this.canvas.width = parent.clientWidth || 800;
        this.height = this.canvas.height = parent.clientHeight || 600;
    },

    get uiConfig() {
        return [
            {
                type: 'button',
                id: 'pm_regenerate',
                label: 'Regenerate Map',
                onClick: () => this.reset()
            },
            {
                type: 'slider',
                id: 'pm_points',
                label: 'Complexity',
                min: 100,
                max: 2000,
                step: 100,
                value: this.config.numPoints,
                onChange: (v) => { this.config.numPoints = v; this.reset(); }
            }
        ];
    },

    reset() {
        if (this.width === 0 || this.height === 0) this.resize();
        this.config.seed = Math.random();
        this.generateMap();
        this.draw();
    },

    generateMap() {
        this.points = [];
        const w = this.width || 800;
        const h = this.height || 600;
        
        // 1. Generate Random Points
        for(let i=0; i<this.config.numPoints; i++) {
            this.points.push({
                x: Math.random() * w,
                y: Math.random() * h
            });
        }

        // 2. Lloyd Relaxation (Simplified)
        for(let i=0; i<this.config.lloydIterations; i++) {
            this.points = this.relaxPoints(this.points);
        }

        // 3. Delaunay & Voronoi
        // Using flat array for better library stability in some environments
        const coords = new Float64Array(this.points.length * 2);
        for(let i=0; i<this.points.length; i++) {
            coords[i*2] = this.points[i].x;
            coords[i*2+1] = this.points[i].y;
        }
        const delaunay = new Delaunator(coords);
        this.buildGraph(delaunay);
        
        // 4. Island Shape & Elevation
        this.assignElevation();
        
        // 5. Moisture & Biomes
        this.assignMoisture();
        this.assignBiomes();
    },

    relaxPoints(points) {
        const coords = new Float64Array(points.length * 2);
        for(let i=0; i<points.length; i++) {
            coords[i*2] = points[i].x;
            coords[i*2+1] = points[i].y;
        }
        const delaunay = new Delaunator(coords);
        
        const inedges = new Int32Array(points.length).fill(-1);
        for (let e = 0; e < delaunay.halfedges.length; e++) {
            const p = delaunay.triangles[e % 3 === 2 ? e - 2 : e + 1];
            if (delaunay.halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
        }

        const newPoints = [];
        for (let i = 0; i < points.length; i++) {
            let centerX = 0;
            let centerY = 0;
            let count = 0;
            
            let e = inedges[i];
            if (e === -1) {
                newPoints.push(points[i]);
                continue;
            }
            
            const startNode = e;
            do {
                const t = Math.floor(e / 3);
                const p1_idx = delaunay.triangles[t * 3];
                const p2_idx = delaunay.triangles[t * 3 + 1];
                const p3_idx = delaunay.triangles[t * 3 + 2];

                if (p1_idx === undefined || p2_idx === undefined || p3_idx === undefined) break;

                const p1 = { x: delaunay.coords[p1_idx * 2], y: delaunay.coords[p1_idx * 2 + 1] };
                const p2 = { x: delaunay.coords[p2_idx * 2], y: delaunay.coords[p2_idx * 2 + 1] };
                const p3 = { x: delaunay.coords[p3_idx * 2], y: delaunay.coords[p3_idx * 2 + 1] };
                
                const cc = this.getCircumcenter(p1, p2, p3);
                if (!isNaN(cc.x) && !isNaN(cc.y) && isFinite(cc.x) && isFinite(cc.y)) {
                    centerX += cc.x;
                    centerY += cc.y;
                    count++;
                }
                
                e = delaunay.halfedges[e];
                if (e === -1) break;
                e = e % 3 === 2 ? e - 2 : e + 1;
            } while (e !== startNode);

            if (count > 0) {
                newPoints.push({ x: centerX / count, y: centerY / count });
            } else {
                newPoints.push(points[i]);
            }
        }
        return newPoints;
    },

    buildGraph(delaunay) {
        this.centers = [];
        this.corners = [];
        this.edges = [];
        
        const { triangles, coords } = delaunay;

        // 1. Centers (from points)
        for (let i = 0; i < this.points.length; i++) {
            this.centers.push({
                x: this.points[i].x,
                y: this.points[i].y,
                biome: 'OCEAN'
            });
        }

        // 2. Corners (circumcenters of Delaunay triangles)
        for (let i = 0; i < triangles.length; i += 3) {
            const p1_idx = triangles[i];
            const p2_idx = triangles[i+1];
            const p3_idx = triangles[i+2];
            
            const p1 = { x: coords[p1_idx * 2], y: coords[p1_idx * 2 + 1] };
            const p2 = { x: coords[p2_idx * 2], y: coords[p2_idx * 2 + 1] };
            const p3 = { x: coords[p3_idx * 2], y: coords[p3_idx * 2 + 1] };
            
            const cc = this.getCircumcenter(p1, p2, p3);
            this.corners.push({ x: cc.x, y: cc.y });
        }
    },

    getCircumcenter(a, b, c) {
        const ad = a.x * a.x + a.y * a.y;
        const bd = b.x * b.x + b.y * b.y;
        const cd = c.x * c.x + c.y * c.y;
        const D = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
        
        // Stability check
        if (Math.abs(D) < 0.000001) return { x: a.x, y: a.y };
        
        return {
            x: 1 / D * (ad * (b.y - c.y) + bd * (c.y - a.y) + cd * (a.y - b.y)),
            y: 1 / D * (ad * (c.x - b.x) + bd * (a.x - c.x) + cd * (b.x - a.x))
        };
    },

    assignElevation() {
        // Mock Elevation for visualization
        this.centers.forEach(c => {
            const dx = c.x - this.width / 2;
            const dy = c.y - this.height / 2;
            const d = Math.sqrt(dx*dx + dy*dy);
            const maxD = Math.min(this.width, this.height) * 0.4;
            c.water = d > maxD;
            c.elevation = c.water ? 0 : 1 - (d / maxD);
        });
    },

    assignMoisture() {
        this.centers.forEach(c => c.moisture = Math.random());
    },

    assignBiomes() {
        this.centers.forEach(c => {
            if (c.water) {
                c.biome = 'OCEAN';
            } else if (c.elevation > 0.8) {
                c.biome = 'SNOW';
            } else if (c.elevation > 0.6) {
                c.biome = 'TUNDRA';
            } else if (c.moisture > 0.6) {
                c.biome = 'FOREST';
            } else if (c.moisture > 0.3) {
                c.biome = 'GRASSLAND';
            } else {
                c.biome = 'DESERT';
            }
        });
    },

    getBiomeColor(biome) {
        const colors = {
            'OCEAN': '#1a2b4a',
            'SNOW': '#ffffff',
            'TUNDRA': '#bbbbaa',
            'FOREST': '#335533',
            'GRASSLAND': '#88aa55',
            'DESERT': '#d2b48c'
        };
        return colors[biome] || '#444';
    },

    draw() {
        if(!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 1. Draw Cells
        // Using flat array for better library stability
        const coords = new Float64Array(this.points.length * 2);
        for(let i=0; i<this.points.length; i++) {
            coords[i*2] = this.points[i].x;
            coords[i*2+1] = this.points[i].y;
        }
        const delaunay = new Delaunator(coords);
        
        const inedges = new Int32Array(this.points.length).fill(-1);
        for (let e = 0; e < delaunay.halfedges.length; e++) {
            const p = delaunay.triangles[e % 3 === 2 ? e - 2 : e + 1];
            if (delaunay.halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
        }

        for (let i = 0; i < this.points.length; i++) {
            const center = this.centers[i];
            if (!center || !center.biome) continue;

            this.ctx.beginPath();
            let e = inedges[i];
            if (e === -1) continue;
            
            const startNode = e;
            let first = true;
            do {
                const t = Math.floor(e / 3);
                const p1_idx = delaunay.triangles[t * 3];
                const p2_idx = delaunay.triangles[t * 3 + 1];
                const p3_idx = delaunay.triangles[t * 3 + 2];
                
                if (p1_idx === undefined) break;

                const p1 = { x: delaunay.coords[p1_idx * 2], y: delaunay.coords[p1_idx * 2 + 1] };
                const p2 = { x: delaunay.coords[p2_idx * 2], y: delaunay.coords[p2_idx * 2 + 1] };
                const p3 = { x: delaunay.coords[p3_idx * 2], y: delaunay.coords[p3_idx * 2 + 1] };
                const cc = this.getCircumcenter(p1, p2, p3);
                
                if (first) {
                    this.ctx.moveTo(cc.x, cc.y);
                    first = false;
                } else {
                    this.ctx.lineTo(cc.x, cc.y);
                }
                
                e = delaunay.halfedges[e];
                if (e === -1) break;
                e = e % 3 === 2 ? e - 2 : e + 1;
            } while (e !== startNode);
            
            this.ctx.closePath();
            this.ctx.fillStyle = this.getBiomeColor(center.biome);
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        }

        // Informative text
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.font = 'bold 24px Inter';
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText('Polygon Map Generation', 40, 60);
        this.ctx.shadowBlur = 0;
        this.ctx.font = '16px Inter';
        this.ctx.fillText(`Voronoi Cells: ${this.config.numPoints}`, 40, 90);
    },

    start() {
        this.reset();
    },

    stop() {
        // Stop any logic if needed
    },

    destroy() {
        // Cleanup if needed
    }
};

// Export to window
window.PolygonMapCase = PolygonMapCase;
