const EuclidCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    offsetX: 0,
    offsetY: 0,
    
    // Animation states
    movingTri: [120, 180, 200, 180, 120, 100],
    sqAOpacity: 0,
    sqBOpacity: 0,
    sqCColor: "#ddd",
    altitudeOpacity: 0,
    triOpacity: 0.5,
    triColor: "#ff7675", // var(--square-a)
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',

    steps: [
        {
            desc: "직각삼각형 ABC가 있습니다. 각 변을 한 변으로 하는 <span style='color:#ff7675'>정사각형</span>들을 그립니다.",
            formula: "유클리드 증명 준비"
        },
        {
            desc: "꼭짓점 A에서 빗변에 수선을 내립니다. 이 선은 큰 사각형을 두 개의 직사각형으로 나눕니다.",
            formula: "수선 긋기"
        },
        {
            desc: "이제 <b>등적변형</b>을 시작합니다. 밑변(AC)과 높이가 같으므로 왼쪽 사각형 절반의 넓이는 이 삼각형과 같습니다.",
            formula: "도형의 밀기 (Area = Area)"
        },
        {
            desc: "이 삼각형을 꼭짓점 C를 중심으로 90도 회전시킵니다. 그러면 <b style='color:#ff7675'>합동</b>인 삼각형이 됩니다.",
            formula: "도형의 회전 (Congruence)"
        },
        {
            desc: "다시 등적변형을 하면, 이 넓이는 아래쪽 직사각형 넓이의 절반과 같음을 알 수 있습니다.",
            formula: "도형의 밀기 (Area = Area)"
        },
        {
            desc: "결국 왼쪽 정사각형의 넓이는 아래쪽 왼쪽 직사각형의 넓이와 같습니다. 오른쪽도 마찬가지입니다!",
            formula: "a² + b² = c²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 6: 유클리드의 증명';
        const tab = document.querySelector('.tab[data-case="euclid"]');
        if (tab) tab.innerText = '6. 유클리드 증명';

        this.resize();
        this.applyStep(0, false);
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        let targetPoints = [];
        let t_sqAOp = 1, t_sqBOp = 1, t_sqCCol = "#333", t_altOp = 0, t_triOp = 0.5, t_triCol = "#ff7675";

        if (index === 0) {
            targetPoints = [120, 180, 200, 180, 120, 100];
            t_sqAOp = 1; t_sqBOp = 1; t_sqCCol = "#333";
            t_triOp = 0; t_altOp = 0;
        } else if (index === 1) {
            targetPoints = [120, 180, 200, 180, 120, 100];
            t_altOp = 1; t_triOp = 0.6;
        } else if (index === 2) {
            targetPoints = [120, 180, 200, 180, 40, 340];
            t_altOp = 1; t_triOp = 0.6;
        } else if (index === 3) {
            targetPoints = [120, 180, 40, 340, 200, 500];
            t_altOp = 1; t_triOp = 0.6;
        } else if (index === 4) {
            targetPoints = [120, 180, 200, 500, 200, 180];
            t_altOp = 1; t_triOp = 0.6;
        } else if (index === 5) {
            targetPoints = [120, 180, 40, 340, 200, 500, 200, 180]; // Extended poly logic not strictly needed if we just show rectangle
            // Actually, keep it simple as a triangle for step 5, just matching the rect half
            targetPoints = [120, 180, 200, 500, 200, 180];
            t_altOp = 1; t_triOp = 0.8; t_sqAOp = 0.3; // Dim sqA
        }

        if (animate) {
            // Morph triangle points
            const obj = { ...this.movingTri }; // copy current points
            
            // If target has fewer points, standard tween. If not, whatever.
            gsap.to(obj, {
                0: targetPoints[0], 1: targetPoints[1], 2: targetPoints[2],
                3: targetPoints[3], 4: targetPoints[4], 5: targetPoints[5],
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => {
                    this.movingTri[0] = obj[0]; this.movingTri[1] = obj[1];
                    this.movingTri[2] = obj[2]; this.movingTri[3] = obj[3];
                    this.movingTri[4] = obj[4]; this.movingTri[5] = obj[5];
                }
            });

            gsap.to(this, {
                sqAOpacity: t_sqAOp, sqBOpacity: t_sqBOp,
                altitudeOpacity: t_altOp, triOpacity: t_triOp,
                duration: 1.0
            });
            this.sqCColor = t_sqCCol;
            this.triColor = t_triCol;
        } else {
            this.movingTri = [...targetPoints];
            this.sqAOpacity = t_sqAOp;
            this.sqBOpacity = t_sqBOp;
            this.sqCColor = t_sqCCol;
            this.altitudeOpacity = t_altOp;
            this.triOpacity = t_triOp;
            this.triColor = t_triCol;
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

        // Center the 500x600 SVG coordinate system onto the canvas
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const ox = cx - 250;
        const oy = cy - 250; // shift up slightly

        ctx.save();
        ctx.translate(ox, oy);

        // sqC
        ctx.strokeStyle = this.sqCColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 180); ctx.lineTo(360, 340);
        ctx.lineTo(200, 500); ctx.lineTo(40, 340);
        ctx.closePath();
        ctx.stroke();

        // sqB
        ctx.strokeStyle = `rgba(116, 185, 255, ${this.sqBOpacity})`; // #74b9ff
        ctx.strokeRect(200, 20, 160, 160);

        // sqA
        if (this.currentStep === 5) {
            ctx.fillStyle = `rgba(255, 118, 117, ${this.sqAOpacity})`;
            ctx.fillRect(120, 100, 80, 80);
        }
        ctx.strokeStyle = `rgba(255, 118, 117, ${this.sqAOpacity})`; // #ff7675
        ctx.strokeRect(120, 100, 80, 80);

        // altitude
        if (this.altitudeOpacity > 0) {
            ctx.strokeStyle = `rgba(204, 204, 204, ${this.altitudeOpacity})`;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(200, 180);
            ctx.lineTo(200, 500);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // mainTri (fixed static black tri)
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(120, 180);
        ctx.lineTo(200, 180);
        ctx.lineTo(200, 20);
        ctx.closePath();
        ctx.fill();

        // movingTri
        if (this.triOpacity > 0) {
            ctx.fillStyle = 'rgba(255, 118, 117, ' + this.triOpacity + ')';
            ctx.beginPath();
            ctx.moveTo(this.movingTri[0], this.movingTri[1]);
            ctx.lineTo(this.movingTri[2], this.movingTri[3]);
            ctx.lineTo(this.movingTri[4], this.movingTri[5]);
            ctx.closePath();
            ctx.fill();
        }

        // Labels
        ctx.fillStyle = "#2c3e50";
        ctx.font = "16px Inter";
        ctx.fillText("C", 105, 195);
        ctx.fillText("A", 210, 195);
        ctx.fillText("B", 210, 15);

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
    destroy() { this.stop(); gsap.killTweensOf(this); gsap.killTweensOf(this.movingTri); }
};
