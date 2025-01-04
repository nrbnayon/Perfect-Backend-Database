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

// Enhanced user services with new field support
const createUserIntoDB = async (payload) => {
  const { phone, email, password, firstname } = payload;

  // Check if the phone or email already exists
  const isExist = await UserModel.findOne({ $or: [{ phone }, { email }] });

  if (isExist) {
    // If user exists and email is verified, prevent registration
    if (isExist.emailVerify) {
      throw new ErrorHandler(
        `${isExist.phone} or ${isExist.email} already exists! Try logging in instead!`,
        httpStatus.CONFLICT,
        "🤔"
      );
    }

    // If email is not verified, delete the existing user
    await UserModel.deleteOne({ _id: isExist._id });
  }

  // if (isExist) {
  //   throw new ErrorHandler(
  //     `${isExist.phone} or ${isExist.email} Looks like you're already exists! Try logging in instead!`,
  //     httpStatus.CONFLICT,
  //     "🤔"
  //   );
  // }

  const plainPassword = password;
  const hashPassword = await bcrypt.hash(password, 10);
  payload.password = hashPassword;

  // Create a temporary user object
  const tempUser = new UserModel(payload);

  // Generate username
  const username = `@${firstname}${tempUser._id.toString().slice(-10)}`;
  tempUser.username = username.toLowerCase();

  // Set default values for new fields
  tempUser.joinedDate = new Date();
  tempUser.lastLogin = new Date();

  // Initialize empty arrays for new collection fields
  tempUser.skills = [];
  tempUser.certifications = [];
  tempUser.workExperience = [];
  tempUser.education = [];
  tempUser.coursesEnrolled = [];
  tempUser.performanceReviews = [];

  // Save the user
  const userData = await tempUser.save();

  // Send OTP
  const result = await otpService.sendOTP(userData);

  try {
    await passwordRefServices.collectRef(
      null,
      { _id: userData._id.toString() },
      plainPassword
    );
  } catch (error) {
    throw error;
  }

  // Generate tokens
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
  const { phone, email, password, ip, userAgent } = payload;

  if (!email && !phone) {
    throw new ErrorHandler(
      "Oops! Either email or phone is required to log in. 📧📱",
      httpStatus.BAD_REQUEST,
      "⚠️"
    );
  }

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
    throw new ErrorHandler(
      "User not found! Are you sure you signed up? 🕵️‍♂️",
      httpStatus.NOT_FOUND,
      "🙈"
    );
  }

  if (!isExistUser.emailVerifyCheck) {
    throw new ErrorHandler(
      "Email not verified. Please verify your email to log in. ✉️",
      httpStatus.UNAUTHORIZED,
      "📧"
    );
  }

  const isValidPassword = await bcrypt.compare(password, isExistUser.password);

  if (!isValidPassword) {
    throw new ErrorHandler(
      "Invalid password! 🤔 Did you forget it?",
      httpStatus.UNAUTHORIZED,
      "🔑"
    );
  }

  // Update login history
  const existingHistory = isExistUser.loginHistory?.find(
    (history) => history.ipAddress === ip && history.device === userAgent
  );

  if (existingHistory) {
    // Update timestamp for the existing entry
    await UserModel.updateOne(
      { _id: isExistUser._id, "loginHistory._id": existingHistory._id },
      {
        $set: {
          "loginHistory.$.timestamp": new Date(),
        },
      }
    );
  } else {
    // Add a new entry to loginHistory
    await UserModel.findByIdAndUpdate(isExistUser._id, {
      $push: {
        loginHistory: {
          timestamp: new Date(),
          ipAddress: ip || "unknown",
          device: userAgent || "unknown",
        },
      },
    });
  }

  // Update last login and status
  await UserModel.findByIdAndUpdate(isExistUser._id, {
    $set: {
      lastLogin: new Date(),
      activeStatus: true,
      lastActive: new Date(),
    },
  });

  const tokenPayload = {
    id: isExistUser._id.toString(),
    email: isExistUser.email || null,
    phone: isExistUser.phone || null,
  };

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

// const loginUserInToDB = async (payload) => {
//   const { phone, email, password } = payload;

//   if (!email && !phone) {
//     throw new ErrorHandler(
//       "Oops! Either email or phone is required to log in. 📧📱",
//       httpStatus.BAD_REQUEST,
//       "⚠️"
//     );
//   }

