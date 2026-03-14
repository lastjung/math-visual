import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const c3d = document.getElementById("view3d");
const c2d = document.getElementById("view2d");
const ctx2d = c2d.getContext("2d");

const solidEl = document.getElementById("solid");
const speedEl = document.getElementById("speed");
const baseFaceEl = document.getElementById("base-face");
const colorSchemeEl = document.getElementById("color-scheme");
const timelineEl = document.getElementById("timeline");
const playEl = document.getElementById("play");
const resetEl = document.getElementById("reset");
const prevStepEl = document.getElementById("prev-step");
const nextStepEl = document.getElementById("next-step");
const bgmToggleEl = document.getElementById("bgm-toggle");
const bgmNextEl = document.getElementById("bgm-next");
const bgmVolumeEl = document.getElementById("bgm-volume");
const bgmVolumeTextEl = document.getElementById("bgm-volume-text");
const phaseButtons = Array.from(document.querySelectorAll(".phase-btn"));
const phaseEl = document.getElementById("phase");
const statusEl = document.getElementById("status");
const hud3dEl = document.getElementById("hud-3d");

const vsub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const vdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const vlen = (a) => Math.hypot(a.x, a.y, a.z) || 1;
const vnorm = (a) => {
  const m = vlen(a);
  return { x: a.x / m, y: a.y / m, z: a.z / m };
};

const state = {
  mesh: null,
  tree: null,
  unfolded: null,
  faceDepth: [],
  maxDepth: 0,
  timeline: 0,
  targetTimeline: null,
  playing: false,
  lastTs: performance.now(),
  runStartTs: null,
  autoYaw: 0,
  baseSpin: 0,
  rotateBaseYaw: null,
  rotateBaseVel: 0,
  rotateBaseSettled: false,
  rotateBaseSpinStart: null,
  rotateBaseSpinDone: false,
  resumeAutoYawArmed: false,
  hingeByFace: [],
  viewportMode: null
};

const TIMELINE_PLAY_RATE = 0.12; // 2x slower than 0.24
const TIMELINE_TRANSITION_RATE = 0.475; // 2x slower than 0.95

let resizeObserver = null;

const audioState = {
  audio: new Audio(),
  tracks: [
    "../visualization/assets/music/bgm/math/Math_01_Minimalist_Sine_Pulse.mp3",
    "../visualization/assets/music/bgm/math/Math_03_Euclidean_Polyrhythm.mp3",
    "../visualization/assets/music/bgm/math/Math_08_Geometric_Vector_Motion.mp3",
    "../visualization/assets/music/bgm/math/Math_09_Fibonacci_Golden_Ratio.mp3",
    "../visualization/assets/music/bgm/math/Math_15_Deep_Space_Topology.mp3",
    "../visualization/assets/music/bgm/math/Math_16_Coordinate_Plane_Ambient.mp3"
  ],
  currentTrack: null,
  muted: true
};
audioState.audio.loop = true;
audioState.audio.volume = 0.15;

