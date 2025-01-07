// user.router.js
const express = require("express");
const validateRequest = require("../../../Middleware/validateRequest");
const JoiUserValidationSchema = require("./user.validation");
const userController = require("./user.controller");
const { authLimiter } = require("../../../Middleware/rateLimit.middleware");
const { auth } = require("../../../Middleware/auth.middleware");
// const extractUserFromTokenMiddleware = require("../../../Middleware/userVerificationMiddleware");

const router = express.Router();

// Authentication routes
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

router.post("/logout", auth(), userController.logout);
// router.post("/logout", extractUserFromTokenMiddleware, userController.logout);

router.get("/online-users", auth(), userController.getOnlineUsersList);

// Profile routes
router.get("/profile", auth(), userController.myProfileUsingToken);

router.put(
  "/profile-update",
  auth(),
  validateRequest(JoiUserValidationSchema.updateProfileSchema),
  userController.updateUserProfile
);

// router.post(
//   "/change-password",
//   auth(),
//   validateRequest(JoiUserValidationSchema.changePasswordSchema)
// );

// router.post(
//   "/reset-password",
//   auth(),
//   validateRequest(JoiUserValidationSchema.resetPasswordSchema)
// );

// Password reset routes
router.post(
  "/forgot-password",
  validateRequest(JoiUserValidationSchema.forgotPasswordSchema),
  userController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(JoiUserValidationSchema.forgotPasswordSchema),
  userController.resetPassword
);

// Skills and certifications routes
// router.put(
//   "/skills",
//   auth(),
//   validateRequest(JoiUserValidationSchema.skillSchema),
//   userController.updateUserSkills
// );

// router.put(
//   "/certifications",
//   auth(),
//   validateRequest(JoiUserValidationSchema.certificationSchema),
//   userController.updateUserCertifications
// );

// // Work and education routes
// router.put(
//   "/work-experience",
//   auth(),
//   validateRequest(JoiUserValidationSchema.workExperienceSchema),
//   userController.updateUserWorkExperience
// );

// router.put(
//   "/education",
//   auth(),
//   validateRequest(JoiUserValidationSchema.educationSchema),
//   userController.updateUserEducation
// );

// Performance review routes
// router.post(
//   "/performance-review",
//   auth(),
//   validateRequest(JoiUserValidationSchema.performanceReviewSchema),
//   userController.addPerformanceReview
// );

// // Preferences routes
// router.put(
//   "/preferences",
//   auth(),
//   validateRequest(JoiUserValidationSchema.preferencesSchema),
//   userController.updateUserPreferences
// );

const userRouter = router;
module.exports = userRouter;

// // user.router.js
// const express = require("express");

// const validateRequest = require("../../../Middleware/validateRequest");
// const JoiUserValidationSchema = require("./user.validation");
// const userController = require("./user.controller");
// const { authLimiter } = require("../../../Middleware/rateLimit.middleware");

// const router = express.Router();

// router.post(
//   "/signup",
//   authLimiter,
//   validateRequest(JoiUserValidationSchema.userCreateSchema),
//   userController.createUser
// );

// router.post(
//   "/login",
//   authLimiter,
//   validateRequest(JoiUserValidationSchema.loginSchema),
//   userController.loginUserUsingEmailOrPhoneAndPassword
// );

// router.put(
//   "/update-profile",
//   validateRequest(JoiUserValidationSchema.updateUserSchema),
//   userController.updateUserProfile
// );

// router.post("/logout", userController.logout);

// const userRouter = router;
// module.exports = userRouter;
