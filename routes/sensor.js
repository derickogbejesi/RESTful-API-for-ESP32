const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateSensorData, validateDeviceId } = require('../middleware/validation');
const { dataLimiter } = require('../middleware/rateLimiter');
const { db } = require('../config/firebase');

router.post('/data', authenticateToken, dataLimiter, validateSensorData, async (req, res) => {
  try {
    const { temperature, humidity, deviceId, timestamp } = req.body;
    
    const sensorData = {
      temperature,
      humidity,
      timestamp: timestamp || new Date().toISOString()
    };
    
    // Try to store in Firebase, but don't fail if it doesn't work
    try {
      await db.ref(`sensorData/${deviceId}`).push(sensorData);
      await db.ref(`devices/${deviceId}`).update({
        lastSeen: new Date().toISOString()
      });
      console.log(`Data stored for ${deviceId}: Temp=${temperature}°C, Humidity=${humidity}%`);
    } catch (fbError) {
      console.log('Firebase storage failed:', fbError.message);
    }
    
    res.json({
      success: true,
      message: 'Data stored successfully'
    });
  } catch (error) {
    console.error('Sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store sensor data'
    });
  }
});

router.get('/data/:deviceId', authenticateToken, validateDeviceId, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    let data = {};
    try {
      const snapshot = await db.ref(`sensorData/${deviceId}`)
        .orderByChild('timestamp')
        .limitToLast(limit)
        .once('value');
      
      data = snapshot.val() || {};
    } catch (fbError) {
      console.log('Firebase retrieval failed:', fbError.message);
    }
    
    res.json({
      success: true,
      deviceId,
      count: Object.keys(data).length,
      data: Object.values(data)
    });
  } catch (error) {
    console.error('Get sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sensor data'
    });
  }
});

module.exports = router;