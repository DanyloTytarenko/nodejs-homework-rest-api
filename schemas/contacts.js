const Joi = require('joi');

const addSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Zа-яА-Я]+$/)
    .min(3)
    .max(25)
    .required()
    .messages({
      'string.pattern.base': 'Field {#label} may contain only letters',
      'any.required': 'missing required {#label} field',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'missing required {#label} field',
  }),
  phone: Joi.string()
    .pattern(/^[\d(),\s-]+$/)
    .required()
    .messages({
      'string.pattern.base':
        'Field {#label} may contain only digital, [(], [)] or [-] ',
      'any.required': 'missing required {#label} field',
    }),
});

module.exports = {
  addSchema,
};
