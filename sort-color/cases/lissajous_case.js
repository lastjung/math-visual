const LissajousCase = {
    pointCount: 360,
    multiplier: 2,
    multiplierSpeed: 0,
    lineWidth: 1.55,
    lineAlpha: 0.44,
    pointRadius: 1.05,
    colorMode: 'angle',
    renderMode: 'light',
    sortMode: 'off',
    sortingStatus: 'idle',
    sortSpeed: 150,
    rotation: -Math.PI / 2,
    lissajousA: 3,
    lissajousB: 2,
    lissajousPhaseDeg: 90,
    guideText: [
        '[Lissajous controls]',
        '- N (Nodes): number of anchors sampled across the closed curve.',
        '- M (Link): mapping rule for connections, i -> (M*i) mod N.',
        '- A / B: frequency ratio on x and y axes.',
        '- Formula idea: x = sin(A*t + phase), y = sin(B*t).',
        '- A controls the horizontal rhythm; B controls the vertical rhythm.',
        '- The ratio A:B matters most. 3:2, 5:4, 7:5 produce distinct resonance patterns.',
        '- Example ratios:',
        '  1:1 = line / ellipse-like',
        '  2:1 = figure-eight feel',
        '  3:2 = balanced resonance',
        '  5:4 = dense woven loop',
        '  7:5 = tighter interference',
        '- Phase: horizontal phase offset in degrees.',
        '- Small A:B ratios reveal clean resonance; larger gaps create denser interference.'
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
        const extraControls = [
            {
                type: 'slider',
                id: 'mc_lissajous_a',
                label: 'Freq A',
                min: 1,
                max: 12,
                step: 1,
                value: this.lissajousA,
                onChange: (v) => {
                    this.lissajousA = Math.max(1, Math.floor(v));
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_lissajous_b',
                label: 'Freq B',
                min: 1,
                max: 12,
                step: 1,
                value: this.lissajousB,
                onChange: (v) => {
                    this.lissajousB = Math.max(1, Math.floor(v));
                    this.resetSortState('idle');
                    this.draw();
                }
            },
            {
                type: 'slider',
                id: 'mc_lissajous_phase',
                label: 'Phase',
                min: 0,
                max: 180,
                step: 0.1,
                value: this.lissajousPhaseDeg,
                onChange: (v) => {
                    this.lissajousPhaseDeg = Math.max(0, Math.min(180, Number(v)));
                    this.resetSortState('idle');
                    this.draw();
                }
            }
        ];

        if (speedIndex >= 0) controls.splice(speedIndex + 1, 0, ...extraControls);
        else controls.push(...extraControls);

        return controls;
    },

    reset() {
        CardioidCircleCase.reset.call(this);
        this.pointCount = 360;
        this.multiplier = 2;
        this.lineWidth = 1.55;
        this.lineAlpha = 0.44;
        this.pointRadius = 1.05;
        this.colorMode = 'angle';
        this.lissajousA = 3;
        this.lissajousB = 2;
        this.lissajousPhaseDeg = 90;
        this.draw();
        if (typeof Core !== 'undefined' && Core.currentCase === this) Core.updateControls();
    },

    circlePoint(i, n, radius, cx, cy) {
        return this.getLissajousPoint(i, n, radius, cx, cy);
    },

    circlePointByIndex(index, n, radius, cx, cy) {
        return this.getLissajousPointByIndex(index, n, radius, cx, cy);
    },

    lineVisual(i, n, from, to, radius, alphaOverride = null) {
        return this.getLissajousLineVisual(i, n, from, to, radius, alphaOverride);
    },

    lineColor(i, n, from, to, radius) {
        return this.getLissajousLineColor(i, n, from, to, radius);
    }
};

Object.setPrototypeOf(LissajousCase, CardioidCircleCase);

if (typeof LissajousGeometryProvider !== 'undefined') {
    Object.assign(LissajousCase, LissajousGeometryProvider);
}
