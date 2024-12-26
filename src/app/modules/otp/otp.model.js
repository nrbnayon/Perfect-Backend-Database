// otp.model.js
const mongoose = require("mongoose");
const otpModel = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const OtpModel = mongoose.model("Otp", otpModel);

module.exports = OtpModel;
