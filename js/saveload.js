// Save/Load System
const SaveLoad = {
    STORAGE_KEY: 'minifactory_saves',
    
    // Get all saves
    getSaves() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    },
    
    // Set all saves
    setSaves(saves) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
    },
    
    // Save game to slot
    saveGame(slotId) {
        const saves = this.getSaves();
        saves[slotId] = {
            date: new Date().toISOString(),
            resources: Resources.getAll(),
            terrain: Terrain.getData(),
            buildings: Buildings.getData(),
            towers: Towers.getData(),
            enemies: Enemies.getData(),
            camera: { ...Renderer.camera },
            simulation: Simulation.getData()
        };
        this.setSaves(saves);
    },
    
    // Load game from slot
    loadGame(slotId) {
        const saves = this.getSaves();
        const save = saves[slotId];
        if (!save) return false;
        
        Resources.setAll(save.resources);
        Terrain.setData(save.terrain);
        Buildings.setData(save.buildings);
        if (save.towers) Towers.setData(save.towers);
        if (save.enemies) Enemies.setData(save.enemies);
        Renderer.camera = { ...save.camera };
        if (save.simulation) {
            Simulation.setData(save.simulation);
        }
        
        return true;
    },
    
    // Delete a save
    deleteSave(slotId) {
        const saves = this.getSaves();
        delete saves[slotId];
        this.setSaves(saves);
    },
    
    // Save to new slot
    saveToNewSlot() {
        const slotId = 'save_' + Date.now();
        this.saveGame(slotId);
    },
    
    // Update save slots UI
    updateSaveSlots() {
        const container = document.getElementById('save-slots');
        const saves = this.getSaves();
        const slots = Object.entries(saves);
        
        if (slots.length === 0) {
            container.innerHTML = '<div class="no-saves">No saved games</div>';
            return;
        }
        
        container.innerHTML = slots.map(([id, save]) => `
            <div class="save-slot">
                <div class="save-slot-info">
                    <div class="save-slot-name">Save ${new Date(save.date).toLocaleDateString()}</div>
                    <div class="save-slot-date">${new Date(save.date).toLocaleTimeString()}</div>
                </div>
                <div class="save-slot-actions">
                    <button class="save-slot-btn" onclick="SaveLoad.saveGame('${id}'); game.ui.closeModal('save-modal');">Overwrite</button>
                    <button class="save-slot-btn delete" onclick="SaveLoad.deleteSave('${id}'); SaveLoad.updateSaveSlots();">Delete</button>
                </div>
            </div>
        `).join('');
    },
    
    // Update load slots UI
    updateLoadSlots() {
        const container = document.getElementById('load-slots');
        const saves = this.getSaves();
        const slots = Object.entries(saves);
        
        if (slots.length === 0) {
            container.innerHTML = '<div class="no-saves">No saved games</div>';
            return;
        }
        
        container.innerHTML = slots.map(([id, save]) => `
            <div class="save-slot">
                <div class="save-slot-info">
                    <div class="save-slot-name">Save ${new Date(save.date).toLocaleDateString()}</div>
                    <div class="save-slot-date">${new Date(save.date).toLocaleTimeString()}</div>
                </div>
                <div class="save-slot-actions">
                    <button class="save-slot-btn" onclick="SaveLoad.loadGame('${id}'); game.ui.closeModal('load-modal');">Load</button>
                    <button class="save-slot-btn delete" onclick="SaveLoad.deleteSave('${id}'); SaveLoad.updateLoadSlots();">Delete</button>
                </div>
            </div>
        `).join('');
    }
};
