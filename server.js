const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

// Serve built React app if present
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback to React index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend running at http://localhost:${PORT}`);
});
