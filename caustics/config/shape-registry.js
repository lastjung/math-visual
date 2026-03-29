/**
 * Shape Registry (Phase 2)
 * Central repository for shape metadata, UI copy, and patterns.
 */

export const SHAPE_REGISTRY = {
    circle: {
        label: 'Circle',
        copy: {
            badge: 'Circle',
            title: 'Circle Study',
            description: 'Symmetric reflections keep the beam stable from nearly any launch angle.',
            meta: 'Symmetry',
            cardTitle: 'Closed Orbit',
            cardCopy: 'Circular boundaries are ideal for clean repeating paths and stable echo-like motion.',
            note: 'Tip: drag the source off-center, then rotate slowly to search for repeating loops.',
            action: 'ANCHOR'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            },
            pointer: {
                sourcePreset: 'shape-default',
                anchorPreset: 'shape-center'
            }
        },
        patterns: {
            'center-orbit': {
                label: 'Center Orbit',
                note: 'A compact point-source setup for finding stable circular loops.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.62 } } },
                sliders: { spread: 0.35 }
            },
            'wide-sweep': {
                label: 'Wide Sweep',
                note: 'Push the source off-center and widen the fan to compare dense and sparse returns.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.4 }, y: { unit: 'size', value: -0.2 } } },
                sliders: { spread: 1.4 }
            },
            'parallel-wash': {
                label: 'Parallel Wash',
                note: 'A clean parallel pass across the circle for smooth, even interference bands.',
                options: { lightSourceMode: 'parallel' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.75 } } },
                sliders: { spread: 0, sourceRotation: 0 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: 0 } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -1.0 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    rect: {
        label: 'Rectangle',
        copy: {
            badge: 'Rectangle',
            title: 'Rectangle Study',
            description: 'Straight walls make corner sensitivity obvious and easy to compare.',
            meta: 'Corners',
            cardTitle: 'Corner Bounce',
            cardCopy: 'Small changes near an edge can redirect the beam into long alternating zigzags.',
            note: 'Tip: place the source near one side and compare shallow versus steep launch angles.',
            action: 'ANCHOR'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            }
        },
        patterns: {
            'top-bounce': {
                label: 'Top Bounce',
                note: 'A narrow centered drop that reads as a clean vertical bounce ladder before the pattern spreads sideways.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.96 } } },
                sliders: { spread: (40 * Math.PI) / 180, sourceRotation: 0 }
            },
            'side-scan': {
                label: 'Side Scan',
                note: 'A compact side-entry emitter positioned at the upper left for localized beam studies.',
                options: { lightSourceMode: 'parallel' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.5 }, y: { unit: 'size', value: -0.4 } } },
                sliders: { spread: 0, sourceRotation: (-75 * Math.PI) / 180 }
            },
            'corner-echo': {
                label: 'Corner Echo',
                note: 'A corner launch from the top-left vertex at a -45 degree angle with a wide 60 degree spread.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.75 }, y: { unit: 'size', value: -1.05 } } },
                sliders: { spread: (60 * Math.PI) / 180, sourceRotation: (-45 * Math.PI) / 180 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: 0 } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -1.0 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    'v-oval': {
        label: 'Vertical Oval',
        copy: {
            badge: 'V-Oval',
            title: 'Vertical Oval',
            description: 'The tall oval compresses rays vertically and highlights the major-axis bias.',
            meta: 'Focus',
            cardTitle: 'Focus Pair',
            cardCopy: 'Use the focus anchor to see how reflections tighten along the vertical geometry.',
            note: 'Tip: sync to the upper focus, then sweep the rotation slider through a narrow range.',
            action: 'FOCI'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            }
        },
        patterns: {
            'upper-focus': {
                label: 'Upper Focus',
                note: 'Lock to the top focus to show the vertical oval’s strongest return path.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 0.35 }
            },
            'tall-sweep': {
                label: 'Tall Sweep',
                note: 'Parallel light down the long axis produces a clean column of reflections.',
                options: { lightSourceMode: 'parallel' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.58 } } },
                sliders: { spread: 0, sourceRotation: 0 }
            },
            'soft-fan': {
                label: 'Soft Fan',
                note: 'A wider fan exposes how the tall oval compresses vertical trajectories.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: 0.18 }, y: { unit: 'size', value: -0.2 } } },
                sliders: { spread: 1.2 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: 0 } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.816 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    'vv-oval': {
        label: 'Double Oval',
        copy: {
            badge: 'Double Oval',
            title: 'Double Oval',
            description: 'Two boundaries create a split cavity where rays can jump between shells.',
            meta: 'Nested',
            cardTitle: 'Shared Channel',
            cardCopy: 'The outer and inner ovals create a clean demonstration of boundary transitions.',
            note: 'Tip: run Paint 2 with moderate density to reveal the split caustic lanes.',
            action: 'FOCI'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            }
        },
        patterns: {
            'shared-foci': {
                label: 'Shared Foci',
                note: 'Start from the shared focus line to reveal the dual-shell structure clearly.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 0.35 }
            },
            'split-sweep': {
                label: 'Split Sweep',
                note: 'A parallel sweep helps separate the outer and inner channels visually.',
                options: { lightSourceMode: 'parallel' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.54 } } },
                sliders: { spread: 0, sourceRotation: 0 }
            },
            'inner-echo': {
                label: 'Inner Echo',
                note: 'Offset the source slightly to encourage jumps between the two boundaries.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: 0.14 }, y: { unit: 'size', value: -0.08 } } },
                sliders: { spread: 1.0 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: 0 } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.816 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    ellipse: {
        label: 'Ellipse',
        copy: {
            badge: 'Ellipse',
            title: 'Ellipse Study',
            description: 'Ellipses are strongest when you emphasize the two foci and the returning paths between them.',
            meta: 'Focal Pair',
            cardTitle: 'Focus Return',
            cardCopy: 'Launching from a focus shows the classic ellipse property with minimal setup.',
            note: 'Tip: hit the focus button, then use a wider spread to show the shared return point.',
            action: 'FOCI'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            }
        },
        patterns: {
            'focus-lock': {
                label: 'Focus Lock',
                note: 'Use the classic focus-to-focus property as the cleanest ellipse demonstration.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 0.45 }
            },
            'cross-sweep': {
                label: 'Cross Sweep',
                note: 'A perpendicular sweep across the ellipse shows strong compression across the minor axis.',
                options: { lightSourceMode: 'parallel' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.36 } } },
                sliders: { spread: 0, sourceRotation: Math.PI / 2 }
            },
            'wide-return': {
                label: 'Wide Return',
                note: 'A wider point source reveals how broad bundles still gather toward the paired focus.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.5 }, y: 0 } },
                sliders: { spread: 1.2 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: 0 } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: { unit: 'size', value: -0.99 }, y: 0 } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    parabola: {
        label: 'Parabola',
        copy: {
            badge: 'Parabola',
            title: 'Parabola Study',
            description: 'The parabola is best used as a one-focus machine that straightens outgoing beams.',
            meta: 'Focus Lock',
            cardTitle: 'Parallel Exit',
            cardCopy: 'A point source at the focus demonstrates why the reflected bundle aligns so cleanly.',
            note: 'Tip: keep point source mode active and compare narrow spread versus broad spread.',
            action: 'FOCUS'
        },
        patterns: {
            'focus-beam': {
                label: 'Focus Beam',
                note: 'The cleanest parabola scene: point source at the focus, tight outgoing bundle.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 0.35 }
            },
            'broad-exit': {
                label: 'Broad Exit',
                note: 'Increase spread at the focus to show how the reflector straightens a larger family.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 1.4 }
            },
            'edge-skim': {
                label: 'Edge Skim',
                note: 'Offset the source to compare clean focus behavior against skewed reflections.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: 0.35 }, y: { unit: 'size', value: 0.4 } } },
                sliders: { spread: 0.5 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePreset: 'shape-focus' },
                sliders: { spread: 3.1416 },
                options: { sourceDirection: 'parallel',  } 
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: { unit: 'size', value: 0.25 } } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: 0.75 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    cardioid: {
        label: 'Cardioid',
        copy: {
            badge: 'Cardioid',
            title: 'Cardioid Study',
            description: 'The cusp makes this shape the most sensitive and dramatic under small perturbations.',
            meta: 'Cusp',
            cardTitle: 'Cusp Caustic',
            cardCopy: 'Cardioids reward slow scanning because the beam structure changes sharply near the notch.',
            note: 'Tip: move the source along the left side and accumulate with Paint 2 for dense folds.',
            action: 'ANCHOR'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            }
        },
        patterns: {
            'left-fold': {
                label: 'Left Fold',
                note: 'A safe starting angle for reading the cardioid’s folded interior.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.24 }, y: 0 } },
                sliders: { spread: 0.45 }
            },
            'cusp-scan': {
                label: 'Cusp Scan',
                note: 'Move toward the cusp to trigger sharper redirection and denser interior overlaps.',
                options: { lightSourceMode: 'point' },
                pointer: { sourcePos: { x: { unit: 'size', value: 0.08 }, y: { unit: 'size', value: -0.12 } } },
                sliders: { spread: 1.1 }
            },
            'paint-sweep': {
                label: 'Paint Sweep',
                note: 'A paint-focused setup that accumulates the folded caustic layers over time.',
                options: { lightSourceMode: 'point', renderMode: 'paint2' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.16 }, y: { unit: 'size', value: 0.06 } } },
                sliders: { spread: 0.9 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePos: { x: { unit: 'size', value: -0.4 }, y: 0 } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: { unit: 'size', value: 0.5 }, y: 0 } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: { unit: 'size', value: -0.24 }, y: 0 } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    },
    triangle: {
        label: 'Triangle',
        copy: {
            badge: 'Triangle',
            title: 'Triangle Study',
            description: 'The triangle is best for periodic paths, edge scans, and later multi-point source patterns.',
            meta: 'Multi-Point',
            cardTitle: 'Edge Sweep',
            cardCopy: 'Parallel and paint-based accumulation can expose stripe families and periodic orbit bands.',
            note: 'Tip: start near the center, then scan toward a vertex to compare stable and unstable regions.',
            action: 'ANCHOR'
        },
        defaults: {
            options: {
                lightSourceMode: 'point',
                
            }
        },
        patterns: {
            'center-path': {
                label: 'Center Path',
                note: 'A single point setup for hunting periodic triangular loops with the main grip.',
                options: { lightSourceMode: 'point',  },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: 0.12 } } },
                sliders: { spread: 0.3 }
            },
            'edge-sweep': {
                label: 'Edge Sweep',
                note: 'A parallel sweep across one side of the triangle that makes stripe families easy to read.',
                options: { lightSourceMode: 'parallel' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.3 }, y: { unit: 'size', value: 0.2 } } },
                sliders: { spread: 0, sourceRotation: -Math.PI / 3 }
            },
            'vertex-graze': {
                label: 'Vertex Graze',
                note: 'A near-corner launch that reveals how quickly a triangle becomes unstable when a path approaches a vertex.',
                options: { lightSourceMode: 'point',  sourceDirection: 'parallel' },
                pointer: { sourcePos: { x: { unit: 'size', value: -0.12 }, y: { unit: 'size', value: -0.38 } } },
                sliders: { spread: 0.16, sourceRotation: -0.82 }
            },
            'triad-edge': {
                label: 'Triad Edge',
                note: 'Three sources at the vertices, each aligned by edge normals for a strong triangular caustic scene.',
                options: { lightSourceMode: 'point', sourcePattern: 'triad', sourceDirection: 'edge-normal' },
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: 0.12 } } },
                sliders: { spread: Math.PI / 3 }
            }
        },
        sourceOptions: {
            'basic': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.4 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            },
            'center': {
                pointer: { anchorPreset: 'shape-center', sourcePos: { x: 0, y: { unit: 'size', value: 0.2 } } },
                sliders: { spread: 6.2832 },
                options: { sourceDirection: 'outward',  }
            },
            'online': {
                pointer: { sourcePos: { x: 0, y: { unit: 'size', value: -0.97 } } },
                sliders: { spread: 1.0472 },
                options: { sourceDirection: 'parallel',  }
            }
        }
    }
};
