/**
 * Bitonic Sort Algorithm Extension
 */
SortAlgorithms.buildBitonicPlan = function(sortItems, signature = '') {
    const arr = [...sortItems];
    const events = [];
    const n = arr.length;

    const pushEvent = (meta) => {
        events.push({
            ...meta,
            order: [...arr]
        });
    };

    const bitonicMerge = (low, cnt, dir) => {
        if (cnt > 1) {
            const k = cnt / 2;
            for (let i = low; i < low + k; i++) {
                const i2 = i + k;
                if (i2 < n) {
                    pushEvent({ activeIndices: [i, i2], label: 'Bitonic Merge Compare' });
                    if ((dir && arr[i].hueKey > arr[i2].hueKey) || (!dir && arr[i].hueKey < arr[i2].hueKey)) {
                        [arr[i], arr[i2]] = [arr[i2], arr[i]];
                        pushEvent({ activeIndices: [i, i2], swapIndices: [i, i2], label: 'Bitonic Merge Swap' });
                    }
                }
            }
            bitonicMerge(low, k, dir);
            bitonicMerge(low + k, k, dir);
        }
    };

    const bitonicSortRecursive = (low, cnt, dir) => {
        if (cnt > 1) {
            const k = cnt / 2;
            bitonicSortRecursive(low, k, !dir);
            bitonicSortRecursive(low + k, k, dir);
            bitonicMerge(low, cnt, dir);
        }
    };

    const nextPowerOfTwo = (v) => {
        let p = 1;
        while (p < v) p *= 2;
        return p;
    };

    const bitonicN = nextPowerOfTwo(n);
    if (bitonicN > 0) {
        bitonicSortRecursive(0, bitonicN, true);
    }

    return {
        plan: {
            type: 'bitonic',
            events,
            initialState: sortItems,
            finalState: [...arr],
            totalSteps: events.length
        },
        signature
    };
};
