// Game Configuration Constants
const CONFIG = {
    // Dev mode - toggle with backtick key (`)
    DEV_MODE: false,
    
    TILE_SIZE: 40,
    MAP_WIDTH: 100,
    MAP_HEIGHT: 100,
    
    // Directions: 0=right, 1=down, 2=left, 3=up
    DIR: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 }
    ],
    
    // Building sizes
    BUILDING_SIZES: {
        'miner': { w: 2, h: 2 },
        'furnace': { w: 2, h: 2 },
        'assembler': { w: 3, h: 3 },
        'belt': { w: 1, h: 1 },
        'inserter': { w: 1, h: 1 },
        'chest': { w: 1, h: 1 }
    },
    
    // Building costs
    COSTS: {
        'miner': { 'iron-plate': 10 },
        'belt': { 'iron-plate': 1 },
        'inserter': { 'iron-plate': 2, 'gear': 1 },
        'furnace': { 'iron': 10 },
        'assembler': { 'iron-plate': 5, 'gear': 3 },
        'chest': { 'iron-plate': 5 }
    },
    
    // Production speeds (items per second at 1x speed)
    SPEEDS: {
        'miner': 1.0,
        'furnace': 0.5,
        'assembler': 0.3,
        'inserter': 2.0,
        'belt': 3.0
    },
    
    // Manual mining
    MANUAL_MINE_RATE: 0.5, // seconds per ore
    MANUAL_MINE_AMOUNT: 1,
    
    // Recipes
    RECIPES: {
        'gear': {
            inputs: { 'iron-plate': 2 },
            output: 'gear',
            outputCount: 1
        },
        'circuit': {
            inputs: { 'iron-plate': 1, 'copper-plate': 3 },
            output: 'circuit',
            outputCount: 1
        }
    },
    
    // Smelting recipes
    SMELTING: {
        'iron': { output: 'iron-plate', fuel: 'coal' },
        'copper': { output: 'copper-plate', fuel: 'coal' }
    },
    
    // Resource types and their colors
    RESOURCE_COLORS: {
        'iron': { light: '#9aaabb', dark: '#6a7a8a' },
        'copper': { light: '#e8b878', dark: '#b87830' },
        'coal': { light: '#3a3a3a', dark: '#1a1a1a' }
    },
    
    // Building styles for rendering
    BUILDING_STYLES: {
        'miner': { light: '#ffbb44', dark: '#cc7700', accent: '#ffdd88' },
        'belt': { light: '#777', dark: '#444', accent: '#999' },
        'inserter': { light: '#ffdd55', dark: '#bb9900', accent: '#ffee88' },
        'furnace': { light: '#ee5533', dark: '#992211', accent: '#ff8866' },
        'assembler': { light: '#55aaee', dark: '#226699', accent: '#88ccff' },
        'chest': { light: '#aa7744', dark: '#664422', accent: '#cc9966' }
    },
    
    // Starting resources
    STARTING_RESOURCES: {
        'iron': 0,
        'copper': 0,
        'coal': 0,
        'iron-plate': 20,
        'copper-plate': 10,
        'gear': 5,
        'circuit': 0,
        'xp': 0
    },
    
    // Resource display order
    RESOURCE_ORDER: ['iron', 'copper', 'coal', 'iron-plate', 'copper-plate', 'gear', 'circuit', 'xp'],
    
    // Resource display names
    RESOURCE_NAMES: {
        'iron': 'Iron Ore',
        'copper': 'Copper Ore',
        'coal': 'Coal',
        'iron-plate': 'Iron Plates',
        'copper-plate': 'Copper Plates',
        'gear': 'Gears',
        'circuit': 'Circuits',
        'xp': 'XP'
    },
    
    // Tower types for toolbar
    TOWER_ORDER: ['gun_turret', 'flame_turret', 'laser_turret', 'tesla_turret', 'cannon_turret']
};
