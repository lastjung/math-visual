/**
 * Shell Sort Algorithm Extension (Swap-based & Optimized with Checkpoints)
 */
SortAlgorithms.buildShellPlan = function(sortItems, signature = '') {
    const arr = [...sortItems];
    const events = [];
    const checkpoints = [];
    const checkpointEvery = 64;
    const n = arr.length;

    const pushEvent = (meta) => {
        events.push(meta);
        const eventIndex = events.length - 1;
        if (eventIndex === 0 || eventIndex % checkpointEvery === 0) {
            checkpoints.push({
                eventIndex,
                order: [...arr]
            });
        }
    };

    const swap = (a, b) => {
        [arr[a], arr[b]] = [arr[b], arr[a]];
    };

    // Use a simple N/2 gap sequence
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            for (let j = i; j >= gap; j -= gap) {
                pushEvent({ activeIndices: [j - gap, j], label: `Shell Gap ${gap} Compare` });
                if (arr[j - gap].hueKey > arr[j].hueKey) {
                    swap(j - gap, j);
                    pushEvent({ activeIndices: [j - gap, j], swapIndices: [j - gap, j], label: `Shell Gap ${gap} Swap` });
                } else {
                    break;
                }
            }
        }
    }

    return {
        plan: {
            type: 'shell',
            events,
            checkpoints,
            checkpointEvery,
            initialState: sortItems,
            finalState: [...arr],
            totalSteps: events.length
        },
        signature
    };
};
