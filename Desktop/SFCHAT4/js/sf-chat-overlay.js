/**
 * SF Chat Overlay
 * A reusable chat overlay component that can be embedded in any website
 */

class SFChatOverlay {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
            theme: 'light', // light, dark
            width: '350px',
            height: '500px',
            zIndex: 10000,
            autoOpen: false,
            ...options
        };
        
        this.isOpen = false;
        this.messages = [];
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.createToggleButton();
        this.bindEvents();
        
        if (this.options.autoOpen) {
            this.open();
        }
    }
    
    createOverlay() {
        // Create main overlay container
        this.overlay = document.createElement('div');
        this.overlay.className = `sf-chat-overlay sf-chat-${this.options.theme}`;
        this.overlay.style.cssText = `
            position: fixed;
            width: ${this.options.width};
            height: ${this.options.height};
            z-index: ${this.options.zIndex};
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        this.setPosition();
        
        // Create header
        const header = document.createElement('div');
        header.className = 'sf-chat-header';
        header.style.cssText = `
            background: #007bff;
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
        `;
        header.innerHTML = `
            <span>SF Chat</span>
            <button class="sf-chat-close" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        `;
        
        // Create messages container
        this.messagesContainer = document.createElement('div');
        this.messagesContainer.className = 'sf-chat-messages';
        this.messagesContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #f8f9fa;
        `;
        
        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'sf-chat-input-container';
        inputContainer.style.cssText = `
            padding: 16px;
            background: white;
            border-top: 1px solid #e9ecef;
            display: flex;
            gap: 8px;
        `;
        
        this.messageInput = document.createElement('input');
        this.messageInput.type = 'text';
        this.messageInput.placeholder = 'Type your message...';
        this.messageInput.className = 'sf-chat-input';
        this.messageInput.style.cssText = `
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 8px 16px;
            outline: none;
            font-size: 14px;
        `;
        
        const sendButton = document.createElement('button');
        sendButton.className = 'sf-chat-send';
        sendButton.textContent = 'Send';
        sendButton.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;
        
        inputContainer.appendChild(this.messageInput);
        inputContainer.appendChild(sendButton);
        
        this.overlay.appendChild(header);
        this.overlay.appendChild(this.messagesContainer);
        this.overlay.appendChild(inputContainer);
        
        document.body.appendChild(this.overlay);
        
        // Add welcome message
        this.addMessage('Welcome to SF Chat! How can I help you today?', 'bot');
    }
    
    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'sf-chat-toggle';
        this.toggleButton.innerHTML = '💬';
        this.toggleButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 24px;
            box-shadow: 0 4px 16px rgba(0, 123, 255, 0.3);
            z-index: ${this.options.zIndex - 1};
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(this.toggleButton);
    }
    
    setPosition() {
        const positions = {
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;'
        };
        
        this.overlay.style.cssText += positions[this.options.position] || positions['bottom-right'];
    }
    
    bindEvents() {
        // Toggle button click
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });
        
        // Close button click
        this.overlay.querySelector('.sf-chat-close').addEventListener('click', () => {
            this.close();
        });
        
        // Send button click
        this.overlay.querySelector('.sf-chat-send').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key in input
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Click outside to close (optional)
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.overlay.contains(e.target) && !this.toggleButton.contains(e.target)) {
                // Uncomment to enable click-outside-to-close
                // this.close();
            }
        });
    }
    
    open() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        this.toggleButton.style.display = 'none';
        this.messageInput.focus();
    }
    
    close() {
        this.isOpen = false;
        this.overlay.style.display = 'none';
        this.toggleButton.style.display = 'block';
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        // Simulate bot response (replace with actual chat logic)
        setTimeout(() => {
            this.addMessage('Thanks for your message! This is a demo response.', 'bot');
        }, 1000);
    }
    
    addMessage(text, sender = 'user') {
        const messageElement = document.createElement('div');
        messageElement.className = `sf-chat-message sf-chat-message-${sender}`;
        
        const isUser = sender === 'user';
        messageElement.style.cssText = `
            margin-bottom: 12px;
            display: flex;
            justify-content: ${isUser ? 'flex-end' : 'flex-start'};
        `;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'sf-chat-bubble';
        messageBubble.textContent = text;
        messageBubble.style.cssText = `
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.4;
            background: ${isUser ? '#007bff' : '#fff'};
            color: ${isUser ? 'white' : '#333'};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;
        
        messageElement.appendChild(messageBubble);
        this.messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        this.messages.push({ text, sender, timestamp: new Date() });
    }
    
    // Public API methods
    clearMessages() {
        this.messagesContainer.innerHTML = '';
        this.messages = [];
        this.addMessage('Chat cleared. How can I help you?', 'bot');
    }
    
    setTheme(theme) {
        this.options.theme = theme;
        this.overlay.className = `sf-chat-overlay sf-chat-${theme}`;
    }
    
    destroy() {
        if (this.overlay) {
            this.overlay.remove();
        }
        if (this.toggleButton) {
            this.toggleButton.remove();
        }
    }
}

// Auto-initialize if not in module environment
if (typeof module === 'undefined') {
    window.SFChatOverlay = SFChatOverlay;
}