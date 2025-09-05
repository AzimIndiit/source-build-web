import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  customError?: any;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
  customError,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name] || customError;

  return (
    <div className="w-full">
      {label && (
        <Label
          htmlFor={name}
          className={cn('text-gray-900 font-medium text-sm mb-3', error && 'text-red-600')}
        >
          {label}
        </Label>
      )}
      <Textarea
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          'resize-none rounded-sm min-h-[160px]',
          'border border-gray-300 bg-white',
          'px-4 py-3 text-sm',
          'placeholder:text-gray-500',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          error && '!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/20',
          props.className
        )}
      />
      {error && <p className="text-red-500 text-xs mt-2">{error.message?.toString()}</p>}
    </div>
  );
};
