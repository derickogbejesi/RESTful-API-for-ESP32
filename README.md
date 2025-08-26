# RESTful ESP32-Firebase IoT Gateway

## Project Overview

This project implements a secure RESTful API gateway that facilitates communication between ESP32 IoT devices and Firebase cloud infrastructure. The gateway addresses critical security challenges in IoT systems through comprehensive authentication, rate limiting, and data validation mechanisms.

### Key Features

- **JWT-based Authentication**: Secure stateless authentication for IoT devices
- **Rate Limiting**: DoS protection with configurable limits per endpoint
- **Real-time Data Processing**: Seamless integration with Firebase Realtime Database
- **ESP32 Device Support**: Optimized for resource-constrained IoT devices
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
- **Cache**: Redis 4.5.1
- **Authentication**: JSON Web Tokens (JWT)
- **Testing**: Jest, JMeter 5.6.3
- **IoT Devices**: ESP32 with Arduino framework

## Prerequisites

- Node.js 18.x or higher
- Redis server
- Firebase project with Realtime Database
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/RESTful-ESP32.git
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
- File name: `iot-gateway-8ec36-firebase-adminsdk-fbsvc-613f092efd.json`
- This file is gitignored for security

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

### Performance Metrics

- **Average Response Time**: 375.27ms
- **Success Rate**: 65.41% (with rate limiting active)
- **Authentication Success**: 98%
- **Concurrent Devices Supported**: 61
- **Throughput**: 2.16 requests/second

## ESP32 Device Simulation

### Run Device Simulator

```bash
node simulator/esp32-simulator.js
```

This simulates multiple ESP32 devices sending sensor data to the gateway.

## Project Structure

```
RESTful-ESP32/
├── config/           # Configuration files
├── middleware/       # Express middleware
│   ├── auth.js      # JWT authentication
│   ├── rateLimiter.js # Rate limiting
│   └── validation.js # Input validation
├── routes/          # API routes
│   ├── auth.js      # Authentication endpoints
│   ├── sensor.js    # Sensor data endpoints
│   └── health.js    # Health check endpoint
├── simulator/       # ESP32 device simulator
├── tests/           # Test suites
│   ├── unit/        # Unit tests
│   ├── integration/ # Integration tests
│   └── load/        # Load tests
├── analysis/        # Performance analysis
│   ├── jmeter-report/ # JMeter HTML reports
│   └── *.md         # Analysis documentation
├── docs/            # API documentation
├── server.js        # Application entry point
└── package.json     # Dependencies

```

## Security Features

1. **Authentication**: JWT-based stateless authentication
2. **Rate Limiting**: Per-endpoint request throttling
3. **Input Validation**: Joi schema validation
4. **HTTPS**: TLS encryption for all communications
5. **Firebase Security Rules**: Row-level access control
6. **Password Security**: Bcrypt hashing with salt rounds
7. **CORS**: Configured cross-origin resource sharing

## Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Ensure Redis server is running: `redis-cli ping`
   - Check Redis configuration in `.env`

2. **Firebase Authentication Error**
   - Verify service account JSON file exists in `config/`
   - Check Firebase project settings

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -i :3000`

4. **JWT Token Invalid**
   - Check JWT_SECRET in `.env`
   - Verify token expiration settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is developed as part of an academic dissertation for the CMP9140 Research Project module.

## Author

Tony [Your Last Name]
University of [Your University]

## Acknowledgments

- Supervisor: [Supervisor Name]
- Firebase for cloud infrastructure
- Express.js community for framework support
- JMeter team for performance testing tools

## Dissertation Documentation

For detailed implementation and analysis, refer to:
- Chapter 4: Implementation (`analysis/Chapter4-Implementation.md`)
- Chapter 5: Results and Evaluation (`analysis/Chapter5-Results-Evaluation.md`)
- JMeter Analysis (`analysis/JMeter-Results-Analysis.md`)