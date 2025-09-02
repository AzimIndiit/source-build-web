import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

// Helper to validate required phone numbers (accepts formatted or unformatted)
export const phoneValidation = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => {
    // Remove formatting characters to get just digits
    return val ? val.replace(/\D/g, '') : '';
  })
  .refine((val) => {
    // Must be exactly 10 digits
    if (val.length !== 10) {
      return false;
    }
    // Check if it's a valid US phone number format
    // Area code cannot start with 0 or 1
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(val);
  }, 'Invalid phone number. Area code cannot start with 0 or 1');

// Helper for optional phone numbers
const optionalPhoneValidation = z
  .string()
  .optional()
  .transform((val) => {
    // Remove formatting characters to get just digits
    return val ? val.replace(/\D/g, '') : '';
  })
  .refine((val) => {
    // Allow empty (optional) or must be 10 digits with valid format
    if (val === '') return true;
    if (val.length !== 10) return false;
    // Area code cannot start with 0 or 1
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(val);
  }, 'Invalid phone number. Area code cannot start with 0 or 1');

export const signupSchema = z
  .object({
    accountType: z.string().min(1, 'Account type is required'),
    businessName: z.string().min(2, 'Business name must be at least 2 characters').max(70).trim(),
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(70).trim(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(70).trim(),
    businessAddress: z
      .string()
      .min(2, 'Business address must be at least 2 characters')
      .max(255)
      .trim(),
    email: z.string().min(1, 'Email is required').email('Please enter valid email address'),
    phone: phoneValidation,
    cellPhone: optionalPhoneValidation, // Cell phone can be optional
    einNumber: z.string().min(1, 'EIN number is required'),
    salesTaxId: z.string().min(1, 'Sales Tax ID is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
