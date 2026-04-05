import { defineExpression, defineScene, defineScore } from './schema.js';

export const parametricFocusedScore = defineScore({
    id: 'parametric-focused',
    number: '03',
    title: 'Parametric Focused',
    theme: 'Catalog of parametric harmonics.',
    sourceUrl: 'https://www.desmos.com/calculator/kjc0kgexmy',
    palette: [
        { label: 'Cyan', value: '#00ffff' },
        { label: 'Orange', value: '#005aff' },
        { label: 'Yellow', value: '#0000ff' },
        { label: 'Lime', value: '#5fdf0f' }
    ],
    controllers: [],
    scenes: [
        defineScene({
            id: 'basic-foundations',
            title: 'Basic Foundations',
            summary: 'Diagonal motion, sine traces, circles, and an intro Lissajous.',
            caption: 'The catalog opens with clear parametric anchors before density arrives.',
            focusNote: 'These are the reference motions that make later complexity legible.',
            durationMs: 9000,
            activeControllers: [],
            expressions: [
                defineExpression({
                    id: 'diag-line',
                    name: 'Diagonal',
                    type: 'parametric',
                    formula: '(t, t)',
                    latex: '(t, t)',
                    bounds: { xMin: -7, xMax: 7, yMin: -7, yMax: 7 },
                    sample: {
                        domain: { min: -2 * Math.PI, max: 2 * Math.PI },
                        x: ({ t }) => t,
                        y: ({ t }) => t
                    }
                }),
                defineExpression({
                    id: 'sine-trace',
                    name: 'Sine Wave Trace',
                    type: 'parametric',
                    formula: '(t, sin(t))',
                    latex: '(t, \\sin(t))',
                    bounds: { xMin: -7, xMax: 7, yMin: -2, yMax: 2 },
                    sample: {
                        domain: { min: -2 * Math.PI, max: 2 * Math.PI },
                        x: ({ t }) => t,
                        y: ({ t }) => Math.sin(t)
                    }
                }),
                defineExpression({
                    id: 'unit-circle',
                    name: 'Unit Circle',
                    type: 'parametric',
                    formula: '(cos(t), sin(t))',
                    latex: '(\\cos(t), \\sin(t))',
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 2 * Math.PI },
                        x: ({ t }) => Math.cos(t),
                        y: ({ t }) => Math.sin(t)
                    }
                }),
                defineExpression({
                    id: 'intro-lissajous',
                    name: 'Intro Lissajous',
                    type: 'parametric',
                    formula: '(cos(t), sin(4t))',
                    latex: '(\\cos(t), \\sin(4t))',
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 2 * Math.PI },
                        x: ({ t }) => Math.cos(t),
                        y: ({ t }) => Math.sin(4 * t)
                    }
                })
            ]
        }),
        defineScene({
            id: 'trigonometric-interference',
            title: 'Trigonometric Interference',
            summary: 'Fast oscillation, csc spikes, and oval interference patterns.',
            caption: 'The curves stop behaving like simple paths and start building texture.',
            focusNote: 'Watch how frequency turns into apparent surfaces without filling them.',
            durationMs: 10000,
            activeControllers: [],
            expressions: [
                defineExpression({
                    id: 'vertical-oscillation',
                    name: 'Vertical Oscillation',
                    type: 'parametric',
                    formula: '(cos(t), sin(99t))',
                    latex: '(\\cos(t), \\sin(99t))',
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 2 * Math.PI },
                        x: ({ t }) => Math.cos(t),
                        y: ({ t }) => Math.sin(99 * t)
                    }
                }),
                defineExpression({
                    id: 'csc-cos-mesh',
                    name: 'Cosecant Mesh',
                    type: 'parametric',
                    formula: '(sin(t), csc(t) * cos(99t))',
                    latex: '(\\sin(t), \\csc(t) \\cdot \\cos(99t))',
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -8, yMax: 8 },
                    sample: {
                        domain: { min: 0.12, max: 2 * Math.PI - 0.12 },
                        x: ({ t }) => Math.sin(t),
                        y: ({ t }) => (1 / Math.sin(t)) * Math.cos(99 * t)
                    }
                }),
                defineExpression({
                    id: 'ovals-foundation',
                    name: 'Ovals Foundation',
                    type: 'parametric',
                    formula: '(sin(0.98t) + cos(t), cos(t))',
                    latex: '(\\sin(0.98t) + \\cos(t), \\cos(t))',
                    bounds: { xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 10 * Math.PI },
                        x: ({ t }) => Math.sin(0.98 * t) + Math.cos(t),
                        y: ({ t }) => Math.cos(t)
                    }
                }),
                defineExpression({
                    id: 'soft-interference',
                    name: 'Soft Interference',
                    type: 'parametric',
                    formula: '(sin(t) + cos(t), cos(1.67t))',
                    latex: '(\\sin(t) + \\cos(t), \\cos(1.67t))',
                    bounds: { xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 10 * Math.PI },
                        x: ({ t }) => Math.sin(t) + Math.cos(t),
                        y: ({ t }) => Math.cos(1.67 * t)
                    }
                })
            ]
        }),
        defineScene({
            id: 'tangent-secant-mesh',
            title: 'Tangent and Secant Mesh',
            summary: 'Asymptotic grids that begin to look like woven structures.',
            caption: 'This is where parametric sampling starts to impersonate architecture.',
            focusNote: 'The crown-like expression is the most structurally legible of the set.',
            durationMs: 12000,
            activeControllers: [],
            expressions: [
                defineExpression({
                    id: 'tan-sec-grid-a',
                    name: 'Tan Sec Grid A',
                    type: 'parametric',
                    formula: '(tan(19.5t), sec(t) + sin(40t))',
                    latex: '(\\tan(19.5t), \\sec(t) + \\sin(40t))',
                    bounds: { xMin: -12, xMax: 12, yMin: -8, yMax: 8 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.05, max: Math.PI / 2 - 0.05 },
                        x: ({ t }) => Math.tan(19.5 * t),
                        y: ({ t }) => 1 / Math.cos(t) + Math.sin(40 * t)
                    }
                }),
                defineExpression({
                    id: 'tan-sec-grid-b',
                    name: 'Tan Sec Grid B',
                    type: 'parametric',
                    formula: '(tan(20.5t), sec(t) + sin(41t) * tan(t))',
                    latex: '(\\tan(20.5t), \\sec(t) + \\sin(41t)\\tan(t))',
                    bounds: { xMin: -12, xMax: 12, yMin: -10, yMax: 10 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.05, max: Math.PI / 2 - 0.05 },
                        x: ({ t }) => Math.tan(20.5 * t),
                        y: ({ t }) => 1 / Math.cos(t) + Math.sin(41 * t) * Math.tan(t)
                    }
                }),
                defineExpression({
                    id: 'tan-sin-sec',
                    name: 'Tan Sin Sec',
                    type: 'parametric',
                    formula: '(tan(30t) + sin(t), sec(t) * sin(30t))',
                    latex: '(\\tan(30t) + \\sin(t), \\sec(t) \\cdot \\sin(30t))',
                    bounds: { xMin: -14, xMax: 14, yMin: -12, yMax: 12 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.05, max: Math.PI / 2 - 0.05 },
                        x: ({ t }) => Math.tan(30 * t) + Math.sin(t),
                        y: ({ t }) => (1 / Math.cos(t)) * Math.sin(30 * t)
                    }
                }),
                defineExpression({
                    id: 'crown-expression',
                    name: 'Crown Expression',
                    type: 'parametric',
                    formula: '(tan(t), csc(t) * tan(0.98t) - sin(t))',
                    latex: '(\\tan(t), \\csc(t) \\cdot \\tan(0.98t) - \\sin(t))',
                    bounds: { xMin: -14, xMax: 14, yMin: -14, yMax: 14 },
                    sample: {
                        domain: { min: 0.12, max: 6 * Math.PI - 0.12 },
                        x: ({ t }) => Math.tan(t),
                        y: ({ t }) => (1 / Math.sin(t)) * Math.tan(0.98 * t) - Math.sin(t)
                    }
                })
            ]
        }),
        defineScene({
            id: 'extreme-complexity',
            title: 'Extreme Complexity',
            summary: 'Dense tangent projections and the most difficult final combinations.',
            caption: 'The final block abandons introductory clarity and leans into raw density.',
            focusNote: 'This is a stress test for both preview rendering and future shot presets.',
            durationMs: 12000,
            activeControllers: [],
            expressions: [
                defineExpression({
                    id: 'final-chapter-a',
                    name: 'Final Chapter A',
                    type: 'parametric',
                    formula: '(5*tan(t) * cos(1.96t), tan(t))',
                    latex: '(5\\tan(t)\\cos(1.96t), \\tan(t))',
                    bounds: { xMin: -16, xMax: 16, yMin: -10, yMax: 10 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.04, max: Math.PI / 2 - 0.04 },
                        x: ({ t }) => 5 * Math.tan(t) * Math.cos(1.96 * t),
                        y: ({ t }) => Math.tan(t)
                    }
                }),
                defineExpression({
                    id: 'final-chapter-b',
                    name: 'Final Chapter B',
                    type: 'parametric',
                    formula: '(tan(50t)/4 + sin(t), csc(t) + sin(100t) * cos(1.2t))',
                    latex: '(\\tan(50t)/4 + \\sin(t), \\csc(t) + \\sin(100t)\\cos(1.2t))',
                    bounds: { xMin: -18, xMax: 18, yMin: -14, yMax: 14 },
                    sample: {
                        domain: { min: 0.12, max: 2 * Math.PI - 0.12 },
                        x: ({ t }) => Math.tan(50 * t) / 4 + Math.sin(t),
                        y: ({ t }) => (1 / Math.sin(t)) + Math.sin(100 * t) * Math.cos(1.2 * t)
                    }
                }),
                defineExpression({
                    id: 'final-chapter-c',
                    name: 'Final Chapter C',
                    type: 'parametric',
                    formula: '(tan(25t) + cos(t), tan(t) * sin(50t))',
                    latex: '(\\tan(25t) + \\cos(t), \\tan(t)\\sin(50t))',
                    bounds: { xMin: -18, xMax: 18, yMin: -16, yMax: 16 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.04, max: Math.PI / 2 - 0.04 },
                        x: ({ t }) => Math.tan(25 * t) + Math.cos(t),
                        y: ({ t }) => Math.tan(t) * Math.sin(50 * t)
                    }
                })
            ]
        })
    ]
});
