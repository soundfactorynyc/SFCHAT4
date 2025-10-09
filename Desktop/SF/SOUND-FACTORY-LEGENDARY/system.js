// ========================================
// SOUND FACTORY - LEGENDARY SYSTEM
// Production Ready Complete System
// ========================================

class SoundFactoryLegendary {
    constructor() {
        // System State
        this.state = {
            totalMoney: 0,
            multiplier: 1.0,
            selectedReaction: null,
            activeGrid: null,
            selectedItems: new Set(),
            currentMode: 'reactions',
            pins: [],
            knobs: {
                speed: 50,
                position: 50,
                intensity: 50,
                spread: 50
            },
            drawerExpanded: false,
            isInitialized: false
        };

        // Performance optimizations
        this.animationFrame = null;
        this.particlePool = [];
        this.maxParticles = 100;
        
        // Initialize
        this.init();
    }

    // ========== INITIALIZATION ==========
    async init() {
        try {
            // Show loading
            console.log('🚀 Sound Factory Legendary initializing...');
            
            // Initialize all components
            await this.loadGridData();
            this.initializeGrids();
            this.initializeDrawer();
            this.initializeControls();
            this.initializeCharacter();
            this.initializeEventListeners();
            this.initializeKnobs();
            this.startAnimationLoop();
            
            // Hide loading after delay
            setTimeout(() => {
                document.getElementById('loadingOverlay').classList.add('hidden');
                this.showToast('🎉 LEGENDARY SYSTEM READY!');
                this.state.isInitialized = true;
            }, 1500);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('⚠️ Error loading system');
        }
    }
    // ========== GRID DATA LOADING ==========
    async loadGridData() {
        // All grid configurations
        this.grids = {
            social: {
                title: 'SOCIAL HUB',
                subtitle: '64 SOCIAL PLATFORMS',
                plusBtn: 'topBtn',
                items: this.generateSocialGrid()
            },
            reactions: {
                title: 'REACTIONS STUDIO',
                subtitle: '64 EMOJI REACTIONS',
                plusBtn: 'middleBtn',
                items: this.generateReactionsGrid()
            },
            ai: {
                title: 'AI CHAIN',
                subtitle: '64 AI PERSONALITIES',
                plusBtn: 'bottomBtn',
                items: this.generateAIGrid()
            },
            effects: {
                title: 'CAMERA EFFECTS',
                subtitle: '64 VISUAL EFFECTS',
                plusBtn: null,
                items: this.generateEffectsGrid()
            },
            pins: {
                title: 'PIN SYSTEM',
                subtitle: '64 PIN FEATURES',
                plusBtn: null,
                items: this.generatePinsGrid()
            },
            vocal: {
                title: 'VOCAL STUDIO',
                subtitle: '64 VOICE EFFECTS',
                plusBtn: null,
                items: this.generateVocalGrid()
            },
            dj: {
                title: 'DJ CONTROLS',
                subtitle: '64 MUSIC TOOLS',
                plusBtn: null,
                items: this.generateDJGrid()
            },
            uploads: {
                title: 'USER UPLOADS',
                subtitle: '64 CUSTOM ITEMS',
                plusBtn: null,
                items: this.generateUploadsGrid()
            }
        };

        // Drawer reactions
        this.drawerReactions = this.generateDrawerItems();
    }
    // ========== GRID GENERATORS ==========
    generateSocialGrid() {
        const items = [
            { icon: '🚀', name: 'CROSS POST', desc: 'Post everywhere' },
            { icon: '🎵', name: 'TIKTOK', desc: 'Your feed' },
            { icon: '📷', name: 'INSTAGRAM', desc: 'Your feed' },
            { icon: '📘', name: 'FACEBOOK', desc: 'Your feed' },
            { icon: '🐦', name: 'TWITTER', desc: 'Your feed' },
            { icon: '📺', name: 'YOUTUBE', desc: 'Your channel' },
            { icon: '💼', name: 'LINKEDIN', desc: 'Professional' },
            { icon: '👻', name: 'SNAPCHAT', desc: 'Stories' },
            { icon: '📡', name: 'LIVESTREAM', desc: 'Go live all' },
            { icon: '📊', name: 'ANALYTICS', desc: 'All stats' },
            { icon: '📅', name: 'SCHEDULER', desc: 'Auto post' },
            { icon: '🔥', name: 'VIRAL', desc: 'Trending' },
            { icon: '🤝', name: 'COLLAB', desc: 'Find creators' },
            { icon: '⭐', name: 'FAN CLUB', desc: 'Monetize' },
            { icon: '💎', name: 'NFT MINT', desc: 'Create NFTs' },
            { icon: '🤖', name: 'AI CAPTIONS', desc: 'Auto write' },
            { icon: '#️⃣', name: 'HASHTAGS', desc: 'Trending tags' },
            { icon: '💬', name: 'DM HUB', desc: 'All messages' },
            { icon: '🎯', name: 'ADS', desc: 'Promote' },
            { icon: '💰', name: 'REVENUE', desc: 'Earnings' },
            { icon: '🎨', name: 'TEMPLATES', desc: 'Design' },
            { icon: '🎬', name: 'VIDEO', desc: 'Edit video' },
            { icon: '🖼️', name: 'PHOTOS', desc: 'Edit photos' },
            { icon: '🎵', name: 'MUSIC', desc: 'Add music' }
        ];
        
        while (items.length < 64) {
            items.push({ 
                icon: '🔒', 
                name: `LOCKED ${items.length + 1}`, 
                desc: 'Unlock with $', 
                locked: true,
                requiredMoney: (items.length - 23) * 5
            });
        }
        
        return items;
    }
    generateReactionsGrid() {
        const emojis = [
            '❤️', '🔥', '😂', '🎉', '👠', '🏳️‍🌈', '✨', '⭐',
            '👑', '💎', '💋', '🌹', '🍾', '🍸', '🪩', '🎵',
            '🔊', '⚡', '💥', '🙌', '👏', '✌️', '👌', '💪',
            '👀', '😉', '😎', '🥵', '👽', '🤖', '🦄', '🚀',
            '💫', '🌟', '💅', '💄', '👗', '👞', '👜', '💍',
            '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹',
            '🥁', '🎺', '🎷', '💃', '🕺', '🌈', '☀️', '🌙',
            '💖', '💝', '💗', '💓', '💞', '💕', '💘', '💯'
        ];
        
        return emojis.map((emoji, i) => ({
            emoji,
            name: `REACTION ${i + 1}`,
            type: 'reaction'
        }));
    }

