import { defineController, defineExpression, defineScene, defineScore } from './schema.js';

const v1 = defineController({
    id: 'v1',
    label: 'v1',
    mode: 'static',
    min: -15,
    max: 10,
    initial: 10,
    durationMs: 0,
    precision: 0
});

const v6 = defineController({
    id: 'v6',
    label: 'v6',
    mode: 'static',
    min: -8,
    max: 8,
    initial: -7.07,
    durationMs: 0,
    precision: 2
});

const v9 = defineController({
    id: 'v9',
    label: 'v9',
    mode: 'loop',
    min: 0,
    max: Math.PI * 2,
    initial: 3.01,
    durationMs: 8000,
    precision: 2
});

const v11 = defineController({
    id: 'v11',
    label: 'v11',
    mode: 'static',
    min: 0,
    max: 1,
    initial: 0,
    durationMs: 0,
    precision: 2
});

const v12 = defineController({
    id: 'v12',
    label: 'v12',
    mode: 'static',
    min: 0,
    max: 1,
    initial: 0.19,
    durationMs: 0,
    precision: 2
});

const v13 = defineController({
    id: 'v13',
    label: 'v13',
    mode: 'loop',
    min: 0,
    max: Math.PI * 2,
    initial: 0,
    durationMs: 12000,
    precision: 2
});

const v14 = defineController({
    id: 'v14',
    label: 'v14',
    mode: 'loop',
    min: 0,
    max: Math.PI * 2,
    initial: 4.33,
    durationMs: 8000,
    precision: 2
});

const v15 = defineController({
    id: 'v15',
    label: 'v15',
    mode: 'loop',
    min: 0,
    max: Math.PI * 2,
    initial: 2.25,
    durationMs: 20000,
    precision: 2
});