const renderer = new THREE.WebGLRenderer({ canvas: c3d, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050d1c);

const camera = new THREE.PerspectiveCamera(44, 1, 0.01, 100);
camera.position.set(0, 0.45, 4.6);

const controls = new OrbitControls(camera, c3d);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 2.0;
controls.maxDistance = 7.2;

scene.add(new THREE.AmbientLight(0x8aa3c9, 0.8));
const key = new THREE.DirectionalLight(0xffffff, 0.95);
key.position.set(2.5, 3.0, 2.8);
scene.add(key);
const rim = new THREE.DirectionalLight(0x7cb4ff, 0.5);
rim.position.set(-2.2, -1.5, -2.8);
scene.add(rim);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

const runtime = {
  rootFace: 0,
  faceNodes: [],
  cutEdgeLines: []
};

const COLOR_SCHEMES = {
  classic: {
    face: [0x2f6fbf, 0x3f86dd, 0x2f7fc7, 0x4a9ae7, 0x3aa3df, 0x3684c9],
    baseFace: 0xeab308,
    edge: 0xcce1ff,
    cut3d: 0xff2b2b,
    cut2d: [255, 40, 40],
    netFace: [83, 166, 255],
    baseNetFace: [234, 179, 8],
    baseNetStroke: [255, 225, 130],
    baseLabel: [255, 236, 170],
    hudText: [255, 255, 255],
    hudKey: [159, 176, 210]
  },
  basic: {
    face: ["#86efac", "#ec4899", "#f472b6", "#00cc00", "#ff7fb8", "#9ef4be"],
    baseFace: "#00cc00",
    edge: "#ffffff",
    cut3d: "#ff0000",
    cut2d: [255, 0, 0],
    netFace: [244, 114, 182],
    baseNetFace: [134, 239, 172],
    baseNetStroke: [220, 252, 231],
    baseLabel: [236, 253, 245],
    hudText: [255, 255, 255],
    hudKey: [194, 252, 223]
  },
  ocean: {
    face: ["#22d3ee", "#3b82f6", "#93c5fd", "#0891b2", "#60a5fa", "#38bdf8"],
    baseFace: "#0891b2",
    edge: "#dbeafe",
    cut3d: "#ff0000",
    cut2d: [255, 0, 0],
    netFace: [59, 130, 246],
    baseNetFace: [8, 145, 178],
    baseNetStroke: [147, 197, 253],
    baseLabel: [224, 242, 254],
    hudText: [255, 255, 255],
    hudKey: [147, 197, 253]
  },
  sunset: {
    face: ["#fdba74", "#7c3aed", "#a78bfa", "#f97316", "#fb923c", "#c4b5fd"],
    baseFace: "#f97316",
    edge: "#ffe7cf",
    cut3d: "#ff0000",
    cut2d: [255, 0, 0],
    netFace: [167, 139, 250],
    baseNetFace: [249, 115, 22],
    baseNetStroke: [253, 186, 116],
    baseLabel: [255, 237, 213],
    hudText: [255, 255, 255],
    hudKey: [221, 214, 254]
  },
  neon: {
    face: ["#f3f4f6", "#4d7c0f", "#84cc16", "#1f2937", "#d9f99d", "#a3e635"],
    baseFace: "#84cc16",
    edge: "#ecfccb",
    cut3d: "#ffd700",
    cut2d: [255, 215, 0],
    netFace: [132, 204, 22],
    baseNetFace: [77, 124, 15],
    baseNetStroke: [217, 249, 157],
    baseLabel: [248, 255, 230],
    hudText: [255, 255, 255],
    hudKey: [217, 249, 157]
  },
  rainbow: {
    face: ["#ff4d6d", "#ffd166", "#06d6a0", "#4cc9f0", "#7209b7", "#f72585"],
    baseFace: "#ffffff",
    edge: "#ffffff",
    cut3d: "#ff0000",
    cut2d: [255, 0, 0],
    netFace: [120, 180, 255],
    baseNetFace: [255, 255, 255],
    baseNetStroke: [255, 255, 255],
    baseLabel: [255, 255, 255],
    hudText: [255, 255, 255],
    hudKey: [220, 220, 220]
  }
};

function activeScheme() {
  return COLOR_SCHEMES[colorSchemeEl.value] || COLOR_SCHEMES.classic;
}

function colorToRgbArray(color) {
  const c = new THREE.Color(color);
  return [
    Math.round(c.r * 255),
    Math.round(c.g * 255),
    Math.round(c.b * 255)
  ];
}

function faceColorRgb(scheme, fi, isBase) {
  const color = isBase
    ? scheme.baseFace
    : scheme.face[fi % scheme.face.length];
  return colorToRgbArray(color);
}

function getViewportMode() {
  const w = window.innerWidth || c3d.clientWidth || 1200;
  if (w <= 768) return "mobile";
  if (w <= 1040) return "tablet";
  return "desktop";
}

function responsiveModelScale() {
  const mode = getViewportMode();
  if (mode === "mobile") return 1.2; // Mobile: larger than desktop but not clipped
  if (mode === "tablet") return 1.0;
  return 1.0;
}

function fitCameraToModel(mode) {
  const box = new THREE.Box3().setFromObject(modelGroup);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  if (!Number.isFinite(sphere.radius) || sphere.radius <= 0) return;

  const fov = (camera.fov * Math.PI) / 180;
  const baseDistance = sphere.radius / Math.sin(fov / 2);
  const factor = mode === "mobile" ? 1.18 : mode === "tablet" ? 1.26 : 1.34;
  const distance = baseDistance * factor;

  camera.position.set(sphere.center.x, sphere.center.y + sphere.radius * 0.15, sphere.center.z + distance);
  controls.target.set(sphere.center.x, sphere.center.y, sphere.center.z);
  controls.update();
}

function applyViewportCameraPreset(force = false) {
  const mode = getViewportMode();
  if (!force && state.viewportMode === mode) return;
  state.viewportMode = mode;
  fitCameraToModel(mode);
}

function pickRandomTrack(previousTrack = null) {
  if (!audioState.tracks.length) return null;
  if (audioState.tracks.length === 1) return audioState.tracks[0];
  const pool = previousTrack
    ? audioState.tracks.filter((t) => t !== previousTrack)
    : audioState.tracks;
  return pool[Math.floor(Math.random() * pool.length)];
}

function setTrack(track, { force = false } = {}) {
  if (!track) return;
  if (!force && audioState.currentTrack === track) return;
  audioState.currentTrack = track;
  audioState.audio.src = track;
  audioState.audio.load();
}

function syncBgmButton() {
  bgmToggleEl.textContent = audioState.muted ? "BGM: OFF" : "BGM: ON";
}

function syncVolumeText() {
  bgmVolumeTextEl.textContent = `${bgmVolumeEl.value}%`;
}

function toggleBgm() {
  audioState.muted = !audioState.muted;
  syncBgmButton();
  if (audioState.muted) {
    audioState.audio.pause();
    return;
  }
  if (!audioState.currentTrack) setTrack(pickRandomTrack(), { force: true });
  audioState.audio.volume = Number(bgmVolumeEl.value) / 100;
  audioState.audio.play().catch(() => {});
}

function nextTrack() {
  const next = pickRandomTrack(audioState.currentTrack);
  if (!next) return;
  setTrack(next, { force: true });
  if (!audioState.muted) {
    audioState.audio.currentTime = 0;
    audioState.audio.play().catch(() => {});
  }
}

function signedAngleAroundAxis(from, to, axis) {
  const f = new THREE.Vector3(from.x, from.y, from.z).normalize();
  const t = new THREE.Vector3(to.x, to.y, to.z).normalize();
  const u = new THREE.Vector3(axis.x, axis.y, axis.z).normalize();
  const cross = new THREE.Vector3().crossVectors(f, t);
  return Math.atan2(u.dot(cross), f.dot(t));
}

function createFaceMesh(faceIndices, color, edgeColor) {
  const positions = [];
  for (let i = 1; i < faceIndices.length - 1; i++) {
    const a = state.mesh.vertices[faceIndices[0]];
    const b = state.mesh.vertices[faceIndices[i]];
    const c = state.mesh.vertices[faceIndices[i + 1]];
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.computeVertexNormals();

  const mesh = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness: 0.08,
      side: THREE.DoubleSide
    })
  );

  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(g),
    new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.45 })
  );
  mesh.add(edge);

  mesh.matrixAutoUpdate = false;
  mesh.matrix.identity();
  return mesh;
}

