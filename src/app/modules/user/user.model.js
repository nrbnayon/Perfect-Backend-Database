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
