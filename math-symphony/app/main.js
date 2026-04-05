import { scoreCatalog } from '../catalog/index.js';
import {
    buildControllerSnapshot,
    formatControllerValue,
    getActiveScene,
    getScoreDuration
} from '../engine/controllers.js';
import { buildControllerMap, describeExpression } from '../engine/expressions.js';
import { renderScenePreview } from '../engine/renderPreview.js';
import { AudioPreviewEngine } from '../engine/audioPreview.js';

const elements = {
    scoreRail: document.getElementById('scoreRail'),
    scoreTitle: document.getElementById('scoreTitle'),
    scoreTheme: document.getElementById('scoreTheme'),
    scoreSource: document.getElementById('scoreSource'),
    scoreDuration: document.getElementById('scoreDuration'),
    scorePalette: document.getElementById('scorePalette'),
    playToggle: document.getElementById('playToggle'),
    resetTimeline: document.getElementById('resetTimeline'),
    volumeControl: document.getElementById('volumeControl'),
    volumeValue: document.getElementById('volumeValue'),
    scoreTimeline: document.getElementById('scoreTimeline'),
    timelineLabel: document.getElementById('timelineLabel'),
    previewCanvas: document.getElementById('previewCanvas'),
    sceneRail: document.getElementById('sceneRail'),
    activeSceneTitle: document.getElementById('activeSceneTitle'),
    activeSceneSummary: document.getElementById('activeSceneSummary'),
    controllersPanel: document.getElementById('controllersPanel'),
    expressionsPanel: document.getElementById('expressionsPanel')
};

const state = {
    scoreId: scoreCatalog[0]?.id ?? null,
    elapsedMs: 0,
    isPlaying: false,
    rafId: null,
    lastFrameAt: 0,
    volume: 0.68,
    expressionEnabled: {}
};

const audioEngine = new AudioPreviewEngine();

function init() {
    renderScoreRail();
    bindEvents();
    render();
}

