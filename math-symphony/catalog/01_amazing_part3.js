import { defineController, defineExpression, defineScene, defineScore } from './schema.js';

const aController = defineController({
    id: 'a',
    label: 'a',
    mode: 'play_once',
    min: 0,
    max: 30,
    initial: 1.6,
    durationMs: 11428,
    precision: 2
});

export const amazingPart3Score = defineScore({
    id: 'amazing-part-3',
    number: '01',
    title: 'Amazing Animations Part 3',
    theme: 'Minimalist Resonance and Grid Distortion',
    sourceUrl: 'https://www.desmos.com/calculator/ym9zdoboer',
    palette: [
        { label: 'Red', value: '#ff0000' },
        { label: 'Green', value: '#00ff00' },
        { label: 'White', value: '#ffffff' }
    ],
    controllers: [aController],
    scenes: [
        defineScene({
            id: 'linear-resonance',
            title: 'Linear Resonance',
            summary: 'Traditional wave functions with high-speed frequency modulation.',
            caption: 'Three resonance studies scan the same frequency controller from calm to dense.',
            focusNote: 'The focused curve changes over time while a keeps sweeping forward.',
            durationMs: 11428,
            activeControllers: ['a'],
            expressions: [
                defineExpression({
                    id: 'standard-resonance',
                    name: 'Standard Resonance',
                    type: 'cartesian',
                    formula: 'y = cos(ax)',
                    latex: 'y = \\cos(ax)',
                    paramKeys: ['a'],
                    bounds: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
                    sample: {
                        y: ({ x, params }) => Math.cos(params.a * x)
                    }
                }),
                defineExpression({
                    id: 'expanding-resonance',
                    name: 'Expanding Resonance',
                    type: 'cartesian',
                    formula: 'y = x * cos(ax)',
                    latex: 'y = x \\cdot \\cos(ax)',
                    paramKeys: ['a'],
                    bounds: { xMin: -10, xMax: 10, yMin: -8, yMax: 8 },
                    sample: {
                        y: ({ x, params }) => x * Math.cos(params.a * x)
                    }
                }),
                defineExpression({
                    id: 'envelope-modulation',
                    name: 'Envelope Modulation',
                    type: 'cartesian',
                    formula: 'y = cos(x) * cos(ax)',
                    latex: 'y = \\cos(x) \\cdot \\cos(ax)',
                    paramKeys: ['a'],
                    bounds: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 },
                    sample: {
                        y: ({ x, params }) => Math.cos(x) * Math.cos(params.a * x)
                    }
                })
            ]
        }),
        defineScene({
            id: 'grid-distortion',
            title: 'Grid Distortion',
            summary: 'A bending coordinate mesh driven by the same frequency scan.',
            caption: 'The coordinate mesh tightens and buckles as the shared controller increases.',
            focusNote: 'This scene is about density, not melody. Watch the cells compress.',
            durationMs: 11428,
            activeControllers: ['a'],
            expressions: [
                defineExpression({
                    id: 'grid-mesh',
                    name: 'Grid Distortion',
                    type: 'implicit',
                    formula: 'cos(ax) = sin(ay)',
                    latex: '\\cos(ax) = \\sin(ay)',
                    paramKeys: ['a'],
                    bounds: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                    sample: {
                        value: ({ x, y, params }) => Math.cos(params.a * x) - Math.sin(params.a * y),
                        threshold: 0.08
                    }
                })
            ]
        }),
        defineScene({
            id: 'radial-whirlpool',
            title: 'Radial Whirlpool',
            summary: 'Square-like interference ripples centered at the origin.',
            caption: 'The final field turns the same controller into a whirlpool around the origin.',
            focusNote: 'Listen for a more singular tone while the interference surface sharpens.',
            durationMs: 11428,
            activeControllers: ['a'],
            expressions: [
                defineExpression({
                    id: 'whirlpool-field',
                    name: 'Radial Whirlpool',
                    type: 'implicit',
                    formula: 'y = 4.8 * cos(a*x*y / (x^2 + y^2))',
                    latex: 'y = 4.8 \\cos\\left(\\frac{axy}{x^2 + y^2}\\right)',
                    paramKeys: ['a'],
                    bounds: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
                    sample: {
                        value: ({ x, y, params }) => y - 4.8 * Math.cos((params.a * x * y) / (x * x + y * y + 0.1)),
                        threshold: 0.12
                    }
                })
            ]
        })
    ]
});
