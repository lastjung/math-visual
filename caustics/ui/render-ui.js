import { UIElements } from './elements.js';
import { shapePanelContent, shapePresets, trianglePanelContent } from './panels.js';

export function updateUI(app) {
    syncShapePanel(app);

    const updateAutoLabel = (id, iconId, isActive) => {
        const el = UIElements.get(id);
        const icon = UIElements.get(iconId);
        if (!el || !icon) return;
        el.classList.toggle('active', isActive);
        const row = el.closest('.setting-row');
        if (row) row.classList.toggle('auto-active', isActive);
        const html = isActive
            ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        if (icon.innerHTML !== html) icon.innerHTML = html;
    };

    updateAutoLabel('label-revolution', 'animate-icon-mini', app.autoModes.revolution);
    updateAutoLabel('label-rotation', 'rotate-icon-mini', app.autoModes.rotation);
    updateAutoLabel('label-density', 'density-icon-mini', app.autoModes.density);
    updateAutoLabel('label-speed', 'speed-icon-mini', app.autoModes.speed);
    updateAutoLabel('label-spread', 'spread-icon-mini', app.autoModes.spread);
    updateAutoLabel('label-reflections', 'reflections-icon-mini', app.autoModes.reflections);

    const angle = Math.atan2(app.sourcePos.y, app.sourcePos.x);
    const rangeSource = UIElements.get('range-source');
    if (rangeSource && Math.abs(parseFloat(rangeSource.value) - angle) > 0.02) rangeSource.value = angle;

    const degText = `${(angle * 180 / Math.PI).toFixed(0)}°`;
    const valSource = UIElements.get('val-source');
    if (valSource && valSource.textContent !== degText) valSource.textContent = degText;

    const valRotation = UIElements.get('val-rotation');
    const rotDeg = `${(app.sourceRotation * 180 / Math.PI).toFixed(0)}°`;
    if (valRotation && valRotation.textContent !== rotDeg) {
        valRotation.textContent = rotDeg;
        const rangeRotation = UIElements.get('range-rotation');
        if (rangeRotation) rangeRotation.value = app.sourceRotation;
    }

    const rangeDensity = UIElements.get('range-density');
    if (rangeDensity) rangeDensity.value = app.rayNumber;
    const valDensity = UIElements.get('val-density');
    if (valDensity && valDensity.textContent !== String(app.rayNumber)) valDensity.textContent = String(app.rayNumber);

    const rangeSpeed = UIElements.get('range-speed');
    if (rangeSpeed) rangeSpeed.value = app.raySpeed;
    const valSpeed = UIElements.get('val-speed');
    if (valSpeed && valSpeed.textContent !== String(app.raySpeed)) valSpeed.textContent = String(app.raySpeed);

    const spreadText = `${(app.spread * 180 / Math.PI).toFixed(0)}°`;
    const rangeSpread = UIElements.get('range-spread');
    if (rangeSpread) rangeSpread.value = app.spread;
    const valSpread = UIElements.get('val-spread');
    if (valSpread && valSpread.textContent !== spreadText) valSpread.textContent = spreadText;

    const valBeamWidth = UIElements.get('val-beam-width');
    if (valBeamWidth) valBeamWidth.textContent = app.beamWidth.toFixed(1);

    const rangeReflections = UIElements.get('range-reflections');
    if (rangeReflections) rangeReflections.value = app.MAX_BOUNCES;
    const valReflections = UIElements.get('val-reflections');
    if (valReflections && valReflections.textContent !== String(app.MAX_BOUNCES)) valReflections.textContent = String(app.MAX_BOUNCES);

    const rangeAlpha = UIElements.get('range-alpha');
    if (rangeAlpha) rangeAlpha.value = app.alphaIntensity;
    const valAlpha = UIElements.get('val-alpha');
    const alphaText = `${app.alphaIntensity.toFixed(2)}x`;
    if (valAlpha && valAlpha.textContent !== alphaText) valAlpha.textContent = alphaText;

    const triangleCount = UIElements.get('range-triangle-count');
    const triangleCountValue = UIElements.get('val-triangle-count');
    if (triangleCount) triangleCount.value = app.trianglePointCount;
    if (triangleCountValue) triangleCountValue.textContent = String(app.trianglePointCount);

    const triangleBias = UIElements.get('range-triangle-bias');
    const triangleBiasValue = UIElements.get('val-triangle-bias');
    if (triangleBias) triangleBias.value = app.triangleVertexBias;
    if (triangleBiasValue) triangleBiasValue.textContent = app.triangleVertexBias.toFixed(2);

    const btnLight = UIElements.get('btn-light');
    if (btnLight) {
        btnLight.classList.toggle('light-on', app.isLightVisible);
        const lightText = UIElements.get('light-text');
        if (lightText && lightText.textContent !== 'Emit') lightText.textContent = 'Emit';
    }

    const checkAxes = UIElements.get('check-axes');
    if (checkAxes && checkAxes.checked !== app.showAxes) checkAxes.checked = app.showAxes;

    UIElements.queryAll('#group-render-mode .mini-tab').forEach((btn) => {
        let activeVal = 'none';
        if (app.isPaintMode) activeVal = 'paint1';
        else if (app.isPaint2Mode) activeVal = 'paint2';
        else if (app.isLightMode) activeVal = 'light';
        btn.classList.toggle('active', btn.dataset.value === activeVal);
    });

    UIElements.queryAll('#group-base .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === app.baseStyle);
    });
    UIElements.queryAll('#group-flow .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === app.flowMode);
    });
    UIElements.queryAll('#group-source-mode .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === app.lightSourceMode);
    });
    UIElements.queryAll('#group-triangle-source .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === app.triangleSourceMode);
    });
    UIElements.queryAll('#group-triangle-direction .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === app.triangleDirectionMode);
    });

    const cTrail = UIElements.get('check-trail');
    const cTaper = UIElements.get('check-taper');
    const cBloom = UIElements.get('check-bloom');
    if (cTrail && cTrail.checked !== app.useTrail) cTrail.checked = app.useTrail;
    if (cTaper && cTaper.checked !== app.useTaper) cTaper.checked = app.useTaper;
    if (cBloom && cBloom.checked !== app.useBloom) cBloom.checked = app.useBloom;

    syncNarrativeSelect(app);

    const applePlay = UIElements.get('apple-play');
    const applePlayIcon = UIElements.get('apple-play-icon');
    if (applePlay) {
        applePlay.classList.toggle('active', app.isFlowing);
        const playHtml = app.isFlowing
            ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
            : '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        if (applePlayIcon && applePlayIcon.innerHTML !== playHtml) applePlayIcon.innerHTML = playHtml;
    }

    const appleVol = UIElements.get('apple-volume');
    if (appleVol && window.audioManager) {
        const currentVol = window.audioManager.targetVolume;
        if (Math.abs(parseFloat(appleVol.value) - currentVol) > 0.01) {
            appleVol.value = currentVol;
        }
    }

    const appleTime = UIElements.get('apple-time-current');
    if (appleTime) {
        const timeVal = Math.floor(app.elapsedTime || 0);
        const mins = Math.floor(timeVal / 60);
        const secs = Math.floor(timeVal % 60);
        appleTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    const appleProgress = UIElements.get('apple-progress-bar');
    const appleTrackName = UIElements.get('apple-track-name');
    if (appleProgress) {
        const cycleDuration = 60;
        const progress = (app.elapsedTime % cycleDuration) / cycleDuration * 100;
        appleProgress.style.width = `${progress}%`;
        if (appleTrackName && app.currentTrackName) appleTrackName.textContent = app.currentTrackName;
    }

    const bgmIcon = UIElements.get('apple-bgm-icon');
    if (bgmIcon && window.audioManager) {
        bgmIcon.style.opacity = window.audioManager.isMuted ? '0.3' : '1';
    }
}

