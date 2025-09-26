# SFCHAT4 - SF Chat & SoundFactory Pins System

Interactive overlay components for websites featuring a chat system and pins annotation system.

## 🚀 Features

### SF Chat Overlay
- **Customizable Chat Interface**: Floating chat overlay that can be positioned anywhere
- **Real-time Messaging**: Interactive chat with message history
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark themes available
- **Easy Integration**: Drop-in component for any website

### SoundFactory Pins System
- **Interactive Annotations**: Click-to-add pins on any webpage
- **Custom Messages**: Add notes and comments to specific locations
- **Persistent Storage**: Pins saved to localStorage automatically
- **Drag & Drop**: Move pins around after placement
- **Tooltip System**: Hover to view pin information

## 📁 Project Structure

```
SFCHAT4/
├── index.html              # Main homepage/blueprint
├── chat-demo.html          # Chat overlay demo page
├── pins-demo.html          # Pins overlay demo page
├── js/
│   ├── sf-chat-overlay.js      # Chat overlay component
│   └── soundfactory-pins.js    # Pins overlay component
└── css/
    └── style.css           # Shared styling
```

## 🔧 Quick Start

### Chat Overlay Usage

```html
<!-- Include the script -->
<script src="js/sf-chat-overlay.js"></script>

<!-- Initialize -->
<script>
const chatOverlay = new SFChatOverlay({
    position: 'bottom-right',
    theme: 'light',
    autoOpen: false
});
</script>
```

### Pins System Usage

```html
<!-- Include the script -->
<script src="js/soundfactory-pins.js"></script>

<!-- Initialize -->
<script>
const pinsSystem = new SoundFactoryPins({
    allowUserPins: true,
    autoSave: true
});
</script>
```

## 🌟 Demo Pages

- **Chat Demo**: Open `chat-demo.html` to test the chat overlay
- **Pins Demo**: Open `pins-demo.html` to test the pins system

## ⚙️ Configuration Options

### Chat Overlay Options
- `position`: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
- `theme`: 'light', 'dark'
- `width`: Custom width (default: '350px')
- `height`: Custom height (default: '500px')
- `autoOpen`: Auto-open on page load

### Pins System Options
- `allowUserPins`: Enable click-to-add pins
- `autoSave`: Auto-save to localStorage
- `maxPins`: Maximum number of pins allowed
- `pinSize`: Size of pin markers

## 📱 Mobile Support

Both components are fully responsive and optimized for mobile devices with touch-friendly interactions.

## 🎨 Customization

The components can be styled using CSS variables and custom themes. See `css/style.css` for examples.

## 🔗 Integration

These components can be easily integrated into any existing website by including the JavaScript files and initializing the components.

## 📄 License

This project is part of the Sound Factory NYC ecosystem.

---

**Sound Factory NYC** - Interactive web experiences and club management systems