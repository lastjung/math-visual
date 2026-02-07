/**
 * Core Engine for Math Visualizations
 * Handles Global Systems: Idle Management, Recording Mode, and Case Loading
 */

const Core = {
    currentCase: null,
    isIdle: false,
    idleTimer: null,
    IDLE_TIMEOUT: 60 * 1000,
    isRecordingMode: false,

    init() {
        this.setupIdleSystem();
        this.setupGlobalEvents();
        window.addEventListener('resize', () => {
            if (this.currentCase && this.currentCase.resize) {
                this.currentCase.resize();
            }
        });
    },

    setupIdleSystem() {
        const stopAnimation = () => {
            this.isIdle = true;
            if (this.currentCase && this.currentCase.stop) {
                this.currentCase.stop();
            }
            document.getElementById('sleep-overlay').style.display = 'flex';
        };

        const resetIdleTimer = () => {
            if (this.isIdle) {
                this.isIdle = false;
                document.getElementById('sleep-overlay').style.display = 'none';
                if (this.currentCase && this.currentCase.start) {
                    this.currentCase.start();
                }
            }
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(stopAnimation, this.IDLE_TIMEOUT);
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, resetIdleTimer, true);
        });

        this.idleTimer = setTimeout(stopAnimation, this.IDLE_TIMEOUT);
    },

    setupGlobalEvents() {
        // Use robust event delegation
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('#toggleRecording');
            if (toggleBtn) {
                this.toggleRecording();
                return;
            }
            
            const sleepBtn = e.target.closest('#resetIdle');
            if (sleepBtn) {
                this.resetIdleTimer();
            }
        });

        // Add keyboard shortcut for YouTube Recording Mode
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleRecording();
            }
        });
    },

    toggleRecording() {
        this.isRecordingMode = !this.isRecordingMode;
        document.body.classList.toggle('recording-mode');
        
        const btn = document.getElementById('toggleRecording');
        if (btn) {
            btn.textContent = this.isRecordingMode ? 'Exit Recording Mode (ESC)' : 'Recording Mode ON';
        }

        if (this.currentCase && this.currentCase.resize) {
            this.currentCase.resize();
        }
    },

    resetIdleTimer() {
        // Exposed for manual calls
        window.dispatchEvent(new Event('mousedown')); 
    },

    loadCase(caseInstance) {
        if (this.currentCase && this.currentCase.destroy) {
            this.currentCase.destroy();
        }
        this.currentCase = caseInstance;
        this.currentCase.init();
        this.currentCase.start();
    }
};

document.addEventListener('DOMContentLoaded', () => Core.init());
