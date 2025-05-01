const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

// ✅ Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// ✅ Fallback: send index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend running at http://localhost:${PORT}`);
});
