import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
// Registration number validation patterns for different regions
const registrationNumberPatterns = {
  default: /^[A-Z0-9]{2,}[\s-]?[A-Z0-9]{1,}[\s-]?[A-Z0-9]{1,}$/i,
  // Add more patterns for specific regions if needed
};

export const vehicleInformationSchema = z.object({
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleRegistrationNumber: z
    .string()
    .trim()
    .min(2, 'Registration number must be at least 2 characters')
    .max(20, 'Registration number must not exceed 20 characters')
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => registrationNumberPatterns.default.test(val),
      'Invalid registration number format'
    ),
  vehicleManufacturer: z.string().min(1, 'Vehicle manufacturer is required'),
  vehicleModel: z.string().min(1, 'Vehicle model is required'),
  vehicleImages: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          message: 'Max file size is 5MB',
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message: 'Only .jpg, .jpeg, .png, .webp and .gif formats are supported',
        })
    )
    .optional(),
  insuranceImages: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
          message: 'Max file size is 5MB',
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
          message: 'Only .jpg, .jpeg, .png, .webp and .gif formats are supported',
        })
    )
    .optional(),
});

export type VehicleInformationFormData = z.infer<typeof vehicleInformationSchema>;
