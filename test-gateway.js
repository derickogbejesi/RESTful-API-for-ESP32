const axios = require('axios');

const API_URL = 'http://localhost:3000';
const DEVICE_ID = 'ESP32_001';
const DEVICE_SECRET = process.env.DEVICE_SECRET || 'esp32-device-secret-key';

async function testGateway() {
  console.log('Testing API Gateway...\n');
  
  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('✓ Health check passed:', health.data);
  } catch (error) {
    console.log('✗ Health check failed:', error.message);
  }
  
  // Test 2: Device Authentication
  console.log('\n2. Testing Device Authentication...');
  let token = null;
  try {
    const auth = await axios.post(`${API_URL}/api/auth/device`, {
      deviceId: DEVICE_ID,
      deviceSecret: DEVICE_SECRET
    });
    token = auth.data.token;
    console.log('✓ Authentication passed, token received');
  } catch (error) {
    console.log('✗ Authentication failed:', error.response?.data || error.message);
    return;
  }
  
  // Test 3: Send Sensor Data
  console.log('\n3. Testing Sensor Data Submission...');
  try {
    const sensorData = {
      temperature: 23.5,
      humidity: 65.2,
      deviceId: DEVICE_ID,
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(
      `${API_URL}/api/sensor/data`,
      sensorData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('✓ Sensor data sent successfully:', response.data);
  } catch (error) {
    console.log('✗ Sensor data submission failed:', error.response?.data || error.message);
  }
  
  // Test 4: Retrieve Sensor Data
  console.log('\n4. Testing Sensor Data Retrieval...');
  try {
    const response = await axios.get(
      `${API_URL}/api/sensor/data/${DEVICE_ID}?limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('✓ Sensor data retrieved:', response.data);
  } catch (error) {
    console.log('✗ Sensor data retrieval failed:', error.response?.data || error.message);
  }
  
  console.log('\n✓ Gateway testing complete!');
}

require('dotenv').config();
testGateway().catch(console.error);