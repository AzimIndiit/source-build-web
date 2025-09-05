import axios from '@/lib/axios';

/**
 * Update user's current location
 */
export const updateCurrentLocation = async (locationId: string) => {
  const response = await axios.put('/user/current-location', {
    locationId,
  });
  return response.data;
};

/**
 * Clear user's current location
 */
export const clearCurrentLocation = async () => {
  const response = await axios.put('/user/current-location', {
    locationId: null,
  });
  return response.data;
};

/**
 * Get user profile with current location
 */
export const getUserProfile = async () => {
  const response = await axios.get('/user/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (data: any) => {
  const response = await axios.put('/user/profile', data);
  return response.data;
};
