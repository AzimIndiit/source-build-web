import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronRight } from 'lucide-react';
import { Order } from '../types';
import { getStatusBadgeColor } from '../utils/orderUtils';
import {
  SortDropdown,
  OrderFilterDropdown,
  FilterConfig,
  SortOption,
} from '@/features/orders/components';

const sortOptions: SortOption[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
];

interface OrdersTableProps {
  orders: Order[];
  onViewAll?: () => void;
  onViewDetails?: (orderId: string) => void;
  title?: string;
  showFilter?: boolean;
  showSort?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onViewAll,
  onViewDetails,
  title,
  showFilter = true,
  showSort = true,
}) => {
  const [selectedSort, setSelectedSort] = useState<string>('this-week');
  const [filters, setFilters] = useState<FilterConfig>({
    orderStatus: '',
    pricing: '',
  });

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    // TODO: Implement sorting logic
    console.log('Sort changed to:', value);
  };

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters);
    // TODO: Implement filtering logic
    console.log('Filters applied:', newFilters);
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold">{title}</h3>
        <div className="flex items-center gap-2 md:gap-4">
          {onViewAll && (
            <Button
              variant="link"
              className="text-[#2b5aac] font-semibold text-xs md:text-sm p-0 underline"
              onClick={onViewAll}
            >
              View All Orders
            </Button>
          )}
          {showSort && (
            <SortDropdown
              sortOptions={sortOptions}
              selectedSort={selectedSort}
              onSortChange={handleSortChange}
            />
          )}
          {showFilter && (
            <OrderFilterDropdown filters={filters} onFilterChange={handleFilterChange} />
          )}
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {orders.map((order, index) => (
          <Card key={`${order.id}-${index}`} className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-medium text-[#2b5aac]">{order.id}</p>
                </div>
                <Badge
                  className={`px-2 py-1 rounded-full font-medium text-xs ${getStatusBadgeColor(order.status)}`}
                >
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900">{order.product}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white shadow-sm">
                    {order.customer.avatar ? (
                      <AvatarImage
                        src={order.customer.avatar}
                        alt={order.customer.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium">
                      {order.customer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-xs text-gray-500">{order.customer.email}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-500">{order.date}</p>
                    <p className="text-sm font-semibold text-gray-900">{order.amount}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#2b5aac] font-semibold text-xs"
                    onClick={() => onViewDetails?.(order.id)}
                  >
                    Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tablet/Desktop View - Table */}
      <Card className="hidden md:block bg-white shadow-sm border-gray-50 rounded-3xl p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Order ID
                </TableHead>
                <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm">
                  Product
                </TableHead>
                <TableHead className="text-left font-semibold text-gray-700 text-xs lg:text-sm">
                  Customer Details
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm hidden lg:table-cell">
                  Order Date
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Amount
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Status
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={`${order.id}-${index}`} className="hover:bg-gray-50/30 border-b">
                  <TableCell className="text-center">
                    <span className="text-[#2b5aac] font-medium text-xs lg:text-sm">
                      {order.id}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-gray-900 text-xs lg:text-sm">
                      {order.products?.[0]?.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 lg:py-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white shadow-sm">
                        {order.customer.avatar ? (
                          <AvatarImage
                            src={order.customer.avatar}
                            alt={order.customer.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs">
                          {order.customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium text-xs lg:text-sm text-gray-900">
                          {order.customer.name}
                        </div>
                        <div className="text-xs text-gray-500 hidden xl:block">
                          {order.customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center hidden lg:table-cell">
                    <span className="text-gray-700 text-xs lg:text-sm">{order.date}</span>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    <span className="text-gray-900 text-xs lg:text-sm">{order.amount}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`px-2 lg:px-3 py-1 rounded-full font-medium text-xs ${getStatusBadgeColor(order.status)}`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="link"
                      className="text-[#2b5aac] font-semibold text-xs lg:text-sm p-0 underline"
                      onClick={() => onViewDetails?.(order.id)}
                    >
                      See Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
