// Resource Management
const Resources = {
    // Current resource counts
    inventory: {},
    
    // Initialize resources
    init() {
        this.inventory = Utils.deepClone(CONFIG.STARTING_RESOURCES);
    },
    
    // Get resource count
    get(type) {
        return this.inventory[type] || 0;
    },
    
    // Add resources
    add(type, amount) {
        this.inventory[type] = (this.inventory[type] || 0) + amount;
    },
    
    // Remove resources (returns false if not enough)
    remove(type, amount) {
        if (this.get(type) < amount) return false;
        this.inventory[type] -= amount;
        return true;
    },
    
    // Check if player can afford a cost
    canAfford(costObj) {
        if (CONFIG.DEV_MODE) return true;
        if (!costObj) return true;
        for (const [res, amount] of Object.entries(costObj)) {
            if (this.get(res) < amount) return false;
        }
        return true;
    },
    
    // Pay a cost (deduct resources)
    payCost(costObj) {
        if (CONFIG.DEV_MODE) return true;
        if (!costObj) return true;
        if (!this.canAfford(costObj)) return false;
        for (const [res, amount] of Object.entries(costObj)) {
            this.remove(res, amount);
        }
        return true;
    },
    
    // Refund half cost (for demolishing)
    refundHalf(costObj) {
        if (!costObj) return;
        for (const [res, amount] of Object.entries(costObj)) {
            this.add(res, Math.floor(amount / 2));
        }
    },
    
    // Get all resources as object
    getAll() {
        return Utils.deepClone(this.inventory);
    },
    
    // Set all resources from object
    setAll(data) {
        this.inventory = Utils.deepClone(data);
    }
};
