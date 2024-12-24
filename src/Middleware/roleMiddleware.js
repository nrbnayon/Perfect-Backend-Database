const ErrorHandler = require("../ErrorHandler/errorHandler");

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req?.user?.role)) {
      // console.log(req.user.role);
      return next(
        new ErrorHandler(
          `Role : ${req.user.role} is not allowed to access the resource`,
          401
        )
      );
    }
    next();
  };
};