    generateAIGrid() {
        const personalities = [
            { icon: '😊', name: 'HAPPY', desc: 'YES! Amazing!' },
            { icon: '🙄', name: 'SARCASM', desc: 'Oh sure...' },
            { icon: '🎭', name: 'DRAMATIC', desc: 'BEHOLD!' },
            { icon: '😎', name: 'CHILL', desc: 'No worries' },
            { icon: '🎩', name: 'FANCY', desc: 'Indeed!' },
            { icon: '🔥', name: 'HYPE', desc: 'LETS GOOOO!' },
            { icon: '📜', name: 'POET', desc: 'Roses are...' },
            { icon: '🤖', name: 'ROBOT', desc: 'BEEP BOOP' }
        ];
        
        while (personalities.length < 64) {
            personalities.push({
                icon: '🤖',
                name: `AI ${personalities.length + 1}`,
                desc: 'Transform voice'
            });
        }
        
        return personalities;
    }
    generateEffectsGrid() {
        const effects = [
            { icon: '🌈', name: 'RAINBOW', desc: 'Color burst' },
            { icon: '❄️', name: 'FREEZE', desc: 'Time stop' },
            { icon: '🔥', name: 'FIRE', desc: 'Flame effect' },
            { icon: '💫', name: 'SPARKLE', desc: 'Glitter' },
            { icon: '🌊', name: 'WAVE', desc: 'Ripple' },
            { icon: '🌀', name: 'SPIRAL', desc: 'Hypnotic' },
            { icon: '💥', name: 'EXPLOSION', desc: 'Boom!' },
            { icon: '⚡', name: 'LIGHTNING', desc: 'Electric' }
        ];
        
        while (effects.length < 64) {
            effects.push({
                icon: '✨',
                name: `EFFECT ${effects.length + 1}`,
                desc: 'Visual magic'
            });
        }
        
        return effects;
    }

