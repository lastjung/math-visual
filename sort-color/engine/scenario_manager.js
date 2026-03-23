const SortColorScenarioManager = {
    clearSimTimers() {
        this.simTimers.forEach((id) => {
            clearTimeout(id);
            clearInterval(id);
        });
        this.simTimers = [];
    },

    restoreSimulationSortSpeed() {
        if (!this.currentCase || !this.simStateSnapshot) return;
        const initialSortSpeed = this.simStateSnapshot.initialSortSpeed;
        if (typeof initialSortSpeed === 'number') {
            this.currentCase.sortSpeed = initialSortSpeed;
            return;
        }
        if (typeof this.simStateSnapshot.sortSpeed === 'number') {
            this.currentCase.sortSpeed = this.simStateSnapshot.sortSpeed;
        }
    },

    applySimulationSortSpeed(multiplier = 1) {
        if (!this.currentCase || !this.simStateSnapshot) return Math.max(1, this.currentCase?.sortSpeed || 1);
        const baseSortSpeed = Math.max(1, this.simStateSnapshot.sortSpeed || this.currentCase.sortSpeed || 1);
        const effectiveMultiplier = Math.max(1, multiplier || 1);
        this.currentCase.sortSpeed = Math.max(1, baseSortSpeed * effectiveMultiplier);
        return this.currentCase.sortSpeed;
    },

    failSimulation(error) {
        console.error('[SortColor] Simulation aborted:', error);
        this.stopSimulation();
    },

    showSimMessage(title, subtitle, duration = 3000, extraHtml = '') {
        const overlay = document.getElementById('sim-overlay');
        const titleEl = document.getElementById('sim-title');
        const subtitleEl = document.getElementById('sim-subtitle');
        const extraEl = document.getElementById('sim-extra');
        if (!overlay || !titleEl || !subtitleEl || !extraEl) return;

        titleEl.textContent = title;
        subtitleEl.textContent = subtitle;
        extraEl.innerHTML = extraHtml || '';
        overlay.classList.add('visible');

        if (duration <= 0) return;

        const tid = setTimeout(() => {
            overlay.classList.remove('visible');
            extraEl.innerHTML = '';
        }, duration);
        this.simTimers.push(tid);
    },

    stopSimulation() {
        this.clearSimTimers();
        this.isSimRunning = false;
        this.simStartMs = null;
        const overlay = document.getElementById('sim-overlay');
        if (overlay) overlay.classList.remove('visible');
        const extraEl = document.getElementById('sim-extra');
        if (extraEl) extraEl.innerHTML = '';

        if (this.currentCase && this.simStateSnapshot) {
            if (typeof this.simStateSnapshot.pointCount === 'number') {
                this.currentCase.pointCount = this.simStateSnapshot.pointCount;
            }
            if (typeof this.simStateSnapshot.sortMode === 'string') {
                this.currentCase.sortMode = this.simStateSnapshot.sortMode;
            }
            this.restoreSimulationSortSpeed();
            if (this.simStateSnapshot.sortSpeedMode) {
                this.currentCase.sortSpeedMode = this.simStateSnapshot.sortSpeedMode;
            }
            if (typeof this.currentCase.resetSortState === 'function') {
                this.currentCase.resetSortState('idle');
            }
            if (typeof this.currentCase.draw === 'function') {
                this.currentCase.draw();
            }
            this.updateControls();
        }
        this.simStateSnapshot = null;
        this.currentScenario = null;
    },

    runRaysSimulation() {
        if (this.isSimRunning) {
            this.stopSimulation();
            return;
        }
        if (!this.currentCase) return;

        this.isSimRunning = true;
        this.simStartMs = performance.now();
        this.simStateSnapshot = {
            pointCount: this.currentCase.pointCount,
            sortMode: this.currentCase.sortMode,
            sortSpeed: this.currentCase.sortSpeed,
            initialSortSpeed: this.currentCase.sortSpeed,
            sortSpeedMode: this.currentCase.sortSpeedMode
        };
        this.currentCase.sortSpeedMode = 'uniform';
        this.currentScenario = '1_rays';
        const scenarioSelect = document.getElementById('apple-scenario-select');
        if (scenarioSelect) scenarioSelect.value = '1_rays';

        const unit = this.currentGeometryId === 'goldberg_sphere' ? 'Faces' : 'Rays';
        const sortLabels = {
            hue: 'Hue Radix Sort',
            lsh: 'L-S-H Radix Sort',
            bubble: 'Bubble Sort',
            quick: 'Quick Sort',
            insertion: 'Insertion Sort'
        };
        const stages = [180, 360, 720, 1080].map((n) => ({ n, subtitle: `${n} ${unit}` }));
        const results = [];
        const formatSeconds = (value) => `${Math.max(0, value).toFixed(1)}s`;
        const buildRaysTable = () => {
            const baseDur = results[0]?.rawDur || 0.1;
            const header = ['Target Count', 'Sim Time', 'Ratio']
                .map((title) => `<div class="sim-table-cell head">${title}</div>`).join('');
            const rows = results.map((entry) => {
                const ratio = Math.max(1, entry.rawDur / baseDur).toFixed(1);
                return `
                    <div class="sim-table-cell cell-alg">${entry.label}</div>
                    <div class="sim-table-cell cell-val">${entry.duration}</div>
                    <div class="sim-table-cell cell-val">${ratio}x</div>
                `;
            }).join('');

            return `<div class="sim-compare-summary sim-3col">${header}${rows}</div>`;
        };

        let currentIdx = 0;
        const runStage = () => {
            if (!this.isSimRunning || currentIdx >= stages.length) {
                const finalMode = (this.currentCase.sortMode && this.currentCase.sortMode !== 'off')
                    ? this.currentCase.sortMode
                    : 'hue';
                this.playGameSound('complete');
                this.showSimMessage(sortLabels[finalMode] || 'Color Sort', 'Rays Scaling Summary', 9000, buildRaysTable());
                const tid = setTimeout(() => this.stopSimulation(), 9400);
                this.simTimers.push(tid);
                return;
            }

            const stage = stages[currentIdx];
            if (typeof this.currentCase.resetSortState === 'function') {
                this.currentCase.resetSortState('idle');
            }
            this.currentCase.pointCount = stage.n;
            if (typeof this.currentCase.shuffleScene === 'function') {
                this.playGameSound('shuffle');
                this.currentCase.shuffleScene();
            } else if (typeof this.currentCase.resetSortState === 'function') {
                this.currentCase.resetSortState('idle');
            }
            this.currentCase.draw();
            this.updateControls();

            const activeSortMode = (this.currentCase.sortMode && this.currentCase.sortMode !== 'off')
                ? this.currentCase.sortMode
                : 'hue';
            if (this.currentCase.sortMode === 'off') {
                this.currentCase.sortMode = activeSortMode;
            }

            const stageTitle = sortLabels[activeSortMode] || 'Color Sort';
            const multipliers = { hue: 1, lsh: 1, bubble: 50, quick: 5, insertion: 50 };
            const activeSortSpeedMultiplier = multipliers[activeSortMode] || 1;
            const totalSteps = typeof this.currentCase.getSortTotalSteps === 'function'
                ? this.currentCase.getSortTotalSteps()
                : (stage.n * 3);
            const baseSortSpeed = Math.max(1, this.currentCase.sortSpeed || 150);
            const effectiveSortSpeed = baseSortSpeed * activeSortSpeedMultiplier;
            const durationSecValue = totalSteps / effectiveSortSpeed;
            const durationSecText = `${durationSecValue.toFixed(1)}s`;

            this.showSimMessage(stageTitle, `${stage.subtitle}: ${durationSecText}`, 2500);

            const tid1 = setTimeout(() => {
                if (!this.isSimRunning) return;

                if (this.currentCase.sortMode === 'off') {
                    this.currentCase.sortMode = 'hue';
                }

                this.currentCase.restartSort();
                this.updateSortBar();
                this.applySimulationSortSpeed(activeSortSpeedMultiplier);
                this.showSimMessage('', `${stage.subtitle}: ${durationSecText}`, 0);
                const startedAt = performance.now();

                const checkFinished = setInterval(() => {
                    if (!this.isSimRunning) {
                        clearInterval(checkFinished);
                        return;
                    }
                    if (this.currentCase.sortingStatus === 'completed') {
                        clearInterval(checkFinished);
                        this.restoreSimulationSortSpeed();
                        const elapsedSec = (performance.now() - startedAt) / 1000;
                        results.push({
                            label: `${stage.n} ${unit}`,
                            duration: formatSeconds(elapsedSec),
                            rawDur: elapsedSec,
                            rawEst: durationSecValue
                        });
                        const tid2 = setTimeout(() => {
                            currentIdx += 1;
                            runStage();
                        }, 2000);
                        this.simTimers.push(tid2);
                    }
                }, 100);
                this.simTimers.push(checkFinished);
            }, 3000);
            this.simTimers.push(tid1);
        };

        runStage();
    },

    runBySortingSimulation() {
        if (this.isSimRunning) {
            this.stopSimulation();
            return;
        }
        if (!this.currentCase) return;

        this.isSimRunning = true;
        this.simStartMs = performance.now();
        this.simStateSnapshot = {
            pointCount: this.currentCase.pointCount,
            sortMode: this.currentCase.sortMode,
            sortSpeed: this.currentCase.sortSpeed,
            initialSortSpeed: this.currentCase.sortSpeed,
            sortSpeedMode: this.currentCase.sortSpeedMode
        };
        this.currentCase.sortSpeedMode = 'auto';
        this.currentScenario = '2_by-sorting';
        const scenarioSelect = document.getElementById('apple-scenario-select');
        if (scenarioSelect) scenarioSelect.value = '2_by-sorting';

        const simTitle = 'Hue Radix · Bubble Sort · Quick Sort · Insertion Sort';
        const stages = [
            { mode: 'hue', label: 'Hue Radix', speedMultiplier: 1 },
            { mode: 'bubble', label: 'Bubble Sort', speedMultiplier: 50 },
            { mode: 'quick', label: 'Quick Sort', speedMultiplier: 5 },
            { mode: 'insertion', label: 'Insertion Sort', speedMultiplier: 50 }
        ];
        const results = [];
        const formatSeconds = (value) => `${Math.max(0, value).toFixed(1)}s`;
        const buildCompareTable = () => {
            const baseTimeRaw = results[0]?.rawEst || 1;
            const header = ['Algorithm', 'Estimated', 'Booster', 'Sim Time', 'Rel Scale']
                .map((title) => `<div class="sim-table-cell head">${title}</div>`).join('');
            const rows = results.map((entry) => {
                const ratio = Math.max(1, entry.rawEst / baseTimeRaw).toFixed(1);
                return `
                    <div class="sim-table-cell cell-alg">${entry.label}</div>
                    <div class="sim-table-cell cell-val">${entry.estimatedTime}</div>
                    <div class="sim-table-cell cell-val">${entry.multiplier}x</div>
                    <div class="sim-table-cell cell-val">${entry.duration}</div>
                    <div class="sim-table-cell cell-val">${ratio}x</div>
                `;
            }).join('');

            return `<div class="sim-compare-summary">${header}${rows}</div>`;
        };

        let currentIdx = 0;
        const runStage = () => {
            try {
                if (!this.isSimRunning || currentIdx >= stages.length) {
                    this.restoreSimulationSortSpeed();
                    this.playGameSound('complete');
                    this.showSimMessage(simTitle, 'Sorting Comparison Summary', 9000, buildCompareTable());
                    const tid = setTimeout(() => this.stopSimulation(), 9400);
                    this.simTimers.push(tid);
                    return;
                }

                const stage = stages[currentIdx];
                if (typeof this.currentCase.resetSortState === 'function') {
                    this.currentCase.resetSortState('idle');
                }
                this.restoreSimulationSortSpeed();
                this.currentCase.sortMode = stage.mode;
                if (typeof this.currentCase.shuffleScene === 'function') {
                    this.playGameSound('shuffle');
                    this.currentCase.shuffleScene();
                }
                this.currentCase.draw();
                this.updateControls();

                const totalSteps = typeof this.currentCase.getSortTotalSteps === 'function'
                    ? this.currentCase.getSortTotalSteps()
                    : (this.currentCase.pointCount * 3);
                const baseSortSpeed = Math.max(1, this.simStateSnapshot?.sortSpeed || this.currentCase.sortSpeed || 150);
                const sortSpeedMultiplier = Math.max(1, stage.speedMultiplier || 1);
                const effectiveSortSpeed = this.applySimulationSortSpeed(sortSpeedMultiplier);
                const estimatedDurationSec = totalSteps / baseSortSpeed;
                const simDurationSec = totalSteps / effectiveSortSpeed;
                const subTitleText = `${stage.label} · ${sortSpeedMultiplier}x Boost · ${formatSeconds(estimatedDurationSec)} / ${formatSeconds(simDurationSec)}`;

                this.showSimMessage(currentIdx === 0 ? simTitle : '', subTitleText, currentIdx === 0 ? 2200 : 0);

                const tid1 = setTimeout(() => {
                    try {
                        if (!this.isSimRunning) return;
                        if (currentIdx === 0) {
                            this.showSimMessage(simTitle, subTitleText, 0);
                        }
                        const startedAt = performance.now();
                        this.currentCase.restartSort();
                        this.updateSortBar();

                        const checkFinished = setInterval(() => {
                            try {
                                if (!this.isSimRunning) {
                                    clearInterval(checkFinished);
                                    return;
                                }
                                if (this.currentCase.sortingStatus === 'completed') {
                                    clearInterval(checkFinished);
                                    this.restoreSimulationSortSpeed();
                                    const elapsedMs = performance.now() - startedAt;
                                    results.push({
                                        label: stage.label,
                                        multiplier: sortSpeedMultiplier,
                                        estimatedTime: formatSeconds(estimatedDurationSec),
                                        duration: formatSeconds(elapsedMs / 1000),
                                        rawEst: estimatedDurationSec
                                    });
                                    const tid2 = setTimeout(() => {
                                        try {
                                            currentIdx += 1;
                                            runStage();
                                        } catch (error) {
                                            this.failSimulation(error);
                                        }
                                    }, 1900);
                                    this.simTimers.push(tid2);
                                }
                            } catch (error) {
                                clearInterval(checkFinished);
                                this.failSimulation(error);
                            }
                        }, 100);
                        this.simTimers.push(checkFinished);
                    } catch (error) {
                        this.failSimulation(error);
                    }
                }, 2400);
                this.simTimers.push(tid1);
            } catch (error) {
                this.failSimulation(error);
            }
        };

        runStage();
    }
};
