/**
 * Polygon Harmonic - Visual Engine (YouTube Match + Direction Arrow)
 */

import { state } from './state.js';
import { POLYGONS, CIRCLE_NOTES, NOTE_COLORS, CHROMATIC_NOTES, getPolygonColor } from './constants.js';
import { TIMELINES } from './timeline.js';
import { triggerDrawHit } from './geometry.js';

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
    // drawDirectionArrow(cx, cy); // Removed as per user feedback: "센터에 잇는 표시 이상하다"
    
    if (state.soloIndex >= 0) {
        drawPolygon(cx, cy, r, POLYGONS[state.soloIndex], state.globalRotation);
    } else {
        drawIntroPolygons(cx, cy, r);
    }
}

function drawIntroPolygons(cx, cy, r) {
    const { ctx, globalTime } = state;
    // Just draw a few rotating layered polygons for aesthetic Intro
    const introSides = [3, 4, 5];
    introSides.forEach((sides, idx) => {
        ctx.beginPath();
        const rot = globalTime * 30 * (idx % 2 === 0 ? 1 : -1) + idx * 45;
        for (let i = 0; i < sides; i++) {
            const angle = (rot + (i * 360) / sides - 90) * (Math.PI / 180);
            const x = cx + r * Math.cos(angle); 
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${idx * 120}, 70%, 60%, 0.5)`; 
        ctx.lineWidth = 2; 
        ctx.stroke();
    });
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
        
        const annoHighlight = state.annotationHighlights[noteName];
        const isAnnoHighlight = !!annoHighlight;
        const currentFillStyle = isAnnoHighlight ? annoHighlight.color : (active > 0 ? color : '#fff');

        // Note Dot
        ctx.beginPath(); ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.fillStyle = currentFillStyle;
        ctx.fill();

        // Label
        ctx.fillStyle = currentFillStyle;
        ctx.font = (isAnnoHighlight || active > 0) ? 'bold 24px Inter' : '20px Inter';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        
        // Push text outside
        const lx = cx + (r + 40) * Math.cos(angle);
        const ly = cy + (r + 40) * Math.sin(angle);
        
        if (isAnnoHighlight || active > 0) {
            ctx.shadowBlur = 15; ctx.shadowColor = currentFillStyle;
        }
        ctx.fillText(noteName, lx, ly);
        ctx.shadowBlur = 0;
        
        // Draw Annotation Sub-label (like "# 5th")
        if (isAnnoHighlight && annoHighlight.label) {
            ctx.fillStyle = annoHighlight.color;
            ctx.font = '16px Inter';
            const annox = cx + (r + 75) * Math.cos(angle);
            const annoy = cy + (r + 75) * Math.sin(angle);
            ctx.fillText(annoHighlight.label, annox, annoy);
        }
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
    const { ctx, globalTime, soloIndex } = state;
    const baseColor = getPolygonColor(sides); 
    
    // Sync to exact 100% timeline (e.g., waiting 7 seconds at Triangle)
    const section = TIMELINES.find(t => t.index === soloIndex);
    const drawStartTime = (section?.startSec || 0) + (section?.drawStartOffset || 0);

    const elapsed = globalTime - drawStartTime;

    // Reset drawn segment tracker when polygon changes or playback skips backwards
    if (state.lastDrawSoloIndex !== soloIndex || elapsed < 0) {
        state.lastDrawnSegment = -1;
        state.lastDrawSoloIndex = soloIndex;
    }

    if (elapsed < 0) return; // Do not draw before perfectly timed draw offset

    const drawDuration = 2.0; // Draw over 2 seconds
    const progress = Math.min(1.0, elapsed / drawDuration);

    const totalSegments = sides;
    const currentSegment = Math.floor(progress * totalSegments);

    // Play drawing sound sequentially when new vertices are hit
    while (state.lastDrawnSegment < currentSegment && state.lastDrawnSegment < sides - 1) {
        state.lastDrawnSegment++;
        triggerDrawHit(sides, state.lastDrawnSegment, rotation);
    }

    if (progress <= 0) return;

    const segmentProgress = (progress * totalSegments) - currentSegment;

    ctx.beginPath();
    for (let i = 0; i <= currentSegment; i++) {
        const angle = (rotation + (i * 360) / sides - 90) * (Math.PI / 180);
        const x = cx + r * Math.cos(angle); 
        const y = cy + r * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else if (i < currentSegment) {
            ctx.lineTo(x, y);
        } else if (i === currentSegment && segmentProgress > 0) {
            const prevAngle = (rotation + ((i - 1) * 360) / sides - 90) * (Math.PI / 180);
            const px = cx + r * Math.cos(prevAngle);
            const py = cy + r * Math.sin(prevAngle);
            const endX = px + (x - px) * segmentProgress;
            const endY = py + (y - py) * segmentProgress;
            ctx.lineTo(endX, endY);
        } else if (i === currentSegment && currentSegment === totalSegments) {
            ctx.lineTo(x, y);
        }
    }
    
    if (progress >= 1.0) {
        ctx.closePath();
    }
    
    ctx.strokeStyle = baseColor; 
    ctx.lineWidth = 4; 
    ctx.stroke();

    // Vertices (small dots)
    ctx.fillStyle = '#fff';
    for (let i = 0; i < sides; i++) {
        if (progress * sides >= i) {
            const angle = (rotation + (i * 360) / sides - 90) * (Math.PI / 180);
            ctx.beginPath();
            ctx.arc(cx + r * Math.cos(angle), cy + r * Math.sin(angle), 5, 0, Math.PI*2);
            ctx.fill();
        }
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
        const annoHighlight = state.annotationHighlights[note];
        
        if (annoHighlight) {
            // Priority: Annotation Highlight
            const color = annoHighlight.color;
            key.style.backgroundColor = color;
            key.style.boxShadow = `0 0 20px ${color}`;
            if (key.classList.contains('white')) {
                key.style.color = '#fff';
            }
        } else if (circleIdx !== -1 && state.activeNotes[circleIdx] > 0) {
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
