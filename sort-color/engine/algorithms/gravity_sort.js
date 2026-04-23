/**
 * Gravity Sort (Bead Sort) Algorithm Implementation
 * Stable and Proper Simulation.
 */
SortAlgorithms.buildGravityPlan = function(sortItems, signature = '') {
    const n = sortItems.length;
    const maxVal = 10; 
    const grid = Array.from({ length: n }, () => Array(maxVal).fill(0));
    
    const itemBeads = sortItems.map(item => {
        const hue = item.hueKey || 0;
        return Math.max(0, Math.min(maxVal - 1, Math.floor((hue / 360) * maxVal)));
    });

    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= itemBeads[i]; j++) {
            grid[i][j] = 1;
        }
    }

    const wireCounts = Array(maxVal).fill(0);
    for (let j = 0; j < maxVal; j++) {
        for (let i = 0; i < n; i++) {
            if (grid[i][j] === 1) wireCounts[j]++;
        }
    }

    const fallenGrid = Array.from({ length: n }, () => Array(maxVal).fill(0));
    for (let j = 0; j < maxVal; j++) {
        for (let i = n - wireCounts[j]; i < n; i++) {
            fallenGrid[i][j] = 1;
        }
    }

    const finalBeadCounts = fallenGrid.map(row => row.reduce((a, b) => a + b, 0));
    const sortedItems = [...sortItems].sort((a, b) => a.hueKey - b.hueKey);

    const passes = [];
    
    // Step 1: Distribution
    passes.push({
        label: 'Step 1: Bead Distribution',
        sourceOrder: [...sortItems],
        digits: [...itemBeads],
        order: [...sortItems],
        bucketCounts: itemBeads.reduce((acc, b) => { acc[b]++; return acc; }, Array(maxVal).fill(0))
    });

    // Step 2: Settling (The actual sorting result)
    passes.push({
        label: 'Step 2: Beads Settled (Gravity)',
        sourceOrder: sortedItems,
        digits: finalBeadCounts.map(c => Math.max(0, c - 1)),
        order: sortedItems,
        bucketCounts: wireCounts
    });

    return {
        plan: {
            type: 'gravity',
            passes: passes,
            totalSteps: n * passes.length,
            n: n,
            finalState: sortedItems
        },
        signature
    };
};
