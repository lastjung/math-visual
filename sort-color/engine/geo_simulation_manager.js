const GeoSimulationManager = {
    runGeoSimulation(mode) {
        if (!this.currentCase) return false;

        const normalizedMode = typeof mode === 'string' && mode ? mode : this.currentCase.learningMode;
        if (this.isSimRunning && this.currentScenario === `geo:${normalizedMode}`) {
            this.pauseGeoSimulation();
            return true;
        }

        const geoSimRunners = {
            '1_axes': () => this.runAxesSimulation()
        };

        const runner = geoSimRunners[normalizedMode];
        if (!runner) return false;
        runner();
        return true;
    },

    pauseGeoSimulation() {
        this.clearSimTimers();
        this.isSimRunning = false;
        this.simStartMs = null;
        const overlay = document.getElementById('sim-overlay');
        if (overlay) overlay.classList.remove('visible');
        const extraEl = document.getElementById('sim-extra');
        if (extraEl) extraEl.innerHTML = '';

        if (this.geoSimSession) {
            this.geoSimSession.paused = true;
        }

        if (this.currentCase) {
            if (typeof this.currentCase.setPaused === 'function') {
                this.currentCase.setPaused(true);
            } else {
                this.currentCase.isPaused = true;
            }
            if (typeof this.currentCase.draw === 'function') {
                this.currentCase.draw();
            }
        }

        this.updateControls();
        this.updateSortBar();
    },

    /**
     * Optimized Geometry Simulation Manager.
     * Ported with 1:1 fidelity from the SortSimulationManager's high-level logic.
     * Focused on construction and build analysis rather than sorting.
     */
    runAxesSimulation() {
        if (!this.currentCase || this.currentGeometryId !== 'envelope_radial') return;

        const stages = [3, 4, 5, 6, 7, 8].map((axes) => ({ axes, subtitle: `${axes} Axes` }));
        const isResume = this.geoSimSession?.mode === '1_axes' && this.geoSimSession?.paused;
        if (!isResume) {
            this.geoSimSession = {
                mode: '1_axes',
                paused: false,
                currentIdx: 0,
                phase: 'intro',
                results: []
            };
        } else {
            this.geoSimSession.paused = false;
        }

        this.isSimRunning = true;
        this.simStartMs = performance.now();
        if (!isResume) {
            this.simStateSnapshot = {
                envelopeAxesCount: this.currentCase.envelopeAxesCount,
                learningMode: this.currentCase.learningMode,
                envelopeLinesPerSector: this.currentCase.envelopeLinesPerSector,
                envelopeConstructionSpeed: this.currentCase.envelopeConstructionSpeed,
                envelopeConstructionProgress: this.currentCase.envelopeConstructionProgress,
                envelopeConstructionComplete: this.currentCase.envelopeConstructionComplete,
                colorMode: this.currentCase.colorMode,
                lineAlpha: this.currentCase.lineAlpha,
                lineWidth: this.currentCase.lineWidth,
                isPaused: this.currentCase.isPaused,
                pointCount: this.currentCase.pointCount,
                sortMode: this.currentCase.sortMode,
                sortingStatus: this.currentCase.sortingStatus
            };
        }

        this.currentScenario = 'geo:1_axes';
        const results = this.geoSimSession.results;
        const simTitle = 'Polygon Envelope';
        const formatSeconds = (value) => `${Math.max(0, value).toFixed(1)}s`;

        let currentIdx = this.geoSimSession.currentIdx || 0;
        const startBuildingWatch = (stage, currentStageTitle) => {
            const startedAt = performance.now();
            this.geoSimSession.phase = 'building';
            this.geoSimSession.currentIdx = currentIdx;

            if (typeof this.currentCase.setPaused === 'function') {
                this.currentCase.setPaused(false);
            }
            this.updateSortBar();
            this.showSimMessage('', stage.subtitle, 0);

            const checkFinished = setInterval(() => {
                try {
                    if (!this.isSimRunning) {
                        clearInterval(checkFinished);
                        return;
                    }

                    if (this.currentCase.envelopeConstructionComplete) {
                        clearInterval(checkFinished);

                        const elapsedSec = (performance.now() - startedAt) / 1000;
                        const hasExistingResult = results[currentIdx]?.label === `${stage.axes} Axes`;
                        if (!hasExistingResult) {
                            results.push({
                                label: `${stage.axes} Axes`,
                                duration: formatSeconds(elapsedSec),
                                rawDur: elapsedSec
                            });
                        }

                        this.geoSimSession.phase = 'transition';
                        const tid2 = setTimeout(() => {
                            currentIdx += 1;
                            this.geoSimSession.currentIdx = currentIdx;
                            this.geoSimSession.phase = 'intro';
                            runStage();
                        }, 2200);
                        this.simTimers.push(tid2);
                    }
                } catch (err) {
                    clearInterval(checkFinished);
                    this.failSimulation(err);
                }
            }, 100);
            this.simTimers.push(checkFinished);
        };

        const runStage = () => {
            try {
                if (!this.isSimRunning || currentIdx >= stages.length) {
                    this.geoSimSession = null;
                    this.playGameSound('complete');
                    this.showSimMessage('', 'Completed', 2200);
                    const tid = setTimeout(() => this.stopSimulation(), 2400);
                    this.simTimers.push(tid);
                    return;
                }

                const stage = stages[currentIdx];
                const stageTitle = simTitle;
                const isPausedMidStage = isResume
                    && this.geoSimSession.phase === 'building'
                    && this.currentCase.envelopeAxesCount === stage.axes
                    && !this.currentCase.envelopeConstructionComplete
                    && this.currentCase.envelopeConstructionProgress > 0;

                if (isPausedMidStage) {
                    startBuildingWatch(stage, stageTitle);
                    return;
                }

                if (
                    isResume
                    && this.geoSimSession.phase === 'transition'
                    && this.currentCase.envelopeConstructionComplete
                    && this.currentCase.envelopeAxesCount === stage.axes
                ) {
                    const tidResume = setTimeout(() => {
                        currentIdx += 1;
                        this.geoSimSession.currentIdx = currentIdx;
                        runStage();
                    }, 0);
                    this.simTimers.push(tidResume);
                    return;
                }

                this.geoSimSession.phase = 'intro';
                this.geoSimSession.currentIdx = currentIdx;

                this.currentCase.envelopeAxesCount = stage.axes;
                if (typeof this.currentCase.syncEnvelopeItemCount === 'function') {
                    this.currentCase.syncEnvelopeItemCount();
                }
                if (typeof this.currentCase.replayConstruction === 'function') {
                    this.playGameSound('shuffle');
                    this.currentCase.replayConstruction();
                }

                this.currentCase.draw();
                this.updateControls();

                const shouldShowTitle = currentIdx === 0 && !isResume;
                this.showSimMessage(shouldShowTitle ? stageTitle : '', stage.subtitle, 1500);

                const tid1 = setTimeout(() => {
                    if (!this.isSimRunning) return;
                    startBuildingWatch(stage, stageTitle);
                }, 2000);
                this.simTimers.push(tid1);

            } catch (err) {
                this.failSimulation(err);
            }
        };

        runStage();
    },

    failSimulation(error) {
        console.error('[GeoSimulation] Run failed:', error);
        this.stopSimulation();
    }
};
