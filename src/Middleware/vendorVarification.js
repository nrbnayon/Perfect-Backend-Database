const config = require("../config/config");
const jwt = require("jsonwebtoken");
const VendorModel = require("../app/modules/vendor/vendor.model");
const ErrorHandler = require("../ErrorHandler/errorHandler");

const vendorVerification = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split(" ")[1];
  try {
    // console.log("first....: ", token);
    if (!token || !authorization) {
      throw new ErrorHandler("Please login to access the resource", 401);
    }

    const decoded = jwt.verify(token, config.jwt_key_vendor);
    // console.log("decoded....: ", decoded);
    const { phone, userId } = decoded;
    // console.log("phone from middleware....:", phone);
    // console.log("userId from middleware....:", userId);
    req.phone = phone;

    const rootUser = await VendorModel.findOne({ _id: userId });
    if (!rootUser) {
      throw new ErrorHandler("Vendor not found", 404);
    }
    req.vendor = rootUser;
    req.vendorID = userId;

    next();
  } catch (error) {
    next("Authentication Failed!");
  }
};
module.exports = vendorVerification;

// const jwt = require("jsonwebtoken");
// const ErrorHandler = require("../ErrorHandler/errorHandler");

// const httpStatus = require("http-status");
// const config = require("../config/config");
// const jwtHandle = require("../shared/createToken");
// const UserModel = require("../app/modules/user/user.model");

// const authVerification = async (req, res, next) => {
//   try {
//     let token;

//     if (req.cookies.accessToken) {
//       token = req.cookies.accessToken;
//     } else {
//       const { authorization } = req.headers;

//       token = authorization?.split(" ")[1];
//     }
//     if (!token) {
//       throw new ErrorHandler("Please login to access the resource", 401);
//     }

//     let decoded;

//     try {
//       decoded = jwt.verify(token, config.jwt_key);
//       const { email, userId } = decoded;
//       req.email = email;

//       const rootUser = await UserModel.findOne({ email: email });

//       if (!rootUser) {
//         throw new ErrorHandler("User not found", 404);
//       }

//       req.user = rootUser;
//       req.userId = userId;
//       req.email = email;
//     } catch (error) {
//       if (error.name === "TokenExpiredError") {
//         // Access token has expired, try to refresh it using the refreshToken
//         const refreshToken = req.cookies.refreshToken;
//         if (!refreshToken) {
//           throw new ErrorHandler(
//             "Access token expired. Please login again.",
//             401
//           );
//         }

//         try {
//           // Verify the refreshToken and check for validity
//           const refreshTokenDecoded = jwt.verify(
//             refreshToken,
//             config.jwt_refresh_key
//           );
//           const { email, userId } = refreshTokenDecoded;

//           // If the refreshToken is valid, generate a new accessToken
//           const newAccessToken = await jwtHandle(
//             { id: userId, email: email },
//             config.jwt_key,
//             config.jwt_token_expire
//           );

//           req.cookies.accessToken = newAccessToken;

//           //
//           if (newAccessToken) {
//             let cookieOptions = {
//               secure: config.env === "production",
//               httpOnly: true,
//             };
//             res.cookie("accessToken", newAccessToken, cookieOptions);
//           }

//           const rootUser = await UserModel.findOne({ email: email });

//           if (!rootUser) {
//             throw new ErrorHandler("User not found", 404);
//           }

//           req.user = rootUser;
//           req.userId = userId;
//           req.email = email;
//         } catch (error) {
//           console.log(error);
//           throw new ErrorHandler(
//             "Refresh token is invalid. Please login again.",
//             401
//           );
//         }
//       } else {
//         throw error;
//       }
//     }
//     // Continue with the next middleware
//     next();
//   } catch (error) {
//     next(error, httpStatus.UNAUTHORIZED);
//   }
// };

// module.exports = authVerification;
