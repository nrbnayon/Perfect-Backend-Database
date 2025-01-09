//user.model.js
const mongoose = require("mongoose");
const validator = require("validator");

const userModel = mongoose.Schema(
  {
    // Existing fields remain unchanged
    firstname: {
      type: String,
      required: [true, "Please enter Your First Name"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Please enter Your Last Name"],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid Email"],
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      length: [11, "Phone number must be 11 digits"],
      trim: true,
    },
    phoneVerify: {
      type: Boolean,
      default: false,
    },
    emailVerify: {
      type: Boolean,
      default: false,
    },

    activeStatus: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },

    userStatus: {
      type: String,
      enum: ["Active", "Block", "Restricted"],
      default: "Active",
    },
    role: {
      type: String,
      enum: ["2001", "1999"],
      default: "1999",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },
    profilePicture: {
      type: String,
      default: "default-avatar.png",
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    designation: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    joinedDate: {
      type: Date,
    },
    website: {
      type: String,
      trim: true,
      validate: [validator.isURL, "Invalid URL"],
    },
    socialLinks: {
      facebook: { type: String, validate: [validator.isURL, "Invalid URL"] },
      twitter: { type: String, validate: [validator.isURL, "Invalid URL"] },
      linkedin: { type: String, validate: [validator.isURL, "Invalid URL"] },
      github: { type: String, validate: [validator.isURL, "Invalid URL"] },
    },
    employeeID: {
      type: String,
      unique: true,
      sparse: true,
    },
    employeeStatus: {
      type: String,
      enum: ["Permanent", "Probation", "Contract"],
    },
    employeeStatusUpdateDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // New fields for enhanced functionality

    // Professional Information
    skills: [
      {
        name: { type: String, trim: true },
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        yearsOfExperience: Number,
      },
    ],

    certifications: [
      {
        name: { type: String, trim: true },
        issuedBy: { type: String, trim: true },
        issueDate: Date,
        expiryDate: Date,
        credentialID: String,
        credentialURL: {
          type: String,
          validate: [validator.isURL, "Invalid URL"],
        },
      },
    ],

    // Work Experience
    workExperience: [
      {
        company: { type: String, trim: true },
        position: { type: String, trim: true },
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        responsibilities: [String],
        achievements: [String],
        location: String,
      },
    ],

    // Education
    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        field: { type: String, trim: true },
        startDate: Date,
        endDate: Date,
        grade: String,
        activities: [String],
      },
    ],

    // HR Specific Fields
    compensation: {
      salary: { type: Number },
      currency: { type: String, default: "USD" },
      lastReviewDate: Date,
      nextReviewDate: Date,
    },

    benefits: {
      healthInsurance: { type: Boolean, default: false },
      lifeInsurance: { type: Boolean, default: false },
      retirementPlan: { type: Boolean, default: false },
      paidTimeOff: { type: Number }, // Days per year
    },

    // LMS Specific Fields
    learningPreferences: {
      preferredLanguage: { type: String, default: "English" },
      learningStyle: {
        type: String,
        enum: ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"],
      },
      availabilityHours: { type: Number, default: 40 }, // Hours per week
    },

    coursesEnrolled: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        enrollmentDate: Date,
        completionDate: Date,
        progress: { type: Number, default: 0 }, // Percentage
        status: {
          type: String,
          enum: ["Not Started", "In Progress", "Completed", "On Hold"],
        },
      },
    ],

    // Performance and Goals
    performanceReviews: [
      {
        reviewDate: Date,
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ratings: {
          technical: { type: Number, min: 1, max: 5 },
          soft_skills: { type: Number, min: 1, max: 5 },
          leadership: { type: Number, min: 1, max: 5 },
          productivity: { type: Number, min: 1, max: 5 },
        },
        comments: String,
        goals: [
          {
            description: String,
            deadline: Date,
            status: {
              type: String,
              enum: ["Not Started", "In Progress", "Completed"],
            },
          },
        ],
      },
    ],

    // Job Search Related
    jobPreferences: {
      desiredRole: [String],
      desiredLocation: [String],
      expectedSalary: {
        min: Number,
        max: Number,
        currency: { type: String, default: "USD" },
      },
      workType: [
        {
          type: String,
          enum: ["Full-time", "Part-time", "Contract", "Remote", "Hybrid"],
        },
      ],
      isOpenToRelocate: { type: Boolean, default: false },
      noticePeriod: { type: Number }, // Days
    },

    // Additional Contact Information
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },

    // System Related
    lastLogin: Date,
    loginHistory: [
      {
        timestamp: Date,
        ipAddress: String,
        device: String,
      },
    ],

    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },

    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userModel);
