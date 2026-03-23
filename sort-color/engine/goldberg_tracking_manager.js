const GoldbergTrackingManager = {
    updateSimulation(dt) {
        if (!this.isPaused && !this.isDraggingSphere) {
            const provider = (this.autoTrack || this.autoRotate) ? this.getCurrentGeometryProvider() : null;
            const sortPlan = provider ? this.ensureSortPlan(provider) : null;
            const trackingApplied = this.autoTrack ? this.updateAutoTracking(dt, provider, sortPlan) : false;
            if (!trackingApplied && this.autoRotate) {
                this.applyAutoRotation(dt, sortPlan);
            }
            this.clampPitch();
        } else if (this.isDraggingSphere) {
            this.trackingVelX = 0;
            this.trackingVelY = 0;
        }
        this.updateSortingState(dt);
        this.updateShuffleAnimation(dt);
        this.updateShuffleFlash(dt);
    },

    applyAutoRotation(dt, sortPlan) {
        const rotationMultiplier = this.sortingStatus === 'running' ? 5 : 1;
        let effectiveMultiplier = rotationMultiplier;
        const isRadixSort = this.sortMode === 'hue' || this.sortMode === 'lsh';

        if (rotationMultiplier > 1 && isRadixSort) {
            const sortView = sortPlan ? this.getSortViewState(sortPlan) : null;
            if (sortView) {
                const passKey = `${sortView.passIndex}:${sortView.passLabel || ''}`;
                if (passKey !== this.sortPassRotationKey) {
                    this.sortPassRotationKey = passKey;
                    this.sortPassSlowTimer = 0.3;
                }
            }
            if (this.sortPassSlowTimer > 0) {
                effectiveMultiplier = 1;
                this.sortPassSlowTimer = Math.max(0, this.sortPassSlowTimer - dt);
            }
        } else {
            this.sortPassRotationKey = '';
            this.sortPassSlowTimer = 0;
        }

        this.rotY += this.rotationSpeed * effectiveMultiplier * dt;
    },

    wrapAngle(angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    },

    resetAutoTrackingState() {
        this.trackingHistory = [];
        this.trackingSmoothedPoint = null;
        this.trackingVelX = 0;
        this.trackingVelY = 0;
        this.trackingLocked = false;
    },

    getSortTrackingTarget(provider, sortPlan) {
        if (!this.autoTrack || this.sortingStatus !== 'running' || !provider || !sortPlan) return null;
        const sortView = this.getSortViewState(sortPlan);
        if (!sortView || !Array.isArray(provider.slots) || !provider.slots.length) return null;

        const centers = [];
        const pushSlotCenter = (slotIndex) => {
            if (!Number.isInteger(slotIndex)) return;
            const slot = provider.slots[slotIndex];
            const center = slot?.meta?.center;
            if (!center) return;
            centers.push(center);
        };

        if (this.sortMode === 'bubble' && Array.isArray(sortView.activeIndices) && sortView.activeIndices.length) {
            pushSlotCenter(sortView.activeIndices[sortView.activeIndices.length - 1]);
        } else if (Array.isArray(sortView.activeIndices) && sortView.activeIndices.length) {
            sortView.activeIndices.forEach(pushSlotCenter);
        } else if (Number.isInteger(sortView.pivotIndex)) {
            pushSlotCenter(sortView.pivotIndex);
        } else if (Number.isInteger(sortView.coloredCount)) {
            pushSlotCenter(Math.min(provider.slots.length - 1, sortView.coloredCount));
        }

        if (!centers.length) return null;

        const averaged = centers.reduce((acc, center) => {
            acc.x += center.x;
            acc.y += center.y;
            acc.z += center.z;
            return acc;
        }, { x: 0, y: 0, z: 0 });
        const len = Math.hypot(averaged.x, averaged.y, averaged.z) || 1;
        return {
            x: averaged.x / len,
            y: averaged.y / len,
            z: averaged.z / len
        };
    },

    updateAutoTracking(dt, provider, sortPlan) {
        const targetPoint = this.getSortTrackingTarget(provider, sortPlan);
        if (!targetPoint) {
            this.trackingHistory = [];
            this.trackingSmoothedPoint = null;
            this.trackingLocked = false;
            this.trackingVelX *= 0.85;
            this.trackingVelY *= 0.85;
            return false;
        }

        this.trackingHistory.push(targetPoint);
        if (this.trackingHistory.length > 6) this.trackingHistory.shift();

        const averaged = this.trackingHistory.reduce((acc, point) => {
            acc.x += point.x;
            acc.y += point.y;
            acc.z += point.z;
            return acc;
        }, { x: 0, y: 0, z: 0 });
        averaged.x /= this.trackingHistory.length;
        averaged.y /= this.trackingHistory.length;
        averaged.z /= this.trackingHistory.length;

        if (!this.trackingSmoothedPoint) {
            this.trackingSmoothedPoint = { ...averaged };
        } else {
            const emaAlpha = 1 - Math.exp(-dt / 0.22);
            this.trackingSmoothedPoint.x += (averaged.x - this.trackingSmoothedPoint.x) * emaAlpha;
            this.trackingSmoothedPoint.y += (averaged.y - this.trackingSmoothedPoint.y) * emaAlpha;
            this.trackingSmoothedPoint.z += (averaged.z - this.trackingSmoothedPoint.z) * emaAlpha;
        }

        const smoothed = this.trackingSmoothedPoint;
        const smoothedLen = Math.hypot(smoothed.x, smoothed.y, smoothed.z) || 1;
        smoothed.x /= smoothedLen;
        smoothed.y /= smoothedLen;
        smoothed.z /= smoothedLen;

        const gain = 4.8;
        const maxVel = 2.2;
        const deadZone = 0.012;
        const velAlpha = 1 - Math.exp(-dt / 0.14);

        const zNew = Math.hypot(smoothed.x, smoothed.z);
        if (zNew > 0.001) {
            const targetAngleY = Math.atan2(-smoothed.x, smoothed.z);
            let dY = this.wrapAngle(targetAngleY - this.rotY);
            if (Math.abs(dY) < deadZone) dY = 0;
            const desiredVelY = Math.max(-maxVel, Math.min(maxVel, dY * gain));
            this.trackingVelY += (desiredVelY - this.trackingVelY) * velAlpha;
        }

        const targetAngleX = Math.atan2(smoothed.y, zNew);
        let dX = this.wrapAngle(targetAngleX - this.rotX);
        if (Math.abs(dX) < deadZone) dX = 0;
        const desiredVelX = Math.max(-maxVel, Math.min(maxVel, dX * gain));
        this.trackingVelX += (desiredVelX - this.trackingVelX) * velAlpha;

        this.rotY += this.trackingVelY * dt;
        this.rotX += this.trackingVelX * dt;
        return true;
    },

    clampPitch() {
        const limit = 1.35;
        if (this.rotX > limit) this.rotX = limit;
        if (this.rotX < -limit) this.rotX = -limit;
    }
};
