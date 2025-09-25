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
import { Eye, Trash2, MoreVertical, MessageSquare, ArrowUpDown, Plus, Edit, Edit2, Edit2Icon } from 'lucide-react';
import { CmsPage } from '../types';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { DropdownMenu } from '@/components/ui';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/helpers';
import { Link } from 'react-router';

interface CmsDataTableProps {
  data: CmsPage[];
  onReply?: (page: CmsPage) => void;
  onView?: (page: CmsPage) => void;
  onEdit?: (page: CmsPage) => void;
  onDelete?: (id: string) => void;
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  onAddPage?: () => void;
}

export const CmsDataTable: React.FC<CmsDataTableProps> = ({
  data,
  onReply,
  onView,
  onEdit,
  onDelete,
  title = 'All Pages',
  searchValue,
  onSearchChange,
  isLoading = false,
  onAddPage,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    dataId: string | null;
    dataName: string | null;
  }>({ isOpen: false, dataId: null, dataName: null });

  // Update global filter when searchValue changes
  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue]);

  const handleDeleteClick = (data: CmsPage) => {
    setDeleteModal({
      isOpen: true,
      dataId: data._id || '',
      dataName: data.title || 'Unknown Page',
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.dataId && onDelete) {
      onDelete(deleteModal.dataId);
    }
    setDeleteModal({ isOpen: false, dataId: null, dataName: null });
  };

  const columns: ColumnDef<CmsPage>[] = React.useMemo(
    () => [
      {
        accessorKey: 'id',
        header: () => <div className="text-center">Sr.No.</div>,
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
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">
              {row.original.title || 'Unknown Page'}
            </span>
          </div>
        ),
        filterFn: (row, value) => {
          const data = row.original;
          const searchLower = value.toLowerCase();
          const name = data.title || '';
          return name.toLowerCase().includes(searchLower);
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created On',
        cell: ({ row }) => (
          <span className="text-gray-900 text-xs lg:text-sm">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
        sortingFn: 'datetime',
      },

      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const data = row.original;
          return (
            <div className="text-center flex justify-center items-center">
              <button  onClick={() => onEdit?.(data)} className="cursor-pointer text-white flex gap-2 items-center p-2 rounded-md bg-green-500">
                <Edit2Icon className="h-5 w-5 text-white" />
              </button>
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [onView]
  );

  const table = useReactTable({
    data: data,
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
    getRowId: (row) => row._id || '',
  });

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };

  return (
    <div className="w-full">
      {/* Header with title and search - Always visible */}
      <div className="flex  flex-col justify-between items-end flex-end gap-4 mb-4">
        <div className="justify-between items-centre flex w-full border-b border-gray-200 pb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
          {/* <div className="flex gap-2">
            <Button
              onClick={() => onAddPage?.()}
              className="bg-primary text-white hover:bg-primary/90 h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {title === 'Pages' ? 'Page' : 'Subpage'}H
            </Button>
          </div> */}
        </div>
        {/* <div className="flex items-center gap-2 md:gap-4">
          <SearchInput
            value={globalFilter ?? ''}
            onChange={handleSearchChange}
            placeholder={`Search ${title?.toLowerCase()}...`}
            className="w-64"
          />
        </div> */}
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
              title="No pages found"
              description={
                globalFilter
                  ? `No results found for "${globalFilter}". Try adjusting your search.`
                  : "You don't have any pages yet."
              }
              className="min-h-[400px]"
            />
          )}

          {/* Content - Only show if has pages */}
          {table.getFilteredRowModel().rows.length > 0 && (
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-3">
                {table.getFilteredRowModel().rows.map((row, index) => {
                  const data = row.original;
                  return (
                    <Card key={data._id || index} className="bg-white shadow-sm border-gray-200">
                      <CardContent className="p-4">
                        {/* data Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-500"> #{index + 1}</p>
                          </div>
                        </div>

                        {/* data Details */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Name:</span>
                            <span className="text-xs font-medium text-primary">
                              {data.title || 'No Title'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Created On:</span>
                            <span className="text-xs font-medium text-primary">
                              {formatDate(data.createdAt as string) || 'No Created On'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-3 border-t gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                            onClick={() => onEdit?.(data)}
                          >
                            <Eye className="h-4 w-4" />
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
                        <TableRow
                          key={headerGroup.id}
                          className="bg-gray-50/50 hover:bg-gray-50/50"
                        >
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
        onClose={() => setDeleteModal({ isOpen: false, dataId: null, dataName: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete data"
        description={`Are you sure you want to delete the data from ${deleteModal.dataName}? This action cannot be undone.`}
      />
    </div>
  );
};
