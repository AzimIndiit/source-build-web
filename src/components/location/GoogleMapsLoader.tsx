import React, { useEffect } from 'react';
import { Libraries, useJsApiLoader } from '@react-google-maps/api';

const libraries: Libraries = ['places'];

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

export const GoogleMapsLoader: React.FC<GoogleMapsLoaderProps> = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (loadError) {
      console.error('Error loading Google Maps:', loadError);
    }
  }, [loadError]);

  // if (!isLoaded) {
  //   return (
  //     <div className="flex items-center justify-center p-4">
  //       <div className="text-gray-500">Loading maps...</div>
  //     </div>
  //   );
  // }

  // if (loadError) {
  //   return (
  //     <div className="flex items-center justify-center p-4">
  //       <div className="text-red-500">Error loading maps. Please check your API key.</div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
};
