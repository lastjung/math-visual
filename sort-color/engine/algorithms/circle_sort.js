/**
 * Circle Sort Algorithm Extension (Optimized with Checkpoints)
 */
SortAlgorithms.buildCirclePlan = function(sortItems, signature = '') {
    const arr = [...sortItems];
    const events = [];
    const checkpoints = [];
    const checkpointEvery = 64;
    let n = arr.length;

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

    const circleSortRecursive = (low, high) => {
        if (low === high) return false;

        let swapped = false;
        let l = low;
        let h = high;

        while (l < h) {
            pushEvent({ activeIndices: [l, h], label: 'Circle Compare' });
            if (arr[l].hueKey > arr[h].hueKey) {
                swap(l, h);
                pushEvent({ activeIndices: [l, h], swapIndices: [l, h], label: 'Circle Swap' });
                swapped = true;
            }
            l++;
            h--;
        }

        if (l === h && h + 1 < n) {
            pushEvent({ activeIndices: [l, h + 1], label: 'Circle Center Compare' });
            if (arr[l].hueKey > arr[h + 1].hueKey) {
                swap(l, h + 1);
                pushEvent({ activeIndices: [l, h + 1], swapIndices: [l, h + 1], label: 'Circle Center Swap' });
                swapped = true;
            }
        }

        const mid = Math.floor((high - low) / 2);
        const leftSwapped = circleSortRecursive(low, low + mid);
        const rightSwapped = circleSortRecursive(low + mid + 1, high);

        return swapped || leftSwapped || rightSwapped;
    };

    let safety = 0;
    while (safety < 200) {
        if (!circleSortRecursive(0, n - 1)) break;
        safety++;
    }

    return {
        plan: {
            type: 'circle',
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
