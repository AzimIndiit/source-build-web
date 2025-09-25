import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Attribute, CreateAttributeDto, UpdateAttributeDto, InputType } from '../types';

const inputTypes: { value: InputType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'boolean', label: 'Yes/No (Boolean)' },
  { value: 'radio', label: 'Radio Buttons' },
];

const attributeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Attribute name is required')
    .max(100, 'Attribute name must not exceed 100 characters'),
  inputType: z.enum(['text', 'number', 'dropdown', 'multiselect', 'boolean', 'radio']),
  required: z.boolean().optional(),
  values: z
    .array(
      z.object({
        value: z.string().trim().min(1, 'Value is required'),
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

interface AttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAttributeDto | UpdateAttributeDto) => Promise<void>;
  attribute?: Attribute | null;
  isLoading?: boolean;
  edit?: boolean;
}

export const AttributeModal: React.FC<AttributeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  attribute,
  isLoading = false,
  edit = false,
}) => {
  const [selectedInputType, setSelectedInputType] = useState<InputType>('text');

  const methods = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: '',
      inputType: 'text',
      required: false,
      values: [],
      isActive: true,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'values',
  });

  const watchedIsActive = watch('isActive');
  const watchedInputType = watch('inputType');

  useEffect(() => {
    if (attribute) {
      reset({
        name: attribute.name,
        inputType: attribute.inputType,
        required: attribute.required || false,
        values: attribute.values || [],
        isActive: attribute.isActive,
      });
      setSelectedInputType(attribute.inputType);
    } else {
      reset({
        name: '',
        inputType: 'text',
        required: false,
        values: [],
        isActive: true,
      });
      setSelectedInputType('text');
    }
  }, [attribute, reset]);

  useEffect(() => {
    setSelectedInputType(watchedInputType);
    if (!['dropdown', 'multiselect', 'radio'].includes(watchedInputType)) {
      setValue('values', []);
    } else if (fields.length === 0) {
      append({ value: '' });
    }
  }, [watchedInputType, setValue, fields.length, append]);

  const needsValues = ['dropdown', 'multiselect', 'radio'].includes(selectedInputType);

  const onSubmitForm = async (values: AttributeFormData) => {
    const submitData: CreateAttributeDto | UpdateAttributeDto = {
      ...values,
      values: needsValues ? values.values : undefined,
    };
    await onSubmit(submitData);
    reset();
    onClose();
  };

  const handleAddValue = () => append({ value: '' });
  const handleMoveValue = (from: number, to: number) => {
    if (to >= 0 && to < fields.length) move(from, to);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{attribute ? 'Edit Attribute' : 'Create New Attribute'}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <FormInput
              name="name"
              label="Attribute Name"
              placeholder="Enter attribute name"
              disabled={isLoading}
              type="text"
              autoFocus={false}
            />

            {/* Input Type */}
            <FormSelect
              name="inputType"
              label="Input Type"
              placeholder="Select input type"
              options={inputTypes}
              disabled={isLoading}
            />

            {/* Values */}
            {needsValues && (
              <div className="space-y-2">
                <Label>
                  Options/Values <span className="text-red-500">*</span>
                </Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <Input
                      {...register(`values.${index}.value`)}
                      placeholder={`Option ${index + 1}`}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          className="h-8 w-8 border-none text-gray-500"
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveValue(index, index - 1)}
                        >
                          ↑
                        </Button>
                      )}
                      {index < fields.length - 1 && (
                        <Button
                          className="h-8 w-8 border-none text-gray-500"
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveValue(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        className="h-8 w-8 border-none"
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="h-10 text-white hove:text-white"
                    onClick={handleAddValue}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Status */}
            {/* {edit && (
              <div className="flex items-center justify-between rounded-lg p-4">
                <div className="space-y-0.5">
                  <Label>Status</Label>
                </div>
                <Switch
                  checked={watchedIsActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                  disabled={isLoading}
                />
              </div>
            )} */}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} disabled={isLoading} className='w-[220px] border-gray-200 text-gray-500'>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary text-white w-[220px]">
                Done
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
