export function getScoreDuration(score) {
    return score.scenes.reduce((sum, scene) => sum + (scene.durationMs || 0), 0);
}

export function getSceneStartTimes(score) {
    let elapsed = 0;
    return score.scenes.map((scene) => {
        const start = elapsed;
        elapsed += scene.durationMs || 0;
        return { sceneId: scene.id, startMs: start, endMs: elapsed };
    });
}

export function getActiveScene(score, elapsedMs) {
    const timeline = getSceneStartTimes(score);
    return timeline.find((entry) => elapsedMs >= entry.startMs && elapsedMs < entry.endMs) || timeline[timeline.length - 1] || null;
}

export function buildControllerSnapshot(controllers, elapsedMs) {
    return Object.fromEntries(
        controllers.map((controller) => [controller.id, getControllerValueAt(controller, elapsedMs)])
    );
}

export function getControllerValueAt(controller, elapsedMs) {
    const {
        mode = 'static',
        min = 0,
        max = 1,
        initial = min,
        durationMs = 0
    } = controller;

    if (mode === 'static' || durationMs <= 0) {
        return initial;
    }

    if (mode === 'play_once') {
        const progress = clamp01(elapsedMs / durationMs);
        return lerp(min, max, progress);
    }

    if (mode === 'loop') {
        const progress = (elapsedMs % durationMs) / durationMs;
        return lerp(min, max, progress);
    }

    if (mode === 'reverse_loop') {
        const phase = (elapsedMs % durationMs) / durationMs;
        const triangle = phase < 0.5 ? phase * 2 : 2 - phase * 2;
        return lerp(min, max, triangle);
    }

    return initial;
}

export function formatControllerValue(controller, value) {
    const precision = controller.precision ?? 2;
    return `${controller.label} = ${Number(value).toFixed(precision)}`;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function lerp(min, max, progress) {
    return min + (max - min) * progress;
}
