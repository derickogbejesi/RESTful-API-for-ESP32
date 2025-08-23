const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateSensorData = [
  body('temperature')
    .isFloat({ min: -40, max: 80 })
    .withMessage('Temperature must be between -40°C and 80°C'),
  body('humidity')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0% and 100%'),
  body('deviceId')
    .notEmpty()
    .isString()
    .matches(/^ESP32_[0-9]{3}$/)
    .withMessage('Device ID must follow format ESP32_XXX'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be in ISO 8601 format'),
  handleValidationErrors
];

const validateDeviceAuth = [
  body('deviceId')
    .notEmpty()
    .isString()
    .matches(/^ESP32_[0-9]{3}$/)
    .withMessage('Device ID must follow format ESP32_XXX'),
  body('deviceSecret')
    .notEmpty()
    .isString()
    .withMessage('Device secret is required'),
  handleValidationErrors
];

const validateDeviceId = [
  param('deviceId')
    .notEmpty()
    .isString()
    .matches(/^ESP32_[0-9]{3}$/)
    .withMessage('Device ID must follow format ESP32_XXX'),
  handleValidationErrors
];

module.exports = {
  validateSensorData,
  validateDeviceAuth,
  validateDeviceId,
  handleValidationErrors
};