import React from 'react';
import { Edit, Trash2, MapPin, SquarePen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

interface SavedAddressCardProps {
  name: string;
  phoneNumber: string;
  formattedAddress: string;

  isDefault?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
}

export const SavedAddressCard: React.FC<SavedAddressCardProps> = ({
  name,
  phoneNumber,
  formattedAddress,
  isDefault,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="relative bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow h-[180px] flex flex-col">
      <CardContent className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>
          </div>
          {isDefault && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-primary bg-blue-100 rounded">
              Default
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1 overflow-hidden">
          <p className="text-sm text-gray-600">{phoneNumber}</p>
          <p className="text-sm text-gray-700 line-clamp-2">{formattedAddress}</p>
        </div>
        <div className="flex gap-2 justify-end mt-auto pt-3">
          <Button
            title="Edit"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="w-8 h-8 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-md"
          >
            <SquarePen className="w-4 h-4" />
          </Button>
          <Button
            title="Delete"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="w-8 h-8 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
