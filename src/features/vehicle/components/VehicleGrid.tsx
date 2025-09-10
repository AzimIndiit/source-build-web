import React, { useState } from 'react';
import { SquarePen, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getStatusBadgeColor } from '@/features/dashboard/utils/orderUtils';
import { cn } from '@/lib/helpers';

import { useToggleProductStatusMutation } from '@/features/products/hooks/useProductMutations';

interface Vehicle {
  id?: string;
  _id?: string;
  userId?: string;
  displayName: string;
  slug: string;
  insuranceImages?: string[];
  vehicleImages?: string[];
  vehicleManufacturer?: string;
  vehicleModel: string;
  vehicleRegistrationNumber: string;
  vehicleType: string;
  createdAt: string;
  status: string;
}

interface VehicleGridProps {
  vehicle: Vehicle;
  onEdiVehicle: (e: React.MouseEvent, vehicleId: string) => void;
  onDeleteVehicle: (e: React.MouseEvent, vehicleId: string, displayName: string) => void;
}

const VehicleGrid: React.FC<VehicleGridProps> = ({ vehicle, onEdiVehicle, onDeleteVehicle }) => {
  const getImageUrl = (vehicle: Vehicle) => {
    if (vehicle.vehicleImages && vehicle.vehicleImages.length > 0) {
      return vehicle.vehicleImages[0];
    }
    return 'https://placehold.co/300x200.png';
  };

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden border border-gray-200 rounded-xl hover:shadow-md transition-shadow p-0 cursor-pointer group gap-0',
          vehicle.status === 'inactive' && 'grayscale'
        )}
      >
        <div className="relative">
          <img
            src={getImageUrl(vehicle)}
            alt={vehicle.displayName}
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x200.png';
            }}
          />
        </div>
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between items-start gap-2">
            {/* Price */}
            <div>
              <p className="text-[16px] text-gray-900 leading-snug line-clamp-1 mb-1 capitalize">
                {vehicle.displayName}
              </p>
              <p className="text-[14px] text-gray-500 leading-snug line-clamp-1 mb-1 capitalize">
                Reg.No.- {vehicle.vehicleRegistrationNumber}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                title="Edit"
                variant="ghost"
                size="icon"
                onClick={(e) => onEdiVehicle(e, vehicle.id || vehicle._id || '')}
                className="w-8 h-8 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-md"
              >
                <SquarePen />
              </Button>
              <Button
                title="Delete"
                variant="ghost"
                size="icon"
                onClick={(e) =>
                  onDeleteVehicle(e, vehicle.id || vehicle._id || '', vehicle.displayName)
                }
                className="w-8 h-8 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-md"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          {/* Title + Description */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="text-[14px] text-gray-500 leading-snug line-clamp-1 mb-1 capitalize">
                Vehicle Modal
              </p>
              <p className="text-[14px] text-gray-900 leading-snug line-clamp-1 mb-1 capitalize">
                {vehicle.vehicleModel}
              </p>
            </div>
            <div>
              <p className="text-[14px] text-gray-500 leading-snug line-clamp-1 mb-1 capitalize">
                Vehicle Manufacturer
              </p>
              <p className="text-[14px] text-gray-900 leading-snug line-clamp-1 mb-1 capitalize">
                {vehicle.vehicleManufacturer}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default VehicleGrid;