export const moreBeautifulScore = defineScore({
    id: 'more-beautiful-graphs',
    number: '02',
    title: 'More Beautiful Graphs',
    theme: 'The beauty of sign-based switching logic.',
    sourceUrl: 'https://www.desmos.com/calculator/xxm41sqmv5',
    palette: [
        { label: 'Cyan', value: '#00ffff' },
        { label: 'Orange', value: '#005aff' },
        { label: 'Pink', value: '#00ff00' },
        { label: 'Purple', value: '#6dff00' }
    ],
    controllers: [v1, v6, v9, v11, v12, v13, v14, v15],
    scenes: [
        defineScene({
            id: 'thumbnail-intro',
            title: 'Thumbnail and Intro',
            summary: 'Sign function basics and parametric introduction.',
            durationMs: 6000,
            activeControllers: ['v1'],
            scripts: [
                'What if I told you that you could create stunning animations using math functions?',
                'The sign function returns -1, 0, or +1.'
            ],
            expressions: [
                defineExpression({
                    id: 'sign-x',
                    name: 'Sign Step',
                    type: 'cartesian',
                    formula: 'y = sign(x)',
                    latex: 'y = \\text{sgn}(x)',
                    bounds: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 }
                }),
                defineExpression({
                    id: 'sign-sin-x',
                    name: 'Sign Glitch',
                    type: 'cartesian',
                    formula: 'y = sign(sin(x))',
                    latex: 'y = \\text{sgn}(\\sin(x))',
                    bounds: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 }
                }),
                defineExpression({
                    id: 'parametric-sign',
                    name: 'Sign Trace',
                    type: 'parametric',
                    formula: '(t, sign(t))',
                    latex: '(t, \\text{sgn}(t))',
                    paramKeys: ['v1'],
                    bounds: { xMin: -15, xMax: 10, yMin: -2, yMax: 2 }
                }),
                defineExpression({
                    id: 'diagonal-reference',
                    name: 'Diagonal Reference',
                    type: 'parametric',
                    formula: '(t, t)',
                    latex: '(t, t)',
                    bounds: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
                })
            ]
        }),
        defineScene({
            id: 'parametric-masterpieces',
            title: 'Parametric Masterpieces',
            summary: 'Spinny polar forms and sign-modulated laser beams.',
            durationMs: 12000,
            activeControllers: ['v13', 'v9'],
            expressions: [
                defineExpression({
                    id: 'mind-blowing-spinny',
                    name: 'Mind Blowing Spinny',
                    type: 'polar',
                    formula: 'r = sign(cos(n*theta + 3*v13)) + sin(v13*theta / 20)',
                    latex: 'r = \\text{sgn}(\\cos(n\\theta + 3v_{13})) + \\sin(v_{13}\\theta / 20)',
                    paramKeys: ['v13'],
                    notes: ['n rotates through 2, 3, 4, 7, 6'],
                    bounds: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 }
                }),
                defineExpression({
                    id: 'punk-hair-laser',
                    name: 'Punk Hair and Laser Beams',
                    type: 'cartesian',
                    formula: 'y = x * sign(csc(tan(x + v9) + v9)) + cos(x)',
                    latex: 'y = x \\cdot \\text{sgn}(\\csc(\\tan(x + v_9) + v_9)) + \\cos(x)',
                    paramKeys: ['v9'],
                    bounds: { xMin: -10, xMax: 10, yMin: -12, yMax: 12 }
                })
            ]
        }),
        defineScene({
            id: 'implicit-waves',
            title: 'Implicit Waves',
            summary: 'Surface equations where sign logic bends the line itself.',
            durationMs: 9000,
            activeControllers: ['v6', 'v11', 'v12'],
            expressions: [
                defineExpression({
                    id: 'up-and-down',
                    name: 'Up and Down',
                    type: 'implicit',
                    formula: 'y = v6 * sign(v6*x - y) + cos(v6 + x)',
                    latex: 'y = v_6 \\cdot \\text{sgn}(v_6x - y) + \\cos(v_6 + x)',
                    paramKeys: ['v6'],
                    bounds: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 }
                }),
                defineExpression({
                    id: 'jagged-sine-gcd',
                    name: 'Jagged Sine Wave',
                    type: 'cartesian',
                    formula: 'y = gcd(v11*x) * sign(sin(x)) - sin(x)',
                    latex: 'y = \\gcd(v_{11}x) \\cdot \\text{sgn}(\\sin(x)) - \\sin(x)',
                    paramKeys: ['v11'],
                    bounds: { xMin: -10, xMax: 10, yMin: -12, yMax: 12 }
                }),
                defineExpression({
                    id: 'modulo-wave',
                    name: 'Modulo Jagged Wave',
                    type: 'cartesian',
                    formula: 'y = 2 * sign(sin(x - v12)) + mod(8x, v12) - sin(x + v12)',
                    latex: 'y = 2 \\cdot \\text{sgn}(\\sin(x - v_{12})) + \\bmod(8x, v_{12}) - \\sin(x + v_{12})',
                    paramKeys: ['v12'],
                    bounds: { xMin: -10, xMax: 10, yMin: -4, yMax: 4 }
                })
            ]
        }),
        defineScene({
            id: 'polar-designs',
            title: 'Polar Designs',
            summary: 'Shuriken logic and layered list-based star forms.',
            durationMs: 20000,
            activeControllers: ['v14', 'v15'],
            expressions: [
                defineExpression({
                    id: 'shuriken-logic',
                    name: 'Shuriken Logic',
                    type: 'polar',
                    formula: 'r = sign(cos(k*theta - v14)) + sin(v14 + k.05*theta) * cos(v14)',
                    latex: 'r = \\text{sgn}(\\cos(k\\theta - v_{14})) + \\sin(v_{14} + k.05\\theta)\\cos(v_{14})',
                    paramKeys: ['v14'],
                    notes: ['k cycles through 2, 3, 5'],
                    bounds: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 }
                }),
                defineExpression({
                    id: 'layered-list-shapes',
                    name: 'Layered Polar Shapes',
                    type: 'polar',
                    formula: 'r = l1 * sign(cos(3*theta - l1*v15)) + sin(v15 + 3*theta + l1) - cos(v15)',
                    latex: 'r = l_1 \\cdot \\text{sgn}(\\cos(3\\theta - l_1v_{15})) + \\sin(v_{15} + 3\\theta + l_1) - \\cos(v_{15})',
                    paramKeys: ['v15'],
                    notes: ['l1 = [2, ..., 10]'],
                    bounds: { xMin: -15, xMax: 15, yMin: -15, yMax: 15 }
                })
            ]
        })
    ]
});
