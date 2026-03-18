const CardioidGeometryProvider = {
    interpolateCardioidGeometry(fromGeometry, toGeometry, t) {
        if (!fromGeometry || !toGeometry) return toGeometry || fromGeometry || null;
        return {
            kind: 'line',
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

    getCardioidPoint(i, n, radius, cx, cy) {
        const safeN = Math.max(1, n);
        const t = this.rotation + (Math.PI * 2 * i) / safeN;
        return { x: cx + radius * Math.cos(t), y: cy + radius * Math.sin(t), t };
    },

    getCardioidPointByIndex(index, n, radius, cx, cy) {
        const safeN = Math.max(1, n);
        const wrapped = this.positiveMod(index, safeN);
        const i0 = Math.floor(wrapped);
        const i1 = (i0 + 1) % safeN;
        const frac = wrapped - i0;
        const p0 = this.getCardioidPoint(i0, safeN, radius, cx, cy);
        const p1 = this.getCardioidPoint(i1, safeN, radius, cx, cy);
        return {
            x: p0.x + (p1.x - p0.x) * frac,
            y: p0.y + (p1.y - p0.y) * frac
        };
    },

    getCardioidLineGeometry(i, n, m, radius, cx, cy) {
        const from = this.getCardioidPoint(i, n, radius, cx, cy);
        const to = this.getCardioidPointByIndex((m * i) % Math.max(1, n), n, radius, cx, cy);
        return {
            kind: 'line',
            from,
            to
        };
    },

    getCardioidLineVisual(i, n, from, to, radius, alphaOverride = null) {
        const safeN = Math.max(1, n);
        const alpha = alphaOverride == null ? this.lineAlpha : alphaOverride;

        if (this.colorMode === 'monochrome') {
            return {
                hue: 160,
                saturation: 46,
                lightness: 80,
                alpha,
                color: `rgba(167, 243, 208, ${alpha})`
            };
        }

        if (this.colorMode === 'angle') {
            const hue = (i / safeN) * 360;
            return {
                hue,
                saturation: 95,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 95%, 62%, ${alpha})`
            };
        }

        if (this.colorMode === 'origin') {
            const hue = ((Math.atan2(from.y - to.y, from.x - to.x) + Math.PI) / (2 * Math.PI)) * 360;
            return {
                hue,
                saturation: 90,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 90%, 62%, ${alpha})`
            };
        }

        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const ratio = Math.max(0, Math.min(1, len / (2 * radius)));
        const hue = 240 - ratio * 220;
        return {
            hue,
            saturation: 92,
            lightness: 60,
            alpha,
            color: `hsla(${hue}, 92%, 60%, ${alpha})`
        };
    },

    getCardioidLineColor(i, n, from, to, radius) {
        return this.getCardioidLineVisual(i, n, from, to, radius).color;
    },

    buildCardioidProvider(n, m, radius, cx, cy) {
        const safeN = Math.max(0, Math.floor(n));
        const safeDenominator = Math.max(1, safeN);
        const shuffleOrder = this.ensureShuffleOrder(safeN, m);
        const points = Array.from({ length: safeN }, (_, i) => this.getCardioidPoint(i, safeN, radius, cx, cy));
        const slots = Array.from({ length: safeN }, (_, slotIndex) => ({
            slotIndex,
            geometry: this.getCardioidLineGeometry(slotIndex, safeN, m, radius, cx, cy)
        }));

        const baseItems = Array.from({ length: safeN }, (_, originalIndex) => {
            const sourceGeometry = this.getCardioidLineGeometry(originalIndex, safeN, m, radius, cx, cy);
            const visual = this.getCardioidLineVisual(originalIndex, safeN, sourceGeometry.from, sourceGeometry.to, radius);
            return {
                id: `item-${originalIndex}`,
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

        const activeShuffle = this.getActiveShuffleAnimation(safeN, m);
        const orderedItems = (shuffleOrder || Array.from({ length: safeN }, (_, i) => i)).map((itemIndex, slotIndex) => {
            let slotGeometry = slots[slotIndex]?.geometry || this.getCardioidLineGeometry(slotIndex, safeDenominator, m, radius, cx, cy);
            if (activeShuffle) {
                const fromSlotIndex = activeShuffle.fromSlotsByItem[itemIndex];
                const fromGeometry = slots[fromSlotIndex]?.geometry || baseItems[itemIndex].slotGeometry;
                slotGeometry = this.interpolateCardioidGeometry(fromGeometry, slotGeometry, activeShuffle.progress);
            }
            return {
                ...baseItems[itemIndex],
                slotIndex,
                slotGeometry
            };
        });

        return {
            providerId: 'cardioid',
            revision: `${safeN}|${m}|${this.shuffleNonce}|${this.colorMode}`,
            items: orderedItems,
            slots,
            points,
            providerMeta: {
                label: 'Cardioid',
                itemCount: safeN,
                n: safeN,
                m
            }
        };
    },

    getCurrentCardioidProvider() {
        if (!this.canvas) return null;
        const locked = this.sortLockedState || {
            n: Math.max(0, Math.floor(this.pointCount)),
            m: this.multiplier
        };
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.48;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        return this.buildCardioidProvider(locked.n, locked.m, radius, cx, cy);
    },

    buildGeometryProvider(n, m, radius, cx, cy) {
        return this.buildCardioidProvider(n, m, radius, cx, cy);
    },

    getCurrentGeometryProvider() {
        return this.getCurrentCardioidProvider();
    }
};

const CardioidCircleProvider = CardioidGeometryProvider;
