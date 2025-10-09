// ========================================
// DRAWER SYSTEM - Clean & Minimal
// ========================================

// Reactions list (endless scrolling)
const REACTIONS = [
    '❤️', '🔥', '😂', '🎉', '👠', '🏳️‍🌈', '✨', '⭐',
    '👑', '💎', '💋', '🌹', '🍾', '🍸', '🪩', '🎵',
    '🔊', '⚡', '💥', '🙌', '👏', '✌️', '👌', '💪',
    '👀', '😉', '😎', '🥵', '👽', '🤖', '🦄', '🚀',
    '💫', '🌟', '💅', '💄', '👗', '👞', '👜', '💍',
    '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹',
    '🥁', '🎺', '🎷', '💃', '🕺', '🌈', '☀️', '🌙',
    '💖', '💝', '💗', '💓', '💞', '💕', '💘', '💯'
];

// Initialize reactions drawer with endless scroll
function initReactions() {
    const container = document.getElementById('reactionsContent');
    
    // Add reactions multiple times for endless feel
    for (let i = 0; i < 3; i++) {
        REACTIONS.forEach(emoji => {
            const item = document.createElement('div');
            item.className = 'reaction-item';
            item.textContent = emoji;
            item.onclick = () => shootReaction(emoji);
            container.appendChild(item);
        });
    }
}

// Shoot reaction from character position
function shootReaction(emoji) {
    const char = document.getElementById('character');
    const reaction = document.createElement('div');
    reaction.textContent = emoji;
    reaction.style.cssText = `
        position: fixed;
        left: ${char.style.left || '50%'};
        top: ${char.style.top || '50%'};
        font-size: 24px;
        z-index: 1000;
        pointer-events: none;
        animation: float-up 2s ease-out forwards;
    `;
    document.body.appendChild(reaction);
    
    setTimeout(() => reaction.remove(), 2000);
}

// Drawer drag functionality
function initDrawers() {
    // Bottom drawer (reactions)
    setupDrawer('reactionsDrawer', 'reactionsHandle', 'vertical');
    
    // Right drawer (money)
    setupDrawer('moneyDrawer', 'moneyHandle', 'horizontal-right');
    
    // Left drawer (pins)
    setupDrawer('pinsDrawer', 'pinsHandle', 'horizontal-left');
}

function setupDrawer(drawerId, handleId, direction) {
    const drawer = document.getElementById(drawerId);
    const handle = document.getElementById(handleId);
    let startPos = 0;
    let currentPos = 0;
    let isDragging = false;
    
    // Touch events
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        startPos = direction === 'vertical' ? e.touches[0].clientY : e.touches[0].clientX;
        drawer.style.transition = 'none';
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        if (direction === 'vertical') {
            currentPos = e.touches[0].clientY;
            const diff = startPos - currentPos;
            if (diff > 20) {
                drawer.classList.add('open');
            } else if (diff < -20) {
                drawer.classList.remove('open');
            }
        } else if (direction === 'horizontal-right') {
            currentPos = e.touches[0].clientX;
            const diff = startPos - currentPos;
            if (diff > 20) {
                drawer.classList.add('open');
            } else if (diff < -20) {
                drawer.classList.remove('open');
            }
        } else if (direction === 'horizontal-left') {
            currentPos = e.touches[0].clientX;
            const diff = currentPos - startPos;
            if (diff > 20) {
                drawer.classList.add('open');
            } else if (diff < -20) {
                drawer.classList.remove('open');
            }
        }
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
        drawer.style.transition = '';
    });
    
    // Mouse events (for desktop testing)
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startPos = direction === 'vertical' ? e.clientY : e.clientX;
        drawer.style.transition = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        if (direction === 'vertical') {
            currentPos = e.clientY;
            const diff = startPos - currentPos;
            if (diff > 20) {
                drawer.classList.add('open');
            } else if (diff < -20) {
                drawer.classList.remove('open');
            }
        } else if (direction === 'horizontal-right') {
            currentPos = e.clientX;
            const diff = startPos - currentPos;
            if (diff > 20) {
                drawer.classList.add('open');
            } else if (diff < -20) {
                drawer.classList.remove('open');
            }
        } else if (direction === 'horizontal-left') {
            currentPos = e.clientX;
            const diff = currentPos - startPos;
            if (diff > 20) {
                drawer.classList.add('open');
            } else if (diff < -20) {
                drawer.classList.remove('open');
            }
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        drawer.style.transition = '';
    });
    
    // Click to toggle
    handle.addEventListener('click', () => {
        drawer.classList.toggle('open');
    });
}

// Character dragging
function initCharacter() {
    const char = document.getElementById('character');
    let isDragging = false;
    
    char.addEventListener('mousedown', () => isDragging = true);
    char.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('touchend', () => isDragging = false);
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            char.style.left = e.clientX + 'px';
            char.style.top = e.clientY + 'px';
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) {
            char.style.left = e.touches[0].clientX + 'px';
            char.style.top = e.touches[0].clientY + 'px';
            e.preventDefault();
        }
    });
}

// Drop pin functionality
let pinCount = 0;
function dropPin() {
    if (pinCount >= 50) return; // Limit pins
    
    const char = document.getElementById('character');
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = char.style.left || '50%';
    pin.style.top = char.style.top || '50%';
    pin.onclick = () => showPinPopup(pin);
    
    document.getElementById('blueprintArea').appendChild(pin);
    pinCount++;
    
    // Flash popup briefly
    const popup = document.getElementById('pinPopup');
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 2000);
}

function showPinPopup(pin) {
    const popup = document.getElementById('pinPopup');
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
}

// Money button handlers
document.addEventListener('DOMContentLoaded', () => {
    // Add money button handlers
    document.querySelectorAll('.money-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = btn.textContent;
            shootMoney(amount);
        });
    });
});

function shootMoney(amount) {
    const char = document.getElementById('character');
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const money = document.createElement('div');
            money.textContent = '💵';
            money.style.cssText = `
                position: fixed;
                left: ${char.style.left || '50%'};
                top: ${char.style.top || '50%'};
                font-size: 20px;
                z-index: 1000;
                pointer-events: none;
                animation: float-up 2s ease-out forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            document.body.appendChild(money);
            setTimeout(() => money.remove(), 2000);
        }, i * 100);
    }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-200px) scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize everything
initReactions();
initDrawers();
initCharacter();