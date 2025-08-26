const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs: windowMs || 15 * 60 * 1000,
    max: max || 100,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests from this IP, please try again later.',
        retryAfter: req.rateLimit.resetTime
      });
    }
  });
};

// Rate limiting for DoS protection as per PRD
// In production, each ESP32 would have a different IP
// For testing from localhost, we need higher limits to simulate multiple devices

const authLimiter = createRateLimiter(
  15 * 60 * 1000,  // 15 minute window (standard for IoT)
  300,  // 300 auth requests per 15 min from same IP (allows testing multiple devices)
  'Too many authentication attempts, please try again later.'
);

const dataLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000,  // 1 minute window
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,  // 200 data points per minute from same IP
  'Too many data submissions, please try again later.'
);

const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  1000,  // Increased to 1000 for load testing
  'Too many requests, please try again later.'
);

module.exports = {
  authLimiter,
  dataLimiter,
  generalLimiter
};