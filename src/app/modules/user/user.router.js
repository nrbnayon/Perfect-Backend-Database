const express = require("express");

const validateRequest = require("../../../Middleware/validateRequest");
const JoiUserValidationSchema = require("./user.validation");
const userController = require("./user.controller");
const { authLimiter } = require("../../../Middleware/rateLimit.middleware");

const router = express.Router();

router.post(
  "/signup",
  authLimiter,
  validateRequest(JoiUserValidationSchema.userCreateSchema),
  userController.createUser
);

router.post(
  "/login",
  validateRequest(JoiUserValidationSchema.loginSchema),
  userController.loginUserUsingEmailOrPhoneAndPassword
);

router.post(
  "/exist-user",
  validateRequest(JoiUserValidationSchema.phoneNumberRequiredSchema),
  userController.checkUserExistusingEmail
);

// router.post(
//   "/varify-otp",
//   validateRequest(JoiUserValidationSchema.phoneOTPVarificationSchema),
//   userController.checkUserExistusingEmail
// );

router.put(
  "/update-profile",
  validateRequest(JoiUserValidationSchema.updateUserSchema),
  userController.updateUserProfile
);

// router.post(
//   "/forgot-password",
//   validateRequest(JoiUserValidationSchema.forgotPasswordSchema),
//   userController.forgotPassword
// );

router.get(
  "/my-profile",
  validateRequest(JoiUserValidationSchema.tokenRequiredSchema),
  userController.myProfileUsingToken
);

router.get(
  "/signup-stats",
  validateRequest(JoiUserValidationSchema.dateRangeSchema),
  userController.getSignUpUserNumber
);

router.post("/logout", userController.logout);

const userRouter = router;
module.exports = userRouter;
