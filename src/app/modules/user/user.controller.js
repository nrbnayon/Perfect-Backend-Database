// user.controller.js
const httpStatus = require("http-status");
const userServices = require("./user.services");
const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");
const config = require("../../../config/config");

// Enhanced user controller with new field support
const createUser = catchAsyncError(async (req, res) => {
  try {
    // Call the service to create the user in the database
    const result = await userServices.createUserIntoDB(req.body);
    const { userData, accessToken, refreshToken } = result;

    // Check if the tokens and user data exist before proceeding
    if (accessToken && refreshToken && userData) {
      const cookieOptions = {
        httpOnly: true,
        secure: config.env === "true",
        sameSite: config.env === "true" ? "Strict" : "Lax",
        maxAge: parseInt(config.jwt_token_expire, 10) * 1000,
      };

      // Set cookies for the tokens
      res.cookie("refreshToken", refreshToken, cookieOptions);
      res.cookie("accessToken", accessToken, cookieOptions);
    } else {
      throw new Error("Missing tokens or user data during user creation");
    }

    // Send the response after ensuring cookies are set
    return sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "🎉 User created successfully 🚀",
      data: {
        userData,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in createUser:", error.message);

    // Return an error response
    return sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: `${error?.emoji} ${error?.message}`,
      data: { error: error.message },
    });
  }
});

const loginUserUsingEmailOrPhoneAndPassword = catchAsyncError(
  async (req, res) => {
    const { email, phone, password } = req.body;

    const loginPayload = {
      email,
      phone,
      password,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    try {
      const result = await userServices.loginUserInToDB(loginPayload);
      const { accessToken, refreshToken, userData } = result;

      if (accessToken && refreshToken && userData) {
        const cookieOptions = {
          httpOnly: true,
          secure: config.env === "true",
          sameSite: config.env === "true" ? "Strict" : "Lax",
          maxAge: parseInt(config.jwt_token_expire, 10) * 1000,
        };

        res.cookie("refreshToken", refreshToken, cookieOptions);
        res.cookie("accessToken", accessToken, cookieOptions);

        return sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "🎉 User logged in successfully! Welcome back! 🚀",
          data: {
            userData,
            accessToken,
          },
        });
      }

      throw new ErrorHandler(
        "Login failed: Missing tokens or user data. 🤷‍♂️",
        httpStatus.INTERNAL_SERVER_ERROR,
        "😢"
      );
    } catch (error) {
      console.error("Login error:", error.message);
      return sendResponse(res, {
        statusCode: error.statusCode || httpStatus.UNAUTHORIZED,
        success: false,
        message: `${error.emoji} ${error.message}`,
        data: null,
      });
    }
  }
);

const updateUserProfile = catchAsyncError(async (req, res) => {
  const updateData = req.body;
  const result = await userServices.updateUserProfileIntoDB(
    req.userId,
    updateData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

// New controller functions for specific profile sections
const updateUserSkills = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserSkills(
    req.userId, // This comes from auth middleware
    req.body.skills // This is the array of skills
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Skills updated successfully",
    data: result || null,
  });
});

const updateUserCertifications = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserCertifications(
    req.userId,
    req.body.certifications
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certifications updated successfully",
    data: result || null,
  });
});

const updateUserWorkExperience = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserWorkExperience(
    req.userId,
    req.body.workExperience
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Work experience updated successfully",
    data: result,
  });
});

const updateUserEducation = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserEducation(
    req.userId,
    req.body.education
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Education details updated successfully",
    data: result,
  });
});

const addPerformanceReview = catchAsyncError(async (req, res) => {
  const result = await userServices.addPerformanceReview(
    req.userId,
    req.body.reviewData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${error?.emoji} ${error?.message} || "Performance review added successfully"`,
    data: result,
  });
});

const updateUserPreferences = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserPreferences(
    req.userId,
    req.body.preferences
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${error?.emoji} ${error?.message} || "User preferences updated successfully"`,
    data: result,
  });
});

