// Simple development server to serve the frontend
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback to index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running at http://localhost:${PORT}`);
  console.log(`📂 Serving files from: ${path.join(__dirname, 'frontend')}`);
});

