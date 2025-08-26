import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  customError?: any;
  leftIcon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  customError,
  leftIcon,
  className,
  type,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  // Handle nested field errors (e.g., variants.0.color)
  const getNestedError = (path: string, errors: any): any => {
    const keys = path.split('.');
    let current = errors;

    for (const key of keys) {
      if (!current) return null;
      current = current[key];
    }

    return current;
  };

  const error = getNestedError(name, errors) || customError;
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;
  const watchedValue = watch(name);

  return (
    <div className="w-full relative">
      {label && (
        <Label htmlFor={name} className={error ? 'text-red-600' : ''}>
          {label}
        </Label>
      )}
      <div className={`relative ${label ? 'mt-2' : ''}`}>
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</div>
        )}
        <Input
          id={name}
          {...register(name)}
          {...props}
          type={inputType}
          className={cn(
            leftIcon && 'pl-10',
            isPasswordField && 'pr-12',
            error && '!border-red-500 focus-visible:!border-red-500 focus-visible:!ring-red-500/20',
            className
          )}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 outline-none focus:outline-none focus:ring-0 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message?.toString()}</p>}
      {type === 'color' && (
        <div className="absolute right-5 top-3 text-sm   bg-white  w-20 justify-center flex items-center  rounded border cursor-pointer p-1">
          {' '}
          {watchedValue}
        </div>
      )}{' '}
    </div>
  );
};
