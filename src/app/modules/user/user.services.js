const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserModel = require("./user.model");
const JoiUserValidationSchema = require("./user.validation");
const jwtHandle = require("../../../shared/createToken");
const config = require("../../../config/config");
const ErrorHandler = require("../../../ErrorHandler/errorHandler");
const ConsoleLog = require("../../../utility/consoleLog");

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
      "Your One Time Password For Signup or Login. This OTP is valid for 5 minutes. Talently ltd",
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

const loginUserInToDB = async (payload) => {
  const { phone, password } = payload;

  const isExistUser = await UserModel.findOne({ phone });

  if (!isExistUser) {
    throw new ErrorHandler("User does not exist", httpStatus.NOT_FOUND);
  }

  const isValidPassword = await bcrypt.compare(password, isExistUser.password);

  if (!isValidPassword) {
    throw new ErrorHandler(
      "Please Enter Valid password or Phone!!",
      httpStatus.UNAUTHORIZED
    );
  }

  const accessToken = await jwtHandle(
    { _id: isExistUser._id, phone: isExistUser.phone },
    config.jwt_key,
    config.jwt_token_expire
  );

  const refreshToken = await jwtHandle(
    { _id: isExistUser._id, phone: isExistUser.phone },
    config.jwt_refresh_key,
    config.jwt_refresh_token_expire
  );

  return {
    userData: isExistUser,
    accessToken,
    refreshToken,
  };
};

const createUserIntoDB = async (payload) => {
  ConsoleLog(
    "🚀 ~ file: user.services.js ~ line 68 ~ createUserIntoDB ~ payload",
    payload
  );
  const { phone, email } = payload;

  const isExist = await UserModel.findOne({ $or: [{ phone }, { email }] });

  if (isExist) {
    throw new ErrorHandler(
      `${isExist.phone} or ${isExist.email} already exists! Please use another!`,
      httpStatus.CONFLICT
    );
  }

  const hashPassword = await bcrypt.hash(payload.password, 10);

  payload.password = hashPassword;
  payload.phoneEmail = true;

  const newUser = new UserModel(payload);
  const userData = await newUser.save();

  const accessToken = await jwtHandle(
    { _id: userData._id, phone: userData.email },
    config.jwt_key,
    config.jwt_token_expire
  );

  const refreshToken = await jwtHandle(
    { _id: userData._id, phone: userData.email },
    config.jwt_refresh_key,
    config.jwt_refresh_token_expire
  );

  return {
    userData,
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
