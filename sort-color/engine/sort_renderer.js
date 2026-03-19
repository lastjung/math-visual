const SortRenderer = {
    traceGeometryPath(ctx, geometry) {
        if (!geometry) return false;
        if (geometry.hidden) return false;
        if (geometry.kind === 'polygon' && Array.isArray(geometry.points) && geometry.points.length >= 3) {
            ctx.beginPath();
            ctx.moveTo(geometry.points[0].x, geometry.points[0].y);
            for (let i = 1; i < geometry.points.length; i++) {
                ctx.lineTo(geometry.points[i].x, geometry.points[i].y);
            }
            ctx.closePath();
            return true;
        }
        if (geometry.kind === 'line' && geometry.from && geometry.to) {
            ctx.beginPath();
            ctx.moveTo(geometry.from.x, geometry.from.y);
            ctx.lineTo(geometry.to.x, geometry.to.y);
            return true;
        }
        return false;
    },

    getGeometryStrokeColor(chord, geometry, radius, n) {
        if (geometry?.kind === 'polygon') return chord.color;
        // Check for generic line visual method instead of hardcoded Cardioid name
        if (typeof this.getGeometryLineVisual === 'function') {
            return this.getGeometryLineVisual(chord.originalIndex, n, geometry.from, geometry.to, radius).color;
        }
        // Legacy fallback
        if (typeof this.getCardioidLineVisual === 'function') {
            return this.getCardioidLineVisual(chord.originalIndex, n, geometry.from, geometry.to, radius).color;
        }
        return chord.color || 'white';
    },

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
            for (let i = 0; i < viewState.provider.points.length; i++) {
                const p = viewState.provider.points[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.pointRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (typeof this.drawGeometryOverlay === 'function') {
            this.drawGeometryOverlay(ctx, viewState);
        }

        this.drawHud(ctx, viewState);
        this.drawSortOverlay(ctx, viewState);
        this.drawShuffleOverlay(ctx, viewState);
        this.drawLearningModeOverlay(ctx, viewState);
    },

    getViewState(w, h, cx, cy, radius, n, m, hudM) {
        const mInt = Math.round(m);
        const gcdValue = (this.learningMode === 'gcd' && n > 0) ? this.gcd(n, this.positiveMod(mInt, n)) : 1;
        const provider = this.buildGeometryProvider(n, m, radius, cx, cy);
        const chords = provider.items;
        const sortingActive = this.isSortingEnabled() && n > 0;
        const sortPlan = sortingActive ? this.ensureSortPlan(provider) : null;
        const sortView = sortingActive ? this.getSortViewState(sortPlan) : null;
        return { w, h, cx, cy, radius, n, m, hudM, gcdValue, provider, chords, sortingActive, sortPlan, sortView };
    },

    drawChords(ctx, viewState) {
        const { n, radius, gcdValue, chords, provider, sortingActive, sortView } = viewState;
        const drawOrder = Array.isArray(provider?.drawOrder) && provider.drawOrder.length
            ? provider.drawOrder
            : Array.from({ length: chords.length }, (_, index) => index);

        ctx.lineWidth = this.lineWidth;
        ctx.save();
        ctx.globalCompositeOperation = this.renderMode === 'light' ? 'source-over' : 'lighter';

        if (this.learningMode === 'gcd' && gcdValue > 1) {
            for (let i = 0; i < n; i++) {
                const chord = chords[i];
                const hue = ((i % gcdValue) / gcdValue) * 360;
                const getPt = typeof this.getGeometryAnchorPoint === 'function' 
                    ? this.getGeometryAnchorPoint.bind(this)
                    : (this.getCardioidPoint ? this.getCardioidPoint.bind(this) : null);
                
                if (getPt && chord.slotGeometry && !chord.slotGeometry.from) {
                    // This is for cases where we need to dynamically calculate points if they're missing
                }

                ctx.strokeStyle = `hsla(${hue}, 95%, 62%, ${Math.max(this.lineAlpha, 0.22)})`;
                ctx.beginPath();
                if (chord.slotGeometry && chord.slotGeometry.from) {
                    ctx.moveTo(chord.slotGeometry.from.x, chord.slotGeometry.from.y);
                    ctx.lineTo(chord.slotGeometry.to.x, chord.slotGeometry.to.y);
                } else if (typeof this.traceGeometryPath === 'function') {
                    this.traceGeometryPath(ctx, chord.slotGeometry);
                }
                ctx.stroke();
            }
        } else if (sortingActive && sortView) {
            const lockedN = this.sortLockedState?.n || n;
            for (const slotIndex of drawOrder) {
                const chord = sortView.drawEntries[slotIndex];
                const slotGeometry = provider.slots[slotIndex]?.geometry;
                if (!slotGeometry) continue;
                const activeColor = this.getGeometryStrokeColor(chord, slotGeometry, radius, lockedN);

                if (slotGeometry.kind === 'polygon') {
                    ctx.fillStyle = activeColor;
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.fill();
                }

                ctx.strokeStyle = activeColor;
                if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();

                if (sortView.sortedSuffixCount > 0 && slotIndex >= lockedN - sortView.sortedSuffixCount) {
                    ctx.strokeStyle = activeColor;
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();
                } else if (slotIndex < sortView.coloredCount) {
                    ctx.strokeStyle = activeColor;
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();
                }

                if (!sortView.completed && slotIndex === sortView.coloredCount && !sortView.activeIndices) {
                    ctx.lineWidth = Math.max(this.lineWidth + 1.5, 3);
                    ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)';
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();
                    ctx.lineWidth = this.lineWidth;
                }

                if (sortView.activeIndices && sortView.activeIndices.includes(slotIndex)) {
                    ctx.lineWidth = Math.max(this.lineWidth + 2, 4);
                    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();

                    ctx.strokeStyle = activeColor;
                    ctx.globalAlpha = 0.45;
                    ctx.lineWidth = Math.max(this.lineWidth + 4, 6);
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = this.lineWidth;
                }

                if (sortView.pivotIndex === slotIndex) {
                    ctx.lineWidth = Math.max(this.lineWidth + 1.5, 3);
                    ctx.strokeStyle = 'rgba(255, 209, 102, 0.95)';
                    if (this.traceGeometryPath(ctx, slotGeometry)) ctx.stroke();
                    ctx.lineWidth = this.lineWidth;
                }
            }
        } else {
            for (const slotIndex of drawOrder) {
                const chord = chords[slotIndex];
                const geometry = chord?.slotGeometry || provider.slots[slotIndex]?.geometry;
                if (!geometry) continue;
                if (geometry.kind === 'polygon') {
                    ctx.fillStyle = chord.color;
                    if (this.traceGeometryPath(ctx, geometry)) ctx.fill();
                }
                ctx.strokeStyle = chord.color;
                if (this.traceGeometryPath(ctx, geometry)) ctx.stroke();
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
            const totalSteps = sortPlan?.totalSteps || this.getSortTotalSteps(viewState.provider);
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
            if (this.sortMode === 'quick') sortLabel = 'Quick Sort';
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
                if (typeof sortView.sortedSuffixCount === 'number') {
                    ctx.fillText(`Sorted: ${sortView.sortedSuffixCount} / ${n}`, 24, nextY);
                    nextY += 22;
                } else if (sortView.pivotIndex != null) {
                    ctx.fillText(`Pivot: ${sortView.pivotIndex}`, 24, nextY);
                    nextY += 22;
                }
            }
        } else if (this.isSortModeAvailable()) {
            let sortLabel = 'Radix';
            if (this.sortMode === 'lsh') sortLabel = 'L-S-H Radix';
            if (this.sortMode === 'hue') sortLabel = 'Hue Radix';
            if (this.sortMode === 'bubble') sortLabel = 'Bubble Sort';
            if (this.sortMode === 'quick') sortLabel = 'Quick Sort';
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
        const getPt = typeof this.getGeometryAnchorPoint === 'function' 
            ? this.getGeometryAnchorPoint 
            : this.getCardioidPoint;
        const getPtIdx = typeof this.getGeometryAnchorPointByIndex === 'function'
            ? this.getGeometryAnchorPointByIndex
            : this.getCardioidPointByIndex;

        if (typeof getPt !== 'function' || typeof getPtIdx !== 'function') return;

        const from = getPt.call(this, i, n, radius, cx, cy);
        const to = getPtIdx.call(this, j, n, radius, cx, cy);

        if (!from || !to) return;

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

const CardioidCircleRender = SortRenderer;
