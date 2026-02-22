(function () {
  const vsub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const vdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
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

  function dist3(a, b) {
    return vlen(vsub(a, b));
  }

  function signedArea2(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  function buildSpanningTree(mesh, rootFace = 0) {
    const parent = new Array(mesh.faces.length).fill(-1);
    const viaEdge = new Array(mesh.faces.length).fill(null);
    const order = [];
    const q = [rootFace];
    parent[rootFace] = rootFace;

    while (q.length) {
      const f = q.shift();
      order.push(f);
      for (const n of mesh.faceNeighbors[f]) {
        if (parent[n.face] !== -1) continue;
        parent[n.face] = f;
        viaEdge[n.face] = n.edge;
        q.push(n.face);
      }
    }
    return { rootFace, parent, viaEdge, order };
  }

  function faceNormal(mesh, face) {
    if (face.length < 3) return { x: 0, y: 0, z: 1 };
    const a = mesh.vertices[face[0]];
    const b = mesh.vertices[face[1]];
    const c = mesh.vertices[face[2]];
    return vnorm(vcross(vsub(b, a), vsub(c, a)));
  }

  function projectFace2D(mesh, face, aIdx, bIdx, pa, pb, sign) {
    const va = mesh.vertices[aIdx];
    const vb = mesh.vertices[bIdx];
    const ex3 = vnorm(vsub(vb, va));
    const n3 = faceNormal(mesh, face);
    const ey3 = vnorm(vcross(n3, ex3));
    const dab = dist3(va, vb);
    const ex2 = { x: (pb.x - pa.x) / dab, y: (pb.y - pa.y) / dab };
    const ey2 = { x: -ex2.y, y: ex2.x };

    const out = new Map();
    for (const vi of face) {
      const d = vsub(mesh.vertices[vi], va);
      const x = vdot(d, ex3);
      const y = vdot(d, ey3);
      out.set(vi, {
        x: pa.x + ex2.x * x + ey2.x * (y * sign),
        y: pa.y + ex2.y * x + ey2.y * (y * sign)
      });
    }
    return out;
  }

  function unfoldMesh(mesh, tree) {
    const face2D = new Array(mesh.faces.length);
    const root = tree.rootFace;
    const rf = mesh.faces[root];
    const a0 = rf[0];
    const b0 = rf[1];
    const va0 = mesh.vertices[a0];
    const vb0 = mesh.vertices[b0];
    const dab0 = dist3(va0, vb0);
    face2D[root] = projectFace2D(
      mesh,
      rf,
      a0,
      b0,
      { x: 0, y: 0 },
      { x: dab0, y: 0 },
      1
    );

    const queue = [root];
    const visited = new Set([root]);

    while (queue.length) {
      const parentFace = queue.shift();
      const parentMap = face2D[parentFace];
      const pf = mesh.faces[parentFace];

      for (const n of mesh.faceNeighbors[parentFace]) {
        const child = n.face;
        if (visited.has(child)) continue;
        if (tree.parent[child] !== parentFace) continue;

        const [ea, eb] = tree.viaEdge[child];
        const childFace = mesh.faces[child];

        const pa = parentMap.get(ea);
        const pb = parentMap.get(eb);
        if (!pa || !pb) continue;

        const parentThird = pf.find((vi) => vi !== ea && vi !== eb);
        const parentThirdPoint = parentMap.get(parentThird);
        const parentSide = Math.sign(signedArea2(pa, pb, parentThirdPoint));

        const mapPos = projectFace2D(mesh, childFace, ea, eb, pa, pb, 1);
        const mapNeg = projectFace2D(mesh, childFace, ea, eb, pa, pb, -1);
        const childProbe = childFace.find((vi) => vi !== ea && vi !== eb) ?? childFace[0];
        const sidePos = Math.sign(signedArea2(pa, pb, mapPos.get(childProbe)));
        face2D[child] = sidePos === -parentSide ? mapPos : mapNeg;

        visited.add(child);
        queue.push(child);
      }
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const fm of face2D) {
      for (const p of fm.values()) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
    }

    return {
      face2D,
      bounds: { minX, minY, maxX, maxY },
      cutEdges: collectCutEdges(mesh, tree)
    };
  }

  function collectCutEdges(mesh, tree) {
    const keep = new Set();
    for (let f = 0; f < tree.parent.length; f++) {
      if (f === tree.rootFace) continue;
      const e = tree.viaEdge[f];
      keep.add(`${Math.min(e[0], e[1])}_${Math.max(e[0], e[1])}`);
    }
    const cut = [];
    for (const [key] of mesh.edgeFaces.entries()) {
      if (!keep.has(key)) cut.push(key);
    }
    return cut;
  }

  window.PolyhedronUnfold = {
    buildSpanningTree,
    unfoldMesh,
    unfoldTriangles: unfoldMesh
  };
})();
