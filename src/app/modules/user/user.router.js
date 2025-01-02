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
  authLimiter,
  validateRequest(JoiUserValidationSchema.loginSchema),
  userController.loginUserUsingEmailOrPhoneAndPassword
);

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

router.post("/logout", userController.logout);

const userRouter = router;
module.exports = userRouter;
