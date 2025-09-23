const express = require('express');
const path = require('path');
const app = express();
const PORT = 8888;

// Serve static files
app.use(express.static('.'));
app.use(express.static('public'));
app.use('/widget', express.static('widget'));

// Basic endpoint
app.get('/', (req, res) => {
  res.send('SMS Server is running!');
});

app.listen(PORT, () => {
  console.log(`SMS server running at http://localhost:${PORT}`);
  console.log(`Widget available at http://localhost:${PORT}/widget/`);
});
