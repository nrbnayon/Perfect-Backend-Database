// user.services.js
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserModel = require("./user.model");
const jwtHandle = require("../../../shared/createToken");
const config = require("../../../config/config");
const ErrorHandler = require("../../../ErrorHandler/errorHandler");
const passwordRefServices = require("../passwordRef/passwordRef.service");
const otpService = require("../otp/otp.services");

//create new user and send otp mail

const createUserIntoDB = async (payload) => {
  const { phone, email, password, firstname } = payload;

  // Check if the phone or email already exists
  const isExist = await UserModel.findOne({ $or: [{ phone }, { email }] });
  if (isExist) {
    throw new ErrorHandler(
      `${isExist.phone} or ${isExist.email} 🤔 Looks like you're already exists! Try logging in instead!`,
      httpStatus.CONFLICT
    );
  }

  // Store the plain password first for reference service
  const plainPassword = password;

  // Hash the password
  const hashPassword = await bcrypt.hash(password, 10);
  payload.password = hashPassword;
  // payload.emailVerify = true;

  // Create a temporary user object to generate a unique username
  const tempUser = new UserModel(payload);

  // Generate username as @firstname(last 4 digits of temp user ID)
  const username = `@${firstname}${tempUser._id.toString().slice(-10)}`;
  tempUser.username = username.toLowerCase();

  // Save the user data to the database
  const userData = await tempUser.save();

  // Send OTP to the user
  const result = await otpService.sendOTP(userData);

  try {
    const passRefData = await passwordRefServices.collectRef(
      null,
      { _id: userData._id.toString() },
      plainPassword
    );
  } catch (error) {
    throw error;
  }

  // Generate access and refresh tokens
  const accessToken = await jwtHandle(
    { id: userData._id, email: userData.email },
    config.jwt_key,
    config.jwt_token_expire
  );

  const refreshToken = await jwtHandle(
    { id: userData._id, phone: userData.email },
    config.jwt_refresh_key,
    config.jwt_refresh_token_expire
  );

  return {
    userData,
    accessToken,
    refreshToken,
    result,
  };
};

const loginUserInToDB = async (payload) => {
  console.log("Login user in to DB", payload);

  const { phone, email, password } = payload;

  if (!email && !phone) {
    throw new ErrorHandler(
      "Either email or phone is required for login",
      httpStatus.BAD_REQUEST
    );
  }

  // Aggregation pipeline to find user and validate email verification
  const userAggregation = await UserModel.aggregate([
    {
      $match: {
        $or: [{ email }, { phone }],
      },
    },
    {
      $addFields: {
        emailVerifyCheck: {
          $cond: {
            if: {
              $and: [
                { $eq: ["$email", email] },
                { $eq: ["$emailVerify", false] },
              ],
            },
            then: false,
            else: true,
          },
        },
      },
    },
  ]);

  const isExistUser = userAggregation[0];

  if (!isExistUser) {
    throw new ErrorHandler("User does not exist", httpStatus.NOT_FOUND);
  }

  // If logging in with email, ensure email is verified
  if (!isExistUser.emailVerifyCheck) {
    throw new ErrorHandler(
      "Email is not verified. Please verify your email to log in.",
      httpStatus.UNAUTHORIZED
    );
  }

  // Validate the password
  const isValidPassword = await bcrypt.compare(password, isExistUser.password);

  if (!isValidPassword) {
    throw new ErrorHandler(
      "Please enter a valid password!",
      httpStatus.UNAUTHORIZED
    );
  }

  // Prepare token payload
  const tokenPayload = {
    _id: isExistUser._id,
    email: isExistUser.email || null,
    phone: isExistUser.phone || null,
  };

  // Generate tokens
  const accessToken = await jwtHandle(
    tokenPayload,
    config.jwt_key,
    config.jwt_token_expire
  );

  const refreshToken = await jwtHandle(
    tokenPayload,
    config.jwt_refresh_key,
    config.jwt_refresh_token_expire
  );

  return {
    userData: isExistUser,
    accessToken,
    refreshToken,
  };
};

const updateUserProfileIntoDB = async (userId, updateData) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const userServices = {
  loginUserInToDB,
  createUserIntoDB,
  updateUserProfileIntoDB,
};

module.exports = userServices;
