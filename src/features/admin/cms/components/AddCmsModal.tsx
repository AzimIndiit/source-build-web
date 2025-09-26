import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CmsPage, CreateCmsPagePayload, UpdateCmsPagePayload } from '../types';
import { RegularPageForm } from './RegularPageForm';
import { LandingPageForm } from './LandingPageForm';

interface AddCmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCmsPagePayload | UpdateCmsPagePayload) => Promise<void>;
  cms?: CmsPage | null;
  isLoading?: boolean;
  edit?: boolean;
}

export const AddCmsModal: React.FC<AddCmsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cms,
  isLoading = false,
  edit = false,
}) => {
  const [isLandingPage, setIsLandingPage] = useState(false);

  useEffect(() => {
    if (cms) {
      setIsLandingPage(cms.type === 'landing_page');
    } else {
      setIsLandingPage(false);
    }
  }, [cms]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-7xl bg-white max-h-[90vh] w-[95vw] sm:w-[90vw] lg:w-[80vw] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {edit ? 'Edit Page' : 'Create New Page'}
          </DialogTitle>
        </DialogHeader>

        {/* Regular Page Form */}
        {!isLandingPage && (
          <RegularPageForm
            onSubmit={onSubmit}
            onClose={onClose}
            cms={cms}
            isLoading={isLoading}
            edit={edit}
          />
        )}

        {/* Landing Page Form */}
        {isLandingPage && (
          <LandingPageForm
            onSubmit={onSubmit}
            onClose={onClose}
            cms={cms}
            isLoading={isLoading}
            edit={edit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
