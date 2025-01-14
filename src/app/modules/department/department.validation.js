const Joi = require("joi");

const departmentValidationSchema = Joi.object({
  departmentName: Joi.string().required().messages({
    "string.base": "Department name must be a string",
    "string.empty": "Department name cannot be empty",
    "any.required": "Department name is required",
  }),

  icon: Joi.object({
    link: Joi.string().uri().optional().messages({
      "string.base": "Icon link must be a string",
      "string.uri": "Icon link must be a valid URL",
    }),

    svg: Joi.string()
      .optional()
      .pattern(/^<svg[\s\S]*<\/svg>$/)
      .messages({
        "string.base": "svg link must be a string",
        "string.pattern.base": "Provide a valid svg.",
      }),
  }).optional(),

  tag: Joi.string().optional().messages({
    "string.base": "Tag must be a string",
  }),

  slug: Joi.string().lowercase().optional().messages({
    "string.base": "Slug must be a string",
    "string.lowercase": "Slug must be lowercase",
  }),

  description: Joi.string().optional().messages({
    "string.base": "Description must be a string",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "IsActive must be a boolean",
  }),
});
const JoiDepartmentValidationSchema = {
  departmentValidationSchema,
};

module.exports = JoiDepartmentValidationSchema;
