# Sound Factory WebSocket Real-time Pin Sharing

## 🚀 Quick Start

### 1. Install WebSocket Server Dependencies

```bash
# Install WebSocket server dependencies
npm install ws nodemon

# Or copy the package file
cp package-websocket.json package.json
npm install
```

### 2. Start WebSocket Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

Server will start on `ws://localhost:8080`

### 3. Update Frontend Configuration

In `js/websocket-client.js`, update the server URL:

```javascript
this.serverUrl = 'ws://localhost:8080'; // Change to your server URL
```

For production, use:
```javascript
this.serverUrl = 'wss://your-domain.com'; // Secure WebSocket
```

## 🔧 Configuration

### WebSocket Server Settings

Edit `websocket-server.js`:

```javascript
const PORT = process.env.PORT || 8080; // Change port if needed
```

### Frontend Settings

Edit `js/websocket-client.js`:

```javascript
this.serverUrl = 'ws://localhost:8080'; // Your WebSocket server URL
this.maxReconnectAttempts = 5; // Max reconnection attempts
this.reconnectDelay = 1000; // Delay between reconnections (ms)
```

## 📡 How It Works

### Real-time Pin Sharing Flow

1. **User drops pin** → Frontend creates local pin
2. **WebSocket broadcast** → Pin data sent to server
3. **Server distributes** → Pin sent to all connected users
4. **Other users receive** → Pin appears on their floor
5. **Live updates** → All users see pins in real-time

### Message Types

```javascript
// Pin Creation
{
  type: 'pin_create',
  pin: {
    id: 'pin_abc123',
    userId: 'user_xyz789',
    x: 45.5,
    y: 30.2,
    message: 'Amazing night!',
    color: '#ff6b00',
    type: 'moment'
  }
}

// Pin Update
{
  type: 'pin_update',
  pin: { /* updated pin data */ }
}

// Pin Delete
{
  type: 'pin_delete',
  pinId: 'pin_abc123'
}

// Authentication
{
  type: 'auth',
  userId: 'user_xyz789'
}
```

## 🧪 Testing

### 1. Local Testing

1. Start WebSocket server: `npm start`
2. Open multiple browser tabs to your site
3. Drop pins in one tab
4. Watch them appear in other tabs instantly

### 2. Network Testing

1. Deploy WebSocket server to your hosting
2. Update frontend server URL
3. Test across different devices/networks

### 3. Console Monitoring

Check browser console for:
- ✅ "WebSocket connected"
- ✅ "Pin broadcasted to other users"
- ✅ "Received pin from other user"

## 🚀 Deployment

### Option 1: Heroku

```bash
# Add to your Heroku app
heroku addons:create heroku-postgresql:hobby-dev
git add .
git commit -m "Add WebSocket server"
git push heroku main
```

### Option 2: Railway

```bash
# Deploy to Railway
railway login
railway init
railway up
```

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repo
2. Set build command: `npm install`
3. Set run command: `npm start`
4. Add environment variables

## 🔒 Security

### Production Security

1. **Use WSS (Secure WebSockets)**
   ```javascript
   this.serverUrl = 'wss://your-domain.com';
   ```

2. **Add Authentication**
   ```javascript
   // In websocket-server.js
   const token = req.headers.authorization;
   if (!isValidToken(token)) {
     ws.close(1008, 'Unauthorized');
   }
   ```

3. **Rate Limiting**
   ```javascript
   // Limit pin creation per user
   const userPinCount = getUserPinCount(userId);
   if (userPinCount > MAX_PINS_PER_USER) {
     sendError(ws, 'Too many pins');
     return;
   }
   ```

4. **Input Validation**
   ```javascript
   // Validate pin data
   if (!isValidPinData(pinData)) {
     sendError(ws, 'Invalid pin data');
     return;
   }
   ```

## 📊 Monitoring

### Server Logs

```bash
# View server logs
npm start | tee websocket.log

# Monitor connections
tail -f websocket.log | grep "Client connected"
```

### Client Monitoring

```javascript
// Add to your frontend
window.soundFactoryWS.setOnConnect(() => {
  console.log('🔌 Connected to live floor');
  showNotification('🔌 Connected to live floor', '#00ff88');
});

window.soundFactoryWS.setOnDisconnect(() => {
  console.log('🔌 Disconnected from live floor');
  showNotification('⚠️ Disconnected from live floor', '#ffcc00');
});
```

## 🐛 Troubleshooting

### Common Issues

1. **"WebSocket connection failed"**
   - Check server is running
   - Verify server URL is correct
   - Check firewall/network settings

2. **"Pins not appearing"**
   - Check browser console for errors
   - Verify WebSocket connection
   - Check server logs

3. **"Connection drops frequently"**
   - Check network stability
   - Increase ping interval
   - Add reconnection logic

4. **"Server crashes"**
   - Check for memory leaks
   - Monitor server resources
   - Add error handling

### Debug Mode

```javascript
// Enable debug logging
window.soundFactoryWS.debug = true;

// Check connection status
console.log('Connected:', window.soundFactoryWS.isConnected());
```

## 📈 Performance

### Optimization Tips

1. **Limit Pin Count**
   ```javascript
   const MAX_PINS = 100;
   if (pins.size > MAX_PINS) {
     // Remove oldest pins
   }
   ```

2. **Batch Updates**
   ```javascript
   // Send multiple pins in one message
   const batchUpdate = {
     type: 'pins_batch',
     pins: Array.from(pins.values())
   };
   ```

3. **Connection Pooling**
   ```javascript
   // Reuse connections
   const connectionPool = new Map();
   ```

## 🔄 Scaling

### Multiple Servers

1. **Load Balancer**
   - Use sticky sessions
   - Share state between servers

2. **Redis Pub/Sub**
   ```javascript
   // Broadcast to all servers
   redis.publish('pins', JSON.stringify(pinData));
   ```

3. **Database Sync**
   ```javascript
   // Store pins in database
   await supabase.from('pins').insert(pinData);
   ```

## 📱 Mobile Optimization

### Touch Events

```javascript
// Handle touch events for mobile
pin.addEventListener('touchstart', (e) => {
  e.preventDefault();
  showRemotePinPopup(pinData);
});
```

### Battery Optimization

```javascript
// Reduce ping frequency on mobile
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const pingInterval = isMobile ? 60000 : 30000; // 1 min vs 30 sec
```

## 🎯 Features

### Current Features
- ✅ Real-time pin sharing
- ✅ User authentication
- ✅ Pin creation/update/delete
- ✅ Auto-reconnection
- ✅ Connection health monitoring

### Planned Features
- 🔄 Pin reactions (likes, comments)
- 🔄 Pin categories/filters
- 🔄 User presence indicators
- 🔄 Pin analytics
- 🔄 Moderation tools

## 📞 Support

### Debug Commands
```javascript
// Check server status
window.soundFactoryWS.isConnected()

// Force reconnection
window.soundFactoryWS.connect()

// Send test message
window.soundFactoryWS.send({type: 'ping'})
```

### Logs to Check
- Browser console (F12)
- Server terminal output
- Network tab in DevTools
- WebSocket frames in DevTools

---

**🎉 Your Sound Factory floor is now live and real-time!**

Users can drop pins and see them instantly across all connected devices. The WebSocket server handles all the real-time communication, making your social floor truly interactive.


