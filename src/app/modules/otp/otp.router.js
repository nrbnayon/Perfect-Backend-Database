const express = require("express");

const validateRequest = require("../../../Middleware/validateRequest");
const otpValidationSchema = require("./otp.validation");
const OtpController = require("./otp.controller");

const router = express.Router();

router.post(
  "/varify-otp",
  validateRequest(otpValidationSchema),
  OtpController.otpVerification
);

module.exports = router;