    generatePinsGrid() {
        const pins = [];
        for (let i = 0; i < 64; i++) {
            pins.push({
                icon: '📍',
                name: `PIN ${i + 1}`,
                desc: i < 3 ? 'Drop pin' : 'Unlock $' + (i * 2),
                locked: i >= 3,
                requiredMoney: i * 2
            });
        }
        return pins;
    }
    generateVocalGrid() {
        const vocals = [
            { icon: '🎤', name: 'AUTOTUNE', desc: 'Perfect pitch' },
            { icon: '🎵', name: 'HARMONY', desc: 'Add layers' },
            { icon: '🔊', name: 'REVERB', desc: 'Echo space' },
            { icon: '📻', name: 'RADIO', desc: 'FM voice' },
            { icon: '🤖', name: 'VOCODER', desc: 'Robot voice' },
            { icon: '👽', name: 'ALIEN', desc: 'Space voice' },
            { icon: '🐻', name: 'DEEP', desc: 'Low pitch' },
            { icon: '🐭', name: 'CHIPMUNK', desc: 'High pitch' }
        ];
        
        while (vocals.length < 64) {
            vocals.push({
                icon: '🎙️',
                name: `VOCAL ${vocals.length + 1}`,
                desc: 'Transform'
            });
        }
        
        return vocals;
    }

    generateDJGrid() {
        const dj = [
            { icon: '🎛️', name: 'MIXER', desc: 'Blend tracks' },
            { icon: '🎚️', name: 'EQ', desc: 'Frequency' },
            { icon: '🥁', name: 'DRUMS', desc: 'Beat maker' },
            { icon: '🎹', name: 'KEYS', desc: 'Melody' },
            { icon: '🎸', name: 'BASS', desc: 'Low end' },
            { icon: '🎺', name: 'BRASS', desc: 'Horn section' },
            { icon: '🎷', name: 'SAX', desc: 'Smooth' },
            { icon: '🎻', name: 'STRINGS', desc: 'Orchestra' }
        ];
        
        while (dj.length < 64) {
            dj.push({
                icon: '🎧',
                name: `DJ ${dj.length + 1}`,
                desc: 'Mix it'
            });
        }
        
        return dj;
    }
    generateUploadsGrid() {
        const uploads = [];
        for (let i = 0; i < 64; i++) {
            uploads.push({
                icon: '📤',
                name: `SLOT ${i + 1}`,
                desc: i < 5 ? 'Upload' : 'Unlock $' + (i * 3),
                locked: i >= 5,
                requiredMoney: i * 3
            });
        }
        return uploads;
    }

    generateDrawerItems() {
        const reactions = this.generateReactionsGrid().slice(0, 15);
        const moneyButtons = [
            { emoji: '💵', name: '$1', isMoney: true, amount: 1 },
            { emoji: '💵', name: '$5', isMoney: true, amount: 5 },
            { emoji: '💰', name: '$10', isMoney: true, amount: 10 },
            { emoji: '💎', name: '$20', isMoney: true, amount: 20 },
            { emoji: '💎', name: '$50', isMoney: true, amount: 50 },
            { emoji: '💎', name: '$100', isMoney: true, amount: 100 }
        ];
        
        return [...reactions, ...moneyButtons];
    }

