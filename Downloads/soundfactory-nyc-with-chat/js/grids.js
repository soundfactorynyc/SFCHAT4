
let activeChatEffects = [];
const reactionBoxes = [];
const chatEffectAnimations = {
    1: 'waveEffect', 2: 'spiralEffect', 3: 'explodeEffect', 4: 'fireworkEffect',
    5: 'waveEffect', 6: 'spiralEffect', 7: 'explodeEffect', 8: 'fireworkEffect'
};

function toggleGrid(position) {
    const grid = document.getElementById(`grid-${position}`);
    if (!grid) return;

    const wasActive = grid.classList.contains('active');

    ['top', 'middle', 'bottom'].forEach(pos => {
        const el = document.getElementById(`grid-${pos}`);
        if (el) el.classList.remove('active');
    });

    if (!wasActive) {
        grid.classList.add('active');
    }
}

function closeGrid(position) {
    const grid = document.getElementById(`grid-${position}`);
    if (grid) grid.classList.remove('active');
}

function handleChatEffect(number, button, effectName) {
    const index = activeChatEffects.indexOf(number);
    
    if (index > -1) {
        activeChatEffects.splice(index, 1);
        button.classList.remove('effect-active');
        if (window.showToast) window.showToast(`❌ ${effectName} deactivated`);
    } else {
        activeChatEffects.push(number);
        button.classList.add('effect-active');
        if (window.showToast) window.showToast(`✅ ${effectName} activated! (${activeChatEffects.length} effects active)`);
    }
    
    console.log('Active chat effects:', activeChatEffects);
}

function spawnReactionBox(label){
    const layer = document.getElementById('reactionLayer');
    if (!layer) return;
    const box = document.createElement('div');
    box.className = 'reaction-box';
    box.textContent = label;
    box.style.cssText = `
        position: absolute;
        left: ${20 + Math.random()*80}px;
        top: ${window.innerHeight - 200 + Math.random()*40}px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 12px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        pointer-events: auto;
        user-select: none;
    `;

    layer.appendChild(box);
    reactionBoxes.push(box);
    makeBoxDraggable(box);
    
    box.animate([
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1.05)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
    ], { duration: 300, easing: 'ease-out' });
}

function makeBoxDraggable(el){
    let dragging = false, offX = 0, offY = 0;
    const onDown = (e)=>{
        dragging = true;
        const r = el.getBoundingClientRect();
        const {x,y} = getPointer(e);
        offX = x - r.left; offY = y - r.top;
        if (e.cancelable) e.preventDefault();
    };
    const onMove = (e)=>{
        if (!dragging) return;
        const {x,y} = getPointer(e);
        const nx = clamp(0, window.innerWidth - el.offsetWidth, x - offX);
        const ny = clamp(60, window.innerHeight - el.offsetHeight - 80, y - offY);
        el.style.left = nx + 'px';
        el.style.top = ny + 'px';
        if (e.cancelable) e.preventDefault();
    };
    const onUp = ()=>{
        if (!dragging) return;
        dragging = false;
        for (const other of reactionBoxes){
            if (other === el) continue;
            if (boxesCollide(el, other)){
                mergeBoxes(el, other);
                break;
            }
        }
    };
    el.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive:false });
    document.addEventListener('touchmove', onMove, { passive:false });
    document.addEventListener('touchend', onUp);
}

