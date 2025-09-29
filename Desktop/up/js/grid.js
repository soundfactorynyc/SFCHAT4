// Sound Factory Grid System - Core Functionality
(function() {
    'use strict';

    // Grid button content mapping
    const GRID_MAPPINGS = {
        // Position 0-7: Chat styles
        0: { icon: '🎨', text: 'Graffiti', type: 'chat-style' },
        1: { icon: '🔥', text: 'Fire Text', type: 'chat-style' },
        2: { icon: '💬', text: 'Bubble', type: 'chat-style' },
        3: { icon: '✨', text: 'Sparkle', type: 'chat-style' },
        4: { icon: '🌈', text: 'Rainbow', type: 'chat-style' },
        5: { icon: '⚡', text: 'Lightning', type: 'chat-style' },
        6: { icon: '💎', text: 'Diamond', type: 'chat-style' },
        7: { icon: '🎭', text: 'Theater', type: 'chat-style' },

        // Position 8-15: Reactions
        8: { icon: '🏳️‍🌈', text: 'Pride Flag', type: 'reaction' },
        9: { icon: '🇺🇸', text: 'USA Flag', type: 'reaction' },
        10: { icon: '🎉', text: 'Party', type: 'reaction' },
        11: { icon: '🔥', text: 'Fire', type: 'reaction' },
        12: { icon: '💯', text: '100', type: 'reaction' },
        13: { icon: '👏', text: 'Clap', type: 'reaction' },
        14: { icon: '❤️', text: 'Love', type: 'reaction' },
        15: { icon: '😍', text: 'Heart Eyes', type: 'reaction' },

        // Position 16-23: Money amounts
        16: { icon: '$1', text: '$1 Tip', type: 'payment', amount: 100 },
        17: { icon: '$5', text: '$5 Tip', type: 'payment', amount: 500 },
        18: { icon: '$10', text: '$10 Tip', type: 'payment', amount: 1000 },
        19: { icon: '$20', text: '$20 Tip', type: 'payment', amount: 2000 },
        20: { icon: '$50', text: '$50 Tip', type: 'payment', amount: 5000 },
        21: { icon: '$100', text: '$100 Tip', type: 'payment', amount: 10000 },
        22: { icon: '💰', text: 'Custom', type: 'payment', amount: 'custom' },
        23: { icon: '💎', text: 'VIP', type: 'payment', amount: 'vip' },

        // Position 24-31: Music tools
        24: { icon: '🥁', text: 'Drums', type: 'music' },
        25: { icon: '🎵', text: 'Sampler', type: 'music' },
        26: { icon: '🔄', text: 'Loops', type: 'music' },
        27: { icon: '🎚️', text: 'Effects', type: 'music' },
        28: { icon: '🎤', text: 'Vocals', type: 'music' },
        29: { icon: '🎧', text: 'Mix', type: 'music' },
        30: { icon: '🎼', text: 'Score', type: 'music' },
        31: { icon: '🎹', text: 'Keys', type: 'music' },

        // Position 32-39: Social features
        32: { icon: '👥', text: 'Find Friends', type: 'social' },
        33: { icon: '📍', text: 'Share Location', type: 'social' },
        34: { icon: '👫', text: 'Groups', type: 'social' },
        35: { icon: '💬', text: 'Chat', type: 'social' },
        36: { icon: '📸', text: 'Photos', type: 'social' },
        37: { icon: '🎥', text: 'Video', type: 'social' },
        38: { icon: '📱', text: 'Connect', type: 'social' },
        39: { icon: '🌟', text: 'Star', type: 'social' },

        // Position 40-47: VIP features
        40: { icon: '⚡', text: 'Skip Line', type: 'vip' },
        41: { icon: '🛋️', text: 'Table Service', type: 'vip' },
        42: { icon: '🍾', text: 'Bottle Service', type: 'vip' },
        43: { icon: '🥂', text: 'Champagne', type: 'vip' },
        44: { icon: '👑', text: 'VIP Access', type: 'vip' },
        45: { icon: '🎪', text: 'Private Booth', type: 'vip' },
        46: { icon: '💎', text: 'Diamond', type: 'vip' },
        47: { icon: '🏆', text: 'Champion', type: 'vip' },

        // Position 48-55: Games/surprises
        48: { icon: '🎲', text: 'Random', type: 'game' },
        49: { icon: '🍹', text: 'Free Drink', type: 'game' },
        50: { icon: '🎁', text: 'Merch', type: 'game' },
        51: { icon: '🎊', text: 'Surprise', type: 'game' },
        52: { icon: '🎈', text: 'Balloon', type: 'game' },
        53: { icon: '🎯', text: 'Target', type: 'game' },
        54: { icon: '🎪', text: 'Carnival', type: 'game' },
        55: { icon: '🎨', text: 'Art', type: 'game' },

        // Position 56-63: Settings/profile/help/logout
        56: { icon: '⚙️', text: 'Settings', type: 'system' },
        57: { icon: '👤', text: 'Profile', type: 'system' },
        58: { icon: '❓', text: 'Help', type: 'system' },
        59: { icon: '📞', text: 'Contact', type: 'system' },
        60: { icon: '📋', text: 'Terms', type: 'system' },
        61: { icon: '🔒', text: 'Privacy', type: 'system' },
        62: { icon: '📊', text: 'Stats', type: 'system' },
        63: { icon: '🚪', text: 'Logout', type: 'system' }
    };

    // Initialize grid system
    function initGridSystem() {
        // Add HTML structure
        addGridHTML();
        
        // Generate grid buttons
        generateGridButtons();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start surprise system
        startSurpriseSystem();
        
        console.log('🎵 Sound Factory Grid System initialized');
    }

    // Add HTML structure
    function addGridHTML() {
        const mainGridButton = document.createElement('div');
        mainGridButton.id = 'mainGridButton';
        mainGridButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #ff6b00;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(255, 107, 0, 0.4);
            transition: all 0.3s ease;
        `;
        mainGridButton.innerHTML = '<span style="font-size: 30px;">⚡</span>';
        
        const gridOverlay = document.createElement('div');
        gridOverlay.id = 'gridOverlay';
        gridOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.95);
            display: none;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        const gridContainer = document.createElement('div');
        gridContainer.id = 'gridContainer';
        gridContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            gap: 2px;
            padding: 20px;
        `;
        
        gridOverlay.appendChild(gridContainer);
        document.body.appendChild(mainGridButton);
        document.body.appendChild(gridOverlay);
    }

    // Generate grid buttons
    function generateGridButtons() {
        const gridContainer = document.getElementById('gridContainer');
        
        for(let i = 0; i < 64; i++) {
            const btn = document.createElement('button');
            btn.className = 'grid-btn';
            btn.dataset.position = i;
            btn.style.cssText = `
                background: rgba(255,107,0,0.1);
                border: 1px solid #ff6b00;
                color: white;
                cursor: pointer;
                font-size: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                min-height: 44px;
                min-width: 44px;
            `;
            
            const mapping = GRID_MAPPINGS[i];
            btn.innerHTML = `
                <span style="font-size: 24px; margin-bottom: 4px;">${mapping.icon}</span>
                <span style="font-size: 10px; text-align: center;">${mapping.text}</span>
            `;
            
            btn.addEventListener('click', () => handleGridClick(i));
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleGridClick(i);
            }, { passive: false });
            
            gridContainer.appendChild(btn);
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Main grid button
        document.getElementById('mainGridButton').addEventListener('click', () => {
            const overlay = document.getElementById('gridOverlay');
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        // Close grid overlay
        document.getElementById('gridOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'gridOverlay') {
                document.getElementById('gridOverlay').style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // Prevent zoom on double-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // Handle grid button clicks
    function handleGridClick(position) {
        const mapping = GRID_MAPPINGS[position];
        console.log(`Grid clicked: ${mapping.text} (${mapping.type})`);
        
        switch(mapping.type) {
            case 'payment':
                handlePayment(mapping);
                break;
            case 'music':
                handleMusic(mapping);
                break;
            case 'social':
                handleSocial(mapping);
                break;
            case 'vip':
                handleVIP(mapping);
                break;
            case 'game':
                handleGame(mapping);
                break;
            case 'system':
                handleSystem(mapping);
                break;
            case 'chat-style':
                handleChatStyle(mapping);
                break;
            case 'reaction':
                handleReaction(mapping);
                break;
        }
        
        // Close grid after action
        setTimeout(() => {
            document.getElementById('gridOverlay').style.display = 'none';
            document.body.style.overflow = '';
        }, 500);
    }

    // Payment handling
    function handlePayment(mapping) {
        if (mapping.amount === 'custom') {
            const amount = prompt('Enter custom tip amount ($):');
            if (amount && !isNaN(amount)) {
                processPayment(parseInt(amount) * 100);
            }
        } else if (mapping.amount === 'vip') {
            // Redirect to VIP table booking
            window.location.href = 'table-reservations.html';
        } else {
            processPayment(mapping.amount);
        }
    }

    // Process payment
    function processPayment(amount) {
        if (window.purchaseTable) {
            // Use existing Stripe integration
            window.purchaseTable('tip', 'custom', { amount: amount });
        } else {
            // Fallback payment processing
            alert(`Processing $${amount/100} tip via Stripe...`);
        }
    }

    // Music tools handling
    function handleMusic(mapping) {
        switch(mapping.text) {
            case 'Sampler':
                window.location.href = 'ai-audio-sampler.html';
                break;
            case 'Vocals':
                window.location.href = 'ai-vocal-studio.html';
                break;
            default:
                alert(`Opening ${mapping.text} tools...`);
        }
    }

    // Social features handling
    function handleSocial(mapping) {
        switch(mapping.text) {
            case 'Find Friends':
                // Activate find friends mode
                if (window.modeSwitch) {
                    document.querySelector('[data-mode="find"]').click();
                }
                break;
            case 'Share Location':
                // Share current location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        alert(`Location: ${position.coords.latitude}, ${position.coords.longitude}`);
                    });
                }
                break;
            default:
                alert(`Opening ${mapping.text}...`);
        }
    }

    // VIP features handling
    function handleVIP(mapping) {
        switch(mapping.text) {
            case 'Skip Line':
                alert('VIP: Skip line access activated!');
                break;
            case 'Table Service':
                window.location.href = 'table-reservations.html';
                break;
            case 'Bottle Service':
                alert('VIP: Bottle service requested!');
                break;
            default:
                alert(`VIP: ${mapping.text} activated!`);
        }
    }

    // Games/surprises handling
    function handleGame(mapping) {
        const rewards = [
            'Free drink at the bar!',
            'VIP upgrade for 1 hour!',
            'Free merch item!',
            'Skip the line!',
            'DJ shoutout!',
            'Photo with the DJ!'
        ];
        
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        alert(`🎉 SURPRISE! ${reward}`);
    }

    // System handling
    function handleSystem(mapping) {
        switch(mapping.text) {
            case 'Logout':
                localStorage.removeItem('sf_token');
                localStorage.removeItem('sf_phone_number');
                localStorage.removeItem('sf_authenticated');
                window.location.reload();
                break;
            case 'Settings':
                alert('Settings panel coming soon!');
                break;
            case 'Profile':
                if (document.getElementById('accountBtn')) {
                    document.getElementById('accountBtn').click();
                }
                break;
            default:
                alert(`Opening ${mapping.text}...`);
        }
    }

    // Chat style handling
    function handleChatStyle(mapping) {
        alert(`Chat style: ${mapping.text} activated!`);
    }

    // Reaction handling
    function handleReaction(mapping) {
        alert(`Reaction: ${mapping.text} sent!`);
    }

    // Surprise system
    function startSurpriseSystem() {
        setInterval(() => {
            const randomPos = Math.floor(Math.random() * 64);
            const btn = document.querySelector(`[data-position="${randomPos}"]`);
            if (btn) {
                btn.style.animation = 'pulse 1s infinite';
                btn.dataset.reward = 'active';
                btn.style.background = 'rgba(255, 215, 0, 0.3)';
                btn.style.borderColor = '#ffd700';
                
                setTimeout(() => {
                    btn.style.animation = '';
                    btn.dataset.reward = '';
                    btn.style.background = 'rgba(255,107,0,0.1)';
                    btn.style.borderColor = '#ff6b00';
                }, 10000);
            }
        }, 30000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGridSystem);
    } else {
        initGridSystem();
    }

})();


