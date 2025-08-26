const axios = require('axios');

class LoadTest {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.results = [];
  }

  async simulateDevices(count, duration = 60000) {
    console.log(`\nLoad Test: ${count} devices for ${duration/1000} seconds`);
    console.log('Note: Rate limiting is set to 100 auth requests per 15 minutes\n');
    
    const startTime = Date.now();
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    
    // Authenticate devices
    const devices = [];
    for (let i = 1; i <= count; i++) {
      const deviceId = `ESP32_${String(i).padStart(3, '0')}`;
      try {
        const response = await axios.post(`${this.apiUrl}/api/auth/device`, {
          deviceId: deviceId,
          deviceSecret: 'esp32-device-secret-key'
        });
        devices.push({
          deviceId: deviceId,
          token: response.data.token
        });
        console.log(`✓ Device ${deviceId} authenticated`);
      } catch (error) {
        console.log(`✗ Device ${deviceId} authentication failed`);
      }
    }

    console.log(`\nStarting data transmission with ${devices.length} devices...\n`);

    // Send data until duration expires
    const endTime = startTime + duration;
    
    while (Date.now() < endTime) {
      const promises = devices.map(device => {
        const sensorData = {
          temperature: 20 + Math.random() * 10,
          humidity: 40 + Math.random() * 30,
          deviceId: device.deviceId,
          timestamp: new Date().toISOString()
        };
        
        return axios.post(
          `${this.apiUrl}/api/sensor/data`,
          sensorData,
          {
            headers: {
              'Authorization': `Bearer ${device.token}`
            }
          }
        ).then(() => {
          successfulRequests++;
          return true;
        }).catch(() => {
          failedRequests++;
          return false;
        });
      });
      
      await Promise.all(promises);
      totalRequests += devices.length;
      
      // Wait 1 second between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const elapsedTime = (Date.now() - startTime) / 1000;
    const throughput = totalRequests / elapsedTime;
    const successRate = (successfulRequests / totalRequests) * 100;

    const results = {
      testConfig: {
        devices: count,
        duration: `${elapsedTime.toFixed(1)}s`,
        totalRequests: totalRequests
      },
      performance: {
        throughput: `${throughput.toFixed(2)} req/s`,
        successRate: `${successRate.toFixed(2)}%`,
        successfulRequests: successfulRequests,
        failedRequests: failedRequests
      }
    };

    console.log('\n=== Load Test Results ===');
    console.log(JSON.stringify(results, null, 2));
    
    return results;
  }
}

// Run load tests with different device counts
async function runLoadTests() {
  const loadTest = new LoadTest();
  
  console.log('='.repeat(60));
  console.log('LOAD TESTING SUITE');
  console.log('='.repeat(60));
  
  // Test with increasing device counts
  const testConfigs = [
    { devices: 1, duration: 10000 },
    { devices: 10, duration: 10000 },
    { devices: 50, duration: 10000 }
  ];
  
  const allResults = [];
  
  for (const config of testConfigs) {
    const result = await loadTest.simulateDevices(config.devices, config.duration);
    allResults.push(result);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('ALL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(JSON.stringify(allResults, null, 2));
}

module.exports = LoadTest;

if (require.main === module) {
  require('dotenv').config({ path: '../../.env' });
  runLoadTests().catch(console.error);
}