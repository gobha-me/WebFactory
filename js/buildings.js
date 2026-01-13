// Building Management
const Buildings = {
    // All placed buildings
    list: [],
    
    // Initialize
    init() {
        this.list = [];
    },
    
    // Get building at tile position
    getAt(x, y) {
        return this.list.find(b => {
            const size = Utils.getBuildingSize(b.type);
            return x >= b.x && x < b.x + size.w && y >= b.y && y < b.y + size.h;
        });
    },
    
    // Check if building can be placed
    canPlace(type, x, y) {
        const size = Utils.getBuildingSize(type);
        
        // Check bounds and collisions
        for (let dy = 0; dy < size.h; dy++) {
            for (let dx = 0; dx < size.w; dx++) {
                const tx = x + dx;
                const ty = y + dy;
                if (!Utils.inBounds(tx, ty)) return false;
                if (this.getAt(tx, ty)) return false;
            }
        }
        
        // Miners must be on resources
        if (type === 'miner') {
            let hasResource = false;
            for (let dy = 0; dy < size.h; dy++) {
                for (let dx = 0; dx < size.w; dx++) {
                    if (Terrain.hasResource(x + dx, y + dy)) {
                        hasResource = true;
                    }
                }
            }
            if (!hasResource) return false;
        }
        
        return true;
    },
    
    // Place a building
    place(type, x, y, rotation) {
        const cost = CONFIG.COSTS[type];
        if (!Resources.canAfford(cost)) {
            Audio.playError();
            return false;
        }
        if (!this.canPlace(type, x, y)) {
            Audio.playError();
            return false;
        }
        
        const building = {
            type,
            x,
            y,
            rotation: rotation || 0,
            inventory: {},
            output: {},
            progress: 0,
            health: 100,
            maxHealth: 100,
            recipe: type === 'assembler' ? 'gear' : null
        };
        
        this.list.push(building);
        Resources.payCost(cost);
        Audio.playPlace();
        return true;
    },
    
    // Remove a building
    remove(x, y) {
        const building = this.getAt(x, y);
        if (!building) return false;
        
        const idx = this.list.indexOf(building);
        if (idx !== -1) {
            this.list.splice(idx, 1);
            Resources.refundHalf(CONFIG.COSTS[building.type]);
            Audio.playDelete();
            return true;
        }
        return false;
    },
    
    // Get all buildings by type
    getByType(type) {
        return this.list.filter(b => b.type === type);
    },
    
    // Add item to building inventory
    addToInventory(building, item, amount = 1) {
        building.inventory[item] = (building.inventory[item] || 0) + amount;
    },
    
    // Remove item from building inventory
    removeFromInventory(building, item, amount = 1) {
        if ((building.inventory[item] || 0) < amount) return false;
        building.inventory[item] -= amount;
        if (building.inventory[item] <= 0) delete building.inventory[item];
        return true;
    },
    
    // Add item to building output
    addToOutput(building, item, amount = 1) {
        building.output[item] = (building.output[item] || 0) + amount;
    },
    
    // Remove item from building output
    removeFromOutput(building, item, amount = 1) {
        if ((building.output[item] || 0) < amount) return false;
        building.output[item] -= amount;
        if (building.output[item] <= 0) delete building.output[item];
        return true;
    },
    
    // Get inventory count
    getInventoryCount(building, item) {
        return building.inventory[item] || 0;
    },
    
    // Get output count
    getOutputCount(building, item) {
        return building.output[item] || 0;
    },
    
    // Get total output items
    getTotalOutput(building) {
        return Object.values(building.output || {}).reduce((a, b) => a + b, 0);
    },
    
    // Get total inventory items
    getTotalInventory(building) {
        return Object.values(building.inventory || {}).reduce((a, b) => a + b, 0);
    },
    
    // Get all buildings data for saving
    getData() {
        return this.list.map(b => ({
            ...b,
            inventory: { ...b.inventory },
            output: { ...b.output }
        }));
    },
    
    // Load buildings data
    setData(data) {
        this.list = data.map(b => ({
            ...b,
            inventory: { ...b.inventory },
            output: { ...b.output }
        }));
    }
};
