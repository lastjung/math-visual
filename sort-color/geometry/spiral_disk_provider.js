const SpiralDiskGeometryProvider = {
    interpolateSpiralGeometry(fromGeometry, toGeometry, t) {
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

    getSpiralTurns() {
        return Math.max(1.5, Number(this.spiralTurns) || 5.5);
    },

    getSpiralPoint(i, n, radius, cx, cy) {
        const safeN = Math.max(1, n);
        const denom = Math.max(1, safeN - 1);
        const progress = Math.max(0, Math.min(1, i / denom));
        const turns = this.getSpiralTurns();
        const angle = this.rotation + progress * Math.PI * 2 * turns;
        const radialEase = Math.pow(progress, 0.84);
        const distance = radius * (0.08 + radialEase * 0.9);
        return {
            x: cx + Math.cos(angle) * distance,
            y: cy + Math.sin(angle) * distance,
            t: angle,
            r: distance,
            progress
        };
    },

    getSpiralPointByIndex(index, n, radius, cx, cy) {
        const safeN = Math.max(1, n);
        const wrapped = this.positiveMod(index, safeN);
        const i0 = Math.floor(wrapped);
        const i1 = Math.min(safeN - 1, i0 + 1);
        const frac = wrapped - i0;
        const p0 = this.getSpiralPoint(i0, safeN, radius, cx, cy);
        const p1 = this.getSpiralPoint(i1, safeN, radius, cx, cy);
        return {
            x: p0.x + (p1.x - p0.x) * frac,
            y: p0.y + (p1.y - p0.y) * frac
        };
    },

    getSpiralLineGeometry(i, n, m, radius, cx, cy) {
        const from = this.getSpiralPoint(i, n, radius, cx, cy);
        const targetIndex = (m * i) % Math.max(1, n);
        const to = this.getSpiralPointByIndex(targetIndex, n, radius, cx, cy);
        return {
            kind: 'line',
            from,
            to
        };
    },

    getSpiralLshVisual(i, n, m, from, to, radius, alpha) {
        const safeN = Math.max(1, n);
        const sourceHue = ((i / safeN) * 360 + 360) % 360;
        const targetIndex = ((m * i) % safeN + safeN) % safeN;
        const targetPhase = (targetIndex / safeN) * Math.PI * 2;
        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const lengthRatio = Math.max(0, Math.min(1, len / Math.max(1, radius * 1.8)));
        const radiusPhase = ((from.r || 0) / Math.max(1, radius)) * Math.PI;
        const saturation = 52 + ((Math.sin(targetPhase + radiusPhase) + 1) * 0.5) * 30 + lengthRatio * 10;
        const lightness = 42 + ((Math.cos(targetPhase - radiusPhase) + 1) * 0.5) * 16 + lengthRatio * 14;
        return {
            hue: sourceHue,
            saturation,
            lightness,
            alpha,
            color: `hsla(${sourceHue}, ${saturation}%, ${lightness}%, ${alpha})`
        };
    },

    getSpiralLineVisual(i, n, from, to, radius, alphaOverride = null) {
        const safeN = Math.max(1, n);
        const alpha = alphaOverride == null ? this.lineAlpha : alphaOverride;

        if (this.colorMode === 'monochrome') {
            return {
                hue: 176,
                saturation: 46,
                lightness: 80,
                alpha,
                color: `rgba(167, 243, 208, ${alpha})`
            };
        }

        if (this.colorMode === 'order') {
            const hue = (i / safeN) * 360;
            return {
                hue,
                saturation: 95,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 95%, 62%, ${alpha})`
            };
        }

        if (this.colorMode === 'angle') {
            const hue = (((from.t || 0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const hueDeg = (hue / (Math.PI * 2)) * 360;
            return {
                hue: hueDeg,
                saturation: 95,
                lightness: 62,
                alpha,
                color: `hsla(${hueDeg}, 95%, 62%, ${alpha})`
            };
        }

        if (this.colorMode === 'lsh') {
            return this.getSpiralLshVisual(i, safeN, this.multiplier, from, to, radius, alpha);
        }

        if (this.colorMode === 'origin') {
            const hue = ((Math.atan2(to.y - from.y, to.x - from.x) + Math.PI) / (2 * Math.PI)) * 360;
            return {
                hue,
                saturation: 88,
                lightness: 60,
                alpha,
                color: `hsla(${hue}, 88%, 60%, ${alpha})`
            };
        }

        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const ratio = Math.max(0, Math.min(1, len / Math.max(1, radius * 1.8)));
        const hue = 220 - ratio * 200;
        return {
            hue,
            saturation: 92,
            lightness: 60,
            alpha,
            color: `hsla(${hue}, 92%, 60%, ${alpha})`
        };
    },

    getSpiralLineColor(i, n, from, to, radius) {
        return this.getSpiralLineVisual(i, n, from, to, radius).color;
    },

    getSpiralLengthRange(items, radius) {
        if (!Array.isArray(items) || items.length === 0) {
            return { min: 0, max: Math.max(1, radius * 1.8) };
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
            return { min: 0, max: Math.max(1, radius * 1.8) };
        }
        if (Math.abs(max - min) < 1e-6) {
            return { min, max: min + 1 };
        }
        return { min, max };
    },

    applySpiralLengthColors(items, radius) {
        const measured = items.map((item, index) => {
            const geometry = item?.sourceGeometry;
            const len = geometry?.from && geometry?.to
                ? Math.hypot(geometry.to.x - geometry.from.x, geometry.to.y - geometry.from.y)
                : 0;
            return { item, index, len };
        });
        const sorted = [...measured].sort((a, b) => a.len - b.len || a.index - b.index);
        const ratios = Array.from({ length: measured.length }, () => 0);
        const denom = Math.max(1, sorted.length - 1);
        for (let rank = 0; rank < sorted.length; rank++) {
            ratios[sorted[rank].index] = rank / denom;
        }

        return measured.map(({ item, index }) => {
            const ratio = ratios[index];
            const hue = 360 - ratio * 360;
            return {
                ...item,
                hue,
                saturation: 92,
                lightness: 60,
                color: `hsla(${hue}, 92%, 60%, ${item.alpha})`
            };
        });
    },

    buildSpiralDiskProvider(n, m, radius, cx, cy) {
        const safeN = Math.max(0, Math.floor(n));
        const safeDenominator = Math.max(1, safeN);
        const shuffleOrder = this.ensureShuffleOrder(safeN, m);
        const points = Array.from({ length: safeN }, (_, i) => this.getSpiralPoint(i, safeN, radius, cx, cy));
        const slots = Array.from({ length: safeN }, (_, slotIndex) => ({
            slotIndex,
            geometry: this.getSpiralLineGeometry(slotIndex, safeN, m, radius, cx, cy)
        }));

        let baseItems = Array.from({ length: safeN }, (_, originalIndex) => {
            const sourceGeometry = this.getSpiralLineGeometry(originalIndex, safeN, m, radius, cx, cy);
            const visual = this.getSpiralLineVisual(originalIndex, safeN, sourceGeometry.from, sourceGeometry.to, radius);
            return {
                id: `spiral-item-${originalIndex}`,
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
            baseItems = this.applySpiralLengthColors(baseItems, radius);
        }

        const activeShuffle = this.getActiveShuffleAnimation(safeN, m);
        const orderedItems = (shuffleOrder || Array.from({ length: safeN }, (_, i) => i)).map((itemIndex, slotIndex) => {
            let slotGeometry = slots[slotIndex]?.geometry || this.getSpiralLineGeometry(slotIndex, safeDenominator, m, radius, cx, cy);
            if (activeShuffle) {
                const fromSlotIndex = activeShuffle.fromSlotsByItem[itemIndex];
                const fromGeometry = slots[fromSlotIndex]?.geometry || baseItems[itemIndex].slotGeometry;
                slotGeometry = this.interpolateSpiralGeometry(fromGeometry, slotGeometry, activeShuffle.progress);
            }
            return {
                ...baseItems[itemIndex],
                slotIndex,
                slotGeometry
            };
        });

        return {
            providerId: 'spiral_disk',
            revision: `${safeN}|${m}|${this.shuffleNonce}|${this.colorMode}|${this.getSpiralTurns().toFixed(3)}`,
            items: orderedItems,
            slots,
            points,
            drawOrder: Array.from({ length: safeN }, (_, index) => safeN - 1 - index),
            providerMeta: {
                label: 'Spiral Disk',
                itemCount: safeN,
                n: safeN,
                m
            }
        };
    },

    getCurrentSpiralDiskProvider() {
        if (!this.canvas) return null;
        const locked = this.sortLockedState || {
            n: Math.max(0, Math.floor(this.pointCount)),
            m: this.multiplier
        };
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.44;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        return this.buildSpiralDiskProvider(locked.n, locked.m, radius, cx, cy);
    },

    buildGeometryProvider(n, m, radius, cx, cy) {
        return this.buildSpiralDiskProvider(n, m, radius, cx, cy);
    },

    getCurrentGeometryProvider() {
        return this.getCurrentSpiralDiskProvider();
    },

    getGeometryLineVisual(i, n, from, to, radius, alphaOverride = null) {
        return this.getSpiralLineVisual(i, n, from, to, radius, alphaOverride);
    },

    getGeometryLineWidth(chord, geometry, radius, n) {
        const progress = geometry?.from?.progress ?? chord?.sourceGeometry?.from?.progress ?? 0;
        const t = Math.max(0, Math.min(1, progress));
        return this.lineWidth * (0.8 + t * 1.1);
    },

    getGeometryAnchorPoint(i, n, radius, cx, cy) {
        return this.getSpiralPoint(i, n, radius, cx, cy);
    },

    getGeometryAnchorPointByIndex(index, n, radius, cx, cy) {
        return this.getSpiralPointByIndex(index, n, radius, cx, cy);
    }
};
