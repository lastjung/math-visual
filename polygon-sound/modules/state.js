/**
 * Polygon Sound - Shared Global State
 */

export const state = {
    // Audio Context & Nodes
    audioContext: null,
    masterGain: null,
    analyser: null,

    // Animation & Logic
    isPlaying: false,
    animationId: null,
    rotation: 0,
    speed: 1.0,
    
    // Geometry Settings (Multi-Layer)
    layers: [
        { sides: 3, skip: 1, color: '#ff7675', rotationOffset: 0 }, // Triangle
        { sides: 4, skip: 1, color: '#54a0ff', rotationOffset: 0 }  // Square
    ],
    activeLayerIndex: 0,
    
    // UI Elements Mapping
    elements: {},
    
    // Musical State
    activeKeys: new Array(12).fill(0),
    lastHitNote: null,
    
    // Canvas Buffer
    ctx: null,
    pixelRatio: window.devicePixelRatio || 1,
    
    // Visual Effects
    particles: [],
    shake: 0
};
