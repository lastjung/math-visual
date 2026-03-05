/**
 * LIGHT FLOW LAB: Renderer Module
 * Handles canvas drawing and visual representation
 */
import { Physics } from './physics.js';

export const Renderer = {
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
        const { ctx, canvas, shape, rayNumber, sourcePos, sourceRotation, isLightVisible, spread, flowOffset, beamWidth, growth, MAX_BOUNCES, colorMode, showAxes, baseStyle, flowMode, useTrail, useTaper, useBloom } = state;
        const w = canvas.width;
        const h = canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const size = Math.min(w, h) * 0.35;

        // Clear Background with Trail Support
        if (useTrail) {
            ctx.fillStyle = 'rgba(5, 5, 8, 0.15)'; // Partial clear for trails
            ctx.fillRect(0, 0, w, h);
        } else {
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, w, h);
        }

        // Draw Helper Axes
        if (showAxes) {
            this.drawAxes(ctx, centerX, centerY, size);
        }

        // Draw Boundary Guide
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = shape === 'parabola' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)';
        
        const steps = shape === 'parabola' ? 200 : 360;
        for (let i = 0; i <= steps; i++) {
            const rad = (i * Math.PI * 2) / steps;
            let p = Physics.getShapePoint(rad, shape, size);
            if (i === 0) ctx.moveTo(centerX + p.x, centerY + p.y);
            else ctx.lineTo(centerX + p.x, centerY + p.y);
        }
        ctx.stroke();

        // Draw Ellipse Foci
        if (shape === 'ellipse') {
            const fociDist = (size * 1.1) * 0.8; // c = sqrt(a^2 - b^2) where a=size*1.1, b=size*1.1*0.6
            const fociList = [{x: -fociDist, y: 0}, {x: fociDist, y: 0}];
            
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            fociList.forEach(f => {
                const fx = centerX + f.x;
                const fy = centerY + f.y;
                
                // Draw small crosshair
                ctx.beginPath(); ctx.moveTo(fx - 5, fy); ctx.lineTo(fx + 5, fy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(fx, fy - 5); ctx.lineTo(fx, fy + 5); ctx.stroke();
            });
            ctx.restore();
        }

        const aimAngle = Math.PI / 2;

        for (let i = 0; i < rayNumber; i++) {
            const t = i / Math.max(1, rayNumber - 1);
            let startPos, angle;
            
            if (shape === 'parabola') {
                const xOffset = (t - 0.5) * size * 1.8;
                startPos = { x: xOffset, y: -size * 1.5 };
                angle = Math.PI / 2;
            } else {
                startPos = { x: sourcePos.x, y: sourcePos.y };
                angle = aimAngle + sourceRotation + (t - 0.5) * spread;
            }

            const currX = centerX + startPos.x;
            const currY = centerY + startPos.y;
            const currAngle = angle;

            if (i === 0) {
                // Original minimal light source
                ctx.save();
                ctx.beginPath(); ctx.arc(currX, currY, 10, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.fill();
                ctx.beginPath(); ctx.arc(currX, currY, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#fff'; ctx.fill();
                ctx.restore();
            }

            if (!isLightVisible) continue;

            let baseHue;
            if (colorMode === 'cyan') baseHue = 185;
            else if (colorMode === 'rainbow') baseHue = t * 300;
            else baseHue = 20 + t * 40;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            
            if (flowMode === 'interval') {
                ctx.setLineDash([30, 20]);
                ctx.lineDashOffset = -flowOffset * 2;
            } else {
                ctx.setLineDash([]);
            }
            
            let accumulatedDist = 0;
            const maxTravel = Math.sqrt(w*w + h*h) * 1.2;

            let rx = currX;
            let ry = currY;
            let ra = currAngle;

            for (let b = 0; b < MAX_BOUNCES; b++) {
                if (rx < -w || rx > w*2 || ry < -h || ry > h*2) break;

                const hit = Physics.findBoundaryIntersection(rx - centerX, ry - centerY, ra, shape, size);
                
                let nextX, nextY, segmentDist;
                if (!hit) {
                    const escapeDist = maxTravel - accumulatedDist;
                    nextX = rx + Math.cos(ra) * escapeDist;
                    nextY = ry + Math.sin(ra) * escapeDist;
                    segmentDist = escapeDist;
                } else {
                    nextX = centerX + hit.x;
                    nextY = centerY + hit.y;
                    segmentDist = Math.sqrt((nextX - rx)**2 + (nextY - ry)**2);
                }

                if (segmentDist < 0.1) break;
                if (accumulatedDist > growth) break;
                
                let drawX = nextX;
                let drawY = nextY;
                let isLastSegment = false;

                if (accumulatedDist + segmentDist > growth) {
                    const ratio = (growth - accumulatedDist) / segmentDist;
                    drawX = rx + (nextX - rx) * ratio;
                    drawY = ry + (nextY - ry) * ratio;
                    isLastSegment = true;
                }

                let alpha = (5 / rayNumber) * (1 - b/MAX_BOUNCES);
                if (flowMode === 'pulse') {
                    const pulse = Math.sin((accumulatedDist - flowOffset * 10) * 0.02) * 0.5 + 0.5;
                    alpha *= (0.2 + 0.8 * pulse);
                }

                ctx.strokeStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;
                ctx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;

                let cw = beamWidth;
                if (useTaper) cw *= Math.max(0.1, 1 - (accumulatedDist / maxTravel));
                ctx.lineWidth = cw;

                if (baseStyle === 'line') {
                    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(drawX, drawY); ctx.stroke();
                } 
                else if (baseStyle === 'particle') {
                    const step = 8;
                    const pathLen = Math.sqrt((drawX - rx)**2 + (drawY - ry)**2);
                    const maxDots = hit ? 150 : 40;
                    const dotCount = Math.min(Math.floor(pathLen / step), maxDots);
                    const pSize = cw * 1.5;
                    const halfP = pSize * 0.5;
                    
                    for (let d = 0; d <= dotCount; d++) {
                        const ratio = dotCount === 0 ? 0 : d / dotCount;
                        ctx.fillRect(rx + (drawX - rx) * ratio - halfP, ry + (drawY - ry) * ratio - halfP, pSize, pSize);
                    }
                }
                else if (baseStyle === 'ghost') {
                    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(drawX, drawY); ctx.stroke();
                    ctx.lineWidth = cw * 3;
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }

                if (useBloom && hit && !isLastSegment) {
                    const r = cw * 1.5;
                    const ba = Math.min(1.0, alpha * 2.5);
                    ctx.save();
                    ctx.beginPath(); ctx.arc(nextX, nextY, r * 4.5, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${ba * 0.15})`; ctx.fill();
                    ctx.beginPath(); ctx.arc(nextX, nextY, r * 2.0, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${ba * 0.4})`; ctx.fill();
                    ctx.beginPath(); ctx.arc(nextX, nextY, r, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${baseHue}, 100%, 80%, ${ba})`; ctx.fill();
                    ctx.restore();
                }

                if (!hit || isLastSegment) break;

                accumulatedDist += segmentDist;
                const normal = Physics.getNormal(hit.x, hit.y, shape, size);
                const incoming = { x: Math.cos(ra), y: Math.sin(ra) };
                const dot = incoming.x * normal.x + incoming.y * normal.y;
                const rX = incoming.x - 2 * dot * normal.x;
                const rY = incoming.y - 2 * dot * normal.y;
                
                ra = Math.atan2(rY, rX);
                rx = nextX;
                ry = nextY;
            }
            ctx.restore();
        }
    }
};
