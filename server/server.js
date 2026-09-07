require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/iocs', require('./routes/iocs'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/ai-assistant', require('./routes/ai'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), demoMode: process.env.DEMO_MODE })
);

// Socket.io
const liveEvents = require('./sockets/liveEvents')(io);
app.set('io', io);
app.set('live', liveEvents);

// Error handler
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cybersleuthes')
  .then(() => {
    console.log('✅ MongoDB connected');
    httpServer.listen(PORT, () => {
      console.log(`🚀 CyberSleuthes server running on port ${PORT}`);
      console.log(`📡 Socket.io live events enabled on /live`);
      console.log(`🔑 Demo mode: ${process.env.DEMO_MODE}`);
      console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
