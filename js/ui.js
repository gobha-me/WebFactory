// UI Management
const UI = {
    tooltip: null,
    recipeSelect: null,
    selectedBuilding: null,
    
    // Initialize UI
    init() {
        this.tooltip = document.getElementById('tooltip');
        this.recipeSelect = document.getElementById('recipe-select');
        
        this.createResourceBar();
        this.createToolbar();
        this.setupEventListeners();
    },
    
    // Create resource bar
    createResourceBar() {
        const container = document.getElementById('resource-bar');
        container.innerHTML = CONFIG.RESOURCE_ORDER.map(res => `
            <div class="resource">
                <div class="resource-icon ${res}"></div>
                <span>${CONFIG.RESOURCE_NAMES[res].split(' ')[0]}: <span id="res-${res}">0</span></span>
            </div>
        `).join('');
    },
    
    // Create toolbar
    createToolbar() {
        const toolbar = document.getElementById('toolbar');
        toolbar.innerHTML = `
            <h3 data-category="tools">Tools</h3>
            <div class="tool-category" id="cat-tools">
                <button class="tool-btn active" data-tool="select">
                    <div class="icon select">🖱</div>
                    <div class="tool-info">
                        <div class="name">Select</div>
                        <div class="cost">View & interact</div>
                        <div class="hotkey">[Q]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="delete">
                    <div class="icon delete">✕</div>
                    <div class="tool-info">
                        <div class="name">Demolish</div>
                        <div class="cost">Remove buildings</div>
                        <div class="hotkey">[X]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="mine">
                    <div class="icon mine">⛏</div>
                    <div class="tool-info">
                        <div class="name">Hand Mine</div>
                        <div class="cost">Click on ore</div>
                        <div class="hotkey">[E]</div>
                    </div>
                </button>
            </div>

            <h3 data-category="extraction">Extraction</h3>
            <div class="tool-category" id="cat-extraction">
                <button class="tool-btn" data-tool="miner">
                    <div class="icon miner">⛏</div>
                    <div class="tool-info">
                        <div class="name">Miner</div>
                        <div class="cost">10 iron plates</div>
                        <div class="hotkey">[1]</div>
                    </div>
                </button>
            </div>

            <h3 data-category="logistics">Logistics</h3>
            <div class="tool-category" id="cat-logistics">
                <button class="tool-btn" data-tool="belt">
                    <div class="icon belt">→</div>
                    <div class="tool-info">
                        <div class="name">Belt</div>
                        <div class="cost">1 iron plate</div>
                        <div class="hotkey">[2]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="inserter">
                    <div class="icon inserter">⤵</div>
                    <div class="tool-info">
                        <div class="name">Inserter</div>
                        <div class="cost">2 iron, 1 gear</div>
                        <div class="hotkey">[3]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="chest">
                    <div class="icon chest">📦</div>
                    <div class="tool-info">
                        <div class="name">Chest</div>
                        <div class="cost">5 iron plates</div>
                        <div class="hotkey">[4]</div>
                    </div>
                </button>
            </div>

            <h3 data-category="production">Production</h3>
            <div class="tool-category" id="cat-production">
                <button class="tool-btn" data-tool="furnace">
                    <div class="icon furnace">🔥</div>
                    <div class="tool-info">
                        <div class="name">Furnace</div>
                        <div class="cost">10 iron ore</div>
                        <div class="hotkey">[5]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="assembler">
                    <div class="icon assembler">⚙</div>
                    <div class="tool-info">
                        <div class="name">Assembler</div>
                        <div class="cost">5 iron, 3 gears</div>
                        <div class="hotkey">[6]</div>
                    </div>
                </button>
            </div>

            <h3 data-category="defense">Defense</h3>
            <div class="tool-category" id="cat-defense">
                <button class="tool-btn" data-tool="gun_turret">
                    <div class="icon gun_turret">🔫</div>
                    <div class="tool-info">
                        <div class="name">Gun Turret</div>
                        <div class="cost">20 iron, 10 gear</div>
                        <div class="hotkey">[7]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="flame_turret">
                    <div class="icon flame_turret">🔥</div>
                    <div class="tool-info">
                        <div class="name">Flame Turret</div>
                        <div class="cost">15i, 20c, 50 coal</div>
                        <div class="hotkey">[8]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="laser_turret">
                    <div class="icon laser_turret">⚡</div>
                    <div class="tool-info">
                        <div class="name">Laser Turret</div>
                        <div class="cost">30i, 30c, 20 circuit</div>
                        <div class="hotkey">[9]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="tesla_turret">
                    <div class="icon tesla_turret">⚡</div>
                    <div class="tool-info">
                        <div class="name">Tesla Coil</div>
                        <div class="cost">25i, 50c, 15 circuit</div>
                        <div class="hotkey">[0]</div>
                    </div>
                </button>
                <button class="tool-btn" data-tool="cannon_turret">
                    <div class="icon cannon_turret">💣</div>
                    <div class="tool-info">
                        <div class="name">Cannon</div>
                        <div class="cost">50i, 20 gear, 30 coal</div>
                        <div class="hotkey">[-]</div>
                    </div>
                </button>
            </div>

            <h3 data-category="speed">Game Speed</h3>
            <div class="tool-category" id="cat-speed">
                <div class="game-speed">
                    <button class="speed-btn" data-speed="0.5">0.5x</button>
                    <button class="speed-btn active" data-speed="1">1x</button>
                    <button class="speed-btn" data-speed="2">2x</button>
                    <button class="speed-btn" data-speed="4">4x</button>
                </div>
            </div>

            <div class="instructions">
                <strong>Controls:</strong><br>
                <kbd>R</kbd> Rotate | <kbd>E</kbd> Mine<br>
                <kbd>WASD</kbd> Pan | <kbd>Scroll</kbd> Zoom<br>
                <strong>Dev:</strong> <kbd>\`</kbd> Toggle<br>
                <kbd>F1</kbd> Wave <kbd>F2</kbd> Kill <kbd>F3</kbd> Res
            </div>
        `;
        
        // Category collapse handlers
        toolbar.querySelectorAll('h3[data-category]').forEach(header => {
            header.addEventListener('click', () => {
                Audio.playUIClick();
                header.classList.toggle('collapsed');
                const category = document.getElementById('cat-' + header.dataset.category);
                if (category) {
                    category.classList.toggle('collapsed');
                }
            });
        });
        
        // Tool button handlers
        toolbar.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Audio.playUIClick();
                Input.selectTool(btn.dataset.tool);
            });
        });
        
        // Speed button handlers
        toolbar.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Audio.playUIClick();
                Simulation.setSpeed(parseFloat(btn.dataset.speed));
                toolbar.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Create wave indicator
        this.createWaveIndicator();
        
        // Create minimap
        this.createMinimap();
        
        // Create sound toggle
        this.createSoundToggle();
    },
    
    // Create wave indicator element
    createWaveIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'wave-indicator';
        indicator.className = 'wave-indicator peaceful';
        indicator.innerHTML = `
            <div class="wave-title">Peaceful</div>
            <div class="wave-info">Next wave in: --:--</div>
        `;
        document.querySelector('.canvas-container').appendChild(indicator);
    },
    
    // Create minimap
    createMinimap() {
        const container = document.createElement('div');
        container.className = 'minimap-container';
        container.innerHTML = `
            <div class="minimap-header">
                <span>MINIMAP</span>
            </div>
            <canvas id="minimap" width="150" height="150"></canvas>
        `;
        document.querySelector('.canvas-container').appendChild(container);
        
        // Click to navigate
        const minimap = document.getElementById('minimap');
        minimap.addEventListener('click', (e) => {
            const rect = minimap.getBoundingClientRect();
            const x = (e.clientX - rect.left) / minimap.width;
            const y = (e.clientY - rect.top) / minimap.height;
            
            Renderer.camera.x = x * CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE * Renderer.camera.zoom - Renderer.canvas.width / 2;
            Renderer.camera.y = y * CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE * Renderer.camera.zoom - Renderer.canvas.height / 2;
        });
    },
    
    // Update minimap
    updateMinimap() {
        const canvas = document.getElementById('minimap');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const scale = canvas.width / CONFIG.MAP_WIDTH;
        
        // Clear
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw resources
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const tile = Terrain.tiles[y]?.[x];
                if (tile?.resource && tile.amount > 0) {
                    const colors = { iron: '#8899bb', copper: '#cc9966', coal: '#444' };
                    ctx.fillStyle = colors[tile.resource] || '#666';
                    ctx.fillRect(x * scale, y * scale, scale + 0.5, scale + 0.5);
                }
            }
        }
        
        // Draw buildings
        ctx.fillStyle = '#ffaa00';
        Buildings.list.forEach(b => {
            const size = Utils.getBuildingSize(b.type);
            ctx.fillRect(b.x * scale, b.y * scale, size.w * scale + 0.5, size.h * scale + 0.5);
        });
        
        // Draw towers
        ctx.fillStyle = '#4a9eff';
        Towers.list.forEach(t => {
            ctx.fillRect(t.x * scale, t.y * scale, scale + 0.5, scale + 0.5);
        });
        
        // Draw enemies
        ctx.fillStyle = '#ff4444';
        Enemies.list.forEach(e => {
            const ex = e.x / CONFIG.TILE_SIZE * scale;
            const ey = e.y / CONFIG.TILE_SIZE * scale;
            ctx.beginPath();
            ctx.arc(ex, ey, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw viewport
        const viewX = Renderer.camera.x / (CONFIG.TILE_SIZE * Renderer.camera.zoom) * scale;
        const viewY = Renderer.camera.y / (CONFIG.TILE_SIZE * Renderer.camera.zoom) * scale;
        const viewW = Renderer.canvas.width / (CONFIG.TILE_SIZE * Renderer.camera.zoom) * scale;
        const viewH = Renderer.canvas.height / (CONFIG.TILE_SIZE * Renderer.camera.zoom) * scale;
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(viewX, viewY, viewW, viewH);
    },
    
    // Create sound toggle
    createSoundToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'sound-toggle';
        toggle.id = 'sound-toggle';
        toggle.innerHTML = '🔊 Sound';
        toggle.addEventListener('click', () => {
            const enabled = Audio.toggle();
            toggle.innerHTML = enabled ? '🔊 Sound' : '🔇 Muted';
            toggle.classList.toggle('muted', !enabled);
        });
        document.querySelector('.canvas-container').appendChild(toggle);
    },
    
    // Update wave indicator
    updateWaveIndicator() {
        const indicator = document.getElementById('wave-indicator');
        if (!indicator) return;
        
        const waveActive = Enemies.waveActive;
        const timeUntil = Enemies.getTimeUntilWave();
        
        indicator.className = 'wave-indicator ' + (waveActive ? '' : 'peaceful');
        
        if (waveActive) {
            indicator.innerHTML = `
                <div class="wave-title">⚔ WAVE ${Enemies.wave} ⚔</div>
                <div class="wave-info">Enemies remaining: ${Enemies.enemiesRemaining}</div>
            `;
        } else {
            const minutes = Math.floor(timeUntil / 60);
            const seconds = Math.floor(timeUntil % 60);
            indicator.innerHTML = `
                <div class="wave-title">Wave ${Enemies.wave + 1} incoming</div>
                <div class="wave-info">Time until wave: ${minutes}:${seconds.toString().padStart(2, '0')}</div>
            `;
        }
        
        // Dev mode indicator
        this.updateDevModeIndicator();
    },
    
    // Show dev mode notification
    showDevModeNotification() {
        const existing = document.getElementById('dev-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.id = 'dev-notification';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${CONFIG.DEV_MODE ? 'rgba(68, 255, 68, 0.9)' : 'rgba(255, 68, 68, 0.9)'};
            color: #000;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 9999;
            pointer-events: none;
        `;
        notification.textContent = CONFIG.DEV_MODE ? '🛠 DEV MODE ON' : '🎮 DEV MODE OFF';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 1500);
    },
    
    // Update dev mode indicator
    updateDevModeIndicator() {
        let indicator = document.getElementById('dev-mode-indicator');
        
        if (CONFIG.DEV_MODE) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'dev-mode-indicator';
                indicator.style.cssText = `
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    background: rgba(68, 255, 68, 0.8);
                    color: #000;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 9999;
                `;
                indicator.textContent = '🛠 DEV MODE';
                document.body.appendChild(indicator);
            }
        } else {
            if (indicator) indicator.remove();
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Menu buttons
        document.getElementById('btn-new').addEventListener('click', () => this.showModal('new-modal'));
        document.getElementById('btn-save').addEventListener('click', () => {
            SaveLoad.updateSaveSlots();
            this.showModal('save-modal');
        });
        document.getElementById('btn-load').addEventListener('click', () => {
            SaveLoad.updateLoadSlots();
            this.showModal('load-modal');
        });
        document.getElementById('save-new').addEventListener('click', () => {
            SaveLoad.saveToNewSlot();
            this.closeModal('save-modal');
        });
        document.getElementById('confirm-new').addEventListener('click', () => {
            game.newGame();
            this.closeModal('new-modal');
        });
        
        // Recipe select
        document.querySelectorAll('.recipe-option').forEach(opt => {
            opt.addEventListener('click', () => {
                if (this.selectedBuilding && this.selectedBuilding.type === 'assembler') {
                    this.selectedBuilding.recipe = opt.dataset.recipe;
                    this.recipeSelect.style.display = 'none';
                }
            });
        });
        
        // Close recipe select when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!this.recipeSelect.contains(e.target)) {
                this.recipeSelect.style.display = 'none';
            }
        });
    },
    
    // Update resource display
    updateResources() {
        CONFIG.RESOURCE_ORDER.forEach(res => {
            const el = document.getElementById(`res-${res}`);
            if (el) {
                el.textContent = Utils.formatNumber(Resources.get(res));
            }
        });
    },
    
    // Update tool button states
    updateToolButtons(activeTool) {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            const tool = btn.dataset.tool;
            btn.classList.toggle('active', tool === activeTool);
            
            // Disable if can't afford
            if (CONFIG.COSTS[tool]) {
                btn.classList.toggle('disabled', !Resources.canAfford(CONFIG.COSTS[tool]));
            }
        });
    },
    
    // Update tooltip
    updateTooltip(clientX, clientY, mouseWorld) {
        const building = Buildings.getAt(mouseWorld.x, mouseWorld.y);
        const tile = Terrain.getTile(mouseWorld.x, mouseWorld.y);
        
        if (building) {
            let info = `<strong style="color:#4a9eff">${building.type.toUpperCase()}</strong><br>`;
            if (building.type === 'assembler') {
                info += `Recipe: ${building.recipe || 'None'}<br>`;
            }
            const invItems = Object.entries(building.inventory).filter(([k, v]) => v > 0);
            const outItems = Object.entries(building.output).filter(([k, v]) => v > 0);
            if (invItems.length > 0) {
                info += '<span style="color:#aaa">Input:</span> ' + invItems.map(([k, v]) => `${k}: ${v}`).join(', ') + '<br>';
            }
            if (outItems.length > 0) {
                info += '<span style="color:#aaa">Output:</span> ' + outItems.map(([k, v]) => `${k}: ${v}`).join(', ');
            }
            this.tooltip.innerHTML = info;
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = (clientX + 15) + 'px';
            this.tooltip.style.top = (clientY + 15) + 'px';
        } else if (tile?.resource && tile.amount > 0) {
            this.tooltip.innerHTML = `<strong style="color:#4a9eff">${tile.resource.toUpperCase()} ORE</strong><br>Amount: ${Utils.formatNumber(tile.amount)}<br><span style="color:#88cc44">Click with Mine tool [E] to harvest</span>`;
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = (clientX + 15) + 'px';
            this.tooltip.style.top = (clientY + 15) + 'px';
        } else {
            this.tooltip.style.display = 'none';
        }
    },
    
    // Show recipe select
    showRecipeSelect(clientX, clientY, building) {
        this.selectedBuilding = building;
        this.recipeSelect.style.display = 'block';
        this.recipeSelect.style.left = (clientX + 10) + 'px';
        this.recipeSelect.style.top = (clientY + 10) + 'px';
    },
    
    // Show modal
    showModal(id) {
        document.getElementById(id).style.display = 'flex';
    },
    
    // Close modal
    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }
};