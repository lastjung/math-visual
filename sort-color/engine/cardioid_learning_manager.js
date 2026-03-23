const CardioidLearningManager = {
    setLearningMode(mode) {
        this.learningMode = mode || 'off';
        this.applyLearningModeState();
        this.resetSortState('idle');
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
        this.draw();
    },

    applyLearningModeState() {
        if (this.learningMode === 'n-ramp') {
            const forceIntegerM = this.learningMode === 'gcd' || this.learningMode === 'integer-snap';
            const lockedM = (this.integersOnly || forceIntegerM) ? Math.round(this.multiplier) : this.multiplier;
            this.learnN = Math.max(0, Math.floor(this.pointCount));
            this.learnFixedM = lockedM;
            this.multiplier = lockedM;
        }
        if (this.learningMode === 'm-ramp') {
            this.mRampFixedN = Math.max(1, Math.floor(this.pointCount) || 1);
        }
        if (this.learningMode === 'mapping') {
            this.demoIndex = 0;
        }
        if (this.learningMode === 'classic') {
            this.classicTimer = 0;
            this.classicIndex = 0;
            this.multiplier = this.classicTargets[this.classicIndex];
            this.pointCount = 360;
        }
        if (this.learningMode === 'ultimate') {
            this.ultimateTimer = 0;
            this.ultimateIndex = 0;
            this.multiplier = this.ultimateTargets[this.ultimateIndex];
            this.pointCount = 360;
        }
        if (this.learningMode === 'mirror-chaos') {
            this.mirrorTimer = 0;
            this.mirrorIndex = 0;
            this.multiplier = this.mirrorTargets[this.mirrorIndex];
            this.pointCount = 360;
        }
    },

    updateGeometryState(dt) {
        if (this.updateLearningModeSimulation(dt)) return;
        this.updateFreeRunMultiplier(dt);
    },

    updateLearningModeSimulation(dt) {
        if (this.learningMode === 'n-ramp') {
            this.multiplier = this.learnFixedM;
            const speed = this.learnN < this.nRampSwitchN ? this.nRampSlowRate : this.nRampFastRate;
            this.learnN += speed * dt;
            if (this.learnN > this.nRampMaxN) this.learnN = 0;
            this.pointCount = Math.max(0, Math.floor(this.learnN));
            return true;
        }
        if (this.learningMode === 'm-ramp') {
            this.pointCount = Math.max(1, Math.floor(this.mRampFixedN));
            const sign = this.mRampRate === 0 ? 0 : Math.sign(this.mRampRate);
            const base = Math.abs(this.mRampRate);
            const growth = 1 + Math.max(0, Math.abs(this.multiplier)) * this.mRampAccel;
            this.mRampEffectiveRate = sign * base * growth;
            this.multiplier += this.mRampEffectiveRate * dt;
            if (this.multiplier >= 100) {
                this.multiplier = 100;
                if (this.mRampEffectiveRate > 0) this.mRampEffectiveRate = 0;
            } else if (this.multiplier <= 0) {
                this.multiplier = 0;
                if (this.mRampEffectiveRate < 0) this.mRampEffectiveRate = 0;
            }
            return true;
        }
        if (this.learningMode === 'integer-snap') {
            this.multiplier += this.snapRate * dt;
            return true;
        }
        if (this.learningMode === 'mapping') {
            if (this.demoAuto && this.pointCount > 0) {
                this.demoIndex += this.demoRate * dt;
                const n = Math.max(1, Math.floor(this.pointCount));
                if (this.demoIndex >= n) this.demoIndex %= n;
            }
            this.multiplier += this.multiplierSpeed * dt;
            return true;
        }
        if (this.learningMode === 'classic') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'classicTimer',
                duration: this.classicDuration,
                indexKey: 'classicIndex',
                targets: this.classicTargets,
                holdTime: 2.0
            });
            return true;
        }
        if (this.learningMode === 'ultimate') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'ultimateTimer',
                duration: this.ultimateDuration,
                indexKey: 'ultimateIndex',
                targets: this.ultimateTargets,
                holdTime: 1.0
            });
            return true;
        }
        if (this.learningMode === 'mirror-chaos') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'mirrorTimer',
                duration: this.mirrorDuration,
                indexKey: 'mirrorIndex',
                targets: this.mirrorTargets,
                holdTime: 1.0
            });
            return true;
        }
        return false;
    },

    updateTimedLearningMode(dt, config) {
        this[config.timerKey] += dt;
        if (this[config.timerKey] >= config.duration) {
            this[config.timerKey] = 0;
            this[config.indexKey] = (this[config.indexKey] + 1) % config.targets.length;
        }

        const currentM = config.targets[this[config.indexKey]];
        if (this[config.timerKey] < config.holdTime) {
            this.multiplier = currentM;
            return;
        }

        const t = (this[config.timerKey] - config.holdTime) / (config.duration - config.holdTime);
        const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
        const nextIndex = (this[config.indexKey] + 1) % config.targets.length;
        const nextM = config.targets[nextIndex];
        this.multiplier = currentM + (nextM - currentM) * ease;
    },

    updateFreeRunMultiplier(dt) {
        this.multiplier += this.multiplierSpeed * dt;
    }
};
