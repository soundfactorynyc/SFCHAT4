/**
 * SoundFactory Pins Overlay
 * A reusable pins overlay component for interactive content annotation
 */

class SoundFactoryPins {
    constructor(options = {}) {
        this.options = {
            container: document.body, // Container element for pins
            theme: 'light', // light, dark
            zIndex: 10000,
            pinSize: '24px',
            allowUserPins: true, // Allow users to add pins by clicking
            maxPins: 50,
            autoSave: true, // Auto-save pins to localStorage
            storageKey: 'sf-pins-data',
            ...options
        };
        
        this.pins = [];
        this.isVisible = true;
        this.isDragging = false;
        this.init();
    }
    
    init() {
        this.createPinStyles();
        this.bindEvents();
        this.loadPins();
    }
    
    createPinStyles() {
        // Inject CSS styles for pins
        const styleId = 'sf-pins-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .sf-pin {
                position: absolute;
                width: ${this.options.pinSize};
                height: ${this.options.pinSize};
                background: #ff6b6b;
                border: 2px solid #fff;
                border-radius: 50%;
                cursor: pointer;
                z-index: ${this.options.zIndex};
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                font-weight: bold;
                user-select: none;
            }
            
            .sf-pin:hover {
                transform: scale(1.2);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .sf-pin.sf-pin-active {
                background: #4ecdc4;
                transform: scale(1.2);
            }
            
            .sf-pin-tooltip {
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                max-width: 200px;
                z-index: ${this.options.zIndex + 1};
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                word-wrap: break-word;
            }
            
            .sf-pin-tooltip.sf-pin-tooltip-visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .sf-pin-tooltip::before {
                content: '';
                position: absolute;
                top: -5px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-bottom: 5px solid #333;
            }
            
            .sf-pins-hidden .sf-pin {
                display: none !important;
            }
            
            .sf-pin-form {
                position: absolute;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                z-index: ${this.options.zIndex + 2};
                min-width: 250px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .sf-pin-form input,
            .sf-pin-form textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                margin-bottom: 8px;
                box-sizing: border-box;
            }
            
            .sf-pin-form textarea {
                resize: vertical;
                min-height: 60px;
            }
            
            .sf-pin-form-buttons {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }
            
            .sf-pin-form button {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .sf-pin-form .sf-pin-save {
                background: #007bff;
                color: white;
            }
            
            .sf-pin-form .sf-pin-cancel {
                background: #6c757d;
                color: white;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    bindEvents() {
        if (this.options.allowUserPins) {
            this.options.container.addEventListener('click', (e) => {
                if (e.target.closest('.sf-pin') || 
                    e.target.closest('.sf-pin-form') || 
                    e.target.closest('.sf-pin-tooltip')) {
                    return;
                }
                
                this.showPinForm(e.clientX, e.clientY, e);
            });
        }
        
        // Handle pin clicks
        this.options.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('sf-pin')) {
                this.showPinTooltip(e.target);
            }
        });
        
        // Close tooltips when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sf-pin') && !e.target.closest('.sf-pin-tooltip')) {
                this.hideAllTooltips();
            }
        });
    }
    
    addPin(x, y, message, author = 'Anonymous', id = null) {
        const pin = {
            id: id || this.generateId(),
            x: x,
            y: y,
            message: message,
            author: author,
            timestamp: new Date().toISOString(),
            element: null
        };
        
        pin.element = this.createPinElement(pin);
        this.pins.push(pin);
        
        if (this.options.autoSave) {
            this.savePins();
        }
        
        return pin;
    }
    
    createPinElement(pin) {
        const pinElement = document.createElement('div');
        pinElement.className = 'sf-pin';
        pinElement.style.left = pin.x + 'px';
        pinElement.style.top = pin.y + 'px';
        pinElement.dataset.pinId = pin.id;
        pinElement.textContent = this.pins.length.toString();
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'sf-pin-tooltip';
        tooltip.innerHTML = `
            <strong>${pin.author}</strong><br>
            ${pin.message}<br>
            <small>${new Date(pin.timestamp).toLocaleString()}</small>
        `;
        
        pinElement.appendChild(tooltip);
        this.options.container.appendChild(pinElement);
        
        return pinElement;
    }
    
    showPinForm(x, y, originalEvent) {
        // Remove any existing form
        this.hidePinForm();
        
        const form = document.createElement('div');
        form.className = 'sf-pin-form';
        form.style.left = x + 'px';
        form.style.top = y + 'px';
        
        form.innerHTML = `
            <input type="text" placeholder="Your name" class="sf-pin-author" value="User">
            <textarea placeholder="Add your comment..." class="sf-pin-message"></textarea>
            <div class="sf-pin-form-buttons">
                <button class="sf-pin-cancel">Cancel</button>
                <button class="sf-pin-save">Save Pin</button>
            </div>
        `;
        
        this.options.container.appendChild(form);
        
        // Focus on message textarea
        const messageField = form.querySelector('.sf-pin-message');
        messageField.focus();
        
        // Handle form actions
        form.querySelector('.sf-pin-save').addEventListener('click', () => {
            const author = form.querySelector('.sf-pin-author').value.trim() || 'Anonymous';
            const message = form.querySelector('.sf-pin-message').value.trim();
            
            if (message) {
                // Convert screen coordinates to container-relative coordinates
                const containerRect = this.options.container.getBoundingClientRect();
                const relativeX = originalEvent.pageX - containerRect.left - window.pageXOffset;
                const relativeY = originalEvent.pageY - containerRect.top - window.pageYOffset;
                
                this.addPin(relativeX, relativeY, message, author);
            }
            
            this.hidePinForm();
        });
        
        form.querySelector('.sf-pin-cancel').addEventListener('click', () => {
            this.hidePinForm();
        });
        
        // Handle Enter key
        messageField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.querySelector('.sf-pin-save').click();
            }
        });
    }
    
    hidePinForm() {
        const existingForm = this.options.container.querySelector('.sf-pin-form');
        if (existingForm) {
            existingForm.remove();
        }
    }
    
    showPinTooltip(pinElement) {
        this.hideAllTooltips();
        
        const tooltip = pinElement.querySelector('.sf-pin-tooltip');
        if (tooltip) {
            tooltip.classList.add('sf-pin-tooltip-visible');
            
            // Position tooltip above pin
            const pinRect = pinElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.bottom = '100%';
            tooltip.style.marginBottom = '8px';
        }
        
        pinElement.classList.add('sf-pin-active');
    }
    
    hideAllTooltips() {
        this.options.container.querySelectorAll('.sf-pin-tooltip-visible').forEach(tooltip => {
            tooltip.classList.remove('sf-pin-tooltip-visible');
        });
        
        this.options.container.querySelectorAll('.sf-pin-active').forEach(pin => {
            pin.classList.remove('sf-pin-active');
        });
    }
    
    removePin(pinId) {
        const pinIndex = this.pins.findIndex(pin => pin.id === pinId);
        if (pinIndex !== -1) {
            const pin = this.pins[pinIndex];
            if (pin.element) {
                pin.element.remove();
            }
            this.pins.splice(pinIndex, 1);
            
            if (this.options.autoSave) {
                this.savePins();
            }
            
            // Update pin numbers
            this.updatePinNumbers();
        }
    }
    
    clearAllPins() {
        this.pins.forEach(pin => {
            if (pin.element) {
                pin.element.remove();
            }
        });
        
        this.pins = [];
        
        if (this.options.autoSave) {
            this.savePins();
        }
    }
    
    updatePinNumbers() {
        this.pins.forEach((pin, index) => {
            if (pin.element) {
                pin.element.textContent = (index + 1).toString();
            }
        });
    }
    
    show() {
        this.isVisible = true;
        this.options.container.classList.remove('sf-pins-hidden');
    }
    
    hide() {
        this.isVisible = false;
        this.options.container.classList.add('sf-pins-hidden');
        this.hideAllTooltips();
        this.hidePinForm();
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    savePins() {
        if (!this.options.autoSave) return;
        
        const dataToSave = this.pins.map(pin => ({
            id: pin.id,
            x: pin.x,
            y: pin.y,
            message: pin.message,
            author: pin.author,
            timestamp: pin.timestamp
        }));
        
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(dataToSave));
        } catch (e) {
            console.warn('SoundFactory Pins: Could not save to localStorage', e);
        }
    }
    
    loadPins() {
        if (!this.options.autoSave) return;
        
        try {
            const savedData = localStorage.getItem(this.options.storageKey);
            if (savedData) {
                const pins = JSON.parse(savedData);
                pins.forEach(pinData => {
                    this.addPin(pinData.x, pinData.y, pinData.message, pinData.author, pinData.id);
                });
            }
        } catch (e) {
            console.warn('SoundFactory Pins: Could not load from localStorage', e);
        }
    }
    
    generateId() {
        return 'pin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Public API methods
    getPins() {
        return this.pins.map(pin => ({
            id: pin.id,
            x: pin.x,
            y: pin.y,
            message: pin.message,
            author: pin.author,
            timestamp: pin.timestamp
        }));
    }
    
    setPins(pinsData) {
        this.clearAllPins();
        pinsData.forEach(pinData => {
            this.addPin(pinData.x, pinData.y, pinData.message, pinData.author, pinData.id);
        });
    }
    
    setTheme(theme) {
        this.options.theme = theme;
        // Theme changes would be handled in CSS
    }
    
    destroy() {
        this.clearAllPins();
        this.hidePinForm();
        
        // Remove styles
        const styles = document.getElementById('sf-pins-styles');
        if (styles) {
            styles.remove();
        }
        
        // Remove class from container
        this.options.container.classList.remove('sf-pins-hidden');
    }
}

// Auto-initialize if not in module environment
if (typeof module === 'undefined') {
    window.SoundFactoryPins = SoundFactoryPins;
}