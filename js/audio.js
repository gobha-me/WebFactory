// Audio System
const Audio = {
    ctx: null,
    enabled: true,
    volume: 0.3,
    
    // Initialize audio context
    init() {
        // Create on first user interaction
        document.addEventListener('click', () => this.ensureContext(), { once: true });
        document.addEventListener('keydown', () => this.ensureContext(), { once: true });
    },
    
    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    // Play a tone
    playTone(frequency, duration, type = 'square', volume = null) {
        if (!this.enabled || !this.ctx) return;
        
        try {
            const oscillator = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            const vol = (volume || this.volume) * this.volume;
            gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            oscillator.start(this.ctx.currentTime);
            oscillator.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Ignore audio errors
        }
    },
    
    // Play noise burst (for explosions, etc)
    playNoise(duration, volume = null) {
        if (!this.enabled || !this.ctx) return;
        
        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.ctx.createBufferSource();
            const gainNode = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            
            noise.buffer = buffer;
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            const vol = (volume || this.volume) * this.volume;
            gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            noise.start(this.ctx.currentTime);
        } catch (e) {
            // Ignore audio errors
        }
    },
    
    // Sound effects
    playPlace() {
        this.playTone(200, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(300, 0.08, 'square', 0.15), 50);
    },
    
    playDelete() {
        this.playTone(150, 0.15, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(100, 0.1, 'sawtooth', 0.15), 80);
    },
    
    playMine() {
        this.playTone(100 + Math.random() * 50, 0.08, 'triangle', 0.15);
    },
    
    playMineComplete() {
        this.playTone(400, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(500, 0.08, 'sine', 0.15), 60);
    },
    
    playShoot(towerType) {
        switch(towerType) {
            case 'gun_turret':
                this.playNoise(0.05, 0.3);
                this.playTone(150, 0.05, 'square', 0.2);
                break;
            case 'flame_turret':
                this.playNoise(0.15, 0.25);
                this.playTone(80, 0.1, 'sawtooth', 0.15);
                break;
            case 'laser_turret':
                this.playTone(800, 0.15, 'sine', 0.25);
                this.playTone(1200, 0.1, 'sine', 0.15);
                break;
            case 'tesla_turret':
                this.playTone(200, 0.05, 'sawtooth', 0.2);
                this.playTone(400, 0.1, 'sawtooth', 0.15);
                this.playTone(300, 0.08, 'sawtooth', 0.1);
                break;
            case 'cannon_turret':
                this.playNoise(0.2, 0.4);
                this.playTone(60, 0.2, 'triangle', 0.3);
                break;
            default:
                this.playTone(200, 0.05, 'square', 0.2);
        }
    },
    
    playExplosion() {
        this.playNoise(0.3, 0.4);
        this.playTone(50, 0.3, 'triangle', 0.3);
        setTimeout(() => this.playTone(40, 0.2, 'triangle', 0.2), 100);
    },
    
    playEnemyHit() {
        this.playTone(150, 0.05, 'square', 0.1);
    },
    
    playEnemyDeath() {
        this.playTone(200, 0.1, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(100, 0.15, 'sawtooth', 0.15), 50);
    },
    
    playWaveStart() {
        const notes = [300, 400, 300, 500];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'square', 0.25), i * 150);
        });
    },
    
    playWaveComplete() {
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.25), i * 100);
        });
    },
    
    playBuildingDamage() {
        this.playTone(100, 0.1, 'sawtooth', 0.2);
    },
    
    playBuildingDestroyed() {
        this.playNoise(0.3, 0.35);
        this.playTone(80, 0.3, 'sawtooth', 0.25);
    },
    
    playUIClick() {
        this.playTone(400, 0.05, 'sine', 0.1);
    },
    
    playError() {
        this.playTone(150, 0.15, 'square', 0.2);
        setTimeout(() => this.playTone(100, 0.15, 'square', 0.15), 100);
    },
    
    playDevMode() {
        this.playTone(600, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(800, 0.1, 'sine', 0.2), 100);
    },
    
    // Toggle sound
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.playUIClick();
        }
        return this.enabled;
    }
};
