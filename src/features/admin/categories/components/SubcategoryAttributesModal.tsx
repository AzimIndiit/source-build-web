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
import { Attribute } from '../types';

type InputType = 'text' | 'number' | 'dropdown' | 'multiselect' | 'boolean' | 'radio';

const inputTypes: { value: InputType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'boolean', label: 'Yes/No (Boolean)' },
  { value: 'radio', label: 'Radio Buttons' },
];

const attributeSchema = z.object({
  name: z.string().trim().min(1, 'Attribute name is required').max(100),
  inputType: z.enum(['text', 'number', 'dropdown', 'multiselect', 'boolean', 'radio']),
  required: z.boolean().optional(),
  values: z.array(
    z.object({
      value: z.string().trim().min(1, 'Value is required'),
      order: z.number().optional(),
    })
  ).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

interface SubcategoryAttributesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (attribute: Attribute) => void;
  attribute?: Attribute | null;
  isEditing?: boolean;
}

export const SubcategoryAttributesModal: React.FC<SubcategoryAttributesModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  attribute,
  isEditing = false,
}) => {
  const [selectedInputType, setSelectedInputType] = useState<InputType>('text');

  const methods = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: '',
      inputType: 'text',
      required: false,
      values: [],
      order: 0,
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

  const watchedInputType = watch('inputType');
  const watchedRequired = watch('required');
  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (attribute) {
      reset({
        name: attribute.name,
        inputType: attribute.inputType,
        required: attribute.required || false,
        values: attribute.values || [],
        order: attribute.order || 0,
        isActive: attribute.isActive !== undefined ? attribute.isActive : true,
      });
      setSelectedInputType(attribute.inputType);
    } else {
      reset({
        name: '',
        inputType: 'text',
        required: false,
        values: [],
        order: 0,
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
      append({ value: '', order: 0 });
    }
  }, [watchedInputType, setValue, fields.length, append]);

  const needsValues = ['dropdown', 'multiselect', 'radio'].includes(selectedInputType);

  const onSubmitForm = (values: AttributeFormData) => {
    const attributeData: Attribute = {
      ...values,
      values: needsValues ? values.values : undefined,
    };
    onAdd(attributeData);
    reset();
    onClose();
  };

  const handleAddValue = () => append({ value: '', order: fields.length });
  const handleMoveValue = (from: number, to: number) => {
    if (to >= 0 && to < fields.length) move(from, to);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Attribute' : 'Add Attribute'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Attribute Name */}
            <FormInput
              name="name"
              label="Attribute Name"
              placeholder="Enter attribute name"
              type="text"
            />

            {/* Input Type */}
            <FormSelect
              name="inputType"
              label="Input Type"
              placeholder="Select input type"
              options={inputTypes}
            />

            {/* Values for dropdown/multiselect/radio */}
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
                      className="flex-1"
                    />
                    <Input
                      {...register(`values.${index}.order`, {
                        setValueAs: (v) => parseInt(v, 10) || 0,
                      })}
                      type="number"
                      placeholder="Order"
                      className="w-20"
                    />
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          className="h-8 w-8"
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
                          className="h-8 w-8"
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveValue(index, index + 1)}
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        className="h-8 w-8"
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
                {errors.values && (
                  <p className="text-sm text-red-600">Please add at least one option</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddValue}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {/* Required Field */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="required" className="text-base font-medium">
                  Required Field
                </Label>
                <p className="text-sm text-gray-500">
                  Make this attribute mandatory for products
                </p>
              </div>
              <Checkbox
                id="required"
                checked={watchedRequired}
                onCheckedChange={(checked) => setValue('required', !!checked)}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order (Optional)</Label>
              <Input
                {...register('order', {
                  setValueAs: (value) => {
                    const parsed = parseInt(value, 10);
                    return isNaN(parsed) ? 0 : parsed;
                  },
                })}
                id="order"
                type="number"
                min={0}
                placeholder="0"
              />
              {errors.order && (
                <p className="text-sm text-red-600">{errors.order.message}</p>
              )}
              <p className="text-sm text-gray-500">Lower numbers appear first</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active
                </Label>
                <p className="text-sm text-gray-500">
                  Enable or disable this attribute
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watchedIsActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 w-[120px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-6 w-[120px]"
              >
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};