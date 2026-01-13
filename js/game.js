// Main Game Controller
const game = {
    ui: UI,
    lastTime: 0,
    minimapTimer: 0,
    
    // Initialize game
    init() {
        // Initialize all systems
        Audio.init();
        Resources.init();
        Terrain.init();
        Buildings.init();
        Towers.init();
        Enemies.init();
        Simulation.init();
        Renderer.init();
        Input.init();
        UI.init();
        
        // Center camera on starting area
        Renderer.centerCamera(30, 30);
        
        // Start game loop
        this.gameLoop(0);
    },
    
    // Start new game
    newGame() {
        Resources.init();
        Terrain.init();
        Buildings.init();
        Towers.init();
        Enemies.init();
        Simulation.init();
        Renderer.centerCamera(30, 30);
    },
    
    // Main game loop
    gameLoop(time) {
        const dt = Math.min((time - game.lastTime) / 1000, 0.1);
        game.lastTime = time;
        
        // Update simulation
        Simulation.update(dt);
        Towers.update(dt);
        Enemies.update(dt);
        
        // Update UI
        UI.updateResources();
        UI.updateToolButtons(Input.currentTool);
        UI.updateWaveIndicator();
        
        // Update minimap less frequently
        game.minimapTimer += dt;
        if (game.minimapTimer > 0.2) {
            game.minimapTimer = 0;
            UI.updateMinimap();
        }
        
        // Render
        Renderer.render(Input.currentTool, Input.rotation, Input.mouseWorld);
        
        // Next frame
        requestAnimationFrame((t) => game.gameLoop(t));
    }
};

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => game.init());
