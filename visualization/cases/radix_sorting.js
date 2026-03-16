/**
 * RadixSortingCase - Waterfall Edition
 * Multi-level radix sort animation where cards flow downwards through digit-buckets.
 */
const RadixSortingCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,

    itemCount: 16,
    maxValue: 999,
    base: 10,
    animationSpeed: 1,
    autoPlay: true,
    showLabels: true,
    showGuideHud: true,

    // Waterfall State
    inputItems: [],     // Starting items at the top
    levelBuckets: [],   // Array of levels, each level is an array of 10 buckets
    outputItems: [],    // Final sorted items at the bottom

    currentLevel: 0,    // 0: Input -> B0, 1: B0 -> B1, 2: B1 -> B2, 3: B2 -> Output
    currentSourceIndex: 0,  // Index in inputItems or currentSourceBucket
    currentSourceBucket: 0, // When moving from buckets to buckets
    
    maxDigits: 3,
    activeMove: null,
    phase: 'animating', // animating | done
    itemIdSeed: 0,

    // Sweep Effect State
    levelSweep: [0, 0, 0, 0], // progress 0 to 1 for each row
    levelComplete: [false, false, false, false],

    guideText: [
        '[Radix Sorting 폭포수 모드]',
        '- 카드가 위에서 아래로 흐르며 정렬되는 방식입니다.',
        '- Level 1 (1\'s): 1의 자리 숫자로 분류됩니다.',
        '- Level 2 (10\'s): 10의 자리 숫자로 분류됩니다.',
        '- Level 3 (100\'s): 100의 자리 숫자로 분류됩니다.',
        '- 각 층을 통과할수록 숫자들이 점차 정렬되는 것을 볼 수 있습니다.',
        '- 모든 층을 통과한 카드는 가장 아래쪽 결과 배열에 쌓입니다.',
        '- Shuffle Data를 누르면 새로운 무작위 데이터로 시작합니다.'
    ].join('\n'),

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.generateData();
        this.resize();
    },

    get uiConfig() {
        return [
            {
                type: 'slider',
                id: 'rs_count',
                label: 'Count',
                min: 6,
                max: 24,
                step: 1,
                value: this.itemCount,
                onChange: (v) => {
                    this.itemCount = Math.max(6, Math.floor(v));
                    this.generateData();
                }
            },
            {
                type: 'slider',
                id: 'rs_max',
                label: 'Max Value',
                min: 99,
                max: 999,
                step: 1,
                value: this.maxValue,
                onChange: (v) => {
                    this.maxValue = Math.max(1, Math.floor(v));
                    this.generateData();
                }
            },
            {
                type: 'slider',
                id: 'rs_speed',
                label: 'Speed',
                min: 0.25,
                max: 5,
                step: 0.05,
                value: this.animationSpeed,
                onChange: (v) => {
                    this.animationSpeed = v;
                }
            },
            {
                type: 'select',
                id: 'rs_auto',
                label: 'Auto Play',
                value: this.autoPlay ? 'on' : 'off',
                options: [
                    { value: 'on', label: 'On' },
                    { value: 'off', label: 'Off' }
                ],
                onChange: (v) => {
                    this.autoPlay = v === 'on';
                }
            },
            {
                type: 'button',
                id: 'rs_shuffle',
                label: 'Shuffle',
                value: '새 데이터 / 셔플',
                onClick: () => this.generateData()
            },
            {
                type: 'button',
                id: 'rs_help',
                label: 'Guide',
                value: '설명서 보기',
                onClick: () => this.showGuide()
            }
        ];
    },

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },

    start() {
        if (this.animationId) return;
        this.lastTimeMs = performance.now();
        const loop = (now) => {
            const dt = Math.min(0.05, (now - this.lastTimeMs) / 1000);
            this.lastTimeMs = now;
            this.updateSimulation(dt);
            this.draw();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    },

    stop() {
        if (!this.animationId) return;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
    },

    reset() {
        this.itemCount = 16;
        this.maxValue = 999;
        this.animationSpeed = 1;
        this.autoPlay = true;
        this.generateData();
        if (typeof Core !== 'undefined' && Core.currentCase === this) {
            Core.updateControls();
        }
    },

    destroy() {
        this.stop();
    },

    generateData() {
        this.itemIdSeed = 0;
        this.inputItems = Array.from({ length: this.itemCount }, () => ({
            id: this.itemIdSeed++,
            value: Math.floor(Math.random() * (this.maxValue + 1))
        }));
        
        this.maxDigits = 3; // Fixed 3 levels for 999
        this.levelBuckets = Array.from({ length: this.maxDigits }, () => 
            Array.from({ length: this.base }, () => [])
        );
        this.outputItems = [];
        
        this.currentLevel = 0;
        this.currentSourceIndex = 0;
        this.currentSourceBucket = 0;
        this.activeMove = null;
        this.levelStatus = [false, false, false, false];
        this.levelSweep = [0, 0, 0, 0];
        this.levelComplete = [false, false, false, false];
        this.draw();
    },

    getDigit(value, passIndex) {
        const place = this.base ** passIndex;
        return Math.floor(value / place) % this.base;
    },

    updateSimulation(dt) {
        // Update sweeps
        for (let i = 0; i < 4; i++) {
            if (this.levelComplete[i] && this.levelSweep[i] < 1.2) {
                this.levelSweep[i] += dt * 1.5;
            }
        }

        if (this.activeMove) {
            const duration = Math.max(0.1, 0.6 / this.animationSpeed);
            this.activeMove.progress = Math.min(1, this.activeMove.progress + dt / duration);
            if (this.activeMove.progress >= 1) {
                this.finishActiveMove();
            }
            return;
        }

        if (!this.autoPlay || this.phase === 'done') return;
        this.advanceState();
    },

    advanceState() {
        if (this.phase === 'done' || this.activeMove) return;
        const { yPos } = this.getLayout();

        // 1. Level 0 -> Level 1 (Input to 1s Buckets)
        if (this.currentLevel === 0) {
            if (this.currentSourceIndex >= this.inputItems.length) {
                this.currentLevel = 1;
                this.currentSourceBucket = 0;
                this.currentSourceIndex = 0;
                return;
            }
            const item = this.inputItems[this.currentSourceIndex];
            const digit = this.getDigit(item.value, 0);
            const fromPos = this.getArrayPos(this.currentSourceIndex, this.inputItems.length, yPos[0]);
            
            this.activeMove = {
                item: { ...item },
                type: 'to_bucket',
                level: 0,
                digit: digit,
                from: fromPos,
                progress: 0
            };
            return;
        }

        // 2. Intermediate Levels (Bucket to Bucket)
        if (this.currentLevel > 0 && this.currentLevel < this.maxDigits) {
            const sourceBuckets = this.levelBuckets[this.currentLevel - 1];
            
            // Find next bucket with items
            while (this.currentSourceBucket < this.base && sourceBuckets[this.currentSourceBucket].length === 0) {
                this.currentSourceBucket++;
            }

            if (this.currentSourceBucket >= this.base) {
                this.currentLevel++;
                this.currentSourceBucket = 0;
                this.currentSourceIndex = 0;
                return;
            }

            const item = sourceBuckets[this.currentSourceBucket][0];
            const digit = this.getDigit(item.value, this.currentLevel);
            const fromPos = this.getBucketPos(this.currentLevel - 1, this.currentSourceBucket, 0);

            this.activeMove = {
                item: { ...item },
                type: 'to_bucket',
                level: this.currentLevel,
                digit: digit,
                from: fromPos,
                progress: 0
            };
            return;
        }

        // 3. Last Level -> Output (100s Buckets to Final)
        if (this.currentLevel === this.maxDigits) {
            const sourceBuckets = this.levelBuckets[this.maxDigits - 1];
            
            while (this.currentSourceBucket < this.base && sourceBuckets[this.currentSourceBucket].length === 0) {
                this.currentSourceBucket++;
            }

            if (this.currentSourceBucket >= this.base) {
                this.phase = 'done';
                return;
            }

            const item = sourceBuckets[this.currentSourceBucket][0];
            const fromPos = this.getBucketPos(this.maxDigits - 1, this.currentSourceBucket, 0);

            this.activeMove = {
                item: { ...item },
                type: 'to_output',
                from: fromPos,
                progress: 0
            };
        }
    },

    finishActiveMove() {
        if (!this.activeMove) return;

        const item = this.activeMove.item;
        const type = this.activeMove.type;
        const level = this.activeMove.level;

        if (type === 'to_bucket') {
            if (level === 0) {
                this.inputItems = this.inputItems.filter(i => i.id !== item.id);
                if (this.inputItems.length === 0) {
                    this.levelComplete[0] = true; // Sweep starts AFTER last card of input arrives
                }
            } else {
                this.levelBuckets[level - 1][this.currentSourceBucket].shift();
                const prevLevelEmpty = this.levelBuckets[level - 1].every(b => b.length === 0);
                if (prevLevelEmpty) {
                    this.levelComplete[level] = true; // Sweep starts AFTER last card of level arrives
                }
            }
            this.levelBuckets[level][this.activeMove.digit].push(item);

        } else if (type === 'to_output') {
            this.levelBuckets[this.maxDigits - 1][this.currentSourceBucket].shift();
            const lastLevelEmpty = this.levelBuckets[this.maxDigits - 1].every(b => b.length === 0);
            if (lastLevelEmpty) {
                this.levelComplete[this.maxDigits] = true;
            }
            this.outputItems.push(item);
        }

        this.activeMove = null;
    },

    // --- Rendering ---

    getLayout() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const margin = 30;
        
        const rowHeight = (h - margin * 2) / 5;
        const yPos = [
            margin + rowHeight * 0.4,
            margin + rowHeight * 1.5,
            margin + rowHeight * 2.5,
            margin + rowHeight * 3.5,
            margin + rowHeight * 4.6
        ];

        const cardW = Math.max(22, Math.min(48, (w - 100) / this.itemCount));
        const cardH = cardW * 1.4;
        const bucketW = (w - 80) / this.base;
        
        return { w, h, yPos, cardW, cardH, bucketW };
    },

    getArrayPos(index, count, y) {
        const { w, cardW } = this.getLayout();
        const spacing = cardW + 6;
        const totalW = (count - 1) * spacing;
        const startX = (w - totalW) / 2;
        return { x: startX + index * spacing, y: y };
    },

    getBucketPos(level, digit, slotIndex) {
        const { w, yPos, cardW, cardH, bucketW } = this.getLayout();
        const totalW = this.base * bucketW;
        const startX = (w - totalW) / 2;
        const x = startX + digit * bucketW + (bucketW - cardW) / 2;
        const y = yPos[level + 1] + slotIndex * (cardH * 0.25);
        return { x, y };
    },

    drawCard(item, x, y, options = {}) {
        const { cardW, cardH, w } = this.getLayout();
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.roundRect(2, 4, cardW, cardH, 8);
        ctx.fill();

        // Base Hue logic
        let hVal = 0;
        let sVal = 70;
        let lVal = 55;

        // Color based on digit at level
        const digit = options.focusDigit !== undefined ? options.focusDigit : 0;
        const hueBase = (digit / this.base) * 320 + 20;

        // Sweep Color Change logic
        const sweepProgress = options.sweepProgress || 0;
        // Map card x to 0..1 range across screen width to check against sweep
        const screenX = x / w;
        const isSwept = sweepProgress > screenX;

        if (isSwept) {
            hVal = (item.value % 360);
            sVal = 80;
            lVal = 60;
        } else {
            hVal = hueBase;
            sVal = 60;
            lVal = 45;
        }
        
        const grad = ctx.createLinearGradient(0, 0, 0, cardH);
        grad.addColorStop(0, `hsl(${hVal}, ${sVal}%, 65%)`);
        grad.addColorStop(1, `hsl(${hVal}, ${sVal - 10}%, 45%)`);
        
        ctx.fillStyle = grad;
        ctx.strokeStyle = isSwept ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)';
        ctx.lineWidth = isSwept ? 2 : 1;
        
        ctx.beginPath();
        ctx.roundRect(0, 0, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        // Digit Label with Highlight
        if (this.showLabels) {
            const valStr = String(item.value).padStart(3, '0');
            const highlightIndex = options.highlightIndex !== undefined ? options.highlightIndex : -1;
            
            ctx.font = `bold ${Math.max(10, cardW * 0.45)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw digits individually to highlight one
            const spacing = cardW / 3;
            for (let i = 0; i < 3; i++) {
                const char = valStr[i];
                const cx = (i + 0.5) * spacing;
                
                if (i === highlightIndex) {
                    ctx.fillStyle = '#ff4d4d'; // Red highlight
                    ctx.shadowColor = 'rgba(255,75,75,0.5)';
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = '#fff';
                    ctx.shadowBlur = 0;
                }
                ctx.fillText(char, cx, cardH / 2);
            }
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        const { w, h, yPos, bucketW, cardW, cardH } = this.getLayout();
        const ctx = this.ctx;

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#080d1a');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Grid Lines (Subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 50) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        }

        // Draw Row Labels
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '700 13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText("INPUT ARRAY", 30, yPos[0] - 15);
        ctx.fillText("LEVEL 1: ONES", 30, yPos[1] - 25);
        ctx.fillText("LEVEL 2: TENS", 30, yPos[2] - 25);
        ctx.fillText("LEVEL 3: HUNDREDS", 30, yPos[3] - 25);
        ctx.fillText("FINAL SORTED", 30, yPos[4] - 15);

        // Draw Input Row
        this.inputItems.forEach((item, i) => {
            const pos = this.getArrayPos(i, this.inputItems.length, yPos[0]);
            this.drawCard(item, pos.x, pos.y, { 
                focusDigit: this.getDigit(item.value, 0),
                highlightIndex: 2, // 1s digit
                sweepProgress: this.levelSweep[0]
            });
        });

        // Draw Buckets at each level
        for (let l = 0; l < this.maxDigits; l++) {
            const totalWidth = this.base * bucketW;
            const startX = (w - totalWidth) / 2;
            const hlIdx = l === 0 ? 1 : (l === 1 ? 0 : -1); // 1층:10s(1), 2층:100s(0)
            
            for (let d = 0; d < this.base; d++) {
                const x = startX + d * bucketW + 6;
                const y = yPos[l+1] - 10;
                const bw = bucketW - 12;
                const bh = (yPos[l+2] - yPos[l+1]) * 0.75 || h * 0.15;
                
                // Bucket box
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                ctx.beginPath();
                ctx.roundRect(x, y, bw, bh, 12);
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(255,255,255,0.08)';
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Digit Label
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(d, x + bw/2, y + 20);

                // Items in bucket
                this.levelBuckets[l][d].forEach((item, si) => {
                    const pos = this.getBucketPos(l, d, si);
                    this.drawCard(item, pos.x, pos.y, { 
                        focusDigit: this.getDigit(item.value, l),
                        highlightIndex: hlIdx,
                        sweepProgress: this.levelSweep[l+1]
                    });
                });
            }
        }

        // Draw Output Row
        this.outputItems.forEach((item, i) => {
            const pos = this.getArrayPos(i, this.outputItems.length, yPos[4]);
            this.drawCard(item, pos.x, pos.y, { focusDigit: this.getDigit(item.value, this.maxDigits - 1) });
        });

        // Draw Active Move item with path
        if (this.activeMove) {
            const { item, type, progress, from } = this.activeMove;
            let to;
            
            if (type === 'to_bucket') {
                to = this.getBucketPos(this.activeMove.level, this.activeMove.digit, this.levelBuckets[this.activeMove.level][this.activeMove.digit].length);
            } else {
                to = this.getArrayPos(this.outputItems.length, this.itemCount, yPos[4]);
            }

            const t = progress;
            const eased = t * t * (3 - 2 * t);
            
            // Path Curve
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 216, 102, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.moveTo(from.x + cardW/2, from.y + cardH/2);
            const cpX = (from.x + to.x) / 2;
            const cpY = (from.y + to.y) / 2 - 100;
            ctx.quadraticCurveTo(cpX + cardW/2, cpY + cardH/2, to.x + cardW/2, to.y + cardH/2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Moving Card
            const highlightIdx = type === 'to_output' ? -1 : (level === 0 ? 2 : (level === 1 ? 1 : 0));
            
            // Arc motion
            const curX = from.x + (to.x - from.x) * eased;
            const curY = from.y + (to.y - from.y) * eased - Math.sin(t * Math.PI) * 60;
            
            this.drawCard(item, curX, curY, { 
                focusDigit: this.getDigit(item.value, level || 0),
                highlightIndex: highlightIdx
            });
        }

        // Final Ribbon
        if (this.phase === 'done') {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'center';
            ctx.fillText("Radix Sort Complete!", w/2, yPos[4] + 60);
        }
    },

    showGuide() {
        const modalId = 'radix-waterfall-modal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            Object.assign(modal.style, {
                position: 'fixed', inset: '0', zIndex: '9999', display: 'flex',
                alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)'
            });
            const card = document.createElement('div');
            Object.assign(card.style, {
                width: 'min(640px, 90vw)', background: '#1e293b', color: '#fff',
                padding: '30px', borderRadius: '20px', border: '1px solid #334155'
            });
            card.innerHTML = `
                <h2 style="margin-top:0">Waterfall Radix Sort</h2>
                <pre style="white-space:pre-wrap; font-family:inherit; line-height:1.6">${this.guideText}</pre>
                <button class="btn-primary" style="margin-top:20px; width:100%" onclick="document.getElementById('${modalId}').style.display='none'">닫기</button>
            `;
            modal.appendChild(card);
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
    }
};
