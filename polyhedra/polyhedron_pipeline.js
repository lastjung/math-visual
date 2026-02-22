(function () {
  const PHASES = [
    { id: "rotate", label: "Rotate 3D", start: 0.0, end: 0.22 },
    { id: "cut", label: "Mark Cut Edges", start: 0.22, end: 0.36 },
    { id: "unfold", label: "Flatten Net", start: 0.36, end: 0.66 },
    { id: "assemble", label: "Assemble Back", start: 0.66, end: 0.88 },
    { id: "complete", label: "Complete 3D", start: 0.88, end: 1.0 }
  ];

  function timelineForPhase(id) {
    // Use representative snapshots for clear stage-by-stage visuals.
    // Especially for "unfold", we jump to the fully opened state.
    const snaps = {
      rotate: 0.08,
      cut: 0.34,
      unfold: 0.66,
      assemble: 0.78,
      complete: 0.96
    };
    return snaps[id] ?? 0.08;
  }

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function localT(globalT, a, b) {
    if (globalT <= a) return 0;
    if (globalT >= b) return 1;
    return (globalT - a) / Math.max(1e-6, b - a);
  }

  function smooth(t) {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
  }

  function buildState(t) {
    const phase = PHASES.find((p) => t >= p.start && t <= p.end) || PHASES[PHASES.length - 1];

    const u = smooth(localT(t, 0.36, 0.66));
    const a = smooth(localT(t, 0.66, 0.88));

    let netMix = 0;
    if (t < 0.36) netMix = 0;
    else if (t <= 0.66) netMix = u;
    else if (t <= 0.88) netMix = 1 - a;
    else netMix = 0;

    const cutStrength = t < 0.22 ? 0 : t <= 0.36 ? smooth(localT(t, 0.22, 0.36)) : 1;

    return {
      phase,
      netMix,
      cutStrength,
      unfoldProgress: u,
      assembleProgress: a,
      label: phase.label
    };
  }

  window.PolyhedronPipeline = {
    PHASES,
    buildState,
    timelineForPhase
  };
})();
