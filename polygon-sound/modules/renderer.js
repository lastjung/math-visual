/**
 * Polygon Sound - Unified Layout Renderer
 * Compatible with math-sound structural classes.
 */

import { state } from './state.js';
import { CIRCLE_NOTES, LINEAR_NOTES, NOTE_COLORS, SCALES, DEFAULT_SCALE } from './constants.js';

export function initRenderer() {
    const canvas = document.getElementById('mainCanvas');
    
    const updateSize = () => {
        const wrapper = canvas.parentElement;
        const size = wrapper.clientWidth || 500;
        
        state.canvasSize = size;
        canvas.width = size * state.pixelRatio;
        canvas.height = size * state.pixelRatio;
        
        state.center = { x: size / 2, y: size / 2 };
        // Increase RADIUS to 90% of the half-size (240px if size is 520px)
        state.radius = (size / 2) * 0.92;
        
        if (state.ctx) {
            state.ctx.setTransform(1, 0, 0, 1, 0, 0);
            state.ctx.scale(state.pixelRatio, state.pixelRatio);
        }
    };

    state.ctx = canvas.getContext('2d');
    updateSize();
    window.addEventListener('resize', updateSize);

    renderPiano();
    renderLayerControls();
}

/**
 * 1. Render minimalist piano in the formula space
 */
function renderPiano() {
    const container = document.getElementById('pianoContainer');
    container.innerHTML = '';
    
    LINEAR_NOTES.forEach((note) => {
        const isBlack = note.includes('b');
        const key = document.createElement('div');
        key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
        key.id = `key-${note}`;
        
        // Add note label inside the key
        const label = document.createElement('span');
        label.className = 'key-label';
        label.textContent = note;
        key.appendChild(label);
        
        container.appendChild(key);
    });
}

/**
 * 2. Render Layer Tabs (Category Tab Style)
 */
export function renderLayerControls() {
    const layerContainer = document.getElementById('layerSelector');
    layerContainer.innerHTML = '';
    // 레이어 탭/버튼 생성
    state.layers.forEach((layer, idx) => {
        const tab = document.createElement('button');
        tab.className = `layer-tab ${state.activeLayerIndex === idx ? 'active' : ''}`;
        tab.style.borderBottom = `3px solid ${layer.color}`;
        tab.textContent = `L-${idx + 1}`;
        tab.onclick = () => {
            state.activeLayerIndex = idx;
            renderLayerControls();
        };
        layerContainer.appendChild(tab);
    });

    // Add/Remove Buttons directly
    if (state.layers.length < 4) {
        const addBtn = document.createElement('button');
        addBtn.className = 'layer-tab';
        addBtn.innerHTML = '+';
        addBtn.onclick = addLayer;
        layerContainer.appendChild(addBtn);
    }

    if (state.layers.length > 1) {
        const subBtn = document.createElement('button');
        subBtn.className = 'layer-tab';
        subBtn.innerHTML = '-';
        subBtn.onclick = removeLastLayer;
        layerContainer.appendChild(subBtn);
    }
    const currentLayer = state.layers[state.activeLayerIndex];
    renderSidesSelector(currentLayer);
    
    // Update Info Text on Canvas (Right side)
    document.getElementById('infoText').textContent = `L-${state.activeLayerIndex + 1}`;
}

function renderSidesSelector(layer) {
    const container = document.getElementById('sidesSelector');
    container.innerHTML = '';
    
    // Default Buttons (3V ~ 12V)
    [3, 4, 5, 6, 7, 8, 12].forEach(n => {
        const btn = document.createElement('button');
        btn.className = `sel-btn ${layer.sides === n && !layer.customVertices ? 'active' : ''}`;
        btn.textContent = `${n}V`;
        btn.onclick = () => {
            layer.sides = n;
            layer.customVertices = null; // Reset to normal mode
            renderLayerControls();
        };
        container.appendChild(btn);
    });

    // --- Custom Generator (Added next to 12V) ---
    const genGroup = document.createElement('div');
    genGroup.className = 'gen-group';
    
    const genBtn = document.createElement('button');
    genBtn.className = `sel-btn gen-btn ${layer.customVertices ? 'active' : ''}`;
    genBtn.textContent = 'Gen';
    
    const select = document.createElement('select');
    select.id = 'customSidesSelect';
    select.className = 'gen-select';
    for (let i = 2; i <= 12; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        if (i === layer.genValue) opt.selected = true;
        select.appendChild(opt);
    }

    genBtn.onclick = () => {
        const step = parseInt(select.value);
        layer.genValue = step;
        
        // --- The "MOD 12 == 0" STOP LOOP ---
        let current = 0;
        const vertices = [];
        do {
            vertices.push(current);
            current = (current + step) % 12;
        } while (current !== 0);
        
        layer.customVertices = vertices;
        renderLayerControls();
    };

    genGroup.appendChild(genBtn);
    genGroup.appendChild(select);
    container.appendChild(genGroup);
}

function removeLastLayer() {
    state.layers.pop();
    if (state.activeLayerIndex >= state.layers.length) {
        state.activeLayerIndex = state.layers.length - 1;
    }
    renderLayerControls();
}

