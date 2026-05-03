(function () {
  const apiVersion = "v1.12";
  const fallbackApiKey = "desmos";
  const storageKeys = {
    apiKey: "math-desmos-api-key",
    graphState: "math-desmos-graph-state",
  };

  const calculatorElement = document.getElementById("calculator");
  const calculatorWrap = document.querySelector(".calculator-wrap");
  const statusElement = document.getElementById("status");
  const apiKeyInput = document.getElementById("api-key");
  const expressionInput = document.getElementById("expression-input");
  const graphAudioMix = document.getElementById("graph-audio-mix");
  const graphAudioMixValue = document.getElementById("graph-audio-mix-value");
  const graphAudioMotion = document.getElementById("graph-audio-motion");
  const graphAudioMotionValue = document.getElementById("graph-audio-motion-value");
  const detectedAValue = document.getElementById("detected-a-value");
  const detectedTValue = document.getElementById("detected-t-value");
  const musicToggle = document.getElementById("music-toggle");
  const musicVolume = document.getElementById("music-volume");
  const musicNext = document.getElementById("music-next");
  const musicVolumeIcon = document.getElementById("music-volume-icon");
  const musicTrackLabel = document.getElementById("music-track-label");
  const variableControls = {
    a: {
      input: document.getElementById("var-a"),
      value: document.getElementById("var-a-value"),
    },
    b: {
      input: document.getElementById("var-b"),
      value: document.getElementById("var-b-value"),
    },
    c: {
      input: document.getElementById("var-c"),
      value: document.getElementById("var-c-value"),
    },
  };

  let calculator = null;
  let customExpressionCount = 0;
  let graphAudio = null;
  let currentPresetName = "amazing-part-3";
  let currentTrackPath = "";
  let lastDetectedA = null;
  const graphScan = {
    rafId: null,
    startedAt: 0,
    durationMs: 8000,
    min: -10,
    max: 10,
    lastSoundAt: 0,
    lastVisualAt: 0,
  };

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function getApiKey() {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("apiKey") ||
      localStorage.getItem(storageKeys.apiKey) ||
      fallbackApiKey
    );
  }

  function loadDesmos(apiKey) {
    setStatus("Desmos API 스크립트를 불러오는 중입니다.");
    apiKeyInput.value = apiKey;

    const existingScript = document.querySelector("[data-desmos-script]");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.dataset.desmosScript = "true";
    script.src = `https://www.desmos.com/api/${apiVersion}/calculator.js?apiKey=${encodeURIComponent(
      apiKey
    )}&lang=ko`;
    script.onload = initializeCalculator;
    script.onerror = function () {
      setStatus("Desmos 스크립트를 불러오지 못했습니다. API key나 네트워크를 확인하세요.");
    };
    document.head.appendChild(script);
  }

  function initializeCalculator() {
    if (!window.Desmos) {
      setStatus("Desmos 객체를 찾을 수 없습니다.");
      return;
    }

    if (calculator) {
      calculator.destroy();
    }

    createCalculator();

    applyPreset(currentPresetName);
    handleCalculatorChange();
    showApiCalculator();
    setStatus("API 계산기가 준비되었습니다. 촬영 모드에서는 그래프만 보이게 전환됩니다.");
  }

  function getCalculatorOptions() {
    const clean = document.body.classList.contains("studio-mode");
    return {
      expressions: !clean,
      settingsMenu: !clean,
      zoomButtons: !clean,
      showResetButtonOnGraphpaper: !clean,
      expressionsTopbar: !clean,
      images: false,
      folders: true,
      notes: true,
      sliders: true,
      projectorMode: clean,
      fontSize: clean ? 18 : 16,
      backgroundColor: "#ffffff",
      accentColor: "#006f86",
      graphDescription: "Interactive Desmos graph embedded in Math Desmos Lab.",
    };
  }

  function createCalculator(state = null) {
    calculator = Desmos.GraphingCalculator(calculatorElement, getCalculatorOptions());
    calculator.observeEvent("change", function (_eventName, event) {
      if (event.isUserInitiated) {
        handleCalculatorChange();
      }
    });
    if (state) {
      calculator.setState(state, { allowUndo: true });
    }
  }

  function rebuildCalculatorForDisplayMode() {
    if (!window.Desmos || !calculator) return;
    const state = calculator.getState();
    calculator.destroy();
    createCalculator(state);
    calculator.resize();
  }

  function applyExpressions(expressions, bounds) {
    calculator.setBlank({ allowUndo: true });
    calculator.setExpressions(expressions);
    calculator.setMathBounds(bounds);
  }

  function applyPreset(name) {
    if (!calculator) return;
    stopGraphScan();
    const previousPresetName = currentPresetName;
    currentPresetName = name;
    if ((previousPresetName === "amazing-part-3") !== (name === "amazing-part-3")) {
      rebuildCalculatorForDisplayMode();
    }
    showApiCalculator();

    const presets = {
      parabola: {
        expressions: [
          { id: "note", type: "text", text: "슬라이더 a, h, k를 움직여 포물선을 조절하세요." },
          { id: "a", latex: "a=1", sliderBounds: { min: -4, max: 4, step: 0.1 } },
          { id: "h", latex: "h=0", sliderBounds: { min: -6, max: 6, step: 0.1 } },
          { id: "k", latex: "k=0", sliderBounds: { min: -6, max: 6, step: 0.1 } },
          { id: "parabola", latex: "y=a\\left(x-h\\right)^2+k", color: "#c74440" },
          { id: "vertex", latex: "\\left(h,k\\right)", color: "#006f86", showLabel: true, label: "vertex" },
        ],
        bounds: { left: -8, right: 8, bottom: -6, top: 8 },
      },
      trig: {
        expressions: [
          { id: "note", type: "text", text: "위상과 진폭을 바꾸며 파형 합성을 확인하세요." },
          { id: "a", latex: "a=1.5", sliderBounds: { min: 0, max: 4, step: 0.1 } },
          { id: "b", latex: "b=0.75", sliderBounds: { min: 0, max: 4, step: 0.1 } },
          { id: "c", latex: "c=0", sliderBounds: { min: -6.28, max: 6.28, step: 0.01 } },
          { id: "sine", latex: "y=a\\sin\\left(x+c\\right)", color: "#2d70b3" },
          { id: "cosine", latex: "y=b\\cos\\left(2x\\right)", color: "#388c46" },
          { id: "sum", latex: "y=a\\sin\\left(x+c\\right)+b\\cos\\left(2x\\right)", color: "#c74440", lineWidth: 4 },
        ],
        bounds: { left: -10, right: 10, bottom: -5, top: 5 },
        controls: {
          a: { min: 0, max: 4, step: 0.01, value: 1.5, enabled: true },
          b: { min: 0, max: 4, step: 0.01, value: 0.75, enabled: true },
          c: { min: -6.28, max: 6.28, step: 0.01, value: 0, enabled: true },
        },
      },
      "amazing-part-3": {
        expressions: [
          { id: "note", type: "text", text: "math-symphony/score/01_amazing_part3.md에서 가져온 핵심 수식입니다. a를 0-30으로 스캔합니다." },
          { id: "colors-background-title", type: "text", text: "Colors / Background" },
          { id: "background", latex: "\\left|y\\right|>0", color: "#000000", fillOpacity: 1, lineOpacity: 0 },
          { id: "a", latex: "a=1.6", sliderBounds: { min: 0, max: 30, step: 0.01 } },
          { id: "T", latex: "T=10", sliderBounds: { min: -10, max: 10, step: 0.01 } },
          { id: "scan-cursor", latex: "x=T", color: "#ffffff", lineStyle: Desmos.Styles.DASHED, lineWidth: 2 },
          { id: "standard-resonance", latex: "y=\\cos\\left(ax\\right)\\left\\{x<T\\right\\}", color: "#ff0000", lineWidth: 3 },
          { id: "expanding-resonance", latex: "y=x\\cos\\left(ax\\right)\\left\\{x<T\\right\\}", color: "#00ff00", lineWidth: 2 },
          { id: "envelope-modulation", latex: "y=\\cos\\left(x\\right)\\cos\\left(ax\\right)\\left\\{x<T\\right\\}", color: "#ffffff", lineWidth: 3 },
          { id: "grid-distortion", latex: "\\cos\\left(ax\\right)=\\sin\\left(ay\\right)\\left\\{x<T\\right\\}", color: "#00ff00", lineWidth: 2 },
          { id: "radial-whirlpool", latex: "y=4.8\\cos\\left(\\frac{axy}{x^2+y^2}\\right)\\left\\{x<T\\right\\}", color: "#ff0000", lineWidth: 2 },
        ],
        bounds: { left: -10, right: 10, bottom: -10, top: 10 },
        controls: {
          a: { min: 0, max: 30, step: 0.01, value: 1.6, enabled: true },
          b: { min: -4, max: 4, step: 0.01, value: 0, enabled: false },
          c: { min: -6.28, max: 6.28, step: 0.01, value: 0, enabled: false },
        },
      },
      polar: {
        expressions: [
          { id: "note", type: "text", text: "극좌표 모드에서 r=... 형태의 곡선을 그립니다." },
          { id: "n", latex: "n=5", sliderBounds: { min: 1, max: 12, step: 1 } },
          { id: "rose", latex: "r=4\\cos\\left(n\\theta\\right)", color: "#6042a6", lineWidth: 3 },
          { id: "circle", latex: "r=2", color: "#d79b18", lineStyle: Desmos.Styles.DASHED },
        ],
        bounds: { left: -5, right: 5, bottom: -5, top: 5 },
      },
      implicit: {
        expressions: [
          { id: "note", type: "text", text: "Desmos는 음함수와 부등식도 바로 렌더링합니다." },
          { id: "heart", latex: "\\left(x^2+y^2-1\\right)^3-x^2y^3=0", color: "#c74440" },
          { id: "circle-fill", latex: "x^2+y^2<1", color: "#fa7e19", lineOpacity: "0.45" },
          { id: "lemniscate", latex: "\\left(x^2+y^2\\right)^2=8\\left(x^2-y^2\\right)", color: "#006f86" },
        ],
        bounds: { left: -4, right: 4, bottom: -3, top: 3 },
      },
    };

    const preset = presets[name] || presets.parabola;
    applyExpressions(preset.expressions, preset.bounds);
    if (name === "amazing-part-3") {
      setScanPosition(graphScan.max);
    }
    if (preset.controls) {
      configureVariableControls(preset.controls);
    }
    setStatus(`"${name}" 예제를 불러왔습니다.`);
  }

  function showApiCalculator() {
    calculatorWrap.classList.remove("is-shared");
    if (calculator) {
      calculator.resize();
    }
  }

  function showSharedGraph() {
    calculatorWrap.classList.add("is-shared");
    setStatus(
      "공유 그래프를 사이트 안에 표시했습니다. 조절이 제한되면 API 계산기 안에 수식을 직접 옮겨야 합니다."
    );
  }

  function toggleStudioMode() {
    document.body.classList.toggle("studio-mode");
    if (!calculatorWrap.classList.contains("is-shared")) {
      rebuildCalculatorForDisplayMode();
    }
  }

  function exitStudioMode() {
    document.body.classList.remove("studio-mode");
    if (!calculatorWrap.classList.contains("is-shared")) {
      rebuildCalculatorForDisplayMode();
    }
  }

  class GraphAudioTexture {
    constructor() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.filter = this.context.createBiquadFilter();
      this.delay = this.context.createDelay(0.8);
      this.feedback = this.context.createGain();
      this.delayMix = this.context.createGain();
      this.isRunning = false;
      this.mix = 0.18;
      this.motion = 0.55;
      this.timerId = null;
      this.startedAt = 0;
      this.controllerValue = 0;
      this.previousControllerNorm = 0;
      this.graphLayers = [];

      this.filter.type = "lowpass";
      this.filter.frequency.value = 2400;
      this.filter.Q.value = 0.7;
      this.delay.delayTime.value = 0.28;
      this.feedback.gain.value = 0.18;
      this.delayMix.gain.value = 0.16;
      this.master.gain.value = 0.0001;

      this.filter.connect(this.master);
      this.filter.connect(this.delay);
      this.delay.connect(this.feedback);
      this.feedback.connect(this.delay);
      this.delay.connect(this.delayMix);
      this.delayMix.connect(this.master);
      this.master.connect(this.context.destination);
    }

    async start() {
      await this.startGraphReadMode();
    }

    async startGraphReadMode() {
      await this.context.resume();
      this.isRunning = true;
      if (this.timerId) {
        window.clearInterval(this.timerId);
        this.timerId = null;
      }
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(Math.max(this.mix, 0.28), now, 0.04);
      this.ensureGraphLayers();
    }

    stop() {
      this.isRunning = false;
      if (this.timerId) {
        window.clearInterval(this.timerId);
        this.timerId = null;
      }
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.0001, now, 0.08);
    }

    muteGraphReadMode() {
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0.0001, now, 0.04);
      this.graphLayers.forEach((layer) => {
        layer.gain.gain.cancelScheduledValues(now);
        layer.gain.gain.setTargetAtTime(0.0001, now, 0.025);
      });
    }

    setMix(value) {
      this.mix = value;
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.isRunning ? this.mix : 0.0001, now, 0.04);
    }

    setMotion(value) {
      this.motion = value;
    }

    reactToControllerValue(value, min, max) {
      const range = Math.max(0.0001, max - min);
      const norm = Math.max(0, Math.min(1, (value - min) / range));
      const delta = Math.abs(norm - this.previousControllerNorm);
      this.previousControllerNorm = norm;
      this.controllerValue = norm;
      this.motion = Math.max(this.motion, 0.22 + norm * 0.72);

      if (!this.isRunning) return;

      const now = this.context.currentTime;
      this.filter.frequency.setTargetAtTime(900 + norm * 5200, now, 0.035);
      if (delta > 0.006) {
        const frequency = 164.81 * Math.pow(2, Math.round(norm * 24) / 12);
        this.playBell(frequency, now, 0.22 + delta * 2.2, -0.7 + norm * 1.4, 0.035 + Math.min(0.08, delta * 2.4));
      }
    }

    playGraphSample(sample, slope, scanNorm) {
      if (!this.isRunning) return;
      const now = this.context.currentTime;
      const clamped = Math.max(-1, Math.min(1, sample));
      const slopeEnergy = Math.max(0, Math.min(1, Math.abs(slope) / 12));
      const semitone = Math.round((clamped + 1) * 12);
      const frequency = 146.83 * Math.pow(2, semitone / 12);
      const gain = 0.16 + Math.abs(clamped) * 0.2 + slopeEnergy * 0.14;
      const duration = 0.2 + slopeEnergy * 0.2;
      const pan = -0.85 + scanNorm * 1.7;

      this.filter.frequency.setTargetAtTime(900 + slopeEnergy * 5200 + scanNorm * 900, now, 0.025);
      this.playBell(frequency, now, duration, pan, gain);
    }

    ensureGraphLayers() {
      if (this.graphLayers.length) return;
      const specs = [
        { id: "main", type: "sine", base: 174.61, scale: 20, level: 0.16, pan: -0.45 },
        { id: "bass", type: "triangle", base: 82.41, scale: 11, level: 0.12, pan: 0 },
        { id: "shimmer", type: "sine", base: 349.23, scale: 28, level: 0.08, pan: 0.48 },
      ];

      this.graphLayers = specs.map((spec) => {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const panner = this.context.createStereoPanner();
        osc.type = spec.type;
        osc.frequency.value = spec.base;
        gain.gain.value = 0.0001;
        panner.pan.value = spec.pan;
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.filter);
        osc.start();
        return { ...spec, osc, gain, panner };
      });
    }

    updateGraphLayers(samples, scanNorm) {
      if (!this.isRunning) return;
      this.ensureGraphLayers();
      const now = this.context.currentTime;
      const normalized = samples.slice(0, this.graphLayers.length);
      let brightness = 0;

      normalized.forEach((sample, index) => {
        const layer = this.graphLayers[index];
        if (!layer || !sample) return;
        const y = Math.max(-1, Math.min(1, sample.y));
        const slope = Math.max(0, Math.min(1, Math.abs(sample.slope) / 18));
        const semitone = y * layer.scale;
        const frequency = layer.base * Math.pow(2, semitone / 12);
        const targetGain = layer.level * (0.28 + Math.abs(y) * 0.55 + slope * 0.42);
        const targetPan = Math.max(-0.95, Math.min(0.95, layer.pan + (scanNorm - 0.5) * 0.45));

        layer.osc.frequency.setTargetAtTime(Math.max(35, Math.min(2200, frequency)), now, 0.035);
        layer.gain.gain.setTargetAtTime(Math.max(0.0001, targetGain), now, 0.035);
        layer.panner.pan.setTargetAtTime(targetPan, now, 0.05);
        brightness += slope;
      });

      this.filter.frequency.setTargetAtTime(1200 + Math.min(1, brightness / this.graphLayers.length) * 4400, now, 0.05);
    }

    scheduleLoop() {
      if (!this.isRunning) return;
      const now = this.context.currentTime;
      const t = now - this.startedAt;
      const motion = Math.max(this.motion, 0.2 + this.controllerValue * 0.75);
      const base = 110 + 28 * Math.sin(t * 0.23);
      const shimmerEvery = motion > 0.72 ? 0.16 : 0.28;

      this.master.gain.setTargetAtTime(this.mix, now, 0.05);
      this.filter.frequency.setTargetAtTime(1500 + motion * 2600 + 900 * Math.sin(t * 0.31), now, 0.12);
      this.playSoftTone(base, now, 1.2, -0.35, 0.22);
      this.playSoftTone(base * 1.5, now + 0.04, 0.9, 0.28, 0.1);

      if (Math.sin(t * (1.8 + motion * 3.5)) > 0.45) {
        this.playBell(this.pickPentatonic(t, motion), now + 0.03, 0.55, Math.sin(t * 0.7) * 0.65);
      }

      if (motion > 0.35 && Math.floor(t / shimmerEvery) !== Math.floor((t - 0.22) / shimmerEvery)) {
        this.playBell(this.pickPentatonic(t + 4.1, motion) * 2, now + 0.08, 0.34, Math.sin(t) * 0.8, 0.035);
      }
    }

    pickPentatonic(t, motion) {
      const scale = [0, 3, 5, 7, 10, 12, 15, 17, 19];
      const raw = Math.floor((Math.sin(t * 0.37) * 0.5 + 0.5) * scale.length + motion * 3);
      const index = Math.abs(raw) % scale.length;
      return 220 * Math.pow(2, scale[index] / 12);
    }

    playSoftTone(frequency, startAt, duration, pan, gain) {
      const voiceGain = this.context.createGain();
      const panner = this.context.createStereoPanner();
      const osc = this.context.createOscillator();
      const overtone = this.context.createOscillator();

      osc.type = "triangle";
      overtone.type = "sine";
      osc.frequency.setValueAtTime(frequency, startAt);
      overtone.frequency.setValueAtTime(frequency * 2.01, startAt);
      panner.pan.setValueAtTime(pan, startAt);
      voiceGain.gain.setValueAtTime(0.0001, startAt);
      voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), startAt + 0.05);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(voiceGain);
      overtone.connect(voiceGain);
      voiceGain.connect(panner);
      panner.connect(this.filter);
      osc.start(startAt);
      overtone.start(startAt);
      osc.stop(startAt + duration + 0.04);
      overtone.stop(startAt + duration + 0.04);
      osc.addEventListener("ended", () => {
        osc.disconnect();
        overtone.disconnect();
        voiceGain.disconnect();
        panner.disconnect();
      }, { once: true });
    }

    playBell(frequency, startAt, duration, pan, gain = 0.07) {
      const voiceGain = this.context.createGain();
      const panner = this.context.createStereoPanner();
      const osc = this.context.createOscillator();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startAt);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.004, startAt + duration);
      panner.pan.setValueAtTime(pan, startAt);
      voiceGain.gain.setValueAtTime(0.0001, startAt);
      voiceGain.gain.exponentialRampToValueAtTime(gain, startAt + 0.012);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(voiceGain);
      voiceGain.connect(panner);
      panner.connect(this.filter);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.03);
      osc.addEventListener("ended", () => {
        osc.disconnect();
        voiceGain.disconnect();
        panner.disconnect();
      }, { once: true });
    }
  }

  function getGraphAudio() {
    if (!graphAudio) {
      graphAudio = new GraphAudioTexture();
      graphAudio.setMix(Number(graphAudioMix.value) / 100);
      graphAudio.setMotion(Number(graphAudioMotion.value) / 100);
    }
    return graphAudio;
  }

  function updateAudioLabels() {
    graphAudioMixValue.textContent = `${graphAudioMix.value}%`;
    graphAudioMotionValue.textContent = `${graphAudioMotion.value}%`;
  }

  function handleCalculatorChange() {
    const value = readSliderValue("a");
    if (value === null) {
      setStatus("그래프가 변경되었습니다. 저장 버튼으로 현재 상태를 보관할 수 있습니다.");
      return;
    }
    detectedAValue.textContent = value.toFixed(2);
    if (lastDetectedA === null || Math.abs(value - lastDetectedA) > 0.015) {
      lastDetectedA = value;
      if (graphAudio) {
        graphAudio.reactToControllerValue(value, 0, 30);
      }
      if (currentPresetName === "amazing-part-3" && graphScan.rafId === null) {
        setScanPosition(graphScan.max);
      }
      setStatus(`Desmos 내부 슬라이더 a=${value.toFixed(2)} 감지됨`);
    }
  }

  function readSliderValue(id) {
    if (!calculator) return null;
    const expression = calculator.getExpressions().find((entry) => entry.id === id);
    if (!expression?.latex) return null;
    const match = expression.latex.match(new RegExp(`^${id}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)`));
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  function startGraphScan() {
    if (!calculator) return;
    stopGraphScan();
    showApiCalculator();
    getGraphAudio().startGraphReadMode().then(() => {
      graphScan.startedAt = performance.now();
      graphScan.lastSoundAt = 0;
      graphScan.lastVisualAt = 0;
      graphScan.rafId = requestAnimationFrame(tickGraphScan);
      setStatus("실제 그래프를 T=-3부터 3까지 읽으며 소리로 변환합니다.");
    }).catch(() => {
      setStatus("그래프 읽기 오디오를 시작하지 못했습니다.");
    });
  }

  function stopGraphScan() {
    if (graphScan.rafId !== null) {
      cancelAnimationFrame(graphScan.rafId);
      graphScan.rafId = null;
    }
    graphScan.lastSoundAt = performance.now();
    if (graphAudio) {
      graphAudio.muteGraphReadMode();
    }
  }

  function setScanPosition(value) {
    if (!calculator) return;
    calculator.setExpression({
      id: "T",
      latex: `T=${Number(value).toFixed(3)}`,
      sliderBounds: { min: graphScan.min, max: graphScan.max, step: 0.001 },
    });
    detectedTValue.textContent = Number(value).toFixed(2);
  }

  function tickGraphScan(now) {
    const elapsed = (now - graphScan.startedAt) % (graphScan.durationMs * 2);
    const phase = elapsed / graphScan.durationMs;
    const scanNorm = phase <= 1 ? phase : 2 - phase;
    const x = graphScan.min + (graphScan.max - graphScan.min) * scanNorm;
    const a = readSliderValue("a") ?? 1.6;
    const b = readSliderValue("b") ?? 0.75;
    const c = readSliderValue("c") ?? 0;
    const samples = sampleCurrentGraphLayers(x, { a, b, c });

    if (now - graphScan.lastVisualAt > 33) {
      setScanPosition(x);
      graphScan.lastVisualAt = now;
    }

    if (samples.length) {
      getGraphAudio().updateGraphLayers(samples, scanNorm);
    }

    graphScan.rafId = requestAnimationFrame(tickGraphScan);
  }

  function sampleCurrentGraphLayers(x, params) {
    if (currentPresetName === "amazing-part-3") {
      const y1 = Math.cos(params.a * x);
      const slope1 = -params.a * Math.sin(params.a * x);
      const y2 = (x / 5) * Math.cos(params.a * x);
      const slope2 = (Math.cos(params.a * x) - params.a * x * Math.sin(params.a * x)) / 5;
      const y3 = Math.cos(x) * Math.cos(params.a * x);
      const slope3 = -Math.sin(x) * Math.cos(params.a * x) - params.a * Math.cos(x) * Math.sin(params.a * x);
      return [
        { y: y1, slope: slope1 },
        { y: y2, slope: slope2 },
        { y: y3, slope: slope3 },
      ];
    }

    if (currentPresetName === "trig") {
      const y1 = params.a * Math.sin(x + params.c);
      const slope1 = params.a * Math.cos(x + params.c);
      const y2 = params.b * Math.cos(2 * x);
      const slope2 = -2 * params.b * Math.sin(2 * x);
      return [
        { y: y1 / 4, slope: slope1 },
        { y: y2 / 4, slope: slope2 },
        { y: (y1 + y2) / 5, slope: slope1 + slope2 },
      ];
    }

    return [];
  }

  function getFullTrackPath(track) {
    return track.startsWith("assets/") ? track : `${DesmosMusicConfig.BGM_BASE}${track}`;
  }

  function getDisplayTrackName(track) {
    return track
      .replace(/^.*\//, "")
      .replace(/_/g, " ")
      .replace(/\.mp3$/i, "");
  }

  function pickMusicTrack(autoPlay = true, manualSequential = false) {
    if (!window.audioManager || !DesmosMusicConfig.tracks.length) return;

    let selectedTrack = "";
    const currentTrackFilename = currentTrackPath || "";

    if (manualSequential && currentTrackFilename) {
      const genre = currentTrackFilename.split("/")[0];
      const genreTracks = DesmosMusicConfig.tracks.filter((track) => track.startsWith(`${genre}/`));
      if (genreTracks.length > 0) {
        const currentIndex = genreTracks.indexOf(currentTrackFilename);
        const nextIndex = (currentIndex + 1) % genreTracks.length;
        selectedTrack = genreTracks[nextIndex];
      }
    }

    if (!selectedTrack) {
      const candidates = DesmosMusicConfig.tracks.filter((track) => track !== currentTrackFilename);
      const pool = candidates.length > 0 ? candidates : DesmosMusicConfig.tracks;
      selectedTrack = pool[Math.floor(Math.random() * pool.length)];
    }

    currentTrackPath = selectedTrack;
    musicTrackLabel.textContent = getDisplayTrackName(selectedTrack);
    window.audioManager.play(getFullTrackPath(selectedTrack), { forceSwitch: true });
    if (!autoPlay) {
      window.audioManager.audio.pause();
    }
  }

  function syncMusicControls() {
    if (!window.audioManager) return;
    const isMuted = window.audioManager.isMuted;
    musicVolume.value = isMuted ? "0" : String(window.audioManager.getTargetVolume());
    if (isMuted) {
      musicVolumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>`;
      musicVolumeIcon.style.color = "#f87171";
    } else {
      musicVolumeIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
      musicVolumeIcon.style.color = "rgba(255,255,255,0.84)";
    }
  }

  function syncVariableControls(values) {
    for (const [key, value] of Object.entries(values)) {
      const control = variableControls[key];
      if (!control) continue;
      control.input.value = String(value);
      control.value.textContent = Number(value).toFixed(2);
    }
  }

  function configureVariableControls(config) {
    for (const [key, control] of Object.entries(variableControls)) {
      const setting = config[key] || { enabled: false, value: 0 };
      control.input.disabled = setting.enabled === false;
      if (setting.min !== undefined) control.input.min = String(setting.min);
      if (setting.max !== undefined) control.input.max = String(setting.max);
      if (setting.step !== undefined) control.input.step = String(setting.step);
      if (setting.value !== undefined) {
        control.input.value = String(setting.value);
        control.value.textContent = Number(setting.value).toFixed(2);
      }
    }
  }

  function updateCalculatorVariable(key, value) {
    const control = variableControls[key];
    if (control) {
      control.value.textContent = Number(value).toFixed(2);
    }
    if (!calculator || !control) return;
    showApiCalculator();
    calculator.setExpression({
      id: key,
      latex: `${key}=${Number(value).toFixed(2)}`,
      sliderBounds: {
        min: Number(control.input.min),
        max: Number(control.input.max),
        step: Number(control.input.step),
      },
    });
  }

  document.getElementById("api-key-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const apiKey = apiKeyInput.value.trim() || fallbackApiKey;
    localStorage.setItem(storageKeys.apiKey, apiKey);
    loadDesmos(apiKey);
  });

  document.getElementById("expression-form").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!calculator) return;

    const latex = expressionInput.value.trim();
    if (!latex) return;

    customExpressionCount += 1;
    calculator.setExpression({
      id: `custom-${customExpressionCount}`,
      latex,
      color: Desmos.Colors.BLUE,
    });
    expressionInput.value = "";
    setStatus(`표현식 "${latex}"를 추가했습니다.`);
  });

  document.querySelectorAll("[data-preset]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyPreset(button.dataset.preset);
    });
  });

  document.getElementById("show-api-calculator").addEventListener("click", function () {
    showApiCalculator();
    setStatus("API 계산기로 돌아왔습니다.");
  });

  document.getElementById("show-shared-graph").addEventListener("click", showSharedGraph);

  document.getElementById("toggle-studio-mode").addEventListener("click", toggleStudioMode);
  document.getElementById("exit-studio-mode").addEventListener("click", exitStudioMode);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      exitStudioMode();
    }
  }, true);

  document.getElementById("start-graph-audio").addEventListener("click", function () {
    getGraphAudio().start().then(() => {
      setStatus("그래프 오디오가 준비되었습니다. '그래프 읽기'를 누르면 실제 그래프 샘플 소리만 납니다.");
    }).catch(() => {
      setStatus("오디오를 시작하지 못했습니다. 브라우저 오디오 권한을 확인하세요.");
    });
  });

  document.getElementById("stop-graph-audio").addEventListener("click", function () {
    stopGraphScan();
    if (graphAudio) {
      graphAudio.stop();
    }
    setStatus("그래프 질감 소리를 정지했습니다.");
  });

  document.getElementById("start-graph-scan").addEventListener("click", startGraphScan);

  document.getElementById("stop-graph-scan").addEventListener("click", function () {
    stopGraphScan();
    setStatus("그래프 읽기를 정지했습니다.");
  });

  graphAudioMix.addEventListener("input", function () {
    updateAudioLabels();
    if (graphAudio) {
      graphAudio.setMix(Number(graphAudioMix.value) / 100);
    }
  });

  graphAudioMotion.addEventListener("input", function () {
    updateAudioLabels();
    if (graphAudio) {
      graphAudio.setMotion(Number(graphAudioMotion.value) / 100);
    }
  });

  musicToggle.addEventListener("click", function () {
    if (!currentTrackPath) {
      pickMusicTrack(false, false);
    }
    window.audioManager.toggleMute();
    if (!window.audioManager.isMuted && window.audioManager.currentTrack) {
      window.audioManager.play(window.audioManager.currentTrack);
    }
    syncMusicControls();
  });

  musicNext.addEventListener("click", function () {
    pickMusicTrack(true, false);
    if (window.audioManager.isMuted) {
      window.audioManager.toggleMute();
    }
    syncMusicControls();
  });

  musicVolume.addEventListener("input", function () {
    window.audioManager.setTargetVolume(musicVolume.value);
    if (!currentTrackPath) {
      pickMusicTrack(true, false);
    }
    syncMusicControls();
  });

  window.audioManager.onEnded = function () {
    pickMusicTrack(true, false);
    syncMusicControls();
  };

  Object.entries(variableControls).forEach(function ([key, control]) {
    control.input.addEventListener("input", function () {
      updateCalculatorVariable(key, control.input.value);
    });
  });

  document.getElementById("save-state").addEventListener("click", function () {
    if (!calculator) return;
    localStorage.setItem(storageKeys.graphState, JSON.stringify(calculator.getState()));
    setStatus("현재 그래프 상태를 브라우저에 저장했습니다.");
  });

  document.getElementById("load-state").addEventListener("click", function () {
    if (!calculator) return;
    const savedState = localStorage.getItem(storageKeys.graphState);
    if (!savedState) {
      setStatus("저장된 그래프 상태가 없습니다.");
      return;
    }

    calculator.setState(JSON.parse(savedState), { allowUndo: true });
    setStatus("저장된 그래프 상태를 불러왔습니다.");
  });

  document.getElementById("reset-graph").addEventListener("click", function () {
    applyPreset("parabola");
  });

  document.getElementById("export-image").addEventListener("click", function () {
    if (!calculator) return;
    const image = calculator.screenshot({ width: 1200, height: 800, targetPixelRatio: 2 });
    const preview = window.open("", "_blank", "noopener,noreferrer");
    if (!preview) {
      setStatus("팝업이 차단되어 PNG 미리보기를 열지 못했습니다.");
      return;
    }
    preview.document.write(`<img alt="Desmos graph export" src="${image}" style="width:100%;height:auto">`);
    preview.document.close();
    setStatus("현재 그래프의 PNG 미리보기를 새 창으로 열었습니다.");
  });

  syncVariableControls({ a: 1.5, b: 0.75, c: 0 });
  updateAudioLabels();
  pickMusicTrack(false, false);
  syncMusicControls();
  loadDesmos(getApiKey());
})();
