const EnvelopeRadialGeometryProvider = {
    interpolateEnvelopeRadialGeometry(fromGeometry, toGeometry, t) {
        if (!fromGeometry || !toGeometry) return toGeometry || fromGeometry || null;
        if (fromGeometry.kind === 'cubic' && toGeometry.kind === 'cubic') {
            return {
                kind: 'cubic',
                hidden: !!toGeometry.hidden,
                from: {
                    x: fromGeometry.from.x + (toGeometry.from.x - fromGeometry.from.x) * t,
                    y: fromGeometry.from.y + (toGeometry.from.y - fromGeometry.from.y) * t
                },
                control1: {
                    x: fromGeometry.control1.x + (toGeometry.control1.x - fromGeometry.control1.x) * t,
                    y: fromGeometry.control1.y + (toGeometry.control1.y - fromGeometry.control1.y) * t
                },
                control2: {
                    x: fromGeometry.control2.x + (toGeometry.control2.x - fromGeometry.control2.x) * t,
                    y: fromGeometry.control2.y + (toGeometry.control2.y - fromGeometry.control2.y) * t
                },
                to: {
                    x: fromGeometry.to.x + (toGeometry.to.x - fromGeometry.to.x) * t,
                    y: fromGeometry.to.y + (toGeometry.to.y - fromGeometry.to.y) * t
                }
            };
        }
        if (fromGeometry.kind === 'quadratic' && toGeometry.kind === 'quadratic') {
            return {
                kind: 'quadratic',
                hidden: !!toGeometry.hidden,
                from: {
                    x: fromGeometry.from.x + (toGeometry.from.x - fromGeometry.from.x) * t,
                    y: fromGeometry.from.y + (toGeometry.from.y - fromGeometry.from.y) * t
                },
                control: {
                    x: fromGeometry.control.x + (toGeometry.control.x - fromGeometry.control.x) * t,
                    y: fromGeometry.control.y + (toGeometry.control.y - fromGeometry.control.y) * t
                },
                to: {
                    x: fromGeometry.to.x + (toGeometry.to.x - fromGeometry.to.x) * t,
                    y: fromGeometry.to.y + (toGeometry.to.y - fromGeometry.to.y) * t
                }
            };
        }
        return {
            kind: 'line',
            hidden: !!toGeometry.hidden,
            from: {
                x: fromGeometry.from.x + (toGeometry.from.x - fromGeometry.from.x) * t,
                y: fromGeometry.from.y + (toGeometry.from.y - fromGeometry.from.y) * t
            },
            to: {
                x: fromGeometry.to.x + (toGeometry.to.x - fromGeometry.to.x) * t,
                y: fromGeometry.to.y + (toGeometry.to.y - fromGeometry.to.y) * t
            }
        };
    },

    getEnvelopeAxesCount() {
        return Math.max(3, Math.floor(Number(this.envelopeAxesCount) || 4));
    },

    getEnvelopeLinesPerSector() {
        return Math.max(4, Math.floor(Number(this.envelopeLinesPerSector) || 32));
    },

    getEnvelopeLayerCount() {
        return Math.max(1, Math.floor(Number(this.envelopeLayerCount) || 1));
    },

    getEnvelopeBaseItemCount() {
        return this.getEnvelopeAxesCount() * this.getEnvelopeLinesPerSector() * this.getEnvelopeLayerCount();
    },

    getEnvelopeActiveAxes() {
        if (this.currentPreset === 'orbit_net') return [];
        const axesCount = this.getEnvelopeAxesCount();
        const linesPerSector = this.getEnvelopeLinesPerSector();
        const baseCount = this.getEnvelopeBaseItemCount();
        if (baseCount <= 0) return [];

        const activeSet = new Set();
        // Sample one item per sector group to ensure all used axes are identified
        for (let s = 0; s < axesCount; s++) {
            const geom = this.getEnvelopeRadialLineGeometry(s * linesPerSector, 100, 0, 0, true);
            if (geom) {
                if (geom.fromAxis !== undefined) activeSet.add(geom.fromAxis);
                if (geom.toAxis !== undefined) activeSet.add(geom.toAxis);
            }
        }
        return Array.from(activeSet).sort((a, b) => a - b);
    },

    getEnvelopeItemCount() {
        return this.getEnvelopeBaseItemCount() + this.getEnvelopeActiveAxes().length;
    },

    syncEnvelopeItemCount() {
        this.pointCount = this.getEnvelopeItemCount();
        return this.pointCount;
    },

    getEnvelopeVisibleCount() {
        if (this.isSortingEnabled && this.isSortingEnabled()) {
            return this.getEnvelopeItemCount();
        }
        if (this.envelopeConstructionComplete) {
            return this.getEnvelopeItemCount();
        }
        return Math.max(0, Math.min(this.getEnvelopeItemCount(), Math.floor(this.envelopeConstructionProgress || 0)));
    },

    getEnvelopeRadialAnchor(axisIndex, ratio, radius, cx, cy) {
        const axesCount = this.getEnvelopeAxesCount();
        
        // Conditional start angle:
        // Odd axes (5, 7, 9...) -> Start at 12 o'clock (-Math.PI / 2) to be upright.
        // Even axes (4, 6, 8...) -> Start at 9 o'clock (Math.PI) for a balanced left-to-right start.
        const startAngle = (axesCount % 2 !== 0) ? -Math.PI / 2 : Math.PI;
        const angle = (axisIndex / axesCount) * Math.PI * 2 + startAngle;
        
        const dx = radius * ratio * Math.cos(angle);
        const dy = radius * ratio * Math.sin(angle);
        
        return { 
            x: cx + dx, 
            y: cy + dy, 
            angle: angle,
            distance: radius * ratio
        };
    },

    getEnvelopeArcControlPoint(fromAxis, toAxis, ratio, layerIndex, radius, cx, cy) {
        const axesCount = this.getEnvelopeAxesCount();
        const fromAnchor = this.getEnvelopeRadialAnchor(fromAxis, 1, radius, cx, cy);
        const toAnchor = this.getEnvelopeRadialAnchor(toAxis, 1, radius, cx, cy);
        const fromAngle = fromAnchor.angle;
        let toAngle = toAnchor.angle;
        while (toAngle - fromAngle > Math.PI) toAngle -= Math.PI * 2;
        while (toAngle - fromAngle < -Math.PI) toAngle += Math.PI * 2;

        const midAngle = fromAngle + (toAngle - fromAngle) / 2;
        const layerBias = Math.min(0.22, layerIndex * 0.08);
        const ratioBias = 0.14 * (1 - Math.abs(0.5 - ratio) * 2);
        const parityBias = ((fromAxis + layerIndex) % 2 === 0) ? 0.1 : -0.08;
        const controlRatio = Math.max(0.18, Math.min(0.94, 0.52 + layerBias + ratioBias + parityBias));

        return this.getEnvelopeRadialAnchor(
            ((midAngle - ((axesCount % 2 !== 0) ? -Math.PI / 2 : Math.PI)) / (Math.PI * 2)) * axesCount,
            controlRatio,
            radius,
            cx,
            cy
        );
    },

    getEnvelopeOrbitGeometry(sectorIndex, lineIndex, layerIndex, radius, cx, cy) {
        const axesCount = this.getEnvelopeAxesCount();
        const linesPerSector = this.getEnvelopeLinesPerSector();
        const skip = Math.max(1, Math.min(axesCount - 1, layerIndex + 1));
        const isEvenAxisCount = axesCount % 2 === 0;
        const subgroupStride = isEvenAxisCount ? 2 : 1;
        const visibleCount = this.getEnvelopeVisibleCount();
        const halfBuildCount = Math.floor(this.getEnvelopeBaseItemCount() / 2);
        const showOddOrbitSet = !isEvenAxisCount || this.envelopeConstructionComplete || visibleCount > halfBuildCount;
        if (isEvenAxisCount && (sectorIndex % 2 !== 0) && !showOddOrbitSet) {
            return {
                kind: 'line',
                hidden: true,
                from: { x: cx, y: cy },
                to: { x: cx, y: cy },
                fromAxis: sectorIndex,
                toAxis: sectorIndex,
                sectorIndex,
                lineIndex,
                layerIndex,
                ratio: 0
            };
        }
        const toAxis = (sectorIndex + subgroupStride * skip) % axesCount;
        const progress = (lineIndex + 1) / (linesPerSector + 1);
        const orbitRatio = Math.max(0.16, Math.min(0.94, 0.2 + progress * 0.68));
        const from = this.getEnvelopeRadialAnchor(sectorIndex, orbitRatio, radius, cx, cy);
        const to = this.getEnvelopeRadialAnchor(toAxis, orbitRatio, radius, cx, cy);
        const outerGuide = this.getEnvelopeArcControlPoint(sectorIndex, toAxis, Math.min(0.98, orbitRatio + 0.18), layerIndex, radius, cx, cy);
        const innerGuide = this.getEnvelopeArcControlPoint(sectorIndex, toAxis, Math.max(0.1, orbitRatio - 0.12), layerIndex, radius, cx, cy);
        const tangentScale = radius * (0.036 + layerIndex * 0.012);

        const control1 = {
            x: from.x + Math.cos(from.angle + Math.PI / 2) * tangentScale + (outerGuide.x - from.x) * 0.34,
            y: from.y + Math.sin(from.angle + Math.PI / 2) * tangentScale + (outerGuide.y - from.y) * 0.34
        };
        const control2 = {
            x: to.x + Math.cos(to.angle - Math.PI / 2) * tangentScale + (outerGuide.x - to.x) * 0.34,
            y: to.y + Math.sin(to.angle - Math.PI / 2) * tangentScale + (outerGuide.y - to.y) * 0.34
        };

        return {
            kind: 'cubic',
            from,
            control1,
            control2,
            to,
            fromAxis: sectorIndex,
            toAxis,
            sectorIndex,
            lineIndex,
            layerIndex,
            ratio: orbitRatio,
            colorRatio: (
                (isEvenAxisCount ? (sectorIndex % 2) * (axesCount / 2) : 0)
                + Math.floor(sectorIndex / subgroupStride)
                + layerIndex * 0.22
                + progress * 0.5
            ) / Math.max(1, axesCount)
        };
    },

    getEnvelopeRadialLineGeometry(itemIndex, radius, cx, cy, isAnalysis = false) {
        const axesCount = this.getEnvelopeAxesCount();
        const linesPerSector = this.getEnvelopeLinesPerSector();
        const itemsPerLayer = axesCount * linesPerSector;
        const baseCount = this.getEnvelopeBaseItemCount();

        // Check if this is an axis line (last activeAxes length items) - check first
        if (!isAnalysis && itemIndex >= baseCount) {
            const activeAxes = this.getEnvelopeActiveAxes();
            const axisIndex = activeAxes[itemIndex - baseCount];
            if (axisIndex === undefined) return null;
            
            return {
                kind: 'line',
                from: { x: cx, y: cy },
                to: this.getEnvelopeRadialAnchor(axisIndex, 1.0, radius, cx, cy),
                sectorIndex: axisIndex,
                lineIndex: -1,
                layerIndex: -1,
                ratio: 1.0
            };
        }
        
        // Chain Preset Logic
        if (this.currentPreset === 'chain') {
            const skips = [1, 2, 1, 2];
            const setIndex = Math.floor(itemIndex / 4);
            const stepIndex = itemIndex % 4;
            
            // Total skip before this step in the global sequence
            const baseSkip = setIndex * 6; // sum [1,2,1,2] = 6
            let currentOffset = 0;
            for (let i = 0; i < stepIndex; i++) currentOffset += skips[i];
            
            const fromAxis = (baseSkip + currentOffset) % axesCount;
            const toAxis = (baseSkip + currentOffset + skips[stepIndex]) % axesCount;
            
            // For ratio, use a global one that depends on setIndex
            // baseCount / 4 is the number of sets
            const totalSets = Math.floor(baseCount / 4);
            const ratio = (setIndex + 0.5) / (totalSets + 1);
            
            // Alternate ratio to "cross" the circle
            // Step 0 & 2: Outside to Inside
            // Step 1 & 3: Inside to Outside
            const rStart = (stepIndex % 2 === 0) ? (1 - ratio) : ratio;
            const rEnd = (stepIndex % 2 === 0) ? ratio : (1 - ratio);
            
            const from = this.getEnvelopeRadialAnchor(fromAxis, rStart, radius, cx, cy);
            const to = this.getEnvelopeRadialAnchor(toAxis, rEnd, radius, cx, cy);
            
            return {
                kind: 'line',
                from,
                to,
                fromAxis, // For analysis
                toAxis,   // For analysis
                sectorIndex: fromAxis,
                lineIndex: setIndex,
                layerIndex: 0,
                ratio
            };
        }

        const layerIndex = Math.floor(itemIndex / itemsPerLayer);
        const subIndex = itemIndex % itemsPerLayer;
        
        let sectorIndex, lineIndex;
        if (this.envelopeBuildOrder === 'chained') {
            // Symmetry (Interleaved) build mapping:
            sectorIndex = subIndex % axesCount;
            lineIndex = Math.floor(subIndex / axesCount);
        } else {
            // Sequence (Sequential Sector-wise) build mapping:
            sectorIndex = Math.floor(subIndex / linesPerSector);
            lineIndex = subIndex % linesPerSector;
        }

        const ratio = (lineIndex + 1) / (linesPerSector + 1);

        // Polygon Preset Logic (Layer-based Alternating Sides)
        if (this.currentPreset === 'polygon') {
            // Use lineIndex directly since each layer focuses on one side
            const subRatio = lineIndex / (linesPerSector - 1);
            const polygonSectorIndex = (layerIndex % 2 === 0)
                ? sectorIndex
                : ((axesCount - sectorIndex) % axesCount);
            const nextSectorIndex = (polygonSectorIndex + 1) % axesCount;
            const vBase = this.getEnvelopeRadialAnchor(polygonSectorIndex, 1.0, radius, cx, cy);
            const vNext = this.getEnvelopeRadialAnchor(nextSectorIndex, 1.0, radius, cx, cy);
            
            let from, to;
            // Alternates direction based on layer: Layer 1, 3... (Odd layers index 0, 2, 4...) vs Layer 2, 4... (Even layers index 1, 3, 5...)
            if (layerIndex % 2 === 0) {
                // Direction A: Center -> V_i connects to V_i -> V_i+1
                from = this.getEnvelopeRadialAnchor(polygonSectorIndex, subRatio, radius, cx, cy);
                to = {
                    x: vBase.x + subRatio * (vNext.x - vBase.x),
                    y: vBase.y + subRatio * (vNext.y - vBase.y)
                };
            } else {
                // Direction B: Center -> V_i+1 connects to V_i+1 -> V_i
                from = this.getEnvelopeRadialAnchor(nextSectorIndex, subRatio, radius, cx, cy);
                to = {
                    x: vNext.x + subRatio * (vBase.x - vNext.x),
                    y: vNext.y + subRatio * (vBase.y - vNext.y)
                };
            }
            
            return {
                kind: 'line',
                from,
                to,
                fromAxis: (layerIndex % 2 === 0) ? polygonSectorIndex : nextSectorIndex,
                toAxis: (layerIndex % 2 === 0) ? nextSectorIndex : polygonSectorIndex,
                sectorIndex: polygonSectorIndex,
                lineIndex,
                layerIndex,
                ratio: subRatio
            };
        }

        if (this.currentPreset === 'arc_weave') {
            const skip = layerIndex + 1;
            const toAxis = (sectorIndex + skip) % axesCount;
            const from = this.getEnvelopeRadialAnchor(sectorIndex, 1 - ratio, radius, cx, cy);
            const to = this.getEnvelopeRadialAnchor(toAxis, ratio, radius, cx, cy);
            const control = this.getEnvelopeArcControlPoint(sectorIndex, toAxis, ratio, layerIndex, radius, cx, cy);

            return {
                kind: 'quadratic',
                from,
                control,
                to,
                fromAxis: sectorIndex,
                toAxis,
                sectorIndex,
                lineIndex,
                layerIndex,
                ratio
            };
        }

        if (this.currentPreset === 'orbit_net') {
            return this.getEnvelopeOrbitGeometry(sectorIndex, lineIndex, layerIndex, radius, cx, cy);
        }
        
        // Layer 0 skips 1 (adjacent), Layer 1 skips 2, etc.
        const skip = layerIndex + 1;
        
        const from = this.getEnvelopeRadialAnchor(sectorIndex, 1 - ratio, radius, cx, cy);
        const to = this.getEnvelopeRadialAnchor((sectorIndex + skip) % axesCount, ratio, radius, cx, cy);
        
        return {
            kind: 'line',
            from,
            to,
            fromAxis: sectorIndex,                  // For analysis
            toAxis: (sectorIndex + skip) % axesCount, // For analysis
            sectorIndex,
            lineIndex,
            layerIndex,
            ratio
        };
    },

    getEnvelopeRadialLineVisual(itemIndex, totalCount, from, to, radius, alphaOverride = null, geometry = null) {
        const safeTotal = Math.max(1, totalCount);
        const alpha = alphaOverride == null ? this.lineAlpha : alphaOverride;
        
        let hueRatio;
        const baseCount = this.getEnvelopeBaseItemCount();
        const axesCount = this.getEnvelopeAxesCount();

        // Even distribution logic:
        if (geometry?.kind === 'cubic') {
            hueRatio = geometry.colorRatio ?? (geometry.sectorIndex / Math.max(1, axesCount));
        } else if (itemIndex >= baseCount || !from || from.angle === undefined) {
            // Axes: spread based on axis index
            const axisIndex = Math.max(0, itemIndex - baseCount);
            hueRatio = axisIndex / Math.max(1, axesCount);
        } else {
            // Normal items: spread based on total index
            hueRatio = itemIndex / safeTotal;
        }

        // 1. Monochrome (Saturation 0)
        if (this.colorMode === 'monochrome') {
            return {
                hue: 0,
                saturation: 0,
                lightness: 90,
                alpha,
                color: `hsla(0, 0%, 90%, ${alpha})`
            };
        }

        // 2. Determine Hue (Scheme or Default Rainbow)
        let hue;
        if (this.colorMode === 'scheme' && typeof ColorSchemeManager !== 'undefined') {
            hue = ColorSchemeManager.getHue(hueRatio);
        } else {
            hue = hueRatio * 360; // Simple even spread as requested
        }

        // 3. Return consistent visual property
        return {
            hue,
            saturation: geometry?.kind === 'cubic' ? 76 : 94,
            lightness: geometry?.kind === 'cubic' ? 68 : 62,
            alpha,
            color: `hsla(${hue}, ${geometry?.kind === 'cubic' ? 76 : 94}%, ${geometry?.kind === 'cubic' ? 68 : 62}%, ${alpha})`
        };
    },

    getEnvelopeRadialLengthRange(items, radius) {
        if (!Array.isArray(items) || items.length === 0) {
            return { min: 0, max: Math.max(1, radius * 2) };
        }
        let min = Infinity;
        let max = -Infinity;
        for (let index = 0; index < items.length; index++) {
            const geometry = items[index]?.sourceGeometry;
            if (!geometry?.from || !geometry?.to) continue;
            const len = Math.hypot(geometry.to.x - geometry.from.x, geometry.to.y - geometry.from.y);
            if (len < min) min = len;
            if (len > max) max = len;
        }
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            return { min: 0, max: Math.max(1, radius * 2) };
        }
        if (Math.abs(max - min) < 1e-6) {
            return { min, max: min + 1 };
        }
        return { min, max };
    },

    applyEnvelopeRadialLengthColors(items, radius) {
        const range = this.getEnvelopeRadialLengthRange(items, radius);
        const denom = Math.max(1e-6, range.max - range.min);
        return items.map((item) => {
            const geometry = item?.sourceGeometry;
            const len = geometry?.from && geometry?.to
                ? Math.hypot(geometry.to.x - geometry.from.x, geometry.to.y - geometry.from.y)
                : range.min;
            const ratio = Math.max(0, Math.min(1, (len - range.min) / denom));
            const hue = 220 - ratio * 220;
            return {
                ...item,
                hue,
                saturation: 68,
                lightness: 74,
                color: `hsla(${hue}, 68%, 74%, ${item.alpha})`
            };
        });
    },

    buildEnvelopeRadialProvider(_n, m, radius, cx, cy) {
        this.syncEnvelopeItemCount();
        const itemCount = this.getEnvelopeItemCount();
        const safeItemCount = Math.max(0, itemCount);
        const visibleCount = this.getEnvelopeVisibleCount();
        const baseShuffle = this.ensureShuffleOrder(safeItemCount, m);
        
        // All build modes (chained/sequential) use randomized colors (baseShuffle).
        const shuffleOrder = baseShuffle;

        const points = [];
        for (let axisIndex = 0; axisIndex < this.getEnvelopeAxesCount(); axisIndex++) {
            for (let step = 1; step <= this.getEnvelopeLinesPerSector(); step++) {
                points.push(
                    this.getEnvelopeRadialAnchor(
                        axisIndex,
                        step / (this.getEnvelopeLinesPerSector() + 1),
                        radius,
                        cx,
                        cy
                    )
                );
            }
        }

        const slots = Array.from({ length: safeItemCount }, (_, slotIndex) => {
            const baseGeometry = this.getEnvelopeRadialLineGeometry(slotIndex, radius, cx, cy);
            return {
                slotIndex,
                geometry: {
                    ...baseGeometry,
                    hidden: slotIndex >= visibleCount
                }
            };
        });

        let baseItems = Array.from({ length: safeItemCount }, (_, originalIndex) => {
            const sourceGeometry = this.getEnvelopeRadialLineGeometry(originalIndex, radius, cx, cy);
            const visual = this.getEnvelopeRadialLineVisual(originalIndex, safeItemCount, sourceGeometry.from, sourceGeometry.to, radius);
            return {
                id: `envelope-radial-item-${originalIndex}`,
                originalIndex,
                slotIndex: originalIndex,
                slotGeometry: slots[originalIndex]?.geometry || sourceGeometry,
                sourceGeometry,
                hue: visual.hue,
                saturation: visual.saturation,
                lightness: visual.lightness,
                alpha: visual.alpha,
                color: visual.color
            };
        });

        if (this.colorMode === 'length') {
            baseItems = this.applyEnvelopeRadialLengthColors(baseItems, radius);
        }

        const activeShuffle = this.getActiveShuffleAnimation(safeItemCount, m);
        const orderedItems = (shuffleOrder || Array.from({ length: safeItemCount }, (_, i) => i)).map((itemIndex, slotIndex) => {
            let slotGeometry = slots[slotIndex]?.geometry || this.getEnvelopeRadialLineGeometry(slotIndex, radius, cx, cy);
            if (activeShuffle) {
                const fromSlotIndex = activeShuffle.fromSlotsByItem[itemIndex];
                const fromGeometry = slots[fromSlotIndex]?.geometry || baseItems[itemIndex].slotGeometry;
                slotGeometry = this.interpolateEnvelopeRadialGeometry(fromGeometry, slotGeometry, activeShuffle.progress);
            }
            return {
                ...baseItems[itemIndex],
                slotIndex,
                slotGeometry
            };
        });

        const schemeRevision = this.colorMode === 'scheme' && typeof ColorSchemeManager !== 'undefined'
            ? ColorSchemeManager.currentScheme || 'rainbow'
            : 'none';

        return {
            providerId: 'envelope_radial',
            revision: [
                safeItemCount,
                this.getEnvelopeAxesCount(),
                this.getEnvelopeLinesPerSector(),
                m,
                this.shuffleNonce,
                this.colorMode,
                schemeRevision
            ].join('|'),
            items: orderedItems,
            slots,
            points,
            providerMeta: {
                label: 'Envelope Radial',
                itemCount: safeItemCount,
                n: safeItemCount,
                m,
                axesCount: this.getEnvelopeAxesCount(),
                linesPerSector: this.getEnvelopeLinesPerSector(),
                visibleCount
            }
        };
    },

    getCurrentEnvelopeRadialProvider() {
        if (!this.canvas) return null;
        const locked = this.sortLockedState || {
            n: this.getEnvelopeItemCount(),
            m: this.multiplier
        };
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.35;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        return this.buildEnvelopeRadialProvider(locked.n, locked.m, radius, cx, cy);
    },

    buildGeometryProvider(n, m, radius, cx, cy) {
        return this.buildEnvelopeRadialProvider(n, m, radius, cx, cy);
    },

    getCurrentGeometryProvider() {
        return this.getCurrentEnvelopeRadialProvider();
    },

    getGeometryLineVisual(i, n, from, to, radius, alphaOverride = null) {
        return this.getEnvelopeRadialLineVisual(i, n, from, to, radius, alphaOverride);
    }
};
