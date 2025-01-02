// user.services.js
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserModel = require("./user.model");
const JoiUserValidationSchema = require("./user.validation");
const jwtHandle = require("../../../shared/createToken");
const config = require("../../../config/config");
const ErrorHandler = require("../../../ErrorHandler/errorHandler");
const ConsoleLog = require("../../../utility/consoleLog");
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

    ConsoleLog("Password reference created:", passRefData);
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

const getUserUsingPhoneFromDB = async (phone) => {
  const isExist = await UserModel.findOne({ phone: phone });

  if (isExist) {
    throw new ErrorHandler(
      `${isExist.phone} This Phone Number is Exist! please use another!`,
      httpStatus.CONFLICT
    );
  }

  const otpType = "registation_number_varification";
  let requestPayload = {
    userNumber: phone,
    otpType,
    otpMassage:
      "Your One Time Password For Signup or Login. This OTP is valid for 5 minutes.",
  };

  // Validate OTP payload
  const { error } =
    JoiUserValidationSchema.phoneOTPVarificationSchema.validate(requestPayload);

  if (error) {
    throw new ErrorHandler(
      `${error}` || "Something went wrong",
      httpStatus.BAD_REQUEST
    );
  }

  return {
    phone,
  };
};

// const loginUserInToDB = async (payload) => {
//   console.log("Login user in to DB", payload);

//   const { phone, email, password } = payload;

//   // Ensure at least one of email or phone is provided
//   if (!email && !phone) {
//     throw new ErrorHandler(
//       "Either email or phone is required for login",
//       httpStatus.BAD_REQUEST
//     );
//   }

//   // Find user by email or phone
//   const isExistUser = await UserModel.findOne({
//     ...(email && { email }), // Add email to query if provided
//     ...(phone && { phone }), // Add phone to query if provided
//   });

//   if (!isExistUser) {
//     throw new ErrorHandler("User does not exist", httpStatus.NOT_FOUND);
//   }

//   // Check email verification status if logging in with email
//   if (email && !isExistUser.emailVerify) {
//     throw new ErrorHandler(
//       "Email is not verified. Please verify your email to log in.",
//       httpStatus.UNAUTHORIZED
//     );
//   }

//   // Validate the password
//   const isValidPassword = await bcrypt.compare(password, isExistUser.password);

//   if (!isValidPassword) {
//     throw new ErrorHandler(
//       "Please enter a valid password!",
//       httpStatus.UNAUTHORIZED
//     );
//   }

//   // Prepare token payload
//   const tokenPayload = {
//     _id: isExistUser._id,
//     email: isExistUser.email || null,
//     phone: isExistUser.phone || null,
//   };

//   // Generate tokens
//   const accessToken = await jwtHandle(
//     tokenPayload,
//     config.jwt_key,
//     config.jwt_token_expire
//   );

//   const refreshToken = await jwtHandle(
//     tokenPayload,
//     config.jwt_refresh_key,
//     config.jwt_refresh_token_expire
//   );

//   return {
//     userData: isExistUser,
//     accessToken,
//     refreshToken,
//   };
// };

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

const updateUserPassword = async (payload) => {
  const { phone, password } = payload;
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await UserModel.findOneAndUpdate(
    { phone },
    { $set: { password: hashPassword } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User does not exist", httpStatus.NOT_FOUND);
  }

  const access_token = await jwtHandle(
    { _id: result._id, phone: result.phone, email: result.email },
    config.jwt_key,
    config.jwt_token_expire
  );

  const refresh_token = await jwtHandle(
    { _id: result._id, phone: result.phone, email: result.email },
    config.jwt_refresh_key,
    config.jwt_refresh_token_expire
  );

  return {
    user: result,
    access_token,
    refresh_token,
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

const singleUserFromDB = async (id) => {
  const objectId = new mongoose.Types.ObjectId(id);

  const pipeline = [
    { $match: { _id: objectId } },
    {
      $lookup: {
        from: "candidateprofiles",
        localField: "_id",
        foreignField: "candidateId",
        as: "candidateProfileInfo",
      },
    },
    {
      $unwind: {
        path: "$candidateProfileInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const result = await UserModel.aggregate(pipeline);

  return {
    data: result[0] || null,
  };
};

const totalSignUpFromDB = async ({ startDate, endDate }, deviceLog) => {
  const matchConditions = [];

  if (startDate && endDate) {
    matchConditions.push({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });
  }

  if (deviceLog) {
    matchConditions.push({
      device: deviceLog,
    });
  }

  const result = await UserModel.countDocuments(
    matchConditions.length > 0 ? { $and: matchConditions } : {}
  );

  return {
    total: result,
  };
};

const userServices = {
  getUserUsingPhoneFromDB,
  loginUserInToDB,
  createUserIntoDB,
  updateUserPassword,
  singleUserFromDB,
  totalSignUpFromDB,
  updateUserProfileIntoDB,
};

module.exports = userServices;
