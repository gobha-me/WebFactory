// Utility Functions
const Utils = {
    // Convert screen coordinates to world tile coordinates
    screenToWorld(sx, sy, camera) {
        return {
            x: Math.floor((sx + camera.x) / (CONFIG.TILE_SIZE * camera.zoom)),
            y: Math.floor((sy + camera.y) / (CONFIG.TILE_SIZE * camera.zoom))
        };
    },
    
    // Convert world tile coordinates to screen coordinates
    worldToScreen(wx, wy, camera) {
        return {
            x: wx * CONFIG.TILE_SIZE * camera.zoom - camera.x,
            y: wy * CONFIG.TILE_SIZE * camera.zoom - camera.y
        };
    },
    
    // Draw a rounded rectangle
    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },
    
    // Get building size from config
    getBuildingSize(type) {
        return CONFIG.BUILDING_SIZES[type] || { w: 1, h: 1 };
    },
    
    // Deep clone an object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Format number with commas
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    // Clamp a value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // Linear interpolation
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Check if a point is within bounds
    inBounds(x, y) {
        return x >= 0 && x < CONFIG.MAP_WIDTH && y >= 0 && y < CONFIG.MAP_HEIGHT;
    }
};
