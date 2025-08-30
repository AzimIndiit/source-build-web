import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { FormTextarea } from '@/components/forms/FormTextarea';
import toast from 'react-hot-toast';
import { contactService } from '../services/contactService';
import { useMutation } from '@tanstack/react-query';

// Zod validation schema
const personalDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .max(100, 'Email must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

type ContactFormPageData = z.infer<typeof personalDetailsSchema>;

interface ContactFormPageProps {
  initialData?: Partial<ContactFormPageData>;
  onSave?: (data: ContactFormPageData) => void;
}

const ContactFormPage: React.FC<ContactFormPageProps> = ({
  initialData = {
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  },
  onSave,
}) => {
  const methods = useForm<ContactFormPageData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: initialData,
  });

  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  const mutation = useMutation({
    mutationFn: contactService.submitContactForm,
    onSuccess: (response) => {
      toast.success(response.message || 'Contact form submitted successfully');
      reset();
      onSave?.(response.data as ContactFormPageData);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to submit contact form';
      toast.error(errorMessage);
    },
  });

  const onSubmit = async (data: ContactFormPageData) => {
    // Trim all string values before saving
    const trimmedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ])
    ) as ContactFormPageData;

    mutation.mutate(trimmedData);
  };

  return (
    <>
      <Card className="bg-white border-gray-200 shadow-none">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Contact Us</h2>

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* Form Fields */}
              <div className="space-y-4 sm:space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormInput
                    name="firstName"
                    label="First Name *"
                    placeholder="Enter your first name"
                    required
                  />
                  <FormInput
                    name="lastName"
                    label="Last Name *"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                {/* Email and Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <FormInput
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Message */}
                <FormTextarea
                  name="message"
                  label="Message"
                  placeholder="Enter your message..."
                  rows={5}
                  className="min-h-[120px]"
                />

                <div className="pt-4 sm:pt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                  <div className="w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[300px] lg:min-w-[469px] text-white px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50"
                    >
                      {mutation.isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </>
  );
};

export default ContactFormPage;
