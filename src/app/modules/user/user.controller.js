const httpStatus = require("http-status");

const userServices = require("./user.services");
const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");
const config = require("../../../config/config");

const checkUserExistusingPhone = catchAsyncError(async (req, res) => {
  const { phone } = req.body;
  const result = await userServices.getUserUsingPhoneFromDB(phone);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User checked successfully",
    data: result,
  });
});

const loginUserUsingPhoneAndPassword = catchAsyncError(async (req, res) => {
  const { phone, password } = req.body;

  const result = await userServices.loginUserInToDB({ phone, password });
  const { accessToken, refreshToken, userData } = result;

  if (accessToken && refreshToken && userData) {
    let cookieOptions = {
      secure: config.env === "production",
      httpOnly: false,
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOptions);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      userData,
      accessToken,
    },
  });
});

const createUser = catchAsyncError(async (req, res) => {
  const result = await userServices.createUserIntoDB(req.body);
  const { userData, accessToken, refreshToken } = result;

  if (accessToken && refreshToken && userData) {
    let cookieOptions = {
      secure: config.env === "production",
      httpOnly: false,
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("accessToken", accessToken, cookieOptions);
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: {
      userData,
      accessToken,
    },
  });
});

const forgotPassword = catchAsyncError(async (req, res) => {
  const { phone, newPassword } = req.body;

  const result = await userServices.updateUserPassword({
    phone,
    password: newPassword,
  });

  if (result.access_token && result.user) {
    let cookieOptions = {
      secure: config.env === "production",
      httpOnly: false,
    };

    res.cookie("refreshToken", result.refresh_token, cookieOptions);
    res.cookie("accessToken", result.access_token, cookieOptions);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful",
    data: {
      userData: result.user,
      accessToken: result.access_token,
    },
  });
});

const myProfileUsingToken = catchAsyncError(async (req, res) => {
  const result = await userServices.singleUserFromDB(req.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const getSignUpUserNumber = catchAsyncError(async (req, res) => {
  const range = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  };
  const result = await userServices.totalSignUpFromDB(range);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Signup user data fetched successfully",
    data: result,
  });
});

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

const logout = catchAsyncError(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
  });
});

const userController = {
  checkUserExistusingPhone,
  loginUserUsingPhoneAndPassword,
  updateUserProfile,
  createUser,
  getSignUpUserNumber,
  myProfileUsingToken,
  forgotPassword,
  logout,
};

module.exports = userController;
