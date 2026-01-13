// Rendering System
const Renderer = {
    canvas: null,
    ctx: null,
    camera: { x: 0, y: 0, zoom: 1 },
    
    // Initialize renderer
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },
    
    // Resize canvas to container
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    },
    
    // Center camera on position
    centerCamera(x, y) {
        this.camera.x = x * CONFIG.TILE_SIZE * this.camera.zoom - this.canvas.width / 2;
        this.camera.y = y * CONFIG.TILE_SIZE * this.camera.zoom - this.canvas.height / 2;
    },
    
    // Main render function
    render(currentTool, rotation, mouseWorld) {
        this.clear();
        this.drawTerrain();
        this.drawBuildings();
        this.drawTowers();
        this.drawEnemies();
        this.drawProjectiles();
        this.drawMiningProgress();
        this.drawPlacementPreview(currentTool, rotation, mouseWorld);
        this.drawDeletePreview(currentTool, mouseWorld);
    },
    
    // Clear canvas
    clear() {
        this.ctx.fillStyle = '#1a2a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    // Draw terrain and resources
    drawTerrain() {
        const tileScreenSize = CONFIG.TILE_SIZE * this.camera.zoom;
        const startX = Math.floor(this.camera.x / tileScreenSize);
        const startY = Math.floor(this.camera.y / tileScreenSize);
        const endX = startX + Math.ceil(this.canvas.width / tileScreenSize) + 1;
        const endY = startY + Math.ceil(this.canvas.height / tileScreenSize) + 1;
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (!Utils.inBounds(x, y)) continue;
                
                const tile = Terrain.getTile(x, y);
                const screen = Utils.worldToScreen(x, y, this.camera);
                const size = tileScreenSize;
                
                // Grass with variation
                const grassVariant = ((x * 7 + y * 13) % 3);
                const grassColors = ['#2d4a2d', '#3a5a3a', '#335533'];
                this.ctx.fillStyle = grassColors[grassVariant];
                this.ctx.fillRect(screen.x, screen.y, size, size);
                
                // Grid lines
                this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(screen.x, screen.y, size, size);
                
                // Draw resources
                if (tile.resource && tile.amount > 0) {
                    this.drawResource(screen.x, screen.y, size, tile.resource, tile.amount);
                }
            }
        }
    },
    
    // Draw a resource tile
    drawResource(screenX, screenY, size, type, amount) {
        const padding = size * 0.1;
        const richness = Math.min(1, amount / 2000);
        const colors = CONFIG.RESOURCE_COLORS[type];
        
        // Gradient fill
        const grad = this.ctx.createLinearGradient(screenX, screenY, screenX + size, screenY + size);
        grad.addColorStop(0, colors.light);
        grad.addColorStop(1, colors.dark);
        this.ctx.fillStyle = grad;
        
        Utils.drawRoundedRect(this.ctx, screenX + padding, screenY + padding, size - padding * 2, size - padding * 2, 4 * this.camera.zoom);
        this.ctx.fill();
        
        // Richness highlight
        this.ctx.fillStyle = `rgba(255,255,255,${richness * 0.25})`;
        Utils.drawRoundedRect(this.ctx, screenX + padding, screenY + padding, size - padding * 2, size - padding * 2, 4 * this.camera.zoom);
        this.ctx.fill();
        
        // Texture dots
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 3; i++) {
            const ox = screenX + size * 0.3 + (i % 2) * size * 0.4;
            const oy = screenY + size * 0.3 + Math.floor(i / 2) * size * 0.4;
            this.ctx.beginPath();
            this.ctx.arc(ox, oy, 2 * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },
    
    // Draw all buildings
    drawBuildings() {
        const tileScreenSize = CONFIG.TILE_SIZE * this.camera.zoom;
        
        Buildings.list.forEach(b => {
            const screen = Utils.worldToScreen(b.x, b.y, this.camera);
            const bSize = Utils.getBuildingSize(b.type);
            const w = bSize.w * tileScreenSize;
            const h = bSize.h * tileScreenSize;
            const pad = 3 * this.camera.zoom;
            
            const style = CONFIG.BUILDING_STYLES[b.type];
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            Utils.drawRoundedRect(this.ctx, screen.x + pad + 3, screen.y + pad + 3, w - pad * 2, h - pad * 2, 6 * this.camera.zoom);
            this.ctx.fill();
            
            // Main body gradient
            const grad = this.ctx.createLinearGradient(screen.x, screen.y, screen.x + w, screen.y + h);
            grad.addColorStop(0, style.light);
            grad.addColorStop(1, style.dark);
            this.ctx.fillStyle = grad;
            Utils.drawRoundedRect(this.ctx, screen.x + pad, screen.y + pad, w - pad * 2, h - pad * 2, 6 * this.camera.zoom);
            this.ctx.fill();
            
            // Highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
            Utils.drawRoundedRect(this.ctx, screen.x + pad, screen.y + pad, w - pad * 2, (h - pad * 2) * 0.4, 6 * this.camera.zoom);
            this.ctx.fill();
            
            // Border
            this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            this.ctx.lineWidth = 2 * this.camera.zoom;
            Utils.drawRoundedRect(this.ctx, screen.x + pad, screen.y + pad, w - pad * 2, h - pad * 2, 6 * this.camera.zoom);
            this.ctx.stroke();
            
            // Direction indicator
            if (['belt', 'inserter', 'miner'].includes(b.type)) {
                this.drawDirectionArrow(screen.x + w / 2, screen.y + h / 2, w, b.rotation);
            }
            
            // Progress bar
            if (b.progress > 0 && b.type !== 'belt') {
                this.drawProgressBar(screen.x, screen.y, w, h, pad, b.progress);
            }
            
            // Belt items
            if (b.type === 'belt') {
                const totalItems = Buildings.getTotalInventory(b) + Buildings.getTotalOutput(b);
                if (totalItems > 0) {
                    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    this.ctx.beginPath();
                    this.ctx.arc(screen.x + w / 2 + 1, screen.y + h / 2 + 1, 5 * this.camera.zoom, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = '#ffcc44';
                    this.ctx.beginPath();
                    this.ctx.arc(screen.x + w / 2, screen.y + h / 2, 5 * this.camera.zoom, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            // Assembler recipe icon
            if (b.type === 'assembler' && b.recipe) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                this.ctx.font = `bold ${16 * this.camera.zoom}px sans-serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(b.recipe === 'gear' ? '⚙' : '⚡', screen.x + w / 2 + 1, screen.y + h / 2 + 1);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillText(b.recipe === 'gear' ? '⚙' : '⚡', screen.x + w / 2, screen.y + h / 2);
            }
            
            // Chest contents
            if (b.type === 'chest') {
                const total = Buildings.getTotalOutput(b);
                if (total > 0) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = `bold ${10 * this.camera.zoom}px sans-serif`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(total > 99 ? '99+' : total, screen.x + w / 2, screen.y + h / 2);
                }
            }
        });
    },
    
    // Draw direction arrow
    drawDirectionArrow(cx, cy, size, rotation) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(rotation * Math.PI / 2);
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.25 + 2, 2);
        this.ctx.lineTo(-size * 0.05 + 2, -size * 0.12 + 2);
        this.ctx.lineTo(-size * 0.05 + 2, size * 0.12 + 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Arrow
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.25, 0);
        this.ctx.lineTo(-size * 0.05, -size * 0.12);
        this.ctx.lineTo(-size * 0.05, size * 0.12);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    // Draw progress bar
    drawProgressBar(x, y, w, h, pad, progress) {
        const barW = w - pad * 4;
        const barH = 6 * this.camera.zoom;
        const barX = x + pad * 2;
        const barY = y + h - pad * 2 - barH;
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        Utils.drawRoundedRect(this.ctx, barX, barY, barW, barH, 2 * this.camera.zoom);
        this.ctx.fill();
        
        const progGrad = this.ctx.createLinearGradient(barX, barY, barX, barY + barH);
        progGrad.addColorStop(0, '#66ff66');
        progGrad.addColorStop(1, '#22aa22');
        this.ctx.fillStyle = progGrad;
        Utils.drawRoundedRect(this.ctx, barX + 1, barY + 1, (barW - 2) * progress, barH - 2, 2 * this.camera.zoom);
        this.ctx.fill();
    },
    
    // Draw manual mining progress
    drawMiningProgress() {
        if (!Simulation.mining.active) return;
        
        const screen = Utils.worldToScreen(Simulation.mining.x, Simulation.mining.y, this.camera);
        const size = CONFIG.TILE_SIZE * this.camera.zoom;
        
        // Mining highlight
        this.ctx.fillStyle = 'rgba(136, 204, 68, 0.3)';
        this.ctx.fillRect(screen.x, screen.y, size, size);
        
        // Progress ring
        this.ctx.strokeStyle = '#88cc44';
        this.ctx.lineWidth = 4 * this.camera.zoom;
        this.ctx.beginPath();
        this.ctx.arc(
            screen.x + size / 2,
            screen.y + size / 2,
            size / 3,
            -Math.PI / 2,
            -Math.PI / 2 + Simulation.mining.progress * Math.PI * 2
        );
        this.ctx.stroke();
        
        // Pickaxe icon
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${14 * this.camera.zoom}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⛏', screen.x + size / 2, screen.y + size / 2);
    },
    
    // Draw placement preview
    drawPlacementPreview(currentTool, rotation, mouseWorld) {
        if (currentTool === 'select' || currentTool === 'delete' || currentTool === 'mine') return;
        
        const tileScreenSize = CONFIG.TILE_SIZE * this.camera.zoom;
        const screen = Utils.worldToScreen(mouseWorld.x, mouseWorld.y, this.camera);
        
        // Check if it's a tower
        if (Towers.TYPES[currentTool]) {
            const towerType = Towers.TYPES[currentTool];
            const canPlace = Towers.canPlace(currentTool, mouseWorld.x, mouseWorld.y);
            
            this.ctx.globalAlpha = 0.6;
            
            // Tower preview circle
            this.ctx.fillStyle = canPlace ? 'rgba(100, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(screen.x + tileScreenSize/2, screen.y + tileScreenSize/2, tileScreenSize/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = canPlace ? '#66ff66' : '#ff6666';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(screen.x + tileScreenSize/2, screen.y + tileScreenSize/2, tileScreenSize/2, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Range preview
            this.ctx.strokeStyle = canPlace ? 'rgba(100, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(screen.x + tileScreenSize/2, screen.y + tileScreenSize/2, towerType.range * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
            this.ctx.globalAlpha = 1;
            return;
        }
        
        if (!CONFIG.COSTS[currentTool]) return;
        
        const previewSize = Utils.getBuildingSize(currentTool);
        const w = previewSize.w * tileScreenSize;
        const h = previewSize.h * tileScreenSize;
        
        const canPlace = Buildings.canPlace(currentTool, mouseWorld.x, mouseWorld.y) && 
                        Resources.canAfford(CONFIG.COSTS[currentTool]);
        
        this.ctx.globalAlpha = 0.6;
        this.ctx.fillStyle = canPlace ? 'rgba(100, 255, 100, 0.3)' : 'rgba(255, 100, 100, 0.3)';
        this.ctx.fillRect(screen.x, screen.y, w, h);
        
        this.ctx.strokeStyle = canPlace ? '#66ff66' : '#ff6666';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(screen.x, screen.y, w, h);
        this.ctx.setLineDash([]);
        
        // Rotation arrow preview
        if (['belt', 'inserter', 'miner'].includes(currentTool)) {
            this.ctx.save();
            this.ctx.translate(screen.x + w / 2, screen.y + h / 2);
            this.ctx.rotate(rotation * Math.PI / 2);
            this.ctx.fillStyle = canPlace ? '#66ff66' : '#ff6666';
            this.ctx.beginPath();
            this.ctx.moveTo(w * 0.3, 0);
            this.ctx.lineTo(-w * 0.1, -w * 0.15);
            this.ctx.lineTo(-w * 0.1, w * 0.15);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.ctx.globalAlpha = 1;
    },
    
    // Draw delete preview
    drawDeletePreview(currentTool, mouseWorld) {
        if (currentTool !== 'delete') return;
        
        const building = Buildings.getAt(mouseWorld.x, mouseWorld.y);
        const tower = Towers.getAt(mouseWorld.x, mouseWorld.y);
        
        if (building) {
            const tileScreenSize = CONFIG.TILE_SIZE * this.camera.zoom;
            const screen = Utils.worldToScreen(building.x, building.y, this.camera);
            const bSize = Utils.getBuildingSize(building.type);
            const w = bSize.w * tileScreenSize;
            const h = bSize.h * tileScreenSize;
            
            this.drawDeleteBox(screen.x, screen.y, w, h);
        } else if (tower) {
            const tileScreenSize = CONFIG.TILE_SIZE * this.camera.zoom;
            const screen = Utils.worldToScreen(tower.x, tower.y, this.camera);
            
            this.drawDeleteBox(screen.x, screen.y, tileScreenSize, tileScreenSize);
        }
    },
    
    // Draw delete box helper
    drawDeleteBox(x, y, w, h) {
        this.ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.strokeStyle = '#ff3333';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, w, h);
        
        // X mark
        this.ctx.strokeStyle = '#ff3333';
        this.ctx.lineWidth = 4 * this.camera.zoom;
        this.ctx.beginPath();
        this.ctx.moveTo(x + w * 0.2, y + h * 0.2);
        this.ctx.lineTo(x + w * 0.8, y + h * 0.8);
        this.ctx.moveTo(x + w * 0.8, y + h * 0.2);
        this.ctx.lineTo(x + w * 0.2, y + h * 0.8);
        this.ctx.stroke();
    },
    
    // Draw all towers
    drawTowers() {
        const tileScreenSize = CONFIG.TILE_SIZE * this.camera.zoom;
        
        Towers.list.forEach(tower => {
            const type = Towers.TYPES[tower.type];
            const screen = Utils.worldToScreen(tower.x, tower.y, this.camera);
            const size = tileScreenSize;
            const pad = 3 * this.camera.zoom;
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.beginPath();
            this.ctx.arc(screen.x + size/2 + 3, screen.y + size/2 + 3, size/2 - pad, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Base
            const grad = this.ctx.createRadialGradient(
                screen.x + size/2, screen.y + size/2, 0,
                screen.x + size/2, screen.y + size/2, size/2
            );
            grad.addColorStop(0, type.color);
            grad.addColorStop(1, type.colorDark);
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(screen.x + size/2, screen.y + size/2, size/2 - pad, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
            this.ctx.beginPath();
            this.ctx.arc(screen.x + size/2, screen.y + size/3, size/4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Border
            this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            this.ctx.lineWidth = 2 * this.camera.zoom;
            this.ctx.beginPath();
            this.ctx.arc(screen.x + size/2, screen.y + size/2, size/2 - pad, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Turret barrel
            this.ctx.save();
            this.ctx.translate(screen.x + size/2, screen.y + size/2);
            this.ctx.rotate(tower.angle);
            
            // Barrel
            this.ctx.fillStyle = tower.firing ? '#fff' : '#333';
            this.ctx.fillRect(0, -4 * this.camera.zoom, size/2.5, 8 * this.camera.zoom);
            
            this.ctx.restore();
            
            // Range indicator when selected
            if (tower.target) {
                this.ctx.strokeStyle = 'rgba(255,100,100,0.2)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(screen.x + size/2, screen.y + size/2, type.range * this.camera.zoom, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // Health bar
            if (tower.health < tower.maxHealth) {
                const barW = size - pad * 2;
                const barH = 4 * this.camera.zoom;
                const barX = screen.x + pad;
                const barY = screen.y - barH - 4;
                
                this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                this.ctx.fillRect(barX, barY, barW, barH);
                
                const healthPct = tower.health / tower.maxHealth;
                this.ctx.fillStyle = healthPct > 0.5 ? '#66ff66' : healthPct > 0.25 ? '#ffcc00' : '#ff3333';
                this.ctx.fillRect(barX, barY, barW * healthPct, barH);
            }
        });
    },
    
    // Draw all enemies
    drawEnemies() {
        Enemies.list.forEach(enemy => {
            const type = Enemies.TYPES[enemy.type];
            const screen = {
                x: enemy.x * this.camera.zoom - this.camera.x,
                y: enemy.y * this.camera.zoom - this.camera.y
            };
            const size = CONFIG.TILE_SIZE * this.camera.zoom * type.size;
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(screen.x + 2, screen.y + 4, size/2, size/3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Body
            this.ctx.save();
            this.ctx.translate(screen.x, screen.y);
            this.ctx.rotate(enemy.angle);
            
            // Damage flash
            const color = enemy.damageFlash > 0 ? '#fff' : type.color;
            if (enemy.damageFlash > 0) enemy.damageFlash -= 0.016;
            
            // Main body
            const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
            grad.addColorStop(0, color);
            grad.addColorStop(1, type.colorDark);
            this.ctx.fillStyle = grad;
            
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, size/2, size/3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eyes
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(size/4, -size/8, size/10, 0, Math.PI * 2);
            this.ctx.arc(size/4, size/8, size/10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Legs animation
            this.ctx.strokeStyle = type.colorDark;
            this.ctx.lineWidth = 2 * this.camera.zoom;
            const legOffset = Math.sin(enemy.animTime) * 5;
            
            for (let i = 0; i < 3; i++) {
                const angle = (i - 1) * 0.5;
                const offset = i === 1 ? legOffset : -legOffset;
                
                // Left leg
                this.ctx.beginPath();
                this.ctx.moveTo(-size/6, -size/4);
                this.ctx.lineTo(-size/3 + offset, -size/2 - Math.abs(offset));
                this.ctx.stroke();
                
                // Right leg
                this.ctx.beginPath();
                this.ctx.moveTo(-size/6, size/4);
                this.ctx.lineTo(-size/3 - offset, size/2 + Math.abs(offset));
                this.ctx.stroke();
            }
            
            this.ctx.restore();
            
            // Health bar
            if (enemy.health < enemy.maxHealth) {
                const barW = size;
                const barH = 4 * this.camera.zoom;
                const barX = screen.x - size/2;
                const barY = screen.y - size/2 - barH - 4;
                
                this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                this.ctx.fillRect(barX, barY, barW, barH);
                
                const healthPct = enemy.health / enemy.maxHealth;
                this.ctx.fillStyle = healthPct > 0.5 ? '#66ff66' : healthPct > 0.25 ? '#ffcc00' : '#ff3333';
                this.ctx.fillRect(barX, barY, barW * healthPct, barH);
            }
            
            // Burning effect
            if (enemy.burning && enemy.burning.duration > 0) {
                this.ctx.fillStyle = `rgba(255, 100, 0, ${0.3 + Math.sin(Date.now() / 100) * 0.2})`;
                this.ctx.beginPath();
                this.ctx.arc(screen.x, screen.y, size/2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    },
    
    // Draw projectiles
    drawProjectiles() {
        Towers.projectiles.forEach(proj => {
            const screen = {
                x: proj.x * this.camera.zoom - this.camera.x,
                y: proj.y * this.camera.zoom - this.camera.y
            };
            
            // Projectile glow
            this.ctx.fillStyle = proj.color;
            this.ctx.shadowColor = proj.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 4 * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Trail
            const dx = proj.targetX - proj.x;
            const dy = proj.targetY - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                const trailX = screen.x - (dx / dist) * 15 * this.camera.zoom;
                const trailY = screen.y - (dy / dist) * 15 * this.camera.zoom;
                
                this.ctx.strokeStyle = proj.color;
                this.ctx.lineWidth = 2 * this.camera.zoom;
                this.ctx.globalAlpha = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(screen.x, screen.y);
                this.ctx.lineTo(trailX, trailY);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
            
            // Chain lightning effect
            if (proj.chainTargets && proj.chainTargets.length > 1) {
                this.ctx.strokeStyle = proj.color;
                this.ctx.lineWidth = 2 * this.camera.zoom;
                this.ctx.globalAlpha = 0.8;
                
                for (let i = 0; i < proj.chainTargets.length - 1; i++) {
                    const t1 = proj.chainTargets[i];
                    const t2 = proj.chainTargets[i + 1];
                    const s1 = {
                        x: t1.x * this.camera.zoom - this.camera.x,
                        y: t1.y * this.camera.zoom - this.camera.y
                    };
                    const s2 = {
                        x: t2.x * this.camera.zoom - this.camera.x,
                        y: t2.y * this.camera.zoom - this.camera.y
                    };
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(s1.x, s1.y);
                    // Jagged line for lightning effect
                    const midX = (s1.x + s2.x) / 2 + (Math.random() - 0.5) * 20;
                    const midY = (s1.y + s2.y) / 2 + (Math.random() - 0.5) * 20;
                    this.ctx.lineTo(midX, midY);
                    this.ctx.lineTo(s2.x, s2.y);
                    this.ctx.stroke();
                }
                this.ctx.globalAlpha = 1;
            }
        });
    }
};
