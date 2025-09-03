import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export const vehicleInformationSchema = z.object({
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  vehicleRegistrationNumber: z
    .string()
    .min(1, 'Vehicle registration number is required')
    .regex(/^[A-Z0-9-]+$/i, 'Invalid registration number format'),
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
