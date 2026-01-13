// Terrain Management
const Terrain = {
    // Map data
    tiles: [],
    
    // Initialize terrain
    init() {
        this.generate();
    },
    
    // Generate new map
    generate() {
        this.tiles = [];
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                this.tiles[y][x] = { 
                    type: 'grass', 
                    resource: null, 
                    amount: 0 
                };
            }
        }
        
        // Generate resource patches
        this.generatePatch(20, 20, 8, 'iron', 5000);
        this.generatePatch(35, 15, 6, 'iron', 4000);
        this.generatePatch(60, 30, 7, 'iron', 4500);
        this.generatePatch(15, 35, 7, 'copper', 4500);
        this.generatePatch(40, 45, 6, 'copper', 4000);
        this.generatePatch(70, 50, 6, 'copper', 4000);
        this.generatePatch(50, 25, 5, 'coal', 3000);
        this.generatePatch(25, 55, 5, 'coal', 3000);
        this.generatePatch(65, 15, 4, 'coal', 2500);
    },
    
    // Generate a resource patch
    generatePatch(cx, cy, radius, type, amount) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius && Math.random() > dist / radius * 0.5) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (Utils.inBounds(x, y)) {
                        this.tiles[y][x].resource = type;
                        this.tiles[y][x].amount = Math.floor(amount * (1 - dist / radius * 0.5));
                    }
                }
            }
        }
    },
    
    // Get tile at position
    getTile(x, y) {
        if (!Utils.inBounds(x, y)) return null;
        return this.tiles[y][x];
    },
    
    // Mine from a tile (returns resource type or null)
    mine(x, y, amount = 1) {
        const tile = this.getTile(x, y);
        if (!tile || !tile.resource || tile.amount <= 0) return null;
        
        const resourceType = tile.resource;
        const mined = Math.min(amount, tile.amount);
        tile.amount -= mined;
        
        if (tile.amount <= 0) {
            tile.resource = null;
            tile.amount = 0;
        }
        
        return { type: resourceType, amount: mined };
    },
    
    // Check if tile has resource
    hasResource(x, y) {
        const tile = this.getTile(x, y);
        return tile && tile.resource && tile.amount > 0;
    },
    
    // Get all tiles data for saving
    getData() {
        return this.tiles.map(row => row.map(t => ({ ...t })));
    },
    
    // Load tiles data
    setData(data) {
        this.tiles = data.map(row => row.map(t => ({ ...t })));
    }
};
