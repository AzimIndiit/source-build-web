import { useCallback, useRef, useState, useEffect } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { formatPhoneNumber } from '@/lib/utils';

/**
 * Hook that provides phone number formatting functionality
 * Shows formatted value but allows editing raw numbers
 * @param setValue - react-hook-form setValue function
 * @param watch - react-hook-form watch function
 * @param fieldName - The field name to format
 * @returns Object with handler and formatted value
 */
export function usePhoneFormatter(
  setValue: UseFormSetValue<any>,
  watch: UseFormWatch<any>,
  fieldName: string
) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  
  // Watch the form value
  const formValue = watch(fieldName);
  
  // Update local value when form value changes (and we're not editing)
  useEffect(() => {
    if (!isEditing && formValue) {
      setLocalValue(formValue);
    }
  }, [formValue, isEditing]);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsEditing(true);
      
      const currentValue = e.target.value;
      // Extract only digits
      let digits = currentValue.replace(/\D/g, "");
      
      // Limit to 10 digits
      if (digits.length > 10) {
        digits = digits.slice(0, 10);
      }
      
      // Update local display with raw digits
      setLocalValue(digits);
      setValue(fieldName, digits, { 
        shouldValidate: false,
        shouldDirty: true,
        shouldTouch: false 
      });
      
      // Set timeout to format after user stops typing
      timeoutRef.current = setTimeout(() => {
        if (digits.length > 0) {
          const formatted = formatPhoneNumber(digits);
          setLocalValue(formatted);
          setValue(fieldName, formatted, { 
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true 
          });
        }
        setIsEditing(false);
      }, 2000); // 2 seconds delay
    },
    [setValue, fieldName]
  );

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    // Show raw digits when focusing
    const digits = localValue.replace(/\D/g, "");
    if (digits !== localValue) {
      setLocalValue(digits);
    }
  }, [localValue]);

  const handleBlur = useCallback(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Format on blur if we have digits
    const digits = localValue.replace(/\D/g, "");
    if (digits.length > 0) {
      const formatted = formatPhoneNumber(digits);
      setLocalValue(formatted);
      setValue(fieldName, formatted, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true 
      });
    }
    setIsEditing(false);
  }, [localValue, setValue, fieldName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value: localValue,
    onChange: handlePhoneChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
}