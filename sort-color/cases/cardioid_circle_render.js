const CardioidCircleRender = {
    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.48;
        const n = Math.max(0, Math.floor(this.pointCount));
        const forceIntegerM = this.learningMode === 'gcd' || this.learningMode === 'integer-snap' || this.learningMode === 'mapping';
        const m = (this.integersOnly || forceIntegerM) ? Math.round(this.multiplier) : this.multiplier;
        const hudM = this.learningMode === 'n-ramp' ? this.learnFixedM : m;
        const viewState = this.getViewState(w, h, cx, cy, radius, n, m, hudM);

        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(235, 240, 255, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        this.drawChords(ctx, viewState);

        if (this.showPoints) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            for (let i = 0; i < n; i++) {
                const p = this.circlePoint(i, n, radius, cx, cy);
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.pointRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        this.drawHud(ctx, viewState);
        this.drawSortOverlay(ctx, viewState);
        this.drawShuffleOverlay(ctx, viewState);
        this.drawLearningModeOverlay(ctx, viewState);
    },

    getViewState(w, h, cx, cy, radius, n, m, hudM) {
        const mInt = Math.round(m);
        const gcdValue = (this.learningMode === 'gcd' && n > 0) ? this.gcd(n, this.positiveMod(mInt, n)) : 1;
        const chords = this.buildChordData(n, m, radius, cx, cy);
        const sortingActive = this.isSortingEnabled() && n > 0;
        const sortPlan = sortingActive ? this.ensureSortPlan(chords, n, m) : null;
        const sortView = sortingActive ? this.getSortViewState(sortPlan) : null;
        return { w, h, cx, cy, radius, n, m, hudM, gcdValue, chords, sortingActive, sortPlan, sortView };
    },

    drawChords(ctx, viewState) {
        const { n, m, radius, cx, cy, gcdValue, chords, sortingActive, sortView } = viewState;

        ctx.lineWidth = this.lineWidth;
        ctx.save();
        ctx.globalCompositeOperation = this.renderMode === 'light' ? 'source-over' : 'lighter';

        if (this.learningMode === 'gcd' && gcdValue > 1) {
            for (let i = 0; i < n; i++) {
                const chord = chords[i];
                const hue = ((i % gcdValue) / gcdValue) * 360;
                ctx.strokeStyle = `hsla(${hue}, 95%, 62%, ${Math.max(this.lineAlpha, 0.22)})`;
                ctx.beginPath();
                ctx.moveTo(chord.from.x, chord.from.y);
                ctx.lineTo(chord.to.x, chord.to.y);
                ctx.stroke();
            }
        } else if (sortingActive && sortView) {
            const shuffledBaseAlpha = 0.14 + this.shuffleFlash * 0.26;
            const lockedN = this.sortLockedState?.n || n;
            const lockedM = this.sortLockedState?.m ?? m;
            for (let k = 0; k < sortView.drawEntries.length; k++) {
                const chord = sortView.drawEntries[k];
                const geoFrom = this.circlePoint(k, lockedN, radius, cx, cy);
                const geoTo = this.circlePointByIndex((lockedM * k) % lockedN, lockedN, radius, cx, cy);

                const muted = this.lineVisual(chord.originalIndex, lockedN, geoFrom, geoTo, radius, shuffledBaseAlpha);
                ctx.strokeStyle = muted.color;
                ctx.beginPath();
                ctx.moveTo(geoFrom.x, geoFrom.y);
                ctx.lineTo(geoTo.x, geoTo.y);
                ctx.stroke();

                if (sortView.sortedSuffixCount > 0 && k >= lockedN - sortView.sortedSuffixCount) {
                    const active = this.lineVisual(chord.originalIndex, lockedN, geoFrom, geoTo, radius);
                    ctx.strokeStyle = active.color;
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();
                } else if (k < sortView.coloredCount) {
                    const active = this.lineVisual(chord.originalIndex, lockedN, geoFrom, geoTo, radius);
                    ctx.strokeStyle = active.color;
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();
                }

                if (!sortView.completed && k === sortView.coloredCount && !sortView.activeIndices) {
                    ctx.lineWidth = Math.max(this.lineWidth + 1.5, 3);
                    ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)';
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();
                    ctx.lineWidth = this.lineWidth;
                }

                if (sortView.activeIndices && sortView.activeIndices.includes(k)) {
                    const active = this.lineVisual(chord.originalIndex, lockedN, geoFrom, geoTo, radius);
                    ctx.lineWidth = Math.max(this.lineWidth + 2, 4);
                    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();

                    ctx.strokeStyle = active.color;
                    ctx.globalAlpha = 0.45;
                    ctx.lineWidth = Math.max(this.lineWidth + 4, 6);
                    ctx.beginPath();
                    ctx.moveTo(geoFrom.x, geoFrom.y);
                    ctx.lineTo(geoTo.x, geoTo.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = this.lineWidth;
                }
            }
        } else {
            for (const chord of chords) {
                ctx.strokeStyle = chord.color;
                ctx.beginPath();
                ctx.moveTo(chord.from.x, chord.from.y);
                ctx.lineTo(chord.to.x, chord.to.y);
                ctx.stroke();
            }
        }

        ctx.restore();
    },

    drawHud(ctx, viewState) {
        if (!this.showHud) return;

        const { n, hudM, sortingActive, sortView, sortPlan } = viewState;
        const formatSortSeconds = (seconds) => `${Math.max(0, seconds).toFixed(1)}s`;
        const hudSpeed = this.learningMode === 'm-ramp' ? this.mRampEffectiveRate : this.multiplierSpeed;
        const simElapsedLabel = (typeof Core !== 'undefined' && Core.isSimRunning && typeof Core.getSimulationElapsedMs === 'function')
            ? Core.formatRecordingTimeMMSS(Core.getSimulationElapsedMs())
            : null;

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';

        let sortTimeLabel = '0.0s / 0.0s';
        let passTimeLabel = null;
        if (this.isSortModeAvailable() && this.sortSpeed > 0) {
            const totalSteps = sortPlan?.totalSteps || this.getSortTotalSteps();
            const elapsedSeconds = this.sortProgress / this.sortSpeed;
            const totalSeconds = totalSteps / this.sortSpeed;
            sortTimeLabel = `${formatSortSeconds(elapsedSeconds)} / ${formatSortSeconds(totalSeconds)}`;

            if (sortView && sortView.totalInPass > 0) {
                const passElapsedSeconds = sortView.stepInPass / this.sortSpeed;
                const passTotalSeconds = sortView.totalInPass / this.sortSpeed;
                passTimeLabel = `${formatSortSeconds(passElapsedSeconds)} / ${formatSortSeconds(passTotalSeconds)}`;
            }
        }

        let nextY = 30;
        ctx.fillText(`Sort Time: ${sortTimeLabel}`, 24, nextY);
        nextY += 22;
        if (sortingActive && sortView) {
            let sortLabel = 'Radix';
            if (this.sortMode === 'lsh') sortLabel = 'L-S-H Radix';
            if (this.sortMode === 'hue') sortLabel = 'Hue Radix';
            if (this.sortMode === 'bubble') sortLabel = 'Bubble Sort';
            const digitLabel = sortView.passLabel || sortPlan?.passes?.[sortView.passIndex]?.label || `Pass ${sortView.passNumber}`;
            ctx.fillText(`Sort: ${sortLabel}`, 24, nextY);
            nextY += 22;
            ctx.fillText(`Pass: ${digitLabel}`, 24, nextY);
            nextY += 22;
            if (sortView.activeDigit != null) {
                ctx.fillText(`Bucket: ${sortView.activeDigit}`, 24, nextY);
                nextY += 22;
            } else if (sortView.activeIndices) {
                ctx.fillText(`Pair: ${sortView.activeIndices[0]} ↔ ${sortView.activeIndices[1]}`, 24, nextY);
                nextY += 22;
                ctx.fillText(`Sorted: ${sortView.sortedSuffixCount} / ${n}`, 24, nextY);
                nextY += 22;
            }
        } else if (this.isSortModeAvailable()) {
            let sortLabel = 'Radix';
            if (this.sortMode === 'lsh') sortLabel = 'L-S-H Radix';
            if (this.sortMode === 'hue') sortLabel = 'Hue Radix';
            if (this.sortMode === 'bubble') sortLabel = 'Bubble Sort';
            ctx.fillText(`Sort: ${sortLabel}`, 24, nextY);
            nextY += 22;
            ctx.fillText(`Step: ${Math.floor(this.sortProgress)}`, 24, nextY);
            nextY += 22;
            ctx.fillText(`State: ${this.sortingStatus}`, 24, nextY);
            nextY += 22;
        }

        if (simElapsedLabel) {
            ctx.fillText(`Sim Time: ${simElapsedLabel}`, 24, nextY);
        }

        ctx.save();
        ctx.textAlign = 'right';
        ctx.fillText(`Node: ${n}`, viewState.w - 24, 30);
        ctx.fillText(`Mul: ${hudM.toFixed(3)}`, viewState.w - 24, 52);
        ctx.fillText(`dM/dt: ${hudSpeed.toFixed(3)}`, viewState.w - 24, 74);
        ctx.fillText(`Mode: ${this.learningMode === 'off' ? 'standard' : this.learningMode}`, viewState.w - 24, 96);
        ctx.restore();
    },

    drawShuffleOverlay(ctx, viewState) {
        if (this.shuffleFlash <= 0) return;
        ctx.save();
        ctx.fillStyle = `rgba(255, 209, 102, ${0.12 * this.shuffleFlash})`;
        ctx.fillRect(0, 0, viewState.w, viewState.h);
        ctx.fillStyle = `rgba(255, 240, 201, ${0.95 * this.shuffleFlash})`;
        ctx.font = '700 20px IBM Plex Sans, sans-serif';
        ctx.fillText('Shuffle', 24, viewState.h - 24);
        ctx.restore();
    },

    drawLearningModeOverlay(ctx, viewState) {
        this.drawMappingOverlay(ctx, viewState);
        this.drawRampOverlay(ctx, viewState);
        this.drawTimedModeOverlay(ctx, viewState);
    },

    drawMappingOverlay(ctx, viewState) {
        const { n, m, radius, cx, cy, h } = viewState;
        if (this.learningMode !== 'mapping' || n <= 0) return;

        const i = this.positiveMod(Math.floor(this.demoIndex), n);
        const raw = m * i;
        const j = this.positiveMod(raw, n);
        const from = this.circlePoint(i, n, radius, cx, cy);
        const to = this.circlePointByIndex(j, n, radius, cx, cy);

        ctx.lineWidth = Math.max(2.8, this.lineWidth + 1.5);
        ctx.strokeStyle = 'rgba(255, 216, 102, 0.95)';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        ctx.fillStyle = '#ffd166';
        ctx.beginPath();
        ctx.arc(from.x, from.y, Math.max(4, this.pointRadius + 2.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#06d6a0';
        ctx.beginPath();
        ctx.arc(to.x, to.y, Math.max(4, this.pointRadius + 2.5), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.font = '600 16px Inter, system-ui, sans-serif';
        ctx.fillText(`i=${i} -> M*i=${Math.round(raw)} -> mod N=${j}`, 24, h - 28);
    },

    drawRampOverlay(ctx, viewState) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';

        if (this.learningMode === 'n-ramp') {
            const speed = this.learnN < this.nRampSwitchN ? this.nRampSlowRate : this.nRampFastRate;
            ctx.fillText(`N Ramp | speed=${speed.toFixed(1)}/s`, 24, viewState.h - 28);
        }

        if (this.learningMode === 'm-ramp') {
            ctx.fillText(`M Ramp | dM/dt=${this.mRampEffectiveRate.toFixed(3)}`, 24, viewState.h - 28);
        }

        if (this.learningMode === 'gcd' && viewState.n > 0) {
            const loopCount = this.gcd(viewState.n, this.positiveMod(Math.round(viewState.m), viewState.n));
            ctx.fillText(`GCD Mode | loop groups = ${loopCount}`, 24, viewState.h - 28);
        }

        if (this.learningMode === 'integer-snap') {
            ctx.fillText(`Integer Snap | speed = ${this.snapRate.toFixed(2)}`, 24, viewState.h - 28);
        }
    },

    drawTimedModeOverlay(ctx, viewState) {
        if (this.learningMode === 'classic') {
            const targetM = this.classicTargets[this.classicIndex];
            const patternName = targetM === 2 ? 'Cardioid' : (targetM === 3 ? 'Nephroid' : `${targetM - 1} Petals`);
            this.drawPatternOverlay(ctx, viewState, {
                label: `Classic Mode | Next in ${Math.max(0, this.classicDuration - this.classicTimer).toFixed(1)}s`,
                patternName
            });
        }

        if (this.learningMode === 'ultimate') {
            const targetM = this.ultimateTargets[this.ultimateIndex];
            const names = {
                2: 'Cardioid', 2.1: 'Warped Heart', 1.618: 'Golden Ratio', 2.5: 'Split Cardioid',
                3: 'Nephroid', 3.14159: 'Pi Spiral', 3.5: 'Split Nephroid', 4: 'Clover',
                5: 'Flower', 8: 'Infinity Petals', 13: 'Fibonacci Bloom',
                21: 'Fibonacci Spiral', 34: 'Golden Spiral', 55: 'Star Dust',
                67: 'Sun Star', 89: 'Natural Harmony', 99: 'Cosmic Web',
                181: 'Global Grid (Mirror)', 181.5: 'Warped Grid (Chaos)',
                359: 'The Singularity (Focus)', 359.7: 'Stardust Fountain'
            };
            this.drawPatternOverlay(ctx, viewState, {
                label: `Ultimate Mode | Next in ${Math.max(0, this.ultimateDuration - this.ultimateTimer).toFixed(1)}s`,
                patternName: names[targetM] || 'Complex Pattern'
            });
        }

        if (this.learningMode === 'mirror-chaos') {
            const targetM = this.mirrorTargets[this.mirrorIndex];
            const names = {
                2.5: 'Split Cardioid', 3.5: 'Split Nephroid', 4.5: 'Split Clover',
                6.66: 'Order in Chaos', 13.13: 'Abstract Rhythm',
                181: 'Global Grid (Mirror)', 181.5: 'Warped Grid (Chaos)',
                359: 'The Singularity (Focus)', 359.7: 'Stardust Fountain'
            };
            this.drawPatternOverlay(ctx, viewState, {
                label: `Mirror & Chaos | Next in ${Math.max(0, this.mirrorDuration - this.mirrorTimer).toFixed(1)}s`,
                patternName: names[targetM] || 'Complex Pattern'
            });
        }
    },

    drawPatternOverlay(ctx, viewState, config) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = '600 14px Inter, system-ui, sans-serif';
        ctx.fillText(config.label, 24, viewState.h - 28);

        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = '700 32px Inter, system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(config.patternName, viewState.w - 32, 52);
        ctx.restore();
    }
};
