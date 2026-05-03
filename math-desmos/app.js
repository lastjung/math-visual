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
  let currentPresetName = "trig";

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

    calculator = Desmos.GraphingCalculator(calculatorElement, getCalculatorOptions());

    calculator.observeEvent("change", function (_eventName, event) {
      if (event.isUserInitiated) {
        setStatus("그래프가 변경되었습니다. 저장 버튼으로 현재 상태를 보관할 수 있습니다.");
      }
    });

    applyPreset(currentPresetName);
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

  function rebuildCalculatorForDisplayMode() {
    if (!window.Desmos || !calculator) return;
    const state = calculator.getState();
    calculator.destroy();
    calculator = Desmos.GraphingCalculator(calculatorElement, getCalculatorOptions());
    calculator.setState(state, { allowUndo: true });
    calculator.resize();
  }

  function applyExpressions(expressions, bounds) {
    calculator.setBlank({ allowUndo: true });
    calculator.setExpressions(expressions);
    calculator.setMathBounds(bounds);
  }

  function applyPreset(name) {
    if (!calculator) return;
    currentPresetName = name;
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
    if (name === "trig") {
      syncVariableControls({ a: 1.5, b: 0.75, c: 0 });
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
      await this.context.resume();
      if (this.isRunning) return;
      this.isRunning = true;
      this.startedAt = this.context.currentTime;
      this.scheduleLoop();
      this.timerId = window.setInterval(() => this.scheduleLoop(), 220);
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

    setMix(value) {
      this.mix = value;
      const now = this.context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.isRunning ? this.mix : 0.0001, now, 0.04);
    }

    setMotion(value) {
      this.motion = value;
    }

    scheduleLoop() {
      if (!this.isRunning) return;
      const now = this.context.currentTime;
      const t = now - this.startedAt;
      const motion = this.motion;
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

  function syncVariableControls(values) {
    for (const [key, value] of Object.entries(values)) {
      const control = variableControls[key];
      if (!control) continue;
      control.input.value = String(value);
      control.value.textContent = Number(value).toFixed(2);
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
        min: control.input.min,
        max: control.input.max,
        step: control.input.step,
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
      setStatus("그래프 질감 소리를 재생 중입니다. 준비된 음악 위에 낮게 얹어 쓰세요.");
    }).catch(() => {
      setStatus("오디오를 시작하지 못했습니다. 브라우저 오디오 권한을 확인하세요.");
    });
  });

  document.getElementById("stop-graph-audio").addEventListener("click", function () {
    if (graphAudio) {
      graphAudio.stop();
    }
    setStatus("그래프 질감 소리를 정지했습니다.");
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
  loadDesmos(getApiKey());
})();
