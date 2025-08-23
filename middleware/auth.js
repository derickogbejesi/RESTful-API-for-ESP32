const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is missing'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.device = decoded;
    next();
  });
};

const generateToken = (deviceId) => {
  return jwt.sign(
    { 
      deviceId,
      timestamp: new Date().toISOString()
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );
};

const verifyDeviceSecret = (deviceSecret) => {
  return deviceSecret === process.env.DEVICE_SECRET;
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyDeviceSecret
};