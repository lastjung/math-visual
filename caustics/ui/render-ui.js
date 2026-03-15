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

    const activeAnchor = app.getActiveSourceAnchor();
    const angle = Math.atan2(activeAnchor.y, activeAnchor.x);
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

    const rangeBeamWidth = UIElements.get('range-beam-width');
    if (rangeBeamWidth) rangeBeamWidth.value = String(app.beamWidth);
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

    const triangleCount = UIElements.get('range-source-count');
    const triangleCountValue = UIElements.get('val-source-count');
    if (triangleCount) triangleCount.value = app.trianglePointCount;
    if (triangleCountValue) triangleCountValue.textContent = String(app.trianglePointCount);

    const triangleBias = UIElements.get('range-source-bias');
    const triangleBiasValue = UIElements.get('val-source-bias');
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
    const activeSourceLayout = app.triangleSourceMode;
    UIElements.queryAll('#group-source-layout .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === activeSourceLayout);
    });
    UIElements.queryAll('#group-source-direction .mini-tab').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.value === app.triangleDirectionMode);
    });

    UIElements.queryAll('#group-source-single-option .mini-tab').forEach((btn) => {
        const val = btn.dataset.value;
        if (val === 'center') {
            const isCenter = Math.abs(app.sourcePos.x) < 1 && Math.abs(app.sourcePos.y) < 1;
            btn.classList.toggle('active', isCenter);
        } else if (val === 'basic') {
            const defaults = app.getShapeDefaults(app.shape);
            const isBasic = Math.abs(app.sourcePos.x - defaults.sourcePos.x) < 1 && Math.abs(app.sourcePos.y - defaults.sourcePos.y) < 1;
            btn.classList.toggle('active', isBasic);
        }
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
    const trianglePanelBlock = UIElements.get('source-layout-panel');
    const triangleDetailBlock = UIElements.get('source-layout-detail-block');
    const triangleDirectionRow = UIElements.get('source-direction-row');
    const triangleSingleOptionRow = UIElements.get('source-single-option-row');
    const triangleStripControls = UIElements.get('source-strip-controls');
    const badgeSub = UIElements.get('shape-badge-sub');
    const isTriangleSingle = app.triangleSourceMode === 'single';
    const isTriangleStrip = app.triangleSourceMode === 'strip';

    if (badge) {
        badge.textContent = content.badge;
        badge.dataset.description = content.description;
        badge.title = content.description;
    }
    if (badgeSub) {
        badgeSub.textContent = app.shape === 'triangle'
            ? (content.meta || 'Point')
            : (app.lightSourceMode === 'parallel' ? 'Parallel' : (app.lightSourceMode === 'converge' ? 'Converge' : 'Point'));
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
    if (trianglePanelBlock) trianglePanelBlock.classList.toggle('visible', true);
    if (triangleDetailBlock) triangleDetailBlock.classList.toggle('hidden', false); // Always show details if panel is open
    if (triangleDirectionRow) triangleDirectionRow.classList.toggle('hidden', isTriangleSingle);
    if (triangleSingleOptionRow) triangleSingleOptionRow.classList.toggle('hidden', !isTriangleSingle);
    if (triangleStripControls) triangleStripControls.classList.toggle('hidden', !isTriangleStrip);
    if (card) card.classList.toggle('hidden', false); // Always show card
    if (note) note.classList.toggle('hidden', false); // Always show note

    presets.forEach((preset, index) => {
        const btn = UIElements.get(`shape-preset-index-${index}`);
        if (btn) {
            btn.textContent = preset.label;
            btn.dataset.patternId = preset.patternId;
            btn.classList.toggle('active', app.patternId === preset.patternId);
        }
    });

    const currentPreset = presets.find(p => p.patternId === app.patternId) || presets[0];
    if (presetNote && currentPreset) presetNote.textContent = currentPreset.note || '';
}

export function applyShapePreset(app) {
    return (patternId) => {
        const presetsByShape = shapePresets(app);
        const presets = presetsByShape[app.shape] || presetsByShape.circle;
        const preset = presets.find(p => p.patternId === patternId);
        if (!preset) return;

        // Execute application
        app.applyPattern(patternId);

        // UI Feedback
        const presetNote = UIElements.get('shape-preset-note');
        if (presetNote) presetNote.textContent = preset.note || '';
        
        updateUI(app);
    };
}

