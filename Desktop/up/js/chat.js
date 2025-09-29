// Chat System Module
(function() {
    'use strict';

    // Configuration
    const CHAT_CONFIG = {
        maxMessageLength: 100,
        messageStreamSpeed: 3000,
        streakThreshold: 5,
        streakTimeWindow: 10000, // 10 seconds
        reactionCooldown: 500
    };

    // Chat State
    const chatState = {
        messages: [],
        currentStreak: 0,
        lastMessageTime: 0,
        typingUsers: new Set(),
        reactionCooldowns: new Map()
    };

    // Initialize Chat
    function initChat() {
        setupChatListeners();
        startMessageStream();
        initializeReactions();
    }

    // Setup Event Listeners
    function setupChatListeners() {
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');
        
        if (chatInput) {
            // Input events
            chatInput.addEventListener('input', handleTyping);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Focus effects
            chatInput.addEventListener('focus', () => {
                document.querySelector('.chat-input-wrapper')?.classList.add('focused');
                triggerHaptic(10);
            });
            
            chatInput.addEventListener('blur', () => {
                document.querySelector('.chat-input-wrapper')?.classList.remove('focused');
            });
        }
        
        if (chatSend) {
            chatSend.addEventListener('click', sendMessage);
        }
    }

    // Send Message
    function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Check authentication
        if (!window.state?.isAuthenticated) {
            showChatNotification('Please login to chat!');
            return;
        }
        
        // Create message object
        const messageData = {
            id: generateMessageId(),
            text: message,
            user: window.state.user?.id || 'anonymous',
            timestamp: Date.now(),
            reactions: []
        };
        
        // Add to state
        chatState.messages.push(messageData);
        
        // Clear input
        input.value = '';
        
        // Trigger send animation
        const sendBtn = document.getElementById('chatSend');
        sendBtn.classList.add('sending');
        setTimeout(() => sendBtn.classList.remove('sending'), 500);
        
        // Add to message stream
        addToMessageStream(messageData);
        
        // Check for streak
        checkMessageStreak();
        
        // Trigger effects
        triggerSendEffects();
        
        // Send to server (simulated)
        broadcastMessage(messageData);
    }

    // Add to Message Stream
    function addToMessageStream(messageData) {
        const stream = document.getElementById('messageStream');
        if (!stream) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = messageData.text;
        bubble.style.animationDuration = `${CHAT_CONFIG.messageStreamSpeed}ms`;
        
        stream.appendChild(bubble);
        
        // Remove after animation
        setTimeout(() => {
            bubble.remove();
        }, CHAT_CONFIG.messageStreamSpeed);
    }

    // Check Message Streak
    function checkMessageStreak() {
        const now = Date.now();
        
        if (now - chatState.lastMessageTime < CHAT_CONFIG.streakTimeWindow) {
            chatState.currentStreak++;
            
            if (chatState.currentStreak >= CHAT_CONFIG.streakThreshold) {
                showStreakCounter(chatState.currentStreak);
                triggerStreakEffects();
            }
        } else {
            chatState.currentStreak = 1;
        }
        
        chatState.lastMessageTime = now;
    }

    // Show Streak Counter
    function showStreakCounter(count) {
        let counter = document.querySelector('.streak-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'streak-counter';
            document.querySelector('.chat-container')?.appendChild(counter);
        }
        
        counter.textContent = `🔥 ${count} STREAK!`;
        counter.classList.add('active');
        
        // Hide after 3 seconds
        setTimeout(() => {
            counter.classList.remove('active');
        }, 3000);
    }

    // Typing Indicator
    function handleTyping() {
        const input = document.getElementById('chatInput');
        const userId = window.state?.user?.id;
        
        if (!userId || !input.value) return;
        
        // Broadcast typing status (simulated)
        broadcastTyping(userId);
        
        // Clear typing after delay
        clearTimeout(chatState.typingTimeout);
        chatState.typingTimeout = setTimeout(() => {
            stopTyping(userId);
        }, 1000);
    }

    // Show Typing Indicators
    function showTypingIndicator(userId) {
        chatState.typingUsers.add(userId);
        updateTypingIndicators();
    }

    function hideTypingIndicator(userId) {
        chatState.typingUsers.delete(userId);
        updateTypingIndicators();
    }

    function updateTypingIndicators() {
        const indicators = document.getElementById('typingIndicators');
        if (!indicators) return;
        
        if (chatState.typingUsers.size > 0) {
            indicators.innerHTML = `
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            `;
            indicators.classList.add('active');
        } else {
            indicators.classList.remove('active');
        }
    }

    // Reactions System
    function initializeReactions() {
        document.querySelectorAll('.reaction').forEach(reaction => {
            reaction.addEventListener('click', handleReaction);
        });
    }

    function handleReaction(e) {
        const emoji = e.currentTarget.dataset.emoji;
        
        // Check cooldown
        if (chatState.reactionCooldowns.has(emoji)) {
            const lastTime = chatState.reactionCooldowns.get(emoji);
            if (Date.now() - lastTime < CHAT_CONFIG.reactionCooldown) {
                return;
            }
        }
        
        // Set cooldown
        chatState.reactionCooldowns.set(emoji, Date.now());
        
        // Animate reaction
        e.currentTarget.classList.add('selected');
        setTimeout(() => {
            e.currentTarget.classList.remove('selected');
        }, 500);
        
        // Create floating reaction
        createFloatingReaction(emoji);
        
        // Trigger haptic
        triggerHaptic(30);
        
        // Broadcast reaction
        broadcastReaction(emoji);
    }

    function createFloatingReaction(emoji) {
        const reaction = document.createElement('div');
        reaction.className = 'floating-reaction';
        reaction.textContent = emoji;
        reaction.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: ${Math.random() * 80 + 10}%;
            font-size: 2rem;
            z-index: 1000;
            animation: floatUp 2s ease-out forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(reaction);
        
        setTimeout(() => reaction.remove(), 2000);
    }

    // Effects and Animations
    function triggerSendEffects() {
        // Haptic feedback
        triggerHaptic(50);
        
        // Create particle burst
        createParticleBurst();
        
        // Flash effect
        const wrapper = document.querySelector('.chat-input-wrapper');
        wrapper?.classList.add('flash');
        setTimeout(() => wrapper?.classList.remove('flash'), 200);
    }

    function triggerStreakEffects() {
        // Enhanced haptic
        triggerHaptic([50, 30, 50]);
        
        // Create celebration particles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => createCelebrationParticle(), i * 50);
        }
    }

    function createParticleBurst() {
        const container = document.createElement('div');
        container.className = 'celebration-particles';
        container.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            pointer-events: none;
            z-index: 1000;
        `;
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${['#FF00FF', '#00FFFF', '#FFD700'][Math.floor(Math.random() * 3)]};
                border-radius: 50%;
                --x: ${(Math.random() - 0.5) * 100}px;
                --y: ${-Math.random() * 100 - 50}px;
                animation: particleBurst 1s ease-out forwards;
            `;
            container.appendChild(particle);
        }
        
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 1000);
    }

    function createCelebrationParticle() {
        const particle = document.createElement('div');
        particle.textContent = ['🎉', '✨', '🔥', '💫'][Math.floor(Math.random() * 4)];
        particle.style.cssText = `
            position: fixed;
            bottom: ${Math.random() * 200 + 60}px;
            left: ${Math.random() * 100}%;
            font-size: 1.5rem;
            z-index: 1000;
            animation: celebrationFloat 3s ease-out forwards;
            pointer-events: none;
        `;
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }

    // Haptic Feedback
    function triggerHaptic(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
        
        // Visual feedback for non-haptic devices
        const pulse = document.createElement('div');
        pulse.className = 'haptic-pulse active';
        document.querySelector('.chat-input-wrapper')?.appendChild(pulse);
        setTimeout(() => pulse.remove(), 200);
    }

    // Message Stream Simulation
    function startMessageStream() {
        // Simulate incoming messages
        const sampleMessages = [
            "This party is lit! 🔥",
            "DJ dropping bangers tonight!",
            "Anyone else hyped?",
            "Sound Factory never disappoints!",
            "Halloween vibes are immaculate",
            "Who's coming tonight?",
            "Table service is amazing here",
            "Best venue in the city!"
        ];
        
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance of message
                const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
                addToMessageStream({ text: message });
            }
        }, 5000);
    }

    // Network Functions (Simulated)
    function broadcastMessage(messageData) {
        console.log('Broadcasting message:', messageData);
        // In production, send via WebSocket or API
    }

    function broadcastTyping(userId) {
        console.log('User typing:', userId);
        // In production, send via WebSocket
    }

    function stopTyping(userId) {
        console.log('User stopped typing:', userId);
        // In production, send via WebSocket
    }

    function broadcastReaction(emoji) {
        console.log('Broadcasting reaction:', emoji);
        // In production, send via WebSocket
    }

    // Utility Functions
    function generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function showChatNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 255, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            from {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            to {
                transform: translateY(-150px) scale(1.5);
                opacity: 0;
            }
        }
        @keyframes celebrationFloat {
            from {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            to {
                transform: translateY(-200px) rotate(360deg);
                opacity: 0;
            }
        }
        .chat-input-wrapper.flash {
            animation: inputFlash 0.2s ease;
        }
        @keyframes inputFlash {
            0%, 100% { background: rgba(255, 255, 255, 0.1); }
            50% { background: rgba(255, 255, 255, 0.3); }
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChat);
    } else {
        initChat();
    }

})();