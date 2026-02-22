(function () {
  const vsub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
  const vdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
  const vlen = (p) => Math.hypot(p.x, p.y, p.z) || 1;

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

  function unfoldTriangles(mesh, tree) {
    const face2D = new Array(mesh.faces.length);
    const root = tree.rootFace;
    const rf = mesh.faces[root];
    const a = mesh.vertices[rf[0]];
    const b = mesh.vertices[rf[1]];
    const c = mesh.vertices[rf[2]];

    const ab = dist3(a, b);
    const ac = dist3(a, c);
    const bc = dist3(b, c);
    const x = (ac * ac - bc * bc + ab * ab) / (2 * ab);
    const y = Math.sqrt(Math.max(0, ac * ac - x * x));

    face2D[root] = new Map([
      [rf[0], { x: 0, y: 0 }],
      [rf[1], { x: ab, y: 0 }],
      [rf[2], { x, y }]
    ]);

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
        const ec = childFace.find((vi) => vi !== ea && vi !== eb);

        const pa = parentMap.get(ea);
        const pb = parentMap.get(eb);
        if (!pa || !pb) continue;

        const dac = dist3(mesh.vertices[ea], mesh.vertices[ec]);
        const dbc = dist3(mesh.vertices[eb], mesh.vertices[ec]);
        const dab = dist3(mesh.vertices[ea], mesh.vertices[eb]);

        const ex = { x: (pb.x - pa.x) / dab, y: (pb.y - pa.y) / dab };
        const ey = { x: -ex.y, y: ex.x };

        const ux = (dac * dac - dbc * dbc + dab * dab) / (2 * dab);
        const uy = Math.sqrt(Math.max(0, dac * dac - ux * ux));

        const c1 = { x: pa.x + ex.x * ux + ey.x * uy, y: pa.y + ex.y * ux + ey.y * uy };
        const c2 = { x: pa.x + ex.x * ux - ey.x * uy, y: pa.y + ex.y * ux - ey.y * uy };

        const parentThird = pf.find((vi) => vi !== ea && vi !== eb);
        const parentThirdPoint = parentMap.get(parentThird);
        const parentSide = Math.sign(signedArea2(pa, pb, parentThirdPoint));
        const side1 = Math.sign(signedArea2(pa, pb, c1));

        const chosen = side1 === -parentSide ? c1 : c2;
        const childMap = new Map();
        childMap.set(ea, pa);
        childMap.set(eb, pb);
        childMap.set(ec, chosen);
        face2D[child] = childMap;

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
    unfoldTriangles
  };
})();
