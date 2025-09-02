import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { SquarePen, Trash2 } from 'lucide-react';
import { cn } from '@/lib/helpers';

interface BankAccountCardProps {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  isDefault?: boolean;
}

export const BankAccountCard: React.FC<BankAccountCardProps> = ({
  accountHolder,
  accountNumber,
  bankName,
  onEdit,
  onDelete,
  className,
  isDefault,
}) => {
  return (
    <Card
      className={cn(
        'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-shadow relative h-[180px] flex flex-col ',
        className
      )}
    >
      <CardContent className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-1">
            {accountHolder}
          </h3>
          {isDefault && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-primary bg-blue-100 rounded">
              Default
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-gray-600 text-sm font-mono tracking-wider">{accountNumber}</p>
          <p className="text-gray-700 text-sm">{bankName}</p>
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
