import React from 'react';
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
import {
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  User,
  MoreHorizontal,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { UserTableSkeleton } from '@/features/admin/user-management/components/UserTableSkeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUpdateContactQueryMutation } from '../hooks/useContactQueriesMutations';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';

interface ContactQuery {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'pending' | 'resolved' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt?: string;
  resolvedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ContactQueriesDataTableProps {
  queries: ContactQuery[];
  title?: string;
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-700';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'closed':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const ContactQueriesDataTable: React.FC<ContactQueriesDataTableProps> = ({
  queries,
  title = 'Contact Queries',
  isLoading = false,
  searchValue,
  onSearchChange,
  showSearch = true,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    queryId: string;
    newStatus: string;
    queryName: string;
  }>({ isOpen: false, queryId: '', newStatus: '', queryName: '' });

  const updateStatusMutation = useUpdateContactQueryMutation();

  // Update global filter when searchValue changes
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue]);

  // Close modal after successful status update
  React.useEffect(() => {
    if (updateStatusMutation.isSuccess) {
      setConfirmModal({ isOpen: false, queryId: '', newStatus: '', queryName: '' });
    }
  }, [updateStatusMutation.isSuccess]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  const handleStatusUpdate = (id: string, status: string, name: string) => {
    setConfirmModal({ isOpen: true, queryId: id, newStatus: status, queryName: name });
  };

  const confirmStatusUpdate = () => {
    updateStatusMutation.mutate({ id: confirmModal.queryId, status: confirmModal.newStatus });
    // Don't close modal here - let it close after success
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const columns: ColumnDef<ContactQuery>[] = React.useMemo(
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
        id: 'name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
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
          const query = row.original;
          return (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-xs lg:text-sm text-gray-900 font-medium">
                {query.firstName} {query.lastName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-gray-400" />
            <a
              href={`mailto:${row.getValue('email')}`}
              className="text-xs lg:text-sm text-blue-600 hover:underline"
            >
              {row.getValue('email')}
            </a>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => {
          const phone = row.getValue('phone') as string;
          return phone ? (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-gray-400" />
              <a
                href={`tel:${phone}`}
                className="text-xs lg:text-sm text-gray-700"
              >
                {phone}
              </a>
            </div>
          ) : (
            <span className="text-xs lg:text-sm text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: 'topic',
        header: 'Topic',
        cell: ({ row }) => {
          const topic = row.getValue('topic') as string;
          return (
            <span className="text-xs lg:text-sm text-gray-700 line-clamp-1 capitalize">
              {topic || '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => (
          <div className="max-w-xs">
            <p className="text-xs lg:text-sm text-gray-700 line-clamp-2">
              {row.getValue('message')}
            </p>
          </div>
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
              className={cn(
                'px-2 lg:px-3 py-1 rounded-full font-medium text-xs capitalize',
                getStatusBadgeColor(status)
              )}
            >
              {status.replace('_', ' ')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm hidden lg:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="hidden lg:block text-xs lg:text-sm text-gray-700">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
        sortingFn: 'datetime',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const query = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(
                    query._id || query.id || '', 
                    'pending',
                    `${query.firstName} ${query.lastName}`
                  )}
                  className={query.status === 'pending' ? 'bg-yellow-50' : ''}
                >
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(
                    query._id || query.id || '', 
                    'in_progress',
                    `${query.firstName} ${query.lastName}`
                  )}
                  className={query.status === 'in_progress' ? 'bg-blue-50' : ''}
                >
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(
                    query._id || query.id || '', 
                    'resolved',
                    `${query.firstName} ${query.lastName}`
                  )}
                  className={query.status === 'resolved' ? 'bg-green-50' : ''}
                >
                  Mark as Resolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [updateStatusMutation]
  );

  const table = useReactTable({
    data: queries,
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
    getRowId: (row) => row._id || row.id || String(Math.random()),
  });

  return (
    <div className="w-full">
      {/* Header with search */}
      {showSearch && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <SearchInput
            value={globalFilter ?? ''}
            onChange={handleSearchChange}
            placeholder="Search queries..."
            className="w-64"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && <UserTableSkeleton />}

      {/* Empty State */}
      {!isLoading && table.getFilteredRowModel().rows.length === 0 && (
        <EmptyState
          title="No contact queries found"
          description={
            globalFilter
              ? `No results found for "${globalFilter}". Try adjusting your search.`
              : "You don't have any contact queries yet."
          }
          icon={<MessageSquare className="w-16 h-16 text-gray-300" />}
          className="min-h-[400px]"
        />
      )}

      {/* Queries List */}
      {!isLoading && table.getFilteredRowModel().rows.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3">
            {table.getFilteredRowModel().rows.map((row) => {
              const query = row.original;
              return (
                <Card
                  key={query._id || query.id}
                  className="bg-white shadow-sm border-gray-200"
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {query.firstName} {query.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {query.email}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          'px-2 py-1 rounded-full font-medium text-xs capitalize',
                          getStatusBadgeColor(query.status)
                        )}
                      >
                        {query.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 mb-3">
                      {query.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600">{query.phone}</span>
                        </div>
                      )}

                      {query.subject && (
                        <div className="text-xs">
                          <span className="text-gray-500">Subject: </span>
                          <span className="text-gray-700">{query.subject}</span>
                        </div>
                      )}

                      <div className="text-xs">
                        <p className="text-gray-700 line-clamp-3">{query.message}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(query.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            Update Status
                            <MoreHorizontal className="ml-2 h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-full">
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(
                              query._id || query.id || '', 
                              'pending',
                              `${query.firstName} ${query.lastName}`
                            )}
                          >
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(
                              query._id || query.id || '', 
                              'in_progress',
                              `${query.firstName} ${query.lastName}`
                            )}
                          >
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(
                              query._id || query.id || '', 
                              'resolved',
                              `${query.firstName} ${query.lastName}`
                            )}
                          >
                            Mark as Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop View - Table */}
          <Card className="hidden lg:block bg-white shadow-sm border-gray-50 rounded-3xl p-0 overflow-hidden">
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
                  {table.getRowModel().rows.map((row, displayIndex) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="hover:bg-gray-50/30 border-b"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 lg:py-4">
                          {cell.column.id === 'serialNumber' ? (
                            <div className="text-center">
                              <span className="text-primary font-medium text-xs lg:text-sm">
                                {displayIndex + 1}
                              </span>
                            </div>
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
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
        isOpen={confirmModal.isOpen}
        onClose={() => {
          // Don't allow closing while mutation is pending
          if (!updateStatusMutation.isPending) {
            setConfirmModal({ isOpen: false, queryId: '', newStatus: '', queryName: '' });
          }
        }}
        onConfirm={confirmStatusUpdate}
        title="Update Status"
        description={
          <>
            Are you sure you want to update the status of <strong>{confirmModal.queryName}</strong>'s query to{' '}
            <strong>{getStatusLabel(confirmModal.newStatus)}</strong>?
          </>
        }
        confirmText="Update Status"
        cancelText="Cancel"
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
};