(function () {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const v = (x, y, z) => ({ x, y, z });
  const vsub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const vcross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  });
  const vlen = (p) => Math.hypot(p.x, p.y, p.z) || 1;
  const vnorm = (p) => {
    const m = vlen(p);
    return { x: p.x / m, y: p.y / m, z: p.z / m };
  };
  const vdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

  function normalize(vertices, target = 1) {
    let maxR = 0;
    for (const p of vertices) maxR = Math.max(maxR, vlen(p));
    const s = target / Math.max(1e-6, maxR);
    return vertices.map((p) => ({ x: p.x * s, y: p.y * s, z: p.z * s }));
  }

  function makeTetrahedron() {
    const vertices = normalize([
      v(1, 1, 1),
      v(-1, -1, 1),
      v(-1, 1, -1),
      v(1, -1, -1)
    ]);

    const faces = [
      [0, 1, 2],
      [0, 3, 1],
      [0, 2, 3],
      [1, 3, 2]
    ];

    return withDerived({ name: "Regular tetrahedron", vertices, faces });
  }

  function makeOctahedron() {
    const vertices = normalize([
      v(1, 0, 0),
      v(-1, 0, 0),
      v(0, 1, 0),
      v(0, -1, 0),
      v(0, 0, 1),
      v(0, 0, -1)
    ]);

    const faces = [
      [0, 2, 4],
      [2, 1, 4],
      [1, 3, 4],
      [3, 0, 4],
      [2, 0, 5],
      [1, 2, 5],
      [3, 1, 5],
      [0, 3, 5]
    ];

    return withDerived({ name: "Regular octahedron", vertices, faces });
  }

  function makeIcosahedron() {
    const vertices = normalize([
      v(-1, PHI, 0), v(1, PHI, 0), v(-1, -PHI, 0), v(1, -PHI, 0),
      v(0, -1, PHI), v(0, 1, PHI), v(0, -1, -PHI), v(0, 1, -PHI),
      v(PHI, 0, -1), v(PHI, 0, 1), v(-PHI, 0, -1), v(-PHI, 0, 1)
    ]);

    const faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    return withDerived({ name: "Regular icosahedron", vertices, faces });
  }

  function makeCube() {
    const vertices = normalize([
      v(-1, -1, -1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1),
      v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)
    ]);

    const faces = [
      [0, 1, 2, 3],
      [4, 7, 6, 5],
      [0, 4, 5, 1],
      [1, 5, 6, 2],
      [2, 6, 7, 3],
      [3, 7, 4, 0]
    ];

    return withDerived({ name: "Cube", vertices, faces });
  }

  function makeDual(mesh) {
    const centers = mesh.faces.map((f) => {
      let sx = 0, sy = 0, sz = 0;
      for (const vi of f) {
        sx += mesh.vertices[vi].x;
        sy += mesh.vertices[vi].y;
        sz += mesh.vertices[vi].z;
      }
      const inv = 1 / f.length;
      return { x: sx * inv, y: sy * inv, z: sz * inv };
    });

    const incident = Array.from({ length: mesh.vertices.length }, () => []);
    mesh.faces.forEach((f, fi) => {
      for (const vi of f) incident[vi].push(fi);
    });

    const faces = incident.map((faceIds, vi) => {
      const c = vnorm(mesh.vertices[vi]);
      const ref = Math.abs(c.x) < 0.8 ? v(1, 0, 0) : v(0, 1, 0);
      const u = vnorm(vcross(ref, c));
      const w = vcross(c, u);
      return faceIds
        .map((fi) => {
          const d = vsub(centers[fi], mesh.vertices[vi]);
          const tx = vdot(d, u);
          const ty = vdot(d, w);
          return { fi, a: Math.atan2(ty, tx) };
        })
        .sort((a, b) => a.a - b.a)
        .map((x) => x.fi);
    });

    return withDerived({
      name: "Regular dodecahedron",
      vertices: normalize(centers),
      faces
    });
  }

  function makeDodecahedron() {
    return makeDual(makeIcosahedron());
  }

  function withDerived(mesh) {
    const faceNormals = mesh.faces.map((f) => {
      const a = mesh.vertices[f[0]];
      const b = mesh.vertices[f[1]];
      const c = mesh.vertices[f[2]];
      const n = vnorm(vcross(vsub(b, a), vsub(c, a)));
      const centroid = {
        x: (a.x + b.x + c.x) / 3,
        y: (a.y + b.y + c.y) / 3,
        z: (a.z + b.z + c.z) / 3
      };
      return vdot(n, centroid) < 0 ? { x: -n.x, y: -n.y, z: -n.z } : n;
    });

    const edgeFaces = new Map();
    const faceNeighbors = mesh.faces.map(() => []);

    for (let fi = 0; fi < mesh.faces.length; fi++) {
      const face = mesh.faces[fi];
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        const key = `${lo}_${hi}`;
        if (!edgeFaces.has(key)) edgeFaces.set(key, []);
        edgeFaces.get(key).push({ fi, a, b });
      }
    }

    for (const list of edgeFaces.values()) {
      if (list.length !== 2) continue;
      const x = list[0];
      const y = list[1];
      faceNeighbors[x.fi].push({ face: y.fi, edge: [x.a, x.b] });
      faceNeighbors[y.fi].push({ face: x.fi, edge: [y.a, y.b] });
    }

    mesh.faceNormals = faceNormals;
    mesh.faceNeighbors = faceNeighbors;
    mesh.edgeFaces = edgeFaces;
    return mesh;
  }

  window.PolyhedronFactory = {
    create(kind) {
      if (kind === "tetrahedron") return makeTetrahedron();
      if (kind === "cube") return makeCube();
      if (kind === "octahedron") return makeOctahedron();
      if (kind === "dodecahedron") return makeDodecahedron();
      if (kind === "icosahedron") return makeIcosahedron();
      return makeTetrahedron();
    }
  };
})();
