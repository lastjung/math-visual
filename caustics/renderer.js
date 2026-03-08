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
        const size = Math.min(w, h) * 0.35;

        // --- 1. PREPARE CONTEXTS ---
        if (state.isPaintMode) {
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
        if (!state.isPaintMode) {
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
        // In Paint mode, we draw this AFTER rays to keep it on top.
        // In Normal mode, we draw it BEFORE rays to allow the Bloom/Light to overlay nicely.
        if (!state.isPaintMode) {
            this.drawUI(ctx, state, centerX, centerY, size);
        }

        // --- 4. DRAW RAYS ---
        const aimAngle = (state.lightSourceMode === 'parallel' || shape === 'parabola')
            ? Math.PI / 2 
            : Math.atan2(-sourcePos.y, -sourcePos.x);

        const workBudget = baseStyle === 'particle' ? 1200 : 2600;
        let drawRayNumber = Math.max(1, Math.floor(rayNumber));
        let drawMaxBounces = Math.max(1, Math.floor(MAX_BOUNCES));
        if (drawRayNumber * drawMaxBounces > workBudget) {
            drawMaxBounces = Math.max(1, Math.floor(workBudget / drawRayNumber));
            if (drawRayNumber * drawMaxBounces > workBudget) {
                drawRayNumber = Math.max(1, Math.floor(workBudget / drawMaxBounces));
            }
        }

        const { min: pMin, max: pMax } = state.parallelRange;

        for (let i = 0; i < drawRayNumber; i++) {
            const t = i / Math.max(1, drawRayNumber - 1);
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

            if (!isLightVisible) continue;

            let baseHue;
            if (colorMode === 'cyan') baseHue = 185;
            else if (colorMode === 'rainbow') baseHue = t * 300;
            else baseHue = 20 + t * 40;

            targetCtx.save();
            targetCtx.globalCompositeOperation = state.isPaintMode ? 'source-over' : 'lighter';
            targetCtx.lineCap = 'round';
            if (flowMode === 'interval') {
                targetCtx.setLineDash([30, 20]);
                targetCtx.lineDashOffset = -flowOffset * 2;
            } else {
                targetCtx.setLineDash([]);
            }

            let rx = centerX + sPos.x;
            let ry = centerY + sPos.y;
            let ra = angle;
            let accDist = 0;
            const maxTravel = Math.sqrt(w*w + h*h) * 1.2;

            for (let b = 0; b < drawMaxBounces; b++) {
                const hit = Physics.findBoundaryIntersection(rx - centerX, ry - centerY, ra, shape, size);
                let nextX, nextY, segDist;
                
                if (!hit) {
                    segDist = maxTravel - accDist;
                    nextX = rx + Math.cos(ra) * segDist;
                    nextY = ry + Math.sin(ra) * segDist;
                } else {
                    nextX = centerX + hit.x;
                    nextY = centerY + hit.y;
                    segDist = Math.sqrt((nextX - rx)**2 + (nextY - ry)**2);
                }

                if (segDist < 0.1 || accDist > growth) break;
                
                let dX = nextX, dY = nextY, isLast = false;
                if (accDist + segDist > growth) {
                    const ratio = (growth - accDist) / segDist;
                    dX = rx + (nextX - rx) * ratio; dY = ry + (nextY - ry) * ratio;
                    isLast = true;
                }

                let alpha;
                if (state.isPaintMode) { alpha = 0.85; } else {
                    const alphaFloor = useTrail ? 0.03 : 0.12;
                    const alphaFromDensity = 5 / Math.max(1, drawRayNumber);
                    const bounceDecay = Math.pow(0.78, b);
                    alpha = Math.max(alphaFloor, alphaFromDensity) * bounceDecay;
                    if (b === 0) alpha *= 1.45;
                    if (!useTrail) alpha *= 1.35;
                    if (flowMode === 'pulse') {
                        const pulse = Math.sin((accDist - flowOffset * 10) * 0.02) * 0.5 + 0.5;
                        alpha *= (0.2 + 0.8 * pulse);
                    }
                    alpha *= alphaIntensity;
                }
                alpha = Math.min(alpha, 0.95);

                targetCtx.strokeStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;
                targetCtx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;

                let cw = beamWidth;
                if (!useTrail) cw *= 1.35;
                if (useTaper) cw *= Math.max(0.1, 1 - (accDist / maxTravel));
                targetCtx.lineWidth = cw;

                if (baseStyle === 'line') {
                    targetCtx.beginPath(); targetCtx.moveTo(rx, ry); targetCtx.lineTo(dX, dY); targetCtx.stroke();
                } else if (baseStyle === 'particle') {
                    const step = 8;
                    const pathLen = Math.sqrt((dX - rx)**2 + (dY - ry)**2);
                    const dotCount = Math.min(Math.floor(pathLen / step), (hit ? 150 : 40));
                    const pSize = cw * 1.5;
                    for (let d = 0; d <= dotCount; d++) {
                        const ratio = dotCount === 0 ? 0 : d / dotCount;
                        targetCtx.fillRect(rx + (dX - rx) * ratio - pSize/2, ry + (dY - ry) * ratio - pSize/2, pSize, pSize);
                    }
                } else if (baseStyle === 'ghost') {
                    targetCtx.beginPath(); targetCtx.moveTo(rx, ry); targetCtx.lineTo(dX, dY); targetCtx.stroke();
                    targetCtx.lineWidth = cw * 3; targetCtx.globalAlpha = alpha * 0.3; targetCtx.stroke(); targetCtx.globalAlpha = 1.0;
                }

                if (useBloom && hit && !isLast && !state.isPaintMode) {
                    const r = cw * 1.5; const ba = Math.min(1.0, alpha * 2.5);
                    targetCtx.save();
                    targetCtx.beginPath(); targetCtx.arc(nextX, nextY, r * 4.5, 0, Math.PI * 2);
                    targetCtx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${ba * 0.15})`; targetCtx.fill();
                    targetCtx.beginPath(); targetCtx.arc(nextX, nextY, r * 2.0, 0, Math.PI * 2);
                    targetCtx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${ba * 0.4})`; targetCtx.fill();
                    targetCtx.beginPath(); targetCtx.arc(nextX, nextY, r, 0, Math.PI * 2);
                    targetCtx.fillStyle = `hsla(${baseHue}, 100%, 80%, ${ba})`; targetCtx.fill();
                    targetCtx.restore();
                }

                if (!hit || isLast) break;
                accDist += segDist;
                const norm = Physics.getNormal(hit.x, hit.y, shape, size);
                const incom = { x: Math.cos(ra), y: Math.sin(ra) };
                const dotP = incom.x * norm.x + incom.y * norm.y;
                const rX = incom.x - 2 * dotP * norm.x;
                const rY = incom.y - 2 * dotP * norm.y;
                ra = Math.atan2(rY, rX); rx = nextX; ry = nextY;
            }
            targetCtx.restore();
        }

        // --- 5. COMPOSITE PAINT & DRAW TOP UI ---
        if (state.isPaintMode) {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(this.paintCanvas, 0, 0);
            // Draw UI AFTER rays in Paint mode so it's always clean and on top.
            this.drawUI(ctx, state, centerX, centerY, size);
        }
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

        // Ellipse Foci
        if (state.shape === 'ellipse') {
            const fociDist = (size * 1.1) * 0.8;
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.lineWidth = 1;
            [{x: -fociDist, y: 0}, {x: fociDist, y: 0}].forEach(f => {
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
    }
};