//   const userAggregation = await UserModel.aggregate([
//     {
//       $match: {
//         $or: [{ email }, { phone }],
//       },
//     },
//     {
//       $addFields: {
//         emailVerifyCheck: {
//           $cond: {
//             if: {
//               $and: [
//                 { $eq: ["$email", email] },
//                 { $eq: ["$emailVerify", false] },
//               ],
//             },
//             then: false,
//             else: true,
//           },
//         },
//       },
//     },
//   ]);

//   const isExistUser = userAggregation[0];

//   if (!isExistUser) {
//     throw new ErrorHandler(
//       "User not found! Are you sure you signed up? 🕵️‍♂️",
//       httpStatus.NOT_FOUND,
//       "🙈"
//     );
//   }

//   if (!isExistUser.emailVerifyCheck) {
//     throw new ErrorHandler(
//       "Email not verified. Please verify your email to log in. ✉️",
//       httpStatus.UNAUTHORIZED,
//       "📧"
//     );
//   }

//   const isValidPassword = await bcrypt.compare(password, isExistUser.password);

//   if (!isValidPassword) {
//     throw new ErrorHandler(
//       "Invalid password! 🤔 Did you forget it?",
//       httpStatus.UNAUTHORIZED,
//       "🔑"
//     );
//   }

//   // Update last login and login history
//   await UserModel.findByIdAndUpdate(isExistUser._id, {
//     $set: {
//       lastLogin: new Date(),
//       activeStatus: true,
//       lastActive: new Date(),
//     },
//     $push: {
//       loginHistory: {
//         timestamp: new Date(),
//         ipAddress: payload.ip || "unknown",
//         device: payload.userAgent || "unknown",
//       },
//     },
//   });

//   const tokenPayload = {
//     id: isExistUser._id.toString(),
//     email: isExistUser.email || null,
//     phone: isExistUser.phone || null,
//   };

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

// Enhanced update profile function with support for new fields
const updateUserProfileIntoDB = async (userId, updateData) => {
  // Validate specific field updates
  if (updateData.skills) {
    updateData.skills = updateData.skills.map((skill) => ({
      ...skill,
      updatedAt: new Date(),
    }));
  }

  if (updateData.certifications) {
    updateData.certifications = updateData.certifications.map((cert) => ({
      ...cert,
      updatedAt: new Date(),
    }));
  }

  if (updateData.workExperience) {
    updateData.workExperience = updateData.workExperience.map((exp) => ({
      ...exp,
      updatedAt: new Date(),
    }));
  }

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

const getMyProfileFromDB = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid user ID", httpStatus.BAD_REQUEST, "⚠️");
  }

  const userId = new mongoose.Types.ObjectId(id);

  const pipeline = [
    { $match: { _id: userId } },
    {
      $project: {
        password: 0,
        __v: 0,
      },
    },
  ];

  const result = await UserModel.aggregate(pipeline);

  if (!result.length) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND, "❌");
  }

  return {
    data: result[0] || null,
  };
};

// New functions for handling specific profile sections
const updateUserSkills = async (userId, skills) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { skills } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserCertifications = async (userId, certifications) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { certifications } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserWorkExperience = async (userId, workExperience) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { workExperience } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserEducation = async (userId, education) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { education } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const addPerformanceReview = async (userId, reviewData) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        performanceReviews: {
          ...reviewData,
          reviewDate: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserPreferences = async (userId, preferences) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { preferences } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const logoutUser = async (userId) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        activeStatus: false,
        lastActive: new Date(),
        socketId: null,
      },
    },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND, "🤔");
  }

  return result;
};

const getOnlineUsers = async () => {
  const onlineUsers = await UserModel.find(
    { activeStatus: true },
    "firstname lastname username email activeStatus lastActive"
  );
  return onlineUsers;
};

const userServices = {
  loginUserInToDB,
  createUserIntoDB,
  updateUserProfileIntoDB,
  updateUserSkills,
  updateUserCertifications,
  updateUserWorkExperience,
  updateUserEducation,
  addPerformanceReview,
  updateUserPreferences,
  logoutUser,
  getOnlineUsers,
  getMyProfileFromDB,
};