export function syncNarrativeSelect(app) {
    const sNarrative = UIElements.get('select-narrative');
    if (sNarrative) sNarrative.value = app.currentNarrative || 'none';
}

export function syncShapePanel(app) {
    let content = shapePanelContent(app.shape);
    if (app.shape === 'triangle') content = trianglePanelContent(app, content);
    const presetsByShape = shapePresets(app);
    const presets = presetsByShape[app.shape] || presetsByShape.circle;
    const badge = UIElements.get('shape-badge');
    const sectionLabel = UIElements.get('shape-section-label');
    const meta = UIElements.get('shape-options-meta');
    const cardTitle = UIElements.get('shape-option-card-title');
    const cardCopy = UIElements.get('shape-option-card-copy');
    const note = UIElements.get('shape-option-note');
    const card = UIElements.get('shape-option-card');
    const presetNote = UIElements.get('shape-preset-note');
    const btnFoci = UIElements.get('btn-foci-sync');
    const trianglePanelBlock = UIElements.get('triangle-panel-block');
    const triangleDetailBlock = UIElements.get('triangle-detail-block');
    const triangleDirectionRow = UIElements.get('triangle-direction-row');
    const triangleStripControls = UIElements.get('triangle-strip-controls');
    const badgeSub = UIElements.get('shape-badge-sub');
    const isTriangle = app.shape === 'triangle';
    const isTriangleSingle = app.triangleSourceMode === 'single';
    const isTriangleStrip = app.triangleSourceMode === 'strip';

    if (badge) {
        badge.textContent = content.badge;
        badge.dataset.description = content.description;
        badge.title = content.description;
    }
    if (badgeSub) {
        badgeSub.textContent = isTriangle ? (content.meta || 'Point') : (app.lightSourceMode === 'parallel' ? 'Parallel' : (app.lightSourceMode === 'converge' ? 'Converge' : 'Point'));
        badgeSub.style.display = 'inline-block';
    }
    
    if (sectionLabel) sectionLabel.textContent = 'Source Presets';
    if (meta) meta.textContent = content.meta;
    if (cardTitle) cardTitle.textContent = content.cardTitle;
    if (cardCopy) cardCopy.textContent = content.cardCopy;
    if (note) note.textContent = content.note;
    if (btnFoci) {
        btnFoci.textContent = content.action;
        btnFoci.title = `Sync source to ${content.action.toLowerCase()} anchor`;
    }
    if (trianglePanelBlock) trianglePanelBlock.classList.toggle('visible', isTriangle);
    if (triangleDetailBlock) triangleDetailBlock.classList.toggle('hidden', !isTriangle || isTriangleSingle);
    if (triangleDirectionRow) triangleDirectionRow.classList.toggle('hidden', !isTriangle || isTriangleSingle);
    if (triangleStripControls) triangleStripControls.classList.toggle('hidden', !isTriangle || !isTriangleStrip);
    if (card) card.classList.toggle('hidden', false); // Always show card
    if (note) note.classList.toggle('hidden', false); // Always show note

    presets.forEach((preset, index) => {
        const button = UIElements.get(`shape-preset-${index}`);
        if (button) button.textContent = preset.label;
    });

    const selectedPreset = presets[app.selectedSourcePresetSlot ?? 0] || presets[0];
    if (presetNote && selectedPreset) presetNote.textContent = selectedPreset.note || '';
}

