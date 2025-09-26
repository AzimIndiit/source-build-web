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
  Eye,
  ArrowUpDown,
  ChevronRight,
  Package,
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { EmptyState } from '@/components/common/EmptyState';
import ProductEmptyIcon from '@/assets/svg/productEmptyState.svg';
import { cn } from '@/lib/utils';
import LazyImage from '@/components/common/LazyImage';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { UserTableSkeleton } from '@/features/admin/user-management/components/UserTableSkeleton';

interface ProductDataTableProps {
  products: any[];
  onViewDetails?: (productSlug: string, status: string) => void;
  title?: string;
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export const ProductDataTable: React.FC<ProductDataTableProps> = ({
  products,
  onViewDetails,
  title = 'Products',
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

  // Update global filter when searchValue changes
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

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const columns: ColumnDef<any>[] = React.useMemo(
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
        id: 'product',
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border border-gray-200">
                <LazyImage
                  src={product.images?.[0] || product.image || '/placeholder.png'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  aspectRatio="square"
                  objectFit="cover"
                />
              </div>
              <div>
                <div className="font-medium text-xs lg:text-sm text-gray-900 line-clamp-1 capitalize">
                  {product.title}
                
               
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="text-xs lg:text-sm">
              <div className="font-medium text-gray-900">
                ${product.pricing?.price || product.price || '0'}
              </div>
              {product?.priceType && (
                <div className="text-xs text-gray-500 " >per {product?.priceType}</div>
              )}
            </div>
          );
        },
      },
      {
        id: 'stock',
        accessorKey: 'inStock',
        header: 'Quantity',

        cell: ({ row }) => {
          const product = row.original;
          return <div className="hidden lg:block text-center">{product.quantity}</div>;
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const category = row.original.category;
          const categoryText =
            typeof category === 'object' ? category?.name || category?.city : category;
          return (
            <div className="hidden md:block text-xs lg:text-sm text-gray-700">
              {categoryText || 'N/A'}
            </div>
          );
        },
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
              {status || 'Active'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm hidden xl:flex"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="hidden xl:block text-xs lg:text-sm text-gray-700">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
        sortingFn: 'datetime',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div
              onClick={() => onViewDetails?.(product.slug, product.status)}
              className="cursor-pointer text-primary"
            >
              <Eye className=" h-5 w-5 text-primary" />
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
    data: products,
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
    getRowId: (row, index) => row._id || row.id || String(index),
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
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-64"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && <UserTableSkeleton />}

      {/* Empty State */}
      {!isLoading && table.getFilteredRowModel().rows.length === 0 && (
        <EmptyState
          title={`No ${title || title?.toLowerCase()} found`}
          description={
            globalFilter
              ? `No results found for "${globalFilter}". Try adjusting your search.`
              : `You don't have any ${title?.toLowerCase() || title?.toLowerCase()} yet.`
          }
          icon={<img src={ProductEmptyIcon} className="w-64 h-56" alt="No products" />}
          className="min-h-[400px]"
        />
      )}

      {/* Products List */}
      {!isLoading && table.getFilteredRowModel().rows.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-3">
        {table.getFilteredRowModel().rows.map((row, index) => {
          const product = row.original;
          return (
            <Card
              key={product._id || product.id || index}
              className="bg-white shadow-sm border-gray-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <LazyImage
                        src={product.images?.[0] || product.image || '/placeholder.png'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        aspectRatio="square"
                        objectFit="cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500">#{index + 1}</p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      'px-2 py-1 rounded-full font-medium text-xs capitalize',
                      getStatusBadgeColor(product.status)
                    )}
                  >
                    {product.status || 'Active'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="text-gray-500">Price:</span> ${product.pricing?.price || product.price || '0'}
                      {product.pricing?.unit && ` per ${product.pricing.unit}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Package className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="text-gray-500">Quantity:</span> {product.quantity || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="text-gray-500">Category:</span>{' '}
                      {typeof product.category === 'object'
                        ? product.category?.name
                        : product.category || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="text-gray-500">Created:</span> {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-semibold text-xs w-full justify-center"
                    onClick={() => onViewDetails?.(product.slug, product.status)}
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
    </div>
  );
};
