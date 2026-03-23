const SortAlgorithms = {
    buildBubblePlan(sortItems, signature = '') {
        const arr = [...sortItems];
        const snapshots = [];
        let totalSteps = 0;

        for (let passIndex = 0; passIndex < arr.length - 1; passIndex++) {
            const innerSteps = arr.length - 1 - passIndex;
            snapshots.push({
                order: [...arr],
                passIndex,
                stepCount: innerSteps,
                label: `Bubble Pass ${passIndex + 1}`
            });
            totalSteps += innerSteps;

            for (let compareIndex = 0; compareIndex < innerSteps; compareIndex++) {
                if (arr[compareIndex].hueKey > arr[compareIndex + 1].hueKey) {
                    [arr[compareIndex], arr[compareIndex + 1]] = [arr[compareIndex + 1], arr[compareIndex]];
                }
            }
        }

        return {
            plan: {
                type: 'bubble',
                snapshots,
                finalState: [...arr],
                totalSteps,
                n: arr.length
            },
            signature
        };
    },

    buildQuickPlan(sortItems, signature = '') {
        const arr = [...sortItems];
        const events = [];
        const checkpoints = [];
        let partitionCount = 0;
        const checkpointEvery = 64;

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
            if (a === b) return;
            [arr[a], arr[b]] = [arr[b], arr[a]];
        };

        const stack = [];
        if (arr.length > 1) stack.push({ low: 0, high: arr.length - 1 });

        while (stack.length) {
            const { low, high } = stack.pop();
            if (low >= high) continue;

            partitionCount += 1;
            const partitionLabel = `Partition ${partitionCount}`;
            const pivotIndex = high;
            const pivotValue = arr[pivotIndex].hueKey;
            let storeIndex = low;

            for (let scanIndex = low; scanIndex < high; scanIndex++) {
                pushEvent({
                    partitionLabel,
                    activeIndices: [scanIndex, pivotIndex],
                    pivotIndex,
                    range: [low, high],
                    swapIndices: null
                });

                if (arr[scanIndex].hueKey <= pivotValue) {
                    swap(storeIndex, scanIndex);
                    pushEvent({
                        partitionLabel,
                        activeIndices: [storeIndex, scanIndex],
                        pivotIndex,
                        range: [low, high],
                        swapIndices: [storeIndex, scanIndex]
                    });
                    storeIndex += 1;
                }
            }

            swap(storeIndex, high);
            pushEvent({
                partitionLabel,
                activeIndices: [storeIndex, high],
                pivotIndex: storeIndex,
                range: [low, high],
                swapIndices: [storeIndex, high],
                pivotSettled: true
            });

            if (storeIndex + 1 < high) stack.push({ low: storeIndex + 1, high });
            if (low < storeIndex - 1) stack.push({ low, high: storeIndex - 1 });
        }

        return {
            plan: {
                type: 'quick',
                events,
                checkpoints,
                initialState: sortItems,
                finalState: [...arr],
                totalSteps: events.length
            },
            signature
        };
    },

    buildInsertionPlan(sortItems, signature = '') {
        const arr = [...sortItems];
        const snapshots = [];
        let totalSteps = 0;

        for (let passIndex = 1; passIndex < arr.length; passIndex++) {
            snapshots.push({
                order: [...arr],
                passIndex,
                stepCount: passIndex,
                label: `Insertion Pass ${passIndex}`
            });
            totalSteps += passIndex;

            for (let rightIndex = passIndex; rightIndex > 0; rightIndex--) {
                if (arr[rightIndex - 1].hueKey > arr[rightIndex].hueKey) {
                    [arr[rightIndex - 1], arr[rightIndex]] = [arr[rightIndex], arr[rightIndex - 1]];
                } else {
                    break;
                }
            }
        }

        return {
            plan: {
                type: 'insertion',
                snapshots,
                finalState: [...arr],
                totalSteps,
                n: arr.length
            },
            signature
        };
    },

    buildSelectionPlan(sortItems, signature = '') {
        const arr = [...sortItems];
        const snapshots = [];
        let totalSteps = 0;

        for (let passIndex = 0; passIndex < arr.length - 1; passIndex++) {
            const compareCount = arr.length - 1 - passIndex;
            const stepCount = compareCount + 1;
            snapshots.push({
                order: [...arr],
                passIndex,
                stepCount,
                label: `Selection Pass ${passIndex + 1}`
            });
            totalSteps += stepCount;

            let minIndex = passIndex;
            for (let scanIndex = passIndex + 1; scanIndex < arr.length; scanIndex++) {
                if (arr[scanIndex].hueKey < arr[minIndex].hueKey) {
                    minIndex = scanIndex;
                }
            }
            if (minIndex !== passIndex) {
                [arr[passIndex], arr[minIndex]] = [arr[minIndex], arr[passIndex]];
            }
        }

        return {
            plan: {
                type: 'selection',
                snapshots,
                finalState: [...arr],
                totalSteps,
                n: arr.length
            },
            signature
        };
    },

    buildRadixPlan(sortItems, passDescriptors, signature = '') {
        const passes = [];
        let sourceOrder = sortItems;

        for (const descriptor of passDescriptors) {
            const buckets = Array.from({ length: 10 }, () => []);
            const digits = [];

            sourceOrder.forEach((entry) => {
                const digit = descriptor.divisor
                    ? Math.floor(entry[descriptor.key] / descriptor.divisor) % 10
                    : entry[descriptor.key];
                digits.push(digit);
                buckets[digit].push(entry);
            });

            const order = buckets.flat();
            passes.push({
                digitDivisor: descriptor.divisor || 1,
                label: descriptor.label,
                sourceOrder,
                digits,
                order,
                bucketCounts: buckets.map((bucket) => bucket.length)
            });
            sourceOrder = order;
        }

        return {
            plan: {
                passes,
                totalSteps: passes.length * sortItems.length
            },
            signature
        };
    }
};
