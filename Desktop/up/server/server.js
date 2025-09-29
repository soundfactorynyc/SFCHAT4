// Simple Node.js WebSocket server (server.js)
// Usage:
//   npm install
//   node server.js
// Then open http://localhost:5173 (vite/serve) or your static server and connect to ws://localhost:8080

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

console.log('[ws] starting on ws://localhost:8080');

wss.on('connection', (ws) => {
  const userId = Date.now() + '_' + Math.random().toString(36).slice(2,7);
  ws._id = userId;
  console.log('[ws] client connected', userId);

  ws.on('message', (data) => {
    // Simple broadcast of raw messages to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(String(data));
      }
    });
  });

  ws.on('close', () => {
    console.log('[ws] client disconnected', userId);
  });
});