function getPointer(e){
    return e.touches && e.touches[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
}

function clamp(min, max, val){ 
    return Math.max(min, Math.min(max, val)); 
}

function boxesCollide(a,b){
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return !(ra.right < rb.left || ra.left > rb.right || ra.bottom < rb.top || ra.top > rb.bottom);
}

function mergeBoxes(a,b){
    a.animate([
        { transform:'scale(1)' },
        { transform:'scale(1.1)' },
        { transform:'scale(1)' }
    ], { duration: 250 });
    
    a.textContent = `${a.textContent} + ${b.textContent}`;
    
    const idx = reactionBoxes.indexOf(b);
    if (idx>-1) reactionBoxes.splice(idx,1);
    b.remove();
}

function initializeGrids() {
    const topGrid = document.getElementById('grid-top-container');
    if (topGrid) {
        for (let i = 1; i <= 64; i++) {
            const btn = document.createElement('button');
            btn.className = 'grid-button';
            btn.textContent = i;
            btn.onclick = () => {
                spawnReactionBox(`#${i}`);
                if (window.showToast) window.showToast(`Spawned box #${i}`);
            };
            topGrid.appendChild(btn);
        }
    }
    
    const middleGrid = document.getElementById('grid-middle-container');
    if (middleGrid) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        for (let i = 0; i < 64; i++) {
            const btn = document.createElement('button');
            btn.className = 'grid-button';
            btn.textContent = letters[i % letters.length];
            btn.onclick = () => {
                spawnReactionBox(letters[i % letters.length]);
                if (window.showToast) window.showToast(`Spawned ${letters[i % letters.length]}`);
            };
            middleGrid.appendChild(btn);
        }
    }
    
    const bottomGrid = document.getElementById('grid-bottom-container');
    if (bottomGrid) {
        const chatEffects = [
            '💬 Basic', '✨ Sparkle', '🌊 Wave', '🔥 Fire',
            '💫 Cosmic', '🎨 Paint', '⚡ Electric', '🌈 Rainbow',
            '💎 Diamond', '🎭 Drama', '🎪 Circus', '🎯 Target',
            '🎸 Rock', '🎹 Keys', '🎺 Jazz', '🎻 Classic',
            '🕺 Dance', '🌟 VIP', '🔒 Secret', '♾️ Infinite'
        ];
        
        chatEffects.forEach((effect, i) => {
            const btn = document.createElement('button');
            btn.className = 'grid-button';
            btn.innerHTML = effect;
            btn.onclick = () => handleChatEffect(i + 1, btn, effect);
            bottomGrid.appendChild(btn);
        });
    }
}

function sendBottomMessage() {
    const input = document.getElementById('chatInputBottom');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    
    if (activeChatEffects.length > 0) {
        console.log('📤 Sending message with effects:', message, activeChatEffects);
        
        activeChatEffects.forEach(effectNum => {
            const animClass = chatEffectAnimations[effectNum] || 'waveEffect';
            applyVisualEffect(message, animClass);
        });
        
        if (window.showToast) window.showToast(`💬 Message sent with ${activeChatEffects.length} effect(s)! ${activeChatEffects.map(n => '✨').join('')}`);
    } else {
        console.log('📤 Sending plain message:', message);
        if (window.showToast) window.showToast('💬 Message sent!');
    }
    
    input.value = '';
}

function applyVisualEffect(message, animClass) {
    const chatBox = document.createElement('div');
    chatBox.textContent = message;
    chatBox.style.cssText = `
        position: fixed;
        left: 50%;
        bottom: 270px;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff0066, #ff3399);
        color: white;
        padding: 15px 30px;
        border-radius: 25px;
        font-weight: 700;
        font-size: 18px;
        box-shadow: 0 10px 40px rgba(255, 0, 102, 0.5);
        z-index: 10000;
        pointer-events: none;
        animation: ${animClass} 2s ease-out forwards;
    `;
    document.body.appendChild(chatBox);
    
    setTimeout(() => chatBox.remove(), 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    const walkButtons = document.querySelectorAll('.walk-btn');
    if (walkButtons.length > 0) {
        walkButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const mode = this.dataset.mode;
                walkButtons.forEach(b => {
                    b.style.background = 'rgba(255,255,255,0.1)';
                });
                this.style.background = 'linear-gradient(135deg, #ff0066, #ff3399)';
                if (window.showToast) window.showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} mode activated!`);
            });
        });
        
        const walkingBtn = document.querySelector('.walk-btn[data-mode="walking"]');
        if (walkingBtn) {
            walkingBtn.style.background = 'linear-gradient(135deg, #ff0066, #ff3399)';
        }
    }
});

window.addEventListener('DOMContentLoaded', initializeGrids);

window.toggleGrid = toggleGrid;
window.closeGrid = closeGrid;
window.sendBottomMessage = sendBottomMessage;
window.activeChatEffects = activeChatEffects;
