const EnvelopeRadialGeometryProvider = {
    interpolateEnvelopeRadialGeometry(fromGeometry, toGeometry, t) {
        if (!fromGeometry || !toGeometry) return toGeometry || fromGeometry || null;
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
        const axesCount = this.getEnvelopeAxesCount();
        const baseCount = this.getEnvelopeBaseItemCount();
        if (baseCount <= 0) return [];

        const activeSet = new Set();
        // Sample the first layer/set to identify used axes
        // For standard, all axes are used. For chain, only a subset.
        for (let i = 0; i < Math.min(baseCount, axesCount * 4); i++) {
            const geom = this.getEnvelopeRadialLineGeometry(i, 100, 0, 0, true);
            if (geom) {
                activeSet.add(geom.fromAxis);
                activeSet.add(geom.toAxis);
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
        const safeAxes = this.getEnvelopeAxesCount();
        const angle = this.rotation - ((Math.PI * 2 * axisIndex) / safeAxes);
        const distance = Math.max(0, Math.min(1, ratio)) * radius;
        return {
            x: cx + Math.cos(angle) * distance,
            y: cy + Math.sin(angle) * distance,
            angle,
            distance
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

    getEnvelopeRadialLineVisual(itemIndex, totalCount, from, to, radius, alphaOverride = null) {
        const safeTotal = Math.max(1, totalCount);
        const alpha = alphaOverride == null ? this.lineAlpha : alphaOverride;
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        const lengthRatio = Math.max(0, Math.min(1, length / Math.max(1, radius * 2)));
        const sectorHue = (((from.angle || 0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const hueFromAngle = (sectorHue / (Math.PI * 2)) * 360;

        if (this.colorMode === 'scheme' && typeof ColorSchemeManager !== 'undefined') {
            const hue = ColorSchemeManager.getHue(itemIndex / safeTotal);
            return {
                hue,
                saturation: 100,
                lightness: 50,
                alpha,
                color: `hsla(${hue}, 100%, 50%, ${alpha})`
            };
        }

        if (this.colorMode === 'monochrome') {
            return {
                hue: 180,
                saturation: 24,
                lightness: 80,
                alpha,
                color: `hsla(180, 24%, 80%, ${alpha})`
            };
        }

        if (this.colorMode === 'order') {
            const hue = (itemIndex / safeTotal) * 360;
            return {
                hue,
                saturation: 95,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 95%, 62%, ${alpha})`
            };
        }

        if (this.colorMode === 'origin') {
            return {
                hue: hueFromAngle,
                saturation: 90,
                lightness: 60,
                alpha,
                color: `hsla(${hueFromAngle}, 90%, 60%, ${alpha})`
            };
        }

        if (this.colorMode === 'lsh') {
            const hue = hueFromAngle;
            const saturation = 52 + lengthRatio * 34;
            const lightness = 42 + (1 - Math.abs(lengthRatio - 0.5) * 2) * 22;
            return {
                hue,
                saturation,
                lightness,
                alpha,
                color: `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
            };
        }

        if (this.colorMode === 'length') {
            const hue = 220 - lengthRatio * 220;
            return {
                hue,
                saturation: 92,
                lightness: 60,
                alpha,
                color: `hsla(${hue}, 92%, 60%, ${alpha})`
            };
        }

        return {
            hue: hueFromAngle,
            saturation: 94,
            lightness: 62,
            alpha,
            color: `hsla(${hueFromAngle}, 94%, 62%, ${alpha})`
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
