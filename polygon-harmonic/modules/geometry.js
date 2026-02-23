/**
 * Polygon Harmonic - Geometry & Sync Engine (Shockwave Edition)
 */

import { state } from './state.js';
import { playNote } from './audio.js';
import { CIRCLE_NOTES, POLYGONS } from './constants.js';

export function updateGeometry(delta) {
    if (!state.isPlaying) return;

    const prevRot = state.globalRotation;
    // Apply speed and direction
    state.globalRotation = (state.globalRotation + state.speed * state.direction + 360) % 360;

    // Decay visual active states
    for (let i = 0; i < 12; i++) {
        state.activeNotes[i] = Math.max(0, state.activeNotes[i] - 0.05);
    }
    
    // Decay Camera Shake
    state.sceneShake = Math.max(0, state.sceneShake - 0.05);

    // Record vertex history for Fluid Trail
    recordTrailHistory();
    
    // Check collisions for each polygon
    const activePolygons = state.viewMode === 'grid' 
        ? POLYGONS 
        : [POLYGONS[state.soloIndex]];

    activePolygons.forEach((sides) => {
        for (let s = 0; s < sides; s++) {
            const vertexOffset = (s * 360) / sides;
            const currentAngle = (state.globalRotation + vertexOffset) % 360;
            const previousAngle = (prevRot + vertexOffset) % 360;

            for (let n = 0; n < 12; n++) {
                const noteAngle = (n * 30) % 360;
                if (hasCrossed(previousAngle, currentAngle, noteAngle)) {
                    // Calculate immediate adjacent vertices for glow
                    const prevVOffset = ((s - 1 + sides) * 360) / sides;
                    const nextVOffset = ((s + 1) * 360) / sides;
                    const currentPrevAngle = (state.globalRotation + prevVOffset) % 360;
                    const currentNextAngle = (state.globalRotation + nextVOffset) % 360;

                    triggerHit(n, sides, noteAngle, currentAngle, currentPrevAngle, currentNextAngle);
                }
            }
        }
    });

    // Decay visual effect particles
    updateParticles();
}

function hasCrossed(prev, curr, target) {
    if (state.direction > 0) {
        if (prev <= target && curr >= target) return true;
        if (prev > curr && (target >= prev || target <= curr)) return true;
    } else {
        if (prev >= target && curr <= target) return true;
        if (prev < curr && (target <= prev || target >= curr)) return true;
    }
    return false;
}

function triggerHit(noteIndex, sides, noteAngle, currentAngle, prevAngle, nextAngle) {
    const noteName = CIRCLE_NOTES[noteIndex];
    // Velocity scales down as sides increase to prevent clipping overdrive
    const velocity = Math.max(0.3, 1.0 - (sides - 3) * 0.05); 
    
    playNote(noteName, velocity);

    state.activeNotes[noteIndex] = 1.0;
    state.lastHitTimes[noteIndex] = Date.now();
    
    // Hard collision on low polygons triggers shake
    if (sides < 6) state.sceneShake = Math.max(state.sceneShake, 0.4);

    // Queue Visual FX
    state.hitQueue = state.hitQueue || [];
    state.hitQueue.push({
        noteIndex, sides, noteAngle, currentAngle, prevAngle, nextAngle, noteName
    });
}

function updateParticles() {
    state.ripples = state.ripples.filter(r => { r.life -= 0.03; return r.life > 0; });
    state.edgeGlows = state.edgeGlows.filter(eg => { eg.life -= 0.08; return eg.life > 0; });
    
    // 🔥 New Extremes Decay
    state.ghostPolygons = state.ghostPolygons.filter(gp => { gp.life -= 0.05; return gp.life > 0; });
    state.crossFlashes = state.crossFlashes.filter(cf => { cf.life -= 0.1; return cf.life > 0; });
}

function recordTrailHistory() {
    // Keep max 15 frames of history
    state.vertexHistory.push(state.globalRotation);
    if (state.vertexHistory.length > 15) {
        state.vertexHistory.shift();
    }
}