function bindEvents() {
    elements.scoreTimeline.addEventListener('input', (event) => {
        stopPlayback({ skipRender: true });
        state.elapsedMs = Number(event.target.value);
        render();
    });

    elements.playToggle.addEventListener('click', () => {
        if (state.isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    });

    elements.resetTimeline.addEventListener('click', () => {
        stopPlayback();
        state.elapsedMs = 0;
        render();
    });

    elements.volumeControl.addEventListener('input', (event) => {
        state.volume = Number(event.target.value) / 100;
        elements.volumeValue.textContent = `${event.target.value}%`;
        audioEngine.setVolume(state.volume);
    });
}

function renderScoreRail() {
    elements.scoreRail.innerHTML = '';
    for (const score of scoreCatalog) {
        const button = document.createElement('button');
        button.className = 'score-pill';
        button.dataset.scoreId = score.id;
        button.innerHTML = `
            <span class="score-pill-number">${score.number}</span>
            <span class="score-pill-copy">
                <strong>${score.title}</strong>
                <span>${score.theme}</span>
            </span>
        `;
        button.addEventListener('click', () => {
            stopPlayback();
            state.scoreId = score.id;
            state.elapsedMs = 0;
            render();
        });
        elements.scoreRail.appendChild(button);
    }
}

function render() {
    const score = scoreCatalog.find((entry) => entry.id === state.scoreId);
    if (!score) return;

    const durationMs = getScoreDuration(score);
    if (state.elapsedMs > durationMs) state.elapsedMs = durationMs;

    const activeSceneEntry = getActiveScene(score, state.elapsedMs);
    const activeScene = score.scenes.find((scene) => scene.id === activeSceneEntry?.sceneId) || score.scenes[0];
    const visibleScene = withEnabledExpressions(score, activeScene);
    const controllerMap = buildControllerMap(score);
    const controllerSnapshot = buildControllerSnapshot(score.controllers, state.elapsedMs);
    const sceneDuration = Math.max(1, activeScene.durationMs || 1);
    const sceneElapsed = activeSceneEntry ? Math.max(0, state.elapsedMs - activeSceneEntry.startMs) : 0;
    const sceneProgress = sceneElapsed / sceneDuration;

    for (const button of elements.scoreRail.querySelectorAll('.score-pill')) {
        button.classList.toggle('active', button.dataset.scoreId === score.id);
    }

    elements.scoreTitle.textContent = score.title;
    elements.scoreTheme.textContent = score.theme;
    elements.scoreSource.href = score.sourceUrl;
    elements.scoreDuration.textContent = msToText(durationMs);

    elements.scorePalette.innerHTML = score.palette.map((swatch) => `
        <span class="palette-chip">
            <span class="palette-dot" style="background:${swatch.value}"></span>
            ${swatch.label}
        </span>
    `).join('');

    elements.scoreTimeline.max = String(durationMs);
    elements.scoreTimeline.value = String(state.elapsedMs);
    elements.timelineLabel.textContent = `${msToText(state.elapsedMs)} / ${msToText(durationMs)}`;
    elements.playToggle.textContent = state.isPlaying ? 'Pause' : 'Play';
    elements.volumeControl.value = String(Math.round(state.volume * 100));
    elements.volumeValue.textContent = `${Math.round(state.volume * 100)}%`;

    renderSceneRail(score, activeScene.id);
    renderActiveScene(activeScene);
    renderControllers(score, activeScene.activeControllers, controllerSnapshot, controllerMap);
    renderExpressions(score, activeScene, visibleScene, controllerSnapshot, controllerMap);
    renderScenePreview(elements.previewCanvas, visibleScene, controllerSnapshot);

    if (state.isPlaying) {
        audioEngine.startScene(visibleScene, controllerSnapshot).then(() => {
            audioEngine.updateScene(visibleScene, controllerSnapshot, sceneProgress);
        }).catch(() => {});
    }
}

function renderSceneRail(score, activeSceneId) {
    elements.sceneRail.innerHTML = '';
    for (const scene of score.scenes) {
        const button = document.createElement('button');
        button.className = 'scene-chip';
        button.classList.toggle('active', scene.id === activeSceneId);
        button.innerHTML = `
            <strong>${scene.title}</strong>
            <span>${msToText(scene.durationMs || 0)}</span>
        `;
        button.addEventListener('click', () => {
            stopPlayback();
            const index = score.scenes.findIndex((entry) => entry.id === scene.id);
            const offset = score.scenes.slice(0, index).reduce((sum, entry) => sum + (entry.durationMs || 0), 0);
            state.elapsedMs = offset;
            render();
        });
        elements.sceneRail.appendChild(button);
    }
}

function renderActiveScene(scene) {
    elements.activeSceneTitle.textContent = scene.title;
    elements.activeSceneSummary.textContent = scene.summary;
}

function renderControllers(score, activeKeys, snapshot, controllerMap) {
    elements.controllersPanel.innerHTML = '';
    const activeSet = new Set(activeKeys);
    for (const controller of score.controllers) {
        const value = snapshot[controller.id];
        const card = document.createElement('article');
        card.className = 'controller-card';
        card.classList.toggle('active', activeSet.has(controller.id));
        card.innerHTML = `
            <div class="controller-top">
                <span class="controller-id">${controller.label}</span>
                <span class="controller-mode">${controller.mode.replace('_', ' ')}</span>
            </div>
            <div class="controller-value">${formatControllerValue(controller, value)}</div>
            <div class="controller-range">${controller.min} to ${controller.max}</div>
        `;
        elements.controllersPanel.appendChild(card);
    }
}

function renderExpressions(score, scene, visibleScene, snapshot, controllerMap) {
    elements.expressionsPanel.innerHTML = '';
    const visibleIds = new Set(visibleScene.expressions.map((expression) => expression.id));

    for (const expression of scene.expressions) {
        const view = describeExpression(expression, snapshot, controllerMap);
        const enabled = visibleIds.has(expression.id);
        const card = document.createElement('article');
        card.className = 'expression-card';
        card.classList.toggle('muted', !enabled);
        card.innerHTML = `
            <div class="expression-meta">
                <span class="expression-type">${expression.type}</span>
                <span class="expression-name">${expression.name}</span>
                <label class="expression-toggle">
                    <input type="checkbox" ${enabled ? 'checked' : ''} data-expression-id="${expression.id}">
                    <span>${enabled ? 'on' : 'off'}</span>
                </label>
            </div>
            <div class="expression-formula">${expression.formula}</div>
            <div class="expression-params">${view.parameterSummary || 'static expression'}</div>
            ${expression.notes?.length ? `<div class="expression-notes">${expression.notes.join(' | ')}</div>` : ''}
        `;
        const checkbox = card.querySelector('input[type="checkbox"]');
        checkbox?.addEventListener('change', (event) => {
            setExpressionEnabled(score.id, scene.id, expression.id, event.target.checked);
            render();
        });
        elements.expressionsPanel.appendChild(card);
    }
}

function withEnabledExpressions(score, scene) {
    const disabled = state.expressionEnabled[sceneStateKey(score.id, scene.id)] || {};
    const expressions = scene.expressions.filter((expression) => disabled[expression.id] !== false);
    return {
        ...scene,
        expressions: expressions.length ? expressions : [scene.expressions[0]]
    };
}

function setExpressionEnabled(scoreId, sceneId, expressionId, enabled) {
    const key = sceneStateKey(scoreId, sceneId);
    const nextSceneState = {
        ...(state.expressionEnabled[key] || {}),
        [expressionId]: enabled
    };

    state.expressionEnabled = {
        ...state.expressionEnabled,
        [key]: nextSceneState
    };
}

function sceneStateKey(scoreId, sceneId) {
    return `${scoreId}::${sceneId}`;
}

function msToText(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function startPlayback() {
    if (state.isPlaying) return;
    state.isPlaying = true;
    state.lastFrameAt = performance.now();
    audioEngine.setVolume(state.volume);
    state.rafId = requestAnimationFrame(tickPlayback);
    render();
}

function stopPlayback(options = {}) {
    const { skipRender = false } = options;
    if (!state.isPlaying && state.rafId === null) return;
    state.isPlaying = false;
    if (state.rafId !== null) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
    }
    audioEngine.suspend();
    if (!skipRender) {
        render();
    }
}

function tickPlayback(now) {
    const score = scoreCatalog.find((entry) => entry.id === state.scoreId);
    if (!score) {
        stopPlayback();
        return;
    }

    const durationMs = getScoreDuration(score);
    const delta = now - state.lastFrameAt;
    state.lastFrameAt = now;
    state.elapsedMs = Math.min(durationMs, state.elapsedMs + delta);

    if (state.elapsedMs >= durationMs) {
        state.elapsedMs = durationMs;
        stopPlayback();
        return;
    }

    render();
    state.rafId = requestAnimationFrame(tickPlayback);
}

init();
