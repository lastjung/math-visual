/**
 * Pythagorean Theorem - Unified Methodology Group
 * Includes: Grid (3-4-5), Rearrangement, and Perigal's Dissection
 */

const PythagoreanTheoremCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    // Global State
    methodology: 'grid', // 'grid', 'rearrangement', 'dissection'
    currentStep: 0,
    a: 120,
    b: 160,
    
    // Animation States
    triangles: [], // Used in multiple modes
    dissectionPieces: [], // Used in Perigal's Dissection
    gridCells: [], // Used in Grid Migration animation
    rearrangementShowC2Overlay: false,
    rearrangementOverlayCall: null,
    
    // Shared Colors
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    
    // Music Track
    musicTrack: 'assets/music/bgm/Math_03_Harmonic_Balance.mp3',

    methods: {
        grid: {
            title: "방법론 1: 3-4-5 격자 (Grid Migration)",
            aUnits: 3, bUnits: 4, cUnits: 5,
            steps: [
                {
                    desc: "가장 직관적인 3-4-5 삼각형입니다.<br>각 변의 길이를 제곱한 만큼 정사각형 격자를 그려봅니다.",
                    formula: "3² + 4² = 5² ?"
                },
                {
                    desc: "9개($a^2$)와 16개($b^2$)의 격자들이 이동하는 것을 보세요.<br>빗변의 큰 정사각형($c^2$)을 완벽하게 채웁니다!",
                    formula: "9 + 16 = 25"
                }
            ]
        },
        grid_5_12_13: {
            title: "방법론 1-2: 5-12-13 격자 (Grid Migration)",
            aUnits: 5, bUnits: 12, cUnits: 13,
            steps: [
                {
                    desc: "조금 더 큰 5-12-13 피타고라스 삼조입니다.<br>총 25($a^2$) + 144($b^2$) = 169($c^2$) 개의 격자가 필요합니다.",
                    formula: "5² + 12² = 13² ?"
                },
                {
                    desc: "169개의 격자들이 빗변으로 모여드는 장관을 확인하세요!<br>더 큰 수치에서도 수식은 항상 성립합니다.",
                    formula: "25 + 144 = 169"
                }
            ]
        },
        rearrangement: {
            title: "방법론 2: 재배열 (Rearrangement)",
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
            ]
        },
        dissection: {
            title: "방법론 3: Perigal의 절단 (Dissection)",
            steps: [
                {
                    desc: "큰 정사각형(b²)을 빗변과 평행/수직인 선으로 4분할합니다.<br>여기에 작은 정사각형(a²)을 더해 총 5개의 조각을 준비합니다.",
                    formula: "a² + b² 조각 준비"
                },
                {
                    desc: "5개의 조각을 빗변의 정사각형(c²)으로 이동시켜 봅시다.<br>놀랍게도 빈틈없이 c² 전체를 채우게 됩니다!",
                    formula: "a² + b² → c²"
                }
            ]
        }
    },

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Reset states
        this.triangles = [];
        for (let i = 0; i < 4; i++) {
            this.triangles.push({ x: 0, y: 0, rotate: 0, color: this.colors[i], opacity: 1 });
        }
        
        this.dissectionPieces = []; 
        this.gridCells = [];
        
        this.resize();
        this.setMethodology(this.methodology);
    },

    initDissectionPieces() {
        this.dissectionPieces = [];
        const a = this.a; const b = this.b;
        const half_b = b / 2;
        
        // Exact Perigal Intersections for b=160, a=120 (ratio 0.75)
        // offset = half_b * (a/b) = 80 * 0.75 = 60
        const off = half_b * (a / b);
        const center = {x: half_b, y: half_b};
        
        // Points on b^2 edges
        const p1 = {x: b, y: half_b + off}; // (160, 140)
        const p2 = {x: half_b - off, y: b}; // (20, 160)
        const p3 = {x: 0, y: half_b - off}; // (0, 20)
        const p4 = {x: half_b + off, y: 0}; // (140, 0)
        
        const corners = [{x:0, y:0}, {x:b, y:0}, {x:b, y:b}, {x:0, y:b}];

        // Define 4 Pieces of B
        const pieceBConfigs = [
            [p4, corners[1], p1, center], // Top-Right
            [p1, corners[2], p2, center], // Bottom-Right
            [p2, corners[3], p3, center], // Bottom-Left
            [p3, corners[0], p4, center]  // Top-Left
        ];

        pieceBConfigs.forEach((pts, i) => {
            // Shift points to be relative to piece center for better rotation
            this.dissectionPieces.push({
                type: 'b',
                points: pts.map(p => ({x: p.x - half_b, y: p.y - half_b})),
                color: this.colors[(i + 1) % 4],
                x: 0, y: 0, rotate: 0
            });
        });

        // Piece A (Centered)
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

    setMethodology(method) {
        this.methodology = method;
        this.currentStep = 0;
        
        if (method.startsWith('grid')) {
            const m = this.methods[method];
            this.aUnits = m.aUnits;
            this.bUnits = m.bUnits;
            this.cUnits = m.cUnits;
            this.initGridCells();
        } else if (method === 'dissection') {
            // Set fixed pixel sizes for non-grid interactive modes
            this.a = 120;
            this.b = 160;
            this.initDissectionPieces();
        }
        
        this.applyStep(0, false);
        Core.updateControls();
    },

    initGridCells() {
        const { aUnits, bUnits } = this;
        this.gridCells = [];
        
        // b² cells (reds)
        for(let r=0; r<bUnits; r++) {
            for(let c=0; c<bUnits; c++) {
                this.gridCells.push({
                    type: 'b', r, c, x: 0, y: 0, rotate: 0, color: '#FF6B6B'
                });
            }
        }
        // a² cells (teals)
        for(let r=0; r<aUnits; r++) {
            for(let c=0; c<aUnits; c++) {
                this.gridCells.push({
                    type: 'a', r, c, x: 0, y: 0, rotate: 0, color: '#4ECDC4'
                });
            }
        }
    },

    updateGridCellPositions() {
        if (!this.methodology.startsWith('grid') || !this.canvas) return;
        
        const { aUnits, bUnits, cUnits } = this;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        // Use a robust bounding-box centering system to prevent all overlaps
        // Relative coords with Right-Angle Corner as (0,0) in grid units:
        // x points: -aU (left sq), 0 (corner), bU (base end), bU+aU (hyp. top is offset by aU horizontally)
        // y points: 0 (corner), -aU (top leg), bU (bottom sq), -aU-bU (hyp. square top)
        const relMinX = -aUnits;
        const relMaxX = bUnits + aUnits;
        const relMinY = -(aUnits + bUnits);
        const relMaxY = bUnits;
        
        const padding = this.methodology === 'grid' ? 100 : 60; // Less padding for larger triple
        const titleArea = 120; // Reserved space for top title/subtitle
        const formulaArea = 80; // Reserved space for bottom formula
        
        const availableWidth = this.canvas.width - padding;
        const availableHeight = this.canvas.height - titleArea - formulaArea;

        // Increase base scale cap from 40 to 44 (10% up) for the larger 5-12-13 triple
        const maxUnit = this.methodology === 'grid' ? 40 : 44;
        const unit = Math.min(maxUnit, availableWidth / (relMaxX - relMinX), availableHeight / (relMaxY - relMinY));
        this.unit = unit;

        const structCenterX = (relMinX + relMaxX) / 2 * unit;
        const structCenterY = (relMinY + relMaxY) / 2 * unit;
        
        const viewCenterY = titleArea + availableHeight / 2;
        
        this.startX = cx - structCenterX;
        this.startY = viewCenterY - structCenterY;

        this.gridCells.forEach((cell, i) => {
            const startX = this.startX;
            const startY = this.startY;
            if (cell.type === 'b') {
                cell.originX = startX + (cell.c + 0.5) * unit;
                cell.originY = startY + (cell.r + 0.5) * unit;
            } else {
                cell.originX = startX - (aUnits - cell.c - 0.5) * unit;
                cell.originY = startY - (aUnits - cell.r - 0.5) * unit;
            }

            const targetCol = i % cUnits;
            const targetRow = Math.floor(i / cUnits);
            const pBaseEnd = { x: startX + bUnits * unit, y: startY };
            const vx = -bUnits * unit;
            const vy = -aUnits * unit;
            const hypLen = Math.sqrt(vx*vx + vy*vy);
            const ux = vx / hypLen;
            const uy = vy / hypLen;
            const nx = -uy;
            const ny = ux;

            cell.targetX = pBaseEnd.x + (targetCol + 0.5) * unit * ux + (targetRow + 0.5) * unit * nx;
            cell.targetY = pBaseEnd.y + (targetCol + 0.5) * unit * uy + (targetRow + 0.5) * unit * ny;
            cell.targetRotate = Math.atan2(vy, vx) * 180 / Math.PI;
        });
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const method = this.methods[this.methodology];
        const stepInfo = method.steps[index];
        
        const titleEl = document.getElementById('main-title');
        const descEl = document.getElementById('main-subtitle');
        if (titleEl) titleEl.innerText = method.title;
        if (descEl) descEl.innerHTML = stepInfo.desc;

        if (this.methodology.startsWith('grid')) {
            this.applyGridStep(index, animate);
        } else if (this.methodology === 'rearrangement') {
            this.applyRearrangementStep(index, animate);
        } else if (this.methodology === 'dissection') {
            this.applyDissectionStep(index, animate);
        }
    },

    applyGridStep(index, animate) {
        this.updateGridCellPositions();
        
        this.gridCells.forEach((cell, i) => {
            const tx = index === 0 ? cell.originX : cell.targetX;
            const ty = index === 0 ? cell.originY : cell.targetY;
            const tr = index === 0 ? cell.originRotate : cell.targetRotate;
            
            if (animate) {
                gsap.to(cell, {
                    x: tx, y: ty, rotate: tr,
                    duration: 1.2,
                    delay: index === 1 ? i * 0.05 : 0, // Stagger migration
                    ease: "power2.inOut"
                });
            } else {
                cell.x = tx; cell.y = ty; cell.rotate = tr;
            }
        });
    },

    updateDissectionPositions() {
        const { a, b, dissectionPieces, canvas } = this;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const c = Math.sqrt(a*a + b*b);
        const half_a = a / 2;
        
        const totalW = b + a; const totalH = b + a;
        const startX = cx - totalW / 2 + a;
        const startY = cy + totalH / 2 - b;
        
        const p0 = { x: startX + b, y: startY };
        const vx = -b; const vy = -a;
        const ux = vx / c; const uy = vy / c;
        const nx = -uy; const ny = ux;

        const baseAngle = Math.atan2(vy, vx);
        const targetRotate = baseAngle * 180 / Math.PI;

        dissectionPieces.forEach((piece, i) => {
            // STEP 1: Original positions
            if (piece.type === 'a') {
                piece.originX = startX - a/2;
                piece.originY = startY - a/2;
            } else {
                piece.originX = startX + b/2;
                piece.originY = startY + b/2;
            }
            piece.originRotate = 0;

            // STEP 2: Target positions (Translation-only Perigal)
            // Center of the tilted C² square
            const cCenter = {
                x: p0.x + (c/2) * ux + (c/2) * nx,
                y: p0.y + (c/2) * uy + (c/2) * ny
            };

            // In translation-only Perigal, pieces don't rotate. 
            // Their tilted cut lines become the outer boundary of C².
            // We shift them so their original center (0,0) ends up at:
            if (piece.type === 'a') {
                piece.targetX = cCenter.x;
                piece.targetY = cCenter.y;
            } else {
                const qIdx = i; // 0:TR, 1:BR, 2:BL, 3:TL relative to B²
                // We shift each piece such that they surround the center.
                // The shift vector in the TILTED basis (u,n) aligns them to C²
                const shifts = [
                    {u: -b/2, n: -a/2}, {u: a/2, n: -b/2}, {u: b/2, n: a/2}, {u: -a/2, n: b/2}
                ];
                const s = shifts[qIdx];
                piece.targetX = cCenter.x + s.u * ux + s.n * nx;
                piece.targetY = cCenter.y + s.u * uy + s.n * ny;
            }
            piece.targetRotate = 0;
        });
    },

    applyDissectionStep(index, animate) {
        this.updateDissectionPositions();
        this.dissectionPieces.forEach((piece) => {
            const tx = index === 0 ? piece.originX : piece.targetX;
            const ty = index === 0 ? piece.originY : piece.targetY;
            const tr = index === 0 ? piece.originRotate : piece.targetRotate;

            if (animate) {
                gsap.to(piece, {
                    x: tx, y: ty, rotate: tr,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            } else {
                piece.x = tx; piece.y = ty; piece.rotate = tr;
            }
        });
    },

    applyRearrangementStep(index, animate) {
        const a = this.a; const b = this.b; const size = a + b;
        let positions = [];
        if (this.rearrangementOverlayCall) {
            this.rearrangementOverlayCall.kill();
            this.rearrangementOverlayCall = null;
        }

        // Step 3(index 2): show c^2 region after triangles finish moving.
        if (index === 2 && animate) {
            this.rearrangementShowC2Overlay = false;
            this.rearrangementOverlayCall = gsap.delayedCall(0.95, () => {
                if (this.methodology === 'rearrangement' && this.currentStep >= 2) {
                    this.rearrangementShowC2Overlay = true;
                }
            });
        } else {
            this.rearrangementShowC2Overlay = index >= 2;
        }

        if (index === 0) {
            positions = [
                // Intro layout inside the same (a+b)^2 frame (no scale/inset change).
                { x: 0, y: 0, rotate: 0 },
                { x: a, y: b, rotate: 180 },
                { x: a, y: size, rotate: 270 },
                { x: size, y: b, rotate: 90 }
            ];
        } else if (index === 1) {
            // Pack triangles into opposite corners to expose a^2 (bottom-left) and b^2 (top-right)
            positions = [
                { x: 0, y: 0, rotate: 0 },
                { x: a, y: b, rotate: 180 },
                { x: a, y: size, rotate: 270 },
                { x: size, y: b, rotate: 90 }
            ];
        } else {
            positions = [
                // Classical corner placement creates the central c^2 gap
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
        const method = this.methods[this.methodology];
        let next = this.currentStep + dir;
        if (next >= method.steps.length) next = 0;
        if (next < 0) next = 0;
        this.applyStep(next, true);
        Core.updateControls();
    },

    get uiConfig() {
        const method = this.methods[this.methodology];
        const config = [
            {
                type: 'select', id: 'methodology', label: '증명 방법 (Methodology)', value: this.methodology,
                options: [
                    { label: '3-4-5 격자 (Grid Migration)', value: 'grid' },
                    { label: '5-12-13 격자 (Grid Migration)', value: 'grid_5_12_13' },
                    { label: '재배열 (Rearrangement)', value: 'rearrangement' },
                    { label: 'Perigal의 절단 (Dissection)', value: 'dissection' }
                ],
                onChange: (val) => this.setMethodology(val)
            },
            { type: 'info', label: '현재 단계', value: `${this.currentStep + 1} / ${method.steps.length}` },
            { type: 'button', id: 'prev-btn', label: 'Prev', value: '이전 단계', onClick: () => this.moveStep(-1) },
            { type: 'button', id: 'next-btn', label: 'Next', value: this.currentStep === method.steps.length - 1 ? '처음부터' : '다음 단계', onClick: () => this.moveStep(1) }
        ];
        if (!this.methodology.startsWith('grid')) {
            config.push({
                type: 'slider', id: 'side-a', label: 'Side a', min: 80, max: 180, step: 1, value: this.a,
                onChange: (val) => { this.a = val; this.applyStep(this.currentStep, false); }
            });
        }
        return config;
    },

    draw() {
        const { ctx, canvas, methodology, currentStep } = this;
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2; const centerY = canvas.height / 2;

        if (methodology.startsWith('grid')) this.drawGridMode(centerX, centerY);
        else if (methodology === 'rearrangement') this.drawRearrangementMode(centerX, centerY);
        else if (methodology === 'dissection') this.drawDissectionMode(centerX, centerY);
        
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 24px Inter'; ctx.textAlign = 'center';
        ctx.fillText(this.methods[methodology].steps[currentStep].formula, centerX, canvas.height - 40);
    },

    drawGridMode(cx, cy) {
        const { ctx, gridCells, aUnits, bUnits, unit, startX, startY } = this;
        if (!startX || !startY) return;

        // 1. Draw Static Background (The Triangle)
        ctx.strokeStyle = '#27455C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + bUnits * unit, startY);
        ctx.lineTo(startX, startY - aUnits * unit);
        ctx.closePath();
        ctx.stroke();

        // 2. Draw Moving Grid Cells (Centered)
        gridCells.forEach(cell => {
            ctx.save();
            ctx.translate(cell.x, cell.y);
            ctx.rotate(cell.rotate * Math.PI / 180);
            
            ctx.fillStyle = cell.color + '66';
            ctx.fillRect(-unit/2, -unit/2, unit, unit);
            ctx.strokeStyle = cell.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(-unit/2, -unit/2, unit, unit);
            ctx.restore();
        });
    },

    drawRearrangementMode(cx, cy) {
        const { ctx, a, b, triangles, currentStep } = this;
        const size = a + b;
        const startX = cx - size/2, startY = cy - size/2;
        ctx.fillStyle = '#fff'; ctx.fillRect(startX, startY, size, size);
        ctx.strokeStyle = '#27455C';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, size, size);
        if (currentStep === 1) {
            // Highlight the two empty regions a^2 and b^2
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
            // Highlight the central c^2 region
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
            ctx.save(); ctx.translate(startX + tri.x, startY + tri.y); ctx.rotate((tri.rotate * Math.PI) / 180);
            ctx.fillStyle = tri.color;
            ctx.beginPath();
            // Draw triangle around centroid so all rotations share a consistent visual pivot.
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
    },

    drawDissectionMode(cx, cy) {
        const { ctx, dissectionPieces, a, b } = this;
        const totalW = b + a;
        const totalH = b + a;
        const startX = cx - totalW / 2 + a;
        const startY = cy + totalH / 2 - b;
        const c = Math.sqrt(a*a + b*b);
        const angle = Math.atan2(a, b);

        // Draw Background Structure
        ctx.strokeStyle = '#27455C';
        ctx.lineWidth = 1;

        // Triangle
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + b, startY);
        ctx.lineTo(startX, startY - a);
        ctx.closePath();
        ctx.stroke();

        // Squares as outlines
        // a² square
        ctx.strokeRect(startX - a, startY - a, a, a);
        // b² square
        ctx.strokeRect(startX, startY, b, b);
        
        // c² square (Corrected Orientation)
        ctx.save();
        ctx.translate(startX + b, startY);
        const vx = -b; const vy = -a;
        const ux = vx / c; const uy = vy / c;
        const nx = -uy; const ny = ux;
        // Draw the square using (ux,uy) and (nx,ny) vectors
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
            ctx.rotate(p.rotate * Math.PI / 180);
            
            // In Step 2 mode, pieces are relative to p0 (startX + b, startY) 
            // but p.x, p.y are absolute.
            // Wait, I should make the rotation around the correct pivot.
            // Simplified: if p.rotate matches targetRotate, we draw in c^2 space.
            ctx.fillStyle = p.color + 'EE';
            ctx.beginPath();
            p.points.forEach((pt, idx) => {
                // If it's a tilted piece, we need to apply the rotation to the points
                // No, ctx.rotate handles it.
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
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        if (this.methodology === 'grid') this.applyStep(this.currentStep, false);
    },

    start() {
        if (this.animationId) return;
        const loop = () => { this.draw(); this.animationId = requestAnimationFrame(loop); };
        loop();
    },

    stop() { cancelAnimationFrame(this.animationId); this.animationId = null; },
    destroy() { this.stop(); }
};
