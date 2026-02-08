/**
 * Circular Obstacle Pathfinding Case
 * Logic based on Red Blob Games: https://redblobgames.github.io/circular-obstacle-pathfinding/
 */

const CircularPathfindingCase = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    animationId: null,

    // Core Data
    obstacles: [],
    startNode: { x: 100, y: 100, r: 0 },
    goalNode: { x: 700, y: 500, r: 0 },
    nodes: [],
    edges: [],
    path: [],

    // Interaction State
    dragTarget: null,
    mouse: { x: 0, y: 0 },

    // Config
    config: {
        numObstacles: 16,
        minRadius: 30,
        maxRadius: 70,
        showGraph: true,
        showHugging: true,
        actorRadius: 10 // Minkowski expansion
    },

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.reset();
        this.setupEvents();
    },

    resize() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    reset() {
        this.obstacles = [];
        this.nodes = [];
        this.edges = [];
        this.path = [];

        // Generate random obstacles
        for (let i = 0; i < this.config.numObstacles; i++) {
            const h = Math.floor(Math.random() * 360);
            this.obstacles.push({
                x: Math.random() * (this.width - 200) + 100,
                y: Math.random() * (this.height - 200) + 100,
                r: Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius,
                color: `hsl(${h}, 70%, 50%)`,
                glow: `hsl(${h}, 70%, 70%)`
            });
        }

        // Default Start/Goal
        this.startNode = { x: 50, y: 50, r: 0 };
        this.goalNode = { x: this.width - 50, y: this.height - 50, r: 0 };

        this.calculatePath();
    },

    setupEvents() {
        this.canvas.onmousedown = (e) => this.handleMouseDown(e);
        this.canvas.onmousemove = (e) => this.handleMouseMove(e);
        this.canvas.onmouseup = () => this.handleMouseUp();
    },

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check Start/Goal
        if (this.dist(x, y, this.startNode.x, this.startNode.y) < 20) {
            this.dragTarget = this.startNode;
            return;
        }
        if (this.dist(x, y, this.goalNode.x, this.goalNode.y) < 20) {
            this.dragTarget = this.goalNode;
            return;
        }

        // Check Obstacles
        for (let obs of this.obstacles) {
            if (this.dist(x, y, obs.x, obs.y) < obs.r) {
                this.dragTarget = obs;
                break;
            }
        }
    },

    handleMouseMove(e) {
        if (!this.dragTarget) return;
        const rect = this.canvas.getBoundingClientRect();
        this.dragTarget.x = e.clientX - rect.left;
        this.dragTarget.y = e.clientY - rect.top;
        this.calculatePath();
    },

    handleMouseUp() {
        this.dragTarget = null;
    },

    dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // --- Pathfinding Logic ---

    calculatePath() {
        // 1. Generate Visibility Graph
        this.nodes = [];
        this.edges = [];

        const expandedObstacles = this.obstacles.map((obs, idx) => ({
            ...obs,
            r: obs.r + this.config.actorRadius,
            originalIdx: idx
        }));

        // Add bitangents between all pairs of obstacles (plus Start and Goal)
        const entries = [
            { ...this.startNode, originalIdx: -1 }, 
            ...expandedObstacles, 
            { ...this.goalNode, originalIdx: -1 }
        ];
        
        for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
                const bitangents = this.getBitangents(entries[i], entries[j]);
                for (let edge of bitangents) {
                    if (!this.isBlocked(edge.p1, edge.p2, expandedObstacles)) {
                        this.addEdge(edge);
                    }
                }
            }
        }

        // Add hugging edges (arcs) if enabled
        if (this.config.showHugging) {
            expandedObstacles.forEach((obs, obsIdx) => {
                const obsNodes = this.nodes.filter(n => n.obsIdx === obsIdx);
                for (let i = 0; i < obsNodes.length; i++) {
                    for (let j = i + 1; j < obsNodes.length; j++) {
                        const p1 = obsNodes[i];
                        const p2 = obsNodes[j];
                        
                        let angle1 = Math.atan2(p1.y - obs.y, p1.x - obs.x);
                        let angle2 = Math.atan2(p2.y - obs.y, p2.x - obs.x);
                        let diff = Math.abs(angle1 - angle2);
                        if (diff > Math.PI) diff = 2 * Math.PI - diff;
                        
                        this.edges.push({
                            n1: p1, 
                            n2: p2, 
                            dist: diff * obs.r,
                            type: 'hugging'
                        });
                    }
                }
            });
        }

        // 2. A* Search
        this.path = this.findShortestPath();
    },

    getBitangents(c1, c2) {
        const d = this.dist(c1.x, c1.y, c2.x, c2.y);
        const r1 = c1.r || 0;
        const r2 = c2.r || 0;
        
        if (d < Math.abs(r1 - r2) && d > 0.001) return []; // One inside another

        const results = [];
        const angleBetweenCenters = Math.atan2(c2.y - c1.y, c2.x - c1.x);

        // External Bitangents
        if (r1 > 0 && r2 > 0 && d > Math.abs(r1 - r2)) {
            const theta = Math.acos((r1 - r2) / d);
            for (let sign of [-1, 1]) {
                const alpha = angleBetweenCenters + sign * theta;
                results.push({
                    p1: { x: c1.x + Math.cos(alpha) * r1, y: c1.y + Math.sin(alpha) * r1, obsIdx: c1.originalIdx },
                    p2: { x: c2.x + Math.cos(alpha) * r2, y: c2.y + Math.sin(alpha) * r2, obsIdx: c2.originalIdx },
                    dist: d,
                    type: 'surfing'
                });
            }
        }

        // Internal Bitangents
        if (r1 > 0 && r2 > 0 && d > r1 + r2) {
            const theta = Math.acos((r1 + r2) / d);
            for (let sign of [-1, 1]) {
                const alpha1 = angleBetweenCenters + sign * theta;
                const alpha2 = alpha1 + Math.PI;
                results.push({
                    p1: { x: c1.x + Math.cos(alpha1) * r1, y: c1.y + Math.sin(alpha1) * r1, obsIdx: c1.originalIdx },
                    p2: { x: c2.x + Math.cos(alpha2) * r2, y: c2.y + Math.sin(alpha2) * r2, obsIdx: c2.originalIdx },
                    dist: Math.sqrt(d*d - (r1+r2)*(r1+r2)),
                    type: 'surfing'
                });
            }
        }

        // Handle case where one node is a point (radius 0)
        if (r1 === 0 || r2 === 0) {
            const r = r1 || r2;
            if (r === 0) {
                // Point to Point
                results.push({ p1: c1, p2: c2, dist: d, type: 'surfing' });
            } else {
                const center = r1 === 0 ? c2 : c1;
                const point = r1 === 0 ? c1 : c2;
                const distToCenter = this.dist(point.x, point.y, center.x, center.y);
                
                if (distToCenter > r) {
                    const theta = Math.acos(r / distToCenter);
                    const phi = Math.atan2(point.y - center.y, point.x - center.x);
                    for (let sign of [-1, 1]) {
                        const alpha = phi + sign * theta;
                        const tp = { 
                            x: center.x + Math.cos(alpha) * r, 
                            y: center.y + Math.sin(alpha) * r,
                            obsIdx: center.originalIdx 
                        };
                        results.push({
                            p1: r1 === 0 ? { ...point, obsIdx: -1 } : tp,
                            p2: r1 === 0 ? tp : { ...point, obsIdx: -1 },
                            dist: Math.sqrt(distToCenter*distToCenter - r*r),
                            type: 'surfing'
                        });
                    }
                }
            }
        }

        return results;
    },

    addEdge(edge) {
        // Find or create nodes
        const n1 = this.findOrCreateNode(edge.p1);
        const n2 = this.findOrCreateNode(edge.p2);
        this.edges.push({ n1, n2, dist: edge.dist, type: edge.type });
    },

    findOrCreateNode(p) {
        const threshold = 0.1;
        let node = this.nodes.find(n => this.dist(n.x, n.y, p.x, p.y) < threshold);
        if (!node) {
            node = { ...p, neighbors: [] };
            this.nodes.push(node);
        }
        return node;
    },

    isBlocked(p1, p2, obstacles) {
        for (let obs of obstacles) {
            // Check if line p1-p2 is blocked by obs
            // Logic: distance from obs.center to line segment p1-p2
            const d = this.distToSegment(obs, p1, p2);
            if (d < obs.r - 0.01) return true;
        }
        return false;
    },

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return this.dist(p.x, p.y, v.x, v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.dist(p.x, p.y, v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
    },

    findShortestPath() {
        const start = this.nodes.find(n => n.x === this.startNode.x && n.y === this.startNode.y);
        const goal = this.nodes.find(n => n.x === this.goalNode.x && n.y === this.goalNode.y);
        if (!start || !goal) return [];

        const queue = [{ node: start, dist: 0, path: [start] }];
        const visited = new Map();

        while (queue.length > 0) {
            queue.sort((a, b) => a.dist - b.dist);
            const { node, dist, path } = queue.shift();

            if (node === goal) return path;
            if (visited.has(node) && visited.get(node) <= dist) continue;
            visited.set(node, dist);

            // Find neighbors through edges
            const currentEdges = this.edges.filter(e => e.n1 === node || e.n2 === node);
            for (let edge of currentEdges) {
                const neighbor = edge.n1 === node ? edge.n2 : edge.n1;
                queue.push({
                    node: neighbor,
                    dist: dist + edge.dist,
                    path: [...path, neighbor]
                });
            }
        }
        return [];
    },

    // --- Rendering ---

    start() {
        const loop = () => {
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    },

    stop() {
        cancelAnimationFrame(this.animationId);
    },

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Grid/Graph (Optional)
        if (this.config.showGraph) {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            this.ctx.lineWidth = 1;
            for (let edge of this.edges) {
                this.ctx.beginPath();
                this.ctx.moveTo(edge.n1.x, edge.n1.y);
                this.ctx.lineTo(edge.n2.x, edge.n2.y);
                this.ctx.stroke();
            }
        }

        // 2. Draw Obstacles
        this.obstacles.forEach(obs => {
            // Minkowski Padding (Muted glow)
            this.ctx.beginPath();
            this.ctx.arc(obs.x, obs.y, obs.r + this.config.actorRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = obs.glow.replace(')', ', 0.08)').replace('hsl', 'hsla');
            this.ctx.fill();

            // Real Obstacle
            this.ctx.beginPath();
            this.ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
            
            // Gradient fill for premium look
            const grad = this.ctx.createRadialGradient(obs.x - obs.r*0.3, obs.y - obs.r*0.3, obs.r*0.1, obs.x, obs.y, obs.r);
            grad.addColorStop(0, obs.glow);
            grad.addColorStop(1, obs.color);
            
            this.ctx.fillStyle = grad;
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        // 3. Draw Path
        if (this.path.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#29cc57';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([]);
            this.ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1; i < this.path.length; i++) {
                this.ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            this.ctx.stroke();
        }

        // 4. Draw Start/Goal
        this.drawPoint(this.startNode, '#4CAF50', 'Start');
        this.drawPoint(this.goalNode, '#F44336', 'Goal');
    },

    drawPoint(p, color, label) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, p.x, p.y - 15);
    },

    uiConfig: [
        {
            type: 'slider',
            id: 'cp_num_obs',
            label: 'Obstacles',
            min: 1,
            max: 32,
            step: 1,
            value: 16,
            onChange: (v) => {
                CircularPathfindingCase.config.numObstacles = v;
                CircularPathfindingCase.reset();
            }
        },
        {
            type: 'slider',
            id: 'cp_radius',
            label: 'Actor Radius',
            min: 0,
            max: 30,
            step: 2,
            value: 10,
            onChange: (v) => {
                CircularPathfindingCase.config.actorRadius = v;
                CircularPathfindingCase.calculatePath();
            }
        },
        {
            type: 'button',
            id: 'cp_reset',
            value: 'Regenerate Obstacles',
            onClick: () => CircularPathfindingCase.reset()
        },
        {
            type: 'info',
            id: 'cp_info',
            label: 'Interaction',
            value: 'Drag Start/Goal/Circles'
        }
    ]
};
