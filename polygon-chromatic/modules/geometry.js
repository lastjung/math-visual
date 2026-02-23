/**
 * Polygon Sound - Geometry & Collision Logic (Multi-Layer Support)
 */

import { state } from './state.js';
import { playNote } from './audio.js';
import { LINEAR_NOTES, CIRCLE_NOTES, SCALES, DEFAULT_SCALE, CHORDS } from './constants.js';

export function updateGeometry() {
    const prevRot = state.rotation;
    // 시계/반시계 방향 모두 대응하는 회전 업데이트
    state.rotation = (state.rotation + state.speed + 360) % 360;

    // Decay piano keys
    for (let i = 0; i < 12; i++) {
        state.activeKeys[i] = Math.max(0, state.activeKeys[i] - 0.05);
    }
    state.shake = Math.max(0, state.shake - 0.5);

    // Ensure chord shape is applied when playing
    if (state.lastChordApplied !== state.currentChord) {
        applyChordShape();
        state.lastChordApplied = state.currentChord;
    }

    // 모든 레이어에 대해 검사
    state.layers.forEach((layer) => {
        if (layer.customVertices) {
            // --- Custom Mode Collision ---
            layer.customVertices.forEach((vIdx) => {
                const offset = vIdx * 30; // Index (0~11) to Angle
                const currentVertexAngle = (state.rotation + offset) % 360;
                const prevVertexAngle = (prevRot + offset) % 360;

                for (let n = 0; n < 12; n++) {
                    const targetAngle = (n * 30) % 360;
                    if (hasCrossed(prevVertexAngle, currentVertexAngle, targetAngle)) {
                        triggerHit(n, targetAngle, layer.color);
                    }
                }
            });
        } else {
            // --- Standard Mode Collision ---
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
        }
    });

    // 0도 지점(마디)을 지날 때 코드 변경
    if (state.speed > 0) {
        if (prevRot > state.rotation) advanceChord(1);
    } else if (state.speed < 0) {
        if (prevRot < state.rotation) advanceChord(-1);
    }
}

function hasCrossed(prev, curr, target) {
    if (state.speed >= 0) {
        // 시계 방향: prev <= target < curr
        if (prev <= target && curr >= target) return true;
        if (prev > curr && (target >= prev || target <= curr)) return true;
    } else {
        // 반시계 방향: curr < target <= prev
        if (prev >= target && curr <= target) return true;
        if (prev < curr && (target <= prev || target >= curr)) return true;
    }
    return false;
}

function triggerHit(noteIndex, angle, color) {
    const noteName = CIRCLE_NOTES[noteIndex];
    
    const scaleName = state.currentScale || DEFAULT_SCALE;
    const scaleNotes = SCALES[scaleName] || SCALES[DEFAULT_SCALE];
    const chordNotes = CHORDS[state.currentChord] || [];
    if (chordNotes.includes(noteName) || scaleNotes.includes(noteName)) {
        playNote(noteName);
    }
    
    state.activeKeys[LINEAR_NOTES.indexOf(noteName)] = 1.0;
    state.lastHitNote = noteName;

    createParticles(angle, color);
}

function advanceChord(direction = 1) {
    if (!state.chordProgression || state.chordProgression.length === 0) return;
    
    // 방향에 따른 인덱스 변경 (양수: 다음, 음수: 이전)
    state.chordIndex = (state.chordIndex + direction + state.chordProgression.length) % state.chordProgression.length;
    state.currentChord = state.chordProgression[state.chordIndex];
    applyChordShape();
}

function applyChordShape() {
    if (!state.currentChord) return;
    const chordNotes = CHORDS[state.currentChord] || [];
    const vertices = chordNotes
        .map(note => CIRCLE_NOTES.indexOf(note))
        .filter(idx => idx >= 0);

    const layer = state.layers[state.activeLayerIndex];
    if (layer && vertices.length > 0) {
        layer.customVertices = vertices;
    }
}

function createParticles(angle, color) {
    const rad = (angle - 90) * (Math.PI / 180);
    const center = state.center;
    const radius = state.radius;

    const x = center.x + radius * Math.cos(rad);
    const y = center.y + radius * Math.sin(rad);

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
