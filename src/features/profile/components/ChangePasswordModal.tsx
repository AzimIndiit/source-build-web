import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { EyeOff } from 'lucide-react';
import { useChangePasswordMutation } from '../hooks/useChangePasswordMutation';
import toast from 'react-hot-toast';

// Zod validation schema
const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, 'Current password is required')
      .min(8, 'Password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ChangePasswordFormData) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const changePasswordMutation = useChangePasswordMutation();

  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    try {
      // Use the mutation to call the API
      const response: any = await changePasswordMutation.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      if (response.status === 'success') {
        handleClose();
      }
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error('Password change error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95%] rounded-lg sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-white">
        <div className="p-6">
          <DialogTitle className="text-xl font-semibold mb-2">Change Password?</DialogTitle>
          <p className="text-gray-600 text-sm mb-6">
            Update your password to keep your account secure. Enter your current password, choose a
            new one, and confirm the change.
          </p>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormInput
                name="oldPassword"
                label="Old Password"
                type="password"
                placeholder="Enter your current password"
                leftIcon={<EyeOff className="w-4 h-4 text-gray-400" />}
              />

              <FormInput
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                leftIcon={<EyeOff className="w-4 h-4 text-gray-400" />}
              />

              <FormInput
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                leftIcon={<EyeOff className="w-4 h-4 text-gray-400" />}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || changePasswordMutation.isPending}
                  className="flex-1  bg-primary hover:bg-primary/90 text-white"
                >
                  {isSubmitting || changePasswordMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
