const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase');

router.get('/health', async (req, res) => {
  try {
    const firebaseConnected = admin.apps.length > 0;
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      firebase: firebaseConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Service unavailable'
    });
  }
});

module.exports = router;