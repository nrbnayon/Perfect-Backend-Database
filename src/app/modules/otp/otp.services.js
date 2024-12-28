// otp.services.js
const { default: mongoose } = require("mongoose");
const config = require("../../../config/config");
const ConsoleLog = require("../../../utility/consoleLog");
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
    await OtpModel.deleteMany({ userId: user._id });

    // Generate a new OTP
    const otp = generateOTP();

    const hashedOtp = await bcrypt.hash(otp, 10);
    const newOtpData = {
      userId: user._id.toString(),
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

const verifyOTPinDB = async (otp, userId) => {
  console.log("Received OTP and userId:", otp, userId);

  const formattedUserId = new mongoose.Types.ObjectId(userId);

  // Find OTP records for the user
  const otpRecords = await OtpModel.aggregate([
    { $match: { userId: formattedUserId } },
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
  ]);

  console.log("Aggregated OTP records:", otpRecords);

  if (!otpRecords.length) {
    throw new Error("No OTP found for this user");
  }

  const otpRecord = otpRecords[0];

  // Check if OTP has expired
  if (new Date() > otpRecord.expiresAt) {
    await OtpModel.deleteOne({ _id: otpRecord._id });
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Verify OTP
  const isValidOTP = await bcrypt.compare(otp, otpRecord.otp);
  if (!isValidOTP) {
    throw new Error("Invalid OTP code.");
  }

  // Delete the used OTP
  await OtpModel.deleteOne({ _id: otpRecord._id });

  return {
    verified: true,
    message: "OTP verified successfully",
  };
};

const otpService = {
  sendOTP,
  verifyOTPinDB,
};

module.exports = otpService;
