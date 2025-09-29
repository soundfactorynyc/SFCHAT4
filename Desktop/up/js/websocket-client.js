// Sound Factory WebSocket Client for Real-time Pin Updates
class SoundFactoryWebSocket {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.pingInterval = null;
        this.serverUrl = 'ws://localhost:8080'; // Change to your WebSocket server URL
        
        this.onPinCreate = null;
        this.onPinUpdate = null;
        this.onPinDelete = null;
        this.onConnect = null;
        this.onDisconnect = null;
        this.onError = null;
    }

    // Connect to WebSocket server
    connect() {
        try {
            console.log('🔌 Connecting to WebSocket server...');
            this.ws = new WebSocket(this.serverUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                
                // Authenticate with user ID
                this.authenticate();
                
                // Start ping interval
                this.startPing();
                
                if (this.onConnect) this.onConnect();
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };
            
            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.connected = false;
                this.stopPing();
                
                if (this.onDisconnect) this.onDisconnect();
                
                // Attempt to reconnect
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                if (this.onError) this.onError(error);
            };
            
        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    // Authenticate with server
    authenticate() {
        const userId = this.getUserId();
        if (userId) {
            this.send({
                type: 'auth',
                userId: userId
            });
        }
    }

    // Get current user ID
    getUserId() {
        // Try to get from various sources
        if (window.currentUser?.id) return window.currentUser.id;
        if (window.smsGate?.phoneNumber) return window.smsGate.phoneNumber;
        if (localStorage.getItem('sf_user_id')) return localStorage.getItem('sf_user_id');
        
        // Generate a temporary ID
        const tempId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sf_user_id', tempId);
        return tempId;
    }

    // Handle incoming messages
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'pin_create':
                    if (this.onPinCreate) this.onPinCreate(message.pin);
                    break;
                    
                case 'pin_update':
                    if (this.onPinUpdate) this.onPinUpdate(message.pin);
                    break;
                    
                case 'pin_delete':
                    if (this.onPinDelete) this.onPinDelete(message.pinId);
                    break;
                    
                case 'pins_sync':
                    this.handlePinsSync(message.pins);
                    break;
                    
                case 'success':
                    console.log('✅ Server:', message.message);
                    break;
                    
                case 'error':
                    console.error('❌ Server error:', message.message);
                    break;
                    
                case 'pong':
                    // Server responded to ping
                    break;
                    
                default:
                    console.log('❓ Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    }

    // Handle initial pins sync
    handlePinsSync(pins) {
        console.log(`📍 Syncing ${pins.length} existing pins`);
        
        // Clear existing pins from floor
        this.clearExistingPins();
        
        // Add all pins to floor
        pins.forEach(pin => {
            if (this.onPinCreate) this.onPinCreate(pin);
        });
    }

    // Clear existing pins from floor
    clearExistingPins() {
        // Remove all pins that aren't owned by current user
        const currentUserId = this.getUserId();
        document.querySelectorAll('.pin').forEach(pinEl => {
            if (pinEl.dataset.userId !== currentUserId) {
                pinEl.remove();
            }
        });
    }

    // Send message to server
    send(message) {
        if (this.ws && this.connected) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ WebSocket not connected, cannot send message');
        }
    }

    // Create a new pin
    createPin(pinData) {
        this.send({
            type: 'pin_create',
            pin: pinData
        });
    }

    // Update an existing pin
    updatePin(pinData) {
        this.send({
            type: 'pin_update',
            pin: pinData
        });
    }

    // Delete a pin
    deletePin(pinId) {
        this.send({
            type: 'pin_delete',
            pinId: pinId
        });
    }

    // Start ping interval
    startPing() {
        this.pingInterval = setInterval(() => {
            if (this.connected) {
                this.send({ type: 'ping' });
            }
        }, 30000); // Ping every 30 seconds
    }

    // Stop ping interval
    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    // Attempt to reconnect
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    // Disconnect from server
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.stopPing();
    }

    // Check if connected
    isConnected() {
        return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    // Set event handlers
    setOnPinCreate(callback) {
        this.onPinCreate = callback;
    }

    setOnPinUpdate(callback) {
        this.onPinUpdate = callback;
    }

    setOnPinDelete(callback) {
        this.onPinDelete = callback;
    }

    setOnConnect(callback) {
        this.onConnect = callback;
    }

    setOnDisconnect(callback) {
        this.onDisconnect = callback;
    }

    setOnError(callback) {
        this.onError = callback;
    }
}

// Create global instance
window.soundFactoryWS = new SoundFactoryWebSocket();

// Auto-connect when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other systems to initialize
    setTimeout(() => {
        window.soundFactoryWS.connect();
    }, 1000);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundFactoryWebSocket;
}


