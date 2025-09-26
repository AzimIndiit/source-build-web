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
import { Edit, Trash2, MoreVertical, ArrowUpDown, ChevronRight, Power, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/date-utils';
import { Attribute } from '../types';
import { EmptyState } from '@/components/common/EmptyState';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { useNavigate } from 'react-router-dom';
// import { FilterConfig } from '@/features/admin/user-management/components';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { SortDropdown } from '@/components/common/SortDropdown';
import { UserTableSkeleton } from '../../user-management/components/UserTableSkeleton';
import BuyingEmptyIcon from '@/assets/svg/buyingEmptyState.svg';

interface AttributeDataTableProps {
  attributes: Attribute[];
  title?: string;
  onEdit?: (attribute: Attribute) => void;
  onDelete?: (categoryId: string) => void;
  onToggleStatus?: (categoryId: string) => void;
  isLoading?: boolean;
  actionLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  showSort?: boolean;
  showFilter?: boolean;
  selectedSort?: string;
  onSortChange?: (value: string) => void;
  onAddAttribute?: () => void;
  // filters?: FilterConfig;
  // onFilterChange?: (newFilters: FilterConfig) => void;
}

export const AttributeDataTable: React.FC<AttributeDataTableProps> = ({
  attributes,
  title,
  onEdit,
  onDelete,
  onToggleStatus,
  isLoading = false,
  actionLoading = false,
  searchValue,
  onSearchChange,
  showSearch = true,
  showSort = true,
  showFilter = true,
  selectedSort,
  onSortChange,
  onAddAttribute,
  // filters,
  // onFilterChange,
}) => {
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: 'delete' | 'toggle' | null;
    attributeId: string | null;
    attributeName: string | null;
  }>({ isOpen: false, type: null, attributeId: null, attributeName: null });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearchChange?.(value);
  };
  const handleConfirmAction = () => {
    if (!confirmModalState.attributeId) return;

    switch (confirmModalState.type) {
      case 'delete':
        onDelete?.(confirmModalState.attributeId);
        break;
      case 'toggle':
        onToggleStatus?.(confirmModalState.attributeId);
        break;
    }

    setConfirmModalState({ isOpen: false, type: null, attributeId: null, attributeName: null });
  };

  const openConfirmModal = (
    type: 'delete' | 'toggle',
    attributeId: string,
    attributeName: string
  ) => {
    setConfirmModalState({ isOpen: true, type, attributeId, attributeName });
  };

  const columns: ColumnDef<Attribute>[] = React.useMemo(
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
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Attribute
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const attribute = row.original;
          return (
            <div className="flex items-center gap-2 lg:gap-3 py-1">
              <div className="text-left">
                <div className="font-medium text-xs lg:text-sm text-gray-900">{attribute.name}</div>
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
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean;
          return (
            <Badge
              className={`px-2 lg:px-3 py-1 rounded-full font-medium text-xs capitalize ${
                isActive
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },

      {
        id: 'actions',
        header: () => <div className="text-center">Actions</div>,
        cell: ({ row }) => {
          const attribute = row.original;
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
                    onClick={() => onEdit?.(attribute)}
                    className="cursor-pointer text-primary"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Attribute
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openConfirmModal('toggle', attribute._id, attribute.name)}
                    className="cursor-pointer"
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {attribute.isActive ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openConfirmModal('delete', attribute._id, attribute.name)}
                    className="cursor-pointer text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Attribute
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
    [onEdit, onDelete, onToggleStatus]
  );

  const table = useReactTable({
    data: attributes,
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
  });

  return (
    <div className="w-full">
      {/* Header with title and filters - Always visible */}
      <div className="flex  flex-col justify-between items-end flex-end gap-4 mb-4">
        <div className="justify-between items-centre flex w-full border-b border-gray-200 pb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => onAddAttribute?.()}
              className="bg-primary text-white hover:bg-primary/90 h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Attribute
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {showSearch && (
            <SearchInput
              value={globalFilter ?? ''}
              onChange={handleSearchChange}
              placeholder={`Search Attributes...`}
              className="w-64"
            />
          )}

          {/* {showFilter && (
            <UserFilterDropdown
              filters={filters}
              onFilterChange={onFilterChange}
            />
          )} */}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <UserTableSkeleton />}

      {/* Empty State */}
      {!isLoading && table.getFilteredRowModel().rows.length === 0 && (
        <EmptyState
          title={`No Attributes found`}
          description={
            globalFilter
              ? `No results found for "${globalFilter}". Try adjusting your search.`
              : `You don't have any Attributes yet.`
          }
          icon={<img src={BuyingEmptyIcon} className="w-64 h-56" alt="No categories" />}
          className="min-h-[400px]"
        />
      )}

      {/* Categories List */}
      {!isLoading && table.getFilteredRowModel().rows.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
            {table.getFilteredRowModel().rows.map((row, index) => {
              const attribute = row.original;
              return (
                <Card key={attribute._id} className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attribute.name}</p>
                        <p className="text-xs text-gray-500">#{index + 1}</p>
                      </div>
                    </div>
                    <Badge
                      className={`px-2 py-1 rounded-full font-medium text-xs capitalize ${
                        attribute.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {attribute.isActive ? 'Active' : 'Inactive'}
                    </Badge>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatDate(attribute.createdAt as string)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary font-semibold text-xs"
                        onClick={() => onEdit?.(attribute)}
                      >
                        Edit
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              openConfirmModal('toggle', attribute._id, attribute.name)
                            }
                            className="cursor-pointer"
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {attribute.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              openConfirmModal('delete', attribute._id, attribute.name)
                            }
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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
        isOpen={confirmModalState.isOpen}
        onClose={() =>
          setConfirmModalState({
            isOpen: false,
            type: null,
            attributeId: null,
            attributeName: null,
          })
        }
        onConfirm={handleConfirmAction}
        title={
          confirmModalState.type === 'delete'
            ? 'Delete Attribute?'
            : confirmModalState.type === 'toggle'
              ? `${attributes.find((c) => c._id === confirmModalState.attributeId)?.isActive ? 'Deactivate' : 'Activate'} Attribute?`
              : ''
        }
        description={
          <div className="space-y-2">
            <div className="font-medium text-gray-900">{confirmModalState.attributeName}</div>
            <div className="text-sm text-gray-700 mt-3">
              {confirmModalState.type === 'delete'
                ? 'This action cannot be undone. All attributes under this subcategory will also be affected.'
                : confirmModalState.type === 'toggle'
                  ? `This will ${attributes.find((c) => c._id === confirmModalState.attributeId)?.isActive ? 'deactivate' : 'activate'} the attribute and affect its visibility.`
                  : ''}
            </div>
          </div>
        }
        isLoading={actionLoading}
        confirmText={
          confirmModalState.type === 'delete'
            ? 'Yes, Delete'
            : confirmModalState.type === 'toggle'
              ? `Yes, ${attributes.find((c) => c._id === confirmModalState.attributeId)?.isActive ? 'Deactivate' : 'Activate'} `
              : ''
        }
      />
    </div>
  );
};
