const DavinciCase = {
    canvas: null,
    ctx: null,
    animationId: null,
    
    currentStep: 0,
    a: 120, b: 160,
    
    musicTrack: '../visualization/assets/music/bgm/Math_03_Harmonic_Balance.mp3',
    colors: ['#0984e3', '#00b894', '#d63031', '#fdcb6e'],

    steps: [
        {
            desc: "레오나르도 다빈치의 교묘한 증명입니다.<br>a²와 b² 정사각형, 그리고 두 개의 직각삼각형으로 이뤄진 첫 번째 육각형을 그립니다.",
            formula: "Hexagon 1 = a² + b² + 2·T"
        },
        {
            desc: "두 번째 육각형은 c² 정사각형과 두 개의 직각삼각형으로 만듭니다.<br>놀랍게도 두 육각형은 같은 넓이를 가집니다.",
            formula: "Hexagon 2 = c² + 2·T"
        },
        {
            desc: "다빈치는 이 두 육각형을 대각선으로 절반으로 자른 후, 90도 회전하면 서로 겹쳐진다는 것을 (합동) 증명했습니다.",
            formula: "½ Hex 1 ≅ ½ Hex 2"
        },
        {
            desc: "육각형의 넓이가 같으므로: a² + b² + 2T = c² + 2T<br>따라서 a² + b² = c² 이 성립합니다!",
            formula: "a² + b² = c²"
        }
    ],

    init() {
        this.canvas = document.getElementById('mathCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentStep = 0;
        
        document.getElementById('main-title').textContent = '방법론 10: 레오나르도 다빈치의 증명';
        const tab = document.querySelector('.tab[data-case="davinci"]');
        if (tab) tab.innerText = '10. 다빈치 증명';

        this.initGeometry();
        this.resize();
        this.applyStep(0, false);
    },

    initGeometry() {
        this.geom = {
            hex1_opacity: 0,
            hex2_opacity: 0,
            line_opacity: 0
        };
    },

    applyStep(index, animate = true) {
        this.currentStep = index;
        const stepInfo = this.steps[index];
        const descEl = document.getElementById('main-subtitle');
        if (descEl) descEl.innerHTML = stepInfo.desc;

        let h1Op = 0, h2Op = 0, lineOp = 0;
        
        if (index === 0) {
            h1Op = 1; h2Op = 0; lineOp = 0;
        } else if (index === 1) {
            h1Op = 0.5; h2Op = 1; lineOp = 0;
        } else if (index === 2) {
            h1Op = 1; h2Op = 1; lineOp = 1;
        } else if (index === 3) {
            h1Op = 1; h2Op = 1; lineOp = 0;
        }

        if (animate) {
            gsap.to(this.geom, {
                hex1_opacity: h1Op,
                hex2_opacity: h2Op,
                line_opacity: lineOp,
                duration: 1.0,
                ease: "power2.inOut"
            });
        } else {
            this.geom.hex1_opacity = h1Op;
            this.geom.hex2_opacity = h2Op;
            this.geom.line_opacity = lineOp;
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
        const { ctx, canvas, a, b } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const c = Math.sqrt(a*a + b*b);

        ctx.save();
        
        // draw Hexagon 1 on the left
        const h1x = cx - 200;
        const h1y = cy;
        
        if (this.geom.hex1_opacity > 0) {
            ctx.save();
            ctx.translate(h1x, h1y);
            
            // Central Triangle ABC at origin
            ctx.fillStyle = `rgba(223, 230, 233, ${this.geom.hex1_opacity})`;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(b, 0); ctx.lineTo(0, -a);
            ctx.closePath(); ctx.fill();
            
            // Square on a
            ctx.fillStyle = `rgba(9, 132, 227, ${this.geom.hex1_opacity * 0.8})`;
            ctx.fillRect(-a, -a, a, a);
            
            // Square on b
            ctx.fillStyle = `rgba(0, 184, 148, ${this.geom.hex1_opacity * 0.8})`;
            ctx.fillRect(0, 0, b, b);
            
            // Top Triangle matching ABC
            ctx.fillStyle = `rgba(223, 230, 233, ${this.geom.hex1_opacity})`;
            ctx.beginPath();
            ctx.moveTo(-a, -a); ctx.lineTo(b, -a); ctx.lineTo(b, 0);
            ctx.closePath(); ctx.fill();
            
            // Outline of Hexagon 1
            ctx.strokeStyle = `rgba(45, 52, 54, ${this.geom.hex1_opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(0, b); ctx.lineTo(b, b); ctx.lineTo(b, -a);
            ctx.lineTo(-a, -a); ctx.lineTo(-a, 0); ctx.closePath();
            ctx.stroke();

            if (this.geom.line_opacity > 0) {
                ctx.strokeStyle = `rgba(214, 48, 49, ${this.geom.line_opacity})`;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(-a, 0); ctx.lineTo(b, -a); // splitting line
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.restore();
        }

        // draw Hexagon 2 on the right
        const h2x = cx + 80;
        const h2y = cy;

        if (this.geom.hex2_opacity > 0) {
            ctx.save();
            ctx.translate(h2x, h2y);
            
            ctx.fillStyle = `rgba(223, 230, 233, ${this.geom.hex2_opacity})`;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(b, 0); ctx.lineTo(0, -a);
            ctx.closePath(); ctx.fill();
            
            // Square on c
            ctx.save();
            ctx.translate(0, -a);
            const ang = Math.atan2(a, b);
            ctx.rotate(-ang); // wait, align with hypotenuse
            
            // Draw c^2
            ctx.fillStyle = `rgba(253, 203, 110, ${this.geom.hex2_opacity * 0.8})`;
            ctx.fillRect(0, -c, c, c);
            
            // Draw Bottom Triangle matching ABC on c^2
            ctx.fillStyle = `rgba(223, 230, 233, ${this.geom.hex2_opacity})`;
            ctx.beginPath();
            // In rotated space, hypotenuse is x=0 to c, y=0.
            // Triangle attached to top x=0 to c, y=-c?
            ctx.moveTo(0, -c); ctx.lineTo(c, -c);
            // Height is a*b/c
            const alt = a*b/c;
            const tx = b*b/c; // projection
            ctx.lineTo(tx, -c - alt);
            ctx.closePath(); ctx.fill();
            
            // Outline of Hexagon 2
            ctx.strokeStyle = `rgba(45, 52, 54, ${this.geom.hex2_opacity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0,0); ctx.lineTo(c,0); ctx.lineTo(c, -c);
            ctx.lineTo(tx, -c - alt);
            ctx.lineTo(0, -c); ctx.closePath();
            ctx.stroke();

            ctx.restore();

            if (this.geom.line_opacity > 0) {
                // Line mapping to Hex1 splitting line
                ctx.strokeStyle = `rgba(214, 48, 49, ${this.geom.line_opacity})`;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(0, -a); ctx.lineTo(b, 0); 
                ctx.stroke();
                ctx.setLineDash([]);
            }

            ctx.restore();
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
