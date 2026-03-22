const LissajousGeometryProvider = {
    interpolateLissajousGeometry(fromGeometry, toGeometry, t) {
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

    getLissajousA() {
        return Math.max(1, Math.floor(Number(this.lissajousA) || 3));
    },

    getLissajousB() {
        return Math.max(1, Math.floor(Number(this.lissajousB) || 2));
    },

    getLissajousPhaseRad() {
        return ((Number(this.lissajousPhaseDeg) || 90) * Math.PI) / 180;
    },

    getLissajousPoint(i, n, radius, cx, cy, originalIndex = i) {
        const safeN = Math.max(1, n);
        const t = (Math.PI * 2 * i) / safeN;
        const a = this.getLissajousA();
        const b = this.getLissajousB();
        const phase = this.getLissajousPhaseRad();
        
        const ribbonData = Number(this.lissajousRibbon) || 0;
        const ribbonPhase = ribbonData === 0 ? 0 : (ribbonData / 100) * (originalIndex / safeN) * Math.PI * 2;

        const amp = radius * 0.88;
        const finalPhaseX = a * t + phase + ribbonPhase;
        const finalPhaseY = b * t + ribbonPhase;
        
        return {
            x: cx + Math.sin(finalPhaseX) * amp,
            y: cy + Math.sin(finalPhaseY) * amp,
            t,
            paramX: finalPhaseX,
            paramY: finalPhaseY
        };
    },

    getLissajousPointByIndex(index, n, radius, cx, cy, originalIndex = index) {
        const safeN = Math.max(1, n);
        const wrapped = this.positiveMod(index, safeN);
        const i0 = Math.floor(wrapped);
        const i1 = (i0 + 1) % safeN;
        const frac = wrapped - i0;
        const p0 = this.getLissajousPoint(i0, safeN, radius, cx, cy, originalIndex);
        const p1 = this.getLissajousPoint(i1, safeN, radius, cx, cy, originalIndex);
        return {
            x: p0.x + (p1.x - p0.x) * frac,
            y: p0.y + (p1.y - p0.y) * frac
        };
    },

    getLissajousLineGeometry(i, n, m, radius, cx, cy) {
        const from = this.getLissajousPoint(i, n, radius, cx, cy, i);
        const to = this.getLissajousPointByIndex((m * i) % Math.max(1, n), n, radius, cx, cy, i);
        return {
            kind: 'line',
            from,
            to
        };
    },

    getLissajousLshVisual(i, n, m, from, to, radius, alpha) {
        const safeN = Math.max(1, n);
        const sourceHue = ((i / safeN) * 360 + 360) % 360;
        const targetIndex = ((m * i) % safeN + safeN) % safeN;
        const targetPhase = (targetIndex / safeN) * Math.PI * 2;
        const len = Math.hypot(to.x - from.x, to.y - from.y);
        const lengthRatio = Math.max(0, Math.min(1, len / Math.max(1, radius * 2)));
        const saturation = 54 + ((Math.sin(targetPhase + from.paramX) + 1) * 0.5) * 26 + lengthRatio * 8;
        const lightness = 46 + ((Math.cos(targetPhase - from.paramY) + 1) * 0.5) * 12 + lengthRatio * 12;
        return {
            hue: sourceHue,
            saturation,
            lightness,
            alpha,
            color: `hsla(${sourceHue}, ${saturation}%, ${lightness}%, ${alpha})`
        };
    },

    getLissajousLineVisual(i, n, from, to, radius, alphaOverride = null) {
        const safeN = Math.max(1, n);
        const alpha = alphaOverride == null ? this.lineAlpha : alphaOverride;

        if (this.colorMode === 'monochrome') {
            return {
                hue: 170,
                saturation: 42,
                lightness: 80,
                alpha,
                color: `rgba(167, 243, 208, ${alpha})`
            };
        }

        if (this.colorMode === 'order' || this.colorMode === 'angle') {
            const hue = (i / safeN) * 360;
            return {
                hue,
                saturation: 95,
                lightness: 62,
                alpha,
                color: `hsla(${hue}, 95%, 62%, ${alpha})`
            };
        }

        if (this.colorMode === 'lsh') {
            return this.getLissajousLshVisual(i, safeN, this.multiplier, from, to, radius, alpha);
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
        const ratio = Math.max(0, Math.min(1, len / Math.max(1, radius * 2)));
        const hue = 240 - ratio * 220;
        return {
            hue,
            saturation: 92,
            lightness: 60,
            alpha,
            color: `hsla(${hue}, 92%, 60%, ${alpha})`
        };
    },

    getLissajousLineColor(i, n, from, to, radius) {
        return this.getLissajousLineVisual(i, n, from, to, radius).color;
    },

    buildLissajousProvider(n, m, radius, cx, cy) {
        const safeN = Math.max(0, Math.floor(n));
        const safeDenominator = Math.max(1, safeN);
        const shuffleOrder = this.ensureShuffleOrder(safeN, m);
        const points = Array.from({ length: safeN }, (_, i) => this.getLissajousPoint(i, safeN, radius, cx, cy));
        const slots = Array.from({ length: safeN }, (_, slotIndex) => ({
            slotIndex,
            geometry: this.getLissajousLineGeometry(slotIndex, safeN, m, radius, cx, cy)
        }));

        const baseItems = Array.from({ length: safeN }, (_, originalIndex) => {
            const sourceGeometry = this.getLissajousLineGeometry(originalIndex, safeN, m, radius, cx, cy);
            const visual = this.getLissajousLineVisual(originalIndex, safeN, sourceGeometry.from, sourceGeometry.to, radius);
            return {
                id: `lissajous-item-${originalIndex}`,
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

        // Transplant logic for maintaining sorting state during Phase changes
        const lastNonce = this._lastRevision ? this._lastRevision.split('|')[2] : null;
        const nonceMatches = lastNonce === String(this.shuffleNonce);
        const currentItems = (nonceMatches && this._lastProvider && this._lastRevision && this._lastRevision.split('|')[0] === String(safeN)) ? this._lastProvider.items : null;
        const currentOrder = currentItems ? currentItems.map(it => it.originalIndex) : null;
        
        const finalOrder = currentOrder || shuffleOrder || Array.from({ length: safeN }, (_, i) => i);
        const activeShuffle = this.getActiveShuffleAnimation(safeN, m);

        const orderedItems = finalOrder.map((itemIndex, slotIndex) => {
            let slotGeometry = slots[slotIndex]?.geometry || this.getLissajousLineGeometry(slotIndex, safeDenominator, m, radius, cx, cy);
            if (activeShuffle) {
                const fromSlotIndex = activeShuffle.fromSlotsByItem[itemIndex];
                const fromGeometry = slots[fromSlotIndex]?.geometry || baseItems[itemIndex].slotGeometry;
                slotGeometry = this.interpolateLissajousGeometry(fromGeometry, slotGeometry, activeShuffle.progress);
            }
            return {
                ...baseItems[itemIndex],
                slotIndex,
                slotGeometry
            };
        });

        return {
            providerId: 'lissajous',
            revision: `${safeN}|${m}|${this.shuffleNonce}|${this.colorMode}|${this.getLissajousA()}|${this.getLissajousB()}|${this.getLissajousPhaseRad().toFixed(4)}`,
            items: orderedItems,
            slots,
            points,
            providerMeta: {
                label: 'Lissajous',
                itemCount: safeN,
                n: safeN,
                m
            }
        };
    },

    getCurrentLissajousProvider() {
        if (!this.canvas) return null;
        const locked = this.sortLockedState || {
            n: Math.max(0, Math.floor(this.pointCount)),
            m: this.multiplier
        };
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.44;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        return this.buildLissajousProvider(locked.n, locked.m, radius, cx, cy);
    },

    buildGeometryProvider(n, m, radius, cx, cy) {
        return this.buildLissajousProvider(n, m, radius, cx, cy);
    },

    getCurrentGeometryProvider() {
        return this.getCurrentLissajousProvider();
    },

    getGeometryLineVisual(i, n, from, to, radius, alphaOverride = null) {
        return this.getLissajousLineVisual(i, n, from, to, radius, alphaOverride);
    },

    getGeometryAnchorPoint(i, n, radius, cx, cy) {
        return this.getLissajousPoint(i, n, radius, cx, cy);
    },

    getGeometryAnchorPointByIndex(index, n, radius, cx, cy) {
        return this.getLissajousPointByIndex(index, n, radius, cx, cy);
    }
};
