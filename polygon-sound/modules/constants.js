/**
 * Polygon Sound - Musical Constants
 */

// 5도권 기반 음 배열 (영상과 동일한 배치)
export const CIRCLE_NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

// 피아노 건반용 반음계 배열
export const LINEAR_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// 기본 주파수 (4옥타브 기준)
export const FREQUENCIES = {
    'C': 261.63,
    'Db': 277.18,
    'D': 293.66,
    'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'Gb': 369.99,
    'G': 392.00,
    'Ab': 415.30,
    'A': 440.00,
    'Bb': 466.16,
    'B': 493.88
};

// 음별 고유 색상 매핑 (이미지 참조)
export const NOTE_COLORS = {
    'C': '#ff7675',   // Coral/Pink
    'G': '#ffe66d',   // Yellow
    'D': '#ffcc00',   // Gold
    'A': '#f1f2f6',   // White/Silver
    'E': '#00d2d3',   // Cyan
    'B': '#feca57',   // Amber
    'Gb': '#54a0ff',  // Blue
    'Db': '#a29bfe',  // Lavender
    'Ab': '#ff9ff3',  // Pink
    'Eb': '#ee5253',  // Red
    'Bb': '#ff6b6b',  // Light Red
    'F': '#ced4da'    // Grey
};
