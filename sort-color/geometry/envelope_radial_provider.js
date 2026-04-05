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

    getEnvelopeItemCount() {
        return this.getEnvelopeAxesCount() * this.getEnvelopeLinesPerSector();
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
        const angle = this.rotation + ((Math.PI * 2 * axisIndex) / safeAxes);
        const distance = Math.max(0, Math.min(1, ratio)) * radius;
        return {
            x: cx + Math.cos(angle) * distance,
            y: cy + Math.sin(angle) * distance,
            angle,
            distance
        };
    },

    getEnvelopeRadialLineGeometry(itemIndex, radius, cx, cy) {
        const axesCount = this.getEnvelopeAxesCount();
        const linesPerSector = this.getEnvelopeLinesPerSector();
        const sectorIndex = Math.floor(itemIndex / linesPerSector);
        const lineIndex = itemIndex % linesPerSector;
        const ratio = (lineIndex + 1) / (linesPerSector + 1);
        const from = this.getEnvelopeRadialAnchor(sectorIndex, ratio, radius, cx, cy);
        const to = this.getEnvelopeRadialAnchor((sectorIndex + 1) % axesCount, 1 - ratio, radius, cx, cy);
        return {
            kind: 'line',
            from,
            to,
            sectorIndex,
            lineIndex,
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

    buildEnvelopeRadialProvider(_n, m, radius, cx, cy) {
        this.syncEnvelopeItemCount();
        const itemCount = this.getEnvelopeItemCount();
        const safeItemCount = Math.max(0, itemCount);
        const safeDenominator = Math.max(1, safeItemCount);
        const visibleCount = this.getEnvelopeVisibleCount();
        const shuffleOrder = this.ensureShuffleOrder(safeItemCount, m);

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

        const baseItems = Array.from({ length: safeItemCount }, (_, originalIndex) => {
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
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.42;
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