export function applyShapePreset(app) {
    return (slot) => {
        const presetsByShape = shapePresets(app);
        const presets = presetsByShape[app.shape] || presetsByShape.circle;
        const preset = presets[slot];
        if (!preset) return;

        app.selectedSourcePresetSlot = slot;
        const next = preset.apply();
        const presetNote = UIElements.get('shape-preset-note');
        if (next.sourcePos) app.sourcePos = { ...next.sourcePos };
        app.resetTriangleSourceOffsets();
        if (typeof next.sourceRotation === 'number') app.sourceRotation = next.sourceRotation;
        if (next.parallelRange && typeof next.parallelRange.min === 'number' && typeof next.parallelRange.max === 'number') {
            app.parallelRange = { ...next.parallelRange };
        }
        if (typeof next.spread === 'number') app.spread = next.spread;
        if (typeof next.lightSourceMode === 'string') app.lightSourceMode = next.lightSourceMode;
        if (typeof next.triangleSourceMode === 'string') app.triangleSourceMode = next.triangleSourceMode;
        if (typeof next.triangleDirectionMode === 'string') app.triangleDirectionMode = next.triangleDirectionMode;
        if (typeof next.isPaintMode === 'boolean') app.isPaintMode = next.isPaintMode;
        if (typeof next.isPaint2Mode === 'boolean') app.isPaint2Mode = next.isPaint2Mode;
        if (typeof next.isLightMode === 'boolean') app.isLightMode = next.isLightMode;

        app.autoModes.revolution = false;
        app.autoModes.rotation = false;
        app.normalizeLightSourceMode();
        app.sanitizeSourcePosition();
        if (app.isPaint2Mode || app.isLightMode) app.resetRays(false);
        if (presetNote) presetNote.textContent = preset.note || '';
        updateUI(app);
    };
}
