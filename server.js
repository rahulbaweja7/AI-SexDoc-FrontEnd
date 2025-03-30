require('dotenv').config(); // Load env first
const connectToMongo = require('./utils/mongodb');
connectToMongo(); // Connect to MongoDB

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Use your actual AI route here
const askRoute = require('./routes/ask');
app.use('/ask', askRoute); // This uses OpenAI and stores history

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
