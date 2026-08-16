/**
 * Next.js custom server proxy for API routes to FastAPI backend
 * This file ensures that /api/* requests from the frontend are proxied to http://localhost:9100/api/*
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (req, res, next) {
  if (req.url.startsWith('/api/')) {
    return createProxyMiddleware({
      target: 'http://localhost:9100',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
    })(req, res, next);
  }
  next();
};

