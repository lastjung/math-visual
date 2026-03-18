const GoldbergSphereProvider = {
    normalizeSpherePoint(point) {
        const len = Math.hypot(point.x, point.y, point.z) || 1;
        return {
            x: point.x / len,
            y: point.y / len,
            z: point.z / len
        };
    },

    getGoldbergFrequency(targetCount) {
        const target = Math.max(12, Math.floor(targetCount || 12));
        const frequencies = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        let bestFreq = 1;
        let bestDiff = Infinity;

        for (const freq of frequencies) {
            const faceCount = 10 * freq * freq + 2;
            const diff = Math.abs(faceCount - target);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestFreq = freq;
            }
        }

        return bestFreq;
    },

    buildGoldbergIcosahedron() {
        const t = (1 + Math.sqrt(5)) / 2;
        const raw = [
            { x: -1, y: t, z: 0 }, { x: 1, y: t, z: 0 }, { x: -1, y: -t, z: 0 }, { x: 1, y: -t, z: 0 },
            { x: 0, y: -1, z: t }, { x: 0, y: 1, z: t }, { x: 0, y: -1, z: -t }, { x: 0, y: 1, z: -t },
            { x: t, y: 0, z: -1 }, { x: t, y: 0, z: 1 }, { x: -t, y: 0, z: -1 }, { x: -t, y: 0, z: 1 }
        ];

        return {
            vertices: raw.map((point) => this.normalizeSpherePoint(point)),
            faces: [
                [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
                [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
                [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
                [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
            ]
        };
    },

    buildGoldbergIcosphereByFrequency(baseVertices, baseFaces, frequency) {
        const f = Math.max(1, Math.floor(frequency));
        if (f === 1) {
            return {
                vertices: baseVertices.map((v) => ({ x: v.x, y: v.y, z: v.z })),
                faces: baseFaces.map((tri) => [tri[0], tri[1], tri[2]])
            };
        }

        const vertices = [];
        const vertexMap = new Map();
        const faces = [];

        const addVertex = (x, y, z) => {
            const point = this.normalizeSpherePoint({ x, y, z });
            const key = `${Math.round(point.x * 1e6)}_${Math.round(point.y * 1e6)}_${Math.round(point.z * 1e6)}`;
            if (vertexMap.has(key)) return vertexMap.get(key);
            const idx = vertices.length;
            vertices.push(point);
            vertexMap.set(key, idx);
            return idx;
        };

        for (const [ia, ib, ic] of baseFaces) {
            const a = baseVertices[ia];
            const b = baseVertices[ib];
            const c = baseVertices[ic];
            const grid = [];

            for (let i = 0; i <= f; i++) {
                const row = [];
                for (let j = 0; j <= f - i; j++) {
                    const k = f - i - j;
                    row.push(addVertex(
                        (a.x * i + b.x * j + c.x * k) / f,
                        (a.y * i + b.y * j + c.y * k) / f,
                        (a.z * i + b.z * j + c.z * k) / f
                    ));
                }
                grid.push(row);
            }

            for (let i = 0; i < f; i++) {
                for (let j = 0; j < f - i; j++) {
                    const v1 = grid[i][j];
                    const v2 = grid[i + 1][j];
                    const v3 = grid[i][j + 1];
                    faces.push([v1, v2, v3]);
                    if (j < f - i - 1) {
                        const v4 = grid[i + 1][j + 1];
                        faces.push([v2, v4, v3]);
                    }
                }
            }
        }

        return { vertices, faces };
    },

    connectSphereComponents(points, edgeSets) {
        const visited = new Set();
        const groups = [];

        for (let i = 0; i < points.length; i++) {
            if (visited.has(i)) continue;
            const stack = [i];
            const group = [];
            visited.add(i);

            while (stack.length) {
                const current = stack.pop();
                group.push(current);
                edgeSets[current].forEach((next) => {
                    if (visited.has(next)) return;
                    visited.add(next);
                    stack.push(next);
                });
            }

            groups.push(group);
        }

        if (groups.length <= 1) return;

        for (let gi = 1; gi < groups.length; gi++) {
            const a = groups[gi - 1][0];
            const b = groups[gi][0];
            edgeSets[a].add(b);
            edgeSets[b].add(a);
        }
    },

    generateGoldbergTopology(frequency) {
        const base = this.buildGoldbergIcosahedron();
        const geo = this.buildGoldbergIcosphereByFrequency(base.vertices, base.faces, frequency);
        const points = geo.vertices.map((v) => ({ x: v.x, y: v.y, z: v.z }));
        const triangles = geo.faces;

        const edgeSets = Array.from({ length: points.length }, () => new Set());
        const incidentTriangles = Array.from({ length: points.length }, () => []);

        const addEdge = (a, b) => {
            if (a === b) return;
            edgeSets[a].add(b);
            edgeSets[b].add(a);
        };

        const cross = (a, b) => ({
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        });
        const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

        const triCentroids = triangles.map(([a, b, c]) => {
            const pa = points[a];
            const pb = points[b];
            const pc = points[c];
            return this.normalizeSpherePoint({
                x: (pa.x + pb.x + pc.x) / 3,
                y: (pa.y + pb.y + pc.y) / 3,
                z: (pa.z + pb.z + pc.z) / 3
            });
        });

        for (let ti = 0; ti < triangles.length; ti++) {
            const [a, b, c] = triangles[ti];
            addEdge(a, b);
            addEdge(b, c);
            addEdge(c, a);
            incidentTriangles[a].push(ti);
            incidentTriangles[b].push(ti);
            incidentTriangles[c].push(ti);
        }

        const faceCells = Array.from({ length: points.length }, () => []);
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const ref = Math.abs(p.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
            const u = this.normalizeSpherePoint(cross(ref, p));
            const v = this.normalizeSpherePoint(cross(p, u));
            const ring = incidentTriangles[i].map((ti) => {
                const c = triCentroids[ti];
                const radial = dot(c, p);
                const tangent = this.normalizeSpherePoint({
                    x: c.x - p.x * radial,
                    y: c.y - p.y * radial,
                    z: c.z - p.z * radial
                });
                return {
                    point: c,
                    angle: Math.atan2(dot(tangent, v), dot(tangent, u))
                };
            });
            ring.sort((a, b) => a.angle - b.angle);
            faceCells[i] = ring.map((entry) => entry.point);
        }

        this.connectSphereComponents(points, edgeSets);
        return {
            points,
            neighbors: edgeSets.map((set) => Array.from(set)),
            faceCells
        };
    },

    projectSpherePointToCanvas(point, cx, cy, radius) {
        return {
            x: cx + point.x * radius,
            y: cy - point.y * radius
        };
    },

    buildGoldbergSphereProvider(options = {}) {
        const targetCount = Math.max(12, Math.floor(options.targetCount || 180));
        const frequency = Math.max(1, Math.floor(options.frequencyOverride || this.getGoldbergFrequency(targetCount)));
        const topology = this.generateGoldbergTopology(frequency);
        const cx = options.cx || 0;
        const cy = options.cy || 0;
        const radius = options.radius || 100;

        const slots = topology.faceCells.map((cell, slotIndex) => ({
            slotIndex,
            geometry: {
                kind: 'polygon',
                points: cell.map((point) => this.projectSpherePointToCanvas(point, cx, cy, radius))
            }
        }));

        const points2D = topology.points.map((point) => this.projectSpherePointToCanvas(point, cx, cy, radius));

        const items = topology.points.map((point, index) => {
            const theta = Math.acos(Math.max(-1, Math.min(1, point.y)));
            const hue = (index / Math.max(1, topology.points.length)) * 360;
            return {
                id: `sphere-face-${index}`,
                originalIndex: index,
                slotIndex: index,
                slotGeometry: slots[index].geometry,
                sourceGeometry: slots[index].geometry,
                hue,
                saturation: 90,
                lightness: 58,
                alpha: 0.92,
                color: `hsla(${hue}, 90%, 58%, 0.92)`,
                meta: {
                    center: point,
                    theta,
                    northness: point.y,
                    neighbors: topology.neighbors[index]
                }
            };
        });

        return {
            providerId: 'goldberg-sphere',
            revision: `gp|${frequency}|${items.length}`,
            items,
            slots,
            points: points2D,
            providerMeta: {
                label: 'Goldberg Sphere',
                itemCount: items.length,
                targetCount,
                frequency
            }
        };
    }
};