    // ========== GRID INITIALIZATION ==========
    initializeGrids() {
        const container = document.getElementById('gridContainer');
        
        Object.entries(this.grids).forEach(([key, grid]) => {
            const overlay = document.createElement('div');
            overlay.className = 'grid-overlay';
            overlay.id = `${key}Overlay`;
            
            overlay.innerHTML = `
                <div class="grid-header">
                    <div class="grid-title">${grid.title}</div>
                    <div class="grid-subtitle">${grid.subtitle}</div>
                </div>
                <div class="button-grid" id="${key}Grid"></div>
            `;
            
            container.appendChild(overlay);
            
            // Populate grid buttons
            const gridElement = document.getElementById(`${key}Grid`);
            grid.items.forEach((item, index) => {
                const btn = this.createGridButton(item, key, index);
                gridElement.appendChild(btn);
            });
        });
    }
    createGridButton(item, gridType, index) {
        const btn = document.createElement('div');
        btn.className = 'grid-btn';
        if (item.locked) btn.classList.add('locked');
        
        const icon = item.emoji || item.icon || '❓';
        const desc = item.desc ? `<div class="btn-desc">${item.desc}</div>` : '';
        
        btn.innerHTML = `
            <div class="btn-icon">${icon}</div>
            <div>${item.name}</div>
            ${desc}
        `;
        
        btn.addEventListener('click', () => this.handleGridClick(item, btn, gridType));
        
        return btn;
    }

