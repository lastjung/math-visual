import { defineController, defineExpression, defineScene, defineScore } from './schema.js';

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
    controllers: [
        defineController({
            id: 'phase',
            label: 'phase',
            mode: 'loop',
            min: 0,
            max: Math.PI * 2,
            initial: 0,
            durationMs: 3600,
            precision: 2
        }),
        defineController({
            id: 'drift',
            label: 'drift',
            mode: 'reverse_loop',
            min: -0.45,
            max: 0.45,
            initial: 0,
            durationMs: 5200,
            precision: 2
        })
    ],
    scenes: [
        defineScene({
            id: 'basic-foundations',
            title: 'Basic Foundations',
            summary: 'Diagonal motion, sine traces, circles, and an intro Lissajous.',
            caption: 'The catalog opens with clear parametric anchors before density arrives.',
            focusNote: 'These are the reference motions that make later complexity legible.',
            durationMs: 9000,
            activeControllers: ['phase', 'drift'],
            expressions: [
                defineExpression({
                    id: 'diag-line',
                    name: 'Diagonal',
                    type: 'parametric',
                    formula: '(t, t)',
                    latex: '(t, t)',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -7, xMax: 7, yMin: -7, yMax: 7 },
                    sample: {
                        domain: { min: -2 * Math.PI, max: 2 * Math.PI },
                        x: ({ t, params }) => t + Math.sin((params.phase || 0) + t * 0.35) * 0.18,
                        y: ({ t, params }) => t + (params.drift || 0) * 1.6
                    }
                }),
                defineExpression({
                    id: 'sine-trace',
                    name: 'Sine Wave Trace',
                    type: 'parametric',
                    formula: '(t, sin(t))',
                    latex: '(t, \\sin(t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -7, xMax: 7, yMin: -2, yMax: 2 },
                    sample: {
                        domain: { min: -2 * Math.PI, max: 2 * Math.PI },
                        x: ({ t, params }) => t,
                        y: ({ t, params }) => Math.sin(t + (params.phase || 0) * 0.6) + (params.drift || 0) * 0.45
                    }
                }),
                defineExpression({
                    id: 'unit-circle',
                    name: 'Unit Circle',
                    type: 'parametric',
                    formula: '(cos(t), sin(t))',
                    latex: '(\\cos(t), \\sin(t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 2 * Math.PI },
                        x: ({ t, params }) => (1 + (params.drift || 0) * 0.12) * Math.cos(t + (params.phase || 0) * 0.8),
                        y: ({ t, params }) => (1 - (params.drift || 0) * 0.12) * Math.sin(t + (params.phase || 0) * 0.8)
                    }
                }),
                defineExpression({
                    id: 'intro-lissajous',
                    name: 'Intro Lissajous',
                    type: 'parametric',
                    formula: '(cos(t), sin(4t))',
                    latex: '(\\cos(t), \\sin(4t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 2 * Math.PI },
                        x: ({ t, params }) => Math.cos(t + (params.phase || 0) * 0.7),
                        y: ({ t, params }) => Math.sin(4 * t + (params.phase || 0) * 1.4) * (1 + (params.drift || 0) * 0.08)
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
            activeControllers: ['phase', 'drift'],
            expressions: [
                defineExpression({
                    id: 'vertical-oscillation',
                    name: 'Vertical Oscillation',
                    type: 'parametric',
                    formula: '(cos(t), sin(99t))',
                    latex: '(\\cos(t), \\sin(99t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 2 * Math.PI },
                        x: ({ t, params }) => Math.cos(t + (params.phase || 0) * 0.35),
                        y: ({ t, params }) => Math.sin(99 * t + (params.phase || 0) * 2.2) * (1 + (params.drift || 0) * 0.05)
                    }
                }),
                defineExpression({
                    id: 'csc-cos-mesh',
                    name: 'Cosecant Mesh',
                    type: 'parametric',
                    formula: '(sin(t), csc(t) * cos(99t))',
                    latex: '(\\sin(t), \\csc(t) \\cdot \\cos(99t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -1.5, xMax: 1.5, yMin: -8, yMax: 8 },
                    sample: {
                        domain: { min: 0.12, max: 2 * Math.PI - 0.12 },
                        x: ({ t, params }) => Math.sin(t + (params.phase || 0) * 0.2),
                        y: ({ t, params }) => (1 / Math.sin(t)) * Math.cos(99 * t + (params.phase || 0) * 2.4) + (params.drift || 0) * 0.4
                    }
                }),
                defineExpression({
                    id: 'ovals-foundation',
                    name: 'Ovals Foundation',
                    type: 'parametric',
                    formula: '(sin(0.98t) + cos(t), cos(t))',
                    latex: '(\\sin(0.98t) + \\cos(t), \\cos(t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 10 * Math.PI },
                        x: ({ t, params }) => Math.sin(0.98 * t + (params.phase || 0) * 0.3) + Math.cos(t),
                        y: ({ t, params }) => Math.cos(t + (params.phase || 0) * 0.25) + (params.drift || 0) * 0.18
                    }
                }),
                defineExpression({
                    id: 'soft-interference',
                    name: 'Soft Interference',
                    type: 'parametric',
                    formula: '(sin(t) + cos(t), cos(1.67t))',
                    latex: '(\\sin(t) + \\cos(t), \\cos(1.67t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -2.5, xMax: 2.5, yMin: -1.5, yMax: 1.5 },
                    sample: {
                        domain: { min: 0, max: 10 * Math.PI },
                        x: ({ t, params }) => Math.sin(t + (params.phase || 0) * 0.2) + Math.cos(t - (params.phase || 0) * 0.18),
                        y: ({ t, params }) => Math.cos(1.67 * t + (params.phase || 0) * 0.6)
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
            activeControllers: ['phase', 'drift'],
            expressions: [
                defineExpression({
                    id: 'tan-sec-grid-a',
                    name: 'Tan Sec Grid A',
                    type: 'parametric',
                    formula: '(tan(19.5t), sec(t) + sin(40t))',
                    latex: '(\\tan(19.5t), \\sec(t) + \\sin(40t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -12, xMax: 12, yMin: -8, yMax: 8 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.05, max: Math.PI / 2 - 0.05 },
                        x: ({ t, params }) => Math.tan(19.5 * t + (params.phase || 0) * 0.08),
                        y: ({ t, params }) => 1 / Math.cos(t) + Math.sin(40 * t + (params.phase || 0)) + (params.drift || 0) * 0.5
                    }
                }),
                defineExpression({
                    id: 'tan-sec-grid-b',
                    name: 'Tan Sec Grid B',
                    type: 'parametric',
                    formula: '(tan(20.5t), sec(t) + sin(41t) * tan(t))',
                    latex: '(\\tan(20.5t), \\sec(t) + \\sin(41t)\\tan(t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -12, xMax: 12, yMin: -10, yMax: 10 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.05, max: Math.PI / 2 - 0.05 },
                        x: ({ t, params }) => Math.tan(20.5 * t + (params.phase || 0) * 0.08),
                        y: ({ t, params }) => 1 / Math.cos(t) + Math.sin(41 * t + (params.phase || 0)) * Math.tan(t)
                    }
                }),
                defineExpression({
                    id: 'tan-sin-sec',
                    name: 'Tan Sin Sec',
                    type: 'parametric',
                    formula: '(tan(30t) + sin(t), sec(t) * sin(30t))',
                    latex: '(\\tan(30t) + \\sin(t), \\sec(t) \\cdot \\sin(30t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -14, xMax: 14, yMin: -12, yMax: 12 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.05, max: Math.PI / 2 - 0.05 },
                        x: ({ t, params }) => Math.tan(30 * t + (params.phase || 0) * 0.06) + Math.sin(t),
                        y: ({ t, params }) => (1 / Math.cos(t)) * Math.sin(30 * t + (params.phase || 0))
                    }
                }),
                defineExpression({
                    id: 'crown-expression',
                    name: 'Crown Expression',
                    type: 'parametric',
                    formula: '(tan(t), csc(t) * tan(0.98t) - sin(t))',
                    latex: '(\\tan(t), \\csc(t) \\cdot \\tan(0.98t) - \\sin(t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -14, xMax: 14, yMin: -14, yMax: 14 },
                    sample: {
                        domain: { min: 0.12, max: 6 * Math.PI - 0.12 },
                        x: ({ t, params }) => Math.tan(t + (params.phase || 0) * 0.04),
                        y: ({ t, params }) => (1 / Math.sin(t)) * Math.tan(0.98 * t + (params.phase || 0) * 0.16) - Math.sin(t) + (params.drift || 0) * 0.35
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
            activeControllers: ['phase', 'drift'],
            expressions: [
                defineExpression({
                    id: 'final-chapter-a',
                    name: 'Final Chapter A',
                    type: 'parametric',
                    formula: '(5*tan(t) * cos(1.96t), tan(t))',
                    latex: '(5\\tan(t)\\cos(1.96t), \\tan(t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -16, xMax: 16, yMin: -10, yMax: 10 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.04, max: Math.PI / 2 - 0.04 },
                        x: ({ t, params }) => 5 * Math.tan(t) * Math.cos(1.96 * t + (params.phase || 0) * 0.4),
                        y: ({ t, params }) => Math.tan(t + (params.phase || 0) * 0.05)
                    }
                }),
                defineExpression({
                    id: 'final-chapter-b',
                    name: 'Final Chapter B',
                    type: 'parametric',
                    formula: '(tan(50t)/4 + sin(t), csc(t) + sin(100t) * cos(1.2t))',
                    latex: '(\\tan(50t)/4 + \\sin(t), \\csc(t) + \\sin(100t)\\cos(1.2t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -18, xMax: 18, yMin: -14, yMax: 14 },
                    sample: {
                        domain: { min: 0.12, max: 2 * Math.PI - 0.12 },
                        x: ({ t, params }) => Math.tan(50 * t + (params.phase || 0) * 0.12) / 4 + Math.sin(t),
                        y: ({ t, params }) => (1 / Math.sin(t)) + Math.sin(100 * t + (params.phase || 0) * 1.8) * Math.cos(1.2 * t) + (params.drift || 0) * 0.45
                    }
                }),
                defineExpression({
                    id: 'final-chapter-c',
                    name: 'Final Chapter C',
                    type: 'parametric',
                    formula: '(tan(25t) + cos(t), tan(t) * sin(50t))',
                    latex: '(\\tan(25t) + \\cos(t), \\tan(t)\\sin(50t))',
                    paramKeys: ['phase', 'drift'],
                    bounds: { xMin: -18, xMax: 18, yMin: -16, yMax: 16 },
                    sample: {
                        domain: { min: -Math.PI / 2 + 0.04, max: Math.PI / 2 - 0.04 },
                        x: ({ t, params }) => Math.tan(25 * t + (params.phase || 0) * 0.08) + Math.cos(t),
                        y: ({ t, params }) => Math.tan(t) * Math.sin(50 * t + (params.phase || 0) * 1.2)
                    }
                })
            ]
        })
    ]
});
