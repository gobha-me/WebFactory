// Input Handling
const Input = {
    currentTool: 'select',
    rotation: 0,
    mouseScreen: { x: 0, y: 0 },
    mouseWorld: { x: 0, y: 0 },
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    isMouseDown: false,
    
    // Initialize input handlers
    init() {
        const canvas = Renderer.canvas;
        
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mouseleave', () => this.onMouseLeave());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    },
    
    // Mouse down handler
    onMouseDown(e) {
        const rect = Renderer.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Right click or middle click to drag
        if (e.button === 2 || e.button === 1) {
            this.isDragging = true;
            this.lastMouse = { x: e.clientX, y: e.clientY };
            Renderer.canvas.style.cursor = 'grabbing';
            return;
        }
        
        this.isMouseDown = true;
        const world = Utils.screenToWorld(mx, my, Renderer.camera);
        
        if (this.currentTool === 'select') {
            const building = Buildings.getAt(world.x, world.y);
            if (building && building.type === 'assembler') {
                game.ui.showRecipeSelect(e.clientX, e.clientY, building);
            }
        } else if (this.currentTool === 'delete') {
            Buildings.remove(world.x, world.y);
            Towers.remove(world.x, world.y);
        } else if (this.currentTool === 'mine') {
            // Start manual mining
            Simulation.startMining(world.x, world.y);
        } else if (Towers.TYPES[this.currentTool]) {
            // Place tower
            Towers.place(this.currentTool, world.x, world.y);
        } else {
            Buildings.place(this.currentTool, world.x, world.y, this.rotation);
        }
    },
    
    // Mouse move handler
    onMouseMove(e) {
        const rect = Renderer.canvas.getBoundingClientRect();
        this.mouseScreen.x = e.clientX - rect.left;
        this.mouseScreen.y = e.clientY - rect.top;
        this.mouseWorld = Utils.screenToWorld(this.mouseScreen.x, this.mouseScreen.y, Renderer.camera);
        
        if (this.isDragging) {
            Renderer.camera.x -= (e.clientX - this.lastMouse.x);
            Renderer.camera.y -= (e.clientY - this.lastMouse.y);
            this.lastMouse = { x: e.clientX, y: e.clientY };
            return;
        }
        
        // Continue mining if holding mouse and using mine tool
        if (this.isMouseDown && this.currentTool === 'mine') {
            if (!Simulation.mining.active || 
                Simulation.mining.x !== this.mouseWorld.x || 
                Simulation.mining.y !== this.mouseWorld.y) {
                Simulation.startMining(this.mouseWorld.x, this.mouseWorld.y);
            }
        }
        
        // Update tooltip
        game.ui.updateTooltip(e.clientX, e.clientY, this.mouseWorld);
    },
    
    // Mouse up handler
    onMouseUp(e) {
        this.isDragging = false;
        this.isMouseDown = false;
        Renderer.canvas.style.cursor = 'crosshair';
        
        // Stop mining when releasing mouse
        if (this.currentTool === 'mine') {
            Simulation.stopMining();
        }
    },
    
    // Mouse leave handler
    onMouseLeave() {
        this.isDragging = false;
        this.isMouseDown = false;
        if (this.currentTool === 'mine') {
            Simulation.stopMining();
        }
    },
    
    // Mouse wheel handler
    onWheel(e) {
        e.preventDefault();
        const oldZoom = Renderer.camera.zoom;
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        Renderer.camera.zoom = Utils.clamp(Renderer.camera.zoom * zoomFactor, 0.4, 2.5);
        
        // Zoom toward mouse position
        const worldX = (this.mouseScreen.x + Renderer.camera.x) / oldZoom;
        const worldY = (this.mouseScreen.y + Renderer.camera.y) / oldZoom;
        Renderer.camera.x = worldX * Renderer.camera.zoom - this.mouseScreen.x;
        Renderer.camera.y = worldY * Renderer.camera.zoom - this.mouseScreen.y;
    },
    
    // Key down handler
    onKeyDown(e) {
        const key = e.key.toLowerCase();
        
        switch (key) {
            case 'r':
                this.rotation = (this.rotation + 1) % 4;
                break;
            case 'q':
                this.selectTool('select');
                break;
            case 'x':
                this.selectTool('delete');
                break;
            case 'e':
                this.selectTool('mine');
                break;
            case '1':
                this.selectTool('miner');
                break;
            case '2':
                this.selectTool('belt');
                break;
            case '3':
                this.selectTool('inserter');
                break;
            case '4':
                this.selectTool('chest');
                break;
            case '5':
                this.selectTool('furnace');
                break;
            case '6':
                this.selectTool('assembler');
                break;
            case '7':
                this.selectTool('gun_turret');
                break;
            case '8':
                this.selectTool('flame_turret');
                break;
            case '9':
                this.selectTool('laser_turret');
                break;
            case '0':
                this.selectTool('tesla_turret');
                break;
            case '-':
                this.selectTool('cannon_turret');
                break;
            case '`':
            case '~':
                // Toggle dev mode
                CONFIG.DEV_MODE = !CONFIG.DEV_MODE;
                game.ui.showDevModeNotification();
                Audio.playDevMode();
                break;
            case 'f1':
                // Dev: Spawn wave immediately
                if (CONFIG.DEV_MODE) {
                    e.preventDefault();
                    Enemies.waveTimer = 0;
                }
                break;
            case 'f2':
                // Dev: Kill all enemies
                if (CONFIG.DEV_MODE) {
                    e.preventDefault();
                    Enemies.list = [];
                    Enemies.enemiesRemaining = 0;
                    Enemies.spawnQueue = [];
                }
                break;
            case 'f3':
                // Dev: Add resources
                if (CONFIG.DEV_MODE) {
                    e.preventDefault();
                    Resources.add('iron', 100);
                    Resources.add('copper', 100);
                    Resources.add('coal', 100);
                    Resources.add('iron-plate', 100);
                    Resources.add('copper-plate', 100);
                    Resources.add('gear', 50);
                    Resources.add('circuit', 50);
                }
                break;
            case 'w':
            case 'arrowup':
                Renderer.camera.y -= 50;
                break;
            case 's':
            case 'arrowdown':
                Renderer.camera.y += 50;
                break;
            case 'a':
            case 'arrowleft':
                Renderer.camera.x -= 50;
                break;
            case 'd':
            case 'arrowright':
                Renderer.camera.x += 50;
                break;
        }
    },
    
    // Select a tool
    selectTool(tool) {
        this.currentTool = tool;
        Simulation.stopMining();
        game.ui.updateToolButtons(tool);
    }
};
