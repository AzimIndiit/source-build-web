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
}

export const BankAccountCard: React.FC<BankAccountCardProps> = ({
  accountHolder,
  accountNumber,
  bankName,
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <Card
      className={cn(
        'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-shadow p-0',
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{accountHolder}</h3>
            <p className="text-gray-600 text-sm sm:text-base font-mono">{accountNumber}</p>
            <p className="text-gray-700 text-sm sm:text-base">{bankName}</p>
          </div>

          <div className="flex gap-2 ml-4">
            <Button 
              title='Edit'
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="w-8 h-8 sm:w-9 sm:h-9 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
            >
              <SquarePen className="w-4 h-4" />
            </Button>
            <Button
              title='Delete'
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="w-8 h-8 sm:w-9 sm:h-9 hover:bg-red-50 text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