module.exports = UserModel;


//user.validation.js

const Joi = require("joi");
const bangladeshiPhoneNumberRegex = /^(?:\+88|88)?01[3-9]\d{8}$/;

// Helper schemas for reusability
const addressSchema = Joi.object({
  street: Joi.string().trim(),
  city: Joi.string().trim(),
  state: Joi.string().trim(),
  zip: Joi.string().trim(),
  country: Joi.string().trim(),
});

const socialLinksSchema = Joi.object({
  facebook: Joi.string().uri().allow(""),
  twitter: Joi.string().uri().allow(""),
  linkedin: Joi.string().uri().allow(""),
  github: Joi.string().uri().allow(""),
});

const skillSchema = Joi.object({
  name: Joi.string().required().trim(),
  level: Joi.string()
    .valid("Beginner", "Intermediate", "Advanced", "Expert")
    .required(),
  yearsOfExperience: Joi.number().min(0).max(50),
});

const certificationSchema = Joi.object({
  name: Joi.string().required().trim(),
  issuedBy: Joi.string().required().trim(),
  issueDate: Joi.date().max("now").required(),
  expiryDate: Joi.date().min(Joi.ref("issueDate")),
  credentialID: Joi.string(),
  credentialURL: Joi.string().uri(),
});

const workExperienceSchema = Joi.object({
  company: Joi.string().required().trim(),
  position: Joi.string().required().trim(),
  startDate: Joi.date().max("now").required(),
  endDate: Joi.date().min(Joi.ref("startDate")).when("current", {
    is: true,
    then: Joi.forbidden(),
  }),
  current: Joi.boolean().default(false),
  responsibilities: Joi.array().items(Joi.string()),
  achievements: Joi.array().items(Joi.string()),
  location: Joi.string(),
});

const educationSchema = Joi.object({
  institution: Joi.string().required().trim(),
  degree: Joi.string().required().trim(),
  field: Joi.string().required().trim(),
  startDate: Joi.date().max("now").required(),
  endDate: Joi.date().min(Joi.ref("startDate")),
  grade: Joi.string(),
  activities: Joi.array().items(Joi.string()),
});


const courseEnrollmentSchema = Joi.object({
  courseId: Joi.string().required(),
  enrollmentDate: Joi.date().max("now"),
  completionDate: Joi.date().min(Joi.ref("enrollmentDate")),
  progress: Joi.number().min(0).max(100).default(0),
  status: Joi.string().valid(
    "Not Started",
    "In Progress",
    "Completed",
    "On Hold"
  ),
});

const performanceGoalSchema = Joi.object({
  description: Joi.string().required(),
  deadline: Joi.date().min("now"),
  status: Joi.string().valid("Not Started", "In Progress", "Completed"),
});

const performanceReviewSchema = Joi.object({
  reviewDate: Joi.date().max("now").required(),
  reviewer: Joi.string().required(),
  ratings: Joi.object({
    technical: Joi.number().min(1).max(5),
    soft_skills: Joi.number().min(1).max(5),
    leadership: Joi.number().min(1).max(5),
    productivity: Joi.number().min(1).max(5),
  }),
  comments: Joi.string(),
  goals: Joi.array().items(performanceGoalSchema),
});

