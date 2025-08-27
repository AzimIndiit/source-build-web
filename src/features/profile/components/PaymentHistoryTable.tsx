import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SortDropdown, SortOption } from '@/features/orders/components';
import { PaymentFilterDropdown } from './PaymentFilterDropdown';
import { PaginationWrapper } from '@/components/ui';

const sortOptions: SortOption[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'custom', label: 'Custom Date Range' },
];

const filterOptions: SortOption[] = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];

interface PaymentHistory {
  orderId: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  transactionId: string;
  date: string;
  amount: string;
  paymentMethod: string;
  isPositive?: boolean;
}

interface PaymentHistoryTableProps {
  payments: PaymentHistory[];
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ payments }) => {
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [filters, setFilters] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const handleFilterChange = (newFilters: string) => {
    setFilters(newFilters);
  };
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold">Payment History</h3>
        <div className="flex items-center gap-2 md:gap-4">
          <SortDropdown
            sortOptions={sortOptions}
            selectedSort={selectedSort}
            onSortChange={handleSortChange}
          />

          <PaymentFilterDropdown
            sortOptions={filterOptions}
            selectedSort={filters}
            onSortChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {payments.map((payment, index) => (
          <Card key={`${payment.orderId}-${index}`} className="bg-white shadow-sm border-gray-200 ">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-medium text-[#2b5aac]">{payment.orderId}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${payment.isPositive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {payment.amount}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white shadow-sm">
                    {payment.customer.avatar ? (
                      <AvatarImage
                        src={payment.customer.avatar}
                        alt={payment.customer.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium">
                      {payment.customer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.customer.name}</p>
                    <p className="text-xs text-gray-500">{payment.customer.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">Trans. ID</p>
                    <p className="text-xs font-medium">{payment.transactionId}</p>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-xs">{payment.date}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-xs font-medium">{payment.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
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
                  Customer Details
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Trans. ID
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Date & Time
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Amount
                </TableHead>
                <TableHead className="text-center font-semibold text-gray-700 text-xs lg:text-sm">
                  Payment Method
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow
                  key={`${payment.orderId}-${index}`}
                  className="hover:bg-gray-50/30 border-b"
                >
                  <TableCell className="text-center">
                    <span className="text-[#2b5aac] font-medium text-xs lg:text-sm">
                      {payment.orderId}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 lg:py-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white shadow-sm">
                        {payment.customer.avatar ? (
                          <AvatarImage
                            src={payment.customer.avatar}
                            alt={payment.customer.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs">
                          {payment.customer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-medium text-xs lg:text-sm text-gray-900">
                          {payment.customer.name}
                        </div>
                        <div className="text-xs text-gray-500 hidden xl:block">
                          {payment.customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 text-xs lg:text-sm">
                      {payment.transactionId}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 text-xs lg:text-sm">{payment.date}</span>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    <span
                      className={`text-xs lg:text-sm ${payment.isPositive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {payment.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 text-xs lg:text-sm">
                      {payment.paymentMethod}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
