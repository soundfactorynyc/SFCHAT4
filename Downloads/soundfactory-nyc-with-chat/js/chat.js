let chatUser = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: 'Guest' + Math.floor(Math.random() * 1000),
    avatar: '👤'
};

let chatChannel = null;
let messageCache = new Set();

function initChatSystem() {
    const supabase = window.getSupabaseClient?.();
    
    if (!supabase) {
        console.log('⚠️ Chat: Supabase not configured - chat will work in local mode');
        updateOnlineCount();
        return;
    }
    
    subscribeToMessages(supabase);
    
    updateOnlineCount();
    setInterval(updateOnlineCount, 10000);
    
    console.log('✅ Chat system initialized');
}

function subscribeToMessages(supabase) {
    chatChannel = supabase
        .channel('room:general')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages',
                filter: 'room=eq.general'
            },
            (payload) => {
                if (payload.new.user_id !== chatUser.id) {
                    displayIncomingMessage(payload.new);
                }
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Chat: Subscribed to real-time messages');
            }
        });
}

async function sendChatBarMessage() {
    const input = document.getElementById('chatBarInput');
    const content = input?.value?.trim();

    if (!content) return;

    input.value = '';
    
    displayOwnMessage(content);
    
    await saveMessageToSupabase(content);
}

async function sendGroupMessage() {
    const input = document.getElementById('groupChatInput');
    const content = input?.value?.trim();

    if (!content) return;

    input.value = '';
    
    addMessageToGroupChat(chatUser.name, content, true);
    
    await saveMessageToSupabase(content);
}

async function saveMessageToSupabase(content) {
    const supabase = window.getSupabaseClient?.();
    
    if (!supabase) {
        if (window.showToast) {
            window.showToast('💬 Message sent (local mode)');
        }
        return;
    }

    try {
        const { error } = await supabase
            .from('chat_messages')
            .insert([{
                room: 'general',
                user_id: chatUser.id,
                user_name: chatUser.name,
                content: content
            }]);
            
        if (error) throw error;
        
        if (window.showToast) {
            window.showToast('💬 Message sent!');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        if (window.showToast) {
            window.showToast('❌ Failed to send message');
        }
    }
}

function displayOwnMessage(content) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(0, 255, 136, 0.9);
        color: #000;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        z-index: 300;
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = `You: ${content}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function displayIncomingMessage(message) {
    const msgId = `${message.user_id}-${message.created_at}`;
    if (messageCache.has(msgId)) return;
    messageCache.add(msgId);
    
    const groupChat = document.getElementById('groupChat');
    if (groupChat && groupChat.style.display !== 'none') {
        addMessageToGroupChat(message.user_name, message.content, false);
    }
    
    if (window.showToast) {
        window.showToast(`💬 ${message.user_name}: ${message.content.substring(0, 30)}${message.content.length > 30 ? '...' : ''}`);
    }
}

function addMessageToGroupChat(userName, content, isOwn) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        background: ${isOwn ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
        padding: 8px;
        border-radius: 10px;
        margin-bottom: 5px;
        font-size: 12px;
        border: 1px solid ${isOwn ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    `;
    messageDiv.innerHTML = `<strong>${userName}:</strong> ${content}`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendBottomMessage() {
    const input = document.getElementById('chatInputBottom');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    
    if (window.activeChatEffects && activeChatEffects.length > 0) {
        console.log('📤 Sending message with effects:', message, activeChatEffects);
        
        activeChatEffects.forEach(effectNum => {
            const animClass = window.chatEffectAnimations ? 
                (chatEffectAnimations[effectNum] || 'waveEffect') : 'waveEffect';
            applyVisualEffect(message, animClass);
        });
        
        if (window.showToast) {
            window.showToast(`💬 Message sent with ${activeChatEffects.length} effect(s)! ${activeChatEffects.map(n => '✨').join('')}`);
        }
    } else {
        console.log('📤 Sending plain message:', message);
        if (window.showToast) {
            window.showToast('💬 Message sent!');
        }
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

function closeGroupChat() {
    const groupChat = document.getElementById('groupChat');
    if (groupChat) {
        groupChat.style.display = 'none';
    }
}

function inviteToGroup() {
    if (window.showToast) {
        window.showToast('➕ Invite sent!');
    }
}

function updateOnlineCount() {
    const count = 100 + Math.floor(Math.random() * 50);
    const countEl = document.getElementById('chatOnlineCount');
    if (countEl) {
        countEl.textContent = count;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatSystem);
} else {
    setTimeout(initChatSystem, 1000);
}

window.sendChatBarMessage = sendChatBarMessage;
window.sendGroupMessage = sendGroupMessage;
window.sendBottomMessage = sendBottomMessage;
window.closeGroupChat = closeGroupChat;
window.inviteToGroup = inviteToGroup;
window.applyVisualEffect = applyVisualEffect;
