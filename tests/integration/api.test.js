const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  let server;
  let authToken;
  const deviceId = 'ESP32_001';
  const deviceSecret = 'esp32-device-secret-key';

  beforeAll((done) => {
    server = app.listen(4000, done);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    // Close Firebase connection
    const { admin } = require('../../config/firebase');
    if (admin.apps.length > 0) {
      await admin.app().delete();
    }
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });

  describe('POST /api/auth/device', () => {
    it('should authenticate device with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/device')
        .send({ deviceId, deviceSecret })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });

    it('should reject invalid device credentials', async () => {
      const response = await request(app)
        .post('/api/auth/device')
        .send({ deviceId, deviceSecret: 'wrong-secret' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid device credentials');
    });

    it('should reject invalid device ID format', async () => {
      const response = await request(app)
        .post('/api/auth/device')
        .send({ deviceId: 'INVALID_ID', deviceSecret })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/sensor/data', () => {
    it('should accept valid sensor data with authentication', async () => {
      const sensorData = {
        temperature: 23.5,
        humidity: 65.2,
        deviceId: deviceId,
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/sensor/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sensorData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Data stored successfully');
    });

    it('should reject sensor data without authentication', async () => {
      const sensorData = {
        temperature: 23.5,
        humidity: 65.2,
        deviceId: deviceId
      };

      const response = await request(app)
        .post('/api/sensor/data')
        .send(sensorData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is missing');
    });

    it('should reject invalid temperature values', async () => {
      const sensorData = {
        temperature: 100, // Out of range
        humidity: 65.2,
        deviceId: deviceId
      };

      const response = await request(app)
        .post('/api/sensor/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sensorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject invalid humidity values', async () => {
      const sensorData = {
        temperature: 23.5,
        humidity: 150, // Out of range
        deviceId: deviceId
      };

      const response = await request(app)
        .post('/api/sensor/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sensorData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/sensor/data/:deviceId', () => {
    it('should retrieve sensor data with authentication', async () => {
      const response = await request(app)
        .get(`/api/sensor/data/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.deviceId).toBe(deviceId);
      expect(response.body.count).toBeDefined();
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/sensor/data/${deviceId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is missing');
    });
  });
});