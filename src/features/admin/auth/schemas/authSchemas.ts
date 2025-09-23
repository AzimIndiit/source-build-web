import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
  role: z.string().optional(),
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
export const optionalPhoneValidation = z
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
    // Common fields
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(70).trim(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(70).trim(),
    email: z.string().min(1, 'Email is required').email('Please enter valid email address'),
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
    // Seller fields (optional unless seller is selected)

    businessName: z.string().optional(),
    businessAddress: z.string().optional(),
    phone: z.string().optional(),
    cellPhone: z.string().optional(),
    einNumber: z.string().optional(),
    salesTaxId: z.string().optional(),
    localDelivery: z.string().optional(),
    // Driver fields (optional unless driver is selected)
    driverLicenseNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    // Seller-specific validation
    if (data.accountType === 'seller') {
      if (!data.businessName || data.businessName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business name must be at least 2 characters',
          path: ['businessName'],
        });
      }
      if (!data.businessAddress || data.businessAddress.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business address must be at least 2 characters',
          path: ['businessAddress'],
        });
      }
      // Validate business phone
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business phone is required',
          path: ['phone'],
        });
      } else {
        const cleanedPhone = data.phone.replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must be exactly 10 digits',
            path: ['phone'],
          });
        } else if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(cleanedPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid phone number. Area code cannot start with 0 or 1',
            path: ['phone'],
          });
        }
      }

      // Validate cell phone
      if (!data.cellPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cell phone is required',
          path: ['cellPhone'],
        });
      } else {
        const cleanedCellPhone = data.cellPhone.replace(/\D/g, '');
        if (cleanedCellPhone.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Cell phone must be exactly 10 digits',
            path: ['cellPhone'],
          });
        } else if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(cleanedCellPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid cell phone. Area code cannot start with 0 or 1',
            path: ['cellPhone'],
          });
        }
      }
      if (!data.einNumber || data.einNumber.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'EIN number is required',
          path: ['einNumber'],
        });
      }
      // salesTaxId is only required when localDelivery is 'no'
      if (data.localDelivery === 'no' && (!data.salesTaxId || data.salesTaxId.length < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sales Tax ID is required when Local Delivery is No',
          path: ['salesTaxId'],
        });
      }
    }

    // Driver-specific validation
    if (data.accountType === 'driver') {
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone number is required',
          path: ['phone'],
        });
      } else {
        const cleanedPhone = data.phone.replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Phone number must be exactly 10 digits',
            path: ['phone'],
          });
        } else if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(cleanedPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid phone number. Area code cannot start with 0 or 1',
            path: ['phone'],
          });
        }
      }
    }

    // Buyer validation - only common fields are required
    if (data.accountType === 'buyer') {
      // No additional fields required for buyer
    }
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
