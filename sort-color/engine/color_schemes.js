/**
 * ColorSchemeManager
 * Manages premium HSL color themes and interpolation.
 * Based on @game-color-scheme skill.
 */
const ColorSchemeManager = {
    currentScheme: 'rainbow',
    flowOffset: 0,
    
    schemes: {
        rainbow: {
            label: 'Rainbow',
            getHue: (t, flow) => (t * 360 + flow * 0.5) % 360
        },
        twilight: {
            label: 'Twilight',
            stops: [55, 30, 330, 270, 250]
        },
        cosmic: {
            label: 'Cosmic',
            stops: [180, 220, 280, 320]
        },
        aurora: {
            label: 'Aurora',
            stops: [110, 185, 265, 315]
        },
        cyan: {
            label: 'Cyan',
            getHue: (t, flow) => 180 + Math.sin(t * 5 + flow * 0.1) * 20
        },
        sunset: {
            label: 'Sunset',
            getHue: (t, flow) => 10 + Math.sin(t * 3 + flow * 0.1) * 30
        },
        lime: {
            label: 'Lime',
            stops: [85, 145, 195, 235]
        },
        amethyst: {
            label: 'Amethyst',
            stops: [260, 280, 295, 315, 330]
        }
    },

    interpolate(t, stops) {
        if (!stops || stops.length === 0) return 0;
        if (stops.length === 1) return stops[0];

        const f = t * (stops.length - 1);
        const low = Math.floor(f);
        let high = Math.min(low + 1, stops.length - 1);
        if (low === stops.length - 1) high = low;
        const frac = f - low;
        
        let h1 = stops[low];
        let h2 = stops[high];
        
        // Shortest path on color wheel
        if (h2 > h1 + 180) h1 += 360;
        if (h1 > h2 + 180) h2 += 360;
        
        return (h1 + (h2 - h1) * frac) % 360;
    },

    getHue(t) {
        const scheme = this.schemes[this.currentScheme] || this.schemes.rainbow;
        if (scheme.getHue) return scheme.getHue(t, 0);
        return this.interpolate(t, scheme.stops);
    },

    getColor(t, alpha = 1) {
        const hue = this.getHue(t);
        return `hsla(${hue}, 100%, 50%, ${alpha})`;
    },

    setScheme(id) {
        if (this.schemes[id]) {
            this.currentScheme = id;
            return true;
        }
        return false;
    },

    update(dt) {
        // Flow effect disabled as requested
    }
};
