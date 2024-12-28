// otp.router.js

const express = require("express");

const validateRequest = require("../../../Middleware/validateRequest");
const otpValidationSchema = require("./otp.validation");
const OtpController = require("./otp.controller");
const extractUserFromTokenMiddleware = require("../../../Middleware/userVerificationMiddleware");
const { authLimiter } = require("../../../Middleware/rateLimit.middleware");

const router = express.Router();

router.post(
  "/varify",
  extractUserFromTokenMiddleware,
  authLimiter,
  validateRequest(otpValidationSchema),
  OtpController.otpVerification
);

const otpRouter = router;
module.exports = otpRouter;
