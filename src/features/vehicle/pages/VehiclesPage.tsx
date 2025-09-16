import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { DeleteConfirmationModal } from '@/components/ui';
import VehicleGrid from '../components/VehicleGrid';
import { VehiclePageSkeleton } from '../components/VehiclePageSkeleton';
import { useDeleteVehicleMutation, useVehiclesQuery } from '../hooks/useVehicleMutations';
import { EmptyState } from '@/components/common/EmptyState';
import VehicleEmptyIcon from '@/assets/svg/vehicleEmptyState.svg';

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    vehicleId: string;
    displayName: string;
  }>({
    isOpen: false,
    vehicleId: '',
    displayName: '',
  });
  const itemsPerPage = 10;

  // Fetch vehicles from API
  const { data, isLoading, isError, refetch } = useVehiclesQuery({
    page: currentPage,
    limit: itemsPerPage,
    location: selectedLocation === 'all' ? undefined : selectedLocation,
  });

  const deleteVehicleMutation = useDeleteVehicleMutation();

  const handleEditVehicle = (e: React.MouseEvent, vehicleId: string) => {
    e.stopPropagation();
    navigate(`/driver/vehicles/${vehicleId}/edit`);
  };

  const handleDeleteVehicle = (e: React.MouseEvent, vehicleId: string, displayName: string) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      vehicleId,
      displayName,
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteVehicleMutation.mutateAsync(deleteModal.vehicleId);
      setDeleteModal({ isOpen: false, vehicleId: '', displayName: '' });
      refetch();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, vehicleId: '', displayName: '' });
  };

  // Loading state
  if (isLoading) {
    return <VehiclePageSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="py-4 md:p-4 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Listing</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-600">Failed to load vehicles</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle both old and new API response structures
  const responseData: any = data?.data;
  const vehicles = Array.isArray(responseData) ? responseData : [];

  const totalPages = data?.meta?.pagination?.pages || 1;

  // Empty state
  if (vehicles.length === 0) {
    return (
      <div className="py-4 md:p-4 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Listing</h1>
        </div>
        <EmptyState
          title="No vehicles found"
          description="Add a vehicle to get started with your deliveries"
          icon={<img src={VehicleEmptyIcon} className="w-64 h-56" />}
          className="h-64"
        />
      </div>
    );
  }

  return (
    <div className="py-4 md:p-4 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Vehicle Management</h1>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {vehicles.map((vehicle: any) => (
          <VehicleGrid
            key={vehicle.id || vehicle._id}
            vehicle={vehicle}
            onEdiVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        description={
          <>
            Are you sure you want to delete{' '}
            <strong className="font-semibold">"{deleteModal.displayName}"</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteVehicleMutation.isPending}
      />
    </div>
  );
};

export default VehiclesPage;
