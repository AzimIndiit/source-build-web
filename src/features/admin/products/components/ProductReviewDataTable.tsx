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
  Star,
  ArrowUpDown,
  User,
  Calendar,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/features/admin/user-management/components/SearchInput';
import { UserTableSkeleton } from '@/features/admin/user-management/components/UserTableSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/helpers';

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful?: number;
  verified?: boolean;
}

interface ProductReviewDataTableProps {
  reviews: Review[];
  title?: string;
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  productRating?: number;
  totalReviews?: number;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  rating, 
  size = 'sm' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  );
};

export const ProductReviewDataTable: React.FC<ProductReviewDataTableProps> = ({
  reviews,
  title = 'Reviews & Rating',
  isLoading = false,
  searchValue,
  onSearchChange,
  showSearch = true,
  productRating = 0,
  totalReviews = 0,
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

  const columns: ColumnDef<Review>[] = React.useMemo(
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
        id: 'user',
        accessorKey: 'user.name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const review = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                {review.user.avatar ? (
                  <AvatarImage src={review.user.avatar} alt={review.user.name} />
                ) : null}
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                  {getInitials(review.user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-xs lg:text-sm text-gray-900">
                  {review.user.name}
                </div>
                {review.verified && (
                  <Badge className="mt-0.5 px-1.5 py-0 text-[10px] bg-green-100 text-green-700">
                    Verified Purchase
                  </Badge>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="p-0 hover:bg-transparent font-semibold text-gray-700 text-xs lg:text-sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const rating = row.getValue('rating') as number;
          return (
            <div className="flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-xs lg:text-sm text-gray-600">({rating})</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'comment',
        header: 'Review',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="text-xs lg:text-sm text-gray-700 line-clamp-2">
              {row.getValue('comment')}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'date',
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
            {formatDate(row.getValue('date'))}
          </span>
        ),
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'helpful',
        header: 'Helpful',
        cell: ({ row }) => {
          const helpful = row.getValue('helpful') as number;
          return helpful ? (
            <div className="hidden md:flex items-center gap-1 text-xs lg:text-sm text-gray-600">
              <ThumbsUp className="w-3 h-3" />
              <span>{helpful}</span>
            </div>
          ) : (
            <span className="hidden md:block text-xs lg:text-sm text-gray-400">-</span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: reviews,
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
    getRowId: (row) => row.id,
  });

  return (
    <div className="w-full mt-8 sm:mt-12 border-t border-gray-200 pt-6 sm:pt-8">
      {/* Section Header */}
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
      <div className="mb-6 sm:mb-8">
       

     

    
      </div>

      {/* Loading State */}
      {isLoading && <UserTableSkeleton />}

      {/* Empty State */}
      {!isLoading && table.getFilteredRowModel().rows.length === 0 && (
        <EmptyState
          title={globalFilter ? `No reviews found` : `No reviews yet!`}
          description={
            globalFilter
              ? `No results found for "${globalFilter}". Try adjusting your search.`
              : `Be the first to review this product.`
          }
          icon={<MessageSquare className="w-16 h-16 text-gray-300" />}
          className="min-h-[400px]"
        />
      )}

      {/* Reviews List */}
      {!isLoading && table.getFilteredRowModel().rows.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block md:hidden space-y-4">
            {table.getFilteredRowModel().rows.map((row) => {
              const review = row.original;
              return (
                <Card key={review.id} className="bg-white shadow-sm border-gray-200">
                  <CardContent className="p-4">
                    {/* User Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {review.user.avatar ? (
                            <AvatarImage src={review.user.avatar} alt={review.user.name} />
                          ) : null}
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {getInitials(review.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.user.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} />
                            {review.verified && (
                              <Badge className="px-1.5 py-0 text-[10px] bg-green-100 text-green-700">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-sm text-gray-700 mb-3">
                      {review.comment}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(review.date)}</span>
                      </div>
                      {review.helpful && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{review.helpful} helpful</span>
                        </div>
                      )}
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

          {/* View All Button */}
          {reviews.length > 10 && (
            <div className="mt-6 sm:mt-8 text-center">
              <Button
                variant="outline"
                className="px-6 sm:px-8 py-2 text-sm sm:text-base text-primary hover:text-primary/80 underline border-none shadow-none"
              >
                View all
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};