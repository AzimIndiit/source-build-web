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

export const FormTextarea: React.FC<FormTextareaProps> = ({ name, label, customError, ...props }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

const error = errors[name] || customError;

  return (
    <div className="w-full">
      <Label htmlFor={name} className={cn(
        'text-figma-text-primary font-helvetica font-medium text-figma-sm mb-figma-md',
        error && 'text-red-600'
      )}>
        {label}
      </Label>
      <Textarea
        id={name}
        {...register(name)}
        {...props}
        className={cn(
          'mt-figma-md resize-none rounded-figma-md min-h-[160px]',
          'border border-figma-border-secondary bg-figma-white',
          'px-figma-xl py-figma-lg text-figma-sm font-helvetica',
          'placeholder:text-figma-text-secondary',
          'focus:border-figma-primary focus:ring-2 focus:ring-figma-primary/20',
          'disabled:opacity-figma-disabled disabled:cursor-not-allowed',
          'transition-all duration-200',
          error && 'border-red-500 focus:ring-red-500',
          props.className
        )}
      />
      {error && (
        <p className="text-red-500 text-figma-xs mt-figma-sm">{error.message?.toString()}</p>
      )}
    </div>
  );
}; 