/**
 * Polygon Harmonic - Universal Constants
 */

// Circle of Fifths: The backbone of harmonic resonance
export const CIRCLE_NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

// Chromatic Reference (for UI and internal logic)
export const CHROMATIC_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const NOTE_COLORS = {
    'C': '#FF3366',   // Neon Pink
    'G': '#FF9933',   // Orange
    'D': '#FFCC33',   // Yellow
    'A': '#CCFF33',   // Lime
    'E': '#33FF66',   // Spring Green
    'B': '#33FFCC',   // Turquoise
    'Gb': '#33CCFF',  // Sky Blue
    'Db': '#3366FF',  // Royal Blue
    'Ab': '#6633FF',  // Purple
    'Eb': '#CC33FF',  // Magenta
    'Bb': '#FF33CC',  // Hot Pink
    'F': '#94A3B8'    // Slate
};

export function getPolygonColor(sides) {
    const hue = ((sides - 3) * 35) % 360; // Spread colors across the spectrum
    return `hsl(${hue}, 80%, 60%)`;
}

export const FREQUENCIES = {
    'C': 261.63, 'Db': 277.18, 'D': 293.66, 'Eb': 311.13,
    'E': 329.63, 'F': 349.23, 'Gb': 369.99, 'G': 392.00,
    'Ab': 415.30, 'A': 440.00, 'Bb': 466.16, 'B': 493.88
};

export const POLYGONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const INITIAL_STATE = {
    isPlaying: false,
    speed: 2.0,
    direction: 1, // 1: CW, -1: CCW
    viewMode: 'grid', // 'grid' or 'solo'
    soloIndex: 0,
    globalRotation: 0,
    activeNotes: new Array(12).fill(0), // decay for UI
    lastHitTimes: new Array(12).fill(0)
};
