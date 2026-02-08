/**
 * DamageRollsCase
 * Probability Distribution Visualization based on Red Blob Games
 */
const DamageRollsCase = {
    canvas: null,
    ctx: null,
    
    // Config (NdS)
    numDice: 3,
    numSides: 6,
    modifier: 0,
    
    // Modes
    // 'sum' (NdS), 'max' (best of 2), 'min' (worst of 2), 'dropLowest' (4d6 drop lowest), 'critical'
    mode: 'sum',
    numSamples: 10000,
    
    // Data
    distribution: {}, // key: total, value: count
    maxCount: 0,
    minVal: 0,
    maxVal: 0,
    average: 0,

    init() {
        this.canvas = document.getElementById('mathCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.calculateDistribution();
        this.resize();
        this.draw();
    },

    get uiConfig() {
        return [
            { 
                type: 'slider', id: 'dr_num_dice', label: 'Number of Dice (N)', 
                min: 1, max: 10, step: 1, value: this.numDice,
                onChange: (v) => { this.numDice = v; this.calculateDistribution(); this.draw(); }
            },
            { 
                type: 'slider', id: 'dr_num_sides', label: 'Dice Sides (S)', 
                min: 2, max: 20, step: 1, value: this.numSides,
                onChange: (v) => { this.numSides = v; this.calculateDistribution(); this.draw(); }
            },
            { 
                type: 'slider', id: 'dr_modifier', label: 'Modifier (+K)', 
                min: -10, max: 10, step: 1, value: this.modifier,
                onChange: (v) => { this.modifier = v; this.calculateDistribution(); this.draw(); }
            },
            {
                type: 'select', id: 'dr_mode', label: 'Rolling Mode',
                options: [
                    { label: 'Normal (Sum)', value: 'sum' },
                    { label: 'Advantage (Max 2)', value: 'max' },
                    { label: 'Disadvantage (Min 2)', value: 'min' },
                    { label: '4d6 Drop Lowest', value: 'dropLowest' },
                    { label: 'Critical (50% chance)', value: 'critical' }
                ],
                value: this.mode,
                onChange: (v) => { this.mode = v; this.calculateDistribution(); this.draw(); }
            }
        ];
    },

    // --- Logic ---

    rollDie(s) {
        return Math.floor(Math.random() * s) + 1;
    },

    sample() {
        let total = 0;
        
        switch (this.mode) {
            case 'sum':
                for (let i = 0; i < this.numDice; i++) total += this.rollDie(this.numSides);
                break;
                
            case 'max':
                // roll twice NdS, pick better
                let r1 = 0, r2 = 0;
                for (let i = 0; i < this.numDice; i++) {
                    r1 += this.rollDie(this.numSides);
                    r2 += this.rollDie(this.numSides);
                }
                total = Math.max(r1, r2);
                break;
                
            case 'min':
                let m1 = 0, m2 = 0;
                for (let i = 0; i < this.numDice; i++) {
                    m1 += this.rollDie(this.numSides);
                    m2 += this.rollDie(this.numSides);
                }
                total = Math.min(m1, m2);
                break;
                
            case 'dropLowest':
                // Special: Roll N+1, drop lowest 1
                const rolls = [];
                for (let i = 0; i < this.numDice + 1; i++) {
                    rolls.push(this.rollDie(this.numSides));
                }
                rolls.sort((a, b) => a - b);
                rolls.shift(); // remove lowest
                total = rolls.reduce((a, b) => a + b, 0);
                break;
                
            case 'critical':
                for (let i = 0; i < this.numDice; i++) total += this.rollDie(this.numSides);
                if (Math.random() < 0.5) { // 50% crit for visual emphasis
                    for (let i = 0; i < this.numDice; i++) total += this.rollDie(this.numSides);
                }
                break;
        }
        
        return total + this.modifier;
    },

    calculateDistribution() {
        this.distribution = {};
        this.maxCount = 0;
        let sum = 0;
        
        // Use sampling to generate distribution
        for (let i = 0; i < this.numSamples; i++) {
            const val = this.sample();
            this.distribution[val] = (this.distribution[val] || 0) + 1;
            sum += val;
        }
        
        const keys = Object.keys(this.distribution).map(Number);
        if (keys.length === 0) return;
        this.minVal = Math.min(...keys);
        this.maxVal = Math.max(...keys);
        this.maxCount = Math.max(...Object.values(this.distribution));
        this.average = sum / this.numSamples;
    },

    // --- Rendering ---

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    },

    draw() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, w, h);
        
        const padding = 60;
        const chartW = w - padding * 2;
        const chartH = h - padding * 3;
        
        // Draw Axis
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, h - padding);
        ctx.lineTo(w - padding, h - padding); // X
        ctx.moveTo(padding, h - padding);
        ctx.lineTo(padding, padding); // Y
        ctx.stroke();

        const range = this.maxVal - this.minVal || 1;
        const numBars = range + 1;
        const barW = (chartW / numBars) * 0.8;
        const stepX = chartW / numBars;

        // Draw Bars
        for (let i = 0; i < numBars; i++) {
            const val = this.minVal + i;
            const count = this.distribution[val] || 0;
            const barH = (count / this.maxCount) * chartH;
            
            const x = padding + i * stepX + (stepX - barW) / 2;
            const y = h - padding - barH;
            
            // Gradient
            const grad = ctx.createLinearGradient(x, y, x, h - padding);
            grad.addColorStop(0, '#00ff88');
            grad.addColorStop(1, '#006644');
            
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barW, barH);
            
            // Labels (X)
            if (numBars < 30 || i % 5 === 0 || val === this.minVal || val === this.maxVal) {
                ctx.fillStyle = '#aaa';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(val, x + barW/2, h - padding + 20);
            }
        }
        
        // Info Overlay
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`Mode: ${this.mode.toUpperCase()}`, padding + 20, padding + 30);
        ctx.fillText(`Avg Damage: ${this.average.toFixed(2)}`, padding + 20, padding + 55);
        ctx.fillText(`Range: ${this.minVal} - ${this.maxVal}`, padding + 20, padding + 80);
        
        // Draw Average Line
        const avgX = padding + ((this.average - this.minVal) / range) * chartW;
        ctx.strokeStyle = '#ff3366';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(avgX, padding);
        ctx.lineTo(avgX, h - padding);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#ff3366';
        ctx.fillText('Average', avgX + 5, padding + 15);
    },

    destroy() {
        // Cleanup if needed
    }
};
