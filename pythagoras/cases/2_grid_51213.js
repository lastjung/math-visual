const Grid51213Case = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    aUnits: 5, bUnits: 12, cUnits: 13,
    gridCells: [],
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',

    steps: [
        {
            desc: "조금 더 큰 5-12-13 피타고라스 삼조입니다.<br>총 25($a^2$) + 144($b^2$) = 169($c^2$) 개의 격자가 필요합니다.",
            formula: "5² + 12² = 13² ?"
        },
        {
            desc: "169개의 격자들이 빗변으로 모여드는 장관을 확인하세요!<br>더 큰 수치에서도 수식은 항상 성립합니다.",
            formula: "25 + 144 = 169"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 2: 5-12-13 격자 (Grid Migration)';
        
        this.initGridCells();
        this.resize();
        this.applyStep(0, false);
    },

    initGridCells() {
        const { aUnits, bUnits } = this;
        this.gridCells = [];
        for(let r=0; r<bUnits; r++) {
            for(let c=0; c<bUnits; c++) {
                this.gridCells.push({ type: 'b', r, c, x: 0, y: 0, rotate: 0, color: '#FF6B6B' });
            }
        }
        for(let r=0; r<aUnits; r++) {
            for(let c=0; c<aUnits; c++) {
                this.gridCells.push({ type: 'a', r, c, x: 0, y: 0, rotate: 0, color: '#4ECDC4' });
            }
        }
    },

    updateGridCellPositions() {
        if (!this.canvas) return;
        const { aUnits, bUnits, cUnits } = this;
        const cx = this.canvas.width / 2;
        
        const relMinX = -aUnits;
        const relMaxX = bUnits + aUnits;
        const relMinY = -(aUnits + bUnits);
        const relMaxY = bUnits;
        
        const padding = 60;
        const titleArea = 120;
        const formulaArea = 80;
        
        const availableWidth = this.canvas.width - padding;
        const availableHeight = this.canvas.height - titleArea - formulaArea;

        const unit = Math.min(44, availableWidth / (relMaxX - relMinX), availableHeight / (relMaxY - relMinY));
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
            cell.originRotate = 0;
        });
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        this.updateGridCellPositions();
        
        this.gridCells.forEach((cell, i) => {
            const tx = index === 0 ? cell.originX : cell.targetX;
            const ty = index === 0 ? cell.originY : cell.targetY;
            const tr = index === 0 ? cell.originRotate : cell.targetRotate;
            
            if (animate) {
                gsap.to(cell, {
                    x: tx, y: ty, rotate: tr,
                    duration: 1.2,
                    delay: index === 1 ? i * 0.05 : 0,
                    ease: "power2.inOut"
                });
            } else {
                cell.x = tx; cell.y = ty; cell.rotate = tr;
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
            { type: 'button', id: 'next-btn', label: 'Next', value: this.currentStep === this.steps.length - 1 ? '처음부터' : '다음 단계', onClick: () => this.moveStep(1) }
        ];
    },

    draw() {
        if (!this.canvas) return;
        const { ctx, canvas, currentStep, gridCells, aUnits, bUnits, unit, startX, startY } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!startX || !startY) return;

        ctx.strokeStyle = '#27455C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + bUnits * unit, startY);
        ctx.lineTo(startX, startY - aUnits * unit);
        ctx.closePath();
        ctx.stroke();

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
    destroy() { this.stop(); gsap.killTweensOf(this.gridCells); }
};
