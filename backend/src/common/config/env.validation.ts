import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  INVITATION_EXPIRY_HOURS: Joi.number().integer().positive().default(72),
  SUPERADMIN_EMAIL: Joi.string().email().required(),
  SUPERADMIN_PASSWORD: Joi.string().min(8).required(),
  SUPERADMIN_FIRST_NAME: Joi.string().required(),
  SUPERADMIN_LAST_NAME: Joi.string().required(),
});
