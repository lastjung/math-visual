const PerigalCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 120, b: 160,
    dissectionPieces: [],
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],

    steps: [
        {
            desc: "큰 정사각형(b²)을 빗변과 평행/수직인 선으로 4분할합니다.<br>여기에 작은 정사각형(a²)을 더해 총 5개의 조각을 준비합니다.",
            formula: "a² + b² 조각 준비"
        },
        {
            desc: "5개의 조각을 빗변의 정사각형(c²)으로 평행이동시켜 봅시다.<br>방향 변환 없이(회전 없이) 빈틈없이 c² 전체를 채우게 됩니다!",
            formula: "a² + b² → c²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 4: Perigal의 절단 (Dissection)';
        this.initDissectionPieces();
        this.resize();
        this.applyStep(0, false);
    },

    initDissectionPieces() {
        this.dissectionPieces = [];
        const a = this.a; const b = this.b;
        const c = Math.sqrt(a*a + b*b);
        const half_b = b / 2;
        
        // The cuts are parallel and perpendicular to the hypotenuse.
        // Hypotenuse goes from (b, 0) to (0, -a). vector: (-b, -a).
        const vx = -b; const vy = -a;
        const ux = vx / c; const uy = vy / c;
        const nx = -uy; const ny = ux;
        
        // Center of B^2
        const centerB = {x: half_b, y: half_b};
        
        // We find the intersections of these cuts with the edges of B^2.
        // The cut lines are:
        // L1: centerB + t * u
        // L2: centerB + s * n
        
        // Let's compute exact intersections for b=160, a=120. (Ratio a/b = 0.75)
        // From center (80,80), lines with slope vy/vx = -120/-160 = 0.75 and -1.333
        const off = half_b * (a / b);
        
        // Clockwise points starting from top edge
        const p1 = {x: b, y: half_b + off}; // Right edge
        const p2 = {x: half_b - off, y: b}; // Bottom edge
        const p3 = {x: 0, y: half_b - off}; // Left edge
        const p4 = {x: half_b + off, y: 0}; // Top edge
        
        const corners = [{x:0, y:0}, {x:b, y:0}, {x:b, y:b}, {x:0, y:b}];

        const pieceBConfigs = [
            [p4, corners[1], p1, centerB], // Top-Right piece
            [p1, corners[2], p2, centerB], // Bottom-Right piece
            [p2, corners[3], p3, centerB], // Bottom-Left piece
            [p3, corners[0], p4, centerB]  // Top-Left piece
        ];

        pieceBConfigs.forEach((pts, i) => {
            this.dissectionPieces.push({
                type: 'b',
                index: i,
                points: pts.map(p => ({x: p.x - half_b, y: p.y - half_b})), // center at 0,0 locally
                color: this.colors[(i + 1) % 4],
                x: 0, y: 0, rotate: 0
            });
        });

        // Piece A
        const half_a = a / 2;
        this.dissectionPieces.push({
            type: 'a',
            points: [
                {x: -half_a, y: -half_a}, {x: half_a, y: -half_a},
                {x: half_a, y: half_a}, {x: -half_a, y: half_a}
            ],
            color: this.colors[0],
            x: 0, y: 0, rotate: 0
        });
    },

    updateDissectionPositions() {
        const { a, b, dissectionPieces, canvas } = this;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const c = Math.sqrt(a*a + b*b);
        
        const totalW = b + a; const totalH = b + a;
        const startX = cx - totalW / 2 + a;
        const startY = cy + totalH / 2 - b;
        
        // Hypotenuse starts at p0
        const p0 = { x: startX + b, y: startY };
        const vx = -b; const vy = -a;
        const ux = vx / c; const uy = vy / c;
        const nx = -uy; const ny = ux;

        // C^2 center
        const cCenter = {
            x: p0.x + (c/2) * ux + (c/2) * nx,
            y: p0.y + (c/2) * uy + (c/2) * ny
        };

        dissectionPieces.forEach((piece) => {
            // Origin (Step 1)
            if (piece.type === 'a') {
                piece.originX = startX - a/2;
                piece.originY = startY - a/2;
            } else {
                piece.originX = startX + b/2;
                piece.originY = startY + b/2;
            }
            piece.originRotate = 0;

            // Target (Step 2) -> Pure translation
            if (piece.type === 'a') {
                piece.targetX = cCenter.x;
                piece.targetY = cCenter.y;
            } else {
                // To form the outer C^2 boundary, the center of B^2 splits into the corners of the A^2 hole.
                // Depending on the piece index, we shift it outward by a/2 along u and n.
                const shifts = [
                    {u: -a/2, n: -a/2}, 
                    {u: a/2, n: -a/2}, 
                    {u: a/2, n: a/2}, 
                    {u: -a/2, n: a/2}
                ];
                
                // Need to map the corners correctly. A simple trick since it's just visual translation:
                // We know C^2 corners. We know B^2 corners.
                // TopRight B^2 corner (piece 0) goes to C^2 corner...
                // Using the standard Perigal shift: the displacement is ±b/2 and ±a/2.
                // Let's use the exact known shift vectors for the 4 pieces:
                // We shift the local center outwards in the (u, n) basis.
                let su = 0, sn = 0;
                if (piece.index === 0) { su = -a/2; sn = -b/2; }
                if (piece.index === 1) { su = b/2; sn = -a/2; }
                if (piece.index === 2) { su = a/2; sn = b/2; }
                if (piece.index === 3) { su = -b/2; sn = a/2; }

                piece.targetX = cCenter.x + su * ux + sn * nx;
                piece.targetY = cCenter.y + su * uy + sn * ny;
            }
            piece.targetRotate = 0;
        });
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        this.updateDissectionPositions();
        
        this.dissectionPieces.forEach((piece) => {
            const tx = index === 0 ? piece.originX : piece.targetX;
            const ty = index === 0 ? piece.originY : piece.targetY;
            
            if (animate) {
                gsap.to(piece, {
                    x: tx, y: ty, rotate: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            } else {
                piece.x = tx; piece.y = ty; piece.rotate = 0;
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
                onChange: (val) => { this.a = val; this.initDissectionPieces(); this.applyStep(this.currentStep, false); }
            }
        ];
    },

    draw() {
        if (!this.canvas) return;
        const { ctx, canvas, dissectionPieces, a, b } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const c = Math.sqrt(a*a + b*b);
        const totalW = b + a;
        const totalH = b + a;
        const startX = cx - totalW / 2 + a;
        const startY = cy + totalH / 2 - b;

        ctx.strokeStyle = '#27455C';
        ctx.lineWidth = 1;

        // Base Triangle
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + b, startY);
        ctx.lineTo(startX, startY - a);
        ctx.closePath();
        ctx.stroke();

        // Outline of a^2 and b^2
        ctx.strokeRect(startX - a, startY - a, a, a);
        ctx.strokeRect(startX, startY, b, b);
        
        // Outline of c^2
        ctx.save();
        ctx.translate(startX + b, startY);
        const vx = -b; const vy = -a;
        const ux = vx / c; const uy = vy / c;
        const nx = -uy; const ny = ux;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(c*ux, c*uy);
        ctx.lineTo(c*ux + c*nx, c*uy + c*ny);
        ctx.lineTo(c*nx, c*ny);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Draw Pieces
        dissectionPieces.forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            
            ctx.fillStyle = p.color + 'EE';
            ctx.beginPath();
            p.points.forEach((pt, idx) => {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
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
    destroy() { this.stop(); gsap.killTweensOf(this.dissectionPieces); }
};