function clearModel() {
  while (modelGroup.children.length) modelGroup.remove(modelGroup.children[0]);
  runtime.faceNodes = [];
  runtime.cutEdgeLines = [];
}

function buildCutEdgeLines() {
  const scheme = activeScheme();
  for (const key of state.unfolded.cutEdges) {
    const [a, b] = key.split("_").map(Number);
    const va = state.mesh.vertices[a];
    const vb = state.mesh.vertices[b];
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(va.x, va.y, va.z),
      new THREE.Vector3(vb.x, vb.y, vb.z)
    ]);
    const line = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color: scheme.cut3d, transparent: true, opacity: 0 })
    );
    modelGroup.add(line);
    runtime.cutEdgeLines.push(line);
  }
}

function setupMesh() {
  state.mesh = window.PolyhedronFactory.create(solidEl.value);
  runtime.rootFace = Math.max(0, Math.min(state.mesh.faces.length - 1, parseInt(baseFaceEl.value, 10) || 0));
  baseFaceEl.max = String(Math.max(0, state.mesh.faces.length - 1));
  baseFaceEl.value = String(runtime.rootFace);
  state.tree = window.PolyhedronUnfold.buildSpanningTree(state.mesh, runtime.rootFace);
  state.unfolded = window.PolyhedronUnfold.unfoldMesh(state.mesh, state.tree);
  state.faceDepth = new Array(state.mesh.faces.length).fill(0);
  state.maxDepth = 0;
  for (let fi = 0; fi < state.mesh.faces.length; fi++) {
    if (fi === runtime.rootFace) continue;
    let d = 0;
    let p = fi;
    while (p !== runtime.rootFace && d < state.mesh.faces.length + 2) {
      p = state.tree.parent[p];
      d += 1;
    }
    state.faceDepth[fi] = d;
    if (d > state.maxDepth) state.maxDepth = d;
  }

  clearModel();

  state.hingeByFace = new Array(state.mesh.faces.length).fill(null);
  state.hingeByFace[runtime.rootFace] = {
    parent: runtime.rootFace,
    axis: { x: 1, y: 0, z: 0 },
    pivot: { x: 0, y: 0, z: 0 },
    fullAngle: 0
  };

  for (let fi = 0; fi < state.mesh.faces.length; fi++) {
    if (fi === runtime.rootFace) continue;
    const parent = state.tree.parent[fi];
    const [ea, eb] = state.tree.viaEdge[fi];
    const va = state.mesh.vertices[ea];
    const vb = state.mesh.vertices[eb];
    const axis = vnorm(vsub(vb, va));

    const parentNormal = state.mesh.faceNormals[parent];
    const childNormal = state.mesh.faceNormals[fi];
    const fullAngle = signedAngleAroundAxis(childNormal, parentNormal, axis);

    state.hingeByFace[fi] = {
      parent,
      axis,
      pivot: va,
      fullAngle
    };
  }

  const scheme = activeScheme();
  const faceColors = scheme.face;
  const baseFaceColor = scheme.baseFace;
  for (let fi = 0; fi < state.mesh.faces.length; fi++) {
    const mesh = createFaceMesh(
      state.mesh.faces[fi],
      fi === runtime.rootFace ? baseFaceColor : faceColors[fi % faceColors.length]
      ,
      scheme.edge
    );
    modelGroup.add(mesh);
    runtime.faceNodes.push({ fi, mesh });
  }

  buildCutEdgeLines();
  fitCameraToModel(getViewportMode());
  statusEl.textContent = `${state.mesh.name} | faces: ${state.mesh.faces.length} | base: ${runtime.rootFace} | cuts: ${state.unfolded.cutEdges.length}`;
}

