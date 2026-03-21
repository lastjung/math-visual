const SpiralDiskCase = {
    pointCount: 320,
    multiplier: 2,
    multiplierSpeed: 0,
    lineWidth: 1.65,
    lineAlpha: 0.42,
    pointRadius: 1.05,
    colorMode: 'angle',
    renderMode: 'light',
    sortMode: 'off',
    sortingStatus: 'idle',
    sortSpeed: 150,
    rotation: -Math.PI / 2,
    spiralTurns: 5.5,
    guideText: [
        '[Spiral Disk controls]',
        '- N (Nodes): number of anchors distributed along the spiral arm.',
        '- M (Link): mapping rule for connections, i -> (M*i) mod N.',
        '- Spiral Turns: how many turns the disk spiral spans.',
        '- Color Order works especially well here because draw order reads like a ribbon.',
        '- N Ramp grows the disk outward while Fixed M stays locked.',
        '- M Ramp warps the connection target while the spiral scaffold stays intact.'
    ].join('\n'),

    get uiConfig() {
        const controls = this.getBaseControls();
        this.appendLearningModeControls(controls);
        return controls;
    },

    getBaseControls() {
        const controls = CardioidCircleCase.getBaseControls.call(this);
        const nControl = controls.find((control) => control.id === 'mc_n');
        if (nControl) nControl.label = 'N (Nodes)';
        const mControl = controls.find((control) => control.id === 'mc_m');
        if (mControl) mControl.label = 'M (Link)';
        const speedControl = controls.find((control) => control.id === 'mc_speed');
        if (speedControl) speedControl.label = 'M Speed';

        const speedIndex = controls.findIndex((control) => control.id === 'mc_speed');
        const turnsControl = {
            type: 'slider',
            id: 'mc_spiral_turns',
            label: 'Spiral Turns',
            min: 1.5,
            max: 12,
            step: 0.1,
            decimals: 1,
            value: this.spiralTurns,
            onChange: (v) => {
                this.spiralTurns = Math.max(1.5, v);
                this.resetSortState('idle');
                this.draw();
            }
        };

        if (speedIndex >= 0) controls.splice(speedIndex + 1, 0, turnsControl);
        else controls.push(turnsControl);

        return controls;
    },

    reset() {
        CardioidCircleCase.reset.call(this);
        this.pointCount = 320;
        this.multiplier = 2;
        this.lineWidth = 1.65;
        this.lineAlpha = 0.42;
        this.pointRadius = 1.05;
        this.colorMode = 'angle';
        this.spiralTurns = 5.5;
        this.rotation = -Math.PI / 2;
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    circlePoint(i, n, radius, cx, cy) {
        return this.getSpiralPoint(i, n, radius, cx, cy);
    },

    circlePointByIndex(index, n, radius, cx, cy) {
        return this.getSpiralPointByIndex(index, n, radius, cx, cy);
    },

    lineVisual(i, n, from, to, radius, alphaOverride = null) {
        return this.getSpiralLineVisual(i, n, from, to, radius, alphaOverride);
    },

    lineColor(i, n, from, to, radius) {
        return this.getSpiralLineColor(i, n, from, to, radius);
    }
};

Object.setPrototypeOf(SpiralDiskCase, CardioidCircleCase);

if (typeof SpiralDiskGeometryProvider !== 'undefined') {
    Object.assign(SpiralDiskCase, SpiralDiskGeometryProvider);
}
