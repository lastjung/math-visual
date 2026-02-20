const BhaskaraCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 120, b: 160,
    triangles: [],
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',
    colors: ['#0984e3', '#00b894', '#fdcb6e', '#e17055'],

    steps: [
        {
            desc: "바스카라의 \"보라! (Behold!)\"<br>4개의 직각삼각형으로 큰 정사각형(c²)을 만듭니다.",
            formula: "c²"
        },
        {
            desc: "직각삼각형들을 재배열하면, 자연스럽게 a²과 b² 크기의 정사각형 직사각형 두 개가 나타납니다.",
            formula: "a² + b²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 5: 바스카라의 증명';
        
        // Ensure index.html tab state matches
        const tab = document.querySelector('.tab[data-case="bhaskara"]');
        if (tab) tab.innerText = '5. 바스카라 증명';

        this.initTriangles();
        this.resize();
        this.applyStep(0, false);
    },

    initTriangles() {
        const { a, b } = this;
        // In Bhaskara's C^2 formation:
        // C^2 is formed by 4 triangles wrapping around a center hole of (b-a)^2.
        // We will define the 4 triangles relative to their right-angle corners.
        // Triangles are identical: sides a, b. Right angle at origin.
        this.triangles = [
            // Triangle definitions (x, y are right-angle corner, rotate is orientation)
            { id: 1, w: b, h: a, rot: 0, color: this.colors[0], x:0, y:0, rotate:0 },
            { id: 2, w: b, h: a, rot: 90, color: this.colors[1], x:0, y:0, rotate:0 },
            { id: 3, w: b, h: a, rot: 180, color: this.colors[2], x:0, y:0, rotate:0 },
            { id: 4, w: b, h: a, rot: 270, color: this.colors[3], x:0, y:0, rotate:0 }
        ];
    },

    updatePositions() {
        const { a, b, triangles, canvas } = this;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        // 1. Calculate C^2 formation (Step 0)
        // Center the C^2 square. 
        // Origins of standard unit pinwheel:
        // T0: (0, a)
        // T1: (b-a, a)
        // T2: (b-a, b)
        // T3: (0, b)
        // Center of this formation is at (b-a)/2, (a+b)/2
        const offsetX = cx - (b-a)/2;
        const offsetY = cy - (a+b)/2;

        triangles[0].originX = offsetX;
        triangles[0].originY = offsetY + a;
        triangles[0].originRot = 0;

        triangles[1].originX = offsetX + b - a;
        triangles[1].originY = offsetY + a;
        triangles[1].originRot = 90;

        triangles[2].originX = offsetX + b - a;
        triangles[2].originY = offsetY + b;
        triangles[2].originRot = 180;

        triangles[3].originX = offsetX;
        triangles[3].originY = offsetY + b;
        triangles[3].originRot = 270;

        // 2. Calculate Rearranged formation (Step 1)
        // Rect1 (Width b, Height a): [offsetX, offsetX+b] x [offsetY, offsetY+a]
        // Rect2 (Width a, Height b): [offsetX+b-a, offsetX+b] x [offsetY+a, offsetY+a+b]
        // T0 stays at (offsetX, offsetY+a), rot 0.
        triangles[0].targetX = offsetX;
        triangles[0].targetY = offsetY + a;
        triangles[0].targetRot = 0;

        // T1 with T0 forms Rect1. Right angle at opposite corner (offsetX+b, offsetY)
        triangles[1].targetX = offsetX + b;
        triangles[1].targetY = offsetY;
        triangles[1].targetRot = 180;

        // T2 rot 90 at (offsetX+b-a, offsetY+a)
        triangles[2].targetX = offsetX + b - a;
        triangles[2].targetY = offsetY + a;
        triangles[2].targetRot = 90;

        // T3 rot 270 at (offsetX+b, offsetY+a+b). With T2 forms Rect2.
        triangles[3].targetX = offsetX + b;
        triangles[3].targetY = offsetY + a + b;
        triangles[3].targetRot = 270;
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        this.updatePositions();
        
        this.triangles.forEach((tri) => {
            const tx = index === 0 ? tri.originX : tri.targetX;
            const ty = index === 0 ? tri.originY : tri.targetY;
            const tr = index === 0 ? tri.originRot : tri.targetRot;
            
            if (animate) {
                gsap.to(tri, {
                    x: tx, y: ty, rotate: tr,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            } else {
                tri.x = tx; tri.y = ty; tri.rotate = tr;
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
        const { ctx, canvas, triangles, a, b, currentStep } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Hole Outline if Step 0
        if (currentStep === 0) {
            const offsetX = canvas.width / 2 - (b-a)/2;
            const offsetY = canvas.height / 2 - (a+b)/2;

            const diff = Math.abs(b - a);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(offsetX, offsetY + a, diff, diff);
            ctx.setLineDash([]);
        }

        triangles.forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotate * Math.PI / 180);
            
            ctx.fillStyle = p.color + 'EE';
            ctx.beginPath();
            ctx.moveTo(0, 0);       // Right angle corner
            ctx.lineTo(b, 0);       // side b
            ctx.lineTo(0, -a);      // side a
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#27455C';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        });
        
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
    destroy() { this.stop(); gsap.killTweensOf(this.triangles); }
};