const updateUserPreference = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserPreferences(
    req.userId,
    req.body.preferences
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${error?.emoji} ${error?.message} || "User preferences updated successfully"`,
    data: result,
  });
});

// forgot password

const forgotPassword = catchAsyncError(async (req, res) => {
  console.log("first time forgot password", req.body);
  try {
    const { email } = req.body;
    const result = await userServices.forgotPasswordInDB(email);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset link sent successfully! 📧",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: `${error?.emoji || "😢"} ${error.message}`,
      data: null,
    });
  }
});

const resetPassword = catchAsyncError(async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // If using `auth()`, get user ID from `req.user`, else use `req.body.userId`
    const userId = req.user?._id || req.body.userId;

    if (newPassword !== confirmPassword) {
      throw new ErrorHandler(
        "Passwords must match",
        httpStatus.BAD_REQUEST,
        "❌"
      );
    }
    console.log("reset password result", userId);

    const result = await userServices.resetPasswordInDB(
      userId,
      token,
      newPassword
    );

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully! 🔐",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: `${error?.emoji || "😢"} ${error.message}`,
      data: null,
    });
  }
});

const logout = catchAsyncError(async (req, res) => {
  const { _id } = req.user;

  try {
    await userServices.logoutUser(_id || req.user._id || req.user.userId);

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logged out successfully 🚀",
      data: null,
    });
  } catch (error) {
    const errorMessage = `${error?.emoji || ""} ${error?.message || "Error logging out"}`;
    return sendResponse(res, {
      statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: errorMessage.trim(),
      data: null,
    });
  }
});

const getOnlineUsersList = catchAsyncError(async (req, res) => {
  const onlineUsers = await userServices.getOnlineUsers();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Online users retrieved successfully",
    data: onlineUsers,
  });
});

const myProfileUsingToken = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(
      new ErrorHandler("User not authenticated", httpStatus.UNAUTHORIZED, "⚠️")
    );
  }

  try {
    const myProfile = await userServices.getMyProfileFromDB(userId);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: myProfile,
    });
  } catch (error) {
    next(error);
  }
});

const userController = {
  createUser,
  loginUserUsingEmailOrPhoneAndPassword,
  updateUserProfile,
  myProfileUsingToken,
  updateUserSkills,
  updateUserCertifications,
  updateUserWorkExperience,
  updateUserEducation,
  addPerformanceReview,
  updateUserPreference,
  forgotPassword,
  resetPassword,
  logout,
  getOnlineUsersList,
};

module.exports = userController;
// // user.controller.js

// const httpStatus = require("http-status");

// const userServices = require("./user.services");
// const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
// const sendResponse = require("../../../shared/sendResponse");
// const config = require("../../../config/config");

// const createUser = catchAsyncError(async (req, res) => {
//   const result = await userServices.createUserIntoDB(req.body);
//   const { userData, accessToken, refreshToken } = result;

//   if (accessToken && refreshToken && userData) {
//     let cookieOptions = {
//       httpOnly: true,
//       secure: config.env === "true",
//       sameSite: config.env === "true" ? "Strict" : "Lax",
//       maxAge: parseInt(config.jwt_token_expire) * 1000,
//     };

//     res.cookie("refreshToken", refreshToken, cookieOptions);
//     res.cookie("accessToken", accessToken, cookieOptions);
//   }

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "User created successfully",
//     data: {
//       userData,
//       accessToken,
//     },
//   });
// });

// const loginUserUsingEmailOrPhoneAndPassword = catchAsyncError(
//   async (req, res) => {
//     const { email, phone, password } = req.body;

//     const result = await userServices.loginUserInToDB({
//       email,
//       phone,
//       password,
//     });
//     const { accessToken, refreshToken, userData } = result;

//     if (accessToken && refreshToken && userData) {
//       let cookieOptions = {
//         httpOnly: true,
//         secure: config.env === "true",
//         sameSite: config.env === "true" ? "Strict" : "Lax",
//         maxAge: parseInt(config.jwt_token_expire) * 1000,
//       };

//       res.cookie("refreshToken", refreshToken, cookieOptions);
//       res.cookie("accessToken", accessToken, cookieOptions);
//     }

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "User logged in successfully",
//       data: {
//         userData,
//         accessToken,
//       },
//     });
//   }
// );

// const forgotPassword = catchAsyncError(async (req, res) => {
//   const { email, newPassword } = req.body;

//   const result = await userServices.updateUserPassword({
//     email,
//     password: newPassword,
//   });

//   if (result.access_token && result.user) {
//     let cookieOptions = {
//       secure: config.env === "production",
//       httpOnly: false,
//     };

//     res.cookie("refreshToken", result.refresh_token, cookieOptions);
//     res.cookie("accessToken", result.access_token, cookieOptions);
//   }

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Password reset successful",
//     data: {
//       userData: result.user,
//       accessToken: result.access_token,
//     },
//   });
// });

// const myProfileUsingToken = catchAsyncError(async (req, res) => {
//   const result = await userServices.singleUserFromDB(req.userId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User profile fetched successfully",
//     data: result,
//   });
// });

// const updateUserProfile = catchAsyncError(async (req, res) => {
//   const updateData = req.body;

//   const result = await userServices.updateUserProfileIntoDB(
//     req.userId,
//     updateData
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User profile updated successfully",
//     data: result,
//   });
// });

// const logout = catchAsyncError(async (req, res) => {
//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Logged out successfully",
//   });
// });

// const userController = {
//   loginUserUsingEmailOrPhoneAndPassword,
//   updateUserProfile,
//   createUser,
//   myProfileUsingToken,
//   forgotPassword,
//   logout,
// };

// module.exports = userController;
