
let isDragging = false;
let CONTROLLER_MODE = false;

const RC = { sb: null, channel: null, room: null, role: null, lastSend: 0 };

const otherUsers = new Map();
let myUserId = 'user_' + Math.random().toString(36).substr(2, 9);
let presenceChannel = null;

const myCharacter = document.getElementById('myCharacter');
const joystick = document.getElementById('joystick');
const knob = document.getElementById('knob');

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;
let velocityX = 0;
let velocityY = 0;
let characterMode = 'walking';
let joystickX = 0;
let joystickY = 0;

setTimeout(() => {
    const characterModeButtons = document.querySelectorAll('.mode-btn[data-mode="walking"], .mode-btn[data-mode="runway"], .mode-btn[data-mode="breakdance"]');
    characterModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            characterModeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (myCharacter) {
                myCharacter.classList.remove('walking', 'runway', 'breakdance');
                characterMode = btn.dataset.mode;
                
                if (velocityX !== 0 || velocityY !== 0) {
                    myCharacter.classList.add(characterMode);
                }
            }
        });
    });
}, 100);

function handleJoystickStart(e) {
    isDragging = true;
    handleJoystickMove(e);
    if (CONTROLLER_MODE && RC.channel) {
        sendRC(0, 0);
    }
}

function initRemoteControl() {
    try {
        const usp = new URLSearchParams(window.location.search);
        const SUPABASE_URL = window.ENV?.SUPABASE_URL || window.SUPABASE_URL;
        const SUPABASE_ANON = window.ENV?.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;
        const sbAvailable = Boolean(window.supabase && SUPABASE_URL && !SUPABASE_URL.includes('%%'));
        if (!sbAvailable) {
            const b = document.getElementById('btnPairController');
            if (b) b.style.display = 'none';
            console.log('⚠️ Supabase not configured - realtime features disabled');
            return;
        }

        RC.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, { realtime: { params: { eventsPerSecond: 20 } } });

        const isController = usp.get('controller') === '1';
        const room = usp.get('room');

        if (isController && room) {
            CONTROLLER_MODE = true;
            RC.role = 'controller';
            const header = document.querySelector('.header');
            if (header) header.style.display = 'none';
            joinRC(room);
        }

        initMultiUserPresence();
    } catch (e) { console.warn('Remote control init error', e); }
}

function initMultiUserPresence() {
    if (!RC.sb) return;
    
    const SF_PRESENCE_ENABLED = window.ENV?.SF_PRESENCE_ENABLED || 'false';
    if (SF_PRESENCE_ENABLED !== 'true') {
        console.log('Multi-user presence disabled');
        return;
    }
    
    console.log('🎭 Initializing multi-user presence...');
    
    presenceChannel = RC.sb.channel('club_main_floor', {
        config: { presence: { key: myUserId } }
    });
    
    presenceChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach(presence => {
            if (presence.user_id !== myUserId) {
                console.log('👋 User joined:', presence.user_id);
                createOtherUserCharacter(presence.user_id, presence.x || 300, presence.y || 200);
                if (window.showToast) window.showToast(`👋 ${presence.name || 'Someone'} joined!`);
            }
        });
    });
    
    presenceChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach(presence => {
            console.log('👋 User left:', presence.user_id);
            removeOtherUserCharacter(presence.user_id);
        });
    });
    
    presenceChannel.on('broadcast', { event: 'user_moved' }, ({ payload }) => {
        if (payload.user_id !== myUserId) {
            updateOtherUserPosition(payload.user_id, payload.x, payload.y, payload.flip);
        }
    });
    
    presenceChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            console.log('✅ Connected to multi-user room!');
            
            const charRect = myCharacter.getBoundingClientRect();
            
            await presenceChannel.track({
                user_id: myUserId,
                name: 'User ' + myUserId.slice(-4),
                x: charRect.left,
                y: charRect.top,
                online_at: new Date().toISOString()
            });
            
            if (window.showToast) window.showToast('🌐 Connected! You can now see other users');
        }
    });
    
    setInterval(() => {
        broadcastMyPosition();
    }, 100);
}

function createOtherUserCharacter(userId, x, y) {
    if (otherUsers.has(userId)) return;
    
    const char = document.createElement('div');
    char.className = 'person other-user';
    char.id = 'user_' + userId;
    char.style.position = 'fixed';
    char.style.left = x + 'px';
    char.style.top = y + 'px';
    char.style.transition = 'all 0.1s linear';
    char.style.opacity = '0.8';
    
    const shadow = document.createElement('div');
    shadow.className = 'shadow';
    char.appendChild(shadow);
    
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.bottom = '-20px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    label.style.fontSize = '10px';
    label.style.color = '#00ff88';
    label.style.textShadow = '0 0 5px #000';
    label.style.whiteSpace = 'nowrap';
    label.textContent = 'User ' + userId.slice(-4);
    char.appendChild(label);
    
    const blueprintView = document.querySelector('.blueprint-view');
    if (blueprintView) blueprintView.appendChild(char);
    otherUsers.set(userId, { element: char, x, y });
    
    console.log('✅ Created character for user:', userId);
}

