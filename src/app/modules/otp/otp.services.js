// otp.services.js
const config = require("../../../config/config");
const { sendMail } = require("../../../utility/Emails");
const { generateOTP } = require("../../../utility/GenerateOtp");
const OtpModel = require("./otp.model");
const otpValidationSchema = require("./otp.validation");
const bcrypt = require("bcryptjs");


const sendOTP = async (user) => {
  try {
    if (!user || !user._id) {
      throw new Error("User not found.");
    }

    // Remove existing OTPs for the user
    await OtpModel.deleteMany({ userID: user._id });

    // Generate a new OTP
    const otp = generateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);
    const newOtpData = {
      userID: user._id.toString(), 
      otp: hashedOtp,
      expiresAt: config.tokenExpirations.otp_time, 
    };

    // Validate the OTP data
    const { error } = otpValidationSchema.validate(newOtpData);
    if (error) {
      throw new Error(`Validation Error: ${error.details[0].message}`);
    }

    // Save the validated OTP to the database
    const newOtp = new OtpModel(newOtpData);
    await newOtp.save();

    // Send OTP to the user's email
    await sendMail(
      user.email,
      "Verification OTP Code",
      `<p>Your verification OTP code is: <strong>${otp}</strong></p>
       <p>This OTP is valid for <strong>5 minutes</strong>.</p>`
    );

    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    throw new Error(error.message || "Error sending OTP");
  }
};

const verifyOTP = async (otp) => {
  try {
    // Find the OTP in the database
    const otpRecord = await OtpModel.findOne({ otp: otp });
    if (!otpRecord) {
      throw new Error("Invalid OTP code.");
    }
  }


const SendNewOTP = {
  sendOTP,
  verifyOTP
};

module.exports = SendNewOTP;
