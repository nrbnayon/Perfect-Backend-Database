// user.services.js
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const UserModel = require("./user.model");
const jwtHandle = require("../../../shared/createToken");
const config = require("../../../config/config");
const ErrorHandler = require("../../../ErrorHandler/errorHandler");
const passwordRefServices = require("../passwordRef/passwordRef.service");
const otpService = require("../otp/otp.services");
const PasswordResetToken = require("../../../Middleware/PasswordResetToken");
const { sendMail } = require("../../../utility/Emails");

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

// forgot password

const forgotPasswordInDB = async (email) => {
  console.log("Initiating password reset for email:", email);

  const isExistUser = await UserModel.findOne({ email, emailVerify: true });
  console.log("Found user:", isExistUser ? "Yes" : "No");

  if (!isExistUser) {
    throw new ErrorHandler(
      "No verified user found with this email address! 📭",
      httpStatus.NOT_FOUND,
      "❌"
    );
  }

  // Clear previous tokens for the user
  console.log("Clearing previous reset tokens for user:", isExistUser._id);
  await PasswordResetToken.deleteMany({ user: isExistUser._id });

  const tokenPayload = {
    userId: isExistUser._id.toString(),
    email: isExistUser.email,
    phone: isExistUser.phone || null,
  };

  console.log("Token payload:", tokenPayload);

  // Convert 1h to seconds for JWT
  const expiresIn = moment.duration(1, "hours").asSeconds();
  console.log("Token expires in (seconds):", expiresIn);

  const resetToken = await jwtHandle(
    tokenPayload,
    config.jwt_reset_key,
    expiresIn
  );

  const hashedToken = await bcrypt.hash(resetToken, 10);
  console.log("Token hashed successfully");

  // Save reset token in DB with expiration
  const expiresAt = moment().add(1, "hours").toDate();
  console.log("Token expires at:", expiresAt);

  await PasswordResetToken.create({
    user: isExistUser._id,
    token: hashedToken,
    expiresAt: expiresAt,
  });

  // Generate password reset link
  const resetUrl = `${config.frontend_url}/reset-password/${isExistUser._id}/${resetToken}`;
  const emailContent = `
    <h2>Hello ${isExistUser.firstname}!</h2>
    <p>You requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
  `;

  try {
    console.log("Sending reset password email to:", isExistUser.email);
    await sendMail(isExistUser.email, "Password Reset Request", emailContent);

    return {
      message: "Password reset link sent to email 📧",
      resetToken,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    await PasswordResetToken.deleteMany({ user: isExistUser._id });
    throw new ErrorHandler(
      "Error sending password reset email",
      httpStatus.INTERNAL_SERVER_ERROR,
      "📧"
    );
  }
};

const resetPasswordInDB = async (userId, token, newPassword) => {
  console.log("Initiating password reset with:", {
    userId,
    tokenLength: token.length,
  });

  try {
    const currentDate = moment().toDate();
    console.log("Current date:", currentDate);

    // Find the active reset token in database
    const passwordResetToken = await PasswordResetToken.findOne({
      user: userId.toString(),
      expiresAt: { $gt: currentDate },
    });

    console.log("Found reset token:", {
      exists: !!passwordResetToken,
      expiresAt: passwordResetToken?.expiresAt,
      isExpired: passwordResetToken?.expiresAt < currentDate,
    });

    if (!passwordResetToken) {
      throw new ErrorHandler(
        "Password reset link has expired or is invalid",
        httpStatus.BAD_REQUEST,
        "⌛"
      );
    }

    // Verify the JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, config.jwt_reset_key);
      console.log("Decoded token:", {
        userId: decodedToken.userId,
        email: decodedToken.email,
        exp: moment.unix(decodedToken.exp).format(),
      });
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      await PasswordResetToken.deleteMany({ user: userId });
      throw new ErrorHandler(
        "Invalid or expired reset link",
        httpStatus.BAD_REQUEST,
        "⌛"
      );
    }

    // Verify the token belongs to the correct user
    if (decodedToken.userId !== userId) {
      console.error("Token user mismatch:", {
        tokenUserId: decodedToken.userId,
        requestUserId: userId,
      });
      throw new ErrorHandler(
        "Invalid token for this user",
        httpStatus.BAD_REQUEST,
        "🔑"
      );
    }

    // Verify email in token matches stored email
    const user = await UserModel.findById(userId);
    console.log("Found user:", {
      exists: !!user,
      emailMatch: user?.email === decodedToken.email,
    });

    if (!user || user.email !== decodedToken.email) {
      throw new ErrorHandler(
        "Invalid token or user mismatch",
        httpStatus.BAD_REQUEST,
        "🔑"
      );
    }

    // Verify the token matches what's stored in database
    const isValidToken = await bcrypt.compare(token, passwordResetToken.token);
    console.log("Token validation:", { isValid: isValidToken });

    if (!isValidToken) {
      await PasswordResetToken.deleteMany({ user: userId });
      throw new ErrorHandler(
        "Invalid reset token",
        httpStatus.BAD_REQUEST,
        "🔑"
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      throw new ErrorHandler(
        "Password must be at least 8 characters long",
        httpStatus.BAD_REQUEST,
        "🔑"
      );
    }

    const plainPassword = newPassword;
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("New password hashed successfully");

    await passwordRefServices.collectRef(null, { _id: userId }, plainPassword);
    // Update user's password
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: hashedPassword,
          lastPasswordChange: moment().toDate(),
        },
      },
      { new: true }
    );

    console.log("Password updated for user:", {
      email: updatedUser?.email,
      lastPasswordChange: updatedUser?.lastPasswordChange,
    });

    if (!updatedUser) {
      throw new ErrorHandler("User not found", httpStatus.NOT_FOUND, "👤");
    }

    await PasswordResetToken.deleteMany({ user: userId });
    console.log("Reset tokens cleared for user");

    return {
      success: true,
      message: "Password reset successful 🔐",
      data: {
        email: updatedUser.email,
        lastPasswordChange: updatedUser.lastPasswordChange,
      },
    };
  } catch (error) {
    console.error("Password reset error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof ErrorHandler) {
      throw error;
    }

    if (error.name === "JsonWebTokenError") {
      throw new ErrorHandler(
        "Invalid reset token format",
        httpStatus.BAD_REQUEST,
        "⌛"
      );
    }

    if (error.name === "TokenExpiredError") {
      throw new ErrorHandler(
        "Reset token has expired",
        httpStatus.BAD_REQUEST,
        "⌛"
      );
    }

    throw new ErrorHandler(
      "Error resetting password",
      httpStatus.INTERNAL_SERVER_ERROR,
      "❌"
    );
  }
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
  forgotPasswordInDB,
  resetPasswordInDB,
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
