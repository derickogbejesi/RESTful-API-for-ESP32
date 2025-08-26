const axios = require('axios');
const { performance } = require('perf_hooks');

class PerformanceMetrics {
  constructor(apiUrl = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
    this.metrics = {
      latency: [],
      throughput: [],
      errors: 0,
      success: 0,
      startTime: null,
      endTime: null
    };
  }

  async measureLatency(deviceId, token) {
    const sensorData = {
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      deviceId: deviceId,
      timestamp: new Date().toISOString()
    };

    const start = performance.now();
    try {
      await axios.post(
        `${this.apiUrl}/api/sensor/data`,
        sensorData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const end = performance.now();
      const latency = end - start;
      this.metrics.latency.push(latency);
      this.metrics.success++;
      return latency;
    } catch (error) {
      this.metrics.errors++;
      return -1;
    }
  }

  async runLoadTest(deviceCount, duration = 60000) {
    console.log(`\nStarting load test with ${deviceCount} devices for ${duration/1000} seconds\n`);
    
    this.metrics.startTime = Date.now();
    const tokens = [];
    
    // Authenticate all devices
    for (let i = 1; i <= deviceCount; i++) {
      const deviceId = `ESP32_${String(i).padStart(3, '0')}`;
      try {
        const response = await axios.post(`${this.apiUrl}/api/auth/device`, {
          deviceId: deviceId,
          deviceSecret: 'esp32-device-secret-key'
        });
        tokens.push({ deviceId, token: response.data.token });
      } catch (error) {
        console.error(`Failed to authenticate ${deviceId}`);
      }
    }

    // Run test for specified duration
    const endTime = Date.now() + duration;
    let requestCount = 0;

    while (Date.now() < endTime) {
      const promises = tokens.map(({ deviceId, token }) => 
        this.measureLatency(deviceId, token)
      );
      
      await Promise.all(promises);
      requestCount += tokens.length;
      
      // Wait 1 second between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.metrics.endTime = Date.now();
    const totalTime = (this.metrics.endTime - this.metrics.startTime) / 1000;
    this.metrics.throughput = requestCount / totalTime;

    return this.generateReport(deviceCount);
  }

  calculateStatistics(data) {
    const n = data.length;
    if (n === 0) return { mean: 0, variance: 0, stdDev: 0, min: 0, max: 0 };

    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...data);
    const max = Math.max(...data);

    return { mean, variance, stdDev, min, max };
  }

  generateReport(deviceCount) {
    const stats = this.calculateStatistics(this.metrics.latency);
    const errorRate = (this.metrics.errors / (this.metrics.success + this.metrics.errors)) * 100;

    const report = {
      testConfiguration: {
        devices: deviceCount,
        duration: `${(this.metrics.endTime - this.metrics.startTime) / 1000}s`,
        totalRequests: this.metrics.success + this.metrics.errors
      },
      latencyMetrics: {
        mean: `${stats.mean.toFixed(2)}ms`,
        variance: stats.variance.toFixed(2),
        stdDev: `${stats.stdDev.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`
      },
      throughput: `${this.metrics.throughput.toFixed(2)} requests/second`,
      reliability: {
        successRate: `${(100 - errorRate).toFixed(2)}%`,
        errorRate: `${errorRate.toFixed(2)}%`,
        totalErrors: this.metrics.errors
      }
    };

    return report;
  }
}

// Direct Firebase test (Configuration A - Baseline)
class DirectFirebaseTest {
  constructor() {
    const { admin, db } = require('../config/firebase');
    this.admin = admin;
    this.db = db;
  }

  async measureDirectLatency(deviceId) {
    const sensorData = {
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      timestamp: new Date().toISOString()
    };

    const start = performance.now();
    try {
      await this.db.ref(`directTest/${deviceId}`).push(sensorData);
      const end = performance.now();
      return end - start;
    } catch (error) {
      return -1;
    }
  }

  async runBaselineTest(deviceCount, samples = 100) {
    console.log(`\nRunning baseline test (Direct to Firebase) with ${deviceCount} devices\n`);
    
    const latencies = [];
    
    for (let i = 0; i < samples; i++) {
      const deviceId = `ESP32_${String((i % deviceCount) + 1).padStart(3, '0')}`;
      const latency = await this.measureDirectLatency(deviceId);
      if (latency > 0) latencies.push(latency);
    }

    const stats = this.calculateStatistics(latencies);
    
    return {
      configuration: 'Direct ESP32 → Firebase',
      samples: latencies.length,
      latency: {
        mean: `${stats.mean.toFixed(2)}ms`,
        stdDev: `${stats.stdDev.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`
      }
    };
  }

  calculateStatistics(data) {
    const n = data.length;
    if (n === 0) return { mean: 0, stdDev: 0, min: 0, max: 0 };

    const mean = data.reduce((a, b) => a + b, 0) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...data);
    const max = Math.max(...data);

    return { mean, variance, stdDev, min, max };
  }
}

// Run tests
async function runPerformanceTests() {
  console.log('='.repeat(60));
  console.log('PERFORMANCE TESTING SUITE');
  console.log('='.repeat(60));

  const metrics = new PerformanceMetrics();
  const directTest = new DirectFirebaseTest();

  // Test different device counts
  const deviceCounts = [1, 10, 50];
  const results = [];

  for (const count of deviceCounts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing with ${count} device(s)`);
    console.log('='.repeat(60));

    // Configuration B: Through Gateway
    const gatewayResult = await metrics.runLoadTest(count, 30000); // 30 seconds
    
    // Configuration A: Direct to Firebase
    const directResult = await directTest.runBaselineTest(count, 50);

    results.push({
      devices: count,
      gateway: gatewayResult,
      direct: directResult
    });

    console.log('\n--- Gateway Results ---');
    console.log(JSON.stringify(gatewayResult, null, 2));
    
    console.log('\n--- Direct Firebase Results ---');
    console.log(JSON.stringify(directResult, null, 2));
  }

  // Save results for analysis
  const fs = require('fs');
  fs.writeFileSync(
    'tests/performance-results.json',
    JSON.stringify(results, null, 2)
  );

  console.log('\n' + '='.repeat(60));
  console.log('TESTING COMPLETE');
  console.log('Results saved to tests/performance-results.json');
  console.log('='.repeat(60));
}

module.exports = { PerformanceMetrics, DirectFirebaseTest };

// Run if executed directly
if (require.main === module) {
  require('dotenv').config({ path: '../.env' });
  runPerformanceTests().catch(console.error);
}