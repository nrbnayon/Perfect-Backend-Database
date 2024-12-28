const httpStatus = require("http-status");

const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");
const config = require("../../../config/config");

const otpVerification = catchAsyncError(async (req, res) => {
  const result = await SendNewOTP.verifyOTP(req.body);

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
