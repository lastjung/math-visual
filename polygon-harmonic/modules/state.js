/**
 * Polygon Harmonic - Store (Deep Glow Edition)
 */

import { INITIAL_STATE } from './constants.js';

export const state = {
    ...INITIAL_STATE,
    layers: [],
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    
    // Playback
    isPlaying: false,
    speed: 2.0,      // User base speed
    storySpeedMultiplier: 1.0, // Narrative dynamic speed factor
    direction: -1,   // -1 CCW, 1 CW
    lastFrameTime: 0,
    
    // Modes
    viewMode: 'solo', // 'solo' or 'grid' (legacy)
    
    // Premium Visual Effects (Deep Glow Engine)
    ripples: [],          // [{x, y, color, life, maxRadius}]
    edgeGlows: [],        // [{p1:{x,y}, p2:{x,y}, color, life}]
    sceneShake: 0,        // 0 ~ 1.0
    
    // 🔥 New Extremes
    ghostPolygons: [],    // [{sides, cx, cy, radius, color, life, rotation}] - Expanding burst
    crossFlashes: [],     // [{x, y, color, life, size}] - Starburst at hit vertex
    vertexHistory: [],    // Stores last N frames of vertices for Fluid Trails

    // Story Mode
    storyProgress: 0,     // Time in ms
    activeCaption: null
};
