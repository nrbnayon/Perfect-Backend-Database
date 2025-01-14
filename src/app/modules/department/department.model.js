const mongoose = require("mongoose");
const generateSlug = require("../../../shared/generateSlug");

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, "Please enter department name."],
      unique: true,
    },
    icon: {
      link: {
        type: String,
      },
      svg: {
        type: String,
      },
    },
    tag: {
      type: String,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware to create a slug before saving
departmentSchema.pre("save", function (next) {
  // Generate slug only if the categoryName has changed or if it's a new document
  if (this.isModified("departmentName") || this.isNew) {
    this.slug = generateSlug(this.departmentName);
  }
  next();
});

const DepartmentModel = mongoose.model("departments", departmentSchema);

module.exports = DepartmentModel;
