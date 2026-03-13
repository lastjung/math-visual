/**
 * LIGHT FLOW LAB: Renderer Module
 * Handles canvas drawing and visual representation
 */
import { Physics } from './physics.js';

export const Renderer = {
    paintCanvas1: null,
    paintCtx1: null,
    paintCanvas2: null,
    paintCtx2: null,
    
    /**
     * computeBaseAlpha: Shared logic to determine brightness of a ray segment (Used by Normal Mode)
     */
    computeBaseAlpha(state, ray, b, drawRayNumber) {
        const { useTrail, flowMode, flowOffset, alphaIntensity } = state;
        const alphaFloor = useTrail ? 0.03 : 0.12;
        const alphaFromDensity = 5 / Math.max(1, drawRayNumber);
        const bounceDecay = Math.pow(0.78, b);
        let alpha = Math.max(alphaFloor, alphaFromDensity) * bounceDecay;
        if (b === 0) alpha *= 1.45;
        if (!useTrail) alpha *= 1.35;
        if (flowMode === 'pulse') {
            const pulse = Math.sin((ray.accDist - flowOffset * 10) * 0.02) * 0.5 + 0.5;
            alpha *= (0.2 + 0.8 * pulse);
        }
        alpha *= alphaIntensity;
        return Math.min(alpha, 0.95);
    },

    /**
     * computeDensityFactor: Translates physical density grid into brightness modulation
     */
    computeDensityFactor(density) {
        // Continuous Proportional Correction (Normalization)
        // Aim for a target stable density. Stabilizes regardless of ray count.
        const TARGET_D = 4.5; 
        const DAMPING = 1.1;
        return (TARGET_D + DAMPING) / (density + DAMPING);
    },

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
        if (state.isPaintMode) {
            if (!this.paintCanvas1) {
                this.paintCanvas1 = document.createElement('canvas');
                this.paintCtx1 = this.paintCanvas1.getContext('2d');
                this.paintCanvas1.width = w;
                this.paintCanvas1.height = h;
            }
            if (this.paintCanvas1.width !== w || this.paintCanvas1.height !== h) {
                this.paintCanvas1.width = w;
                this.paintCanvas1.height = h;
            }
            // Paint 1 (isPaintMode) is for real-time auto-modes: Clear every frame
            this.paintCtx1.fillStyle = '#050508';
            this.paintCtx1.fillRect(0, 0, w, h);
        }

        if (state.isPaint2Mode) {
            if (!this.paintCanvas2) {
                this.paintCanvas2 = document.createElement('canvas');
                this.paintCtx2 = this.paintCanvas2.getContext('2d');
                this.paintCanvas2.width = w;
                this.paintCanvas2.height = h;
                this.paintCtx2.fillStyle = '#050508';
                this.paintCtx2.fillRect(0, 0, w, h);
            }
            if (this.paintCanvas2.width !== w || this.paintCanvas2.height !== h) {
                this.paintCanvas2.width = w;
                this.paintCanvas2.height = h;
                this.paintCtx2.fillStyle = '#050508';
                this.paintCtx2.fillRect(0, 0, w, h);
            }
        }

        const targetCtx = state.isPaintMode ? this.paintCtx1 : (state.isPaint2Mode ? this.paintCtx2 : ctx);

        // --- 2. CLEAR (NORMAL/LIGHT MODES) ---
        if (!state.isPaintMode && !state.isPaint2Mode) {
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
        if (!state.isPaintMode && !state.isPaint2Mode) {
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
        const isNormalOrPaint1 = state.isLightVisible && !state.isPaint2Mode && !state.isLightMode;
        const isLightEffect = state.isLightVisible && state.isLightMode;

        if (isNormalOrPaint1) {
            // Memory Optimization: Avoid Array.from and map every frame
            const rayPaths = [];
            for (let idx = 0; idx < drawRayNumber; idx++) {
                const t = idx / Math.max(1, drawRayNumber - 1);
                let sPos, angle;
                
                if (state.lightSourceMode === 'parallel') {
                    const d = pMin + t * (pMax - pMin);
                    const cosR = Math.cos(sourceRotation);
                    const sinR = Math.sin(sourceRotation);
                    sPos = { x: sourcePos.x + d * cosR, y: sourcePos.y + d * sinR }; 
                    angle = sourceRotation + Math.PI / 2;
                } else if (state.lightSourceMode === 'converge') {
                    const targetPos = sourcePos;
                    const baseAngle = aimAngle + sourceRotation + (t - 0.5) * spread;
                    const hit = Physics.getConvergeLaunchPoint(targetPos, baseAngle, shape, size);
                    if (hit) {
                        sPos = { x: hit.x, y: hit.y };
                        angle = baseAngle + Math.PI; // Point back to center
                    } else {
                        sPos = { x: targetPos.x, y: targetPos.y };
                        angle = baseAngle;
                    }
                } else {
                    sPos = { x: sourcePos.x, y: sourcePos.y };
                    angle = aimAngle + sourceRotation + (t - 0.5) * spread;
                }

                sPos = Physics.offsetRayStart(sPos, angle, size);

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

                    const wasInside = Physics.isInside(ray.rx - centerX, ray.ry - centerY, shape, size);
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
                        
                        const normal = Physics.getNormal(hit.x, hit.y, shape, size);
                        const incomingX = Math.cos(ray.ra);
                        const incomingY = Math.sin(ray.ra);
                        const reflected = Physics.reflect(incomingX, incomingY, normal);
                        const rx = reflected.x;
                        const ry = reflected.y;
                        ray.ra = Math.atan2(ry, rx);

                        const nudged = Physics.nudgeAfterHit(hit.x, hit.y, normal, wasInside);
                        ray.rx = centerX + nudged.x;
                        ray.ry = centerY + nudged.y;
                        
                        if (i === 0) firstRayActualBounces++;
                    }
                }
            }
            state.currentBounces = firstRayActualBounces;
            targetCtx.restore();
        }

        if (isLightEffect) {
            const LD = window.LightDensityModule;
            const TARGET_D = 15.0;            // Calibrated for high energy (50)
            const DAMPING = 1.5;             // Softens the curve for organic response
            const DEPOSIT = 1.8;             // Stronger footprint for the intense beam

            const rayPaths = [];
            for (let idx = 0; idx < drawRayNumber; idx++) {
                const t = idx / Math.max(1, drawRayNumber - 1);
                let sPos, angle;
                if (state.lightSourceMode === 'parallel') {
                    const d = pMin + t * (pMax - pMin);
                    const cosR = Math.cos(sourceRotation); const sinR = Math.sin(sourceRotation);
                    sPos = { x: sourcePos.x + d * cosR, y: sourcePos.y + d * sinR }; 
                    angle = sourceRotation + Math.PI / 2;
                } else if (state.lightSourceMode === 'converge') {
                    const targetPos = sourcePos;
                    const baseAngle = aimAngle + sourceRotation + (t - 0.5) * spread;
                    const hit = Physics.getConvergeLaunchPoint(targetPos, baseAngle, shape, size);
                    if (hit) {
                        sPos = { x: hit.x, y: hit.y };
                        angle = baseAngle + Math.PI;
                    } else {
                        sPos = { x: targetPos.x, y: targetPos.y };
                        angle = baseAngle;
                    }
                } else {
                    sPos = { x: sourcePos.x, y: sourcePos.y };
                    angle = aimAngle + sourceRotation + (t - 0.5) * spread;
                }
                sPos = Physics.offsetRayStart(sPos, angle, size);
                let baseHue;
                if (colorMode === 'rainbow') baseHue = (t * 360 + flowOffset * 0.5) % 360;
                else if (colorMode === 'cyan') baseHue = 180 + Math.sin(t * 5 + flowOffset * 0.1) * 20;
                else if (colorMode === 'sunset') baseHue = 10 + Math.sin(t * 3 + flowOffset * 0.1) * 30;

                rayPaths.push({ rx: centerX + sPos.x, ry: centerY + sPos.y, ra: angle, baseHue: baseHue, accDist: 0, active: true });
            }

            ctx.save();
            // STEP 1: Temp Sync with Normal Mode (source-over instead of lighter)
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineCap = 'round';
            
            let firstRayActualBounces = 0;
            for (let b = 0; b < drawMaxBounces; b++) {
                for (let i = 0; i < rayPaths.length; i++) {
                    const ray = rayPaths[i]; if (!ray.active) continue;
                    const wasInside = Physics.isInside(ray.rx - centerX, ray.ry - centerY, shape, size);
                    const hit = Physics.findBoundaryIntersection(ray.rx - centerX, ray.ry - centerY, ray.ra, shape, size);
                    let nx, ny, sd;
                    if (!hit) { sd = maxTravel - ray.accDist; nx = ray.rx + Math.cos(ray.ra) * sd; ny = ray.ry + Math.sin(ray.ra) * sd; } 
                    else { nx = centerX + hit.x; ny = centerY + hit.y; sd = Math.sqrt((nx - ray.rx)**2 + (ny - ray.ry)**2); }

                    if (sd < 0.1 || ray.accDist > growth) { ray.active = false; continue; }
                    let dX = nx, dY = ny, isLast = false;
                    if (ray.accDist + sd > growth) { const r = (growth - ray.accDist) / sd; dX = ray.rx + (nx - ray.rx) * r; dY = ray.ry + (ny - ray.ry) * r; isLast = true; }

                    // --- [LIGHT MODE ONLY: HEAD DECAY SYSTEM] ---
                    // Energy is strongest at the tail (source) and decays spatially towards the head.
                    const baseEnergy = 1.35; 
                    const spatialDecay = Math.pow(0.9983, ray.accDist); // Spatial decay factor
                    let alpha = baseEnergy * spatialDecay * state.alphaIntensity;

                    // STEP 2: Record Energy Density (Internal calculation active via LD.recordDensityAlongLine below)
                    // STEP 3: Fixed Alpha to match Normal Mode look (0.18)
                    const finalAlpha = 0.18;

                    // 3. Draw Pure Straight Stroke
                    ctx.strokeStyle = `hsla(${ray.baseHue}, 100%, 45%, ${finalAlpha})`;
                    ctx.lineWidth = beamWidth;
                    ctx.beginPath(); ctx.moveTo(ray.rx, ray.ry); ctx.lineTo(dX, dY); ctx.stroke();

                    // 4. Record Trace
                    if (LD) LD.recordDensityAlongLine(ray.rx, ray.ry, dX, dY, DEPOSIT);

                    if (!hit || isLast) { ray.active = false; } 
                    else {
                        ray.accDist += sd; ray.rx = nx; ray.ry = ny;
                        const normal = Physics.getNormal(hit.x, hit.y, shape, size);
                        const inX = Math.cos(ray.ra);
                        const inY = Math.sin(ray.ra);
                        const reflected = Physics.reflect(inX, inY, normal);
                        ray.ra = Math.atan2(reflected.y, reflected.x);
                        const nudged = Physics.nudgeAfterHit(hit.x, hit.y, normal, wasInside);
                        ray.rx = centerX + nudged.x;
                        ray.ry = centerY + nudged.y;
                        if (i === 0) firstRayActualBounces++;
                    }
                }
            }
            state.currentBounces = firstRayActualBounces;
            ctx.restore();
        }

        // --- 5. COMPOSITE PAINT (ONLY) & DRAW TOP UI ---
        if (state.isPaintMode || state.isPaint2Mode) { 
            ctx.clearRect(0, 0, w, h);
            const targetCanvas = state.isPaintMode ? this.paintCanvas1 : this.paintCanvas2;
            if (targetCanvas) ctx.drawImage(targetCanvas, 0, 0);
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
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        if (state.shape === 'vv-oval' && state.showAxes) {
            ctx.beginPath();
            ctx.ellipse(
                centerX,
                centerY,
                size * Physics.VV_OVAL_OUTER.rx,
                size * Physics.VV_OVAL_OUTER.ry,
                0,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(190, 196, 204, 0.5)';
            ctx.shadowColor = 'rgba(190, 196, 204, 0.18)';
            ctx.ellipse(
                centerX,
                centerY,
                size * Physics.VV_OVAL_INNER.rx,
                size * Physics.VV_OVAL_INNER.ry,
                0,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        } else if (state.shape !== 'vv-oval') {
            ctx.beginPath();
            const steps = state.shape === 'parabola' ? 200 : 360;
            for (let i = 0; i <= steps; i++) {
                const rad = (i * Math.PI * 2) / steps;
                let p = Physics.getShapePoint(rad, state.shape, size);
                if (i === 0) ctx.moveTo(centerX + p.x, centerY + p.y); 
                else ctx.lineTo(centerX + p.x, centerY + p.y);
            }
            ctx.stroke();
        }
        ctx.restore();

        // Oval Foci (Visible only when AXES is ON)
        if (state.showAxes && (state.shape === 'ellipse' || state.shape === 'v-oval' || state.shape === 'vv-oval')) {
            const isVert = state.shape === 'v-oval' || state.shape === 'vv-oval';
            const rx = state.shape === 'ellipse' ? 1.1 : Physics.VV_OVAL_OUTER.rx;
            const ry = state.shape === 'ellipse' ? 0.66 : Physics.VV_OVAL_OUTER.ry;
            const major = Math.max(rx, ry) * size;
            const minor = Math.min(rx, ry) * size;
            const fDist = Math.sqrt(Math.abs(major * major - minor * minor));
            
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

        // 1. Parallel handles and guide lines (Visible only when AXES is ON)
        if (state.showAxes && state.lightSourceMode === 'parallel') {
            ctx.save();
            const cosR = Math.cos(state.sourceRotation);
            const sinR = Math.sin(state.sourceRotation);
            const { min, max } = state.parallelRange;
            
            const h1 = { x: sX + min * cosR, y: sY + min * sinR };
            const h2 = { x: sX + max * cosR, y: sY + max * sinR };
            
            // Draw connecting line
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.moveTo(h1.x, h1.y);
            ctx.lineTo(h2.x, h2.y);
            ctx.stroke();
            
            // Draw endpoint handles
            ctx.setLineDash([]);
            [h1, h2].forEach((h, i) => {
                ctx.beginPath();
                ctx.arc(h.x, h.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(h.x, h.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            });
            ctx.restore();
        }

        // 2. Main Light Source Dot (ALWAYS VISIBLE)
        ctx.save();
        ctx.beginPath(); ctx.arc(sX, sY, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fill();
        ctx.beginPath(); ctx.arc(sX, sY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.restore();

        // 3. Additional Guides (Foci, etc. - respect showAxes)
        if (state.showAxes && (state.shape === 'ellipse' || state.shape === 'v-oval' || state.shape === 'vv-oval')) {
            // (Foci drawing logic is already above, this is just for structure clarity if needed)
        }
    },

    clearPaint() {
        if (this.paintCtx1) {
            this.paintCtx1.fillStyle = '#050508';
            this.paintCtx1.fillRect(0, 0, this.paintCanvas1.width, this.paintCanvas1.height);
        }
        if (this.paintCtx2) {
            this.paintCtx2.fillStyle = '#050508';
            this.paintCtx2.fillRect(0, 0, this.paintCanvas2.width, this.paintCanvas2.height);
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
     * Draw incremental segments for Paint 2 mode
     */
    drawPaint2Segments(state, segments) {
        if (!this.paintCanvas2) return;
        const ctx = this.paintCtx2;
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
