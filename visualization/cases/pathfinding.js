/**
 * Priority Queue for A*
 */
class PriorityQueue {
    constructor() {
        this.elements = [];
    }
    
    put(item, priority) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority); // Simple sort for now
    }
    
    get() {
        return this.elements.shift().item;
    }
    
    empty() {
        return this.elements.length === 0;
    }
}

/**
 * PathfindingCase
 * A* Algorithm on Hexagonal Grid
 */
const PathfindingCase = {
    canvas: null,
    ctx: null,
    animationId: null,

    // Config
    hexSize: 22,
    gridRadius: 10,
    
    // Graph State
    startNode: { q: -5, r: 0 },
    goalNode: { q: 5, r: 0 },
    walls: new Set(), // Set of "q,r" strings
    
    // A* State
    frontier: new PriorityQueue(),
    cameFrom: {}, // key: "q,r", value: {q,r} (parent)
    costSoFar: {}, // key: "q,r", value: cost
    path: [],      // Array of nodes
    
    // Interaction
    isDraggingStart: false,
    isDraggingGoal: false,
    isDrawingWall: false,
    isErasingWall: false,
    
    // Constants
    sqrt3: Math.sqrt(3),
    directions: [
        {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
        {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Handlers
        this.handleMouseDown = this.onMouseDown.bind(this);
        this.handleMouseMove = this.onMouseMove.bind(this);
        this.handleMouseUp = this.onMouseUp.bind(this);
        
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        
        this.resize();
        this.runAStar(); // Initial Run
    },

    get uiConfig() {
        return [
            { type: 'info', label: 'Start (Green)', value: 'Drag to Move' },
            { type: 'info', label: 'Goal (Red)', value: 'Drag to Move' },
            { type: 'info', label: 'Walls (Gray)', value: 'Click/Drag to Draw' },
            { 
                type: 'slider', id: 'pf_radius', label: 'Grid Size', 
                min: 5, max: 15, step: 1, value: this.gridRadius,
                onChange: (v) => { this.gridRadius = v; this.draw(); }
            },
            { type: 'info', label: 'Maze', value: '' }, // Spacer
            { 
                type: 'button', 
                id: 'btn_maze', 
                value: 'Generate Maze', 
                onClick: () => this.generateMaze()
            },
            { 
                type: 'button', 
                id: 'btn_clear', 
                value: 'Clear Walls', 
                onClick: () => this.clearWalls()
            }
        ];
    },

    // --- A* Algorithm ---
    
    key(h) { return `${h.q},${h.r}`; },
    
    heuristic(a, b) {
        // Hex Distance: (abs(q) + abs(q+r) + abs(r)) / 2
        // Or simpler axial distance: (abs(aq - bq) + abs(aq+ar - bq-br) + abs(ar - br)) / 2
        return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
    },

    getNeighbors(node) {
        const results = [];
        for (let dir of this.directions) {
            const next = { q: node.q + dir.q, r: node.r + dir.r };
            // Check Bounds (Hexagon shape radius)
            const dist = (Math.abs(next.q) + Math.abs(next.q + next.r) + Math.abs(next.r)) / 2;
            if (dist <= this.gridRadius) {
                 // Check Walls
                 if (!this.walls.has(this.key(next))) {
                     results.push(next);
                 }
            }
        }
        return results;
    },

    // Used for Maze Generation (ignores walls)
    getAllNeighbors(node) {
        const results = [];
        for (let dir of this.directions) {
            const next = { q: node.q + dir.q, r: node.r + dir.r };
            const dist = (Math.abs(next.q) + Math.abs(next.q + next.r) + Math.abs(next.r)) / 2;
            if (dist <= this.gridRadius) {
                results.push(next);
            }
        }
        return results;
    },

    generateMaze() {
        // 1. Fill Grid with Walls
        this.walls.clear();
        const N = this.gridRadius;
        for (let q = -N; q <= N; q++) {
            const r1 = Math.max(-N, -q - N);
            const r2 = Math.min(N, -q + N);
            for (let r = r1; r <= r2; r++) {
                this.walls.add(`${q},${r}`);
            }
        }

        // 2. Recursive Backtracker
        const start = { q: 0, r: 0 }; // Start maze from center
        const stack = [start];
        const visited = new Set();
        visited.add(this.key(start));
        this.walls.delete(this.key(start)); // Clear center

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getAllNeighbors(current);
            
            // Filter unvisited neighbors (that are essentially walls right now)
            // But we need to look 2 steps ahead? 
            // Standard maze is: Cell - Wall - Cell.
            // Our Hex Grid is dense.
            // Adaptation for Dense Grid: 
            // Randomized Prim's or Recursive Backtracker on nodes:
            // "Carving" means removing a node from this.walls
            
            // To make it look like a maze with thin walls, we usually need
            // "cells" and "walls" as separate entities.
            // But here, every hex is a cell.
            // So we can only have "open" hexes and "wall" hexes.
            // If we simply carve a path, we might get open areas.
            // Let's try "Jump 2" logic? 
            // Or simpler: Randomized Prim's.
            // Pick a wall. If it divides visited and unvisited, open it.
            
            // Simpler Logic for Dense Graph:
            // 1. Pick unvisited neighbor.
            // 2. If neighbor has > 1 visited neighbor (besides current), don't carve (this prevents loops/blobs).
            //    Actually, to ensure tree structure:
            //    Only carve into a cell that has NO visited neighbors yet (except the one we are coming from).
            
            const unvisited = neighbors.filter(n => !visited.has(this.key(n)));
            const validNeighbors = [];

            for (let next of unvisited) {
                // Check if 'next' touches any OTHER visited node
                // (To prevent thick corridors)
                const nextNeighbors = this.getAllNeighbors(next);
                let visitedCount = 0;
                for (let nn of nextNeighbors) {
                    if (visited.has(this.key(nn))) visitedCount++;
                }
                
                // We expect exactly 1 visited neighbor (the 'current' one)
                if (visitedCount === 1) {
                    validNeighbors.push(next);
                }
            }

            if (validNeighbors.length > 0) {
                // Pick random
                const next = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                this.walls.delete(this.key(next));
                visited.add(this.key(next));
                stack.push(next);
            } else {
                stack.pop();
            }
        }
        
        // Ensure Start and Goal are open
        this.walls.delete(this.key(this.startNode));
        this.walls.delete(this.key(this.goalNode));
        
        // Reset Search State
        this.path = [];
        this.isSearching = false;
        this.foundPath = false;
        this.cameFrom = {};
        this.costSoFar = {};
        this.frontier = new PriorityQueue();
        
        this.draw();
    },

    clearWalls() {
        this.walls.clear();
        this.runAStar();
    },

    runAStar() {
        this.frontier = new PriorityQueue();
        this.frontier.put(this.startNode, 0);
        
        this.cameFrom = {};
        this.costSoFar = {};
        
        const startKey = this.key(this.startNode);
        this.cameFrom[startKey] = null;
        this.costSoFar[startKey] = 0;
        
        let found = false;

        // Run until Frontier empty or Goal found
        // NOTE: For visualization simple version, we run it all at once to find path
        // Step-by-step animation could be added later
        while (!this.frontier.empty()) {
            const current = this.frontier.get();
            
            if (current.q === this.goalNode.q && current.r === this.goalNode.r) {
                found = true;
                break;
            }

            for (let next of this.getNeighbors(current)) {
                const newCost = this.costSoFar[this.key(current)] + 1; // Uniform cost 1
                const nextKey = this.key(next);
                
                if (!(nextKey in this.costSoFar) || newCost < this.costSoFar[nextKey]) {
                    this.costSoFar[nextKey] = newCost;
                    const priority = newCost + this.heuristic(this.goalNode, next);
                    this.frontier.put(next, priority);
                    this.cameFrom[nextKey] = current;
                }
            }
        }
        
        this.reconstructPath();
        this.draw();
    },

    reconstructPath() {
        this.path = [];
        let current = this.goalNode;
        let k = this.key(current);
        
        if (!(k in this.cameFrom)) return; // No path
        
        while (current) {
            this.path.push(current);
            current = this.cameFrom[this.key(current)];
            // Start node's parent is null, loop ends
        }
        this.path.reverse();
    },

    // --- Interaction ---
    
    pixelToHex(x, y) {
        const size = this.hexSize;
        const q = (this.sqrt3/3 * x - 1/3 * y) / size;
        const r = (2/3 * y) / size;
        return this.hexRound(q, r);
    },

    hexRound(q, r) {
        let s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);
        
        const q_diff = Math.abs(rq - q);
        const r_diff = Math.abs(rr - r);
        const s_diff = Math.abs(rs - s);
        
        if (q_diff > r_diff && q_diff > s_diff) rq = -rr - rs;
        else if (r_diff > s_diff) rr = -rq - rs;
        else rs = -rq - rr;
        
        return { q: rq, r: rr };
    },

    onMouseDown(e) {
        const hex = this.getHexFromEvent(e);
        const k = this.key(hex);
        const startK = this.key(this.startNode);
        const goalK = this.key(this.goalNode);

        if (k === startK) {
            this.isDraggingStart = true;
        } else if (k === goalK) {
            this.isDraggingGoal = true;
        } else {
            if (this.walls.has(k)) {
                this.walls.delete(k);
                this.isErasingWall = true;
            } else {
                this.walls.add(k);
                this.isDrawingWall = true;
            }
            this.runAStar();
        }
    },

    onMouseMove(e) {
        if (!this.isDraggingStart && !this.isDraggingGoal && !this.isDrawingWall && !this.isErasingWall) return;
        
        const hex = this.getHexFromEvent(e);
        const k = this.key(hex);
        
        // Bounds Check
        const dist = (Math.abs(hex.q) + Math.abs(hex.q+hex.r) + Math.abs(hex.r)) / 2;
        if (dist > this.gridRadius) return;

        if (this.isDraggingStart) {
            if (k !== this.key(this.goalNode) && !this.walls.has(k)) {
                this.startNode = hex;
                this.runAStar();
            }
        } else if (this.isDraggingGoal) {
            if (k !== this.key(this.startNode) && !this.walls.has(k)) {
                this.goalNode = hex;
                this.runAStar();
            }
        } else if (this.isDrawingWall) {
            if (k !== this.key(this.startNode) && k !== this.key(this.goalNode)) {
                this.walls.add(k);
                this.runAStar();
            }
        } else if (this.isErasingWall) {
            this.walls.delete(k);
            this.runAStar();
        }
    },

    onMouseUp() {
        this.isDraggingStart = false;
        this.isDraggingGoal = false;
        this.isDrawingWall = false;
        this.isErasingWall = false;
    },

    getHexFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.canvas.width / 2;
        const y = e.clientY - rect.top - this.canvas.height / 2;
        return this.pixelToHex(x, y);
    },

    // --- Rendering ---
    
    hexToPixel(q, r) {
        const size = this.hexSize;
        const x = size * (this.sqrt3 * q + this.sqrt3/2 * r);
        const y = size * (3/2 * r);
        return { x, y };
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },
    
    // Config
    autoPlayOnReset: false, // Don't auto-start A* on reset

    // ... (rest of file)

    start() { 
        this.runAStar(); 
    },

    stop() { 
        // Pause: Maybe clear path or just stop animation if we had one?
        // For now, let's keep the path visible but stop any updates
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    },
    
    reset() {
        // Reset process: Generate new maze, BUT DO NOT SOLVE
        this.startNode = { q: -5, r: 0 };
        this.goalNode = { q: 5, r: 0 };
        this.path = []; // Clear path
        this.generateMaze(); // Generates walls
        
        // Force Pause state if running
        if (Core.isRunning) {
            Core.togglePlay(); // This will call this.stop() and update UI to 'Resume'
        }
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width/2, height/2);

        const N = this.gridRadius;
        
        for (let q = -N; q <= N; q++) {
            const r1 = Math.max(-N, -q - N);
            const r2 = Math.min(N, -q + N);
            for (let r = r1; r <= r2; r++) {
                this.drawHex(q, r);
            }
        }

        // Draw Path Line
        if (this.path.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#FFD700'; // Gold
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            
            this.path.forEach((node, i) => {
                const p = this.hexToPixel(node.q, node.r);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        }

        ctx.restore();
    },

    drawHex(q, r) {
        const k = this.key({q, r});
        const center = this.hexToPixel(q, r);
        const size = this.hexSize;
        const drawSize = size * 0.92;
        const ctx = this.ctx;
        
        // Determine Color
        // Default
        let fill = 'rgba(255, 255, 255, 0.05)';
        let stroke = 'rgba(255, 255, 255, 0.1)';
        
        if (this.walls.has(k)) {
            fill = '#555'; // Wall
        } else if (this.startNode.q === q && this.startNode.r === r) {
            fill = '#4CAF50'; // Start Green
        } else if (this.goalNode.q === q && this.goalNode.r === r) {
            fill = '#F44336'; // Goal Red

        } else if (k in this.cameFrom) {
            fill = 'rgba(0, 191, 255, 0.2)'; // Visited / Frontier
        }

        // Optimize path check
        if (this.path.some(n => n.q===q && n.r===r)) {
             if (!this.walls.has(k) && k !== this.key(this.startNode) && k !== this.key(this.goalNode)) {
                 fill = 'rgba(255, 215, 0, 0.2)'; 
             }
        }

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle_rad = Math.PI / 180 * (60 * i + 30);
            const px = center.x + drawSize * Math.cos(angle_rad);
            const py = center.y + drawSize * Math.sin(angle_rad);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Optional: Draw Arrows for CameFrom?
        /*
        if (k in this.cameFrom && this.cameFrom[k]) {
            // Draw small arrow pointing to parent
        }
        */
    },
    
    destroy() {
        this.stop();
    }
};
