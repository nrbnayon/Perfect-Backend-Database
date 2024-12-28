// otp.validation.js
const Joi = require("joi");

// Validation schema for OTP
const otpValidationSchema = Joi.object({
  userID: Joi.string().required().messages({
    "string.base": "User ID must be a string.",
    "any.required": "User ID is required.",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP must be exactly 6 characters long.",
    "any.required": "OTP is required.",
  }),
  expiresAt: Joi.date().required().messages({
    "date.base": "ExpiresAt must be a valid date.",
    "any.required": "Expiration date is required.",
  }),
});

module.exports = otpValidationSchema;
