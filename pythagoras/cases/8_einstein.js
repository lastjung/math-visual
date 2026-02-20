const EinsteinCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 150, b: 200, c: 250,
    // Triangle parameters: ta = a^2/c, tb = b^2/c, h = ab/c
    ta: 90, tb: 160, h: 120,
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',
    colors: ['#0984e3', '#00b894', '#fdcb6e'],

    steps: [
        {
            desc: "아인슈타인이 어린 시절 고안한 '닮음(Similarity)' 증명입니다.<br>직각인 꼭짓점에서 빗변으로 수선을 내립니다.",
            formula: "수선 분할 (Altitude to Hypotenuse)"
        },
        {
            desc: "수선에 의해 나누어진 두 개의 작은 직각삼각형을 양옆으로 분리해봅시다.",
            formula: "세 개의 직각삼각형"
        },
        {
            desc: "이 세 삼각형은 모두 세 각이 같은 '닮음(Similar)' 도형입니다.<br>회전시켜 보면 완전히 같은 모양임을 알 수 있습니다.",
            formula: "전체 ∽ 왼쪽 ∽ 오른쪽"
        },
        {
            desc: "닮은 도형의 넓이는 빗변 길이의 제곱에 비례합니다.<br>Area = k * (빗변)² 이므로, k·c² = k·a² + k·b² 즉 a² + b² = c² 입니다.",
            formula: "Area_Big = Area_L + Area_R"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 8: 아인슈타인의 닮음 증명';
        const tab = document.querySelector('.tab[data-case="einstein"]');
        if (tab) tab.innerText = '8. 아인슈타인 증명';

        this.initGeometry();
        this.resize();
        this.applyStep(0, false);
    },

    initGeometry() {
        // T1 (Left, hypotenuse a=150)
        // A(-90, 0), D(0, 0), C(0, -120)
        this.t1 = {
            pts: [-90, 0, 0, 0, 0, -120],
            color: '#0984e3' // Blue
        };
        
        // T2 (Right, hypotenuse b=200)
        // D(0, 0), B(160, 0), C(0, -120)
        this.t2 = {
            pts: [0, 0, 160, 0, 0, -120],
            color: '#00b894' // Green
        };
        
        // Target Rotated Points for T1 (hypotenuse horizontal, length 150)
        // ta1 = a^2 / a? No, the new c is 150.
        // new_a = 150 * (150/250) = 90
        // new_b = 200 * (150/250) = 120
        // new_ta = 90^2 / 150 = 54
        // new_tb = 120^2 / 150 = 96
        // new_h = 90 * 120 / 150 = 72
        // T1 rotated points relative to its origin: Left(-54, 0), Right(96, 0), Top(0, -72)
        // But we want to place it smoothly.
        // Let's just calculate the similarity transform matrix to rotate/scale into place.
        
        this.altitudeLineOp = 0;
        this.showFullArea = 0;
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        let t1_target = [-90, 0, 0, 0, 0, -120];
        let t2_target = [0, 0, 160, 0, 0, -120];
        let altOp = 0;
        let showArea = 0;

        if (index === 0) {
            altOp = 1;
            showArea = 0;
        } else if (index === 1) {
            // Separation
            t1_target = [-90 - 50, 0, 0 - 50, 0, 0 - 50, -120];
            t2_target = [0 + 50, 0, 160 + 50, 0, 0 + 50, -120];
            altOp = 1;
            showArea = 0;
        } else if (index === 2) {
            // Rotate to horizontal similar stance
            // T_big is shifted up so it doesn't overlap?
            // T1 standard: A(-54, 0), B(96, 0), C(0, -72). Shift by (-150, 50)
            t1_target = [-54 - 150, 50, 96 - 150, 50, 0 - 150, -72 + 50];
            
            // T2 standard: A(-96, 0), B(153.6, 0) -- wait.
            // new_a = 150 * (200/250) = 120
            // new_b = 200 * (200/250) = 160
            // new_ta = 120^2 / 200 = 72
            // new_tb = 160^2 / 200 = 128
            // new_h = 120 * 160 / 200 = 96
            // T2 standard: A(-72, 0), B(128, 0), C(0, -96). Shift by (150, 50)
            t2_target = [-72 + 200, 50, 128 + 200, 50, 0 + 200, -96 + 50];
            altOp = 1;
            showArea = 0;
        } else if (index === 3) {
            t1_target = [-54 - 150, 50, 96 - 150, 50, 0 - 150, -72 + 50];
            t2_target = [-72 + 200, 50, 128 + 200, 50, 0 + 200, -96 + 50];
            altOp = 1;
            showArea = 1; // Show formulas inside
        }

        if (animate) {
            gsap.to(this.t1.pts, {
                0: t1_target[0], 1: t1_target[1], 2: t1_target[2],
                3: t1_target[3], 4: t1_target[4], 5: t1_target[5],
                duration: 1.5, ease: "power2.inOut"
            });
            gsap.to(this.t2.pts, {
                0: t2_target[0], 1: t2_target[1], 2: t2_target[2],
                3: t2_target[3], 4: t2_target[4], 5: t2_target[5],
                duration: 1.5, ease: "power2.inOut"
            });
            gsap.to(this, {
                altitudeLineOp: altOp,
                showFullArea: showArea,
                duration: 1.0
            });
        } else {
            this.t1.pts = [...t1_target];
            this.t2.pts = [...t2_target];
            this.altitudeLineOp = altOp;
            this.showFullArea = showArea;
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

        // Draw Big Triangle reference
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Big triangle: A(-90, 0), B(160, 0), C(0, -120)
        let bigY = 0;
        if (this.currentStep >= 2) bigY = -150; // Shift big triangle up in later steps
        ctx.moveTo(-90, bigY);
        ctx.lineTo(160, bigY);
        ctx.lineTo(0, -120 + bigY);
        ctx.closePath();
        ctx.stroke();

        if (this.showFullArea > 0) {
            ctx.fillStyle = `rgba(0,0,0,${this.showFullArea})`;
            ctx.font = 'bold 20px Inter'; ctx.textAlign = 'center';
            ctx.fillText("Area = k • c²", 35, -40 + bigY);
            
            ctx.fillStyle = `rgba(9, 132, 227, ${this.showFullArea})`;
            ctx.fillText("k • a²", -150 + 20, 50 - 20);
            
            ctx.fillStyle = `rgba(0, 184, 148, ${this.showFullArea})`;
            ctx.fillText("k • b²", 200 + 28, 50 - 30);
        }

        if (this.altitudeLineOp > 0) {
            ctx.strokeStyle = `rgba(255, 107, 107, ${this.altitudeLineOp})`;
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, bigY);
            ctx.lineTo(0, -120 + bigY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // T1
        ctx.fillStyle = `${this.t1.color}99`;
        ctx.strokeStyle = this.t1.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.t1.pts[0], this.t1.pts[1]);
        ctx.lineTo(this.t1.pts[2], this.t1.pts[3]);
        ctx.lineTo(this.t1.pts[4], this.t1.pts[5]);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // T2
        ctx.fillStyle = `${this.t2.color}99`;
        ctx.strokeStyle = this.t2.color;
        ctx.beginPath();
        ctx.moveTo(this.t2.pts[0], this.t2.pts[1]);
        ctx.lineTo(this.t2.pts[2], this.t2.pts[3]);
        ctx.lineTo(this.t2.pts[4], this.t2.pts[5]);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

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
    destroy() { this.stop(); gsap.killTweensOf(this.t1.pts); gsap.killTweensOf(this.t2.pts); gsap.killTweensOf(this); }
};
