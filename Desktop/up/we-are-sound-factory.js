// WE ARE SOUND FACTORY - The Living Legend System
// Not nostalgia. Not reunion. We're HERE. We're ALIVE. Let's GO!

(function() {
    'use strict';

    // ============================================
    // CLAIM YOUR TERRITORY - YOU'RE HERE NOW
    // ============================================
    
    window.WeAreSoundFactory = {
        init: function() {
            this.injectLifeForce();
            this.activatePresence();
            this.igniteTheFloor();
        },
        
        injectLifeForce: function() {
            // Change the entire energy of the mode switch
            const modeSwitch = document.getElementById('modeSwitch');
            if (!modeSwitch) return;
            
            // Replace "Drop Pin" with "CLAIM SPACE"
            const dropBtn = modeSwitch.querySelector('[data-mode="drop"]');
            if (dropBtn) {
                dropBtn.innerHTML = '<span style="color: gold;">⚡</span> CLAIM';
                dropBtn.style.background = 'linear-gradient(135deg, rgba(255,0,0,0.2), rgba(255,165,0,0.2))';
            }
            
            // Add electricity to the floor when someone's here
            this.electrifyPresence();
        },
        
        electrifyPresence: function() {
            // Every character walking creates energy trails
            const style = document.createElement('style');
            style.textContent = `
                /* Electric presence - we're ALIVE */
                .character {
                    position: relative;
                }
                
                .character::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, 
                        rgba(255, 215, 0, 0.4), 
                        transparent 70%);
                    animation: electricPulse 1s infinite;
                    pointer-events: none;
                }
                
                @keyframes electricPulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% { 
                        transform: scale(1.5);
                        opacity: 0.3;
                    }
                }
                
                /* Movement creates lightning */
                .character.walking::after {
                    content: '';
                    position: absolute;
                    width: 2px;
                    height: 20px;
                    background: linear-gradient(to bottom, 
                        transparent, 
                        gold, 
                        transparent);
                    left: 50%;
                    top: 100%;
                    animation: lightning 0.2s linear infinite;
                }
                
                @keyframes lightning {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(10px); }
                }
            `;
            document.head.appendChild(style);
        },
        
        activatePresence: function() {
            // When you click the floor, you don't "drop a memory"
            // You CLAIM YOUR SPACE - you're HERE NOW
            document.addEventListener('click', (e) => {
                const floor = e.target.closest('.floor.active svg');
                if (!floor) return;
                
                const rect = floor.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                this.claimTerritory(x, y);
            });
        },
        
        claimTerritory: function(x, y) {
            // Not asking about the past - asking about NOW
            const claim = document.createElement('div');
            claim.className = 'territory-claim';
            claim.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                transform: translate(-50%, -50%);
                z-index: 1000;
            `;
            
            claim.innerHTML = `
                <div class="claim-form" style="
                    background: rgba(0,0,0,0.9);
                    border: 2px solid gold;
                    border-radius: 10px;
                    padding: 12px;
                    animation: powerUp 0.3s ease;
                ">
                    <div style="color: gold; font-weight: bold; font-size: 12px; margin-bottom: 8px;">
                        ⚡ THIS IS MY SPACE ⚡
                    </div>
                    <input type="text" 
                           id="myEnergy"
                           placeholder="What's your energy tonight?" 
                           maxlength="50"
                           style="
                               width: 200px;
                               background: transparent;
                               border: none;
                               border-bottom: 1px solid gold;
                               color: white;
                               padding: 5px;
                               font-size: 12px;
                               outline: none;
                           " />
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button onclick="WeAreSoundFactory.lightItUp(${x}, ${y})" 
                                style="
                                    background: linear-gradient(135deg, #FFD700, #FF6B35);
                                    color: black;
                                    border: none;
                                    padding: 6px 15px;
                                    border-radius: 20px;
                                    font-weight: bold;
                                    font-size: 11px;
                                    cursor: pointer;
                                    animation: glow 1s infinite;
                                ">LIGHT IT UP</button>
                    </div>
                </div>
            `;
            
            document.querySelector('.floor.active').appendChild(claim);
            document.getElementById('myEnergy')?.focus();
            
            // Auto-submit on Enter
            document.getElementById('myEnergy')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.lightItUp(x, y);
                }
            });
        },
        
        lightItUp: function(x, y) {
            const energy = document.getElementById('myEnergy')?.value || 'HERE FOR IT';
            const user = JSON.parse(localStorage.getItem('sf_user') || '{}');
            
            // Create an ENERGY PIN not a memory pin
            const pin = window.createAdvancedPin(x, y, 'energy', 'yellow', {
                caption: energy,
                vibe: 'electric',
                timestamp: Date.now()
            });
            
            // Make it electric
            const pinEl = document.getElementById(pin.id);
            if (pinEl) {
                pinEl.style.animation = 'electricGlow 1s infinite';
                pinEl.classList.add('live-energy');
                
                // Add live indicator
                const liveIndicator = document.createElement('span');
                liveIndicator.textContent = '⚡';
                liveIndicator.style.cssText = `
                    position: absolute;
                    top: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 14px;
                    animation: flash 0.5s infinite;
                `;
                pinEl.appendChild(liveIndicator);
            }
            
            // Remove form
            document.querySelector('.claim-form')?.parentElement.remove();
            
            // Create energy burst
            this.createEnergyBurst(x, y);
            
            // Broadcast presence
            this.broadcastPresence(energy);
        },
        
        createEnergyBurst: function(x, y) {
            // Multiple lightning bolts shooting out
            for (let i = 0; i < 6; i++) {
                const bolt = document.createElement('div');
                const angle = (i * 60) * Math.PI / 180;
                const endX = x + Math.cos(angle) * 30;
                const endY = y + Math.sin(angle) * 30;
                
                bolt.style.cssText = `
                    position: absolute;
                    left: ${x}%;
                    top: ${y}%;
                    width: 100px;
                    height: 2px;
                    background: linear-gradient(to right, gold, transparent);
                    transform-origin: left center;
                    transform: rotate(${i * 60}deg);
                    animation: lightningStrike 0.3s ease-out forwards;
                    pointer-events: none;
                `;
                
                document.querySelector('.floor.active').appendChild(bolt);
                setTimeout(() => bolt.remove(), 300);
            }
        },
        
        broadcastPresence: function(energy) {
            // Update the status to show collective energy
            this.updateCollectiveEnergy();
            
            // Trigger chain reactions
            this.triggerChainReaction();
        }
    };

    // ============================================
    // THE COLLECTIVE ENERGY SYSTEM
    // ============================================
    
    window.CollectiveEnergy = {
        currentVibe: 100,
        contributors: new Set(),
        
        init: function() {
            this.createEnergyMeter();
            this.startEnergyFlow();
        },
        
        createEnergyMeter: function() {
            // Replace "People: X" with ENERGY LEVEL
            const status = document.querySelector('.status');
            if (!status) return;
            
            const energyMeter = document.createElement('div');
            energyMeter.className = 'energy-meter';
            energyMeter.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: gold; font-weight: bold;">ENERGY</span>
                    <div style="
                        width: 150px;
                        height: 10px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 10px;
                        overflow: hidden;
                        position: relative;
                    ">
                        <div id="energyBar" style="
                            width: ${this.currentVibe}%;
                            height: 100%;
                            background: linear-gradient(90deg, #FFD700, #FF6B35, #FF00FF);
                            transition: width 0.5s ease;
                            animation: energyFlow 2s linear infinite;
                        "></div>
                    </div>
                    <span id="vibeLevel" style="color: gold; font-weight: bold;">
                        ${this.currentVibe}% 🔥
                    </span>
                </div>
                <div style="font-size: 10px; color: #888; margin-top: 5px;">
                    <span id="activeNow">0</span> LEGENDS ACTIVE NOW
                </div>
            `;
            
            status.appendChild(energyMeter);
        },
        
        boost: function(amount = 10) {
            this.currentVibe = Math.min(100, this.currentVibe + amount);
            document.getElementById('energyBar').style.width = `${this.currentVibe}%`;
            document.getElementById('vibeLevel').textContent = `${this.currentVibe}% 🔥`;
            
            // At certain thresholds, trigger events
            if (this.currentVibe > 80) {
                this.triggerPeakEnergy();
            }
        },
        
        triggerPeakEnergy: function() {
            // The floor comes ALIVE
            document.body.classList.add('peak-energy');
            
            // Everything glows harder
            document.querySelectorAll('.map-pin').forEach(pin => {
                pin.style.animation = 'intensePulse 0.5s infinite';
            });
            
            // Show notification
            const peak = document.createElement('div');
            peak.className = 'peak-notification';
            peak.textContent = '⚡ PEAK ENERGY REACHED ⚡';
            peak.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #FFD700, #FF00FF);
                color: white;
                padding: 15px 30px;
                border-radius: 30px;
                font-weight: bold;
                z-index: 2000;
                animation: peakFlash 1s ease;
            `;
            
            document.body.appendChild(peak);
            setTimeout(() => peak.remove(), 3000);
        }
    };

    // ============================================
    // SPREAD THE WORD - ACTIVE TENSE
    // ============================================
    
    window.SpreadTheVibe = {
        init: function() {
            this.setupLiveShare();
        },
        
        setupLiveShare: function() {
            // When someone claims space, give them instant share power
            window.addEventListener('spaceClamed', (e) => {
                this.offerInstantShare(e.detail);
            });
        },
        
        offerInstantShare: function(data) {
            // Subtle share prompt in corner
            const sharePrompt = document.createElement('div');
            sharePrompt.className = 'live-share-prompt';
            sharePrompt.innerHTML = `
                <button onclick="SpreadTheVibe.blast()" style="
                    background: linear-gradient(135deg, #1DA1F2, #FFD700);
                    border: none;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 11px;
                    cursor: pointer;
                    animation: pulse 2s infinite;
                ">
                    📢 TELL THEM YOU'RE HERE
                </button>
            `;
            sharePrompt.style.cssText = `
                position: fixed;
                bottom: 100px;
                right: 70px;
                z-index: 1500;
                animation: slideIn 0.5s ease;
            `;
            
            document.body.appendChild(sharePrompt);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                sharePrompt.style.animation = 'slideOut 0.5s ease forwards';
                setTimeout(() => sharePrompt.remove(), 500);
            }, 10000);
        },
        
        blast: function() {
            // Quick share options - present tense
            const messages = {
                twitter: "I'm at @SoundFactoryNYC RIGHT NOW! The floor is electric ⚡ Join me: ",
                instagram: "WE ARE SOUND FACTORY 🔥 The energy is unreal tonight! ",
                text: "Get here NOW! Sound Factory floor is LIT! "
            };
            
            // Auto-copy message
            const msg = messages.twitter + window.location.href;
            navigator.clipboard.writeText(msg);
            
            // Quick feedback
            this.showBlastConfirmation();
        },
        
        showBlastConfirmation: function() {
            const confirm = document.createElement('div');
            confirm.textContent = '⚡ LINK COPIED - SPREAD THE ENERGY!';
            confirm.style.cssText = `
                position: fixed;
                bottom: 150px;
                right: 70px;
                background: gold;
                color: black;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 12px;
                animation: confirmPop 0.5s ease;
                z-index: 2000;
            `;
            
            document.body.appendChild(confirm);
            setTimeout(() => confirm.remove(), 2000);
        }
    };

    // ============================================
    // CHAIN REACTIONS - ENERGY SPREADS
    // ============================================
    
    window.ChainReactions = {
        init: function() {
            this.watchForConnections();
        },
        
        watchForConnections: function() {
            // When pins get close, they react to each other
            setInterval(() => {
                const pins = document.querySelectorAll('.map-pin.live-energy');
                
                pins.forEach((pin1, i) => {
                    pins.forEach((pin2, j) => {
                        if (i >= j) return;
                        
                        const rect1 = pin1.getBoundingClientRect();
                        const rect2 = pin2.getBoundingClientRect();
                        const distance = Math.sqrt(
                            Math.pow(rect1.left - rect2.left, 2) +
                            Math.pow(rect1.top - rect2.top, 2)
                        );
                        
                        if (distance < 100) {
                            this.createEnergyBridge(pin1, pin2);
                        }
                    });
                });
            }, 2000);
        },
        
        createEnergyBridge: function(pin1, pin2) {
            const rect1 = pin1.getBoundingClientRect();
            const rect2 = pin2.getBoundingClientRect();
            
            const bridge = document.createElement('div');
            bridge.className = 'energy-bridge';
            bridge.style.cssText = `
                position: fixed;
                left: ${rect1.left + rect1.width/2}px;
                top: ${rect1.top + rect1.height/2}px;
                width: ${distance}px;
                height: 2px;
                background: linear-gradient(to right, gold, transparent, gold);
                transform-origin: left center;
                transform: rotate(${angle}rad);
                animation: energyFlow 1s linear infinite;
                pointer-events: none;
                z-index: 999;
            `;
            
            document.body.appendChild(bridge);
            setTimeout(() => bridge.remove(), 1000);
            
            // Boost collective energy
            CollectiveEnergy.boost(5);
        }
    };

    // ============================================
    // CSS FOR LIVING ENERGY
    // ============================================
    
    const styles = document.createElement('style');
    styles.textContent = `
        @keyframes powerUp {
            from {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes electricGlow {
            0%, 100% {
                box-shadow: 0 0 10px gold, 0 0 20px gold;
            }
            50% {
                box-shadow: 0 0 20px gold, 0 0 40px #FF6B35;
            }
        }
        
        @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        
        @keyframes lightningStrike {
            from {
                width: 0;
                opacity: 1;
            }
            to {
                width: 100px;
                opacity: 0;
            }
        }
        
        @keyframes energyFlow {
            from {
                background-position: 0% 50%;
            }
            to {
                background-position: 100% 50%;
            }
        }
        
        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
            }
            50% {
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            }
        }
        
        @keyframes intensePulse {
            0%, 100% {
                transform: rotate(-45deg) scale(1);
                filter: brightness(1);
            }
            50% {
                transform: rotate(-45deg) scale(1.2);
                filter: brightness(1.5);
            }
        }
        
        @keyframes peakFlash {
            0% {
                transform: translateX(-50%) scale(0.8);
                opacity: 0;
            }
            50% {
                transform: translateX(-50%) scale(1.1);
                opacity: 1;
            }
            100% {
                transform: translateX(-50%) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            to {
                transform: translateX(100px);
                opacity: 0;
            }
        }
        
        @keyframes confirmPop {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
        
        .peak-energy {
            animation: backgroundPulse 0.5s infinite;
        }
        
        @keyframes backgroundPulse {
            0%, 100% {
                filter: brightness(1);
            }
            50% {
                filter: brightness(1.1);
            }
        }
        
        body.memory-mode {
            /* We don't do memory mode - we do ENERGY mode */
        }
    `;
    document.head.appendChild(styles);

    // ============================================
    // INITIALIZATION - IT'S ALIVE!
    // ============================================
    
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize all systems
        WeAreSoundFactory.init();
        CollectiveEnergy.init();
        SpreadTheVibe.init();
        ChainReactions.init();
        
        // Set the tone immediately
        const welcome = document.createElement('div');
        welcome.className = 'energy-welcome';
        welcome.innerHTML = `
            <div style="
                color: gold;
                font-weight: bold;
                font-size: 14px;
                animation: fadeInOut 3s ease;
            ">
                WE ARE SOUND FACTORY ⚡
            </div>
        `;
        welcome.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 5000;
            pointer-events: none;
        `;
        
        document.body.appendChild(welcome);
        setTimeout(() => welcome.remove(), 3000);
        
        // Start with energy
        CollectiveEnergy.currentVibe = 60; // Starting hot
        CollectiveEnergy.boost(0); // Update display
    });
    
    // Add the fadeInOut animation
    const fadeStyle = document.createElement('style');
    fadeStyle.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(fadeStyle);

    // Make everything globally accessible
    window.WeAreSoundFactory = WeAreSoundFactory;
    window.CollectiveEnergy = CollectiveEnergy;
    window.SpreadTheVibe = SpreadTheVibe;
    window.ChainReactions = ChainReactions;

    console.log('⚡ WE ARE SOUND FACTORY - THE FLOOR IS ALIVE! ⚡');
})();
