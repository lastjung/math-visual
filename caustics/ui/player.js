import { UIElements } from './elements.js';

export function setupPlayer(app, ui) {
    const player = UIElements.get('apple-player');
    const restoreTab = UIElements.get('apple-player-restore');
    const grip = UIElements.get('player-grip');
    const btnPlay = UIElements.get('apple-play');
    const volSlider = UIElements.get('apple-volume');

    const showPlayer = () => {
        player.classList.remove('hidden');
        if (restoreTab) restoreTab.classList.add('hidden');
    };

    const hidePlayer = () => {
        player.classList.add('hidden');
        if (restoreTab) restoreTab.classList.remove('hidden');
    };

    let isDragging = false;
    let startX;
    let startY;

    grip.onmousedown = (e) => {
        isDragging = true;
        startX = e.clientX - player.offsetLeft;
        startY = e.clientY - player.offsetTop;
        player.style.bottom = 'auto';
        player.style.transform = 'none';
        player.style.left = `${player.offsetLeft}px`;
        player.style.top = `${player.offsetTop}px`;
    };

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        player.style.left = `${e.clientX - startX}px`;
        player.style.top = `${e.clientY - startY}px`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    btnPlay.onclick = () => {
        app.toggleFlow();
    };

    const btnFullReset = UIElements.get('apple-full-reset');
    if (btnFullReset) {
        btnFullReset.onclick = () => {
            app.reset();
        };
    }

    const btnJourney = UIElements.get('btn-start-journey');
    if (btnJourney) {
        btnJourney.onclick = () => {
            app.startNarrativeSimulation();
        };
    }

    const btnPartialReset = UIElements.get('apple-partial-reset');
    if (btnPartialReset) {
        btnPartialReset.onclick = () => {
            app.resetRays(true);
            ui.update(app);
        };
    }

    const btnSpeedUp = UIElements.get('apple-speed-up');
    const btnSpeedDown = UIElements.get('apple-speed-down');
    if (btnSpeedUp) {
        btnSpeedUp.onclick = () => {
            app.simSpeedMultiplier *= 1.1;
            if (app.simSpeedMultiplier > 10.0) app.simSpeedMultiplier = 10.0;
            ui.update(app);
        };
    }
    if (btnSpeedDown) {
        btnSpeedDown.onclick = () => {
            app.simSpeedMultiplier *= 0.9;
            if (app.simSpeedMultiplier < 0.1) app.simSpeedMultiplier = 0.1;
            ui.update(app);
        };
    }

    volSlider.oninput = (e) => {
        if (!window.audioManager) return;
        window.audioManager.isMuted = false;
        window.audioManager.setTargetVolume(parseFloat(e.target.value));
        window.audioManager.resume();
    };

    const btnNextTrack = UIElements.get('apple-next-track');
    if (btnNextTrack) {
        btnNextTrack.onclick = () => {
            app.nextBGM();
            ui.update(app);
        };
    }

    const bgmIcon = UIElements.get('apple-bgm-icon');
    if (bgmIcon) {
        bgmIcon.onclick = () => {
            if (!window.audioManager) return;
            const isMuted = window.audioManager.toggleMute();
            bgmIcon.style.opacity = isMuted ? '0.3' : '1';
        };
    }

    const btnClose = UIElements.get('apple-player-close');
    if (btnClose) {
        btnClose.onclick = (e) => {
            e.stopPropagation();
            hidePlayer();
        };
    }

    if (restoreTab) {
        restoreTab.onclick = () => {
            showPlayer();
        };
    }
}