function addLayer() {
    const colors = ['#ff7675', '#54a0ff', '#5f27cd', '#ff9f43'];
    state.layers.push({
        sides: 3,
        genValue: 1,
        customVertices: null,
        color: colors[state.layers.length] || '#fff',
        rotationOffset: 0
    });
    state.activeLayerIndex = state.layers.length - 1;
    renderLayerControls();
}

/**
 * 3. Main Animation Render Loop
 */
export function render() {
    const ctx = state.ctx;
    if (!ctx) return;
    
    const size = state.canvasSize; 
    const center = state.center;
    const radius = state.radius;

    // Clear with slight trail
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; 
    ctx.fillRect(0, 0, size, size);

    // Draw Main Frame Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Static Note Points (Subtle)
    CIRCLE_NOTES.forEach((note, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle);
        const intensity = state.activeKeys[LINEAR_NOTES.indexOf(note)];
        const color = NOTE_COLORS[note];

        const scaleName = state.currentScale || DEFAULT_SCALE;
        const scaleNotes = SCALES[scaleName] || SCALES[DEFAULT_SCALE];
        const isScaleNote = scaleNotes.includes(note);

        let baseRadius = 2.5;
        let baseAlpha = 0.1;

        if (!isScaleNote) {
            // Muted notes: Dimmed
            baseAlpha = 0.02;
            baseRadius = 1.5;
        } else {
            // Active scale notes: Highlighted Ring
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            
            // Slightly boost base visibility
            baseAlpha = 0.3;
        }

        if (intensity > 0) {
            ctx.fillStyle = color;
            ctx.globalAlpha = intensity;
            ctx.beginPath(); ctx.arc(x, y, 5 * intensity + 3, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = intensity > 0.1 ? '#fff' : `rgba(255,255,255,${baseAlpha})`;
        ctx.beginPath(); ctx.arc(x, y, baseRadius, 0, Math.PI * 2); ctx.fill();
    });

    // Draw Rotating Polygons
    state.layers.forEach((layer, idx) => {
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate((state.rotation - 90) * (Math.PI / 180));
        
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = state.activeLayerIndex === idx ? 2.5 : 1;
        ctx.globalAlpha = state.activeLayerIndex === idx ? 0.9 : 0.2; 
        
        ctx.beginPath();

        if (layer.customVertices) {
            // --- Custom Mode: Use generated indices ---
            if (layer.customVertices.length === 1) {
                // Special Case: 12-GON (Line from Center)
                const rad = (layer.customVertices[0] * 30) * (Math.PI / 180);
                const px = radius * Math.cos(rad);
                const py = radius * Math.sin(rad);
                ctx.moveTo(0, 0); // Start from Center
                ctx.lineTo(px, py);
            } else {
                layer.customVertices.forEach((vIdx, i) => {
                    const rad = (vIdx * 30) * (Math.PI / 180);
                    const px = radius * Math.cos(rad);
                    const py = radius * Math.sin(rad);
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                });
                // Close shape
                const startRad = (layer.customVertices[0] * 30) * (Math.PI / 180);
                ctx.lineTo(radius * Math.cos(startRad), radius * Math.sin(startRad));
            }
        } else {
            // --- Standard Mode: Pure Regular Polygons ---
            const step = (360 / layer.sides);
            for (let i = 0; i <= layer.sides; i++) {
                const rad = (i * step) * (Math.PI / 180);
                const px = radius * Math.cos(rad);
                const py = radius * Math.sin(rad);
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
        }
        ctx.stroke();
        ctx.restore();
    });

    // Handle Particles
    state.particles = state.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.04;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        return p.life > 0;
    });

    updateUI_Dynamic();
}

function updateUI_Dynamic() {
    const activeIdx = state.activeLayerIndex;
    const layer = state.layers[activeIdx];
    if (!layer) return;

    // 1. Main Banner - Polygon Name (instead of hit note)
    const bannerEl = document.getElementById('currentNote');
    
    // Naming Logic
    let name = '';
    if (layer.customVertices) {
        const step = layer.genValue;
        const count = layer.customVertices.length;
        
        // GCD check for Star (If step and 12 are coprime, it's a 12-point star)
        const gcd = (a, b) => b ? gcd(b, a % b) : a;
        if (count === 12 && gcd(12, step) === 1) {
            name = `${step}-STAR`;
        } else {
            name = `${count}-GON`;
        }
    } else {
        const names = { 3: 'TRIANGLE', 4: 'SQUARE', 5: 'PENTAGON', 6: 'HEXAGON' };
        name = names[layer.sides] || `${layer.sides}-GON`;
    }

    bannerEl.textContent = name;
    bannerEl.style.color = layer.color;
    bannerEl.style.textShadow = `0 0 10px ${layer.color}66`; // Shadow reduced for less distraction

    // 2. Piano Keys Animation
    LINEAR_NOTES.forEach((note, i) => {
        const key = document.getElementById(`key-${note}`);
        const intensity = state.activeKeys[i];
        if (intensity > 0) {
            key.style.backgroundColor = NOTE_COLORS[note];
            key.classList.add('active');
        } else {
            key.style.backgroundColor = '';
            key.classList.remove('active');
        }
    });

    // 3. Speed slider value
    document.getElementById('speedValue').textContent = `${state.speed.toFixed(1)}x`;
}
