import React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';

import { FormSelect } from '@/components/forms/FormSelect';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui';

const AccountTypeOptions = [
  { label: 'Checking', value: 'checking' as const },
  { label: 'Savings', value: 'savings' as const },
  { label: 'Current', value: 'current' as const },
];

// Schema for creating new bank account
const createBankAccountSchema = z.object({
  accountHolderName: z
    .string()
    .trim()
    .min(1, 'Account holder name is required')
    .min(2, 'Account holder name must be at least 2 characters')
    .max(70, 'Account holder name must not exceed 70 characters'),
  bankName: z
    .string()
    .trim()
    .min(1, 'Bank name is required')
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name must not exceed 100 characters'),
  accountNumber: z
    .string()
    .trim()
    .min(1, 'Account number is required')
    .regex(/^[0-9]+$/, 'Account number must contain only digits')
    .min(8, 'Account number must be at least 8 digits')
    .max(20, 'Account number must not exceed 20 digits'),
  routingNumber: z
    .string()
    .trim()
    .min(1, 'Routing number is required')
    .regex(/^[0-9]+$/, 'Routing number must contain only digits')
    .min(9, 'Routing number must be 9 digits')
    .max(9, 'Routing number must be 9 digits'),
  swiftCode: z
    .string()
    .trim()
    .min(1, 'SWIFT/BIC code is required')
    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Invalid SWIFT/BIC code format')
    .max(11, 'SWIFT/BIC code must not exceed 11 characters'),
  accountType: z.enum(['checking', 'savings', 'current'] as const),
  isDefault: z.boolean().optional(),
});

// Schema for updating bank account (account number is optional)
const updateBankAccountSchema = z.object({
  
  isDefault: z.boolean().optional(),
});

type BankAccountFormData = z.infer<typeof createBankAccountSchema>;

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  initialData?: Partial<BankAccountFormData>;
  isEdit?: boolean;
  totalBankAccount?:boolean;
  isSubmitting?:boolean
}

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  totalBankAccount,
  isSubmitting =false
}) => {
  const methods = useForm<BankAccountFormData>({
    resolver: zodResolver(isEdit ? updateBankAccountSchema : createBankAccountSchema),
    defaultValues: initialData 
      ? {
          accountHolderName: initialData.accountHolderName || '',
          bankName: initialData.bankName || '',
          accountNumber: initialData.accountNumber || '',
          routingNumber: initialData.routingNumber || '',
          swiftCode: initialData.swiftCode || '',
          accountType: initialData.accountType || AccountTypeOptions[0].value,
          isDefault: initialData.isDefault ?? false, // Use nullish coalescing to preserve false values
        }
      : {
          accountHolderName: '',
          bankName: '',
          accountNumber: '',
          routingNumber: '',
          swiftCode: '',
          accountType: AccountTypeOptions[0].value,
          isDefault: totalBankAccount ? false : true,
        },
  });

  // Reset form when initialData changes (for edit mode) or modal closes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Ensure isDefault is explicitly set from initialData when editing
        methods.reset({
          accountHolderName: initialData.accountHolderName || '',
          bankName: initialData.bankName || '',
          accountNumber: initialData.accountNumber || '',
          routingNumber: initialData.routingNumber || '',
          swiftCode: initialData.swiftCode || '',
          accountType: initialData.accountType || AccountTypeOptions[0].value,
          isDefault: initialData.isDefault ?? false, // Use nullish coalescing to preserve false values
        });
      }
    } else {
      // Reset form when modal is closed
      methods.reset({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
        accountType: AccountTypeOptions[0].value,
        isDefault: totalBankAccount ? false : true,
      });
    }
  }, [initialData, isOpen, methods, totalBankAccount]);

  const {
    handleSubmit,
    formState: { },
    reset,
    control,
  } = methods;

  const handleFormSubmit = async (data: BankAccountFormData) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    // Only reset form when modal is being closed (not during submission)
    if (!isSubmitting) {
      reset();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] p-0 bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 pt-4 sm:px-6 pb-0 mb-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {isEdit ? 'Manage Account' : 'Add New Account'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-4 sm:p-6 space-y-4 sm:space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormInput
                disabled={isEdit || isSubmitting}
                name="accountHolderName"
                label="Account Holder Name"
                placeholder="Enter Account Holder Name"
              />
              <FormInput name="bankName" label="Bank Name"     disabled={isEdit || isSubmitting} placeholder="Enter Bank Name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormInput  
                disabled={isEdit || isSubmitting}
                name="accountNumber"
                label={ "Bank Account Number"}
                placeholder={ "Enter Bank Account Number"}
              />
              <FormInput
                disabled={isEdit || isSubmitting}
                  name="routingNumber"
                label="Routing Number"
                placeholder="Enter Routing Number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormInput     disabled={isEdit || isSubmitting} name="swiftCode" label="SWIFT/BIC Code" placeholder="Enter SWIFT Code" />

              <FormSelect     disabled={isEdit || isSubmitting} name="accountType" label="Account Type" options={AccountTypeOptions} />
            </div>

                    {/* Save as default checkbox */}
      {   totalBankAccount  &&      <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox 
                      id="isDefault"
                      checked={field.value}
                      disabled={isSubmitting}
                      onCheckedChange={field.onChange}
                      className="border-gray-300"
                    />
                    <Label 
                      htmlFor="isDefault" 
                      className="text-sm font-normal text-gray-600 cursor-pointer"
                    >
                      Save as default
                    </Label>
                  </div>
                )}
              />}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-[200px] md:w-[224px] border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-[200px] md:w-[224px] bg-primary text-white hover:bg-primary/90 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEdit ? 'Update Account' : 'Add Account'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
