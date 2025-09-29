// Main Application JavaScript
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        eventDate: new Date('2025-10-31T22:00:00'), // Halloween Party Start Time
        stripePublicKey: 'pk_test_YOUR_STRIPE_KEY', // Replace with actual Stripe key
        apiEndpoint: '/.netlify/functions/',
        maxPinsPerUser: 5,
        pinLifespan: {
            memory: null, // Permanent
            song: 24 * 60 * 60 * 1000, // 24 hours
            moment: 12 * 60 * 60 * 1000, // 12 hours
            dream: 7 * 24 * 60 * 60 * 1000, // 7 days
            promo: 48 * 60 * 60 * 1000 // 48 hours
        }
    };

    // State Management
    const state = {
        user: null,
        isAuthenticated: false,
        pins: [],
        messages: [],
        activePin: null,
        userPinCount: 0
    };

    // Initialize Application
    function init() {
        console.log('Sound Factory App Initializing...');
        
        // Auth is handled by simple-auth.js
        // checkAuthStatus();
        
        // Initialize countdown timer
        startCountdown();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize map
        initializeMap();
        
        // Load existing pins
        loadPins();
        
        // Check for mobile device
        checkMobileDevice();
        
        // iOS-specific initialization
        initIOSFeatures();
    }

    // Authentication Check
    function getCookie(name) {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return v ? v.pop() : '';
    }

    function checkAuthStatus() {
        // Prefer cookie set by external SMS widget
        const cookieToken = getCookie('sf_token');
        if (cookieToken) {
            state.user = { id: 'cookie', phone: 'unknown', verified: true };
            state.isAuthenticated = true;
            hideAuthModal();
            showUserDashboardButton();
            return;
        }

        // Back-compat localStorage
        const token = localStorage.getItem('sf_auth_token');
        const user = localStorage.getItem('sf_user');
        if (token && user) {
            state.user = JSON.parse(user);
            state.isAuthenticated = true;
            hideAuthModal();
            showUserDashboardButton();
        }
    }

    // Show/Hide Auth Modal
    function showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }

    function hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('active', 'closing');
            }, 300);
        }
    }

    // Countdown Timer
    function startCountdown() {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = CONFIG.eventDate.getTime() - now;

            if (distance < 0) {
                document.getElementById('countdown').innerHTML = '<div class="event-live">EVENT IS LIVE!</div>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Event Listeners Setup
    function setupEventListeners() {
        // Header Buttons
        document.getElementById('ticketBtn')?.addEventListener('click', handleTicketPurchase);
        document.getElementById('tablesBtn')?.addEventListener('click', handleTableBooking);
        
        // Pin Creation
        document.getElementById('createPinBtn')?.addEventListener('click', togglePinSelector);
        
        // Pin Type Selection
        document.querySelectorAll('.pin-type').forEach(pinType => {
            pinType.addEventListener('click', handlePinTypeSelection);
        });
        
        // Pin Popup Close
        document.getElementById('pinClose')?.addEventListener('click', closePinPopup);
        
        // Map Canvas Click
        document.getElementById('mapCanvas')?.addEventListener('click', handleMapClick);
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closePinPopup();
                hidePinSelector();
            }
        });
    }

    // Ticket Purchase Handler
    function handleTicketPurchase() {
        if (!state.isAuthenticated) {
            showAuthModal();
            return;
        }
        
        // Redirect to TicketSpice
        window.open('https://soundfactory.ticketspice.com/soundfactory-sance', '_blank');
    }

    // Table Booking Handler
    function handleTableBooking() {
        if (!state.isAuthenticated) {
            showAuthModal();
            return;
        }
        
        // Redirect to tables page
        window.location.href = '/tables.html';
    }

    // Pin System Functions
    function togglePinSelector() {
        const selector = document.getElementById('pinSelector');
        if (selector.style.display === 'none') {
            if (state.userPinCount >= CONFIG.maxPinsPerUser) {
                showNotification('Maximum 5 pins allowed. Remove one to add more!', 'warning');
                return;
            }
            selector.style.display = 'block';
            selector.classList.add('active');
        } else {
            hidePinSelector();
        }
    }

    function hidePinSelector() {
        const selector = document.getElementById('pinSelector');
        selector.classList.remove('active');
        setTimeout(() => {
            selector.style.display = 'none';
        }, 300);
    }

    function handlePinTypeSelection(e) {
        const pinType = e.currentTarget.dataset.type;
        const pinColor = e.currentTarget.dataset.color;
        
        // Enable map click to place pin
        state.pendingPin = { type: pinType, color: pinColor };
        hidePinSelector();
        
        document.getElementById('mapCanvas').classList.add('placing-pin');
        showNotification('Tap on the map to place your pin', 'info');
    }

    function handleMapClick(e) {
        if (!state.pendingPin) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        createPin(x, y, state.pendingPin);
        
        state.pendingPin = null;
        e.currentTarget.classList.remove('placing-pin');
    }

    function createPin(x, y, pinData) {
        const pin = document.createElement('div');
        pin.className = `map-pin ${pinData.color} new`;
        pin.style.left = `${x}%`;
        pin.style.top = `${y}%`;
        pin.dataset.id = generateId();
        pin.dataset.type = pinData.type;
        pin.dataset.color = pinData.color;
        pin.dataset.created = Date.now();
        
        pin.addEventListener('click', openPinPopup);
        
        document.getElementById('mapCanvas').appendChild(pin);
        
        // Add to state
        state.pins.push({
            id: pin.dataset.id,
            type: pinData.type,
            color: pinData.color,
            x: x,
            y: y,
            created: Date.now(),
            user: state.user
        });
        
        state.userPinCount++;
        
        // Animate pin drop
        setTimeout(() => {
            pin.classList.remove('new');
        }, 2000);
        
        // Trigger haptic feedback on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
        
        showNotification('Pin created successfully!', 'success');
    }

    function loadPins() {
        // Simulate loading existing pins
        // In production, this would fetch from a database
        const mockPins = [
            { id: '1', type: 'memory', color: 'blue', x: 20, y: 30 },
            { id: '2', type: 'song', color: 'yellow', x: 50, y: 60 },
            { id: '3', type: 'moment', color: 'red', x: 70, y: 40 }
        ];
        
        mockPins.forEach(pinData => {
            const pin = document.createElement('div');
            pin.className = `map-pin ${pinData.color}`;
            pin.style.left = `${pinData.x}%`;
            pin.style.top = `${pinData.y}%`;
            pin.dataset.id = pinData.id;
            pin.dataset.type = pinData.type;
            
            pin.addEventListener('click', openPinPopup);
            
            document.getElementById('mapCanvas')?.appendChild(pin);
        });
    }

    function openPinPopup(e) {
        e.stopPropagation();
        
        const pin = e.currentTarget;
        const popup = document.getElementById('pinPopup');
        
        // Populate popup with pin data
        document.getElementById('pinUsername').textContent = 'User ' + pin.dataset.id;
        document.getElementById('pinTime').textContent = 'Just now';
        document.getElementById('pinCaption').textContent = `This is a ${pin.dataset.type} pin!`;
        
        popup.style.display = 'block';
        setTimeout(() => {
            popup.classList.add('active');
        }, 10);
        
        state.activePin = pin.dataset.id;
    }

    function closePinPopup() {
        const popup = document.getElementById('pinPopup');
        popup.classList.remove('active');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
        state.activePin = null;
    }

    // Map Initialization
    function initializeMap() {
        const mapCanvas = document.getElementById('mapCanvas');
        if (!mapCanvas) return;
        
        // Add touch event handlers for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        
        mapCanvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        mapCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        });
    }

    // Utility Functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--pin-green)' : type === 'warning' ? 'var(--pin-yellow)' : 'var(--secondary-color)'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 3000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    function hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    function showUserDashboardButton() {
        // Add dashboard button to header
        const header = document.querySelector('.action-buttons');
        if (header && !document.getElementById('dashboardBtn')) {
            const dashboardBtn = document.createElement('button');
            dashboardBtn.id = 'dashboardBtn';
            dashboardBtn.className = 'cta-button dashboard-btn';
            dashboardBtn.innerHTML = '<span class="btn-icon">👤</span><span>Dashboard</span>';
            dashboardBtn.addEventListener('click', () => {
                window.location.href = '/dashboard.html';
            });
            header.appendChild(dashboardBtn);
        }
    }

    function checkMobileDevice() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
            
            // Enable iOS specific features
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                document.body.classList.add('ios-device');
            }
        }
    }

    // CSS Animation Keyframes (inject dynamically)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, -100%); opacity: 0; }
        }
        .placing-pin { cursor: crosshair !important; }
    `;
    document.head.appendChild(style);

    // iOS-specific features
    function initIOSFeatures() {
        // Prevent iOS Safari bounce
        document.addEventListener('touchmove', function(e) {
            if (e.target.closest('.scrollable')) {
                return; // Allow scrolling in scrollable elements
            }
            e.preventDefault();
        }, { passive: false });
        
        // Handle iOS orientation changes
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                // Recalculate viewport height
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }, 100);
        });
        
        // iOS Safari viewport height fix
        function setViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);
        
        // iOS device motion permission
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    console.log('Device motion permission granted');
                }
            });
        }
        
        // iOS device orientation permission
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(response => {
                if (response === 'granted') {
                    console.log('Device orientation permission granted');
                }
            });
        }
        
        // iOS touch optimizations
        document.addEventListener('touchstart', function() {}, { passive: true });
        document.addEventListener('touchend', function() {}, { passive: true });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();