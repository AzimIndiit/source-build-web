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
import {
  Eye,
  Ban,
  UserCheck,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  ChevronRight,
  Mail,
  Calendar,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStatusBadgeColor } from '@/features/dashboard/utils/orderUtils';
import { getInitials } from '@/lib/helpers';
import { formatDate } from '@/lib/date-utils';
import { FormattedUserResponse } from '../hooks/useUserMutations';
import { EmptyState } from '@/components/common/EmptyState';
import BuyingEmptyIcon from '@/assets/svg/buyingEmptyState.svg';
import { UserTableSkeleton } from './UserTableSkeleton';
import { SearchInput } from './SearchInput';
import { SortDropdown } from '@/components/common/SortDropdown';
import { FilterConfig, UserFilterDropdown } from './UserFilterDropdown';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface UserDataTableProps {
  users: FormattedUserResponse[];
  onViewDetails?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onUnblock?: (userId: string) => void;
  title?: string;
  showFilter?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  filters?: FilterConfig;
  onFilterChange?: (newFilters: FilterConfig) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  actionLoading?: boolean;
}

export const UserDataTable: React.FC<UserDataTableProps> = ({
  users,
  onViewDetails,
  onDelete,
  onBlock,
  onUnblock,
  title,
  showFilter = true,
  showSort = true,
  showSearch = true,
  selectedSort,
  onSortChange,
  filters,
  onFilterChange,
  searchValue,
  onSearchChange,
  isLoading = false,
  actionLoading = false,
}) => {
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: 'delete' | 'block' | 'unblock' | null;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
  }>({ isOpen: false, type: null, userId: null, userName: null, userEmail: null });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    email: true,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const handleConfirmAction = () => {
    if (!confirmModalState.userId) return;
    
    switch (confirmModalState.type) {
      case 'delete':
        onDelete?.(confirmModalState.userId);
        break;
      case 'block':
        onBlock?.(confirmModalState.userId);
        break;
      case 'unblock':
        onUnblock?.(confirmModalState.userId);
        break;
    }
    
    setConfirmModalState({ isOpen: false, type: null, userId: null, userName: null, userEmail: null });
  };

  const openConfirmModal = (type: 'delete' | 'block' | 'unblock', userId: string, userName: string, userEmail: string) => {
    setConfirmModalState({ isOpen: true, type, userId, userName, userEmail });
  };

  // Update global filter when searchValue changes
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue]);

  const columns: ColumnDef<FormattedUserResponse>[] = React.useMemo(
    () => [
      {
        id: 'serialNumber',
        header: () => <div className="text-center">Sr.No.</div>,
        cell: (info) => {
          // Simply use the row's display index which is always sequential
          return (
            <div className="text-center">
              <span className="text-primary font-medium text-xs lg:text-sm">
                {info.row.index + 1}
              </span>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'displayName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2 lg:gap-3 py-1">
              <Avatar className="w-10 h-10 lg:w-12 lg:h-12 border-2 border-white shadow-sm">
                {user.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.displayName || 'User'}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-xs uppercase">
                  {getInitials(user.displayName || '')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium text-xs lg:text-sm text-gray-900 capitalize">
                  {user.displayName || 'Unknown'}
                </div>
              </div>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)
                ?.toLowerCase()
                .includes(value.toLowerCase());
        },
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm hidden lg:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="hidden lg:block">
            <span className="text-gray-700 text-xs lg:text-sm">
              {row.getValue('email') || 'No email'}
            </span>
          </div>
        ),
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)
                ?.toLowerCase()
                .includes(value.toLowerCase());
        },
      },
      {
        accessorKey: 'authType',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Login Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-gray-900 text-xs lg:text-sm capitalize">
            {row.getValue('authType') || 'Email'}
          </span>
        ),
        filterFn: (row, id, value) => {
          return value === undefined || value === ''
            ? true
            : (row.getValue(id) as string)
                ?.toLowerCase()
                .includes(value.toLowerCase());
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created On
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-gray-900 text-xs lg:text-sm">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
        sortingFn: 'datetime',
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
          const user = row.original;
          return (
            <div className="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onViewDetails?.(user.id || '')}
                    className="cursor-pointer text-primary"
                  >
                    <Eye className="mr-2 h-4 w-4 text-primary" />
                    View User
                  </DropdownMenuItem>
                  {user.status === 'active' ? (
                    <DropdownMenuItem
                      onClick={() => openConfirmModal('block', user.id || '', user.displayName || 'this user', user.email || '')}
                      className="cursor-pointer text-orange-600 hover:text-orange-700"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Block User
                    </DropdownMenuItem>
                  ) : user.status === 'inactive' ? (
                    <DropdownMenuItem
                      onClick={() => openConfirmModal('unblock', user.id || '', user.displayName || 'this user', user.email || '')}
                      className="cursor-pointer text-green-600 hover:text-green-700"
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Unblock User
                    </DropdownMenuItem>
                  ) : null}
                  {user.status !== 'deleted' && (
                    <DropdownMenuItem
                      onClick={() => openConfirmModal('delete', user.id || '', user.displayName || 'this user', user.email || '')}
                      className="cursor-pointer text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onViewDetails, onBlock, onUnblock, onDelete]
  );

  const table = useReactTable({
    data: users,
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
    // Disable sorting for row indices to maintain sequential numbering
    enableRowSelection: true,
    getRowId: (row, index) => row.id || String(index),
  });

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  // Apply status filter from dropdown
  React.useEffect(() => {
    if (filters?.status) {
      table.getColumn('status')?.setFilterValue(filters.status.toLowerCase());
    } else {
      table.getColumn('status')?.setFilterValue('');
    }
  }, [filters, table]);

  return (
    <div className="w-full">
      {/* Header with title and filters - Always visible */}
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {showSearch && (
            <SearchInput
              value={globalFilter ?? ''}
              onChange={handleSearchChange}
              placeholder="Search users..."
              className="w-64"
            />
          )}
          {showSort && (
            <SortDropdown
              selectedSort={selectedSort}
              onSortChange={onSortChange}
            />
          )}
          {showFilter && (
            <UserFilterDropdown
              filters={filters}
              onFilterChange={onFilterChange}
            />
          )}
        </div>
      </div>

      {/* Column Filters */}
      {/* <div className="flex items-center gap-2 mb-4">
        {table.getColumn('displayName') && (
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn('displayName')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('displayName')?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-9"
          />
        )}
        {table.getColumn('email') && (
          <Input
            placeholder="Filter by email..."
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('email')?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-9"
          />
        )}
        {table.getColumn('authType') && (
          <Input
            placeholder="Filter by login type..."
            value={(table.getColumn('authType')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('authType')?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-9"
          />
        )}
      </div> */}

      {/* Loading State */}
      {isLoading && <UserTableSkeleton />}

      {/* Empty State */}
      {!isLoading && table.getFilteredRowModel().rows.length === 0 && (
        <EmptyState
          title={`No ${title || 'Users'} found`}
          description={
            globalFilter
              ? `No results found for "${globalFilter}". Try adjusting your search.`
              : `You don't have any ${title?.toLowerCase() || 'users'} yet.`
          }
          icon={<img src={BuyingEmptyIcon} className="w-64 h-56" alt="No users" />}
          className="min-h-[400px]"
        />
      )}

      {/* Content - Only show if not loading and has users */}
      {!isLoading && table.getFilteredRowModel().rows.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {table.getFilteredRowModel().rows.map((row, index) => {
              const user = row.original;
              return (
                <Card key={user.id || index} className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-4">
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                          {user.avatar ? (
                            <AvatarImage
                              src={user.avatar}
                              alt={user.displayName || 'User'}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-medium uppercase">
                            {getInitials(user.displayName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.displayName || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">#{index + 1}</p>
                        </div>
                      </div>
                      <Badge
                        className={`px-2 py-1 rounded-full font-medium text-xs capitalize ${getStatusBadgeColor(user.status)}`}
                      >
                        {user.status}
                      </Badge>
                    </div>

                    {/* User Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{user.email || 'No email'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Login: {user.authType || 'Email'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">Joined: {formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary font-semibold text-xs"
                        onClick={() => onViewDetails?.(user.id || '')}
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => openConfirmModal('block', user.id || '', user.displayName || 'this user', user.email || '')}
                              className="cursor-pointer text-orange-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Block User
                            </DropdownMenuItem>
                          ) : user.status === 'inactive' ? (
                            <DropdownMenuItem
                              onClick={() => openConfirmModal('unblock', user.id || '', user.displayName || 'this user', user.email || '')}
                              className="cursor-pointer text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          ) : null}
                          {user.status !== 'deleted' && (
                            <DropdownMenuItem
                              onClick={() => openConfirmModal('delete', user.id || '', user.displayName || 'this user', user.email || '')}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                  <TableRow
                    key={headerGroup.id}
                    className="bg-gray-50/50 hover:bg-gray-50/50"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row, displayIndex) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-gray-50/30 border-b"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 lg:py-4">
                        {cell.column.id === 'serialNumber' 
                          ? (
                            <div className="text-center">
                              <span className="text-primary font-medium text-xs lg:text-sm">
                                {displayIndex + 1}
                              </span>
                            </div>
                          )
                          : flexRender(cell.column.columnDef.cell, cell.getContext())}
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

      {/* Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState({ isOpen: false, type: null, userId: null, userName: null, userEmail: null })}
        onConfirm={handleConfirmAction}
        title={
          confirmModalState.type === 'delete'
            ? `Delete User?`
            : confirmModalState.type === 'block'
            ? `Block User?`
            : `Unblock User?`
        }
        description={
          <div className="space-y-2">
            <div className="font-medium text-gray-900">
              {confirmModalState.userName}
            </div>
            {confirmModalState.userEmail && (
              <div className="text-sm text-gray-600">
                {confirmModalState.userEmail}
              </div>
            )}
            <div className="text-sm text-gray-700 mt-3">
              {confirmModalState.type === 'delete'
                ? 'This action cannot be undone. The user will be permanently removed from the system.'
                : confirmModalState.type === 'block'
                ? 'The user will not be able to access their account until unblocked.'
                : 'The user will regain full access to their account.'}
            </div>
          </div>
        }
        isLoading={actionLoading}
        confirmText={
          confirmModalState.type === 'delete'
            ? "Yes, Delete User"
            : confirmModalState.type === 'block'
            ? "Yes, Block User"
            : "Yes, Unblock User"
        }
      />
    </div>
  );
};