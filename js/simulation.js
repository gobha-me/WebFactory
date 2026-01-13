// Game Simulation / Logic
const Simulation = {
    gameTime: 0,
    gameSpeed: 1,
    
    // Manual mining state
    mining: {
        active: false,
        x: 0,
        y: 0,
        progress: 0
    },
    
    // Initialize
    init() {
        this.gameTime = 0;
        this.gameSpeed = 1;
        this.mining = { active: false, x: 0, y: 0, progress: 0 };
    },
    
    // Main update function
    update(dt) {
        dt *= this.gameSpeed;
        this.gameTime += dt;
        
        this.updateManualMining(dt);
        this.updateMiners(dt);
        this.updateFurnaces(dt);
        this.updateAssemblers(dt);
        this.updateInserters(dt);
        this.updateBelts(dt);
        this.updateChests(dt);
    },
    
    // Manual mining update
    updateManualMining(dt) {
        if (!this.mining.active) return;
        
        const tile = Terrain.getTile(this.mining.x, this.mining.y);
        if (!tile || !tile.resource || tile.amount <= 0) {
            this.mining.active = false;
            this.mining.progress = 0;
            return;
        }
        
        this.mining.progress += dt / CONFIG.MANUAL_MINE_RATE;
        
        // Play mine sound periodically
        this.mining.soundTimer = (this.mining.soundTimer || 0) + dt;
        if (this.mining.soundTimer > 0.3) {
            this.mining.soundTimer = 0;
            Audio.playMine();
        }
        
        if (this.mining.progress >= 1) {
            this.mining.progress = 0;
            const result = Terrain.mine(this.mining.x, this.mining.y, CONFIG.MANUAL_MINE_AMOUNT);
            if (result) {
                Resources.add(result.type, result.amount);
                Audio.playMineComplete();
            }
            
            // Check if resource depleted
            if (!Terrain.hasResource(this.mining.x, this.mining.y)) {
                this.mining.active = false;
            }
        }
    },
    
    // Start manual mining at position
    startMining(x, y) {
        if (Terrain.hasResource(x, y) && !Buildings.getAt(x, y)) {
            this.mining.active = true;
            this.mining.x = x;
            this.mining.y = y;
            this.mining.progress = 0;
            return true;
        }
        return false;
    },
    
    // Stop manual mining
    stopMining() {
        this.mining.active = false;
        this.mining.progress = 0;
    },
    
    // Update miners
    updateMiners(dt) {
        Buildings.getByType('miner').forEach(miner => {
            const size = Utils.getBuildingSize('miner');
            let resourceType = null;
            let hasResource = false;
            
            // Find resource under miner
            for (let dy = 0; dy < size.h && !hasResource; dy++) {
                for (let dx = 0; dx < size.w && !hasResource; dx++) {
                    const tile = Terrain.getTile(miner.x + dx, miner.y + dy);
                    if (tile?.resource && tile.amount > 0) {
                        resourceType = tile.resource;
                        hasResource = true;
                    }
                }
            }
            
            if (hasResource && resourceType) {
                miner.progress += dt * CONFIG.SPEEDS.miner;
                if (miner.progress >= 1) {
                    miner.progress = 0;
                    Buildings.addToOutput(miner, resourceType);
                    
                    // Deplete resource
                    for (let dy = 0; dy < size.h; dy++) {
                        for (let dx = 0; dx < size.w; dx++) {
                            const result = Terrain.mine(miner.x + dx, miner.y + dy, 1);
                            if (result) return;
                        }
                    }
                }
            }
        });
    },
    
    // Update furnaces
    updateFurnaces(dt) {
        Buildings.getByType('furnace').forEach(furnace => {
            const hasCoal = Buildings.getInventoryCount(furnace, 'coal') > 0;
            const hasIron = Buildings.getInventoryCount(furnace, 'iron') > 0;
            const hasCopper = Buildings.getInventoryCount(furnace, 'copper') > 0;
            
            if (hasCoal && (hasIron || hasCopper)) {
                furnace.progress += dt * CONFIG.SPEEDS.furnace;
                if (furnace.progress >= 1) {
                    furnace.progress = 0;
                    Buildings.removeFromInventory(furnace, 'coal');
                    
                    if (hasIron) {
                        Buildings.removeFromInventory(furnace, 'iron');
                        Buildings.addToOutput(furnace, 'iron-plate');
                    } else if (hasCopper) {
                        Buildings.removeFromInventory(furnace, 'copper');
                        Buildings.addToOutput(furnace, 'copper-plate');
                    }
                }
            }
        });
    },
    
    // Update assemblers
    updateAssemblers(dt) {
        Buildings.getByType('assembler').forEach(asm => {
            if (!asm.recipe) return;
            
            const recipe = CONFIG.RECIPES[asm.recipe];
            if (!recipe) return;
            
            // Check if can craft
            let canCraft = true;
            for (const [item, amount] of Object.entries(recipe.inputs)) {
                if (Buildings.getInventoryCount(asm, item) < amount) {
                    canCraft = false;
                    break;
                }
            }
            
            if (canCraft) {
                asm.progress += dt * CONFIG.SPEEDS.assembler;
                if (asm.progress >= 1) {
                    asm.progress = 0;
                    
                    // Consume inputs
                    for (const [item, amount] of Object.entries(recipe.inputs)) {
                        Buildings.removeFromInventory(asm, item, amount);
                    }
                    
                    // Produce output
                    Buildings.addToOutput(asm, recipe.output, recipe.outputCount);
                }
            }
        });
    },
    
    // Update inserters
    updateInserters(dt) {
        Buildings.getByType('inserter').forEach(ins => {
            const dir = CONFIG.DIR[ins.rotation];
            const pickupX = ins.x - dir.x;
            const pickupY = ins.y - dir.y;
            const dropX = ins.x + dir.x;
            const dropY = ins.y + dir.y;
            
            const source = Buildings.getAt(pickupX, pickupY);
            const dest = Buildings.getAt(dropX, dropY);
            
            if (!source) return;
            
            // Find item to transfer from source output
            for (const [item, count] of Object.entries(source.output || {})) {
                if (count > 0) {
                    ins.progress += dt * CONFIG.SPEEDS.inserter;
                    if (ins.progress >= 1) {
                        ins.progress = 0;
                        Buildings.removeFromOutput(source, item);
                        
                        if (dest) {
                            // Drop into building
                            Buildings.addToInventory(dest, item);
                        } else if (source.type === 'chest') {
                            // Only chests can output to player inventory
                            Resources.add(item, 1);
                        }
                        // If no dest and not chest, item is lost
                    }
                    break;
                }
            }
        });
    },
    
    // Update belts
    updateBelts(dt) {
        Buildings.getByType('belt').forEach(belt => {
            const dir = CONFIG.DIR[belt.rotation];
            const nextX = belt.x + dir.x;
            const nextY = belt.y + dir.y;
            const nextBuilding = Buildings.getAt(nextX, nextY);
            
            // Move items from output to next building
            for (const [item, count] of Object.entries(belt.output || {})) {
                if (count > 0 && nextBuilding) {
                    Buildings.removeFromOutput(belt, item);
                    Buildings.addToInventory(nextBuilding, item);
                }
            }
            
            // Move items through belt (inventory -> output)
            belt.progress = (belt.progress || 0) + dt * CONFIG.SPEEDS.belt;
            if (belt.progress >= 1) {
                belt.progress = 0;
                for (const [item, count] of Object.entries(belt.inventory || {})) {
                    if (count > 0) {
                        Buildings.removeFromInventory(belt, item);
                        Buildings.addToOutput(belt, item);
                        break;
                    }
                }
            }
        });
    },
    
    // Update chests (move inventory to output for inserters)
    updateChests(dt) {
        Buildings.getByType('chest').forEach(chest => {
            for (const [item, count] of Object.entries(chest.inventory)) {
                if (count > 0) {
                    chest.output[item] = (chest.output[item] || 0) + count;
                    chest.inventory[item] = 0;
                }
            }
        });
    },
    
    // Set game speed
    setSpeed(speed) {
        this.gameSpeed = speed;
    },
    
    // Get state for saving
    getData() {
        return {
            gameTime: this.gameTime
        };
    },
    
    // Load state
    setData(data) {
        this.gameTime = data.gameTime || 0;
    }
};
