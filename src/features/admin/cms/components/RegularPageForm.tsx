import React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/forms/FormInput';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CmsPage, CreateCmsPagePayload, UpdateCmsPagePayload } from '../types';
import '../styles/ckeditor.css';

const regularPageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  content: z.string().min(1, 'Content is required'),
});

type RegularPageFormData = z.infer<typeof regularPageSchema>;

interface RegularPageFormProps {
  onSubmit: (data: CreateCmsPagePayload | UpdateCmsPagePayload) => Promise<void>;
  onClose: () => void;
  cms?: CmsPage | null;
  isLoading?: boolean;
  edit?: boolean;
}

export const RegularPageForm: React.FC<RegularPageFormProps> = ({
  onSubmit,
  onClose,
  cms,
  isLoading = false,
  edit = false,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const methods = useForm<RegularPageFormData>({
    resolver: zodResolver(regularPageSchema),
    defaultValues: {
      title: '',
      content: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  React.useEffect(() => {
    if (cms) {
      reset({
        title: cms.title,
        content: cms.content || '',
      });
    } else {
      reset({
        title: '',
        content: '',
      });
    }
  }, [cms, reset]);

  const onSubmitForm = async (values: RegularPageFormData) => {
    console.log('📝 RegularPageForm: onSubmitForm started', {
      edit,
      pageId: cms?._id,
      values: {
        title: values.title,
        contentLength: values.content?.length || 0,
      },
    });

    try {
      setIsSubmitting(true);

      const submitData: any = {
        title: values.title,
        content: values.content || '',
        type: 'page',
      };

      console.log('📝 RegularPageForm: Submitting regular page', {
        isNewPage: !edit,
        submitData,
      });

      await onSubmit(submitData);
      console.log('✅ RegularPageForm: Regular page operation completed successfully');

      reset();
      onClose();
    } catch (error) {
      console.error('❌ RegularPageForm: onSubmitForm failed', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        edit,
        pageId: cms?._id,
      });
      // Error is handled in the mutation
    } finally {
      console.log('🏁 RegularPageForm: onSubmitForm completed, setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Page Title */}
          <div className="space-y-4">
            <FormInput
              name="title"
              label="Title"
              placeholder="Enter page title"
              disabled={edit || isSubmitting || isLoading}
              type="text"
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium text-gray-900">Content</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <div className="ckeditor-wrapper border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <CKEditor
                    editor={ClassicEditor}
                    config={{
                      toolbar: {
                        items: [
                          'heading',
                          '|',
                          'bold',
                          'italic',
                          'link',
                          '|',
                          'bulletedList',
                          'numberedList',
                          '|',
                          'blockQuote',
                          'insertTable',
                          '|',
                          'undo',
                          'redo',
                        ],
                        shouldNotGroupWhenFull: false,
                      },
                      placeholder: 'Enter page content...',
                      initialData: field.value || '',
                    }}
                    onReady={(editor) => {
                      if (isSubmitting || isLoading) {
                        editor.enableReadOnlyMode('submit');
                      }
                      const updateToolbarResponsive = () => {
                        const width = window.innerWidth;
                        if (width < 640) {
                          editor.ui.view.toolbar.element?.classList.add('mobile-toolbar');
                        } else {
                          editor.ui.view.toolbar.element?.classList.remove('mobile-toolbar');
                        }
                      };
                      updateToolbarResponsive();
                      window.addEventListener('resize', updateToolbarResponsive);
                    }}
                    onChange={(_event, editor) => {
                      const data = editor.getData();
                      field.onChange(data);
                    }}
                  />
                </div>
              )}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 min-w-0 sm:min-w-[220px] border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 min-w-0 sm:min-w-[220px] bg-primary hover:bg-primary/90 text-white"
          >
            {isSubmitting || isLoading
              ? edit
                ? 'Updating...'
                : 'Creating...'
              : edit
                ? 'Update'
                : 'Create'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