function transformForFace(fi, mixByFace, cache) {
  if (cache[fi]) return cache[fi];
  if (fi === runtime.rootFace) {
    const id = new THREE.Matrix4().identity();
    cache[fi] = id;
    return id;
  }

  const hinge = state.hingeByFace[fi];
  const parentM = transformForFace(hinge.parent, mixByFace, cache);

  const pivot = new THREE.Vector3(hinge.pivot.x, hinge.pivot.y, hinge.pivot.z);
  const axis = new THREE.Vector3(hinge.axis.x, hinge.axis.y, hinge.axis.z).normalize();
  const angle = hinge.fullAngle * mixByFace[fi];

  const t1 = new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z);
  const r = new THREE.Matrix4().makeRotationAxis(axis, angle);
  const t2 = new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z);

  const local = new THREE.Matrix4().multiplyMatrices(t1, r).multiply(t2);
  const out = new THREE.Matrix4().multiplyMatrices(parentM, local);
  cache[fi] = out;
  return out;
}

function baseFaceSpinMatrix(angle) {
  const face = state.mesh.faces[runtime.rootFace];
  const center = face.reduce(
    (acc, vi) => {
      const v = state.mesh.vertices[vi];
      acc.x += v.x;
      acc.y += v.y;
      acc.z += v.z;
      return acc;
    },
    { x: 0, y: 0, z: 0 }
  );
  center.x /= face.length;
  center.y /= face.length;
  center.z /= face.length;

  const n = vnorm(state.mesh.faceNormals[runtime.rootFace]);
  const pivot = new THREE.Vector3(center.x, center.y, center.z);
  const axis = new THREE.Vector3(n.x, n.y, n.z).normalize();
  const t1 = new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z);
  const r = new THREE.Matrix4().makeRotationAxis(axis, angle);
  const t2 = new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z);
  return new THREE.Matrix4().multiplyMatrices(t1, r).multiply(t2);
}

function update3D(pipelineState) {
  const angleMix = pipelineState.netMix;
  const mixByFace = new Array(state.mesh.faces.length).fill(angleMix);
  const cascade = 0.45; // depth-based stagger for natural unfold/assemble motion
  const ease = (t) => {
    const x = Math.max(0, Math.min(1, t));
    return x * x * (3 - 2 * x);
  };
  if (state.maxDepth > 0) {
    for (let fi = 0; fi < mixByFace.length; fi++) {
      const depthNorm = state.faceDepth[fi] / state.maxDepth;
      const delayed = (angleMix - depthNorm * cascade) / (1 - cascade);
      mixByFace[fi] = ease(delayed);
    }
    mixByFace[runtime.rootFace] = 0;
  }
  const cache = new Array(state.mesh.faces.length).fill(null);
  const rotateBaseIdx = phaseIndexById("rotate_base");
  const phaseIdx = phaseIndexById(pipelineState.phase.id);
  const spinMatrix = phaseIdx >= rotateBaseIdx ? baseFaceSpinMatrix(state.baseSpin) : null;
  const composed = spinMatrix ? new THREE.Matrix4() : null;

  for (const node of runtime.faceNodes) {
    const local = transformForFace(node.fi, mixByFace, cache);
    if (spinMatrix) {
      composed.multiplyMatrices(spinMatrix, local);
      node.mesh.matrix.copy(composed);
    } else {
      node.mesh.matrix.copy(local);
    }
  }

  const lineOpacity = pipelineState.cutStrength > 0 ? 0.2 + 0.8 * pipelineState.cutStrength : 0;
  for (const line of runtime.cutEdgeLines) {
    line.material.opacity = lineOpacity;
    line.matrixAutoUpdate = false;
    if (spinMatrix) line.matrix.copy(spinMatrix);
    else line.matrix.identity();
  }
}

