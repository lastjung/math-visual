const CardioidLearningManager = {
    setLearningMode(mode) {
        this.learningMode = mode || 'off';
        this._lastN_for_factors = -1; // Force re-calc
        this.applyLearningModeState();
        this.resetSortState('idle');
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
        this.draw();
    },

    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            a %= b;
            [a, b] = [b, a];
        }
        return a;
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
            this.multiplier = this.classicTargets ? this.classicTargets[0] : this.multiplier;
            this.pointCount = 360;
        }
        if (this.learningMode === 'ultimate') {
            this.ultimateTimer = 0;
            this.ultimateIndex = 0;
            this.multiplier = this.ultimateTargets ? this.ultimateTargets[0] : this.multiplier;
            this.pointCount = 360;
        }
        if (this.learningMode === 'mirror-chaos') {
            this.mirrorTimer = 0;
            this.mirrorIndex = 0;
            this.multiplier = this.mirrorTargets ? this.mirrorTargets[0] : this.multiplier;
            this.pointCount = 360;
        }
        
        // Refactored shared factor logic
        if (this.learningMode === 'factor_1' || this.learningMode === 'factor_2') {
            const n = Math.max(1, Math.floor(this.pointCount));
            // Safety: Skip calculation if N is too large to avoid freezing
            if (n > 5000) {
                this.factorTargets = [this.learningMode === 'factor_1' ? n + 1 : n - 1];
            } else {
                let factors = [];
                const mode = this.learningMode;
                const threshold = n / 20; // Only show factors >= N/20 (5% cutoff, e.g. N=360 => threshold=18)
                for (let i = 2; i <= n; i++) {
                    if (n % i === 0) {
                        if (mode === 'factor_1') {
                            if (i < n && i >= threshold) factors.push(i);
                        } else {
                            if (i >= 3 && i >= threshold) factors.push(i);
                        }
                    }
                }
                // Fallback: if no factors found with threshold, lower it progressively
                if (factors.length < 2) {
                    for (let i = 2; i <= n; i++) {
                        if (n % i === 0 && !factors.includes(i)) {
                            if (mode === 'factor_1' && i === n) continue;
                            if (mode === 'factor_2' && i < 3) continue;
                            factors.push(i);
                        }
                        if (factors.length >= 3) break;
                    }
                }
                this.factorTargets = factors
                    .map(f => (mode === 'factor_1' ? f + 1 : f - 1))
                    .filter(m => m <= n); // Cap: M must not exceed N
            }
            this.factorTimer = 0;
            this.factorIndex = 0;
            this.factorDuration = 4.0;
            this.multiplier = (this.factorTargets && this.factorTargets.length > 0) ? this.factorTargets[0] : this.multiplier;
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
                duration: this.classicDuration || 4.0,
                indexKey: 'classicIndex',
                targets: this.classicTargets,
                holdTime: 2.0
            });
            return true;
        }
        if (this.learningMode === 'ultimate') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'ultimateTimer',
                duration: this.ultimateDuration || 3.0,
                indexKey: 'ultimateIndex',
                targets: this.ultimateTargets,
                holdTime: 1.0
            });
            return true;
        }
        if (this.learningMode === 'mirror-chaos') {
            this.updateTimedLearningMode(dt, {
                timerKey: 'mirrorTimer',
                duration: this.mirrorDuration || 3.0,
                indexKey: 'mirrorIndex',
                targets: this.mirrorTargets,
                holdTime: 1.0
            });
            return true;
        }
        if (this.learningMode === 'factor_1' || this.learningMode === 'factor_2') {
            const currentN = Math.floor(this.pointCount);
            if (this._lastN_for_factors !== currentN) {
                this._lastN_for_factors = currentN;
                this.applyLearningModeState();
            }

            if (!this.factorTargets || this.factorTargets.length === 0) return false;
            this.updateTimedLearningMode(dt, {
                timerKey: 'factorTimer',
                duration: this.factorDuration || 4.0,
                indexKey: 'factorIndex',
                targets: this.factorTargets,
                holdTime: 2.0
            });
            return true;
        }
        return false;
    },

    updateTimedLearningMode(dt, config) {
        if (!config.targets || config.targets.length === 0) return;
        
        if (config.noLoop && this[config.indexKey] === config.targets.length - 1 && this[config.timerKey] >= config.holdTime) {
            this.multiplier = config.targets[this[config.indexKey]];
            return;
        }

        const duration = Math.max(config.duration || 3.0, (config.holdTime || 0) + 0.1);
        this[config.timerKey] += dt;
        
        if (this[config.timerKey] >= duration) {
            this[config.timerKey] = 0;
            if (config.noLoop && this[config.indexKey] === config.targets.length - 1) {
                this[config.timerKey] = config.holdTime;
            } else {
                this[config.indexKey] = (this[config.indexKey] + 1) % config.targets.length;
            }
        }

        const currentM = config.targets[this[config.indexKey]];
        const holdTime = config.holdTime || 0;
        
        if (this[config.timerKey] < holdTime) {
            this.multiplier = currentM;
            return;
        }

        const t = (this[config.timerKey] - holdTime) / (duration - holdTime);
        const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);
        const nextIndex = (this[config.indexKey] + 1) % config.targets.length;
        const nextM = config.targets[nextIndex];
        this.multiplier = currentM + (nextM - currentM) * ease;
    },

    updateFreeRunMultiplier(dt) {
        this.multiplier += this.multiplierSpeed * dt;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardioidLearningManager;
}
