// Sound Factory WebSocket Server for Real-time Pin Updates
// Run with: node websocket-server.js

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected clients and their pins
const clients = new Map();
const pins = new Map();

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    const clientId = generateClientId();
    const clientInfo = {
        id: clientId,
        ws: ws,
        userId: null,
        lastPing: Date.now()
    };
    
    clients.set(clientId, clientInfo);
    console.log(`🔌 Client connected: ${clientId} (Total: ${clients.size})`);
    
    // Send existing pins to new client
    sendExistingPins(ws);
    
    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(clientId, message);
        } catch (error) {
            console.error('❌ Error parsing message:', error);
            sendError(ws, 'Invalid message format');
        }
    });
    
    // Handle client disconnect
    ws.on('close', () => {
        console.log(`🔌 Client disconnected: ${clientId}`);
        clients.delete(clientId);
        
        // Remove client's pins
        for (const [pinId, pin] of pins) {
            if (pin.userId === clientInfo.userId) {
                pins.delete(pinId);
                broadcastPinRemoval(pinId);
            }
        }
    });
    
    // Handle ping/pong for connection health
    ws.on('pong', () => {
        clientInfo.lastPing = Date.now();
    });
    
    // Send ping every 30 seconds
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        } else {
            clearInterval(pingInterval);
        }
    }, 30000);
});

// Message handling
function handleMessage(clientId, message) {
    const client = clients.get(clientId);
    if (!client) return;
    
    switch (message.type) {
        case 'auth':
            client.userId = message.userId;
            console.log(`👤 User authenticated: ${message.userId}`);
            sendSuccess(client.ws, 'Authentication successful');
            break;
            
        case 'pin_create':
            createPin(message.pin, clientId);
            break;
            
        case 'pin_update':
            updatePin(message.pin, clientId);
            break;
            
        case 'pin_delete':
            deletePin(message.pinId, clientId);
            break;
            
        case 'ping':
            sendPong(client.ws);
            break;
            
        default:
            console.log(`❓ Unknown message type: ${message.type}`);
    }
}

// Pin operations
function createPin(pinData, clientId) {
    const client = clients.get(clientId);
    if (!client || !client.userId) {
        sendError(client.ws, 'Not authenticated');
        return;
    }
    
    const pin = {
        id: generatePinId(),
        userId: client.userId,
        x: pinData.x,
        y: pinData.y,
        message: pinData.message || '',
        color: pinData.color || '#ff6b00',
        type: pinData.type || 'default',
        timestamp: Date.now()
    };
    
    pins.set(pin.id, pin);
    console.log(`📍 Pin created: ${pin.id} by ${pin.userId}`);
    
    // Broadcast to all clients
    broadcastPinCreate(pin);
    
    // Send confirmation to creator
    sendSuccess(client.ws, 'Pin created successfully', { pinId: pin.id });
}

function updatePin(pinData, clientId) {
    const client = clients.get(clientId);
    if (!client || !client.userId) return;
    
    const pin = pins.get(pinData.id);
    if (!pin || pin.userId !== client.userId) {
        sendError(client.ws, 'Pin not found or not owned by you');
        return;
    }
    
    // Update pin data
    Object.assign(pin, pinData);
    pin.timestamp = Date.now();
    
    console.log(`📍 Pin updated: ${pin.id}`);
    
    // Broadcast update to all clients
    broadcastPinUpdate(pin);
}

function deletePin(pinId, clientId) {
    const client = clients.get(clientId);
    if (!client || !client.userId) return;
    
    const pin = pins.get(pinId);
    if (!pin || pin.userId !== client.userId) {
        sendError(client.ws, 'Pin not found or not owned by you');
        return;
    }
    
    pins.delete(pinId);
    console.log(`📍 Pin deleted: ${pinId}`);
    
    // Broadcast deletion to all clients
    broadcastPinRemoval(pinId);
}

// Broadcasting functions
function broadcastPinCreate(pin) {
    const message = {
        type: 'pin_create',
        pin: pin
    };
    
    broadcast(message);
}

function broadcastPinUpdate(pin) {
    const message = {
        type: 'pin_update',
        pin: pin
    };
    
    broadcast(message);
}

function broadcastPinRemoval(pinId) {
    const message = {
        type: 'pin_delete',
        pinId: pinId
    };
    
    broadcast(message);
}

function broadcast(message) {
    const data = JSON.stringify(message);
    
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(data);
        }
    });
}

function sendExistingPins(ws) {
    const allPins = Array.from(pins.values());
    
    const message = {
        type: 'pins_sync',
        pins: allPins
    };
    
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

// Utility functions
function generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
}

function generatePinId() {
    return 'pin_' + Math.random().toString(36).substr(2, 9);
}

function sendError(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'error',
            message: message
        }));
    }
}

function sendSuccess(ws, message, data = null) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'success',
            message: message,
            data: data
        }));
    }
}

function sendPong(ws) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
        }));
    }
}

// Clean up inactive connections
setInterval(() => {
    const now = Date.now();
    clients.forEach((client, clientId) => {
        if (now - client.lastPing > 60000) { // 60 seconds timeout
            console.log(`🧹 Cleaning up inactive client: ${clientId}`);
            client.ws.terminate();
            clients.delete(clientId);
        }
    });
}, 30000);

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Sound Factory WebSocket Server running on port ${PORT}`);
    console.log(`📡 Ready for real-time pin updates!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WebSocket server...');
    wss.close(() => {
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
});


