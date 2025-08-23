const axios = require('axios');

class ESP32Simulator {
  constructor(deviceId, apiUrl) {
    this.deviceId = deviceId;
    this.apiUrl = apiUrl;
    this.token = null;
    this.isRunning = false;
  }

  generateSensorData() {
    return {
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString()
    };
  }

  async authenticate() {
    try {
      const response = await axios.post(`${this.apiUrl}/api/auth/device`, {
        deviceId: this.deviceId,
        deviceSecret: process.env.DEVICE_SECRET || 'esp32-device-secret-key'
      });
      
      this.token = response.data.token;
      console.log(`${this.deviceId}: Authenticated successfully`);
      return true;
    } catch (error) {
      console.error(`${this.deviceId}: Authentication failed`, error.message);
      return false;
    }
  }

  async sendData() {
    if (!this.token) {
      console.log(`${this.deviceId}: Not authenticated, attempting to authenticate...`);
      const authenticated = await this.authenticate();
      if (!authenticated) return;
    }

    const data = this.generateSensorData();
    
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/sensor/data`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`${this.deviceId}: Data sent - Temp: ${data.temperature.toFixed(1)}°C, Humidity: ${data.humidity.toFixed(1)}%`);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log(`${this.deviceId}: Token expired, re-authenticating...`);
        this.token = null;
        await this.authenticate();
      } else {
        console.error(`${this.deviceId}: Failed to send data`, error.message);
      }
    }
  }

  async start(intervalSeconds = 30) {
    console.log(`${this.deviceId}: Starting simulator (interval: ${intervalSeconds}s)`);
    this.isRunning = true;
    
    await this.authenticate();
    
    const interval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      await this.sendData();
    }, intervalSeconds * 1000);
    
    await this.sendData();
  }

  stop() {
    console.log(`${this.deviceId}: Stopping simulator`);
    this.isRunning = false;
  }
}

async function simulateMultipleDevices(count, apiUrl, intervalSeconds = 30) {
  const simulators = [];
  
  for (let i = 1; i <= count; i++) {
    const deviceId = `ESP32_${String(i).padStart(3, '0')}`;
    const simulator = new ESP32Simulator(deviceId, apiUrl);
    simulators.push(simulator);
    
    await simulator.start(intervalSeconds);
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return simulators;
}

if (require.main === module) {
  require('dotenv').config({ path: '../.env' });
  
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  const deviceCount = parseInt(process.argv[2]) || 1;
  const interval = parseInt(process.argv[3]) || 30;
  
  console.log(`Starting ${deviceCount} ESP32 simulator(s)...`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`Update interval: ${interval} seconds`);
  
  simulateMultipleDevices(deviceCount, apiUrl, interval)
    .then(simulators => {
      console.log(`All ${deviceCount} simulators started`);
      
      process.on('SIGINT', () => {
        console.log('\nStopping all simulators...');
        simulators.forEach(sim => sim.stop());
        process.exit(0);
      });
    })
    .catch(error => {
      console.error('Failed to start simulators:', error);
      process.exit(1);
    });
}

module.exports = { ESP32Simulator, simulateMultipleDevices };