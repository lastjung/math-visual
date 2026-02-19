/**
 * Priority Queue used by weighted/best-first searches.
 */
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    put(item, priority) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
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
 * Hex maze + animated multi-algorithm pathfinding.
 */
const HexMazeCase = {
    canvas: null,
    ctx: null,

    // Config
    hexSize: 13,
    gridRadius: 15,
    searchMode: 'astar', // astar | dijkstra | greedy | bfs | dfs
    searchDelayMs: 35,
    sfxEnabled: true,
    sfxVolume: 0.08,

    // Graph State
    startNode: { q: 0, r: 0 },
    goalNode: { q: 0, r: 0 },
    walls: new Set(),

    // Search Visualization State
    cameFrom: {},
    costSoFar: {},
    path: [],
    pathSet: new Set(),
    frontierSet: new Set(),
    exploredSet: new Set(),
    currentNode: null,

    frontierPQ: null,
    frontierQueue: null,
    frontierStack: null,
    frontierHead: 0,

    searchTimer: null,
    searchInProgress: false,
    searchPaused: false,
    searchStartedAtMs: 0,
    searchElapsedMs: 0,
    totalSearchCount: 0,
    totalFindCount: 0,
    lastSearchMs: 0,
    lastEnteredHexCount: 0,
    audioCtx: null,
    stepSoundTick: 0,
    lastStepSoundAt: 0,

    // Interaction
    isDraggingStart: false,
    isDraggingGoal: false,
    isDrawingWall: false,
    isErasingWall: false,
    eventsBound: false,

    // Constants
    sqrt3: Math.sqrt(3),
    directions: [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
    ],
    mazeStepDirections: [
        { q: 2, r: 0 }, { q: 2, r: -2 }, { q: 0, r: -2 },
        { q: -2, r: 0 }, { q: -2, r: 2 }, { q: 0, r: 2 }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.handleMouseDown = this.onMouseDown.bind(this);
        this.handleMouseMove = this.onMouseMove.bind(this);
        this.handleMouseUp = this.onMouseUp.bind(this);

        this.resize();
        this.bindEvents();
        // Build maze first, then Go/start will show the search process.
        this.generateMaze({ solve: false });
    },

    get uiConfig() {
        return [
            {
                type: 'select',
                id: 'pf_algorithm',
                label: 'Pathfinding',
                value: this.searchMode,
                options: [
                    { value: 'astar', label: 'A*' },
                    { value: 'dijkstra', label: 'Dijkstra' },
                    { value: 'greedy', label: 'Greedy Best-First' },
                    { value: 'bfs', label: 'Breadth-First Search' },
                    { value: 'dfs', label: 'Depth-First Search' }
                ],
                onChange: (v) => {
                    this.searchMode = v;
                    this.triggerSearch();
                }
            },
            {
                type: 'slider',
                id: 'pf_speed',
                label: 'Search Speed',
                min: 1,
                max: 40,
                step: 1,
                value: this.delayToSpeed(this.searchDelayMs),
                onChange: (v) => {
                    this.searchDelayMs = this.speedToDelay(v);
                }
            },
            {
                type: 'slider',
                id: 'pf_sfx_volume',
                label: 'SFX Volume',
                min: 0,
                max: 0.3,
                step: 0.01,
                value: this.sfxVolume,
                onChange: (v) => {
                    this.sfxVolume = v;
                }
            },
            {
                type: 'slider',
                id: 'pf_hex_size',
                label: 'Hex Size',
                min: 8,
                max: 28,
                step: 1,
                value: this.hexSize,
                onChange: (v) => {
                    this.hexSize = v;
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'pf_radius',
                label: 'Grid Radius',
                min: 8,
                max: 24,
                step: 1,
                value: this.gridRadius,
                onChange: (v) => {
                    this.gridRadius = v;
                    this.generateMaze({ solve: this.isCoreRunning() });
                }
            },
            { type: 'info', label: 'Start (Green)', value: 'Drag to Move' },
            { type: 'info', label: 'Goal (Red)', value: 'Drag to Move' },
            { type: 'info', label: 'Walls (Gray)', value: 'Drag to Edit' },
            { type: 'info', label: 'Maze Control', value: 'Use top Reset Maze + Go' }
        ];
    },

    key(h) {
        return `${h.q},${h.r}`;
    },

    hexDistance(a, b = { q: 0, r: 0 }) {
        return (Math.abs(a.q - b.q) + Math.abs((a.q + a.r) - (b.q + b.r)) + Math.abs(a.r - b.r)) / 2;
    },

    isInside(node) {
        return this.hexDistance(node) <= this.gridRadius;
    },

    heuristic(a, b) {
        return this.hexDistance(a, b);
    },

    isWalkable(node) {
        return this.isInside(node) && !this.walls.has(this.key(node));
    },

    isCoreRunning() {
        return typeof Core !== 'undefined' ? !!Core.isRunning : true;
    },

    forEachHex(callback) {
        const N = this.gridRadius;
        for (let q = -N; q <= N; q++) {
            const r1 = Math.max(-N, -q - N);
            const r2 = Math.min(N, -q + N);
            for (let r = r1; r <= r2; r++) {
                callback({ q, r });
            }
        }
    },

    getNeighbors(node) {
        const results = [];
        for (const dir of this.directions) {
            const next = { q: node.q + dir.q, r: node.r + dir.r };
            if (this.isWalkable(next)) results.push(next);
        }
        return results;
    },

    getNeighborsIgnoringWalls(node) {
        const results = [];
        for (const dir of this.directions) {
            const next = { q: node.q + dir.q, r: node.r + dir.r };
            if (this.isInside(next)) results.push(next);
        }
        return results;
    },

    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    caseAudioLabel() {
        return 'SFX Status';
    },

    isCaseAudioMuted() {
        return !this.sfxEnabled;
    },

    toggleCaseAudio() {
        this.sfxEnabled = !this.sfxEnabled;
    },

    speedToDelay(speed) {
        return 205 - speed * 5;
    },

    delayToSpeed(delayMs) {
        return Math.max(1, Math.min(40, Math.round((205 - delayMs) / 5)));
    },

    ensureAudioContext() {
        if (!this.sfxEnabled) return null;
        if (!this.audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            this.audioCtx = new Ctx();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    },

    playTone(freq, durationSec, type = 'sine', volumeMul = 1, attackSec = 0.003) {
        const ctx = this.ensureAudioContext();
        if (!ctx || !this.sfxEnabled || this.sfxVolume <= 0) return;

        const now = ctx.currentTime;
        const gain = ctx.createGain();
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;

        const peak = Math.max(0, Math.min(1, this.sfxVolume * volumeMul));
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(peak, now + attackSec);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + durationSec + 0.01);
    },

    playStepSound() {
        const now = performance.now();
        if (now - this.lastStepSoundAt < 40) return;
        this.lastStepSoundAt = now;
        this.stepSoundTick += 1;

        if (this.stepSoundTick % 2 !== 0) return;
        const pitch = 240 + (this.stepSoundTick % 10) * 18;
        this.playTone(pitch, 0.05, 'triangle', 0.45);
    },

    playResultSound(found) {
        if (found) {
            this.playTone(523.25, 0.12, 'sine', 0.9);
            setTimeout(() => this.playTone(659.25, 0.12, 'sine', 0.8), 90);
            setTimeout(() => this.playTone(783.99, 0.18, 'sine', 0.75), 180);
            return;
        }
        this.playTone(180, 0.16, 'sawtooth', 0.7);
    },

    clearSearchState() {
        this.stopSearchAnimation();
        this.cameFrom = {};
        this.costSoFar = {};
        this.path = [];
        this.pathSet.clear();
        this.frontierSet.clear();
        this.exploredSet.clear();
        this.currentNode = null;
        this.searchInProgress = false;
        this.searchPaused = false;
        this.stepSoundTick = 0;
        this.lastStepSoundAt = 0;
        this.searchElapsedMs = 0;
        this.searchStartedAtMs = 0;
    },

    stopSearchAnimation() {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
        this.searchInProgress = false;
    },

    pauseSearch() {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
        this.searchPaused = true;
    },

    resumeSearch() {
        if (!this.searchPaused || !this.hasFrontier()) return;
        this.searchPaused = false;
        this.searchInProgress = true;
        this.searchTimer = setTimeout(() => this.stepSearch(), this.searchDelayMs);
    },

    findNearestWalkable(node) {
        if (this.isWalkable(node)) return node;
        if (!this.isInside(node)) return null;

        const queue = [node];
        let head = 0;
        const seen = new Set([this.key(node)]);

        while (head < queue.length) {
            const current = queue[head++];
            if (this.isWalkable(current)) return current;

            for (const next of this.getNeighborsIgnoringWalls(current)) {
                const nk = this.key(next);
                if (seen.has(nk)) continue;
                seen.add(nk);
                queue.push(next);
            }
        }
        return null;
    },

    normalizeEndpoints() {
        if (!this.isWalkable(this.startNode)) {
            this.startNode = this.findNearestWalkable(this.startNode) || { q: 0, r: 0 };
        }
        if (!this.isWalkable(this.goalNode)) {
            this.goalNode = this.findNearestWalkable(this.goalNode) || this.startNode;
        }
    },

    initializeSearch() {
        this.normalizeEndpoints();
        this.clearSearchState();
        this.totalSearchCount += 1;
        this.searchStartedAtMs = performance.now();

        const startKey = this.key(this.startNode);
        this.cameFrom[startKey] = null;
        this.costSoFar[startKey] = 0;

        if (this.searchMode === 'bfs') {
            this.frontierQueue = [this.startNode];
            this.frontierHead = 0;
            this.frontierPQ = null;
            this.frontierStack = null;
        } else if (this.searchMode === 'dfs') {
            this.frontierStack = [this.startNode];
            this.frontierQueue = null;
            this.frontierPQ = null;
        } else {
            this.frontierPQ = new PriorityQueue();
            this.frontierPQ.put(this.startNode, 0);
            this.frontierQueue = null;
            this.frontierStack = null;
        }

        this.frontierSet.add(startKey);
        this.searchInProgress = true;
    },

    hasFrontier() {
        if (this.searchMode === 'bfs') return this.frontierHead < this.frontierQueue.length;
        if (this.searchMode === 'dfs') return this.frontierStack.length > 0;
        return this.frontierPQ && !this.frontierPQ.empty();
    },

    popFrontier() {
        if (this.searchMode === 'bfs') return this.frontierQueue[this.frontierHead++];
        if (this.searchMode === 'dfs') return this.frontierStack.pop();
        return this.frontierPQ.get();
    },

    pushFrontier(node, priority = 0) {
        const nk = this.key(node);
        if (this.searchMode === 'bfs') this.frontierQueue.push(node);
        else if (this.searchMode === 'dfs') this.frontierStack.push(node);
        else this.frontierPQ.put(node, priority);
        this.frontierSet.add(nk);
    },

    reconstructPath() {
        this.path = [];
        this.pathSet.clear();

        const goalKey = this.key(this.goalNode);
        if (!(goalKey in this.cameFrom)) return;

        let current = this.goalNode;
        while (current) {
            this.path.push(current);
            this.pathSet.add(this.key(current));
            current = this.cameFrom[this.key(current)];
        }
        this.path.reverse();
    },

    finishSearch(found) {
        this.stopSearchAnimation();
        if (this.searchStartedAtMs > 0) {
            this.searchElapsedMs = performance.now() - this.searchStartedAtMs;
            this.lastSearchMs = this.searchElapsedMs;
            this.searchStartedAtMs = 0;
        }
        if (found) this.reconstructPath();
        if (found) this.totalFindCount += 1;
        this.lastEnteredHexCount = this.exploredSet.size;
        this.playResultSound(found);
        this.currentNode = null;
        this.draw();

        // Sync button state: search is done → "Go"
        if (typeof Core !== 'undefined' && Core.currentCase === this) {
            Core.syncPlayButton();
            Core.updateControls();
        }
    },

    stepSearch() {
        while (this.hasFrontier()) {
            const current = this.popFrontier();
            const currentKey = this.key(current);

            this.frontierSet.delete(currentKey);
            if (this.exploredSet.has(currentKey)) {
                continue;
            }

            this.currentNode = current;
            this.exploredSet.add(currentKey);
            this.playStepSound();
            if (this.searchStartedAtMs > 0) {
                this.searchElapsedMs = performance.now() - this.searchStartedAtMs;
            }

            if (current.q === this.goalNode.q && current.r === this.goalNode.r) {
                this.finishSearch(true);
                return;
            }

            for (const next of this.getNeighbors(current)) {
                const nextKey = this.key(next);
                const newCost = this.costSoFar[currentKey] + 1;

                if (this.searchMode === 'bfs' || this.searchMode === 'dfs') {
                    if (nextKey in this.cameFrom) continue;
                    this.cameFrom[nextKey] = current;
                    this.costSoFar[nextKey] = newCost;
                    this.pushFrontier(next);
                    continue;
                }

                if (this.searchMode === 'greedy') {
                    if (nextKey in this.cameFrom) continue;
                    this.cameFrom[nextKey] = current;
                    this.costSoFar[nextKey] = newCost;
                    this.pushFrontier(next, this.heuristic(this.goalNode, next));
                    continue;
                }

                if (!(nextKey in this.costSoFar) || newCost < this.costSoFar[nextKey]) {
                    this.costSoFar[nextKey] = newCost;
                    this.cameFrom[nextKey] = current;
                    const priority = this.searchMode === 'dijkstra'
                        ? newCost
                        : newCost + this.heuristic(this.goalNode, next);
                    this.pushFrontier(next, priority);
                }
            }

            this.draw();
            this.searchTimer = setTimeout(() => this.stepSearch(), this.searchDelayMs);
            return;
        }

        this.finishSearch(false);
    },

    startSearchAnimation() {
        this.initializeSearch();
        this.draw();
        this.searchTimer = setTimeout(() => this.stepSearch(), this.searchDelayMs);
    },

    triggerSearch() {
        if (this.isCoreRunning()) {
            this.startSearchAnimation();
        } else {
            this.normalizeEndpoints();
            this.clearSearchState();
            this.draw();
        }
    },

    pickAnyOpenNode() {
        let found = null;
        this.forEachHex((h) => {
            if (!found && !this.walls.has(this.key(h))) {
                found = h;
            }
        });
        return found;
    },

    farthestReachableFrom(source) {
        const queue = [source];
        let head = 0;
        const dist = { [this.key(source)]: 0 };
        let farthest = source;

        while (head < queue.length) {
            const current = queue[head++];
            const currentKey = this.key(current);
            const currentDist = dist[currentKey];
            const farKey = this.key(farthest);
            if (currentDist > dist[farKey]) farthest = current;

            for (const next of this.getNeighbors(current)) {
                const nk = this.key(next);
                if (nk in dist) continue;
                dist[nk] = currentDist + 1;
                queue.push(next);
            }
        }

        return farthest;
    },

    generateMaze({ solve = false } = {}) {
        this.stopSearchAnimation();

        this.walls.clear();
        this.forEachHex((h) => this.walls.add(this.key(h)));

        const cellSet = new Set();
        const cells = [];
        this.forEachHex((h) => {
            if (h.q % 2 === 0 && h.r % 2 === 0) {
                const k = this.key(h);
                cellSet.add(k);
                cells.push(h);
            }
        });

        if (cells.length === 0) {
            this.clearWalls({ solve });
            return;
        }

        const startCell = this.randomChoice(cells);
        const stack = [startCell];
        const visited = new Set([this.key(startCell)]);
        this.walls.delete(this.key(startCell));

        while (stack.length) {
            const current = stack[stack.length - 1];
            const options = [];

            for (const dir of this.mazeStepDirections) {
                const next = { q: current.q + dir.q, r: current.r + dir.r };
                const nextKey = this.key(next);
                if (!this.isInside(next)) continue;
                if (!cellSet.has(nextKey)) continue;
                if (visited.has(nextKey)) continue;
                options.push(next);
            }

            if (!options.length) {
                stack.pop();
                continue;
            }

            const next = this.randomChoice(options);
            const bridge = { q: (current.q + next.q) / 2, r: (current.r + next.r) / 2 };

            this.walls.delete(this.key(bridge));
            this.walls.delete(this.key(next));
            visited.add(this.key(next));
            stack.push(next);
        }

        const seed = this.pickAnyOpenNode();
        if (!seed) {
            this.clearWalls({ solve });
            return;
        }

        const a = this.farthestReachableFrom(seed);
        const b = this.farthestReachableFrom(a);
        this.startNode = a;
        this.goalNode = b;

        this.walls.delete(this.key(this.startNode));
        this.walls.delete(this.key(this.goalNode));

        if (solve) this.startSearchAnimation();
        else {
            this.clearSearchState();
            this.draw();
        }
    },

    clearWalls({ solve = false } = {}) {
        this.stopSearchAnimation();
        this.walls.clear();
        this.startNode = { q: -Math.floor(this.gridRadius / 2), r: 0 };
        this.goalNode = { q: Math.floor(this.gridRadius / 2), r: 0 };

        if (solve) this.startSearchAnimation();
        else {
            this.clearSearchState();
            this.draw();
        }
    },

    pixelToHex(x, y) {
        const size = this.hexSize;
        const q = (this.sqrt3 / 3 * x - 1 / 3 * y) / size;
        const r = (2 / 3 * y) / size;
        return this.hexRound(q, r);
    },

    hexRound(q, r) {
        const s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        if (qDiff > rDiff && qDiff > sDiff) rq = -rr - rs;
        else if (rDiff > sDiff) rr = -rq - rs;
        else rs = -rq - rr;

        return { q: rq, r: rr };
    },

    getHexFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - this.canvas.width / 2;
        const y = e.clientY - rect.top - this.canvas.height / 2;
        return this.pixelToHex(x, y);
    },

    onMouseDown(e) {
        const hex = this.getHexFromEvent(e);
        if (!this.isInside(hex)) return;

        const k = this.key(hex);
        const startK = this.key(this.startNode);
        const goalK = this.key(this.goalNode);

        if (k === startK) {
            this.isDraggingStart = true;
            return;
        }
        if (k === goalK) {
            this.isDraggingGoal = true;
            return;
        }

        if (this.walls.has(k)) {
            this.walls.delete(k);
            this.isErasingWall = true;
        } else {
            this.walls.add(k);
            this.isDrawingWall = true;
        }
        this.triggerSearch();
    },

    onMouseMove(e) {
        if (!this.isDraggingStart && !this.isDraggingGoal && !this.isDrawingWall && !this.isErasingWall) {
            return;
        }

        const hex = this.getHexFromEvent(e);
        if (!this.isInside(hex)) return;

        const k = this.key(hex);
        const startK = this.key(this.startNode);
        const goalK = this.key(this.goalNode);

        if (this.isDraggingStart) {
            if (k !== goalK && !this.walls.has(k)) {
                this.startNode = hex;
                this.triggerSearch();
            }
        } else if (this.isDraggingGoal) {
            if (k !== startK && !this.walls.has(k)) {
                this.goalNode = hex;
                this.triggerSearch();
            }
        } else if (this.isDrawingWall) {
            if (k !== startK && k !== goalK) {
                this.walls.add(k);
                this.triggerSearch();
            }
        } else if (this.isErasingWall) {
            this.walls.delete(k);
            this.triggerSearch();
        }
    },

    onMouseUp() {
        this.isDraggingStart = false;
        this.isDraggingGoal = false;
        this.isDrawingWall = false;
        this.isErasingWall = false;
    },

    hexToPixel(q, r) {
        const size = this.hexSize;
        const x = size * (this.sqrt3 * q + this.sqrt3 / 2 * r);
        const y = size * (3 / 2 * r);
        return { x, y };
    },

    drawHex(q, r) {
        const k = this.key({ q, r });
        const center = this.hexToPixel(q, r);
        const drawSize = this.hexSize * 0.92;
        const ctx = this.ctx;

        // Base walkable cell should look clearly different from walls.
        let fill = 'rgba(240, 248, 255, 0.16)';
        let stroke = 'rgba(255, 255, 255, 0.22)';

        if (this.walls.has(k)) {
            fill = '#86efac';
            stroke = 'rgba(134, 239, 172, 0.5)';
        } else if (k === this.key(this.startNode)) {
            fill = '#00CC00';
            stroke = '#00AA00';
        } else if (k === this.key(this.goalNode)) {
            fill = '#FF0000';
            stroke = '#CC0000';
        } else if (this.pathSet.has(k)) {
            fill = 'rgba(255, 215, 0, 0.30)';
        } else if (k === (this.currentNode ? this.key(this.currentNode) : '')) {
            fill = '#FFD700';
            stroke = '#FFF176';
        } else if (this.frontierSet.has(k)) {
            fill = '#f472b6';
        } else if (this.exploredSet.has(k)) {
            fill = '#ec4899';
        }

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i + 30);
            const px = center.x + drawSize * Math.cos(angle);
            const py = center.y + drawSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = (k === (this.currentNode ? this.key(this.currentNode) : '')) ? 2 : 1;
        ctx.stroke();
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2, height / 2);

        this.forEachHex((h) => this.drawHex(h.q, h.r));

        if (this.path.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = Math.max(2, this.hexSize * 0.28);
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
        this.drawScoreboard();
    },

    formatMs(ms) {
        const value = Math.max(0, ms || 0);
        const totalSec = value / 1000;
        const min = Math.floor(totalSec / 60);
        const sec = Math.floor(totalSec % 60);
        const centi = Math.floor((value % 1000) / 10);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
    },

    drawScoreboard() {
        const ctx = this.ctx;
        if (!ctx || !this.canvas) return;

        const liveMs = this.searchInProgress && this.searchStartedAtMs > 0
            ? performance.now() - this.searchStartedAtMs
            : this.searchElapsedMs;
        const timeLabel = this.formatMs(liveMs);
        const enteredNow = this.exploredSet.size;
        const algorithmNames = {
            astar: 'A*',
            dijkstra: 'Dijkstra',
            greedy: 'Greedy',
            bfs: 'BFS',
            dfs: 'DFS'
        };
        const algorithmLabel = algorithmNames[this.searchMode] || this.searchMode;

        ctx.save();
        ctx.fillStyle = 'rgba(38, 20, 6, 0.38)';
        ctx.fillRect(14, 14, 150, 98);

        ctx.fillStyle = '#ffb366';
        ctx.font = '600 13px Inter, system-ui, sans-serif';
        ctx.fillText(`Algorithm: ${algorithmLabel}`, 26, 36);

        ctx.font = '500 12px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#ffd8a8';
        ctx.fillText(`Time: ${timeLabel}`, 26, 58);
        ctx.fillText(`Hex Entered: ${enteredNow}`, 26, 78);
        ctx.fillText(`Last: ${this.lastEnteredHexCount}`, 26, 98);
        ctx.restore();
    },

    bindEvents() {
        if (this.eventsBound || !this.canvas) return;
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.eventsBound = true;
    },

    unbindEvents() {
        if (!this.eventsBound || !this.canvas) return;
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        this.eventsBound = false;
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },

    autoPlayOnReset: false,
    startPausedOnLoad: true,

    start() {
        this.bindEvents();
        if (this.searchPaused) {
            this.resumeSearch();
        } else {
            this.startSearchAnimation();
        }
    },

    stop() {
        if (this.searchInProgress) {
            this.pauseSearch();
        } else {
            this.stopSearchAnimation();
        }
    },

    reset() {
        this.generateMaze({ solve: false });
    },

    destroy() {
        this.stopSearchAnimation();
        this.unbindEvents();
        if (this.audioCtx) {
            this.audioCtx.close().catch(() => {});
            this.audioCtx = null;
        }
    }
};
