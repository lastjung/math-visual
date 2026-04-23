/**
 * Cocktail Shaker Sort Algorithm Extension (Optimized with Checkpoints)
 */
SortAlgorithms.buildCocktailPlan = function(sortItems, signature = '') {
    const arr = [...sortItems];
    const events = [];
    const checkpoints = [];
    const checkpointEvery = 64;
    let n = arr.length;
    let swapped = true;
    let start = 0;
    let end = n - 1;

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

    while (swapped) {
        swapped = false;

        // Forward pass
        for (let i = start; i < end; i++) {
            pushEvent({ activeIndices: [i, i + 1], label: 'Cocktail Forward Compare' });
            if (arr[i].hueKey > arr[i + 1].hueKey) {
                swap(i, i + 1);
                pushEvent({ activeIndices: [i, i + 1], swapIndices: [i, i + 1], label: 'Cocktail Forward Swap' });
                swapped = true;
            }
        }

        if (!swapped) break;

        swapped = false;
        end--;

        // Backward pass
        for (let i = end - 1; i >= start; i--) {
            pushEvent({ activeIndices: [i, i + 1], label: 'Cocktail Backward Compare' });
            if (arr[i].hueKey > arr[i + 1].hueKey) {
                swap(i, i + 1);
                pushEvent({ activeIndices: [i, i + 1], swapIndices: [i, i + 1], label: 'Cocktail Backward Swap' });
                swapped = true;
            }
        }
        start++;
    }

    return {
        plan: {
            type: 'cocktail',
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
