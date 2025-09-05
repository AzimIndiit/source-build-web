import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const drivingLicenseSchema = z.object({
  licenceImages: z
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
  licenseNumber: z
    .string()
    .min(5, 'License number must be at least 5 characters')
    .max(20, 'License number must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/i, 'License number can only contain letters, numbers, and hyphens'),
});

export type DrivingLicenseFormData = z.infer<typeof drivingLicenseSchema>;
