const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensor');
const healthRoutes = require('./routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api', healthRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3000;

const startServer = () => {
  if (process.env.HTTPS_ENABLED === 'true' && 
      fs.existsSync(process.env.SSL_CERT_PATH) && 
      fs.existsSync(process.env.SSL_KEY_PATH)) {
    
    const httpsOptions = {
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      key: fs.readFileSync(process.env.SSL_KEY_PATH)
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`HTTPS Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`HTTP Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      if (process.env.NODE_ENV === 'production') {
        console.warn('WARNING: Running in production without HTTPS!');
      }
    });
  }
};

startServer();