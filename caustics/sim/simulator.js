/**
 * LIGHT FLOW LAB: Simulator Module
 * Handles incremental ray progression logic (Paint 2)
 */
import { Physics } from './physics.js';

export const Simulator = {
    rayStates: [],

    findTransitionOnSegment(x0, y0, x1, y1, startInside, shape, size) {
        const endInside = Physics.isInside(x1, y1, shape, size);
        if (endInside === startInside) return null;

        let low = 0;
        let high = 1;
        for (let i = 0; i < 24; i++) {
            const mid = (low + high) * 0.5;
            const mx = x0 + (x1 - x0) * mid;
            const my = y0 + (y1 - y0) * mid;
            if (Physics.isInside(mx, my, shape, size) === startInside) low = mid;
            else high = mid;
        }

        const t = (low + high) * 0.5;
        return {
            x: x0 + (x1 - x0) * t,
            y: y0 + (y1 - y0) * t,
            t
        };
    },
    
    /**
     * Initialize or reset ray states for incremental simulation
     */
    initRays(app) {
        const { rayNumber, colorMode, flowOffset } = app;
        this.rayStates = [];
        const count = Math.max(1, Math.floor(rayNumber));
        const size = app.getShapeSize();
        const launchConfigs = app.buildLaunchRayConfigs(count, size, flowOffset);

        for (let i = 0; i < launchConfigs.length; i++) {
            const config = launchConfigs[i];
            let baseHue;
            if (colorMode === 'rainbow') baseHue = (config.t * 360 + flowOffset * 0.5) % 360;
            else if (colorMode === 'cyan') baseHue = 180 + Math.sin(config.t * 5 + flowOffset * 0.1) * 20;
            else if (colorMode === 'sunset') baseHue = 10 + Math.sin(config.t * 3 + flowOffset * 0.1) * 30;

            this.rayStates.push({
                x: config.sPos.x,
                y: config.sPos.y,
                angle: config.angle,
                accDist: 0,
                bounces: 0,
                hue: baseHue,
                active: true,
                segments: [] // Stores segments calculated in the current step
            });
        }
    },

    /**
     * Advance the simulation by a delta distance
     */
    step(app, delta) {
        if (this.rayStates.length === 0) this.initRays(app);
        
        const canvasW = app.canvas.width;
        const canvasH = app.canvas.height;
        const sizeMult = app.isWindowFull ? 0.45 : 0.35;
        const size = Math.min(canvasW, canvasH) * sizeMult;
        const maxBounces = Math.max(1, Math.floor(app.MAX_BOUNCES));
        const maxTravel = Math.sqrt(canvasW * canvasW + canvasH * canvasH) * 1.5;
        
        const allNewSegments = [];

        for (let i = 0; i < this.rayStates.length; i++) {
            const ray = this.rayStates[i];
            if (!ray.active) continue;

            let remainingDelta = delta;
            const raySegments = [];

            // Prevent infinite loops in case of physics glitches
            let safetyCounter = 0; 
            while (remainingDelta > 0.01 && ray.active && safetyCounter < 10) {
                safetyCounter++;
                
                // Find intersection along the current path
                const wasInside = Physics.isInside(ray.x, ray.y, app.shape, size);
                const hit = Physics.findBoundaryIntersection(ray.x, ray.y, ray.angle, app.shape, size);
                
                let nextX, nextY, distToHit;
                if (!hit) {
                    distToHit = maxTravel;
                    nextX = ray.x + Math.cos(ray.angle) * distToHit;
                    nextY = ray.y + Math.sin(ray.angle) * distToHit;
                } else {
                    nextX = hit.x;
                    nextY = hit.y;
                    distToHit = Math.sqrt((nextX - ray.x)**2 + (nextY - ray.y)**2);
                }

                // If the next hit is beyond our current delta budget
                if (distToHit > remainingDelta) {
                    const stepX = ray.x + Math.cos(ray.angle) * remainingDelta;
                    const stepY = ray.y + Math.sin(ray.angle) * remainingDelta;
                    const transition = this.findTransitionOnSegment(
                        ray.x,
                        ray.y,
                        stepX,
                        stepY,
                        wasInside,
                        app.shape,
                        size
                    );

                    if (transition) {
                        raySegments.push({
                            x1: ray.x, y1: ray.y,
                            x2: transition.x, y2: transition.y,
                            hue: ray.hue,
                            bounce: ray.bounces,
                            isHit: true
                        });

                        ray.x = transition.x;
                        ray.y = transition.y;
                        ray.accDist += remainingDelta * transition.t;
                        remainingDelta *= (1 - transition.t);
                        ray.bounces++;

                        if (ray.bounces >= maxBounces) {
                            ray.active = false;
                        } else if (app.shape === 'triangle' && Physics.isNearTriangleVertex(transition.x, transition.y, size)) {
                            ray.active = false;
                        } else {
                            const normal = Physics.getNormal(transition.x, transition.y, app.shape, size);
                            const inX = Math.cos(ray.angle);
                            const inY = Math.sin(ray.angle);
                            const reflected = Physics.reflect(inX, inY, normal);
                            ray.angle = Math.atan2(reflected.y, reflected.x);

                            const nudged = Physics.nudgeAfterHit(transition.x, transition.y, normal, wasInside);
                            ray.x = nudged.x;
                            ray.y = nudged.y;
                        }
                        continue;
                    }
                    
                    raySegments.push({
                        x1: ray.x, y1: ray.y,
                        x2: stepX, y2: stepY,
                        hue: ray.hue,
                        bounce: ray.bounces
                    });
                    
                    ray.x = stepX;
                    ray.y = stepY;
                    ray.accDist += remainingDelta;
                    remainingDelta = 0;
                } else {
                    // We hit the boundary within this delta
                    raySegments.push({
                        x1: ray.x, y1: ray.y,
                        x2: nextX, y2: nextY,
                        hue: ray.hue,
                        bounce: ray.bounces,
                        isHit: true
                    });

                    ray.x = nextX;
                    ray.y = nextY;
                    ray.accDist += distToHit;
                    remainingDelta -= distToHit;
                    ray.bounces++;

                    if (ray.bounces >= maxBounces || !hit) {
                        ray.active = false;
                        
                        // Safety: If it just flew out, pull it back to hit point
                        if (!hit && distToHit > size * 2) {
                             ray.x = ray.x; // Keep at last valid
                        }
                    } else if (app.shape === 'triangle' && Physics.isNearTriangleVertex(hit.x, hit.y, size)) {
                        ray.active = false;
                    } else {
                        // Reflect
                        const normal = Physics.getNormal(hit.x, hit.y, app.shape, size);
                        const inX = Math.cos(ray.angle);
                        const inY = Math.sin(ray.angle);
                        const reflected = Physics.reflect(inX, inY, normal);
                        ray.angle = Math.atan2(reflected.y, reflected.x);

                        const nudged = Physics.nudgeAfterHit(nextX, nextY, normal, wasInside);
                        ray.x = nudged.x;
                        ray.y = nudged.y;
                    }
                }
            }
            
            if (raySegments.length > 0) {
                allNewSegments.push(...raySegments);
            }
        }
        
        return allNewSegments;
    },

    clear() {
        this.rayStates = [];
    }
};