function resize2D() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = c2d.getBoundingClientRect();
  c2d.width = Math.max(1, Math.floor(rect.width * dpr));
  c2d.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resize() {
  const rect = c3d.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
  applyViewportCameraPreset(false);
  const s = responsiveModelScale();
  modelGroup.scale.setScalar(s);
  resize2D();
}

function draw2DNet(pipelineState) {
  const w = c2d.clientWidth;
  const h = c2d.clientHeight;
  ctx2d.clearRect(0, 0, w, h);
  ctx2d.fillStyle = "#050d1c";
  ctx2d.fillRect(0, 0, w, h);

  const b = state.unfolded.bounds;
  const netW = Math.max(1e-6, b.maxX - b.minX);
  const netH = Math.max(1e-6, b.maxY - b.minY);
  const scale = Math.min((w * 0.78) / netW, (h * 0.78) / netH);
  const ox = w * 0.5 - ((b.minX + b.maxX) * 0.5) * scale;
  const oy = h * 0.5 - ((b.minY + b.maxY) * 0.5) * scale;
  const stageBoost =
    pipelineState.phase.id === "disassemble" ||
    pipelineState.phase.id === "unfold" ||
    pipelineState.phase.id === "rotate_base" ||
    pipelineState.phase.id === "assemble"
      ? 1
      : 0.4;
  const alpha = Math.max(0.03, pipelineState.netMix * stageBoost);
  const scheme = activeScheme();
  const edgeRgb = colorToRgbArray(scheme.edge);

  state.mesh.faces.forEach((face, fi) => {
    const fmap = state.unfolded.face2D[fi];
    ctx2d.beginPath();
    const p0 = fmap.get(face[0]);
    ctx2d.moveTo(ox + p0.x * scale, oy + p0.y * scale);
    for (let i = 1; i < face.length; i++) {
      const p = fmap.get(face[i]);
      ctx2d.lineTo(ox + p.x * scale, oy + p.y * scale);
    }
    ctx2d.closePath();
    const isBase = fi === runtime.rootFace;
    const fillRgb = faceColorRgb(scheme, fi, isBase);
    ctx2d.fillStyle = isBase
      ? `rgba(${fillRgb[0]},${fillRgb[1]},${fillRgb[2]},${(0.35 + 0.45 * alpha).toFixed(3)})`
      : `rgba(${fillRgb[0]},${fillRgb[1]},${fillRgb[2]},${(0.18 + 0.5 * alpha).toFixed(3)})`;
    ctx2d.fill();
    ctx2d.strokeStyle = isBase
      ? `rgba(${scheme.baseNetStroke[0]},${scheme.baseNetStroke[1]},${scheme.baseNetStroke[2]},${(0.6 + 0.4 * alpha).toFixed(3)})`
      : `rgba(${edgeRgb[0]},${edgeRgb[1]},${edgeRgb[2]},${(0.22 + 0.78 * alpha).toFixed(3)})`;
    ctx2d.lineWidth = isBase ? 2.8 : 1.35;
    ctx2d.stroke();

    if (isBase) {
      const cx = face.reduce((sum, vi) => sum + fmap.get(vi).x, 0) / face.length;
      const cy = face.reduce((sum, vi) => sum + fmap.get(vi).y, 0) / face.length;
      ctx2d.fillStyle = `rgba(${scheme.baseLabel[0]},${scheme.baseLabel[1]},${scheme.baseLabel[2]},${(0.75 + 0.25 * alpha).toFixed(3)})`;
      ctx2d.font = "700 13px Inter, system-ui, sans-serif";
      ctx2d.textAlign = "center";
      ctx2d.textBaseline = "middle";
      ctx2d.fillText("Fixed Base", ox + cx * scale, oy + cy * scale);
    }
  });

  for (const key of state.unfolded.cutEdges) {
    const [a, bIdx] = key.split("_").map(Number);
    for (let fi = 0; fi < state.mesh.faces.length; fi++) {
      const fmap = state.unfolded.face2D[fi];
      if (!fmap.has(a) || !fmap.has(bIdx)) continue;
      const pa = fmap.get(a);
      const pb = fmap.get(bIdx);
      ctx2d.strokeStyle = `rgba(${scheme.cut2d[0]},${scheme.cut2d[1]},${scheme.cut2d[2]},${(0.32 + 0.68 * alpha).toFixed(3)})`;
      ctx2d.lineWidth = 2.4;
      ctx2d.beginPath();
      ctx2d.moveTo(ox + pa.x * scale, oy + pa.y * scale);
      ctx2d.lineTo(ox + pb.x * scale, oy + pb.y * scale);
      ctx2d.stroke();
      break;
    }
  }
}

