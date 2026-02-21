/**
 * SphereVoronoiCase
 * Approximate spherical Voronoi + Delaunay dual on a rotating sphere.
 */
const SphereVoronoiCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,

    seedCount: 140,
    sampleStep: 6,
    rotX: -0.25,
    rotY: 0.1,
    rotationSpeed: 0.22,
    pointAlgorithm: 'fibonacci', // fibonacci | random-relax
    jitter: 0.14,
    showVoronoi: true,
    showDelaunay: true,
    showSeeds: true,
    showCentroid: false,
    colorMode: 'vivid', // vivid | pastel | mono
    showHud: true,
    guideText: [
        '[Sphere Voronoi / Delaunay Guide]',
        '- Seeds: number of points on sphere.',
        '- Point Algorithm:',
        '  Algorithm 1 (Fibonacci): even distribution, stable.',
        '  Algorithm 2 (Random+Relax): organic layout with relaxation.',
        '- Jitter: controlled randomness for less uniform placement.',
        '- Cell Quality: smaller step gives smoother Voronoi boundaries (slower).',
        '- Sphere Rotation: one slider controls auto-rotation speed.',
        '- Palette: vivid / pastel / mono cell coloring.',
        '- Voronoi: draw spherical cell regions.',
        '- Delaunay: draw dual graph between neighboring seeds.',
        '- Centroid: draw approximate center point of each visible cell.',
        '- Reset (Master Controls): regenerate seeds and reset view.',
        '- Play/Pause (Master Controls): start/stop rotation.'
    ].join('\n'),

    seeds: [],
    baseSeeds: [],
    adjacency: new Set(),

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.regenerate();
        this.resize();
        this.draw();
    },

    get uiConfig() {
        return [
            {
                type: 'slider',
                id: 'sv_n',
                label: 'Seeds',
                min: 24,
                max: 420,
                step: 1,
                value: this.seedCount,
                onChange: (v) => {
                    this.seedCount = Math.floor(v);
                    this.regenerate();
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'sv_jitter',
                label: 'Jitter',
                min: 0,
                max: 0.45,
                step: 0.01,
                value: this.jitter,
                onChange: (v) => {
                    this.jitter = v;
                    this.seeds = this.applyJitter(this.baseSeeds, this.jitter);
                    this.adjacency.clear();
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'sv_quality',
                label: 'Cell Quality',
                min: 2,
                max: 14,
                step: 1,
                value: this.sampleStep,
                onChange: (v) => {
                    this.sampleStep = Math.max(2, Math.floor(v));
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'sv_rotate',
                label: 'Sphere Rotation',
                min: -1.4,
                max: 1.4,
                step: 0.01,
                value: this.rotationSpeed,
                onChange: (v) => { this.rotationSpeed = v; }
            },
            {
                type: 'select',
                id: 'sv_algo',
                label: 'Point Algorithm',
                value: this.pointAlgorithm,
                options: [
                    { label: 'Algorithm 1 (Fibonacci)', value: 'fibonacci' },
                    { label: 'Algorithm 2 (Random+Relax)', value: 'random-relax' }
                ],
                onChange: (v) => {
                    this.pointAlgorithm = v;
                    this.regenerate();
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'sv_color',
                label: 'Palette',
                value: this.colorMode,
                options: [
                    { label: 'Vivid', value: 'vivid' },
                    { label: 'Pastel', value: 'pastel' },
                    { label: 'Monochrome', value: 'mono' }
                ],
                onChange: (v) => {
                    this.colorMode = v;
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'sv_voro',
                label: 'Voronoi',
                value: this.showVoronoi ? 'on' : 'off',
                options: [
                    { label: 'On', value: 'on' },
                    { label: 'Off', value: 'off' }
                ],
                onChange: (v) => {
                    this.showVoronoi = v === 'on';
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'sv_del',
                label: 'Delaunay',
                value: this.showDelaunay ? 'on' : 'off',
                options: [
                    { label: 'On', value: 'on' },
                    { label: 'Off', value: 'off' }
                ],
                onChange: (v) => {
                    this.showDelaunay = v === 'on';
                    this.draw();
                }
            },
            {
                type: 'select',
                id: 'sv_centroid',
                label: 'Centroid',
                value: this.showCentroid ? 'on' : 'off',
                options: [
                    { label: 'On', value: 'on' },
                    { label: 'Off', value: 'off' }
                ],
                onChange: (v) => {
                    this.showCentroid = v === 'on';
                    this.draw();
                }
            },
            {
                type: 'button',
                id: 'sv_help',
                label: 'Guide',
                value: '설명서 보기',
                onClick: () => this.showGuide()
            }
        ];
    },

    showGuide() {
        window.alert(this.guideText);
    },

    regenerate() {
        this.baseSeeds = this.pointAlgorithm === 'random-relax'
            ? this.randomRelaxSphere(this.seedCount)
            : this.fibonacciSphere(this.seedCount);
        this.seeds = this.applyJitter(this.baseSeeds, this.jitter);
        this.adjacency.clear();
    },

    fibonacciSphere(n) {
        const out = [];
        const ga = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < n; i++) {
            const y = 1 - (i / Math.max(1, n - 1)) * 2;
            const r = Math.sqrt(Math.max(0, 1 - y * y));
            const theta = ga * i;
            out.push({
                x: Math.cos(theta) * r,
                y,
                z: Math.sin(theta) * r
            });
        }
        return out;
    },

    randomOnSphere() {
        const u = Math.random() * 2 - 1;
        const t = Math.random() * Math.PI * 2;
        const s = Math.sqrt(Math.max(0, 1 - u * u));
        return { x: Math.cos(t) * s, y: u, z: Math.sin(t) * s };
    },

    normalize(v) {
        const m = Math.hypot(v.x, v.y, v.z) || 1;
        return { x: v.x / m, y: v.y / m, z: v.z / m };
    },

    randomRelaxSphere(n) {
        const pts = Array.from({ length: n }, () => this.randomOnSphere());
        const iters = 2;
        const repulseK = 0.008;

        for (let it = 0; it < iters; it++) {
            for (let i = 0; i < pts.length; i++) {
                let fx = 0, fy = 0, fz = 0;
                const a = pts[i];
                for (let j = 0; j < pts.length; j++) {
                    if (i === j) continue;
                    const b = pts[j];
                    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
                    const d2 = dx * dx + dy * dy + dz * dz + 1e-5;
                    const inv = repulseK / d2;
                    fx += dx * inv;
                    fy += dy * inv;
                    fz += dz * inv;
                }
                pts[i] = this.normalize({ x: a.x + fx, y: a.y + fy, z: a.z + fz });
            }
        }
        return pts;
    },

    hash01(i, k) {
        const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
        return x - Math.floor(x);
    },

    jitterPoint(p, amount, i) {
        const j = amount * 0.3;
        return this.normalize({
            x: p.x + (this.hash01(i, 1) * 2 - 1) * j,
            y: p.y + (this.hash01(i, 2) * 2 - 1) * j,
            z: p.z + (this.hash01(i, 3) * 2 - 1) * j
        });
    },

    applyJitter(points, amount) {
        if (!points || points.length === 0) return [];
        if (amount <= 0) return points.map((p) => ({ x: p.x, y: p.y, z: p.z }));
        return points.map((p, i) => this.jitterPoint(p, amount, i));
    },

    rotatePoint(p) {
        // Rotate around X then Y.
        const cx = Math.cos(this.rotX), sx = Math.sin(this.rotX);
        const cy = Math.cos(this.rotY), sy = Math.sin(this.rotY);

        const y1 = p.y * cx - p.z * sx;
        const z1 = p.y * sx + p.z * cx;

        const x2 = p.x * cy + z1 * sy;
        const z2 = -p.x * sy + z1 * cy;
        return { x: x2, y: y1, z: z2 };
    },

    nearestSeedIndex(v, rotatedSeeds) {
        let best = -1;
        let bestDot = -Infinity;
        for (let i = 0; i < rotatedSeeds.length; i++) {
            const s = rotatedSeeds[i];
            const dot = v.x * s.x + v.y * s.y + v.z * s.z;
            if (dot > bestDot) {
                bestDot = dot;
                best = i;
            }
        }
        return best;
    },

    pairKey(a, b) {
        return a < b ? `${a},${b}` : `${b},${a}`;
    },

    colorForCell(i) {
        if (this.colorMode === 'mono') return 'rgba(148, 163, 184, 0.28)';
        const hue = (i * 137.5) % 360;
        if (this.colorMode === 'pastel') return `hsla(${hue}, 70%, 75%, 0.38)`;
        return `hsla(${hue}, 88%, 62%, 0.46)`;
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },

    start() {
        if (this.animationId) return;
        this.lastTimeMs = performance.now();
        const loop = (now) => {
            const dt = Math.min(0.05, (now - this.lastTimeMs) / 1000);
            this.lastTimeMs = now;
            this.rotY += this.rotationSpeed * dt;
            this.rotX += this.rotationSpeed * dt * 0.32;
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    },

    stop() {
        if (!this.animationId) return;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },

    reset() {
        this.regenerate();
        this.rotX = -0.25;
        this.rotY = 0.1;
        this.draw();
    },

    destroy() {
        this.stop();
    },

    drawHud(ctx) {
        if (!this.showHud) return;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 13px Inter, system-ui, sans-serif';
        ctx.fillText(`Sphere Voronoi`, 24, 30);
        ctx.fillText(`Seeds: ${this.seedCount} | Step: ${this.sampleStep}px | Algo: ${this.pointAlgorithm}`, 24, 50);
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w * 0.5;
        const cy = h * 0.5;
        const r = Math.min(w, h) * 0.43;
        const step = Math.max(2, this.sampleStep);

        ctx.fillStyle = '#04070f';
        ctx.fillRect(0, 0, w, h);

        // Soft sphere body.
        const grad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.35, r * 0.1, cx, cy, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0.04)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        const rotated = this.seeds.map((s) => this.rotatePoint(s));
        const projected = rotated.map((p) => ({
            x: cx + p.x * r,
            y: cy + p.y * r,
            z: p.z
        }));

        this.adjacency.clear();

        if (this.showVoronoi || this.showDelaunay) {
            const x0 = Math.floor(cx - r);
            const y0 = Math.floor(cy - r);
            const x1 = Math.ceil(cx + r);
            const y1 = Math.ceil(cy + r);
            const cols = Math.ceil((x1 - x0 + 1) / step);
            let prevRow = null;
            const cellSumX = new Array(this.seeds.length).fill(0);
            const cellSumY = new Array(this.seeds.length).fill(0);
            const cellCount = new Array(this.seeds.length).fill(0);

            for (let gy = y0, row = 0; gy <= y1; gy += step, row++) {
                const rowLabels = new Array(cols);
                for (let gx = x0, col = 0; gx <= x1; gx += step, col++) {
                    const nx = (gx - cx) / r;
                    const ny = (gy - cy) / r;
                    const rr = nx * nx + ny * ny;
                    if (rr > 1) {
                        rowLabels[col] = -1;
                        continue;
                    }
                    const nz = Math.sqrt(Math.max(0, 1 - rr));
                    const idx = this.nearestSeedIndex({ x: nx, y: ny, z: nz }, rotated);
                    rowLabels[col] = idx;

                    if (this.showVoronoi) {
                        ctx.fillStyle = this.colorForCell(idx);
                        ctx.fillRect(gx, gy, step + 1, step + 1);
                    }
                    cellSumX[idx] += gx;
                    cellSumY[idx] += gy;
                    cellCount[idx] += 1;

                    const left = col > 0 ? rowLabels[col - 1] : -1;
                    if (left >= 0 && left !== idx) this.adjacency.add(this.pairKey(left, idx));
                    const up = prevRow ? prevRow[col] : -1;
                    if (up >= 0 && up !== idx) this.adjacency.add(this.pairKey(up, idx));
                }
                prevRow = rowLabels;
            }

            if (this.showCentroid) {
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                for (let i = 0; i < cellCount.length; i++) {
                    if (cellCount[i] < 3) continue;
                    const x = cellSumX[i] / cellCount[i];
                    const y = cellSumY[i] / cellCount[i];
                    ctx.beginPath();
                    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Delaunay-like dual edges inferred from Voronoi boundaries.
        if (this.showDelaunay) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.58)';
            ctx.lineWidth = 0.9;
            for (const key of this.adjacency) {
                const [a, b] = key.split(',').map(Number);
                const p = projected[a], q = projected[b];
                if (!p || !q) continue;
                if (rotated[a].z < -0.22 || rotated[b].z < -0.22) continue;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(q.x, q.y);
                ctx.stroke();
            }
            ctx.restore();
        }

        if (this.showSeeds) {
            for (let i = 0; i < projected.length; i++) {
                if (rotated[i].z < -0.05) continue;
                const p = projected[i];
                ctx.fillStyle = 'rgba(255,255,255,0.96)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        this.drawHud(ctx);
    }
};
