/**
 * Polygon Harmonic - Visual Engine (YouTube Match + Direction Arrow)
 */

import { state } from './state.js';
import { POLYGONS, CIRCLE_NOTES, NOTE_COLORS, CHROMATIC_NOTES } from './constants.js';

export function initRenderer() {
    state.canvas = document.getElementById('mainCanvas');
    state.ctx = state.canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    
    renderPiano();
}

function resize() {
    const container = document.getElementById('visualContainer');
    if (!container) return;
    state.width = container.clientWidth;
    state.height = container.clientHeight;
    state.canvas.width = state.width;
    state.canvas.height = state.height;
}

export function render() {
    const { ctx, width, height } = state;
    
    // Clear background
    ctx.clearRect(0, 0, width, height);
    
    // Process new collisions for simple FX
    processHitQueue();

    // Render single centered circle & polygon
    renderSolo();
    
    // Render VFX
    renderVFX();
    
    // Update piano active states
    updatePianoUI();
}

function processHitQueue() {
    if (!state.hitQueue || state.hitQueue.length === 0) return;
    const { width, height } = state;
    
    state.hitQueue.forEach(hit => {
        const cx = width / 2; 
        const cy = height / 2; 
        const r = Math.min(width, height) * 0.38; 
        const color = NOTE_COLORS[hit.noteName];
        
        // Target vertex coordinates
        const vRad = (hit.currentAngle - 90) * (Math.PI / 180);
        const vx = cx + r * Math.cos(vRad);
        const vy = cy + r * Math.sin(vRad);

        // Simple Ripple
        state.ripples.push({
            x: vx, y: vy, color: color, life: 1.0, maxRadius: 40
        });
    });
    
    state.hitQueue = [];
}

function renderVFX() {
    const { ctx } = state;

    // Circular Ripples
    state.ripples.forEach(r => {
        ctx.beginPath();
        const currentRadius = r.maxRadius * (1 - r.life);
        ctx.arc(r.x, r.y, currentRadius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3 * r.life;
        ctx.globalAlpha = r.life * 0.8;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    });
}

function renderSolo() {
    const { ctx, width, height } = state;
    const cx = width / 2; 
    const cy = height / 2;
    const r = Math.min(width, height) * 0.38; // Give room for text
    
    drawCircleBase(cx, cy, r);
    drawDirectionArrow(cx, cy); // User requested direction arrow
    drawPolygon(cx, cy, r, POLYGONS[state.soloIndex], state.globalRotation);
}

function drawCircleBase(cx, cy, r) {
    const { ctx } = state;
    
    // Main ring
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const nx = cx + r * Math.cos(angle); 
        const ny = cy + r * Math.sin(angle);
        const active = state.activeNotes[i];
        const noteName = CIRCLE_NOTES[i];
        const color = NOTE_COLORS[noteName];
        
        // Note Dot
        ctx.beginPath(); ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.fillStyle = active > 0 ? color : '#fff';
        ctx.fill();

        // Label
        ctx.fillStyle = active > 0 ? color : '#fff';
        ctx.font = active > 0 ? 'bold 24px Inter' : '20px Inter';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        
        // Push text outside
        const lx = cx + (r + 40) * Math.cos(angle);
        const ly = cy + (r + 40) * Math.sin(angle);
        
        if (active > 0) {
            ctx.shadowBlur = 15; ctx.shadowColor = color;
        }
        ctx.fillText(noteName, lx, ly);
        ctx.shadowBlur = 0;
    }
}

function drawDirectionArrow(cx, cy) {
    const { ctx } = state;
    if (!state.isPlaying) return; // Only show while running

    ctx.save();
    ctx.translate(cx, cy);
    if(state.direction < 0) ctx.scale(-1, 1); // Flip CCW
    
    // 1. Draw arc
    ctx.beginPath();
    ctx.arc(0, 0, 35, -Math.PI/2, Math.PI/2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Draw Arrowhead at the bottom (PI/2)
    ctx.beginPath();
    ctx.moveTo(-10, 25);
    ctx.lineTo(0, 35);
    ctx.lineTo(-10, 45);
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.restore();
}

function drawPolygon(cx, cy, r, sides, rotation) {
    const { ctx } = state;
    
    // The YouTube video uses RED for the polygon lines.
    const baseColor = '#ff2a2a'; 

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (rotation + (i * 360) / sides - 90) * (Math.PI / 180);
        const x = cx + r * Math.cos(angle); 
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = baseColor; ctx.lineWidth = 4; ctx.stroke();

    // Vertices (small dots)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < sides; i++) {
        const angle = (rotation + (i * 360) / sides - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 5, 0, Math.PI*2);
        ctx.fill();
    }
}

// Generate Piano exactly like standard keys
function renderPiano() {
    const container = document.getElementById('piano');
    if (!container) return;
    container.innerHTML = '';
    
    // Standard white/black structure for an octave (C to B)
    // C, C# (Db), D, Eb, E, F, Gb, G, Ab, A, Bb, B 
    const isBlack = [false, true, false, true, false, false, true, false, true, false, true, false];
    
    let whiteIndex = 0;
    CHROMATIC_NOTES.forEach((note, index) => {
        const key = document.createElement('div');
        key.dataset.note = note;
        
        if (isBlack[index]) {
            key.className = 'key black';
            key.style.left = `calc(${(whiteIndex) * (100 / 7)}% - 13px)`;
            key.innerHTML = `<span>${note}</span>`;
            container.appendChild(key);
        } else {
            key.className = 'key white';
            key.style.left = `${whiteIndex * (100 / 7)}%`;
            key.style.width = `calc(100% / 7)`;
            key.innerHTML = `<span>${note}</span>`;
            container.appendChild(key);
            whiteIndex++;
        }
    });
}

function updatePianoUI() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const note = key.dataset.note;
        const circleIdx = CIRCLE_NOTES.indexOf(note);
        if (circleIdx !== -1 && state.activeNotes[circleIdx] > 0) {
            const intensity = state.activeNotes[circleIdx];
            const color = NOTE_COLORS[note];
            
            // Highlight
            key.style.backgroundColor = color;
            key.style.boxShadow = `0 0 ${20 * intensity}px ${color}`;
            if (key.classList.contains('white')) {
                key.style.color = '#fff';
            }
        } else {
            // Revert
            key.style.backgroundColor = '';
            key.style.boxShadow = '';
            if (key.classList.contains('white')) {
                key.style.color = '#333';
            }
        }
    });
}
