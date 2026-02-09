/**
 * Polygon Sound - Canvas & UI Renderer (Multi-Layer & Trail Effect)
 */

import { state } from './state.js';
import { CIRCLE_NOTES, LINEAR_NOTES, NOTE_COLORS } from './constants.js';

const RADIUS = 180;
const CENTER = { x: 250, y: 220 };

export function initRenderer() {
    const canvas = document.getElementById('mainCanvas');
    canvas.width = 500 * state.pixelRatio;
    canvas.height = 450 * state.pixelRatio;
    state.ctx = canvas.getContext('2d');
    state.ctx.scale(state.pixelRatio, state.pixelRatio);

    renderPiano();
    renderLayerControls();
}

function renderPiano() {
    const container = document.getElementById('pianoContainer');
    container.innerHTML = '';
    
    LINEAR_NOTES.forEach((note, i) => {
        const isBlack = note.includes('b');
        const key = document.createElement('div');
        key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
        key.id = `key-${note}`;
        
        const label = document.createElement('span');
        label.className = 'note-label';
        label.textContent = note;
        
        key.appendChild(label);
        container.appendChild(key);
    });
}

/**
 * 레이어 관리 UI 렌더링
 */
export function renderLayerControls() {
    const sidesContainer = document.getElementById('sidesSelector');
    sidesContainer.innerHTML = '';
    
    // 레이어 탭/버튼 생성
    state.layers.forEach((layer, idx) => {
        const group = document.createElement('div');
        group.className = `flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${state.activeLayerIndex === idx ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-transparent'}`;
        group.onclick = () => { state.activeLayerIndex = idx; renderLayerControls(); };

        const btn = document.createElement('div');
        btn.className = 'w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm';
        btn.style.backgroundColor = layer.color;
        btn.style.color = '#fff';
        btn.textContent = layer.sides;
        
        const label = document.createElement('span');
        label.className = 'text-[9px] font-bold text-slate-500 uppercase';
        label.textContent = `L${idx + 1}`;

        group.appendChild(btn);
        group.appendChild(label);
        sidesContainer.appendChild(group);
    });

    // 레이어 추가 버튼
    if (state.layers.length < 4) {
        const addBtn = document.createElement('button');
        addBtn.className = 'w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-all';
        addBtn.innerHTML = '<i data-lucide="plus" class="w-5 h-5"></i>';
        addBtn.onclick = (e) => {
            e.stopPropagation();
            addLayer();
        };
        sidesContainer.appendChild(addBtn);
        lucide.createIcons();
    }

    // 현재 선택된 레이어의 상세 설정 업데이트
    const currentLayer = state.layers[state.activeLayerIndex];
    document.getElementById('sidesValue').textContent = currentLayer.sides;
    document.getElementById('skipValue').textContent = currentLayer.skip;
    
    // Star Type 버튼 업데이트
    renderSkipButtons(currentLayer);
}

function renderSkipButtons(layer) {
    const skipContainer = document.getElementById('skipSelector');
    skipContainer.innerHTML = '';
    [1, 2, 3, 4, 5].forEach(s => {
        const disabled = s >= layer.sides / 2 && s !== 1;
        const btn = document.createElement('button');
        btn.disabled = disabled;
        btn.className = `w-10 h-10 rounded-xl text-xs font-black transition-all ${disabled ? 'opacity-10' : (layer.skip === s ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500')}`;
        btn.textContent = s;
        btn.onclick = () => {
            layer.skip = s;
            renderLayerControls();
        };
        skipContainer.appendChild(btn);
    });
}

function addLayer() {
    const colors = ['#ff7675', '#54a0ff', '#5f27cd', '#ff9f43'];
    const nextSides = [3, 4, 5, 6][state.layers.length] || 3;
    state.layers.push({
        sides: nextSides,
        skip: 1,
        color: colors[state.layers.length] || '#fff',
        rotationOffset: 0
    });
    state.activeLayerIndex = state.layers.length - 1;
    renderLayerControls();
}

export function render() {
    const ctx = state.ctx;
    const width = 500;
    const height = 450;

    // 1. Trail Effect (Fade instead of clear)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // 2. Main Circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Note Points
    CIRCLE_NOTES.forEach((note, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = CENTER.x + RADIUS * Math.cos(angle);
        const y = CENTER.y + RADIUS * Math.sin(angle);
        const intensity = state.activeKeys[LINEAR_NOTES.indexOf(note)];
        const color = NOTE_COLORS[note];

        if (intensity > 0) {
            ctx.fillStyle = color;
            ctx.globalAlpha = intensity;
            ctx.beginPath(); ctx.arc(x, y, 4 + intensity * 4, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = intensity > 0.2 ? '#fff' : 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
    });

    // 4. Multiple Rotating Polygons
    state.layers.forEach((layer, idx) => {
        ctx.save();
        ctx.translate(CENTER.x, CENTER.y);
        ctx.rotate((state.rotation - 90) * (Math.PI / 180));
        
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = state.activeLayerIndex === idx ? 2 : 1; // Thinner lines
        ctx.globalAlpha = state.activeLayerIndex === idx ? 0.8 : 0.2; 
        ctx.lineJoin = 'round';
        
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

    // 5. Particles
    state.particles = state.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        return p.life > 0;
    });
    ctx.globalAlpha = 1;
    ctx.restore();

    updateUI_Dynamic();
}

function updateUI_Dynamic() {
    if (state.lastHitNote) {
        const noteEl = document.getElementById('currentNote');
        noteEl.textContent = state.lastHitNote;
        noteEl.style.color = NOTE_COLORS[state.lastHitNote];
    }

    LINEAR_NOTES.forEach((note, i) => {
        const key = document.getElementById(`key-${note}`);
        const intensity = state.activeKeys[i];
        if (intensity > 0) {
            key.style.backgroundColor = NOTE_COLORS[note];
            key.style.boxShadow = `0 10px 30px ${NOTE_COLORS[note]}44 inset`;
            key.style.transform = `translateY(${5 * intensity}px)`;
        } else {
            key.style.backgroundColor = '';
            key.style.boxShadow = '';
            key.style.transform = '';
        }
    });

    document.getElementById('speedValue').textContent = `${state.speed.toFixed(1)}x`;
}
