const ColorKeyEngine = {
    getHueKey(hue) {
        return Math.max(0, Math.min(359, Math.round(hue)));
    },

    getChannelBucket(value, maxValue) {
        const safe = Math.max(0, Math.min(maxValue, value));
        if (maxValue <= 0) return 0;
        return Math.max(0, Math.min(9, Math.floor((safe / (maxValue + 0.0001)) * 10)));
    },

    extractSortItem(item) {
        const hueKey = this.getHueKey(item.hue);
        return {
            ...item,
            hueKey,
            hueBucket: this.getChannelBucket(hueKey, 359),
            saturationBucket: this.getChannelBucket(item.saturation, 100),
            lightnessBucket: this.getChannelBucket(item.lightness, 100)
        };
    },

    extractSortItems(items) {
        return items.map((item) => this.extractSortItem(item));
    },

    getSortPassDescriptors(sortMode) {
        if (sortMode === 'lsh') {
            return [
                { key: 'lightnessBucket', label: 'Lightness' },
                { key: 'saturationBucket', label: 'Saturation' },
                { key: 'hueKey', divisor: 1, label: 'Hue 1s' },
                { key: 'hueKey', divisor: 10, label: 'Hue 10s' },
                { key: 'hueKey', divisor: 100, label: 'Hue 100s' }
            ];
        }

        return [
            { key: 'hueKey', divisor: 1, label: 'Hue 1s' },
            { key: 'hueKey', divisor: 10, label: 'Hue 10s' },
            { key: 'hueKey', divisor: 100, label: 'Hue 100s' }
        ];
    }
};

const CardioidCircleColorKeys = ColorKeyEngine;
