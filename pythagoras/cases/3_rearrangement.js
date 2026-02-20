const RearrangementCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 120, b: 160,
    triangles: [],
    rearrangementShowC2Overlay: false,
    rearrangementOverlayCall: null,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',

    steps: [
        {
            desc: "똑같은 직각삼각형 4개를 준비합니다.<br>이들을 (a+b) 정사각형 안에 배치해 봅시다.",
            formula: "정사각형 면적 = (a+b)²"
        },
        {
            desc: "삼각형을 구석으로 몰면 두 개의 빈 공간이 생깁니다.<br><b>a²</b>과 <b>b²</b> 면적을 확인해 보세요.",
            formula: "빈 공간 = a² + b²"
        },
        {
            desc: "삼각형을 밀어내어 가운데 빈 공간을 만듭니다.<br>이때 생기는 빈 공간은 한 변이 c인 <b>c²</b>입니다.",
            formula: "빈 공간 = c²"
        },
        {
            desc: "결론: 빈 공간의 총합은 변하지 않습니다.<br>따라서 <b>a² + b² = c²</b>입니다.",
            formula: "a² + b² = c²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 3: 재배열 (Rearrangement)';
        
        this.triangles = [];
        for (let i = 0; i < 4; i++) {
            this.triangles.push({ x: 0, y: 0, rotate: 0, color: this.colors[i], opacity: 1 });
        }
        
        this.resize();
        this.applyStep(0, false);
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        const a = this.a; const b = this.b; const size = a + b;
        let positions = [];
        if (this.rearrangementOverlayCall) {
            this.rearrangementOverlayCall.kill();
            this.rearrangementOverlayCall = null;
        }

        if (index === 2 && animate) {
            this.rearrangementShowC2Overlay = false;
            this.rearrangementOverlayCall = gsap.delayedCall(0.95, () => {
                if (this.currentStep >= 2) {
                    this.rearrangementShowC2Overlay = true;
                }
            });
        } else {
            this.rearrangementShowC2Overlay = index >= 2;
        }

        if (index === 0) {
            positions = [
                { x: 0, y: 0, rotate: 0 },
                { x: a, y: b, rotate: 180 },
                { x: a, y: size, rotate: 270 },
                { x: size, y: b, rotate: 90 }
            ];
        } else if (index === 1) {
            positions = [
                { x: 0, y: 0, rotate: 0 },
                { x: a, y: b, rotate: 180 },
                { x: a, y: size, rotate: 270 },
                { x: size, y: b, rotate: 90 }
            ];
        } else {
            positions = [
                { x: 0, y: 0, rotate: 0 },
                { x: size, y: 0, rotate: 90 },
                { x: size, y: size, rotate: 180 },
                { x: 0, y: size, rotate: 270 }
            ];
        }

        const centroidLocalX = a / 3;
        const centroidLocalY = b / 3;
        positions.forEach((pos, i) => {
            const rad = (pos.rotate * Math.PI) / 180;
            const cx = pos.x + centroidLocalX * Math.cos(rad) - centroidLocalY * Math.sin(rad);
            const cy = pos.y + centroidLocalX * Math.sin(rad) + centroidLocalY * Math.cos(rad);
            if (animate) {
                gsap.killTweensOf(this.triangles[i]);
                gsap.to(this.triangles[i], { x: cx, y: cy, rotate: pos.rotate, duration: 1, ease: "power2.inOut" });
            } else {
                this.triangles[i].x = cx;
                this.triangles[i].y = cy;
                this.triangles[i].rotate = pos.rotate;
            }
        });
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
        const { ctx, canvas, a, b, triangles, currentStep } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const size = a + b;
        const startX = cx - size/2, startY = cy - size/2;
        
        ctx.fillStyle = '#fff'; ctx.fillRect(startX, startY, size, size);
        ctx.strokeStyle = '#27455C';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, size, size);
        
        if (currentStep === 1) {
            ctx.fillStyle = 'rgba(255, 107, 107, 0.3)';
            ctx.fillRect(startX, startY + b, a, a);
            ctx.strokeStyle = '#FF6B6B';
            ctx.strokeRect(startX, startY + b, a, a);

            ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
            ctx.fillRect(startX + a, startY, b, b);
            ctx.strokeStyle = '#4ECDC4';
            ctx.strokeRect(startX + a, startY, b, b);

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 28px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('a²', startX + a / 2, startY + b + a / 2 + 10);
            ctx.fillText('b²', startX + a + b / 2, startY + b / 2 + 10);
        } else if (currentStep >= 2 && this.rearrangementShowC2Overlay) {
            ctx.fillStyle = 'rgba(69, 183, 209, 0.3)';
            ctx.beginPath();
            ctx.moveTo(startX + a, startY);
            ctx.lineTo(startX + size, startY + a);
            ctx.lineTo(startX + b, startY + size);
            ctx.lineTo(startX, startY + b);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#45B7D1';
            ctx.stroke();

            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 30px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('c²', startX + size / 2, startY + size / 2 + 10);
        }
        
        triangles.forEach(tri => {
            ctx.save(); 
            ctx.translate(startX + tri.x, startY + tri.y); 
            ctx.rotate((tri.rotate * Math.PI) / 180);
            ctx.fillStyle = tri.color;
            ctx.beginPath();
            ctx.moveTo(-a / 3, -b / 3);
            ctx.lineTo((2 * a) / 3, -b / 3);
            ctx.lineTo(-a / 3, (2 * b) / 3);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        });
        
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center';
        ctx.fillText(this.steps[currentStep].formula, canvas.width / 2, canvas.height - 40);
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
    destroy() { this.stop(); gsap.killTweensOf(this.triangles); }
};
