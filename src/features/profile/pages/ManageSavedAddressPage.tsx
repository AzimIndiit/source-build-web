import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SavedAddressCard } from '../components/SavedAddressCard';
import { AddSavedAddressModal } from '../components/AddSavedAddressModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { Plus, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { SavedAddress, CreateSavedAddressPayload } from '../services/addressService';
import {
  useSavedAddresssQuery,
  useCreateSavedAddressMutation,
  useUpdateSavedAddressMutation,
  useDeleteSavedAddressMutation,
  useSetDefaultSavedAddressMutation,
} from '../hooks/useSavedAddressMutations';

const ManageSavedAddressPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<SavedAddress | null>(null);

  // Queries
  const { data: addressesData, isLoading, error } = useSavedAddresssQuery();

  // Mutations
  const createMutation = useCreateSavedAddressMutation();
  const updateMutation = useUpdateSavedAddressMutation();
  const deleteMutation = useDeleteSavedAddressMutation();
  const setDefaultMutation = useSetDefaultSavedAddressMutation();

  const addresses = Array.isArray(addressesData?.data) 
    ? addressesData.data 
    : addressesData?.data 
    ? [addressesData.data] 
    : [];

  const handleAddAddress = async (data: CreateSavedAddressPayload) => {
    try {
      if (editingAddress) {
        const addressId = editingAddress.id || editingAddress._id;
        if (addressId) {
          await updateMutation.mutateAsync({ id: addressId, data });
          // Only reset editing state after successful update
          setEditingAddress(null);
        }
      } else {
        await createMutation.mutateAsync(data);
      }
      // Only close modal on success
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      // Modal stays open so user can retry or fix the issue
      console.error('Failed to save address:', error);
    }
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDeleteAddress = (address: SavedAddress) => {
    setAddressToDelete(address);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (addressToDelete) {
      const addressId = addressToDelete.id || addressToDelete._id;
      if (addressId) {
        deleteMutation.mutate(addressId, {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setAddressToDelete(null);
          },
        });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setAddressToDelete(null);
  };

  const handleCloseModal = () => {
    // Reset states when user manually closes the modal
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSetDefault = (address: SavedAddress) => {
    const addressId = address.id || address._id;
    if (addressId) {
      setDefaultMutation.mutate(addressId);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200 shadow-none h-[calc(100vh-200px)] justify-center items-center">
        <CardContent className="px-4 sm:px-6">
          <div className="text-center py-12">Loading addresses...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-gray-200 shadow-none h-[calc(100vh-200px)] justify-center items-center">
        <CardContent className="px-4 sm:px-6">
          <div className="text-center py-12 text-red-500">
            Failed to load addresses. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-none h-[calc(100vh-200px)] flex flex-col">
      <CardContent className="px-4 sm:px-6 flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Saved Address</h2>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto min-w-full sm:min-w-[180px] h-10 sm:h-11 bg-primary hover:bg-primary/90 text-white px-3 sm:px-5 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </Button>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-1">
          {addresses.length > 0 ? (
            addresses.map((address: SavedAddress) => {
              const addressId = address.id || address._id || '';

              return (
                <SavedAddressCard
                  key={addressId}
                  name={address.name}
                  phoneNumber={address.phoneNumber}
                  formattedAddress={address.formattedAddress || ''}
                  
                  isDefault={address.isDefault}
                  onEdit={() => handleEditAddress(address)}
                  onDelete={() => handleDeleteAddress(address)}
                  onSetDefault={!address.isDefault ? () => handleSetDefault(address) : undefined}
                />
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center min-h-[400px]">
              <MapPin className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No addresses added yet</p>
    
            </div>
          )}
        </div>

        {/* Add/Edit Address Modal */}
        <AddSavedAddressModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleAddAddress}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          totalAddress={addresses.length !== 0}
          initialData={
            editingAddress
              ? {
                  name: editingAddress.name,
                  phoneNumber: editingAddress.phoneNumber,
                  city: editingAddress.city,
                  state: editingAddress.state,
                  country: editingAddress.country,
                  zipCode: editingAddress.zipCode,
                  latitude: editingAddress.latitude,
                  longitude: editingAddress.longitude,
                  location: editingAddress.location,
                  formattedAddress:editingAddress.formattedAddress,
                  isDefault: editingAddress.isDefault,
                  type: editingAddress.type,
                }
              : undefined
          }
          isEdit={!!editingAddress}
        />

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Address?"
            description={`Are you sure you want to delete the address for ${addressToDelete?.name}? This action cannot be undone.`}
            confirmText="Yes, I'm Sure"
            cancelText="Cancel"
            isLoading={deleteMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ManageSavedAddressPage;