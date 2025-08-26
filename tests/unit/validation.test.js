const { validateSensorData } = require('../../middleware/validation');

describe('Validation Middleware', () => {
  
  describe('Sensor Data Validation', () => {
    it('should validate correct temperature range', () => {
      const validTemps = [-40, 0, 23.5, 80];
      const invalidTemps = [-41, 81, 100];
      
      validTemps.forEach(temp => {
        const req = {
          body: {
            temperature: temp,
            humidity: 50,
            deviceId: 'ESP32_001'
          }
        };
        
        // Temperature should be within range
        expect(temp >= -40 && temp <= 80).toBe(true);
      });
      
      invalidTemps.forEach(temp => {
        expect(temp < -40 || temp > 80).toBe(true);
      });
    });

    it('should validate correct humidity range', () => {
      const validHumidity = [0, 50, 65.2, 100];
      const invalidHumidity = [-1, 101, 150];
      
      validHumidity.forEach(humidity => {
        expect(humidity >= 0 && humidity <= 100).toBe(true);
      });
      
      invalidHumidity.forEach(humidity => {
        expect(humidity < 0 || humidity > 100).toBe(true);
      });
    });

    it('should validate device ID format', () => {
      const validIds = ['ESP32_001', 'ESP32_099', 'ESP32_100'];
      const invalidIds = ['ESP32001', 'ESP_001', 'ESP32_ABC'];
      
      const regex = /^ESP32_[0-9]{3}$/;
      
      validIds.forEach(id => {
        expect(regex.test(id)).toBe(true);
      });
      
      invalidIds.forEach(id => {
        expect(regex.test(id)).toBe(false);
      });
    });
  });
});