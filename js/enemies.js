// Enemy System
const Enemies = {
    list: [],
    wave: 0,
    waveTimer: 0,
    timeBetweenWaves: 120, // seconds between waves
    waveActive: false,
    enemiesRemaining: 0,
    spawnQueue: [],
    spawnTimer: 0,
    
    // Enemy types
    TYPES: {
        'biter': {
            health: 50,
            maxHealth: 50,
            speed: 30, // pixels per second
            damage: 10,
            attackSpeed: 1, // attacks per second
            range: 40, // attack range in pixels
            color: '#44aa44',
            colorDark: '#227722',
            size: 0.6, // tile fraction
            xp: 10
        },
        'spitter': {
            health: 30,
            maxHealth: 30,
            speed: 25,
            damage: 15,
            attackSpeed: 0.5,
            range: 120,
            color: '#aa44aa',
            colorDark: '#772277',
            size: 0.5,
            xp: 15
        },
        'big_biter': {
            health: 200,
            maxHealth: 200,
            speed: 20,
            damage: 30,
            attackSpeed: 0.8,
            range: 50,
            color: '#228822',
            colorDark: '#115511',
            size: 0.9,
            xp: 50
        },
        'tank_biter': {
            health: 500,
            maxHealth: 500,
            speed: 15,
            damage: 50,
            attackSpeed: 0.5,
            range: 60,
            color: '#116611',
            colorDark: '#0a440a',
            size: 1.2,
            xp: 100
        }
    },
    
    // Initialize
    init() {
        this.list = [];
        this.wave = 0;
        this.waveTimer = this.timeBetweenWaves * 0.5; // First wave comes sooner
        this.waveActive = false;
        this.enemiesRemaining = 0;
        this.spawnQueue = [];
        this.spawnTimer = 0;
    },
    
    // Update enemies
    update(dt) {
        // Wave timer
        if (!this.waveActive) {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                this.startWave();
            }
        }
        
        // Spawn queued enemies
        if (this.spawnQueue.length > 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                this.spawnTimer = 0.5; // Spawn every 0.5 seconds
                const spawn = this.spawnQueue.shift();
                this.spawnEnemy(spawn.type, spawn.x, spawn.y);
            }
        }
        
        // Update each enemy
        for (let i = this.list.length - 1; i >= 0; i--) {
            const enemy = this.list[i];
            this.updateEnemy(enemy, dt);
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.list.splice(i, 1);
                this.enemiesRemaining--;
                Resources.add('xp', enemy.xp || 10);
                Audio.playEnemyDeath();
            }
        }
        
        // Check if wave is complete
        if (this.waveActive && this.enemiesRemaining <= 0 && this.spawnQueue.length === 0) {
            this.waveActive = false;
            this.waveTimer = this.timeBetweenWaves;
            Audio.playWaveComplete();
        }
    },
    
    // Update single enemy
    updateEnemy(enemy, dt) {
        const type = this.TYPES[enemy.type];
        
        // Find target (nearest building or base center)
        const target = this.findTarget(enemy);
        
        if (target) {
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Move toward target if not in range
            if (dist > type.range) {
                const moveX = (dx / dist) * type.speed * dt;
                const moveY = (dy / dist) * type.speed * dt;
                enemy.x += moveX;
                enemy.y += moveY;
                enemy.angle = Math.atan2(dy, dx);
            } else {
                // Attack
                enemy.attackCooldown = (enemy.attackCooldown || 0) - dt;
                if (enemy.attackCooldown <= 0) {
                    enemy.attackCooldown = 1 / type.attackSpeed;
                    this.attack(enemy, target);
                }
            }
        }
        
        // Animation
        enemy.animTime = (enemy.animTime || 0) + dt * 5;
    },
    
    // Find nearest target for enemy
    findTarget(enemy) {
        let nearest = null;
        let nearestDist = Infinity;
        
        // Check buildings
        Buildings.list.forEach(b => {
            const size = Utils.getBuildingSize(b.type);
            const bx = (b.x + size.w / 2) * CONFIG.TILE_SIZE;
            const by = (b.y + size.h / 2) * CONFIG.TILE_SIZE;
            const dist = Math.sqrt((bx - enemy.x) ** 2 + (by - enemy.y) ** 2);
            
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = { x: bx, y: by, building: b };
            }
        });
        
        // Check towers
        Towers.list.forEach(t => {
            const tx = (t.x + 0.5) * CONFIG.TILE_SIZE;
            const ty = (t.y + 0.5) * CONFIG.TILE_SIZE;
            const dist = Math.sqrt((tx - enemy.x) ** 2 + (ty - enemy.y) ** 2);
            
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = { x: tx, y: ty, tower: t };
            }
        });
        
        // If no targets, go to map center
        if (!nearest) {
            nearest = {
                x: CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE / 2,
                y: CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE / 2
            };
        }
        
        return nearest;
    },
    
    // Enemy attacks target
    attack(enemy, target) {
        const type = this.TYPES[enemy.type];
        
        if (target.building) {
            target.building.health = (target.building.health || 100) - type.damage;
            Audio.playBuildingDamage();
            if (target.building.health <= 0) {
                Buildings.remove(target.building.x, target.building.y);
                Audio.playBuildingDestroyed();
            }
        } else if (target.tower) {
            target.tower.health -= type.damage;
            Audio.playBuildingDamage();
            if (target.tower.health <= 0) {
                Towers.remove(target.tower.x, target.tower.y);
                Audio.playBuildingDestroyed();
            }
        }
        
        // Visual feedback
        enemy.attacking = true;
        setTimeout(() => enemy.attacking = false, 100);
    },
    
    // Start a new wave
    startWave() {
        this.wave++;
        this.waveActive = true;
        Audio.playWaveStart();
        
        // Calculate wave composition
        const baseCount = 5 + this.wave * 3;
        const spawnPoints = this.getSpawnPoints();
        
        // Distribute enemies across spawn points
        spawnPoints.forEach(point => {
            let count = Math.ceil(baseCount / spawnPoints.length);
            
            for (let i = 0; i < count; i++) {
                let type = 'biter';
                
                // Higher waves get tougher enemies
                if (this.wave >= 3 && Math.random() < 0.2) type = 'spitter';
                if (this.wave >= 5 && Math.random() < 0.15) type = 'big_biter';
                if (this.wave >= 8 && Math.random() < 0.1) type = 'tank_biter';
                
                // Add some randomness to spawn position
                const offsetX = (Math.random() - 0.5) * 200;
                const offsetY = (Math.random() - 0.5) * 200;
                
                this.spawnQueue.push({
                    type,
                    x: point.x + offsetX,
                    y: point.y + offsetY
                });
                this.enemiesRemaining++;
            }
        });
    },
    
    // Get spawn points at map edges
    getSpawnPoints() {
        const points = [];
        const margin = 2 * CONFIG.TILE_SIZE;
        const mapW = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
        const mapH = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
        
        // Pick 1-4 spawn points based on wave number
        const numPoints = Math.min(4, 1 + Math.floor(this.wave / 3));
        
        const edges = [
            { x: margin, y: mapH / 2 },           // Left
            { x: mapW - margin, y: mapH / 2 },    // Right
            { x: mapW / 2, y: margin },           // Top
            { x: mapW / 2, y: mapH - margin }     // Bottom
        ];
        
        // Shuffle and pick
        for (let i = edges.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [edges[i], edges[j]] = [edges[j], edges[i]];
        }
        
        return edges.slice(0, numPoints);
    },
    
    // Spawn a single enemy
    spawnEnemy(type, x, y) {
        const enemyType = this.TYPES[type];
        this.list.push({
            type,
            x,
            y,
            health: enemyType.maxHealth,
            maxHealth: enemyType.maxHealth,
            angle: 0,
            animTime: 0,
            attackCooldown: 0,
            xp: enemyType.xp
        });
    },
    
    // Damage an enemy
    damage(enemy, amount) {
        enemy.health -= amount;
        enemy.damageFlash = 0.1;
        Audio.playEnemyHit();
    },
    
    // Get enemies in radius
    getInRadius(x, y, radius) {
        return this.list.filter(e => {
            const dist = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2);
            return dist <= radius;
        });
    },
    
    // Get nearest enemy to position
    getNearest(x, y, maxRange = Infinity) {
        let nearest = null;
        let nearestDist = maxRange;
        
        this.list.forEach(e => {
            const dist = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = e;
            }
        });
        
        return nearest;
    },
    
    // Get time until next wave
    getTimeUntilWave() {
        return this.waveActive ? 0 : Math.max(0, this.waveTimer);
    },
    
    // Get data for saving
    getData() {
        return {
            list: this.list.map(e => ({ ...e })),
            wave: this.wave,
            waveTimer: this.waveTimer,
            waveActive: this.waveActive,
            enemiesRemaining: this.enemiesRemaining,
            spawnQueue: [...this.spawnQueue]
        };
    },
    
    // Load data
    setData(data) {
        this.list = data.list?.map(e => ({ ...e })) || [];
        this.wave = data.wave || 0;
        this.waveTimer = data.waveTimer || this.timeBetweenWaves;
        this.waveActive = data.waveActive || false;
        this.enemiesRemaining = data.enemiesRemaining || 0;
        this.spawnQueue = data.spawnQueue || [];
    }
};
