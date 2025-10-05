
const BACKEND_API = 'https://sound-factory-backend-rvkrljar.fly.dev';
let ws = null;
let wsReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function initWebSocket() {
    const wsUrl = BACKEND_API.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws';
    
    try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('✅ WebSocket connected');
            wsReconnectAttempts = 0;
            
            if (typeof myUserId !== 'undefined' && typeof posX !== 'undefined' && typeof posY !== 'undefined') {
                sendWSMessage({
                    type: 'presence',
                    user_id: myUserId,
                    x: posX,
                    y: posY,
                    floor: 'MF'
                });
            }
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWSMessage(data);
            } catch (error) {
                console.error('WebSocket message parse error:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected');
            
            if (wsReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                wsReconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 30000);
                console.log(`Reconnecting in ${delay}ms...`);
                setTimeout(initWebSocket, delay);
            }
        };
    } catch (error) {
        console.error('WebSocket initialization error:', error);
    }
}

function sendWSMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

function handleWSMessage(data) {
    switch (data.type) {
        case 'user_moved':
            if (typeof updateOtherUserPosition === 'function') {
                updateOtherUserPosition(data.user_id, data.x, data.y);
            }
            break;
            
        case 'pin_created':
            if (typeof renderRemotePin === 'function') {
                renderRemotePin(data.pin);
            }
            if (window.showToast) window.showToast('📍 New pin dropped nearby!');
            break;
            
        case 'new_message':
            if (typeof addChatMessage === 'function') {
                addChatMessage(data.message.from_user_id, data.message.content);
            }
            break;
            
        case 'purchase_received':
            if (window.showToast) {
                window.showToast(`💰 You received $${data.purchase.amount} ${data.purchase.item_type}!`);
            }
            break;
            
        default:
            console.log('Unknown WebSocket message type:', data.type);
    }
}

function renderRemotePin(pinData) {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = pinData.x + 'px';
    pin.style.top = pinData.y + 'px';
    pin.style.background = getPinColor(pinData.pin_type);
    pin.style.color = getPinColor(pinData.pin_type);
    pin.dataset.caption = pinData.caption;
    pin.dataset.type = pinData.pin_type;
    
    if (pinData.photo_url) {
        pin.dataset.image = pinData.photo_url;
        pin.style.width = '12px';
        pin.style.height = '12px';
        pin.innerHTML = '<span style="position: absolute; top: -18px; left: -5px; font-size: 10px;">📷</span>';
    }
    
    if (typeof attachPinHandlers === 'function') {
        attachPinHandlers(pin);
    }
    
    const overlay = document.getElementById('pinOverlay');
    if (overlay) overlay.appendChild(pin);
}

function getPinColor(pinType) {
    const colors = {
        memory: '#0066ff',
        song: '#ffcc00',
        moment: '#ff0066',
        dream: '#00ff88',
        promo: '#9933ff'
    };
    return colors[pinType] || '#ffffff';
}

setTimeout(() => initWebSocket(), 2000);

setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN && typeof myUserId !== 'undefined' && typeof posX !== 'undefined' && typeof posY !== 'undefined') {
        sendWSMessage({
            type: 'position_update',
            user_id: myUserId,
            x: posX,
            y: posY,
            floor: 'MF'
        });
    }
}, 200);

window.sendWSMessage = sendWSMessage;
