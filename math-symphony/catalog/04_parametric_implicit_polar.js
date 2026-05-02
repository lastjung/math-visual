import { defineController, defineExpression, defineScene, defineScore } from './schema.js';

const TAU = Math.PI * 2;
const EPS = 1e-3;

const sec = (value) => 1 / Math.cos(value);
const csc = (value) => 1 / Math.sin(value);
const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;

const controllers = [
    defineController({
        id: 'vs',
        label: 'vs',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: TAU,
        durationMs: 9000,
        precision: 2
    }),
    defineController({
        id: 'vp1',
        label: 'vp1',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 3.26,
        durationMs: 5333,
        precision: 2
    }),
    defineController({
        id: 'vp3',
        label: 'vp3',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 0,
        durationMs: 7600,
        precision: 2
    }),
    defineController({
        id: 'vp6',
        label: 'vp6',
        mode: 'play_once',
        min: -1,
        max: 3,
        initial: 3,
        durationMs: 20000,
        precision: 2
    }),
    defineController({
        id: 'vi2',
        label: 'vi2',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 4.516,
        durationMs: 8000,
        precision: 2
    }),
    defineController({
        id: 'vi5',
        label: 'vi5',
        mode: 'reverse_loop',
        min: -5,
        max: 5,
        initial: -2.6,
        durationMs: 5333,
        precision: 2
    }),
    defineController({
        id: 'vi8',
        label: 'vi8',
        mode: 'play_once',
        min: -5,
        max: 30,
        initial: 30,
        durationMs: 20000,
        precision: 2
    }),
    defineController({
        id: 'vi9',
        label: 'vi9',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 0.98,
        durationMs: 5333,
        precision: 2
    }),
    defineController({
        id: 'vr1',
        label: 'vr1',
        mode: 'reverse_loop',
        min: -3,
        max: 3,
        initial: 1.2,
        durationMs: 7000,
        precision: 2
    }),
    defineController({
        id: 'vr2',
        label: 'vr2',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 0,
        durationMs: 6400,
        precision: 2
    }),
    defineController({
        id: 'vr7',
        label: 'vr7',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 0,
        durationMs: 9000,
        precision: 2
    }),
    defineController({
        id: 'vr8',
        label: 'vr8',
        mode: 'loop',
        min: 0,
        max: TAU,
        initial: 2.4,
        durationMs: 8500,
        precision: 2
    })
];

