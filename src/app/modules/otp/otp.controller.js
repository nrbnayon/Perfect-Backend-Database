// otp.controller.js

const httpStatus = require("http-status");

const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");
const otpService = require("./otp.services");

const otpVerification = catchAsyncError(async (req, res) => {
  console.log("otp data", req.body);
  const { otp } = req.body;
  const { userId } = req.user;
  const result = await otpService.verifyOTPinDB(otp, userId);

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
