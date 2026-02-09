/**
 * Polygon Sound - Geometry & Collision Logic (Multi-Layer Support)
 */

import { state } from './state.js';
import { playNote } from './audio.js';
import { LINEAR_NOTES, CIRCLE_NOTES } from './constants.js';

export function updateGeometry() {
    const prevRot = state.rotation;
    state.rotation = (state.rotation + state.speed) % 360;

    // Decay piano keys
    for (let i = 0; i < 12; i++) {
        state.activeKeys[i] = Math.max(0, state.activeKeys[i] - 0.05);
    }
    state.shake = Math.max(0, state.shake - 0.5);

    // 모든 레이어에 대해 검사
    state.layers.forEach((layer) => {
        for (let s = 0; s < layer.sides; s++) {
            const offset = (s * 360) / layer.sides;
            const currentVertexAngle = (state.rotation + offset) % 360;
            const prevVertexAngle = (prevRot + offset) % 360;

            for (let n = 0; n < 12; n++) {
                const targetAngle = (n * 30) % 360;
                
                if (hasCrossed(prevVertexAngle, currentVertexAngle, targetAngle)) {
                    triggerHit(n, targetAngle, layer.color);
                }
            }
        }
    });
}

function hasCrossed(prev, curr, target) {
    if (prev <= target && curr >= target) return true;
    if (prev > curr && (target >= prev || target <= curr)) return true;
    return false;
}

function triggerHit(noteIndex, angle, color) {
    const noteName = CIRCLE_NOTES[noteIndex];
    playNote(noteName);
    
    state.activeKeys[LINEAR_NOTES.indexOf(noteName)] = 1.0;
    state.lastHitNote = noteName;

    createParticles(angle, color);
}

function createParticles(angle, color) {
    const rad = (angle - 90) * (Math.PI / 180);
    const centerX = 250; 
    const centerY = 220; 
    const radius = 140;

    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);

    for (let i = 0; i < 8; i++) {
        state.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1.0,
            color: color
        });
    }
}