export const parametricImplicitPolarScore = defineScore({
    id: 'parametric-implicit-polar',
    number: '04',
    title: 'Parametric, Implicit, and Polar',
    theme: 'Mixed-family harmonized variations.',
    sourceUrl: 'https://www.desmos.com/calculator/zlg8qm6wtn',
    palette: [
        { label: 'Cyan', value: '#ff0000' },
        { label: 'Green', value: '#ff00ff' },
        { label: 'Yellow', value: '#0000ff' },
        { label: 'Orange', value: '#005aff' },
        { label: 'Red', value: '#00ffff' }
    ],
    controllers,
    scenes: [
        defineScene({
            id: 'mixed-thumbnail-state',
            title: 'Mixed Thumbnail State',
            summary: 'The thumbnail polar bloom is paired with one parametric twist and one implicit wave test.',
            caption: 'This scene deliberately mixes all expression families to test the runtime contract.',
            focusNote: 'If this scene stays readable, the catalog can carry mixed-family scores without ad hoc branching.',
            durationMs: 12000,
            activeControllers: ['vs', 'vp1', 'vi2'],
            expressions: [
                defineExpression({
                    id: 'thumbnail-sec-bloom',
                    name: 'Secant Bloom',
                    type: 'polar',
                    formula: 'r = sec(1.2theta + vs) + sin(3vs + cos(1.2theta + sin(1.2theta)))',
                    latex: 'r = \sec(1.2\theta + v_s) + \sin(3v_s + \cos(1.2\theta + \sin(1.2\theta)))',
                    paramKeys: ['vs'],
                    bounds: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
                    sample: {
                        domain: { min: 0, max: TAU * 2 },
                        r: ({ theta, params }) => sec(1.2 * theta + params.vs) + Math.sin(3 * params.vs + Math.cos(1.2 * theta + Math.sin(1.2 * theta)))
                    }
                }),
                defineExpression({
                    id: 'tan-twist-reference',
                    name: 'Tan Twist Reference',
                    type: 'parametric',
                    formula: '(tan(t + vp1), sin(t))',
                    latex: '(\tan(t + v_{p1}), \sin(t))',
                    paramKeys: ['vp1'],
                    bounds: { xMin: -8, xMax: 8, yMin: -2, yMax: 2 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.08, max: Math.PI / 2 - 0.08 },
                        x: ({ t, params }) => Math.tan(t + params.vp1),
                        y: ({ t }) => Math.sin(t)
                    }
                }),
                defineExpression({
                    id: 'implicit-tan-rise-reference',
                    name: 'Tan Rise Reference',
                    type: 'implicit',
                    formula: 'y = tan(x + vi2) - sin(10x + cos(x))',
                    latex: 'y = \tan(x + v_{i2}) - \sin(10x + \cos(x))',
                    paramKeys: ['vi2'],
                    bounds: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
                    sample: {
                        value: ({ x, y, params }) => y - (Math.tan(x + params.vi2) - Math.sin(10 * x + Math.cos(x))),
                        threshold: 0.08
                    }
                })
            ]
        }),
        defineScene({
            id: 'parametric-mastery',
            title: 'Parametric Mastery',
            summary: 'Tangent twists, nested sine loops, and a slow growth controller stress discontinuities and motion.',
            caption: 'Parametric curves dominate here, with asymptotes and nested oscillations forcing the sampler to skip invalid points cleanly.',
            focusNote: 'The growing tangent trace is the clearest motion test because vp6 runs once instead of looping.',
            durationMs: 14000,
            activeControllers: ['vp1', 'vp3', 'vp6'],
            expressions: [
                defineExpression({
                    id: 'tan-twist-composite-a',
                    name: 'Tan Twist Composite A',
                    type: 'parametric',
                    formula: '(tan(2t + vp1) + cos(4t), sin(3t) + cos(5t))',
                    latex: '(\tan(2t + v_{p1}) + \cos(4t), \sin(3t) + \cos(5t))',
                    paramKeys: ['vp1'],
                    bounds: { xMin: -12, xMax: 12, yMin: -3, yMax: 3 },
                    sample: {
                        domain: { min: -Math.PI, max: Math.PI },
                        x: ({ t, params }) => Math.tan(2 * t + params.vp1) + Math.cos(4 * t),
                        y: ({ t }) => Math.sin(3 * t) + Math.cos(5 * t)
                    }
                }),
                defineExpression({
                    id: 'weird-loop-nested',
                    name: 'Weird Nested Loop',
                    type: 'parametric',
                    formula: '(cos(t + cos(t + cos(3t + vp3))), sin(t + sin(t + sin(2t + vp3))))',
                    latex: '(\cos(t + \cos(t + \cos(3t + v_{p3}))), \sin(t + \sin(t + \sin(2t + v_{p3}))))',
                    paramKeys: ['vp3'],
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: TAU * 2 },
                        x: ({ t, params }) => Math.cos(t + Math.cos(t + Math.cos(3 * t + params.vp3))),
                        y: ({ t, params }) => Math.sin(t + Math.sin(t + Math.sin(2 * t + params.vp3)))
                    }
                }),
                defineExpression({
                    id: 'tan-grow',
                    name: 'Tan Grow',
                    type: 'parametric',
                    formula: '(tan(vp6*t), sin(2t + 5vp6) * cos(3t))',
                    latex: '(\tan(v_{p6}t), \sin(2t + 5v_{p6})\cos(3t))',
                    paramKeys: ['vp6'],
                    bounds: { xMin: -12, xMax: 12, yMin: -2, yMax: 2 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.08, max: Math.PI / 2 - 0.08 },
                        x: ({ t, params }) => Math.tan(params.vp6 * t),
                        y: ({ t, params }) => Math.sin(2 * t + 5 * params.vp6) * Math.cos(3 * t)
                    }
                })
            ]
        }),
        defineScene({
            id: 'implicit-pressure-field',
            title: 'Implicit Pressure Field',
            summary: 'Implicit sine and tangent equations pressure-test grid scanning and threshold choices.',
            caption: 'This scene is intentionally heavier: contours must appear without freezing the basic preview renderer.',
            focusNote: 'Change Axis is the most important line because vi5 crosses negative and positive control ranges.',
            durationMs: 15000,
            activeControllers: ['vi5', 'vi8', 'vi9'],
            expressions: [
                defineExpression({
                    id: 'change-axis',
                    name: 'Change Axis',
                    type: 'implicit',
                    formula: 'sin(x) = vi5*cos(y) + sin(2x + vi5)',
                    latex: '\sin(x) = v_{i5}\cos(y) + \sin(2x + v_{i5})',
                    paramKeys: ['vi5'],
                    bounds: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
                    sample: {
                        value: ({ x, y, params }) => Math.sin(x) - (params.vi5 * Math.cos(y) + Math.sin(2 * x + params.vi5)),
                        threshold: 0.06
                    }
                }),
                defineExpression({
                    id: 'cos-sec-hyperbola',
                    name: 'Cos and Sec Hyperbola',
                    type: 'implicit',
                    formula: 'x^2 - y^2 = sec(vi8*x)',
                    latex: 'x^2 - y^2 = \sec(v_{i8}x)',
                    paramKeys: ['vi8'],
                    bounds: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
                    sample: {
                        value: ({ x, y, params }) => x * x - y * y - sec(params.vi8 * x),
                        threshold: 0.12
                    }
                }),
                defineExpression({
                    id: 'modulo-waves',
                    name: 'Modulo Waves',
                    type: 'implicit',
                    formula: 'y = sin(x) + mod(x + sin(x + vi9), 0.5)',
                    latex: 'y = \sin(x) + \operatorname{mod}(x + \sin(x + v_{i9}), 0.5)',
                    paramKeys: ['vi9'],
                    bounds: { xMin: -8, xMax: 8, yMin: -2, yMax: 2 },
                    sample: {
                        value: ({ x, y, params }) => y - (Math.sin(x) + mod(x + Math.sin(x + params.vi9), 0.5)),
                        threshold: 0.045
                    }
                })
            ]
        }),
        defineScene({
            id: 'polar-design-suite',
            title: 'Polar Design Suite',
            summary: 'Rose structures, secant spikes, and thumbnail-class polar equations define the score finale.',
            caption: 'The finale returns to radial grammar, where secant discontinuities and dense angular modulation dominate.',
            focusNote: 'Polar 7 is the cinematic anchor; the other curves orbit around its symmetry.',
            durationMs: 15000,
            activeControllers: ['vr1', 'vr2', 'vr7', 'vr8', 'vs'],
            expressions: [
                defineExpression({
                    id: 'polar-rose-drift',
                    name: 'Polar Rose Drift',
                    type: 'polar',
                    formula: 'r = sin(vr1 + 4theta) + vr1',
                    latex: 'r = \sin(v_{r1} + 4\theta) + v_{r1}',
                    paramKeys: ['vr1'],
                    bounds: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
                    sample: {
                        domain: { min: 0, max: TAU * 2 },
                        r: ({ theta, params }) => Math.sin(params.vr1 + 4 * theta) + params.vr1
                    }
                }),
                defineExpression({
                    id: 'polar-soft-flower',
                    name: 'Soft Flower',
                    type: 'polar',
                    formula: 'r = sin(theta + vr2) + cos(4theta)',
                    latex: 'r = \sin(\theta + v_{r2}) + \cos(4\theta)',
                    paramKeys: ['vr2'],
                    bounds: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
                    sample: {
                        domain: { min: 0, max: TAU * 2 },
                        r: ({ theta, params }) => Math.sin(theta + params.vr2) + Math.cos(4 * theta)
                    }
                }),
                defineExpression({
                    id: 'polar-cinematic-anchor',
                    name: 'Cinematic Anchor',
                    type: 'polar',
                    formula: '2r = 6sin(1.2theta) - cos(6theta + vr7)',
                    latex: '2r = 6\sin(1.2\theta) - \cos(6\theta + v_{r7})',
                    paramKeys: ['vr7'],
                    bounds: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
                    sample: {
                        domain: { min: 0, max: TAU * 5 },
                        r: ({ theta, params }) => (6 * Math.sin(1.2 * theta) - Math.cos(6 * theta + params.vr7)) / 2
                    }
                }),
                defineExpression({
                    id: 'polar-sec-spikes',
                    name: 'Secant Spikes',
                    type: 'polar',
                    formula: 'r = sec(vr8 + 0.5theta + sin(2.01theta))',
                    latex: 'r = \sec(v_{r8} + 0.5\theta + \sin(2.01\theta))',
                    paramKeys: ['vr8'],
                    bounds: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                    sample: {
                        domain: { min: 0, max: TAU * 4 },
                        r: ({ theta, params }) => {
                            const value = sec(params.vr8 + 0.5 * theta + Math.sin(2.01 * theta));
                            return Math.abs(value) > 18 ? NaN : value;
                        }
                    }
                }),
                defineExpression({
                    id: 'polar-thumbnail-rhythm',
                    name: 'Thumbnail Rhythm',
                    type: 'polar',
                    formula: 'r = sec(1.2theta + vs) + sin(theta*vs)',
                    latex: 'r = \sec(1.2\theta + v_s) + \sin(\theta v_s)',
                    paramKeys: ['vs'],
                    bounds: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 },
                    sample: {
                        domain: { min: 0, max: TAU * 3 },
                        r: ({ theta, params }) => {
                            const value = sec(1.2 * theta + params.vs) + Math.sin(theta * params.vs);
                            return Math.abs(value) > 18 ? NaN : value;
                        }
                    }
                })
            ]
        })
    ]
});
