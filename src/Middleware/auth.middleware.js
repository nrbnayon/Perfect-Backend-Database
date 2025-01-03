const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const ErrorHandler = require("../ErrorHandler/errorHandler");
const config = require("../config/config");
const UserModel = require("../app/modules/user/user.model");

const auth = (...requiredRoles) => {
  return async (req, res, next) => {
    console.log("auth middleware ", req.body);

    try {
      // Get token from various sources
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "") ||
        req.headers["x-access-token"];

      console.log("auth token ", token);

      if (!token) {
        throw new ErrorHandler(
          "You are not authorized to access this resource",
          httpStatus.UNAUTHORIZED
        );
      }

      // Verify token
      let decoded;
      console.log("decoded token", decoded);
      try {
        decoded = jwt.verify(token, config.jwt_key);
        console.log("decoded token", decoded);

        //   const decoded = jwt.verify(token, config.jwt_key);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          throw new ErrorHandler(
            "Your session has expired. Please log in again",
            httpStatus.UNAUTHORIZED
          );
        }
        throw new ErrorHandler(
          "Invalid authentication token",
          httpStatus.UNAUTHORIZED
        );
      }

      // Check if user still exists
      const user = await UserModel.findById(decoded.id || decoded._id);

      if (!user) {
        throw new ErrorHandler(
          "The user belonging to this token no longer exists",
          httpStatus.UNAUTHORIZED
        );
      }

      // Check if user is blocked or restricted
      if (user.userStatus !== "Active") {
        throw new ErrorHandler(
          "Your account has been deactivated. Please contact support.",
          httpStatus.FORBIDDEN
        );
      }

      // Check if user's email is verified (if using email)
      if (decoded.email && !user.emailVerify) {
        throw new ErrorHandler(
          "Please verify your email to access this resource",
          httpStatus.FORBIDDEN
        );
      }

      // Check if user has required roles
      if (requiredRoles.length > 0) {
        const userRole = user.role;
        const hasRequiredRole = requiredRoles.includes(userRole);

        if (!hasRequiredRole) {
          throw new ErrorHandler(
            "You do not have permission to perform this action",
            httpStatus.FORBIDDEN
          );
        }
      }

      // Handle admin-only routes
      if (requiredRoles.includes("admin") && !user.isAdmin) {
        throw new ErrorHandler(
          "This route is restricted to administrators",
          httpStatus.FORBIDDEN
        );
      }

      // If all checks pass, set user info in request
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
      req.isAdmin = user.isAdmin;

      // Log access (optional)
      await UserModel.findByIdAndUpdate(user._id, {
        $push: {
          loginHistory: {
            timestamp: new Date(),
            ipAddress: req.ip,
            device: req.headers["user-agent"],
            type: "api_access",
          },
        },
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to refresh tokens
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken || req.headers["x-refresh-token"];

    if (!refreshToken) {
      throw new ErrorHandler(
        "No refresh token provided",
        httpStatus.UNAUTHORIZED
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt_refresh_key);

    // Get user and generate new access token
    const user = await UserModel.findById(decoded.id || decoded._id);
    if (!user) {
      throw new ErrorHandler("Invalid refresh token", httpStatus.UNAUTHORIZED);
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      config.jwt_key,
      { expiresIn: config.jwt_token_expire }
    );

    // Set new access token in cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.env === "true",
      sameSite: config.env === "true" ? "Strict" : "Lax",
      maxAge: parseInt(config.jwt_token_expire) * 1000,
    });

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check specific permissions
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Check if user has the required permission
      // This is a basic example - expand based on your permission system
      if (user.isAdmin || user.permissions?.includes(permission)) {
        next();
      } else {
        throw new ErrorHandler(
          "You don't have permission to perform this action",
          httpStatus.FORBIDDEN
        );
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  auth,
  refreshToken,
  hasPermission,
};
