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

        if (!isLightVisible) return;

        const aimAngle = Math.PI / 2; // Light always points downward regardless of source position

        for (let i = 0; i < rayNumber; i++) {
            const t = i / Math.max(1, rayNumber - 1);
            let startPos, angle;
            
            if (shape === 'parabola') {
                const xOffset = (t - 0.5) * size * 1.8;
                startPos = { x: xOffset, y: -size * 1.5 }; // Higher starting point
                angle = Math.PI / 2; // Strictly vertical (downward)
            } else {
                startPos = { x: sourcePos.x, y: sourcePos.y };
                angle = aimAngle + sourceRotation + (t - 0.5) * spread;
            }

            let currX = centerX + startPos.x;
            let currY = centerY + startPos.y;
            let currAngle = angle;

            if (i === 0) {
                // Fake Bloom for Main Source
                ctx.save();
                ctx.globalCompositeOperation = 'lighter';
                
                // Outer glow
                ctx.beginPath(); ctx.arc(currX, currY, 20, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 210, 0.15)'; ctx.fill();
                // Inner glow
                ctx.beginPath(); ctx.arc(currX, currY, 12, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 210, 0.4)'; ctx.fill();
                // Core
                ctx.beginPath(); ctx.arc(currX, currY, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#fff'; ctx.fill();
                
                ctx.restore();
            }

            let baseHue;
            if (colorMode === 'cyan') baseHue = 185;
            else if (colorMode === 'rainbow') baseHue = t * 300; // Change 360 to 300 to avoid red-red overlap
            else baseHue = 20 + t * 40;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            
            // Flow Mode: Interval (Dash)
            if (flowMode === 'interval') {
                ctx.setLineDash([30, 20]);
                ctx.lineDashOffset = -flowOffset * 2;
            } else {
                ctx.setLineDash([]);
            }
            
            let accumulatedDist = 0;
            const maxTravel = Math.sqrt(w*w + h*h) * 1.2; // Canvas diagonal + margin, NOT 10000

            for (let b = 0; b < MAX_BOUNCES; b++) {
                // strict safety bound: if ray is completely out of canvas, stop and don't draw
                if (currX < -w || currX > w*2 || currY < -h || currY > h*2) {
                    break;
                }

                const hit = Physics.findBoundaryIntersection(currX - centerX, currY - centerY, currAngle, shape, size);
                
                let nextX, nextY, segmentDist;
                if (!hit) {
                    // Escaped shape: draw only to edge of canvas, not infinity
                    const escapeDist = maxTravel - accumulatedDist;
                    nextX = currX + Math.cos(currAngle) * escapeDist;
                    nextY = currY + Math.sin(currAngle) * escapeDist;
                    segmentDist = escapeDist;
                } else {
                    nextX = centerX + hit.x;
                    nextY = centerY + hit.y;
                    segmentDist = Math.sqrt((nextX - currX)**2 + (nextY - currY)**2);
                }

                if (segmentDist < 0.1) break; // Prevent stuck rays
                
                if (accumulatedDist > growth) break;
                
                let drawX = nextX;
                let drawY = nextY;
                let isLastSegment = false;

                if (accumulatedDist + segmentDist > growth) {
                    const ratio = (growth - accumulatedDist) / segmentDist;
                    drawX = currX + (nextX - currX) * ratio;
                    drawY = currY + (nextY - currY) * ratio;
                    isLastSegment = true;
                }

                // Alpha Calculation
                let alpha = (30 / rayNumber) * (1 - b/MAX_BOUNCES);
                
                // Flow Mode: Pulse
                if (flowMode === 'pulse') {
                    const pulse = Math.sin((accumulatedDist - flowOffset * 10) * 0.02) * 0.5 + 0.5;
                    alpha *= (0.2 + 0.8 * pulse);
                }

                ctx.strokeStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;
                ctx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;

                // Taper Logic
                let currentWidth = beamWidth;
                if (useTaper) {
                    currentWidth *= Math.max(0.1, 1 - (accumulatedDist / maxTravel));
                }
                ctx.lineWidth = currentWidth;

                // Base Style implementations
                if (baseStyle === 'line') {
                    ctx.beginPath(); ctx.moveTo(currX, currY); ctx.lineTo(drawX, drawY); ctx.stroke();
                } 
                else if (baseStyle === 'particle') {
                    const step = 8;
                    const pathLen = Math.sqrt((drawX - currX)**2 + (drawY - currY)**2);
                    // If ray is escaping (!hit), use fewer dots to stay safe
                    const maxDots = hit ? 150 : 40;
                    const dotCount = Math.min(Math.floor(pathLen / step), maxDots);
                    
                    const pSize = currentWidth * 1.5;
                    const halfP = pSize * 0.5;
                    
                    ctx.beginPath();
                    for (let d = 0; d <= dotCount; d++) {
                        const ratio = dotCount === 0 ? 0 : d / dotCount;
                        const px = currX + (drawX - currX) * ratio;
                        const py = currY + (drawY - currY) * ratio;
                        // fillRect is 10x faster than arc() ensuring 60fps
                        ctx.fillRect(px - halfP, py - halfP, pSize, pSize);
                    }
                }
                else if (baseStyle === 'ghost') {
                    ctx.beginPath(); ctx.moveTo(currX, currY); ctx.lineTo(drawX, drawY); ctx.stroke();
                    ctx.lineWidth = currentWidth * 3;
                    ctx.globalAlpha = alpha * 0.3;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }

                // Bloom Effect at reflection (Fake Bloom for high performance)
                if (useBloom && hit && !isLastSegment) {
                    const r = currentWidth * 1.5;
                    const bloomAlpha = Math.min(1.0, alpha * 2.5);
                    
                    ctx.save();
                    // Outer halo
                    ctx.beginPath();
                    ctx.arc(nextX, nextY, r * 4.5, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${bloomAlpha * 0.15})`;
                    ctx.fill();
                    
                    // Inner halo
                    ctx.beginPath();
                    ctx.arc(nextX, nextY, r * 2.0, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${baseHue}, 100%, 60%, ${bloomAlpha * 0.4})`;
                    ctx.fill();
                    
                    // Core (brightest)
                    ctx.beginPath();
                    ctx.arc(nextX, nextY, r, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${baseHue}, 100%, 80%, ${bloomAlpha})`;
                    ctx.fill();
                    ctx.restore();
                }

                if (!hit || isLastSegment) break;

                accumulatedDist += segmentDist;
                const normal = Physics.getNormal(hit.x, hit.y, shape, size);
                const incoming = { x: Math.cos(currAngle), y: Math.sin(currAngle) };
                const dot = incoming.x * normal.x + incoming.y * normal.y;
                const reflectX = incoming.x - 2 * dot * normal.x;
                const reflectY = incoming.y - 2 * dot * normal.y;
                
                currAngle = Math.atan2(reflectY, reflectX);
                currX = nextX;
                currY = nextY;
            }
            ctx.restore();
        }
    }
};
