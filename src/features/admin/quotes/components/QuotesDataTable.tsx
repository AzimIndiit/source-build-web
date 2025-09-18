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
import { Eye, Trash2, MoreVertical, MessageSquare } from 'lucide-react';
import { Quote } from '../types';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { DropdownMenu } from '@/components/ui';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuotesDataTableProps {
  quotes: Quote[];
  onReply?: (quote: Quote) => void;
  onView?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDelete?: (id: string) => void;
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
}

export const QuotesDataTable: React.FC<QuotesDataTableProps> = ({
  quotes,
  onReply,
  onView,
  onEdit,
  onDelete,
  title = 'Quotes',
  searchValue,
  onSearchChange,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    quoteId: string | null;
    quoteName: string | null;
  }>({ isOpen: false, quoteId: null, quoteName: null });

  // Update global filter when searchValue changes
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue]);

  const handleDeleteClick = (quote: Quote) => {
    setDeleteModal({
      isOpen: true,
      quoteId: quote.id || quote._id || '',
      quoteName: quote.user?.displayName || 'Unknown User',
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.quoteId && onDelete) {
      onDelete(deleteModal.quoteId);
    }
    setDeleteModal({ isOpen: false, quoteId: null, quoteName: null });
  };

  const columns: ColumnDef<Quote>[] = React.useMemo(
    () => [
      {
        accessorKey: 'id',
        header: () => <div className="text-center">ID</div>,
        cell: (info) => {
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
        id: 'nameEmail',
        accessorFn: (row) => {
          const name = row.user?.displayName || 'Unknown User';
          const email = row.user?.email || 'No Email';
          return `${name} ${email}`;
        },
        header: 'Name & Email',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">
              {row.original.user?.displayName || 'Unknown User'}
            </span>
            <span className="text-xs text-primary underline">
              {row.original.user?.email || 'No Email'}
            </span>
          </div>
        ),
        filterFn: (row, id, value) => {
          const quote = row.original;
          const searchLower = value.toLowerCase();
          const name = quote.user?.displayName || '';
          const email = quote.user?.email || '';
          return (
            name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower)
          );
        },
      },
      {
        accessorKey: 'projectType',
        header: 'What is the project type?',
        cell: ({ row }) => {
          const projectType = row.getValue('projectType') as string;
          // Format the project type for display
          const formatted = projectType
            ?.replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
          return <span className="text-sm text-gray-900">{formatted || projectType}</span>;
        },
      },
      {
        accessorKey: 'installationLocation',
        header: 'What is the installation location?',
        cell: ({ row }) => {
          const location = row.getValue('installationLocation') as string;
          // Format the location for display
          const formatted = location?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
          return <span className="text-sm text-gray-900">{formatted || location}</span>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const quote = row.original;
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
                    onClick={() => onReply?.(quote)}
                    className="cursor-pointer text-green-600 hover:text-green-700"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reply
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onView?.(quote)}
                    className="cursor-pointer text-primary"
                  >
                    <Eye className="mr-2 h-4 w-4 text-primary" />
                    View
                  </DropdownMenuItem>

                

                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(quote)}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [ onView]
  );

  const table = useReactTable({
    data: quotes,
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
    getRowId: (row) => row.id || row._id || '',
  });

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  return (
    <div className="w-full">
      {/* Header with title and search - Always visible */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <SearchInput
          value={globalFilter ?? ''}
          onChange={handleSearchChange}
          placeholder="Search by name or email..."
          className="w-80"
        />
      </div>

      {/* Loading skeleton for table only */}
      {isLoading && (
        <Card className="bg-white shadow-sm border-gray-50 rounded-3xl p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="py-4 border-b last:border-b-0 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded ml-4" />
                  <div className="h-4 w-40 bg-gray-200 rounded ml-4" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Content - Only show if not loading */}
      {!isLoading && (
        <>
          {/* Empty State */}
          {table.getFilteredRowModel().rows.length === 0 && (
            <EmptyState
              title="No quotes found"
              description={
                globalFilter
                  ? `No results found for "${globalFilter}". Try adjusting your search.`
                  : "You don't have any quotes yet."
              }
              className="min-h-[400px]"
            />
          )}

          {/* Content - Only show if has quotes */}
          {table.getFilteredRowModel().rows.length > 0 && (
            <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {table.getFilteredRowModel().rows.map((row, index) => {
              const quote = row.original;
              return (
                <Card
                  key={quote.id || quote._id || index}
                  className="bg-white shadow-sm border-gray-200"
                >
                  <CardContent className="p-4">
                    {/* Quote Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Quote #{index + 1}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {quote.user?.displayName || 'Unknown User'}
                        </p>
                      </div>
                    </div>

                    {/* Quote Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Email:</span>
                        <span className="text-xs font-medium text-primary">
                          {quote.user?.email || 'No Email'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Project Type:</span>
                        <span className="text-xs font-medium">
                          {quote.projectType
                            ?.replace(/-/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Location:</span>
                        <span className="text-xs font-medium">
                          {quote.installationLocation
                            ?.replace(/-/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-3 border-t gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full"
                        onClick={() => onReply?.(quote)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                        onClick={() => onView?.(quote)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-red-600 hover:bg-red-700 text-white rounded-full"
                        onClick={() => handleDeleteClick(quote)}
                      >
                        <Trash2 className="h-4 w-4" />
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quoteId: null, quoteName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Quote"
        description={`Are you sure you want to delete the quote from ${deleteModal.quoteName}? This action cannot be undone.`}
      />
    </div>
  );
};
