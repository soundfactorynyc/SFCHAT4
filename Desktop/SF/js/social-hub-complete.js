// Sound Factory - Social Media Super Hub
// Complete integration system for all platforms

const SOCIAL_PLATFORMS = [
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        color: '#000',
        gradient: 'linear-gradient(135deg, #000, #fe2c55)',
        oauth: 'https://www.tiktok.com/auth/authorize/',
        api: 'https://open-api.tiktok.com/'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: '📷',
        color: '#E4405F',
        gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
        oauth: 'https://api.instagram.com/oauth/authorize',
        api: 'https://graph.instagram.com/'
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: '👥',
        color: '#1877F2',
        gradient: 'linear-gradient(135deg, #0866ff, #1877f2)',
        oauth: 'https://www.facebook.com/v18.0/dialog/oauth',
        api: 'https://graph.facebook.com/'
    },
    {
        id: 'twitter',
        name: 'X/Twitter',
        icon: '🐦',
        color: '#1DA1F2',
        gradient: 'linear-gradient(135deg, #000, #1DA1F2)',
        oauth: 'https://twitter.com/i/oauth2/authorize',
        api: 'https://api.twitter.com/2/'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: '▶️',
        color: '#FF0000',
        gradient: 'linear-gradient(135deg, #FF0000, #cc0000)',
        oauth: 'https://accounts.google.com/o/oauth2/auth',
        api: 'https://www.googleapis.com/youtube/v3/'
    },
    {
        id: 'spotify',
        name: 'Spotify',
        icon: '🎧',
        color: '#1DB954',
        gradient: 'linear-gradient(135deg, #1DB954, #1ed760)',
        oauth: 'https://accounts.spotify.com/authorize',
        api: 'https://api.spotify.com/v1/'
    },
    {
        id: 'apple',
        name: 'Apple',
        icon: '',
        color: '#000',
        gradient: 'linear-gradient(135deg, #000, #333)',
        oauth: 'https://appleid.apple.com/auth/authorize',
        api: 'https://appleid.apple.com/'
    },
    {
        id: 'google',
        name: 'Google',
        icon: '🔍',
        color: '#4285F4',
        gradient: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
        oauth: 'https://accounts.google.com/o/oauth2/auth',
        api: 'https://www.googleapis.com/oauth2/v3/'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        color: '#0A66C2',
        gradient: 'linear-gradient(135deg, #0A66C2, #0077b5)',
        oauth: 'https://www.linkedin.com/oauth/v2/authorization',
        api: 'https://api.linkedin.com/v2/'
    }
];

// Initialize Top Grid with Social Media
function initTopGrid() {
    const container = document.getElementById('grid-top-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="grid-header">
            <h2>🚀 SOCIAL MEDIA HUB</h2>
            <p>Connect all your platforms</p>
        </div>
        <div class="social-grid">
            ${SOCIAL_PLATFORMS.map(platform => `
                <div class="social-card" data-platform="${platform.id}">
                    <div class="social-icon" style="background: ${platform.gradient}">
                        ${platform.icon}
                    </div>
                    <div class="social-name">${platform.name}</div>
                    <div class="social-status" id="status-${platform.id}">
                        Not Connected
                    </div>
                    <button class="social-connect-btn" onclick="connectPlatform('${platform.id}')">
                        Connect
                    </button>
                </div>
            `).join('')}
        </div>
        
        <div class="social-features">
            <button class="feature-btn" onclick="openCrossPost()">
                <span>🚀</span> Cross-Post to All
            </button>
            <button class="feature-btn" onclick="viewAnalytics()">
                <span>📊</span> Analytics
            </button>
            <button class="feature-btn" onclick="showScheduler()">
                <span>📅</span> Scheduler
            </button>
        </div>
    `;
}

// Connect to a platform
function connectPlatform(platformId) {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;
    
    // Simulate OAuth flow
    console.log(`Connecting to ${platform.name}...`);
    
    // In real app, open OAuth popup:
    const authUrl = `${platform.oauth}?client_id=YOUR_CLIENT_ID&redirect_uri=${window.location.origin}/callback&response_type=code&scope=user`;
    
    // For demo, simulate connection after 2 seconds
    setTimeout(() => {
        const statusEl = document.getElementById(`status-${platformId}`);
        if (statusEl) {
            statusEl.textContent = '✅ Connected';
            statusEl.style.color = '#00ff88';
        }
        
        // Save to localStorage
        localStorage.setItem(`social_${platformId}`, 'connected');
        
        showToast(`✅ Connected to ${platform.name}!`);
    }, 2000);
}

// Cross-Post Modal
function openCrossPost() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content cross-post-modal">
            <div class="modal-header">
                <h3>🚀 Cross-Post to All Platforms</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            
            <div class="platform-selector">
                ${SOCIAL_PLATFORMS.map(p => `
                    <label class="platform-checkbox">
                        <input type="checkbox" value="${p.id}" checked>
                        <span>${p.icon} ${p.name}</span>
                    </label>
                `).join('')}
            </div>
            
            <textarea class="post-input" placeholder="Write your post..." rows="6"></textarea>
            
            <div class="post-actions">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                    Cancel
                </button>
                <button class="btn-primary" onclick="submitCrossPost()">
                    Post to All Platforms 🚀
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Submit Cross Post
function submitCrossPost() {
    const content = document.querySelector('.post-input').value;
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-checkbox input:checked'))
        .map(cb => cb.value);
    
    if (!content.trim()) {
        showToast('⚠️ Please write something!');
        return;
    }
    
    // Simulate posting to all platforms
    showToast('🚀 Posting to ' + selectedPlatforms.length + ' platforms...');
    
    setTimeout(() => {
        document.querySelector('.modal-overlay').remove();
        showToast(`🎉 Posted to ${selectedPlatforms.length} platforms successfully!`);
    }, 2000);
}

// Toast notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export functions
window.initTopGrid = initTopGrid;
window.connectPlatform = connectPlatform;
window.openCrossPost = openCrossPost;
window.submitCrossPost = submitCrossPost;
