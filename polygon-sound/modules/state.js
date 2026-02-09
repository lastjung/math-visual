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
        { sides: 3, genValue: 1, customVertices: null, color: '#ff7675', rotationOffset: 0 } // L-1
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
    canvasSize: 520, 
    radius: 180,
    center: { x: 250, y: 250 },
    
    // Visual Effects
    particles: [],
    shake: 0,

    // Modes
    currentScale: 'All',
    chordProgressionText: '',
    chordProgression: [],
    chordIndex: 0,
    currentChord: '',
    lastChordApplied: null
};
