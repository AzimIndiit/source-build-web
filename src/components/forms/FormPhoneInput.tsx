import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatPhoneNumber } from '@/lib/utils';

interface FormPhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  name: string;
  label: string;
  customError?: any;
}

export const FormPhoneInput: React.FC<FormPhoneInputProps> = ({ 
  name, 
  label, 
  customError,
  className,
  ...props 
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name] || customError;
  
  return (
    <div className="w-full">
      <Label htmlFor={name} className={error ? 'text-red-600' : ''}>
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const currentValue = e.target.value;
            const previousValue = field.value || '';
            
            // If user is deleting/backspacing, allow it
            if (currentValue.length < previousValue.length) {
              field.onChange(currentValue);
              return;
            }
            
            // Extract only digits
            let digits = currentValue.replace(/\D/g, "");
            
            // Limit to 10 digits
            if (digits.length > 10) {
              digits = digits.slice(0, 10);
            }
            
            // Format as user types
            const formatted = digits.length > 0 ? formatPhoneNumber(digits) : '';
            field.onChange(formatted);
          };

          const handleBlur = () => {
            // Ensure proper formatting on blur
            const currentValue = field.value || '';
            const digits = currentValue.replace(/\D/g, "");
            if (digits.length > 0) {
              const formatted = formatPhoneNumber(digits);
              field.onChange(formatted);
            } else {
              // Clear the field if no valid digits
              field.onChange('');
            }
            field.onBlur();
          };

          return (
            <div className="relative mt-2">
              <Input
                {...field}
                {...props}
                id={name}
                type="tel"
                inputMode="numeric"
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  error && '!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/20',
                  className
                )}
                value={field.value || ''}
              />
            </div>
          );
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message?.toString()}</p>
      )}
    </div>
  );
};