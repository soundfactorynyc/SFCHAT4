
let currentFloor = 'MF';

function changeFloor(floor) {
    const floors = document.querySelectorAll('.floor-svg');
    floors.forEach(f => f.style.display = 'none');
    
    const selectedFloor = document.getElementById('floor-' + floor.toLowerCase());
    if (selectedFloor) {
        selectedFloor.style.display = 'block';
    }
    
    document.querySelectorAll('.floor-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    currentFloor = floor;
    if (window.showToast) window.showToast(`Moving to floor ${floor}`);
}

function sendDrink() {
    const recipientName = document.getElementById('hoverName')?.textContent || 'guest';
    const link = window.HOVER_PURCHASE_LINKS?.DRINK_10 || '';
    if (!link || link.includes('test_DRINK_10_LINK')) {
        if (window.showToast) window.showToast('❗ Stripe $10 drink link not configured');
    } else {
        window.open(link, '_blank');
        if (window.showToast) window.showToast(`🍹 $10 drink for ${recipientName} — opening Stripe...`);
    }
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function inviteToTable() {
    if (window.showToast) window.showToast('🍾 Table invite sent!');
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function giftTicket() {
    const url = window.HOVER_PURCHASE_LINKS?.TICKET_PAGE || '';
    if (!url || url.includes('soundfactorynyc.com/tickets') === false) {
        if (window.buyTickets) {
            try { window.buyTickets(); } catch(_) {}
        }
    } else {
        window.open(url, '_blank');
    }
    if (window.showToast) window.showToast('🎟️ Opening ticket page...');
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function startChat() {
    if (window.showToast) window.showToast('💬 Chat started!');
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function startVideo() {
    if (window.showToast) window.showToast('📹 Video call starting...');
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function sendVibe(type) {
    const vibes = {
        fire: '🔥 Fire vibes sent!',
        heart: '❤️ Love sent!',
        dance: '💃 Dance request sent!',
        cheers: '🥂 Cheers sent!'
    };
    if (window.showToast) window.showToast(vibes[type]);
}

function challengeDance() {
    if (window.showToast) window.showToast('⚡ Dance battle challenge sent!');
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function soulSync() {
    if (window.showToast) window.showToast('🧬 Soul Sync initiated! Hold phones together...');
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function inviteToGroup() {
    if (window.showToast) window.showToast('➕ Invite sent!');
}

function closeGroupChat() {
    const chat = document.getElementById('groupChat');
    if (chat) chat.style.display = 'none';
}

function sendGroupMessage() {
    const input = document.getElementById('groupChatInput');
    if (!input || !input.value) return;
    
    const messages = document.getElementById('chatMessages');
    if (messages) {
        messages.innerHTML += `
            <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 10px; margin-bottom: 5px; font-size: 12px;">
                <strong>You:</strong> ${input.value}
            </div>
        `;
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
}

function showGroupChatOnCollision() {
    const chat = document.getElementById('groupChat');
    if (chat) chat.style.display = 'block';
}

function showProfileHoverNear(el, opts = {}) {
    const hover = document.getElementById('profileHover');
    if (!hover || !el) return;

    const nameEl = document.getElementById('hoverName');
    if (nameEl && opts.name) nameEl.textContent = opts.name;
    const avatarEl = document.getElementById('hoverAvatar');
    if (avatarEl && opts.avatar !== undefined) avatarEl.textContent = opts.avatar;

    hover.style.display = 'block';

    const rect = el.getBoundingClientRect();
    const hoverRect = hover.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.right + 12;
    let top = rect.top;
    
    if (left + hoverRect.width > vw - 10) left = rect.left - hoverRect.width - 12;
    left = Math.max(10, Math.min(vw - hoverRect.width - 10, left));
    
    if (top + hoverRect.height > vh - 10) top = rect.bottom - hoverRect.height;
    top = Math.max(10, Math.min(vh - hoverRect.height - 10, top));
    hover.style.left = left + 'px';
    hover.style.top = top + 'px';
}

function hideProfileHoverCard() {
    const hover = document.getElementById('profileHover');
    if (hover) hover.style.display = 'none';
}

function bindHoverToCharacter(character, name, avatar = '👤') {
    if (!character) return;

    const onEnter = () => {
        character.style.filter = 'drop-shadow(0 0 20px #ff0066)';
        showProfileHoverNear(character, { name, avatar });
    };
    const onLeave = () => {
        character.style.filter = 'none';
        setTimeout(() => {
            const hover = document.getElementById('profileHover');
            if (hover && !hover.matches(':hover')) hideProfileHoverCard();
        }, 150);
    };
    character.addEventListener('mouseenter', onEnter);
    character.addEventListener('mouseleave', onLeave);
    
    character.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const hover = document.getElementById('profileHover');
        if (hover && hover.style.display === 'block') {
            hideProfileHoverCard();
        } else {
            showProfileHoverNear(character, { name, avatar });
        }
    }, { passive: false });
}

setTimeout(() => {
    const meChar = document.getElementById('myCharacter');
    const otherChar = document.getElementById('otherCharacter');
    if (meChar) bindHoverToCharacter(meChar, 'You', '🟣');
    if (otherChar) bindHoverToCharacter(otherChar, 'DJ Alex', '🎧');
}, 300);

document.addEventListener('click', (e) => {
    if (
        !e.target.closest('.profile-hover') &&
        !e.target.closest('.person') &&
        !e.target.closest('.pin')
    ) {
        hideProfileHoverCard();
    }
});

(function initSimpleCollision(){
    const me = document.getElementById('myCharacter');
    const other = document.getElementById('otherCharacter');
    if (!me || !other) return;
    let shown = false;
    setInterval(()=>{
        const mx = me.getBoundingClientRect();
        const ox = other.getBoundingClientRect();
        const dx = (mx.left+mx.width/2)-(ox.left+ox.width/2);
        const dy = (mx.top+mx.height/2)-(ox.top+ox.height/2);
        const dist = Math.hypot(dx,dy);
        if (dist < 60 && !shown){
            shown = true;
            showGroupChatOnCollision();
            setTimeout(()=>{ shown = false; }, 5000);
        }
    }, 300);
})();

window.changeFloor = changeFloor;
window.sendDrink = sendDrink;
window.inviteToTable = inviteToTable;
window.giftTicket = giftTicket;
window.startChat = startChat;
window.startVideo = startVideo;
window.sendVibe = sendVibe;
window.challengeDance = challengeDance;
window.soulSync = soulSync;
window.inviteToGroup = inviteToGroup;
window.closeGroupChat = closeGroupChat;
window.sendGroupMessage = sendGroupMessage;
window.showProfileHoverNear = showProfileHoverNear;
window.hideProfileHoverCard = hideProfileHoverCard;