function phaseIndexById(id) {
  return window.PolyhedronPipeline.PHASES.findIndex((p) => p.id === id);
}

function isBaseFacingCamera() {
  if (!state.mesh || !state.mesh.faces?.length) return false;
  const face = state.mesh.faces[runtime.rootFace];
  if (!face || !face.length) return false;

  const center = face.reduce(
    (acc, vi) => {
      const v = state.mesh.vertices[vi];
      acc.x += v.x;
      acc.y += v.y;
      acc.z += v.z;
      return acc;
    },
    { x: 0, y: 0, z: 0 }
  );
  center.x /= face.length;
  center.y /= face.length;
  center.z /= face.length;

  modelGroup.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  const worldCenter = new THREE.Vector3(center.x, center.y, center.z).applyMatrix4(modelGroup.matrixWorld);
  const worldNormal = new THREE.Vector3(
    state.mesh.faceNormals[runtime.rootFace].x,
    state.mesh.faceNormals[runtime.rootFace].y,
    state.mesh.faceNormals[runtime.rootFace].z
  )
    .transformDirection(modelGroup.matrixWorld)
    .normalize();
  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);
  const toCamera = camPos.sub(worldCenter).normalize();

  return worldNormal.dot(toCamera) > 0.06;
}

function applyUnfoldGate(nextTimeline) {
  const disassembleStart = window.PolyhedronPipeline.PHASES[phaseIndexById("disassemble")].start;
  const gateEpsilon = 0.0005;
  const crossesGate = state.timeline < disassembleStart && nextTimeline >= disassembleStart;
  const nearGate = state.timeline >= disassembleStart - 0.01 && state.timeline < disassembleStart + 0.06;
  if ((crossesGate || nearGate) && isBaseFacingCamera()) {
    return disassembleStart - gateEpsilon;
  }
  return nextTimeline;
}

function applyRotateBaseGate(nextTimeline) {
  const phases = window.PolyhedronPipeline.PHASES;
  const rotateBase = phases[phaseIndexById("rotate_base")];
  if (!rotateBase) return nextTimeline;

  const gateEpsilon = 0.0005;
  const movingForward = nextTimeline > state.timeline;
  const inOrBeyondRotateBase = nextTimeline >= rotateBase.start;
  const rotateNotDone = !state.rotateBaseSpinDone;
  if (!movingForward || !inOrBeyondRotateBase || !rotateNotDone) return nextTimeline;

  return Math.min(nextTimeline, rotateBase.end - gateEpsilon);
}

function applyTimelineGates(nextTimeline) {
  let t = applyUnfoldGate(nextTimeline);
  t = applyRotateBaseGate(t);
  return t;
}

function jumpToPhase(phaseId) {
  state.playing = false;
  playEl.textContent = "Play";
  state.targetTimeline = window.PolyhedronPipeline.timelineForPhase(phaseId);
}

function setActivePhaseButton(phaseId) {
  phaseButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.phase === phaseId);
  });
}

