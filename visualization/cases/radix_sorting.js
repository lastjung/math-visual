/**
 * RadixSortingCase
 * LSD radix sort animation using the same case-object pattern as CardioidCircleCase.
 */
const RadixSortingCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    lastTimeMs: 0,

    itemCount: 18,
    maxValue: 999,
    base: 10,
    animationSpeed: 1,
    autoPlay: true,
    showLabels: true,
    showGuideHud: true,

    items: [],
    working: [],
    buckets: [],
    output: [],
    sorted: [],
    phase: 'distribute',
    currentIndex: 0,
    currentBucket: 0,
    passIndex: 0,
    maxDigits: 1,
    activeMove: null,
    pausedDone: false,
    itemIdSeed: 0,

    guideText: [
        '[Radix Sorting 컨트롤 설명]',
        '- Count: 정렬할 숫자 카드 개수.',
        '- Max Value: 랜덤 생성되는 최대 숫자.',
        '- Base: 자릿수 버킷의 개수. 보통 10진수는 10.',
        '- Speed: 카드 이동 애니메이션 속도.',
        '- Auto Play: 자동 진행 On/Off.',
        '- Show Labels: 카드 위 숫자 표시 On/Off.',
        '- Shuffle Data: 새 랜덤 데이터로 다시 시작.',
        '- LSD 방식: 1의 자리 -> 10의 자리 -> 100의 자리 순으로 안정 정렬.',
        '- 같은 버킷 안에서는 입력 순서를 유지하므로 stable sort 구조를 볼 수 있음.',
        '- 상단은 현재 배열, 중단은 버킷, 하단은 이번 패스의 수집 결과.',
        '- 모든 패스가 끝나면 하단 결과가 최종 오름차순 정렬 상태가 됨.'
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
                max: 36,
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
                min: 31,
                max: 9999,
                step: 1,
                value: this.maxValue,
                onChange: (v) => {
                    this.maxValue = Math.max(1, Math.floor(v));
                    this.generateData();
                }
            },
            {
                type: 'select',
                id: 'rs_base',
                label: 'Base',
                value: String(this.base),
                options: [
                    { value: '2', label: '2 (Binary)' },
                    { value: '4', label: '4' },
                    { value: '8', label: '8' },
                    { value: '10', label: '10 (Decimal)' },
                    { value: '16', label: '16 (Hex)' }
                ],
                onChange: (v) => {
                    this.base = Math.max(2, parseInt(v, 10) || 10);
                    this.generateData();
                }
            },
            {
                type: 'slider',
                id: 'rs_speed',
                label: 'Speed',
                min: 0.25,
                max: 3,
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
                type: 'select',
                id: 'rs_labels',
                label: 'Show Labels',
                value: this.showLabels ? 'on' : 'off',
                options: [
                    { value: 'on', label: 'On' },
                    { value: 'off', label: 'Off' }
                ],
                onChange: (v) => {
                    this.showLabels = v === 'on';
                    this.draw();
                }
            },
            {
                type: 'button',
                id: 'rs_shuffle',
                label: 'Shuffle Data',
                value: '새 데이터 생성',
                onClick: () => this.generateData()
            },
            {
                type: 'button',
                id: 'rs_step',
                label: 'Next Step',
                value: '한 단계 진행',
                onClick: () => this.stepOnce()
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
        this.itemCount = 18;
        this.maxValue = 999;
        this.base = 10;
        this.animationSpeed = 1;
        this.autoPlay = true;
        this.showLabels = true;
        this.showGuideHud = true;
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
        this.items = Array.from({ length: this.itemCount }, () => ({
            id: this.itemIdSeed++,
            value: Math.floor(Math.random() * (this.maxValue + 1))
        }));
        this.maxDigits = this.computeMaxDigits();
        this.sorted = [];
        this.restartPassState();
        this.draw();
    },

    restartPassState() {
        this.working = this.items.map((item) => ({ ...item }));
        this.buckets = Array.from({ length: this.base }, () => []);
        this.output = [];
        this.phase = 'distribute';
        this.currentIndex = 0;
        this.currentBucket = 0;
        this.passIndex = 0;
        this.activeMove = null;
        this.pausedDone = false;
    },

    computeMaxDigits() {
        const digits = Math.max(1, Math.floor(Math.log(Math.max(1, this.maxValue)) / Math.log(this.base)) + 1);
        return Number.isFinite(digits) ? digits : 1;
    },

    getPlaceValue() {
        return this.base ** this.passIndex;
    },

    getDigit(value, passIndex = this.passIndex) {
        const place = this.base ** passIndex;
        return Math.floor(value / place) % this.base;
    },

    stepOnce() {
        if (this.activeMove || this.phase === 'done') return;
        this.advanceState();
        this.draw();
    },

    updateSimulation(dt) {
        if (this.activeMove) {
            const duration = Math.max(0.12, 0.7 / this.animationSpeed);
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
        if (this.phase === 'done') return;

        if (this.phase === 'distribute') {
            if (this.currentIndex >= this.working.length) {
                this.phase = 'collect';
                this.currentBucket = 0;
                return;
            }
            const item = this.working[this.currentIndex];
            const bucketIndex = this.getDigit(item.value);
            const slotIndex = this.buckets[bucketIndex].length;
            this.activeMove = {
                type: 'to-bucket',
                item: { ...item },
                fromIndex: this.currentIndex,
                bucketIndex,
                slotIndex,
                progress: 0
            };
            return;
        }

        if (this.phase === 'collect') {
            while (this.currentBucket < this.base && this.buckets[this.currentBucket].length === 0) {
                this.currentBucket += 1;
            }
            if (this.currentBucket >= this.base) {
                this.finishPass();
                return;
            }

            const item = this.buckets[this.currentBucket][0];
            this.activeMove = {
                type: 'to-output',
                item: { ...item },
                bucketIndex: this.currentBucket,
                slotIndex: 0,
                outputIndex: this.output.length,
                progress: 0
            };
        }
    },

    finishActiveMove() {
        if (!this.activeMove) return;

        if (this.activeMove.type === 'to-bucket') {
            const item = this.working[this.currentIndex];
            const bucketIndex = this.activeMove.bucketIndex;
            this.buckets[bucketIndex].push(item);
            this.currentIndex += 1;
        } else if (this.activeMove.type === 'to-output') {
            const bucket = this.buckets[this.activeMove.bucketIndex];
            const item = bucket.shift();
            this.output.push(item);
        }

        this.activeMove = null;
    },

    finishPass() {
        this.working = this.output.map((item) => ({ ...item }));
        this.output = [];
        this.buckets = Array.from({ length: this.base }, () => []);
        this.passIndex += 1;

        if (this.passIndex >= this.maxDigits) {
            this.phase = 'done';
            this.sorted = this.working.map((item) => ({ ...item }));
            return;
        }

        this.phase = 'distribute';
        this.currentIndex = 0;
        this.currentBucket = 0;
    },

    showGuide() {
        const existing = document.getElementById('radix-guide-modal');
        if (existing) {
            existing.style.display = 'flex';
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'radix-guide-modal';
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.zIndex = '2000';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.background = 'rgba(3, 10, 19, 0.76)';
        modal.style.backdropFilter = 'blur(6px)';

        const card = document.createElement('div');
        card.style.width = 'min(920px, 92vw)';
        card.style.maxHeight = '82vh';
        card.style.overflow = 'auto';
        card.style.background = '#fbfdff';
        card.style.borderRadius = '18px';
        card.style.padding = '22px';
        card.style.boxShadow = '0 24px 60px rgba(5, 13, 28, 0.35)';
        card.style.border = '1px solid #d8e3f0';

        const title = document.createElement('div');
        title.textContent = 'Radix Sorting Guide';
        title.style.fontSize = '1.15rem';
        title.style.fontWeight = '700';
        title.style.color = '#0f172a';
        title.style.marginBottom = '12px';

        const pre = document.createElement('pre');
        pre.textContent = this.guideText;
        pre.style.margin = '0';
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-word';
        pre.style.lineHeight = '1.65';
        pre.style.fontSize = '1rem';
        pre.style.color = '#172033';
        pre.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

        const close = document.createElement('button');
        close.textContent = '닫기';
        close.style.marginTop = '16px';
        close.style.padding = '10px 16px';
        close.style.borderRadius = '999px';
        close.style.border = '1px solid #cbd5e1';
        close.style.background = '#f8fafc';
        close.style.cursor = 'pointer';
        close.onclick = () => {
            modal.style.display = 'none';
        };

        card.appendChild(title);
        card.appendChild(pre);
        card.appendChild(close);
        modal.appendChild(card);
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
        document.body.appendChild(modal);
    },

    getLayout() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const topY = height * 0.2;
        const bucketY = height * 0.53;
        const outputY = height * 0.84;
        const bucketWidth = Math.min(88, (width - 80) / this.base);
        const cardWidth = Math.max(24, Math.min(52, (width - 80) / Math.max(this.itemCount, this.base + 2)));
        const cardHeight = Math.max(52, Math.min(86, height * 0.12));
        return { width, height, topY, bucketY, outputY, bucketWidth, cardWidth, cardHeight };
    },

    getArrayCardPosition(index, y, countOverride = null) {
        const layout = this.getLayout();
        const count = countOverride ?? this.working.length;
        const spacing = layout.cardWidth + 6;
        const total = Math.max(0, count - 1) * spacing;
        const startX = layout.width * 0.5 - total * 0.5;
        return {
            x: startX + index * spacing,
            y
        };
    },

    getBucketCardPosition(bucketIndex, slotIndex) {
        const layout = this.getLayout();
        const totalWidth = this.base * layout.bucketWidth;
        const startX = layout.width * 0.5 - totalWidth * 0.5;
        const x = startX + bucketIndex * layout.bucketWidth + (layout.bucketWidth - layout.cardWidth) * 0.5;
        const y = layout.bucketY + slotIndex * (layout.cardHeight * 0.72);
        return { x, y };
    },

    getActiveMoveEndpoints(move) {
        const layout = this.getLayout();
        if (move.type === 'to-bucket') {
            return {
                from: this.getArrayCardPosition(move.fromIndex, layout.topY, this.working.length),
                to: this.getBucketCardPosition(move.bucketIndex, move.slotIndex)
            };
        }
        return {
            from: this.getBucketCardPosition(move.bucketIndex, move.slotIndex),
            to: this.getArrayCardPosition(move.outputIndex, layout.outputY, this.working.length)
        };
    },

    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    getBucketColor(bucketIndex) {
        const hue = (bucketIndex / Math.max(1, this.base)) * 320 + 18;
        return `hsl(${hue}, 78%, 58%)`;
    },

    drawCard(item, x, y, opts = {}) {
        if (!item) return;
        const { cardWidth, cardHeight } = this.getLayout();
        const digit = this.getDigit(item.value);
        const fill = opts.fill || this.getBucketColor(digit);
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
        ctx.beginPath();
        ctx.roundRect(3, 6, cardWidth, cardHeight, 12);
        ctx.fill();

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(0, 0, cardWidth, cardHeight, 12);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fillRect(0, 0, cardWidth, Math.max(10, cardHeight * 0.18));

        if (this.showLabels) {
            ctx.fillStyle = '#f8fafc';
            ctx.font = `600 ${Math.max(12, cardHeight * 0.26)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(item.value), cardWidth * 0.5, cardHeight * 0.5);
        }

        if (opts.accentText) {
            ctx.fillStyle = '#0f172a';
            ctx.font = '700 11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(opts.accentText, cardWidth - 7, 7);
        }
        ctx.restore();
    },

    drawSectionLabel(text, x, y, align = 'left') {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 15px Inter, sans-serif';
        ctx.textAlign = align;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(text, x, y);
        ctx.restore();
    },

    drawBackground() {
        const { width, height } = this.getLayout();
        const ctx = this.ctx;
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#08111f');
        bg.addColorStop(0.45, '#10233c');
        bg.addColorStop(1, '#09111b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        const glow = ctx.createRadialGradient(width * 0.78, height * 0.16, 10, width * 0.78, height * 0.16, width * 0.5);
        glow.addColorStop(0, 'rgba(96, 165, 250, 0.24)');
        glow.addColorStop(1, 'rgba(96, 165, 250, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        const glow2 = ctx.createRadialGradient(width * 0.18, height * 0.84, 10, width * 0.18, height * 0.84, width * 0.45);
        glow2.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
        glow2.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow2;
        ctx.fillRect(0, 0, width, height);
    },

    drawBuckets() {
        const layout = this.getLayout();
        const ctx = this.ctx;
        const totalWidth = this.base * layout.bucketWidth;
        const startX = layout.width * 0.5 - totalWidth * 0.5;
        const movingId = this.activeMove ? this.activeMove.item.id : null;

        for (let i = 0; i < this.base; i += 1) {
            const x = startX + i * layout.bucketWidth + 4;
            const y = layout.bucketY - 30;
            const w = layout.bucketWidth - 8;
            const h = layout.height * 0.24;
            const active = this.phase === 'collect' && this.currentBucket === i;

            ctx.save();
            ctx.fillStyle = active ? 'rgba(250, 204, 21, 0.16)' : 'rgba(255, 255, 255, 0.05)';
            ctx.strokeStyle = active ? 'rgba(250, 204, 21, 0.7)' : 'rgba(148, 163, 184, 0.24)';
            ctx.lineWidth = active ? 2 : 1;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 16);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = this.getBucketColor(i);
            ctx.beginPath();
            ctx.roundRect(x + 10, y + 10, w - 20, 24, 12);
            ctx.fill();

            ctx.fillStyle = '#eff6ff';
            ctx.font = '700 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(i), x + w * 0.5, y + 22);
            ctx.restore();

            this.buckets[i]?.forEach((item, slotIndex) => {
                if (this.activeMove && this.activeMove.type === 'to-output' && i === this.activeMove.bucketIndex && slotIndex === 0 && item.id === movingId) {
                    return;
                }
                const pos = this.getBucketCardPosition(i, slotIndex);
                this.drawCard(item, pos.x, pos.y, { accentText: `${this.getDigit(item.value)}` });
            });
        }
    },

    drawRows() {
        const layout = this.getLayout();
        const movingId = this.activeMove ? this.activeMove.item.id : null;
        const finalOutput = this.phase === 'done' ? this.working : this.output;

        this.working.forEach((item, index) => {
            if (movingId === item.id && this.activeMove.type === 'to-bucket' && this.currentIndex === index) return;
            const pos = this.getArrayCardPosition(index, layout.topY, this.working.length);
            this.drawCard(item, pos.x, pos.y, {
                accentText: this.phase === 'done' ? 'OK' : `${this.getDigit(item.value)}`,
                fill: this.phase === 'done' ? 'hsl(158, 64%, 42%)' : undefined
            });
        });

        finalOutput.forEach((item, index) => {
            if (movingId === item.id && this.activeMove.type === 'to-output' && this.output.length === index) return;
            const pos = this.getArrayCardPosition(index, layout.outputY, this.working.length);
            this.drawCard(item, pos.x, pos.y, {
                accentText: this.phase === 'done' ? 'DONE' : `${this.getDigit(item.value)}`,
                fill: this.phase === 'done' ? 'hsl(158, 64%, 42%)' : undefined
            });
        });
    },

    drawActiveMove() {
        if (!this.activeMove) return;
        const { from, to } = this.getActiveMoveEndpoints(this.activeMove);
        const t = this.activeMove.progress;
        const eased = 1 - (1 - t) * (1 - t);
        const x = this.lerp(from.x, to.x, eased);
        const y = this.lerp(from.y, to.y, eased) - Math.sin(eased * Math.PI) * 24;
        this.drawCard(this.activeMove.item, x, y, { accentText: `${this.getDigit(this.activeMove.item.value)}` });
    },

    drawHud() {
        if (!this.showGuideHud) return;
        const layout = this.getLayout();
        const ctx = this.ctx;
        const place = this.getPlaceValue();
        const status = this.phase === 'done'
            ? 'Sorting Complete'
            : this.phase === 'collect'
                ? 'Collecting Buckets'
                : 'Distributing by Digit';

        ctx.save();
        ctx.fillStyle = 'rgba(8, 15, 28, 0.72)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(24, 22, 260, 108, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '700 16px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('LSD Radix Sort', 40, 40);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillText(`Pass ${Math.min(this.passIndex + 1, this.maxDigits)} / ${this.maxDigits}`, 40, 66);
        ctx.fillText(`Place Value ${place}`, 40, 86);
        ctx.fillText(status, 40, 106);

        const summary = this.phase === 'done'
            ? this.working.map((item) => item.value).join(', ')
            : this.working.map((item) => item.value).slice(0, 8).join(', ');
        ctx.textAlign = 'right';
        ctx.fillText(`Data ${summary}${this.working.length > 8 && this.phase !== 'done' ? ' ...' : ''}`, layout.width - 28, 40);
        ctx.restore();
    },

    drawLegend() {
        const layout = this.getLayout();
        this.drawSectionLabel('Current Array', 36, layout.topY - 18);
        this.drawSectionLabel('Buckets', 36, layout.bucketY - 46);
        this.drawSectionLabel(this.phase === 'done' ? 'Final Sorted Output' : 'Collected Output', 36, layout.outputY - 18);
        this.drawSectionLabel(`Digit Focus: base-${this.base}, place ${this.getPlaceValue()}`, layout.width - 36, layout.topY - 18, 'right');
    },

    drawDoneRibbon() {
        if (this.phase !== 'done') return;
        const layout = this.getLayout();
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(layout.width - 240, layout.height - 70, 204, 42, 999);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#d1fae5';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Stable sort complete', layout.width - 138, layout.height - 49);
        ctx.restore();
    },

    draw() {
        if (!this.ctx || !this.canvas) return;
        this.drawBackground();
        this.drawLegend();
        this.drawRows();
        this.drawBuckets();
        this.drawActiveMove();
        this.drawHud();
        this.drawDoneRibbon();
    }
};
