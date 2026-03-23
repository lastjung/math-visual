const SortShuffleManager = {
    getShuffleSignature(n, m) {
        return [
            n,
            m.toFixed(6),
            this.learningMode,
            this.integersOnly ? 1 : 0,
            this.shuffleNonce
        ].join('|');
    },

    generateShuffleOrder(n) {
        const order = Array.from({ length: n }, (_, index) => index);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        return order;
    },

    invertShuffleOrder(order) {
        const slotsByItem = Array.from({ length: order.length }, () => -1);
        for (let slotIndex = 0; slotIndex < order.length; slotIndex++) {
            slotsByItem[order[slotIndex]] = slotIndex;
        }
        return slotsByItem;
    },

    getShuffleFocusItem(fromSlotsByItem, toSlotsByItem) {
        let bestItemIndex = 0;
        let bestDistance = -1;
        for (let itemIndex = 0; itemIndex < fromSlotsByItem.length; itemIndex++) {
            const distance = Math.abs((toSlotsByItem[itemIndex] ?? 0) - (fromSlotsByItem[itemIndex] ?? 0));
            if (distance > bestDistance) {
                bestDistance = distance;
                bestItemIndex = itemIndex;
            }
        }
        return bestItemIndex;
    },

    ensureShuffleOrder(n, m) {
        if (n <= 0) {
            this.shuffleOrder = null;
            this.shuffleSignature = '';
            return null;
        }

        const signature = this.getShuffleSignature(n, m);
        if (this.shuffleOrder && this.shuffleSignature === signature && this.shuffleOrder.length === n) {
            return this.shuffleOrder;
        }

        const order = this.generateShuffleOrder(n);
        this.shuffleOrder = order;
        this.shuffleSignature = signature;
        return order;
    },

    getActiveShuffleAnimation(n, m) {
        const animation = this.shuffleAnimation;
        if (!animation || animation.n !== n || animation.m !== m) return null;
        return animation;
    },

    updateShuffleAnimation(dt) {
        if (!this.shuffleAnimation) return;
        const duration = Math.max(0.001, this.shuffleAnimation.duration || 0.9);
        this.shuffleAnimation.progress = Math.min(1, this.shuffleAnimation.progress + (dt / duration));
        if (this.shuffleAnimation.progress >= 1) {
            this.shuffleAnimation = null;
        }
    },

    shuffleChords() {
        const n = Math.max(0, Math.floor(this.sortLockedState?.n || this.pointCount || 0));
        const forceIntegerM = this.learningMode === 'gcd' || this.learningMode === 'integer-snap';
        const m = typeof this.multiplier === 'number'
            ? ((this.integersOnly || forceIntegerM) ? Math.round(this.multiplier) : this.multiplier)
            : 0;
        const currentOrder = (this.ensureShuffleOrder(n, m) || Array.from({ length: n }, (_, index) => index)).slice();
        let nextOrder = this.generateShuffleOrder(n);

        if (n > 1) {
            let guard = 0;
            while (guard < 4 && nextOrder.every((itemIndex, slotIndex) => itemIndex === currentOrder[slotIndex])) {
                nextOrder = this.generateShuffleOrder(n);
                guard += 1;
            }
        }

        this.shuffleNonce += 1;
        this.shuffleOrder = nextOrder;
        this.shuffleSignature = this.getShuffleSignature(n, m);
        const fromSlotsByItem = this.invertShuffleOrder(currentOrder);
        const toSlotsByItem = this.invertShuffleOrder(nextOrder);
        this.shuffleAnimation = {
            n,
            m,
            fromOrder: currentOrder,
            toOrder: nextOrder,
            fromSlotsByItem,
            toSlotsByItem,
            focusItemIndex: this.getShuffleFocusItem(fromSlotsByItem, toSlotsByItem),
            progress: 0,
            duration: 0.9
        };
        this.shuffleFlash = 1;
        this.resetSortState('idle');
    }
};
