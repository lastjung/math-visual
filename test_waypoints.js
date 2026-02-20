const fs = require('fs');

// We have to mock DOM to load these files
global.window = {};
global.document = { getElementById: () => ({ getContext: () => ({}) }) };
global.performance = { now: () => Date.now() };

// Provide a mock PriorityQueue for our standalone script
class PriorityQueue {
    constructor() { this.elements = []; }
    empty() { return this.elements.length === 0; }
    put(item, priority) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }
    get() { return this.elements.shift().item; }
}
global.PriorityQueue = PriorityQueue;

// Load maze engine and fibonacci_maze
const engineCode = fs.readFileSync('visualization/cases/maze_engine.js', 'utf8');
const fibCode = fs.readFileSync('visualization/cases/fibonacci_maze.js', 'utf8');

const vm = require('vm');
vm.runInThisContext(engineCode);
vm.runInThisContext(fibCode);

// Attempt to generate the maze
FibonacciMazeCase.canvas = { width: 800, height: 600, getBoundingClientRect: () => ({}) };
FibonacciMazeCase.ctx = {};
FibonacciMazeCase.generateMaze({ solve: false });

console.log("---- GEN OK ----");
console.log("Waypoints:", FibonacciMazeCase.waypoints);
console.log("Walls Size:", FibonacciMazeCase.walls.size);

let carvedPathsClear = true;
const dirs = MazeEngine.directions;

for (let i = 0; i < FibonacciMazeCase.waypoints.length - 1; i++) {
    const wp1 = FibonacciMazeCase.waypoints[i];
    const wp2 = FibonacciMazeCase.waypoints[i+1];
    
    // Quick A* to check if path is actually walkable
    const pq = new PriorityQueue();
    const cameFrom = {};
    pq.put(wp1, 0);
    cameFrom[MazeEngine.key(wp1)] = null;
    let found = false;
    
    while (!pq.empty()) {
        const curr = pq.get();
        if (curr.q === wp2.q && curr.r === wp2.r) {
            found = true;
            break;
        }
        
        for (const dir of dirs) {
            const next = { q: curr.q + dir.q, r: curr.r + dir.r };
            const nk = MazeEngine.key(next);
            if (!MazeEngine.isInside(next, FibonacciMazeCase.gridRadius)) continue;
            if (FibonacciMazeCase.walls.has(nk)) continue; // Must be walkable
            
            if (!(nk in cameFrom)) {
                cameFrom[nk] = curr;
                pq.put(next, MazeEngine.heuristic(wp2, next));
            }
        }
    }
    
    console.log(`Path ${i} from (${wp1.q},${wp1.r}) to (${wp2.q},${wp2.r}) is found:`, found);
    if (!found) carvedPathsClear = false;
}

if (!carvedPathsClear) {
    console.log("FAILURE: A waypoint path is still blocked!");
} else {
    console.log("SUCCESS: All waypoints are fully connected!");
}
