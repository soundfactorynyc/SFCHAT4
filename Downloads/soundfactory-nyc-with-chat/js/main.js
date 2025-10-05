function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function openHelp() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.add('active');
        localStorage.setItem('sf_help_shown', 'true');
    }
}

function closeHelp() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.remove('active');
    }
}

function initApp() {
    console.log('🎵 Sound Factory NYC - Initializing...');
    
    if (window.initSupabase) {
        initSupabase();
    }
    
    if (window.initStripe) {
        initStripe();
    }
    

    
    if (window.RobustPinSystem) {
        try {
            RobustPinSystem.initialize();
            console.log('✅ Pin system initialized');
        } catch (error) {
            console.error('Pin system initialization error:', error);
        }
    }
    
    
    
    const hasSeenHelp = localStorage.getItem('sf_help_shown');
    if (!hasSeenHelp) {
        setTimeout(() => openHelp(), 2000);
    }
    
    console.log('✅ Sound Factory NYC initialized');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeHelp();
    }
});

const helpModal = document.getElementById('helpModal');
if (helpModal) {
    helpModal.addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
            closeHelp();
        }
    });
}

window.showToast = showToast;
window.openHelp = openHelp;
window.closeHelp = closeHelp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
