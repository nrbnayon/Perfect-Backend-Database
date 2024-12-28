// otp.validation.js
const Joi = require("joi");

// Validation schema for OTP
const otpValidationSchema = Joi.object({
  userId: Joi.string().messages({
    "string.base": "User ID must be a string.",
    "any.required": "User ID is required.",
  }),
  otp: Joi.string().required().messages({
    "any.required": "OTP is required.",
  }),
  expiresAt: Joi.date().messages({
    "date.base": "ExpiresAt must be a valid date.",
    "any.required": "Expiration date is required.",
  }),
});

module.exports = otpValidationSchema;
