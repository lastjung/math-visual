/**
 * Polygon Sound - Unified Layout Renderer
 * Compatible with math-sound structural classes.
 */

import { state } from './state.js';
import { CIRCLE_NOTES, LINEAR_NOTES, NOTE_COLORS } from './constants.js';

const RADIUS = 180;
let CENTER = { x: 250, y: 250 };

export function initRenderer() {
    const canvas = document.getElementById('mainCanvas');
    const wrapper = canvas.parentElement;
    
    // Set internal resolution based on CSS size (Math-sound strategy)
    const size = wrapper.clientWidth || 500;
    canvas.width = size * state.pixelRatio;
    canvas.height = size * state.pixelRatio;
    
    CENTER = { x: size / 2, y: size / 2 };
    
    state.ctx = canvas.getContext('2d');
    state.ctx.scale(state.pixelRatio, state.pixelRatio);

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
        tab.textContent = `LAYER ${idx + 1}`;
        tab.onclick = () => {
            state.activeLayerIndex = idx;
            renderLayerControls();
        };
        layerContainer.appendChild(tab);
    });

    // +, - 버튼 컨테이너
    const actionGroup = document.createElement('div');
    actionGroup.className = 'flex gap-2 ml-2';

    // 레이어 추가 (+)
    if (state.layers.length < 4) {
        const addBtn = document.createElement('button');
        addBtn.className = 'layer-tab';
        addBtn.innerHTML = '+';
        addBtn.onclick = addLayer;
        actionGroup.appendChild(addBtn);
    }

    // 레이어 삭제 (-)
    if (state.layers.length > 1) {
        const subBtn = document.createElement('button');
        subBtn.className = 'layer-tab';
        subBtn.innerHTML = '-';
        subBtn.onclick = removeLastLayer;
        actionGroup.appendChild(subBtn);
    }

    layerContainer.appendChild(actionGroup);

    // Update Detail Setting Row selectors for Active Layer
    const currentLayer = state.layers[state.activeLayerIndex];
    renderSidesSelector(currentLayer);
    renderSkipButtons(currentLayer);
    
    // Update Info Text on Canvas
    document.getElementById('infoText').textContent = `LAYER ${state.activeLayerIndex + 1}: ${currentLayer.sides}-FOLD`;
}

function renderSidesSelector(layer) {
    const container = document.getElementById('sidesSelector');
    container.innerHTML = '';
    [3, 4, 5, 6, 7, 8, 12].forEach(n => {
        const btn = document.createElement('button');
        btn.className = `sel-btn ${layer.sides === n ? 'active' : ''}`;
        btn.textContent = `${n}V`;
        btn.onclick = () => {
            layer.sides = n;
            renderLayerControls();
        };
        container.appendChild(btn);
    });
}

function renderSkipButtons(layer) {
    const container = document.getElementById('skipSelector');
    container.innerHTML = '';
    [1, 2, 3, 4, 5].forEach(s => {
        const disabled = s >= layer.sides / 2 && s !== 1;
        if (disabled) return;
        
        const btn = document.createElement('button');
        btn.className = `sel-btn ${layer.skip === s ? 'active' : ''}`;
        btn.textContent = `SKIP ${s}`;
        btn.onclick = () => {
            layer.skip = s;
            renderLayerControls();
        };
        container.appendChild(btn);
    });
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
        skip: 1,
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
    
    const size = 520; 

    // Clear with slight trail
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; 
    ctx.fillRect(0, 0, size, size);

    // Draw Main Frame Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Static Note Points (Subtle)
    CIRCLE_NOTES.forEach((note, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = CENTER.x + RADIUS * Math.cos(angle);
        const y = CENTER.y + RADIUS * Math.sin(angle);
        const intensity = state.activeKeys[LINEAR_NOTES.indexOf(note)];
        const color = NOTE_COLORS[note];

        if (intensity > 0) {
            ctx.fillStyle = color;
            ctx.globalAlpha = intensity;
            ctx.beginPath(); ctx.arc(x, y, 5 * intensity + 3, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = intensity > 0.1 ? '#fff' : 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // Draw Rotating Polygons
    state.layers.forEach((layer, idx) => {
        ctx.save();
        ctx.translate(CENTER.x, CENTER.y);
        ctx.rotate((state.rotation - 90) * (Math.PI / 180));
        
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = state.activeLayerIndex === idx ? 2.5 : 1;
        ctx.globalAlpha = state.activeLayerIndex === idx ? 0.9 : 0.2; 
        
        ctx.beginPath();
        const step = (360 / layer.sides) * layer.skip;
        for (let i = 0; i <= layer.sides; i++) {
            const rad = (i * step) * (Math.PI / 180);
            const px = RADIUS * Math.cos(rad);
            const py = RADIUS * Math.sin(rad);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
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
    // 1. Current Note Banner
    if (state.lastHitNote) {
        const noteEl = document.getElementById('currentNote');
        noteEl.textContent = state.lastHitNote;
        noteEl.style.color = NOTE_COLORS[state.lastHitNote];
        noteEl.style.textShadow = `0 0 20px ${NOTE_COLORS[state.lastHitNote]}AA`;
    }

    // 2. Piano Keys Animation
    LINEAR_NOTES.forEach((note, i) => {
        const key = document.getElementById(`key-${note}`);
        const intensity = state.activeKeys[i];
        if (intensity > 0) {
            key.style.backgroundColor = NOTE_COLORS[note];
            key.className = 'piano-key active';
        } else {
            key.style.backgroundColor = '';
            const isBlack = note.includes('b');
            key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
        }
    });

    // 3. Speed slider value
    document.getElementById('speedValue').textContent = `${state.speed.toFixed(1)}x`;
}
