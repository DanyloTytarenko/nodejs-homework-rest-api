const Joi = require("joi");

const registerSchema = Joi.object({
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\\$%\\^&\\*]).{8,}$/)
    .min(8)
    .required()
    .messages({
      "string.pattern.base":
        "Field {#label} must be minimum 8 signs, contain big letter and digital",
      "any.required": "missing required {#label} field",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "missing required {#label} field",
  }),
  subscription: Joi.string()
    .valid("starter", "pro", "business")
    .default("starter"),
});

const loginSchema = Joi.object({
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\\$%\\^&\\*]).{8,}$/)
    .min(8)
    .required()
    .messages({
      "string.pattern.base":
        "Field {#label} must be minimum 8 signs, contain big letter and digital",
      "any.required": "missing required {#label} field",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email",
    "any.required": "missing required {#label} field",
  }),
});

const subscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const emailSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({ "any.required": "Missing required field email" }),
});

module.exports = {
  registerSchema,
  loginSchema,
  subscriptionSchema,
  emailSchema,
};
