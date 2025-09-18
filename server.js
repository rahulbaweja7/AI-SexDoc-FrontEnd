const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5500;

// Target backend for dev proxy
const DEV_API_TARGET = process.env.API_TARGET || 'http://localhost:3001';

// Proxy API calls in dev to avoid CORS (use /api/* → backend)
app.use('/api', createProxyMiddleware({
  target: DEV_API_TARGET,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq, req, res) => {
    // Ensure JSON headers for POSTs
    if (!proxyReq.getHeader('Content-Type')) {
      proxyReq.setHeader('Content-Type', 'application/json');
    }
    // Strip Origin so backend CORS middleware doesn't reject proxied requests
    try { proxyReq.removeHeader && proxyReq.removeHeader('origin'); } catch (_) {}
  }
}));

// Serve built React app if present
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  setHeaders: (res) => {
    if (process.env.NODE_ENV !== 'production') {
      res.set('Cache-Control', 'no-store');
    }
  }
}));

// SPA fallback to React index.html
app.get('*', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    res.set('Cache-Control', 'no-store');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend running at http://localhost:${PORT}`);
  console.log(`🔁 Proxy active: http://localhost:${PORT}/api → ${DEV_API_TARGET}`);
});
