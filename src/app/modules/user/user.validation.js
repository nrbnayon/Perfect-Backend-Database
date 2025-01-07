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

const compensationSchema = Joi.object({
  salary: Joi.number().min(0),
  currency: Joi.string().default("USD"),
  lastReviewDate: Joi.date().max("now"),
  nextReviewDate: Joi.date().min("now"),
});

const benefitsSchema = Joi.object({
  healthInsurance: Joi.boolean().default(false),
  lifeInsurance: Joi.boolean().default(false),
  retirementPlan: Joi.boolean().default(false),
  paidTimeOff: Joi.number().min(0).max(365),
});

const learningPreferencesSchema = Joi.object({
  preferredLanguage: Joi.string().default("English"),
  learningStyle: Joi.string().valid(
    "Visual",
    "Auditory",
    "Reading/Writing",
    "Kinesthetic"
  ),
  availabilityHours: Joi.number().min(0).max(168).default(40),
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

// Existing schemas remain unchanged
const userCreateSchema = Joi.object({
  firstname: Joi.string().required().messages({
    "string.empty": "firstname is required",
    "any.required": "firstname is required",
  }),
  lastname: Joi.string().required().messages({
    "string.empty": "lastname is required",
    "any.required": "lastname is required",
  }),
  username: Joi.string().messages({
    "string.empty": "username should be string",
  }),
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "any.required": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
  phone: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      if (bangladeshiPhoneNumberRegex.test(value) && value.length === 11) {
        return value;
      } else {
        return helpers.message(
          "Invalid Bangladeshi phone number format or length"
        );
      }
    }, "Phone Number Validation"),
  phoneVerify: Joi.boolean(),
  emailVerify: Joi.boolean(),
  activeStatus: Joi.boolean(),
  lastActive: Joi.date().max("now"),
  socketId: Joi.string(),
  userStatus: Joi.string().valid("Active", "Block", "Restricted"),
  role: Joi.string().valid("2001", "1999"),
  isAdmin: Joi.boolean(),

  // New fields validation
  gender: Joi.string().valid("Male", "Female", "Other"),
  dateOfBirth: Joi.date().max("now"),
  profilePicture: Joi.string(),
  address: addressSchema,
  designation: Joi.string().trim(),
  department: Joi.string().trim(),
  bio: Joi.string().trim().max(500),
  joinedDate: Joi.date().max("now"),
  website: Joi.string().uri(),
  socialLinks: socialLinksSchema,
  employeeID: Joi.string(),
  employeeStatus: Joi.string().valid("Permanent", "Probation", "Contract"),
  employeeStatusUpdateDate: Joi.date().max("now"),

  // Additional new fields
  skills: Joi.array().items(skillSchema),
  certifications: Joi.array().items(certificationSchema),
  workExperience: Joi.array().items(workExperienceSchema),
  education: Joi.array().items(educationSchema),
  compensation: compensationSchema,
  benefits: benefitsSchema,
  learningPreferences: learningPreferencesSchema,
  coursesEnrolled: Joi.array().items(courseEnrollmentSchema),
  performanceReviews: Joi.array().items(performanceReviewSchema),
  jobPreferences: jobPreferencesSchema,
  emergencyContact: emergencyContactSchema,
  loginHistory: Joi.array().items(loginHistorySchema),
  preferences: preferencesSchema,
  lastLogin: Joi.date().max("now"),
}).messages({
  "object.unknown": "Invalid field provided",
});

const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .trim()
    .optional()
    .custom((value, helpers) => {
      if (bangladeshiPhoneNumberRegex.test(value) && value.length === 11) {
        return value;
      } else {
        return helpers.message(
          "Invalid Bangladeshi phone number format or length"
        );
      }
    }, "Phone Number Validation"),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
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

const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email().messages({
    "string.empty": "Email is required",
    "any.required": "Email is required",
    "string.email": "Invalid email format",
  }),
});

const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      "string.min": "Password must be at least 8 characters long 📏",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number 🔒",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords must match",
    }),
});

const JoiUserValidationSchema = {
  loginSchema,
  userCreateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  // Export individual schemas for specific validations
  skillSchema,
  certificationSchema,
  workExperienceSchema,
  educationSchema,
  performanceReviewSchema,
  jobPreferencesSchema,
};

module.exports = JoiUserValidationSchema;
