import { scoreCatalog } from '../catalog/index.js';
import {
    buildControllerSnapshot,
    formatControllerValue,
    getActiveScene,
    getScoreDuration
} from '../engine/controllers.js';
import { buildControllerMap, describeExpression } from '../engine/expressions.js';

const elements = {
    scoreRail: document.getElementById('scoreRail'),
    scoreTitle: document.getElementById('scoreTitle'),
    scoreTheme: document.getElementById('scoreTheme'),
    scoreSource: document.getElementById('scoreSource'),
    scoreDuration: document.getElementById('scoreDuration'),
    scorePalette: document.getElementById('scorePalette'),
    scoreTimeline: document.getElementById('scoreTimeline'),
    timelineLabel: document.getElementById('timelineLabel'),
    sceneRail: document.getElementById('sceneRail'),
    activeSceneTitle: document.getElementById('activeSceneTitle'),
    activeSceneSummary: document.getElementById('activeSceneSummary'),
    controllersPanel: document.getElementById('controllersPanel'),
    expressionsPanel: document.getElementById('expressionsPanel')
};

const state = {
    scoreId: scoreCatalog[0]?.id ?? null,
    elapsedMs: 0
};

function init() {
    renderScoreRail();
    bindEvents();
    render();
}

function bindEvents() {
    elements.scoreTimeline.addEventListener('input', (event) => {
        state.elapsedMs = Number(event.target.value);
        render();
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
    const controllerMap = buildControllerMap(score);
    const controllerSnapshot = buildControllerSnapshot(score.controllers, state.elapsedMs);

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

    renderSceneRail(score, activeScene.id);
    renderActiveScene(activeScene);
    renderControllers(score, activeScene.activeControllers, controllerSnapshot, controllerMap);
    renderExpressions(activeScene, controllerSnapshot, controllerMap);
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

function renderExpressions(scene, snapshot, controllerMap) {
    elements.expressionsPanel.innerHTML = '';
    for (const expression of scene.expressions) {
        const view = describeExpression(expression, snapshot, controllerMap);
        const card = document.createElement('article');
        card.className = 'expression-card';
        card.innerHTML = `
            <div class="expression-meta">
                <span class="expression-type">${expression.type}</span>
                <span class="expression-name">${expression.name}</span>
            </div>
            <div class="expression-formula">${expression.formula}</div>
            <div class="expression-params">${view.parameterSummary || 'static expression'}</div>
            ${expression.notes?.length ? `<div class="expression-notes">${expression.notes.join(' | ')}</div>` : ''}
        `;
        elements.expressionsPanel.appendChild(card);
    }
}

function msToText(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

init();