function updateOtherUserPosition(userId, x, y, flip) {
    const user = otherUsers.get(userId);
    if (!user) {
        createOtherUserCharacter(userId, x, y);
        return;
    }
    
    user.element.style.left = x + 'px';
    user.element.style.top = y + 'px';
    
    if (flip !== undefined) {
        user.element.style.transform = flip ? 'scaleX(-1)' : 'scaleX(1)';
    }
    
    user.x = x;
    user.y = y;
}

function removeOtherUserCharacter(userId) {
    const user = otherUsers.get(userId);
    if (user && user.element) {
        user.element.remove();
        otherUsers.delete(userId);
    }
}

function broadcastMyPosition() {
    if (!presenceChannel) return;
    
    const charRect = myCharacter.getBoundingClientRect();
    const flip = myCharacter.style.transform && myCharacter.style.transform.includes('scaleX(-1)');
    
    presenceChannel.send({
        type: 'broadcast',
        event: 'user_moved',
        payload: {
            user_id: myUserId,
            x: charRect.left,
            y: charRect.top,
            flip: flip
        }
    });
}

function joinRC(room) {
    try {
        RC.room = room;
        RC.channel = RC.sb.channel(`rc_${room}`);

        RC.channel.on('broadcast', { event: 'move' }, ({ payload }) => {
            if (RC.role === 'host') {
                joystickX = payload.dx;
                joystickY = payload.dy;
                if (knob) {
                    const rect = joystick.getBoundingClientRect();
                    const maxDistance = rect.width / 2 - 20;
                    const ndx = Math.max(-1, Math.min(1, payload.dx));
                    const ndy = Math.max(-1, Math.min(1, payload.dy));
                    const px = ndx * maxDistance;
                    const py = ndy * maxDistance;
                    knob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
                }
                if (Math.abs(joystickX) > 0.1 || Math.abs(joystickY) > 0.1) {
                    if (!myCharacter.classList.contains(characterMode)) {
                        myCharacter.classList.add(characterMode);
                    }
                } else {
                    myCharacter.classList.remove('walking', 'runway', 'breakdance');
                }
            }
        });

        RC.channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log(`🔗 Joined RC room ${room} as ${RC.role || 'host'}`);
            }
        });
    } catch (e) { console.warn('joinRC error', e); }
}

function sendRC(dx, dy) {
    const now = Date.now();
    if (!RC.channel) return;
    if (now - RC.lastSend < 50) return;
    RC.lastSend = now;
    try {
        RC.channel.send({ type: 'broadcast', event: 'move', payload: { dx, dy, t: now } });
    } catch (e) { }
}

function openControllerPairing() {
    if (!window.supabase || !window.ENV?.SUPABASE_URL || window.ENV.SUPABASE_URL.includes('%%')) {
        if (window.showToast) window.showToast('⚠️ Realtime not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY in Netlify.');
        return;
    }
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    RC.role = 'host';
    joinRC(code);

    const origin = window.location.origin + window.location.pathname;
    const link = `${origin}?controller=1&room=${encodeURIComponent(code)}`;
    const modal = document.getElementById('pairModal');
    const codeEl = document.getElementById('pairCode');
    const wrap = document.getElementById('pairLinkWrap');
    const details = document.getElementById('pairDetails');
    const copyBtn = document.getElementById('copyPairLink');
    const openBtn = document.getElementById('openPairLink');

    if (details) details.textContent = 'Open this link on your phone to control the avatar:';
    if (codeEl) codeEl.textContent = code;
    if (wrap) wrap.textContent = link;
    if (copyBtn) copyBtn.onclick = () => { navigator.clipboard.writeText(link).then(() => { if (window.showToast) window.showToast('🔗 Link copied'); }); };
    if (openBtn) openBtn.onclick = () => { window.open(link, '_blank'); };
    if (modal) modal.style.display = 'flex';
}

function closePairModal(){ 
    const m = document.getElementById('pairModal'); 
    if (m) m.style.display = 'none'; 
}

initRemoteControl();

function handleJoystickMove(e) {
    if (!isDragging) return;
    
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2 - 20;
    
    if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
    }
    
    knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    
    joystickX = deltaX / maxDistance;
    joystickY = deltaY / maxDistance;
    if (CONTROLLER_MODE && RC.channel) {
        sendRC(joystickX, joystickY);
    }
    
    if (Math.abs(joystickX) > 0.1 || Math.abs(joystickY) > 0.1) {
        if (!myCharacter.classList.contains(characterMode)) {
            myCharacter.classList.add(characterMode);
        }
    } else {
        myCharacter.classList.remove('walking', 'runway', 'breakdance');
    }
}

