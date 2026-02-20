const SimilarityCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 150, b: 200, c: 250,
    // x = a^2/c = 90, y = b^2/c = 160, h = ab/c = 120
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',
    colors: ['#0984e3', '#00b894', '#d63031'],

    steps: [
        {
            desc: "직각삼각형 ABC의 빗변 c에 수선 h를 내립니다.<br>빗변은 x와 y 두 부분으로 나뉩니다. (c = x + y)",
            formula: "수선 분할 (Altitude)"
        },
        {
            desc: "왼쪽 작은 삼각형은 전체 큰 삼각형과 닮음입니다.<br>닮음비에 따라 a : x = c : a 가 성립합니다.",
            formula: "a / x = c / a   =>   a² = cx"
        },
        {
            desc: "오른쪽 작은 삼각형도 큰 삼각형과 닮음입니다.<br>닮음비에 따라 b : y = c : b 가 성립합니다.",
            formula: "b / y = c / b   =>   b² = cy"
        },
        {
            desc: "구해진 두 식을 양변끼리 더합니다.<br>a² + b² = cx + cy = c(x + y)",
            formula: "x + y = c 이므로, a² + b² = c²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 9: 삼각형 닮음비 증명';
        const tab = document.querySelector('.tab[data-case="similarity"]');
        if (tab) tab.innerText = '9. 삼각형 닮음비 증명';

        this.initGeometry();
        this.resize();
        this.applyStep(0, false);
    },

    initGeometry() {
        this.geom = {
            tL_opacity: 0,
            tR_opacity: 0,
            tL_scale: 1,
            tR_scale: 1,
            alt_opacity: 0
        };
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        let tlOp = 0, trOp = 0, altOp = 1;
        
        if (index === 0) {
            altOp = 1; tlOp = 0; trOp = 0;
        } else if (index === 1) {
            tlOp = 1; trOp = 0;
        } else if (index === 2) {
            tlOp = 0; trOp = 1;
        } else if (index === 3) {
            tlOp = 1; trOp = 1;
        }

        if (animate) {
            gsap.to(this.geom, {
                tL_opacity: tlOp,
                tR_opacity: trOp,
                alt_opacity: altOp,
                duration: 1.0,
                ease: "power2.inOut"
            });
        } else {
            this.geom.tL_opacity = tlOp;
            this.geom.tR_opacity = trOp;
            this.geom.alt_opacity = altOp;
        }
    },

    moveStep(dir) {
        let next = this.currentStep + dir;
        if (next >= this.steps.length) next = 0;
        if (next < 0) next = 0;
        this.applyStep(next, true);
        Core.updateControls();
    },

    get uiConfig() {
        return [
            { type: 'info', label: '현재 단계', value: `${this.currentStep + 1} / ${this.steps.length}` },
            { type: 'button', id: 'prev-btn', label: 'Prev', value: '이전 단계', onClick: () => this.moveStep(-1) },
            { type: 'button', id: 'next-btn', label: 'Next', value: this.currentStep === this.steps.length - 1 ? '처음부터' : '다음 단계', onClick: () => this.moveStep(1) }
        ];
    },

    draw() {
        if (!this.canvas) return;
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2 + 50;

        ctx.save();
        ctx.translate(cx, cy);

        const A = {x: -90, y: 0};
        const B = {x: 160, y: 0};
        const C = {x: 0, y: -120};
        const D = {x: 0, y: 0};

        // Base Big Triangle
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2d3436';
        ctx.fillStyle = 'rgba(236, 240, 241, 0.5)';
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Right angle at C
        ctx.save();
        ctx.translate(C.x, C.y);
        const angA = Math.atan2(A.y - C.y, A.x - C.x);
        ctx.rotate(angA);
        ctx.strokeRect(0, 0, 15, 15);
        ctx.restore();

        // Labels c, a, b
        ctx.fillStyle = '#2d3436'; ctx.font = 'bold 18px Inter';
        if (this.currentStep === 0 || this.currentStep === 3) {
            ctx.fillText("c (빗변)", (A.x + B.x)/2, 25);
        }
        ctx.fillText("a", (A.x + C.x)/2 - 15, (A.y + C.y)/2 - 10);
        ctx.fillText("b", (B.x + C.x)/2 + 15, (B.y + C.y)/2 - 10);

        // Altitude
        if (this.geom.alt_opacity > 0) {
            ctx.strokeStyle = `rgba(214, 48, 49, ${this.geom.alt_opacity})`;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(C.x, C.y);
            ctx.lineTo(D.x, D.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Right angles at D
            ctx.strokeRect(0, -15, 15, 15);
            ctx.strokeRect(-15, -15, 15, 15);
            
            ctx.fillStyle = `rgba(214, 48, 49, ${this.geom.alt_opacity})`;
            ctx.fillText("h", 10, -50);
            
            ctx.fillStyle = '#2d3436';
            ctx.fillText("x", A.x/2, 25);
            ctx.fillText("y", B.x/2, 25);
        }

        // Left Highlight (T_L)
        if (this.geom.tL_opacity > 0) {
            ctx.fillStyle = `rgba(9, 132, 227, ${this.geom.tL_opacity * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(D.x, D.y);
            ctx.lineTo(C.x, C.y);
            ctx.closePath();
            ctx.fill();
        }

        // Right Highlight (T_R)
        if (this.geom.tR_opacity > 0) {
            ctx.fillStyle = `rgba(0, 184, 148, ${this.geom.tR_opacity * 0.4})`;
            ctx.beginPath();
            ctx.moveTo(D.x, D.y);
            ctx.lineTo(B.x, B.y);
            ctx.lineTo(C.x, C.y);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
        
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center';
        ctx.fillText(this.steps[this.currentStep].formula, canvas.width / 2, canvas.height - 40);
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.applyStep(this.currentStep, false);
    },

    start() {
        if (this.animationId) return;
        const loop = () => { this.draw(); this.animationId = requestAnimationFrame(loop); };
        loop();
    },

    stop() { cancelAnimationFrame(this.animationId); this.animationId = null; },
    destroy() { this.stop(); gsap.killTweensOf(this.geom); }
};
