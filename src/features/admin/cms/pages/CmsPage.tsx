import React, { useState } from 'react';
import { usePagesQuery, useCreatePage, useUpdatePage } from '../hooks/useCmsMutations';
import { CmsPage as CmsPageType, ContentType } from '../types';
import { CmsPageSkeleton } from '../components/CmsPageSkeleton';
import { CmsDataTable } from '../components/CmsDataTable';
import { AddCmsModal } from '../components/AddCmsModal';

const CmsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CmsPageType | null>(null);
  const [searchValue, setSearchValue] = useState('');

  // Fetch pages from API
  const { data, isLoading } = usePagesQuery();
  const createPageMutation = useCreatePage();
  const updatePageMutation = useUpdatePage();

  const handleViewPage = (page: CmsPageType) => {
    // Open modal for viewing/editing
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleEditPage = (page: CmsPageType) => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleAddPage = () => {
    setSelectedPage(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
    console.log('selectedPage', selectedPage, data);
    if (selectedPage) {
      // Build update data based on what's provided
      const updateData: any = {
        title: data.title,
        content: data.content || '',
      };

      // Include type if provided (from the form data)
      if (data.type) {
        updateData.type = data.type;
      }

      // Include sections if provided (for landing pages)
      if (data.sections) {
        updateData.sections = data.sections;
      }

      console.log('Updating page with data:', updateData);

      await updatePageMutation.mutateAsync({
        id: selectedPage._id,
        data: updateData,
      });
    } else {
      // Create new page
      await createPageMutation.mutateAsync({
        type: data.type || (data.isLandingPage ? ContentType.LANDING_PAGE : ContentType.PAGE),
        title: data.title,
        content: data.content,
        sections: data.sections,
      });
    }
    setIsModalOpen(false);
    setSelectedPage(null);
  };

  // Transform the data to match the expected format
  const pages = Array.isArray(data?.data) ? data.data : [];
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Show full page skeleton only on initial load
  if (isLoading) {
    return <CmsPageSkeleton />;
  }

  return (
    <div className="py-4 md:p-6 space-y-6">
      {/* Pages Data Table */}
      <CmsDataTable
        data={filteredPages}
        onView={handleViewPage}
        onEdit={handleEditPage}
        title="Pages"
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
        onAddPage={handleAddPage}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddCmsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPage(null);
          }}
          onSubmit={handleModalSubmit}
          cms={selectedPage}
          isLoading={createPageMutation.isPending || updatePageMutation.isPending}
          edit={!!selectedPage}
        />
      )}
    </div>
  );
};

export default CmsPage;
