/**
 * Center-Out Selection Sort (Dynamic Version)
 * Sorts from the middle outward, showing the search process.
 */
SortAlgorithms.buildCenterOutPlan = function(sortItems, signature = '') {
    const arr = [...sortItems];
    const n = arr.length;
    const events = [];
    const checkpoints = [];
    const checkpointEvery = 64;
    
    // Generate indices starting from the middle and moving outward
    const mid = Math.floor(n / 2);
    const targetIndices = [];
    let left = mid;
    let right = mid + 1;
    
    while (left >= 0 || right < n) {
        if (left >= 0) { targetIndices.push(left); left--; }
        if (right < n) { targetIndices.push(right); right++; }
    }

    const sortedTargetItems = [...sortItems].sort((a, b) => a.hueKey - b.hueKey);

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

    for (let i = 0; i < n; i++) {
        const targetIdx = targetIndices[i];
        const idealItem = sortedTargetItems[targetIdx];
        
        let bestIdxInTarget = i;
        let minDiff = Infinity;
        
        const label = `Center-Out Step ${i + 1}`;
        
        // Visual Search: Scan remaining unsorted elements
        for (let j = i; j < n; j++) {
            const currentIdx = targetIndices[j];
            const diff = Math.abs(arr[currentIdx].hueKey - idealItem.hueKey);
            
            // Push search event to make it "move"
            pushEvent({
                activeIndices: [targetIdx, currentIdx],
                label,
                swapIndices: null
            });

            if (diff < minDiff) {
                minDiff = diff;
                bestIdxInTarget = j;
            }
        }

        // Perform the swap
        const swapIdx = targetIndices[bestIdxInTarget];
        if (targetIdx !== swapIdx) {
            [arr[targetIdx], arr[swapIdx]] = [arr[swapIdx], arr[targetIdx]];
        }
        
        // Push swap event
        pushEvent({
            activeIndices: [targetIdx, swapIdx],
            swapIndices: [targetIdx, swapIdx],
            label
        });
    }

    return {
        plan: {
            type: 'center_out',
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
