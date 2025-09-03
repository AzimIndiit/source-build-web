import React, { useState, useEffect, useCallback } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import {
  MapPin,
  Home,
  Train,
  Edit2,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useAuthStore from '@/stores/authStore';
import { AddSavedAddressModal } from '@/features/profile/components/AddSavedAddressModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import {
  SavedAddress as SavedAddressType,
  CreateSavedAddressPayload,
} from '@/features/profile/services/addressService';
import {
  useSavedAddresssQuery,
  useUpdateSavedAddressMutation,
  useDeleteSavedAddressMutation,
} from '@/features/profile/hooks/useSavedAddressMutations';
import { useNavigate } from 'react-router-dom';

interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface SavedAddress extends SavedAddressType {
  icon?: React.ReactNode;
}

interface LocationSearchProps {
  className?: string;
  variant?: 'navbar' | 'full';
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  className,
  variant = 'navbar',
}) => {
  const { currentLocation, setCurrentLocation, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddressType | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<SavedAddressType | null>(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  // Queries and Mutations - only fetch saved addresses when authenticated
  const { data: addressesData, isLoading: addressesLoading } =
    useSavedAddresssQuery(isAuthenticated);
  const updateMutation = useUpdateSavedAddressMutation();
  const deleteMutation = useDeleteSavedAddressMutation();

  // Get saved addresses from API
  const savedAddresses: SavedAddress[] = React.useMemo(() => {
    if (!addressesData?.data) return [];
    const addresses = Array.isArray(addressesData.data) ? addressesData.data : [addressesData.data];
    return addresses.map((addr) => ({
      ...addr,
      address: addr.formattedAddress || '',
      icon: addr.type === 'home' ? <Home className="w-5 h-5" /> : <MapPin className="w-5 h-5" />,
    }));
  }, [addressesData]);

  // Mock saved addresses - temporarily keeping for fallback
  const [mockSavedAddresses] = useState<any[]>([
    {
      id: '1',
      type: 'home',
      label: 'Home',
      address:
        '3Rd floor, Plot no 22, gali no 19 jain road dwarika mor, Toni property Block RK, Laxmi Vihar, New Delhi',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: '2',
      type: 'home',
      label: 'Home',
      address: 'R-12, 4th Floor Jogabai Extension, Jamia Nagar, Okhla, New Delhi',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: '3',
      type: 'other',
      label: 'Train',
      address: 'seemachal express coach A1 seat 10 platform 1 ,Anand vihar railway station',
      icon: <Train className="w-5 h-5" />,
    },
    {
      id: '4',
      type: 'home',
      label: 'Home',
      address: 'Floor 2nd, Block J, Sector 22 Block J, Sector 22, Noida',
      icon: <Home className="w-5 h-5" />,
    },
  ]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'us' },
      types: ['geocode', 'establishment'],
    },
    debounce: 300,
  });

  // Detect user's current location
  const detectLocation = useCallback(() => {
    setIsDetectingLocation(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const geocoder = new window.google.maps.Geocoder();
          const response = await geocoder.geocode({
            location: { lat: latitude, lng: longitude },
          });

          if (response.results[0]) {
            const result = response.results[0];
            const locationData = parseGooglePlace(result, latitude, longitude);
            setCurrentLocation(locationData);
            setIsOpen(false);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          alert('Unable to get address from your location');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, [setCurrentLocation]);

  // Parse Google Place result
  const parseGooglePlace = (
    place: google.maps.GeocoderResult | google.maps.places.PlaceResult,
    lat?: number,
    lng?: number
  ): LocationData => {
    const addressComponents = place.address_components || [];

    let city = '';
    let state = '';
    let country = '';
    let zipCode = '';
    let streetNumber = '';
    let route = '';

    addressComponents.forEach((component) => {
      const types = component.types;

      if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      } else if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      }
    });

    const address = streetNumber && route ? `${streetNumber} ${route}` : route || '';

    return {
      address,
      city,
      state,
      country,
      zipCode,
      lat: lat || 0,
      lng: lng || 0,
      formattedAddress: place.formatted_address || `${city}, ${state}`,
    };
  };

  // Handle place selection from autocomplete
  const handleSelect = async (description: string, placeId?: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({
        address: description,
        ...(placeId && { placeId }),
      });
      const { lat, lng } = await getLatLng(results[0]);

      const locationData = parseGooglePlace(results[0], lat, lng);
      setCurrentLocation(locationData);
      setIsOpen(false);
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  };

  // Handle saved address selection
  const handleSavedAddressSelect = (address: SavedAddress) => {
    setCurrentLocation({
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      lat: address.latitude || 0,
      lng: address.longitude || 0,
      formattedAddress: address.formattedAddress || address.address,
    });
    setIsOpen(false);
  };

  // Handle edit address
  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setEditModalOpen(true);
  };

  // Handle delete address
  const handleDeleteAddress = (address: SavedAddress) => {
    setAddressToDelete(address);
    setDeleteModalOpen(true);
  };

  // Confirm delete
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

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setAddressToDelete(null);
  };

  // Handle address update
  const handleUpdateAddress = async (data: CreateSavedAddressPayload) => {
    try {
      if (editingAddress) {
        const addressId = editingAddress.id || editingAddress._id;
        if (addressId) {
          await updateMutation.mutateAsync({ id: addressId, data });
        }
      }
      setEditModalOpen(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingAddress(null);
  };

  // Get display text for current location
  const getDisplayText = () => {
    if (!currentLocation) {
      return 'Select Location';
    }

    // Show shortened version for navbar
    if (variant === 'navbar') {
      const parts = currentLocation.formattedAddress.split(',');
      const shortAddress = parts.slice(0, 2).join(',').trim();

      // Apply max length with ellipsis for navbar
      const maxLength = 20;
      if (shortAddress.length > maxLength) {
        return shortAddress.substring(0, maxLength) + '...';
      }
      return shortAddress;
    }

    // For full address display, apply max length
    const maxLength = 20;
    if (currentLocation.formattedAddress.length > maxLength) {
      return currentLocation.formattedAddress.substring(0, maxLength) + '...';
    }

    return currentLocation.formattedAddress;
  };

  if (variant === 'full') {
    return (
      <div className={cn('w-full', className)}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Search delivery location"
            className="pl-10"
          />
        </div>

        {status === 'OK' && (
          <div className="mt-2 rounded-lg border bg-white shadow-lg">
            {data.map(({ place_id, description }) => (
              <button
                key={place_id}
                onClick={() => handleSelect(description, place_id)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Navbar variant with modal
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'bg-blue-50 flex gap-2 h-[42px] items-center px-2 md:px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors outline-none',
          className
        )}
      >
        <MapPin className="w-5 h-5 text-gray-700" />
        <div className="flex flex-col text-left">
          <span className="text-xs text-gray-600 hidden md:block">Shipping to</span>
          <span className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-1  line-clamp-">
            {getDisplayText()}
            <ChevronDown size={12} />
          </span>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[600px] p-0 bg-white">
          <DialogHeader className="px-6 pt-6 border-b pb-4 border-gray-200">
            <DialogTitle className="text-xl font-semibold">Change Location</DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Search and Detect Location */}
            {/* <div className="flex gap-3 items-center">
              <Button
                onClick={detectLocation}
                disabled={isDetectingLocation}
                className="bg-primary hover:bg-primary/80 text-white font-medium"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  'Detect my location'
                )}
              </Button>
                            
              <span className="text-gray-400">OR</span>
              
              <div className="flex-1 relative">
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={!ready}
                  placeholder="search delivery location"
                  className="w-full"
                />
              </div>
            </div> */}

            {/* Search Results */}
            {status === 'OK' && (
              <div className="space-y-2">
                {data.map(({ place_id, description }) => (
                  <button
                    key={place_id}
                    onClick={() => handleSelect(description, place_id)}
                    className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-700">{description}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Saved Addresses */}
            {!value && savedAddresses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Your saved addresses</h3>
                  <Button
                    variant="outline"
                    className="h-10 border-gray-500 hover:bg-gray-50 text-gray-600"
                    onClick={() => {
                      navigate('/profile/address');
                      setIsOpen(false);
                    }}
                  >
                    Manage Addresses
                  </Button>
                </div>
                {/* Address list with show more/less functionality */}
                <div
                  className={cn(
                    'space-y-3 transition-all duration-300',
                    showAllAddresses &&
                      savedAddresses.length > 3 &&
                      'max-h-[400px] overflow-y-auto pr-2'
                  )}
                >
                  {(showAllAddresses ? savedAddresses : savedAddresses.slice(0, 3)).map(
                    (address) => (
                      <div
                        key={address.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer relative bg-gray-50 border border-gray-200"
                        onClick={() => handleSavedAddressSelect(address)}
                      >
                        {/* <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        {address.icon || <MapPin className="w-5 h-5 text-yellow-600" />}
                      </div> */}

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {' '}
                            <h4 className="font-medium text-gray-900">{address.name}</h4>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-primary bg-blue-100 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{address.formattedAddress}</p>
                        </div>
                        {/* 
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address);
                          }}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div> */}
                      </div>
                    )
                  )}
                </div>

                {/* Show More/Less button */}
                {savedAddresses.length > 3 && (
                  <button
                    onClick={() => setShowAllAddresses(!showAllAddresses)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mx-auto"
                  >
                    {showAllAddresses ? (
                      <>
                        Show Less
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show More ({savedAddresses.length - 3} more)
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <AddSavedAddressModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateAddress}
        totalAddress={savedAddresses.length > 0}
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
                formattedAddress: editingAddress.formattedAddress,
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
    </>
  );
};
