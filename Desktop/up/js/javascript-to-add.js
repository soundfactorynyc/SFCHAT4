<!-- ADD THIS BEFORE THE CLOSING </body> TAG -->

<script>
// Social Floor Character System
(function() {
    'use strict';
    
    // Character movement system
    const characters = document.querySelectorAll('.character:not(#myCharacter)');
    const myCharacter = document.getElementById('myCharacter');
    const groupChat = document.getElementById('groupChat');
    
    // Random movement for other characters
    function moveCharacter(char) {
        const x = Math.random() * 80 + 10; // 10% to 90%
        const y = Math.random() * 70 + 15; // 15% to 85%
        
        char.style.left = x + '%';
        char.style.top = y + '%';
        char.classList.add('walking');
        
        setTimeout(() => {
            char.classList.remove('walking');
        }, 500);
    }
    
    // Move characters randomly
    characters.forEach(char => {
        setInterval(() => {
            if (Math.random() > 0.7) {
                moveCharacter(char);
            }
        }, 3000 + Math.random() * 5000);
    });
    
    // My character movement on click
    document.addEventListener('click', function(e) {
        // Skip if clicking on UI elements
        if (e.target.closest('.nav-panel') || 
            e.target.closest('.floor-btn') || 
            e.target.closest('.top-nav-links') ||
            e.target.closest('.group-chat')) return;
        
        const rect = document.body.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        myCharacter.style.left = x + '%';
        myCharacter.style.top = y + '%';
        myCharacter.classList.add('walking');
        
        setTimeout(() => {
            myCharacter.classList.remove('walking');
        }, 500);
    });
    
    // Chat system
    const chatMessages = [
        { user: 'DJ Mike', color: '#ff1a78', text: 'This beat is fire! 🔥' },
        { user: 'Sarah', color: '#00ccff', text: 'Love this track!' },
        { user: 'Alex', color: '#ffcc00', text: 'Dance floor is packed tonight' },
        { user: 'Emma', color: '#9933ff', text: 'Best night ever!' },
        { user: 'James', color: '#ff6600', text: 'The visuals are insane' },
        { user: 'Lisa', color: '#00ff00', text: 'Sound Factory forever! 💫' }
    ];
    
    let messageIndex = 0;
    
    function showChatMessage() {
        if (!groupChat.style.display || groupChat.style.display === 'none') {
            groupChat.style.display = 'flex';
        }
        
        const message = chatMessages[messageIndex % chatMessages.length];
        const chatDiv = document.createElement('div');
        chatDiv.className = 'chat-message';
        chatDiv.innerHTML = `
            <div class="chat-avatar" style="background: ${message.color}"></div>
            <div class="chat-content">
                <div class="chat-username" style="color: ${message.color}">${message.user}</div>
                <div class="chat-text">${message.text}</div>
            </div>
        `;
        
        groupChat.appendChild(chatDiv);
        
        // Keep only last 5 messages
        if (groupChat.children.length > 5) {
            groupChat.removeChild(groupChat.firstChild);
        }
        
        messageIndex++;
        
        // Scroll to bottom
        groupChat.scrollTop = groupChat.scrollHeight;
    }
    
    // Show chat messages periodically
    setInterval(showChatMessage, 4000 + Math.random() * 3000);
    
    // Proximity detection
    function checkProximity() {
        const myPos = {
            x: parseFloat(myCharacter.style.left),
            y: parseFloat(myCharacter.style.top)
        };
        
        characters.forEach(char => {
            const charPos = {
                x: parseFloat(char.style.left),
                y: parseFloat(char.style.top)
            };
            
            const distance = Math.sqrt(
                Math.pow(myPos.x - charPos.x, 2) + 
                Math.pow(myPos.y - charPos.y, 2)
            );
            
            if (distance < 15) {
                char.querySelector('.head').style.boxShadow = '0 0 20px currentColor';
            } else {
                char.querySelector('.head').style.boxShadow = '0 0 10px currentColor';
            }
        });
    }
    
    setInterval(checkProximity, 100);
    
    // Character interactions on click
    characters.forEach(char => {
        char.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Create interaction bubble
            const bubble = document.createElement('div');
            bubble.style.cssText = `
                position: absolute;
                bottom: 60px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 15px;
                font-size: 11px;
                white-space: nowrap;
                animation: fadeInOut 2s ease forwards;
                pointer-events: none;
                z-index: 1000;
            `;
            
            const greetings = ['Hey!', 'What\'s up?', '🎵', 'Nice moves!', 'Party time!'];
            bubble.textContent = greetings[Math.floor(Math.random() * greetings.length)];
            
            this.appendChild(bubble);
            
            setTimeout(() => bubble.remove(), 2000);
        });
    });
    
    // Add fade animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
            50% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Social Floor System Active! Click to move your character.');
})();
</script>