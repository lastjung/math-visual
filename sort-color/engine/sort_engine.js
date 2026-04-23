const SortEngine = {
    resetSortState(status = 'idle') {
        this.sortingStatus = status;
        this.sortProgress = 0;
        this.sortPlan = null;
        this.sortSignature = '';
        this.sortLockedState = null;
        this.resetSortPassTransitionState();
    },

    getSortPanelLayout(w, h) {
        if (!['lsh', 'hue', 'bucket', 'gravity'].includes(this.sortMode)) return null;
        const panelW = 216;
        const panelH = 124;
        const panelX = this.sortPanelPosition?.x ?? (w - panelW - 24);
        const panelY = this.sortPanelPosition?.y ?? (h - panelH - 24);
        return { panelW, panelH, panelX, panelY };
    },

    isSortModeAvailable() {
        return ['hue', 'lsh', 'bubble', 'quick', 'insertion', 'selection', 'circle', 'bitonic', 'cocktail', 'shell', 'bucket', 'gravity', 'center_out'].includes(this.sortMode);
    },

    canRunSort() {
        const nFixedModes = ['factor_1', 'factor_2', 'mirror-chaos', 'classic', 'ultimate'];
        return this.isSortModeAvailable()
            && (this.learningMode === 'off' || this.isPaused || nFixedModes.includes(this.learningMode));
    },

    getSortSpeedMultiplier() {
        return 1;
    },

    getEffectiveSortSpeed() {
        return Math.max(1, this.sortSpeed * this.getSortSpeedMultiplier());
    },

    captureSortLockedState() {
        const n = Math.max(0, Math.floor(this.pointCount));
        const forceIntegerM = this.learningMode === 'gcd' || this.learningMode === 'integer-snap';
        const m = (this.integersOnly || forceIntegerM) ? Math.round(this.multiplier) : this.multiplier;
        this.sortLockedState = { n, m };
        return this.sortLockedState;
    },

    buildSortPlanForCurrentState() {
        const locked = this.sortLockedState || this.captureSortLockedState();
        if (!this.isSortModeAvailable() || locked.n <= 0) return null;
        const provider = this.getCurrentGeometryProvider();
        if (!provider) return null;
        const signature = this.getSortSignatureFromProvider(provider);
        if (this.sortPlan && this.sortSignature === signature) {
            return this.sortPlan;
        }
        return this.buildSortPlanFromProvider(provider, signature);
    },

    buildSortPlanFromProvider(provider, signature = null) {
        if (!provider || !Array.isArray(provider.items) || provider.items.length === 0) {
            this.sortPlan = null;
            this.sortSignature = '';
            return null;
        }

        const sortItems = this.extractSortItems(provider.items);
        return this.buildSortPlanFromItems(sortItems, {
            sortMode: this.sortMode,
            signature: signature || this.getSortSignatureFromProvider(provider)
        });
    },

    buildSortPlanFromItems(sortItems, config = {}) {
        const sortMode = config.sortMode || this.sortMode;
        const signature = config.signature || '';
        if (sortMode === 'bubble') {
            return this.commitSortPlanResult(SortAlgorithms.buildBubblePlan(sortItems, signature));
        }

        if (sortMode === 'quick') {
            return this.commitSortPlanResult(SortAlgorithms.buildQuickPlan(sortItems, signature));
        }

        if (sortMode === 'insertion') {
            return this.commitSortPlanResult(SortAlgorithms.buildInsertionPlan(sortItems, signature));
        }

        if (sortMode === 'selection') {
            return this.commitSortPlanResult(SortAlgorithms.buildSelectionPlan(sortItems, signature));
        }

        if (sortMode === 'circle') {
            return this.commitSortPlanResult(SortAlgorithms.buildCirclePlan(sortItems, signature));
        }

        if (sortMode === 'bitonic') {
            return this.commitSortPlanResult(SortAlgorithms.buildBitonicPlan(sortItems, signature));
        }

        if (sortMode === 'cocktail') {
            return this.commitSortPlanResult(SortAlgorithms.buildCocktailPlan(sortItems, signature));
        }

        if (sortMode === 'shell') {
            return this.commitSortPlanResult(SortAlgorithms.buildShellPlan(sortItems, signature));
        }

        if (sortMode === 'bucket') {
            return this.commitSortPlanResult(SortAlgorithms.buildBucketPlan(sortItems, signature));
        }

        if (sortMode === 'gravity') {
            return this.commitSortPlanResult(SortAlgorithms.buildGravityPlan(sortItems, signature));
        }

        if (sortMode === 'center_out') {
            return this.commitSortPlanResult(SortAlgorithms.buildCenterOutPlan(sortItems, signature));
        }

        const passDescriptors = this.getSortPassDescriptors(sortMode);
        return this.commitSortPlanResult(SortAlgorithms.buildRadixPlan(sortItems, passDescriptors, signature));
    },

    commitSortPlanResult(result) {
        this.sortPlan = result?.plan || null;
        this.sortSignature = result?.signature || '';
        return this.sortPlan;
    },

    getSortTotalSteps(provider = null) {
        const plan = provider ? this.buildSortPlanFromProvider(provider) : this.buildSortPlanForCurrentState();
        return plan?.totalSteps || 0;
    },

    getQuickSortOrderAtEvent(plan, eventIndex) {
        if (!plan || (plan.type !== 'quick' && plan.type !== 'circle' && plan.type !== 'bitonic' && plan.type !== 'cocktail' && plan.type !== 'shell' && plan.type !== 'center_out')) return [];
        if (eventIndex < 0) return [...(plan.initialState || [])];

        const checkpoints = Array.isArray(plan.checkpoints) ? plan.checkpoints : [];
        let baseOrder = [...(plan.initialState || [])];
        let startIndex = 0;

        for (let i = checkpoints.length - 1; i >= 0; i--) {
            const checkpoint = checkpoints[i];
            if (checkpoint.eventIndex <= eventIndex) {
                baseOrder = [...checkpoint.order];
                startIndex = checkpoint.eventIndex + 1;
                break;
            }
        }

        for (let i = startIndex; i <= eventIndex; i++) {
            const event = plan.events[i];
            const swapIndices = event?.swapIndices;
            if (!swapIndices) continue;
            const [a, b] = swapIndices;
            if (a === b || a == null || b == null) continue;
            [baseOrder[a], baseOrder[b]] = [baseOrder[b], baseOrder[a]];
        }

        return baseOrder;
    },

    getSortPassTransitionConfig() {
        return { enabled: false };
    },

    resetSortPassTransitionState() {
        this.sortPassTransition = null;
        this.sortPassTransitionSeenKey = '';
    },

    getSortTransitionKey(plan, sortView) {
        if (!sortView || sortView.completed) return '';
        const label = sortView.passLabel || `Pass ${sortView.passNumber || 1}`;
        const planType = plan?.type || (Array.isArray(plan?.passes) ? 'radix' : this.sortMode || 'sort');
        return `${this.sortMode || 'sort'}:${planType}:${label}`;
    },

    supportsSortPassTransition(plan, sortView) {
        return !!sortView
            && !sortView.completed
            && !!this.getSortTransitionKey(plan, sortView);
    },

    syncSortPassTransition(plan, sortView) {
        const config = this.getSortPassTransitionConfig();
        if (!config?.enabled) return;
        if (this.sortingStatus !== 'running') return;
        if (!this.supportsSortPassTransition(plan, sortView)) return;

        const key = this.getSortTransitionKey(plan, sortView);
        if (this.sortPassTransitionSeenKey === key) return;

        this.sortPassTransitionSeenKey = key;
        this.sortPassTransition = {
            key,
            passIndex: sortView.passIndex,
            passLabel: sortView.passLabel || `Pass ${sortView.passNumber}`,
            passNumber: sortView.passNumber,
            totalPasses: sortView.totalPasses,
            progress: 0,
            duration: Math.max(0.05, config.duration || 1.4),
            turns: config.turns || 0,
            blockProgress: config.blockProgress === true,
            startedAt: typeof performance !== 'undefined' ? performance.now() : 0
        };
    },

    advanceSortPassTransition(dt) {
        const state = this.sortPassTransition;
        if (!state) return;
        const duration = Math.max(0.05, state.duration || 1.4);
        state.progress = Math.min(1, state.progress + (dt / duration));
        if (state.progress >= 1) {
            this.sortPassTransition = null;
        }
    },

    getSortPassTransitionState() {
        return this.sortPassTransition;
    },

    isSortPassTransitionBlocking() {
        return !!this.sortPassTransition?.blockProgress;
    },

    restartSort() {
        if (this.sortMode === 'off') {
            this.resetSortState('idle');
            return;
        }
        if (!this.canRunSort()) {
            this.resetSortState('idle');
            return;
        }
        this.captureSortLockedState();
        this.sortProgress = 0;
        this.sortPlan = null;
        this.sortSignature = '';
        this.resetSortPassTransitionState();
        this.sortingStatus = 'running';
        if (typeof Core !== 'undefined' && Core.currentCase === this) {
            Core.updateControls();
        }
    },

    holdSort() {
        if (!this.isSortModeAvailable()) return;
        if (this.sortingStatus === 'running') {
            this.sortingStatus = 'holding';
        }
    },

    toggleSortPlayback() {
        if (this.sortMode === 'off') {
            this.sortMode = 'hue';
        }
        if (this.sortingStatus === 'running') {
            this.holdSort();
            return;
        }
        if (this.sortingStatus === 'completed') {
            this.restartSort();
            return;
        }
        if (this.sortingStatus === 'idle') {
            this.restartSort();
            return;
        }
        this.sortingStatus = 'running';
    },

    stepSort(delta) {
        if (!this.isSortModeAvailable()) {
            this.sortMode = 'hue';
        }
        if (!this.canRunSort()) return;
        if (!this.sortLockedState) this.captureSortLockedState();
        const provider = this.getCurrentGeometryProvider();
        const totalSteps = this.getSortTotalSteps(provider);
        if (!totalSteps) return;
        this.sortingStatus = 'holding';
        this.sortProgress = Math.max(0, Math.min(totalSteps, this.sortProgress + delta));
        if (this.sortProgress >= totalSteps) {
            this.sortingStatus = 'completed';
        } else if (this.sortProgress <= 0) {
            this.sortingStatus = 'idle';
        }
    },

    resetSortProgress() {
        if (!this.isSortModeAvailable()) return;
        this.resetSortState('idle');
    },

    buildChordData(n, m, radius, cx, cy) {
        return this.buildGeometryProvider(n, m, radius, cx, cy).items;
    },

    getSortSignature(n, m) {
        return [
            n,
            m.toFixed(6),
            this.colorMode,
            this.sortMode,
            this.integersOnly ? 1 : 0,
            this.learningMode
        ].join('|');
    },

    extractSortItems(items) {
        if (!Array.isArray(items)) return [];
        return items.map((item, index) => {
            return {
                originalIndex: index,
                hueKey: item.hue || 0,
                saturationKey: item.saturation || 0,
                lightnessKey: item.lightness || 0,
                color: item.color || '#fff'
            };
        });
    },

    getSortSignatureFromProvider(provider) {
        if (!provider) return '';
        return [
            provider.providerId || 'provider',
            provider.revision || '',
            this.sortMode,
            this.integersOnly ? 1 : 0,
            this.learningMode
        ].join('|');
    },

    isSortingEnabled() {
        return (
            this.sortingStatus === 'running'
            || this.sortingStatus === 'holding'
            || this.sortingStatus === 'completed'
        ) && this.isSortModeAvailable() && !!this.sortLockedState;
    },

    ensureSortPlan(provider = null) {
        const itemCount = provider?.items?.length || this.sortLockedState?.n || 0;
        if (!this.isSortingEnabled() || !itemCount) {
            this.sortPlan = null;
            this.sortSignature = '';
            return null;
        }
        return provider ? this.buildSortPlanFromProvider(provider) : this.buildSortPlanForCurrentState();
    },

    getSortViewState(plan) {
        if (!plan) return null;

        if (plan.type === 'bubble') {
            const totalSteps = plan.totalSteps;
            const progress = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));

            if (progress >= totalSteps) {
                return {
                    passIndex: plan.n - 2,
                    passNumber: Math.max(1, plan.n - 1),
                    totalPasses: Math.max(1, plan.n - 1),
                    passLabel: 'Completed',
                    stepInPass: 0,
                    totalInPass: 0,
                    activeDigit: null,
                    activeIndices: null,
                    completed: true,
                    drawEntries: plan.finalState,
                    coloredCount: plan.finalState.length,
                    sortedSuffixCount: plan.n
                };
            }

            let passIndex = 0;
            let accumulated = 0;
            while (passIndex < plan.snapshots.length) {
                const stepCount = plan.snapshots[passIndex].stepCount;
                if (progress < accumulated + stepCount) break;
                accumulated += stepCount;
                passIndex += 1;
            }

            const snapshot = plan.snapshots[Math.min(passIndex, plan.snapshots.length - 1)];
            if (!snapshot) return null;

            const stepInPass = progress - accumulated;
            const currentArr = [...snapshot.order];

            for (let compareIndex = 0; compareIndex < stepInPass; compareIndex++) {
                if (currentArr[compareIndex].hueKey > currentArr[compareIndex + 1].hueKey) {
                    [currentArr[compareIndex], currentArr[compareIndex + 1]] = [currentArr[compareIndex + 1], currentArr[compareIndex]];
                }
            }

            return {
                passIndex,
                passNumber: passIndex + 1,
                totalPasses: plan.snapshots.length,
                passLabel: snapshot.label,
                stepInPass,
                totalInPass: snapshot.stepCount,
                activeDigit: null,
                activeIndices: [stepInPass, stepInPass + 1],
                completed: false,
                drawEntries: currentArr,
                coloredCount: 0,
                sortedSuffixCount: passIndex
            };
        }

        if (plan.type === 'insertion') {
            const totalSteps = plan.totalSteps;
            const progress = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));

            if (progress >= totalSteps) {
                return {
                    passIndex: Math.max(0, plan.n - 2),
                    passNumber: Math.max(1, plan.n - 1),
                    totalPasses: Math.max(1, plan.n - 1),
                    passLabel: 'Completed',
                    stepInPass: 0,
                    totalInPass: 0,
                    activeDigit: null,
                    activeIndices: null,
                    completed: true,
                    drawEntries: plan.finalState,
                    coloredCount: plan.finalState.length,
                    sortedPrefixCount: plan.n
                };
            }

            let passIndex = 0;
            let accumulated = 0;
            while (passIndex < plan.snapshots.length) {
                const stepCount = plan.snapshots[passIndex].stepCount;
                if (progress < accumulated + stepCount) break;
                accumulated += stepCount;
                passIndex += 1;
            }

            const snapshot = plan.snapshots[Math.min(passIndex, plan.snapshots.length - 1)];
            if (!snapshot) return null;

            const stepInPass = progress - accumulated;
            const currentArr = [...snapshot.order];

            for (let offset = 0; offset < stepInPass; offset++) {
                const rightIndex = snapshot.passIndex - offset;
                if (rightIndex <= 0) break;
                if (currentArr[rightIndex - 1].hueKey > currentArr[rightIndex].hueKey) {
                    [currentArr[rightIndex - 1], currentArr[rightIndex]] = [currentArr[rightIndex], currentArr[rightIndex - 1]];
                } else {
                    break;
                }
            }

            const activeRightIndex = Math.max(1, snapshot.passIndex - stepInPass);
            return {
                passIndex,
                passNumber: passIndex + 1,
                totalPasses: plan.snapshots.length,
                passLabel: snapshot.label,
                stepInPass,
                totalInPass: snapshot.stepCount,
                activeDigit: null,
                activeIndices: [activeRightIndex - 1, activeRightIndex],
                completed: false,
                drawEntries: currentArr,
                coloredCount: 0,
                sortedPrefixCount: snapshot.passIndex
            };
        }

        if (plan.type === 'selection') {
            const totalSteps = plan.totalSteps;
            const progress = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));

            if (progress >= totalSteps) {
                return {
                    passIndex: Math.max(0, plan.n - 2),
                    passNumber: Math.max(1, plan.n - 1),
                    totalPasses: Math.max(1, plan.n - 1),
                    passLabel: 'Completed',
                    stepInPass: 0,
                    totalInPass: 0,
                    activeDigit: null,
                    activeIndices: null,
                    completed: true,
                    drawEntries: plan.finalState,
                    coloredCount: plan.finalState.length,
                    sortedPrefixCount: plan.n
                };
            }

            let passIndex = 0;
            let accumulated = 0;
            while (passIndex < plan.snapshots.length) {
                const stepCount = plan.snapshots[passIndex].stepCount;
                if (progress < accumulated + stepCount) break;
                accumulated += stepCount;
                passIndex += 1;
            }

            const snapshot = plan.snapshots[Math.min(passIndex, plan.snapshots.length - 1)];
            if (!snapshot) return null;

            const stepInPass = progress - accumulated;
            const currentArr = [...snapshot.order];
            const compareCount = Math.max(0, snapshot.stepCount - 1);
            let minIndex = snapshot.passIndex;
            let activeIndices = [snapshot.passIndex, snapshot.passIndex];

            const comparisonsToRun = Math.min(stepInPass, compareCount);
            for (let offset = 0; offset < comparisonsToRun; offset++) {
                const scanIndex = snapshot.passIndex + 1 + offset;
                if (scanIndex >= currentArr.length) break;
                if (currentArr[scanIndex].hueKey < currentArr[minIndex].hueKey) {
                    minIndex = scanIndex;
                }
                activeIndices = [minIndex, scanIndex];
            }

            if (stepInPass >= compareCount && compareCount > 0) {
                activeIndices = [snapshot.passIndex, minIndex];
                if (minIndex !== snapshot.passIndex) {
                    [currentArr[snapshot.passIndex], currentArr[minIndex]] = [currentArr[minIndex], currentArr[snapshot.passIndex]];
                }
            }

            return {
                passIndex,
                passNumber: passIndex + 1,
                totalPasses: plan.snapshots.length,
                passLabel: snapshot.label,
                stepInPass,
                totalInPass: snapshot.stepCount,
                activeDigit: null,
                activeIndices,
                completed: false,
                drawEntries: currentArr,
                coloredCount: 0,
                sortedPrefixCount: snapshot.passIndex + (stepInPass >= compareCount ? 1 : 0),
                selectionMinIndex: minIndex
            };
        }

        if (plan.type === 'quick') {
            const totalSteps = plan.totalSteps;
            const progress = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));

            if (progress >= totalSteps) {
                return {
                    passIndex: totalSteps,
                    passNumber: totalSteps,
                    totalPasses: totalSteps,
                    passLabel: 'Completed',
                    stepInPass: 0,
                    totalInPass: 0,
                    activeDigit: null,
                    activeIndices: null,
                    completed: true,
                    drawEntries: plan.finalState,
                    coloredCount: plan.finalState.length,
                    pivotIndex: null,
                    range: null
                };
            }

            const event = plan.events[Math.max(0, Math.min(plan.events.length - 1, progress))];
            if (!event) {
                return {
                    passIndex: 0,
                    passNumber: 1,
                    totalPasses: 1,
                    passLabel: 'Partition 1',
                    stepInPass: 0,
                    totalInPass: plan.totalSteps,
                    activeDigit: null,
                    activeIndices: null,
                    completed: false,
                    drawEntries: plan.initialState,
                    coloredCount: 0,
                    pivotIndex: null,
                    range: null
                };
            }

            return {
                passIndex: progress,
                passNumber: progress + 1,
                totalPasses: totalSteps,
                passLabel: event.partitionLabel,
                stepInPass: progress,
                totalInPass: totalSteps,
                activeDigit: null,
                activeIndices: event.activeIndices,
                completed: false,
                drawEntries: this.getQuickSortOrderAtEvent(plan, progress),
                coloredCount: 0,
                pivotIndex: event.pivotIndex,
                range: event.range,
                swapIndices: event.swapIndices || null,
                pivotSettled: !!event.pivotSettled
            };
        }

        if (plan.type === 'circle' || plan.type === 'bitonic' || plan.type === 'cocktail' || plan.type === 'shell' || plan.type === 'center_out') {
            const totalSteps = plan.totalSteps;
            const progress = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));

            if (progress >= totalSteps) {
                return {
                    passIndex: totalSteps,
                    passNumber: totalSteps,
                    totalPasses: totalSteps,
                    passLabel: 'Completed',
                    stepInPass: 0,
                    totalInPass: 0,
                    activeDigit: null,
                    activeIndices: null,
                    completed: true,
                    drawEntries: plan.finalState,
                    coloredCount: plan.finalState.length
                };
            }

            const event = plan.events[progress];
            if (!event) return null;

            return {
                passIndex: progress,
                passNumber: progress + 1,
                totalPasses: totalSteps,
                passLabel: event.label,
                stepInPass: progress,
                totalInPass: totalSteps,
                activeDigit: null,
                activeIndices: event.activeIndices,
                completed: false,
                drawEntries: this.getQuickSortOrderAtEvent(plan, progress),
                coloredCount: 0,
                swapIndices: event.swapIndices || null
            };
        }


        if (!plan.passes.length) return null;

        const totalSteps = plan.totalSteps;
        const completedSteps = Math.max(0, Math.min(totalSteps, Math.floor(this.sortProgress)));
        if (completedSteps >= totalSteps) {
            const finalPass = plan.passes[plan.passes.length - 1];
            return {
                passIndex: plan.passes.length - 1,
                passNumber: plan.passes.length,
                totalPasses: plan.passes.length,
                passLabel: finalPass.label,
                stepInPass: finalPass.order.length,
                totalInPass: finalPass.order.length,
                activeDigit: null,
                bucketCounts: finalPass.bucketCounts,
                completed: true,
                drawEntries: finalPass.order,
                coloredCount: finalPass.order.length
            };
        }

        const passLength = plan.passes[0].sourceOrder.length;
        const passIndex = Math.floor(completedSteps / passLength);
        const stepInPass = completedSteps % passLength;
        const pass = plan.passes[passIndex];
        const numBuckets = (plan.type === 'bucket') ? pass.bucketCounts.length : 10;
        const processedBuckets = Array.from({ length: numBuckets }, () => []);

        for (let i = 0; i < stepInPass; i++) {
            processedBuckets[pass.digits[i]].push(pass.sourceOrder[i]);
        }

        const drawEntries = processedBuckets.flat().concat(pass.sourceOrder.slice(stepInPass));
        const activeDigit = stepInPass < pass.digits.length ? pass.digits[stepInPass] : null;

        return {
            passIndex,
            passNumber: passIndex + 1,
            totalPasses: plan.passes.length,
            passLabel: pass.label,
            stepInPass,
            totalInPass: pass.sourceOrder.length,
            activeDigit,
            bucketCounts: pass.bucketCounts,
            completed: false,
            drawEntries,
            coloredCount: stepInPass
        };
    },

    drawSortBuckets(ctx, w, h, sortView) {
        if (!sortView || ['bubble', 'quick', 'insertion', 'selection', 'center_out'].includes(this.sortMode)) return;

        const layout = this.getSortPanelLayout(w, h);
        if (!layout) return;
        const { panelW, panelH, panelX, panelY } = layout;
        const maxCount = Math.max(1, ...sortView.bucketCounts);
        const chartTop = panelY + 34;
        const chartBottom = panelY + panelH - 24;
        const chartHeight = chartBottom - chartTop;
        
        // Dynamic bucket sizing: 
        // Radix (10 buckets) uses original 14/6.
        // Bucket (5 buckets) will use wider bars.
        const numBuckets = sortView.bucketCounts.length;
        const gap = numBuckets > 5 ? 6 : 12;
        const barW = (panelW - 28 - (gap * (numBuckets - 1))) / numBuckets;

        ctx.save();
        ctx.fillStyle = 'rgba(10, 14, 24, 0.82)';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 16);
        ctx.fill();
        ctx.stroke();

        let passTimeLabel = '0.0s / 0.0s';
        if (this.sortSpeed > 0 && sortView.totalInPass > 0) {
            const passElapsedSeconds = sortView.stepInPass / this.sortSpeed;
            const passTotalSeconds = sortView.totalInPass / this.sortSpeed;
            passTimeLabel = `${Math.max(0, passElapsedSeconds).toFixed(1)}s / ${Math.max(0, passTotalSeconds).toFixed(1)}s`;
        }

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 12px Inter, system-ui, sans-serif';
        ctx.fillText(sortView.passLabel || 'Buckets', panelX + 14, panelY + 20);
        ctx.save();
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.72)';
        ctx.font = '600 10px IBM Plex Sans, sans-serif';
        ctx.fillText(passTimeLabel, panelX + panelW - 14, panelY + 20);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.56)';
        ctx.font = '500 10px IBM Plex Sans, sans-serif';
        ctx.fillText(`Pass ${sortView.passNumber}/${sortView.totalPasses}`, panelX + 14, panelY + 32);

        for (let digit = 0; digit < numBuckets; digit++) {
            const count = sortView.bucketCounts[digit];
            const x = panelX + 14 + digit * (barW + gap);
            const barH = (count / maxCount) * chartHeight;
            const y = chartBottom - barH;
            const isActive = sortView.activeDigit === digit;
            const hue = digit * 36;
            const isLightnessPass = (sortView.passLabel || '').toLowerCase().includes('lightness');
            const isSaturationPass = (sortView.passLabel || '').toLowerCase().includes('saturation');

            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.fillRect(x, chartTop, barW, chartHeight);

            let activeColor;
            let baseColor;
            let glowColor;

            if (isLightnessPass) {
                const lightness = 16 + digit * 7.6;
                activeColor = `hsla(0, 0%, ${Math.min(92, lightness + 10)}%, 0.96)`;
                baseColor = `hsla(0, 0%, ${lightness}%, 0.62)`;
                glowColor = `hsla(0, 0%, 100%, 0.4)`;
            } else if (isSaturationPass) {
                const sat = 10 + digit * 8.5;
                activeColor = `hsla(164, ${Math.min(100, sat + 10)}%, 68%, 0.96)`;
                baseColor = `hsla(164, ${sat}%, 56%, 0.62)`;
                glowColor = `hsla(164, 100%, 80%, 0.4)`;
            } else {
                activeColor = `hsla(${hue}, 95%, 68%, 0.96)`;
                baseColor = `hsla(${hue}, 88%, 60%, 0.56)`;
                glowColor = `hsla(${hue}, 100%, 75%, 0.5)`;
            }

            if (isActive) {
                const grad = ctx.createLinearGradient(x, y, x, chartBottom);
                grad.addColorStop(0, activeColor);
                grad.addColorStop(1, baseColor);
                ctx.fillStyle = grad;
                ctx.fillRect(x - 1, y, barW + 2, barH);
                
                // Subtle white top highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(x - 1, y, barW + 2, 2);
            } else {
                ctx.fillStyle = baseColor;
                ctx.fillRect(x, y, barW, barH);
            }

            if (isActive) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - 2, chartTop - 2, barW + 4, chartHeight + 4);
            }

            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = '600 10px IBM Plex Sans, sans-serif';
            ctx.fillText(String(digit), x + 2, panelY + panelH - 8);
        }

        ctx.restore();
    },

    getSortPassDescriptors(mode) {
        if (mode === 'lsh') {
            return [
                { key: 'lightnessKey', divisor: 1, label: 'Lightness' },
                { key: 'saturationKey', divisor: 1, label: 'Saturation' },
                { key: 'hueKey', divisor: 1, label: 'Hue (Units)' },
                { key: 'hueKey', divisor: 10, label: 'Hue (Tens)' },
                { key: 'hueKey', divisor: 100, label: 'Hue (Hundreds)' }
            ];
        }
        // Default Hue Radix
        return [
            { key: 'hueKey', divisor: 1, label: 'Hue (Units)' },
            { key: 'hueKey', divisor: 10, label: 'Hue (Tens)' },
            { key: 'hueKey', divisor: 100, label: 'Hue (Hundreds)' }
        ];
    },

    updateSortingState(dt) {
        if (this.sortingStatus !== 'running') return;
        if (!this.isSortingEnabled()) return;
        if (this.isSortPassTransitionBlocking()) return;
        const provider = this.getCurrentGeometryProvider();
        const plan = this.ensureSortPlan(provider);
        const totalSteps = plan?.totalSteps || 0;
        if (!totalSteps) return;
        const previousProgress = this.sortProgress;
        const effectiveSortSpeed = this.getEffectiveSortSpeed();
        this.sortProgress = Math.min(totalSteps, this.sortProgress + effectiveSortSpeed * dt);
        if (typeof Core !== 'undefined' && typeof Core.maybePlaySortingTick === 'function') {
            Core.maybePlaySortingTick(this, previousProgress, this.sortProgress, plan);
        }
        if (this.sortProgress >= totalSteps) {
            this.sortingStatus = 'completed';
        }
    },

    drawSortOverlay(ctx, viewState) {
        if (typeof this.drawSortPassTransitionOverlay === 'function') {
            this.drawSortPassTransitionOverlay(ctx, viewState);
        }
        if (viewState.sortingActive && viewState.sortView) {
            this.drawSortBuckets(ctx, viewState.w, viewState.h, viewState.sortView);
        }
    }
};

if (typeof SortShuffleManager !== 'undefined') {
    Object.assign(SortEngine, SortShuffleManager);
}

const CardioidCircleSorting = SortEngine;
