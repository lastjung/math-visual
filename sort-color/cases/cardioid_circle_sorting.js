const CardioidCircleSorting = {
    resetSortState(status = 'idle') {
        this.sortingStatus = status;
        this.sortProgress = 0;
        this.sortPlan = null;
        this.sortSignature = '';
        this.sortLockedState = null;
    },

    getSortPanelLayout(w, h) {
        if (this.sortMode === 'bubble' || this.sortMode === 'quick') return null;
        const panelW = 216;
        const panelH = 124;
        const panelX = this.sortPanelPosition?.x ?? (w - panelW - 24);
        const panelY = this.sortPanelPosition?.y ?? (h - panelH - 24);
        return { panelW, panelH, panelX, panelY };
    },

    isSortModeAvailable() {
        return this.sortMode === 'hue' || this.sortMode === 'lsh' || this.sortMode === 'bubble' || this.sortMode === 'quick';
    },

    canRunSort() {
        return this.isSortModeAvailable()
            && (this.learningMode === 'off' || this.isPaused);
    },

    captureSortLockedState() {
        const n = Math.max(0, Math.floor(this.pointCount));
        const forceIntegerM = this.learningMode === 'gcd' || this.learningMode === 'integer-snap' || this.learningMode === 'mapping';
        const m = (this.integersOnly || forceIntegerM) ? Math.round(this.multiplier) : this.multiplier;
        this.sortLockedState = { n, m };
        return this.sortLockedState;
    },

    buildSortPlanForCurrentState() {
        const locked = this.sortLockedState || this.captureSortLockedState();
        const n = locked.n;
        if (!this.isSortModeAvailable() || n <= 0) return null;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.48;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const m = locked.m;
        const chords = this.buildChordData(n, m, radius, cx, cy);
        const signature = this.getSortSignature(n, m);
        if (this.sortPlan && this.sortSignature === signature) {
            return this.sortPlan;
        }

        let sourceOrder = chords.map((chord) => {
            const hueKey = this.getHueKey(chord.hue);
            return {
                ...chord,
                hueKey,
                hueBucket: this.getChannelBucket(hueKey, 359),
                saturationBucket: this.getChannelBucket(chord.saturation, 100),
                lightnessBucket: this.getChannelBucket(chord.lightness, 100)
            };
        });

        if (this.sortMode === 'bubble') {
            const arr = [...sourceOrder];
            const snapshots = [];
            let totalSteps = 0;

            for (let passIndex = 0; passIndex < n - 1; passIndex++) {
                const innerSteps = n - 1 - passIndex;
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

            this.sortPlan = {
                type: 'bubble',
                snapshots,
                finalState: [...arr],
                totalSteps,
                n
            };
            this.sortSignature = signature;
            return this.sortPlan;
        }

        if (this.sortMode === 'quick') {
            const arr = [...sourceOrder];
            const events = [];
            let partitionCount = 0;

            const pushEvent = (meta) => {
                events.push({
                    order: [...arr],
                    ...meta
                });
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

            this.sortPlan = {
                type: 'quick',
                events,
                initialState: sourceOrder,
                finalState: [...arr],
                totalSteps: events.length
            };
            this.sortSignature = signature;
            return this.sortPlan;
        }

        const passes = [];
        const passDescriptors = this.sortMode === 'lsh'
            ? [
                { key: 'lightnessBucket', label: 'Lightness' },
                { key: 'saturationBucket', label: 'Saturation' },
                { key: 'hueKey', divisor: 1, label: 'Hue 1s' },
                { key: 'hueKey', divisor: 10, label: 'Hue 10s' },
                { key: 'hueKey', divisor: 100, label: 'Hue 100s' }
            ]
            : [
                { key: 'hueKey', divisor: 1, label: 'Hue 1s' },
                { key: 'hueKey', divisor: 10, label: 'Hue 10s' },
                { key: 'hueKey', divisor: 100, label: 'Hue 100s' }
            ];

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

        this.sortPlan = {
            passes,
            totalSteps: passes.length * n
        };
        this.sortSignature = signature;
        return this.sortPlan;
    },

    getSortTotalSteps() {
        const plan = this.buildSortPlanForCurrentState();
        return plan?.totalSteps || 0;
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
        const totalSteps = this.getSortTotalSteps();
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

    getShuffleSignature(n, m) {
        return [
            n,
            m.toFixed(6),
            this.learningMode,
            this.integersOnly ? 1 : 0,
            this.shuffleNonce
        ].join('|');
    },

    ensureShuffleOrder(n, m) {
        if (n <= 0) {
            this.shuffleOrder = null;
            this.shuffleSignature = '';
            return null;
        }

        const signature = this.getShuffleSignature(n, m);
        if (this.shuffleOrder && this.shuffleSignature === signature && this.shuffleOrder.length === n) {
            return this.shuffleOrder;
        }

        const order = Array.from({ length: n }, (_, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        this.shuffleOrder = order;
        this.shuffleSignature = signature;
        return order;
    },

    shuffleChords() {
        this.shuffleNonce += 1;
        this.shuffleOrder = null;
        this.shuffleSignature = '';
        this.shuffleFlash = 1;
        this.sortMode = 'off';
        this.resetSortState('idle');
    },

    buildChordData(n, m, radius, cx, cy) {
        const shuffleOrder = this.ensureShuffleOrder(n, m);
        const chords = [];
        for (let i = 0; i < n; i++) {
            const from = this.circlePoint(i, n, radius, cx, cy);
            const j = (m * i) % n;
            const to = this.circlePointByIndex(j, n, radius, cx, cy);

            const visual = this.lineVisual(i, n, from, to, radius);
            chords.push({
                originalIndex: i,
                hue: visual.hue,
                saturation: visual.saturation,
                lightness: visual.lightness,
                alpha: visual.alpha,
                color: visual.color
            });
        }

        const finalChords = shuffleOrder ? shuffleOrder.map((idx) => chords[idx]) : chords;

        for (let k = 0; k < n; k++) {
            const from = this.circlePoint(k, n, radius, cx, cy);
            const j = (m * k) % n;
            const to = this.circlePointByIndex(j, n, radius, cx, cy);
            finalChords[k].from = from;
            finalChords[k].to = to;
        }

        return finalChords;
    },

    getHueKey(hue) {
        return Math.max(0, Math.min(359, Math.round(hue)));
    },

    getChannelBucket(value, maxValue) {
        const safe = Math.max(0, Math.min(maxValue, value));
        if (maxValue <= 0) return 0;
        return Math.max(0, Math.min(9, Math.floor((safe / (maxValue + 0.0001)) * 10)));
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

    isSortingEnabled() {
        return (
            this.sortingStatus === 'running'
            || this.sortingStatus === 'holding'
            || this.sortingStatus === 'completed'
        ) && this.isSortModeAvailable() && !!this.sortLockedState;
    },

    ensureSortPlan(chords, n, m) {
        if (!this.isSortingEnabled() || !n) {
            this.sortPlan = null;
            this.sortSignature = '';
            return null;
        }
        return this.buildSortPlanForCurrentState();
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
                drawEntries: event.order,
                coloredCount: 0,
                pivotIndex: event.pivotIndex,
                range: event.range,
                swapIndices: event.swapIndices || null,
                pivotSettled: !!event.pivotSettled
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
        const processedBuckets = Array.from({ length: 10 }, () => []);

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
        if (!sortView || this.sortMode === 'bubble' || this.sortMode === 'quick') return;

        const layout = this.getSortPanelLayout(w, h);
        if (!layout) return;
        const { panelW, panelH, panelX, panelY } = layout;
        const maxCount = Math.max(1, ...sortView.bucketCounts);
        const chartTop = panelY + 34;
        const chartBottom = panelY + panelH - 24;
        const chartHeight = chartBottom - chartTop;
        const barW = 14;
        const gap = 6;

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

        for (let digit = 0; digit < 10; digit++) {
            const count = sortView.bucketCounts[digit];
            const x = panelX + 14 + digit * (barW + gap);
            const barH = (count / maxCount) * chartHeight;
            const y = chartBottom - barH;
            const isActive = sortView.activeDigit === digit;
            const hue = digit * 36;
            const isLightnessPass = (sortView.passLabel || '').toLowerCase().includes('lightness');
            const isSaturationPass = (sortView.passLabel || '').toLowerCase().includes('saturation');

            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x, chartTop, barW, chartHeight);

            let activeColor;
            let baseColor;
            if (isLightnessPass) {
                const lightness = 16 + digit * 7.6;
                activeColor = `hsla(0, 0%, ${Math.min(92, lightness + 10)}%, 0.96)`;
                baseColor = `hsla(0, 0%, ${lightness}%, 0.62)`;
            } else if (isSaturationPass) {
                const sat = 10 + digit * 8.5;
                activeColor = `hsla(164, ${Math.min(100, sat + 10)}%, 68%, 0.96)`;
                baseColor = `hsla(164, ${sat}%, 56%, 0.62)`;
            } else {
                activeColor = `hsla(${hue}, 95%, 68%, 0.96)`;
                baseColor = `hsla(${hue}, 88%, 60%, 0.56)`;
            }

            ctx.fillStyle = isActive ? activeColor : baseColor;
            ctx.fillRect(x, y, barW, Math.max(barH, 2));

            if (isActive) {
                ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x - 2, chartTop - 2, barW + 4, chartHeight + 4);
            }

            ctx.fillStyle = 'rgba(255,255,255,0.72)';
            ctx.font = '600 10px IBM Plex Sans, sans-serif';
            ctx.fillText(String(digit), x + 2, panelY + panelH - 8);
        }

        ctx.restore();
    },

    updateSortingState(dt) {
        if (this.sortingStatus !== 'running') return;
        if (!this.isSortingEnabled()) return;
        const totalSteps = this.getSortTotalSteps();
        if (!totalSteps) return;
        this.sortProgress = Math.min(totalSteps, this.sortProgress + this.sortSpeed * dt);
        if (this.sortProgress >= totalSteps) {
            this.sortingStatus = 'completed';
        }
    },

    drawSortOverlay(ctx, viewState) {
        if (viewState.sortingActive && viewState.sortView) {
            this.drawSortBuckets(ctx, viewState.w, viewState.h, viewState.sortView);
        }
    }
};
