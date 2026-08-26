import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  company: z
    .string()
    .max(200, 'Company name must be at most 200 characters')
    .optional()
    .nullable(),
});

export const loginSchema = z
  .object({
    email: z.string().optional(),
    username: z.string().optional(),
    identifier: z.string().optional(),
    password: z.string().optional(),
    licenseKey: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.licenseKey && data.licenseKey.trim().length > 0) return true;
      if (data.identifier && data.identifier.trim().toUpperCase().startsWith('CRGO-')) return true;
      return Boolean(data.password && data.password.trim().length > 0);
    },
    {
      message: 'Please provide either your password or a valid License Key',
      path: ['password'],
    }
  );

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});
