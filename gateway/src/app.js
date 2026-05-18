const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Hotel Service
app.use('/api/v1/hotels', createProxyMiddleware({
  target: process.env.HOTEL_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/hotels/' }
}));

app.use('/api/v1/rooms', createProxyMiddleware({
  target: process.env.HOTEL_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/rooms/' }
}));

app.use('/api/v1/availability', createProxyMiddleware({
  target: process.env.HOTEL_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/availability/' }
}));

app.use('/api/v1/search', createProxyMiddleware({
  target: process.env.HOTEL_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/search/' }
}));

app.use('/api/v1/bookings', createProxyMiddleware({
  target: process.env.HOTEL_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/bookings/' }
}));

// Comments Service
app.use('/api/v1/comments', createProxyMiddleware({
  target: process.env.COMMENTS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/comments/' }
}));

// AI Agent Service
app.use('/api/v1/agent', createProxyMiddleware({
  target: process.env.AI_AGENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v1/agent/' }
}));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));