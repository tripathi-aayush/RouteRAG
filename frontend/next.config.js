const { createProxyMiddleware } = require('http-proxy-middleware');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9100/api/:path*',
      },
    ];
  },
};

