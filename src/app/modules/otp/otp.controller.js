// otp.controller.js

const httpStatus = require("http-status");

const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");

const otpVerification = catchAsyncError(async (req, res) => {
  const result = await SendNewOTP.verifyOTPinDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Otp verified successfully",
    data: result,
  });
});

const OtpController = {
  otpVerification,
};

module.exports = OtpController;
