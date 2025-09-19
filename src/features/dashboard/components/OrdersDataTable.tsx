import React, { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/Card';
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
import { ChevronRight, ArrowUpDown, Eye } from 'lucide-react';
import { Order } from '../types';
import { getStatusBadgeColor } from '../utils/orderUtils';
import { OrderFilterDropdown, FilterConfig } from '@/features/orders/components';
import { SortDropdown } from '@/components/common/SortDropdown';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { formatCurrency } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';
import { getInitials } from '@/lib/helpers';
import { EmptyState } from '@/components/common/EmptyState';
import OrderEmptyIcon from '@/assets/svg/orderEmptyState.svg';

interface OrdersDataTableProps {
  orders: Order[];
  onViewAll?: () => void;
  onViewDetails?: (orderId: string) => void;
  title?: string;
  showFilter?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  totalOrders?: number;
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  filters?: FilterConfig;
  onFilterChange?: (newFilters: FilterConfig) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
}

export const OrdersDataTable: React.FC<OrdersDataTableProps> = ({
  orders,
  onViewAll,
  onViewDetails,
  title,
  showFilter = true,
  showSort = true,
  showSearch = true,
  totalOrders,
  selectedSort: propSelectedSort,
  onSortChange: propOnSortChange,
  filters: propFilters,
  onFilterChange: propOnFilterChange,
  searchValue,
  onSearchChange,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Use props if provided, otherwise use local state
  const [localSelectedSort, setLocalSelectedSort] = useState<string>('recent');
  const [localFilters, setLocalFilters] = useState<FilterConfig>({
    orderStatus: '',
    pricing: '',
  });

  const selectedSort = propSelectedSort !== undefined ? propSelectedSort : localSelectedSort;
  const filters = propFilters !== undefined ? propFilters : localFilters;

  // Update global filter when searchValue changes
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue]);

  const columns: ColumnDef<Order>[] = React.useMemo(
    () => [
      {
        id: 'serialNumber',
        header: () => <div className="text-center">Sr.No.</div>,
        cell: (info) => (
          <div className="text-center">
            <span className="text-primary font-medium text-xs lg:text-sm">
              {info.row.index + 1}
            </span>
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Order ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-primary font-medium text-xs lg:text-sm">#{row.getValue('id')}</span>
        ),
      },
      {
        id: 'customer',
        accessorFn: (row) => row.customer?.displayName,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Buyer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const customer = row.original.customer;
          return (
            <div className="flex items-center gap-2 lg:gap-3 py-1">
              <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white shadow-sm">
                {customer?.avatar ? (
                  <AvatarImage
                    src={customer.avatar}
                    alt={customer?.displayName || 'Customer'}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs uppercase">
                  {customer?.displayName ? getInitials(customer.displayName) : 'NA'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium text-xs lg:text-sm text-gray-900 capitalize">
                  {customer?.displayName || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">{customer?.email || 'No email'}</div>
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)?.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        id: 'seller',
        accessorFn: (row) => row.seller?.displayName,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Seller
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const seller = row.original.seller;
          return (
            <div className="flex items-center gap-2 lg:gap-3 py-1">
              <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white shadow-sm">
                {seller?.avatar ? (
                  <AvatarImage
                    src={seller.avatar}
                    alt={seller?.displayName || 'Seller'}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs uppercase">
                  {seller?.displayName ? getInitials(seller.displayName) : 'NA'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium text-xs lg:text-sm text-gray-900 capitalize">
                  {seller?.displayName || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">{seller?.email || 'No email'}</div>
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)?.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        id: 'driver',
        accessorFn: (row) => row.driver?.displayName,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Driver
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const driver = row.original.driver;
          if (!driver) {
            return <span className="text-gray-500 text-xs lg:text-sm">Not Assigned</span>;
          }
          return (
            <div className="flex items-center gap-2 lg:gap-3 py-1">
              <Avatar className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-white shadow-sm">
                {driver?.avatar ? (
                  <AvatarImage
                    src={driver.avatar}
                    alt={driver?.displayName || 'Driver'}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs uppercase">
                  {driver?.displayName ? getInitials(driver.displayName) : 'NA'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium text-xs lg:text-sm text-gray-900 capitalize">
                  {driver?.displayName || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">{driver?.email || 'No email'}</div>
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)?.toLowerCase().includes(value.toLowerCase());
        },
      },
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-gray-700 text-xs lg:text-sm">
            {formatDate(row.getValue('date'))}
          </span>
        ),
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-gray-900 font-semibold text-xs lg:text-sm">
            {formatCurrency(row.getValue('amount'))}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <Badge
              className={`px-2 lg:px-3 py-1 rounded-full font-medium text-xs capitalize ${getStatusBadgeColor(
                status
              )}`}
            >
              {status}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)?.toLowerCase() === value.toLowerCase();
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="text-center">
              <Button
                variant="link"
                className="text-primary font-semibold text-xs lg:text-sm p-0 underline"
                onClick={() => onViewDetails?.(order.id)}
              >
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onViewDetails]
  );

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    getRowId: (row, index) => row.id || String(index),
  });

  const handleSortChange = (value: string) => {
    if (propOnSortChange) {
      propOnSortChange(value);
    } else {
      setLocalSelectedSort(value);
    }
  };

  const handleFilterChange = (newFilters: FilterConfig) => {
    if (propOnFilterChange) {
      propOnFilterChange(newFilters);
    } else {
      setLocalFilters(newFilters);
    }
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  // Apply status filter from dropdown
  React.useEffect(() => {
    if (filters?.orderStatus) {
      table.getColumn('status')?.setFilterValue(filters.orderStatus.toLowerCase());
    } else {
      table.getColumn('status')?.setFilterValue('');
    }
  }, [filters, table]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with title and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {onViewAll && (
            <Button
              variant="link"
              className="text-primary font-semibold text-xs md:text-sm p-0 underline"
              onClick={onViewAll}
            >
              View All Orders
            </Button>
          )}
          {showSort && <SortDropdown selectedSort={selectedSort} onSortChange={handleSortChange} />}
          {showFilter && (
            <OrderFilterDropdown filters={filters} onFilterChange={handleFilterChange} />
          )}
        </div>
      </div>

      {/* Empty State */}
      {table.getFilteredRowModel().rows.length === 0 && (
        <EmptyState
          title="No orders found"
          description={
            globalFilter
              ? `No results found for "${globalFilter}". Try adjusting your search.`
              : filters?.orderStatus || filters?.pricing
                ? 'No orders match your current filters. Try adjusting your filters.'
                : "You don't have any orders yet."
          }
          icon={<img src={OrderEmptyIcon} className="w-64 h-56" alt="No orders" />}
          className="min-h-[400px]"
        />
      )}

      {/* Content - Only show if has orders */}
      {table.getFilteredRowModel().rows.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {table.getFilteredRowModel().rows.map((row, index) => {
              const order = row.original;
              return (
                <Card key={order.id || index} className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-4">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="text-sm font-medium text-primary">#{order.id}</p>
                      </div>
                      <Badge
                        className={`px-2 py-1 rounded-full font-medium text-xs ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Buyer:</span>
                        <span className="text-xs font-medium">
                          {order.customer?.displayName || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Seller:</span>
                        <span className="text-xs font-medium">
                          {order.seller?.displayName || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Driver:</span>
                        <span className="text-xs font-medium">
                          {order.driver?.displayName || 'Not Assigned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Date:</span>
                        <span className="text-xs font-medium">{formatDate(order.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Amount:</span>
                        <span className="text-xs font-semibold text-primary">
                          {formatCurrency(order.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary font-semibold text-xs"
                        onClick={() => onViewDetails?.(order.id)}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop View - Table */}
          <Card className="hidden md:block bg-white shadow-sm border-gray-50 rounded-3xl p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-gray-50/30 border-b"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 lg:py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
