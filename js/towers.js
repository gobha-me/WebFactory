// Defense Tower System
const Towers = {
    list: [],
    projectiles: [],
    
    // Tower types
    TYPES: {
        'gun_turret': {
            name: 'Gun Turret',
            description: 'Rapid-fire bullets',
            health: 200,
            maxHealth: 200,
            range: 200,
            damage: 15,
            fireRate: 4, // shots per second
            projectileSpeed: 500,
            projectileColor: '#ffcc00',
            cost: { 'iron-plate': 20, 'gear': 10 },
            color: '#888899',
            colorDark: '#555566'
        },
        'flame_turret': {
            name: 'Flame Turret',
            description: 'Short range, high damage, burns',
            health: 150,
            maxHealth: 150,
            range: 120,
            damage: 40,
            fireRate: 2,
            burnDamage: 10,
            burnDuration: 3,
            projectileSpeed: 300,
            projectileColor: '#ff6600',
            cost: { 'iron-plate': 15, 'copper-plate': 20, 'coal': 50 },
            color: '#cc4400',
            colorDark: '#882200'
        },
        'laser_turret': {
            name: 'Laser Turret',
            description: 'Long range, high damage',
            health: 100,
            maxHealth: 100,
            range: 350,
            damage: 50,
            fireRate: 1,
            projectileSpeed: 1000,
            projectileColor: '#ff0000',
            cost: { 'iron-plate': 30, 'copper-plate': 30, 'circuit': 20 },
            color: '#cc0044',
            colorDark: '#880022'
        },
        'tesla_turret': {
            name: 'Tesla Coil',
            description: 'Chain lightning to multiple enemies',
            health: 120,
            maxHealth: 120,
            range: 180,
            damage: 25,
            fireRate: 0.8,
            chainCount: 3,
            chainRange: 100,
            projectileSpeed: 800,
            projectileColor: '#44aaff',
            cost: { 'iron-plate': 25, 'copper-plate': 50, 'circuit': 15 },
            color: '#2266aa',
            colorDark: '#113366'
        },
        'cannon_turret': {
            name: 'Cannon',
            description: 'Slow, explosive AoE damage',
            health: 300,
            maxHealth: 300,
            range: 280,
            damage: 100,
            fireRate: 0.5,
            splashRadius: 80,
            projectileSpeed: 250,
            projectileColor: '#333333',
            cost: { 'iron-plate': 50, 'gear': 20, 'coal': 30 },
            color: '#444455',
            colorDark: '#222233'
        }
    },
    
    // Initialize
    init() {
        this.list = [];
        this.projectiles = [];
    },
    
    // Check if can place tower
    canPlace(type, x, y) {
        // Check bounds
        if (!Utils.inBounds(x, y)) return false;
        
        // Check collision with buildings
        if (Buildings.getAt(x, y)) return false;
        
        // Check collision with other towers
        if (this.getAt(x, y)) return false;
        
        // Check cost
        const towerType = this.TYPES[type];
        if (!Resources.canAfford(towerType.cost)) return false;
        
        return true;
    },
    
    // Place a tower
    place(type, x, y) {
        if (!this.canPlace(type, x, y)) {
            Audio.playError();
            return false;
        }
        
        const towerType = this.TYPES[type];
        Resources.payCost(towerType.cost);
        
        this.list.push({
            type,
            x,
            y,
            health: towerType.maxHealth,
            maxHealth: towerType.maxHealth,
            cooldown: 0,
            angle: 0,
            target: null
        });
        
        Audio.playPlace();
        return true;
    },
    
    // Remove a tower
    remove(x, y) {
        const tower = this.getAt(x, y);
        if (!tower) return false;
        
        const idx = this.list.indexOf(tower);
        if (idx !== -1) {
            this.list.splice(idx, 1);
            // Refund half
            const towerType = this.TYPES[tower.type];
            Resources.refundHalf(towerType.cost);
            Audio.playDelete();
            return true;
        }
        return false;
    },
    
    // Get tower at position
    getAt(x, y) {
        return this.list.find(t => t.x === x && t.y === y);
    },
    
    // Update all towers
    update(dt) {
        // Update towers
        this.list.forEach(tower => this.updateTower(tower, dt));
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            this.updateProjectile(proj, dt);
            
            // Remove dead projectiles
            if (proj.dead) {
                this.projectiles.splice(i, 1);
            }
        }
    },
    
    // Update single tower
    updateTower(tower, dt) {
        const type = this.TYPES[tower.type];
        const towerX = (tower.x + 0.5) * CONFIG.TILE_SIZE;
        const towerY = (tower.y + 0.5) * CONFIG.TILE_SIZE;
        
        // Reduce cooldown
        tower.cooldown = Math.max(0, tower.cooldown - dt);
        
        // Find target
        const target = Enemies.getNearest(towerX, towerY, type.range);
        tower.target = target;
        
        if (target) {
            // Rotate toward target
            const dx = target.x - towerX;
            const dy = target.y - towerY;
            tower.angle = Math.atan2(dy, dx);
            
            // Fire if ready
            if (tower.cooldown <= 0) {
                tower.cooldown = 1 / type.fireRate;
                this.fire(tower, target);
            }
        }
    },
    
    // Fire at target
    fire(tower, target) {
        const type = this.TYPES[tower.type];
        const startX = (tower.x + 0.5) * CONFIG.TILE_SIZE;
        const startY = (tower.y + 0.5) * CONFIG.TILE_SIZE;
        
        this.projectiles.push({
            towerType: tower.type,
            x: startX,
            y: startY,
            targetX: target.x,
            targetY: target.y,
            target: target,
            speed: type.projectileSpeed,
            damage: type.damage,
            color: type.projectileColor,
            splashRadius: type.splashRadius || 0,
            chainCount: type.chainCount || 0,
            chainRange: type.chainRange || 0,
            burnDamage: type.burnDamage || 0,
            burnDuration: type.burnDuration || 0
        });
        
        // Visual feedback
        tower.firing = true;
        setTimeout(() => tower.firing = false, 50);
        
        // Sound
        Audio.playShoot(tower.type);
    },
    
    // Update projectile
    updateProjectile(proj, dt) {
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 10) {
            // Hit target
            this.projectileHit(proj);
            proj.dead = true;
        } else {
            // Move toward target
            const moveX = (dx / dist) * proj.speed * dt;
            const moveY = (dy / dist) * proj.speed * dt;
            proj.x += moveX;
            proj.y += moveY;
        }
        
        // Timeout
        proj.lifetime = (proj.lifetime || 0) + dt;
        if (proj.lifetime > 5) proj.dead = true;
    },
    
    // Projectile hits
    projectileHit(proj) {
        // Splash damage
        if (proj.splashRadius > 0) {
            const enemies = Enemies.getInRadius(proj.targetX, proj.targetY, proj.splashRadius);
            enemies.forEach(e => {
                Enemies.damage(e, proj.damage);
            });
            Audio.playExplosion();
        } else if (proj.chainCount > 0) {
            // Chain lightning
            let targets = [proj.target];
            let lastTarget = proj.target;
            
            for (let i = 0; i < proj.chainCount; i++) {
                const nearby = Enemies.getInRadius(lastTarget.x, lastTarget.y, proj.chainRange)
                    .filter(e => !targets.includes(e));
                if (nearby.length > 0) {
                    const next = nearby[0];
                    targets.push(next);
                    lastTarget = next;
                }
            }
            
            targets.forEach(e => {
                Enemies.damage(e, proj.damage);
            });
            
            // Store chain for rendering
            proj.chainTargets = targets;
        } else {
            // Single target
            if (proj.target && proj.target.health > 0) {
                Enemies.damage(proj.target, proj.damage);
                
                // Apply burn
                if (proj.burnDamage > 0) {
                    proj.target.burning = {
                        damage: proj.burnDamage,
                        duration: proj.burnDuration
                    };
                }
            }
        }
    },
    
    // Get data for saving
    getData() {
        return {
            list: this.list.map(t => ({ ...t, target: null })),
            projectiles: [] // Don't save projectiles
        };
    },
    
    // Load data
    setData(data) {
        this.list = data.list?.map(t => ({ ...t })) || [];
        this.projectiles = [];
    }
};
