// Sound Factory AI Monitor - Real-time Crowd Analytics & Interventions
(function() {
    'use strict';

    // AI Monitoring Configuration
    const AI_CONFIG = {
        // Crowd density thresholds
        CROWD_DENSITY: {
            LOW: 0.3,
            MEDIUM: 0.6,
            HIGH: 0.8,
            CRITICAL: 0.95
        },
        
        // Spending velocity thresholds
        SPENDING_VELOCITY: {
            LOW: 50,      // $50/hour
            MEDIUM: 150,  // $150/hour
            HIGH: 300,    // $300/hour
            VIP: 500      // $500/hour
        },
        
        // Chat sentiment scores
        SENTIMENT: {
            NEGATIVE: -0.5,
            NEUTRAL: 0,
            POSITIVE: 0.5,
            ECSTATIC: 0.8
        },
        
        // Music energy levels
        MUSIC_ENERGY: {
            LOW: 100,     // BPM
            MEDIUM: 120,
            HIGH: 140,
            PEAK: 160
        },
        
        // Time patterns
        TIME_PATTERNS: {
            EARLY: '21:00-23:00',
            PEAK: '23:00-01:00',
            LATE: '01:00-03:00',
            CLOSING: '03:00-04:00'
        }
    };

    // AI Monitor State
    let aiMonitor = {
        crowdDensity: 0.5,
        spendingVelocity: 0,
        chatSentiment: 0,
        musicBPM: 120,
        timePattern: 'PEAK',
        userBehavior: new Map(),
        interventions: [],
        isActive: false
    };

    // Initialize AI Monitor
    function initAIMonitor() {
        console.log('🤖 AI Monitor initializing...');
        
        // Start monitoring loops
        startCrowdDensityMonitoring();
        startSpendingVelocityTracking();
        startChatSentimentAnalysis();
        startMusicEnergyMonitoring();
        startTimePatternAnalysis();
        startUserBehaviorTracking();
        
        // Start intervention engine
        startInterventionEngine();
        
        aiMonitor.isActive = true;
        console.log('🤖 AI Monitor active - monitoring crowd analytics');
    }

    // Crowd Density Monitoring
    function startCrowdDensityMonitoring() {
        setInterval(() => {
            // Simulate crowd density calculation based on pin drops, avatars, and activity
            const pinCount = document.querySelectorAll('.pin').length;
            const avatarCount = document.querySelectorAll('.avatar').length;
            const activeUsers = getActiveUserCount();
            
            aiMonitor.crowdDensity = Math.min(1, (pinCount + avatarCount + activeUsers) / 100);
            
            // Trigger interventions based on crowd density
            if (aiMonitor.crowdDensity < AI_CONFIG.CROWD_DENSITY.LOW) {
                triggerCrowdEnergyIntervention();
            } else if (aiMonitor.crowdDensity > AI_CONFIG.CROWD_DENSITY.CRITICAL) {
                triggerCrowdControlIntervention();
            }
        }, 5000);
    }

    // Spending Velocity Tracking
    function startSpendingVelocityTracking() {
        setInterval(() => {
            // Calculate spending velocity from recent transactions
            const recentSpending = getRecentSpending(3600000); // Last hour
            aiMonitor.spendingVelocity = recentSpending;
            
            // Trigger spending-based interventions
            if (aiMonitor.spendingVelocity > AI_CONFIG.SPENDING_VELOCITY.VIP) {
                triggerVIPIntervention();
            } else if (aiMonitor.spendingVelocity < AI_CONFIG.SPENDING_VELOCITY.LOW) {
                triggerSpendingBoostIntervention();
            }
        }, 10000);
    }

    // Chat Sentiment Analysis
    function startChatSentimentAnalysis() {
        setInterval(() => {
            // Analyze chat messages for sentiment
            const chatMessages = getRecentChatMessages();
            aiMonitor.chatSentiment = analyzeSentiment(chatMessages);
            
            // Trigger sentiment-based interventions
            if (aiMonitor.chatSentiment < AI_CONFIG.SENTIMENT.NEGATIVE) {
                triggerMoodBoostIntervention();
            } else if (aiMonitor.chatSentiment > AI_CONFIG.SENTIMENT.ECSTATIC) {
                triggerCelebrationIntervention();
            }
        }, 15000);
    }

    // Music Energy Monitoring
    function startMusicEnergyMonitoring() {
        setInterval(() => {
            // Monitor music BPM and energy
            aiMonitor.musicBPM = getCurrentMusicBPM();
            
            // Trigger music-based interventions
            if (aiMonitor.musicBPM < AI_CONFIG.MUSIC_ENERGY.LOW) {
                triggerEnergyBoostIntervention();
            } else if (aiMonitor.musicBPM > AI_CONFIG.MUSIC_ENERGY.PEAK) {
                triggerPeakEnergyIntervention();
            }
        }, 20000);
    }

    // Time Pattern Analysis
    function startTimePatternAnalysis() {
        setInterval(() => {
            const currentHour = new Date().getHours();
            
            if (currentHour >= 21 && currentHour < 23) {
                aiMonitor.timePattern = 'EARLY';
            } else if (currentHour >= 23 || currentHour < 1) {
                aiMonitor.timePattern = 'PEAK';
            } else if (currentHour >= 1 && currentHour < 3) {
                aiMonitor.timePattern = 'LATE';
            } else {
                aiMonitor.timePattern = 'CLOSING';
            }
            
            // Trigger time-based interventions
            triggerTimeBasedIntervention(aiMonitor.timePattern);
        }, 30000);
    }

    // User Behavior Tracking
    function startUserBehaviorTracking() {
        setInterval(() => {
            // Track individual user behavior patterns
            const userId = getCurrentUserId();
            if (userId) {
                const behavior = getUserBehavior(userId);
                aiMonitor.userBehavior.set(userId, behavior);
                
                // Trigger personalized interventions
                if (behavior.spent > 100) {
                    triggerPersonalizedVIPIntervention(userId);
                } else if (behavior.energy < 0.3) {
                    triggerPersonalizedEnergyIntervention(userId);
                }
            }
        }, 25000);
    }

    // Intervention Engine
    function startInterventionEngine() {
        setInterval(() => {
            // Process pending interventions
            processInterventions();
        }, 2000);
    }

    // Crowd Energy Intervention
    function triggerCrowdEnergyIntervention() {
        const intervention = {
            type: 'CROWD_ENERGY',
            position: getRandomEmptyPosition(),
            content: 'FREE ENERGY SHOT',
            duration: 5000,
            priority: 'HIGH',
            timestamp: Date.now()
        };
        
        createInterventionBox(intervention);
        console.log('🤖 AI: Triggering crowd energy intervention');
    }

    // VIP Intervention for High Spenders
    function triggerVIPIntervention() {
        const intervention = {
            type: 'VIP_ACCESS',
            position: getNearUserPosition(),
            content: 'VIP BACKSTAGE ACCESS',
            duration: 10000,
            priority: 'EXCLUSIVE',
            exclusive: true,
            timestamp: Date.now()
        };
        
        createInterventionBox(intervention);
        console.log('🤖 AI: Triggering VIP intervention for high spender');
    }

    // Mood Boost Intervention
    function triggerMoodBoostIntervention() {
        const intervention = {
            type: 'MOOD_BOOST',
            position: getRandomPosition(),
            content: 'FREE HAPPY DRINK',
            duration: 8000,
            priority: 'MEDIUM',
            timestamp: Date.now()
        };
        
        createInterventionBox(intervention);
        console.log('🤖 AI: Triggering mood boost intervention');
    }

    // Energy Boost Intervention
    function triggerEnergyBoostIntervention() {
        const intervention = {
            type: 'ENERGY_BOOST',
            position: getRandomPosition(),
            content: 'ENERGY BOOST ACTIVATED',
            duration: 6000,
            priority: 'HIGH',
            timestamp: Date.now()
        };
        
        createInterventionBox(intervention);
        console.log('🤖 AI: Triggering energy boost intervention');
    }

    // Personalized VIP Intervention
    function triggerPersonalizedVIPIntervention(userId) {
        const intervention = {
            type: 'PERSONALIZED_VIP',
            position: getNearUserPosition(userId),
            content: 'PERSONAL VIP TREATMENT',
            duration: 12000,
            priority: 'EXCLUSIVE',
            userId: userId,
            exclusive: true,
            timestamp: Date.now()
        };
        
        createInterventionBox(intervention);
        console.log(`🤖 AI: Triggering personalized VIP intervention for user ${userId}`);
    }

    // Create Intervention Box
    function createInterventionBox(intervention) {
        const box = document.createElement('div');
        box.className = 'ai-intervention-box';
        box.dataset.type = intervention.type;
        box.dataset.priority = intervention.priority;
        box.style.cssText = `
            position: fixed;
            left: ${intervention.position.x}px;
            top: ${intervention.position.y}px;
            background: linear-gradient(135deg, #ff6b00, #ff8c00);
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 16px;
            z-index: 10001;
            box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
            animation: interventionPulse 0.5s ease;
            cursor: pointer;
            max-width: 200px;
            text-align: center;
        `;
        
        box.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🎁</span>
                <div>
                    <div style="font-size: 14px; opacity: 0.9;">AI INTERVENTION</div>
                    <div style="font-size: 18px; margin-top: 5px;">${intervention.content}</div>
                </div>
            </div>
        `;
        
        // Add click handler
        box.addEventListener('click', () => {
            handleInterventionClick(intervention);
            box.remove();
        });
        
        document.body.appendChild(box);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (box.parentNode) {
                box.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => box.remove(), 500);
            }
        }, intervention.duration);
        
        // Add to interventions array
        aiMonitor.interventions.push(intervention);
    }

    // Handle Intervention Click
    function handleInterventionClick(intervention) {
        console.log(`🤖 AI: User claimed intervention: ${intervention.content}`);
        
        // Process intervention based on type
        switch(intervention.type) {
            case 'CROWD_ENERGY':
                processEnergyShot();
                break;
            case 'VIP_ACCESS':
                processVIPAccess();
                break;
            case 'MOOD_BOOST':
                processMoodBoost();
                break;
            case 'ENERGY_BOOST':
                processEnergyBoost();
                break;
            case 'PERSONALIZED_VIP':
                processPersonalizedVIP(intervention.userId);
                break;
        }
        
        // Track intervention success
        trackInterventionSuccess(intervention);
    }

    // Process Energy Shot
    function processEnergyShot() {
        // Trigger energy shot effect
        showNotification('⚡ FREE ENERGY SHOT CLAIMED!', '#00ff88');
        
        // Add energy to user
        if (window.addUserEnergy) {
            window.addUserEnergy(50);
        }
    }

    // Process VIP Access
    function processVIPAccess() {
        showNotification('👑 VIP BACKSTAGE ACCESS GRANTED!', '#ffd700');
        
        // Redirect to VIP area or activate VIP features
        if (window.activateVIPMode) {
            window.activateVIPMode();
        }
    }

    // Process Mood Boost
    function processMoodBoost() {
        showNotification('😊 FREE HAPPY DRINK CLAIMED!', '#ff6b6b');
        
        // Trigger mood boost effect
        if (window.boostMood) {
            window.boostMood();
        }
    }

    // Process Energy Boost
    function processEnergyBoost() {
        showNotification('⚡ ENERGY BOOST ACTIVATED!', '#4ecdc4');
        
        // Trigger energy boost effect
        if (window.boostEnergy) {
            window.boostEnergy();
        }
    }

    // Process Personalized VIP
    function processPersonalizedVIP(userId) {
        showNotification('👑 PERSONAL VIP TREATMENT ACTIVATED!', '#ffd700');
        
        // Activate personalized VIP features
        if (window.activatePersonalizedVIP) {
            window.activatePersonalizedVIP(userId);
        }
    }

    // Helper Functions
    function getActiveUserCount() {
        // Count active users based on recent activity
        return Math.floor(Math.random() * 50) + 20; // Simulated
    }

    function getRecentSpending(timeframe) {
        // Get recent spending from localStorage or API
        const purchases = JSON.parse(localStorage.getItem('sf_purchases') || '[]');
        const now = Date.now();
        const recent = purchases.filter(p => (now - p.timestamp) < timeframe);
        return recent.reduce((sum, p) => sum + (p.amount || 0), 0) / 100; // Convert cents to dollars
    }

    function getRecentChatMessages() {
        // Get recent chat messages for sentiment analysis
        return []; // Simulated - would get from chat system
    }

    function analyzeSentiment(messages) {
        // Simple sentiment analysis
        if (messages.length === 0) return 0;
        
        const positiveWords = ['amazing', 'awesome', 'love', 'great', 'fantastic', 'incredible'];
        const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'disappointed', 'boring'];
        
        let score = 0;
        messages.forEach(msg => {
            const text = msg.text.toLowerCase();
            positiveWords.forEach(word => {
                if (text.includes(word)) score += 0.1;
            });
            negativeWords.forEach(word => {
                if (text.includes(word)) score -= 0.1;
            });
        });
        
        return Math.max(-1, Math.min(1, score));
    }

    function getCurrentMusicBPM() {
        // Get current music BPM from audio system
        return 120 + Math.floor(Math.random() * 40); // Simulated
    }

    function getCurrentUserId() {
        // Get current user ID from auth system
        return localStorage.getItem('sf_user_id') || null;
    }

    function getUserBehavior(userId) {
        // Get user behavior data
        return {
            spent: getRecentSpending(3600000), // Last hour
            energy: Math.random(),
            activity: Math.random(),
            preferences: {}
        };
    }

    function getRandomEmptyPosition() {
        return {
            x: Math.random() * (window.innerWidth - 200),
            y: Math.random() * (window.innerHeight - 100)
        };
    }

    function getNearUserPosition(userId = null) {
        // Get position near user
        return {
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * 200
        };
    }

    function getRandomPosition() {
        return {
            x: Math.random() * (window.innerWidth - 200),
            y: Math.random() * (window.innerHeight - 100)
        };
    }

    function processInterventions() {
        // Clean up expired interventions
        const now = Date.now();
        aiMonitor.interventions = aiMonitor.interventions.filter(i => 
            (now - i.timestamp) < (i.duration + 5000)
        );
    }

    function trackInterventionSuccess(intervention) {
        // Track intervention success for AI learning
        console.log(`🤖 AI: Intervention success tracked: ${intervention.type}`);
    }

    function showNotification(message, color = '#ff6b00') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            z-index: 10002;
            font-weight: bold;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes interventionPulse {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.8); }
        }
        
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        
        .ai-intervention-box:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 35px rgba(255, 107, 0, 0.6);
        }
    `;
    document.head.appendChild(style);

    // Initialize AI Monitor when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIMonitor);
    } else {
        initAIMonitor();
    }

    // Export for external access
    window.AIMonitor = {
        getMetrics: () => aiMonitor,
        triggerIntervention: (type, content) => {
            const intervention = {
                type: type,
                position: getRandomPosition(),
                content: content,
                duration: 5000,
                priority: 'MANUAL',
                timestamp: Date.now()
            };
            createInterventionBox(intervention);
        }
    };

})();


