// Pin System Module
(function() {
    'use strict';

    // Pin Configuration
    const PIN_CONFIG = {
        maxPinsPerUser: 5,
        pinLifespan: {
            memory: null, // Permanent
            song: 24 * 60 * 60 * 1000, // 24 hours
            moment: 12 * 60 * 60 * 1000, // 12 hours
            dream: 7 * 24 * 60 * 60 * 1000, // 7 days
            promo: 48 * 60 * 60 * 1000 // 48 hours
        },
        animations: {
            dropDuration: 500,
            pulseDuration: 2000,
            ghostFadeDuration: 5000,
            rainDuration: 2000
        }
    };

    // Pin State
    const pinState = {
        userPins: [],
        activePins: new Map(),
        selectedPin: null,
        isPlacingPin: false,
        pinRainActive: false,
        heatMapEnabled: false
    };

    // Initialize Pin System
    function initPinSystem() {
        setupPinEventListeners();
        loadExistingPins();
        startPinLifecycleManager();
        initializePinEffects();
    }

    // Setup Event Listeners
    function setupPinEventListeners() {
        // Long press for pin details
        let longPressTimer;
        const mapCanvas = document.getElementById('mapCanvas');
        
        if (mapCanvas) {
            mapCanvas.addEventListener('touchstart', (e) => {
                longPressTimer = setTimeout(() => {
                    handleLongPress(e);
                }, 500);
            });
            
            mapCanvas.addEventListener('touchend', () => {
                clearTimeout(longPressTimer);
            });
            
            mapCanvas.addEventListener('touchmove', () => {
                clearTimeout(longPressTimer);
            });
        }
        
        // Swipe gestures for pins
        setupSwipeGestures();
    }

    // Create Pin with Full Features
    window.createAdvancedPin = function(x, y, type, color, content = {}) {
        const pin = document.createElement('div');
        pin.className = `map-pin ${color} new`;
        pin.id = `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        pin.style.left = `${x}%`;
        pin.style.top = `${y}%`;
        
        // Pin data
        const pinData = {
            id: pin.id,
            type: type,
            color: color,
            x: x,
            y: y,
            content: content,
            created: Date.now(),
            expires: calculateExpiration(type),
            likes: 0,
            comments: [],
            user: window.state?.user || { id: 'anonymous', name: 'Guest' }
        };
        
        pin.dataset.pinData = JSON.stringify(pinData);
        
        // Add to DOM
        document.getElementById('mapCanvas')?.appendChild(pin);
        
        // Add to state
        pinState.activePins.set(pin.id, pinData);
        if (pinData.user.id === window.state?.user?.id) {
            pinState.userPins.push(pin.id);
        }
        
        // Apply entrance animation
        animatePinEntrance(pin, type);
        
        // Setup interactions
        setupPinInteractions(pin);
        
        // Check for overlapping pins (fusion)
        checkPinFusion(pin);
        
        // Trigger creation effects
        triggerPinCreationEffects(x, y, color);
        
        return pinData;
    };

    // Calculate Pin Expiration
    function calculateExpiration(type) {
        const lifespan = PIN_CONFIG.pinLifespan[type];
        return lifespan ? Date.now() + lifespan : null;
    }

    // Pin Entrance Animations
    function animatePinEntrance(pin, type) {
        switch(type) {
            case 'memory':
                // Blue glow trail effect
                pin.classList.add('memory-entrance');
                createGlowTrail(pin, 'blue');
                break;
            case 'song':
                // Yellow flicker effect
                pin.classList.add('song-entrance');
                setTimeout(() => {
                    pin.classList.add('yellow-flicker');
                    setTimeout(() => pin.classList.remove('yellow-flicker'), 2000);
                }, 500);
                break;
            case 'moment':
                // Red pulse effect
                pin.classList.add('moment-entrance');
                pin.classList.add('pulsing');
                break;
            case 'dream':
                // Green float effect
                pin.classList.add('dream-entrance');
                break;
            case 'promo':
                // Purple sparkle effect
                pin.classList.add('promo-entrance');
                createSparkles(pin);
                break;
        }
        
        setTimeout(() => {
            pin.classList.remove('new');
        }, PIN_CONFIG.animations.dropDuration);
    }

    // Setup Pin Interactions
    function setupPinInteractions(pin) {
        // Click/Tap
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            openPinDetail(pin);
        });
        
        // Hover (desktop): show small preview card (avatar + name)
        pin.addEventListener('mouseenter', () => {
            if (isTouchDevice()) return; // don't trigger on touch
            showPinPreview(pin);
        });
        pin.addEventListener('mouseleave', () => {
            hidePinPreview();
        });
        
        // Double tap for quick like
        let lastTap = 0;
        pin.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                quickLikePin(pin);
            }
            lastTap = currentTime;
        });
    }

    // Pin Preview on Hover
    function showPinPreview(pin) {
        // Do not show previews while in explicit Drop mode
        if (document.body.classList.contains('drop-mode-on')) return;
        hidePinPreview();
        const data = JSON.parse(pin.dataset.pinData || '{}');
        const name = data.user?.name || 'Anonymous';
        const avatar = data.user?.avatar || '';

        const preview = document.createElement('div');
        preview.className = 'pin-preview';
        preview.innerHTML = `
            <div class="preview-header">
                ${avatar ? `<img src="${avatar}" alt="">` : `<div class="avatar-fallback sf-badge">SF</div>`}
                <span>${name}</span>
            </div>
        `;
        const rect = pin.getBoundingClientRect();
        const canvas = document.getElementById('mapCanvas');
        const canvasRect = canvas?.getBoundingClientRect();
        // Base position centered above pin
        let left = Math.round(rect.left + rect.width/2);
        let top = Math.round(rect.top - 12);
        // Clamp to canvas bounds so it stays over blueprint
        if (canvasRect) {
            const cardWidth = 160; // approx min width
            const margin = 8;
            left = Math.max(canvasRect.left + margin, Math.min(left, canvasRect.right - margin));
            top = Math.max(canvasRect.top + margin, Math.min(top, canvasRect.bottom - margin));
        }
        preview.style.left = `${left}px`;
        preview.style.top = `${top}px`;
        preview.style.transform = 'translate(-50%, -100%)';
        (canvas || document.body).appendChild(preview);
    }

    function hidePinPreview() {
        document.querySelectorAll('.pin-preview').forEach(p => p.remove());
    }

    // Open Pin Detail
    function openPinDetail(pin) {
        hidePinPreview();
        const data = JSON.parse(pin.dataset.pinData || '{}');
        pinState.selectedPin = data.id;
        
        const popup = document.getElementById('pinPopup');
        if (!popup) return;
        
        // Populate popup
        document.getElementById('pinAvatar').src = data.user.avatar || '/assets/default-avatar.png';
        document.getElementById('pinUsername').textContent = data.user.name || 'Anonymous';
        document.getElementById('pinTime').textContent = getTimeAgo(data.created);
        document.getElementById('pinCaption').textContent = data.content.caption || '';
        
        // Update actions
        updatePinActions(data);
        
        // Show popup with animation
        if (popup.style.display !== 'block') {
            popup.style.display = 'block';
            requestAnimationFrame(() => {
                popup.classList.add('active');
            });
        }
        
        // Trigger haptic
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    }

    // Close popup helpers
    function closePinDetail() {
        const popup = document.getElementById('pinPopup');
        if (!popup) return;
        popup.classList.remove('active');
        setTimeout(() => { popup.style.display = 'none'; }, 200);
        pinState.selectedPin = null;
    }

    function isTouchDevice() {
        return ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    // Quick Like Pin
    function quickLikePin(pin) {
        const data = JSON.parse(pin.dataset.pinData || '{}');
        data.likes++;
        pin.dataset.pinData = JSON.stringify(data);
        
        // Create like animation
        const heart = document.createElement('div');
        heart.className = 'quick-like-heart';
        heart.textContent = '❤️';
        heart.style.cssText = `
            position: absolute;
            font-size: 2rem;
            z-index: 1000;
            animation: heartFloat 1s ease-out forwards;
            pointer-events: none;
        `;
        
        pin.appendChild(heart);
        setTimeout(() => heart.remove(), 1000);
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 20, 30]);
        }
    }

    // Pin Fusion System
    function checkPinFusion(newPin) {
        const threshold = 50; // pixels
        const rect = newPin.getBoundingClientRect();
        
        document.querySelectorAll('.map-pin').forEach(existingPin => {
            if (existingPin === newPin) return;
            
            const existingRect = existingPin.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(rect.left - existingRect.left, 2) +
                Math.pow(rect.top - existingRect.top, 2)
            );
            
            if (distance < threshold) {
                createPinFusion(newPin, existingPin);
            }
        });
    }

    function createPinFusion(pin1, pin2) {
        const fusion = document.createElement('div');
        fusion.className = 'pin-fusion';
        
        const rect1 = pin1.getBoundingClientRect();
        const rect2 = pin2.getBoundingClientRect();
        
        fusion.style.left = `${(rect1.left + rect2.left) / 2}px`;
        fusion.style.top = `${(rect1.top + rect2.top) / 2}px`;
        
        // Create fusion effect
        fusion.innerHTML = '<div class="fusion-burst"></div>';
        document.body.appendChild(fusion);
        
        setTimeout(() => fusion.remove(), 1000);
        
        // Combine pin data
        const data1 = JSON.parse(pin1.dataset.pinData || '{}');
        const data2 = JSON.parse(pin2.dataset.pinData || '{}');
        
        console.log('Pin fusion created between:', data1.type, 'and', data2.type);
    }

    // Pin Rain Effect (for DJ drops)
    window.triggerPinRain = function() {
        if (pinState.pinRainActive) return;
        
        pinState.pinRainActive = true;
        const colors = ['blue', 'yellow', 'red', 'green', 'purple'];
        
        const rainInterval = setInterval(() => {
            const pin = document.createElement('div');
            pin.className = `pin-rain ${colors[Math.floor(Math.random() * colors.length)]}`;
            pin.style.left = `${Math.random() * 100}%`;
            pin.style.animationDuration = `${2 + Math.random() * 2}s`;
            
            document.getElementById('mapCanvas')?.appendChild(pin);
            
            setTimeout(() => pin.remove(), 4000);
        }, 100);
        
        setTimeout(() => {
            clearInterval(rainInterval);
            pinState.pinRainActive = false;
        }, 5000);
    };

    // Swipe Gestures
    function setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let currentPin = null;
        
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.map-pin');
            if (target) {
                currentPin = target;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (!currentPin) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Detect swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - Like
                    quickLikePin(currentPin);
                } else {
                    // Swipe left - Share
                    sharePinToSocial(currentPin);
                }
            }
            
            currentPin = null;
        });
    }

    // Helper Functions
    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    function updatePinActions(data) {
        const likeBtn = document.querySelector('.pin-action.like .action-count');
        const commentBtn = document.querySelector('.pin-action.comment .action-count');
        
        if (likeBtn) likeBtn.textContent = data.likes || 0;
        if (commentBtn) commentBtn.textContent = data.comments?.length || 0;
    }

    function sharePinToSocial(pin) {
        const data = JSON.parse(pin.dataset.pinData || '{}');
        
        if (navigator.share) {
            navigator.share({
                title: 'Sound Factory Pin',
                text: data.content.caption || 'Check out this moment!',
                url: window.location.href + '#pin=' + data.id
            }).catch(err => console.log('Share cancelled'));
        }
    }

    function createGlowTrail(pin, color) {
        const trail = document.createElement('div');
        trail.className = 'glow-trail';
        trail.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, ${color}, transparent);
            opacity: 0.5;
            animation: glowPulse 2s ease-in-out infinite;
            pointer-events: none;
        `;
        pin.appendChild(trail);
    }

    function createSparkles(pin) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: sparkleFloat 1s ease-out forwards;
                    pointer-events: none;
                `;
                pin.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 1000);
            }, i * 200);
        }
    }

    function triggerPinCreationEffects(x, y, color) {
        // Ripple effect at creation point
        const ripple = document.createElement('div');
        ripple.className = 'pin-creation-ripple';
        ripple.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: 20px;
            height: 20px;
            border: 2px solid ${color};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: rippleExpand 1s ease-out forwards;
            pointer-events: none;
        `;
        
        document.getElementById('mapCanvas')?.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }

    // Long Press Handler
    function handleLongPress(e) {
        const target = e.target.closest('.map-pin');
        if (target) {
            console.log('Long press on pin:', target.id);
        }
    }

    // Pin Lifecycle Manager
    function startPinLifecycleManager() {
        setInterval(() => {
            const now = Date.now();
            
            pinState.activePins.forEach((pinData, pinId) => {
                if (pinData.expires && pinData.expires < now) {
                    const pinElement = document.getElementById(pinId);
                    if (pinElement) {
                        pinElement.classList.add('ghost');
                        setTimeout(() => {
                            pinElement.remove();
                        }, PIN_CONFIG.animations.ghostFadeDuration);
                    }
                    pinState.activePins.delete(pinId);
                }
            });
        }, 60000); // Check every minute
    }

    // Load existing pins
    function loadExistingPins() {
        console.log('Loading existing pins...');
    }

    // Initialize pin effects styles
    function initializePinEffects() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes heartFloat {
                from {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateY(-50px) scale(1.5);
                    opacity: 0;
                }
            }
            @keyframes rippleExpand {
                from {
                    width: 20px;
                    height: 20px;
                    opacity: 1;
                }
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
            @keyframes sparkleFloat {
                from {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                to {
                    transform: translateY(-30px) rotate(180deg);
                    opacity: 0;
                }
            }
            @keyframes glowPulse {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
            }
            .pin-preview {
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 10px;
                padding: 8px 10px;
                color: white;
                z-index: 1300;
                pointer-events: none;
                box-shadow: 0 12px 30px rgba(0,0,0,0.45);
                backdrop-filter: blur(6px);
                min-width: 140px;
            }
            .preview-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            .preview-header img {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.2);
                object-fit: cover;
            }
            .avatar-fallback{
                width: 28px; height: 28px; border-radius: 50%;
                display:flex; align-items:center; justify-content:center;
                background: linear-gradient(135deg, #6a11cb, #2575fc);
                font-weight: 800; font-size: 12px;
                border: 1px solid rgba(255,255,255,0.25);
            }
            .avatar-fallback.sf-badge{ letter-spacing: 0.5px; }
        `;
        document.head.appendChild(style);
    }

    // Initialize on DOM ready and wire close handlers
    function ready(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);} else { fn(); } }
    ready(() => {
        initPinSystem();
        document.getElementById('pinClose')?.addEventListener('click', closePinDetail);
        document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closePinDetail(); });
        // Clicking outside content closes, but ignore clicks inside
        const popup = document.getElementById('pinPopup');
        if (popup) {
            popup.addEventListener('click', (e)=>{ if (e.target === popup) closePinDetail(); });
        }
    });

})();