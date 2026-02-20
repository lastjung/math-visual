const GarfieldCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 120, b: 160,
    triangles: [],
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',
    colors: ['#0984e3', '#00b894', '#fdcb6e'],

    steps: [
        {
            desc: "제임스 가필드 대통령의 증명입니다.<br>두 개의 합동인 직각삼각형을 밑변이 일직선이 되도록 붙여 놓습니다.",
            formula: "T1 (넓이: ½ab), T2 (넓이: ½ab)"
        },
        {
            desc: "두 빗변의 끝을 연결하면 사다리꼴이 됩니다.<br>가운데 만들어진 삼각형은 빗변(c)을 두 변으로 하는 직각이등변삼각형입니다.",
            formula: "T3 넓이: ½c²"
        },
        {
            desc: "사다리꼴 넓이 = 세 삼각형 넓이의 합<br>½(a+b)² = ½ab + ½ab + ½c²",
            formula: "a² + 2ab + b² = 2ab + c²   =>   a² + b² = c²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 7: 가필드의 사다리꼴 증명';
        const tab = document.querySelector('.tab[data-case="garfield"]');
        if (tab) tab.innerText = '7. 가필드 증명';

        this.initGeometry();
        this.resize();
        this.applyStep(0, false);
    },

    initGeometry() {
        const { a, b } = this;
        // Elements to animate/draw
        this.geom = {
            t1Opacity: 1,
            t2Opacity: 0,
            t2X: -300, // Starts off-screen or faded
            t3LineProgress: 0,
            formulaOp: 0
        };
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        let t_t1 = 1, t_t2 = 0, t_t2X = -50, t_t3Prog = 0, t_form = 0;

        if (index === 0) {
            t_t2 = 1; t_t2X = 0; t_t3Prog = 0; t_form = 0;
        } else if (index === 1) {
            t_t2 = 1; t_t2X = 0; t_t3Prog = 1; t_form = 0;
        } else if (index === 2) {
            t_t2 = 1; t_t2X = 0; t_t3Prog = 1; t_form = 1;
        }

        if (animate) {
            gsap.to(this.geom, {
                t2Opacity: t_t2,
                t2X: t_t2X,
                t3LineProgress: t_t3Prog,
                formulaOp: t_form,
                duration: 1.5,
                ease: "power2.inOut"
            });
        } else {
            this.geom.t2Opacity = t_t2;
            this.geom.t2X = t_t2X;
            this.geom.t3LineProgress = t_t3Prog;
            this.geom.formulaOp = t_form;
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
            { type: 'button', id: 'next-btn', label: 'Next', value: this.currentStep === this.steps.length - 1 ? '처음부터' : '다음 단계', onClick: () => this.moveStep(1) },
            {
                type: 'slider', id: 'side-a', label: 'Side a', min: 80, max: 180, step: 1, value: this.a,
                onChange: (val) => { this.a = val; this.applyStep(this.currentStep, false); }
            }
        ];
    },

    draw() {
        if (!this.canvas) return;
        const { ctx, canvas, a, b } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const totalW = a + b;
        const totalH = Math.max(a, b);
        
        // Base Anchor at bottom left of T1
        const startX = cx - totalW / 2;
        const startY = cy + totalH / 2;

        ctx.save();
        
        // T1
        ctx.fillStyle = `rgba(9, 132, 227, ${this.geom.t1Opacity * 0.8})`;
        ctx.strokeStyle = `rgba(9, 132, 227, ${this.geom.t1Opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // A(0, a) -> B(0,0) -> E(b,0) but Y is inverted in Canvas
        const pB = { x: startX, y: startY };
        const pA = { x: startX, y: startY - a };
        const pE = { x: startX + b, y: startY };
        ctx.moveTo(pB.x, pB.y);
        ctx.lineTo(pA.x, pA.y);
        ctx.lineTo(pE.x, pE.y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // T1 Labels
        if (this.geom.t1Opacity > 0) {
            ctx.fillStyle = '#2d3436'; ctx.font = '16px Inter';
            ctx.fillText("a", pB.x - 15, pB.y - a/2);
            ctx.fillText("b", pB.x + b/2, pB.y + 20);
            ctx.fillText("c", pA.x + b/2 + 10, pA.y + a/2 - 10);
            
            // Right angle at B
            ctx.strokeRect(pB.x, pB.y - 15, 15, 15);
        }

        // T2
        if (this.geom.t2Opacity > 0) {
            const shiftX = this.geom.t2X;
            ctx.fillStyle = `rgba(0, 184, 148, ${this.geom.t2Opacity * 0.8})`;
            ctx.strokeStyle = `rgba(0, 184, 148, ${this.geom.t2Opacity})`;
            ctx.beginPath();
            // C(a+b, 0) -> D(a+b, b) -> E(b, 0)
            const pC = { x: startX + b + a + shiftX, y: startY };
            const pD = { x: startX + b + a + shiftX, y: startY - b };
            const pE2 = { x: startX + b + shiftX, y: startY };
            ctx.moveTo(pC.x, pC.y);
            ctx.lineTo(pD.x, pD.y);
            ctx.lineTo(pE2.x, pE2.y);
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.fillStyle = `rgba(45, 52, 54, ${this.geom.t2Opacity})`;
            ctx.fillText("b", pC.x + 15, pC.y - b/2);
            ctx.fillText("a", pE2.x + a/2, pC.y + 20);
            ctx.fillText("c", pE2.x + a/2 - 10, pD.y + b/2 - 10);
            
            // Right angle at C
            ctx.strokeRect(pC.x - 15, pC.y - 15, 15, 15);
        }

        // T3 (Line A to D)
        if (this.geom.t3LineProgress > 0) {
            const pD = { x: startX + a + b, y: startY - b };
            ctx.strokeStyle = '#fdcb6e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            
            const currX = pA.x + (pD.x - pA.x) * this.geom.t3LineProgress;
            const currY = pA.y + (pD.y - pA.y) * this.geom.t3LineProgress;
            ctx.lineTo(currX, currY);
            ctx.stroke();

            if (this.geom.t3LineProgress >= 1) {
                // Fill T3 area
                ctx.fillStyle = `rgba(253, 203, 110, 0.4)`;
                ctx.beginPath();
                ctx.moveTo(pA.x, pA.y);
                ctx.lineTo(pD.x, pD.y);
                ctx.lineTo(pE.x, pE.y);
                ctx.closePath();
                ctx.fill();

                // Right angle at E
                ctx.strokeStyle = '#fdcb6e';
                ctx.save();
                ctx.translate(pE.x, pE.y);
                const angleT1 = Math.atan2(a, -b); // angle of EA
                ctx.rotate(angleT1);
                ctx.strokeRect(0, 0, 15, 15);
                ctx.restore();
            }
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
