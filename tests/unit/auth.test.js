const { generateToken, verifyDeviceSecret } = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.DEVICE_SECRET = 'esp32-device-secret-key';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const deviceId = 'ESP32_001';
      const token = generateToken(deviceId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.deviceId).toBe(deviceId);
      expect(decoded.timestamp).toBeDefined();
    });
  });

  describe('verifyDeviceSecret', () => {
    it('should return true for valid device secret', () => {
      const result = verifyDeviceSecret('esp32-device-secret-key');
      expect(result).toBe(true);
    });

    it('should return false for invalid device secret', () => {
      const result = verifyDeviceSecret('wrong-secret');
      expect(result).toBe(false);
    });
  });
});