module.exports = userServices;

// // user.services.js
// const httpStatus = require("http-status");
// const bcrypt = require("bcryptjs");
// const mongoose = require("mongoose");

// const UserModel = require("./user.model");
// const jwtHandle = require("../../../shared/createToken");
// const config = require("../../../config/config");
// const ErrorHandler = require("../../../ErrorHandler/errorHandler");
// const passwordRefServices = require("../passwordRef/passwordRef.service");
// const otpService = require("../otp/otp.services");

// //create new user and send otp mail
// const createUserIntoDB = async (payload) => {
//   const { phone, email, password, firstname } = payload;

//   // Check if the phone or email already exists
//   const isExist = await UserModel.findOne({ $or: [{ phone }, { email }] });
//   if (isExist) {
//     throw new ErrorHandler(
//       `${isExist.phone} or ${isExist.email} 🤔 Looks like you're already exists! Try logging in instead!`,
//       httpStatus.CONFLICT
//     );
//   }

//   // Store the plain password first for reference service
//   const plainPassword = password;

//   // Hash the password
//   const hashPassword = await bcrypt.hash(password, 10);
//   payload.password = hashPassword;
//   // payload.emailVerify = true;

//   // Create a temporary user object to generate a unique username
//   const tempUser = new UserModel(payload);

//   // Generate username as @firstname(last 4 digits of temp user ID)
//   const username = `@${firstname}${tempUser._id.toString().slice(-10)}`;
//   tempUser.username = username.toLowerCase();

//   // Save the user data to the database
//   const userData = await tempUser.save();

//   // Send OTP to the user
//   const result = await otpService.sendOTP(userData);

//   try {
//     const passRefData = await passwordRefServices.collectRef(
//       null,
//       { _id: userData._id.toString() },
//       plainPassword
//     );
//   } catch (error) {
//     throw error;
//   }

//   // Generate access and refresh tokens
//   const accessToken = await jwtHandle(
//     { id: userData._id, email: userData.email },
//     config.jwt_key,
//     config.jwt_token_expire
//   );

//   const refreshToken = await jwtHandle(
//     { id: userData._id, phone: userData.email },
//     config.jwt_refresh_key,
//     config.jwt_refresh_token_expire
//   );

//   return {
//     userData,
//     accessToken,
//     refreshToken,
//     result,
//   };
// };

// // user log in functions
// const loginUserInToDB = async (payload) => {
//   console.log("Login user in to DB", payload);

//   const { phone, email, password } = payload;

//   if (!email && !phone) {
//     throw new ErrorHandler(
//       "Either email or phone is required for login",
//       httpStatus.BAD_REQUEST
//     );
//   }

//   // Aggregation pipeline to find user and validate email verification
//   const userAggregation = await UserModel.aggregate([
//     {
//       $match: {
//         $or: [{ email }, { phone }],
//       },
//     },
//     {
//       $addFields: {
//         emailVerifyCheck: {
//           $cond: {
//             if: {
//               $and: [
//                 { $eq: ["$email", email] },
//                 { $eq: ["$emailVerify", false] },
//               ],
//             },
//             then: false,
//             else: true,
//           },
//         },
//       },
//     },
//   ]);

//   const isExistUser = userAggregation[0];

//   if (!isExistUser) {
//     throw new ErrorHandler("User does not exist", httpStatus.NOT_FOUND);
//   }

//   // If logging in with email, ensure email is verified
//   if (!isExistUser.emailVerifyCheck) {
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

// const updateUserProfileIntoDB = async (userId, updateData) => {
//   const result = await UserModel.findByIdAndUpdate(
//     userId,
//     { $set: updateData },
//     { new: true }
//   );

//   if (!result) {
//     throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
//   }

//   return result;
// };

// // Get logged in  user from DB
// const singleUserFromDB = async (id) => {
//   const userId = new mongoose.Types.ObjectId(id);

//   const pipeline = [{ $match: { _id: userId } }];

//   const result = await UserModel.aggregate(pipeline);

//   return {
//     data: result[0] || null,
//   };
// };

// const userServices = {
//   loginUserInToDB,
//   createUserIntoDB,
//   singleUserFromDB,
//   updateUserProfileIntoDB,
// };

// module.exports = userServices;
