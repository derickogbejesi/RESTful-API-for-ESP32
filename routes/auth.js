const express = require('express');
const router = express.Router();
const { generateToken, verifyDeviceSecret } = require('../middleware/auth');
const { validateDeviceAuth } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { db } = require('../config/firebase');

router.post('/device', authLimiter, validateDeviceAuth, async (req, res) => {
  try {
    const { deviceId, deviceSecret } = req.body;
    
    if (!verifyDeviceSecret(deviceSecret)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid device credentials'
      });
    }
    
    const token = generateToken(deviceId);
    
    // Try to update Firebase, but don't fail if it doesn't work
    try {
      await db.ref(`devices/${deviceId}`).update({
        lastSeen: new Date().toISOString()
      });
    } catch (fbError) {
      console.log('Firebase update failed:', fbError.message);
    }
    
    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

router.post('/token', authLimiter, validateDeviceAuth, async (req, res) => {
  try {
    const { deviceId, deviceSecret } = req.body;
    
    if (!verifyDeviceSecret(deviceSecret)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = generateToken(deviceId);
    
    res.json({
      success: true,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token generation failed'
    });
  }
});

module.exports = router;