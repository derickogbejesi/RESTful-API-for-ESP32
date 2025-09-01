# RESTful ESP32-Firebase IoT Gateway

## Project Overview

This project implements a secure RESTful API gateway that facilitates communication between ESP32 IoT devices and Firebase cloud infrastructure. The gateway addresses critical security challenges in IoT systems through comprehensive authentication, rate limiting, and data validation mechanisms.

### Key Features

- **JWT-based Authentication**: Secure stateless authentication for IoT devices
- **Rate Limiting**: DoS protection with configurable limits per endpoint
- **Real-time Data Processing**: Seamless integration with Firebase Realtime Database
- **Comprehensive Security**: Input validation, HTTPS enforcement, and role-based access control
- **Scalable Architecture**: Three-tier design supporting 60+ concurrent devices

## System Architecture

The system implements a three-tier architecture:
1. **Edge Tier**: ESP32 IoT devices collecting sensor data
2. **Gateway Tier**: Node.js API gateway with Redis caching
3. **Cloud Tier**: Firebase Realtime Database for data persistence

## Technology Stack

- **Runtime**: Node.js 18.x LTS
- **Framework**: Express.js 4.18.2
- **Database**: Firebase Realtime Database
- **Authentication**: JSON Web Tokens (JWT)
- **Testing**: Jest, JMeter 5.6.3

## Prerequisites

- Node.js 18.x or higher
- Firebase project with Realtime Database
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/derickogbejesi/RESTful-API-for-ESP32.git
cd RESTful-ESP32
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRATION=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_AUTH=300  # requests per 15 minutes
RATE_LIMIT_DATA=200  # requests per minute
```

### 4. Setup Firebase Credentials

Place your Firebase service account JSON file in the `config/` directory:

### 5. Start Redis Server

```bash
redis-server
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new device/user |
| POST | `/api/auth/login` | Authenticate and receive JWT token |

### Device Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List all registered devices |
| POST | `/api/devices` | Register new device |
| DELETE | `/api/devices/:id` | Remove device |

### Sensor Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensor-data` | Submit sensor readings |
| GET | `/api/sensor-data/:deviceId` | Retrieve device data |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health status |

## Testing

### Run Unit Tests

```bash
npm test
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run Load Tests

```bash
npm run test:load
```

### Generate Test Coverage

```bash
npm run test:coverage
```

## Performance Testing with JMeter

### Run JMeter Tests

1. Open JMeter and load the test plan:
```bash
jmeter -t analysis/jmeter-test-plan.jmx
```

2. View the generated report:
```bash
open analysis/jmeter-report/index.html
```

### Run Device Simulator

```bash
node simulator/esp32-simulator.js
```
This simulates multiple ESP32 devices sending sensor data to the gateway.

## License

This project is developed as part of an academic dissertation for the CMP9140 Research Project module.

## Author

#### Derrick Ogbejesi

#### University of Lincoln