const jobPreferencesSchema = Joi.object({
  desiredRole: Joi.array().items(Joi.string()),
  desiredLocation: Joi.array().items(Joi.string()),
  expectedSalary: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(Joi.ref("min")),
    currency: Joi.string().default("USD"),
  }),
  workType: Joi.array().items(
    Joi.string().valid("Full-time", "Part-time", "Contract", "Remote", "Hybrid")
  ),
  isOpenToRelocate: Joi.boolean().default(false),
  noticePeriod: Joi.number().min(0),
});

const emergencyContactSchema = Joi.object({
  name: Joi.string().required(),
  relationship: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email(),
});

const loginHistorySchema = Joi.object({
  timestamp: Joi.date().max("now"),
  ipAddress: Joi.string(),
  device: Joi.string(),
});

const preferencesSchema = Joi.object({
  emailNotifications: Joi.boolean().default(true),
  smsNotifications: Joi.boolean().default(false),
  theme: Joi.string().valid("light", "dark").default("light"),
  language: Joi.string().default("en"),
});



// Update profile schema for partial updates
const updateProfileSchema = Joi.object({
  // All fields from userCreateSchema but marked as optional
  firstname: Joi.string(),
  lastname: Joi.string(),
  username: Joi.string(),
  phone: Joi.string()
    .trim()
    .custom((value, helpers) => {
      if (bangladeshiPhoneNumberRegex.test(value) && value.length === 11) {
        return value;
      } else {
        return helpers.message(
          "Invalid Bangladeshi phone number format or length"
        );
      }
    }, "Phone Number Validation"),
  gender: Joi.string().valid("Male", "Female", "Other"),
  dateOfBirth: Joi.date().max("now"),
  profilePicture: Joi.string(),
  address: addressSchema,
  designation: Joi.string().trim(),
  department: Joi.string().trim(),
  bio: Joi.string().trim().max(500),
  website: Joi.string().uri(),
  socialLinks: socialLinksSchema,
  skills: Joi.array().items(skillSchema),
  certifications: Joi.array().items(certificationSchema),
  workExperience: Joi.array().items(workExperienceSchema),
  education: Joi.array().items(educationSchema),
  jobPreferences: jobPreferencesSchema,
  emergencyContact: emergencyContactSchema,
  preferences: preferencesSchema,
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
    "object.unknown": "Invalid field provided",
  });

const JoiUserValidationSchema = {
  updateProfileSchema,
  // Expor individual schemas for specific validations
  skillSchema,
  certificationSchema,
  workExperienceSchema,
  educationSchema,
  performanceReviewSchema,
  jobPreferencesSchema,
};

module.exports = JoiUserValidationSchema;


// user.controller.js
const httpStatus = require("http-status");
const userServices = require("./user.services");
const catchAsyncError = require("../../../ErrorHandler/catchAsyncError");
const sendResponse = require("../../../shared/sendResponse");
const config = require("../../../config/config");