function formatHudTimerSeconds(seconds) {
  const total = Math.max(0, seconds);
  const mm = Math.floor(total / 60);
  const ss = Math.floor(total % 60);
  const ds = Math.floor((total - Math.floor(total)) * 10);
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}.${ds}`;
}

function tick(ts) {
  const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
  state.lastTs = ts;

  if (state.playing) {
    const nextTimeline = state.timeline + dt * TIMELINE_PLAY_RATE;
    state.timeline = applyTimelineGates(nextTimeline);
    if (state.timeline >= 1) {
      state.timeline = 1;
      state.playing = false;
      playEl.textContent = "Play";
    }
    timelineEl.value = String(Math.round(state.timeline * 1000));
  }

  if (state.targetTimeline !== null) {
    const d = state.targetTimeline - state.timeline;
    const step = Math.sign(d) * Math.min(Math.abs(d), dt * TIMELINE_TRANSITION_RATE);
    state.timeline = applyTimelineGates(state.timeline + step);
    if (Math.abs(state.targetTimeline - state.timeline) < 0.002) {
      state.timeline = state.targetTimeline;
      state.targetTimeline = null;
    }
    timelineEl.value = String(Math.round(state.timeline * 1000));
  }

  const p = window.PolyhedronPipeline.buildState(state.timeline);
  const speed = parseFloat(speedEl.value);
  const isAnimating = state.playing || state.targetTimeline !== null;
  if (isAnimating) {
    const rotateBaseIdx = phaseIndexById("rotate_base");
    const phaseIdx = phaseIndexById(p.phase.id);
    if (p.phase.id === "rotate_base") {
      if (state.rotateBaseYaw === null) {
        state.rotateBaseYaw = modelGroup.rotation.y;
        state.rotateBaseVel = speed * 0.6;
        state.rotateBaseSettled = false;
        state.rotateBaseSpinStart = null;
        state.rotateBaseSpinDone = false;
      }

      const decay = Math.exp(-5.8 * dt);
      state.rotateBaseVel *= decay;
      state.rotateBaseYaw += state.rotateBaseVel * dt;
      modelGroup.rotation.y = state.rotateBaseYaw;

      if (!state.rotateBaseSettled && Math.abs(state.rotateBaseVel) < 0.02) {
        state.rotateBaseSettled = true;
        state.rotateBaseSpinStart = state.baseSpin;
        state.rotateBaseSpinDone = false;
      }
      if (state.rotateBaseSettled) {
        if (!state.rotateBaseSpinDone) {
          const dir = speed < 0 ? -1 : 1;
          const spinRate = Math.abs(speed) * 1.2; // 2x normal rotation speed.
          state.baseSpin += dir * spinRate * dt;
          const turned = Math.abs(state.baseSpin - (state.rotateBaseSpinStart ?? 0));
          if (turned >= Math.PI * 2) {
            state.rotateBaseSpinDone = true;
          }
        }
      } else {
        state.baseSpin = 0;
      }
    } else if (phaseIdx < rotateBaseIdx) {
      state.autoYaw += speed * dt * 0.6;
      modelGroup.rotation.y = state.autoYaw;
      state.baseSpin = 0;
      state.rotateBaseYaw = null;
      state.rotateBaseVel = 0;
      state.rotateBaseSettled = false;
      state.rotateBaseSpinStart = null;
      state.rotateBaseSpinDone = false;
      state.resumeAutoYawArmed = false;
    } else if (p.phase.id === "complete") {
      if (!state.resumeAutoYawArmed) {
        state.autoYaw = modelGroup.rotation.y;
        state.resumeAutoYawArmed = true;
      }
      state.autoYaw += speed * dt * 0.6;
      modelGroup.rotation.y = state.autoYaw;
    } else {
      // After rotate_base, keep the settled orientation and spin offset.
      if (state.rotateBaseYaw !== null) modelGroup.rotation.y = state.rotateBaseYaw;
      state.resumeAutoYawArmed = false;
    }
  }

  phaseEl.textContent = `Phase: ${p.label}`;
  setActivePhaseButton(p.phase.id);
  const scheme = activeScheme();
  if (state.runStartTs === null) state.runStartTs = ts;
  const elapsedSeconds = Math.max(0, (ts - state.runStartTs) / 1000);
  const hudTimer = formatHudTimerSeconds(elapsedSeconds);
  hud3dEl.style.color = `rgb(${scheme.hudText[0]},${scheme.hudText[1]},${scheme.hudText[2]})`;
  hud3dEl.style.borderColor = `rgba(${scheme.hudKey[0]},${scheme.hudKey[1]},${scheme.hudKey[2]},0.35)`;
  hud3dEl.innerHTML = [
    ["Timer", hudTimer],
    ["Solid", state.mesh ? state.mesh.name : "-"],
    ["Phase", p.label],
    ["Timeline", `${Math.round(state.timeline * 100)}%`],
    ["Scheme", colorSchemeEl.options[colorSchemeEl.selectedIndex]?.text || colorSchemeEl.value]
  ]
    .map(([k, v]) => `<div class="hud-line"><span class="hud-key" style="color: rgb(${scheme.hudKey[0]},${scheme.hudKey[1]},${scheme.hudKey[2]})">${k}</span><span class="hud-value">${v}</span></div>`)
    .join("");

  update3D(p);
  draw2DNet(p);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function bindEvents() {
  solidEl.addEventListener("change", () => {
    setupMesh();
    state.timeline = 0;
    state.targetTimeline = null;
    state.baseSpin = 0;
    state.rotateBaseYaw = null;
    state.rotateBaseVel = 0;
    state.rotateBaseSettled = false;
    state.rotateBaseSpinStart = null;
    state.rotateBaseSpinDone = false;
    state.resumeAutoYawArmed = false;
    timelineEl.value = "0";
  });

  baseFaceEl.addEventListener("input", () => {
    setupMesh();
    state.timeline = 0;
    state.targetTimeline = null;
    state.baseSpin = 0;
    state.rotateBaseYaw = null;
    state.rotateBaseVel = 0;
    state.rotateBaseSettled = false;
    state.rotateBaseSpinStart = null;
    state.rotateBaseSpinDone = false;
    state.resumeAutoYawArmed = false;
    timelineEl.value = "0";
  });

  colorSchemeEl.addEventListener("change", () => {
    setupMesh();
  });

  timelineEl.addEventListener("input", () => {
    state.timeline = parseInt(timelineEl.value, 10) / 1000;
    state.targetTimeline = null;
    state.playing = false;
    state.rotateBaseYaw = null;
    state.rotateBaseVel = 0;
    state.rotateBaseSettled = false;
    state.rotateBaseSpinStart = null;
    state.rotateBaseSpinDone = false;
    state.resumeAutoYawArmed = false;
    playEl.textContent = "Play";
  });

  playEl.addEventListener("click", () => {
    if (!state.playing && state.timeline >= 0.999) {
      // Restart from the beginning when pressing play at the final phase.
      state.timeline = 0;
      timelineEl.value = "0";
    }
    state.playing = !state.playing;
    if (state.playing) state.targetTimeline = null;
    playEl.textContent = state.playing ? "Pause" : "Play";
  });

  resetEl.addEventListener("click", () => {
    state.timeline = 0;
    state.targetTimeline = null;
    timelineEl.value = "0";
    state.playing = false;
    playEl.textContent = "Play";
    controls.reset();
    applyViewportCameraPreset(true);
    state.runStartTs = null;
    state.autoYaw = 0;
    state.baseSpin = 0;
    state.rotateBaseYaw = null;
    state.rotateBaseVel = 0;
    state.rotateBaseSettled = false;
    state.rotateBaseSpinStart = null;
    state.rotateBaseSpinDone = false;
    state.resumeAutoYawArmed = false;
  });

  prevStepEl.addEventListener("click", () => {
    const current = window.PolyhedronPipeline.buildState(state.timeline).phase.id;
    const i = phaseIndexById(current);
    const isWrap = i <= 0;
    const target = isWrap ? window.PolyhedronPipeline.PHASES.length - 1 : i - 1;
    if (isWrap) {
      state.timeline = 1.0;
      timelineEl.value = "1000";
    }
    jumpToPhase(window.PolyhedronPipeline.PHASES[target].id);
  });

  nextStepEl.addEventListener("click", () => {
    const current = window.PolyhedronPipeline.buildState(state.timeline).phase.id;
    const i = phaseIndexById(current);
    const isWrap = i >= window.PolyhedronPipeline.PHASES.length - 1;
    const target = isWrap ? 0 : i + 1;
    if (isWrap) {
      state.timeline = 0.0;
      timelineEl.value = "0";
    }
    jumpToPhase(window.PolyhedronPipeline.PHASES[target].id);
  });

  phaseButtons.forEach((btn) => btn.addEventListener("click", () => jumpToPhase(btn.dataset.phase)));
  bgmToggleEl.addEventListener("click", toggleBgm);
  bgmNextEl.addEventListener("click", nextTrack);
  bgmVolumeEl.addEventListener("input", () => {
    const vol = Number(bgmVolumeEl.value) / 100;
    audioState.audio.volume = vol;
    syncVolumeText();
  });
  window.addEventListener("resize", resize);
}

function init() {
  solidEl.value = "icosahedron";
  colorSchemeEl.value = "classic";
  setTrack(pickRandomTrack(), { force: true });
  syncBgmButton();
  syncVolumeText();
  applyViewportCameraPreset(true);
  resize();
  setupMesh();
  bindEvents();
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => resize());
    const viewGrid = document.querySelector(".view-grid");
    if (viewGrid) resizeObserver.observe(viewGrid);
  }
  requestAnimationFrame(tick);
}

init();
