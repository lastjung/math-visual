/**
 * LIGHT FLOW LAB: Renderer Module
 * Handles canvas drawing and visual representation
 */
import { Physics } from './physics.js';

export const Renderer = {
    paintCanvas: null,
    paintCtx: null,

    /**
     * Draw coordinate axes with labels and arrows
     */
    drawAxes(ctx, centerX, centerY, size) {
        const axisLen = size * 1.5;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // X-Axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(centerX - axisLen, centerY);
        ctx.lineTo(centerX + axisLen, centerY);
        ctx.stroke();
        
        // Y-Axis
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - axisLen);
        ctx.lineTo(centerX, centerY + axisLen);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '10px Inter';
        
        // Labels
        ctx.fillText('X', centerX + axisLen - 10, centerY - 5);
        ctx.fillText('Y (+)', centerX + 5, centerY + axisLen - 5);
        ctx.fillText('Y (-)', centerX + 5, centerY - axisLen + 15);
        
        // Arrows
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath(); ctx.moveTo(centerX + axisLen, centerY); ctx.lineTo(centerX + axisLen - 5, centerY - 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(centerX + axisLen, centerY); ctx.lineTo(centerX + axisLen - 5, centerY + 3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(centerX, centerY + axisLen); ctx.lineTo(centerX - 3, centerY + axisLen - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(centerX, centerY + axisLen); ctx.lineTo(centerX + 3, centerY + axisLen - 5); ctx.stroke();

        ctx.restore();
    },

    /**
     * Main draw call: Renders the entire simulation frame
     */
    draw(state) {
        const { ctx, canvas, shape, rayNumber, sourcePos, sourceRotation, isLightVisible, spread, flowOffset, beamWidth, growth, MAX_BOUNCES, colorMode, showAxes, baseStyle, flowMode, useTrail, useTaper, useBloom, alphaIntensity } = state;
        const w = canvas.width;
        const h = canvas.height;
        const centerX = w / 2;
        const centerY = h / 2 - 60; 
        const sizeMult = state.isWindowFull ? 0.45 : 0.35;
        const size = Math.min(w, h) * sizeMult;

        // --- 1. PREPARE CONTEXTS ---
        if (state.isPaintMode || state.isPaint2Mode || state.isLightMode) {
            if (!this.paintCanvas) {
                this.paintCanvas = document.createElement('canvas');
                this.paintCtx = this.paintCanvas.getContext('2d');
                // Immediate fill to prevent first-frame white flash
                this.paintCanvas.width = w;
                this.paintCanvas.height = h;
                this.paintCtx.fillStyle = '#050508';
                this.paintCtx.fillRect(0, 0, w, h);
            }
            if (this.paintCanvas.width !== w || this.paintCanvas.height !== h) {
                this.paintCanvas.width = w;
                this.paintCanvas.height = h;
                this.paintCtx.fillStyle = '#050508';
                this.paintCtx.fillRect(0, 0, w, h);
            }
        }

        const targetCtx = state.isPaintMode ? this.paintCtx : ctx;

        // --- 2. CLEAR (NORMAL MODE ONLY) ---
        if (!state.isPaintMode && !state.isPaint2Mode && !state.isLightMode) {
            if (useTrail) {
                ctx.fillStyle = 'rgba(5, 5, 8, 0.15)'; 
                ctx.fillRect(0, 0, w, h);
            } else {
                ctx.fillStyle = '#050508';
                ctx.fillRect(0, 0, w, h);
            }
        }

        // --- 3. DRAW UI/GUIDES (BEFORE RAYS IN NORMAL, SKIP IN PAINT BUFFER) ---
        // We draw UI on main 'ctx' so it's sharp and clean.
        // In Paint/Light mode, we draw this AFTER rays to keep it on top.
        // In Normal mode, we draw it BEFORE rays to allow the Bloom/Light to overlay nicely.
        if (!state.isPaintMode && !state.isPaint2Mode && !state.isLightMode) {
            this.drawUI(ctx, state, centerX, centerY, size);
        }

        // --- 4. DRAW RAYS ---
        // aimAngle is set to Math.PI/2 (90deg) so that 0 rotation points DOWN.
        const aimAngle = Math.PI / 2; 

        const workBudget = state.isWindowFull ? 8000 : 5200;
        let drawRayNumber = Math.max(1, Math.floor(rayNumber));
        let drawMaxBounces = Math.max(1, Math.floor(MAX_BOUNCES));
        if (drawRayNumber * drawMaxBounces > workBudget) {
            drawMaxBounces = Math.max(1, Math.floor(workBudget / drawRayNumber));
            if (drawRayNumber * drawMaxBounces > workBudget) {
                drawRayNumber = Math.max(1, Math.floor(workBudget / drawMaxBounces));
            }
        }

        const { min: pMin, max: pMax } = state.parallelRange;
        const maxTravel = Math.sqrt(w*w + h*h) * 1.2;
        const isNormalOrPaint1 = isLightVisible && !state.isPaint2Mode && !state.isLightMode;

        if (isNormalOrPaint1) {
            // Memory Optimization: Avoid Array.from and map every frame
            const rayPaths = [];
            for (let idx = 0; idx < drawRayNumber; idx++) {
                const t = idx / Math.max(1, drawRayNumber - 1);
                let sPos, angle;
                
                if (state.lightSourceMode === 'parallel' || shape === 'parabola') {
                    const d = pMin + t * (pMax - pMin);
                    const cosR = Math.cos(sourceRotation);
                    const sinR = Math.sin(sourceRotation);
                    sPos = { x: sourcePos.x + d * cosR, y: sourcePos.y + d * sinR }; 
                    angle = sourceRotation + Math.PI / 2;
                } else {
                    sPos = { x: sourcePos.x, y: sourcePos.y };
                    angle = aimAngle + sourceRotation + (t - 0.5) * spread;
                }

                let baseHue;
                if (colorMode === 'rainbow') baseHue = (t * 360 + flowOffset * 0.5) % 360;
                else if (colorMode === 'cyan') baseHue = 180 + Math.sin(t * 5 + flowOffset * 0.1) * 20;
                else if (colorMode === 'sunset') baseHue = 10 + Math.sin(t * 3 + flowOffset * 0.1) * 30;

                rayPaths.push({
                    rx: centerX + sPos.x,
                    ry: centerY + sPos.y,
                    ra: angle,
                    baseHue: baseHue,
                    accDist: 0,
                    active: true
                });
            }
            // PERFORMANCE: Move global style settings OUTSIDE the hot loop where possible
            targetCtx.save();
            targetCtx.globalCompositeOperation = state.isPaintMode ? 'source-over' : 'lighter';
            targetCtx.lineCap = 'round';
            if (flowMode === 'interval') {
                targetCtx.setLineDash([30, 20]);
                targetCtx.lineDashOffset = -flowOffset * 2;
            } else {
                targetCtx.setLineDash([]);
            }

            // MULTI-PASS DRAWING
            let firstRayActualBounces = 0;
            for (let b = 0; b < drawMaxBounces; b++) {
                for (let i = 0; i < rayPaths.length; i++) {
                    const ray = rayPaths[i];
                    if (!ray.active) continue;

                    const hit = Physics.findBoundaryIntersection(ray.rx - centerX, ray.ry - centerY, ray.ra, shape, size);
                    let nextX, nextY, segDist;
                    
                    if (!hit) {
                        segDist = maxTravel - ray.accDist;
                        nextX = ray.rx + Math.cos(ray.ra) * segDist;
                        nextY = ray.ry + Math.sin(ray.ra) * segDist;
                    } else {
                        nextX = centerX + hit.x;
                        nextY = centerY + hit.y;
                        segDist = Math.sqrt((nextX - ray.rx)**2 + (nextY - ray.ry)**2);
                    }

                    if (segDist < 0.1 || ray.accDist > growth) {
                        ray.active = false;
                        continue;
                    }
                    
                    let dX = nextX, dY = nextY, isLast = false;
                    if (ray.accDist + segDist > growth) {
                        const ratio = (growth - ray.accDist) / segDist;
                        dX = ray.rx + (nextX - ray.rx) * ratio; dY = ray.ry + (nextY - ray.ry) * ratio;
                        isLast = true;
                    }

                    let alpha;
                    if (state.isPaintMode) { 
                        alpha = 0.85; 
                    } else {
                        const alphaFloor = useTrail ? 0.03 : 0.12;
                        const alphaFromDensity = 5 / Math.max(1, drawRayNumber);
                        const bounceDecay = Math.pow(0.78, b);
                        alpha = Math.max(alphaFloor, alphaFromDensity) * bounceDecay;
                        if (b === 0) alpha *= 1.45;
                        if (!useTrail) alpha *= 1.35;
                        if (flowMode === 'pulse') {
                            const pulse = Math.sin((ray.accDist - flowOffset * 10) * 0.02) * 0.5 + 0.5;
                            alpha *= (0.2 + 0.8 * pulse);
                        }
                        alpha *= alphaIntensity;
                    }

                    alpha = Math.min(alpha, 0.95);
                    targetCtx.strokeStyle = `hsla(${ray.baseHue}, 100%, 60%, ${alpha})`;
                    targetCtx.fillStyle = `hsla(${ray.baseHue}, 100%, 60%, ${alpha})`;

                    let cw = beamWidth;
                    if (!useTrail) cw *= 1.35;
                    targetCtx.lineWidth = cw;

                    if (baseStyle === 'line') {
                        targetCtx.beginPath(); targetCtx.moveTo(ray.rx, ray.ry); targetCtx.lineTo(dX, dY); targetCtx.stroke();
                    } else if (baseStyle === 'particle') {
                        const step = Math.max(4, 8 / (state.isWindowFull ? 1 : 2)); // Dynamic step for resolution
                        const pathLen = Math.sqrt((dX - ray.rx)**2 + (dY - ray.ry)**2);
                        const dotCount = Math.min(Math.floor(pathLen / step), (hit ? 150 : 40));
                        const pSize = cw * 1.5;
                        for (let d = 0; d <= dotCount; d++) {
                            const ratio = dotCount === 0 ? 0 : d / dotCount;
                            targetCtx.fillRect(ray.rx + (dX - ray.rx) * ratio - pSize/2, ray.ry + (dY - ray.ry) * ratio - pSize/2, pSize, pSize);
                        }
                    } else if (baseStyle === 'ghost') {
                        targetCtx.beginPath(); targetCtx.moveTo(ray.rx, ray.ry); targetCtx.lineTo(dX, dY); targetCtx.stroke();
                        targetCtx.lineWidth = cw * 3; targetCtx.globalAlpha = alpha * 0.3; targetCtx.stroke(); targetCtx.globalAlpha = 1.0;
                    }

                    if (useBloom && hit && !isLast && !state.isPaintMode) {
                        const r = cw * 1.5; const ba = Math.min(1.0, alpha * 2.5);
                        targetCtx.beginPath(); targetCtx.arc(nextX, nextY, r * 4.5, 0, Math.PI * 2);
                        targetCtx.fillStyle = `hsla(${ray.baseHue}, 100%, 60%, ${ba * 0.15})`; targetCtx.fill();
                        targetCtx.beginPath(); targetCtx.arc(nextX, nextY, r * 2.0, 0, Math.PI * 2);
                        targetCtx.fillStyle = `hsla(${ray.baseHue}, 100%, 60%, ${ba * 0.4})`; targetCtx.fill();
                        targetCtx.beginPath(); targetCtx.arc(nextX, nextY, r, 0, Math.PI * 2);
                        targetCtx.fillStyle = `hsla(${ray.baseHue}, 100%, 80%, ${ba})`; targetCtx.fill();
                    }

                    if (!hit || isLast) {
                        ray.active = false;
                    } else {
                        ray.accDist += segDist;
                        ray.rx = nextX; ray.ry = nextY;
                        
                        // Physics.getNormal returns an INWARD pointing normal for ovals.
                        const normal = Physics.getNormal(hit.x, hit.y, shape, size);
                        const incomingX = Math.cos(ray.ra);
                        const incomingY = Math.sin(ray.ra);
                        const dot = incomingX * normal.x + incomingY * normal.y;
                        
                        const rx = incomingX - 2 * dot * normal.x;
                        const ry = incomingY - 2 * dot * normal.y;
                        ray.ra = Math.atan2(ry, rx);
                        
                        // Nudge slightly ALONG the inward normal to ensure the next segment starts inside
                        ray.rx += normal.x * 0.1; 
                        ray.ry += normal.y * 0.1;
                        
                        if (i === 0) firstRayActualBounces++;
                    }
                }
            }
            state.currentBounces = firstRayActualBounces;
            targetCtx.restore();
        }

        // --- 5. COMPOSITE PAINT/LIGHT & DRAW TOP UI ---
        if (state.isPaintMode || state.isPaint2Mode || state.isLightMode) {
            ctx.clearRect(0, 0, w, h);
            // Both Paint and Light use the paintCanvas buffer
            ctx.drawImage(this.paintCanvas, 0, 0);
            this.drawUI(ctx, state, centerX, centerY, size);
        }

        // --- 6. DRAW OVERLAY MESSAGE (ALWAYS LAST) ---
        if (state.overlayMessage) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fcd34d'; // Premium Yellow for Narratives

            if (Array.isArray(state.overlayMessage)) {
                // Multi-line support
                const mainText = state.overlayMessage[0];
                const subText = state.overlayMessage[1];

                // Main Title - Now uses the selected Narrative, smaller (26px) to prevent overflow
                ctx.font = '900 26px Inter';
                ctx.fillText(mainText, centerX, centerY - 20);

                // Sub Title - "Begin the Journey of Light", even smaller
                if (subText) {
                    ctx.font = '700 20px Inter';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.fillText(subText, centerX, centerY + 40);
                }
            } else {
                // Single line support - Also slightly smaller for safety
                ctx.font = '900 32px Inter';
                ctx.fillText(state.overlayMessage, centerX, centerY);
            }
            ctx.restore();
        }

        // --- 7. DRAW AUDIO VISUALIZER (NEW) ---
        this.drawVisualizer(ctx, w, h, state.musicVisTimer || 0, size);
    },

    /**
     * Procedural Contained Wave Visualizer
     * Animated by musicVisTimer (linked to audio playback)
     */
    drawVisualizer(ctx, w, h, t, size) {
        ctx.save();
        
        // 1. Box Layout (Matches Circle Width)
        const visWidth = size * 1.8;
        const visHeight = 44;
        const x = w / 2 - visWidth / 2;
        const y = h - 145; // Just above the bottom player
        const radius = 18;

        // 2. Clear visualizer area slightly for depth
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, visWidth, visHeight, radius);
        else ctx.rect(x, y, visWidth, visHeight);
        ctx.fillStyle = 'rgba(10, 10, 20, 0.4)';
        ctx.fill();
        
        // Shadow/Glow behind the box
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(6, 182, 210, 0.15)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // 3. Clip Waves to Box
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, visWidth, visHeight, radius);
        else ctx.rect(x, y, visWidth, visHeight);
        ctx.clip();

        const baseY = y + visHeight / 2;
        ctx.globalCompositeOperation = 'screen';
        
        // Background Shimmer Particles
        const partCount = 12;
        for (let p = 0; p < partCount; p++) {
            const px = x + ((p * 77 + t * 50) % visWidth);
            const py = baseY + Math.sin(t * 3 + p) * 10;
            const pSize = 1.5 + Math.sin(t * 5 + p) * 1;
            ctx.fillStyle = `rgba(34, 211, 238, ${0.1 + Math.sin(t * 2 + p) * 0.1})`;
            ctx.beginPath(); ctx.arc(px, py, pSize, 0, Math.PI * 2); ctx.fill();
        }

        const waveCount = 3;
        for (let i = 0; i < waveCount; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            
            // Vibrant Cyan/Mint colors with varied opacity
            const alpha = 0.2 + (i * 0.15);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            
            const freq = 0.03 + (i * 0.01);
            const amp = 8 + (i * 6);
            const speed = 3.5 + (i * 1.8);
            const offset = i * Math.PI * 0.6;

            // Amplitude pulsing for vibration effect (only active if t > 0)
            const pulsingAmp = amp * (0.8 + Math.sin(t * 10 + i) * 0.2);

            for (let px = x - 10; px <= x + visWidth + 10; px += 3) {
                // Wave formula: Multi-frequency sine waves
                const wave = Math.sin((px - x) * freq + t * speed + offset) * 0.7 +
                             Math.sin((px - x) * freq * 2.2 - t * speed * 0.7) * 0.3;
                
                // Add micro-vibration jitter
                const jitter = Math.sin(t * 40 + px * 0.3) * (t > 0 ? 1.2 : 0);
                
                const py = baseY + wave * pulsingAmp + jitter;
                
                if (px === x - 10) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            
            // Subtle glow along the wave
            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.3})`;
            ctx.stroke();
        }
        
        ctx.restore();
        ctx.restore();
    },

    /**
     * Shared UI drawing logic to ensure consistency
     */
    drawUI(ctx, state, centerX, centerY, size) {
        if (state.showAxes) this.drawAxes(ctx, centerX, centerY, size);

        // Boundary Guide
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        const steps = state.shape === 'parabola' ? 200 : 360;
        for (let i = 0; i <= steps; i++) {
            const rad = (i * Math.PI * 2) / steps;
            let p = Physics.getShapePoint(rad, state.shape, size);
            if (i === 0) ctx.moveTo(centerX + p.x, centerY + p.y); 
            else ctx.lineTo(centerX + p.x, centerY + p.y);
        }
        ctx.stroke();
        ctx.restore();

        // Oval Foci
        if (state.shape === 'ellipse' || state.shape === 'v-oval') {
            const isVert = state.shape === 'v-oval';
            const a = isVert ? 1.1 * size : 1.1 * size;
            const b = isVert ? 0.9 * size : 0.66 * size;
            const fDist = Math.sqrt(Math.abs(a*a - b*b));
            
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 1;
            const spots = isVert ? [{x:0, y:-fDist}, {x:0, y:fDist}] : [{x:-fDist, y:0}, {x:fDist, y:0}];
            
            spots.forEach(f => {
                const fx = centerX + f.x; const fy = centerY + f.y;
                ctx.beginPath(); ctx.moveTo(fx - 5, fy); ctx.lineTo(fx + 5, fy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(fx, fy - 5); ctx.lineTo(fx, fy + 5); ctx.stroke();
            });
            ctx.restore();
        }

        // Light Source Guide
        const sX = centerX + state.sourcePos.x;
        const sY = centerY + state.sourcePos.y;
        ctx.save();
        ctx.beginPath(); ctx.arc(sX, sY, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fill();
        ctx.beginPath(); ctx.arc(sX, sY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.restore();
    },

    clearPaint() {
        if (this.paintCtx) {
            this.paintCtx.fillStyle = '#050508';
            this.paintCtx.fillRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
        }
        if (window.LightDensityModule) window.LightDensityModule.clear();
    },

    /**
     * Helper: Convert Hue to RGB Energy
     */
    hueToRgbEnergy(h) {
        h = (h % 360) / 360;
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const q = 1 - f;
        const t = f;
        switch (i % 6) {
            case 0: r = 1; g = t; b = 0; break;
            case 1: r = q; g = 1; b = 0; break;
            case 2: r = 0; g = 1; b = t; break;
            case 3: r = 0; g = q; b = 1; break;
            case 4: r = t; g = 0; b = 1; break;
            case 5: r = 1; g = 0; b = q; break;
        }
        return { r, g, b };
    },

    /**
     * Draw the physical light density (Sharp Vector Mode)
     * "Suppress originals, boost remote": Normalizes intensity based on local density and distance.
     */
    drawLight(state, segments) {
        if (!this.paintCanvas) return;
        const ctx = this.paintCtx;
        const centerX = state.canvas.width / 2;
        const centerY = state.canvas.height / 2 - 60;
        
        const LightDensity = window.LightDensityModule;
        if (!LightDensity) return;

        const rayCount = state.rayNumber || 100;

        ctx.save();
        // Use 'source-over' with 1/N blending to preserve colors
        ctx.globalCompositeOperation = 'source-over'; 
        ctx.lineCap = 'butt'; // Sharp edges for a more "light beam" look
        
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            
            // 1. DENSITY CHECK: Prevents self-dimming while allowing cross-over sum
            let density = 1;
            if (seg.isSource || seg.isHit) {
                density = LightDensity.addDensity(centerX + seg.x1, centerY + seg.y1);
            } else {
                density = LightDensity.getDensity(centerX + seg.x1, centerY + seg.y1);
            }
            
            // 2. VIBRANT COLOR MODEL: Use 50% lightness for pure ROYGBIV
            // 1/N blend: Newer photons average with older ones
            const userPower = state.alphaIntensity || 1.0;
            const alpha = (1.0 / density) * userPower;
            
            // 3. "Remote as New": Boost far rays to keep the simulation "alive" at edges
            const dist = seg.accDist || 0;
            const spread = Math.max(0.01, state.spread);
            const remoteBoost = (1.0 + (dist * spread * 0.1));
            
            const finalAlpha = Math.min(1.0, alpha * remoteBoost);
            
            // PHYSICAL LIGHT BEAM: Center is brighter, edges are colored
            // Main Beam
            ctx.strokeStyle = `hsla(${seg.hue}, 100%, 50%, ${finalAlpha})`;
            ctx.lineWidth = state.beamWidth * 0.8; // Thinner for "Light" vs "Paint"
            
            ctx.beginPath();
            ctx.moveTo(centerX + seg.x1, centerY + seg.y1);
            ctx.lineTo(centerX + seg.x2, centerY + seg.y2);
            ctx.stroke();
            
            // Photon Glow (Bloom)
            if (state.useBloom) {
                ctx.strokeStyle = `hsla(${seg.hue}, 100%, 70%, ${finalAlpha * 0.3})`;
                ctx.lineWidth = state.beamWidth * 2.5;
                ctx.beginPath();
                ctx.moveTo(centerX + seg.x1, centerY + seg.y1);
                ctx.lineTo(centerX + seg.x2, centerY + seg.y2);
                ctx.stroke();
            }
            
            // Impact Point Spark
            if (state.useBloom && seg.isHit) {
                const r = state.beamWidth * 2.0;
                const sparkA = Math.min(0.9, finalAlpha * 5.0);
                ctx.fillStyle = `hsla(${seg.hue}, 100%, 80%, ${sparkA})`;
                ctx.beginPath(); ctx.arc(centerX + seg.x2, centerY + seg.y2, r, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    },

    /**
     * Draw incremental segments for Paint 2 mode
     */
    drawPaint2Segments(state, segments) {
        if (!this.paintCanvas) return;
        const ctx = this.paintCtx;
        const w = state.canvas.width;
        const h = state.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2 - 60;
        
        ctx.save();
        ctx.globalCompositeOperation = 'source-over'; // Fixed: Pure overwrite mode
        ctx.lineCap = 'round';
        
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            // Alpha fixed to 0.95 as requested, multiplied by state.alphaIntensity slider
            const alpha = 0.95 * state.alphaIntensity;
            
            ctx.strokeStyle = `hsla(${seg.hue}, 100%, 60%, ${alpha})`;
            ctx.lineWidth = state.beamWidth;
            
            ctx.beginPath();
            ctx.moveTo(centerX + seg.x1, centerY + seg.y1);
            ctx.lineTo(centerX + seg.x2, centerY + seg.y2);
            ctx.stroke();
            
            if (state.useBloom && seg.isHit) {
                const r = state.beamWidth * 1.5;
                const ba = Math.min(1.0, alpha * 2.5);
                ctx.fillStyle = `hsla(${seg.hue}, 100%, 60%, ${ba * 0.15})`;
                ctx.beginPath(); ctx.arc(centerX + seg.x2, centerY + seg.y2, r * 4.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = `hsla(${seg.hue}, 100%, 80%, ${ba})`;
                ctx.beginPath(); ctx.arc(centerX + seg.x2, centerY + seg.y2, r, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
    }
};
