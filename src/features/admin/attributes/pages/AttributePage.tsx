import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AttributeModal } from '../components/AttributeModal';
import { AttributeDataTable } from '../components/AttributeDataTable';
import { useAttributeMutations } from '../hooks/useAttributeMutations';
import { attributeService } from '../services/attributeService';
import { subcategoryService } from '../../categories/services/subcategoryService';
import { Attribute, GetAttributesQuery, InputType } from '../types';
import { useDebounce } from '@/hooks/useDebounce';

const AttributePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedInputType, setSelectedInputType] = useState<InputType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    createAttributeMutation,
    updateAttributeMutation,
    deleteAttributeMutation,
    toggleStatusMutation,
  } = useAttributeMutations();

  // Build query params
  const queryParams: GetAttributesQuery = {
    page,
    limit: 10,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedSubcategory !== 'all' && { subcategory: selectedSubcategory }),
    ...(selectedInputType !== 'all' && { inputType: selectedInputType }),
    ...(selectedStatus !== 'all' && { isActive: selectedStatus }),
    sortBy: 'order',
    sortOrder: 'asc',
  };

  // Fetch attributes
  const { data: attributesData, isLoading } = useQuery({
    queryKey: ['attributes', queryParams],
    queryFn: () => attributeService.getAttributes(queryParams),
  });

  const handleCreate = () => {
    setSelectedAttribute(null);
    setIsModalOpen(true);
  };

  const handleEdit = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedAttribute) {
      await updateAttributeMutation.mutateAsync({
        id: selectedAttribute._id,
        data,
      });
    } else {
      await createAttributeMutation.mutateAsync(data);
    }
    setIsModalOpen(false);
    setSelectedAttribute(null);
  };

  const handleDelete = (id: string) => {
    deleteAttributeMutation.mutate(id);
  };

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate(id);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSubcategory('all');
    setSelectedInputType('all');
    setSelectedStatus('all');
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedSubcategory !== 'all' ||
    selectedInputType !== 'all' ||
    selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Attributes Table */}
      <AttributeDataTable
        title="Attributes"
        attributes={attributesData?.data || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
        onAddAttribute={handleCreate}
      />

      {/* Attribute Modal */}
      <AttributeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAttribute(null);
        }}
        onSubmit={handleSubmit}
        attribute={selectedAttribute}
        isLoading={createAttributeMutation.isPending || updateAttributeMutation.isPending}
        edit={!!selectedAttribute}
      />
    </div>
  );
};

export default AttributePage;