const updateUserProfile = catchAsyncError(async (req, res) => {
  const updateData = req.body;
  const result = await userServices.updateUserProfileIntoDB(
    req.userId,
    updateData
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${error?.emoji} ${error?.message} || "User profile updated successfully" `,
    data: result,
  });
});

// New controller functions for specific profile sections
const updateUserSkills = catchAsyncError(async (req, res) => {
  const result = await userServices.updateUserSkills(
    req.userId,
    req.body.skills
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${error?.emoji} ${error?.message} || "Skills updated successfully"`,
    data: result,
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
    message: `${error?.emoji} ${error?.message} || "Certifications updated successfully"`,
    data: result,
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
    message: `${error?.emoji} ${error?.message} || "Work experience updated successfully"`,
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
    message: `${error?.emoji} ${error?.message} || "Education details updated successfully"`,
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
  updateUserProfile,
  myProfileUsingToken,
  updateUserSkills,
  updateUserCertifications,
  updateUserWorkExperience,
  updateUserEducation,
  addPerformanceReview,
  updateUserPreference,

};

module.exports = userController;

// user.services.js
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const UserModel = require("./user.model");
const jwtHandle = require("../../../shared/createToken");
const config = require("../../../config/config");
const ErrorHandler = require("../../../ErrorHandler/errorHandler");
const passwordRefServices = require("../passwordRef/passwordRef.service");
const otpService = require("../otp/otp.services");
const PasswordResetToken = require("../../../Middleware/PasswordResetToken");
const { sendMail } = require("../../../utility/Emails");

const updateUserProfileIntoDB = async (userId, updateData) => {
  // Validate specific field updates
  if (updateData.skills) {
    updateData.skills = updateData.skills.map((skill) => ({
      ...skill,
      updatedAt: new Date(),
    }));
  }

  if (updateData.certifications) {
    updateData.certifications = updateData.certifications.map((cert) => ({
      ...cert,
      updatedAt: new Date(),
    }));
  }

  if (updateData.workExperience) {
    updateData.workExperience = updateData.workExperience.map((exp) => ({
      ...exp,
      updatedAt: new Date(),
    }));
  }

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


// New functions for handling specific profile sections
const updateUserSkills = async (userId, skills) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { skills } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserCertifications = async (userId, certifications) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { certifications } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserWorkExperience = async (userId, workExperience) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { workExperience } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserEducation = async (userId, education) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { education } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const addPerformanceReview = async (userId, reviewData) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        performanceReviews: {
          ...reviewData,
          reviewDate: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};

const updateUserPreferences = async (userId, preferences) => {
  const result = await UserModel.findByIdAndUpdate(
    userId,
    { $set: { preferences } },
    { new: true }
  );

  if (!result) {
    throw new ErrorHandler("User not found", httpStatus.NOT_FOUND);
  }

  return result;
};


const userServices = {
  updateUserProfileIntoDB,
  updateUserSkills,
  updateUserCertifications,
  updateUserWorkExperience,
  updateUserEducation,
  addPerformanceReview,
  updateUserPreferences,
};

module.exports = userServices;


// user.router.js
const express = require("express");
const validateRequest = require("../../../Middleware/validateRequest");
const JoiUserValidationSchema = require("./user.validation");
const userController = require("./user.controller");
const { authLimiter } = require("../../../Middleware/rateLimit.middleware");
const { auth } = require("../../../Middleware/auth.middleware");
const router = express.Router();


router.put(
  "/profile-update",
  auth(),
  validateRequest(JoiUserValidationSchema.updateProfileSchema),
  userController.updateUserProfile
);

router.post(
  "/change-password",
  auth(),
  validateRequest(JoiUserValidationSchema.changePasswordSchema)
);

// Skills and certifications routes
router.put(
  "/skills",
  auth(),
  validateRequest(JoiUserValidationSchema.skillSchema),
  userController.updateUserSkills
);

router.put(
  "/certifications",
  auth(),
  validateRequest(JoiUserValidationSchema.certificationSchema),
  userController.updateUserCertifications
);

// Work and education routes
router.put(
  "/work-experience",
  auth(),
  validateRequest(JoiUserValidationSchema.workExperienceSchema),
  userController.updateUserWorkExperience
);

router.put(
  "/education",
  auth(),
  validateRequest(JoiUserValidationSchema.educationSchema),
  userController.updateUserEducation
);

Performance review routes
router.post(
  "/performance-review",
  auth(),
  validateRequest(JoiUserValidationSchema.performanceReviewSchema),
  userController.addPerformanceReview
);

// Preferences routes
router.put(
  "/preferences",
  auth(),
  validateRequest(JoiUserValidationSchema.preferencesSchema),
  userController.updateUserPreferences
);

const userRouter = router;
module.exports = userRouter;