function handleJoystickEnd() {
    isDragging = false;
    knob.style.transform = 'translate(-50%, -50%)';
    joystickX = 0;
    joystickY = 0;
    myCharacter.classList.remove('walking', 'runway', 'breakdance');
    if (CONTROLLER_MODE && RC.channel) {
        sendRC(0, 0);
    }
}

if (joystick && knob) {
    joystick.addEventListener('touchstart', handleJoystickStart);
    joystick.addEventListener('touchmove', handleJoystickMove);
    joystick.addEventListener('touchend', handleJoystickEnd);
    
    joystick.addEventListener('mousedown', handleJoystickStart);
    document.addEventListener('mousemove', handleJoystickMove);
    document.addEventListener('mouseup', handleJoystickEnd);
}

(function setupFingerMovement(){
    const stage = document.querySelector('.blueprint-view');
    if (!stage || !myCharacter) return;

    let fingerDragging = false;

    function isOverUI(target){
        return (
            target.closest('.bottom-layout') ||
            target.closest('.profile-hover') ||
            target.closest('.pin-popup') ||
            target.closest('.grid-overlay.active') ||
            target.closest('#groupChat') ||
            target.closest('.toast')
        );
    }

    function getPoint(e){
        let x, y;
        if (e.touches && e.touches[0]){
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        return { x, y };
    }

    function clampX(x){
        return Math.max(20, Math.min(window.innerWidth - 20, x));
    }
    function clampY(y){
        return Math.max(30, Math.min(window.innerHeight - 150, y));
    }

    function onFingerStart(e){
        if (window.currentMode === 'drop') return;
        if (isOverUI(e.target)) return;
        fingerDragging = true;
        const p = getPoint(e);
        posX = clampX(p.x);
        posY = clampY(p.y);
        myCharacter.style.left = posX + 'px';
        myCharacter.style.top = posY + 'px';
        if (!myCharacter.classList.contains(characterMode)) {
            myCharacter.classList.add(characterMode);
        }
        if (e.cancelable) e.preventDefault();
    }

    function onFingerMove(e){
        if (!fingerDragging) return;
        const p = getPoint(e);
        const newX = clampX(p.x);
        const newY = clampY(p.y);
        const dx = newX - posX;
        const dy = newY - posY;
        posX = newX;
        posY = newY;
        myCharacter.style.left = posX + 'px';
        myCharacter.style.top = posY + 'px';
        if ((Math.abs(dx) + Math.abs(dy)) > 0.1 && characterMode !== 'breakdance'){
            const angle = Math.atan2(dy, dx) * (180/Math.PI) + 90;
            myCharacter.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        }
        if (e.cancelable) e.preventDefault();
    }

    function onFingerEnd(){
        if (!fingerDragging) return;
        fingerDragging = false;
        myCharacter.classList.remove('walking', 'runway', 'breakdance');
    }

    stage.addEventListener('touchstart', onFingerStart, { passive: false });
    document.addEventListener('touchmove', onFingerMove, { passive: false });
    document.addEventListener('touchend', onFingerEnd);
    stage.addEventListener('mousedown', onFingerStart);
    document.addEventListener('mousemove', onFingerMove);
    document.addEventListener('mouseup', onFingerEnd);
})();

const keysPressed = {};
document.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    
    let newX = 0, newY = 0;
    if (keysPressed['w'] || keysPressed['arrowup']) newY = -1;
    if (keysPressed['s'] || keysPressed['arrowdown']) newY = 1;
    if (keysPressed['a'] || keysPressed['arrowleft']) newX = -1;
    if (keysPressed['d'] || keysPressed['arrowright']) newX = 1;
    
    joystickX = newX;
    joystickY = newY;
    
    if (newX !== 0 || newY !== 0) {
        if (!myCharacter.classList.contains(characterMode)) {
            myCharacter.classList.add(characterMode);
        }
    }
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key.toLowerCase()] = false;
    
    let newX = 0, newY = 0;
    if (keysPressed['w'] || keysPressed['arrowup']) newY = -1;
    if (keysPressed['s'] || keysPressed['arrowdown']) newY = 1;
    if (keysPressed['a'] || keysPressed['arrowleft']) newX = -1;
    if (keysPressed['d'] || keysPressed['arrowright']) newX = 1;
    
    joystickX = newX;
    joystickY = newY;
    
    if (newX === 0 && newY === 0) {
        myCharacter.classList.remove('walking', 'runway', 'breakdance');
    }
});

function gameLoop() {
    velocityX += joystickX * 0.5;
    velocityY += joystickY * 0.5;
    
    velocityX *= 0.9;
    velocityY *= 0.9;
    
    posX += velocityX;
    posY += velocityY;
    
    posX = Math.max(20, Math.min(window.innerWidth - 20, posX));
    posY = Math.max(30, Math.min(window.innerHeight - 150, posY));
    
    if (myCharacter) {
        myCharacter.style.left = posX + 'px';
        myCharacter.style.top = posY + 'px';
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();

window.openControllerPairing = openControllerPairing;
window.closePairModal = closePairModal;
