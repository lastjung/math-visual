/**
 * LIGHT FLOW LAB: UI Module
 * Facade for delegated UI modules
 */
import { shapePanelContent, shapePresets, trianglePanelContent } from './ui/panels.js';
import { setupControls } from './ui/controls.js';
import { applyShapePreset, syncNarrativeSelect, syncShapePanel, updateUI } from './ui/render-ui.js';
import { setupPlayer } from './ui/player.js';
import { setupSidebarChrome } from './ui/sidebar.js';

export const UI = {
    trianglePanelContent(app, baseContent) {
        return trianglePanelContent(app, baseContent);
    },

    shapePresets(app) {
        return shapePresets(app);
    },

    shapePanelContent(shape) {
        return shapePanelContent(shape);
    },

    setupEvents(app) {
        return setupControls(app, this);
    },

    update(app) {
        return updateUI(app);
    },

    syncNarrativeSelect(app) {
        return syncNarrativeSelect(app);
    },

    syncShapePanel(app) {
        return syncShapePanel(app);
    },

    applyShapePreset(app, slot) {
        return applyShapePreset(app)(slot);
    },

    setupApplePlayer(app) {
        setupPlayer(app, this);
        setupSidebarChrome();
    }
};
