// user.model.js
const mongoose = require("mongoose");
const validator = require("validator");
const userModel = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please enter Your First Name"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Please enter Your Last Name"],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      length: [11, "Phone number must be 11 digits"],
      trim: true,
    },
    phoneVerify: {
      type: Boolean,
      default: false,
    },
    emailVerify: {
      type: Boolean,
      default: false,
    },
    userStatus: {
      type: String,
      enum: ["Active", "Block", "Restricted"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["2001", "1999"],
      default: "1999",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userModel);

module.exports = UserModel;
