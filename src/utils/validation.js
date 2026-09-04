import Joi from 'joi'

/**
 * Security Regex Patterns
 */
export const PATTERNS = {
  // RFC 5322 compliant email regex pattern
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Strong password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+=\-[\]{}|;:'",.<>/?~`]).{8,64}$/,

  // Phone number (Cambodia 01x / +855 or international format)
  PHONE: /^(?:\+?855[\s-]?)?[0-9\s-]{7,12}$|^(?:0[1-9][0-9\s-]{6,9})$|^(\+?[0-9]{8,15})$/,

  // Full name (Latin and Khmer unicode letters with spaces, dots, hyphens)
  FULL_NAME: /^[a-zA-Z\u1780-\u17FF\s'.\-]{2,60}$/,

  // 6-character alphanumeric verification OTP (e.g. Pe6F6G)
  OTP: /^[a-zA-Z0-9]{6}$/,
}

/**
 * Login Schema
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .pattern(PATTERNS.EMAIL)
    .required()
    .messages({
      'string.empty': 'Email is required.',
      'string.pattern.base': 'Please enter a valid email address (e.g. name@domain.com).',
      'any.required': 'Email is required.',
    }),
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required.',
      'string.min': 'Password must be at least 6 characters.',
      'any.required': 'Password is required.',
    }),
  accountType: Joi.string()
    .valid('admin', 'user')
    .default('admin'),
})

/**
 * Register Schema
 */
export const registerSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .pattern(PATTERNS.FULL_NAME)
    .required()
    .messages({
      'string.empty': 'Full name is required.',
      'string.pattern.base': 'Full name must be 2–60 letters and cannot contain numbers or special characters.',
      'any.required': 'Full name is required.',
    }),
  phone_number: Joi.string()
    .trim()
    .pattern(PATTERNS.PHONE)
    .required()
    .messages({
      'string.empty': 'Phone number is required.',
      'string.pattern.base': 'Please enter a valid phone number (e.g. 012 345 678).',
      'any.required': 'Phone number is required.',
    }),
  email: Joi.string()
    .trim()
    .pattern(PATTERNS.EMAIL)
    .required()
    .messages({
      'string.empty': 'Email is required.',
      'string.pattern.base': 'Please enter a valid email address (e.g. name@domain.com).',
      'any.required': 'Email is required.',
    }),
  password: Joi.string()
    .pattern(PATTERNS.PASSWORD)
    .required()
    .messages({
      'string.empty': 'Password is required.',
      'string.pattern.base': 'Password must be 8+ chars and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.',
      'any.required': 'Password is required.',
    }),
})

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .trim()
    .pattern(PATTERNS.EMAIL)
    .required()
    .messages({
      'string.empty': 'Email is required.',
      'string.pattern.base': 'Please enter a valid email address.',
      'any.required': 'Email is required.',
    }),
})

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .trim()
    .pattern(PATTERNS.EMAIL)
    .required()
    .messages({
      'string.empty': 'Email is required.',
      'string.pattern.base': 'Please enter a valid email address.',
      'any.required': 'Email is required.',
    }),
  otp: Joi.string()
    .trim()
    .pattern(PATTERNS.OTP)
    .required()
    .messages({
      'string.empty': 'Verification code is required.',
      'string.pattern.base': 'Verification code must be exactly 6 characters.',
      'any.required': 'Verification code is required.',
    }),
  new_password: Joi.string()
    .pattern(PATTERNS.PASSWORD)
    .required()
    .messages({
      'string.empty': 'New password is required.',
      'string.pattern.base': 'Password must be 8+ chars and contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.',
      'any.required': 'New password is required.',
    }),
  confirm_password: Joi.any()
    .equal(Joi.ref('new_password'))
    .required()
    .messages({
      'any.only': 'Confirm password does not match new password.',
      'any.required': 'Please confirm your new password.',
    }),
})

/**
 * Helper to validate data against Joi schema
 * @param {Joi.Schema} schema 
 * @param {object} data 
 * @returns {{ error: string|null, value: object }}
 */
export function validate(schema, data) {
  const { error, value } = schema.validate(data, { abortEarly: true, stripUnknown: true })
  if (error) {
    return {
      error: error.details[0]?.message || 'Validation failed.',
      value: null,
    }
  }
  return { error: null, value }
}
