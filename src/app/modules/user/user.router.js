const express = require("express");

const JoiUserValidationSchema = require("./user.validation");
const validateRequest = require("../../../Middleware/validateRequest");
const userController = require("./user.controller");

const router = express.Router();

router.post(
  "/exist-user",
  validateRequest(JoiUserValidationSchema.phoneNumberRequiredSchema),
  userController.checkUserExistusingPhone
);

router.post(
  "/create",
  validateRequest(JoiUserValidationSchema.userCreateSchema),
  userController.createUser
);

router.post(
  "/login",
  validateRequest(JoiUserValidationSchema.loginSchema),
  userController.loginUserUsingPhoneAndPassword
);

router.post(
  "/varify-otp",
  validateRequest(JoiUserValidationSchema.phoneOTPVarificationSchema),
  userController.checkUserExistusingPhone
);

router.put(
  "/update-profile",
  validateRequest(JoiUserValidationSchema.updateUserSchema),
  userController.updateUserProfile
);

router.post(
  "/forgot-password",
  validateRequest(JoiUserValidationSchema.forgotPasswordSchema),
  userController.forgotPassword
);

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

module.exports = router;
