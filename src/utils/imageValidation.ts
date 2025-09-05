// Image upload constraints and validation utilities
export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MIN_WIDTH: 400,
  MIN_HEIGHT: 400,
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an image file for upload
 * Checks file type, size, and dimensions
 */
export const validateImageFile = async (file: File): Promise<ImageValidationResult> => {
  // Check if it's an image file
  if (!file.type.startsWith('image/')) {
    return { 
      valid: false, 
      error: `"${file.name}" is not an image file` 
    };
  }

  // Check file size
  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `Selected image is ${sizeMB}MB. Maximum size is 5MB allowed` 
    };
  }

  // Check image dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width < IMAGE_CONSTRAINTS.MIN_WIDTH || img.height < IMAGE_CONSTRAINTS.MIN_HEIGHT) {
        resolve({ 
          valid: false, 
          error: `Image is ${img.width}x${img.height}px. Minimum size required is ${IMAGE_CONSTRAINTS.MIN_WIDTH}x${IMAGE_CONSTRAINTS.MIN_HEIGHT}px` 
        });
      } else {
        resolve({ valid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ 
        valid: false, 
        error: `Failed to load image "${file.name}"` 
      });
    };
    
    img.src = url;
  });
};

/**
 * Validates multiple image files
 * Returns an array of valid files and an array of error messages
 */
export const validateMultipleImages = async (
  files: File[], 
  maxCount: number, 
  currentCount: number = 0
): Promise<{ validFiles: File[]; errors: string[] }> => {
  const remainingSlots = maxCount - currentCount;
  const validFiles: File[] = [];
  const errors: string[] = [];

  if (currentCount >= maxCount) {
    errors.push(`Maximum ${maxCount} images allowed`);
    return { validFiles, errors };
  }

  for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
    const validation = await validateImageFile(files[i]);
    if (validation.valid) {
      validFiles.push(files[i]);
    } else if (validation.error) {
      errors.push(validation.error);
    }
  }

  if (files.length > remainingSlots) {
    errors.push(
      `Only ${remainingSlots} more image(s) can be added (max ${maxCount} total)`
    );
  }

  return { validFiles, errors };
};