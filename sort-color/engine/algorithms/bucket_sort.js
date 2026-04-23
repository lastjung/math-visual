/**
 * Bucket Sort Algorithm Extension (True Step-by-Step with 5 Buckets)
 */
SortAlgorithms.buildBucketPlan = function(sortItems, signature = '') {
    const n = sortItems.length;
    const bucketCount = 5;
    const passes = [];
    
    // Initial distribution calculation
    const initialDigits = sortItems.map(item => {
        const hue = item.hueKey;
        let bucketIdx = Math.floor((hue / 360) * bucketCount);
        return Math.max(0, Math.min(bucketCount - 1, bucketIdx));
    });

    const buckets = Array.from({ length: bucketCount }, () => []);
    sortItems.forEach((item, i) => {
        buckets[initialDigits[i]].push(item);
    });

    const initialBucketCounts = buckets.map(b => b.length);

    // Pass 1: Initial Distribution (Unsorted within buckets)
    passes.push({
        label: 'Step 1: Distributing to 5 Buckets',
        sourceOrder: [...sortItems],
        digits: initialDigits,
        order: buckets.flat(), 
        bucketCounts: initialBucketCounts
    });

    // Pass 2~6: Internal Sort each bucket one by one
    let currentOrder = buckets.flat();
    for (let b = 0; b < bucketCount; b++) {
        // Sort the specific bucket
        buckets[b].sort((v1, v2) => v1.hueKey - v2.hueKey);
        
        const nextOrder = buckets.flat();
        
        // Items stay in their assigned buckets
        const currentDigits = [];
        for (let bi = 0; bi < bucketCount; bi++) {
            for (let i = 0; i < buckets[bi].length; i++) {
                currentDigits.push(bi);
            }
        }

        passes.push({
            label: `Step ${b + 2}: Sorting Bucket ${b + 1}`,
            sourceOrder: currentOrder,
            digits: currentDigits,
            order: nextOrder,
            bucketCounts: initialBucketCounts
        });
        
        currentOrder = nextOrder;
    }

    // No explicit 7th pass here because the engine's completion state 
    // will naturally handle the transition to the final sorted order.

    return {
        plan: {
            type: 'bucket',
            passes: passes, // Fixed typo from 'pass' to 'passes'
            totalSteps: n * passes.length,
            n: n,
            finalState: currentOrder
        },
        signature
    };
};
