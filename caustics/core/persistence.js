import { readCurrentScene, applyScene } from './state-mapper.js';

const VALID_NARRATIVES = [
    'none',
    'The Secret Foci of Ovals',
    'Double Oval: Shared Foci, Split Light',
    'The Parabolic Point',
    'Reflections of Order',
    'Circle of Infinite Light',
    'The Radiant Pulse of Heart',
    'The Hidden Soul of Beams',
    'Dance of the Photons',
    'The Triple Symmetry of Light'
];

export function buildPersistedState(app) {
    return {
        // We still wrap it in a 'scene' key to match the previous version's structure
        // and allow for any future metadata outside the scene.
        scene: readCurrentScene(app)
    };
}

export function persistState(app) {
    const snapshot = JSON.stringify(buildPersistedState(app));
    if (snapshot === app.lastPersistSnapshot) return;

    app.lastPersistSnapshot = snapshot;
    try {
        localStorage.setItem(app.STORAGE_KEY, snapshot);
    } catch (_) {
        // Ignore storage failures
    }
}

export function restoreState(app) {
    try {
        const raw = localStorage.getItem(app.STORAGE_KEY);
        if (!raw) return false;

        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return false;

        // Use structured scene schema if available
        if (saved.scene) {
            applyScene(app, saved.scene);
        }

        // Common UI resettables
        app.isFlowing = false;
        app.isLightVisible = false;
        app.growth = 0;
        app.flowOffset = 0;
        app.isSimulationMode = false;

        app.lastPersistSnapshot = raw;
        return true;
    } catch (_) {
        return false;
    }
}
