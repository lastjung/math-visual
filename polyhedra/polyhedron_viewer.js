import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const c3d = document.getElementById("view3d");
const c2d = document.getElementById("view2d");
const ctx2d = c2d.getContext("2d");

const solidEl = document.getElementById("solid");
const speedEl = document.getElementById("speed");
const baseFaceEl = document.getElementById("base-face");
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
  autoYaw: 0,
  hingeByFace: []
};

const audioState = {
  audio: new Audio(),
  tracks: [
    "../visualization/assets/music/bgm/Math_01_Minimalist_Sine_Pulse.mp3",
    "../visualization/assets/music/bgm/Math_03_Euclidean_Polyrhythm.mp3",
    "../visualization/assets/music/bgm/Math_08_Geometric_Vector_Motion.mp3",
    "../visualization/assets/music/bgm/Math_09_Fibonacci_Golden_Ratio.mp3",
    "../visualization/assets/music/bgm/Math_15_Deep_Space_Topology.mp3",
    "../visualization/assets/music/bgm/Math_16_Coordinate_Plane_Ambient.mp3"
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

function createFaceMesh(faceIndices, color) {
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
    new THREE.LineBasicMaterial({ color: 0xcce1ff, transparent: true, opacity: 0.45 })
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
      new THREE.LineBasicMaterial({ color: 0xff2b2b, transparent: true, opacity: 0 })
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

  const faceColors = [0x2f6fbf, 0x3f86dd, 0x2f7fc7, 0x4a9ae7, 0x3aa3df, 0x3684c9];
  const baseFaceColor = 0xeab308;
  for (let fi = 0; fi < state.mesh.faces.length; fi++) {
    const mesh = createFaceMesh(
      state.mesh.faces[fi],
      fi === runtime.rootFace ? baseFaceColor : faceColors[fi % faceColors.length]
    );
    modelGroup.add(mesh);
    runtime.faceNodes.push({ fi, mesh });
  }

  buildCutEdgeLines();
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

  for (const node of runtime.faceNodes) {
    const m = transformForFace(node.fi, mixByFace, cache);
    node.mesh.matrix.copy(m);
  }

  const lineOpacity = pipelineState.cutStrength > 0 ? 0.2 + 0.8 * pipelineState.cutStrength : 0;
  for (const line of runtime.cutEdgeLines) {
    line.material.opacity = lineOpacity;
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
    pipelineState.phase.id === "assemble"
      ? 1
      : 0.4;
  const alpha = Math.max(0.03, pipelineState.netMix * stageBoost);

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
    ctx2d.fillStyle = isBase
      ? `rgba(234,179,8,${(0.35 + 0.45 * alpha).toFixed(3)})`
      : `rgba(83,166,255,${(0.18 + 0.5 * alpha).toFixed(3)})`;
    ctx2d.fill();
    ctx2d.strokeStyle = isBase
      ? `rgba(255,225,130,${(0.6 + 0.4 * alpha).toFixed(3)})`
      : `rgba(220,234,255,${(0.15 + 0.85 * alpha).toFixed(3)})`;
    ctx2d.lineWidth = isBase ? 2.8 : 1.35;
    ctx2d.stroke();

    if (isBase) {
      const cx = face.reduce((sum, vi) => sum + fmap.get(vi).x, 0) / face.length;
      const cy = face.reduce((sum, vi) => sum + fmap.get(vi).y, 0) / face.length;
      ctx2d.fillStyle = `rgba(255,236,170,${(0.75 + 0.25 * alpha).toFixed(3)})`;
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
      ctx2d.strokeStyle = `rgba(255,40,40,${(0.32 + 0.68 * alpha).toFixed(3)})`;
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

function tick(ts) {
  const dt = Math.min(0.05, (ts - state.lastTs) / 1000);
  state.lastTs = ts;

  if (state.playing) {
    state.timeline += dt * 0.24;
    if (state.timeline >= 1) {
      state.timeline = 1;
      state.playing = false;
      playEl.textContent = "Play";
    }
    timelineEl.value = String(Math.round(state.timeline * 1000));
  }

  if (state.targetTimeline !== null) {
    const d = state.targetTimeline - state.timeline;
    const step = Math.sign(d) * Math.min(Math.abs(d), dt * 0.95);
    state.timeline += step;
    if (Math.abs(state.targetTimeline - state.timeline) < 0.002) {
      state.timeline = state.targetTimeline;
      state.targetTimeline = null;
    }
    timelineEl.value = String(Math.round(state.timeline * 1000));
  }

  state.autoYaw += parseFloat(speedEl.value) * dt * 0.6;
  modelGroup.rotation.y = state.autoYaw;

  const p = window.PolyhedronPipeline.buildState(state.timeline);
  phaseEl.textContent = `Phase: ${p.label}`;
  setActivePhaseButton(p.phase.id);
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  hud3dEl.innerHTML = [
    ["Time", `${hh}:${mm}:${ss}`],
    ["Solid", state.mesh ? state.mesh.name : "-"],
    ["Phase", p.label],
    ["Timeline", `${Math.round(state.timeline * 100)}%`]
  ]
    .map(([k, v]) => `<div class="hud-line"><span class="hud-key">${k}</span><span class="hud-value">${v}</span></div>`)
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
    timelineEl.value = "0";
  });

  baseFaceEl.addEventListener("input", () => {
    setupMesh();
    state.timeline = 0;
    state.targetTimeline = null;
    timelineEl.value = "0";
  });

  timelineEl.addEventListener("input", () => {
    state.timeline = parseInt(timelineEl.value, 10) / 1000;
    state.targetTimeline = null;
    state.playing = false;
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
    camera.position.set(0, 0.45, 4.6);
    state.autoYaw = 0;
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
  setTrack(pickRandomTrack(), { force: true });
  syncBgmButton();
  syncVolumeText();
  resize();
  setupMesh();
  bindEvents();
  requestAnimationFrame(tick);
}

init();
