import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';

import { FormSelect } from '@/components/forms/FormSelect';
const AccountTypeOptions = [
  { label: 'Checking', value: 'checking' as const },
  { label: 'Savings', value: 'savings' as const },
  { label: 'Current', value: 'current' as const },
];

const bankAccountSchema = z.object({
  accountHolderName: z
    .string()
    .trim()
    .min(1, 'Account holder name is required')
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100, 'Account holder name must not exceed 100 characters'),
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
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  initialData?: Partial<BankAccountFormData>;
  isEdit?: boolean;
}

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}) => {
  const methods = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: initialData || {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      accountType: AccountTypeOptions[0].value,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const handleFormSubmit = async (data: BankAccountFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting bank account:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] p-0 bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {isEdit ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="p-4 sm:p-6 space-y-4 sm:space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormInput
                name="accountHolderName"
                label="Account Holder Name"
                placeholder="Enter Account Holder Name"
              />
              <FormInput name="bankName" label="Bank Name" placeholder="Enter Bank Name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormInput
                name="accountNumber"
                label="Bank Account Number"
                placeholder="Enter Bank Account Number"
              />
              <FormInput
                name="routingNumber"
                label="Routing Number"
                placeholder="Enter Routing Number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <FormInput name="swiftCode" label="SWIFT/BIC Code" placeholder="Enter SWIFT Code" />

              <FormSelect name="accountType" label="Account Type" options={AccountTypeOptions} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-[200px] md:w-[224px] h-10 sm:h-11 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-[200px] md:w-[224px] h-10 sm:h-11 bg-primary text-white hover:bg-primary/90 text-sm sm:text-base"
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
