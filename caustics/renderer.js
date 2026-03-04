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
        const { ctx, canvas, shape, rayNumber, sourcePos, isLightVisible, spread, flowOffset, beamWidth, growth, MAX_BOUNCES, colorMode, showAxes } = state;
        const w = canvas.width;
        const h = canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const size = Math.min(w, h) * 0.35;

        // Clear Background
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, w, h);

        // Draw Helper Axes
        if (showAxes) {
            this.drawAxes(ctx, centerX, centerY, size);
        }

        // Draw Boundary Guide
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i <= 360; i++) {
            const rad = (i * Math.PI) / 180;
            let p = Physics.getShapePoint(rad, shape, size);
            if (i === 0) ctx.moveTo(centerX + p.x, centerY + p.y);
            else ctx.lineTo(centerX + p.x, centerY + p.y);
        }
        ctx.stroke();

        if (!isLightVisible) return;

        // Rays Emission Direction
        const aimAngle = Math.atan2(-sourcePos.y, -sourcePos.x);

        for (let i = 0; i < rayNumber; i++) {
            const t = i / Math.max(1, rayNumber - 1);
            let startPos, angle;
            
            if (shape === 'parabola') {
                const xOffset = (t - 0.5) * size * 1.8;
                startPos = { x: xOffset, y: -size * 1.2 };
                const swing = Math.atan2(sourcePos.y, sourcePos.x);
                angle = Math.PI / 2 + Math.sin(swing) * 0.3;
            } else {
                startPos = { x: sourcePos.x, y: sourcePos.y };
                angle = aimAngle + (t - 0.5) * spread;
            }

            let currX = centerX + startPos.x;
            let currY = centerY + startPos.y;
            let currAngle = angle;

            // Draw Source Bulb (First ray only for efficiency)
            if (i === 0) {
                ctx.save();
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#06b6d2';
                ctx.beginPath();
                ctx.arc(currX, currY, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            let baseHue;
            if (colorMode === 'cyan') baseHue = 185;
            else if (colorMode === 'rainbow') baseHue = t * 360;
            else baseHue = 20 + t * 40;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.setLineDash([30, 20]);
            ctx.lineDashOffset = -flowOffset;
            ctx.lineCap = 'round';
            ctx.lineWidth = beamWidth;
            
            let accumulatedDist = 0;

            for (let b = 0; b < MAX_BOUNCES; b++) {
                const hit = Physics.findBoundaryIntersection(currX - centerX, currY - centerY, currAngle, shape, size);
                if (!hit) break;

                const nextX = centerX + hit.x;
                const nextY = centerY + hit.y;
                const segmentDist = Math.sqrt((nextX - currX)**2 + (nextY - currY)**2);
                
                // Propagation logic
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

                const alpha = Math.max(0.02, (25 / rayNumber) * (1 - b/MAX_BOUNCES));
                ctx.strokeStyle = `hsla(${baseHue}, 100%, 60%, ${alpha})`;
                
                ctx.beginPath();
                ctx.moveTo(currX, currY);
                ctx.lineTo(drawX, drawY);
                ctx.stroke();

                if (isLastSegment) break;

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