    handleGridClick(item, btnElement, gridType) {
        if (item.locked) {
            if (this.state.totalMoney >= item.requiredMoney) {
                item.locked = false;
                btnElement.classList.remove('locked');
                this.showToast(`🔓 ${item.name} unlocked!`);
            } else {
                this.showToast(`💰 Need $${item.requiredMoney} to unlock`);
            }
            return;
        }
        
        btnElement.classList.toggle('selected');
        
        if (btnElement.classList.contains('selected')) {
            this.state.selectedItems.add(item);
            this.showToast(`✅ ${item.name} selected`);
        } else {
            this.state.selectedItems.delete(item);
        }
        
        // Special handling for different grid types
        if (gridType === 'reactions') {
            this.state.selectedReaction = item;
        }
    }
    // ========== DRAWER INITIALIZATION ==========
    initializeDrawer() {
        const drawer = document.getElementById('drawerScroll');
        
        this.drawerReactions.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'drawer-item';
            
            div.innerHTML = `
                <div class="drawer-emoji">${item.emoji}</div>
                <div class="drawer-label-text">${item.name}</div>
            `;
            
            div.addEventListener('click', () => this.selectDrawerItem(item, div));
            drawer.appendChild(div);
        });
        
        // Select first reaction
        if (drawer.firstChild) {
            this.selectDrawerItem(this.drawerReactions[0], drawer.firstChild);
        }
        
        // Make drawer swipeable
        this.initDrawerSwipe();
    }

    initDrawerSwipe() {
        const drawer = document.getElementById('bottomDrawer');
        const handle = document.getElementById('drawerHandle');
        let startY = 0;
        let currentY = 0;
        let dragging = false;
        
        const startDrag = (e) => {
            dragging = true;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            drawer.style.transition = 'none';
        };
        
        const drag = (e) => {
            if (!dragging) return;
            currentY = e.touches ? e.touches[0].clientY : e.clientY;
            const diff = startY - currentY;
            
            if (diff > 0 && diff < 120) {
                drawer.style.transform = `translateY(-${diff}px)`;
            }
        };
        
        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            drawer.style.transition = '';
            
            const diff = startY - currentY;
            if (diff > 60) {
                drawer.classList.add('expanded');
                this.state.drawerExpanded = true;
            } else {
                drawer.classList.remove('expanded');
                drawer.style.transform = '';
                this.state.drawerExpanded = false;
            }
        };
        
        // Touch events
        handle.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        // Mouse events
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // Click to toggle
        handle.addEventListener('click', () => {
            drawer.classList.toggle('expanded');
            this.state.drawerExpanded = !this.state.drawerExpanded;
        });
    }
    selectDrawerItem(item, element) {
        document.querySelectorAll('.drawer-item').forEach(el => {
            el.classList.remove('selected');
        });
        
        element.classList.add('selected');
        
        if (item.isMoney) {
            this.processMoney(item.amount);
        } else {
            this.state.selectedReaction = item;
            this.showToast(`${item.emoji} ${item.name} ready!`);
        }
    }

    // ========== CHARACTER CONTROLS ==========
    initializeCharacter() {
        const char = document.getElementById('character');
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let currentX = parseInt(char.style.left) || window.innerWidth / 2;
        let currentY = parseInt(char.style.top) || window.innerHeight / 2;
        
        const startDrag = (e) => {
            isDragging = true;
            char.classList.add('dragging');
            startX = (e.touches ? e.touches[0].clientX : e.clientX) - currentX;
            startY = (e.touches ? e.touches[0].clientY : e.clientY) - currentY;
            e.preventDefault();
        };
        
        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
            currentY = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
            
            // Constrain to blueprint area
            const area = document.getElementById('blueprintArea');
            const rect = area.getBoundingClientRect();
            
            currentX = Math.max(rect.left + 20, Math.min(rect.right - 20, currentX));
            currentY = Math.max(rect.top + 20, Math.min(rect.bottom - 20, currentY));
            
            char.style.left = currentX + 'px';
            char.style.top = currentY + 'px';
        };
        
        const endDrag = () => {
            isDragging = false;
            char.classList.remove('dragging');
        };
        
        // Touch events
        char.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        // Mouse events
        char.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
    }
    // ========== CONTROL KNOBS ==========
    initializeKnobs() {
        const knobs = ['speed', 'position', 'intensity', 'spread'];
        
        knobs.forEach(knobType => {
            const slider = document.getElementById(`${knobType}Slider`);
            const value = document.getElementById(`${knobType}Value`);
            
            let isDragging = false;
            
            const updateKnob = (e) => {
                const rect = slider.getBoundingClientRect();
                const x = e.touches ? e.touches[0].clientX : e.clientX;
                const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
                
                this.state.knobs[knobType] = Math.round(percent);
                
                const fill = slider.querySelector('.knob-fill');
                const handle = slider.querySelector('.knob-handle');
                
                fill.style.width = percent + '%';
                handle.style.left = percent + '%';
                value.textContent = Math.round(percent) + '%';
            };
            
            const startDrag = (e) => {
                isDragging = true;
                updateKnob(e);
            };
            
            const drag = (e) => {
                if (!isDragging) return;
                updateKnob(e);
            };
            
            const endDrag = () => {
                if (isDragging) {
                    isDragging = false;
                    this.showToast(`${knobType.toUpperCase()}: ${this.state.knobs[knobType]}%`);
                }
            };
            
            // Touch events
            slider.addEventListener('touchstart', startDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', endDrag);
            
            // Mouse events
            slider.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);
        });
    }
    // ========== EVENT LISTENERS ==========
    initializeControls() {
        // Plus buttons
        document.getElementById('topBtn').addEventListener('click', () => {
            this.toggleGrid('social');
        });
        
        document.getElementById('middleBtn').addEventListener('click', () => {
            this.toggleGrid('reactions');
        });
        
        document.getElementById('bottomBtn').addEventListener('click', () => {
            this.toggleGrid('ai');
        });
        
        // Shoot button
        document.getElementById('shootBtn').addEventListener('click', () => {
            this.shootReaction();
        });
        
        // Mode buttons
        const modes = ['social', 'reactions', 'effects', 'ai', 'pin'];
        modes.forEach(mode => {
            const btn = document.getElementById(`${mode}Mode`);
            if (btn) {
                btn.addEventListener('click', () => this.setMode(mode));
            }
        });
        
        // Money buttons
        document.querySelectorAll('.money-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                this.processMoney(amount);
            });
        });
    }

    initializeEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.state.isInitialized) return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.shootReaction();
                    break;
                case '1':
                    this.toggleGrid('social');
                    break;
                case '2':
                    this.toggleGrid('reactions');
                    break;
                case '3':
                    this.toggleGrid('ai');
                    break;
                case 'Escape':
                    this.closeAllGrids();
                    break;
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }
    // ========== GRID MANAGEMENT ==========
    toggleGrid(gridName) {
        const overlay = document.getElementById(`${gridName}Overlay`);
        const grid = this.grids[gridName];
        
        if (!overlay || !grid) return;
        
        if (this.state.activeGrid === gridName) {
            // Close current grid
            overlay.classList.remove('active');
            if (grid.plusBtn) {
                document.getElementById(grid.plusBtn).classList.remove('active');
            }
            this.state.activeGrid = null;
        } else {
            // Close all other grids
            this.closeAllGrids();
            
            // Open this grid
            overlay.classList.add('active');
            if (grid.plusBtn) {
                document.getElementById(grid.plusBtn).classList.add('active');
            }
            this.state.activeGrid = gridName;
            this.showToast(`${grid.title} OPENED`);
        }
    }

    closeAllGrids() {
        Object.entries(this.grids).forEach(([key, grid]) => {
            const overlay = document.getElementById(`${key}Overlay`);
            if (overlay) overlay.classList.remove('active');
            
            if (grid.plusBtn) {
                const btn = document.getElementById(grid.plusBtn);
                if (btn) btn.classList.remove('active');
            }
        });
        
        this.state.activeGrid = null;
    }

    setMode(mode) {
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.getElementById(`${mode}Mode`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.state.currentMode = mode;
        
        // Open corresponding grid if exists
        if (mode !== 'pin') {
            const gridMap = {
                social: 'social',
                reactions: 'reactions',
                effects: 'effects',
                ai: 'ai'
            };
            
            if (gridMap[mode]) {
                this.toggleGrid(gridMap[mode]);
            }
        } else {
            // Handle pin mode
            this.enterPinMode();
        }
    }
    // ========== PIN SYSTEM ==========
    enterPinMode() {
        this.showToast('📍 TAP TO DROP PIN');
        
        const area = document.getElementById('blueprintArea');
        
        const dropPin = (e) => {
            if (this.state.pins.length >= 3) {
                this.showToast('⚠️ Max 3 pins! Remove one first');
                return;
            }
            
            const rect = area.getBoundingClientRect();
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
            
            const pin = document.createElement('div');
            pin.className = 'pin-marker';
            pin.style.left = x + 'px';
            pin.style.top = y + 'px';
            
            pin.addEventListener('click', () => {
                pin.remove();
                this.state.pins = this.state.pins.filter(p => p !== pin);
                this.updatePinCount();
            });
            
            area.appendChild(pin);
            this.state.pins.push(pin);
            this.updatePinCount();
            
            this.showToast(`📍 Pin ${this.state.pins.length}/3 dropped`);
            
            if (this.state.pins.length >= 3) {
                area.removeEventListener('click', dropPin);
                this.setMode('reactions');
            }
        };
        
        area.addEventListener('click', dropPin, { once: true });
    }

    updatePinCount() {
        document.getElementById('pinCount').textContent = `${this.state.pins.length}/3`;
    }

    // ========== MONEY SYSTEM ==========
    processMoney(amount) {
        this.state.totalMoney += amount;
        this.state.multiplier = 1 + (this.state.totalMoney / 20);
        
        // Update display
        document.getElementById('totalMoney').textContent = this.state.totalMoney;
        
        // Animate money button
        event.target.classList.add('pulse');
        setTimeout(() => event.target.classList.remove('pulse'), 500);
        
        // Unlock features
        if (this.state.totalMoney >= 5 && !this.state.knobsUnlocked) {
            this.state.knobsUnlocked = true;
            document.getElementById('knobsPanel').classList.add('active');
            this.showToast('🎛️ CONTROL KNOBS UNLOCKED!');
        }
        
        // Money particle explosion
        for (let i = 0; i < 10 * this.state.multiplier; i++) {
            setTimeout(() => {
                this.createParticle('💵', event.clientX, event.clientY);
            }, i * 50);
        }
        
        this.showToast(`💰 +$${amount}! Total: $${this.state.totalMoney} (${this.state.multiplier.toFixed(1)}x)`);
        
        // Check for locked items to unlock
        this.checkUnlocks();
    }

    checkUnlocks() {
        Object.values(this.grids).forEach(grid => {
            grid.items.forEach(item => {
                if (item.locked && this.state.totalMoney >= item.requiredMoney) {
                    item.locked = false;
                }
            });
        });
    }
    // ========== SHOOT SYSTEM ==========
    shootReaction() {
        if (!this.state.selectedReaction || this.state.selectedReaction.isMoney) {
            this.showToast('⚠️ Select a reaction first!');
            return;
        }
        
        const btn = document.getElementById('shootBtn');
        btn.classList.add('shooting');
        setTimeout(() => btn.classList.remove('shooting'), 500);
        
        // Calculate particle count based on knobs and multiplier
        const speed = this.state.knobs.speed / 100;
        const intensity = this.state.knobs.intensity / 100;
        const spread = this.state.knobs.spread / 100;
        
        const count = Math.ceil(10 * this.state.multiplier * intensity);
        const char = document.getElementById('character');
        const startX = parseInt(char.style.left) || window.innerWidth / 2;
        const startY = parseInt(char.style.top) || window.innerHeight / 2;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * spread;
                const velocity = 200 + Math.random() * 200 * speed;
                this.createReactionParticle(
                    this.state.selectedReaction.emoji,
                    startX,
                    startY,
                    angle,
                    velocity
                );
            }, i * (50 / speed));
        }
        
        this.showToast(`🚀 ${this.state.selectedReaction.name} x${count}!`);
    }

    // ========== PARTICLE SYSTEM ==========
    createParticle(emoji, x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = (20 + Math.random() * 20) + 'px';
        particle.style.setProperty('--dx', (Math.random() - 0.5) * 100 + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }

    createReactionParticle(emoji, x, y, angle, velocity) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = (25 + this.state.multiplier * 5) + 'px';
        
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => particle.remove(), 2000);
    }
    // ========== ANIMATION LOOP ==========
    startAnimationLoop() {
        const animate = () => {
            // Update online count randomly
            if (Math.random() < 0.01) {
                const count = 200 + Math.floor(Math.random() * 100);
                document.getElementById('onlineCount').textContent = count;
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    pauseAnimations() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    resumeAnimations() {
        this.startAnimationLoop();
    }

    handleResize() {
        // Adjust grid columns based on screen size
        const width = window.innerWidth;
        let columns = 4;
        
        if (width < 480) columns = 2;
        else if (width < 768) columns = 3;
        
        document.querySelectorAll('.button-grid').forEach(grid => {
            grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        });
    }

    // ========== TOAST NOTIFICATIONS ==========
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('active');
        
        // Clear existing timeout
        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }
        
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
        }, 2000);
    }

    // ========== UTILITY FUNCTIONS ==========
    vibrate(duration = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    playSound(type) {
        // Audio context would be initialized here
        // For production, add Web Audio API implementation
    }

    saveState() {
        localStorage.setItem('soundFactoryState', JSON.stringify({
            totalMoney: this.state.totalMoney,
            multiplier: this.state.multiplier,
            knobs: this.state.knobs
        }));
    }

    loadState() {
        const saved = localStorage.getItem('soundFactoryState');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(this.state, data);
            document.getElementById('totalMoney').textContent = this.state.totalMoney;
        }
    }

    // ========== DEBUG FUNCTIONS ==========
    debug() {
        console.log('State:', this.state);
        console.log('Grids:', this.grids);
        console.log('Performance:', performance.memory);
    }
}

// ========== INITIALIZE SYSTEM ==========
let soundFactory;

document.addEventListener('DOMContentLoaded', () => {
    soundFactory = new SoundFactoryLegendary();
    
    // Expose for debugging
    window.SF = soundFactory;
    console.log('Sound Factory initialized! Type SF.debug() for info');
});